var os=Object.defineProperty;var ss=(e,a,o)=>a in e?os(e,a,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[a]=o;var We=(e,a,o)=>ss(e,typeof a!="symbol"?a+"":a,o);var Na=globalThis.__MARINARA_HOST__,q=Na&&Na.version===1&&Na.modules?Na.modules.react:void 0;if(!q)throw new Error("Marinara Engine does not provide react; this package needs capability API 1.341 or newer.");var gl=q.Activity,xl=q.Children,Ll=q.Component,Il=q.Fragment,bl=q.Profiler,Cl=q.PureComponent,Sl=q.StrictMode,vl=q.Suspense,yl=q.ViewTransition,kl=q.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,wl=q.__COMPILER_RUNTIME,El=q.act,Pl=q.addTransitionType,Al=q.cache,Rl=q.cacheSignal,Tl=q.captureOwnerStack,Ml=q.cloneElement,Bl=q.createContext,ha=q.createElement,Nl=q.createRef,Dl=q.default,Da=q.forwardRef,Fl=q.isValidElement,Ol=q.lazy,ql=q.memo,Hl=q.startTransition,Ul=q.unstable_useCacheRefresh,zl=q.use,_l=q.useActionState,qe=q.useCallback,Vl=q.useContext,Gl=q.useDebugValue,Wl=q.useDeferredValue,G=q.useEffect,$l=q.useEffectEvent,or=q.useId,Xl=q.useImperativeHandle,jl=q.useInsertionEffect,Kl=q.useLayoutEffect,ht=q.useMemo,Jl=q.useOptimistic,Yl=q.useReducer,oe=q.useRef,f=q.useState,Zl=q.useSyncExternalStore,Ql=q.useTransition,ei=q.version;var Fa=globalThis.__MARINARA_HOST__,ga=Fa&&Fa.version===1&&Fa.modules?Fa.modules["react-dom/client"]:void 0;if(!ga)throw new Error("Marinara Engine does not provide react-dom/client; this package needs capability API 1.341 or newer.");var sr=ga.createRoot,ti=ga.default,ri=ga.hydrateRoot,oi=ga.version;var lr=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),ls=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,o,s)=>s?s.toUpperCase():o.toLowerCase()),gt=e=>{let a=ls(e);return a.charAt(0).toUpperCase()+a.slice(1)},Oa=(...e)=>e.filter((a,o,s)=>!!a&&a.trim()!==""&&s.indexOf(a)===o).join(" ").trim(),ir=e=>{for(let a in e)if(a.startsWith("aria-")||a==="role"||a==="title")return!0};var dr={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var nr=Da(({color:e="currentColor",size:a=24,strokeWidth:o=2,absoluteStrokeWidth:s,className:l="",children:r,iconNode:i,...n},p)=>ha("svg",{ref:p,...dr,width:a,height:a,stroke:e,strokeWidth:s?Number(o)*24/Number(a):o,className:Oa("lucide",l),...!r&&!ir(n)&&{"aria-hidden":"true"},...n},[...i.map(([x,u])=>ha(x,u)),...Array.isArray(r)?r:[r]]));var ie=(e,a)=>{let o=Da(({className:s,...l},r)=>ha(nr,{ref:r,iconNode:a,className:Oa(`lucide-${lr(gt(e))}`,`lucide-${e}`,s),...l}));return o.displayName=gt(e),o};var is=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],$e=ie("arrow-down",is);var ds=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],Xe=ie("arrow-up",ds);var ns=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],xa=ie("check",ns);var us=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],La=ie("chevron-down",us);var cs=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],Ae=ie("chevron-left",cs);var fs=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],je=ie("chevron-right",fs);var ms=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Ia=ie("plus",ms);var ps=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],ba=ie("refresh-cw",ps);var hs=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],be=ie("square-pen",hs);var gs=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],Ca=ie("trash-2",gs);var xs=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ue=ie("x",xs);var Lt="/api",Ls="/card-editor",ur="x-marinara-csrf";var Is="marinara_admin_secret";function It(e){let a=e.status;return a==="apply"||a==="needs-confirmation"}var Sa=class extends Error{constructor(o,s,l){super(s);We(this,"status");We(this,"payload");this.name="CardEditorApiError",this.status=o,this.payload=l}};function bt(){if(typeof window>"u")return{};try{let e=window.localStorage.getItem(Is)?.trim();return e?{"X-Admin-Secret":e}:{}}catch{return{}}}function Ct(e,a){if(!e||typeof e!="object"||Array.isArray(e))return a;let o=e;if(typeof o.error=="string"&&o.error.trim())return o.error.trim();if(o.error&&typeof o.error=="object"&&!Array.isArray(o.error)){let s=o.error.message;if(typeof s=="string"&&s.trim())return s.trim()}return typeof o.message=="string"&&o.message.trim()?o.message.trim():a}async function de(e,a="GET",o,s){let l=new Headers(bt());a!=="GET"&&l.set(ur,"1"),o!==void 0&&l.set("Content-Type","application/json");let r=await fetch(`${Lt}${Ls}${e}`,{method:a,headers:l,signal:s,cache:"no-store",credentials:"same-origin",...o===void 0?{}:{body:JSON.stringify(o)}});if(!r.ok){let i=await r.json().catch(()=>null);throw new Sa(r.status,Ct(i,r.statusText),i)}if(r.status!==204)return r.json()}function He(e,a=""){return`/sessions/${encodeURIComponent(e)}${a}`}function Ke(e,a,o){return He(e,`/items/${encodeURIComponent(a)}${o}`)}function cr(e){return de("/sessions","POST",e)}function fr(e,a,o,s){return de(Ke(e,a,"/split"),"POST",{decision:o,...s?{names:s}:{}})}function mr(e){return de(He(e,"/phase2"),"POST",{})}function sa(e){return de("/schemas","GET",void 0,e)}function pr(e){return de(`/schemas/${encodeURIComponent(e.id)}`,"PUT",{name:e.name,text:e.text})}function hr(e){return de(`/schemas/${encodeURIComponent(e)}`,"DELETE")}function gr(e){return de("/agent-config","GET",void 0,e)}function qa(e){return de("/settings","GET",void 0,e)}function xr(e){return de("/settings","PUT",e)}function Ha(e){return de("/sessions","GET",void 0,e)}function la(e,a){return de(He(e),"GET",void 0,a)}function Ua(e){return de(He(e,"/cancel"),"POST")}function za(e){return de(He(e,"/rerun"),"POST")}function va(e,a){return de(Ke(e,a,"/retry"),"POST")}function Lr(e,a){return de(Ke(e,a,"/cancel"),"POST")}function Ir(e,a,o){return de(Ke(e,a,"/edit-retry"),"POST",o)}function br(e,a,o){return de(Ke(e,a,"/repair"),"POST",{rawOutput:o})}function St(e,a,o){return de(Ke(e,a,"/verdict"),"POST",o)}function _a(e,a,o){return de(Ke(e,a,"/apply-result"),"POST",{results:o})}function Cr(e){return de(He(e,"/duplicate-applied"),"POST")}function Sr(e,a){return de(He(e,"/combine"),"POST",a)}function Va(e,a={}){let o=a.force?"?force=true":"";return de(He(e,o),"DELETE")}async function ia(e,a){let o=await fetch(`${Lt}${e}`,{headers:new Headers(bt()),signal:a,cache:"no-store",credentials:"same-origin"});if(!o.ok){let s=await o.json().catch(()=>null);throw new Sa(o.status,Ct(s,o.statusText),s)}return o.json()}function vt(e){try{let a=JSON.parse(e.data);if(a&&typeof a=="object"&&!Array.isArray(a)){let o=a.name;if(typeof o=="string"&&o.trim())return o}}catch{}return""}async function vr(e){let a=await ia("/connections",e);return Array.isArray(a)?a.filter(o=>o&&typeof o.id=="string"&&typeof o.name=="string"&&o.provider!=="image_generation"&&o.provider!=="video_generation"):[]}async function yr(e,a){let o=await ia(`/characters/${encodeURIComponent(e)}`,a),s=typeof o?.id=="string"&&o.id?o.id:e;return{id:s,name:vt(o)||s,avatarPath:typeof o?.avatarPath=="string"&&o.avatarPath?o.avatarPath:null}}var bs=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions"];function xt(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:{}}function oa(e){return typeof e=="string"?e:""}function Cs(e,a){let o=(()=>{try{return xt(JSON.parse(typeof e?.data=="string"?e.data:"{}"))}catch{return{}}})(),s=xt(o.extensions),l={name:oa(o.name),backstory:oa(s.backstory),appearance:oa(s.appearance),...Object.fromEntries(bs.map(i=>[i,oa(o[i])]))},r=typeof e?.id=="string"&&e.id?e.id:a;return{id:r,name:l.name.trim()||r,avatarPath:typeof e?.avatarPath=="string"&&e.avatarPath?e.avatarPath:null,fields:l}}async function Ue(e,a){let o=await ia(`/characters/${encodeURIComponent(e)}`,a);return Cs(o,e)}function yt(e){let{fields:a}=e;return{name:a.name,description:a.description,personality:a.personality,backstory:a.backstory,appearance:a.appearance,system_prompt:a.system_prompt}}async function kr(e,a){let o=await ia(`/lorebooks/${encodeURIComponent(e)}/entries`,a);return Array.isArray(o)?o.map(s=>{let l=xt(s);return{name:oa(l.name),content:oa(l.content),enabled:l.enabled!==!1&&l.enabled!=="false"}}):[]}async function Ga(e,a,o){let s=new Headers(bt());s.set(ur,"1"),o!==void 0&&s.set("Content-Type","application/json");let l=await fetch(`${Lt}${e}`,{method:a,headers:s,cache:"no-store",credentials:"same-origin",...o===void 0?{}:{body:JSON.stringify(o)}});if(!l.ok){let r=await l.json().catch(()=>null);throw new Sa(l.status,Ct(r,l.statusText),r)}return l.json()}function kt(e,a,o){return Ga(`/characters/${encodeURIComponent(e)}`,"PATCH",{data:a,versionSource:o.versionSource,versionReason:o.versionReason})}function wr(e){return Ga(`/characters/${encodeURIComponent(e)}/duplicate`,"POST")}function Er(e,a){return Ga(`/characters/${encodeURIComponent(e)}/avatar`,"POST",{avatar:a,filename:"card-editor-composite.png"})}function Pr(e){return Ga("/characters","POST",{data:e})}function Ar(e,a){let o=new URLSearchParams({limit:String(e.limit??50),offset:String(e.offset??0),sort:"name-asc"}),s=e.search?.trim();return s&&o.set("search",s),ia(`/characters/catalog?${o.toString()}`,a)}async function Rr(e){let a=await ia("/lorebooks",e);return Array.isArray(a)?a.filter(o=>!!o&&typeof o.id=="string"&&typeof o.name=="string"):[]}function Wa(e,a){let o=a.prefix?.trim()?a.prefix:void 0,s=a.suffix?.trim()?a.suffix:void 0,l=a.removePrefix?.trim()?a.removePrefix:void 0,r=a.removeSuffix?.trim()?a.removeSuffix:void 0,i=e;return l&&i.toLowerCase().startsWith(l.toLowerCase())&&(i=i.slice(l.length)),r&&i.toLowerCase().endsWith(r.toLowerCase())&&(i=i.slice(0,-r.length)),i=i.trim(),i||(i=e),`${o??""}${i}${s??""}`}var Ss=/&#(?:(x|X)([0-9a-fA-F]+)|([0-9]+));/g,vs=[[/&lt;/g,"<"],[/&gt;/g,">"],[/&quot;/g,'"'],[/&apos;/g,"'"],[/&nbsp;/g,"\xA0"]];function Re(e){let o=e.replace(Ss,(s,l,r,i)=>{let n=l?Number.parseInt(r,16):Number(i);if(!Number.isInteger(n)||n<=0||n>1114111)return s;try{return String.fromCodePoint(n)}catch{return s}});for(let[s,l]of vs)o=o.replace(s,l);return o.replace(/&amp;/g,"&")}var Tr={_meta:{locale:"en",direction:"ltr"},"cardEditor.title":"Card Editor","cardEditor.panel.empty":"No bulk editing sessions yet.","cardEditor.error.network":"Could not reach Card Editor.","cardEditor.action.open":"Card Editor","cardEditor.dialog.title":"Bulk Card Editor","cardEditor.dialog.close":"Close","cardEditor.dialog.draft.restored":"Restored your unsent settings and notes from last time.","cardEditor.dialog.draft.discard":"Start fresh","cardEditor.dialog.presets.title":"Presets","cardEditor.dialog.presets.name":"Preset name","cardEditor.dialog.presets.namePlaceholder":"Type a new name or pick a saved preset","cardEditor.dialog.presets.hint":"Presets save every setting below except the targets and their notes.","cardEditor.dialog.presets.load":"Load","cardEditor.dialog.presets.save":"Save","cardEditor.dialog.presets.overwrite":"Overwrite","cardEditor.dialog.presets.delete":"Delete","cardEditor.dialog.targets.title":"Targets \xB7 {{count}} characters","cardEditor.dialog.targets.loading":"Loading selected cards\u2026","cardEditor.dialog.targets.empty":"No targets left \u2014 close and select at least one character.","cardEditor.dialog.targets.loadFailed":"card could not be loaded","cardEditor.dialog.targets.notePlaceholder":"Focus on backstory\u2026","cardEditor.dialog.targets.noteLabel":"Note for {{name}}","cardEditor.dialog.targets.styleLabel":"Style override for {{name}}","cardEditor.dialog.targets.styleSession":"\u2014 use session style \u2014","cardEditor.dialog.targets.styleNone":"None","cardEditor.dialog.targets.unloadableBlock":"Remove cards that could not be loaded before dispatching.","cardEditor.dialog.targets.remove":"Remove {{name}}","cardEditor.dialog.search.placeholder":"Search characters\u2026","cardEditor.dialog.search.loading":"Searching\u2026","cardEditor.dialog.search.noResults":"No characters match.","cardEditor.dialog.search.error":"Characters could not be loaded.","cardEditor.dialog.model.title":"Model","cardEditor.dialog.model.connection":"Connection","cardEditor.dialog.model.connectionDefault":"\u2014 agent default \u2014","cardEditor.dialog.model.connectionsLoading":"Loading connections\u2026","cardEditor.dialog.model.connectionsError":"Connections could not be loaded.","cardEditor.dialog.model.preset":"Prompt preset","cardEditor.dialog.model.presetStandard":"Standard rewrite","cardEditor.dialog.model.presetStrict":"Strict surgical","cardEditor.dialog.model.presetRebalance":"Field rebalancing","cardEditor.dialog.model.presetXmlSimple":"XML \xB7 Simple","cardEditor.dialog.model.presetXmlComplex":"XML \xB7 Complex","cardEditor.dialog.model.presetCustom":"Custom\u2026","cardEditor.dialog.model.customTemplate":"Custom template","cardEditor.dialog.model.customTemplateHint":"The full prompt template sent for every card. Choosing Custom prefills this field with the current preset's body.","cardEditor.dialog.instructions.title":"Instructions & references","cardEditor.dialog.instructions.global":"Global instruction","cardEditor.dialog.instructions.globalPlaceholder":"Applies to every card \u2014 e.g. tighten prose, remove meta commentary\u2026","cardEditor.dialog.instructions.behavior":"Behavior character","cardEditor.dialog.instructions.behaviorHint":"One card whose behavior, judgment, and writing style guide how edits are written. The directive and notes still decide what changes.","cardEditor.dialog.instructions.behaviorNone":"None","cardEditor.dialog.instructions.lorebooks":"Global lorebooks","cardEditor.dialog.instructions.lorebooksHint":"Reference context applied to every card.","cardEditor.dialog.instructions.lorebooksFilter":"Filter lorebooks\u2026","cardEditor.dialog.instructions.lorebooksLoading":"Loading lorebooks\u2026","cardEditor.dialog.instructions.lorebooksEmpty":"No lorebooks in the library.","cardEditor.dialog.instructions.lorebooksNoneMatch":"No lorebooks match the filter.","cardEditor.dialog.instructions.lorebooksError":"Lorebooks could not be loaded.","cardEditor.dialog.processing.title":"Processing","cardEditor.dialog.processing.modeIndividual":"One agent per card","cardEditor.dialog.processing.modeBatched":"Batched \u2014 XML, N cards per call","cardEditor.dialog.processing.batchSize":"Batch size","cardEditor.dialog.processing.providerRetries":"Provider retries","cardEditor.dialog.processing.refusalRetries":"Refusal retries","cardEditor.dialog.processing.concurrency":"Concurrency","cardEditor.dialog.processing.rebalance":"Rebalance field content","cardEditor.dialog.processing.rebalanceHint":"Splits content into Description / Personality / Backstory / Appearance / Scenario.","cardEditor.dialog.processing.completionMode":"On completion","cardEditor.dialog.processing.completionAsk":"Ask (default)","cardEditor.dialog.processing.completionApply":"Always apply in place","cardEditor.dialog.processing.completionDuplicate":"Always duplicate","cardEditor.dialog.processing.completionCaption":"Apply mode holds stale cards for review instead of overwriting them. Duplicates use this session's prefix or suffix.","cardEditor.dialog.processing.autoDisabledNote":"The Card Editor's bulk settings require review, so auto-approve and on-completion writes are disabled here.","cardEditor.dialog.processing.overflowCaption":"On context overflow the failed batch is split and re-dispatched automatically until single-card calls remain.","cardEditor.dialog.saving.title":"Saving","cardEditor.dialog.saving.confirm":"In-place \u2014 confirm each card","cardEditor.dialog.saving.auto":"In-place \u2014 auto-approve (saves each character's latest revision)","cardEditor.dialog.saving.duplicate":"Duplicate \u2014 apply to copies","cardEditor.dialog.saving.duplicatePrefix":"Name prefix","cardEditor.dialog.saving.duplicatePrefixPlaceholder":"Prefix for the copy names","cardEditor.dialog.saving.duplicatePrefixHint":"Both affixes apply: copies are named prefix + name + suffix. Blank boxes are ignored.","cardEditor.dialog.saving.duplicateSuffix":"Name suffix","cardEditor.dialog.saving.duplicateSuffixPlaceholder":"Suffix for the copy names","cardEditor.dialog.saving.duplicateRemoveGroup":"Remove from name","cardEditor.dialog.saving.duplicateRemovePrefix":"Remove prefix","cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder":"Strip this from the start of the copy name","cardEditor.dialog.saving.duplicateRemoveSuffix":"Remove suffix","cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder":"Strip this from the end of the copy name","cardEditor.dialog.saving.duplicateNamePreview":"Copy name: {{name}}","cardEditor.dialog.saving.combined":"Combined \u2014 create one new card","cardEditor.dialog.saving.combinedName":"Combined card name","cardEditor.dialog.saving.combinedNamePlaceholder":"The one new card's name","cardEditor.dialog.saving.combinedCaption":"Each character's generated XML document is joined into ONE new card's description \u2014 no per-card writes.","cardEditor.dialog.saving.combinedNameRequired":"Enter a name for the combined card before dispatching.","cardEditor.dialog.saving.reviewRequiredHint":"The bulk settings require review, so auto-approve is unavailable \u2014 dispatches wait for your confirmation.","cardEditor.dialog.saving.caption":"In-place always writes a new revision. Auto-approve holds back cards that genuinely changed mid-run for review. Duplicates are renamed by the affixes above \u2014 prefix, suffix, and removals combine. Combined concatenates each generated XML document into one new card.","cardEditor.dialog.estimate":"Batched \xD7{{batch}} \u2192 {{batchedCalls}} calls \xB7 individual \u2192 {{individualCalls}} calls","cardEditor.dialog.dispatch":"Dispatch","cardEditor.dialog.dispatching":"Dispatching\u2026","cardEditor.dialog.dispatchError":"Could not create the session: {{message}}","cardEditor.panel.title":"Bulk runs","cardEditor.panel.openWorkspace":"Open Card Editor workspace","cardEditor.panel.summaryCounts":"{{active}} active \xB7 {{recent}} past sessions","cardEditor.panel.titleWithAgent":"Bulk runs \u2014 {{agent}}","cardEditor.panel.refresh":"Refresh","cardEditor.panel.loading":"Loading sessions\u2026","cardEditor.panel.loadError":"Sessions could not be loaded.","cardEditor.panel.activeTitle":"Active","cardEditor.panel.historyTitle":"History","cardEditor.panel.progress":"{{done}} of {{total}} cards","cardEditor.panel.modeIndividual":"individual","cardEditor.panel.modeBatched":"batched \xD7{{size}}","cardEditor.panel.saveMode.confirm":"confirm each card","cardEditor.panel.saveMode.auto":"auto-approve","cardEditor.panel.saveMode.duplicate":"duplicate","cardEditor.panel.saveMode.combined":"combined","cardEditor.panel.completionMode.ask":"on completion \xB7 ask","cardEditor.panel.completionMode.apply":"on completion \xB7 apply","cardEditor.panel.completionMode.duplicate":"on completion \xB7 duplicate","cardEditor.panel.enforcementProgress":"Applying completion outcome \xB7 {{done}} of {{total}} cards","cardEditor.panel.runAgain":"Run again","cardEditor.panel.live.batch":"Running batch {{index}} of {{count}}","cardEditor.panel.live.batchRetry":" \xB7 attempt {{attempt}}","cardEditor.panel.live.items":"Editing {{running}} of {{total}} cards","cardEditor.panel.live.queued":"{{count}} cards queued","cardEditor.panel.live.settling":"Finishing up\u2026","cardEditor.panel.cancel":"Cancel","cardEditor.panel.delete":"Delete","cardEditor.panel.deleteConfirm":"Delete this session? Its results are lost.","cardEditor.panel.deleteConfirmActive":"Still running \u2014 cancel it and delete?","cardEditor.panel.deleteYes":"Delete","cardEditor.panel.deleteYesActive":"Cancel & delete","cardEditor.panel.deleteNo":"Keep","cardEditor.panel.interruptedNotice":"The server restarted mid-run, so this session was interrupted. Failed items can still be retried from this session.","cardEditor.panel.statsFailed":"{{count}} failed","cardEditor.panel.sessionStatus.active":"active","cardEditor.panel.sessionStatus.completed":"completed","cardEditor.panel.sessionStatus.canceled":"canceled","cardEditor.panel.sessionStatus.interrupted":"interrupted","cardEditor.panel.back":"Back to sessions","cardEditor.panel.status.queued":"queued","cardEditor.panel.status.running":"running","cardEditor.panel.status.succeeded":"succeeded","cardEditor.panel.status.awaitingReview":"awaiting review","cardEditor.panel.status.needsReview":"needs review","cardEditor.panel.status.applied":"applied","cardEditor.panel.status.duplicated":"duplicated","cardEditor.panel.status.rejected":"rejected","cardEditor.panel.status.failedProvider":"failed \xB7 provider","cardEditor.panel.status.failedRefusal":"failed \xB7 refusal","cardEditor.panel.status.failedParse":"failed \xB7 parse","cardEditor.panel.status.canceled":"canceled","cardEditor.panel.status.interrupted":"interrupted","cardEditor.panel.status.unknown":"unknown","cardEditor.panel.detail.loading":"Loading session\u2026","cardEditor.panel.detail.loadError":"The session could not be loaded.","cardEditor.panel.detail.cancelAll":"Cancel all","cardEditor.panel.detail.rerunFailed":"Rerun all failed ({{count}})","cardEditor.panel.detail.reviewQueue":"Review queue ({{count}})","cardEditor.panel.detail.delete":"Delete session","cardEditor.panel.detail.summary":"{{fields}} fields \xB7 +{{added}}/\u2212{{removed}} words","cardEditor.panel.detail.noChanges":"no changes proposed","cardEditor.panel.detail.copyCreated":"copy: {{id}}","cardEditor.panel.detail.combine":"Create combined card ({{count}})","cardEditor.panel.detail.combinePartialConfirm":"{{count}} of {{total}} cards were collected. Create the combined card from the collected cards only?","cardEditor.panel.detail.combineYes":"Combine {{count}}","cardEditor.panel.detail.combineNo":"Cancel","cardEditor.panel.detail.combinedCreated":"combined card created: {{id}}","cardEditor.panel.detail.duplicateApplied":"Duplicate applied cards ({{count}})","cardEditor.panel.detail.duplicateAppliedPartial":"{{failed}} of {{total}} cards could not be duplicated \u2014 retry from the item row.","cardEditor.panel.detail.autoApplyError":"Auto-apply failed for {{name}}: {{message}}","cardEditor.panel.detail.actionError":"Action failed: {{message}}","cardEditor.panel.detail.pagePrev":"Previous page","cardEditor.panel.detail.pageNext":"Next page","cardEditor.panel.detail.page":"Page {{page}} of {{pages}}","cardEditor.panel.action.review":"Review","cardEditor.panel.action.rerun":"Rerun","cardEditor.panel.action.editRetry":"Edit & retry","cardEditor.panel.action.fixJson":"Fix JSON","cardEditor.panel.action.inspect":"Inspect","cardEditor.panel.action.cancelItem":"Cancel","cardEditor.panel.settings.title":"Bulk settings","cardEditor.panel.settings.maxParallelAgents":"Max parallel agents","cardEditor.panel.settings.maxParallelAgentsHint":"Upper bound on concurrent calls in bulk runs. 0 follows the connection's parallel job limit.","cardEditor.panel.settings.disableAutoVerdicts":"Require review (disable auto-approve / auto-apply)","cardEditor.panel.settings.disableAutoVerdictsHint":"Bulk dispatches always wait for your confirmation; auto-approve and on-completion apply/duplicate are turned off.","cardEditor.panel.settings.save":"Save settings","cardEditor.panel.settings.saved":"Saved.","cardEditor.queue.title":"Review changes","cardEditor.queue.close":"Back to the session","cardEditor.queue.position":"{{index}} of {{count}}","cardEditor.queue.empty":"Nothing left to review.","cardEditor.queue.dotsLabel":"Review progress","cardEditor.queue.dotLabel":"{{name}}: {{status}}","cardEditor.queue.chips.fields":"{{count}} fields","cardEditor.queue.chips.added":"+{{count}} words","cardEditor.queue.chips.removed":"\u2212{{count}} words","cardEditor.queue.chips.fieldWords":"{{count}} words","cardEditor.queue.duplicateNote":"Approving copies the current card and applies these fields to the copy.","cardEditor.queue.hiddenLines":"\u22EF {{count}} unchanged lines \u22EF","cardEditor.queue.miniRowWords":"+{{added}}/\u2212{{removed}} words","cardEditor.queue.field.expand":"show all hunks \u2192","cardEditor.queue.staleTitle":"{{count}} fields changed since the run \u2014 applying replaces them.","cardEditor.queue.staleApply":"Apply anyway","cardEditor.queue.staleSkip":"Skip","cardEditor.queue.applyFailed":"Applying failed: {{message}} \u2014 rerun the item from the session table.","cardEditor.queue.reportFailed":"The card was written but the confirmation could not be sent: {{message}} \u2014 reload the session to see the true state.","cardEditor.queue.verdictError":"The verdict failed: {{message}}","cardEditor.queue.prev":"Previous card","cardEditor.queue.next":"Next card","cardEditor.queue.reject":"Reject","cardEditor.queue.approve":"Approve","cardEditor.queue.rejectHint":"R","cardEditor.queue.approveHint":"A","cardEditor.queue.working":"Working\u2026","cardEditor.queue.approveAll":"Approve all remaining without review","cardEditor.queue.approveAllWorking":"Approving\u2026","cardEditor.editRetry.title":"Edit & retry \u2014 {{name}}","cardEditor.editRetry.close":"Close","cardEditor.editRetry.hint":"The exact rendered prompt sent to the model. Retry re-dispatches this card with the edited text.","cardEditor.editRetry.system":"System prompt","cardEditor.editRetry.user":"User prompt","cardEditor.editRetry.missing":"The rendered prompt was not retained for this item; use rerun instead.","cardEditor.editRetry.cancel":"Cancel","cardEditor.editRetry.retry":"Retry","cardEditor.editRetry.retrying":"Retrying\u2026","cardEditor.editRetry.error":"The retry failed: {{message}}","cardEditor.fixJson.title":"Fix JSON \u2014 {{name}}","cardEditor.fixJson.hint":"The model's response could not be parsed, even after auto-repair and a strict-JSON retry. Fix it and apply, or retry generation.","cardEditor.fixJson.response":"Raw model response","cardEditor.fixJson.dismiss":"Dismiss","cardEditor.fixJson.regenerate":"Retry generation","cardEditor.fixJson.apply":"Apply fix","cardEditor.workspace.title":"Card Editor","cardEditor.workspace.close":"Close","cardEditor.panel.status.awaitingSplit":"split proposed","cardEditor.panel.status.split":"split","cardEditor.panel.status.staged":"phase 1 done","cardEditor.dialog.model.presetTransform":"Transform to a schema","cardEditor.transform.title":"Schema transform","cardEditor.transform.schema":"Schema","cardEditor.transform.schemaBuiltIn":"{{name}} (built-in)","cardEditor.transform.editSchemas":"Edit schemas","cardEditor.transform.schemasError":"Schemas could not be loaded. Close the dialog and try again.","cardEditor.transform.formatLabel":"Write fields as","cardEditor.transform.format.markdown":"Markdown","cardEditor.transform.format.xml":"XML","cardEditor.transform.format.json":"JSON","cardEditor.transform.multiTitle":"When one card describes several characters","cardEditor.transform.multiMerge":"Keep them on one card","cardEditor.transform.multiMergeHint":"One result per source card. Each character gets its own document on that card.","cardEditor.transform.multiSplit":"Split them into separate cards","cardEditor.transform.multiSplitHint":"You confirm every split first. Split characters become new cards linked to the source, and the source card is never changed.","cardEditor.transform.outputModeTitle":"How the model answers","cardEditor.transform.outputStructured":"Structured fields (recommended)","cardEditor.transform.outputStructuredHint":"The model fills the schema as data and Marinara writes it as {{format}}.","cardEditor.transform.outputDocument":"The model writes the document itself","cardEditor.transform.outputDocumentHint":"The earlier method: the model writes each field's document text directly. Validation is skipped.","cardEditor.transform.providerJsonOn":"Provider JSON mode is on for the Card Editor agent. Connections that support it enforce the response shape; others use the normal prompt.","cardEditor.transform.providerJsonOff":"Provider JSON mode is off. Turn on \u201CUse structured output\u201D in the Card Editor agent settings to let supported connections enforce the response shape.","cardEditor.transform.providerJsonUnknown":"This Engine version does not report provider JSON mode, so the normal prompt is used.","cardEditor.transform.phase2":"Run a second phase","cardEditor.transform.phase2Hint":"After every split is decided, every Phase 1 result is processed again. Nothing is written to your cards until Phase 2 finishes.","cardEditor.transform.phase2Instruction":"Phase 2 instruction","cardEditor.transform.phase2InstructionPlaceholder":"For example: tighten the prose and make each card name its relations to the others.","cardEditor.transform.phase2Schema":"Phase 2 schema","cardEditor.transform.sameAsPhase1":"Same as Phase 1","cardEditor.transform.phase2AllowSplits":"Allow splits in Phase 2","cardEditor.pipeline.label":"Run totals","cardEditor.pipeline.count":"{{sources}} cards \u2192 {{results}} results","cardEditor.pipeline.splitsAccepted":"{{count}} source card(s) split into several characters","cardEditor.pipeline.noSplits":"No splits","cardEditor.pipeline.phaseLabel":"Shown phase","cardEditor.pipeline.phase":"Phase {{phase}}","cardEditor.pipeline.splitsPending":"{{count}} split(s) waiting for you","cardEditor.pipeline.startPhase2":"Start Phase 2 \xB7 {{count}} cards","cardEditor.panel.action.reviewSplit":"Review split","cardEditor.panel.detail.splitProposed":"The model proposes {{count}} characters for this card.","cardEditor.panel.detail.splitInto":"Split into {{count}} new cards. This card stays unchanged.","cardEditor.panel.detail.lineage":"{{index}} of {{count}} from {{origin}}","cardEditor.panel.detail.issues":"{{count}} schema issue(s)","cardEditor.split.title":"Split review \xB7 {{name}}","cardEditor.split.close":"Close split review","cardEditor.split.source":"Source card","cardEditor.split.sourceEmpty":"The source card has no description.","cardEditor.split.proposal":"The model proposes {{count}} characters.","cardEditor.split.reason":"Reason: {{reason}}","cardEditor.split.cardName":"Card {{index}} name","cardEditor.split.issues":"{{count}} schema issue(s)","cardEditor.split.outcome":"Accepting creates {{count}} new cards linked to the source. The source card is not changed.","cardEditor.split.skip":"Skip this card","cardEditor.split.retrySingle":"Retry as one card","cardEditor.split.accept":"Accept split \xB7 {{count}} cards","cardEditor.schemas.title":"Schema studio","cardEditor.schemas.close":"Close schema studio","cardEditor.schemas.loadError":"Schemas could not be loaded.","cardEditor.schemas.listLabel":"Schemas","cardEditor.schemas.builtIn":"Built-in","cardEditor.schemas.yours":"Yours","cardEditor.schemas.modeLabel":"Editor","cardEditor.schemas.modeBuilder":"Builder","cardEditor.schemas.modeText":"Text","cardEditor.schemas.textLabel":"Schema text","cardEditor.schemas.valid":"Valid schema","cardEditor.schemas.invalid":"Line {{line}}: {{message}}","cardEditor.schemas.kindGroup":"group","cardEditor.schemas.kindVocab":"values","cardEditor.schemas.kindRepeat":"repeats","cardEditor.schemas.maxChip":"max {{max}}","cardEditor.schemas.targetChip":"\u2192 {{field}}","cardEditor.schemas.nodeKey":"Element name","cardEditor.schemas.nodeTarget":"Card field","cardEditor.schemas.targetDefault":"description (default)","cardEditor.schemas.targetInherit":"Same as its top-level element","cardEditor.schemas.nodeHint":"Hint for the model","cardEditor.schemas.nodeHintPlaceholder":"What belongs here","cardEditor.schemas.nodeAttributes":"Attributes","cardEditor.schemas.nodeAttributesHint":"One per line as name=a | b | c. Leave the values empty for freeform; end with etc. to allow other values.","cardEditor.schemas.nodeMax":"Max length","cardEditor.schemas.nodeMaxNone":"none","cardEditor.schemas.nodeRepeat":"List of entries","cardEditor.schemas.addChild":"Add element","cardEditor.schemas.moveUp":"Move element up","cardEditor.schemas.moveDown":"Move element down","cardEditor.schemas.removeNode":"Remove","cardEditor.schemas.previewLabel":"Compiled preview","cardEditor.schemas.preview.markdown":"Markdown","cardEditor.schemas.preview.xml":"XML","cardEditor.schemas.preview.json":"JSON","cardEditor.schemas.preview.schema":"JSON Schema","cardEditor.schemas.previewHint.markdown":"The template the model sees when it writes Markdown itself.","cardEditor.schemas.previewHint.xml":"The template the model sees when it writes XML itself.","cardEditor.schemas.previewHint.json":"The data shape the model fills in structured mode, for every output format.","cardEditor.schemas.previewHint.schema":"Sent as provider structured output when the connection supports it.","cardEditor.schemas.name":"Schema name","cardEditor.schemas.copyName":"{{name}} copy","cardEditor.schemas.duplicate":"Save as new","cardEditor.schemas.save":"Save","cardEditor.schemas.delete":"Delete","cardEditor.schemas.deleteConfirm":"Delete \u201C{{name}}\u201D? Runs that already used it keep their copy.","cardEditor.schemas.deleteYes":"Delete schema","cardEditor.schemas.deleteNo":"Keep","cardEditor.avatar.open":"Avatar studio","cardEditor.avatar.title":"Avatar studio","cardEditor.avatar.close":"Close avatar studio","cardEditor.avatar.images":"Images","cardEditor.avatar.loading":"Loading card images\u2026","cardEditor.avatar.noImage":"No avatar; shows initials","cardEditor.avatar.moveUp":"Move {{name}} earlier","cardEditor.avatar.moveDown":"Move {{name}} later","cardEditor.avatar.sourcesHint":"Defaults to every card in this run. The source images are never changed.","cardEditor.avatar.canvasLabel":"Avatar composite. Drag to pan, scroll or pinch to zoom. With the canvas focused: Tab changes cell, arrow keys pan, plus and minus zoom, 0 resets the cell.","cardEditor.avatar.selected":"Selected: {{name}} \xB7 zoom {{zoom}}%","cardEditor.avatar.layout":"Layout","cardEditor.avatar.method.square":"Square","cardEditor.avatar.method.portrait":"Portrait","cardEditor.avatar.method.best-fit":"Best fit","cardEditor.avatar.columns":"Columns","cardEditor.avatar.columnsAuto":"Auto","cardEditor.avatar.gap":"Gap \xB7 {{gap}} px","cardEditor.avatar.zoom":"Cell zoom \xB7 {{zoom}}%","cardEditor.avatar.resolution":"Export size","cardEditor.avatar.resetCell":"Reset cell","cardEditor.avatar.resetAll":"Reset all","cardEditor.avatar.keys":"Tab changes cell \xB7 arrows pan \xB7 + and \u2212 zoom \xB7 0 resets","cardEditor.avatar.target":"Use as avatar for","cardEditor.avatar.targetOption":"Avatar for {{name}}","cardEditor.avatar.noTargets":"No cards written yet","cardEditor.avatar.apply":"Use as avatar","cardEditor.avatar.applying":"Saving\u2026","cardEditor.avatar.applied":"Saved as the avatar of {{name}}."};var wt=Object.fromEntries(Object.entries(Tr).filter(([e,a])=>e!=="_meta"&&typeof a=="string")),Mr={en:wt};function ks(e){let a=e?.trim().replaceAll("_","-").toLowerCase()||"en";return Mr[a]??Mr[a.split("-")[0]]??wt}function ws(e,a){return a?e.replaceAll(/\{\{([A-Za-z0-9_]+)\}\}/g,(o,s)=>{let l=a[s];return l==null?o:String(l)}):e}function ae(e,a,o){let s=ks(e?.locale);return ws(s[a]??wt[a]??a,o)}var $a=globalThis.__MARINARA_HOST__,ya=$a&&$a.version===1&&$a.modules?$a.modules["react/jsx-runtime"]:void 0;if(!ya)throw new Error("Marinara Engine does not provide react/jsx-runtime; this package needs capability API 1.341 or newer.");var ze=ya.Fragment,td=ya.default,t=ya.jsx,d=ya.jsxs;var Es=200;function Br({name:e,avatarPath:a}){return t("span",{className:"ce-search-option-avatar","aria-hidden":"true",children:a?t("img",{src:a,alt:"",loading:"lazy"}):e.trim().charAt(0)||"?"})}function Xa({localization:e,selection:a,onChange:o,allowInherit:s=!1,buttonLabel:l,inheritLabel:r,noneLabel:i}){let n=(P,X)=>ae(e,P,X),p=or(),x=oe(null),u=oe(null),[h,b]=f(!1),[v,S]=f(""),[B,N]=f([]),[O,M]=f(!1),[K,A]=f(!1),[R,T]=f(0),j=oe(0);G(()=>{if(!h)return;let P=++j.current;M(!0),A(!1);let X=setTimeout(()=>{Ar({search:v,limit:50,offset:0}).then(_=>{j.current===P&&(N(Array.isArray(_?.items)?_.items:[]),M(!1))}).catch(()=>{j.current===P&&(N([]),A(!0),M(!1))})},Es);return()=>clearTimeout(X)},[h,v]),G(()=>{if(!h)return;let P=X=>{x.current&&X.target instanceof Node&&!x.current.contains(X.target)&&b(!1)};return document.addEventListener("pointerdown",P),()=>document.removeEventListener("pointerdown",P)},[h]);let z=P=>{o(P),b(!1),S(""),u.current?.focus()},W=[...s?[{key:"inherit",label:r??"",avatarPath:null,selected:a.kind==="inherit",select:()=>z({kind:"inherit"})}]:[],{key:"none",label:i,avatarPath:null,selected:a.kind==="none",select:()=>z({kind:"none"})},...B.map(P=>({key:P.id,label:P.name,avatarPath:P.avatarPath,selected:a.kind==="character"&&a.id===P.id,select:()=>z({kind:"character",id:P.id,name:P.name,avatarPath:P.avatarPath})}))],Y=W[Math.min(R,Math.max(W.length-1,0))],$=a.kind==="character"?a.name:a.kind==="inherit"?r??"":i,J=P=>{if(P.key==="Escape"){P.stopPropagation(),b(!1),u.current?.focus();return}if(P.key==="ArrowDown"||P.key==="ArrowUp"){if(P.preventDefault(),W.length===0)return;let X=P.key==="ArrowDown"?1:-1;T(_=>(Math.min(_,W.length-1)+X+W.length)%W.length);return}P.key==="Enter"&&Y&&(P.preventDefault(),Y.select())};return d("div",{className:"ce-search-select",ref:x,children:[d("button",{ref:u,type:"button",className:`mari-chrome-field ce-field ce-search-face${a.kind==="character"?"":" ce-search-face--muted"}`,"aria-haspopup":"listbox","aria-expanded":h,"aria-controls":h?p:void 0,onClick:()=>{b(P=>!P),T(0)},children:[t("span",{className:"ce-sr-only",children:`${l}: `}),a.kind==="character"?t(Br,{name:a.name,avatarPath:a.avatarPath}):null,t("span",{className:"ce-search-face-label",children:$}),t(La,{className:`ce-icon ce-search-chevron${h?" ce-search-chevron--open":""}`,"aria-hidden":"true"})]}),h?d("div",{className:"ce-search-panel",children:[t("input",{type:"search",role:"combobox","aria-autocomplete":"list","aria-expanded":"true","aria-controls":p,"aria-activedescendant":Y?`${p}-${Y.key}`:void 0,"aria-label":n("cardEditor.dialog.search.placeholder"),className:"mari-chrome-field ce-field",placeholder:n("cardEditor.dialog.search.placeholder"),value:v,autoFocus:!0,onChange:P=>{S(P.target.value),T(0)},onKeyDown:J}),O?t("div",{className:"ce-caption",children:n("cardEditor.dialog.search.loading")}):null,K?t("div",{className:"ce-status ce-status--error",role:"alert",children:n("cardEditor.dialog.search.error")}):null,!O&&!K&&B.length===0?t("div",{className:"ce-caption",children:n("cardEditor.dialog.search.noResults")}):null,t("ul",{className:"ce-search-options",role:"listbox",id:p,"aria-label":l,children:W.map((P,X)=>t("li",{role:"presentation",children:d("button",{type:"button",role:"option",id:`${p}-${P.key}`,"aria-selected":P.selected,className:`ce-search-option${P===Y?" ce-search-option--active":""}`,onMouseEnter:()=>T(X),onClick:P.select,children:[P.key==="inherit"||P.key==="none"?null:t(Br,{name:P.label,avatarPath:P.avatarPath}),t("span",{className:"ce-search-option-name",children:P.label})]})},P.key))})]}):null]})}var Nr='button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';function Te(){try{return typeof window>"u"?void 0:window.localStorage}catch{return}}function ve(e,a,o){let s=oe(null),l=oe(o);l.current=o;let r=oe(a);return r.current=a,G(()=>{if(!e)return;let i=document.activeElement instanceof HTMLElement?document.activeElement:null,n=s.current;if(!n)return;let p=requestAnimationFrame(()=>(n.querySelector(Nr)??n).focus()),x=u=>{if(u.key==="Escape"){if(u.isComposing||r.current())return;u.preventDefault(),l.current();return}if(u.key!=="Tab")return;let h=[...n.querySelectorAll(Nr)];if(!n.contains(document.activeElement)){u.preventDefault(),(h[0]??n).focus();return}if(h.length===0){u.preventDefault(),n.focus();return}let b=h[0],v=h.at(-1);u.shiftKey&&document.activeElement===b?(u.preventDefault(),v.focus()):!u.shiftKey&&document.activeElement===v&&(u.preventDefault(),b.focus())};return document.addEventListener("keydown",x),()=>{cancelAnimationFrame(p),document.removeEventListener("keydown",x),requestAnimationFrame(()=>{i?.isConnected&&i.focus()})}},[e]),s}function Je({id:e,label:a,value:o,min:s,max:l,onChange:r}){return d("label",{className:"ce-label",htmlFor:e,children:[t("span",{className:"ce-label-title",children:a}),t("input",{id:e,type:"number",className:"mari-chrome-field ce-field ce-number-input",value:o,min:s,max:l,step:1,inputMode:"numeric",onChange:i=>{if(i.target.value==="")return;let n=Number(i.target.value);Number.isFinite(n)&&r(Math.max(s,Math.min(l,Math.trunc(n))))}})]})}function ye({name:e,value:a,checked:o,onChange:s,title:l,disabled:r}){return d("label",{className:`ce-choice${r?" ce-choice--disabled":""}`,children:[t("input",{type:"radio",name:e,value:a,checked:o,disabled:r,onChange:()=>s(a)}),t("span",{className:"ce-choice-copy",children:t("strong",{children:l})})]})}function Dr({localization:e,targets:a,targetsLoading:o,onUpdateTarget:s,onRemoveTarget:l}){let r=(i,n)=>ae(e,i,n);return d("fieldset",{className:"ce-section","data-ce-section":"targets",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.targets.title",{count:a.length})}),o?t("div",{className:"ce-status",children:r("cardEditor.dialog.targets.loading")}):null,!o&&a.length===0?t("p",{className:"ce-caption",children:r("cardEditor.dialog.targets.empty")}):null,t("ul",{className:"ce-targets",children:a.map((i,n)=>d("li",{className:"ce-target",children:[d("div",{className:"ce-target-identity",children:[t("span",{className:"ce-target-avatar","aria-hidden":"true",children:i.avatarPath?t("img",{src:i.avatarPath,alt:"",loading:"lazy"}):i.name.trim().charAt(0)||"?"}),d("span",{className:"ce-target-name",children:[i.name,i.loadError?d("span",{className:"ce-target-load-error",children:[" ",r("cardEditor.dialog.targets.loadFailed")]}):null]})]}),d("div",{className:"ce-target-controls",children:[t("input",{type:"text",className:"mari-chrome-field ce-field",value:i.note,placeholder:r("cardEditor.dialog.targets.notePlaceholder"),"aria-label":r("cardEditor.dialog.targets.noteLabel",{name:i.name}),...n===0?{"data-ce-autofocus":!0}:{},onChange:p=>s(i.characterId,{note:p.target.value})}),t(Xa,{localization:e,selection:i.style,onChange:p=>s(i.characterId,{style:p}),allowInherit:!0,buttonLabel:r("cardEditor.dialog.targets.styleLabel",{name:i.name}),inheritLabel:r("cardEditor.dialog.targets.styleSession"),noneLabel:r("cardEditor.dialog.targets.styleNone")})]}),t("button",{type:"button",className:"ce-target-remove","aria-label":r("cardEditor.dialog.targets.remove",{name:i.name}),onClick:()=>l(i.characterId),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]},i.characterId))})]})}var Et={standard:`You are the Card Editor. You rewrite existing character cards from the user's instruction while preserving each card's voice, facts, and intent.

Editing contract:
- Editable fields: description, personality, scenario, first_mes, mes_example, creator_notes, system_prompt, post_history_instructions, backstory, appearance. Never edit the card's name; never propose any other field.
- Each update is {"field","oldText","newText","reason"}: field is one of the editable fields; oldText is the field's exact current text copied verbatim from the provided character context ("" when the field is empty); newText is the complete replacement text for the whole field, never a fragment, diff, or patch; reason is one short sentence explaining the change.
- Preserve {{char}} and {{user}} macros exactly; never resolve or rename them.
- Propose only changes that serve the instruction. False positives are worse than missed changes.`,strict:`You are the Card Editor. You rewrite existing character cards from the user's instruction while preserving each card's voice, facts, and intent.

Editing contract:
- Editable fields: description, personality, scenario, first_mes, mes_example, creator_notes, system_prompt, post_history_instructions, backstory, appearance. Never edit the card's name; never propose any other field.
- Each update is {"field","oldText","newText","reason"}: field is one of the editable fields; oldText is the field's exact current text copied verbatim from the provided character context ("" when the field is empty); newText is the complete replacement text for the whole field, never a fragment, diff, or patch; reason is one short sentence explaining the change.
- Preserve {{char}} and {{user}} macros exactly; never resolve or rename them.
- Propose only changes that serve the instruction. False positives are worse than missed changes.

Work surgically: make the smallest whole-field rewrite that satisfies the instruction, change as few fields as possible, and leave every untouched field out of the response.`,rebalance:`You are the Card Editor. You rewrite existing character cards from the user's instruction while preserving each card's voice, facts, and intent.

Editing contract:
- Editable fields: description, personality, scenario, first_mes, mes_example, creator_notes, system_prompt, post_history_instructions, backstory, appearance. Never edit the card's name; never propose any other field.
- Each update is {"field","oldText","newText","reason"}: field is one of the editable fields; oldText is the field's exact current text copied verbatim from the provided character context ("" when the field is empty); newText is the complete replacement text for the whole field, never a fragment, diff, or patch; reason is one short sentence explaining the change.
- Preserve {{char}} and {{user}} macros exactly; never resolve or rename them.
- Propose only changes that serve the instruction. False positives are worse than missed changes.

Rebalance field content across each card. Description = general identity and role. Personality = concise traits, temperament, and behavior patterns. Backstory = history, origin, and formative events. Appearance = physical detail. Scenario = default setting. Move content between fields to match these meanings while preserving every fact. A source field may legitimately be emptied; an empty newText is allowed only under this directive.`,"xml-simple":`You are the Card Editor. Transform each existing character card into the complete Simple XML document defined by the global instruction, drawing content from all provided card fields.

XML transformation contract:
- Return exactly ONE update for each card: {"action":"update","field":"description","oldText":"\u2026","newText":"\u2026","reason":"\u2026"}.
- The update field must be "description". oldText must be the exact current description copied verbatim. newText must be the complete XML document, never a fragment, diff, patch, or markdown fence.
- Assemble the XML from ALL fields in the provided character context. Preserve every relevant fact, instruction, example, greeting, note, and other card content in the target schema.
- Leave every field other than description untouched and never edit the card's name.
- Preserve {{char}} and {{user}} macros exactly; never resolve, escape, or rename them.`,"xml-complex":`You are the Card Editor. Transform each existing character card into the complete Complex XML document defined by the global instruction, drawing content from all provided card fields.

XML transformation contract:
- Return exactly ONE update for each card: {"action":"update","field":"description","oldText":"\u2026","newText":"\u2026","reason":"\u2026"}.
- The update field must be "description". oldText must be the exact current description copied verbatim. newText must be the complete XML document, never a fragment, diff, patch, or markdown fence.
- Assemble the XML from ALL fields in the provided character context. Preserve every relevant fact, instruction, example, greeting, note, and other card content in the target schema.
- Leave every field other than description untouched and never edit the card's name.
- Preserve {{char}} and {{user}} macros exactly; never resolve, escape, or rename them.`};function Fr(e){return e==="standard"||e==="strict"||e==="rebalance"||e==="xml-simple"||e==="xml-complex"}var At=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions","backstory","appearance"],Or=/^[A-Za-z_][\w.-]{0,63}$/;var Ps=`<character-name>
    <summary></summary>
    <description></description>
    <personality></personality>
    <backstory></backstory>
    <appearance></appearance>
    <scenario></scenario>
