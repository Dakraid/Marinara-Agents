// Image prompt templates and builders for backgrounds, outfits and key scene illustrations
import { BACKGROUND_SUBJECTS, parseBackgroundKey } from "./backgrounds.mjs";

var splitPromptTags = (text) =>
  String(text ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
function mergePromptTags(...lists) {
  let seen = new Set(),
    tags = [];
  for (let list of lists) {
    for (let tag of splitPromptTags(list)) {
      let key = tag.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        tags.push(tag);
      }
    }
  }
  return tags.join(", ");
}
var isTaggedPromptMode = (profile) => profile?.promptMode === "danbooru" || profile?.promptMode === "tagged";
function composeStyledPrompt(content, profile = {}, subjectKind = "illustration", { styleFromModel = false } = {}) {
  let subjectTags = String(profile.subjectTags?.[subjectKind] ?? "").trim(),
    styleText = styleFromModel ? "" : String(profile.styleText ?? "").trim(),
    positiveTags = String(profile.positiveTags ?? "").trim();
  return isTaggedPromptMode(profile)
    ? mergePromptTags(positiveTags, subjectTags, styleText, content)
    : [positiveTags, subjectTags, styleText, String(content ?? "").trim()]
        .filter(Boolean)
        .map((part) => part.replace(/[.\s]+$/, ""))
        .join(". ") + ".";
}
function styleGuidanceLine(profile = {}) {
  let styleText = String(profile.styleText ?? "").trim();
  return !styleText || (profile.baseStyle ?? "auto") === "auto"
    ? ""
    : `Visual style guidance: compose the prompt so it naturally reflects this style: ${styleText}. Weave the style into the description; do not copy this guidance word for word.`;
}
var asciiPromptText = (text) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
var BACKGROUND_NEGATIVE_TAGS =
  "1girl, 1boy, person, people, character, portrait, face, crowd, text, captions, logos, watermark, signature, border, frame, UI";
var LIGHT_TAGS = {
  day: "daytime, natural light",
  night: "night, evening, warm artificial lights, dark sky",
};
var LIGHT_PROSE = {
  day: "In daylight.",
  night: "At night, lit by warm artificial lights.",
};
var DEFAULT_IMAGE_PROMPTS = {
  "background.tags": "scenery, no humans, background, wide shot, {place}, {light}, {town}",
  "background.prose":
    "A background illustration of {place}. {light} {town} Wide establishing shot. No people in frame.",
  "background.light.day.tags": LIGHT_TAGS.day,
  "background.light.night.tags": LIGHT_TAGS.night,
  "background.light.indoor.tags": "indoors, interior lighting",
  "background.light.day.prose": LIGHT_PROSE.day,
  "background.light.night.prose": LIGHT_PROSE.night,
  "background.light.indoor.prose": "Indoors, under the shop's own lights.",
  "background.negative": BACKGROUND_NEGATIVE_TAGS,
  "outfit.tags": "solo, full body, standing, looking at viewer, simple background, white background",
  "outfit.prose": "A full-body portrait of one person standing, facing the viewer, on a plain light background.",
  "outfit.negative": "multiple people, crowd, cropped, cut off feet, text, captions, watermark, signature, frame",
  "keyImage.register.tags":
    "Write it as comma-separated tags for a tag-based anime image model (danbooru style): first how many people and of what sex (e.g. 2girls, 1girl 1boy), then what they do and how they are framed, the place and the light, then each person's look in order.",
  "keyImage.register.prose":
    "Write it as one plain paragraph describing the illustration: who is where, what they do, how it is framed, the place and the light.",
  "keyImage.rules":
    "It is ONE single illustration: never panels, several views or a comic strip. Every face in frame. Each person exactly as described here, in this order:",
  "keyImage.seen": "Only what can be seen: no names, no feelings that do not show, no text in the picture.",
  "keyImage.negative": "head out of frame, cropped head, text, captions, watermark, signature",
  "keyImage.negative.group": "multiple views, split screen, 2koma, comic, panels, collage, reference sheet",
};
var IMAGE_PROMPT_KEYS = Object.keys(DEFAULT_IMAGE_PROMPTS);
var IMAGE_PROMPT_MAX = 2e3;
function cleanImagePromptOverrides(overrides = {}) {
  let clean = {};
  for (let key of IMAGE_PROMPT_KEYS) {
    let text =
      typeof overrides?.[key] == "string"
        ? overrides[key]
            .replace(
              /\r\n?/g,
              `
`,
            )
            .trim()
            .slice(0, IMAGE_PROMPT_MAX)
        : "";
    if (text && text !== DEFAULT_IMAGE_PROMPTS[key]) {
      clean[key] = text;
    }
  }
  return clean;
}
var imagePromptsWithOverrides = (overrides = {}) => ({
  ...DEFAULT_IMAGE_PROMPTS,
  ...cleanImagePromptOverrides(overrides),
});
var fillPromptTemplate = (template, values = {}) =>
  String(template ?? "")
    .replace(/\{(\w+)\}/g, (match, key) => values[key] ?? "")
    .replace(/[ \t]+/g, " ")
    .trim();
