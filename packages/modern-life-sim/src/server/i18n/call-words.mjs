// Translation of fixed UI call lines via placeholder templates and LLM
var CALL_WORD_FIELDS = ["label", "note", "why"];
var FIXED_CALL_WORD_FIELDS = ["text", "line", "why"];
var normalizeCallWordsLanguageKey = (language) =>
  String(language || "English")
    .trim()
    .toLowerCase()
    .slice(0, 40) || "english";
var isEnglishLanguage = (language) => normalizeCallWordsLanguageKey(language) === "english";
var LETTER_PATTERN = new RegExp("\\p{L}", "u");
var NUMBER_TOKEN_PATTERN = /\$?\d+(?:[.,:]\d+)*%?/g;
function extractCallWordsTemplate(text, names = []) {
  let source = String(text ?? ""),
    spans = [],
    isFree = (start, end) => !spans.some((span) => start < span.end && end > span.start);
  for (let properName of [
    ...new Set(names.filter((properName2) => typeof properName2 == "string" && properName2.trim())),
  ].sort((properName2, other) => other.length - properName2.length)) {
    for (
      let index = source.indexOf(properName);
      index >= 0;
      index = source.indexOf(properName, index + properName.length)
    ) {
      let end = index + properName.length;
      if (!(
        LETTER_PATTERN.test(source[index - 1] ?? "") ||
        LETTER_PATTERN.test(source[end] ?? "") ||
        !isFree(index, end)
      )) {
        spans.push({
          start: index,
          end: end,
          text: properName,
        });
      }
    }
  }
  for (let match of source.matchAll(NUMBER_TOKEN_PATTERN)) {
    if (isFree(match.index, match.index + match[0].length)) {
      spans.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
    }
  }
  spans.sort((a, b) => a.start - b.start);
  let key = "",
    cursor = 0;
  spans.forEach((span, index) => {
    key += `${source.slice(cursor, span.start)}{${index + 1}}`;
    cursor = span.end;
  });
  return {
    key: key + source.slice(cursor),
    params: spans.map((span) => span.text),
  };
}
var placeholderSignature = (text) =>
  [...String(text).matchAll(/\{(\d+)\}/g)]
    .map((match) => Number(match[1]))
    .sort((a, b) => a - b)
    .join(",");
function translateCallLine(bank, text, names = []) {
  if (!text || !bank) {
    return text;
  }
  let template = extractCallWordsTemplate(text, names),
    translated = bank[template.key];
  return typeof translated == "string"
    ? translated.replace(/\{(\d+)\}/g, (match, index) => template.params[Number(index) - 1] ?? "")
    : text;
}
var translatableCallFields = (entry) =>
  entry?.written
    ? []
    : entry?.fixed
      ? FIXED_CALL_WORD_FIELDS.filter((field) => typeof entry[field] == "string" && entry[field])
      : CALL_WORD_FIELDS.filter(
          (field) => typeof entry?.[field] == "string" && entry[field] && !(field === "label" && entry.labelWritten),
        );
var callWordsProperNames = (life, basePlaces = []) =>
  [
    ...(life?.characters ?? []).map((character) => character.name),
    life?.persona?.name,
    ...(life?.town?.places ?? [])
      .filter((place) => place?.name && basePlaces.find((basePlace) => basePlace.id === place.id)?.name !== place.name)
      .map((place) => place.name),
  ].filter(Boolean);
var translateCallOptions = (bank, options = [], names = []) =>
  Array.isArray(options)
    ? options.map((option) => ({
        ...option,
        ...Object.fromEntries(
          translatableCallFields(option).map((field) => [field, translateCallLine(bank, option[field], names)]),
        ),
      }))
    : options;
var translateFixedCallEntry = (bank, entry, names = []) =>
  entry?.fixed
    ? {
        ...entry,
        ...Object.fromEntries(
          translatableCallFields(entry).map((field) => [field, translateCallLine(bank, entry[field], names)]),
        ),
      }
    : entry;
var translateFixedCallLog = (bank, log, names) =>
  Array.isArray(log) && log.some((entry) => entry?.fixed)
    ? log.map((entry) => translateFixedCallEntry(bank, entry, names))
    : log;
