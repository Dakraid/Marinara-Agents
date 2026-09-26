import { useEffect, useRef, useState } from "react";

// Motion tokens (design language §6). CSS reads the same values from `--slurp-motion-*` / `--slurp-ease`.
export const SLP_MOTION = {
  fast: 120,
  base: 200,
  slow: 320,
  /** Header and bottom nav hiding / coming back on scroll: slower than a sheet, so it reads as a glide. */
  bar: 360,
  ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

/**
 * The one reduced-motion check for imperative animation (Web Animations, timers). Rendered
 * components use framer's `useReducedMotion` or a `prefers-reduced-motion` media query.
 */
export function slpPrefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A number that counts from its last value to `value` (balance count-up / count-down). Jumps
 * straight to `value` under reduced motion and on first render.
 */
export function useSlpCountedValue(value: number | undefined, durationMs = 600): number | undefined {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);
  useEffect(() => {
    const from = shownRef.current;
    if (value === undefined || from === undefined || from === value || slpPrefersReducedMotion()) {
      shownRef.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + (value - from) * eased);
      shownRef.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);
  return shown;
}
