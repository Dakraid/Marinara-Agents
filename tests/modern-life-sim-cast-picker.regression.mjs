// Modern Life Sim: cast picker tag filter and library-style rows (variant, creator/version, favorite, tags).
// Run: node tests/modern-life-sim-cast-picker.regression.mjs
import assert from "node:assert/strict";

// The views import chain reaches the custom element, so stub the browser globals it touches at load.
globalThis.HTMLElement ??= class {};
globalThis.customElements ??= { get: () => undefined, define: () => undefined };
globalThis.document ??= { addEventListener: () => undefined };
globalThis.addEventListener ??= () => undefined;
globalThis.window ??= globalThis;
// Load through the element entry, as the bundle does, so the module cycle initializes in order.
await import("../packages/modern-life-sim/src/client/element.js");
const { pickerList, pickerShown, pickerView } =
  await import("../packages/modern-life-sim/src/client/views/creation.js");

const resources = {
  cards: [
    {
      id: "a",
      name: "Ana",
      title: "Summer outfit",
      tags: ["noble", "capital", "mage", "tall"],
      creator: "Kit",
      version: "2",
      favorite: true,
    },
    { id: "b", name: "Ben", title: "", tags: ["noble"], creator: "", version: "", favorite: false },
    { id: "c", name: "Cat", title: "", tags: [], creator: "", version: "", favorite: false },
  ],
};
const draft = { cast: {} };
const ids = (patch) => pickerShown(resources, { ...draft, ...patch }).map((card) => card.id);

assert.deepEqual(ids({}), ["a", "b", "c"], "no tag chosen shows every card");
assert.deepEqual(ids({ pickerTags: ["noble"] }), ["a", "b"], "one tag keeps its cards");
assert.deepEqual(ids({ pickerTags: ["noble", "mage"] }), ["a"], "several tags must all match");
assert.deepEqual(ids({ pickerTags: ["noble"], pickerQuery: "ben" }), ["b"], "tags combine with the search");

const view = pickerView({ resources, draft: { ...draft, pickerTags: ["noble"] } });
assert.match(
  view,
  /data-do="picker-tag" data-id="noble" aria-pressed="true">noble<small>2<\/small>/,
  "the most used tag leads, pressed",
);
assert.match(view, /data-id="capital" aria-pressed="false"/, "unchosen tags are offered");

const row = pickerList({ resources, draft, shown: resources.cards.slice(0, 1) });
assert.match(row, /<small class="title">Summer outfit<\/small>/, "the variant shows under the name");
assert.match(row, /<small>by Kit, v2<\/small>/, "creator and version show like the library list");
assert.match(row, /class="fav"/, "favorites carry the star");
assert.match(
  row,
  /<span>noble<\/span><span>capital<\/span><span>mage<\/span><span>\+1<\/span>/,
  "three tags, then the overflow count",
);

console.info("modern-life-sim cast picker: ok");
