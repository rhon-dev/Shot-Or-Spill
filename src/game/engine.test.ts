import { describe, expect, it } from "vitest";
import { CARDS, getCard } from "../content/cards";
import type { CardType } from "../content/meta";
import {
  awards,
  changeConfig,
  countdowns,
  dismissWarning,
  eligibleCards,
  fillNames,
  flip,
  newSession,
  reader,
  reshuffle,
  resolve,
  skip,
  stats,
  tanggeroIndex,
  undo,
  WATER_BREAK_MAX,
  WATER_BREAK_MIN,
} from "./engine";
import type { GameConfig, Outcome, Player, Session } from "./types";

/** Deterministic RNG (mulberry32) so failures are reproducible. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const players = (n: number): Player[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Player ${i}` }));

const ALL_DECKS: GameConfig["decks"] = ["warm-up", "barkada-tea", "love-life", "family-adulting", "no-filter"];
const config = (over: Partial<GameConfig> = {}): GameConfig => ({
  decks: ALL_DECKS,
  intensity: 3,
  softCap: 6,
  ...over,
});

/** Put a specific card face up for the current reader, as a draw would. */
function withCard(s: Session, cardId: string, rng = seeded(99)): Session {
  const card = getCard(cardId);
  const names = fillNames(card, s.players, s.readerIndex, s.players[tanggeroIndex(s)]!.name, rng);
  return { ...s, current: { cardId, ...names, faceUp: true, handoff: true } };
}

const firstOf = (type: CardType, target?: string) =>
  CARDS.find((c) => c.type === type && (!target || c.target === target))!.id;

/** A sensible default resolution for whatever card is face up. */
function autoOutcome(s: Session): Outcome {
  const card = getCard(s.current!.cardId);
  switch (card.type) {
    case "water_break":
      return { kind: "water" };
    case "everyone_who":
    case "most_likely":
      return { kind: "group", drinkerIds: [] };
    case "hot_seat":
      return { kind: "hotSeat", shots: 0 };
    default:
      return card.target === "tanggero"
        ? { kind: "choice", choice: "spill", answererId: s.players[0]!.id }
        : { kind: "choice", choice: "spill" };
  }
}

function playOne(s: Session, rng: () => number): Session {
  return resolve(flip(s), autoOutcome(flip(s)), rng);
}

describe("card pool", () => {
  it("never includes cards above the intensity filter or outside the selected decks (F5)", () => {
    for (const intensity of [1, 2, 3] as const) {
      const pool = eligibleCards(["barkada-tea", "love-life"], intensity, 5);
      expect(pool.length).toBeGreaterThan(0);
      for (const c of pool) {
        expect(c.intensity).toBeLessThanOrEqual(intensity);
        expect(["barkada-tea", "love-life"]).toContain(c.deck);
      }
    }
  });

  it("leaves Water Breaks out of the shuffled deck (D-12)", () => {
    expect(eligibleCards(ALL_DECKS, 3, 5).some((c) => c.type === "water_break")).toBe(false);
  });

  it("only includes {p2} cards with 3 or more players (D-08)", () => {
    expect(eligibleCards(ALL_DECKS, 3, 2).some((c) => c.text.includes("{p2}"))).toBe(false);
    expect(eligibleCards(ALL_DECKS, 3, 3).some((c) => c.text.includes("{p2}"))).toBe(true);
  });
});

