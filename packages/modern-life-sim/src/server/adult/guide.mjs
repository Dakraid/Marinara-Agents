// In-game guide articles for the Adult module
import { BOND_TIER_NAMES } from "../relationships/bonds.mjs";
import {
  CASUAL_INTIMACY_MIN_ROMANCE_TIER,
  CLUB_PLACE,
  CLUB_SHOW_ACTIVITY,
  HOTEL_PLACE,
  HOTEL_ROOM_PRICE,
  INTIMATE_PASSAGES_BY_DETAIL,
  PRIVATE_DANCE_OFFER,
} from "./tuning.mjs";
import { INTIMACY_LIKES_MAX, INTIMACY_LIMITS_MAX } from "./intimacy-ways.mjs";
import { SPOT_BAN_DAYS, SPOT_FINE } from "./spots.mjs";

var guideButtonLabel = (label) => `\u27E6${label}\u27E7`;
var formatGuideDollars = (amount) => `$${amount.toLocaleString("en-US")}`;
var ADULT_GUIDE_CATEGORY = {
  id: "adult",
  name: "Adult",
};
var ADULT_GUIDE_ARTICLES = [
  {
    id: "adult-module",
    cat: "adult",
    title: "The Adult module",
    words: "adult module intimacy explicit fade pictures switch on",
    text: [
      `An extra you can switch on for a life: intimacy with adult characters, when the relationship is there. Turn it on in ${guideButtonLabel("MODULES")} when you create a life, or later in ${guideButtonLabel("SETTINGS")} \xB7 ${guideButtonLabel("RULES")}. Off, it's as if it didn't exist.`,
      `Its panel asks you to confirm ${guideButtonLabel("I'm an adult")}, how much is written (${guideButtonLabel("Explicit")}, or ${guideButtonLabel("Fade out")} right at the moment) and ${guideButtonLabel("How many pictures")}.`,
      `It's only ever between adults. If someone's card doesn't make their age clear, you can say so yourself in their ${guideButtonLabel("ADULT")} tab.`,
    ],
    see: ["adult-when", "adult-night"],
  },
  {
    id: "adult-when",
    cat: "adult",
    title: "When it can happen",
    words: "sleep together when dating single smitten once a day no ask engagement wedding night honeymoon",
    text: [
      `When you're dating and have already kissed, or further along. Outside a relationship, only with someone who isn't the faithful type, once they're ${guideButtonLabel(BOND_TIER_NAMES.romance[CASUAL_INTIMACY_MIN_ROMANCE_TIER])}; some people never do it without being together.`,
      `Ask from their ${guideButtonLabel("SPECIAL ACTIONS")} with ${guideButtonLabel("Sleep together")}, or just say it in a scene ([[your-words]]). Alone with you somewhere private, they may ask first \u2014 though once you've slept together, they give it a day or a few before asking again: the sooner, the more they like to make the first move. And a date that goes really well can end somewhere else ([[outing]]).`,
      "Once a day with the same person. If they say no, give it a few days.",
      "The big nights are always open: your engagement, your wedding night and every night of the honeymoon. And if you'd rather just sleep, that's fine too.",
    ],
    see: ["adult-where", "adult-night", "steps"],
  },
  {
    id: "adult-where",
    cat: "adult",
    title: "Where",
    words: "where place home hotel midnight inn car private go together",
    text: [
      `Somewhere private: your place, theirs, a room at the ${guideButtonLabel(HOTEL_PLACE.name)} (${formatGuideDollars(HOTEL_ROOM_PRICE)}), your car at night, or their work once it's closed.`,
      "If you're somewhere else, you ask them right there, and if they say yes, you go together.",
      "If someone else lives there and is home, keep it down: they might hear you, and then they know.",
      "Feeling bolder? See [[adult-risky]].",
    ],
    see: ["adult-night", "adult-risky"],
  },
  {
    id: "adult-night",
    cat: "adult",
    title: "How it goes",
    words: "scene parts options stop here first time not now stay the night wake up",
    text: [
      `With ${guideButtonLabel("Explicit")}, it's told in ${INTIMATE_PASSAGES_BY_DETAIL.explicit} long parts, from how it begins, through all of it, to the after; with ${guideButtonLabel("Fade out")}, in one that fades out at the moment and picks up after. After each part, pick how it goes on, or write it yourself.`,
      `Before it starts, ${guideButtonLabel("Stop here")} costs nothing. Once it has, you can ${guideButtonLabel("END SCENE")} between parts: it ends there, and it still counts as a time together.`,
      "The first time with someone brings you a lot closer; after that, a little each time. Someone who's always after something new gets bored if it's too often.",
      `If they ask and you say ${guideButtonLabel("Not now")}, it can hurt, depending on who they are. Less after a great date.`,
      `At night, at your place, theirs or the hotel, you can ${guideButtonLabel("Stay the night")} afterwards and wake up together.`,
    ],
    see: ["adult-ways", "adult-group"],
  },
  {
    id: "adult-ways",
    cat: "adult",
    title: "How they are in bed",
    words: "likes limits ways lead pace tender playful shy daring",
    text: [
      `Everyone's different: some like to lead, some take it slow, some are tender or playful, shy or sure of themselves, cautious or daring. Some have up to ${INTIMACY_LIKES_MAX} things they love and ${INTIMACY_LIMITS_MAX} limits of their own, straight from their card.`,
      `You learn how they are after your first time together, and what they love or won't do the first time it comes up. It all goes in their ${guideButtonLabel("ADULT")} tab.`,
      `Something they love brings you closer. Hit a limit and they'll stop you, and it costs a little trust; with time and trust, limits can change. You can adjust all of it in ${guideButtonLabel("SETTINGS")} \xB7 ${guideButtonLabel("CAST")}.`,
    ],
    see: ["adult-night", "personality"],
  },
  {
    id: "adult-group",
    cat: "adult",
    title: "More than two",
    words: "group three several who else call",
    text: [
      `With ${guideButtonLabel("Multiple relationships")} on, ${guideButtonLabel("Sleep together")} first asks ${guideButtonLabel("Who else?")}: someone who's there, or someone you call over, who comes if they're free.`,
      "Everyone has to want it, and they all have to get along: no rivals, exes or family. Afterwards, they're closer to each other too.",
    ],
    see: ["several", "adult-night"],
  },
  {
    id: "adult-risky",
    cat: "adult",
    title: "Riskier spots",
    words: "risky spot bathroom showers caught fine banned daring",
    text: [
      `Some places have a spot for it: the Caf\xE9's bathroom, the gym's showers, behind the trees in the Park\u2026 When you're there together, it's the first option in ${guideButtonLabel("Where?")}, with how risky it is.`,
      "Not everyone's up for it: the cautious say no, others only if it's a little risky, the bold always.",
      `Getting caught is rare, but it happens: you're not welcome there for ${SPOT_BAN_DAYS} days, and there's a ${formatGuideDollars(SPOT_FINE)} fine in ${guideButtonLabel("BILLS")}. At your own work, it's a warning instead. And with someone bold, getting away with it brings you even closer.`,
    ],
    see: ["adult-where"],
  },
  {
    id: "adult-club",
    cat: "adult",
    title: `The ${CLUB_PLACE.name}`,
    words: "scarlet club strip club show private dance vip room nightlife seen partner",
    text: [
      `A strip club on the nightlife street, open from ${CLUB_PLACE.open}:00 to ${CLUB_PLACE.close}:00. Go in and ${guideButtonLabel(CLUB_SHOW_ACTIVITY.name)} (${formatGuideDollars(CLUB_SHOW_ACTIVITY.costs)}).`,
      `Ask one of tonight's dancers for ${guideButtonLabel("A private dance")} (${formatGuideDollars(PRIVATE_DANCE_OFFER.price)}): a room of your own, and the song is yours. The club's own dancers are only there with ${guideButtonLabel("The club's dancers")} ticked; without it, only someone you know who dances there.`,
      "Its VIP room is one of the riskier spots, if you're there with someone bold enough.",
      `Some of your cast may work there: dancing, behind the bar or at the door, if their card says so, or if you set it in ${guideButtonLabel("SETTINGS")} \xB7 ${guideButtonLabel("CAST")}. A dance with someone you know brings you closer, and word of it gets around.`,
      "Someone you know might see you there, and word gets around. If your partner finds out and minds, they'll bring it up: you can play it down, say sorry, or ask them to come with you next time. If they work there, it's just their work \u2014 but a dance from someone else still counts as flirting.",
    ],
    see: ["adult-npcs", "adult-risky", "adult-where"],
  },
  {
    id: "adult-npcs",
    cat: "adult",
    title: "NPCs",
    words: "npc staff dancers regulars club people not cast remember tag rules option",
    text: [
      `Not everyone you meet is part of your cast. Some people belong to a place, like the dancers of the ${CLUB_PLACE.name}: they're NPCs, and they wear an ${guideButtonLabel("NPC")} tag.`,
      `You only find them where they work. They're not in ${guideButtonLabel("CONTACTS")} and they don't hear the town's news, but they remember you: come back for another dance and they'll know.`,
      `They're only around with ${guideButtonLabel("NPCs")} on in ${guideButtonLabel("RULES")}, and each with its own box in the Adult card: ${guideButtonLabel("The club's dancers")}, and ${guideButtonLabel("The club's regulars")}, the club's customers in ${guideButtonLabel("After dark")}. Turn one off and they step aside; turn it back on and they're back, as they were.`,
    ],
    see: ["adult-club"],
  },
  {
    id: "adult-after-dark",
    cat: "adult",
    title: "After dark",
    words: "after dark cast each other together watch spy follow take a look phone app memories party couple",
    text: [
      `What your cast gets up to with each other. It's off until you switch it on: ${guideButtonLabel("After dark")}, in the Adult card of ${guideButtonLabel("SETTINGS")} \xB7 ${guideButtonLabel("RULES")}.`,
      "Two of them who meet up, a couple who live together, two who slip off at a party. It depends on how they are with each other: a couple more often, two who like each other now and then. Only ever between adults, and only what both of them want.",
      `When it happens and you're not there, ${guideButtonLabel("AFTER DARK")} comes up: watch it now, or later. All of it stays in ${guideButtonLabel("AFTER DARK")} on your phone, to watch again.`,
      `When you're right there, you can ${guideButtonLabel("Follow")} them or ${guideButtonLabel("Take a look")}. Keep watching, slip away before they see you, join them if they both want you there, or let them see you.`,
      `They remember it, with each other, and you can read it in their ${guideButtonLabel("MEMORIES")}. What they tell you about it is up to them.`,
    ],
    see: ["adult-group", "adult-module"],
  },
];
var adultGuide = () => ({
  categories: [ADULT_GUIDE_CATEGORY],
  articles: ADULT_GUIDE_ARTICLES,
});

export { adultGuide };
