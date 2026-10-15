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
assert.ok(
  gate < artwork.indexOf("await generateCreatorPostImage(", openBranch),
  "the switch is checked before any picture is drawn",
);
assert.match(settings, /autoCreatorArtworkEnabled: z\.boolean\(\)/u);
assert.match(settings, /autoCreatorArtworkEnabled: true,/u, "an existing install keeps its artwork");
assert.match(wizard, /autoCreatorArtworkEnabled: imagesEnabled,/u, "a new install opts in with its images choice");

// --- Slurp asks for its own picture descriptions (#63) -------------------------------------------
const captioning = read("server/src/slp/base/media/slp-post-image-context.ts");
assert.match(
  captioning,
  /const instructions = prompt\.trim\(\) \|\| SLURP_IMAGE_CAPTION_PROMPT;/u,
  "blank uses the default",
);
// The vendored Engine hardcodes its system message, so the swap happens on the provider call itself.
assert.match(captioning, /message\.role === "system" \? \{ \.\.\.message, content: instructions \} : message/u);
assert.match(captioning, /Do not describe the art style/u, "the default leaves the drawing style out");
for (const path of [
  "server/src/slp/features/audience/slp-fan-activity-service.ts",
  "server/src/slp/features/messages/slp-message-image-context.ts",
  "server/src/slp/features/messages/slp-reply-generation-service.ts",
]) {
  assert.match(read(path), /settings\.imageCaptionPrompt/u, `${path} passes the caption instructions`);
}

// --- the player's own words open a Creator's picture prompt (#16) -------------------------------
const images = read("server/src/slp/features/media/slp-images-service.ts");
assert.match(images, /input\.settings\.creatorImagePrefixes\?\.\[input\.account\.id\]/u);
assert.match(images, /slurpApplyImageSubject\(finalPromptLook, imagePrefix \|\| subjectName, promptFamily\)/u);

// --- outfits are not rags unless the card says so (#41) ------------------------------------------
assert.match(read("server/src/slp/features/feed/slp-post-prompt.ts"), /never worn-out, faded or shabby/u);

console.log("slurp2-picture-control: ok");
