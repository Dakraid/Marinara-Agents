var ms=Object.defineProperty;var ps=(e,a,r)=>a in e?ms(e,a,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[a]=r;var Ke=(e,a,r)=>ps(e,typeof a!="symbol"?a+"":a,r);var _a=globalThis.__MARINARA_HOST__,H=_a&&_a.version===1&&_a.modules?_a.modules.react:void 0;if(!H)throw new Error("Marinara Engine does not provide react; this package needs capability API 1.341 or newer.");var wl=H.Activity,kl=H.Children,El=H.Component,Pl=H.Fragment,Al=H.Profiler,Rl=H.PureComponent,Tl=H.StrictMode,Ml=H.Suspense,Bl=H.ViewTransition,Nl=H.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Dl=H.__COMPILER_RUNTIME,Fl=H.act,Ol=H.addTransitionType,ql=H.cache,Hl=H.cacheSignal,Ul=H.captureOwnerStack,zl=H.cloneElement,_l=H.createContext,Sa=H.createElement,Vl=H.createRef,Gl=H.default,Va=H.forwardRef,Wl=H.isValidElement,$l=H.lazy,Xl=H.memo,jl=H.startTransition,Kl=H.unstable_useCacheRefresh,Jl=H.use,Yl=H.useActionState,Me=H.useCallback,Zl=H.useContext,Ql=H.useDebugValue,ei=H.useDeferredValue,z=H.useEffect,ai=H.useEffectEvent,lr=H.useId,ti=H.useImperativeHandle,ri=H.useInsertionEffect,oi=H.useLayoutEffect,bt=H.useMemo,si=H.useOptimistic,li=H.useReducer,oe=H.useRef,f=H.useState,ii=H.useSyncExternalStore,di=H.useTransition,ni=H.version;var Ga=globalThis.__MARINARA_HOST__,va=Ga&&Ga.version===1&&Ga.modules?Ga.modules["react-dom/client"]:void 0;if(!va)throw new Error("Marinara Engine does not provide react-dom/client; this package needs capability API 1.341 or newer.");var ir=va.createRoot,ci=va.default,fi=va.hydrateRoot,mi=va.version;var dr=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),hs=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,r,s)=>s?s.toUpperCase():r.toLowerCase()),It=e=>{let a=hs(e);return a.charAt(0).toUpperCase()+a.slice(1)},Wa=(...e)=>e.filter((a,r,s)=>!!a&&a.trim()!==""&&s.indexOf(a)===r).join(" ").trim(),nr=e=>{for(let a in e)if(a.startsWith("aria-")||a==="role"||a==="title")return!0};var ur={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var cr=Va(({color:e="currentColor",size:a=24,strokeWidth:r=2,absoluteStrokeWidth:s,className:l="",children:o,iconNode:i,...d},m)=>Sa("svg",{ref:m,...ur,width:a,height:a,stroke:e,strokeWidth:s?Number(r)*24/Number(a):r,className:Wa("lucide",l),...!o&&!nr(d)&&{"aria-hidden":"true"},...d},[...i.map(([g,u])=>Sa(g,u)),...Array.isArray(o)?o:[o]]));var ne=(e,a)=>{let r=Va(({className:s,...l},o)=>Sa(cr,{ref:o,iconNode:a,className:Wa(`lucide-${dr(It(e))}`,`lucide-${e}`,s),...l}));return r.displayName=It(e),r};var gs=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],Je=ne("arrow-down",gs);var xs=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],Ye=ne("arrow-up",xs);var Ls=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],ya=ne("check",Ls);var bs=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],wa=ne("chevron-down",bs);var Is=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],ze=ne("chevron-left",Is);var Cs=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],ka=ne("chevron-right",Cs);var Ss=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Ze=ne("plus",Ss);var vs=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],ve=ne("square-pen",vs);var ys=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],Ea=ne("trash-2",ys);var ws=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ce=ne("x",ws);var St="/api",ks="/card-editor",fr="x-marinara-csrf";var Es="marinara_admin_secret";function vt(e){let a=e.status;return a==="apply"||a==="needs-confirmation"}var Qe=class extends Error{constructor(r,s,l){super(s);Ke(this,"status");Ke(this,"payload");this.name="CardEditorApiError",this.status=r,this.payload=l}};function yt(){if(typeof window>"u")return{};try{let e=window.localStorage.getItem(Es)?.trim();return e?{"X-Admin-Secret":e}:{}}catch{return{}}}function wt(e,a){if(!e||typeof e!="object"||Array.isArray(e))return a;let r=e;if(typeof r.error=="string"&&r.error.trim())return r.error.trim();if(r.error&&typeof r.error=="object"&&!Array.isArray(r.error)){let s=r.error.message;if(typeof s=="string"&&s.trim())return s.trim()}return typeof r.message=="string"&&r.message.trim()?r.message.trim():a}async function le(e,a="GET",r,s){let l=new Headers(yt());a!=="GET"&&l.set(fr,"1"),r!==void 0&&l.set("Content-Type","application/json");let o=await fetch(`${St}${ks}${e}`,{method:a,headers:l,signal:s,cache:"no-store",credentials:"same-origin",...r===void 0?{}:{body:JSON.stringify(r)}});if(!o.ok){let i=await o.json().catch(()=>null);throw new Qe(o.status,wt(i,o.statusText),i)}if(o.status!==204)return o.json()}function _e(e,a=""){return`/sessions/${encodeURIComponent(e)}${a}`}function ea(e,a,r){return _e(e,`/items/${encodeURIComponent(a)}${r}`)}function mr(e){return le("/sessions","POST",e)}function pr(e,a,r,s){return le(ea(e,a,"/split"),"POST",{decision:r,...s?{names:s}:{}})}function hr(e){return le(_e(e,"/phase2"),"POST",{})}function ma(e){return le("/schemas","GET",void 0,e)}function gr(e){return le(`/schemas/${encodeURIComponent(e.id)}`,"PUT",{name:e.name,text:e.text})}function xr(e){return le(`/schemas/${encodeURIComponent(e)}`,"DELETE")}function Lr(e){return le("/agent-config","GET",void 0,e)}function $a(e){return le("/settings","GET",void 0,e)}function br(e){return le("/settings","PUT",e)}function Xa(e){return le("/sessions","GET",void 0,e)}function aa(e,a){return le(_e(e),"GET",void 0,a)}function Ir(e){return le(_e(e,"/cancel"),"POST")}function Cr(e){return le(_e(e,"/rerun"),"POST")}function Pa(e,a){return le(ea(e,a,"/retry"),"POST")}function Sr(e,a){return le(ea(e,a,"/cancel"),"POST")}function vr(e,a,r){return le(ea(e,a,"/edit-retry"),"POST",r)}function yr(e,a,r){return le(ea(e,a,"/repair"),"POST",{rawOutput:r})}function kt(e,a,r){return le(ea(e,a,"/verdict"),"POST",r)}function ja(e,a,r){return le(ea(e,a,"/apply-result"),"POST",{results:r})}function wr(e){return le(_e(e,"/duplicate-applied"),"POST")}function kr(e,a){return le(_e(e,"/combine"),"POST",a)}function Er(e,a={}){let r=a.force?"?force=true":"";return le(_e(e,r),"DELETE")}async function pa(e,a){let r=await fetch(`${St}${e}`,{headers:new Headers(yt()),signal:a,cache:"no-store",credentials:"same-origin"});if(!r.ok){let s=await r.json().catch(()=>null);throw new Qe(r.status,wt(s,r.statusText),s)}return r.json()}function Et(e){try{let a=JSON.parse(e.data);if(a&&typeof a=="object"&&!Array.isArray(a)){let r=a.name;if(typeof r=="string"&&r.trim())return r}}catch{}return""}async function Pr(e){let a=await pa("/connections",e);return Array.isArray(a)?a.filter(r=>r&&typeof r.id=="string"&&typeof r.name=="string"&&r.provider!=="image_generation"&&r.provider!=="video_generation"):[]}async function Ar(e,a){let r=await pa(`/characters/${encodeURIComponent(e)}`,a),s=typeof r?.id=="string"&&r.id?r.id:e;return{id:s,name:Et(r)||s,avatarPath:typeof r?.avatarPath=="string"&&r.avatarPath?r.avatarPath:null}}var Ps=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions"];function Ct(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:{}}function fa(e){return typeof e=="string"?e:""}function As(e,a){let r=(()=>{try{return Ct(JSON.parse(typeof e?.data=="string"?e.data:"{}"))}catch{return{}}})(),s=Ct(r.extensions),l={name:fa(r.name),backstory:fa(s.backstory),appearance:fa(s.appearance),...Object.fromEntries(Ps.map(i=>[i,fa(r[i])]))},o=typeof e?.id=="string"&&e.id?e.id:a;return{id:o,name:l.name.trim()||o,avatarPath:typeof e?.avatarPath=="string"&&e.avatarPath?e.avatarPath:null,fields:l}}async function qe(e,a){let r=await pa(`/characters/${encodeURIComponent(e)}`,a);return As(r,e)}function Pt(e){let{fields:a}=e;return{name:a.name,description:a.description,personality:a.personality,backstory:a.backstory,appearance:a.appearance,system_prompt:a.system_prompt}}async function Rr(e,a){let r=await pa(`/lorebooks/${encodeURIComponent(e)}/entries`,a);return Array.isArray(r)?r.map(s=>{let l=Ct(s);return{name:fa(l.name),content:fa(l.content),enabled:l.enabled!==!1&&l.enabled!=="false"}}):[]}async function Ka(e,a,r){let s=new Headers(yt());s.set(fr,"1"),r!==void 0&&s.set("Content-Type","application/json");let l=await fetch(`${St}${e}`,{method:a,headers:s,cache:"no-store",credentials:"same-origin",...r===void 0?{}:{body:JSON.stringify(r)}});if(!l.ok){let o=await l.json().catch(()=>null);throw new Qe(l.status,wt(o,l.statusText),o)}return l.json()}function At(e,a,r){return Ka(`/characters/${encodeURIComponent(e)}`,"PATCH",{data:a,versionSource:r.versionSource,versionReason:r.versionReason})}function Tr(e){return Ka(`/characters/${encodeURIComponent(e)}/duplicate`,"POST")}function Mr(e,a){return Ka(`/characters/${encodeURIComponent(e)}/avatar`,"POST",{avatar:a,filename:"card-editor-composite.png"})}function Br(e){return Ka("/characters","POST",{data:e})}function Nr(e,a){let r=new URLSearchParams({limit:String(e.limit??50),offset:String(e.offset??0),sort:"name-asc"}),s=e.search?.trim();return s&&r.set("search",s),pa(`/characters/catalog?${r.toString()}`,a)}async function Dr(e){let a=await pa("/lorebooks",e);return Array.isArray(a)?a.filter(r=>!!r&&typeof r.id=="string"&&typeof r.name=="string"):[]}function Ja(e,a){let r=a.prefix?.trim()?a.prefix:void 0,s=a.suffix?.trim()?a.suffix:void 0,l=a.removePrefix?.trim()?a.removePrefix:void 0,o=a.removeSuffix?.trim()?a.removeSuffix:void 0,i=e;return l&&i.toLowerCase().startsWith(l.toLowerCase())&&(i=i.slice(l.length)),o&&i.toLowerCase().endsWith(o.toLowerCase())&&(i=i.slice(0,-o.length)),i=i.trim(),i||(i=e),`${r??""}${i}${s??""}`}var Rs=/&#(?:(x|X)([0-9a-fA-F]+)|([0-9]+));/g,Ts=[[/&lt;/g,"<"],[/&gt;/g,">"],[/&quot;/g,'"'],[/&apos;/g,"'"],[/&nbsp;/g,"\xA0"]];function Be(e){let r=e.replace(Rs,(s,l,o,i)=>{let d=l?Number.parseInt(o,16):Number(i);if(!Number.isInteger(d)||d<=0||d>1114111)return s;try{return String.fromCodePoint(d)}catch{return s}});for(let[s,l]of Ts)r=r.replace(s,l);return r.replace(/&amp;/g,"&")}var Fr={_meta:{locale:"en",direction:"ltr"},"cardEditor.title":"Card Editor","cardEditor.panel.empty":"No bulk editing sessions yet.","cardEditor.error.network":"Could not reach Card Editor.","cardEditor.action.open":"Card Editor","cardEditor.dialog.title":"Bulk Card Editor","cardEditor.dialog.close":"Close","cardEditor.dialog.draft.restored":"Restored your unsent settings and notes from last time.","cardEditor.dialog.draft.discard":"Start fresh","cardEditor.dialog.presets.title":"Presets","cardEditor.dialog.presets.name":"Preset name","cardEditor.dialog.presets.namePlaceholder":"Type a new name or pick a saved preset","cardEditor.dialog.presets.hint":"Presets save every setting below except the targets and their notes.","cardEditor.dialog.presets.load":"Load","cardEditor.dialog.presets.save":"Save","cardEditor.dialog.presets.overwrite":"Overwrite","cardEditor.dialog.presets.delete":"Delete","cardEditor.dialog.targets.title":"Targets \xB7 {{count}} characters","cardEditor.dialog.targets.loading":"Loading selected cards\u2026","cardEditor.dialog.targets.empty":"No cards yet. Search above to add characters to this run.","cardEditor.dialog.targets.loadFailed":"card could not be loaded","cardEditor.dialog.targets.notePlaceholder":"Focus on backstory\u2026","cardEditor.dialog.targets.noteLabel":"Note for {{name}}","cardEditor.dialog.targets.styleLabel":"Style override for {{name}}","cardEditor.dialog.targets.styleSession":"\u2014 use session style \u2014","cardEditor.dialog.targets.styleNone":"None","cardEditor.dialog.targets.unloadableBlock":"Remove cards that could not be loaded before dispatching.","cardEditor.dialog.targets.remove":"Remove {{name}}","cardEditor.dialog.search.placeholder":"Search characters\u2026","cardEditor.dialog.search.loading":"Searching\u2026","cardEditor.dialog.search.noResults":"No characters match.","cardEditor.dialog.search.error":"Characters could not be loaded.","cardEditor.dialog.search.invalid":"Invalid search: {{message}}","cardEditor.dialog.model.title":"Model","cardEditor.dialog.model.connection":"Connection","cardEditor.dialog.model.connectionDefault":"\u2014 agent default \u2014","cardEditor.dialog.model.connectionsLoading":"Loading connections\u2026","cardEditor.dialog.model.connectionsError":"Connections could not be loaded.","cardEditor.dialog.model.preset":"Prompt preset","cardEditor.dialog.model.presetStandard":"Standard rewrite","cardEditor.dialog.model.presetStrict":"Strict surgical","cardEditor.dialog.model.presetRebalance":"Field rebalancing","cardEditor.dialog.model.presetXmlSimple":"XML \xB7 Simple","cardEditor.dialog.model.presetXmlComplex":"XML \xB7 Complex","cardEditor.dialog.model.presetCustom":"Custom\u2026","cardEditor.dialog.model.customTemplate":"Custom template","cardEditor.dialog.model.customTemplateHint":"The full prompt template sent for every card. Choosing Custom prefills this field with the current preset's body.","cardEditor.dialog.instructions.title":"Instructions & references","cardEditor.dialog.instructions.global":"Global instruction","cardEditor.dialog.instructions.globalPlaceholder":"Applies to every card \u2014 e.g. tighten prose, remove meta commentary\u2026","cardEditor.dialog.instructions.behavior":"Behavior character","cardEditor.dialog.instructions.behaviorHint":"One card whose behavior, judgment, and writing style guide how edits are written. The directive and notes still decide what changes.","cardEditor.dialog.instructions.behaviorNone":"None","cardEditor.dialog.instructions.lorebooks":"Global lorebooks","cardEditor.dialog.instructions.lorebooksHint":"Reference context applied to every card.","cardEditor.dialog.instructions.lorebooksFilter":"Filter lorebooks\u2026","cardEditor.dialog.instructions.lorebooksLoading":"Loading lorebooks\u2026","cardEditor.dialog.instructions.lorebooksEmpty":"No lorebooks in the library.","cardEditor.dialog.instructions.lorebooksNoneMatch":"No lorebooks match the filter.","cardEditor.dialog.instructions.lorebooksError":"Lorebooks could not be loaded.","cardEditor.dialog.processing.title":"Processing","cardEditor.dialog.processing.modeIndividual":"One agent per card","cardEditor.dialog.processing.modeBatched":"Batched \u2014 XML, N cards per call","cardEditor.dialog.processing.batchSize":"Batch size","cardEditor.dialog.processing.providerRetries":"Provider retries","cardEditor.dialog.processing.refusalRetries":"Refusal retries","cardEditor.dialog.processing.concurrency":"Concurrency","cardEditor.dialog.processing.rebalance":"Rebalance field content","cardEditor.dialog.processing.rebalanceHint":"Splits content into Description / Personality / Backstory / Appearance / Scenario.","cardEditor.dialog.processing.completionMode":"On completion","cardEditor.dialog.processing.completionAsk":"Ask (default)","cardEditor.dialog.processing.completionApply":"Always apply in place","cardEditor.dialog.processing.completionDuplicate":"Always duplicate","cardEditor.dialog.processing.completionCaption":"Apply mode holds stale cards for review instead of overwriting them. Duplicates use this session's prefix or suffix.","cardEditor.dialog.processing.autoDisabledNote":"The Card Editor's bulk settings require review, so auto-approve and on-completion writes are disabled here.","cardEditor.dialog.processing.overflowCaption":"On context overflow the failed batch is split and re-dispatched automatically until single-card calls remain.","cardEditor.dialog.saving.title":"Saving","cardEditor.dialog.saving.confirm":"In-place \u2014 confirm each card","cardEditor.dialog.saving.auto":"In-place \u2014 auto-approve (saves each character's latest revision)","cardEditor.dialog.saving.duplicate":"Duplicate \u2014 apply to copies","cardEditor.dialog.saving.duplicatePrefix":"Name prefix","cardEditor.dialog.saving.duplicatePrefixPlaceholder":"Prefix for the copy names","cardEditor.dialog.saving.duplicatePrefixHint":"Both affixes apply: copies are named prefix + name + suffix. Blank boxes are ignored.","cardEditor.dialog.saving.duplicateSuffix":"Name suffix","cardEditor.dialog.saving.duplicateSuffixPlaceholder":"Suffix for the copy names","cardEditor.dialog.saving.duplicateRemoveGroup":"Remove from name","cardEditor.dialog.saving.duplicateRemovePrefix":"Remove prefix","cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder":"Strip this from the start of the copy name","cardEditor.dialog.saving.duplicateRemoveSuffix":"Remove suffix","cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder":"Strip this from the end of the copy name","cardEditor.dialog.saving.duplicateNamePreview":"Copy name: {{name}}","cardEditor.dialog.saving.combined":"Combined \u2014 create one new card","cardEditor.dialog.saving.combinedName":"Combined card name","cardEditor.dialog.saving.combinedNamePlaceholder":"The one new card's name","cardEditor.dialog.saving.combinedCaption":"Each character's generated XML document is joined into ONE new card's description \u2014 no per-card writes.","cardEditor.dialog.saving.combinedNameRequired":"Enter a name for the combined card before dispatching.","cardEditor.dialog.saving.reviewRequiredHint":"The bulk settings require review, so auto-approve is unavailable \u2014 dispatches wait for your confirmation.","cardEditor.dialog.saving.caption":"In-place always writes a new revision. Auto-approve holds back cards that genuinely changed mid-run for review. Duplicates are renamed by the affixes above \u2014 prefix, suffix, and removals combine. Combined concatenates each generated XML document into one new card.","cardEditor.dialog.estimate":"Batched \xD7{{batch}} \u2192 {{batchedCalls}} calls \xB7 individual \u2192 {{individualCalls}} calls","cardEditor.dialog.dispatch":"Dispatch","cardEditor.dialog.dispatching":"Dispatching\u2026","cardEditor.dialog.dispatchError":"Could not create the session: {{message}}","cardEditor.panel.title":"Bulk runs","cardEditor.panel.openWorkspace":"Open Card Editor workspace","cardEditor.panel.summaryCounts":"{{active}} active \xB7 {{recent}} past sessions","cardEditor.panel.titleWithAgent":"Bulk runs \u2014 {{agent}}","cardEditor.panel.refresh":"Refresh","cardEditor.panel.loading":"Loading sessions\u2026","cardEditor.panel.loadError":"Sessions could not be loaded.","cardEditor.panel.activeTitle":"Active","cardEditor.panel.historyTitle":"History","cardEditor.panel.progress":"{{done}} of {{total}} cards","cardEditor.panel.modeIndividual":"individual","cardEditor.panel.modeBatched":"batched \xD7{{size}}","cardEditor.panel.saveMode.confirm":"confirm each card","cardEditor.panel.saveMode.auto":"auto-approve","cardEditor.panel.saveMode.duplicate":"duplicate","cardEditor.panel.saveMode.combined":"combined","cardEditor.panel.completionMode.ask":"on completion \xB7 ask","cardEditor.panel.completionMode.apply":"on completion \xB7 apply","cardEditor.panel.completionMode.duplicate":"on completion \xB7 duplicate","cardEditor.panel.enforcementProgress":"Applying completion outcome \xB7 {{done}} of {{total}} cards","cardEditor.panel.runAgain":"Run again","cardEditor.panel.live.batch":"Running batch {{index}} of {{count}}","cardEditor.panel.live.batchRetry":" \xB7 attempt {{attempt}}","cardEditor.panel.live.items":"Editing {{running}} of {{total}} cards","cardEditor.panel.live.queued":"{{count}} cards queued","cardEditor.panel.live.settling":"Finishing up\u2026","cardEditor.panel.cancel":"Cancel","cardEditor.panel.delete":"Delete","cardEditor.panel.deleteConfirm":"Delete this session? Its results are lost.","cardEditor.panel.deleteConfirmActive":"Still running \u2014 cancel it and delete?","cardEditor.panel.deleteYes":"Delete","cardEditor.panel.deleteYesActive":"Cancel & delete","cardEditor.panel.deleteNo":"Keep","cardEditor.panel.interruptedNotice":"The server restarted mid-run, so this session was interrupted. Failed items can still be retried from this session.","cardEditor.panel.statsFailed":"{{count}} failed","cardEditor.panel.sessionStatus.active":"active","cardEditor.panel.sessionStatus.completed":"completed","cardEditor.panel.sessionStatus.canceled":"canceled","cardEditor.panel.sessionStatus.interrupted":"interrupted","cardEditor.panel.back":"Back to sessions","cardEditor.panel.status.queued":"queued","cardEditor.panel.status.running":"running","cardEditor.panel.status.succeeded":"succeeded","cardEditor.panel.status.awaitingReview":"awaiting review","cardEditor.panel.status.needsReview":"needs review","cardEditor.panel.status.applied":"applied","cardEditor.panel.status.duplicated":"duplicated","cardEditor.panel.status.rejected":"rejected","cardEditor.panel.status.failedProvider":"failed \xB7 provider","cardEditor.panel.status.failedRefusal":"failed \xB7 refusal","cardEditor.panel.status.failedParse":"failed \xB7 parse","cardEditor.panel.status.canceled":"canceled","cardEditor.panel.status.interrupted":"interrupted","cardEditor.panel.status.unknown":"unknown","cardEditor.panel.detail.loading":"Loading session\u2026","cardEditor.panel.detail.loadError":"The session could not be loaded.","cardEditor.panel.detail.cancelAll":"Cancel all","cardEditor.panel.detail.rerunFailed":"Rerun all failed ({{count}})","cardEditor.panel.detail.reviewQueue":"Review queue ({{count}})","cardEditor.panel.detail.delete":"Delete session","cardEditor.panel.detail.summary":"{{fields}} fields \xB7 +{{added}}/\u2212{{removed}} words","cardEditor.panel.detail.noChanges":"no changes proposed","cardEditor.panel.detail.copyCreated":"copy: {{id}}","cardEditor.panel.detail.combine":"Create combined card ({{count}})","cardEditor.panel.detail.combinePartialConfirm":"{{count}} of {{total}} cards were collected. Create the combined card from the collected cards only?","cardEditor.panel.detail.combineYes":"Combine {{count}}","cardEditor.panel.detail.combineNo":"Cancel","cardEditor.panel.detail.combinedCreated":"combined card created: {{id}}","cardEditor.panel.detail.duplicateApplied":"Duplicate applied cards ({{count}})","cardEditor.panel.detail.duplicateAppliedPartial":"{{failed}} of {{total}} cards could not be duplicated \u2014 retry from the item row.","cardEditor.panel.detail.autoApplyError":"Auto-apply failed for {{name}}: {{message}}","cardEditor.panel.detail.actionError":"Action failed: {{message}}","cardEditor.panel.detail.pagePrev":"Previous page","cardEditor.panel.detail.pageNext":"Next page","cardEditor.panel.detail.page":"Page {{page}} of {{pages}}","cardEditor.panel.action.review":"Review","cardEditor.panel.action.rerun":"Rerun","cardEditor.panel.action.editRetry":"Edit & retry","cardEditor.panel.action.fixJson":"Fix JSON","cardEditor.panel.action.inspect":"Inspect","cardEditor.panel.action.cancelItem":"Cancel","cardEditor.panel.settings.title":"Bulk settings","cardEditor.panel.settings.maxParallelAgents":"Max parallel agents","cardEditor.panel.settings.maxParallelAgentsHint":"Upper bound on concurrent calls in bulk runs. 0 follows the connection's parallel job limit.","cardEditor.panel.settings.disableAutoVerdicts":"Require review (disable auto-approve / auto-apply)","cardEditor.panel.settings.disableAutoVerdictsHint":"Bulk dispatches always wait for your confirmation; auto-approve and on-completion apply/duplicate are turned off.","cardEditor.panel.settings.save":"Save settings","cardEditor.panel.settings.saved":"Saved.","cardEditor.queue.title":"Review changes","cardEditor.queue.close":"Back to the session","cardEditor.queue.position":"{{index}} of {{count}}","cardEditor.queue.empty":"Nothing left to review.","cardEditor.queue.dotsLabel":"Review progress","cardEditor.queue.dotLabel":"{{name}}: {{status}}","cardEditor.queue.chips.fields":"{{count}} fields","cardEditor.queue.chips.added":"+{{count}} words","cardEditor.queue.chips.removed":"\u2212{{count}} words","cardEditor.queue.chips.fieldWords":"{{count}} words","cardEditor.queue.duplicateNote":"Approving copies the current card and applies these fields to the copy.","cardEditor.queue.hiddenLines":"\u22EF {{count}} unchanged lines \u22EF","cardEditor.queue.miniRowWords":"+{{added}}/\u2212{{removed}} words","cardEditor.queue.field.expand":"show all hunks \u2192","cardEditor.queue.staleTitle":"{{count}} fields changed since the run \u2014 applying replaces them.","cardEditor.queue.staleApply":"Apply anyway","cardEditor.queue.staleSkip":"Skip","cardEditor.queue.applyFailed":"Applying failed: {{message}} \u2014 rerun the item from the session table.","cardEditor.queue.reportFailed":"The card was written but the confirmation could not be sent: {{message}} \u2014 reload the session to see the true state.","cardEditor.queue.verdictError":"The verdict failed: {{message}}","cardEditor.queue.prev":"Previous card","cardEditor.queue.next":"Next card","cardEditor.queue.reject":"Reject","cardEditor.queue.approve":"Approve","cardEditor.queue.rejectHint":"R","cardEditor.queue.approveHint":"A","cardEditor.queue.working":"Working\u2026","cardEditor.queue.approveAll":"Approve all remaining without review","cardEditor.queue.approveAllWorking":"Approving\u2026","cardEditor.editRetry.title":"Edit & retry \u2014 {{name}}","cardEditor.editRetry.close":"Close","cardEditor.editRetry.hint":"The exact rendered prompt sent to the model. Retry re-dispatches this card with the edited text.","cardEditor.editRetry.system":"System prompt","cardEditor.editRetry.user":"User prompt","cardEditor.editRetry.missing":"The rendered prompt was not retained for this item; use rerun instead.","cardEditor.editRetry.cancel":"Cancel","cardEditor.editRetry.retry":"Retry","cardEditor.editRetry.retrying":"Retrying\u2026","cardEditor.editRetry.error":"The retry failed: {{message}}","cardEditor.fixJson.title":"Fix JSON \u2014 {{name}}","cardEditor.fixJson.hint":"The model's response could not be parsed, even after auto-repair and a strict-JSON retry. Fix it and apply, or retry generation.","cardEditor.fixJson.response":"Raw model response","cardEditor.fixJson.dismiss":"Dismiss","cardEditor.fixJson.regenerate":"Retry generation","cardEditor.fixJson.apply":"Apply fix","cardEditor.workspace.title":"Card Editor","cardEditor.workspace.close":"Close","cardEditor.panel.status.awaitingSplit":"split proposed","cardEditor.panel.status.split":"split","cardEditor.panel.status.staged":"phase 1 done","cardEditor.dialog.model.presetTransform":"Transform to a schema","cardEditor.transform.title":"Schema transform","cardEditor.transform.schema":"Schema","cardEditor.transform.schemaBuiltIn":"{{name}} (built-in)","cardEditor.transform.editSchemas":"Edit schemas","cardEditor.transform.schemasError":"Schemas could not be loaded. Close the dialog and try again.","cardEditor.transform.formatLabel":"Write fields as","cardEditor.transform.format.markdown":"Markdown","cardEditor.transform.format.xml":"XML","cardEditor.transform.format.json":"JSON","cardEditor.transform.multiTitle":"When one card describes several characters","cardEditor.transform.multiMerge":"Keep them on one card","cardEditor.transform.multiMergeHint":"One result per source card. Each character gets its own document on that card.","cardEditor.transform.multiSplit":"Split them into separate cards","cardEditor.transform.multiSplitHint":"You confirm every split first. Split characters become new cards linked to the source, and the source card is never changed.","cardEditor.transform.outputModeTitle":"How the model answers","cardEditor.transform.outputStructured":"Structured fields (recommended)","cardEditor.transform.outputStructuredHint":"The model fills the schema as data and Marinara writes it as {{format}}.","cardEditor.transform.outputDocument":"The model writes the document itself","cardEditor.transform.outputDocumentHint":"The earlier method: the model writes each field's document text directly. Validation is skipped.","cardEditor.transform.providerJsonOn":"Provider JSON mode is on for the Card Editor agent. Connections that support it enforce the response shape; others use the normal prompt.","cardEditor.transform.providerJsonOff":"Provider JSON mode is off. Turn on \u201CUse structured output\u201D in the Card Editor agent settings to let supported connections enforce the response shape.","cardEditor.transform.providerJsonUnknown":"This Engine version does not report provider JSON mode, so the normal prompt is used.","cardEditor.transform.phase2":"Run a second phase","cardEditor.transform.phase2Hint":"After every split is decided, every Phase 1 result is processed again. Nothing is written to your cards until Phase 2 finishes.","cardEditor.transform.phase2Instruction":"Phase 2 instruction","cardEditor.transform.phase2InstructionPlaceholder":"For example: tighten the prose and make each card name its relations to the others.","cardEditor.transform.phase2Schema":"Phase 2 schema","cardEditor.transform.sameAsPhase1":"Same as Phase 1","cardEditor.transform.phase2AllowSplits":"Allow splits in Phase 2","cardEditor.pipeline.label":"Run totals","cardEditor.pipeline.count":"{{sources}} cards \u2192 {{results}} results","cardEditor.pipeline.splitsAccepted":"{{count}} source card(s) split into several characters","cardEditor.pipeline.noSplits":"No splits","cardEditor.pipeline.phaseLabel":"Shown phase","cardEditor.pipeline.phase":"Phase {{phase}}","cardEditor.pipeline.splitsPending":"{{count}} split(s) waiting for you","cardEditor.pipeline.startPhase2":"Start Phase 2 \xB7 {{count}} cards","cardEditor.panel.action.reviewSplit":"Review split","cardEditor.panel.detail.splitProposed":"The model proposes {{count}} characters for this card.","cardEditor.panel.detail.splitInto":"Split into {{count}} new cards. This card stays unchanged.","cardEditor.panel.detail.lineage":"{{index}} of {{count}} from {{origin}}","cardEditor.panel.detail.issues":"{{count}} schema issue(s)","cardEditor.split.title":"Split review \xB7 {{name}}","cardEditor.split.close":"Close split review","cardEditor.split.source":"Source card","cardEditor.split.sourceEmpty":"The source card has no description.","cardEditor.split.proposal":"The model proposes {{count}} characters.","cardEditor.split.reason":"Reason: {{reason}}","cardEditor.split.cardName":"Card {{index}} name","cardEditor.split.issues":"{{count}} schema issue(s)","cardEditor.split.outcome":"Accepting creates {{count}} new cards linked to the source. The source card is not changed.","cardEditor.split.skip":"Skip this card","cardEditor.split.retrySingle":"Retry as one card","cardEditor.split.accept":"Accept split \xB7 {{count}} cards","cardEditor.schemas.title":"Schema studio","cardEditor.schemas.close":"Close schema studio","cardEditor.schemas.loadError":"Schemas could not be loaded.","cardEditor.schemas.listLabel":"Schemas","cardEditor.schemas.builtIn":"Built-in","cardEditor.schemas.yours":"Yours","cardEditor.schemas.modeLabel":"Editor","cardEditor.schemas.modeBuilder":"Builder","cardEditor.schemas.modeText":"Text","cardEditor.schemas.textLabel":"Schema text","cardEditor.schemas.valid":"Valid schema","cardEditor.schemas.invalid":"Line {{line}}: {{message}}","cardEditor.schemas.kindGroup":"group","cardEditor.schemas.kindVocab":"values","cardEditor.schemas.kindRepeat":"repeats","cardEditor.schemas.maxChip":"max {{max}}","cardEditor.schemas.targetChip":"\u2192 {{field}}","cardEditor.schemas.nodeKey":"Element name","cardEditor.schemas.nodeTarget":"Card field","cardEditor.schemas.targetDefault":"description (default)","cardEditor.schemas.targetInherit":"Same as its top-level element","cardEditor.schemas.nodeHint":"Hint for the model","cardEditor.schemas.nodeHintPlaceholder":"What belongs here","cardEditor.schemas.nodeAttributes":"Attributes","cardEditor.schemas.nodeAttributesHint":"One per line as name=a | b | c. Leave the values empty for freeform; end with etc. to allow other values.","cardEditor.schemas.nodeMax":"Max length","cardEditor.schemas.nodeMaxNone":"none","cardEditor.schemas.nodeRepeat":"List of entries","cardEditor.schemas.addChild":"Add element","cardEditor.schemas.moveUp":"Move element up","cardEditor.schemas.moveDown":"Move element down","cardEditor.schemas.removeNode":"Remove","cardEditor.schemas.previewLabel":"Compiled preview","cardEditor.schemas.preview.markdown":"Markdown","cardEditor.schemas.preview.xml":"XML","cardEditor.schemas.preview.json":"JSON","cardEditor.schemas.preview.schema":"JSON Schema","cardEditor.schemas.previewHint.markdown":"The template the model sees when it writes Markdown itself.","cardEditor.schemas.previewHint.xml":"The template the model sees when it writes XML itself.","cardEditor.schemas.previewHint.json":"The data shape the model fills in structured mode, for every output format.","cardEditor.schemas.previewHint.schema":"Sent as provider structured output when the connection supports it.","cardEditor.schemas.name":"Schema name","cardEditor.schemas.copyName":"{{name}} copy","cardEditor.schemas.duplicate":"Save as new","cardEditor.schemas.save":"Save","cardEditor.schemas.delete":"Delete","cardEditor.schemas.deleteConfirm":"Delete \u201C{{name}}\u201D? Runs that already used it keep their copy.","cardEditor.schemas.deleteYes":"Delete schema","cardEditor.schemas.deleteNo":"Keep","cardEditor.avatar.open":"Avatar studio","cardEditor.avatar.title":"Avatar studio","cardEditor.avatar.close":"Close avatar studio","cardEditor.avatar.images":"Images","cardEditor.avatar.loading":"Loading card images\u2026","cardEditor.avatar.noImage":"No avatar; shows initials","cardEditor.avatar.moveUp":"Move {{name}} earlier","cardEditor.avatar.moveDown":"Move {{name}} later","cardEditor.avatar.sourcesHint":"Defaults to every card in this run. The source images are never changed.","cardEditor.avatar.canvasLabel":"Avatar composite. Drag to pan, scroll or pinch to zoom. With the canvas focused: Tab changes cell, arrow keys pan, plus and minus zoom, 0 resets the cell.","cardEditor.avatar.selected":"Selected: {{name}} \xB7 zoom {{zoom}}%","cardEditor.avatar.layout":"Layout","cardEditor.avatar.method.square":"Square","cardEditor.avatar.method.portrait":"Portrait","cardEditor.avatar.method.best-fit":"Best fit","cardEditor.avatar.columns":"Columns","cardEditor.avatar.columnsAuto":"Auto","cardEditor.avatar.gap":"Gap \xB7 {{gap}} px","cardEditor.avatar.zoom":"Cell zoom \xB7 {{zoom}}%","cardEditor.avatar.resolution":"Export size","cardEditor.avatar.resetCell":"Reset cell","cardEditor.avatar.resetAll":"Reset all","cardEditor.avatar.keys":"Tab changes cell \xB7 arrows pan \xB7 + and \u2212 zoom \xB7 0 resets","cardEditor.avatar.target":"Use as avatar for","cardEditor.avatar.targetOption":"Avatar for {{name}}","cardEditor.avatar.noTargets":"No cards written yet","cardEditor.avatar.apply":"Use as avatar","cardEditor.avatar.applying":"Saving\u2026","cardEditor.avatar.applied":"Saved as the avatar of {{name}}.","cardEditor.dialog.targets.add":"Add characters\u2026","cardEditor.setup.summary":"Run summary","cardEditor.setup.targets":"Targets","cardEditor.workspace.newRun":"New run","cardEditor.workspace.newRunCount":"New run \xB7 {{count}} characters selected","cardEditor.workspace.pickRun":"Pick a run on the left, or start a new one.","cardEditor.workspace.runs":"Runs","cardEditor.workspace.run":"Run","cardEditor.workspace.stages":"Run stages","cardEditor.workspace.stage.setup":"Setup","cardEditor.workspace.stage.processing":"Processing","cardEditor.workspace.stage.review":"Review","cardEditor.workspace.stage.finish":"Finish","cardEditor.workspace.items":"Items","cardEditor.workspace.filterItems":"Filter cards by name\u2026","cardEditor.workspace.statusFilter":"Filter by status","cardEditor.workspace.group.all":"All {{count}}","cardEditor.workspace.group.review":"Awaiting review {{count}}","cardEditor.workspace.group.approved":"Approved {{count}}","cardEditor.workspace.group.split":"Split {{count}}","cardEditor.workspace.group.failed":"Failed {{count}}","cardEditor.workspace.group.rejected":"Rejected {{count}}","cardEditor.workspace.group.running":"In progress {{count}}","cardEditor.workspace.selectListed":"Select the {{count}} cards shown","cardEditor.workspace.selectItem":"Select {{name}}","cardEditor.workspace.noItems":"No card matches these filters.","cardEditor.workspace.pickItem":"Pick a card from the list to see its changes.","cardEditor.workspace.tab.changes":"Changes","cardEditor.workspace.tab.split":"Split","cardEditor.workspace.tab.retry":"Prompt & retry","cardEditor.workspace.tab.json":"Raw output","cardEditor.workspace.tab.summary":"Details","cardEditor.workspace.selectedCount":"{{count}} selected","cardEditor.workspace.approveSelected":"Approve selected ({{count}})","cardEditor.workspace.rejectSelected":"Reject selected ({{count}})","cardEditor.workspace.approveAll":"Approve all remaining ({{count}})"};var Rt=Object.fromEntries(Object.entries(Fr).filter(([e,a])=>e!=="_meta"&&typeof a=="string")),Or={en:Rt};function Bs(e){let a=e?.trim().replaceAll("_","-").toLowerCase()||"en";return Or[a]??Or[a.split("-")[0]]??Rt}function Ns(e,a){return a?e.replaceAll(/\{\{([A-Za-z0-9_]+)\}\}/g,(r,s)=>{let l=a[s];return l==null?r:String(l)}):e}function ae(e,a,r){let s=Bs(e?.locale);return Ns(s[a]??Rt[a]??a,r)}var Ya=globalThis.__MARINARA_HOST__,Aa=Ya&&Ya.version===1&&Ya.modules?Ya.modules["react/jsx-runtime"]:void 0;if(!Aa)throw new Error("Marinara Engine does not provide react/jsx-runtime; this package needs capability API 1.341 or newer.");var Ne=Aa.Fragment,dd=Aa.default,t=Aa.jsx,n=Aa.jsxs;var Ds=200;function qr({name:e,avatarPath:a}){return t("span",{className:"ce-search-option-avatar","aria-hidden":"true",children:a?t("img",{src:a,alt:"",loading:"lazy"}):e.trim().charAt(0)||"?"})}function Ra({localization:e,selection:a,onChange:r,allowInherit:s=!1,buttonLabel:l,inheritLabel:o,noneLabel:i}){let d=(w,re)=>ae(e,w,re),m=lr(),g=oe(null),u=oe(null),[p,I]=f(!1),[v,y]=f(""),[T,D]=f([]),[J,G]=f(!1),[R,k]=f(!1),[P,B]=f(null),[b,A]=f(0),W=oe(0);z(()=>{if(!p)return;let w=++W.current;G(!0),k(!1),B(null);let re=setTimeout(()=>{Nr({search:v,limit:50,offset:0}).then(j=>{W.current===w&&(D(Array.isArray(j?.items)?j.items:[]),G(!1))}).catch(j=>{if(W.current!==w)return;(j instanceof Qe?j.payload:null)?.code==="query_syntax"?B(j.message):(D([]),k(!0)),G(!1)})},Ds);return()=>clearTimeout(re)},[p,v]),z(()=>{if(!p)return;let w=re=>{g.current&&re.target instanceof Node&&!g.current.contains(re.target)&&I(!1)};return document.addEventListener("pointerdown",w),()=>document.removeEventListener("pointerdown",w)},[p]);let $=w=>{r(w),I(!1),y(""),u.current?.focus()},F=[...s?[{key:"inherit",label:o??"",avatarPath:null,selected:a.kind==="inherit",select:()=>$({kind:"inherit"})}]:[],...i===void 0?[]:[{key:"none",label:i,avatarPath:null,selected:a.kind==="none",select:()=>$({kind:"none"})}],...T.map(w=>({key:w.id,label:w.name,avatarPath:w.avatarPath,title:w.comment?.trim()||void 0,tags:w.tags,selected:a.kind==="character"&&a.id===w.id,select:()=>$({kind:"character",id:w.id,name:w.name,avatarPath:w.avatarPath})}))],Y=F[Math.min(b,Math.max(F.length-1,0))],se=a.kind==="character"?a.name:a.kind==="inherit"?o??"":i??l,Z=w=>{if(w.key==="Escape"){w.stopPropagation(),I(!1),u.current?.focus();return}if(w.key==="ArrowDown"||w.key==="ArrowUp"){if(w.preventDefault(),F.length===0)return;let re=w.key==="ArrowDown"?1:-1;A(j=>(Math.min(j,F.length-1)+re+F.length)%F.length);return}w.key==="Enter"&&Y&&(w.preventDefault(),Y.select())};return n("div",{className:"ce-search-select",ref:g,children:[n("button",{ref:u,type:"button",className:`mari-chrome-field ce-field ce-search-face${a.kind==="character"?"":" ce-search-face--muted"}`,"aria-haspopup":"listbox","aria-expanded":p,"aria-controls":p?m:void 0,onClick:()=>{I(w=>!w),A(0)},children:[t("span",{className:"ce-sr-only",children:`${l}: `}),a.kind==="character"?t(qr,{name:a.name,avatarPath:a.avatarPath}):null,t("span",{className:"ce-search-face-label",children:se}),t(wa,{className:`ce-icon ce-search-chevron${p?" ce-search-chevron--open":""}`,"aria-hidden":"true"})]}),p?n("div",{className:"ce-search-panel",children:[t("input",{type:"search",role:"combobox","aria-autocomplete":"list","aria-expanded":"true","aria-controls":m,"aria-activedescendant":Y?`${m}-${Y.key}`:void 0,"aria-label":d("cardEditor.dialog.search.placeholder"),className:"mari-chrome-field ce-field",placeholder:d("cardEditor.dialog.search.placeholder"),value:v,autoFocus:!0,onChange:w=>{y(w.target.value),A(0)},onKeyDown:Z}),J?t("div",{className:"ce-caption",children:d("cardEditor.dialog.search.loading")}):null,P?t("div",{className:"ce-status ce-status--error",role:"alert",children:d("cardEditor.dialog.search.invalid",{message:P})}):null,R?t("div",{className:"ce-status ce-status--error",role:"alert",children:d("cardEditor.dialog.search.error")}):null,!J&&!R&&!P&&T.length===0?t("div",{className:"ce-caption",children:d("cardEditor.dialog.search.noResults")}):null,t("ul",{className:"ce-search-options",role:"listbox",id:m,"aria-label":l,children:F.map((w,re)=>t("li",{role:"presentation",children:n("button",{type:"button",role:"option",id:`${m}-${w.key}`,"aria-selected":w.selected,className:`ce-search-option${w===Y?" ce-search-option--active":""}`,onMouseEnter:()=>A(re),onClick:w.select,children:[w.key==="inherit"||w.key==="none"?null:t(qr,{name:w.label,avatarPath:w.avatarPath}),n("span",{className:"ce-search-option-text",children:[t("span",{className:"ce-search-option-name",children:w.label}),w.title?t("em",{className:"ce-search-option-meta",children:w.title}):null,w.tags?.length?n("span",{className:"ce-search-option-meta",children:[w.tags.slice(0,3).join(" \xB7 "),w.tags.length>3?` +${w.tags.length-3}`:""]}):null]})]})},w.key))})]}):null]})}var Hr='button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';function De(){try{return typeof window>"u"?void 0:window.localStorage}catch{return}}function Ur(e,a,r){let s=oe(null),l=oe(r);l.current=r;let o=oe(a);return o.current=a,z(()=>{if(!e)return;let i=document.activeElement instanceof HTMLElement?document.activeElement:null,d=s.current;if(!d)return;let m=requestAnimationFrame(()=>(d.querySelector(Hr)??d).focus()),g=u=>{if(u.key==="Escape"){if(u.isComposing||u.defaultPrevented||o.current())return;u.preventDefault(),l.current();return}if(u.key!=="Tab")return;let p=[...d.querySelectorAll(Hr)];if(!d.contains(document.activeElement)){u.preventDefault(),(p[0]??d).focus();return}if(p.length===0){u.preventDefault(),d.focus();return}let I=p[0],v=p.at(-1);u.shiftKey&&document.activeElement===I?(u.preventDefault(),v.focus()):!u.shiftKey&&document.activeElement===v&&(u.preventDefault(),I.focus())};return document.addEventListener("keydown",g),()=>{cancelAnimationFrame(m),document.removeEventListener("keydown",g),requestAnimationFrame(()=>{i?.isConnected&&i.focus()})}},[e]),s}function ke({className:e,label:a,busy:r=!1,closeOnEscape:s=!0,onClose:l,children:o,...i}){let d=oe(l);d.current=l;let m=oe(r);return m.current=r,z(()=>{if(!s)return;let g=u=>{u.key!=="Escape"||u.isComposing||u.defaultPrevented||u.target?.closest("input, textarea, select, [contenteditable]")||(u.preventDefault(),m.current||d.current())};return document.addEventListener("keydown",g,!0),()=>document.removeEventListener("keydown",g,!0)},[s]),t("section",{className:`ce-pane ${e}`,"aria-label":a,...i,children:o})}function ta({id:e,label:a,value:r,min:s,max:l,onChange:o}){return n("label",{className:"ce-label",htmlFor:e,children:[t("span",{className:"ce-label-title",children:a}),t("input",{id:e,type:"number",className:"mari-chrome-field ce-field ce-number-input",value:r,min:s,max:l,step:1,inputMode:"numeric",onChange:i=>{if(i.target.value==="")return;let d=Number(i.target.value);Number.isFinite(d)&&o(Math.max(s,Math.min(l,Math.trunc(d))))}})]})}function Ee({name:e,value:a,checked:r,onChange:s,title:l,disabled:o}){return n("label",{className:`ce-choice${o?" ce-choice--disabled":""}`,children:[t("input",{type:"radio",name:e,value:a,checked:r,disabled:o,onChange:()=>s(a)}),t("span",{className:"ce-choice-copy",children:t("strong",{children:l})})]})}function zr({localization:e,targets:a,targetsLoading:r,onUpdateTarget:s,onRemoveTarget:l,onAddTarget:o}){let i=(d,m)=>ae(e,d,m);return n("fieldset",{className:"ce-section","data-ce-section":"targets",children:[t("legend",{className:"ce-section-heading",children:i("cardEditor.dialog.targets.title",{count:a.length})}),t(Ra,{localization:e,selection:{kind:"none"},onChange:d=>{d.kind==="character"&&o(d)},buttonLabel:i("cardEditor.dialog.targets.add")}),r?t("div",{className:"ce-status",children:i("cardEditor.dialog.targets.loading")}):null,!r&&a.length===0?t("p",{className:"ce-caption",children:i("cardEditor.dialog.targets.empty")}):null,t("ul",{className:"ce-targets",children:a.map((d,m)=>n("li",{className:"ce-target",children:[n("div",{className:"ce-target-identity",children:[t("span",{className:"ce-target-avatar","aria-hidden":"true",children:d.avatarPath?t("img",{src:d.avatarPath,alt:"",loading:"lazy"}):d.name.trim().charAt(0)||"?"}),n("span",{className:"ce-target-name",children:[d.name,d.loadError?n("span",{className:"ce-target-load-error",children:[" ",i("cardEditor.dialog.targets.loadFailed")]}):null]})]}),n("div",{className:"ce-target-controls",children:[t("input",{type:"text",className:"mari-chrome-field ce-field",value:d.note,placeholder:i("cardEditor.dialog.targets.notePlaceholder"),"aria-label":i("cardEditor.dialog.targets.noteLabel",{name:d.name}),...m===0?{"data-ce-autofocus":!0}:{},onChange:g=>s(d.characterId,{note:g.target.value})}),t(Ra,{localization:e,selection:d.style,onChange:g=>s(d.characterId,{style:g}),allowInherit:!0,buttonLabel:i("cardEditor.dialog.targets.styleLabel",{name:d.name}),inheritLabel:i("cardEditor.dialog.targets.styleSession"),noneLabel:i("cardEditor.dialog.targets.styleNone")})]}),t("button",{type:"button",className:"ce-target-remove","aria-label":i("cardEditor.dialog.targets.remove",{name:d.name}),onClick:()=>l(d.characterId),children:t(ce,{className:"ce-icon","aria-hidden":"true"})})]},d.characterId))})]})}var Tt={standard:`You are the Card Editor. You rewrite existing character cards from the user's instruction while preserving each card's voice, facts, and intent.

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
- Preserve {{char}} and {{user}} macros exactly; never resolve, escape, or rename them.`};function _r(e){return e==="standard"||e==="strict"||e==="rebalance"||e==="xml-simple"||e==="xml-complex"}var Bt=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions","backstory","appearance"],Vr=/^[A-Za-z_][\w.-]{0,63}$/;var Fs=`<character-name>
    <summary></summary>
    <description></description>
    <personality></personality>
    <backstory></backstory>
    <appearance></appearance>
    <scenario></scenario>
