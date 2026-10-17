/** Shared controls (mocks/19-components.svg). Every tap target is 48px or taller. */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName, ShotGlass } from "./art";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "spill" | "shot" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md" | "sm";

const VARIANT: Record<Variant, string> = {
  primary: "bg-accent text-on-bright",
  spill: "bg-spill text-on-bright",
  shot: "bg-shot text-on-bright",
  secondary: "border-2 border-line-strong text-ink",
  danger: "border-2 border-danger text-danger",
  ghost: "text-accent",
};

const SIZE: Record<Size, string> = {
  lg: "min-h-[72px] text-[28px]",
  md: "min-h-14 text-[21px]",
  sm: "min-h-12 text-[21px]",
};

export function Button({
  variant = "primary",
  size = "md",
  sub,
  block = true,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  sub?: ReactNode;
  /** Full width (default). Pass false and set a width in className for inline buttons. */
  block?: boolean;
}) {
  const ghost = variant === "ghost";
  return (
    <button
      type="button"
      className={cx(
        "flex flex-col items-center justify-center rounded-md px-4 transition-transform active:scale-[0.98]",
        block && "w-full",
        "disabled:border-transparent disabled:bg-disabled-bg disabled:text-disabled-ink disabled:active:scale-100",
        ghost ? "min-h-12 font-sans text-base font-semibold" : cx("font-display uppercase tracking-[1px]", SIZE[size]),
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      <span className="leading-none">{children}</span>
      {sub && <span className="mt-1 font-sans text-[13px] font-semibold normal-case tracking-normal">{sub}</span>}
    </button>
  );
}

export function IconButton({ icon, label, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return (
    <button type="button" aria-label={label} className={cx("grid size-12 place-items-center rounded-md text-ink", className)} {...rest}>
      <Icon name={icon} size={24} />
    </button>
  );
}

/** Small row action: Skip, Undo, Scores. */
export function ActionButton({ icon, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName }) {
  return (
    <button
      type="button"
      className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md text-[15px] font-semibold text-muted disabled:opacity-40"
      {...rest}
    >
      <Icon name={icon} />
      {children}
    </button>
  );
}

/** Toggle chip for picking players. Amber = who drank, teal = who answers. */
export function Chip({ selected, tone = "shot", children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean; tone?: "shot" | "accent" }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        "flex min-h-12 items-center justify-center gap-1.5 rounded-full px-3 text-base",
        selected
          ? cx("font-bold text-on-bright", tone === "shot" ? "bg-shot" : "bg-accent")
          : "border-[1.5px] border-line-strong bg-raised font-semibold text-ink",
      )}
      {...rest}
    >
      {selected && <Icon name="check" />}
      <span className="truncate">{children}</span>
    </button>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  size = "lg",
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  size?: "lg" | "md";
}) {
  const box = size === "lg" ? "size-[60px]" : "size-12";
  return (
    <div role="group" aria-label={label} className="flex items-center justify-between gap-3">
      <button
        type="button"
        aria-label={`Fewer: ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={cx(box, "grid place-items-center rounded-md border-2 border-line-strong text-ink disabled:opacity-35")}
      >
        <Icon name="minus" size={22} />
      </button>
      <output aria-live="polite" className={cx("min-w-12 text-center font-display text-ink", size === "lg" ? "text-[40px]" : "text-[32px]")}>
        {value}
      </output>
      <button
        type="button"
        aria-label={`More: ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={cx(box, "grid place-items-center rounded-md border-2 border-line-strong text-ink disabled:opacity-35")}
      >
        <Icon name="plus" size={22} />
      </button>
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex min-h-12 w-full items-center justify-between gap-4 text-left">
      <span>
        <span className="block text-base font-semibold text-ink">{label}</span>
        {hint && <span className="block text-[13px] font-medium text-muted">{hint}</span>}
      </span>
      <span className={cx("relative h-8 w-[52px] shrink-0 rounded-full transition-colors", checked ? "bg-accent" : "border-[1.5px] border-line-strong bg-raised")}>
        <span className={cx("absolute top-1/2 size-[22px] -translate-y-1/2 rounded-full transition-[left]", checked ? "left-[25px] bg-on-bright" : "left-[4px] bg-ink")} />
      </span>
    </button>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-flow-col gap-1 rounded-md border-[1.5px] border-line-strong bg-surface p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cx("min-h-12 rounded-[10px] font-display text-[19px] uppercase tracking-[0.8px]", on ? "bg-accent text-on-bright" : "text-ink")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function TanggeroBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex h-[34px] max-w-[60%] items-center gap-2 rounded-full border-[1.5px] border-accent px-3 text-sm font-bold text-accent">
      <ShotGlass size={16} />
      <span className="truncate">Tanggero: {name}</span>
    </span>
  );
}

export function AdultBadge() {
  return (
    <span className="inline-flex h-[22px] items-center rounded-full border-[1.5px] border-deck-no-filter px-2 font-display text-[13px] text-deck-no-filter">
      18+
    </span>
  );
}

/** Standard screen: optional back button and step label, title, scrollable body, pinned footer. */
export function ScreenLayout({
  title,
  onBack,
  step,
  footer,
  children,
}: {
  title?: string;
  onBack?: () => void;
  step?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col px-5">
      {(onBack || step) && (
        <div className="flex h-16 items-center justify-between">
          {onBack ? <IconButton icon="back" label="Back" onClick={onBack} className="-ml-3" /> : <span />}
          {step && <span className="text-label text-muted">{step}</span>}
        </div>
      )}
      {title && <h1 className={cx("font-display text-[36px] leading-[1.05] text-ink", !onBack && !step && "pt-8")}>{title}</h1>}
      <div className="flex-1 pb-4">{children}</div>
      {footer && <div className="pad-safe-bottom sticky bottom-0 bg-bg pt-3">{footer}</div>}
    </div>
  );
}
