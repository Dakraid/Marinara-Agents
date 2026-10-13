// Sheet dates and module (mod) toggles, apps and cuts
import { escape, frameImg } from "./common.js";
import { greyRow } from "./place.js";
import { newsFace } from "./people.js";
import { othersCost } from "./outings.js";
import { S, act, afterLifeCancel, call, notify } from "../state.js";
import { saveDraftSoon, startLife } from "../actions/creation.js";
import { saveModule } from "../actions/settings.js";
import { reportEvents } from "../actions/talk.js";

const TASTE_ROWS = [
  ["food", "FOOD"],
  ["films", "FILMS"],
  ["music", "MUSIC"],
  ["outings", "OUTINGS"],
];
function sheetDates(sheet, chips) {
  const tastes = sheet.dateTastes,
    plans = sheet.plans ?? [],
    datesHtml = tastes
      ? `<div class="hint lbl strong">GOING OUT</div>
    <div class="mls-sheet-dates">${TASTE_ROWS.map(([key, label]) => `<div><span class="k">${label}</span>${tastes[key]?.likes ? chips([tastes[key].likes], "") : chips(["???"], "q")}${tastes[key]?.dislikes ? chips([tastes[key].dislikes], "no") : chips(["???"], "q")}</div>`).join("")}</div>`
      : "",
    saidHtml =
      typeof S < "u" && S.sheetSaid?.id === sheet.id
        ? `<div class="mls-sheet-plan"><span class="done">${escape(S.sheetSaid.text)}</span></div>`
        : "",
    plansHtml =
      plans.length || saidHtml
        ? `<div class="hint lbl strong">PLANS</div>${saidHtml}${plans
            .map(
              (plan) => `
    <div class="mls-sheet-plan"><span>${escape(plan.kindName)} \xB7 ${escape(plan.placeName)} \xB7 ${escape(plan.when)}</span>${plan.status === "set" ? (S.sheetCancel === plan.id ? `<button class="bad" data-do="plan-cancel" data-id="${plan.id}">CANCEL IT \xB7 ${plan.day === S.life?.hud?.clock?.dayIndex ? `\u22123 TRUST${plan.kind === "date" ? " \xB7 \u22122 ROMANCE" : ""}` : "\u22121 TRUST"}${escape(othersCost(plan).toUpperCase())}</button><button data-do="sheet-cancel-no">KEEP IT</button>` : `<button data-do="sheet-cancel" data-id="${plan.id}">CANCEL</button>`) : ""}</div>`,
            )
            .join("")}`
        : "";
  return datesHtml + plansHtml;
}
const MOD_FOLD_KEY = "mls-module-fold";
function modFolded() {
  try {
    return JSON.parse(localStorage.getItem(MOD_FOLD_KEY)) ?? {};
  } catch {
    return {};
  }
}
function modFold(id, folded) {
  const next = {
    ...modFolded(),
    [id]: !!folded,
  };
  try {
    localStorage.setItem(MOD_FOLD_KEY, JSON.stringify(next));
  } catch {
    // Best effort: nothing to do when this fails.
  }
  modFoldNow = next;
}
let modFoldNow = null;
const modSummary = (mod, values) =>
  (mod.options ?? [])
    .map((opt) =>
      opt.kind === "check"
        ? values[opt.key]
          ? opt.title
          : ""
        : (opt.choices?.find(([value]) => value === (values[opt.key] ?? opt.start))?.[1] ?? ""),
    )
    .filter(Boolean)
    .join(" \xB7 ");
