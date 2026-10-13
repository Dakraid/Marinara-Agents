// Motion settings and screen transition effects
import { S } from "./state.js";

const MOTION_KEY = "mls-motion";
const MOTION_MODES = ["full", "short", "off"];
function motionMode() {
  try {
    const stored = localStorage.getItem(MOTION_KEY);
    return MOTION_MODES.includes(stored) ? stored : "full";
  } catch {
    return "full";
  }
}
function setMotionMode(mode) {
  try {
    localStorage.setItem(MOTION_KEY, MOTION_MODES.includes(mode) ? mode : "full");
  } catch {
    // Best effort: nothing to do when this fails.
  }
  FX.mode = MOTION_MODES.includes(mode) ? mode : "full";
}
const systemWantsLess = () => {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};
const FX = {
  mode: null,
  running: new Set(),
  skipUntil: 0,
  typing: null,
  tap: null,
  last: null,
  live: null,
  layer: null,
  top: null,
};
const fxMode = () => (FX.mode ??= motionMode());
const fxOff = () => fxMode() === "off";
const fxQuick = () => fxMode() === "short" || systemWantsLess();
const fxT = (ms) => (fxOff() ? 0 : fxQuick() ? Math.min(ms, 150) : ms);
const FX_OUT = "cubic-bezier(.2,.85,.25,1)";
const FX_IN = "cubic-bezier(.55,0,.85,.35)";
function fxAnim(el, keyframes, opts = {}) {
  if (!el || fxOff() || typeof el.animate != "function") {
    return null;
  }
  const anim = el.animate(keyframes, {
    duration: fxT(opts.duration ?? 220),
    delay: fxT(opts.delay ?? 0) - (opts.elapsed ?? 0),
    easing: opts.easing ?? FX_OUT,
    fill: opts.fill ?? "backwards",
  });
  FX.running.add(anim);
  const forget = () => FX.running.delete(anim);
  anim.finished.then(forget, forget);
  if (performance.now() < FX.skipUntil) {
    anim.finish();
  }
  return anim;
}
const fxEnded = (anim) => (anim ? anim.finished.catch(() => {}) : Promise.resolve());
function motionSkip() {
  if (!FX.running.size && !FX.typing) {
    return false;
  }
  const interrupted = !!FX.typing || (!!FX.live && FX.live.how !== "morph" && performance.now() < FX.live.until);
  FX.skipUntil = performance.now() + 150;
  for (const anim of [...FX.running]) {
    anim.finish();
  }
  fxFinishTyping();
  return interrupted;
}
function motionTap(ev) {
  const target = ev.target.closest?.("[data-do]");
  if (!target) {
    return;
  }
  const box =
    target.closest(".mls-place, .mls-door, .mls-mm, .mls-slot") ??
    (target.matches(".app") ? target.querySelector("i") : target) ??
    target;
  FX.tap = {
    action: target.dataset.do,
    box: fxBox(box),
    at: performance.now(),
  };
}
const fxTapped = (...actions) =>
  FX.tap && performance.now() - FX.tap.at < 9e3 && actions.includes(FX.tap.action) ? FX.tap.box : null;
