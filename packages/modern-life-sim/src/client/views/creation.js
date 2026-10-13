// Life creation wizard steps, presets, cast picker and review
import { SEX_PICK, escape, intoChips, likesSex } from "./common.js";
import { weekView } from "./week.js";
import { FAMILY_NAMES, PAIR_NAMES, newsFace, pairName } from "./people.js";
import { frameChoice, picturesBox, portraitChoice, samplingFields, sizeChoice } from "./settings.js";
import { modMissing, modOn, modSection } from "./mods.js";
import { S } from "../state.js";

function traitWords(traits, catalog) {
  return !traits || !catalog
    ? []
    : [
        ...catalog.dials.flatMap((dial) => {
          const value = traits.dials?.[dial.key] ?? catalog.max / 2;
          return value <= catalog.at.low ? [dial.low] : value >= catalog.at.high ? [dial.high] : [];
        }),
        ...catalog.flags.filter((flag) => traits.flags?.includes(flag.key)).map((flag) => flag.name),
      ];
}
const traitChips = (words) =>
  words.length
    ? words.map((word) => `<span class="chip">${escape(word)}</span>`).join("")
    : '<span class="chip q">Nothing that stands out</span>';
const LIKE_STEP_NAMES = {
  "++": "Loves it",
  "+": "Likes it",
  0: "Doesn't care",
  "-": "Dislikes it",
  "--": "Can't stand it",
};
function traitsEditor(traits, catalog, who, thing = "") {
  const current = traits ?? {},
    thingHtml = catalog.things?.length
      ? `<div class="mls-trait-sub">THEIR THING AT HOME</div>
    <div class="mls-trait-likes"><label>When you're at their place<select data-trait="${who}|thing|thing">${catalog.things.map((option) => `<option value="${escape(option.key)}" ${option.key === thing ? "selected" : ""}>${escape(option.name)}</option>`).join("")}</select></label></div>`
      : "",
    dialRow = (dial) => {
      const value = current.dials?.[dial.key] ?? catalog.max / 2;
      return `<div class="mls-dial">
      <small class="${value <= catalog.at.low ? "on" : ""}">${escape(dial.low)}</small>
      <input type="range" min="0" max="${catalog.max}" step="1" value="${value}" data-trait="${who}|dial|${dial.key}" aria-label="${escape(dial.name)}">
      <small class="${value >= catalog.at.high ? "on" : ""}">${escape(dial.high)}</small>
      <span class="n">${value}</span>
    </div>`;
    },
    flagButton = (flag) =>
      `<button class="mls-trait-flag ${current.flags?.includes(flag.key) ? "on" : ""}" data-do="trait-flag" data-trait="${who}|flag|${flag.key}">${escape(flag.name)}</button>`,
    likeRow = (like) =>
      `<label>${escape(like.name)}<select data-trait="${who}|like|${like.key}">${[...catalog.likeSteps]
        .reverse()
        .map(
          (step) =>
            `<option value="${step}" ${(current.likes?.[like.key] ?? "0") === step ? "selected" : ""}>${LIKE_STEP_NAMES[step]}</option>`,
        )
        .join("")}</select></label>`;
  return `<div class="mls-traits-edit">
    <div class="mls-dials">${catalog.dials.map(dialRow).join("")}</div>
    <div class="mls-trait-flags"><span class="mls-trait-sub">THEY ARE</span>${catalog.flags.map(flagButton).join("")}</div>
    <div class="mls-trait-sub">WHAT THEY LIKE YOU TO DO</div>
    <div class="mls-trait-likes">${catalog.likes.map(likeRow).join("")}</div>
    ${thingHtml}
    ${
      current.tone
        ? `<div class="mls-trait-sub">HOW THEY COME ACROSS</div><p class="mls-tone">${escape(current.tone)}</p>
      <small class="mls-tone-note">Written from their card. It is written again if you change anything above.</small>`
        : ""
    }
  </div>`;
}
const HOMES = [
  {
    id: "studio",
    label: "Apartment \xB7 rent $650 \xB7 in the building",
    rooms: 1,
  },
  {
    id: "house",
    label: "House \xB7 rent $1,100 \xB7 on the street",
    rooms: 2,
  },
  {
    id: "luxury",
    label: "Luxury apartment \xB7 rent $2,400 \xB7 in Skyline Tower",
    rooms: 2,
  },
  {
    id: "mansion",
    label: "Mansion \xB7 rent $3,800 \xB7 on the hill",
    rooms: 4,
  },
];
const homeOfDraft = (draft) => (draft.home === "shared" ? "studio" : draft.home);
const roomsOfDraft = (draft) => HOMES.find((home) => home.id === homeOfDraft(draft))?.rooms ?? 1;
const LIVES_IN = [
  {
    id: "apartments",
    label: "A flat in the building",
  },
  {
    id: "houses",
    label: "A house on the street",
  },
  {
    id: "tower",
    label: "A luxury flat in Skyline Tower",
  },
  {
    id: "mansions",
    label: "A mansion on the hill",
  },
];
const castCap = (setup) => setup?.maxCast ?? 30;
const SAVINGS = [
  {
    id: "tight",
    label: "Tight \xB7 $400",
  },
  {
    id: "normal",
    label: "Normal \xB7 $1,200",
  },
  {
    id: "comfortable",
    label: "Comfortable \xB7 $3,000",
  },
];
const SEASON_OUTFITS_RULE = "Outside work, people wear clothes for the season instead of their card's picture.";
const NPCS_RULE = "People who aren't in your cast, like a club's staff and its regulars. Off: only your cast.";
const RULES = [
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
  ["clothes", "Clothes", "What you wear changes with the clothes you buy, in every scene and in your picture."],
  ["keyImages", "Key images", "Big moments with someone get their own picture, kept in the GALLERY."],
  ["workOutfits", "Work outfits", "People are shown in their work clothes while they work."],
  ["seasonOutfits", "Season outfits", SEASON_OUTFITS_RULE],
  ["npcs", "NPCs", NPCS_RULE],
];
const START_SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const SKILL_POINTS = 5;
const SKILL_CAP = 3;
function emptyDraft() {
  return {
    name: "A new life",
    personaId: "",
    home: "studio",
    savings: "normal",
    season: "Autumn",
    skills: {
      fitness: 0,
      charm: 0,
      knowledge: 0,
      cooking: 0,
    },
    cast: {},
    housemates: [],
    off: {},
    rules: {
      hunger: true,
      jealousy: true,
      drifting: true,
      multipleRelationships: false,
      castCouples: false,
      partnersStray: false,
      clothes: false,
      keyImages: false,
      workOutfits: false,
      seasonOutfits: false,
      npcs: false,
    },
    modules: {},
    pairs: {},
    pairEdit: null,
    show: {
      showArchetypes: "hidden",
      showSchedules: "found",
    },
    peek: {
      archetypes: {},
      weeks: {},
    },
    settings: {
      connection: "",
      effort: "low",
      language: "English",
      sampling: {},
    },
    languageOther: "",
    townName: "",
    renamed: {},
    districtNames: {},
    birthday: rolledDay(String(Math.random())),
    gender: "",
    scenario: "",
    loreBookId: "",
    step: 1,
    reached: 1,
    frame: "framed",
  };
}
function lookSection(setup, draft) {
  const look = draft.look ?? {
      connectionId: "",
      styleProfileId: "",
      tags: "",
    },
    connections = setup.imageConnections ?? [],
    libraryHave = draft.libraryHave ?? {
      have: 0,
      total: 0,
    };
  return `
        <section id="mls-look">
          <h2>CONNECTION AND STYLE <span>optional \xB7 without one, the game has no pictures</span></h2>
          <div class="card">
            ${
              connections.length
                ? `
            <div class="row">
              <label class="field">Image connection
                <select data-do="draft-look-connection">
                  <option value="">None \xB7 no pictures</option>
                  ${connections.map((conn) => `<option value="${escape(conn.id)}" ${conn.id === look.connectionId ? "selected" : ""}>${escape(conn.name)}${conn.model ? ` \xB7 ${escape(conn.model)}` : ""}</option>`).join("")}
                </select></label>
              <label class="field">Style profile
                <select data-do="draft-look-profile">
                  <option value="">Engine default</option>
                  ${(setup.styleProfiles ?? []).map((profile) => `<option value="${escape(profile.id)}" ${profile.id === look.styleProfileId ? "selected" : ""}>${escape(profile.name)} \xB7 ${escape(profile.promptMode)}</option>`).join("")}
                </select></label>
              <label class="field">Town tags (in English)
                <input type="text" data-do="draft-look-tags" maxlength="300" value="${escape(look.tags)}" placeholder="small coastal town, warm light"></label>
            </div>
            <p class="muted">Already painted in your other lives: <b id="mls-look-have">${libraryHave.have} / ${libraryHave.total}</b> backgrounds. This life uses them for free.</p>`
                : '<p class="muted">There are no image connections in this Marinara. Add one (Connections \xB7 Image generation) and pick it later in SETTINGS.</p>'
            }
          </div>
        </section>`;
}
const draftPictureCounts = (draft) => {
  const libraryHave = draft.libraryHave ?? {
    have: 0,
    total: 0,
  };
  return {
    backgrounds: {
      asks: libraryHave.total,
      painted: libraryHave.have,
      left: Math.max(0, libraryHave.total - libraryHave.have),
    },
  };
};
const placeName = (draft, place) => String(draft?.renamed?.[place.id] ?? "").trim() || place.name;
const actionBar = (todo, buttons) => `
  <footer class="mls-actions">
    ${todo ? `<p class="todo">${todo}</p>` : ""}
    <div class="btns">${buttons}</div>
  </footer>`;
