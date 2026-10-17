/** Brand art and icons (DESIGN.md §1). Decorative unless a label is passed. */
import type { SVGProps } from "react";

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
  shuffle: "M2 6 H6 L14 14 H18 M2 14 H6 L14 6 H18 M15.5 3.5 L18 6 L15.5 8.5 M15.5 11.5 L18 14 L15.5 16.5",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={ICONS[name]} />
    </svg>
  );
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

/** Fiesta bunting across the card back. */
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
