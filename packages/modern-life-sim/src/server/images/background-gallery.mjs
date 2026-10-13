// Background gallery versions and the town look settings/picks
var createBackgroundGallery = () => ({
  versions: {},
});
var galleryVersionsFor = (gallery, key) => gallery?.versions?.[key] ?? [];
function addGalleryVersion(gallery, key, image, meta = {}) {
  gallery.versions ??= {};
  let versions = (gallery.versions[key] ??= []);
  versions.push({
    url: image.url,
    ref: image.galleryId ? `global-gallery:${image.galleryId}` : null,
    at: meta.at ?? 0,
    connection: meta.connection ?? "",
    profile: meta.profile ?? "",
    tags: meta.tags ?? "",
    prompt: String(meta.prompt ?? "").slice(0, 1200),
  });
  return versions.length - 1;
}
function cleanKeyedRecord(record, cleanValue) {
  let clean = {};
  if (!record || typeof record != "object") {
    return clean;
  }
  for (let [key, value] of Object.entries(record).slice(0, 400)) {
    if (!/^[\w:.|-]{1,80}$/.test(key) || key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    let cleaned = cleanValue(value);
    if (cleaned != null) {
      clean[key] = cleaned;
    }
  }
  return clean;
}
function cleanTownLook(look = {}) {
  let clip = (value, max) =>
    String(value ?? "")
      .trim()
      .slice(0, max);
  return {
    connectionId: clip(look.connectionId, 80) || null,
    styleProfileId: clip(look.styleProfileId, 80) || null,
    tags: clip(look.tags, 300),
    picks: cleanKeyedRecord(look.picks, (pick) => (Number.isInteger(pick) && pick >= 0 ? pick : null)),
    own: cleanKeyedRecord(look.own, (own) =>
      own && typeof own.url == "string" && own.url.startsWith("/api/") && !/['"()\\\s]/.test(own.url)
        ? {
            url: own.url.slice(0, 300),
            ref: clip(own.ref, 200),
            ...(Number.isFinite(own.at)
              ? {
                  at: own.at,
                }
              : {}),
          }
        : null,
    ),
    failed: cleanKeyedRecord(look.failed, (reason) => clip(reason, 300) || null),
    paused: !!look.paused,
  };
}
function pickedBackgroundFor(gallery, look, key) {
  let own = look?.own?.[key];
  if (own?.url) {
    return {
      index: -1,
      own: true,
      ...own,
    };
  }
  let versions = galleryVersionsFor(gallery, key),
    pick = look?.picks?.[key];
  return Number.isInteger(pick) && versions[pick]
    ? {
        index: pick,
        ...versions[pick],
      }
    : null;
}
function pickLatestBackgrounds(gallery, look, keys) {
  let missing = [];
  for (let key of keys) {
    let versions = galleryVersionsFor(gallery, key);
    if (versions.length) {
      look.picks[key] = versions.length - 1;
    } else {
      missing.push(key);
    }
  }
  return missing;
}

export {
  addGalleryVersion,
  cleanTownLook,
  createBackgroundGallery,
  galleryVersionsFor,
  pickLatestBackgrounds,
  pickedBackgroundFor,
};
