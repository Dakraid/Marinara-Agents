// Town map data, icons, crop/escape helpers, faces and bond chips
import { S } from "../state.js";

const MAP = {
  apartments: {
    r: -5,
    icon: "\u{1F3E2}",
    bg: "linear-gradient(135deg,#8a6a4a,#2e2014)",
  },
  market: {
    r: 5,
    icon: "\u{1F6D2}",
    bg: "linear-gradient(135deg,#3f8a5a,#15301f)",
  },
  park: {
    r: -4,
    icon: "\u{1F333}",
    bg: "linear-gradient(135deg,#5a8a3f,#1e3015)",
  },
  houses: {
    r: 4,
    icon: "\u{1F3E1}",
    bg: "linear-gradient(135deg,#4a6a8a,#16222e)",
  },
  office: {
    r: 4,
    icon: "\u{1F4BC}",
    bg: "linear-gradient(135deg,#5d6470,#1f2329)",
    tag: "WORK",
  },
  cafe: {
    r: 6,
    icon: "\u2615",
    bg: "linear-gradient(135deg,#b07a4a,#4b2d1a)",
  },
  hospital: {
    r: -4,
    icon: "\u{1F3E5}",
    bg: "linear-gradient(135deg,#6a9aa8,#1c2e36)",
  },
  hall: {
    r: -2,
    icon: "\u{1F492}",
    bg: "linear-gradient(135deg,#a89a6a,#3a3222)",
  },
  university: {
    r: 3,
    icon: "\u{1F393}",
    bg: "linear-gradient(135deg,#6b5aa8,#231c3a)",
    tag: "CAMPUS",
  },
  library: {
    r: -3,
    icon: "\u{1F4DA}",
    bg: "linear-gradient(135deg,#8a6a3a,#2e2314)",
  },
  gym: {
    r: -7,
    icon: "\u{1F3CB}\uFE0F",
    bg: "linear-gradient(135deg,#4a6b8a,#16222e)",
  },
  mall: {
    r: 4,
    icon: "\u{1F6CD}\uFE0F",
    bg: "linear-gradient(135deg,#c96a8a,#3a1a2e)",
    tag: "SHOPS",
  },
  bar: {
    r: 7,
    icon: "\u{1F378}",
    bg: "linear-gradient(135deg,#6a3a8a,#1f1029)",
  },
  restaurant: {
    r: -3,
    icon: "\u{1F37D}\uFE0F",
    bg: "linear-gradient(135deg,#8a4a3a,#2e1812)",
  },
};
function districtSpots(count) {
  return count <= 1
    ? [[50, 50]]
    : count === 2
      ? [
          [28, 34],
          [72, 66],
        ]
      : Array.from(
          {
            length: count,
          },
          (_unused, idx) => [Math.round((10 + (80 * idx) / (count - 1)) * 10) / 10, idx % 2 ? 72 : 28],
        );
}
const TOWN_SPOT = {
  residential: [50, 13],
  campus: [16, 38],
  shopping: [84, 38],
  downtown: [50, 56],
  nightlife: [50, 90],
  hillcrest: [16, 80],
};
const DISTRICT_LINKS = [
  ["downtown", "residential"],
  ["downtown", "campus"],
  ["downtown", "shopping"],
  ["downtown", "nightlife"],
  ["residential", "campus"],
  ["residential", "shopping"],
  ["downtown", "hillcrest"],
  ["residential", "hillcrest"],
];
const isStreetId = (id) => String(id ?? "").startsWith("street:");
const PAINT_PICTURE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="M3.5 16.5l5-5 4 4 2.5-2.5 5.5 5.5"/><circle cx="15.5" cy="9.5" r="1.5" class="dot"/></svg>';
const PAINT_RETRY =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.05-4.95"/><path d="M19.5 4.5v4h-4"/></svg>';
function paintIcon(paintState, action, data = {}, extraClass = "") {
  const busy = paintState === "queued" || paintState === "painting",
    dataAttrs = Object.entries(data)
      .map(([attrName, attrValue]) => ` data-${attrName}="${escape(attrValue)}"`)
      .join("");
  return `<span class="mls-paint ${busy ? "busy" : paintState === "failed" ? "failed" : ""} ${extraClass}" role="button" tabindex="0" data-do="${busy ? "paint-wait" : action}"${busy ? "" : dataAttrs}
    title="${busy ? "Painting\u2026" : paintState === "failed" ? "It failed \xB7 paint it again" : "Paint this picture"}">${busy ? "" : paintState === "failed" ? PAINT_RETRY : PAINT_PICTURE}</span>`;
}
const bgIcon = (wanted, extraClass = "") =>
  wanted
    ? paintIcon(
        wanted.state,
        "paint-bg",
        {
          key: wanted.key,
        },
        extraClass,
      )
    : "";