</character-name>`,As=`<!-- all freeform text unless attributed; attributed elements use the values given, only one unless stated otherwise -->
<character-name>
<!-- Name + Short Summary of character -->
<summary name="" aliases="" species="anthro | feral + species" gender="" age="" role=""></summary>
<!-- body, face, height, build, fur, feathers, markings, clothes, etc. -->
<appearance></appearance>
<physiology>
    <!-- What type of genitals, what kind it is, and finally one or descriptors combined as needed describing form, feature, and feel -->
    <genitals sex="penis|vagina|cloaca" kind="human | canine | equine | avian | reptilian | etc." description="normal | slit | knotted | prehensile | ribbed | barbed | innie | outie | etc."></genitals>
    <!-- Hormonal rhythm and any quirks. -->
    <fertility cycle="menstrual | heat-lunar | induced-ovulation | always | never" fertility="fertile | infertile | contraception"></fertility>
    <!-- Milk production or nursing traits. -->
    <lactation capability="self-lactating | induced | none"></lactation>
</physiology>
<!-- voice, mannerisms, dialogue style -->
<style></style>
<!-- personality, character -->
<personality></personality>
<!-- kinks, turn-ons, sexual habits and preferences -->
<sexuality orientation="" role=""></sexuality>
<!-- backstory, significant life events -->
<history></history>
</character-name>`;function qr(e,a,o){let s=ja(o);if(!s.ok)throw new Error(`built-in schema ${e} is invalid: ${s.errors[0]?.message}`);return{id:e,name:a,builtIn:!0,root:s.root}}var Id=[qr("simple","Simple",Ps),qr("complex","Complex",As)];function Rs(e){let a=e.split("|").map(s=>s.trim()).filter(Boolean),o=a.length>0&&/^etc\.?$/i.test(a[a.length-1]);return{values:o?a.slice(0,-1):a,open:o}}function ja(e){let a=[],o=h=>e.slice(0,h).split(`
`).length,s=[],l=[],r,i,n=0,p=/<!--([\s\S]*?)-->|<\/\s*([^\s>]+)\s*>|<([^\s/>!]+)((?:\s+[^\s=>]+\s*=\s*"[^"]*")*)\s*(\/?)>|([^<]+)/g,x;for(;x=p.exec(e);){let h=o(x.index),[,b,v,S,B,N,O]=x;if(b!==void 0){let A=b.trim();s.length===0&&l.length===0?i=A:r=A;continue}if(O!==void 0){let A=O.trim();if(!A)continue;let R=s[s.length-1];R?R.hint||(R.hint=A):a.push({line:h,message:"Text outside the root element."});continue}if(v!==void 0){let A=s.pop();A?A.key!==v&&a.push({line:h,message:`Expected </${A.key}> but found </${v}>.`}):a.push({line:h,message:`Closing </${v}> has no opening tag.`});continue}if(S===void 0){a.push({line:h,message:"Unreadable markup."});continue}if(Or.test(S)||a.push({line:h,message:`"${S}" is not a valid element name.`}),s.length>=8&&a.push({line:h,message:"Nesting deeper than 8 levels."}),++n>200){a.push({line:h,message:"More than 200 elements."});break}let M={key:S,attributes:[],children:[]};r&&(M.hint=r),r=void 0;for(let A of(B??"").matchAll(/([^\s=]+)\s*=\s*"([^"]*)"/g)){let[,R,T]=A;if(R==="max"){let j=Number(T);!Number.isInteger(j)||j<=0?a.push({line:h,message:`max on <${S}> must be a positive whole number.`}):M.maxLength=j}else if(R==="target")At.includes(T)?M.target=T:a.push({line:h,message:`target="${T}" is not a card field.`});else if(R==="repeat")M.repeat=T==="true";else{Or.test(R)||a.push({line:h,message:`"${R}" is not a valid attribute name.`}),M.attributes.some(W=>W.name===R)&&a.push({line:h,message:`Attribute "${R}" appears twice on <${S}>.`});let{values:j,open:z}=Rs(T);M.attributes.push({name:R,values:j,...z?{open:!0}:{}})}}M.attributes.some(A=>A.name==="text")&&a.push({line:h,message:`"text" is reserved for element text; rename the attribute on <${M.key}>.`});let K=s[s.length-1];K?(K.children.some(A=>A.key===M.key)&&a.push({line:h,message:`<${M.key}> appears twice under <${K.key}>.`}),K.children.push(M)):l.push(M),N||s.push(M)}for(let h of s)a.push({line:o(e.length),message:`<${h.key}> is never closed.`});l.length!==1&&a.length===0&&a.push({line:1,message:l.length===0?"The schema needs one root element.":"Only one root element is allowed."});let u=l[0];if(u){i&&!u.hint&&(u.hint=i);for(let h of u.children)Ur(h,!0,a);u.children.length===0&&a.length===0&&a.push({line:1,message:"The root needs at least one element."})}return a.length>0||!u?{ok:!1,errors:a}:{ok:!0,root:u}}function Ur(e,a,o){!a&&e.target&&o.push({line:1,message:`target is only allowed on top-level elements (<${e.key}>).`});for(let s of e.children)Ur(s,!1,o)}function Hr(e,a){let o=e.attributes.map(s=>` ${s.name}="${[...s.values,...s.open?["etc."]:[]].join(" | ")}"`);return a&&(e.maxLength&&o.push(` max="${e.maxLength}"`),e.target&&o.push(` target="${e.target}"`),e.repeat&&o.push(' repeat="true"')),o.join("")}function Rt(e,a,o,s){let l="  ".repeat(a),r=a===0&&s?s:e.key,i=e.hint?`${l}<!-- ${e.hint} -->
`:"";if(e.children.length===0)return`${i}${l}<${r}${Hr(e,o)}></${r}>
`;let n=e.children.map(p=>Rt(p,a+1,o)).join("");return`${i}${l}<${r}${Hr(e,o)}>
${n}${l}</${r}>
`}function ka(e){return Rt(e,0,!0).trimEnd()}function zr(e){let a=e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null;if(!a)throw new Error("schema must be an object");if(typeof a.id!="string"||!a.id.trim()||a.id.length>160)throw new Error("schema.id is required");if(typeof a.name!="string"||!a.name.trim()||a.name.length>120)throw new Error("schema.name is required");let o=typeof a.text=="string"?a.text:ka(_r(a.root,0));if(o.length>5e4)throw new Error("schema text must be at most 50000 characters");let s=ja(o);if(!s.ok)throw new Error(`schema is invalid: line ${s.errors[0].line}: ${s.errors[0].message}`);return{id:a.id.trim(),name:a.name.trim(),...a.builtIn===!0?{builtIn:!0}:{},root:s.root}}function _r(e,a){let o=e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null;if(!o||typeof o.key!="string"||a>8)throw new Error("schema.root is invalid");let s=Array.isArray(o.attributes)?o.attributes:[],l=Array.isArray(o.children)?o.children:[];return{key:o.key,...typeof o.hint=="string"&&o.hint?{hint:o.hint.replace(/--/g,"\u2013")}:{},attributes:s.map(r=>{let i=r;if(typeof i?.name!="string")throw new Error("schema attribute is invalid");let n=Array.isArray(i.values)?i.values.filter(p=>typeof p=="string"):[];return{name:i.name,values:n.map(p=>p.replace(/[|"]/g,"")),...i.open===!0?{open:!0}:{}}}),...typeof o.maxLength=="number"?{maxLength:o.maxLength}:{},...typeof o.target=="string"?{target:o.target}:{},...o.repeat===!0?{repeat:!0}:{},children:l.map(r=>_r(r,a+1))}}function Ts(e){return[...new Set(e.root.children.map(a=>a.target??"description"))]}function Vr(e,a){e.maxLength&&a.push(`Text for ${e.key} must not exceed ${e.maxLength} characters.`);for(let o of e.children)Vr(o,a);return a}function Gr(e){let a={};for(let s of e.attributes)a[s.name]=s.values.length?`${s.values.join(" | ")}${s.open?" | \u2026":""}`:"";let o;if(e.children.length===0)e.attributes.length===0?o=e.hint??"":o={...a,text:e.hint??""};else{for(let s of e.children)a[s.key]=Gr(s);o=a}return e.repeat?[o]:o}function Pt(e,a){if(a===0){let l=e.children.map(r=>Pt(r,1)).join(`
`);return`# {{character name}}
${e.hint?`<!-- ${e.hint} -->
`:""}
${l}`.trimEnd()}let o=[`${"#".repeat(Math.min(a+1,6))} ${Ms(e.key)}${e.repeat?" (one block per entry)":""}`];e.hint&&o.push(`<!-- ${e.hint} -->`);for(let l of e.attributes)o.push(`- **${l.name}:** ${l.values.length?l.values.join(" | ")+(l.open?" | \u2026":""):"\u2026"}`);e.children.length===0&&o.push("\u2026");let s=e.children.map(l=>Pt(l,a+1));return[o.join(`
`),...s].join(`

