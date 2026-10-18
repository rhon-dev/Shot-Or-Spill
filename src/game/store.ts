/**
 * App state: setup, the running session, and preferences, persisted to
 * localStorage so a refresh never loses the night (F15).
 *
 * Game rules live in ./engine.ts. This store only wires them to the UI,
 * validates setup input, and keeps saved state safe to load.
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { CARD_BY_ID, getCard } from "../content/cards";
import { DECK_IDS, DECKS, type DeckId, type Intensity } from "../content/meta";
import { layout } from "../design/tokens";
import { track } from "../lib/analytics";
import * as engine from "./engine";
import type { GameConfig, Outcome, Player, Session } from "./types";

export type Screen = "age" | "under18" | "players" | "decks" | "howto" | "game" | "recap";

export const AGE_GATE_DAYS = 30; // F1
const AGE_GATE_MS = AGE_GATE_DAYS * 24 * 60 * 60 * 1000;
export const DEFAULT_SOFT_CAP = 6; // F12
export const STORAGE_KEY = "shot-or-spill";
export const STORAGE_VERSION = 1;

export interface AppData {
  ageConfirmedAt: number | null;
  howToPlaySeen: boolean;
  /** null follows the OS setting; true/false is the in-app override. */
  reducedMotion: boolean | null;
  /** Seating order: index 0 is seat 1, who reads first. Never shuffled. */
  players: Player[];
  /** The host's pick for the first Tanggero. null means seat 1 (D-23). */
  tanggeroId: string | null;
  decks: DeckId[];
  intensity: Intensity;
  softCap: number;
  /** The table confirmed it's okay with adult questions (D-14). */
  adultOk: boolean;
  screen: Screen;
  session: Session | null;
}

export interface AppActions {
  confirmAge: () => void;
  declareUnder18: () => void;
  go: (screen: Screen) => void;

  addPlayer: (name: string) => string | null;
  renamePlayer: (id: string, name: string) => string | null;
  removePlayer: (id: string) => void;
  /** Move a player one seat up (-1) or down (+1). Turns follow this order. */
  movePlayer: (id: string, delta: -1 | 1) => void;
  /** Set the whole seating order at once (drag to reorder). */
  setPlayerOrder: (ids: string[]) => void;
  /** Put a player in a seat number, 1 to the number of players. */
  setSeat: (id: string, seat: number) => void;
  /** Pick the Tanggero. Mid-night, it takes effect on the running game right away. */
  setTanggero: (id: string) => void;
  /** Mid-night: apply a re-sorted seating to the running game. False if the roster changed. */
  applySeating: () => boolean;

  toggleDeck: (id: DeckId) => void;
  setIntensity: (intensity: Intensity) => void;
  confirmAdult: () => void;

  startNight: () => void;
  finishHowTo: () => void;

  flip: () => void;
  resolve: (outcome: Outcome) => void;
  skip: () => void;
  undo: () => void;
  reshuffle: () => void;
  dismissWarning: () => void;
  setSoftCap: (value: number) => void;
  setReducedMotion: (value: boolean) => void;

  endNight: () => void;
  playAgain: () => void;
  newPlayers: () => void;
  changeDecks: () => void;
}

export type AppState = AppData & AppActions;

export const initialData: AppData = {
  ageConfirmedAt: null,
  howToPlaySeen: false,
  reducedMotion: null,
  players: [],
  tanggeroId: null,
  decks: ["warm-up", "barkada-tea"],
  intensity: 2,
  softCap: DEFAULT_SOFT_CAP,
  adultOk: false,
  screen: "age",
  session: null,
};

// ---------------------------------------------------------------------------
// Pure helpers (exported for the UI and tests)
// ---------------------------------------------------------------------------

export function isAgeValid(confirmedAt: number | null, now = Date.now()): boolean {
  return confirmedAt !== null && now - confirmedAt >= 0 && now - confirmedAt < AGE_GATE_MS;
}

