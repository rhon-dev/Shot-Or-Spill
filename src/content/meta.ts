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
  "couples",
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
  /** Short line for the deck tile (fits next to the card count on a 360px screen). */
  tagline: string;
  /** Selecting this deck triggers the adult opt-in (D-14). */
  adultOptIn: boolean;
  /** Launch target from PRD §6. */
  launchCount: number;
}

export const DECKS: Record<DeckId, DeckMeta> = {
  "warm-up": {
    id: "warm-up",
    name: "Warm Up",
    idPrefix: "warm",
    maxIntensity: 1,
    theme: "Light icebreakers, food, habits, childhood",
    tagline: "Icebreakers, food",
    adultOptIn: false,
    launchCount: 60,
  },
  "barkada-tea": {
    id: "barkada-tea",
    name: "Barkada Tea",
    idPrefix: "barkada",
    maxIntensity: 2,
    theme: "Friendships, group chat secrets, old crushes, betrayals",
    tagline: "Crushes, gossip",
    adultOptIn: false,
    launchCount: 70,
  },
  "love-life": {
    id: "love-life",
    name: "Love Life",
    idPrefix: "love",
    maxIntensity: 3,
    theme: "Exes, situationships, ghosting, the talking stage, jealousy",
    tagline: "Exes, ghosting",
    adultOptIn: false,
    launchCount: 70,
  },
  couples: {
    id: "couples",
    name: "Couples",
    idPrefix: "couples",
    maxIntensity: 3,
    theme: "For a couple or a table of pairs: partners, dates, guessing games, would-you-rathers",
    tagline: "For two, or pairs",
    adultOptIn: false,
    launchCount: 50,
  },
  "family-adulting": {
    id: "family-adulting",
    name: "Family & Adulting",
    idPrefix: "family",
    maxIntensity: 2,
    theme: "Titas, family pressure, work, money, salary",
    tagline: "Titas, money, work",
    adultOptIn: false,
    launchCount: 50,
  },
  "no-filter": {
    id: "no-filter",
    name: "No Filter",
    idPrefix: "nofilter",
    maxIntensity: 3,
    theme: "Bold adult questions, body count, regrets, confessions",
    tagline: "Regrets, secrets",
    adultOptIn: true,
    launchCount: 60,
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

/**
 * Question style, carried as a tag on every Spill or Shot and Double Down
 * card (content guide §6). Most questions in every deck are hypothetical or
 * generic, so anyone can answer them without a specific story (D-24).
 */
export const STYLE_TAGS = ["hypothetical", "generic", "personal"] as const;
export type StyleTag = (typeof STYLE_TAGS)[number];
/** Minimum share of hypothetical + generic questions per deck (D-24). */
export const MIN_EASY_SHARE = 0.6;

/** Target share of each type across the written deck (PRD §5). */
export const TYPE_MIX_TARGET: Record<CardType, number> = {
  spill_or_shot: 0.6,
  everyone_who: 0.15,
  most_likely: 0.1,
  hot_seat: 0.05,
  double_down: 0.05,
  water_break: 0.05,
};
