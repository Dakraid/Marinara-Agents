// Model client: effort, context fitting, retries, language reminder, JSON repair
var REASONING_EFFORT_LEVELS = ["none", "low", "medium", "high", "xhigh", "maximum"];
var normalizeReasoningEffort = (effort) => (REASONING_EFFORT_LEVELS.includes(effort) ? effort : "low");
var providerReasoningEffort = (effort) => (effort === "maximum" ? "max" : effort);
var EXTRA_ROOM_TOKENS = 16e3;
var CONTEXT_SAFETY_TOKENS = 512;
function fitMaxTokensToContext(
  minTokens,
  { maxContext = null, promptTokens = 0, want = minTokens + EXTRA_ROOM_TOKENS } = {},
) {
  let contextSize = Number(maxContext) || 0;
  return contextSize
    ? Math.max(minTokens, Math.min(want, Math.floor(contextSize - (Number(promptTokens) || 0) - CONTEXT_SAFETY_TOKENS)))
    : want;
}
var estimatePromptTokens = (model, messages, maxTokens) => {
  try {
    let fit = model?.fitContext?.(messages, {
      maxTokens: maxTokens,
    });
    if (Number.isFinite(fit?.estimatedTokensBefore)) {
      return fit.estimatedTokensBefore;
    }
  } catch {
    // Best effort: nothing to do when this fails.
  }
  return Math.ceil(messages.reduce((sum, message) => sum + String(message.content ?? "").length, 0) / 3);
};
var EMPTY_ANSWER_RETRY_NOTE =
  "Your previous answer came back empty: nothing but thinking reached the game. Answer now: write the whole answer, complete, in the required format, outside any thinking.";
var OUT_OF_ROOM_RETRY_NOTE =
  "Your previous answer ran out of room before it was finished, most likely spent thinking. You now have more room, but do not spend it thinking: reason briefly and write the whole answer, complete, in the required format.";
var ERR_MODEL_NO_ANSWER = "The model didn't answer. Try again.";
var ERR_MODEL_OUT_OF_ROOM = "The model ran out of room before it could answer. Try again.";
var ERR_MODEL_INCOMPLETE = "The model's answer came back incomplete. Try again.";
var SUPPORTED_LANGUAGES = [
  "English",
  "Spanish",
  "Portuguese",
  "French",
  "Italian",
  "German",
  "Japanese",
  "Korean",
  "Chinese",
  "Russian",
];
var DEFAULT_LANGUAGE = "English";
var normalizeLanguageName = (raw) => {
  let text = String(raw ?? "")
    .trim()
    .slice(0, 40);
  return text
    ? (SUPPORTED_LANGUAGES.find((language) => language.toLowerCase() === text.toLowerCase()) ?? text)
    : DEFAULT_LANGUAGE;
};
function appendLanguageReminder(messages, language) {
  let languageName = normalizeLanguageName(language),
    lastMessage = messages?.[messages.length - 1];
  if (
    !lastMessage ||
    lastMessage.role !== "user" ||
    !messages.some((message) => String(message.content ?? "").includes(`in ${languageName}`))
  ) {
    return messages;
  }
  let reminder = `LANGUAGE: write every line of prose in ${languageName}, even where the material above (cards, persona, memories) is in another language \u2014 translate whatever you take from it. Keys, closed words and whatever the instructions ask for in a set language (a picture's prompt) stay exactly as asked.`;
  return [
    ...messages.slice(0, -1),
    {
      ...lastMessage,
      content: `${String(lastMessage.content ?? "").trimEnd()}

${reminder}`,
    },
  ];
}
var CancelledError = class extends Error {
  constructor() {
    super("Cancelled.");
    this.name = "CancelledError";
    this.cancelled = true;
  }
};
function raceWithAbortSignal(promise, signal) {
  return signal
    ? signal.aborted
      ? Promise.reject(new CancelledError())
      : (promise.catch(() => {}),
        new Promise((resolve, reject) => {
          let onAbort = () => reject(new CancelledError());
          signal.addEventListener("abort", onAbort, {
            once: true,
          });
          promise.then(
            (value) => {
              signal.removeEventListener("abort", onAbort);
              if (signal.aborted) {
                onAbort();
              } else {
                resolve(value);
              }
            },
            (error) => {
              signal.removeEventListener("abort", onAbort);
              reject(signal.aborted ? new CancelledError() : error);
            },
          );
        }))
    : promise;
}
var ANSWER_SNIPPET_MAX = 220;
var answerSnippet = (raw) => {
  let text = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > ANSWER_SNIPPET_MAX ? `${text.slice(0, ANSWER_SNIPPET_MAX).replace(/\s+\S*$/, "")}\u2026` : text;
};
var brokenAnswerError = (message, why) =>
  Object.assign(new Error(message), {
    broken: true,
    why: why,
  });
