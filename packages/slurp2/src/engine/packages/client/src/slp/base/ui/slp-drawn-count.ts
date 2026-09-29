import { useEffect, useState } from "react";

/**
 * How many cards of a long list are drawn so far. A screen draws its first cards at once and the rest a
 * few at a time between frames, with a shimmer card below until they are all in: drawing every card in
 * one go blocked a phone for over a second on each switch back to the Hub or into a profile (0.3.6).
 */
export function useSlpDrawnCount(total: number): number {
  const [drawn, setDrawn] = useState(3);
  useEffect(() => {
    if (drawn >= total) return;
    // Safari has no requestIdleCallback; a short timeout still lets a frame paint in between.
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(() => setDrawn((count) => count + 3), { timeout: 200 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(() => setDrawn((count) => count + 3), 32);
    return () => window.clearTimeout(handle);
  }, [drawn, total]);
  return drawn;
}
