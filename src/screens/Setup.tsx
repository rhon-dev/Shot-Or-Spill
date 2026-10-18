/** Age gate, under-18, players + seating, decks, and How to Play (PHASES 3.2, mocks 01–04, 14, 15, 17). */
import { useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from "react";
import { CUSTOM_DECK_ID, DECK_IDS, DECKS, type DeckId, type Intensity } from "../content/meta";
import { layout } from "../design/tokens";
import { eligibleCount, MAX_PLAYERS, MIN_ELIGIBLE, MIN_PLAYERS, tanggero } from "../game/engine";
import { CUSTOM_MAX, CUSTOM_TEXT_MAX, customCardError, needsAdultOk, sameRoster } from "../game/store";
import type { Card } from "../content/meta";
import type { Player } from "../game/types";
import { useApp } from "../game/useApp";
import { Avatar, Bunting, DeckIcon, Icon, ShotGlass, Wordmark } from "../components/art";
import { DECK_BG, DECK_BORDER } from "../components/Card";
import { Dialog } from "../components/overlays";
import { AdultBadge, Button, cx, IconButton, ScreenLayout, Segmented } from "../components/ui";

export function InfoLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="About Shot or Spill" className={cx("flex flex-wrap justify-center gap-x-1 text-sm font-semibold", className)}>
      <a href="#about" className="inline-flex min-h-12 items-center px-2 text-accent hover:underline">About</a>
      <span aria-hidden="true" className="self-center text-muted">·</span>
      <a href="#drink-responsibly" className="inline-flex min-h-12 items-center px-2 text-accent hover:underline">Drink Responsibly</a>
      <span aria-hidden="true" className="self-center text-muted">·</span>
      <a href="#terms" className="inline-flex min-h-12 items-center px-2 text-accent hover:underline">Terms</a>
    </nav>
  );
}

const PLEDGE = ["No one drives tonight.", "Skipping is always okay.", "Drink water."];

