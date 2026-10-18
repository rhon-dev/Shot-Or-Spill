/**
 * Service worker registration and update state (PWA offline play, v1.1).
 *
 * The worker (dist/sw.js) is built by scripts/build-sw.ts and precaches the
 * whole app, so a saved night keeps working with no signal. This module
 * registers it, exposes a tiny subscribe/getSnapshot store for the "update
 * ready" and "offline ready" banners, and lets the page activate a waiting
 * worker.
 *
 * Dev note: the SW only exists in a production build, so registration is
 * skipped under `vite dev`.
 */
export type PwaState = {
  /** A new version is installed and waiting to take over. */
  updateReady: boolean;
  /** The app has been cached and will work offline. */
  offlineReady: boolean;
};

let state: PwaState = { updateReady: false, offlineReady: false };
const listeners = new Set<() => void>();
let waiting: ServiceWorker | null = null;

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

export function subscribePwa(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPwaState(): PwaState {
  return state;
}

/** Tell the waiting worker to activate; the controllerchange handler reloads. */
export function applyUpdate(): void {
  waiting?.postMessage("skip-waiting");
}

export function registerServiceWorker(): void {
  if (import.meta.env.DEV) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        if (reg.active && !navigator.serviceWorker.controller) {
          // Registered fresh this load: the shell is now cached.
          set({ offlineReady: true });
        }
        // A worker already waiting from a previous visit.
        if (reg.waiting && navigator.serviceWorker.controller) {
          waiting = reg.waiting;
          set({ updateReady: true });
        }
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state !== "installed") return;
            if (navigator.serviceWorker.controller) {
              // An update to an already-controlled page.
              waiting = sw;
              set({ updateReady: true });
            } else {
              // First install on this device.
              set({ offlineReady: true });
            }
          });
        });
      })
      .catch(() => {
        // Offline support is an enhancement; the app still runs without it.
      });

    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  });
}
