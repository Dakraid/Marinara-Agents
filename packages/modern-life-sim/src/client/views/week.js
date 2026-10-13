// Weekly schedule grid editing and view
import { colourFor, escape } from "./common.js";
import { actionBar, addingTag, homeless, placeName, startButton } from "./creation.js";

const asHour = (value) => Math.max(0, Math.min(24, Math.round(Number(value) || 0)));
const asDay = (day) => ((Math.trunc(day) % 7) + 7) % 7;
const emptyGrid = () =>
  Array.from(
    {
      length: 7,
    },
    () =>
      Array.from(
        {
          length: 24,
        },
        () => null,
      ),
  );
function hoursOf(day, from, to) {
  const start = asHour(from) % 24,
    count = (((asHour(to) - start) % 24) + 24) % 24 || 24;
  return Array.from(
    {
      length: count,
    },
    (_unused, offset) => ({
      d: (asDay(day) + Math.floor((start + offset) / 24)) % 7,
      h: (start + offset) % 24,
    }),
  );
}
function paint(grid, day, from, to, placeId, doing = "", sleep = false) {
  for (const { d: dayIdx, h: hourIdx } of hoursOf(day, from, to)) {
    grid[dayIdx][hourIdx] = {
      place: String(placeId ?? ""),
      doing: String(doing ?? ""),
      ...(sleep === true
        ? {
            sleep: true,
          }
        : {}),
    };
  }
  return grid;
}
function eraseHours(grid, day, from, to) {
  for (const { d: dayIdx, h: hourIdx } of hoursOf(day, from, to)) {
    grid[dayIdx][hourIdx] = null;
  }
  return grid;
}
function runsOfDay(grid, day) {
  const runs = [];
  let run = null;
  for (let hour = 0; hour < 24; hour++) {
    const cell = grid[day][hour],
      key = cell ? `${cell.place}|${cell.doing}|${cell.sleep ? 1 : 0}` : null;
    if (run && key === run.key) {
      run.to = hour + 1;
      continue;
    }
    if (run) {
      runs.push(run);
    }
    run = key
      ? {
          key: key,
          from: hour,
          to: hour + 1,
          place: cell.place,
          doing: cell.doing,
          sleep: !!cell.sleep,
        }
      : null;
  }
  if (run) {
    runs.push(run);
  }
  return runs;
}
function startsYesterday(grid, day) {
  const lastYesterday = runsOfDay(grid, (day + 6) % 7).at(-1),
    firstToday = runsOfDay(grid, day)[0];
  return !!(
    lastYesterday &&
    firstToday &&
    lastYesterday.to === 24 &&
    lastYesterday.from !== 0 &&
    firstToday.from === 0 &&
    firstToday.to !== 24 &&
    firstToday.key === lastYesterday.key
  );
}
function blocksOf(grid, day) {
  const runs = runsOfDay(grid, day);
  if (startsYesterday(grid, day)) {
    runs.shift();
  }
  const last = runs.at(-1);
  if (last && last.to === 24 && last.from !== 0) {
    const firstNext = runsOfDay(grid, (day + 1) % 7)[0];
    if (firstNext && firstNext.from === 0 && firstNext.to !== 24 && firstNext.key === last.key) {
      last.to = firstNext.to;
      last.wraps = true;
    }
  }
  return runs;
}
const freeHoursIn = (grid) => grid.reduce((sum, row) => sum + row.filter((cell) => !cell).length, 0);
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const PLACE_COLOURS = {
  home: "#b0473d",
  cafe: "#8d6e63",
  gym: "#ef6c00",
  office: "#1976d2",
  market: "#43a047",
  park: "#7cb342",
  bar: "#8e24aa",
  library: "#00897b",
  university: "#5e35b1",
  mall: "#c2185b",
  workhome: "#d4a017",
};
const placeColour = (placeId) => PLACE_COLOURS[placeId] ?? colourFor(placeId);
const hourLabel = (hour) => `${hour === 24 ? 24 : String(((hour % 24) + 24) % 24).padStart(2, "0")}:00`;
function gapsOfDay(grid, day) {
  const gaps = [];
  let start = null;
  for (let hour = 0; hour <= 24; hour++) {
    const free = hour < 24 && !grid[day][hour];
    if (free && start === null) {
      start = hour;
    }
    if (!free && start !== null) {
      gaps.push({
        from: start,
        to: hour,
      });
      start = null;
    }
  }
  return gaps;
}
function clearBlock(grid, day, index) {
  const block = blocksOf(grid, day)[index];
  if (block) {
    eraseHours(grid, day, block.from, block.to);
  }
  return grid;
}
function editBlock(grid, day, index, patch) {
  const block = blocksOf(grid, day)[index];
  if (!block) {
    return grid;
  }
  const next = {
    from: block.from,
    to: block.to,
    place: block.place,
    doing: block.doing,
    sleep: block.sleep,
    ...patch,
  };
  return next.from === next.to % 24 && patch.from !== undefined
    ? grid
    : (eraseHours(grid, day, block.from, block.to),
      paint(grid, day, next.from, next.to, next.place, next.doing, next.sleep));
}
function addBlock(grid, day, placeId = "home") {
  const gap = gapsOfDay(grid, day)[0] ?? {
    from: 9,
    to: 12,
  };
  return paint(grid, day, gap.from, Math.min(gap.to, gap.from + 3), placeId, "");
}
function copyDay(grid, day, target) {
  if (target === "clear") {
    grid[day] = Array.from(
      {
        length: 24,
      },
      () => null,
    );
    return grid;
  }
  const days =
    {
      all: [0, 1, 2, 3, 4, 5, 6],
      week: [0, 1, 2, 3, 4],
      end: [5, 6],
    }[target] ?? [];
  for (const dayIdx of days) {
    if (dayIdx !== day) {
      grid[dayIdx] = grid[day].map((cell) =>
        cell
          ? {
              ...cell,
            }
          : null,
      );
    }
  }
  return grid;
}
function weekView({ resources: resources, draft: draft, error: error, busy: busy }, { rail = "", bar = "" } = {}) {
  const members = Object.entries(draft.cast)
      .filter(([, pick]) => pick.on)
      .map(([id, pick]) => ({
        id: id,
        pick: pick,
        card: resources.cards.find((card) => card.id === id),
      }))
      .filter((member) => member.card),
    current = members.find((member) => member.id === draft.weekFor) ?? members[0];
  if (!current) {
    return '<div class="mls-create"><main><p class="muted">Nobody in this life yet.</p></main></div>';
  }
  const grid = current.pick.grid ?? emptyGrid(),
    day = draft.weekDay ?? 0,
    hiddenWeeks = draft.show?.showSchedules === "hidden",
    peeked = hiddenWeeks && !!draft.peek?.weeks?.[current.id],
    covered = hiddenWeeks && !peeked,
    places = (resources.weekPlaces ?? resources.places)
      .filter((place) => !draft.off[place.id] && !draft.off[place.inside])
      .map((place) => ({
        ...place,
        name: place.inside ? `Mall \xB7 ${place.name}` : placeName(draft, place),
      })),
    homelessNames = homeless(draft, resources),
    query = String(draft.weekFind ?? "")
      .trim()
      .toLowerCase(),
    filtered = query ? members.filter((member) => member.card.name.toLowerCase().includes(query)) : members,
    memberName = current.card.name,
    memberRow = (member) => {
      const free = freeHoursIn(member.pick.grid ?? emptyGrid());
      return `<button class="mls-cast-row ${member.id === current.id ? "on" : ""}" data-do="week-who" data-id="${member.id}" style="--c:${colourFor(member.id)}">
      <span class="face">${member.card.avatar ? `<img src="${escape(member.card.avatar)}" alt="" loading="lazy">` : escape((member.card.name[0] ?? "?").toUpperCase())}</span>
      <span class="what"><b>${escape(member.card.name)}</b><small>${draft.show?.showSchedules === "hidden" && !draft.peek?.weeks?.[member.id] ? "hidden" : `${member.pick.fromModel === true ? "from their card" : member.pick.fromModel === false ? "changed by you" : "a basic week"}${free ? ` \xB7 ${free}h free` : ""}`}</small></span>
    </button>`;
    },
    dayColumn = (dayIndex) => {
      const cells = [];
      for (let hour = 0; hour < 24; hour++) {
        const cell = grid[dayIndex][hour];
        if (!cell) {
          cells.push(`<div class="c" data-do="week-day" data-id="${dayIndex}"></div>`);
          continue;
        }
        const prev = hour ? grid[dayIndex][hour - 1] : grid[(dayIndex + 6) % 7][23],
          isHead = !prev || prev.place !== cell.place || prev.doing !== cell.doing || !!prev.sleep != !!cell.sleep,
          placeLabel =
            places.find((place) => place.id === cell.place)?.name ??
            (cell.place === "away" ? "Out of town" : cell.place),
          label = cell.sleep
            ? `\u{1F4A4} Asleep<small>${escape(placeLabel)}</small>`
            : escape(placeLabel) + (cell.doing ? `<small>${escape(cell.doing)}</small>` : "");
        cells.push(`<div class="c on ${isHead ? "head" : ""} ${cell.sleep ? "sleep" : ""}" style="--c:${placeColour(cell.place)}"
        data-do="week-day" data-id="${dayIndex}">${isHead ? label : ""}</div>`);
      }
      return cells.join("");
    },
    hourOptions = (selected, offset = 0) =>
      Array.from(
        {
          length: 24,
        },
        (_unused, i) => i + offset,
      )
        .map((hour) => `<option value="${hour}" ${hour === selected ? "selected" : ""}>${hourLabel(hour)}</option>`)
        .join(""),
    blocks = blocksOf(grid, day),
    blockRow = (block, index) => `
    <div class="mls-line ${block.sleep ? "sleep" : ""}" style="--c:${placeColour(block.place)}">
      <span class="w">From</span><select data-do="week-from" data-id="${index}">${hourOptions(block.from)}</select>
      <span class="w">to</span><select data-do="week-to" data-id="${index}">${hourOptions(block.to === 24 ? 24 : block.to, 1)}</select>
      ${block.wraps ? '<span class="next">NEXT MORNING</span>' : ""}
      <span class="w">at the</span>
      <select class="place" data-do="week-place" data-id="${index}">${places.map((place) => `<option value="${place.id}" ${place.id === block.place ? "selected" : ""}>${escape(place.name)}</option>`).join("")}</select>
      <span class="w">doing</span><input type="text" data-do="week-doing" data-id="${index}" value="${escape(block.doing)}" maxlength="40" placeholder="nothing in particular">
      <label class="mls-zz ${block.sleep ? "on" : ""}"><input type="checkbox" data-do="week-sleep" data-id="${index}" ${block.sleep ? "checked" : ""}>\u{1F4A4} ASLEEP</label>
      <button class="x" data-do="week-clear-block" data-id="${index}" title="Take these hours out">\u2715</button>
    </div>`,
    gaps = gapsOfDay(grid, day),
    wrapsIn = startsYesterday(grid, day);
  return `
    <div class="mls-create mls-weekstep">
      <nav class="mls-index">
        ${
          rail
            ? `<h1>NEW<br>LIFE</h1>${rail}<div class="lbl mls-cast-weeks">CAST WEEKS</div>`
            : `${addingTag(draft)}
        <h1>THE<br>WEEK</h1>`
        }
        ${members.length > 8 ? `<input class="mls-week-find" type="text" data-do="week-find" placeholder="Find someone\u2026" value="${escape(draft.weekFind ?? "")}">` : ""}
        <div class="mls-cast-list">${filtered.map(memberRow).join("") || '<p class="mls-hint">Nobody by that name.</p>'}</div>
        <div class="spacer"></div>
      </nav>

      <main>
        ${error ? `<div class="err">${escape(error)}</div>` : ""}
        ${rail ? '<p class="mls-where">THEIR WEEKS</p>' : ""}
        <section>
          <h2>${escape(memberName.toUpperCase())}\u2019S WEEK <span>where ${escape(memberName)} is, hour by hour</span></h2>
          <p class="mls-lede">You'll find them where their week says. Empty hours are fine: they're just out of sight.</p>
        </section>

        ${
          covered
            ? `
        <section>
          <div class="mls-covered">
            <p>${escape(memberName)}\u2019s week is <b>hidden</b>, as you chose in RULES. ${current.pick.fromModel === true ? "The model wrote it from the card" : "Nobody has read the card yet, so it is a plain one"}; in the life you find out
              where ${escape(memberName)} goes by running into them.</p>
            <p class="small">Looking now only shows it on this screen: the life keeps it hidden either way.</p>
            <button class="mls-peek big" data-do="peek" data-what="weeks" data-id="${current.id}">SHOW ${escape(memberName.toUpperCase())}\u2019S WEEK \xB7 SPOILER</button>
          </div>
        </section>`
            : `
        ${
          peeked
            ? `<p class="mls-peeknote">Shown only here: in the life ${escape(memberName)}\u2019s week stays hidden.
          <button class="mls-peek" data-do="unpeek" data-what="weeks" data-id="${current.id}">HIDE AGAIN</button></p>`
            : ""
        }
        <section>
          <div class="lbl">1 \xB7 Where it comes from</div>
          <div class="mls-wrote">
            <p class="said">${current.pick.note ? `From ${escape(memberName)}\u2019s card: <em>\u201C${escape(current.pick.note)}\u201D</em>` : current.pick.weekProblem ? `${escape(memberName)}\u2019s week could not be written (${escape(current.pick.weekProblem)}), so this is a basic one.` : `${escape(memberName)} has not been read yet, so this is a basic week.`}</p>
            <div class="acts">
              ${current.pick.reading ? `<button class="mls-drop soft" data-do="week-cancel" data-id="${current.id}">READING\u2026 \xB7 CANCEL</button>` : `<button class="mls-drop" data-do="week-reread" data-id="${current.id}">WRITE IT AGAIN FROM THE CARD</button>`}
            </div>
          </div>
          <p class="mls-hint">Or start from a ready-made week:</p>
          <div class="mls-templates">
            ${(resources.templates ?? [])
              .map(
                (template) => `
              <button class="mls-template" data-do="week-template" data-id="${template.id}">
                <b>${escape(template.name)}</b><span>${escape(template.why)}</span></button>`,
              )
              .join("")}
          </div>
        </section>

        <section>
          <div class="lbl">2 \xB7 ${escape(memberName)}\u2019s week \xB7 click a day to change it</div>
          <div class="mls-weekwrap">
            <div class="mls-week">
              <div></div>
              ${WEEKDAYS.map((label, index) => `<button class="dh ${index === day ? "on" : ""}" data-do="week-day" data-id="${index}">${label}</button>`).join("")}
              <div class="hours">${Array.from(
                {
                  length: 24,
                },
                (_unused, hour) =>
                  `<div class="hh ${hour % 6 === 0 ? "mark" : ""}">${String(hour).padStart(2, "0")}</div>`,
              ).join("")}</div>
              ${WEEKDAYS.map((_unused, index) => `<div class="col ${index === day ? "on" : ""}">${dayColumn(index)}</div>`).join("")}
            </div>
          </div>
          <div class="mls-key">
            ${places.map((place) => `<span><i style="background:${placeColour(place.id)}"></i>${escape(place.name)}</span>`).join("")}
            <span><i class="sleep"></i>\u{1F4A4} asleep</span>
            <span><i class="none"></i>free</span>
          </div>
        </section>

        <section>
          <div class="mls-dayhead"><h3>${WEEKDAYS_LONG[day].toUpperCase()}</h3>
            <span class="lbl">${blocks.length} part${blocks.length === 1 ? "" : "s"}</span></div>
          <div class="mls-lines">
            ${blocks.length ? blocks.map(blockRow).join("") : `<p class="mls-gaps">Nothing written for ${WEEKDAYS_LONG[day]} \u2014 ${escape(memberName)} is nowhere all day.</p>`}
          </div>
          <button class="mls-addblock" data-do="week-add">+ ADD HOURS</button>
          <p class="mls-gaps">${wrapsIn ? `${WEEKDAYS_LONG[(day + 6) % 7]} night runs into this morning. ` : ""}${gaps.length ? `${escape(memberName)} is out of sight <b>${gaps.map((gap) => `${hourLabel(gap.from)}\u2013${hourLabel(gap.to)}`).join(" and ")}</b>.` : ""}</p>
          <div class="mls-after">
            <span class="lbl">Copy this day to</span>
            <button class="mls-drop" data-do="week-copy" data-id="all">Every day</button>
            <button class="mls-drop" data-do="week-copy" data-id="week">Mon\u2013Fri</button>
            <button class="mls-drop" data-do="week-copy" data-id="end">Sat &amp; Sun</button>
            <button class="mls-drop soft" data-do="week-copy" data-id="clear">Empty this day</button>
          </div>
        </section>
        `
        }
        ${
          bar ||
          actionBar(
            homelessNames.length
              ? `Where ${homelessNames.map((personName) => `<b>${escape(personName)}</b>`).join(", ")} live${homelessNames.length === 1 ? "s" : ""}`
              : "",
            `<button class="mls-back flat" data-do="back-to-cast">\u25C2 BACK TO THE CAST</button>
           ${startButton(draft, busy, busy || homelessNames.length)}`,
          )
        }
      </main>
    </div>`;
}

export { addBlock, clearBlock, copyDay, editBlock, weekView };
