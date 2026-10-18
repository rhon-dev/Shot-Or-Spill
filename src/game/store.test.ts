import { describe, expect, it } from "vitest";
import type { StateStorage } from "zustand/middleware";
import { getCard } from "../content/cards";
import {
  AGE_GATE_DAYS,
  createAppStore,
  effectiveScreen,
  isAgeValid,
  nameError,
  needsAdultOk,
  sanitize,
  STORAGE_KEY,
} from "./store";
import { tanggeroIndex } from "./engine";
import type { Outcome, Session } from "./types";

function memoryStorage(): StateStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

function outcomeFor(session: Session): Outcome {
  const card = getCard(session.current!.cardId);
  if (card.type === "water_break") return { kind: "water" };
  if (card.type === "everyone_who" || card.type === "most_likely") return { kind: "group", drinkerIds: [session.players[0]!.id] };
  if (card.type === "hot_seat") return { kind: "hotSeat", shots: 1 };
  if (card.target === "tanggero") return { kind: "choice", choice: "shot", answererId: session.players[1]!.id };
  return { kind: "choice", choice: "shot" };
}

function readyStore(storage = memoryStorage(), now = () => 1_000_000) {
  const store = createAppStore(storage, now);
  const s = store.getState();
  s.confirmAge();
  expect(s.addPlayer("Juan")).toBeNull();
  expect(s.addPlayer("Maria")).toBeNull();
  expect(s.addPlayer("Bea")).toBeNull();
  return { store, storage };
}

describe("age gate (F1)", () => {
  it("is remembered for 30 days", () => {
    const day = 24 * 60 * 60 * 1000;
    expect(isAgeValid(null)).toBe(false);
    expect(isAgeValid(0, (AGE_GATE_DAYS - 1) * day)).toBe(true);
    expect(isAgeValid(0, AGE_GATE_DAYS * day)).toBe(false);
  });

  it("sends an expired visitor back to the gate, even mid-game", () => {
    const base = { players: [], session: null, screen: "game" as const };
    expect(effectiveScreen({ ...base, ageConfirmedAt: null })).toBe("age");
    expect(effectiveScreen({ ...base, ageConfirmedAt: Date.now() })).toBe("players");
  });
});

describe("player setup (F2)", () => {
  it("rejects empty, too-long, and duplicate names (case-insensitive)", () => {
    const players = [{ id: "a", name: "Juan" }];
    expect(nameError("   ", players)).toMatch(/name/);
    expect(nameError("x".repeat(17), players)).toMatch(/16/);
    expect(nameError(" juan ", players)).toMatch(/already/);
    expect(nameError("Juan", players, "a")).toBeNull();
    expect(nameError("Ana  Marie", players)).toBeNull();
  });

  it("adds, renames, and removes players, up to 12", () => {
    const store = createAppStore(memoryStorage());
    const s = store.getState();
    for (let i = 0; i < 12; i++) expect(s.addPlayer(`P${i}`)).toBeNull();
    expect(s.addPlayer("One more")).toMatch(/12/);
    const first = store.getState().players[0]!;
    expect(s.renamePlayer(first.id, "P1")).toMatch(/already/);
    expect(s.renamePlayer(first.id, "  Kuya   Jun ")).toBeNull();
    expect(store.getState().players[0]!.name).toBe("Kuya Jun");
    s.removePlayer(first.id);
    expect(store.getState().players).toHaveLength(11);
  });
  it("puts a player in a seat number without shuffling anyone else (D-23)", () => {
    const store = createAppStore(memoryStorage());
    const s = store.getState();
    for (const n of ["A", "B", "C", "D"]) s.addPlayer(n);
    const id = (n: string) => store.getState().players.find((p) => p.name === n)!.id;
    s.setSeat(id("D"), 1);
    expect(store.getState().players.map((p) => p.name)).toEqual(["D", "A", "B", "C"]);
    s.setSeat(id("A"), 4);
    expect(store.getState().players.map((p) => p.name)).toEqual(["D", "B", "C", "A"]);
    s.setSeat(id("B"), 9);
    expect(store.getState().players.map((p) => p.name)).toEqual(["D", "B", "C", "A"]);
  });
  it("starts the night with the picked Tanggero and changes it mid-night (D-23)", () => {
    const store = createAppStore(memoryStorage(), () => 1_000_000);
    const s = store.getState();
    s.confirmAge();
    for (const n of ["A", "B", "C"]) s.addPlayer(n);
    const [a, b, c] = store.getState().players;
    s.setTanggero(b!.id);
    s.startNight();
    let session = store.getState().session!;
    expect(session.players[tanggeroIndex(session)]!.id).toBe(b!.id);
    expect(session.players[session.readerIndex]!.id).toBe(a!.id);
    s.setTanggero(c!.id);
    session = store.getState().session!;
    expect(session.players[tanggeroIndex(session)]!.id).toBe(c!.id);
    s.removePlayer(c!.id);
    expect(store.getState().tanggeroId).toBeNull();
  });
});

