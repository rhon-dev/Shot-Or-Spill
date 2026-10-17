/**
 * Tailwind theme, built from the design tokens so the app and the Phase 2
 * mocks share one source (docs/DESIGN.md). Loaded by src/index.css via @config.
 */
import { DECK_IDS } from "./src/content/meta";
import { color, deckAccent, font, layout, radius } from "./src/design/tokens";

export default {
  theme: {
    extend: {
      colors: {
        bg: color.bg,
        surface: color.surface,
        raised: color.surfaceRaised,
        line: color.border,
        "line-strong": color.borderStrong,
        ink: color.text,
        muted: color.textMuted,
        "on-bright": color.textOnBright,
        spill: color.spill,
        shot: color.shot,
        accent: color.accent,
        danger: color.danger,
        "disabled-bg": color.disabledBg,
        "disabled-ink": color.disabledText,
        focus: color.focus,
        scrim: color.scrim,
        deck: Object.fromEntries(DECK_IDS.map((id) => [id, deckAccent[id]])),
      },
      fontFamily: {
        display: font.display,
        sans: font.sans,
      },
      borderRadius: {
        sm: `${radius.sm}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
        card: `${radius.card}px`,
      },
      maxWidth: {
        app: `${layout.maxWidth}px`,
      },
      minHeight: {
        tap: `${layout.tapTarget}px`,
        choice: `${layout.choiceButtonHeight}px`,
      },
    },
  },
};
