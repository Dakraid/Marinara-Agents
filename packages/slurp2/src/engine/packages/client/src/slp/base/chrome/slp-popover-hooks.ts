import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

/** Closes a menu or popover on Escape and on a tap outside `ref`. Every improvised menu shares this. */
export function useDismiss(open: boolean, onClose: () => void, ref: RefObject<HTMLElement | null>) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !ref.current?.contains(event.target)) onCloseRef.current();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, ref]);
}

// ponytail: the bottom nav is 48 px plus the safe inset; a fixed clearance stands in for reading it.
const BOTTOM_NAV_CLEARANCE = 96;
// ponytail: likewise for sticky headers (profile tab strip) that draw over a menu opened upward.
const TOP_STICKY_CLEARANCE = 128;

/**
 * True when the open menu would run under the bottom nav, so it opens upward instead. Measured once
 * per open, on the menu element.
 */
export function useFlipAboveNav(open: boolean, menuRef: RefObject<HTMLElement | null>) {
  const [flipUp, setFlipUp] = useState(false);
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) {
      setFlipUp(false);
      return;
    }
    const rect = menu.getBoundingClientRect();
    setFlipUp(rect.bottom > window.innerHeight - BOTTOM_NAV_CLEARANCE && rect.top - rect.height > TOP_STICKY_CLEARANCE);
  }, [open, menuRef]);
  return flipUp;
}

/** A horizontal shift that keeps the open panel inside the viewport (8 px margin) on narrow screens. */
export function useKeepInViewport(open: boolean, panelRef: RefObject<HTMLElement | null>) {
  const [shift, setShift] = useState(0);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) {
      setShift(0);
      return;
    }
    const rect = panel.getBoundingClientRect();
    const margin = 8;
    // Undo the shift already applied so a re-measure starts from the natural position.
    const left = rect.left - shift;
    const right = rect.right - shift;
    setShift(
      left < margin ? margin - left : right > window.innerWidth - margin ? window.innerWidth - margin - right : 0,
    );
  }, [open, panelRef]);
  return shift;
}