`)}function Wr(e,a){let o=Vr(e.root,[]),s;a==="json-data"||a==="json"?s=JSON.stringify(Gr(e.root),null,2):a==="markdown"?s=Pt(e.root,0):s=Rt(e.root,0,!1).trimEnd();let l=["Attribute values list the allowed vocabulary; pick one unless stated otherwise. An empty value or a trailing \u2026 means freeform.",...a==="xml"?[`Replace the <${e.root.key}> root tag with the character's name in kebab-case.`]:[],...o];return`${s}

${l.join(`
`)}`}function $r(e){let a=e.hint?{description:e.hint}:{},o;if(e.children.length===0&&e.attributes.length===0)o={type:"string",...a,...e.maxLength?{maxLength:e.maxLength}:{}};else{let s={};for(let l of e.attributes)s[l.name]=l.values.length&&!l.open?{type:"string",enum:l.values}:{type:"string",...l.values.length?{description:`e.g. ${l.values.join(", ")}`}:{}};e.children.length===0&&(s.text={type:"string",...e.maxLength?{maxLength:e.maxLength}:{}});for(let l of e.children)s[l.key]=$r(l);o={type:"object",...a,properties:s,required:Object.keys(s),additionalProperties:!1}}return e.repeat?{type:"array",items:o}:o}function Xr(e,a){let o=Ts(e),s=a==="document"?{type:"object",properties:Object.fromEntries(o.map(l=>[l,{type:"string"}])),required:o,additionalProperties:!1}:$r({...e.root,repeat:!1});return{type:"object",properties:{results:{type:"array",items:{type:"object",properties:{sourceId:{type:"string"},characters:{type:"array",items:{type:"object",properties:{name:{type:"string"},fields:s},required:["name","fields"],additionalProperties:!1}},splitReason:{type:["string","null"]}},required:["sourceId","characters","splitReason"],additionalProperties:!1}}},required:["results"],additionalProperties:!1}}function Ms(e){let a=e.replace(/[-_.]+/g," ").trim();return a?a[0].toUpperCase()+a.slice(1):e}var Bs=["markdown","xml","json","schema"];function Tt(e,a){return a.reduce((o,s)=>o.children[s],e)}function wa(e,a,o){if(a.length===0)return o(e)??e;let[s,...l]=a,r=e.children.flatMap((i,n)=>{if(n!==s)return[i];if(l.length>0)return[wa(i,l,o)];let p=o(i);return p?[p]:[]});return{...e,children:r}}function Ns(e){return e.attributes.map(a=>`${a.name}=${[...a.values,...a.open?["etc."]:[]].join(" | ")}`).join(`
`)}function Ds(e){return e.split(`
`).map(a=>a.trim()).filter(Boolean).map(a=>{let[o="",s=""]=a.split("="),l=s.split("|").map(i=>i.trim().replace(/"/g,"")).filter(Boolean),r=l.length>0&&/^etc\.?$/i.test(l[l.length-1]);return{name:o.trim(),values:r?l.slice(0,-1):l,...r?{open:!0}:{}}})}function Fs(){return`user-${globalThis.crypto.randomUUID().slice(0,8)}`}function jr({localization:e,initialSchemaId:a,onClose:o,onSchemasChanged:s}){let l=(m,E)=>ae(e,m,E),[r,i]=f(null),[n,p]=f(!1),[x,u]=f(a??"simple"),[h,b]=f(""),[v,S]=f(null),[B,N]=f(""),[O,M]=f([]),[K,A]=f("builder"),[R,T]=f([]),[j,z]=f("xml"),[W,Y]=f(!1),[$,J]=f(!1),[P,X]=f(null),[_,fe]=f(!1),me=ve(!0,()=>$,o),I=m=>{u(m.id),b(m.name),S(m.root),N(ka(m.root)),M([]),T(m.root.children.length>0?[0]:[]),Y(!1),fe(!1),X(null)};G(()=>{let m=new AbortController;return sa(m.signal).then(E=>{i(E);let F=E.find(H=>H.id===a)??E[0];F&&I(F)}).catch(()=>p(!0)),()=>m.abort()},[]);let y=r?.find(m=>m.id===x)??null,w=y?.builtIn===!0,D=O.length===0,te=v?{id:x,name:h||x,root:v}:null,se=te?j==="schema"?JSON.stringify(Xr(te,"structured"),null,2):Wr(te,j):"",xe=m=>{S(m),N(ka(m)),Y(!0)},le=m=>{v&&xe(wa(v,R,m))},Me=m=>{N(m),Y(!0);let E=ja(m);E.ok?(S(E.root),M([])):M(E.errors)},Be=m=>{if(!v)return;let E=Tt(v,m),F="new-element";for(let H=2;E.children.some(Z=>Z.key===F);H++)F=`new-element-${H}`;xe(wa(v,m,H=>({...H,children:[...H.children,{key:F,attributes:[],children:[]}]}))),T([...m,E.children.length])},Le=(m,E)=>{if(!v||m.length===0)return;let F=m.slice(0,-1),H=m[m.length-1],Z=H+E,he=Tt(v,F);Z<0||Z>=he.children.length||(xe(wa(v,F,pe=>{let we=[...pe.children];return[we[H],we[Z]]=[we[Z],we[H]],{...pe,children:we}})),T([...F,Z]))},Ce=m=>{!v||m.length===0||(xe(wa(v,m,()=>null)),T(m.slice(0,-1)))},ke=async m=>{if(!(!v||!D||$)){J(!0),X(null);try{let E=m||w?Fs():x,F=(m||w?l("cardEditor.schemas.copyName",{name:h}):h).trim()||E,H=await pr({id:E,name:F.slice(0,120),text:ka(v)}),Z=await sa();i(Z),I(Z.find(he=>he.id===H.id)??H),s(Z,H.id)}catch(E){X(E instanceof Error?E.message:String(E))}finally{J(!1)}}},g=async()=>{if(!(!y||w||$)){J(!0);try{await hr(y.id);let m=await sa();i(m),m[0]&&I(m[0]),s(m,m[0]?.id??"simple")}catch(m){X(m instanceof Error?m.message:String(m))}finally{J(!1)}}},k=v?Tt(v,R):null,C=R.length===1,U=(m,E,F)=>{let H=E.join(".")===R.join("."),Z=m.target??(F===1?"description":null);return d("li",{className:"ce-schema-node",style:{"--ce-depth":Math.min(F,4)},children:[d("button",{type:"button",className:`ce-schema-node-head${H?" ce-schema-node-head--selected":""}`,"aria-pressed":H,onClick:()=>T(E),children:[t("code",{className:"ce-schema-key",children:`<${m.key}>`}),m.children.length>0?t("span",{className:"ce-chip",children:l("cardEditor.schemas.kindGroup")}):m.attributes.some(he=>he.values.length>0)?t("span",{className:"ce-chip",children:l("cardEditor.schemas.kindVocab")}):null,m.repeat?t("span",{className:"ce-chip",children:l("cardEditor.schemas.kindRepeat")}):null,m.maxLength?t("span",{className:"ce-chip",children:l("cardEditor.schemas.maxChip",{max:m.maxLength})}):null,Z?t("span",{className:"ce-chip ce-chip--ok",children:l("cardEditor.schemas.targetChip",{field:Z})}):null,m.hint?t("span",{className:"ce-schema-hint",children:m.hint}):null]}),m.children.length>0?t("ul",{className:"ce-schema-tree",children:m.children.map((he,pe)=>U(he,[...E,pe],F+1))}):null]},E.join(".")||"root")};return t("div",{className:"ce-overlay",role:"presentation",onClick:()=>$?void 0:o(),children:d("section",{ref:me,className:"ce-dialog ce-shell ce-studio",role:"dialog","aria-modal":"true","aria-label":l("cardEditor.schemas.title"),tabIndex:-1,onClick:m=>m.stopPropagation(),children:[d("div",{className:"ce-dialog-head",children:[t("strong",{children:l("cardEditor.schemas.title")}),t("button",{type:"button",className:"ce-dialog-close",onClick:o,disabled:$,"aria-label":l("cardEditor.schemas.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),n?t("div",{className:"ce-status ce-status--error",role:"alert",children:l("cardEditor.schemas.loadError")}):null,d("div",{className:"ce-studio-body",children:[t("nav",{className:"ce-studio-list","aria-label":l("cardEditor.schemas.listLabel"),children:(r??[]).map(m=>d("button",{type:"button",className:"ce-studio-list-item","aria-pressed":m.id===x,onClick:()=>I(m),children:[t("strong",{children:m.name}),t("small",{children:m.builtIn?l("cardEditor.schemas.builtIn"):l("cardEditor.schemas.yours")})]},m.id))}),d("div",{className:"ce-studio-edit",children:[d("div",{className:"ce-studio-bar",children:[d("div",{className:"ce-segmented",role:"radiogroup","aria-label":l("cardEditor.schemas.modeLabel"),children:[t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":K==="builder",disabled:!D,onClick:()=>A("builder"),children:l("cardEditor.schemas.modeBuilder")}),t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":K==="text",onClick:()=>A("text"),children:l("cardEditor.schemas.modeText")})]}),t("span",{className:`ce-caption${D?"":" ce-item-failure"}`,role:"status",children:D?l("cardEditor.schemas.valid"):l("cardEditor.schemas.invalid",{line:O[0].line,message:O[0].message})})]}),K==="text"?t("textarea",{className:"mari-chrome-field ce-field ce-studio-text",value:B,spellCheck:!1,"aria-label":l("cardEditor.schemas.textLabel"),onChange:m=>Me(m.target.value)}):v?d(ze,{children:[t("div",{className:"ce-studio-tree",children:t("ul",{className:"ce-schema-tree",children:U(v,[],0)})}),k?d("div",{className:"ce-studio-inspector",children:[d("label",{className:"ce-label",htmlFor:"ce-node-key",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeKey")}),t("input",{id:"ce-node-key",className:"mari-chrome-field ce-field",value:k.key,onChange:m=>le(E=>({...E,key:m.target.value.replace(/[^\w.-]/g,"-")||"element"}))})]}),d("label",{className:"ce-label",htmlFor:"ce-node-target",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeTarget")}),d("select",{id:"ce-node-target",className:"mari-chrome-field ce-field",value:k.target??"",disabled:!C,onChange:m=>le(E=>{let{target:F,...H}=E;return m.target.value?{...H,target:m.target.value}:H}),children:[t("option",{value:"",children:l(C?"cardEditor.schemas.targetDefault":"cardEditor.schemas.targetInherit")}),At.filter(m=>m!=="description").map(m=>t("option",{value:m,children:m},m))]})]}),d("label",{className:"ce-label ce-studio-wide",htmlFor:"ce-node-hint",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeHint")}),t("input",{id:"ce-node-hint",className:"mari-chrome-field ce-field",value:k.hint??"",placeholder:l("cardEditor.schemas.nodeHintPlaceholder"),onChange:m=>le(E=>{let{hint:F,...H}=E,Z=m.target.value.replace(/--/g,"\u2013");return Z?{...H,hint:Z}:H})})]}),d("label",{className:"ce-label ce-studio-wide",htmlFor:"ce-node-attributes",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeAttributes")}),t("textarea",{id:"ce-node-attributes",className:"mari-chrome-field ce-field ce-textarea",rows:2,spellCheck:!1,defaultValue:Ns(k),onBlur:m=>le(E=>({...E,attributes:Ds(m.target.value)}))},`${R.join(".")}:${x}`),t("small",{children:l("cardEditor.schemas.nodeAttributesHint")})]}),d("label",{className:"ce-label",htmlFor:"ce-node-max",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeMax")}),t("input",{id:"ce-node-max",type:"number",min:0,className:"mari-chrome-field ce-field ce-number-input",value:k.maxLength??"",disabled:k.children.length>0,placeholder:l("cardEditor.schemas.nodeMaxNone"),onChange:m=>le(E=>{let{maxLength:F,...H}=E,Z=Math.trunc(Number(m.target.value));return Z>0?{...H,maxLength:Z}:H})})]}),d("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:k.repeat===!0,disabled:R.length===0,onChange:m=>le(E=>{let{repeat:F,...H}=E;return m.target.checked?{...H,repeat:!0}:H})}),t("span",{className:"ce-choice-copy",children:t("strong",{children:l("cardEditor.schemas.nodeRepeat")})})]}),d("div",{className:"ce-studio-node-actions ce-studio-wide",children:[d("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>Be(R),children:[t(Ia,{className:"ce-icon","aria-hidden":"true"}),l("cardEditor.schemas.addChild")]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R.length===0,"aria-label":l("cardEditor.schemas.moveUp"),onClick:()=>Le(R,-1),children:t(Xe,{className:"ce-icon","aria-hidden":"true"})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R.length===0,"aria-label":l("cardEditor.schemas.moveDown"),onClick:()=>Le(R,1),children:t($e,{className:"ce-icon","aria-hidden":"true"})}),d("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:R.length===0,onClick:()=>Ce(R),children:[t(Ca,{className:"ce-icon","aria-hidden":"true"}),l("cardEditor.schemas.removeNode")]})]})]}):null]}):null]}),d("div",{className:"ce-studio-preview",children:[t("div",{className:"ce-studio-bar",children:t("div",{className:"ce-segmented",role:"radiogroup","aria-label":l("cardEditor.schemas.previewLabel"),children:Bs.map(m=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":j===m,onClick:()=>z(m),children:l(`cardEditor.schemas.preview.${m}`)},m))})}),t("pre",{className:"ce-studio-pre",tabIndex:0,"aria-label":l("cardEditor.schemas.previewLabel"),children:se}),t("p",{className:"ce-caption",children:l(`cardEditor.schemas.previewHint.${j}`)})]})]}),d("div",{className:"ce-dialog-foot",children:[P?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:P}):null,d("label",{className:"ce-label ce-studio-name",htmlFor:"ce-schema-name",children:[t("span",{className:"ce-sr-only",children:l("cardEditor.schemas.name")}),t("input",{id:"ce-schema-name",className:"mari-chrome-field ce-field",value:h,disabled:w,placeholder:l("cardEditor.schemas.name"),onChange:m=>{b(m.target.value),Y(!0)}})]}),!w&&y?_?d("span",{className:"ce-confirm-strip",role:"group","aria-label":l("cardEditor.schemas.delete"),children:[t("span",{className:"ce-caption",children:l("cardEditor.schemas.deleteConfirm",{name:y.name})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:$,onClick:()=>{g()},children:l("cardEditor.schemas.deleteYes")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>fe(!1),children:l("cardEditor.schemas.deleteNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:$,onClick:()=>fe(!0),children:l("cardEditor.schemas.delete")}):null,t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:$||!D||!v,onClick:()=>{ke(!0)},children:l("cardEditor.schemas.duplicate")}),w?null:t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:$||!D||!v||!W,onClick:()=>{ke(!1)},children:l("cardEditor.schemas.save")})]})]})})}var Os=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions","backstory","appearance"],ne=class extends Error{constructor(a){super(a),this.name="SchemaError"}};var Rd=new Set(Os);function Ja(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null}function Ye(e,a,o,s){if(e===void 0)return a;if(typeof e=="string"&&o.includes(e))return e;throw new ne(`${s} is invalid`)}function Yr(e,a,o){if(e===void 0)return a;if(typeof e=="string")return e;throw new ne(`${o} must be a string`)}function Ea(e,a,o){if(e===void 0)return;if(typeof e!="string")throw new ne(`${a} must be a string`);if(e.length>300)throw new ne(`${a} must be at most 300 characters`);let s=o?e:e.trim();if(!s.trim())throw new ne(`${a} must not be blank`);return s}function Kr(e,a){if(e==null)return null;if(typeof e=="string")return e;throw new ne(`${a} must be a string or null`)}function Ka(e,a,o,s,l){if(e===void 0)return a;if(typeof e!="number"||!Number.isFinite(e))throw new ne(`${l} must be a finite number`);return Math.max(o,Math.min(s,Math.trunc(e)))}var qs=["markdown","xml","json"];function Jr(e,a){let o=Ja(e);if(!o)throw new ne(`${a} must be an object`);let s;try{s=zr(o.schema)}catch(l){throw new ne(`${a}.schema: ${l instanceof Error?l.message:String(l)}`)}return{schema:s,format:Ye(o.format,"xml",qs,`${a}.format`)}}function Hs(e){let a=Ja(e);if(!a)throw new ne("transform settings are required for the transform task");let o=Jr(a,"transform"),s;if(a.phase2!==void 0){let l=Ja(a.phase2);if(!l)throw new ne("transform.phase2 must be an object");if(l.enabled!==void 0&&typeof l.enabled!="boolean")throw new ne("transform.phase2.enabled must be a boolean");if(l.allowSplits!==void 0&&typeof l.allowSplits!="boolean")throw new ne("transform.phase2.allowSplits must be a boolean");s={enabled:l.enabled===!0,instruction:Yr(l.instruction,"","transform.phase2.instruction"),allowSplits:l.allowSplits===!0,...l.override===void 0||l.override===null?{}:{override:Jr(l.override,"transform.phase2.override")}}}if(a.structuredOutput!==void 0&&typeof a.structuredOutput!="boolean")throw new ne("transform.structuredOutput must be a boolean");return{...o,outputMode:Ye(a.outputMode,"structured",["structured","document"],"transform.outputMode"),multiCharacter:Ye(a.multiCharacter,"split",["split","merge"],"transform.multiCharacter"),structuredOutput:a.structuredOutput!==!1,...s===void 0?{}:{phase2:s}}}function Ya(e){let a=Ja(e);if(!a)throw new ne("session config must be an object");if(a.globalLorebookIds!==void 0&&!Array.isArray(a.globalLorebookIds))throw new ne("globalLorebookIds must be an array of strings");let o=a.globalLorebookIds??[];if(!o.every(h=>typeof h=="string"))throw new ne("globalLorebookIds must be an array of strings");if(a.rebalance!==void 0&&typeof a.rebalance!="boolean")throw new ne("rebalance must be a boolean");if(a.customTemplate!==void 0&&typeof a.customTemplate!="string")throw new ne("customTemplate must be a string");let s=Ea(a.duplicatePrefix,"duplicatePrefix",!0),l=Ea(a.duplicateSuffix,"duplicateSuffix",!0),r=Ea(a.duplicateRemovePrefix,"duplicateRemovePrefix",!0),i=Ea(a.duplicateRemoveSuffix,"duplicateRemoveSuffix",!0),n=Ea(a.combinedCardName,"combinedCardName",!1),p=Ye(a.saveMode,"confirm",["confirm","auto","duplicate","combined"],"saveMode");if(p==="combined"&&n===void 0)throw new ne("combinedCardName is required when saveMode is combined");let x=Ye(a.presetId,"standard",["standard","strict","rebalance","xml-simple","xml-complex","custom","transform"],"presetId"),u=x==="transform"?Hs(a.transform):void 0;return{mode:Ye(a.mode,"individual",["individual","batched"],"mode"),batchSize:Ka(a.batchSize,4,1,16,"batchSize"),connectionId:Kr(a.connectionId,"connectionId"),presetId:x,...a.customTemplate===void 0?{}:{customTemplate:a.customTemplate},...u===void 0?{}:{transform:u},globalInstruction:Yr(a.globalInstruction,"","globalInstruction"),behaviorCharacterId:Kr(a.behaviorCharacterId,"behaviorCharacterId"),globalLorebookIds:[...o],rebalance:a.rebalance??!1,providerRetries:Ka(a.providerRetries,2,0,5,"providerRetries"),refusalRetries:Ka(a.refusalRetries,3,0,5,"refusalRetries"),concurrency:Ka(a.concurrency,1,1,16,"concurrency"),saveMode:p,completionMode:Ye(a.completionMode,"ask",["ask","apply","duplicate"],"completionMode"),...s===void 0?{}:{duplicatePrefix:s},...l===void 0?{}:{duplicateSuffix:l},...r===void 0?{}:{duplicateRemovePrefix:r},...i===void 0?{}:{duplicateRemoveSuffix:i},...n===void 0?{}:{combinedCardName:n}}}var Zr="cardEditor.bulkConfig";function Qr(e){if(!e)return null;let a=null;try{a=e.getItem(Zr)}catch{return null}if(!a)return null;try{return Ya(JSON.parse(a))}catch{return null}}function eo(e,a){if(a)try{a.setItem(Zr,JSON.stringify(e))}catch{}}var Mt="cardEditor.bulkDraft",Bt="cardEditor.bulkPresets";function _e(e){return e&&typeof e=="object"&&!Array.isArray(e)?e:null}function ao(e,a){let o=_e(e);return o?.kind==="inherit"||o?.kind==="none"?{kind:o.kind}:o?.kind==="character"&&typeof o.id=="string"&&typeof o.name=="string"?{kind:"character",id:o.id,name:o.name,avatarPath:typeof o.avatarPath=="string"?o.avatarPath:null}:a}function to(e,a){let o=_e(a);if(!o)return e;let s={...e};for(let[l,r]of Object.entries(e)){let i=o[l];i!==void 0&&(Array.isArray(r)?Array.isArray(i)&&i.every(n=>typeof n=="string")&&(s[l]=i):r===null?(i===null||typeof i=="string")&&(s[l]=i):typeof i==typeof r&&(typeof r!="object"||_e(i))&&(s[l]=typeof r=="object"?to(r,i):i))}return s}function ro(e,a){return{...to(a,e),behavior:ao(_e(e)?.behavior,a.behavior)}}function oo(e,a){try{let o=e?.getItem(a);return o?JSON.parse(o):null}catch{return null}}function Nt(e,a,o){try{e?.setItem(a,JSON.stringify(o))}catch{}}function so(e,a){let o=_e(oo(e,Mt));if(!o)return null;let s={};for(let[l,r]of Object.entries(_e(o.targets)??{})){let i=_e(r);i&&(s[l]={note:typeof i.note=="string"?i.note:"",style:ao(i.style,{kind:"inherit"})})}return{form:ro(o.form,a),targets:s}}function lo(e,a){Nt(a,Mt,e)}function Dt(e){try{e?.removeItem(Mt)}catch{}}function io(e,a){let o=oo(e,Bt);return Array.isArray(o)?o.flatMap(s=>{let l=_e(s);return typeof l?.name=="string"&&l.name.trim()?[{name:l.name,form:ro(l.form,a)}]:[]}):[]}function no(e,a,o){let s=[...e.filter(l=>l.name!==a.name),a].sort((l,r)=>l.name.localeCompare(r.name));return Nt(o,Bt,s),s}function uo(e,a,o){let s=e.filter(l=>l.name!==a);return Nt(o,Bt,s),s}function co(e,a){let o=Number.isFinite(e)?Math.max(0,Math.trunc(e)):0,s=Number.isFinite(a)?Math.max(1,Math.min(16,Math.trunc(a))):4;return{batched:o===0?0:Math.ceil(o/s),individual:o}}var Us={schemaId:"simple",format:"xml",outputMode:"structured",multiCharacter:"split",phase2Enabled:!1,phase2Instruction:"",phase2AllowSplits:!1,phase2SchemaId:null,phase2Format:null},fo=["markdown","xml","json"];function mo(e){return e?{schemaId:e.schema.id,format:e.format,outputMode:e.outputMode,multiCharacter:e.multiCharacter,phase2Enabled:e.phase2?.enabled===!0,phase2Instruction:e.phase2?.instruction??"",phase2AllowSplits:e.phase2?.allowSplits===!0,phase2SchemaId:e.phase2?.override?.schema.id??null,phase2Format:e.phase2?.override?.format??null}:{...Us}}function po(e,a,o){let s=a.find(i=>i.id===e.schemaId)??a[0];if(!s)return null;let l=e.phase2SchemaId?a.find(i=>i.id===e.phase2SchemaId):void 0,r=e.phase2SchemaId||e.phase2Format?{schema:l??s,format:e.phase2Format??e.format}:void 0;return{schema:s,format:e.format,outputMode:e.outputMode,multiCharacter:e.multiCharacter,structuredOutput:o,...e.phase2Enabled?{phase2:{enabled:!0,instruction:e.phase2Instruction,allowSplits:e.phase2AllowSplits,...r?{override:r}:{}}}:{}}}function ho({localization:e,draft:a,schemas:o,schemasError:s,agentStructuredOutput:l,onChange:r,onEditSchemas:i}){let n=(u,h)=>ae(e,u,h),p=(o??[]).map(u=>t("option",{value:u.id,children:u.builtIn?n("cardEditor.transform.schemaBuiltIn",{name:u.name}):u.name},u.id)),x=u=>n(`cardEditor.transform.format.${u}`);return d("fieldset",{className:"ce-section","data-ce-section":"transform",children:[t("legend",{className:"ce-section-heading",children:n("cardEditor.transform.title")}),d("div",{className:"ce-transform-row",children:[d("label",{className:"ce-label",htmlFor:"ce-transform-schema",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.schema")}),d("span",{className:"ce-inline-controls",children:[t("select",{id:"ce-transform-schema",className:"mari-chrome-field ce-field",value:a.schemaId,disabled:!o,onChange:u=>r({schemaId:u.target.value}),children:p}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:i,children:n("cardEditor.transform.editSchemas")})]})]}),d("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.formatLabel")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":n("cardEditor.transform.formatLabel"),children:fo.map(u=>t("button",{type:"button",role:"radio","aria-checked":a.format===u,className:"ce-segment",onClick:()=>r({format:u}),children:x(u)},u))})]})]}),s?t("div",{className:"ce-status ce-status--error",role:"alert",children:n("cardEditor.transform.schemasError")}):null,d("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.multiTitle")}),d("div",{className:"ce-choice-list",children:[t(ye,{name:"ce-multi",value:"merge",checked:a.multiCharacter==="merge",onChange:()=>r({multiCharacter:"merge"}),title:n("cardEditor.transform.multiMerge")}),t(ye,{name:"ce-multi",value:"split",checked:a.multiCharacter==="split",onChange:()=>r({multiCharacter:"split"}),title:n("cardEditor.transform.multiSplit")})]}),t("small",{children:a.multiCharacter==="split"?n("cardEditor.transform.multiSplitHint"):n("cardEditor.transform.multiMergeHint")})]}),d("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.outputModeTitle")}),d("div",{className:"ce-choice-list",children:[t(ye,{name:"ce-output-mode",value:"structured",checked:a.outputMode==="structured",onChange:()=>r({outputMode:"structured"}),title:n("cardEditor.transform.outputStructured")}),t(ye,{name:"ce-output-mode",value:"document",checked:a.outputMode==="document",onChange:()=>r({outputMode:"document"}),title:n("cardEditor.transform.outputDocument")})]}),t("small",{children:a.outputMode==="structured"?n("cardEditor.transform.outputStructuredHint",{format:x(a.format)}):n("cardEditor.transform.outputDocumentHint")})]}),t("p",{className:"ce-caption",role:"status",children:n(l===null?"cardEditor.transform.providerJsonUnknown":l?"cardEditor.transform.providerJsonOn":"cardEditor.transform.providerJsonOff")}),d("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:a.phase2Enabled,onChange:u=>r({phase2Enabled:u.target.checked})}),d("span",{className:"ce-choice-copy",children:[t("strong",{children:n("cardEditor.transform.phase2")}),t("small",{children:n("cardEditor.transform.phase2Hint")})]})]}),a.phase2Enabled?d("div",{className:"ce-phase2-box",children:[d("label",{className:"ce-label",htmlFor:"ce-phase2-instruction",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.phase2Instruction")}),t("textarea",{id:"ce-phase2-instruction",className:"mari-chrome-field ce-field ce-textarea",value:a.phase2Instruction,placeholder:n("cardEditor.transform.phase2InstructionPlaceholder"),onChange:u=>r({phase2Instruction:u.target.value})})]}),d("div",{className:"ce-transform-row",children:[d("label",{className:"ce-label",htmlFor:"ce-phase2-schema",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.phase2Schema")}),d("select",{id:"ce-phase2-schema",className:"mari-chrome-field ce-field",value:a.phase2SchemaId??"",onChange:u=>r({phase2SchemaId:u.target.value||null}),children:[t("option",{value:"",children:n("cardEditor.transform.sameAsPhase1")}),p]})]}),d("label",{className:"ce-label",htmlFor:"ce-phase2-format",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.formatLabel")}),d("select",{id:"ce-phase2-format",className:"mari-chrome-field ce-field",value:a.phase2Format??"",onChange:u=>r({phase2Format:u.target.value||null}),children:[t("option",{value:"",children:n("cardEditor.transform.sameAsPhase1")}),fo.map(u=>t("option",{value:u,children:x(u)},u))]})]})]}),d("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:a.phase2AllowSplits,disabled:a.multiCharacter!=="split",onChange:u=>r({phase2AllowSplits:u.target.checked})}),t("span",{className:"ce-choice-copy",children:t("strong",{children:n("cardEditor.transform.phase2AllowSplits")})})]})]}):null]})}function go({localization:e,characterIds:a,prefill:o,onClose:s,onDispatched:l}){let r=(c,V)=>ae(e,c,V),[i,n]=f([]),[p,x]=f(!0),[u,h]=f(null),[b,v]=f(!1),[S,B]=f(null),[N,O]=f(!1),[M,K]=f(""),[A]=f(()=>Qr(Te())),[R]=f(()=>({mode:A?.mode??"individual",batchSize:A?.batchSize??4,connectionId:A?.connectionId??null,presetId:o?.presetId??A?.presetId??"standard",customTemplate:A?.customTemplate??"",globalInstruction:o?.globalInstruction??A?.globalInstruction??"",behavior:{kind:"none"},globalLorebookIds:A?.globalLorebookIds??[],rebalance:A?.rebalance??!1,providerRetries:A?.providerRetries??2,refusalRetries:A?.refusalRetries??3,concurrency:A?.concurrency??1,completionMode:A?.completionMode??"ask",saveMode:o?.saveMode??A?.saveMode??"confirm",duplicatePrefix:o?.duplicatePrefix??A?.duplicatePrefix??"",duplicateSuffix:A?.duplicateSuffix??" (Edited)",duplicateRemovePrefix:A?.duplicateRemovePrefix??"",duplicateRemoveSuffix:A?.duplicateRemoveSuffix??"",combinedCardName:o?.combinedCardName??(o?.label?`${o.label} \u2014 Cast`:A?.combinedCardName??""),transformDraft:{...mo(A?.transform),...o?.schemaId?{schemaId:o.schemaId}:{},...o?.format?{format:o.format}:{}}})),[T,j]=f(()=>so(Te(),R)),[z]=f(()=>T?.form??R),[W,Y]=f(z.mode),[$,J]=f(z.batchSize),[P,X]=f(z.connectionId),[_,fe]=f(z.presetId),[me,I]=f(z.customTemplate),[y,w]=f(z.globalInstruction),[D,te]=f(z.behavior),[se,xe]=f(z.globalLorebookIds),[le,Me]=f(z.rebalance),[Be,Le]=f(z.providerRetries),[Ce,ke]=f(z.refusalRetries),[g,k]=f(z.concurrency),[C,U]=f(z.completionMode),[m,E]=f(z.saveMode),[F,H]=f(z.duplicatePrefix),[Z,he]=f(z.duplicateSuffix),[pe,we]=f(z.duplicateRemovePrefix),[Oe,Ze]=f(z.duplicateRemoveSuffix),[Ie,Ve]=f(z.combinedCardName),[Se,Qe]=f(z.transformDraft),[L,Q]=f(()=>io(Te(),R)),[ee,Pe]=f(""),Ne=oe(T!==null),Ra=oe(!1),[De,ma]=f(null),[it,Ta]=f(!1),[ea,dt]=f(null),[_t,Vt]=f(!1),[pa,Gt]=f(!1),[Wt,$t]=f(null),[Xt,Ko]=f(null),nt=ve(!_t,()=>pa,s),aa=_==="transform";G(()=>{if(!aa||De!==null)return;let c=new AbortController;return sa(c.signal).then(V=>{ma(V),Qe(re=>V.some(ge=>ge.id===re.schemaId)?re:{...re,schemaId:V[0]?.id??"simple"})}).catch(()=>Ta(!0)),gr(c.signal).then(V=>dt(V.structuredOutput)).catch(()=>{}),()=>c.abort()},[aa,De]);let[ut]=f(()=>[...new Set(a)]);G(()=>{let c=!1,V=new AbortController;return x(!0),Promise.allSettled(ut.map(re=>Ue(re,V.signal))).then(re=>{c||(n(re.map((ge,Ma)=>{let ra=ut[Ma],Ba=T?.targets[ra]??{note:"",style:{kind:"inherit"}};return ge.status==="fulfilled"?{characterId:ra,name:ge.value.name,avatarPath:ge.value.avatarPath,card:ge.value.fields,...Ba,loadError:!1}:{characterId:ra,name:ra,avatarPath:null,card:null,...Ba,loadError:!0}})),x(!1))}),()=>{c=!0,V.abort()}},[ut]),G(()=>{let c=new AbortController;return vr(c.signal).then(V=>h(V)).catch(()=>v(!0)),()=>c.abort()},[]),G(()=>{let c=new AbortController;return Rr(c.signal).then(V=>B(V)).catch(()=>O(!0)),()=>c.abort()},[]),G(()=>{let c=A?.behaviorCharacterId;if(!c||Ne.current)return;let V=!1;return yr(c).then(re=>{V||te({kind:"character",id:re.id,name:re.name,avatarPath:re.avatarPath})}).catch(()=>{}),()=>{V=!0}},[A]),G(()=>{if(p)return;let c=nt.current,V=c?.querySelector("[data-ce-autofocus]");if(!c||!V)return;let re=document.activeElement;(!re||re===document.body||re instanceof HTMLElement&&re.classList.contains("ce-dialog-close")||re===c)&&V.focus()},[p,nt]);let Jo=c=>{c==="custom"&&_!=="custom"&&(!me.trim()||Object.values(Et).includes(me))&&Fr(_)&&I(Et[_]),fe(c)},Yo=(c,V)=>n(re=>re.map(ge=>ge.characterId===c?{...ge,...V}:ge)),Zo=c=>n(V=>V.filter(re=>re.characterId!==c)),ct=(S??[]).filter(c=>!M.trim()||c.name.toLocaleLowerCase().includes(M.trim().toLocaleLowerCase())),jt=co(i.length,$),ft=i.some(c=>c.loadError||!c.card),mt=m==="combined"&&Ie.trim().length===0,Kt=aa&&(De===null||De.length===0),Qo=Wa(i[0]?.name??"Character",{prefix:F,suffix:Z,removePrefix:pe,removeSuffix:Oe});G(()=>{let c=!1;return qa().then(V=>{c||Ko(V)}).catch(()=>{}),()=>{c=!0}},[]);let Fe=Xt?.disableAutoVerdicts===!0;G(()=>{Fe&&(E(c=>c==="auto"?"confirm":c),U(c=>c==="ask"?c:"ask"))},[Fe]);let pt=(u?.find(c=>c.id===P)??u?.find(c=>c.defaultForAgents)??u?.find(c=>c.isDefault)??null)?.maxParallelJobs,Jt=typeof pt=="number"&&Number.isFinite(pt)?Math.min(16,Math.max(1,Math.trunc(pt))):4,Yt=Xt?.maxParallelAgents??null,ta=Yt===null?Jt:Math.min(Jt,Yt);G(()=>{k(c=>Math.min(c,ta))},[ta]);let Zt=T!==null||A?.concurrency!==void 0,Qt=oe(!1);G(()=>{Zt||Qt.current||u===null&&!b||(Qt.current=!0,k(ta))},[Zt,u,b,ta]);let er={mode:W,batchSize:$,connectionId:P,presetId:_,customTemplate:me,globalInstruction:y,behavior:D,globalLorebookIds:se,rebalance:le,providerRetries:Be,refusalRetries:Ce,concurrency:g,completionMode:C,saveMode:m,duplicatePrefix:F,duplicateSuffix:Z,duplicateRemovePrefix:pe,duplicateRemoveSuffix:Oe,combinedCardName:Ie,transformDraft:Se},ar=JSON.stringify({form:er,targets:Object.fromEntries(i.map(c=>[c.characterId,{note:c.note,style:c.style}]))});G(()=>{!Ne.current||Ra.current||p||lo(JSON.parse(ar),Te())},[ar,p]);let tr=c=>{Ne.current=!0,Y(c.mode),J(c.batchSize),X(c.connectionId),fe(c.presetId),I(c.customTemplate),w(c.globalInstruction),te(c.behavior),xe(c.globalLorebookIds),Me(c.rebalance),Le(c.providerRetries),ke(c.refusalRetries),k(Math.min(c.concurrency,ta)),U(Fe?"ask":c.completionMode),E(Fe&&c.saveMode==="auto"?"confirm":c.saveMode),H(c.duplicatePrefix),he(c.duplicateSuffix),we(c.duplicateRemovePrefix),Ze(c.duplicateRemoveSuffix),Ve(c.combinedCardName),Qe(c.transformDraft)},es=()=>{tr(R),n(c=>c.map(V=>({...V,note:"",style:{kind:"inherit"}}))),Ne.current=!1,Dt(Te()),j(null)},as=()=>{let c=ee.trim();c&&Q(V=>no(V,{name:c,form:er},Te()))},Ge=L.find(c=>c.name===ee.trim()),ts=async()=>{if(pa||i.length===0||ft||mt||Kt)return;Gt(!0),$t(null);let c=Ya({...aa?{transform:po(Se,De??[],ea!==!1)}:{},mode:W,batchSize:$,connectionId:P,presetId:_,..._==="custom"?{customTemplate:me}:{},globalInstruction:y,behaviorCharacterId:D.kind==="character"?D.id:null,globalLorebookIds:se,rebalance:le,providerRetries:Be,refusalRetries:Ce,concurrency:g,saveMode:m,completionMode:C,...F.trim()?{duplicatePrefix:F}:{},...Z.trim()?{duplicateSuffix:Z}:{},...pe.trim()?{duplicateRemovePrefix:pe}:{},...Oe.trim()?{duplicateRemoveSuffix:Oe}:{},...m==="combined"?{combinedCardName:Ie.trim()}:{}});try{let V=[...new Set(i.flatMap(ce=>ce.style.kind==="character"?[ce.style.id]:[]))],[re,ge,Ma]=await Promise.all([Promise.all(V.map(ce=>Ue(ce))),D.kind==="character"?Ue(D.id):Promise.resolve(null),Promise.all(se.map(async ce=>({name:(S??[]).find(rs=>rs.id===ce)?.name??ce,entries:await kr(ce)})))]),ra=new Map(re.map((ce,rr)=>[V[rr],ce])),Ba=await cr({targets:i.map(ce=>({characterId:ce.characterId,characterName:ce.name,card:ce.card,...ce.note.trim()?{note:ce.note.trim()}:{},...ce.style.kind==="none"?{behaviorOverride:null}:ce.style.kind==="character"?{behaviorOverride:ce.style.id,behaviorOverrideCard:yt(ra.get(ce.style.id))}:{}})),config:c,...o?.label?.trim()?{label:o.label.trim().slice(0,200)}:{},...Ma.length>0?{lorebooks:Ma}:{},...ge?{behaviorCharacter:yt(ge)}:{}});eo(c,Te()),Ra.current=!0,Dt(Te()),l(Ba)}catch(V){$t(V instanceof Error?V.message:String(V)),Gt(!1)}};return d("div",{className:"ce-overlay",role:"presentation",children:[d("section",{ref:nt,className:"ce-dialog ce-shell",role:"dialog","aria-modal":"true","aria-label":r("cardEditor.dialog.title"),tabIndex:-1,onChangeCapture:()=>{Ne.current=!0},onClickCapture:c=>{c.target.closest("button, input, select, label")&&(Ne.current=!0)},children:[d("div",{className:"ce-dialog-head",children:[t("strong",{children:r("cardEditor.dialog.title")}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:pa,"aria-label":r("cardEditor.dialog.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),d("div",{className:"ce-dialog-body",children:[T?d("div",{className:"ce-status",role:"status",children:[t("span",{children:r("cardEditor.dialog.draft.restored")})," ",t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:es,children:r("cardEditor.dialog.draft.discard")})]}):null,d("fieldset",{className:"ce-section","data-ce-section":"presets",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.presets.title")}),d("label",{className:"ce-label",htmlFor:"ce-settings-preset",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.presets.name")}),t("input",{id:"ce-settings-preset",type:"text",list:"ce-settings-preset-list",className:"mari-chrome-field ce-field",value:ee,placeholder:r("cardEditor.dialog.presets.namePlaceholder"),onChange:c=>Pe(c.target.value)}),t("datalist",{id:"ce-settings-preset-list",children:L.map(c=>t("option",{value:c.name},c.name))}),t("small",{children:r("cardEditor.dialog.presets.hint")})]}),d("div",{className:"ce-preset-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!Ge,onClick:()=>Ge&&tr(Ge.form),children:r("cardEditor.dialog.presets.load")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!ee.trim(),onClick:as,children:r(Ge?"cardEditor.dialog.presets.overwrite":"cardEditor.dialog.presets.save")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!Ge,onClick:()=>Ge&&Q(c=>uo(c,Ge.name,Te())),children:r("cardEditor.dialog.presets.delete")})]})]}),t(Dr,{localization:e,targets:i,targetsLoading:p,onUpdateTarget:Yo,onRemoveTarget:Zo}),d("fieldset",{className:"ce-section","data-ce-section":"model",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.model.title")}),d("label",{className:"ce-label",htmlFor:"ce-connection",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.model.connection")}),d("select",{id:"ce-connection",className:"mari-chrome-field ce-field",value:P??"","data-ce-autofocus":!0,onChange:c=>X(c.target.value||null),children:[t("option",{value:"",children:r("cardEditor.dialog.model.connectionDefault")}),(u??[]).map(c=>t("option",{value:c.id,children:c.model?`${c.name} \xB7 ${c.model}`:c.name},c.id))]})]}),u===null&&!b?t("p",{className:"ce-caption",children:r("cardEditor.dialog.model.connectionsLoading")}):null,b?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.dialog.model.connectionsError")}):null,d("label",{className:"ce-label",htmlFor:"ce-preset",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.model.preset")}),d("select",{id:"ce-preset",className:"mari-chrome-field ce-field",value:_,onChange:c=>Jo(c.target.value),children:[t("option",{value:"transform",children:r("cardEditor.dialog.model.presetTransform")}),t("option",{value:"standard",children:r("cardEditor.dialog.model.presetStandard")}),t("option",{value:"strict",children:r("cardEditor.dialog.model.presetStrict")}),t("option",{value:"rebalance",children:r("cardEditor.dialog.model.presetRebalance")}),t("option",{value:"xml-simple",children:r("cardEditor.dialog.model.presetXmlSimple")}),t("option",{value:"xml-complex",children:r("cardEditor.dialog.model.presetXmlComplex")}),t("option",{value:"custom",children:r("cardEditor.dialog.model.presetCustom")})]})]}),_==="custom"?d("label",{className:"ce-label",htmlFor:"ce-custom-template",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.model.customTemplate")}),t("textarea",{id:"ce-custom-template",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:me,onChange:c=>I(c.target.value)}),t("small",{children:r("cardEditor.dialog.model.customTemplateHint")})]}):null]}),aa?t(ho,{localization:e,draft:Se,schemas:De,schemasError:it,agentStructuredOutput:ea,onChange:c=>Qe(V=>({...V,...c})),onEditSchemas:()=>Vt(!0)}):null,d("fieldset",{className:"ce-section","data-ce-section":"instructions",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.instructions.title")}),d("label",{className:"ce-label",htmlFor:"ce-global-instruction",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.instructions.global")}),t("textarea",{id:"ce-global-instruction",className:"mari-chrome-field ce-field ce-textarea",value:y,placeholder:r("cardEditor.dialog.instructions.globalPlaceholder"),onChange:c=>w(c.target.value)})]}),d("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.instructions.behavior")}),t(Xa,{localization:e,selection:D,onChange:te,buttonLabel:r("cardEditor.dialog.instructions.behavior"),noneLabel:r("cardEditor.dialog.instructions.behaviorNone")}),t("small",{children:r("cardEditor.dialog.instructions.behaviorHint")})]}),d("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.instructions.lorebooks")}),t("input",{type:"search",className:"mari-chrome-field ce-field",value:M,placeholder:r("cardEditor.dialog.instructions.lorebooksFilter"),"aria-label":r("cardEditor.dialog.instructions.lorebooksFilter"),onChange:c=>K(c.target.value)}),S===null&&!N?t("p",{className:"ce-caption",children:r("cardEditor.dialog.instructions.lorebooksLoading")}):null,N?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.dialog.instructions.lorebooksError")}):null,S!==null&&S.length===0?t("p",{className:"ce-caption",children:r("cardEditor.dialog.instructions.lorebooksEmpty")}):null,S!==null&&S.length>0&&ct.length===0?t("p",{className:"ce-caption",children:r("cardEditor.dialog.instructions.lorebooksNoneMatch")}):null,ct.length>0?t("div",{className:"ce-lorebook-list",children:ct.map(c=>d("label",{className:"ce-lorebook",children:[t("input",{type:"checkbox",checked:se.includes(c.id),onChange:V=>xe(re=>V.target.checked?[...new Set([...re,c.id])]:re.filter(ge=>ge!==c.id))}),t("span",{className:"ce-lorebook-name",children:c.name})]},c.id))}):null,t("small",{children:r("cardEditor.dialog.instructions.lorebooksHint")})]})]}),d("fieldset",{className:"ce-section","data-ce-section":"processing",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.processing.title")}),d("div",{className:"ce-choice-list",children:[t(ye,{name:"ce-mode",value:"individual",checked:W==="individual",onChange:()=>Y("individual"),title:r("cardEditor.dialog.processing.modeIndividual")}),t(ye,{name:"ce-mode",value:"batched",checked:W==="batched",onChange:()=>Y("batched"),title:r("cardEditor.dialog.processing.modeBatched")})]}),d("div",{className:"ce-number-grid",children:[t(Je,{id:"ce-batch-size",label:r("cardEditor.dialog.processing.batchSize"),value:$,min:1,max:16,onChange:J}),t(Je,{id:"ce-provider-retries",label:r("cardEditor.dialog.processing.providerRetries"),value:Be,min:0,max:5,onChange:Le}),t(Je,{id:"ce-refusal-retries",label:r("cardEditor.dialog.processing.refusalRetries"),value:Ce,min:0,max:5,onChange:ke}),t(Je,{id:"ce-concurrency",label:r("cardEditor.dialog.processing.concurrency"),value:g,min:1,max:ta,onChange:k})]}),aa?null:d("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:le,onChange:c=>Me(c.target.checked)}),d("span",{className:"ce-choice-copy",children:[t("strong",{children:r("cardEditor.dialog.processing.rebalance")}),t("small",{children:r("cardEditor.dialog.processing.rebalanceHint")})]})]}),d("label",{className:"ce-label",htmlFor:"ce-completion-mode",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.processing.completionMode")}),d("select",{id:"ce-completion-mode",className:"mari-chrome-field ce-field",value:C,onChange:c=>U(c.target.value),children:[t("option",{value:"ask",children:r("cardEditor.dialog.processing.completionAsk")}),t("option",{value:"apply",disabled:Fe,children:r("cardEditor.dialog.processing.completionApply")}),t("option",{value:"duplicate",disabled:Fe,children:r("cardEditor.dialog.processing.completionDuplicate")})]}),Fe?t("small",{children:r("cardEditor.dialog.processing.autoDisabledNote")}):t("small",{children:r("cardEditor.dialog.processing.completionCaption")})]}),t("p",{className:"ce-caption",children:r("cardEditor.dialog.processing.overflowCaption")})]}),d("fieldset",{className:"ce-section","data-ce-section":"saving",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.saving.title")}),d("div",{className:"ce-choice-list",children:[t(ye,{name:"ce-save-mode",value:"confirm",checked:m==="confirm",onChange:c=>E(c),title:r("cardEditor.dialog.saving.confirm")}),t(ye,{name:"ce-save-mode",value:"auto",checked:m==="auto",onChange:c=>E(c),title:r("cardEditor.dialog.saving.auto"),disabled:Fe}),t(ye,{name:"ce-save-mode",value:"duplicate",checked:m==="duplicate",onChange:c=>E(c),title:r("cardEditor.dialog.saving.duplicate")}),m==="duplicate"?d(ze,{children:[d("label",{className:"ce-label",htmlFor:"ce-duplicate-prefix",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.saving.duplicatePrefix")}),t("input",{id:"ce-duplicate-prefix",type:"text",className:"mari-chrome-field ce-field",value:F,placeholder:r("cardEditor.dialog.saving.duplicatePrefixPlaceholder"),"aria-label":r("cardEditor.dialog.saving.duplicatePrefix"),onChange:c=>H(c.target.value)}),t("small",{children:r("cardEditor.dialog.saving.duplicatePrefixHint")})]}),d("label",{className:"ce-label",htmlFor:"ce-duplicate-suffix",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.saving.duplicateSuffix")}),t("input",{id:"ce-duplicate-suffix",type:"text",className:"mari-chrome-field ce-field",value:Z,placeholder:r("cardEditor.dialog.saving.duplicateSuffixPlaceholder"),"aria-label":r("cardEditor.dialog.saving.duplicateSuffix"),onChange:c=>he(c.target.value)})]}),t("p",{className:"ce-divider-caption",children:r("cardEditor.dialog.saving.duplicateRemoveGroup")}),d("label",{className:"ce-label",htmlFor:"ce-duplicate-remove-prefix",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.saving.duplicateRemovePrefix")}),t("input",{id:"ce-duplicate-remove-prefix",type:"text",className:"mari-chrome-field ce-field",value:pe,placeholder:r("cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder"),"aria-label":r("cardEditor.dialog.saving.duplicateRemovePrefix"),onChange:c=>we(c.target.value)})]}),d("label",{className:"ce-label",htmlFor:"ce-duplicate-remove-suffix",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.saving.duplicateRemoveSuffix")}),t("input",{id:"ce-duplicate-remove-suffix",type:"text",className:"mari-chrome-field ce-field",value:Oe,placeholder:r("cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder"),"aria-label":r("cardEditor.dialog.saving.duplicateRemoveSuffix"),onChange:c=>Ze(c.target.value)})]}),t("p",{className:"ce-caption",children:r("cardEditor.dialog.saving.duplicateNamePreview",{name:Qo})})]}):null,t(ye,{name:"ce-save-mode",value:"combined",checked:m==="combined",onChange:c=>E(c),title:r("cardEditor.dialog.saving.combined")}),m==="combined"?d("label",{className:"ce-label",htmlFor:"ce-combined-name",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.saving.combinedName")}),t("input",{id:"ce-combined-name",type:"text",className:"mari-chrome-field ce-field",value:Ie,placeholder:r("cardEditor.dialog.saving.combinedNamePlaceholder"),"aria-label":r("cardEditor.dialog.saving.combinedName"),onChange:c=>Ve(c.target.value)}),t("small",{children:r("cardEditor.dialog.saving.combinedCaption")})]}):null]}),Fe?t("p",{className:"ce-caption",children:r("cardEditor.dialog.saving.reviewRequiredHint")}):null,t("p",{className:"ce-caption",children:r("cardEditor.dialog.saving.caption")})]})]}),d("div",{className:"ce-dialog-foot",children:[Wt?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:r("cardEditor.dialog.dispatchError",{message:Wt})}):null,ft?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:r("cardEditor.dialog.targets.unloadableBlock")}):null,mt?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:r("cardEditor.dialog.saving.combinedNameRequired")}):null,t("span",{className:"ce-estimate",children:r("cardEditor.dialog.estimate",{batch:$,batchedCalls:jt.batched,individualCalls:jt.individual})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:pa||i.length===0||ft||mt||Kt,onClick:()=>{ts()},children:r(pa?"cardEditor.dialog.dispatching":"cardEditor.dialog.dispatch")})]})]}),_t?t(jr,{localization:e,initialSchemaId:Se.schemaId,onClose:()=>Vt(!1),onSchemasChanged:(c,V)=>{ma(c),Qe(re=>({...re,schemaId:V}))}}):null]})}function zs(e,a){return e==="backstory"||e==="appearance"?{extensions:{[e]:a}}:{[e]:a}}function _s(e){let{name:a,...o}=e;return o}function da(e){return(e instanceof Error?e.message:String(e??""))||"unknown error"}var xo=" (Copy)";async function Vs(e,a,o){if(a.op==="hold")return{ok:!0};if(a.op==="collectForCombine")return{ok:!0};if(a.op==="patchField")return await kt(a.characterId,zs(a.field,a.newText),{versionSource:a.versionSource,versionReason:a.versionReason}),{ok:!0};let s=a,l=await wr(a.characterId),r=typeof l?.id=="string"&&l.id?l.id:"";if(!r)throw new Error("The duplicate call returned no card id.");let i=vt(l),n=a.name??(i.endsWith(xo)?i.slice(0,-xo.length):i||e.characterName),p={name:Wa(n,{...s.namePrefix===void 0?{}:{prefix:s.namePrefix},...s.nameSuffix===void 0?{}:{suffix:s.nameSuffix},...s.stripNamePrefix===void 0?{}:{removePrefix:s.stripNamePrefix},...s.stripNameSuffix===void 0?{}:{removeSuffix:s.stripNameSuffix}})},x={...a.extensions};for(let[u,h]of Object.entries(a.fields))u==="backstory"||u==="appearance"?x[u]=h:p[u]=h;return Object.keys(x).length>0&&(p.extensions=x),await kt(r,p,{versionSource:"agent",versionReason:`Card Editor bulk: ${o}`}),{ok:!0,resultCardId:r}}async function Ft(e,a,o){let s=[];for(let[l,r]of a.entries())try{s.push({index:l,...await Vs(e,r,o.label)})}catch(i){s.push({index:l,ok:!1,error:da(i)})}return s}async function na(e,a,o){try{let s=e.status==="completed"?e.config.completionMode??"ask":"ask",r=s==="duplicate"||s==="ask"&&(e.config.saveMode==="duplicate"||e.config.saveMode==="combined")?void 0:_s((await Ue(a.characterId)).fields),i=await St(e.id,a.itemId,{verdict:"approve",...o.force?{force:!0}:{},...r===void 0?{}:{currentFields:r}});if(!It(i))return{kind:"failed",message:"The verdict route answered an unexpected shape."};if(i.status==="needs-confirmation")return{kind:"needs-confirmation",holds:i.holds};let n=await Ft(a,i.ops,{label:e.label}),p;try{p=await _a(e.id,a.itemId,n)}catch(u){return{kind:"report-failed",message:da(u)}}let x=n.find(u=>!u.ok);if(x){let u=p.items.find(h=>h.itemId===a.itemId);return{kind:"apply-failed",session:p,message:u?.failure?.message??x.error??"A card write failed."}}return{kind:"applied",session:p}}catch(s){return{kind:"failed",message:da(s)}}}async function Za(e,a){if(e.status!=="completed")return{session:e,failedCount:0,messages:[]};let o=e.config.completionMode??"ask",s=e.items.filter(n=>Array.isArray(n.pendingOps)||o==="apply"&&n.status==="awaiting-review"),l=e,r=0,i=[];a?.(0,s.length);for(let[n,p]of s.entries()){let x=l.items.find(u=>u.itemId===p.itemId)??p;try{if(Array.isArray(x.pendingOps)){let u=await Ft(x,x.pendingOps,{label:l.label});l=await _a(l.id,x.itemId,u),u.some(h=>!h.ok)&&(r+=1)}else{let u=await na(l,x,{force:!1});u.kind==="applied"||u.kind==="apply-failed"?(l=u.session,u.kind==="apply-failed"&&(r+=1,i.push(u.message))):u.kind==="needs-confirmation"?l=await la(l.id):(r+=1,i.push(u.message))}}catch(u){r+=1,i.push(da(u))}a?.(n+1,s.length)}return{session:l,failedCount:r,messages:i}}async function Lo(e,a){try{let o=await St(e.id,a.itemId,{verdict:"reject"});return It(o)?{kind:"failed",message:"The verdict route answered an unexpected shape."}:{kind:"rejected",session:o}}catch(o){return{kind:"failed",message:da(o)}}}function Gs(e){return e.filter(a=>a.status==="applied").map(a=>Re((a.updates??[]).find(o=>o.field==="description")?.newText??"")).filter(a=>a.trim().length>0)}async function Io(e,a={}){try{let o=e.items.filter(p=>p.status==="applied"),s=Gs(e.items);if(o.length===0||s.length===0)return{kind:"failed",message:"No collected cards to combine yet."};let l=e.config.combinedCardName?.trim()||e.label,r=await Pr({name:l,description:s.join(`