const UPLOAD_PICTURE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5V5"/><path d="M7.5 9.5L12 5l4.5 4.5"/><path d="M5 14.5V19h14v-4.5"/></svg>';
function uploadIcon(uploadKey, data = {}, extraClass = "") {
  const dataAttrs = Object.entries(data)
    .map(([attrName, attrValue]) => ` data-${attrName}="${escape(attrValue)}"`)
    .join("");
  return `<label class="mls-paint up ${extraClass}" title="Use a picture of your own">${UPLOAD_PICTURE}<input type="file" accept="image/png,image/jpeg,image/webp" data-pic-upload="${uploadKey}"${dataAttrs} hidden></label>`;
}
function cropBox(crop) {
  const aspectRatio = (crop.height * crop.iw) / (crop.width * crop.ih),
    width = 100 * crop.zoom * Math.max(1, aspectRatio),
    height = 100 * crop.zoom * Math.max(1, 1 / aspectRatio),
    offsetX = Math.max(-(width - 100) / 2, Math.min((width - 100) / 2, crop.dx)),
    offsetY = Math.max(-(height - 100) / 2, Math.min((height - 100) / 2, crop.dy));
  return {
    w: width,
    h: height,
    dx: offsetX,
    dy: offsetY,
    left: (100 - width) / 2 + offsetX,
    top: (100 - height) / 2 + offsetY,
  };
}
function cropView(crop) {
  const box = cropBox(crop);
  return `<div class="mls-ask-veil"><div class="mls-ask mls-crop ${crop.height > crop.width ? "tall" : "wide"}">
    <b>Your own picture</b>
    <small>Drag it into place and zoom until the frame shows what you want.</small>
    <div class="pad" data-crop-pad style="aspect-ratio:${crop.width} / ${crop.height};--hw:${crop.height / crop.width}">
      <img src="${escape(crop.src)}" alt="" draggable="false" data-crop-img style="left:${box.left}%;top:${box.top}%;width:${box.w}%;height:${box.h}%">
    </div>
    <label class="zoom">ZOOM <input type="range" min="1" max="4" step="0.02" value="${crop.zoom}" data-do="crop-zoom"></label>
    <div class="acts"><button class="save" data-do="crop-save">SAVE</button><button class="plain" data-do="crop-cancel">CANCEL</button></div>
  </div></div>`;
}
const COLOURS = ["#1976d2", "#c2185b", "#388e3c", "#f57c00", "#8e24aa", "#00897b", "#c62828"];
const colourFor = (key) => COLOURS[[...String(key)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLOURS.length];
function safePart(label, render) {
  try {
    return render();
  } catch (err) {
    console.warn(`Modern Life Sim: \xAB${label}\xBB could not be shown.`, err);
    return "";
  }
}
function brokenView() {
  const inLife = typeof S < "u" && !!S.life && S.view !== "map";
  return `<div class="mls-broken"><h2>THIS SCREEN COULD NOT BE SHOWN</h2>
    <p>Something in it isn't as the game expects. Your life is safe: go back and carry on.</p>
    <button class="mls-btn yellow" data-do="${inLife ? "map" : "title"}">\u25C2 ${inLife ? "BACK TO THE MAP" : "BACK TO THE TITLE"}</button></div>`;
}
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch],
  );
