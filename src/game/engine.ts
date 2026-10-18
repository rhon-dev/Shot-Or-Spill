/**
 * Game rules as pure functions: state in, state out, no React
 * (ARCHITECTURE.md "Engine rules"). Randomness comes in through `rng`, so
 * tests can use a seeded generator.
 */
import { CARDS, getCard } from "../content/cards";
import type { Card, DeckId, Intensity } from "../content/meta";
import type {
  Award,
  Drawn,
  GameConfig,
  LogEntry,
  Outcome,
  Player,
  PlayerStats,
  Result,
  Rng,
  Session,
  SessionCore,
} from "./types";

export const TANGGERO_EVERY = 10; // F3
export const WATER_BREAK_MIN = 12; // F12, D-12
export const WATER_BREAK_MAX = 15;
export const MIN_ELIGIBLE = 10; // D-15
export const MIN_PLAYERS = 2; // F2
export const MAX_PLAYERS = 12;
export const HOT_SEAT_QUESTIONS = 3; // D-11

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function randomInt(min: number, max: number, rng: Rng): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Fisher–Yates. Returns a new array. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function pick<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) throw new Error("pick() from an empty list");
  return items[Math.floor(rng() * items.length)]!;
}

function core(session: Session): SessionCore {
  const { previous: _previous, ...rest } = session;
  return rest;
}

// ---------------------------------------------------------------------------
// Card pool (F5, F9, D-08, D-12)
// ---------------------------------------------------------------------------

/**
 * Cards a game can draw: in a selected deck, at or below the intensity
 * filter, not a Water Break (those are inserted by pacing), and {p2} cards
 * only with 3+ players.
 */
export function eligibleCards(
  decks: readonly DeckId[],
  intensity: Intensity,
  playerCount: number,
): Card[] {
  return CARDS.filter(
    (c) =>
      decks.includes(c.deck) &&
      c.intensity <= intensity &&
      c.type !== "water_break" &&
      (playerCount >= 3 || !c.text.includes("{p2}")),
  );
}

export function eligibleCount(
  decks: readonly DeckId[],
  intensity: Intensity,
  playerCount: number,
): number {
  return eligibleCards(decks, intensity, playerCount).length;
}

function waterBreakCards(decks: readonly DeckId[]): Card[] {
  const inDecks = CARDS.filter((c) => c.type === "water_break" && decks.includes(c.deck));
  return inDecks.length > 0 ? inDecks : CARDS.filter((c) => c.type === "water_break");
}

