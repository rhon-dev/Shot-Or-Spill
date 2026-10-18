/**
 * The card: back (tap or swipe to flip) and face (swipe left to skip).
 * Flip is 320 ms rotateY; reduced motion swaps it for a 150 ms crossfade
 * (DESIGN.md §5). Only transform and opacity animate.
 */
import { m, type PanInfo } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { getCard } from "../content/cards";
import { DECKS, type CardType, type DeckId } from "../content/meta";
import { cardText, cardTextSize, motion as motionTokens } from "../design/tokens";
import type { Drawn } from "../game/types";
import { Bunting, ShotGlass, WaterGlass, Wordmark } from "./art";
import { cx } from "./ui";

// Literal class names so Tailwind can find them.
const DECK_BG: Record<DeckId, string> = {
  "warm-up": "bg-deck-warm-up",
  "barkada-tea": "bg-deck-barkada-tea",
  "love-life": "bg-deck-love-life",
  couples: "bg-deck-couples",
  "family-adulting": "bg-deck-family-adulting",
  "no-filter": "bg-deck-no-filter",
};
const DECK_BORDER: Record<DeckId, string> = {
  "warm-up": "border-deck-warm-up",
  "barkada-tea": "border-deck-barkada-tea",
  "love-life": "border-deck-love-life",
  couples: "border-deck-couples",
  "family-adulting": "border-deck-family-adulting",
  "no-filter": "border-deck-no-filter",
};
export { DECK_BG, DECK_BORDER };

export const TYPE_LABEL: Record<CardType, string> = {
  spill_or_shot: "Spill or Shot",
  everyone_who: "Everyone Who",
  most_likely: "Most Likely To",
  hot_seat: "Hot Seat",
  double_down: "Double Down",
  water_break: "Pacing",
};

const TYPE_HINT: Record<CardType, string> = {
  spill_or_shot: "Answer honestly, or take a shot.",
  double_down: "Answer, or take 2 shots.",
  everyone_who: "Everyone it applies to drinks.",
  most_likely: "Point on 3. Most votes drinks or explains.",
  hot_seat: "3 questions from the group. A shot skips one.",
  water_break: "Pacing card. No exceptions.",
};

const EASE = [0.2, 0.8, 0.2, 1] as const;

function passedSwipe(info: PanInfo): -1 | 0 | 1 {
  const { offset, velocity } = info;
  if (Math.abs(offset.x) > motionTokens.swipeDistancePx || Math.abs(velocity.x) > motionTokens.swipeVelocityPxPerS) {
    return offset.x < 0 ? -1 : 1;
  }
  return 0;
}

export function CardBack({ className }: { className?: string }) {
  return (
    <div className={cx("relative flex h-full w-full flex-col items-center overflow-hidden rounded-card border-[3px] border-accent bg-surface shadow-[0_0_18px_rgba(34,211,197,0.45)]", className)}>
      <div className="pointer-events-none absolute inset-3 rounded-[16px] border-[1.5px] border-dashed border-line" />
      <Bunting className="mt-5 h-12 w-[86%]" />
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <ShotGlass size={72} />
        <Wordmark size={52} />
      </div>
      <p className="text-label mb-6 text-[13px] text-muted">18+ · Barkada card game</p>
    </div>
  );
}

export function CardFace({
  drawn,
  compact = false,
  className,
  textId,
}: {
  drawn: Drawn;
  compact?: boolean;
  className?: string;
  textId?: string;
}) {
  const card = getCard(drawn.cardId);
  const water = card.type === "water_break";
  const size = cardTextSize(drawn.text, compact);
  return (
    <div className={cx("flex h-full w-full flex-col rounded-card border-2 bg-surface p-5", water ? "border-accent" : DECK_BORDER[card.deck], className)}>
      <div className="flex items-center justify-between gap-3">
        <span className={cx("rounded-full px-3 py-1 font-display text-[14px] uppercase tracking-[1px] text-on-bright", water ? "bg-accent" : DECK_BG[card.deck])}>
          {water ? "Water Break" : DECKS[card.deck].name}
        </span>
        <span className="text-label text-right text-muted">{TYPE_LABEL[card.type]}</span>
      </div>
      {water && <WaterGlass size={64} className="mx-auto mt-5" />}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto py-3">
        <p
          id={textId}
          className="text-center text-ink [text-wrap:balance]"
          style={{ fontSize: size, lineHeight: cardText.lineHeight, fontWeight: cardText.weight }}
        >
          {drawn.text}
        </p>
      </div>
      {!compact && <p className="text-center text-sm font-medium text-muted">{TYPE_HINT[card.type]}</p>}
    </div>
  );
}

/**
 * The card on the table, with flip and swipe. `drawKey` changes on every new
 * draw so the next card animates in.
 */
export function CardStage({
  drawn,
  readerName,
  compact,
  reduced,
  canSkip,
  onFlip,
  onSkip,
}: {
  drawn: Drawn;
  readerName: string;
  compact: boolean;
  reduced: boolean;
  canSkip: boolean;
  onFlip: () => void;
  onSkip: () => void;
}) {
  const faceRef = useRef<HTMLDivElement>(null);
  const textId = useId();
  const drawKey = `${drawn.cardId}:${drawn.text}`;
  const firstRun = useRef(true);

  // When a question appears (flip or skip), move focus to it so screen readers
  // read it out (DESIGN.md §6). Not on first load, so a restore doesn't jump.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (drawn.faceUp) faceRef.current?.focus({ preventScroll: true });
  }, [drawKey, drawn.faceUp]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dir = passedSwipe(info);
    if (!dir) return;
    if (!drawn.faceUp) onFlip();
    else if (dir < 0 && canSkip) onSkip();
  };

  const flipT = { duration: motionTokens.flipMs / 1000, ease: EASE };
  const fadeT = { duration: motionTokens.reducedFadeMs / 1000 };

  const back = (
    <button
      type="button"
      onClick={onFlip}
      aria-label={`Flip the card. ${readerName}, it's your turn.`}
      className="block h-full w-full rounded-card"
    >
      <CardBack />
    </button>
  );
  const face = (
    <div ref={faceRef} tabIndex={-1} className="h-full w-full rounded-card outline-none" role="group" aria-labelledby={textId}>
      <CardFace drawn={drawn} compact={compact} textId={textId} />
    </div>
  );

  return (
    <m.div
      key={drawKey}
      className="absolute inset-0 touch-pan-y [perspective:1200px]"
      drag={drawn.faceUp && !canSkip ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.55}
      onDragEnd={onDragEnd}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: (reduced ? motionTokens.reducedFadeMs : motionTokens.swipeOutMs) / 1000, ease: EASE }}
    >
      {reduced ? (
        <m.div key={drawn.faceUp ? "face" : "back"} className="h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fadeT}>
          {drawn.faceUp ? face : back}
        </m.div>
      ) : (
        <m.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          initial={false}
          animate={{ rotateY: drawn.faceUp ? 180 : 0 }}
          transition={flipT}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]" aria-hidden={drawn.faceUp} inert={drawn.faceUp}>
            {back}
          </div>
          <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]" aria-hidden={!drawn.faceUp} inert={!drawn.faceUp}>
            {face}
          </div>
        </m.div>
      )}
    </m.div>
  );
}
