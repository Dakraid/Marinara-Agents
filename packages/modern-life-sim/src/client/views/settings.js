// Prompts, debug, pictures, settings, calendar, cast/rules/model tabs
import { colourFor, escape, faceImg } from "./common.js";
import { SEASON_OUTFITS_RULE, traitsEditor } from "./creation.js";
import { lookQueue, lookShot, motionTab } from "./phone.js";
import { modCastOptions, modGroup } from "./mods.js";

const IP_HOLES = {
  place: "the kind of place",
  light: "day, night or indoors",
  town: "your town tags",
};
const IP_GROUPS = [
  {
    id: "background",
    title: "BACKGROUNDS",
    fields: [
      {
        key: "background.tags",
        title: "Tags",
        mode: "tags",
        holes: ["place", "light", "town"],
      },
      {
        key: "background.prose",
        title: "Prose",
        mode: "prose",
        holes: ["place", "light", "town"],
      },
      {
        key: "background.light.day.tags",
        title: "Daylight",
        mode: "tags",
        fills: "light",
      },
      {
        key: "background.light.night.tags",
        title: "Night",
        mode: "tags",
        fills: "light",
      },
      {
        key: "background.light.indoor.tags",
        title: "Indoors",
        mode: "tags",
        fills: "light",
      },
      {
        key: "background.light.day.prose",
        title: "Daylight",
        mode: "prose",
        fills: "light",
      },
      {
        key: "background.light.night.prose",
        title: "Night",
        mode: "prose",
        fills: "light",
      },
      {
        key: "background.light.indoor.prose",
        title: "Indoors",
        mode: "prose",
        fills: "light",
      },
      {
        key: "background.negative",
        title: "Negative",
      },
    ],
  },
  {
    id: "outfit",
    title: "YOU, IN AN OUTFIT",
    fields: [
      {
        key: "outfit.tags",
        title: "Tags",
        mode: "tags",
      },
      {
        key: "outfit.prose",
        title: "Prose",
        mode: "prose",
      },
      {
        key: "outfit.negative",
        title: "Negative",
      },
    ],
  },
  {
    id: "key",
    title: "KEY IMAGES",
    fields: [
      {
        key: "keyImage.register.tags",
        title: "How to write it",
        mode: "tags",
        sub: "to the model",
      },
      {
        key: "keyImage.register.prose",
        title: "How to write it",
        mode: "prose",
        sub: "to the model",
      },
      {
        key: "keyImage.rules",
        title: "One picture",
        sub: "to the model",
        after: "the people, one per line",
      },
      {
        key: "keyImage.seen",
        title: "Only what shows",
        sub: "to the model",
      },
      {
        key: "keyImage.negative",
        title: "Negative",
        sub: "to the image model",
      },
      {
        key: "keyImage.negative.group",
        title: "Negative \xB7 two or more people",
        sub: "to the image model",
      },
    ],
  },
];
const IP_FIELD = Object.fromEntries(
  IP_GROUPS.flatMap((group) =>
    group.fields.map((field) => [
      field.key,
      {
        ...field,
        group: group.id,
      },
    ]),
  ),
);
const ipValue = (prompts, key) => prompts.draft[key] ?? prompts.saved[key] ?? prompts.defaults?.[key] ?? "";
const ipChanged = (prompts, key) => ipValue(prompts, key).trim() !== (prompts.defaults?.[key] ?? "").trim();
const ipUnsaved = (prompts, key) =>
  ipValue(prompts, key).trim() !== (prompts.saved[key] ?? prompts.defaults?.[key] ?? "").trim();
