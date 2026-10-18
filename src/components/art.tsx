/**
 * Icons and brand art (DESIGN.md §1).
 *
 * UI icons come from one family, Phosphor, so stroke and style stay
 * consistent. Brand art (tagay glass, water glass, wordmark, bunting) is
 * drawn here. Everything is decorative (aria-hidden) unless a label is
 * passed by the caller.
 */
// Phosphor icons (MIT), imported one SVG at a time so only these ship.
import back from "@phosphor-icons/core/assets/bold/caret-left-bold.svg?raw";
import up from "@phosphor-icons/core/assets/bold/caret-up-bold.svg?raw";
import down from "@phosphor-icons/core/assets/bold/caret-down-bold.svg?raw";
import skip from "@phosphor-icons/core/assets/bold/fast-forward-bold.svg?raw";
import undo from "@phosphor-icons/core/assets/bold/arrow-counter-clockwise-bold.svg?raw";
import scores from "@phosphor-icons/core/assets/bold/chart-bar-bold.svg?raw";
import close from "@phosphor-icons/core/assets/bold/x-bold.svg?raw";
import edit from "@phosphor-icons/core/assets/bold/pencil-simple-bold.svg?raw";
import check from "@phosphor-icons/core/assets/bold/check-bold.svg?raw";
import plus from "@phosphor-icons/core/assets/bold/plus-bold.svg?raw";
import minus from "@phosphor-icons/core/assets/bold/minus-bold.svg?raw";
import shuffle from "@phosphor-icons/core/assets/bold/shuffle-bold.svg?raw";
import drag from "@phosphor-icons/core/assets/bold/dots-six-vertical-bold.svg?raw";
import trash from "@phosphor-icons/core/assets/bold/trash-bold.svg?raw";
import heartOutline from "@phosphor-icons/core/assets/bold/heart-bold.svg?raw";
import flag from "@phosphor-icons/core/assets/bold/flag-bold.svg?raw";
import sound from "@phosphor-icons/core/assets/bold/speaker-high-bold.svg?raw";
import honest from "@phosphor-icons/core/assets/fill/chat-circle-dots-fill.svg?raw";
import secret from "@phosphor-icons/core/assets/fill/lock-key-fill.svg?raw";
import tea from "@phosphor-icons/core/assets/fill/sparkle-fill.svg?raw";
import beer from "@phosphor-icons/core/assets/fill/beer-stein-fill.svg?raw";
import coffee from "@phosphor-icons/core/assets/fill/coffee-fill.svg?raw";
import heart from "@phosphor-icons/core/assets/fill/heart-fill.svg?raw";
import heartBreak from "@phosphor-icons/core/assets/fill/heart-break-fill.svg?raw";
import house from "@phosphor-icons/core/assets/fill/house-fill.svg?raw";
import fire from "@phosphor-icons/core/assets/fill/fire-fill.svg?raw";
import type { DeckId } from "../content/meta";
import { useApp } from "../game/useApp";

/** Pull the path data out of a Phosphor SVG (256-unit viewBox, fill="currentColor"). */
function paths(svg: string): string[] {
  return [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]!);
}

const ICONS = {
  back: paths(back),
  up: paths(up),
  down: paths(down),
  skip: paths(skip),
  undo: paths(undo),
  scores: paths(scores),
  close: paths(close),
  edit: paths(edit),
  check: paths(check),
  plus: paths(plus),
  minus: paths(minus),
  shuffle: paths(shuffle),
  drag: paths(drag),
  trash: paths(trash),
  heart: paths(heartOutline),
  "heart-fill": paths(heart),
  flag: paths(flag),
  sound: paths(sound),
  honest: paths(honest),
  secret: paths(secret),
  tea: paths(tea),
};

export type IconName = keyof typeof ICONS;

function Glyph({ d, size, className }: { d: string[]; size: number; className?: string }) {
  return (
    <svg viewBox="0 0 256 256" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string; weight?: "bold" | "fill" }) {
  return <Glyph d={ICONS[name]} size={size} className={className} />;
}

