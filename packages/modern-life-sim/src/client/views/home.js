// Shop, home panels, kitchen, backpack, clothes rack
import { colourFor, escape, frameImg, paintIcon, placeHud, uploadIcon } from "./common.js";
import { counterStrip, tillView } from "./place.js";
import { S } from "../state.js";

const BAG_PILE = 5;
const DAY_MINUTES = 1440;
const TILT = [-2, 1.5, -1, 2];
function bagAfter(bag, cart, items) {
  const piles = (bag?.piles ?? []).map((pile) => ({
    ...pile,
  }));
  let over = 0;
  for (const [itemId, count] of Object.entries(cart)) {
    const item = items.find((candidate) => candidate.id === itemId);
    if (!item || !count) {
      continue;
    }
    let units = count * (item.units ?? 1);
    const fresh = item.fresh ?? null;
    for (const pile of piles) {
      if (units <= 0) {
        break;
      }
      if (
        pile.item !== itemId ||
        pile.n >= BAG_PILE ||
        (pile.left === null) != (fresh === null) ||
        (fresh !== null && Math.abs(pile.left - fresh) > DAY_MINUTES)
      ) {
        continue;
      }
      const added = Math.min(units, BAG_PILE - pile.n);
      pile.n += added;
      units -= added;
    }
    for (; units > 0;) {
      const chunk = Math.min(units, BAG_PILE);
      if (piles.length < bag.slots) {
        piles.push({
          item: itemId,
          n: chunk,
          left: fresh,
        });
      } else {
        over += chunk;
      }
      units -= chunk;
    }
  }
  return {
    used: bag.used,
    after: Math.min(bag.slots, piles.length),
    over: over,
  };
}
const chipHtml = (chip) => `<span class="chip ${escape(chip.kind)}">${escape(chip.text)}</span>`;
function shopView({
  life: life,
  shop: shop,
  cart = {},
  tab = null,
  sendHome = false,
  cartOpen = false,
  error = "",
  said = "",
  till = null,
  backTo = null,
}) {
  if (!shop) {
    return '<div class="mls-shop"><p class="hint">Loading\u2026</p></div>';
  }
  const online = shop.mode === "online",
    tabs = shop.tabs ?? [],
    currentTab = tabs.find((tab2) => tab2.id === tab) ?? tabs[0],
    allItems = tabs.flatMap((tab2) => tab2.items),
    delivered = online || !!shop.delivers,
    lines = Object.entries(cart)
      .filter(([, count]) => count > 0)
      .map(([itemId, count]) => ({
        item: allItems.find((item) => item.id === itemId),
        n: count,
      }))
      .filter((line) => line.item),
    total = lines.reduce((sum, line) => sum + line.item.price * line.n, 0),
    itemCount = lines.reduce((sum, line) => sum + line.n, 0),
    bagPlan = delivered ? null : bagAfter(shop.bag, cart, allItems),
    payDisabled = !lines.length || total > shop.cash || (!delivered && bagPlan.over > 0 && !sendHome),
    payNote = lines.length
      ? total > shop.cash
        ? "not enough cash"
        : !delivered && bagPlan.over > 0 && !sendHome
          ? "make room or send the rest home"
          : online
            ? "no time spent \xB7 delivery tomorrow"
            : delivered
              ? "5 min at the till \xB7 home tonight"
              : "5 min at the till"
      : "the cart is empty",
    itemCard = (item, index) => {
      const inCart = cart[item.id] || 0;
      return `<div class="mls-item ${inCart ? "in" : ""} ${item.available ? "" : "no"}" style="--r:${TILT[index % 4]}deg">
      ${item.isNew ? '<span class="badge">NEW</span>' : ""}
      <div class="ph ${item.pic ? "pic" : ""}">${item.pic ? `<img src="${escape(item.pic)}" alt="">` : escape(item.icon)}</div><b>${escape(item.name)}</b>
      ${item.line ? `<small class="line">${escape(item.line)}</small>` : ""}
      <span class="price">${item.was ? `<s>$${item.was}</s> ` : ""}$${item.price}</span>
      <div class="chips">${item.chips.map(chipHtml).join("")}</div>
      ${item.available ? `<button class="add" data-do="cart-add" data-id="${escape(item.id)}" ${item.unique && inCart ? "disabled" : ""}>${inCart ? (item.unique ? "IN CART" : `IN CART \xD7${inCart} \xB7 ADD`) : "ADD"}</button>` : `<span class="why">${escape(item.why)}</span>${item.sell ? `<button class="add" data-do="vehicle-sell" data-id="${escape(item.id)}">SELL \xB7 $${item.sell.toLocaleString("en-US")}</button>` : ""}`}
    </div>`;
    },
    bagInfo = delivered
      ? ""
      : `
    <div class="space">Backpack ${bagPlan.after} / ${shop.bag.slots}
      <div class="slots">${Array.from(
        {
          length: shop.bag.slots,
        },
        (unused, index) => `<i class="${index < shop.bag.used ? "full" : index < bagPlan.after ? "new" : ""}"></i>`,
      ).join("")}${bagPlan.over ? '<i class="over"></i>' : ""}</div></div>
    ${
      bagPlan.over
        ? `<div class="warn">${bagPlan.over} won't fit in your backpack.</div>
      <label class="home"><input type="checkbox" data-do="send-home" ${sendHome ? "checked" : ""}> Send what doesn't fit home <small>it waits for you there</small></label>`
        : ""
    }`;
  return `
    <div class="mls-shop">
      ${life?.backdrop?.here && !online ? `<div class="behind" style="background-image:url('${escape(life.backdrop.here)}')"></div>` : '<div class="behind"></div>'}
      <div class="head">
        <button class="mls-back flat" data-do="shop-back">\u25C2 ${escape(online ? (backTo ?? "MAP").toUpperCase() : (shop.place ?? "SUPERMARKET").toUpperCase())}</button>
        <h1>SHOP</h1>
        <!-- in the store or online: two ways in, never switched here (SonaGate, playtest 25-sep): the store is its place, online is the phone's SHOP;
             the phone's SHOP opened in a store goes BACK to that store (backTo, SonaGate 28-sep) -->
        <div class="where"><span class="on">${online ? "Online<small>arrives tomorrow</small>" : `In store<small>${shop.delivers || life?.at === "furniture" ? "home tonight" : "take it now"}</small>`}</span></div>
        <div class="money"><small>CASH</small>$${shop.cash}</div>
      </div>
      <div class="cat">
        ${online ? "" : counterStrip(shop.counter)}
        <div class="tabs">${tabs.map((tab2) => `<button class="${tab2 === currentTab ? "on" : ""} ${tab2.isNew ? "new" : ""}" data-do="shop-tab" data-id="${tab2.id}">${escape(tab2.name)}${tab2.isNew ? " \u2726" : ""}</button>`).join("")}</div>
        <div class="note">${online && currentTab?.id === "vehicles" ? "Delivered home tomorrow at 09:00. With both, you take the faster one." : online ? "Delivered home tomorrow at 09:00. New furniture replaces what you have." : delivered ? "Delivered home tonight at 20:00, or tomorrow at 09:00 if you buy after 19:00. It replaces what you have." : "It goes into your backpack; food keeps longer in the fridge at home."}</div>
        ${error ? `<div class="mls-said bad">${escape(error)}</div>` : till ? tillView(till) : said ? `<div class="mls-said">${escape(said)}</div>` : ""}
        <div class="items">${currentTab?.items.length ? currentTab.items.map(itemCard).join("") : `<p class="hint">${currentTab?.isNew ? "Nothing new yet this season. Look again in a moment." : "Nothing here."}</p>`}</div>
      </div>
      <aside class="cart ${cartOpen ? "open" : ""}">
        <h2 data-do="cart-toggle">CART \xB7 ${itemCount} ${itemCount === 1 ? "item" : "items"} \xB7 $${total}</h2>
        <div class="detail">
          ${lines.map((line) => `<div class="line"><span>${escape(line.item.name)}</span><span class="q"><button data-do="cart-dec" data-id="${escape(line.item.id)}">\u2212</button>${line.item.unique ? "" : `<button data-do="cart-add" data-id="${escape(line.item.id)}">+</button>`}</span><span class="p">\xD7${line.n} $${line.item.price * line.n}</span></div>`).join("")}
          <div class="sep"></div>
          <div class="tot big"><span>TOTAL</span><span>$${total}</span></div>
          <div class="tot"><span class="after">Cash after</span><span class="after">$${shop.cash - total}</span></div>
          ${online ? '<div class="deliv">Arrives at your home tomorrow, 09:00.</div>' : delivered ? '<div class="deliv">Arrives at your home tonight.</div>' : bagInfo}
        </div>
        <button class="pay" data-do="shop-pay" ${payDisabled ? "disabled" : ""}>PAY<small>${escape(payNote)}</small></button>
      </aside>
    </div>`;
}
const HOME_OPTIONS = [
  {
    id: "fridge",
    icon: "\u{1F9CA}",
    name: "Fridge",
    hint: (things) => {
      const count = things.fridge.reduce((sum, pile) => sum + pile.n, 0),
        soon = things.fridge.filter((pile) => pile.fresh.level === "soon" || pile.fresh.level === "bad").length;
      return `${count} item${count === 1 ? "" : "s"}${soon ? ` \xB7 ${soon} to eat soon` : ""}`;
    },
  },
  {
    id: "cook",
    icon: "\u{1F373}",
    name: "Cook",
    hint: (things) => {
      const count = things.recipes.filter((recipe) => recipe.available).length;
      return `${count || "No"} recipe${count === 1 ? "" : "s"} available`;
    },
  },
  {
    id: "closet",
    icon: "\u{1F454}",
    name: "Closet",
    hint: (things) => `wearing ${things.wearingName}`,
  },
  {
    id: "shelf",
    icon: "\u{1F4E6}",
    name: "Shelf",
    hint: (things) => {
      const count = things.shelf.reduce((sum, pile) => sum + pile.n, 0);
      return count ? `${count} item${count === 1 ? "" : "s"}` : "empty";
    },
  },
  {
    id: "home",
    icon: "\u{1F3E0}",
    name: "Your home",
    hint: () => "",
  },
  {
    id: "party",
    icon: "\u{1F389}",
    name: "Party",
    hint: () => (typeof S > "u" ? "" : (S.life?.partyPlan?.when ?? "")),
  },
];
const pileChip = (chip) => `<span class="mls-h-chip ${escape(chip.kind)}">${escape(chip.text)}</span>`;
const bookSaid = (book) =>
  book.back
    ? `Goes back ${book.back === "today" || book.back === "tomorrow" ? book.back : `on ${book.back}`}`
    : `${book.left} ${book.left === 1 ? "read" : "reads"} left`;
const freshSaid = (pile) =>
  pile.book
    ? bookSaid(pile.book)
    : pile.spoiled
      ? "Spoiled"
      : pile.fresh.text === "TODAY"
        ? "Eat it today"
        : pile.fresh.text === "TOMORROW"
          ? "Eat by tomorrow"
          : `Fresh \xB7 ${pile.fresh.text.toLowerCase()}`;
const pileActs = (pile) =>
  `<div class="mls-h-acts">${pile.acts.map((action) => `<button class="${action.act === "eat" || action.act === "read" ? "main" : ""}" data-do="thing" data-act="${action.act}" data-list="${pile.list}" data-index="${pile.index}" ${action.ok ? "" : "disabled"}>${escape(action.text)}${action.ok ? "" : ` \xB7 ${escape(action.why)}`}</button>`).join("")}</div>`;
const dragAttrs = (pile) =>
  `data-drag data-list="${pile.list}" data-index="${pile.index}" data-home="${pile.home}" data-icon="${escape(pile.icon)}"`;
const pileRow = (pile, picked) => {
  const open = picked?.list === pile.list && picked.index === pile.index;
  return `<div class="mls-h-row ${open ? "on" : ""}" data-do="thing-pick" data-list="${pile.list}" data-index="${pile.index}" ${dragAttrs(pile)}>
      <span class="ic">${escape(pile.icon)}</span><span class="nm">${escape(pile.name)}</span><span class="q">\xD7${pile.n}</span>
      <span class="fresh ${pile.fresh.level}"><span>${escape(pile.fresh.text)}</span><span class="bar"><i style="width:${Math.round(pile.fresh.share * 100)}%"></i></span></span></div>
    ${open ? `<div class="mls-h-detail">${pile.chips.length ? `<div class="chips">${pile.chips.map(pileChip).join("")}</div>` : ""}${pileActs(pile)}</div>` : ""}`;
};
function homeOptionsView(things) {
  return `<div class="mls-h-options"><h2>AT HOME</h2><div class="grid">${HOME_OPTIONS.map(
    (option) => `
    <button class="mls-h-opt" data-do="home-panel" data-id="${option.id}"><span class="ic">${option.icon}</span><b>${option.name}</b>${things && option.tag?.(things) ? `<em class="mls-h-tag">${escape(option.tag(things))}</em>` : ""}${things && option.hint(things) ? `<small>${escape(option.hint(things))}</small>` : ""}</button>`,
  ).join("")}</div></div>`;
}
const HOME_PANELS = {
  fridge: (things, picked) => ({
    title: "FRIDGE",
    sub: "food keeps twice as long here",
    body: things.fridge.length
      ? `<div class="mls-h-rows">${things.fridge.map((pile) => pileRow(pile, picked)).join("")}</div>
      <p class="mls-h-hint">Tap something to eat it, take it with you or throw it away \u2014 or drag it into the backpack.</p>`
      : '<p class="mls-h-hint">Empty. The Supermarket sells food.</p>',
  }),
  closet: (things) => ({
    title: "CLOSET",
    sub: things.clothes
      ? "what you wear goes into every scene, and into your picture"
      : "what you wear goes into every scene",
    body: `<div class="mls-h-outfits ${things.clothes ? "pics" : ""}">${things.closet
      .map(
        (outfit, index) => `<div class="mls-h-ofw">
      <button class="mls-h-of ${outfit.wearing ? "wear" : ""}" style="--r:${TILT[index % 4]}deg" data-do="wear" data-id="${escape(outfit.id)}" ${outfit.wearing ? "disabled" : ""}>
        <span class="ph">${outfit.style ? `<i class="sty">${escape(outfit.style)}</i>` : ""}${
          outfit.pic
            ? `<img src="${escape(outfit.pic)}" alt="">`
            : `${escape(outfit.icon)}${
                things.clothes && outfit.id !== "own"
                  ? paintIcon(
                      S.askedPaint?.has(outfit.id) && !outfit.failed
                        ? "painting"
                        : outfit.failed
                          ? "failed"
                          : "missing",
                      "rack-paint",
                      {
                        id: outfit.id,
                      },
                    )
                  : ""
              }`
        }</span><b>${escape(outfit.name)}</b>${outfit.effect && outfit.effect !== "Style" ? `<small>${escape(outfit.effect)}</small>` : ""}${outfit.wearing ? "" : "<em>WEAR \xB7 10 min</em>"}</button>${
          things.clothes && outfit.id !== "own"
            ? uploadIcon("outfit", {
                item: outfit.id,
              })
            : ""
        }</div>`,
      )
      .join("")}</div>
      <p class="mls-h-hint">More clothes: the Mall's clothes store.</p>`,
  }),
  shelf: (things, picked) => ({
    title: "SHELF",
    sub: "everything that isn't food or clothes",
    body: things.shelf.length
      ? `<div class="mls-h-rows">${things.shelf.map((pile) => pileRow(pile, picked)).join("")}</div>
      <p class="mls-h-hint">What you are not carrying waits here. Drag it into the backpack to take it with you.</p>`
      : `<p class="mls-h-hint">Nothing here. What doesn't fit in your backpack at the till, and what you put away, waits here.</p>`,
  }),
  home: (things) => ({
    title: "YOUR HOME",
    sub: "a better piece does more",
    body: `<div class="mls-h-furn">${Object.values(things.home)
      .map(
        (slot) => `
      <div class="mls-h-fs ${slot.id ? "" : "empty"} ${slot.coming ? "coming" : ""}"><span class="k">${escape(slot.name)}</span><span class="ic">${escape(slot.icon)}</span>
        <span><b>${escape(slot.piece)}</b><span class="eff">${escape(slot.text)}${slot.coming ? ` \xB7 ${escape(slot.coming)} arrives ${escape(slot.comingWhen ?? "tomorrow")}` : ""}</span></span>
        <span class="lvl">${[1, 2, 3].map((level) => `<i class="${level <= slot.level ? "on" : ""}"></i>`).join("")}</span></div>`,
      )
      .join("")}</div>
      <button class="mls-h-shop" data-do="furniture-shop">SHOP FURNITURE \u25B8<small>online \xB7 arrives tomorrow at 09:00</small></button>`,
  }),
};
const COOKED_SAID = {
  burnt: "You burnt it a little. It still fills you up, just half as much.",
  fine: "Not bad at all.",
  great: "It came out delicious! More energy, and you'll stay full for longer.",
};
function cookedView(cooked, things) {
  const portion = things.fridge.find((pile) => pile.id === cooked.dish && !pile.spoiled),
    portions = things.fridge
      .filter((pile) => pile.id === cooked.dish && !pile.spoiled)
      .reduce((pile, other) => pile + other.n, 0);
  return `<div class="mls-h-cooked ${cooked.quality} ${cooked.fresh ? "fresh" : ""}">${cooked.fresh && cooked.quality === "great" ? '<i class="spark k1">\u2726</i><i class="spark k2">\u2726</i><i class="spark k3">\u2726</i>' : ""}${cooked.fresh && cooked.quality === "burnt" ? '<i class="smoke"></i>' : ""}
      <div class="top"><span class="ic">${escape(cooked.icon ?? "\u{1F37D}")}</span><div><b>${escape(cooked.name)}</b><small>${escape(COOKED_SAID[cooked.quality] ?? "")}</small></div></div>
      <div class="chips"><span class="mls-h-chip gain">+${cooked.gains?.cooking ?? 0} Cooking</span>${(cooked.levelled ?? []).map((level) => `<span class="mls-h-chip gain">You reached Cooking ${level.to}!</span>`).join("")}
        <span class="mls-h-chip">${portions} ${portions === 1 ? "portion" : "portions"} in your fridge</span></div>
      ${
        portion
          ? `<div class="acts"><button class="mls-set-btn" data-do="thing-eat" data-list="fridge" data-index="${portion.index}">EAT ONE NOW<small>${escape(String(portion.minutes ?? 15))} min</small></button>
        <button class="mls-set-btn soft" data-do="cooked-pack" data-index="${portion.index}">PACK ONE TO GO</button>
        <button class="mls-set-btn soft" data-do="cooked-done">DONE</button></div>`
          : '<div class="acts"><button class="mls-set-btn soft" data-do="cooked-done">DONE</button></div>'
      }
    </div>`;
}
const KITCHEN_GROUPS = [
  ["now", "READY TO COOK", (recipe) => recipe.available],
  ["time", "TAKES TOO LONG", (recipe) => recipe.tooLong],
  ["missing", "MISSING INGREDIENTS", (recipe) => !recipe.available && !recipe.tooLong && recipe.need === "missing"],
  ["kitchen", "NEEDS A BETTER KITCHEN", (recipe) => !recipe.available && !recipe.tooLong && recipe.need === "kitchen"],
  ["home", "ONLY AT HOME", (recipe) => !recipe.available && !recipe.tooLong && recipe.need === "home"],
  ["later", "LOCKED", (recipe) => recipe.locked],
];
const FLAVOUR = {
  sweet: "something sweet",
  savory: "savory food",
  spicy: "spicy food",
  healthy: "healthy food",
  comfort: "comfort food",
  fancy: "something fancy",
};
const shareOf = (share) => `${Math.round((share ?? 0) * 100)}%`;
const COOK_PHASE_SAID = {
  burnt: "BURNT",
  fine: "READY!",
  great: "DELICIOUS!",
};
function cookPopView(cook) {
  const done = cook.done ?? {},
    finished = cook.phase === "done",
    picture = cook.cut ?? cook.avatar,
    otherHtml = cook.other?.avatar
      ? `<div class="mc other"><img src="${escape(cook.other.avatar)}" alt="" draggable="false"></div>`
      : "";
  return `<div class="mls-k-veil" data-do="cook-pop"><div class="mls-k-scene ${cook.cut ? "cut" : "framed"} ${finished ? "done" : "cooking"} ${otherHtml ? "two" : ""}" style="--ms:${cook.ms}ms">
      <div class="mc">${picture ? `<img src="${escape(picture)}" alt="" draggable="false">` : '<span class="ic">\u{1F9D1}\u200D\u{1F373}</span>'}</div>
      <div class="mls-k-pop ${finished ? `done ${done.quality}` : "cooking"}">
        <div class="pot"><span class="ic">${escape(cook.icon ?? "\u{1F373}")}</span>${finished ? (done.quality === "great" ? '<i class="spark k1">\u2726</i><i class="spark k2">\u2726</i><i class="spark k3">\u2726</i>' : done.quality === "burnt" ? '<i class="smoke"></i>' : "") : '<i class="steam s1"></i><i class="steam s2"></i><i class="steam s3"></i>'}</div>
        ${finished ? `<em class="said">${COOK_PHASE_SAID[done.quality] ?? "READY!"}</em><b class="nm">${escape(done.name ?? cook.name)}</b><small>${cook.forName ? `${cook.together ? "Made with" : cook.meal === "lunch" ? "Lunch for" : "Dinner for"} ${escape(cook.forName)}` : `${done.portions ?? 1} ${done.portions === 1 ? "portion" : "portions"} in your fridge`}</small>` : `<b class="nm">${escape(cook.name)}</b><div class="bar"><b></b></div><small>${cook.minutes} min on the stove</small>`}
      </div>
    ${otherHtml}</div></div>`;
}
function fridgeStrip(things) {
  const ingredientIds = new Set((things.recipes ?? []).flatMap((recipe) => (recipe.uses ?? []).map((use) => use.id))),
    counts = new Map(),
    addPile = (pile, source) => {
      if (pile.spoiled || (source === "bag" && !ingredientIds.has(pile.id))) {
        return;
      }
      const entry = counts.get(pile.id) ?? {
        name: pile.name,
        icon: pile.icon,
        n: 0,
        bag: 0,
        ingredient: ingredientIds.has(pile.id),
      };
      entry.n += pile.n;
      if (source === "bag") {
        entry.bag += pile.n;
      }
      counts.set(pile.id, entry);
    };
  (things.fridge ?? []).forEach((pile) => addPile(pile, "fridge"));
  (things.bag?.piles ?? []).forEach((pile) => addPile(pile, "bag"));
  const entries = [...counts.values()].sort((left, right) => Number(right.ingredient) - Number(left.ingredient)),
    chip = (entry) =>
      `<span class="chip ${entry.ingredient ? "" : "dish"}">${escape(entry.icon ?? "")} ${escape(entry.name)} <b>\xD7${entry.n}</b>${entry.bag ? `<small>${entry.bag === entry.n ? "in your backpack" : `${entry.bag} in your backpack`}</small>` : ""}</span>`;
  return `<h4 class="mls-rack-sec">YOUR FRIDGE</h4><div class="mls-k-fridge">${entries.length ? entries.map(chip).join("") : '<span class="none">Empty</span>'}</div>`;
}
function kitchenView({
  life: life,
  things: things,
  pick = null,
  cooked = null,
  cooking = null,
  said = "",
  error = "",
  forWhom = null,
}) {
  if (!things) {
    return '<div class="mls-shop mls-rack mls-kitchen"><p class="hint">Loading\u2026</p></div>';
  }
  const cookingNow = things.cookingNow ?? {
      level: things.cooking ?? 0,
      progress: 0,
    },
    guest = forWhom,
    recipes = (things.recipes ?? []).map((recipe) =>
      guest && recipe.available && recipe.minutes > (guest.left ?? 1 / 0)
        ? {
            ...recipe,
            available: false,
            tooLong: true,
            why: guest.with
              ? `${guest.name} can't stay that long`
              : guest.meal === "lunch"
                ? "Takes too long"
                : "Takes too long for tonight",
          }
        : recipe,
    ),
    tasteFor = (recipe) =>
      guest
        ? guest.likes?.includes(recipe.taste)
          ? "likes"
          : guest.dislikes?.includes(recipe.taste)
            ? "dislikes"
            : ""
        : "",
    nextLevel = Math.min(...recipes.filter((recipe) => recipe.level > cookingNow.level).map((recipe) => recipe.level)),
    nextDishes = recipes
      .filter((recipe) => recipe.level === nextLevel)
      .map((recipe) => recipe.name.toLowerCase())
      .join(" and "),
    picked =
      recipes.find((recipe) => recipe.id === pick) ??
      (guest && recipes.find((recipe) => recipe.available && recipe.portions >= 2)) ??
      recipes.find((recipe) => recipe.available) ??
      recipes[0],
    recipeButton = (recipe) => `
    <button class="mls-of ${recipe === picked ? "on" : ""} ${recipe.available ? "" : "no"}" data-do="kitchen-pick" data-id="${escape(recipe.id)}">
      <span class="fr"><span class="ic">${escape(recipe.icon ?? "\u{1F37D}")}</span></span><b>${escape(recipe.name)}</b>
      <span class="meta">${recipe.minutes} min \xB7 ${recipe.portions} ${recipe.portions === 1 ? "portion" : "portions"}</span>
      ${tasteFor(recipe) ? `<span class="taste ${tasteFor(recipe) === "likes" ? "good" : "bad"}">${tasteFor(recipe) === "likes" ? "\u2665" : "\u2715"} ${escape(guest.name)} ${tasteFor(recipe) === "likes" ? "likes" : "doesn't like"} ${escape(FLAVOUR[recipe.taste] ?? recipe.taste)}</span>` : ""}
      ${recipe.available ? "" : `<span class="why">${escape(recipe.why)}</span>`}</button>`,
    shown = picked,
    detail = shown
      ? `
      <div class="big"><span class="ic">${escape(shown.icon ?? "\u{1F37D}")}</span></div>
      <b class="nm">${escape(shown.name)}</b>
      <p class="desc">${guest ? `Takes ${shown.minutes} min \xB7 ${escape(FLAVOUR[shown.taste] ?? shown.taste)} \xB7 ${shown.portions >= 2 ? `${guest.with || guest.together ? "enough for both" : `${guest.meal ?? "dinner"} for two`}${shown.portions > 2 ? `, and ${shown.portions - 2} left over` : ""}` : `only enough for ${escape(guest.name)}`}` : `Takes ${shown.minutes} min \xB7 makes ${shown.portions} ${shown.portions === 1 ? "portion" : "portions"}${shown.sweet ? " \xB7 dessert" : ""}`}</p>
      <div class="mls-k-uses">${shown.uses.map((use) => `<div class="${use.have >= use.n ? "ok" : "short"}"><span>${escape(use.icon ?? "")} ${escape(use.name)}</span><span>you have ${use.have}${use.have >= use.n ? " \u2713" : ""}</span></div>`).join("")}</div>
      <div class="chips"><span class="chip">Each portion</span><span class="chip gain">+${shown.eat.hunger} Hunger</span>${shown.eat.energy ? `<span class="chip gain">+${shown.eat.energy} Energy</span>` : ""}</div>
      ${shown.locked ? "" : `<small class="see">At Cooking ${cookingNow.level}, it burns ${shareOf(cookingNow.burnt)} of the time and turns out delicious ${shareOf(cookingNow.great)} of the time.</small>`}
      ${guest ? `<button class="buy" data-do="cook-for" data-id="${escape(shown.id)}" ${shown.available ? "" : "disabled"}>${guest.with || guest.together ? "COOK TOGETHER" : `COOK FOR ${escape(guest.name.toUpperCase())}`}<small>${shown.available ? `${shown.minutes} min \xB7 ${shown.portions >= 2 ? "you eat together" : "just for them"}` : escape(shown.why)}</small></button>` : `<button class="buy" data-do="cook" data-id="${escape(shown.id)}" ${shown.available ? "" : "disabled"}>COOK<small>${shown.available ? `${shown.minutes} min \xB7 it goes in your fridge` : escape(shown.why)}</small></button>`}`
      : "";
  return `
    <div class="mls-shop mls-rack mls-kitchen">
      ${life?.backdrop?.here ? `<div class="behind" style="background-image:url('${escape(life.backdrop.here)}')"></div>` : '<div class="behind"></div>'}
      <div class="head">
        <button class="mls-back flat" data-do="kitchen-back">\u25C2 ${guest ? `BACK TO ${escape(guest.name.toUpperCase())}` : "HOME"}</button>
        ${life?.hud ? placeHud(life.hud) : ""}
        <h1>KITCHEN</h1>
        <div class="where">
          ${guest ? `<span class="on">Cooking ${guest.with ? "with" : "for"} ${escape(guest.name)}<small>${guest.likes?.length ? `${escape(guest.name)} likes ${escape(guest.likes.map((taste) => FLAVOUR[taste] ?? taste).join(" and "))}` : `You don't know what ${escape(guest.name)} likes yet`}</small>${guest.dislikes?.length ? `<small>Doesn't like ${escape(guest.dislikes.map((taste) => FLAVOUR[taste] ?? taste).join(" or "))}</small>` : ""}</span>` : `<span class="on">${escape(things.home?.kitchen?.id ? things.home.kitchen.piece : "No kitchen")}${things.kitchen >= 2 ? "<small>Cooks anything</small>" : things.kitchen ? "<small>Simple dishes only</small><small>A stove unlocks the rest</small>" : "<small>Buy one online</small>"}</span>`}
          <span class="mls-k-skill">Cooking ${cookingNow.level}<i class="bar"><b style="width:${cookingNow.needsForNext ? Math.round((cookingNow.progress ?? 0) * 100) : 100}%"></b></i>${nextDishes ? `<small>Next up: ${escape(nextDishes)}</small>` : ""}</span>
        </div>
      </div>
      <div class="cat">
        ${error ? `<div class="mls-said bad">${escape(error)}</div>` : said ? `<div class="mls-said">${escape(said)}</div>` : ""}
        ${fridgeStrip(things)}
        ${KITCHEN_GROUPS.map(([groupId, groupTitle, test]) => {
          const matches = recipes.filter(test);
          return matches.length
            ? `<h4 class="mls-rack-sec">${groupTitle}</h4><div class="mls-rack-list">${matches.map(recipeButton).join("")}</div>`
            : "";
        }).join("")}
      </div>
      <aside class="mls-fit">${cooked ? cookedView(cooked, things) : detail}</aside>
      ${cooking ? cookPopView(cooking) : ""}
    </div>`;
}
function homePanelView({ panel: panel, things: things, pick = null, said = "", error = "" }) {
  if (!things || !HOME_PANELS[panel]) {
    return '<div class="mls-h-panel"><p class="mls-h-hint">\u2026</p></div>';
  }
  const view = HOME_PANELS[panel](things, pick);
  return `<div class="mls-h-panel">
    <div class="mls-h-head"><button class="mls-back flat" data-do="home-panel" data-id="">\u25C2 HOME</button><h2>${view.title}</h2><small>${escape(view.sub)}</small></div>
    ${error ? `<div class="mls-said bad">${escape(error)}</div>` : said ? `<div class="mls-said">${escape(said)}</div>` : ""}
    ${panel === "fridge" || panel === "shelf" ? '<div class="mls-h-zone bagzone" data-drop="bag"><b>\u{1F392} BACKPACK</b><small class="why">drop it here to take it with you</small></div>' : ""}
    ${view.body}</div>`;
}
function backpackView({ things: things, pick = null, said = "", error = "" }) {
  if (!things) {
    return "";
  }
  const piles = things.bag.piles,
    picked = pick?.list === "bag" ? piles[pick.index] : null;
  return `<div class="mls-bag-veil" data-do="bag-close">
    <div class="mls-bag">
      <div class="mls-bag-head"><h2>BACKPACK</h2><small>${piles.length} / ${things.bag.slots}</small><button class="x" data-do="bag-close">\u2715</button></div>
      <div class="mls-bag-slots">${piles.map((pile) => `<div class="slot ${picked === pile ? "on" : ""}" data-do="thing-pick" data-list="bag" data-index="${pile.index}" ${dragAttrs(pile)}>${escape(pile.icon)}${pile.fresh.level !== "keeps" && !(pile.book && !pile.book.back) ? `<span class="f ${pile.fresh.level}"></span>` : ""}${pile.n > 1 ? `<span class="n">\xD7${pile.n}</span>` : ""}</div>`).join("")}${Array.from(
        {
          length: Math.max(0, things.bag.slots - piles.length),
        },
        () => '<div class="slot empty"></div>',
      ).join("")}</div>
      ${
        picked
          ? `<div class="mls-h-detail light"><b>${escape(picked.name)}${picked.n > 1 ? ` \xD7${picked.n}` : ""}</b>
        <div class="chips">${picked.chips.map(pileChip).join("")}${picked.fresh.level !== "keeps" ? `<span class="mls-h-chip ${picked.spoiled ? "" : "fresh"}">${escape(freshSaid(picked))}</span>` : ""}</div>${pileActs(picked)}</div>`
          : `<p class="mls-h-hint">${piles.length ? "Tap something to eat it or throw it away." : "Empty. What you buy in the Supermarket goes here."} Up to ${BAG_PILE} of the same thing fit in one space.</p>`
      }
      ${
        things.atHome
          ? `<div class="mls-h-zones">
        <div class="mls-h-zone" data-drop="fridge"><b>\u{1F9CA} FRIDGE</b><small class="why">food</small></div>
        <div class="mls-h-zone" data-drop="shelf"><b>\u{1F4E6} SHELF</b><small class="why">everything else</small></div></div>
        <p class="mls-h-hint">At home: drag something onto the fridge or the shelf to put it away.</p>`
          : ""
      }
      ${error ? `<div class="mls-said bad">${escape(error)}</div>` : said ? `<div class="mls-said">${escape(said)}</div>` : ""}
    </div></div>`;
}
const RACK_SECTIONS = [
  ["wedding", "WEDDING"],
  ["casual", "CASUAL"],
  ["sport", "SPORT"],
  ["formal", "FORMAL"],
  ["smart", "FASHION"],
];
function opinionView(opinion, writing) {
  const verdictText =
      opinion.verdict === "likes"
        ? "Likes it on you."
        : opinion.verdict === "dislikes"
          ? "Not their style."
          : "It's alright on you.",
    chip = opinion.again
      ? ""
      : opinion.effect
        ? `<span class="chip gain">+1 ${opinion.effect === "romance" ? "Romance" : "Friendship"}</span>`
        : opinion.verdict === "dislikes"
          ? '<span class="chip">not their style \xB7 nothing changes</span>'
          : "";
  return `<div class="mls-opinion ${opinion.verdict}" style="--c:${colourFor(opinion.id)}">
      <span class="mls-serve-face">${opinion.avatar ? frameImg(opinion) : escape((opinion.name ?? "?")[0])}</span>
      <div><b>${escape(opinion.name.toUpperCase())}</b>${opinion.line ? `<p>\u201C${escape(opinion.line)}\u201D</p>` : writing ? '<p class="writing">\u2026</p>' : `<p class="said">${verdictText}</p>`}${chip}</div>
    </div>`;
}
const markChip = (mark) => `<span class="chip likes">${escape(mark.text)}</span>`;
function rackView({ life: life, rack: rack, pick = null, said = "", error = "", till = null }) {
  if (!rack) {
    return '<div class="mls-shop mls-rack"><p class="hint">Loading\u2026</p></div>';
  }
  const outfits = rack.outfits,
    picked = outfits.find((outfit) => outfit.id === pick) ?? outfits[0],
    paintState = rack.paint ?? {},
    canPaint = rack.clothes && rack.connection,
    paintStatus = (outfit) =>
      paintState.painting === outfit.id || paintState.queued?.includes(outfit.id)
        ? "painting"
        : outfit.failed
          ? "failed"
          : "missing",
    outfitPic = (outfit, size = "") =>
      outfit.pic
        ? `<img src="${escape(outfit.pic)}" alt="">`
        : `<span class="ic">${escape(outfit.icon)}</span>${
            canPaint
              ? paintIcon(
                  paintStatus(outfit),
                  "rack-paint",
                  {
                    id: outfit.id,
                  },
                  size,
                )
              : ""
          }`,
    ready = outfits.filter((outfit) => outfit.pic).length,
    queued = outfits.filter((outfit) => paintState.queued?.includes(outfit.id)).length,
    painting = outfits.find((outfit) => outfit.id === paintState.painting),
    strip = rack.clothes
      ? rack.connection
        ? `<div class="mls-rack-strip"><b>PICTURES OF YOU</b><span>${ready} of ${outfits.length} ready</span>${painting ? `<span class="on">painting ${escape(painting.name)}</span>` : ""}${queued ? `<span>${queued} in line</span>` : ""}${(queued || painting) && paintState.ahead ? `<span class="warn">backgrounds go first \xB7 ${paintState.ahead} waiting</span>` : ""}</div>`
        : '<div class="mls-rack-strip off">No image connection (TOWN LOOK or SETTINGS \xB7 MODEL \xB7 IMAGES): each outfit shows as its icon and its words.</div>'
      : '<div class="mls-rack-strip off">The Clothes rule is off (SETTINGS \xB7 RULES): each outfit shows as its icon.</div>',
    outfitButton = (outfit, index) => `
    <button class="mls-of ${outfit === picked ? "on" : ""} ${outfit.wearing ? "wear" : ""}" style="--r:${TILT[index % 4]}deg" data-do="rack-pick" data-id="${escape(outfit.id)}">
      ${outfit.isNew ? '<span class="badge">NEW</span>' : ""}${outfit.owned ? `<span class="own">${outfit.wearing ? "WEARING" : "YOURS"}</span>` : ""}
      <span class="fr">${outfitPic(outfit)}</span><b>${escape(outfit.name)}</b><span class="price">${outfit.was ? `<s>$${outfit.was}</s> ` : ""}$${outfit.price}</span>
      ${outfit.marks?.length ? `<div class="chips">${markChip(outfit.marks[0])}${outfit.marks.length > 1 ? `<span class="chip">+${outfit.marks.length - 1}</span>` : ""}</div>` : ""}</button>`,
    shown = picked,
    fitting = shown && rack.fitting?.item === shown.id ? rack.fitting : null,
    fittingWho = rack.fittingWho ?? [],
    fittingHtml = fitting
      ? `<div class="mls-fitting"><h4>WHAT THEY THINK${fitting.opinions.every((opinion) => opinion.again) ? " \xB7 they already told you" : ""}</h4>${fitting.opinions.map((opinion) => opinionView(opinion, fitting.writing)).join("")}</div>`
      : shown && fittingWho.length
        ? `<button class="buy soft mls-try" data-do="rack-try" data-id="${escape(shown.id)}">TRY IT ON<small>10 min \xB7 ${escape(fittingWho.map((person) => person.name).join(" and "))} will say what they think</small></button>`
        : "";
  return `
    <div class="mls-shop mls-rack">
      ${life?.backdrop?.here ? `<div class="behind" style="background-image:url('${escape(life.backdrop.here)}')"></div>` : '<div class="behind"></div>'}
      <div class="head">
        <button class="mls-back flat" data-do="rack-back">\u25C2 ${escape(rack.store.name.toUpperCase())}</button>
        <h1>FITTING ROOM</h1>
        <div class="money"><small>CASH</small>$${rack.cash}</div>
      </div>
      <div class="cat">
        ${counterStrip(rack.counter)}
        ${strip}
        ${error ? `<div class="mls-said bad">${escape(error)}</div>` : said && !till ? `<div class="mls-said">${escape(said)}</div>` : ""}
        ${RACK_SECTIONS.map(([sectionId, sectionTitle]) => {
          const inSection = outfits.filter((outfit) => (outfit.section ?? "casual") === sectionId);
          return inSection.length
            ? `<h4 class="mls-rack-sec">${sectionTitle}</h4><div class="mls-rack-list">${inSection.map((outfit) => outfitButton(outfit, outfits.indexOf(outfit))).join("")}</div>`
            : "";
        }).join("")}
      </div>
      ${
        shown
          ? `<aside class="mls-fit">
        <div class="big">${outfitPic(shown, "big")}${
          rack.clothes
            ? `${
                shown.own && rack.connection
                  ? paintIcon(
                      "missing",
                      "rack-paint",
                      {
                        id: shown.id,
                      },
                      "big",
                    )
                  : ""
              }${uploadIcon(
                "outfit",
                {
                  item: shown.id,
                },
                "big",
              )}`
            : ""
        }${shown.pic && !shown.own && canPaint ? (paintStatus(shown) === "painting" ? '<span class="mls-fit-redo busy">PAINTING\u2026</span>' : `<button class="mls-fit-redo" data-do="rack-paint" data-id="${escape(shown.id)}" title="Paint this picture again">${shown.failed ? "THE NEW ONE DIDN'T COME OUT \xB7 \u21BB TRY AGAIN" : "\u21BB REDO"}</button>`) : ""}</div>
        <b class="nm">${escape(shown.name)}${shown.isNew ? " \u2726" : ""}</b>
        <p class="desc">${escape(shown.text.charAt(0).toUpperCase() + shown.text.slice(1))}.</p>
        ${shown.marks?.length ? `<div class="chips">${shown.marks.map(markChip).join("")}</div>` : ""}
        ${fittingHtml}
        ${rack.clothes ? '<small class="see">What the others see you wearing.</small>' : ""}
        ${shown.effect ? `<div class="chips"><span class="chip gain">${escape(shown.effect)}</span></div>` : ""}
        ${
          shown.owned
            ? `<div class="owned">IN YOUR CLOSET</div>${shown.wearing ? "" : `<button class="buy" data-do="rack-wear" data-id="${escape(shown.id)}">WEAR IT NOW<small>you change here \xB7 10 min</small></button>`}`
            : `<button class="buy" data-do="rack-buy" data-id="${escape(shown.id)}" ${shown.canBuy ? "" : "disabled"}>BUY \xB7 ${shown.was ? `<s>$${shown.was}</s> ` : ""}$${shown.price}<small>${shown.canBuy ? "it goes to your closet \xB7 5 min at the till" : escape(shown.why)}</small></button>
             <button class="buy soft" data-do="rack-buy" data-wear="1" data-id="${escape(shown.id)}" ${shown.canBuy ? "" : "disabled"}>BUY AND WEAR IT<small>you change here \xB7 15 min</small></button>`
        }
        ${till && till.item === shown.id ? tillView(till) : ""}
      </aside>`
          : ""
      }
    </div>`;
}
function clothesReviewView(review) {
  const loading = review.loading;
  return `<div class="mls-ask-veil"><div class="mls-ask mls-split">
    <b>Your look, in two</b>
    <small>${loading ? "Reading your persona's look\u2026" : review.empty ? "Your persona has no look written yet: write both parts." : "Your body stays as it is; what you wear changes with your clothes. Fix anything that landed on the wrong side."}</small>
    ${review.error ? `<div class="mls-said bad">${escape(review.error)}</div>` : ""}
    <label class="f">APPEARANCE<small>body, face, hair \xB7 never changes</small><textarea data-clothes-f="appearance" rows="6" ${loading ? "disabled" : ""}>${escape(review.appearance)}</textarea></label>
    <label class="f">WEARING NOW<small>becomes \xABYour own clothes\xBB in the closet</small><textarea data-clothes-f="wearing" rows="3" ${loading ? "disabled" : ""}>${escape(review.wearing)}</textarea></label>
    <div class="row"><button class="main" data-do="clothes-ok" ${loading ? "disabled" : ""}>SAVE</button><button data-do="clothes-no">CANCEL</button></div>
  </div></div>`;
}
function askView(ask) {
  if (!ask) {
    return "";
  }
  const where = ask.zone === "bag" ? "into your backpack" : ask.zone ? `into the ${ask.zone}` : "";
  return `<div class="mls-ask-veil" data-do="ask-no"><div class="mls-ask">
    <b>${escape(ask.icon)} ${ask.kind === "throw" ? "Throw away" : "Move"} ${escape(ask.name)}${ask.kind === "throw" ? "?" : ` ${where}`}</b>
    <small>${ask.kind === "throw" ? (ask.spoiled ? "It has gone off. It is gone for good." : "It is gone for good.") : "How many?"}</small>
    ${
      ask.max > 1
        ? `<div class="count"><button data-do="ask-n" data-id="-1">\u2212</button><span>${ask.n} / ${ask.max}</span><button data-do="ask-n" data-id="+1">+</button>
      <button data-do="ask-n" data-id="one">1</button><button data-do="ask-n" data-id="all">ALL</button></div>`
        : ""
    }
    <div class="row"><button class="main" data-do="ask-ok">${ask.kind === "throw" ? "THROW AWAY" : "MOVE"}${ask.max > 1 ? ` \xD7${ask.n}` : ""}</button><button data-do="ask-no">CANCEL</button></div>
  </div></div>`;
}

export { askView, backpackView, clothesReviewView, homeOptionsView, homePanelView, kitchenView, rackView, shopView };