const ipUnsavedCount = (prompts) => Object.keys(prompts.defaults ?? {}).filter((key) => ipUnsaved(prompts, key)).length;
const ipUsed = (prompts, field) => {
  const profile = prompts.preview?.[field.group]?.profile;
  return !field.mode || !profile || (field.mode === "tags") === profile.tagged;
};
function ipHead(prompts, key) {
  const field = IP_FIELD[key],
    profile = prompts.preview?.[field.group]?.profile,
    missingPlace = (field.holes ?? []).includes("place") && !ipValue(prompts, key).includes("{place}");
  return `<div class="h"><b>${escape(field.title)}</b>${field.mode ? `<i class="mode">${field.mode === "tags" ? "TAGS" : "PROSE"}</i>` : ""}
    ${ipUsed(prompts, field) ? "" : `<span class="off">NOT USED \xB7 your style writes ${profile?.tagged ? "tags" : "prose"}</span>`}
    ${ipUnsaved(prompts, key) ? '<span class="dirty">NOT SAVED</span>' : ipChanged(prompts, key) ? '<span class="chg">CHANGED</span>' : ""}
    <span class="acts">${ipChanged(prompts, key) ? `<button data-do="ip-default" data-id="${key}">${prompts.show[key] ? "HIDE DEFAULT" : "DEFAULT"}</button><button data-do="ip-reset" data-id="${key}">RESET</button>` : ""}</span></div>
    ${missingPlace ? '<div class="warn">No {place}: every background would be the same picture.</div>' : ""}`;
}
function ipField(prompts, field) {
  const value = ipValue(prompts, field.key);
  return `
    <div class="mls-ip-f ${ipChanged(prompts, field.key) ? "changed" : ""} ${ipUnsaved(prompts, field.key) ? "unsaved" : ""} ${ipUsed(prompts, field) ? "" : "unused"}" data-f="${field.key}" data-g="${field.group}">
      <div class="hh">${ipHead(prompts, field.key)}</div>
      <textarea data-ip="${field.key}" rows="${Math.min(8, Math.max(2, Math.ceil(value.length / 70)))}" spellcheck="false">${escape(value)}</textarea>
      ${field.holes ? `<div class="holes">${field.holes.map((hole) => `<span><code>{${hole}}</code> ${IP_HOLES[hole]}</span>`).join("")}</div>` : ""}
      ${field.fills ? `<div class="holes"><span>goes into <code>{${field.fills}}</code></span></div>` : ""}
      ${field.after ? `<div class="holes"><span>then ${field.after}</span></div>` : ""}
      ${prompts.show[field.key] && ipChanged(prompts, field.key) ? `<pre class="def"><em>DEFAULT</em>${escape(prompts.defaults[field.key])}</pre>` : ""}
    </div>`;
}
function ipBar(prompts) {
  const unsaved = ipUnsavedCount(prompts);
  return unsaved
    ? `<div class="mls-ip-bar"><b>${unsaved} ${unsaved === 1 ? "change" : "changes"} not saved</b><button class="mls-btn" data-do="ip-discard">DISCARD</button><button class="mls-btn yellow" data-do="ip-save">SAVE</button></div>`
    : "";
}
function ipCount(prompts) {
  const changed = Object.keys(prompts.saved).length;
  return changed
    ? `${changed} of ${Object.keys(prompts.defaults ?? {}).length} changed <button data-do="ip-reset-all">RESET ALL</button>`
    : "";
}
function ipPreview(prompts, look) {
  const preview = prompts.preview,
    tabs = [
      ["background", "BACKGROUND"],
      ["outfit", "OUTFIT"],
      ["key", "KEY IMAGE"],
    ]
      .map(
        ([id, label]) =>
          `<button class="${prompts.focus === id ? "on" : ""}" data-do="ip-focus" data-id="${id}">${label}</button>`,
      )
      .join(""),
    block = (label, text, cls = "") =>
      `<div class="blk ${cls}"><em>${label}</em><pre>${escape(text ?? "")}</pre></div>`,
    styleBlock = (profile, subjectLabel) => {
      if (!profile) {
        return "";
      }
      const bits = [
        profile.positive ? `<span><i>positive</i>${escape(profile.positive)}</span>` : "",
        profile.subject ? `<span><i>for ${subjectLabel}</i>${escape(profile.subject)}</span>` : "",
        profile.style ? `<span><i>style text</i>${escape(profile.style)}</span>` : "",
        profile.negative ? `<span><i>negative</i>${escape(profile.negative)}</span>` : "",
      ]
        .filter(Boolean)
        .join("");
      return `<div class="style"><div class="who"><b>${escape(profile.name || "Engine default")}</b> \xB7 ${profile.tagged ? "TAGS" : "PROSE"}</div>${bits ? `<div class="bits"><small>the style profile adds \xB7 change it in Marinara</small>${bits}</div>` : ""}</div>`;
    },
    tryBlock = (kind, label, target) => {
      const tried =
          prompts.tried?.kind === kind &&
          (kind === "background" ? prompts.tried.key === prompts.key : prompts.tried.entry === prompts.entry)
            ? prompts.tried
            : null,
        unsaved = ipUnsavedCount(prompts);
      let newSlot = "<span>PAINTING\u2026</span>";
      if (tried && target) {
        if (target.status === "failed") {
          newSlot = '<span class="bad">FAILED</span>';
        } else if (
          (target.versions ?? 0) > tried.versions &&
          target.url &&
          target.status !== "queued" &&
          target.status !== "painting"
        ) {
          newSlot = `<img src="${escape(target.url)}" alt="">`;
        }
      }
      return `<div class="try"><button class="mls-btn ${unsaved ? "yellow" : ""}" data-do="ip-try" data-id="${kind}">${unsaved ? "SAVE AND " : ""}${label}</button>
      ${tried ? `<div class="tried"><div class="slot">${tried.url ? `<img src="${escape(tried.url)}" alt="">` : "<span></span>"}<small>BEFORE</small></div><div class="slot new">${newSlot}<small>NEW</small></div></div>` : ""}</div>`;
    };
  let body;
  if (prompts.error) {
    body = `<div class="mls-said bad">${escape(prompts.error)}</div>`;
  } else if (!preview) {
    body = '<p class="hint">Loading\u2026</p>';
  } else if (prompts.focus === "background") {
    const tile = (look?.tiles ?? []).find((tile2) => tile2.key === preview.background.key);
    body = `
      <div class="pick"><select data-ip-sel="key">${(look?.tiles ?? []).map((tile2) => `<option value="${escape(tile2.key)}" ${tile2.key === preview.background.key ? "selected" : ""}>${escape(tile2.name)}${tile2.key.endsWith("|night") ? " \xB7 night" : tile2.key.endsWith("|day") && (look.tiles ?? []).some((other) => other.key === tile2.key.replace("|day", "|night")) ? " \xB7 day" : ""}</option>`).join("")}</select>
        ${tile?.url ? `<img class="thumb" src="${escape(tile.url)}" alt="">` : ""}</div>
      ${block("PROMPT", preview.background.prompt)}
      ${block("NEGATIVE", preview.background.negative, "neg")}
      ${styleBlock(preview.background.profile, "backgrounds")}
      ${tile ? tryBlock("background", "REDO THIS BACKGROUND", tile) : ""}`;
  } else if (prompts.focus === "outfit") {
    body = `
      ${block("PROMPT", preview.outfit.prompt)}
      ${block("NEGATIVE", preview.outfit.negative, "neg")}
      ${styleBlock(preview.outfit.profile, "")}`;
  } else if (!preview.key) {
    body = '<p class="hint">No key image in this life yet.</p>';
  } else {
    const entries = (prompts.album ?? []).filter((entry2) => (preview.entries ?? []).includes(entry2.id)),
      entry = (prompts.album ?? []).find((entry2) => entry2.id === preview.key.entry);
    body = `
      <div class="pick"><select data-ip-sel="entry">${entries.map((entry2) => `<option value="${escape(entry2.id)}" ${entry2.id === preview.key.entry ? "selected" : ""}>${escape(entry2.label)} \xB7 ${escape(entry2.when ?? "")}</option>`).join("")}</select>
        ${entry?.url ? `<img class="thumb" src="${escape(entry.url)}" alt="">` : ""}</div>
      ${block("TO THE MODEL \xB7 with the event's text", preview.key.brief)}
      ${block("IT WROTE", preview.key.written, "wrote")}
      ${block("TO THE IMAGE MODEL \xB7 PROMPT", preview.key.prompt)}
      ${block("NEGATIVE", preview.key.negative, "neg")}
      ${styleBlock(preview.key.profile, "illustrations")}
      ${entry ? tryBlock("key", "REDO THIS PICTURE", entry) : ""}
      <div class="aside">REDO keeps what it wrote; the new brief is read from the next key image on.</div>`;
  }
  return `<div class="mls-ip-pvh"><h3>PREVIEW</h3><div class="mls-ip-tabs">${tabs}</div></div>${body}`;
}
function promptsTab(prompts, look) {
  if (!prompts?.defaults) {
    return `<div class="mls-tab-body"><div class="box"><p class="hint">${prompts?.error ? escape(prompts.error) : "Loading\u2026"}</p></div></div>`;
  }
  const groupBox = (group) => {
    let lastSub = "";
    const fieldsHtml = group.fields
      .map(
        (field) =>
          (field.sub && field.sub !== lastSub
            ? `<div class="sub">${escape((lastSub = field.sub).toUpperCase())}</div>`
            : "") + ipField(prompts, IP_FIELD[field.key]),
      )
      .join("");
    return `<div class="box mls-ip-g ${prompts.focus === group.id ? "focus" : ""}" data-g="${group.id}"><h3>${group.title}</h3>${fieldsHtml}</div>`;
  };
  return `
    <div class="mls-tab-body mls-ip">
      <div class="box mls-ip-top"><h3>IMAGE PROMPTS <small>every life</small></h3><div class="mls-ip-count">${ipCount(prompts)}</div></div>
      <div class="mls-ip-cols">
        <div class="mls-ip-list">${IP_GROUPS.map(groupBox).join("")}<div class="mls-ip-barwrap">${ipBar(prompts)}</div></div>
        <div class="box mls-ip-pv">${ipPreview(prompts, look)}</div>
      </div>
    </div>`;
}
const CALL_TASKS = {
  "read-card": "Reading a card",
  "scene-open": "Scene \xB7 opening",
  "scene-turn": "Scene \xB7 turn",
  "scene-suggestions": "Scene \xB7 suggestions",
  "scene-goodbye": "Scene \xB7 goodbye",
  "tier-result": "Tier event \xB7 result",
  "quick-lines": "Quick lines",
  "gift-tastes": "Gift tastes",
  "gift-reaction": "Gift reaction",
  "visit-line": "Visit line",
  "activity-lines": "Activity lines",
  "shop-news": "Shop news",
  "memory-summary": "Memory summary",
  "split-look": "Splitting a look",
  "counter-lines": "At the counter",
  "fitting-room": "Fitting room",
  "invite-answer": "Invitation \xB7 answer",
  "outing-arrive": "Outing \xB7 arriving",
  "outing-moment": "Outing \xB7 moment",
  "outing-interrupt": "Outing \xB7 someone walks in",
  "outing-goodbye": "Outing \xB7 goodbye",
  "week-work": "Work in a week",
};
function debugTab(debug, { version = "" } = {}) {
  const num = (value) => (Number.isFinite(value) ? Number(value).toLocaleString("en-US") : "\u2014"),
    twoDigits = (value) => String(value).padStart(2, "0"),
    clockTime = (at) => {
      const date = new Date(at);
      return `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}`;
    },
    dayKey = (at) => {
      const date = new Date(at);
      return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
    },
    seconds = (ms) => (Number.isFinite(ms) ? `${(ms / 1e3).toFixed(1)} s` : "\u2014"),
    about = (entry) =>
      entry.task === "activity-lines" && entry.about
        ? entry.about.charAt(0).toUpperCase() + entry.about.slice(1)
        : entry.about,
    data = debug.data,
    calls = data?.calls ?? [],
    totals = data?.totals,
    buildBox = `
      <div class="box mls-build"><h3>BUILD</h3><div class="v">Modern Life Sim <b>${escape(version || "\u2014")}</b></div></div>`,
    callRows = calls
      .map((callEntry, index) => {
        const detail = debug.open[callEntry.id],
          newDay = index === 0 || dayKey(callEntry.at) !== dayKey(calls[index - 1].at),
          whose =
            callEntry.scope === "creating"
              ? "creating a life"
              : callEntry.scope === "shared"
                ? "shared library"
                : debug.scope === "all" && callEntry.lifeName
                  ? callEntry.lifeName
                  : "";
        return `${newDay ? `<div class="mls-call-day">${dayKey(callEntry.at)}</div>` : ""}
      <button class="mls-call ${escape(callEntry.outcome)} ${detail ? "open" : ""}" data-do="debug-open" data-id="${escape(callEntry.id)}" ${callEntry.connection ? `title="connection ${escape(callEntry.connection)}"` : ""}>
        <span class="t">${clockTime(callEntry.at)}</span>
        <span class="l"><b>${escape(CALL_TASKS[callEntry.task] ?? callEntry.task)}</b>${callEntry.about ? `<span class="who">${escape(about(callEntry))}</span>` : ""}${whose ? `<span class="whose">${escape(whose)}</span>` : ""}${callEntry.model ? `<span class="model">${escape(callEntry.model)}</span>` : ""}</span>
        <span class="u up" title="tokens sent">${num(callEntry.sent)}</span>
        <span class="u dn" title="tokens received">${num(callEntry.received)}</span>
        <span class="s">${seconds(callEntry.ms)}</span>
        <span class="o">${escape(String(callEntry.outcome).toUpperCase())}</span>
      </button>
      ${detail ? callDetail(detail, debug.copied) : ""}`;
      })
      .join(""),
    body = debug.error
      ? `<p class="hint">Could not read the calls: ${escape(debug.error)}</p>`
      : data
        ? calls.length
          ? `<div class="mls-calls-head"><span>TIME</span><span>CALL</span><span>\u2191 SENT</span><span>\u2193 RECEIVED</span><span>TOOK</span><span></span></div>
        <div class="mls-calls">${callRows}</div>`
          : `<p class="hint">No model calls ${debug.scope === "all" ? "kept yet" : "for this life yet"}.</p>`
        : '<p class="hint">Reading\u2026</p>';
  return `
    <div class="mls-tab-body">
      ${buildBox}
      <div class="box mls-debug">
        <h3>MODEL CALLS <small>newest first \xB7 the last ${num(data?.kept ?? 200)} are kept, across restarts</small></h3>
        <div class="mls-debug-bar">
          <div class="scope">
            <button class="${debug.scope === "life" ? "on" : ""}" data-do="debug-scope" data-id="life">THIS LIFE</button>
            <button class="${debug.scope === "all" ? "on" : ""}" data-do="debug-scope" data-id="all">EVERY LIFE</button>
          </div>
          <div class="tot">${
            totals
              ? `
            <span><i>sent</i><b>${num(totals.sent)}</b></span>
            ${totals.cached ? `<span><i>cached</i><b>${num(totals.cached)}</b></span>` : ""}
            <span><i>received</i><b>${num(totals.received)}</b></span>
            <span><i>calls</i><b>${num(totals.calls)}</b></span>
            ${totals.failed ? `<span class="bad"><i>did not go through</i><b>${num(totals.failed)}</b></span>` : ""}
            ${totals.unreported ? `<span class="warn"><i>reported no usage</i><b>${num(totals.unreported)}</b></span>` : ""}`
              : ""
          }
          </div>
          <button class="mls-btn" data-do="debug-refresh" ${debug.loading ? "disabled" : ""}>${debug.loading ? "READING\u2026" : "REFRESH"}</button>
        </div>
        ${body}
      </div>
    </div>`;
}
function callDetail(detail, copied) {
  if (detail.loading) {
    return '<div class="mls-call-open"><p class="hint">Reading\u2026</p></div>';
  }
  if (detail.error || !detail.call) {
    return `<div class="mls-call-open"><p class="hint">${escape(detail.error || "That call is no longer kept.")}</p></div>`;
  }
  const callData = detail.call,
    num = (value) => (Number.isFinite(value) ? Number(value).toLocaleString("en-US") : "\u2014"),
    meta = [
      `effort <b>${escape(callData.effort)}</b>`,
      `max <b>${num(callData.maxTokens)}</b> tokens`,
      callData.finish ? `finish <b>${escape(callData.finish)}</b>` : "",
      Number.isFinite(callData.reasoning) ? `thinking <b>${num(callData.reasoning)}</b>` : "",
      callData.cached ? `cached <b>${num(callData.cached)}</b>` : "",
      callData.cacheWrite ? `cache writes <b>${num(callData.cacheWrite)}</b>` : "",
    ]
      .filter(Boolean)
      .join(" \xB7 "),
    errorText =
      callData.outcome === "cancelled" ? "You cancelled it: nothing it would have done happened." : callData.error,
    pretty = (text) => {
      try {
        return JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        return text;
      }
    },
    copyButton = (side) =>
      `<button data-do="debug-copy" data-id="${escape(callData.id)}" data-side="${side}">${copied === `${callData.id}:${side}` ? "COPIED" : "COPY"}</button>`;
  return `
      <div class="mls-call-open">
        <div class="meta">${meta}</div>
        ${errorText ? `<div class="err ${escape(callData.outcome)}"><i>${callData.outcome === "cancelled" ? "CANCELLED" : "ERROR"}</i>${escape(errorText)}</div>` : ""}
        <div class="io">
          <div class="side">
            <div class="cap"><b>IN</b><small>${callData.in.length} message${callData.in.length === 1 ? "" : "s"} \xB7 ${num(callData.sent)} tokens</small>${copyButton("in")}</div>
            ${callData.in.map((message) => `<div class="msg"><em>${escape(String(message.role).toUpperCase())}</em><pre>${escape(message.content)}</pre></div>`).join("")}
          </div>
          <div class="side">
            <div class="cap"><b>OUT</b><small>${callData.out ? `${num(callData.received)} tokens` : "nothing came back"}</small>${callData.out ? copyButton("out") : ""}</div>
            ${callData.out ? `<pre>${escape(pretty(callData.out))}</pre>` : '<div class="none">\u2014</div>'}
          </div>
        </div>
      </div>`;
}
const PICTURE_ROWS = [
  [
    "backgrounds",
    "BACKGROUNDS",
    "places, districts, homes \xB7 day and night",
    "every background",
    "More places and districts, more to paint.",
  ],
  [
    "clothes",
    "YOUR CLOTHES",
    "you in each outfit",
    "your picture in every outfit",
    "Every piece you buy or try on is one more.",
  ],
  ["work", "WORK OUTFITS", "each one at their job", "every work sprite", "Every job someone takes is one more."],
  [
    "seasons",
    "SEASON OUTFITS",
    "everyone's look for the season",
    "every season outfit",
    "Every season that comes is one more for everyone in town.",
  ],
  ["keys", "KEY IMAGES", "big moments with someone", "every key image", "One more with every big moment."],
];
const PICTURE_RULE = {
  clothes: "clothes",
  work: "workOutfits",
  seasons: "seasonOutfits",
  keys: "keyImages",
};
function picturesBox(modes = {}, counts = {}, { action = "pictures-mode", rules = {} } = {}) {
  return `
      <div class="box mls-pictures">
        <h3>PICTURES <small>MANUAL paints only what you ask for</small></h3>
        ${PICTURE_ROWS.filter(([id]) => !PICTURE_RULE[id] || rules?.[PICTURE_RULE[id]])
          .map(([id, title, sub]) => {
            const left = counts[id]?.left ?? 0,
              auto = modes[id] === "auto";
            return `
          <div class="mls-pic-sys">
            <div><b>${title}</b><small>${sub}</small></div>
            <span class="left">${left ? `${left} to paint` : ""}</span>
            <div class="seg"><button class="${auto ? "" : "on"}" data-do="${action}" data-id="${id}" data-to="manual">MANUAL</button><button class="${auto ? "on" : ""}" data-do="${action}" data-id="${id}" data-to="auto">AUTOMATIC</button></div>
          </div>`;
          })
          .join("")}
      </div>`;
}
function frameBox(frame = "framed") {
  return `
      <div class="box">
        <h3>HOW PEOPLE LOOK <small>framed, or standing in the place</small></h3>
        ${frameChoice(frame, "frame-set")}
      </div>`;
}
function sizeBox(size, warnConnections = []) {
  return `
      <div class="box">
        <h3>PICTURE SIZE <small>backgrounds and key images, from the next one painted</small></h3>
        ${sizeChoice(size, "size-set", warnConnections)}
      </div>`;
}
const PICTURE_SIZES = {
  "16:9": {
    width: 1344,
    height: 768,
  },
  "3:2": {
    width: 1216,
    height: 832,
  },
  "1:1": {
    width: 1024,
    height: 1024,
  },
};
const PORTRAIT_SIZES = {
  "2:3": {
    width: 832,
    height: 1216,
  },
  "3:4": {
    width: 896,
    height: 1152,
  },
  "9:16": {
    width: 768,
    height: 1344,
  },
};
const sizeWH = (size, sizes = PICTURE_SIZES, fallback = "16:9") =>
  (typeof size == "string" ? sizes[size] : size?.width && size?.height ? size : null) ?? sizes[fallback];