/** One icon per deck, so decks never rely on color alone (DESIGN.md §2). */
const DECK_ICON: Record<DeckId, string[]> = {
  "warm-up": paths(beer),
  "barkada-tea": paths(coffee),
  "love-life": paths(heartBreak),
  couples: paths(heart),
  "family-adulting": paths(house),
  "no-filter": paths(fire),
  "our-cards": paths(edit),
};

export function DeckIcon({ deck, size = 24, className }: { deck: DeckId; size?: number; className?: string }) {
  return <Glyph d={DECK_ICON[deck]} size={size} className={className} />;
}

/** Tagay glass with an amber pour: the Tanggero mark. */
export function ShotGlass({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false" className={className}>
      <path d="M21 26 L43 26 L41 47 L23 47 Z" className="fill-shot" />
      <path d="M23 47 L41 47 L40.5 52 L23.5 52 Z" className="fill-ink" opacity="0.35" />
      <path d="M17 14 L47 14 L40.5 52 L23.5 52 Z" fill="none" className="stroke-ink" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

/** Tall water glass: the pacing mark. */
export function WaterGlass({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false" className={className}>
      <path d="M19.5 22 Q25 19 32 22 T44.5 22 L42 57 L22 57 Z" className="fill-accent" opacity="0.9" />
      <path d="M17 4 L47 4 L43 60 L21 60 Z" fill="none" className="stroke-ink" strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Stacked neon wordmark: SHOT / or / SPILL. */
export function Wordmark({ size = 82, as: Tag = "div" }: { size?: number; as?: "div" | "h1" }) {
  return (
    <Tag className="flex flex-col items-center leading-none select-none" aria-label="Shot or Spill">
      <span aria-hidden="true" className="neon-glow font-display text-shot" style={{ fontSize: size, letterSpacing: size * 0.03 }}>
        SHOT
      </span>
      <span aria-hidden="true" className="neon-glow font-sans font-extrabold text-ink" style={{ fontSize: size * 0.38, marginTop: -size * 0.08 }}>
        or
      </span>
      <span aria-hidden="true" className="neon-glow font-display text-spill" style={{ fontSize: size, letterSpacing: size * 0.03, marginTop: -size * 0.06 }}>
        SPILL
      </span>
    </Tag>
  );
}

/** Fiesta bunting across the card back and the top of the setup screens. */
export function Bunting({ className }: { className?: string }) {
  const colors = [
    "fill-shot",
    "fill-deck-warm-up",
    "fill-spill",
    "fill-deck-barkada-tea",
    "fill-deck-love-life",
    "fill-deck-family-adulting",
    "fill-deck-no-filter",
  ];
  const n = 9;
  const at = (t: number) => ({ x: 4 + 272 * t, y: 6 + 44 * t * (1 - t) });
  return (
    <svg viewBox="0 0 280 48" className={className} aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <path d="M4 6 Q140 50 276 6" fill="none" className="stroke-muted" strokeWidth="1.5" />
      {Array.from({ length: n }, (_, i) => {
        const p = at((i + 0.5) / n);
        const w = 23;
        return <path key={i} d={`M${p.x - w / 2} ${p.y} L${p.x + w / 2} ${p.y} L${p.x} ${p.y + w * 1.1} Z`} className={colors[i % colors.length]} />;
      })}
    </svg>
  );
}

// Player avatar colors: brand and deck fills, all checked for 4.5:1 with
// near-black text by scripts/check-contrast.ts.
const AVATAR_BG = [
  "bg-shot",
  "bg-spill",
  "bg-accent",
  "bg-deck-warm-up",
  "bg-deck-love-life",
  "bg-deck-family-adulting",
  "bg-deck-no-filter",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : (parts[0]?.[1] ?? "");
  return (first + second).toUpperCase();
}

/**
 * Colored initials circle. Colors go by the order players were added (ids
 * are time-based), so the first 7 players never share a color and a color
 * stays with its player when seats are re-sorted.
 */
export function Avatar({ id, name, size = 36, className }: { id: string; name: string; size?: number; className?: string }) {
  const added = useApp((s) => s.players.map((p) => p.id).sort().indexOf(id));
  const color = AVATAR_BG[(added >= 0 ? added : hash(id)) % AVATAR_BG.length];
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-display text-on-bright ${color} ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initials(name)}
    </span>
  );
}