const MOD_ON_FIRST = {
  settings: (modName) => `Once ${modName} is on, it stays on for this life. You won't be able to switch it off later.`,
  create: (modName) => `Once this life starts, ${modName} stays on for good. You won't be able to switch it off later.`,
  preset: (modName) =>
    `This preset has ${modName} on. Once this life starts, it stays on for good. You won't be able to switch it off later.`,
};
function modOnCard(modOnState) {
  if (!modOnState) {
    return "";
  }
  const first = modOnState.step === 1;
  if (modOnState.key) {
    return `
    <div class="mls-pic-warn"><div class="card">
      <h2>${first ? `TICK \xB7 ${escape(String(modOnState.label).toUpperCase())}` : "ARE YOU SURE?"}</h2>
      <p>${escape(first ? "Once you tick this, it stays ticked for this life. You won't be able to untick it later." : "This can't be undone in this life.")}</p>
      <div class="acts"><button class="mls-btn red" data-do="mod-on-yes">${first ? "TICK IT" : "YES, TICK IT"}</button><button class="mls-btn" data-do="mod-on-no">CANCEL</button></div>
    </div></div>`;
  }
  const message =
    modOnState.where === "settings"
      ? MOD_ON_FIRST.settings
      : modOnState.preset
        ? MOD_ON_FIRST.preset
        : MOD_ON_FIRST.create;
  return `
    <div class="mls-pic-warn"><div class="card">
      <h2>${first ? `SWITCH ON \xB7 ${escape(String(modOnState.name).toUpperCase())}` : "ARE YOU SURE?"}</h2>
      <p>${escape(first ? message(modOnState.name) : "This can't be undone in this life.")}</p>
      <div class="acts"><button class="mls-btn red" data-do="mod-on-yes">${first ? "SWITCH IT ON" : "YES, SWITCH IT ON"}</button><button class="mls-btn" data-do="mod-on-no">CANCEL</button></div>
    </div></div>`;
}
function modOnAnswer(yes) {
  const pending = S.modOn;
  if (!pending || S.busy) {
    return;
  }
  if (yes && pending.step === 1) {
    S.modOn = {
      ...pending,
      step: 2,
    };
    notify();
    return;
  }
  if (((S.modOn = null), pending.where === "settings")) {
    if (!yes) {
      notify();
      return;
    }
    return pending.key
      ? saveModule(pending.id, pending.key, true)
      : (modFold(pending.id, false), saveModule(pending.id, "on", true));
  }
  const draft = S.draft,
    current = draft?.modules?.[pending.id] ?? {};
  if (pending.where === "create") {
    if (yes) {
      draft.modules = {
        ...(draft.modules ?? {}),
        [pending.id]: {
          ...current,
          on: true,
          confirmed: true,
        },
      };
      modFold(pending.id, false);
    }
    notify();
    return;
  }
  if (
    ((draft.modules = {
      ...(draft.modules ?? {}),
      [pending.id]: yes
        ? {
            ...current,
            confirmed: true,
          }
        : {
            ...current,
            on: false,
          },
    }),
    saveDraftSoon(),
    yes)
  ) {
    return startLife();
  }
  notify();
}
const STAYS_ON_WORDS = "Stays on in this life";
const MOD_HELD = "Finish what you're doing first, then switch it on";
const MOD_TICK_HELD = "Finish what you're doing first, then tick it";
const modHeld = () => typeof S < "u" && (!!(S.life?.scene && !S.life.scene.done) || !!S.life?.outing);
const MOD_OFF_HELD = "Finish what you're doing first";
const modBusy = () => typeof S < "u" && (!!S.life?.scene || !!S.life?.outing);
function modNeeds(mod, opt, values, rules, creation) {
  return opt.needsRule && !rules?.[opt.needsRule] && !creation
    ? `Turn on ${opt.ruleName ?? opt.needsRule} in RULES first`
    : opt.needsOption && !values[opt.needsOption]
      ? `Turn on ${(mod.options ?? []).find((other) => other.key === opt.needsOption)?.title ?? "the option it needs"} first`
      : "";
}
function modDependents(mod, key, values) {
  const dependents = [];
  for (let keys = [key]; keys.length;) {
    const found = (mod.options ?? []).filter(
      (opt) => opt.needsOption && keys.includes(opt.needsOption) && values[opt.key] && !dependents.includes(opt),
    );
    dependents.push(...found);
    keys = found.map((opt) => opt.key);
  }
  return dependents;
}
function modDraftNeeds(draft, mods) {
  for (let changed = true; changed;) {
    changed = false;
    for (const mod of mods ?? []) {
      const values = draft.modules?.[mod.id];
      for (const opt of values ? (mod.options ?? []) : []) {
        if (!(
          values[opt.key] !== true ||
          ((!opt.needsRule || draft.rules?.[opt.needsRule]) && (!opt.needsOption || values[opt.needsOption]))
        )) {
          draft.modules = {
            ...draft.modules,
            [mod.id]: {
              ...draft.modules[mod.id],
              [opt.key]: false,
            },
          };
          changed = true;
        }
      }
    }
  }
}
function modGroup(mods, values, { creation = false, title = true, rules = {} } = {}) {
  if (!mods.length) {
    return "";
  }
  const held = !creation && modHeld(),
    busy = !creation && modBusy();
  modFoldNow ??= modFolded();
  const attrs = (modId, key, extra = "") =>
      (creation
        ? `data-do="${key === "on" ? "module" : "module-opt"}" data-id="${escape(key === "on" ? modId : `${modId}.${key}`)}"`
        : `data-set-module="${escape(modId)}" data-opt="${escape(key)}"`) + extra,
    modCard = (mod) => {
      const values2 = values?.[mod.id] ?? {},
        isOn = !!values2.on,
        open = isOn && !modFoldNow[mod.id],
        options = mod.options ?? [],
        body = [...new Set(options.map((opt) => opt.group ?? ""))]
          .map((groupName) => {
            const groupOpts = options.filter((opt) => (opt.group ?? "") === groupName),
              toggles = groupOpts
                .filter((opt) => opt.kind === "check")
                .map((opt) => {
                  const locked = !creation && isOn && opt.locks && values2[opt.key],
                    heldOn = !creation && held && opt.locks && !values2[opt.key],
                    dependents = values2[opt.key] ? modDependents(mod, opt.key, values2) : [],
                    heldOff = busy && values2[opt.key] && (opt.holdsOff || dependents.some((dep) => dep.holdsOff)),
                    lockedByDep =
                      !creation && isOn && values2[opt.key] && !locked && dependents.some((dep) => dep.locks),
                    needs = values2[opt.key] ? "" : modNeeds(mod, opt, values2, rules, creation),
                    alsoNote =
                      creation && opt.needsRule && !rules?.[opt.needsRule] && !values2[opt.key]
                        ? ` \xB7 Also turns on ${opt.ruleName ?? opt.needsRule}`
                        : "",
                    disabled = locked || lockedByDep || heldOn || heldOff || !!needs;
                  return `
          <label class="mls-tg ${disabled ? "off" : ""}"><input type="checkbox" ${attrs(mod.id, opt.key)} ${values2[opt.key] ? "checked" : ""} ${disabled ? "disabled" : ""}><i></i><span><b>${escape(opt.title)}</b><small>${escape(opt.why)}${locked || lockedByDep ? ` \xB7 ${STAYS_ON_WORDS}` : heldOn ? ` \xB7 ${MOD_TICK_HELD}` : heldOff ? ` \xB7 ${MOD_OFF_HELD}` : needs ? ` \xB7 ${escape(needs)}` : escape(alsoNote)}</small></span></label>`;
                })
                .join(""),
              picks = groupOpts
                .filter((opt) => opt.kind === "pick")
                .map((opt) => {
                  const value = values2[opt.key] ?? opt.start;
                  return `<div class="mls-seg"><div class="lbl">${escape(opt.title)}</div>${opt.choices
                    .map(
                      ([choiceValue, choiceLabel, choiceWhy]) => `
          <label class="pick ${value === choiceValue ? "on" : ""}"><input type="radio" name="mod-${escape(mod.id)}-${escape(opt.key)}" ${attrs(mod.id, opt.key, ` value="${escape(choiceValue)}"`)} ${value === choiceValue ? "checked" : ""}>
            <span><b>${escape(choiceLabel)}</b><small>${escape(choiceWhy)}</small></span></label>`,
                    )
                    .join("")}</div>`;
                })
                .join("");
            return `<div class="mls-module-group">${groupName ? `<div class="lbl">${escape(groupName)}</div>` : ""}${toggles ? `<div class="mls-toggles">${toggles}</div>` : ""}${picks}</div>`;
          })
          .join("");
      return `
      <div class="mls-module ${isOn ? "on" : ""} ${open ? "open" : ""}">
        <div class="mls-module-head">
          <label class="mls-tg"><input type="checkbox" ${attrs(mod.id, "on")} ${isOn ? "checked" : ""} ${!creation && (isOn || held) ? "disabled" : ""}><i></i><span><b>${escape(mod.name)}</b><small>${escape(mod.about)}${!creation && isOn ? ` \xB7 ${STAYS_ON_WORDS}` : !creation && held ? ` \xB7 ${MOD_HELD}` : ""}</small></span></label>
          ${isOn && options.length ? `<button class="mls-module-fold" data-do="module-fold" data-id="${escape(mod.id)}" data-on="${open ? "1" : "0"}" title="${open ? "Fold its options" : "Show its options"}">${open ? "\u25BE" : "\u25B8"}</button>` : ""}
        </div>
        ${isOn && !open && modSummary(mod, values2) ? `<div class="mls-module-sum">${escape(modSummary(mod, values2))}</div>` : ""}
        ${open && options.length ? `<div class="mls-module-body">${body}</div>` : ""}
      </div>`;
    };
  return `${title ? '<div class="lbl">Modules</div>' : ""}<div class="mls-modules">${mods.map(modCard).join("")}</div>`;
}
function modSection(catalog, draft) {
  return catalog?.modules?.length
    ? `
        <section id="mls-modules">
          <h2>MODULES <span>you can switch more on later in SETTINGS, never off</span></h2>
          <div class="card">${modGroup(catalog.modules, draft.modules, {
            creation: true,
            title: false,
            rules: draft.rules,
          })}</div>
        </section>`
    : "";
}
function modMissing(draft, catalog) {
  return (catalog?.modules ?? []).flatMap((mod) => {
    const values = draft.modules?.[mod.id];
    return values?.on
      ? (mod.options ?? [])
          .filter((opt) => opt.required && !values[opt.key])
          .map((opt) => ({
            step: 2,
            text: `${opt.missing ?? opt.title.toLowerCase()}, for the ${mod.name} module`,
          }))
      : [];
  });
}
const modOn = (draft, catalog) =>
  (catalog?.modules ?? []).filter((mod) => draft.modules?.[mod.id]?.on).map((mod) => mod.name);
