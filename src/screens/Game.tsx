/** Game screen and its states (PHASES 3.3–3.4, mocks 05, 07–13, 16). */
import { useState } from "react";
import { getCard } from "../content/cards";
import type { Card } from "../content/meta";
import {
  answerer,
  countdowns,
  eligibleCount,
  HOT_SEAT_QUESTIONS,
  playerById,
  reader,
  stats,
  tanggero,
  tanggeroIndex,
  turnOrder,
} from "../game/engine";
import type { Session } from "../game/types";
import { useApp, useReduced } from "../game/useApp";
import { Avatar, Icon, WaterGlass } from "../components/art";
import { CardStage } from "../components/Card";
import { Dialog, Sheet, Toast } from "../components/overlays";
import { ActionButton, Button, Chip, cx, Stepper, TanggeroBadge, Toggle } from "../components/ui";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * The next few seats in turn order, so the table can see whose turn is
 * coming (turns go around the circle like the tagay).
 */
function UpNext({ session }: { session: Session }) {
  const order = turnOrder(session);
  const next = order.slice(1, Math.min(order.length, 4));
  if (next.length === 0) return null;
  return (
    <div className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-muted">
      <span className="text-label text-[13px]">Up next</span>
      <ol className="flex min-w-0 items-center gap-1.5" aria-label="Up next">
        {next.map((p, i) => (
          <li key={p.id} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <Icon name="down" size={11} className="shrink-0 -rotate-90" />}
            <Avatar id={p.id} name={p.name} size={20} />
            <span className="truncate text-ink">{p.name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function PlayerPicker({
  session,
  selected,
  onToggle,
  tone,
  label,
}: {
  session: Session;
  selected: string[];
  onToggle: (id: string) => void;
  tone: "shot" | "accent";
  label: string;
}) {
  return (
    <fieldset>
      <legend className="text-label mb-3 text-muted">{label}</legend>
      <div className="grid grid-cols-3 gap-2">
        {session.players.map((p) => (
          <Chip key={p.id} selected={selected.includes(p.id)} tone={tone} onClick={() => onToggle(p.id)}>
            {p.name}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

/** What the table taps after reading the card, by card type (PRD §5 logging table). */
function Controls({ session, card }: { session: Session; card: Card }) {
  // Keyed by the drawn card in <Game>, so this state resets on every draw.
  const resolve = useApp((s) => s.resolve);
  const [picked, setPicked] = useState<string[]>([]);
  const [hotShots, setHotShots] = useState(0);

  const nameOf = (id: string) => playerById(session, id)?.name ?? "";
  const shotsLabel = `Take ${plural(card.shots, "shot")}`;

  if (card.type === "water_break") {
    return (
      <Button size="lg" sub="Nothing is logged" onClick={() => resolve({ kind: "water" })}>
        Done · next card
      </Button>
    );
  }

  if (card.type === "everyone_who" || card.type === "most_likely") {
    const names = picked.map(nameOf);
    return (
      <div className="space-y-4">
        <PlayerPicker
          session={session}
          tone="shot"
          label="Who drank? Tap everyone who did"
          selected={picked}
          onToggle={(id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))}
        />
        <Button sub={names.length ? `Logs 1 shot for ${joinNames(names)}` : "Nobody drank"} onClick={() => resolve({ kind: "group", drinkerIds: picked })}>
          Done
        </Button>
      </div>
    );
  }

  if (card.type === "hot_seat") {
    const who = answerer(session);
    const name = who?.name ?? "";
    const spills = HOT_SEAT_QUESTIONS - hotShots;
    return (
      <div className="space-y-3">
        <p className="text-label text-muted" id="hot-seat-label">Shots {name} took</p>
        <Stepper label={`Shots ${name} took`} value={hotShots} min={0} max={HOT_SEAT_QUESTIONS} onChange={setHotShots} />
        <p className="text-center text-sm font-medium text-muted">0 to 3. Each answered question counts as a spill.</p>
        <Button sub={`Logs ${plural(hotShots, "shot")} and ${plural(spills, "spill")} for ${name}`} onClick={() => resolve({ kind: "hotSeat", shots: hotShots })}>
          Done
        </Button>
      </div>
    );
  }

  // Spill or Shot, Double Down.
  const fixed = answerer(session);
  const chosen = card.target === "tanggero" ? (picked[0] ?? null) : (fixed?.id ?? null);
  const forName = chosen ? nameOf(chosen) : "";
  const showFor = card.target !== "current";
  return (
    <div className="space-y-4">
      {card.target === "tanggero" && (
        <PlayerPicker
          session={session}
          tone="accent"
          label={`Who did ${tanggero(session).name} pick?`}
          selected={picked}
          onToggle={(id) => setPicked((p) => (p[0] === id ? [] : [id]))}
        />
      )}
      {card.target === "p1" && <p className="text-label text-accent">{forName} answers</p>}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="spill"
          size="lg"
          disabled={!chosen}
          sub={showFor && forName ? `Logs for ${forName}` : "Answer honestly"}
          onClick={() => resolve({ kind: "choice", choice: "spill", answererId: chosen ?? undefined })}
        >
          Spill
        </Button>
        <Button
          variant="shot"
          size="lg"
          disabled={!chosen}
          sub={showFor && forName ? `${shotsLabel} · ${forName}` : shotsLabel}
          onClick={() => resolve({ kind: "choice", choice: "shot", answererId: chosen ?? undefined })}
        >
          Shot
        </Button>
      </div>
    </div>
  );
}

export function Scoreboard({ session, onClose }: { session: Session; onClose: () => void }) {
  const { setSoftCap, setReducedMotion, endNight, go } = useApp.getState();
  const softCap = useApp((s) => s.softCap);
  const reduced = useReduced();
  const st = stats(session);
  const t = tanggeroIndex(session);
  const cd = countdowns(session);
  return (
    <Sheet title="SCOREBOARD" onClose={onClose}>
      <table className="mt-4 w-full border-separate border-spacing-y-1 text-left">
        <caption className="sr-only">Spills and shots per player</caption>
        <thead>
          <tr className="text-label text-muted">
            <th scope="col" className="font-normal">Player</th>
            <th scope="col" className="w-16 text-center font-normal">Spills</th>
            <th scope="col" className="w-16 text-center font-normal">Shots</th>
          </tr>
        </thead>
        <tbody>
          {session.players.map((p, i) => {
            const s = st.get(p.id)!;
            const isReader = i === session.readerIndex;
            const capped = s.shots >= softCap;
            return (
              <tr key={p.id} className={cx(isReader && "bg-raised")}>
                <th scope="row" className="rounded-l-sm py-2 pl-2 text-[17px] font-bold text-ink">
                  <span className="inline-flex items-center gap-2">
                    <Avatar id={p.id} name={p.name} size={28} />
                    {p.name}
                    {i === t && (
                      <span className="grid h-[22px] w-6 place-items-center rounded-full border-[1.5px] border-accent font-display text-[13px] text-accent" title="Tanggero">
                        T<span className="sr-only"> (Tanggero)</span>
                      </span>
                    )}
                    {isReader && <span className="text-[13px] font-semibold text-muted">reading</span>}
                  </span>
                </th>
                <td className="text-center font-display text-2xl text-spill">{s.spills}</td>
                <td className="rounded-r-sm text-center">
                  <span className={cx("inline-grid size-9 place-items-center rounded-full font-display text-2xl text-shot", capped && "border-2 border-danger")}>
                    {s.shots}
                    {capped && <span className="sr-only"> (at the shot warning)</span>}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-[13px] font-semibold text-muted">
        Card {session.log.length + 1} · New Tanggero in {cd.tanggero} · Water Break in {cd.waterBreak}
      </p>
      <div className="my-4 h-px bg-line" />
      <h3 className="text-label text-muted">Game settings</h3>
      <div className="mt-3 flex items-center justify-between gap-4">
        <span className="text-base font-semibold text-ink">Shot warning at</span>
        <div className="w-[160px]">
          <Stepper label="Shot warning" size="md" value={softCap} min={1} max={30} onChange={setSoftCap} />
        </div>
      </div>
      <div className="mt-3">
        <Toggle label="Reduced motion" hint="Fades instead of flips" checked={reduced} onChange={setReducedMotion} />
      </div>
      <Button variant="danger" className="mt-5" onClick={() => { onClose(); endNight(); }}>
        End the night
      </Button>
      <nav aria-label="Help" className="mt-2 flex flex-wrap justify-center gap-x-1 text-sm font-semibold">
        <button type="button" className="min-h-12 px-2 text-accent" onClick={() => { onClose(); go("players"); }}>Change seating</button>
        <button type="button" className="min-h-12 px-2 text-accent" onClick={() => { onClose(); go("howto"); }}>How to play</button>
        <a href="#drink-responsibly" className="inline-flex min-h-12 items-center px-2 text-accent">Drink Responsibly</a>
        <a href="#terms" className="inline-flex min-h-12 items-center px-2 text-accent">Terms</a>
      </nav>
    </Sheet>
  );
}

function SoftCapDialog({ session }: { session: Session }) {
  const dismissWarning = useApp((s) => s.dismissWarning);
  const id = session.pendingWarnings[0]!;
  const player = playerById(session, id);
  const shots = stats(session).get(id)?.shots ?? 0;
  if (!player) return null;
  return (
    <Dialog
      title={`${player.name.toUpperCase()}, THAT'S ${shots}.`}
      onClose={dismissWarning}
      icon={<WaterGlass size={60} />}
      actions={
        <>
          <Button onClick={dismissWarning}>Water round</Button>
          <Button variant="ghost" onClick={dismissWarning}>Keep playing</Button>
        </>
      }
    >
      {plural(shots, "shot")} so far tonight. Water round for you?
    </Dialog>
  );
}

function ReshuffleDialog({ session }: { session: Session }) {
  const { reshuffle, changeDecks, endNight } = useApp.getState();
  const total = eligibleCount(session.config.decks, session.config.intensity, session.players.length);
  return (
    <Dialog
      title="THAT'S EVERY CARD"
      onClose={reshuffle}
      icon={<span className="grid size-14 place-items-center rounded-full bg-raised text-accent"><Icon name="shuffle" size={30} /></span>}
      actions={
        <>
          <Button onClick={reshuffle}>Shuffle again</Button>
          <Button variant="secondary" onClick={changeDecks}>Change decks</Button>
          <Button variant="ghost" onClick={endNight}>End the night</Button>
        </>
      }
    >
      You've played all {total} cards in these decks. Shuffle them again, or switch decks.
    </Dialog>
  );
}

function undoMessage(session: Session): string {
  const last = session.log.at(-1);
  if (!last) return "Undid the last card";
  const r = last.results;
  if (r.length === 1) {
    const name = playerById(session, r[0]!.playerId)?.name ?? "the";
    const what = r[0]!.spills > 0 && r[0]!.shots > 0 ? "Hot Seat" : r[0]!.shots > 0 ? "shot" : "spill";
    return `Undid ${name}'s ${what}`;
  }
  return r.length > 1 ? `Undid ${plural(r.length, "shot")}` : "Undid the last card";
}

export function Game() {
  const session = useApp((s) => s.session);
  const { flip, skip, undo } = useApp.getState();
  const reduced = useReduced();
  const [scores, setScores] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!session) return null;
  const drawn = session.current;
  const card = drawn ? getCard(drawn.cardId) : null;
  const who = reader(session);
  const faceUp = !!drawn?.faceUp;
  const water = card?.type === "water_break";
  const compact = faceUp && !!card && (card.type === "everyone_who" || card.type === "most_likely" || card.type === "hot_seat" || card.target === "tanggero");
  const total = eligibleCount(session.config.decks, session.config.intensity, session.players.length);
  const cardNumber = total - session.queue.length;

  const doUndo = () => {
    setToast(undoMessage(session));
    undo();
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-app flex-col px-5 pt-4">
      <header>
        <div className="flex items-center justify-between gap-3">
          <p className="text-label truncate text-muted">{faceUp ? "Now reading" : "Pass the phone to"}</p>
          <TanggeroBadge name={tanggero(session).name} />
        </div>
        <div className="mt-1 flex min-w-0 items-center gap-3">
          <Avatar id={who.id} name={who.name} size={40} />
          <h1 className="min-w-0 truncate font-display text-[44px] leading-[1.1] text-ink">{who.name.toUpperCase()}</h1>
        </div>
      </header>
      <UpNext session={session} />

      <div className={cx("relative my-3 flex-1", compact ? "min-h-[260px]" : "min-h-[340px]")}>
        {drawn && card ? (
          <CardStage
            drawn={drawn}
            readerName={who.name}
            compact={compact}
            reduced={reduced}
            canSkip={faceUp && !water}
            onFlip={flip}
            onSkip={skip}
          />
        ) : (
          <div className="absolute inset-0 rounded-card border-2 border-dashed border-line" />
        )}
      </div>

      <div className="pad-safe-bottom">
        {drawn && card && faceUp && <Controls key={`${drawn.cardId}:${drawn.text}`} session={session} card={card} />}
        {drawn && !faceUp && (
          <p className="flex min-h-[72px] items-center justify-center text-[15px] font-semibold text-muted">
            Tap or swipe the card to flip it
          </p>
        )}
        <div className="mt-2 flex">
          {faceUp && !water && <ActionButton icon="skip" onClick={skip}>Skip</ActionButton>}
          <ActionButton icon="undo" disabled={!session.previous} onClick={doUndo}>Undo</ActionButton>
          <ActionButton icon="scores" onClick={() => setScores(true)}>Scores</ActionButton>
        </div>
        {!water && cardNumber > 0 && (
          <p className="mt-1 text-center text-[13px] font-semibold text-muted">
            Card {cardNumber} of {total}
          </p>
        )}
      </div>

      {scores && <Scoreboard session={session} onClose={() => setScores(false)} />}
      {!scores && session.pendingWarnings.length > 0 && <SoftCapDialog key={session.pendingWarnings[0]} session={session} />}
      {!scores && session.pendingWarnings.length === 0 && session.exhausted && <ReshuffleDialog session={session} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </main>
  );
}
