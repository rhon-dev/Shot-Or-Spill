/**
 * WCAG 2.2 contrast check for the design tokens.
 *
 *   npm run check:contrast
 *
 * Every color pair the designs use is listed here with the AA threshold that
 * applies to it. The run fails if any required pair is below threshold.
 *
 * This checks color math only. Full WCAG conformance also needs manual
 * testing with assistive technologies (planned for Phase 5).
 */
import { DECK_IDS, DECKS } from "../src/content/meta";
import { color, deckAccent } from "../src/design/tokens";

type Kind = "text" | "large-text" | "ui" | "info";

/** AA thresholds: 1.4.3 (text), 1.4.3 large text, 1.4.11 (UI components). */
const MIN: Record<Kind, number> = {
  text: 4.5,
  "large-text": 3,
  ui: 3,
  info: 0,
};

interface Pair {
  fg: string;
  bg: string;
  kind: Kind;
  use: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Not a 6-digit hex color: ${hex}`);
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

const surfaces = [
  ["bg", color.bg],
  ["surface", color.surface],
  ["surfaceRaised", color.surfaceRaised],
] as const;

const pairs: Pair[] = [];

for (const [name, bg] of surfaces) {
  pairs.push({ fg: color.text, bg, kind: "text", use: `body text on ${name}` });
  pairs.push({ fg: color.textMuted, bg, kind: "text", use: `muted text on ${name}` });
  pairs.push({ fg: color.accent, bg, kind: "text", use: `accent text and links on ${name}` });
  pairs.push({ fg: color.spill, bg, kind: "text", use: `Spill-colored text on ${name}` });
  pairs.push({ fg: color.shot, bg, kind: "text", use: `Shot-colored text on ${name}` });
  pairs.push({ fg: color.danger, bg, kind: "text", use: `error text on ${name}` });
  pairs.push({ fg: color.borderStrong, bg, kind: "ui", use: `input and control borders on ${name}` });
  pairs.push({ fg: color.focus, bg, kind: "ui", use: `focus ring on ${name}` });
}

for (const [name, fill] of [
  ["spill", color.spill],
  ["shot", color.shot],
  ["accent", color.accent],
] as const) {
  pairs.push({ fg: color.textOnBright, bg: fill, kind: "text", use: `label text on ${name} fill` });
  pairs.push({ fg: fill, bg: color.bg, kind: "ui", use: `${name} button against the page` });
}

for (const id of DECK_IDS) {
  const accent = deckAccent[id];
  const name = DECKS[id].name;
  pairs.push({ fg: accent, bg: color.bg, kind: "text", use: `${name} accent text on bg` });
  pairs.push({ fg: accent, bg: color.surface, kind: "text", use: `${name} accent text on surface` });
  pairs.push({ fg: color.textOnBright, bg: accent, kind: "text", use: `text on ${name} accent chip` });
}

// Disabled controls are exempt from 1.4.3; reported for information only.
pairs.push({
  fg: color.disabledText,
  bg: color.disabledBg,
  kind: "info",
  use: "disabled button label (exempt)",
});

let failures = 0;
const rows = pairs.map((p) => {
  const ratio = contrast(p.fg, p.bg);
  const min = MIN[p.kind];
  const ok = ratio >= min;
  if (!ok) failures++;
  const status = p.kind === "info" ? "info" : ok ? "pass" : "FAIL";
  return `${status.padEnd(5)} ${ratio.toFixed(2).padStart(5)}:1  (min ${min ? min.toFixed(1) : " - "})  ${p.fg} on ${p.bg}  ${p.use}`;
});

console.log("WCAG AA contrast check");
console.log(rows.join("\n"));
if (failures > 0) {
  console.error(`\nFAILED: ${failures} of ${pairs.length} pairs below threshold.`);
  process.exit(1);
}
console.log(`\nPASSED: ${pairs.length} pairs checked, 0 below threshold.`);