function modSpecialRows(sheet, talk) {
  const byGroup = {},
    faceOf = (personId, personName) => ({
      name: personName,
      ...((S.life?.contacts ?? []).find((contact) => contact.id === personId) ?? {}),
    });
  for (const [modId, special] of Object.entries(sheet.special?.modules ?? {})) {
    const withIds = (talk.modWith ?? []).filter((id) => special.who?.some((person) => person.id === id)),
      startAttrs = `data-do="scene-start" data-kind="${escape(special.start?.kind ?? "milestone")}" data-id="${escape(special.start?.id ?? modId)}" data-character="${sheet.id}"${withIds.length ? ` data-with="${escape(withIds.join(","))}"` : ""}`,
      withNames = withIds.map((id) => special.who.find((person) => person.id === id).name.toUpperCase()),
      goLabel = withNames.length
        ? `WITH ${withNames.slice(0, -1).join(", ")}${withNames.length > 1 ? " AND " : ""}${withNames.at(-1)} \u25B8`
        : "JUST THE TWO OF YOU \u25B8",
      whoPicker = () => `<div class="mls-special-confirm"><b>Who else?</b>
            <div class="mls-intro-pick">${special.who
              .map((person) => {
                const picked = withIds.includes(person.id),
                  clash =
                    !picked &&
                    special.who.find((other) => withIds.includes(other.id) && person.not?.includes(other.id));
                return `<button class="${picked ? "on" : ""}" data-do="module-who" data-id="${escape(person.id)}" data-character="${sheet.id}" ${clash ? "disabled" : ""}>${newsFace(faceOf(person.id, person.name))}<b>${escape(person.name)}</b><small>${picked ? "\u2713 with you \xB7 " : ""}${escape(person.note)}${clash ? ` \xB7 not with ${escape(clash.name)}` : ""}</small></button>`;
              })
              .join("")}</div>
            <div class="row">${special.where?.length ? `<button class="main" data-do="module-who-next" data-character="${sheet.id}">${escape(goLabel)}</button>` : `<button class="main" ${startAttrs}>${escape(goLabel)}</button>`}<button data-do="special-cancel" data-character="${sheet.id}">CANCEL</button></div></div>`,
      wherePicker = () => `<div class="mls-special-confirm"><b>Where?</b>
            <div class="mls-intro-pick plain">${special.where
              .map((spot) => {
                const refusers = (spot.refuse ?? [])
                    .filter((person) => person.id === sheet.id || withIds.includes(person.id))
                    .map((person) => person.name),
                  note = [spot.note, refusers.length ? `not for ${refusers.join(" or ")}` : ""]
                    .filter(Boolean)
                    .join(" \xB7 ");
                return `<button ${startAttrs} data-how="${escape(spot.id)}" ${refusers.length ? "disabled" : ""}><b>${escape(spot.name)}</b>${note ? `<small>${escape(note)}</small>` : ""}</button>`;
              })
              .join("")}</div>
            <div class="row">${special.who?.length ? `<button data-do="module-who-back" data-character="${sheet.id}">\u25C2 WHO ELSE</button>` : ""}<button data-do="special-cancel" data-character="${sheet.id}">CANCEL</button></div></div>`,
      row =
        special.ok === false
          ? greyRow(escape(special.label), {
              why: special.why,
            })
          : special.where?.length || special.who?.length
            ? talk.pickModule === modId
              ? special.who?.length && talk.modStep !== "where"
                ? whoPicker()
                : wherePicker()
              : `<button class="mls-opt" data-do="special-module" data-id="${escape(modId)}" data-character="${sheet.id}"><span class="n">${escape(special.label)}</span><span class="hours">up to ${special.minutes}m</span><span class="d">${escape(special.desc ?? "")}</span></button>`
            : `<button class="mls-opt" ${startAttrs}><span class="n">${escape(special.label)}</span><span class="hours">up to ${special.minutes}m</span><span class="d">${escape(special.desc ?? "")}</span></button>`;
    (byGroup[special.group] ??= []).push(row);
  }
  return byGroup;
}
function modWho(talk, personId) {
  const current = talk.modWith ?? [];
  talk.modWith = current.includes(personId) ? current.filter((id) => id !== personId) : [...current, personId];
}
const modSheetToggles = (sheet) =>
  (sheet.modules ?? [])
    .filter((opt) => !opt.kind)
    .map((opt) => {
      const asking = sheet.modAsk === `${opt.module}.${opt.key}`;
      return `
        <button class="mls-tgbtn ${opt.on ? "on" : ""}" data-do="module-character" data-module="${escape(opt.module)}" data-id="${escape(opt.key)}" data-on="${opt.on ? "0" : "1"}" ${opt.ask ? 'data-ask="1"' : ""}>
          <i></i><span><b>${escape(opt.title)}</b><small>${escape(opt.why)}</small></span></button>
        ${
          asking && opt.ask
            ? `<div class="mls-spoil-warn"><b>${escape(opt.ask.title)}</b><small>${escape(opt.ask.why)}</small>
          <div class="row"><button class="main" data-do="module-character" data-module="${escape(opt.module)}" data-id="${escape(opt.key)}" data-on="1">${escape(opt.ask.yes)}</button><button data-do="module-ask-cancel">CANCEL</button></div></div>`
            : ""
        }`;
    })
    .join("");