describe("deck select (F4, F5, D-14, D-15)", () => {
  it("flags the No Filter deck and the No Filter intensity for the adult opt-in", () => {
    expect(needsAdultOk({ deck: "no-filter" })).toBe(true);
    expect(needsAdultOk({ intensity: 3 })).toBe(true);
    expect(needsAdultOk({ deck: "love-life", intensity: 2 })).toBe(false);
  });

  it("won't start below 10 eligible cards", () => {
    const { store } = readyStore();
    const s = store.getState();
    s.toggleDeck("warm-up");
    s.toggleDeck("barkada-tea");
    s.toggleDeck("no-filter");
    s.setIntensity(1);
    s.startNight();
    expect(store.getState().session).toBeNull();
  });

  it("keeps decks in canonical order when toggled", () => {
    const store = createAppStore(memoryStorage());
    store.getState().toggleDeck("no-filter");
    store.getState().toggleDeck("love-life");
    expect(store.getState().decks).toEqual(["warm-up", "barkada-tea", "love-life", "no-filter"]);
  });
});

describe("flow", () => {
  it("shows How to Play once, then goes straight to the game", () => {
    const { store } = readyStore();
    store.getState().startNight();
    expect(store.getState().screen).toBe("howto");
    store.getState().finishHowTo();
    expect(store.getState().screen).toBe("game");
    store.getState().endNight();
    store.getState().playAgain();
    expect(store.getState().screen).toBe("game");
    store.getState().changeDecks();
    store.getState().startNight();
    expect(store.getState().screen).toBe("game");
  });

  it("lets the host sort the seating, and turns follow it", () => {
    const { store } = readyStore();
    const s = store.getState();
    const [juan, maria, bea] = store.getState().players;
    s.movePlayer(bea!.id, -1);
    expect(store.getState().players.map((p) => p.name)).toEqual(["Juan", "Bea", "Maria"]);
    s.movePlayer(juan!.id, -1); // already first: no-op
    s.setPlayerOrder([maria!.id, juan!.id, bea!.id]);
    expect(store.getState().players.map((p) => p.name)).toEqual(["Maria", "Juan", "Bea"]);
    s.setPlayerOrder([maria!.id]); // wrong roster: ignored
    expect(store.getState().players).toHaveLength(3);

    s.startNight();
    s.finishHowTo();
    const firstReader = store.getState().session!.players[store.getState().session!.readerIndex]!;
    expect(firstReader.name).toBe("Maria");
  });

  it("re-sorting mid-night keeps scores; changing who plays starts fresh", () => {
    const { store } = readyStore();
    const s = store.getState();
    s.startNight();
    s.finishHowTo();
    for (let i = 0; i < 3; i++) {
      s.flip();
      s.resolve(outcomeFor(store.getState().session!));
    }
    const log = store.getState().session!.log;
    const ids = store.getState().players.map((p) => p.id);
    s.setPlayerOrder([ids[2]!, ids[0]!, ids[1]!]);
    expect(s.applySeating()).toBe(true);
    expect(store.getState().session!.log).toEqual(log);
    expect(store.getState().session!.players.map((p) => p.id)).toEqual([ids[2], ids[0], ids[1]]);

    s.addPlayer("Carlo");
    expect(s.applySeating()).toBe(false);
    s.startNight();
    expect(store.getState().session!.log).toEqual([]);
  });

  it("changing decks mid-night keeps the scores", () => {
    const { store } = readyStore();
    const s = store.getState();
    s.startNight();
    s.finishHowTo();
    s.flip();
    s.resolve(outcomeFor(store.getState().session!));
    const log = store.getState().session!.log;
    s.changeDecks();
    s.toggleDeck("family-adulting");
    s.startNight();
    expect(store.getState().session!.log).toEqual(log);
  });
});

