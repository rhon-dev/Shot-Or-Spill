/**
 * Two small, dismissible banners for the PWA (v1.1):
 *  - "Update ready" with a button that activates the new version.
 *  - "Ready to play offline" confirmation the first time the app is cached.
 *
 * Both are polite live regions and sit above the thumb zone. They never
 * block the game; the update is optional and applies on the next visit anyway.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { applyUpdate, getPwaState, subscribePwa } from "../lib/pwa";
import { Icon } from "./art";
import { Button, cx } from "./ui";

export function PwaBanner() {
  const { updateReady, offlineReady } = useSyncExternalStore(subscribePwa, getPwaState, getPwaState);
  const [dismissedOffline, setDismissedOffline] = useState(false);

  // Auto-hide the "offline ready" note after a few seconds.
  useEffect(() => {
    if (!offlineReady || dismissedOffline) return;
    const t = window.setTimeout(() => setDismissedOffline(true), 4000);
    return () => window.clearTimeout(t);
  }, [offlineReady, dismissedOffline]);

  const showOffline = offlineReady && !dismissedOffline && !updateReady;
  if (!updateReady && !showOffline) return null;

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4 pad-safe-bottom">
      <div
        className={cx(
          "pointer-events-auto flex w-full max-w-app items-center gap-3 rounded-lg border bg-raised px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.5)]",
          updateReady ? "border-accent" : "border-line-strong",
        )}
      >
        {updateReady ? (
          <>
            <Icon name="shuffle" size={22} className="shrink-0 text-accent" />
            <p className="min-w-0 flex-1 text-[15px] font-semibold text-ink">A new version is ready.</p>
            <Button size="sm" block={false} className="shrink-0 px-4" onClick={applyUpdate}>
              Update
            </Button>
          </>
        ) : (
          <>
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
              <Icon name="check" size={16} />
            </span>
            <p className="min-w-0 flex-1 text-[15px] font-semibold text-ink">Ready to play offline.</p>
            <button
              type="button"
              onClick={() => setDismissedOffline(true)}
              aria-label="Dismiss"
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:text-ink"
            >
              <Icon name="close" size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
