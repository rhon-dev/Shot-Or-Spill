/**
 * Anonymous, cookie-free analytics events (D-16).
 *
 * Off in v1 until Phase 5 picks Plausible or Umami. Events only ever carry
 * card id, deck, type, and choice: never player names or free text.
 */
import type { CardType, DeckId } from "../content/meta";

export type AnalyticsEvent =
  | { name: "session_start"; props: { players: number; decks: string; intensity: number } }
  | { name: "card_drawn"; props: { cardId: string; deck: DeckId; type: CardType } }
  | { name: "card_resolved"; props: { cardId: string; deck: DeckId; type: CardType; choice: "spill" | "shot" | "group" | "hot_seat" | "water" } }
  | { name: "card_skipped"; props: { cardId: string; deck: DeckId; type: CardType } }
  | { name: "session_end"; props: { cards: number } };

const enabled = import.meta.env.VITE_ANALYTICS === "on";

export function track(event: AnalyticsEvent): void {
  if (!enabled) return;
  // Phase 5: send to the chosen provider. Nothing leaves the device until then.
  if (import.meta.env.DEV) console.debug("[analytics]", event.name, event.props);
}