describe("drawing and shuffle", () => {
  it("draws every eligible card exactly once before asking to reshuffle (F9)", () => {
    const rng = seeded(1);
    let s = newSession(players(4), config({ decks: ["warm-up", "barkada-tea"], intensity: 2 }), rng);
    const expected = eligibleCards(["warm-up", "barkada-tea"], 2, 4).map((c) => c.id).sort();
    const seen: string[] = [];
    for (let i = 0; i < 500 && !s.exhausted; i++) {
      const card = getCard(s.current!.cardId);
      if (card.type !== "water_break") seen.push(card.id);
      s = i % 3 === 0 && card.type !== "water_break" ? skip(flip(s), rng) : playOne(s, rng);
    }
    expect(s.exhausted).toBe(true);
    expect(s.current).toBeNull();
    expect(seen.slice().sort()).toEqual(expected);
    expect(new Set(seen).size).toBe(seen.length);

    s = reshuffle(s, rng);
    expect(s.exhausted).toBe(false);
    expect(s.current).not.toBeNull();
  });

  it("fills {p1} and {p2} with two different players, never the reader (F8)", () => {
    const p2Card = CARDS.find((c) => c.text.includes("{p2}"))!;
    const ps = players(3);
    for (let seed = 0; seed < 200; seed++) {
      const readerIdx = seed % 3;
      const out = fillNames(p2Card, ps, readerIdx, "Tita", seeded(seed));
      expect(out.p1Id).not.toBeNull();
      expect(out.p2Id).not.toBeNull();
      expect(out.p1Id).not.toBe(out.p2Id);
      expect(out.p1Id).not.toBe(ps[readerIdx]!.id);
      expect(out.p2Id).not.toBe(ps[readerIdx]!.id);
      expect(out.text).not.toMatch(/[{}]/);
    }
  });

  it("fills {tanggero} with the current Tanggero", () => {
    const card = CARDS.find((c) => c.text.includes("{tanggero}"))!;
    expect(fillNames(card, players(3), 0, "Maria", seeded(1)).text).toContain("Maria");
  });

  it("resolves names once per draw, so flipping doesn't change them (F8, F15)", () => {
    const s = newSession(players(5), config(), seeded(3));
    expect(flip(s).current!.text).toBe(s.current!.text);
  });

  it("starts face down and needs a flip before resolving (F7)", () => {
    const s = newSession(players(3), config(), seeded(4));
    expect(s.current!.faceUp).toBe(false);
    expect(() => resolve(s, autoOutcome(s))).toThrow();
  });
});

describe("turns, Tanggero, and skips", () => {
  it("passes the turn after each completed card (F6)", () => {
    const rng = seeded(5);
    let s = newSession(players(3), config({ intensity: 1, decks: ["warm-up"] }), rng);
    s = { ...s, pacing: { sinceBreak: 0, nextAt: 99 } };
    expect(s.readerIndex).toBe(0);
    s = playOne(s, rng);
    expect(s.readerIndex).toBe(1);
    s = playOne(s, rng);
    s = playOne(s, rng);
    expect(s.readerIndex).toBe(0);
  });

  it("rotates the Tanggero every 10 completed cards, ignoring skips (F3, D-13)", () => {
    const rng = seeded(6);
    let s = newSession(players(4), config(), rng);
    s = { ...s, pacing: { sinceBreak: 0, nextAt: 99 } };
    const start = tanggeroIndex(s);
    for (let i = 0; i < 9; i++) s = playOne(s, rng);
    for (let i = 0; i < 5; i++) s = skip(flip(s), rng);
    expect(s.completed).toBe(9);
    expect(tanggeroIndex(s)).toBe(start);
    s = playOne(s, rng);
    expect(tanggeroIndex(s)).toBe((start + 1) % 4);
    expect(countdowns(s).tanggero).toBe(10);
  });

  it("skip keeps the same reader, logs nothing, and draws face up (F11, D-13)", () => {
    const rng = seeded(7);
    let s = flip(newSession(players(3), config(), rng));
    const before = { reader: s.readerIndex, log: s.log.length, completed: s.completed, card: s.current!.cardId };
    s = skip(s, rng);
    expect(s.readerIndex).toBe(before.reader);
    expect(s.log.length).toBe(before.log);
    expect(s.completed).toBe(before.completed);
    expect(s.current!.cardId).not.toBe(before.card);
    expect(s.current!.faceUp).toBe(true);
  });
});

describe("pacing (F12, D-12)", () => {
  it("inserts a Water Break after 12 to 15 completed cards, then resets", () => {
    for (let seed = 0; seed < 20; seed++) {
      const rng = seeded(seed);
      let s = newSession(players(3), config(), rng);
      expect(s.pacing.nextAt).toBeGreaterThanOrEqual(WATER_BREAK_MIN);
      expect(s.pacing.nextAt).toBeLessThanOrEqual(WATER_BREAK_MAX);
      let played = 0;
      while (getCard(s.current!.cardId).type !== "water_break") {
        s = playOne(s, rng);
        played++;
      }
      expect(played).toBeGreaterThanOrEqual(WATER_BREAK_MIN);
      expect(played).toBeLessThanOrEqual(WATER_BREAK_MAX);
      expect(s.current!.faceUp).toBe(true);

      const before = { reader: s.readerIndex, completed: s.completed, log: s.log.length };
      s = resolve(s, { kind: "water" }, rng);
      expect(s.readerIndex).toBe(before.reader);
      expect(s.completed).toBe(before.completed);
      expect(s.log.length).toBe(before.log);
      expect(s.pacing.sinceBreak).toBe(0);
    }
  });

  it("can't skip a Water Break", () => {
    const s = withCard(newSession(players(3), config(), seeded(8)), firstOf("water_break"));
    expect(skip(s)).toBe(s);
  });
});

