// You view tabs, guide, phone shell, look queue
import { colourFor, escape, faceImg } from "./common.js";
import { modApps } from "./mods.js";

const SKILL_NAME = {
  fitness: "Fitness",
  charm: "Charm",
  knowledge: "Knowledge",
  cooking: "Cooking",
};
const SKILL_HOW = {
  fitness:
    "Work out at the Gym, or take a yoga class there. Running in the Park is free, but only gets you to level 3.",
  charm:
    "Spending time with people. A drink at the Bar, a movie, singing at the Karaoke and yoga help too. Walking in the Park or around the campus is free, but only up to level 3.",
  knowledge:
    "Study at the Library or at your desk, read books, or sit with your laptop at the Caf\xE9. Lectures at the University are free, but only get you to level 3.",
  cooking: "Cook at home: every dish you make teaches you something, even a burnt one. Reading a cookbook helps too.",
};
const money$ = (amount) => `$${Math.abs(Math.round(amount)).toLocaleString("en-US")}`;
const YOU_TABS = [
  ["skills", "SKILLS"],
  ["money", "MONEY"],
  ["work", "WORK"],
  ["people", "PEOPLE"],
];
const LEDGER_SHOWN = 5;
const info = (html, article = null) =>
  `<details class="mls-info"><summary title="What is this?">\u24D8</summary><p>${html}${article ? guideLink(article) : ""}</p></details>`;