function describeJsonParseError(text, error) {
  let position = Number(/position (\d+)/.exec(String(error?.message ?? ""))?.[1]);
  return Number.isFinite(position)
    ? `it is not valid JSON at character ${position}, here: ${text.slice(Math.max(0, position - 40), position + 20)}`
    : "it is not valid JSON";
}
var JSON_VALUE_START_RE = /^\s*(?:["{[\]}]|-?\d|true\b|false\b|null\b|$)/;
var JSON_KEY_START_RE = /^\s*"(?:[^"\\]|\\.)*"\s*:/;
var quoteClosesJsonString = (text, index, inObject) => {
  let rest = text.slice(index).trimStart(),
    next = rest[0];
  return next === undefined || next === ":" || next === "}" || next === "]"
    ? true
    : next === "," && (inObject ? JSON_KEY_START_RE : JSON_VALUE_START_RE).test(rest.slice(1));
};
function escapeStrayJsonQuotes(text) {
  let out = "",
    inString = false,
    stack = [];
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    if (!inString) {
      if (ch === '"') {
        inString = true;
      } else if (ch === "{" || ch === "[") {
        stack.push(ch);
      } else if (ch === "}" || ch === "]") {
        stack.pop();
      }
      out += ch;
      continue;
    }
    if (ch === "\\") {
      out += ch + (text[i + 1] ?? "");
      i++;
      continue;
    }
    if (ch !== '"') {
      out += ch;
      continue;
    }
    if (quoteClosesJsonString(text, i + 1, stack.at(-1) === "{")) {
      inString = false;
      out += ch;
    } else {
      out += '\\"';
    }
  }
  return out;
}
var repairWhoTextKeys = (text) => text.replace(/("who"\s*:\s*"(?:[^"\\]|\\.)*")\s*:\s*"/g, '$1,"text":"');
var answerRepairPrompt = (why) =>
  `Your answer above could not be used: ${why}. Write the whole answer again, complete, in the same JSON shape and with everything it had; every line has its text. Only the JSON.`;
