/**
 * Sound effects and haptics for card actions (v1.1, D-26).
 *
 * Sounds are short tones synthesized with the Web Audio API, so nothing is
 * fetched (stays inside the CSP) and the bundle gains no audio files. Haptics
 * use navigator.vibrate where supported (Android; iOS Safari ignores it).
 *
 * Both are opt-out via the store (`sound`, `haptics`), checked by the caller.
 * The AudioContext is created on first use, inside a user gesture, so mobile
 * browsers allow it.
 */
export type Cue = "flip" | "spill" | "shot" | "water" | "tap";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** A short enveloped tone. Frequencies and lengths are tuned to feel like UI blips, not music. */
function tone(freq: number, ms: number, type: OscillatorType = "sine", gain = 0.06) {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(gain, now + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000);
  osc.connect(amp).connect(ac.destination);
  osc.start(now);
  osc.stop(now + ms / 1000 + 0.02);
}

const SOUNDS: Record<Cue, () => void> = {
  // Flip: a quick upward blip, like turning a card.
  flip: () => tone(520, 110, "triangle"),
  // Spill: a bright two-note "reveal".
  spill: () => {
    tone(620, 90, "triangle");
    window.setTimeout(() => tone(880, 130, "triangle"), 70);
  },
  // Shot: a lower, rounder note, like setting a glass down.
  shot: () => tone(300, 150, "sine", 0.07),
  // Water break: a soft, calming low tone.
  water: () => tone(360, 220, "sine", 0.05),
  // Generic tap confirmation.
  tap: () => tone(440, 60, "sine", 0.04),
};

const VIBRATION: Record<Cue, number | number[]> = {
  flip: 10,
  spill: [12, 24, 12],
  shot: 28,
  water: 16,
  tap: 8,
};

/** Play a cue. `opts` comes from the store so each channel can be off. */
export function feedback(cue: Cue, opts: { sound: boolean; haptics: boolean }): void {
  if (opts.sound) {
    try {
      SOUNDS[cue]();
    } catch {
      // Audio is a nicety; never let it break a tap.
    }
  }
  if (opts.haptics && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(VIBRATION[cue]);
    } catch {
      // Ignore: unsupported or blocked.
    }
  }
}
