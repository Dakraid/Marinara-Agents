import { slpPostImageCropSchema } from "./slp-social.schema.js";
import type { SlpPostImageCrop } from "./slp-social.types.js";

export function readSlpPostImageCrop(metadata: Record<string, unknown> | null | undefined): SlpPostImageCrop | null {
  const parsed = slpPostImageCropSchema.safeParse(metadata?.imageCrop);
  return parsed.success ? parsed.data : null;
}

/**
 * One picture of a photo set after a crop or a replacement (R1-039), as the `postMedia` mirror in
 * the post metadata holds it. Null when the set has no picture at that position. A replacement
 * drops the old prompt and crop (they described the old picture); `crop` undefined keeps the crop,
 * null clears it.
 */
export function slpWithSetPictureChange(
  postMedia: unknown,
  position: number,
  change: { replaced: boolean; crop: SlpPostImageCrop | null | undefined },
): unknown[] | null {
  const entries = Array.isArray(postMedia) ? postMedia : [];
  const index = entries.findIndex(
    (entry) => !!entry && typeof entry === "object" && (entry as { position?: unknown }).position === position,
  );
  if (index < 0) return null;
  const entry = { ...(entries[index] as Record<string, unknown>) };
  if (change.replaced) {
    entry.imagePrompt = null;
    delete entry.crop;
  }
  if (change.crop === null) delete entry.crop;
  else if (change.crop !== undefined) entry.crop = change.crop;
  return entries.map((item, at) => (at === index ? entry : item));
}
