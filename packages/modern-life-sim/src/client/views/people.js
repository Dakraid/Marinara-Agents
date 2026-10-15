// Contacts, character sheets, chart, gallery, news, network
import { colourFor, escape, faceImg, frameImg, headOf, paintIcon, safePart, uploadIcon } from "./common.js";
import { tierLabel } from "./place.js";
import { modSheetEdits, modSheetFacts, modSheetToggles, sheetDates } from "./mods.js";
import { S } from "../state.js";

const CONTACT_GROUPS = [
  ["close", "CLOSE"],
  ["met", "ACQUAINTANCES"],
  ["unmet", "NOT MET"],
  ["away", "MOVED AWAY"],
];
const SHEET_AXES = {
  friendship: "Friendship",
  romance: "Romance",
  trust: "Trust",
};
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hh = (hour) => String(hour % 24).padStart(2, "0");
const spanLabel = (span) =>
  (span.to - span.from + 24) % 24 === 0 ? "All day" : `${hh(span.from)}\u2013${span.to === 24 ? "24" : hh(span.to)}`;
function birthdayToday(sheet) {
  const birthday = sheet.birthday;
  return !birthday?.known || !birthday.today
    ? ""
    : `<div class="box mls-figure">
      <h3>\u{1F382} THEIR BIRTHDAY \xB7 TODAY <small>a present counts \xD72${birthday.cares ? " \xB7 they notice if the day goes by without a word" : ""}</small></h3>
      <div class="row"><span class="k">SAID</span><span>${birthday.said ? "Yes \xB7 this year" : "Not yet \xB7 a message counts as saying it"}</span></div>
      ${birthday.said ? "" : `<button class="mls-btn" data-do="bday-message" data-character="${escape(sheet.id)}">\u2709 SEND HAPPY BIRTHDAY</button>`}
    </div>`;
}
function contactRows({ life: life, sheet = null, find = "" }) {
  const query = String(find).trim().toLowerCase(),
    contacts = (life.contacts ?? []).filter(
      (contact) =>
        !query ||
        String(contact.name ?? "")
          .toLowerCase()
          .includes(query),
    ),
    contactRow = (contact) => `
    <button class="mls-contact ${sheet?.id === contact.id ? "on" : ""} ${contact.met ? "" : "unmet"}" data-do="sheet" data-character="${contact.id}" style="--c:${contact.met ? colourFor(contact.id) : "#333"}">
      <span class="av ${contact.avatar ? "pic" : ""}">${contact.avatar ? faceImg(contact) : escape(contact.met ? (String(contact.name ?? "")[0] ?? "?").toUpperCase() : "?")}</span>
      <span class="who"><b>${escape(String(contact.name ?? "").toUpperCase())}</b><small>${escape(contact.sub)}</small></span>
      ${contact.event ? '<span class="flag y">EVENT</span>' : contact.drifting ? '<span class="flag">DRIFTING</span>' : ""}
    </button>`;
  return (
    CONTACT_GROUPS.map(([groupId, label]) => {
      const members = contacts.filter((contact) => contact.group === groupId);
      return members.length ? `<div class="group">${label}</div>${members.map(contactRow).join("")}` : "";
    }).join("") || `<p class="hint">${query ? "Nobody by that name." : "Nobody in this life yet."}</p>`
  );
}
function faceEditor(sheet, face) {
  return `
    <div class="mls-face-edit">
      <div class="pad" data-face-pad>
        <img src="${escape(sheet.avatar)}" alt="" draggable="false">
        <span class="ring" data-face-ring style="left:${face.x}%;top:${face.y}%;width:${100 / face.zoom}%"></span>
      </div>
      <div class="side">
        <h3>THEIR FACE</h3>
        <div class="preview">${headOf(
          {
            ...sheet,
            face: face,
            met: true,
          },
          "big",
        )}<span class="hint">This is how they look on the map and at their door.</span></div>
        <label class="zoom">ZOOM <input type="range" min="1" max="4" step="0.05" value="${face.zoom}" data-do="face-zoom"></label>
        <div class="hint">Drag the circle onto their face. Places and scenes use the same spot.</div>
        <div class="acts"><button class="save" data-do="face-save">SAVE</button><button class="plain" data-do="face-reset">RESET</button><button class="plain" data-do="face-cancel">CANCEL</button></div>
      </div>
    </div>`;
}
const SHEET_TABS = [
  ["about", "ABOUT"],
  ["us", "US"],
  ["life", "LIFE"],
  ["looks", "LOOKS"],
  ["memories", "MEMORIES"],
];
function sheetView(
  sheet,
  { editing = null, adding = false, face = null, figure = false, tab = "about", memWith = null } = {},
) {
  const backButton = '<button class="mls-back flat to-list" data-do="contacts-list">\u25C2 CONTACTS</button>';
  if (!sheet.met) {
    return `${backButton}
      <div class="hero"><div class="portrait unknown ${sheet.avatar ? "framed" : ""}">${sheet.avatar ? frameImg(sheet) : "?"}</div>
        <div><h2>???</h2><div class="line">You have not met. When you run into them, introduce yourself.</div></div></div>`;
  }
  const bondBar = (bond) => `
    <div class="bond ${bond.frozen ? "frozen" : ""} ${bond.event ? `ev-${bond.event}` : ""}">
      <div class="row1"><span>${SHEET_AXES[bond.axis]}</span><span class="tier">${escape(tierLabel(bond.name))}</span></div>
      <div class="bar"><i style="width:${Math.max(0, Math.min(100, bond.value))}%"></i>${bond.mark !== null ? `<span class="mark" style="left:${bond.mark}%"></span>` : ""}</div>
      <div class="next">${escape(bond.next)}</div>
    </div>`,
    hasModules = (sheet.modules ?? []).length > 0,
    tabs = [...SHEET_TABS, ...(hasModules ? [["adult", "ADULT"]] : [])],
    activeTab = tabs.some(([id]) => id === tab) ? tab : "about",
    parts = sheetNetworkParts(sheet),
    renderTab = {
      about: () => safePart("about", () => sheetAbout(sheet)),
      us: () => `
      ${
        sheet.canJustFriends
          ? `<div class="box"><button class="mls-tgbtn ${sheet.justFriends ? "on" : ""}" data-do="just-friends" data-on="${sheet.justFriends ? "0" : "1"}">
        <i></i><span><b>Just friends</b><small>Freezes romance with them. You can switch it back later.</small></span></button></div>`
          : ""
      }
      ${parts.perks}${parts.open}${parts.partners}${parts.dream}${parts.knows}`,
      life: () => `${parts.work}${parts.people}${parts.tastes}
      <div class="box">
        <h3>THEIR WEEK <small>only what you have seen</small></h3>
        ${safePart("their week", () => sheetWeek(sheet))}
      </div>`,
      looks: () => `
      ${
        face
          ? faceEditor(sheet, face)
          : sheet.avatar
            ? `<div class="box mls-face-box"><h3>THEIR FACE <small>on the map, in the lists and at their door</small></h3>
        <div class="row">${headOf(
          {
            ...sheet,
            met: true,
          },
          "big",
        )}<div class="say"><span class="hint">The circle the game cuts from their picture. If it misses their face, move it.</span>
          <button class="mls-btn" data-do="face-edit">ADJUST FACE</button></div></div></div>`
            : ""
      }
      ${safePart("in pictures", () => sheetFigure(sheet, figure))}${parts.seasons}`,
      memories: () =>
        safePart("memories", () =>
          sheetMemories(sheet, {
            editing: editing,
            adding: adding,
            memWith: memWith,
          }),
        ),
      adult: () =>
        safePart(
          "adult",
          () => `<div class="box">${modSheetToggles(sheet)}${modSheetFacts(sheet)}${modSheetEdits(sheet)}</div>`,
        ),
    }[activeTab];
  return `${backButton}
    <div class="mls-sheet-head">
      <div class="portrait ${sheet.avatar ? "framed" : ""}" style="--c:${colourFor(sheet.id)}">${sheet.avatar ? frameImg(sheet) : "PORTRAIT"}</div>
      <div class="who">
        <h2>${escape(String(sheet.name ?? "").toUpperCase())}</h2>
        ${sheet.line ? `<div class="line">${escape(sheet.line)}</div>` : ""}
        <div class="now">Right now: ${sheet.now ? `<span>${escape(sheet.now.place)}</span>${sheet.now.asleep ? ` \xB7 asleep until ${escape(sheet.now.asleep)}` : sheet.now.doing ? ` \xB7 ${escape(sheet.now.doing)}` : ""}` : "<span>?</span> \xB7 you have not seen them at this hour"}</div>
        <div class="tags">${(sheet.tags ?? []).map((tag) => `<span class="tag">${escape(tag)}</span>`).join("")}</div>
      </div>
      <div class="bonds">${safePart("bonds", () => (sheet.bonds ?? []).map(bondBar).join(""))}</div>
    </div>
    ${safePart("birthday", () => birthdayToday(sheet))}
    <nav class="mls-tabbar">${tabs.map(([id, label]) => `<button class="${id === activeTab ? "on" : ""}" data-do="sheet-tab" data-tab="${id}">${label}</button>`).join("")}</nav>
    <div class="mls-sheet-tab" data-tab="${activeTab}">${renderTab()}</div>`;
}
function sheetAbout(sheet) {
  const likeChips = (words, cls) => words.map((word) => `<span class="like ${cls}">${escape(word)}</span>`).join(""),
    known = sheet.known ?? {};
  return `
      <div class="box">
        <h3>WHAT YOU KNOW <small>grows with trust</small></h3>
        ${sheet.birthday ? `<div class="arch"><span class="k">BIRTHDAY</span><span class="v ${sheet.birthday.known ? "" : "q"}">${sheet.birthday.known ? `${escape(sheet.birthday.label)} \xB7 ${escape(sheet.birthday.when)}` : "??? \xB7 once you're friends, or ask them"}</span></div>` : ""}
        ${sheet.into ? `<div class="arch"><span class="k">INTO</span><span class="v ${sheet.into.known ? "" : "q"}">${sheet.into.known ? escape(sheet.into.name) : "??? \xB7 once you're friends, or flirt with them"}</span></div>` : ""}
        <div><div class="hint lbl">Personality</div><div class="likes">${
          known.traits?.length
            ? likeChips(
                known.traits.map((trait) => trait.word),
                "",
              )
            : ""
        }${known.traits?.length ? "" : known.full ? '<span class="hint">Nothing that stands out</span>' : likeChips(["???"], "q")}</div>
          ${known.full ? "" : `<div class="hint">${escape(known.traitsHint)}</div>`}</div>
        <div><div class="hint lbl">Likes</div><div class="likes">${known.likes ? likeChips(known.likes, "") || '<span class="hint">Nothing in particular</span>' : likeChips(["???", "???"], "q")}</div></div>
        <div><div class="hint lbl">Dislikes</div><div class="likes">${known.dislikes ? likeChips(known.dislikes, "no") || '<span class="hint">Nothing in particular</span>' : likeChips(["???"], "q")}</div></div>
        ${known.likes ? "" : `<div class="hint">${escape(known.likesHint)}</div>`}
      </div>
      ${safePart("gifts", () => (sheet.gifts ? `<div class="box">${sheetGifts(sheet.gifts, likeChips)}</div>` : ""))}
      ${safePart("going out", () => `<div class="box">${sheetDates(sheet, likeChips)}</div>`)}`;
}
function sheetWeek(sheet) {
  return sheet.week
    ? `<div class="mls-sheet-week">${sheet.week
        .map(
          (spans, index) => `
        <div class="day"><div class="h">${DAY_SHORT[index]}</div>
          ${spans.length ? spans.map((span) => (span.sleep ? `<div class="c sleep"><b>${spanLabel(span)}</b> \u{1F4A4} Asleep<small>${escape(span.place)}</small></div>` : `<div class="c"><b>${spanLabel(span)}</b> ${escape(span.place)}${span.doing ? `<small>${escape(span.doing)}</small>` : ""}</div>`)).join("") : '<div class="c q">?</div>'}
        </div>`,
        )
        .join("")}</div>`
    : '<div class="hint">Their week is hidden, as you chose for this life.</div>';
}
function sheetMemories(sheet, { editing = null, adding = false, memWith = null } = {}) {
  const others = sheet.withOthers ?? [],
    other = memWith ? (others.find((entry) => entry.id === memWith) ?? null) : null,
    withTabs = others.length
      ? `<div class="mls-memwith">${[["", "WITH YOU"], ...others.map((item) => [item.id, `WITH ${item.name.toUpperCase()}`])].map(([item, label]) => `<button class="${(other?.id ?? "") === item ? "on" : ""}" data-do="mem-with" data-id="${escape(item)}">${escape(label)}</button>`).join("")}</div>`
      : "",
    memories = other ? other.memories : sheet.memories,
    budget = other ? other.memoryBudget : sheet.memoryBudget,
    memoryRow = (memory) =>
      editing === memory.id
        ? `<div class="m editing">
        <div class="when"><span>${escape(memory.when || "")}</span></div>
        <textarea data-do="mem-text" maxlength="600">${escape(memory.text)}</textarea>
        <div class="acts"><button class="save" data-do="mem" data-action="edit" data-memory="${memory.id}">SAVE</button>
          <button class="plain" data-do="mem-cancel">CANCEL</button></div>
      </div>`
        : `<div class="m ${memory.pinned ? "pin" : ""} ${memory.from === "summary" ? "summary" : ""} ${memory.read ? "" : "unread"}">
        <div class="when"><span>${memory.from === "summary" ? `EARLIER \xB7 SUMMARY OF ${memory.covers} MEMOR${memory.covers === 1 ? "Y" : "IES"}` : `${escape(memory.when || "")}${memory.by ? ` \xB7 AS ${escape(memory.by.toUpperCase())} REMEMBERS IT` : ""}${memory.from === "hand" ? " \xB7 WRITTEN BY YOU" : memory.edited ? " \xB7 EDITED" : ""}`}${memory.read ? "" : " \xB7 NOT READ \xB7 summed up after the next scene"}</span>
          <span class="tools">
            ${memory.from === "summary" ? "" : `<button class="${memory.pinned ? "on" : ""}" data-do="mem" data-action="${memory.pinned ? "unpin" : "pin"}" data-memory="${memory.id}">${memory.pinned ? "PINNED" : "PIN"}</button>`}
            <button data-do="mem-edit" data-memory="${memory.id}">EDIT</button>
            <button data-do="mem" data-action="delete" data-memory="${memory.id}">DELETE</button>
          </span></div>
        <p>${escape(memory.text)}</p>
      </div>`;
  return `
    <div class="box">
      ${withTabs}
      <h3>${other ? `WHAT ${escape(sheet.name.toUpperCase())} AND ${escape(other.name.toUpperCase())} REMEMBER` : "WHAT THEY REMEMBER"} <small>edit, pin or delete \xB7 pinned ones always stay</small></h3>
      <div class="mls-membudget">
        <span>They keep <b>~${budget.used.toLocaleString("en-US")}</b> of
          <input type="number" data-do="mem-budget" min="${budget.min}" max="${budget.max}" step="500" value="${budget.budget}"> tokens in mind</span>
        <span class="bar"><i style="width:${Math.min(100, Math.round((budget.used / budget.budget) * 100))}%"></i></span>
        <small>Pinned ones and the summary always stay, then the newest. The rest gets summed up after your next scene.</small>
      </div>
      <div class="mem">${memories.length ? memories.map(memoryRow).join("") : '<div class="hint">Nothing yet. Scenes with them leave memories here.</div>'}</div>
      ${
        adding
          ? `<div class="m editing"><textarea data-do="mem-new" maxlength="600" placeholder="${other ? `Something between ${escape(sheet.name)} and ${escape(other.name)}\u2026` : "Something they know or remember about you\u2026"}"></textarea>
            <div class="acts"><button class="save" data-do="mem-add">ADD</button><button class="plain" data-do="mem-cancel">CANCEL</button></div></div>`
          : '<button class="mls-btn" data-do="mem-add-open">+ ADD A MEMORY</button>'
      }
    </div>`;
}
function contactsView({
  life: life,
  sheet = null,
  find = "",
  editing = null,
  adding = false,
  face = null,
  figure = false,
  tab = "about",
  memWith = null,
  error = "",
  mode = "list",
  chart = null,
  said = "",
  narrow = false,
  focus = null,
}) {
  const modeToggle = `<div class="mls-listchart"><button class="${mode === "chart" ? "" : "on"}" data-do="contacts-listmode">LIST</button><button class="${mode === "chart" ? "on" : ""}" data-do="contacts-chart">CHART</button></div>`;
  return mode === "chart"
    ? `
    <div class="mls-contacts charting">
      <div class="top"><h1>CONTACTS</h1>${modeToggle}<button class="mls-back flat" data-do="map">\u25C2 MAP</button></div>
      ${error ? `<div class="err">${escape(error)}</div>` : ""}${chartView({
        chart: chart,
        said: said,
        narrow: narrow,
        focus: focus,
      })}
    </div>`
    : `
    <div class="mls-contacts ${sheet ? "open" : ""}">
      <aside class="list">
        <div class="top"><h1>CONTACTS</h1><button class="mls-back flat" data-do="map">\u25C2 MAP</button></div>
        ${modeToggle}
        <input class="search" type="text" data-do="contacts-find" placeholder="Search\u2026" value="${escape(find)}">
        <div class="rows" id="mls-contact-rows">${contactRows({
          life: life,
          sheet: sheet,
          find: find,
        })}</div>
      </aside>
      <main class="sheet">${error ? `<div class="err">${escape(error)}</div>` : ""}${
        sheet
          ? safePart("the sheet", () =>
              sheetView(sheet, {
                editing: editing,
                adding: adding,
                face: face,
                figure: figure,
                tab: tab,
                memWith: memWith,
              }),
            ) || '<p class="empty">Their sheet could not be shown.</p>'
          : '<p class="empty">Pick someone from the list.</p>'
      }</main>
    </div>`;
}
function sheetGifts(gifts, renderChips) {
  const giftRow = (label, items, chipKind) =>
    `<div><div class="hint lbl">${label}</div><div class="likes">${(items ?? []).map((item) => (item ? renderChips([item], chipKind) : renderChips(["???"], "q"))).join("")}</div></div>`;
  return `<div class="mls-sheet-gifts">
    <div class="hint lbl strong">GIFTS</div>
    ${giftRow("Loves", gifts.loves, "love")}${giftRow("Likes", gifts.likes, "")}${giftRow("Dislikes", gifts.dislikes, "no")}
    ${gifts.clothes ? `<div class="hint lbl strong">CLOTHES</div>${giftRow("Likes on you", [gifts.clothes.likes], "")}${giftRow("Not on you", [gifts.clothes.dislikes], "no")}` : ""}
    ${gifts.given?.length ? `<div class="given">${gifts.given.map((gift) => `<div><span>${escape(gift.when)}</span> ${escape(gift.icon)} ${escape(gift.name)} \xB7 <b class="${gift.result === "disliked" ? "bad" : ""}">${escape(gift.said)}</b></div>`).join("")}</div>` : ""}
    ${gifts.hint ? `<div class="hint">${escape(gifts.hint)}</div>` : ""}
  </div>`;
}
const CHART_KINDS = {
  couple: {
    name: "Together",
    cls: "couple",
  },
  family: {
    name: "Family",
    cls: "family",
  },
  close: {
    name: "Close",
    cls: "close",
  },
  friends: {
    name: "Friends",
    cls: "friends",
  },
  ex: {
    name: "Exes",
    cls: "ex",
  },
  rivals: {
    name: "Rivals",
    cls: "rivals",
  },
  acquaintances: {
    name: "Know each other",
    cls: "acq",
  },
};
const FAMILY_WORD = {
  siblings: "Siblings",
  parent: "Parent and child",
  cousins: "Cousins",
  relatives: "Family",
};
const chartInner = (person) => person.together || person.romance >= 1 || person.friendship >= 2;
function chartLayout(chart) {
  const closeness = new Map();
  for (const link of chart.links) {
    if (link.kind !== "acquaintances") {
      closeness.set(`${link.a}|${link.b}`, link.close);
      closeness.set(`${link.b}|${link.a}`, link.close);
    }
  }
  const pullScore = (person) => (person.together ? 1e3 : 0) + person.romance * 60 + person.friendship * 40,
    orderRing = (group) => {
      const remaining = [...group].sort((left, right) => pullScore(right) - pullScore(left)),
        ordered = [];
      for (; remaining.length;) {
        const previous = ordered.at(-1);
        let pickIndex = 0;
        if (previous) {
          let best = -1;
          remaining.forEach((candidate, index) => {
            const score = closeness.get(`${previous.id}|${candidate.id}`) ?? -1;
            if (score > best) {
              best = score;
              pickIndex = index;
            }
          });
          if (best < 0) {
            pickIndex = 0;
          }
        }
        ordered.push(remaining.splice(pickIndex, 1)[0]);
      }
      return ordered;
    },
    innerRing = orderRing(chart.people.filter(chartInner)),
    outerRing = orderRing(chart.people.filter((person) => !chartInner(person))),
    positions = {},
    placeRing = (ring, radius, offset) =>
      ring.forEach((person, index) => {
        const angle = -Math.PI / 2 + offset + (2 * Math.PI * index) / Math.max(1, ring.length);
        positions[person.id] = {
          x: Math.round(500 + radius * Math.cos(angle)),
          y: Math.round(500 + radius * Math.sin(angle)),
        };
      });
  placeRing(innerRing, outerRing.length ? 230 : 330, 0);
  placeRing(outerRing, 410, outerRing.length ? Math.PI / Math.max(1, outerRing.length) : 0);
  return positions;
}
function chartSays(link, peopleById) {
  const nameA = peopleById.get(link.a)?.name ?? "?",
    nameB = peopleById.get(link.b)?.name ?? "?",
    kindName =
      link.kind === "family" ? (FAMILY_WORD[link.detail] ?? "Family") : (CHART_KINDS[link.kind]?.name ?? link.kind);
  return `${nameA} and ${nameB}: ${kindName.toLowerCase()}`;
}
function chartYouSays(person) {
  return person.together
    ? `${person.name} and you: ${person.status.toLowerCase()}`
    : person.likesYou
      ? `${person.name} has feelings for you (${person.romanceName})`
      : `${person.name} and you: ${[person.friendshipName, person.romanceName].filter(Boolean).join(", ").toLowerCase()}`;
}
function chartView({ chart: chart, said = "", narrow = false, focus = null }) {
  if (!chart) {
    return '<div class="mls-chart"><p class="hint">Opening\u2026</p></div>';
  }
  if (!chart.people.length) {
    return `<div class="mls-chart"><p class="hint">You haven't met anyone yet.</p></div>`;
  }
  const positions = chartLayout(chart),
    peopleById = new Map(chart.people.map((person) => [person.id, person])),
    lineSvg = (x1, y1, x2, y2, cls, dataAttrs, saidText, arrow = false) => `
    <line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${dataAttrs} vector-effect="non-scaling-stroke"${arrow ? ' marker-end="url(#mls-chart-arrow)"' : ""}/>
    <line class="hit" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${dataAttrs} vector-effect="non-scaling-stroke" data-do="chart-link" data-said="${escape(saidText)}"/>`,
    theirLines = chart.links
      .map((link) =>
        lineSvg(
          positions[link.a].x,
          positions[link.a].y,
          positions[link.b].x,
          positions[link.b].y,
          CHART_KINDS[link.kind]?.cls ?? "acq",
          `data-a="${escape(link.a)}" data-b="${escape(link.b)}"`,
          chartSays(link, peopleById),
        ),
      )
      .join(""),
    yourLines = chart.people
      .map((person) => {
        const cls = person.together
            ? "you-together"
            : person.romance >= 1
              ? "you-romance"
              : `you-f${person.friendship}`,
          { x: px, y: py } = positions[person.id],
          dx = px - 500,
          dy = py - 500,
          dist = Math.hypot(dx, dy) || 1,
          end = person.likesYou
            ? {
                x: 500 + (dx / dist) * 58,
                y: 500 + (dy / dist) * 58,
              }
            : {
                x: 500,
                y: 500,
              };
        return lineSvg(
          px,
          py,
          Math.round(end.x),
          Math.round(end.y),
          cls,
          `data-a="${escape(person.id)}" data-b="you"`,
          chartYouSays(person),
          person.likesYou,
        );
      })
      .join(""),
    nodeButton = (person) => `
    <button class="node ${person.together ? "together" : ""} ${person.likesYou ? "likes" : ""} ${focus === person.id ? "lit" : ""}" data-do="${narrow && focus !== person.id ? "chart-focus" : "sheet"}" data-character="${escape(person.id)}" data-node="${escape(person.id)}"
      style="left:${positions[person.id].x / 10}%;top:${positions[person.id].y / 10}%;--c:${colourFor(person.id)}">
      <i class="${person.avatar ? "pic" : ""}">${person.avatar ? faceImg(person) : escape((person.name[0] ?? "?").toUpperCase())}</i>
      <b>${escape(person.name.toUpperCase())}</b>${person.status ? `<small>${escape(person.status.toUpperCase())}</small>` : ""}
    </button>`,
    kinds = new Set(chart.links.map((link) => link.kind)),
    legend = [
      ...(chart.people.some((person) => person.together) ? [["you-together", "Your partner"]] : []),
      ...(chart.people.some((person) => !person.together && !person.likesYou && person.romance >= 1)
        ? [["you-romance", "Romance with you"]]
        : []),
      ...(chart.people.some((person) => person.likesYou) ? [["you-romance arrow", "Has feelings for you"]] : []),
      ...(chart.people.some((person) => !person.together && person.romance < 1)
        ? [["you-friend", "You and them: the lighter, the closer"]]
        : []),
      ...Object.entries(CHART_KINDS)
        .filter(([kind]) => kinds.has(kind) && kind !== "acquaintances")
        .map(([, kindInfo]) => [kindInfo.cls, kindInfo.name]),
      ...(kinds.has("acquaintances") ? [["acq", `Know each other (${narrow ? "tap" : "point at"} someone)`]] : []),
    ];
  return `
    <div class="mls-chart">
      <div class="board">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          <defs><marker id="mls-chart-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker></defs>
          <g class="theirs">${theirLines}</g><g class="yours">${yourLines}</g>
        </svg>
        <div class="you"><i class="${chart.you.avatar ? "pic" : ""}">${chart.you.avatar ? `<img src="${escape(chart.you.avatar)}" alt="">` : "YOU"}</i><b>${escape(String(chart.you.name).toUpperCase())}</b></div>
        ${chart.people.map(nodeButton).join("")}
      </div>
      <div class="foot">
        <div class="key">${legend.map(([cls, text]) => `<span><i class="${cls}"></i>${escape(text)}</span>`).join("")}</div>
        ${narrow && focus && peopleById.has(focus) ? `<p class="said">${escape(chartYouSays(peopleById.get(focus)))} <button class="open" data-do="sheet" data-character="${escape(focus)}">OPEN \u25B8</button></p>` : `<p class="said" id="mls-chart-said">${escape(said)}</p>`}
      </div>
    </div>`;
}
const SEX_NAMES = {
  female: "Woman",
  male: "Man",
  futanari: "Futanari",
  other: "Other",
};
function albumTile(photo, { who = false } = {}) {
  const pic = photo.url
      ? `<div class="pic" style="background-image:url('${escape(photo.url)}')"></div>`
      : `<div class="pic wait">${paintIcon(
          photo.status === "manual" ? "missing" : photo.status === "failed" ? "failed" : "painting",
          "album-redo",
          {
            id: photo.id,
          },
          "big",
        )}</div>`,
    castNames = photo.cast.map((member) => member.name).join(" \xB7 ");
  return `<button class="mls-album-tile ${photo.status}" data-do="album-open" data-id="${escape(photo.id)}">
      ${pic}${who ? `<span class="who">${escape(castNames.toUpperCase())}</span>` : ""}
      <b>${escape(photo.label)}</b><small>${escape(photo.when ?? "")}${photo.place ? ` \xB7 ${escape(photo.place)}` : ""}</small></button>`;
}
function sheetFigure(character, editing) {
  if (!character.keyImages) {
    return "";
  }
  const figure = character.figure;
  return editing
    ? `
    <div class="box mls-figure editing">
      <h3>IN PICTURES <small>write it in English</small></h3>
      <label class="field">AS<select data-figure="sex">${Object.entries(SEX_NAMES)
        .map(
          ([sexKey, sexName]) =>
            `<option value="${sexKey}" ${figure?.sex === sexKey ? "selected" : ""}>${sexName}</option>`,
        )
        .join("")}</select></label>
      <label class="field">BODY<textarea data-figure="body" maxlength="420">${escape(figure?.body ?? "")}</textarea></label>
      <label class="field">WEARS<textarea data-figure="outfit" maxlength="260">${escape(figure?.outfit ?? "")}</textarea></label>
      <div class="acts"><button class="save" data-do="figure-save">SAVE</button><button class="plain" data-do="figure-cancel">CANCEL</button></div>
    </div>`
    : `
    <div class="box mls-figure">
      <h3>IN PICTURES <small>how key images draw them \xB7 ${figure ? (figure.from === "hand" ? "written by you" : "read from their card") : "not read yet"}</small></h3>
      ${
        figure
          ? `<div class="row"><span class="k">AS</span><span>${escape(SEX_NAMES[figure.sex] ?? figure.sex)}</span></div>
        <div class="row"><span class="k">BODY</span><span>${escape(figure.body)}</span></div>
        <div class="row"><span class="k">WEARS</span><span>${escape(figure.outfit || "\u2014")}</span></div>`
          : ""
      }
      <button class="mls-btn" data-do="figure-edit">${figure ? "EDIT" : "WRITE IT NOW"}</button>
    </div>`;
}
function galleryView({ life: life, gallery: gallery }) {
  const list = gallery?.list ?? null,
    people = [];
  for (const photo of list ?? []) {
    for (const member of photo.cast) {
      if (!people.some((known) => known.id === member.id)) {
        people.push(member);
      }
    }
  }
  const who = gallery?.who ?? "all",
    shown = (list ?? []).filter((photo) => who === "all" || photo.cast.some((member) => member.id === who));
  return `
    <div class="mls-settings mls-gallery">
      <div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>GALLERY</h1></div>
      <div class="tabs">
        <button class="${who === "all" ? "on" : ""}" data-do="gallery-who" data-id="all">EVERYONE</button>
        ${people.map((person) => `<button class="${who === person.id ? "on" : ""}" data-do="gallery-who" data-id="${escape(person.id)}">${escape(person.name.toUpperCase())}</button>`).join("")}
      </div>
      <div class="mls-tab-body"><div class="box">
        <h3>EVERY KEY MOMENT OF THIS LIFE <small>newest first</small></h3>
        ${
          list === null
            ? '<p class="hint">Reading\u2026</p>'
            : shown.length
              ? `<div class="mls-album-grid big">${shown
                  .map((photo) =>
                    albumTile(photo, {
                      who: true,
                    }),
                  )
                  .join("")}</div>`
              : life.keyImages?.on
                ? ""
                : '<p class="hint">Key images are off for this life (SETTINGS \xB7 RULES).</p>'
        }
      </div></div>
    </div>`;
}
function albumLight(photo) {
  if (!photo) {
    return "";
  }
  const busy = photo.status === "queued" || photo.status === "painting";
  return `
    <div class="mls-light" data-do="album-close">
      <div class="in">
        ${photo.url ? `<img src="${escape(photo.url)}" alt="">` : `<div class="wait">${photo.status === "failed" ? `FAILED<small>${escape(photo.error)}</small>` : '<span class="spin"></span>PAINTING'}</div>`}
        <div class="cap"><b>${escape(photo.label)} \xB7 ${escape(
          photo.cast
            .map((member) => member.name)
            .join(" \xB7 ")
            .toUpperCase(),
        )}</b>
          <small>${escape(photo.when ?? "")}${photo.place ? ` \xB7 ${escape(photo.place)}` : ""}</small>
          <span class="acts">
            ${
              photo.versions > 1
                ? `<button data-do="album-pick" data-id="${escape(photo.id)}" data-version="${photo.version - 2}" ${photo.version <= 1 ? "disabled" : ""}>\u25C2</button><span class="v">v${photo.version}/${photo.versions}</span>
              <button data-do="album-pick" data-id="${escape(photo.id)}" data-version="${photo.version}" ${photo.version >= photo.versions ? "disabled" : ""}>\u25B8</button>`
                : ""
            }
            ${busy ? "" : `<button data-do="album-redo" data-id="${escape(photo.id)}">${photo.status === "failed" ? "RETRY" : "REDO"}</button>`}
            <button data-do="album-close">CLOSE</button></span></div>
      </div>
    </div>`;
}
const PER_PAGE = 5;
const PAGES = {};
function paged(pagerId, list) {
  const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE)),
    page = Math.min(Math.max(0, PAGES[pagerId] ?? 0), pageCount - 1);
  return {
    items: list.slice(page * PER_PAGE, (page + 1) * PER_PAGE),
    bar: pager(pagerId, page, pageCount),
  };
}
function pager(pagerId, current, pageCount) {
  if (pageCount <= 1) {
    return "";
  }
  const pages =
      pageCount <= 7
        ? [...Array(pageCount).keys()]
        : [
            ...new Set(
              [0, current - 1, current, current + 1, pageCount - 1].filter((left) => left >= 0 && left < pageCount),
            ),
          ].sort((left, right) => left - right),
    parts = [];
  pages.forEach((page, index) => {
    if (index && page - pages[index - 1] > 1) {
      parts.push("<span>\u2026</span>");
    }
    parts.push(
      `<button class="${page === current ? "on" : ""}" data-do="page" data-id="${escape(pagerId)}" data-page="${page}">${page + 1}</button>`,
    );
  });
  return `<div class="mls-pager">${parts.join("")}</div>`;
}
const setPage = (pagerId, page) => {
  PAGES[pagerId] = Math.max(0, Number(page) || 0);
};
function newsFace(person) {
  return !person || person.met === false
    ? '<b class="mls-news-face q">?</b>'
    : `<b class="mls-news-face" style="--c:${colourFor(person.id)}">${faceImg(person)}<i>${escape((person.name ?? "?")[0])}</i></b>`;
}
const POP_ABOUT = 2;
const POP_STORIES = 3;
function newsView({ life: life, news: news }) {
  const weeks = news?.list ?? null,
    pop = !!news?.pop,
    pick = Math.max(0, Math.min((weeks?.length ?? 1) - 1, news?.pick ?? 0)),
    week = weeks?.[pick] ?? null,
    townName = (life?.townName || "town").toUpperCase(),
    withContact = (person) => ({
      ...person,
      ...(life?.contacts ?? []).find((contact) => contact.id === person.id),
      name: person.name,
    }),
    facesRow = (people, max = 8) =>
      `<span class="faces">${people
        .slice(0, max)
        .map((person) => newsFace(withContact(person)))
        .join("")}${people.length > max ? `<b class="mls-news-face more">+${people.length - max}</b>` : ""}</span>`,
    front = week?.front ?? {
      about: [],
      stories: [],
      met: {
        pairs: 0,
        people: [],
        places: [],
      },
    },
    aboutList = pop ? front.about.slice(0, POP_ABOUT) : front.about,
    storiesList = pop ? front.stories.slice(0, POP_STORIES) : front.stories,
    aboutCard = (item) => {
      const carers = [...item.seen, ...item.heard].filter((witness) => witness.cares);
      return `<div class="mls-front-card you">
      <div class="head"><b>${escape(item.what[0].toUpperCase() + item.what.slice(1))}</b>${item.place ? `<small>${item.home ? "at home" : `at the ${escape(item.place)}`}</small>` : ""}</div>
      ${item.seen.length ? `<div class="who"><span class="lbl">SAW IT</span>${facesRow(item.seen)}<span class="names">${escape(item.seen.map((witness) => witness.name).join(", "))}</span></div>` : ""}
      ${item.heard.length ? `<div class="who"><span class="lbl">HEARD</span>${facesRow(item.heard)}<span class="names">${item.heard.map((witness) => `${escape(witness.name)}${witness.from ? ` <i>from ${escape(witness.from)}</i>` : ""}`).join(", ")}</span></div>` : ""}
      ${carers.length ? `<div class="cares">\u2665 IT MATTERS TO ${escape(carers.map((witness) => witness.name.toUpperCase()).join(", "))}</div>` : ""}
    </div>`;
    },
    storyCard = (story) => `<div class="mls-front-card">
      <span class="faces">${newsFace(withContact(story.a))}${story.b ? newsFace(withContact(story.b)) : ""}</span>
      <div class="t"><b>${escape(story.a.name)}${story.b ? ` &amp; ${escape(story.b.name)}` : ""}</b><span>${escape(story.text)}</span></div>
      <span class="tag t-${story.tag.toLowerCase().replace(/\s+/g, "-")}">${escape(story.tag)}</span>
    </div>`,
    metOpen = !!news?.metOpen,
    metBox = front.met.pairs
      ? `<div class="box mls-front-met">
      <button class="line" data-do="news-met"><span class="lbl">ALSO</span>${facesRow(front.met.people, 10)}<b>${front.met.people.length} people met ${front.met.pairs === 1 ? "someone" : "each other"} this week</b><i>${metOpen ? "\u25BE" : "\u25B8"}</i></button>
      ${metOpen ? `<div class="places">${front.met.places.map((place) => `<div class="place"><span class="lbl">${place.home ? "AT HOME" : place.place ? `AT THE ${escape(place.place.toUpperCase())}` : "AROUND TOWN"}</span>${facesRow(place.people, 12)}<span class="names">${escape(place.people.map((person) => person.name).join(", "))}</span></div>`).join("")}</div>` : ""}
    </div>`
      : "",
    weekPicker =
      weeks && weeks.length > 1
        ? `
    <div class="mls-news-weeks">
      <button data-do="news-pick" data-id="${pick + 1}" ${pick >= weeks.length - 1 ? "disabled" : ""}>\u25C2</button>
      <select data-news-week>${weeks.map((weekItem, index) => `<option value="${index}" ${index === pick ? "selected" : ""}>${escape(weekItem.title)}</option>`).join("")}</select>
      <button data-do="news-pick" data-id="${pick - 1}" ${pick <= 0 ? "disabled" : ""}>\u25B8</button>
    </div>`
        : week
          ? `<div class="mls-news-weeks"><span>${escape(week.title)}</span></div>`
          : "",
    hasMore =
      pop && (front.about.length > aboutList.length || front.stories.length > storiesList.length || front.met.pairs);
  return `
    <div class="mls-settings mls-news ${pop ? "pop" : ""}">
      <div class="top">${pop ? "" : '<button class="mls-back flat" data-do="map">\u25C2 MAP</button>'}<h1>${pop ? `THIS WEEK IN ${escape(townName)}` : "NEWS"}</h1></div>
      ${pop ? "" : weekPicker}
      <div class="mls-tab-body mls-front">
        ${
          weeks === null
            ? '<div class="box"><p class="hint">Reading\u2026</p></div>'
            : week
              ? `${aboutList.length ? `<div class="box"><h3>ABOUT YOU</h3><div class="mls-front-grid">${aboutList.map(aboutCard).join("")}</div></div>` : '<div class="box"><h3>ABOUT YOU</h3><p class="hint">Nothing got around.</p></div>'}
             ${storiesList.length ? `<div class="box"><h3>BETWEEN THEM</h3><div class="mls-front-grid">${storiesList.map(storyCard).join("")}</div></div>` : ""}
             ${pop ? "" : metBox}`
              : '<div class="box"><p class="hint">Nothing yet. The first week in town ends on Monday.</p></div>'
        }
        ${pop ? `<div class="mls-news-foot">${hasMore ? '<button class="mls-btn" data-do="news-all">SEE ALL \u25B8</button>' : ""}<button class="mls-btn yellow mls-news-ok" data-do="news-ok">OK</button></div>` : ""}
      </div>
    </div>`;
}
const PAIR_NAMES = {
  acquaintances: "acquaintances",
  friends: "friends",
  close: "close friends",
  family: "family",
  couple: "a couple",
  ex: "exes",
  rivals: "rivals",
  teacher: "teacher of",
  student: "student of",
  guardian: "guardian of",
  ward: "ward of",
  owner: "owner of",
  property: "property of",
};
const FAMILY_NAMES = {
  siblings: "siblings",
  parent: "parent and child",
  cousins: "cousins",
  relatives: "relatives",
  "bio-parent": "biological parent of",
  "adoptive-parent": "adoptive parent of",
  child: "child of",
  "adopted-child": "adopted child of",
};
// One-way relations: the pair's `a` is the lead (teacher, parent, guardian, owner); each lead role and its follower.
const LEAD_ROLES = {
  teacher: "student",
  guardian: "ward",
  owner: "property",
  "bio-parent": "child",
  "adoptive-parent": "adopted-child",
};
const REVERSE_ROLES = {
  student: { kind: "teacher", detail: null },
  ward: { kind: "guardian", detail: null },
  property: { kind: "owner", detail: null },
  child: { kind: "family", detail: "bio-parent" },
  "adopted-child": { kind: "family", detail: "adoptive-parent" },
};
const leadRoleOf = (pair) => {
  const role = pair?.kind === "family" ? pair.detail : pair?.kind;
  return LEAD_ROLES[role] ? role : null;
};
// What `viewerId` is to the other in a one-way pair ("teacher" or "student"), else null.
const pairRoleFor = (pair, viewerId) => {
  const lead = leadRoleOf(pair);
  return lead ? (pair.a === viewerId ? lead : LEAD_ROLES[lead]) : null;
};
const roleName = (role) => PAIR_NAMES[role] ?? FAMILY_NAMES[role] ?? role;
const pairName = (pair, viewerId) => {
  const lead = leadRoleOf(pair);
  if (pair.role) {
    return pair.role;
  }
  if (lead) {
    return viewerId
      ? roleName(pairRoleFor(pair, viewerId))
      : `${roleName(lead).replace(/ of$/, "")} and ${roleName(LEAD_ROLES[lead]).replace(/ of$/, "")}`;
  }
  return pair.kind === "family" ? (FAMILY_NAMES[pair.detail] ?? "family") : (PAIR_NAMES[pair.kind] ?? pair.kind);
};
function workBox(character) {
  const work = character.work;
  if (!work) {
    return "";
  }
  if (work.out) {
    return `<div class="box mls-workbox"><h3>WORK</h3><div class="mls-job-title">WORKS OUT OF TOWN</div>
    <small class="mls-work-note">You can't find them while they're at work.</small></div>`;
  }
  if (work.home) {
    return `<div class="box mls-workbox"><h3>WORK${work.now ? " <small>working right now</small>" : ""}</h3>
    <div class="mls-job-title">${work.title ? `${escape(work.title.toUpperCase())} \xB7 FROM HOME` : "WORKS FROM HOME"}</div>
    ${work.shift ? `<div class="mls-shift">${escape(work.shift)}</div>` : ""}</div>`;
  }
  const editing = S.workEdit === character.id,
    hasSprite = !!work.sprite?.url && (work.sprites || (work.sprite.own && work.rule)),
    picture = hasSprite ? `<img src="${escape(work.sprite.url)}" alt="">` : frameImg(character);
  return `<div class="box mls-workbox"><h3>WORK <small>${work.now ? "at work right now" : `at ${escape(work.place)} while on shift`}</small></h3>
    <div class="mls-work-grid">
      <div class="sprite framed ${hasSprite ? "" : "waiting"}">${picture}${
        hasSprite
          ? `<span class="tag">${work.sprite.own ? "YOUR PICTURE" : "WORK SPRITE"}</span>`
          : work.sprites
            ? paintIcon(
                work.asked ? "painting" : work.sprite?.error ? "failed" : "missing",
                "work-redo",
                {
                  character: character.id,
                },
                "big",
              )
            : work.rule
              ? ""
              : '<span class="tag">RULE OFF</span>'
      }${
        work.rule
          ? uploadIcon("work", {
              character: character.id,
            })
          : ""
      }</div>
      <div><div class="mls-job-title">${escape(String(work.title ?? "").toUpperCase())} \xB7 ${escape(String(work.place ?? "").toUpperCase())}</div>
        <div class="mls-shift">${escape(work.shift)}</div>
        ${
          editing
            ? `<textarea class="mls-work-edit" data-work-text="${character.id}" maxlength="220">${escape(work.outfit)}</textarea>
             <div class="mls-work-btns"><button class="mls-set-btn" data-do="work-save" data-character="${character.id}">SAVE</button><button class="mls-set-btn soft" data-do="work-cancel">CANCEL</button></div>`
            : `<div class="mls-outfit"><small>WHAT THEY WEAR AT WORK</small>${escape(work.outfit)}</div>
             <div class="mls-work-btns"><button class="mls-set-btn soft" data-do="work-edit" data-character="${character.id}">EDIT</button>${work.sprites ? `<button class="mls-set-btn soft" data-do="work-redo" data-character="${character.id}">${work.sprite?.own ? "PAINT IT INSTEAD" : "REDO SPRITE"}</button>` : ""}</div>`
        }
        ${work.rule ? (work.sprite?.error ? `<small class="mls-work-note bad">${escape(work.sprite.error)}</small>` : "") : '<small class="mls-work-note">Switch on \xABWork outfits\xBB in RULES to see them in their work clothes.</small>'}</div>
    </div></div>`;
}
function seasonsBox(character) {
  const seasons = character.seasons;
  if (!seasons) {
    return "";
  }
  const cardCharacter = character.cardAvatar
      ? {
          ...character,
          avatar: character.cardAvatar,
        }
      : character,
    seasonCard = (season, index) => {
      const editing = S.seasonEdit?.id === character.id && S.seasonEdit.i === index,
        hasSprite = !!season.sprite?.url,
        paintButton =
          !seasons.sprites || hasSprite
            ? ""
            : paintIcon(
                season.asked ? "painting" : season.sprite?.error ? "failed" : "missing",
                "season-redo",
                {
                  character: character.id,
                  season: index,
                },
                season.now ? "big" : "",
              );
      return `<div class="mls-season ${season.now ? "now" : ""}">
        <div class="sprite framed ${hasSprite ? "" : "waiting"}">${hasSprite ? `<img src="${escape(season.sprite.url)}" alt="">` : frameImg(cardCharacter)}${season.now ? '<span class="tag">NOW</span>' : ""}${paintButton}${uploadIcon(
          "season",
          {
            character: character.id,
            season: index,
          },
          season.now ? "big" : "",
        )}</div>
        <div class="mls-job-title">${escape(season.season.toUpperCase())}</div>
        ${
          editing
            ? `<textarea class="mls-work-edit" data-season-text="${character.id}" maxlength="300">${escape(season.outfit)}</textarea>
             <div class="mls-work-btns"><button class="mls-set-btn" data-do="season-save" data-character="${character.id}" data-season="${index}">SAVE</button><button class="mls-set-btn soft" data-do="season-cancel">CANCEL</button></div>`
            : `<div class="mls-outfit">${escape(season.outfit || "\u2014")}</div>
             <div class="mls-work-btns">${seasons.written ? `<button class="mls-set-btn soft" data-do="season-edit" data-character="${character.id}" data-season="${index}">EDIT</button>` : ""}${hasSprite && seasons.sprites ? `<button class="mls-set-btn soft" data-do="season-redo" data-character="${character.id}" data-season="${index}">${season.sprite.own ? "PAINT IT INSTEAD" : "REDO SPRITE"}</button>` : ""}</div>
             ${season.sprite?.error ? `<small class="mls-work-note bad">${escape(season.sprite.error)}</small>` : !hasSprite && !season.now && seasons.written ? `<small class="mls-work-note">Painted when ${escape(season.season.toLowerCase())} comes.</small>` : ""}`
        }
      </div>`;
    };
  return `<div class="box mls-workbox mls-seasons">
      <h3>SEASONS <small>what they wear out of work \xB7 ${escape(seasons.list[seasons.now].season.toLowerCase())} now</small></h3>
      <div class="mls-season-grid">${seasons.list.map(seasonCard).join("")}</div>
      <small class="mls-work-note">${seasons.written ? (seasons.sprites ? "Until a season is painted, they wear the one before it, or look like their card." : "Their pictures need an image connection (TOWN LOOK or MODEL \xB7 IMAGES).") : "Their outfits are being written."}</small>
    </div>`;
}
function sheetNetworkParts(character) {
  const part = (label, render) => safePart(label, render),
    peoplePage = paged(`sheet-people-${character.id}`, character.people ?? []),
    knowsPage = paged(`sheet-knows-${character.id}`, character.knowsYou ?? []),
    agreedRow = (label, people) =>
      people.length
        ? `<div class="mls-agreed"><span class="lbl">${label}</span><span class="who">${people.map((person) => escape(person.name)).join(" \xB7 ")}</span><small>since ${escape(people.at(-1).since)}</small></div>`
        : "",
    openBox = part("open", () =>
      character.open
        ? `<div class="box mls-open"><h3>OPEN <small>agreed with each person</small></h3>${agreedRow("YOU CAN SEE", character.open.you)}${agreedRow(`${escape((character.name ?? "").toUpperCase())} CAN SEE`, character.open.them ?? [])}</div>`
        : "",
    ),
    dreamBox = part("dream", () =>
      character.dreamDate
        ? `<div class="box mls-dream"><h3>THEIR DREAM DATE <small>${character.dreamDate.promised ? "you promised it" : "they told you"}</small></h3><p>\u201C${escape(character.dreamDate.text)}\u201D</p>${character.dreamDate.place ? `<div class="tags"><span>${escape(String(character.dreamDate.place).toUpperCase())}</span><span>${escape(String(character.dreamDate.time ?? "").toUpperCase())}</span>${character.dreamDate.gift ? `<span>A GIFT: ${escape(String(character.dreamDate.gift).toUpperCase())}</span>` : ""}</div>` : ""}</div>`
        : "",
    ),
    moodClass = {
      good: "good",
      none: "none",
      unmet: "none",
      tense: "tense",
      rivals: "rivals",
      love: "love",
    },
    partnersBox = part("partners", () =>
      character.partners?.length
        ? `<div class="box mls-yours"><h3>YOUR OTHER PARTNERS <small>how ${escape(character.name ?? "they")} gets along with them</small></h3>
    <div class="mls-pairs">${character.partners.map((partner) => `<div class="mls-pair"><span class="faces">${newsFace(partner)}</span><div><b>${escape(partner.name)}</b><small>${escape(partner.line)}</small></div><span class="mls-mood ${moodClass[partner.mood] ?? ""}">${escape(partner.label)}</span></div>`).join("")}</div></div>`
        : "",
    ),
    perks = character.perks,
    perksBox = part("perks", () =>
      perks
        ? `<div class="box mls-with"><h3>WITH ${escape((character.name ?? "").toUpperCase())} <small>what your friendship opens \xB7 ${escape(perks.tier)}</small></h3>
    ${(perks.tiers ?? []).map((tier) => `<div class="row ${tier.reached ? "" : "later"}"><span class="tier">${escape(tier.name)}</span><div class="what">${(tier.perks ?? []).map((perk) => `<span>${escape(perk)}</span>`).join("")}</div></div>`).join("")}
    ${perks.partnerHelps ? '<p class="mls-with-note">Together: the help is already yours.</p>' : ""}
    ${perks.debt ? `<div class="mls-owe ${perks.debt.overdue ? "late" : ""}"><div><b>YOU OWE ${escape((character.name ?? "").toUpperCase())} $${perks.debt.amount}</b><small>${perks.debt.overdue ? "Overdue \xB7 no more loans until it is paid" : `Pay it back by ${escape(perks.debt.due)}`}</small></div><button class="mls-btn yellow" data-do="debt-pay" data-character="${character.id}">PAY BACK</button></div>` : ""}</div>`
        : "",
    ),
    tastesBox = part("their people's tastes", () =>
      character.theirTastes?.length
        ? `<div class="box mls-their-tastes"><h3>WHAT ${escape((character.name ?? "").toUpperCase())}'S PEOPLE LIKE <small>as gifts \xB7 they told you</small></h3>
    ${character.theirTastes.map((person) => `<div class="mls-pair"><span class="faces">${newsFace(person)}</span><div><b>${escape(person.name)}</b><small>${[...(person.loves ?? []).map((item) => `loves ${item}`), ...(person.likes ?? []).map((item) => `likes ${item}`)].map(escape).join(" \xB7 ") || "\u2014"}</small></div></div>`).join("")}</div>`
        : "",
    ),
    peopleBox = part(
      "their people",
      () => `
      <div class="box mls-net-people">
        <h3>THEIR PEOPLE <small>only who you know too</small></h3>
        ${
          peoplePage.items.length
            ? peoplePage.items
                .map(
                  (pair) => `
          <div class="mls-net-pair">${newsFace(pair)}
            <div class="t"><div class="n"><b>${escape(pair.name)}</b><span class="k k-${escape(pair.kind)}">${escape(String(pairName(pair) ?? "").toUpperCase())}</span></div>
              ${pair.note || pair.place ? `<small>${escape(pair.note || (pair.from === "grew" ? (pair.home ? "Met at home" : `Met at the ${pair.place}`) : ""))}</small>` : ""}</div>
            <span class="bar"><i style="width:${Math.max(0, Math.min(100, pair.close))}%"></i></span>
          </div>`,
                )
                .join("")
            : '<p class="hint">Nobody you know.</p>'
        }${peoplePage.bar}
        ${character.peopleHidden ? `<div class="mls-net-more">+ ${character.peopleHidden} you have not met</div>` : ""}
      </div>`,
    ),
    knowsBox = part(
      "what they know",
      () => `
      <div class="box mls-net-know">
        <h3>WHAT THEY KNOW ABOUT YOU</h3>
        ${
          knowsPage.items.length
            ? knowsPage.items
                .map(
                  (fact) => `
          <div class="mls-net-fact ${fact.how}"><span class="how">${fact.how === "heard" ? "HEARD IT" : fact.how === "there" ? "WAS THERE" : "SAW IT"}</span>
            <div class="t"><b>${escape(fact.what)}</b><small>${fact.how === "heard" ? `from ${escape(fact.from)}` : escape(fact.where)} \xB7 ${escape(fact.when)}</small></div></div>`,
                )
                .join("")
            : '<p class="hint">Nothing yet.</p>'
        }${knowsPage.bar}
      </div>`,
    );
  return {
    work: safePart("work", () => workBox(character)),
    seasons: safePart("seasons", () => seasonsBox(character)),
    open: openBox,
    perks: perksBox,
    partners: partnersBox,
    tastes: tastesBox,
    dream: dreamBox,
    people: peopleBox,
    knows: knowsBox,
  };
}
function sheetNetwork(character) {
  const parts = sheetNetworkParts(character);
  return `${parts.work}${parts.seasons}${parts.open}${parts.perks}${parts.partners}${parts.tastes}${parts.dream}
    <div class="cols">${parts.people}${parts.knows}
    </div>`;
}

export {
  REVERSE_ROLES,
  pairRoleFor,
  FAMILY_NAMES,
  PAIR_NAMES,
  albumLight,
  contactRows,
  contactsView,
  galleryView,
  newsFace,
  newsView,
  pairName,
  setPage,
};
