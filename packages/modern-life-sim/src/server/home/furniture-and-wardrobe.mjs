// Home furniture levels, persona avatar/cutouts, clothes rule, outfits and bed quality
import { describePlayerAppearance } from "../scenes/text-helpers.mjs";
import {
  CHANGE_CLOTHES_MINUTES,
  HOME_SLOT_EFFECTS,
  ITEM_CATALOG,
  SHOP_BROWSE_MINUTES,
  isClothesStore,
} from "../items/catalog.mjs";
import { itemDef } from "../items/inventory.mjs";
import { addClothesToCloset, buildClothesRack, checkClothesPurchase } from "../shop/store-catalog.mjs";
import { homeKindOf, spendMoney } from "../money/wallet.mjs";
import { isPlaceOpen, townPlace } from "../town/town-layout.mjs";
import { COUCH_BED_QUALITY } from "./residence.mjs";
import { seasonNow } from "../things/things-actions.mjs";
import { isMarriedToAnyone } from "../romance/marriage-events.mjs";
import { discountHere, styleMarks } from "../shop/store-counter.mjs";
import { wheelsSeen } from "../travel/vehicles-rides.mjs";
import { advanceTime, closingWhy, hasFaintedEvent, imageChoice, logNote } from "../game.mjs";

var homeFurnitureSlots = (state) => (!state.lodging && state.residence ? homeKindOf(state.wallet.home).slots : []);
var homeHasFurniture = (state, slot) => homeFurnitureSlots(state).includes(slot) && furnitureLevel(state, slot) > 0;
var isLuxuryHome = (state) => homeFurnitureSlots(state).length > 0 && !!homeKindOf(state.wallet.home).luxury;
function furnitureLevel(state, slot) {
  let itemId = state.things?.home?.[slot];
  return itemId ? (ITEM_CATALOG[itemId]?.level ?? 0) : 0;
}
var wearingItem = (state) => itemDef(state.things, state.wearing);
var isClothesRuleOn = (state) => !!state.rules?.clothes && !!state.clothes;
var personaAvatar = (state) => state.persona?.avatarPath ?? state.persona?.avatar ?? null;
function personaPicture(state) {
  return !isClothesRuleOn(state) || state.wearing === "own"
    ? personaAvatar(state)
    : (state.clothes.pics?.[state.wearing]?.url ?? personaAvatar(state));
}
function personaCutout(state) {
  return avatarFrameOf(state) !== "cut" || !isClothesRuleOn(state) || state.wearing === "own"
    ? null
    : (state.clothes.pics?.[state.wearing]?.clean?.url ?? null);
}
var avatarFrameOf = (persona) => (persona?.frame === "cut" ? "cut" : "framed");
function cutoutsDue(state) {
  return avatarFrameOf(state) !== "cut" || !isClothesRuleOn(state)
    ? []
    : Object.entries(state.clothes.pics ?? {})
        .filter(([, pic]) => pic?.url && !pic.clean && !pic.cleanFailed)
        .map(([outfitId]) => outfitId);
}
function keepPersonaCutout(state, outfitId, { url = null, ref = null } = {}) {
  let pic = state.clothes?.pics?.[outfitId];
  if (pic?.url) {
    if (url) {
      pic.clean = {
        url: url,
        ref: ref,
      };
      delete pic.cleanFailed;
    } else {
      pic.cleanFailed = true;
    }
  }
}
function describePersonaAsSeen(state, viewerId = null) {
  let appearance = isClothesRuleOn(state)
      ? state.clothes.appearance
      : state.personaFigure?.body || state.persona?.appearance || "",
    known = !viewerId || state.bonds?.[viewerId]?.met !== false,
    baseText = describePlayerAppearance(
      {
        name: known ? (state.persona?.name ?? "") : "",
        appearance: appearance,
      },
      wearingText(state),
    ),
    wheels = viewerId ? wheelsSeen(state, viewerId) : "",
    genderWord =
      {
        female: "A woman",
        male: "A man",
        futanari: "A futanari",
      }[state.gender] ?? "",
    richLook = richLookOf(state),
    metViewer = !!viewerId && !!state.bonds?.[viewerId] && state.bonds[viewerId].met !== false,
    richText = [
      richLook?.clothes ? "Designer clothes: plainly expensive" : "",
      richLook?.home && metViewer ? `Lives in ${richLook.home}` : "",
    ]
      .filter(Boolean)
      .join("; "),
    extras = [genderWord, isMarriedToAnyone(state) ? "Wears a wedding ring" : "", wheels, richText]
      .filter(Boolean)
      .join("; ");
  return extras ? `${baseText} \u2014 ${extras}.` : baseText;
}
function richLookOf(state) {
  let placeId = state.lodging ? null : state.residence?.place,
    homeText =
      placeId === "mansions" ? "a mansion on the hill" : placeId === "tower" ? "a luxury flat in Skyline Tower" : "",
    worn = wearingItem(state),
    clothesText = worn?.luxury ? worn.name : "";
  return homeText || clothesText
    ? {
        home: homeText,
        clothes: clothesText,
      }
    : null;
}
function wearingText(state) {
  let worn = wearingItem(state);
  return worn
    ? isClothesRuleOn(state)
      ? state.wearing === "own"
        ? state.clothes.wearing || worn.name
        : worn.text || worn.name
      : worn.name
    : "";
}
function setPersonaClothes(state, { on: on, appearance: appearance, wearing: wearing } = {}) {
  let clean = (text) =>
    String(text ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1500);
  if (!on) {
    state.rules = {
      ...state.rules,
      clothes: false,
    };
    if (state.wearing === "own") {
      state.wearing = "casual";
    }
    return {
      ok: true,
      on: false,
    };
  }
  let clothes = state.clothes ?? {
    pics: {},
    failed: {},
  };
  state.clothes = {
    ...clothes,
    appearance: clean(appearance),
    wearing: clean(wearing),
    pics: clothes.pics ?? {},
    failed: clothes.failed ?? {},
  };
  state.rules = {
    ...state.rules,
    clothes: true,
  };
  if (!state.things.closet.includes("own")) {
    state.things.closet.unshift("own");
  }
  if (state.wearing === "casual") {
    state.wearing = "own";
  }
  return {
    ok: true,
    on: true,
  };
}
function keepOutfitPicture(state, outfitId, { url = null, ref = null, error = "", own = false, clean = null } = {}) {
  if (state.clothes) {
    state.clothes.pics ??= {};
    state.clothes.failed ??= {};
    if (!(!own && state.clothes.pics[outfitId]?.own)) {
      if (url) {
        state.clothes.pics[outfitId] = {
          url: url,
          ref: ref,
          at: state.minutes,
          ...(own
            ? {
                own: true,
              }
            : {}),
          ...(clean?.url
            ? {
                clean: clean,
              }
            : {}),
        };
        delete state.clothes.failed[outfitId];
      } else {
        state.clothes.failed[outfitId] = String(error).slice(0, 200);
      }
    }
  }
}
function outfitsToPaint(state, storeId) {
  return isClothesRuleOn(state)
    ? buildClothesRack(state.things, storeId, {
        season: seasonNow(state),
      })
        .filter((outfit) => !state.clothes.pics?.[outfit.id])
        .map((outfit) => outfit.id)
    : [];
}
function clothesRackView(state) {
  if (!isClothesStore(state.at)) {
    return {
      ok: false,
      reason: "The racks are in the Mall's clothes stores.",
    };
  }
  let store = townPlace(state.town, state.at);
  if (!isPlaceOpen(store, state.minutes)) {
    return {
      ok: false,
      reason: `${store.name} is closed.`,
    };
  }
  let pics = isClothesRuleOn(state) ? (state.clothes.pics ?? {}) : {},
    marks = styleMarks(state),
    outfits = buildClothesRack(state.things, state.at, {
      season: seasonNow(state),
      wearing: state.wearing,
      pics: pics,
      cash: state.wallet.cash,
      off: discountHere(state).off,
      wedding: !!state.wedding,
    }).map((outfit) => ({
      ...outfit,
      failed: isClothesRuleOn(state) ? (state.clothes.failed?.[outfit.id] ?? "") : "",
      marks: marks[outfit.section ?? "casual"] ?? [],
    }));
  return {
    ok: true,
    store: {
      id: store.id,
      name: store.name,
    },
    outfits: outfits,
    cash: state.wallet.cash,
    clothes: isClothesRuleOn(state),
    connection: !!imageChoice(state).connectionId,
  };
}
function buyOutfit(state, outfitId, { wear = false } = {}) {
  if (state.scene && !state.scene.done) {
    return {
      ok: false,
      reason: "You are in the middle of a scene.",
    };
  }
  let rack = clothesRackView(state);
  if (!rack.ok) {
    return rack;
  }
  let minutes = SHOP_BROWSE_MINUTES + (wear ? CHANGE_CLOTHES_MINUTES : 0),
    closingReason = closingWhy(state, minutes);
  if (closingReason) {
    return {
      ok: false,
      reason: closingReason,
    };
  }
  let check = checkClothesPurchase(state.things, state.at, outfitId, {
    season: seasonNow(state),
    cash: state.wallet.cash,
    off: discountHere(state).off,
    wedding: !!state.wedding,
  });
  if (!check.ok) {
    return check;
  }
  let payment = spendMoney(state.wallet, check.total, "Clothes", state.minutes);
  if (!payment.ok) {
    return {
      ok: false,
      reason: payment.reason,
    };
  }
  addClothesToCloset(state.things, outfitId);
  let { events: events } = advanceTime(state, minutes),
    wore = wear && !hasFaintedEvent(events);
  if (wore) {
    state.wearing = outfitId;
  }
  logNote(state, `Bought ${check.item.name} ($${check.total})${wore ? " and wore it out of the store" : ""}`, "money");
  return {
    ok: true,
    name: check.item.name,
    total: check.total,
    minutes: minutes,
    wore: wore,
    events: events,
  };
}
function bedQualityOf(state) {
  if (state.lodging?.kind === "couch") {
    return COUCH_BED_QUALITY;
  }
  let homeKind = homeKindOf(state.wallet.home),
    bedLevel = furnitureLevel(state, "bed");
  return homeKind.bedQuality + (bedLevel ? HOME_SLOT_EFFECTS.bed(bedLevel).bedQuality : 0);
}

export {
  bedQualityOf,
  buyOutfit,
  clothesRackView,
  cutoutsDue,
  describePersonaAsSeen,
  furnitureLevel,
  homeFurnitureSlots,
  homeHasFurniture,
  isClothesRuleOn,
  isLuxuryHome,
  keepOutfitPicture,
  keepPersonaCutout,
  outfitsToPaint,
  personaAvatar,
  personaCutout,
  personaPicture,
  richLookOf,
  setPersonaClothes,
  wearingItem,
  wearingText,
};