/** Choosing this needs the adult confirmation (D-14). */
export function needsAdultOk(choice: { deck?: DeckId; intensity?: Intensity }): boolean {
  return (choice.deck !== undefined && DECKS[choice.deck].adultOptIn) || choice.intensity === 3;
}

/** Same people, ignoring order. */
export function sameRoster(a: readonly Player[], b: readonly Player[]): boolean {
  return a.length === b.length && a.every((p) => b.some((q) => q.id === p.id));
}

export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/** Returns an error message, or null when the name is fine (F2). */
export function nameError(raw: string, players: readonly Player[], exceptId?: string): string | null {
  const name = cleanName(raw);
  if (!name) return "Type a name first.";
  if (name.length > layout.playerNameMax) return `Keep it to ${layout.playerNameMax} characters.`;
  const taken = players.some((p) => p.id !== exceptId && p.name.toLowerCase() === name.toLowerCase());
  return taken ? "That name is already in." : null;
}

let idCounter = 0;
function newId(): string {
  idCounter += 1;
  return `p${Date.now().toString(36)}${idCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** The screen to actually show, after the age gate and session checks. */
export function effectiveScreen(s: Pick<AppData, "ageConfirmedAt" | "screen" | "session" | "players">, now = Date.now()): Screen {
  if (s.screen === "under18") return "under18";
  if (!isAgeValid(s.ageConfirmedAt, now)) return "age";
  if (s.screen === "age") return "players";
  if ((s.screen === "game" || s.screen === "recap") && !s.session) return s.players.length >= 2 ? "decks" : "players";
  return s.screen;
}

function sessionIsLoadable(session: Session): boolean {
  const known = (id: string) => CARD_BY_ID.has(id);
  return (
    session.players.length >= engine.MIN_PLAYERS &&
    session.queue.every(known) &&
    (!session.current || known(session.current.cardId)) &&
    session.log.every((e) => known(e.cardId)) &&
    (!session.previous ||
      ((!session.previous.current || known(session.previous.current.cardId)) &&
        session.previous.queue.every(known) &&
        session.previous.log.every((e) => known(e.cardId))))
  );
}

/**
 * Make saved state safe to use: unknown decks dropped, values clamped, and a
 * session that references cards no longer in the build discarded (players
 * are kept). Runs on every load.
 */
export function sanitize(saved: Partial<AppData> | undefined): AppData {
  const s = { ...initialData, ...(saved ?? {}) };
  const decks = (Array.isArray(s.decks) ? s.decks : []).filter((d): d is DeckId => (DECK_IDS as readonly string[]).includes(d));
  const players = (Array.isArray(s.players) ? s.players : [])
    .filter((p): p is Player => !!p && typeof p.id === "string" && typeof p.name === "string")
    .slice(0, engine.MAX_PLAYERS);
  const intensity: Intensity = s.intensity === 1 || s.intensity === 3 ? s.intensity : 2;
  const tanggeroId = typeof s.tanggeroId === "string" && players.some((p) => p.id === s.tanggeroId) ? s.tanggeroId : null;
  let session = s.session ?? null;
  try {
    if (session && !sessionIsLoadable(session)) session = null;
  } catch {
    session = null;
  }
  return {
    ...s,
    decks: decks.length > 0 ? decks : initialData.decks,
    players,
    tanggeroId,
    intensity,
    softCap: Number.isFinite(s.softCap) ? Math.max(1, Math.min(30, Math.round(s.softCap))) : DEFAULT_SOFT_CAP,
    session,
    screen: s.screen === "under18" ? "age" : s.screen,
  };
}

function trackDrawn(session: Session | null) {
  const cur = session?.current;
  if (!cur) return;
  const card = getCard(cur.cardId);
  track({ name: "card_drawn", props: { cardId: card.id, deck: card.deck, type: card.type } });
}

function choiceLabel(outcome: Outcome): "spill" | "shot" | "group" | "hot_seat" | "water" {
  if (outcome.kind === "choice") return outcome.choice;
  if (outcome.kind === "hotSeat") return "hot_seat";
  return outcome.kind;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export function createAppStore(storage?: StateStorage, now: () => number = Date.now) {
  return create<AppState>()(
    persist(
      (set, get) => {
        /** Apply an engine step to the running session. */
        const step = (fn: (s: Session) => Session) => {
          const session = get().session;
          if (!session) return;
          set({ session: fn(session) });
        };

        const config = (): GameConfig => {
          const { decks, intensity, softCap } = get();
          return { decks: [...decks], intensity, softCap };
        };

        return {
          ...initialData,

          confirmAge: () => set({ ageConfirmedAt: now(), screen: "players" }),
          declareUnder18: () => set({ screen: "under18" }),
          go: (screen) => set({ screen }),

          addPlayer: (raw) => {
            const { players } = get();
            if (players.length >= engine.MAX_PLAYERS) return `That's the max of ${engine.MAX_PLAYERS} players.`;
            const error = nameError(raw, players);
            if (error) return error;
            set({ players: [...players, { id: newId(), name: cleanName(raw) }] });
            return null;
          },

          renamePlayer: (id, raw) => {
            const { players } = get();
            const error = nameError(raw, players, id);
            if (error) return error;
            set({ players: players.map((p) => (p.id === id ? { ...p, name: cleanName(raw) } : p)) });
            return null;
          },

          removePlayer: (id) => {
            const { players, tanggeroId } = get();
            set({ players: players.filter((p) => p.id !== id), tanggeroId: tanggeroId === id ? null : tanggeroId });
          },

          movePlayer: (id, delta) => {
            const players = [...get().players];
            const from = players.findIndex((p) => p.id === id);
            const to = from + delta;
            if (from < 0 || to < 0 || to >= players.length) return;
            const [moved] = players.splice(from, 1);
            players.splice(to, 0, moved!);
            set({ players });
          },

          setPlayerOrder: (ids) => {
            const { players } = get();
            if (ids.length !== players.length || !players.every((p) => ids.includes(p.id))) return;
            set({ players: ids.map((id) => players.find((p) => p.id === id)!) });
          },

          setSeat: (id, seat) => {
            const players = [...get().players];
            const from = players.findIndex((p) => p.id === id);
            const to = Math.round(seat) - 1;
            if (from < 0 || to < 0 || to >= players.length || to === from) return;
            const [moved] = players.splice(from, 1);
            players.splice(to, 0, moved!);
            set({ players });
          },

          setTanggero: (id) => {
            const { players, session, tanggeroId } = get();
            const inSetup = players.some((p) => p.id === id);
            const inGame = !!session && session.players.some((p) => p.id === id);
            if (!inSetup && !inGame) return;
            set({
              tanggeroId: inSetup ? id : tanggeroId,
              ...(inGame ? { session: engine.setTanggero(session!, id) } : {}),
            });
          },

          applySeating: () => {
            const { session, players } = get();
            if (!session || !sameRoster(session.players, players)) return false;
            set({ session: engine.reorderPlayers(session, players.map((p) => p.id)), screen: "game" });
            return true;
          },

          toggleDeck: (id) => {
            const { decks } = get();
            set({ decks: decks.includes(id) ? decks.filter((d) => d !== id) : DECK_IDS.filter((d) => d === id || decks.includes(d)) });
          },

          setIntensity: (intensity) => set({ intensity }),
          confirmAdult: () => set({ adultOk: true }),

          startNight: () => {
            const state = get();
            const cfg = config();
            const players = state.players;
            if (engine.eligibleCount(cfg.decks, cfg.intensity, players.length) < engine.MIN_ELIGIBLE) return;
            // Same players (in any order) keep the night's scores; new players start fresh.
            const continuing = !!state.session && sameRoster(state.session.players, players);
            const session = continuing
              ? engine.changeConfig(engine.reorderPlayers(state.session!, players.map((p) => p.id)), cfg)
              : engine.newSession(players, cfg, Math.random, now(), state.tanggeroId);
            if (!continuing) {
              track({ name: "session_start", props: { players: players.length, decks: cfg.decks.join(","), intensity: cfg.intensity } });
            }
            set({ session, screen: state.howToPlaySeen ? "game" : "howto" });
            trackDrawn(session);
          },

          finishHowTo: () => set({ howToPlaySeen: true, screen: get().session ? "game" : "decks" }),

          flip: () => step(engine.flip),

          resolve: (outcome) => {
            const before = get().session;
            if (!before?.current) return;
            const card = getCard(before.current.cardId);
            step((s) => engine.resolve(s, outcome));
            track({ name: "card_resolved", props: { cardId: card.id, deck: card.deck, type: card.type, choice: choiceLabel(outcome) } });
            trackDrawn(get().session);
          },

          skip: () => {
            const before = get().session;
            if (!before?.current) return;
            const card = getCard(before.current.cardId);
            step((s) => engine.skip(s));
            if (get().session?.current?.cardId !== card.id) {
              track({ name: "card_skipped", props: { cardId: card.id, deck: card.deck, type: card.type } });
              trackDrawn(get().session);
            }
          },

          undo: () => step(engine.undo),
          reshuffle: () => {
            step((s) => engine.reshuffle(s));
            trackDrawn(get().session);
          },
          dismissWarning: () => step(engine.dismissWarning),

          setSoftCap: (value) => {
            const softCap = Math.max(1, Math.min(30, Math.round(value)));
            set({ softCap });
            step((s) => engine.setSoftCap(s, softCap));
          },

          setReducedMotion: (value) => set({ reducedMotion: value }),

          endNight: () => {
            const s = get().session;
            if (s) track({ name: "session_end", props: { cards: s.log.length } });
            set({ screen: "recap" });
          },

          playAgain: () => {
            const { players, tanggeroId } = get();
            const cfg = config();
            if (players.length < engine.MIN_PLAYERS) return set({ screen: "players" });
            if (engine.eligibleCount(cfg.decks, cfg.intensity, players.length) < engine.MIN_ELIGIBLE) {
              return set({ session: null, screen: "decks" });
            }
            const session = engine.newSession(players, cfg, Math.random, now(), tanggeroId);
            track({ name: "session_start", props: { players: players.length, decks: cfg.decks.join(","), intensity: cfg.intensity } });
            set({ session, screen: "game" });
            trackDrawn(session);
          },

          newPlayers: () => set({ session: null, screen: "players" }),
          changeDecks: () => set({ screen: "decks" }),
        };
      },
      {
        name: STORAGE_KEY,
        version: STORAGE_VERSION,
        storage: createJSONStorage(() => storage ?? localStorage),
        partialize: (s): AppData => ({
          ageConfirmedAt: s.ageConfirmedAt,
          howToPlaySeen: s.howToPlaySeen,
          reducedMotion: s.reducedMotion,
          players: s.players,
          tanggeroId: s.tanggeroId,
          decks: s.decks,
          intensity: s.intensity,
          softCap: s.softCap,
          adultOk: s.adultOk,
          screen: s.screen === "under18" ? "age" : s.screen,
          session: s.session,
        }),
        // Unknown older versions: keep the roster and preferences, drop the session.
        migrate: (persisted, version) => {
          const p = (persisted ?? {}) as Partial<AppData>;
          if (version === STORAGE_VERSION) return p as AppData;
          return sanitize({ players: p.players, ageConfirmedAt: p.ageConfirmedAt, reducedMotion: p.reducedMotion });
        },
        merge: (persisted, current) => ({ ...current, ...sanitize(persisted as Partial<AppData>) }),
      },
    ),
  );
}

export type AppStore = ReturnType<typeof createAppStore>;
