// Changelog entries plus module notes merge
var RELEASE_NOTES = [
  {
    version: "0.3.2",
    date: "2026-10-02",
    lines: [
      {
        text: "Plans and parties.",
        dev: "Someone got invited to a party on Saturday at 2, and an hour later the same person asked them out for Saturday at 3. Thanks for the report!",
        items: [
          "If someone is throwing a party or going to one, they won't make plans with you for those hours.",
          "That's still true if you told them you can't come.",
          "When you invite someone out, you can see the hours they have a party.",
        ],
      },
      {
        text: "Dating more than one person.",
        items: [
          "If someone starts dating you knowing you already have a partner, they're okay with it. You don't have to ask them again, and you can talk to them about marrying your other partner.",
          "This also fixes the lives you're already playing.",
        ],
      },
      {
        text: "The phone button on a phone.",
        dev: "Someone couldn't move it with their finger. Thanks for the report!",
        items: ["On a phone, you can drag the phone button with your finger, the same as with a mouse."],
      },
      {
        text: "Season outfits.",
        items: [
          "When a new season starts, people keep last season's outfit until the new one is ready, so nobody shows up without a picture.",
        ],
      },
      {
        text: "Modules.",
        items: ["What got fixed in each module is below."],
      },
    ],
  },
  {
    version: "0.3.1",
    date: "2026-10-01",
    lines: [
      {
        text: "NPCs are a rule now.",
        dev: "Not everyone wants people showing up who aren't from their cards. Now it's your call, life by life.",
        items: [
          "A new rule, NPCs, under Town: people who aren't in your cast, like a club's staff and its regulars. Off, only your cast is around.",
          "It's off by default in a new life. A life that already had them keeps it on.",
          "Turn it off and they step aside with their pictures, nothing deleted. Turn it back on and they're back with what they remembered.",
        ],
      },
      {
        text: "Stay the night once you're dating.",
        items: [
          "You no longer have to be partners: once you're dating, you can stay the night at theirs when they're going to bed, or have them stay at yours.",
        ],
      },
      {
        text: "Modules.",
        items: ["What's new in each one is below."],
      },
    ],
    fixes: [
      {
        text: "Getting stuck.",
        dev: "A player got stuck at the end of a birthday party: no way to say goodbye, and nothing else would work. Thanks for the report! I went looking for every other place where that could happen.",
        items: [
          "Saying goodbye at the end of someone's party always works, even if the party ends in a few minutes, the host has gone to bed or is in another room.",
          "If the host moves away, or your wedding starts, you leave their party.",
          "A lunch break that already went by no longer keeps you shut in the office.",
          "When someone asks you for money in the middle of an outing, you can always answer, and END SCENE comes back.",
          "Reloading the page during a honeymoon night takes you back to it.",
        ],
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-09-30",
    lines: [
      {
        text: "Cooking and food.",
        dev: "Cooking and your home were the first two things on my list for this version. Food used to be something you bought and ate; now it's part of your day, and of the people in it.",
        items: [
          "Your home has a KITCHEN. Cook with what's in your fridge: twelve recipes, from quick ones to dinners that take a while, each making a few portions that keep in the fridge.",
          "How it turns out depends on your new Cooking skill. A great dish gives you more energy and keeps you well fed for hours; a burnt one barely fills you.",
          "Cook for someone: on a date or a hang out at your place, dinner is part of the evening, and they react to it by their taste. Cook together, or let whoever likes cooking make you something.",
          "A portion makes a nice present, and the ones who cook may invite you to eat at theirs.",
        ],
      },
      {
        text: "A home of your own.",
        items: [
          "Hillcrest, a new district up on the hill: a luxury tower, mansions, a club and a boutique.",
          "Buy a home instead of renting, outright or with a mortgage, even the one you live in.",
          "Every home has its own places for furniture. Bigger ones have a garden, a garage, a gym, a bar, even a pool. A car needs a garage, or it's parked on the street for a fee.",
          "People notice where you live and what you wear. A home on the hill or designer clothes impress some, get others talking, and make a few envious.",
        ],
      },
      {
        text: "People come over, and you throw parties.",
        dev: "A party isn't a menu: it's a night you live, room by room, with everyone you invited. Things go right, things go wrong, and everyone remembers it.",
        items: [
          "Close friends and partners drop by now and then, and they'll ask to come over too. Whatever your home has, you can do together.",
          "Throw a party from AT HOME: the day, the hours, who you invite and the food. On the night your home is its rooms; move between them, talk with whoever is there, dance, serve the food, introduce people.",
          "Things happen, and you're in them: two guests hit it off, two others fight, someone wants to stay the night, a friend brings someone you didn't invite, a neighbour knocks about the noise.",
          "Your friends throw parties at their place too. Go as a guest, lend a hand, and sing on their birthday.",
          "Birthdays are parties now: yours at home, with presents and a cake, and theirs at their place.",
        ],
      },
      {
        text: "Live with others.",
        dev: "A tester asked for this one. Now your home can be as full as you like.",
        items: [
          "Friends and family can live with you, as many as your home has rooms for. Your partner shares your room.",
          "Ask a friend to move in, or they may ask you. Start a new life already living with them if you like.",
          "Living together brings you closer: the rent is split, they eat from your fridge and bring groceries, and now and then something happens at home.",
          "When someone who lives with you throws a party or has their birthday, it's at home, and it's yours too.",
        ],
      },
      {
        text: "Who they are to you.",
        items: [
          "When you create a life, anyone in the cast can be your family, your partner, your ex or your rival from day one.",
          "Each of them starts where that makes sense, and the game treats them that way: a partner from day one doesn't get a \xABfirst kiss\xBB, and family is family.",
        ],
      },
      {
        text: "Relationships make more sense.",
        dev: "I went through every step a relationship can take and made them agree with each other. Fewer strange moments, like being offered things that no longer fit.",
        items: [
          "One clear rule for dating, whether it starts with a button, your own words or their confession.",
          "An ex has a path back, and friendship and family have their own names for each step.",
          "What you agree on replaces what came before: once you've agreed to see other people, nobody confronts you over it.",
          "\xABKeep it light\xBB lasts a month now, and ends when you become partners.",
          "Anyone who lives with you counts as seeing each other, and people who share a home grow closer.",
        ],
      },
      {
        text: "Scenes follow what's said.",
        dev: "More and more, what you write and what they say is what happens, not just flavour. If the story says it, the game does it.",
        items: [
          "A favour happens where it's told: if they need you at the caf\xE9, the game takes you both there. It says so before you agree, with how long and how tiring it is.",
          "Ask for money in your own words, and they may lend it to you. They may pay you back on their own, too. Anyone in a group talk can ask you for money.",
          "Say the step you're there for, and it counts: a kiss in a first-kiss moment, or asking them to move in.",
          "On an outing, what you write happens right then: say you want to sing, and the karaoke starts. Moments come in a natural order, and a surprise can come up at any time.",
          "Everyone in a scene keeps their own memory of it, not just the one you were talking to.",
          "Collapse in the middle of a talk or an outing and they remember it too, before you wake up in the hospital.",
          "Every scene that comes from something between you knows why it's happening.",
        ],
      },
      {
        text: "Special Actions tell you what's missing.",
        items: [
          "The steps of a relationship are right there, and the ones that depend on you show what you still need, like how close you have to be.",
          "Each action says what it does, and the ones that don't fit in the time you have left say so instead of disappearing.",
        ],
      },
      {
        text: "Your job.",
        items: [
          "Some of the cast work from home. They're home, but busy.",
          "A new life starts in everyday clothes: buy a suit before your first day at the office.",
          "Skills need half the practice to level up.",
        ],
      },
      {
        text: "When the model can't answer.",
        dev: "A model going quiet used to leave the game stuck, sometimes for good. Now you always have a way on.",
        items: [
          "Where it matters you get a choice: try again, or go on without their words. What you chose still counts.",
          "If it happens as an outing begins, the plan waits: try again, or cancel it at no cost.",
          "If an answer comes back empty, it's asked for once more. If the connection a life used is gone, it uses Marinara's default one.",
          "And when something fails, the screen says what happened in plain words.",
        ],
      },
      {
        text: "In your language.",
        items: [
          "The choices in a scene, and the lines the game writes itself when the model can't, come in your life's language.",
        ],
      },
      {
        text: "Around the game.",
        items: [
          "A life opens where you left it: inside someone's home, at yours, or where you were.",
          "Adding characters tells versions of the same card apart, shows Marinara's folders, and searches by title and tags too.",
          "Rent is no longer a rule you can turn off. If you had it off, you start paying next season.",
          "A picture that came out wrong in the clothes store can be drawn again.",
          "A proposal knows what time it is: \xABNot today\xBB, or tonight, or this afternoon.",
        ],
      },
      {
        text: "Modules.",
        items: ["What's new in each one is below."],
      },
    ],
    fixes: [
      {
        text: "Scenes and talks.",
        items: [
          "Long lines no longer get cut off or lose words. A line longer than the box carries on in the next one.",
          "A click anywhere moves the scene on, and drawing a key moment again doesn't cut it short.",
          "If the place closes while a decision is waiting, the decision is still yours.",
          "The end of a scene gives the real reason: they're with someone, your break is over, it's their bedtime, they left upset.",
          "Nobody asks you for money or a ride with their last words, when you'd have no turn left to answer.",
          "Paying what they asked no longer risks paying it twice, and in a group it's clear who you paid.",
          "An old reply no longer plays a turn over a decision that's waiting.",
          "Someone who walks over is who they really are to you, and flirting with family never makes anyone jealous.",
          "Nobody makes up gossip about you, and \xABOpen to romance\xBB only ever applies to you.",
          "\xABIs this for real?\xBB comes when you can actually be partners, and saying yes makes you partners.",
          "Asking to take a step early goes straight to their decision.",
        ],
      },
      {
        text: "Outings and the wedding.",
        items: [
          "An outing never gets stuck when the model doesn't answer at the bill or at the end.",
          "The wedding always goes to the end, vows and first dance included.",
          "Wedding guests speak with their own names, and a guest who left is gone.",
          "Collapse on your wedding night and the honeymoon still happens after the hospital.",
          "The plans strip only offers to start when you really can.",
          "Your lunch break only keeps you at the office.",
          "A plan at a place that banned you is called off at no cost.",
        ],
      },
      {
        text: "Money and home.",
        items: [
          "An eviction happens in the morning, not at midnight, and paying all you owe or moving before then stops it.",
          "Emergency help with the rent or the hospital never goes past what someone can lend, and never comes from an ex.",
          "Money with someone who moved away waits until they're back.",
          "Homes you can't afford still say what they are and what they cost.",
          "A car you already had pays for street parking like any other.",
        ],
      },
      {
        text: "Screens and pictures.",
        items: [
          "Someone's picture shows up as soon as it's drawn, without reloading.",
          "Nothing from another life or another screen is left on top when you switch.",
          "What people remember after a knock at their door or a moment at work is kept.",
          "Everyone knows their own job, even outside their shift.",
          "A person's body is drawn only as their card describes it.",
          "The upload button in the fitting room works again.",
          "A preset keeps your partner living with you.",
        ],
      },
      {
        text: "Models and connections.",
        items: [
          "An answer that comes back cut off gets another try with less thinking, so it fits.",
          "The game reads Marinara on a secure connection with its own certificate.",
        ],
      },
    ],
  },
  {
    version: "0.2.5",
    date: "2026-09-29",
    lines: [
      {
        text: "CONTACTS doesn't freeze any more.",
        dev: "Two of you sent me the error from your browser's console when CONTACTS froze. With it I found the cause: when one part of someone's sheet had something the game didn't expect, the whole screen stopped. Thank you, it made this a quick fix!",
        items: [
          "Opening CONTACTS no longer loads your whole life again, so it opens right away.",
          "Each part of someone's sheet is drawn on its own. If one can't be shown, only that part is missing and the rest of the sheet is there.",
          "If a whole screen can't be shown, it says so, with a button to go back to the map, instead of leaving the game stuck.",
        ],
      },
    ],
  },
  {
    version: "0.2.4",
    date: "2026-09-28",
    lines: [
      {
        text: "You can use your own pictures.",
        dev: "Before, only the places could have a picture of yours. Now people can too, so if you have art of a character you love, you can use it.",
        items: [
          "What someone wears each season or at work, and you in any of your outfits: tap the round button with the arrow, pick a picture and frame it yourself.",
          "Your picture stays, even if their job or their clothes change. If you want a drawn one again, tap PAINT IT INSTEAD.",
          "If your picture has a see-through background, they stand in the scene just as it is.",
          "Your own pictures of places now fit the size you picked for pictures.",
        ],
      },
      {
        text: "You can change someone's name.",
        dev: "A tester changed a name on the card and the game kept the old one. Now that pictures use the name, that matters more.",
        items: [
          "Rename them in Settings, right there in the cast, without touching their card.",
          "If you rename them on their card, updating from the card brings the new name too.",
          "Their next pictures use the new name. The ones already drawn stay until you draw them again.",
        ],
      },
      {
        text: "Fewer lost replies with some models.",
        dev: "A tester on GLM kept losing turns in scenes. They sent me the model's exact answer, and that's how I found both mistakes. Thank you!",
        items: [
          "When the model puts quotes in the wrong place, or leaves part of a line out, the game still reads what it said, and your turn isn't lost.",
        ],
      },
      {
        text: "Shopping is clearer.",
        items: [
          "In the clothes store, the names on the rack are sharp again.",
          "If you open the phone's shop while you're in a store, it opens on its own. Going back takes you to the store, with your cart as you left it.",
        ],
      },
    ],
  },
  {
    version: "0.2.3",
    date: "2026-09-27",
    lines: [
      {
        text: "People look like themselves in their pictures.",
        dev: "Some of you got a woman drawn as a man, or a character from a series you love drawn as somebody else. Sorry about that! Pictures that were already drawn stay as they are: tap REDO SPRITE on their sheet to draw them again.",
        items: [
          "Their pictures now know their name and whether they're a woman or a man, so a character from a series looks like the one you know.",
          "You can choose how big pictures of one person are drawn, in Settings, right below the size of the other pictures. The game looks best at the size it comes with.",
        ],
      },
      {
        text: "This season's new clothes are for you.",
        items: [
          "If you play a man, you get clothes for a man. If you play a woman, clothes for a woman.",
          "If your character got dresses they'd never wear, the season's clothes are picked again. Anything you already bought is still yours.",
        ],
      },
      {
        text: "A few screens are easier to use.",
        items: [
          "In the shops, only the things for sale move when you scroll. The top and the picture behind them stay put.",
          "When you eat something from your backpack, you see it on top, and your backpack stays open.",
          "In the clothes store you can see the store behind the clothes again.",
        ],
      },
      {
        text: "The game finds Marinara however you run it.",
        dev: "A tester who plays from anywhere, on a secure connection, couldn't even start a life. Thanks for sending me your logs, that's how I found it!",
        items: [
          "Even if you open Marinara from another device or on a secure connection, the game can read your personas, cards and connections. If it still can't, it tells you where it looked.",
        ],
      },
    ],
  },
  {
    version: "0.2.1",
    date: "2026-09-27",
    lines: [
      {
        text: "Models that think before they answer, like GLM or DeepSeek, no longer get cut off halfway.",
        dev: "The first report from a tester: GLM stopped at 1,900 tokens while reading character cards, because it spent that room thinking. Thanks for letting me know!",
        items: [
          "Every call leaves the model room to think, and one that still runs out gets a second try with more room.",
          "Reasoning has a new option, none, for models that can answer without thinking first. It's faster, too.",
        ],
      },
      {
        text: "Pictures stay put while others are being painted.",
        items: ["They no longer flicker or load again, in Settings and on every other screen."],
      },
      {
        text: "Text is sharp again where a list scrolls.",
        items: ["On the phone, in the Guide and in What's New, the browser drew it soft."],
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-09-27",
    lines: [
      {
        text: "It looks and feels more like a game.",
        dev: "A lot of screens were walls of text. I'm rebuilding them one by one so the game feels like a game, not a spreadsheet.",
        items: [
          "A new title screen, over the place you left your last life, with your saved lives dealt out like cards.",
          "A welcome the first time you open it, and a short card on your first day in town telling you where you stand.",
          "The GUIDE: an app on your phone that explains how everything works, with a search. The little \u24D8 in your profile open it right at the right page.",
          "Your profile and everyone's sheet, redone with tabs.",
          "A relationship chart in Contacts: you in the middle, everyone around you, and the lines between them that you know about.",
          "Smoother moves between screens, on a computer and on a phone.",
        ],
      },
      {
        text: "People have their own personality.",
        dev: "Twelve fixed types were too tight: two quiet characters from very different cards ended up acting the same. Now every card gets its own mix, read from what the card says.",
        items: [
          "How open they are, how jealous, how faithful, how quick-tempered\u2026 You find it out as you spend time together, and you can change it in Settings.",
          "It shows in what they do: a jealous partner asks who that was, someone who holds a grudge gives you the cold shoulder, a shy one asks to go somewhere quieter, a proud one won't be the first to bring up what went wrong.",
          "Each person is a woman or a man, and likes women, men or both. If they don't like yours, you'll stay friends.",
        ],
      },
      {
        text: "Relationships go all the way.",
        items: [
          "Dating, becoming partners, moving in together, getting engaged and getting married, each step with its own scene.",
          "They can make the first move too: confess, ask you out, or propose.",
          "Breakups happen in a scene, never on a pop-up, and an ex can become a partner again.",
          "Leave someone alone for too long and they'll ask where you've been.",
          "Friendship opens doors as it grows: discounts, a key to their place, a couch when you need one, a loan, a hot meal at your door.",
        ],
      },
      {
        text: "Weddings.",
        items: [
          "Buy a ring and propose. Then plan it all in the WEDDING app: the venue, the food, your outfit, the rings and the guests.",
          "The day itself, the morning after, a honeymoon if you booked one, and your anniversary every year.",
          "You can marry more than one partner, as long as every one of them agrees.",
        ],
      },
      {
        text: "Jealousy, secrets and more than one partner.",
        dev: "None of this happens on a pop-up card: you see it yourself, or someone comes to tell you, in a scene. What you do about it is up to you.",
        items: [
          "Partners get jealous when they see or hear something, and a lie they catch later hurts much more.",
          "Open relationships, agreed with each partner. Your partners meet each other, get along or don't, and may compete for you.",
          "Someone who isn't faithful may start seeing someone behind your back, and a friend who saw it may come to tell you.",
        ],
      },
      {
        text: "The town talks.",
        dev: "I want the town to feel alive: people see things, talk about them, and it comes back to you.",
        items: [
          "People notice what you do, less so in big, busy places, and pass it on to the ones it matters to.",
          "Every Monday, NEWS tells you what got around about you and what happened between everyone else.",
          "In a scene you see who else is around. Sometimes one of them walks over, or picks a fight with someone they can't stand right in front of you.",
          "Friends have opinions about your partner, your choices, and what you're doing wrong.",
        ],
      },
      {
        text: "Going out.",
        items: [
          "Invite people for a hang out or a date. It goes on both your calendars, and keeping your word matters.",
          "An outing is one long scene, from the moment you meet to the goodbye, with their mood going up and down as you go.",
          "Birthdays: theirs, with a party you might be invited to, and yours, with presents and maybe a surprise.",
        ],
      },
      {
        text: "Work.",
        dev: "Starting with a job made the first days too easy. Now finding one is your first goal.",
        items: [
          "You start without a job. Find one in the JOBS app, go to the interview, and work your way up.",
          "Things come up during a shift, there's a lunch break, and you can stay late for extra pay or ask for a day off.",
          "Reviews twice a season: do well and you're promoted, show up late too often and you get warnings.",
        ],
      },
      {
        text: "Money.",
        dev: "Money used to leave your account on its own, and you could end up with nothing left for food. Now nothing moves unless you pay it.",
        items: [
          "Everything you owe is in the BILLS app, and you decide what to pay and when.",
          "Can't pay rent? It becomes a debt. Still owing when the next one comes, and you're out on the street until you sort it out.",
          "Move whenever you like with the HOMES app: an apartment or a house, alone, with a flatmate or with your partner.",
          "People may ask you for money, or offer you some, when it fits who they are.",
        ],
      },
      {
        text: "Around town.",
        items: [
          "The town has five districts. Walk between them, or buy a motorbike or a car.",
          "Shops have people behind the counter. Friends give you a discount, and they'll tell you what suits you.",
          "The gym and the library cost a little, but free things only take your skills so far. Reading needs a book.",
          "Choose how many hours you sleep.",
          "Open up: a quick way to build trust, next to Chat and Flirt.",
        ],
      },
      {
        text: "Pictures.",
        items: [
          "Key moments get their own picture, and they're all kept in the GALLERY.",
          "Everyone gets an outfit for each season, and can stand in a picture frame or cut out.",
          "Every kind of picture is manual or automatic, for each life, so nothing is drawn without you asking.",
          "Change the prompts behind every picture in Settings, and pick any picture size.",
        ],
      },
      {
        text: "Talking and writing.",
        items: [
          "Anything you can do with a button, you can also just write. Big decisions show what the game understood, and you can take them back.",
          "The story talks to you as \xAByou\xBB, never as \xABthe player\xBB.",
          "Suggestions only use what you know, and people know what plans are coming up.",
        ],
      },
      {
        text: "Creating a life.",
        items: [
          "Step by step, with sensible defaults, so you can start playing right away.",
          "Your choices save as you go, and you can keep setups you like as presets.",
        ],
      },
      {
        text: "Modules.",
        items: [
          "Optional extras you switch on when you create a life, or later in Settings. What's new in each one is below.",
        ],
      },
    ],
  },
];
function attachModuleReleaseNotes(notes, modules = []) {
  return notes.map((release) => {
    let moduleNotes = modules
      .filter((mod) => Array.isArray(mod.notes?.[release.version]) && mod.notes[release.version].length)
      .map((mod) => ({
        id: mod.id,
        name: mod.name,
        lines: mod.notes[release.version],
      }));
    return moduleNotes.length
      ? {
          ...release,
          modules: moduleNotes,
        }
      : release;
  });
}

export { RELEASE_NOTES, attachModuleReleaseNotes };
