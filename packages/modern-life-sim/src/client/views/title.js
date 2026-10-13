// Title screen, save slots, changelog, welcome and first-day cards
import { bondChips, escape, playtime, whereLeft } from "./common.js";

function lifeSlot(life, picked = null, index = 0) {
  const action = picked ? "pick-life" : "open",
    isPicked = picked?.has(life.id),
    picAttr = life.picture ? ` has-pic" style="background-image:url('${escape(life.picture)}')` : "",
    bonds = bondChips(life, 3);
  return `<div class="mls-slot ${isPicked ? "picked" : ""}" style="--i:${index}" data-do="${action}" data-id="${escape(life.id)}">
    <div class="img${picAttr}"><span class="where">${whereLeft(life)}</span></div>
    <div class="info">
      <div class="mls-name"><h2>${escape(life.name)}</h2>${picked ? `<span class="mls-tick ${isPicked ? "on" : ""}">${isPicked ? "\u2713" : ""}</span>` : `<button class="menu" data-do="menu" data-id="${escape(life.id)}" title="Rename, duplicate or delete">\u22EF</button>`}</div>
      <div class="mls-stats">
        <span><b>YOU</b>${escape(life.persona || "\u2014")}</span><span><b>DAY</b>${escape(life.date)}</span>
        <span><b>JOB</b>${escape(life.job)}</span><span><b>CASH</b>$${life.cash}</span>
      </div>
      ${bonds ? `<div class="mls-bonds">${bonds}</div>` : ""}
      <div class="mls-when">Played ${playtime(life.playedMs)}${life.duplicatedFrom ? ` \xB7 duplicated from \u201C${escape(life.duplicatedFrom)}\u201D` : ""}</div>
    </div>
  </div>`;
}
function oldSaveView(oldSave) {
  return `
    <div class="mls-ask-veil"><div class="mls-oldsave">
      <b class="tag">ALPHA</b>
      <p>THIS SAVE IS NO LONGER COMPATIBLE WITH THE CURRENT VERSION. CREATE A NEW ONE OR CONTINUE AT YOUR OWN RISK.</p>
      <small>Last played on ${escape(oldSave.played ?? "an older version")} \xB7 now ${escape(oldSave.current)}</small>
      <div class="row">
        <button class="main" data-do="new">NEW LIFE</button>
        <button data-do="old-save-go" data-id="${escape(oldSave.id)}">CONTINUE ANYWAY</button>
        <button data-do="old-save-back">BACK</button>
      </div>
    </div></div>`;
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayOf = (date) => {
  const [, month, day] = String(date ?? "")
    .split("-")
    .map(Number);
  return month ? `${MONTHS[month - 1]} ${day}` : "";
};
const devComment = (text) => (text ? `<div class="dev"><b>DEV COMMENT</b>${escape(text)}</div>` : "");
const changelogList = (items = []) =>
  `<ul>${items.map((item) => (typeof item == "string" ? `<li>${escape(item)}</li>` : item.items?.length ? `<li><b>${escape(item.text)}</b>${devComment(item.dev)}${changelogList(item.items)}</li>` : `<li>${escape(item.text)}${devComment(item.dev)}</li>`)).join("")}</ul>`;
function changelogView(entries, seenVersion = "") {
  const seenIndex = entries.findIndex((entry) => entry.version === seenVersion),
    freshCount = seenIndex === -1 ? (seenVersion ? entries.length : 1) : seenIndex;
  return `<div class="mls-ask-veil" data-do="changelog-close"><div class="mls-changelog" data-stop>
    <div class="head"><b>WHAT'S NEW</b><button class="x" data-do="changelog-close" title="Close">\u2715</button></div>
    <div class="list">${entries
      .map(
        (entry, entryIndex) => `
      <section class="${entryIndex < freshCount ? "fresh" : ""}">
        <h3>v${escape(entry.version)}${entryIndex < freshCount ? '<i class="new">NEW</i>' : ""}<small>${escape(dayOf(entry.date))}</small></h3>
        ${changelogList(entry.lines)}
        ${(entry.modules ?? []).length ? `<div class="mods"><b class="k">MODULES</b>${entry.modules.map((mod) => `<details class="mod"><summary>${escape(mod.name)}</summary>${changelogList(mod.lines)}</details>`).join("")}</div>` : ""}
        ${(entry.fixes ?? []).length ? `<div class="mods fixes"><b class="k">FIXES</b><details class="mod"><summary>What got fixed</summary>${changelogList(entry.fixes)}</details></div>` : ""}
      </section>`,
      )
      .join("")}</div>
  </div></div>`;
}
function titleView({
  lives: lives,
  health: health,
  error: error,
  picking = null,
  oldSave = null,
  said = "",
  tab = "",
  changelog = null,
  seen = "",
  latest = "",
  opening = false,
  narrow = false,
  welcome = null,
  ticked = false,
}) {
  const [lastLife] = lives,
    livesOut = (tab === "load" || !!picking) && lives.length > 0,
    layout = narrow ? "under" : "cards",
    popHtml = livesOut
      ? loadPop({
          lives: lives,
          picking: picking,
          how: layout,
          opening: opening,
        })
      : "",
    picAttr = lastLife?.picture ? ` has-pic" style="background-image:url('${escape(lastLife.picture)}')` : "",
    hasNew = !!latest && seen !== latest,
    bonds = lastLife ? bondChips(lastLife, 4) : "";
  return `
    <div class="mls-title mls-menu-screen ${livesOut ? `lives-out by-${layout}` : ""}">
      <div class="mls-menu-bg${picAttr}"></div>
      <div class="slash"></div><div class="dots"></div>
      <div class="mls-menu-col">
        ${logoView(health)}
        ${error ? `<div class="err">${escape(error)}</div>` : ""}
        ${said ? `<p class="mls-title-said">${escape(said)}</p>` : ""}
        <nav class="mls-mainmenu">
          ${lastLife ? `<button class="mls-mm main" data-do="open" data-id="${escape(lastLife.id)}"><b>CONTINUE</b><small>${escape(lastLife.name)} \xB7 ${escape(lastLife.date)} \xB7 ${whereLeft(lastLife)}</small></button>` : ""}
          <button class="mls-mm ${lastLife ? "" : "main"}" data-do="new"><b>NEW LIFE</b><small>Start a new game</small></button>
          ${lives.length ? `<div class="mls-mm-at"><button class="mls-mm ${livesOut ? "on" : ""}" data-do="${livesOut ? "load-close" : "load-open"}"><b>LOAD LIFE</b><small>Continue a saved game</small></button>${layout === "under" ? popHtml : ""}</div>` : ""}
          ${latest ? `<button class="mls-mm" data-do="changelog-open"><b>WHAT'S NEW</b>${hasNew ? '<i class="new">NEW</i>' : ""}<small>What changed in v${escape(latest)}</small></button>` : ""}
        </nav>
      </div>
      ${livesOut && layout !== "under" ? popHtml : ""}
      ${
        lastLife && !(livesOut && layout !== "under")
          ? `<div class="mls-menu-card">
        <span class="k">LAST PLAYED</span>
        <h2>${escape(lastLife.name)}</h2>
        <div class="mls-stats"><span><b>YOU</b>${escape(lastLife.persona || "\u2014")}</span><span><b>JOB</b>${escape(lastLife.job)}</span><span><b>CASH</b>$${lastLife.cash}</span></div>
        ${bonds ? `<div class="mls-bonds">${bonds}</div>` : ""}
        <div class="mls-when">Played ${playtime(lastLife.playedMs)}</div>
      </div>`
          : ""
      }
      ${changelog ? changelogView(changelog, seen) : ""}
      ${oldSave ? oldSaveView(oldSave) : ""}
      ${welcome ? welcomeView(welcome, ticked) : ""}
    </div>`;
}
const logoView = (health) => `
  <div class="mls-logo"><span class="l1">MODERN</span><span class="l2">LIFE SIM${health?.version ? `<em class="ver">v${escape(health.version)}</em>` : ""}</span></div>
  <div class="mls-alpha-tags"><span>Alpha version.</span><span>Not responsible if your PC blows up (jk?)</span><span>May or may not work, deal with it.</span></div>`;
function firstDayCard(firstDay) {
  const money = (amount) => `$${Math.round(amount ?? 0).toLocaleString("en-US")}`,
    listJoin = (items) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`),
    daysText = (days) => `${days} ${days === 1 ? "day" : "days"}`,
    homeText = `${firstDay.home === "house" ? "Your new house" : "Your new apartment"}${firstDay.district ? ` in ${escape(firstDay.district)}` : ""}`,
    homeLine = firstDay.sharing.length
      ? `${homeText} is all set, and ${escape(listJoin(firstDay.sharing))} ${firstDay.sharing.length === 1 ? "is" : "are"} already there.`
      : firstDay.home === "house"
        ? `${homeText} is all set, and it's all yours.`
        : `${homeText} is all set. It's small, but it's yours.`,
    cashText = `You've got <b>${money(firstDay.cash)}</b> saved up`,
    moneyLine =
      firstDay.job && firstDay.rent
        ? `${cashText}, and rent (${money(firstDay.rent)}) is due in ${daysText(firstDay.rentIn)}, so finding work comes first: check <b>JOBS</b> on your phone.`
        : firstDay.job
          ? `${cashText}, but no job yet: check <b>JOBS</b> on your phone when you're ready.`
          : firstDay.rent
            ? `${cashText}, and rent (${money(firstDay.rent)}) is due in ${daysText(firstDay.rentIn)}.`
            : `${cashText}.`,
    knownLine = firstDay.known.length
      ? `You already know ${escape(firstDay.knownMore ? `${firstDay.known.join(", ")} and a few other faces around town` : listJoin(firstDay.known))}. Everyone else is still a stranger, so go say hi.`
      : "You don't know a soul here yet. Go out and meet people.",
    paragraphs = [
      homeLine,
      moneyLine,
      knownLine,
      "The rest of the town is yours to explore. Take it at your own pace, and make this life your own.",
    ];
  return `<div class="mls-ask-veil"><div class="mls-firstday">
    <div class="head"><span class="k">YOUR FIRST DAY</span><b>${firstDay.town ? `WELCOME TO ${escape(firstDay.town.toUpperCase())}` : "A NEW START"}</b></div>
    <div class="body">${paragraphs.map((para) => `<p>${para}</p>`).join("")}</div>
    <div class="foot">
      ${firstDay.job ? '<button class="mls-drop" data-do="firstday-jobs">OPEN JOBS</button>' : ""}
      <button class="mls-drop" data-do="firstday-guide">OPEN THE GUIDE</button>
      <button class="go" data-do="firstday-go">LET'S GO</button>
    </div>
  </div></div>`;
}
const linkIn = (text, url) =>
  escape(text).replace(/\{([^}]+)\}/, (_match, label) =>
    url ? `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label}</a>` : label,
  );