function backgroundImagePrompt(key, { profile = {}, townTags = "", prompts = DEFAULT_IMAGE_PROMPTS } = {}) {
  let { subject: subjectId, time: time } = parseBackgroundKey(key),
    subject = BACKGROUND_SUBJECTS[subjectId];
  if (!subject) {
    throw new Error(`No background for ${subjectId}.`);
  }
  let tagged = profile.promptMode === "danbooru" || profile.promptMode === "tagged",
    townText = asciiPromptText(townTags),
    light = prompts[`background.light.${subject.indoor ? "indoor" : time}.${tagged ? "tags" : "prose"}`],
    content = tagged
      ? mergePromptTags(
          fillPromptTemplate(prompts["background.tags"], {
            place: subject.tags,
            light: light,
            town: townText,
          }),
        )
      : fillPromptTemplate(prompts["background.prose"], {
          place: subject.prose,
          light: light,
          town: townText ? `${townText}.` : "",
        }),
    prompt = composeStyledPrompt(content, profile, "background");
  return {
    prompt: asciiPromptText(prompt),
    negativePrompt: mergePromptTags(profile.negativeTags, prompts["background.negative"]),
  };
}
var SEX_COUNT_TAGS = {
  female: "1girl",
  male: "1boy",
  futanari: "1girl, futanari",
};
var SEX_NOUNS = {
  female: "a woman",
  male: "a man",
  futanari: "a futanari",
};
var promptShortName = (fullName) =>
  String(fullName ?? "")
    .split(",")[0]
    .replace(/\s+/g, " ")
    .trim();