</character-name>`,Os=`<!-- all freeform text unless attributed; attributed elements use the values given, only one unless stated otherwise -->
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
</character-name>`;function Gr(e,a,r){let s=Za(r);if(!s.ok)throw new Error(`built-in schema ${e} is invalid: ${s.errors[0]?.message}`);return{id:e,name:a,builtIn:!0,root:s.root}}var wd=[Gr("simple","Simple",Fs),Gr("complex","Complex",Os)];function qs(e){let a=e.split("|").map(s=>s.trim()).filter(Boolean),r=a.length>0&&/^etc\.?$/i.test(a[a.length-1]);return{values:r?a.slice(0,-1):a,open:r}}function Za(e){let a=[],r=p=>e.slice(0,p).split(`
`).length,s=[],l=[],o,i,d=0,m=/<!--([\s\S]*?)-->|<\/\s*([^\s>]+)\s*>|<([^\s/>!]+)((?:\s+[^\s=>]+\s*=\s*"[^"]*")*)\s*(\/?)>|([^<]+)/g,g;for(;g=m.exec(e);){let p=r(g.index),[,I,v,y,T,D,J]=g;if(I!==void 0){let k=I.trim();s.length===0&&l.length===0?i=k:o=k;continue}if(J!==void 0){let k=J.trim();if(!k)continue;let P=s[s.length-1];P?P.hint||(P.hint=k):a.push({line:p,message:"Text outside the root element."});continue}if(v!==void 0){let k=s.pop();k?k.key!==v&&a.push({line:p,message:`Expected </${k.key}> but found </${v}>.`}):a.push({line:p,message:`Closing </${v}> has no opening tag.`});continue}if(y===void 0){a.push({line:p,message:"Unreadable markup."});continue}if(Vr.test(y)||a.push({line:p,message:`"${y}" is not a valid element name.`}),s.length>=8&&a.push({line:p,message:"Nesting deeper than 8 levels."}),++d>200){a.push({line:p,message:"More than 200 elements."});break}let G={key:y,attributes:[],children:[]};o&&(G.hint=o),o=void 0;for(let k of(T??"").matchAll(/([^\s=]+)\s*=\s*"([^"]*)"/g)){let[,P,B]=k;if(P==="max"){let b=Number(B);!Number.isInteger(b)||b<=0?a.push({line:p,message:`max on <${y}> must be a positive whole number.`}):G.maxLength=b}else if(P==="target")Bt.includes(B)?G.target=B:a.push({line:p,message:`target="${B}" is not a card field.`});else if(P==="repeat")G.repeat=B==="true";else{Vr.test(P)||a.push({line:p,message:`"${P}" is not a valid attribute name.`}),G.attributes.some(W=>W.name===P)&&a.push({line:p,message:`Attribute "${P}" appears twice on <${y}>.`});let{values:b,open:A}=qs(B);G.attributes.push({name:P,values:b,...A?{open:!0}:{}})}}G.attributes.some(k=>k.name==="text")&&a.push({line:p,message:`"text" is reserved for element text; rename the attribute on <${G.key}>.`});let R=s[s.length-1];R?(R.children.some(k=>k.key===G.key)&&a.push({line:p,message:`<${G.key}> appears twice under <${R.key}>.`}),R.children.push(G)):l.push(G),D||s.push(G)}for(let p of s)a.push({line:r(e.length),message:`<${p.key}> is never closed.`});l.length!==1&&a.length===0&&a.push({line:1,message:l.length===0?"The schema needs one root element.":"Only one root element is allowed."});let u=l[0];if(u){i&&!u.hint&&(u.hint=i);for(let p of u.children)$r(p,!0,a);u.children.length===0&&a.length===0&&a.push({line:1,message:"The root needs at least one element."})}return a.length>0||!u?{ok:!1,errors:a}:{ok:!0,root:u}}function $r(e,a,r){!a&&e.target&&r.push({line:1,message:`target is only allowed on top-level elements (<${e.key}>).`});for(let s of e.children)$r(s,!1,r)}function Wr(e,a){let r=e.attributes.map(s=>` ${s.name}="${[...s.values,...s.open?["etc."]:[]].join(" | ")}"`);return a&&(e.maxLength&&r.push(` max="${e.maxLength}"`),e.target&&r.push(` target="${e.target}"`),e.repeat&&r.push(' repeat="true"')),r.join("")}function Nt(e,a,r,s){let l="  ".repeat(a),o=a===0&&s?s:e.key,i=e.hint?`${l}<!-- ${e.hint} -->
`:"";if(e.children.length===0)return`${i}${l}<${o}${Wr(e,r)}></${o}>
`;let d=e.children.map(m=>Nt(m,a+1,r)).join("");return`${i}${l}<${o}${Wr(e,r)}>
${d}${l}</${o}>
`}function Ta(e){return Nt(e,0,!0).trimEnd()}function Xr(e){let a=e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null;if(!a)throw new Error("schema must be an object");if(typeof a.id!="string"||!a.id.trim()||a.id.length>160)throw new Error("schema.id is required");if(typeof a.name!="string"||!a.name.trim()||a.name.length>120)throw new Error("schema.name is required");let r=typeof a.text=="string"?a.text:Ta(jr(a.root,0));if(r.length>5e4)throw new Error("schema text must be at most 50000 characters");let s=Za(r);if(!s.ok)throw new Error(`schema is invalid: line ${s.errors[0].line}: ${s.errors[0].message}`);return{id:a.id.trim(),name:a.name.trim(),...a.builtIn===!0?{builtIn:!0}:{},root:s.root}}function jr(e,a){let r=e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null;if(!r||typeof r.key!="string"||a>8)throw new Error("schema.root is invalid");let s=Array.isArray(r.attributes)?r.attributes:[],l=Array.isArray(r.children)?r.children:[];return{key:r.key,...typeof r.hint=="string"&&r.hint?{hint:r.hint.replace(/--/g,"\u2013")}:{},attributes:s.map(o=>{let i=o;if(typeof i?.name!="string")throw new Error("schema attribute is invalid");let d=Array.isArray(i.values)?i.values.filter(m=>typeof m=="string"):[];return{name:i.name,values:d.map(m=>m.replace(/[|"]/g,"")),...i.open===!0?{open:!0}:{}}}),...typeof r.maxLength=="number"?{maxLength:r.maxLength}:{},...typeof r.target=="string"?{target:r.target}:{},...r.repeat===!0?{repeat:!0}:{},children:l.map(o=>jr(o,a+1))}}function Hs(e){return[...new Set(e.root.children.map(a=>a.target??"description"))]}function Kr(e,a){e.maxLength&&a.push(`Text for ${e.key} must not exceed ${e.maxLength} characters.`);for(let r of e.children)Kr(r,a);return a}function Jr(e){let a={};for(let s of e.attributes)a[s.name]=s.values.length?`${s.values.join(" | ")}${s.open?" | \u2026":""}`:"";let r;if(e.children.length===0)e.attributes.length===0?r=e.hint??"":r={...a,text:e.hint??""};else{for(let s of e.children)a[s.key]=Jr(s);r=a}return e.repeat?[r]:r}function Mt(e,a){if(a===0){let l=e.children.map(o=>Mt(o,1)).join(`
`);return`# {{character name}}
${e.hint?`<!-- ${e.hint} -->
`:""}
${l}`.trimEnd()}let r=[`${"#".repeat(Math.min(a+1,6))} ${Us(e.key)}${e.repeat?" (one block per entry)":""}`];e.hint&&r.push(`<!-- ${e.hint} -->`);for(let l of e.attributes)r.push(`- **${l.name}:** ${l.values.length?l.values.join(" | ")+(l.open?" | \u2026":""):"\u2026"}`);e.children.length===0&&r.push("\u2026");let s=e.children.map(l=>Mt(l,a+1));return[r.join(`
`),...s].join(`