function buildQueue(config: GameConfig, playerCount: number, rng: Rng): string[] {
  return shuffle(
    eligibleCards(config.decks, config.intensity, playerCount).map((c) => c.id),
    rng,
  );
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

/**
 * Tanggero: the host picks who starts (seat 1 by default, never random,
 * D-23). The role moves to the next seat every 10 completed cards (F3,
 * D-13), and the host can hand it to anyone at any time with setTanggero.
 */
export function tanggeroIndex(s: SessionCore): number {
  const n = s.players.length;
  return (s.tanggeroStart + Math.floor(s.completed / TANGGERO_EVERY)) % n;
}

export function tanggero(s: SessionCore): Player {
  return s.players[tanggeroIndex(s)]!;
}

export function reader(s: SessionCore): Player {
  return s.players[s.readerIndex]!;
}

export function playerById(s: SessionCore, id: string): Player | undefined {
  return s.players.find((p) => p.id === id);
}

/** Who answers the current card: reader, the {p1} player, or null when the Tanggero picks (D-09). */
export function answerer(s: SessionCore): Player | null {
  const drawn = s.current;
  if (!drawn) return null;
  const card = getCard(drawn.cardId);
  if (card.target === "p1") return drawn.p1Id ? (playerById(s, drawn.p1Id) ?? null) : null;
  if (card.target === "current") return reader(s);
  return null;
}

/** Cards until the Tanggero changes, and until the next Water Break (scoreboard line). */
export function countdowns(s: SessionCore): { tanggero: number; waterBreak: number } {
  return {
    tanggero: TANGGERO_EVERY - (s.completed % TANGGERO_EVERY),
    waterBreak: Math.max(0, s.pacing.nextAt - s.pacing.sinceBreak),
  };
}

// ---------------------------------------------------------------------------
// Drawing (F8, F9, F12)
// ---------------------------------------------------------------------------

/**
 * Fill placeholders once, at draw time, so a refresh or re-render never
 * picks a new random player (F8, F15). {p1} and {p2} are two different
 * players, and neither is the reader.
 */
export function fillNames(
  card: Card,
  players: readonly Player[],
  readerIdx: number,
  tanggeroName: string,
  rng: Rng,
): Pick<Drawn, "text" | "p1Id" | "p2Id"> {
  const others = players.filter((_, i) => i !== readerIdx);
  const p1 = card.text.includes("{p1}") && others.length > 0 ? pick(others, rng) : null;
  const rest = others.filter((p) => p.id !== p1?.id);
  const p2 = card.text.includes("{p2}") && rest.length > 0 ? pick(rest, rng) : null;
  const text = renderText(card, p1?.name, p2?.name, tanggeroName);
  return { text, p1Id: p1?.id ?? null, p2Id: p2?.id ?? null };
}

function renderText(card: Card, p1Name: string | undefined, p2Name: string | undefined, tanggeroName: string): string {
  return card.text
    .replaceAll("{p1}", p1Name ?? "someone")
    .replaceAll("{p2}", p2Name ?? "someone")
    .replaceAll("{tanggero}", tanggeroName);
}

function drawCard(s: SessionCore, cardId: string, faceUp: boolean, rng: Rng): Drawn {
  const card = getCard(cardId);
  const names = fillNames(card, s.players, s.readerIndex, tanggero(s).name, rng);
  return { cardId, ...names, faceUp, handoff: s.handoff };
}

/** Put the next card on the table: a Water Break if one is due, else the top of the queue. */
function drawNext(s: SessionCore, rng: Rng, faceUp = false): SessionCore {
  if (s.pacing.sinceBreak >= s.pacing.nextAt) {
    // Water Breaks are for everyone, so they appear face up with no hand-off (D-12).
    const wb = pick(waterBreakCards(s.config.decks), rng);
    return { ...s, current: drawCard(s, wb.id, true, rng), exhausted: false };
  }
  const [next, ...queue] = s.queue;
  if (!next) return { ...s, queue: [], current: null, exhausted: true };
  return { ...s, queue, current: drawCard(s, next, faceUp, rng), exhausted: false };
}

// ---------------------------------------------------------------------------
// Session lifecycle
// ---------------------------------------------------------------------------

/**
 * Start a night. Players are seated in the order given (seat 1 reads
 * first), and `tanggeroId` is the host's pick for the first Tanggero.
 * Nothing about the seating is random; only the card order is shuffled.
 */
export function newSession(
  players: readonly Player[],
  config: GameConfig,
  rng: Rng = Math.random,
  now: number = Date.now(),
  tanggeroId: string | null = null,
): Session {
  if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
    throw new Error(`A game needs ${MIN_PLAYERS} to ${MAX_PLAYERS} players`);
  }
  const picked = players.findIndex((p) => p.id === tanggeroId);
  const base: SessionCore = {
    players: players.map((p) => ({ ...p })),
    config: { ...config, decks: [...config.decks] },
    queue: buildQueue(config, players.length, rng),
    current: null,
    exhausted: false,
    readerIndex: 0,
    completed: 0,
    tanggeroStart: Math.max(0, picked),
    pacing: { sinceBreak: 0, nextAt: randomInt(WATER_BREAK_MIN, WATER_BREAK_MAX, rng) },
    handoff: true,
    log: [],
    warned: [],
    pendingWarnings: [],
    startedAt: now,
  };
  return { ...drawNext(base, rng), previous: null };
}

/** Flip the face-down card (F7). */
export function flip(s: Session): Session {
  if (!s.current || s.current.faceUp) return s;
  return { ...s, current: { ...s.current, faceUp: true } };
}

/** Turn an outcome into per-player results, checking it fits the card (PRD §5 table). */
export function resultsFor(s: SessionCore, outcome: Outcome): Result[] {
  const drawn = s.current;
  if (!drawn) throw new Error("No card to resolve");
  const card = getCard(drawn.cardId);
  const valid = (id: string | undefined | null): id is string =>
    !!id && s.players.some((p) => p.id === id);

  switch (outcome.kind) {
    case "water":
      if (card.type !== "water_break") throw new Error(`"water" outcome on ${card.type}`);
      return [];

    case "group": {
      if (card.type !== "everyone_who" && card.type !== "most_likely") {
        throw new Error(`"group" outcome on ${card.type}`);
      }
      const ids = [...new Set(outcome.drinkerIds)].filter(valid);
      return ids.map((playerId) => ({ playerId, spills: 0, shots: 1, source: "group" as const }));
    }

    case "hotSeat": {
      if (card.type !== "hot_seat") throw new Error(`"hotSeat" outcome on ${card.type}`);
      const who = card.target === "p1" ? drawn.p1Id : reader(s).id;
      if (!valid(who)) throw new Error("Hot Seat has no player");
      const shots = Math.min(HOT_SEAT_QUESTIONS, Math.max(0, Math.round(outcome.shots)));
      return [{ playerId: who, spills: HOT_SEAT_QUESTIONS - shots, shots, source: "choice" }];
    }

    case "choice": {
      if (card.type !== "spill_or_shot" && card.type !== "double_down") {
        throw new Error(`"choice" outcome on ${card.type}`);
      }
      let who: string | null | undefined;
      if (card.target === "tanggero") who = outcome.answererId;
      else if (card.target === "p1") who = drawn.p1Id;
      else who = reader(s).id;
      if (!valid(who)) throw new Error("Choice has no answering player");
      return outcome.choice === "spill"
        ? [{ playerId: who, spills: 1, shots: 0, source: "choice" }]
        : [{ playerId: who, spills: 0, shots: card.shots, source: "choice" }];
    }
  }
}