function youView({ you: you, tab = "skills", ledgerAll = false }) {
  if (!you) {
    return '<div class="mls-you"><p class="hint">Loading\u2026</p></div>';
  }
  const money = you.money,
    owed = money.owedRent + money.owedHospital + money.loans,
    needBar = (label, value, max, stateText, low, tip) => `
    <div class="need"><span>${label}${tip ? info(tip, label.toLowerCase()) : ""}</span>
      <div class="bar ${low ? "low" : ""}"><i style="width:${Math.max(0, Math.min(100, Math.round((value / max) * 100)))}%"></i></div>
      <span class="state ${low ? "bad" : ""}">${escape(stateText)} \xB7 ${value}${label === "Energy" ? `/${max}` : ""}</span></div>`,
    renderTab =
      {
        skills: skillsTab,
        money: moneyTab,
        work: workTab,
        people: peopleTab,
      }[tab] ?? skillsTab;
  return `
    <div class="mls-you">
      <button class="mls-back flat" data-do="map">\u25C2 MAP</button>
      <div class="mls-you-grid">
        <aside class="mls-you-side">
          <div class="portrait">${you.avatar ? `<img src="${escape(you.avatar)}" alt="">` : "YOUR PERSONA"}</div>
          <div class="kicker">PROFILE</div>
          <h1>${escape(you.name.toUpperCase())}</h1>
          ${you.line ? `<div class="line">${escape(you.line)}</div>` : ""}
          <div class="facts">
            <span><b>DAY ${you.day}</b>${you.town ? ` in ${escape(you.town)}` : ""}</span>
            <span><b>NOW</b> ${escape(you.now.place)} \xB7 ${escape(you.now.time)}</span>
            <span><b>HOME</b> ${escape(money.home)}${money.door ? ` \xB7 ${escape(money.door)}` : ""}</span>
            ${money.birthday ? `<span><b>BIRTHDAY</b> ${escape(money.birthday)}</span>` : ""}
          </div>
          <div class="needs">
            ${needBar("Energy", you.needs.energy, you.needs.energyMax, you.needs.energyState, you.needs.energyLow, "<b>At 0 energy you collapse</b> and wake up in the hospital eight hours later ($150).")}
            ${needBar("Hunger", you.needs.hunger, 100, you.needs.hungerState, you.needs.hungerLow, "With hunger at 0, energy drains twice as fast.")}
          </div>
          <div class="money">
            <div><small>CASH</small><b>${money$(money.cash)}</b></div>
            ${owed ? `<div class="debt"><small>YOU OWE</small><b>${money$(owed)}</b></div>` : ""}
          </div>
        </aside>
        <section class="mls-you-main">
          <nav class="mls-you-tabs">${YOU_TABS.map(([tabId, tabLabel]) => `<button class="${tabId === tab ? "on" : ""}" data-do="you-tab" data-tab="${tabId}">${tabLabel}</button>`).join("")}</nav>
          <div class="mls-you-tab" data-tab="${escape(tab)}">${renderTab(you, {
            ledgerAll: ledgerAll,
          })}</div>
        </section>
      </div>
    </div>`;
}
function skillsTab(you) {
  const skillRow = (skill) => `
    <div class="skill">
      <div class="lv">${skill.level}<small>LEVEL</small></div>
      <div class="name"><span class="sk">${SKILL_NAME[skill.id]}${SKILL_HOW[skill.id] ? info(SKILL_HOW[skill.id], "skills") : ""}</span> <span>${skill.forNext ? `${skill.into} / ${skill.forNext} to level ${skill.level + 1}` : "as far as it goes"}</span></div>
      <div class="bar y"><i style="width:${Math.round(skill.progress * 100)}%"></i></div>
      <div class="hint">Every level: <b>${escape(skill.every)}</b>${skill.next ? ` \xB7 <b>Level ${skill.next.level}</b>: ${escape(skill.next.what)}` : ""}</div>
    </div>`;
  return `<h3>SKILLS</h3>${you.skills.map(skillRow).join("")}`;
}
function moneyTab(you, { ledgerAll: ledgerAll }) {
  const money = you.money,
    entries = ledgerAll ? money.ledger : money.ledger.slice(0, LEDGER_SHOWN);
  return `
    <h3>MONEY</h3>
    <div class="money">
      <div><small>CASH</small><b>${money$(money.cash)}</b></div>
      <div class="${money.owedRent + money.owedHospital + money.loans ? "debt" : ""}"><small>OWED</small><b>${money$(money.owedRent + money.owedHospital + money.loans)}</b></div>
      <div><small>RENT</small><b>${money$(money.rent)}</b></div>
    </div>
    <div class="kv">
      ${money.owedRent ? `<span class="k">Owed rent</span><span class="owed">${money$(money.owedRent)} to the landlord${info("Pay it in BILLS before rent day, or you're evicted.", "rent")}</span>` : ""}
      ${money.owedHospital ? `<span class="k">Hospital</span><span class="owed">${money$(money.owedHospital)}${info("Pay it in BILLS.", "bills")}</span>` : ""}
      ${money.loans ? `<span class="k">Loans</span><span>${money$(money.loans)} to people who helped you${info("Pay them back in BILLS, or in their SPECIAL ACTIONS.", "bills")}</span>` : ""}
      ${money.lodging?.kind === "home" ? `<span class="k">Rent due</span><span>Day ${money.rentDay} of each season \xB7 in ${money.rentIn} day${money.rentIn === 1 ? "" : "s"}</span>` : ""}
      <span class="k">Home</span><span>${escape(money.home)}${money.door ? ` \xB7 ${escape(money.door)}` : ""}</span>
      <span class="k">Living with</span><span>${escape(money.flatmate)}</span>
    </div>
    <h4>LAST MOVES</h4>
    ${
      money.ledger.length
        ? `<div class="ledger">${entries
            .map(
              (entry) => `
      <div><span class="when">${escape(entry.when)}</span><span>${escape(entry.label)}</span>
        <span class="${entry.amount >= 0 ? "in" : "out"}">${entry.amount >= 0 ? "+" : "\u2212"}${money$(entry.amount)}</span></div>`,
            )
            .join("")}</div>
      ${money.ledger.length > LEDGER_SHOWN ? `<button class="mls-drop mls-see-all" data-do="you-ledger">${ledgerAll ? "SHOW LESS" : `SEE ALL \xB7 ${money.ledger.length}`}</button>` : ""}`
        : '<div class="hint">No money has moved yet.</div>'
    }`;
}
function workTab(you) {
  const work = you.work;
  return work
    ? `
    <h3>WORK</h3>
    <div class="kv">
      <span class="k">Position</span><span><b>${escape(work.position)}</b> \xB7 ${money$(work.pay)} a shift \xB7 ${escape(work.hours)}</span>
      <span class="k">Performance</span><span><span class="bar y inline"><i style="width:${work.performance}%"></i></span> ${work.performance}</span>
      <span class="k">Warnings</span><span class="warns">${Array.from(
        {
          length: work.warningsMax,
        },
        (unused, index) => `<i class="${index < work.warnings ? "on" : ""}"></i>`,
      ).join("")}${info("Three warnings and you're out; each one fades after 30 days.", "job")}</span>
      <span class="k">Next review</span><span>${escape(work.review)}${work.next ? ` \xB7 ${escape(work.next.name)} asks for ${escape(work.next.needs.join(", "))}` : " \xB7 you are at the top"}</span>
    </div>
    <div class="ladder">${work.ladder.map((step) => `<span class="${step.on ? "on" : step.next ? "next" : ""}">${escape(step.name.toUpperCase())}</span>`).join("")}</div>`
    : '<h3>WORK</h3><div class="hint">You do not work at the office right now.</div>';
}
function peopleTab(you) {
  const personButton = (person) => `
    <button class="person" data-do="sheet" data-character="${person.id}" style="--c:${colourFor(person.id)}">
      <span class="av ${person.avatar ? "pic" : ""}">${person.avatar ? faceImg(person) : escape((person.name[0] ?? "?").toUpperCase())}</span>
      <span class="who"><b>${escape(person.name.toUpperCase())}</b><small>${escape(person.sub)}</small></span>
      ${person.event ? '<span class="chip">!</span>' : person.heart ? '<span class="chip r">\u2665</span>' : ""}
    </button>`;
  return `
    <h3>PEOPLE</h3>
    <div class="counts">
      <div><small>MET</small><b>${you.life.met} of ${you.life.total}</b></div>
      <div><small>SCENES</small><b>${you.life.scenes}</b></div>
      <div><small>STATUS</small><b>${escape(you.life.status)}</b></div>
    </div>
    ${
      you.life.closest.length
        ? `<h4>CLOSEST TO YOU</h4><div class="people">${you.life.closest.map(personButton).join("")}</div>
      <div class="hint">Everyone else is in <button class="mls-linkbtn" data-do="contacts">CONTACTS</button>.</div>`
        : '<div class="hint">You have not met anyone yet.</div>'
    }`;
}
const guideTerms = (html) => html.replace(/⟦([^⟧]+)⟧/g, '<b class="term">$1</b>');
function guideText(text, articlesById) {
  return guideTerms(
    escape(text).replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (match, articleId, linkText) => {
      const article = articlesById.get(articleId);
      return article
        ? `<button class="lnk" data-do="guide-open" data-article="${articleId}">${linkText ?? escape(article.title)}</button>`
        : (linkText ?? articleId);
    }),
  );
}
function guideFind(book, query) {
  const words = String(query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) {
    return null;
  }
  const plain = (text) =>
    text
      .replace(/\[\[[a-z0-9-]+\|([^\]]+)\]\]/g, "$1")
      .replace(/\[\[([a-z0-9-]+)\]\]/g, "$1")
      .replace(/[⟦⟧]/g, "");
  return book.articles
    .map((article) => {
      const title = article.title.toLowerCase(),
        haystack = `${title} ${article.words ?? ""} ${article.text.map(plain).join(" ")}`.toLowerCase();
      if (!words.every((word) => haystack.includes(word))) {
        return null;
      }
      const line =
        article.text.map(plain).find((paragraph) => words.some((word) => paragraph.toLowerCase().includes(word))) ??
        plain(article.text[0]);
      return {
        a: article,
        line: line,
        score: words.filter((word) => title.includes(word)).length,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score);
}
function guideMark(text, query) {
  const words = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  let html = escape(text);
  for (const word of words) {
    html = html.replace(
      new RegExp(`(${escape(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
      "<mark>$1</mark>",
    );
  }
  return html;
}
function guideList(book, { at = null, query = "" } = {}) {
  const hits = guideFind(book, query);
  return hits
    ? hits.length
      ? hits
          .map(
            ({ a: article, line: line }) =>
              `<button class="hit ${article.id === at ? "on" : ""}" data-do="guide-open" data-article="${article.id}"><b>${escape(article.title)}</b><small>${guideMark(line, query)}</small></button>`,
          )
          .join("")
      : `<p class="none">Nothing about \u201C${escape(query)}\u201D. Try another word.</p>`
    : book.categories
        .map((category) => {
          const articles = book.articles.filter((article) => article.cat === category.id);
          return articles.length
            ? `<div class="shelf"><h3>${escape(category.name.toUpperCase())}</h3>${articles.map((article) => `<button class="${article.id === at ? "on" : ""}" data-do="guide-open" data-article="${article.id}">${escape(article.title)}</button>`).join("")}</div>`
            : "";
        })
        .join("");
}
function guideView({ book: book, at = null, query = "", back = [], narrow = false }) {
  if (!book) {
    return '<div class="mls-settings mls-guide"><div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>GUIDE</h1></div><p class="hint">Opening\u2026</p></div>';
  }
  const articlesById = new Map(book.articles.map((article2) => [article2.id, article2])),
    article = articlesById.get(at) ?? (narrow ? null : book.articles[0]),
    category = article ? book.categories.find((category2) => category2.id === article.cat) : null,
    page = article
      ? `
    <article class="page">
      <div class="crumbs">${back.length ? `<button class="lnk" data-do="guide-back">\u25C2 ${escape(articlesById.get(back.at(-1))?.title ?? "Back")}</button>` : narrow ? '<button class="lnk" data-do="guide-index">\u25C2 GUIDE</button>' : ""}<span>${escape(category?.name ?? "")}</span></div>
      <h2>${escape(article.title)}</h2>
      ${article.text.map((paragraph) => `<p>${guideText(paragraph, articlesById)}</p>`).join("")}
      ${
        (article.see ?? []).filter((articleId) => articlesById.has(articleId)).length
          ? `<div class="see"><b>SEE ALSO</b>${article.see
              .filter((articleId) => articlesById.has(articleId))
              .map(
                (articleId) =>
                  `<button data-do="guide-open" data-article="${articleId}">${escape(articlesById.get(articleId).title)}</button>`,
              )
              .join("")}</div>`
          : ""
      }
    </article>`
      : "",
    index = `
    <aside class="index">
      <label class="find"><span>\u2315</span><input type="search" data-do="guide-find" placeholder="Search the guide" value="${escape(query)}"></label>
      <div class="list" id="mls-guide-list">${guideList(book, {
        at: article?.id,
        query: query,
      })}</div>
    </aside>`;
  return `
    <div class="mls-settings mls-guide ${narrow ? (article ? "reading" : "browsing") : ""}">
      <div class="top"><button class="mls-back flat" data-do="map">\u25C2 MAP</button><h1>GUIDE</h1></div>
      <div class="mls-guide-body">${narrow ? (article ? page : index) : index + page}</div>
    </div>`;
}
const guideLink = (article) =>
  `<button class="lnk mls-guide-more" data-do="guide" data-article="${article}">More in the Guide \u25B8</button>`;
const lookTime = (time) => (time === "night" ? "NIGHT" : "DAY");
function phoneView(life) {
  const failedPaints = life.paint?.failed ?? 0,
    townName = life.townName ? escape(life.townName) : "",
    appButton = (action, icon, label, colour, badge = 0) => `
    <button class="app" data-do="${action}"><i style="background:${colour}">${icon}${badge ? `<em class="badge">${badge}</em>` : ""}</i><span>${label}</span></button>`,
    laterApp = (icon, label, colour) =>
      `<div class="app later"><i style="background:${colour}">${icon}</i><span>${label}</span></div>`;
  return `
    <div class="mls-phone-veil" data-do="phone-close-outside">
      <div class="mls-phone">
        <div class="bar"><span>${escape(life.hud.time)}</span><span>${townName}</span><span class="battery"><i></i></span></div>
        <div class="wall">
          ${appButton("you", "\u{1F464}", "PROFILE", "#c2185b")}
          ${appButton("contacts", "\u260E", "CONTACTS", "#1976d2")}
          ${appButton("settings", "\u2699", "SETTINGS", "#555", failedPaints ? "!" : 0)}
          ${appButton("backpack", "\u{1F392}", "BACKPACK", "#2e7d32")}
          ${appButton("shop", "\u{1F6CD}", "SHOP", "#f57c00")}
          ${appButton("calendar", "\u{1F4C5}", "CALENDAR", "#388e3c")}
          ${appButton("jobs", "\u{1F4BC}", "JOBS", "#455a64", life.career?.notice || life.career?.duty?.late ? "!" : 0)}
          ${appButton("homes", "\u{1F3E0}", "HOMES", "#6d4c41", life.hud?.lodging?.kind === "street" ? "!" : 0)}
          ${appButton("bills", "\u{1F9FE}", "BILLS", "#b71c1c", life.bills?.list?.length ?? 0)}
          ${life.wedding ? appButton("wedding", "\u{1F48D}", "WEDDING", "#b0356b", life.wedding.pickDay ? "!" : life.wedding.missing || 0) : ""}
          ${appButton("news", "\u{1F4F0}", "NEWS", "#00838f", life.news?.unseen ?? 0)}
          ${appButton("guide", "\u{1F4D6}", "GUIDE", "#37474f")}
          ${life.keyImages?.rule || life.keyImages?.count ? appButton("gallery", "\u{1F5BC}", "GALLERY", "#6a1b9a") : ""}
          ${modApps(life)
            .map(
              (app) =>
                `<button class="app" data-do="mod-app" data-id="${escape(app.id)}"><i style="background:${escape(app.colour)}">${escape(app.icon)}${app.badge ? `<em class="badge">${app.badge}</em>` : ""}</i><span>${escape(app.label)}</span></button>`,
            )
            .join("")}
        </div>
        <button class="close" data-do="phone-close">PUT IT AWAY</button>
      </div>
    </div>`;
}
function lookShot(tile, { small = false } = {}) {
  const chip =
      tile.status === "painting"
        ? '<span class="chip">PAINTING\u2026</span>'
        : tile.status === "queued"
          ? '<span class="chip q">IN QUEUE</span>'
          : tile.status === "failed"
            ? `<span class="chip bad" title="${escape(tile.error)}">FAILED</span>`
            : tile.status === "missing"
              ? '<span class="chip q">NOT PAINTED</span>'
              : tile.yours
                ? '<span class="chip yours">YOURS</span>'
                : tile.versions > 1
                  ? '<span class="chip lib">LIBRARY</span>'
                  : '<span class="chip new">READY</span>',
    versions =
      !small && tile.yours && tile.versions
        ? `<span class="vers"><button data-do="look-pick" data-key="${escape(tile.key)}" data-version="${tile.versions}" title="Back to the painted ones">\u25B8</button></span>`
        : !small && tile.versions > 1
          ? `<span class="vers">
      <button data-do="look-pick" data-key="${escape(tile.key)}" data-version="${tile.version - 1}" ${tile.version <= 1 ? "disabled" : ""}>\u25C2</button>
      <span class="chip">v${tile.version}/${tile.versions}</span>
      <button data-do="look-pick" data-key="${escape(tile.key)}" data-version="${tile.version + 1}" ${tile.version >= tile.versions ? "disabled" : ""}>\u25B8</button></span>`
          : "",
    busy = tile.status === "queued" || tile.status === "painting",
    actions =
      small || busy
        ? ""
        : `<button class="redo" data-do="look-redo" data-key="${escape(tile.key)}">${tile.status === "failed" ? "RETRY" : tile.status === "missing" ? "PAINT" : "REDO"}</button>
    <label class="upload" title="Your own picture">UPLOAD<input type="file" accept="image/png,image/jpeg,image/webp" data-upload="${escape(tile.key)}" hidden></label>`;
  return `<div class="shot ${tile.status}" ${small ? "" : `data-drop-key="${escape(tile.key)}"`}>
      <div class="pic" ${tile.url ? `style="background-image:url('${escape(tile.url)}')"` : ""}></div>
      <span class="when">${lookTime(tile.time)}</span>${actions}
      ${tile.status === "failed" && !small ? `<div class="why">${escape(tile.error || "It did not come out.")}</div>` : ""}
      <div class="state">${chip}${versions}</div></div>`;
}
function lookQueue(look, { canRedo = true } = {}) {
  const queue = look.queue,
    missingCount = look.tiles.filter((tile) => tile.status === "missing" || tile.status === "failed").length,
    painting = look.tiles.find((tile) => tile.key === queue.painting),
    headline =
      queue.paused && queue.pending
        ? `Paused \xB7 ${queue.pending} waiting`
        : painting
          ? `Painting \xB7 ${escape(painting.name)}, ${painting.time}`
          : queue.pending
            ? `${queue.pending} waiting their turn`
            : "Nothing to paint";
  return `
    <div class="mls-queue">
      ${queue.pending && !queue.paused ? '<span class="spin"></span>' : '<span class="dot"></span>'}
      <div><b>${headline}</b><small>${queue.done} of ${queue.total} painted${queue.failed ? ` \xB7 ${queue.failed} failed` : ""}</small>
        <div class="qbar"><i style="width:${Math.round((queue.done / Math.max(1, queue.total)) * 100)}%"></i></div></div>
      <div class="acts">
        ${queue.pending ? `<button class="mls-btn" data-do="look-pause" data-on="${queue.paused ? "0" : "1"}">${queue.paused ? "RESUME" : "PAUSE"}</button>` : ""}
        ${canRedo && missingCount ? `<button class="mls-btn" data-do="look-paint-missing">PAINT MISSING \xB7 ${missingCount}</button>` : ""}
        ${canRedo ? '<button class="mls-btn red" data-do="look-redo-all">REDO ALL</button>' : ""}
      </div>
    </div>`;
}
function motionTab({ motion = "full", systemLess = false } = {}) {
  return `
    <div class="mls-tab-body">
      <div class="box">
        <h3>HOW MUCH MOVES <small>for this browser \xB7 every life</small></h3>
        <div class="mls-motion">
          ${[
            [
              "full",
              "FULL",
              "Wipes, screens that open out of what you tapped, people who step aside, lines that write themselves.",
            ],
            ["short", "SHORT", "Only quick fades. Lines still write themselves."],
            ["off", "OFF", "Nothing moves: screens change at once and lines appear whole."],
          ]
            .map(
              ([id, label, text]) =>
                `<button class="mls-motion-opt ${motion === id ? "on" : ""}" data-do="motion" data-id="${id}"><i></i><b>${label}</b><span>${text}</span></button>`,
            )
            .join("")}
        </div>
        <p class="hint">A tap during any transition ends it at once.${systemLess && motion === "full" ? " <b>Your system asks for less motion, so FULL plays as SHORT.</b>" : ""}</p>
      </div>
    </div>`;
}

export { SKILL_NAME, guideList, guideView, lookQueue, lookShot, motionTab, phoneView, youView };
