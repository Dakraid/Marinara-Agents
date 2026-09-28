/**
 * Brands and their products as brand deals and the Stir lever see them (R): live products of
 * switched-on brands with their brand's category and voice, each Creator's spice level, and the
 * catalog a helper picks from.
 */
import type { DB } from "../../../db/connection.js";
import { createSlurpStorage } from "../../data/slp-storage.js";
import { resolveSlurpCreatorSpice } from "../../data/creators/slp-spice-storage.js";
import type { SlurpDealAd, SlurpDealSpice } from "../../modules/economy/slp-brand-deals.js";
import { garnishAdBrandId } from "../../../services/garnish-ads/garnish-ads.types.js";
import { createGarnishAds, garnishRatingAllowed } from "../ads/slp-ads-contract.js";

type Settings = Awaited<ReturnType<ReturnType<typeof createSlurpStorage>["getSettings"]>>;

/** Live products of switched-on brands under the ads ceiling, with their brand's category and voice. */
export async function loadSlurpDealAds(db: DB, settings: Settings): Promise<SlurpDealAd[]> {
  if (!settings.inlineAdsEnabled) return [];
  const { pool } = createGarnishAds(db);
  const [ads, brands] = await Promise.all([pool.listActive("slurp"), pool.listBrands("slurp")]);
  const byId = new Map(brands.map((brand) => [brand.id, brand]));
  return ads
    .filter((ad) => ad.kind === "inline" && garnishRatingAllowed(ad.contentRating, settings.inlineAdsContentCeiling))
    .map((ad) => {
      const brand = byId.get(garnishAdBrandId(ad));
      return {
        id: ad.id,
        brand: ad.brand,
        product: ad.product,
        copy: ad.copy,
        categories: ad.categories,
        contextTags: ad.contextTags,
        brandId: garnishAdBrandId(ad),
        rating: ad.contentRating,
        ...(brand?.category ? { brandCategory: brand.category } : {}),
        ...(brand?.tone ? { tone: brand.tone } : {}),
        ...(ad.look ? { look: ad.look } : {}),
      };
    });
}

/** Each Creator's spice level, for the spice fit. */
export async function loadSlurpDealSpice(db: DB): Promise<Map<string, SlurpDealSpice>> {
  const accounts = await createSlurpStorage(db).listNoodlerAccounts();
  const levels = await Promise.all(
    accounts.map(async (account: { id: string; settings: { strategy?: unknown } }) => {
      const level = await resolveSlurpCreatorSpice(db, account)
        .then((spice) => spice.level as SlurpDealSpice)
        .catch(() => undefined);
      return [account.id, level] as const;
    }),
  );
  return new Map(levels.filter((entry): entry is readonly [string, SlurpDealSpice] => Boolean(entry[1])));
}

/** The brands a helper can name (the `list-brands` action): switched-on brands and their live products. */
export async function listSlurpBrandCatalog(db: DB) {
  const settings = await createSlurpStorage(db).getSettings();
  const { pool } = createGarnishAds(db);
  const [brands, ads] = await Promise.all([pool.listBrands("slurp"), loadSlurpDealAds(db, settings)]);
  return {
    adsOn: settings.inlineAdsEnabled,
    brands: brands
      .filter((brand) => !brand.disabledAt)
      .map((brand) => ({
        id: brand.id,
        name: brand.name,
        category: brand.category,
        products: ads
          .filter((ad) => ad.brandId === brand.id)
          .map((ad) => ({ id: ad.id, name: ad.product, pitch: ad.copy, spice: ad.rating ?? "tame" })),
      }))
      .filter((brand) => brand.products.length > 0),
  };
}
