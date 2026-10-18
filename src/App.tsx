import { LazyMotion, MotionConfig } from "motion/react";
import { lazy, Suspense, useEffect, useSyncExternalStore } from "react";
import { effectiveScreen, type Screen } from "./game/store";
import { useApp } from "./game/useApp";
import { Game } from "./screens/Game";
import { Recap } from "./screens/Recap";
import { AgeGate, Decks, HowToPlay, Players, UnderAge } from "./screens/Setup";
import { PwaBanner } from "./components/PwaBanner";
import { registerServiceWorker } from "./lib/pwa";
import type { InfoPageId } from "./pages/Info";

registerServiceWorker();

const InfoPage = lazy(() => import("./pages/Info"));
const loadMotionFeatures = () => import("./lib/motionFeatures").then((m) => m.default);

const INFO_PAGES: readonly InfoPageId[] = ["about", "drink-responsibly", "terms"];

const TITLES: Record<Screen, string> = {
  age: "Shot or Spill",
  under18: "Come back at 18 · Shot or Spill",
  players: "Who's drinking? · Shot or Spill",
  decks: "Pick your decks · Shot or Spill",
  howto: "How to play · Shot or Spill",
  game: "Game · Shot or Spill",
  recap: "That's the night · Shot or Spill",
};

/** Info pages live at #about, #drink-responsibly, #terms, so the back button works. */
function useHashPage(): InfoPageId | null {
  const hash = useSyncExternalStore(
    (cb) => {
      window.addEventListener("hashchange", cb);
      return () => window.removeEventListener("hashchange", cb);
    },
    () => window.location.hash.slice(1),
  );
  return (INFO_PAGES as readonly string[]).includes(hash) ? (hash as InfoPageId) : null;
}

function closeInfo() {
  if (window.history.length > 1) window.history.back();
  else window.location.hash = "";
}

export function App() {
  const screen = useApp((s) => effectiveScreen(s));
  const reducedPref = useApp((s) => s.reducedMotion);
  const page = useHashPage();

  useEffect(() => {
    document.title = TITLES[screen];
    // Move focus to the new screen's heading for screen readers.
    const h1 = document.querySelector<HTMLElement>("main h1, [role='main'] h1, h1");
    if (h1) {
      h1.tabIndex = -1;
      h1.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
  }, [screen]);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion={reducedPref === null ? "user" : reducedPref ? "always" : "never"}>
        <div inert={!!page} aria-hidden={!!page}>
          {screen === "age" && <AgeGate />}
          {screen === "under18" && <UnderAge />}
          {screen === "players" && <Players />}
          {screen === "decks" && <Decks />}
          {screen === "howto" && <HowToPlay />}
          {screen === "game" && <Game />}
          {screen === "recap" && <Recap />}
        </div>
        {page && (
          <Suspense fallback={<div className="fixed inset-0 z-20 bg-bg" />}>
            <InfoPage page={page} onClose={closeInfo} />
          </Suspense>
        )}
        {!page && <PwaBanner />}
      </MotionConfig>
    </LazyMotion>
  );
}
