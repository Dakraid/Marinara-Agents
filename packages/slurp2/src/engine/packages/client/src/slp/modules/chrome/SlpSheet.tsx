// ──────────────────────────────────────────────
// SlpSheet / SlpMenu (design language §7): the one overlay for menus, pickers and small dialogs.
//
// Phone: a frosted pink glass bottom sheet (20 px top radius, grab handle, soft pink top glow, scrim)
// that closes on swipe down, Escape and a scrim tap, traps focus, and sits above
// the bottom nav (it renders in the package portal, over the whole app). Wide screens: a menu is a
// popover anchored to its trigger, a dialog is a centred modal. One Slurp overlay at a time: opening
// one closes the other. Motion uses the shared tokens and is a plain fade under reduced motion.
// ──────────────────────────────────────────────
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../lib/utils";
import { ModalPortalContext } from "../../../components/ui/Modal";
import { useDialogFocusScope } from "../../../hooks/use-dialog-focus-scope";
import { getSlpAccentStyle, SLP_TYPE, useSlpAccent } from "../../base/chrome/SlpChrome";
import { SLP_MOTION, slpPrefersReducedMotion } from "../../base/chrome/slp-motion";

const WIDE_QUERY = "(min-width: 768px)";
const subscribeWide = (onChange: () => void) => {
  const query = matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useWideScreen = () =>
  useSyncExternalStore(
    subscribeWide,
    () => matchMedia(WIDE_QUERY).matches,
    () => false,
  );

/** Closes the Slurp overlay that is open now, so a second one never stacks on top of it. */
let closeOpenOverlay: (() => void) | null = null;

// ponytail: no back-gesture close. A history entry of our own confuses the Engine's back handler
// (it closed the Engine's top layer when the sheet closed), and the Engine's back stack is not
// reachable from a package bundle. Upgrade path: a host API to register a back layer.

// A swipe this long, or this fast (px per ms), closes the sheet; anything less snaps back.
const SWIPE_CLOSE_PX = 90;
const SWIPE_CLOSE_SPEED = 0.6;

export function SlpSheet({
  open,
  onClose,
  title,
  kind = "dialog",
  anchorRef,
  closeDisabled = false,
  width = "max-w-md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** The sheet heading; a menu uses it as its accessible name and shows it on phones only. */
  title: string;
  /** "menu": rows of actions (role menu, arrow keys). "dialog": any other content. */
  kind?: "menu" | "dialog";
  /** The control that opened it. With one, wide screens get a popover hanging off it; without, a centred modal. */
  anchorRef?: RefObject<HTMLElement | null>;
  /** While a spend is in flight nothing closes the sheet (swipe, Escape or scrim). */
  closeDisabled?: boolean;
  /** Width of the centred modal on wide screens. */
  width?: string;
  children: ReactNode;
}) {
  const wide = useWideScreen();
  const mode = !wide ? "sheet" : anchorRef ? "popover" : "modal";
  const accent = useSlpAccent();
  const portal = useContext(ModalPortalContext);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closeDisabledRef = useRef(closeDisabled);
  closeDisabledRef.current = closeDisabled;
  const requestClose = () => {
    if (!closeDisabledRef.current) onCloseRef.current();
  };

  // Stay mounted through the exit motion.
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [dragY, setDragY] = useState(0);
  useEffect(() => {
    if (open) {
      setMounted(true);
      setDragY(0);
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = window.setTimeout(() => setMounted(false), SLP_MOTION.slow);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => onCloseRef.current();
    closeOpenOverlay?.();
    closeOpenOverlay = close;
    // Window capture, stopped: an Engine dialog underneath listens on document and would close too.
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        requestClose();
      }
    };
    window.addEventListener("keydown", escape, true);
    return () => {
      window.removeEventListener("keydown", escape, true);
      if (closeOpenOverlay === close) closeOpenOverlay = null;
    };
  }, [open]);

  useDialogFocusScope(open && mounted, panelRef);

  // Popover: a tap anywhere but the panel or its trigger closes it (the trigger toggles on its own).
  useEffect(() => {
    if (!open || mode !== "popover") return;
    const outside = (event: globalThis.PointerEvent) => {
      const target = event.target instanceof Node ? event.target : null;
      if (target && (panelRef.current?.contains(target) || anchorRef?.current?.contains(target))) return;
      requestClose();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, mode, anchorRef]);

  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    if (!mounted || mode !== "popover") return;
    const place = () => {
      const anchor = anchorRef?.current?.getBoundingClientRect();
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const margin = 12;
      const left = Math.min(
        Math.max(margin, anchor.right - panel.offsetWidth),
        window.innerWidth - panel.offsetWidth - margin,
      );
      const below = anchor.bottom + 6;
      const top =
        below + panel.offsetHeight + margin > window.innerHeight
          ? Math.max(margin, anchor.top - panel.offsetHeight - 6)
          : below;
      setPosition({ left, top });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [mounted, mode, anchorRef]);

  const drag = useRef<{ y: number; at: number } | null>(null);
  const dragHandlers =
    mode === "sheet"
      ? {
          onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
            if (closeDisabled) return;
            drag.current = { y: event.clientY, at: performance.now() };
            event.currentTarget.setPointerCapture(event.pointerId);
          },
          onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
            if (drag.current) setDragY(Math.max(0, event.clientY - drag.current.y));
          },
          onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
            const start = drag.current;
            drag.current = null;
            if (!start) return;
            const distance = event.clientY - start.y;
            const speed = distance / Math.max(1, performance.now() - start.at);
            if (distance > SWIPE_CLOSE_PX || speed > SWIPE_CLOSE_SPEED) requestClose();
            else setDragY(0);
          },
          onPointerCancel: () => {
            drag.current = null;
            setDragY(0);
          },
        }
      : {};

  if (!mounted || typeof document === "undefined") return null;

  const reduced = slpPrefersReducedMotion();
  const dragging = drag.current !== null;
  const duration = mode === "sheet" ? SLP_MOTION.slow : SLP_MOTION.base;
  const hiddenTransform =
    mode === "sheet" ? "translateY(100%)" : mode === "popover" ? "translateY(4px)" : "scale(0.97) translateY(6px)";
  const panelStyle: CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: reduced ? undefined : shown ? (dragY ? `translateY(${dragY}px)` : undefined) : hiddenTransform,
    transition: dragging
      ? "none"
      : `opacity ${duration}ms ${SLP_MOTION.ease}, transform ${duration}ms ${SLP_MOTION.ease}`,
    ...(mode === "popover" ? { left: position?.left ?? -9999, top: position?.top ?? -9999 } : {}),
  };
  const body =
    kind === "menu" ? (
      <div role="menu" aria-label={title} onKeyDown={moveMenuFocus} className="py-1">
        {children}
      </div>
    ) : (
      children
    );

  return createPortal(
    <div
      data-slp-sheet={mode}
      className={cn(
        "pointer-events-none fixed inset-0 z-[10000] text-[var(--slurp-text)]",
        mode === "modal" && "flex items-center justify-center p-4",
      )}
      style={getSlpAccentStyle(accent)}
    >
      {mode !== "popover" && (
        <div
          aria-hidden="true"
          onClick={requestClose}
          className="pointer-events-auto absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          style={{ opacity: shown ? 1 : 0, transition: `opacity ${duration}ms ${SLP_MOTION.ease}` }}
        />
      )}
      <div
        ref={panelRef}
        role={kind === "dialog" ? "dialog" : undefined}
        aria-modal={kind === "dialog" && mode !== "popover" ? true : undefined}
        aria-label={kind === "dialog" ? title : undefined}
        tabIndex={-1}
        style={panelStyle}
        className={cn(
          "pointer-events-auto isolate flex flex-col overflow-hidden outline-none",
          mode === "sheet" &&
            "absolute inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[20px] bg-[color-mix(in_srgb,var(--noodle-accent)_7%,var(--slurp-glass))] shadow-[0_-18px_44px_-26px_color-mix(in_srgb,var(--noodle-accent)_70%,transparent),var(--slurp-highlight)] backdrop-blur-2xl",
          mode === "popover" &&
            "fixed w-72 max-h-[calc(100dvh-1.5rem)] rounded-2xl bg-[var(--slurp-surface-raised)] shadow-[var(--slurp-shadow-floating),var(--slurp-highlight)] ring-1 ring-inset ring-[var(--noodle-divider)]",
          mode === "modal" &&
            `relative w-full ${width} max-h-[min(88dvh,52rem)] rounded-[20px] bg-[var(--slurp-surface)] shadow-[var(--slurp-shadow-modal),var(--slurp-highlight)] ring-1 ring-inset ring-[var(--noodle-divider)]`,
        )}
      >
        {mode === "sheet" && (
          // The soft pink glow along the top edge of the glass.
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,color-mix(in_srgb,var(--noodle-accent)_22%,transparent),transparent)]"
          />
        )}
        {(mode !== "popover" || kind === "dialog") && (
          <div
            {...dragHandlers}
            className={cn(
              "shrink-0",
              mode === "sheet" ? "touch-none px-5 pb-2 pt-2" : mode === "modal" ? "px-5 pb-1 pt-5" : "px-4 pb-0 pt-3",
            )}
          >
            {mode === "sheet" && (
              <span
                aria-hidden="true"
                className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-[var(--slurp-muted)]/40"
              />
            )}
            <h2 className={cn(SLP_TYPE.title, "truncate")}>{title}</h2>
          </div>
        )}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            mode === "sheet" && "px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
            mode === "modal" && "px-3 pb-4",
            mode === "popover" && (kind === "menu" ? "px-1 py-1" : "px-2 pb-3"),
          )}
        >
          {body}
        </div>
      </div>
    </div>,
    portal ?? document.body,
  );
}