var fixedEntriesOnly = (log) => (Array.isArray(log) ? log.filter((entry) => entry?.fixed) : null);
function collectCallWordGroups(state) {
  let scene = state?.scene,
    plea = state?.plea?.open;
  return [
    scene?.milestone?.options,
    scene?.tier?.call,
    scene?.walkIn?.options,
    state?.outing?.moment?.options,
    plea?.head,
    plea?.options,
    state?.ride?.head,
    state?.ride?.options,
    fixedEntriesOnly(scene?.log),
    fixedEntriesOnly(state?.outing?.log),
    fixedEntriesOnly(state?.career?.shift?.moments),
    fixedEntriesOnly([state?.visit?.invite]),
  ].filter((group) => Array.isArray(group) && group.length);
}
function translateStateCallWords(state, bank, names = []) {
  if (!state || !bank) {
    return state;
  }
  let scene = state.scene,
    outing = state.outing,
    shift = state.career?.shift;
  return {
    ...state,
    ...(scene
      ? {
          scene: {
            ...scene,
            ...(scene.milestone?.options
              ? {
                  milestone: {
                    ...scene.milestone,
                    options: translateCallOptions(bank, scene.milestone.options, names),
                  },
                }
              : {}),
            ...(scene.tier?.call
              ? {
                  tier: {
                    ...scene.tier,
                    call: translateCallOptions(bank, scene.tier.call, names),
                  },
                }
              : {}),
            ...(scene.walkIn?.options
              ? {
                  walkIn: {
                    ...scene.walkIn,
                    options: translateCallOptions(bank, scene.walkIn.options, names),
                  },
                }
              : {}),
            ...(Array.isArray(scene.log)
              ? {
                  log: translateFixedCallLog(bank, scene.log, names),
                }
              : {}),
          },
        }
      : {}),
    ...(outing
      ? {
          outing: {
            ...outing,
            ...(outing.moment?.options
              ? {
                  moment: {
                    ...outing.moment,
                    options: translateCallOptions(bank, outing.moment.options, names),
                  },
                }
              : {}),
            ...(Array.isArray(outing.log)
              ? {
                  log: translateFixedCallLog(bank, outing.log, names),
                }
              : {}),
          },
        }
      : {}),
    ...(shift?.moments
      ? {
          career: {
            ...state.career,
            shift: {
              ...shift,
              moments: translateFixedCallLog(bank, shift.moments, names),
            },
          },
        }
      : {}),
    ...(state.visit?.invite
      ? {
          visit: {
            ...state.visit,
            invite: translateFixedCallEntry(bank, state.visit.invite, names),
          },
        }
      : {}),
    ...(state.plea?.open?.options
      ? {
          plea: {
            ...state.plea,
            open: {
              ...state.plea.open,
              head: translateCallOptions(bank, state.plea.open.head, names),
              options: translateCallOptions(bank, state.plea.open.options, names),
            },
          },
        }
      : {}),
    ...(state.ride?.options
      ? {
          ride: {
            ...state.ride,
            head: translateCallOptions(bank, state.ride.head, names),
            options: translateCallOptions(bank, state.ride.options, names),
          },
        }
      : {}),
  };
}
function missingCallWordKeys(bank = {}, groups = [], names = []) {
  let keys = groups
    .flat()
    .flatMap((entry) => translatableCallFields(entry).map((field) => entry[field]))
    .filter((text) => typeof text == "string" && text.trim())
    .map((text) => extractCallWordsTemplate(text, names).key);
  return [...new Set(keys)].filter((key) => !(key in (bank ?? {})));
}
function buildCallWordsMessages(lines, language) {
  return [
    {
      role: "system",
      content: [
        "Task: call-words",
        `These are short lines a player reads in a modern life sim: the options of a choice on buttons, a line under some of them, and a few lines of a scene (what happens, or what someone says). Write each one as it reads in ${language}, natural and just as short, in the second person where it speaks to the player.`,
        "Keep every placeholder like {1} or {2} exactly as it is, once each, never dropped: the game puts a name, a number, an hour or a price there. A line of what happens stays in the third person, as it is. Keep \xAB\xBB and \xB7. Add nothing, explain nothing.",
        'Answer with JSON only, exactly: {"lines":["\u2026","\u2026"]} \u2014 the same number of lines, in the same order.',
      ].join(`
`),
    },
    {
      role: "user",
      content: lines.map((line, index) => `${index + 1}. ${line}`).join(`
`),
    },
  ];
}
function mergeCallWordsReply(bank = {}, keys = [], json) {
  let lines = Array.isArray(json?.lines) ? json.lines : [];
  if (lines.length !== keys.length) {
    return {
      bank: bank ?? {},
      kept: 0,
    };
  }
  let merged = {
      ...(bank ?? {}),
    },
    kept = 0;
  keys.forEach((key, index) => {
    let line = typeof lines[index] == "string" ? lines[index].replace(/\s+/g, " ").trim().slice(0, 200) : "";
    if (line && placeholderSignature(line) === placeholderSignature(key)) {
      merged[key] = line;
      kept += 1;
    }
  });
  return {
    bank: Object.fromEntries(Object.entries(merged).slice(-2e3)),
    kept: kept,
  };
}

export {
  buildCallWordsMessages,
  callWordsProperNames,
  collectCallWordGroups,
  isEnglishLanguage,
  mergeCallWordsReply,
  missingCallWordKeys,
  normalizeCallWordsLanguageKey,
  translateStateCallWords,
};
