/**
 * Artwork for pool ads.
 *
 * An ad is not a post: it has no creator account, no persona, and no identity to protect, so it
 * does not go through the post image pipeline. It only needs a prompt, a connection, and a file,
 * which is what this does.
 */
import type { DB } from "../../../db/connection.js";
import { logger } from "../../../lib/logger.js";
import { resolveConnectionImageDefaults } from "../../../services/image/image-generation-defaults.js";
import { generateImage, stageImageToDisk } from "../../../services/image/image-generation.js";
import { createConnectionsStorage } from "../../../services/storage/connections.storage.js";
import { createAppSettingsStorage } from "../../../services/storage/app-settings.storage.js";
import { createSlurpStorage } from "../../data/slp-storage.js";
import {
  GARNISH_AD_IMAGE_FORMATS,
  type GarnishAd,
  type GarnishAdImageField,
} from "../../../services/garnish-ads/garnish-ads.types.js";
import type { GarnishAdsStorage } from "../../../services/garnish-ads/garnish-ads.storage.js";
import { getCreatorImageConnections } from "../../base/media/slp-image-connections.js";
import { generateSlpImageWithRetry } from "../../base/media/slp-image-retry.js";
import { rewriteSlpImagePrompt } from "../../base/media/slp-image-prompt-rewrite.js";
import { selectSlpImageProviderPrompt } from "../../base/media/slp-image-prompt.js";
import {
  garnishAdImageUrl,
  garnishAdMediaNamespace,
  readGarnishAdMediaPath,
  unlinkGarnishAdImage,
} from "./slp-garnish-image.js";
import { SLURP_GARNISH_PLATFORM } from "./slp-garnish-context.js";
import {
  GARNISH_BANNER_REDRAW_KEY,
  nextGarnishBannerRedraw,
  readGarnishBannerRedrawState,
} from "./slp-garnish-banner-redraw.js";
import { slurpPromptContext } from "../../base/prompting/slp-prompt-blocks.js";

/** Ads read as feed content, so the artwork is product photography rather than a poster. */
function adImagePrompt(ad: GarnishAd): string {
  return [
    `Advertising photograph for a fictional brand called "${ad.brand}", advertising "${ad.product}".`,
    ad.copy,
    ad.categories.length ? `Themes: ${ad.categories.join(", ")}.` : "",
    "Product or lifestyle photography for a social feed. Clean, well lit, intentional composition.",
    "No text, no words, no lettering, no logo, no watermark, no user interface.",
  ]
    .filter(Boolean)
    .join("\n");
}

const AD_IMAGE_NEGATIVE_PROMPT =
  "text, words, lettering, caption, typography, logo, watermark, signature, user interface, browser chrome, collage, border, frame";

export type GarnishAdImageOutcome = "generated" | "unavailable" | "failed";

/**
 * Generate and store one ad's image, replacing any previous file. Returns the outcome rather
 * than throwing, so a batch of ads is never abandoned halfway because one image failed.
 */