const fxBox = (el) => {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
};
const fxShown = (el) => {
  const rect = el.getBoundingClientRect();
  return rect.width > 2 && rect.height > 2;
};
const fxScreen = (root) => [...root.children].find((child) => !child.matches(".mls-loading"));
function fxVisible(el) {
  let { left: left, top: topEdge, right: right, bottom: bottom } = el.getBoundingClientRect();
  bottom = Math.max(bottom, topEdge + el.scrollHeight);
  right = Math.max(right, left + el.scrollWidth);
  for (let ancestor = el.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (!/(auto|scroll|hidden)/.test(style.overflowY + style.overflowX)) {
      continue;
    }
    const rect = ancestor.getBoundingClientRect();
    left = Math.max(left, rect.left);
    topEdge = Math.max(topEdge, rect.top);
    right = Math.min(right, rect.right);
    bottom = Math.min(bottom, rect.bottom);
  }
  left = Math.max(left, 0);
  topEdge = Math.max(topEdge, 0);
  right = Math.min(right, innerWidth);
  bottom = Math.min(bottom, innerHeight);
  return {
    left: left,
    top: topEdge,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - topEdge),
  };
}
function fxLayers(root) {
  if (!FX.layer) {
    FX.layer = document.createElement("div");
    FX.layer.className = "mls mls-fx-layer";
    FX.top = document.createElement("div");
    FX.top.className = "mls mls-fx-layer top";
    document.body.append(FX.layer, FX.top);
  }
  const box = fxVisible(root);
  for (const layer of [FX.layer, FX.top]) {
    Object.assign(layer.style, {
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
    });
    for (const cls of ["narrow", "cut"]) {
      layer.classList.toggle(cls, root.classList.contains(cls));
    }
  }
  return FX.layer;
}
function motionGone() {
  FX.layer?.remove();
  FX.top?.remove();
  FX.layer = FX.top = null;
}
const FX_KEYS = [
  {
    sel: ".mls-person[data-character]",
    key: (el) => `p:${el.dataset.character}`,
    in: "left",
    out: "left",
  },
  {
    sel: ".mls-scene .sprite",
    key: (el, sig) => `p:${sig.sceneWho}`,
    in: "right",
    out: "fade",
  },
  {
    sel: ".mls-place-title h1",
    key: () => "title",
    in: "left",
    out: "left",
  },
  {
    sel: ".mls-place-title .meta",
    key: () => "meta",
    in: "left",
    out: "left",
  },
  {
    sel: ".mls-everyone",
    key: () => "everyone",
    in: "left",
    out: "left",
  },
  {
    sel: ".mls-acts",
    key: (el, sig) => `side|acts:${sig.homePanel ?? ""}`,
    region: true,
  },
  {
    sel: ".mls-talk",
    key: (el, sig) => `side|${sig.talkTo}:${sig.gift ? "gift" : ""}`,
    region: true,
  },
  {
    sel: ".mls-cal .grid",
    key: (el, sig) => `season|${sig.calSeason}`,
    region: true,
  },
  {
    sel: ".mls-card-veil",
    key: () => "card-veil",
    in: "none",
    out: "fade",
  },
  {
    sel: ".mls-card",
    key: () => "card",
    in: "none",
    out: "card",
  },
  {
    sel: ".mls-phone-veil",
    key: () => "phone-veil",
    in: "fade",
    out: "fade",
  },
  {
    sel: ".mls-phone",
    key: () => "phone",
    pop: ".mls-phone-fab",
  },
  {
    sel: ".mls-bag-veil",
    key: () => "bag-veil",
    in: "fade",
    out: "fade",
  },
  {
    sel: ".mls-bag",
    key: () => "bag",
    pop: ".mls-phone-fab",
  },
  {
    sel: ".mls-ask",
    key: () => "ask",
    in: "pop",
    out: "fade",
  },
  {
    sel: ".mls-changelog",
    key: () => "changelog",
    in: "pop",
    out: "fade",
  },
  {
    sel: ".mls-contacts main.sheet",
    key: (el, sig) => `sheet|${sig.sheet}`,
    region: true,
  },
  {
    sel: ".mls-contacts .portrait",
    key: (el, sig) => `face:${sig.sheet}`,
  },
  {
    sel: ".mls-settings .mls-tab-body",
    key: (el, sig) => `tab|${sig.tab}`,
    region: true,
  },
  {
    sel: ".mls-you .mls-you-tab",
    key: (el, sig) => `ytab|${sig.youTab}`,
    region: true,
  },
  {
    sel: ".mls-contacts .mls-sheet-tab",
    key: (el, sig) => `stab|${sig.sheetTab}`,
    region: true,
  },
  {
    sel: ".mls-scene .mls-turn",
    key: () => "turn",
    in: "up",
    out: "down",
    deal: "right",
  },
  {
    sel: ".mls-scene .mls-decide",
    key: () => "decide",
    in: "up",
    out: "down",
    deal: "right",
  },
  {
    sel: ".mls-scene .mls-summary",
    key: () => "summary",
    in: "pop",
    out: "fade",
    deal: "up",
  },
  {
    sel: ".mls-shop .cat > .mls-till, .mls-shop .cat > .mls-said",
    key: (el, sig) => `shop-said:${sig.shopPaid}`,
    in: "down",
    out: "fade",
  },
  {
    sel: ".mls-shop .items",
    key: () => "shop-items",
    move: true,
  },
  {
    sel: ".mls-shop .cart",
    key: (el, sig) => `cart|${sig.shopPaid}`,
    region: true,
  },
];
const FX_SOURCES = [
  {
    sel: ".mls-contact[data-character] .av",
    key: (el) => `face:${el.closest("[data-character]").dataset.character}`,
  },
  {
    sel: ".mls-dcard[data-district]",
    key: (el) => `dcard:${el.dataset.district}`,
  },
];
function fxPieces(root, sig) {
  const pieces = new Map();
  for (const spec of FX_KEYS) {
    for (const el of root.querySelectorAll(spec.sel)) {
      const key = spec.key(el, sig),
        slot = spec.region ? key.split("|")[0] : key;
      if (key && !pieces.has(slot)) {
        pieces.set(slot, {
          el: el,
          key: key,
          k: spec,
        });
      }
    }
  }
  return pieces;
}
function motionSig(state) {
  return {
    view: state.view,
    at: state.life?.at ?? null,
    homeAt: state.life?.homeAt ?? null,
    corridor: state.corridor ?? null,
    inside: state.life?.places?.find((place) => place.id === state.life?.at)?.inside ?? null,
    rackPick: state.rackPick ?? null,
    talkTo: state.talkTo ?? null,
    phone: !!state.phone,
    sheet: state.sheet?.id ?? null,
    card: !!state.card,
    faint: !!state.faint,
    faintStep: state.faint?.step ?? null,
    seg: state.sceneSeg ?? 0,
    sceneLog: state.life?.scene?.log?.length ?? 0,
    sceneWho: state.life?.scene?.characterId ?? null,
    tab: state.settingsTab ?? "look",
    life: state.life?.id ?? null,
    homePanel: state.homePanel ?? null,
    bag: !!state.bag,
    ask: !!state.ask,
    gift: !!state.talk?.[state.talkTo]?.picking,
    calSeason: state.cal?.offset ?? 0,
    town: !!state.town,
    district: state.life?.district ?? null,
    shopPaid: state.shopPaid ?? 0,
    titleTab: state.titleTab ?? "",
    changelog: !!state.changelogOpen,
    youTab: state.youTab ?? "skills",
    sheetTab: state.sheetTab ?? "about",
    contactsMode: state.contactsMode ?? "list",
  };
}
const FX_FLOW = ["create", "cast-review", "week"];
const FX_TABS = ["look", "motion", "cast", "rules", "model", "prompts", "debug"];
const FX_YOU_TABS = ["skills", "money", "work", "people"];
const FX_SHEET_TABS = ["about", "us", "life", "looks", "memories", "adult"];
const FX_APPS = ["you", "contacts", "settings", "shop", "calendar", "gallery", "news", "jobs", "guide"];
const fxCardOf = (sig) =>
  sig.view === "corridor" ? sig.corridor : sig.at === "home" ? sig.homeAt : (sig.inside ?? sig.at);
