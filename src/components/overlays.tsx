/**
 * Dialogs and sheets on the native <dialog> element: showModal() gives focus
 * trapping, Escape to close, an inert background, and focus return for free
 * (DESIGN.md §6).
 */
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "./ui";
import { IconButton } from "./ui";

function useModal(onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const onCancel = (e: Event) => {
      e.preventDefault();
      close.current();
    };
    el.addEventListener("cancel", onCancel);
    return () => {
      el.removeEventListener("cancel", onCancel);
      if (el.open) el.close();
    };
  }, []);
  return ref;
}

/** Centered dialog (soft cap, adult confirmation, reshuffle). */
export function Dialog({
  title,
  onClose,
  icon,
  children,
  actions,
}: {
  title: string;
  onClose: () => void;
  icon?: ReactNode;
  children?: ReactNode;
  actions: ReactNode;
}) {
  const ref = useModal(onClose);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="m-auto w-[calc(100%-40px)] max-w-[440px] rounded-lg border border-line bg-surface p-5 text-center text-ink backdrop:bg-scrim"
    >
      {icon && <div className="mb-3 flex justify-center">{icon}</div>}
      <h2 id={titleId} className="font-display text-[28px] leading-tight">
        {title}
      </h2>
      {children && <div className="mt-2 text-base font-medium text-muted">{children}</div>}
      <div className="mt-5 flex flex-col gap-3">{actions}</div>
    </dialog>
  );
}

/** Bottom sheet (scoreboard). */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useModal(onClose);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClick={(e) => {
        // Tap on the backdrop closes the sheet.
        if (e.target === e.currentTarget) onClose();
      }}
      className="mx-auto mt-auto mb-0 max-h-[88dvh] w-full max-w-app rounded-t-[24px] bg-surface p-0 text-ink backdrop:bg-scrim"
    >
      <div className="px-5 pt-3 pad-safe-bottom">
        <div className="mx-auto h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
        <div className="mt-3 flex items-center justify-between">
          <h2 id={titleId} className="font-display text-[30px] leading-none">
            {title}
          </h2>
          <IconButton icon="close" label="Close" onClick={onClose} className="-mr-3" />
        </div>
        {children}
      </div>
    </dialog>
  );
}

/** Short status message, announced to screen readers (Undo confirmation). */
export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => done.current(), 3000);
    return () => window.clearTimeout(t);
  }, [message]);
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-10 flex justify-center px-5">
      {message && (
        <div className={cx("rounded-full border border-line-strong bg-raised px-5 py-3 text-[15px] font-semibold text-ink shadow-lg")}>
          {message}
        </div>
      )}
    </div>
  );
}