`)}function Yr(e,a){let r=Kr(e.root,[]),s;a==="json-data"||a==="json"?s=JSON.stringify(Jr(e.root),null,2):a==="markdown"?s=Mt(e.root,0):s=Nt(e.root,0,!1).trimEnd();let l=["Attribute values list the allowed vocabulary; pick one unless stated otherwise. An empty value or a trailing \u2026 means freeform.",...a==="xml"?[`Replace the <${e.root.key}> root tag with the character's name in kebab-case.`]:[],...r];return`${s}

${l.join(`
`)}`}function Zr(e){let a=e.hint?{description:e.hint}:{},r;if(e.children.length===0&&e.attributes.length===0)r={type:"string",...a,...e.maxLength?{maxLength:e.maxLength}:{}};else{let s={};for(let l of e.attributes)s[l.name]=l.values.length&&!l.open?{type:"string",enum:l.values}:{type:"string",...l.values.length?{description:`e.g. ${l.values.join(", ")}`}:{}};e.children.length===0&&(s.text={type:"string",...e.maxLength?{maxLength:e.maxLength}:{}});for(let l of e.children)s[l.key]=Zr(l);r={type:"object",...a,properties:s,required:Object.keys(s),additionalProperties:!1}}return e.repeat?{type:"array",items:r}:r}function Qr(e,a){let r=Hs(e),s=a==="document"?{type:"object",properties:Object.fromEntries(r.map(l=>[l,{type:"string"}])),required:r,additionalProperties:!1}:Zr({...e.root,repeat:!1});return{type:"object",properties:{results:{type:"array",items:{type:"object",properties:{sourceId:{type:"string"},characters:{type:"array",items:{type:"object",properties:{name:{type:"string"},fields:s},required:["name","fields"],additionalProperties:!1}},splitReason:{type:["string","null"]}},required:["sourceId","characters","splitReason"],additionalProperties:!1}}},required:["results"],additionalProperties:!1}}function Us(e){let a=e.replace(/[-_.]+/g," ").trim();return a?a[0].toUpperCase()+a.slice(1):e}var zs=["markdown","xml","json","schema"];function Dt(e,a){return a.reduce((r,s)=>r.children[s],e)}function Ma(e,a,r){if(a.length===0)return r(e)??e;let[s,...l]=a,o=e.children.flatMap((i,d)=>{if(d!==s)return[i];if(l.length>0)return[Ma(i,l,r)];let m=r(i);return m?[m]:[]});return{...e,children:o}}function _s(e){return e.attributes.map(a=>`${a.name}=${[...a.values,...a.open?["etc."]:[]].join(" | ")}`).join(`
`)}function Vs(e){return e.split(`
`).map(a=>a.trim()).filter(Boolean).map(a=>{let[r="",s=""]=a.split("="),l=s.split("|").map(i=>i.trim().replace(/"/g,"")).filter(Boolean),o=l.length>0&&/^etc\.?$/i.test(l[l.length-1]);return{name:r.trim(),values:o?l.slice(0,-1):l,...o?{open:!0}:{}}})}function Gs(){return`user-${globalThis.crypto.randomUUID().slice(0,8)}`}function eo({localization:e,initialSchemaId:a,onClose:r,onSchemasChanged:s}){let l=(h,E)=>ae(e,h,E),[o,i]=f(null),[d,m]=f(!1),[g,u]=f(a??"simple"),[p,I]=f(""),[v,y]=f(null),[T,D]=f(""),[J,G]=f([]),[R,k]=f("builder"),[P,B]=f([]),[b,A]=f("xml"),[W,$]=f(!1),[F,Y]=f(!1),[se,Z]=f(null),[w,re]=f(!1),j=h=>{u(h.id),I(h.name),y(h.root),D(Ta(h.root)),G([]),B(h.root.children.length>0?[0]:[]),$(!1),re(!1),Z(null)};z(()=>{let h=new AbortController;return ma(h.signal).then(E=>{i(E);let q=E.find(M=>M.id===a)??E[0];q&&j(q)}).catch(()=>m(!0)),()=>h.abort()},[]);let O=o?.find(h=>h.id===g)??null,N=O?.builtIn===!0,Q=J.length===0,fe=v?{id:g,name:p||g,root:v}:null,Ae=fe?b==="schema"?JSON.stringify(Qr(fe,"structured"),null,2):Yr(fe,b):"",ge=h=>{y(h),D(Ta(h)),$(!0)},xe=h=>{v&&ge(Ma(v,P,h))},we=h=>{D(h),$(!0);let E=Za(h);E.ok?(y(E.root),G([])):G(E.errors)},Le=h=>{if(!v)return;let E=Dt(v,h),q="new-element";for(let M=2;E.children.some(te=>te.key===q);M++)q=`new-element-${M}`;ge(Ma(v,h,M=>({...M,children:[...M.children,{key:q,attributes:[],children:[]}]}))),B([...h,E.children.length])},me=(h,E)=>{if(!v||h.length===0)return;let q=h.slice(0,-1),M=h[h.length-1],te=M+E,ue=Dt(v,q);te<0||te>=ue.children.length||(ge(Ma(v,q,Ie=>{let Ce=[...Ie.children];return[Ce[M],Ce[te]]=[Ce[te],Ce[M]],{...Ie,children:Ce}})),B([...q,te]))},Re=h=>{!v||h.length===0||(ge(Ma(v,h,()=>null)),B(h.slice(0,-1)))},be=async h=>{if(!(!v||!Q||F)){Y(!0),Z(null);try{let E=h||N?Gs():g,q=(h||N?l("cardEditor.schemas.copyName",{name:p}):p).trim()||E,M=await gr({id:E,name:q.slice(0,120),text:Ta(v)}),te=await ma();i(te),j(te.find(ue=>ue.id===M.id)??M),s(te,M.id)}catch(E){Z(E instanceof Error?E.message:String(E))}finally{Y(!1)}}},L=async()=>{if(!(!O||N||F)){Y(!0);try{await xr(O.id);let h=await ma();i(h),h[0]&&j(h[0]),s(h,h[0]?.id??"simple")}catch(h){Z(h instanceof Error?h.message:String(h))}finally{Y(!1)}}},C=v?Dt(v,P):null,S=P.length===1,U=(h,E,q)=>{let M=E.join(".")===P.join("."),te=h.target??(q===1?"description":null);return n("li",{className:"ce-schema-node",style:{"--ce-depth":Math.min(q,4)},children:[n("button",{type:"button",className:`ce-schema-node-head${M?" ce-schema-node-head--selected":""}`,"aria-pressed":M,onClick:()=>B(E),children:[t("code",{className:"ce-schema-key",children:`<${h.key}>`}),h.children.length>0?t("span",{className:"ce-chip",children:l("cardEditor.schemas.kindGroup")}):h.attributes.some(ue=>ue.values.length>0)?t("span",{className:"ce-chip",children:l("cardEditor.schemas.kindVocab")}):null,h.repeat?t("span",{className:"ce-chip",children:l("cardEditor.schemas.kindRepeat")}):null,h.maxLength?t("span",{className:"ce-chip",children:l("cardEditor.schemas.maxChip",{max:h.maxLength})}):null,te?t("span",{className:"ce-chip ce-chip--ok",children:l("cardEditor.schemas.targetChip",{field:te})}):null,h.hint?t("span",{className:"ce-schema-hint",children:h.hint}):null]}),h.children.length>0?t("ul",{className:"ce-schema-tree",children:h.children.map((ue,Ie)=>U(ue,[...E,Ie],q+1))}):null]},E.join(".")||"root")};return n(ke,{className:"ce-studio",label:l("cardEditor.schemas.title"),busy:F,closeOnEscape:!0,onClose:r,children:[n("div",{className:"ce-dialog-head",children:[t("strong",{children:l("cardEditor.schemas.title")}),t("button",{type:"button",className:"ce-dialog-close",onClick:r,disabled:F,"aria-label":l("cardEditor.schemas.close"),children:t(ce,{className:"ce-icon","aria-hidden":"true"})})]}),d?t("div",{className:"ce-status ce-status--error",role:"alert",children:l("cardEditor.schemas.loadError")}):null,n("div",{className:"ce-studio-body",children:[t("nav",{className:"ce-studio-list","aria-label":l("cardEditor.schemas.listLabel"),children:(o??[]).map(h=>n("button",{type:"button",className:"ce-studio-list-item","aria-pressed":h.id===g,onClick:()=>j(h),children:[t("strong",{children:h.name}),t("small",{children:h.builtIn?l("cardEditor.schemas.builtIn"):l("cardEditor.schemas.yours")})]},h.id))}),n("div",{className:"ce-studio-edit",children:[n("div",{className:"ce-studio-bar",children:[n("div",{className:"ce-segmented",role:"radiogroup","aria-label":l("cardEditor.schemas.modeLabel"),children:[t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":R==="builder",disabled:!Q,onClick:()=>k("builder"),children:l("cardEditor.schemas.modeBuilder")}),t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":R==="text",onClick:()=>k("text"),children:l("cardEditor.schemas.modeText")})]}),t("span",{className:`ce-caption${Q?"":" ce-item-failure"}`,role:"status",children:Q?l("cardEditor.schemas.valid"):l("cardEditor.schemas.invalid",{line:J[0].line,message:J[0].message})})]}),R==="text"?t("textarea",{className:"mari-chrome-field ce-field ce-studio-text",value:T,spellCheck:!1,"aria-label":l("cardEditor.schemas.textLabel"),onChange:h=>we(h.target.value)}):v?n(Ne,{children:[t("div",{className:"ce-studio-tree",children:t("ul",{className:"ce-schema-tree",children:U(v,[],0)})}),C?n("div",{className:"ce-studio-inspector",children:[n("label",{className:"ce-label",htmlFor:"ce-node-key",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeKey")}),t("input",{id:"ce-node-key",className:"mari-chrome-field ce-field",value:C.key,onChange:h=>xe(E=>({...E,key:h.target.value.replace(/[^\w.-]/g,"-")||"element"}))})]}),n("label",{className:"ce-label",htmlFor:"ce-node-target",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeTarget")}),n("select",{id:"ce-node-target",className:"mari-chrome-field ce-field",value:C.target??"",disabled:!S,onChange:h=>xe(E=>{let{target:q,...M}=E;return h.target.value?{...M,target:h.target.value}:M}),children:[t("option",{value:"",children:l(S?"cardEditor.schemas.targetDefault":"cardEditor.schemas.targetInherit")}),Bt.filter(h=>h!=="description").map(h=>t("option",{value:h,children:h},h))]})]}),n("label",{className:"ce-label ce-studio-wide",htmlFor:"ce-node-hint",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeHint")}),t("input",{id:"ce-node-hint",className:"mari-chrome-field ce-field",value:C.hint??"",placeholder:l("cardEditor.schemas.nodeHintPlaceholder"),onChange:h=>xe(E=>{let{hint:q,...M}=E,te=h.target.value.replace(/--/g,"\u2013");return te?{...M,hint:te}:M})})]}),n("label",{className:"ce-label ce-studio-wide",htmlFor:"ce-node-attributes",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeAttributes")}),t("textarea",{id:"ce-node-attributes",className:"mari-chrome-field ce-field ce-textarea",rows:2,spellCheck:!1,defaultValue:_s(C),onBlur:h=>xe(E=>({...E,attributes:Vs(h.target.value)}))},`${P.join(".")}:${g}`),t("small",{children:l("cardEditor.schemas.nodeAttributesHint")})]}),n("label",{className:"ce-label",htmlFor:"ce-node-max",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeMax")}),t("input",{id:"ce-node-max",type:"number",min:0,className:"mari-chrome-field ce-field ce-number-input",value:C.maxLength??"",disabled:C.children.length>0,placeholder:l("cardEditor.schemas.nodeMaxNone"),onChange:h=>xe(E=>{let{maxLength:q,...M}=E,te=Math.trunc(Number(h.target.value));return te>0?{...M,maxLength:te}:M})})]}),n("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:C.repeat===!0,disabled:P.length===0,onChange:h=>xe(E=>{let{repeat:q,...M}=E;return h.target.checked?{...M,repeat:!0}:M})}),t("span",{className:"ce-choice-copy",children:t("strong",{children:l("cardEditor.schemas.nodeRepeat")})})]}),n("div",{className:"ce-studio-node-actions ce-studio-wide",children:[n("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>Le(P),children:[t(Ze,{className:"ce-icon","aria-hidden":"true"}),l("cardEditor.schemas.addChild")]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:P.length===0,"aria-label":l("cardEditor.schemas.moveUp"),onClick:()=>me(P,-1),children:t(Ye,{className:"ce-icon","aria-hidden":"true"})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:P.length===0,"aria-label":l("cardEditor.schemas.moveDown"),onClick:()=>me(P,1),children:t(Je,{className:"ce-icon","aria-hidden":"true"})}),n("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:P.length===0,onClick:()=>Re(P),children:[t(Ea,{className:"ce-icon","aria-hidden":"true"}),l("cardEditor.schemas.removeNode")]})]})]}):null]}):null]}),n("div",{className:"ce-studio-preview",children:[t("div",{className:"ce-studio-bar",children:t("div",{className:"ce-segmented",role:"radiogroup","aria-label":l("cardEditor.schemas.previewLabel"),children:zs.map(h=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":b===h,onClick:()=>A(h),children:l(`cardEditor.schemas.preview.${h}`)},h))})}),t("pre",{className:"ce-studio-pre",tabIndex:0,"aria-label":l("cardEditor.schemas.previewLabel"),children:Ae}),t("p",{className:"ce-caption",children:l(`cardEditor.schemas.previewHint.${b}`)})]})]}),n("div",{className:"ce-dialog-foot",children:[se?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:se}):null,n("label",{className:"ce-label ce-studio-name",htmlFor:"ce-schema-name",children:[t("span",{className:"ce-sr-only",children:l("cardEditor.schemas.name")}),t("input",{id:"ce-schema-name",className:"mari-chrome-field ce-field",value:p,disabled:N,placeholder:l("cardEditor.schemas.name"),onChange:h=>{I(h.target.value),$(!0)}})]}),!N&&O?w?n("span",{className:"ce-confirm-strip",role:"group","aria-label":l("cardEditor.schemas.delete"),children:[t("span",{className:"ce-caption",children:l("cardEditor.schemas.deleteConfirm",{name:O.name})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:F,onClick:()=>{L()},children:l("cardEditor.schemas.deleteYes")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>re(!1),children:l("cardEditor.schemas.deleteNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:F,onClick:()=>re(!0),children:l("cardEditor.schemas.delete")}):null,t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:F||!Q||!v,onClick:()=>{be(!0)},children:l("cardEditor.schemas.duplicate")}),N?null:t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:F||!Q||!v||!W,onClick:()=>{be(!1)},children:l("cardEditor.schemas.save")})]})]})}var Ws=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions","backstory","appearance"],ie=class extends Error{constructor(a){super(a),this.name="SchemaError"}};var Fd=new Set(Ws);function et(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null}function ra(e,a,r,s){if(e===void 0)return a;if(typeof e=="string"&&r.includes(e))return e;throw new ie(`${s} is invalid`)}function ro(e,a,r){if(e===void 0)return a;if(typeof e=="string")return e;throw new ie(`${r} must be a string`)}function Ba(e,a,r){if(e===void 0)return;if(typeof e!="string")throw new ie(`${a} must be a string`);if(e.length>300)throw new ie(`${a} must be at most 300 characters`);let s=r?e:e.trim();if(!s.trim())throw new ie(`${a} must not be blank`);return s}function ao(e,a){if(e==null)return null;if(typeof e=="string")return e;throw new ie(`${a} must be a string or null`)}function Qa(e,a,r,s,l){if(e===void 0)return a;if(typeof e!="number"||!Number.isFinite(e))throw new ie(`${l} must be a finite number`);return Math.max(r,Math.min(s,Math.trunc(e)))}var $s=["markdown","xml","json"];function to(e,a){let r=et(e);if(!r)throw new ie(`${a} must be an object`);let s;try{s=Xr(r.schema)}catch(l){throw new ie(`${a}.schema: ${l instanceof Error?l.message:String(l)}`)}return{schema:s,format:ra(r.format,"xml",$s,`${a}.format`)}}function Xs(e){let a=et(e);if(!a)throw new ie("transform settings are required for the transform task");let r=to(a,"transform"),s;if(a.phase2!==void 0){let l=et(a.phase2);if(!l)throw new ie("transform.phase2 must be an object");if(l.enabled!==void 0&&typeof l.enabled!="boolean")throw new ie("transform.phase2.enabled must be a boolean");if(l.allowSplits!==void 0&&typeof l.allowSplits!="boolean")throw new ie("transform.phase2.allowSplits must be a boolean");s={enabled:l.enabled===!0,instruction:ro(l.instruction,"","transform.phase2.instruction"),allowSplits:l.allowSplits===!0,...l.override===void 0||l.override===null?{}:{override:to(l.override,"transform.phase2.override")}}}if(a.structuredOutput!==void 0&&typeof a.structuredOutput!="boolean")throw new ie("transform.structuredOutput must be a boolean");return{...r,outputMode:ra(a.outputMode,"structured",["structured","document"],"transform.outputMode"),multiCharacter:ra(a.multiCharacter,"split",["split","merge"],"transform.multiCharacter"),structuredOutput:a.structuredOutput!==!1,...s===void 0?{}:{phase2:s}}}function at(e){let a=et(e);if(!a)throw new ie("session config must be an object");if(a.globalLorebookIds!==void 0&&!Array.isArray(a.globalLorebookIds))throw new ie("globalLorebookIds must be an array of strings");let r=a.globalLorebookIds??[];if(!r.every(p=>typeof p=="string"))throw new ie("globalLorebookIds must be an array of strings");if(a.rebalance!==void 0&&typeof a.rebalance!="boolean")throw new ie("rebalance must be a boolean");if(a.customTemplate!==void 0&&typeof a.customTemplate!="string")throw new ie("customTemplate must be a string");let s=Ba(a.duplicatePrefix,"duplicatePrefix",!0),l=Ba(a.duplicateSuffix,"duplicateSuffix",!0),o=Ba(a.duplicateRemovePrefix,"duplicateRemovePrefix",!0),i=Ba(a.duplicateRemoveSuffix,"duplicateRemoveSuffix",!0),d=Ba(a.combinedCardName,"combinedCardName",!1),m=ra(a.saveMode,"confirm",["confirm","auto","duplicate","combined"],"saveMode");if(m==="combined"&&d===void 0)throw new ie("combinedCardName is required when saveMode is combined");let g=ra(a.presetId,"standard",["standard","strict","rebalance","xml-simple","xml-complex","custom","transform"],"presetId"),u=g==="transform"?Xs(a.transform):void 0;return{mode:ra(a.mode,"individual",["individual","batched"],"mode"),batchSize:Qa(a.batchSize,4,1,16,"batchSize"),connectionId:ao(a.connectionId,"connectionId"),presetId:g,...a.customTemplate===void 0?{}:{customTemplate:a.customTemplate},...u===void 0?{}:{transform:u},globalInstruction:ro(a.globalInstruction,"","globalInstruction"),behaviorCharacterId:ao(a.behaviorCharacterId,"behaviorCharacterId"),globalLorebookIds:[...r],rebalance:a.rebalance??!1,providerRetries:Qa(a.providerRetries,2,0,5,"providerRetries"),refusalRetries:Qa(a.refusalRetries,3,0,5,"refusalRetries"),concurrency:Qa(a.concurrency,1,1,16,"concurrency"),saveMode:m,completionMode:ra(a.completionMode,"ask",["ask","apply","duplicate"],"completionMode"),...s===void 0?{}:{duplicatePrefix:s},...l===void 0?{}:{duplicateSuffix:l},...o===void 0?{}:{duplicateRemovePrefix:o},...i===void 0?{}:{duplicateRemoveSuffix:i},...d===void 0?{}:{combinedCardName:d}}}var oo="cardEditor.bulkConfig";function so(e){if(!e)return null;let a=null;try{a=e.getItem(oo)}catch{return null}if(!a)return null;try{return at(JSON.parse(a))}catch{return null}}function lo(e,a){if(a)try{a.setItem(oo,JSON.stringify(e))}catch{}}var Ft="cardEditor.bulkDraft",Ot="cardEditor.bulkPresets";function Ve(e){return e&&typeof e=="object"&&!Array.isArray(e)?e:null}function io(e,a){let r=Ve(e);return r?.kind==="inherit"||r?.kind==="none"?{kind:r.kind}:r?.kind==="character"&&typeof r.id=="string"&&typeof r.name=="string"?{kind:"character",id:r.id,name:r.name,avatarPath:typeof r.avatarPath=="string"?r.avatarPath:null}:a}function no(e,a){let r=Ve(a);if(!r)return e;let s={...e};for(let[l,o]of Object.entries(e)){let i=r[l];i!==void 0&&(Array.isArray(o)?Array.isArray(i)&&i.every(d=>typeof d=="string")&&(s[l]=i):o===null?(i===null||typeof i=="string")&&(s[l]=i):typeof i==typeof o&&(typeof o!="object"||Ve(i))&&(s[l]=typeof o=="object"?no(o,i):i))}return s}function uo(e,a){return{...no(a,e),behavior:io(Ve(e)?.behavior,a.behavior)}}function co(e,a){try{let r=e?.getItem(a);return r?JSON.parse(r):null}catch{return null}}function qt(e,a,r){try{e?.setItem(a,JSON.stringify(r))}catch{}}function fo(e,a){let r=Ve(co(e,Ft));if(!r)return null;let s={};for(let[l,o]of Object.entries(Ve(r.targets)??{})){let i=Ve(o);i&&(s[l]={note:typeof i.note=="string"?i.note:"",style:io(i.style,{kind:"inherit"})})}return{form:uo(r.form,a),targets:s}}function mo(e,a){qt(a,Ft,e)}function Ht(e){try{e?.removeItem(Ft)}catch{}}function po(e,a){let r=co(e,Ot);return Array.isArray(r)?r.flatMap(s=>{let l=Ve(s);return typeof l?.name=="string"&&l.name.trim()?[{name:l.name,form:uo(l.form,a)}]:[]}):[]}function ho(e,a,r){let s=[...e.filter(l=>l.name!==a.name),a].sort((l,o)=>l.name.localeCompare(o.name));return qt(r,Ot,s),s}function go(e,a,r){let s=e.filter(l=>l.name!==a);return qt(r,Ot,s),s}function xo(e,a){let r=Number.isFinite(e)?Math.max(0,Math.trunc(e)):0,s=Number.isFinite(a)?Math.max(1,Math.min(16,Math.trunc(a))):4;return{batched:r===0?0:Math.ceil(r/s),individual:r}}var js={schemaId:"simple",format:"xml",outputMode:"structured",multiCharacter:"split",phase2Enabled:!1,phase2Instruction:"",phase2AllowSplits:!1,phase2SchemaId:null,phase2Format:null},Lo=["markdown","xml","json"];function bo(e){return e?{schemaId:e.schema.id,format:e.format,outputMode:e.outputMode,multiCharacter:e.multiCharacter,phase2Enabled:e.phase2?.enabled===!0,phase2Instruction:e.phase2?.instruction??"",phase2AllowSplits:e.phase2?.allowSplits===!0,phase2SchemaId:e.phase2?.override?.schema.id??null,phase2Format:e.phase2?.override?.format??null}:{...js}}function Io(e,a,r){let s=a.find(i=>i.id===e.schemaId)??a[0];if(!s)return null;let l=e.phase2SchemaId?a.find(i=>i.id===e.phase2SchemaId):void 0,o=e.phase2SchemaId||e.phase2Format?{schema:l??s,format:e.phase2Format??e.format}:void 0;return{schema:s,format:e.format,outputMode:e.outputMode,multiCharacter:e.multiCharacter,structuredOutput:r,...e.phase2Enabled?{phase2:{enabled:!0,instruction:e.phase2Instruction,allowSplits:e.phase2AllowSplits,...o?{override:o}:{}}}:{}}}function Co({localization:e,draft:a,schemas:r,schemasError:s,agentStructuredOutput:l,onChange:o,onEditSchemas:i}){let d=(u,p)=>ae(e,u,p),m=(r??[]).map(u=>t("option",{value:u.id,children:u.builtIn?d("cardEditor.transform.schemaBuiltIn",{name:u.name}):u.name},u.id)),g=u=>d(`cardEditor.transform.format.${u}`);return n("fieldset",{className:"ce-section","data-ce-section":"transform",children:[t("legend",{className:"ce-section-heading",children:d("cardEditor.transform.title")}),n("div",{className:"ce-transform-row",children:[n("label",{className:"ce-label",htmlFor:"ce-transform-schema",children:[t("span",{className:"ce-label-title",children:d("cardEditor.transform.schema")}),n("span",{className:"ce-inline-controls",children:[t("select",{id:"ce-transform-schema",className:"mari-chrome-field ce-field",value:a.schemaId,disabled:!r,onChange:u=>o({schemaId:u.target.value}),children:m}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:i,children:d("cardEditor.transform.editSchemas")})]})]}),n("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:d("cardEditor.transform.formatLabel")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":d("cardEditor.transform.formatLabel"),children:Lo.map(u=>t("button",{type:"button",role:"radio","aria-checked":a.format===u,className:"ce-segment",onClick:()=>o({format:u}),children:g(u)},u))})]})]}),s?t("div",{className:"ce-status ce-status--error",role:"alert",children:d("cardEditor.transform.schemasError")}):null,n("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:d("cardEditor.transform.multiTitle")}),n("div",{className:"ce-choice-list",children:[t(Ee,{name:"ce-multi",value:"merge",checked:a.multiCharacter==="merge",onChange:()=>o({multiCharacter:"merge"}),title:d("cardEditor.transform.multiMerge")}),t(Ee,{name:"ce-multi",value:"split",checked:a.multiCharacter==="split",onChange:()=>o({multiCharacter:"split"}),title:d("cardEditor.transform.multiSplit")})]}),t("small",{children:a.multiCharacter==="split"?d("cardEditor.transform.multiSplitHint"):d("cardEditor.transform.multiMergeHint")})]}),n("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:d("cardEditor.transform.outputModeTitle")}),n("div",{className:"ce-choice-list",children:[t(Ee,{name:"ce-output-mode",value:"structured",checked:a.outputMode==="structured",onChange:()=>o({outputMode:"structured"}),title:d("cardEditor.transform.outputStructured")}),t(Ee,{name:"ce-output-mode",value:"document",checked:a.outputMode==="document",onChange:()=>o({outputMode:"document"}),title:d("cardEditor.transform.outputDocument")})]}),t("small",{children:a.outputMode==="structured"?d("cardEditor.transform.outputStructuredHint",{format:g(a.format)}):d("cardEditor.transform.outputDocumentHint")})]}),t("p",{className:"ce-caption",role:"status",children:d(l===null?"cardEditor.transform.providerJsonUnknown":l?"cardEditor.transform.providerJsonOn":"cardEditor.transform.providerJsonOff")}),n("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:a.phase2Enabled,onChange:u=>o({phase2Enabled:u.target.checked})}),n("span",{className:"ce-choice-copy",children:[t("strong",{children:d("cardEditor.transform.phase2")}),t("small",{children:d("cardEditor.transform.phase2Hint")})]})]}),a.phase2Enabled?n("div",{className:"ce-phase2-box",children:[n("label",{className:"ce-label",htmlFor:"ce-phase2-instruction",children:[t("span",{className:"ce-label-title",children:d("cardEditor.transform.phase2Instruction")}),t("textarea",{id:"ce-phase2-instruction",className:"mari-chrome-field ce-field ce-textarea",value:a.phase2Instruction,placeholder:d("cardEditor.transform.phase2InstructionPlaceholder"),onChange:u=>o({phase2Instruction:u.target.value})})]}),n("div",{className:"ce-transform-row",children:[n("label",{className:"ce-label",htmlFor:"ce-phase2-schema",children:[t("span",{className:"ce-label-title",children:d("cardEditor.transform.phase2Schema")}),n("select",{id:"ce-phase2-schema",className:"mari-chrome-field ce-field",value:a.phase2SchemaId??"",onChange:u=>o({phase2SchemaId:u.target.value||null}),children:[t("option",{value:"",children:d("cardEditor.transform.sameAsPhase1")}),m]})]}),n("label",{className:"ce-label",htmlFor:"ce-phase2-format",children:[t("span",{className:"ce-label-title",children:d("cardEditor.transform.formatLabel")}),n("select",{id:"ce-phase2-format",className:"mari-chrome-field ce-field",value:a.phase2Format??"",onChange:u=>o({phase2Format:u.target.value||null}),children:[t("option",{value:"",children:d("cardEditor.transform.sameAsPhase1")}),Lo.map(u=>t("option",{value:u,children:g(u)},u))]})]})]}),n("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:a.phase2AllowSplits,disabled:a.multiCharacter!=="split",onChange:u=>o({phase2AllowSplits:u.target.checked})}),t("span",{className:"ce-choice-copy",children:t("strong",{children:d("cardEditor.transform.phase2AllowSplits")})})]})]}):null]})}var Ks={standard:"cardEditor.dialog.model.presetStandard",strict:"cardEditor.dialog.model.presetStrict",rebalance:"cardEditor.dialog.model.presetRebalance","xml-simple":"cardEditor.dialog.model.presetXmlSimple","xml-complex":"cardEditor.dialog.model.presetXmlComplex",custom:"cardEditor.dialog.model.presetCustom",transform:"cardEditor.dialog.model.presetTransform"};function So({localization:e,characterIds:a,prefill:r,onClose:s,onDispatched:l}){let o=(c,V)=>ae(e,c,V),[i,d]=f([]),[m,g]=f(!0),[u,p]=f(null),[I,v]=f(!1),[y,T]=f(null),[D,J]=f(!1),[G,R]=f(""),[k]=f(()=>so(De())),[P]=f(()=>({mode:k?.mode??"individual",batchSize:k?.batchSize??4,connectionId:k?.connectionId??null,presetId:r?.presetId??k?.presetId??"standard",customTemplate:k?.customTemplate??"",globalInstruction:r?.globalInstruction??k?.globalInstruction??"",behavior:{kind:"none"},globalLorebookIds:k?.globalLorebookIds??[],rebalance:k?.rebalance??!1,providerRetries:k?.providerRetries??2,refusalRetries:k?.refusalRetries??3,concurrency:k?.concurrency??1,completionMode:k?.completionMode??"ask",saveMode:r?.saveMode??k?.saveMode??"confirm",duplicatePrefix:r?.duplicatePrefix??k?.duplicatePrefix??"",duplicateSuffix:k?.duplicateSuffix??" (Edited)",duplicateRemovePrefix:k?.duplicateRemovePrefix??"",duplicateRemoveSuffix:k?.duplicateRemoveSuffix??"",combinedCardName:r?.combinedCardName??(r?.label?`${r.label} \u2014 Cast`:k?.combinedCardName??""),transformDraft:{...bo(k?.transform),...r?.schemaId?{schemaId:r.schemaId}:{},...r?.format?{format:r.format}:{}}})),[B,b]=f(()=>fo(De(),P)),[A]=f(()=>B?.form??P),[W,$]=f(A.mode),[F,Y]=f(A.batchSize),[se,Z]=f(A.connectionId),[w,re]=f(A.presetId),[j,O]=f(A.customTemplate),[N,Q]=f(A.globalInstruction),[fe,Ae]=f(A.behavior),[ge,xe]=f(A.globalLorebookIds),[we,Le]=f(A.rebalance),[me,Re]=f(A.providerRetries),[be,L]=f(A.refusalRetries),[C,S]=f(A.concurrency),[U,h]=f(A.completionMode),[E,q]=f(A.saveMode),[M,te]=f(A.duplicatePrefix),[ue,Ie]=f(A.duplicateSuffix),[Ce,Te]=f(A.duplicateRemovePrefix),[He,sa]=f(A.duplicateRemoveSuffix),[Ge,We]=f(A.combinedCardName),[Pe,$e]=f(A.transformDraft),[ba,la]=f(()=>po(De(),P)),[Se,Oa]=f(""),ye=oe(B!==null),Ia=oe(!1),[K,ia]=f(null),[Xe,ft]=f(!1),[da,Ca]=f(null),[qa,Ha]=f(!1),[x,_]=f(!1),[X,pe]=f(null),[Ue,os]=f(null),na=w==="transform";z(()=>{if(!na||K!==null)return;let c=new AbortController;return ma(c.signal).then(V=>{ia(V),$e(ee=>V.some(he=>he.id===ee.schemaId)?ee:{...ee,schemaId:V[0]?.id??"simple"})}).catch(()=>ft(!0)),Lr(c.signal).then(V=>Ca(V.structuredOutput)).catch(()=>{}),()=>c.abort()},[na,K]);let[mt]=f(()=>[...new Set(a)]);z(()=>{let c=!1,V=new AbortController;return g(!0),Promise.allSettled(mt.map(ee=>qe(ee,V.signal))).then(ee=>{c||(d(ee.map((he,Ua)=>{let ca=mt[Ua],za=B?.targets[ca]??{note:"",style:{kind:"inherit"}};return he.status==="fulfilled"?{characterId:ca,name:he.value.name,avatarPath:he.value.avatarPath,card:he.value.fields,...za,loadError:!1}:{characterId:ca,name:ca,avatarPath:null,card:null,...za,loadError:!0}})),g(!1))}),()=>{c=!0,V.abort()}},[mt]),z(()=>{let c=new AbortController;return Pr(c.signal).then(V=>p(V)).catch(()=>v(!0)),()=>c.abort()},[]),z(()=>{let c=new AbortController;return Dr(c.signal).then(V=>T(V)).catch(()=>J(!0)),()=>c.abort()},[]),z(()=>{let c=k?.behaviorCharacterId;if(!c||ye.current)return;let V=!1;return Ar(c).then(ee=>{V||Ae({kind:"character",id:ee.id,name:ee.name,avatarPath:ee.avatarPath})}).catch(()=>{}),()=>{V=!0}},[k]);let ss=c=>{c==="custom"&&w!=="custom"&&(!j.trim()||Object.values(Tt).includes(j))&&_r(w)&&O(Tt[w]),re(c)},pt=(c,V)=>d(ee=>ee.map(he=>he.characterId===c?{...he,...V}:he)),ls=c=>d(V=>V.filter(ee=>ee.characterId!==c)),is=c=>{if(ye.current=!0,i.some(ee=>ee.characterId===c.id))return;let V={characterId:c.id,name:c.name,avatarPath:c.avatarPath??null,card:null,note:"",style:{kind:"inherit"},loadError:!1};d(ee=>[...ee,V]),qe(c.id).then(ee=>pt(c.id,{name:ee.name,avatarPath:ee.avatarPath,card:ee.fields})).catch(()=>pt(c.id,{loadError:!0}))},ht=(y??[]).filter(c=>!G.trim()||c.name.toLocaleLowerCase().includes(G.trim().toLocaleLowerCase())),Kt=xo(i.length,F),gt=i.some(c=>c.loadError),Jt=i.some(c=>!c.loadError&&!c.card),xt=E==="combined"&&Ge.trim().length===0,Yt=na&&(K===null||K.length===0),ds=Ja(i[0]?.name??"Character",{prefix:M,suffix:ue,removePrefix:Ce,removeSuffix:He});z(()=>{let c=!1;return $a().then(V=>{c||os(V)}).catch(()=>{}),()=>{c=!0}},[]);let Oe=Ue?.disableAutoVerdicts===!0;z(()=>{Oe&&(q(c=>c==="auto"?"confirm":c),h(c=>c==="ask"?c:"ask"))},[Oe]);let Lt=(u?.find(c=>c.id===se)??u?.find(c=>c.defaultForAgents)??u?.find(c=>c.isDefault)??null)?.maxParallelJobs,Zt=typeof Lt=="number"&&Number.isFinite(Lt)?Math.min(16,Math.max(1,Math.trunc(Lt))):4,Qt=Ue?.maxParallelAgents??null,ua=Qt===null?Zt:Math.min(Zt,Qt);z(()=>{S(c=>Math.min(c,ua))},[ua]);let er=B!==null||k?.concurrency!==void 0,ar=oe(!1);z(()=>{er||ar.current||u===null&&!I||(ar.current=!0,S(ua))},[er,u,I,ua]);let tr={mode:W,batchSize:F,connectionId:se,presetId:w,customTemplate:j,globalInstruction:N,behavior:fe,globalLorebookIds:ge,rebalance:we,providerRetries:me,refusalRetries:be,concurrency:C,completionMode:U,saveMode:E,duplicatePrefix:M,duplicateSuffix:ue,duplicateRemovePrefix:Ce,duplicateRemoveSuffix:He,combinedCardName:Ge,transformDraft:Pe},rr=JSON.stringify({form:tr,targets:Object.fromEntries(i.map(c=>[c.characterId,{note:c.note,style:c.style}]))});z(()=>{!ye.current||Ia.current||m||mo(JSON.parse(rr),De())},[rr,m]);let or=c=>{ye.current=!0,$(c.mode),Y(c.batchSize),Z(c.connectionId),re(c.presetId),O(c.customTemplate),Q(c.globalInstruction),Ae(c.behavior),xe(c.globalLorebookIds),Le(c.rebalance),Re(c.providerRetries),L(c.refusalRetries),S(Math.min(c.concurrency,ua)),h(Oe?"ask":c.completionMode),q(Oe&&c.saveMode==="auto"?"confirm":c.saveMode),te(c.duplicatePrefix),Ie(c.duplicateSuffix),Te(c.duplicateRemovePrefix),sa(c.duplicateRemoveSuffix),We(c.combinedCardName),$e(c.transformDraft)},ns=()=>{or(P),d(c=>c.map(V=>({...V,note:"",style:{kind:"inherit"}}))),ye.current=!1,Ht(De()),b(null)},us=()=>{let c=Se.trim();c&&la(V=>ho(V,{name:c,form:tr},De()))},je=ba.find(c=>c.name===Se.trim()),cs=async()=>{if(x||i.length===0||gt||Jt||xt||Yt)return;_(!0),pe(null);let c=at({...na?{transform:Io(Pe,K??[],da!==!1)}:{},mode:W,batchSize:F,connectionId:se,presetId:w,...w==="custom"?{customTemplate:j}:{},globalInstruction:N,behaviorCharacterId:fe.kind==="character"?fe.id:null,globalLorebookIds:ge,rebalance:we,providerRetries:me,refusalRetries:be,concurrency:C,saveMode:E,completionMode:U,...M.trim()?{duplicatePrefix:M}:{},...ue.trim()?{duplicateSuffix:ue}:{},...Ce.trim()?{duplicateRemovePrefix:Ce}:{},...He.trim()?{duplicateRemoveSuffix:He}:{},...E==="combined"?{combinedCardName:Ge.trim()}:{}});try{let V=[...new Set(i.flatMap(de=>de.style.kind==="character"?[de.style.id]:[]))],[ee,he,Ua]=await Promise.all([Promise.all(V.map(de=>qe(de))),fe.kind==="character"?qe(fe.id):Promise.resolve(null),Promise.all(ge.map(async de=>({name:(y??[]).find(fs=>fs.id===de)?.name??de,entries:await Rr(de)})))]),ca=new Map(ee.map((de,sr)=>[V[sr],de])),za=await mr({targets:i.map(de=>({characterId:de.characterId,characterName:de.name,card:de.card,...de.note.trim()?{note:de.note.trim()}:{},...de.style.kind==="none"?{behaviorOverride:null}:de.style.kind==="character"?{behaviorOverride:de.style.id,behaviorOverrideCard:Pt(ca.get(de.style.id))}:{}})),config:c,...r?.label?.trim()?{label:r.label.trim().slice(0,200)}:{},...Ua.length>0?{lorebooks:Ua}:{},...he?{behaviorCharacter:Pt(he)}:{}});lo(c,De()),Ia.current=!0,Ht(De()),l(za)}catch(V){pe(V instanceof Error?V.message:String(V)),_(!1)}};return n(ke,{className:"ce-setup",label:o("cardEditor.dialog.title"),busy:x,closeOnEscape:!qa,onClose:s,onChangeCapture:()=>{ye.current=!0},onClickCapture:c=>{c.target.closest("button, input, select, label")&&(ye.current=!0)},children:[t("div",{className:"ce-setup-targets",children:t(zr,{localization:e,targets:i,targetsLoading:m,onUpdateTarget:pt,onRemoveTarget:ls,onAddTarget:is})}),t("div",{className:"ce-setup-config",children:qa?t(eo,{localization:e,initialSchemaId:Pe.schemaId,onClose:()=>Ha(!1),onSchemasChanged:(c,V)=>{ia(c),$e(ee=>({...ee,schemaId:V}))}}):n(Ne,{children:[B?n("div",{className:"ce-status",role:"status",children:[t("span",{children:o("cardEditor.dialog.draft.restored")})," ",t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:ns,children:o("cardEditor.dialog.draft.discard")})]}):null,n("fieldset",{className:"ce-section","data-ce-section":"presets",children:[t("legend",{className:"ce-section-heading",children:o("cardEditor.dialog.presets.title")}),n("label",{className:"ce-label",htmlFor:"ce-settings-preset",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.presets.name")}),t("input",{id:"ce-settings-preset",type:"text",list:"ce-settings-preset-list",className:"mari-chrome-field ce-field",value:Se,placeholder:o("cardEditor.dialog.presets.namePlaceholder"),onChange:c=>Oa(c.target.value)}),t("datalist",{id:"ce-settings-preset-list",children:ba.map(c=>t("option",{value:c.name},c.name))}),t("small",{children:o("cardEditor.dialog.presets.hint")})]}),n("div",{className:"ce-preset-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!je,onClick:()=>je&&or(je.form),children:o("cardEditor.dialog.presets.load")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!Se.trim(),onClick:us,children:o(je?"cardEditor.dialog.presets.overwrite":"cardEditor.dialog.presets.save")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!je,onClick:()=>je&&la(c=>go(c,je.name,De())),children:o("cardEditor.dialog.presets.delete")})]})]}),n("fieldset",{className:"ce-section","data-ce-section":"model",children:[t("legend",{className:"ce-section-heading",children:o("cardEditor.dialog.model.title")}),n("label",{className:"ce-label",htmlFor:"ce-connection",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.model.connection")}),n("select",{id:"ce-connection",className:"mari-chrome-field ce-field",value:se??"","data-ce-autofocus":!0,onChange:c=>Z(c.target.value||null),children:[t("option",{value:"",children:o("cardEditor.dialog.model.connectionDefault")}),(u??[]).map(c=>t("option",{value:c.id,children:c.model?`${c.name} \xB7 ${c.model}`:c.name},c.id))]})]}),u===null&&!I?t("p",{className:"ce-caption",children:o("cardEditor.dialog.model.connectionsLoading")}):null,I?t("div",{className:"ce-status ce-status--error",role:"alert",children:o("cardEditor.dialog.model.connectionsError")}):null,n("label",{className:"ce-label",htmlFor:"ce-preset",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.model.preset")}),n("select",{id:"ce-preset",className:"mari-chrome-field ce-field",value:w,onChange:c=>ss(c.target.value),children:[t("option",{value:"transform",children:o("cardEditor.dialog.model.presetTransform")}),t("option",{value:"standard",children:o("cardEditor.dialog.model.presetStandard")}),t("option",{value:"strict",children:o("cardEditor.dialog.model.presetStrict")}),t("option",{value:"rebalance",children:o("cardEditor.dialog.model.presetRebalance")}),t("option",{value:"xml-simple",children:o("cardEditor.dialog.model.presetXmlSimple")}),t("option",{value:"xml-complex",children:o("cardEditor.dialog.model.presetXmlComplex")}),t("option",{value:"custom",children:o("cardEditor.dialog.model.presetCustom")})]})]}),w==="custom"?n("label",{className:"ce-label",htmlFor:"ce-custom-template",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.model.customTemplate")}),t("textarea",{id:"ce-custom-template",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:j,onChange:c=>O(c.target.value)}),t("small",{children:o("cardEditor.dialog.model.customTemplateHint")})]}):null]}),na?t(Co,{localization:e,draft:Pe,schemas:K,schemasError:Xe,agentStructuredOutput:da,onChange:c=>$e(V=>({...V,...c})),onEditSchemas:()=>Ha(!0)}):null,n("fieldset",{className:"ce-section","data-ce-section":"instructions",children:[t("legend",{className:"ce-section-heading",children:o("cardEditor.dialog.instructions.title")}),n("label",{className:"ce-label",htmlFor:"ce-global-instruction",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.instructions.global")}),t("textarea",{id:"ce-global-instruction",className:"mari-chrome-field ce-field ce-textarea",value:N,placeholder:o("cardEditor.dialog.instructions.globalPlaceholder"),onChange:c=>Q(c.target.value)})]}),n("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.instructions.behavior")}),t(Ra,{localization:e,selection:fe,onChange:Ae,buttonLabel:o("cardEditor.dialog.instructions.behavior"),noneLabel:o("cardEditor.dialog.instructions.behaviorNone")}),t("small",{children:o("cardEditor.dialog.instructions.behaviorHint")})]}),n("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.instructions.lorebooks")}),t("input",{type:"search",className:"mari-chrome-field ce-field",value:G,placeholder:o("cardEditor.dialog.instructions.lorebooksFilter"),"aria-label":o("cardEditor.dialog.instructions.lorebooksFilter"),onChange:c=>R(c.target.value)}),y===null&&!D?t("p",{className:"ce-caption",children:o("cardEditor.dialog.instructions.lorebooksLoading")}):null,D?t("div",{className:"ce-status ce-status--error",role:"alert",children:o("cardEditor.dialog.instructions.lorebooksError")}):null,y!==null&&y.length===0?t("p",{className:"ce-caption",children:o("cardEditor.dialog.instructions.lorebooksEmpty")}):null,y!==null&&y.length>0&&ht.length===0?t("p",{className:"ce-caption",children:o("cardEditor.dialog.instructions.lorebooksNoneMatch")}):null,ht.length>0?t("div",{className:"ce-lorebook-list",children:ht.map(c=>n("label",{className:"ce-lorebook",children:[t("input",{type:"checkbox",checked:ge.includes(c.id),onChange:V=>xe(ee=>V.target.checked?[...new Set([...ee,c.id])]:ee.filter(he=>he!==c.id))}),t("span",{className:"ce-lorebook-name",children:c.name})]},c.id))}):null,t("small",{children:o("cardEditor.dialog.instructions.lorebooksHint")})]})]}),n("fieldset",{className:"ce-section","data-ce-section":"processing",children:[t("legend",{className:"ce-section-heading",children:o("cardEditor.dialog.processing.title")}),n("div",{className:"ce-choice-list",children:[t(Ee,{name:"ce-mode",value:"individual",checked:W==="individual",onChange:()=>$("individual"),title:o("cardEditor.dialog.processing.modeIndividual")}),t(Ee,{name:"ce-mode",value:"batched",checked:W==="batched",onChange:()=>$("batched"),title:o("cardEditor.dialog.processing.modeBatched")})]}),n("div",{className:"ce-number-grid",children:[t(ta,{id:"ce-batch-size",label:o("cardEditor.dialog.processing.batchSize"),value:F,min:1,max:16,onChange:Y}),t(ta,{id:"ce-provider-retries",label:o("cardEditor.dialog.processing.providerRetries"),value:me,min:0,max:5,onChange:Re}),t(ta,{id:"ce-refusal-retries",label:o("cardEditor.dialog.processing.refusalRetries"),value:be,min:0,max:5,onChange:L}),t(ta,{id:"ce-concurrency",label:o("cardEditor.dialog.processing.concurrency"),value:C,min:1,max:ua,onChange:S})]}),na?null:n("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:we,onChange:c=>Le(c.target.checked)}),n("span",{className:"ce-choice-copy",children:[t("strong",{children:o("cardEditor.dialog.processing.rebalance")}),t("small",{children:o("cardEditor.dialog.processing.rebalanceHint")})]})]}),n("label",{className:"ce-label",htmlFor:"ce-completion-mode",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.processing.completionMode")}),n("select",{id:"ce-completion-mode",className:"mari-chrome-field ce-field",value:U,onChange:c=>h(c.target.value),children:[t("option",{value:"ask",children:o("cardEditor.dialog.processing.completionAsk")}),t("option",{value:"apply",disabled:Oe,children:o("cardEditor.dialog.processing.completionApply")}),t("option",{value:"duplicate",disabled:Oe,children:o("cardEditor.dialog.processing.completionDuplicate")})]}),Oe?t("small",{children:o("cardEditor.dialog.processing.autoDisabledNote")}):t("small",{children:o("cardEditor.dialog.processing.completionCaption")})]}),t("p",{className:"ce-caption",children:o("cardEditor.dialog.processing.overflowCaption")})]}),n("fieldset",{className:"ce-section","data-ce-section":"saving",children:[t("legend",{className:"ce-section-heading",children:o("cardEditor.dialog.saving.title")}),n("div",{className:"ce-choice-list",children:[t(Ee,{name:"ce-save-mode",value:"confirm",checked:E==="confirm",onChange:c=>q(c),title:o("cardEditor.dialog.saving.confirm")}),t(Ee,{name:"ce-save-mode",value:"auto",checked:E==="auto",onChange:c=>q(c),title:o("cardEditor.dialog.saving.auto"),disabled:Oe}),t(Ee,{name:"ce-save-mode",value:"duplicate",checked:E==="duplicate",onChange:c=>q(c),title:o("cardEditor.dialog.saving.duplicate")}),E==="duplicate"?n(Ne,{children:[n("label",{className:"ce-label",htmlFor:"ce-duplicate-prefix",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.saving.duplicatePrefix")}),t("input",{id:"ce-duplicate-prefix",type:"text",className:"mari-chrome-field ce-field",value:M,placeholder:o("cardEditor.dialog.saving.duplicatePrefixPlaceholder"),"aria-label":o("cardEditor.dialog.saving.duplicatePrefix"),onChange:c=>te(c.target.value)}),t("small",{children:o("cardEditor.dialog.saving.duplicatePrefixHint")})]}),n("label",{className:"ce-label",htmlFor:"ce-duplicate-suffix",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.saving.duplicateSuffix")}),t("input",{id:"ce-duplicate-suffix",type:"text",className:"mari-chrome-field ce-field",value:ue,placeholder:o("cardEditor.dialog.saving.duplicateSuffixPlaceholder"),"aria-label":o("cardEditor.dialog.saving.duplicateSuffix"),onChange:c=>Ie(c.target.value)})]}),t("p",{className:"ce-divider-caption",children:o("cardEditor.dialog.saving.duplicateRemoveGroup")}),n("label",{className:"ce-label",htmlFor:"ce-duplicate-remove-prefix",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.saving.duplicateRemovePrefix")}),t("input",{id:"ce-duplicate-remove-prefix",type:"text",className:"mari-chrome-field ce-field",value:Ce,placeholder:o("cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder"),"aria-label":o("cardEditor.dialog.saving.duplicateRemovePrefix"),onChange:c=>Te(c.target.value)})]}),n("label",{className:"ce-label",htmlFor:"ce-duplicate-remove-suffix",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.saving.duplicateRemoveSuffix")}),t("input",{id:"ce-duplicate-remove-suffix",type:"text",className:"mari-chrome-field ce-field",value:He,placeholder:o("cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder"),"aria-label":o("cardEditor.dialog.saving.duplicateRemoveSuffix"),onChange:c=>sa(c.target.value)})]}),t("p",{className:"ce-caption",children:o("cardEditor.dialog.saving.duplicateNamePreview",{name:ds})})]}):null,t(Ee,{name:"ce-save-mode",value:"combined",checked:E==="combined",onChange:c=>q(c),title:o("cardEditor.dialog.saving.combined")}),E==="combined"?n("label",{className:"ce-label",htmlFor:"ce-combined-name",children:[t("span",{className:"ce-label-title",children:o("cardEditor.dialog.saving.combinedName")}),t("input",{id:"ce-combined-name",type:"text",className:"mari-chrome-field ce-field",value:Ge,placeholder:o("cardEditor.dialog.saving.combinedNamePlaceholder"),"aria-label":o("cardEditor.dialog.saving.combinedName"),onChange:c=>We(c.target.value)}),t("small",{children:o("cardEditor.dialog.saving.combinedCaption")})]}):null]}),Oe?t("p",{className:"ce-caption",children:o("cardEditor.dialog.saving.reviewRequiredHint")}):null,t("p",{className:"ce-caption",children:o("cardEditor.dialog.saving.caption")})]})]})}),n("div",{className:"ce-dialog-foot ce-setup-summary",children:[t("h3",{className:"ce-section-heading",children:o("cardEditor.setup.summary")}),n("dl",{className:"ce-summary-list",children:[t("dt",{children:o("cardEditor.setup.targets")}),t("dd",{children:i.length}),t("dt",{children:o("cardEditor.dialog.model.preset")}),t("dd",{children:o(Ks[w])}),t("dt",{children:o("cardEditor.dialog.saving.title")}),t("dd",{children:o(`cardEditor.panel.saveMode.${E}`)}),t("dt",{children:o("cardEditor.dialog.processing.completionMode")}),t("dd",{children:o(`cardEditor.panel.completionMode.${U}`)})]}),X?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:o("cardEditor.dialog.dispatchError",{message:X})}):null,gt?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:o("cardEditor.dialog.targets.unloadableBlock")}):null,xt?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:o("cardEditor.dialog.saving.combinedNameRequired")}):null,t("span",{className:"ce-estimate",children:o("cardEditor.dialog.estimate",{batch:F,batchedCalls:Kt.batched,individualCalls:Kt.individual})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:x||i.length===0||gt||Jt||xt||Yt,onClick:()=>{cs()},children:o(x?"cardEditor.dialog.dispatching":"cardEditor.dialog.dispatch")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-setup-cancel",onClick:s,disabled:x,children:o("cardEditor.dialog.close")})]})]})}function Js(e,a){return e==="backstory"||e==="appearance"?{extensions:{[e]:a}}:{[e]:a}}function Ys(e){let{name:a,...r}=e;return r}function ha(e){return(e instanceof Error?e.message:String(e??""))||"unknown error"}var vo=" (Copy)",Ut=new Set;async function zt(e,a){if(Ut.has(e))return null;Ut.add(e);try{return await a()}finally{Ut.delete(e)}}async function Zs(e,a,r){if(a.op==="hold")return{ok:!0};if(a.op==="collectForCombine")return{ok:!0};if(a.op==="patchField")return await At(a.characterId,Js(a.field,a.newText),{versionSource:a.versionSource,versionReason:a.versionReason}),{ok:!0};let s=a,l=await Tr(a.characterId),o=typeof l?.id=="string"&&l.id?l.id:"";if(!o)throw new Error("The duplicate call returned no card id.");let i=Et(l),d=a.name??(i.endsWith(vo)?i.slice(0,-vo.length):i||e.characterName),m={name:Ja(d,{...s.namePrefix===void 0?{}:{prefix:s.namePrefix},...s.nameSuffix===void 0?{}:{suffix:s.nameSuffix},...s.stripNamePrefix===void 0?{}:{removePrefix:s.stripNamePrefix},...s.stripNameSuffix===void 0?{}:{removeSuffix:s.stripNameSuffix}})},g={...a.extensions};for(let[u,p]of Object.entries(a.fields))u==="backstory"||u==="appearance"?g[u]=p:m[u]=p;return Object.keys(g).length>0&&(m.extensions=g),await At(o,m,{versionSource:"agent",versionReason:`Card Editor bulk: ${r}`}),{ok:!0,resultCardId:o}}async function _t(e,a,r){let s=[];for(let[l,o]of a.entries())try{s.push({index:l,...await Zs(e,o,r.label)})}catch(i){s.push({index:l,ok:!1,error:ha(i)})}return s}async function ga(e,a,r){return await zt(a.itemId,()=>Qs(e,a,r))??{kind:"failed",message:"This card is already being saved."}}async function Qs(e,a,r){try{let s=e.status==="completed"?e.config.completionMode??"ask":"ask",o=s==="duplicate"||s==="ask"&&(e.config.saveMode==="duplicate"||e.config.saveMode==="combined")?void 0:Ys((await qe(a.characterId)).fields),i=await kt(e.id,a.itemId,{verdict:"approve",...r.force?{force:!0}:{},...o===void 0?{}:{currentFields:o}});if(!vt(i))return{kind:"failed",message:"The verdict route answered an unexpected shape."};if(i.status==="needs-confirmation")return{kind:"needs-confirmation",holds:i.holds};let d=await _t(a,i.ops,{label:e.label}),m;try{m=await ja(e.id,a.itemId,d)}catch(u){return{kind:"report-failed",message:ha(u)}}let g=d.find(u=>!u.ok);if(g){let u=m.items.find(p=>p.itemId===a.itemId);return{kind:"apply-failed",session:m,message:u?.failure?.message??g.error??"A card write failed."}}return{kind:"applied",session:m}}catch(s){return{kind:"failed",message:ha(s)}}}async function tt(e,a){if(e.status!=="completed")return{session:e,failedCount:0,messages:[]};let r=e.config.completionMode??"ask",s=e.items.filter(d=>Array.isArray(d.pendingOps)||r==="apply"&&d.status==="awaiting-review"),l=e,o=0,i=[];a?.(0,s.length);for(let[d,m]of s.entries()){let g=l.items.find(u=>u.itemId===m.itemId)??m;try{if(Array.isArray(g.pendingOps)){let u=await zt(g.itemId,async()=>{let p=await aa(l.id),I=p.items.find(T=>T.itemId===g.itemId);if(!I||!Array.isArray(I.pendingOps))return{session:p,failed:!1};let v=I.pendingOps,y=await _t(I,v,{label:p.label});return{session:await ja(p.id,I.itemId,y),failed:y.some(T=>!T.ok)}});u&&(l=u.session,u.failed&&(o+=1))}else{let u=await ga(l,g,{force:!1});u.kind==="applied"||u.kind==="apply-failed"?(l=u.session,u.kind==="apply-failed"&&(o+=1,i.push(u.message))):u.kind==="needs-confirmation"?l=await aa(l.id):(o+=1,i.push(u.message))}}catch(u){o+=1,i.push(ha(u))}a?.(d+1,s.length)}return{session:l,failedCount:o,messages:i}}async function rt(e,a){try{let r=await kt(e.id,a.itemId,{verdict:"reject"});return vt(r)?{kind:"failed",message:"The verdict route answered an unexpected shape."}:{kind:"rejected",session:r}}catch(r){return{kind:"failed",message:ha(r)}}}function el(e){return e.filter(a=>a.status==="applied").map(a=>Be((a.updates??[]).find(r=>r.field==="description")?.newText??"")).filter(a=>a.trim().length>0)}async function yo(e,a={}){try{let r=e.items.filter(m=>m.status==="applied"),s=el(e.items);if(r.length===0||s.length===0)return{kind:"failed",message:"No collected cards to combine yet."};let l=e.config.combinedCardName?.trim()||e.label,o=await Br({name:l,description:s.join(`

