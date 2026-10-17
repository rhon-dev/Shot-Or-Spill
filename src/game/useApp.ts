import { useReducedMotion } from "motion/react";
import { createAppStore } from "./store";

/** The app's single store, persisted to localStorage. */
export const useApp = createAppStore();

/** Effective reduced-motion setting: the in-app toggle wins, else the OS setting. */
export function useReduced(): boolean {
  const pref = useApp((s) => s.reducedMotion);
  const os = useReducedMotion();
  return pref ?? !!os;
}
