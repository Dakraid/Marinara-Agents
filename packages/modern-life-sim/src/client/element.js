// DOM morph helpers, style mounting, custom element class and define
import { STYLES } from "./styles.js";
import { MAP, brokenView, checkedInto, cropBox, cropView, escape, withFutanari } from "./views/common.js";
import { firstDayCard, titleView } from "./views/title.js";
import { mapView, phoneButton } from "./views/town-map.js";
import {
  CAP_TAG,
  corridorView,
  drawLinks,
  mallView,
  placeView,
  walkAlong,
  walkTown,
  yourGenderAsk,
} from "./views/place.js";
import {
  castReviewView,
  creationView,
  draftPictureCounts,
  matesOf,
  pickerList,
  pickerShown,
  pickerView,
  presetsView,
  rolledDay,
  stepOpen,
} from "./views/creation.js";
import { addBlock, clearBlock, copyDay, editBlock, weekView } from "./views/week.js";
import { autoDelay, readingLine, sceneView } from "./views/scene.js";
import { albumLight, contactRows, contactsView, galleryView, newsView, setPage } from "./views/people.js";
import {
  answerInterview,
  askDayOff,
  careerCardView,
  careerOverlay,
  closeJobCard,
  jobsAppView,
  openInterview,
  openJobs,
  pickMoment,
  quitAsk,
  quitYes,
  sceneJobCard,
  sceneJobChoose,
  stayLate,
} from "./views/career.js";
import { guideList, guideView, phoneView, youView } from "./views/phone.js";
import {
  IP_FIELD,
  PORTRAIT_SIZES,
  calendarView,
  ipBar,
  ipChanged,
  ipHead,
  ipPreview,
  ipUnsaved,
  ipUsed,
  paintingView,
  picturesWarning,
  settingsView,
  sizeWH,
} from "./views/settings.js";
import { askView, backpackView, clothesReviewView, kitchenView, rackView, shopView } from "./views/home.js";
import {
  DROP_WHY_NOT,
  billNudge,
  billPay,
  billsAppView,
  couchGo,
  dropAccepts,
  evictNext,
  evictPark,
  evictView,
  homesAppView,
  homesMove,
  homesStay,
  keysView,
  noticeView,
  openBills,
  openHomes,
  weddingAppView,
} from "./views/homes.js";
import {
  hpSend,
  inviteAsk,
  inviteBack,
  inviteCounter,
  inviteOpen,
  openHouseParty,
  outingClose,
  outingHeld,
  outingLines,
  outingNight,
  outingPost,
  outingScreen,
  outingStart,
  partyStep,
  planCancel,
  planWait,
  theirPartyOverView,
  weddingDayView,
} from "./views/outings.js";
import {
  modAppView,
  modCall,
  modCastToggle,
  modCutView,
  modDraftNeeds,
  modFold,
  modOnAnswer,
  modOnCard,
  modScene,
  modWho,
} from "./views/mods.js";
import { cardView, faintView, floatFrom, hudSnap, playCard, playFaint, rollHud, typeInto } from "./views/cards.js";
import {
  fxT,
  motionAfter,
  motionBefore,
  motionGone,
  motionMode,
  motionSkip,
  motionTap,
  setMotionMode,
  systemWantsLess,
} from "./motion.js";
import { S, cancelRunning, notify, playStart, playStop, playTouched, searchLibraryIds } from "./state.js";
import {
  acceptWelcome,
  approachScene,
  firstDayDone,
  loadTitle,
  markChangelogSeen,
  openGuide,
  openLife,
  partyRemember,
  seenChangelog,
  startScene,
} from "./actions/title.js";
import {
  answerDoor,
  birthdayMessage,
  lentAsk,
  openWedding,
  openWeddingDay,
  pleaAnswer,
  pleaUndo,
  proposeTonight,
  redoSeasonPicture,
  redoWorkSprite,
  rideAnswer,
  saveSeasonOutfit,
  saveWorkOutfit,
  sceneAuto,
  sceneClose,
  sceneCloseOnly,
  sceneDecide,
  sceneEnd,
  sceneLogToggle,
  sceneNext,
  sceneReply,
  sceneSkip,
  sceneUndetect,
  setFrame,
  setJobFor,
  setOrientation,
  setPictureSize,
  setPortraitSize,
  setWeddingDay,
  setYourGender,
  suitsAsk,
  vehicleSell,
  walkInAnswer,
  weddingChoose,
  weddingInvite,
  weddingSend,
} from "./actions/scene.js";
import {
  askCount,
  askNo,
  askThing,
  askYes,
  cartAdd,
  cartDec,
  closeBackpack,
  closePhone,
  cookForThem,
  cookPopTap,
  cookTogether,
  kitchenBack,
  loadThings,
  lookPaintMissing,
  lookPause,
  lookPick,
  lookRedo,
  lookSave,
  openBackpack,
  openHomePanel,
  openKitchen,
  openKitchenFor,
  openKitchenWith,
  openPhone,
  openSettings,
  openShop,
  openYou,
  paintListeners,
  paintingGo,
  pileAt,
  shopBack,
  shopPay,
  thingDo,
} from "./actions/phone.js";
import {
  albumClose,
  albumOpen,
  albumPick,
  albumRedo,
  changeMemory,
  faceEditCancel,
  faceEditOpen,
  faceEditReset,
  faceEditSave,
  figureSave,
  galleryWho,
  newsAll,
  newsMet,
  newsOk,
  newsPick,
  openChart,
  openContacts,
  openGallery,
  openNews,
  openSheet,
  pairCancel,
  pairEdit,
  pairRemove,
  pairSave,
  setJustFriends,
  setMemoryBudget,
  watchNews,
} from "./actions/people.js";
import {
  countLibrary,
  goToCastStep,
  goToWeekStep,
  openCreate,
  presetBlank,
  presetDelete,
  presetFromLife,
  presetLoad,
  presetRename,
  presetSave,
  presetsClose,
  presetsOpen,
  queueReads,
  readFailedCast,
  readWholeCast,
  refreshResources,
  saveDraftNow,
  saveDraftSoon,
  startLife,
  startOver,
  stopReading,
  stopReadingAll,
  useTemplate,
} from "./actions/creation.js";
import {
  backToMapFromAnywhere,
  cardNext,
  clothesCancel,
  clothesOff,
  clothesSave,
  deleteLife,
  deletePicked,
  doActivity,
  duplicateLife,
  enterPlace,
  fadeGone,
  faintDone,
  faintNext,
  giftClose,
  giftOpen,
  giftPick,
  giveGift,
  goIn,
  goInStore,
  goTo,
  openClothesReview,
  openCorridor,
  openRack,
  pickPerson,
  pictureAsk,
  rackBack,
  rackBuy,
  rackPaint,
  rackTry,
  rackWear,
  renameLife,
  setPictureMode,
  toHall,
} from "./actions/town.js";
import {
  addPeople,
  addingPicked,
  calendarNote,
  castAway,
  castRefresh,
  castRename,
  closeAdding,
  cropClose,
  cropOpen,
  cropSave,
  debugCopy,
  debugOpen,
  debugScope,
  ipDiscard,
  ipFocus,
  ipInput,
  ipPick,
  ipReset,
  ipResetAll,
  ipSave,
  ipShowDefault,
  ipTry,
  loadCalls,
  moduleCast,
  moduleCharacter,
  openAdding,
  openCalendar,
  promptListeners,
  saveModule,
  saveRule,
  saveSetting,
  setSpoiler,
  settingsTab,
  traitSet,
  traitsOpen,
  traitsSave,
  uploadBackdrop,
} from "./actions/settings.js";
import {
  doTogether,
  introduceMe,
  keyIn,
  knockDoor,
  openSleep,
  payBack,
  seeGuestOut,
  sleepClose,
  sleepGo,
  sleepOpen,
  sleepPick,
  talkDone,
  talkTo,
  visitIn,
  visitOut,
  wakeUp,
} from "./actions/talk.js";

const TAG = "marinara-capability-modern-life-sim";
const FLASH_VIEWS = ["map", "place", "corridor"];
const FLASH_MS = 4500;
function morph(from, to) {
  if (from.nodeType !== to.nodeType || from.nodeName !== to.nodeName) {
    from.replaceWith(to);
    return;
  }
  if (from.nodeType !== 1) {
    if (from.nodeValue !== to.nodeValue) {
      from.nodeValue = to.nodeValue;
    }
    return;
  }
  for (const { name: attr } of [...from.attributes]) {
    if (!to.hasAttribute(attr)) {
      from.removeAttribute(attr);
    }
  }
  for (const { name: attr, value: value } of [...to.attributes]) {
    if (from.getAttribute(attr) !== value) {
      from.setAttribute(attr, value);
    }
  }
  morphChildren(from, to);
}
function morphChildren(from, to) {
  const oldKids = [...from.childNodes],
    newKids = [...to.childNodes];
  newKids.forEach((kid, i) => (oldKids[i] ? morph(oldKids[i], kid) : from.appendChild(kid)));
  oldKids.slice(newKids.length).forEach((kid) => kid.remove());
}
const SCROLL_RULE = /([^{}]+)\{[^}]*overflow(?:-[xy])?\s*:\s*(?:auto|scroll)[^}]*\}/g;
function scrollerSelectors(css) {
  const selectors = new Set();
  for (const [, selectorList] of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(SCROLL_RULE)) {
    for (const selector of selectorList
      .split(",")
      .map((sel) => sel.trim())
      .filter(Boolean)) {
      if (!(selector.startsWith("@") || selector.includes("::"))) {
        try {
          document.createDocumentFragment().querySelector(selector);
          selectors.add(selector);
        } catch {
          // Best effort: nothing to do when this fails.
        }
      }
    }
  }
  return [...selectors].join(", ");
}
function solidBehind(chain) {
  for (const [i, layer] of chain.entries()) {
    if ((i > 0 && layer.layered) || (layer.backgroundImage && layer.backgroundImage !== "none")) {
      return null;
    }
    const rgba = /^rgba?\(([^)]+)\)$/.exec(layer.backgroundColor ?? ""),
      alpha = rgba ? Number(rgba[1].split(/[\s,/]+/).filter(Boolean)[3] ?? 1) : 0;
    if (alpha >= 1) {
      return i === 0 ? null : layer.backgroundColor;
    }
    if (
      alpha > 0 ||
      (i > 0 && ["absolute", "fixed"].includes(layer.position)) ||
      (i === 0 && ["absolute", "fixed"].includes(layer.position))
    ) {
      return null;
    }
  }
  return null;
}
const hasLayer = (el) =>
  [...el.children].some((child) => {
    const style = getComputedStyle(child);
    return ["absolute", "fixed"].includes(style.position)
      ? style.backgroundImage !== "none" || !/^rgba\([^)]*,\s*0\)$|^transparent$/.test(style.backgroundColor)
      : false;
  });