function totalShots(log: readonly LogEntry[], playerId: string): number {
  let n = 0;
  for (const e of log) for (const r of e.results) if (r.playerId === playerId) n += r.shots;
  return n;
}

/**
 * Resolve the face-up card and move on (F6, F10, F12, F16).
 * - Water Break: logs nothing, resets pacing, keeps the turn.
 * - Every other card: saves an Undo snapshot, logs results, counts toward the
 *   Tanggero and pacing, passes the turn, and checks the soft cap.
 */
export function resolve(s: Session, outcome: Outcome, rng: Rng = Math.random): Session {
  const before = core(s);
  if (!before.current?.faceUp) throw new Error("Flip the card before resolving it");
  const card = getCard(before.current.cardId);
  const results = resultsFor(before, outcome);

  if (card.type === "water_break") {
    const next: SessionCore = {
      ...before,
      pacing: { sinceBreak: 0, nextAt: randomInt(WATER_BREAK_MIN, WATER_BREAK_MAX, rng) },
    };
    return { ...drawNext(next, rng), previous: s.previous };
  }

  const log = [...before.log, { cardId: card.id, readerId: reader(before).id, results }];
  const warned = [...before.warned];
  const pendingWarnings = [...before.pendingWarnings];
  for (const r of results) {
    if (r.shots > 0 && !warned.includes(r.playerId) && totalShots(log, r.playerId) >= before.config.softCap) {
      warned.push(r.playerId);
      pendingWarnings.push(r.playerId);
    }
  }

  const next: SessionCore = {
    ...before,
    log,
    warned,
    pendingWarnings,
    completed: before.completed + 1,
    pacing: { ...before.pacing, sinceBreak: before.pacing.sinceBreak + 1 },
    readerIndex: (before.readerIndex + 1) % before.players.length,
    handoff: true,
  };
  return { ...drawNext(next, rng), previous: before };
}

/**
 * Skip (F11, D-13): the same reader gets a new card, face up. Nothing is
 * logged, the skipped card is used up for this cycle, and nothing counts
 * toward the Tanggero or pacing.
 */
export function skip(s: Session, rng: Rng = Math.random): Session {
  const before = core(s);
  if (!before.current?.faceUp) return s;
  if (getCard(before.current.cardId).type === "water_break") return s;
  return { ...drawNext({ ...before, handoff: false }, rng, true), previous: s.previous };
}

/** Undo the last resolved card (F16). One level. */
export function undo(s: Session): Session {
  if (!s.previous) return s;
  return { ...s.previous, previous: null };
}

/** Shuffle the same decks again after every card was played (F9). */
export function reshuffle(s: Session, rng: Rng = Math.random): Session {
  const base: SessionCore = { ...core(s), queue: buildQueue(s.config, s.players.length, rng) };
  return { ...drawNext(base, rng), previous: s.previous };
}

/** Keep playing with different decks or intensity. Scores and turns carry over. */
export function changeConfig(s: Session, config: GameConfig, rng: Rng = Math.random): Session {
  const nextConfig = { ...config, decks: [...config.decks] };
  const base: SessionCore = {
    ...core(s),
    config: nextConfig,
    queue: buildQueue(nextConfig, s.players.length, rng),
  };
  // The card on the table may no longer be eligible, so draw fresh.
  return { ...drawNext({ ...base, current: null }, rng), previous: null };
}

/**
 * Change the seating order mid-night (the host re-sorts the circle). Same
 * players, new order: scores stay, and the same person keeps reading and
 * keeps the Tanggero role. Turns then continue around the new order.
 * Undo history is cleared, since the old snapshot has the old seating.
 */