`)}),i=typeof r?.id=="string"&&r.id?r.id:"";if(!i)throw new Error("The create call returned no card id.");return{kind:"combined",session:await Sr(e.id,{itemIds:o.map(p=>p.itemId),resultCardId:i,...a.confirmPartial?{confirmPartial:!0}:{}})}}catch(o){return{kind:"failed",message:da(o)}}}async function bo(e){let{plans:a}=await Cr(e.id),o=e,s=0;for(let l of a){let r=e.items.find(n=>n.itemId===l.itemId);if(!r)continue;let i=await Ft(r,l.ops,{label:e.label});o=await _a(e.id,l.itemId,i),i.some(n=>!n.ok)&&(s+=1)}return{session:o,failedCount:s}}function Co(e){return e.split(`
`)}function So(e,a){let o=Co(e),s=Co(a);if(e===a)return o.map(u=>({kind:"same",text:u}));let l=0;for(;l<o.length&&l<s.length&&o[l]===s[l];)l+=1;let r=o.length,i=s.length;for(;r>l&&i>l&&o[r-1]===s[i-1];)r-=1,i-=1;let n=o.slice(l,r),p=s.slice(l,i),x=o.slice(0,l).map(u=>({kind:"same",text:u}));if(n.length*p.length<=1e6){let u=Array.from({length:n.length+1},()=>new Uint32Array(p.length+1));for(let v=n.length-1;v>=0;v-=1)for(let S=p.length-1;S>=0;S-=1)u[v][S]=n[v]===p[S]?u[v+1][S+1]+1:Math.max(u[v+1][S],u[v][S+1]);let h=0,b=0;for(;h<n.length&&b<p.length;)n[h]===p[b]?(x.push({kind:"same",text:n[h]}),h+=1,b+=1):u[h+1][b]>=u[h][b+1]?(x.push({kind:"del",text:n[h]}),h+=1):(x.push({kind:"add",text:p[b]}),b+=1);for(;h<n.length;)x.push({kind:"del",text:n[h++]});for(;b<p.length;)x.push({kind:"add",text:p[b++]})}else{for(let u of n)x.push({kind:"del",text:u});for(let u of p)x.push({kind:"add",text:u})}for(let u of o.slice(r))x.push({kind:"same",text:u});return x}function vo(e,a=3){let o=[],s=[],l=0,r=()=>{s.length!==0&&(s.some(n=>n.kind!=="same")&&o.push({hiddenBefore:l,lines:s}),s=[],l=0)},i=0;for(;i<e.length;){if(e[i].kind!=="same"){s.push(e[i]),i+=1;continue}let n=i;for(;n<e.length&&e[n].kind==="same";)n+=1;let p=n-i,x=s.length>0,u=n<e.length;if(!x&&!u)break;x?u?p>a*2?(s.push(...e.slice(i,i+a)),r(),l=p-a*2,s.push(...e.slice(n-a,n))):s.push(...e.slice(i,n)):s.push(...e.slice(i,Math.min(n,i+a))):(l=Math.max(0,p-a),s.push(...e.slice(Math.max(i,n-a),n))),i=n}return r(),o}function yo(e){return e.trim().split(/\s+/u).filter(Boolean).length}function Qa(e,a){let o=new Map;for(let l of e.trim().split(/\s+/u).filter(Boolean))o.set(l,(o.get(l)??0)+1);let s=0;for(let l of a.trim().split(/\s+/u).filter(Boolean)){let r=o.get(l)??0;r===0?s+=1:r===1?o.delete(l):o.set(l,r-1)}return{added:s,removed:[...o.values()].reduce((l,r)=>l+r,0)}}var Ws={queued:"cardEditor.panel.status.queued",running:"cardEditor.panel.status.running",succeeded:"cardEditor.panel.status.succeeded","awaiting-review":"cardEditor.panel.status.awaitingReview","needs-review":"cardEditor.panel.status.needsReview",applied:"cardEditor.panel.status.applied",duplicated:"cardEditor.panel.status.duplicated",rejected:"cardEditor.panel.status.rejected","failed-provider":"cardEditor.panel.status.failedProvider","failed-refusal":"cardEditor.panel.status.failedRefusal","failed-parse":"cardEditor.panel.status.failedParse",canceled:"cardEditor.panel.status.canceled",interrupted:"cardEditor.panel.status.interrupted","awaiting-split":"cardEditor.panel.status.awaitingSplit",split:"cardEditor.panel.status.split",staged:"cardEditor.panel.status.staged"};function Pa(e){return Ws[e]??"cardEditor.panel.status.unknown"}function et(e){return e==="queued"||e==="running"||e==="succeeded"?"live":e==="awaiting-review"||e==="needs-review"||e==="awaiting-split"?"review":e==="applied"||e==="duplicated"||e==="split"||e==="staged"?"ok":e==="rejected"||e==="canceled"||e==="interrupted"?"muted":"danger"}var $s=["awaiting-review","needs-review"],Xs=["failed-provider","failed-refusal","failed-parse"];function Ee(e){return $s.includes(e.status)}function ua(e){return Xs.includes(e.status)}function ko(e){return Ee(e)||e.status==="applied"||e.status==="duplicated"||e.status==="rejected"}function wo(e){let a=e.updates??[];if(a.length===0)return null;let o=0,s=0;for(let l of a){let r=Qa(e.snapshots[l.field]??Re(l.oldText),Re(l.newText));o+=r.added,s+=r.removed}return{fields:a.length,added:o,removed:s}}function at(e){let a=e.items.filter(i=>i.status==="running").length,o=e.items.filter(i=>i.status==="queued").length,s=e.batches.filter(i=>i.status!=="split"),l=s.findIndex(i=>i.status==="running"),r=l>=0?s[l]:null;return e.config.mode==="batched"&&r?{kind:"batch",runningItems:a,queuedItems:o,batchIndex:l+1,batchCount:s.length,batchAttempts:r.attempts}:a>0?{kind:"items",runningItems:a,queuedItems:o,batchIndex:0,batchCount:0,batchAttempts:0}:o>0?{kind:"queued",runningItems:a,queuedItems:o,batchIndex:0,batchCount:0,batchAttempts:0}:{kind:"done",runningItems:a,queuedItems:o,batchIndex:0,batchCount:0,batchAttempts:0}}function Eo(e){let a=e.items.some(r=>r.phase===2)?2:1,o=e.items.filter(r=>(r.phase??1)===a),s=e.items.filter(r=>(r.phase??1)===1&&r.parentItemId===void 0).length,l=o.filter(r=>r.status==="awaiting-split").length;return{sources:s,results:o.filter(r=>r.status!=="split"&&r.status!=="rejected"&&r.status!=="canceled").reduce((r,i)=>r+(i.status==="awaiting-split"?i.characters?.length??1:1),0),splitsPending:l,splitsAccepted:o.filter(r=>r.status==="split").length,phase:a,phase2Ready:e.config.transform?.phase2?.enabled===!0&&a===1&&e.status!=="active"&&l===0&&e.items.some(r=>r.status==="staged")}}function Po(e,a){return!e.parentItemId||!e.lineage?.splitGroupId?!1:a.find(s=>s.itemId===e.parentItemId)?.status==="split"}var js={"2:3":.6666666666666666,"3:4":.75,"9:16":.5625},Ro={method:"portrait",aspect:"3:4",columns:0,gap:8,resolution:2},Aa={x:0,y:0,scale:100};function tt(e,a,o){return Math.min(o,Math.max(a,Math.round(e)))}function ca(e,a=50){let o=a>0?a:50;return{x:tt(Number.isFinite(e?.x)?e.x:0,-100,100),y:tt(Number.isFinite(e?.y)?e.y:0,-100,100),scale:tt(Number.isFinite(e?.scale)?e.scale:100,o,200)}}function Ks(e,a){let o=Math.floor(e);if(!(o>0))return{cols:1,rows:1};let s=a>0&&Number.isFinite(a)?a:1,l={cols:1,rows:o},r=1/0;for(let i=1;i<=o;i++){let n=Math.ceil(o/i),p=Math.abs(n/i-s);p<r&&(r=p,l={cols:i,rows:n})}return l}function Ao(e,a,o,s,l,r){let i=l>1?(a-l)/(l-1):s,n=r>1?(o-r)/(r-1):s,p=Math.min(Math.max(0,s),Math.max(0,Math.floor(Math.min(i,n)))),x=(a-p*(l-1))/l,u=(o-p*(r-1))/r;return x<=0||u<=0?[]:Array.from({length:e},(h,b)=>({x:b%l*(x+p),y:Math.floor(b/l)*(u+p),w:x,h:u}))}function To(e,a,o,s,l=[]){let r=Math.floor(a);if(!(r>0)||!(o>0)||!(s>0))return[];if(e.columns>=1){let u=Math.min(e.columns,r);return Ao(r,o,s,e.gap,u,Math.ceil(r/u))}let i=s/o,n=i;if(e.method==="portrait")n=js[e.aspect]*i;else if(e.method==="best-fit"){let u=l.filter(h=>typeof h=="number"&&h>0);u.length>0&&(n=Math.exp(u.reduce((h,b)=>h+Math.log(b),0)/u.length)*i)}let{cols:p,rows:x}=Ks(r,n);return Ao(r,o,s,e.gap,p,x)}function Ot(e,a,o){if(!(a>0)||!(o>0)||!(e.w>0)||!(e.h>0))return 50;let s=e.w/a,l=e.h/o;return Math.ceil(100*Math.min(s,l)/Math.max(s,l))}function Mo(e,a,o,s){if(!(a>0)||!(o>0)||!(e.w>0)||!(e.h>0))return null;let l=ca(s,Ot(e,a,o)),r=Math.max(e.w/a,e.h/o)*(l.scale/100),i=a*r,n=o*r;return{dx:e.x+(e.w-i)/2+l.x/100*e.w,dy:e.y+(e.h-n)/2+l.y/100*e.h,dw:i,dh:n}}function qt(e,a,o,s){return ca({...e,x:e.x+a,y:e.y+o},s)}function rt(e,a,o){return ca({...e,scale:e.scale+a},o)}function Bo(e,a,o,s){return!(a>0)||!(o>0)?e:tt(e*(o/a),s,200)}function Ht(e,a,o){return e.findIndex(s=>a>=s.x&&a<s.x+s.w&&o>=s.y&&o<s.y+s.h)}function No(e){return{width:512*e.resolution,height:768*e.resolution}}function Js(e){let a=[...new Set(e.items.filter(r=>r.parentItemId===void 0).map(r=>r.characterId))],o=e.items.flatMap(r=>r.resultCardId?[r.resultCardId]:[]),s=e.items.filter(r=>r.status==="applied"&&!r.resultCardId).map(r=>r.characterId),l=[...new Set([...e.combinedCardId?[e.combinedCardId]:[],...o,...s])];return{sources:[...new Set([...a,...o])],targets:l}}function Ys(e){return new Promise(a=>{let o=new Image;o.onload=()=>a(o),o.onerror=()=>a(null),o.src=e})}function Zs(e){return e.split(/\s+/).filter(Boolean).slice(0,2).map(a=>a[0].toUpperCase()).join("")}function Do({localization:e,session:a,onClose:o}){let s=(g,k)=>ae(e,g,k),[{sources:l,targets:r}]=f(()=>Js(a)),[i,n]=f(null),[p,x]=f(()=>new Set(l)),[u,h]=f(l),[b,v]=f(r[0]??""),[S,B]=f(Ro),[N,O]=f({}),[M,K]=f(0),[A,R]=f(!1),[T,j]=f(null),z=oe(null),W=oe({pointers:new Map}),Y=ve(!0,()=>A,o);G(()=>{let g=!1,k=[...new Set([...l,...r])];return Promise.all(k.map(async C=>{try{let U=await Ue(C);return{id:C,name:U.name,image:U.avatarPath?await Ys(U.avatarPath):null}}catch{return{id:C,name:C,image:null}}})).then(C=>{g||n(C)}),()=>{g=!0}},[l,r]);let $=new Map((i??[]).map(g=>[g.id,g])),J=u.filter(g=>p.has(g)).map(g=>$.get(g)??{id:g,name:g,image:null}),P=No(S),X=To(S,J.length,P.width,P.height,J.map(g=>g.image?g.image.naturalWidth/g.image.naturalHeight:null)),_=Math.min(M,Math.max(0,J.length-1)),fe=g=>{let k=J[g],C=X[g];return k?.image&&C?Ot(C,k.image.naturalWidth,k.image.naturalHeight):50},me=g=>N[g]??Aa,I=(g,k)=>{let C=J[g];C&&O(U=>({...U,[C.id]:k(U[C.id]??Aa,fe(g))}))},y=g=>{let k=z.current,C=k?.getContext("2d");if(!k||!C)return;C.clearRect(0,0,k.width,k.height),C.fillStyle="#16121f",C.fillRect(0,0,k.width,k.height),J.forEach((m,E)=>{let F=X[E];if(!F)return;C.save(),C.beginPath(),C.rect(F.x,F.y,F.w,F.h),C.clip();let H=m.image?Mo(F,m.image.naturalWidth,m.image.naturalHeight,me(m.id)):null;m.image&&H?C.drawImage(m.image,H.dx,H.dy,H.dw,H.dh):(C.fillStyle="#2b2540",C.fillRect(F.x,F.y,F.w,F.h),C.fillStyle="#e8d4ff",C.font=`700 ${Math.round(Math.min(F.w,F.h)*.28)}px sans-serif`,C.textAlign="center",C.textBaseline="middle",C.fillText(Zs(m.name),F.x+F.w/2,F.y+F.h/2)),C.restore()});let U=X[_];g&&U&&J.length>1&&(C.strokeStyle="#36cdde",C.lineWidth=Math.max(3,Math.round(k.width/256)),C.strokeRect(U.x+1.5,U.y+1.5,U.w-3,U.h-3))};G(()=>y(!0));let w=g=>{let k=z.current,C=k.getBoundingClientRect();return{x:(g.clientX-C.left)*k.width/C.width,y:(g.clientY-C.top)*k.height/C.height}},D=g=>{let k=w(g),C=Ht(X,k.x,k.y);if(C>=0&&W.current.pointers.size===0&&K(C),g.currentTarget.setPointerCapture(g.pointerId),W.current.pointers.set(g.pointerId,k),W.current.pointers.size===2){let[U,m]=[...W.current.pointers.values()];W.current.pinch={distance:Math.hypot(U.x-m.x,U.y-m.y),scale:me(J[_]?.id??"").scale}}},te=g=>{let k=W.current.pointers.get(g.pointerId);if(!k)return;let C=w(g);W.current.pointers.set(g.pointerId,C);let U=X[_];if(!U)return;if(W.current.pointers.size===2&&W.current.pinch){let[F,H]=[...W.current.pointers.values()],Z=W.current.pinch;I(_,(he,pe)=>({...he,scale:Bo(Z.scale,Z.distance,Math.hypot(F.x-H.x,F.y-H.y),pe)}));return}let m=(C.x-k.x)/U.w*100,E=(C.y-k.y)/U.h*100;I(_,(F,H)=>qt(F,m,E,H))},se=g=>{W.current.pointers.delete(g.pointerId),W.current.pointers.size<2&&delete W.current.pinch},xe=g=>{let k=w(g),C=Ht(X,k.x,k.y);C<0||(K(C),I(C,(U,m)=>rt(U,g.deltaY<0?5:-5,m)))},le=g=>{let k={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[g.key];if(g.key==="Tab"&&!g.shiftKey&&_<J.length-1)K(_+1);else if(g.key==="Tab"&&g.shiftKey&&_>0)K(_-1);else if(k)I(_,(C,U)=>qt(C,k[0],k[1],U));else if(g.key==="+"||g.key==="=")I(_,(C,U)=>rt(C,5,U));else if(g.key==="-")I(_,(C,U)=>rt(C,-5,U));else if(g.key==="0")I(_,()=>Aa);else return;g.preventDefault()},Me=(g,k)=>h(C=>{let U=C.indexOf(g),m=U+k;if(U<0||m<0||m>=C.length)return C;let E=[...C];return[E[U],E[m]]=[E[m],E[U]],E}),Be=async()=>{let g=z.current;if(!(!g||!b||A)){R(!0),j(null);try{y(!1);let k=g.toDataURL("image/png");y(!0),await Er(b,k),j({tone:"ok",text:s("cardEditor.avatar.applied",{name:$.get(b)?.name??b})})}catch(k){j({tone:"error",text:k instanceof Error?k.message:String(k)})}finally{R(!1)}}},Le=J[_],Ce=Le?ca(me(Le.id),fe(_)).scale:100,ke=(g,k,C,U)=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":g===k,onClick:()=>U(g),children:C},String(g));return t("div",{className:"ce-overlay",role:"presentation",onClick:()=>A?void 0:o(),children:d("section",{ref:Y,className:"ce-dialog ce-shell ce-avatar-studio",role:"dialog","aria-modal":"true","aria-label":s("cardEditor.avatar.title"),tabIndex:-1,onClick:g=>g.stopPropagation(),children:[d("div",{className:"ce-dialog-head",children:[t("strong",{children:s("cardEditor.avatar.title")}),t("button",{type:"button",className:"ce-dialog-close",onClick:o,disabled:A,"aria-label":s("cardEditor.avatar.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),d("div",{className:"ce-avatar-body",children:[d("div",{className:"ce-avatar-sources",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.images")}),i===null?t("p",{className:"ce-caption",children:s("cardEditor.avatar.loading")}):null,t("ul",{className:"ce-avatar-source-list",children:u.map((g,k)=>{let C=$.get(g);return d("li",{className:"ce-avatar-source",children:[d("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:p.has(g),onChange:U=>x(m=>{let E=new Set(m);return U.target.checked?E.add(g):E.size>1&&E.delete(g),E})}),d("span",{className:"ce-choice-copy",children:[t("strong",{children:C?.name??g}),C&&!C.image?t("small",{children:s("cardEditor.avatar.noImage")}):null]})]}),d("span",{className:"ce-inline-controls",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:k===0,"aria-label":s("cardEditor.avatar.moveUp",{name:C?.name??g}),onClick:()=>Me(g,-1),children:t(Xe,{className:"ce-icon","aria-hidden":"true"})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:k===u.length-1,"aria-label":s("cardEditor.avatar.moveDown",{name:C?.name??g}),onClick:()=>Me(g,1),children:t($e,{className:"ce-icon","aria-hidden":"true"})})]})]},g)})}),t("p",{className:"ce-caption",children:s("cardEditor.avatar.sourcesHint")})]}),d("div",{className:"ce-avatar-canvas-wrap",children:[t("canvas",{ref:z,className:"ce-avatar-canvas",width:P.width,height:P.height,tabIndex:0,"aria-label":s("cardEditor.avatar.canvasLabel"),onPointerDown:D,onPointerMove:te,onPointerUp:se,onPointerCancel:se,onWheel:xe,onKeyDown:le}),t("p",{className:"ce-caption",role:"status",children:Le?s("cardEditor.avatar.selected",{name:Le.name,zoom:Ce}):""})]}),d("div",{className:"ce-avatar-controls",children:[d("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.layout")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.avatar.layout"),children:["square","portrait","best-fit"].map(g=>ke(g,S.method,s(`cardEditor.avatar.method.${g}`),k=>B({...S,method:k})))})]}),d("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.columns")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.avatar.columns"),children:[0,1,2,3,4].map(g=>ke(g,S.columns,g===0?s("cardEditor.avatar.columnsAuto"):String(g),k=>B({...S,columns:k})))})]}),d("label",{className:"ce-label",htmlFor:"ce-avatar-gap",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.gap",{gap:S.gap})}),t("input",{id:"ce-avatar-gap",type:"range",min:0,max:48,value:S.gap,onChange:g=>B({...S,gap:Number(g.target.value)})})]}),d("label",{className:"ce-label",htmlFor:"ce-avatar-zoom",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.zoom",{zoom:Ce})}),t("input",{id:"ce-avatar-zoom",type:"range",min:fe(_),max:200,value:Ce,disabled:!Le,onChange:g=>I(_,(k,C)=>ca({...k,scale:Number(g.target.value)},C))})]}),d("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.resolution")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.avatar.resolution"),children:[1,2,4].map(g=>ke(g,S.resolution,`${512*g}\xD7${768*g}`,k=>B({...S,resolution:k})))})]}),d("div",{className:"ce-inline-controls",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!Le,onClick:()=>I(_,()=>Aa),children:s("cardEditor.avatar.resetCell")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>O({}),children:s("cardEditor.avatar.resetAll")})]}),t("p",{className:"ce-caption",children:s("cardEditor.avatar.keys")})]})]}),d("div",{className:"ce-dialog-foot",children:[T?t("div",{className:`ce-status${T.tone==="error"?" ce-status--error":""} ce-foot-error`,role:T.tone==="error"?"alert":"status",children:T.text}):null,d("label",{className:"ce-label ce-studio-name",htmlFor:"ce-avatar-target",children:[t("span",{className:"ce-sr-only",children:s("cardEditor.avatar.target")}),d("select",{id:"ce-avatar-target",className:"mari-chrome-field ce-field",value:b,onChange:g=>v(g.target.value),children:[r.length===0?t("option",{value:"",children:s("cardEditor.avatar.noTargets")}):null,r.map(g=>t("option",{value:g,children:s("cardEditor.avatar.targetOption",{name:$.get(g)?.name??g})},g))]})]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:A||!b||i===null,onClick:()=>{Be()},children:s(A?"cardEditor.avatar.applying":"cardEditor.avatar.apply")})]})]})})}function Fo({localization:e,session:a,item:o,onClose:s,onRetried:l}){let r=(O,M)=>ae(e,O,M),i=o.failure?.renderedPrompt??null,[n,p]=f(i?.system??""),[x,u]=f(i?.user??""),[h,b]=f(!1),[v,S]=f(null),B=ve(!0,()=>h,s),N=async()=>{if(!(h||!i)){b(!0),S(null);try{l(await Ir(a.id,o.itemId,{system:n,user:x}))}catch(O){S(O instanceof Error?O.message:String(O)),b(!1)}}};return t("div",{className:"ce-overlay",role:"presentation",onClick:()=>{h||s()},children:d("section",{ref:B,className:"ce-dialog ce-shell ce-edit-retry",role:"dialog","aria-modal":"true","aria-label":r("cardEditor.editRetry.title",{name:o.characterName}),tabIndex:-1,onClick:O=>O.stopPropagation(),children:[d("div",{className:"ce-dialog-head",children:[t("strong",{children:r("cardEditor.editRetry.title",{name:o.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:h,"aria-label":r("cardEditor.editRetry.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),d("div",{className:"ce-dialog-body",children:[i?d(ze,{children:[t("p",{className:"ce-caption",children:r("cardEditor.editRetry.hint")}),d("label",{className:"ce-label",htmlFor:"ce-retry-system",children:[t("span",{className:"ce-label-title",children:r("cardEditor.editRetry.system")}),t("textarea",{id:"ce-retry-system",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:n,"data-ce-autofocus":!0,onChange:O=>p(O.target.value)})]}),d("label",{className:"ce-label",htmlFor:"ce-retry-user",children:[t("span",{className:"ce-label-title",children:r("cardEditor.editRetry.user")}),t("textarea",{id:"ce-retry-user",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:x,onChange:O=>u(O.target.value)})]})]}):t("div",{className:"ce-status",role:"status",children:r("cardEditor.editRetry.missing")}),v?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.editRetry.error",{message:v})}):null]}),d("div",{className:"ce-dialog-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:h,onClick:s,children:r("cardEditor.editRetry.cancel")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:h||!i,onClick:()=>{N()},children:r(h?"cardEditor.editRetry.retrying":"cardEditor.editRetry.retry")})]})]})})}function Oo({localization:e,session:a,item:o,onClose:s,onUpdated:l}){let r=(S,B)=>ae(e,S,B),[i,n]=f(o.failure?.rawOutput??""),[p,x]=f(!1),[u,h]=f(o.failure?.message??null),b=ve(!0,()=>p,s),v=async S=>{if(!p){x(!0),h(null);try{l(await S())}catch(B){h(B instanceof Error?B.message:String(B)),x(!1)}}};return t("div",{className:"ce-overlay",role:"presentation",onClick:()=>{p||s()},children:d("section",{ref:b,className:"ce-dialog ce-shell ce-edit-retry",role:"dialog","aria-modal":"true","aria-label":r("cardEditor.fixJson.title",{name:o.characterName}),tabIndex:-1,onClick:S=>S.stopPropagation(),children:[d("div",{className:"ce-dialog-head",children:[t("strong",{children:r("cardEditor.fixJson.title",{name:o.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:p,"aria-label":r("cardEditor.editRetry.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),d("div",{className:"ce-dialog-body",children:[t("p",{className:"ce-caption",children:r("cardEditor.fixJson.hint")}),d("label",{className:"ce-label",htmlFor:"ce-fix-json",children:[t("span",{className:"ce-label-title",children:r("cardEditor.fixJson.response")}),t("textarea",{id:"ce-fix-json",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:i,spellCheck:!1,"data-ce-autofocus":!0,onChange:S=>n(S.target.value)})]}),u?t("div",{className:"ce-status ce-status--error",role:"alert",children:u}):null]}),d("div",{className:"ce-dialog-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p,onClick:s,children:r("cardEditor.fixJson.dismiss")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p,onClick:()=>{v(()=>va(a.id,o.itemId))},children:r("cardEditor.fixJson.regenerate")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:p||!i.trim(),onClick:()=>{v(()=>br(a.id,o.itemId,i))},children:r(p?"cardEditor.editRetry.retrying":"cardEditor.fixJson.apply")})]})]})})}var qo=600;function Ho(e){let a=Re(e).trim();return a.length>qo?`${a.slice(0,qo)}\u2026`:a}function Uo({localization:e,session:a,item:o,onClose:s,onUpdated:l}){let r=(N,O)=>ae(e,N,O),i=o.characters??[],[n,p]=f(()=>i.map(N=>N.name)),[x,u]=f(!1),[h,b]=f(null),v=ve(!0,()=>x,s),S=o.previousOutput??o.snapshots.description??"",B=async N=>{if(!x){u(!0),b(null);try{l(await fr(a.id,o.itemId,N,N==="accept"?n.map(O=>O.trim()):void 0))}catch(O){b(O instanceof Error?O.message:String(O)),u(!1)}}};return t("div",{className:"ce-overlay",role:"presentation",onClick:()=>x?void 0:s(),children:d("section",{ref:v,className:"ce-dialog ce-shell ce-split-review",role:"dialog","aria-modal":"true","aria-label":r("cardEditor.split.title",{name:o.characterName}),tabIndex:-1,onClick:N=>N.stopPropagation(),children:[d("div",{className:"ce-dialog-head",children:[t("strong",{children:r("cardEditor.split.title",{name:o.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:x,"aria-label":r("cardEditor.split.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),d("div",{className:"ce-split-body",children:[d("div",{className:"ce-split-source",children:[t("span",{className:"ce-label-title",children:r("cardEditor.split.source")}),t("pre",{className:"ce-split-source-text",tabIndex:0,children:Ho(S)||r("cardEditor.split.sourceEmpty")})]}),d("div",{className:"ce-split-proposal",children:[t("div",{className:"ce-notice",role:"status",children:d("span",{children:[t("strong",{children:r("cardEditor.split.proposal",{count:i.length})}),o.splitReason?` ${r("cardEditor.split.reason",{reason:o.splitReason})}`:""]})}),t("ol",{className:"ce-split-cards",children:i.map((N,O)=>{let M=Object.values(N.fields)[0]??"";return d("li",{className:"ce-split-card",children:[d("label",{className:"ce-label",htmlFor:`ce-split-name-${O}`,children:[t("span",{className:"ce-label-title",children:r("cardEditor.split.cardName",{index:O+1})}),t("input",{id:`ce-split-name-${O}`,className:"mari-chrome-field ce-field",value:n[O]??"",placeholder:N.name,onChange:K=>p(A=>A.map((R,T)=>T===O?K.target.value:R))})]}),t("pre",{className:"ce-split-card-text",children:Ho(M)}),N.issues?.length?t("small",{className:"ce-item-failure",children:r("cardEditor.split.issues",{count:N.issues.length})}):null]},`${O}:${N.name}`)})}),t("p",{className:"ce-caption",children:r("cardEditor.split.outcome",{count:i.length})})]})]}),d("div",{className:"ce-dialog-foot",children:[h?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:h}):null,t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:x,onClick:()=>{B("reject")},children:r("cardEditor.split.skip")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:x,onClick:()=>{B("retry-single")},children:r("cardEditor.split.retrySingle")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:x,onClick:()=>{B("accept")},children:r("cardEditor.split.accept",{count:i.length})})]})]})})}function fa(e,a,o=!0){let s=oe(e);s.current=e;let[l,r]=f(null),i=qe(b=>r(b),[]),[n,p]=f(!1),[x,u]=f(typeof document>"u"?!0:document.visibilityState==="visible");G(()=>{if(!l||typeof IntersectionObserver>"u"){p(!0);return}let b=new IntersectionObserver(v=>{p(v.some(S=>S.isIntersecting))});return b.observe(l),()=>b.disconnect()},[l]),G(()=>{let b=()=>u(document.visibilityState==="visible");return document.addEventListener("visibilitychange",b),()=>document.removeEventListener("visibilitychange",b)},[]);let h=o&&n&&x;return G(()=>{if(!h)return;let b=!1,v=0,S=()=>{b||(s.current(),v=window.setTimeout(S,a))};return S(),()=>{b=!0,window.clearTimeout(v)}},[h,a]),i}var Qs=3,el=8;function al(e){return(e.updates??[]).map(a=>{let o=e.snapshots[a.field]??Re(a.oldText),s=Re(a.newText),{added:l,removed:r}=Qa(o,s),i=vo(So(o,s),Qs);return{field:a.field,newText:s,added:l,removed:r,wordCount:yo(s),hunks:i}})}function tl({preview:e,expanded:a,showAll:o,onToggle:s,onShowAll:l,t:r}){if(!a)return d("button",{type:"button",className:"ce-queue-minirow",onClick:s,children:[t("span",{className:"ce-queue-minirow-caret","aria-hidden":"true",children:"\u25B8"}),t("span",{className:"ce-queue-minirow-field",children:e.field}),t("span",{className:"ce-queue-minirow-words",children:r("cardEditor.queue.miniRowWords",{added:e.added,removed:e.removed})})]});let i=o?Number.POSITIVE_INFINITY:el,n=!1,p=[];for(let x of e.hunks){if(i<=0){n=!0;break}let u=0;x.hiddenBefore>0&&(u=x.hiddenBefore,i-=1);let h=x.lines.slice(0,Math.max(0,i));h.length<x.lines.length&&(n=!0),i-=h.length,p.push({lines:h,hidden:u})}return d("section",{className:"ce-queue-field",children:[d("header",{className:"ce-queue-field-head",children:[t("strong",{className:"ce-queue-field-name",children:e.field}),t("span",{className:"ce-chip ce-chip--ok",children:r("cardEditor.queue.chips.added",{count:e.added})}),t("span",{className:"ce-chip ce-chip--danger",children:r("cardEditor.queue.chips.removed",{count:e.removed})}),t("span",{className:"ce-chip",children:r("cardEditor.queue.chips.fieldWords",{count:e.wordCount})})]}),t("div",{className:"ce-diff",role:"group","aria-label":e.field,children:p.map(({lines:x,hidden:u},h)=>d("div",{className:"ce-diff-hunk",children:[u>0?t("div",{className:"ce-diff-line ce-diff-line--marker",children:r("cardEditor.queue.hiddenLines",{count:u})}):null,x.map((b,v)=>d("div",{className:`ce-diff-line ce-diff-line--${b.kind}`,children:[t("span",{className:"ce-diff-sign","aria-hidden":"true",children:b.kind==="add"?"+":b.kind==="del"?"\u2212":"\xA0"}),t("span",{className:"ce-diff-text",children:b.text})]},v))]},h))}),n?t("button",{type:"button",className:"ce-queue-expander",onClick:l,children:r("cardEditor.queue.field.expand")}):null,t("pre",{className:"ce-queue-fullfield",children:e.newText})]})}function zo({localization:e,session:a,focusItemId:o,onRefresh:s,onClose:l}){let r=(y,w)=>ae(e,y,w),i=ht(()=>a.items.filter(ko),[a.items]),[n,p]=f(o),[x,u]=f(!1),[h,b]=f(null),[v,S]=f(null),[B,N]=f(null),[O,M]=f(null),[K,A]=f(new Set),R=i.findIndex(y=>y.itemId===n),T=R>=0?i[R]:null,j=ht(()=>T?al(T):[],[T]);G(()=>{if(T)return;let y=i.find(Ee)??i[0]??null;p(y?.itemId??null)},[T,i]);let z=oe(null);G(()=>{b(null),S(null),N(null),M(null),A(new Set),z.current?.focus({preventScroll:!0})},[n]);let W=(y,w)=>O===null?w===0:O.has(y),Y=y=>M(w=>{let D=new Set(w??new Set(j[0]?[j[0].field]:[]));return D.has(y)?D.delete(y):D.add(y),D}),$=T!==null&&Ee(T),J=y=>{let w=i[y];w&&p(w.itemId)},P=y=>{let D=i.filter(te=>te.itemId!==y).find(Ee)??null;p(D?.itemId??y)},X=async y=>{if(!T||x||!$)return;u(!0),S(null),N(null);let w=await na(a,T,{force:y});if(u(!1),w.kind==="needs-confirmation"){b(w.holds),s();return}if(w.kind==="applied"){let D=T.itemId;s(),P(D);return}if(w.kind==="apply-failed"){N(w.message),s();return}S(w.message)},_=async()=>{if(!T||x||!$)return;u(!0),S(null),N(null);let y=await Lo(a,T);if(u(!1),y.kind==="rejected"){let w=T.itemId;s(),P(w);return}S(y.message)},fe=async()=>{if(x)return;u(!0),S(null);let y=i.filter(Ee);for(let w of y)await na(a,w,{force:!1});u(!1),s(),p(w=>i.some(D=>D.itemId===w&&Ee(D))?w:null)};G(()=>{let y=w=>{let D=w.target;if(!(D&&(D.tagName==="INPUT"||D.tagName==="TEXTAREA"||D.tagName==="SELECT"||D.isContentEditable))&&!x){if(w.key==="ArrowLeft"){R>0&&(w.preventDefault(),J(R-1));return}if(w.key==="ArrowRight"){R>=0&&R<i.length-1&&(w.preventDefault(),J(R+1));return}!$||w.ctrlKey||w.metaKey||w.altKey||(w.key==="r"||w.key==="R"?(w.preventDefault(),_()):(w.key==="a"||w.key==="A")&&(w.preventDefault(),X(!1)))}};return document.addEventListener("keydown",y),()=>document.removeEventListener("keydown",y)});let me=j.reduce((y,w)=>({added:y.added+w.added,removed:y.removed+w.removed}),{added:0,removed:0}),I=i.filter(Ee).length;return d("div",{className:"ce-queue",children:[d("div",{className:"ce-queue-head",children:[d("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:l,children:[t(Ae,{className:"ce-icon","aria-hidden":"true"}),r("cardEditor.queue.close")]}),t("strong",{className:"ce-panel-heading",children:r("cardEditor.queue.title")}),t("span",{className:"ce-caption",children:i.length===0?"":r("cardEditor.queue.position",{index:R+1,count:i.length})})]}),i.length>0?t("div",{className:"ce-queue-dots",role:"group","aria-label":r("cardEditor.queue.dotsLabel"),children:i.map((y,w)=>{let D=y.status==="applied"||y.status==="duplicated"?"approved":y.status==="rejected"?"rejected":"pending";return t("button",{type:"button",className:`ce-dot ce-dot--${D}${w===R?" ce-dot--current":""}`,"aria-label":r("cardEditor.queue.dotLabel",{name:y.characterName,status:r(Pa(y.status))}),"aria-current":w===R,onClick:()=>J(w)},y.itemId)})}):null,T?d("article",{className:"ce-queue-card",ref:z,tabIndex:-1,"aria-label":T.characterName,children:[d("header",{className:"ce-queue-card-head",children:[t("h3",{className:"ce-queue-name",children:T.characterName}),t("span",{className:`ce-chip ce-chip--${et(T.status)}`,children:r(Pa(T.status))})]}),d("div",{className:"ce-queue-chips",children:[t("span",{className:"ce-chip",children:r("cardEditor.queue.chips.fields",{count:j.length})}),t("span",{className:"ce-chip ce-chip--ok",children:r("cardEditor.queue.chips.added",{count:me.added})}),t("span",{className:"ce-chip ce-chip--danger",children:r("cardEditor.queue.chips.removed",{count:me.removed})})]}),a.config.saveMode==="duplicate"?t("p",{className:"ce-caption",children:r("cardEditor.queue.duplicateNote")}):null,t("div",{className:"ce-queue-fields",children:j.map((y,w)=>t(tl,{preview:y,expanded:W(y.field,w),showAll:K.has(y.field),onToggle:()=>Y(y.field),onShowAll:()=>A(D=>new Set([...D,y.field])),t:r},y.field))}),h?d("div",{className:"ce-queue-stale",role:"alert",children:[t("p",{children:r("cardEditor.queue.staleTitle",{count:h.length})}),d("div",{className:"ce-queue-stale-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:x,onClick:()=>{X(!0)},children:r("cardEditor.queue.staleApply")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:x,onClick:()=>b(null),children:r("cardEditor.queue.staleSkip")})]})]}):null,B?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.queue.applyFailed",{message:B})}):null,v?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.queue.verdictError",{message:v})}):null,d("footer",{className:"ce-queue-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R<=0,"aria-label":r("cardEditor.queue.prev"),onClick:()=>J(R-1),children:t(Ae,{className:"ce-icon","aria-hidden":"true"})}),d("button",{type:"button",className:"mari-chrome-control ce-queue-reject",disabled:x||!$,onClick:()=>{_()},children:[t(ue,{className:"ce-icon","aria-hidden":"true"}),r("cardEditor.queue.reject"),t("kbd",{className:"ce-key-hint",children:r("cardEditor.queue.rejectHint")})]}),d("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary ce-queue-approve",disabled:x||!$,onClick:()=>{X(!1)},children:[t(xa,{className:"ce-icon","aria-hidden":"true"}),r(x?"cardEditor.queue.working":"cardEditor.queue.approve"),t("kbd",{className:"ce-key-hint",children:r("cardEditor.queue.approveHint")})]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R<0||R>=i.length-1,"aria-label":r("cardEditor.queue.next"),onClick:()=>J(R+1),children:t(je,{className:"ce-icon","aria-hidden":"true"})})]})]}):t("div",{className:"ce-status",role:"status",children:r("cardEditor.queue.empty")}),I>0?t("button",{type:"button",className:"ce-queue-approve-all",disabled:x,onClick:()=>{fe()},children:r(x?"cardEditor.queue.approveAllWorking":"cardEditor.queue.approveAll")}):null]})}var st=50;function rl({item:e,t:a}){if(ua(e)&&e.failure)return t("span",{className:"ce-item-failure",children:e.failure.message});if(e.status==="awaiting-split")return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.splitProposed",{count:e.characters?.length??0})});if(e.status==="split")return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.splitInto",{count:e.characters?.length??0})});if(e.resultCardId)return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.copyCreated",{id:e.resultCardId})});if(e.status==="applied"&&(e.updates??[]).length===0)return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.noChanges")});let o=wo(e);return o?t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.summary",{fields:o.fields,added:o.added,removed:o.removed})}):null}function _o({localization:e,sessionId:a,onBack:o,onDeleted:s,onRerun:l}){let r=(L,Q)=>ae(e,L,Q),[i,n]=f(null),[p,x]=f(!1),[u,h]=f(null),[b,v]=f(!1),[S,B]=f({}),[N,O]=f(null),[M,K]=f(null),[A,R]=f(0),[T,j]=f("closed"),[z,W]=f(null),[Y,$]=f(null),J=oe(new Set),[P,X]=f(!1),[_,fe]=f(null),[me,I]=f(!1),[y,w]=f(null),D=oe(new Set),te=oe(!1),se=qe(()=>{la(a).then(L=>{n(L),x(!1)}).catch(()=>x(!0))},[a]),xe=fa(se,2e3);G(()=>{if(!i||Y!==null||z!==null||T!=="closed")return;let L=i.items.find(Q=>Q.status==="failed-parse"&&Q.failure?.rawOutput&&!J.current.has(Q.itemId));L&&(J.current.add(L.itemId),$(L.itemId))},[z,Y,T,i]),G(()=>{if(!i||(i.config.completionMode??"ask")!=="ask")return;let L=i.items.filter(Q=>Q.status==="awaiting-review"&&Q.autoApply===!0&&!D.current.has(Q.itemId));if(L.length!==0){for(let Q of L)D.current.add(Q.itemId);(async()=>{for(let Q of L){let ee=await na(i,Q,{force:!1});(ee.kind==="failed"||ee.kind==="report-failed")&&B(Pe=>({...Pe,[Q.itemId]:ee.message}))}se()})()}},[i,se]),G(()=>{if(!i||te.current||i.status!=="completed")return;let L=i.config.completionMode??"ask";i.items.filter(ee=>Array.isArray(ee.pendingOps)||L==="apply"&&ee.status==="awaiting-review").length!==0&&(te.current=!0,Za(i,(ee,Pe)=>O({done:ee,total:Pe})).then(ee=>{n(ee.session),ee.messages.length>0&&h(ee.messages[0])}).finally(()=>{te.current=!1,O(null),se()}))},[i,se]);let le=async(L,Q)=>{if(!M){K(L),h(null);try{let ee=await Q();ee?n(ee):se()}catch(ee){h(ee instanceof Error?ee.message:String(ee))}finally{K(null)}}},Me=()=>{le("run-again",async()=>{let L=await za(a);return l?.(L.id),L})},Be=()=>{le("rerun-all",async()=>{let L=(i?.items??[]).filter(ua);for(let Q of L)await va(a,Q.itemId)})},Le=()=>{le("delete",async()=>{await Va(a,{force:i?.status==="active"}),s()})},Ce=()=>{le("combine",async()=>{if(!i)return;let Q=i.items.filter(Pe=>Pe.status==="applied").length<i.items.length,ee=await Io(i,...Q?[{confirmPartial:!0}]:[]);if(ee.kind==="failed")throw new Error(ee.message);return v(!1),ee.session})},ke=L=>{le("duplicate-applied",async()=>{if(!i)return;let Q=await bo(i);return Q.failedCount>0&&h(r("cardEditor.panel.detail.duplicateAppliedPartial",{failed:Q.failedCount,total:L})),Q.session})};if(p&&!i)return d("section",{className:"ce-shell ce-panel",ref:xe,children:[d("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:o,children:[t(Ae,{className:"ce-icon","aria-hidden":"true"}),r("cardEditor.panel.back")]}),t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.panel.detail.loadError")})]});if(!i)return t("section",{className:"ce-shell ce-panel",ref:xe,children:t("div",{className:"ce-status",role:"status",children:r("cardEditor.panel.detail.loading")})});if(T!=="closed")return t("section",{className:"ce-shell ce-panel",ref:xe,children:t(zo,{localization:e,session:i,focusItemId:T,onRefresh:se,onClose:()=>j("closed")})});let g=i.config.transform?Eo(i):null,k=y??g?.phase??1,C=g?i.items.filter(L=>(L.phase??1)===k):i.items,U=_?i.items.find(L=>L.itemId===_&&L.status==="awaiting-split")??null:null,m=i.items.filter(L=>L.status!=="split"&&L.status!=="staged").length,E=Y?i.items.find(L=>L.itemId===Y)??null:null,F=z?i.items.find(L=>L.itemId===z)??null:null,H=i.items.filter(Ee).length,Z=i.items.filter(ua).length,he=i.config.saveMode==="combined",pe=he?i.items.filter(L=>L.status==="applied").length:0,we=he&&!i.combinedCardId&&pe>0,Oe=we&&pe<m,Ze=he?0:i.items.filter(L=>L.status==="applied"&&L.resultCardId===void 0&&(L.updates??[]).length>0).length,Ie=at(i),Ve=Math.max(1,Math.ceil(C.length/st)),Se=Math.min(A,Ve-1),Qe=C.slice(Se*st,Se*st+st);return d("section",{className:"ce-shell ce-panel",ref:xe,"data-card-editor-view":"session-detail",children:[d("div",{className:"ce-panel-head",children:[d("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:o,children:[t(Ae,{className:"ce-icon","aria-hidden":"true"}),r("cardEditor.panel.back")]}),t("strong",{className:"ce-panel-heading",children:i.label}),t("span",{className:`ce-chip ce-chip--${i.status==="active"?"live":i.status==="completed"?"ok":"muted"}`,children:r(`cardEditor.panel.sessionStatus.${i.status}`)}),t("span",{className:"ce-chip",children:r(`cardEditor.panel.completionMode.${i.config.completionMode??"ask"}`)})]}),g?d("div",{className:"ce-pipeline",role:"group","aria-label":r("cardEditor.pipeline.label"),children:[d("div",{className:"ce-pipeline-count",children:[t("strong",{children:r("cardEditor.pipeline.count",{sources:g.sources,results:g.results})}),t("span",{className:"ce-caption",children:g.splitsAccepted>0?r("cardEditor.pipeline.splitsAccepted",{count:g.splitsAccepted}):r("cardEditor.pipeline.noSplits")})]}),i.config.transform?.phase2?.enabled?t("div",{className:"ce-segmented",role:"radiogroup","aria-label":r("cardEditor.pipeline.phaseLabel"),children:[1,2].map(L=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":k===L,disabled:L===2&&g.phase===1,onClick:()=>{w(L),R(0)},children:r("cardEditor.pipeline.phase",{phase:L})},L))}):null,g.splitsPending>0?t("span",{className:"ce-chip ce-chip--review",children:r("cardEditor.pipeline.splitsPending",{count:g.splitsPending})}):null]}):null,i.combinedCardId?t("div",{className:"ce-notice",role:"status",children:t("span",{children:r("cardEditor.panel.detail.combinedCreated",{id:i.combinedCardId})})}):null,i.status==="interrupted"?t("div",{className:"ce-notice",role:"status",children:t("span",{children:r("cardEditor.panel.interruptedNotice")})}):null,i.status==="active"?t("p",{className:"ce-caption",role:"status",children:Ie.kind==="batch"?r("cardEditor.panel.live.batch",{index:Ie.batchIndex,count:Ie.batchCount})+(Ie.batchAttempts>1?r("cardEditor.panel.live.batchRetry",{attempt:Ie.batchAttempts}):""):Ie.kind==="items"?r("cardEditor.panel.live.items",{running:Ie.runningItems,total:i.stats.total}):Ie.kind==="queued"?r("cardEditor.panel.live.queued",{count:Ie.queuedItems}):r("cardEditor.panel.progress",{done:i.stats.done,total:i.stats.total})}):null,N?t("p",{className:"ce-caption ce-live-line",role:"status",children:r("cardEditor.panel.enforcementProgress",N)}):null,u?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.panel.detail.actionError",{message:u})}):null,d("div",{className:"ce-panel-actions",children:[we?Oe&&!b?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:()=>v(!0),children:r("cardEditor.panel.detail.combine",{count:pe})}):Oe&&b?d("span",{className:"ce-confirm-strip",role:"group","aria-label":r("cardEditor.panel.detail.combine"),children:[t("span",{className:"ce-caption",children:r("cardEditor.panel.detail.combinePartialConfirm",{count:pe,total:m})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:Ce,children:r("cardEditor.panel.detail.combineYes",{count:pe})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:()=>v(!1),children:r("cardEditor.panel.detail.combineNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:M!==null,onClick:Ce,children:r("cardEditor.panel.detail.combine",{count:pe})}):null,Ze>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:()=>ke(Ze),children:r("cardEditor.panel.detail.duplicateApplied",{count:Ze})}):null,g?.phase2Ready?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:M!==null,onClick:()=>{le("phase2",async()=>{let L=await mr(a);return w(2),L})},children:r("cardEditor.pipeline.startPhase2",{count:g.results})}):null,g||he?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>I(!0),children:r("cardEditor.avatar.open")}):null,H>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",onClick:()=>j(null),children:r("cardEditor.panel.detail.reviewQueue",{count:H})}):null,i.status==="active"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:()=>{le("cancel-all",()=>Ua(a))},children:r("cardEditor.panel.detail.cancelAll")}):null,i.status==="completed"||i.status==="canceled"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:Me,children:r("cardEditor.panel.runAgain")}):null,Z>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:Be,children:r("cardEditor.panel.detail.rerunFailed",{count:Z})}):null,P?d("span",{className:"ce-confirm-strip",role:"group","aria-label":r("cardEditor.panel.delete"),children:[t("span",{className:"ce-caption",children:i.status==="active"?r("cardEditor.panel.deleteConfirmActive"):r("cardEditor.panel.deleteConfirm")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:M!==null,onClick:Le,children:i.status==="active"?r("cardEditor.panel.deleteYesActive"):r("cardEditor.panel.deleteYes")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:()=>X(!1),children:r("cardEditor.panel.deleteNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:()=>X(!0),children:r("cardEditor.panel.detail.delete")})]}),t("ul",{className:"ce-items",children:Qe.map(L=>{let Q=Ee(L),ee=(L.status==="applied"||L.status==="duplicated")&&(L.updates??[]).length>0,Pe=ua(L),Ne=ua(L)&&L.failure?.renderedPrompt!==void 0,Ra=L.status==="failed-parse"&&!!L.failure?.rawOutput,De=L.status==="queued"&&i.status==="active",ma=L.status==="awaiting-split",it=Po(L,i.items),Ta=(L.characters??[]).reduce((ea,dt)=>ea+(dt.issues?.length??0),0);return d("li",{className:`ce-item${it?" ce-item--child":""}`,children:[d("div",{className:"ce-item-main",children:[t("span",{className:"ce-item-name",children:L.characterName}),L.lineage?.splitGroupId?t("span",{className:"ce-chip",children:r("cardEditor.panel.detail.lineage",{index:L.lineage.splitIndex??1,count:L.lineage.splitCount??1,origin:L.lineage.originName})}):null,Ta>0?t("span",{className:"ce-chip ce-chip--review",title:(L.characters??[]).flatMap(ea=>ea.issues??[]).join(`
`),children:r("cardEditor.panel.detail.issues",{count:Ta})}):null,t("span",{className:`ce-chip ce-chip--${et(L.status)}`,children:r(Pa(L.status))})]}),d("div",{className:"ce-item-sub",children:[t(rl,{item:L,t:r}),S[L.itemId]?t("span",{className:"ce-item-failure",children:r("cardEditor.panel.detail.autoApplyError",{name:L.characterName,message:S[L.itemId]})}):null]}),Q||ee||Pe||Ne||De||ma?d("div",{className:"ce-item-actions",children:[ma?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",onClick:()=>fe(L.itemId),children:r("cardEditor.panel.action.reviewSplit")}):null,Q?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>j(L.itemId),children:r("cardEditor.panel.action.review")}):null,ee?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>j(L.itemId),children:r("cardEditor.panel.action.inspect")}):null,Pe?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:()=>{le(`rerun-${L.itemId}`,()=>va(a,L.itemId))},children:r("cardEditor.panel.action.rerun")}):null,Ra?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:()=>$(L.itemId),children:r("cardEditor.panel.action.fixJson")}):null,Ne?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:()=>W(L.itemId),children:r("cardEditor.panel.action.editRetry")}):null,De?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:M!==null,onClick:()=>{le(`cancel-${L.itemId}`,()=>Lr(a,L.itemId))},children:r("cardEditor.panel.action.cancelItem")}):null]}):null]},L.itemId)})}),Ve>1?d("div",{className:"ce-pager",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:Se<=0,"aria-label":r("cardEditor.panel.detail.pagePrev"),onClick:()=>R(Se-1),children:t(Ae,{className:"ce-icon","aria-hidden":"true"})}),t("span",{className:"ce-caption",children:r("cardEditor.panel.detail.page",{page:Se+1,pages:Ve})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:Se>=Ve-1,"aria-label":r("cardEditor.panel.detail.pageNext"),onClick:()=>R(Se+1),children:t(je,{className:"ce-icon","aria-hidden":"true"})})]}):null,E&&E.status==="failed-parse"?t(Oo,{localization:e,session:i,item:E,onClose:()=>$(null),onUpdated:L=>{n(L),$(null)}}):null,U?t(Uo,{localization:e,session:i,item:U,onClose:()=>fe(null),onUpdated:L=>{n(L),fe(null)}}):null,me?t(Do,{localization:e,session:i,onClose:()=>I(!1)}):null,F?t(Fo,{localization:e,session:i,item:F,onClose:()=>W(null),onRetried:L=>{n(L),W(null)}}):null]})}function ol({localization:e}){let a=(B,N)=>ae(e,B,N),[o,s]=f(!1),[l,r]=f(0),[i,n]=f(!1),[p,x]=f(!1),[u,h]=f(!1),[b,v]=f(null);G(()=>{let B=!1;return qa().then(N=>{B||(r(N.maxParallelAgents??0),n(N.disableAutoVerdicts),s(!0))}).catch(()=>{B||v("Could not load the bulk settings.")}),()=>{B=!0}},[]);let S=async()=>{if(!(p||!o)){x(!0),v(null),h(!1);try{await xr({version:1,maxParallelAgents:l>0?l:null,disableAutoVerdicts:i}),h(!0)}catch(B){v(B instanceof Error?B.message:String(B))}finally{x(!1)}}};return d("details",{className:"ce-settings","data-ce-section":"bulk-settings",children:[t("summary",{className:"ce-section-heading",children:a("cardEditor.panel.settings.title")}),t(Je,{id:"ce-settings-max-parallel",label:a("cardEditor.panel.settings.maxParallelAgents"),value:l,min:0,max:16,onChange:B=>{r(B),h(!1)}}),t("p",{className:"ce-caption",children:a("cardEditor.panel.settings.maxParallelAgentsHint")}),d("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:i,onChange:B=>{n(B.target.checked),h(!1)}}),d("span",{className:"ce-choice-copy",children:[t("strong",{children:a("cardEditor.panel.settings.disableAutoVerdicts")}),t("small",{children:a("cardEditor.panel.settings.disableAutoVerdictsHint")})]})]}),d("div",{className:"ce-session-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p||!o,onClick:()=>{S()},children:a("cardEditor.panel.settings.save")}),u?t("span",{className:"ce-caption",children:a("cardEditor.panel.settings.saved")}):null]}),b?t("div",{className:"ce-status ce-status--error",role:"alert",children:a("cardEditor.panel.detail.actionError",{message:b})}):null]})}function sl({session:e,t:a}){return d("span",{className:"ce-session-chips",children:[t("span",{className:"ce-chip",children:e.config.mode==="batched"?a("cardEditor.panel.modeBatched",{size:e.config.batchSize}):a("cardEditor.panel.modeIndividual")}),t("span",{className:"ce-chip",children:a(`cardEditor.panel.saveMode.${e.config.saveMode}`)}),t("span",{className:"ce-chip",children:a(`cardEditor.panel.completionMode.${e.config.completionMode??"ask"}`)})]})}function ll({session:e,t:a}){let o=at(e),s=o.kind==="batch"?a("cardEditor.panel.live.batch",{index:o.batchIndex,count:o.batchCount})+(o.batchAttempts>1?a("cardEditor.panel.live.batchRetry",{attempt:o.batchAttempts}):""):o.kind==="items"?a("cardEditor.panel.live.items",{running:o.runningItems,total:e.stats.total}):o.kind==="queued"?a("cardEditor.panel.live.queued",{count:o.queuedItems}):a("cardEditor.panel.live.settling");return t("p",{className:"ce-caption ce-live-line",role:"status",children:s})}function Vo({localization:e,agentName:a,detailId:o,onDetailIdChange:s,splitView:l=!1}){let r=(I,y)=>ae(e,I,y),[i,n]=f(null),[p,x]=f({}),[u,h]=f(!1),[b,v]=f(null),S=o!==void 0,B=S?o:b,N=I=>{S?s?.(I):v(I)},[O,M]=f(null),[K,A]=f(null),[R,T]=f(null),[j,z]=f({}),W=oe(new Set),Y=qe(()=>{Ha().then(async I=>{n(Array.isArray(I)?I:[]),h(!1);let y=(Array.isArray(I)?I:[]).filter(te=>te.status==="active"||te.status==="completed"&&(te.pendingApplyCount>0||te.enforcementPendingCount>0)),w=await Promise.allSettled(y.map(te=>la(te.id))),D={};w.forEach((te,se)=>{te.status==="fulfilled"&&(D[y[se].id]=te.value)}),x(D)}).catch(()=>h(!0))},[]),$=fa(Y,2e3,B===null);G(()=>{if(B===null)for(let I of Object.values(p)){if(I.status!=="completed"||W.current.has(I.id))continue;let y=I.config.completionMode??"ask";I.items.filter(D=>Array.isArray(D.pendingOps)||y==="apply"&&D.status==="awaiting-review").length!==0&&(W.current.add(I.id),Za(I,(D,te)=>z(se=>({...se,[I.id]:{done:D,total:te}}))).then(D=>{D.messages.length>0&&T(D.messages[0])}).finally(()=>{W.current.delete(I.id),z(D=>{let{[I.id]:te,...se}=D;return se}),Y()}))}},[p,B,Y]);let J=async(I,y)=>{if(!K){A(I),T(null);try{await y(),Y()}catch(w){T(w instanceof Error?w.message:String(w))}finally{A(null)}}},P=B?t(_o,{localization:e,sessionId:B,onBack:()=>{N(null),Y()},onDeleted:()=>{N(null),M(null),Y()},onRerun:I=>{N(I),Y()}}):null,X=i??[],_=X.filter(I=>I.status==="active"),fe=X.filter(I=>I.status!=="active"),me=d(ze,{children:[d("div",{className:"ce-panel-head",children:[t("strong",{className:"ce-panel-heading",children:r("cardEditor.panel.title")}),d("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-refresh-button",disabled:K!==null,onClick:Y,children:[t(ba,{className:"ce-icon","aria-hidden":"true"}),r("cardEditor.panel.refresh")]})]}),u?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.panel.loadError")}):null,R?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.panel.detail.actionError",{message:R})}):null,i===null&&!u?t("div",{className:"ce-status",role:"status",children:r("cardEditor.panel.loading")}):null,i!==null&&X.length===0?t("p",{className:"ce-caption",children:r("cardEditor.panel.empty")}):null,t(ol,{localization:e}),_.length>0?d("div",{className:"ce-panel-section","data-ce-section":"active",children:[t("span",{className:"ce-section-heading",children:r("cardEditor.panel.activeTitle")}),t("ul",{className:"ce-sessions",children:_.map(I=>{let y=p[I.id],w=I.stats.total>0?I.stats.done/I.stats.total:0;return d("li",{className:"ce-session ce-session--active",children:[d("div",{className:"ce-session-top",children:[t("button",{type:"button",className:"ce-session-label",onClick:()=>N(I.id),children:I.label}),y?t(sl,{session:y,t:r}):null]}),t("div",{className:"ce-progress",role:"progressbar","aria-valuemin":0,"aria-valuemax":I.stats.total,"aria-valuenow":I.stats.done,"aria-label":r("cardEditor.panel.progress",{done:I.stats.done,total:I.stats.total}),children:t("div",{className:"ce-progress-fill",style:{width:`${Math.round(w*100)}%`}})}),t("span",{className:"ce-caption",children:r("cardEditor.panel.progress",{done:I.stats.done,total:I.stats.total})}),y?t(ll,{session:y,t:r}):null,t("div",{className:"ce-session-actions",children:t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:K!==null,onClick:()=>{J(I.id,()=>Ua(I.id))},children:r("cardEditor.panel.cancel")})})]},I.id)})})]}):null,fe.length>0?d("div",{className:"ce-panel-section","data-ce-section":"history",children:[t("span",{className:"ce-section-heading",children:r("cardEditor.panel.historyTitle")}),t("ul",{className:"ce-sessions",children:fe.map(I=>d("li",{className:"ce-session",children:[t("button",{type:"button",className:"ce-session-label",onClick:()=>N(I.id),children:I.label}),d("span",{className:"ce-session-meta",children:[t("span",{className:`ce-chip ce-chip--${I.status==="completed"?"ok":"muted"}`,children:r(`cardEditor.panel.sessionStatus.${I.status}`)}),t("span",{className:"ce-chip",children:r(`cardEditor.panel.completionMode.${I.completionMode}`)}),t("span",{className:"ce-caption",children:r("cardEditor.panel.progress",{done:I.stats.done,total:I.stats.total})}),I.stats.failed>0?t("span",{className:"ce-chip ce-chip--danger",children:r("cardEditor.panel.statsFailed",{count:I.stats.failed})}):null,t("span",{className:"ce-caption ce-session-date",children:new Date(I.createdAt).toLocaleString()})]}),I.status==="interrupted"?t("p",{className:"ce-caption ce-session-note",children:r("cardEditor.panel.interruptedNotice")}):null,j[I.id]?t("p",{className:"ce-caption ce-live-line",role:"status",children:r("cardEditor.panel.enforcementProgress",j[I.id])}):null,I.status==="completed"||I.status==="canceled"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:K!==null,onClick:()=>{J(I.id,async()=>{let y=await za(I.id);N(y.id)})},children:r("cardEditor.panel.runAgain")}):null,O===I.id?d("span",{className:"ce-confirm-strip",role:"group","aria-label":r("cardEditor.panel.delete"),children:[t("span",{className:"ce-caption",children:r("cardEditor.panel.deleteConfirm")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:K!==null,onClick:()=>{J(I.id,async()=>{await Va(I.id),M(null)})},children:r("cardEditor.panel.deleteYes")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:K!==null,onClick:()=>M(null),children:r("cardEditor.panel.deleteNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-session-delete",disabled:K!==null,onClick:()=>M(I.id),children:r("cardEditor.panel.delete")})]},I.id))})]}):null]});return P?l?t("section",{className:"ce-shell ce-panel ce-panel--workspace","data-card-editor-view":"agent-panel",ref:$,"aria-label":a?r("cardEditor.panel.titleWithAgent",{agent:a}):r("cardEditor.panel.title"),children:d("div",{className:"ce-workspace-split",children:[t("div",{className:"ce-workspace-rail",children:me}),t("div",{className:"ce-workspace-main",children:P})]})}):P:t("section",{className:"ce-shell ce-panel","data-card-editor-view":"agent-panel",ref:$,"aria-label":a?r("cardEditor.panel.titleWithAgent",{agent:a}):r("cardEditor.panel.title"),children:me})}var Ut="marinara:capability-overlay",Go="card-editor",il=new Set(["standard","strict","rebalance","xml-simple","xml-complex","custom","transform"]),dl=new Set(["markdown","xml","json"]),nl=new Set(["confirm","auto","duplicate","combined"]);function ul(e){if(e===null||typeof e!="object"||Array.isArray(e))return;let a=e,o=i=>typeof a[i]=="string"?a[i]:void 0,s=o("presetId"),l=o("saveMode"),r={...s!==void 0&&il.has(s)?{presetId:s}:{},...o("globalInstruction")!==void 0?{globalInstruction:o("globalInstruction")}:{},...l!==void 0&&nl.has(l)?{saveMode:l}:{},...o("duplicatePrefix")!==void 0?{duplicatePrefix:o("duplicatePrefix")}:{},...o("combinedCardName")!==void 0?{combinedCardName:o("combinedCardName")}:{},...o("label")!==void 0?{label:o("label")}:{},...o("schemaId")!==void 0&&/^[\w-]{1,80}$/.test(o("schemaId"))?{schemaId:o("schemaId")}:{},...dl.has(o("format")??"")?{format:o("format")}:{}};return Object.keys(r).length>0?r:void 0}function zt(e){window.dispatchEvent(new CustomEvent(Ut,{detail:{packageId:Go,action:"open",payload:e}}))}function Wo({localization:e}){let a=(h,b)=>ae(e,h,b),[o,s]=f(!1),[l,r]=f(null),[i,n]=f(null),[p,x]=f(void 0);if(G(()=>{let h=b=>{let v=b.detail;if(!v||v.packageId!==Go)return;if(v.action==="close"){s(!1);return}if(v.action!=="open")return;let S=v.payload;r(typeof S?.sessionId=="string"&&S.sessionId?S.sessionId:null);let B=S?.dispatch?.characterIds;n(Array.isArray(B)?B.filter(N=>typeof N=="string"&&N.length>0):null),x(ul(S?.dispatch?.prefill)),s(!0)};return window.addEventListener(Ut,h),()=>window.removeEventListener(Ut,h)},[]),G(()=>{if(!o||i!==null)return;let h=b=>{b.key==="Escape"&&s(!1)};return window.addEventListener("keydown",h),()=>window.removeEventListener("keydown",h)},[o,i]),!o)return null;let u=h=>{n(null),r(h.id)};return t("div",{className:"ce-overlay ce-workspace-overlay",children:d("div",{className:"ce-dialog ce-workspace",role:"dialog","aria-modal":"true","aria-label":a("cardEditor.workspace.title"),children:[d("div",{className:"ce-dialog-head",children:[t("span",{children:a("cardEditor.workspace.title")}),t("button",{type:"button",className:"ce-dialog-close","aria-label":a("cardEditor.workspace.close"),onClick:()=>s(!1),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),t("div",{className:"ce-workspace-body",children:t(Vo,{localization:e,splitView:!0,detailId:l,onDetailIdChange:r})}),i!==null&&i.length>0?t(go,{localization:e,characterIds:i,prefill:p,onClose:()=>n(null),onDispatched:u}):null]})})}function $o({localization:e,agentName:a}){let o=(x,u)=>ae(e,x,u),[s,l]=f(null),r=qe(()=>{Ha().then(x=>l(Array.isArray(x)?x:[])).catch(()=>l([]))},[]),i=fa(r,5e3,!0),n=s?.filter(x=>x.status==="active").length??0,p=s?.filter(x=>x.status!=="active").length??0;return d("section",{className:"ce-shell ce-panel","data-card-editor-view":"agent-panel",ref:i,"aria-label":a?o("cardEditor.panel.titleWithAgent",{agent:a}):o("cardEditor.panel.title"),children:[t("div",{className:"ce-panel-head",children:t("strong",{className:"ce-panel-heading",children:o("cardEditor.panel.title")})}),t("p",{className:"ce-caption",children:o("cardEditor.panel.summaryCounts",{active:n,recent:p})}),t("button",{type:"button",className:"mari-chrome-control",onClick:()=>zt(),children:o("cardEditor.panel.openWorkspace")})]})}var Xo=`
.ce-shell {
  --ce-chroma: var(--marinara-chat-chrome-accent, var(--foreground));
  --accent: var(--marinara-chat-chrome-highlight-bg);
  --accent-foreground: var(--marinara-chat-chrome-highlight-text);
  --background: var(--marinara-chat-chrome-panel-bg);
  --border: var(--marinara-chat-chrome-panel-border);
  --card: var(--marinara-chat-chrome-panel-bg);
  --foreground: var(--marinara-chat-chrome-panel-text);
  --input: var(--marinara-chat-chrome-input-border);
  --muted: var(--marinara-chat-chrome-highlight-bg);
  --muted-foreground: var(--marinara-chat-chrome-panel-muted);
  --popover: var(--marinara-chat-chrome-panel-bg);
  --popover-foreground: var(--marinara-chat-chrome-panel-text);
  --primary: var(--marinara-chat-chrome-highlight-text);
  --primary-foreground: var(--marinara-chat-chrome-panel-bg);
  --ring: var(--marinara-chat-chrome-focus-ring);
  --secondary: var(--marinara-chat-chrome-highlight-bg);
  color: var(--marinara-chat-chrome-panel-text);
  font: inherit;
}