let scrollerSel = null;
function solidScrollers(root) {
  if (root && ((scrollerSel ??= scrollerSelectors(typeof STYLES == "string" ? STYLES : "")), !!scrollerSel)) {
    for (const scroller of root.querySelectorAll(scrollerSel)) {
      const chain = [];
      for (let node = scroller; node && node.nodeType === 1; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (
          (chain.push({
            backgroundColor: style.backgroundColor,
            backgroundImage: style.backgroundImage,
            position: style.position,
            layered: node !== scroller && hasLayer(node),
          }),
          node === root)
        ) {
          break;
        }
      }
      const color = solidBehind(chain);
      if (color) {
        scroller.style.backgroundColor = color;
      }
    }
  }
}
function mountStyles() {
  if (document.getElementById("mls-styles")) {
    return;
  }
  const styleEl = document.createElement("style");
  styleEl.id = "mls-styles";
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);
}
class ModernLifeSimElement extends HTMLElement {
  connectedCallback() {
    mountStyles();
    this.classList.add("mls");
    this._render = () => this.render();
    S.listeners.add(this._render);
    this.addEventListener("click", (ev) => this.onClick(ev));
    this.addEventListener("pointerover", (ev) =>
      this.chartFocus(ev.target.closest?.(".mls-chart .node")?.dataset.node ?? null),
    );
    this.addEventListener("pointerdown", (ev) => {
      this.dragScroll(ev);
      this.dragFace(ev);
      this.dragCrop(ev);
    });
    this.addEventListener("pointerdown", motionTap, true);
    this.addEventListener("pointerdown", (ev) => this.dragDown(ev), true);
    this.addEventListener("pointerdown", (ev) => this.fabDown(ev), true);
    this.addEventListener("pointerdown", playTouched, true);
    this.addEventListener(
      "pointerdown",
      () =>
        refreshResources({
          soon: true,
        }),
      true,
    );
    this.addEventListener("keydown", playTouched, true);
    this.addEventListener("wheel", playTouched, {
      capture: true,
      passive: true,
    });
    playStart(this);
    this.addEventListener("dragover", (ev) => {
      const dropZone = ev.target.closest?.("[data-drop-key]");
      if (dropZone) {
        ev.preventDefault();
        dropZone.classList.add("drop-on");
      }
    });
    this.addEventListener("dragleave", (ev) => ev.target.closest?.("[data-drop-key]")?.classList.remove("drop-on"));
    this.addEventListener("drop", (ev) => {
      const dropZone = ev.target.closest?.("[data-drop-key]");
      if (dropZone) {
        ev.preventDefault();
        uploadBackdrop(dropZone.dataset.dropKey, ev.dataTransfer?.files?.[0]);
      }
    });
    this.addEventListener("contextmenu", (ev) => {
      if (ev.target.closest?.(".mls-phone-fab")) {
        ev.preventDefault();
      }
    });
    this._dragMove = (ev) => {
      this.dragMove(ev);
      this.fabMove(ev);
    };
    this._dragUp = (ev) => {
      this.dragUp(ev);
      this.fabUp(ev);
    };
    document.addEventListener("pointermove", this._dragMove);
    document.addEventListener("pointerup", this._dragUp);
    this._fabCancel = (ev) => this.fabUp(ev);
    document.addEventListener("pointercancel", this._fabCancel);
    this.addEventListener(
      "click",
      (ev) => {
        if (this._swallowClick || motionSkip()) {
          ev.stopPropagation();
          ev.preventDefault();
        }
      },
      true,
    );
    this.addEventListener("change", (ev) => {
      const input = ev.target;
      if (input.dataset?.setRule) {
        return saveRule(input.dataset.setRule, input.checked, "rules");
      }
      if (input.dataset?.setUbi !== undefined) {
        return saveRule("ubi", Math.max(0, Math.floor(Number(input.value) || 0)), "rules");
      }
      if (input.dataset?.modCast) {
        const [moduleId, characterId, key] = input.dataset.modCast.split("|");
        if (input.type === "checkbox") {
          // Turning it on opens the options that come with it.
          if (input.checked) {
            modCastToggle(`${moduleId}|${characterId}`, true);
          }
          return moduleCast(moduleId, characterId, key, input.checked);
        }
        return moduleCast(moduleId, characterId, key, input.value);
      }
      if (input.dataset?.modSheet) {
        const [moduleId, key] = input.dataset.modSheet.split("|");
        return moduleCharacter(moduleId, key, input.value);
      }
      if (input.dataset?.modSheetMulti) {
        const [moduleId, key] = input.dataset.modSheetMulti.split("|"),
          picked = [...input.closest(".mls-modopt-chips").querySelectorAll("input:checked")].map((box) => box.value);
        if (!picked.length) {
          input.checked = true;
          return;
        }
        return moduleCharacter(moduleId, key, picked);
      }
      if (input.dataset?.modSheetTag) {
        const [moduleId, key] = input.dataset.modSheetTag.split("|"),
          text = input.value.trim(),
          current = (S.sheet?.modules ?? []).find((opt) => opt.module === moduleId && opt.key === key)?.items ?? [];
        return text ? moduleCharacter(moduleId, key, [...current, text]) : undefined;
      }
      if (input.dataset?.setModule && input.dataset.opt === "on" && input.checked) {
        input.checked = false;
        S.modOn = {
          id: input.dataset.setModule,
          name: S.life?.modules?.[input.dataset.setModule]?.name ?? "It",
          confirm: S.life?.modules?.[input.dataset.setModule]?.confirm,
          where: "settings",
        };
        return this.render();
      }
      const lockingOption =
        input.dataset?.setModule && input.checked && S.life?.modules?.[input.dataset.setModule]?.on
          ? (S.life.modules[input.dataset.setModule].options ?? []).find(
              (opt) => opt.key === input.dataset.opt && opt.locks,
            )
          : null;
      if (lockingOption) {
        input.checked = false;
        S.modOn = {
          id: input.dataset.setModule,
          name: S.life.modules[input.dataset.setModule].name ?? "It",
          where: "settings",
          key: lockingOption.key,
          label: lockingOption.title,
        };
        return this.render();
      }
      if (input.dataset?.setModule) {
        return saveModule(
          input.dataset.setModule,
          input.dataset.opt,
          input.type === "checkbox" ? input.checked : input.value,
        );
      }
      if (input.dataset?.ipSel) {
        return ipPick(input.dataset.ipSel, input.value);
      }
      if (input.dataset?.pair && S.draft?.pairEdit) {
        S.draft.pairEdit[input.dataset.pair] = input.value;
        this.render();
        return;
      }
      if (input.matches?.("[data-news-week]")) {
        return newsPick(input.value);
      }
      if (input.dataset?.jobFor) {
        return setJobFor(input.dataset.jobFor, input.value);
      }
      if (input.dataset?.jobTitleFor) {
        return setJobFor(input.dataset.jobTitleFor, "home", input.value);
      }
      if (input.dataset?.orientFor) {
        if (input.dataset.orient === "into") {
          const checked = checkedInto(input),
            into = withFutanari(
              checked,
              input.checked ? checked.filter((group) => group !== input.value) : [...checked, input.value],
            );
          return into.length ? setOrientation(input.dataset.orientFor, "into", into) : this.render();
        }
        return setOrientation(input.dataset.orientFor, input.dataset.orient, input.value);
      }
      if (input.dataset?.trait) {
        return traitSet(input.dataset.trait, input.value);
      }
      if (input.dataset && "yourGender" in input.dataset) {
        return setYourGender(input.value);
      }
      if (input.dataset && "setClothes" in input.dataset) {
        if (input.checked) {
          input.checked = false;
          openClothesReview("settings");
          return;
        }
        return clothesOff();
      }
      if (input.dataset?.setShow) {
        return setSpoiler(input.dataset.setShow, input.value);
      }
      if (input.dataset?.sample) {
        return saveSetting("sampling", {
          [input.dataset.sample]: input.value,
        });
      }
      if (input.dataset?.set) {
        return saveSetting(input.dataset.set, input.value);
      }
      if (input.dataset?.upload) {
        uploadBackdrop(input.dataset.upload, input.files?.[0]);
        input.value = "";
        return;
      }
      if (input.dataset?.picUpload) {
        const data = input.dataset;
        cropOpen(
          {
            kind: data.picUpload,
            character: data.character,
            season: data.season === undefined ? undefined : Number(data.season),
            item: data.item,
          },
          input.files?.[0],
        );
        input.value = "";
        return;
      }
      if (input.dataset?.sizeFor) {
        const sizeBox2 = input.closest(".mls-size"),
          size = {
            width: Math.round(Number(sizeBox2?.querySelector("[data-size-w]")?.value)),
            height: Math.round(Number(sizeBox2?.querySelector("[data-size-h]")?.value)),
          };
        if (input.dataset.sizeFor === "draft-size") {
          if (S.draft) {
            S.draft.size = size;
          }
          this.render();
          return;
        }
        if (input.dataset.sizeFor === "draft-portrait") {
          if (S.draft) {
            S.draft.portraitSize = size;
          }
          this.render();
          return;
        }
        return input.dataset.sizeFor === "portrait-set" ? setPortraitSize(size) : setPictureSize(size);
      }
      if (!this.onLookChange(ev)) {
        if (ev.target.matches?.("[data-do=send-home]")) {
          S.shopSendHome = ev.target.checked;
          this.render();
          return;
        }
        if (ev.target.matches?.("[data-do=mem-budget]")) {
          return setMemoryBudget(ev.target.value);
        }
        this.onCreateChange(ev);
      }
    });
    this.addEventListener("input", (ev) => {
      if (ev.target.dataset?.ip) {
        ipInput(ev.target.dataset.ip, ev.target.value);
        this.paintPromptField(ev.target.dataset.ip);
        return;
      }
      if (ev.target.matches?.("[data-clothes-f]") && S.clothesReview) {
        S.clothesReview[ev.target.dataset.clothesF] = ev.target.value;
        return;
      }
      if (ev.target.matches("[data-do=face-zoom]") && S.faceEdit) {
        S.faceEdit.zoom = Number(ev.target.value) || 2;
        this.paintFace();
        return;
      }
      if (ev.target.matches("[data-do=crop-zoom]") && S.crop) {
        S.crop.zoom = Number(ev.target.value) || 1;
        this.paintCrop();
        return;
      }
      if (ev.target.matches("[data-do=look-tags], [data-do=draft-look-tags]")) {
        this.onLookChange(ev);
        return;
      }
      if (ev.target.matches("[data-do=guide-find]")) {
        S.guideQuery = ev.target.value;
        const list = this.querySelector("#mls-guide-list");
        if (list && S.guideBook) {
          list.innerHTML = guideList(S.guideBook, {
            at: S.guideAt,
            query: S.guideQuery,
          });
        }
        return;
      }
      if (ev.target.matches("[data-do=contacts-find]")) {
        S.contactsFind = ev.target.value;
        const rows = this.querySelector("#mls-contact-rows");
        if (rows) {
          rows.innerHTML = contactRows({
            life: S.life,
            sheet: S.sheet,
            find: S.contactsFind,
          });
        }
        return;
      }
      if (
        ev.target.matches(
          "[data-do=name], [data-do=scenario], [data-do=picker-search], [data-do=language-other], [data-do=week-doing], [data-do=week-find], [data-do=town-name], [data-do=place-name], [data-do=job-title]",
        )
      ) {
        this.onCreateChange(ev);
      }
    });
    this._paint = ({ changed: changed }) => this.onPainted(changed);
    paintListeners.add(this._paint);
    this._prompts = () => this.paintPromptPreview();
    promptListeners.add(this._prompts);
    this.addEventListener("focusin", (ev) => {
      const group = ev.target.closest?.(".mls-ip-f")?.dataset.g;
      if (!(!group || group === S.prompts.focus)) {
        S.prompts.focus = group;
        this.querySelectorAll(".mls-ip-g").forEach((groupEl) =>
          groupEl.classList.toggle("focus", groupEl.dataset.g === group),
        );
        this.paintPromptPreview();
      }
    });
    this._watch = new ResizeObserver(() => this.onResize());
    this._watch.observe(this);
    this._overlay = document.createElement("div");
    this._overlay.className = "mls mls-overlay";
    this._overlay.addEventListener("click", (ev) => this.onClick(ev));
    this._overlay.addEventListener("change", (ev) => this.onCreateChange(ev));
    this._overlay.addEventListener("input", (ev) => {
      if (ev.target.matches("[data-do=picker-search]")) {
        this.onCreateChange(ev);
      }
      if (ev.target.matches("[data-preset-name]") && S.presets) {
        S.presets.name = ev.target.value;
      }
      if (ev.target.matches("[data-preset-rename]") && S.presets) {
        S.presets.renameText = ev.target.value;
      }
    });
    document.body.appendChild(this._overlay);
    if (S.view === "loading") {
      loadTitle();
    } else {
      this.render();
      refreshResources();
    }
  }
  disconnectedCallback() {
    playStop();
    S.listeners.delete(this._render);
    paintListeners.delete(this._paint);
    promptListeners.delete(this._prompts);
    this._watch?.disconnect();
    this._overlay?.remove();
    motionGone();
    document.removeEventListener("pointermove", this._dragMove);
    document.removeEventListener("pointerup", this._dragUp);
    document.removeEventListener("pointercancel", this._fabCancel);
  }
  renderOverlay() {
    if (!this._overlay) {
      return;
    }
    const creating = S.view === "create" || !!S.draft?.adding;
    this._overlay.innerHTML =
      creating && S.draft?.presetsOpen
        ? presetsView({
            presets: S.presets,
            resources: S.resources,
          })
        : creating && S.draft?.pickerOpen
          ? pickerView({
              resources: S.resources,
              draft: S.draft,
            })
          : "";
    solidScrollers(this._overlay);
  }
  onResize() {
    this.measureTab();
    if (this.isNarrow() !== this._narrow) {
      this.render();
    } else {
      drawLinks(this);
    }
  }
  measureTab() {
    const height = this.parentElement?.clientHeight || innerHeight;
    if (height && height !== this._tabH) {
      this._tabH = height;
      this.style.setProperty("--tab-h", `${height}px`);
    }
  }
  closeLoad() {
    const finish = () => {
        S.titleTab = "";
        S.picking = null;
        S.menuFor = null;
        this.render();
      },
      pop = this.querySelector(".mls-loadpop");
    if (!pop || this.classList.contains("motion-off")) {
      return finish();
    }
    pop.classList.add("leave");
    setTimeout(finish, 220);
  }
  placeLoad() {
    const pop = this.querySelector(".mls-loadpop:not(.under)"),
      activeItem = this.querySelector(".mls-mm.on");
    if (!pop || !activeItem) {
      return;
    }
    const frame = pop.offsetParent.getBoundingClientRect(),
      itemRect = activeItem.getBoundingClientRect(),
      rights = [
        ...this.querySelectorAll(
          ".mls-menu-col .mls-mm, .mls-menu-col .mls-mm .new, .mls-logo span, .mls-alpha-tags span",
        ),
      ].map((el) => el.getBoundingClientRect().right),
      left = Math.max(itemRect.right, ...rights) - frame.left + 40;
    pop.style.left = `${left}px`;
    pop.style.width = `${Math.max(280, Math.min(860, frame.width - left - 24))}px`;
    const centerY = itemRect.top + itemRect.height / 2 - frame.top,
      topPx = Math.max(12, Math.min(this.clientHeight - pop.offsetHeight - 12, centerY - pop.offsetHeight / 2));
    pop.style.top = `${topPx}px`;
    for (const slot of pop.querySelectorAll(".mls-slot")) {
      const slotRect = slot.getBoundingClientRect();
      slot.style.setProperty("--fx", `${itemRect.left + itemRect.width / 2 - (slotRect.left + slotRect.width / 2)}px`);
      slot.style.setProperty("--fy", `${itemRect.top + itemRect.height / 2 - (slotRect.top + slotRect.height / 2)}px`);
    }
    if (pop.classList.contains("enter")) {
      setTimeout(() => pop.classList.remove("enter"), 400 + pop.querySelectorAll(".mls-slot").length * 70);
    }
  }
  placeHere() {
    const here = this.querySelector(".mls-here"),
      when = this.querySelector(".mls-scene .when"),
      parent = here?.offsetParent;
    if (!here || !when || !parent) {
      return;
    }
    const parentTop = parent.getBoundingClientRect().top,
      topPx = Math.round(when.getBoundingClientRect().bottom - parentTop + 10);
    here.style.top = `${topPx}px`;
    const limits = [...this.querySelectorAll(".mls-scene .box, .mls-scene .box .end, .mls-scene .controls")]
      .map((el) => el.getBoundingClientRect())
      .filter((rect) => rect.height)
      .map((rect) => rect.top - parentTop - 12);
    here.style.maxHeight = limits.length
      ? `${Math.max(0, Math.round(Math.min(...limits) - topPx))}px`
      : `calc(100% - ${topPx + (this._narrow ? 202 : 180)}px)`;
    const whos = [...here.querySelectorAll(".who")],
      bottom = here.getBoundingClientRect().bottom + 0.5,
      firstHidden = whos.findIndex((who) => who.getBoundingClientRect().bottom > bottom);
    if (firstHidden < 0) {
      return;
    }
    const keep = Math.max(0, firstHidden - 1);
    for (const who of whos.slice(keep)) {
      who.style.display = "none";
    }
    here.insertAdjacentHTML(
      "beforeend",
      `<div class="who more"><span class="n"><b>+${whos.length - keep}</b></span></div>`,
    );
  }
  chartFocus(nodeId) {
    if (this._narrow && nodeId === null && S.chartFocus) {
      return;
    }
    const board = this.querySelector(".mls-chart .board");
    if (!(!board || board.dataset.focus === (nodeId ?? ""))) {
      board.dataset.focus = nodeId ?? "";
      board.classList.toggle("focusing", !!nodeId);
      for (const line of board.querySelectorAll("line[data-a]")) {
        line.classList.toggle("lit", !!nodeId && (line.dataset.a === nodeId || line.dataset.b === nodeId));
      }
      for (const node of board.querySelectorAll(".node")) {
        node.classList.toggle("lit", node.dataset.node === nodeId);
      }
    }
  }
  isNarrow() {
    return (this.clientWidth || innerWidth) <= 700;
  }
  onClick(ev) {
    for (const info2 of this.querySelectorAll(".mls-info[open]")) {
      if (!info2.contains(ev.target)) {
        info2.open = false;
      }
    }
    if (S.busy) {
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.target.closest("[data-do=cancel-call]")) {
        cancelRunning();
      }
      return;
    }
    if (
      S.view === "title" &&
      S.titleTab === "load" &&
      !S.picking &&
      !S.menuFor &&
      !S.oldSave &&
      !S.changelogOpen &&
      !ev.target.closest(".mls-loadpop, .mls-pop, .mls-mm, .mls-ask-veil, [data-do]")
    ) {
      this.closeLoad();
      return;
    }
    if ((S.view === "scene" || S.view === "outing") && this.sceneAnywhere(ev.target)) {
      return;
    }
    const target = ev.target.closest("[data-do]");
    if (!target || (!this.contains(target) && !this._overlay?.contains(target))) {
      return;
    }
    const { do: action, id: id, place: place, activity: activity, character: character } = target.dataset;
    if ((this.touched(target), action !== "menu" && (S.menuFor = null), action === "title")) {
      S.picking = null;
      return loadTitle();
    }
    if (action === "corridor") {
      return openCorridor(target.dataset.place);
    }
    if (action === "go-in") {
      return goIn();
    }
    if (action === "store-in") {
      return goInStore(place);
    }
    if (action === "to-hall") {
      return toHall();
    }
    if (action === "rack-pick") {
      S.rackPick = id;
      this.render();
      return;
    }
    if (action === "rack-buy") {
      return rackBuy(id, target.dataset.wear === "1");
    }
    if (action === "rack-try") {
      return rackTry(id);
    }
    if (action === "rack-wear") {
      return rackWear(id);
    }
    if (action === "rack-paint") {
      return rackPaint(id);
    }
    if (action === "paint-bg") {
      return lookRedo(target.dataset.key);
    }
    if (action !== "paint-wait") {
      if (action === "pictures-mode") {
        return target.dataset.to === "auto" ? pictureAsk(id) : setPictureMode(id, "manual");
      }
      if (action === "pictures-yes") {
        return setPictureMode(S.picturesAsk, "auto");
      }
      if (action === "pictures-no") {
        S.picturesAsk = null;
        this.render();
        return;
      }
      if (action === "draft-pictures") {
        S.draft.pictures ??= {};
        if (target.dataset.to === "auto") {
          S.draft.picturesAsk = id;
        } else {
          S.draft.pictures[id] = "manual";
        }
        this.render();
        return;
      }
      if (action === "draft-pictures-yes") {
        S.draft.pictures[S.draft.picturesAsk] = "auto";
        S.draft.picturesAsk = null;
        this.render();
        return;
      }
      if (action === "draft-pictures-no") {
        S.draft.picturesAsk = null;
        this.render();
        return;
      }
      if (action === "rack-back") {
        return rackBack();
      }
      if (action === "clothes-ok") {
        return clothesSave();
      }
      if (action === "clothes-no") {
        return clothesCancel();
      }
      if (action === "load-open") {
        S.titleTab = "load";
        S.loadOpening = true;
        this.render();
        return;
      }
      if (action === "load-close") {
        return this.closeLoad();
      }
      if (action === "changelog-open") {
        S.changelogOpen = true;
        this.render();
        return;
      }
      if (action === "firstday-go") {
        return firstDayDone();
      }
      if (action === "firstday-jobs") {
        return firstDayDone("jobs");
      }
      if (action === "firstday-guide") {
        return firstDayDone("guide");
      }
      if (action === "welcome-tick") {
        S.welcomeTicked = !S.welcomeTicked;
        this.render();
        return;
      }
      if (action === "welcome-go") {
        if (S.welcomeTicked) {
          acceptWelcome();
        }
        return;
      }
      if (action === "changelog-close") {
        if (ev.target !== target && target.tagName !== "BUTTON") {
          return;
        }
        S.changelogOpen = false;
        if (S.changelogList?.[0]) {
          markChangelogSeen(S.changelogList[0].version);
        }
        this.render();
        return;
      }
      if (action === "you-tab") {
        S.youTab = target.dataset.tab;
        this.render();
        return;
      }
      if (action === "sheet-tab") {
        S.sheetTab = target.dataset.tab;
        this.render();
        return;
      }
      if (action === "you-ledger") {
        S.youLedgerAll = !S.youLedgerAll;
        this.render();
        return;
      }
      if (action === "pick-start") {
        S.picking = new Set();
        this.render();
        return;
      }
      if (action === "pick-cancel") {
        S.picking = null;
        this.render();
        return;
      }
      if (action === "pick-all") {
        S.picking = S.picking?.size === S.lives.length ? new Set() : new Set(S.lives.map((life) => life.id));
        this.render();
        return;
      }
      if (action === "pick-life") {
        if (S.picking.has(id)) {
          S.picking.delete(id);
        } else {
          S.picking.add(id);
        }
        this.render();
        return;
      }
      if (action === "delete-picked") {
        const picked = [...(S.picking ?? [])];
        if (!picked.length) {
          return;
        }
        const list = S.lives.filter((life) => picked.includes(life.id)).map((life) => `\xB7 ${life.name}`).join(`
`),
          typed = prompt(`These ${picked.length} lives will be deleted, and it cannot be undone:

${list}

Type ${picked.length} to delete them.`);
        if (typed && typed.trim() === String(picked.length)) {
          deletePicked(picked);
        } else if (typed !== null) {
          alert("That was not the number, so nothing was deleted.");
        }
        return;
      }
      if (action === "card-next") {
        return cardNext();
      }
      if (action === "phone") {
        return openPhone();
      }
      if (action === "phone-close") {
        return closePhone();
      }
      if (action === "phone-close-outside") {
        if (ev.target === target) {
          closePhone();
        }
        return;
      }
      if (action === "settings") {
        return openSettings();
      }
      if (action === "look-save") {
        return lookSave();
      }
      if (action === "settings-tab") {
        return settingsTab(id);
      }
      if (action === "world-lore-pull") {
        return saveSetting("worldLore", S.life?.worldLore?.lorebookId ?? "");
      }
      if (action === "pair-edit") {
        return pairEdit(id, target.dataset.other);
      }
      if (action === "pair-save") {
        return pairSave();
      }
      if (action === "pair-remove") {
        return pairRemove();
      }
      if (action === "pair-cancel") {
        return pairCancel();
      }
      if (action === "news") {
        return openNews(false);
      }
      if (action === "jobs") {
        return openJobs();
      }
      if (action === "bills") {
        return openBills();
      }
      if (action === "bill-less") {
        return billNudge(id, "less");
      }
      if (action === "bill-more") {
        return billNudge(id, "more");
      }
      if (action === "bill-all") {
        return billNudge(id, "all");
      }
      if (action === "bill-pay") {
        return billPay(id);
      }
      if (action === "homes") {
        return openHomes();
      }
      if (action === "homes-move") {
        return homesMove(id, target.dataset.how ?? "rent");
      }
      if (action === "homes-stay") {
        return homesStay(id);
      }
      if (action === "couch-go") {
        return couchGo(character);
      }
      if (action === "evict-next") {
        return evictNext();
      }
      if (action === "evict-park") {
        return evictPark();
      }
      if (action === "notice-ok") {
        S.notice = null;
        notify();
        return;
      }
      if (action === "keys-ok") {
        S.keys = null;
        S.said = "";
        if (S.life?.at === "home") {
          S.view = "place";
        }
        notify();
        return;
      }
      if (action === "jobs-tab") {
        S.jobs.tab = id;
        S.jobs.said = "";
        this.render();
        return;
      }
      if (action === "jobs-dayoff-open") {
        S.jobs.dayOffOpen = !S.jobs.dayOffOpen;
        this.render();
        return;
      }
      if (action === "jobs-dayoff") {
        return askDayOff(id);
      }
      if (action === "jobs-quit") {
        return quitAsk();
      }
      if (action === "jobs-quit-yes") {
        ev.stopPropagation();
        return quitYes();
      }
      if (action === "career-answer") {
        ev.stopPropagation();
        return answerInterview(id);
      }
      if (action === "career-moment") {
        ev.stopPropagation();
        return pickMoment(target.dataset.index, id);
      }
      if (action === "career-stay") {
        ev.stopPropagation();
        return stayLate();
      }
      if (action === "career-close") {
        return closeJobCard();
      }
      if (action === "news-pick") {
        return newsPick(id);
      }
      if (action === "news-ok") {
        return newsOk();
      }
      if (action === "news-met") {
        return newsMet();
      }
      if (action === "news-all") {
        return newsAll();
      }
      if (action === "page") {
        setPage(id, target.dataset.page);
        this.render();
        return;
      }
      if (action === "ip-focus") {
        return ipFocus(id);
      }
      if (action === "ip-default") {
        return ipShowDefault(id);
      }
      if (action === "ip-reset") {
        return ipReset(id);
      }
      if (action === "ip-discard") {
        return ipDiscard();
      }
      if (action === "ip-save") {
        return ipSave();
      }
      if (action === "ip-reset-all") {
        return ipResetAll();
      }
      if (action === "ip-try") {
        return ipTry(id);
      }
      if (action === "gallery") {
        return openGallery();
      }
      if (action === "mod-app") {
        S.phone = false;
        S.view = "modapp";
        S.modApp = id;
        S.modWho = "all";
        this.render();
        return;
      }
      if (action === "mod-app-who") {
        S.modWho = id;
        this.render();
        return;
      }
      if (action === "mod-go") {
        ev.stopPropagation();
        return modScene(target.dataset.route, JSON.parse(target.dataset.body || "{}"));
      }
      if (action === "mod-later") {
        ev.stopPropagation();
        return modCall(target.dataset.route, JSON.parse(target.dataset.body || "{}"));
      }
      if (action === "gallery-who") {
        return galleryWho(id);
      }
      if (action === "album-open") {
        return albumOpen(id);
      }
      if (action === "album-close") {
        if (ev.target === target || target.tagName === "BUTTON") {
          albumClose();
        }
        return;
      }
      if (action === "album-redo") {
        return albumRedo(id);
      }
      if (action === "album-pick") {
        return albumPick(id, target.dataset.version);
      }
      if (action === "figure-edit") {
        S.figureEdit = true;
        this.render();
        return;
      }
      if (action === "figure-cancel") {
        S.figureEdit = false;
        this.render();
        return;
      }
      if (action === "figure-save") {
        const field = (key) => this.querySelector(`[data-figure=${key}]`)?.value ?? "";
        return figureSave({
          sex: field("sex"),
          body: field("body"),
          outfit: field("outfit"),
        });
      }
      if (action === "scene-hide") {
        S.sceneHide = !S.sceneHide;
        this.render();
        return;
      }
      if (action === "debug-scope") {
        return debugScope(id);
      }
      if (action === "debug-refresh") {
        return loadCalls();
      }
      if (action === "debug-open") {
        return debugOpen(id);
      }
      if (action === "debug-copy") {
        return debugCopy(id, target.dataset.side);
      }
      if (action === "cast-away") {
        S.settingsBox = {
          ask: character,
        };
        this.render();
        return;
      }
      if (action === "cast-away-no") {
        if (ev.target === target || target.tagName === "BUTTON") {
          S.settingsBox = {};
          this.render();
        }
        return;
      }
      if (action === "cast-away-yes") {
        return castAway(character, true);
      }
      if (action === "cast-back") {
        return castAway(character, false);
      }
      if (action === "cast-refresh") {
        return castRefresh(character);
      }
      if (action === "cast-rename") {
        S.settingsBox = {
          rename: character,
        };
        this.render();
        this.querySelector(`[data-rename-text="${character}"]`)?.focus();
        return;
      }
      if (action === "cast-rename-cancel") {
        S.settingsBox = {};
        this.render();
        return;
      }
      if (action === "cast-rename-save") {
        return castRename(character, this.querySelector(`[data-rename-text="${character}"]`)?.value ?? "");
      }
      if (action === "trait-flag") {
        return traitSet(target.dataset.trait);
      }
      if (action === "traits-open") {
        return traitsOpen(character);
      }
      if (action === "traits-close") {
        S.settingsBox = {};
        this.render();
        return;
      }
      if (action === "traits-save") {
        return traitsSave();
      }
      if (action === "spoil-yes") {
        const warn = S.settingsBox.warn;
        return warn ? saveRule(warn.key, warn.value, "spoilers") : undefined;
      }
      if (action === "sampling-reset") {
        return saveSetting("sampling", null);
      }
      if (action === "spoil-no") {
        S.settingsBox = {};
        this.render();
        return;
      }
      if (action === "adding-open") {
        return openAdding();
      }
      if (action === "adding-cancel") {
        return closeAdding();
      }
      if (action === "adding-done") {
        return addPeople();
      }
      if (
        S.draft?.adding &&
        (action === "picker-close" || (action === "picker-close-outside" && ev.target === target))
      ) {
        return addingPicked();
      }
      if (action === "motion") {
        setMotionMode(id);
        this.render();
        return;
      }
      if (action === "look-redo") {
        return lookRedo(target.dataset.key);
      }
      if (action === "look-redo-all") {
        return lookRedo(null, true);
      }
      if (action === "look-paint-missing") {
        return lookPaintMissing();
      }
      if (action === "look-pick") {
        return lookPick(target.dataset.key, Number(target.dataset.version));
      }
      if (action === "look-pause") {
        return lookPause(target.dataset.on === "1");
      }
      if (action === "painting-go") {
        return paintingGo();
      }
      if (action === "faint-next") {
        return faintNext();
      }
      if (action === "faint-done") {
        return faintDone();
      }
      if (action === "enter") {
        return enterPlace();
      }
      if (action === "map") {
        return S.life?.visit ? visitOut("map") : backToMapFromAnywhere();
      }
      if (action === "wake") {
        return wakeUp(character);
      }
      if (action === "knock") {
        return knockDoor(character);
      }
      if (action === "visit-in") {
        return visitIn();
      }
      if (action === "visit-out") {
        return visitOut();
      }
      if (action === "guest-bye") {
        return seeGuestOut();
      }
      if (action === "together") {
        return doTogether(character, id);
      }
      if (action === "stay") {
        return openSleep(character);
      }
      if (action === "sleep-pick") {
        return sleepPick(Number(target.dataset.minutes));
      }
      if (action === "sleep-close") {
        return sleepClose();
      }
      if (action === "sleep-go") {
        return sleepGo();
      }
      if (action === "open") {
        return openLife(id);
      }
      if (action === "old-save-go") {
        return openLife(id, {
          anyway: true,
        });
      }
      if (action === "old-save-back") {
        S.oldSave = null;
        this.render();
        return;
      }
      if (action === "go") {
        return goTo(place);
      }
      if (action === "town-open") {
        S.town = true;
        S.said = "";
        this.render();
        return;
      }
      if (action === "town-close") {
        S.town = false;
        this.render();
        return;
      }
      if (action === "district") {
        return goTo(`street:${target.dataset.district}`);
      }
      if (action === "activity") {
        const opens = S.life?.activities?.find((act2) => act2.id === activity)?.opens;
        if (opens === "shop") {
          return openShop("store");
        }
        if (opens === "rack") {
          return openRack();
        }
        if (opens === "interview") {
          return openInterview();
        }
        if (opens === "bag") {
          return openBackpack();
        }
        if (opens === "back") {
          return doActivity(activity);
        }
        if (S.life?.activities?.find((act2) => act2.id === activity)?.pick) {
          return openSleep(null, activity);
        }
        const activityDef = S.life?.activities?.find((act2) => act2.id === activity);
        return activityDef?.route ? modScene(activityDef.route, activityDef.body ?? {}) : doActivity(activity);
      }
      if (action === "pick-person") {
        return pickPerson(character);
      }
      if (action === "scene-start") {
        return startScene(
          character,
          target.dataset.kind || "intro",
          target.dataset.id || null,
          null,
          target.dataset.with || null,
          target.dataset.how || null,
        );
      }
      if (action === "propose-open") {
        S.talk[character] = {
          special: true,
          propose: true,
        };
        this.render();
        return;
      }
      if (action === "propose-how") {
        S.talk[character] = {
          ...(S.talk[character] ?? {}),
          special: true,
          propose: true,
          how: id,
        };
        this.render();
        return;
      }
      if (action === "propose-tonight") {
        ev.stopPropagation();
        return proposeTonight(target.dataset.choice);
      }
      if (action === "wedding-day") {
        ev.stopPropagation();
        return openWeddingDay();
      }
      if (action === "wedding-day-pick") {
        S.weddingDay = {
          ...(S.weddingDay ?? {}),
          pick: Number(id),
        };
        this.render();
        return;
      }
      if (action === "wedding-day-set") {
        return setWeddingDay();
      }
      if (action === "wedding") {
        return openWedding();
      }
      if (action === "wedding-tab") {
        S.weddingTab = id;
        this.render();
        return;
      }
      if (action === "wedding-choose") {
        return weddingChoose(target.dataset.what, id || null);
      }
      if (action === "wedding-invite") {
        return weddingInvite(character, target.dataset.on === "1");
      }
      if (action === "wedding-send") {
        return weddingSend();
      }
      if (action === "special-open-ask") {
        S.talk[character] = {
          special: true,
          pickOpen: true,
        };
        this.render();
        return;
      }
      if (action === "special-module") {
        S.talk[character] = {
          special: true,
          pickModule: id,
        };
        this.render();
        return;
      }
      if (action === "out-where") {
        S.outWhere = id || null;
        this.render();
        return;
      }
      if (action === "module-who") {
        modWho(S.talk[character], id);
        this.render();
        return;
      }
      if (action === "module-who-next" || action === "module-who-back") {
        S.talk[character].modStep = action === "module-who-next" ? "where" : "who";
        this.render();
        return;
      }
      if (action === "module-character" && target.dataset.ask && S.sheet) {
        S.sheet.modAsk = `${target.dataset.module}.${id}`;
        this.render();
        return;
      }
      if (action === "module-character") {
        return moduleCharacter(target.dataset.module, id, target.dataset.on === "1");
      }
      if (action === "module-ask-cancel" && S.sheet) {
        S.sheet.modAsk = null;
        this.render();
        return;
      }
      if (action === "module-cast-open") {
        modCastToggle(id);
        this.render();
        return;
      }
      if (action === "module-sheet-untag") {
        const current =
          (S.sheet?.modules ?? []).find((opt) => opt.module === target.dataset.module && opt.key === id)?.items ?? [];
        return moduleCharacter(
          target.dataset.module,
          id,
          current.filter((_, index) => index !== Number(target.dataset.tag)),
        );
      }
      if (action === "module-cast-remove") {
        const [moduleId, characterId, key] = id.split("|");
        return moduleCast(moduleId, characterId, key, null);
      }
      if (action === "module-fold") {
        modFold(id, target.dataset.on === "1");
        this.render();
        return;
      }
      if (action === "special-marry-ask") {
        S.talk[character] = {
          special: true,
          pickMarry: true,
        };
        this.render();
        return;
      }
      if (action === "special-open") {
        S.talk[character] = {
          special: true,
        };
        S.error = "";
        this.render();
        return;
      }
      if (action === "special-close") {
        delete S.talk[character];
        this.render();
        return;
      }
      if (action === "special-break") {
        S.talk[character] = {
          special: true,
          confirm: true,
        };
        this.render();
        return;
      }
      if (action === "special-cancel") {
        S.talk[character] = {
          special: true,
        };
        this.render();
        return;
      }
      if (action === "invite-open") {
        return inviteOpen(character);
      }
      if (action === "invite-back") {
        return inviteBack(character);
      }
      if (action === "invite-kind") {
        S.invite.kind = id;
        if (id === "date" && S.invite.info.places.find((place2) => place2.id === S.invite.place)?.hangOnly) {
          S.invite.place = null;
        }
        this.render();
        return;
      }
      if (action === "invite-place") {
        S.invite.place = id;
        S.invite.hour = null;
        const place2 = S.invite.info.places.find((candidatePlace) => candidatePlace.id === id),
          dayIndex = S.invite.info.days.findIndex((day) => day.d === S.invite.day);
        if (!place2.hours[dayIndex]?.length) {
          const dayWithHours = place2.hours.findIndex((hours2) => hours2.length);
          if (dayWithHours >= 0) {
            S.invite.day = S.invite.info.days[dayWithHours].d;
          }
        }
        this.render();
        return;
      }
      if (action === "invite-day") {
        S.invite.day = Number(id);
        S.invite.hour = null;
        this.render();
        return;
      }
      if (action === "invite-hour") {
        S.invite.hour = Number(id);
        this.render();
        return;
      }
      if (action === "invite-ask") {
        return inviteAsk(character);
      }
      if (action === "invite-pickup") {
        S.invite.pickUp = id === "1";
        this.render();
        return;
      }
      if (action === "special-introduce") {
        S.talk[character] = {
          ...(S.talk[character] ?? {}),
          special: true,
          pickIntro: true,
        };
        this.render();
        return;
      }
      if (action === "introduce") {
        return introduceMe(character, target.dataset.with);
      }
      if (action === "debt-pay") {
        return payBack(character);
      }
      if (action === "key-in") {
        return keyIn(character);
      }
      if (action === "invite-with") {
        const invited = new Set(S.invite?.with ?? []);
        if (invited.has(id)) {
          invited.delete(id);
        } else {
          invited.add(id);
        }
        S.invite.with = [...invited];
        this.render();
        return;
      }
      if (action === "invite-counter") {
        return inviteCounter(character, id === "1");
      }
      if (action === "invite-again") {
        S.invite.answer = null;
        S.invite.hour = null;
        this.render();
        return;
      }
      if (action === "plan-cancel-ask") {
        S.talk[character] = {
          special: true,
          cancelPlan: true,
        };
        this.render();
        return;
      }
      if (action === "plan-cancel") {
        return planCancel(id);
      }
      if (action === "sheet-cancel") {
        S.sheetCancel = id;
        this.render();
        return;
      }
      if (action === "sheet-cancel-no") {
        S.sheetCancel = null;
        this.render();
        return;
      }
      if (action === "plan-wait") {
        return planWait(id);
      }
      if (action === "outing-start") {
        return outingStart(id);
      }
      if (action === "out-next") {
        if (
          ev.target.closest("input, .mls-turn, .mls-summary, .mls-decide, button") ||
          outingHeld(S.life?.outing, S.outSeg ?? 0)
        ) {
          return;
        }
        S.outSeg = (S.outSeg ?? 0) + 1;
        this.render();
        return;
      }
      if (action === "out-say") {
        return outingPost(
          "say",
          {
            text: target.dataset.text ?? "",
          },
          {
            lines: true,
            loading: "They are answering\u2026",
          },
        );
      }
      if (action === "out-say-send") {
        const text = this.querySelector("[data-do=out-say-free]")?.value?.trim();
        return text
          ? outingPost(
              "say",
              {
                text: text,
              },
              {
                lines: true,
                loading: "They are answering\u2026",
              },
            )
          : undefined;
      }
      if (action === "out-act") {
        return outingPost(
          "act",
          {
            option: id,
          },
          {
            lines: true,
            loading: "They are answering\u2026",
          },
        );
      }
      if (action === "out-send") {
        const text = this.querySelector("[data-do=out-free]")?.value?.trim();
        return text
          ? outingPost(
              "act",
              {
                text: text,
              },
              {
                lines: true,
                loading: "They are answering\u2026",
              },
            )
          : undefined;
      }
      if (action === "out-interrupt") {
        return outingPost(
          "interrupt",
          {
            choice: id,
          },
          {
            lines: true,
            loading: "They are answering\u2026",
          },
        );
      }
      if (action === "out-end") {
        return outingPost(
          "end",
          {},
          {
            lines: true,
            loading: "Saying goodbye\u2026",
          },
        );
      }
      if (action === "out-bye") {
        return outingPost(
          "goodbye",
          {
            choice: id,
          },
          {
            lines: true,
            loading: "Saying goodbye\u2026",
          },
        );
      }
      if (action === "out-night") {
        return outingNight(id);
      }
      if (action === "out-close") {
        return outingClose();
      }
      if (action === "stuck-again") {
        return S.stuck?.again();
      }
      if (action === "stuck-skip") {
        return S.stuck?.skip();
      }
      if (action === "scene-invite-again") {
        const characterId = S.life.scene?.characterId,
          inviteAgain = S.life.scene?.milestone?.inviteAgain;
        return sceneCloseOnly().then(() => (inviteAgain && characterId ? inviteOpen(characterId, inviteAgain) : null));
      }
      if (action === "contacts") {
        S.phone = false;
        return openContacts(null, {
          wide: !this.isNarrow(),
        });
      }
      if (action === "you") {
        S.phone = false;
        return openYou();
      }
      if (action === "guide") {
        return openGuide(target.dataset.article ?? null);
      }
      if (action === "guide-open") {
        const article = target.dataset.article,
          inPage = !!target.closest(".page"),
          getSettings = () => this.querySelector(":scope > .mls-settings");
        if (
          (inPage && S.guideAt && S.guideAt !== article
            ? (S.guideBack = [...(S.guideBack ?? []), S.guideAt])
            : inPage || (S.guideBack = []),
          this._narrow && !inPage && (S.guideListTop = getSettings()?.scrollTop ?? 0),
          (S.guideAt = article),
          this.render(),
          inPage || this._narrow)
        ) {
          const settingsEl = getSettings();
          if (settingsEl) {
            settingsEl.scrollTop = 0;
          }
        }
        return;
      }
      if (action === "guide-back") {
        S.guideAt = (S.guideBack ?? []).pop() ?? null;
        this.render();
        return;
      }
      if (action === "guide-index") {
        S.guideAt = null;
        S.guideBack = [];
        this.render();
        const settingsEl = this.querySelector(":scope > .mls-settings");
        if (settingsEl) {
          settingsEl.scrollTop = S.guideListTop ?? 0;
        }
        return;
      }
      if (action === "backpack") {
        return openBackpack();
      }
      if (action === "bag-close") {
        if (ev.target === target || target.classList.contains("x")) {
          closeBackpack();
        }
        return;
      }
      if (action === "home-panel") {
        if (!id) {
          S.hp = null;
        }
        return id === "cook" ? openKitchen() : id === "party" ? openHouseParty() : openHomePanel(id);
      }
      if (action === "kitchen-pick") {
        if (S.cooking) {
          return;
        }
        S.kitchenPick = id;
        S.cooked = null;
        this.render();
        return;
      }
      if (action === "kitchen-back") {
        return kitchenBack();
      }
      if (action === "out-kitchen") {
        return openKitchenFor();
      }
      if (action === "cook-for") {
        return S.kitchenFor?.with ? cookTogether(id) : cookForThem(id);
      }
      if (action === "together-kitchen") {
        return openKitchenWith(character);
      }
      if (action === "cook-pop") {
        return cookPopTap();
      }
      if (action === "furniture-shop") {
        S.homePanel = null;
        return openShop("online").then(() => {
          S.shopTab = "furniture";
          notify();
        });
      }
      if (action === "ask-n") {
        return askCount(id);
      }
      if (action === "ask-no") {
        if (ev.target === target || target.tagName === "BUTTON") {
          askNo();
        }
        return;
      }
      if (action === "ask-ok") {
        return askYes();
      }
      if (action === "shop") {
        return openShop("online");
      }
      if (action === "shop-tab") {
        S.shopTab = id;
        this.render();
        return;
      }
      if (action === "shop-back") {
        return shopBack();
      }
      if (action === "cart-add") {
        return cartAdd(id);
      }
      if (action === "cart-dec") {
        return cartDec(id);
      }
      if (action === "cart-toggle") {
        S.shopCartOpen = !S.shopCartOpen;
        this.render();
        return;
      }
      if (action === "shop-pay") {
        return shopPay();
      }
      if (action === "thing-pick") {
        const pick = {
          list: target.dataset.list,
          index: Number(target.dataset.index),
        };
        S.thingPick = S.thingPick?.list === pick.list && S.thingPick.index === pick.index ? null : pick;
        this.render();
        return;
      }
      if (action === "thing") {
        const { act: thingAct, list: list } = target.dataset,
          index = Number(target.dataset.index);
        return thingAct === "throw"
          ? askThing("throw", list, index)
          : thingAct === "move" && (pileAt(list, index)?.n ?? 1) > 1
            ? askThing("move", list, index, list === "bag" ? pileAt(list, index).home : "bag")
            : thingDo({
                action: thingAct,
                list: list,
                index: index,
              });
      }
      if (action === "cook") {
        return thingDo({
          action: "cook",
          recipe: id,
        });
      }
      if (action === "thing-eat") {
        return thingDo({
          action: "eat",
          list: target.dataset.list,
          index: Number(target.dataset.index),
        });
      }
      if (action === "cooked-pack") {
        return thingDo(
          {
            action: "move",
            list: "fridge",
            index: Number(target.dataset.index),
            n: 1,
          },
          {
            cooked: true,
            zone: "bag",
          },
        );
      }
      if (action === "cooked-done") {
        S.cooked = null;
        this.render();
        return;
      }
      if (action === "wear") {
        return thingDo({
          action: "wear",
          item: id,
        });
      }
      if (action === "sheet") {
        return S.view === "contacts" && S.contactsMode === "chart"
          ? ((S.contactsMode = "list"), (S.chartFocus = null), openSheet(character))
          : S.view === "contacts"
            ? openSheet(character)
            : openContacts(character);
      }
      if (action === "contacts-chart") {
        return openChart();
      }
      if (action === "chart-focus") {
        S.chartFocus = character;
        this.render();
        return;
      }
      if (action === "contacts-listmode") {
        S.contactsMode = "list";
        this.render();
        return;
      }
      if (action === "chart-link") {
        S.chartSaid = target.dataset.said ?? "";
        const saidEl = this.querySelector("#mls-chart-said");
        if (saidEl) {
          saidEl.textContent = S.chartSaid;
        } else {
          this.render();
        }
        return;
      }
      if (action === "contacts-list") {
        S.sheet = null;
        this.render();
        return;
      }
      if (action === "just-friends") {
        return setJustFriends(target.dataset.on === "1");
      }
      if (action === "face-edit") {
        return faceEditOpen();
      }
      if (action === "crop-save") {
        return cropSave();
      }
      if (action === "crop-cancel") {
        return cropClose();
      }
      if (action === "face-save") {
        return faceEditSave();
      }
      if (action === "face-cancel") {
        return faceEditCancel();
      }
      if (action === "face-reset") {
        return faceEditReset();
      }
      if (action === "mem-edit") {
        S.memEdit = target.dataset.memory;
        S.memAdd = false;
        this.render();
        this.querySelector("[data-do=mem-text]")?.focus();
        return;
      }
      if (action === "mem-add-open") {
        S.memAdd = true;
        S.memEdit = null;
        this.render();
        this.querySelector("[data-do=mem-new]")?.focus();
        return;
      }
      if (action === "mem-cancel") {
        S.memEdit = null;
        S.memAdd = false;
        this.render();
        return;
      }
      if (action === "mem-with") {
        S.memWith = target.dataset.id || null;
        S.memEdit = null;
        S.memAdd = false;
        this.render();
        return;
      }
      if (action === "mem-add") {
        return changeMemory({
          action: "add",
          text: this.querySelector("[data-do=mem-new]")?.value ?? "",
        });
      }
      if (action === "mem") {
        const change = {
          action: target.dataset.action,
          memory: target.dataset.memory,
        };
        if (change.action === "edit") {
          change.text = this.querySelector("[data-do=mem-text]")?.value ?? "";
        }
        return change.action === "delete" && !confirm("Delete this memory? They will not remember it any more.")
          ? undefined
          : changeMemory(change);
      }
      if (action === "scene-auto") {
        ev.stopPropagation();
        return sceneAuto();
      }
      if (action === "scene-decide") {
        ev.stopPropagation();
        return sceneDecide(target.dataset.choice);
      }
      if (action === "door-open" || action === "door-shut") {
        ev.stopPropagation();
        return answerDoor(action === "door-open");
      }
      if (action === "work-edit") {
        S.workEdit = target.dataset.character;
        this.render();
        return;
      }
      if (action === "work-cancel") {
        S.workEdit = null;
        this.render();
        return;
      }
      if (action === "work-save") {
        return saveWorkOutfit(
          target.dataset.character,
          this.querySelector(`[data-work-text="${target.dataset.character}"]`)?.value ?? "",
        );
      }
      if (action === "work-redo") {
        return redoWorkSprite(target.dataset.character);
      }
      if (action === "season-edit") {
        S.seasonEdit = {
          id: target.dataset.character,
          i: Number(target.dataset.season),
        };
        this.render();
        return;
      }
      if (action === "season-cancel") {
        S.seasonEdit = null;
        this.render();
        return;
      }
      if (action === "season-save") {
        return saveSeasonOutfit(
          target.dataset.character,
          Number(target.dataset.season),
          this.querySelector(`[data-season-text="${target.dataset.character}"]`)?.value ?? "",
        );
      }
      if (action === "season-redo") {
        return redoSeasonPicture(target.dataset.character, Number(target.dataset.season));
      }
      if (action === "frame-set") {
        return setFrame(target.dataset.to);
      }
      if (action === "size-set") {
        return setPictureSize(target.dataset.to);
      }
      if (action === "portrait-set") {
        return setPortraitSize(target.dataset.to);
      }
      if (action === "scene-undetect") {
        ev.stopPropagation();
        return sceneUndetect();
      }
      if (action === "plea-pay") {
        ev.stopPropagation();
        return pleaAnswer("pay");
      }
      if (action === "ride-drive") {
        ev.stopPropagation();
        return rideAnswer("drive");
      }
      if (action === "ride-no") {
        ev.stopPropagation();
        return rideAnswer("no");
      }
      if (action === "walk-in") {
        ev.stopPropagation();
        return walkInAnswer(target.dataset.choice);
      }
      if (action === "bday-message") {
        return birthdayMessage(target.dataset.character);
      }
      if (action === "your-gender") {
        return setYourGender(id);
      }
      if (action === "hp-kind") {
        return openHouseParty({
          birthday: id === "birthday",
          with: S.hp?.with ?? [],
          words: !!S.hp?.words,
          food: S.hp?.food ?? "snacks",
        });
      }
      if (action === "hp-day") {
        S.hp.day = Number(id);
        const from = S.hp.info.days.find((day) => day.d === S.hp.day)?.from ?? 0;
        if (S.hp.hour < from) {
          S.hp.hour = from;
          if (S.hp.until <= S.hp.hour) {
            S.hp.until = Math.min(S.hp.hour + 3, S.hp.info.until.at(-1));
          }
        }
        this.render();
        return;
      }
      if (action === "hp-hour") {
        S.hp.hour = Number(id);
        if (S.hp.until <= S.hp.hour) {
          S.hp.until = Math.min(S.hp.hour + 3, S.hp.info.until.at(-1));
        }
        this.render();
        return;
      }
      if (action === "hp-until") {
        S.hp.until = Number(id);
        this.render();
        return;
      }
      if (action === "hp-with") {
        const guests = S.hp.with;
        S.hp.with = guests.includes(id)
          ? guests.filter((id2) => id2 !== id)
          : guests.length < S.hp.info.max
            ? [...guests, id]
            : guests;
        this.render();
        return;
      }
      if (action === "hp-food") {
        S.hp.food = id;
        this.render();
        return;
      }
      if (action === "hp-send") {
        return hpSend();
      }
      if (action === "hp-close") {
        S.hp = null;
        S.homePanel = null;
        this.render();
        return;
      }
      if (action === "party-start") {
        return partyStep("start");
      }
      if (action === "party-join") {
        return partyStep("join", {
          party: id,
        });
      }
      if (action === "party-letin") {
        return partyStep("letin");
      }
      if (action === "party-wait") {
        return partyStep("wait");
      }
      if (action === "party-go") {
        return partyStep("go", {
          room: id,
        });
      }
      if (action === "party-do") {
        return partyStep("do", {
          key: id,
        });
      }
      if (action === "party-door") {
        const door = S.life?.party?.door0 ?? S.life?.party?.bye;
        return door ? approachScene(door) : undefined;
      }
      if (action === "party-pick") {
        S.partyPick = S.partyPick === id ? null : id;
        S.partyWith = null;
        S.partyAlso = [];
        this.render();
        return;
      }
      if (action === "party-with") {
        return partyStep("do", {
          key: id,
          with: character || null,
        });
      }
      if (action === "party-mod-with") {
        S.partyWith = character;
        S.partyAlso = [];
        this.render();
        return;
      }
      if (action === "party-mod-also") {
        const also = S.partyAlso ?? [];
        S.partyAlso = also.includes(character) ? also.filter((id2) => id2 !== character) : [...also, character];
        this.render();
        return;
      }
      if (action === "party-mod-go") {
        return partyStep("do", {
          key: id,
          with: S.partyWith,
          also: S.partyAlso ?? [],
        });
      }
      if (action === "party-introduce") {
        return partyStep("introduce", {
          a: id,
          b: character,
        });
      }
      if (action === "party-bring") {
        return partyStep("bring", {
          character: character,
        });
      }
      if (action === "party-end") {
        return partyStep("end");
      }
      if (action === "party-seen") {
        return partyStep("seen");
      }
      if (action === "party-cancel") {
        if (S.hpCancel) {
          S.hpCancel = false;
          return partyStep("cancel");
        }
        S.hpCancel = true;
        this.render();
        return;
      }
      if (action === "party-wait-theirs") {
        return partyStep("wait-theirs", {
          party: id,
        });
      }
      if (action === "hp-again") {
        S.hp.answer = null;
        this.render();
        return;
      }
      if (action === "party-neighbour") {
        return partyStep("neighbour", {
          answer: id,
        });
      }
      if (action === "vehicle-sell") {
        return vehicleSell(id);
      }
      if (action === "plea-no") {
        ev.stopPropagation();
        return pleaAnswer("refuse");
      }
      if (action === "plea-undo") {
        ev.stopPropagation();
        return pleaUndo();
      }
      if (action === "lent-ask") {
        return lentAsk(character);
      }
      if (action === "suits-ask") {
        return suitsAsk(character);
      }
      if (action === "scene-job") {
        ev.stopPropagation();
        return sceneJobChoose(id, {
          day: target.dataset.day ?? null,
          tone: target.dataset.tone ?? null,
        });
      }
      if (action === "scene-skip") {
        ev.stopPropagation();
        return sceneSkip();
      }
      if (action === "scene-log") {
        ev.stopPropagation();
        return sceneLogToggle();
      }
      if (action === "scene-end") {
        ev.stopPropagation();
        return sceneEnd();
      }
      if (action === "scene-close") {
        return sceneClose();
      }
      if (action === "scene-bonds") {
        S.sceneBonds = !S.sceneBonds;
        this.render();
        return;
      }
      if (action === "scene-say") {
        ev.stopPropagation();
        return sceneReply(S.life?.scene?.suggestions?.[Number(id)]);
      }
      if (action === "scene-send") {
        ev.stopPropagation();
        return sceneReply(this.querySelector("[data-do=scene-free]")?.value);
      }
      if (action === "scene-next") {
        return ev.target.closest("input, .mls-turn, .mls-summary, .controls, .mls-decide") ? undefined : sceneNext();
      }
      if (action === "talk-done") {
        return talkDone();
      }
      if (action === "gift-open") {
        return giftOpen(character);
      }
      if (action === "gift-close") {
        return giftClose(character);
      }
      if (action === "gift-pick") {
        return giftPick(character, Number(id));
      }
      if (action === "gift-give") {
        return giveGift(character);
      }
      if (action === "calendar") {
        return openCalendar(0);
      }
      if (action === "cal-season") {
        return openCalendar((S.cal?.offset ?? 0) + Number(id));
      }
      if (action === "cal-day") {
        S.calDay = Number(id);
        S.noteOpen = false;
        this.render();
        return;
      }
      if (action === "note-open") {
        S.noteOpen = true;
        this.render();
        this.querySelector("[data-note-text]")?.focus();
        return;
      }
      if (action === "note-cancel") {
        S.noteOpen = false;
        this.render();
        return;
      }
      if (action === "note-save") {
        const text = this.querySelector("[data-note-text]")?.value ?? "",
          hour = this.querySelector("[data-note-hour]")?.value ?? "";
        return calendarNote({
          action: "add",
          day: S.calDay,
          hour: hour === "" ? null : Number(hour),
          text: text,
        });
      }
      if (action === "note-del") {
        return calendarNote({
          action: "delete",
          id: id,
        });
      }
      if (action === "talk") {
        return talkTo(character, target.dataset.kind || "quickChat");
      }
      if (action === "new") {
        S.oldSave = null;
        return openCreate();
      }
      if (action === "to-cast") {
        return goToCastStep();
      }
      if (action === "to-week") {
        return goToWeekStep();
      }
      if (action === "back-to-form") {
        S.view = "create";
        this.render();
        return;
      }
      if (action === "back-to-cast") {
        S.view = "cast-review";
        this.render();
        return;
      }
      if (action === "read-all") {
        return readWholeCast();
      }
      if (action === "read-stop") {
        return stopReadingAll();
      }
      if (action === "read-failed") {
        return readFailedCast();
      }
      if (action === "bulk-romance" || action === "bulk-kink-add" || action === "bulk-kink-remove") {
        const kink = (this.querySelector('[data-do="bulk-kink"]')?.value ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 60);
        for (const entry of Object.values(S.draft?.cast ?? {})) {
          const adult = entry.on ? entry.modules?.adult : null;
          if (action === "bulk-romance" && entry.on) {
            entry.romanceable = true;
          } else if (adult && kink && adult.adult !== "no") {
            const kinks = adult.intimacy_kinks ?? [],
              has = kinks.some((one) => one.toLowerCase() === kink.toLowerCase());
            if (action === "bulk-kink-remove") {
              adult.intimacy_kinks = kinks.filter((one) => one.toLowerCase() !== kink.toLowerCase());
            } else if (!has && kinks.length < 24) {
              adult.intimacy_kinks = [...kinks, kink];
            }
          }
        }
        this.render();
        return;
      }
      if (action === "start") {
        return startLife();
      }
      if (action === "mod-on-yes") {
        return modOnAnswer(true);
      }
      if (action === "mod-on-no") {
        return modOnAnswer(false);
      }
      if (!this.onCreateClick(action, target, ev)) {
        if (action === "menu") {
          ev.stopPropagation();
          S.menuFor = S.menuFor === id ? null : id;
          this.render();
          const pop = this.querySelector(".mls-pop"),
            button = this.querySelector(`[data-do=menu][data-id="${id}"]`);
          if (pop && button) {
            const frame = (pop.offsetParent ?? this).getBoundingClientRect(),
              rect = button.getBoundingClientRect();
            pop.style.left = `${Math.max(8, Math.min(frame.width - pop.offsetWidth - 8, rect.right - frame.left - pop.offsetWidth))}px`;
            pop.style.top = `${rect.bottom - frame.top + 6}px`;
          }
          return;
        }
        if (action === "rename") {
          const life = S.lives.find((candidateLife) => candidateLife.id === id),
            newName = prompt("Rename this life", life?.name ?? "");
          if (newName && newName.trim()) {
            renameLife(id, newName.trim());
          }
          return;
        }
        if (action === "duplicate") {
          return duplicateLife(id);
        }
        if (action === "preset-life") {
          return presetFromLife(id);
        }
        if (action === "delete") {
          const life = S.lives.find((candidateLife) => candidateLife.id === id),
            typed = prompt(`This cannot be undone. Type the name to delete it:

${life?.name ?? id}`);
          if (typed && typed.trim() === (life?.name ?? "")) {
            deleteLife(id, typed.trim());
          } else if (typed !== null) {
            alert("The name did not match, so nothing was deleted.");
          }
          return;
        }
      }
    }
  }
  onWeekClick(action, id) {
    const draft = S.draft;
    if (!draft || !action.startsWith("week-")) {
      return false;
    }
    const castEntry = draft.cast[draft.weekFor];
    if (action === "week-who") {
      draft.weekFor = id;
      this.render();
      return true;
    }
    if (action === "week-day") {
      draft.weekDay = Number(id) || 0;
      this.render();
      return true;
    }
    if (action === "week-template") {
      useTemplate(draft.weekFor, id);
      return true;
    }
    if (action === "week-reread") {
      queueReads([id]);
      return true;
    }
    if (action === "week-cancel") {
      stopReading(id);
      return true;
    }
    if (!castEntry) {
      return true;
    }
    if (
      ((castEntry.grid =
        castEntry.grid ??
        Array.from(
          {
            length: 7,
          },
          () =>
            Array.from(
              {
                length: 24,
              },
              () => null,
            ),
        )),
      action === "week-clear-block")
    ) {
      clearBlock(castEntry.grid, draft.weekDay, Number(id));
    } else if (action === "week-add") {
      addBlock(castEntry.grid, draft.weekDay, "home");
    } else if (action === "week-copy") {
      copyDay(castEntry.grid, draft.weekDay, id);
    } else {
      return true;
    }
    castEntry.fromModel = false;
    this.render();
    return true;
  }
  onCreateClick(action, target, ev) {
    const draft = S.draft;
    if (!draft) {
      return false;
    }
    const id = target.dataset.id;
    if (this.onWeekClick(action, id)) {
      return true;
    }
    if (action === "peek" || action === "unpeek") {
      const group = target.dataset.what === "weeks" ? "weeks" : "archetypes";
      draft.peek = draft.peek ?? {
        archetypes: {},
        weeks: {},
      };
      draft.peek[group] = draft.peek[group] ?? {};
      if (action === "peek") {
        draft.peek[group][id] = true;
      } else {
        delete draft.peek[group][id];
      }
      this.render();
      return true;
    }
    if (action === "persona") {
      draft.personaId = id;
    } else if (action === "picker-open") {
      draft.pickerOpen = true;
      draft.pickerQuery = "";
      refreshResources();
    } else if (action === "picker-close") {
      draft.pickerOpen = false;
    } else if (action === "picker-group") {
      draft.pickerGroup = id || null;
    } else if (action === "picker-tag") {
      const tags = draft.pickerTags ?? [];
      draft.pickerTags = tags.includes(id) ? tags.filter((tag) => tag !== id) : [...tags, id];
    } else if (action === "picker-close-outside") {
      if (target !== ev?.target) {
        return true;
      }
      draft.pickerOpen = false;
    } else if (action === "cast-off") {
      delete draft.cast[id];
    } else if (action === "cast-kink-remove") {
      const adult = draft.cast[id]?.modules?.adult;
      if (adult) {
        adult.intimacy_kinks = (adult.intimacy_kinks ?? []).filter((_, index) => index !== Number(target.dataset.tag));
      }
    } else if (action === "tastes-edit") {
      draft.cast[id].tastesEdit = !draft.cast[id].tastesEdit;
    } else if (action === "traits-edit") {
      draft.cast[id].traitsEdit = !draft.cast[id].traitsEdit;
    } else {
      if (action === "cast-read") {
        queueReads([id]);
        return true;
      }
      if (action === "step") {
        const step = Number(id);
        if (!(!stepOpen(draft, S.resources, step) && step !== (Number(draft.step) || 0) + 1)) {
          draft.step = step;
          draft.reached = Math.max(draft.reached ?? 1, step);
          draft.askStart = false;
          this.render();
          saveDraftNow();
          this.querySelector(".mls-create main")?.scrollIntoView?.({
            block: "start",
          });
        }
        return true;
      } else if (action === "housemate") {
        const mates = matesOf(draft);
        draft.roommate = "";
        draft.housemates = mates.includes(id) ? mates.filter((mate) => mate !== id) : [...mates, id];
        draft.housemates = matesOf(draft);
      } else if (action === "start-ask") {
        draft.askStart = true;
      } else if (action === "resume-continue") {
        draft.askResume = false;
      } else {
        if (action === "resume-over") {
          startOver();
          return true;
        }
        if (action === "missing-ok") {
          draft.loadedMissing = null;
        } else {
          if (action === "presets-open") {
            presetsOpen();
            return true;
          }
          if (action === "presets-close") {
            presetsClose();
            return true;
          }
          if (action === "presets-close-outside") {
            if (target === ev?.target) {
              presetsClose();
            }
            return true;
          }
          if (action === "preset-save") {
            presetSave(false);
            return true;
          }
          if (action === "preset-replace-yes") {
            presetSave(true);
            return true;
          }
          if (action === "preset-replace-no") {
            if (S.presets) {
              S.presets.taken = null;
            }
          } else {
            if (action === "preset-load") {
              presetLoad(id);
              return true;
            }
            if (action === "preset-rename") {
              if (S.presets) {
                S.presets.rename = id;
                S.presets.renameText = S.presets.list?.find((preset) => preset.id === id)?.name ?? "";
                S.presets.del = null;
              }
            } else {
              if (action === "preset-rename-save") {
                presetRename(id);
                return true;
              }
              if (action === "preset-rename-no") {
                if (S.presets) {
                  S.presets.rename = null;
                }
              } else if (action === "preset-del") {
                if (S.presets) {
                  S.presets.del = id;
                  S.presets.rename = null;
                }
              } else {
                if (action === "preset-del-yes") {
                  presetDelete(id);
                  return true;
                }
                if (action === "preset-del-no") {
                  if (S.presets) {
                    S.presets.del = null;
                  }
                } else {
                  if (action === "preset-blank") {
                    presetBlank();
                    return true;
                  }
                  if (action === "start-no") {
                    if (target !== ev?.target && !target.matches("button")) {
                      return true;
                    }
                    draft.askStart = false;
                  } else if (action === "draft-frame") {
                    draft.frame = target.dataset.to === "cut" ? "cut" : "framed";
                  } else if (action === "draft-size") {
                    draft.size = {
                      ...sizeWH(target.dataset.to),
                    };
                  } else if (action === "draft-sampling-reset") {
                    draft.settings.sampling = {};
                  } else if (action === "draft-portrait") {
                    draft.portraitSize = {
                      ...sizeWH(target.dataset.to, PORTRAIT_SIZES, "2:3"),
                    };
                  } else {
                    if (action === "cast-cancel") {
                      stopReading(id);
                      return true;
                    }
                    if (action === "skill-up") {
                      draft.skills[id] = (draft.skills[id] ?? 0) + 1;
                    } else if (action === "skill-down") {
                      draft.skills[id] = Math.max(0, (draft.skills[id] ?? 0) - 1);
                    } else {
                      return false;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    this.render();
    return true;
  }
  logBefore() {
    const log = this.querySelector(".mls-scene-log");
    return log
      ? {
          top: log.scrollTop,
          rows: log.querySelectorAll(".row").length,
        }
      : null;
  }
  logAfter(before) {
    const log = this.querySelector(".mls-scene-log");
    if (!log) {
      return;
    }
    const rowCount = log.querySelectorAll(".row").length;
    log.scrollTop = !before || rowCount !== before.rows ? log.scrollHeight : before.top;
  }
  onCreateChange(ev) {
    const target = ev.target.closest("[data-do]"),
      draft = S.draft;
    if (!target || !draft) {
      return;
    }
    const { do: action, id: id } = target.dataset;
    if (action === "name") {
      draft.name = target.value;
    } else if (action === "home") {
      draft.housemates = matesOf(draft);
      draft.roommate = "";
      draft.home = target.value;
      draft.housemates = matesOf(draft);
      this.render();
      countLibrary();
      return;
    } else if (action === "lives-in" && target.value === "with-you") {
      draft.housemates = [...matesOf(draft).filter((mate) => mate !== id), id];
      draft.housemates = matesOf(draft);
      this.render();
      return;
    } else if (action === "lives-in") {
      draft.housemates = matesOf(draft).filter((mate) => mate !== id);
      draft.roommate = draft.roommate === id ? "" : draft.roommate;
      draft.cast[id] = {
        ...draft.cast[id],
        livesIn: target.value,
        livesBy: "you",
      };
      this.render();
      return;
    } else if (action === "knows") {
      draft.cast[id] = {
        ...draft.cast[id],
        knows: target.value,
        kin: target.value === "family" ? (draft.cast[id]?.kin ?? "relatives") : null,
      };
      this.render();
      return;
    } else if (action === "bulk-knows") {
      const mates = matesOf(draft);
      for (const [cardId, entry] of Object.entries(draft.cast)) {
        // Housemates are at least close: the casual levels skip them.
        if (entry.on && !(mates.includes(cardId) && ["no", "friendly", "friend"].includes(target.value))) {
          entry.knows = target.value;
          entry.kin = target.value === "family" ? (entry.kin ?? "relatives") : null;
        }
      }
      this.render();
      return;
    } else if (action === "kin") {
      draft.cast[id] = {
        ...draft.cast[id],
        kin: target.value,
      };
      return;
    } else if (action === "gender") {
      draft.gender = target.value;
      this.render();
      return;
    } else if (action === "cast-gender") {
      draft.cast[id] = {
        ...draft.cast[id],
        gender: target.value,
        genderBy: "you",
      };
      this.render();
      return;
    } else if (action === "cast-disposition" || action === "cast-kink-add") {
      const adult = draft.cast[id]?.modules?.adult;
      if (!adult) {
        return;
      }
      if (action === "cast-disposition") {
        adult.intimacy_disposition = target.value;
      } else {
        const text = target.value.replace(/\s+/g, " ").trim().slice(0, 60),
          kinks = adult.intimacy_kinks ?? [];
        if (text && kinks.length < 24 && !kinks.some((kink) => kink.toLowerCase() === text.toLowerCase())) {
          adult.intimacy_kinks = [...kinks, text];
        }
      }
      this.render();
      return;
    } else if (action === "cast-into") {
      const was = draft.cast[id]?.into ?? [],
        into = withFutanari(checkedInto(target), was);
      // Someone is always into someone: unticking the last chip just redraws it
      draft.cast[id] = into.length
        ? {
            ...draft.cast[id],
            into: into,
            intoBy: "you",
          }
        : draft.cast[id];
      this.render();
      return;
    } else if (action === "bday-season" || action === "bday-day") {
      const field = action === "bday-season" ? "season" : "day";
      if (!id) {
        draft.birthday = {
          ...(draft.birthday ?? {
            season: 0,
            day: 1,
          }),
          [field]: Number(target.value),
        };
        return;
      }
      const castEntry = draft.cast[id];
      draft.cast[id] = {
        ...castEntry,
        birthday: {
          ...(castEntry.birthday ?? rolledDay(id)),
          [field]: Number(target.value),
        },
        birthdayFrom: "you",
      };
      this.render();
      return;
    } else if (action === "job") {
      draft.cast[id] = {
        ...draft.cast[id],
        job: target.value,
        workOutfit: "",
      };
      this.render();
      return;
    } else if (action === "job-title") {
      draft.cast[id] = {
        ...draft.cast[id],
        jobTitle: target.value,
      };
      return;
    } else if (action === "taste") {
      const tastes = draft.cast[id].tastes ?? {
          loves: [],
          likes: [],
          dislikes: [],
        },
        { slot: slot, k: index } = target.dataset;
      for (const tier of ["loves", "likes", "dislikes"]) {
        tastes[tier] = (tastes[tier] ?? []).map((item) => (item === target.value ? "" : item));
      }
      tastes[slot][Number(index)] = target.value;
      for (const tier of ["loves", "likes", "dislikes"]) {
        tastes[tier] = tastes[tier].filter(Boolean);
      }
      draft.cast[id].tastes = tastes;
      this.render();
      return;
    } else if (action === "week-find") {
      draft.weekFind = target.value;
      this.render();
      const input = this.querySelector("[data-do=week-find]");
      input?.focus();
      input?.setSelectionRange(input.value.length, input.value.length);
      return;
    } else if (action === "savings") {
      draft.savings = target.value;
    } else if (action === "ubi") {
      draft.rules.ubi = Math.max(0, Math.min(100000, Math.floor(Number(target.value) || 0)));
    } else if (action === "season") {
      draft.season = target.value;
    } else if (action === "lore-book") {
      draft.loreBookId = target.value;
    } else if (action === "read-steer") {
      draft.readSteer = target.value;
      return;
    } else if (action === "scenario") {
      draft.scenario = target.value;
      const counter = this.querySelector("#mls-note .count");
      if (counter) {
        counter.textContent = `${draft.scenario.length} / 600`;
      }
      return;
    } else if (action === "picker-search") {
      draft.pickerQuery = target.value;
      this.renderPickerList();
      this.searchPicker(draft);
      return;
    } else if (action === "town-name") {
      draft.townName = target.value;
      return;
    } else if (action === "place-name") {
      draft.renamed = {
        ...(draft.renamed ?? {}),
        [id]: target.value,
      };
      return;
    } else if (action === "district-name") {
      draft.districtNames = {
        ...(draft.districtNames ?? {}),
        [id]: target.value,
      };
      return;
    } else if (action === "connection") {
      draft.settings.connection = target.value;
      this.render();
      return;
    } else if (action === "effort") {
      draft.settings.effort = target.value;
    } else if (action === "sample") {
      draft.settings.sampling = {
        ...(draft.settings.sampling ?? {}),
        [id]: target.value,
      };
      return;
    } else if (action === "language") {
      draft.settings.language = target.value;
      this.render();
      return;
    } else if (action === "language-other") {
      draft.languageOther = target.value;
      return;
    } else if (action === "show") {
      draft.show[id] = target.value;
      this.render();
      return;
    } else if (action.startsWith("week-")) {
      const castEntry = draft.cast[draft.weekFor];
      if (!castEntry?.grid) {
        return;
      }
      const blockIndex = Number(id),
        patch =
          action === "week-from"
            ? {
                from: Number(target.value),
              }
            : action === "week-to"
              ? {
                  to: Number(target.value),
                }
              : action === "week-place"
                ? {
                    place: target.value,
                  }
                : action === "week-sleep"
                  ? {
                      sleep: target.checked,
                    }
                  : {
                      doing: target.value,
                    };
      editBlock(castEntry.grid, draft.weekDay, blockIndex, patch);
      castEntry.fromModel = false;
      if (action === "week-doing") {
        this.renderWeekGridOnly();
      } else {
        this.render();
      }
      return;
    } else if (action === "rule") {
      draft.rules[id] = target.checked;
      modDraftNeeds(draft, S.resources?.modules);
    } else if (action === "module") {
      if (target.checked) {
        target.checked = false;
        S.modOn = {
          id: id,
          name: (S.resources?.modules ?? []).find((module) => module.id === id)?.name ?? "It",
          confirm: (S.resources?.modules ?? []).find((module) => module.id === id)?.confirm,
          where: "create",
        };
        this.render();
        return;
      }
      draft.modules = {
        ...(draft.modules ?? {}),
        [id]: {
          ...(draft.modules?.[id] ?? {}),
          on: false,
          confirmed: false,
        },
      };
    } else if (action === "module-opt") {
      const [moduleId, optKey] = id.split(".");
      draft.modules = {
        ...(draft.modules ?? {}),
        [moduleId]: {
          ...(draft.modules?.[moduleId] ?? {}),
          [optKey]: target.type === "checkbox" ? target.checked : target.value,
        },
      };
      const needsRule = (S.resources?.modules ?? [])
        .find((entry) => entry.id === moduleId)
        ?.options?.find((entry) => entry.key === optKey)?.needsRule;
      if (target.checked && needsRule) {
        draft.rules = {
          ...draft.rules,
          [needsRule]: true,
        };
      }
      modDraftNeeds(draft, S.resources?.modules);
    } else if (action === "place") {
      draft.off[id] = !target.checked;
    } else if (action === "cast-on") {
      const full = Object.values(draft.cast).filter((entry) => entry.on).length >= (S.resources.maxCast ?? 30);
      if (target.checked && full) {
        target.checked = false;
      } else if (target.checked) {
        draft.cast[id] = {
          ...(draft.cast[id] ?? {}),
          on: true,
          main: draft.cast[id]?.main ?? "grounded",
          romanceable: draft.cast[id]?.romanceable !== false,
        };
      } else {
        delete draft.cast[id];
      }
      this.renderPickerList();
      this.renderCastCount();
      return;
    } else if (action === "cast-main") {
      draft.cast[id] = {
        ...draft.cast[id],
        main: target.value,
      };
    } else if (action === "cast-second") {
      draft.cast[id] = {
        ...draft.cast[id],
        second: target.value,
      };
    } else if (action === "cast-romance") {
      draft.cast[id] = {
        ...draft.cast[id],
        romanceable: target.checked,
      };
    } else {
      return;
    }
    if (action === "rule" || action === "place" || action === "module" || action === "module-opt") {
      this.render();
    }
    if (action === "place") {
      countLibrary();
    } else if (action === "name") {
      this.renderStartOnly();
    }
  }
  dragScroll(ev) {
    const scroller = ev.target.closest?.("[data-drag-scroll]");
    if (!scroller || ev.pointerType !== "mouse" || ev.button !== 0 || ev.target.closest("input, textarea, select")) {
      return;
    }
    const startX = ev.clientX,
      startLeft = scroller.scrollLeft;
    let dragged = false;
    const onMove = (moveEv) => {
        const dx = moveEv.clientX - startX;
        if (!(!dragged && Math.abs(dx) < 6)) {
          dragged = true;
          scroller.classList.add("dragging");
          scroller.scrollLeft = startLeft - dx;
        }
      },
      onUp = () => {
        if (
          (window.removeEventListener("pointermove", onMove),
          window.removeEventListener("pointerup", onUp),
          scroller.classList.remove("dragging"),
          !dragged)
        ) {
          return;
        }
        const swallow = (clickEv) => {
          clickEv.stopPropagation();
          clickEv.preventDefault();
        };
        window.addEventListener("click", swallow, {
          capture: true,
          once: true,
        });
        setTimeout(
          () =>
            window.removeEventListener("click", swallow, {
              capture: true,
            }),
          0,
        );
      };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }
  dragFace(ev) {
    const pad = ev.target.closest?.("[data-face-pad]");
    if (!pad || !S.faceEdit) {
      return;
    }
    ev.preventDefault();
    const onMove = (moveEv) => {
      const rect = pad.getBoundingClientRect();
      S.faceEdit.x =
        Math.round(Math.min(100, Math.max(0, ((moveEv.clientX - rect.left) / rect.width) * 100)) * 10) / 10;
      S.faceEdit.y =
        Math.round(Math.min(100, Math.max(0, ((moveEv.clientY - rect.top) / rect.height) * 100)) * 10) / 10;
      this.paintFace();
    };
    onMove(ev);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }
  dragCrop(ev) {
    const pad = ev.target.closest?.("[data-crop-pad]");
    if (!pad || !S.crop) {
      return;
    }
    ev.preventDefault();
    const rect = pad.getBoundingClientRect(),
      start = {
        x: ev.clientX,
        y: ev.clientY,
        dx: S.crop.dx,
        dy: S.crop.dy,
      },
      onMove = (moveEv) => {
        if (S.crop) {
          S.crop.dx = start.dx + ((moveEv.clientX - start.x) / rect.width) * 100;
          S.crop.dy = start.dy + ((moveEv.clientY - start.y) / rect.height) * 100;
          this.paintCrop();
        }
      },
      onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }
  paintCrop() {
    const img = this.querySelector("[data-crop-img]");
    if (!S.crop || !img) {
      return;
    }
    const box = cropBox(S.crop);
    S.crop.dx = box.dx;
    S.crop.dy = box.dy;
    Object.assign(img.style, {
      left: `${box.left}%`,
      top: `${box.top}%`,
      width: `${box.w}%`,
      height: `${box.h}%`,
    });
  }
  paintFace() {
    const faceEdit = S.faceEdit,
      ring = this.querySelector("[data-face-ring]");
    if (ring) {
      ring.style.left = `${faceEdit.x}%`;
      ring.style.top = `${faceEdit.y}%`;
      ring.style.width = `${100 / faceEdit.zoom}%`;
    }
    this.querySelectorAll(".mls-face-edit .preview .mls-face").forEach((face) => {
      face.style.setProperty("--fx", `${faceEdit.x}%`);
      face.style.setProperty("--fy", `${faceEdit.y}%`);
      face.style.setProperty("--fz", faceEdit.zoom);
    });
  }
  onLookChange(ev) {
    const target = ev.target.closest?.("[data-do]"),
      action = target?.dataset.do ?? "";
    if (action.startsWith("draft-look-") && S.draft) {
      const draftLook = (S.draft.look ??= {
        connectionId: "",
        styleProfileId: "",
        tags: "",
      });
      if (action === "draft-look-connection") {
        draftLook.connectionId = target.value;
        this.render();
      } else if (action === "draft-look-profile") {
        draftLook.styleProfileId = target.value;
      } else if (action === "draft-look-tags") {
        draftLook.tags = target.value;
      }
      return true;
    }
    if (!action.startsWith("look-") || !S.look) {
      return false;
    }
    const lookEdit = (S.lookEdit ??= {
      ...S.look.look,
    });
    if (action === "look-connection") {
      lookEdit.connectionId = target.value || null;
    } else if (action === "look-profile") {
      lookEdit.styleProfileId = target.value || null;
    } else if (action === "look-tags") {
      lookEdit.tags = target.value;
    } else {
      return false;
    }
    const dirty =
        lookEdit.connectionId !== S.look.look.connectionId ||
        lookEdit.styleProfileId !== S.look.look.styleProfileId ||
        lookEdit.tags !== S.look.look.tags,
      saveButton = this.querySelector("[data-do=look-save]");
    if (saveButton) {
      saveButton.disabled = !dirty;
      saveButton.classList.toggle("yellow", dirty);
    }
    return true;
  }
  paintPromptPreview() {
    const previewEl = this.querySelector(".mls-ip-pv");
    if (previewEl) {
      previewEl.innerHTML = ipPreview(S.prompts, S.look);
      for (const field of this.querySelectorAll(".mls-ip-f")) {
        this.paintPromptField(field.dataset.f, field);
      }
    }
  }
  paintPromptField(key, field = this.querySelector(`.mls-ip-f[data-f="${CSS.escape(key)}"]`)) {
    if (!field) {
      return;
    }
    const prompts = S.prompts;
    field.classList.toggle("changed", ipChanged(prompts, key));
    field.classList.toggle("unsaved", ipUnsaved(prompts, key));
    field.classList.toggle("unused", !ipUsed(prompts, IP_FIELD[key]));
    field.querySelector(".hh").innerHTML = ipHead(prompts, key);
    const barWrap = this.querySelector(".mls-ip-barwrap");
    if (barWrap) {
      barWrap.innerHTML = ipBar(prompts);
    }
  }
  sceneAnywhere(target) {
    if (!target.closest?.(".mls-scene")) {
      return false;
    }
    const actionEl = target.closest("[data-do]");
    if (
      (actionEl && !actionEl.matches(".box")) ||
      target.closest(
        "input, textarea, .mls-turn, .mls-decide, .mls-summary, .controls, .bonds, .when, .mls-here, .mls-scene-log, .mls-bonds-toggle",
      )
    ) {
      return false;
    }
    if (S.view === "outing") {
      const outing = S.life?.outing;
      if (!(!outing || outingHeld(outing, S.outSeg ?? 0) || (S.outSeg ?? 0) >= outingLines(outing).length)) {
        S.outSeg = (S.outSeg ?? 0) + 1;
        this.render();
      }
      return true;
    }
    sceneNext();
    return true;
  }
  onPainted(changed) {
    if (!S.busy) {
      if (S.view === "settings" && S.settingsTab === "prompts") {
        this.paintPromptPreview();
        return;
      }
      if (S.view === "settings") {
        const scratch = document.createElement("div");
        scratch.innerHTML = settingsView({
          life: S.life,
          look: S.look,
          options: S.lookOptions,
          edit: S.lookEdit,
          tab: S.settingsTab,
          motion: motionMode(),
          systemLess: systemWantsLess(),
          debug: S.debug,
          version: S.health?.version ?? "",
          prompts: S.prompts,
        });
        for (const selector of [".mls-queue", ".mls-look-grid"]) {
          const current = this.querySelector(selector),
            fresh = scratch.querySelector(selector);
          if (current && fresh) {
            morph(current, fresh);
          }
        }
        return;
      }
      if (S.view === "painting") {
        if (!changed) {
          return;
        }
        if (S.clothesReview || document.activeElement?.matches?.("input, textarea")) {
          const scratch = document.createElement("div");
          scratch.innerHTML = paintingView({
            life: S.life,
            look: S.look,
          });
          const current = this.querySelector(":scope > .mls-painting"),
            fresh = scratch.querySelector(".mls-painting");
          if (current && fresh) {
            morph(current, fresh);
          }
          return;
        }
        this.render({
          keep: true,
        });
        return;
      }
      if (changed) {
        if (!(
          S.phone ||
          S.card ||
          S.jobCard ||
          S.faint ||
          (S.talkTo && S.view !== "contacts") ||
          document.activeElement?.matches?.("input, textarea")
        )) {
          if (["map", "place", "corridor", "scene", "gallery", "contacts"].includes(S.view)) {
            this.render({
              keep: true,
            });
          }
        }
      }
    }
  }
  renderCastCount() {
    const onCount = Object.values(S.draft.cast).filter((entry) => entry.on).length,
      countEl = this._overlay?.querySelector(".mls-picker .count");
    if (countEl) {
      countEl.textContent = `${onCount} of up to ${S.resources.maxCast ?? 30} \xB7 ${S.resources.cards.length} cards`;
    }
    const indexCount = this.querySelector('.mls-index a[href="#mls-cast"] span');
    if (indexCount) {
      indexCount.textContent = String(onCount);
    }
  }
  // Ask the Engine which cards match the query; until it answers (or if it cannot), the local filter shows.
  searchPicker(draft) {
    clearTimeout(this._pickerSearchTimer);
    const query = String(draft.pickerQuery ?? "").trim();
    if (!query) {
      draft.pickerMatch = null;
      return;
    }
    this._pickerSearchTimer = setTimeout(async () => {
      let answer;
      try {
        answer = await searchLibraryIds(query);
      } catch {
        return;
      }
      if (String(draft.pickerQuery ?? "").trim() !== query) return;
      // A half-typed query keeps the last matches and says what is wrong.
      draft.pickerMatch = answer.error
        ? { query: draft.pickerMatch?.query ?? "", ids: draft.pickerMatch?.ids ?? null, error: answer.error }
        : { query, ids: answer.ids, error: "" };
      this.renderPickerList();
    }, 200);
  }
  renderPickerList() {
    const list = this._overlay?.querySelector(".mls-picker .list");
    if (list) {
      list.innerHTML = pickerList({
        resources: S.resources,
        draft: S.draft,
        shown: pickerShown(S.resources, S.draft),
      });
    }
  }
  renderWeekGridOnly() {
    const scratch = document.createElement("div");
    scratch.innerHTML = weekView({
      resources: S.resources,
      draft: S.draft,
      error: S.error,
      busy: S.busy,
    });
    const current = this.querySelector(".mls-week"),
      fresh = scratch.querySelector(".mls-week");
    if (current && fresh) {
      current.innerHTML = fresh.innerHTML;
    }
  }
  playPlace() {
    const screen = this.querySelector(".mls-place-screen");
    if (!screen) {
      return;
    }
    if (S.focusEnter) {
      screen.classList.add("entering");
      S.focusEnter = false;
    }
    if (S.card) {
      playCard(this, S.card);
    }
    const roll = S.roll;
    S.roll = null;
    const now = hudSnap(S.life);
    if (roll) {
      rollHud(this, roll.from, now, {
        ms: roll.ms ?? 1200,
        linear: !!roll.linear,
      });
    }
    const fresh = S.talkFresh;
    S.talkFresh = null;
    const talk = fresh ? S.talk[fresh.id] : null;
    if (!talk || talk.waiting) {
      return;
    }
    this.querySelector(".mls-person.picked")?.classList.add(talk.outcome === "bad" ? "react-bad" : "react-good");
    if (talk.line) {
      typeInto(this.querySelector(".mls-bubble .said"), talk.line, {
        speed: 20,
      });
    }
    const axisLabels = {
      friendship: "FRIENDSHIP",
      romance: "ROMANCE",
      trust: "TRUST",
    };
    let shown = 0;
    for (const axis of Object.keys(axisLabels)) {
      const delta = Math.round((talk.applied?.[axis] ?? 0) * 10) / 10,
        limit = talk.limits?.[axis],
        bar = this.querySelector(`.mls-bondrow[data-axis="${axis}"] .bar`);
      if (!bar || (!delta && !limit)) {
        continue;
      }
      const label = delta ? `${delta > 0 ? "+" : "\u2212"}${Math.abs(delta)} ${axisLabels[axis]}` : CAP_TAG[limit];
      setTimeout(() => floatFrom(this, bar, label, delta < 0 ? "bad" : delta ? "" : "cap"), 150 + shown++ * 220);
    }
    const energyDelta = fresh.before && now ? Math.round(now.energy - fresh.before.energy) : 0;
    if (energyDelta) {
      setTimeout(
        () =>
          floatFrom(
            this,
            this.querySelector('[data-hud="energy"]')?.parentElement,
            `${energyDelta > 0 ? "+" : "\u2212"}${Math.abs(energyDelta)} ENERGY`,
            "cost",
          ),
        250,
      );
    }
  }
  renderStartOnly() {
    const startButton2 = this.querySelector(".mls-start"),
      todo = this.querySelector(".mls-index .todo");
    if (!startButton2) {
      return;
    }
    const missing2 = S.draft.name.trim() ? [] : ["a name"],
      blocked = !S.draft.name.trim() || !S.draft.personaId || !Object.values(S.draft.cast).some((entry) => entry.on);
    startButton2.disabled = blocked;
    if (todo && !blocked) {
      todo.remove();
    }
  }
  render({ keep = false } = {}) {
    if (S.modOn && S.view !== (S.modOn.where === "settings" ? "settings" : "create")) {
      S.modOn = null;
    }
    this.measureTab();
    this.applyFab();
    const sameView = this._shownView === S.view,
      motion = keep && sameView ? null : motionBefore(this),
      scrollTop = sameView ? (this.querySelector(":scope > .mls-settings, :scope > .mls-you")?.scrollTop ?? 0) : 0,
      keptNodes = keep && sameView ? [...this.childNodes] : null;
    try {
      this.renderView();
    } catch (err) {
      console.error("Modern Life Sim: this screen could not be shown.", err);
      this.innerHTML = brokenView();
    }
    if (keptNodes) {
      const fresh = document.createElement("div");
      fresh.append(...this.childNodes);
      this.replaceChildren(...keptNodes);
      morphChildren(this, fresh);
    }
    if (scrollTop) {
      const scroller = this.querySelector(":scope > .mls-settings, :scope > .mls-you");
      if (scroller) {
        scroller.scrollTop = scrollTop;
      }
    }
    this._shownView = S.view;
    this.paintOver();
    solidScrollers(this);
    motionAfter(this, motion);
    this.paintFlash();
    this.paintLoading();
    this.newsDue();
    this.approachDue();
  }
  approachDue() {
    const approach = S.approachNext;
    if (!(
      !approach ||
      S.busy ||
      this._walking ||
      S.card ||
      S.jobCard ||
      S.faint ||
      (S.invite?.answer && S.talk?.[S.invite.character]?.invite) ||
      !S.life ||
      S.view === "scene" ||
      S.view === "outing" ||
      S.view === "news"
    )) {
      S.approachNext = null;
      setTimeout(() => {
        if (S.busy || S.view === "scene" || S.view === "news") {
          S.approachNext ??= approach;
          return;
        }
        approachScene(approach);
      }, 0);
    }
  }
  newsDue() {
    if (!(!S.life || S.busy)) {
      if (S.life.news?.writing) {
        watchNews();
      }
      if (!(
        !S.life.news?.unseen ||
        S.newsAsked ||
        !["map", "place"].includes(S.view) ||
        S.card ||
        S.jobCard ||
        S.faint ||
        S.phone ||
        S.bag
      )) {
        S.newsAsked = true;
        S.lastPlaceView = S.view;
        setTimeout(() => openNews(true), 0);
      }
    }
  }
  paintOver() {
    if (S.crop) {
      this.insertAdjacentHTML("beforeend", cropView(S.crop));
    }
    const inOffice = !!S.jobCard || (S.view === "place" && S.life?.at === "office" && !!S.life?.career?.shift);
    if (
      (S.life &&
        [
          "place",
          "corridor",
          "you",
          "contacts",
          "settings",
          "shop",
          "calendar",
          "rack",
          "kitchen",
          "gallery",
          "jobs",
          "bills",
          "homes",
          "wedding",
        ].includes(S.view) &&
        !S.faint &&
        !S.evict &&
        !inOffice &&
        !this.querySelector(":scope > .mls-phone-fab") &&
        (this.insertAdjacentHTML("beforeend", phoneButton(S.life)),
        S.phone && this.insertAdjacentHTML("beforeend", phoneView(S.life))),
      !(S.life && S.view !== "scene" && S.view !== "outing" && S.view !== "title" && !S.faint))
    ) {
      S.bag = false;
      S.ask = null;
      return;
    }
    if (S.bag && S.things) {
      this.insertAdjacentHTML(
        "beforeend",
        backpackView({
          things: S.things,
          pick: S.thingPick,
          said: S.said,
          error: S.error,
        }),
      );
    }
    if (S.ask) {
      this.insertAdjacentHTML("beforeend", askView(S.ask));
    } else if (!S.life.gender && (S.view === "map" || S.view === "place") && !S.card && !S.jobCard) {
      this.insertAdjacentHTML("beforeend", yourGenderAsk());
    } else if (S.life.firstDay && S.view === "map" && !S.card && !S.jobCard && !S.phone) {
      this.insertAdjacentHTML("beforeend", firstDayCard(S.life.firstDay));
    }
    if (S.clothesReview) {
      this.insertAdjacentHTML("beforeend", clothesReviewView(S.clothesReview));
    }
    if (S.notice && !S.card && !S.jobCard) {
      this.insertAdjacentHTML("beforeend", noticeView(S.notice));
    }
    if (S.keys) {
      this.insertAdjacentHTML("beforeend", keysView(S.keys, S.life));
      S.keys.fresh = false;
    }
    const theirPartyOver =
      S.life.partyOver && !S.life.partyOver.theirs && !(S.view === "place" && S.life.at === "home" && !S.life.visit);
    if (
      (S.life.partyOver?.theirs || theirPartyOver) &&
      !S.card &&
      !S.jobCard &&
      !S.notice &&
      ["place", "corridor", "map"].includes(S.view)
    ) {
      this.insertAdjacentHTML("beforeend", theirPartyOverView(S.life.partyOver));
    }
    if (S.life.partyMemoDue || S.life.partyOver?.remember?.pending) {
      setTimeout(partyRemember, 0);
    }
    for (const panel of this.querySelectorAll(".mls-phone, .mls-bag")) {
      this.stickToButton(panel);
    }
  }
  stickToButton(panel) {
    const fab = this.querySelector(".mls-phone-fab"),
      frame = panel.offsetParent;
    if (!fab || !frame) {
      return;
    }
    const fabRect = fab.getBoundingClientRect(),
      frameRect = frame.getBoundingClientRect(),
      gap = 12,
      visibleTop = Math.max(frameRect.top, 0),
      visibleBottom = Math.min(frameRect.bottom, window.innerHeight);
    panel.style.maxHeight = "none";
    const panelHeight = panel.scrollHeight,
      panelWidth = panel.offsetWidth;
    if (this.isNarrow()) {
      const spaceAbove = fabRect.top - visibleTop - gap * 2,
        spaceBelow = visibleBottom - fabRect.bottom - gap * 2,
        placeAbove = panelHeight <= spaceAbove || spaceAbove >= spaceBelow;
      panel.style.maxHeight = `${Math.max(200, placeAbove ? spaceAbove : spaceBelow)}px`;
      const left = Math.max(14, Math.min(window.innerWidth - panelWidth - 14, fabRect.right - panelWidth));
      panel.style.left = `${left - frameRect.left}px`;
      panel.style.right = "auto";
      panel.style.top = placeAbove
        ? `${fabRect.top - frameRect.top - panel.offsetHeight - gap}px`
        : `${fabRect.bottom - frameRect.top + gap}px`;
    } else {
      const spaceAbove = fabRect.bottom - visibleTop - gap * 2,
        spaceBelow = visibleBottom - fabRect.top - gap * 2,
        placeAbove = panelHeight <= spaceAbove || spaceAbove >= spaceBelow;
      panel.style.maxHeight = `${Math.max(200, placeAbove ? spaceAbove : spaceBelow)}px`;
      const left = fabRect.right - frameRect.left + gap;
      panel.style.left = `${left + panelWidth <= frameRect.width - 8 ? left : Math.max(8, fabRect.left - frameRect.left - gap - panelWidth)}px`;
      panel.style.right = "auto";
      panel.style.top = placeAbove
        ? `${fabRect.bottom - frameRect.top - panel.offsetHeight}px`
        : `${fabRect.top - frameRect.top}px`;
    }
    panel.style.bottom = "auto";
  }
  fabDown(ev) {
    const fab = ev.target.closest?.(".mls-phone-fab");
    if (!fab || ev.button !== 0 || S.busy || this._fabHold) {
      return;
    }
    const hold = {
      fab: fab,
      x0: ev.clientX,
      y0: ev.clientY,
      id: ev.pointerId,
      mouse: ev.pointerType === "mouse",
      moving: false,
    };
    if (hold.mouse) {
      ev.preventDefault();
    }
    const lift = () => {
      hold.moving = true;
      hold.fab.classList.add("moving");
      try {
        hold.fab.setPointerCapture(hold.id);
      } catch {
        // Best effort: nothing to do when this fails.
      }
      hold.box = this.getBoundingClientRect();
      hold.start = hold.fab.getBoundingClientRect();
    };
    hold.lift = lift;
    this._fabHold = hold;
  }
  fabMove(ev) {
    const hold = this._fabHold;
    if (!hold || ev.pointerId !== hold.id) {
      return;
    }
    if (!hold.moving) {
      if (Math.hypot(ev.clientX - hold.x0, ev.clientY - hold.y0) <= 8) {
        return;
      }
      hold.lift();
    }
    ev.preventDefault();
    const box = hold.box,
      size = 66,
      margin = 8,
      bottomEdge = Math.min(box.bottom, window.innerHeight),
      topEdge = Math.max(box.top, 0),
      left = Math.max(margin, Math.min(box.width - size - margin, ev.clientX - box.left - size / 2)),
      bottom = Math.max(margin, Math.min(bottomEdge - topEdge - size - margin, bottomEdge - ev.clientY - size / 2));
    this._fab = {
      x: left / Math.max(1, box.width - size),
      b: Math.round(bottom),
    };
    hold.dx = box.left + left + size / 2 - (hold.start.left + hold.start.width / 2);
    hold.dy = bottomEdge - bottom - size / 2 - (hold.start.top + hold.start.height / 2);
    if (!hold.frame) {
      hold.frame = requestAnimationFrame(() => {
        hold.frame = 0;
        const fab = this.querySelector(".mls-phone-fab");
        if (fab && this._fabHold === hold) {
          fab.style.translate = `${hold.dx}px ${hold.dy}px`;
        }
      });
    }
  }
  fabUp(ev) {
    const hold = this._fabHold;
    if (!hold || (ev && ev.pointerId !== hold.id) || ((this._fabHold = null), !hold.moving)) {
      return;
    }
    cancelAnimationFrame(hold.frame);
    for (const fab2 of this.querySelectorAll(".mls-phone-fab")) {
      fab2.style.translate = "";
      fab2.classList.remove("moving");
    }
    this.applyFab();
    const fab = this.querySelector(".mls-phone-fab");
    if (fab && this._fab && Number.isFinite(hold.dx)) {
      const rect = fab.getBoundingClientRect(),
        width = this.getBoundingClientRect().width,
        driftX = rect.left + rect.width / 2 - (hold.start.left + hold.start.width / 2 + hold.dx),
        driftY = rect.top + rect.height / 2 - (hold.start.top + hold.start.height / 2 + hold.dy);
      if (Math.abs(driftX) > 0.5 || Math.abs(driftY) > 0.5) {
        this._fab = {
          x: this._fab.x - driftX / Math.max(1, width - 66),
          b: Math.round(this._fab.b + driftY),
        };
        this.applyFab();
      }
    }
    this._swallowClick = true;
    setTimeout(
      () => {
        this._swallowClick = false;
      },
      hold.mouse ? 0 : 400,
    );
    try {
      localStorage.setItem("mls-fab", JSON.stringify(this._fab));
    } catch {
      // Best effort: nothing to do when this fails.
    }
  }
  applyFab() {
    if (this._fab === undefined) {
      try {
        this._fab = JSON.parse(localStorage.getItem("mls-fab")) ?? null;
      } catch {
        this._fab = null;
      }
    }
    const pos = this._fab;
    if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.b)) {
      return;
    }
    const left = Math.round(pos.x * Math.max(0, this.getBoundingClientRect().width - 66));
    this.style.setProperty("--fab-left", `${left}px`);
    this.style.setProperty("--fab-bottom", `${pos.b}px`);
  }
  dragDown(ev) {
    const handle = ev.target.closest?.("[data-drag]");
    if (!(!handle || S.busy || ev.button !== 0)) {
      this._drag = {
        list: handle.dataset.list,
        index: Number(handle.dataset.index),
        home: handle.dataset.home,
        icon: handle.dataset.icon,
        x0: ev.clientX,
        y0: ev.clientY,
        started: false,
      };
    }
  }
  dragMove(ev) {
    const drag = this._drag;
    if (!drag) {
      return;
    }
    if (!drag.started) {
      if (Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) < 6) {
        return;
      }
      drag.started = true;
      drag.ghost = document.createElement("div");
      drag.ghost.className = "mls-drag-ghost";
      drag.ghost.textContent = drag.icon;
      document.body.append(drag.ghost);
      this.classList.add("dragging");
      for (const zone of this.querySelectorAll("[data-drop]")) {
        const accepts = dropAccepts(zone.dataset.drop, drag);
        zone.classList.add(accepts ? "ok" : "no");
        const why = zone.querySelector(".why");
        if (!accepts && why && DROP_WHY_NOT[zone.dataset.drop]) {
          zone.dataset.was = why.textContent;
          why.textContent = DROP_WHY_NOT[zone.dataset.drop];
        }
      }
    }
    drag.ghost.style.left = `${ev.clientX}px`;
    drag.ghost.style.top = `${ev.clientY}px`;
    const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.("[data-drop]");
    for (const zone of this.querySelectorAll("[data-drop]")) {
      zone.classList.toggle("over", zone === target);
    }
  }
  dragUp(ev) {
    const drag = this._drag;
    if (((this._drag = null), !drag?.started)) {
      return;
    }
    this._swallowClick = true;
    setTimeout(() => {
      this._swallowClick = false;
    }, 0);
    drag.ghost.remove();
    const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.("[data-drop]");
    this.classList.remove("dragging");
    for (const zone of this.querySelectorAll("[data-drop]")) {
      zone.classList.remove("ok", "no", "over");
      if (zone.dataset.was !== undefined) {
        zone.querySelector(".why").textContent = zone.dataset.was;
        delete zone.dataset.was;
      }
    }
    if (!(!target || !dropAccepts(target.dataset.drop, drag))) {
      if ((pileAt(drag.list, drag.index)?.n ?? 1) > 1) {
        return askThing("move", drag.list, drag.index, target.dataset.drop);
      }
      thingDo(
        {
          action: "move",
          list: drag.list,
          index: drag.index,
        },
        {
          zone: target.dataset.drop,
        },
      );
    }
  }
  touched(el) {
    const rect = el.getBoundingClientRect(),
      hostRect = this.getBoundingClientRect();
    this._touch = {
      x: rect.left - hostRect.left + rect.width / 2,
      top: rect.top - hostRect.top,
      bottom: rect.bottom - hostRect.top,
      at: Date.now(),
    };
    this.querySelector(":scope > .mls-flash")?.remove();
    this._flashUntil = 0;
  }
  paintFlash() {
    this.querySelector(":scope > .mls-flash")?.remove();
    const panelOpen = S.view === "place" && (S.homePanel || S.life?.visit?.stage === "door"),
      text =
        !FLASH_VIEWS.includes(S.view) || panelOpen ? "" : S.view === "place" && S.talkTo ? S.said : S.error || S.said;
    if (!text) {
      return;
    }
    const fresh = S.saidCount !== this._flashCount;
    if (
      (fresh &&
        ((this._flashCount = S.saidCount),
        (this._flashUntil = Date.now() + FLASH_MS),
        (this._flashAt = this._touch && Date.now() - this._touch.at < 2e4 ? this._touch : null),
        clearTimeout(this._flashTimer),
        (this._flashTimer = setTimeout(
          () => this.querySelector(":scope > .mls-flash")?.classList.add("gone"),
          FLASH_MS,
        ))),
      Date.now() >= this._flashUntil)
    ) {
      return;
    }
    const flash = document.createElement("div");
    flash.className = `mls-flash ${text === S.error ? "bad" : ""} ${fresh ? "" : "still"}`;
    flash.textContent = text;
    this.appendChild(flash);
    const hostRect = this.getBoundingClientRect(),
      width = flash.offsetWidth,
      height = flash.offsetHeight,
      anchor = this._flashAt ?? {
        x: hostRect.width / 2,
        top: 70,
        bottom: 70,
      },
      below = anchor.bottom + 12 + height <= Math.min(hostRect.height, innerHeight - hostRect.top),
      left = Math.max(10, Math.min(hostRect.width - width - 10, anchor.x - width / 2));
    flash.style.left = `${left}px`;
    flash.style.top = `${below ? anchor.bottom + 12 : Math.max(10, anchor.top - 12 - height)}px`;
    flash.classList.add(below ? "below" : "above");
    flash.style.setProperty("--tip", `${Math.max(14, Math.min(width - 14, anchor.x - left))}px`);
  }
  paintLoading() {
    if ((this.querySelector(":scope > .mls-loading")?.remove(), !S.busy)) {
      return;
    }
    const overlay = document.createElement("div");
    overlay.className = `mls-loading ${S.loading ? "" : "quiet"}`;
    const cancelButton = S.cancel ? '<button class="mls-cancel" data-do="cancel-call">CANCEL</button>' : "";
    overlay.innerHTML =
      S.loading || S.cancel
        ? `<div class="msg"><i></i>${escape(S.loading || "One moment\u2026")}${cancelButton}</div>`
        : "";
    if (S.cancel && !S.loading) {
      overlay.classList.remove("quiet");
    }
    const hostRect = this.getBoundingClientRect();
    let clip = {
      left: hostRect.left,
      top: 0,
      right: hostRect.right,
      bottom: innerHeight,
    };
    for (
      // eslint-disable-next-line @typescript-eslint/no-this-alias -- walks up from the element itself
      let node = this;
      node && node !== document.body && node !== document.documentElement;
      node = node.parentElement
    ) {
      const style = getComputedStyle(node);
      if (!/(auto|scroll)/.test(style.overflowY)) {
        continue;
      }
      const rect = node.getBoundingClientRect();
      clip = {
        left: Math.max(hostRect.left, rect.left),
        top: rect.top,
        right: Math.min(hostRect.right, rect.right),
        bottom: rect.bottom,
      };
      break;
    }
    clip.top = Math.max(clip.top, 0);
    clip.bottom = Math.min(clip.bottom, innerHeight);
    if (clip.bottom > clip.top) {
      Object.assign(overlay.style, {
        left: `${clip.left - hostRect.left}px`,
        top: `${clip.top - hostRect.top}px`,
        width: `${clip.right - clip.left}px`,
        height: `${clip.bottom - clip.top}px`,
      });
    }
    this.appendChild(overlay);
  }
  renderView() {
    const narrow = this.isNarrow();
    if (
      ((this._narrow = narrow),
      this.renderOverlay(),
      this.classList.toggle("narrow", narrow),
      this.classList.toggle("busy", S.busy),
      this.classList.toggle("cut", S.life?.frame === "cut"),
      S.view === "loading")
    ) {
      this.innerHTML =
        '<div class="mls-title"><div class="mls-logo"><span class="l1">MODERN</span><span class="l2">LIFE SIM</span></div></div>';
      return;
    }
    if (S.view === "title") {
      if (
        ((this.innerHTML = titleView({
          lives: S.lives,
          health: S.health,
          error: S.error,
          picking: S.picking,
          oldSave: S.oldSave,
          said: S.titleSaid ?? "",
          tab: S.titleTab ?? "",
          changelog: S.changelogOpen ? (S.changelogList ?? []) : null,
          seen: seenChangelog(),
          latest: S.changelogList?.[0]?.version ?? "",
          opening: !!S.loadOpening,
          narrow: narrow,
          welcome: S.welcome ?? null,
          ticked: !!S.welcomeTicked,
        })),
        (S.loadOpening = false),
        this.placeLoad(),
        this.querySelector(".mls-oldsave")?.scrollIntoView({
          block: "center",
        }),
        S.menuFor)
      ) {
        const menuPop = document.createElement("div");
        menuPop.className = "mls-pop";
        menuPop.innerHTML = `
          <button data-do="rename" data-id="${escape(S.menuFor)}">Rename</button>
          <button data-do="duplicate" data-id="${escape(S.menuFor)}">Duplicate</button>
          <button data-do="preset-life" data-id="${escape(S.menuFor)}">Save as preset</button>
          <button data-do="delete" data-id="${escape(S.menuFor)}" class="del">Delete\u2026</button>`;
        this.querySelector(".mls-title").appendChild(menuPop);
      }
      return;
    }
    if (S.view === "create") {
      this.innerHTML = creationView({
        resources: S.resources,
        draft: S.draft,
        error: S.error,
        busy: S.busy,
      });
      saveDraftSoon();
      if (S.draft?.picturesAsk) {
        this.insertAdjacentHTML(
          "beforeend",
          `<div class="mls">${picturesWarning(S.draft.picturesAsk, draftPictureCounts(S.draft)[S.draft.picturesAsk], {
            yes: "draft-pictures-yes",
            no: "draft-pictures-no",
            sofar: true,
          })}</div>`,
        );
      }
      if (S.modOn && S.modOn.where !== "settings") {
        this.insertAdjacentHTML("beforeend", `<div class="mls">${modOnCard(S.modOn)}</div>`);
      }
      return;
    }
    if (S.view === "cast-review") {
      this.innerHTML = castReviewView({
        resources: S.resources,
        draft: S.draft,
        error: S.error,
        busy: S.busy,
      });
      return;
    }
    if (S.view === "week") {
      this.innerHTML = weekView({
        resources: S.resources,
        draft: S.draft,
        error: S.error,
        busy: S.busy,
      });
      return;
    }
    if ((clearTimeout(this._autoTimer), S.evict && !S.faint && !S.card && S.view !== "scene" && S.view !== "outing")) {
      this.innerHTML = evictView(S.evict);
      return;
    }
    if (S.faint && S.view !== "scene") {
      this.innerHTML = faintView(S.faint);
      const faint = S.faint;
      playFaint(this, faint, () => {
        if (S.faint === faint) {
          faint.step = 3;
          notify();
        }
      });
      return;
    }
    if (S.view === "outing" && S.life?.outing) {
      const logState = this.logBefore();
      this.innerHTML = outingScreen({
        life: S.life,
        seg: S.outSeg ?? 0,
        error: S.error,
        stuck: S.stuck,
      });
      this.logAfter(logState);
      this.placeHere();
      const outing = S.life.outing,
        seg = S.outSeg ?? 0;
      if (S.sceneAuto && !S.sceneLog && !S.busy && seg < outingLines(outing).length && !outingHeld(outing, seg)) {
        this._autoTimer = setTimeout(
          () => {
            if (S.view === "outing") {
              S.outSeg = (S.outSeg ?? 0) + 1;
              notify();
            }
          },
          autoDelay(outingLines(outing)[seg]?.text),
        );
      }
      this.querySelector("[data-do=out-free]")?.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" && ev.target.value.trim()) {
          outingPost(
            "act",
            {
              text: ev.target.value.trim(),
            },
            {
              lines: true,
              loading: "They are answering\u2026",
            },
          );
        }
      });
      this.querySelector("[data-do=out-say-free]")?.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" && ev.target.value.trim()) {
          outingPost(
            "say",
            {
              text: ev.target.value.trim(),
            },
            {
              lines: true,
              loading: "They are answering\u2026",
            },
          );
        }
      });
      return;
    }
    if (S.view === "scene") {
      const jobCard = S.jobCard
          ? careerCardView(S.jobCard)
          : S.life.scene?.job && !readingLine(S.life.scene, S.sceneSeg, S.sceneWaiting)
            ? sceneJobCard(S.life.scene.job)
            : "",
        logState = this.logBefore();
      this.innerHTML =
        sceneView({
          life: S.life,
          seg: S.sceneSeg,
          waiting: S.sceneWaiting,
          error: S.error,
          stuck: S.stuck,
          auto: S.sceneAuto,
          showLog: S.sceneLog,
          showBonds: S.sceneBonds,
          hideText: S.sceneHide,
        }) + jobCard;
      this.logAfter(logState);
      this.placeHere();
      this.querySelector("[data-do=scene-free]")?.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" && ev.target.value.trim()) {
          sceneReply(ev.target.value);
        }
      });
      const scene = S.life?.scene;
      if (S.sceneAuto && !S.sceneLog && !S.busy && readingLine(scene, S.sceneSeg, S.sceneWaiting)) {
        this._autoTimer = setTimeout(sceneNext, autoDelay(scene.batch[S.sceneSeg]?.text));
      }
      return;
    }
    if (S.view === "calendar") {
      this.innerHTML = calendarView({
        cal: S.cal,
        day: S.calDay,
        noteOpen: S.noteOpen,
        error: S.error,
      });
      return;
    }
    if (S.view === "wedding-day") {
      this.innerHTML = weddingDayView({
        life: S.life,
        days: S.weddingDay?.days ?? null,
        pick: S.weddingDay?.pick ?? null,
        error: S.error,
      });
      return;
    }
    if (S.view === "wedding") {
      const scrollTop = this.querySelector(".mls-portal")?.scrollTop ?? 0;
      this.innerHTML = weddingAppView({
        w: S.wedding,
        tab: S.weddingTab ?? "plan",
        said: S.said,
        error: S.error,
      });
      const portal = this.querySelector(".mls-portal");
      if (portal) {
        portal.scrollTop = scrollTop;
      }
      return;
    }
    if (S.view === "bills" || S.view === "homes") {
      const scrollTop = this.querySelector(".mls-portal")?.scrollTop ?? 0;
      this.innerHTML =
        S.view === "bills"
          ? billsAppView({
              life: S.life,
              said: S.said,
              error: S.error,
            })
          : homesAppView({
              homes: S.homes,
              life: S.life,
              said: S.said,
              error: S.error,
            });
      const portal = this.querySelector(".mls-portal");
      if (portal) {
        portal.scrollTop = scrollTop;
      }
      return;
    }
    if (S.view === "jobs") {
      const scrollTop = this.querySelector(".mls-portal")?.scrollTop ?? 0;
      this.innerHTML =
        jobsAppView({
          jobs: S.jobs,
          error: S.error,
        }) + (S.jobCard ? careerCardView(S.jobCard) : "");
      const portal = this.querySelector(".mls-portal");
      if (portal) {
        portal.scrollTop = scrollTop;
      }
      return;
    }
    if (S.view === "news") {
      this.innerHTML = newsView({
        life: S.life,
        news: S.news,
      });
      return;
    }
    if (S.view === "guide") {
      const index = this.querySelector(".mls-guide .index"),
        scrollTop = index ? index.scrollTop : 0;
      this.innerHTML = guideView({
        book: S.guideBook,
        at: S.guideAt,
        query: S.guideQuery ?? "",
        back: S.guideBack ?? [],
        narrow: this._narrow,
      });
      const index2 = this.querySelector(".mls-guide .index");
      if (index2 && scrollTop) {
        index2.scrollTop = scrollTop;
      }
      return;
    }
    if (S.view === "modapp") {
      this.innerHTML = modAppView(S.life, S.modApp, S.modWho ?? "all");
      return;
    }
    if (S.view === "gallery") {
      const scrollTop = this.querySelector(".mls-gallery")?.scrollTop ?? 0;
      this.innerHTML =
        galleryView({
          life: S.life,
          gallery: S.gallery,
        }) + (S.albumOpen ? albumLight((S.gallery?.list ?? []).find((entry) => entry.id === S.albumOpen)) : "");
      const gallery = this.querySelector(".mls-gallery");
      if (gallery) {
        gallery.scrollTop = scrollTop;
      }
      return;
    }
    if (S.view === "settings") {
      this.innerHTML = settingsView({
        life: S.life,
        look: S.look,
        options: S.lookOptions,
        edit: S.lookEdit,
        tab: S.settingsTab,
        motion: motionMode(),
        systemLess: systemWantsLess(),
        resources: S.resources,
        box: S.settingsBox,
        debug: S.debug,
        version: S.health?.version ?? "",
        prompts: S.prompts,
      });
      if (S.picturesAsk) {
        this.querySelector(".mls-settings")?.insertAdjacentHTML(
          "beforeend",
          picturesWarning(S.picturesAsk, S.life?.pictures?.counts?.[S.picturesAsk]),
        );
      }
      if (S.modOn?.where === "settings") {
        this.querySelector(".mls-settings")?.insertAdjacentHTML("beforeend", modOnCard(S.modOn));
      }
      return;
    }
    if (S.view === "shop") {
      const scrollTop = this.querySelector(".mls-shop")?.scrollTop ?? 0;
      this.innerHTML = shopView({
        life: S.life,
        shop: S.shop,
        cart: S.shopCart,
        tab: S.shopTab,
        sendHome: S.shopSendHome,
        cartOpen: S.shopCartOpen,
        error: S.error,
        said: S.said,
        till: S.till,
        backTo: S.shopStore?.place ?? null,
      });
      const shop = this.querySelector(".mls-shop");
      if (shop) {
        shop.scrollTop = scrollTop;
      }
      return;
    }
    if (S.view === "painting") {
      this.innerHTML = paintingView({
        life: S.life,
        look: S.look,
      });
      return;
    }
    if (S.view === "you") {
      this.innerHTML = youView({
        you: S.you,
        tab: S.youTab ?? "skills",
        ledgerAll: !!S.youLedgerAll,
      });
      return;
    }
    if (S.view === "contacts") {
      const scrollTop = this.querySelector(".mls-contacts .sheet")?.scrollTop ?? 0;
      this.innerHTML = contactsView({
        life: S.life,
        sheet: S.sheet,
        find: S.contactsFind,
        editing: S.memEdit,
        adding: S.memAdd,
        face: S.faceEdit,
        figure: S.figureEdit,
        tab: S.sheetTab ?? "about",
        memWith: S.memWith ?? null,
        error: S.error,
        mode: S.contactsMode ?? "list",
        chart: S.chart,
        said: S.chartSaid ?? "",
        narrow: this._narrow,
        focus: S.chartFocus ?? null,
      });
      if (S.contactsMode === "chart" && S.chartFocus) {
        this.chartFocus(S.chartFocus);
      }
      const sheet = this.querySelector(".mls-contacts .sheet");
      if (sheet) {
        sheet.scrollTop = scrollTop;
      }
      return;
    }
    if (S.view === "kitchen") {
      const findScroller = () =>
          [this.querySelector(".mls-kitchen .cat"), this.querySelector(".mls-kitchen")].find(
            (el) => el && el.scrollHeight > el.clientHeight,
          ) ?? this.querySelector(".mls-kitchen .cat"),
        scrollTop = findScroller()?.scrollTop ?? 0;
      this.innerHTML = kitchenView({
        life: S.life,
        things: S.things,
        pick: S.kitchenPick,
        cooked: S.cooked,
        cooking: S.cooking,
        said: S.said,
        error: S.error,
        forWhom: S.kitchenFor,
      });
      if (S.cooked?.fresh) {
        S.cooked.fresh = false;
      }
      if (S.card) {
        this.querySelector(".mls-kitchen")?.insertAdjacentHTML("beforeend", cardView(S.card));
        playCard(this, S.card);
      }
      const scroller = findScroller();
      if (scroller) {
        scroller.scrollTop = scrollTop;
      }
      return;
    }
    if (S.view === "rack") {
      const findScroller = () =>
          [this.querySelector(".mls-rack .cat"), this.querySelector(".mls-rack")].find(
            (el) => el && el.scrollHeight > el.clientHeight,
          ) ?? this.querySelector(".mls-rack .cat"),
        scrollTop = findScroller()?.scrollTop ?? 0;
      this.innerHTML = rackView({
        life: S.life,
        rack: S.rack,
        pick: S.rackPick,
        said: S.said,
        error: S.error,
        till: S.till,
      });
      const scroller = findScroller();
      if (scroller) {
        scroller.scrollTop = scrollTop;
      }
      return;
    }
    if (S.view === "corridor") {
      const scrollLeft = this.querySelector("#mls-hall")?.scrollLeft ?? 0;
      this.innerHTML =
        S.corridor === "mall"
          ? mallView({
              life: S.life,
              said: S.said,
              error: S.error,
            })
          : corridorView({
              life: S.life,
              placeId: S.corridor,
              said: S.said,
              error: S.error,
            });
      const hall = this.querySelector("#mls-hall");
      if (hall) {
        hall.scrollLeft = scrollLeft;
      }
      return;
    }
    if (S.view === "place") {
      if (S.life.at === "home") {
        loadThings();
      } else {
        S.homePanel = null;
      }
      const side = this.querySelector(".mls-talk, .mls-acts"),
        scrollTop = side && this._sideKey === `${S.life.at}|${S.talkTo ?? ""}` ? side.scrollTop : 0;
      if (
        ((this.innerHTML = placeView({
          life: S.life,
          said: S.said,
          error: S.error,
          talkTo: S.talkTo,
          talk: S.talk,
          busy: S.busy,
          card: S.card,
          job: S.card ? "" : careerOverlay(),
          home:
            S.life.at === "home"
              ? {
                  things: S.things,
                  panel: S.homePanel,
                  pick: S.thingPick,
                }
              : null,
          sleep: sleepOpen(),
        })),
        (this._sideKey = `${S.life.at}|${S.talkTo ?? ""}`),
        scrollTop)
      ) {
        const side2 = this.querySelector(".mls-talk, .mls-acts");
        if (side2) {
          side2.scrollTop = scrollTop;
        }
      }
      if (!S.card) {
        this.querySelector(".mls-place-screen")?.insertAdjacentHTML("beforeend", modCutView(S.life));
      }
      this.playPlace();
      fadeGone();
      return;
    }
    const walk = S.walk;
    S.walk = null;
    if (walk && narrow) {
      S.town = false;
    }
    this._walking = !!walk && !narrow;
    this.innerHTML = mapView({
      life: S.life,
      said: S.said,
      error: S.error,
      phone: narrow,
      job: careerOverlay(),
      town: !!S.town,
    });
    if (S.phone) {
      this.querySelector(".mls-map")?.insertAdjacentHTML("beforeend", phoneView(S.life));
    } else {
      this.querySelector(".mls-map")?.insertAdjacentHTML(
        "beforeend",
        modCutView(S.life, {
          map: true,
        }),
      );
    }
    const stepMs = 320,
      hopMs = 650,
      roll = S.roll;
    S.roll = null;
    const hops = walk && !narrow ? Math.max(0, (walk.route?.length ?? 1) - 1) : 0,
      fadeMs = fxT(430),
      holdMs = 120;
    if (roll) {
      rollHud(this, roll.from, hudSnap(S.life), {
        ms:
          walk && !narrow
            ? (walk.closing ? fadeMs : 0) + hops * hopMs + holdMs + (hops ? fadeMs : 0) + (walk.inside ? 2 * stepMs : 0)
            : 900,
        linear: true,
      });
    }
    requestAnimationFrame(() => {
      drawLinks(this);
      const finish = () => {
        const wasWalking = this._walking;
        this._walking = false;
        const afterWalk = S.afterWalk;
        S.afterWalk = null;
        if (afterWalk) {
          afterWalk();
        } else if (wasWalking && S.approachNext) {
          notify();
        }
      };
      if (!walk || narrow) {
        return finish();
      }
      const persona = S.life.persona ?? {},
        marker = {
          initial: (persona.name || "\u2022")[0].toUpperCase(),
          avatar: persona.avatar,
        };
      if (walk.phase === "town") {
        const startWalk = () =>
          walkTown(this, walk.route, {
            ...marker,
            ms: hopMs,
            hold: holdMs,
          }).then(() => {
            S.town = false;
            S.walk = walk.inside
              ? {
                  ...walk,
                  phase: "inside",
                  from: "sign",
                  opened: true,
                }
              : null;
            notify();
          });
        if (walk.closing) {
          setTimeout(startWalk, fadeMs);
        } else {
          startWalk();
        }
      } else if (walk.opened) {
        setTimeout(
          () =>
            walkAlong(this, walk.from, walk.to, {
              ...marker,
              ms: stepMs,
            }).then(finish),
          fadeMs,
        );
      } else {
        walkAlong(this, walk.from, walk.to, {
          ...marker,
          ms: stepMs,
        }).then(finish);
      }
    });
  }
}
if (!customElements.get(TAG)) {
  customElements.define(TAG, ModernLifeSimElement);
}
MAP.hotel = {
  r: 5,
  icon: "\u{1F3E8}",
  bg: "linear-gradient(135deg,#8a3a5a,#2a1020)",
};
MAP.club = {
  r: 9,
  icon: "\u{1F48B}",
  bg: "linear-gradient(135deg,#b3122e,#2a0710)",
};

export { TAG };