function sizeChoice(
  size,
  action = "size-set",
  warnConnections = [],
  { sizes = PICTURE_SIZES, fallback = "16:9", warnOff = false } = {},
) {
  const { width: width, height: height } = sizeWH(size, sizes, fallback),
    sizeButton = ([label, dims]) =>
      `<button class="mls-set-btn ${dims.width === width && dims.height === height ? "on" : "soft"}" data-do="${action}" data-to="${label}">${label}</button>`,
    base = sizes[fallback],
    offSize = warnOff && (width !== base.width || height !== base.height);
  return `
        <div class="mls-size">
          <span class="shorts">${Object.entries(sizes).map(sizeButton).join("")}</span>
          <label class="field">WIDTH<input type="number" min="64" max="4096" step="1" value="${width}" data-size-w data-size-for="${action}"></label>
          <span class="x">\xD7</span>
          <label class="field">HEIGHT<input type="number" min="64" max="4096" step="1" value="${height}" data-size-h data-size-for="${action}"></label>
        </div>
        ${offSize ? `<p class="mls-size-warn">The screens are laid out for people at ${base.width} \xD7 ${base.height}. At another size they may look cut off, squashed or out of place.</p>` : ""}
        ${warnConnections.map((connection) => `<p class="mls-size-warn">${escape(connection.name)} picks the size itself when there are people in the picture: one comes out tall, two square. To paint at this size, turn off \xABChoose resolution from character count\xBB in that connection.</p>`).join("")}`;
}
const portraitChoice = (size, action, warnConnections = []) =>
  sizeChoice(size, action, warnConnections, {
    sizes: PORTRAIT_SIZES,
    fallback: "2:3",
    warnOff: true,
  });
