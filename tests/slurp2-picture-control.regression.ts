import assert from "node:assert/strict";
import { slurp2Source } from "./slurp2-source";
import { slurpLeastRecentGalleryImage } from "../packages/slurp2/src/engine/packages/server/src/slp/base/media/slp-generated-media-policy.ts";

// --- gallery fallback rotates instead of always showing the first picture -----------------------
const gallery = [{ id: "a" }, { id: "b" }, { id: "c" }];
assert.equal(slurpLeastRecentGalleryImage(gallery, [])?.id, "a", "nothing used yet: the first picture");
assert.equal(slurpLeastRecentGalleryImage(gallery, ["a", undefined])?.id, "b", "a used picture is skipped");
assert.equal(slurpLeastRecentGalleryImage(gallery, ["b", "a", "c"])?.id, "c", "all used: the oldest use wins");
assert.equal(slurpLeastRecentGalleryImage(gallery, ["c", "a", "a", "b"])?.id, "b");
assert.equal(slurpLeastRecentGalleryImage([], ["a"]), null);

const read = (path: string) => slurp2Source(`packages/slurp2/src/engine/packages/${path}`);

// --- background avatars and banners have a switch (#82) ------------------------------------------
const artwork = read("server/src/slp/features/creators/slp-artwork-operation.ts");
const settings = read("server/src/slp/modules/settings/slp-settings.ts");
const wizard = read("client/src/slp/features/onboarding/slp-onboarding-wizard-model.ts");
// The gate sits after the Open branch: copying a card's pictures costs nothing and keeps working.
const openBranch = artwork.indexOf('if (disclosureMode === "open")');
const gate = artwork.indexOf('if (!settings.autoCreatorArtworkEnabled) return "idle" as const;');
assert.ok(openBranch > 0 && gate > openBranch, "only generation waits for the switch");
assert.ok(gate < artwork.indexOf("await generateCreatorPostImage(", openBranch), "the switch is checked before any picture is drawn");
assert.match(settings, /autoCreatorArtworkEnabled: z\.boolean\(\)/u);
assert.match(settings, /autoCreatorArtworkEnabled: true,/u, "an existing install keeps its artwork");
assert.match(wizard, /autoCreatorArtworkEnabled: imagesEnabled,/u, "a new install opts in with its images choice");

console.log("slurp2-picture-control: ok");