const modSheetFacts = (sheet) =>
  (sheet.modules ?? [])
    .filter((opt) => opt.kind === "fact" || opt.kind === "chips")
    .map((opt) =>
      opt.kind === "fact"
        ? `<div class="arch"><span class="k">${escape(opt.title)}</span><span class="v ${opt.value ? "" : "q"}">${escape(opt.value || opt.unknown)}</span></div>`
        : `<div><div class="hint lbl">${escape(opt.title)}</div><div class="likes">${opt.items.length ? opt.items.map((item) => `<span class="like ${item.bad ? "no" : ""}">${escape(item.text)}</span>`).join("") : `<span class="like q">${escape(opt.unknown)}</span>`}</div></div>`,
    )
    .join("");
const modCastOpen = {};
function modCastOptions(life, person) {
  return Object.entries(life.modules ?? {})
    .filter(([, mod]) => mod.on && mod.people?.[person.id])
    .map(([modId, mod]) => {
      const cast = mod.people[person.id],
        openKey = `${modId}|${person.id}`,
        isOpen = !!modCastOpen[openKey],
        head = `<span class="mls-work-row"><button class="mls-modopt-open" data-do="module-cast-open" data-id="${escape(openKey)}">${escape(cast.title)} ${isOpen ? "\u25BE" : "\u25B8"}</button></span>`;
      if (!isOpen) {
        return head;
      }
      const castAttr = (key) => `data-mod-cast="${escape(`${modId}|${person.id}|${key}`)}"`,
        sections = cast.sections
          .map((section) =>
            section.kind === "picks"
              ? `<div class="mls-modopt-grid">${section.items.map((item) => `<label class="mls-modopt-f"><span class="lbl">${escape(item.title)}</span><select ${castAttr(item.key)}>${item.choices.map(([value, label]) => `<option value="${escape(value)}" ${value === item.value ? "selected" : ""}>${escape(label)}</option>`).join("")}</select></label>`).join("")}</div>`
              : `<div class="mls-modopt-sec"><span class="lbl">${escape(section.title)}</span><div class="mls-modopt-chips">${section.items.length ? section.items.map((item) => `<span class="mls-modopt-chip ${section.bad ? "bad" : ""}">${escape(item.text)}${item.remove ? `<button data-do="module-cast-remove" data-id="${escape(`${modId}|${person.id}|${item.key}`)}" title="Take it out">\u2715</button>` : item.choices ? `<select ${castAttr(item.key)}>${item.choices.map(([value, label]) => `<option value="${escape(value)}" ${value === item.value ? "selected" : ""}>${escape(label)}</option>`).join("")}</select>` : ""}</span>`).join("") : `<small class="mls-modopt-none">${escape(section.none ?? "")}</small>`}</div></div>`,
          )
          .join("");
      return `${head}<div class="mls-modopt-panel">${sections}</div>`;
    })
    .join("");
}
const modCastToggle = (key) => {
  modCastOpen[key] = !modCastOpen[key];
};
const NPC_TAG = '<span class="mls-npc">NPC</span>';
const modApps = (life) =>
  Object.values(life?.modules ?? {})
    .filter((mod) => mod?.on && mod.app)
    .map((mod) => mod.app);
