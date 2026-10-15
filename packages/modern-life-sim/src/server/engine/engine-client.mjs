// HTTP client for the Marinara engine API: personas, cards, connections, images, gallery
import nodeHttps from "node:https";

var ENGINE_TIMEOUT_MS = 8e3;
var ENGINE_IMAGE_TIMEOUT_MS = 600 * 1e3;
var CATALOG_PAGE_SIZE = 100;
var CATALOG_MAX_PAGES = 60;
var normalizeHostAddress = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^\[|\]$/g, "")
    .replace(/^::ffff:(?=\d+\.)/, "");
var isLoopbackAddress = (address) => /^127\./.test(address) || address === "::1";
var bracketIpv6Host = (host) => (host.includes(":") ? `[${host}]` : host);
function resolveEngineHost(hostValue, requestAddress = "") {
  let host = normalizeHostAddress(hostValue),
    address = normalizeHostAddress(requestAddress);
  return address && isLoopbackAddress(address)
    ? bracketIpv6Host(address)
    : !host || host === "0.0.0.0" || host === "::" || isLoopbackAddress(host)
      ? "127.0.0.1"
      : host === "localhost"
        ? "localhost"
        : bracketIpv6Host(address || host);
}
var engineUsesTls = (env) => !!(String(env.SSL_CERT ?? "").trim() && String(env.SSL_KEY ?? "").trim());
function engineBaseUrlFromEnv(env = {}) {
  let port = String(env.PORT ?? "").trim();
  return /^\d+$/.test(port)
    ? `${engineUsesTls(env) ? "https" : "http"}://${resolveEngineHost(env.HOST)}:${port}`
    : null;
}
function engineRequestHeaders(env = {}) {
  let secret = String(env.ADMIN_SECRET ?? "").trim();
  return {
    accept: "application/json",
    ...(secret
      ? {
          "X-Admin-Secret": secret,
        }
      : {}),
  };
}
var asText = (value) => (typeof value == "string" ? value : value == null ? "" : String(value));
function avatarOverrideId(characterName) {
  return `avatar:${
    String(characterName ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 120) || "character"
  }`;
}
var IMAGE_MIME_EXTENSIONS = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};
function parseImageDataUrl(value) {
  let match = /^data:([^;,]+);base64,([\s\S]+)$/u.exec(asText(value));
  if (!match) {
    return null;
  }
  let mime = match[1].toLowerCase(),
    ext = IMAGE_MIME_EXTENSIONS[mime],
    base64 = match[2].replace(/\s+/gu, "");
  return ext && base64
    ? {
        mime: mime,
        ext: ext,
        base64: base64,
      }
    : null;
}
var gallerySlug = (value) =>
  asText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/(^-|-$)/gu, "")
    .slice(0, 60) || "background";
