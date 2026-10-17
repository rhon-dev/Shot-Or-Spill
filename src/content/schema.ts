import { z } from "zod";
import {
  ALLOWED_TARGETS,
  CARD_TARGETS,
  CARD_TYPES,
  DECK_IDS,
  DECKS,
  PLACEHOLDERS,
  type Card,
} from "./meta";

/**
 * Card schema (PRD v0.3 §9 + D-08, D-12). Build-time only: used by
 * scripts/validate-cards.ts, never imported by the app.
 *
 * Each rule below maps to a line in docs/content-guide.md.
 */

const PLACEHOLDER_RE = /\{([^{}]*)\}/g;

/** Placeholder names used in a card's text, e.g. ["p1", "tanggero"]. */
export function placeholdersIn(text: string): string[] {
  return [...text.matchAll(PLACEHOLDER_RE)].map((m) => m[1] ?? "");
}

const ID_PREFIXES = Object.values(DECKS).map((d) => d.idPrefix);
const ID_RE = new RegExp(`^(${ID_PREFIXES.join("|")})-\\d{3}$`);

export const CardSchema = z
  .strictObject({
    id: z
      .string()
      .regex(ID_RE, "id must be a deck prefix plus 3 digits, e.g. love-031"),
    deck: z.enum(DECK_IDS),
    type: z.enum(CARD_TYPES),
    intensity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    target: z.enum(CARD_TARGETS),
    text: z
      .string()
      .min(15, "text is too short")
      .max(200, "text is over 200 characters; shorten it for the table"),
    shots: z.union([z.literal(1), z.literal(2)]),
    tags: z
      .array(
        z
          .string()
          .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "tags are lowercase-kebab-case"),
      )
      .min(1, "add at least one tag")
      .max(4, "use at most 4 tags"),
  })
  .superRefine((card, ctx) => {
    const issue = (path: keyof Card, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    const text = card.text;
    const lower = text.toLowerCase();
    const used = placeholdersIn(text);

    // Id prefix matches the deck.
    const prefix = DECKS[card.deck].idPrefix;
    if (!card.id.startsWith(`${prefix}-`)) {
      issue("id", `id prefix must be "${prefix}-" for deck ${card.deck}`);
    }

    // Intensity ceiling per deck (PRD §6).
    const ceiling = DECKS[card.deck].maxIntensity;
    if (card.intensity > ceiling) {
      issue(
        "intensity",
        `intensity ${card.intensity} is above the ${DECKS[card.deck].name} ceiling (${ceiling})`,
      );
    }

    // Placeholders (D-08).
    for (const name of used) {
      if (!(PLACEHOLDERS as readonly string[]).includes(name)) {
        issue("text", `unknown placeholder {${name}}; use {p1}, {p2}, or {tanggero}`);
      }
    }
    const hasP1 = used.includes("p1");
    const hasP2 = used.includes("p2");
    if (hasP1 && card.target !== "p1") {
      issue("target", 'cards that use {p1} must set target "p1"');
    }
    if (card.target === "p1" && !hasP1) {
      issue("text", 'target "p1" cards must name the player with {p1}');
    }
    if (hasP2 && !hasP1) {
      issue("text", "{p2} can only be used together with {p1}");
    }
    if (card.target === "tanggero" && !lower.includes("tanggero")) {
      issue("text", 'target "tanggero" cards must mention the Tanggero');
    }

    // Targets allowed per type.
    const allowed = ALLOWED_TARGETS[card.type];
    if (!allowed.includes(card.target)) {
      issue(
        "target",
        `${card.type} cards can target: ${allowed.join(", ")} (got "${card.target}")`,
      );
    }

    // Shots (PRD §9): 2 only on Double Down, and Double Down is always 2.
    if (card.type === "double_down" && card.shots !== 2) {
      issue("shots", "double_down cards must have shots: 2");
    }
    if (card.type !== "double_down" && card.shots !== 1) {
      issue("shots", "only double_down cards may have shots: 2");
    }

    // Water Break (D-12): always eligible, group-wide, clearly labeled.
    if (card.type === "water_break") {
      if (card.intensity !== 1) {
        issue("intensity", "water_break cards are intensity 1 so they show under any filter");
      }
      if (!text.startsWith("Water Break.")) {
        issue("text", 'water_break text starts with "Water Break."');
      }
    }

    // Type wording, so players can tell the mechanic from the text alone.
    if (card.type === "everyone_who" && !lower.includes("everyone who")) {
      issue("text", 'everyone_who text must include "Everyone who"');
    }
    if (card.type === "most_likely" && !lower.includes("most likely")) {
      issue("text", 'most_likely text must include "Most likely"');
    }
    if (card.type === "hot_seat" && !lower.includes("hot seat")) {
      issue("text", 'hot_seat text must include "Hot Seat"');
    }
  });

export const DeckFileSchema = z.array(CardSchema);

// Compile-time check that the schema and the Card interface agree.
type SchemaCard = z.infer<typeof CardSchema>;
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export const schemaMatchesCard: Same<SchemaCard, Card> = true;