`)}),i=typeof o?.id=="string"&&o.id?o.id:"";if(!i)throw new Error("The create call returned no card id.");return{kind:"combined",session:await kr(e.id,{itemIds:r.map(m=>m.itemId),resultCardId:i,...a.confirmPartial?{confirmPartial:!0}:{}})}}catch(r){return{kind:"failed",message:ha(r)}}}async function wo(e){let{plans:a}=await wr(e.id),r=e,s=0;for(let l of a){let o=e.items.find(d=>d.itemId===l.itemId);if(!o)continue;(await zt(o.itemId,async()=>{let d=await _t(o,l.ops,{label:e.label});return r=await ja(e.id,l.itemId,d),d}))?.some(d=>!d.ok)&&(s+=1)}return{session:r,failedCount:s}}function ko(e){return e.split(`
`)}function Eo(e,a){let r=ko(e),s=ko(a);if(e===a)return r.map(u=>({kind:"same",text:u}));let l=0;for(;l<r.length&&l<s.length&&r[l]===s[l];)l+=1;let o=r.length,i=s.length;for(;o>l&&i>l&&r[o-1]===s[i-1];)o-=1,i-=1;let d=r.slice(l,o),m=s.slice(l,i),g=r.slice(0,l).map(u=>({kind:"same",text:u}));if(d.length*m.length<=1e6){let u=Array.from({length:d.length+1},()=>new Uint32Array(m.length+1));for(let v=d.length-1;v>=0;v-=1)for(let y=m.length-1;y>=0;y-=1)u[v][y]=d[v]===m[y]?u[v+1][y+1]+1:Math.max(u[v+1][y],u[v][y+1]);let p=0,I=0;for(;p<d.length&&I<m.length;)d[p]===m[I]?(g.push({kind:"same",text:d[p]}),p+=1,I+=1):u[p+1][I]>=u[p][I+1]?(g.push({kind:"del",text:d[p]}),p+=1):(g.push({kind:"add",text:m[I]}),I+=1);for(;p<d.length;)g.push({kind:"del",text:d[p++]});for(;I<m.length;)g.push({kind:"add",text:m[I++]})}else{for(let u of d)g.push({kind:"del",text:u});for(let u of m)g.push({kind:"add",text:u})}for(let u of r.slice(o))g.push({kind:"same",text:u});return g}function Po(e,a=3){let r=[],s=[],l=0,o=()=>{s.length!==0&&(s.some(d=>d.kind!=="same")&&r.push({hiddenBefore:l,lines:s}),s=[],l=0)},i=0;for(;i<e.length;){if(e[i].kind!=="same"){s.push(e[i]),i+=1;continue}let d=i;for(;d<e.length&&e[d].kind==="same";)d+=1;let m=d-i,g=s.length>0,u=d<e.length;if(!g&&!u)break;g?u?m>a*2?(s.push(...e.slice(i,i+a)),o(),l=m-a*2,s.push(...e.slice(d-a,d))):s.push(...e.slice(i,d)):s.push(...e.slice(i,Math.min(d,i+a))):(l=Math.max(0,m-a),s.push(...e.slice(Math.max(i,d-a),d))),i=d}return o(),r}function Ao(e){return e.trim().split(/\s+/u).filter(Boolean).length}function ot(e,a){let r=new Map;for(let l of e.trim().split(/\s+/u).filter(Boolean))r.set(l,(r.get(l)??0)+1);let s=0;for(let l of a.trim().split(/\s+/u).filter(Boolean)){let o=r.get(l)??0;o===0?s+=1:o===1?r.delete(l):r.set(l,o-1)}return{added:s,removed:[...r.values()].reduce((l,o)=>l+o,0)}}var al={queued:"cardEditor.panel.status.queued",running:"cardEditor.panel.status.running",succeeded:"cardEditor.panel.status.succeeded","awaiting-review":"cardEditor.panel.status.awaitingReview","needs-review":"cardEditor.panel.status.needsReview",applied:"cardEditor.panel.status.applied",duplicated:"cardEditor.panel.status.duplicated",rejected:"cardEditor.panel.status.rejected","failed-provider":"cardEditor.panel.status.failedProvider","failed-refusal":"cardEditor.panel.status.failedRefusal","failed-parse":"cardEditor.panel.status.failedParse",canceled:"cardEditor.panel.status.canceled",interrupted:"cardEditor.panel.status.interrupted","awaiting-split":"cardEditor.panel.status.awaitingSplit",split:"cardEditor.panel.status.split",staged:"cardEditor.panel.status.staged"};function Na(e){return al[e]??"cardEditor.panel.status.unknown"}function Da(e){return e==="queued"||e==="running"||e==="succeeded"?"live":e==="awaiting-review"||e==="needs-review"||e==="awaiting-split"?"review":e==="applied"||e==="duplicated"||e==="split"||e==="staged"?"ok":e==="rejected"||e==="canceled"||e==="interrupted"?"muted":"danger"}var tl=["awaiting-review","needs-review"],rl=["failed-provider","failed-refusal","failed-parse"];function Fe(e){return tl.includes(e.status)}function oa(e){return rl.includes(e.status)}function Vt(e){return Fe(e)||e.status==="applied"||e.status==="duplicated"||e.status==="rejected"}function Ro(e){let a=e.updates??[];if(a.length===0)return null;let r=0,s=0;for(let l of a){let o=ot(e.snapshots[l.field]??Be(l.oldText),Be(l.newText));r+=o.added,s+=o.removed}return{fields:a.length,added:r,removed:s}}function st(e){let a=e.items.filter(i=>i.status==="running").length,r=e.items.filter(i=>i.status==="queued").length,s=e.batches.filter(i=>i.status!=="split"),l=s.findIndex(i=>i.status==="running"),o=l>=0?s[l]:null;return e.config.mode==="batched"&&o?{kind:"batch",runningItems:a,queuedItems:r,batchIndex:l+1,batchCount:s.length,batchAttempts:o.attempts}:a>0?{kind:"items",runningItems:a,queuedItems:r,batchIndex:0,batchCount:0,batchAttempts:0}:r>0?{kind:"queued",runningItems:a,queuedItems:r,batchIndex:0,batchCount:0,batchAttempts:0}:{kind:"done",runningItems:a,queuedItems:r,batchIndex:0,batchCount:0,batchAttempts:0}}function To(e){let a=e.items.some(o=>o.phase===2)?2:1,r=e.items.filter(o=>(o.phase??1)===a),s=e.items.filter(o=>(o.phase??1)===1&&o.parentItemId===void 0).length,l=r.filter(o=>o.status==="awaiting-split").length;return{sources:s,results:r.filter(o=>o.status!=="split"&&o.status!=="rejected"&&o.status!=="canceled").reduce((o,i)=>o+(i.status==="awaiting-split"?i.characters?.length??1:1),0),splitsPending:l,splitsAccepted:r.filter(o=>o.status==="split").length,phase:a,phase2Ready:e.config.transform?.phase2?.enabled===!0&&a===1&&e.status!=="active"&&l===0&&e.items.some(o=>o.status==="staged")}}function Mo(e,a){return!e.parentItemId||!e.lineage?.splitGroupId?!1:a.find(s=>s.itemId===e.parentItemId)?.status==="split"}function Bo(e){return e.status==="active"?"processing":e.items.some(a=>Fe(a)||a.status==="awaiting-split")?"review":"finish"}var No=["review","approved","split","failed","rejected","running"];function lt(e){return Fe(e)?"review":e.status==="applied"||e.status==="duplicated"?"approved":e.status==="awaiting-split"||e.status==="split"?"split":oa(e)?"failed":e.status==="rejected"||e.status==="canceled"||e.status==="interrupted"?"rejected":"running"}function Do(e){let a=[];return e.status==="awaiting-split"&&a.push("split"),Vt(e)&&a.push("changes"),e.status==="failed-parse"&&e.failure?.rawOutput&&a.push("json"),oa(e)&&e.failure?.renderedPrompt!==void 0&&a.push("retry"),a.push("summary"),a}function xa(e,a,r=!0){let s=oe(e);s.current=e;let[l,o]=f(null),i=Me(I=>o(I),[]),[d,m]=f(!1),[g,u]=f(typeof document>"u"?!0:document.visibilityState==="visible");z(()=>{if(!l||typeof IntersectionObserver>"u"){m(!0);return}let I=new IntersectionObserver(v=>{m(v.some(y=>y.isIntersecting))});return I.observe(l),()=>I.disconnect()},[l]),z(()=>{let I=()=>u(document.visibilityState==="visible");return document.addEventListener("visibilitychange",I),()=>document.removeEventListener("visibilitychange",I)},[]);let p=r&&d&&g;return z(()=>{if(!p)return;let I=!1,v=0,y=()=>{I||(s.current(),v=window.setTimeout(y,a))};return y(),()=>{I=!0,window.clearTimeout(v)}},[p,a]),i}function ol({localization:e}){let a=(T,D)=>ae(e,T,D),[r,s]=f(!1),[l,o]=f(0),[i,d]=f(!1),[m,g]=f(!1),[u,p]=f(!1),[I,v]=f(null);z(()=>{let T=!1;return $a().then(D=>{T||(o(D.maxParallelAgents??0),d(D.disableAutoVerdicts),s(!0))}).catch(()=>{T||v("Could not load the bulk settings.")}),()=>{T=!0}},[]);let y=async()=>{if(!(m||!r)){g(!0),v(null),p(!1);try{await br({version:1,maxParallelAgents:l>0?l:null,disableAutoVerdicts:i}),p(!0)}catch(T){v(T instanceof Error?T.message:String(T))}finally{g(!1)}}};return n("details",{className:"ce-settings","data-ce-section":"bulk-settings",children:[t("summary",{className:"ce-section-heading",children:a("cardEditor.panel.settings.title")}),t(ta,{id:"ce-settings-max-parallel",label:a("cardEditor.panel.settings.maxParallelAgents"),value:l,min:0,max:16,onChange:T=>{o(T),p(!1)}}),t("p",{className:"ce-caption",children:a("cardEditor.panel.settings.maxParallelAgentsHint")}),n("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:i,onChange:T=>{d(T.target.checked),p(!1)}}),n("span",{className:"ce-choice-copy",children:[t("strong",{children:a("cardEditor.panel.settings.disableAutoVerdicts")}),t("small",{children:a("cardEditor.panel.settings.disableAutoVerdictsHint")})]})]}),n("div",{className:"ce-session-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:m||!r,onClick:()=>{y()},children:a("cardEditor.panel.settings.save")}),u?t("span",{className:"ce-caption",children:a("cardEditor.panel.settings.saved")}):null]}),I?t("div",{className:"ce-status ce-status--error",role:"alert",children:a("cardEditor.panel.detail.actionError",{message:I})}):null]})}function sl({session:e,t:a}){let r=st(e),s=r.kind==="batch"?a("cardEditor.panel.live.batch",{index:r.batchIndex,count:r.batchCount})+(r.batchAttempts>1?a("cardEditor.panel.live.batchRetry",{attempt:r.batchAttempts}):""):r.kind==="items"?a("cardEditor.panel.live.items",{running:r.runningItems,total:e.stats.total}):r.kind==="queued"?a("cardEditor.panel.live.queued",{count:r.queuedItems}):a("cardEditor.panel.live.settling");return t("span",{className:"ce-caption ce-live-line",children:s})}function Fo({localization:e,detailId:a,setupActive:r,onSelect:s,onNewRun:l}){let o=(b,A)=>ae(e,b,A),[i,d]=f(null),[m,g]=f({}),[u,p]=f(!1),[I,v]=f(null),[y,T]=f({}),D=oe(new Set),J=Me(()=>{Xa().then(async b=>{d(Array.isArray(b)?b:[]),p(!1);let A=(Array.isArray(b)?b:[]).filter(F=>F.status==="active"||F.status==="completed"&&(F.pendingApplyCount>0||F.enforcementPendingCount>0)),W=await Promise.allSettled(A.map(F=>aa(F.id))),$={};W.forEach((F,Y)=>{F.status==="fulfilled"&&($[A[Y].id]=F.value)}),g($)}).catch(()=>p(!0))},[]),G=xa(J,3e3,!0);z(()=>{for(let b of Object.values(m)){if(b.id===a||b.status!=="completed"||D.current.has(b.id))continue;let A=b.config.completionMode??"ask";b.items.filter($=>Array.isArray($.pendingOps)||A==="apply"&&$.status==="awaiting-review").length!==0&&(D.current.add(b.id),tt(b,($,F)=>T(Y=>({...Y,[b.id]:{done:$,total:F}}))).then($=>{$.messages.length>0&&v($.messages[0])}).finally(()=>{D.current.delete(b.id),T($=>{let{[b.id]:F,...Y}=$;return Y}),J()}))}},[m,a,J]);let R=i??[],k=R.filter(b=>b.status==="active"),P=R.filter(b=>b.status!=="active"),B=b=>{let A=m[b.id],W=b.stats.total>0?b.stats.done/b.stats.total:0;return t("li",{children:n("button",{type:"button",className:`ce-run-row${b.status==="active"?" ce-run-row--active":""}`,"aria-current":!r&&b.id===a,onClick:()=>s(b.id),children:[t("span",{className:"ce-run-row-label",children:b.label}),n("span",{className:"ce-run-row-meta",children:[b.status==="active"?null:t("span",{className:`ce-chip ce-chip--${b.status==="completed"?"ok":"muted"}`,children:o(`cardEditor.panel.sessionStatus.${b.status}`)}),b.stats.failed>0?t("span",{className:"ce-chip ce-chip--danger",children:o("cardEditor.panel.statsFailed",{count:b.stats.failed})}):null,t("span",{className:"ce-caption",children:o("cardEditor.panel.progress",{done:b.stats.done,total:b.stats.total})})]}),b.status==="active"?t("span",{className:"ce-progress",role:"progressbar","aria-valuemin":0,"aria-valuemax":b.stats.total,"aria-valuenow":b.stats.done,"aria-label":o("cardEditor.panel.progress",{done:b.stats.done,total:b.stats.total}),children:t("span",{className:"ce-progress-fill",style:{width:`${Math.round(W*100)}%`}})}):null,A&&b.status==="active"?t(sl,{session:A,t:o}):null,y[b.id]?t("span",{className:"ce-caption ce-live-line",children:o("cardEditor.panel.enforcementProgress",y[b.id])}):null]})},b.id)};return n("nav",{className:"ce-rail",ref:G,"aria-label":o("cardEditor.panel.title"),"data-card-editor-view":"runs",children:[t("div",{className:"ce-rail-top",children:n("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary","aria-current":r,onClick:l,children:[t(Ze,{className:"ce-icon","aria-hidden":"true"}),o("cardEditor.workspace.newRun")]})}),n("div",{className:"ce-rail-runs",children:[u?t("div",{className:"ce-status ce-status--error",role:"alert",children:o("cardEditor.panel.loadError")}):null,I?t("div",{className:"ce-status ce-status--error",role:"alert",children:o("cardEditor.panel.detail.actionError",{message:I})}):null,i===null&&!u?t("div",{className:"ce-status",role:"status",children:o("cardEditor.panel.loading")}):null,i!==null&&R.length===0?t("p",{className:"ce-caption",children:o("cardEditor.panel.empty")}):null,k.length>0?n("div",{"data-ce-section":"active",children:[t("span",{className:"ce-rail-label",children:o("cardEditor.panel.activeTitle")}),t("ul",{className:"ce-sessions",children:k.map(B)})]}):null,P.length>0?n("div",{"data-ce-section":"history",children:[t("span",{className:"ce-rail-label",children:o("cardEditor.panel.historyTitle")}),t("ul",{className:"ce-sessions",children:P.map(B)})]}):null]}),t("div",{className:"ce-rail-foot",children:t(ol,{localization:e})})]})}var ll={"2:3":.6666666666666666,"3:4":.75,"9:16":.5625},qo={method:"portrait",aspect:"3:4",columns:0,gap:8,resolution:2},Fa={x:0,y:0,scale:100};function it(e,a,r){return Math.min(r,Math.max(a,Math.round(e)))}function La(e,a=50){let r=a>0?a:50;return{x:it(Number.isFinite(e?.x)?e.x:0,-100,100),y:it(Number.isFinite(e?.y)?e.y:0,-100,100),scale:it(Number.isFinite(e?.scale)?e.scale:100,r,200)}}function il(e,a){let r=Math.floor(e);if(!(r>0))return{cols:1,rows:1};let s=a>0&&Number.isFinite(a)?a:1,l={cols:1,rows:r},o=1/0;for(let i=1;i<=r;i++){let d=Math.ceil(r/i),m=Math.abs(d/i-s);m<o&&(o=m,l={cols:i,rows:d})}return l}function Oo(e,a,r,s,l,o){let i=l>1?(a-l)/(l-1):s,d=o>1?(r-o)/(o-1):s,m=Math.min(Math.max(0,s),Math.max(0,Math.floor(Math.min(i,d)))),g=(a-m*(l-1))/l,u=(r-m*(o-1))/o;return g<=0||u<=0?[]:Array.from({length:e},(p,I)=>({x:I%l*(g+m),y:Math.floor(I/l)*(u+m),w:g,h:u}))}function Ho(e,a,r,s,l=[]){let o=Math.floor(a);if(!(o>0)||!(r>0)||!(s>0))return[];if(e.columns>=1){let u=Math.min(e.columns,o);return Oo(o,r,s,e.gap,u,Math.ceil(o/u))}let i=s/r,d=i;if(e.method==="portrait")d=ll[e.aspect]*i;else if(e.method==="best-fit"){let u=l.filter(p=>typeof p=="number"&&p>0);u.length>0&&(d=Math.exp(u.reduce((p,I)=>p+Math.log(I),0)/u.length)*i)}let{cols:m,rows:g}=il(o,d);return Oo(o,r,s,e.gap,m,g)}function Gt(e,a,r){if(!(a>0)||!(r>0)||!(e.w>0)||!(e.h>0))return 50;let s=e.w/a,l=e.h/r;return Math.ceil(100*Math.min(s,l)/Math.max(s,l))}function Uo(e,a,r,s){if(!(a>0)||!(r>0)||!(e.w>0)||!(e.h>0))return null;let l=La(s,Gt(e,a,r)),o=Math.max(e.w/a,e.h/r)*(l.scale/100),i=a*o,d=r*o;return{dx:e.x+(e.w-i)/2+l.x/100*e.w,dy:e.y+(e.h-d)/2+l.y/100*e.h,dw:i,dh:d}}function Wt(e,a,r,s){return La({...e,x:e.x+a,y:e.y+r},s)}function dt(e,a,r){return La({...e,scale:e.scale+a},r)}function zo(e,a,r,s){return!(a>0)||!(r>0)?e:it(e*(r/a),s,200)}function $t(e,a,r){return e.findIndex(s=>a>=s.x&&a<s.x+s.w&&r>=s.y&&r<s.y+s.h)}function _o(e){return{width:512*e.resolution,height:768*e.resolution}}function dl(e){let a=[...new Set(e.items.filter(o=>o.parentItemId===void 0).map(o=>o.characterId))],r=e.items.flatMap(o=>o.resultCardId?[o.resultCardId]:[]),s=e.items.filter(o=>o.status==="applied"&&!o.resultCardId).map(o=>o.characterId),l=[...new Set([...e.combinedCardId?[e.combinedCardId]:[],...r,...s])];return{sources:[...new Set([...a,...r])],targets:l}}function nl(e){return new Promise(a=>{let r=new Image;r.onload=()=>a(r),r.onerror=()=>a(null),r.src=e})}function ul(e){return e.split(/\s+/).filter(Boolean).slice(0,2).map(a=>a[0].toUpperCase()).join("")}function Vo({localization:e,session:a,onClose:r}){let s=(L,C)=>ae(e,L,C),[{sources:l,targets:o}]=f(()=>dl(a)),[i,d]=f(null),[m,g]=f(()=>new Set(l)),[u,p]=f(l),[I,v]=f(o[0]??""),[y,T]=f(qo),[D,J]=f({}),[G,R]=f(0),[k,P]=f(!1),[B,b]=f(null),A=oe(null),W=oe({pointers:new Map});z(()=>{let L=!1,C=[...new Set([...l,...o])];return Promise.all(C.map(async S=>{try{let U=await qe(S);return{id:S,name:U.name,image:U.avatarPath?await nl(U.avatarPath):null}}catch{return{id:S,name:S,image:null}}})).then(S=>{L||d(S)}),()=>{L=!0}},[l,o]);let $=new Map((i??[]).map(L=>[L.id,L])),F=u.filter(L=>m.has(L)).map(L=>$.get(L)??{id:L,name:L,image:null}),Y=_o(y),se=Ho(y,F.length,Y.width,Y.height,F.map(L=>L.image?L.image.naturalWidth/L.image.naturalHeight:null)),Z=Math.min(G,Math.max(0,F.length-1)),w=L=>{let C=F[L],S=se[L];return C?.image&&S?Gt(S,C.image.naturalWidth,C.image.naturalHeight):50},re=L=>D[L]??Fa,j=(L,C)=>{let S=F[L];S&&J(U=>({...U,[S.id]:C(U[S.id]??Fa,w(L))}))},O=L=>{let C=A.current,S=C?.getContext("2d");if(!C||!S)return;S.clearRect(0,0,C.width,C.height),S.fillStyle="#16121f",S.fillRect(0,0,C.width,C.height),F.forEach((h,E)=>{let q=se[E];if(!q)return;S.save(),S.beginPath(),S.rect(q.x,q.y,q.w,q.h),S.clip();let M=h.image?Uo(q,h.image.naturalWidth,h.image.naturalHeight,re(h.id)):null;h.image&&M?S.drawImage(h.image,M.dx,M.dy,M.dw,M.dh):(S.fillStyle="#2b2540",S.fillRect(q.x,q.y,q.w,q.h),S.fillStyle="#e8d4ff",S.font=`700 ${Math.round(Math.min(q.w,q.h)*.28)}px sans-serif`,S.textAlign="center",S.textBaseline="middle",S.fillText(ul(h.name),q.x+q.w/2,q.y+q.h/2)),S.restore()});let U=se[Z];L&&U&&F.length>1&&(S.strokeStyle="#36cdde",S.lineWidth=Math.max(3,Math.round(C.width/256)),S.strokeRect(U.x+1.5,U.y+1.5,U.w-3,U.h-3))};z(()=>O(!0));let N=L=>{let C=A.current,S=C.getBoundingClientRect();return{x:(L.clientX-S.left)*C.width/S.width,y:(L.clientY-S.top)*C.height/S.height}},Q=L=>{let C=N(L),S=$t(se,C.x,C.y);if(S>=0&&W.current.pointers.size===0&&R(S),L.currentTarget.setPointerCapture(L.pointerId),W.current.pointers.set(L.pointerId,C),W.current.pointers.size===2){let[U,h]=[...W.current.pointers.values()];W.current.pinch={distance:Math.hypot(U.x-h.x,U.y-h.y),scale:re(F[Z]?.id??"").scale}}},fe=L=>{let C=W.current.pointers.get(L.pointerId);if(!C)return;let S=N(L);W.current.pointers.set(L.pointerId,S);let U=se[Z];if(!U)return;if(W.current.pointers.size===2&&W.current.pinch){let[q,M]=[...W.current.pointers.values()],te=W.current.pinch;j(Z,(ue,Ie)=>({...ue,scale:zo(te.scale,te.distance,Math.hypot(q.x-M.x,q.y-M.y),Ie)}));return}let h=(S.x-C.x)/U.w*100,E=(S.y-C.y)/U.h*100;j(Z,(q,M)=>Wt(q,h,E,M))},Ae=L=>{W.current.pointers.delete(L.pointerId),W.current.pointers.size<2&&delete W.current.pinch},ge=L=>{let C=N(L),S=$t(se,C.x,C.y);S<0||(R(S),j(S,(U,h)=>dt(U,L.deltaY<0?5:-5,h)))},xe=L=>{let C={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[L.key];if(L.key==="Tab"&&!L.shiftKey&&Z<F.length-1)R(Z+1);else if(L.key==="Tab"&&L.shiftKey&&Z>0)R(Z-1);else if(C)j(Z,(S,U)=>Wt(S,C[0],C[1],U));else if(L.key==="+"||L.key==="=")j(Z,(S,U)=>dt(S,5,U));else if(L.key==="-")j(Z,(S,U)=>dt(S,-5,U));else if(L.key==="0")j(Z,()=>Fa);else return;L.preventDefault()},we=(L,C)=>p(S=>{let U=S.indexOf(L),h=U+C;if(U<0||h<0||h>=S.length)return S;let E=[...S];return[E[U],E[h]]=[E[h],E[U]],E}),Le=async()=>{let L=A.current;if(!(!L||!I||k)){P(!0),b(null);try{O(!1);let C=L.toDataURL("image/png");O(!0),await Mr(I,C),b({tone:"ok",text:s("cardEditor.avatar.applied",{name:$.get(I)?.name??I})})}catch(C){b({tone:"error",text:C instanceof Error?C.message:String(C)})}finally{P(!1)}}},me=F[Z],Re=me?La(re(me.id),w(Z)).scale:100,be=(L,C,S,U)=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":L===C,onClick:()=>U(L),children:S},String(L));return n(ke,{className:"ce-avatar-studio",label:s("cardEditor.avatar.title"),busy:k,closeOnEscape:!1,onClose:r,children:[n("div",{className:"ce-dialog-head",children:[t("strong",{children:s("cardEditor.avatar.title")}),t("button",{type:"button",className:"ce-dialog-close",onClick:r,disabled:k,"aria-label":s("cardEditor.avatar.close"),children:t(ce,{className:"ce-icon","aria-hidden":"true"})})]}),n("div",{className:"ce-avatar-body",children:[n("div",{className:"ce-avatar-sources",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.images")}),i===null?t("p",{className:"ce-caption",children:s("cardEditor.avatar.loading")}):null,t("ul",{className:"ce-avatar-source-list",children:u.map((L,C)=>{let S=$.get(L);return n("li",{className:"ce-avatar-source",children:[n("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:m.has(L),onChange:U=>g(h=>{let E=new Set(h);return U.target.checked?E.add(L):E.size>1&&E.delete(L),E})}),n("span",{className:"ce-choice-copy",children:[t("strong",{children:S?.name??L}),S&&!S.image?t("small",{children:s("cardEditor.avatar.noImage")}):null]})]}),n("span",{className:"ce-inline-controls",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:C===0,"aria-label":s("cardEditor.avatar.moveUp",{name:S?.name??L}),onClick:()=>we(L,-1),children:t(Ye,{className:"ce-icon","aria-hidden":"true"})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:C===u.length-1,"aria-label":s("cardEditor.avatar.moveDown",{name:S?.name??L}),onClick:()=>we(L,1),children:t(Je,{className:"ce-icon","aria-hidden":"true"})})]})]},L)})}),t("p",{className:"ce-caption",children:s("cardEditor.avatar.sourcesHint")})]}),n("div",{className:"ce-avatar-canvas-wrap",children:[t("canvas",{ref:A,className:"ce-avatar-canvas",width:Y.width,height:Y.height,tabIndex:0,"aria-label":s("cardEditor.avatar.canvasLabel"),onPointerDown:Q,onPointerMove:fe,onPointerUp:Ae,onPointerCancel:Ae,onWheel:ge,onKeyDown:xe}),t("p",{className:"ce-caption",role:"status",children:me?s("cardEditor.avatar.selected",{name:me.name,zoom:Re}):""})]}),n("div",{className:"ce-avatar-controls",children:[n("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.layout")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.avatar.layout"),children:["square","portrait","best-fit"].map(L=>be(L,y.method,s(`cardEditor.avatar.method.${L}`),C=>T({...y,method:C})))})]}),n("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.columns")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.avatar.columns"),children:[0,1,2,3,4].map(L=>be(L,y.columns,L===0?s("cardEditor.avatar.columnsAuto"):String(L),C=>T({...y,columns:C})))})]}),n("label",{className:"ce-label",htmlFor:"ce-avatar-gap",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.gap",{gap:y.gap})}),t("input",{id:"ce-avatar-gap",type:"range",min:0,max:48,value:y.gap,onChange:L=>T({...y,gap:Number(L.target.value)})})]}),n("label",{className:"ce-label",htmlFor:"ce-avatar-zoom",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.zoom",{zoom:Re})}),t("input",{id:"ce-avatar-zoom",type:"range",min:w(Z),max:200,value:Re,disabled:!me,onChange:L=>j(Z,(C,S)=>La({...C,scale:Number(L.target.value)},S))})]}),n("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.resolution")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.avatar.resolution"),children:[1,2,4].map(L=>be(L,y.resolution,`${512*L}\xD7${768*L}`,C=>T({...y,resolution:C})))})]}),n("div",{className:"ce-inline-controls",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!me,onClick:()=>j(Z,()=>Fa),children:s("cardEditor.avatar.resetCell")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>J({}),children:s("cardEditor.avatar.resetAll")})]}),t("p",{className:"ce-caption",children:s("cardEditor.avatar.keys")})]})]}),n("div",{className:"ce-dialog-foot",children:[B?t("div",{className:`ce-status${B.tone==="error"?" ce-status--error":""} ce-foot-error`,role:B.tone==="error"?"alert":"status",children:B.text}):null,n("label",{className:"ce-label ce-studio-name",htmlFor:"ce-avatar-target",children:[t("span",{className:"ce-sr-only",children:s("cardEditor.avatar.target")}),n("select",{id:"ce-avatar-target",className:"mari-chrome-field ce-field",value:I,onChange:L=>v(L.target.value),children:[o.length===0?t("option",{value:"",children:s("cardEditor.avatar.noTargets")}):null,o.map(L=>t("option",{value:L,children:s("cardEditor.avatar.targetOption",{name:$.get(L)?.name??L})},L))]})]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:k||!I||i===null,onClick:()=>{Le()},children:s(k?"cardEditor.avatar.applying":"cardEditor.avatar.apply")})]})]})}function Go({localization:e,session:a,item:r,onClose:s,onRetried:l}){let o=(D,J)=>ae(e,D,J),i=r.failure?.renderedPrompt??null,[d,m]=f(i?.system??""),[g,u]=f(i?.user??""),[p,I]=f(!1),[v,y]=f(null),T=async()=>{if(!(p||!i)){I(!0),y(null);try{l(await vr(a.id,r.itemId,{system:d,user:g}))}catch(D){y(D instanceof Error?D.message:String(D)),I(!1)}}};return n(ke,{className:"ce-edit-retry",label:o("cardEditor.editRetry.title",{name:r.characterName}),busy:p,closeOnEscape:!1,onClose:s,children:[n("div",{className:"ce-dialog-head",children:[t("strong",{children:o("cardEditor.editRetry.title",{name:r.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:p,"aria-label":o("cardEditor.editRetry.close"),children:t(ce,{className:"ce-icon","aria-hidden":"true"})})]}),n("div",{className:"ce-dialog-body",children:[i?n(Ne,{children:[t("p",{className:"ce-caption",children:o("cardEditor.editRetry.hint")}),n("label",{className:"ce-label",htmlFor:"ce-retry-system",children:[t("span",{className:"ce-label-title",children:o("cardEditor.editRetry.system")}),t("textarea",{id:"ce-retry-system",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:d,"data-ce-autofocus":!0,onChange:D=>m(D.target.value)})]}),n("label",{className:"ce-label",htmlFor:"ce-retry-user",children:[t("span",{className:"ce-label-title",children:o("cardEditor.editRetry.user")}),t("textarea",{id:"ce-retry-user",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:g,onChange:D=>u(D.target.value)})]})]}):t("div",{className:"ce-status",role:"status",children:o("cardEditor.editRetry.missing")}),v?t("div",{className:"ce-status ce-status--error",role:"alert",children:o("cardEditor.editRetry.error",{message:v})}):null]}),n("div",{className:"ce-dialog-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p,onClick:s,children:o("cardEditor.editRetry.cancel")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:p||!i,onClick:()=>{T()},children:o(p?"cardEditor.editRetry.retrying":"cardEditor.editRetry.retry")})]})]})}function Wo({localization:e,session:a,item:r,onClose:s,onUpdated:l}){let o=(v,y)=>ae(e,v,y),[i,d]=f(r.failure?.rawOutput??""),[m,g]=f(!1),[u,p]=f(r.failure?.message??null),I=async v=>{if(!m){g(!0),p(null);try{l(await v())}catch(y){p(y instanceof Error?y.message:String(y)),g(!1)}}};return n(ke,{className:"ce-edit-retry",label:o("cardEditor.fixJson.title",{name:r.characterName}),busy:m,closeOnEscape:!1,onClose:s,children:[n("div",{className:"ce-dialog-head",children:[t("strong",{children:o("cardEditor.fixJson.title",{name:r.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:m,"aria-label":o("cardEditor.editRetry.close"),children:t(ce,{className:"ce-icon","aria-hidden":"true"})})]}),n("div",{className:"ce-dialog-body",children:[t("p",{className:"ce-caption",children:o("cardEditor.fixJson.hint")}),n("label",{className:"ce-label",htmlFor:"ce-fix-json",children:[t("span",{className:"ce-label-title",children:o("cardEditor.fixJson.response")}),t("textarea",{id:"ce-fix-json",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:i,spellCheck:!1,"data-ce-autofocus":!0,onChange:v=>d(v.target.value)})]}),u?t("div",{className:"ce-status ce-status--error",role:"alert",children:u}):null]}),n("div",{className:"ce-dialog-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:m,onClick:s,children:o("cardEditor.fixJson.dismiss")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:m,onClick:()=>{I(()=>Pa(a.id,r.itemId))},children:o("cardEditor.fixJson.regenerate")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:m||!i.trim(),onClick:()=>{I(()=>yr(a.id,r.itemId,i))},children:o(m?"cardEditor.editRetry.retrying":"cardEditor.fixJson.apply")})]})]})}var $o=600;function Xo(e){let a=Be(e).trim();return a.length>$o?`${a.slice(0,$o)}\u2026`:a}function jo({localization:e,session:a,item:r,onClose:s,onUpdated:l}){let o=(T,D)=>ae(e,T,D),i=r.characters??[],[d,m]=f(()=>i.map(T=>T.name)),[g,u]=f(!1),[p,I]=f(null),v=r.previousOutput??r.snapshots.description??"",y=async T=>{if(!g){u(!0),I(null);try{l(await pr(a.id,r.itemId,T,T==="accept"?d.map(D=>D.trim()):void 0))}catch(D){I(D instanceof Error?D.message:String(D)),u(!1)}}};return n(ke,{className:"ce-split-review",label:o("cardEditor.split.title",{name:r.characterName}),busy:g,closeOnEscape:!1,onClose:s,children:[n("div",{className:"ce-dialog-head",children:[t("strong",{children:o("cardEditor.split.title",{name:r.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:g,"aria-label":o("cardEditor.split.close"),children:t(ce,{className:"ce-icon","aria-hidden":"true"})})]}),n("div",{className:"ce-split-body",children:[n("div",{className:"ce-split-source",children:[t("span",{className:"ce-label-title",children:o("cardEditor.split.source")}),t("pre",{className:"ce-split-source-text",tabIndex:0,children:Xo(v)||o("cardEditor.split.sourceEmpty")})]}),n("div",{className:"ce-split-proposal",children:[t("div",{className:"ce-notice",role:"status",children:n("span",{children:[t("strong",{children:o("cardEditor.split.proposal",{count:i.length})}),r.splitReason?` ${o("cardEditor.split.reason",{reason:r.splitReason})}`:""]})}),t("ol",{className:"ce-split-cards",children:i.map((T,D)=>{let J=Object.values(T.fields)[0]??"";return n("li",{className:"ce-split-card",children:[n("label",{className:"ce-label",htmlFor:`ce-split-name-${D}`,children:[t("span",{className:"ce-label-title",children:o("cardEditor.split.cardName",{index:D+1})}),t("input",{id:`ce-split-name-${D}`,className:"mari-chrome-field ce-field",value:d[D]??"",placeholder:T.name,onChange:G=>m(R=>R.map((k,P)=>P===D?G.target.value:k))})]}),t("pre",{className:"ce-split-card-text",children:Xo(J)}),T.issues?.length?t("small",{className:"ce-item-failure",children:o("cardEditor.split.issues",{count:T.issues.length})}):null]},`${D}:${T.name}`)})}),t("p",{className:"ce-caption",children:o("cardEditor.split.outcome",{count:i.length})})]})]}),n("div",{className:"ce-dialog-foot",children:[p?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:p}):null,t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:g,onClick:()=>{y("reject")},children:o("cardEditor.split.skip")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:g,onClick:()=>{y("retry-single")},children:o("cardEditor.split.retrySingle")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:g,onClick:()=>{y("accept")},children:o("cardEditor.split.accept",{count:i.length})})]})]})}var cl=3,fl=8;function ml(e){return(e.updates??[]).map(a=>{let r=e.snapshots[a.field]??Be(a.oldText),s=Be(a.newText),{added:l,removed:o}=ot(r,s),i=Po(Eo(r,s),cl);return{field:a.field,newText:s,added:l,removed:o,wordCount:Ao(s),hunks:i}})}function pl({preview:e,expanded:a,showAll:r,onToggle:s,onShowAll:l,t:o}){if(!a)return n("button",{type:"button",className:"ce-queue-minirow",onClick:s,children:[t("span",{className:"ce-queue-minirow-caret","aria-hidden":"true",children:"\u25B8"}),t("span",{className:"ce-queue-minirow-field",children:e.field}),t("span",{className:"ce-queue-minirow-words",children:o("cardEditor.queue.miniRowWords",{added:e.added,removed:e.removed})})]});let i=r?Number.POSITIVE_INFINITY:fl,d=!1,m=[];for(let g of e.hunks){if(i<=0){d=!0;break}let u=0;g.hiddenBefore>0&&(u=g.hiddenBefore,i-=1);let p=g.lines.slice(0,Math.max(0,i));p.length<g.lines.length&&(d=!0),i-=p.length,m.push({lines:p,hidden:u})}return n("section",{className:"ce-queue-field",children:[n("header",{className:"ce-queue-field-head",children:[t("strong",{className:"ce-queue-field-name",children:e.field}),t("span",{className:"ce-chip ce-chip--ok",children:o("cardEditor.queue.chips.added",{count:e.added})}),t("span",{className:"ce-chip ce-chip--danger",children:o("cardEditor.queue.chips.removed",{count:e.removed})}),t("span",{className:"ce-chip",children:o("cardEditor.queue.chips.fieldWords",{count:e.wordCount})})]}),t("div",{className:"ce-diff",role:"group","aria-label":e.field,children:m.map(({lines:g,hidden:u},p)=>n("div",{className:"ce-diff-hunk",children:[u>0?t("div",{className:"ce-diff-line ce-diff-line--marker",children:o("cardEditor.queue.hiddenLines",{count:u})}):null,g.map((I,v)=>n("div",{className:`ce-diff-line ce-diff-line--${I.kind}`,children:[t("span",{className:"ce-diff-sign","aria-hidden":"true",children:I.kind==="add"?"+":I.kind==="del"?"\u2212":"\xA0"}),t("span",{className:"ce-diff-text",children:I.text})]},v))]},p))}),d?t("button",{type:"button",className:"ce-queue-expander",onClick:l,children:o("cardEditor.queue.field.expand")}):null,t("pre",{className:"ce-queue-fullfield",children:e.newText})]})}function Ko({localization:e,session:a,focusItemId:r,onFocusChange:s,onRefresh:l}){let o=(O,N)=>ae(e,O,N),i=bt(()=>a.items.filter(Vt),[a.items]),[d,m]=f(r),g=O=>{m(O),O&&s(O)};z(()=>m(r),[r]);let[u,p]=f(!1),[I,v]=f(null),[y,T]=f(null),[D,J]=f(null),[G,R]=f(null),[k,P]=f(new Set),B=i.findIndex(O=>O.itemId===d),b=B>=0?i[B]:null,A=bt(()=>b?ml(b):[],[b]),W=oe(null);z(()=>{v(null),T(null),J(null),R(null),P(new Set),W.current?.focus({preventScroll:!0})},[d]);let $=(O,N)=>G===null?N===0:G.has(O),F=O=>R(N=>{let Q=new Set(N??new Set(A[0]?[A[0].field]:[]));return Q.has(O)?Q.delete(O):Q.add(O),Q}),Y=b!==null&&Fe(b),se=O=>{let N=i[O];N&&g(N.itemId)},Z=O=>{let Q=i.filter(fe=>fe.itemId!==O).find(Fe)??null;g(Q?.itemId??O)},w=async O=>{if(!b||u||!Y)return;p(!0),T(null),J(null);let N=await ga(a,b,{force:O});if(p(!1),N.kind==="needs-confirmation"){v(N.holds),l();return}if(N.kind==="applied"){let Q=b.itemId;l(),Z(Q);return}if(N.kind==="apply-failed"){J(N.message),l();return}T(N.message)},re=async()=>{if(!b||u||!Y)return;p(!0),T(null),J(null);let O=await rt(a,b);if(p(!1),O.kind==="rejected"){let N=b.itemId;l(),Z(N);return}T(O.message)};z(()=>{let O=N=>{let Q=N.target;if(!(Q&&(Q.tagName==="INPUT"||Q.tagName==="TEXTAREA"||Q.tagName==="SELECT"||Q.isContentEditable))&&!u){if(N.key==="ArrowLeft"){B>0&&(N.preventDefault(),se(B-1));return}if(N.key==="ArrowRight"){B>=0&&B<i.length-1&&(N.preventDefault(),se(B+1));return}!Y||N.ctrlKey||N.metaKey||N.altKey||(N.key==="r"||N.key==="R"?(N.preventDefault(),re()):(N.key==="a"||N.key==="A")&&(N.preventDefault(),w(!1)))}};return document.addEventListener("keydown",O),()=>document.removeEventListener("keydown",O)});let j=A.reduce((O,N)=>({added:O.added+N.added,removed:O.removed+N.removed}),{added:0,removed:0});return t("div",{className:"ce-queue",children:b?n("article",{className:"ce-queue-card",ref:W,tabIndex:-1,"aria-label":b.characterName,children:[n("header",{className:"ce-queue-card-head",children:[t("h3",{className:"ce-queue-name",children:b.characterName}),t("span",{className:`ce-chip ce-chip--${Da(b.status)}`,children:o(Na(b.status))})]}),n("div",{className:"ce-queue-chips",children:[t("span",{className:"ce-chip",children:o("cardEditor.queue.chips.fields",{count:A.length})}),t("span",{className:"ce-chip ce-chip--ok",children:o("cardEditor.queue.chips.added",{count:j.added})}),t("span",{className:"ce-chip ce-chip--danger",children:o("cardEditor.queue.chips.removed",{count:j.removed})})]}),a.config.saveMode==="duplicate"?t("p",{className:"ce-caption",children:o("cardEditor.queue.duplicateNote")}):null,t("div",{className:"ce-queue-fields",children:A.map((O,N)=>t(pl,{preview:O,expanded:$(O.field,N),showAll:k.has(O.field),onToggle:()=>F(O.field),onShowAll:()=>P(Q=>new Set([...Q,O.field])),t:o},O.field))}),I?n("div",{className:"ce-queue-stale",role:"alert",children:[t("p",{children:o("cardEditor.queue.staleTitle",{count:I.length})}),n("div",{className:"ce-queue-stale-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:u,onClick:()=>{w(!0)},children:o("cardEditor.queue.staleApply")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:u,onClick:()=>v(null),children:o("cardEditor.queue.staleSkip")})]})]}):null,D?t("div",{className:"ce-status ce-status--error",role:"alert",children:o("cardEditor.queue.applyFailed",{message:D})}):null,y?t("div",{className:"ce-status ce-status--error",role:"alert",children:o("cardEditor.queue.verdictError",{message:y})}):null,n("footer",{className:"ce-queue-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:B<=0,"aria-label":o("cardEditor.queue.prev"),onClick:()=>se(B-1),children:t(ze,{className:"ce-icon","aria-hidden":"true"})}),n("button",{type:"button",className:"mari-chrome-control ce-queue-reject",disabled:u||!Y,onClick:()=>{re()},children:[t(ce,{className:"ce-icon","aria-hidden":"true"}),o("cardEditor.queue.reject"),t("kbd",{className:"ce-key-hint",children:o("cardEditor.queue.rejectHint")})]}),n("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary ce-queue-approve",disabled:u||!Y,onClick:()=>{w(!1)},children:[t(ya,{className:"ce-icon","aria-hidden":"true"}),o(u?"cardEditor.queue.working":"cardEditor.queue.approve"),t("kbd",{className:"ce-key-hint",children:o("cardEditor.queue.approveHint")})]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:B<0||B>=i.length-1,"aria-label":o("cardEditor.queue.next"),onClick:()=>se(B+1),children:t(ka,{className:"ce-icon","aria-hidden":"true"})})]})]}):t("div",{className:"ce-status",role:"status",children:o("cardEditor.queue.empty")})})}function Jo({item:e,t:a}){if(oa(e)&&e.failure)return t("span",{className:"ce-item-failure",children:e.failure.message});if(e.status==="awaiting-split")return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.splitProposed",{count:e.characters?.length??0})});if(e.status==="split")return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.splitInto",{count:e.characters?.length??0})});if(e.resultCardId)return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.copyCreated",{id:e.resultCardId})});if(e.status==="applied"&&(e.updates??[]).length===0)return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.noChanges")});let r=Ro(e);return r?t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.summary",{fields:r.fields,added:r.added,removed:r.removed})}):null}function Yo({localization:e,sessionId:a,onBack:r,onDeleted:s,onRerun:l,onStage:o}){let i=(x,_)=>ae(e,x,_),[d,m]=f(null),[g,u]=f(!1),[p,I]=f(null),[v,y]=f(!1),[T,D]=f({}),[J,G]=f(null),[R,k]=f(null),[P,B]=f(null),[b,A]=f(null),[W,$]=f(new Set),[F,Y]=f("all"),[se,Z]=f(""),[w,re]=f("list"),j=oe(new Set),[O,N]=f(!1),[Q,fe]=f(!1),[Ae,ge]=f(null),xe=oe(new Set),we=oe(!1),Le=Me(()=>{aa(a).then(x=>{m(x),u(!1)}).catch(()=>u(!0))},[a]),me=xa(Le,2e3),Re=(x,_=null)=>{B(x),A(_),fe(!1),re("inspector")};z(()=>{if(!d||P!==null)return;let x=d.items.find(_=>_.status==="failed-parse"&&_.failure?.rawOutput&&!j.current.has(_.itemId));x&&(j.current.add(x.itemId),B(x.itemId),A("json"))},[P,d]);let be=d?Bo(d):null,L=d?.label??"";z(()=>{be&&o?.(be,L)},[be,L,o]),z(()=>{if(!d||P!==null)return;let x=d.items.find(_=>Fe(_)||_.status==="awaiting-split")??d.items[0];x&&B(x.itemId)},[P,d]),z(()=>{if(!d||(d.config.completionMode??"ask")!=="ask")return;let x=d.items.filter(_=>_.status==="awaiting-review"&&_.autoApply===!0&&!xe.current.has(_.itemId));if(x.length!==0){for(let _ of x)xe.current.add(_.itemId);(async()=>{for(let _ of x){let X=await ga(d,_,{force:!1});(X.kind==="failed"||X.kind==="report-failed")&&D(pe=>({...pe,[_.itemId]:X.message}))}Le()})()}},[d,Le]),z(()=>{if(!d||we.current||d.status!=="completed")return;let x=d.config.completionMode??"ask";d.items.filter(X=>Array.isArray(X.pendingOps)||x==="apply"&&X.status==="awaiting-review").length!==0&&(we.current=!0,tt(d,(X,pe)=>G({done:X,total:pe})).then(X=>{X.messages.length>0&&I(X.messages[0])}).finally(()=>{we.current=!1,G(null),Le()}))},[d,Le]);let C=async(x,_)=>{if(!R){k(x),I(null);try{let X=await _();X?m(X):Le()}catch(X){I(X instanceof Error?X.message:String(X))}finally{k(null)}}},S=()=>{C("run-again",async()=>{let x=await Cr(a);return l?.(x.id),x})},U=()=>{C("rerun-all",async()=>{let x=(d?.items??[]).filter(oa);for(let _ of x)await Pa(a,_.itemId)})},h=()=>{C("delete",async()=>{await Er(a,{force:d?.status==="active"}),s()})},E=()=>{C("combine",async()=>{if(!d)return;let _=d.items.filter(pe=>pe.status==="applied").length<d.items.length,X=await yo(d,..._?[{confirmPartial:!0}]:[]);if(X.kind==="failed")throw new Error(X.message);return y(!1),X.session})},q=x=>{C("duplicate-applied",async()=>{if(!d)return;let _=await wo(d);return _.failedCount>0&&I(i("cardEditor.panel.detail.duplicateAppliedPartial",{failed:_.failedCount,total:x})),_.session})};if(g&&!d)return n("section",{className:"ce-run ce-run--status",ref:me,children:[n("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:r,children:[t(ze,{className:"ce-icon","aria-hidden":"true"}),i("cardEditor.panel.back")]}),t("div",{className:"ce-status ce-status--error",role:"alert",children:i("cardEditor.panel.detail.loadError")})]});if(!d)return t("section",{className:"ce-run ce-run--status",ref:me,children:t("div",{className:"ce-status",role:"status",children:i("cardEditor.panel.detail.loading")})});let M=d.config.transform?To(d):null,te=Ae??M?.phase??1,ue=M?d.items.filter(x=>(x.phase??1)===te):d.items,Ie=new Map;for(let x of ue)Ie.set(lt(x),(Ie.get(lt(x))??0)+1);let Ce=se.trim().toLocaleLowerCase(),Te=ue.filter(x=>(F==="all"||lt(x)===F)&&(!Ce||x.characterName.toLocaleLowerCase().includes(Ce))),He=d.items.filter(x=>x.status!=="split"&&x.status!=="staged").length,sa=d.items.filter(Fe),Ge=d.items.filter(oa).length,We=d.config.saveMode==="combined",Pe=We?d.items.filter(x=>x.status==="applied").length:0,$e=We&&!d.combinedCardId&&Pe>0,ba=$e&&Pe<He,la=We?0:d.items.filter(x=>x.status==="applied"&&x.resultCardId===void 0&&(x.updates??[]).length>0).length,Se=st(d),Oa=d.items.filter(x=>W.has(x.itemId)),ye=Oa.filter(Fe),Ia=Te.length>0&&Te.every(x=>W.has(x.itemId)),K=d.items.find(x=>x.itemId===P)??null,ia=K?Do(K):[],Xe=b&&ia.includes(b)?b:ia[0]??null,ft=x=>$(_=>{let X=new Set(_);return X.has(x)?X.delete(x):X.add(x),X}),da=(x,_,X)=>{C(x,async()=>{for(let pe of _){let Ue=X==="approve"?await ga(d,pe,{force:!1}):await rt(d,pe);if(Ue.kind==="failed"||Ue.kind==="report-failed")throw new Error(Ue.message)}$(new Set)})},Ca=x=>{m(x),A(null)},qa=Se.kind==="batch"?i("cardEditor.panel.live.batch",{index:Se.batchIndex,count:Se.batchCount})+(Se.batchAttempts>1?i("cardEditor.panel.live.batchRetry",{attempt:Se.batchAttempts}):""):Se.kind==="items"?i("cardEditor.panel.live.items",{running:Se.runningItems,total:d.stats.total}):Se.kind==="queued"?i("cardEditor.panel.live.queued",{count:Se.queuedItems}):i("cardEditor.panel.progress",{done:d.stats.done,total:d.stats.total}),Ha=Q?t(Vo,{localization:e,session:d,onClose:()=>fe(!1)}):K?Xe==="changes"?t(Ko,{localization:e,session:d,focusItemId:K.itemId,onFocusChange:B,onRefresh:Le}):Xe==="split"&&K.status==="awaiting-split"?t(jo,{localization:e,session:d,item:K,onClose:()=>A("summary"),onUpdated:Ca},K.itemId):Xe==="json"&&K.status==="failed-parse"?t(Wo,{localization:e,session:d,item:K,onClose:()=>A("summary"),onUpdated:Ca},K.itemId):Xe==="retry"?t(Go,{localization:e,session:d,item:K,onClose:()=>A("summary"),onRetried:Ca},K.itemId):n("div",{className:"ce-inspector-summary",children:[t(Jo,{item:K,t:i}),T[K.itemId]?t("span",{className:"ce-item-failure",children:i("cardEditor.panel.detail.autoApplyError",{name:K.characterName,message:T[K.itemId]})}):null,n("div",{className:"ce-item-actions",children:[oa(K)?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>{C(`rerun-${K.itemId}`,()=>Pa(a,K.itemId))},children:i("cardEditor.panel.action.rerun")}):null,K.status==="queued"&&d.status==="active"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>{C(`cancel-${K.itemId}`,()=>Sr(a,K.itemId))},children:i("cardEditor.panel.action.cancelItem")}):null]})]}):t("p",{className:"ce-caption ce-inspector-empty",children:i("cardEditor.workspace.pickItem")});return n("section",{className:"ce-run",ref:me,"data-card-editor-view":"session-detail","data-mobile-pane":w,children:[n("header",{className:"ce-run-head",children:[n("div",{className:"ce-run-title",children:[t("strong",{className:"ce-panel-heading",children:d.label}),t("span",{className:"ce-caption",role:"status",children:d.status==="active"?qa:i("cardEditor.panel.progress",{done:d.stats.done,total:d.stats.total})})]}),t("span",{className:`ce-chip ce-chip--${d.status==="active"?"live":d.status==="completed"?"ok":"muted"}`,children:i(`cardEditor.panel.sessionStatus.${d.status}`)}),t("span",{className:"ce-chip",children:i(`cardEditor.panel.saveMode.${d.config.saveMode}`)}),t("span",{className:"ce-chip",children:i(`cardEditor.panel.completionMode.${d.config.completionMode??"ask"}`)}),M?t("span",{className:"ce-chip",children:i("cardEditor.pipeline.count",{sources:M.sources,results:M.results})}):null,M?.splitsPending?t("span",{className:"ce-chip ce-chip--review",children:i("cardEditor.pipeline.splitsPending",{count:M.splitsPending})}):null]}),d.combinedCardId||d.status==="interrupted"||J||p?n("div",{className:"ce-run-notices",children:[d.combinedCardId?t("div",{className:"ce-notice",role:"status",children:t("span",{children:i("cardEditor.panel.detail.combinedCreated",{id:d.combinedCardId})})}):null,d.status==="interrupted"?t("div",{className:"ce-notice",role:"status",children:t("span",{children:i("cardEditor.panel.interruptedNotice")})}):null,J?t("p",{className:"ce-caption ce-live-line",role:"status",children:i("cardEditor.panel.enforcementProgress",J)}):null,p?t("div",{className:"ce-status ce-status--error",role:"alert",children:i("cardEditor.panel.detail.actionError",{message:p})}):null]}):null,n("div",{className:"ce-run-body",children:[n("div",{className:"ce-run-list",children:[d.config.transform?.phase2?.enabled&&M?t("div",{className:"ce-segmented",role:"radiogroup","aria-label":i("cardEditor.pipeline.phaseLabel"),children:[1,2].map(x=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":te===x,disabled:x===2&&M.phase===1,onClick:()=>ge(x),children:i("cardEditor.pipeline.phase",{phase:x})},x))}):null,t("input",{type:"search",className:"mari-chrome-field ce-field",value:se,placeholder:i("cardEditor.workspace.filterItems"),"aria-label":i("cardEditor.workspace.filterItems"),onChange:x=>Z(x.target.value)}),n("div",{className:"ce-filter-chips",role:"group","aria-label":i("cardEditor.workspace.statusFilter"),children:[t("button",{type:"button","aria-pressed":F==="all",onClick:()=>Y("all"),children:i("cardEditor.workspace.group.all",{count:ue.length})}),No.filter(x=>Ie.has(x)).map(x=>t("button",{type:"button","aria-pressed":F===x,onClick:()=>Y(x),children:i(`cardEditor.workspace.group.${x}`,{count:Ie.get(x)??0})},x))]}),n("label",{className:"ce-select-all",children:[t("input",{type:"checkbox",checked:Ia,disabled:Te.length===0,onChange:()=>$(x=>{let _=new Set(x);for(let X of Te)Ia?_.delete(X.itemId):_.add(X.itemId);return _})}),t("span",{children:i("cardEditor.workspace.selectListed",{count:Te.length})})]}),t("ul",{className:"ce-items",children:Te.map(x=>{let _=Mo(x,d.items),X=(x.characters??[]).reduce((pe,Ue)=>pe+(Ue.issues?.length??0),0);return n("li",{className:`ce-item${_?" ce-item--child":""}${x.itemId===P?" ce-item--selected":""}`,children:[t("input",{type:"checkbox",checked:W.has(x.itemId),"aria-label":i("cardEditor.workspace.selectItem",{name:x.characterName}),onChange:()=>ft(x.itemId)}),n("button",{type:"button",className:"ce-item-open","aria-current":x.itemId===P,onClick:()=>Re(x.itemId),children:[n("span",{className:"ce-item-main",children:[t("span",{className:"ce-item-name",children:x.characterName}),t("span",{className:`ce-chip ce-chip--${Da(x.status)}`,children:i(Na(x.status))})]}),n("span",{className:"ce-item-sub",children:[x.lineage?.splitGroupId?t("span",{className:"ce-chip",children:i("cardEditor.panel.detail.lineage",{index:x.lineage.splitIndex??1,count:x.lineage.splitCount??1,origin:x.lineage.originName})}):null,X>0?t("span",{className:"ce-chip ce-chip--review",title:(x.characters??[]).flatMap(pe=>pe.issues??[]).join(`
`),children:i("cardEditor.panel.detail.issues",{count:X})}):null,t(Jo,{item:x,t:i})]})]})]},x.itemId)})}),Te.length===0?t("p",{className:"ce-caption",children:i("cardEditor.workspace.noItems")}):null]}),n("div",{className:"ce-inspector",children:[K&&!Q?n(Ne,{children:[n("div",{className:"ce-inspector-head",children:[n("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-mobile-only",onClick:()=>re("list"),children:[t(ze,{className:"ce-icon","aria-hidden":"true"}),i("cardEditor.workspace.items")]}),t("h3",{className:"ce-queue-name",children:K.characterName}),t("span",{className:`ce-chip ce-chip--${Da(K.status)}`,children:i(Na(K.status))})]}),t("div",{className:"ce-inspector-tabs",role:"tablist","aria-label":K.characterName,children:ia.map(x=>t("button",{type:"button",role:"tab","aria-selected":Xe===x,onClick:()=>A(x),children:i(`cardEditor.workspace.tab.${x}`)},x))})]}):null,t("div",{className:"ce-inspector-body",role:K&&!Q?"tabpanel":void 0,children:Ha})]})]}),n("footer",{className:"ce-bulkbar",children:[t("span",{className:"ce-caption ce-bulkbar-count",children:i("cardEditor.workspace.selectedCount",{count:Oa.length})}),n("div",{className:"ce-bulkbar-actions",children:[ye.length>0?n(Ne,{children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:R!==null,onClick:()=>da("approve-selected",ye,"approve"),children:i("cardEditor.workspace.approveSelected",{count:ye.length})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:R!==null,onClick:()=>da("reject-selected",ye,"reject"),children:i("cardEditor.workspace.rejectSelected",{count:ye.length})})]}):null,sa.length>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>da("approve-all",sa,"approve"),children:R==="approve-all"?i("cardEditor.queue.approveAllWorking"):i("cardEditor.workspace.approveAll",{count:sa.length})}):null,$e?ba&&!v?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>y(!0),children:i("cardEditor.panel.detail.combine",{count:Pe})}):ba&&v?n("span",{className:"ce-confirm-strip",role:"group","aria-label":i("cardEditor.panel.detail.combine"),children:[t("span",{className:"ce-caption",children:i("cardEditor.panel.detail.combinePartialConfirm",{count:Pe,total:He})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:E,children:i("cardEditor.panel.detail.combineYes",{count:Pe})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>y(!1),children:i("cardEditor.panel.detail.combineNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:R!==null,onClick:E,children:i("cardEditor.panel.detail.combine",{count:Pe})}):null,la>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>q(la),children:i("cardEditor.panel.detail.duplicateApplied",{count:la})}):null,M?.phase2Ready?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:R!==null,onClick:()=>{C("phase2",async()=>{let x=await hr(a);return ge(2),x})},children:i("cardEditor.pipeline.startPhase2",{count:M.results})}):null,Ge>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:U,children:i("cardEditor.panel.detail.rerunFailed",{count:Ge})}):null,M||We?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small","aria-pressed":Q,onClick:()=>{fe(x=>!x),re("inspector")},children:i("cardEditor.avatar.open")}):null,d.status==="active"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>{C("cancel-all",()=>Ir(a))},children:i("cardEditor.panel.detail.cancelAll")}):null,d.status==="completed"||d.status==="canceled"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:S,children:i("cardEditor.panel.runAgain")}):null,O?n("span",{className:"ce-confirm-strip",role:"group","aria-label":i("cardEditor.panel.delete"),children:[t("span",{className:"ce-caption",children:d.status==="active"?i("cardEditor.panel.deleteConfirmActive"):i("cardEditor.panel.deleteConfirm")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:R!==null,onClick:h,children:d.status==="active"?i("cardEditor.panel.deleteYesActive"):i("cardEditor.panel.deleteYes")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>N(!1),children:i("cardEditor.panel.deleteNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>N(!0),children:i("cardEditor.panel.detail.delete")})]})]})]})}var Xt="marinara:capability-overlay",Qo="card-editor",hl=new Set(["standard","strict","rebalance","xml-simple","xml-complex","custom","transform"]),gl=new Set(["markdown","xml","json"]),xl=new Set(["confirm","auto","duplicate","combined"]);function Ll(e){if(e===null||typeof e!="object"||Array.isArray(e))return;let a=e,r=i=>typeof a[i]=="string"?a[i]:void 0,s=r("presetId"),l=r("saveMode"),o={...s!==void 0&&hl.has(s)?{presetId:s}:{},...r("globalInstruction")!==void 0?{globalInstruction:r("globalInstruction")}:{},...l!==void 0&&xl.has(l)?{saveMode:l}:{},...r("duplicatePrefix")!==void 0?{duplicatePrefix:r("duplicatePrefix")}:{},...r("combinedCardName")!==void 0?{combinedCardName:r("combinedCardName")}:{},...r("label")!==void 0?{label:r("label")}:{},...r("schemaId")!==void 0&&/^[\w-]{1,80}$/.test(r("schemaId"))?{schemaId:r("schemaId")}:{},...gl.has(r("format")??"")?{format:r("format")}:{}};return Object.keys(o).length>0?o:void 0}function jt(e){window.dispatchEvent(new CustomEvent(Xt,{detail:{packageId:Qo,action:"open",payload:e}}))}var Zo=["setup","processing","review","finish"],ut=16;function bl(e){let[a,r]=f(null);return z(()=>{if(!e)return;let s=()=>{let d=document.querySelector(".mari-editor-body")?.getBoundingClientRect(),m=d&&d.width>=640&&d.height>=420;r(m?{left:d.left+ut,top:d.top+ut,width:d.width-ut*2,height:d.height-ut*2}:null)};s();let l=new ResizeObserver(s);l.observe(document.documentElement);let o=document.querySelector(".mari-editor-body");return o&&l.observe(o),window.addEventListener("resize",s),()=>{l.disconnect(),window.removeEventListener("resize",s)}},[e]),a}function es({localization:e}){let a=(R,k)=>ae(e,R,k),[r,s]=f(!1),[l,o]=f(null),[i,d]=f(null),[m,g]=f(null),[u,p]=f("main"),I=bl(r),v=Me(()=>s(!1),[]),y=Ur(r,()=>document.activeElement instanceof HTMLTextAreaElement,v),T=Me((R,k)=>g({stage:R,label:k}),[]);if(z(()=>{let R=k=>{let P=k.detail;if(!P||P.packageId!==Qo)return;if(P.action==="close"){s(!1);return}if(P.action!=="open")return;let B=P.payload,b=B?.dispatch?.characterIds,A=Array.isArray(b)?b.filter($=>typeof $=="string"&&$.length>0):null,W=typeof B?.sessionId=="string"&&B.sessionId?B.sessionId:null;o(W),g(null),d(A&&A.length>0?{ids:A,prefill:Ll(B?.dispatch?.prefill),key:Date.now()}:null),p("main"),s(!0)};return window.addEventListener(Xt,R),()=>window.removeEventListener(Xt,R)},[]),!r)return null;let D=i?"setup":l?m?.stage??null:null,J=i?a("cardEditor.workspace.newRunCount",{count:i.ids.length}):l?m?.label??"":a("cardEditor.workspace.pickRun"),G=R=>{o(R),g(null),d(null),p("main")};return t("div",{className:"ce-overlay ce-workspace-overlay",role:"presentation",children:n("section",{ref:y,className:"ce-shell ce-workspace",role:"dialog","aria-modal":"true","aria-label":a("cardEditor.workspace.title"),tabIndex:-1,"data-pane":u,"data-placement":I?"editor":"viewport",style:I??void 0,children:[n("header",{className:"ce-workspace-head",children:[n("div",{className:"ce-workspace-title",children:[t("strong",{children:a("cardEditor.workspace.title")}),t("span",{className:"ce-caption",children:J})]}),D?t("ol",{className:"ce-steps","aria-label":a("cardEditor.workspace.stages"),children:Zo.map((R,k)=>{let P=Zo.indexOf(D),B=k<P?"done":k===P?"current":"todo";return n("li",{className:`ce-step ce-step--${B}`,"aria-current":B==="current"?"step":void 0,children:[t("span",{className:"ce-step-dot","aria-hidden":"true",children:B==="done"?"\u2713":k+1}),a(`cardEditor.workspace.stage.${R}`)]},R)})}):null,t("button",{type:"button",className:"ce-dialog-close","aria-label":a("cardEditor.workspace.close"),onClick:v,children:t(ce,{className:"ce-icon","aria-hidden":"true"})})]}),n("div",{className:"ce-workspace-switch",role:"tablist","aria-label":a("cardEditor.workspace.title"),children:[t("button",{type:"button",role:"tab","aria-selected":u==="rail",onClick:()=>p("rail"),children:a("cardEditor.workspace.runs")}),t("button",{type:"button",role:"tab","aria-selected":u==="main",onClick:()=>p("main"),children:a(i?"cardEditor.workspace.stage.setup":"cardEditor.workspace.run")})]}),n("div",{className:"ce-workspace-body",children:[t(Fo,{localization:e,detailId:l,setupActive:i!==null,onSelect:G,onNewRun:()=>{d({ids:[],key:Date.now()}),p("main")}}),t("div",{className:"ce-workspace-main",children:i?t(So,{localization:e,characterIds:i.ids,prefill:i.prefill,onClose:()=>d(null),onDispatched:R=>G(R.id)},i.key):l?t(Yo,{localization:e,sessionId:l,onBack:()=>p("rail"),onDeleted:()=>G(null),onRerun:G,onStage:T},l):n("div",{className:"ce-workspace-empty",children:[t("p",{className:"ce-caption",children:a("cardEditor.workspace.pickRun")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary",onClick:()=>d({ids:[],key:Date.now()}),children:a("cardEditor.workspace.newRun")})]})})]})]})})}function as({localization:e,agentName:a}){let r=(g,u)=>ae(e,g,u),[s,l]=f(null),o=Me(()=>{Xa().then(g=>l(Array.isArray(g)?g:[])).catch(()=>l([]))},[]),i=xa(o,5e3,!0),d=s?.filter(g=>g.status==="active").length??0,m=s?.filter(g=>g.status!=="active").length??0;return n("section",{className:"ce-shell ce-panel","data-card-editor-view":"agent-panel",ref:i,"aria-label":a?r("cardEditor.panel.titleWithAgent",{agent:a}):r("cardEditor.panel.title"),children:[t("div",{className:"ce-panel-head",children:t("strong",{className:"ce-panel-heading",children:r("cardEditor.panel.title")})}),t("p",{className:"ce-caption",children:r("cardEditor.panel.summaryCounts",{active:d,recent:m})}),t("button",{type:"button",className:"mari-chrome-control",onClick:()=>jt(),children:r("cardEditor.panel.openWorkspace")})]})}var ts=`
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

