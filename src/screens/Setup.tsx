/** Age gate, under-18, players, decks, and How to Play (PHASES 3.2, mocks 01–04, 14, 15, 17). */
import { useState, type FormEvent } from "react";
import { DECK_IDS, DECKS, type DeckId, type Intensity } from "../content/meta";
import { layout } from "../design/tokens";
import { eligibleCount, MAX_PLAYERS, MIN_ELIGIBLE, MIN_PLAYERS } from "../game/engine";
import { needsAdultOk } from "../game/store";
import { useApp } from "../game/useApp";
import { Icon, ShotGlass, Wordmark } from "../components/art";
import { DECK_BG, DECK_BORDER } from "../components/Card";
import { Dialog } from "../components/overlays";
import { AdultBadge, Button, cx, IconButton, ScreenLayout, Segmented } from "../components/ui";

export function InfoLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="About Shot or Spill" className={cx("flex flex-wrap justify-center gap-x-1 text-sm font-semibold", className)}>
      <a href="#about" className="inline-flex min-h-12 items-center px-2 text-accent">About</a>
      <span aria-hidden="true" className="self-center text-muted">·</span>
      <a href="#drink-responsibly" className="inline-flex min-h-12 items-center px-2 text-accent">Drink Responsibly</a>
      <span aria-hidden="true" className="self-center text-muted">·</span>
      <a href="#terms" className="inline-flex min-h-12 items-center px-2 text-accent">Terms</a>
    </nav>
  );
}

const PLEDGE = ["No one drives tonight.", "Skipping is always okay.", "Drink water."];

export function AgeGate() {
  const confirmAge = useApp((s) => s.confirmAge);
  const declareUnder18 = useApp((s) => s.declareUnder18);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-app flex-col items-center px-5 pt-10 text-center">
      <ShotGlass size={56} />
      <div className="mt-2">
        <Wordmark size={82} as="h1" />
      </div>
      <span className="mt-4 rounded-full border-[1.5px] border-deck-no-filter px-4 py-0.5 font-display text-sm tracking-[1.4px] text-deck-no-filter">
        18+ ONLY
      </span>
      <p className="mt-3 max-w-[280px] text-base font-medium text-muted">The barkada card game. Answer honestly, or take a shot.</p>

      <section aria-labelledby="pledge" className="mt-6 w-full rounded-lg border border-line bg-surface p-5 text-left">
        <h2 id="pledge" className="text-label text-accent">Tonight's pledge</h2>
        <ul className="mt-3 space-y-2">
          {PLEDGE.map((line) => (
            <li key={line} className="flex items-center gap-3 text-[17px] font-semibold text-ink">
              <Icon name="check" className="text-accent" />
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
        <InfoLinks className="mt-2" />
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

function PlayerRow({ index, id, name }: { index: number; id: string; name: string }) {
  const renamePlayer = useApp((s) => s.renamePlayer);
  const removePlayer = useApp((s) => s.removePlayer);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);

  const save = (e?: FormEvent) => {
    e?.preventDefault();
    const err = renamePlayer(id, draft);
    setError(err);
    if (!err) setEditing(false);
  };

  return (
    <li className="rounded-md bg-raised">
      {editing ? (
        <form onSubmit={save} className="flex items-center gap-2 p-1.5">
          <label className="sr-only" htmlFor={`edit-${id}`}>Rename {name}</label>
          <input
            id={`edit-${id}`}
            autoFocus
            value={draft}
            maxLength={layout.playerNameMax + 4}
            aria-invalid={!!error}
            aria-describedby={error ? `edit-${id}-err` : undefined}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && (setEditing(false), setDraft(name), setError(null))}
            className={cx("min-h-12 min-w-0 flex-1 rounded-md border-2 bg-surface px-3 text-[17px] font-semibold text-ink outline-none", error ? "border-danger" : "border-accent")}
          />
          <Button type="submit" size="sm" block={false} className="shrink-0 px-4">Save</Button>
        </form>
      ) : (
        <div className="flex min-h-[54px] items-center gap-3 pl-3">
          <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] border-line-strong bg-bg text-sm font-bold text-muted">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-[17px] font-bold text-ink">{name}</span>
          <IconButton icon="edit" label={`Rename ${name}`} className="text-muted" onClick={() => { setDraft(name); setEditing(true); }} />
          <IconButton icon="close" label={`Remove ${name}`} className="text-muted" onClick={() => removePlayer(id)} />
        </div>
      )}
      {error && editing && (
        <p id={`edit-${id}-err`} className="px-3 pb-2 text-sm font-semibold text-danger">{error}</p>
      )}
    </li>
  );
}

export function Players() {
  const players = useApp((s) => s.players);
  const addPlayer = useApp((s) => s.addPlayer);
  const go = useApp((s) => s.go);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const full = players.length >= MAX_PLAYERS;

  const add = (e: FormEvent) => {
    e.preventDefault();
    const err = addPlayer(name);
    setError(err);
    if (!err) setName("");
  };

  return (
    <ScreenLayout
      title="WHO'S DRINKING?"
      step="STEP 1 OF 2"
      footer={
        <Button size="lg" disabled={players.length < MIN_PLAYERS} onClick={() => go("decks")}>
          Next: pick decks
        </Button>
      }
    >
      <p className="mt-2 text-base font-medium text-muted">Add {MIN_PLAYERS} to {MAX_PLAYERS} players, in the order you're sitting.</p>
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
            "min-h-[54px] min-w-0 flex-1 rounded-md border-2 bg-surface px-4 text-[17px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted",
            error ? "border-danger" : "border-line-strong focus:border-accent",
          )}
        />
        <Button type="submit" disabled={full} block={false} className="min-h-[54px] w-[84px] shrink-0">Add</Button>
      </form>
      <p id="new-player-err" role="alert" className="mt-2 min-h-5 text-sm font-semibold text-danger">{error}</p>

      <ol className="mt-2 space-y-2" aria-label="Players">
        {players.map((p, i) => <PlayerRow key={p.id} index={i} id={p.id} name={p.name} />)}
      </ol>
      <p className="mt-4 text-sm font-semibold text-muted">
        {players.length} of {MAX_PLAYERS} players
        {players.length < MIN_PLAYERS && ` · add at least ${MIN_PLAYERS}`}
      </p>
      <p className="mt-1 text-sm font-medium text-muted">The app picks the Tanggero when the game starts.</p>
    </ScreenLayout>
  );
}

