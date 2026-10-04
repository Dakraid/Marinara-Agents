import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Polls `callback` every `intervalMs` ONLY while the element is on screen and the document is
 * visible (DESIGN §3: "Panel polls while visible (2s active, pause when hidden)"). Returns a
 * callback ref for the observed root — a ref rather than a RefObject so swapping the root
 * (sessions list ↔ session detail ↔ verdict queue) re-observes the new node instead of watching
 * a detached one. Without an IntersectionObserver the document state alone gates polling. The
 * first tick fires immediately on activation so reopening the panel never shows stale data.
 */
export function useVisiblePoll(callback: () => void, intervalMs: number, enabled = true) {
  const saved = useRef(callback);
  saved.current = callback;
  const [node, setNode] = useState<HTMLElement | null>(null);
  const observeRef = useCallback((element: HTMLElement | null) => setNode(element), []);
  const [elementVisible, setElementVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(
    typeof document === "undefined" ? true : document.visibilityState === "visible",
  );

  useEffect(() => {
    if (!node || typeof IntersectionObserver === "undefined") {
      setElementVisible(true); // no observer: fall back to document visibility alone
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      setElementVisible(entries.some((entry) => entry.isIntersecting));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  useEffect(() => {
    const onVisibilityChange = () => setDocumentVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const active = enabled && elementVisible && documentVisible;
  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    let timer = 0;
    const tick = () => {
      if (cancelled) return;
      saved.current();
      timer = window.setTimeout(tick, intervalMs);
    };
    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, intervalMs]);

  return observeRef;
}
