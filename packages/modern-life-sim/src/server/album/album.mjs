// Photo album entries, versions, statuses and views
function addAlbumEntry(
  world,
  {
    event: eventId,
    beat: beat,
    label: label,
    cast = [],
    at = 0,
    place = "",
    subject = null,
    time = "day",
    picture = {},
    status: entryStatus = "queued",
    noYou = false,
  },
) {
  world.album ??= [];
  let entryId = `k${(world.albumSeq = (world.albumSeq ?? 0) + 1)}`;
  world.album.push({
    id: entryId,
    event: eventId,
    beat: beat,
    label: label,
    cast: [...cast],
    at: at,
    place: place,
    subject: subject,
    time: time,
    picture: picture,
    status: entryStatus === "manual" ? "manual" : "queued",
    error: "",
    versions: [],
    pick: null,
    ...(noYou
      ? {
          noYou: true,
        }
      : {}),
  });
  if (world.album.length > 400) {
    world.album.splice(0, world.album.length - 400);
  }
  return entryId;
}
var albumEntryById = (world, entryId) => (world.album ?? []).find((entry) => entry.id === entryId) ?? null;
function addAlbumVersion(world, entryId, { url: url, ref = null, prompt = "" }) {
  let entry = albumEntryById(world, entryId);
  return entry
    ? (entry.versions.push({
        url: url,
        ref: ref,
        at: Date.now(),
        prompt: String(prompt).slice(0, 1600),
      }),
      (entry.pick = entry.versions.length - 1),
      (entry.status = "ready"),
      (entry.error = ""),
      true)
    : false;
}
function failAlbumEntry(world, entryId, error) {
  let entry = albumEntryById(world, entryId);
  return entry
    ? ((entry.status = "failed"), (entry.error = String(error ?? "It did not come out.").slice(0, 200)), true)
    : false;
}
function removeAlbumEntries(world, predicate) {
  let countBefore = (world.album ?? []).length;
  return !countBefore || typeof predicate != "function"
    ? 0
    : ((world.album = world.album.filter((entry) => !predicate(entry))), countBefore - world.album.length);
}
function requeueAlbumEntry(world, entryId) {
  let entry = albumEntryById(world, entryId);
  return entry
    ? entry.status === "queued" || entry.status === "painting"
      ? {
          ok: false,
          reason: "It is being painted already.",
        }
      : ((entry.status = "queued"),
        (entry.error = ""),
        {
          ok: true,
        })
    : {
        ok: false,
        reason: "That picture is not in this life.",
      };
}
function pickAlbumVersion(world, entryId, version) {
  let entry = albumEntryById(world, entryId),
    versionIndex = Number(version);
  return !entry || !Number.isInteger(versionIndex) || versionIndex < 0 || versionIndex >= entry.versions.length
    ? {
        ok: false,
        reason: "There is no such version.",
      }
    : ((entry.pick = versionIndex),
      {
        ok: true,
      });
}
function albumEntryView(entry, nameOf = (id) => id) {
  let picked = entry.pick !== null && entry.pick !== undefined ? entry.versions[entry.pick] : null;
  return {
    id: entry.id,
    event: entry.event,
    label: entry.label,
    at: entry.at,
    place: entry.place,
    cast: entry.cast.map((characterId) => ({
      id: characterId,
      name: nameOf(characterId),
    })),
    status: entry.status,
    error: entry.error,
    url: picked?.url ?? null,
    version: picked ? entry.pick + 1 : 0,
    versions: entry.versions.length,
  };
}
function albumView(world, { characterId = null, nameOf: nameOf, hide = null } = {}) {
  return (world.album ?? [])
    .filter((entry) => (!characterId || entry.cast.includes(characterId)) && !hide?.(entry))
    .slice()
    .reverse()
    .map((entry) => albumEntryView(entry, nameOf));
}

export {
  addAlbumEntry,
  addAlbumVersion,
  albumEntryById,
  albumEntryView,
  albumView,
  failAlbumEntry,
  pickAlbumVersion,
  removeAlbumEntries,
  requeueAlbumEntry,
};