const spent = (draft) => Object.values(draft.skills).reduce((sum, points) => sum + points, 0);
const seesArchetypes = (draft, id) => draft.show.showArchetypes !== "hidden" || !!draft.peek?.archetypes?.[id];
const seesWeek = (draft, id) => draft.show.showSchedules !== "hidden" || !!draft.peek?.weeks?.[id];
function personalityRow(setup, draft, card, pick) {
  if (!seesArchetypes(draft, card.id)) {
    return `<p class="why hidden-note">Personality: <b>hidden</b>, as you chose.
      <button class="mls-peek" data-do="peek" data-what="archetypes" data-id="${card.id}">SHOW (SPOILER)</button></p>`;
  }
  const traitCatalog = setup.traits,
    hiddenInLife = draft.show.showArchetypes === "hidden";
  return `<div class="mls-tastes mls-traits-row"><span class="k">PERSONALITY</span>
      ${pick.traits ? traitChips(traitWords(pick.traits, traitCatalog)) : '<span class="chip q">Read their card, or set it yourself</span>'}
      <button class="mls-drop" data-do="traits-edit" data-id="${card.id}">${pick.traitsEdit ? "DONE" : "EDIT"}</button></div>
    ${pick.traitsEdit ? traitsEditor(pick.traits ?? traitCatalog.starts?.[pick.main || "grounded"], traitCatalog, `draft|${card.id}`, pick.thing || traitCatalog.thingOf?.[pick.main || "grounded"] || "") : ""}
    ${
      hiddenInLife
        ? `<p class="why hidden-note">Shown only here: in the life they stay hidden.
      <button class="mls-peek" data-do="unpeek" data-what="archetypes" data-id="${card.id}">HIDE AGAIN</button></p>`
        : ""
    }`;
}
const HOUSES_MIN = 0.25;
function spreadHomes(draft) {
  const mates = matesOf(draft),
    proposed = Object.entries(draft.cast).filter(([id, pick]) => pick.on && pick.proposed && !mates.includes(id));
  if (proposed.length < 3) {
    return;
  }
  const needed =
    Math.ceil(proposed.length * HOUSES_MIN) - proposed.filter(([, pick]) => pick.livesIn === "houses").length;
  if (!(needed <= 0)) {
    proposed
      .filter(([, pick]) => pick.livesBy === "guess" && pick.livesIn === "apartments")
      .sort(([, pickA], [, pickB]) => (pickB.settled ?? 1) - (pickA.settled ?? 1))
      .slice(0, needed)
      .forEach(([, pick]) => {
        pick.livesIn = "houses";
        pick.livesBy = "spread";
      });
  }
}
function matesOf(draft) {
  const roommate = draft.home === "shared" && draft.roommate ? [draft.roommate] : [],
    mates = [...new Set([...(draft.housemates ?? []), ...roommate])].filter((id) => draft.cast[id]?.on);
  return mates.slice(0, roomsOfDraft(draft) + (mates.some((id) => draft.cast[id]?.knows === "couple") ? 1 : 0));
}
function mateFull(draft, id) {
  const mates = matesOf(draft),
    hasPartner = mates.some((id2) => draft.cast[id2]?.knows === "couple");
  return (
    mates.length >= roomsOfDraft(draft) + (hasPartner ? 1 : 0) && !(draft.cast[id]?.knows === "couple" && !hasPartner)
  );
}
function homeless(draft, setup) {
  const mates = matesOf(draft);
  return Object.entries(draft.cast)
    .filter(([id, pick]) => pick.on && !mates.includes(id) && !pick.livesIn)
    .map(([id]) => setup.cards.find((card) => card.id === id)?.name ?? id);
}
function tastesRow(setup, draft, card, pick) {
  if (!seesArchetypes(draft, card.id)) {
    return '<div class="mls-tastes"><span class="k">GIFTS</span><span class="chip q">hidden, like their personality</span></div>';
  }
  const tastes = pick.tastes;
  if (pick.tastesEdit) {
    const tags = setup.giftTags ?? [],
      tasteSelect = (slot, slotIndex) =>
        `<select data-do="taste" data-id="${card.id}" data-slot="${slot}" data-k="${slotIndex}"><option value="">\u2014</option>${tags.map((tag) => `<option value="${escape(tag)}" ${tastes[slot]?.[slotIndex] === tag ? "selected" : ""}>${escape(tag)}</option>`).join("")}</select>`;
    return `<div class="mls-tastes edit"><span class="k">GIFTS</span>
      <label>\u2665 Loves ${tasteSelect("loves", 0)}</label><label>+ Likes ${tasteSelect("likes", 0)}${tasteSelect("likes", 1)}</label><label>\u2212 Dislikes ${tasteSelect("dislikes", 0)}${tasteSelect("dislikes", 1)}</label>
      <button class="mls-drop" data-do="tastes-edit" data-id="${card.id}">DONE</button></div>`;
  }
  return `<div class="mls-tastes"><span class="k">GIFTS</span>${(tastes.loves ?? []).map((tag) => `<span class="chip love">\u2665 ${escape(tag)}</span>`).join("")}${(tastes.likes ?? []).map((tag) => `<span class="chip">+ ${escape(tag)}</span>`).join("")}${(tastes.dislikes ?? []).map((tag) => `<span class="chip no">\u2212 ${escape(tag)}</span>`).join("")}
    <button class="mls-drop" data-do="tastes-edit" data-id="${card.id}">EDIT</button></div>`;
}
const KNOWS_PICK = [
  {
    id: "no",
    label: "Has not met you",
  },
  {
    id: "friendly",
    label: "Has met you",
  },
  {
    id: "friend",
    label: "A friend",
  },
  {
    id: "close",
    label: "A close friend",
  },
  {
    id: "family",
    label: "Family",
  },
  {
    id: "couple",
    label: "Your partner",
  },
  {
    id: "ex",
    label: "Your ex",
  },
  {
    id: "rivals",
    label: "Your rival",
  },
];
const KIN_PICK = [
  {
    id: "siblings",
    label: "Sibling",
  },
  {
    id: "parent",
    label: "Parent",
  },
  {
    id: "cousins",
    label: "Cousin",
  },
  {
    id: "relatives",
    label: "Relative",
  },
];
function toYouChip(pick) {
  const genderIndex = pick.gender === "female" || pick.gender === "futanari" ? 0 : pick.gender === "male" ? 1 : 2;
  return pick.knows === "family"
    ? `your ${
        ({
          siblings: ["sister", "brother", "sibling"],
          parent: ["mother", "father", "parent"],
          cousins: ["cousin", "cousin", "cousin"],
        }[pick.kin] ?? ["relative", "relative", "relative"])[genderIndex]
      }`
    : ({
        couple: "your partner",
        ex: "your ex",
        rivals: "your rival",
      }[pick.knows] ?? "");
}
function coupleWhy(draft, card, pick) {
  return pick.romanceable === false
    ? "not open to romance"
    : likesSex(pick.into, draft.gender)
      ? Object.entries(draft.cast).some(([id, other]) => id !== card.id && other.on && other.knows === "couple") &&
        !draft.rules?.multipleRelationships
        ? "you have one"
        : ""
      : "not into you";
}
function knowsField(setup, draft, card, pick) {
  const isMate = matesOf(draft).includes(card.id),
    casualKnows = ["no", "friendly", "friend"],
    knows = isMate && casualKnows.includes(pick.knows ?? "no") ? "close" : (pick.knows ?? "no"),
    coupleBlock = coupleWhy(draft, card, pick),
    options = (setup.knows ?? KNOWS_PICK)
      .map((opt) => {
        const disabled =
          (isMate && casualKnows.includes(opt.id)) || (opt.id === "couple" && coupleBlock && knows !== "couple");
        return `<option value="${opt.id}" ${opt.id === knows ? "selected" : ""} ${disabled ? "disabled" : ""}>${escape(opt.label)}${opt.id === "couple" && coupleBlock && knows !== "couple" ? ` \xB7 ${coupleBlock}` : ""}</option>`;
      })
      .join(""),
    kinField =
      knows === "family"
        ? `<label>Family<select data-do="kin" data-id="${card.id}">${(setup.kin ?? KIN_PICK).map((opt) => `<option value="${opt.id}" ${opt.id === (pick.kin ?? "relatives") ? "selected" : ""}>${escape(opt.label)}</option>`).join("")}</select></label>`
        : "";
  return `<label>To you<select data-do="knows" data-id="${card.id}">${options}</select></label>${kinField}`;
}
function orientationFields(card, pick) {
  const genderFrom = pick.genderBy === "you" ? "yours" : pick.proposed && pick.gender ? "from the card" : "not read",
    intoFrom =
      pick.intoBy === "you"
        ? "yours"
        : pick.proposed
          ? pick.intoSaid
            ? "from the card"
            : "the card doesn't say"
          : "not read";
  return `<label>Gender \xB7 ${genderFrom}<select data-do="cast-gender" data-id="${card.id}">${pick.gender ? "" : '<option value="" selected disabled>Pick one</option>'}${SEX_PICK.map(([value, label]) => `<option value="${value}" ${pick.gender === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        <div>Into \xB7 ${intoFrom}${intoChips(`data-do="cast-into" data-id="${card.id}"`, pick.into)}</div>`;
}
const BDAY_SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
function rolledDay(seed) {
  let hash = 2166136261;
  for (const ch of `${seed}|birthday`) {
    hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
  }
  const dayOfYear = (hash >>> 0) % 120;
  return {
    season: Math.floor(dayOfYear / 30),
    day: (dayOfYear % 30) + 1,
  };
}
const birthdayPick = (birthday, id = "") => `<span class="mls-bday-pick">
    <select data-do="bday-season" ${id ? `data-id="${id}"` : ""}>${BDAY_SEASONS.map((season, index) => `<option value="${index}" ${index === birthday?.season ? "selected" : ""}>${season}</option>`).join("")}</select>
    <select data-do="bday-day" ${id ? `data-id="${id}"` : ""}>${Array.from(
      {
        length: 30,
      },
      (_unused, index) =>
        `<option value="${index + 1}" ${index + 1 === birthday?.day ? "selected" : ""}>${index + 1}</option>`,
    ).join("")}</select></span>`;
function birthdayField(card, pick) {
  const birthday = pick.birthday ?? rolledDay(card.id);
  return `<label>Birthday \xB7 ${pick.birthdayFrom === "you" ? "yours" : pick.birthdayFrom === "card" ? "from the card" : "random"}${birthdayPick(birthday, card.id)}</label>`;
}
function livesInField(draft, card, pick) {
  const isMate = matesOf(draft).includes(card.id),
    full = mateFull(draft, card.id);
  return `<label>Lives in<select data-do="lives-in" data-id="${card.id}" class="${pick.livesIn || isMate ? "" : "needed"}">
    ${isMate || pick.livesIn ? "" : '<option value="">\u2014 pick one \u2014</option>'}
    <option value="with-you" ${isMate ? "selected" : ""} ${full && !isMate ? "disabled" : ""}>With you${full && !isMate ? " \xB7 no room left" : ""}</option>
    ${LIVES_IN.map((opt) => `<option value="${opt.id}" ${!isMate && opt.id === pick.livesIn ? "selected" : ""}>${escape(opt.label)}</option>`).join("")}
  </select></label>`;
}
const languageOf = (draft) =>
  draft.settings.language === "other"
    ? (draft.languageOther || "").trim() || "English"
    : draft.settings.language || "English";
function missing(draft, setup) {
  const needs = [];
  if (!String(draft.name).trim()) {
    needs.push({
      step: 1,
      text: "a name for this life",
    });
  }
  if (!draft.personaId) {
    needs.push({
      step: 1,
      text: setup.personas.length ? "a persona" : "a persona in Marinara",
    });
  }
  if (!draft.gender) {
    needs.push({
      step: 1,
      text: "whether you are a woman, a man or futanari",
    });
  }
  if (!draft.settings.connection) {
    needs.push({
      step: 2,
      text: setup.connections.length ? "the model that writes it" : "a connection in Marinara",
    });
  }
  if (!Object.values(draft.cast).some((pick) => pick.on)) {
    needs.push({
      step: 3,
      text: "someone in the cast",
    });
  }
  for (const { card: card, pick: pick } of chosenOf(setup, draft)) {
    if (!pick.gender) {
      needs.push({
        step: 3,
        text: `whether ${card.name} is a woman, a man or futanari`,
      });
    }
  }
  needs.push(...modMissing(draft, setup));
  return needs;
}
const STEPS = [
  [1, "You"],
  [2, "The world"],
  [3, "The cast"],
  [4, "Your home"],
  [5, "Rules"],
  [6, "Pictures"],
  [7, "Start"],
];
const chosenOf = (setup, draft) =>
  Object.entries(draft.cast)
    .filter(([, pick]) => pick.on)
    .map(([id, pick]) => ({
      id: id,
      pick: pick,
      card: setup.cards.find((card) => card.id === id),
    }))
    .filter((entry) => entry.card);
const weeksShown = (draft) => draft.show.showSchedules !== "hidden";
const canStart = (draft, setup) => !missing(draft, setup).length && !homeless(draft, setup).length;
function stepDone(draft, setup, step) {
  const needs = missing(draft, setup);
  return needs.some((need) => need.step === step)
    ? false
    : step === 1 || step === 2
      ? true
      : step === 3
        ? chosenOf(setup, draft).every((entry) => entry.pick.proposed)
        : step === 4
          ? !needs.some((need) => need.step === 3) && !homeless(draft, setup).length
          : step < 7 && (draft.reached ?? 1) > step;
}
const stepOpen = (draft, setup, step) => step <= (draft.reached ?? 1) || (step === 7 && canStart(draft, setup));
function stepRail(draft, setup) {
  const current = draft.step ?? 1,
    stepLink = ([num, label]) =>
      `<a class="mls-step ${num === current ? "on" : ""} ${stepOpen(draft, setup, num) ? "" : "locked"}" role="button" tabindex="0" data-do="step" data-id="${num}">${num} \xB7 ${label}<span>${stepDone(draft, setup, num) ? "\u2713" : ""}</span></a>`,
    weekLink = weeksShown(draft)
      ? `<a class="mls-step extra ${current === "w" ? "on" : ""} ${stepOpen(draft, setup, 4) ? "" : "locked"}" role="button" tabindex="0" data-do="to-week">+ Their weeks<span>${current === "w" ? "" : "optional"}</span></a>`
      : "";
  return STEPS.slice(0, 6).map(stepLink).join("") + weekLink + stepLink(STEPS[6]);
}
function stillNeeded(draft, setup) {
  const upTo = draft.step === "w" ? 7 : (draft.step ?? 1),
    needs = missing(draft, setup)
      .filter((need) => need.step <= upTo)
      .map((need) => `<b>${escape(need.text)}</b>`),
    homelessNames = upTo >= 4 ? homeless(draft, setup) : [];
  return [
    needs.length ? `Still needed: ${needs.join(" \xB7 ")}` : "",
    homelessNames.length
      ? `Where ${homelessNames.map((personName) => `<b>${escape(personName)}</b>`).join(", ")} live${homelessNames.length === 1 ? "s" : ""}${upTo === 4 ? "" : " (step 4)"}`
      : "",
  ]
    .filter(Boolean)
    .join(" \xB7 ");
}
function stepBar(draft, setup, busy) {
  const step = draft.step ?? 1,
    blocked = missing(draft, setup).some((need) => need.step === step) || (step === 3 && draft.reading),
    backButton =
      step === 1
        ? '<button class="mls-back flat" data-do="title">\u25C2 ALL LIVES</button>'
        : step === 7 && weeksShown(draft)
          ? '<button class="mls-back flat" data-do="to-week">\u25C2 BACK</button>'
          : `<button class="mls-back flat" data-do="step" data-id="${step - 1}">\u25C2 BACK</button>`,
    skipButton =
      step >= 3 && step < 7 && canStart(draft, setup)
        ? '<button class="mls-back flat" data-do="step" data-id="7">SKIP TO START \u25B8</button>'
        : "",
    nextButton =
      step === 7
        ? `<button class="mls-start" data-do="start-ask" ${canStart(draft, setup) && !busy ? "" : "disabled"}>${busy ? "STARTING\u2026" : "START \u25B8"}</button>`
        : step === 6 && weeksShown(draft)
          ? `<button class="mls-start" data-do="to-week" ${busy ? "disabled" : ""}>NEXT \u25B8<small>their weeks</small></button>`
          : `<button class="mls-start" data-do="step" data-id="${step + 1}" ${blocked ? "disabled" : ""}>NEXT \u25B8<small>${step + 1} \xB7 ${escape(STEPS[step][1].toLowerCase())}</small></button>`;
  return actionBar(stillNeeded(draft, setup), `${backButton}${skipButton}${nextButton}`);
}
function creationView({ resources: resources, draft: draft, error: error, busy: busy }) {
  const step = draft.step ?? 1;
  if (step === "w") {
    return weekView(
      {
        resources: resources,
        draft: draft,
        error: error,
        busy: busy,
      },
      {
        rail: stepRail(draft, resources),
        bar: actionBar(
          stillNeeded(draft, resources),
          `<button class="mls-back flat" data-do="step" data-id="6">\u25C2 BACK</button>
        <button class="mls-start" data-do="step" data-id="7">NEXT \u25B8<small>7 \xB7 start</small></button>`,
        ),
      },
    );
  }
  const body =
    step === 1
      ? youStep(resources, draft)
      : step === 2
        ? worldStep(resources, draft)
        : step === 3
          ? castSection(resources, draft, {
              homes: false,
              add: true,
            })
          : step === 4
            ? homeStep(resources, draft)
            : step === 5
              ? rulesStep(draft)
              : step === 6
                ? picturesStep(resources, draft)
                : startStep(resources, draft);
  return `
    <div class="mls-create">
      <nav class="mls-index"><h1>NEW<br>LIFE</h1><button class="mls-drop mls-presets-btn" data-do="presets-open">PRESETS</button>${stepRail(draft, resources)}<div class="spacer"></div></nav>
      <main>
        ${error ? `<div class="err">${escape(error)}</div>` : ""}
        ${step === 1 ? resources.problems.map((problem) => `<div class="err soft">${escape(problem)}</div>`).join("") : ""}
        <p class="mls-where">STEP ${step} OF 7 \xB7 ${escape(STEPS[step - 1][1].toUpperCase())}</p>
        ${body}
        ${stepBar(draft, resources, busy)}
        ${draft.askStart ? startAsk(resources, draft) : ""}
        ${draft.askResume ? resumeAsk(resources, draft) : ""}
        ${draft.loadedMissing ? missingAsk(draft.loadedMissing) : ""}
      </main>
    </div>`;
}
function youStep(resources, draft) {
  const left = SKILL_POINTS - spent(draft),
    personaButton = (persona) => `
    <button class="mls-persona ${draft.personaId === persona.id ? "on" : ""}" data-do="persona" data-id="${persona.id}" title="${escape(persona.name)}">
      <span class="ph">${persona.avatar ? `<img src="${escape(persona.avatar)}" alt="" loading="lazy">` : escape((persona.name[0] ?? "?").toUpperCase())}</span>
      <b>${escape(persona.name)}</b>
    </button>`;
  return `
        <section id="mls-you">
          <h2>YOU <span>who you play</span></h2>
          <div class="card">
            <label class="field wide">Name of this life
              <input type="text" data-do="name" value="${escape(draft.name)}" maxlength="60"></label>
            <div class="lbl">Persona</div>
            <div class="mls-personas">${resources.personas.length ? resources.personas.map(personaButton).join("") : '<div class="muted">No personas in this Marinara yet.</div>'}</div>
            <div class="row">
              <label class="field">Savings<select data-do="savings">${SAVINGS.map((saving) => `<option value="${saving.id}" ${saving.id === draft.savings ? "selected" : ""}>${escape(saving.label)}</option>`).join("")}</select></label>
              <label class="field">Basic income $ a season<input type="number" data-do="ubi" min="0" max="100000" step="50" value="${Number(draft.rules.ubi) || 0}" title="Paid into your cash on day 1 of each season. 0 is off."></label>
              <label class="field">You are<select data-do="gender">${draft.gender ? "" : '<option value="" selected disabled>Pick one</option>'}${[
                ["female", "A woman"],
                ["male", "A man"],
                ["futanari", "A futanari"],
              ]
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${draft.gender === value ? "selected" : ""}>${label}</option>`,
                )
                .join("")}</select></label>
              <label class="field">Your birthday${birthdayPick(draft.birthday)}</label>
            </div>
            <div class="lbl">Starting skills \xB7 ${left} of ${SKILL_POINTS} points left \xB7 ${SKILL_CAP} at most in one</div>
            <div class="points">
              ${resources.skills
                .map(
                  (skill) => `
                <div class="pt">
                  <b>${escape(skill)}</b>
                  <span class="pips">${Array.from(
                    {
                      length: 10,
                    },
                    (_unused, pip) => `<i class="${pip < draft.skills[skill] ? "on" : ""}"></i>`,
                  ).join("")}</span>
                  <span class="pm">
                    <button data-do="skill-down" data-id="${skill}" ${draft.skills[skill] <= 0 ? "disabled" : ""}>\u2212</button>
                    <button data-do="skill-up" data-id="${skill}" ${left <= 0 || draft.skills[skill] >= SKILL_CAP ? "disabled" : ""}>+</button>
                  </span>
                </div>`,
                )
                .join("")}
            </div>
          </div>
        </section>`;
}
function worldStep(resources, draft) {
  return `
        <section id="mls-model">
          <h2>MODEL <span>who writes this life</span></h2>
          <div class="card">
            <div class="row">
              <label class="field">Connection
                <select data-do="connection" class="${draft.settings.connection ? "" : "needed"}">
                  <option value="">\u2014 pick one \u2014</option>
                  ${resources.connections.map((conn) => `<option value="${conn.id}" ${conn.id === draft.settings.connection ? "selected" : ""}>${escape(conn.name)}${conn.model ? ` \xB7 ${escape(conn.model)}` : ""}</option>`).join("")}
                </select></label>
              <label class="field">Reasoning
                <select data-do="effort">
                  ${(resources.efforts ?? []).map((effort) => `<option value="${effort}" ${effort === draft.settings.effort ? "selected" : ""}>${escape(effort)}</option>`).join("")}
                </select></label>
              <label class="field">Narration language
                <select data-do="language">
                  ${(resources.languages ?? ["English"]).map((lang) => `<option value="${escape(lang)}" ${lang === draft.settings.language ? "selected" : ""}>${escape(lang)}</option>`).join("")}
                  <option value="other" ${draft.settings.language === "other" ? "selected" : ""}>Other\u2026</option>
                </select></label>
              ${
                draft.settings.language === "other"
                  ? `<label class="field">Which one
                <input type="text" data-do="language-other" value="${escape(draft.languageOther)}" maxlength="40" placeholder="Catalan, Polish\u2026"></label>`
                  : ""
              }
            </div>
            <p class="muted">${resources.connections.length ? "It writes the scenes and everything people say. You can change it later." : "There are no connections in this Marinara. Add one and come back: a life needs a model to be written."}</p>
            <p class="muted">The story is written in this language; the menus stay in English.</p>
            <details ${Object.values(draft.settings.sampling ?? {}).some((value) => value !== "") ? "open" : ""}>
              <summary>ADVANCED \xB7 sampling; blank uses the connection's value</summary>
              ${samplingFields(draft.settings.sampling ?? {}, (key) => `data-do="sample" data-id="${key}"`, 'data-do="draft-sampling-reset"')}
            </details>
          </div>
        </section>
${modSection(resources, draft)}

        <section id="mls-note">
          <h2>THE TOWN <span>optional \xB7 people in town know it and may bring it up</span></h2>
          <label class="field">Starts in<select data-do="season">${START_SEASONS.map((season) => `<option value="${season}" ${season === (draft.season ?? "Autumn") ? "selected" : ""}>${season}</option>`).join("")}</select></label>
          <label class="field">Name of the town
            <input type="text" data-do="town-name" value="${escape(draft.townName ?? "")}" maxlength="40" placeholder="Leave it blank and the town has no name"></label>
          <label class="field wide">The setting
            <textarea data-do="scenario" maxlength="600" placeholder="Country, city, vibe\u2026">${escape(draft.scenario)}</textarea></label>
          <div class="count">${draft.scenario.length} / 600</div>
          ${
            resources.lorebooks
              ? `<label class="field wide">World lore
            <select data-do="lore-book"><option value="">\u2014 none \u2014</option>
              ${resources.lorebooks.map((book) => `<option value="${escape(book.id)}" ${book.id === draft.loreBookId ? "selected" : ""}>${escape(book.name)} \xB7 ${book.entries} entries</option>`).join("")}
            </select></label>
          <p class="muted">A lorebook from Marinara: its enabled entries are copied into this life as world lore, so a later edit to the book does not change it. You can re-pull it in SETTINGS \xB7 MODEL.</p>`
              : ""
          }
        </section>

        <section id="mls-town">
          <h2>ITS PLACES <span>turn off what you don't want \xB7 click a name to rename it</span></h2>
          <div class="mls-places-list">
            ${(
              resources.districts ?? [
                {
                  id: "",
                  name: "",
                  places: resources.places.map((place) => place.id),
                },
              ]
            )
              .map((district) => {
                const places = district.places
                    .map((placeId) => draftPlaces(resources, draft).find((place) => place.id === placeId))
                    .filter(Boolean),
                  allOff = places.every((place) => draft.off[place.id]);
                return `
              ${
                district.id
                  ? `<div class="mls-district-row ${allOff ? "off" : ""}">
                <input class="mls-place-name" type="text" data-do="district-name" data-id="${district.id}" maxlength="32"
                  value="${escape(draft.districtNames?.[district.id] ?? "")}" placeholder="${escape(district.name)}" title="Rename ${escape(district.name)}" ${allOff ? "disabled" : ""}>
                <small>DISTRICT</small>
              </div>`
                  : ""
              }
              ${places
                .map(
                  (place) => `
              <div class="mls-place-row ${draft.off[place.id] ? "off" : ""}">
                <label class="mls-tg"><input type="checkbox" data-do="place" data-id="${place.id}" ${draft.off[place.id] ? "" : "checked"} ${place.locked ? "disabled" : ""}><i></i></label>
                <input class="mls-place-name" type="text" data-do="place-name" data-id="${place.id}" maxlength="32"
                  value="${escape(draft.renamed?.[place.id] ?? "")}" placeholder="${escape(place.name)}" title="Rename ${escape(place.name)}" ${draft.off[place.id] ? "disabled" : ""}>
                ${place.locked ? "<small>ALWAYS ON</small>" : ""}
              </div>`,
                )
                .join("")}`;
              })
              .join("")}
          </div>
        </section>`;
}
const DISPOSITION_PICK = [
  ["", "Unset"],
  ["dominant", "Dominant"],
  ["submissive", "Submissive"],
  ["switch", "Switch"],
];
// What the card's reading gave the Adult module, editable before the life starts.
function adultPrefsRow(draft, card, pick) {
  const adult = pick.modules?.adult,
    on = draft.adding ? S.life?.modules?.adult?.on : draft.modules?.adult?.on;
  if (!on || !adult || adult.adult === "no") {
    return "";
  }
  const kinks = adult.intimacy_kinks ?? [];
  return `<div class="mls-modopt-panel">
        <label class="mls-modopt-f"><span class="lbl">IN BED \xB7 DISPOSITION</span><select data-do="cast-disposition" data-id="${card.id}">${DISPOSITION_PICK.map(([value, label]) => `<option value="${value}" ${(adult.intimacy_disposition ?? "") === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        <div class="mls-modopt-f"><span class="lbl">KINKS & FETISHES</span><div class="mls-modopt-chips">${kinks.map((kink, index) => `<span class="mls-modopt-chip">${escape(kink)}<button data-do="cast-kink-remove" data-id="${card.id}" data-tag="${index}" title="Take it out">\u2715</button></span>`).join("")}</div>
        ${kinks.length < 24 ? `<input type="text" maxlength="60" placeholder="Add one, then Enter" data-do="cast-kink-add" data-id="${card.id}">` : ""}</div>
      </div>`;
}
function castSection(setup, draft, { homes = true, add = false } = {}) {
  const chosen = chosenOf(setup, draft),
    memberCard = ({ card: card, pick: pick }) => `
    <div class="mls-member on">
      <span class="face">${card.avatar ? `<img src="${escape(card.avatar)}" alt="" loading="lazy">` : escape((card.name[0] ?? "?").toUpperCase())}</span>
      <div class="who"><b>${escape(card.name)}</b>${cardSub(card, setup.cards) ? `<small class="title">${escape(cardSub(card, setup.cards))}</small>` : ""}
        ${pick.reading ? '<small class="reading">READING\u2026</small>' : pick.problem ? '<small class="failed">COULD NOT READ</small>' : pick.proposed ? `<small class="proposed">${seesArchetypes(draft, card.id) ? "READ \xB7 CHECK IT" : "READ"}</small>` : "<small>NOT READ</small>"}</div>
      <span class="tools">
        ${pick.reading ? `<button class="mls-drop soft" data-do="cast-cancel" data-id="${card.id}">CANCEL</button>` : `<button class="mls-drop" data-do="cast-read" data-id="${card.id}" ${draft.reading ? "disabled" : ""}>${pick.proposed ? "READ AGAIN" : "READ"}</button>`}
        <button class="mls-drop" data-do="cast-off" data-id="${card.id}">REMOVE</button>
      </span>
      <div class="fields">
        ${homes ? livesInField(draft, card, pick) : ""}
        ${orientationFields(card, pick)}
        ${birthdayField(card, pick)}
        ${knowsField(setup, draft, card, pick)}
      </div>
      ${personalityRow(setup, draft, card, pick)}
      <div class="romance"><label class="mls-tg"><input type="checkbox" data-do="cast-romance" data-id="${card.id}" ${pick.romanceable !== false ? "checked" : ""}><i></i>
        <span><b>Open to romance</b><small>Turned off, you stay just friends</small></span></label></div>
      ${adultPrefsRow(draft, card, pick)}
      ${workRow(setup, draft, card, pick)}
      ${inTownRow(setup, draft, card, chosen)}
      ${pick.tastes ? tastesRow(setup, draft, card, pick) : ""}
      ${pick.why && seesArchetypes(draft, card.id) ? `<p class="why">${escape(pick.why)}</p>` : ""}
      ${pick.note && seesWeek(draft, card.id) ? `<p class="why week">Their week: ${escape(pick.note)}</p>` : ""}
      ${pick.weekProblem ? `<p class="why bad">Their week could not be written (${escape(pick.weekProblem)}): they start on a basic one you can change.</p>` : ""}
      ${pick.problem ? `<p class="why bad">${escape(pick.problem)}</p>` : ""}
    </div>`;
  return `
        <section id="mls-cast">
          <h2>THE CAST <span>${chosen.length} of up to ${castCap(setup)}</span></h2>
          <div class="card note">
            Reading a card fills in their personality, their week and how they know the others. You can skip it and set them up yourself.
            <div class="actions">
              ${draft.reading ? `<button class="mls-readall stop" data-do="read-stop">STOP READING \xB7 ${chosen.filter((member) => member.pick.proposed).length} / ${chosen.length}</button>` : `<button class="mls-readall" data-do="read-all" ${chosen.length ? "" : "disabled"}>READ ${chosen.length} CARD${chosen.length === 1 ? "" : "S"}</button>`}
            </div>
          </div>
          <div class="mls-cast">
            ${add ? (setup.cards.length ? `<button class="mls-add" data-do="picker-open">+ ADD CHARACTERS<small>from your ${setup.cards.length} cards</small></button>` : '<div class="muted">There are no character cards in this Marinara.</div>') : ""}
            ${chosen.map(memberCard).join("")}
          </div>
        </section>`;
}
function homeStep(setup, draft) {
  const chosen = chosenOf(setup, draft),
    mates = matesOf(draft),
    rooms = roomsOfDraft(draft),
    candidates = chosen.filter((member) => member.pick.proposed || mates.includes(member.id));
  return `
        <section id="mls-home">
          <h2>YOUR HOME <span>where you live, and with whom</span></h2>
          <div class="card">
            <div class="row">
              <label class="field">Home<select data-do="home">${HOMES.map((home) => `<option value="${home.id}" ${home.id === homeOfDraft(draft) ? "selected" : ""}>${escape(home.label)}</option>`).join("")}</select></label>
            </div>
            <div class="mls-homes-who"><span class="lbl">WHO LIVES WITH YOU \xB7 ROOM FOR ${rooms === 1 ? "ONE" : rooms}</span>
              ${
                candidates.length
                  ? candidates
                      .map((member) => {
                        const isMate = mates.includes(member.id),
                          full = !isMate && mateFull(draft, member.id);
                        return `<button class="${isMate ? "on" : ""}" data-do="housemate" data-id="${member.id}" ${full ? "disabled" : ""}>${newsFace(
                          {
                            id: member.id,
                            name: member.card.name,
                            avatar: member.card.avatar,
                          },
                        )}<b>${escape(member.card.name)}</b></button>`;
                      })
                      .join("")
                  : '<small class="hint">Read the cast first to pick someone.</small>'
              }</div>
          </div>
        </section>
        <section>
          <h2>WHERE EVERYONE LIVES <span>in the building, on the street or on the hill</span></h2>
          <div class="mls-cast">
            ${
              chosen
                .map(
                  ({ id: id, card: card, pick: pick }) => `
            <div class="mls-member on">
              <span class="face">${card.avatar ? `<img src="${escape(card.avatar)}" alt="" loading="lazy">` : escape((card.name[0] ?? "?").toUpperCase())}</span>
              <div class="who"><b>${escape(card.name)}</b>${mates.includes(id) ? "<small>lives with you</small>" : ""}</div>
              <span class="tools"></span>
              <div class="fields">${livesInField(draft, card, pick)}</div>
            </div>`,
                )
                .join("") || '<div class="muted">Nobody in the cast yet.</div>'
            }
          </div>
        </section>`;
}
const RULE_GROUPS = [
  ["Daily life", ["hunger"]],
  ["Relationships", ["jealousy", "drifting", "multipleRelationships", "castCouples", "partnersStray"]],
  ["Town", ["npcs"]],
];
const PAINTING_RULES = ["clothes", "keyImages", "workOutfits", "seasonOutfits"];
function ruleToggle(draft, ruleId, disabled = false) {
  const [, label, detail] = RULES.find(([id]) => id === ruleId);
  return `
                <label class="mls-tg ${disabled ? "off" : ""}"><input type="checkbox" data-do="rule" data-id="${ruleId}" ${draft.rules[ruleId] && !disabled ? "checked" : ""} ${disabled ? "disabled" : ""}><i></i>
                  <span><b>${escape(label)}</b><small>${escape(detail)}</small></span></label>`;
}
function rulesStep(draft) {
  return `
        <section id="mls-rules">
          <h2>RULES <span>you can change them later in SETTINGS</span></h2>
          <div class="card">
            ${RULE_GROUPS.map(([groupName, ruleIds]) => `<div class="lbl">${groupName}</div><div class="mls-toggles">${ruleIds.map((ruleId) => ruleToggle(draft, ruleId)).join("")}</div>`).join("")}
          </div>
        </section>

        <section id="mls-spoilers">
          <h2>WHAT YOU SEE <span>how much the game tells you about people</span></h2>
          <div class="card">
            ${[
              [
                "showArchetypes",
                "Personality types",
                [
                  ["hidden", "Hidden", "You find out by playing."],
                  ["found", "Found in play", "Shown on their contact once you've seen enough."],
                  ["always", "Always visible", "Shown from the start."],
                ],
              ],
              [
                "showSchedules",
                "Their weeks",
                [
                  ["hidden", "Hidden", "You find out where people go by playing."],
                  [
                    "found",
                    "Only what I have seen",
                    "You can set their weeks now; in play, you see what you run into.",
                  ],
                  ["always", "The whole week", "You can set their weeks now; their contact shows the whole week."],
                ],
              ],
            ]
              .map(
                ([key, label, choices]) => `
              <div class="mls-seg">
                <div class="lbl">${label}</div>
                ${choices
                  .map(
                    ([value, choiceLabel, detail]) => `
                  <label class="pick ${draft.show[key] === value ? "on" : ""}">
                    <input type="radio" name="${key}" data-do="show" data-id="${key}" value="${value}" ${draft.show[key] === value ? "checked" : ""}>
                    <span><b>${choiceLabel}</b><small>${detail}</small></span>
                  </label>`,
                  )
                  .join("")}
              </div>`,
              )
              .join("")}
          </div>
        </section>`;
}
function picturesStep(setup, draft) {
  const noImages = !draft.look?.connectionId;
  return `
        ${lookSection(setup, draft)}
        <section>
          <h2>WHAT GETS PAINTED${noImages ? " <span>pick an image connection first</span>" : ""}</h2>
          <div class="card"><div class="mls-toggles">${PAINTING_RULES.map((ruleId) => ruleToggle(draft, ruleId, ruleId !== "clothes" && noImages)).join("")}</div></div>
        </section>
        ${
          noImages
            ? ""
            : `<section>
          <h2>MANUAL OR AUTOMATIC <span>if your image connection is paid, every picture costs</span></h2>
          ${picturesBox(draft.pictures ?? {}, draftPictureCounts(draft), {
            action: "draft-pictures",
            rules: draft.rules,
          })}
        </section>`
        }
        <section>
          <h2>HOW PEOPLE LOOK <span>framed, or standing in the place</span></h2>
          <div class="card">${frameChoice(draft.frame ?? "framed", "draft-frame")}</div>
        </section>
        ${
          noImages
            ? ""
            : `<section>
          <h2>PICTURE SIZE <span>backgrounds and key images</span></h2>
          <div class="card">${sizeChoice(
            draft.size,
            "draft-size",
            (setup.imageConnections ?? []).filter((conn) => conn.bySubjects && conn.id === draft.look?.connectionId),
          )}</div>
        </section>
        <section>
          <h2>PORTRAIT SIZE <span>pictures of one person</span></h2>
          <div class="card">${portraitChoice(
            draft.portraitSize,
            "draft-portrait",
            (setup.imageConnections ?? []).filter((conn) => conn.bySubjects && conn.id === draft.look?.connectionId),
          )}</div>
        </section>`
        }`;
}
function startStep(setup, draft) {
  const persona = setup.personas.find((candidate) => candidate.id === draft.personaId),
    connection = setup.connections.find((candidate) => candidate.id === draft.settings.connection),
    imageConnection = (setup.imageConnections ?? []).find((candidate) => candidate.id === draft.look?.connectionId),
    chosen = chosenOf(setup, draft),
    mates = matesOf(draft),
    offCount = draftPlaces(setup, draft).filter((place) => draft.off[place.id]).length,
    ruleNames = (ruleIds) =>
      ruleIds.filter((ruleId) => draft.rules[ruleId]).map((ruleId) => RULES.find(([id]) => id === ruleId)[1]),
    homelessNames = homeless(draft, setup),
    unread = chosen.filter((member) => !member.pick.proposed).length,
    chip = (text, bad = false) => (text ? `<span class="chip ${bad ? "no" : ""}">${escape(text)}</span>` : ""),
    summaryRow = (step, label, chips) => `
            <div class="mls-member on mls-sum-row">
              <span class="face">${step}</span>
              <div class="who"><b>${label}</b><div class="mls-chips">${chips.join("")}</div></div>
              <span class="tools"><button class="mls-drop" data-do="step" data-id="${step}">EDIT</button></span>
            </div>`,
    homeText =
      {
        studio: "an apartment",
        house: "a house",
        luxury: "a luxury apartment",
        mansion: "a mansion",
      }[homeOfDraft(draft)] ?? draft.home,
    archetypeWords = {
      hidden: "hidden",
      found: "found in play",
      always: "shown",
    },
    weekWords = {
      hidden: "hidden",
      found: "what you see",
      always: "shown",
    };
  return `
        <section>
          <div class="card mls-ready">
            <span class="mls-ready-face">${persona?.avatar ? `<img src="${escape(persona.avatar)}" alt="">` : escape((persona?.name ?? "?")[0])}</span>
            <div>
              <div class="lbl">READY</div>
              <div class="mls-ready-name">${escape(String(draft.name).toUpperCase())}</div>
              <p class="muted">${escape(persona?.name ?? "\u2014")} \xB7 ${escape(draft.season ?? "Autumn")} 1, Year 1 \xB7 ${chosen.length} in the cast</p>
              <div class="mls-ready-cast">${chosen
                .slice(0, 12)
                .map(
                  (member) =>
                    `<span>${member.card.avatar ? `<img src="${escape(member.card.avatar)}" alt="">` : escape(member.card.name[0] ?? "?")}</span>`,
                )
                .join("")}</div>
            </div>
            <button class="mls-readall mls-ready-go" data-do="start-ask" ${canStart(draft, setup) ? "" : "disabled"}>START THIS LIFE \u25B8</button>
          </div>
        </section>
        <section>
          <h2>WHAT IT STARTS WITH <span>everything but you and the cast can change later</span></h2>
          <div class="mls-cast">
            ${summaryRow(1, "YOU", [
              chip(persona?.name ?? "no persona", !persona),
              chip(
                {
                  female: "a woman",
                  male: "a man",
                  futanari: "a futanari",
                }[draft.gender] ?? "woman, man or futanari?",
                !draft.gender,
              ),
              chip(SAVINGS.find((saving) => saving.id === draft.savings)?.label),
              Number(draft.rules.ubi) > 0 ? chip(`basic income $${Number(draft.rules.ubi)}`) : "",
              chip(`born ${BDAY_SEASONS[draft.birthday?.season ?? 0]} ${draft.birthday?.day ?? 1}`),
              ...Object.entries(draft.skills)
                .filter(([, points]) => points)
                .map(([skill, points]) => chip(`${skill} ${points}`)),
            ])}
            ${summaryRow(2, "THE WORLD", [chip(connection ? connection.name : "no model", !connection), chip(languageOf(draft)), chip(draft.townName || "a town with no name"), chip(`${draftPlaces(setup, draft).length - offCount} of ${draftPlaces(setup, draft).length} places`), chip(`starts in ${draft.season ?? "Autumn"}`), ...modOn(draft, setup).map((mod) => chip(mod))])}
            ${summaryRow(3, "THE CAST", [chip(`${chosen.length} ${chosen.length === 1 ? "person" : "people"}`, !chosen.length), chip(`${chosen.length - unread} read`), unread ? chip(`${unread} not read yet`, true) : "", ...chosen.map((member) => (toYouChip(member.pick) ? chip(`${member.card.name} \xB7 ${toYouChip(member.pick)}`) : ""))])}
            ${summaryRow(4, "YOUR HOME", [chip(homeText), mates.length ? chip(`with ${mates.map((mateId) => setup.cards.find((card) => card.id === mateId)?.name ?? "").join(", ")}`) : "", homelessNames.length ? chip(`${homelessNames.join(", ")} still need${homelessNames.length === 1 ? "s" : ""} a home`, true) : ""])}
            ${summaryRow(5, "RULES", [...RULE_GROUPS.flatMap(([, ruleIds]) => ruleNames(ruleIds)).map((ruleIds) => chip(ruleIds)), chip(`personality: ${archetypeWords[draft.show.showArchetypes]}`), chip(`weeks: ${weekWords[draft.show.showSchedules]}`)])}
            ${summaryRow(6, "PICTURES", [chip(imageConnection ? imageConnection.name : "no pictures"), ...ruleNames(PAINTING_RULES).map((ruleName) => chip(ruleName)), chip(draft.frame === "cut" ? "cut out" : "framed")])}
          </div>
        </section>`;
}
function resumeAsk(setup, draft) {
  const personaName = setup.personas.find((persona) => persona.id === draft.personaId)?.name,
    castCount = chosenOf(setup, draft).length,
    stepText = draft.step === "w" ? "their weeks" : `step ${draft.step}, ${STEPS[(Number(draft.step) || 1) - 1][1]}`;
  return `<div class="mls-ask-veil"><div class="mls-ask">
      <b>Pick up where you left off?</b>
      <small>\xAB${escape(draft.name)}\xBB${personaName ? ` \xB7 ${escape(personaName)}` : ""} \xB7 ${castCount} ${castCount === 1 ? "person" : "people"} in the cast \xB7 you were on ${escape(stepText)}.</small>
      <div class="row"><button class="main" data-do="resume-continue">CONTINUE</button><button data-do="resume-over">START OVER</button></div>
    </div></div>`;
}
function missingWords(missingItems) {
  const namesOfKind = (kind) => missingItems.filter((item) => item.kind === kind).map((item) => item.name || "one"),
    listJoin = (names) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]),
    sentences = [],
    cards = namesOfKind("card");
  if (cards.length) {
    sentences.push(
      `${listJoin(cards)} ${cards.length === 1 ? "is" : "are"} no longer in your Marinara, so ${cards.length === 1 ? "they are" : "they are all"} out of the cast.`,
    );
  }
  if (namesOfKind("persona").length) {
    sentences.push("Its persona is no longer in your Marinara: pick one in step 1.");
  }
  if (namesOfKind("connection").length) {
    sentences.push("Its model connection is gone: pick one in step 2.");
  }
  if (namesOfKind("images").length) {
    sentences.push("Its image connection is gone: pick one in step 6.");
  }
  return sentences.join(" ");
}
function missingAsk({ name: lifeName, missing: missingItems }) {
  return `<div class="mls-ask-veil"><div class="mls-ask">
      <b>\xAB${escape(lifeName)}\xBB is loaded, but something is missing</b>
      <small>${escape(missingWords(missingItems))} Everything else is as you saved it.</small>
      <div class="row"><button class="main" data-do="missing-ok">OK</button></div>
    </div></div>`;
}
function presetsView({ presets: presets, resources: resources }) {
  const state = presets ?? {},
    avatarOf = (cardId) => resources.cards.find((card) => card.id === cardId)?.avatar,
    dateText = (at) =>
      at
        ? new Date(at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "",
    faceHtml = (cardId) => (avatarOf(cardId) ? `<img src="${escape(avatarOf(cardId))}" alt="">` : ""),
    presetRow = (preset) =>
      state.rename === preset.id
        ? `<div class="mls-preset-row">
        <span class="face">${faceHtml(preset.face)}</span>
        <input type="text" data-preset-rename value="${escape(state.renameText)}" maxlength="40">
        <span class="tools"><button class="mls-drop" data-do="preset-rename-save" data-id="${escape(preset.id)}">SAVE</button><button class="mls-drop soft" data-do="preset-rename-no">CANCEL</button></span></div>`
        : state.del === preset.id
          ? `<div class="mls-preset-row ask">
        <span class="face">${faceHtml(preset.face)}</span>
        <div><b>Delete \xAB${escape(preset.name)}\xBB?</b><small>There is no going back.</small></div>
        <span class="tools"><button class="mls-drop danger" data-do="preset-del-yes" data-id="${escape(preset.id)}">DELETE</button><button class="mls-drop soft" data-do="preset-del-no">CANCEL</button></span></div>`
          : `<div class="mls-preset-row">
        <span class="face">${faceHtml(preset.face)}</span>
        <div><b>${escape(preset.name)}</b><small>${[preset.persona, `${preset.people} ${preset.people === 1 ? "person" : "people"}`, dateText(preset.at) ? `saved ${dateText(preset.at)}` : ""].filter(Boolean).map(escape).join(" \xB7 ")}</small></div>
        <span class="tools"><button class="mls-drop" data-do="preset-load" data-id="${escape(preset.id)}">LOAD</button><button class="mls-drop" data-do="preset-rename" data-id="${escape(preset.id)}">RENAME</button><button class="mls-drop soft" data-do="preset-del" data-id="${escape(preset.id)}">DELETE</button></span></div>`,
    list = state.list;
  return `
    <div class="mls-modal" data-do="presets-close-outside">
      <div class="mls-picker mls-presets">
        <div class="head"><h3>PRESETS</h3><span class="count">${list ? `${list.length} saved \xB7 up to 30` : "\u2026"}</span><button class="mls-done" data-do="presets-close">DONE</button></div>
        ${state.error ? `<div class="err">${escape(state.error)}</div>` : ""}
        <div class="mls-preset-save">
          <input type="text" data-preset-name value="${escape(state.name ?? "")}" maxlength="40" placeholder="Name this setup">
          <button class="mls-drop" data-do="preset-save">SAVE CURRENT</button>
        </div>
        ${
          state.taken
            ? `<div class="mls-preset-row ask"><span class="face"></span><div><b>\xAB${escape(state.taken)}\xBB already exists.</b><small>Replace it with what you have now?</small></div>
          <span class="tools"><button class="mls-drop danger" data-do="preset-replace-yes">REPLACE</button><button class="mls-drop soft" data-do="preset-replace-no">CANCEL</button></span></div>`
            : ""
        }
        <div class="mls-preset-list">${list ? list.map(presetRow).join("") : ""}</div>
        <div class="mls-preset-foot"><button class="mls-drop" data-do="preset-blank">START BLANK</button></div>
      </div>
    </div>`;
}
function startAsk(setup, draft) {
  const chosen = chosenOf(setup, draft),
    unread = chosen.filter((member) => !member.pick.proposed).length;
  return `<div class="mls-ask-veil" data-do="start-no"><div class="mls-ask">
      <b>Start \u201C${escape(draft.name)}\u201D?</b>
      <small>${chosen.length} ${chosen.length === 1 ? "person" : "people"} in the cast${unread ? `, ${unread} not read yet` : ""}. Once it starts, you and the cast stay as they are.</small>
      <div class="row"><button class="main" data-do="start">START</button><button data-do="start-no">CANCEL</button></div>
    </div></div>`;
}
const pickerGroups = (setup) =>
  (setup.groups ?? []).filter((group) => group.ids.some((id) => setup.cards.some((card) => card.id === id)));
function pickerShown(setup, draft) {
  const query = String(draft.pickerQuery ?? "")
      .trim()
      .toLowerCase(),
    group = pickerGroups(setup).find((grp) => grp.id === draft.pickerGroup) ?? null,
    groupIds = group ? new Set(group.ids) : null,
    matches = (card) =>
      !query ||
      [card.name, card.title ?? "", ...(card.tags ?? [])].some((text) => String(text).toLowerCase().includes(query));
  return setup.cards.filter((card) => (!groupIds || groupIds.has(card.id)) && matches(card));
}
function pickerView({ resources: resources, draft: draft }) {
  const groups = pickerGroups(resources),
    group = groups.find((grp) => grp.id === draft.pickerGroup) ?? null,
    shown = pickerShown(resources, draft),
    castCount = Object.values(draft.cast).filter((pick) => pick.on).length,
    groupButton = (id, label, count) =>
      `<button class="${(draft.pickerGroup ?? "") === id || (!group && !id) ? "on" : ""}" data-do="picker-group" data-id="${escape(id)}">${escape(label)}<small>${count}</small></button>`;
  return `
    <div class="mls-modal" data-do="picker-close-outside">
      <div class="mls-picker">
        <div class="head">
          <h3>ADD CHARACTERS</h3>
          <span class="count">${castCount} of up to ${castCap(resources)} \xB7 ${resources.cards.length} cards</span>
          <button class="mls-done" data-do="picker-close">DONE</button>
        </div>
        ${groups.length ? `<div class="mls-picker-groups">${groupButton("", "ALL", resources.cards.length)}${groups.map((grp) => groupButton(grp.id, grp.name, grp.ids.filter((id) => resources.cards.some((card) => card.id === id)).length)).join("")}</div>` : ""}
        <input type="text" data-do="picker-search" placeholder="Search your cards\u2026" value="${escape(draft.pickerQuery ?? "")}">
        <div class="list">${pickerList({
          resources: resources,
          draft: draft,
          shown: shown,
        })}</div>
      </div>
    </div>`;
}
function pickerList({ resources: resources, draft: draft, shown: shown }) {
  const full = Object.values(draft.cast).filter((pick) => pick.on).length >= castCap(resources);
  return shown.length
    ? shown
        .map(
          (card) => `
    <label class="pick ${draft.cast[card.id]?.on ? "on" : ""} ${full && !draft.cast[card.id]?.on ? "full" : ""}" ${full && !draft.cast[card.id]?.on ? `title="A life has room for ${castCap(resources)} people"` : ""}>
      <input type="checkbox" data-do="cast-on" data-id="${card.id}" ${draft.cast[card.id]?.on ? "checked" : ""} ${full && !draft.cast[card.id]?.on ? "disabled" : ""}>
      <span class="face">${card.avatar ? `<img src="${escape(card.avatar)}" alt="" loading="lazy">` : escape((card.name[0] ?? "?").toUpperCase())}</span>
      <span class="nm"><b>${escape(card.name)}</b>${cardSub(card, resources.cards) ? `<small>${escape(cardSub(card, resources.cards))}</small>` : ""}</span>
    </label>`,
        )
        .join("")
    : '<div class="muted">No card matches that.</div>';
}
function cardSub(card, cards = []) {
  if (card.title) {
    return card.title;
  }
  if (
    !cards.some(
      (other) => other.id !== card.id && other.name.trim().toLowerCase() === card.name.trim().toLowerCase(),
    ) ||
    !card.edited
  ) {
    return "";
  }
  const edited = new Date(card.edited);
  return Number.isNaN(edited.getTime())
    ? ""
    : `Edited ${edited.getDate()} ${edited.toLocaleString("en-US", {
        month: "short",
      })}`;
}
function castReviewView({ resources: resources, draft: draft, error: error, busy: busy }) {
  const chosen = chosenOf(resources, draft),
    readCount = chosen.filter((member) => member.pick.proposed).length,
    problemCount = chosen.filter((member) => member.pick.problem).length,
    homelessNames = homeless(draft, resources);
  return `
    <div class="mls-create">
      <nav class="mls-index">
        ${addingTag(draft)}
        <h1>THE<br>CAST</h1>
        <p class="todo">${readCount} of ${chosen.length} read${problemCount ? ` \xB7 ${problemCount} failed` : ""}</p>
        <div class="spacer"></div>
      </nav>

      <main>
        ${error ? `<div class="err">${escape(error)}</div>` : ""}
        ${castSection(resources, draft)}
        ${actionBar(
          homelessNames.length
            ? `Where ${homelessNames.map((personName) => `<b>${escape(personName)}</b>`).join(", ")} live${homelessNames.length === 1 ? "s" : ""}`
            : "",
          `${draft.adding ? '<button class="mls-back flat" data-do="adding-cancel">\u25C2 CANCEL</button>' : '<button class="mls-back flat" data-do="back-to-form">\u25C2 BACK</button>'}
           ${
             draft.show.showSchedules === "hidden"
               ? `<button class="mls-back flat" data-do="to-week" ${busy || draft.reading ? "disabled" : ""}>SEE THEIR WEEKS (SPOILER) \u25B8</button>
                ${startButton(draft, busy, busy || draft.reading || homelessNames.length)}`
               : `<button class="mls-start" data-do="to-week" ${busy || draft.reading ? "disabled" : ""}>NEXT \u25B8<small>their weeks</small></button>`
           }`,
        )}
      </main>
    </div>`;
}
function workRow(setup, draft, card, pick) {
  const jobs = draftJobs(setup, draft),
    life = draft.adding && typeof S < "u" ? S.life : null,
    holderOf = (jobId) =>
      (jobs.find((job) => job.id === jobId)?.boss &&
        Object.entries(draft.cast).find(
          ([id, otherPick]) => id !== card.id && otherPick.on && otherPick.job === jobId,
        )?.[0]) ||
      ((life?.jobs?.list ?? []).find((job) => job.id === jobId)?.holder?.id ?? null),
    nameOf = (id) =>
      setup.cards.find((person) => person.id === id)?.name ??
      (life?.contacts ?? []).find((person) => person.id === id)?.name ??
      "someone",
    current = pick.job || "none",
    options = [
      ["none", "No job"],
      ["out", "Works out of town"],
      ["home", "Works from home"],
      ...jobs.map((job) => [job.id, `${job.placeName} \xB7 ${job.title} \xB7 ${job.shift}`, holderOf(job.id)]),
    ]
      .map(
        ([value, label, holder]) =>
          `<option value="${escape(value)}" ${value === current ? "selected" : ""} ${holder ? "disabled" : ""}>${escape(label)}${holder ? ` \xB7 ${escape(nameOf(holder))}` : ""}</option>`,
      )
      .join("");
  return `<div class="mls-work-row"><span class="lbl">WORK</span><select data-do="job" data-id="${card.id}">${options}</select>
    ${current === "home" ? `<input type="text" data-do="job-title" data-id="${card.id}" maxlength="40" value="${escape(pick.jobTitle ?? "")}" placeholder="What they do">` : ""}
    ${pick.workOutfit ? `<small>wears ${escape(pick.workOutfit)}</small>` : ""}</div>`;
}
const draftPlaces = (setup, draft) =>
  (setup.places ?? []).filter(
    (place) =>
      !place.module ||
      (draft.modules?.[place.module]?.on &&
        ((setup.modules ?? []).find((mod) => mod.id === place.module)?.options ?? []).every(
          (opt) => !opt.required || draft.modules[place.module][opt.key],
        )),
  );
function draftJobs(setup, draft) {
  const life = draft.adding && typeof S < "u" ? S.life : null;
  if (life?.jobs?.list) {
    return life.jobs.list;
  }
  const offIds = new Set(
      Object.entries(draft.off ?? {})
        .filter(([, off]) => off)
        .map(([id]) => id),
    ),
    insideOf = Object.fromEntries((setup.weekPlaces ?? []).map((place) => [place.id, place.inside]));
  return (setup.jobs ?? [])
    .filter(
      (job) =>
        !offIds.has(job.place) &&
        !offIds.has(insideOf[job.place]) &&
        (!job.module || draftPlaces(setup, draft).some((place) => place.id === job.place)),
    )
    .map((job) => ({
      ...job,
      placeName: String(draft.renamed?.[job.place] ?? "").trim() || job.placeName,
    }));
}
function inTownRow(setup, draft, card, chosen) {
  const others = chosen.filter((member) => member.card.id !== card.id).map((member) => member.card),
    nameOf = (id) => others.find((other) => other.id === id)?.name ?? "?",
    pairButtons = Object.values(draft.pairs ?? {})
      .filter(
        (pair) =>
          (pair.a === card.id || pair.b === card.id) &&
          others.some((other) => other.id === (pair.a === card.id ? pair.b : pair.a)),
      )
      .map((pair) => {
        const otherId = pair.a === card.id ? pair.b : pair.a;
        return `<button class="mls-rel ${pair.changed ? "changed" : ""}" data-do="pair-edit" data-id="${card.id}" data-other="${otherId}"><b>${escape(nameOf(otherId))}</b> \xB7 ${escape(pairName(pair))}${pair.changed ? " <em>CHANGED</em>" : ""}</button>`;
      })
      .join(""),
    edit = draft.pairEdit?.card === card.id ? draft.pairEdit : null,
    existing = edit?.from ? draft.pairs[[card.id, edit.from].sort().join("|")] : null,
    couplesOn = !!draft.rules?.castCouples,
    editor = edit
      ? `
    <div class="mls-rel-edit">
      <select data-pair="other">${others.map((other) => `<option value="${other.id}" ${other.id === edit.other ? "selected" : ""}>${escape(other.name)}</option>`).join("")}</select>
      <select data-pair="kind">${Object.entries(PAIR_NAMES)
        .map(([kind, label]) => {
          const blocked = !couplesOn && (kind === "couple" || kind === "ex");
          return `<option value="${kind}" ${kind === edit.kind ? "selected" : ""} ${blocked ? "disabled" : ""}>${label}${blocked ? " \xB7 needs Couples in the cast" : ""}</option>`;
        })
        .join("")}</select>
      ${
        edit.kind === "family"
          ? `<select data-pair="detail">${Object.entries(FAMILY_NAMES)
              .map(
                ([kind, label]) =>
                  `<option value="${kind}" ${kind === edit.detail ? "selected" : ""}>${label}</option>`,
              )
              .join("")}</select>`
          : ""
      }
      <button class="mls-drop" data-do="pair-save">SAVE</button>
      ${existing ? '<button class="mls-drop" data-do="pair-remove">REMOVE</button>' : ""}
      <button class="mls-drop soft" data-do="pair-cancel">CANCEL</button>
      ${existing?.changed ? `<small>${escape(existing.changed)}</small>` : ""}
    </div>`
      : "";
  return others.length
    ? `<div class="mls-rels"><span class="lbl">PEOPLE THEY KNOW</span>${pairButtons || '<span class="none">nobody yet</span>'}<button class="mls-rel-add" data-do="pair-edit" data-id="${card.id}" data-other="">+ ADD</button>${editor}</div>`
    : "";
}
const addingTag = (draft) =>
  draft.adding ? `<div class="mls-adding">ADDING TO<b>${escape(draft.adding)}</b></div>` : "";
const startButton = (draft, busy, disabled) =>
  draft.adding
    ? `<button class="mls-start" data-do="adding-done" ${disabled ? "disabled" : ""}>${busy ? "ADDING\u2026" : "ADD TO TOWN \u25B8"}<small>they arrive now</small></button>`
    : `<button class="mls-start" data-do="start" ${disabled ? "disabled" : ""}>${busy ? "STARTING\u2026" : "START \u25B8"}</button>`;

export {
  SEASON_OUTFITS_RULE,
  actionBar,
  addingTag,
  castReviewView,
  creationView,
  draftPictureCounts,
  emptyDraft,
  homeOfDraft,
  homeless,
  languageOf,
  matesOf,
  pickerList,
  pickerShown,
  pickerView,
  placeName,
  presetsView,
  rolledDay,
  spreadHomes,
  startButton,
  stepOpen,
  traitsEditor,
};
