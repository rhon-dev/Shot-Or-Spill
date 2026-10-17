import type { Card, DeckId } from "./meta";
import warmUp from "./decks/warm-up.json";
import barkadaTea from "./decks/barkada-tea.json";
import loveLife from "./decks/love-life.json";
import familyAdulting from "./decks/family-adulting.json";
import noFilter from "./decks/no-filter.json";

/**
 * Every card, bundled with the app (ARCHITECTURE.md: ~310 cards is small, no
 * fetch). The JSON is trusted here because `npm run build` validates every
 * card against the Zod schema first (scripts/validate-cards.ts).
 */
export const CARDS_BY_DECK: Record<DeckId, readonly Card[]> = {
  "warm-up": warmUp as Card[],
  "barkada-tea": barkadaTea as Card[],
  "love-life": loveLife as Card[],
  "family-adulting": familyAdulting as Card[],
  "no-filter": noFilter as Card[],
};

export const CARDS: readonly Card[] = Object.values(CARDS_BY_DECK).flat();

export const CARD_BY_ID: ReadonlyMap<string, Card> = new Map(CARDS.map((c) => [c.id, c]));

export function getCard(id: string): Card {
  const card = CARD_BY_ID.get(id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}
