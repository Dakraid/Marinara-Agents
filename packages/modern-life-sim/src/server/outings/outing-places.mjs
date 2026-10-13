// Outing places and their moments/options catalog
var momentOption = (id, label, extra = {}) => ({
  id: id,
  label: label,
  ...extra,
});
var TALK_TOPIC_OPTIONS = [
  momentOption("deep", "Something deep", {
    read: "curious",
    action: "deep",
  }),
  momentOption("funny", "Something funny", {
    read: "funny",
    action: "novelty",
  }),
  momentOption("plans", "Plans and dreams", {
    read: "warm",
    action: "time",
  }),
];
var BILL_MOMENT_BASE = {
  pay: true,
  minutes: 5,
};
var TOAST_OPTIONS = [
  momentOption("us", "To us", {
    read: "flirty",
    roll: "charm",
    only: "date",
  }),
  momentOption("tonight", "To tonight", {
    read: "warm",
    action: "time",
  }),
  momentOption("bad", "To bad decisions", {
    read: "funny",
    action: "novelty",
  }),
];
var PEOPLE_WATCHING_OPTIONS = [
  momentOption("stories", "Make up their stories", {
    read: "funny",
    action: "novelty",
  }),
  momentOption("couples", "Guess who's on a date", {
    read: "flirty",
    only: "date",
  }),
  momentOption("quiet", "Just sit together", {
    read: "warm",
    action: "time",
  }),
];
var FILM_GENRE_LABELS = {
  romance: "A romance",
  action: "An action film",
  horror: "A horror film",
  comedy: "A comedy",
  drama: "A drama",
  animation: "An animated film",
};
var BOOK_GENRE_LABELS = {
  romance: "A love story",
  action: "A thriller",
  horror: "A ghost story",
  comedy: "Something funny",
  drama: "A family saga",
  animation: "A graphic novel",
};
var MUSIC_GENRE_LABELS = {
  pop: "A pop hit",
  rock: "A rock anthem",
  ballads: "A ballad",
  "hip-hop": "A hip-hop track",
  indie: "An indie song",
  oldies: "An old classic",
};
var GIFT_TAG_LABELS = {
  sweets: "Something sweet",
  flowers: "A flower",
  sporty: "Something sporty",
  books: "A book",
  tech: "A gadget",
  fashion: "An accessory",
  music: "A record",
  art: "An art print",
  cooking: "Something for the kitchen",
  cute: "Something cute",
  games: "A little game",
  outdoors: "Something for outdoors",
  "tea-coffee": "Tea or coffee",
  jewelry: "A trinket",
};
var rotatingOptionPicker = (labels, extra) => (seed) => {
  let keys = Object.keys(labels),
    start = Math.floor(seed * keys.length);
  return [0, 2, 4]
    .map((offset) => keys[(start + offset) % keys.length])
    .map((key) =>
      momentOption(key, labels[key], {
        value: key,
        ...extra,
      }),
    );
};
var OUTING_PLACES = {
  cafe: {
    outing: "quiet",
    price: 8,
    moments: [
      {
        id: "order",
        name: "Order for them",
        minutes: 10,
        key: true,
        taste: "food",
        options: [
          momentOption("sweet", "Something sweet", {
            value: "sweet",
          }),
          momentOption("savory", "Something savory", {
            value: "savory",
          }),
          momentOption("light", "Something light", {
            value: "healthy",
          }),
        ],
      },
      {
        id: "pastry",
        name: "Share a pastry",
        minutes: 10,
        only: "date",
        options: [
          momentOption("bite", "Feed them a bite", {
            read: "flirty",
            roll: "charm",
          }),
          momentOption("half", "Split it down the middle", {
            read: "warm",
            action: "time",
          }),
          momentOption("theirs", "Let them have it", {
            read: "warm",
            action: "care",
          }),
        ],
      },
      {
        id: "talk",
        name: "Talk about something",
        minutes: 20,
        options: TALK_TOPIC_OPTIONS,
      },
      {
        id: "watch",
        name: "People-watching",
        minutes: 15,
        options: PEOPLE_WATCHING_OPTIONS,
      },
      {
        id: "bill",
        name: "The bill",
        ...BILL_MOMENT_BASE,
      },
    ],
  },
  park: {
    outing: "nature",
    price: 0,
    dress: {
      good: ["sport", "casual"],
      bad: ["formal"],
    },
    moments: [
      {
        id: "walk",
        name: "Walk and talk",
        minutes: 30,
        key: true,
        options: TALK_TOPIC_OPTIONS,
      },
      {
        id: "bench",
        name: "Sit on a bench",
        minutes: 15,
        options: [
          momentOption("close", "Sit close", {
            read: "flirty",
            only: "date",
          }),
          momentOption("ducks", "Feed the ducks", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("quiet", "Quiet together", {
            read: "warm",
            action: "space",
          }),
        ],
      },
      {
        id: "picnic",
        name: "A picnic",
        minutes: 30,
        needs: "food",
        options: [
          momentOption("share", "Share what you brought", {
            read: "warm",
            action: "gift",
          }),
          momentOption("grass", "Lie on the grass after", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("feed", "Feed them a bite", {
            read: "flirty",
            roll: "charm",
            only: "date",
          }),
        ],
      },
      {
        id: "race",
        name: "Race them",
        minutes: 15,
        only: "hang",
        options: [
          momentOption("win", "Race to win", {
            read: "funny",
            action: "challenge",
            roll: "fitness",
          }),
          momentOption("letwin", "Let them win", {
            read: "warm",
            action: "care",
            letWin: true,
          }),
          momentOption("trip", "Trip on purpose", {
            read: "funny",
            action: "novelty",
          }),
        ],
      },
      {
        id: "sunset",
        name: "Watch the sunset",
        minutes: 20,
        only: "date",
        hours: [16, 21],
        options: [
          momentOption("hand", "Take their hand", {
            read: "flirty",
            roll: "charm",
          }),
          momentOption("true", "Tell them something true", {
            read: "curious",
            action: "deep",
          }),
          momentOption("watch", "Just watch", {
            read: "warm",
            action: "space",
          }),
        ],
      },
    ],
  },
  bar: {
    outing: "lively",
    price: 15,
    dress: {
      good: ["smart", "casual"],
      bad: ["sport"],
    },
    moments: [
      {
        id: "drinks",
        name: "Order drinks",
        minutes: 15,
        key: true,
        taste: "food",
        options: [
          momentOption("cocktail", "A sweet cocktail", {
            value: "sweet",
          }),
          momentOption("beer", "A cold beer", {
            value: "comfort",
          }),
          momentOption("wine", "A glass of wine", {
            value: "fancy",
          }),
        ],
      },
      {
        id: "toast",
        name: "A toast",
        minutes: 5,
        follows: "drinks",
        options: TOAST_OPTIONS,
      },
      {
        id: "darts",
        name: "Darts",
        minutes: 20,
        options: [
          momentOption("win", "Play to win", {
            read: "funny",
            action: "challenge",
            roll: "fitness",
          }),
          momentOption("easy", "Go easy on them", {
            read: "warm",
            action: "care",
            letWin: true,
          }),
          momentOption("bet", "Bet the next round", {
            read: "funny",
            action: "challenge",
            roll: "fitness",
          }),
        ],
      },
      {
        id: "dance",
        name: "Dance",
        minutes: 20,
        only: "date",
        options: [
          momentOption("slow", "Slow dance", {
            read: "flirty",
            roll: "charm",
          }),
          momentOption("badly", "Dance badly on purpose", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("sway", "Just sway", {
            read: "warm",
            action: "time",
          }),
        ],
      },
      {
        id: "tab",
        name: "The tab",
        ...BILL_MOMENT_BASE,
      },
    ],
  },
  restaurant: {
    outing: "fancy",
    price: 30,
    dress: {
      good: ["formal", "smart"],
      bad: ["sport"],
    },
    moments: [
      {
        id: "order",
        name: "Order",
        minutes: 20,
        key: true,
        taste: "food",
        options: [
          momentOption("special", "The chef's special", {
            value: "fancy",
          }),
          momentOption("spicy", "Something spicy", {
            value: "spicy",
          }),
          momentOption("comfort", "Something comforting", {
            value: "comfort",
          }),
        ],
      },
      {
        id: "dessert",
        name: "Share dessert",
        minutes: 15,
        only: "date",
        follows: "order",
        options: [
          momentOption("spoons", "One dessert, two spoons", {
            read: "flirty",
          }),
          momentOption("two", "Order two", {
            read: "warm",
            action: "time",
          }),
          momentOption("choose", "Let them choose", {
            read: "warm",
            action: "care",
          }),
        ],
      },
      {
        id: "toast",
        name: "A toast",
        minutes: 5,
        options: TOAST_OPTIONS,
      },
      {
        id: "talk",
        name: "Talk",
        minutes: 20,
        options: TALK_TOPIC_OPTIONS,
      },
      {
        id: "bill",
        name: "The bill",
        ...BILL_MOMENT_BASE,
      },
    ],
  },
  "food-court": {
    outing: "lively",
    price: 9,
    only: "hang",
    moments: [
      {
        id: "food",
        name: "Pick the food",
        minutes: 15,
        key: true,
        taste: "food",
        options: [
          momentOption("ramen", "Ramen", {
            value: "savory",
          }),
          momentOption("burgers", "Burgers", {
            value: "comfort",
          }),
          momentOption("crepes", "Cr\xEApes", {
            value: "sweet",
          }),
        ],
      },
      {
        id: "share",
        name: "Share a plate",
        minutes: 10,
        only: "date",
        follows: "food",
        options: [
          momentOption("bite", "Feed them a bite", {
            read: "flirty",
            roll: "charm",
          }),
          momentOption("swap", "Swap halfway", {
            read: "warm",
            action: "time",
          }),
          momentOption("steal", "Steal their fries", {
            read: "funny",
            action: "novelty",
          }),
        ],
      },
      {
        id: "watch",
        name: "People-watching",
        minutes: 15,
        options: PEOPLE_WATCHING_OPTIONS,
      },
      {
        id: "pay",
        name: "Pay",
        ...BILL_MOMENT_BASE,
      },
    ],
  },
  cinema: {
    outing: "quiet",
    price: 12,
    moments: [
      {
        id: "tickets",
        name: "The tickets",
        ...BILL_MOMENT_BASE,
      },
      {
        id: "film",
        name: "Pick the film",
        minutes: 5,
        key: true,
        taste: "films",
        pick: rotatingOptionPicker(FILM_GENRE_LABELS),
      },
      {
        id: "snacks",
        name: "Snacks",
        minutes: 10,
        before: "during",
        taste: "food",
        options: [
          momentOption("candy", "Candy", {
            value: "sweet",
          }),
          momentOption("nachos", "Nachos", {
            value: "savory",
          }),
          momentOption("popcorn", "Popcorn", {
            value: "comfort",
          }),
        ],
      },
      {
        id: "during",
        name: "During the film",
        minutes: 75,
        key: true,
        follows: "film",
        options: [
          momentOption("hand", "Take their hand", {
            read: "flirty",
            roll: "charm",
            only: "date",
          }),
          momentOption("whisper", "Whisper a joke", {
            read: "funny",
            roll: "charm",
          }),
          momentOption("watch", "Just watch", {
            read: "warm",
            action: "time",
          }),
        ],
      },
      {
        id: "after",
        name: "Talk about it after",
        minutes: 20,
        follows: "during",
        options: [
          momentOption("honest", "Say what you really thought", {
            read: "curious",
            action: "deep",
          }),
          momentOption("ask", "Ask what they thought", {
            read: "warm",
            action: "care",
          }),
          momentOption("ending", "Make fun of the ending", {
            read: "funny",
            action: "novelty",
          }),
        ],
      },
    ],
  },
  arcade: {
    outing: "games",
    price: 8,
    moments: [
      {
        id: "tokens",
        name: "Tokens",
        ...BILL_MOMENT_BASE,
      },
      {
        id: "game",
        name: "Pick a game",
        minutes: 10,
        key: true,
        options: [
          momentOption("racing", "A racing game", {
            read: "funny",
            action: "challenge",
            roll: "fitness",
          }),
          momentOption("rhythm", "A rhythm game", {
            read: "funny",
            action: "novelty",
            roll: "fitness",
          }),
          momentOption("claw", "The claw machine", {
            read: "warm",
            action: "gift",
            roll: "luck",
          }),
        ],
      },
      {
        id: "versus",
        name: "Play against them",
        minutes: 20,
        options: [
          momentOption("win", "Play to win", {
            read: "funny",
            action: "challenge",
            roll: "fitness",
          }),
          momentOption("letwin", "Let them win", {
            read: "warm",
            action: "care",
            letWin: true,
          }),
          momentOption("trash", "Trash-talk", {
            read: "funny",
            action: "challenge",
          }),
        ],
      },
      {
        id: "prize",
        name: "Win them a prize",
        minutes: 15,
        follows: "game",
        options: [
          momentOption("plush", "Go for the big plush", {
            read: "warm",
            action: "gift",
            roll: "luck",
          }),
          momentOption("small", "Something small and sure", {
            read: "warm",
            action: "gift",
          }),
          momentOption("they", "Let them try", {
            read: "funny",
            action: "novelty",
          }),
        ],
      },
      {
        id: "booth",
        name: "Photo booth",
        minutes: 10,
        only: "date",
        options: [
          momentOption("silly", "Silly faces", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("cheek", "A kiss on the cheek", {
            read: "flirty",
            roll: "charm",
          }),
          momentOption("smile", "Just smile", {
            read: "warm",
            action: "time",
          }),
        ],
      },
    ],
  },
  karaoke: {
    outing: "lively",
    price: 10,
    moments: [
      {
        id: "room",
        name: "The room",
        ...BILL_MOMENT_BASE,
      },
      {
        id: "song",
        name: "Pick a song",
        minutes: 10,
        taste: "music",
        pick: rotatingOptionPicker(MUSIC_GENRE_LABELS),
      },
      {
        id: "sing",
        name: "Sing",
        minutes: 20,
        key: true,
        follows: "song",
        options: [
          momentOption("them", "Sing it to them", {
            read: "flirty",
            roll: "charm",
            only: "date",
          }),
          momentOption("allout", "Go all out", {
            read: "funny",
            action: "novelty",
            roll: "charm",
          }),
          momentOption("easy", "Keep it easy", {
            read: "warm",
            action: "time",
          }),
        ],
      },
      {
        id: "duet",
        name: "A duet",
        minutes: 20,
        only: "date",
        options: [
          momentOption("eyes", "Look at them the whole time", {
            read: "flirty",
            roll: "charm",
          }),
          momentOption("ham", "Ham it up", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("enjoy", "Just enjoy it", {
            read: "warm",
            action: "time",
          }),
        ],
      },
      {
        id: "cheer",
        name: "Cheer them on",
        minutes: 10,
        options: [
          momentOption("loud", "Cheer loudly", {
            read: "warm",
            action: "compliment",
          }),
          momentOption("dance", "Dance behind them", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("listen", "Listen properly", {
            read: "curious",
            action: "deep",
          }),
        ],
      },
    ],
  },
  "store-casual": {
    outing: "lively",
    price: 0,
    only: "hang",
    moments: [
      {
        id: "browse",
        name: "Browse together",
        minutes: 20,
        key: true,
        options: [
          momentOption("lead", "Let them lead", {
            read: "warm",
            action: "care",
          }),
          momentOption("worst", "Try on the worst thing", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("wear", "Ask what they'd wear", {
            read: "curious",
            action: "deep",
          }),
        ],
      },
      {
        id: "pickfor",
        name: "Pick something for them",
        minutes: 15,
        taste: "clothes",
        options: [
          momentOption("casual", "Something casual", {
            value: "casual",
          }),
          momentOption("sport", "Something sporty", {
            value: "sport",
          }),
          momentOption("formal", "Something formal", {
            value: "formal",
          }),
          momentOption("smart", "Something fashionable", {
            value: "smart",
          }),
        ],
      },
      {
        id: "pickme",
        name: "Let them pick for you",
        minutes: 15,
        options: [
          momentOption("wear", "Wear what they pick", {
            read: "warm",
            action: "care",
          }),
          momentOption("veto", "Veto everything", {
            read: "funny",
            action: "challenge",
          }),
          momentOption("looks", "Ask what looks good on you", {
            read: "flirty",
            only: "date",
          }),
        ],
      },
    ],
  },
  crest: {
    outing: "fancy",
    price: 40,
    dress: {
      good: ["smart", "casual"],
      bad: ["formal"],
    },
    moments: [
      {
        id: "entry",
        name: "The day pass",
        ...BILL_MOMENT_BASE,
      },
      {
        id: "pool",
        name: "The pool",
        minutes: 30,
        key: true,
        options: [
          momentOption("race", "Race them a length", {
            read: "funny",
            action: "challenge",
            roll: "fitness",
          }),
          momentOption("float", "Just float and talk", {
            read: "warm",
            action: "time",
          }),
          momentOption("splash", "Splash them", {
            read: "funny",
            action: "novelty",
          }),
        ],
      },
      {
        id: "loungers",
        name: "The loungers",
        minutes: 20,
        options: [
          momentOption("lotion", "Offer them sunscreen", {
            read: "flirty",
            only: "date",
          }),
          momentOption("nap", "Doze off side by side", {
            read: "warm",
            action: "space",
          }),
          momentOption("people", "Watch the rich people", {
            read: "funny",
            action: "novelty",
          }),
        ],
      },
      {
        id: "terrace",
        name: "The terrace bar",
        minutes: 20,
        taste: "food",
        options: [
          momentOption("champagne", "Champagne", {
            value: "fancy",
          }),
          momentOption("fruit", "A fruit cooler", {
            value: "healthy",
          }),
          momentOption("sweet", "A sweet cocktail", {
            value: "sweet",
          }),
        ],
      },
      {
        id: "talk",
        name: "Talk",
        minutes: 20,
        options: TALK_TOPIC_OPTIONS,
      },
    ],
  },
  boutique: {
    outing: "fancy",
    price: 0,
    only: "hang",
    moments: [
      {
        id: "browse",
        name: "Browse together",
        minutes: 20,
        key: true,
        options: [
          momentOption("prices", "Gasp at the prices", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("belong", "Act like you belong", {
            read: "funny",
            action: "challenge",
          }),
          momentOption("dream", "Ask what they'd buy if they could", {
            read: "curious",
            action: "deep",
          }),
        ],
      },
      {
        id: "pickfor",
        name: "Pick something for them",
        minutes: 15,
        taste: "clothes",
        options: [
          momentOption("casual", "Something casual", {
            value: "casual",
          }),
          momentOption("formal", "Something formal", {
            value: "formal",
          }),
          momentOption("smart", "Something fashionable", {
            value: "smart",
          }),
        ],
      },
      {
        id: "champagne",
        name: "Champagne for the clients",
        minutes: 10,
        options: TOAST_OPTIONS,
      },
    ],
  },
  "gift-shop": {
    outing: "quiet",
    price: 0,
    only: "hang",
    moments: [
      {
        id: "browse",
        name: "Browse together",
        minutes: 20,
        key: true,
        options: [
          momentOption("lead", "Let them lead", {
            read: "warm",
            action: "care",
          }),
          momentOption("silly", "Find the silliest thing", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("ask", "Ask what they'd love", {
            read: "curious",
            action: "deep",
          }),
        ],
      },
      {
        id: "buy",
        name: "Buy them something",
        minutes: 15,
        taste: "gift",
        cost: 15,
        pick: rotatingOptionPicker(GIFT_TAG_LABELS),
      },
    ],
  },
  gym: {
    outing: "active",
    price: 0,
    only: "hang",
    dress: {
      good: ["sport"],
      bad: ["formal", "smart"],
    },
    moments: [
      {
        id: "train",
        name: "Train together",
        minutes: 40,
        key: true,
        options: [
          momentOption("push", "Push each other", {
            read: "funny",
            action: "challenge",
            roll: "fitness",
          }),
          momentOption("easy", "Keep it easy", {
            read: "warm",
            action: "time",
          }),
          momentOption("form", "Help with their form", {
            read: "warm",
            action: "care",
            roll: "fitness",
          }),
        ],
      },
      {
        id: "spot",
        name: "Spot them",
        minutes: 15,
        options: [
          momentOption("spot", "Spot them", {
            read: "warm",
            action: "care",
          }),
          momentOption("count", "Count out loud", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("weight", "Add weight", {
            read: "funny",
            action: "challenge",
          }),
        ],
      },
      {
        id: "race",
        name: "Race on the treadmill",
        minutes: 15,
        options: [
          momentOption("win", "Race to win", {
            read: "funny",
            action: "challenge",
            roll: "fitness",
          }),
          momentOption("letwin", "Let them win", {
            read: "warm",
            action: "care",
            letWin: true,
          }),
          momentOption("quit", "Give up halfway", {
            read: "funny",
            action: "novelty",
          }),
        ],
      },
    ],
  },
  library: {
    outing: "quiet",
    price: 0,
    only: "hang",
    moments: [
      {
        id: "study",
        name: "Study together",
        minutes: 40,
        key: true,
        options: [
          momentOption("quiz", "Quiz each other", {
            read: "curious",
            action: "challenge",
            roll: "knowledge",
          }),
          momentOption("side", "Work side by side", {
            read: "warm",
            action: "time",
          }),
          momentOption("help", "Help them with theirs", {
            read: "warm",
            action: "care",
            roll: "knowledge",
          }),
        ],
      },
      {
        id: "book",
        name: "Recommend a book",
        minutes: 15,
        taste: "films",
        pick: rotatingOptionPicker(BOOK_GENRE_LABELS),
      },
      {
        id: "notes",
        name: "Pass notes",
        minutes: 15,
        options: [
          momentOption("silly", "Something silly", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("question", "A question", {
            read: "curious",
            action: "deep",
          }),
          momentOption("drawing", "A drawing", {
            read: "warm",
            action: "gift",
          }),
        ],
      },
    ],
  },
  home: {
    outing: "quiet",
    price: 0,
    home: "yours",
    moments: [
      {
        id: "cook",
        name: "Cook dinner",
        minutes: 40,
        needs: "kitchen",
        dish: "yours",
        meal: true,
      },
      {
        id: "served",
        name: "They cook for you",
        minutes: 40,
        needs: "cooks",
        dish: "theirs",
        words: true,
        options: [
          momentOption("praise", "Tell them it's delicious", {
            read: "warm",
            action: "compliment",
          }),
          momentOption("recipe", "Ask how they made it", {
            read: "curious",
            action: "deep",
            learn: true,
          }),
          momentOption("seconds", "Ask for seconds", {
            read: "funny",
            action: "time",
          }),
        ],
      },
      {
        id: "movie",
        name: "A movie on the sofa",
        minutes: 90,
        needs: "tv",
        taste: "films",
        pick: rotatingOptionPicker(FILM_GENRE_LABELS),
      },
      {
        id: "pool",
        name: "A swim in your pool",
        minutes: 30,
        needs: "pool",
        options: [
          momentOption("race", "Race them a length", {
            read: "funny",
            action: "challenge",
            roll: "fitness",
          }),
          momentOption("float", "Float and talk", {
            read: "warm",
            action: "time",
          }),
          momentOption("night", "Swim under the lights", {
            read: "flirty",
            only: "date",
          }),
        ],
      },
      {
        id: "garden",
        name: "Out in the garden",
        minutes: 20,
        needs: "garden",
        options: [
          momentOption("stars", "Look at the stars", {
            read: "flirty",
            only: "date",
          }),
          momentOption("quiet", "Sit in the quiet", {
            read: "warm",
            action: "space",
          }),
          momentOption("plants", "Show them what you grow", {
            read: "curious",
            action: "deep",
          }),
        ],
      },
      {
        id: "bar",
        name: "Drinks at your bar",
        minutes: 15,
        needs: "bar",
        taste: "food",
        options: [
          momentOption("champagne", "Open the champagne", {
            value: "fancy",
          }),
          momentOption("cocktail", "Mix something sweet", {
            value: "sweet",
          }),
          momentOption("beer", "Two cold beers", {
            value: "comfort",
          }),
        ],
      },
      {
        id: "console",
        name: "Play on the console",
        minutes: 30,
        needs: "console",
        options: [
          momentOption("win", "Play to win", {
            read: "funny",
            action: "challenge",
            roll: "luck",
          }),
          momentOption("letwin", "Let them win", {
            read: "warm",
            action: "care",
            letWin: true,
          }),
          momentOption("coop", "Play together, not against", {
            read: "warm",
            action: "time",
          }),
        ],
      },
      {
        id: "workout",
        name: "Work out together",
        minutes: 30,
        needs: "gym",
        only: "hang",
        options: [
          momentOption("push", "Push each other", {
            read: "funny",
            action: "challenge",
            roll: "fitness",
          }),
          momentOption("spot", "Spot them", {
            read: "warm",
            action: "care",
          }),
          momentOption("show", "Show off a little", {
            read: "funny",
            action: "novelty",
          }),
        ],
      },
      {
        id: "talk",
        name: "Talk on the sofa",
        minutes: 20,
        options: TALK_TOPIC_OPTIONS,
      },
    ],
  },
  their: {
    outing: "quiet",
    price: 0,
    home: "theirs",
    moments: [
      {
        id: "look",
        name: "Look around their place",
        minutes: 15,
        key: true,
        options: [
          momentOption("ask", "Ask about their things", {
            read: "curious",
            action: "deep",
          }),
          momentOption("snoop", "Snoop, openly", {
            read: "funny",
            action: "novelty",
          }),
          momentOption("nice", "Say it's a nice place", {
            read: "warm",
            action: "compliment",
          }),
        ],
      },
      {
        id: "cook",
        name: "Cook together",
        minutes: 40,
        taste: "food",
        needs: "noCook",
        meal: true,
        options: [
          momentOption("comfort", "Something comforting", {
            value: "comfort",
          }),
          momentOption("spicy", "Something spicy", {
            value: "spicy",
          }),
          momentOption("sweet", "Something sweet", {
            value: "sweet",
          }),
        ],
      },
      {
        id: "served",
        name: "Dinner is served",
        minutes: 40,
        needs: "cooks",
        dish: "theirs",
        meal: true,
        options: [
          momentOption("praise", "Tell them it's delicious", {
            read: "warm",
            action: "compliment",
          }),
          momentOption("recipe", "Ask how they made it", {
            read: "curious",
            action: "deep",
            learn: true,
          }),
          momentOption("seconds", "Ask for seconds", {
            read: "funny",
            action: "time",
          }),
        ],
      },
      {
        id: "talk",
        name: "Talk",
        minutes: 20,
        options: TALK_TOPIC_OPTIONS,
      },
    ],
  },
};
var OUTING_PLACE_IDS = Object.keys(OUTING_PLACES);
var outingPlaceHome = (placeId) => OUTING_PLACES[placeId]?.home ?? null;
var availableOutingPlaces = (town, kind) =>
  OUTING_PLACE_IDS.filter(
    (placeId) =>
      (outingPlaceHome(placeId) || town.places.some((place) => place.id === placeId)) &&
      !(kind === "date" && OUTING_PLACES[placeId].only === "hang"),
  );
function momentOptionsFor(moment, seed = 0) {
  return moment.pick ? moment.pick(seed) : (moment.options ?? []);
}

export { OUTING_PLACES, OUTING_PLACE_IDS, availableOutingPlaces, momentOption, momentOptionsFor, outingPlaceHome };