.ce-selection-button {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

.ce-selection-button[data-icon-only] {
  justify-content: center;
  padding: 0.5rem;
}

.ce-selection-button[data-icon-only] .ce-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.ce-icon {
  width: 0.75rem;
  height: 0.75rem;
  flex: none;
}

.ce-notice {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--muted);
  padding: 0.5rem 0.6rem;
  color: var(--foreground);
  font-size: 0.7rem;
  line-height: 1.4;
}

.ce-notice-close {
  flex: none;
  border: 0;
  border-radius: 0.375rem;
  background: transparent;
  padding: 0.125rem 0.375rem;
  color: var(--muted-foreground);
  cursor: pointer;
  font: inherit;
}

.ce-notice-close:hover {
  background: var(--marinara-chat-chrome-highlight-bg-hover);
  color: var(--marinara-chat-chrome-highlight-text);
}

.ce-notice-close:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.ce-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(1rem, env(safe-area-inset-top)) 1rem max(1rem, env(safe-area-inset-bottom));
  /* The engine mounts overlay packages inside a pointer-events-none container;
     the overlay root must re-enable hit-testing for its own dialog. */
  pointer-events: auto;
}

.ce-overlay::before {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 55%);
  backdrop-filter: blur(2px);
  content: "";
}

.ce-dialog {
  position: relative;
  display: flex;
  width: min(44rem, 100%);
  max-height: min(88dvh, 52rem);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--marinara-chat-chrome-panel-border);
  border-radius: 0.75rem;
  background: var(--marinara-chat-chrome-panel-bg);
  color: var(--marinara-chat-chrome-panel-text);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 40%);
  backdrop-filter: blur(12px);
}

