/**
 * Deck and card metadata (PRD v0.3 §5, §6, §9).
 *
 * This file has no runtime dependencies, so the app can import it in Phase 3
 * without pulling Zod into the bundle (D-18). The Zod schema lives in
 * ./schema.ts and is only used by the build-time validator.
 */

export const DECK_IDS = [
  "warm-up",
  "barkada-tea",
  "love-life",
  "family-adulting",
  "no-filter",
] as const;
export type DeckId = (typeof DECK_IDS)[number];

export const CARD_TYPES = [
  "spill_or_shot",
  "everyone_who",
  "most_likely",
  "hot_seat",
  "double_down",
  "water_break",
] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CARD_TARGETS = ["current", "p1", "group", "tanggero"] as const;
export type CardTarget = (typeof CARD_TARGETS)[number];

/** Placeholders the engine fills at draw time (D-08). */
export const PLACEHOLDERS = ["p1", "p2", "tanggero"] as const;
export type Placeholder = (typeof PLACEHOLDERS)[number];

/** 1 = Chill, 2 = Spicy, 3 = No Filter. */
export type Intensity = 1 | 2 | 3;

export interface Card {
  id: string;
  deck: DeckId;
  type: CardType;
  intensity: Intensity;
  target: CardTarget;
  text: string;
  shots: 1 | 2;
  tags: string[];
}

export interface DeckMeta {
  id: DeckId;
  name: string;
  /** Card id prefix, e.g. "love" for "love-031". */
  idPrefix: string;
  /** Highest intensity a card in this deck may have (PRD §6). */
  maxIntensity: Intensity;
  theme: string;
  /** Selecting this deck triggers the adult opt-in (D-14). */
  adultOptIn: boolean;
  /** Launch target from PRD §6. */
  launchCount: number;
  /** Phase 1 target from docs/PHASES.md. */
  phase1Count: number;
}

export const DECKS: Record<DeckId, DeckMeta> = {
  "warm-up": {
    id: "warm-up",
    name: "Warm Up",
    idPrefix: "warm",
    maxIntensity: 1,
    theme: "Light icebreakers, food, habits, childhood",
    adultOptIn: false,
    launchCount: 60,
    phase1Count: 29,
  },
  "barkada-tea": {
    id: "barkada-tea",
    name: "Barkada Tea",
    idPrefix: "barkada",
    maxIntensity: 2,
    theme: "Friendships, group chat secrets, old crushes, betrayals",
    adultOptIn: false,
    launchCount: 70,
    phase1Count: 34,
  },
  "love-life": {
    id: "love-life",
    name: "Love Life",
    idPrefix: "love",
    maxIntensity: 3,
    theme: "Exes, situationships, ghosting, the talking stage, jealousy",
    adultOptIn: false,
    launchCount: 70,
    phase1Count: 34,
  },
  "family-adulting": {
    id: "family-adulting",
    name: "Family & Adulting",
    idPrefix: "family",
    maxIntensity: 2,
    theme: "Titas, family pressure, work, money, salary",
    adultOptIn: false,
    launchCount: 50,
    phase1Count: 24,
  },
  "no-filter": {
    id: "no-filter",
    name: "No Filter",
    idPrefix: "nofilter",
    maxIntensity: 3,
    theme: "Bold adult questions, body count, regrets, confessions",
    adultOptIn: true,
    launchCount: 60,
    phase1Count: 29,
  },
};

/** Which targets each card type may use (content guide §5). */
export const ALLOWED_TARGETS: Record<CardType, readonly CardTarget[]> = {
  spill_or_shot: ["current", "p1", "tanggero"],
  double_down: ["current", "p1", "tanggero"],
  hot_seat: ["current", "p1"],
  everyone_who: ["group"],
  most_likely: ["group"],
  water_break: ["group"],
};

/** Target share of each type across the written deck (PRD §5). */
export const TYPE_MIX_TARGET: Record<CardType, number> = {
  spill_or_shot: 0.6,
  everyone_who: 0.15,
  most_likely: 0.1,
  hot_seat: 0.05,
  double_down: 0.05,
  water_break: 0.05,
};
