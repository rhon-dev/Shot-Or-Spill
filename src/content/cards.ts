import type { BundledDeckId, Card } from "./meta";
import warmUp from "./decks/warm-up.json";
import barkadaTea from "./decks/barkada-tea.json";
import loveLife from "./decks/love-life.json";
import couples from "./decks/couples.json";
import familyAdulting from "./decks/family-adulting.json";
import noFilter from "./decks/no-filter.json";

/**
 * Every bundled card ships with the app (ARCHITECTURE.md: ~360 cards is
 * small, no fetch). The JSON is trusted here because `npm run build`
 * validates every card against the Zod schema first (scripts/validate-cards.ts).
 */
export const CARDS_BY_DECK: Record<BundledDeckId, readonly Card[]> = {
  "warm-up": warmUp as Card[],
  "barkada-tea": barkadaTea as Card[],
  "love-life": loveLife as Card[],
  couples: couples as Card[],
  "family-adulting": familyAdulting as Card[],
  "no-filter": noFilter as Card[],
};

const BUNDLED: readonly Card[] = Object.values(CARDS_BY_DECK).flat();

/**
 * Custom cards (F17, D-27) are written on the device and registered here at
 * store load, so they draw and look up exactly like bundled cards. `CARDS`
 * and `CARD_BY_ID` are reassigned when the custom set changes; engine.ts and
 * store.ts read them through live module bindings, so no call site changes.
 */
let custom: readonly Card[] = [];

// eslint-disable-next-line prefer-const -- reassigned by registerCustomCards via a live binding.
export let CARDS: readonly Card[] = BUNDLED;
// eslint-disable-next-line prefer-const
export let CARD_BY_ID: ReadonlyMap<string, Card> = new Map(BUNDLED.map((c) => [c.id, c]));

function rebuild() {
  CARDS = [...BUNDLED, ...custom];
  CARD_BY_ID = new Map(CARDS.map((c) => [c.id, c]));
}

/** Replace the registered custom cards (the store owns the source of truth). */
export function registerCustomCards(cards: readonly Card[]): void {
  custom = cards.map((c) => ({ ...c }));
  rebuild();
}

export function getCard(id: string): Card {
  const card = CARD_BY_ID.get(id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}