.ce-dialog-head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.625rem 0.75rem;
  color: var(--marinara-chat-chrome-panel-title);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1rem;
}

.ce-dialog-close {
  width: 1.75rem;
  min-width: 1.75rem;
  height: 1.75rem;
  min-height: 1.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  padding: 0.375rem;
  color: var(--marinara-chat-chrome-panel-muted);
}

.ce-dialog-close .ce-icon {
  width: 1rem;
  height: 1rem;
}

.ce-dialog-close:hover {
  background: var(--marinara-chat-chrome-highlight-bg-hover);
  color: var(--marinara-chat-chrome-highlight-text);
}

.ce-dialog-body {
  display: grid;
  min-height: 0;
  gap: 1rem;
  overflow: auto;
  padding: 1rem 1.25rem;
  scrollbar-color: var(--marinara-chat-chrome-panel-scrollbar) transparent;
  scrollbar-width: thin;
}

.ce-section {
  display: grid;
  min-width: 0;
  gap: 0.5rem;
  margin: 0;
  border: 0;
  padding: 0;
}

.ce-section-heading {
  margin: 0;
  padding: 0;
  color: color-mix(in srgb, var(--foreground) 55%, transparent);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 0.875rem;
  text-transform: uppercase;
}

.ce-caption {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.625rem;
  line-height: 1.45;
}

