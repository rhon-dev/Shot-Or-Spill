/**
 * Design tokens for Shot or Spill (PRD §10, docs/DESIGN.md).
 *
 * This file is the single source of truth for color, type, spacing, and
 * motion. The Phase 2 mocks are generated from it (scripts/render-mocks.ts),
 * scripts/check-contrast.ts checks it, and the Phase 3 Tailwind config will
 * import it. It has no runtime dependencies.
 */
import type { DeckId } from "../content/meta";

export const color = {
  /** Near-black page background. */
  bg: "#0B0A10",
  /** Cards, sheets, inputs. */
  surface: "#17151F",
  /** Raised elements on a surface (chips, list rows). */
  surfaceRaised: "#221F2D",
  /** Hairline dividers. Decorative only, never the sole boundary of a control. */
  border: "#2E2A3D",
  /** Boundaries of inputs and unselected controls (≥ 3:1, WCAG 1.4.11). */
  borderStrong: "#726C88",
  text: "#F5F3FA",
  textMuted: "#ABA7BA",
  /** Text on the bright Spill / Shot / accent fills. */
  textOnBright: "#0B0A10",
  /** SPILL: answer honestly. */
  spill: "#FF2E88",
  /** SHOT: drink and keep the secret. */
  shot: "#FFB020",
  /** Teal accent: Tanggero badge, links, focus. */
  accent: "#22D3C5",
  /** Errors and the soft-cap warning icon. */
  danger: "#FF6B6B",
  disabledBg: "#2A2736",
  disabledText: "#8E8A9F",
  /** Focus ring, drawn 2px outside the focused element. */
  focus: "#FFFFFF",
  /** Scrim behind sheets and dialogs. */
  scrim: "rgba(5, 4, 8, 0.72)",
} as const;

/**
 * One accent per deck (PRD §10), spread around the hue wheel and away from
 * Spill pink and Shot amber. Color is never the only cue: every deck also
 * has a name and an icon.
 */
export const deckAccent: Record<DeckId, string> = {
  "warm-up": "#B6F24A", // lime
  "barkada-tea": "#22D3C5", // teal
  "love-life": "#C58BFF", // violet
  couples: "#FF9EB5", // rose
  "family-adulting": "#5CB8FF", // sky
  "no-filter": "#FF6A3D", // red-orange
  "our-cards": "#8FA0B6", // slate (the table's own deck)
};

export const font = {
  /** Chunky display face: titles, buttons, labels, wordmark. SIL OFL. */
  display: "Anton, Impact, 'Arial Narrow Bold', sans-serif",
  /** Clean sans: UI text and card questions. SIL OFL. ("Inter Variable" is the self-hosted file.) */
  sans: "'Inter Variable', Inter, 'Helvetica Neue', Arial, sans-serif",
} as const;

/** Type scale in px. Nothing essential goes below `small`. */
export const type = {
  wordmark: { family: "display", size: 52, lineHeight: 1 },
  title: { family: "display", size: 36, lineHeight: 1.05 },
  button: { family: "display", size: 30, lineHeight: 1 },
  label: { family: "display", size: 15, lineHeight: 1.2, letterSpacing: 1.2 },
  bodyLg: { family: "sans", size: 18, lineHeight: 1.45, weight: 600 },
  body: { family: "sans", size: 16, lineHeight: 1.45, weight: 500 },
  small: { family: "sans", size: 14, lineHeight: 1.4, weight: 500 },
} as const;

/**
 * Card question sizing (PRD §10: "card text auto-resizes for long
 * questions"). Measured on the text *after* placeholders are filled. Card
 * text is always sans 800 so long questions stay readable.
 */
export const cardText = {
  weight: 800,
  lineHeight: 1.22,
  steps: [
    { maxChars: 60, size: 30 },
    { maxChars: 90, size: 27 },
    { maxChars: 130, size: 24 },
    { maxChars: Infinity, size: 21 },
  ],
  minSize: 21,
} as const;

/**
 * Font size for a card question. `compact` is the shorter card shown when a
 * picker sits below it (Who drank?, Hot Seat, Tanggero pick): it drops one
 * step, never below minSize.
 */
export function cardTextSize(text: string, compact = false): number {
  const i = cardText.steps.findIndex((s) => text.length <= s.maxChars);
  const index = Math.min(
    (i === -1 ? cardText.steps.length - 1 : i) + (compact ? 1 : 0),
    cardText.steps.length - 1,
  );
  return Math.max(cardText.steps[index]!.size, cardText.minSize);
}

/** 4px base spacing. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  card: 24,
  pill: 999,
} as const;

export const layout = {
  /** Design baseline (PRD §10 budget Android); layouts stretch up to maxWidth. */
  baseWidth: 360,
  baseHeight: 800,
  maxWidth: 480,
  gutter: 20,
  /** Minimum tap target (PRD §10: 48px+). */
  tapTarget: 48,
  /** SPILL / SHOT height, in the bottom thumb zone. */
  choiceButtonHeight: 72,
  /** Longest player name accepted in setup, so cards never overflow. */
  playerNameMax: 16,
} as const;

/** Motion (F7: flip under 400 ms). Only transform and opacity animate. */
export const motion = {
  flipMs: 320,
  swipeOutMs: 200,
  sheetMs: 240,
  /** Reduced motion replaces the flip and swipe with a crossfade. */
  reducedFadeMs: 150,
  easeOut: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  /** Swipe left or right past this distance or speed to take the action. */
  swipeDistancePx: 80,
  swipeVelocityPxPerS: 500,
} as const;
