// Shadow-DOM stylesheet string
/*!
 * The Anton font embedded in STYLES:
 * Copyright 2020 The Anton Project Authors (https://github.com/googlefonts/AntonFont.git)
 *
 * This Font Software is licensed under the SIL Open Font License, Version 1.1.
 * This license is copied below, and is also available with a FAQ at:
 * http://scripts.sil.org/OFL
 *
 *
 * -----------------------------------------------------------
 * SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
 * -----------------------------------------------------------
 *
 * PREAMBLE
 * The goals of the Open Font License (OFL) are to stimulate worldwide
 * development of collaborative font projects, to support the font creation
 * efforts of academic and linguistic communities, and to provide a free and
 * open framework in which fonts may be shared and improved in partnership
 * with others.
 *
 * The OFL allows the licensed fonts to be used, studied, modified and
 * redistributed freely as long as they are not sold by themselves. The
 * fonts, including any derivative works, can be bundled, embedded,
 * redistributed and/or sold with any software provided that any reserved
 * names are not used by derivative works. The fonts and derivatives,
 * however, cannot be released under any other type of license. The
 * requirement for fonts to remain under this license does not apply
 * to any document created using the fonts or their derivatives.
 *
 * DEFINITIONS
 * "Font Software" refers to the set of files released by the Copyright
 * Holder(s) under this license and clearly marked as such. This may
 * include source files, build scripts and documentation.
 *
 * "Reserved Font Name" refers to any names specified as such after the
 * copyright statement(s).
 *
 * "Original Version" refers to the collection of Font Software components as
 * distributed by the Copyright Holder(s).
 *
 * "Modified Version" refers to any derivative made by adding to, deleting,
 * or substituting -- in part or in whole -- any of the components of the
 * Original Version, by changing formats or by porting the Font Software to a
 * new environment.
 *
 * "Author" refers to any designer, engineer, programmer, technical
 * writer or other person who contributed to the Font Software.
 *
 * PERMISSION & CONDITIONS
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of the Font Software, to use, study, copy, merge, embed, modify,
 * redistribute, and sell modified and unmodified copies of the Font
 * Software, subject to the following conditions:
 *
 * 1) Neither the Font Software nor any of its individual components,
 * in Original or Modified Versions, may be sold by itself.
 *
 * 2) Original or Modified Versions of the Font Software may be bundled,
 * redistributed and/or sold with any software, provided that each copy
 * contains the above copyright notice and this license. These can be
 * included either as stand-alone text files, human-readable headers or
 * in the appropriate machine-readable metadata fields within text or
 * binary files as long as those fields can be easily viewed by the user.
 *
 * 3) No Modified Version of the Font Software may use the Reserved Font
 * Name(s) unless explicit written permission is granted by the corresponding
 * Copyright Holder. This restriction only applies to the primary font name as
 * presented to the users.
 *
 * 4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
 * Software shall not be used to promote, endorse or advertise any
 * Modified Version, except to acknowledge the contribution(s) of the
 * Copyright Holder(s) and the Author(s) or with their explicit written
 * permission.
 *
 * 5) The Font Software, modified or unmodified, in part or in whole,
 * must be distributed entirely under this license, and must not be
 * distributed under any other license. The requirement for fonts to
 * remain under this license does not apply to any document created
 * using the Font Software.
 *
 * TERMINATION
 * This license becomes null and void if any of the above conditions are
 * not met.
 *
 * DISCLAIMER
 * THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
 * OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
 * COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
 * DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
 * OTHER DEALINGS IN THE FONT SOFTWARE.
 *
 */
const STYLES = `@font-face { font-family: "Anton"; font-style: normal; font-weight: 400; font-display: swap; src: url(data:font/woff2;base64,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) format("woff2"); }

.mls {
  --red: #e5191c;
  --red-dark: #9e0d10;
  --ink: #0b0b0d;
  --paper: #f4f1ea;
  --yellow: #ffe14d;
  --muted: #8d8a85;
  --line: #2b2b30;
  --panel: #141417;
  --display: Anton, Impact, sans-serif;
  --body: "Noto Sans", system-ui, sans-serif;

  display: block;
  position: relative;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--body);
  min-height: 100%;
}
.mls *, .mls *::before, .mls *::after { box-sizing: border-box; }

.mls, .mls * { user-select: none; -webkit-user-select: none; }
.mls input, .mls textarea, .mls select, .mls .mls-scene-log .row { user-select: text; -webkit-user-select: text; }
.mls img { -webkit-user-drag: none; }

.mls [data-drag-scroll] { cursor: grab; }
.mls [data-drag-scroll].dragging { cursor: grabbing; scroll-behavior: auto; }
.mls [data-drag-scroll].dragging * { cursor: grabbing; }
.mls button, .mls input { font: inherit; color: inherit; }

.mls button.mls-activity { color: var(--ink); }
.mls button.mls-activity.off { color: #33312b; }
.mls button.mls-place { color: var(--ink); }
.mls button.mls-act { color: var(--ink); }
.mls button.mls-act.person { color: var(--paper); }
.mls button.mls-act:disabled { color: #3a382f; }
.mls [hidden] { display: none !important; }
.mls .err { background: var(--red); color: var(--paper); font-weight: 700; font-size: 13px; padding: 8px 14px; margin: 0 0 10px; }
.mls .busy { opacity: .55; pointer-events: none; }


.mls-title { position: relative; padding: clamp(18px, 3vh, 40px) clamp(16px, 4vw, 56px) 40px; overflow: hidden; background: var(--ink); min-height: 100%; }
.mls-title .slash { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(160deg, transparent 0 34%, var(--red) 34% 52%, transparent 52%); opacity: .9; }
.mls-title .dots { position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(rgba(0,0,0,.35) 1.4px, transparent 1.6px); background-size: 7px 7px;
  mask-image: linear-gradient(160deg, transparent 30%, #000 45%, transparent 56%); }
.mls-title > * { position: relative; }
.mls-logo { display: grid; justify-items: start; transform: rotate(-4deg); transform-origin: left; margin-bottom: 24px; }
.mls-logo .l1 { font-family: var(--display); font-size: clamp(52px, 8vw, 120px); line-height: .85; letter-spacing: 2px;
  color: var(--paper); -webkit-text-stroke: 3px var(--ink); text-shadow: 8px 8px 0 var(--ink); }
.mls-logo .l2 { font-family: var(--display); font-size: clamp(28px, 4vw, 60px); line-height: .9; background: var(--ink);
  color: var(--paper); padding: 2px 18px; margin-left: clamp(16px, 5vw, 96px); box-shadow: 6px 6px 0 var(--red); }
.mls-bond.more { padding: 3px 8px; opacity: .75; }
.mls-logo .l2 .ver { font-family: var(--body); font-style: normal; font-size: 13px; font-weight: 900; letter-spacing: 2px; color: var(--yellow);
  margin-left: 12px; vertical-align: middle; }

.mls-alpha-tags { display: flex; flex-wrap: wrap; gap: 8px 12px; margin: -8px 0 22px 4px; }
.mls-alpha-tags span { font-size: 11px; font-weight: 900; letter-spacing: 1px; padding: 3px 10px; box-shadow: 3px 3px 0 var(--ink); }
.mls-alpha-tags span:nth-child(1) { background: var(--yellow); color: var(--ink); transform: rotate(-3deg); }
.mls-alpha-tags span:nth-child(2) { background: var(--paper); color: var(--ink); transform: rotate(2deg); }
.mls-alpha-tags span:nth-child(3) { background: var(--red); color: var(--paper); transform: rotate(-1.5deg); }

.mls-oldsave { background: var(--paper); color: var(--ink); width: min(520px, 92%); padding: 20px 22px; display: grid; gap: 12px; box-shadow: 10px 10px 0 var(--red); transform: rotate(-.6deg); }
.mls-oldsave .tag { justify-self: start; font-family: var(--display); font-weight: 400; font-size: 30px; letter-spacing: 3px; background: var(--ink); color: var(--yellow); padding: 0 14px; transform: rotate(-3deg); }
.mls-oldsave p { margin: 0; font-size: 15px; font-weight: 900; letter-spacing: 1px; line-height: 1.35; }
.mls-oldsave small { font-size: 11px; font-weight: 700; color: #555; }
.mls-oldsave .row { display: flex; flex-wrap: wrap; gap: 8px; }
.mls .mls-oldsave button { border: 0; font-weight: 900; font-size: 12px; letter-spacing: 1px; padding: 7px 14px; cursor: pointer; background: #333; color: var(--paper); }
.mls .mls-oldsave button.main { background: var(--red); }

.mls-name { display: flex; align-items: baseline; gap: 10px; }
.mls-name h2 { font-family: var(--display); font-weight: 400; font-size: 32px; line-height: 1; margin: 0; }
.mls-name .menu { margin-left: auto; background: none; border: 0; font-size: 20px; font-weight: 900; cursor: pointer; padding: 0 6px; }
.mls-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 14px; font-size: 13px; }
.mls-stats b { display: block; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: #777; }
.mls-bonds { display: flex; flex-wrap: wrap; gap: 6px; }
.mls-bond { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 900; background: #e2ded5; padding: 3px 8px 3px 3px; }
.mls-bond i { width: 22px; height: 22px; background: var(--c); display: grid; place-items: center; font-style: normal; color: #fff; font-size: 11px; }
.mls-bond em { font-style: normal; color: var(--red-dark); }
.mls-when { font-size: 12px; color: #666; }



.mls-menu-screen { display: grid; grid-template-columns: minmax(0, 560px) minmax(0, 1fr); align-items: end; gap: 24px; min-height: 100%; }
.mls-menu-bg { position: absolute; inset: 0; background: var(--ink) center / cover no-repeat; }
.mls-menu-bg.has-pic { animation: mls-menu-drift 40s ease-in-out infinite alternate; }
.mls-menu-bg::after { content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(11,11,13,.94) 0%, rgba(11,11,13,.8) 32%, rgba(11,11,13,.2) 62%, rgba(11,11,13,.05) 100%),
    linear-gradient(0deg, rgba(11,11,13,.7) 0%, transparent 35%); }
@keyframes mls-menu-drift { from { transform: scale(1.04) translateX(0); } to { transform: scale(1.1) translateX(-2%); } }
.mls-menu-screen .slash { opacity: .35; }
.mls-menu-screen .dots { opacity: .6; }
.mls-menu-col { align-self: stretch; display: flex; flex-direction: column; justify-content: center; padding-bottom: clamp(12px, 4vh, 48px); }
.mls-mainmenu { display: grid; gap: 10px; margin-top: clamp(8px, 3vh, 28px); justify-items: start; }
.mls .mls-mm { position: relative; display: grid; justify-items: start; gap: 2px; background: none; border: 0; padding: 6px 22px 8px 26px;
  color: var(--paper); cursor: pointer; text-align: left; transition: transform .12s, background .12s; }
.mls-mm b { font-family: var(--display); font-weight: 400; font-size: clamp(30px, 4.2vw, 50px); line-height: 1; letter-spacing: 1px; text-shadow: 4px 4px 0 var(--ink); }
.mls-mm small { font-size: 12px; font-weight: 700; letter-spacing: .5px; color: var(--muted); }
.mls-mm::before { content: "\u25B8"; position: absolute; left: 4px; top: 10px; font-size: 22px; color: var(--red); opacity: 0; transition: opacity .12s; }
.mls .mls-mm:hover, .mls .mls-mm:focus-visible { transform: translateX(8px); background: linear-gradient(90deg, rgba(229,25,28,.9), rgba(229,25,28,0)); outline: none; }
.mls-mm:hover::before, .mls-mm:focus-visible::before { opacity: 1; color: var(--paper); }
.mls-mm:hover small, .mls-mm:focus-visible small { color: var(--paper); }
.mls .mls-mm.main { background: var(--red); box-shadow: 6px 6px 0 var(--ink); transform: rotate(-2deg); margin-bottom: 6px; }
.mls .mls-mm.main small { color: var(--paper); }
.mls .mls-mm.main:hover { transform: rotate(-2deg) translateX(8px); background: var(--red); }
.mls-mm .new, .mls-changelog .new { position: absolute; top: 2px; right: -34px; font-style: normal; font-size: 11px; font-weight: 900; letter-spacing: 2px;
  background: var(--yellow); color: var(--ink); padding: 2px 7px; transform: rotate(6deg); box-shadow: 2px 2px 0 var(--ink); }

.mls-menu-card { justify-self: end; align-self: end; width: min(360px, 100%); background: var(--paper); color: var(--ink); padding: 14px 16px;
  display: grid; gap: 8px; box-shadow: 8px 8px 0 var(--red); transform: rotate(1deg); margin-bottom: 8px; }
.mls-menu-card .k { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: var(--red-dark); }
.mls-menu-card h2 { font-family: var(--display); font-weight: 400; font-size: 30px; line-height: 1; margin: 0; }
.mls-menu-card .mls-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.mls .mls-mm.on { background: var(--red); box-shadow: 6px 6px 0 var(--ink); transform: translateX(8px); }
.mls .mls-mm.on small { color: var(--paper); }
.mls-mm.on::before { opacity: 1; color: var(--paper); }
.mls-mm-at { display: grid; justify-items: start; }
.mls-loadpop { position: absolute; z-index: 5; }
.mls-loadpop .in { position: relative; }
.mls-loadpop .mls-lifetools { margin: 0 0 10px; }
.mls-slots { display: grid; gap: 12px; overflow: auto; max-height: min(66vh, 620px); padding: 2px 14px 10px 2px;
  scrollbar-width: thin; scrollbar-color: var(--red) transparent; }
.mls-slot { display: grid; grid-template-columns: 150px minmax(0, 1fr); background: var(--paper); color: var(--ink); cursor: pointer;
  box-shadow: 6px 6px 0 var(--ink); transition: transform .12s; }
.mls-slot:hover { transform: translateX(6px); box-shadow: 6px 6px 0 var(--red); }
.mls-slot.picked { outline: 4px solid var(--red); outline-offset: -4px; }
.mls-slot .img { position: relative; min-height: 112px; background: linear-gradient(160deg, #54708e, #222d3a) center / cover; }
.mls-slot .img .where { position: absolute; left: 0; bottom: 8px; font-size: 10px; font-weight: 900; letter-spacing: 2px; background: var(--ink); color: var(--paper); padding: 3px 10px; }
.mls-slot .info { padding: 10px 14px; display: grid; gap: 6px; align-content: start; }
.mls-slot .mls-name h2 { font-size: 26px; }
.mls-slot .mls-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }

.mls-loadpop.under { position: relative; display: grid; grid-template-rows: 1fr; width: min(600px, 100%); margin: 2px 0 4px 18px; }
.mls-loadpop.under .in { min-height: 0; overflow: hidden; background: rgba(11,11,13,.93); border-left: 6px solid var(--red); padding: 10px 0 6px 12px; }
.mls-loadpop.under .mls-slots { max-height: min(34vh, 360px); }
.mls-loadpop.under.enter { animation: mls-drawer-open .3s cubic-bezier(.2,.9,.2,1) both; }
.mls-loadpop.under.enter .mls-slot { animation: mls-slot-drop .26s calc(.1s + var(--i) * .05s) ease-out both; }
.mls-loadpop.under.leave { animation: mls-drawer-shut .2s ease-in forwards; }
@keyframes mls-drawer-open { from { grid-template-rows: 0fr; } to { grid-template-rows: 1fr; } }
@keyframes mls-drawer-shut { from { grid-template-rows: 1fr; } to { grid-template-rows: 0fr; } }
@keyframes mls-slot-drop { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: none; } }

.mls-loadpop.cards .mls-lifetools { justify-content: flex-start; }
.mls-loadpop.cards .mls-slots { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 20px; max-height: min(74vh, 700px); padding: 8px 20px 20px 8px; }
.mls-loadpop.cards.enter .mls-slots, .mls-loadpop.cards.leave .mls-slots { overflow: visible; }
.mls-loadpop.cards .mls-slot { --r: -1.5deg; grid-template-columns: 1fr; grid-template-rows: auto 1fr; width: 220px; transform: rotate(var(--r)); box-shadow: 8px 8px 0 var(--ink); }
.mls-loadpop.cards .mls-slot:nth-child(even) { --r: 1.5deg; }
.mls-loadpop.cards .mls-slot:hover { transform: rotate(0) translateY(-6px); box-shadow: 8px 8px 0 var(--red); }
.mls-loadpop.cards .mls-slot .img { min-height: 120px; }
.mls-loadpop.cards .mls-slot .mls-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mls-loadpop.cards.enter .mls-slot { animation: mls-deal .42s calc(var(--i) * .07s) cubic-bezier(.2,.9,.25,1.1) both; }
.mls-loadpop.cards.leave .mls-slot { animation: mls-undeal .2s ease-in forwards; }
@keyframes mls-deal { from { opacity: 0; transform: translate(var(--fx), var(--fy)) scale(.2) rotate(-30deg); } 50% { opacity: 1; } to { opacity: 1; transform: rotate(var(--r)); } }
@keyframes mls-undeal { from { opacity: 1; transform: rotate(var(--r)); } to { opacity: 0; transform: translate(var(--fx), var(--fy)) scale(.2) rotate(-30deg); } }

.mls-guide { grid-template-rows: auto minmax(0, 1fr); }
.mls-guide-body { display: grid; grid-template-columns: minmax(240px, 300px) minmax(0, 1fr); gap: 22px; align-items: start; min-height: 0; }
.mls-guide .index { position: sticky; top: 0; display: grid; gap: 12px; align-content: start; max-height: calc(var(--tab-h, 100vh) - 120px); overflow: auto; padding-right: 8px; }
.mls-guide .find { display: flex; align-items: center; gap: 8px; background: var(--paper); color: var(--ink); padding: 6px 10px; box-shadow: 4px 4px 0 var(--red); }
.mls-guide .find span { font-size: 18px; font-weight: 900; }
.mls-guide .find input { flex: 1; min-width: 0; border: 0; background: none; font: inherit; font-size: 14px; font-weight: 700; color: var(--ink); outline: none; }
.mls-guide .list { display: grid; gap: 14px; }
.mls-guide .shelf { display: grid; gap: 2px; }
.mls-guide .shelf h3 { margin: 0 0 4px; font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--yellow); }
.mls .mls-guide .list button { background: none; border: 0; border-left: 3px solid transparent; color: var(--paper); text-align: left; padding: 5px 10px; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
.mls .mls-guide .list button:hover { border-left-color: var(--muted); background: rgba(255,255,255,.04); }
.mls .mls-guide .list button.on { border-left-color: var(--red); background: rgba(229,25,28,.16); }
.mls .mls-guide .list .hit { display: grid; gap: 3px; }
.mls-guide .list .hit small { font-size: 12px; font-weight: 400; color: var(--muted); line-height: 1.35; }
.mls-guide .list mark { background: var(--yellow); color: var(--ink); padding: 0 2px; }
.mls-guide .list .none { margin: 0; color: var(--muted); font-size: 13px; }
.mls-guide .page { background: var(--paper); color: var(--ink); padding: 18px 24px 22px; box-shadow: 10px 10px 0 var(--red); display: grid; gap: 12px; align-content: start; max-width: 760px; }
.mls-guide .crumbs { display: flex; gap: 12px; align-items: center; font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--red-dark); text-transform: uppercase; }
.mls-guide .page h2 { margin: 0; font-family: var(--display); font-weight: 400; font-size: clamp(30px, 4vw, 42px); line-height: 1; }
.mls-guide .page p { margin: 0; font-size: 15px; line-height: 1.55; }
.mls .mls-guide .lnk, .mls .mls-info .lnk { background: none; border: 0; padding: 0; font: inherit; font-weight: 900; color: var(--red-dark); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.mls .mls-guide .lnk:hover, .mls .mls-info .lnk:hover { color: var(--red); }
.mls-guide .page .term { font-weight: 900; color: #1c5aa6; }
.mls-guide .see { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding-top: 10px; border-top: 2px solid #ddd8cd; }
.mls-guide .see b { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: #777; margin-right: 4px; }
.mls .mls-guide .see button { background: var(--ink); color: var(--paper); border: 0; padding: 5px 10px; font: inherit; font-size: 12px; font-weight: 900; letter-spacing: 1px; cursor: pointer; }
.mls .mls-guide .see button:hover { background: var(--red); }
.mls.narrow .mls-guide-body { grid-template-columns: 1fr; }
.mls.narrow .mls-guide .index { position: static; max-height: none; }
.mls.narrow .mls-guide .page { padding: 14px 16px 18px; box-shadow: 6px 6px 0 var(--red); }

.mls-firstday { background: var(--paper); color: var(--ink); width: min(540px, 92vw); display: grid; box-shadow: 10px 10px 0 var(--red); transform: rotate(-.6deg); }
.mls-firstday .head { background: var(--ink); color: var(--paper); padding: 12px 18px 10px; display: grid; }
.mls-firstday .head .k { font-size: 11px; font-weight: 900; letter-spacing: 4px; color: var(--yellow); }
.mls-firstday .head b { font-family: var(--display); font-weight: 400; font-size: clamp(28px, 5vw, 40px); line-height: 1; letter-spacing: 1px; }
.mls-firstday .body { padding: 14px 20px 6px; display: grid; gap: 10px; }
.mls-firstday p { margin: 0; font-size: 15px; line-height: 1.45; }
.mls-firstday p b { font-weight: 900; color: var(--red-dark); }
.mls-firstday .foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 20px 16px; }
.mls .mls-firstday .mls-drop { border-color: var(--ink); color: var(--ink); }
.mls .mls-firstday .mls-drop:hover { border-color: var(--red); color: var(--red); }
.mls .mls-firstday .go { margin-left: auto; background: var(--red); color: var(--paper); border: 0; font-family: var(--display); font-weight: 400; font-size: 24px; letter-spacing: 1px;
  padding: 4px 24px 6px; box-shadow: 5px 5px 0 var(--ink); cursor: pointer; transform: rotate(-1.5deg); }

.mls-welcome { background: var(--paper); color: var(--ink); width: min(600px, 92vw); max-height: min(86vh, 760px); display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
  box-shadow: 10px 10px 0 var(--red); }
.mls-welcome .head { background: var(--ink); color: var(--paper); padding: 12px 18px 10px; display: grid; }
.mls-welcome .head .k { font-size: 11px; font-weight: 900; letter-spacing: 4px; color: var(--yellow); }
.mls-welcome .head b { font-family: var(--display); font-weight: 400; font-size: clamp(30px, 5vw, 42px); line-height: 1; letter-spacing: 1px; }
.mls-welcome .body { overflow: auto; padding: 14px 20px 6px; display: grid; gap: 12px; align-content: start; scrollbar-width: thin; scrollbar-color: var(--ink) #ddd8cd; }
.mls-welcome p { margin: 0; font-size: 14.5px; line-height: 1.45; }
.mls-welcome .alpha { display: grid; gap: 6px; padding: 10px 12px; background: var(--ink); color: var(--paper); }
.mls-welcome .alpha .tag { justify-self: start; font-family: var(--display); font-weight: 400; font-size: 24px; letter-spacing: 3px; background: var(--yellow); color: var(--ink); padding: 0 12px; transform: rotate(-3deg); }
.mls-welcome .alpha p { font-weight: 700; }
.mls-welcome .dev { padding: 8px 12px; background: #e6e1d6; border-left: 4px solid var(--red); display: grid; gap: 6px; }
.mls-welcome .dev b { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--red-dark); }
.mls-welcome .dev p { font-style: italic; color: #333; font-size: 14px; }
.mls-welcome .report { font-weight: 900; font-size: 13.5px; padding-left: 12px; border-left: 4px solid var(--ink); }
.mls-welcome .report a { color: var(--red-dark); text-decoration: underline; text-underline-offset: 3px; }
.mls-welcome .report a:hover { color: var(--red); }
.mls-welcome .foot { display: grid; gap: 12px; padding: 12px 20px 18px; border-top: 2px solid #ddd8cd; }
.mls .mls-welcome-tick { display: flex; align-items: center; gap: 10px; background: none; border: 0; padding: 0; color: var(--ink); cursor: pointer; text-align: left; font-size: 14px; font-weight: 900; }
.mls-welcome-tick i { flex: none; width: 26px; height: 26px; border: 3px solid var(--ink); display: grid; place-items: center; font-style: normal; font-size: 16px; font-weight: 900; }
.mls-welcome-tick.on i { background: var(--red); border-color: var(--red); color: var(--paper); }
.mls .mls-welcome .go { justify-self: end; background: var(--red); color: var(--paper); border: 0; font-family: var(--display); font-weight: 400; font-size: 26px; letter-spacing: 1px;
  padding: 4px 26px 6px; box-shadow: 5px 5px 0 var(--ink); cursor: pointer; transform: rotate(-1.5deg); }
.mls .mls-welcome .go:disabled { background: #b9b3a7; box-shadow: none; cursor: not-allowed; }

.mls-changelog { background: var(--paper); color: var(--ink); width: min(620px, 92vw); max-height: min(78vh, 720px); display: grid; grid-template-rows: auto minmax(0, 1fr);
  box-shadow: 10px 10px 0 var(--red); }
.mls-changelog .head { display: flex; align-items: center; background: var(--ink); color: var(--paper); padding: 10px 14px 10px 18px; }
.mls-changelog .head b { font-family: var(--display); font-weight: 400; font-size: 30px; letter-spacing: 2px; }
.mls .mls-changelog .x { margin-left: auto; background: var(--red); color: var(--paper); border: 0; width: 34px; height: 34px; font-size: 16px; font-weight: 900; cursor: pointer; }
.mls-changelog .list { overflow: auto; padding: 8px 20px 18px; scrollbar-width: thin; scrollbar-color: var(--ink) #ddd8cd; }
.mls-changelog .list::-webkit-scrollbar { width: 8px; }
.mls-changelog .list::-webkit-scrollbar-track { background: #ddd8cd; }
.mls-changelog .list::-webkit-scrollbar-thumb { background: var(--ink); }
.mls-changelog section { padding: 12px 0; border-bottom: 2px solid #ddd8cd; }
.mls-changelog section:last-child { border-bottom: 0; }
.mls-changelog h3 { position: relative; display: inline-flex; align-items: baseline; gap: 10px; font-family: var(--display); font-weight: 400; font-size: 26px; margin: 0 0 6px; }
.mls-changelog h3 small { font-family: var(--body); font-size: 12px; font-weight: 700; color: #777; }
.mls-changelog h3 .new { position: static; transform: rotate(-4deg); }
.mls-changelog ul { margin: 0; padding-left: 18px; display: grid; gap: 6px; font-size: 14px; line-height: 1.4; }
.mls-changelog li > b { font-weight: 900; }
.mls-changelog .dev { margin: 6px 0 4px; padding: 7px 10px; background: #e6e1d6; border-left: 4px solid var(--red); font-size: 13px; font-style: italic; color: #333; }
.mls-changelog .dev b { display: block; font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--red-dark); margin-bottom: 2px; }

.mls-changelog .mods { display: grid; gap: 6px; margin-top: 12px; }
.mls-changelog .mods .k { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: var(--red-dark); }
.mls-changelog details.mod { background: #e6e1d6; border-left: 4px solid var(--ink); }
.mls-changelog details.mod > summary { cursor: pointer; padding: 7px 12px; font-family: var(--display); font-size: 20px; list-style: none; }
.mls-changelog details.mod > summary::-webkit-details-marker { display: none; }
.mls-changelog details.mod > summary::before { content: "\u25B8"; display: inline-block; width: 18px; color: var(--red); transition: transform .15s; }
.mls-changelog details.mod[open] > summary::before { transform: rotate(90deg); }
.mls-changelog details.mod > ul { padding: 0 14px 10px 32px; }
.mls-changelog li > ul { margin-top: 4px; padding-left: 20px; gap: 3px; list-style: circle; font-size: 13.5px; }
@media (max-width: 760px) {
  .mls-menu-screen { grid-template-columns: 1fr; align-items: start; }
  .mls-menu-card { justify-self: start; }
  .mls-slot { grid-template-columns: 110px minmax(0, 1fr); }
  .mls-slot .img { min-height: 90px; }
  .mls-slot .mls-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mls-loadpop.under { width: 100%; margin-left: 0; }
  .mls-mm .new { right: -8px; }
}

.mls-pop { position: absolute; z-index: 9; background: var(--ink); border: 2px solid var(--paper); display: grid; min-width: 170px; box-shadow: 5px 5px 0 var(--red); }
.mls-pop button { background: none; border: 0; text-align: left; padding: 8px 14px; font-weight: 900; font-size: 13px; letter-spacing: 1px; cursor: pointer; }
.mls-pop button:hover { background: var(--paper); color: var(--ink); }
.mls-pop button.del { color: #ff6b6b; }



.mls-map { position: relative; overflow: hidden; height: max(480px, min(clamp(560px, calc(100vh - 190px), 1100px), var(--tab-h, 100vh))); }
.mls-map .backdrop { position: absolute; inset: -40px;
  background:
    radial-gradient(ellipse at 20% 80%, #3b5d8a 0%, transparent 55%),
    radial-gradient(ellipse at 80% 30%, #c4633a 0%, transparent 50%),
    linear-gradient(180deg, #1c2440 0%, #472a3d 55%, #1a1418 100%);
  filter: blur(28px) saturate(1.2); }
.mls-map .skyline { position: absolute; left: 0; right: 0; bottom: 18%; height: 40%; pointer-events: none;
  background: linear-gradient(90deg, #0d0f18 0 6%, transparent 6% 8%, #141827 8% 15%, transparent 15% 17%, #0d0f18 17% 21%,
    transparent 21% 24%, #161a2a 24% 33%, transparent 33% 35%, #0d0f18 35% 41%, transparent 41% 44%,
    #141827 44% 52%, transparent 52% 55%, #0d0f18 55% 63%, transparent 63% 66%, #161a2a 66% 74%,
    transparent 74% 77%, #0d0f18 77% 86%, transparent 86% 88%, #141827 88% 100%);
  clip-path: polygon(0 40%, 6% 40%, 6% 10%, 15% 10%, 15% 30%, 24% 30%, 24% 0, 33% 0, 33% 25%, 44% 25%, 44% 15%,
    55% 15%, 55% 35%, 66% 35%, 66% 5%, 77% 5%, 77% 20%, 88% 20%, 88% 45%, 100% 45%, 100% 100%, 0 100%);
  filter: blur(22px); opacity: .8; }
.mls-map .halftone { position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(rgba(0,0,0,.35) 1.2px, transparent 1.4px); background-size: 6px 6px;
  mask-image: linear-gradient(115deg, transparent 30%, #000 100%); }


.mls-top { position: absolute; top: 14px; left: 14px; right: 14px; z-index: 5; display: flex; align-items: flex-start; gap: clamp(12px, 2vw, 30px); }
.mls-clock { position: relative; z-index: 5; flex: none; background: var(--ink); border-bottom: 6px solid var(--red);
  padding: 8px 24px 8px 14px; clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%); transform: rotate(-3deg); transform-origin: left top; }
.mls-clock .top { display: flex; gap: 8px; align-items: center; font-weight: 900; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; }
.mls-clock .top b { background: var(--red); color: var(--paper); padding: 1px 8px; }
.mls-clock .top span { color: var(--yellow); }
.mls-clock .time { font-family: var(--display); font-size: 50px; line-height: 1; letter-spacing: 1px; margin-top: 4px; }
.mls-clock .time small { font-size: 20px; color: var(--muted); margin-left: 4px; }
.mls-clock .date { font-size: 12px; font-weight: 700; opacity: .85; }

.mls-hud { margin-left: auto; width: 250px; display: flex; flex-direction: column; gap: 8px; flex: none; }

.mls-needs { flex: 1; max-width: 700px; display: flex; gap: clamp(10px, 1.6vw, 26px); margin-top: 6px; }
.mls-needs .mls-need { flex: 1; grid-template-columns: 76px 1fr; padding: 7px 12px; }
.mls-needs .label { font-size: 11px; letter-spacing: 2px; }
.mls-needs .mls-bar { height: 12px; }
.mls-money { align-self: flex-end; font-family: var(--display); font-size: 28px; line-height: 1; background: var(--ink); color: var(--yellow);
  padding: 4px 16px 4px 22px; border: 3px solid var(--paper); clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%); transform: rotate(2deg); }
.mls-money small { font-family: var(--body); font-weight: 700; font-size: 11px; color: var(--paper); letter-spacing: 2px; margin-right: 6px; }
.mls-need { display: grid; grid-template-columns: 70px 1fr; align-items: center; gap: 8px; background: rgba(11,11,13,.82);
  padding: 6px 10px; border-left: 5px solid var(--red); transform: skewX(-10deg); }
.mls-need > * { transform: skewX(10deg); }
.mls-need .label { font-weight: 900; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }
.mls-bar { height: 10px; background: #2b2b30; position: relative; overflow: hidden; }
.mls-bar i { position: absolute; inset: 0 auto 0 0; background: var(--paper); }
.mls-bar.low i { background: var(--red); }
.mls-rent { align-self: flex-end; font-size: 12px; font-weight: 700; background: var(--red); color: var(--paper); padding: 3px 12px; transform: rotate(-2deg); }


.mls-places { --cw: clamp(110px, min(10.5vw, 16vh), 200px); --ch: calc(var(--cw) * 0.95);
  position: absolute; top: 150px; bottom: 24px; left: 20px; right: 20px; z-index: 2; }
.mls-board { position: absolute; left: calc(var(--cw) / 2); right: calc(var(--cw) / 2);
  top: calc(var(--ch) / 2); bottom: calc(var(--ch) / 2); }
.mls-places svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.mls-places line { stroke: var(--paper); stroke-width: 3; stroke-dasharray: 2 9; stroke-linecap: round; opacity: .75; }
.mls-places line.hot { stroke: var(--red); stroke-width: 5; stroke-dasharray: none; opacity: 1; }

.mls-walker { position: absolute; left: 0; top: 0; z-index: 4; width: 34px; height: 34px; border-radius: 50%;
  background: var(--red); color: var(--paper); border: 3px solid var(--paper); display: grid; place-items: center;
  font-family: var(--display); font-size: 17px; pointer-events: none; box-shadow: 0 0 0 4px rgba(229,25,28,.35);
  background-size: cover; background-position: center top; }
.mls-walker.has-face { background-color: var(--ink); }

.mls-place { position: absolute; width: var(--cw); transform: translate(-50%, -50%) rotate(var(--r, 0deg));
  transition: transform .18s ease-out; cursor: pointer; background: var(--paper); padding: 7px 7px 0; box-shadow: 6px 8px 0 rgba(0,0,0,.55); border: 0; text-align: left; }
.mls-place:hover, .mls-place:focus-visible { transform: translate(-50%, -50%) rotate(0deg) scale(1.08); z-index: 3; outline: none; }
.mls-place.here { box-shadow: 6px 8px 0 var(--red); }
.mls-place.closed { filter: grayscale(1) brightness(.6); }
.mls-place .photo { aspect-ratio: 16 / 10; position: relative; overflow: hidden; background: var(--bg); display: grid; place-items: center; }
.mls-place .photo span { font-size: 40px; filter: drop-shadow(2px 2px 0 rgba(0,0,0,.4)); }
.mls-place .photo::after { content: "IMAGE"; position: absolute; right: 6px; bottom: 4px; font-size: 9px; letter-spacing: 2px; font-weight: 900; color: rgba(255,255,255,.55); }

.mls-place .name { font-family: var(--display); font-size: calc(var(--cw) * 0.125); color: var(--ink); line-height: 1.05;
  padding: 6px 2px 2px; text-transform: uppercase; letter-spacing: -.2px; display: block;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mls-place .hours, .mls-place .away { display: block; font-size: 11px; font-weight: 700; color: #555; padding: 0 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mls-place .away { color: #8a8175; padding-bottom: 7px; }
.mls-place.here .away { color: var(--red-dark); }
.mls-place.closed .hours { color: var(--red-dark); }

.mls-place .tag { position: absolute; z-index: 2; top: -12px; left: -10px; font-family: var(--display); font-size: 13px; letter-spacing: 1px;
  background: var(--red); color: var(--paper); padding: 1px 10px; transform: rotate(-8deg); box-shadow: 2px 2px 0 rgba(0,0,0,.35); }
.mls-who { position: absolute; z-index: 2; right: -10px; top: 55%; display: flex; flex-direction: row-reverse; }
.mls-who b { width: 30px; height: 30px; border-radius: 50%; margin-left: -10px; display: grid; place-items: center;
  font-size: 12px; font-weight: 900; border: 3px solid var(--ink); color: var(--paper); background: var(--c); }
.mls-who b.more { background: var(--ink); color: var(--yellow); font-size: 11px; }


.mls-back { align-self: flex-end; font-family: var(--display); font-size: 16px; letter-spacing: 2px; background: var(--ink);
  color: var(--paper); border: 0; border-bottom: 4px solid var(--red); padding: 3px 16px 3px 20px; cursor: pointer;
  clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%); transform: rotate(2deg); margin-bottom: 2px; }
.mls-back:hover { background: var(--red); }
.mls-said { align-self: flex-end; max-width: 250px; text-align: right; font-size: 12px; font-weight: 700; color: var(--yellow);
  background: rgba(11,11,13,.85); padding: 4px 10px; line-height: 1.35; }
.mls-said.bad { color: var(--paper); background: var(--red); }

.mls > .mls-flash { position: absolute; left: 0; top: 0; z-index: 55; width: max-content; max-width: min(340px, calc(100% - 20px)); padding: 9px 14px; font-size: 14px; font-weight: 700; line-height: 1.35;
  color: var(--ink); background: var(--yellow); box-shadow: 5px 5px 0 var(--ink); pointer-events: none;
  animation: mls-pop .25s cubic-bezier(.2,1.4,.4,1); transition: opacity .4s; }
.mls > .mls-flash.bad { color: var(--paper); background: var(--red); }
.mls > .mls-flash.still { animation: none; }
.mls > .mls-flash.gone { opacity: 0; }
.mls > .mls-flash::before { content: ""; position: absolute; left: calc(var(--tip, 50%) - 8px); border: 8px solid transparent; }
.mls > .mls-flash.below { transform-origin: var(--tip, 50%) top; }
.mls > .mls-flash.below::before { top: -16px; border-bottom-color: var(--yellow); }
.mls > .mls-flash.above { transform-origin: var(--tip, 50%) bottom; }
.mls > .mls-flash.above::before { bottom: -16px; border-top-color: var(--yellow); }
.mls > .mls-flash.bad.below::before { border-bottom-color: var(--red); }
.mls > .mls-flash.bad.above::before { border-top-color: var(--red); }
.mls-talk .mls-talk-error { align-self: stretch; max-width: none; text-align: left; font-size: 13px; padding: 8px 12px; }
.mls-debt { align-self: flex-end; font-size: 11px; font-weight: 900; letter-spacing: 1px; background: var(--red); color: var(--paper); padding: 2px 10px; }
.mls-place .tag.here-tag { left: auto; right: -10px; transform: rotate(7deg); font-size: 12px; background: var(--yellow); color: var(--ink); }



.mls-place-screen { position: relative; overflow: hidden; min-height: clamp(560px, calc(100vh - 190px), 1100px); }
.mls-place-screen .scene { position: absolute; inset: 0; background: var(--bg); display: grid; place-items: center; }
.mls-place-screen .scene .big { font-size: clamp(90px, 14vw, 220px); opacity: .5; filter: drop-shadow(4px 4px 0 rgba(0,0,0,.4)); }
.mls-place-screen .scene .photo-tag { position: absolute; left: 50%; top: 18%; transform: translateX(-50%);
  font-size: 11px; font-weight: 900; letter-spacing: 6px; color: rgba(255,255,255,.35); }
.mls-place-screen .wash { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(90deg, transparent 40%, rgba(11,11,13,.85) 66%, rgba(11,11,13,.95) 100%),
              linear-gradient(0deg, rgba(11,11,13,.75) 0%, transparent 34%); }

.mls-place-title { position: absolute; left: 16px; top: 16px; z-index: 4; display: grid; gap: 6px; justify-items: start; }
.mls-place-title h1 { font-family: var(--display); font-weight: 400; font-size: clamp(42px, 6vw, 84px); line-height: .9;
  transform: rotate(-4deg); transform-origin: left; text-shadow: 5px 5px 0 var(--red); }
.mls-place-title .meta { font-size: 12px; font-weight: 700; background: var(--ink); padding: 3px 10px; }
.mls-back.flat { transform: none; clip-path: none; font-size: 13px; padding: 4px 12px; }

.mls-people { position: absolute; left: 3%; bottom: 0; z-index: 3; display: flex; align-items: flex-end; gap: 1.5vw;
  right: calc(min(480px, 40vw) + 40px); }
.mls-person { position: relative; background: none; border: 0; padding: 0; cursor: pointer; transition: transform .15s; flex: 0 1 auto; min-width: 0; }
.mls-person:hover { transform: translateY(-10px); }
.mls-person .body { display: block; width: clamp(110px, 12vw, 220px); aspect-ratio: 5 / 11; background: var(--c);
  clip-path: polygon(38% 0, 62% 0, 68% 14%, 64% 20%, 82% 26%, 90% 58%, 80% 60%, 76% 40%, 74% 100%, 26% 100%, 24% 40%, 20% 60%, 10% 58%, 18% 26%, 36% 20%, 32% 14%); }
.mls-person .tap { position: absolute; left: 50%; top: 8%; transform: translateX(-50%); font-size: 10px; font-weight: 900;
  letter-spacing: 2px; color: rgba(255,255,255,.55); }
.mls-person .plate { position: absolute; left: -8px; bottom: 22%; transform: rotate(-5deg); background: var(--ink);
  border-left: 6px solid var(--c); padding: 4px 12px 5px; box-shadow: 4px 4px 0 rgba(0,0,0,.5); text-align: left; display: grid; }
.mls-person .plate b { font-family: var(--display); font-weight: 400; font-size: 22px; line-height: 1; }
.mls-person .plate span { font-size: 11px; font-weight: 700; color: var(--yellow); }
.mls-person .plate em { font-style: normal; font-size: 11px; font-weight: 900; color: var(--muted); letter-spacing: 1px; }
.mls-place-screen .nobody { font-size: 13px; color: var(--muted); }


.mls-person.stranger .body { background: #3a3a44; }
.mls-person.stranger .plate { border-left-color: #666; }
.mls-who b.q { background: #3a3a44; }
.mls-unmet { background: rgba(11,11,13,.85); border-left: 5px solid #666; padding: 12px 14px; font-size: 13px; line-height: 1.5; color: #d8d4cb; }
.mls-unmet b { color: var(--paper); }
.mls button.mls-intro { display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; align-items: center; background: var(--red); color: var(--paper);
  border: 0; padding: 14px 16px 14px 20px; cursor: pointer; text-align: left; clip-path: polygon(10px 0, 100% 0, calc(100% - 6px) 100%, 0 100%); transition: transform .12s; }
.mls-intro:hover { transform: translateX(-8px); }
.mls-intro .n { font-family: var(--display); font-size: 28px; letter-spacing: 1px; line-height: 1; }
.mls-intro .hours { font-family: var(--display); font-size: 22px; }
.mls-intro .d { grid-column: 1 / -1; font-size: 12px; font-weight: 700; color: #ffd9d9; }


.mls-scene { position: relative; overflow: hidden; height: max(480px, min(clamp(560px, calc(100vh - 190px), 1100px), var(--tab-h, 100vh))); }
.mls-scene .backdrop { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 62%, #1b1e24 62%, #0f1115 100%), var(--bg); }
.mls-scene .sprite { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); z-index: 1; height: 88%; aspect-ratio: 5 / 11; background: var(--c);
  clip-path: polygon(38% 0, 62% 0, 68% 14%, 64% 20%, 82% 26%, 90% 58%, 80% 60%, 76% 40%, 74% 100%, 26% 100%, 24% 40%, 20% 60%, 10% 58%, 18% 26%, 36% 20%, 32% 14%);
  transition: filter .2s, background .4s; }
.mls-scene .sprite.stranger { background: #3a3a44; }
.mls-scene.player .sprite { filter: brightness(.55); }
.mls-scene .when { position: absolute; top: 16px; left: 16px; z-index: 5; background: var(--ink); border-bottom: 5px solid var(--red); padding: 8px 22px 10px 14px;
  clip-path: polygon(0 0, 100% 0, 94% 100%, 0 100%); transform: rotate(-2deg); transform-origin: left top; min-width: 250px; }
.mls-scene .when .kind { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--yellow); text-transform: uppercase; }
.mls-scene .when .time { font-family: var(--display); font-size: 36px; line-height: 1; }
.mls-scene .when .left { font-size: 12px; font-weight: 700; margin-top: 4px; }
.mls-scene .steps { display: flex; gap: 5px; margin-top: 6px; }
.mls-scene .steps i { width: 26px; height: 7px; background: #2b2b30; }
.mls-scene .steps i.on { background: var(--paper); }
.mls-scene .bonds { position: absolute; top: 16px; right: 16px; z-index: 5; width: min(370px, 46%); background: rgba(11,11,13,.86); padding: 10px 14px;
  display: grid; gap: 6px; border-left: 5px solid var(--c); }
.mls-scene .bonds .name { font-family: var(--display); font-size: 24px; line-height: 1; }

.mls-scene .mls-bondrow { grid-template-columns: 104px 44px minmax(40px, 1fr) minmax(86px, max-content); }
.mls-read { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--muted); }
.mls-read b { color: var(--ink); background: var(--paper); padding: 0 6px; }
.mls-read b.bad { background: var(--red); color: var(--paper); }
.mls-scene-err { position: absolute; left: 50%; top: 40%; transform: translateX(-50%); z-index: 6; background: var(--red); padding: 8px 14px; font-weight: 700; font-size: 13px; }

.mls-scene-err.stuck { width: min(440px, calc(100% - 32px)); padding: 14px 16px; box-shadow: 6px 6px 0 #000; }
.mls-scene-err.stuck b { display: block; font-family: Anton, sans-serif; font-weight: 400; font-size: 22px; letter-spacing: 1px; }
.mls-scene-err.stuck small { display: block; font-weight: 400; opacity: .85; margin: 4px 0 8px; overflow-wrap: anywhere; }
.mls-scene-err.stuck p { margin: 0 0 12px; }
.mls-scene-err.stuck span { display: flex; gap: 8px; flex-wrap: wrap; }
.mls-scene-err.stuck button { flex: 1 1 150px; border: 0; padding: 10px 12px; font: inherit; font-weight: 900; letter-spacing: 1px; cursor: pointer; background: var(--paper); color: #0b0b0d; }
.mls-scene-err.stuck button + button { background: #0b0b0d; color: var(--paper); }

.mls-scene-err.stuck.float { position: fixed; top: 30%; z-index: 40; }
.mls-scene .box { position: absolute; left: 50%; bottom: 20px; transform: translateX(-50%); z-index: 4; width: min(1100px, calc(100% - 32px));
  background: rgba(11,11,13,.92); border: 3px solid var(--paper); padding: 26px 30px 18px; min-height: 170px; box-shadow: 8px 8px 0 var(--red); cursor: pointer; }
.mls-scene .speaker { position: absolute; top: -3px; left: 150px; transform: translateY(-60%) rotate(-3deg); font-family: var(--display); font-size: 26px; letter-spacing: 1px;
  padding: 0 16px; background: var(--paper); color: var(--ink); box-shadow: 4px 4px 0 var(--red); }
.mls-scene .speaker.you { background: var(--red); color: var(--paper); box-shadow: 4px 4px 0 var(--ink); }
.mls-scene .speaker.none { display: none; }
.mls-scene .text { font-size: 19px; line-height: 1.55; min-height: 3.1em; }
.mls-scene .text.narration { color: #d8d4cb; font-style: italic; }
.mls-scene .next { position: absolute; right: 18px; bottom: 12px; font-size: 18px; color: var(--red); animation: mls-bob 1s infinite; }
@keyframes mls-bob { 50% { transform: translateY(4px); } }
.mls-typing { font-size: 28px; letter-spacing: 6px; color: var(--muted); animation: mls-think 1s ease-in-out infinite; }
.mls button.end { position: absolute; left: 12px; top: -34px; font-weight: 900; font-size: 11px; letter-spacing: 2px; background: var(--red); color: var(--paper);
  border: 2px solid var(--red); padding: 4px 10px; cursor: pointer; }
.mls-turn { display: grid; gap: 8px; cursor: default; }
.mls-turn .label { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--muted); }
.mls button.mls-sug { text-align: left; font-size: 15px; font-weight: 700; background: var(--paper); color: var(--ink); border: 0; padding: 8px 14px; cursor: pointer;
  display: flex; justify-content: space-between; gap: 12px; clip-path: polygon(8px 0, 100% 0, calc(100% - 4px) 100%, 0 100%); }
.mls-sug:hover { box-shadow: inset 6px 0 0 var(--red); }
.mls-sug small { font-size: 11px; font-weight: 900; color: #666; white-space: nowrap; align-self: center; }
.mls-turn .free { display: flex; gap: 8px; align-items: center; }
.mls-turn .free input { flex: 1; font-size: 15px; padding: 9px 12px; background: #1c1c20; color: var(--paper); border: 2px solid #444; outline: none; }
.mls-turn .free input:focus { border-color: var(--yellow); }
.mls-turn .free button { font-family: var(--display); font-size: 18px; background: var(--red); color: var(--paper); border: 0; padding: 6px 16px; cursor: pointer; }
.mls-summary { display: grid; gap: 10px; cursor: default; }
.mls-summary h3 { font-family: var(--display); font-weight: 400; font-size: 28px; margin: 0; }
.mls-summary .chips { display: flex; flex-wrap: wrap; gap: 6px; }

.mls-sum-stats { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px 28px; }
.mls-sum-stats .stat small { display: block; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-bottom: 3px; }
.mls-sum-stats .stat b { font-family: var(--display); font-weight: 400; font-size: 26px; line-height: 1; }
.mls-sum-stats .stat.gain b { color: var(--yellow); }
.mls-sum-stats .stat.loss b { color: var(--red); }
.mls-sum-stats .stat em { display: block; font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: var(--red); margin-top: 3px; }

.mls-bondrow .tier b.cap { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: var(--paper); background: var(--red); padding: 1px 5px; white-space: nowrap; }
.mls-sum-stats .reads { display: flex; flex-wrap: wrap; gap: 4px; }
.mls-sum-stats .reads i { font-style: normal; font-size: 11px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;
  padding: 3px 8px; background: var(--yellow); color: var(--ink); }
.mls-sum-stats .reads i.bad { background: var(--red); color: var(--paper); }
.mls-memory { margin: 0; max-width: 780px; padding: 8px 14px; border-left: 4px solid var(--c, var(--yellow)); background: rgba(255,255,255,.05);
  font-size: 15px; font-style: italic; line-height: 1.5; color: #e8e4dc; }
.mls-memory small { display: block; font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-bottom: 2px; }
.mls-summary .chip { font-size: 12px; font-weight: 900; padding: 2px 8px; background: #2b2b30; }
.mls-summary .chip.gain { background: var(--yellow); color: var(--ink); }
.mls-summary .chip.loss { background: var(--red); }
.mls button.mls-scene-back { justify-self: start; font-family: var(--display); font-size: 20px; background: var(--paper); color: var(--ink); border: 0; padding: 4px 16px; cursor: pointer; }

.mls-you { max-width: 1240px; margin: 0 auto; padding: 22px clamp(16px, 3vw, 44px) 60px; display: grid; gap: 18px; min-height: 100%; background: var(--ink); }
.mls-you > .mls-back { justify-self: start; }

.mls-you-grid { display: grid; grid-template-columns: minmax(240px, 330px) minmax(0, 1fr); gap: clamp(18px, 3vw, 40px); align-items: start; }
.mls-you-side { position: sticky; top: 14px; display: grid; gap: 10px; min-width: 0; }
.mls-you-side .portrait { aspect-ratio: 5 / 8; background: linear-gradient(160deg, #c2185b, #4a0a24); display: grid; place-items: center; font-size: 11px; font-weight: 900;
  letter-spacing: 2px; color: rgba(255,255,255,.6); transform: rotate(-2deg); box-shadow: 8px 8px 0 var(--red); overflow: hidden; margin-bottom: 10px;
  width: min(100%, calc(44vh * 5 / 8)); }
.mls-you-side .portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls-you .kicker { font-size: 12px; font-weight: 900; letter-spacing: 4px; color: var(--yellow); }
.mls-you h1 { font-family: var(--display); font-weight: 400; font-size: clamp(44px, 5vw, 72px); line-height: .9; margin: 0; }
.mls-you .line { font-size: 14px; color: #d8d4cb; line-height: 1.5; }
.mls-you .facts { display: grid; gap: 4px; font-size: 13px; color: #d8d4cb; }
.mls-you .facts b { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-right: 4px; }
.mls-you .needs { display: grid; gap: 8px; background: var(--panel); padding: 10px 12px; border-left: 5px solid var(--yellow); }
.mls-you .need { grid-template-columns: minmax(0, 1fr) auto !important; grid-template-areas: "label state" "bar bar"; gap: 4px 10px !important; }
.mls-you .need > span:first-child { grid-area: label; }
.mls-you .need .bar { grid-area: bar; }
.mls-you .need .state { grid-area: state; }
.mls-you .need > span:first-child { white-space: nowrap; }
.mls-you-side .money { background: var(--panel); padding: 10px 12px; border-left: 5px solid var(--red); }
.mls-you-tabs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
.mls .mls-you-tabs button { font-family: var(--display); font-size: 24px; letter-spacing: 1px; background: none; color: var(--muted); border: 0; border-bottom: 4px solid transparent; padding: 2px 14px 4px; cursor: pointer; }
.mls .mls-you-tabs button:hover { color: var(--paper); }
.mls .mls-you-tabs button.on { color: var(--paper); border-bottom-color: var(--red); }
.mls-you-tab { background: var(--panel); border-left: 5px solid var(--red); padding: 16px 18px; display: grid; gap: 14px; min-width: 0; }
.mls-you-tab h3 { font-family: var(--display); font-weight: 400; font-size: 28px; letter-spacing: 1px; margin: 0; display: flex; align-items: center; gap: 8px; }
.mls-you-tab h4 { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--muted); margin: 6px 0 -4px; }
.mls .mls-see-all { justify-self: start; }

.mls-info { display: inline-block; vertical-align: middle; margin-left: 6px; position: relative; }
.mls-info summary { list-style: none; cursor: pointer; font-size: 13px; font-weight: 900; color: var(--muted); line-height: 1; letter-spacing: 0; text-transform: none; }
.mls-info summary::-webkit-details-marker { display: none; }
.mls-info summary:hover, .mls-info[open] summary { color: var(--yellow); }
.mls-info p { position: absolute; z-index: 20; left: -8px; top: calc(100% + 6px); width: max-content; max-width: 280px; margin: 0; padding: 8px 10px;
  background: var(--paper); color: var(--ink); font-family: var(--body); font-size: 12px; font-weight: 700; letter-spacing: 0; line-height: 1.4; text-transform: none; box-shadow: 4px 4px 0 var(--red); }
.mls-info p b { color: var(--red-dark); }
.mls .mls-info .mls-guide-more { display: block; margin-top: 6px; font-size: 11px; letter-spacing: 1px; }
.mls-info p { white-space: normal; }
.mls-you .skill .name .sk { color: var(--paper); letter-spacing: 2px; text-transform: uppercase; font-weight: 900; }

.mls-you-side .mls-info p { top: auto; bottom: calc(100% + 6px); }
.mls-you .bar { height: 12px; background: #2b2b30; position: relative; display: block; }
.mls-you .bar i { position: absolute; inset: 0 auto 0 0; background: var(--paper); }
.mls-you .bar.y i { background: var(--yellow); }
.mls-you .bar.low i { background: var(--red); }
.mls-you .bar.inline { display: inline-block; width: 120px; height: 8px; vertical-align: middle; margin-right: 6px; }
.mls-you .hint { font-size: 12px; color: var(--muted); line-height: 1.45; }
.mls-you .hint b { color: var(--paper); }
.mls-you .skill { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 4px 14px; align-items: center; }
.mls-you .skill .lv { grid-row: span 3; font-family: var(--display); font-size: 48px; line-height: .9; text-align: center; background: var(--ink); padding: 6px 0; box-shadow: 4px 4px 0 var(--red); }
.mls-you .skill .lv small { display: block; font-family: var(--body); font-size: 9px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-you .skill .name { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
.mls-you .skill .name span { color: var(--muted); letter-spacing: 0; text-transform: none; font-weight: 700; }
.mls-you .need { display: grid; grid-template-columns: 70px minmax(0, 1fr) auto; gap: 10px; align-items: center; font-size: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
.mls-you .need .state { text-align: right; color: var(--yellow); letter-spacing: 1px; text-transform: none; }
.mls-you .need .state.bad { color: var(--red); }
.mls-you .money { display: flex; flex-wrap: wrap; gap: 10px 28px; align-items: flex-end; }
.mls-you .money small, .mls-you .counts small { display: block; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-bottom: 3px; }
.mls-you .money b { font-family: var(--display); font-weight: 400; font-size: 32px; line-height: 1; }
.mls-you .money .debt b { color: var(--red); }
.mls-you .kv { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 6px 14px; font-size: 14px; }
.mls-you .kv .k { font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; padding-top: 2px; }
.mls-you .ledger { display: grid; gap: 2px; font-size: 13px; }
.mls-you .ledger div { display: grid; grid-template-columns: 90px minmax(0, 1fr) auto; gap: 10px; padding: 5px 8px; background: #1c1c20; }
.mls-you .ledger .when { color: var(--muted); font-size: 11px; font-weight: 900; letter-spacing: 1px; }
.mls-you .ledger .in { color: var(--yellow); font-weight: 900; }
.mls-you .ledger .out { color: #ff8a8a; font-weight: 900; }
.mls-you .warns { display: flex; gap: 6px; }
.mls-you .warns i { width: 20px; height: 20px; background: #2b2b30; }
.mls-you .warns i.on { background: var(--red); }
.mls-you .ladder { display: flex; flex-wrap: wrap; gap: 4px; }
.mls-you .ladder span { font-size: 11px; font-weight: 900; letter-spacing: 1px; padding: 3px 8px; background: #1c1c20; color: var(--muted); }
.mls-you .ladder span.on { background: var(--paper); color: var(--ink); }
.mls-you .ladder span.next { outline: 2px dashed var(--yellow); outline-offset: -2px; color: var(--yellow); background: none; }
.mls-you .counts { display: flex; flex-wrap: wrap; gap: 10px 28px; }
.mls-you .counts b { font-family: var(--display); font-weight: 400; font-size: 28px; line-height: 1; }
.mls-you .people { display: grid; gap: 6px; }
.mls button.person { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 10px; align-items: center; background: #1c1c20; color: var(--paper); border: 0; padding: 6px 8px; cursor: pointer; text-align: left; }
.mls button.person:hover { background: #26262b; }
.mls-you .person .av { width: 40px; height: 40px; background: var(--c); display: grid; place-items: center; font-family: var(--display); font-size: 20px; clip-path: polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%); overflow: hidden; }
.mls-you .person .av img { width: 100%; height: 100%; object-fit: cover; }
.mls-you .person .who { display: grid; min-width: 0; }
.mls-you .person b { font-family: var(--display); font-weight: 400; font-size: 20px; line-height: 1; }
.mls-you .person small { font-size: 12px; color: var(--muted); }
.mls-you .chip { font-size: 10px; font-weight: 900; letter-spacing: 1px; padding: 2px 7px; background: var(--yellow); color: var(--ink); }
.mls-you .chip.r { background: var(--red); color: var(--paper); }
.mls button.mls-linkbtn { background: none; border: 0; padding: 0; cursor: pointer; font: inherit; font-weight: 900; color: var(--yellow); text-decoration: underline; }
.mls.narrow .mls-you-grid { grid-template-columns: minmax(0, 1fr); }
.mls.narrow .mls-you-side { position: static; grid-template-columns: 110px minmax(0, 1fr); column-gap: 14px; align-items: start; }
.mls.narrow .mls-you-side .portrait { grid-row: span 4; margin-bottom: 0; }
.mls.narrow .mls-you-side .needs, .mls.narrow .mls-you-side .money { grid-column: 1 / -1; }
.mls.narrow .mls-you-tabs button { font-size: 19px; padding: 2px 8px 4px; }
.mls.narrow .mls-you .kv { grid-template-columns: max-content minmax(0, 1fr); }


.mls button.mls-namelink { background: none; border: 0; padding: 0; cursor: pointer; font: inherit; color: inherit; text-decoration: underline dotted 2px; text-underline-offset: 6px; }

.mls-contacts { display: grid; grid-template-columns: 330px minmax(0, 1fr); min-height: 100%;
  background: linear-gradient(90deg, #111114 0 327px, var(--line) 327px 330px, var(--ink) 330px); }
.mls-contacts .list { position: sticky; top: 0; align-self: start; max-height: 100vh; overflow: auto; background: #111114; border-right: 3px solid var(--line); padding: 18px 14px; display: flex; flex-direction: column; gap: 8px; }

.mls-listchart { display: flex; gap: 0; }
.mls .mls-listchart button { flex: 1; background: #1c1c20; color: var(--muted); border: 2px solid #3a3a40; padding: 6px 12px; font: inherit; font-size: 12px; font-weight: 900; letter-spacing: 2px; cursor: pointer; }
.mls .mls-listchart button + button { border-left: 0; }
.mls .mls-listchart button.on { background: var(--paper); color: var(--ink); border-color: var(--paper); }
.mls-contacts.charting { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 10px; background: var(--ink); padding: 16px clamp(12px, 3vw, 32px) 20px; }
.mls-contacts.charting .top { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.mls-contacts.charting h1 { font-family: var(--display); font-weight: 400; font-size: 38px; line-height: 1; margin: 0; transform: rotate(-3deg); text-shadow: 4px 4px 0 var(--red); }
.mls-contacts.charting .mls-listchart { width: 220px; }
.mls-contacts.charting .top .mls-back { margin-left: auto; }

.mls-chart { display: grid; grid-template-rows: minmax(0, 1fr) auto; grid-template-columns: minmax(0, 1fr); gap: 10px; min-height: 0; min-width: 0; }
.mls-chart .board { position: relative; justify-self: center; aspect-ratio: 1; height: min(calc(var(--tab-h, 100vh) - 190px), 100%); max-width: 100%; min-height: 320px; }
.mls-chart svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.mls-chart line { stroke-linecap: round; transition: opacity .15s; }
.mls-chart line.hit { stroke: transparent; stroke-width: 16; cursor: help; }
.mls-chart line.couple { stroke: var(--red); stroke-width: 6; }
.mls-chart line.family { stroke: #4caf50; stroke-width: 4; }
.mls-chart line.close { stroke: var(--yellow); stroke-width: 4; }
.mls-chart line.friends { stroke: var(--yellow); stroke-width: 2; opacity: .6; }
.mls-chart line.ex { stroke: #8d8a85; stroke-width: 3; stroke-dasharray: 10 8; }
.mls-chart line.rivals { stroke: #ff8a00; stroke-width: 3; stroke-dasharray: 4 7; }
.mls-chart line.acq { stroke: #5a5a62; stroke-width: 1.5; display: none; }
.mls-chart line.you-together { stroke: var(--red); stroke-width: 7; }
.mls-chart line.you-romance { stroke: #ff6fa8; stroke-width: 3.5; }
.mls-chart line.you-f0 { stroke: #3a3a40; stroke-width: 1.5; }
.mls-chart line.you-f1 { stroke: #6f8fb0; stroke-width: 2; }
.mls-chart line.you-f2 { stroke: #8fb6de; stroke-width: 3; }
.mls-chart line.you-f3 { stroke: #b6d6f5; stroke-width: 4; }
.mls-chart line.you-f4 { stroke: #e6f2ff; stroke-width: 5; }
.mls-chart marker path { fill: #ff6fa8; }
.mls-chart .board.focusing line:not(.lit):not(.hit) { opacity: .07; }
.mls-chart .board.focusing line.acq.lit { display: inline; }
.mls-chart .board.focusing .node:not(.lit) { opacity: .55; }
.mls-chart .you { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; justify-items: center; gap: 4px; pointer-events: none; }
.mls-chart .you i { position: relative; width: 104px; height: 104px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; background: var(--red); color: var(--paper); font-style: normal; font-family: var(--display); font-size: 26px; box-shadow: 0 0 0 4px var(--paper), 6px 6px 0 4px var(--ink); }
.mls-chart .you i img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 12%; }
.mls-chart .you b { font-family: var(--display); font-weight: 400; font-size: 20px; background: var(--ink); padding: 0 8px; }
.mls .mls-chart .node { position: absolute; transform: translate(-50%, -50%); display: grid; justify-items: center; gap: 2px; background: none; border: 0; padding: 0; color: var(--paper); cursor: pointer; transition: opacity .15s; }
.mls-chart .node i { position: relative; width: 58px; height: 58px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; background: var(--c); font-style: normal; font-family: var(--display); font-size: 24px; box-shadow: 0 0 0 3px #2b2b30; transition: box-shadow .12s; }
.mls-chart .node.together i { box-shadow: 0 0 0 4px var(--red); }
.mls-chart .node.likes i { box-shadow: 0 0 0 3px #ff6fa8; }
.mls-chart .node:hover i, .mls-chart .node.lit i { box-shadow: 0 0 0 4px var(--yellow); }
.mls-chart .node b { font-size: 11px; font-weight: 900; letter-spacing: 1px; background: rgba(11,11,13,.8); padding: 1px 6px; white-space: nowrap; }
.mls-chart .node small { font-size: 9px; font-weight: 900; letter-spacing: 1.5px; background: var(--red); padding: 1px 5px; }
.mls-chart .foot { display: grid; gap: 6px; justify-items: center; }
.mls-chart .key { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 16px; font-size: 12px; font-weight: 700; color: var(--muted); }
.mls-chart .key span { display: inline-flex; align-items: center; gap: 6px; }
.mls-chart .key i { width: 26px; height: 0; border-top: 4px solid; display: inline-block; }
.mls-chart .key i.you-together, .mls-chart .key i.couple { border-color: var(--red); }
.mls-chart .key i.you-romance { border-color: #ff6fa8; position: relative; }
.mls-chart .key i.arrow::after { content: ""; position: absolute; right: -6px; top: -7px; border: 5px solid transparent; border-left: 7px solid #ff6fa8; }
.mls-chart .key i.family { border-color: #4caf50; }
.mls-chart .key i.close { border-color: var(--yellow); }
.mls-chart .key i.friends { border-color: var(--yellow); border-top-width: 2px; opacity: .6; }
.mls-chart .key i.ex { border-color: #8d8a85; border-top-style: dashed; }
.mls-chart .key i.rivals { border-color: #ff8a00; border-top-style: dotted; }
.mls-chart .key i.you-friend { border-image: linear-gradient(90deg, #3a3a40, #6f8fb0, #e6f2ff) 1; }
.mls-chart .key i.acq { border-color: #5a5a62; border-top-width: 2px; }
.mls-chart .said { margin: 0; min-height: 20px; font-size: 14px; font-weight: 900; color: var(--yellow); }
.mls-chart .hint { color: var(--muted); }

.mls.narrow .mls-contacts.charting { padding: 12px 10px 20px; }
.mls.narrow .mls-contacts.charting .top { display: grid; grid-template-columns: auto 1fr; gap: 10px; }
.mls.narrow .mls-contacts.charting h1 { font-size: 30px; justify-self: end; margin-right: 8px; }
.mls.narrow .mls-contacts.charting .top .mls-listchart { grid-column: 1 / -1; grid-row: 2; width: auto; }
.mls.narrow .mls-chart .board { aspect-ratio: auto; width: 100%; height: max(480px, calc(var(--tab-h, 100vh) - 250px)); min-height: 0; }
.mls.narrow .mls-chart .node i { width: 34px; height: 34px; font-size: 16px; box-shadow: 0 0 0 2px #2b2b30; }
.mls.narrow .mls-chart .node b { font-size: 8px; letter-spacing: .5px; padding: 0 3px; max-width: 58px; overflow: hidden; text-overflow: ellipsis; }
.mls.narrow .mls-chart .node small { font-size: 7px; }
.mls.narrow .mls-chart .you i { width: 60px; height: 60px; }
.mls.narrow .mls-chart .you b { font-size: 15px; }
.mls.narrow .mls-chart .key { font-size: 11px; gap: 4px 10px; }
.mls.narrow .mls-chart .said { text-align: center; }
.mls .mls-chart .said .open { background: var(--red); color: var(--paper); border: 0; padding: 4px 10px; margin-left: 6px; font: inherit; font-size: 11px; font-weight: 900; letter-spacing: 1px; cursor: pointer; }
.mls-contacts .list .top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.mls-contacts .list h1 { font-family: var(--display); font-weight: 400; font-size: 38px; line-height: 1; transform: rotate(-3deg); text-shadow: 4px 4px 0 var(--red); }
.mls-contacts .search { background: #1c1c20; border: 2px solid #3a3a40; padding: 8px 10px; outline: none; color: var(--paper); font: inherit; }
.mls-contacts .rows { display: grid; gap: 6px; }
.mls-contacts .group { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--muted); margin-top: 8px; }
.mls button.mls-contact { display: grid; grid-template-columns: 46px 1fr auto; gap: 10px; align-items: center; padding: 8px; cursor: pointer; background: var(--panel); color: var(--paper);
  border: 0; border-left: 4px solid transparent; text-align: left; }
.mls button.mls-contact:hover { background: #1c1c20; }
.mls button.mls-contact.on { background: var(--paper); color: var(--ink); border-left-color: var(--red); }
.mls-contact .av { width: 46px; height: 46px; background: var(--c); display: grid; place-items: center; font-family: var(--display); font-size: 22px; color: rgba(255,255,255,.85);
  clip-path: polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%); overflow: hidden; }
.mls-contact .av img { width: 100%; height: 100%; object-fit: cover; }
.mls-contact .who { display: grid; min-width: 0; }
.mls-contact b { font-family: var(--display); font-weight: 400; font-size: 20px; line-height: 1; letter-spacing: .5px; }
.mls-contact small { font-size: 12px; color: var(--muted); }
.mls-contact.on small { color: #555; }
.mls-contact .flag { font-size: 10px; font-weight: 900; letter-spacing: 1px; padding: 2px 6px; background: var(--red); color: var(--paper); }
.mls-contact .flag.y { background: var(--yellow); color: var(--ink); }
.mls-contacts .sheet { padding: 28px clamp(16px, 3vw, 44px) 60px; display: grid; gap: 18px; align-content: start; min-width: 0; }
.mls-contacts .sheet .empty, .mls-contacts .hint { font-size: 12px; color: var(--muted); line-height: 1.45; }
.mls-contacts .hint.lbl { margin-bottom: 6px; }
.mls-contacts .to-list { justify-self: start; }
.mls-contacts .hero { display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 24px; align-items: end; }
.mls-contacts .portrait { aspect-ratio: 3 / 4; background: var(--c, #333); display: grid; place-items: center; font-size: 11px; font-weight: 900; letter-spacing: 2px; color: rgba(255,255,255,.6);
  transform: rotate(-2deg); box-shadow: 8px 8px 0 var(--red); overflow: hidden; }
.mls-contacts .portrait img { width: 100%; height: 100%; object-fit: cover; }
.mls-contacts .portrait.unknown { background: #2b2b30; font-family: var(--display); font-size: 80px; }
.mls-contacts .hero h2 { font-family: var(--display); font-weight: 400; font-size: clamp(48px, 7vw, 80px); line-height: .9; }
.mls-contacts .hero .line { font-size: 14px; color: #d8d4cb; margin-top: 6px; line-height: 1.5; max-width: 80ch; }
.mls-contacts .hero .now { display: inline-block; margin-top: 10px; font-size: 13px; font-weight: 900; background: var(--ink); border-left: 5px solid var(--yellow); padding: 4px 10px; }
.mls-contacts .hero .now span { color: var(--yellow); }
.mls-contacts .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.mls-contacts .tag { font-size: 11px; font-weight: 900; letter-spacing: 1px; padding: 3px 8px; background: var(--line); }
.mls-contacts .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; align-items: start; }

.mls-sheet-head { position: sticky; top: -28px; z-index: 5;
  display: grid; grid-template-columns: 110px minmax(0, 1fr) minmax(260px, 340px); gap: 18px; align-items: center;
  background: var(--ink); padding: 10px 0 14px; border-bottom: 3px solid var(--line); }
.mls-sheet-head .portrait { aspect-ratio: 3 / 4; }
.mls-sheet-head h2 { font-family: var(--display); font-weight: 400; font-size: clamp(38px, 4.4vw, 64px); line-height: .9; margin: 0; }
.mls-sheet-head .line { font-size: 13px; color: #d8d4cb; margin-top: 4px; line-height: 1.45; max-width: 70ch; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mls-sheet-head .now { display: inline-block; margin-top: 8px; font-size: 13px; font-weight: 900; background: var(--panel); border-left: 5px solid var(--yellow); padding: 3px 10px; }
.mls-sheet-head .now span { color: var(--yellow); }
.mls-sheet-head .bonds { display: grid; gap: 8px; }
.mls-sheet-head .bond .next { font-size: 11px; }
.mls-tabbar { display: flex; flex-wrap: wrap; gap: 4px; margin: 14px 0 12px; }
.mls .mls-tabbar button { font-family: var(--display); font-size: 24px; letter-spacing: 1px; background: none; color: var(--muted); border: 0; border-bottom: 4px solid transparent; padding: 2px 14px 4px; cursor: pointer; }
.mls .mls-tabbar button:hover { color: var(--paper); }
.mls .mls-tabbar button.on { color: var(--paper); border-bottom-color: var(--red); }
.mls-sheet-tab { display: grid; gap: 16px; align-content: start; }
.mls-face-box .row { display: flex; align-items: center; gap: 18px; }
.mls-face-box .say { display: grid; gap: 10px; justify-items: start; }
.mls.narrow .mls-sheet-head { position: static; grid-template-columns: 90px minmax(0, 1fr); }
.mls.narrow .mls-sheet-head .bonds { grid-column: 1 / -1; }
.mls.narrow .mls-tabbar button { font-size: 19px; padding: 2px 8px 4px; }
.mls-contacts .box { background: var(--panel); border-left: 5px solid var(--red); padding: 14px 16px; display: grid; gap: 12px; min-width: 0; }
.mls-contacts .box h3 { font-family: var(--display); font-weight: 400; font-size: 24px; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.mls-contacts .box h3 small { font-family: var(--body); font-size: 11px; font-weight: 700; color: var(--muted); letter-spacing: 1px; }
.mls-contacts .bond { display: grid; gap: 5px; }
.mls-contacts .bond .row1 { display: flex; justify-content: space-between; align-items: baseline; font-size: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
.mls-contacts .bond .row1 .tier { color: var(--yellow); letter-spacing: 1px; text-transform: none; }
.mls-contacts .bar { height: 12px; background: #2b2b30; position: relative; }
.mls-contacts .bar i { position: absolute; inset: 0 auto 0 0; background: var(--paper); }
.mls-contacts .bar .mark { position: absolute; top: -4px; bottom: -4px; width: 3px; background: var(--red); }
.mls-contacts .bond.ev-ready .bar i { background: var(--yellow); }
.mls-contacts .bond.ev-ready .next { color: var(--yellow); font-weight: 700; }
.mls-contacts .bond .next { font-size: 12px; color: var(--muted); }
.mls-contacts .bond.frozen .bar i { background: repeating-linear-gradient(135deg, #555 0 6px, #444 6px 12px); }
.mls button.mls-tgbtn { display: flex; align-items: flex-start; gap: 10px; background: none; border: 0; cursor: pointer; text-align: left; padding: 0; color: var(--paper); }
.mls-tgbtn i { width: 42px; height: 22px; background: #3a3a40; position: relative; flex: none; margin-top: 2px; clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%); }
.mls-tgbtn i::after { content: ""; position: absolute; top: 3px; left: 5px; width: 16px; height: 16px; background: var(--paper); transition: left .15s; }
.mls-tgbtn.on i { background: var(--red); }
.mls-tgbtn.on i::after { left: 21px; }
.mls-tgbtn small { display: block; font-size: 12px; color: var(--muted); }
.mls-contacts .likes { display: flex; flex-wrap: wrap; gap: 6px; }
.mls-contacts .like { font-size: 13px; font-weight: 700; padding: 4px 10px; background: var(--paper); color: var(--ink); }
.mls-contacts .like.no { background: var(--red); color: var(--paper); }
.mls-contacts .like.q { background: none; border: 2px dashed #555; color: #777; }
.mls-contacts .arch { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; align-items: baseline; }
.mls-contacts .arch .k { font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-contacts .arch .v { font-family: var(--display); font-size: 22px; }
.mls-contacts .arch .v.q { color: #666; font-family: var(--body); font-size: 13px; font-weight: 700; }
.mls-sheet-week { display: grid; grid-template-columns: repeat(7, minmax(92px, 1fr)); gap: 4px; overflow-x: auto; }
.mls-sheet-week .day { display: grid; gap: 3px; align-content: start; }
.mls-sheet-week .h { font-weight: 900; font-size: 10px; letter-spacing: 1px; color: var(--muted); padding: 3px; text-transform: uppercase; }
.mls-sheet-week .c { background: #1c1c20; padding: 5px 6px; font-size: 12px; line-height: 1.3; }
.mls-sheet-week .c b { color: var(--yellow); font-size: 11px; }
.mls-sheet-week .c small { display: block; color: var(--muted); font-size: 11px; }
.mls-sheet-week .c.q { background: none; border: 2px dashed #333; color: #555; text-align: center; }
.mls-contacts .mem { display: grid; gap: 8px; }
.mls-contacts .m { background: #1c1c20; padding: 10px 12px; display: grid; gap: 6px; border-left: 4px solid #3a3a40; }
.mls-contacts .m.pin { border-left-color: var(--yellow); }
.mls-contacts .m.summary { border-left-color: var(--muted); background: #18181c; }
.mls-contacts .m.unread { opacity: .55; }
.mls-membudget { display: grid; gap: 6px; font-size: 13px; }
.mls-membudget b { color: var(--yellow); }
.mls-membudget input { width: 90px; background: #1c1c20; border: 2px solid #3a3a40; color: var(--paper); padding: 2px 6px; font: inherit; font-weight: 700; }
.mls-membudget input:focus { border-color: var(--yellow); outline: none; }
.mls-membudget .bar { height: 6px; }
.mls-membudget .bar i { background: var(--yellow); }
.mls-membudget small { font-size: 11px; color: var(--muted); }
.mls-contacts .m .when { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--muted); display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.mls-contacts .m .tools { display: flex; gap: 10px; }
.mls-contacts .m .tools button { background: none; border: 0; cursor: pointer; font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--muted); }
.mls-contacts .m .tools button:hover { color: var(--paper); }
.mls-contacts .m .tools button.on { color: var(--yellow); }
.mls-contacts .m p { font-size: 14px; line-height: 1.45; }
.mls-contacts .m textarea { width: 100%; background: var(--ink); color: var(--paper); border: 2px solid var(--yellow); padding: 8px; min-height: 80px; line-height: 1.45; resize: vertical; outline: none; font: inherit; }
.mls-contacts .m .acts { display: flex; gap: 8px; }
.mls-contacts .m .save { font-weight: 900; font-size: 11px; letter-spacing: 2px; background: var(--yellow); color: var(--ink); border: 0; padding: 4px 12px; cursor: pointer; }
.mls-contacts .m .plain { font-weight: 900; font-size: 11px; letter-spacing: 2px; background: none; color: var(--muted); border: 0; cursor: pointer; }
.mls button.mls-btn { justify-self: start; font-weight: 900; font-size: 12px; letter-spacing: 2px; background: none; color: var(--paper); border: 2px solid var(--paper); padding: 6px 12px; cursor: pointer; }
.mls:not(.narrow) .mls-contacts .to-list { display: none; }
.mls.narrow .mls-contacts { grid-template-columns: minmax(0, 1fr); background: var(--ink); }
.mls.narrow .mls-contacts .list { position: static; max-height: none; border-right: 0; }
.mls.narrow .mls-contacts.open .list { display: none; }
.mls.narrow .mls-contacts:not(.open) .sheet { display: none; }
.mls.narrow .mls-contacts .hero { grid-template-columns: 110px minmax(0, 1fr); gap: 16px; }



.mls-bang { position: absolute; top: -14px; right: -12px; z-index: 3; width: 28px; height: 28px; display: grid; place-items: center;
  font-family: var(--display); font-size: 20px; background: var(--yellow); color: var(--ink); transform: rotate(8deg);
  box-shadow: 3px 3px 0 var(--red); animation: mls-pulse 1.4s ease-in-out infinite; pointer-events: none; }
@keyframes mls-pulse { 50% { transform: rotate(8deg) scale(1.15); } }
.mls-door { position: relative; }
.mls-door > .mls-bang { top: -8px; right: 6px; }
.mls-who b.bang { box-shadow: 0 0 0 3px var(--yellow); }

.mls button.mls-event, .mls-event { display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; align-items: center; background: var(--yellow); color: var(--ink);
  border: 0; padding: 14px 16px 14px 20px; cursor: pointer; text-align: left; clip-path: polygon(10px 0, 100% 0, calc(100% - 6px) 100%, 0 100%); }
.mls button.mls-event:hover { transform: translateX(-8px); }
.mls-event .k { grid-column: 1 / -1; font-size: 10px; font-weight: 900; letter-spacing: 3px; }
.mls-event .n { font-family: var(--display); font-size: 26px; letter-spacing: 1px; line-height: 1; }
.mls-event .hours { font-family: var(--display); font-size: 22px; }
.mls-event .d { grid-column: 1 / -1; font-size: 12px; font-weight: 700; }
.mls-event.later { background: #8e8b85; cursor: default; }
.mls-bondrow .tier b.cap.ready { background: var(--yellow); color: var(--ink); }

.mls-scene .when.tier { border-bottom-color: var(--yellow); }
.mls-scene .when .step { font-family: var(--display); font-size: 22px; line-height: 1.1; margin: 2px 0; }
.mls-scene .when .step s { color: var(--muted); text-decoration: none; }
.mls-scene .when .step b { color: var(--yellow); font-weight: 400; }
.mls-scene .box.gold { border-color: var(--yellow); box-shadow: 8px 8px 0 var(--yellow); }
.mls-scene .speaker.gold { background: var(--yellow); color: var(--ink); box-shadow: 4px 4px 0 var(--red); }
.mls-decide { display: grid; gap: 10px; cursor: default; }
.mls-decide .lbl { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--muted); }
.mls button.mls-choice { display: grid; grid-template-columns: auto 1fr; gap: 2px 14px; align-items: center; text-align: left; border: 0; cursor: pointer; padding: 12px 18px;
  clip-path: polygon(8px 0, 100% 0, calc(100% - 4px) 100%, 0 100%); }
.mls-choice .ico { grid-row: span 3; font-family: var(--display); font-size: 30px; line-height: 1; }
.mls-choice b { font-family: var(--display); font-weight: 400; font-size: 22px; letter-spacing: .5px; }
.mls-choice small { font-size: 12px; font-weight: 700; }
.mls button.mls-choice.step { background: var(--yellow); color: var(--ink); }
.mls button.mls-choice.wait { background: #2b2b30; color: var(--paper); }
.mls-choice.wait small { color: var(--muted); }
.mls button.mls-choice:hover { box-shadow: inset 6px 0 0 var(--red); }
.mls button.mls-choice.off { background: #6d6a64; color: #2b2a27; cursor: not-allowed; }
.mls button.mls-choice.off:hover { box-shadow: none; }
.mls-choice .cost { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
.mls-choice .cost i { font-style: normal; font-size: 11px; font-weight: 900; letter-spacing: 1px; background: var(--ink); color: var(--paper); padding: 2px 8px; }
.mls-stamp { position: absolute; left: 50%; bottom: calc(100% + 110px); transform: translateX(-50%) rotate(-6deg); text-align: center; pointer-events: none; }
.mls-stamp .up { font-size: 13px; font-weight: 900; letter-spacing: 5px; background: var(--ink); padding: 4px 12px; display: inline-block; }
.mls-stamp .big { font-family: var(--display); font-size: clamp(56px, 9vw, 110px); line-height: .95; color: var(--yellow); text-shadow: 7px 7px 0 var(--red); white-space: nowrap; }


.mls-scene .when .left b { color: var(--red); }
.mls-scene .when .track { height: 6px; background: #2b2b30; margin-top: 6px; position: relative; min-width: 220px; }
.mls-scene .when .track i { position: absolute; inset: 0 auto 0 0; background: var(--paper); transition: width .4s; }
.mls-scene .when .count { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-top: 5px; text-transform: uppercase; }

.mls-scene .controls { position: absolute; right: 12px; top: -34px; display: flex; gap: 6px; }
.mls-scene .controls button { font-weight: 900; font-size: 11px; letter-spacing: 2px; background: var(--ink); color: var(--paper);
  border: 2px solid var(--paper); padding: 4px 10px; cursor: pointer; }
.mls-scene .controls button.on { background: var(--yellow); color: var(--ink); border-color: var(--yellow); }
.mls-scene .controls button:disabled { opacity: .4; cursor: default; }

.mls-scene-log { position: absolute; inset: 0; z-index: 8; background: rgba(11,11,13,.95); padding: 60px max(16px, calc(50% - 480px)) 30px; overflow: auto; cursor: default; }
.mls-scene-log .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }

.mls-scene-log .head { position: sticky; top: -60px; z-index: 1; background: rgba(11,11,13,.98); padding: 14px 0 10px; margin-top: -14px; }
.mls-scene-log h2 { font-family: var(--display); font-weight: 400; font-size: 34px; margin: 0; }
.mls button.end-log { font-weight: 900; font-size: 11px; letter-spacing: 2px; background: var(--red); color: var(--paper); border: 0; padding: 6px 14px; cursor: pointer; }
.mls-scene-log .row { padding: 8px 0; border-bottom: 1px solid #2b2b30; line-height: 1.5; user-select: text; }
.mls-scene-log .row b { font-family: var(--display); font-weight: 400; letter-spacing: 1px; margin-right: 8px; color: var(--yellow); }
.mls-scene-log .row.you b { color: var(--red); }
.mls-scene-log .row.narration { font-style: italic; color: #b9c6d8; }

.mls.narrow .mls-scene { display: flex; flex-direction: column; gap: 12px; padding: 14px 12px 16px; height: auto; min-height: clamp(640px, calc(100vh - 110px), 1100px); }
.mls.narrow .mls-scene .when { position: relative; top: auto; left: auto; align-self: flex-start; min-width: 0; max-width: 100%; }

.mls.narrow .mls-scene .bonds { position: relative; top: auto; right: auto; left: auto; bottom: auto; width: auto; order: 3; }
.mls.narrow .mls-scene .box { order: 2; }
.mls.narrow .mls-scene .when { order: 1; margin-bottom: 54px; }
.mls.narrow .mls-scene .box { position: relative; left: auto; bottom: auto; transform: none; width: auto; margin-top: auto; }
.mls.narrow .mls-scene .controls, .mls.narrow .mls-scene button.end { top: -48px; }
.mls.narrow .mls-scene .speaker { left: 20px; top: 0; transform: translateY(-38%) rotate(-3deg); font-size: 22px; }
.mls.narrow .mls-scene .speaker + * { margin-top: 8px; }

.mls.narrow .mls-stamp { width: 100%; }
.mls.narrow .mls-stamp .big { font-size: clamp(36px, 12vw, 56px); white-space: normal; text-shadow: 5px 5px 0 var(--red); }


.mls-people .mls-person { transition: transform .15s ease-out, filter .15s; }
.mls-people.talking .mls-person:not(.picked) { filter: brightness(.35) saturate(.4); }
.mls-person.picked .body { filter: drop-shadow(0 0 18px rgba(255,255,255,.35)); }
.mls-bubble { position: absolute; left: 3%; bottom: calc(clamp(110px, 12vw, 220px) * 2.2 + 10px); z-index: 5;
  width: clamp(220px, 26vw, 380px); background: var(--paper); color: var(--ink); padding: 12px 16px 30px;
  font-size: 15px; font-weight: 700; line-height: 1.35; transform: rotate(-2deg);
  clip-path: polygon(0 0, 100% 0, 100% 86%, 22% 86%, 6% 100%, 10% 86%, 0 86%); }
.mls-bubble b { display: block; font-family: var(--display); font-weight: 400; font-size: 13px; letter-spacing: 2px; color: var(--red); margin-bottom: 2px; }
.mls-bubble i { font-weight: 400; color: #555; }
.mls-bubble.flat { background: #d8d4cb; }
.mls-bubble.waiting { font-size: 26px; letter-spacing: 4px; animation: mls-think 1s ease-in-out infinite; }
@keyframes mls-think { 50% { opacity: .45; } }
.mls-bubble .left { display: block; margin-top: 8px; font-size: 12px; font-weight: 700; font-style: italic; color: #666; }


.mls-loading { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: clip; z-index: 60; cursor: progress; background: rgba(11,11,13,0);
  animation: mls-dim .2s ease .3s forwards; }
.mls-loading.quiet { animation: none; }
.mls-loading .msg { position: sticky; top: 42%; margin: 20vh auto 0; width: max-content; max-width: 80%; display: flex; align-items: center; gap: 14px;
  font-family: var(--display); font-size: 28px; letter-spacing: 1px; background: var(--ink); border-bottom: 5px solid var(--red);
  padding: 10px 22px; box-shadow: 6px 6px 0 var(--red); transform: rotate(-2deg); opacity: 0; animation: mls-show .2s ease .3s forwards; }
.mls-loading .msg i { width: 18px; height: 18px; border: 4px solid var(--yellow); border-right-color: transparent; border-radius: 50%; animation: mls-spin .8s linear infinite; }

.mls button.mls-cancel { margin-left: 10px; font-family: var(--body); font-size: 11px; font-weight: 900; letter-spacing: 2px;
  background: transparent; color: var(--paper); border: 2px solid var(--paper); padding: 4px 10px; cursor: pointer; transform: rotate(2deg); }
.mls button.mls-cancel:hover { background: var(--red); border-color: var(--red); }
.mls-readall.stop { background: var(--yellow); color: var(--ink); }
@keyframes mls-dim { to { background: rgba(11,11,13,.55); } }
@keyframes mls-show { to { opacity: 1; } }
@keyframes mls-spin { to { transform: rotate(360deg); } }



.mls-place-top { display: flex; flex-wrap: wrap; align-items: stretch; gap: 8px; margin-bottom: 6px; }

.mls-place-top > * { align-self: stretch; margin: 0; display: flex; align-items: center; box-sizing: border-box; }
.mls-place-hud { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; background: var(--ink); padding: 2px 12px;
  border-bottom: 4px solid var(--red); font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
.mls-place-hud .clock { font-family: var(--display); font-size: 18px; letter-spacing: 1px; line-height: 1; text-transform: none; }
.mls-place-hud .clock b { font-family: var(--body); font-size: 10px; letter-spacing: 2px; color: var(--yellow); margin-right: 6px; vertical-align: 2px; }
.mls-place-hud .need { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); }
.mls-place-hud .cash { font-family: var(--display); font-size: 16px; color: var(--yellow); letter-spacing: 0; }

.mls-talk { position: absolute; right: 16px; top: 16px; bottom: 16px; z-index: 4; width: min(480px, 40vw);
  display: flex; flex-direction: column; gap: 9px; overflow: auto; padding-left: 4px; }
.mls-talk .who-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.mls-talk .who-head h2 { font-family: var(--display); font-weight: 400; font-size: 40px; line-height: 1; margin: 0; }
.mls-talk .who-head button { font-weight: 900; font-size: 11px; letter-spacing: 2px; background: none;
  border: 2px solid var(--paper); color: var(--paper); padding: 3px 10px; cursor: pointer; }
.mls-bondbox { background: rgba(11,11,13,.85); padding: 10px 14px; display: grid; gap: 7px; border-left: 5px solid var(--c); }

.mls-bondrow { display: grid; grid-template-columns: 108px 44px minmax(40px, 1fr) minmax(96px, max-content); align-items: center; gap: 8px; font-size: 11px; font-weight: 900;
  letter-spacing: 2px; text-transform: uppercase; }
.mls-bondrow .num { display: flex; justify-content: flex-start; }
.mls-bondrow .bar { height: 8px; background: #2b2b30; display: block; }
.mls-bondrow .bar i { display: block; height: 100%; background: var(--paper); }
.mls-bondrow.up .bar i { background: var(--yellow); }
.mls-bondrow.down .bar i { background: var(--red); }
.mls-bondrow .tier { font-size: 11px; letter-spacing: 1px; color: var(--yellow); text-align: right; text-transform: none; }
.mls-bondrow .delta { color: var(--ink); background: var(--yellow); padding: 0 5px; letter-spacing: 0; white-space: nowrap; }
.mls-bondrow.down .delta { background: var(--red); color: var(--paper); }
.mls-talk .sep { font-family: var(--display); font-size: 16px; letter-spacing: 2px; color: var(--muted); margin-top: 4px; }
.mls-opt { display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; align-items: center; text-align: left; border: 0;
  background: var(--paper); padding: 10px 14px 10px 18px; cursor: pointer; clip-path: polygon(10px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
  transition: transform .12s; }
.mls button.mls-opt { color: var(--ink); }
.mls-opt:hover { transform: translateX(-8px); box-shadow: inset 6px 0 0 var(--red); }
.mls-opt .n { font-weight: 900; font-size: 17px; }
.mls-opt .hours { font-family: var(--display); font-size: 22px; line-height: 1; text-align: right; }
.mls-opt .d { grid-column: 1 / -1; font-size: 12px; color: #555; font-weight: 700; }
.mls-opt.used { background: #b9b5ad; }
.mls-opt.off { background: #8e8b85; color: var(--ink); cursor: not-allowed; }
.mls-opt.off:hover { transform: none; box-shadow: none; }
.mls-opt.off .d { color: var(--red-dark); }
.mls-opt.vn { background: #6a2a2a; color: #d9b3b3; }
.mls-opt.vn .d { color: #ffd9d9; }

.mls-acts { position: absolute; right: 16px; top: 16px; bottom: 16px; z-index: 4; width: min(480px, 40vw);
  display: flex; flex-direction: column; gap: 8px; overflow: auto; padding-left: 4px; }
.mls-acts-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.mls-acts h2 { font-family: var(--display); font-weight: 400; font-size: 22px; letter-spacing: 2px; color: var(--muted); }
.bar-mini { width: 54px; height: 9px; background: #2b2b30; display: inline-block; }
.bar-mini i { display: block; height: 100%; background: var(--paper); }
.bar-mini.low i { background: var(--red); }

.mls-activity { display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; align-items: center; text-align: left;
  background: var(--paper); color: var(--ink); border: 0; padding: 10px 14px 10px 18px; cursor: pointer;
  clip-path: polygon(10px 0, 100% 0, calc(100% - 6px) 100%, 0 100%); transition: transform .12s, box-shadow .12s; }
.mls-activity:hover { transform: translateX(-8px); box-shadow: inset 6px 0 0 var(--red); }
.mls-activity .n { font-weight: 900; font-size: 17px; }
.mls-activity .hours { font-family: var(--display); font-size: 22px; line-height: 1; text-align: right; }
.mls-activity .hours small { display: block; font-family: var(--body); font-size: 10px; font-weight: 900; letter-spacing: 1px; color: #666; }
.mls-activity .chips { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 5px; }
.mls-activity .why { grid-column: 1 / -1; font-size: 11px; font-weight: 900; color: var(--red-dark); }
.mls-activity.off { background: #8e8b85; cursor: not-allowed; }
.mls-activity.off:hover { transform: none; box-shadow: none; }
.mls-activity .chip { font-size: 11px; font-weight: 900; padding: 1px 7px; background: #e2ded5; }
.mls-activity .chip.gain { background: var(--ink); color: var(--yellow); }
.mls-activity .chip.money { background: var(--red); color: var(--paper); }
.mls-activity .chip.money.pay { background: #1b7a3a; }



.mls-create { display: grid; grid-template-columns: 250px minmax(0, 1fr); min-height: 100%; background: var(--ink); }
.mls-index { position: sticky; top: 0; align-self: start; height: 100vh; padding: 20px 14px; border-right: 3px solid var(--line);
  display: flex; flex-direction: column; gap: 6px; }
.mls-index h1 { font-family: var(--display); font-weight: 400; font-size: 40px; line-height: .95; margin-bottom: 12px;
  transform: rotate(-3deg); transform-origin: left; text-shadow: 4px 4px 0 var(--red); }
.mls-index a { color: var(--paper); text-decoration: none; font-weight: 900; font-size: 13px; letter-spacing: 2px;
  text-transform: uppercase; padding: 7px 10px; display: flex; justify-content: space-between; }
.mls-index a:hover { background: var(--line); }
.mls-index a span { color: var(--yellow); letter-spacing: 0; }
.mls-index .spacer { flex: 1; }
.mls-index .step { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--yellow); margin-bottom: 10px; }
.mls-start small { display: block; font-family: var(--body); font-size: 11px; font-weight: 700; letter-spacing: 1px; }
.mls-readall { font-family: var(--display); font-size: 20px; letter-spacing: 1px; background: var(--red); color: var(--paper);
  border: 0; padding: 6px 18px; cursor: pointer; }
.mls-readall:disabled { background: #4a4a50; color: #999; cursor: not-allowed; }
.mls-create .card.note .actions { margin-top: 10px; }
.mls-member .who small.failed { color: var(--paper); background: var(--red); padding: 0 6px; }
.mls-index .todo { font-size: 12px; color: var(--muted); line-height: 1.5; }
.mls-index .todo b { color: var(--yellow); }
.mls-start { font-family: var(--display); font-size: 28px; letter-spacing: 1px; background: var(--red); color: var(--paper);
  border: 0; padding: 8px 14px; cursor: pointer; text-align: left; clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%); }
.mls-start:disabled { background: #4a4a50; color: #999; cursor: not-allowed; }

.mls-create main { padding: 22px clamp(16px, 3vw, 44px) 80px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 28px; align-content: start; min-width: 0; }

.mls-create main > * { min-width: 0; }
.mls-create section { grid-template-columns: minmax(0, 1fr); }
.mls-create section > *, .mls-create .card > * { min-width: 0; }

.mls-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 12px 18px;
  padding-top: 18px; border-top: 3px solid var(--line); }
.mls-actions .todo { margin-right: auto; max-width: 520px; font-size: 12px; color: var(--muted); line-height: 1.5; }
.mls-actions .todo b { color: var(--yellow); }
.mls-actions .btns { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 10px; }
.mls-actions .mls-start { min-width: 220px; }
.mls-actions .mls-back { align-self: center; margin: 0; }
.mls-create section { display: grid; gap: 12px; scroll-margin-top: 16px; }
.mls-create h2 { font-family: var(--display); font-weight: 400; font-size: 30px; line-height: 1; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; }
.mls-create h2 span { font-family: var(--body); font-size: 12px; font-weight: 700; color: var(--muted); letter-spacing: 1px; }
.mls-create .card { background: var(--panel); border-left: 5px solid var(--red); padding: 14px 16px; display: grid; gap: 12px; }
.mls-create .card.note { display: block; border-left-color: var(--yellow); font-size: 13px; line-height: 1.6; color: #d8d4cb; }
.mls-create .card.note code { background: #1c1c20; padding: 1px 6px; }
.mls-create .lbl { font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }
.mls-create .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; align-items: start; }
.mls-create .field { display: grid; gap: 6px; font-size: 11px; font-weight: 900; letter-spacing: 2px;
  text-transform: uppercase; color: var(--muted); align-content: start; }
.mls-create .field.wide { grid-column: 1 / -1; }
.mls-create input[type=text], .mls-create input[type=number], .mls-create select, .mls-create textarea,
.mls-create .mls-set-fields :is(input, select, textarea) { background: #1c1c20; border: 2px solid #3a3a40;
  padding: 8px 10px; outline: none; width: 100%; color: var(--paper); font: inherit; font-weight: 400;
  letter-spacing: 0; text-transform: none; }
.mls-create textarea { min-height: 90px; line-height: 1.5; resize: vertical; }
.mls-create input:focus, .mls-create select:focus, .mls-create textarea:focus { border-color: var(--yellow); }
.mls-create .count { font-size: 11px; color: var(--muted); text-align: right; }
.mls-create details > summary { cursor: pointer; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }
.mls-create details[open] > summary { margin-bottom: 12px; }
.mls-create .mls-sampling .field { flex: 1 1 140px; min-width: 140px; }
.mls-create .mls-sampling .field.wide { flex-basis: 100%; }
.mls-create .muted { font-size: 13px; color: var(--muted); }

.mls-homes-who { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin: 0 0 12px; }
.mls-homes-who .lbl, .mls-homes-who .hint { grid-column: 1 / -1; }
.mls-homes-who .lbl { font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-homes-who button { display: grid; grid-template-columns: 34px minmax(0, 1fr); grid-template-rows: auto auto; column-gap: 8px; align-items: center; background: #2b2b30; color: var(--paper); border: 0; padding: 5px 12px 5px 5px; cursor: pointer; text-align: left; }
.mls-homes-who button .mls-news-face { grid-row: 1 / 3; }
.mls-homes-who button { min-width: 0; }
.mls-homes-who button b { font-size: 13px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mls-homes-who button small { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: var(--muted); }
.mls-homes-who button.on { background: var(--yellow); color: #000; }
.mls-homes-who button.on small { color: #000; }
.mls-homes-who button:disabled { opacity: .4; cursor: default; }

.mls-create .mls-homes-who { margin: 12px 0 6px; }
.mls-create .mls-homes-who button { grid-template-rows: auto; }
.mls-create .mls-homes-who button .mls-news-face { grid-row: auto; }
.mls-create .err.soft { background: #3a1416; }


.mls-personas { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 10px; }
.mls-persona { background: var(--paper); border: 0; padding: 6px; cursor: pointer; display: grid; gap: 5px;
  grid-template-rows: auto 2.4em; align-content: start; text-align: center; overflow: hidden; }
.mls-persona .ph { position: relative; aspect-ratio: 1; background: #6b4a3a; display: grid; place-items: center;
  overflow: hidden; font-family: var(--display); font-size: 34px; color: rgba(255,255,255,.85); }
.mls-persona .ph img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls-persona b { font-family: var(--display); font-weight: 400; font-size: 15px; line-height: 1.15; color: var(--ink);
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-word; }
.mls-persona.on { outline: 4px solid var(--red); outline-offset: -2px; }

.mls-cast { display: grid; gap: 8px; }

.mls-member { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; gap: 10px 12px; align-items: center;
  background: var(--panel); padding: 10px 12px; border-left: 5px solid #3a3a40; }
.mls-member.on { border-left-color: var(--red); }
.mls-member .face { width: 44px; height: 44px; background: #2b2b30 center top/cover no-repeat; display: grid; place-items: center;
  font-family: var(--display); font-size: 20px; overflow: hidden; }
.mls-member .who b { display: block; line-height: 1.1; overflow-wrap: normal; word-break: keep-all; }
.mls-member .who b { font-family: var(--display); font-weight: 400; font-size: 20px; letter-spacing: .5px; }
.mls-member .who small { display: block; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-member .tools { display: flex; gap: 6px; justify-self: end; }
.mls-member .who small.reading { color: var(--yellow); }
.mls-member .who small.proposed { color: var(--ink); background: var(--yellow); padding: 0 6px; }
.mls-member .why { grid-column: 1 / -1; font-size: 12px; line-height: 1.45; color: #d8d4cb; }
.mls-member .why.bad { color: #ff8a8a; }
.mls-member .fields { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 10px; align-items: end; }
.mls-member .fields label { display: grid; gap: 4px; font-size: 10px; font-weight: 900; letter-spacing: 2px;
  text-transform: uppercase; color: var(--muted); }

.mls-member .romance { grid-column: 1 / -1; }

.mls-places-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 8px; }
.mls-place-row { display: flex; align-items: center; gap: 10px; background: var(--panel); padding: 8px 12px; cursor: pointer; }
.mls-place-row b { font-family: var(--display); font-weight: 400; font-size: 20px; }

.mls-create .mls-place-row input.mls-place-name { font-family: var(--display); font-size: 20px; font-weight: 400; min-width: 0; flex: 1;
  background: transparent; border: 0; border-bottom: 2px dashed transparent; padding: 0 2px; }
.mls-create .mls-place-row input.mls-place-name::placeholder { color: var(--paper); opacity: 1; }
.mls-create .mls-place-row input.mls-place-name:hover { border-bottom-color: #55555c; }
.mls-create .mls-place-row input.mls-place-name:focus { border-bottom-color: var(--yellow); background: #1c1c20; }
.mls-create .mls-place-row.off input.mls-place-name { text-decoration: line-through; }
.mls-place-row .mls-tg { cursor: pointer; }

.mls-place-row { flex-wrap: wrap; row-gap: 0; }
.mls-place-row small { flex-basis: 100%; margin-left: 0; padding-left: 50px; line-height: 1.2; }
.mls-place-row small { margin-left: auto; font-size: 10px; font-weight: 900; letter-spacing: 1px; color: var(--muted); }
.mls-place-row.off { opacity: .45; }
.mls-place-row.off b { text-decoration: line-through; }

.mls-toggles { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px 20px; }

.mls-modules { display: grid; gap: 12px; }
.mls-module { border: 2px solid var(--line); background: #101013; }
.mls-module-head { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; }
.mls-module-head .mls-tg { flex: 1; }
.mls-module-fold { background: #1c1c20; color: var(--paper); border: 0; width: 34px; height: 34px; font-size: 16px; font-weight: 900; cursor: pointer; }
.mls-module-fold:hover { background: var(--red); }
.mls-module-sum { padding: 0 14px 12px 62px; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--muted); }
.mls-module-body { border-top: 2px solid var(--line); padding: 12px 14px 14px; display: grid; gap: 16px; }
.mls-module-group { display: grid; gap: 10px; }
.mls-module-group > .lbl { border-bottom: 2px solid var(--line); padding-bottom: 6px; }
@media (max-width: 480px) { .mls-module-sum { padding-left: 14px; } }

.mls .mls-modopt-open { background: #000; color: var(--paper); border: 2px solid var(--line); font: 700 12px Arial, sans-serif; letter-spacing: 0; padding: 3px 8px; cursor: pointer; text-align: left; }
.mls .mls-modopt-open:hover { border-color: var(--muted); }
.mls-modopt-panel { margin: 6px 0 2px; border: 2px solid var(--line); background: #101013; padding: 12px; display: grid; gap: 12px; max-width: 640px; }
.mls-modopt-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px 14px; }
.mls-modopt-f { display: grid; gap: 4px; }
.mls-modopt-panel .lbl { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls .mls-modopt-panel select { width: 100%; min-width: 0; background: #000; color: var(--paper); border: 2px solid var(--line); font: 700 12px Arial, sans-serif; padding: 3px 6px; }
.mls-modopt-sec { display: grid; gap: 6px; border-top: 2px solid var(--line); padding-top: 10px; }
.mls-modopt-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.mls-modopt-chip { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; padding: 3px 4px 3px 10px; background: var(--paper); color: var(--ink); }
.mls-modopt-chip.bad { background: #2a1214; color: var(--paper); border: 2px solid var(--red); }
.mls .mls-modopt-chip button { background: none; border: 0; color: inherit; font-weight: 900; cursor: pointer; padding: 0 4px; }
.mls .mls-modopt-chip select { width: auto; padding: 1px 4px; }
.mls .mls-modopt-panel input[type="text"] { width: 100%; min-width: 0; background: #000; color: var(--paper); border: 2px solid var(--line); font: 700 12px Arial, sans-serif; padding: 3px 6px; }
.mls-modopt-none { font-size: 12px; color: var(--muted); }
@media (max-width: 560px) { .mls-modopt-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.mls-tg { display: inline-flex; align-items: flex-start; gap: 10px; cursor: pointer; user-select: none; }
.mls-tg input { display: none; }
.mls-tg i { width: 42px; height: 22px; background: #3a3a40; position: relative; flex: none; margin-top: 2px;
  clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%); }
.mls-tg i::after { content: ""; position: absolute; top: 3px; left: 5px; width: 16px; height: 16px; background: var(--paper); transition: left .15s; }
.mls-tg input:checked + i { background: var(--red); }
.mls-tg input:checked + i::after { left: 21px; }
.mls-tg b { font-size: 14px; }
.mls-tg small { display: block; font-size: 12px; color: var(--muted); }
.mls-tg.inline { align-items: center; font-size: 12px; font-weight: 900; letter-spacing: 1px; }

.mls-create .points { display: grid; gap: 8px; }
.mls-create .pt { display: grid; grid-template-columns: 120px 1fr auto; align-items: center; gap: 12px; }
.mls-create .pt b { text-transform: capitalize; }
.mls-create .pips { display: flex; gap: 4px; }
.mls-create .pips i { width: 16px; height: 12px; background: #3a3a40; clip-path: polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%); }
.mls-create .pips i.on { background: var(--yellow); }
.mls-create .pm { display: flex; gap: 4px; }
.mls-create .pm button { width: 26px; height: 26px; background: var(--line); border: 0; cursor: pointer; font-weight: 900; color: var(--paper); }
.mls-create .pm button:disabled { opacity: .35; cursor: not-allowed; }


.mls-add { background: none; border: 3px dashed #3a3a40; color: var(--muted); padding: 14px; cursor: pointer;
  font-family: var(--display); font-size: 22px; letter-spacing: 1px; display: grid; gap: 2px; justify-items: center; }
.mls-add:hover { border-color: var(--paper); color: var(--paper); }
.mls-add small { font-family: var(--body); font-size: 12px; font-weight: 700; letter-spacing: 0; }
.mls-drop { justify-self: end; background: none; border: 2px solid #4a4a50; color: var(--muted); font-size: 10px;
  font-weight: 900; letter-spacing: 2px; padding: 4px 10px; cursor: pointer; white-space: nowrap; }
.mls-drop:hover { border-color: var(--red); color: var(--red); }
.mls-member .face img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }

.mls-overlay:empty { display: none; }
.mls-overlay { position: fixed; inset: 0; z-index: 2147483000; background: none; min-height: 0; }
.mls-modal { position: fixed; inset: 0; z-index: 2147483000; background: rgba(11,11,13,.86); display: grid; place-items: center; padding: 20px;
  /* minmax(0, 1fr): an auto track grows to the tag bar's full scroll width and pushes the picker off-screen. */
  grid-template-columns: minmax(0, 1fr); }
.mls-picker { background: var(--panel); border-left: 6px solid var(--red); width: min(720px, 100%); max-height: min(80vh, 640px);
  display: flex; flex-direction: column; gap: 10px; padding: 16px 18px; box-shadow: 10px 10px 0 var(--ink); }
.mls-picker .head { display: flex; align-items: baseline; gap: 12px; }
.mls-picker h3 { font-family: var(--display); font-weight: 400; font-size: 26px; letter-spacing: 1px; }
.mls-picker .count { font-size: 12px; color: var(--muted); }
.mls-done { margin-left: auto; font-family: var(--display); font-size: 20px; letter-spacing: 1px; background: var(--red);
  color: var(--paper); border: 0; padding: 4px 18px; cursor: pointer; }
.mls-picker .list { flex: 1 1 auto; min-height: 0; overflow: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; align-content: start; }
.mls-picker .pick { display: grid; grid-template-columns: auto 38px 1fr; align-items: center; gap: 10px;
  background: #1c1c20; padding: 7px 10px; cursor: pointer; border-left: 4px solid transparent; }
.mls-picker .pick.on { border-left-color: var(--red); background: #241a1b; }
.mls-picker .pick .face { width: 38px; height: 38px; background: #2b2b30; display: grid; place-items: center; overflow: hidden;
  font-family: var(--display); font-size: 17px; }
.mls-picker .pick .face img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls-picker .pick b { font-size: 14px; overflow-wrap: anywhere; }

.mls-picker .pick .nm { display: grid; min-width: 0; }
.mls-picker .pick .nm small { font-size: 11px; font-weight: 700; color: var(--muted); overflow-wrap: anywhere; }
.mls-picker .pick .nm small.title { font-style: italic; }
.mls-picker .pick .face { position: relative; }
.mls-picker .pick .face .fav { position: absolute; top: 0; right: 0; font-style: normal; font-size: 11px; line-height: 1; padding: 1px 2px; background: var(--ink); color: var(--yellow); }
.mls-picker .pick .tags { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px; }
.mls-picker .pick .tags span { font-size: 9px; font-weight: 900; padding: 1px 5px; background: #2b2b30; color: var(--muted); }
.mls-picker-tags button { letter-spacing: 0; }
.mls-member .who small.title { display: block; font-size: 11px; font-weight: 700; color: var(--muted); letter-spacing: 0; text-transform: none; }

.mls-picker-groups { flex: none; display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
.mls-picker-groups button { flex: none; display: inline-flex; align-items: baseline; gap: 6px; background: #2b2b30; color: var(--paper); border: 0; padding: 5px 10px; font-weight: 900; font-size: 11px; letter-spacing: 1px; cursor: pointer; }
.mls-picker-groups button small { font-size: 10px; color: var(--muted); font-weight: 700; }
.mls-picker-groups button.on { background: var(--red); }
.mls-picker-groups button.on small { color: var(--paper); }



.mls-create select.needed { border-color: var(--red); }
.mls-seg { display: grid; gap: 6px; align-content: start; }
.mls-create .card .mls-seg + .mls-seg { margin-top: 14px; }
.mls-seg .pick { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; padding: 6px 8px; background: #16161a; }
.mls-seg .pick.on { background: #1f1f18; box-shadow: inset 4px 0 0 var(--yellow); }
.mls-seg .pick input { margin-top: 3px; accent-color: var(--red); }

.mls-size { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px; }
.mls-size .shorts { display: flex; gap: 6px; margin-right: 8px; }
.mls-size .field { width: 120px; }
.mls-size .x { padding-bottom: 8px; font-weight: 900; color: var(--muted); }
.mls-size-warn { margin: 8px 0 0; padding: 6px 10px; font-size: 12px; line-height: 1.4; color: var(--yellow); background: #1c1a10; box-shadow: inset 3px 0 0 var(--yellow); }
.mls-seg .pick b { display: block; font-size: 13px; }
.mls-seg .pick small { display: block; font-size: 11px; color: var(--muted); line-height: 1.4; }
.mls-member .why.week { color: var(--yellow); }
.mls-picker .pick.full { opacity: .35; cursor: not-allowed; }
.mls-create .field .hint { font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; color: var(--muted); }
.mls-week-find { background: #1c1c20; border: 2px solid #3a3a40; padding: 6px 8px; color: var(--paper); width: 100%; margin-bottom: 6px; }
.mls-week-find:focus { border-color: var(--yellow); outline: none; }
.mls-member .why.hidden-note { grid-column: 1 / -1; color: var(--muted); }


.mls button.mls-peek { background: none; border: 2px solid var(--yellow); color: var(--yellow); font-size: 10px; font-weight: 900;
  letter-spacing: 1.5px; padding: 3px 8px; margin-left: 8px; cursor: pointer; vertical-align: 1px; }
.mls button.mls-peek:hover { background: var(--yellow); color: var(--ink); }
.mls button.mls-peek.big { font-size: 12px; padding: 9px 14px; margin: 4px 0 0; justify-self: start; }
.mls-covered { background: repeating-linear-gradient(135deg, #141417 0 14px, #18181c 14px 28px); border-left: 5px solid var(--yellow);
  padding: 22px 20px; display: grid; gap: 8px; font-size: 14px; line-height: 1.55; }
.mls-covered b { color: var(--yellow); }
.mls-covered .small { font-size: 12px; color: var(--muted); }
.mls-peeknote { font-size: 12px; color: var(--yellow); margin: 0; }


.mls-weekstep .mls-lede { font-size: 13px; color: var(--muted); line-height: 1.6; max-width: 80ch; }
.mls-weekstep .lbl { border-bottom: 2px solid var(--line); padding-bottom: 6px; }
.mls-hint { font-size: 12px; color: var(--muted); }
.mls-cast-list { display: grid; gap: 4px; overflow-y: auto; }
.mls-cast-row { display: flex; align-items: center; gap: 9px; width: 100%; background: none; border: 0;
  border-left: 5px solid var(--c); padding: 7px 8px; cursor: pointer; text-align: left; }
.mls-cast-row:hover { background: var(--line); }
.mls-cast-row.on { background: var(--paper); color: var(--ink); }
.mls-cast-row .face { width: 30px; height: 30px; flex: none; background: var(--c) center top/cover no-repeat; display: grid;
  place-items: center; font-family: var(--display); font-size: 16px; color: rgba(255,255,255,.9); overflow: hidden; }
.mls-cast-row .face img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls-cast-row .what { min-width: 0; }
.mls-cast-row b { display: block; font-size: 13px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mls-cast-row small { display: block; font-size: 10px; color: var(--muted); }
.mls-cast-row.on small { color: #6f6c66; }

.mls-wrote { background: var(--panel); border-left: 5px solid var(--yellow); padding: 12px 14px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 9px; }
.mls-wrote .acts button { white-space: normal; text-align: left; }
.mls-wrote .said { font-size: 14px; line-height: 1.55; }
.mls-wrote .said em { font-style: italic; color: var(--yellow); }
.mls-wrote .from { font-size: 12px; color: var(--muted); line-height: 1.5; }
.mls-wrote .acts { display: flex; flex-wrap: wrap; gap: 8px; }

.mls-templates { display: grid; grid-template-columns: repeat(auto-fit, minmax(185px, 1fr)); gap: 8px; }
.mls-template { background: #16161a; border: 0; border-left: 4px solid #3a3a40; padding: 9px 11px; cursor: pointer;
  text-align: left; display: grid; gap: 5px; align-content: start; color: var(--paper); }
.mls-template:hover { background: #1b1b20; border-left-color: var(--paper); }
.mls-template b { font-size: 13px; font-weight: 900; }
.mls-template span { font-size: 11px; color: var(--muted); line-height: 1.35; }

.mls-weekwrap { overflow-x: auto; }
.mls-week { display: grid; grid-template-columns: 46px repeat(7, minmax(74px, 1fr)); gap: 2px; min-width: 560px; }
.mls-week .dh { background: #1c1c20; border: 0; color: var(--paper); font-weight: 900; font-size: 11px; letter-spacing: 2px;
  padding: 7px 4px; cursor: pointer; text-transform: uppercase; }
.mls-week .dh:hover { background: var(--line); }
.mls-week .dh.on { background: var(--paper); color: var(--ink); }
.mls-week .hours, .mls-week .col { display: grid; grid-auto-rows: 20px; gap: 2px; }
.mls-week .hh { font-size: 10px; font-weight: 900; color: #55535a; padding-right: 6px; text-align: right; line-height: 20px; }
.mls-week .hh.mark { color: var(--muted); }
.mls-week .c { background: #16161a; box-shadow: inset 0 0 0 1px #202027; font-size: 11px; line-height: 1.1;
  padding: 2px 5px 0; overflow: hidden; white-space: nowrap; cursor: pointer; }
.mls-week .c.on { background: var(--c); box-shadow: none; color: #fff; }
.mls-week .c.head { font-weight: 900; }
.mls-week .c small { font-weight: 400; opacity: .82; margin-left: 4px; font-size: 10px; }

.mls-week .col { opacity: .5; transition: opacity .12s; }
.mls-week .col.on { opacity: 1; }
.mls-key { display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px; color: var(--muted); }
.mls-key i { display: inline-block; width: 10px; height: 10px; margin-right: 5px; vertical-align: -1px; }
.mls-key i.none { background: #16161a; box-shadow: inset 0 0 0 1px #202027; }

.mls-dayhead { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; }
.mls-dayhead h3 { font-family: var(--display); font-weight: 400; font-size: 26px; letter-spacing: .5px; margin: 0; }
.mls-dayhead .lbl { margin-left: auto; border: 0; padding: 0; }
.mls-lines { display: grid; gap: 6px; }
.mls-line { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; background: var(--panel);
  padding: 8px 12px; border-left: 5px solid var(--c); font-size: 13px; }
.mls-line .w { color: var(--muted); font-size: 12px; }
.mls-line select { padding: 5px 6px; font-size: 13px; width: auto; }
.mls-line select.place { font-weight: 700; min-width: 108px; }
.mls-line input { width: 170px; padding: 5px 8px; font-size: 12px; }
.mls-line .next { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: var(--yellow); }
.mls-line .x { margin-left: auto; background: none; border: 0; color: #5c5c64; cursor: pointer; font-weight: 900; padding: 2px 6px; }
.mls-line .x:hover { color: var(--red); }
.mls-addblock { border: 3px dashed #3a3a40; background: none; padding: 10px; font-weight: 900; letter-spacing: 2px;
  font-size: 12px; color: var(--muted); cursor: pointer; }
.mls-addblock:hover { border-color: var(--paper); color: var(--paper); }
.mls-gaps { font-size: 12px; color: var(--muted); line-height: 1.6; margin: 0; }
.mls-gaps b { color: var(--yellow); }
.mls-after { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.mls-after .lbl { border: 0; padding: 0; }
.mls button.mls-drop.soft { border-color: #3a3a40; color: var(--muted); }


.mls-lifetools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: flex-end; max-width: 1100px;
  margin: -10px 0 14px; font-size: 12px; font-weight: 900; letter-spacing: 1px; }
.mls-lifetools span { color: var(--paper); background: var(--ink); padding: 3px 10px; }
.mls button.mls-drop.danger { border-color: var(--red); color: var(--paper); background: var(--red); }
.mls button.mls-drop.danger:disabled { background: none; color: var(--muted); border-color: #4a4a50; }
.mls-tick { margin-left: auto; width: 26px; height: 26px; border: 3px solid currentColor; display: grid; place-items: center;
  font-weight: 900; font-size: 15px; }
.mls-tick.on { background: var(--red); border-color: var(--red); color: var(--paper); }



.mls-corridor { display: flex; flex-direction: column; height: max(480px, min(clamp(560px, calc(100vh - 190px), 1100px), var(--tab-h, 100vh))); overflow: hidden; }
.mls-corridor .hall { flex: 1; min-height: 0; }
.mls-corridor .top { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px; padding: 14px clamp(14px, 2.5vw, 40px); }
.mls-corridor .top h1 { font-family: var(--display); font-weight: 400; font-size: clamp(34px, 4vw, 52px); line-height: .9; margin: 0;
  transform: rotate(-3deg); text-shadow: 5px 5px 0 var(--red); }
.mls-corridor .top .sub { font-size: 12px; font-weight: 700; background: var(--panel); padding: 3px 10px; }
.mls-corridor .top .clock { margin-left: auto; font-family: var(--display); font-size: 28px; border-bottom: 4px solid var(--red); padding: 0 14px; }
.mls-corridor .top .clock small { font-family: var(--body); font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--yellow); margin-right: 8px; }
.mls-corridor > .mls-said { justify-self: start; margin: 0 clamp(14px, 2.5vw, 40px) 6px; text-align: left; max-width: none; }
.mls-corridor .hall { position: relative; overflow-x: auto; overflow-y: hidden; scrollbar-width: thin; }
.mls-corridor.building .hall { background: linear-gradient(180deg, #2a2320 0%, #3a302a 60%, #4a3f36 60%, #1d1916 100%); }
.mls-corridor.street .hall { background: linear-gradient(180deg, #1e3350 0%, #3b5d8a 45%, #6a7f99 58%, #3a3f4c 58%, #1a1c22 100%); }
.mls-corridor .row { display: flex; align-items: flex-end; gap: clamp(14px, 2vw, 30px); height: 100%; padding: 20px clamp(20px, 4vw, 60px) 5%; width: max-content; }
.mls-floor { align-self: stretch; display: flex; align-items: flex-start; padding: 6px 10px 0 12px; border-left: 3px solid rgba(255,255,255,.14);
  font-family: var(--display); font-size: 34px; letter-spacing: 2px; color: rgba(255,255,255,.3); line-height: 1; scroll-margin-left: 20px; }
.mls-door { position: relative; width: clamp(180px, 17vw, 250px); height: min(82%, 440px); display: grid; grid-template-rows: auto 1fr auto; transition: opacity .15s; }
.mls-door.dim { opacity: .25; }
.mls-door .plate { font-family: var(--display); font-size: 20px; letter-spacing: 1px; background: var(--pc, #3a3a40); color: #fff; padding: 5px 12px;
  text-align: center; transform: rotate(var(--r, -2deg)); box-shadow: 4px 4px 0 rgba(0,0,0,.6); margin: 0 12px -8px; position: relative; z-index: 2;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mls-door .plate small { display: block; font-family: var(--body); font-size: 10px; font-weight: 900; letter-spacing: 3px; opacity: .8; }
.mls-door .leaf { position: relative; border: 8px solid #120e0c; border-bottom: 0; overflow: hidden; background: linear-gradient(180deg, #5a3f2c, #33241a); }
.mls-door .leaf::after { content: ""; position: absolute; right: 22%; top: 52%; width: 10px; height: 10px; border-radius: 50%; background: #c9a86a; }
.mls-door .lit { position: absolute; top: 12%; left: 50%; transform: translateX(-50%); width: 46%; height: 9%; background: #1a1612; border: 3px solid #0d0a08; }
.mls-door .win { display: none; }
.mls-door .no { position: absolute; bottom: 12px; left: 12px; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: rgba(255,255,255,.4); }
.mls-door.in .lit { background: #ffd66b; box-shadow: 0 0 22px #ffb84d; }
.mls-corridor.street .mls-door .leaf { background: linear-gradient(180deg, #8a6a5a, #3a2a24); border-color: #1a1412; clip-path: polygon(0 18%, 50% 0, 100% 18%, 100% 100%, 0 100%); }
.mls-corridor.street .mls-door .leaf::after, .mls-corridor.street .mls-door .lit { display: none; }
.mls-corridor.street .mls-door .win { display: block; position: absolute; top: 34%; left: 18%; right: 18%; height: 26%; background: #1b2230; border: 5px solid #1a1412; }
.mls-corridor.street .mls-door.in .win { background: #ffd66b; box-shadow: 0 0 22px #ffb84d; }
.mls-door .heads { position: absolute; right: 8px; bottom: 76px; z-index: 3; display: flex; flex-direction: row-reverse; }
.mls-door .heads b { width: 34px; height: 34px; border-radius: 50%; margin-left: -10px; display: grid; place-items: center; font-size: 13px; font-weight: 900;
  border: 3px solid var(--ink); background: var(--c); color: var(--paper); }
.mls-door .base { background: #120e0c; padding: 8px 10px 10px; display: grid; gap: 5px; }
.mls-door .base .state { font-size: 12px; font-weight: 700; }
.mls-door .base .state em { font-style: normal; color: var(--yellow); }
.mls button.mls-door-act { font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; border: 0; padding: 7px 8px; cursor: pointer; text-align: left; }
.mls button.mls-door-act.go { background: var(--red); color: var(--paper); }
.mls button.mls-door-act.later { background: #26211d; color: #6a625a; cursor: not-allowed; }
.mls-door-act.later small { display: block; font-size: 10px; letter-spacing: .5px; text-transform: none; font-weight: 700; }
.mls-door.stranger { opacity: .6; }
.mls-door.stranger .plate { color: var(--muted); }


.mls.narrow .mls-map { height: auto; overflow: visible; }
.mls.narrow .mls-map .backdrop, .mls.narrow .mls-map .halftone, .mls.narrow .mls-map .skyline { position: fixed; }
.mls.narrow .mls-top { position: static; flex-direction: column; gap: 8px; padding: 12px 12px 0; }

.mls.narrow .mls-clock { align-self: stretch; width: 100%; transform: none; clip-path: none;
  padding: 8px 14px 10px; display: grid; gap: 2px; }
.mls.narrow .mls-clock .time { font-size: 40px; }
.mls.narrow .mls-clock .date { font-size: 12px; }

.mls.narrow .mls-back { order: -1; width: 100%; align-self: stretch; font-size: 20px; letter-spacing: 3px;
  padding: 10px; clip-path: none; border-bottom-width: 5px; text-align: center; }
.mls.narrow .mls-needs { max-width: none; width: 100%; margin-top: 0; gap: 8px; }
.mls.narrow .mls-needs .mls-need { grid-template-columns: 56px 1fr; padding: 5px 8px; }
.mls.narrow .mls-needs .label { font-size: 9px; letter-spacing: 1px; }

.mls.narrow .mls-hud { width: 100%; margin-left: 0; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 6px; }
.mls.narrow .mls-money, .mls.narrow .mls-rent { align-self: center; transform: none; margin-bottom: 0; }
.mls.narrow .mls-money { font-size: 22px; padding: 2px 12px; border-width: 2px; }
.mls.narrow .mls-rent { font-size: 11px; }
.mls.narrow .mls-said { max-width: none; width: 100%; text-align: left; }

.mls.narrow .mls-places { position: relative; top: auto; bottom: auto; left: auto; right: auto;
  height: 1500px; margin: 10px 0 30px; --cw: 40vw; }
.mls.narrow .mls-places line { stroke-width: 4; opacity: .9; }

.mls-phone-places { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px 14px; padding: 22px 12px 34px; }
.mls-phone-places .mls-place { position: relative; left: auto; top: auto; width: auto; transform: rotate(var(--r, 0deg)); }
.mls.narrow .mls-board { position: absolute; inset: 40px 12px; }
.mls.narrow .mls-place { --cw: 40vw; }
.mls.narrow .mls-place .tag, .mls.narrow .mls-place .tag.here-tag { font-size: 11px; padding: 1px 7px; }
.mls.narrow .mls-who b { width: 26px; height: 26px; font-size: 11px; }

.mls.narrow .mls-place-screen { min-height: 0; overflow: visible; }
.mls.narrow .mls-place-screen .scene { position: relative; height: 46vh; min-height: 260px; }
.mls.narrow .mls-place-screen .wash { height: 46vh; min-height: 260px; bottom: auto;
  background: linear-gradient(180deg, rgba(11,11,13,.15) 0%, rgba(11,11,13,.9) 78%); }
.mls.narrow .mls-place-title { left: 12px; top: 12px; }

.mls.narrow .mls-place-hud { width: 100%; padding: 8px 12px 9px; row-gap: 8px; }
.mls.narrow .mls-place-title h1 { font-size: 40px; }
.mls.narrow .mls-people { left: 12px; right: 12px; bottom: 0; gap: 8px; overflow-x: auto; }
.mls.narrow .mls-person .body { width: 34vw; }
.mls.narrow .mls-person .plate b { font-size: 17px; }
.mls.narrow .mls-acts, .mls.narrow .mls-talk { position: static; width: auto; overflow: visible; padding: 12px; }
.mls.narrow .mls-bubble { position: relative; left: auto; bottom: auto; width: auto; margin: 12px 12px 0; transform: none;
  clip-path: polygon(0 12px, 12% 12px, 16% 0, 20% 12px, 100% 12px, 100% 100%, 0 100%); padding: 24px 16px 14px; }
.mls.narrow .mls-bondrow { grid-template-columns: 92px 42px minmax(30px, 1fr) 80px; }

.mls.narrow .mls-create { grid-template-columns: minmax(0, 1fr); }
.mls.narrow .mls-index { position: sticky; top: 0; z-index: 6; height: auto; flex-direction: row; align-items: center;
  overflow-x: auto; gap: 4px; padding: 8px 10px; border-right: 0; border-bottom: 3px solid var(--line); background: var(--ink); }
.mls.narrow .mls-index h1, .mls.narrow .mls-index .spacer, .mls.narrow .mls-index .todo { display: none; }
.mls.narrow .mls-index a { flex: none; font-size: 11px; padding: 6px 8px; }
.mls.narrow .mls-start { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 7; text-align: center; clip-path: none; }
.mls.narrow .mls-create main { padding: 16px 14px 90px; }

.mls.narrow .mls-create .pt { grid-template-columns: max-content minmax(0, 1fr) auto; gap: 8px; }
.mls.narrow .mls-create .pips { min-width: 0; gap: 3px; }
.mls.narrow .mls-create .pips i { flex: 1 1 0; width: auto; min-width: 5px; }
.mls.narrow .mls-actions .btns { width: 100%; flex-direction: column-reverse; align-items: stretch; }
.mls.narrow .mls-actions .mls-start { position: static; min-width: 0; width: 100%; }
.mls.narrow .mls-actions .mls-back { order: 0; }
.mls.narrow .mls-member { grid-template-columns: 44px minmax(0, 1fr); }
.mls.narrow .mls-member .tools { grid-column: 1 / -1; justify-self: stretch; }
.mls.narrow .mls-member .tools > * { flex: 1 1 0; }
.mls.narrow .mls-cont { grid-template-columns: minmax(0, 1fr); }
.mls.narrow .mls-lives { grid-template-columns: minmax(0, 1fr); }
.mls.narrow .mls-title { padding: 16px 14px 30px; }
.mls.narrow .mls-cast-list { grid-auto-flow: column; grid-auto-columns: 150px; overflow-x: auto; }
.mls.narrow .mls-weekstep .mls-index { flex-wrap: wrap; overflow-x: visible; row-gap: 8px; }
.mls.narrow .mls-weekstep .mls-index .step { margin: 0; white-space: nowrap; letter-spacing: 2px; }
.mls.narrow .mls-weekstep .mls-week-find { flex: 1 1 120px; width: auto; min-width: 0; margin: 0; }
.mls.narrow .mls-weekstep .mls-cast-list { flex: 1 0 100%; min-width: 0; }
.mls.narrow .mls-week { grid-template-columns: 38px repeat(7, 66px); min-width: 0; }
.mls.narrow .mls-line input { width: 100%; }
.mls.narrow .mls-door { width: 70vw; }



[data-hud="clock"].running [data-hud="time"], .mls-clock.running .time { color: var(--yellow); }


.mls-float { position: absolute; z-index: 40; pointer-events: none; white-space: nowrap; transform: translateX(-50%);
  font-family: var(--display); font-size: 24px; letter-spacing: 1px; color: var(--yellow); text-shadow: 3px 3px 0 var(--ink);
  animation: mls-float 1.6s ease-out forwards; }
.mls-float.bad { color: var(--red); }
.mls-float.cost { color: var(--paper); font-size: 18px; }
.mls-float.cap { color: var(--paper); font-size: 16px; background: var(--red); padding: 0 6px; text-shadow: none; }
@keyframes mls-float { 0% { opacity: 0; translate: 0 6px; scale: .8; } 15% { opacity: 1; translate: 0 0; scale: 1.1; }
  70% { opacity: 1; } 100% { opacity: 0; translate: 0 -46px; scale: 1; } }



.mls-card-veil { position: absolute; inset: 0; z-index: 48; display: grid; place-items: center; cursor: pointer;
  background: rgba(11,11,13,.55); animation: mls-fade .2s; }
.mls-card-veil.night { background: rgba(6,8,20,.8); }
@keyframes mls-fade { from { opacity: 0; } }

.mls .mls-lunch { border-left: 5px solid var(--yellow); background: #141417; padding: 10px 12px; margin-bottom: 10px; }
.mls .mls-lunch b { display: block; font-family: var(--display); font-weight: 400; font-size: 26px; letter-spacing: 1px; }
.mls .mls-lunch small { display: block; font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls .mls-lunch small em { font-style: normal; color: var(--yellow); }
.mls .mls-lunch-bar { height: 6px; background: #2b2b30; margin-top: 8px; }
.mls .mls-lunch-bar i { display: block; height: 100%; background: var(--yellow); }

.mls .mls-card .mls-bye-face { position: absolute; top: -26px; right: 18px; width: 64px; height: 64px; border: 3px solid var(--paper); background: var(--c, var(--red)); overflow: hidden; transform: rotate(4deg); box-shadow: 4px 4px 0 var(--ink); }
.mls .mls-card .mls-bye-face img { width: 100%; height: 100%; object-fit: cover; }
.mls .mls-card .mls-bye-did { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 0; }
.mls .mls-card .mls-bye-did span { font-size: 11px; font-weight: 900; letter-spacing: 1px; padding: 2px 8px; background: var(--ink); color: var(--yellow); border: 1px solid #2b2b30; }
.mls-card { position: relative; width: min(620px, calc(100% - 32px)); background: var(--ink); border: 3px solid var(--paper);
  box-shadow: 10px 10px 0 var(--red); padding: 22px 26px 18px; transform: rotate(-1.5deg); display: grid; gap: 12px;
  animation: mls-card-in .35s cubic-bezier(.2,1.2,.4,1); }
@keyframes mls-card-in { from { translate: -80px 0; rotate: -5deg; opacity: 0; } }
.mls-card .kicker { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--yellow); }
.mls-card .kicker b { background: var(--red); color: var(--paper); padding: 1px 8px; margin-right: 8px; }
.mls-card .what { font-family: var(--display); font-size: 44px; line-height: .95; letter-spacing: 1px; text-shadow: 4px 4px 0 var(--red); }
.mls-card .clock { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 14px; font-family: var(--display); font-variant-numeric: tabular-nums; }
.mls-card .clock .from { font-size: 30px; color: var(--muted); }
.mls-card .clock .arrow { font-size: 22px; color: var(--muted); }
.mls-card .clock .to { font-size: 64px; line-height: 1; color: var(--yellow); }
.mls-card .clock .dur { font-family: var(--body); font-size: 12px; font-weight: 900; letter-spacing: 2px; background: #2b2b30; padding: 2px 8px; align-self: center; }
.mls-card .track { height: 6px; background: #2b2b30; position: relative; }
.mls-card .track i { position: absolute; inset: 0 auto 0 0; background: var(--yellow); }
.mls-card .line { font-size: 17px; line-height: 1.55; font-style: italic; color: #e8e4dc; min-height: 50px; border-left: 4px solid var(--yellow); padding-left: 14px; }
.mls-card .line.empty { display: none; }
.mls-card .line .writing { font-style: normal; font-size: 12px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-card .line .dots i { font-style: normal; animation: mls-blink 1s steps(1) infinite; }
.mls-card .line .dots i:nth-child(2) { animation-delay: .33s; }
.mls-card .line .dots i:nth-child(3) { animation-delay: .66s; }
@keyframes mls-blink { 50% { opacity: 0; } }
.mls-card .gains { display: flex; flex-wrap: wrap; gap: 8px 22px; }
.mls-card .g { transition: opacity .25s, transform .25s; }
.mls-card .g:not(.in) { opacity: 0; transform: translateY(8px); }
.mls-card .g small { display: block; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-card .g b { font-family: var(--display); font-weight: 400; font-size: 30px; line-height: 1.05; }
.mls-card .g.up b { color: var(--yellow); }
.mls-card .g.cash.up b { color: #5fd38a; }
.mls-card .g .mini { display: block; width: 110px; height: 5px; background: #2b2b30; margin-top: 4px; position: relative; }
.mls-card .g .mini i { position: absolute; inset: 0 auto 0 0; background: var(--yellow); transition: width .8s ease-out; }
.mls-card .notes { display: grid; gap: 3px; font-size: 12px; font-weight: 700; color: #d8d4cb; }
.mls-card .notes span { border-left: 3px solid var(--red); padding-left: 8px; }
.mls-card .level { position: absolute; right: -18px; top: -26px; background: var(--yellow); color: var(--ink); padding: 6px 14px 8px; max-width: 270px;
  box-shadow: 5px 5px 0 var(--red); transform: rotate(6deg) scale(0); transition: transform .35s cubic-bezier(.2,1.6,.4,1); }
.mls-card .level.in { transform: rotate(6deg) scale(1); }
.mls-card .level small { display: block; font-size: 10px; font-weight: 900; letter-spacing: 2px; }
.mls-card .level b { font-family: var(--display); font-weight: 400; font-size: 30px; line-height: 1; }
.mls-card .level span { display: block; font-size: 12px; font-weight: 700; }
.mls-card .hint { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: var(--muted); text-align: right; }


.mls-bubble .said.typing::after { content: ""; display: inline-block; width: 7px; height: 14px; margin-left: 2px; vertical-align: -2px;
  background: var(--ink); animation: mls-blink .6s steps(1) infinite; }
.mls-bubble { animation: mls-pop .25s cubic-bezier(.2,1.4,.4,1); transform-origin: left bottom; }
@keyframes mls-pop { from { scale: .4; opacity: 0; } }
.mls-bubble .said { cursor: pointer; }


.mls-person.react-good .body { animation: mls-hop .55s ease-out; filter: drop-shadow(0 0 26px rgba(255,225,77,.7)); }
.mls-person.react-bad { translate: -18px 0; transition: translate .3s ease-out; }
.mls-person.react-bad .body { filter: brightness(.55) saturate(.6); }
@keyframes mls-hop { 30% { translate: 0 -22px; } 60% { translate: 0 0; } 80% { translate: 0 -6px; } }


.mls-place-screen.focus .mls-person:not(.picked) { display: none; }
.mls-place-screen.focus .mls-people { right: calc(min(560px, 44vw) + 40px); left: 5%; }
.mls-place-screen.focus .mls-person.picked:hover { transform: none; }
.mls-place-screen.focus .mls-person.picked .body { width: clamp(200px, 24vw, 400px); }
.mls-place-screen.focus .mls-person.picked .plate { bottom: 30%; left: -20px; }
.mls-place-screen.focus .mls-person.picked .plate b { font-size: 36px; }
.mls-place-screen.focus .mls-person.picked .plate span { font-size: 13px; }

@keyframes mls-step-in { from { scale: .6; opacity: .4; } }
.mls-place-screen.focus .mls-talk { width: min(560px, 44vw); }
.mls-place-screen.focus .mls-talk .who-head h2 { font-size: 52px; }
.mls-place-screen.focus .mls-opt { padding: 13px 16px 13px 20px; }
.mls-place-screen.focus .mls-opt .n { font-size: 19px; }
.mls-place-screen.focus .mls-bondrow { font-size: 12px; grid-template-columns: 116px 50px minmax(40px, 1fr) 110px; }
.mls-place-screen.focus .mls-bondrow .bar { height: 11px; }
.mls-place-screen.focus .mls-bubble { left: calc(5% + clamp(200px, 24vw, 400px) * .78); bottom: calc(clamp(200px, 24vw, 400px) * 2.2 * .62); }
.mls button.mls-everyone { font-weight: 900; font-size: 13px; letter-spacing: 3px; background: var(--paper); color: var(--ink); border: 0; cursor: pointer;
  padding: 7px 16px 7px 14px; clip-path: polygon(8px 0, 100% 0, 100% 100%, 8px 100%, 0 50%); text-align: left; }
.mls-everyone small { display: block; font-size: 10px; letter-spacing: 1px; color: #555; }
.mls button.mls-everyone:hover { background: var(--yellow); }


.mls-faint { position: relative; overflow: hidden; min-height: clamp(560px, calc(100vh - 190px), 1100px); background: #000; }
.mls-faint .scene { position: absolute; inset: 0; background: linear-gradient(180deg, #2a2f3a 0%, #1a1d24 60%, #0e0f13 100%); }
.mls-faint.dizzy .scene { filter: blur(3px) saturate(.4); animation: mls-sway 2.2s ease-in-out infinite; }
@keyframes mls-sway { 50% { translate: 8px 0; rotate: .4deg; } }
.mls-faint .vignette { position: absolute; inset: 0; pointer-events: none; }
.mls-faint.dizzy .vignette { box-shadow: inset 0 0 160px 40px rgba(140,0,0,.7); }
.mls-faint.dark .scene { display: none; }
.mls-faint .clock { position: absolute; left: 16px; top: 16px; z-index: 3; font-family: var(--display); font-size: 40px; line-height: 1; background: var(--ink);
  border-bottom: 5px solid var(--red); padding: 6px 18px 8px 12px; transform: rotate(-3deg); transform-origin: left top; }
.mls-faint .clock b { display: block; font-family: var(--body); font-size: 11px; letter-spacing: 3px; color: var(--yellow); }
.mls-faint h1 { position: absolute; left: 16px; top: 96px; z-index: 3; margin: 0; font-family: var(--display); font-weight: 400; font-size: clamp(42px, 6vw, 80px);
  line-height: .9; transform: rotate(-4deg); transform-origin: left; text-shadow: 5px 5px 0 var(--red); }
.mls-faint.dark h1 { display: none; }
.mls-faint .black { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; animation: mls-fade 1.2s; }
.mls-faint .black .dots { font-family: var(--display); font-size: 60px; letter-spacing: 16px; color: #333; }
.mls-faint .black .t { font-family: var(--display); font-size: 34px; color: #555; font-variant-numeric: tabular-nums; }
.mls-faint .black .t small { display: block; font-family: var(--body); font-size: 11px; font-weight: 900; letter-spacing: 3px; color: #444; }
.mls-faint .say { position: absolute; left: 50%; bottom: 36px; transform: translateX(-50%); z-index: 5; width: min(900px, calc(100% - 32px));
  background: rgba(11,11,13,.94); border: 3px solid var(--paper); box-shadow: 8px 8px 0 var(--red); padding: 24px 28px 22px;
  font-size: 18px; line-height: 1.55; cursor: pointer; animation: mls-fade .4s; }
.mls-faint .say.narration { font-style: italic; color: #d8d4cb; }
.mls-faint .say .speaker { position: absolute; top: -3px; left: 40px; transform: translateY(-60%) rotate(-3deg); font-family: var(--display); font-size: 24px;
  padding: 0 16px; background: var(--paper); color: var(--ink); box-shadow: 4px 4px 0 var(--red); font-style: normal; }
.mls-faint .say .next { position: absolute; right: 14px; bottom: 6px; font-size: 10px; font-weight: 900; letter-spacing: 3px; color: var(--muted); font-style: normal; }
.mls-faint.hospital .scene { background: linear-gradient(180deg, transparent 64%, #9aa3a8 64%, #7d858a 100%), repeating-linear-gradient(90deg, #dfe7ea 0 18%, #cfd9dd 18% 18.6%), #dfe7ea; }
.mls-faint.hospital h1 { color: var(--ink); }
.mls-faint .nurse { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); height: 78%; aspect-ratio: 5 / 11; background: #6d8fa0; z-index: 2; animation: mls-fade .8s;
  clip-path: polygon(38% 0, 62% 0, 68% 14%, 64% 20%, 82% 26%, 90% 58%, 80% 60%, 76% 40%, 74% 100%, 26% 100%, 24% 40%, 20% 60%, 10% 58%, 18% 26%, 36% 20%, 32% 14%); }
.mls-faint .bill { position: absolute; right: 16px; top: 120px; z-index: 5; width: min(360px, calc(100% - 32px)); background: var(--paper); color: var(--ink); padding: 14px 18px;
  transform: rotate(2deg); box-shadow: 6px 6px 0 var(--ink); display: grid; gap: 6px; animation: mls-card-in .4s; }
.mls-faint .bill h3 { margin: 0; font-family: var(--display); font-weight: 400; font-size: 26px; }
.mls-faint .bill .r { display: flex; justify-content: space-between; gap: 10px; font-size: 14px; font-weight: 700; border-bottom: 1px dashed #bbb; padding-bottom: 4px; }
.mls-faint .bill .r.debt b { color: var(--red); }
.mls-faint .bill small { font-size: 11px; color: #555; font-weight: 700; }
.mls button.getup { justify-self: start; font-family: var(--display); font-size: 22px; background: var(--ink); color: var(--paper); border: 0; padding: 4px 18px; margin-top: 4px; cursor: pointer; }



.mls.narrow .mls-card-veil { align-items: start; }
.mls.narrow .mls-card { position: sticky; top: 14vh; margin: 14vh 0; }
.mls.narrow .mls-card .what { font-size: 32px; }
.mls.narrow .mls-card .clock .to { font-size: 44px; }
.mls.narrow .mls-card .level { right: 6px; }
.mls.narrow .mls-place-screen.focus .mls-people { left: 12px; right: 12px; overflow: visible; }
.mls.narrow .mls-place-screen.focus .mls-person.picked .body { width: 30vw; }
.mls.narrow .mls-place-screen.focus .mls-person.picked .plate { left: 60%; bottom: 10%; }
.mls.narrow .mls-place-screen.focus .mls-person.picked .plate b { font-size: 22px; }
.mls.narrow .mls-place-screen.focus .mls-talk { width: auto; }
.mls.narrow .mls-place-screen.focus .mls-talk .who-head h2 { font-size: 40px; }
.mls.narrow .mls-place-screen.focus .mls-bondrow { grid-template-columns: 92px 42px minmax(30px, 1fr) 80px; font-size: 11px; }
.mls.narrow .mls-place-screen.focus .mls-bubble { left: auto; bottom: auto; }
.mls.narrow .mls-faint .bill { left: 16px; right: 16px; width: auto; top: 110px; }
.mls.narrow .mls-faint .say { bottom: 16px; font-size: 16px; padding: 22px 18px 20px; }


.mls-talk .who-head button.mls-namelink { font: inherit; letter-spacing: inherit; border: 0; padding: 0; background: none; color: inherit; }


.mls.narrow .mls-people { top: 0; bottom: auto; height: max(46vh, 260px); align-items: flex-end; }
.mls.narrow .mls-place-screen.focus .mls-person.picked .body { width: 36vw; }



.mls img.mls-face.mls-face { position: absolute; left: 50%; top: 50%; width: calc(var(--fz, 2) * 100%); height: auto; max-width: none; object-fit: fill;
  transform: translate(calc(var(--fx, 50%) * -1), calc(var(--fy, 24%) * -1)); pointer-events: none; }
.mls-who b, .mls-door .heads b, .mls-contact .av, .mls-you .person .av { position: relative; overflow: hidden; }
.mls-who b i, .mls-door .heads b i { position: relative; z-index: 1; font-style: normal; }
.mls-who b.pic { width: 36px; height: 36px; border-color: var(--c); }
.mls-door .heads b.pic { width: 40px; height: 40px; border-color: var(--c); }
.mls.narrow .mls-who b.pic { width: 30px; height: 30px; }

.mls b.q .mls-face, .mls-contact.unmet .mls-face, .mls-person.stranger .mls-frame-img, .mls-contacts .portrait.unknown .mls-frame-img { filter: brightness(.22) saturate(0); }
.mls b.q.pic i { color: var(--paper); font-size: 15px; }


.mls img.mls-frame-img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.mls-person .body.framed { clip-path: none; aspect-ratio: 5 / 8; width: clamp(150px, 16vw, 280px); background: #111; overflow: hidden;
  border: 4px solid var(--c); transform: rotate(-2deg); box-shadow: 6px 6px 0 rgba(0,0,0,.45); }
.mls-person.stranger .body.framed { border-color: #555; }
.mls-place-screen.focus .mls-person.picked .body.framed { width: clamp(220px, 26vw, 420px); }
.mls-place-screen.focus .mls-bubble { bottom: calc(clamp(220px, 26vw, 420px) * 1.6 * .8); }
.mls.narrow .mls-person .body.framed { width: 34vw; }
.mls.narrow .mls-place-screen.focus .mls-person.picked .body.framed { width: 40vw; }
.mls-scene .sprite.framed { clip-path: none; aspect-ratio: 5 / 8; height: 82%; bottom: 3%; background: #111; overflow: hidden;
  border: 5px solid var(--c); transform: translateX(-50%) rotate(-1.5deg); box-shadow: 10px 10px 0 rgba(0,0,0,.45); }
.mls-contacts .portrait.framed { overflow: hidden; border: 4px solid var(--c, #333); background: #111; }
.mls-contacts .portrait-col { display: grid; gap: 8px; align-content: end; }
.mls button.mls-face-btn { font-size: 10px; font-weight: 900; letter-spacing: 2px; background: none; color: var(--paper); border: 2px solid var(--paper); padding: 4px 8px; cursor: pointer; }
.mls button.mls-face-btn:hover { background: var(--yellow); color: var(--ink); border-color: var(--yellow); }


.mls-face-edit { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 22px; align-items: start;
  background: var(--panel, #141417); border-left: 5px solid var(--yellow); padding: 16px 18px; margin-bottom: 18px; }
.mls-face-edit .pad { position: relative; overflow: hidden; cursor: crosshair; touch-action: none; user-select: none; }
.mls-face-edit .pad img { display: block; width: 100%; height: auto; pointer-events: none; }
.mls-face-edit .ring { position: absolute; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none;
  border: 3px solid var(--yellow); box-shadow: 0 0 0 9999px rgba(0,0,0,.55); }
.mls-face-edit .side { display: grid; gap: 12px; }
.mls-face-edit h3 { margin: 0; font-family: var(--display); font-weight: 400; font-size: 26px; letter-spacing: 1px; }
.mls-face-edit .preview { display: flex; align-items: center; gap: 14px; }
.mls-face-edit .preview b.big, .mls-face-box b.big { position: relative; overflow: hidden; flex: none; width: 96px; height: 96px; border-radius: 50%; border: 4px solid var(--c); background: var(--c); }
.mls-face-edit .zoom { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 900; letter-spacing: 2px; }
.mls-face-edit .zoom input { flex: 1; accent-color: var(--yellow); }
.mls-face-edit .acts { display: flex; gap: 8px; flex-wrap: wrap; }
.mls-face-edit .acts button { font-weight: 900; font-size: 12px; letter-spacing: 2px; padding: 6px 14px; cursor: pointer; border: 2px solid var(--paper); background: none; color: var(--paper); }
.mls-face-edit .acts button.save { background: var(--yellow); color: var(--ink); border-color: var(--yellow); }
.mls.narrow .mls-face-edit { grid-template-columns: minmax(0, 1fr); }

.mls.narrow .mls-scene .sprite.framed { height: auto; width: min(72vw, 320px); top: 130px; bottom: auto; }
.mls.narrow .mls-person .body.framed { width: 30vw; }



.mls-place-screen .scene.has-pic, .mls-place .photo.has-pic, .mls-scene .backdrop.has-pic, .mls-corridor .hall.has-pic {
  background-size: cover; background-position: center; background-repeat: no-repeat; }
.mls-place .photo.has-pic::after { content: none; }




.mls-phone-veil { position: absolute; inset: 0; z-index: 40; background: rgba(11,11,13,.6); display: grid; justify-items: center; align-items: start; padding-top: 70px; }
.mls-phone { position: sticky; top: 40px; width: 290px; height: 520px; background: #111; border: 10px solid #222; border-radius: 34px; box-shadow: 12px 12px 0 var(--red);
  padding: 16px 16px; display: flex; flex-direction: column; gap: 14px; transform: rotate(-2deg); }
.mls-phone .bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; font-weight: 900; letter-spacing: 1px; color: var(--muted); }
.mls-phone .battery { width: 24px; height: 12px; border: 2px solid var(--muted); border-radius: 3px; position: relative; }
.mls-phone .battery::after { content: ""; position: absolute; right: -5px; top: 2px; width: 3px; height: 4px; background: var(--muted); }
.mls-phone .battery i { position: absolute; inset: 1px 6px 1px 1px; background: var(--muted); }
.mls-phone .wall { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; display: grid; grid-template-columns: repeat(3, 1fr); align-content: start; gap: 18px 8px; padding: 10px 12px 6px 0; margin-right: -8px; }

.mls-phone .wall::-webkit-scrollbar, .mls-guide .index::-webkit-scrollbar { width: 4px; height: 0; }
.mls-phone .wall::-webkit-scrollbar-track, .mls-guide .index::-webkit-scrollbar-track { background: #1d1d22; border-radius: 2px; margin: 10px 0; }
.mls-phone .wall::-webkit-scrollbar-thumb, .mls-guide .index::-webkit-scrollbar-thumb { background: var(--red); border-radius: 2px; }
.mls-phone .wall::-webkit-scrollbar-thumb:hover, .mls-guide .index::-webkit-scrollbar-thumb:hover { background: var(--yellow); }
@supports not selector(::-webkit-scrollbar) { .mls-phone .wall, .mls-guide .index { scrollbar-width: thin; scrollbar-color: var(--red) #1d1d22; } }
.mls-phone .app { display: grid; justify-items: center; gap: 6px; background: none; border: 0; cursor: pointer; color: var(--paper); }
.mls-phone .app i { width: 62px; height: 62px; border-radius: 16px; display: grid; place-items: center; font-style: normal; font-size: 28px; box-shadow: 3px 3px 0 rgba(0,0,0,.5); position: relative; }
.mls-phone .app span { font-size: 10px; font-weight: 900; letter-spacing: 1px; }
.mls-phone .app .badge { position: absolute; top: -6px; right: -6px; background: var(--red); color: var(--paper); font-style: normal; font-size: 10px; font-weight: 900; border-radius: 10px; padding: 1px 6px; }
.mls-phone button.app:hover i { transform: translateY(-3px); }
.mls-phone .app.later { opacity: .35; cursor: not-allowed; }
.mls-phone .app.later span::after { content: " \xB7 later"; font-weight: 700; }
.mls-phone button.close { background: none; border: 2px solid var(--paper); color: var(--paper); font-weight: 900; letter-spacing: 2px; font-size: 11px; padding: 6px; cursor: pointer; border-radius: 14px; }


.mls-settings { max-width: 1240px; margin: 0 auto; padding: 22px clamp(16px, 3vw, 40px) 60px; display: grid; gap: 16px; min-height: 100%; background: var(--ink); }
.mls-settings .top { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.mls-settings h1 { margin: 0; font-family: var(--display); font-weight: 400; font-size: 64px; line-height: .9; text-shadow: 5px 5px 0 var(--red); transform: rotate(-2deg); }
.mls-settings .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.mls-settings .tabs button { background: var(--panel, #141417); color: var(--paper); border: 0; padding: 8px 14px; font-weight: 900; font-size: 12px; letter-spacing: 2px; }
.mls-settings .tabs button.on { background: var(--red); }
.mls-settings .tabs button.later { opacity: .4; }
.mls-settings .box { background: var(--panel, #141417); border-left: 5px solid var(--yellow); padding: 14px 16px; display: grid; gap: 12px; }
.mls-settings .box h3 { margin: 0; font-family: var(--display); font-weight: 400; font-size: 24px; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.mls-settings .box h3 small { font-family: var(--body); font-size: 11px; font-weight: 700; color: var(--muted); letter-spacing: 1px; }
.mls-settings .row3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.mls-settings .field { display: grid; gap: 4px; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-settings .field select, .mls-settings .field input { background: var(--ink); color: var(--paper); border: 2px solid var(--line, #2b2b30); padding: 8px 10px; font: inherit; font-weight: 700; font-size: 14px; letter-spacing: 0; }
.mls-settings .field small { font-weight: 700; letter-spacing: 0; }
.mls-settings .save-row { display: flex; justify-content: flex-end; }
.mls-settings .hint { font-size: 12px; color: var(--muted); line-height: 1.5; margin: 0; }
.mls-settings .hint b { color: var(--paper); }
.mls button.mls-btn.yellow { background: var(--yellow); color: var(--ink); border-color: var(--yellow); }
.mls button.mls-btn.red { background: var(--red); color: var(--paper); border-color: var(--red); }
.mls-queue { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 14px; align-items: center; background: #000; border: 2px solid var(--line, #2b2b30); padding: 10px 14px; }
.mls-queue .spin { width: 18px; height: 18px; border: 4px solid var(--yellow); border-right-color: transparent; border-radius: 50%; animation: mls-spin .8s linear infinite; }
.mls-queue .dot { width: 14px; height: 14px; border-radius: 50%; background: var(--line, #2b2b30); }
.mls-queue b { font-size: 13px; } .mls-queue small { display: block; font-size: 11px; color: var(--muted); font-weight: 700; }
.mls-queue .qbar { height: 8px; background: #2b2b30; margin-top: 6px; } .mls-queue .qbar i { display: block; height: 100%; background: var(--yellow); }
.mls-queue .acts { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.mls-look-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.mls-look-grid .tile { background: #000; border: 2px solid var(--line, #2b2b30); }
.mls-look-grid .tile .name { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; padding: 8px 10px 6px; }
.mls-look-grid .tile .name b { font-family: var(--display); font-weight: 400; font-size: 20px; letter-spacing: .5px; }
.mls-look-grid .tile .name small { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: var(--muted); }
.mls-look-grid .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
.mls .shot { position: relative; }
.mls .shot .pic { aspect-ratio: 16 / 11; background: #1b1b20 center / cover no-repeat; }
.mls .shot .when { position: absolute; left: 6px; top: 6px; font-size: 9px; font-weight: 900; letter-spacing: 2px; background: rgba(11,11,13,.8); padding: 1px 6px; }
.mls .shot .state { position: absolute; left: 6px; bottom: 6px; right: 6px; display: flex; justify-content: space-between; align-items: center; gap: 4px; }
.mls .shot .chip { font-size: 9px; font-weight: 900; letter-spacing: 1px; padding: 1px 6px; background: rgba(11,11,13,.85); }
.mls .shot .chip.lib { color: var(--yellow); } .mls .shot .chip.new { background: #3fbf6a; color: var(--ink); }
.mls .shot .chip.q { color: var(--muted); } .mls .shot .chip.bad { background: var(--red); color: var(--paper); }
.mls .shot .vers { display: flex; gap: 2px; align-items: center; }
.mls .shot .vers button { background: rgba(11,11,13,.85); color: var(--paper); border: 0; font-size: 10px; font-weight: 900; padding: 0 5px; cursor: pointer; }
.mls .shot .vers button:disabled { opacity: .3; cursor: default; }
.mls .shot button.redo { position: absolute; right: 6px; top: 6px; background: rgba(11,11,13,.85); color: var(--paper); border: 1px solid var(--paper); font-size: 9px; font-weight: 900; letter-spacing: 1px; padding: 1px 6px; cursor: pointer; }
.mls .shot button.redo:hover { background: var(--yellow); color: var(--ink); }
.mls .shot.queued .pic { background: repeating-linear-gradient(45deg, #1b1b20 0 10px, #222228 10px 20px); }
.mls .shot.missing .pic { background: #141417; }
.mls .shot.painting .pic { background: #111; }
.mls .shot.painting .pic::before { content: "\u2026"; position: absolute; inset: 0; display: grid; place-items: center; font-family: var(--display); font-size: 30px; color: var(--yellow); animation: mls-blink 1s steps(2) infinite; }
.mls .shot.failed .pic { background: #2a0d0d; }
.mls .shot .why { position: absolute; inset: 24px 8px 26px; display: grid; place-items: center; text-align: center; font-size: 10px; font-weight: 700; color: #ffb3b3; overflow: hidden; }


.mls-painting { max-width: 1100px; margin: 0 auto; padding: 30px 20px 60px; display: grid; gap: 16px; justify-items: center; text-align: center; min-height: 100%; background: var(--ink); }
.mls-painting h1 { margin: 0; font-family: var(--display); font-weight: 400; font-size: clamp(44px, 7vw, 72px); line-height: .9; text-shadow: 6px 6px 0 var(--red); transform: rotate(-2deg); }
.mls-painting .count { font-family: var(--display); font-size: 40px; color: var(--yellow); }
.mls-painting .hint { font-size: 13px; color: var(--muted); margin: 0; }
.mls-mosaic { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 6px; width: 100%; }
.mls-painting .go { display: flex; gap: 12px; justify-content: center; }

.mls.narrow .mls-settings .row3 { grid-template-columns: minmax(0, 1fr); }
.mls.narrow .mls-settings h1 { font-size: 46px; }
.mls.narrow .mls-queue { grid-template-columns: auto minmax(0, 1fr); }
.mls.narrow .mls-queue .acts { grid-column: 1 / -1; justify-content: flex-start; }
.mls.narrow .mls-phone-veil { padding-top: 20px; }



.mls:not(.narrow) .mls-map { height: 100%; min-height: 480px; }
.mls button.mls-phone-fab { position: absolute; left: var(--fab-left, 18px); bottom: var(--fab-bottom, 18px); z-index: 30; width: 66px; height: 66px; border-radius: 50%; padding: 0;
  display: grid; place-items: center; background: var(--yellow); color: var(--ink); border: 4px solid var(--ink); box-shadow: 4px 4px 0 var(--red); cursor: pointer;
  transition: transform .12s; touch-action: none; -webkit-touch-callout: none; user-select: none; -webkit-user-select: none; }
.mls button.mls-phone-fab:hover { transform: translateY(-3px) rotate(-6deg); }
.mls-phone-fab svg { width: 30px; height: 30px; fill: currentColor; }
.mls-phone-fab .dot { position: absolute; top: -6px; right: -6px; min-width: 22px; height: 22px; border-radius: 11px; display: grid; place-items: center;
  background: var(--red); color: var(--paper); font-size: 12px; font-weight: 900; border: 2px solid var(--ink); }


@property --mls-ring { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.mls-phone-fab.painting::before { content: ""; position: absolute; inset: -9px; border-radius: 50%; pointer-events: none;
  background: repeating-conic-gradient(from var(--mls-ring), var(--yellow) 0 12deg, transparent 12deg 24deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  animation: mls-ring 6s linear infinite; }
@keyframes mls-ring { to { --mls-ring: 360deg; } }

.mls.narrow button.mls-phone-fab { position: sticky; left: auto; bottom: var(--fab-bottom, 16px); display: grid; margin: 8px 16px 16px var(--fab-left, auto); }


.mls-you, .mls-settings, .mls-painting { max-width: none; padding-left: max(clamp(16px, 3vw, 44px), calc((100% - 1240px) / 2));
  padding-right: max(clamp(16px, 3vw, 44px), calc((100% - 1240px) / 2)); }
.mls-painting { padding-left: max(20px, calc((100% - 1100px) / 2)); padding-right: max(20px, calc((100% - 1100px) / 2)); }


.mls-phone-icon { width: 27px; height: 43px; background: var(--ink); border-radius: 6px; transform: rotate(-12deg); position: relative; box-shadow: 2px 2px 0 var(--red); }
.mls-phone-icon::before { content: ""; position: absolute; inset: 5px 3px 7px; background: var(--paper); border-radius: 2px; }
.mls-phone-icon::after { content: ""; position: absolute; left: 50%; bottom: 2px; width: 6px; height: 3px; border-radius: 2px; background: var(--paper); transform: translateX(-50%); }
.mls-phone-icon i { position: absolute; left: 6px; right: 6px; top: 9px; height: 4px; background: var(--red); z-index: 1; box-shadow: 0 6px 0 #bbb, 0 12px 0 #bbb; }


.mls-map .backdrop.has-pic { background-size: cover; background-position: center; filter: blur(6px) saturate(1.15) brightness(.62); }




.mls button.mls-back { font-family: var(--body); font-weight: 900; }


.mls-bond i.pic { position: relative; overflow: hidden; width: 26px; height: 26px; border: 2px solid var(--c); }
.mls-bond i.q .mls-face { filter: brightness(.22) saturate(0); }



.mls.mls-fx-layer { position: fixed; z-index: 9000; pointer-events: none; overflow: hidden; background: none; min-height: 0; }
.mls.mls-fx-layer.top { z-index: 9001; }
.mls.mls-fx-ghost { position: absolute; pointer-events: none; overflow: hidden; }

.mls.mls-fx-ghost.only { visibility: hidden; background: none; }
.mls.mls-fx-ghost.only .keep { visibility: visible; }

.mls-fx-wipe { position: absolute; top: -15%; height: 130%; background: var(--ink); }
.mls-fx-wipe::before, .mls-fx-wipe::after { content: ""; position: absolute; top: 0; bottom: 0; background: var(--red); }
.mls-fx-wipe::before { right: -46px; width: 38px; box-shadow: 14px 0 0 var(--yellow); }
.mls-fx-wipe::after { left: -22px; width: 22px; }
.mls-fx-wipe.back::before { right: auto; left: -46px; box-shadow: -14px 0 0 var(--yellow); }
.mls-fx-wipe.back::after { left: auto; right: -22px; }
.mls-fx-wipe i { position: absolute; inset: 0; background: radial-gradient(circle, rgba(229,25,28,.35) 1.5px, transparent 2px) 0 0 / 14px 14px; }

.mls-fx-frame { position: absolute; border: 5px solid var(--paper); box-shadow: 8px 8px 0 var(--red); }
.mls-fx-oldpic { position: absolute; inset: 0; z-index: 0; background-size: cover; background-position: center; pointer-events: none; }

.mls.motion-off *:not(.mls-loading i):not(.spin):not(.mls-phone-fab), .mls.motion-off *::before, .mls.motion-off *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; }

.mls-motion { display: grid; gap: 10px; max-width: 640px; }
.mls button.mls-motion-opt { display: grid; grid-template-columns: 34px 1fr; gap: 4px 12px; background: var(--panel); color: var(--paper); padding: 14px 16px; text-align: left; border: 0; border-left: 6px solid transparent; cursor: pointer; }
.mls button.mls-motion-opt.on { border-left-color: var(--yellow); background: #222228; }
.mls-motion-opt i { grid-row: span 2; width: 26px; height: 26px; border-radius: 50%; border: 3px solid var(--paper); align-self: center; }
.mls-motion-opt.on i { background: var(--yellow); border-color: var(--yellow); box-shadow: inset 0 0 0 4px var(--ink); }
.mls-motion-opt b { font-family: var(--display); font-weight: 400; font-size: 24px; letter-spacing: 1px; }
.mls-motion-opt span { font-size: 13px; color: #bbb; font-weight: 700; }


.mls:not(.narrow) .mls-place-screen { height: 100%; min-height: 480px; container-type: size; }
.mls:not(.narrow) .mls-person .body { width: min(clamp(110px, 12vw, 220px), 62cqh * 5 / 11); }
.mls:not(.narrow) .mls-person .body.framed { width: min(clamp(150px, 16vw, 280px), 60cqh * 5 / 8); }
.mls:not(.narrow) .mls-place-screen.focus .mls-person.picked .body { width: min(clamp(200px, 24vw, 400px), 80cqh * 5 / 11); }
.mls:not(.narrow) .mls-place-screen.focus .mls-person.picked .body.framed { width: min(clamp(220px, 26vw, 420px), 76cqh * 5 / 8); }
.mls:not(.narrow) .mls-place-screen.focus .mls-bubble { bottom: calc(min(clamp(220px, 26vw, 420px), 76cqh * 5 / 8) * 1.6 * .8); }


.mls-shop { position: relative; height: 100%; min-height: 480px; overflow: auto; background: var(--ink); display: grid; grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px; padding: 16px clamp(16px, 2.5vw, 40px) 30px; align-content: start; }
.mls-shop .behind { position: absolute; inset: 0; min-height: 100%; background: linear-gradient(180deg, #3f8a5a 0%, #1f4a2e 55%, #0f1a12 100%); background-size: cover; background-position: center; filter: brightness(.3); pointer-events: none; }
.mls-shop > :not(.behind) { position: relative; z-index: 1; }

.mls-shop > .mls-card-veil { position: absolute; inset: 0; z-index: 48; }
.mls-shop .head { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: flex-end; gap: 14px 24px; }
.mls-shop .head .mls-back { align-self: center; }
.mls-shop .head h1 { font-family: var(--display); font-weight: 400; font-size: 60px; line-height: .9; margin: 0; transform: rotate(-3deg); text-shadow: 5px 5px 0 var(--red); }
.mls-shop .where { display: flex; gap: 4px; margin-left: auto; }

.mls .mls-shop .where span { font-family: var(--display); font-size: 20px; letter-spacing: 1px; padding: 4px 16px; background: var(--paper); color: var(--ink); clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%); }
.mls-shop .where small { display: block; font-family: var(--body); font-size: 10px; font-weight: 900; letter-spacing: 1px; color: var(--muted); }
.mls-shop .money { font-family: var(--display); font-size: 30px; color: var(--yellow); background: var(--ink); border: 3px solid var(--paper); padding: 2px 14px; transform: rotate(2deg); }
.mls-shop .money small { font-family: var(--body); font-size: 10px; font-weight: 900; color: var(--paper); letter-spacing: 2px; margin-right: 6px; }
.mls-shop .cat { display: grid; gap: 14px; align-content: start; min-width: 0; }
.mls-shop .tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.mls .mls-shop .tabs button { font-weight: 900; font-size: 13px; letter-spacing: 1px; background: none; color: var(--paper); border: 2px solid var(--paper); padding: 4px 14px; cursor: pointer; }
.mls .mls-shop .tabs button.on { background: var(--red); border-color: var(--red); }
.mls .mls-shop .tabs button.new { color: var(--yellow); border-color: var(--yellow); }
.mls .mls-shop .tabs button.new.on { background: var(--yellow); color: var(--ink); }
.mls-shop .note { font-size: 12px; color: var(--muted); }
.mls-shop .items { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }
.mls-item { background: var(--paper); color: var(--ink); padding: 7px; display: flex; flex-direction: column; gap: 4px; position: relative; transform: rotate(var(--r, 0deg)); transition: transform .12s; box-shadow: 5px 6px 0 rgba(0,0,0,.6); }
.mls-item:hover { transform: rotate(0) translateY(-4px); }
.mls-item .ph { aspect-ratio: 4 / 3; background: #e2ded5; display: grid; place-items: center; font-size: 40px; }
.mls-item b { font-weight: 900; font-size: 15px; line-height: 1.2; }
.mls-item .line { font-size: 12px; color: #555; font-style: italic; line-height: 1.3; }
.mls-item .price { font-family: var(--display); font-size: 24px; line-height: 1; }
.mls-shop .chips { display: flex; flex-wrap: wrap; gap: 4px; }
.mls-shop .chip { font-size: 11px; font-weight: 900; padding: 1px 6px; background: #e2ded5; color: var(--ink); }
.mls-shop .chip.gain { background: var(--ink); color: var(--yellow); }
.mls-shop .chip.fresh { background: #d7ecd9; color: #1b5e20; }
.mls-item .badge { position: absolute; top: -10px; right: -8px; font-family: var(--display); font-size: 14px; letter-spacing: 1px; background: var(--yellow); color: var(--ink); padding: 1px 10px; transform: rotate(6deg); }
.mls .mls-item .add { font-weight: 900; font-size: 12px; letter-spacing: 2px; background: var(--ink); color: var(--paper); border: 0; padding: 6px; cursor: pointer; margin-top: auto; }

.mls-item .why { margin-top: auto; }
.mls-item .why + .add { margin-top: 4px; }
.mls .mls-item.in .add { background: var(--red); }
.mls .mls-item .add:disabled { background: #555; cursor: default; }
.mls-item .why { font-size: 11px; font-weight: 900; color: var(--red-dark); letter-spacing: 1px; }
.mls-item.no { filter: grayscale(1); opacity: .65; }
.mls-shop .cart { position: sticky; top: 0; align-self: start; background: rgba(11,11,13,.92); border-left: 5px solid var(--red); padding: 14px 16px; display: grid; gap: 12px; }
.mls-shop .cart h2 { font-family: var(--display); font-weight: 400; font-size: 26px; margin: 0; }
.mls-shop .cart .detail { display: grid; gap: 8px; }
.mls-shop .cart .line { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; font-size: 14px; }
.mls-shop .cart .q { display: flex; gap: 3px; }
.mls .mls-shop .cart .q button { width: 22px; height: 22px; background: var(--line); color: var(--paper); border: 0; cursor: pointer; font-weight: 900; padding: 0; }
.mls-shop .cart .p { font-weight: 900; }
.mls-shop .sep { border-top: 2px solid var(--line); }
.mls-shop .tot { display: flex; justify-content: space-between; font-weight: 900; }
.mls-shop .tot.big { font-family: var(--display); font-size: 26px; font-weight: 400; }
.mls-shop .tot .after { color: var(--muted); font-weight: 700; font-size: 13px; }
.mls-shop .space { display: grid; gap: 5px; font-size: 12px; font-weight: 700; }
.mls-shop .slots { display: grid; grid-template-columns: repeat(11, 1fr); gap: 3px; }
.mls-shop .slots i { height: 14px; background: #2b2b30; }
.mls-shop .slots i.full { background: var(--paper); }
.mls-shop .slots i.new { background: var(--yellow); }
.mls-shop .slots i.over { background: var(--red); }
.mls-shop .warn { font-size: 12px; color: var(--yellow); line-height: 1.4; }
.mls-shop .home { display: flex; gap: 8px; align-items: center; font-size: 13px; font-weight: 700; cursor: pointer; }
.mls-shop .home small { color: var(--muted); font-weight: 400; }
.mls-shop .deliv { font-size: 12px; color: var(--muted); }
.mls .mls-shop button.pay { font-family: var(--display); font-size: 26px; background: var(--red); color: var(--paper); border: 0; padding: 6px; cursor: pointer; }
.mls .mls-shop button.pay:disabled { background: #4a4a50; color: #999; cursor: not-allowed; }
.mls-shop .pay small { display: block; font-family: var(--body); font-size: 11px; letter-spacing: 1px; }
.mls.narrow .mls-shop { grid-template-columns: minmax(0, 1fr); }
.mls.narrow .mls-shop .head h1 { font-size: 44px; }
.mls.narrow .mls-shop .where { margin-left: 0; order: 3; width: 100%; }
.mls.narrow .mls-shop .where span { flex: 1; }
.mls.narrow .mls-shop .items { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.mls.narrow .mls-item .ph { font-size: 30px; }

.mls.narrow .mls-shop .cart { position: sticky; bottom: 0; top: auto; border-left: 0; border-top: 4px solid var(--red); background: var(--ink); gap: 8px; }
.mls.narrow .mls-shop .cart .detail { display: none; }
.mls.narrow .mls-shop .cart.open .detail { display: grid; max-height: 45vh; overflow: auto; }
.mls.narrow .mls-shop .cart h2 { font-size: 20px; cursor: pointer; display: flex; justify-content: space-between; }
.mls.narrow .mls-shop .cart h2::after { content: "\u25B2"; font-size: 14px; }
.mls.narrow .mls-shop .cart.open h2::after { content: "\u25BC"; }



.mls .mls-h-options h2 { font-family: var(--display); font-weight: 400; font-size: 22px; letter-spacing: 2px; color: var(--muted); margin: 0 0 6px; }
.mls .mls-h-options .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; margin-bottom: 10px; }
.mls button.mls-h-opt { display: grid; grid-template-columns: auto 1fr; gap: 0 8px; align-items: center; text-align: left; background: var(--yellow); color: var(--ink); border: 0; padding: 8px 10px; cursor: pointer;
  clip-path: polygon(8px 0, 100% 0, calc(100% - 6px) 100%, 0 100%); box-shadow: inset 0 -3px 0 rgba(0,0,0,.15); }
.mls button.mls-h-opt:hover { background: var(--paper); box-shadow: inset 6px 0 0 var(--red); }
.mls-h-opt .ic { grid-row: span 2; font-size: 24px; }
.mls-h-opt b { font-weight: 900; font-size: 15px; }
.mls-h-opt small { font-size: 11px; font-weight: 700; color: #4a4636; line-height: 1.25; }

.mls-h-panel { display: grid; gap: 10px; padding-top: 40px; }

.mls .mls-h-head { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; gap: 2px 14px; align-items: center; }
.mls .mls-h-head .mls-back { grid-row: span 2; align-self: center; margin: 0; }
.mls .mls-acts .mls-h-head h2 { font-family: var(--display); font-weight: 400; font-size: 40px; line-height: .95; letter-spacing: 1px; margin: 0; color: var(--paper);
  transform: rotate(-2deg); transform-origin: left; text-shadow: 3px 3px 0 var(--red); }
.mls .mls-h-head small { font-size: 12px; font-weight: 700; color: var(--muted); }

.mls .mls-h-panel .mls-said, .mls .mls-bag .mls-said { align-self: stretch; max-width: none; text-align: left; }
.mls-h-hint { font-size: 12px; color: var(--muted); margin: 0; }
.mls-h-rows { display: grid; gap: 6px; }
.mls-h-row { display: grid; grid-template-columns: 34px 1fr auto 90px; gap: 10px; align-items: center; background: rgba(28,28,32,.92); padding: 7px 10px; font-size: 14px; cursor: pointer; border-left: 4px solid transparent; }
.mls-h-row:hover { border-left-color: var(--paper); }
.mls-h-row.on { border-left-color: var(--yellow); background: #26241a; }
.mls-h-row .ic { font-size: 22px; } .mls-h-row .q { font-weight: 900; color: var(--muted); }
.mls-h-row .fresh { display: grid; gap: 3px; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-align: right; }
.mls-h-row .fresh .bar { height: 6px; background: #2b2b30; position: relative; }
.mls-h-row .fresh .bar i { position: absolute; inset: 0 auto 0 0; background: #2e7d32; }
.mls-h-row .fresh.soon { color: var(--yellow); } .mls-h-row .fresh.soon .bar i { background: var(--yellow); }
.mls-h-row .fresh.bad { color: var(--red); } .mls-h-row .fresh.bad .bar i { background: var(--red); }
.mls-h-row .fresh.keeps { color: var(--muted); } .mls-h-row .fresh.keeps .bar i { background: #555; }
.mls-h-detail { background: var(--paper); color: var(--ink); padding: 8px 12px; display: grid; gap: 6px; margin: -2px 0 4px 18px; }
.mls-h-detail b { font-weight: 900; font-size: 16px; }
.mls-h-detail .chips, .mls-h-have .chips, .mls-h-recipe .chips { display: flex; flex-wrap: wrap; gap: 4px; }
.mls-h-chip { font-size: 11px; font-weight: 900; padding: 1px 6px; background: #e2ded5; color: var(--ink); }
.mls-h-chip.gain { background: var(--ink); color: var(--yellow); }
.mls-h-chip.fresh { background: #d7ecd9; color: #1b5e20; }
.mls-h-chip.none { background: #3a3a40; color: #999; }

.mls .mls-sleep-dial { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; margin: 12px 0 6px; }
.mls .mls-sleep-dial button { width: 54px; height: 54px; border: 0; background: var(--red); color: #fff; font-family: var(--display); font-size: 30px; cursor: pointer; clip-path: polygon(8% 0, 100% 0, 92% 100%, 0 100%); }
.mls .mls-sleep-dial button:disabled { background: #2b2b30; color: #55555c; cursor: default; }
.mls .mls-sleep-dial .v { text-align: center; }
.mls .mls-sleep-dial .v b { display: block; font-family: var(--display); font-weight: 400; font-size: 48px; line-height: 1; letter-spacing: 1px; }
.mls .mls-sleep-dial .v small { display: block; font-size: 12px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-top: 4px; }
.mls .mls-sleep-dial .v small em { font-style: normal; color: var(--yellow); }
.mls .mls-sleep-presets { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; }
.mls .mls-sleep-presets button { background: #141417; color: var(--paper); border: 2px solid #2b2b30; padding: 6px 10px; font: inherit; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; cursor: pointer; }
.mls .mls-sleep-presets button small { display: block; font-size: 10px; letter-spacing: 1px; color: var(--muted); font-weight: 700; }
.mls .mls-sleep-presets button.work { border-color: #2bb3a3; }
.mls .mls-sleep-presets button.on { border-color: var(--yellow); background: #2a2610; }
.mls .mls-sleep-out { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 12px; }
.mls .mls-sleep-out .mls-h-chip.late { background: var(--red); color: #fff; }
.mls .mls-sleep-out .mls-h-chip.warn { background: var(--yellow); color: var(--ink); }
.mls .mls-sleep-go { width: 100%; background: var(--paper); color: var(--ink); border: 0; padding: 12px; font-family: var(--display); font-size: 24px; letter-spacing: 1px; cursor: pointer; }
.mls .mls-sleep-go small { display: block; font-family: var(--body); font-size: 11px; font-weight: 900; letter-spacing: 2px; color: #55555c; }
.mls-h-acts { display: flex; flex-wrap: wrap; gap: 6px; }
.mls .mls-h-acts button { font-weight: 900; font-size: 12px; letter-spacing: 1px; background: var(--ink); color: var(--paper); border: 0; padding: 5px 12px; cursor: pointer; }
.mls .mls-h-acts button.main { background: var(--red); }
.mls .mls-h-acts button:disabled { background: #999; cursor: not-allowed; }
.mls-h-have { background: rgba(28,28,32,.92); padding: 8px 10px; display: grid; gap: 6px; }
.mls-h-have small { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-h-recipes { display: grid; gap: 8px; }
.mls button.mls-h-recipe { display: grid; grid-template-columns: 1fr auto; gap: 3px 12px; align-items: center; text-align: left; background: var(--paper); color: var(--ink); border: 0; padding: 10px 14px 10px 18px; cursor: pointer;
  clip-path: polygon(10px 0, 100% 0, calc(100% - 6px) 100%, 0 100%); }
.mls button.mls-h-recipe:hover { box-shadow: inset 6px 0 0 var(--red); }
.mls button.mls-h-recipe.off { background: #3a3a40; color: #aaa; cursor: not-allowed; box-shadow: none; }
.mls-h-recipe .n { font-weight: 900; font-size: 17px; } .mls-h-recipe .h { font-family: var(--display); font-size: 22px; }
.mls-h-recipe .d { grid-column: 1 / -1; font-size: 12px; font-weight: 700; color: #555; }
.mls-h-recipe.off .d { color: #999; }
.mls-h-recipe .chips { grid-column: 1 / -1; }
.mls-h-recipe .why { grid-column: 1 / -1; font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--yellow); }

.mls button.mls-h-recipe.locked { opacity: .6; }
.mls-h-recipe .d b { font-weight: 900; }
.mls-h-cooked { background: var(--paper); color: var(--ink); padding: 12px 14px; display: grid; gap: 8px; border-left: 6px solid #1b7a3a; margin-bottom: 10px; }
.mls-h-cooked.burnt { border-left-color: #8a5a2b; } .mls-h-cooked.great { border-left-color: var(--yellow); }
.mls-h-cooked .top { display: flex; gap: 12px; align-items: center; }
.mls-h-cooked .ic { font-size: 34px; line-height: 1; }
.mls-h-cooked b { font-size: 18px; font-weight: 900; display: block; } .mls-h-cooked small { font-size: 12px; color: #444; }
.mls-h-cooked .chips { display: flex; flex-wrap: wrap; gap: 4px; }
.mls-h-cooked .acts { display: flex; gap: 8px; flex-wrap: wrap; }
.mls-h-cooked .acts small { display: block; font-size: 9px; letter-spacing: 1px; opacity: .7; }
.mls-h-cooked .acts .mls-set-btn.soft { color: var(--ink); border-color: #999; }
.mls-h-cooked .acts .mls-set-btn:not(.soft) { background: var(--ink); color: var(--paper); }
.mls-wellfed { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: var(--yellow); text-transform: uppercase; }

.mls-kitchen .mls-of .fr { aspect-ratio: 4 / 3; } .mls-kitchen .mls-fit > .big { aspect-ratio: 1; width: min(100%, 180px); }
.mls-kitchen .mls-of .ic { font-size: 50px; } .mls-kitchen .mls-fit > .big .ic { font-size: 84px; }
.mls-kitchen .mls-rack-list { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
.mls .mls-kitchen button.mls-of.no { opacity: .55; }
.mls-kitchen .mls-of .meta { font-size: 11px; font-weight: 700; color: #555; }
.mls-kitchen .mls-of .why { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: var(--red); text-transform: uppercase; }

.mls-kitchen .mls-of .taste { font-size: 11px; font-weight: 700; color: #1f7a3a; }
.mls-kitchen .mls-of .taste.bad { color: var(--red-dark); }
.mls-k-uses { display: grid; gap: 3px; }

.mls .mls-k-fridge { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
.mls .mls-k-fridge .chip { display: inline-flex; align-items: baseline; gap: 5px; background: var(--paper); color: #0b0b0d; font-size: 12px; font-weight: 800; padding: 4px 9px; }
.mls .mls-k-fridge .chip.dish { background: #e8dcc0; }
.mls .mls-k-fridge .chip b { font-weight: 900; }
.mls .mls-k-fridge .chip small { font-size: 10px; font-weight: 700; color: #6b6b70; }
.mls .mls-k-fridge .none { font-size: 12px; font-weight: 700; color: var(--muted); }
.mls-kitchen .head .mls-place-hud { align-self: center; }

.mls.narrow .mls-kitchen .head .mls-place-hud { order: 5; flex: 1 1 100%; width: 100%; justify-content: start; background: var(--ink); padding: 5px 10px; }
.mls-k-uses div { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; font-weight: 700; padding: 3px 0; border-bottom: 1px solid #ddd; }
.mls-k-uses .ok span:last-child { color: #1b7a3a; font-weight: 900; } .mls-k-uses .short span:last-child { color: var(--red); font-weight: 900; }

.mls .mls-shop .where span.mls-k-skill { display: grid; gap: 3px; min-width: 150px; }
.mls-k-skill .bar { display: block; height: 5px; background: #d6d1c6; } .mls-k-skill .bar b { display: block; height: 100%; background: var(--red); }
.mls-kitchen .mls-fit .mls-h-cooked { margin: 0; }

.mls-k-veil, .mls-shop > .mls-k-veil { position: fixed; inset: 0; z-index: 55; background: rgba(11,11,13,.55); display: grid; place-items: center; cursor: pointer; }

.mls-k-scene { --h: min(48vh, 360px); position: relative; display: flex; align-items: stretch; justify-content: center; max-width: 94vw; cursor: pointer; }

.mls-k-scene .mc { position: relative; z-index: 2; height: var(--h); aspect-ratio: 832 / 1216; margin-right: -28px; transform-origin: 50% 100%;
  animation: mls-k-sway .9s ease-in-out infinite alternate; display: grid; place-items: center; }
.mls-k-scene.done .mc { animation: none; }
.mls-k-scene .mc img { width: 100%; height: 100%; display: block; }
.mls-k-scene.framed .mc { border: 4px solid var(--paper); background: #26262b; box-shadow: 10px 10px 0 var(--red); overflow: hidden; }
.mls-k-scene.framed .mc img { object-fit: cover; object-position: 50% 15%; }
.mls-k-scene.cut .mc { margin-right: -60px; }
.mls-k-scene.cut .mc img { object-fit: contain; object-position: 50% 100%; filter: drop-shadow(0 10px 14px rgba(0,0,0,.6)); }
.mls-k-scene .mc .ic { font-size: 110px; }

.mls-k-scene.two { --h: min(42vh, 320px); }
.mls-k-scene .mc.other { margin-right: 0; margin-left: -28px; animation-delay: -.45s; }
.mls-k-scene.cut .mc.other { margin-right: 0; margin-left: -60px; }
.mls-k-scene.two .mls-k-pop { padding-right: 50px; }
.mls.narrow .mls-k-scene.two { --h: min(30vh, 200px); }
.mls.narrow .mls-k-scene .mc.other { margin-right: 0; margin-left: -20px; }
.mls.narrow .mls-k-scene.two .mls-k-pop { padding-right: 30px; }
.mls-k-pop { box-sizing: border-box; height: var(--h); width: min(calc(var(--h) * .9), 62vw); align-content: center; background: var(--ink); color: var(--paper); border: 3px solid var(--paper); box-shadow: 10px 10px 0 var(--red);
  padding: 18px 20px 16px 50px; display: grid; gap: 10px; justify-items: center; text-align: center; animation: mls-k-pop .3s cubic-bezier(.2,.85,.25,1.4); }
.mls-k-pop .pot { position: relative; width: min(100%, calc(var(--h) * .5)); aspect-ratio: 1; display: grid; place-items: center; background: #26262b; border: 3px solid var(--paper); }
.mls-k-pop .pot .ic { font-size: calc(var(--h) * .3); line-height: 1; }
.mls-k-pop.cooking .pot .ic { animation: mls-k-jiggle .32s ease-in-out infinite alternate; }
.mls.narrow .mls-k-scene { --h: min(40vh, 280px); }
.mls.narrow .mls-k-pop { width: min(calc(var(--h) * .72), 56vw); padding-left: 30px; padding-right: 12px; }
.mls.narrow .mls-k-scene .mc { margin-right: -20px; }
.mls.narrow .mls-k-pop { padding-left: 34px; }
.mls.narrow .mls-k-pop { gap: 6px; padding-top: 12px; padding-bottom: 10px; }
.mls.narrow .mls-k-pop .nm { font-size: 15px; } .mls.narrow .mls-k-pop .said { font-size: 28px; }

.mls.narrow .mls-kitchen .mls-rack-list { grid-template-columns: minmax(0, 1fr); gap: 6px; }
.mls.narrow .mls-kitchen button.mls-of { grid-template-columns: 44px minmax(0, 1fr); column-gap: 10px; row-gap: 1px; align-items: center; padding: 5px 8px 5px 5px; box-shadow: 3px 4px 0 rgba(0,0,0,.6); }
.mls.narrow .mls-kitchen .mls-of .fr { grid-row: span 3; width: 44px; aspect-ratio: 1; }
.mls.narrow .mls-kitchen .mls-of .ic { font-size: 26px; }
.mls.narrow .mls-kitchen .mls-of b { font-size: 14px; }
.mls.narrow .mls-shop.mls-rack.mls-kitchen .mls-fit { grid-template-columns: 44px minmax(0, 1fr) auto; gap: 2px 10px; }
.mls.narrow .mls-shop.mls-rack.mls-kitchen .mls-fit > .big { grid-column: 1; grid-row: 1 / span 3; width: 44px; }
.mls.narrow .mls-shop.mls-rack.mls-kitchen .mls-fit > .big .ic { font-size: 28px; }
.mls.narrow .mls-shop.mls-rack.mls-kitchen .mls-fit .nm { grid-column: 2; grid-row: 1; font-size: 15px; }
.mls.narrow .mls-shop.mls-rack.mls-kitchen .mls-fit .desc { display: block; grid-column: 2; grid-row: 2; font-size: 11px; }
.mls.narrow .mls-shop.mls-rack.mls-kitchen .mls-fit .mls-k-uses { grid-column: 2; grid-row: 3; display: flex; flex-wrap: wrap; gap: 2px 10px; }
.mls.narrow .mls-shop.mls-rack.mls-kitchen .mls-fit .mls-k-uses div { border: 0; padding: 0; font-size: 11px; gap: 4px; }
.mls.narrow .mls-shop.mls-rack.mls-kitchen .mls-fit button.buy { grid-column: 3; grid-row: 1 / span 3; align-self: center; padding: 10px 14px; }
.mls.narrow .mls-shop.mls-rack.mls-kitchen .mls-fit .mls-h-cooked { grid-column: 1 / -1; }

.mls-k-pop .steam { position: absolute; bottom: 58%; width: 16px; height: 24px; border-radius: 50%; background: rgba(255,255,255,.95); filter: blur(4px); opacity: 0;
  animation: mls-k-steam 1.1s ease-out infinite; }
.mls-k-pop .s1 { left: 28%; } .mls-k-pop .s2 { left: 46%; animation-delay: .35s; } .mls-k-pop .s3 { left: 62%; animation-delay: .7s; }
.mls-k-pop .nm { font-size: 20px; font-weight: 900; }
.mls-k-pop .bar { width: 100%; height: 8px; background: #3a3a40; } .mls-k-pop .bar b { display: block; height: 100%; width: 0; background: var(--red); animation: mls-k-fill var(--ms) linear forwards; }
.mls-k-pop small { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--muted); text-transform: uppercase; }
.mls-k-pop .said { font-style: normal; font-family: var(--display); font-size: 40px; line-height: 1; letter-spacing: 1px; color: var(--paper); animation: mls-k-pop .35s cubic-bezier(.2,.85,.25,1.4); }
.mls-k-pop.great .said { color: var(--yellow); } .mls-k-pop.burnt .said { color: #b9a58f; }
.mls-k-pop .spark { position: absolute; font-style: normal; color: var(--yellow); font-size: 22px; opacity: 0; animation: mls-k-spark .9s ease-out forwards; }
.mls-k-pop .k1 { top: 4px; left: 8px; } .mls-k-pop .k2 { top: -12px; left: 44%; animation-delay: .12s; } .mls-k-pop .k3 { top: 8px; right: 6px; animation-delay: .24s; }
.mls-k-pop .smoke { position: absolute; top: -14px; left: 18px; width: 70px; height: 46px; border-radius: 50%; background: rgba(150,150,150,.8); filter: blur(8px); opacity: 0; animation: mls-k-smoke 1.2s ease-out forwards; }
@keyframes mls-k-sway { from { transform: rotate(-3deg) translateY(0); } to { transform: rotate(3deg) translateY(-4px); } }
@keyframes mls-k-jiggle { from { transform: rotate(-4deg) translateY(0); } to { transform: rotate(4deg) translateY(-3px); } }
@keyframes mls-k-steam { 0% { transform: translateY(0) scale(.6); opacity: 0; } 30% { opacity: .9; } 100% { transform: translateY(-46px) scale(1.4); opacity: 0; } }
@keyframes mls-k-fill { to { width: 100%; } }
.mls-h-cooked { position: relative; }
.mls-h-cooked.fresh { animation: mls-k-pop .35s cubic-bezier(.2,.85,.25,1.4); }
.mls-h-cooked .spark { position: absolute; font-style: normal; color: var(--yellow); font-size: 20px; text-shadow: 0 0 4px rgba(0,0,0,.4); opacity: 0; animation: mls-k-spark .9s ease-out forwards; }
.mls-h-cooked .k1 { top: 6px; left: 18px; } .mls-h-cooked .k2 { top: -6px; left: 46%; animation-delay: .12s; } .mls-h-cooked .k3 { top: 10px; right: 16px; animation-delay: .24s; }
.mls-h-cooked .smoke { position: absolute; top: -10px; left: 20px; width: 60px; height: 40px; border-radius: 50%; background: rgba(90,90,90,.7); filter: blur(8px); opacity: 0; animation: mls-k-smoke 1.2s ease-out forwards; }
@keyframes mls-k-pop { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes mls-k-spark { 0% { transform: scale(.3); opacity: 0; } 40% { opacity: 1; transform: scale(1.3); } 100% { transform: translateY(-14px) scale(.8); opacity: 0; } }
@keyframes mls-k-smoke { 0% { opacity: 0; transform: translateY(10px) scale(.6); } 30% { opacity: .9; } 100% { opacity: 0; transform: translateY(-30px) scale(1.6); } }
.motion-off .mls-k-pop, .motion-off .mls-k-pop *, .motion-off .mls-h-cooked, .motion-off .mls-h-cooked * { animation: none !important; }



.mls-h-outfits { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
.mls button.mls-h-of { background: var(--paper); color: var(--ink); padding: 6px; border: 0; cursor: pointer; position: relative; transform: rotate(var(--r)); text-align: left; display: flex; flex-direction: column; gap: 3px; }
.mls button.mls-h-of:hover { transform: rotate(0) translateY(-3px); }
.mls-h-of .ph { aspect-ratio: 1; background: #e2ded5; display: grid; place-items: center; font-size: 32px; }
.mls-h-of b { font-size: 13px; font-weight: 900; line-height: 1.2; } .mls-h-of small { font-size: 11px; color: #555; }
.mls-h-of em { font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 1px; background: var(--ink); color: var(--paper); padding: 3px 6px; text-align: center; margin-top: auto; }
.mls button.mls-h-of.wear { outline: 4px solid var(--red); transform: rotate(0); cursor: default; }
.mls-h-of.wear::after { content: "WEARING"; position: absolute; top: -9px; left: -6px; font-family: var(--display); font-size: 13px; letter-spacing: 1px; background: var(--red); color: var(--paper); padding: 0 8px; transform: rotate(-6deg); }
.mls-h-furn { display: grid; gap: 8px; }
.mls-h-fs { display: grid; grid-template-columns: 70px 40px 1fr auto; gap: 10px; align-items: center; background: rgba(28,28,32,.92); padding: 8px 10px; }
.mls-h-fs .k { font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; }
.mls-h-fs .ic { font-size: 24px; text-align: center; } .mls-h-fs b { font-weight: 900; display: block; }
.mls-h-fs .eff { font-size: 12px; color: var(--yellow); }
.mls-h-fs.empty .ic { color: #555; } .mls-h-fs.empty b { color: #777; } .mls-h-fs.empty .eff { color: var(--muted); }
.mls-h-fs .lvl { display: flex; gap: 3px; } .mls-h-fs .lvl i { width: 14px; height: 8px; background: #3a3a40; } .mls-h-fs .lvl i.on { background: var(--paper); }
.mls-h-fs.coming { outline: 2px dashed var(--yellow); }
.mls button.mls-h-shop { font-family: var(--display); font-size: 22px; letter-spacing: 1px; background: var(--red); color: var(--paper); border: 0; padding: 6px 14px; cursor: pointer; text-align: left; }
.mls-h-shop small { display: block; font-family: var(--body); font-size: 11px; letter-spacing: 1px; }


.mls .mls-phone-veil { display: block; padding: 0; }
.mls .mls-phone { position: absolute; left: 96px; bottom: 18px; top: auto; max-height: calc(100% - 36px); overflow: hidden; transform-origin: left bottom; }
.mls-bag-veil { display: block; padding: 0; }
.mls-bag { position: absolute; left: 96px; bottom: 18px; max-height: calc(100% - 36px); overflow: auto; transform-origin: left bottom; }

.mls.narrow .mls-phone, .mls.narrow .mls-bag { transform-origin: right bottom; }


.mls-ask-veil { position: fixed; inset: 0; z-index: 60; background: rgba(11,11,13,.55); display: grid; place-items: center; }
.mls-ask { width: min(360px, 90%); background: var(--paper); color: var(--ink); padding: 16px 18px; display: grid; gap: 10px; box-shadow: 10px 10px 0 var(--red); transform: rotate(-1deg); }
.mls-ask b { font-family: var(--display); font-weight: 400; font-size: 26px; line-height: 1.05; }
.mls-ask small { font-size: 12px; font-weight: 700; color: #555; }
.mls-ask .count { display: flex; align-items: center; gap: 6px; }
.mls .mls-ask .count button { min-width: 34px; height: 30px; background: var(--ink); color: var(--paper); border: 0; font-weight: 900; cursor: pointer; padding: 0 8px; }
.mls-ask .count span { font-family: var(--display); font-size: 26px; min-width: 70px; text-align: center; }
.mls-ask .row { display: flex; gap: 8px; }
.mls .mls-ask .row button { flex: 1; font-family: var(--display); font-size: 20px; letter-spacing: 1px; border: 0; padding: 6px; cursor: pointer; background: #d9d4ca; color: var(--ink); }
.mls .mls-ask .row button.main { background: var(--red); color: var(--paper); }

.mls [data-drag] { cursor: grab; touch-action: none; }
.mls-drag-ghost { position: fixed; z-index: 99999; pointer-events: none; font-size: 34px; transform: translate(-50%, -60%) rotate(-8deg); filter: drop-shadow(3px 4px 0 rgba(0,0,0,.6)); }
.mls-h-zones { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.mls-h-zone { border: 3px dashed #4a4a50; padding: 10px 12px; display: grid; gap: 2px; text-align: center; transition: background .12s, border-color .12s; }
.mls-h-zone b { font-family: var(--display); font-weight: 400; font-size: 20px; letter-spacing: 1px; }
.mls-h-zone small { font-size: 11px; font-weight: 700; color: var(--muted); }
.mls-h-zone.ok { border-color: #4caf50; background: rgba(76,175,80,.12); }
.mls-h-zone.ok.over { background: rgba(76,175,80,.35); border-style: solid; }
.mls-h-zone.no { border-color: var(--red); background: rgba(229,25,28,.1); }
.mls-h-zone.no small { color: var(--red); font-weight: 900; }
.mls-h-zone.bagzone { display: none; }
.mls.dragging .mls-h-zone.bagzone { display: grid; }

.mls > .mls-phone-veil { z-index: 50; }
.mls-bag-veil { position: absolute; inset: 0; z-index: 45; background: rgba(11,11,13,.6); display: grid; justify-items: center; align-items: start; padding-top: 70px; }
.mls-bag { width: min(420px, 92%); background: var(--panel); border-left: 6px solid var(--red); box-shadow: 12px 12px 0 var(--red); padding: 14px 16px; display: grid; gap: 12px; transform: rotate(-1deg); }
.mls-bag-head { display: flex; align-items: baseline; gap: 10px; }
.mls-bag-head h2 { font-family: var(--display); font-weight: 400; font-size: 36px; letter-spacing: 1px; margin: 0; }
.mls-bag-head small { font-size: 13px; font-weight: 900; color: var(--muted); }
.mls .mls-bag-head .x { margin-left: auto; background: none; border: 2px solid var(--paper); color: var(--paper); width: 30px; height: 30px; cursor: pointer; font-weight: 900; }
.mls-bag-slots { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.mls-bag-slots .slot { aspect-ratio: 1; background: #1c1c20; border: 2px solid #2b2b30; display: grid; place-items: center; position: relative; cursor: pointer; font-size: 28px; }
.mls-bag-slots .slot:hover { border-color: var(--paper); }
.mls-bag-slots .slot.on { border-color: var(--yellow); background: #26241a; }
.mls-bag-slots .slot .n { position: absolute; right: 4px; bottom: 2px; font-size: 11px; font-weight: 900; }
.mls-bag-slots .slot .f { position: absolute; left: 3px; right: 3px; top: 3px; height: 4px; background: #2e7d32; }
.mls-bag-slots .slot .f.soon { background: var(--yellow); } .mls-bag-slots .slot .f.bad { background: var(--red); }
.mls-bag-slots .slot.empty { border-style: dashed; cursor: default; }
.mls-h-detail.light { margin: 0; }



.mls.narrow .mls-back { width: auto; align-self: flex-start; font-size: 14px; letter-spacing: 2px; padding: 7px 14px; min-height: 34px; border-bottom-width: 3px; }

.mls.narrow .mls-corridor .top { padding: 8px 12px; gap: 6px 10px; }
.mls.narrow .mls-corridor .top .clock { order: 0; font-size: 20px; padding: 0 8px; border-bottom-width: 3px; }
.mls.narrow .mls-corridor .top h1 { order: 2; width: 100%; font-size: 28px; }
.mls.narrow .mls-corridor .top .sub { order: 3; font-size: 11px; }
.mls.narrow .mls-corridor > .mls-said { width: auto; margin: 0 12px 6px; }

.mls.narrow .mls-place-top { gap: 6px; }
.mls.narrow .mls-place-title h1 { font-size: 32px; }

.mls .mls-corridor { height: 100%; min-height: 380px; }



.mls.narrow .mls-place-screen { --band: 46px; }
.mls.narrow .mls-place-screen .scene, .mls.narrow .mls-place-screen .wash { height: max(320px, calc(var(--tab-h, 540px) - 8px)); min-height: 0; }
.mls.narrow .mls-place-title { position: absolute; left: 0; right: 0; top: 0; z-index: 6; margin: 0; padding: 6px 8px; display: block;
  background: rgba(11,11,13,.9); border-bottom: 3px solid var(--red); }
.mls.narrow .mls-place-top { flex-wrap: nowrap; gap: 6px; margin: 0; align-items: center; }
.mls.narrow .mls-place-top .mls-back { font-size: 12px; letter-spacing: 1px; padding: 4px 10px; min-height: 30px; flex: none; max-width: 120px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
.mls.narrow .mls-place-hud { width: auto; flex: 1; min-width: 0; padding: 0 2px; border-bottom: 0; background: none; gap: 8px; flex-wrap: nowrap; justify-content: flex-end; }
.mls.narrow .mls-place-hud .clock { font-size: 16px; }
.mls.narrow .mls-place-hud .clock b { display: none; }
.mls.narrow .mls-place-hud .need { font-size: 0; gap: 3px; }
.mls.narrow .mls-place-hud .need:has([data-hud="energy"])::before { content: "E"; font-size: 10px; }
.mls.narrow .mls-place-hud .need:has([data-hud="hunger"])::before { content: "H"; font-size: 10px; }
.mls.narrow .mls-place-hud .need .bar-mini { width: 34px; }
.mls.narrow .mls-place-hud .cash { font-size: 15px; }

.mls.narrow .mls-place-title h1 { position: absolute; right: 10px; top: calc(var(--band) + 8px); font-size: 22px; transform: rotate(-3deg); }
.mls.narrow .mls-place-title .meta { display: none; }
.mls.narrow .mls-everyone { position: absolute; left: 8px; top: calc(var(--band) + 8px); }

.mls.narrow .mls-people { top: var(--band); bottom: auto; height: calc(max(320px, calc(var(--tab-h, 540px) - 8px)) - var(--band)); align-items: flex-end; }
.mls.narrow .mls-person .body.framed { width: min(42vw, calc((var(--tab-h, 540px) - 120px) * .8 * 5 / 8)); }
.mls.narrow .mls-place-screen.focus .mls-person.picked .body.framed { width: min(64vw, calc((var(--tab-h, 540px) - 90px) * .92 * 5 / 8)); }


.mls.narrow .mls-scene { display: block; position: relative; height: max(380px, var(--tab-h, 540px)); min-height: 0; padding: 0; overflow: hidden; }
.mls.narrow .mls-scene .sprite, .mls.narrow .mls-scene .sprite.framed { position: absolute; top: 34px; bottom: 0; left: 50%; right: auto; transform: translateX(-50%);
  height: auto; width: auto; aspect-ratio: 5 / 8; max-width: 96vw; margin: 0; }
.mls.narrow .mls-scene .when { position: absolute; top: 6px; left: 6px; margin: 0; max-width: calc(100% - 110px); z-index: 6; }
.mls.narrow .mls-scene .box { position: absolute; left: 8px; right: 8px; bottom: 8px; margin: 0; z-index: 8; max-height: 52%; overflow: auto;
  background: rgba(11,11,13,.88); }
.mls.narrow .mls-scene .bonds { display: none; position: absolute; left: 8px; right: 8px; top: 44px; z-index: 12; }
.mls.narrow .mls-scene.show-bonds .bonds { display: block; }

.mls.narrow .mls-scene .bonds.mls-out-mood { display: block; top: 6px; left: auto; right: 6px; width: 150px; padding: 5px 8px; }
.mls.narrow .mls-scene .bonds.mls-out-mood .name { font-size: 11px; }
.mls button.mls-bonds-toggle { display: none; }
.mls.narrow button.mls-bonds-toggle { display: block; position: absolute; top: 6px; right: 6px; z-index: 13; font-weight: 900; font-size: 11px; letter-spacing: 2px;
  background: var(--ink); color: var(--paper); border: 2px solid var(--paper); padding: 5px 10px; cursor: pointer; }

.mls.narrow .mls-scene .when { transform: scale(.68); transform-origin: top left; }
.mls.narrow .mls-scene .box .text { font-size: 15px; line-height: 1.45; }

.mls.narrow .mls-scene .box { overflow: visible; max-height: none; top: auto; }
.mls.narrow .mls-scene .box .text { max-height: calc(var(--tab-h, 540px) * .34); overflow: auto; }
.mls.narrow .mls-scene .mls-turn { max-height: calc(var(--tab-h, 540px) * .42); overflow: auto; }
.mls.narrow .mls-scene .mls-summary, .mls.narrow .mls-scene .mls-decide { max-height: calc(var(--tab-h, 540px) - 150px); overflow: auto; }

.mls.narrow .mls-place-screen { --photo-h: max(260px, calc(var(--tab-h, 540px) - 150px)); }
.mls.narrow .mls-place-screen .scene, .mls.narrow .mls-place-screen .wash { height: var(--photo-h); }
.mls.narrow .mls-people { height: calc(var(--photo-h) - var(--band)); }
.mls.narrow .mls-person .body.framed { width: min(42vw, calc((var(--photo-h) - var(--band) - 20px) * .9 * 5 / 8)); }
.mls.narrow .mls-place-screen.focus .mls-person.picked .body.framed { width: min(64vw, calc((var(--photo-h) - var(--band) - 10px) * .95 * 5 / 8)); }

.mls.narrow .mls-place-hud { display: grid; grid-template-columns: auto auto auto; grid-template-rows: auto auto; column-gap: 8px; row-gap: 3px; align-items: center; justify-content: end; }
.mls.narrow .mls-place-hud .clock { grid-column: 1; grid-row: 1 / 3; }
.mls.narrow .mls-place-hud .need:has([data-hud="energy"]) { grid-column: 2; grid-row: 1; }
.mls.narrow .mls-place-hud .need:has([data-hud="hunger"]) { grid-column: 2; grid-row: 2; }
.mls.narrow .mls-place-hud .cash { grid-column: 3; grid-row: 1 / 3; }
.mls.narrow .mls-place-hud .need .bar-mini { width: 30px; height: 5px; }
.mls.narrow .mls-place-top .mls-back + .mls-back { flex: 0 1 auto; min-width: 64px; max-width: 110px; }

.mls.narrow .mls-place-title h1 { text-shadow: 2px 2px 0 var(--red); }

.mls-h-tag { justify-self: start; font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 1px; background: var(--ink); color: var(--yellow); padding: 1px 6px; }



.mls-gift { display: grid; gap: 8px; }
.mls-gift .head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mls-gift .head b { font-family: var(--display); font-weight: 400; font-size: 19px; letter-spacing: 1px; }
.mls-gift .list { display: grid; gap: 5px; }
.mls .mls-gift button.row { display: grid; grid-template-columns: 30px 1fr auto auto; gap: 8px; align-items: center; text-align: left; border: 0; cursor: pointer;
  background: var(--paper); color: var(--ink); padding: 7px 10px; font-weight: 700; font-size: 14px; }
.mls .mls-gift button.row:hover { box-shadow: inset 6px 0 0 var(--red); }
.mls .mls-gift button.row.on { background: var(--yellow); box-shadow: inset 6px 0 0 var(--ink); }
.mls-gift .row .ic { font-size: 20px; text-align: center; }
.mls-gift .row .nm small { color: #666; }
.mls-gift .row .tag { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: #666; text-transform: uppercase; }
.mls-gift .row .kn { font-size: 10px; font-weight: 900; letter-spacing: 1px; padding: 1px 6px; background: #d8d4cb; text-transform: uppercase; }
.mls-gift .row .kn.good { background: #1b7a3a; color: var(--paper); }
.mls-gift .row .kn.bad { background: var(--red); color: var(--paper); }
.mls-gift .row .kn.q { background: none; color: #888; font-size: 14px; }
.mls .mls-gift button.give { font-family: var(--display); font-size: 21px; letter-spacing: 1px; border: 0; background: var(--red); color: var(--paper); padding: 6px 16px; cursor: pointer; justify-self: start; }
.mls .mls-gift button.give:disabled { background: #555; color: #999; cursor: not-allowed; }
.mls-gift-stamp { justify-self: start; width: fit-content; margin: 2px 0 2px 8px; font-family: var(--display); font-size: 24px; letter-spacing: 1px; background: var(--yellow); color: var(--ink); padding: 2px 14px 4px;
  transform: rotate(-3deg); box-shadow: 5px 5px 0 var(--ink); display: grid; animation: mls-gift-stamp .35s cubic-bezier(.2, 1.6, .4, 1); }
.mls-gift-stamp.bad { background: var(--red); color: var(--paper); }
.mls-gift-stamp small { font-family: var(--body); font-size: 10px; font-weight: 900; letter-spacing: 1px; opacity: .75; }
@keyframes mls-gift-stamp { from { transform: rotate(-12deg) scale(1.8); opacity: 0; } }
.motion-off .mls-gift-stamp { animation: none; }

.mls-sheet-gifts { display: grid; gap: 6px; border-top: 2px dashed var(--line); padding-top: 8px; }
.mls-sheet-gifts .lbl.strong { font-weight: 900; letter-spacing: 2px; color: var(--paper); }
.mls-contacts .mls-sheet-gifts .like.love { background: var(--yellow); color: var(--ink); border-color: var(--yellow); }
.mls-sheet-gifts .given { display: grid; gap: 2px; font-size: 12px; }
.mls-sheet-gifts .given span { color: var(--muted); font-weight: 700; }
.mls-sheet-gifts .given b.bad { color: var(--red); }

.mls-item .chip.likes { background: #1b7a3a; color: var(--paper); }
.mls-item .chip.dis { background: var(--red); color: var(--paper); }

.mls .mls-of .chip.likes, .mls .mls-fit .chip.likes { background: #1b7a3a; color: var(--paper); }

.mls-tastes { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 5px; font-size: 12px; }
.mls-tastes .k { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-right: 4px; }
.mls-tastes .chip { font-size: 11px; font-weight: 700; padding: 1px 7px; background: #26262b; }
.mls-tastes .chip.love { background: var(--yellow); color: var(--ink); }
.mls-tastes .chip.no { background: var(--red-dark); }
.mls-tastes .chip.q { color: var(--muted); }
.mls-tastes.edit label { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 900; }
.mls-tastes.edit select { font-size: 12px; padding: 2px 4px; }


.mls-settings.mls-cal { align-content: start; }
.mls-cal .top { align-items: center; }
.mls-cal .month { font-family: var(--display); font-size: 26px; display: flex; align-items: center; gap: 8px; margin-left: auto; }
.mls .mls-cal .month button { background: var(--panel); border: 0; padding: 0 10px; cursor: pointer; font-family: var(--display); font-size: 20px; color: var(--paper); }
.mls-cal .month button:disabled { opacity: .3; cursor: default; }
.mls-cal .body { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 18px; align-items: start; }
.mls-cal .grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.mls-cal .dow { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); padding: 0 4px; }
.mls .mls-cal button.d { background: var(--panel); color: var(--paper); border: 0; border-left: 3px solid transparent; min-height: 84px; padding: 4px 5px; display: grid; gap: 2px; align-content: start; text-align: left; cursor: pointer; font: inherit; min-width: 0; }
.mls-cal .d.out { background: none; }
.mls-cal button.d:hover { outline: 2px solid var(--paper); }
.mls-cal .d.past { opacity: .5; }
.mls-cal .d.before { opacity: .2; }
.mls .mls-cal button.d.today { border-left-color: var(--yellow); background: #1f1f24; }
.mls-cal .d.sel { outline: 3px solid var(--red); }
.mls-cal .d .n { font-family: var(--display); font-size: 17px; line-height: 1; }
.mls-cal .d.today .n { color: var(--yellow); }
.mls-cal .d .ev { font-size: 10px; font-weight: 700; padding: 0 4px; border-left: 3px solid var(--c); background: #22222a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mls-cal .d .more { font-size: 10px; font-weight: 900; color: var(--muted); }
.mls-cal .d .dots { display: none; flex-wrap: wrap; gap: 2px; }
.mls-cal .d .dots i { width: 6px; height: 6px; background: var(--c); }
.mls-cal .cal-shift { --c: #1976d2; } .mls-cal .cal-off { --c: #8d8a85; } .mls-cal .cal-rent { --c: #e5191c; } .mls-cal .cal-review { --c: #ffe14d; }
.mls-cal .cal-delivery { --c: #f57c00; } .mls-cal .cal-news { --c: #2e9d52; } .mls-cal .cal-note { --c: #f4f1ea; }
.mls-cal .ev.missed, .mls-cal .slot.missed b { text-decoration: line-through; }
.mls-cal .cal-legend { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; font-weight: 700; color: var(--muted); margin-top: 8px; }
.mls-cal .cal-legend span::before { content: ""; display: inline-block; width: 9px; height: 9px; background: var(--c); margin-right: 5px; }
.mls-cal .day { background: var(--panel); border-left: 5px solid var(--red); padding: 10px 14px 14px; display: grid; gap: 9px; }
.mls-cal .day h2 { font-family: var(--display); font-weight: 400; font-size: 26px; margin: 0; }
.mls-cal .day h2 small { font-family: var(--body); font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-cal .slot { display: grid; grid-template-columns: 50px 1fr auto; gap: 8px; align-items: start; }
.mls-cal .slot .h { font-family: var(--display); font-size: 16px; color: var(--muted); }
.mls-cal .slot .what { display: grid; border-left: 4px solid var(--c); padding-left: 8px; font-size: 13px; }
.mls-cal .slot .what span { font-size: 11px; color: var(--muted); }
.mls .mls-cal .slot .x { background: none; border: 0; color: var(--muted); cursor: pointer; }
.mls .mls-cal button.add { justify-self: start; background: none; border: 2px solid var(--paper); color: var(--paper); font-weight: 900; font-size: 12px; letter-spacing: 2px; padding: 5px 12px; cursor: pointer; }
.mls-cal .note { display: flex; flex-wrap: wrap; gap: 6px; }
.mls-cal .note input { flex: 1 1 100%; background: var(--paper); color: var(--ink); border: 0; padding: 7px 9px; font: inherit; user-select: text; }
.mls-cal .note select { background: var(--paper); color: var(--ink); border: 0; padding: 5px; font: inherit; }
.mls .mls-cal .note button { border: 0; font-weight: 900; font-size: 12px; letter-spacing: 1px; padding: 5px 12px; cursor: pointer; background: #333; color: var(--paper); }
.mls .mls-cal .note button.main { background: var(--red); }

.narrow .mls-cal .body { grid-template-columns: 1fr; gap: 10px; }
.narrow .mls-cal .month { font-size: 20px; margin-left: 0; }
.narrow .mls-cal h1 { font-size: 32px; }
.narrow .mls-cal button.d { min-height: 40px; padding: 3px; }
.narrow .mls-cal .d .n { font-size: 14px; }
.narrow .mls-cal .d .ev, .narrow .mls-cal .d .more { display: none; }
.narrow .mls-cal .d .dots { display: flex; }
.narrow .mls-cal .grid { gap: 3px; }
.narrow .mls-cal .dow { letter-spacing: 0; font-size: 9px; }


.mls:not(.narrow) .mls-settings, .mls:not(.narrow) .mls-you { height: 100%; overflow: auto; }
.mls:not(.narrow) .mls-contacts { height: 100%; min-height: 0; }
.mls:not(.narrow) .mls-contacts .list { height: 100%; max-height: none; }
.mls:not(.narrow) .mls-contacts .sheet { height: 100%; overflow: auto; }


.mls-place-top { position: relative; z-index: 2; }
.mls-place-title h1 { margin-top: .3em; pointer-events: none; }
.mls.narrow .mls-place-title h1 { margin-top: 0; }


.mls-faint { min-height: var(--tab-h, 560px); height: 100%; }

.mls.mls-fx-ghost *, .mls.mls-fx-ghost *::before, .mls.mls-fx-ghost *::after { animation: none !important; }


.mls button.mls-phone-fab.moving { transform: scale(1.15) rotate(-8deg); transition: none; box-shadow: 8px 8px 0 var(--red); cursor: grabbing; will-change: translate; }

.mls-settings, .mls-you { align-content: start; }


.mls-cast-set-list { display: grid; gap: 6px; }
.mls-cast-set { display: grid; grid-template-columns: 44px 1fr auto; gap: 12px; align-items: center; background: #1a1a1e; border-left: 4px solid var(--c); padding: 6px 10px; }

.mls-cast-set .acts { display: grid; gap: 6px; justify-items: stretch; }
.mls.narrow .mls-cast-set .acts { grid-column: 1 / -1; grid-auto-flow: column; }
.mls-cast-set .av { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; background: var(--c); font-family: var(--display); font-size: 20px; position: relative; }
.mls-cast-set .who { display: grid; }
.mls-cast-set .who b { font-family: var(--display); font-weight: 400; font-size: 18px; letter-spacing: 1px; }
.mls-cast-set .who small { font-size: 11px; color: var(--muted); font-weight: 700; }
.mls-cast-set.gone { opacity: .7; }
.mls button.mls-set-btn { background: var(--paper); color: var(--ink); border: 0; font-weight: 900; font-size: 11px; letter-spacing: 2px; padding: 6px 12px; cursor: pointer; }
.mls button.mls-set-btn.soft { background: none; color: var(--muted); border: 2px solid #3a3a40; }
.mls button.mls-set-btn.soft:hover { color: var(--paper); border-color: var(--red); }
.mls-set-fields { display: flex; flex-wrap: wrap; gap: 12px; }
.mls-set-fields .field { display: grid; gap: 4px; font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); min-width: 200px; }
.mls-set-fields select, .mls-set-fields input, .mls-set-fields textarea { background: var(--paper); color: var(--ink); border: 0; padding: 7px 9px; font: inherit; font-size: 13px; letter-spacing: 0; font-weight: 700; }
.mls-sampling .field { min-width: 140px; }
.mls-sampling .field.wide { flex-basis: 100%; }
.mls-sampling textarea { resize: vertical; font-family: monospace; }
.mls-spoil-warn { background: var(--yellow); color: var(--ink); padding: 10px 14px; display: grid; gap: 4px; margin-top: 6px; }
.mls-spoil-warn small { font-size: 12px; font-weight: 700; }
.mls-spoil-warn .row { display: flex; gap: 8px; margin-top: 4px; }
.mls .mls-spoil-warn button { border: 0; font-weight: 900; font-size: 12px; letter-spacing: 1px; padding: 5px 12px; cursor: pointer; background: #333; color: var(--paper); }
.mls .mls-spoil-warn button.main { background: var(--red); }

.mls-saved { font-family: var(--body); font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 2px; background: var(--yellow); color: var(--ink);
  padding: 2px 8px; margin-right: auto; margin-left: 10px; align-self: center; animation: mls-saved 1.6s ease-in forwards; }
@keyframes mls-saved { 0%, 60% { opacity: 1; } 100% { opacity: 0; } }

.mls-settings .box > .mls-said { align-self: auto; justify-self: stretch; max-width: none; text-align: left; font-size: 13px; border-left: 4px solid var(--yellow); padding: 6px 12px; }
.mls-settings .box > .mls-said.bad { border-left-color: var(--paper); }

.mls-adding { background: var(--yellow); color: var(--ink); font-size: 10px; font-weight: 900; letter-spacing: 2px; padding: 6px 10px; margin-bottom: 10px; display: grid; }
.mls-adding b { font-family: var(--display); font-weight: 400; font-size: 20px; letter-spacing: 1px; }

.mls .shot .upload { position: absolute; right: 6px; top: 26px; background: rgba(11,11,13,.85); color: var(--paper); border: 1px solid var(--paper); font-size: 9px; font-weight: 900; letter-spacing: 1px; padding: 1px 6px; cursor: pointer; }
.mls .shot .upload:hover { background: var(--yellow); color: var(--ink); }
.mls .shot .chip.yours { background: var(--yellow); color: var(--ink); }
.mls .shot.drop-on { outline: 3px dashed var(--yellow); outline-offset: -3px; }



.mls-mall .mls-door { height: min(86%, 470px); }

.mls-corridor .mls-floor { width: 0; padding: 6px 0 0 12px; white-space: nowrap; overflow: visible; color: rgba(244,241,234,.95);
  border-left: 3px solid; border-image: linear-gradient(180deg, rgba(244,241,234,.95), rgba(244,241,234,.25)) 1;
  filter: drop-shadow(0 0 3px rgba(0,0,0,.85)); text-shadow: 3px 3px 0 #0b0b0d, 0 0 18px rgba(0,0,0,.9); }
.mls-store .window { background: var(--bg); background-size: cover; background-position: center; display: grid; place-items: center; }
.mls-store .window::after { display: none; }
.mls-store .window .ic { font-size: 64px; filter: drop-shadow(4px 4px 0 rgba(0,0,0,.5)); }
.mls-store .window .new { position: absolute; top: 10px; right: -4px; font-family: var(--display); font-size: 15px; letter-spacing: 1px; background: var(--yellow); color: var(--ink); padding: 1px 10px; transform: rotate(5deg); }
.mls-store .window .shut { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%) rotate(-3deg); font-size: 11px; font-weight: 900; letter-spacing: 2px; background: var(--ink); color: var(--paper); padding: 3px 10px; white-space: nowrap; }
.mls-store.here .window { outline: 4px solid var(--yellow); outline-offset: -4px; }


.mls-rack-strip { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; background: rgba(11,11,13,.8); border-left: 4px solid var(--yellow); padding: 8px 12px; font-size: 12px; font-weight: 700; }
.mls-rack-strip b { font-size: 11px; letter-spacing: 2px; color: var(--yellow); }
.mls-rack-strip .on { color: var(--yellow); }
.mls-rack-strip .warn { background: #333; padding: 1px 8px; }
.mls-rack-strip.off { border-left-color: #555; color: var(--muted); }
.mls-rack-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 18px 16px; }

.mls button.mls-of { background: var(--paper); color: var(--ink); border: 0; padding: 6px; display: grid; gap: 3px; text-align: left; cursor: pointer; position: relative;
  box-shadow: 5px 6px 0 rgba(0,0,0,.6); transition: transform .12s; }
.mls button.mls-of:hover { transform: translateY(-3px); }
.mls button.mls-of.on { outline: 4px solid var(--yellow); transform: none; }
.mls-of .fr, .mls-fit > .big { aspect-ratio: 5 / 8; background: #e2ded5; display: grid; place-items: center; position: relative; overflow: hidden; }
.mls-of .fr img, .mls-fit > .big img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 20%; }

.mls-fit > .big .mls-fit-redo { position: absolute; right: 6px; top: 6px; background: rgba(11,11,13,.85); color: var(--paper); border: 1px solid var(--paper); font-size: 9px; font-weight: 900; letter-spacing: 1px; padding: 2px 7px; cursor: pointer; z-index: 2; }
.mls-fit > .big .mls-fit-redo:hover { background: var(--yellow); color: var(--ink); }
.mls-fit > .big .mls-fit-redo.busy { cursor: default; opacity: .8; }
.mls-of .ic { font-size: 44px; } .mls-fit .ic { font-size: 70px; }
.mls-of .fr em, .mls-fit > .big em { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 1px; background: var(--ink); color: var(--paper); padding: 2px 8px; white-space: nowrap; }
.mls-of .fr em.paint, .mls-fit > .big em.paint { background: var(--yellow); color: var(--ink); animation: mls-painting-blink 1s ease-in-out infinite alternate; }
.mls-of .fr em.bad, .mls-fit > .big em.bad { background: var(--red); }
@keyframes mls-painting-blink { to { opacity: .45; } }
.mls-of b { font-size: 13px; font-weight: 900; line-height: 1.2; }
.mls-of .price { font-family: var(--display); font-size: 22px; line-height: 1; }
.mls-of .badge { position: absolute; top: -10px; right: -8px; z-index: 2; font-family: var(--display); font-size: 14px; letter-spacing: 1px; background: var(--yellow); color: var(--ink); padding: 1px 10px; transform: rotate(6deg); }
.mls-of .own { position: absolute; top: -9px; left: -6px; z-index: 2; font-family: var(--display); font-size: 13px; letter-spacing: 1px; background: var(--ink); color: var(--paper); padding: 0 8px; transform: rotate(-6deg); }
.mls-of.wear .own { background: var(--red); }
.mls-fit { position: sticky; top: 0; align-self: start; background: var(--paper); color: var(--ink); padding: 14px; display: grid; gap: 8px; box-shadow: 8px 8px 0 var(--red); }
.mls-fit > .big { width: min(100%, 230px); justify-self: center; box-shadow: 4px 4px 0 rgba(0,0,0,.35); }
.mls-fit .nm { font-size: 18px; font-weight: 900; }
.mls-fit .desc { margin: 0; font-size: 13px; line-height: 1.4; }
.mls-fit .see { font-size: 11px; color: #666; font-weight: 700; }
.mls-fit .chips { display: flex; flex-wrap: wrap; gap: 4px; }
.mls-fit .owned { font-size: 11px; font-weight: 900; letter-spacing: 2px; color: #666; }
.mls .mls-fit button.buy { background: var(--red); color: var(--paper); border: 0; font-weight: 900; font-size: 14px; letter-spacing: 2px; padding: 9px 12px; cursor: pointer; display: grid; text-align: left; }
.mls .mls-fit button.buy.soft { background: var(--ink); }
.mls .mls-fit button.buy:disabled { background: #999; cursor: not-allowed; }
.mls-fit button small { font-size: 10px; letter-spacing: 0; font-weight: 700; opacity: .85; }
.mls .mls-fit button.retry { background: none; color: #7a5a00; border: 2px dashed #b8860b; font-size: 11px; font-weight: 900; letter-spacing: 1px; padding: 5px 10px; cursor: pointer; display: grid; text-align: left; }
.mls.narrow .mls-fit { position: static; transform: none; }


.mls-h-outfits.pics .ph { aspect-ratio: 5 / 8; overflow: hidden; }
.mls-h-outfits .ph img, .mls-item .ph.pic img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 20%; }
.mls-item .ph.pic { aspect-ratio: 5 / 8; overflow: hidden; }


.mls-ask.mls-split { width: min(560px, 94%); }
.mls-split .f { display: grid; gap: 3px; font-size: 11px; font-weight: 900; letter-spacing: 2px; color: #333; }
.mls-split .f small { letter-spacing: 0; }
.mls-split .f textarea { font: inherit; font-size: 13px; letter-spacing: 0; font-weight: 400; color: var(--ink); background: #fff; border: 2px solid #bbb; padding: 7px 9px; resize: vertical; }
.mls-split .f textarea:disabled { background: #eee; }
.mls-ask .row button:disabled { opacity: .45; cursor: default; }



.mls-person.asleep .body { filter: brightness(.42) saturate(.35) contrast(.95); }
.mls-person.asleep .plate { background: #1d2230; }
.mls-person.asleep .plate > span { color: #9fb4ff; font-weight: 900; letter-spacing: 1px; }
.mls-zzz { position: absolute; top: 6%; right: 8%; font-family: var(--display); color: #cfe0ff; text-shadow: 3px 3px 0 #0b0b0d; pointer-events: none; font-size: 22px; }
.mls-zzz, .mls-zzz i, .mls-zzz b { font-style: normal; font-weight: 400; display: inline-block; animation: mls-zfloat 2.4s ease-in-out infinite; }
.mls-zzz i { font-size: 30px; animation-delay: .4s; } .mls-zzz b { font-size: 40px; animation-delay: .8s; }
@keyframes mls-zfloat { 0%, 100% { transform: translateY(0); opacity: .55; } 50% { transform: translateY(-8px); opacity: 1; } }
.mls-asleep { background: #1d2230; color: #cfe0ff; padding: 10px 14px; display: grid; gap: 2px; border-left: 5px solid #9fb4ff; }
.mls-asleep b { font-family: var(--display); font-weight: 400; font-size: 26px; letter-spacing: 2px; line-height: 1; }
.mls-asleep span { font-weight: 900; }

.mls-door.dark .leaf { filter: brightness(.55); }
.mls-door.dark .state em { color: #9fb4ff; }
.mls-corridor .heads b.asleep { filter: brightness(.45) saturate(.3); }
.mls-door-act.go small { display: block; font-size: 9px; letter-spacing: 0; opacity: .8; text-transform: none; }

.mls-where { font-size: 11px; font-weight: 900; letter-spacing: 2px; background: var(--ink); color: var(--paper); padding: 3px 9px; }
.mls-answer { display: grid; gap: 4px; padding: 10px 14px; transform: rotate(-.6deg); }
.mls-answer b { font-family: var(--display); font-weight: 400; font-size: 26px; letter-spacing: 1px; line-height: 1.05; }
.mls-answer small { font-size: 11px; font-weight: 900; letter-spacing: 1px; }
.mls-answer.yes { background: var(--yellow); color: var(--ink); box-shadow: 6px 6px 0 var(--ink); }
.mls-answer.no { background: #2b2b30; color: var(--paper); box-shadow: 6px 6px 0 #000; }
.mls .mls-answer button { justify-self: start; margin-top: 4px; background: var(--red); color: var(--paper); border: 0; font-weight: 900; font-size: 15px; letter-spacing: 2px; padding: 8px 16px; cursor: pointer; display: grid; text-align: left; }
.mls-answer button small { font-size: 10px; letter-spacing: 0; opacity: .9; }
.mls .mls-leave { margin-top: 8px; justify-self: start; }

.mls-with { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
.mls-with .until { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--muted); }
.mls-activity.two { position: relative; }
.mls-activity.two.theirs { outline: 3px solid var(--yellow); outline-offset: -3px; }
.mls-activity.two.picked { outline: 3px solid #ff5c8a; outline-offset: -3px; }
.mls .mls-party-over-veil .mls-party-over { width: min(560px, 100%); max-height: calc(100% - 32px); overflow: auto; background: #0d0d10; color: var(--paper); padding: 16px 18px; box-shadow: 10px 10px 0 var(--red); }
.mls-arch { display: inline-block; vertical-align: 2px; margin-right: 8px; font-size: 10px; font-weight: 900; letter-spacing: 2px; background: var(--yellow); color: var(--ink); padding: 1px 8px; transform: rotate(-2deg); }
.mls-activity.two.locked { opacity: .7; }
.mls-activity.two.stay { border-left: 5px solid #9fb4ff; }

.mls-sheet-week .c.sleep { background: #1d2230; color: #cfe0ff; }
.mls-week .c.sleep { background: repeating-linear-gradient(135deg, #1d2230 0 6px, #252b3d 6px 12px) !important; color: #cfe0ff; }
.mls-key i.sleep { background: repeating-linear-gradient(135deg, #1d2230 0 4px, #3a4460 4px 8px); }
.mls-line.sleep { background: #1d2230; color: #cfe0ff; }
.mls-zz { display: inline-flex; gap: 5px; align-items: center; font-size: 11px; font-weight: 900; letter-spacing: 1px; padding: 3px 8px; border: 2px solid #555; cursor: pointer; white-space: nowrap; justify-self: start; width: auto; }
.mls-zz.on { border-color: #9fb4ff; color: #9fb4ff; }
.mls-into { display: inline-flex; flex-wrap: wrap; gap: 6px; }
.mls .mls-zz input { appearance: auto; width: 14px; height: 14px; min-width: 0; padding: 0; margin: 0; border: 0; flex: none; }


.mls-build .v { font-size: 14px; font-weight: 700; }
.mls-debug-bar { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.mls-debug-bar .scope { display: flex; gap: 4px; }
.mls .mls-debug-bar .scope button { background: #000; color: var(--paper); border: 2px solid var(--line); padding: 6px 12px; font-weight: 900; font-size: 11px; letter-spacing: 2px; cursor: pointer; }
.mls .mls-debug-bar .scope button.on { background: var(--yellow); color: var(--ink); border-color: var(--yellow); }
.mls-debug-bar .tot { display: flex; gap: 16px; flex-wrap: wrap; flex: 1; }
.mls-debug-bar .tot span { display: grid; }
.mls-debug-bar .tot i { font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; }
.mls-debug-bar .tot b { font-family: var(--display); font-weight: 400; font-size: 22px; letter-spacing: 1px; line-height: 1.1; }
.mls-debug-bar .tot .bad b { color: var(--red); }
.mls-debug-bar .tot .warn b { color: var(--yellow); }
.mls-calls-head, .mls-call { display: grid; grid-template-columns: 76px minmax(0, 1fr) 84px 96px 64px 96px; gap: 10px; align-items: center; }
.mls-calls-head { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); padding: 0 12px; }
.mls-calls-head span:nth-child(n+3) { text-align: right; }
.mls-calls { display: grid; gap: 3px; }
.mls-call-day { font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--yellow); margin: 8px 0 2px; }
.mls .mls-call { width: 100%; text-align: left; background: #000; color: var(--paper); border: 0; border-left: 4px solid var(--line); padding: 8px 12px; font: inherit; cursor: pointer; }
.mls .mls-call:hover { background: #1b1b20; }
.mls .mls-call.open { background: #1b1b20; border-left-color: var(--yellow); }
.mls .mls-call.failed { border-left-color: var(--red); }
.mls .mls-call.cancelled { border-left-color: var(--muted); }
.mls-call .t { font-variant-numeric: tabular-nums; font-size: 12px; color: var(--muted); font-weight: 700; }
.mls-call .l { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; min-width: 0; }
.mls-call .l b { font-size: 14px; }
.mls-call .who { font-size: 12px; font-weight: 900; color: var(--yellow); }
.mls-call .whose { font-size: 10px; font-weight: 900; letter-spacing: 1px; background: var(--line); padding: 1px 6px; text-transform: uppercase; }
.mls-call .model { font-size: 11px; font-weight: 700; color: var(--muted); }
.mls-call .u, .mls-call .s { text-align: right; font-variant-numeric: tabular-nums; font-weight: 900; font-size: 13px; }
.mls-call .u.up::before { content: "\u2191 "; color: var(--muted); }
.mls-call .u.dn::before { content: "\u2193 "; color: var(--muted); }
.mls-call .s { color: var(--muted); font-weight: 700; }
.mls-call .o { text-align: right; font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-call.failed .o { color: var(--red); }
.mls-call-open { background: #1b1b20; border-left: 4px solid var(--yellow); padding: 10px 12px 14px; display: grid; gap: 10px; margin-bottom: 6px; }
.mls-call-open .meta { font-size: 12px; color: var(--muted); font-weight: 700; }
.mls-call-open .meta b { color: var(--paper); }
.mls-call-open .err { font-size: 13px; font-weight: 700; display: flex; gap: 10px; align-items: baseline; }
.mls-call-open .err i { font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 2px; background: var(--red); padding: 2px 8px; flex: none; }
.mls-call-open .err.cancelled i { background: var(--line); }
.mls-call-open .io { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: start; }
.mls-call-open .side { display: grid; gap: 6px; min-width: 0; }
.mls-call-open .cap { display: flex; gap: 10px; align-items: baseline; }
.mls-call-open .cap b { font-family: var(--display); font-weight: 400; font-size: 22px; letter-spacing: 1px; }
.mls-call-open .cap small { font-size: 11px; font-weight: 700; color: var(--muted); flex: 1; }
.mls .mls-call-open .cap button { background: #000; color: var(--paper); border: 2px solid var(--line); padding: 3px 10px; font-weight: 900; font-size: 10px; letter-spacing: 2px; cursor: pointer; }
.mls-call-open .msg { display: grid; gap: 3px; }
.mls-call-open .msg em { font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--yellow); }
.mls-call-open pre { margin: 0; background: #000; border: 2px solid var(--line); padding: 10px 12px; font: 12px/1.5 ui-monospace, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 360px; overflow: auto; color: #e6e3dc; }
.mls-call-open .none { color: var(--muted); font-weight: 900; }
.mls.narrow .mls-calls-head { display: none; }
.mls.narrow .mls-debug-bar .tot { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 12px; flex: 1 1 100%; }
.mls.narrow .mls-call { grid-template-columns: auto auto auto minmax(0, 1fr); grid-template-areas: "t t t o" "l l l l" "up dn s s"; gap: 4px 14px; }
.mls.narrow .mls-call .t { grid-area: t; } .mls.narrow .mls-call .l { grid-area: l; } .mls.narrow .mls-call .o { grid-area: o; }
.mls.narrow .mls-call .up { grid-area: up; text-align: left; } .mls.narrow .mls-call .dn { grid-area: dn; text-align: left; } .mls.narrow .mls-call .s { grid-area: s; text-align: left; }
.mls.narrow .mls-call-open .io { grid-template-columns: minmax(0, 1fr); }


.mls-scene.keyed .backdrop.key { filter: none; opacity: 1; background-size: contain; background-position: center; background-repeat: no-repeat; background-color: #000; }
.mls-scene.keyed .backdrop.key::after { display: none; }
.mls-scene.keyed .backdrop.key.waiting { background-size: cover; background-color: transparent; filter: brightness(.35) blur(2px); }
.mls-key-wait { position: absolute; left: 50%; top: 38%; transform: translate(-50%, -50%); display: grid; justify-items: center; gap: 8px; text-align: center; color: var(--paper);
  font-family: var(--display); font-size: 30px; letter-spacing: 2px; z-index: 1; pointer-events: none; }
.mls-key-wait small { font-family: var(--body); font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--muted); }
.mls-key-wait .spin, .mls-album-tile .spin, .mls-light .spin { width: 22px; height: 22px; border: 4px solid var(--yellow); border-right-color: transparent; border-radius: 50%; animation: mls-spin .8s linear infinite; display: inline-block; }
.mls .mls-hide-text { position: absolute; left: 50%; transform: translateX(-50%); top: 16px; z-index: 6; background: rgba(0,0,0,.65); color: var(--paper); border: 2px solid var(--line); font-weight: 900; font-size: 11px; letter-spacing: 2px; padding: 6px 12px; cursor: pointer; }

.mls .mls-key-tools { position: absolute; left: 50%; transform: translateX(-50%); top: 16px; z-index: 6; display: flex; gap: 6px; }
.mls .mls-key-tools .mls-hide-text { position: static; transform: none; }
.mls .mls-key-redo { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,0,0,.65); color: var(--paper); border: 2px solid var(--line); font-weight: 900; font-size: 11px; letter-spacing: 2px; padding: 6px 12px; cursor: pointer; }
.mls .mls-key-redo:hover:not(:disabled) { background: var(--ink); border-color: var(--yellow); }
.mls .mls-key-redo:disabled { cursor: default; color: var(--yellow); }
.mls .mls-key-redo .spin { width: 11px; height: 11px; border: 2px solid var(--yellow); border-right-color: transparent; border-radius: 50%; animation: mls-spin .8s linear infinite; display: inline-block; }

.mls.narrow .mls-key-tools { left: auto; right: 6px; top: 40px; transform: none; gap: 4px; }
.mls.narrow .mls-key-tools button { white-space: nowrap; font-size: 10px; letter-spacing: 1px; padding: 4px 8px; }
.mls-scene.hide-text .box, .mls-scene.hide-text .when, .mls-scene.hide-text .bonds, .mls-scene.hide-text .mls-bonds-toggle, .mls-scene.hide-text .mls-here { opacity: 0; pointer-events: none; }

.mls-here { position: absolute; left: 16px; top: 150px; z-index: 4; display: grid; gap: 6px; justify-items: start; max-height: calc(100% - 330px); overflow: hidden; }
.mls-here .who { display: flex; align-items: center; gap: 8px; background: rgba(11,11,13,.74); padding: 4px 12px 4px 4px; }
.mls-here .mls-news-face { width: 30px; height: 30px; }
.mls-here .n { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--paper); text-transform: uppercase; display: grid; line-height: 1.2; }
.mls-here .n small { font-size: 10px; letter-spacing: 1.5px; color: #ff5a5d; }
.mls-here .care .mls-news-face { box-shadow: 0 0 0 3px var(--red); }
.mls-here .came .mls-news-face { animation: mls-here-in .5s ease-out; }
.mls-here .n b { font-weight: 900; }

.mls.narrow .mls-here { top: 128px; left: 10px; gap: 5px; }
.mls.narrow .mls-here .who { padding: 3px; }
.mls.narrow .mls-here .who.care { padding-right: 8px; }
.mls.narrow .mls-here .n b, .mls.narrow .mls-here .who:not(.care) .n { display: none; }
.mls.narrow .mls-here .n small { font-size: 9px; }
.mls-scene.keyed .mls-here { display: none; }
@keyframes mls-here-in { from { transform: scale(.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.mls-here .who.more { padding: 4px 10px; }
.mls.narrow .mls-here .who.more .n, .mls.narrow .mls-here .who.more .n b { display: grid; }
.mls-scene.hide-text { cursor: pointer; }
.mls-album-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.mls-album-grid.big { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.mls .mls-album-tile { display: grid; gap: 3px; text-align: left; background: #000; color: var(--paper); border: 0; border-bottom: 4px solid var(--yellow); padding: 0 0 8px; cursor: pointer; font: inherit; position: relative; }
.mls .mls-album-tile.failed { border-bottom-color: var(--red); }
.mls-album-tile .pic { width: 100%; aspect-ratio: 3 / 2; background: #1b1b20 center / cover no-repeat; }
.mls-album-tile .pic.wait { display: flex; gap: 8px; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-album-tile .spin { width: 14px; height: 14px; border-width: 3px; }
.mls-album-tile b { padding: 4px 8px 0; font-size: 13px; }
.mls-album-tile small { padding: 0 8px; color: var(--muted); font-weight: 700; font-size: 11px; }
.mls-album-tile .who { position: absolute; top: 6px; left: 6px; font-size: 10px; font-weight: 900; letter-spacing: 1px; background: var(--red); color: #fff; padding: 2px 7px; }
.mls-figure .row { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 8px; font-size: 13px; }
.mls-figure .row .k { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); padding-top: 2px; }
.mls-figure .field { display: grid; gap: 4px; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-figure .field select, .mls-figure .field textarea { background: var(--ink); color: var(--paper); border: 2px solid var(--line); padding: 8px 10px; font: inherit; font-size: 13px; letter-spacing: 0; }
.mls-figure .field textarea { min-height: 70px; resize: vertical; }
.mls-figure .acts { display: flex; gap: 8px; }
.mls-figure > .mls-btn { justify-self: start; }
.mls-light { position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,.9); display: grid; place-items: center; padding: 20px; }
.mls-light .in { width: min(1100px, 100%); display: grid; gap: 10px; }
.mls-light img { width: 100%; max-height: calc(100vh - 140px); object-fit: contain; background: #000; }
.mls-light .wait { aspect-ratio: 16 / 10; display: grid; place-items: center; gap: 8px; align-content: center; color: var(--paper); font-family: var(--display); font-size: 28px; letter-spacing: 2px; background: #111; }
.mls-light .wait small { font-family: var(--body); font-size: 12px; color: var(--muted); letter-spacing: 0; }
.mls-light .cap { display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap; color: var(--paper); }
.mls-light .cap small { color: var(--muted); font-weight: 700; }
.mls-light .acts { margin-left: auto; display: flex; gap: 6px; align-items: center; }
.mls-light .acts .v { font-size: 11px; font-weight: 900; letter-spacing: 1px; }
.mls .mls-light .acts button { background: #141417; color: var(--paper); border: 2px solid var(--line); font-weight: 900; font-size: 11px; letter-spacing: 2px; padding: 5px 10px; cursor: pointer; }
.mls .mls-light .acts button:disabled { opacity: .35; cursor: default; }
.mls-tg.off { opacity: .55; }
.mls:not(.narrow) .mls-gallery { height: 100%; overflow: auto; }
.mls-held { display: flex; gap: 12px; align-items: center; font-family: var(--display); font-size: 24px; letter-spacing: 2px; color: var(--yellow); padding: 6px 0; }
.mls-held .spin { width: 20px; height: 20px; border: 4px solid var(--yellow); border-right-color: transparent; border-radius: 50%; animation: mls-spin .8s linear infinite; }
.mls-kept { display: flex; gap: 10px; align-items: center; background: #000; border-left: 4px solid var(--yellow); padding: 8px 10px; }
.mls-kept .pic { width: 84px; aspect-ratio: 3 / 2; background: #1b1b20 center / cover no-repeat; flex: none; }
.mls-kept b { display: block; font-size: 12px; letter-spacing: 2px; }
.mls-kept small { color: var(--muted); font-weight: 700; font-size: 11px; }


.mls .mls-event.mls-milestone { border-left: 5px solid #ff5c8a; }
.mls .mls-special { display: block; width: 100%; text-align: left; background: linear-gradient(90deg, #3a1020, #141417); color: var(--paper); border: 0; border-left: 5px solid #ff5c8a;
  padding: 10px 14px; cursor: pointer; margin-top: 10px; font-family: var(--display); font-size: 20px; letter-spacing: 2px; }
.mls-special-menu { display: grid; gap: 6px; margin-top: 8px; }
.mls-special-menu .head { display: flex; gap: 10px; align-items: center; }
.mls-special-menu .head b { font-family: var(--display); font-size: 20px; letter-spacing: 2px; color: #ff5c8a; }
.mls .mls-special-menu .mls-opt.bad { border-left: 4px solid var(--red); }
.mls-special-confirm { background: #000; border-left: 4px solid var(--red); padding: 10px 12px; display: grid; gap: 8px; }
.mls-special-confirm .row { display: flex; gap: 8px; }
.mls .mls-special-confirm button { background: #141417; color: var(--paper); border: 2px solid var(--line); font-weight: 900; letter-spacing: 2px; padding: 6px 12px; cursor: pointer; }
.mls .mls-special-confirm button.main { background: var(--red); border-color: var(--red); }
.mls .mls-choice.off { opacity: .45; }
.mls-stamp.bad .big { color: var(--paper); text-shadow: 5px 5px 0 var(--red); }


.mls-ip { display: grid; gap: 12px; align-content: start; }
.mls-ip-top { grid-template-columns: 1fr auto; align-items: baseline; }
.mls-ip-count { font-size: 12px; font-weight: 900; letter-spacing: 1px; color: var(--muted); display: flex; gap: 10px; align-items: baseline; }
.mls .mls-ip-count button { background: none; color: var(--paper); border: 2px solid var(--line); padding: 3px 10px; font-weight: 900; font-size: 10px; letter-spacing: 2px; cursor: pointer; }
.mls-ip-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: start; }
.mls-ip-list { display: grid; gap: 12px; min-width: 0; }
.mls-ip-g, .mls-ip-pv { grid-template-columns: minmax(0, 1fr); min-width: 0; }
.mls-ip-g { border-left-color: var(--line) !important; }
.mls-ip-g.focus { border-left-color: var(--yellow) !important; }
.mls-ip-g .sub { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: var(--yellow); margin-top: 4px; }
.mls-ip-f { display: grid; gap: 5px; border-left: 3px solid transparent; padding-left: 10px; margin-left: -13px; }
.mls-ip-f.changed { border-left-color: var(--paper); }
.mls-ip-f.unsaved { border-left-color: var(--yellow); }
.mls-ip-f.unused { opacity: .45; }
.mls-ip-f.unused:focus-within { opacity: 1; }
.mls-ip-f .h { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.mls-ip-f .h b { font-size: 14px; }
.mls-ip-f .h i.mode { font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 2px; background: var(--line); padding: 1px 6px; }
.mls-ip-f .h .off { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: var(--muted); }
.mls-ip-f .h .chg { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--ink); background: var(--paper); padding: 1px 6px; }
.mls-ip-f .h .dirty { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--ink); background: var(--yellow); padding: 1px 6px; }
.mls-ip-f .h .acts { margin-left: auto; display: flex; gap: 4px; }
.mls .mls-ip-f .h .acts button { background: #000; color: var(--paper); border: 2px solid var(--line); padding: 2px 9px; font-weight: 900; font-size: 10px; letter-spacing: 2px; cursor: pointer; }
.mls .mls-ip-f textarea { width: 100%; resize: vertical; background: #000; color: var(--paper); border: 2px solid var(--line); padding: 8px 10px; font: 13px/1.45 ui-monospace, Consolas, monospace; }
.mls .mls-ip-f textarea:focus { outline: none; border-color: var(--yellow); }
.mls-ip-f .holes { display: flex; gap: 12px; flex-wrap: wrap; font-size: 11px; color: var(--muted); font-weight: 700; }
.mls-ip-f .holes code { color: var(--yellow); font-weight: 900; }
.mls-ip-f .warn { font-size: 12px; font-weight: 900; color: var(--paper); border-left: 4px solid var(--red); padding: 2px 8px; }
.mls-ip-f pre.def { margin: 0; background: #1b1b20; border: 2px dashed var(--line); padding: 8px 10px; font: 12px/1.45 ui-monospace, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; color: #cfccc5; }
.mls-ip-f pre.def em { display: block; font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-bottom: 3px; font-family: var(--body); }
.mls-ip-barwrap { position: sticky; bottom: 0; }
.mls-ip-bar { display: flex; gap: 10px; align-items: center; background: #000; border: 2px solid var(--yellow); padding: 8px 12px; }
.mls-ip-bar b { flex: 1; font-size: 13px; }

.mls-ip-pv { position: sticky; top: 0; max-height: calc(var(--tab-h, 100vh) - 140px); overflow: auto; border-left-color: var(--yellow) !important; }
.mls-ip-pvh { display: flex; gap: 12px; align-items: baseline; justify-content: space-between; flex-wrap: wrap; }
.mls-ip-pvh h3 { margin: 0; }
.mls-ip-tabs { display: flex; gap: 4px; }
.mls .mls-ip-tabs button { background: #000; color: var(--paper); border: 2px solid var(--line); padding: 4px 10px; font-weight: 900; font-size: 10px; letter-spacing: 2px; cursor: pointer; }
.mls .mls-ip-tabs button.on { background: var(--yellow); color: var(--ink); border-color: var(--yellow); }
.mls-ip-pv .pick { display: flex; gap: 10px; align-items: center; }
.mls .mls-ip-pv select { flex: 1; min-width: 0; background: #000; color: var(--paper); border: 2px solid var(--line); padding: 6px 8px; font: inherit; font-weight: 700; }
.mls-ip-pv .thumb { width: 96px; height: 64px; object-fit: cover; border: 2px solid var(--line); }
.mls-ip-pv .note { font-size: 12px; font-weight: 700; color: var(--muted); }
.mls-ip-pv .blk { display: grid; gap: 3px; }
.mls-ip-pv .blk em { font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--yellow); }
.mls-ip-pv .blk.neg em, .mls-ip-pv .blk.wrote em { color: var(--muted); }
.mls-ip-pv pre { margin: 0; background: #000; border: 2px solid var(--line); padding: 8px 10px; font: 12px/1.5 ui-monospace, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; color: #e6e3dc; }
.mls-ip-pv .blk.wrote pre { color: var(--muted); }
.mls-ip-pv .style { display: grid; gap: 4px; font-size: 12px; }
.mls-ip-pv .style .who small { color: var(--muted); font-weight: 700; }
.mls-ip-pv .style .bits { display: grid; gap: 2px; border-left: 3px solid var(--line); padding-left: 8px; color: var(--muted); }
.mls-ip-pv .style .bits small { font-size: 10px; font-weight: 900; letter-spacing: 1px; }
.mls-ip-pv .style .bits span { overflow-wrap: anywhere; }
.mls-ip-pv .style .bits i { font-style: normal; font-weight: 900; color: var(--paper); margin-right: 6px; font-size: 11px; }
.mls-ip-pv .try { display: grid; gap: 8px; }
.mls-ip-pv .tried { display: flex; gap: 8px; }
.mls-ip-pv .slot { display: grid; gap: 3px; width: 160px; }
.mls-ip-pv .slot img, .mls-ip-pv .slot span { width: 160px; height: 108px; object-fit: cover; border: 2px solid var(--line); display: grid; place-items: center; font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-ip-pv .slot.new span { border-color: var(--yellow); border-style: dashed; }
.mls-ip-pv .slot small { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-ip-pv .aside { font-size: 11px; color: var(--muted); font-weight: 700; }

.mls.narrow .mls-ip-cols { grid-template-columns: minmax(0, 1fr); }
.mls.narrow .mls-ip-pv { position: static; max-height: none; order: -1; }
.mls.narrow .mls-ip-top { grid-template-columns: 1fr; }
.mls-ip-pv .slot span.bad { color: var(--red); border-color: var(--red); }


.mls-news-face { width: 34px; height: 34px; border-radius: 50%; overflow: hidden; display: inline-grid; place-items: center; background: var(--line); position: relative; flex: none; font-style: normal; }
.mls-news-face img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.mls-news-face i { font-style: normal; font-weight: 900; font-size: 13px; }
.mls-news-face img + i { display: none; }
.mls-news-face.q { background: #000; border: 2px dashed var(--line); color: var(--muted); font-size: 14px; }
.mls-news-face.you { background: var(--red); font-size: 9px; letter-spacing: 1px; font-weight: 900; }

.mls-net-pair { display: grid; grid-template-columns: auto minmax(0, 1fr) 90px; gap: 10px; align-items: center; }
.mls-net-pair .t { display: grid; gap: 1px; min-width: 0; }
.mls-net-pair .t .n { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.mls-net-pair .t b { font-size: 14px; }
.mls-net-pair .t small { font-size: 11px; color: var(--muted); font-weight: 700; }
.mls-net-pair .k { font-size: 10px; font-weight: 900; letter-spacing: 2px; background: var(--line); padding: 1px 6px; margin-left: 4px; }
.mls-net-pair .k-family { background: #00838f; } .mls-net-pair .k-rivals { background: var(--red); } .mls-net-pair .k-couple { background: #c2185b; } .mls-net-pair .k-close, .mls-net-pair .k-friends { background: #2e7d32; }
.mls-net-pair .bar { height: 6px; background: #000; border: 1px solid var(--line); }
.mls-net-pair .bar i { display: block; height: 100%; background: var(--yellow); }
.mls-net-more { font-size: 12px; font-weight: 900; color: var(--muted); letter-spacing: 1px; }

.mls-net-fact { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 10px; align-items: start; }
.mls-net-fact .how { font-size: 10px; font-weight: 900; letter-spacing: 2px; padding: 2px 6px; text-align: center; background: var(--paper); color: var(--ink); }
.mls-net-fact.heard .how { background: var(--line); color: var(--paper); }
.mls-net-fact .t { display: grid; gap: 1px; }
.mls-net-fact .t b { font-size: 14px; }
.mls-net-fact .t small { font-size: 11px; color: var(--muted); font-weight: 700; }

.mls-rels { grid-column: 1 / -1; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.mls-rels .lbl { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-right: 4px; }
.mls-rels .none { font-size: 12px; color: var(--muted); font-weight: 700; }
.mls-rel { font-size: 12px; background: #000; border: 2px solid var(--line); padding: 3px 9px; cursor: pointer; }
.mls-rel.changed { border-color: var(--yellow); }
.mls-rel em { font-style: normal; font-size: 9px; font-weight: 900; letter-spacing: 1px; background: var(--yellow); color: var(--ink); padding: 0 4px; margin-left: 4px; }
.mls button.mls-rel-add { background: none; color: var(--paper); border: 2px dashed var(--line); padding: 3px 9px; font-size: 11px; font-weight: 900; letter-spacing: 1px; cursor: pointer; }
.mls-rel-edit { flex: 1 1 100%; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; background: #000; border-left: 4px solid var(--yellow); padding: 8px; }
.mls .mls-rel-edit select { background: #141417; color: var(--paper); border: 2px solid var(--line); padding: 4px 6px; font: inherit; font-size: 12px; }
.mls-rel-edit small { flex: 1 1 100%; font-size: 11px; color: var(--muted); font-weight: 700; }

.mls-seen { display: block; margin-top: 6px; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--ink); background: var(--yellow); padding: 2px 8px; justify-self: start; width: max-content; }

.mls-news .box { gap: 10px; }
.mls-news-row { display: grid; grid-template-columns: 76px minmax(0, 1fr) auto; gap: 12px; align-items: center; }
.mls-news-row .faces { display: flex; }
.mls-news-row .faces .mls-news-face + .mls-news-face { margin-left: -8px; box-shadow: 0 0 0 2px var(--panel, #141417); }
.mls-news-row .t { display: grid; gap: 2px; }
.mls-news-row .t b { font-size: 14px; }
.mls-news-row .t span { font-size: 13px; color: #cfccc5; }
.mls-news-row .tag { font-size: 10px; font-weight: 900; letter-spacing: 2px; padding: 2px 7px; background: var(--line); }
.mls-news-row .t-closer { background: #2e7d32; } .mls-news-row .t-cooler { background: var(--red); } .mls-news-row .t-met { background: #00838f; }
.mls-news-row .t-saw { background: var(--paper); color: var(--ink); }
.mls-news.pop h1 { font-size: 52px; }
.mls-news-ok { justify-self: end; }
.mls-news-weeks { display: flex; gap: 6px; align-items: center; }
.mls .mls-news-weeks select { background: var(--panel, #141417); color: var(--paper); border: 2px solid var(--line); padding: 7px 10px; font: inherit; font-weight: 900; letter-spacing: 2px; font-size: 12px; min-width: 220px; }
.mls .mls-news-weeks button { background: var(--panel, #141417); color: var(--paper); border: 0; padding: 8px 14px; font-weight: 900; cursor: pointer; }
.mls .mls-news-weeks button:disabled { opacity: .35; cursor: default; }
.mls button.mls-rel { color: var(--paper); font: inherit; font-size: 12px; }
.mls-news-weeks span { font-weight: 900; letter-spacing: 2px; font-size: 12px; color: var(--muted); }

.mls .mls-front-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
.mls .mls-front-card { background: #0f0f12; border-left: 4px solid var(--line); padding: 10px 12px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; }
.mls .mls-front-card .faces { display: flex; }
.mls .mls-front-card .faces .mls-news-face + .mls-news-face, .mls .mls-front-met .faces .mls-news-face + .mls-news-face { margin-left: -8px; box-shadow: 0 0 0 2px #0f0f12; }
.mls .mls-front-card .t { display: grid; gap: 2px; }
.mls .mls-front-card .t b { font-size: 14px; }
.mls .mls-front-card .t span { font-size: 13px; color: #cfccc5; }
.mls .mls-front-card .tag { font-size: 10px; font-weight: 900; letter-spacing: 2px; padding: 2px 7px; background: var(--line); align-self: start; }
.mls .mls-front-card .t-closer, .mls .mls-front-card .t-get-along { background: #2e7d32; } .mls .mls-front-card .t-cooler, .mls .mls-front-card .t-argued, .mls .mls-front-card .t-rivals, .mls .mls-front-card .t-tension, .mls .mls-front-card .t-split { background: var(--red); }
.mls .mls-front-card .t-together, .mls .mls-front-card .t-in-love { background: #ff5c8a; color: var(--ink); } .mls .mls-front-card .t-saw, .mls .mls-front-card .t-heard, .mls .mls-front-card .t-defended-you { background: var(--paper); color: var(--ink); }
.mls .mls-front-card.you { grid-template-columns: minmax(0, 1fr); gap: 6px; border-left-color: var(--yellow); }
.mls .mls-front-card.you .head b { font-size: 15px; }
.mls .mls-front-card.you .head small { display: block; font-size: 12px; font-weight: 700; color: var(--muted); }
.mls .mls-front-card .who { display: flex; align-items: center; gap: 8px; min-width: 0; }
.mls .mls-front-card .who .lbl, .mls .mls-front-met .lbl { flex: none; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); min-width: 56px; }
.mls .mls-front-card .who .names, .mls .mls-front-met .names { font-size: 12px; color: #cfccc5; min-width: 0; overflow-wrap: anywhere; }
.mls .mls-front-card .who .names i { font-style: normal; color: var(--muted); }
.mls .mls-front-card .cares { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #ff5c8a; }
.mls .mls-news-face.more { background: #2a2a30; font-size: 11px; font-weight: 900; color: var(--paper); font-style: normal; }
.mls .mls-front-met .line { display: flex; align-items: center; gap: 10px; width: 100%; background: none; border: 0; color: var(--paper); cursor: pointer; padding: 0; text-align: left; font: inherit; }
.mls .mls-front-met .line .faces { display: flex; }
.mls .mls-front-met .line b { font-size: 14px; flex: 1; }
.mls .mls-front-met .line i { font-style: normal; font-weight: 900; color: var(--yellow); }
.mls .mls-front-met .places { display: grid; gap: 8px; margin-top: 10px; }
.mls .mls-front-met .place { display: grid; grid-template-columns: 190px auto minmax(0, 1fr); align-items: center; gap: 8px; }
.mls.narrow .mls-front-met .place { display: flex; flex-wrap: wrap; }
.mls .mls-front-met .place .faces { display: flex; }

.mls .mls-news .mls-front { display: grid; gap: 16px; align-content: start; }
.mls .mls-news-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
.mls.narrow .mls-front-grid { grid-template-columns: minmax(0, 1fr); }
.mls.narrow .mls-front-met .line { flex-wrap: wrap; }


.mls-pager { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
.mls .mls-pager button { min-width: 30px; background: #000; color: var(--paper); border: 2px solid var(--line); padding: 3px 8px; font-weight: 900; font-size: 11px; cursor: pointer; }
.mls .mls-pager button.on { background: var(--yellow); color: var(--ink); border-color: var(--yellow); }
.mls-pager span { color: var(--muted); font-weight: 900; padding: 0 2px; }


.mls .mls-scene .sprite.second { left: 24%; transform: translateX(-50%) rotate(2deg) scale(.86); transform-origin: bottom center; filter: brightness(.72); z-index: 0; }
.mls .mls-choice small { display: block; font-size: 11px; font-weight: 700; opacity: .7; }


.mls-pick-row { display: flex; gap: 6px; flex-wrap: wrap; margin: 6px 0; }
.mls .mls-pick-row button { background: #000; color: var(--paper); border: 2px solid var(--line); padding: 5px 10px; font-weight: 900; font-size: 12px; cursor: pointer; }
.mls .mls-pick-row button:hover { border-color: var(--yellow); }
.mls-pick-row .none { font-size: 12px; color: var(--muted); font-weight: 700; }
.mls-open .mls-agreed { display: grid; grid-template-columns: 130px auto minmax(0, 1fr); gap: 10px; align-items: baseline; }
.mls-open .lbl { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-open .who { font-weight: 900; font-size: 14px; }
.mls-open small { font-size: 11px; color: var(--muted); font-weight: 700; }


.mls-taken { font-size: 10px; font-weight: 900; letter-spacing: 2px; background: #c2185b; color: var(--paper); padding: 2px 8px; align-self: center; }


.mls-did { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
.mls-did span { font-size: 10px; font-weight: 900; letter-spacing: 1.5px; padding: 2px 8px; background: #2e7d32; color: #fff; }
.mls-did span.step { background: #c9a227; color: #1b1b1b; }
.mls-did span.bad { background: #b3261e; }
.mls-did span.seen { background: #37474f; }
.mls-detected { display: flex; align-items: center; gap: 10px; justify-content: space-between; border: 2px dashed #c9a227; padding: 8px 10px; margin-bottom: 8px; }
.mls-detected b { display: block; font-size: 11px; letter-spacing: 2px; }
.mls-detected small { display: block; font-size: 11px; opacity: .75; }

.mls-detected button { flex: none; font-size: 11px; font-weight: 900; letter-spacing: 1px; padding: 6px 10px;
  background: var(--ink); color: #c9a227; border: 2px solid #c9a227; cursor: pointer; }
.mls-detected button:hover { background: #c9a227; color: var(--ink); }
@media (max-width: 560px) { .mls-detected { flex-direction: column; align-items: stretch; } }


.mls-dream p { margin: 4px 0 0; font-style: italic; line-height: 1.4; }
.mls-dream .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.mls-dream .tags span { font-size: 10px; font-weight: 900; letter-spacing: 1.5px; padding: 2px 8px; background: #c2185b; color: #fff; }


.mls .mls-bell { grid-template-columns: 150px minmax(0, 1fr); column-gap: 20px; cursor: default; }
.mls .mls-bell .kicker, .mls .mls-bell .opts { grid-column: 1 / -1; }
.mls .mls-bell .face { width: 150px; height: 190px; border: 3px solid var(--paper); background: #1b1b1f; box-shadow: 6px 6px 0 var(--c, var(--red)); transform: rotate(1.5deg); overflow: hidden; }
.mls .mls-bell .face img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls .mls-bell .who { display: grid; align-content: center; gap: 6px; }
.mls .mls-bell .knock { font-size: 12px; font-weight: 900; letter-spacing: 3px; color: var(--muted); }
.mls .mls-bell .wants { font-size: 13px; font-weight: 900; letter-spacing: 2px; color: var(--yellow); }
.mls .mls-bell .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }
.mls .mls-bell .opts button { font-family: var(--display); font-size: 22px; letter-spacing: 1px; padding: 12px 14px; border: 3px solid var(--paper); cursor: pointer; text-align: left; }
.mls .mls-bell .opts .in { background: var(--yellow); color: var(--ink); }
.mls .mls-bell .opts .out { background: #1b1b1f; color: var(--paper); }
.mls .mls-bell .opts small { display: block; font-family: var(--body); font-size: 11px; font-weight: 700; letter-spacing: 0; opacity: .75; }
@media (max-width: 560px) { .mls .mls-bell { grid-template-columns: 1fr; } .mls .mls-bell .face { width: 110px; height: 140px; } .mls .mls-bell .opts { grid-template-columns: 1fr; } }


.mls .mls-work-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 4px; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls .mls-work-row select, .mls .mls-work-row input { max-width: 100%; background: #000; color: var(--paper); border: 2px solid var(--line); font-size: 12px; font-weight: 700; padding: 3px 6px; letter-spacing: 0; }
.mls .mls-work-row small { font-size: 11px; font-weight: 700; letter-spacing: 0; font-style: italic; }

.mls .mls-member .mls-work-row { grid-column: 1 / -1; }
.mls .mls-member .mls-work-row select { flex: 0 1 360px; min-width: 0; }
.mls .mls-member .mls-work-row small { flex-basis: 100%; line-height: 1.4; color: #d8d4cb; }
.mls .mls-jobs .mls-job-row { display: grid; grid-template-columns: 130px 130px 110px minmax(0, 1fr) 90px; gap: 10px; align-items: baseline; padding: 5px 0; border-bottom: 1px solid #2b2b30; font-size: 13px; }
.mls .mls-jobs .mls-job-row small { color: var(--muted); font-weight: 700; }
.mls .mls-jobs .mls-job-row .who { font-weight: 900; text-align: right; }
.mls .mls-jobs .mls-job-row .who.free { color: #5fd38a; font-weight: 700; }
.mls .mls-workbox .mls-work-grid { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 18px; }
.mls .mls-workbox .sprite { position: relative; width: 140px; height: 190px; border: 3px solid var(--paper); overflow: hidden; box-shadow: 5px 5px 0 var(--c, var(--red)); }
.mls .mls-workbox .sprite.waiting img { filter: grayscale(.7) brightness(.7); }
.mls .mls-workbox .sprite img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls .mls-workbox .sprite .tag { position: absolute; left: 6px; bottom: 6px; font-size: 9px; font-weight: 900; letter-spacing: 2px; background: var(--yellow); color: var(--ink); padding: 2px 6px; }
.mls .mls-job-title { font-family: var(--display); font-size: 26px; letter-spacing: 1px; }
.mls .mls-shift { font-weight: 900; color: var(--yellow); margin: 2px 0 8px; }
.mls .mls-outfit { font-size: 14px; line-height: 1.45; font-style: italic; }
.mls .mls-outfit small { display: block; font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls .mls-work-edit { width: 100%; min-height: 70px; background: #000; color: var(--paper); border: 2px solid var(--line); font: inherit; padding: 6px; }
.mls .mls-work-btns { display: flex; gap: 8px; margin: 10px 0 6px; }
.mls .mls-work-note { display: block; color: var(--muted); font-size: 11px; }
.mls .mls-work-note.bad { color: #ff8a80; }
@media (max-width: 560px) { .mls .mls-jobs .mls-job-row { grid-template-columns: 1fr 1fr; } .mls .mls-workbox .mls-work-grid { grid-template-columns: 1fr; } }


.mls .mls-rack-sec { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--yellow); margin: 14px 0 6px; }
.mls .mls-rack-sec:first-of-type { margin-top: 4px; }



.mls-shop { overflow: hidden; grid-template-rows: auto minmax(0, 1fr); }
.mls-shop .cat { overflow-y: auto; overflow-x: hidden; min-height: 0; height: 100%; padding: 4px 10px 18px 4px; }
.mls-shop .cart { max-height: 100%; overflow-y: auto; }
.mls-shop.mls-rack .mls-fit { max-height: 100%; overflow-y: auto; }
.mls.narrow .mls-shop { overflow: auto; grid-template-rows: none; }
.mls.narrow .mls-shop .cat { overflow: visible; height: auto; padding: 0; }
.mls.narrow .mls-shop .cart { max-height: none; overflow: visible; }
.mls.narrow .mls-shop.mls-rack .mls-fit { max-height: none; }
.mls.narrow .mls-shop .behind { position: fixed; }


.mls.narrow .mls-shop.mls-rack { padding-bottom: 110px; }
.mls.narrow .mls-shop.mls-rack .mls-fit { position: fixed; left: 0; right: 0; bottom: 0; top: auto; z-index: 40; transform: none; margin: 0;
  grid-template-columns: 44px minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 6px 8px; padding: 8px 10px; box-shadow: 0 -4px 0 var(--red); }
.mls.narrow .mls-shop.mls-rack .mls-fit > .big { grid-row: span 2; width: 44px; box-shadow: none; }
.mls.narrow .mls-shop.mls-rack .mls-fit .ic { font-size: 28px; }
.mls.narrow .mls-shop.mls-rack .mls-fit .nm, .mls.narrow .mls-shop.mls-rack .mls-fit .owned { grid-column: 2 / -1; font-size: 15px; }
.mls.narrow .mls-shop.mls-rack .mls-fit .desc, .mls.narrow .mls-shop.mls-rack .mls-fit .see, .mls.narrow .mls-shop.mls-rack .mls-fit .chips { display: none; }

.mls.narrow .mls-shop.mls-rack .mls-fit button.buy { padding: 8px; font-size: 12px; letter-spacing: 1px; text-align: center; }
.mls.narrow .mls-shop.mls-rack .mls-fit button.retry { grid-column: 2 / -1; padding: 5px 8px; }
.mls.narrow .mls-shop.mls-rack .mls-fit button small { display: none; }



.mls .mls-portal { padding-bottom: 30px; }
.mls .mls-portal-bar { display: flex; align-items: center; gap: 16px; padding: 14px 22px; background: var(--paper); color: var(--ink); border-bottom: 4px solid var(--ink); box-shadow: 0 6px 0 var(--red); }
.mls .mls-portal-bar .mls-back { background: var(--ink); color: var(--paper); }
.mls .mls-portal-bar .brand { font-family: var(--display); font-size: 30px; letter-spacing: 1px; line-height: 1; white-space: nowrap; }
.mls .mls-portal-bar .brand b { font-weight: 400; background: var(--red); color: var(--paper); padding: 0 8px; margin-left: 6px; display: inline-block; transform: rotate(-3deg); }
.mls .mls-portal-bar .search { flex: 1; min-width: 0; max-width: 440px; margin-left: auto; border: 3px solid var(--ink); background: #fff; padding: 7px 12px; font-size: 13px; font-weight: 700; color: #8d8a85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mls .mls-portal-tabs { display: flex; gap: 4px; padding: 18px 22px 0; }
.mls .mls-portal-tabs button { background: none; border: 0; border-bottom: 4px solid transparent; color: var(--muted); font-weight: 900; font-size: 12px; letter-spacing: 3px; padding: 6px 12px; cursor: pointer; }
.mls .mls-portal-tabs button.on { color: var(--paper); border-color: var(--yellow); }
.mls .mls-portal-tabs em { font-style: normal; background: var(--red); color: var(--paper); padding: 0 6px; margin-left: 4px; letter-spacing: 0; }
.mls .mls-portal-board { display: grid; grid-template-columns: minmax(0, 380px) minmax(0, 1fr); gap: 18px; padding: 14px 22px 0; align-items: start; }
.mls .mls-portal-list .count { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: var(--muted); margin-bottom: 8px; }
.mls .mls-portal-post { width: 100%; display: grid; grid-template-columns: 58px minmax(0, 1fr) auto; gap: 12px; align-items: start; text-align: left; background: #141417; color: var(--paper); border: 3px solid #2b2b30; padding: 12px; cursor: pointer; }
.mls .mls-portal-post.on { border-color: var(--yellow); box-shadow: 6px 6px 0 var(--yellow); transform: rotate(-.6deg); }
.mls .mls-portal-logo { width: 58px; height: 58px; border: 3px solid var(--paper); background: #5d6470 center / cover; display: grid; place-items: center; font-size: 26px; }
.mls .mls-portal-post .t b { display: block; font-family: var(--display); font-weight: 400; font-size: 24px; letter-spacing: 1px; line-height: 1.05; }
.mls .mls-portal-post .t > span { display: block; font-size: 12px; font-weight: 700; color: var(--muted); }
.mls .mls-portal-post .t > .tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 7px; }
.mls .mls-portal-post .tags em { font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 1px; background: #2b2b30; color: var(--paper); padding: 2px 7px; white-space: nowrap; }
.mls .mls-portal-post .tags em.pay { background: #1b7a3a; }
.mls .mls-portal-post .tags em.grow { background: none; border: 1px solid var(--yellow); color: var(--yellow); }
.mls .mls-portal-post .state i { font-style: normal; font-size: 9px; font-weight: 900; letter-spacing: 2px; padding: 2px 6px; white-space: nowrap; }
.mls .mls-portal-post .state .new { background: var(--yellow); color: var(--ink); }
.mls .mls-portal-post .state .yours { background: #5fd38a; color: var(--ink); }
.mls .mls-portal-post .state .wait { background: var(--red); color: var(--paper); }
.mls .mls-portal-detail { background: #141417; border: 3px solid var(--paper); box-shadow: 10px 10px 0 var(--red); overflow: hidden; }
.mls .mls-portal-detail .hero { height: 130px; background: linear-gradient(135deg, #5d6470, #1f2329) center / cover; position: relative; border-bottom: 3px solid var(--paper); }
.mls .mls-portal-detail .hero .where { position: absolute; left: 14px; bottom: 10px; background: var(--ink); font-size: 10px; font-weight: 900; letter-spacing: 3px; padding: 3px 8px; }
.mls .mls-portal-detail .head { display: flex; justify-content: space-between; gap: 14px; padding: 14px 18px 0; }
.mls .mls-portal-detail h2 { margin: 0; font-family: var(--display); font-weight: 400; font-size: 44px; line-height: .95; letter-spacing: 1px; text-shadow: 4px 4px 0 var(--red); }
.mls .mls-portal-detail .sub { font-weight: 900; font-size: 13px; color: var(--yellow); margin-top: 4px; }
.mls .mls-portal-detail .paybox { background: #1b7a3a; border: 3px solid var(--paper); padding: 6px 12px; text-align: center; transform: rotate(3deg); align-self: start; }
.mls .mls-portal-detail .paybox b { display: block; font-family: var(--display); font-weight: 400; font-size: 34px; line-height: 1; }
.mls .mls-portal-detail .paybox small { font-size: 9px; font-weight: 900; letter-spacing: 2px; }
.mls .mls-portal-poster { display: flex; align-items: center; gap: 10px; margin: 12px 18px 0; }
.mls .mls-portal-poster .f { width: 40px; height: 40px; border: 2px solid var(--paper); overflow: hidden; background: #1b1b1f; display: grid; place-items: center; font-weight: 900; color: var(--muted); }
.mls .mls-portal-poster .f img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls .mls-portal-poster b { display: block; font-size: 14px; }
.mls .mls-portal-poster small { color: var(--muted); font-size: 11px; font-weight: 700; }
.mls .mls-portal-detail .sec { padding: 12px 18px 0; }
.mls .mls-portal-detail h4, .mls .mls-portal-mine h4 { margin: 0 0 6px; font-size: 10px; font-weight: 900; letter-spacing: 3px; color: var(--muted); }
.mls .mls-portal-detail p { margin: 0; font-size: 14px; line-height: 1.5; }
.mls .mls-portal-detail p.note { font-size: 12px; color: var(--muted); margin-top: 6px; }
.mls .mls-portal-path { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 3px; }
.mls .mls-portal-step { background: #1b1b1f; padding: 6px 7px; border-top: 4px solid #3a3a40; min-width: 0; }
.mls .mls-portal-step:first-child { border-top-color: var(--yellow); }
.mls .mls-portal-step.now { background: var(--yellow); color: var(--ink); }
.mls .mls-portal-step b { display: block; font-size: 11px; font-weight: 900; line-height: 1.15; }
.mls .mls-portal-step em { display: block; font-style: normal; font-family: var(--display); font-size: 20px; color: #5fd38a; }
.mls .mls-portal-step.now em { color: var(--ink); }
.mls .mls-portal-step small { display: block; font-size: 9px; line-height: 1.3; color: var(--muted); }
.mls .mls-portal-step.now small { color: var(--ink); }
.mls .mls-portal-look { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.mls .mls-portal-look span { background: #1b1b1f; padding: 4px 10px; font-weight: 900; font-size: 12px; }
.mls .mls-portal-look b { color: var(--yellow); margin-left: 4px; }
.mls .mls-portal-look small { color: var(--muted); font-size: 11px; }
.mls .mls-portal-detail .apply { margin: 16px 18px 18px; background: var(--yellow); color: var(--ink); border: 3px solid var(--ink); box-shadow: 5px 5px 0 var(--paper); padding: 10px 14px; }
.mls .mls-portal-detail .apply.done { background: #5fd38a; }
.mls .mls-portal-detail .apply b { display: block; font-family: var(--display); font-weight: 400; font-size: 26px; letter-spacing: 1px; }
.mls .mls-portal-detail .apply small { font-size: 12px; font-weight: 700; }

.mls .mls-portal-mine { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding: 14px 22px 0; align-items: start; }
.mls .mls-portal-mine .card { background: #141417; border: 3px solid #2b2b30; padding: 14px 16px; display: grid; gap: 10px; }
.mls .mls-portal-mine .card.me { grid-column: 1 / -1; grid-template-columns: 70px minmax(0, 1fr) auto; align-items: center; border-color: var(--paper); box-shadow: 8px 8px 0 var(--red); }
.mls .mls-portal-mine .card.me .mls-portal-logo { width: 70px; height: 70px; }
.mls .mls-portal-mine .card.me small { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: var(--muted); }
.mls .mls-portal-mine .card.me h2 { margin: 0; font-family: var(--display); font-weight: 400; font-size: 40px; line-height: 1; text-shadow: 3px 3px 0 var(--red); }
.mls .mls-portal-mine .card.me span { font-weight: 900; font-size: 13px; color: var(--yellow); }
.mls .mls-portal-mine .card.me .mls-portal-poster { margin: 0; }
.mls .mls-portal-mine .card.me .mls-portal-poster span { color: inherit; }
.mls .mls-portal-mine .card.review { border-color: var(--yellow); }
.mls .mls-portal-mine .card.review > small { color: var(--muted); font-size: 12px; }
.mls .mls-portal-mine .card:has(.mls-portal-path) { grid-column: 1 / -1; }
.mls .mls-portal-perf { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 10px; align-items: center; }
.mls .mls-portal-perf .bar { position: relative; height: 12px; background: #2b2b30; }
.mls .mls-portal-perf .bar i { position: absolute; inset: 0 auto 0 0; background: var(--yellow); }
.mls .mls-portal-perf .bar i.mark { width: 3px; inset: -4px auto -4px auto; background: var(--paper); }
.mls .mls-portal-perf b { font-family: var(--display); font-weight: 400; font-size: 30px; }
.mls .mls-portal-perf small { grid-column: 1 / -1; color: #5fd38a; font-size: 11px; font-weight: 700; }
.mls .mls-portal-flags { display: flex; flex-wrap: wrap; gap: 8px; }
.mls .mls-portal-flags span { background: #1b1b1f; padding: 5px 10px; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls .mls-portal-flags b { color: var(--paper); margin-left: 4px; }
.mls .mls-portal-flags .warn b { color: var(--yellow); }
.mls .mls-portal-flags small { display: block; letter-spacing: 0; font-weight: 700; }
.mls .mls-portal-week { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
.mls .mls-portal-week span { background: #1b1b1f; text-align: center; padding: 4px 0; font-size: 11px; font-weight: 900; color: var(--muted); }
.mls .mls-portal-week b { display: block; font-size: 9px; letter-spacing: 2px; }
.mls .mls-portal-week .done { color: #5fd38a; }
.mls .mls-portal-week .late { color: var(--yellow); }
.mls .mls-portal-week .today { background: var(--yellow); color: var(--ink); }
.mls .mls-portal-need b { font-family: var(--display); font-weight: 400; font-size: 34px; margin-right: 10px; }
.mls .mls-portal-need span { font-weight: 900; color: #5fd38a; }
.mls .mls-portal-checks { display: grid; gap: 4px; font-weight: 900; font-size: 13px; }
.mls .mls-portal-checks .no { color: var(--red); }
.mls .mls-portal-checks .yes { color: #5fd38a; }
.mls .mls-portal-asks { display: flex; flex-wrap: wrap; gap: 8px; }
.mls .mls-portal-asks button { text-align: left; }
.mls .mls-portal-asks small { display: block; font-size: 10px; letter-spacing: 0; font-weight: 700; opacity: .7; }
.mls .mls-portal-days { display: flex; flex-wrap: wrap; gap: 6px; }
.mls .mls-portal-days button { background: #1b1b1f; color: var(--paper); border: 2px solid #3a3a40; font-weight: 900; font-size: 11px; letter-spacing: 1px; padding: 5px 10px; cursor: pointer; }
@media (max-width: 760px) {
  .mls .mls-portal-board, .mls .mls-portal-mine { grid-template-columns: 1fr; padding: 14px 16px 0; }
  .mls .mls-portal-bar { flex-wrap: wrap; padding: 12px 16px; } .mls .mls-portal-bar .search { flex-basis: 100%; max-width: none; }
  .mls .mls-portal-path { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .mls .mls-portal-mine .card.me { grid-template-columns: 56px minmax(0, 1fr); } .mls .mls-portal-mine .card.me .mls-portal-poster { grid-column: 1 / -1; }
}


.mls .mls-career-duty { position: absolute; z-index: 6; left: 50%; top: 64px;    transform: translateX(-50%) rotate(-1deg); background: var(--yellow); color: var(--ink); padding: 8px 18px; border: 3px solid var(--ink); box-shadow: 6px 6px 0 var(--ink); text-align: center; }
.mls .mls-career-duty b { display: block; font-family: var(--display); font-weight: 400; font-size: 24px; letter-spacing: 1px; line-height: 1.05; }
.mls .mls-career-duty span { font-size: 12px; font-weight: 900; }
.mls .mls-career-duty.late { background: var(--red); color: var(--paper); }
.mls .mls-place .tag.mls-career-tag { background: var(--yellow); color: var(--ink); }
.mls .mls-place .tag.mls-career-tag.late { background: var(--red); color: var(--paper); }
.mls.narrow .mls-career-duty { position: relative; left: auto; top: auto; transform: none; margin: 10px 16px 0; }


.mls .mls-career-veil { cursor: default; }
.mls .mls-career { grid-template-columns: 150px minmax(0, 1fr); column-gap: 20px; box-shadow: 10px 10px 0 var(--c, var(--red)); }
.mls .mls-career .kicker, .mls .mls-career .clock, .mls .mls-career .track, .mls .mls-career .mls-career-answers, .mls .mls-career .hint { grid-column: 1 / -1; }
.mls .mls-career .face { width: 150px; height: 190px; border: 3px solid var(--paper); background: #1b1b1f; box-shadow: 6px 6px 0 var(--c, var(--red)); transform: rotate(1.5deg); overflow: hidden; }
.mls .mls-career .face img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls .mls-career .mls-career-nobody { display: grid; place-items: center; background: repeating-linear-gradient(135deg, #1b1b1f 0 10px, #222227 10px 20px); }
.mls .mls-career .mls-career-nobody span { font-family: var(--display); font-size: 22px; line-height: 1; color: var(--muted); text-align: center; }
.mls .mls-career .who { display: grid; align-content: center; gap: 8px; }
.mls .mls-career .knock { font-size: 12px; font-weight: 900; letter-spacing: 3px; color: var(--yellow); }
.mls .mls-career.bad .knock { color: var(--red); }
.mls .mls-career .said { font-size: 16px; line-height: 1.5; font-style: italic; border-left: 4px solid var(--yellow); padding-left: 12px; }
.mls .mls-career .chips { display: flex; flex-wrap: wrap; gap: 6px; }
.mls .mls-career .chip { font-size: 11px; font-weight: 900; padding: 2px 8px; background: #e2ded5; color: var(--ink); }
.mls .mls-career .chip.gain { background: #2b2b30; color: var(--yellow); }
.mls .mls-career .chip.money { background: #1b7a3a; color: var(--paper); }
.mls .mls-career-answers { display: grid; gap: 8px; margin-top: 4px; }
.mls .mls-career-answers.two { grid-template-columns: 1fr 1fr; }
.mls .mls-career-ans { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-content: start; gap: 2px 12px; text-align: left; background: #1b1b1f; color: var(--paper); border: 3px solid var(--paper); padding: 10px 14px; cursor: pointer; }
.mls .mls-career-ans:hover { background: var(--yellow); color: var(--ink); }
.mls .mls-career-ans b { font-family: var(--display); font-weight: 400; font-size: 22px; letter-spacing: 1px; }
.mls .mls-career-ans > span { grid-column: 1; font-size: 13px; font-style: italic; }
.mls .mls-career-ans em { grid-column: 2; grid-row: 1 / span 2; align-self: center; font-style: normal; font-family: var(--display); font-size: 32px; color: var(--yellow); }
.mls .mls-career-ans:hover em { color: var(--ink); }
.mls .mls-career-ans small { grid-column: 1 / -1; font-size: 10px; font-weight: 900; letter-spacing: 2px; opacity: .7; display: flex; gap: 6px; flex-wrap: wrap; align-items: flex-start; align-content: flex-start; }
.mls .mls-career .clock .to { font-size: 44px; }

.mls .mls-card .mls-career-who { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: var(--muted); margin-bottom: -8px; }
.mls .mls-card .mls-career-after { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mls .mls-card .mls-career-after button { font-family: var(--display); font-size: 22px; letter-spacing: 1px; padding: 10px 14px; border: 3px solid var(--paper); cursor: pointer; text-align: left; }
.mls .mls-card .mls-career-after .stay { background: var(--yellow); color: var(--ink); }
.mls .mls-card .mls-career-after .go { background: #1b1b1f; color: var(--paper); }
.mls .mls-card .mls-career-after small { display: block; font-family: var(--body); font-size: 11px; font-weight: 700; letter-spacing: 0; opacity: .75; }
@media (max-width: 560px) {
  .mls .mls-career { grid-template-columns: 1fr; } .mls .mls-career .face { width: 110px; height: 140px; }
  .mls .mls-career-answers.two, .mls .mls-card .mls-career-after { grid-template-columns: 1fr; }
}


.mls .mls-portal-said { margin: 12px 22px 0; }
.mls .mls-portal-week .off { color: var(--paper); }
.mls .mls-portal-week .missed { color: var(--red); }
.mls .mls-portal-detail .apply.wait { background: #1b1b1f; color: var(--paper); border-color: var(--paper); box-shadow: 5px 5px 0 var(--red); }
.mls .mls-portal-mine .card.wide { grid-column: 1 / -1; }
.mls .mls-portal-poster .f.none { font-size: 18px; }
.mls .mls-career-answers.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mls .mls-career-ans:disabled { opacity: .45; cursor: default; }
.mls .mls-career-ans:disabled:hover { background: #1b1b1f; color: var(--paper); }
.mls .mls-career-leave { justify-self: end; background: none; border: 0; color: var(--muted); font-weight: 900; font-size: 11px; letter-spacing: 3px; cursor: pointer; padding: 4px 0; }
.mls .mls-career-leave:hover { color: var(--paper); }
.mls .mls-career .said.writing { font-style: normal; font-size: 12px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls .mls-career .said.writing .dots i { font-style: normal; animation: mls-blink 1s steps(1) infinite; }
.mls .mls-career .said.writing .dots i:nth-child(2) { animation-delay: .33s; }
.mls .mls-career .said.writing .dots i:nth-child(3) { animation-delay: .66s; }
@media (max-width: 560px) { .mls .mls-career-answers.three { grid-template-columns: 1fr; } }
.mls .mls-card .mls-career-after button:disabled { opacity: .5; cursor: default; }
.mls .mls-career .mls-career-read { grid-column: 1 / -1; margin: 0; color: var(--paper); }



.mls .mls-serve { display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 12px; align-items: center; background: rgba(11,11,13,.92);
  border-left: 6px solid var(--c); padding: 10px 14px; margin-bottom: 12px; box-shadow: 5px 5px 0 rgba(0,0,0,.45); color: var(--paper); }
.mls .mls-serve-face { width: 58px; height: 58px; border: 3px solid var(--paper); background: var(--c); overflow: hidden; display: grid; place-items: center;
  font-family: var(--display); font-size: 26px; color: var(--paper); }
.mls .mls-serve-face img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls .mls-serve .t b { font-family: var(--display); font-weight: 400; font-size: 22px; letter-spacing: 1px; line-height: 1; }
.mls .mls-serve .t small { display: block; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-top: 2px; }
.mls .mls-serve .t p { margin: 5px 0 0; font-size: 14px; font-weight: 700; line-height: 1.35; }
.mls .mls-serve .t p.writing, .mls .mls-opinion p.writing { font-size: 22px; letter-spacing: 4px; animation: mls-think 1s ease-in-out infinite; }
.mls .mls-serve-off { display: inline-block; vertical-align: 3px; margin-left: 10px; background: var(--yellow); color: var(--ink); font-size: 10px; font-weight: 900;
  letter-spacing: 1px; padding: 2px 8px; transform: rotate(-3deg); white-space: nowrap; }
.mls .mls-item .price s, .mls .mls-of .price s, .mls .mls-fit .buy s { opacity: .55; font-weight: 700; margin-right: 3px; }

.mls-shop.mls-rack .mls-fit { grid-auto-rows: max-content; }
.mls .mls-fitting { display: grid; gap: 8px; }
.mls .mls-fitting h4 { margin: 0; font-size: 10px; font-weight: 900; letter-spacing: 3px; color: #666; }
.mls .mls-opinion { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 10px; align-items: start; background: #fff; color: var(--ink); padding: 8px 10px;
  border-left: 5px solid var(--c); }
.mls .mls-opinion .mls-serve-face { width: 44px; height: 44px; border-width: 2px; border-color: var(--ink); font-size: 20px; }
.mls .mls-opinion b { font-family: var(--display); font-weight: 400; font-size: 15px; letter-spacing: 1px; }
.mls .mls-opinion p { margin: 2px 0 5px; font-size: 13px; font-weight: 700; line-height: 1.35; }
.mls .mls-opinion p.said { color: #666; font-style: italic; }
.mls .mls-opinion .chip { font-size: 10px; }
.mls .mls-opinion:not(.likes) .chip { background: #d8d4cb; color: #555; }

.mls .mls-till { background: #1b7a3a; color: var(--paper); padding: 10px 12px; border: 3px solid var(--paper); border-left: 8px solid var(--c); margin: 0 0 12px; }
.mls .mls-fit .mls-till { margin: 6px 0 0; }
.mls .mls-till b { font-size: 11px; font-weight: 900; letter-spacing: 2px; }
.mls .mls-till p { margin: 3px 0; font-size: 13px; font-weight: 700; line-height: 1.35; }
.mls .mls-till small { font-size: 11px; font-weight: 700; opacity: .85; }


.mls-cal .cal-date { --c: #ff5c8a; } .mls-cal .cal-hang { --c: #2bb3a3; }
.mls-cal .cal-wedding { --c: #f4f1ea; } .mls-cal .cal-anniversary { --c: #ff9ab5; } .mls-cal .cal-birthday { --c: #ffb74d; } .mls-cal .cal-party { --c: #b28dff; }

.mls-bday-pick { display: flex; gap: 6px; }
.mls-bday-pick select:first-child { flex: 3; min-width: 0; } .mls-bday-pick select:last-child { flex: 2; min-width: 0; }

.mls .mls-special-menu .mls-opt.mls-inv-row { border-left: 4px solid #ff5c8a; }
.mls .mls-inv-cost { display: block; font-size: 11px; font-weight: 900; color: var(--muted); }
.mls .mls-invite { gap: 8px; }
.mls .mls-inv-lbl { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: var(--muted); margin-top: 4px; }
.mls .mls-inv-kinds { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.mls .mls-inv-kinds button, .mls .mls-inv-place, .mls .mls-inv-days button, .mls .mls-inv-hours button { background: #141417; color: var(--paper); border: 2px solid #2a2a30; padding: 7px 9px; text-align: left; cursor: pointer; font: inherit; }
.mls .mls-inv-kinds button b { display: block; font-family: var(--display); font-weight: 400; font-size: 18px; letter-spacing: 1px; }
.mls .mls-inv-kinds small, .mls .mls-inv-place small, .mls .mls-inv-days small, .mls .mls-inv-hours small { display: block; font-size: 10px; font-weight: 700; color: var(--muted); }
.mls .mls-inv-kinds button.on, .mls .mls-inv-place.on, .mls .mls-inv-days button.on, .mls .mls-inv-hours button.on { border-color: #ff5c8a; background: #3a1020; }
.mls .mls-inv-kinds button.off, .mls .mls-inv-days button.off { opacity: .4; cursor: default; }
.mls .mls-inv-places { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; }
.mls .mls-inv-place b { font-size: 13px; font-weight: 900; }
.mls .mls-inv-place i { display: inline-block; font-style: normal; font-size: 9px; font-weight: 900; letter-spacing: .5px; background: #2a2a30; color: var(--paper); padding: 1px 5px; margin: 3px 3px 0 0; }
.mls .mls-inv-place i.good { background: #1b7a3a; }
.mls .mls-inv-place i.bad { background: var(--red); }
.mls .mls-inv-place i.new { background: var(--yellow); color: var(--ink); }
.mls .mls-inv-place i.meh { background: #5a4a1a; }
.mls .mls-inv-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.mls .mls-inv-days button { text-align: center; padding: 5px 2px; }
.mls .mls-inv-days b { font-size: 11px; font-weight: 900; }
.mls .mls-inv-hours { display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 4px; }
.mls .mls-inv-hours button { padding: 5px 6px; }
.mls .mls-inv-hours b { font-size: 13px; font-weight: 900; }
.mls .mls-inv-hours button.busy { opacity: .6; }
.mls .mls-inv-hours button.busy small { color: #ff8a8a; }
.mls .mls-inv-hours button.yours small { color: var(--yellow); }
.mls .mls-inv-foot { display: grid; gap: 6px; margin-top: 6px; }
.mls .mls-inv-foot > span { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls .mls-inv-foot .main, .mls .mls-inv-done { background: #ff5c8a; color: var(--ink); border: 0; padding: 9px 12px; font: inherit; font-weight: 900; letter-spacing: 1px; text-align: left; cursor: pointer; }
.mls .mls-inv-foot .main[disabled] { background: #2a2a30; color: var(--muted); cursor: default; }
.mls .mls-inv-foot .main small { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0; }
.mls .mls-inv-done { background: var(--paper); }
.mls .mls-inv-face { width: 44px; height: 44px; border: 2px solid var(--ink); background: var(--c); overflow: hidden; display: grid; place-items: center; font-family: var(--display); font-size: 20px; color: var(--paper); flex: none; }
.mls .mls-inv-face img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls .mls-inv-said { display: flex; gap: 10px; background: var(--paper); color: var(--ink); padding: 8px 10px; }
.mls .mls-inv-said b { font-family: var(--display); font-weight: 400; font-size: 15px; letter-spacing: 1px; }
.mls .mls-inv-said p { margin: 2px 0 0; font-size: 13px; font-weight: 700; line-height: 1.35; }
.mls .mls-inv-stamp { background: #ff5c8a; color: var(--ink); padding: 8px 12px; font-family: var(--display); font-size: 22px; letter-spacing: 1px; transform: rotate(-1.5deg); border: 3px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); }
.mls .mls-inv-stamp small { display: block; font-family: "Noto Sans", sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 1px; }
.mls .mls-inv-chips, .mls .mls-out-chips { display: flex; flex-wrap: wrap; gap: 5px; margin: 6px 0; }
.mls .mls-inv-chips i, .mls .mls-out-chips i { font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: .5px; background: #1b7a3a; color: var(--paper); padding: 3px 7px; }
.mls .mls-inv-chips i.warn { background: var(--yellow); color: var(--ink); }
.mls .mls-out-chips i.bad { background: var(--red); }
.mls .mls-out-chips i.found { background: var(--yellow); color: var(--ink); }
.mls .mls-inv-counter, .mls .mls-inv-no { background: #141417; border-left: 5px solid var(--yellow); padding: 8px 10px; }
.mls .mls-inv-no { border-left-color: var(--red); }
.mls .mls-inv-counter b, .mls .mls-inv-no b { font-family: var(--display); font-weight: 400; font-size: 20px; letter-spacing: 1px; display: block; }
.mls .mls-inv-no small { font-size: 11px; font-weight: 700; color: var(--muted); }
.mls .mls-inv-counter .row { display: flex; gap: 6px; margin-top: 6px; }
.mls .mls-inv-counter .row button { background: #2a2a30; color: var(--paper); border: 0; padding: 7px 10px; font: inherit; font-size: 11px; font-weight: 900; cursor: pointer; }
.mls .mls-inv-counter .row button.main { background: #ff5c8a; color: var(--ink); }

.mls .mls-plan-strip { display: grid; gap: 6px; }
.mls .mls-plan-strip.map { position: absolute; z-index: 6; left: 50%; top: 64px; transform: translateX(-50%) rotate(-1deg); }
.mls .mls-plan-strip.map.below { top: 132px; }

.mls.narrow .mls-plan-strip.map { position: relative; left: auto; top: auto; transform: none; margin: 10px 16px 0; }
.mls .mls-plan-strip.place { margin-bottom: 10px; }
.mls .mls-plan-strip.corridor { margin: 0 16px 10px; }
.mls .mls-plan { display: block; background: #ff5c8a; color: var(--ink); padding: 8px 18px; border: 3px solid var(--ink); box-shadow: 6px 6px 0 var(--ink); text-align: center; font: inherit; }
.mls button.mls-plan { cursor: pointer; width: 100%; }
.mls .mls-plan b { display: block; font-family: var(--display); font-weight: 400; font-size: 22px; letter-spacing: 1px; line-height: 1.05; }
.mls .mls-plan span { font-size: 12px; font-weight: 900; }
.mls .mls-plan.ready { background: var(--yellow); }
.mls .mls-plan.late { background: var(--red); color: var(--paper); }

.mls .mls-plan-tags { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; margin-left: auto; }
.mls .mls-plan-tag { font-size: 11px; font-weight: 900; letter-spacing: .5px; background: #141417; color: var(--paper); border-left: 4px solid #ff5c8a; padding: 3px 8px; white-space: nowrap; }
.mls .mls-plan-tag.date { border-left-color: var(--red); }
.mls .mls-plan-tag b { color: #ff5c8a; }
.mls .mls-plan-tag.date b { color: #ff8a8a; }
.mls .mls-plan-strip.map.tags { transform: translateX(-50%); }
.mls .mls-plan-strip.map.tags .mls-plan-tags { align-items: center; margin: 0; }
.mls .mls-corridor .top .mls-plan-tags + .clock { margin-left: 12px; }
.mls .mls-acts > .mls-plan-tags { margin: 0 0 10px; align-items: flex-end; }
.mls.narrow .mls-plan-tag { white-space: normal; }

.mls.narrow .mls-plan-strip.map.tags { transform: none; }
.mls.narrow .mls-plan-tags, .mls.narrow .mls-plan-strip.map.tags .mls-plan-tags { align-items: stretch; margin-left: 0; min-width: 0; max-width: 100%; }

.mls .mls-outing .mls-out-when { border-bottom-color: #ff5c8a; }
.mls .mls-outing .mls-out-when .track { height: 6px; background: #2a2a30; margin-top: 6px; }
.mls .mls-outing .mls-out-when .track i { display: block; height: 100%; background: #ff5c8a; }
.mls .mls-out-meter { position: relative; height: 22px; background: #2a2a30; margin: 6px 0 2px; }
.mls .mls-out-meter i { position: absolute; inset: 0 auto 0 0; background: #8d8a85; transition: width .5s; }
.mls .mls-out-meter.meh i { background: #b7892a; }
.mls .mls-out-meter.bad i { background: var(--red); }
.mls .mls-out-meter.good i { background: #2bb3a3; }
.mls .mls-out-meter.great i { background: #ff5c8a; }
.mls .mls-out-meter b { position: relative; display: block; padding: 2px 8px; font-size: 12px; font-weight: 900; letter-spacing: 2px; }
.mls .mls-outing .mls-out-go { display: block; margin-left: auto; background: none; border: 0; color: var(--paper); font: inherit; font-size: 16px; font-weight: 900; letter-spacing: 1px; cursor: pointer; padding: 4px 0; }

.mls .mls-outing .mls-decide.moments { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mls .mls-outing .mls-decide.moments .mls-choice { padding: 9px 14px; }
.mls .mls-outing .mls-decide.moments .mls-choice b { font-size: 19px; }
.mls .mls-outing .mls-decide.moments .mls-choice.bye { grid-column: 1 / -1; }
.mls.narrow .mls-outing .mls-decide.moments { grid-template-columns: minmax(0, 1fr); }
.mls-scene .mls-bondrow.mood { border-top: 1px solid rgba(244,241,234,.18); padding-top: 6px; margin-top: 2px; }
.mls-scene .mls-bondrow.mood.meh .bar i { background: #b7892a; }
.mls-scene .mls-bondrow.mood.bad .bar i { background: var(--red); }
.mls-scene .mls-bondrow.mood.good .bar i { background: #2bb3a3; }
.mls-scene .mls-bondrow.mood.great .bar i { background: #ff5c8a; }
.mls .mls-outing .mls-sug em { font-style: normal; font-size: 9px; font-weight: 900; background: #ff5c8a; color: var(--ink); padding: 1px 5px; margin-left: 6px; vertical-align: 2px; }
.mls .mls-outing .mls-sug.off { opacity: .45; cursor: default; }
.mls .mls-outing .mls-out-bye { border-left: 5px solid var(--yellow); }
.mls .mls-outing .mls-out-bye[disabled] { opacity: .5; }

.mls .mls-outing .mls-out-back { justify-self: start; font-size: 10px; letter-spacing: 1px; padding: 2px 8px; margin: 0 0 2px; }
.mls .mls-out-found { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; margin: 8px 0; }
.mls .mls-out-found b { font-size: 10px; font-weight: 900; letter-spacing: 2px; margin-right: 4px; }
.mls .mls-out-found i { font-style: normal; font-size: 11px; font-weight: 900; background: var(--yellow); color: var(--ink); padding: 2px 8px; }
.mls .mls-out-found i.bad { background: var(--red); color: var(--paper); }

.mls .mls-sheet-dates { display: grid; gap: 4px; margin: 4px 0 8px; }
.mls .mls-sheet-dates .k { display: inline-block; width: 70px; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls .mls-sheet-plan { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 13px; font-weight: 700; margin: 4px 0; }
.mls .mls-sheet-plan button { background: #141417; color: var(--paper); border: 2px solid var(--line); font-size: 10px; font-weight: 900; letter-spacing: 1px; padding: 3px 8px; cursor: pointer; }
.mls .mls-sheet-plan button.bad { border-color: var(--red); color: #ff8a8a; }
.mls .mls-sheet-plan .done { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #ff8a8a; }



.mls-corridor.street .row { position: relative; z-index: 1; gap: clamp(26px, 3.5vw, 56px); align-items: center; padding-top: 0; padding-bottom: 4vh; min-width: 100%; }
.mls-corridor.street .row::before { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: -1;
  background: linear-gradient(180deg, rgba(11,11,13,0) 0%, rgba(11,11,13,.15) 40%, rgba(11,11,13,.7) 100%); }
.mls .mls-house { position: relative; flex: none; width: clamp(250px, 23vw, 330px); display: grid; grid-template-rows: 92px clamp(250px, 38vh, 330px); filter: drop-shadow(7px 7px 0 rgba(0,0,0,.6)); }
.mls .mls-house .roof { position: relative; background-color: var(--roof); clip-path: polygon(50% 0, 100% 100%, 0 100%); margin: 0 -16px -1px;
  background-image: repeating-linear-gradient(180deg, transparent 0 13px, rgba(0,0,0,.22) 13px 15px), repeating-linear-gradient(90deg, transparent 0 22px, rgba(0,0,0,.12) 22px 24px); }
.mls .mls-house .roof::after { content: ""; position: absolute; inset: auto -2px 0 -2px; height: 12px; background: #141210; }
.mls .mls-house .front { position: relative; background-color: var(--wall); border: 5px solid #141210;
  background-image: repeating-linear-gradient(180deg, transparent 0 17px, rgba(0,0,0,.09) 17px 19px); }
.mls .mls-house .win { position: absolute; top: 20px; width: 24%; height: 66px; background-color: #26324a; border: 5px solid #141210;
  background-image: linear-gradient(90deg, transparent 46%, #141210 46%, #141210 54%, transparent 54%), linear-gradient(180deg, transparent 46%, #141210 46%, #141210 54%, transparent 54%);
  display: grid; place-items: center; }
.mls .mls-house .win::before, .mls .mls-house .win::after { content: ""; position: absolute; top: -5px; bottom: -5px; width: 26%; background: var(--roof); border: 3px solid #141210;
  background-image: repeating-linear-gradient(180deg, transparent 0 6px, rgba(0,0,0,.25) 6px 8px); }
.mls .mls-house .win::before { right: calc(100% + 5px); }
.mls .mls-house .win::after { left: calc(100% + 5px); }
.mls .mls-house .win.l { left: 13%; }
.mls .mls-house .win.r { right: 13%; }
.mls .mls-house.lit .win { background-color: #ffd66b; box-shadow: 0 0 28px #ffb84d; }
.mls .mls-house.dark .win { background-color: #0e1320; }
.mls .mls-house .win i { font-style: normal; font-family: var(--display); color: #9fb4ff; font-size: 26px; background: #0e1320; padding: 0 4px; }

.mls .mls-house .plaque { position: absolute; top: 112px; left: 50%; transform: translateX(-50%); max-width: 82%; padding: 4px 12px 3px; text-align: center; z-index: 1;
  background: linear-gradient(180deg, #ecd08a, #b8913a); color: #2a1e0c; border: 2px solid #5a4418; border-radius: 3px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.5), 0 2px 0 rgba(0,0,0,.45); }
.mls .mls-house .plaque b { display: block; font-size: 13px; font-weight: 900; letter-spacing: .5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mls .mls-house .plaque small { display: block; font-size: 10px; font-weight: 900; letter-spacing: 1.5px; opacity: .85; white-space: nowrap; }
.mls .mls-house.mine .plaque { background: linear-gradient(180deg, #ffe14d, #d8b21e); }
.mls .mls-house .door { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); width: 30%; height: 40%; background: var(--pc); border: 5px solid #141210; border-bottom: 0; }
.mls .mls-house .door::before, .mls .mls-house .door::after { content: ""; position: absolute; left: 16%; right: 16%; border: 3px solid rgba(0,0,0,.35); }
.mls .mls-house .door::before { top: 26%; height: 26%; }
.mls .mls-house .door::after { top: 60%; height: 28%; }
.mls .mls-house .door i { position: absolute; right: 16%; top: 50%; width: 10px; height: 10px; border-radius: 50%; background: #e8c77a; z-index: 1; }
.mls .mls-house .door em { position: absolute; top: 6%; left: 20%; right: 20%; height: 12%; background: #26324a; border: 3px solid #141210; border-radius: 10px 10px 0 0; }
.mls .mls-house.lit .door em { background: #ffd66b; }
.mls .mls-house .step { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40%; height: 10px; background: #8a8378; border: 3px solid #141210; border-bottom: 0; }
.mls .mls-house .lamp { position: absolute; bottom: 30%; left: calc(50% + 19%); width: 12px; height: 18px; background: #2a2320; border: 3px solid #141210; border-radius: 3px 3px 0 0; }
.mls .mls-house.lit .lamp { background: #ffe07a; box-shadow: 0 0 18px 4px #ffb84d; }
.mls .mls-house .bush { position: absolute; bottom: -6px; width: 22%; height: 38px; background: #3e7a3a; border: 3px solid #141210; border-radius: 50% 50% 8px 8px; box-shadow: inset -6px -6px 0 rgba(0,0,0,.2); }
.mls .mls-house .bush.l { left: -10px; }
.mls .mls-house .bush.r { right: -10px; }

.mls .mls-house-tag { position: absolute; bottom: 13%; left: 50%; transform: translateX(-50%) rotate(-2deg); z-index: 3; white-space: nowrap; text-align: center;
  font: inherit; font-size: 12px; font-weight: 900; letter-spacing: 2px; padding: 6px 12px; border: 3px solid #141210; box-shadow: 3px 3px 0 rgba(0,0,0,.6); }
.mls button.mls-house-tag { cursor: pointer; }
.mls .mls-house-tag small { display: block; font-size: 9px; font-weight: 700; letter-spacing: 0; text-transform: none; }
.mls .mls-house-tag.go { background: var(--red); color: var(--paper); }
.mls .mls-house-tag.off { background: #2b2b30; color: #b7b2aa; }
.mls .mls-house.stranger { filter: drop-shadow(7px 7px 0 rgba(0,0,0,.6)) saturate(.3) brightness(.9); }
.mls .mls-house .heads { position: absolute; bottom: 46px; right: 10px; z-index: 3; display: flex; flex-direction: row-reverse; }
.mls .mls-house .heads b { position: relative; overflow: hidden; width: 40px; height: 40px; border-radius: 50%; margin-left: -10px; display: grid; place-items: center;
  font-size: 13px; font-weight: 900; border: 3px solid var(--ink); background: var(--c); color: var(--paper); }
.mls .mls-house .heads b.pic { border-color: var(--c); }
.mls .mls-house .heads b i { position: relative; z-index: 1; font-style: normal; }
.mls .mls-house .heads b.asleep { filter: brightness(.45) saturate(.3); }
.mls .mls-house .mls-bang { z-index: 4; }
.mls.narrow .mls-house { width: 230px; grid-template-rows: 80px 250px; }

.mls .mls-event .n em { font-style: normal; white-space: nowrap; }



.mls-district-head { display: flex; align-items: center; gap: 18px; }
.mls:not(.narrow) .mls-district-head { position: absolute; top: 128px; left: 24px; z-index: 4; }

.mls-top { pointer-events: none; }
.mls-top > * { pointer-events: auto; }
.mls:not(.narrow) .mls-map .mls-places { top: 200px; --cw: clamp(160px, min(15vw, 27vh), 270px); }
.mls-district-head h1 { margin: 0; font-family: var(--display); font-weight: 400; font-size: clamp(38px, 4.4vw, 60px); line-height: .9; transform: rotate(-3deg); text-shadow: 5px 5px 0 var(--red); }
.mls-district-head .sub { font-size: 12px; font-weight: 900; letter-spacing: 2px; background: var(--ink); padding: 3px 10px; }
.mls .mls-sign { font: inherit; cursor: pointer; background: #1d6b3c; color: #fff; border: 3px solid #fff; outline: 3px solid #1d6b3c; padding: 6px 14px 5px;
  font-family: var(--display); font-size: 22px; letter-spacing: 1px; transform: rotate(-2deg); box-shadow: 5px 6px 0 rgba(0,0,0,.55); }
.mls .mls-sign:hover { transform: rotate(0) translateY(-2px); }
.mls .mls-sign.back { background: var(--ink); outline-color: var(--ink); }

.mls-place .mls-who { top: 8px; left: 8px; right: auto; flex-direction: row; }
.mls-place .mls-who b { margin-left: 0; margin-right: -10px; }

.mls-town { position: relative; }
.mls:not(.narrow) .mls-town { position: absolute; top: 210px; bottom: 70px; left: 130px; right: 130px; z-index: 3; }
.mls-town-lines { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.mls-town-lines line { stroke: var(--paper); stroke-width: 4; stroke-dasharray: 3 10; stroke-linecap: round; opacity: .8; }
.mls-town-lines line.hot { stroke: var(--red); stroke-width: 6; stroke-dasharray: none; opacity: 1; }
.mls-dcard { position: absolute; width: clamp(200px, 16vw, 240px); transform: translate(-50%, -50%) rotate(-1.5deg); font: inherit; text-align: left; cursor: pointer;
  background: var(--paper); color: var(--ink); border: 0; padding: 0 0 8px; box-shadow: 6px 7px 0 rgba(0,0,0,.6); display: grid; }
.mls-dcard:nth-of-type(even) { transform: translate(-50%, -50%) rotate(1.8deg); }
.mls-dcard:hover { box-shadow: 6px 7px 0 var(--yellow); }
.mls-dcard.here { box-shadow: 6px 7px 0 var(--red); }
.mls-dcard .shot { height: 64px; background: linear-gradient(135deg, #3a3a44, #1a1a1f) center / cover; }
.mls .mls-dcard .n { font-family: var(--display); font-size: 26px; line-height: 1.05; padding: 6px 10px 2px; color: var(--ink); }
.mls-dcard .in { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 10px 4px; }
.mls-dcard .in i { font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: .5px; background: var(--ink); color: var(--paper); padding: 2px 6px; }
.mls-dcard .in i.shut { background: #b7b2aa; color: #4a4640; }
.mls-dcard .far { font-size: 11px; font-weight: 900; color: #8a8175; padding: 0 10px; }
.mls-dcard .mls-who { top: 8px; right: 12px; }
.mls-dcard .tag { position: absolute; z-index: 2; top: -12px; right: -10px; font-family: var(--display); font-size: 12px; letter-spacing: 1px; padding: 2px 8px; background: var(--yellow); color: var(--ink); transform: rotate(7deg); }
.mls-town .mls-walker { z-index: 6; width: 40px; height: 40px; }

.mls.narrow .mls-districtview { position: relative; z-index: 3; }
.mls.narrow .mls-district-head { padding: 14px 14px 0; flex-wrap: wrap; gap: 10px 14px; }
.mls.narrow .mls-district-head h1 { font-size: 34px; }
.mls.narrow .mls-sign { font-size: 18px; padding: 4px 10px; }
.mls.narrow .mls-town { display: grid; gap: 22px; margin: 18px 14px 40px; }
.mls.narrow .mls-dcard, .mls.narrow .mls-dcard:nth-of-type(even) { position: relative; width: auto; transform: rotate(-1deg); left: auto !important; top: auto !important; }
.mls.narrow .mls-dcard .shot { height: 72px; }

.mls-district-row { grid-column: 1 / -1; display: flex; align-items: center; gap: 10px; padding: 10px 2px 0; }
.mls-create .mls-district-row input.mls-place-name { font-family: var(--display); font-size: 26px; font-weight: 400; flex: 1; min-width: 0; background: transparent; color: var(--yellow);
  border: 0; border-bottom: 2px solid transparent; padding: 2px 4px; }
.mls-create .mls-district-row input.mls-place-name::placeholder { color: var(--yellow); opacity: 1; }
.mls-create .mls-district-row input.mls-place-name:focus { border-bottom-color: var(--yellow); outline: none; }
.mls-district-row small { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls-district-row.off { opacity: .45; }



.mls .mls-paint { position: absolute; right: 8px; bottom: 8px; z-index: 4; width: 34px; height: 34px; border-radius: 50%; cursor: pointer;
  display: grid; place-items: center; background: var(--ink); color: var(--paper); border: 3px solid var(--paper); box-shadow: 3px 3px 0 rgba(0,0,0,.55); }

.mls .mls-paint svg { position: static; inset: auto; width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linejoin: round; stroke-linecap: round; display: block; }
.mls .mls-paint svg .dot { fill: currentColor; stroke: none; }
.mls .mls-paint:hover { background: var(--yellow); color: var(--ink); }
.mls .mls-paint.busy { cursor: default; border-color: #55555c; }
.mls .mls-paint.busy:hover { background: var(--ink); }
.mls .mls-paint.busy::before { content: ""; width: 18px; height: 18px; border-radius: 50%; border: 3px solid var(--yellow); border-right-color: transparent; animation: mls-paint-turn .8s linear infinite; }
.mls .mls-paint.failed { background: var(--red); }
@keyframes mls-paint-turn { to { transform: rotate(360deg); } }
.motion-off .mls-paint.busy::before { animation-duration: 2.4s; }
.mls .mls-paint.big { width: 44px; height: 44px; }

.mls .mls-paint.up { right: auto; left: 8px; }


.mls .mls-rename { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.mls .mls-rename input { font: inherit; font-size: 14px; font-weight: 900; padding: 5px 8px; min-width: 0; width: 14em; max-width: 100%; background: var(--paper); color: var(--ink); border: 0; }
.mls-h-ofw { position: relative; display: grid; }
.mls .mls-h-ofw > .mls-paint.up { left: 12px; bottom: auto; top: 12px; }
.mls .mls-workbox .sprite > .mls-paint.up { left: 6px; top: 6px; bottom: auto; }
.mls-ask.mls-crop { width: min(440px, 94%); transform: none; justify-items: center; }
.mls-ask.mls-crop.wide { width: min(680px, 94%); }
.mls-ask.mls-crop > b, .mls-ask.mls-crop > small { justify-self: stretch; }
.mls-crop .pad { position: relative; overflow: hidden; cursor: grab; touch-action: none; user-select: none; border: 3px solid var(--ink);
  background: repeating-conic-gradient(#d9d5cc 0 25%, #f4f1ea 0 50%) 0 0 / 18px 18px; }
.mls-crop .pad:active { cursor: grabbing; }
.mls-crop.tall .pad { height: min(58vh, 540px, calc((94vw - 48px) * var(--hw))); }
.mls-crop.wide .pad { width: 100%; max-height: 58vh; }
.mls-crop .pad img { position: absolute; max-width: none; pointer-events: none; }
.mls-crop .zoom { justify-self: stretch; display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 900; letter-spacing: 2px; }
.mls-crop .zoom input { flex: 1; accent-color: var(--red); }
.mls-crop .acts { justify-self: stretch; display: flex; gap: 8px; }
.mls-crop .acts button { font-weight: 900; font-size: 12px; letter-spacing: 2px; padding: 7px 16px; cursor: pointer; border: 2px solid var(--ink); background: none; color: var(--ink); }
.mls-crop .acts button.save { background: var(--ink); color: var(--paper); }
.mls .mls-paint.big svg { width: 22px; height: 22px; }

.mls .mls-place .photo, .mls .mls-dcard .shot, .mls .mls-album-tile .pic, .mls .mls-h-of .ph, .mls .mls-of .fr, .mls .mls-fit > .big, .mls .mls-work-grid .sprite.framed { position: relative; }
.mls .mls-place .photo::after { content: none; }
.mls .mls-place-title .mls-paint { position: relative; right: auto; bottom: auto; margin-top: 12px; }
.mls .mls-key-wait .mls-paint { position: relative; right: auto; bottom: auto; }
.mls .mls-album-tile .pic.wait .mls-paint { right: 50%; bottom: 50%; transform: translate(50%, 50%); width: 48px; height: 48px; }
.mls .mls-of .fr .mls-paint { right: 6px; bottom: 6px; width: 30px; height: 30px; }
.mls .mls-of .fr .mls-paint svg { width: 16px; height: 16px; }
.mls .mls-fit > .big .mls-paint { right: 12px; bottom: 12px; width: 52px; height: 52px; }
.mls .mls-fit > .big .mls-paint svg { width: 26px; height: 26px; }
.mls .mls-work-grid .sprite.framed .mls-paint { right: 10px; bottom: 10px; }

.mls.narrow .mls-fit > .big .mls-paint { width: 26px; height: 26px; right: 50%; bottom: 6px; transform: translateX(50%); border-width: 2px; }
.mls.narrow .mls-fit > .big .mls-paint svg { width: 14px; height: 14px; }


.mls .mls-pictures { margin-bottom: 18px; }

.mls-create .mls-pictures { background: var(--panel, #141417); border-left: 5px solid var(--yellow); padding: 14px 16px; display: grid; gap: 12px; margin: 12px 0 0; }
.mls-create .mls-pictures h3 { margin: 0; font-family: var(--display); font-weight: 400; font-size: 24px; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.mls-create .mls-pictures h3 small { font-family: var(--body); font-size: 11px; font-weight: 700; color: var(--muted); letter-spacing: 1px; }
.mls .mls-pictures .mls-pic-sys { display: grid; grid-template-columns: 1fr auto auto; gap: 14px; align-items: center; padding: 10px 0; border-top: 1px solid #2b2b30; }
.mls .mls-pictures .mls-pic-sys:first-of-type { border-top: 0; }
.mls .mls-pic-sys b { display: block; font-family: var(--display); font-weight: 400; font-size: 22px; letter-spacing: 1px; }
.mls .mls-pic-sys small { display: block; font-size: 11px; color: var(--muted); }
.mls .mls-pic-sys .left { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--yellow); }
.mls .mls-pic-sys .seg { display: flex; border: 2px solid var(--paper); }
.mls .mls-pic-sys .seg button { font: inherit; font-size: 11px; font-weight: 900; letter-spacing: 1px; padding: 6px 10px; border: 0; background: transparent; color: var(--paper); cursor: pointer; }
.mls .mls-pic-sys .seg button.on { background: var(--paper); color: var(--ink); }
.mls .mls-pic-sys .seg button.on:last-child { background: var(--red); color: var(--paper); }
.mls.narrow .mls-pictures .mls-pic-sys { grid-template-columns: 1fr auto; }
.mls.narrow .mls-pictures .mls-pic-sys .seg { grid-column: 1 / -1; justify-self: start; }

.mls-pic-warn { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.7); display: grid; place-items: center; padding: 16px; }
.mls-pic-warn .card { width: min(520px, 100%); background: var(--ink); color: var(--paper); border: 3px solid var(--paper); box-shadow: 10px 10px 0 var(--red); padding: 20px 22px; }
.mls-pic-warn h2 { margin: 0 0 10px; font-family: var(--display); font-weight: 400; font-size: 32px; letter-spacing: 1px; }
.mls-pic-warn p { margin: 6px 0; font-size: 14px; line-height: 1.4; }
.mls-pic-warn .warn { background: var(--red); color: var(--paper); font-weight: 900; padding: 6px 10px; }
.mls-pic-warn .nums { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 14px 0 8px; text-align: center; }
.mls-pic-warn .nums b { display: block; font-family: var(--display); font-weight: 400; font-size: 40px; line-height: 1; color: var(--yellow); }
.mls-pic-warn .nums small { font-size: 10px; font-weight: 900; letter-spacing: 1px; color: var(--muted); }
.mls-pic-warn .more { font-size: 12px; color: var(--muted); }
.mls-pic-warn .acts { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }


.mls .mls-place-title .meta.deliv { margin-top: 4px; }
.mls.narrow .mls-place-title .meta.deliv { display: inline-block; }


.mls .mls-h-of .ph .sty { position: absolute; top: 6px; right: 6px; z-index: 2; font-style: normal; font-size: 9px; font-weight: 900; letter-spacing: 1px; background: var(--ink); color: var(--paper); padding: 2px 6px; }



.mls .mls-scene .sprite.second.x1 { left: 76%; transform: translateX(-50%) rotate(-2deg) scale(.86); }
.mls .mls-scene .sprite.second.x2 { left: 10%; transform: translateX(-50%) rotate(3deg) scale(.74); filter: brightness(.6); }
.mls .mls-scene .sprite.lit { filter: none; z-index: 2; }
.mls .mls-scene .sprite.dim { filter: brightness(.55); }

.mls .mls-call-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
.mls .mls-call-chips i { font-style: normal; font-size: 10px; font-weight: 900; letter-spacing: 1px; padding: 2px 6px; background: #2a2a30; color: var(--paper); }
.mls .mls-call-chips i.roll { background: var(--ink); color: var(--yellow); }
.mls .mls-call-chips i.bad { background: var(--red); }

.mls .mls-pairs { display: grid; gap: 6px; margin: 10px 0 4px; }
.mls .mls-pair { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; background: #141417; padding: 6px 10px; }
.mls .mls-pair .faces { display: flex; }
.mls .mls-pair .faces .mls-news-face + .mls-news-face { margin-left: -8px; }
.mls .mls-pair b { display: block; font-size: 13px; }
.mls .mls-pair small { display: block; font-size: 11px; color: var(--muted); }
.mls .mls-mood { font-size: 11px; font-weight: 900; letter-spacing: 2px; padding: 3px 8px; background: #2a2a30; color: var(--paper); white-space: nowrap; }
.mls .mls-mood.good { background: #2bb3a3; color: var(--ink); }
.mls .mls-mood.tense { background: #b7892a; color: var(--ink); }
.mls .mls-mood.rivals { background: var(--red); }
.mls .mls-mood.love { background: #ff5c8a; color: var(--ink); }
.mls .mls-mood.none { color: var(--muted); }

.mls .mls-inv-who { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; }
.mls .mls-inv-pick { display: grid; grid-template-columns: auto 1fr; gap: 2px 8px; align-items: center; text-align: left; background: #141417; color: var(--paper); border: 2px solid #2a2a30; padding: 6px 8px; cursor: pointer; font: inherit; }
.mls .mls-inv-pick .mls-news-face { grid-row: span 2; }
.mls .mls-inv-pick b { font-family: var(--display); font-weight: 400; font-size: 18px; letter-spacing: 1px; }
.mls .mls-inv-pick small { font-size: 10px; font-weight: 700; color: var(--muted); }
.mls .mls-inv-pick small.warn { color: var(--yellow); }
.mls .mls-inv-pick.on { border-color: #ff5c8a; background: #3a1020; }
.mls .mls-inv-pick:disabled { opacity: .45; cursor: default; }

.mls .mls-scene .bonds.mls-out-mood.group { display: grid; gap: 6px; }
.mls .mls-out-mood.group .name { font-size: 12px; }
.mls .mls-out-mood.group .mls-out-meter { margin: 2px 0 0; height: 18px; }
.mls .mls-out-mood.group .mls-out-meter b { font-size: 10px; padding: 1px 6px; }

.mls .tag.t-met, .mls .tag.t-get-along { background: #2bb3a3; color: var(--ink); }
.mls .tag.t-tension { background: #b7892a; color: var(--ink); }
.mls .tag.t-rivals { background: var(--red); color: var(--paper); }
.mls .tag.t-in-love { background: #ff5c8a; color: var(--ink); }



.mls .mls-perks-new { margin: 10px 0 4px; border-left: 4px solid var(--yellow); background: #141417; padding: 8px 12px; }
.mls .mls-perks-new b { display: block; font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--yellow); margin-bottom: 4px; }
.mls .mls-perks-new div { font-size: 13px; padding: 2px 0; }
.mls .mls-perks-new div::before { content: "\u2726 "; color: var(--yellow); }

.mls .mls-with .row { display: grid; grid-template-columns: 110px 1fr; gap: 10px; padding: 6px 0; border-top: 1px solid #2b2b30; align-items: baseline; }
.mls .mls-with .row:first-of-type { border-top: 0; }
.mls .mls-with .tier { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--yellow); }
.mls .mls-with .row.later .tier, .mls .mls-with .row.later .what { color: #55555c; }
.mls .mls-with .what span { display: block; font-size: 13px; }
.mls .mls-with .what span::before { content: "\u2713 "; color: #2bb3a3; font-weight: 900; }
.mls .mls-with .row.later .what span::before { content: "\xB7 "; color: #55555c; }
.mls .mls-with-note { font-size: 12px; color: var(--muted); margin: 6px 0 0; }
.mls .mls-owe { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; margin-top: 10px; background: #3a1020; border: 2px solid #ff5c8a; padding: 8px 10px; }
.mls .mls-owe.late { border-color: var(--red); }
.mls .mls-owe b { display: block; font-family: var(--display); font-weight: 400; font-size: 22px; letter-spacing: 1px; }
.mls .mls-owe small { font-size: 11px; color: var(--muted); }

.mls-faint .bill .r.helped { color: #2bb3a3; }

.mls .mls-activity .chip.treat { background: #ff5c8a; color: var(--ink); }

.mls .mls-intro-pick { display: grid; gap: 6px; margin-top: 8px; }
.mls .mls-intro-pick button { display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; align-items: center; text-align: left; background: #141417; color: var(--paper); border: 2px solid #2a2a30; padding: 6px 8px; cursor: pointer; font: inherit; }
.mls .mls-intro-pick button .mls-news-face { grid-row: span 2; }
.mls .mls-intro-pick button b { font-family: var(--display); font-weight: 400; font-size: 18px; letter-spacing: 1px; }
.mls .mls-intro-pick button small { font-size: 11px; color: var(--muted); }

.mls .mls-intro-pick.plain button { grid-template-columns: 1fr; }

.mls .mls-intro-pick button.on { border-color: var(--red, #e5191c); }
.mls .mls-intro-pick button:disabled { cursor: default; border-style: dashed; background: #0f0f12; }
.mls .mls-intro-pick button:disabled b { color: var(--muted); }

.mls .mls-scene > .mls-paint.scene { top: 200px; bottom: auto; right: 14px; }

.mls .tag.t-defended-you { background: #2bb3a3; color: var(--ink); }



.mls .mls-rent.owed { background: var(--paper); color: var(--red); font-weight: 900; max-width: 320px; }
.mls .mls-rent.owed small { display: block; color: #333; font-weight: 700; font-size: 10px; letter-spacing: .5px; }
.mls .mls-rent.street { background: var(--ink); color: var(--red); border: 2px solid var(--red); font-weight: 900; letter-spacing: 1px; }


.mls .mls-notice-veil { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.62); display: grid; place-items: center; padding: 16px; }
.mls .mls-notice { width: min(440px, 100%); background: var(--paper); color: var(--ink); padding: 18px 22px 16px; box-shadow: 10px 10px 0 var(--red); transform: rotate(-1deg); animation: mls-fade .4s; }
.mls .mls-notice .k { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--red); }
.mls .mls-notice h3 { margin: 2px 0 10px; font-family: var(--display); font-weight: 400; font-size: 34px; line-height: 1; }
.mls .mls-notice .r { display: flex; justify-content: space-between; gap: 10px; font-size: 14px; font-weight: 700; border-bottom: 1px dashed #bbb; padding: 4px 0; }
.mls .mls-notice .r.total b { color: var(--red); font-size: 16px; }
.mls .mls-notice .r.lent b { color: #1f8f82; }
.mls .mls-notice p { margin: 10px 0 0; font-size: 13px; font-weight: 700; color: #333; }
.mls .mls-notice p.warn { color: var(--red); }
.mls .mls-notice .face-row { display: flex; gap: 10px; align-items: center; margin: 4px 0 8px; }
.mls .mls-notice .face-row .f { width: 54px; height: 54px; flex: none; overflow: hidden; background: #ddd; }
.mls .mls-notice .face-row .f img { width: 100%; height: 100%; object-fit: cover; }
.mls .mls-notice .face-row em { font-style: italic; font-weight: 700; color: #333; }
.mls .mls-notice button.ok { margin-top: 12px; width: 100%; background: var(--ink); color: var(--paper); border: 0; padding: 10px; font-family: var(--display); font-size: 20px; letter-spacing: 1px; cursor: pointer; }


.mls .mls-faint.evicted .scene { background: linear-gradient(180deg, #1b1d26 0%, #0f1016 100%); }
.mls .mls-faint.evicted .door { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); height: 74%; aspect-ratio: 5 / 9; background: #5a4a3c; border: 10px solid #3a2f26; border-bottom: 0; z-index: 2; }
.mls .mls-faint.evicted .door::after { content: "NOTICE"; position: absolute; left: 50%; top: 30%; transform: translateX(-50%) rotate(-3deg); background: var(--paper); color: var(--red); font-family: var(--display); font-size: 18px; padding: 10px 14px 26px; }
.mls .mls-faint.evicted .bill .r.kept b { color: #1f8f82; }
.mls .mls-faint.evicted .bill .r.held b { color: var(--red); }
.mls .mls-offer { margin-top: 12px; border-top: 3px solid var(--ink); padding-top: 10px; }
.mls .mls-offer .who { display: flex; gap: 10px; align-items: center; }
.mls .mls-offer .who .f { width: 48px; height: 48px; flex: none; overflow: hidden; background: #ddd; }
.mls .mls-offer .who .f img { width: 100%; height: 100%; object-fit: cover; }
.mls .mls-offer .who b { display: block; font-size: 13px; letter-spacing: 1px; }
.mls .mls-offer .who em { font-size: 13px; color: #333; }
.mls .mls-offer .row { display: flex; gap: 8px; margin-top: 10px; }
.mls .mls-offer .row button { flex: 1; border: 0; padding: 9px; font-weight: 900; letter-spacing: 1px; cursor: pointer; background: #ddd; color: var(--ink); }
.mls .mls-offer .row button.main { background: var(--ink); color: var(--paper); }


.mls .mls-street { border-left: 5px solid var(--red); background: #141417; padding: 10px 12px; margin-bottom: 10px; }
.mls .mls-street b { display: block; font-family: var(--display); font-weight: 400; font-size: 26px; letter-spacing: 1px; }
.mls .mls-street small { display: block; font-size: 11px; font-weight: 900; letter-spacing: 2px; color: var(--muted); }
.mls .mls-street small em { font-style: normal; color: var(--yellow); }


.mls .mls-homes .mls-portal-bar .brand b { background: #6d4c41; }
.mls .mls-homes-list { display: grid; gap: 12px; padding: 12px 16px 24px; }
.mls .mls-home { display: grid; grid-template-columns: 150px 1fr; gap: 14px; background: #141417; border-left: 5px solid var(--c, #6d4c41); padding: 12px; }
.mls .mls-home .pic { aspect-ratio: 4 / 3; background: #26262b center / cover no-repeat; display: grid; place-items: center; font-size: 34px; }
.mls .mls-home h3 { margin: 0; font-family: var(--display); font-weight: 400; font-size: 26px; letter-spacing: 1px; }
.mls .mls-home .sub { font-size: 12px; color: var(--muted); font-weight: 700; }
.mls .mls-home .sum { margin-top: 8px; display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; font-size: 13px; font-weight: 700; max-width: 360px; }
.mls .mls-home .sum b { text-align: right; }
.mls .mls-home .sum .t { border-top: 1px dashed #444; padding-top: 3px; }
.mls .mls-home .sum .t b { color: var(--yellow); }
.mls .mls-home .note { font-size: 12px; color: #c9c5bd; margin-top: 6px; }
.mls .mls-home .note.warn { color: #ff8a80; }
.mls .mls-home button.move { margin-top: 10px; background: var(--yellow); color: #000; border: 0; padding: 8px 14px; font-weight: 900; letter-spacing: 1px; cursor: pointer; }
.mls .mls-home button.move:disabled { background: #333; color: #888; cursor: default; }
.mls .mls-home button.move small { display: block; margin-top: 2px; font-size: 10px; font-weight: 700; letter-spacing: .5px; color: #ff8a8a; }

.mls .mls-home button.move.alt { background: var(--paper); margin-left: 6px; }
.mls .mls-home button.move.alt:disabled { background: #333; color: #888; }
.mls .mls-home.lux h3 { color: #d4a017; }
.mls .mls-home.now { --c: var(--yellow); }
.mls .mls-home .tag { display: inline-block; font-size: 10px; font-weight: 900; letter-spacing: 2px; padding: 2px 6px; background: var(--yellow); color: #000; margin-left: 6px; vertical-align: middle; }
.mls.narrow .mls-home { grid-template-columns: 1fr; }


.mls .mls-bills .mls-portal-bar .brand b { background: #b71c1c; }
.mls .mls-bills .search b { color: var(--yellow); margin-left: 6px; }
.mls .mls-bill .pic { font-size: 30px; }
.mls .mls-bill .pic .f { display: block; width: 100%; height: 100%; overflow: hidden; }
.mls .mls-bill .pic .f img { width: 100%; height: 100%; object-fit: cover; }
.mls .mls-bill .sum b.hard { color: #ff8a80; }
.mls .mls-bill-pick { display: flex; gap: 6px; align-items: center; margin-top: 10px; }
.mls .mls-bill-pick button { background: #26262b; color: var(--paper); border: 0; padding: 6px 10px; font-weight: 900; cursor: pointer; }
.mls .mls-bill-pick button:disabled { opacity: .35; cursor: default; }
.mls .mls-bill-pick b { min-width: 70px; text-align: center; font-family: var(--display); font-weight: 400; font-size: 24px; color: var(--yellow); }


.mls .mls-career-ans .lv { display: block; margin-top: 4px; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--yellow); }
.mls .mls-career-ans.best { outline: 3px solid var(--yellow); outline-offset: -3px; }
.mls .mls-career-ans.charm .lv { color: #f48fb1; }
.mls .mls-home-flat { display: flex; gap: 8px; align-items: center; margin-top: 8px; font-size: 12px; font-weight: 900; letter-spacing: 1px; cursor: pointer; }
.mls .kv .owed { color: var(--red); font-weight: 900; }
.mls .mls-faint.evicted { min-height: clamp(560px, calc(100vh - 190px), 1100px); }


.mls .mls-scene .box .mls-decide + .mls-turn { margin-top: 10px; }
.mls .mls-bills-owed { padding: 4px 0 0; font-size: 11px; font-weight: 900; letter-spacing: 3px; color: #2bb3a3; }
.mls .mls-bill.theirs { --c: #2bb3a3; }
.mls .mls-bill.theirs .sum b.soon { color: var(--muted); }


.mls .mls-seasons .mls-season-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 10px; }
.mls .mls-seasons .mls-season { display: grid; gap: 6px; align-content: start; min-width: 0; }
.mls .mls-seasons .sprite { width: 100%; height: auto; min-height: 0; aspect-ratio: 832 / 1216; }
.mls .mls-seasons .sprite > img { position: absolute; inset: 0; width: 100%; height: 100%; }
.mls .mls-seasons .mls-season:not(.now) .sprite { box-shadow: 5px 5px 0 #333; }
.mls .mls-seasons .mls-outfit { font-size: 12.5px; }
.mls .mls-seasons .mls-work-edit { min-height: 130px; font-size: 12.5px; }

.mls .mls-seasons .mls-work-btns { flex-wrap: wrap; align-items: stretch; }
.mls .mls-seasons .mls-work-btns button.mls-set-btn { white-space: nowrap; padding: 6px 10px; letter-spacing: 1.5px; }
@media (max-width: 720px) { .mls .mls-seasons .mls-season-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.mls.narrow .mls-seasons .mls-season-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }


.mls.cut .mls-scene .sprite.framed { background: transparent; border: 0; box-shadow: none; overflow: visible; transform: translateX(-50%); }
.mls.cut:not(.narrow) .mls-scene .sprite.framed { aspect-ratio: 832 / 1216; height: 92%; bottom: 0; }
.mls.cut .mls-scene .sprite.framed.second { transform: translateX(-50%) scale(.86); }
.mls.cut .mls-scene .sprite.framed.second.x1 { transform: translateX(-50%) scale(.86); }
.mls.cut .mls-scene .sprite.framed.second.x2 { transform: translateX(-50%) scale(.74); }
.mls.cut .mls-person .body.framed { background: transparent; border: 0; box-shadow: none; overflow: visible; transform: none; aspect-ratio: 832 / 1216; }

.mls.cut .mls-person .body.framed { margin-left: 50%; translate: -50% 0; pointer-events: none; }
.mls.cut .mls-person .plate, .mls.cut .mls-place-screen.focus .mls-person.picked .plate, .mls.narrow.cut .mls-place-screen.focus .mls-person.picked .plate {
  left: 50%; bottom: 7%; transform: translateX(-50%) rotate(-4deg); width: max-content; max-width: 190px; }

.mls.cut .mls-people .mls-person:nth-of-type(even) .plate { bottom: 15%; }

.mls.cut:not(.narrow) .mls-people { left: calc(3% + 40px); right: calc(min(480px, 40vw) + 100px); }

.mls.narrow.cut .mls-people { padding: 0 8vw; gap: 0; }
.mls.narrow.cut .mls-person { flex: 0 0 auto; width: 30vw; }
.mls.narrow.cut .mls-person .plate { max-width: 34vw; }
.mls.cut .mls-scene .sprite.framed > img, .mls.cut .mls-person .body.framed > img { object-fit: contain !important; object-position: center bottom !important; filter: drop-shadow(6px 6px 0 rgba(0,0,0,.35)); }
.mls.cut .mls-contacts .portrait.framed, .mls.cut .mls-workbox .sprite { background: radial-gradient(circle at 50% 35%, var(--c, #555), #111 80%); }
.mls.cut .mls-contacts .portrait.framed > img, .mls.cut .mls-workbox .sprite > img { object-position: center top !important; }


.mls-index a.mls-step { cursor: pointer; }
.mls-index a.mls-step.on { background: var(--yellow); color: var(--ink); }
.mls-index a.mls-step.on span { color: var(--ink); }
.mls-index a.mls-step.locked { opacity: .35; pointer-events: none; }
.mls-index a.mls-step.extra { font-size: 11px; color: var(--muted); }
.mls-index a.mls-step.extra.on { color: var(--ink); }
.mls-index .mls-cast-weeks { margin-top: 14px; }
.mls .mls-where { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--yellow); margin: 0 0 6px; }
.mls .mls-ready { display: grid; grid-template-columns: 110px minmax(0, 1fr) auto; gap: 20px; align-items: center; }
.mls .mls-ready-face { width: 110px; height: 140px; background: #2b2b30; display: grid; place-items: center; overflow: hidden; font-family: var(--display); font-size: 48px; box-shadow: 6px 6px 0 var(--red); }
.mls .mls-ready-face img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls .mls-ready-name { font-family: var(--display); font-size: 40px; line-height: 1; margin: 4px 0 6px; }
.mls .mls-ready-cast { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.mls .mls-ready-cast span { width: 34px; height: 34px; background: #2b2b30; overflow: hidden; display: grid; place-items: center; font-family: var(--display); }
.mls .mls-ready-cast img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls .mls-ready-go { font-size: 26px; padding: 14px 26px; box-shadow: 6px 6px 0 #000; }
.mls .mls-sum-row .face { font-family: var(--display); font-size: 26px; color: var(--yellow); }
.mls .mls-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.mls .mls-chips .chip { font-size: 11px; font-weight: 900; letter-spacing: 1px; padding: 3px 8px; background: #2b2b30; }
.mls .mls-chips .chip.no { background: var(--red); }
@media (max-width: 720px) { .mls .mls-ready { grid-template-columns: 80px minmax(0, 1fr); } .mls .mls-ready-face { width: 80px; height: 100px; } .mls .mls-ready-go { grid-column: 1 / -1; } }
.mls.narrow .mls-ready { grid-template-columns: 80px minmax(0, 1fr); }
.mls.narrow .mls-ready-face { width: 80px; height: 100px; }
.mls.narrow .mls-ready-go { grid-column: 1 / -1; }


.mls-index .mls-presets-btn { justify-self: start; align-self: flex-start; margin: 0 0 10px; }
.mls-presets .mls-preset-save { display: flex; gap: 8px; margin: 12px 0; }
.mls-presets .mls-preset-save input, .mls-preset-row input { flex: 1; min-width: 0; background: #16161a; color: var(--paper); border: 2px solid #3a3a40; padding: 6px 10px; font: inherit; }
.mls-presets .mls-preset-list { overflow: auto; display: grid; gap: 8px; align-content: start; }
.mls-preset-row { display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; gap: 10px; align-items: center; background: #1c1c21; padding: 8px 10px; border-left: 4px solid #3a3a40; }
.mls-preset-row.ask { border-left-color: var(--red); background: #241a1b; margin-bottom: 8px; }
.mls-preset-row .face { width: 38px; height: 38px; background: #2b2b30; overflow: hidden; }
.mls-preset-row .face img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.mls-preset-row b { display: block; font-size: 14px; }
.mls-preset-row small { display: block; font-size: 11px; color: var(--muted); }
.mls-preset-row .tools { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.mls-presets .mls-preset-foot { display: flex; justify-content: flex-end; margin-top: 12px; }
.mls .mls-title-said { position: relative; z-index: 2; display: inline-block; background: var(--yellow); color: var(--ink); font-weight: 900; font-size: 13px; padding: 6px 12px; margin: 0 0 12px; }


.mls-member .mls-traits-row { grid-column: 1 / -1; }
.mls-traits-edit { grid-column: 1 / -1; display: grid; gap: 8px; background: #111114; border-left: 3px solid var(--yellow); padding: 10px 12px; }
.mls-dials { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr)); gap: 6px 26px; }
.mls-dial { display: grid; grid-template-columns: minmax(0, 1fr) minmax(90px, 1.2fr) minmax(0, 1fr) 20px; align-items: center; gap: 8px; font-size: 11px; min-width: 0; }
.mls-dial small { color: var(--muted); line-height: 1.2; }
.mls-dial small:first-of-type { text-align: right; }
.mls-dial small.on { color: var(--yellow); font-weight: 900; }
.mls-dial input[type=range] { width: 100%; accent-color: var(--red); margin: 0; }
.mls-dial .n { font-weight: 900; text-align: right; font-variant-numeric: tabular-nums; }
.mls-trait-sub { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: var(--muted); margin-top: 4px; }
.mls-trait-flags { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.mls-trait-flags .mls-trait-sub { margin: 0 6px 0 0; }
.mls button.mls-trait-flag { background: none; border: 2px solid #3a3a40; color: var(--muted); font-size: 11px; font-weight: 900; padding: 3px 10px; cursor: pointer; }
.mls button.mls-trait-flag:hover { border-color: var(--red); color: var(--paper); }
.mls button.mls-trait-flag.on { background: var(--yellow); border-color: var(--yellow); color: var(--ink); }
.mls-trait-likes { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 5px 22px; }
.mls-trait-likes label { display: grid; grid-template-columns: minmax(0, 1fr) 118px; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; }
.mls-trait-likes select { width: 118px; font-size: 11px; padding: 2px 4px; }
.mls-tone { margin: 0; font-size: 12px; line-height: 1.5; color: #d8d4cb; font-style: italic; }
.mls-tone-note { font-size: 11px; color: var(--muted); }
.mls-cast-set .mls-traits-box { grid-column: 1 / -1; display: grid; gap: 8px; padding: 4px 0 6px; }
.mls-cast-set .mls-traits-box .mls-said { align-self: auto; max-width: none; text-align: left; margin: 0; }
.mls-cast-set .mls-traits-box .row { display: flex; gap: 8px; }
.mls button.mls-set-btn.soft.on { color: var(--ink); background: var(--yellow); border-color: var(--yellow); }
.mls.narrow .mls-dials { grid-template-columns: minmax(0, 1fr); }
.mls.narrow .mls-dial { grid-template-columns: 1fr 1fr 20px; grid-template-areas: "lo hi n" "bar bar bar"; gap: 2px 8px; }
.mls.narrow .mls-dial .n { grid-area: n; }
.mls.narrow .mls-dial small:first-of-type { grid-area: lo; text-align: left; }
.mls.narrow .mls-dial small:last-of-type { grid-area: hi; text-align: right; }
.mls.narrow .mls-dial input[type=range] { grid-area: bar; }


.mls-person.seen-with .plate { border-left-color: var(--red); outline: 3px solid var(--red); outline-offset: 0; }
.mls-person.seen-with .plate span { color: #ff5a5d; }

.mls .mls-keys-veil { position: fixed; inset: 0; z-index: 61; background: rgba(0,0,0,.66); display: grid; place-items: center; padding: 16px; cursor: pointer; }
.mls .mls-keys { position: relative; width: min(460px, 100%); background: var(--paper); color: var(--ink); padding: 0 22px 18px; box-shadow: 12px 12px 0 var(--red); transform: rotate(-1deg); cursor: default; }
.mls .mls-keys.lux { box-shadow: 12px 12px 0 #b8860b; }
.mls .mls-keys.fresh { animation: mls-keys-in .45s cubic-bezier(.2,.85,.25,1.3); }
.mls .mls-keys .photo { position: relative; height: 190px; margin: 0 -22px 12px; background: #26262b center / cover; display: grid; place-items: center; border-bottom: 4px solid var(--ink); overflow: hidden; }
.mls .mls-keys .photo .ic { font-size: 80px; }
.mls .mls-keys .stamp { position: absolute; right: 14px; bottom: 16px; padding: 6px 12px; border: 4px solid var(--red); color: var(--red); background: rgba(244,241,234,.9); font-family: var(--display); font-size: 28px; letter-spacing: 1px; transform: rotate(-9deg); }
.mls .mls-keys .stamp.cash { border-color: #1f7a3a; color: #1f7a3a; }
.mls .mls-keys .stamp.mortgage { border-color: #b8860b; color: #8a6508; }
.mls .mls-keys.fresh .stamp { animation: mls-keys-stamp .5s .35s both cubic-bezier(.2,.9,.3,1.4); }
.mls .mls-keys .key { position: absolute; top: 162px; left: 18px; font-size: 44px; transform-origin: 50% 0; filter: drop-shadow(2px 4px 0 rgba(0,0,0,.35)); }
.mls .mls-keys.fresh .key { animation: mls-keys-swing 1.4s .2s both ease-out; }
.mls .mls-keys .k { font-size: 11px; font-weight: 900; letter-spacing: 3px; color: var(--red); padding-left: 52px; }
.mls .mls-keys h3 { margin: 2px 0 10px; padding-left: 52px; font-family: var(--display); font-weight: 400; font-size: 34px; line-height: 1; }
.mls .mls-keys h3 small { font-size: 18px; color: #555; }
.mls .mls-keys .r { display: flex; justify-content: space-between; gap: 10px; font-size: 14px; font-weight: 700; border-bottom: 1px dashed #bbb; padding: 4px 0; }
.mls .mls-keys .r.good b { color: #1f7a3a; }
.mls .mls-keys p { font-size: 13px; margin: 8px 0 0; } .mls .mls-keys p.warn { color: var(--red-dark); }
.mls .mls-keys .ok { margin-top: 14px; width: 100%; background: var(--ink); color: var(--yellow); border: 0; padding: 10px; font-family: var(--display); font-size: 20px; letter-spacing: 1px; cursor: pointer; }
@keyframes mls-keys-in { from { transform: rotate(-1deg) scale(.7); opacity: 0; } to { transform: rotate(-1deg) scale(1); opacity: 1; } }
@keyframes mls-keys-stamp { from { transform: rotate(-9deg) scale(2.4); opacity: 0; } 60% { opacity: 1; } to { transform: rotate(-9deg) scale(1); opacity: 1; } }
@keyframes mls-keys-swing { 0% { transform: translateY(-60px) rotate(-40deg); opacity: 0; } 30% { opacity: 1; } 55% { transform: translateY(0) rotate(22deg); } 75% { transform: rotate(-12deg); } 90% { transform: rotate(6deg); } 100% { transform: rotate(0); } }
@media (prefers-reduced-motion: reduce) { .mls .mls-keys.fresh, .mls .mls-keys.fresh .stamp, .mls .mls-keys.fresh .key { animation: none; } }


.mls-npc { display: inline-block; margin-left: 6px; padding: 1px 6px; font-family: var(--body, inherit); font-size: 10px; font-weight: 900; line-height: 1.4; letter-spacing: 1px; background: var(--yellow); color: var(--ink); vertical-align: middle; }
.mls-scene .sprite .mls-npc { position: absolute; top: 8px; left: 8px; z-index: 3; margin: 0; }
.mls-npc-about { font-size: 12px; line-height: 1.4; margin: 6px 0 2px; opacity: .85; }
.mls-npc-about small { display: block; margin-top: 6px; font-size: 10px; font-weight: 900; letter-spacing: 1px; opacity: .7; }


.mls-corridor.mansions .hall { background: linear-gradient(180deg, #0f1c33 0%, #2a3f66 42%, #4f6a8a 56%, #22402a 56%, #152a1a 100%); }
.mls .mls-house.mansion { width: clamp(360px, 32vw, 470px); grid-template-rows: 46px clamp(290px, 44vh, 380px); }
.mls .mls-house.mansion .roof { clip-path: none; margin: 0 -10px -1px; background-color: var(--wall); border: 5px solid #141210; border-bottom: 0;
  background-image: linear-gradient(180deg, var(--roof) 0 10px, transparent 10px), repeating-linear-gradient(90deg, transparent 0 14px, #141210 14px 17px, transparent 17px 22px); }
.mls .mls-house.mansion .roof::after { height: 8px; background: var(--roof); }
.mls .mls-house.mansion .front { background-image: repeating-linear-gradient(180deg, transparent 0 30px, rgba(0,0,0,.06) 30px 32px), linear-gradient(180deg, transparent 49%, var(--roof) 49% 51%, transparent 51%); }
.mls .mls-house.mansion .win { width: 15%; height: 30%; top: auto; bottom: 16%; }
.mls .mls-house.mansion .win::before, .mls .mls-house.mansion .win::after { display: none; }
.mls .mls-house.mansion .win.l { left: 6%; }
.mls .mls-house.mansion .win.r { right: 6%; }
.mls .mls-house.mansion .win.u { top: 9%; bottom: auto; height: 27%; border-radius: 40px 40px 0 0; }
.mls .mls-house.mansion .win.u.m { left: 50%; transform: translateX(-50%); width: 20%; height: 20%; top: 12%; }
.mls .mls-house.mansion .col { position: absolute; bottom: 10px; width: 5%; height: 48%; background-color: #f7f3ea; border: 3px solid #141210; border-top-width: 6px;
  background-image: repeating-linear-gradient(90deg, transparent 0 4px, rgba(0,0,0,.12) 4px 6px); }
.mls .mls-house.mansion .col.l { left: 30%; }
.mls .mls-house.mansion .col.r { right: 30%; }
.mls .mls-house.mansion .pediment { position: absolute; bottom: calc(10px + 48%); left: 27%; right: 27%; height: 30px; background: #f7f3ea; border: 3px solid #141210;
  clip-path: polygon(0 100%, 50% 0, 100% 100%); }
.mls .mls-house.mansion .door { width: 26%; height: 38%; border-radius: 60px 60px 0 0; background: linear-gradient(90deg, var(--pc) 0 48%, #141210 48% 52%, var(--pc) 52%); }
.mls .mls-house.mansion .door::before, .mls .mls-house.mansion .door::after { display: none; }
.mls .mls-house.mansion .door em { border-radius: 40px 40px 0 0; top: 4%; height: 18%; left: 12%; right: 12%; }
.mls .mls-house.mansion .lamp { left: auto; right: 22%; bottom: 26%; background: #1e1a16; border-radius: 4px; }
.mls .mls-house.mansion .lamp.l2 { right: auto; left: 22%; }
.mls .mls-house.mansion.lit .lamp { background: #ffe07a; box-shadow: 0 0 20px 5px #ffb84d; }
.mls .mls-house.mansion .plaque { top: auto; bottom: calc(10px + 48% + 36px); background: linear-gradient(180deg, #f3dc92, #b8913a); }
.mls .mls-house.mansion .lawn { position: absolute; bottom: -18px; left: -24px; right: -24px; height: 20px; background-color: #3e7a3a; border: 3px solid #141210; border-radius: 6px;
  background-image: repeating-linear-gradient(90deg, transparent 0 18px, rgba(0,0,0,.1) 18px 20px); }
.mls .mls-house.mansion .fence { position: absolute; bottom: -4px; width: 34%; height: 44px; border-top: 4px solid #141210;
  background: repeating-linear-gradient(90deg, #141210 0 3px, transparent 3px 12px); }
.mls .mls-house.mansion .fence.l { left: -18px; }
.mls .mls-house.mansion .fence.r { right: -18px; }
.mls .mls-house.mansion .bush { width: 14%; height: 46px; bottom: 6px; border-radius: 50% 50% 10px 10px; }
.mls .mls-house.mansion .bush.l { left: 17%; }
.mls .mls-house.mansion .bush.r { right: 17%; }
.mls .mls-house.mansion .step { width: 34%; height: 14px; background: #e8e2d6; }




.mls-corridor.tower { --foot: 78px; --lift: 56px; }
.mls-corridor.tower .row { padding-bottom: var(--lift); box-sizing: border-box; }
.mls-corridor.tower .hall { background-color: #16120f;
  background-image:
    linear-gradient(180deg, transparent calc(100% - var(--lift) - var(--foot) - 3px), #b8913a calc(100% - var(--lift) - var(--foot) - 3px) calc(100% - var(--lift) - var(--foot)), transparent calc(100% - var(--lift) - var(--foot))),
    repeating-linear-gradient(90deg, transparent 0 118px, rgba(184,145,58,.3) 118px 120px),
    linear-gradient(180deg, #1c1510 0%, #2e2118 calc(100% - var(--lift) - var(--foot)), transparent calc(100% - var(--lift) - var(--foot))),
    repeating-linear-gradient(160deg, #141110 0 60px, #1d1916 60px 62px, #171412 62px 130px);
  background-size: 100% 100%, 100% calc(100% - var(--lift) - var(--foot)), 100% 100%, 100% 100%; background-repeat: no-repeat, repeat-x, no-repeat, no-repeat; }
.mls-corridor.tower .mls-door .base { height: var(--foot); box-sizing: border-box; align-content: start; background: transparent; border-top: 0; }
.mls-corridor.tower .mls-door.stranger { opacity: 1; filter: brightness(.6) saturate(.6); }

.mls-corridor.tower .hall.has-pic { background-size: cover; background-repeat: no-repeat; background-position: center; }

.mls-corridor.tower .hall.has-pic .mls-door .base { height: auto; background: #1a120b; border-top: 3px solid #b8913a; }
.mls-corridor.tower .mls-door .leaf { background: linear-gradient(180deg, #4a3222, #24170e); border-color: #b8913a; box-shadow: inset 0 0 0 4px #24170e, inset 0 0 0 6px #8a6a2a; }
.mls-corridor.tower .mls-door .leaf::after { background: #f0cf78; width: 8px; height: 30px; border-radius: 4px; }
.mls-corridor.tower .mls-door .no { color: #e8c77a; font-size: 14px; letter-spacing: 3px; }
.mls-corridor.tower .mls-door .lit { background: #2a1d12; border-color: #8a6a2a; border-radius: 30px 30px 4px 4px; }
.mls-corridor.tower .mls-door.in .lit { background: #ffe29a; box-shadow: 0 0 26px #ffc56b; }
.mls-corridor.luxe .top h1 { color: #f0cf78; }
.mls-corridor.luxe .top .sub { background: #b8913a; color: #1a120b; }

.mls-corridor.mansions .row { gap: clamp(70px, 7vw, 130px); }


.mls .mls-party-next { display: flex; align-items: center; gap: 10px; justify-content: space-between; background: #ff5c8a; color: var(--ink); padding: 8px 12px; margin: 6px 0 10px; transform: rotate(-.6deg); }
.mls .mls-party-next b { display: block; font-family: var(--display); font-weight: 400; font-size: 18px; letter-spacing: 1px; }
.mls .mls-party-next small { display: block; font-size: 11px; font-weight: 700; }
.mls .mls-party-next button { background: var(--ink); color: var(--paper); border: 0; padding: 8px 12px; font: inherit; font-weight: 900; font-size: 12px; letter-spacing: 1px; cursor: pointer; white-space: nowrap; }
.mls .mls-party-meter { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center; background: #141417; padding: 8px 12px; margin: 4px 0 10px; }
.mls .mls-party-meter b { font-size: 11px; letter-spacing: 2px; }
.mls .mls-party-meter .bar { height: 10px; background: #2a2a30; border: 2px solid var(--paper); }
.mls .mls-party-meter .bar i { display: block; height: 100%; background: #b7892a; transition: width .4s; }
.mls .mls-party-meter.great .bar i { background: #2bb3a3; }
.mls .mls-party-meter.flat .bar i { background: var(--red); }
.mls .mls-party-rooms { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; margin-bottom: 12px; }
.mls .mls-party-rooms .room { position: relative; display: grid; gap: 4px; justify-items: start; text-align: left; background: var(--paper); color: var(--ink); border: 3px solid var(--ink); padding: 8px 8px 10px; font: inherit; cursor: pointer; }
.mls .mls-party-rooms .room .ic { font-size: 22px; }
.mls .mls-party-rooms .room b { font-family: var(--display); font-weight: 400; font-size: 15px; letter-spacing: 1px; }
.mls .mls-party-rooms .room .faces { display: flex; flex-wrap: wrap; min-height: 26px; }
.mls .mls-party-rooms .room .faces .mls-news-face + .mls-news-face { margin-left: -6px; }
.mls .mls-party-rooms .room .faces small { font-size: 11px; color: #6a6660; }
.mls .mls-party-rooms .room.here { background: var(--yellow); cursor: default; box-shadow: 4px 4px 0 var(--red); }
.mls .mls-party-rooms .room em { position: absolute; top: -9px; right: 6px; background: var(--ink); color: var(--yellow); font-style: normal; font-size: 9px; font-weight: 900; letter-spacing: 1px; padding: 2px 6px; }
.mls .mls-party-next.mls-neighbour { background: var(--yellow); transform: rotate(.5deg); }
.mls .mls-party-next.mls-neighbour button small { display: block; font-size: 10px; font-weight: 700; color: var(--yellow); }
.mls .mls-party-next.mls-bell { background: #ff5c8a; justify-content: flex-start; }
.mls .mls-party-next.mls-bell > div { flex: 1; }
.mls .mls-party-next.mls-bell .faces { display: flex; }
.mls .mls-party-next.mls-bell .faces .mls-news-face + .mls-news-face { margin-left: -8px; }


.mls-memwith { display: flex; gap: 6px; flex-wrap: wrap; margin: 0 0 10px; }
.mls-memwith button { border: 0; background: rgba(0,0,0,.08); color: inherit; font: inherit; font-size: 11px; font-weight: 900; letter-spacing: 1px; padding: 6px 10px; cursor: pointer; }
.mls-memwith button.on { background: #0b0b0d; color: #f4f1ea; }


.mls-cut-veil { position: absolute; inset: 0; z-index: 45; background: rgba(5,5,8,.72); display: grid; place-items: center; padding: 16px; }
.mls-cut { width: min(560px, 100%); background: #0b0b0d; color: #f4f1ea; box-shadow: 10px 10px 0 #b0356b; padding: 20px 22px 18px; }
.mls-cut .kicker { font-size: 11px; font-weight: 900; letter-spacing: 4px; color: #ff7fb0; }
.mls-cut h2 { font-family: Anton, sans-serif; font-weight: 400; font-size: 34px; margin: 4px 0 10px; letter-spacing: 1px; }
.mls-cut .faces { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
.mls-cut .faces .f { width: 58px; height: 58px; border-radius: 50%; overflow: hidden; background: #333; border: 3px solid #f4f1ea; }
.mls-cut .faces .f img { width: 100%; height: 100%; object-fit: cover; }
.mls-cut .faces .amp { font-weight: 900; color: #ff7fb0; }
.mls-cut .where { font-size: 13px; color: #cfcac2; margin-bottom: 4px; }
.mls-cut .note { font-size: 12px; color: #8d8a85; margin: 8px 0 14px; }
.mls-cut .row { display: flex; gap: 8px; flex-wrap: wrap; }
.mls-cut .row button { border: 0; padding: 10px 14px; font: inherit; font-weight: 900; letter-spacing: 1px; cursor: pointer; }
.mls-cut .row .main { background: #ffe14d; color: #000; }
.mls-cut .row .plain { background: #26262b; color: #f4f1ea; }
.mls-cut .choices { display: grid; gap: 10px; margin-top: 12px; }
.mls-cut .choice { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mls-cut .choice button { border: 0; padding: 10px 14px; font: inherit; font-weight: 900; letter-spacing: 1px; cursor: pointer; min-width: 170px; }
.mls-cut .choice .main { background: #ffe14d; color: #000; }
.mls-cut .choice .alt { background: #f4f1ea; color: #000; }
.mls-cut .choice .plain { background: #26262b; color: #f4f1ea; }
.mls-cut .choice small { font-size: 12px; color: #cfcac2; flex: 1 1 180px; }
.mls-modrow { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,.12); }
.mls-modrow .faces { display: flex; }
.mls-modrow .faces > * + * { margin-left: -12px; }
.mls-modrow small { display: block; opacity: .7; }
.mls-modrow .fresh { background: #b0356b; color: #fff; font-size: 10px; font-weight: 900; letter-spacing: 1px; padding: 2px 6px; margin-left: 6px; }
.mls-modrow button { border: 0; background: #0b0b0d; color: #f4f1ea; font: inherit; font-weight: 900; font-size: 11px; letter-spacing: 1px; padding: 8px 12px; cursor: pointer; }
.mls-modrow button.again { background: transparent; color: inherit; outline: 2px solid currentColor; outline-offset: -2px; }


.mls-broken { display: grid; place-content: center; gap: 12px; min-height: 60vh; padding: 24px 16px; text-align: center; background: var(--ink); color: var(--paper); }
.mls-broken h2 { margin: 0; font-family: var(--display, inherit); letter-spacing: 1px; }
.mls-broken p { margin: 0; color: var(--muted); max-width: 420px; }
.mls-broken .mls-btn { justify-self: center; }
`;

export { STYLES };