/* Group divider inside a choice list (e.g. the duplicate affix stack): section-heading
   typography separated from the fields above by a dashed rule. */
.ce-divider-caption {
  margin: 0;
  padding-top: 0.375rem;
  border-top: 1px dashed var(--marinara-chat-chrome-panel-divider);
  color: color-mix(in srgb, var(--foreground) 55%, transparent);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 0.875rem;
  text-transform: uppercase;
}

.ce-label {
  display: grid;
  gap: 0.25rem;
  color: var(--muted-foreground);
  font-size: 0.625rem;
}

.ce-label-title {
  color: var(--foreground);
  font-weight: 500;
}

.ce-label small {
  font-size: 0.59375rem;
  line-height: 1.35;
}

.ce-field {
  box-sizing: border-box;
  width: 100%;
  padding: 0.5rem 0.625rem;
  font: inherit;
  font-size: 0.75rem;
}

.ce-textarea {
  min-height: 4.5rem;
  resize: vertical;
  line-height: 1.45;
}

.ce-template-textarea {
  min-height: 9rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.7rem;
}

.ce-number-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: 0.6rem;
}

.ce-number-input {
  height: 2.25rem;
  min-height: 2.25rem;
  font-variant-numeric: tabular-nums;
}

.ce-targets {
  display: grid;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
  list-style: none;
}