/** Arrow keys walk the rows of a menu; Tab stays trapped by the sheet. */
function moveMenuFocus(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)'));
  if (!items.length) return;
  event.preventDefault();
  const index = items.indexOf(document.activeElement as HTMLElement);
  const next = event.key === "ArrowDown" ? index + 1 : index - 1;
  items[(next + items.length) % items.length]?.focus();
}

/** A 44 px action row: an icon, then the label. Icons inherit the row's colour. */
export function SlpSheetItem({
  children,
  onSelect,
  tone = "default",
  disabled,
  expanded,
}: {
  children: ReactNode;
  onSelect: () => void;
  /** "muted" for operator (Creator tools) rows, "danger" for destructive ones. */
  tone?: "default" | "muted" | "danger";
  disabled?: boolean;
  /** For a row that opens a sub-list in place. */
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      aria-expanded={expanded}
      onClick={onSelect}
      className={cn(
        SLP_TYPE.body,
        "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start font-medium transition-colors duration-[var(--slurp-motion-fast)] hover:bg-[var(--accent)] focus-visible:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--slurp-focus)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:!text-current",
        tone === "muted" && "text-[var(--slurp-muted)]",
        tone === "danger" &&
          "text-[var(--slurp-danger)] hover:bg-[color-mix(in_srgb,var(--slurp-danger)_10%,transparent)]",
      )}
    >
      {children}
    </button>
  );
}

/** A labelled block of rows. The "Creator tools" group always comes last and stays quiet. */
export function SlpSheetGroup({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="border-t border-[var(--noodle-divider)] pt-1 first:border-t-0 first:pt-0"
    >
      {label && <p className={cn(SLP_TYPE.meta, "px-3 pb-1 pt-2 text-[var(--slurp-muted)]")}>{label}</p>}
      {children}
    </div>
  );
}

/** A 44 px radio row for "pick one" lists in a sheet (replaces native selects). */
export function SlpRadioRow({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        SLP_TYPE.body,
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 font-medium transition-colors duration-[var(--slurp-motion-fast)] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[var(--slurp-focus)] motion-reduce:transition-none",
        checked
          ? "bg-[var(--slurp-nav-active)] ring-1 ring-inset ring-[var(--noodle-accent)]/45"
          : "hover:bg-[var(--accent)]",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full ring-2 ring-inset",
          checked ? "ring-[var(--noodle-accent)]" : "ring-[var(--slurp-muted)]/50",
        )}
      >
        {checked && <span className="size-2.5 rounded-full bg-[var(--noodle-accent)]" />}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