function portraitBox(size, warnConnections = []) {
  return `
      <div class="box">
        <h3>PORTRAIT SIZE <small>pictures of one person: your outfits, work clothes and seasons, from the next one painted</small></h3>
        ${portraitChoice(size, "portrait-set", warnConnections)}
      </div>`;
}
function frameChoice(frame = "framed", action = "frame-set") {
  const option = (value, title, text) => `
          <label class="pick ${frame === value ? "on" : ""}"><input type="radio" name="${action}" data-do="${action}" data-to="${value}" ${frame === value ? "checked" : ""}>
            <span><b>${title}</b><small>${text}</small></span></label>`;
  return `
        <div class="mls-seg">
          ${option("framed", "FRAMED", "In a frame of their colour, as painted.")}
          ${option("cut", "CUT OUT", "Standing in the place, no frame. Painted pictures lose their background; card pictures are shown as they are (best if they are already cut out).")}
        </div>`;
}
function picturesWarning(
  rowId,
  counts = {},
  { yes: yesAction = "pictures-yes", no: noAction = "pictures-no", sofar = false } = {},
) {
  const row = PICTURE_ROWS.find(([id]) => id === rowId);
  if (!row) {
    return "";
  }
  const [, title, , what, more] = row;
  return `
    <div class="mls-pic-warn"><div class="card">
      <h2>AUTOMATIC \xB7 ${title}</h2>
      <p>From now on, ${what} is painted on its own, as soon as the game asks for it.</p>
      <p class="warn">If your image connection is paid, every picture costs.</p>
      <div class="nums"><div><b>${counts.asks ?? 0}</b><small>${rowId === "keys" || sofar ? "SO FAR" : "THIS LIFE ASKS FOR"}</small></div><div><b>${counts.painted ?? 0}</b><small>PAINTED</small></div><div><b>${counts.left ?? 0}</b><small>STILL TO PAINT</small></div></div>
      <p class="more">${more} What is missing now stays as it is: PAINT MISSING paints it.</p>
      <div class="acts"><button class="mls-btn red" data-do="${yesAction}">GO AUTOMATIC</button><button class="mls-btn" data-do="${noAction}">STAY MANUAL</button></div>
    </div></div>`;
}
function settingsView({
  life: life,
  look: look,
  options: options,
  edit: edit,
  tab = "look",
  motion = "full",
  systemLess = false,
  resources = null,
  box = {},
  debug = null,
  version = "",
  prompts = null,
}) {
  const tabsHtml = `<div class="tabs">${[
    ["look", "TOWN LOOK"],
    ["motion", "MOTION"],
    ["cast", "CAST"],
    ["rules", "RULES"],
    ["model", "MODEL"],
    ["prompts", "IMAGE PROMPTS"],
    ["debug", "DEBUG"],
  ]
    .map(
      ([tabId, tabLabel]) =>
        `<button class="${tab === tabId ? "on" : ""}" data-do="settings-tab" data-id="${tabId}">${tabLabel}</button>`,
    )
    .join("")}</div>`;
  if (tab === "cast" || tab === "rules" || tab === "model") {
    return `
    <div class="mls-settings">
      <div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>SETTINGS</h1></div>
      ${tabsHtml}
      <div class="mls-tab-body">${tab === "cast" ? castTab(life, box) : tab === "rules" ? rulesTab(life, box) : modelTab(life, resources, options, box, look)}</div>
    </div>`;
  }
  if (tab === "prompts") {
    return `
    <div class="mls-settings">
      <div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>SETTINGS</h1></div>
      ${tabsHtml}
      ${promptsTab(prompts, look)}
    </div>`;
  }
  if (tab === "debug" && debug) {
    return `
    <div class="mls-settings">
      <div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>SETTINGS</h1></div>
      ${tabsHtml}
      ${debugTab(debug, {
        version: version,
      })}
    </div>`;
  }
  if (tab === "motion") {
    return `
    <div class="mls-settings">
      <div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>SETTINGS</h1></div>
      ${tabsHtml}
      ${motionTab({
        motion: motion,
        systemLess: systemLess,
      })}
    </div>`;
  }
  if (!look || !options) {
    return '<div class="mls-settings"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><p class="hint">Loading\u2026</p></div>';
  }
  const lookDraft = edit ?? look.look,
    connections = options.connections ?? [],
    subjects = [];
  for (const tile of look.tiles) {
    let subject = subjects.find((entry) => entry.subject === tile.subject);
    if (!subject) {
      subjects.push(
        (subject = {
          subject: tile.subject,
          name: tile.name,
          tiles: [],
        }),
      );
    }
    subject.tiles.push(tile);
  }
  const dirty =
    edit &&
    (edit.connectionId !== look.look.connectionId ||
      edit.styleProfileId !== look.look.styleProfileId ||
      edit.tags !== look.look.tags);
  return `
    <div class="mls-settings">
      <div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>SETTINGS</h1></div>
      ${tabsHtml}
      <div class="mls-tab-body">
      ${picturesBox(life?.pictures?.modes, life?.pictures?.counts, {
        rules: life?.rules,
      })}
      ${life ? frameBox(life.frame) : ""}
      ${
        life
          ? sizeBox(
              life.pictureSize,
              connections.filter(
                (connection) =>
                  connection.bySubjects &&
                  [lookDraft.connectionId, life.settings?.images?.connectionId].includes(connection.id),
              ),
            )
          : ""
      }
      ${
        life
          ? portraitBox(
              life.portraitSize,
              connections.filter(
                (connection) =>
                  connection.bySubjects &&
                  [lookDraft.connectionId, life.settings?.images?.connectionId].includes(connection.id),
              ),
            )
          : ""
      }
      <div class="box">
        <h3>HOW THIS LIFE IS PAINTED <small>for every picture, unless MODEL \xB7 IMAGES has its own \xB7 changes only affect what is painted next</small></h3>
        ${
          connections.length
            ? `
        <div class="row3">
          <label class="field">IMAGE CONNECTION<select data-do="look-connection">
            <option value="">\u2014 none \u2014</option>
            ${connections.map((connection) => `<option value="${escape(connection.id)}" ${connection.id === lookDraft.connectionId ? "selected" : ""}>${escape(connection.name)}${connection.model ? ` \xB7 ${escape(connection.model)}` : ""}</option>`).join("")}
          </select><small>Your image connections in Marinara.</small></label>
          <label class="field">STYLE PROFILE<select data-do="look-profile">
            <option value="">Engine default</option>
            ${(options.profiles ?? []).map((profile) => `<option value="${escape(profile.id)}" ${profile.id === lookDraft.styleProfileId ? "selected" : ""}>${escape(profile.name)} \xB7 ${escape(profile.promptMode)}</option>`).join("")}
          </select><small>Your image style profiles in Marinara.</small></label>
          <label class="field">TOWN TAGS \xB7 ENGLISH<input type="text" data-do="look-tags" maxlength="300" value="${escape(lookDraft.tags ?? "")}" placeholder="small coastal town, autumn, warm light">
            <small>Go into every background of this life.</small></label>
        </div>
        <div class="save-row"><button class="mls-btn ${dirty ? "yellow" : ""}" data-do="look-save" ${dirty ? "" : "disabled"}>SAVE</button></div>`
            : '<p class="hint">There are no image connections in this Marinara. Add one (Connections \xB7 Image generation) and come back.</p>'
        }
      </div>
      ${lookQueue(look, {
        canRedo: !!look.look.connectionId,
      })}
      <div class="mls-look-grid">
        ${subjects
          .map(
            (subject) => `
          <div class="tile"><div class="name"><b>${escape(subject.name)}</b><small>DAY \xB7 NIGHT</small></div>
            <div class="pair">${subject.tiles.map((tile) => lookShot(tile)).join("")}</div></div>`,
          )
          .join("")}
      </div>
      </div>
    </div>`;
}
function paintingView({ life: life, look: look }) {
  if (!look) {
    return '<div class="mls-painting"><h1>PAINTING YOUR TOWN</h1><p class="hint">\u2026</p></div>';
  }
  const queue = look.queue,
    done = !queue.pending;
  return `
    <div class="mls-painting">
      <h1>${done ? "YOUR TOWN IS READY" : "PAINTING YOUR TOWN"}</h1>
      <div class="count">${queue.done} / ${queue.total}</div>
      <p class="hint">${done ? "Every place has its background." : "It keeps going even if you close the tab."}</p>
      <div class="mls-mosaic">${look.tiles
        .map((tile) =>
          lookShot(tile, {
            small: true,
          }),
        )
        .join("")}</div>
      <div class="go">
        <button class="mls-start" data-do="painting-go">${done ? "START \u25B8" : "START NOW \u25B8"}<small>${done ? "" : "they appear as they are ready"}</small></button>
      </div>
      ${done ? "" : '<p class="hint">Until its picture is ready, a place shows just its colour.</p>'}
    </div>`;
}
const CAL_SHORT = {
  shift: "Shift",
  off: "Day off",
  rent: "Rent",
  review: "Review",
  delivery: "Delivery",
  news: "New stock",
  date: "Date",
  hang: "Hang out",
  note: "Note",
  wedding: "Wedding",
  anniversary: "Anniversary",
  birthday: "Birthday",
  party: "Party",
};
const calHour = (calEvent) =>
  calEvent.hour === null || calEvent.hour === undefined ? "\u2014" : `${String(calEvent.hour).padStart(2, "0")}:00`;