function motionMoveFor(prev, next, tapped = () => null) {
  if (!prev || prev.view === "loading" || next.view === "loading") {
    return null;
  }
  if (prev.faint || next.faint) {
    return prev.faint
      ? next.faint
        ? prev.faintStep === next.faintStep
          ? null
          : {
              how: "fade",
              ms: next.faintStep === 2 || next.faintStep === 3 ? 900 : 350,
              deal: next.faintStep === 4 ? ".mls-faint .bill" : null,
            }
        : {
            how: "fade",
            ms: 600,
          }
      : {
          how: "fade",
          ms: 700,
        };
  }
  if (prev.view !== next.view) {
    if (next.view === "title") {
      return {
        how: "wipe",
        back: true,
      };
    }
    if (prev.view === "title") {
      return {
        how: "wipe",
      };
    }
    if (FX_FLOW.includes(prev.view) && FX_FLOW.includes(next.view)) {
      return {
        how: "slide",
        back: FX_FLOW.indexOf(next.view) < FX_FLOW.indexOf(prev.view),
      };
    }
    if (next.view === "scene") {
      return {
        how: "wipe",
      };
    }
    if (prev.view === "scene") {
      return {
        how: "wipe",
        back: true,
      };
    }
    if (prev.view === "map" && (next.view === "place" || next.view === "corridor")) {
      const box = tapped("enter", "go", "corridor");
      return box
        ? {
            how: "open",
            from: box,
          }
        : {
            how: "wipe",
          };
    }
    if (prev.view === "corridor" && next.view === "place") {
      const box = tapped("go-in", "store-in");
      return box
        ? {
            how: "open",
            from: box,
          }
        : {
            how: "slide",
          };
    }
    if (prev.view === "place" && next.view === "corridor") {
      return {
        how: "close",
        to: next.corridor === "mall" ? `.mls-door[data-unit="${prev.at}"]` : ".mls-door [data-do=go-in]",
      };
    }
    if ((prev.view === "shop" || prev.view === "rack") && next.view === "place") {
      return {
        how: "slide",
        back: true,
      };
    }
    if (FX_APPS.includes(next.view) && !FX_APPS.includes(prev.view)) {
      const box = tapped(...FX_APPS);
      if (box) {
        return {
          how: "open",
          from: box,
        };
      }
    }
    return prev.view === "map" && FX_APPS.includes(next.view)
      ? {
          how: "slide",
        }
      : FX_APPS.includes(prev.view) && next.view === "map"
        ? {
            how: "close",
            to: ".mls-phone-fab",
          }
        : (prev.view === "place" || prev.view === "corridor") && next.view === "map"
          ? {
              how: "close",
              to: `.mls-place[data-place="${fxCardOf(prev)}"]`,
            }
          : next.view === "map" || next.view === "painting"
            ? {
                how: "wipe",
              }
            : {
                how: "slide",
              };
  }
  if (prev.view === "title" && next.view === "title" && prev.titleTab !== next.titleTab) {
    return null;
  }
  if (prev.view === "map" && next.view === "map" && prev.town !== next.town) {
    return next.town
      ? {
          how: "close",
          to: `.mls-dcard[data-district="${prev.district}"]`,
        }
      : {
          how: "open",
          fromKey: `src:dcard:${next.district}`,
        };
  }
  if (prev.view === "contacts" && next.view === "contacts" && prev.contactsMode !== next.contactsMode) {
    const box = prev.contactsMode === "chart" && next.sheet ? tapped("sheet") : null;
    return box
      ? {
          how: "open",
          from: box,
          deal: false,
        }
      : {
          how: "slide",
          back: next.contactsMode === "list",
        };
  }
  if (prev.view === "contacts" && next.view === "contacts" && next.sheet && prev.sheet !== next.sheet) {
    const box = tapped("sheet");
    if (box) {
      return {
        how: "open",
        from: box,
        deal: false,
      };
    }
  }
  return (prev.phone && !next.phone && tapped(...FX_APPS)) ||
    (prev.view === "scene" && next.view === "scene" && prev.sceneWho === next.sceneWho)
    ? null
    : {
        how: "morph",
        back:
          (!next.talkTo && !!prev.talkTo) ||
          (prev.tab !== next.tab && FX_TABS.indexOf(next.tab) < FX_TABS.indexOf(prev.tab)) ||
          (prev.youTab !== next.youTab && FX_YOU_TABS.indexOf(next.youTab) < FX_YOU_TABS.indexOf(prev.youTab)) ||
          (prev.sheetTab !== next.sheetTab &&
            FX_SHEET_TABS.indexOf(next.sheetTab) < FX_SHEET_TABS.indexOf(prev.sheetTab)) ||
          (!!prev.homePanel && !next.homePanel) ||
          (prev.gift && !next.gift) ||
          next.calSeason < prev.calSeason,
      };
}
const FX_FROM = {
  left: {
    translate: "-46px 0",
  },
  right: {
    translate: "46px 0",
  },
  up: {
    translate: "0 34px",
  },
  down: {
    translate: "0 -30px",
  },
  pop: {
    scale: ".8",
  },
  fade: {},
};
function fxEnter(el, dir = "up", delay = 0, opts = {}) {
  return dir === "none"
    ? null
    : fxQuick()
      ? fxAnim(
          el,
          [
            {
              opacity: 0,
            },
            {
              opacity: 1,
            },
          ],
          {
            duration: 150,
            delay: Math.min(delay, 60),
            elapsed: opts.elapsed,
          },
        )
      : fxAnim(
          el,
          [
            {
              opacity: 0,
              ...FX_FROM[dir],
            },
            {
              opacity: 1,
              translate: "0 0",
              scale: "1",
            },
          ],
          {
            duration: opts.ms ?? 280,
            delay: delay,
            elapsed: opts.elapsed,
            easing: dir === "pop" ? "cubic-bezier(.2,1.3,.4,1)" : FX_OUT,
          },
        );
}
const FX_TO = {
  left: {
    translate: "-60px 0",
  },
  right: {
    translate: "60px 0",
  },
  fade: {},
  down: {
    translate: "0 40px",
  },
  card: {
    translate: "160px 30px",
    rotate: "10deg",
  },
};
function fxLeave(el, dir = "fade", duration = 200) {
  return dir === "none"
    ? null
    : fxQuick()
      ? fxAnim(
          el,
          [
            {
              opacity: 1,
            },
            {
              opacity: 0,
            },
          ],
          {
            duration: 150,
            fill: "forwards",
          },
        )
      : fxAnim(
          el,
          [
            {
              opacity: 1,
            },
            {
              opacity: 0,
              ...FX_TO[dir],
            },
          ],
          {
            duration: duration,
            easing: FX_IN,
            fill: "forwards",
          },
        );
}
function fxDeal(root, delay, elapsed = 0) {
  const groups = [
    [".mls-map .mls-place", "up"],
    [".mls-place-screen .mls-activity", "right"],
    [".mls-place-screen .mls-person", "up"],
    [".mls-place-title h1, .mls-place-title .meta", "left"],
    [".mls-door", "up"],
    [".mls-contact", "left"],
    [".mls-scene .sprite", "right"],
    [".mls-scene .box", "up"],
    [".mls-life, .mls-cont", "up"],
  ];
  for (const [sel, dir] of groups) {
    [...root.querySelectorAll(sel)].slice(0, 14).forEach((el, idx) =>
      fxEnter(el, dir, delay + idx * 40, {
        elapsed: elapsed,
      }),
    );
  }
}
function fxWipe(move, snap) {
  const width = FX.layer.clientWidth,
    dir = move.back ? -1 : 1,
    duration = 520,
    travel = width * 2.05;
  FX.layer.append(snap.ghost);
  const wipe = document.createElement("div");
  wipe.className = `mls-fx-wipe ${move.back ? "back" : ""}`;
  wipe.innerHTML = "<i></i>";
  Object.assign(wipe.style, {
    width: `${width * 1.9}px`,
    left: `${-width * 0.45}px`,
  });
  FX.top.append(wipe);
  fxEnded(
    fxAnim(
      wipe,
      [
        {
          transform: `translateX(${-dir * travel}px) skewX(-16deg)`,
          easing: "cubic-bezier(.35,0,.25,1)",
        },
        {
          transform: `translateX(${-dir * width * 0.04}px) skewX(-16deg)`,
          offset: 0.46,
          easing: "linear",
        },
        {
          transform: `translateX(${dir * width * 0.04}px) skewX(-16deg)`,
          offset: 0.54,
          easing: "cubic-bezier(.75,0,.65,1)",
        },
        {
          transform: `translateX(${dir * travel}px) skewX(-16deg)`,
        },
      ],
      {
        duration: duration,
        easing: "linear",
        fill: "forwards",
      },
    ),
  ).then(() => wipe.remove());
  fxEnded(
    fxAnim(
      snap.ghost,
      [
        {
          opacity: 1,
        },
        {
          opacity: 1,
          offset: 0.46,
        },
        {
          opacity: 0,
          offset: 0.47,
        },
        {
          opacity: 0,
        },
      ],
      {
        duration: duration,
        easing: "linear",
        fill: "forwards",
      },
    ),
  ).then(() => snap.ghost.remove());
  return (screen, elapsed = 0) => fxDeal(screen, duration * 0.5, elapsed);
}
function fxFrame(box, closing) {
  const frame = document.createElement("div");
  frame.className = "mls-fx-frame";
  FX.top.append(frame);
  const layerRect = FX.top.getBoundingClientRect(),
    width = layerRect.width,
    height = layerRect.height,
    boxFrame = {
      left: `${box.left - layerRect.left}px`,
      top: `${box.top - layerRect.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      opacity: 1,
    },
    fullFrame = {
      left: "0px",
      top: "0px",
      width: `${width}px`,
      height: `${height}px`,
      opacity: 0,
    };
  fxEnded(
    fxAnim(
      frame,
      closing
        ? [
            fullFrame,
            {
              ...boxFrame,
              offset: 0.85,
            },
            {
              ...boxFrame,
              opacity: 0,
            },
          ]
        : [
            boxFrame,
            {
              ...fullFrame,
              opacity: 1,
              offset: 0.8,
            },
            fullFrame,
          ],
      {
        duration: closing ? 420 : 460,
        easing: closing ? "cubic-bezier(.5,0,.3,1)" : "cubic-bezier(.25,.8,.25,1)",
        fill: "forwards",
      },
    ),
  ).then(() => frame.remove());
}
const fxHole = (outer, inner) => {
  const x1 = inner.left - outer.left,
    y1 = inner.top - outer.top,
    x2 = x1 + inner.width,
    y2 = y1 + inner.height,
    width = outer.width,
    height = outer.height;
  return `polygon(evenodd, 0px 0px, ${width}px 0px, ${width}px ${height}px, 0px ${height}px, 0px 0px, ${x1}px ${y1}px, ${x2}px ${y1}px, ${x2}px ${y2}px, ${x1}px ${y2}px, ${x1}px ${y1}px)`;
};
const fxInset = (outer, inner) =>
  `inset(${inner.top - outer.top}px ${outer.left + outer.width - inner.left - inner.width}px ${outer.top + outer.height - inner.top - inner.height}px ${inner.left - outer.left}px)`;
function fxOpen(move, snap) {
  FX.layer.append(snap.ghost);
  const box = fxBox(snap.ghost),
    grown = {
      left: box.left - 2,
      top: box.top - 2,
      width: box.width + 4,
      height: box.height + 4,
    };
  fxEnded(
    fxAnim(
      snap.ghost,
      [
        {
          clipPath: fxHole(box, move.from),
          filter: "brightness(1)",
        },
        {
          clipPath: fxHole(box, grown),
          filter: "brightness(.3)",
        },
      ],
      {
        duration: 460,
        easing: "cubic-bezier(.25,.8,.25,1)",
        fill: "forwards",
      },
    ),
  ).then(() => snap.ghost.remove());
  fxFrame(move.from, false);
  return (screen, elapsed = 0) => {
    fxAnim(
      screen.querySelector(":scope > .scene, :scope > .backdrop, .scene.has-pic"),
      [
        {
          scale: "1.25",
        },
        {
          scale: "1",
        },
      ],
      {
        duration: 620,
        elapsed: elapsed,
      },
    );
    if (move.deal !== false) {
      fxDeal(screen, 460 * 0.55, elapsed);
    }
  };
}
function fxClose(move, snap, screen) {
  const target = screen.querySelector(move.to);
  if (!target) {
    return fxFade(move, snap);
  }
  const targetBox = fxBox(target.closest(".mls-place, .mls-door") ?? target);
  FX.layer.append(snap.ghost);
  const box = fxBox(snap.ghost);
  fxEnded(
    fxAnim(
      snap.ghost,
      [
        {
          clipPath: fxInset(box, box),
          opacity: 1,
        },
        {
          clipPath: fxInset(box, targetBox),
          opacity: 1,
          offset: 0.85,
        },
        {
          clipPath: fxInset(box, targetBox),
          opacity: 0,
        },
      ],
      {
        duration: 420,
        easing: "cubic-bezier(.5,0,.3,1)",
        fill: "forwards",
      },
    ),
  ).then(() => snap.ghost.remove());
  fxFrame(targetBox, true);
  return (screen2, elapsed = 0) => {
    fxAnim(
      screen2,
      [
        {
          filter: "brightness(.3)",
        },
        {
          filter: "brightness(1)",
        },
      ],
      {
        duration: 420,
        elapsed: elapsed,
      },
    );
    const target2 = screen2.querySelector(move.to);
    fxAnim(
      target2?.closest(".mls-place, .mls-door") ?? target2,
      [
        {
          scale: "1",
        },
        {
          scale: "1.08",
          offset: 0.5,
        },
        {
          scale: "1",
        },
      ],
      {
        duration: 260,
        delay: 420 * 0.85,
        easing: "ease-out",
        elapsed: elapsed,
      },
    );
  };
}
function fxSlide(move, snap) {
  const dir = move.back ? -1 : 1;
  FX.layer.append(snap.ghost);
  fxEnded(
    fxAnim(
      snap.ghost,
      [
        {
          opacity: 1,
        },
        {
          opacity: 0,
          translate: `${-dir * 70}px 0`,
          rotate: `${-dir}deg`,
        },
      ],
      {
        duration: 180,
        easing: FX_IN,
        fill: "forwards",
      },
    ),
  ).then(() => snap.ghost.remove());
  return (screen, elapsed = 0) =>
    fxAnim(
      screen,
      [
        {
          opacity: 0,
          translate: `${dir * 90}px 0`,
          rotate: `${dir * 1.2}deg`,
        },
        {
          opacity: 1,
          translate: "0 0",
          rotate: "0deg",
        },
      ],
      {
        duration: 240,
        delay: 50,
        elapsed: elapsed,
      },
    );
}
function fxFade(move, snap) {
  FX.layer.append(snap.ghost);
  const duration = fxQuick() ? 150 : (move.ms ?? 200);
  fxEnded(
    fxAnim(
      snap.ghost,
      [
        {
          opacity: 1,
        },
        {
          opacity: 0,
        },
      ],
      {
        duration: duration,
        easing: move.ms ? "ease-in-out" : "linear",
        fill: "forwards",
      },
    ),
  ).then(() => snap.ghost.remove());
  return (screen, elapsed = 0) => {
    const dealEl = move.deal && screen.querySelector(move.deal);
    if (dealEl) {
      fxEnter(dealEl, "up", duration * 0.6, {
        elapsed: elapsed,
      });
    }
  };
}
function fxFlip(el, from, duration = 420, elapsed = 0, moveOnly = false) {
  const rect = el.getBoundingClientRect();
  if (
    !rect.width ||
    !rect.height ||
    fxQuick() ||
    (moveOnly && Math.abs(from.left - rect.left) < 1 && Math.abs(from.top - rect.top) < 1)
  ) {
    return null;
  }
  const start = {
    transformOrigin: "0 0",
    translate: `${from.left - rect.left}px ${from.top - rect.top}px`,
  };
  if (!moveOnly) {
    start.scale = `${from.width / rect.width} ${from.height / rect.height}`;
  }
  return fxAnim(
    el,
    [
      start,
      {
        transformOrigin: "0 0",
        translate: "0 0",
        ...(moveOnly
          ? {}
          : {
              scale: "1 1",
            }),
      },
    ],
    {
      duration: duration,
      easing: "cubic-bezier(.2,.8,.2,1)",
      elapsed: elapsed,
    },
  );
}
const fxInside = (el, els) => els.some((other) => other !== el && other.contains(el));
function fxMorph(move, snap, screen, sig) {
  const ghost = snap.ghost;
  ghost.classList.add("only");
  FX.layer.append(ghost);
  const dir = move.back ? -1 : 1,
    pending = [],
    keep = (el) => el.classList.add("keep"),
    oldPieces = fxPieces(ghost, snap.sig),
    parentOf = (el) => el.parentElement ?? el,
    newPieces = fxPieces(parentOf(screen), sig),
    leftRegions = [],
    narrow = !!screen.closest?.(".mls.narrow"),
    leaveMs = narrow ? 130 : 170,
    enterDelay = narrow ? 140 : 60;
  for (const [slot, piece] of oldPieces) {
    if (!piece.k.region) {
      continue;
    }
    const next = newPieces.get(slot);
    if (!next || next.key !== piece.key) {
      keep(piece.el);
      leftRegions.push(piece.el);
      pending.push(fxEnded(fxLeave(piece.el, next ? (dir > 0 ? "left" : "right") : "fade", leaveMs)));
    }
  }
  for (const [slot, piece] of oldPieces) {
    if (piece.k.region || fxInside(piece.el, leftRegions) || !fxShown(piece.el)) {
      continue;
    }
    const next = newPieces.get(slot);
    if (piece.k.pop && !next) {
      keep(piece.el);
      pending.push(fxShrinkInto(piece.el, parentOf(screen).querySelector(piece.k.pop)));
      continue;
    }
    if (!next || !fxShown(next.el)) {
      keep(piece.el);
      pending.push(fxEnded(fxLeave(piece.el, piece.k.out ?? "fade", piece.k.out === "card" ? 260 : 200)));
    }
  }
  Promise.all(pending).then(() => ghost.remove());
  return (screen2, elapsed = 0) => {
    const pieces = fxPieces(parentOf(screen2), sig),
      entered = [];
    for (const [slot, piece] of pieces) {
      if (!piece.k.region) {
        continue;
      }
      const prev = oldPieces.get(slot);
      if (!prev || prev.key !== piece.key) {
        fxEnter(piece.el, prev ? (dir > 0 ? "right" : "left") : "fade", enterDelay, {
          ms: 260,
          elapsed: elapsed,
        });
        entered.push(piece.el);
        [
          ...piece.el.querySelectorAll(
            ".mls-bondbox, .mls-opt, .mls-intro, .mls-event, .mls-activity, .hero, .portrait-col, section",
          ),
        ]
          .slice(0, 10)
          .forEach((child, idx) =>
            fxEnter(child, "right", 110 + idx * 45, {
              elapsed: elapsed,
            }),
          );
      }
    }
    let order = 0;
    for (const [, piece] of pieces) {
      if (piece.k.region || !fxShown(piece.el)) {
        continue;
      }
      const inside = fxInside(piece.el, entered),
        rect = snap.rects[piece.key] ?? (inside ? snap.rects[`src:${piece.key}`] : null);
      if (rect) {
        fxFlip(piece.el, rect, 440, elapsed, !!piece.k.move);
        continue;
      }
      if (!inside) {
        if (piece.k.pop) {
          fxGrowFrom(piece.el, parentOf(screen2).querySelector(piece.k.pop), elapsed);
          continue;
        }
        fxEnter(piece.el, piece.k.in ?? "up", 40 + order++ * 45, {
          elapsed: elapsed,
        });
        if (piece.k.deal) {
          [...piece.el.children].forEach((child, idx) =>
            fxEnter(child, piece.k.deal, 120 + idx * 55, {
              elapsed: elapsed,
            }),
          );
        }
      }
    }
  };
}
function fxTowards(el, target) {
  const from = el.getBoundingClientRect(),
    to = target.getBoundingClientRect();
  return {
    translate: `${to.left + to.width / 2 - (from.left + from.width / 2)}px ${to.top + to.height / 2 - (from.top + from.height / 2)}px`,
    scale: `${Math.max(0.08, to.width / from.width)}`,
  };
}
function fxGrowFrom(el, source, elapsed) {
  return !source || fxQuick()
    ? fxEnter(el, "fade", 0, {
        elapsed: elapsed,
      })
    : fxAnim(
        el,
        [
          {
            ...fxTowards(el, source),
            opacity: 0,
          },
          {
            opacity: 1,
            offset: 0.3,
          },
          {
            translate: "0 0",
            scale: "1",
            opacity: 1,
          },
        ],
        {
          duration: 380,
          easing: "cubic-bezier(.16,.84,.44,1)",
          elapsed: elapsed,
        },
      );
}
function fxShrinkInto(el, target) {
  return !target || fxQuick()
    ? fxEnded(fxLeave(el, "fade"))
    : fxEnded(
        fxAnim(
          el,
          [
            {
              translate: "0 0",
              scale: "1",
              opacity: 1,
            },
            {
              ...fxTowards(el, target),
              opacity: 0,
            },
          ],
          {
            duration: 280,
            easing: "cubic-bezier(.5,0,.9,.3)",
            fill: "forwards",
          },
        ),
      );
}
const fxPicKey = (el) => {
  const holder = el.closest("[data-place], [data-district]");
  return `${holder?.dataset.place ?? holder?.dataset.district ?? ""}|${el.className.replace(/\s+/g, ".")}`;
};
function fxPictures(root) {
  const pics = new Map();
  for (const el of root.querySelectorAll("[style*='background-image']")) {
    pics.set(fxPicKey(el), el.style.backgroundImage);
  }
  return pics;
}
function fxFadePictures(oldPics, root) {
  for (const el of root.querySelectorAll("[style*='background-image']")) {
    const oldPic = oldPics.get(fxPicKey(el));
    if (!oldPic || oldPic === el.style.backgroundImage) {
      continue;
    }
    const overlay = document.createElement("span");
    overlay.className = "mls-fx-oldpic";
    overlay.style.backgroundImage = oldPic;
    if (getComputedStyle(el).position === "static") {
      el.style.position = "relative";
    }
    el.prepend(overlay);
    const anim = fxAnim(
      overlay,
      [
        {
          opacity: 1,
        },
        {
          opacity: 0,
        },
      ],
      {
        duration: fxQuick() ? 150 : 900,
        easing: "ease-in-out",
        fill: "forwards",
      },
    );
    if (anim) {
      fxEnded(anim).then(() => overlay.remove());
    } else {
      overlay.remove();
    }
  }
}
function fxType(el) {
  if ((fxFinishTyping(), !el || fxOff())) {
    return;
  }
  const text = el.textContent;
  el.textContent = "";
  let shown = 0;
  FX.typing = {
    el: el,
    text: text,
    timer: setInterval(() => {
      shown += 2;
      el.textContent = text.slice(0, shown);
      if (shown >= text.length) {
        fxFinishTyping();
      }
    }, 32),
  };
}
function fxFinishTyping() {
  if (FX.typing) {
    clearInterval(FX.typing.timer);
    FX.typing.el.textContent = FX.typing.text;
    FX.typing = null;
  }
}
function motionBefore(root) {
  const screen = fxScreen(root);
  if (!FX.last || !screen || fxOff() || typeof root.animate != "function") {
    return null;
  }
  fxLayers(root);
  const ghost = document.createElement("div");
  ghost.className = `${root.className} mls-fx-ghost`;
  const rootRect = root.getBoundingClientRect(),
    layerRect = FX.layer.getBoundingClientRect();
  Object.assign(ghost.style, {
    left: `${rootRect.left - layerRect.left}px`,
    top: `${rootRect.top - layerRect.top}px`,
    width: `${Math.max(rootRect.width, root.scrollWidth)}px`,
    height: `${Math.max(rootRect.height, root.scrollHeight)}px`,
  });
  for (const child of root.children) {
    if (!child.matches(".mls-loading")) {
      ghost.append(child.cloneNode(true));
    }
  }
  const scrolls = [],
    originals = [...root.children]
      .filter((child) => !child.matches(".mls-loading"))
      .flatMap((child) => [child, ...child.querySelectorAll("*")]),
    copies = [...ghost.children].flatMap((child) => [child, ...child.querySelectorAll("*")]);
  originals.forEach((el, idx) => {
    if ((el.scrollTop || el.scrollLeft) && copies[idx]) {
      scrolls.push([copies[idx], el.scrollTop, el.scrollLeft]);
    }
  });
  const rects = {};
  for (const [, piece] of fxPieces(root, FX.last)) {
    if (fxShown(piece.el)) {
      rects[piece.key] = fxBox(piece.el);
    }
  }
  for (const src of FX_SOURCES) {
    for (const el of root.querySelectorAll(src.sel)) {
      if (fxShown(el)) {
        rects[`src:${src.key(el)}`] ??= fxBox(el);
      }
    }
  }
  return {
    ghost: ghost,
    rects: rects,
    pictures: fxPictures(root),
    sig: FX.last,
    scrolls: scrolls,
  };
}
function motionAfter(root, snap) {
  const sig = motionSig(S),
    prevSig = FX.last;
  FX.last = sig;
  root.classList.toggle("motion-off", fxOff());
  const screen = fxScreen(root);
  if (!snap || !screen) {
    return;
  }
  if (JSON.stringify(sig) === JSON.stringify(prevSig)) {
    snap.ghost.remove();
    fxFadePictures(snap.pictures, screen);
    if (FX.live && performance.now() < FX.live.until) {
      FX.live.play(screen, performance.now() - FX.live.t0);
    }
    return;
  }
  let move = motionMoveFor(prevSig, sig, fxTapped);
  if (move?.fromKey) {
    move = snap.rects[move.fromKey]
      ? {
          how: "open",
          from: snap.rects[move.fromKey],
        }
      : {
          how: "fade",
        };
  }
  const textEl = screen.querySelector(".mls-scene .box .text");
  if (
    textEl &&
    !fxOff() &&
    (prevSig.view !== "scene" || prevSig.seg !== sig.seg || prevSig.sceneLog !== sig.sceneLog)
  ) {
    const text = textEl.textContent;
    textEl.textContent = "";
    setTimeout(
      () => {
        if (textEl.isConnected) {
          textEl.textContent = text;
          fxType(textEl);
        }
      },
      move?.how === "wipe" ? fxT(280) : 0,
    );
  }
  if (!move) {
    snap.ghost.remove();
    FX.live = null;
    return;
  }
  const playMove = (
    fxQuick() && move.how !== "morph"
      ? fxFade
      : {
          wipe: fxWipe,
          open: fxOpen,
          close: fxClose,
          slide: fxSlide,
          morph: fxMorph,
          fade: fxFade,
        }[move.how]
  )(move, snap, screen, sig);
  for (const [el, scrollTop, scrollLeft] of snap.scrolls ?? []) {
    el.scrollTop = scrollTop;
    el.scrollLeft = scrollLeft;
  }
  playMove(screen, 0);
  FX.live = {
    play: playMove,
    how: move.how,
    t0: performance.now(),
    until: performance.now() + fxT(700),
  };
  if (move.how === "morph") {
    fxFadePictures(snap.pictures, screen);
  }
  const faintText = screen.querySelector(".mls-faint .say .text");
  if (faintText && prevSig.faintStep !== sig.faintStep && !fxOff()) {
    const text = faintText.textContent;
    faintText.textContent = "";
    setTimeout(
      () => {
        if (faintText.isConnected) {
          faintText.textContent = text;
          fxType(faintText);
        }
      },
      fxT((move.ms ?? 0) * 0.5),
    );
  }
}

export {
  fxOff,
  fxQuick,
  fxT,
  motionAfter,
  motionBefore,
  motionGone,
  motionMode,
  motionSkip,
  motionTap,
  setMotionMode,
  systemWantsLess,
};