.ce-search-option-text {
  display: grid;
  min-width: 0;
}

.ce-search-option-meta {
  overflow: hidden;
  color: var(--muted-foreground);
  font-size: 0.625rem;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* Verdict queue */

.ce-queue {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
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
.ce-queue-expander:focus-visible {
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

.ce-queue-expander {
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

/* \u2500\u2500 Bulk workspace (capabilityApi 1.68 overlay) \u2500\u2500
   One surface: header with the run's stage, a run rail, and a main pane that hosts the setup,
   the item list and the inspector. It sits over the editor body (inline box from JS) or fills
   most of the viewport, and becomes a full sheet with a rail/main switch on phones. */

.ce-workspace {
  position: relative;
  display: grid;
  width: min(112rem, 100%);
  height: min(94dvh, 68rem);
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--marinara-chat-chrome-panel-border);
  border-radius: 0.75rem;
  background: var(--marinara-chat-chrome-panel-bg);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 40%);
  font-size: 0.75rem;
}

.ce-workspace[data-placement="editor"] {
  position: fixed;
  max-width: none;
}

.ce-workspace-overlay:has(.ce-workspace[data-placement="editor"])::before {
  background: rgb(0 0 0 / 30%);
  backdrop-filter: none;
}

.ce-workspace-head {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.6rem 0.75rem;
}

.ce-workspace-title {
  display: grid;
  min-width: 0;
  flex: 1;
}

.ce-workspace-title strong {
  color: var(--marinara-chat-chrome-panel-title);
  font-size: 0.8125rem;
}

.ce-workspace-title .ce-caption {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-steps {
  display: flex;
  margin: 0;
  padding: 0;
  gap: 0.25rem;
  list-style: none;
}

.ce-step {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.2rem 0.6rem 0.2rem 0.25rem;
  color: var(--muted-foreground);
  white-space: nowrap;
}

.ce-step-dot {
  display: grid;
  width: 1.1rem;
  height: 1.1rem;
  place-items: center;
  border-radius: 999px;
  background: var(--muted);
  font-size: 0.625rem;
}

.ce-step--current {
  border-color: var(--border);
  background: var(--secondary);
  color: var(--foreground);
}

.ce-step--current .ce-step-dot {
  background: var(--ce-chroma);
  color: var(--background);
}

.ce-workspace-switch {
  display: none;
}

.ce-workspace-body {
  display: grid;
  min-height: 0;
  grid-template-columns: minmax(13rem, 16rem) minmax(0, 1fr);
}

.ce-workspace-main {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
}

.ce-workspace-empty {
  display: grid;
  flex: 1;
  place-content: center;
  justify-items: center;
  gap: 0.75rem;
}

/* Run rail */

.ce-rail {
  display: flex;
  min-height: 0;
  flex-direction: column;
  border-right: 1px solid var(--marinara-chat-chrome-panel-divider);
}

.ce-rail-top {
  display: grid;
  padding: 0.75rem;
}

.ce-rail-top .mari-chrome-control {
  justify-content: center;
}

.ce-rail-runs {
  display: grid;
  min-height: 0;
  flex: 1;
  align-content: start;
  gap: 0.5rem;
  overflow: auto;
  padding: 0 0.5rem 0.5rem;
}

.ce-rail-label {
  display: block;
  padding: 0.25rem 0.5rem;
  color: var(--muted-foreground);
  font-size: 0.625rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ce-run-row {
  display: grid;
  width: 100%;
  gap: 0.25rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  padding: 0.45rem 0.55rem;
  color: var(--foreground);
  text-align: start;
}

.ce-run-row:hover {
  background: var(--marinara-chat-chrome-highlight-bg-hover, var(--secondary));
}

.ce-run-row[aria-current="true"] {
  background: var(--secondary);
  box-shadow: inset 0 0 0 1px var(--border);
}

.ce-run-row-label {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ce-run-row-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
}

.ce-rail-foot {
  border-top: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.5rem 0.75rem;
}

/* Panes: former dialogs, laid out inside the main pane or the inspector */

.ce-pane {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.ce-pane > .ce-dialog-body {
  flex: 1;
}

/* Setup: targets | settings | summary */

.ce-setup {
  display: grid;
  grid-template-columns: minmax(15rem, 20rem) minmax(0, 1fr) minmax(13rem, 16rem);
}

.ce-setup-targets,
.ce-setup-config {
  display: grid;
  min-height: 0;
  align-content: start;
  gap: 1rem;
  overflow: auto;
  padding: 0.75rem;
  scrollbar-width: thin;
}

.ce-setup-targets {
  border-right: 1px solid var(--marinara-chat-chrome-panel-divider);
}

/* Narrow targets column: name and remove on top, note and style below. */
.ce-setup-targets .ce-target {
  grid-template-columns: minmax(0, 1fr) auto;
}

.ce-setup-targets .ce-target-identity {
  grid-column: 1;
  grid-row: 1;
}

.ce-setup-targets .ce-target-controls {
  grid-column: 1 / -1;
  grid-row: 2;
}

.ce-setup-targets .ce-target-remove {
  grid-column: 2;
  grid-row: 1;
}

.ce-setup-config > .ce-studio {
  min-height: 24rem;
}

.ce-dialog-foot.ce-setup-summary {
  display: flex;
  min-height: 0;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-start;
  overflow: auto;
  border-top: 0;
  border-left: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.75rem;
}

.ce-setup-summary > .mari-chrome-control--primary {
  margin-top: auto;
  justify-content: center;
}

/* In the column sidebar a 100% basis means full height; size errors to their text. */
.ce-setup-summary > .ce-foot-error {
  flex-basis: auto;
}

.ce-summary-list {
  display: grid;
  margin: 0;
  gap: 0.35rem 0.75rem;
  grid-template-columns: auto minmax(0, 1fr);
}

.ce-summary-list dt {
  color: var(--muted-foreground);
}

.ce-summary-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  text-align: end;
}

/* Run: head, list | inspector, bulk bar */

.ce-run {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.ce-run--status {
  gap: 0.75rem;
  padding: 0.75rem;
}

.ce-run-head {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.6rem 0.75rem;
}

.ce-run-title {
  display: grid;
  min-width: 0;
  flex: 1 1 12rem;
}

.ce-run-notices {
  display: grid;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem 0;
}

.ce-run-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: minmax(16rem, 24rem) minmax(0, 1fr);
}

.ce-run-list {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 0.5rem;
  overflow: auto;
  border-right: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.75rem;
  scrollbar-width: thin;
}

.ce-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.ce-filter-chips button {
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  padding: 0.15rem 0.55rem;
  color: var(--muted-foreground);
  font-size: 0.6875rem;
}

.ce-filter-chips button[aria-pressed="true"] {
  border-color: transparent;
  background: var(--secondary);
  color: var(--foreground);
}

.ce-select-all {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--muted-foreground);
}

.ce-run-list .ce-item {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  /* Long runs render every row; off-screen rows skip layout. */
  content-visibility: auto;
  contain-intrinsic-size: auto 3.25rem;
}

.ce-run-list .ce-item > input {
  margin-top: 0.2rem;
}

.ce-item--selected {
  border-color: var(--ce-chroma);
}

.ce-item-open {
  display: grid;
  min-width: 0;
  gap: 0.2rem;
  border: 0;
  background: transparent;
  padding: 0;
  color: inherit;
  text-align: start;
}

.ce-inspector {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
}

.ce-inspector-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem 0;
}

.ce-inspector-head .ce-queue-name {
  flex: 1;
}

.ce-inspector-tabs {
  display: flex;
  gap: 0.15rem;
  overflow-x: auto;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-divider);
  padding: 0.4rem 0.6rem 0;
  scrollbar-width: none;
}

.ce-inspector-tabs button {
  flex: none;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  padding: 0.4rem 0.6rem;
  color: var(--muted-foreground);
}

.ce-inspector-tabs button[aria-selected="true"] {
  border-bottom-color: var(--ce-chroma);
  color: var(--foreground);
}

.ce-inspector-body {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: auto;
  padding: 0.75rem 0.9rem;
}

/* Inspector tabs name the card already; the panes drop their own title bar. */
.ce-inspector-body > .ce-pane:not(.ce-avatar-studio) > .ce-dialog-head {
  display: none;
}

.ce-inspector-body > .ce-pane > .ce-dialog-body {
  padding: 0;
}

.ce-inspector-body .ce-queue {
  justify-items: stretch;
}

.ce-inspector-body .ce-queue-card {
  width: 100%;
  border: 0;
  padding: 0;
}

/* The inspector head already names the card and its status. */
.ce-inspector-body .ce-queue-card-head {
  display: none;
}

.ce-inspector-body .ce-queue-card:focus:not(:focus-visible) {
  outline: none;
}

.ce-inspector-summary {
  display: grid;
  align-content: start;
  gap: 0.6rem;
}

.ce-inspector-empty {
  margin: auto;
}

.ce-bulkbar {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid var(--marinara-chat-chrome-panel-divider);
  background: var(--marinara-chat-chrome-highlight-bg, transparent);
  padding: 0.5rem 0.75rem;
}

.ce-bulkbar-count {
  white-space: nowrap;
}

.ce-bulkbar-actions {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.35rem;
}

.ce-mobile-only {
  display: none;
}

@media (max-width: 64rem) {
  .ce-steps {
    display: none;
  }

  .ce-setup {
    grid-template-columns: minmax(13rem, 17rem) minmax(0, 1fr);
  }

  .ce-dialog-foot.ce-setup-summary {
    grid-column: 1 / -1;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    border-top: 1px solid var(--marinara-chat-chrome-panel-divider);
    border-left: 0;
  }

  .ce-setup-summary > .ce-summary-list,
  .ce-setup-summary > .ce-section-heading {
    display: none;
  }

  .ce-setup-summary > .mari-chrome-control--primary {
    margin-top: 0;
    margin-left: auto;
  }

  .ce-setup-summary > .ce-foot-error {
    flex-basis: 100%;
  }
}

@media (max-width: 48rem) {
  .ce-workspace,
  .ce-workspace[data-placement="editor"] {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 0;
  }

  .ce-workspace {
    grid-template-rows: auto auto minmax(0, 1fr);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .ce-workspace-head {
    padding-top: max(0.6rem, env(safe-area-inset-top, 0px));
  }

  .ce-workspace-switch {
    display: flex;
    gap: 0.25rem;
    border-bottom: 1px solid var(--marinara-chat-chrome-panel-divider);
    padding: 0.35rem 0.6rem;
  }

  .ce-workspace-switch button {
    flex: 1;
    border: 0;
    border-radius: 0.5rem;
    background: transparent;
    padding: 0.45rem;
    color: var(--muted-foreground);
  }

  .ce-workspace-switch button[aria-selected="true"] {
    background: var(--secondary);
    color: var(--foreground);
  }

  .ce-workspace-body {
    grid-template-columns: minmax(0, 1fr);
  }

  .ce-workspace[data-pane="main"] .ce-rail,
  .ce-workspace[data-pane="rail"] .ce-workspace-main {
    display: none;
  }

  .ce-rail {
    border-right: 0;
  }

  .ce-setup {
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .ce-setup > * {
    flex: none;
  }

  .ce-setup-targets,
  .ce-setup-config {
    overflow: visible;
    border-right: 0;
  }

  .ce-dialog-foot.ce-setup-summary {
    position: sticky;
    bottom: 0;
    overflow: visible;
    background: var(--marinara-chat-chrome-panel-bg);
  }

  .ce-run-body {
    grid-template-columns: minmax(0, 1fr);
  }

  .ce-run-list {
    border-right: 0;
  }

  .ce-run[data-mobile-pane="list"] .ce-inspector,
  .ce-run[data-mobile-pane="inspector"] .ce-run-list {
    display: none;
  }

  .ce-mobile-only {
    display: inline-flex;
  }

  .ce-bulkbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.35rem;
  }

  .ce-bulkbar-actions {
    width: 100%;
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .ce-bulkbar-actions > * {
    flex: none;
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
`;function Il({props:e}){let a=(i,d)=>ae(e.localization,i,d),r=e.selectedCharacterIds??[],l=(e.selectionCount??r.length??0)>=1,o=a("cardEditor.action.open");return n("button",{type:"button",className:"mari-chrome-control ce-selection-button","data-icon-only":e.iconOnly?"":void 0,"aria-label":e.iconOnly?o:void 0,disabled:!l,onClick:()=>{jt({dispatch:{characterIds:r}}),e.onRequestClose?.()},children:[t(ve,{className:"ce-icon","aria-hidden":"true"}),!e.iconOnly&&o]})}function Cl({element:e}){let a=e.capabilityProps??{},r=e.getAttribute("view");return r==="selection-action"?t(Il,{props:a}):r==="agent-panel"?t(as,{localization:a.localization,agentName:a.agent?.name}):r==="overlay"?t(es,{localization:a.localization}):null}function Sl({element:e}){let[,a]=f(0);z(()=>{let s=()=>a(l=>l+1);return e.addEventListener("marinara-capability-props",s),()=>e.removeEventListener("marinara-capability-props",s)},[e]);let r=e.capabilityProps?.localization?.direction==="rtl"?"rtl":"ltr";return n("div",{dir:r,style:{display:"contents"},children:[t("style",{children:ts}),t(Cl,{element:e})]})}var ct=class extends HTMLElement{constructor(){super(...arguments);Ke(this,"__root",null);Ke(this,"capabilityProps")}attributeChangedCallback(r,s,l){r==="view"&&s!==l&&this.__root&&this.render()}render(){this.__root?.render(t(Sl,{element:this}))}connectedCallback(){this.__root||(this.__root=ir(this)),this.render()}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null)})}};Ke(ct,"observedAttributes",["view"]);var rs="marinara-capability-card-editor";customElements.get(rs)||customElements.define(rs,ct);
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