function calendarView({ cal: cal, day = null, noteOpen = false, error = "" }) {
  if (!cal) {
    return '<div class="mls-settings mls-cal"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><p class="hint">Loading\u2026</p></div>';
  }
  const selected = cal.days.find((day2) => day2.d === day) ?? cal.days.find((day2) => day2.today) ?? cal.days[0],
    cells = [
      ...Array.from(
        {
          length: cal.lead,
        },
        () => '<div class="d out"></div>',
      ),
      ...cal.days.map(
        (
          day2,
        ) => `<button class="d ${day2.today ? "today" : ""} ${day2.d === selected.d ? "sel" : ""} ${day2.past ? "past" : ""} ${day2.before ? "before" : ""}" data-do="cal-day" data-id="${day2.d}">
      <span class="n">${day2.n}</span>
      <span class="dots">${day2.events
        .slice(0, 5)
        .map((ev) => `<i class="cal-${ev.kind} ${ev.state ?? ""}"></i>`)
        .join("")}</span>
      ${day2.events
        .slice(0, 3)
        .map(
          (ev) =>
            `<span class="ev cal-${ev.kind} ${ev.state ?? ""}">${escape(ev.kind === "note" ? ev.what : CAL_SHORT[ev.kind])}</span>`,
        )
        .join("")}${day2.events.length > 3 ? `<span class="more">+${day2.events.length - 3}</span>` : ""}
    </button>`,
      ),
    ].join(""),
    hourList = Array.from(
      {
        length: 24,
      },
      (unused, hour) => hour,
    );
  return `
    <div class="mls-settings mls-cal">
      <div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>CALENDAR</h1>
        <span class="month"><button data-do="cal-season" data-id="-1" ${cal.canBack ? "" : "disabled"}>\u25C2</button>${escape(cal.season.toUpperCase())} \xB7 YEAR ${cal.year}<button data-do="cal-season" data-id="1" ${cal.canAhead ? "" : "disabled"}>\u25B8</button></span></div>
      <div class="body">
        <div><div class="grid">${["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((dow) => `<span class="dow">${dow}</span>`).join("")}${cells}</div>
          <div class="cal-legend">${Object.entries(CAL_SHORT)
            .map(([kind, label]) => `<span class="cal-${kind}">${label}</span>`)
            .join("")}</div></div>
        <div class="day">
          <h2>${escape(selected.weekday.toUpperCase())} ${selected.n} <small>${escape(cal.season.toUpperCase())}${selected.today ? " \xB7 TODAY" : ""}</small></h2>
          ${error ? `<div class="mls-said bad">${escape(error)}</div>` : ""}
          ${selected.events
            .map(
              (ev) => `<div class="slot cal-${ev.kind} ${ev.state ?? ""}"><span class="h">${calHour(ev)}</span>
            <span class="what"><b>${escape(ev.what)}</b>${ev.sub ? `<span>${escape(ev.sub)}</span>` : ""}</span>
            ${ev.kind === "note" ? `<button class="x" data-do="note-del" data-id="${escape(ev.id)}" title="Delete">\u2715</button>` : ""}</div>`,
            )
            .join("")}
          ${
            noteOpen
              ? `<div class="note">
              <input type="text" maxlength="80" placeholder="Write a note\u2026" data-note-text>
              <select data-note-hour><option value="">Any time</option>${hourList.map((hour) => `<option value="${hour}">${String(hour).padStart(2, "0")}:00</option>`).join("")}</select>
              <button class="main" data-do="note-save">SAVE</button><button data-do="note-cancel">CANCEL</button></div>`
              : '<button class="add" data-do="note-open">+ NOTE</button>'
          }
        </div>
      </div>
    </div>`;
}
function sameAsTown(options, look) {
  const connectionId = look?.look?.connectionId ?? "",
    connectionName = connectionId
      ? (options?.connections ?? []).find((connection) => connection.id === connectionId)?.name
      : "";
  return connectionId
    ? `Same as TOWN LOOK \xB7 ${connectionName || "its connection"}`
    : "Same as TOWN LOOK \xB7 none there either";
}
const SETTINGS_RULES = [
  ["hunger", "Hunger", "You have to eat; skipping meals drains energy."],
  ["jealousy", "Jealousy", "How jealous someone gets depends on who they are."],
  ["drifting", "Drifting apart", "People you ignore for too long grow distant."],
  [
    "multipleRelationships",
    "Multiple relationships",
    "Open relationships and more than one marriage, agreed with each person.",
  ],
  [
    "castCouples",
    "Couples in the cast",
    "People in town can date each other or be exes, from their cards and over time.",
  ],
  ["partnersStray", "Infidelity", "Someone you are with can fall for someone else, and ask you to see other people."],
  ["npcs", "NPCs", "People who aren't in your cast, like a club's staff and its regulars. Off: only your cast."],
];
const KEY_IMAGES_RULE = "Big moments with someone get their own picture, kept in the GALLERY.";
const WORK_OUTFITS_RULE = "People are shown in their work clothes while they work.";
const CLOTHES_RULE = "What you wear changes with the clothes you buy, in every scene and in your picture.";
const SETTINGS_SPOILERS = [
  [
    "showArchetypes",
    "Personality types",
    [
      ["hidden", "Hidden", "Nothing shows them; you find out by playing."],
      ["found", "Found in play", "Each one shows up on their sheet once you have seen enough of it."],
      ["always", "Always visible", "Their sheet shows them from the start."],
    ],
    "their type, what they like and dislike, and their gift tastes",
  ],
  [
    "showSchedules",
    "Schedules",
    [
      ["hidden", "Hidden", "You never see anybody's week."],
      ["found", "Only what I have seen", "Their week fills in as you run into them."],
      ["always", "The whole week", "Their sheet shows all of it."],
    ],
    "everybody's whole week, where you have not seen them yet",
  ],
];
const savedMark = (box, boxName) =>
  box.saved?.name === boxName && Date.now() - box.saved.at < 1600
    ? `<em class="mls-saved" style="animation-delay:${-(Date.now() - box.saved.at)}ms">\u2713 SAVED</em>`
    : "";