describe("persistence (F15)", () => {
  it("restores players, the card on the table, turn, and scores after a reload", () => {
    const storage = memoryStorage();
    const { store } = readyStore(storage);
    const s = store.getState();
    s.startNight();
    s.finishHowTo();
    for (let i = 0; i < 5; i++) {
      s.flip();
      s.resolve(outcomeFor(store.getState().session!));
    }
    s.flip();
    const before = store.getState();
    expect(storage.data.has(STORAGE_KEY)).toBe(true);

    const reloaded = createAppStore(storage, () => 1_000_000).getState();
    expect(reloaded.players).toEqual(before.players);
    expect(reloaded.screen).toBe("game");
    expect(reloaded.session).toEqual(before.session);
    expect(reloaded.session!.current!.text).toBe(before.session!.current!.text);
  });

  it("drops a saved session that references cards no longer in the build, keeping players", () => {
    const storage = memoryStorage();
    const { store } = readyStore(storage);
    store.getState().startNight();
    const saved = JSON.parse(storage.data.get(STORAGE_KEY)!);
    saved.state.session.queue.push("gone-999");
    storage.data.set(STORAGE_KEY, JSON.stringify(saved));

    const reloaded = createAppStore(storage).getState();
    expect(reloaded.session).toBeNull();
    expect(reloaded.players.map((p) => p.name)).toEqual(["Juan", "Maria", "Bea"]);
  });

  it("survives corrupt or partial saved data", () => {
    const clean = sanitize({ decks: ["nope" as never], intensity: 7 as never, softCap: Number.NaN, players: [null as never] });
    expect(clean.decks).toEqual(["warm-up", "barkada-tea"]);
    expect(clean.intensity).toBe(2);
    expect(clean.softCap).toBe(6);
    expect(clean.players).toEqual([]);

    const storage = memoryStorage();
    storage.data.set(STORAGE_KEY, "{not json");
    expect(() => createAppStore(storage).getState()).not.toThrow();
  });

  it("keeps players but drops the session when the saved version is unknown", () => {
    const storage = memoryStorage();
    storage.data.set(
      STORAGE_KEY,
      JSON.stringify({ version: 0, state: { players: [{ id: "x", name: "Old" }], session: { bogus: true }, screen: "game" } }),
    );
    const s = createAppStore(storage).getState();
    expect(s.players).toEqual([{ id: "x", name: "Old" }]);
    expect(s.session).toBeNull();
  });

  it("never stores the under-18 screen", () => {
    const storage = memoryStorage();
    const store = createAppStore(storage);
    store.getState().declareUnder18();
    expect(store.getState().screen).toBe("under18");
    expect(JSON.parse(storage.data.get(STORAGE_KEY)!).state.screen).toBe("age");
  });

  it("keeps favorites, reports, and feedback settings across a reload (D-25, D-26)", () => {
    const storage = memoryStorage();
    const store = createAppStore(storage);
    const s = store.getState();
    s.toggleFavorite("warm-001");
    s.toggleReport("warm-002");
    s.setSound(false);
    s.setHaptics(false);
    const reloaded = createAppStore(storage).getState();
    expect(reloaded.favorites).toEqual(["warm-001"]);
    expect(reloaded.reports).toEqual(["warm-002"]);
    expect(reloaded.sound).toBe(false);
    expect(reloaded.haptics).toBe(false);
  });

  it("drops unknown or duplicate card ids from favorites and reports", () => {
    const clean = sanitize({ favorites: ["warm-001", "warm-001", "gone-999", 3 as never], reports: ["nope-000"] });
    expect(clean.favorites).toEqual(["warm-001"]);
    expect(clean.reports).toEqual([]);
    expect(clean.sound).toBe(true);
    expect(clean.haptics).toBe(true);
  });
});

describe("favorite and report (D-25)", () => {
  it("toggles favorites and reports, ignoring unknown cards", () => {
    const store = createAppStore(memoryStorage());
    const s = store.getState();
    s.toggleFavorite("warm-001");
    expect(store.getState().favorites).toEqual(["warm-001"]);
    s.toggleFavorite("warm-001");
    expect(store.getState().favorites).toEqual([]);
    s.toggleReport("warm-002");
    expect(store.getState().reports).toEqual(["warm-002"]);
    s.toggleFavorite("nope-999");
    s.toggleReport("nope-999");
    expect(store.getState().favorites).toEqual([]);
    expect(store.getState().reports).toEqual(["warm-002"]);
  });
});