export async function generateGarnishAdImage(
  db: DB,
  pool: GarnishAdsStorage,
  ad: GarnishAd,
  /** Preferred connections in order (the ad connection); the Creator picture default follows. */
  connectionIds: ReadonlyArray<string | null | undefined> = [],
  /** Draw only this format (the one-time banner for an older ad, V); the other picture stays. */
  only?: GarnishAdImageField,
): Promise<GarnishAdImageOutcome> {
  const connections = createConnectionsStorage(db);
  // A stored id can be blank, deleted, or point at a text connection. Skip those and fall through to
  // the next choice, not straight to the Engine default. "Same as post images" means the connection
  // Creator pictures use, so that one is the last choice before the Engine default.
  const creatorDefault = (await getCreatorImageConnections(db)).defaultConnectionId;
  let connection: Awaited<ReturnType<typeof connections.getWithKey>> = null;
  for (const id of [...connectionIds, creatorDefault]) {
    const candidate = id?.trim() ? await connections.getWithKey(id.trim()) : null;
    if (candidate?.provider === "image_generation") {
      connection = candidate;
      break;
    }
  }
  connection ??= await connections.getDefaultForImageGeneration();
  if (!connection) return "unavailable";

  const model = connection.model || "";
  const source = connection.imageGenerationSource || model;
  // Ads honour the same interpretation setting and rewrite pass as post images.
  const settings = await createSlurpStorage(db).getSettings();
  const rawPrompt = adImagePrompt(ad);
  const imagePromptInstructions = [
    settings.imageGenerationPrompt.trim(),
    connection.imagePromptInstructions?.trim() ?? "",
  ]
    .filter(Boolean)
    .join("\n");
  const rewriteAttempted = Boolean(imagePromptInstructions) && settings.enableImageInterpretation !== false;
  const prompt = selectSlpImageProviderPrompt({
    rewrittenPrompt: rewriteAttempted
      ? await rewriteSlpImagePrompt({
          db,
          prompt: rawPrompt,
          interpretationInstruction: settings.imagePromptInterpretation,
          instructions: imagePromptInstructions,
          promptBlocks: slurpPromptContext(settings).blocks,
          connectionId: settings.imagePromptConnectionId || settings.generationConnectionId,
          budget: settings.modelBudget,
        })
      : null,
    rawPrompt,
    rewriteAttempted,
    onFallback: (reason) =>
      logger.warn(
        "[garnish-ads] Image prompt rewrite unusable for %s (%s); sending the capped draft",
        ad.brand,
        reason,
      ),
  });
  const draw = async (format: (typeof GARNISH_AD_IMAGE_FORMATS)[number]) => {
    const image = await generateSlpImageWithRetry(
      () =>
        generateImage(
          source,
          connection.baseUrl || "https://image.pollinations.ai",
          connection.apiKey || "",
          connection.imageService || source,
          {
            // The shape line is added after the rewrite, so one rewrite serves both pictures.
            prompt: `${prompt}\n${format.framing}`,
            negativePrompt: AD_IMAGE_NEGATIVE_PROMPT,
            model,
            width: format.width,
            height: format.height,
            imageEndpointId: connection.imageEndpointId || undefined,
            comfyWorkflow: connection.comfyuiWorkflow || undefined,
            imageDefaults: resolveConnectionImageDefaults(connection),
            debugMode: false,
            admissionMode: { kind: "background" },
          },
        ),
      (error, attempt, maxAttempts) =>
        logger.warn(
          error,
          "[garnish-ads] Image attempt %d/%d failed for %s (%s)",
          attempt,
          maxAttempts,
          ad.brand,
          format.field,
        ),
    );
    return stageImageToDisk(garnishAdMediaNamespace(ad.id), image.base64, image.ext);
  };
  const files: { field: GarnishAdImageField; file: ReturnType<typeof stageImageToDisk> }[] = [];
  try {
    for (const format of GARNISH_AD_IMAGE_FORMATS) {
      if (only && format.field !== only) continue;
      try {
        files.push({ field: format.field, file: await draw(format) });
      } catch (error) {
        // The feed picture is the ad's picture; a missing banner only means the wide slot crops it.
        if (format.field === "imageUrl") throw error;
        // Drawing only the banner (V), its failure is the outcome.
        if (only) throw error;
        logger.warn(error, "[garnish-ads] Could not draw the wide banner for %s; the feed picture stands in", ad.brand);
      }
    }
    const previous = { imageUrl: ad.imageUrl, wideImageUrl: ad.wideImageUrl };
    for (const { file } of files) file.promote();
    const urls = Object.fromEntries(files.map(({ field, file }) => [field, garnishAdImageUrl(ad.id, file.filePath)]));
    try {
      // Replace in place rather than via add(), which moves the ad to the end of the pool and
      // would reshuffle which ad lands in which feed slot every time an image is generated.
      const stored = await pool.listAll();
      await pool.replaceAll(stored.map((row) => (row.id === ad.id ? { ...row, ...urls } : row)));
    } catch (error) {
      for (const { file } of files) file.compensate();
      throw error;
    }
    // Only once the replacement is committed, so a failed write never leaves the ad imageless.
    for (const { field } of files) unlinkGarnishAdImage(ad.id, previous[field]);
    return "generated";
  } catch (error) {
    logger.warn(error, "[garnish-ads] Could not generate an image for %s", ad.brand);
    return "failed";
  }
}

/**
 * One step of the one-time banner redraw, run by the scheduler: at most one picture per call, inside
 * the ad pictures switch (Ads › pictures on) and the daily pace. An ad counts as tried once its
 * picture was attempted (drawn or failed), so it is never redrawn again; no image connection means
 * nothing was tried.
 */
export async function redrawOldGarnishAdBanner(
  db: DB,
  pool: GarnishAdsStorage,
  at = new Date(),
): Promise<GarnishAdImageOutcome | "off" | "paced" | "done"> {
  const settings = await createSlurpStorage(db).getSettings();
  if (!settings.inlineAdsEnabled || !settings.inlineAdsImagesEnabled) return "off";
  const store = createAppSettingsStorage(db);
  const state = readGarnishBannerRedrawState(await store.get(GARNISH_BANNER_REDRAW_KEY), at);
  const next = nextGarnishBannerRedraw(await pool.listActive(SLURP_GARNISH_PLATFORM), state, (ad) =>
    Boolean(readGarnishAdMediaPath(ad.id, ad.imageUrl)),
  );
  if (!next) return "done";
  if (next === "paced") return "paced";
  const outcome = await generateGarnishAdImage(db, pool, next, [settings.inlineAdsImageConnectionId], "wideImageUrl");
  if (outcome !== "unavailable")
    await store.set(
      GARNISH_BANNER_REDRAW_KEY,
      JSON.stringify({ tried: [...state.tried, next.id], day: state.day, count: state.count + 1 }),
    );
  return outcome;
}