.ce-target {
  display: grid;
  grid-template-columns: minmax(7rem, 14rem) minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--card);
  padding: 0.5rem;
}

.ce-target-identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
}

.ce-target-avatar {
  width: 2rem;
  height: 2rem;
  flex: none;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 2rem;
  text-align: center;
  text-transform: uppercase;
}

.ce-target-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ce-target-name {
  min-width: 0;
  overflow: hidden;
  color: var(--foreground);
  font-size: 0.75rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-target-load-error {
  color: var(--marinara-chat-chrome-danger-text, #e08080);
  font-size: 0.59375rem;
  font-weight: 400;
}

.ce-target-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.35rem;
}

.ce-target-remove {
  width: 1.75rem;
  min-width: 1.75rem;
  height: 1.75rem;
  min-height: 1.75rem;
  align-self: start;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  padding: 0.375rem;
  color: var(--muted-foreground);
}

.ce-target-remove .ce-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.ce-target-remove:hover {
  background: var(--marinara-chat-chrome-highlight-bg-hover);
  color: var(--marinara-chat-chrome-highlight-text);
}

.ce-target-remove:focus-visible,
.ce-dialog-close:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.ce-choice-list {
  display: grid;
  gap: 0.35rem;
}

.ce-preset-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ce-choice {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--muted-foreground);
  font-size: 0.6875rem;
}

.ce-choice--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.ce-settings {
  display: grid;
  gap: 0.5rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--muted);
}

.ce-choice input[type="radio"],
.ce-choice input[type="checkbox"] {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  margin: 0.125rem 0 0;
  accent-color: var(--ce-chroma);
  cursor: pointer;
}

.ce-choice input[type="radio"]:focus-visible,
.ce-choice input[type="checkbox"]:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.ce-choice-copy {
  display: grid;
  min-width: 0;
  gap: 0.125rem;
}

.ce-choice-copy strong {
  color: var(--foreground);
  font-weight: 500;
}

.ce-choice-copy small {
  font-size: 0.59375rem;
  line-height: 1.35;
}

.ce-status {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--muted);
  padding: 0.5rem 0.6rem;
  font-size: 0.7rem;
}

.ce-status--error {
  border-color: color-mix(in srgb, var(--marinara-chat-chrome-danger-text, #e08080) 45%, transparent);
  color: var(--marinara-chat-chrome-danger-text, #e08080);
}

.ce-dialog-foot {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 0.75rem;
  border-top: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.625rem 0.75rem;
}

.ce-estimate {
  min-width: 0;
  color: var(--muted-foreground);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}

.ce-lorebook-list {
  display: grid;
  max-height: 9rem;
  gap: 0.3rem;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.45rem;
  scrollbar-color: var(--marinara-chat-chrome-panel-scrollbar) transparent;
  scrollbar-width: thin;
}

.ce-lorebook {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  border-radius: 0.375rem;
  padding: 0.2rem 0.25rem;
  cursor: pointer;
  color: var(--muted-foreground);
  font-size: 0.6875rem;
}

.ce-lorebook:hover {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
}

.ce-lorebook input[type="checkbox"] {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  margin: 0.0625rem 0 0;
  accent-color: var(--ce-chroma);
  cursor: pointer;
}

.ce-lorebook input[type="checkbox"]:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.ce-lorebook-name {
  min-width: 0;
  overflow: hidden;
  color: var(--foreground);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-search-face {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  text-align: left;
}

.ce-search-face-label {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-search-face--muted .ce-search-face-label {
  color: var(--muted-foreground);
}

.ce-search-chevron {
  flex: none;
  margin-left: auto;
  opacity: 0.6;
  transition: transform 150ms ease;
}

.ce-search-chevron--open {
  transform: rotate(180deg);
}

.ce-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  border: 0;
  padding: 0;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.ce-foot-error {
  flex-basis: 100%;
}

.ce-toast {
  position: fixed;
  z-index: 10001;
  bottom: max(1rem, env(safe-area-inset-bottom));
  left: 50%;
  display: flex;
  max-width: min(26rem, calc(100vw - 2rem));
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border);
  border-radius: 0.75rem;
  background: var(--marinara-chat-chrome-panel-bg);
  padding: 0.625rem 0.75rem;
  color: var(--marinara-chat-chrome-panel-text);
  box-shadow: 0 12px 32px rgb(0 0 0 / 35%);
  font-size: 0.72rem;
  line-height: 1.45;
  transform: translateX(-50%);
}

marinara-capability-card-editor[view="selection-action"] {
  display: contents;
}

@media (max-width: 34rem) {
  .ce-target {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .ce-target-identity {
    grid-column: 1 / -1;
  }
}

.ce-search-select {
  display: grid;
  gap: 0.35rem;
}

.ce-search-panel {
  display: grid;
  gap: 0.35rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--popover);
  padding: 0.45rem;
}

.ce-search-options {
  display: grid;
  max-height: 11rem;
  margin: 0;
  padding: 0;
  gap: 0.125rem;
  overflow: auto;
  list-style: none;
  scrollbar-color: var(--marinara-chat-chrome-panel-scrollbar) transparent;
  scrollbar-width: thin;
}

.ce-search-option {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  border-radius: 0.375rem;
  background: transparent;
  padding: 0.3rem 0.4rem;
  color: var(--popover-foreground);
  cursor: pointer;
  font: inherit;
  font-size: 0.6875rem;
  text-align: left;
}

.ce-search-option:hover,
.ce-search-option--active {
  background: var(--accent);
  color: var(--accent-foreground);
}

.ce-search-option:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -1px;
}

.ce-search-option[aria-selected="true"] {
  font-weight: 600;
}

.ce-search-option-avatar {
  width: 1.25rem;
  height: 1.25rem;
  flex: none;
  overflow: hidden;
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 0.5625rem;
  font-weight: 600;
  line-height: 1.25rem;
  text-align: center;
  text-transform: uppercase;
}

.ce-search-option-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ce-search-option-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* \u2500\u2500 Runs panel + verdict queue (DESIGN \xA73) \u2500\u2500 */

.ce-panel {
  display: grid;
  gap: 0.6rem;
  margin-top: 0.75rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border);
  border-radius: 0.75rem;
  background: var(--marinara-chat-chrome-panel-bg);
  padding: 0.75rem;
  font-size: 0.75rem;
}

.ce-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ce-panel-heading {
  min-width: 0;
  overflow: hidden;
  color: var(--marinara-chat-chrome-panel-title);
  font-size: 0.75rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-panel-section {
  display: grid;
  gap: 0.35rem;
}

.ce-panel-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.ce-refresh-button,
.ce-back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.ce-sessions {
  display: grid;
  margin: 0;
  padding: 0;
  gap: 0.4rem;
  list-style: none;
}

.ce-session {
  display: grid;
  gap: 0.3rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--card);
  padding: 0.5rem 0.6rem;
}

.ce-session--active {
  border-color: color-mix(in srgb, var(--ce-chroma) 45%, var(--border));
}

.ce-session-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ce-session-label {
  min-width: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--foreground);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-session-label:hover {
  color: var(--marinara-chat-chrome-highlight-text);
  text-decoration: underline;
}

.ce-session-label:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.ce-session-chips,
.ce-session-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
}

.ce-session-date {
  margin-left: auto;
}

.ce-session-note {
  color: var(--marinara-chat-chrome-danger-text, #e08080);
}

.ce-session-actions {
  display: flex;
  justify-content: flex-end;
}

.ce-session-delete {
  justify-self: end;
}

.ce-progress {
  height: 0.375rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--muted);
}

.ce-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--ce-chroma);
  transition: width 300ms ease;
}

.ce-live-line {
  font-variant-numeric: tabular-nums;
}

.ce-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--muted);
  padding: 0.0625rem 0.45rem;
  color: var(--muted-foreground);
  font-size: 0.59375rem;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
}

.ce-chip--live {
  border-color: color-mix(in srgb, var(--ce-chroma) 50%, transparent);
  color: var(--foreground);
}

.ce-chip--review {
  border-color: color-mix(in srgb, #d9a13b 55%, transparent);
  color: #d9a13b;
}

.ce-chip--ok {
  border-color: color-mix(in srgb, var(--marinara-chat-chrome-success-text, #86d39a) 45%, transparent);
  color: var(--marinara-chat-chrome-success-text, #86d39a);
}

.ce-chip--danger {
  border-color: color-mix(in srgb, var(--marinara-chat-chrome-danger-text, #e08080) 45%, transparent);
  color: var(--marinara-chat-chrome-danger-text, #e08080);
}

.ce-chip--muted {
  opacity: 0.75;
}

.ce-confirm-strip {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--muted);
  padding: 0.35rem 0.5rem;
}

.ce-danger-button {
  color: var(--marinara-chat-chrome-danger-text, #e08080);
}

.ce-items {
  display: grid;
  margin: 0;
  padding: 0;
  gap: 0.35rem;
  list-style: none;
}

.ce-item {
  display: grid;
  gap: 0.25rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--card);
  padding: 0.45rem 0.55rem;
}

.ce-item-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

/* Lineage and issue chips sit beside the name; the status chip stays at the row end. */
.ce-item-main > .ce-item-name + .ce-chip:not(:last-child) {
  margin-right: auto;
}

.ce-item-name {
  min-width: 0;
  overflow: hidden;
  color: var(--foreground);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-item-sub {
  display: grid;
  gap: 0.125rem;
  color: var(--muted-foreground);
  font-size: 0.65625rem;
  line-height: 1.4;
}

.ce-item-failure {
  overflow: hidden;
  color: var(--marinara-chat-chrome-danger-text, #e08080);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.ce-item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ce-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

/* Verdict queue */

.ce-queue {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
}

.ce-queue-head {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ce-queue-dots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3rem;
}

.ce-dot {
  width: 0.625rem;
  height: 0.625rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--muted);
  padding: 0;
  cursor: pointer;
}

.ce-dot--approved {
  border-color: var(--marinara-chat-chrome-success-text, #86d39a);
  background: var(--marinara-chat-chrome-success-text, #86d39a);
}

.ce-dot--rejected {
  border-color: var(--marinara-chat-chrome-danger-text, #e08080);
  background: var(--marinara-chat-chrome-danger-text, #e08080);
}

.ce-dot--current {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.ce-dot:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.ce-queue-card {
  display: grid;
  width: min(36rem, 100%);
  gap: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--card);
  padding: 0.75rem;
}

.ce-queue-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ce-queue-name {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--foreground);
  font-size: 0.8125rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-queue-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.ce-queue-fields {
  display: grid;
  gap: 0.4rem;
}

.ce-queue-field {
  display: grid;
  gap: 0.3rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.45rem 0.55rem;
}

.ce-queue-field-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
}

.ce-queue-field-name {
  color: var(--foreground);
  font-size: 0.6875rem;
}

.ce-queue-minirow {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: transparent;
  padding: 0.35rem 0.55rem;
  color: var(--muted-foreground);
  cursor: pointer;
  font: inherit;
  font-size: 0.6875rem;
  text-align: left;
}

.ce-queue-minirow:hover {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
}

.ce-queue-minirow:focus-visible,
.ce-queue-expander:focus-visible,
.ce-queue-approve-all:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.ce-queue-minirow-field {
  color: var(--foreground);
  font-weight: 600;
}

.ce-diff {
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--background);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.625rem;
  line-height: 1.5;
  scrollbar-color: var(--marinara-chat-chrome-panel-scrollbar) transparent;
  scrollbar-width: thin;
}

.ce-diff-line {
  display: flex;
  gap: 0.4rem;
  padding: 0 0.4rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.ce-diff-sign {
  flex: none;
  width: 0.6rem;
  color: var(--muted-foreground);
}

.ce-diff-line--del {
  background: color-mix(in srgb, var(--marinara-chat-chrome-danger-text, #e08080) 14%, transparent);
  color: var(--marinara-chat-chrome-danger-text, #e08080);
  text-decoration: line-through;
  text-decoration-thickness: 1px;
}

.ce-diff-line--add {
  background: color-mix(in srgb, var(--marinara-chat-chrome-success-text, #86d39a) 13%, transparent);
  color: var(--marinara-chat-chrome-success-text, #86d39a);
}

.ce-diff-line--marker {
  justify-content: center;
  color: var(--muted-foreground);
  font-style: italic;
}

.ce-queue-expander,
.ce-queue-approve-all {
  border: 0;
  background: transparent;
  padding: 0.15rem 0;
  color: var(--ce-chroma);
  cursor: pointer;
  font: inherit;
  font-size: 0.65625rem;
  text-align: left;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.ce-queue-approve-all:disabled,
.ce-queue-expander:disabled {
  cursor: default;
  opacity: 0.6;
}

.ce-queue-fullfield {
  max-height: 16rem;
  margin: 0;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--background);
  padding: 0.4rem 0.5rem;
  color: var(--foreground);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.625rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  scrollbar-color: var(--marinara-chat-chrome-panel-scrollbar) transparent;
  scrollbar-width: thin;
}

.ce-queue-stale {
  display: grid;
  gap: 0.4rem;
  border: 1px solid color-mix(in srgb, #d9a13b 55%, transparent);
  border-radius: 0.5rem;
  background: color-mix(in srgb, #d9a13b 12%, transparent);
  padding: 0.5rem 0.6rem;
  color: var(--foreground);
  font-size: 0.6875rem;
}

.ce-queue-stale p {
  margin: 0;
}

.ce-queue-stale-actions {
  display: flex;
  gap: 0.4rem;
}

.ce-queue-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ce-queue-reject,
.ce-queue-approve {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.ce-key-hint {
  border: 1px solid currentcolor;
  border-radius: 0.25rem;
  padding: 0 0.25rem;
  font-family: inherit;
  font-size: 0.5625rem;
  opacity: 0.7;
}

.ce-edit-retry .ce-dialog-body {
  gap: 0.75rem;
}

@media (prefers-reduced-motion: reduce) {
  .ce-dialog-close,
  .ce-target-remove,
  .ce-notice-close,
  .ce-search-option,
  .ce-search-chevron,
  .ce-lorebook,
  .ce-progress-fill {
    transition: none;
  }
}

/* \u2500\u2500 Overlay workspace (capabilityApi 1.68) \u2500\u2500 */

/* Bulk runs carry schema, split and avatar tooling, so the workspace claims most of the screen;
   it still caps on very large displays and becomes a full-screen sheet on phones. */
.ce-dialog.ce-workspace {
  width: min(112rem, 100%);
  height: min(94dvh, 68rem);
  max-height: min(94dvh, 68rem);
}

.ce-workspace-body {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.ce-workspace-body > .ce-panel {
  min-height: 0;
  flex: 1;
  margin-top: 0;
  overflow: auto;
  border: 0;
  border-radius: 0;
}

.ce-workspace-split {
  display: grid;
  /* Content-sized floor so a sparse workspace doesn't collapse to a sliver. */
  min-height: 16rem;
  flex: 1;
  grid-template-columns: minmax(15rem, 22rem) minmax(0, 1fr);
}

.ce-workspace-rail {
  display: grid;
  align-content: start;
  gap: 0.6rem;
  overflow: auto;
  border-right: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.75rem;
}

.ce-workspace-main {
  min-width: 0;
  overflow: auto;
}

.ce-panel--workspace {
  display: flex;
  flex-direction: column;
  /* Panes own their padding so the rail divider spans the full height. */
  padding: 0;
}

/* The detail panel nests inside the main pane: flatten its box, keep its padding. */
.ce-workspace-main > .ce-panel {
  margin-top: 0;
  border: 0;
  border-radius: 0;
}

@media (max-width: 48rem) {
  .ce-dialog.ce-workspace {
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }

  .ce-workspace-split {
    grid-template-columns: 1fr;
  }

  /* Mobile: the detail's back button provides the return navigation. */
  .ce-workspace-rail {
    display: none;
  }
}

/* \u2500\u2500 Transform task: shared controls \u2500\u2500 */

.ce-inline-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.ce-inline-controls > .ce-field {
  min-width: 0;
  flex: 1;
}

.ce-segmented {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 2px;
  border: 1px solid var(--marinara-chat-chrome-input-border);
  border-radius: 0.5rem;
  background: var(--marinara-chat-chrome-input-bg);
  padding: 2px;
}

.ce-segment {
  border: 0;
  border-radius: 0.375rem;
  background: transparent;
  padding: 0.35rem 0.6rem;
  color: var(--marinara-chat-chrome-panel-muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 600;
}

.ce-segment:hover:not(:disabled) {
  color: var(--marinara-chat-chrome-panel-text);
}

.ce-segment[aria-checked="true"] {
  background: var(--marinara-chat-chrome-highlight-bg-hover);
  box-shadow: inset 0 0 0 1px var(--marinara-chat-chrome-input-border-focus);
  color: var(--marinara-chat-chrome-highlight-text);
}

.ce-segment:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.ce-segment:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.ce-transform-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.75rem;
}

.ce-phase2-box {
  display: grid;
  gap: 0.6rem;
  border-left: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding-left: 0.75rem;
}

/* \u2500\u2500 Session detail: pipeline totals and lineage \u2500\u2500 */

.ce-pipeline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 1rem;
  margin-bottom: 0.6rem;
  border: 1px solid var(--marinara-chat-chrome-panel-divider);
  border-radius: 0.5rem;
  padding: 0.55rem 0.7rem;
}

.ce-pipeline-count {
  display: grid;
  gap: 0.1rem;
  margin-right: auto;
}

.ce-pipeline-count strong {
  color: var(--marinara-chat-chrome-panel-title);
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
}

.ce-item--child {
  position: relative;
  margin-left: 1.25rem;
}

.ce-item--child::before {
  position: absolute;
  top: -0.35rem;
  bottom: 50%;
  left: -0.75rem;
  width: 0.55rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-input-border-focus);
  border-left: 1px solid var(--marinara-chat-chrome-input-border-focus);
  border-bottom-left-radius: 0.35rem;
  content: "";
}

/* \u2500\u2500 Large tool dialogs (schema studio, split review, avatar studio) \u2500\u2500 */

.ce-dialog.ce-studio,
.ce-dialog.ce-avatar-studio {
  width: min(96rem, 100%);
  height: min(90dvh, 58rem);
  max-height: min(90dvh, 58rem);
}

.ce-dialog.ce-split-review {
  width: min(72rem, 100%);
}

.ce-studio-body,
.ce-avatar-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: minmax(11rem, 14rem) minmax(0, 1.1fr) minmax(0, 1fr);
}

.ce-avatar-body {
  grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr) minmax(13rem, 17rem);
}

.ce-studio-list,
.ce-avatar-sources {
  display: grid;
  align-content: start;
  gap: 0.3rem;
  overflow: auto;
  border-right: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.6rem;
}

.ce-studio-list-item {
  display: grid;
  gap: 0.1rem;
  border: 1px solid transparent;
  border-radius: 0.4rem;
  background: transparent;
  padding: 0.45rem 0.55rem;
  color: var(--marinara-chat-chrome-panel-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.ce-studio-list-item small {
  color: var(--marinara-chat-chrome-panel-muted);
}

.ce-studio-list-item[aria-pressed="true"] {
  border-color: var(--marinara-chat-chrome-input-border-focus);
  background: var(--marinara-chat-chrome-highlight-bg-hover);
}

.ce-studio-edit,
.ce-studio-preview {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
}

.ce-studio-edit {
  border-right: 1px solid var(--marinara-chat-chrome-panel-divider);
}

.ce-studio-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.5rem 0.6rem;
}

.ce-studio-tree {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 0.5rem;
}

.ce-schema-tree {
  display: grid;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ce-schema-tree .ce-schema-tree {
  margin-top: 0.25rem;
  padding-left: 1rem;
}

.ce-schema-node-head {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--marinara-chat-chrome-panel-divider);
  border-radius: 0.4rem;
  background: color-mix(in srgb, var(--marinara-chat-chrome-highlight-bg) calc(var(--ce-depth, 0) * 25%), transparent);
  padding: 0.35rem 0.5rem;
  color: var(--marinara-chat-chrome-panel-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.ce-schema-node-head--selected {
  border-color: var(--marinara-chat-chrome-input-border-focus);
  box-shadow: 0 0 0 2px var(--marinara-chat-chrome-focus-ring);
}

.ce-schema-node-head:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.ce-schema-key {
  color: var(--marinara-chat-chrome-panel-title);
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 0.75rem;
}

.ce-schema-hint {
  flex-basis: 100%;
  color: var(--marinara-chat-chrome-panel-muted);
  font-size: 0.7rem;
}

.ce-studio-inspector {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 0.75rem;
  max-height: 45%;
  overflow: auto;
  border-top: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.6rem;
}

.ce-studio-wide {
  grid-column: 1 / -1;
}

.ce-studio-node-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ce-studio-text,
.ce-studio-pre {
  min-height: 0;
  flex: 1;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: var(--marinara-chat-chrome-input-bg);
  padding: 0.7rem;
  color: var(--marinara-chat-chrome-panel-text);
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 0.72rem;
  line-height: 1.55;
  resize: none;
}

.ce-studio-pre {
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.ce-studio-preview > .ce-caption {
  padding: 0.45rem 0.6rem;
}

.ce-studio-name {
  margin-right: auto;
  min-width: min(16rem, 100%);
}

/* Split review */

.ce-split-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  overflow: hidden;
}

.ce-split-source,
.ce-split-proposal {
  display: grid;
  align-content: start;
  gap: 0.5rem;
  min-height: 0;
  overflow: auto;
  padding: 0.75rem;
}

.ce-split-source {
  border-right: 1px solid var(--marinara-chat-chrome-panel-divider);
}

.ce-split-source-text,
.ce-split-card-text {
  margin: 0;
  border-radius: 0.4rem;
  background: var(--marinara-chat-chrome-input-bg);
  padding: 0.6rem;
  color: var(--marinara-chat-chrome-panel-text);
  font-family: inherit;
  font-size: 0.75rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.ce-split-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ce-split-card {
  display: grid;
  align-content: start;
  gap: 0.4rem;
  border: 1px solid var(--marinara-chat-chrome-panel-divider);
  border-radius: 0.5rem;
  padding: 0.55rem;
}

.ce-split-card-text {
  max-height: 9rem;
  overflow: auto;
}

/* Avatar studio */

.ce-avatar-source-list {
  display: grid;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ce-avatar-source {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}

.ce-avatar-canvas-wrap {
  display: flex;
  min-height: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  overflow: hidden;
  background: repeating-conic-gradient(
      var(--marinara-chat-chrome-input-bg) 0 25%,
      var(--marinara-chat-chrome-highlight-bg) 0 50%
    )
    0 0 / 16px 16px;
  padding: 0.75rem;
}

.ce-avatar-canvas {
  width: auto;
  max-width: 100%;
  height: auto;
  min-height: 0;
  max-height: 100%;
  flex: 0 1 auto;
  border-radius: 0.4rem;
  box-shadow: 0 8px 32px rgb(0 0 0 / 35%);
  cursor: grab;
  touch-action: none;
}

.ce-avatar-canvas:active {
  cursor: grabbing;
}

.ce-avatar-canvas:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.ce-avatar-controls {
  display: grid;
  align-content: start;
  gap: 0.75rem;
  overflow: auto;
  border-left: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.75rem;
}

.ce-avatar-controls input[type="range"] {
  width: 100%;
  accent-color: var(--marinara-chat-chrome-accent);
}

@media (max-width: 60rem) {
  .ce-studio-body,
  .ce-avatar-body,
  .ce-split-body {
    grid-template-columns: minmax(0, 1fr);
    overflow: auto;
  }

  .ce-studio-list,
  .ce-avatar-sources,
  .ce-studio-edit,
  .ce-split-source,
  .ce-avatar-controls {
    border-right: 0;
    border-left: 0;
    border-bottom: 1px solid var(--marinara-chat-chrome-panel-divider);
  }

  .ce-studio-tree,
  .ce-studio-pre {
    max-height: 22rem;
  }

  .ce-dialog.ce-studio,
  .ce-dialog.ce-avatar-studio {
    height: 100%;
    max-height: 100%;
  }

  .ce-transform-row {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ce-segment {
    transition: none;
  }
}
`;function cl({props:e}){let a=(i,n)=>ae(e.localization,i,n),o=e.selectedCharacterIds??[],l=(e.selectionCount??o.length??0)>=1,r=a("cardEditor.action.open");return d("button",{type:"button",className:"mari-chrome-control ce-selection-button","data-icon-only":e.iconOnly?"":void 0,"aria-label":e.iconOnly?r:void 0,disabled:!l,onClick:()=>{zt({dispatch:{characterIds:o}}),e.onRequestClose?.()},children:[t(be,{className:"ce-icon","aria-hidden":"true"}),!e.iconOnly&&r]})}function fl({element:e}){let a=e.capabilityProps??{},o=e.getAttribute("view");return o==="selection-action"?t(cl,{props:a}):o==="agent-panel"?t($o,{localization:a.localization,agentName:a.agent?.name}):o==="overlay"?t(Wo,{localization:a.localization}):null}function ml({element:e}){let[,a]=f(0);G(()=>{let s=()=>a(l=>l+1);return e.addEventListener("marinara-capability-props",s),()=>e.removeEventListener("marinara-capability-props",s)},[e]);let o=e.capabilityProps?.localization?.direction==="rtl"?"rtl":"ltr";return d("div",{dir:o,style:{display:"contents"},children:[t("style",{children:Xo}),t(fl,{element:e})]})}var lt=class extends HTMLElement{constructor(){super(...arguments);We(this,"__root",null);We(this,"capabilityProps")}attributeChangedCallback(o,s,l){o==="view"&&s!==l&&this.__root&&this.render()}render(){this.__root?.render(t(ml,{element:this}))}connectedCallback(){this.__root||(this.__root=sr(this)),this.render()}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null)})}};We(lt,"observedAttributes",["view"]);var jo="marinara-capability-card-editor";customElements.get(jo)||customElements.define(jo,lt);
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/arrow-down.js:
lucide-react/dist/esm/icons/arrow-up.js:
lucide-react/dist/esm/icons/check.js:
lucide-react/dist/esm/icons/chevron-down.js:
lucide-react/dist/esm/icons/chevron-left.js:
lucide-react/dist/esm/icons/chevron-right.js:
lucide-react/dist/esm/icons/plus.js:
lucide-react/dist/esm/icons/refresh-cw.js:
lucide-react/dist/esm/icons/square-pen.js:
lucide-react/dist/esm/icons/trash-2.js:
lucide-react/dist/esm/icons/x.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.513.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