describe("logging by card type (F10, D-09, D-10, D-11)", () => {
  const base = () => {
    const s = newSession(players(4), config(), seeded(9));
    return { ...s, pacing: { sinceBreak: 0, nextAt: 99 } };
  };

  it("Spill or Shot on a 'current' card logs to the reader", () => {
    const s = withCard(base(), firstOf("spill_or_shot", "current"));
    const out = resolve(s, { kind: "choice", choice: "shot" });
    expect(out.log.at(-1)!.results).toEqual([{ playerId: reader(s).id, spills: 0, shots: 1, source: "choice" }]);
  });

  it("a {p1} card logs to the named player, not the reader", () => {
    const s = withCard(base(), firstOf("spill_or_shot", "p1"));
    const p1 = s.current!.p1Id!;
    expect(p1).not.toBe(reader(s).id);
    const out = resolve(s, { kind: "choice", choice: "spill" });
    expect(out.log.at(-1)!.results).toEqual([{ playerId: p1, spills: 1, shots: 0, source: "choice" }]);
  });

  it("a Tanggero card logs to the picked player and requires a pick", () => {
    const s = withCard(base(), firstOf("spill_or_shot", "tanggero"));
    expect(() => resolve(s, { kind: "choice", choice: "spill" })).toThrow();
    const out = resolve(s, { kind: "choice", choice: "spill", answererId: "p3" });
    expect(out.log.at(-1)!.results[0]!.playerId).toBe("p3");
  });

  it("Double Down costs 2 shots", () => {
    const s = withCard(base(), firstOf("double_down"));
    const out = resolve(s, { kind: "choice", choice: "shot" });
    expect(out.log.at(-1)!.results[0]!.shots).toBe(2);
  });

  it("group cards log 1 group shot for each player tapped", () => {
    const s = withCard(base(), firstOf("everyone_who"));
    const out = resolve(s, { kind: "group", drinkerIds: ["p1", "p2", "p2", "nobody"] });
    expect(out.log.at(-1)!.results).toEqual([
      { playerId: "p1", spills: 0, shots: 1, source: "group" },
      { playerId: "p2", spills: 0, shots: 1, source: "group" },
    ]);
  });

  it("Hot Seat logs the shots taken and a spill for each answered question", () => {
    const s = withCard(base(), firstOf("hot_seat", "p1"));
    const out = resolve(s, { kind: "hotSeat", shots: 1 });
    expect(out.log.at(-1)!.results).toEqual([
      { playerId: s.current!.p1Id!, spills: 2, shots: 1, source: "choice" },
    ]);
    const clamped = resolve(s, { kind: "hotSeat", shots: 9 });
    expect(clamped.log.at(-1)!.results[0]).toMatchObject({ spills: 0, shots: 3 });
  });

  it("rejects an outcome that doesn't fit the card", () => {
    const s = withCard(base(), firstOf("everyone_who"));
    expect(() => resolve(s, { kind: "choice", choice: "spill" })).toThrow();
  });
});

