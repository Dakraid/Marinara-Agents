// Moment availability, moment planning, birthday, wedding and honeymoon moments
import { OUTING_LIMITS } from "./outing-rules.mjs";
import { momentOption } from "./outing-places.mjs";

var MISSING_HOME_FEATURE_REASONS = {
  pool: "No pool",
  garden: "No garden",
  bar: "No bar",
  console: "No console",
  gym: "No home gym",
};
var MEAL_HOUR_RANGES = [
  [12, 14],
  [19, 22],
];
var isMealHour = (hour) => MEAL_HOUR_RANGES.some(([start, end]) => hour >= start && hour < end);
function momentBlockedReason(
  moment,
  { kind: kind, done = [], hour = 12, left = OUTING_LIMITS.minutes, has = {}, day = 1 },
) {
  return done.includes(moment.id)
    ? "Done"
    : moment.before && done.includes(moment.before)
      ? "Too late"
      : moment.day && moment.day !== day
        ? moment.day > day
          ? `Day ${moment.day}`
          : "Done"
        : moment.plan && !has[moment.plan]
          ? "Not in your plan"
          : moment.after && !done.includes(moment.after)
            ? `After ${WEDDING_MOMENT_SHORT_NAMES[moment.after] ?? moment.after}`
            : moment.only && moment.only !== kind
              ? moment.only === "date"
                ? "On a date"
                : "Hanging out"
              : moment.hours && !(hour >= moment.hours[0] && hour < moment.hours[1])
                ? `From ${String(moment.hours[0]).padStart(2, "0")}:00 to ${String(moment.hours[1]).padStart(2, "0")}:00`
                : moment.needs === "food" && !has.food
                  ? "No food with you"
                  : moment.needs === "kitchen" && !has.kitchen
                    ? "No kitchen"
                    : moment.needs === "tv" && !has.tv
                      ? "No TV"
                      : moment.needs === "cooks" && !has.cooks
                        ? "They don't cook"
                        : (moment.meal || moment.dish) &&
                            (done ?? []).some((doneId) => ["cook", "served"].includes(doneId))
                          ? "You already ate"
                          : moment.needs && MISSING_HOME_FEATURE_REASONS[moment.needs] && !has[moment.needs]
                            ? MISSING_HOME_FEATURE_REASONS[moment.needs]
                            : moment.needs === "noCook" && has.cooks
                              ? "They cook for you"
                              : moment.needs === "gift" && !has.gift
                                ? "No present in your backpack"
                                : (moment.minutes ?? 0) > left
                                  ? "No time left"
                                  : "";
}
function planOutingMoments(
  moments,
  {
    kind = "hang",
    has = {},
    hour = 12,
    seed = 0,
    exchanges = OUTING_LIMITS.exchanges,
    budget = OUTING_LIMITS.minutes - OUTING_LIMITS.exchanges * OUTING_LIMITS.talk,
    ordered = [],
    fromStart = false,
  } = {},
) {
  let isEligible = (moment) =>
      !moment.pay &&
      !moment.words &&
      (!moment.only || moment.only === kind) &&
      !(moment.plan && !has[moment.plan]) &&
      !momentBlockedReason(
        {
          ...moment,
          after: null,
          day: null,
        },
        {
          kind: kind,
          hour: hour,
          has: has,
          left: 1 / 0,
        },
      ),
    opener = moments[0]?.pay ? moments[0] : null,
    closer = moments.find((moment, index) => moment.pay && index > 0) ?? null,
    eligible = moments.filter(isEligible),
    required = eligible.filter(
      (moment) => ordered.includes(moment.id) || moment.key || (moment.meal && isMealHour(hour)),
    ),
    dateOnly =
      kind === "date"
        ? eligible.filter((moment) => moment.only === "date" && !required.includes(moment)).slice(0, 1)
        : [],
    shuffled = eligible
      .filter((moment) => !required.includes(moment) && !dateOnly.includes(moment))
      .map((moment, index) => ({
        m: moment,
        r: (Math.sin((seed + 1) * (index + 3)) + 1) / 2,
      }))
      .sort((left, right) => left.r - right.r)
      .map((entry) => entry.m),
    chosen = [...required, ...dateOnly, ...shuffled].slice(
      0,
      ordered.length ? required.length : Math.max(3, required.length + dateOnly.length),
    ),
    totalMinutes = (list) =>
      list.reduce((sum, moment) => sum + (moment.minutes ?? 5), 0) + (opener?.minutes ?? 0) + (closer?.minutes ?? 0);
  for (; totalMinutes(chosen) > budget;) {
    let longest = chosen
      .filter((moment) => !required.includes(moment))
      .sort((moment, other) => (other.minutes ?? 5) - (moment.minutes ?? 5))[0];
    if (!longest) {
      break;
    }
    chosen = chosen.filter((moment) => moment !== longest);
  }
  chosen = moments.filter((moment) => chosen.includes(moment));
  let schedule = opener
      ? [
          {
            id: opener.id,
            at: 0,
          },
        ]
      : [],
    span = exchanges - (closer ? 3 : 1);
  chosen.forEach((moment, index) =>
    schedule.push({
      id: moment.id,
      at: fromStart
        ? Math.round((index * span) / chosen.length)
        : Math.max(1, Math.round(((index + 1) * span) / (chosen.length + 1))),
    }),
  );
  if (closer) {
    schedule.push({
      id: closer.id,
      at: exchanges - 3,
    });
  }
  return schedule;
}
var GUEST_BIRTHDAY_MOMENTS = [
  {
    id: "toast",
    name: "The toast",
    minutes: 20,
    options: [
      momentOption("glass", "Raise a toast to them", {
        read: "warm",
        action: "time",
      }),
      momentOption("speech", "Make a little speech", {
        read: "warm",
        roll: "charm",
      }),
      momentOption("roast", "Roast them, lovingly", {
        read: "funny",
        action: "novelty",
      }),
    ],
  },
  {
    id: "present",
    name: "Your present",
    minutes: 10,
    needs: "gift",
    present: true,
    options: [
      momentOption("give", "Give them your present", {
        read: "warm",
        action: "time",
      }),
    ],
  },
  {
    id: "cake",
    name: "The cake",
    minutes: 15,
    options: [
      momentOption("candles", "Light the candles and sing", {
        read: "warm",
        action: "time",
      }),
      momentOption("frosting", "Frosting on the nose", {
        read: "funny",
        action: "novelty",
      }),
    ],
  },
];
var OWN_BIRTHDAY_MOMENTS = [
  {
    id: "toast",
    name: "They toast you",
    minutes: 20,
    options: [
      momentOption("thanks", "Thank everyone for coming", {
        read: "warm",
        action: "time",
      }),
      momentOption("speech", "Make a speech back", {
        read: "warm",
        roll: "charm",
      }),
      momentOption("shy", "Pretend you hate the attention", {
        read: "funny",
        action: "novelty",
      }),
    ],
  },
  {
    id: "presents",
    name: "Your presents",
    minutes: 15,
    presents: true,
    options: [
      momentOption("open", "Open your presents", {
        read: "warm",
        action: "time",
      }),
    ],
  },
  {
    id: "cake",
    name: "The cake",
    minutes: 15,
    options: [
      momentOption("wish", "Make a wish and blow", {
        read: "warm",
        action: "deep",
      }),
      momentOption("frosting", "Frosting on someone's nose", {
        read: "funny",
        action: "novelty",
      }),
    ],
  },
];
var WEDDING_OUTING = {
  outing: "wedding",
  price: 0,
  moments: [
    {
      id: "morning",
      name: "The morning \xB7 getting ready",
      minutes: 45,
      options: [
        momentOption("nerves", "Admit you're terrified", {
          read: "warm",
          action: "deep",
        }),
        momentOption("joke", "Joke your way through it", {
          read: "funny",
          action: "novelty",
        }),
        momentOption("breathe", "Just breathe", {
          read: "warm",
          action: "space",
        }),
      ],
    },
    {
      id: "vows",
      name: "The ceremony \xB7 your vows",
      minutes: 40,
      after: "morning",
      vows: true,
      keyImage: true,
      options: [],
    },
    {
      id: "toast",
      name: "The toasts",
      minutes: 30,
      after: "vows",
      options: [
        momentOption("glass", "Raise your glass to them", {
          read: "warm",
          action: "time",
        }),
        momentOption("speech", "Make a speech yourself", {
          read: "warm",
          roll: "charm",
        }),
        momentOption("stories", "Laugh at the stories about you", {
          read: "funny",
          action: "novelty",
        }),
      ],
    },
    {
      id: "cake",
      name: "The cake",
      minutes: 15,
      after: "vows",
      plan: "cake",
      options: [
        momentOption("feed", "Feed each other", {
          read: "flirty",
        }),
        momentOption("nose", "A little frosting on the nose", {
          read: "funny",
          action: "novelty",
        }),
      ],
    },
    {
      id: "photos",
      name: "The photos",
      minutes: 20,
      after: "vows",
      plan: "photos",
      keyImage: true,
      options: [
        momentOption("pose", "Pose properly", {
          read: "warm",
        }),
        momentOption("faces", "Make faces", {
          read: "funny",
          action: "novelty",
        }),
        momentOption("kiss", "Kiss for the camera", {
          read: "flirty",
        }),
      ],
    },
    {
      id: "dance",
      name: "The first dance",
      minutes: 20,
      after: "toast",
      keyImage: true,
      options: [
        momentOption("close", "Slow and close", {
          read: "flirty",
        }),
        momentOption("spin", "Spin them, badly", {
          read: "funny",
          roll: "charm",
        }),
        momentOption("whisper", "Whisper something only for them", {
          read: "warm",
          action: "deep",
        }),
      ],
    },
  ],
};
var honeymoonDayMoment = (id, day, title, options) => ({
  id: id,
  name: title,
  day: day,
  minutes: HONEYMOON_DAY_MINUTES,
  keyImage: true,
  options: options,
});
var HONEYMOON_DAY_MINUTES = 120;
var HONEYMOON_DESTINATIONS = {
  beach: {
    outing: "honeymoon",
    price: 0,
    moments: [
      honeymoonDayMoment("beach-1", 1, "The beach \xB7 day 1", [
        momentOption("swim", "Swim out to the rocks", {
          read: "warm",
          roll: "fitness",
        }),
        momentOption("lunch", "A long lunch by the sea", {
          read: "warm",
          action: "time",
        }),
        momentOption("room", "Don't leave the room all day", {
          read: "flirty",
        }),
      ]),
      honeymoonDayMoment("beach-2", 2, "The boat \xB7 day 2", [
        momentOption("snorkel", "Snorkel off the side", {
          read: "funny",
          roll: "fitness",
        }),
        momentOption("sunset", "Watch the sun go down from the deck", {
          read: "warm",
          action: "deep",
        }),
        momentOption("deck", "Dance on the deck, badly", {
          read: "funny",
          action: "novelty",
        }),
      ]),
      honeymoonDayMoment("beach-3", 3, "The last night \xB7 day 3", [
        momentOption("sand", "Dinner on the sand", {
          read: "warm",
          action: "time",
        }),
        momentOption("years", "Talk about the years ahead", {
          read: "warm",
          action: "deep",
        }),
        momentOption("midnight", "Back into the sea at midnight", {
          read: "flirty",
          action: "novelty",
        }),
      ]),
    ],
  },
  mountains: {
    outing: "honeymoon",
    price: 0,
    moments: [
      honeymoonDayMoment("mountains-1", 1, "The cabin \xB7 day 1", [
        momentOption("fire", "Light the fire together", {
          read: "warm",
          action: "time",
        }),
        momentOption("lake", "A hike to the lake", {
          read: "warm",
          roll: "fitness",
        }),
        momentOption("blanket", "Stay under the blanket", {
          read: "flirty",
        }),
      ]),
      honeymoonDayMoment("mountains-2", 2, "The summit \xB7 day 2", [
        momentOption("climb", "Climb to the top", {
          read: "warm",
          roll: "fitness",
        }),
        momentOption("picnic", "A picnic with the view", {
          read: "warm",
          action: "time",
        }),
        momentOption("snow", "Start a snowball fight", {
          read: "funny",
          action: "novelty",
        }),
      ]),
      honeymoonDayMoment("mountains-3", 3, "The last night \xB7 day 3", [
        momentOption("stars", "Count the stars from the porch", {
          read: "warm",
          action: "deep",
        }),
        momentOption("stories", "Tell the wedding stories again", {
          read: "funny",
          action: "time",
        }),
        momentOption("tub", "The hot tub, in the snow", {
          read: "flirty",
          action: "novelty",
        }),
      ]),
    ],
  },
  city: {
    outing: "honeymoon",
    price: 0,
    moments: [
      honeymoonDayMoment("city-1", 1, "The streets \xB7 day 1", [
        momentOption("wander", "Get lost on purpose", {
          read: "funny",
          action: "novelty",
        }),
        momentOption("museum", "The big museum", {
          read: "curious",
          action: "deep",
        }),
        momentOption("rooftop", "A rooftop bar", {
          read: "flirty",
          roll: "charm",
        }),
      ]),
      honeymoonDayMoment("city-2", 2, "A show \xB7 day 2", [
        momentOption("show", "The show everyone talks about", {
          read: "warm",
          action: "novelty",
        }),
        momentOption("dinner", "A dinner you can't afford", {
          read: "warm",
          action: "time",
        }),
        momentOption("club", "Dance until they close", {
          read: "funny",
          roll: "charm",
        }),
      ]),
      honeymoonDayMoment("city-3", 3, "The last night \xB7 day 3", [
        momentOption("view", "The view from the tower", {
          read: "warm",
          action: "deep",
        }),
        momentOption("market", "The night market", {
          read: "funny",
          action: "novelty",
        }),
        momentOption("hotel", "Room service, and nothing else", {
          read: "flirty",
        }),
      ]),
    ],
  },
};
var WEDDING_MOMENT_SHORT_NAMES = Object.fromEntries(
  WEDDING_OUTING.moments.map((moment) => [moment.id, moment.name.split(" \xB7 ")[0].toLowerCase()]),
);

export {
  GUEST_BIRTHDAY_MOMENTS,
  HONEYMOON_DAY_MINUTES,
  HONEYMOON_DESTINATIONS,
  OWN_BIRTHDAY_MOMENTS,
  WEDDING_OUTING,
  momentBlockedReason,
  planOutingMoments,
};
