/** End-of-night recap (F14, D-19, mock 06). No Share button in the MVP (D-17 deferred). */
import { awards, playerById, stats, totals } from "../game/engine";
import { useApp } from "../game/useApp";
import { Button, cx } from "../components/ui";

const STYLE = {
  "most-honest": { border: "border-spill", text: "text-spill", emoji: "🗣️" },
  "most-secretive": { border: "border-shot", text: "text-shot", emoji: "🤫" },
  "biggest-tea": { border: "border-accent", text: "text-accent", emoji: "☕" },
} as const;

function duration(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60000));
  const h = Math.floor(min / 60);
  return h > 0 ? `${h} h ${min % 60} min` : `${min} min`;
}

export function Recap() {
  const session = useApp((s) => s.session);
  const { playAgain, newPlayers } = useApp.getState();
  if (!session) return null;
  const st = stats(session);
  const t = totals(session);
  const list = awards(session);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-app flex-col px-5 pt-8">
      <h1 className="font-display text-[38px] leading-none text-ink">THAT'S THE NIGHT</h1>
      <p className="mt-2 text-[15px] font-semibold text-muted">
        {t.cards} {t.cards === 1 ? "card" : "cards"} · {duration(Date.now() - session.startedAt)} · {session.players.length} players
      </p>

      <ul className="mt-5 space-y-2">
        {list.map((a) => {
          const s = STYLE[a.id];
          const names = a.playerIds.map((id) => playerById(session, id)?.name ?? "").join(" & ");
          return (
            <li key={a.id} className={cx("flex items-center gap-4 rounded-md border-[1.5px] bg-surface p-4", s.border)}>
              <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-raised text-[22px]">{s.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className={cx("text-label block", s.text)}>{a.title}</span>
                <span className="block truncate font-display text-[28px] uppercase leading-tight text-ink">{names}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-muted">
                {a.value} {a.unit}{a.value === 1 ? "" : "s"}
              </span>
            </li>
          );
        })}
        {list.length === 0 && <li className="rounded-md border border-line bg-surface p-4 text-muted">No awards this time. Play a few more cards next round.</li>}
      </ul>

      <table className="mt-6 w-full text-left">
        <caption className="sr-only">Final scores</caption>
        <thead>
          <tr className="text-label text-muted">
            <th scope="col" className="pb-2 font-normal">Player</th>
            <th scope="col" className="w-16 pb-2 text-center font-normal">Spills</th>
            <th scope="col" className="w-16 pb-2 text-center font-normal">Shots</th>
          </tr>
        </thead>
        <tbody>
          {session.players.map((p) => {
            const s = st.get(p.id)!;
            return (
              <tr key={p.id} className="border-b border-line">
                <th scope="row" className="py-2 text-base font-bold text-ink">{p.name}</th>
                <td className="text-center font-display text-[21px] text-spill">{s.spills}</td>
                <td className="text-center font-display text-[21px] text-shot">{s.shots}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-auto pt-6 pad-safe-bottom">
        <p className="mb-3 text-center text-sm font-semibold text-accent">Get home safe. Nobody drives tonight.</p>
        <Button size="lg" onClick={playAgain}>Play again</Button>
        <Button variant="secondary" className="mt-3" onClick={newPlayers}>New players</Button>
      </div>
    </main>
  );
}