function welcomeView(welcome, ticked = false) {
  return `<div class="mls-ask-veil"><div class="mls-welcome">
    <div class="head"><span class="k">WELCOME TO</span><b>MODERN LIFE SIM</b></div>
    <div class="body">
      ${welcome.lines.map((line) => `<p>${escape(line)}</p>`).join("")}
      ${welcome.alpha ? `<div class="alpha"><b class="tag">ALPHA</b><p>${escape(welcome.alpha)}</p></div>` : ""}
      ${(welcome.dev ?? []).length ? `<div class="dev"><b>DEV COMMENT</b>${welcome.dev.map((line) => `<p>${escape(line)}</p>`).join("")}</div>` : ""}
      ${welcome.report ? `<p class="report">${linkIn(welcome.report, welcome.reportUrl)}</p>` : ""}
    </div>
    <div class="foot">
      <button class="mls-welcome-tick ${ticked ? "on" : ""}" data-do="welcome-tick"><i>${ticked ? "\u2713" : ""}</i><span>${escape(welcome.check)}</span></button>
      <button class="go" data-do="welcome-go" ${ticked ? "" : "disabled"}>CONTINUE</button>
    </div>
  </div></div>`;
}
function loadPop({ lives: lives, picking = null, how = "cards", opening = false }) {
  const pickedCount = picking?.size ?? 0,
    tools = picking
      ? `<span>${pickedCount ? `${pickedCount} picked` : "Tap the lives to delete"}</span>
       <button class="mls-drop" data-do="pick-all">${pickedCount === lives.length ? "NONE" : "ALL"}</button>
       <button class="mls-drop danger" data-do="delete-picked" ${pickedCount ? "" : "disabled"}>DELETE ${pickedCount || ""}</button>
       <button class="mls-drop" data-do="pick-cancel">CANCEL</button>`
      : '<button class="mls-drop" data-do="pick-start">SELECT TO DELETE</button>';
  return `<div class="mls-loadpop ${how} ${opening ? "enter" : ""}">
    <div class="in">
      <div class="mls-lifetools">${tools}</div>
      <div class="mls-slots">${lives.map((life, index) => lifeSlot(life, picking, index)).join("")}</div>
    </div>
  </div>`;
}

export { firstDayCard, titleView };