function createModelClient({
  runtime: runtime,
  settings = {},
  onCall = null,
  onGone = null,
  signal: defaultSignal = null,
}) {
  let languageModels = runtime?.languageModels ?? null,
    parseJsonish = runtime?.json?.parseJsonish ?? null;
  async function resolveModel() {
    let connectionId = settings.connection || null;
    try {
      return await languageModels.resolveForRequest({
        connectionId: connectionId,
        chatConnectionId: null,
      });
    } catch (err) {
      if (!connectionId || !/connection (?:not found|no longer exists)/i.test(String(err?.message ?? ""))) {
        throw err;
      }
      try {
        onGone?.(connectionId);
      } catch {
        // Best effort: nothing to do when this fails.
      }
      return languageModels.resolveForRequest({
        connectionId: null,
        chatConnectionId: null,
      });
    }
  }
  async function callModel(messages, { maxTokens = 700, task = "call", signal = defaultSignal, about = "" } = {}) {
    if (!languageModels?.resolveForRequest) {
      throw new Error("This engine cannot lend a model to the package.");
    }
    let originalMessages = messages;
    if (((messages = appendLanguageReminder(messages, settings.language)), signal?.aborted)) {
      throw new CancelledError();
    }
    let effort = normalizeReasoningEffort(settings.effort),
      model = null,
      attempt = async (attemptMessages, attemptTask, want, effortCap = null) => {
        let startedAt = Date.now(),
          cap = null,
          attemptEffort =
            effortCap && REASONING_EFFORT_LEVELS.indexOf(effortCap) < REASONING_EFFORT_LEVELS.indexOf(effort)
              ? effortCap
              : effort,
          report = (extra) => {
            try {
              onCall?.({
                task: attemptTask,
                about: String(about ?? ""),
                model: String(model?.model ?? ""),
                connection: String(model?.connectionId ?? settings.connection ?? ""),
                effort: attemptEffort,
                maxTokens: cap ?? maxTokens,
                messages: attemptMessages,
                ms: Date.now() - startedAt,
                ...extra,
              });
            } catch {
              // Best effort: nothing to do when this fails.
            }
          },
          answer;
        try {
          model ??= await resolveModel();
          cap = fitMaxTokensToContext(maxTokens, {
            maxContext: model.maxContext,
            promptTokens: estimatePromptTokens(model, attemptMessages, maxTokens),
            want: want,
          });
          answer = await raceWithAbortSignal(
            model.chatComplete(attemptMessages, {
              maxTokens: cap,
              reasoningEffort: providerReasoningEffort(attemptEffort),
              signal: signal,
            }),
            signal,
          );
        } catch (err) {
          report({
            outcome: err?.cancelled ? "cancelled" : "failed",
            error: String(err?.message ?? err),
          });
          throw err;
        }
        let text = String(answer?.content ?? "").trim(),
          emptyWhy = text
            ? ""
            : `The model answered nothing${answer?.finishReason ? ` (${answer.finishReason})` : ""}.`;
        report({
          outcome: text ? "ok" : "failed",
          text: text,
          finish: String(answer?.finishReason ?? ""),
          usage: answer?.usage ?? null,
          error: emptyWhy,
        });
        return {
          answer: answer,
          text: text,
          empty: emptyWhy,
          cap: cap,
        };
      },
      result = await attempt(messages, task, undefined);
    if (result.answer?.finishReason === "length") {
      let retryMessages = appendLanguageReminder(
          [
            ...originalMessages,
            {
              role: "user",
              content: OUT_OF_ROOM_RETRY_NOTE,
            },
          ],
          settings.language,
        ),
        roomGrows =
          fitMaxTokensToContext(maxTokens, {
            maxContext: model?.maxContext,
            promptTokens: estimatePromptTokens(model, retryMessages, maxTokens),
            want: result.cap * 2,
          }) > result.cap;
      result = await attempt(retryMessages, `${task}-more-room`, result.cap * 2, roomGrows ? null : "low");
    } else if (!result.text && !signal?.aborted) {
      let retryMessages = appendLanguageReminder(
        [
          ...originalMessages,
          {
            role: "user",
            content: EMPTY_ANSWER_RETRY_NOTE,
          },
        ],
        settings.language,
      );
      result = await attempt(retryMessages, `${task}-again`, result.cap);
    }
    if (!result.text) {
      throw Object.assign(
        new Error(result.answer?.finishReason === "length" ? ERR_MODEL_OUT_OF_ROOM : ERR_MODEL_NO_ANSWER),
        {
          detail: result.empty,
        },
      );
    }
    return {
      text: result.text,
      model: String(result.answer?.model ?? model.model ?? ""),
    };
  }
  function parseAnswerJson(text) {
    if (parseJsonish) {
      try {
        let parsed = parseJsonish(text);
        if (parsed && typeof parsed == "object") {
          return parsed;
        }
      } catch {
        // Best effort: nothing to do when this fails.
      }
    }
    let start = text.indexOf("{"),
      end = text.lastIndexOf("}");
    if (start < 0 || end <= start) {
      throw brokenAnswerError(`The model answered something else: \xAB${answerSnippet(text)}\xBB`, "it is not JSON");
    }
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (err) {
      let repaired = repairWhoTextKeys(escapeStrayJsonQuotes(text.slice(start, end + 1)));
      try {
        let parsed = parseJsonish ? parseJsonish(repaired) : JSON.parse(repaired);
        if (parsed && typeof parsed == "object") {
          return parsed;
        }
      } catch {
        // Best effort: nothing to do when this fails.
      }
      throw brokenAnswerError(
        `The model's answer could not be read: \xAB${answerSnippet(text)}\xBB`,
        describeJsonParseError(text.slice(start, end + 1), err),
      );
    }
  }
  async function askForJson(messages, { check = null, ...options } = {}) {
    let readJson = (text) => {
        let parsed = parseAnswerJson(text),
          problem = check ? check(parsed) : "";
        if (problem) {
          throw brokenAnswerError(ERR_MODEL_INCOMPLETE, problem);
        }
        return parsed;
      },
      first = await callModel(messages, options);
    try {
      return {
        ...first,
        json: readJson(first.text),
      };
    } catch (err) {
      if (!err?.broken) {
        throw err;
      }
      let retryMessages = [
          ...messages,
          {
            role: "assistant",
            content: first.text,
          },
          {
            role: "user",
            content: answerRepairPrompt(err.why),
          },
        ],
        second = await callModel(retryMessages, {
          ...options,
          task: `${options.task ?? "call"}-fixed`,
        });
      return {
        ...second,
        json: readJson(second.text),
      };
    }
  }
  return {
    ask: callModel,
    askJson: askForJson,
    asJson: parseAnswerJson,
    settings: settings,
  };
}

export {
  DEFAULT_LANGUAGE,
  REASONING_EFFORT_LEVELS,
  SUPPORTED_LANGUAGES,
  createModelClient,
  normalizeLanguageName,
  normalizeReasoningEffort,
};
