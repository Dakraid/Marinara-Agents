// Gacha Forge ships pre-built bundles whose source tree lives outside this repository, so this proof
// reads the committed bundles: it runs the shipped location-ID code (Pasta-Devs/Marinara-Agents#1460)
// and pins the iPhone landscape layout rules (Pasta-Devs/Marinara-Agents#1461), the sideways-phone world
// creator and the 16px touch field floor (1.8.14), and the cast and outfit theme lists keeping their place
// when ticked (1.8.15), so a later bundle drop cannot lose a fix silently.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const packageRoot = new URL("../packages/gacha-forge/", import.meta.url);
const server = await readFile(new URL("server.mjs", packageRoot), "utf8");
const client = await readFile(new URL("client.js", packageRoot), "utf8");

// Cuts one top-level `function name(...){...}` out of a minified bundle by balancing braces.
function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist in the bundle`);
  assert.equal(source.indexOf(`function ${name}(`, start + 1), -1, `${name} must be defined once`);
  let depth = 0;
  for (let index = source.indexOf("{", start); index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${name} is not closed`);
}

const serverSource = ["gs", "ir", "bgSlug", "gsPlaces"].map((name) => extractFunction(server, name)).join("\n");
const serverFns = vm.runInNewContext(`${serverSource}\n({ gs, ir, bgSlug, gsPlaces })`);
const clientSlug = vm.runInNewContext(`${extractFunction(client, "oc")}\noc`);

// The client and the server must derive the same ID from the same name, or the client looks up a
// background the server filed under another key.
assert.equal(
  extractFunction(client, "oc")
    .replace(/^function oc\(t\)/u, "")
    .replaceAll("t??", "e??"),
  extractFunction(server, "gs").replace(/^function gs\(e\)/u, ""),
  "client oc() and server gs() must be the same normalization",
);

// Every ASCII name keeps exactly the ID it had before, so existing backgrounds and saves still match.
const legacySlug = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
let seed = 1460;
const random = () => {
  seed = (seed * 1103515245 + 12345) % 2 ** 31;
  return seed / 2 ** 31;
};
const asciiSamples = ["", "  ", "Moon Forest", "  Crystal  Cave #2 ", "--edge--", "a".repeat(59) + " b", "A/B\\C..D"];
for (let sample = 0; sample < 4000; sample += 1) {
  let text = "";
  const length = Math.floor(random() * 90);
  for (let index = 0; index < length; index += 1) text += String.fromCharCode(Math.floor(random() * 128));
  asciiSamples.push(text);
}
for (const name of asciiSamples) {
  assert.equal(serverFns.gs(name), legacySlug(name), `server ID changed for ASCII ${JSON.stringify(name)}`);
  assert.equal(clientSlug(name), legacySlug(name), `client ID changed for ASCII ${JSON.stringify(name)}`);
}

// Names the ASCII-only rule emptied or cut down now keep their letters.
const unicodeCases = new Map([
  ["달빛 숲", "달빛-숲"],
  ["수정 동굴", "수정-동굴"],
  ["숲 1", "숲-1"],
  ["동굴 1", "동굴-1"],
  ["Château Rouge", "château-rouge"],
  ["月の神殿", "月の神殿"],
  ["Лунный лес", "лунный-лес"],
  ["काला महल", "काला-महल"],
  ["किला महल", "किला-महल"],
]);
for (const [name, slug] of unicodeCases) {
  assert.equal(serverFns.gs(name), slug, `server ID for ${name}`);
  assert.equal(clientSlug(name), slug, `client ID for ${name}`);
}
// Decomposed input (Hangul jamo, e plus a combining accent) files under the composed ID.
assert.equal(serverFns.gs("달빛 숲".normalize("NFD")), "달빛-숲");
assert.equal(clientSlug("Café"), "café");
// The fold used for fuzzy matching no longer empties Hangul either.
assert.equal(serverFns.ir("달빛 숲"), "달빛-숲");
assert.equal(serverFns.ir("Château Rouge"), "chateau-rouge");

// The 60-character cap counts code points and never leaves half of a surrogate pair.
const astral = "\u{20000}".repeat(70);
for (const slug of [serverFns.gs(astral), clientSlug(astral)]) {
  assert.equal(Array.from(slug).length, 60);
  assert.equal(slug, "\u{20000}".repeat(60));
  assert.doesNotMatch(slug, /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/u);
}

