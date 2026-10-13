// Relationship milestone scene definitions and reconcile rules
import { defineEvent } from "../events/event-registry.mjs";
import { specialEventMilestones } from "./special-events.mjs";

var MILESTONE_COUPLE_STATUSES = ["dating", "partners", "living", "engaged", "married"];
var INITIATIVE_ASK_CHANCES = [0, 0.1, 0.25, 0.45];
var TALK_TRUST_FLOOR = 10;
var milestoneBeats = ({
  moment = false,
  momentImage = false,
  options = ["step", "wait"],
  resultImage = "accepted",
  turns = 6,
} = {}) => [
  {
    type: "turns",
    min: 1,
    max: turns,
  },
  ...(moment
    ? [
        {
          type: "moment",
          keyImage: momentImage,
        },
      ]
    : []),
  {
    type: "choice",
    options: options,
  },
  {
    type: "result",
    keyImage: resultImage,
  },
];
var PARTNER_PAIR_MILESTONES = ["partners-tease", "partners-compete", "partners-argue", "partners-plan"];
var MILESTONES = {
  "ask-out": {
    to: "dating",
    by: "both",
    order: 1,
    retired: true,
    title: (characterName) => `Ask ${characterName} out`,
    mine: "In this scene the player asks them out: to start dating.",
    theirs: "In this scene they ask the player out, themselves: to start dating.",
    not: "No kiss yet, no 'I love you', no talk of being a couple for good.",
    def: defineEvent({
      id: "ask-out",
      family: "milestone",
      label: "Asking them out",
      beats: milestoneBeats(),
    }),
  },
  "first-kiss": {
    flag: "firstKiss",
    after: true,
    by: "both",
    order: 2,
    title: (characterName) => `Kiss ${characterName}`,
    mine: "In this scene the two of them, already dating, kiss for the first time.",
    theirs: "In this scene they kiss the player for the first time: they are the one who leans in.",
    not: "Only the kiss: nothing further, no declarations of love.",
    def: defineEvent({
      id: "first-kiss",
      family: "milestone",
      label: "A first kiss",
      beats: milestoneBeats({
        turns: 4,
        moment: true,
        momentImage: true,
      }),
    }),
  },
  partners: {
    to: "partners",
    by: "both",
    order: 3,
    title: (characterName) => `Ask ${characterName} to be your partner`,
    mine: "In this scene the player asks them to be their partner: a couple, not just dating.",
    theirs: "In this scene they ask the player to be their partner: a couple, not just dating.",
    not: "No moving in, no marriage.",
    def: defineEvent({
      id: "partners",
      family: "milestone",
      label: "Making it official",
      beats: milestoneBeats(),
    }),
  },
  "move-in": {
    to: "living",
    by: "both",
    order: 4,
    where: true,
    title: (characterName) => `Ask ${characterName} to move in`,
    mine: "In this scene the player asks them to move in together.",
    theirs: "In this scene they ask the player to move in together.",
    not: "No proposal, no marriage.",
    def: defineEvent({
      id: "move-in",
      family: "milestone",
      label: "Moving in",
      beats: milestoneBeats({
        options: ["yours", "theirs", "wait"],
      }),
    }),
  },
  propose: {
    to: "engaged",
    by: "both",
    order: 5,
    menu: "special",
    after: true,
    title: (characterName) => `Propose to ${characterName}`,
    mine: "In this scene the player asks them to marry them, with a ring.",
    theirs: "In this scene they ask the player to marry them, with a ring they chose themselves.",
    not: "The wedding is not now: only the question, and the answer.",
    def: defineEvent({
      id: "propose",
      family: "milestone",
      label: "The proposal",
      beats: milestoneBeats({
        moment: true,
        momentImage: true,
      }),
    }),
  },
  wedding: {
    to: "married",
    by: "you",
    order: 6,
    later: true,
    title: () => "The wedding",
    mine: "Their wedding day: the two of them, the vows, the people who came.",
    not: "",
    def: defineEvent({
      id: "wedding",
      family: "milestone",
      label: "The wedding",
      beats: milestoneBeats({
        turns: 4,
      }),
    }),
  },
  reconcile: {
    to: "dating",
    from: "ex",
    by: "both",
    order: 1,
    menu: "special",
    title: () => "Ask to be together again",
    mine: "In this scene the player asks their ex to give it another try: to get back together.",
    theirs: "In this scene they ask the player, their ex, to give it another try: to get back together.",
    not: "Getting back together is dating again, no more: no moving in, no marriage; what went wrong between them is not forgotten.",
    def: defineEvent({
      id: "reconcile",
      family: "milestone",
      label: "Getting back together",
      beats: milestoneBeats(),
    }),
  },
  "break-up": {
    by: "you",
    special: true,
    title: () => "Break up",
    mine: "In this scene the player breaks up with them.",
    not: "",
    def: defineEvent({
      id: "break-up",
      family: "milestone",
      label: "Breaking up",
      beats: milestoneBeats({
        turns: 3,
        options: ["go", "stay"],
        resultImage: false,
      }),
    }),
  },
  "open-ask": {
    by: "you",
    special: true,
    title: () => "Ask to see someone else",
    mine: "In this scene the player asks them whether it is okay to see someone else too. They answer true to who they are; the player makes the call at the end.",
    not: "",
    def: defineEvent({
      id: "open-ask",
      family: "milestone",
      label: "Asking to see someone else",
      beats: milestoneBeats({
        turns: 4,
        resultImage: false,
      }),
    }),
  },
  "friend-opinion": {
    by: "them",
    special: true,
    after: true,
    title: (characterName) => `${characterName} has something to say`,
    theirs:
      "In this scene a friend of the player's comes to say what they think about the player's love life (below). They say it true to who they are; the player answers at the end.",
    not: "It is only an opinion: nobody breaks up or makes a decision for the player here.",
    def: defineEvent({
      id: "friend-opinion",
      family: "milestone",
      label: "Something to say",
      beats: milestoneBeats({
        turns: 4,
        options: ["agree", "defend"],
        resultImage: false,
      }),
    }),
  },
  "see-ring": {
    by: "them",
    special: true,
    title: () => "They came to see the ring",
    theirs:
      "They heard the player got engaged and came to congratulate them, see the ring and hear how it happened, true to who they are. The player decides at the end how much to tell.",
    not: "Nobody else is getting engaged; it is a happy, short visit.",
    def: defineEvent({
      id: "see-ring",
      family: "milestone",
      label: "The ring",
      beats: milestoneBeats({
        turns: 3,
        options: ["show", "modest"],
        resultImage: false,
      }),
    }),
  },
  "their-confess": {
    by: "them",
    special: true,
    after: true,
    title: () => "They confess",
    theirs:
      "In this scene they finally tell the player how they feel: they like them, as more than a friend, and want to be together. It builds up to it, true to who they are; the player answers at the end.",
    not: "Dating is the step, no more: no moving in, no talk of forever.",
    def: defineEvent({
      id: "their-confess",
      family: "milestone",
      label: "A confession",
      beats: milestoneBeats({
        turns: 6,
      }),
    }),
  },
  "marry-ask": {
    by: "you",
    special: true,
    title: () => "Ask to marry someone else",
    mine: "In this scene the player asks them whether it is okay to marry someone else too: another of the player's partners, whom they already agreed the player could see. It is a big thing to ask. They answer true to who they are; the player makes the call at the end.",
    not: "Nobody is getting married in this scene: it is only asking.",
    def: defineEvent({
      id: "marry-ask",
      family: "milestone",
      label: "Asking to marry someone else",
      beats: milestoneBeats({
        turns: 4,
        resultImage: false,
      }),
    }),
  },
  confront: {
    by: "you",
    special: true,
    title: (characterName) => `Confront ${characterName}`,
    mine: "In this scene the player confronts them about someone else. They answer true to who they are: they may deny it, admit it, or be relieved it is out. They do not settle it: the player makes the call at the end.",
    not: "",
    def: defineEvent({
      id: "confront",
      family: "milestone",
      label: "Confronting them",
      beats: milestoneBeats({
        turns: 4,
        options: ["allow", "stop", "end"],
        resultImage: false,
      }),
    }),
  },
  "tells-you": {
    by: "them",
    special: true,
    title: () => "Something to tell you",
    theirs:
      "In this scene they come to tell the player something they saw: the player's partner with someone else (below). They say it true to who they are, and the player may ask them about it. They do not settle it: the player decides at the end what to do.",
    def: defineEvent({
      id: "tells-you",
      family: "milestone",
      label: "Something to tell you",
      beats: milestoneBeats({
        turns: 3,
        options: ["confront", "other", "breakup", "keep"],
        resultImage: false,
      }),
    }),
  },
  "talk-other": {
    by: "you",
    special: true,
    title: (characterName) => `Talk to ${characterName}`,
    mine: "In this scene the player talks to them about the player's partner, whom they have been seeing (below). They answer true to who they are. They do not settle it: the player makes the call at the end.",
    not: "",
    def: defineEvent({
      id: "talk-other",
      family: "milestone",
      label: "Talking to the other one",
      beats: milestoneBeats({
        turns: 4,
        options: ["stay-away", "let-be"],
        resultImage: false,
      }),
    }),
  },
  "hit-on": {
    by: "them",
    special: true,
    title: () => "Something to tell you",
    theirs:
      "In this scene they come to tell the player, before it reaches them some other way, that someone hit on them (below), and that they turned them down. They say it true to who they are. Nothing is to be decided: the talk simply goes on.",
    def: defineEvent({
      id: "hit-on",
      family: "milestone",
      label: "Someone hit on them",
      beats: milestoneBeats({
        turns: 3,
        options: ["on"],
        resultImage: false,
      }),
    }),
  },
  "who-was-that": {
    by: "them",
    special: true,
    title: () => "Who was that?",
    theirs:
      "They saw the player talking with someone (below). Nothing romantic happened, but it is eating at them, and they ask about it, true to who they are. They do not settle it: the player answers at the end.",
    def: defineEvent({
      id: "who-was-that",
      family: "milestone",
      label: "Who was that?",
      beats: milestoneBeats({
        turns: 3,
        options: ["explain", "brush"],
        resultImage: false,
      }),
    }),
  },
  "open-offer": {
    by: "them",
    special: true,
    title: () => "Seeing other people",
    theirs:
      "They bring up, easily, that the player and they could each see other people too: they would not mind at all, it is who they are. They do not settle it: the player answers at the end.",
    def: defineEvent({
      id: "open-offer",
      family: "milestone",
      label: "Seeing other people",
      beats: milestoneBeats({
        turns: 3,
        options: ["yes", "no"],
        resultImage: false,
      }),
    }),
  },
  "ice-over": {
    by: "them",
    special: true,
    title: () => "Talking it over",
    theirs:
      "Something the player did hurt them, and they kept away from the player for a few days. Now they come to talk it over, true to who they are: still sore, but willing. They do not settle it: the player answers at the end.",
    def: defineEvent({
      id: "ice-over",
      family: "milestone",
      label: "Talking it over",
      beats: milestoneBeats({
        turns: 3,
        options: ["apologize", "explain"],
        resultImage: false,
      }),
    }),
  },
  "missed-you": {
    by: "them",
    special: true,
    title: () => "I missed you",
    theirs:
      "They have not seen the player in days and they missed them, so they came to find them: glad, a little sore, true to who they are. They do not settle it: the player answers at the end.",
    def: defineEvent({
      id: "missed-you",
      family: "milestone",
      label: "I missed you",
      beats: milestoneBeats({
        turns: 3,
        options: ["stay", "busy"],
        resultImage: false,
      }),
    }),
  },
  "mate-in": {
    by: "both",
    special: true,
    after: true,
    title: (characterName) => `Ask ${characterName} to move in`,
    mine: "In this scene the player asks them to move in and share the player's home, as housemates: living together, nothing romantic.",
    theirs:
      "In this scene they ask the player if they could move in and share the player's home, as housemates: living together, nothing romantic. They do not settle it: the player answers at the end.",
    not: "Nothing romantic, no dating: sharing a home.",
    def: defineEvent({
      id: "mate-in",
      family: "milestone",
      label: "Moving in together",
      beats: milestoneBeats({
        turns: 4,
        resultImage: false,
      }),
    }),
  },
  "mate-out": {
    by: "you",
    special: true,
    title: (characterName) => `Ask ${characterName} to move out`,
    mine: "In this scene the player tells their housemate they would like them to move out and find a place of their own, and why; they take it true to who they are. The player can still take it back at the end.",
    not: "No fight that ends the friendship: a hard talk between people who live together.",
    def: defineEvent({
      id: "mate-out",
      family: "milestone",
      label: "Moving out",
      beats: milestoneBeats({
        turns: 4,
        options: ["go", "stay"],
        resultImage: false,
      }),
    }),
  },
  "mate-moment": {
    by: "them",
    special: true,
    after: true,
    title: () => "At home",
    theirs:
      "Something small happens at the home the player and they share (below), true to who they are, easy and everyday. They do not settle it: the player makes the call at the end.",
    def: defineEvent({
      id: "mate-moment",
      family: "milestone",
      label: "At home",
      beats: milestoneBeats({
        turns: 3,
        options: ["a", "b"],
        resultImage: false,
      }),
    }),
  },
  "drop-by": {
    by: "them",
    special: true,
    title: () => "Dropping by",
    theirs:
      "They dropped by the player's home without warning, for the reason below, and the player let them in: at the door or in the living room, easy, true to who they are. They do not settle it: at the end the player either has them stay a while or keeps it short.",
    def: defineEvent({
      id: "drop-by",
      family: "milestone",
      label: "Dropping by",
      beats: milestoneBeats({
        turns: 3,
        options: ["stay", "short"],
        resultImage: false,
      }),
    }),
  },
  "party-invite": {
    by: "them",
    special: true,
    title: () => "A party",
    theirs:
      "They are throwing a party at their place (below), and they invite the player, true to who they are. They do not settle it: the player answers at the end.",
    def: defineEvent({
      id: "party-invite",
      family: "milestone",
      label: "A party",
      beats: milestoneBeats({
        turns: 3,
        options: ["yes", "wait"],
        resultImage: false,
      }),
    }),
  },
  "party-first": {
    by: "them",
    special: true,
    title: () => "The first guest",
    theirs:
      "They are the first to arrive at the player's party (below), a little early, and the player lets them in: a short, easy talk before the others come, true to who they are. Nothing is to be decided: then the party gets going.",
    def: defineEvent({
      id: "party-first",
      family: "milestone",
      label: "The first guest",
      beats: milestoneBeats({
        turns: 2,
        options: ["on"],
        resultImage: false,
      }),
    }),
  },
  "party-crush": {
    by: "them",
    special: true,
    callNow: true,
    after: true,
    title: () => "Someone they like",
    theirs:
      "At the player's party (below), they have been getting on really well with another guest, and the two of them come over to the player, a little giddy; both are in the scene. They do not settle it: the player reacts at the end.",
    def: defineEvent({
      id: "party-crush",
      family: "milestone",
      label: "Someone they like",
      beats: milestoneBeats({
        turns: 3,
        options: ["cheer", "tease"],
        resultImage: false,
      }),
    }),
  },
  "party-fight": {
    by: "them",
    special: true,
    callNow: true,
    after: true,
    title: () => "A fight",
    theirs:
      "At the player's party (below), they and another guest they cannot stand are arguing right in front of the player, both in the scene and both speaking, true to who they are. They do not settle it: the player decides at the end.",
    def: defineEvent({
      id: "party-fight",
      family: "milestone",
      label: "A fight",
      beats: milestoneBeats({
        turns: 3,
        options: ["calm", "side", "out"],
        resultImage: false,
      }),
    }),
  },
  "party-stay": {
    by: "them",
    special: true,
    callNow: true,
    after: true,
    title: () => "Staying over",
    theirs:
      "At the end of the player's party (below), they had a great time and ask whether they could stay the night rather than go home. They do not settle it: the player answers at the end.",
    def: defineEvent({
      id: "party-stay",
      family: "milestone",
      label: "Staying over",
      beats: milestoneBeats({
        turns: 3,
        options: ["yes", "no"],
        resultImage: false,
      }),
    }),
  },
  "party-crasher": {
    by: "them",
    special: true,
    callNow: true,
    after: true,
    title: () => "Someone uninvited",
    theirs:
      "They brought a friend of theirs to the player's party without asking (below), and come to tell the player, a little sheepish. They do not settle it: the player decides at the end.",
    def: defineEvent({
      id: "party-crasher",
      family: "milestone",
      label: "Someone uninvited",
      beats: milestoneBeats({
        turns: 3,
        options: ["welcome", "out"],
        resultImage: false,
      }),
    }),
  },
  "party-arrive": {
    by: "them",
    special: true,
    callNow: true,
    after: true,
    title: () => "At the door",
    theirs:
      "The player has just arrived at their party (below) and they open the door, with the music and the others behind them: a short welcome at the door, true to who they are. Nothing is to be decided: then the player goes in.",
    def: defineEvent({
      id: "party-arrive",
      family: "milestone",
      label: "At the door",
      beats: milestoneBeats({
        turns: 2,
        options: ["in"],
        resultImage: false,
      }),
    }),
  },
  "party-goodbye": {
    by: "them",
    special: true,
    callNow: true,
    title: () => "Goodbye",
    theirs:
      "The player is leaving their party (below) and they see the player to the door: a short goodbye, true to who they are, with how the night went. Nothing is to be decided: then the player heads home.",
    def: defineEvent({
      id: "party-goodbye",
      family: "milestone",
      label: "Goodbye",
      beats: milestoneBeats({
        turns: 2,
        options: ["bye"],
        resultImage: false,
      }),
    }),
  },
  "party-hit-off": {
    by: "them",
    special: true,
    callNow: true,
    after: true,
    title: () => "Someone they like",
    theirs:
      "At a party where the player is a guest (below), they have been getting on really well with another guest, and the two of them come over to the player, a little giddy; both are in the scene. They do not settle it: the player reacts at the end.",
    def: defineEvent({
      id: "party-hit-off",
      family: "milestone",
      label: "Someone they like",
      beats: milestoneBeats({
        turns: 3,
        options: ["cheer", "tease", "leave"],
        resultImage: false,
      }),
    }),
  },
  "party-row": {
    by: "them",
    special: true,
    callNow: true,
    after: true,
    title: () => "A fight",
    theirs:
      "At a party where the player is a guest (below), they and another guest they cannot stand are arguing right in front of the player, both in the scene and both speaking, true to who they are. It is not the player's home: nobody can be asked to leave. The player decides at the end whether to step in.",
    def: defineEvent({
      id: "party-row",
      family: "milestone",
      label: "A fight",
      beats: milestoneBeats({
        turns: 3,
        options: ["calm", "side", "leave"],
        resultImage: false,
      }),
    }),
  },
  "party-drunk": {
    by: "them",
    special: true,
    callNow: true,
    after: true,
    title: () => "One too many",
    theirs:
      "At a party where the player is a guest (below), they have had a little too much to drink and come over to the player, unsteady and chatty, true to who they are. Nothing bad happens. The player decides at the end whether to look after them.",
    def: defineEvent({
      id: "party-drunk",
      family: "milestone",
      label: "One too many",
      beats: milestoneBeats({
        turns: 3,
        options: ["care", "leave"],
        resultImage: false,
      }),
    }),
  },
  "party-toast": {
    by: "them",
    special: true,
    callNow: true,
    after: true,
    title: () => "A toast",
    theirs:
      "At their own party (below), they are about to raise a toast to everyone who came, and they come over to the player first, glass in hand, true to who they are. The player decides at the end how to join in.",
    def: defineEvent({
      id: "party-toast",
      family: "milestone",
      label: "A toast",
      beats: milestoneBeats({
        turns: 2,
        options: ["glass", "words"],
        resultImage: false,
      }),
    }),
  },
  surprise: {
    by: "them",
    special: true,
    title: () => "A surprise",
    theirs:
      "They turn up with a small surprise for the player (below), just because: a romantic gesture, true to who they are. Nothing is to be decided: the talk simply goes on.",
    def: defineEvent({
      id: "surprise",
      family: "milestone",
      label: "A surprise",
      beats: milestoneBeats({
        turns: 3,
        options: ["on"],
        resultImage: false,
      }),
    }),
  },
  "money-help": {
    by: "them",
    special: true,
    title: () => "Some help",
    theirs:
      "They know the player is short for the rent tomorrow (below), and they come to offer them the money, as a loan, true to who they are: kindly, without making a thing of it. They do not settle it: the player answers at the end.",
    def: defineEvent({
      id: "money-help",
      family: "milestone",
      label: "Some help",
      beats: milestoneBeats({
        turns: 3,
        options: ["take", "decline"],
        resultImage: false,
      }),
    }),
  },
  "open-them": {
    by: "them",
    special: true,
    title: () => "Seeing someone else",
    theirs:
      "They have feelings for someone else and ask the player, honestly, whether it would be okay to see them too. They do not settle it: the player answers at the end.",
    not: "",
    def: defineEvent({
      id: "open-them",
      family: "milestone",
      label: "Seeing someone else",
      beats: milestoneBeats({
        turns: 4,
        options: ["yes", "no"],
        resultImage: false,
      }),
    }),
  },
  "stay-away": {
    by: "them",
    special: true,
    title: () => "Stay away",
    theirs:
      "The player has been going after the person they are with, and they found out: they confront the player about it, true to who they are. They do not settle it: the player answers, and makes the call at the end.",
    not: "",
    def: defineEvent({
      id: "stay-away",
      family: "milestone",
      label: "Stay away",
      beats: milestoneBeats({
        turns: 4,
        options: ["back-off", "refuse", "deny"],
        resultImage: false,
      }),
    }),
  },
  jealous: {
    by: "them",
    special: true,
    title: () => "Jealousy",
    theirs:
      "They found out something about the player with someone else, and it hurts: they bring it up, true to who they are. They do not settle it: the player answers, and makes the call at the end.",
    not: "",
    def: defineEvent({
      id: "jealous",
      family: "milestone",
      label: "Jealousy",
      beats: milestoneBeats({
        turns: 4,
        options: ["apologize", "explain", "deny"],
        resultImage: false,
      }),
    }),
  },
  "where-were-you": {
    by: "them",
    special: true,
    title: () => "Where have you been?",
    theirs:
      "They have not seen the player in a long time and they missed them: they bring it up, true to who they are (hurt, teasing, or simply glad and a little sore). They are friends, not a couple: it is about the friendship. They do not settle it: the player answers, and it ends with how it went.",
    not: "",
    def: defineEvent({
      id: "where-were-you",
      family: "milestone",
      label: "Where have you been?",
      beats: milestoneBeats({
        turns: 4,
        options: ["apologize", "explain"],
        resultImage: false,
      }),
    }),
  },
  talk: {
    by: "them",
    special: true,
    title: () => "We need to talk",
    theirs: "They need to talk: things between them and the player have gone wrong, and they might break up.",
    mine: "Things between them and the player have gone wrong, and they are too proud to ever bring it up themselves: the player does. They talk it out; it can still end.",
    not: "",
    def: defineEvent({
      id: "talk",
      family: "milestone",
      label: "We need to talk",
      beats: milestoneBeats({
        turns: 4,
        options: ["stay", "go"],
        resultImage: false,
      }),
    }),
  },
  "ask-you-out": {
    by: "them",
    special: true,
    title: () => "Asking you out",
    theirs:
      "They ask the player out themselves, with the plan below: where, the day and the hour. They do not settle it: the player answers at the end.",
    not: "Only the invitation: the outing itself is another day.",
    def: defineEvent({
      id: "ask-you-out",
      family: "milestone",
      label: "Asking you out",
      beats: milestoneBeats({
        turns: 3,
        options: ["yes", "other", "wait"],
        resultImage: false,
      }),
    }),
  },
  "birthday-surprise": {
    by: "them",
    special: true,
    title: (characterName) => `${characterName} has plans for your birthday`,
    theirs:
      "It is the player's birthday. Their partner comes with a plan to celebrate it tonight (below): where and when. They do not settle it: the player answers at the end.",
    not: "Only the plan: the evening itself is later.",
    def: defineEvent({
      id: "birthday-surprise",
      family: "milestone",
      label: "Your birthday plans",
      beats: milestoneBeats({
        turns: 3,
        options: ["yes", "other"],
        resultImage: false,
      }),
    }),
  },
  "birthday-invite": {
    by: "them",
    special: true,
    title: (characterName) => `${characterName} invites you to their birthday`,
    theirs:
      "They invite the player to their birthday party: the plan below (where, the day and the hour, and who else is coming). They do not settle it: the player answers at the end.",
    not: "Only the invitation: the party itself is on the day.",
    def: defineEvent({
      id: "birthday-invite",
      family: "milestone",
      label: "A birthday invitation",
      beats: milestoneBeats({
        turns: 3,
        options: ["yes", "wait"],
        resultImage: false,
      }),
    }),
  },
  "their-plan": {
    by: "them",
    special: true,
    title: () => "A plan",
    theirs: "They just set the plan below with the player. The player answers.",
    not: "Only the plan: the outing itself is another day.",
    def: defineEvent({
      id: "their-plan",
      family: "milestone",
      label: "A plan",
      beats: milestoneBeats({
        turns: 1,
        options: ["yes", "other", "wait"],
        resultImage: false,
      }),
    }),
  },
  "ask-plan": {
    by: "you",
    special: true,
    title: () => "Inviting them out",
    mine: "The player just asked them out, with the plan below. They answer at the end.",
    not: "Only the invitation: the outing itself is another day.",
    def: defineEvent({
      id: "ask-plan",
      family: "milestone",
      label: "Inviting them out",
      beats: milestoneBeats({
        turns: 1,
        options: ["step", "wait"],
        resultImage: false,
      }),
    }),
  },
  "partners-meet": {
    by: "them",
    special: true,
    title: () => "They meet",
    theirs:
      "Several of the player's partners, each of whom agreed that the player sees the others, meet each other as such for the first time, with the player right there. All of them are in the scene and each one reacts true to who they are: curious, polite, territorial, warm. They do not settle how it goes: the player makes the call at the end.",
    not: "Nobody breaks up here, and nothing more than meeting happens.",
    def: defineEvent({
      id: "partners-meet",
      family: "milestone",
      label: "They meet",
      beats: milestoneBeats({
        turns: 3,
        options: ["bring", "flow", "short"],
        resultImage: false,
      }),
    }),
  },
  "meet-ask": {
    by: "them",
    special: true,
    title: () => "Wants to meet her",
    theirs:
      "They want to meet another of the player's partners (named below), properly: they know about them and it is agreed. They ask the player. They do not settle it: the player answers at the end.",
    not: "Only the asking: the meeting itself is another day.",
    def: defineEvent({
      id: "meet-ask",
      family: "milestone",
      label: "Wants to meet her",
      beats: milestoneBeats({
        turns: 3,
        options: ["yes", "notyet"],
        resultImage: false,
      }),
    }),
  },
  "her-or-me": {
    by: "them",
    special: true,
    title: () => "Her or me",
    theirs:
      "Between them and another of the player's partners (named below) it has gone bad: they cannot stand it any more and tell the player it is that person or them, true to who they are. They do not settle it: the player answers at the end.",
    not: "",
    def: defineEvent({
      id: "her-or-me",
      family: "milestone",
      label: "Her or me",
      beats: milestoneBeats({
        turns: 4,
        options: ["her", "other", "calm", "refuse"],
        resultImage: false,
      }),
    }),
  },
  "partners-tease": {
    by: "them",
    special: true,
    after: true,
    title: () => "Two against one",
    theirs:
      "Two of the player's partners, who get along and each agreed that the player sees the other, team up on the player, playfully: they tease them together, share a joke at the player's expense, or tell what they said about the player. Warm, never cruel. Both are in the scene and speak for themselves. They do not settle how the player takes it: the player makes the call.",
    not: "Nobody gets hurt and nobody breaks up.",
    def: defineEvent({
      id: "partners-tease",
      family: "milestone",
      label: "Two against one",
      beats: milestoneBeats({
        turns: 2,
        options: ["play", "turn"],
        resultImage: false,
      }),
    }),
  },
  "partners-compete": {
    by: "them",
    special: true,
    after: true,
    title: () => "Both want you",
    theirs:
      "Two of the player's partners, with some tension between them (each agreed that the player sees the other), both want the player's attention right now, at the same time: a seat, a moment, a plan, a look. Each one pulls in their own way, true to who they are. They do not settle it: the player chooses at the end.",
    not: "Nobody breaks up here.",
    def: defineEvent({
      id: "partners-compete",
      family: "milestone",
      label: "Both want you",
      beats: milestoneBeats({
        turns: 2,
        options: ["a", "b", "share"],
        resultImage: false,
      }),
    }),
  },
  "partners-argue": {
    by: "them",
    special: true,
    after: true,
    title: () => "They argue",
    theirs:
      "Two of the player's partners, with some tension between them (each agreed that the player sees the other), argue in front of the player about something between the two of them. Each one holds their side, true to who they are, and looks to the player. They do not settle it: the player makes the call at the end.",
    not: "Nobody breaks up here, and it does not come to blows.",
    def: defineEvent({
      id: "partners-argue",
      family: "milestone",
      label: "They argue",
      beats: milestoneBeats({
        turns: 2,
        options: ["a", "b", "calm"],
        resultImage: false,
      }),
    }),
  },
  "partners-plan": {
    by: "them",
    special: true,
    after: true,
    title: () => "The three of us",
    theirs:
      "Two of the player's partners, who get along (each agreed that the player sees the other), have talked between them and propose an outing of the three of them: the plan below, already picked. They ask the player. They do not settle it: the player answers at the end.",
    not: "Only the asking: the outing itself is another day.",
    def: defineEvent({
      id: "partners-plan",
      family: "milestone",
      label: "The three of us",
      beats: milestoneBeats({
        turns: 2,
        options: ["yes", "wait"],
        resultImage: false,
      }),
    }),
  },
  ...specialEventMilestones(milestoneBeats),
};
var MILESTONE_IDS = Object.keys(MILESTONES);
var milestoneById = (id) => MILESTONES[id] ?? null;
var RECONCILE_RULES = {
  days: 7,
  trust: 2,
  trustBetrayed: 3,
  romance: 2,
};
var RECONCILE_MINUTES_PER_DAY = 1440;

export {
  INITIATIVE_ASK_CHANCES,
  MILESTONES,
  MILESTONE_COUPLE_STATUSES,
  MILESTONE_IDS,
  PARTNER_PAIR_MILESTONES,
  RECONCILE_MINUTES_PER_DAY,
  RECONCILE_RULES,
  TALK_TRUST_FLOOR,
  milestoneById,
};
