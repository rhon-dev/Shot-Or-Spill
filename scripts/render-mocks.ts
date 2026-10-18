/**
 * Generates the Phase 2 design mocks from the design tokens (D-20).
 *
 *   npm run mocks
 *
 * Output: docs/design/brand/*.svg and docs/design/mocks/*.svg.
 *
 * - Colors, sizes, and motion come from src/design/tokens.ts, so the mocks
 *   and the Phase 3 build share one source of truth.
 * - Card text comes from the real deck files, sized with cardTextSize(), so
 *   the mocks show real cards at real sizes.
 * - Fonts: the SVGs ask for Anton and Inter and fall back to Impact and
 *   Helvetica/Arial when those aren't installed. Text wrapping here is an
 *   estimate; Phase 3 lays text out with the real fonts.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DECK_IDS,
  DECKS,
  type Card,
  type CardType,
  type DeckId,
  type Intensity,
} from "../src/content/meta";
import {
  cardText,
  cardTextSize,
  color,
  deckAccent,
  font,
  layout,
  radius,
} from "../src/design/tokens";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MOCKS_DIR = join(ROOT, "docs", "design", "mocks");
const BRAND_DIR = join(ROOT, "docs", "design", "brand");

const ALL_CARDS: Card[] = DECK_IDS.flatMap(
  (id) =>
    JSON.parse(
      readFileSync(join(ROOT, "src", "content", "decks", `${id}.json`), "utf8"),
    ) as Card[],
);

function cardById(id: string): Card {
  const card = ALL_CARDS.find((c) => c.id === id);
  if (!card) throw new Error(`Card ${id} not found`);
  return card;
}

/** Cards a game would draw (F5, D-12): selected decks, at or under the intensity, no Water Breaks. */
function eligible(decks: DeckId[], intensity: Intensity): number {
  return ALL_CARDS.filter(
    (c) =>
      decks.includes(c.deck) &&
      c.intensity <= intensity &&
      c.type !== "water_break",
  ).length;
}

// ---------------------------------------------------------------------------
// Sample table used in every mock
// ---------------------------------------------------------------------------

const PLAYERS = ["Juan", "Maria", "Bea", "Carlo", "Jessa"];
const TANGGERO = "Maria";
const SAMPLE_DECKS: DeckId[] = ["warm-up", "barkada-tea", "love-life"];
const SAMPLE_INTENSITY: Intensity = 2;
const SAMPLE_POOL = eligible(SAMPLE_DECKS, SAMPLE_INTENSITY);