function outfitImagePrompt({
  appearance = "",
  outfit = "",
  profile = {},
  prompts = DEFAULT_IMAGE_PROMPTS,
  name: personName = "",
  sex = "",
} = {}) {
  let tagged = profile.promptMode === "danbooru" || profile.promptMode === "tagged",
    body = String(appearance)
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[.\s]+$/, ""),
    clothes = String(outfit)
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[.\s]+$/, ""),
    shortName = promptShortName(personName),
    who = [shortName, SEX_NOUNS[sex]].filter(Boolean).join(", "),
    prose = [
      !tagged && who ? `${who.charAt(0).toUpperCase()}${who.slice(1)}.` : "",
      body ? `${body}.` : "",
      clothes ? `Wearing ${clothes}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    countTags = [SEX_COUNT_TAGS[sex], shortName].filter(Boolean).join(", "),
    prompt = tagged
      ? `${composeStyledPrompt(countTags ? `${countTags}, ${prompts["outfit.tags"]}` : prompts["outfit.tags"], profile, null)}, ${prose}`
      : composeStyledPrompt(`${prompts["outfit.prose"]} ${prose}`, profile, null);
  return {
    prompt: asciiPromptText(prompt),
    negativePrompt: mergePromptTags(profile.negativeTags, prompts["outfit.negative"]),
  };
}
var SHOT_FRAMINGS = {
  "close-up": {
    tags: "close-up, upper body",
    prose: "A close-up on their faces and shoulders.",
  },
  "two-shot": {
    tags: "upper body, facing each other",
    prose: "A medium shot of them together, from the waist up.",
  },
  medium: {
    tags: "cowboy shot",
    prose: "A medium shot, from the thighs up.",
  },
  wide: {
    tags: "full body, wide shot",
    prose: "A wide shot, their whole figures in the place.",
  },
  "from-behind": {
    tags: "from behind",
    prose: "Seen from behind them.",
  },
  "over-shoulder": {
    tags: "over the shoulder, depth of field",
    prose: "Over one of their shoulders, towards the other.",
  },
};
var SHOT_CONTACTS = {
  kiss: {
    tags: "kiss, couple, face-to-face, eyes closed",
    prose: "They are kissing.",
  },
  hug: {
    tags: "hug, couple, embrace",
    prose: "They are hugging.",
  },
  "holding-hands": {
    tags: "holding hands, couple",
    prose: "They are holding hands.",
  },
  touch: {
    tags: "couple, hand on another's cheek",
    prose: "One of them touches the other.",
  },
  none: {
    tags: "",
    prose: "",
  },
};
var GROUP_NEGATIVE_TAGS = "multiple views, split screen, 2koma, comic, panels, collage, reference sheet";
function peopleCountTags(people) {
  let females = people.filter((person) => person.sex === "female" || person.sex === "futanari").length,
    males = people.filter((person) => person.sex === "male").length,
    others = people.length - females - males,
    countTag = (count, singular, plural) => (count ? `${count}${count === 1 ? singular : plural}` : "");
  return [
    countTag(females, "girl", "girls"),
    countTag(males, "boy", "boys"),
    countTag(others, "other", "others"),
    people.some((person) => person.sex === "futanari") ? "futanari" : "",
  ]
    .filter(Boolean)
    .join(", ");
}
var cleanPromptPhrase = (text) =>
  asciiPromptText(
    String(text ?? "")
      .replace(/\s+/g, " ")
      .trim(),
  ).replace(/[.\s]+$/, "");
function keyImageBrief({
  people = [],
  subject = null,
  time = "day",
  tagged = false,
  profile = null,
  prompts = DEFAULT_IMAGE_PROMPTS,
  guidance = [],
} = {}) {
  let subjectInfo = BACKGROUND_SUBJECTS[subject] ?? null,
    peopleLines = people.map(
      (person, index) =>
        `- ${people.length > 1 ? `${index === 0 ? "left" : index === people.length - 1 ? "right" : `number ${index + 1} from the left`}: ` : ""}${person.name}${SEX_NOUNS[person.sex] ? ` (${SEX_NOUNS[person.sex]})` : ""} \u2014 ${cleanPromptPhrase(person.body) || "as they are"}${person.outfit ? `; wearing ${cleanPromptPhrase(person.outfit)}` : ""}`,
    );
  return [
    prompts[tagged ? "keyImage.register.tags" : "keyImage.register.prose"],
    prompts["keyImage.rules"],
    ...peopleLines,
    subjectInfo
      ? `The place: ${subjectInfo.prose}${subjectInfo.indoor ? "" : time === "night" ? ", at night" : ", in daylight"}.`
      : "",
    ...guidance,
    prompts["keyImage.seen"],
    profile ? styleGuidanceLine(profile) : "",
  ].filter(Boolean).join(`
`);
}
function imagePromptsPreview({
  prompts = DEFAULT_IMAGE_PROMPTS,
  town: townProfile = {},
  images: imageProfile = {},
  townTags = "",
  key = "park|day",
  you = null,
  entry = null,
  people = [],
} = {}) {
  let profileView = (profile, subjectKind) => ({
      name: profile.name ?? "",
      tagged: isTaggedPromptMode(profile),
      positive: profile.positiveTags ?? "",
      subject: subjectKind ? (profile.subjectTags?.[subjectKind] ?? "") : "",
      style: profile.styleText ?? "",
      negative: profile.negativeTags ?? "",
    }),
    background;
  try {
    background = backgroundImagePrompt(key, {
      profile: townProfile,
      townTags: townTags,
      prompts: prompts,
    });
  } catch {
    key = "park|day";
    background = backgroundImagePrompt(key, {
      profile: townProfile,
      townTags: townTags,
      prompts: prompts,
    });
  }
  let outfit = outfitImagePrompt({
      appearance: you?.body ?? "",
      outfit: you?.outfit ?? "",
      profile: imageProfile,
      prompts: prompts,
      name: you?.name ?? "",
      sex: you?.sex ?? "",
    }),
    preview = {
      background: {
        key: key,
        prompt: background.prompt,
        negative: background.negativePrompt,
        profile: profileView(townProfile, "background"),
      },
      outfit: {
        prompt: outfit.prompt,
        negative: outfit.negativePrompt,
        profile: profileView(imageProfile, null),
      },
      key: null,
    };
  if (entry?.picture?.prompt) {
    let keyPrompt = keyImagePrompt({
      written: entry.picture.prompt,
      profile: imageProfile,
      people: people.length,
      prompts: prompts,
    });
    preview.key = {
      entry: entry.id,
      brief: keyImageBrief({
        people: people,
        subject: entry.subject,
        time: entry.time,
        tagged: isTaggedPromptMode(imageProfile),
        profile: imageProfile,
        prompts: prompts,
      }),
      written: entry.picture.prompt,
      prompt: keyPrompt.prompt,
      negative: keyPrompt.negativePrompt,
      profile: profileView(imageProfile, "illustration"),
    };
  }
  return preview;
}
function keyImagePrompt({ written = "", profile = {}, people = 2, prompts = DEFAULT_IMAGE_PROMPTS } = {}) {
  let text = asciiPromptText(String(written).replace(/\s+/g, " ").trim()),
    styled = composeStyledPrompt(text, profile, "illustration", {
      styleFromModel: true,
    });
  return {
    prompt: asciiPromptText(styled),
    negativePrompt: mergePromptTags(
      profile.negativeTags,
      people > 1 ? prompts["keyImage.negative.group"] : "",
      prompts["keyImage.negative"],
    ),
  };
}
function sceneIllustrationPrompt({ people = [], picture = {}, subject = null, time = "day", profile = {} } = {}) {
  let tagged = profile.promptMode === "danbooru" || profile.promptMode === "tagged",
    subjectInfo = BACKGROUND_SUBJECTS[subject] ?? null,
    framing =
      SHOT_FRAMINGS[people.length > 1 && picture.framing === "close-up" ? "two-shot" : picture.framing] ??
      SHOT_FRAMINGS["two-shot"],
    contact = SHOT_CONTACTS[picture.contact] ?? SHOT_CONTACTS.none,
    positions =
      people.length === 2
        ? ["on the left", "on the right"]
        : people.map((person, index) => `number ${index + 1} from the left`),
    personLines = people.map(
      (person, index) =>
        `${positions[index]}: ${[cleanPromptPhrase(person.body), person.outfit ? `wearing ${cleanPromptPhrase(person.outfit)}` : ""].filter(Boolean).join(", ")}`,
    ),
    prompt = tagged
      ? `${mergePromptTags(peopleCountTags(people), contact.tags, framing.tags, cleanPromptPhrase(picture.action), cleanPromptPhrase(picture.expression), subjectInfo?.tags, subjectInfo?.indoor ? "indoors" : LIGHT_TAGS[time], profile.positiveTags)}, ${personLines.join("; ")}`
      : [
          String(profile.styleText ?? "").trim(),
          `An illustration of ${people.length === 1 ? "one person" : `${people.length} people`}.`,
          ...personLines.map((line) => `${line.charAt(0).toUpperCase()}${line.slice(1)}.`),
          contact.prose,
          picture.action ? `${cleanPromptPhrase(picture.action)}.` : "",
          picture.expression ? `Their expressions: ${cleanPromptPhrase(picture.expression)}.` : "",
          framing.prose,
          subjectInfo ? `In ${subjectInfo.prose}.` : "",
          subjectInfo?.indoor ? "" : LIGHT_PROSE[time],
          String(profile.positiveTags ?? "").trim(),
        ]
          .filter(Boolean)
          .join(" ");
  return {
    prompt: asciiPromptText(prompt),
    negativePrompt: mergePromptTags(
      profile.negativeTags,
      people.length === 2 ? "3girls, 3boys, extra people" : "",
      GROUP_NEGATIVE_TAGS,
      "head out of frame, cropped head, crowd, text, captions, watermark, signature, frame, UI",
    ),
  };
}

export {
  DEFAULT_IMAGE_PROMPTS,
  backgroundImagePrompt,
  cleanImagePromptOverrides,
  imagePromptsPreview,
  imagePromptsWithOverrides,
  keyImageBrief,
  keyImagePrompt,
  outfitImagePrompt,
  sceneIllustrationPrompt,
};