// An ID never carries a path separator, a dot pair or a control character.
for (const name of ["../../etc/passwd", "a\\b", "x\u0000y\u001f", "\u0085\u007f", "..", "달빛/숲"]) {
  assert.doesNotMatch(serverFns.gs(name), /[/\\]|\.\.|\p{Cc}/u, `gs(${JSON.stringify(name)})`);
}

// The background endpoint accepts Unicode IDs and refuses a slug that tries to carry one of those.
assert.match(server, /i=bgSlug\(u\.slug,u\.name\);if\(!o\|\|!i\)return\{ok:!1,error:"bad-request"\}/u);
assert.equal(serverFns.bgSlug("달빛-숲", "달빛 숲"), "달빛-숲");
assert.equal(serverFns.bgSlug("", "달빛 숲"), "달빛-숲");
assert.equal(serverFns.bgSlug(undefined, "Moon Forest"), "moon-forest");
assert.equal(serverFns.bgSlug("moon-forest", ""), "moon-forest");
for (const slug of ["../x", "a/b", "a\\b", "..", "x\u0000", "x\u001b[0m", "x\u009b"]) {
  assert.equal(serverFns.bgSlug(slug, "Moon Forest"), "", `slug ${JSON.stringify(slug)} must be refused`);
}
assert.equal(serverFns.bgSlug("", ""), "");

// Backgrounds filed under the old lossy ID are still found by the new one, and a name that once
// collided with another under the old rule does not inherit its background.
assert.match(server, /return\{doc:u,places:gsPlaces\(u&&u\.data&&u\.data\.places\|\|\{\}\)\}/u);
const stored = {
  "ch-teau-rouge": { name: "Château Rouge", url: "/a.png" },
  1: { name: "숲 1", url: "/b.png" },
  "moon-forest": { name: "Moon Forest", url: "/c.png" },
  "달빛-숲": { name: "달빛 숲", url: "/d.png" },
  odd: { name: "달빛 숲", url: "/e.png" },
};
const storedBefore = structuredClone(stored);
const places = serverFns.gsPlaces(stored);
assert.equal(places["château-rouge"], stored["ch-teau-rouge"]);
assert.equal(places["ch-teau-rouge"], stored["ch-teau-rouge"]);
assert.equal(places["숲-1"], stored[1]);
assert.equal(places["동굴-1"], undefined);
assert.equal(places["달빛-숲"], stored["달빛-숲"], "an alias never replaces a key already filed");
assert.deepEqual(stored, storedBefore, "the stored document is not changed");

