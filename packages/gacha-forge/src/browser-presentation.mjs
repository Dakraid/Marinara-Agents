// Maintained package source, inlined by the builder into the contributed bundle.
// The Engine owns Home chrome; the package only controls its own shadow root.
const forgeBrowserLayout = `
.gf-arena { padding: 0; align-items: stretch; }
.gf-stage { width: 100%; height: 100%; aspect-ratio: auto; justify-self: stretch; }
.ob-intake, .node-list, .sel-list, .vn-dock { width: 100%; max-width: none; }
/* Keep reward cards out of the Claim footer when the welcome artwork leaves little height. */
.ev-pane.nw { overflow-y: auto; }
.ev-pane.nw .nw-track { flex-shrink: 0; min-height: min-content; }
.ev-pane.nw .ev-week { flex-shrink: 0; grid-auto-rows: minmax(min-content, 1fr); }
@media (any-pointer: coarse), (pointer: coarse) {
  .ev-pane.nw .ev-claim { min-height: 44px; }
}
/* Portrait artwork leaves the same accent stroke at the foot as at its top. */
/* Home and chapter sheets are loaded lazily, so keep this ahead of their inset shorthand. */
.gf-stage .hm-plate, .gf-stage .vn-plate[data-side] { padding-bottom: var(--edge-w); }
.gf-stage .hm-art, .gf-stage .vn-plate[data-side] .vn-art { bottom: var(--edge-w); }
.gf-mute { display: inline-grid; place-items: center; padding: 0; cursor: pointer; }
.gf-mute svg { display: block; width: 1em; height: 1em; }
.gf-mute:focus-visible { outline: 2px solid var(--coral); outline-offset: -3px; }
.gf-mute.gf-mute-chapter {
  position: absolute; top: 50%; right: 44px; transform: translateY(-50%);
  width: 44px; height: 44px; border: 0; background: transparent; color: var(--text);
  font-size: 0.9rem; box-shadow: none; clip-path: none;
}
.vn-top:has(.gf-mute-chapter) { padding-right: 88px; }
.gf-stage > .gf-mute, .gf-rot > .gf-mute {
  position: absolute; z-index: 9; top: 0.55rem; right: 3rem;
  width: 1.9rem; height: 1.9rem; background: var(--ink); color: var(--text);
  border: 1px solid var(--steel-dark); clip-path: none;
}
.gf-audio-status {
  position: absolute; z-index: 8; inset: 3.5rem 0.75rem auto auto; max-width: min(36ch, calc(100% - 1.5rem)); padding: 0.5rem 0.75rem;
  background: var(--ink); color: var(--text); border: 1px solid var(--steel-dark);
  font: max(12px, var(--t-xs))/1.4 var(--body); overflow-wrap: anywhere; pointer-events: none;
}
/* Chapter artwork keeps a small icon in its header fade, with a full touch target. */
.vn-top:has(> .gf-fs-chapter) { min-height: 44px; }
.gf-fs-exit.gf-fs-chapter {
  top: 50%; right: 0; transform: translateY(-50%);
  width: 44px; height: 44px; padding: 0;
  background: transparent; border: 0; box-shadow: none; clip-path: none;
}
.gf-fs-chapter svg { width: 0.9rem; height: 0.9rem; }
.gf-fs-chapter:focus-visible { outline: 2px solid var(--coral); outline-offset: -4px; }
.cp-id-top .cp-fav, .cp-tabs > .sv-q {
  appearance: none; display: inline-flex; align-items: center; justify-content: center; padding: 0; line-height: 1;
}
.u-fav { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
.cp-fav svg, .cp-tabs > .sv-q svg, .u-fav svg { display: block; flex: none; margin: 0; }
.u-type {
  position: absolute; top: calc(var(--f) * 0.3); right: calc(var(--f) * 0.4); z-index: 1;
  display: grid; place-items: center; width: 1em; height: 1em;
  font-size: calc(var(--f) * 1.65); color: var(--text); pointer-events: none;
  filter: drop-shadow(0 1px 2px var(--ink));
}
.u-type svg { display: block; width: 1em; height: 1em; }
/* Rotating upright must not cover the only way out of in-app fullscreen. */
.gf-rot .gf-fs-portrait {
  position: absolute; top: 0.55rem; right: 0.55rem;
  display: inline-flex; padding: 0; width: 1.9rem; height: 1.9rem;
  background: var(--ink); color: var(--text); border: 1px solid var(--steel-dark);
  clip-path: none; border-radius: 0;
}
`;
const forgeFullscreenIcons = {
  enter:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 3h6v6m0-6-7 7M9 21H3v-6m0 6 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  exit: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 14h6v6m0-6-7 7M20 10h-6V4m0 6 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const forgeFullscreenButtons = ".gf-fs, .gf-fs-exit, .gf-fs-bar";

export function forgeUnitTypeBadge(unit, icons) {
  const key = String(unit.affinity ?? "")
    .trim()
    .toLowerCase();
  if (!Object.hasOwn(icons, key)) return "";
  const name = key[0].toUpperCase() + key.slice(1);
  return `<span class="u-type" role="img" aria-label="${name}" title="${name}">${icons[key]}</span>`;
}

export function syncForgeBrowserPresentation(host) {
  const control = host.capabilityProps?.browserFullscreen;
  if (!control) return;
  const active = control.active === true;
  for (const button of host._root.querySelectorAll(forgeFullscreenButtons)) {
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? control.exitLabel : control.enterLabel);
    button.title = active ? control.exitLabel : control.enterLabel;
    button.innerHTML = forgeFullscreenIcons[active ? "exit" : "enter"];
  }
}

export function wireForgeBrowserFullscreen(host) {
  const root = host._root;
  if (!root.querySelector("[data-forge-browser-layout]")) {
    const sheet = document.createElement("style");
    sheet.setAttribute("data-forge-browser-layout", "");
    sheet.textContent = forgeBrowserLayout;
    root.append(sheet);
  }
  // Only the visible roster page loads immediately; offscreen cards keep native lazy loading.
  const roster = root.querySelector('[data-screen="roster"] .grid-scroll');
  if (roster) {
    const viewport = roster.getBoundingClientRect();
    for (const image of roster.querySelectorAll(".u-photo")) {
      const box = image.getBoundingClientRect();
      if (
        box.bottom > viewport.top &&
        box.top < viewport.bottom &&
        box.right > viewport.left &&
        box.left < viewport.right
      ) {
        image.loading = "eager";
        image.decoding = "sync";
      }
    }
  }
  const rotationNotice = root.querySelector(".gf-rot");
  if (rotationNotice && !rotationNotice.querySelector(".gf-fs-portrait")) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gf-fs-exit gf-fs-portrait";
    rotationNotice.append(button);
  }
  const chapterHeader = root.querySelector(".vn-top");
  const chapterToggle = root.querySelector(".gf-stage > .gf-fs-exit, .vn-top > .gf-fs-chapter");
  if (chapterHeader && chapterToggle) {
    chapterToggle.classList.add("gf-fs-chapter");
    if (chapterToggle.parentElement !== chapterHeader) chapterHeader.append(chapterToggle);
  }
  for (const button of root.querySelectorAll(forgeFullscreenButtons)) {
    button.onclick = () => {
      const control = host.capabilityProps?.browserFullscreen;
      control?.setActive(!control.active);
    };
  }
  syncForgeBrowserPresentation(host);
}
