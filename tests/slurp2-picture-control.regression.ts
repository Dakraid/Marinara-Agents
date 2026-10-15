import assert from "node:assert/strict";
import { slurpLeastRecentGalleryImage } from "../packages/slurp2/src/engine/packages/server/src/slp/base/media/slp-generated-media-policy.ts";

// --- gallery fallback rotates instead of always showing the first picture -----------------------
const gallery = [{ id: "a" }, { id: "b" }, { id: "c" }];
assert.equal(slurpLeastRecentGalleryImage(gallery, [])?.id, "a", "nothing used yet: the first picture");
assert.equal(slurpLeastRecentGalleryImage(gallery, ["a", undefined])?.id, "b", "a used picture is skipped");
assert.equal(slurpLeastRecentGalleryImage(gallery, ["b", "a", "c"])?.id, "c", "all used: the oldest use wins");
assert.equal(slurpLeastRecentGalleryImage(gallery, ["c", "a", "a", "b"])?.id, "b");
assert.equal(slurpLeastRecentGalleryImage([], ["a"]), null);

console.log("slurp2-picture-control: ok");