function modAppView(life, appId, who = "all") {
  const app = modApps(life).find((candidate) => candidate.id === appId);
  if (!app) {
    return '<div class="mls-settings mls-gallery"><div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button></div></div>';
  }
  const cast = [];
  for (const row of app.rows) {
    for (const person of row.cast ?? []) {
      if (!cast.some((existing) => existing.id === person.id)) {
        cast.push(person);
      }
    }
  }
  const rows = app.rows.filter((row) => who === "all" || (row.cast ?? []).some((person) => person.id === who)),
    rowHtml = (row) => `
    <div class="mls-modrow"><span class="faces">${(row.cast ?? []).map((person) => newsFace(person)).join("")}</span>
      <div><b>${escape(row.title)}</b>${row.fresh ? '<span class="fresh">NEW</span>' : ""}<small>${escape(row.line)}</small></div>
      ${row.action ? `<button class="${row.fresh ? "" : "again"}" data-do="mod-go" data-route="${escape(row.action.route)}" data-body="${escape(JSON.stringify(row.action.body ?? {}))}">${escape(row.action.label)}</button>` : ""}</div>`;
  return `
    <div class="mls-settings mls-gallery mls-modapp">
      <div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>${escape(app.label)}</h1></div>
      ${
        cast.length
          ? `<div class="tabs"><button class="${who === "all" ? "on" : ""}" data-do="mod-app-who" data-id="all">EVERYONE</button>
        ${cast.map((person) => `<button class="${who === person.id ? "on" : ""}" data-do="mod-app-who" data-id="${escape(person.id)}">${escape(person.name.toUpperCase())}</button>`).join("")}</div>`
          : ""
      }
      <div class="mls-tab-body"><div class="box">
        <h3>${escape(app.title)} <small>${escape(app.sub ?? "")}</small></h3>
        ${rows.length ? rows.map(rowHtml).join("") : `<p class="hint">${escape(app.empty ?? "")}</p>`}
      </div></div>
    </div>`;
}
function modCutView(life, { map: onMap = false } = {}) {
  const cut = Object.values(life?.modules ?? {}).find((mod) => mod?.on && mod.cut)?.cut;
  if (!cut || (onMap && cut.here)) {
    return "";
  }
  const button = (action, cls, doName) =>
      `<button class="${cls}" data-do="${doName}" data-route="${escape(action.route)}" data-body="${escape(JSON.stringify(action.body ?? {}))}">${escape(action.label)}</button>`,
    actions = [
      [cut.watch, "main", "mod-go"],
      [cut.third, "alt", "mod-go"],
      [cut.later, "plain", "mod-later"],
    ].filter(([action]) => action),
    hasHints = actions.some(([action]) => action.hint);
  return `
    <div class="mls-cut-veil">
      <div class="mls-cut">
        <div class="kicker">${escape(cut.kicker)}</div>
        <h2>${escape(cut.title)}</h2>
        <div class="faces">${(cut.cast ?? []).map((person) => `<span class="f">${frameImg(person)}</span>`).join('<span class="amp">+</span>')}</div>
        <div class="where">${escape(cut.where)}</div>
        ${cut.note ? `<div class="note">${escape(cut.note)}</div>` : ""}
        ${hasHints ? `<div class="choices">${actions.map(([action, cls, doName]) => `<div class="choice">${button(action, cls, doName)}${action.hint ? `<small>${escape(action.hint)}</small>` : ""}</div>`).join("")}</div>` : `<div class="row">${actions.map(([action, cls, doName]) => button(action, cls, doName)).join("")}</div>`}
      </div>
    </div>`;
}
const modCall = (route, body = {}) =>
  act(async (signal) => {
    const res = await call(`/lives/${S.life.id}/mod/${route}`, {
      method: "POST",
      body: body,
      signal: signal,
    });
    S.life = res.life;
    reportEvents(res.events);
  });
const modScene = (route, body = {}) =>
  act(
    async (signal) => {
      const res = await call(`/lives/${S.life.id}/mod/${route}`, {
        method: "POST",
        body: body,
        signal: signal,
      });
      S.life = res.life;
      if (S.life?.scene) {
        S.sceneSeg = 0;
        S.sceneLog = false;
        S.view = "scene";
        S.talk = {};
        S.talkTo = null;
      }
      reportEvents(res.events);
    },
    {
      loading: "Going in\u2026",
      cancel: afterLifeCancel,
    },
  );

export {
  NPC_TAG,
  modAppView,
  modApps,
  modCall,
  modCastOptions,
  modCastToggle,
  modCutView,
  modDraftNeeds,
  modFold,
  modGroup,
  modMissing,
  modOn,
  modOnAnswer,
  modOnCard,
  modScene,
  modSection,
  modSheetFacts,
  modSheetToggles,
  modSpecialRows,
  modWho,
  sheetDates,
};