const boxSaid = (box) =>
  box.error
    ? `<div class="mls-said bad">${escape(box.error)}</div>`
    : box.said
      ? `<div class="mls-said">${escape(box.said)}</div>`
      : "";
function jobPick(life, person) {
  const jobs = life.jobs?.list ?? [],
    current = life.jobs?.who?.[person.id] || "none",
    blocked = life.jobs?.no?.[person.id] ?? {},
    optionsHtml = [
      ["none", "No job"],
      ["out", "Works out of town"],
      ["home", "Works from home"],
      ...jobs.map((job) => [
        job.id,
        `${job.placeName} \xB7 ${job.title} \xB7 ${job.shift}`,
        job.holder && job.holder.id !== person.id ? job.holder.name : job.id !== current ? (blocked[job.id] ?? "") : "",
      ]),
    ]
      .map(
        ([value, label, taken]) =>
          `<option value="${escape(value)}" ${value === current ? "selected" : ""} ${taken ? "disabled" : ""}>${escape(label)}${taken ? ` \xB7 ${escape(taken)}` : ""}</option>`,
      )
      .join(""),
    titleInput =
      current === "home"
        ? `<input type="text" data-job-title-for="${person.id}" maxlength="40" value="${escape(life.jobs?.titles?.[person.id] ?? "")}" placeholder="What they do">`
        : "";
  return `<span class="mls-work-row"><span class="lbl">WORK</span><select data-job-for="${person.id}">${optionsHtml}</select>${titleInput}</span>`;
}
function jobsBox(life) {
  const jobs = life.jobs?.list ?? [];
  return jobs.length
    ? `<div class="box mls-jobs"><h3>JOBS IN TOWN</h3>
    ${jobs
      .map(
        (
          job,
        ) => `<div class="mls-job-row"><b>${escape(job.placeName)}</b><span>${escape(job.title)}</span><small>${escape(job.shift)}</small><small class="c">${escape(job.clothes)}</small>
      <span class="who ${job.holder ? "" : "free"}">${job.holder ? escape(job.holder.name) : "free"}</span></div>`,
      )
      .join("")}</div>`
    : "";
}
const orientPick = (
  person,
) => `<span class="mls-work-row"><span class="lbl">GENDER</span><select data-orient-for="${person.id}" data-orient="gender">${person.gender ? "" : '<option value="" selected disabled>Pick one</option>'}${[
  ["female", "Woman"],
  ["male", "Man"],
]
  .map(([value, label]) => `<option value="${value}" ${person.gender === value ? "selected" : ""}>${label}</option>`)
  .join("")}</select></span>
  <span class="mls-work-row"><span class="lbl">INTO</span><select data-orient-for="${person.id}" data-orient="into">${[
    ["women", "Women"],
    ["men", "Men"],
    ["both", "Women and men"],
  ]
    .map(
      ([value, label]) =>
        `<option value="${value}" ${(person.into ?? "both") === value ? "selected" : ""}>${label}</option>`,
    )
    .join("")}</select></span>`;