const FACE = {
  x: 50,
  y: 24,
  zoom: 2,
};
function placeHud(hud) {
  return `<div class="mls-place-hud">
            <span class="clock" data-hud="clock"><b data-hud="day">${escape(hud.clock.weekday.toUpperCase())}</b><span data-hud="time">${escape(hud.time)}</span></span>
            <span class="need">Energy<span class="bar-mini ${hud.needs.energyLow ? "low" : ""}"><i data-hud="energy" style="width:${Math.round((hud.needs.energy / hud.needs.energyMax) * 100)}%"></i></span></span>
            <span class="need">Hunger<span class="bar-mini ${hud.needs.hungerLow ? "low" : ""}"><i data-hud="hunger" style="width:${Math.round(hud.needs.hunger)}%"></i></span></span>
            <span class="cash" data-hud="cash">$${hud.cash}</span>
          </div>`;
}
function faceImg(person) {
  if (!person?.avatar) {
    return "";
  }
  const face = person.face ?? FACE;
  return `<img class="mls-face" src="${escape(person.avatar)}" alt="" loading="lazy" draggable="false" style="--fx:${face.x}%;--fy:${face.y}%;--fz:${face.zoom}">`;
}
function frameImg(person) {
  if (!person?.avatar) {
    return "";
  }
  const face = person.face ?? FACE;
  return `<img class="mls-frame-img" src="${escape(person.avatar)}" alt="" loading="lazy" draggable="false" style="object-position:${face.x}% ${face.y}%">`;
}
function bondLine(bond) {
  const statusName = bond.status?.id && bond.status.id !== "single" ? bond.status.name : "";
  if (statusName && bond.status.id !== "ex") {
    return `\u2665 ${statusName}`;
  }
  const romanceText = bond.romance.tier >= 1 && !bond.romance.frozen ? ` \xB7 \u2665 ${bond.romance.name}` : "";
  return `${statusName ? `${statusName} \xB7 ` : ""}${bond.friendship.name}${romanceText}`;
}
function headOf(person, extraClass = "") {
  const initial = person.met === false ? "?" : escape((person.name?.[0] ?? "?").toUpperCase());
  return `<b class="${person.met === false ? "q" : ""} ${person.avatar ? "pic" : ""} ${extraClass}" style="--c:${colourFor(person.id)}">${faceImg(person)}${person.avatar && person.met !== false ? "" : `<i>${initial}</i>`}</b>`;
}
const hours = (place) =>
  place.open === 0 && place.close === 24
    ? "Always open"
    : `${String(place.open).padStart(2, "0")}:00 \u2013 ${String(place.close).padStart(2, "0")}:00`;
const playtime = (ms) => {
  const minutes = Math.round((ms ?? 0) / 6e4);
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};
const whereLeft = (life) => escape((life.placeName || life.place || "town").toUpperCase());
function bondChips(life, max) {
  const shown = life.bonds.slice(0, max),
    more = Math.max(0, (life.bondsTotal ?? life.bonds.length) - shown.length);
  return (
    shown
      .map(
        (bond) =>
          `<span class="mls-bond"><i class="${bond.avatar ? "pic" : ""} ${bond.met === false ? "q" : ""}" style="--c:${colourFor(bond.id)}">${bond.avatar ? faceImg(bond) : escape(bond.name[0] ?? "?")}</i>${escape(bond.name)} <em>${escape(bond.status)}${bond.romance ? " \xB7 \u2665" : ""}${bond.drifting ? " \xB7 drifting" : ""}</em></span>`,
      )
      .join("") + (shown.length && more ? `<span class="mls-bond more">+${more}</span>` : "")
  );
}
const SEX_PICK = [
  ["female", "Woman"],
  ["male", "Man"],
  ["futanari", "Futanari"],
];
const INTO_PICK = [
  ["women", "Women"],
  ["men", "Men"],
  ["futanari", "Futanari"],
];
const SEX_GROUP = {
  female: "women",
  male: "men",
  futanari: "futanari",
};
// Attraction list; accepts the old single values ("both" is women and men), empty means everyone
function intoList(into) {
  const values = (Array.isArray(into) ? into : [into]).flatMap((value) =>
    value === "both" ? ["women", "men"] : [value],
  );
  const groups = INTO_PICK.map(([group]) => group).filter((group) => values.includes(group));
  return groups.length ? groups : INTO_PICK.map(([group]) => group);
}
const likesSex = (into, sex) => !sex || !into || !SEX_GROUP[sex] || intoList(into).includes(SEX_GROUP[sex]);
// Attraction toggle chips; the change handler reads the checked boxes of the group
const intoChips = (attrs, into) =>
  `<span class="mls-into" role="group" aria-label="Into">${INTO_PICK.map(([value, label]) => {
    const on = intoList(into).includes(value);
    return `<label class="mls-zz ${on ? "on" : ""}"><input type="checkbox" ${attrs} value="${value}" ${on ? "checked" : ""}>${label}</label>`;
  }).join("")}</span>`;
const checkedInto = (input) =>
  [...(input.closest(".mls-into")?.querySelectorAll("input:checked") ?? [])].map((box) => box.value);

export {
  DISTRICT_LINKS,
  SEX_PICK,
  MAP,
  TOWN_SPOT,
  bgIcon,
  bondChips,
  bondLine,
  brokenView,
  checkedInto,
  colourFor,
  cropBox,
  cropView,
  districtSpots,
  escape,
  faceImg,
  frameImg,
  headOf,
  hours,
  intoChips,
  isStreetId,
  likesSex,
  paintIcon,
  placeHud,
  playtime,
  safePart,
  uploadIcon,
  whereLeft,
};