describe("soft cap (F12)", () => {
  it("warns once when a player reaches the cap, including from group cards", () => {
    let s: Session = { ...newSession(players(3), config({ softCap: 2 }), seeded(10)), pacing: { sinceBreak: 0, nextAt: 99 } };
    const group = firstOf("everyone_who");
    s = resolve(withCard(s, group), { kind: "group", drinkerIds: ["p0", "p1"] });
    expect(s.pendingWarnings).toEqual([]);
    s = resolve(withCard(s, group), { kind: "group", drinkerIds: ["p0", "p1"] });
    expect(s.pendingWarnings).toEqual(["p0", "p1"]);
    s = dismissWarning(s);
    expect(s.pendingWarnings).toEqual(["p1"]);
    s = dismissWarning(s);
    s = resolve(withCard(s, group), { kind: "group", drinkerIds: ["p0"] });
    expect(s.pendingWarnings).toEqual([]);
  });

  it("can warn again after Undo drops the player back under the cap", () => {
    let s: Session = { ...newSession(players(3), config({ softCap: 1 }), seeded(11)), pacing: { sinceBreak: 0, nextAt: 99 } };
    s = resolve(withCard(s, firstOf("everyone_who")), { kind: "group", drinkerIds: ["p2"] });
    expect(s.warned).toContain("p2");
    s = undo(s);
    expect(s.warned).not.toContain("p2");
    s = resolve(s, { kind: "group", drinkerIds: ["p2"] });
    expect(s.pendingWarnings).toEqual(["p2"]);
  });
});

describe("undo (F16)", () => {
  it("restores scores, turn, Tanggero counters, pacing, and the card", () => {
    const rng = seeded(12);
    let s = newSession(players(3), config(), rng);
    for (let i = 0; i < 4; i++) s = playOne(s, rng);
    const snapshot = flip(s);
    s = resolve(snapshot, autoOutcome(snapshot), rng);
    const back = undo(s);
    const { previous: _a, ...restored } = back;
    const { previous: _b, ...expected } = snapshot;
    expect(restored).toEqual(expected);
    expect(back.previous).toBeNull();
    expect(undo(back)).toBe(back);
  });

  it("undoes across a Water Break to the card before it", () => {
    const rng = seeded(13);
    let s = newSession(players(3), config(), rng);
    let last = s;
    while (getCard(s.current!.cardId).type !== "water_break") {
      last = flip(s);
      s = playOne(s, rng);
    }
    s = resolve(s, { kind: "water" }, rng);
    expect(undo(s).current!.cardId).toBe(last.current!.cardId);
    expect(undo(s).log.length).toBe(last.log.length);
  });
});

describe("scores and awards (F13, F14, D-19)", () => {
  it("computes stats and awards, sharing ties and hiding empty awards", () => {
    let s: Session = { ...newSession(players(3), config(), seeded(14)), pacing: { sinceBreak: 0, nextAt: 99 } };
    // p0 and p1 tie on spills; p2 drinks on group cards only.
    const current = firstOf("spill_or_shot", "current");
    s = resolve(withCard({ ...s, readerIndex: 0 }, current), { kind: "choice", choice: "spill" });
    s = resolve(withCard({ ...s, readerIndex: 1 }, current), { kind: "choice", choice: "spill" });
    s = resolve(withCard(s, firstOf("everyone_who")), { kind: "group", drinkerIds: ["p2"] });

    const st = stats(s);
    expect(st.get("p2")).toMatchObject({ shots: 1, groupShots: 1, choiceShots: 0 });
    const a = awards(s);
    expect(a.find((x) => x.id === "most-honest")!.playerIds.sort()).toEqual(["p0", "p1"]);
    // Group shots don't count as secretive, and nobody spilled on big-tea cards.
    expect(a.find((x) => x.id === "most-secretive")).toBeUndefined();
    expect(a.find((x) => x.id === "biggest-tea")).toBeUndefined();
  });

  it("Biggest Tea counts spills on intensity-3 and Double Down cards", () => {
    let s: Session = { ...newSession(players(2), config(), seeded(15)), pacing: { sinceBreak: 0, nextAt: 99 } };
    const dd = CARDS.find((c) => c.type === "double_down" && c.target === "current")!.id;
    s = resolve(withCard({ ...s, readerIndex: 1 }, dd), { kind: "choice", choice: "spill" });
    expect(awards(s).find((x) => x.id === "biggest-tea")).toMatchObject({ playerIds: ["p1"], value: 1 });
  });
});

describe("changing decks mid-night", () => {
  it("keeps the log and players but rebuilds the deck", () => {
    const rng = seeded(16);
    let s = newSession(players(3), config({ decks: ["warm-up"], intensity: 1 }), rng);
    s = playOne(s, rng);
    const next = changeConfig(s, config({ decks: ["love-life"], intensity: 2 }), rng);
    expect(next.log).toEqual(s.log);
    expect(getCard(next.current!.cardId).deck).toBe("love-life");
    expect(next.previous).toBeNull();
  });
});