const youBox = (you) =>
  `<div class="box"><h3>YOU</h3><span class="mls-work-row"><span class="lbl">YOU ARE</span><select data-your-gender>${you.gender ? "" : '<option value="" selected disabled>Pick one</option>'}${[
    ["female", "A woman"],
    ["male", "A man"],
  ]
    .map(([value, label]) => `<option value="${value}" ${you.gender === value ? "selected" : ""}>${label}</option>`)
    .join("")}</select></span></div>`;
function castTab(life, box) {
  const contacts = life.contacts ?? [],
    inTown = contacts.filter((person) => !person.away),
    movedAway = contacts.filter((person) => person.away),
    castRow = (person) => `
    <div class="mls-cast-set ${person.away ? "gone" : ""}" style="--c:${person.met ? colourFor(person.id) : "#333"}">
      <span class="av ${person.avatar ? "pic" : ""}">${person.avatar ? faceImg(person) : escape(person.met ? (person.name[0] ?? "?").toUpperCase() : "?")}</span>
      <span class="who">${box.rename === person.id ? `<span class="mls-rename"><input type="text" maxlength="60" value="${escape(person.met ? person.name : "")}" placeholder="Their name" data-rename-text="${person.id}"><button class="mls-set-btn" data-do="cast-rename-save" data-character="${person.id}">SAVE</button><button class="mls-set-btn soft" data-do="cast-rename-cancel">CANCEL</button></span>` : `<b>${escape(person.name.toUpperCase())}</b>`}<small>${escape(person.sub || "")}</small>${person.away ? "" : jobPick(life, person)}${orientPick(person)}${person.away ? "" : modCastOptions(life, person)}</span>
      <span class="acts">
        ${person.away ? `<button class="mls-set-btn" data-do="cast-back" data-character="${person.id}">BRING BACK</button>` : `<button class="mls-set-btn soft" data-do="cast-away" data-character="${person.id}">MOVE AWAY</button>`}
        ${person.away ? "" : `<button class="mls-set-btn soft ${box.traits?.id === person.id ? "on" : ""}" data-do="traits-open" data-character="${person.id}">EDIT TRAITS</button>`}
        <button class="mls-set-btn soft ${box.rename === person.id ? "on" : ""}" data-do="cast-rename" data-character="${person.id}">RENAME</button>
        <button class="mls-set-btn soft" data-do="cast-refresh" data-character="${person.id}" title="The life keeps a copy of the card from when they joined: take the card's text and who they are as it is now">UPDATE FROM THE CARD</button>
      </span>
      ${box.traits?.id === person.id ? traitsBox(life, box.traits) : ""}
    </div>`;
  return `
    ${youBox(life)}
    <div class="box">
      <h3>IN TOWN <small>${inTown.length} of up to ${life.maxInTown ?? 30}</small></h3>
      ${boxSaid(box)}
      <div class="mls-cast-set-list">${inTown.map(castRow).join("")}</div>
      <button class="mls-add" data-do="adding-open" ${inTown.length >= (life.maxInTown ?? 30) ? "disabled" : ""}>+ ADD PEOPLE<small>from your cards</small></button>
    </div>
    ${jobsBox(life)}
    ${
      movedAway.length
        ? `<div class="box"><h3>MOVED AWAY <small>they do not show up in town \xB7 bring them back as they were</small></h3>
      <div class="mls-cast-set-list">${movedAway.map(castRow).join("")}</div></div>`
        : ""
    }
    ${
      box.ask
        ? (() => {
            const person = contacts.find((contact) => contact.id === box.ask);
            return `<div class="mls-ask-veil" data-do="cast-away-no"><div class="mls-ask">
      <b>${escape(person?.name ?? "")} moves away?</b>
      <small>They stop showing up in town. Your bond, what they remember and the gifts you gave them are kept: bring them back from here whenever you want.</small>
      <div class="row"><button class="main" data-do="cast-away-yes" data-character="${escape(box.ask)}">MOVE AWAY</button><button data-do="cast-away-no">CANCEL</button></div>
    </div></div>`;
          })()
        : ""
    }`;
}
function traitsBox(life, traits) {
  const showMode = life.rules?.showArchetypes ?? "found",
    note = {
      hidden: "In this life their personality is hidden. Here you see all of it.",
      found: "Their sheet shows it as you find it out. Here you see all of it.",
    }[showMode];
  return `<div class="mls-traits-box">
    ${note ? `<p class="mls-said">${note}</p>` : ""}
    ${traitsEditor(traits.traits, traits.catalog, `set|${traits.id}`, traits.thing ?? "")}
    ${traits.error ? `<div class="mls-said bad">${escape(traits.error)}</div>` : ""}
    <div class="row"><button class="mls-set-btn" data-do="traits-save" data-character="${traits.id}">SAVE</button>
      <button class="mls-set-btn soft" data-do="traits-close">CANCEL</button></div>
  </div>`;
}
function rulesTab(life, box) {
  const rules = life.rules ?? {};
  return `
    <div class="box">
      <h3>RULES ${savedMark(box, "rules")}<small>switch them on or off for this life</small></h3>
      <div class="mls-toggles">${SETTINGS_RULES.map(([key, label, text]) => {
        const held = key === "npcs" && rules.npcs ? (life.npcsHeld ?? "") : "";
        return `
        <label class="mls-tg ${held ? "off" : ""}"><input type="checkbox" data-set-rule="${key}" ${rules[key] ? "checked" : ""} ${held ? "disabled" : ""}><i></i><span><b>${escape(label)}</b><small>${escape(text)}${held ? ` \xB7 ${escape(held.replace(/\.$/, ""))}` : ""}</small></span></label>`;
      }).join("")}
        <label class="mls-tg"><input type="checkbox" data-set-clothes ${rules.clothes ? "checked" : ""}><i></i><span><b>Clothes</b><small>${escape(CLOTHES_RULE)}</small></span></label>
        <label class="mls-tg ${life.keyImages?.connection ? "" : "off"}"><input type="checkbox" data-set-rule="keyImages" ${rules.keyImages ? "checked" : ""} ${life.keyImages?.connection ? "" : "disabled"}><i></i><span><b>Key images</b><small>${escape(KEY_IMAGES_RULE)}${life.keyImages?.connection ? "" : " Needs an image connection: pick one in MODEL \xB7 IMAGES or TOWN LOOK."}</small></span></label>
        <label class="mls-tg ${life.keyImages?.connection ? "" : "off"}"><input type="checkbox" data-set-rule="workOutfits" ${rules.workOutfits ? "checked" : ""} ${life.keyImages?.connection ? "" : "disabled"}><i></i><span><b>Work outfits</b><small>${escape(WORK_OUTFITS_RULE)}${life.keyImages?.connection ? "" : " Needs an image connection: pick one in MODEL \xB7 IMAGES or TOWN LOOK."}</small></span></label>
        <label class="mls-tg ${life.keyImages?.connection ? "" : "off"}"><input type="checkbox" data-set-rule="seasonOutfits" ${rules.seasonOutfits ? "checked" : ""} ${life.keyImages?.connection ? "" : "disabled"}><i></i><span><b>Season outfits</b><small>${escape(SEASON_OUTFITS_RULE)}${life.keyImages?.connection ? "" : " Needs an image connection: pick one in MODEL \xB7 IMAGES or TOWN LOOK."}</small></span></label></div>
      ${modGroup(
        Object.entries(life.modules ?? {}).map(([id, mod]) => ({
          id: id,
          ...mod,
        })),
        life.modules,
        {
          rules: rules,
        },
      )}
    </div>
    <div class="box">
      <h3>SPOILERS ${savedMark(box, "spoilers")}<small>how much the game tells you about people</small></h3>
      ${SETTINGS_SPOILERS.map(
        ([key, label, choices, what]) => `
        <div class="mls-seg">
          <div class="lbl">${label}</div>
          ${choices
            .map(
              ([value, label2, text]) => `
            <label class="pick ${rules[key] === value ? "on" : ""}"><input type="radio" name="set-${key}" data-set-show="${key}" value="${value}" ${rules[key] === value ? "checked" : ""}>
              <span><b>${label2}</b><small>${text}</small></span></label>`,
            )
            .join("")}
          ${
            box.warn?.key === key
              ? `<div class="mls-spoil-warn"><b>This shows you what you have not found out yet</b><small>${escape(what)}.</small>
            <div class="row"><button class="main" data-do="spoil-yes">SHOW IT</button><button data-do="spoil-no">CANCEL</button></div></div>`
              : ""
          }
        </div>`,
      ).join("")}
    </div>`;
}
const SAMPLING_NUMBER_FIELDS = [
  ["temperature", "Temperature", 0, 2, 0.05],
  ["topP", "Top P", 0, 1, 0.01],
  ["topK", "Top K", 0, 1e6, 1],
  ["minP", "Min P", 0, 1, 0.01],
  ["frequencyPenalty", "Frequency penalty", -2, 2, 0.05],
  ["presencePenalty", "Presence penalty", -2, 2, 0.05],
];
const SAMPLING_CHOICE_FIELDS = [
  ["verbosity", "Verbosity", ["low", "medium", "high"]],
  ["serviceTier", "Service tier", ["flex", "priority"]],
];
// Blank means "the connection's own value"; attr(key) wires each field, resetAttr the reset button.
function samplingFields(sampling = {}, attr, resetAttr) {
  const value = (key) => (sampling[key] === undefined || sampling[key] === null ? "" : String(sampling[key]));
  return `
      <div class="mls-set-fields mls-sampling">
        ${SAMPLING_NUMBER_FIELDS.map(([key, label, min, max, step]) => `<label class="field">${label}<input type="number" ${attr(key)} min="${min}" max="${max}" step="${step}" value="${escape(value(key))}" placeholder="connection default"></label>`).join("")}
        ${SAMPLING_CHOICE_FIELDS.map(([key, label, choices]) => `<label class="field">${label}<select ${attr(key)}><option value="">connection default</option>${choices.map((choice) => `<option value="${choice}" ${choice === sampling[key] ? "selected" : ""}>${choice}</option>`).join("")}</select></label>`).join("")}
        <label class="field">Answer length \xD7<input type="number" ${attr("maxTokensScale")} min="0.5" max="4" step="0.25" value="${escape(value("maxTokensScale"))}" placeholder="1"></label>
        <label class="field wide">Stop sequences<input type="text" ${attr("stop")} value="${escape(Array.isArray(sampling.stop) ? sampling.stop.join(", ") : (sampling.stop ?? ""))}" placeholder="comma or newline separated, up to 8"></label>
        <label class="field wide">Custom parameters (JSON)<textarea ${attr("customParameters")} rows="3" spellcheck="false" placeholder='{"seed": 7}'>${escape(typeof sampling.customParameters == "object" ? JSON.stringify(sampling.customParameters, null, 2) : (sampling.customParameters ?? ""))}</textarea></label>
      </div>
      <div class="row"><button ${resetAttr}>RESET TO CONNECTION DEFAULTS</button></div>`;
}
function modelTab(life, resources, options, box, look = null) {
  const settings = life.settings ?? {};
  if (!resources) {
    return '<div class="box"><p class="hint">Loading\u2026</p></div>';
  }
  const images = settings.images ?? {};
  return `
    <div class="box">
      <h3>MODEL ${savedMark(box, "model")}<small>who writes this life</small></h3>
      ${boxSaid(box)}
      <div class="mls-set-fields">
        <label class="field">Connection<select data-set="connection">${resources.connections.map((connection) => `<option value="${escape(connection.id)}" ${connection.id === settings.connection ? "selected" : ""}>${escape(connection.name)}${connection.model ? ` \xB7 ${escape(connection.model)}` : ""}</option>`).join("")}</select></label>
        <label class="field">Reasoning<select data-set="effort">${(resources.efforts ?? []).map((effort) => `<option value="${escape(effort)}" ${effort === settings.effort ? "selected" : ""}>${escape(effort)}</option>`).join("")}</select></label>
        <label class="field">Narration language<select data-set="language">${[...new Set([...(resources.languages ?? []), settings.language].filter(Boolean))].map((language) => `<option value="${escape(language)}" ${language === settings.language ? "selected" : ""}>${escape(language)}</option>`).join("")}</select></label>
      </div>
      <h3>ADVANCED<small>sampling for this life; blank uses the connection's value</small></h3>
      ${samplingFields(settings.sampling ?? {}, (key) => `data-sample="${key}"`, 'data-do="sampling-reset"')}
    </div>
    <div class="box">
      <h3>IMAGES ${savedMark(box, "images")}<small>every picture but the town's backgrounds, which are in TOWN LOOK</small></h3>
      <div class="mls-set-fields">
        <label class="field">Image connection<select data-set="imageConnection"><option value="">${escape(sameAsTown(options, look))}</option>
          ${(options?.connections ?? []).map((connection) => `<option value="${escape(connection.id)}" ${connection.id === images.connectionId ? "selected" : ""}>${escape(connection.name)}${connection.model ? ` \xB7 ${escape(connection.model)}` : ""}</option>`).join("")}</select></label>
        <label class="field">Style<select data-set="imageStyle"><option value="">Engine default</option>
          ${(options?.profiles ?? []).map((profile) => `<option value="${escape(profile.id)}" ${profile.id === images.styleProfileId ? "selected" : ""}>${escape(profile.name)} \xB7 ${escape(profile.promptMode)}</option>`).join("")}</select></label>
      </div>
    </div>`;
}

export {
  IP_FIELD,
  PORTRAIT_SIZES,
  calendarView,
  frameChoice,
  ipBar,
  ipChanged,
  ipHead,
  ipPreview,
  ipUnsaved,
  ipUsed,
  paintingView,
  picturesBox,
  picturesWarning,
  portraitChoice,
  samplingFields,
  settingsView,
  sizeChoice,
  sizeWH,
};