// iPhone landscape (#1461): the frame fits the visible screen, keeps clear of the notch when it
// covers the screen, gives a short landscape screen every pixel, and keeps the type at its size.
const css = (pattern, label) => assert.match(client, pattern, label);
css(/max-height: 100vh;\s*max-height: 100dvh;/u, "the arena caps at 100dvh with a 100vh fallback first");
css(
  /:host\(:fullscreen\) \.gf-arena \{ padding: env\(safe-area-inset-top\) env\(safe-area-inset-right\) env\(safe-area-inset-bottom\) env\(safe-area-inset-left\); \}/u,
  "fullscreen keeps clear of the safe areas",
);
css(
  /\.gf-arena, \.gf-arena \* \{ -webkit-text-size-adjust: 100%; text-size-adjust: 100%; \}/u,
  "no landscape text inflation",
);
const shortLandscape = /@media \(orientation: landscape\) and \(max-height: 500px\) \{([^}]*\}[^}]*\})\s*\}/gu;
const blocks = [...client.matchAll(shortLandscape)].map((match) => match[1]);
assert.ok(
  blocks.some(
    (block) =>
      /\.gf-arena \{ padding: 0; \}/u.test(block) && /\.gf-stage \{ border: 0; box-shadow: none; \}/u.test(block),
  ),
);
assert.ok(
  blocks.some((block) => /\.st-plate \{ padding:/u.test(block)),
  "settings plates tighten in a short landscape",
);
// A fullscreen toggle the browser cannot honour (iPhone Safari) is removed instead of doing nothing.
css(
  /s=typeof this\.requestFullscreen=="function"&&document\.fullscreenEnabled!==!1;/u,
  "fullscreen support is checked",
);
css(/r&&\(s\?r\.addEventListener\("click",e\):r\.remove\(\)\)/u, "unsupported fullscreen toggles are removed");

// One stylesheet out of the bundle: the template literal assigned to `name`.
function sheet(name) {
  const match = new RegExp(`[^\\w$]${name}=\``, "u").exec(client);
  assert.ok(match, `${name} must be a stylesheet in the bundle`);
  const start = match.index + match[0].length;
  return client.slice(start, client.indexOf("`", start));
}
// The body of every `@media <query> { ... }` in a stylesheet, balanced on braces.
function mediaBlocks(source, query) {
  const found = [];
  for (let at = source.indexOf(`@media ${query} {`); at !== -1; at = source.indexOf(`@media ${query} {`, at + 1)) {
    let depth = 0;
    for (let index = source.indexOf("{", at); index < source.length; index += 1) {
      if (source[index] === "{") depth += 1;
      if (source[index] === "}" && --depth === 0) {
        found.push(source.slice(source.indexOf("{", at) + 1, index));
        break;
      }
    }
  }
  return found;
}

// World creation on a phone held sideways (1.8.14). The creator's sheet is inlined in the view, in the
// same shadow root as the stage, so its :has() can widen the stage; a nested root would hide the stage.
css(/e==="setup"\)x=`<style>\$\{Oh\}<\/style>\$\{Fh\(/u, "the creator's sheet is mounted inside the view");
css(/this\._root\.innerHTML=`<style>\$\{mc\}[^`]*<\/style>`\+vc\(x\+/u, "the view renders inside the shell's stage");
const setupSheet = sheet("Oh");
const wizard = mediaBlocks(setupSheet, "(orientation: landscape) and (max-height: 500px)");
assert.equal(wizard.length, 1, "the creator has one short-landscape block");
for (const [pattern, label] of [
  [/\.gf-stage:has\(\.ob-root\) \{ width: 100%; \}/u, "the stage takes the arena's whole width"],
  [/\.ob-frame \{ display: block;[^}]*overflow-y: auto;/u, "the frame is the one scroll region"],
  [/\.ob-intake \{ width: 100%; min-height: 100%; max-height: none;/u, "the intake grows with its fields"],
  [/\.ob-step \.ob-grid \{ flex: none; overflow: visible;/u, "the grid no longer scrolls on its own"],
  [/\.ob-mark \{ display: none; \}/u, "the mark gives up its height"],
  [/\.ob-nav \{ position: sticky; bottom: 0;[^}]*background: var\(--ink\);/u, "the nav stays pinned on ink"],
  [
    /\.ob-intake:has\(:is\(textarea, input:not\(\[type="range"\]\)\):focus\) \.ob-nav \{ position: static; \}/u,
    "the nav rejoins the page while a text field has the keyboard",
  ],
  [/textarea\.ob-control \{ min-height: 5rem; \}/u, "the textarea is shorter"],
  [/\.ob-error\.-note \{ order: -1; \}/u, "a restored draft's notice leads the page"],
  [
    /\.gf-stage:has\(> \.gf-fs-exit\) \.ob-frame \{ padding-right: 2\.6rem; \}/u,
    "the frame keeps clear of the fullscreen toggle",
  ],
  [
    /\.gf-stage:has\(> \.gf-fs-exit\) \.ob-nav \{ margin-right: -2\.6rem; padding-right: 2\.6rem; \}/u,
    "the nav still spans the frame beside the toggle",
  ],
]) {
  assert.match(wizard[0], pattern, label);
}
// One scroll region means the frame is scrolled back to the top on a new step and to the end on an
// error, where the error sits above the nav; neither ever runs on a frame that does not scroll.
const obScroll = vm.runInNewContext(`${extractFunction(client, "obScroll")}\nobScroll`);
const frame = { scrollTop: 37, scrollHeight: 410 };
const creator = { querySelector: (selector) => (selector === ".ob-frame" ? frame : null) };
obScroll(creator, true);
assert.equal(frame.scrollTop, 410, "an error scrolls the frame to its end");
obScroll(creator, false);
assert.equal(frame.scrollTop, 0, "a new step starts at the top");
obScroll({ querySelector: () => null }, true);
obScroll(null, false);
css(/M&&\(M\.hidden=H!==P\),qe\(""\),obScroll\(t,!1\),G&&C\(\)\}/u, "changing step scrolls the frame to the top");
css(/I\.textContent=F\|\|"",I\.hidden=!F,F&&obScroll\(t,!0\)\)\)\}/u, "an error scrolls the frame to its end");

