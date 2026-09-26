// ──────────────────────────────────────────────
// Ambient canvas (de-vibe pass): the room behind the app on a wide screen takes a soft wash of
// colour from the biggest photo in view, like a TV's ambient light. It replaces the three radial
// orbs. Calm on purpose: it looks again at most once a second, only changes when another photo
// leads, and cross-fades slowly; no fade under reduced motion.
// ──────────────────────────────────────────────
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { slpPrefersReducedMotion } from "../../base/chrome/slp-motion";
import { slpLeadingPhotoSrc } from "./slp-canvas-ambient";

// A tiny, blurred copy of the photo scaled up to fill the room: the blur is paid on 4 % of the
// area, so it stays cheap on a 1680 px frame.
const LAYER: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  width: "4%",
  height: "4%",
  transform: "scale(25)",
  transformOrigin: "0 0",
  backgroundSize: "cover",
  backgroundPosition: "center",
  filter: "blur(1.6px) saturate(1.35)",
};

export function SlpCanvasAmbient() {
  const ref = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<{ current: string | null; previous: string | null }>({
    current: null,
    previous: null,
  });

  useEffect(() => {
    const frame = ref.current?.parentElement;
    if (!frame) return;
    const look = () => {
      if (document.visibilityState !== "visible") return;
      const src = slpLeadingPhotoSrc(frame);
      if (src) setLayers((now) => (now.current === src ? now : { current: src, previous: now.current }));
    };
    look();
    const timer = window.setInterval(look, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const still = slpPrefersReducedMotion();
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-slp-canvas-ambient=""
      className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden opacity-[0.22] @min-[1024px]:block"
    >
      {layers.previous && !still && (
        <div key={layers.previous} style={{ ...LAYER, backgroundImage: `url("${layers.previous}")` }} />
      )}
      {layers.current && (
        <div
          key={layers.current}
          className={still ? undefined : "slp-ambient-in"}
          style={{ ...LAYER, backgroundImage: `url("${layers.current}")` }}
        />
      )}
    </div>
  );
}
