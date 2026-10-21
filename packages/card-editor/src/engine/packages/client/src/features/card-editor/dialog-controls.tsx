import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

export const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function safeLocalStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Modal dialog keyboard behavior, modeled on the engine's memory-nag vault: focus the first
 * control on open, trap Tab inside, close on Escape (unless blocked, e.g. dispatch in flight),
 * and restore the previously focused element on close.
 */
export function useDialogFocusTrap(active: boolean, blocked: () => boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;

  useEffect(() => {
    if (!active) return undefined;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const focusFrame = requestAnimationFrame(() => (dialog.querySelector<HTMLElement>(FOCUSABLE) ?? dialog).focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // A workspace pane handles its own Escape first (capture phase) and marks the event.
        if (event.isComposing || event.defaultPrevented || blockedRef.current()) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (focusable[0] ?? dialog).focus();
        return;
      }
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      requestAnimationFrame(() => {
        if (previousFocus?.isConnected) previousFocus.focus();
      });
    };
  }, [active]);

  return dialogRef;
}

/**
 * A former dialog shown as a pane of the workspace: the same head/body/foot markup without an
 * overlay or focus trap. Escape closes the innermost pane before the workspace sees the key
 * (capture phase), unless it is busy; nested panes pass closeOnEscape={false} to the outer one.
 */
export function WorkspacePane({
  className,
  label,
  busy = false,
  closeOnEscape = true,
  onClose,
  children,
  ...events
}: {
  className: string;
  label: string;
  busy?: boolean;
  closeOnEscape?: boolean;
  onClose: () => void;
  children: ReactNode;
} & Pick<HTMLAttributes<HTMLElement>, "onChangeCapture" | "onClickCapture">) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const busyRef = useRef(busy);
  busyRef.current = busy;
  useEffect(() => {
    if (!closeOnEscape) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing || event.defaultPrevented) return;
      // Fields own Escape (a search closes its list first); this listener runs before React's.
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      event.preventDefault();
      if (!busyRef.current) onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [closeOnEscape]);
  return (
    <section className={`ce-pane ${className}`} aria-label={label} {...events}>
      {children}
    </section>
  );
}

export function NumberField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="ce-label" htmlFor={id}>
      <span className="ce-label-title">{label}</span>
      <input
        id={id}
        type="number"
        className="mari-chrome-field ce-field ce-number-input"
        value={value}
        min={min}
        max={max}
        step={1}
        inputMode="numeric"
        onChange={(event) => {
          if (event.target.value === "") return;
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, Math.trunc(next))));
        }}
      />
    </label>
  );
}

export function RadioChoice({
  name,
  value,
  checked,
  onChange,
  title,
  disabled,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <label className={`ce-choice${disabled ? " ce-choice--disabled" : ""}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span className="ce-choice-copy">
        <strong>{title}</strong>
      </span>
    </label>
  );
}