// iOS zooms into a focused field under 16px; on a touch screen every typed field in the arena is 16px.
const touch = mediaBlocks(sheet("mc"), "(pointer: coarse)");
assert.ok(
  touch.some((block) =>
    block.includes(
      '.gf-arena :is(input:not([type="range"], [type="checkbox"], [type="radio"], [type="file"], [type="color"]), textarea, select, [contenteditable="true"], [contenteditable=""]) { font-size: 16px !important; }',
    ),
  ),
  "typed fields are 16px on a touch screen",
);
assert.equal(
  (client.match(/attachShadow\(/gu) || []).length,
  2,
  "only the host and the leaving clone own a shadow root",
);

// Ticking a card for the cast or a theme for outfits rebuilds that list's rows through innerHTML, and
// WebKit then drops the scroll position of the list and of every scrolling ancestor (on a sideways
// phone, the whole creator page). Each render notes them first and puts them back after (1.8.15).
const keep = (list) => `kept=[];for(let e=${list};e;e=e.parentElement)e.scrollTop&&kept.push([e,e.scrollTop]);`;
const putBack = "for(let[e,y]of kept)e.scrollTop=y";
// The shipped statements from `start` up to (not including) `end`, which must each occur once.
function render(start, end) {
  const from = client.indexOf(start);
  assert.notEqual(from, -1, `${start} must be in the bundle`);
  assert.equal(client.indexOf(start, from + 1), -1, `${start} must occur once`);
  const to = client.indexOf(end, from);
  assert.notEqual(to, -1, `${end} must follow ${start}`);
  const body = client.slice(from, to);
  assert.equal(body.split("innerHTML=").length, 2, "the rows are rebuilt once, between the save and the restore");
  assert.ok(body.endsWith(putBack), "the positions are put back after the rows are rebuilt");
  return body;
}
const castRender = render(`let ${keep("B")}B.innerHTML=Zb+q.map(`, "}function x(B,{off:P,why:G,count:D,summary:q})");
const themeRender = render(
  `let g=m(),${keep("l")}l.innerHTML=g.map(`,
  ';for(let b of l.querySelectorAll("[data-theme]")){',
);
// A list inside a grid inside the creator's frame, where rebuilding the rows sends all three to the top
// the way WebKit does.
function webkitChain(frameTop, gridTop, listTop) {
  const frameBox = { scrollTop: frameTop, parentElement: null };
  const grid = { scrollTop: gridTop, parentElement: frameBox };
  const list = { scrollTop: listTop, parentElement: grid };
  Object.defineProperty(list, "innerHTML", {
    set() {
      frameBox.scrollTop = grid.scrollTop = list.scrollTop = 0;
    },
  });
  return { frameBox, grid, list };
}
for (const [label, run] of [
  ["the cast list", vm.runInNewContext(`(B)=>{let Zb="",q=[],K=[],D=[],Mh=()=>"",b=()=>!1;${castRender}}`)],
  ["the outfit theme list", vm.runInNewContext(`(l)=>{let m=()=>[];${themeRender}}`)],
]) {
  const scrolled = webkitChain(196, 0, 150);
  run(scrolled.list);
  assert.deepEqual(
    [scrolled.frameBox.scrollTop, scrolled.grid.scrollTop, scrolled.list.scrollTop],
    [196, 0, 150],
    `${label} and the page around it stay where they were`,
  );
  const atTop = webkitChain(0, 0, 0);
  run(atTop.list);
  assert.deepEqual([atTop.frameBox.scrollTop, atTop.grid.scrollTop, atTop.list.scrollTop], [0, 0, 0]);
}

// The version the Settings readout and the in-game changelog show is the one the manifest ships and the
// changelog describes.
const manifest = JSON.parse(await readFile(new URL("manifest.json", packageRoot), "utf8"));
const changelog = await readFile(new URL("CHANGELOG.md", packageRoot), "utf8");
const bundleVersion = client.match(/,ds="(\d+\.\d+\.\d+)";function cc\(/u)?.[1];
assert.equal(bundleVersion, manifest.version, "the bundle's version readout matches the manifest");
assert.equal(
  changelog.match(/^## (\d+\.\d+\.\d+) /u)?.[1],
  manifest.version,
  "the newest changelog entry is this version",
);
css(/oy=\[\{version:null,/u, "the in-game changelog's newest entry is labelled with the bundle's version");
assert.ok(!client.includes(`{version:"${bundleVersion}"`), "no older in-game entry claims the current version");
// The entry before it keeps its notes under a release the changelog lists below this one.
const pinned = client.match(
  /oy=\[\{version:null,fixed:\[(?:"(?:[^"\\]|\\.)*",?)+\]\},\{version:"(\d+\.\d+\.\d+)",/u,
)?.[1];
const released = [...changelog.matchAll(/^## (\d+\.\d+\.\d+) /gmu)].map((match) => match[1]);
assert.ok(released.indexOf(pinned) > 0, "the previous in-game entry is pinned to an earlier release");

process.stdout.write("Gacha Forge location ID and landscape regression passed.\n");
