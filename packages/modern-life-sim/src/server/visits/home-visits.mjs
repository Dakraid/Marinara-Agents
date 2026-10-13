// Waking, door invites, home activities and visit-line prompts
import { jobPromptLine } from "../jobs/town-jobs.mjs";
import { residencePromptLine } from "../housing/residences.mjs";
import { orientationPromptLines } from "../orientation/orientation.mjs";
import { TRAIT_BEHAVIOURS } from "../traits/traits.mjs";
import { RELATIONSHIP_STATUS_LABELS, bondTier, bondTierName, currentBondTierName } from "../relationships/bonds.mjs";
import { truncateAtSentence } from "../scenes/text-helpers.mjs";
import { toPlayerNote } from "../relationships/kin.mjs";
import { nowAndMemoriesBlock } from "../scenes/scene-engine.mjs";
import { gossipPromptBlock } from "../network/town-facts.mjs";

var WAKE_UP_MINUTES = 5;
var WOKEN_GRACE_MINUTES = 60;
var KNOCK_MINUTES = 1;
var KNOCK_FRIENDSHIP_TIER = 2;
var MIN_VISIT_MINUTES = 60;
var BOND_STATUS_RANK = {
  single: 0,
  ex: 0,
  dating: 1,
  partners: 2,
  living: 3,
  engaged: 4,
  married: 5,
};
var WAKE_REACTIONS = [
  {
    key: "fine",
    name: "Takes it well",
    hint: "Likely fine",
    how: "They take it well: a little sleepy, not bothered.",
    opens: 0.9,
  },
  {
    key: "grumble",
    name: "Grumbles",
    hint: "They will grumble",
    how: "They grumble about it, but they are up.",
    friendship: -1,
    opens: 0.7,
  },
  {
    key: "annoyed",
    name: "Annoyed",
    hint: "Risky \xB7 they will be annoyed",
    how: "They are annoyed at being woken.",
    friendship: -3,
    trust: -1,
    opens: 0.5,
  },
  {
    key: "bad",
    name: "Really not happy",
    hint: "Bad idea \xB7 they will be really unhappy",
    how: "They are really unhappy about it, and say so.",
    friendship: -5,
    trust: -2,
    opens: 0.3,
  },
];
var wakeReactionByKey = (key) => WAKE_REACTIONS.find((reaction) => reaction.key === key) ?? WAKE_REACTIONS[0];
function wakeReactionFor({ temper = 1, hour: hour, timesToday = 0 }) {
  let level = temper + (hour < 6 ? 1 : 0) + timesToday;
  return WAKE_REACTIONS[Math.min(WAKE_REACTIONS.length - 1, level)];
}
function wakeRiskHint({ word = "", hour: hour, timesToday = 0 }) {
  return [word, hour < 6 ? "the middle of the night" : "", timesToday ? `woken ${timesToday}\xD7 today` : ""]
    .filter(Boolean)
    .join(" \xB7 ");
}
var KEEPS_HOME_PRIVATE_REASONS = {
  reserved: "They keep their home to themselves, for now.",
  shy: "They'd rather nobody saw the place yet.",
  proud: "Not today. And don't read into it.",
};
function decideDoorInvite({
  bond: bond,
  traits: traits,
  word = "",
  minutesLeft: minutesLeft,
  leaveReason = "leaves",
  leavesAt = "",
  workingUntil = "",
  wokeBadly = false,
  roll = 0,
}) {
  if (workingUntil) {
    return {
      yes: false,
      why: `Working until ${workingUntil}.`,
      working: workingUntil,
    };
  }
  if (minutesLeft < MIN_VISIT_MINUTES) {
    return {
      yes: false,
      why:
        leaveReason === "sleep"
          ? `It's late for them: bed at ${leavesAt}.`
          : leaveReason === "work"
            ? `They start work at ${leavesAt}.`
            : `They head out at ${leavesAt}.`,
    };
  }
  if (wokeBadly) {
    return {
      yes: false,
      why: "You woke them: they're going back to bed.",
    };
  }
  if ((BOND_STATUS_RANK[bond.status] ?? 0) >= BOND_STATUS_RANK.dating) {
    return {
      yes: true,
      why: RELATIONSHIP_STATUS_LABELS[bond.status],
    };
  }
  let friendshipTier = bondTier(bond, "friendship");
  if (friendshipTier >= 3) {
    return {
      yes: true,
      why: bondTierName(bond, "friendship", friendshipTier),
    };
  }
  let privateReason = KEEPS_HOME_PRIVATE_REASONS[TRAIT_BEHAVIOURS.keepsHome(traits)];
  return privateReason
    ? {
        yes: false,
        why: privateReason,
        home: true,
      }
    : TRAIT_BEHAVIOURS.warmAtHome(traits) || roll < 0.5
      ? {
          yes: true,
          why: [bondTierName(bond, "friendship", friendshipTier), word].filter(Boolean).join(" \xB7 "),
          home: true,
        }
      : {
          yes: false,
          why: "They'd rather be alone tonight.",
          home: true,
        };
}
var HOME_ACTIVITIES = [
  {
    key: "watch",
    name: "Watch something together",
    minutes: 120,
    action: "time",
    friendship: 4,
    rest: 6,
  },
  {
    key: "cook",
    name: "Cook together",
    minutes: 60,
    action: "care",
    friendship: 3,
    trust: 1,
    food: 40,
    cooks: true,
  },
  {
    key: "play",
    name: "Play something",
    minutes: 60,
    action: "challenge",
    friendship: 4,
    skills: {
      charm: 2,
    },
  },
  {
    key: "music",
    name: "Music on, lie around and talk",
    minutes: 30,
    action: "deep",
    trust: 3,
    friendship: 1,
  },
  {
    key: "swim",
    name: "Swim in the pool",
    minutes: 45,
    action: "time",
    friendship: 3,
    rest: 6,
    slot: "pool",
  },
  {
    key: "garden",
    name: "Sit out in the garden",
    minutes: 30,
    action: "deep",
    trust: 2,
    friendship: 1,
    rest: 4,
    slot: "garden",
  },
  {
    key: "drinks",
    name: "Drinks at your bar",
    minutes: 30,
    action: "time",
    friendship: 3,
    slot: "bar",
  },
  {
    key: "console",
    name: "Play the console",
    minutes: 60,
    action: "challenge",
    friendship: 4,
    slot: "console",
  },
  {
    key: "train",
    name: "Work out together",
    minutes: 60,
    action: "challenge",
    friendship: 2,
    skills: {
      fitness: 12,
    },
    slot: "gym",
  },
];
var THEIR_THING_ACTIVITIES = {
  tea: {
    name: "Tea, and talk until late",
    minutes: 120,
    action: "time",
    trust: 4,
    friendship: 3,
  },
  dance: {
    name: "Dance in the living room",
    minutes: 30,
    action: "flirt",
    romance: 5,
    friendship: 1,
    lock: {
      axis: "romance",
      tier: 2,
    },
  },
  read: {
    name: "Read side by side, in silence",
    minutes: 60,
    action: "space",
    trust: 5,
  },
  cook: {
    name: "They cook for you",
    minutes: 60,
    action: "reliable",
    friendship: 3,
    trust: 3,
    food: 50,
  },
  new: {
    name: "Try something new together",
    minutes: 90,
    action: "novelty",
    friendship: 5,
    skills: {
      charm: 1,
    },
  },
  lookAfter: {
    name: "Let them look after you",
    minutes: 60,
    action: "care",
    trust: 4,
    rest: 25,
    lock: {
      axis: "trust",
      tier: 2,
    },
  },
  game: {
    name: "A competitive game, for real",
    minutes: 60,
    action: "challenge",
    friendship: 5,
  },
  hobby: {
    name: "They show you their hobby",
    minutes: 60,
    action: "deep",
    trust: 5,
    friendship: 2,
    lock: {
      axis: "trust",
      tier: 2,
    },
  },
  help: {
    name: "Help with what they \xABdon't need\xBB",
    minutes: 60,
    action: "reliable",
    trust: 4,
    friendship: 2,
  },
  candles: {
    name: "Dinner by candlelight",
    minutes: 120,
    action: "date",
    romance: 7,
    trust: 2,
    food: 50,
    lock: {
      status: "dating",
    },
  },
  fix: {
    name: "Fix something together",
    minutes: 60,
    action: "reliable",
    trust: 4,
    skills: {
      knowledge: 1,
    },
  },
  quiet: {
    name: "A quiet night, just you two",
    minutes: 120,
    action: "time",
    romance: 5,
    trust: 3,
    rest: 8,
    lock: {
      status: "dating",
    },
  },
};
var ARCHETYPE_THEIR_THING = {
  slowBurn: "tea",
  flirt: "dance",
  guarded: "read",
  devoted: "cook",
  freeSpirit: "new",
  caretaker: "lookAfter",
  rival: "game",
  shy: "hobby",
  prickly: "help",
  romantic: "candles",
  grounded: "fix",
  possessive: "quiet",
};
var theirThingFor = (bond, character) =>
  THEIR_THING_ACTIVITIES[bond?.theirThing]
    ? bond.theirThing
    : (ARCHETYPE_THEIR_THING[character?.archetype?.main] ?? "fix");