function fillNames(text: string): string {
  return text
    .replaceAll("{p1}", "Bea")
    .replaceAll("{p2}", "Carlo")
    .replaceAll("{tanggero}", TANGGERO);
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

const W = layout.baseWidth;
const H = layout.baseHeight;
const G = layout.gutter;
const CW = W - 2 * G;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface TextOpts {
  size: number;
  family?: "display" | "sans";
  weight?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  ls?: number;
}

function text(x: number, y: number, s: string, o: TextOpts): string {
  const cls = o.family === "display" ? "d" : "s";
  const attrs = [
    `x="${x}"`,
    `y="${y}"`,
    `class="${cls}"`,
    `font-size="${o.size}"`,
    o.weight ? `font-weight="${o.weight}"` : "",
    `fill="${o.fill ?? color.text}"`,
    o.anchor && o.anchor !== "start" ? `text-anchor="${o.anchor}"` : "",
    o.ls ? `letter-spacing="${o.ls}"` : "",
  ].filter(Boolean);
  return `<text ${attrs.join(" ")}>${esc(s)}</text>`;
}

/** Average glyph width as a share of font size, for wrapping estimates. */
function charFactor(o: TextOpts): number {
  if (o.family === "display") return 0.5;
  // Slightly wider than the Helvetica fallback, so wrapping stays safe with Inter.
  return (o.weight ?? 400) >= 700 ? 0.56 : 0.5;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function estWidth(s: string, o: TextOpts): number {
  return s.length * o.size * charFactor(o);
}

function wrap(s: string, maxW: number, o: TextOpts): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of s.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && estWidth(next, o) > maxW) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function truncate(s: string, maxW: number, o: TextOpts): string {
  if (estWidth(s, o) <= maxW) return s;
  let out = s;
  while (out.length > 1 && estWidth(`${out}…`, o) > maxW) out = out.slice(0, -1);
  return `${out.trimEnd()}…`;
}

/** Wrapped paragraph. `y` is the first baseline. Returns the block height. */
function para(
  x: number,
  y: number,
  s: string,
  maxW: number,
  o: TextOpts & { lh?: number },
): { svg: string; height: number } {
  const lines = wrap(s, maxW, o);
  const lh = o.size * (o.lh ?? 1.4);
  return {
    svg: lines.map((l, i) => text(x, y + i * lh, l, o)).join(""),
    height: lines.length * lh,
  };
}

interface BoxOpts {
  fill?: string;
  stroke?: string;
  sw?: number;
  r?: number;
  dash?: string;
  filter?: string;
}

function box(x: number, y: number, w: number, h: number, b: BoxOpts = {}): string {
  const attrs = [
    `x="${x}"`,
    `y="${y}"`,
    `width="${w}"`,
    `height="${h}"`,
    `rx="${b.r ?? 0}"`,
    `fill="${b.fill ?? "none"}"`,
    b.stroke ? `stroke="${b.stroke}" stroke-width="${b.sw ?? 1}"` : "",
    b.dash ? `stroke-dasharray="${b.dash}"` : "",
    b.filter ? `filter="url(#${b.filter})"` : "",
  ].filter(Boolean);
  return `<rect ${attrs.join(" ")}/>`;
}

// ---------------------------------------------------------------------------
// Icons (20-unit grid)
// ---------------------------------------------------------------------------

const ICONS = {
  back: "M13 4 L7 10 L13 16",
  skip: "M4 4 L10 10 L4 16 M11 4 L17 10 L11 16",
  undo: "M7 4 L3 8 L7 12 M3 8 H12 A5 5 0 0 1 12 18 H8",
  scores: "M4 17 V11 M10 17 V4 M16 17 V8",
  close: "M5 5 L15 15 M15 5 L5 15",
  edit: "M4 16 L5 12 L13 4 L16 7 L8 15 Z",
  check: "M4 10.5 L8.5 15 L16 6",
  plus: "M10 4 V16 M4 10 H16",
  minus: "M4 10 H16",
  shuffle:
    "M2 6 H6 L14 14 H18 M2 14 H6 L14 6 H18 M15.5 3.5 L18 6 L15.5 8.5 M15.5 11.5 L18 14 L15.5 16.5",
} as const;
type IconName = keyof typeof ICONS;

function icon(name: IconName, x: number, y: number, stroke: string, size = 20): string {
  return `<path d="${ICONS[name]}" transform="translate(${x} ${y}) scale(${size / 20})" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
}

/** Tagay (shot) glass: wide top, narrow thick base, amber pour. */
function shotGlass(cx: number, cy: number, h: number, liquid: string = color.shot): string {
  const top = cy - h / 2;
  const bottom = cy + h / 2;
  const topHalf = h * 0.42;
  const botHalf = h * 0.28;
  const halfAt = (y: number) => topHalf - (topHalf - botHalf) * ((y - top) / h);
  const level = top + h * 0.34;
  const baseTop = bottom - h * 0.16;
  const sw = Math.max(1.5, h / 16);
  const inset = sw * 0.6;
  return [
    `<path d="M${cx - halfAt(level) + inset} ${level} L${cx + halfAt(level) - inset} ${level} L${cx + halfAt(baseTop) - inset} ${baseTop} L${cx - halfAt(baseTop) + inset} ${baseTop} Z" fill="${liquid}"/>`,
    `<path d="M${cx - halfAt(baseTop)} ${baseTop} L${cx + halfAt(baseTop)} ${baseTop} L${cx + botHalf} ${bottom} L${cx - botHalf} ${bottom} Z" fill="${color.text}" opacity="0.35"/>`,
    `<path d="M${cx - topHalf} ${top} L${cx + topHalf} ${top} L${cx + botHalf} ${bottom} L${cx - botHalf} ${bottom} Z" fill="none" stroke="${color.text}" stroke-width="${sw}" stroke-linejoin="round"/>`,
  ].join("");
}

/** Tall water glass with a teal fill and a wave line. */
function waterGlass(cx: number, cy: number, h: number): string {
  const top = cy - h / 2;
  const bottom = cy + h / 2;
  const topHalf = h * 0.32;
  const botHalf = h * 0.24;
  const halfAt = (y: number) => topHalf - (topHalf - botHalf) * ((y - top) / h);
  const level = top + h * 0.3;
  const sw = Math.max(1.5, h / 18);
  const l = halfAt(level) - sw * 0.6;
  const b = botHalf - sw * 0.6;
  return [
    `<path d="M${cx - l} ${level} Q${cx - l / 2} ${level - h * 0.05} ${cx} ${level} T${cx + l} ${level} L${cx + b} ${bottom - sw * 0.6} L${cx - b} ${bottom - sw * 0.6} Z" fill="${color.accent}" opacity="0.9"/>`,
    `<path d="M${cx - topHalf} ${top} L${cx + topHalf} ${top} L${cx + botHalf} ${bottom} L${cx - botHalf} ${bottom} Z" fill="none" stroke="${color.text}" stroke-width="${sw}" stroke-linejoin="round"/>`,
  ].join("");
}

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

const DEFS = `<defs>
<filter id="glow" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glowSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;

/** Stacked neon wordmark: SHOT / or / SPILL. `top` is the top of the SHOT caps. */
function wordmarkStacked(cx: number, top: number, size: number): { svg: string; height: number } {
  const shotBase = top + size * 0.74;
  const orBase = shotBase + size * 0.44;
  const spillBase = orBase + size * 0.86;
  const svg = [
    `<g filter="url(#glow)">`,
    text(cx, shotBase, "SHOT", { size, family: "display", fill: color.shot, anchor: "middle", ls: size * 0.03 }),
    text(cx, orBase, "or", { size: size * 0.38, family: "sans", weight: 800, fill: color.text, anchor: "middle" }),
    text(cx, spillBase, "SPILL", { size, family: "display", fill: color.spill, anchor: "middle", ls: size * 0.03 }),
    `</g>`,
  ].join("");
  return { svg, height: spillBase - top };
}

/** Bunting on a sagging string, one flag per brand and deck color. */
function bunting(x1: number, x2: number, y0: number, sag: number, n: number): string {
  const colors = [
    color.shot,
    deckAccent["warm-up"],
    color.spill,
    deckAccent["barkada-tea"],
    deckAccent["love-life"],
    deckAccent["family-adulting"],
    deckAccent["no-filter"],
  ];
  const cx = (x1 + x2) / 2;
  const cy = y0 + 2 * sag;
  const at = (t: number) => ({
    x: (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2,
    y: (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y0,
  });
  const tw = ((x2 - x1) / n) * 0.78;
  const th = tw * 1.15;
  const flags = Array.from({ length: n }, (_, i) => {
    const p = at((i + 0.5) / n);
    return `<path d="M${p.x - tw / 2} ${p.y} L${p.x + tw / 2} ${p.y} L${p.x} ${p.y + th} Z" fill="${colors[i % colors.length]}"/>`;
  });
  return `<path d="M${x1} ${y0} Q${cx} ${cy} ${x2} ${y0}" fill="none" stroke="${color.textMuted}" stroke-width="1.5"/>${flags.join("")}`;
}

/** Card back (PRD §10): neon border, bunting, tagay glass, stacked wordmark. */
function cardBack(x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2;
  const mark = wordmarkStacked(cx, y + h * 0.5, w * 0.17);
  return [
    box(x, y, w, h, { fill: color.surface, r: radius.card }),
    box(x + 12, y + 12, w - 24, h - 24, { stroke: color.border, sw: 1.5, r: radius.card - 8, dash: "6 6" }),
    box(x, y, w, h, { stroke: color.accent, sw: 3, r: radius.card, filter: "glowSoft" }),
    bunting(x + 22, x + w - 22, y + 36, 22, 9),
    shotGlass(cx, y + h * 0.36, h * 0.17),
    mark.svg,
    text(cx, y + h - 28, "18+ · BARKADA CARD GAME", {
      size: 13,
      family: "display",
      fill: color.textMuted,
      anchor: "middle",
      ls: 1.6,
    }),
  ].join("");
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

type Variant =
  | "primary"
  | "spill"
  | "shot"
  | "secondary"
  | "ghost"
  | "disabled"
  | "danger"
  | "share";

function button(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  v: Variant,
  sub?: string,
): string {
  const fills: Record<Variant, { fill?: string; stroke?: string; dash?: string; fg: string }> = {
    primary: { fill: color.accent, fg: color.textOnBright },
    spill: { fill: color.spill, fg: color.textOnBright },
    shot: { fill: color.shot, fg: color.textOnBright },
    secondary: { stroke: color.borderStrong, fg: color.text },
    ghost: { fg: color.accent },
    disabled: { fill: color.disabledBg, fg: color.disabledText },
    danger: { stroke: color.danger, fg: color.danger },
    share: { stroke: color.borderStrong, dash: "7 6", fg: color.text },
  };
  const f = fills[v];
  const cx = x + w / 2;
  const parts = [box(x, y, w, h, { fill: f.fill, stroke: f.stroke, sw: 2, r: radius.md, dash: f.dash })];
  if (v === "ghost") {
    parts.push(text(cx, y + h / 2 + 6, label, { size: 16, weight: 600, fill: f.fg, anchor: "middle" }));
    return parts.join("");
  }
  const size = h >= 64 ? 28 : 21;
  if (sub) {
    parts.push(text(cx, y + h / 2 + size * 0.12, label, { size, family: "display", fill: f.fg, anchor: "middle", ls: 1 }));
    parts.push(text(cx, y + h / 2 + size * 0.12 + 19, sub, { size: 13, weight: 600, fill: f.fg, anchor: "middle" }));
  } else {
    parts.push(text(cx, y + h / 2 + size * 0.36, label, { size, family: "display", fill: f.fg, anchor: "middle", ls: 1 }));
  }
  return parts.join("");
}

function chip(x: number, y: number, w: number, label: string, selected: boolean, sel: string = color.shot): string {
  const h = layout.tapTarget;
  const o: TextOpts = { size: 16, weight: selected ? 700 : 600 };
  if (!selected) {
    return (
      box(x, y, w, h, { fill: color.surfaceRaised, stroke: color.borderStrong, sw: 1.5, r: h / 2 }) +
      text(x + w / 2, y + 30, label, { ...o, anchor: "middle" })
    );
  }
  const labelW = estWidth(label, o);
  const start = x + w / 2 - (labelW + 24) / 2;
  return (
    box(x, y, w, h, { fill: sel, r: h / 2 }) +
    icon("check", start, y + 14, color.textOnBright, 20) +
    text(start + 24, y + 30, label, { ...o, fill: color.textOnBright })
  );
}

function tanggeroBadge(right: number, y: number, name: string): string {
  const label = `Tanggero: ${name}`;
  const o: TextOpts = { size: 14, weight: 700, fill: color.accent };
  const w = estWidth(label, o) + 46;
  const x = right - w;
  return (
    box(x, y, w, 34, { fill: color.bg, stroke: color.accent, sw: 1.5, r: 17 }) +
    shotGlass(x + 20, y + 17, 15) +
    text(x + 34, y + 22, label, o)
  );
}

function label(x: number, y: number, s: string, fill: string = color.textMuted, anchor: TextOpts["anchor"] = "start"): string {
  return text(x, y, s, { size: 15, family: "display", fill, ls: 1.2, anchor });
}

function title(y: number, s: string): string {
  return text(G, y, s, { size: 36, family: "display" });
}

function topBar(step?: string): string {
  const parts = [icon("back", G - 4, 26, color.text, 26)];
  if (step) parts.push(label(W - G, 44, step, color.textMuted, "end"));
  return parts.join("");
}

function gameHeader(kicker: string, name: string): string {
  return [
    label(G, 42, kicker),
    tanggeroBadge(W - G, 20, TANGGERO),
    text(G, 98, name.toUpperCase(), { size: 46, family: "display" }),
  ].join("");
}

function actionsRow(y: number, items: { icon: IconName; label: string }[]): string {
  const cell = CW / items.length;
  return items
    .map((it, i) => {
      const cx = G + cell * i + cell / 2;
      const o: TextOpts = { size: 15, weight: 600, fill: color.textMuted };
      const total = 22 + 8 + estWidth(it.label, o);
      const x0 = cx - total / 2;
      return icon(it.icon, x0, y + 14, color.textMuted, 20) + text(x0 + 30, y + 30, it.label, o);
    })
    .join("");
}

const TYPE_LABEL: Record<CardType, string> = {
  spill_or_shot: "SPILL OR SHOT",
  everyone_who: "EVERYONE WHO",
  most_likely: "MOST LIKELY TO",
  hot_seat: "HOT SEAT",
  double_down: "DOUBLE DOWN",
  water_break: "PACING",
};

const TYPE_HINT: Record<CardType, string> = {
  spill_or_shot: "Answer honestly, or take a shot.",
  double_down: "Answer, or take 2 shots.",
  everyone_who: "Everyone it applies to drinks.",
  most_likely: "Point on 3. Most votes drinks or explains.",
  hot_seat: "3 questions from the group. A shot skips one.",
  water_break: "Pacing card. No exceptions.",
};

/**
 * Face-up card. Text is resolved (placeholders filled) and sized by
 * cardTextSize(). Compact cards (a picker sits below) drop one text size and
 * skip the hint line, since the picker label explains the action.
 */
function cardFace(x: number, y: number, w: number, h: number, card: Card, compact = false): string {
  const isWater = card.type === "water_break";
  const accent = isWater ? color.accent : deckAccent[card.deck];
  const chipLabel = isWater ? "WATER BREAK" : DECKS[card.deck].name.toUpperCase();
  const chipO: TextOpts = { size: 14, family: "display", fill: color.textOnBright, ls: 1 };
  const chipW = estWidth(chipLabel, chipO) + 26;
  const body = fillNames(card.text);
  const size = cardTextSize(body, compact);
  const o: TextOpts = { size, weight: cardText.weight, anchor: "middle" };
  const lines = wrap(body, w - 48, o);
  const lh = size * cardText.lineHeight;
  let top = y + 64;
  const bottom = y + h - (compact ? 20 : 52);
  const parts = [
    box(x, y, w, h, { fill: color.surface, stroke: accent, sw: 2, r: radius.card }),
    box(x + 20, y + 20, chipW, 28, { fill: accent, r: 14 }),
    text(x + 20 + 13, y + 39, chipLabel, chipO),
    label(x + w - 20, y + 40, TYPE_LABEL[card.type], color.textMuted, "end"),
  ];
  if (isWater) {
    parts.push(waterGlass(x + w / 2, y + 112, 64));
    top = y + 152;
  }
  const blockH = lines.length * lh;
  const firstBase = top + (bottom - top - blockH) / 2 + size * 0.8;
  lines.forEach((l, i) => parts.push(text(x + w / 2, firstBase + i * lh, l, o)));
  if (!compact) {
    parts.push(text(x + w / 2, y + h - 24, TYPE_HINT[card.type], { size: 14, weight: 500, fill: color.textMuted, anchor: "middle" }));
  }
  return parts.join("");
}

function scrim(h: number = H): string {
  return `<rect width="${W}" height="${h}" fill="${color.scrim}"/>`;
}

function dialog(y: number, h: number): string {
  return box(G, y, CW, h, { fill: color.surface, stroke: color.border, sw: 1, r: radius.lg });
}

function segmented(x: number, y: number, w: number, h: number, options: string[], selected: number): string {
  const seg = w / options.length;
  const parts = [box(x, y, w, h, { fill: color.surface, stroke: color.borderStrong, sw: 1.5, r: radius.md })];
  options.forEach((opt, i) => {
    const sx = x + seg * i;
    const on = i === selected;
    if (on) parts.push(box(sx + 4, y + 4, seg - 8, h - 8, { fill: color.accent, r: radius.md - 4 }));
    parts.push(
      text(sx + seg / 2, y + h / 2 + 7, opt, {
        size: 19,
        family: "display",
        fill: on ? color.textOnBright : color.text,
        anchor: "middle",
        ls: 0.8,
      }),
    );
  });
  return parts.join("");
}

function stepper(x: number, y: number, w: number, h: number, value: string): string {
  return [
    box(x, y, h, h, { stroke: color.borderStrong, sw: 2, r: radius.md }),
    icon("minus", x + h / 2 - 11, y + h / 2 - 11, color.text, 22),
    text(x + w / 2, y + h / 2 + 14, value, { size: 40, family: "display", anchor: "middle" }),
    box(x + w - h, y, h, h, { stroke: color.borderStrong, sw: 2, r: radius.md }),
    icon("plus", x + w - h / 2 - 11, y + h / 2 - 11, color.text, 22),
  ].join("");
}

function toggle(x: number, y: number, on: boolean): string {
  return (
    box(x, y, 52, 32, { fill: on ? color.accent : color.surfaceRaised, stroke: on ? undefined : color.borderStrong, sw: 1.5, r: 16 }) +
    `<circle cx="${on ? x + 36 : x + 16}" cy="${y + 16}" r="11" fill="${on ? color.textOnBright : color.text}"/>`
  );
}

const DECK_EMOJI: Record<DeckId, string> = {
  "warm-up": "🍻",
  "barkada-tea": "☕",
  "love-life": "💔",
  couples: "❤️",
  "family-adulting": "🏠",
  "no-filter": "🔞",
  "our-cards": "✍️",
};

function deckTile(x: number, y: number, w: number, h: number, id: DeckId, selected: boolean, count: number): string {
  const meta = DECKS[id];
  const accent = deckAccent[id];
  const parts = [
    box(x, y, w, h, { fill: color.surface, stroke: selected ? accent : color.border, sw: selected ? 2 : 1.5, r: radius.md }),
    box(x + 14, y + (h - 44) / 2, 44, 44, { fill: accent, r: 12 }),
    `<text x="${x + 36}" y="${y + h / 2 + 8}" font-size="22" text-anchor="middle">${DECK_EMOJI[id]}</text>`,
    text(x + 72, y + 32, meta.name.toUpperCase(), { size: 21, family: "display", ls: 0.6 }),
  ];
  if (meta.adultOptIn) {
    const nameW = estWidth(meta.name.toUpperCase(), { size: 21, family: "display" }) + 0.6 * meta.name.length;
    parts.push(box(x + 72 + nameW + 8, y + 15, 38, 22, { stroke: deckAccent["no-filter"], sw: 1.5, r: 11 }));
    parts.push(text(x + 72 + nameW + 27, y + 31, "18+", { size: 13, family: "display", fill: deckAccent["no-filter"], anchor: "middle" }));
  }
  const lineO: TextOpts = { size: 13, weight: 500, fill: color.textMuted };
  const line = truncate(`${plural(count, "card")} · ${meta.tagline}`, w - 72 - 16, lineO);
  parts.push(text(x + 72, y + 54, line, lineO));
  // Check sits on the name line so the second line can use the full width.
  const ccx = x + w - 28;
  const ccy = y + 25;
  if (selected) {
    parts.push(`<circle cx="${ccx}" cy="${ccy}" r="14" fill="${accent}"/>`);
    parts.push(icon("check", ccx - 9, ccy - 9, color.textOnBright, 18));
  } else {
    parts.push(`<circle cx="${ccx}" cy="${ccy}" r="13" fill="none" stroke="${color.borderStrong}" stroke-width="2"/>`);
  }
  return parts.join("");
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

function svgDoc(w: number, h: number, titleText: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(titleText)}">
<title>${esc(titleText)}</title>
<style>.d{font-family:${font.display}}.s{font-family:${font.sans}}</style>
${DEFS}
<rect width="${w}" height="${h}" fill="${color.bg}"/>
${body}
</svg>
`;
}

const written: string[] = [];
function write(dir: string, file: string, svg: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, file), svg);
  written.push(join(dir, file).replace(`${ROOT}/`, ""));
}

// Card frames
const FULL = { x: G, y: 118, w: CW, h: 410 };
const COMPACT = { x: G, y: 118, w: CW, h: 304 };

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------

function ageGate(): string {
  const mark = wordmarkStacked(W / 2, 140, 82);
  const tag = para(W / 2, 384, "The barkada card game. Answer honestly, or take a shot.", 280, {
    size: 16, weight: 500, fill: color.textMuted, anchor: "middle",
  });
  const pledge = ["No one drives tonight.", "Skipping is always okay.", "Drink water."];
  return [
    shotGlass(W / 2, 92, 56),
    mark.svg,
    box(W / 2 - 62, 336, 124, 26, { stroke: deckAccent["no-filter"], sw: 1.5, r: 13 }),
    text(W / 2, 354, "18+ ONLY", { size: 14, family: "display", fill: deckAccent["no-filter"], anchor: "middle", ls: 1.4 }),
    tag.svg,
    box(G, 440, CW, 148, { fill: color.surface, stroke: color.border, r: radius.lg }),
    label(G + 20, 470, "TONIGHT'S PLEDGE", color.accent),
    ...pledge.map((line, i) =>
      icon("check", G + 20, 488 + i * 32, color.accent, 20) +
      text(G + 50, 504 + i * 32, line, { size: 17, weight: 600 }),
    ),
    button(G, 612, CW, 66, "I'M 18 OR OLDER", "primary", "and I'm taking the pledge"),
    button(G, 688, CW, 48, "I'm under 18", "ghost"),
    text(W / 2, 776, "About  ·  Drink Responsibly  ·  Terms", { size: 14, weight: 600, fill: color.accent, anchor: "middle" }),
  ].join("");
}

function underAge(): string {
  const mark = wordmarkStacked(W / 2, 120, 56);
  const body = para(W / 2, 400, "Shot or Spill is a drinking game for adults 18 and over. See you in a few years.", 280, {
    size: 17, weight: 500, fill: color.textMuted, anchor: "middle",
  });
  return [
    mark.svg,
    text(W / 2, 352, "COME BACK AT 18", { size: 36, family: "display", anchor: "middle" }),
    body.svg,
    button(G, 712, CW, 56, "GO BACK", "secondary"),
  ].join("");
}

function players(): string {
  const sub = para(G, 142, "Add 2 to 12 players, in the order you're sitting.", CW, {
    size: 16, weight: 500, fill: color.textMuted,
  });
  const rows = PLAYERS.map((name, i) => {
    const y = 262 + i * 62;
    return [
      box(G, y, CW, 54, { fill: color.surfaceRaised, r: radius.md }),
      `<circle cx="${G + 27}" cy="${y + 27}" r="14" fill="${color.bg}" stroke="${color.borderStrong}" stroke-width="1.5"/>`,
      text(G + 27, y + 32, String(i + 1), { size: 14, weight: 700, anchor: "middle", fill: color.textMuted }),
      text(G + 54, y + 33, name, { size: 17, weight: 700 }),
      icon("edit", W - G - 86, y + 17, color.textMuted, 20),
      icon("close", W - G - 38, y + 17, color.textMuted, 20),
    ].join("");
  });
  return [
    topBar("STEP 1 OF 2"),
    title(112, "WHO'S DRINKING?"),
    sub.svg,
    box(G, 186, CW - 84, 54, { fill: color.surface, stroke: color.accent, sw: 2, r: radius.md }),
    text(G + 16, 219, "Paolo", { size: 17, weight: 600 }),
    `<rect x="${G + 66}" y="200" width="2" height="26" fill="${color.accent}"/>`,
    button(W - G - 72, 186, 72, 54, "ADD", "primary"),
    ...rows,
    text(G, 596, `${PLAYERS.length} of 12 players`, { size: 14, weight: 600, fill: color.textMuted }),
    text(G, 620, "The app picks the Tanggero when the game starts.", { size: 14, weight: 500, fill: color.textMuted }),
    button(G, 712, CW, 64, "NEXT: PICK DECKS", "primary"),
  ].join("");
}

function decks(selected: DeckId[], intensity: Intensity): string {
  const hints = ["Light and safe. Nothing spicy.", "Tea, exes, a little heat.", "Adults only. Bold questions."];
  const count = eligible(selected, intensity);
  const enough = count >= 10;
  const tiles = DECK_IDS.map((id, i) =>
    deckTile(G, 140 + i * 80, CW, 72, id, selected.includes(id), eligible([id], intensity)),
  );
  return [
    topBar("STEP 2 OF 2"),
    title(112, "PICK YOUR DECKS"),
    ...tiles,
    label(G, 566, "INTENSITY"),
    segmented(G, 578, CW, 54, ["CHILL", "SPICY", "NO FILTER"], intensity - 1),
    text(G, 656, hints[intensity - 1]!, { size: 14, weight: 500, fill: color.textMuted }),
    enough
      ? text(W / 2, 696, `${count} cards ready`, { size: 15, weight: 700, anchor: "middle" })
      : text(W / 2, 696, `${count} cards ready · you need at least 10`, { size: 15, weight: 700, fill: color.danger, anchor: "middle" }),
    button(G, 712, CW, 64, "START THE NIGHT", enough ? "primary" : "disabled"),
  ].join("");
}

function howToPlay(): string {
  const rules = [
    "Pass the phone. Whoever holds it draws the card.",
    "Read the card out loud.",
    "Spill (answer honestly) or Shot (drink and keep your secret).",
    "Too vague? The group decides. If it is, that person drinks.",
    "Tap Spill or Shot, then pass the phone.",
  ];
  const parts = [topBar(), title(112, "HOW TO PLAY")];
  let y = 150;
  rules.forEach((rule, i) => {
    parts.push(`<circle cx="${G + 14}" cy="${y + 2}" r="14" fill="${color.accent}"/>`);
    parts.push(text(G + 14, y + 8, String(i + 1), { size: 16, family: "display", fill: color.textOnBright, anchor: "middle" }));
    const p = para(G + 42, y + 8, rule, CW - 42, { size: 16, weight: 500 });
    parts.push(p.svg);
    y += Math.max(34, p.height) + 14;
  });
  y += 4;
  const t = para(G + 62, y + 50, "Pours for the table. The app picks one now and passes the role every 10 cards.", CW - 80, {
    size: 14, weight: 500, fill: color.textMuted,
  });
  const tH = 48 + t.height;
  parts.push(box(G, y, CW, tH, { fill: color.surface, stroke: color.accent, sw: 1.5, r: radius.md }));
  parts.push(shotGlass(G + 32, y + 34, 30));
  parts.push(label(G + 62, y + 30, "THE TANGGERO", color.accent));
  parts.push(t.svg);
  y += tH + 12;
  const s = para(G + 20, y + 50, "A small tagay-sized pour, not a full glass. Skipping a card is always okay.", CW - 40, {
    size: 14, weight: 500, fill: color.textMuted,
  });
  const sH = 48 + s.height;
  parts.push(box(G, y, CW, sH, { fill: color.surface, stroke: color.shot, sw: 1.5, r: radius.md }));
  parts.push(label(G + 20, y + 30, "WHAT'S A SHOT?", color.shot));
  parts.push(s.svg);
  parts.push(button(G, 712, CW, 64, "LET'S GO", "primary"));
  return parts.join("");
}

function gameBase(): string {
  const card = cardById("barkada-001");
  return [
    gameHeader("NOW READING", "Juan"),
    cardFace(FULL.x, FULL.y, FULL.w, FULL.h, card),
    button(G, 548, (CW - 12) / 2, layout.choiceButtonHeight, "SPILL", "spill", "Answer honestly"),
    button(G + (CW - 12) / 2 + 12, 548, (CW - 12) / 2, layout.choiceButtonHeight, "SHOT", "shot", `Take ${card.shots} shot`),
    actionsRow(640, [
      { icon: "skip", label: "Skip" },
      { icon: "undo", label: "Undo" },
      { icon: "scores", label: "Scores" },
    ]),
    text(W / 2, 742, `Card 24 of ${SAMPLE_POOL}`, { size: 13, weight: 600, fill: color.textMuted, anchor: "middle" }),
  ].join("");
}

function passPhone(): string {
  return [
    gameHeader("PASS THE PHONE TO", "Bea"),
    cardBack(FULL.x, FULL.y, FULL.w, FULL.h),
    text(W / 2, 568, "Tap or swipe the card to flip it", { size: 15, weight: 600, fill: color.textMuted, anchor: "middle" }),
    actionsRow(640, [
      { icon: "undo", label: "Undo" },
      { icon: "scores", label: "Scores" },
    ]),
    text(W / 2, 742, `Card 25 of ${SAMPLE_POOL}`, { size: 13, weight: 600, fill: color.textMuted, anchor: "middle" }),
  ].join("");
}

function waterBreak(): string {
  return [
    gameHeader("NOW READING", "Bea"),
    cardFace(FULL.x, FULL.y, FULL.w, FULL.h, cardById("warm-028")),
    button(G, 548, CW, layout.choiceButtonHeight, "DONE · NEXT CARD", "primary", "Nothing is logged"),
    actionsRow(640, [
      { icon: "undo", label: "Undo" },
      { icon: "scores", label: "Scores" },
    ]),
  ].join("");
}

function compactActions(y: number): string {
  return actionsRow(y, [
    { icon: "skip", label: "Skip" },
    { icon: "undo", label: "Undo" },
    { icon: "scores", label: "Scores" },
  ]);
}

function playerChips(y: number, selected: string[], sel: string): string {
  const w = (CW - 16) / 3;
  return PLAYERS.map((name, i) =>
    chip(G + (i % 3) * (w + 8), y + Math.floor(i / 3) * 56, w, name, selected.includes(name), sel),
  ).join("");
}

function whoDrank(): string {
  return [
    gameHeader("NOW READING", "Bea"),
    cardFace(COMPACT.x, COMPACT.y, COMPACT.w, COMPACT.h, cardById("warm-018"), true),
    label(G, 450, "WHO DRANK? TAP EVERYONE WHO DID"),
    playerChips(462, ["Juan", "Carlo"], color.shot),
    button(G, 590, CW, 64, "DONE", "primary", "Logs 1 shot for Juan and Carlo"),
    compactActions(672),
  ].join("");
}

function hotSeat(): string {
  return [
    gameHeader("NOW READING", "Jessa"),
    cardFace(COMPACT.x, COMPACT.y, COMPACT.w, COMPACT.h, cardById("barkada-030"), true),
    label(G, 450, "SHOTS BEA TOOK"),
    stepper(G, 462, CW, 60, "1"),
    text(W / 2, 550, "0 to 3. Each answered question counts as a spill.", { size: 14, weight: 500, fill: color.textMuted, anchor: "middle" }),
    button(G, 590, CW, 64, "DONE", "primary", "Logs 1 shot and 2 spills for Bea"),
    compactActions(672),
  ].join("");
}

function tanggeroPick(): string {
  const half = (CW - 12) / 2;
  return [
    gameHeader("NOW READING", "Carlo"),
    cardFace(COMPACT.x, COMPACT.y, COMPACT.w, COMPACT.h, cardById("barkada-010"), true),
    label(G, 450, `WHO DID ${TANGGERO.toUpperCase()} PICK?`),
    playerChips(462, ["Bea"], color.accent),
    button(G, 590, half, layout.choiceButtonHeight, "SPILL", "spill", "Logs for Bea"),
    button(G + half + 12, 590, half, layout.choiceButtonHeight, "SHOT", "shot", "Logs for Bea"),
    compactActions(676),
  ].join("");
}

function scoreboard(): string {
  const rows = [
    { name: "Juan", spills: 5, shots: 3, reading: false },
    { name: "Maria", spills: 4, shots: 4, reading: false },
    { name: "Bea", spills: 7, shots: 1, reading: false },
    { name: "Carlo", spills: 2, shots: 6, reading: false },
    { name: "Jessa", spills: 3, shots: 2, reading: true },
  ];
  const top = 120;
  const parts = [
    gameBase(),
    scrim(),
    `<path d="M0 ${top + 24} Q0 ${top} 24 ${top} H${W - 24} Q${W} ${top} ${W} ${top + 24} V${H} H0 Z" fill="${color.surface}"/>`,
    box(W / 2 - 20, top + 10, 40, 4, { fill: color.borderStrong, r: 2 }),
    text(G, top + 58, "SCOREBOARD", { size: 30, family: "display" }),
    icon("close", W - G - 30, top + 32, color.text, 24),
    label(G, top + 96, "PLAYER"),
    label(250, top + 96, "SPILLS", color.textMuted, "middle"),
    label(312, top + 96, "SHOTS", color.textMuted, "middle"),
  ];
  rows.forEach((r, i) => {
    const y = top + 108 + i * 50;
    if (r.reading) parts.push(box(G - 8, y, CW + 16, 46, { fill: color.surfaceRaised, r: radius.sm }));
    parts.push(text(G, y + 30, r.name, { size: 17, weight: 700 }));
    const nameW = estWidth(r.name, { size: 17, weight: 700 });
    if (r.name === TANGGERO) {
      parts.push(box(G + nameW + 8, y + 13, 24, 22, { stroke: color.accent, sw: 1.5, r: 11 }));
      parts.push(text(G + nameW + 20, y + 29, "T", { size: 13, family: "display", fill: color.accent, anchor: "middle" }));
    }
    if (r.reading) parts.push(text(G + nameW + 10, y + 29, "reading", { size: 13, weight: 600, fill: color.textMuted }));
    parts.push(text(250, y + 32, String(r.spills), { size: 24, family: "display", fill: color.spill, anchor: "middle" }));
    if (r.shots >= 6) {
      parts.push(`<circle cx="312" cy="${y + 23}" r="17" fill="none" stroke="${color.danger}" stroke-width="2"/>`);
    }
    parts.push(text(312, y + 32, String(r.shots), { size: 24, family: "display", fill: color.shot, anchor: "middle" }));
  });
  const y0 = top + 108 + rows.length * 50 + 22;
  parts.push(text(G, y0, "Card 24 · New Tanggero in 6 · Water Break in 2", { size: 13, weight: 600, fill: color.textMuted }));
  parts.push(box(G, y0 + 18, CW, 1, { fill: color.border }));
  parts.push(label(G, y0 + 50, "GAME SETTINGS"));
  parts.push(text(G, y0 + 92, "Shot warning at", { size: 16, weight: 600 }));
  parts.push(stepper(W - G - 150, y0 + 64, 150, 48, "6"));
  parts.push(text(G, y0 + 148, "Reduced motion", { size: 16, weight: 600 }));
  parts.push(text(G, y0 + 168, "Fades instead of flips", { size: 13, weight: 500, fill: color.textMuted }));
  parts.push(toggle(W - G - 52, y0 + 134, false));
  parts.push(button(G, 724, CW, 56, "END THE NIGHT", "danger"));
  return parts.join("");
}

function softCap(): string {
  const body = para(W / 2, 404, "Six shots so far tonight. Water round for you?", CW - 60, {
    size: 16, weight: 500, fill: color.textMuted, anchor: "middle",
  });
  return [
    gameBase(),
    scrim(),
    dialog(228, 352),
    waterGlass(W / 2, 292, 60),
    text(W / 2, 370, "CARLO, THAT'S 6.", { size: 32, family: "display", anchor: "middle" }),
    body.svg,
    button(G + 20, 460, CW - 40, 56, "WATER ROUND", "primary"),
    button(G + 20, 522, CW - 40, 48, "Keep playing", "ghost"),
  ].join("");
}

function adultConfirm(): string {
  const body = para(W / 2, 360, "Bold questions about body count, cheating, regrets, and confessions. Nothing graphic, and every card can still be skipped.", CW - 48, {
    size: 15, weight: 500, fill: color.textMuted, anchor: "middle",
  });
  return [
    decks(["warm-up", "barkada-tea", "love-life", "no-filter"], 3),
    scrim(),
    dialog(196, 424),
    `<circle cx="${W / 2}" cy="${248}" r="28" fill="none" stroke="${deckAccent["no-filter"]}" stroke-width="2.5"/>`,
    text(W / 2, 258, "18+", { size: 24, family: "display", fill: deckAccent["no-filter"], anchor: "middle" }),
    text(W / 2, 320, "NO FILTER IS FOR ADULTS", { size: 27, family: "display", anchor: "middle" }),
    body.svg,
    para(W / 2, 460, "Everyone here is okay with adult questions.", CW - 80, {
      size: 15, weight: 700, anchor: "middle",
    }).svg,
    button(G + 20, 500, CW - 40, 56, "EVERYONE'S OKAY", "primary"),
    button(G + 20, 560, CW - 40, 48, "Not tonight", "ghost"),
  ].join("");
}

function reshuffle(): string {
  const body = para(W / 2, 350, `You've played all ${SAMPLE_POOL} cards in these decks. Shuffle them again, or switch decks.`, CW - 48, {
    size: 16, weight: 500, fill: color.textMuted, anchor: "middle",
  });
  return [
    gameBase(),
    scrim(),
    dialog(200, 418),
    `<circle cx="${W / 2}" cy="${254}" r="28" fill="${color.surfaceRaised}"/>`,
    icon("shuffle", W / 2 - 15, 239, color.accent, 30),
    text(W / 2, 318, "THAT'S EVERY CARD", { size: 30, family: "display", anchor: "middle" }),
    body.svg,
    button(G + 20, 436, CW - 40, 56, "SHUFFLE AGAIN", "primary"),
    button(G + 20, 504, CW - 40, 52, "CHANGE DECKS", "secondary"),
    button(G + 20, 564, CW - 40, 48, "End the night", "ghost"),
  ].join("");
}

function recap(): string {
  const awards = [
    { label: "MOST HONEST", fill: color.spill, emoji: "🗣️", name: "Bea", why: "11 spills" },
    { label: "MOST SECRETIVE", fill: color.shot, emoji: "🤫", name: "Carlo", why: "8 shots" },
    { label: "BIGGEST TEA", fill: color.accent, emoji: "☕", name: "Maria", why: "3 Double Downs" },
  ];
  const scores = [
    ["Juan", 9, 4],
    ["Maria", 6, 7],
    ["Bea", 11, 2],
    ["Carlo", 4, 8],
    ["Jessa", 7, 3],
  ] as const;
  const parts = [
    text(G, 74, "THAT'S THE NIGHT", { size: 38, family: "display" }),
    text(G, 102, "42 cards · 1 h 12 min · 5 players", { size: 15, weight: 600, fill: color.textMuted }),
  ];
  awards.forEach((a, i) => {
    const y = 124 + i * 86;
    parts.push(box(G, y, CW, 78, { fill: color.surface, stroke: a.fill, sw: 1.5, r: radius.md }));
    parts.push(`<circle cx="${G + 38}" cy="${y + 39}" r="22" fill="${color.surfaceRaised}"/>`);
    parts.push(`<text x="${G + 38}" y="${y + 47}" font-size="22" text-anchor="middle">${a.emoji}</text>`);
    parts.push(label(G + 74, y + 30, a.label, a.fill));
    parts.push(text(G + 74, y + 62, a.name.toUpperCase(), { size: 28, family: "display" }));
    parts.push(text(W - G - 18, y + 60, a.why, { size: 14, weight: 600, fill: color.textMuted, anchor: "end" }));
  });
  const sy = 400;
  parts.push(label(G, sy, "PLAYER"));
  parts.push(label(250, sy, "SPILLS", color.textMuted, "middle"));
  parts.push(label(312, sy, "SHOTS", color.textMuted, "middle"));
  scores.forEach(([name, spills, shots], i) => {
    const y = sy + 12 + i * 38;
    parts.push(box(G, y + 37, CW, 1, { fill: color.border }));
    parts.push(text(G, y + 26, name, { size: 16, weight: 700 }));
    parts.push(text(250, y + 27, String(spills), { size: 21, family: "display", fill: color.spill, anchor: "middle" }));
    parts.push(text(312, y + 27, String(shots), { size: 21, family: "display", fill: color.shot, anchor: "middle" }));
  });
  parts.push(text(W / 2, 634, "Get home safe. Nobody drives tonight.", { size: 14, weight: 600, fill: color.accent, anchor: "middle" }));
  const half = (CW - 12) / 2;
  parts.push(button(G, 656, CW, 60, "PLAY AGAIN", "primary"));
  parts.push(button(G, 728, half, 52, "NEW PLAYERS", "secondary"));
  parts.push(button(G + half + 12, 728, half, 52, "SHARE", "share", "pending D-17"));
  return parts.join("");
}

function infoPage(): string {
  const sections = [
    ["THE PLEDGE", "No one drives tonight. Skipping is always okay. Drink water."],
    ["WHAT'S A SHOT", "A small tagay-sized pour, not a full glass."],
    ["PACE YOURSELF", "A Water Break comes up every 12 to 15 cards. When someone reaches 6 shots, the app suggests a water round. You can change that number on the scoreboard."],
    ["GET HOME SAFE", "Book a ride, stay over at the host's place, or take turns being the sober one. Nobody drives after drinking."],
  ] as const;
  const parts = [topBar(), title(112, "DRINK RESPONSIBLY")];
  let y = 160;
  for (const [head, body] of sections) {
    parts.push(label(G, y, head, color.accent));
    const p = para(G, y + 28, body, CW, { size: 16, weight: 500, lh: 1.45 });
    parts.push(p.svg);
    y += 28 + p.height + 22;
  }
  const foot = para(G, y + 8, "Shot or Spill is for adults 18+. It's for entertainment only and doesn't sell alcohol. Players are responsible for themselves.", CW, {
    size: 13, weight: 500, fill: color.textMuted,
  });
  parts.push(box(G, y - 10, CW, 1, { fill: color.border }));
  parts.push(foot.svg);
  parts.push(text(G, y + 18 + foot.height, "About  ·  Terms", { size: 14, weight: 600, fill: color.accent }));
  return parts.join("");
}

function components(): { w: number; h: number; body: string } {
  const w = 720;
  const h = 1140;
  const col = (i: number) => 24 + i * 352;
  const bw = 312;
  const parts: string[] = [];
  const heading = (x: number, y: number, s: string) =>
    text(x, y, s, { size: 20, family: "display", fill: color.accent, ls: 1 });
  const note = (x: number, y: number, s: string) =>
    text(x, y, s, { size: 13, weight: 500, fill: color.textMuted });

  parts.push(text(24, 52, "SHOT OR SPILL · COMPONENTS", { size: 30, family: "display" }));
  parts.push(note(24, 76, "Generated from src/design/tokens.ts. Tap targets are 48px or taller."));

  // Buttons
  let y = 112;
  parts.push(heading(col(0), y, "BUTTONS"));
  const variants: [Variant, string, string?][] = [
    ["primary", "PRIMARY"],
    ["spill", "SPILL", "Answer honestly"],
    ["shot", "SHOT", "Take 1 shot"],
    ["secondary", "SECONDARY"],
    ["danger", "DESTRUCTIVE"],
    ["disabled", "DISABLED"],
    ["share", "SHARE", "pending D-17"],
  ];
  variants.forEach(([v, l, sub], i) => {
    parts.push(button(col(0), y + 18 + i * 66, bw, sub ? 60 : 56, l, v, sub));
  });
  parts.push(button(col(0), y + 18 + variants.length * 66, bw, 48, "Ghost text button", "ghost"));

  // Focus ring
  const fy = y + 18 + variants.length * 66 + 70;
  parts.push(heading(col(0), fy, "FOCUS"));
  parts.push(box(col(0) - 4, fy + 14, bw + 8, 64, { stroke: color.focus, sw: 2, r: radius.md + 4 }));
  parts.push(button(col(0), fy + 18, bw, 56, "FOCUSED", "primary"));
  parts.push(note(col(0), fy + 100, "2px white ring, 2px outside the control."));

  // Chips, inputs, badges (right column)
  y = 112;
  parts.push(heading(col(1), y, "PLAYER CHIPS"));
  parts.push(chip(col(1), y + 18, 100, "Juan", false));
  parts.push(chip(col(1) + 106, y + 18, 100, "Carlo", true, color.shot));
  parts.push(chip(col(1) + 212, y + 18, 100, "Bea", true, color.accent));
  parts.push(note(col(1), y + 88, "Amber: who drank. Teal: who answers."));

  y += 116;
  parts.push(heading(col(1), y, "TEXT INPUT"));
  parts.push(box(col(1), y + 18, bw, 54, { fill: color.surface, stroke: color.borderStrong, sw: 1.5, r: radius.md }));
  parts.push(text(col(1) + 16, y + 51, "Player name", { size: 17, weight: 500, fill: color.textMuted }));
  parts.push(box(col(1), y + 84, bw, 54, { fill: color.surface, stroke: color.accent, sw: 2, r: radius.md }));
  parts.push(text(col(1) + 16, y + 117, "Paolo", { size: 17, weight: 600 }));
  parts.push(box(col(1), y + 150, bw, 54, { fill: color.surface, stroke: color.danger, sw: 2, r: radius.md }));
  parts.push(text(col(1) + 16, y + 183, "Maria", { size: 17, weight: 600 }));
  parts.push(text(col(1), y + 226, "That name is already in.", { size: 14, weight: 600, fill: color.danger }));
  parts.push(note(col(1), y + 248, "Default · focused · error. Names: 1 to 16 characters."));

  y += 280;
  parts.push(heading(col(1), y, "BADGES"));
  parts.push(tanggeroBadge(col(1) + 170, y + 18, TANGGERO));
  parts.push(box(col(1) + 186, y + 22, 54, 26, { stroke: deckAccent["no-filter"], sw: 1.5, r: 13 }));
  parts.push(text(col(1) + 213, y + 40, "18+", { size: 14, family: "display", fill: deckAccent["no-filter"], anchor: "middle" }));

  y += 80;
  parts.push(heading(col(1), y, "INTENSITY · STEPPER · TOGGLE"));
  parts.push(segmented(col(1), y + 18, bw, 54, ["CHILL", "SPICY", "NO FILTER"], 1));
  parts.push(stepper(col(1), y + 86, 150, 48, "6"));
  parts.push(toggle(col(1) + 176, y + 94, false));
  parts.push(toggle(col(1) + 246, y + 94, true));

  y += 156;
  parts.push(heading(col(1), y, "TOAST"));
  parts.push(box(col(1), y + 18, bw, 52, { fill: color.surfaceRaised, stroke: color.borderStrong, sw: 1, r: 26 }));
  parts.push(icon("undo", col(1) + 18, y + 34, color.accent, 20));
  parts.push(text(col(1) + 48, y + 50, "Undid Bea's shot", { size: 15, weight: 600 }));
  parts.push(note(col(1), y + 92, "Shows for 3 s after Undo, announced to screen readers."));

  // Deck tiles and accents, below both columns.
  y = 900;
  parts.push(heading(col(0), y, "DECK TILES"));
  parts.push(deckTile(col(0), y + 18, bw, 72, "love-life", true, eligible(["love-life"], 2)));
  parts.push(deckTile(col(0), y + 100, bw, 72, "no-filter", false, eligible(["no-filter"], 2)));
  parts.push(heading(col(1), y, "DECK ACCENTS"));
  DECK_IDS.forEach((id, i) => {
    parts.push(box(col(1), y + 18 + i * 34, 26, 26, { fill: deckAccent[id], r: 6 }));
    parts.push(text(col(1) + 38, y + 37 + i * 34, `${DECKS[id].name}  ${deckAccent[id]}`, { size: 14, weight: 600 }));
  });
  parts.push(note(col(0), h - 24, "Color is never the only cue: decks also have a name and an icon, buttons have text labels."));
  return { w, h, body: parts.join("") };
}

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------

// Brand
const markDoc = wordmarkStacked(160, 40, 96);
write(BRAND_DIR, "wordmark.svg", svgDoc(320, Math.ceil(markDoc.height + 80), "Shot or Spill wordmark", markDoc.svg));
write(BRAND_DIR, "card-back.svg", svgDoc(360, 460, "Shot or Spill card back", cardBack(20, 20, 320, 420)));

// Screens: the six key screens (PRD §10 flow), then secondary states.
const screens: [string, string, string][] = [
  ["01-age-gate", "Age gate and pledge (F1)", ageGate()],
  ["02-players", "Add players (F2)", players()],
  ["03-decks", "Pick decks and intensity (F4, F5, D-15)", decks(SAMPLE_DECKS, SAMPLE_INTENSITY)],
  ["04-how-to-play", "How to Play (first time only)", howToPlay()],
  ["05-game", "Game: Spill or Shot card (F6, F7, F10, F11)", gameBase()],
  ["06-recap", "Recap with awards (F14, D-19)", recap()],
  ["07-pass-the-phone", "Pass the phone: card back, tap or swipe to flip (F7)", passPhone()],
  ["08-water-break", "Water Break card (F12, D-12)", waterBreak()],
  ["09-who-drank", "Group card: who drank? (D-10)", whoDrank()],
  ["10-hot-seat", "Hot Seat: shots taken stepper (D-11)", hotSeat()],
  ["11-tanggero-pick", "Tanggero card: who answers? (D-09)", tanggeroPick()],
  ["12-scoreboard", "Scoreboard sheet and game settings (F13, F12)", scoreboard()],
  ["13-soft-cap", "Soft-cap warning (F12)", softCap()],
  ["14-adult-confirm", "No Filter confirmation (F4, D-14)", adultConfirm()],
  ["15-decks-too-few", "Not enough cards: Start disabled (D-15)", decks(["no-filter"], 1)],
  ["16-reshuffle", "Every card played: reshuffle prompt (F9)", reshuffle()],
  ["17-under-18", "Under 18 (F1)", underAge()],
  ["18-drink-responsibly", "Info page template: Drink Responsibly", infoPage()],
];
for (const [file, name, body] of screens) {
  write(MOCKS_DIR, `${file}.svg`, svgDoc(W, H, `Shot or Spill mock: ${name}`, body));
}
const board = components();
write(MOCKS_DIR, "19-components.svg", svgDoc(board.w, board.h, "Shot or Spill components", board.body));

console.log(`Wrote ${written.length} files:`);
for (const f of written) console.log(`  ${f}`);