export function AgeGate() {
  const confirmAge = useApp((s) => s.confirmAge);
  const declareUnder18 = useApp((s) => s.declareUnder18);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-app flex-col items-center px-5 pt-4 text-center">
      <Bunting className="h-10 w-full" />
      <ShotGlass size={52} className="mt-4" />
      <div className="mt-1">
        <Wordmark size={82} as="h1" />
      </div>
      <span className="mt-4 rounded-full border-[1.5px] border-deck-no-filter px-4 py-0.5 font-display text-sm tracking-[1.4px] text-deck-no-filter">
        18+ ONLY
      </span>
      <p className="mt-3 max-w-[290px] text-base font-medium text-muted">
        The barkada card game. Pass the phone around the table, then answer honestly or take a shot.
      </p>

      <section aria-labelledby="pledge" className="glass-card mt-6 w-full rounded-lg p-5 text-left">
        <h2 id="pledge" className="text-label text-accent">Tonight's pledge</h2>
        <ul className="mt-3 space-y-2.5">
          {PLEDGE.map((line) => (
            <li key={line} className="flex items-center gap-3 text-[17px] font-semibold text-ink">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                <Icon name="check" size={14} />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-auto w-full pt-6 pad-safe-bottom">
        <Button size="lg" sub="and I'm taking the pledge" onClick={confirmAge}>
          I'm 18 or older
        </Button>
        <Button variant="ghost" className="mt-2" onClick={declareUnder18}>
          I'm under 18
        </Button>
        <InfoLinks className="mt-1" />
      </div>
    </main>
  );
}

export function UnderAge() {
  const go = useApp((s) => s.go);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-app flex-col items-center px-5 pt-16 text-center">
      <Wordmark size={56} />
      <h1 className="mt-10 font-display text-[36px] text-ink">COME BACK AT 18</h1>
      <p className="mt-4 max-w-[280px] text-[17px] font-medium text-muted">
        Shot or Spill is a drinking game for adults 18 and over. See you in a few years.
      </p>
      <div className="mt-auto w-full pt-6 pad-safe-bottom">
        <Button variant="secondary" onClick={() => go("age")}>
          Go back
        </Button>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Players and seating order
// ---------------------------------------------------------------------------

/** Row height (56) + gap (8). Drag math depends on rows staying this tall. */
const ROW = 64;

function RenameForm({ player, onDone }: { player: Player; onDone: () => void }) {
  const renamePlayer = useApp((s) => s.renamePlayer);
  const removePlayer = useApp((s) => s.removePlayer);
  const [draft, setDraft] = useState(player.name);
  const [error, setError] = useState<string | null>(null);
  const save = (e: FormEvent) => {
    e.preventDefault();
    const err = renamePlayer(player.id, draft);
    setError(err);
    if (!err) onDone();
  };
  return (
    <form onSubmit={save} className="rounded-md border-2 border-accent bg-surface p-2">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`edit-${player.id}`}>Rename {player.name}</label>
        <input
          id={`edit-${player.id}`}
          autoFocus
          value={draft}
          maxLength={layout.playerNameMax + 4}
          aria-invalid={!!error}
          aria-describedby={error ? `edit-${player.id}-err` : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onDone()}
          className="min-h-12 min-w-0 flex-1 rounded-sm bg-bg px-3 text-[17px] font-semibold text-ink outline-none"
        />
        <Button type="submit" size="sm" block={false} className="shrink-0 px-4">Save</Button>
      </div>
      {error && <p id={`edit-${player.id}-err`} role="alert" className="px-1 pt-2 text-sm font-semibold text-danger">{error}</p>}
      <div className="mt-1 flex justify-between">
        <button type="button" onClick={() => removePlayer(player.id)} className="flex min-h-12 items-center gap-2 px-2 text-sm font-semibold text-danger">
          <Icon name="trash" size={18} /> Remove {player.name}
        </button>
        <button type="button" onClick={onDone} className="min-h-12 px-2 text-sm font-semibold text-muted">Cancel</button>
      </div>
    </form>
  );
}

/**
 * Seating order, numbered 1 to 12. Turns go around in this order, so the
 * host sorts it to match the table; nothing is shuffled. Ways to move
 * someone: pick a seat number, drag the handle, the up/down buttons, or
 * arrow keys on the handle (everything but drag works without dragging).
 */
function SeatList({ players, tanggeroId, onAnnounce }: { players: Player[]; tanggeroId: string | null; onAnnounce: (msg: string) => void }) {
  const { movePlayer, setPlayerOrder, setSeat: storeSetSeat } = useApp.getState();
  const setSeat = (id: string, seat: number) => {
    storeSetSeat(id, seat);
    announceSeat(id, seat);
  };
  const [editing, setEditing] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; from: number; startY: number; dy: number } | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const ids = players.map((p) => p.id);
  const shift = drag ? Math.max(-drag.from, Math.min(ids.length - 1 - drag.from, Math.round(drag.dy / ROW))) : 0;
  const order = drag ? (() => {
    const next = ids.filter((id) => id !== drag.id);
    next.splice(drag.from + shift, 0, drag.id);
    return next;
  })() : ids;
  const byId = new Map(players.map((p) => [p.id, p]));

  const announceSeat = (id: string, seat: number) => {
    const p = byId.get(id);
    if (p) onAnnounce(`${p.name} moved to seat ${seat}.`);
  };

  const move = (id: string, delta: -1 | 1) => {
    const i = ids.indexOf(id);
    const to = i + delta;
    if (to < 0 || to >= ids.length) return;
    movePlayer(id, delta);
    announceSeat(id, to + 1);
  };

  const onHandleDown = (e: PointerEvent<HTMLButtonElement>, id: string) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setEditing(null);
    setDrag({ id, from: ids.indexOf(id), startY: e.clientY, dy: 0 });
  };
  const onHandleMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    setDrag({ ...drag, dy: e.clientY - drag.startY });
  };
  const onHandleUp = () => {
    if (!drag) return;
    if (shift !== 0) {
      setPlayerOrder(order);
      announceSeat(drag.id, drag.from + shift + 1);
    }
    setDrag(null);
  };
  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      move(id, e.key === "ArrowUp" ? -1 : 1);
      // Keep focus on the moved row's handle after it re-renders.
      requestAnimationFrame(() => listRef.current?.querySelector<HTMLButtonElement>(`[data-handle="${id}"]`)?.focus());
    }
  };

  return (
    <ol ref={listRef} aria-label="Seating order" className="relative flex flex-col gap-2">
      {order.map((id, i) => {
        const p = byId.get(id)!;
        const dragging = drag?.id === id;
        if (editing === id) {
          return (
            <li key={id}>
              <RenameForm player={p} onDone={() => setEditing(null)} />
            </li>
          );
        }
        return (
          <li
            key={id}
            className={cx(
              "flex h-14 items-center gap-1 rounded-md pr-1 transition-[background-color,box-shadow]",
              dragging ? "z-10 bg-raised shadow-[0_8px_24px_rgba(0,0,0,0.5)] ring-2 ring-accent" : "bg-raised",
            )}
            style={dragging ? { transform: `translateY(${drag.dy - shift * ROW}px)` } : undefined}
          >
            <button
              type="button"
              data-handle={id}
              aria-label={`Move ${p.name}, seat ${i + 1} of ${order.length}. Use the arrow keys.`}
              onPointerDown={(e) => onHandleDown(e, id)}
              onPointerMove={onHandleMove}
              onPointerUp={onHandleUp}
              onPointerCancel={() => setDrag(null)}
              onKeyDown={(e) => onHandleKey(e, id)}
              className={cx("grid h-14 w-10 shrink-0 touch-none place-items-center rounded-l-md text-muted", dragging ? "cursor-grabbing" : "cursor-grab")}
            >
              <Icon name="drag" size={22} />
            </button>
            <label className="sr-only" htmlFor={`seat-${id}`}>Seat number for {p.name}</label>
            <select
              id={`seat-${id}`}
              value={i + 1}
              onChange={(e) => setSeat(id, Number(e.target.value))}
              className="seat-select h-11 w-11 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-line-strong bg-bg text-center font-display text-xl text-ink outline-none focus-visible:border-accent"
            >
              {order.map((_, n) => (
                <option key={n} value={n + 1}>{n + 1}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setEditing(id)}
              className="flex min-h-12 min-w-0 flex-1 flex-col justify-center pl-2.5 text-left"
              aria-label={`${p.name}, seat ${i + 1}${i === 0 ? ", reads first" : ""}${id === tanggeroId ? ", Tanggero" : ""}. Tap to rename or remove.`}
            >
              <span className="truncate text-[17px] font-bold text-ink">{p.name}</span>
              <span className="flex gap-2 text-[12px] font-semibold">
                {i === 0 && <span className="text-shot">Reads first</span>}
                {id === tanggeroId && <span className="text-accent">Tanggero</span>}
                {i !== 0 && id !== tanggeroId && <span className="text-muted">Seat {i + 1}</span>}
              </span>
            </button>
            <IconButton icon="up" label={`Move ${p.name} up`} disabled={i === 0} onClick={() => move(id, -1)} className="w-11 text-muted disabled:opacity-25" />
            <IconButton icon="down" label={`Move ${p.name} down`} disabled={i === order.length - 1} onClick={() => move(id, 1)} className="w-11 text-muted disabled:opacity-25" />
          </li>
        );
      })}
    </ol>
  );
}

/** Small preview of the turn order, wrapping back to the start like a round of tagay. */
function RoundPreview({ players }: { players: Player[] }) {
  if (players.length < 2) return null;
  return (
    <div aria-hidden="true" className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1">
      {players.map((p, i) => (
        <span key={p.id} className="flex shrink-0 items-center gap-1.5">
          <Avatar id={p.id} name={p.name} size={28} />
          {i < players.length - 1 && <Icon name="down" size={12} className="-rotate-90 text-muted" />}
        </span>
      ))}
      <span className="ml-1 shrink-0 text-[12px] font-semibold text-muted">then back to {players[0]!.name}</span>
    </div>
  );
}

/**
 * The host picks the Tanggero (D-23). Default is seat 1. Mid-night this
 * shows and changes the live Tanggero.
 */
export function TanggeroPicker({ players, selected, onAnnounce }: { players: Player[]; selected: string | null; onAnnounce: (msg: string) => void }) {
  const setTanggero = useApp((s) => s.setTanggero);
  if (players.length < MIN_PLAYERS) return null;
  return (
    <section className="glass-card mt-5 rounded-md border-[1.5px] border-accent/60 p-4" aria-labelledby="tanggero-pick">
      <div className="flex items-center gap-2">
        <ShotGlass size={26} />
        <h2 id="tanggero-pick" className="text-label text-accent">Who's the Tanggero?</h2>
      </div>
      <p className="mt-1 text-sm font-medium text-muted">
        Pours for the table and picks who answers on some cards. Passes to the next seat every 10 cards, and you can change it anytime.
      </p>
      <div role="radiogroup" aria-labelledby="tanggero-pick" className="mt-3 flex flex-wrap gap-2">
        {players.map((p) => {
          const on = p.id === selected;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                setTanggero(p.id);
                onAnnounce(`${p.name} is the Tanggero.`);
              }}
              className={cx(
                "flex min-h-12 max-w-full items-center gap-2 rounded-full border-2 py-1 pr-4 pl-1 text-[15px] font-bold transition-colors",
                on ? "border-accent bg-accent/15 text-ink" : "border-line-strong text-muted hover:text-ink",
              )}
            >
              <Avatar id={p.id} name={p.name} size={30} />
              <span className="truncate">{p.name}</span>
              {on && <Icon name="check" size={16} className="shrink-0 text-accent" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function Players() {
  const players = useApp((s) => s.players);
  const session = useApp((s) => s.session);
  const tanggeroPick = useApp((s) => s.tanggeroId);
  const { addPlayer, applySeating, go } = useApp.getState();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const full = players.length >= MAX_PLAYERS;
  const midNight = !!session && sameRoster(session.players, players);
  const rosterChanged = !!session && !midNight;
  const tanggeroId = midNight ? tanggero(session!).id : (tanggeroPick ?? players[0]?.id ?? null);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const err = addPlayer(name);
    setError(err);
    if (!err) {
      setAnnouncement(`${name.trim()} added to seat ${players.length + 1}.`);
      setName("");
    }
  };

  return (
    <ScreenLayout
      title="WHO'S DRINKING?"
      step={midNight ? "SEATING" : "STEP 1 OF 2"}
      onBack={midNight ? () => go("game") : undefined}
      footer={
        midNight ? (
          <Button size="lg" sub="Scores carry over" onClick={applySeating}>Back to the game</Button>
        ) : (
          <Button size="lg" disabled={players.length < MIN_PLAYERS} onClick={() => go("decks")}>
            Next: pick decks
          </Button>
        )
      }
    >
      <p className="mt-2 text-base font-medium text-muted">
        Add everyone, then sort them in the order you're sitting. Turns go around the table, like the tagay.
      </p>

      <form onSubmit={add} className="mt-5 flex gap-3" noValidate>
        <label htmlFor="new-player" className="sr-only">Player name</label>
        <input
          id="new-player"
          value={name}
          disabled={full}
          placeholder={full ? "That's everyone (12)" : "Player name"}
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="done"
          maxLength={layout.playerNameMax + 4}
          aria-invalid={!!error}
          aria-describedby={error ? "new-player-err" : undefined}
          onChange={(e) => { setName(e.target.value); setError(null); }}
          className={cx(
            "min-h-[54px] min-w-0 flex-1 rounded-md border-2 bg-surface px-4 text-[17px] font-semibold text-ink outline-none transition-colors placeholder:font-medium placeholder:text-muted",
            error ? "border-danger" : "border-line-strong focus:border-accent",
          )}
        />
        <Button type="submit" disabled={full} block={false} className="min-h-[54px] w-[84px] shrink-0">Add</Button>
      </form>
      <p id="new-player-err" role="alert" className="mt-2 min-h-5 text-sm font-semibold text-danger">{error}</p>

      {players.length > 0 && (
        <h2 className="text-label mt-1 mb-3 text-muted">Seating order · {players.length} of {MAX_PLAYERS}</h2>
      )}

      <SeatList players={players} tanggeroId={tanggeroId} onAnnounce={setAnnouncement} />
      <RoundPreview players={players} />

      <p className="mt-4 text-sm font-medium text-muted">
        {players.length < MIN_PLAYERS
          ? `Add at least ${MIN_PLAYERS} players to start.`
          : "Tap a seat number, drag the handle, or use the arrows to move someone. Tap a name to rename or remove."}
      </p>
      <TanggeroPicker players={players} selected={tanggeroId} onAnnounce={setAnnouncement} />
      {midNight && <p className="mt-2 text-sm font-semibold text-accent">Re-sorting keeps tonight's scores.</p>}
      {rosterChanged && <p className="mt-2 text-sm font-semibold text-shot">Changing who's playing starts a new night.</p>}
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </ScreenLayout>
  );
}

// ---------------------------------------------------------------------------
// Decks
// ---------------------------------------------------------------------------

const INTENSITIES: { value: Intensity; label: string; hint: string }[] = [
  { value: 1, label: "Chill", hint: "Light and safe. Nothing spicy." },
  { value: 2, label: "Spicy", hint: "Tea, exes, a little heat." },
  { value: 3, label: "No Filter", hint: "Adults only. Bold questions." },
];

type Pending = { deck: DeckId } | { intensity: Intensity };

export function Decks() {
  const decks = useApp((s) => s.decks);
  const intensity = useApp((s) => s.intensity);
  const players = useApp((s) => s.players);
  const adultOk = useApp((s) => s.adultOk);
  const session = useApp((s) => s.session);
  const customCount = useApp((s) => s.customCards.length);
  const { toggleDeck, setIntensity, confirmAdult, startNight, go } = useApp.getState();
  const [pending, setPending] = useState<Pending | null>(null);

  const count = eligibleCount(decks, intensity, players.length);
  const enough = count >= MIN_ELIGIBLE;
  const continuing = !!session && sameRoster(session.players, players);

  const apply = (choice: Pending) => ("deck" in choice ? toggleDeck(choice.deck) : setIntensity(choice.intensity));
  const request = (choice: Pending) => {
    const turningOn = "deck" in choice ? !decks.includes(choice.deck) : true;
    if (turningOn && !adultOk && needsAdultOk(choice)) setPending(choice);
    else apply(choice);
  };

  return (
    <ScreenLayout
      title="PICK YOUR DECKS"
      step="STEP 2 OF 2"
      onBack={() => go(continuing ? "game" : "players")}
      footer={
        <>
          <p aria-live="polite" className={cx("mb-3 text-center text-[15px] font-bold", enough ? "text-ink" : "text-danger")}>
            {count} {count === 1 ? "card" : "cards"} ready{!enough && ` · you need at least ${MIN_ELIGIBLE}`}
          </p>
          <Button size="lg" disabled={!enough} onClick={startNight}>
            {continuing ? "Back to the game" : "Start the night"}
          </Button>
        </>
      }
    >
      <div className="mt-5 space-y-2">
        {DECK_IDS.map((id) => {
          const meta = DECKS[id];
          const on = decks.includes(id);
          const n = eligibleCount([id], intensity, players.length);
          const isCustom = id === CUSTOM_DECK_ID;
          const empty = isCustom && customCount === 0;
          // Empty custom deck: the tile opens the editor instead of selecting nothing.
          const onClick = empty ? () => go("custom") : () => request({ deck: id });
          return (
            <button
              key={id}
              type="button"
              aria-pressed={empty ? undefined : on}
              onClick={onClick}
              className={cx(
                "flex min-h-[72px] w-full items-center gap-3.5 rounded-md px-3.5 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.99]",
                on ? cx("border-2 bg-raised", DECK_BORDER[id]) : "border-[1.5px] border-line bg-surface hover:border-line-strong",
              )}
            >
              <span aria-hidden="true" className={cx("grid size-11 shrink-0 place-items-center rounded-[12px] text-on-bright", DECK_BG[id])}>
                <DeckIcon deck={id} size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-display text-[21px] uppercase tracking-[0.6px] text-ink">{meta.name}</span>
                  {meta.adultOptIn && <AdultBadge />}
                </span>
                <span className="block truncate text-[13px] font-medium text-muted">
                  {isCustom ? (empty ? "Tap to write your own" : `${customCount} ${customCount === 1 ? "card" : "cards"} · ${meta.tagline}`) : `${n} ${n === 1 ? "card" : "cards"} · ${meta.tagline}`}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={cx(
                  "grid size-7 shrink-0 place-items-center rounded-full transition-colors",
                  empty ? "text-accent" : on ? cx(DECK_BG[id], "text-on-bright") : "border-2 border-line-strong",
                )}
              >
                {empty ? <Icon name="plus" size={18} /> : on && <Icon name="check" size={16} />}
              </span>
            </button>
          );
        })}
      </div>
      {customCount > 0 && (
        <button type="button" onClick={() => go("custom")} className="mt-2 flex min-h-12 items-center gap-1.5 px-1 text-sm font-semibold text-accent">
          <Icon name="edit" size={16} /> Edit your cards
        </button>
      )}

      <h2 className="text-label mt-6 mb-3 text-muted">Intensity</h2>
      <Segmented
        label="Intensity"
        value={intensity}
        options={INTENSITIES.map((i) => ({ value: i.value, label: i.label }))}
        onChange={(v) => request({ intensity: v })}
      />
      <p className="mt-3 text-sm font-medium text-muted">{INTENSITIES[intensity - 1]!.hint}</p>

      {pending && (
        <Dialog
          title="NO FILTER IS FOR ADULTS"
          onClose={() => setPending(null)}
          icon={
            <span className="grid size-14 place-items-center rounded-full border-[2.5px] border-deck-no-filter font-display text-2xl text-deck-no-filter">
              18+
            </span>
          }
          actions={
            <>
              <Button
                onClick={() => {
                  confirmAdult();
                  apply(pending);
                  setPending(null);
                }}
              >
                Everyone's okay
              </Button>
              <Button variant="ghost" onClick={() => setPending(null)}>
                Not tonight
              </Button>
            </>
          }
        >
          <p>Bold questions about body count, cheating, regrets, and confessions. Nothing graphic, and every card can still be skipped.</p>
          <p className="mt-4 font-bold text-ink">Everyone here is okay with adult questions.</p>
        </Dialog>
      )}
    </ScreenLayout>
  );
}

// ---------------------------------------------------------------------------
// Our Cards (custom cards, F17, D-27)
// ---------------------------------------------------------------------------

function CustomCardForm({ card, onDone }: { card?: Card; onDone: () => void }) {
  const { addCustomCard, editCustomCard } = useApp.getState();
  const [draft, setDraft] = useState(card?.text ?? "");
  const [error, setError] = useState<string | null>(null);
  const save = (e: FormEvent) => {
    e.preventDefault();
    const err = card ? editCustomCard(card.id, draft) : addCustomCard(draft);
    setError(err);
    if (!err) {
      setDraft("");
      onDone();
    }
  };
  const trimmed = draft.trim();
  const live = customCardError(trimmed);
  // Show the placeholder error live; keep the neutral counter for length-in-progress.
  const message = error ?? (trimmed.length > 0 && /[{}]/.test(trimmed) ? live : null);
  return (
    <form onSubmit={save} className="rounded-md border-2 border-accent bg-surface p-3">
      <label className="sr-only" htmlFor="custom-text">{card ? "Edit card" : "New card"}</label>
      <textarea
        id="custom-text"
        autoFocus
        value={draft}
        rows={2}
        maxLength={CUSTOM_TEXT_MAX + 20}
        placeholder="Have you ever… / What's the…"
        aria-invalid={!!error}
        aria-describedby="custom-help"
        onChange={(e) => { setDraft(e.target.value); setError(null); }}
        className="min-h-[72px] w-full resize-none rounded-sm bg-bg px-3 py-2 text-[17px] font-semibold text-ink outline-none"
      />
      <div className="mt-1 flex items-center justify-between">
        <span id="custom-help" className={cx("text-[13px] font-semibold", message ? "text-danger" : "text-muted")} role={message ? "alert" : undefined}>
          {message ?? `${trimmed.length}/${CUSTOM_TEXT_MAX}`}
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" block={false} onClick={onDone}>Cancel</Button>
          <Button type="submit" size="sm" block={false} className="px-5" disabled={!!live}>{card ? "Save" : "Add"}</Button>
        </div>
      </div>
    </form>
  );
}

export function CustomCards() {
  const cards = useApp((s) => s.customCards);
  const { removeCustomCard, go } = useApp.getState();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const full = cards.length >= CUSTOM_MAX;

  return (
    <ScreenLayout
      title="OUR CARDS"
      onBack={() => go("decks")}
      footer={<Button size="lg" onClick={() => go("decks")}>Done</Button>}
    >
      <p className="mt-2 text-base font-medium text-muted">
        Write your own Spill or Shot questions. Whoever holds the phone answers "you". These stay on this device.
      </p>

      {!adding ? (
        <Button
          variant="secondary"
          className="mt-4"
          disabled={full}
          onClick={() => { setAdding(true); setEditing(null); }}
        >
          {full ? `That's the max (${CUSTOM_MAX})` : "Write a card"}
        </Button>
      ) : (
        <div className="mt-4">
          <CustomCardForm onDone={() => { setAdding(false); setAnnouncement("Card added."); }} />
        </div>
      )}

      {cards.length > 0 && (
        <h2 className="text-label mt-6 mb-2 text-muted">Your cards · {cards.length} of {CUSTOM_MAX}</h2>
      )}
      <ul className="space-y-2">
        {cards.map((c) =>
          editing === c.id ? (
            <li key={c.id}>
              <CustomCardForm card={c} onDone={() => { setEditing(null); setAnnouncement("Card saved."); }} />
            </li>
          ) : (
            <li key={c.id} className="flex items-start gap-2 rounded-md bg-raised p-3">
              <p className="min-w-0 flex-1 text-[15px] font-semibold text-ink">{c.text}</p>
              <IconButton icon="edit" label={`Edit: ${c.text}`} onClick={() => { setEditing(c.id); setAdding(false); }} className="size-10 shrink-0 text-muted" />
              <IconButton
                icon="trash"
                label={`Remove: ${c.text}`}
                onClick={() => { removeCustomCard(c.id); setAnnouncement("Card removed."); }}
                className="size-10 shrink-0 text-danger"
              />
            </li>
          ),
        )}
      </ul>

      {cards.length === 0 && !adding && (
        <p className="mt-6 text-center text-sm font-medium text-muted">No cards yet. Write a few, then pick the Our Cards deck.</p>
      )}
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </ScreenLayout>
  );
}

// ---------------------------------------------------------------------------
// How to Play
// ---------------------------------------------------------------------------

const RULES = [
  "Sit in the order you set up. Turns go around the table, like the tagay.",
  "Whoever holds the phone flips the card and reads it out loud.",
  "Spill (answer honestly) or Shot (drink and keep your secret).",
  "Too vague? The group decides. If it is, that person drinks.",
  "Tap Spill or Shot, then pass the phone to the next seat.",
];

export function HowToPlay() {
  const finishHowTo = useApp((s) => s.finishHowTo);
  const go = useApp((s) => s.go);
  const seen = useApp((s) => s.howToPlaySeen);
  const hasSession = useApp((s) => !!s.session);
  return (
    <ScreenLayout
      title="HOW TO PLAY"
      onBack={() => go(seen && hasSession ? "game" : "decks")}
      footer={
        <Button size="lg" onClick={finishHowTo}>
          {seen ? "Back to the game" : "Let's go"}
        </Button>
      }
    >
      <ol className="mt-6 space-y-4">
        {RULES.map((rule, i) => (
          <li key={rule} className="flex gap-3">
            <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-accent font-display text-base text-on-bright">
              {i + 1}
            </span>
            <span className="text-base font-medium text-ink">{rule}</span>
          </li>
        ))}
      </ol>
      <section className="glass-card mt-6 flex gap-4 rounded-md border-[1.5px] border-accent/70 p-4">
        <ShotGlass size={32} className="shrink-0" />
        <div>
          <h2 className="text-label text-accent">The Tanggero</h2>
          <p className="mt-1 text-sm font-medium text-muted">
            Pours for the table. The host picks one at setup, and the role passes to the next seat every 10 cards. Change it
            anytime from Scores. Some cards let the Tanggero pick who answers.
          </p>
        </div>
      </section>
      <section className="glass-card mt-3 rounded-md border-[1.5px] border-shot/70 p-4">
        <h2 className="text-label text-shot">What's a shot?</h2>
        <p className="mt-1 text-sm font-medium text-muted">A small tagay-sized pour, not a full glass. Skipping a card is always okay.</p>
      </section>
    </ScreenLayout>
  );
}