var STAY_OVER_ACTIVITY = {
  from: "dating",
  action: "date",
  romance: 3,
  trust: 3,
};
var capitalizeAxisName = (axis) => `${axis[0].toUpperCase()}${axis.slice(1)}`;
function activityLockReason(bond, lock) {
  return lock
    ? lock.status
      ? (BOND_STATUS_RANK[bond.status] ?? 0) >= BOND_STATUS_RANK[lock.status]
        ? ""
        : `Unlocks when you're ${lock.status}`
      : bondTier(bond, lock.axis) >= lock.tier
        ? ""
        : `Unlocks when ${capitalizeAxisName(lock.axis)} reaches ${bondTierName(bond, lock.axis, lock.tier)}`
    : "";
}
function buildHomeActivities(
  bond,
  theirThing,
  { minutesLeft = 1 / 0, busy = "", cook = "", whose = "your", cooks = false, homeSlots = [], cookMinutes = null } = {},
) {
  let buildActivity = (activity, key, theirs2) => {
      let lockReason = activityLockReason(bond, activity.lock),
        minutes = activity.cooks && whose === "your" && cookMinutes !== null ? cookMinutes : activity.minutes,
        why = busy || lockReason || (activity.cooks && cook) || (minutes > minutesLeft ? "Not enough time" : "");
      return {
        key: key,
        theirs: theirs2,
        name: activity.name,
        minutes: activity.minutes,
        action: activity.action,
        bonds: Object.fromEntries(
          ["friendship", "romance", "trust"].filter((axis) => activity[axis]).map((axis) => [axis, activity[axis]]),
        ),
        skills: activity.skills ?? {},
        rest: activity.rest ?? 0,
        food: activity.food ?? 0,
        uses: activity.cooks ? `${whose} food` : "",
        kitchen: !!activity.cooks && whose === "your",
        locked: !!lockReason,
        available: !why,
        why: why,
      };
    },
    theirs = THEIR_THING_ACTIVITIES[theirThing],
    cookOffer = cooks && theirThing !== "cook" ? [buildActivity(THEIR_THING_ACTIVITIES.cook, "cooks", true)] : [];
  return [
    ...HOME_ACTIVITIES.filter((activity) => !activity.slot || homeSlots.includes(activity.slot)).map((activity) =>
      buildActivity(activity, activity.key, false),
    ),
    ...(theirs ? [buildActivity(theirs, "theirs", true)] : []),
    ...cookOffer,
  ];
}
function stayOverBlockedReason(bond, { turnsIn: turnsIn }) {
  return (BOND_STATUS_RANK[bond.status] ?? 0) < BOND_STATUS_RANK[STAY_OVER_ACTIVITY.from]
    ? "Once you're dating"
    : turnsIn
      ? ""
      : "Only when they turn in for the night";
}
function visitLinePrompt(
  character,
  bond,
  {
    moment: moment,
    player = "the player",
    language = "English",
    tone = "",
    setting = "",
    memories = [],
    knows = [],
    content = "",
    now = "",
    ahead = [],
  } = {},
) {
  let standing = [
    `Friendship: ${currentBondTierName(bond, "friendship") ?? "Acquaintance"}`,
    `Romance: ${currentBondTierName(bond, "romance") ?? "\u2014"}${bond.romanceable === false || bond.justFriends ? " (romance with the player is off the table for them)" : ""}`,
    `Trust: ${currentBondTierName(bond, "trust") ?? "Wary"}`,
    `Relationship: ${RELATIONSHIP_STATUS_LABELS[bond.status] ?? "Single"}`,
  ].join(`
`);
  return [
    {
      role: "system",
      content: [
        "Task: visit-line",
        `A moment between ${player} and ${character.name} in a modern life sim. What happened is already decided:`,
        moment,
        "",
        'Answer with JSON only, exactly: {"line":"\u2026","remember":"\u2026"}',
        "`line`: what THEY say right then, first person, one or two sentences. No narration, no stage directions, no quotation marks.",
        `\`remember\`: what they will keep of this moment, one complete sentence in the third person that names ${player}.`,
        "Never write what the player says, does or thinks.",
        "Never set a day or a time to meet, and never ask the player to promise to show up somewhere: the game cannot keep appointments.",
        content || "Keep it non-explicit.",
        "Match how well they know the player: an acquaintance does not talk like a best friend.",
        `Write both in ${language}.`,
      ].join(`
`),
    },
    {
      role: "user",
      content: [
        setting
          ? `THE SETTING:
${setting}
`
          : "",
        `THE CHARACTER:
Name: ${character.name}
${character.description ?? ""}${
          orientationPromptLines(character)
            ? `
${orientationPromptLines(character)}`
            : ""
        }${
          character.home
            ? `
${residencePromptLine(character.home)}`
            : ""
        }${
          character.work
            ? `
${jobPromptLine(character.work)}`
            : ""
        }${
          character.toYou
            ? `
${toPlayerNote(character.toYou)}`
            : ""
        }${
          tone
            ? `
How they come across: ${tone}`
            : ""
        }`,
        `
WHERE THEY STAND WITH ${player.toUpperCase()}:
${standing}`,
        nowAndMemoriesBlock({
          now: now,
          memories: memories,
          ahead: ahead,
          player: player,
        }),
        gossipPromptBlock(knows, player),
      ].filter(Boolean).join(`
`),
    },
  ];
}
var clipVisitLineText = truncateAtSentence;
function parseVisitLine(raw) {
  let line = clipVisitLineText(raw?.line, 240);
  if (!line) {
    throw new Error("The model did not write what they say.");
  }
  return {
    line: line,
    remember: clipVisitLineText(raw?.remember, 240),
  };
}
async function askVisitLine(llm, character, bond, options) {
  let { json: json } = await llm.askJson(visitLinePrompt(character, bond, options), {
    maxTokens: 300,
    task: "visit-line",
    about: character.name,
  });
  return parseVisitLine(json);
}
function describeVisitDish(dish, { name: personName, player: player }) {
  let who =
      dish.by === "them"
        ? `${personName} cooked ${dish.name.toLowerCase()} for ${player}`
        : dish.by === "both"
          ? `they cooked ${dish.name.toLowerCase()} together`
          : `${player} cooked ${dish.name.toLowerCase()}`,
    quality =
      {
        burnt: "it came out a little burnt, and it shows",
        fine: "it came out fine",
        great: "it came out delicious",
      }[dish.quality] ?? "it came out fine",
    tasteText =
      dish.verdict === "liked"
        ? `; ${dish.taste} food, which ${personName} loves`
        : dish.verdict === "disliked"
          ? `; ${dish.taste} food, which ${personName} does not like`
          : "";
  return `${who[0].toUpperCase()}${who.slice(1)}, and they ate it: ${quality}${tasteText}.`;
}
function describeVisitMoment(moment, { name: personName, player = "the player", time = "" }) {
  if (moment.kind === "wake") {
    let reaction = wakeReactionByKey(moment.outcome);
    return `${player} woke ${personName} up at ${time}${moment.door ? " by knocking on their door until they opened" : " at home"}. ${reaction.how}`;
  }
  if (moment.kind === "door") {
    let inviteText = moment.invite?.yes
      ? `${personName} asks ${player} in.`
      : moment.invite?.working
        ? `${personName} is working right now, until ${moment.invite.working}, and does not ask ${player} in.`
        : `${personName} does not ask ${player} in today: ${moment.invite?.why ?? ""}`;
    return `${player} knocked on ${personName}'s door at ${time} and ${personName} answered it.${moment.outcome ? ` ${player} had woken them. ${wakeReactionByKey(moment.outcome).how}` : ""} ${inviteText}`;
  }
  if (moment.kind === "together") {
    return `${player} and ${personName} spent ${moment.minutes >= 60 ? `${Math.round(moment.minutes / 6) / 10} hours` : `${moment.minutes} minutes`} together at ${moment.home === "theirs" ? `${personName}'s home` : moment.home === "shared" ? `the home ${personName} and ${player} share` : `${player}'s home`}: ${moment.name.toLowerCase()}.${
      moment.dish
        ? ` ${describeVisitDish(moment.dish, {
            name: personName,
            player: player,
          })}`
        : " It went well."
    } The line is what they say as it ends.`;
  }
  if (moment.kind === "stay") {
    return `${player} stayed the night ${moment.where ? `with ${personName} ${moment.where}` : `at ${personName}'s place`} and they have just woken up together. The line is what they say in the morning.`;
  }
  if (moment.kind === "sleepover") {
    return `${personName}${moment.with?.length ? ` and ${moment.with.join(" and ")}` : ""} stayed the night at ${player}'s after the party and ${moment.with?.length ? "are" : "is"} waking up now, at ${time}. The line is what ${personName} says, a little rumpled, before heading home, as ${personName} would.`;
  }
  if (moment.kind === "party-arrive") {
    return `${personName}${moment.with?.length ? ` and ${moment.with.join(" and ")}` : ""} arrive${moment.with?.length ? "" : "s"} at ${player}'s party at ${time}, and ${player} lets them in. The line is what ${personName} says at the door, coming in, as ${personName} would.`;
  }
  if (moment.kind === "goodbye") {
    let stayedMinutes = Math.max(0, (moment.at ?? 0) - (moment.since ?? moment.at ?? 0)),
      duration = stayedMinutes >= 60 ? `${Math.round(stayedMinutes / 6) / 10} hours` : `${stayedMinutes} minutes`,
      didText = (moment.did ?? []).length
        ? `Together they did: ${moment.did.join(", ").toLowerCase()}.`
        : "They just spent the time talking.";
    if (moment.yours) {
      return `${personName} was over at ${player}'s home for ${duration}, until ${time}. ${didText} ${moment.why === "you" ? `${player} sees them out now` : `${personName} has to go home now`}. The line is what ${personName} says to say goodbye, as ${personName} would.`;
    }
    let leaving =
      moment.why === "bed"
        ? `${personName} is going to bed now`
        : moment.why === "out"
          ? `${personName} has to head out now`
          : moment.why === "work"
            ? `${personName} has to start work now`
            : `${player} is leaving now`;
    return `${player} was at ${personName}'s home for ${duration}, until ${time}. ${didText} ${leaving}. The line is what ${personName} says to say goodbye, as ${personName} would.`;
  }
  return "";
}

export {
  ARCHETYPE_THEIR_THING,
  KNOCK_FRIENDSHIP_TIER,
  KNOCK_MINUTES,
  STAY_OVER_ACTIVITY,
  THEIR_THING_ACTIVITIES,
  WAKE_UP_MINUTES,
  WOKEN_GRACE_MINUTES,
  askVisitLine,
  buildHomeActivities,
  decideDoorInvite,
  describeVisitMoment,
  stayOverBlockedReason,
  theirThingFor,
  wakeReactionFor,
  wakeRiskHint,
};