const INTENSITIES: { value: Intensity; label: string; hint: string }[] = [
  { value: 1, label: "Chill", hint: "Light and safe. Nothing spicy." },
  { value: 2, label: "Spicy", hint: "Tea, exes, a little heat." },
  { value: 3, label: "No Filter", hint: "Adults only. Bold questions." },
];

const DECK_EMOJI: Record<DeckId, string> = {
  "warm-up": "🍻",
  "barkada-tea": "☕",
  "love-life": "💔",
  "family-adulting": "🏠",
  "no-filter": "🔞",
};

type Pending = { deck: DeckId } | { intensity: Intensity };

export function Decks() {
  const decks = useApp((s) => s.decks);
  const intensity = useApp((s) => s.intensity);
  const players = useApp((s) => s.players);
  const adultOk = useApp((s) => s.adultOk);
  const session = useApp((s) => s.session);
  const { toggleDeck, setIntensity, confirmAdult, startNight, go } = useApp.getState();
  const [pending, setPending] = useState<Pending | null>(null);

  const count = eligibleCount(decks, intensity, players.length);
  const enough = count >= MIN_ELIGIBLE;
  const continuing =
    !!session && session.players.length === players.length && session.players.every((p, i) => p.id === players[i]?.id);

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
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => request({ deck: id })}
              className={cx(
                "flex min-h-[72px] w-full items-center gap-3.5 rounded-md bg-surface px-3.5 text-left",
                on ? cx("border-2", DECK_BORDER[id]) : "border-[1.5px] border-line",
              )}
            >
              <span aria-hidden="true" className={cx("grid size-11 shrink-0 place-items-center rounded-[12px] text-[22px]", DECK_BG[id])}>
                {DECK_EMOJI[id]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-display text-[21px] uppercase tracking-[0.6px] text-ink">{meta.name}</span>
                  {meta.adultOptIn && <AdultBadge />}
                </span>
                <span className="block truncate text-[13px] font-medium text-muted">
                  {n} {n === 1 ? "card" : "cards"} · {meta.tagline}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={cx("grid size-7 shrink-0 place-items-center rounded-full", on ? cx(DECK_BG[id], "text-on-bright") : "border-2 border-line-strong")}
              >
                {on && <Icon name="check" size={18} />}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="text-label mt-6 mb-3 text-muted" id="intensity-label">Intensity</h2>
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

const RULES = [
  "Pass the phone. Whoever holds it draws the card.",
  "Read the card out loud.",
  "Spill (answer honestly) or Shot (drink and keep your secret).",
  "Too vague? The group decides. If it is, that person drinks.",
  "Tap Spill or Shot, then pass the phone.",
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
      <section className="mt-6 flex gap-4 rounded-md border-[1.5px] border-accent bg-surface p-4">
        <ShotGlass size={32} className="shrink-0" />
        <div>
          <h2 className="text-label text-accent">The Tanggero</h2>
          <p className="mt-1 text-sm font-medium text-muted">
            Pours for the table. The app picks one now and passes the role every 10 cards. Some cards let the Tanggero pick who answers.
          </p>
        </div>
      </section>
      <section className="mt-3 rounded-md border-[1.5px] border-shot bg-surface p-4">
        <h2 className="text-label text-shot">What's a shot?</h2>
        <p className="mt-1 text-sm font-medium text-muted">A small tagay-sized pour, not a full glass. Skipping a card is always okay.</p>
      </section>
    </ScreenLayout>
  );
}