export function reorderPlayers(s: Session, orderedIds: readonly string[]): Session {
  const ids = new Set(orderedIds);
  if (ids.size !== s.players.length || !s.players.every((p) => ids.has(p.id))) {
    throw new Error("reorderPlayers needs exactly the same players");
  }
  const players = orderedIds.map((id) => s.players.find((p) => p.id === id)!);
  const n = players.length;
  const readerId = reader(s).id;
  const tanggeroId = tanggero(s).id;
  const rotations = Math.floor(s.completed / TANGGERO_EVERY);
  const newTanggero = players.findIndex((p) => p.id === tanggeroId);
  return {
    ...s,
    players,
    readerIndex: players.findIndex((p) => p.id === readerId),
    tanggeroStart: (((newTanggero - rotations) % n) + n) % n,
    previous: null,
  };
}

/** tanggeroStart that makes `index` the Tanggero right now. */
function startFor(s: SessionCore, index: number): number {
  const n = s.players.length;
  const rotations = Math.floor(s.completed / TANGGERO_EVERY);
  return (((index - rotations) % n) + n) % n;
}

function withTanggero(s: SessionCore, id: string): SessionCore {
  const index = s.players.findIndex((p) => p.id === id);
  if (index < 0) return s;
  const next: SessionCore = { ...s, tanggeroStart: startFor(s, index) };
  const drawn = next.current;
  if (!drawn) return next;
  const card = getCard(drawn.cardId);
  if (!card.text.includes("{tanggero}")) return next;
  const text = renderText(
    card,
    drawn.p1Id ? playerById(next, drawn.p1Id)?.name : undefined,
    drawn.p2Id ? playerById(next, drawn.p2Id)?.name : undefined,
    tanggero(next).name,
  );
  return { ...next, current: { ...drawn, text } };
}

/**
 * The host hands the Tanggero role to someone (D-23). They keep it for the
 * rest of this round of 10 cards; then it moves to the next seat as usual.
 * The Undo snapshot gets the same pick, so Undo never brings back the old one.
 */
export function setTanggero(s: Session, id: string): Session {
  if (!playerById(s, id)) return s;
  return { ...withTanggero(core(s), id), previous: s.previous ? withTanggero(s.previous, id) : null };
}

/** Players in turn order starting from the current reader (for the "up next" strip). */
export function turnOrder(s: SessionCore): Player[] {
  const n = s.players.length;
  return Array.from({ length: n }, (_, i) => s.players[(s.readerIndex + i) % n]!);
}

export function setSoftCap(s: Session, softCap: number): Session {
  const cap = Math.max(1, Math.min(30, Math.round(softCap)));
  return { ...s, config: { ...s.config, softCap: cap } };
}

export function dismissWarning(s: Session): Session {
  return { ...s, pendingWarnings: s.pendingWarnings.slice(1) };
}

// ---------------------------------------------------------------------------
// Scores and recap (F13, F14, D-19)
// ---------------------------------------------------------------------------

export function stats(s: SessionCore): Map<string, PlayerStats> {
  const out = new Map<string, PlayerStats>(
    s.players.map((p) => [p.id, { spills: 0, shots: 0, choiceShots: 0, groupShots: 0, bigTea: 0 }]),
  );
  for (const entry of s.log) {
    const card = getCard(entry.cardId);
    const tea = card.intensity === 3 || card.type === "double_down";
    for (const r of entry.results) {
      const st = out.get(r.playerId);
      if (!st) continue;
      st.spills += r.spills;
      st.shots += r.shots;
      if (r.source === "choice") st.choiceShots += r.shots;
      else st.groupShots += r.shots;
      if (tea) st.bigTea += r.spills;
    }
  }
  return out;
}

/** Recap awards. Ties are shared; an award is hidden when nobody qualifies (D-19). */
export function awards(s: SessionCore): Award[] {
  const st = stats(s);
  const best = (
    id: Award["id"],
    title: string,
    unit: string,
    value: (p: PlayerStats) => number,
  ): Award | null => {
    let top = 0;
    let ids: string[] = [];
    for (const p of s.players) {
      const v = value(st.get(p.id)!);
      if (v > top) {
        top = v;
        ids = [p.id];
      } else if (v === top && v > 0) {
        ids.push(p.id);
      }
    }
    return top > 0 ? { id, title, playerIds: ids, value: top, unit } : null;
  };
  return [
    best("most-honest", "Most Honest", "spill", (p) => p.spills),
    best("most-secretive", "Most Secretive", "shot", (p) => p.choiceShots),
    best("biggest-tea", "Biggest Tea", "big spill", (p) => p.bigTea),
  ].filter((a): a is Award => a !== null);
}

export function totals(s: SessionCore): { cards: number; spills: number; shots: number } {
  let spills = 0;
  let shots = 0;
  for (const e of s.log) for (const r of e.results) {
    spills += r.spills;
    shots += r.shots;
  }
  return { cards: s.log.length, spills, shots };
}