var parseJsonOrNull = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};
var usesNovelaiSubjectResolution = (settings) => {
  let imageGeneration = (typeof settings == "string" ? parseJsonOrNull(settings) : settings)?.imageGeneration;
  return imageGeneration?.service === "novelai" && imageGeneration?.novelai?.dynamicResolutionBySubjectCount === true;
};
async function httpsRequestFetch(
  url,
  init = {},
  serverName = "",
  requestImpl = nodeHttps.request,
  { loopback = false } = {},
) {
  let parsed = new URL(url),
    body = init.body,
    headers = {
      ...(init.headers ?? {}),
    };
  if (body !== undefined && typeof body != "string" && !(body instanceof Uint8Array)) {
    let response = new Response(body);
    headers["content-type"] = response.headers.get("content-type");
    body = Buffer.from(await response.arrayBuffer());
  }
  return new Promise((resolve, reject) => {
    let request = requestImpl(
      {
        hostname: parsed.hostname.replace(/^\[|\]$/g, ""),
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: init.method ?? "GET",
        headers: headers,
        signal: init.signal,
        ...(serverName
          ? {
              servername: serverName,
            }
          : {}),
        ...(loopback
          ? {
              rejectUnauthorized: false,
            }
          : {}),
      },
      (res) => {
        let chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("error", reject);
        res.on("end", () => {
          let buffer = Buffer.concat(chunks);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            headers: {
              get: (header) => res.headers[String(header).toLowerCase()] ?? null,
            },
            json: async () => JSON.parse(buffer.toString("utf8")),
            text: async () => buffer.toString("utf8"),
            arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
          });
        });
      },
    );
    request.on("error", reject);
    if (body !== undefined) {
      request.write(body);
    }
    request.end();
  });
}
function tlsServerNameFromHost(host) {
  let serverName = String(host ?? "")
    .trim()
    .replace(/:\d+$/, "")
    .replace(/^\[|\]$/g, "");
  return !serverName || /^[\d.]+$/.test(serverName) || serverName.includes(":") ? "" : serverName;
}
var ENGINE_PORT_UNKNOWN_MESSAGE = "Marinara isn't reachable yet. Try again in a moment.";
var ENGINE_UNREACHABLE_MESSAGE = "Can't reach Marinara right now. Try again in a moment.";
var ENGINE_NOT_FOUND_MESSAGE = "Marinara doesn't have that any more.";
var ENGINE_FAILED_MESSAGE = "Marinara couldn't do that right now. Try again in a moment.";
function createEngineClient({
  env = process.env,
  fetchImpl = fetch,
  tlsFetch = httpsRequestFetch,
  logger: log = null,
  timeoutMs = ENGINE_TIMEOUT_MS,
} = {}) {
  let baseUrl = engineBaseUrlFromEnv(env),
    serverName = "",
    fetchUrl = (url, init) => {
      if (!url.startsWith("https:")) {
        return fetchImpl(url, init);
      }
      let host = normalizeHostAddress(new URL(url).hostname);
      return isLoopbackAddress(host) || host === "localhost"
        ? tlsFetch(url, init, serverName, nodeHttps.request, {
            loopback: true,
          })
        : serverName
          ? tlsFetch(url, init, serverName)
          : fetchImpl(url, init);
    },
    requireBase = () => {
      if (!baseUrl) {
        throw Object.assign(new Error("The engine's port is not known yet (no PORT, and no request has come in)."), {
          said: ENGINE_PORT_UNKNOWN_MESSAGE,
        });
      }
      return baseUrl;
    };
  function seeRequest({ port: port, address = "", encrypted = false, host = "" } = {}) {
    if (!(!Number.isInteger(port) || port <= 0)) {
      baseUrl = `${encrypted || engineUsesTls(env) ? "https" : "http"}://${resolveEngineHost(env.HOST, address)}:${port}`;
      if (encrypted && tlsServerNameFromHost(host)) {
        serverName = tlsServerNameFromHost(host);
      }
    }
  }
  let seePort = (port) =>
    seeRequest({
      port: port,
    });
  async function request(path, { method = "GET", body = undefined, json = undefined, timeout = timeoutMs } = {}) {
    let init = {
      method: method,
      headers: engineRequestHeaders(env),
      signal: AbortSignal.timeout(timeout),
    };
    if (json !== undefined) {
      init.headers = {
        ...init.headers,
        "content-type": "application/json",
      };
      init.body = JSON.stringify(json);
    } else if (body !== undefined) {
      init.body = body;
    }
    let response;
    try {
      response = await fetchUrl(requireBase() + path, init);
    } catch (err) {
      if (err?.name === "TimeoutError" || err?.name === "AbortError") {
        throw err;
      }
      let reason = err?.cause?.code ?? err?.cause?.message ?? err?.message ?? "no answer";
      throw Object.assign(new Error(`could not reach the engine at ${baseUrl} (${reason})`), {
        cause: err,
        said: err?.said ?? ENGINE_UNREACHABLE_MESSAGE,
      });
    }
    if (!response.ok) {
      let message;
      try {
        message = asText((await response.json())?.error);
      } catch {
        message = "";
      }
      let error = new Error(`engine ${path} \u2192 ${response.status}${message ? `: ${message}` : ""}`);
      error.status = response.status;
      error.said = response.status === 404 ? ENGINE_NOT_FOUND_MESSAGE : ENGINE_FAILED_MESSAGE;
      throw error;
    }
    return response.json();
  }
  let listOf = (payload) => (Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []);
  return {
    get base() {
      return baseUrl;
    },
    seePort: seePort,
    seeRequest: seeRequest,
    async personas() {
      let payload = await request("/api/characters/personas/list");
      return listOf(payload)
        .map((persona) => ({
          id: asText(persona?.id),
          name: asText(persona?.name) || "Unnamed",
          avatar: asText(persona?.avatarPath),
        }))
        .filter((persona) => persona.id);
    },
    async persona(id) {
      if (!asText(id)) {
        return null;
      }
      let persona = await request(`/api/characters/personas/${encodeURIComponent(id)}`);
      return !persona || typeof persona != "object"
        ? null
        : {
            id: asText(persona.id) || asText(id),
            name: asText(persona.name) || "You",
            avatar: asText(persona.avatarPath),
            description: asText(persona.description),
            appearance: asText(persona.appearance),
          };
    },
    async cards() {
      let cards = [];
      for (let offset = 0, page = 0; ; page += 1) {
        if (page >= CATALOG_MAX_PAGES) {
          throw new Error("Your card library is too long to read.");
        }
        let pageData = await request(
          `/api/characters/catalog?limit=${CATALOG_PAGE_SIZE}&offset=${offset}&sort=name-asc`,
        );
        if (Array.isArray(pageData)) {
          cards.push(...pageData);
          break;
        }
        let items = listOf(pageData);
        if ((cards.push(...items), !pageData?.hasMore || !items.length)) {
          break;
        }
        offset += items.length;
      }
      return cards
        .map((card) => ({
          id: asText(card?.id),
          name: asText(card?.name) || asText(card?.comment) || "Unnamed",
          avatar: asText(card?.avatarPath),
          title: asText(card?.name) ? asText(card?.comment) : "",
          tags: Array.isArray(card?.tags) ? card.tags.map(asText).filter(Boolean).slice(0, 12) : [],
          edited: asText(card?.updatedAt),
        }))
        .filter((card) => card.id);
    },
    async cardGroups() {
      let payload = await request("/api/characters/groups/list");
      return listOf(payload)
        .map((group) => {
          let characterIds =
            typeof group?.characterIds == "string" ? parseJsonOrNull(group.characterIds) : group?.characterIds;
          return {
            id: asText(group?.id),
            name: asText(group?.name) || "Unnamed group",
            ids: Array.isArray(characterIds) ? characterIds.map(asText).filter(Boolean) : [],
          };
        })
        .filter((group) => group.id && group.ids.length);
    },
    async card(id) {
      if (!asText(id)) {
        return null;
      }
      let row = await request(`/api/characters/${encodeURIComponent(id)}`);
      if (!row || typeof row != "object") {
        return null;
      }
      let parsed = typeof row.data == "string" ? parseJsonOrNull(row.data) : row.data,
        outer = parsed && typeof parsed == "object" ? parsed : {},
        data = outer.data && typeof outer.data == "object" ? outer.data : outer,
        extensions = data.extensions && typeof data.extensions == "object" ? data.extensions : {};
      return {
        id: asText(row.id) || asText(id),
        name: asText(data.name) || asText(row.comment) || asText(row.name) || "Unnamed",
        description: asText(data.description),
        personality: asText(data.personality),
        scenario: asText(data.scenario),
        backstory: asText(extensions.backstory),
        appearance: asText(extensions.appearance),
        creatorNotes: asText(data.creator_notes),
        tags: Array.isArray(data.tags) ? data.tags.map(asText).filter(Boolean).slice(0, 20) : [],
        avatar: asText(row.avatarPath),
      };
    },
    async connections() {
      let payload = await request("/api/connections"),
        mediaPattern = /(^|_)(image|audio|video|tts|speech|music)/i;
      return listOf(payload)
        .map((connection) => ({
          id: asText(connection?.id),
          name: (asText(connection?.name) || asText(connection?.label) || "Connection").trim(),
          model: asText(connection?.model) || asText(connection?.modelId) || "",
          provider: asText(connection?.provider) || asText(connection?.type) || "",
          isDefault: !!connection?.isDefault,
          defaultForAgents: !!connection?.defaultForAgents,
          maxParallelJobs: Number(connection?.maxParallelJobs) || 1,
        }))
        .filter((connection) => connection.id && !mediaPattern.test(connection.provider));
    },
    async imageConnections() {
      let payload = await request("/api/connections");
      return listOf(payload)
        .map((connection) => ({
          id: asText(connection?.id),
          name: (asText(connection?.name) || "Connection").trim(),
          model: asText(connection?.model) || "",
          provider: asText(connection?.provider) || "",
          isDefault: connection?.isDefault === true || connection?.isDefault === "true",
          bySubjects: usesNovelaiSubjectResolution(connection?.defaultParameters),
        }))
        .filter((connection) => connection.id && connection.provider === "image_generation");
    },
    async styleProfiles() {
      try {
        let setting = await request("/api/app-settings/ui"),
          value = setting && typeof setting == "object" && "value" in setting ? setting.value : setting,
          parsed = typeof value == "string" ? parseJsonOrNull(value) : value,
          styleSettings =
            parsed && typeof parsed == "object" ? parsed.imageStyleProfiles || parsed.styleProfiles : null,
          profiles = styleSettings && Array.isArray(styleSettings.profiles) ? styleSettings.profiles : [],
          promptModeOf = (mode) => (["tagged", "danbooru", "hybrid"].includes(asText(mode)) ? asText(mode) : "natural");
        return {
          defaultId: asText(styleSettings?.defaultProfileId),
          profiles: profiles
            .filter((profile) => profile && asText(profile.id))
            .map((profile) => ({
              id: asText(profile.id),
              name: asText(profile.name) || asText(profile.id),
              promptMode: promptModeOf(profile.promptMode),
              baseStyle: asText(profile.baseStyle) || "auto",
              styleText: asText(profile.styleText),
              positiveTags: asText(profile.positiveTags),
              negativeTags: asText(profile.negativeTags),
              subjectTags:
                profile.subjectTags && typeof profile.subjectTags == "object"
                  ? Object.fromEntries(
                      Object.entries(profile.subjectTags)
                        .map(([subject, tags]) => [subject, asText(tags)])
                        .filter(([, tags]) => tags),
                    )
                  : {},
            })),
        };
      } catch {
        return {
          defaultId: "",
          profiles: [],
        };
      }
    },
    async paint({
      connectionId: connectionId,
      name: characterName,
      prompt: prompt,
      negativePrompt: negativePrompt,
      width: width,
      height: height,
      styleProfileId: styleProfileId,
      referenceImages = [],
    }) {
      let result = await request("/api/characters/avatar-generation", {
          method: "POST",
          timeout: ENGINE_IMAGE_TIMEOUT_MS,
          json: {
            connectionId: connectionId,
            name: characterName,
            appearance: prompt,
            purpose: "avatar",
            styleProfileId: styleProfileId || undefined,
            width: width,
            height: height,
            promptOverrides: [
              {
                id: avatarOverrideId(characterName),
                prompt: prompt,
                negativePrompt: negativePrompt,
              },
            ],
            ...(referenceImages.length
              ? {
                  referenceImages: referenceImages,
                }
              : {}),
          },
        }),
        image = parseImageDataUrl(result?.image);
      if (!image) {
        throw new Error("The engine returned no picture.");
      }
      return {
        ...image,
        width: width,
        height: height,
        prompt: asText(result?.prompt),
        overrideTook: asText(result?.prompt) === prompt,
      };
    },
    async imageData(path) {
      let imagePath = asText(path);
      if (!imagePath.startsWith("/")) {
        return null;
      }
      try {
        let response = await fetchUrl(requireBase() + imagePath, {
          headers: engineRequestHeaders(env),
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) {
          return null;
        }
        let mime = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
        if (!mime.startsWith("image/")) {
          return null;
        }
        let bytes = Buffer.from(await response.arrayBuffer());
        return `data:${mime};base64,${bytes.toString("base64")}`;
      } catch {
        return null;
      }
    },
    async keep({ image: image, name: title, prompt: prompt, model: model }) {
      let form = new FormData();
      form.append("prompt", asText(prompt));
      form.append("provider", "image_generation");
      form.append("model", asText(model) || "unknown");
      if (image.width > 0 && image.height > 0) {
        form.append("width", String(Math.round(image.width)));
        form.append("height", String(Math.round(image.height)));
      }
      let bytes = Buffer.from(image.base64, "base64");
      form.append(
        "file",
        new Blob([bytes], {
          type: image.mime,
        }),
        `${gallerySlug(title)}${image.ext}`,
      );
      let saved = await request("/api/global-gallery/upload", {
          method: "POST",
          body: form,
          timeout: 6e4,
        }),
        id = asText(saved?.id),
        url = asText(saved?.url);
      if (!id || !url) {
        throw new Error("The gallery kept no picture.");
      }
      return {
        id: id,
        url: url,
      };
    },
    async cleanSprite(image) {
      let result = await request("/api/sprites/cleanup", {
          method: "POST",
          timeout: ENGINE_IMAGE_TIMEOUT_MS,
          json: {
            cells: [
              {
                expression: "sprite",
                base64: image.base64,
              },
            ],
            cleanupStrength: 35,
            engine: "auto",
          },
        }),
        base64 = asText(result?.cells?.[0]?.base64).replace(/\s+/gu, "");
      if (!base64) {
        throw new Error("The engine's sprite cleaner returned no picture.");
      }
      return {
        mime: "image/png",
        ext: ".png",
        base64: base64,
        width: image.width,
        height: image.height,
      };
    },
    async resources() {
      let resources = {
        personas: [],
        cards: [],
        groups: [],
        connections: [],
        problems: [],
      };
      try {
        resources.personas = await this.personas();
      } catch (err) {
        resources.problems.push(`Could not read your personas. ${err.said ?? err.message}`);
        log?.warn?.(`[modern-life-sim] personas: ${err.message}`);
      }
      try {
        resources.cards = await this.cards();
      } catch (err) {
        resources.problems.push(`Could not read your character cards. ${err.said ?? err.message}`);
        log?.warn?.(`[modern-life-sim] cards: ${err.message}`);
      }
      resources.groups = await this.cardGroups().catch(() => []);
      try {
        resources.connections = await this.connections();
      } catch (err) {
        resources.problems.push(`Could not read your connections. ${err.said ?? err.message}`);
        log?.warn?.(`[modern-life-sim] connections: ${err.message}`);
      }
      return resources;
    },
  };
}

export { createEngineClient, parseImageDataUrl };
