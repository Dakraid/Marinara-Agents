var Po=Object.defineProperty;var Ao=(e,a,o)=>a in e?Po(e,a,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[a]=o;var Ve=(e,a,o)=>Ao(e,typeof a!="symbol"?a+"":a,o);var Aa=globalThis.__MARINARA_HOST__,O=Aa&&Aa.version===1&&Aa.modules?Aa.modules.react:void 0;if(!O)throw new Error("Marinara Engine does not provide react; this package needs capability API 1.341 or newer.");var Us=O.Activity,zs=O.Children,_s=O.Component,Vs=O.Fragment,Gs=O.Profiler,Ws=O.PureComponent,$s=O.StrictMode,Xs=O.Suspense,js=O.ViewTransition,Ks=O.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Js=O.__COMPILER_RUNTIME,Zs=O.act,Ys=O.addTransitionType,Qs=O.cache,el=O.cacheSignal,al=O.captureOwnerStack,tl=O.cloneElement,rl=O.createContext,ua=O.createElement,ol=O.createRef,sl=O.default,Ra=O.forwardRef,ll=O.isValidElement,dl=O.lazy,il=O.memo,nl=O.startTransition,ul=O.unstable_useCacheRefresh,cl=O.use,fl=O.useActionState,Be=O.useCallback,ml=O.useContext,pl=O.useDebugValue,hl=O.useDeferredValue,H=O.useEffect,gl=O.useEffectEvent,Ht=O.useId,xl=O.useImperativeHandle,Ll=O.useInsertionEffect,Il=O.useLayoutEffect,it=O.useMemo,bl=O.useOptimistic,Cl=O.useReducer,se=O.useRef,c=O.useState,Sl=O.useSyncExternalStore,vl=O.useTransition,yl=O.version;var Ta=globalThis.__MARINARA_HOST__,ca=Ta&&Ta.version===1&&Ta.modules?Ta.modules["react-dom/client"]:void 0;if(!ca)throw new Error("Marinara Engine does not provide react-dom/client; this package needs capability API 1.341 or newer.");var Ut=ca.createRoot,kl=ca.default,El=ca.hydrateRoot,Pl=ca.version;var zt=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Ro=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,o,s)=>s?s.toUpperCase():o.toLowerCase()),nt=e=>{let a=Ro(e);return a.charAt(0).toUpperCase()+a.slice(1)},Ma=(...e)=>e.filter((a,o,s)=>!!a&&a.trim()!==""&&s.indexOf(a)===o).join(" ").trim(),_t=e=>{for(let a in e)if(a.startsWith("aria-")||a==="role"||a==="title")return!0};var Vt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var Gt=Ra(({color:e="currentColor",size:a=24,strokeWidth:o=2,absoluteStrokeWidth:s,className:l="",children:r,iconNode:d,...n},p)=>ua("svg",{ref:p,...Vt,width:a,height:a,stroke:e,strokeWidth:s?Number(o)*24/Number(a):o,className:Ma("lucide",l),...!r&&!_t(n)&&{"aria-hidden":"true"},...n},[...d.map(([h,u])=>ua(h,u)),...Array.isArray(r)?r:[r]]));var de=(e,a)=>{let o=Ra(({className:s,...l},r)=>ua(Gt,{ref:r,iconNode:a,className:Ma(`lucide-${zt(nt(e))}`,`lucide-${e}`,s),...l}));return o.displayName=nt(e),o};var To=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],Ge=de("arrow-down",To);var Mo=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],We=de("arrow-up",Mo);var No=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],fa=de("check",No);var Bo=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],ma=de("chevron-down",Bo);var Do=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],Ae=de("chevron-left",Do);var Fo=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],$e=de("chevron-right",Fo);var Oo=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],pa=de("plus",Oo);var qo=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],ha=de("refresh-cw",qo);var Ho=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],Ie=de("square-pen",Ho);var Uo=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],ga=de("trash-2",Uo);var zo=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ue=de("x",zo);var ct="/api",_o="/card-editor",Wt="x-marinara-csrf";var Vo="marinara_admin_secret";function ft(e){let a=e.status;return a==="apply"||a==="needs-confirmation"}var xa=class extends Error{constructor(o,s,l){super(s);Ve(this,"status");Ve(this,"payload");this.name="CardEditorApiError",this.status=o,this.payload=l}};function mt(){if(typeof window>"u")return{};try{let e=window.localStorage.getItem(Vo)?.trim();return e?{"X-Admin-Secret":e}:{}}catch{return{}}}function pt(e,a){if(!e||typeof e!="object"||Array.isArray(e))return a;let o=e;if(typeof o.error=="string"&&o.error.trim())return o.error.trim();if(o.error&&typeof o.error=="object"&&!Array.isArray(o.error)){let s=o.error.message;if(typeof s=="string"&&s.trim())return s.trim()}return typeof o.message=="string"&&o.message.trim()?o.message.trim():a}async function ie(e,a="GET",o,s){let l=new Headers(mt());a!=="GET"&&l.set(Wt,"1"),o!==void 0&&l.set("Content-Type","application/json");let r=await fetch(`${ct}${_o}${e}`,{method:a,headers:l,signal:s,cache:"no-store",credentials:"same-origin",...o===void 0?{}:{body:JSON.stringify(o)}});if(!r.ok){let d=await r.json().catch(()=>null);throw new xa(r.status,pt(d,r.statusText),d)}if(r.status!==204)return r.json()}function De(e,a=""){return`/sessions/${encodeURIComponent(e)}${a}`}function Xe(e,a,o){return De(e,`/items/${encodeURIComponent(a)}${o}`)}function $t(e){return ie("/sessions","POST",e)}function Xt(e,a,o,s){return ie(Xe(e,a,"/split"),"POST",{decision:o,...s?{names:s}:{}})}function jt(e){return ie(De(e,"/phase2"),"POST",{})}function Ye(e){return ie("/schemas","GET",void 0,e)}function Kt(e){return ie(`/schemas/${encodeURIComponent(e.id)}`,"PUT",{name:e.name,text:e.text})}function Jt(e){return ie(`/schemas/${encodeURIComponent(e)}`,"DELETE")}function Zt(e){return ie("/agent-config","GET",void 0,e)}function Na(e){return ie("/settings","GET",void 0,e)}function Yt(e){return ie("/settings","PUT",e)}function Ba(e){return ie("/sessions","GET",void 0,e)}function Qe(e,a){return ie(De(e),"GET",void 0,a)}function Da(e){return ie(De(e,"/cancel"),"POST")}function Fa(e){return ie(De(e,"/rerun"),"POST")}function La(e,a){return ie(Xe(e,a,"/retry"),"POST")}function Qt(e,a){return ie(Xe(e,a,"/cancel"),"POST")}function er(e,a,o){return ie(Xe(e,a,"/edit-retry"),"POST",o)}function ar(e,a,o){return ie(Xe(e,a,"/repair"),"POST",{rawOutput:o})}function ht(e,a,o){return ie(Xe(e,a,"/verdict"),"POST",o)}function Oa(e,a,o){return ie(Xe(e,a,"/apply-result"),"POST",{results:o})}function tr(e){return ie(De(e,"/duplicate-applied"),"POST")}function rr(e,a){return ie(De(e,"/combine"),"POST",a)}function qa(e,a={}){let o=a.force?"?force=true":"";return ie(De(e,o),"DELETE")}async function ea(e,a){let o=await fetch(`${ct}${e}`,{headers:new Headers(mt()),signal:a,cache:"no-store",credentials:"same-origin"});if(!o.ok){let s=await o.json().catch(()=>null);throw new xa(o.status,pt(s,o.statusText),s)}return o.json()}function gt(e){try{let a=JSON.parse(e.data);if(a&&typeof a=="object"&&!Array.isArray(a)){let o=a.name;if(typeof o=="string"&&o.trim())return o}}catch{}return""}async function or(e){let a=await ea("/connections",e);return Array.isArray(a)?a.filter(o=>o&&typeof o.id=="string"&&typeof o.name=="string"&&o.provider!=="image_generation"&&o.provider!=="video_generation"):[]}async function sr(e,a){let o=await ea(`/characters/${encodeURIComponent(e)}`,a),s=typeof o?.id=="string"&&o.id?o.id:e;return{id:s,name:gt(o)||s,avatarPath:typeof o?.avatarPath=="string"&&o.avatarPath?o.avatarPath:null}}var Go=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions"];function ut(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:{}}function Ze(e){return typeof e=="string"?e:""}function Wo(e,a){let o=(()=>{try{return ut(JSON.parse(typeof e?.data=="string"?e.data:"{}"))}catch{return{}}})(),s=ut(o.extensions),l={name:Ze(o.name),backstory:Ze(s.backstory),appearance:Ze(s.appearance),...Object.fromEntries(Go.map(d=>[d,Ze(o[d])]))},r=typeof e?.id=="string"&&e.id?e.id:a;return{id:r,name:l.name.trim()||r,avatarPath:typeof e?.avatarPath=="string"&&e.avatarPath?e.avatarPath:null,fields:l}}async function Fe(e,a){let o=await ea(`/characters/${encodeURIComponent(e)}`,a);return Wo(o,e)}function xt(e){let{fields:a}=e;return{name:a.name,description:a.description,personality:a.personality,backstory:a.backstory,appearance:a.appearance,system_prompt:a.system_prompt}}async function lr(e,a){let o=await ea(`/lorebooks/${encodeURIComponent(e)}/entries`,a);return Array.isArray(o)?o.map(s=>{let l=ut(s);return{name:Ze(l.name),content:Ze(l.content),enabled:l.enabled!==!1&&l.enabled!=="false"}}):[]}async function Ha(e,a,o){let s=new Headers(mt());s.set(Wt,"1"),o!==void 0&&s.set("Content-Type","application/json");let l=await fetch(`${ct}${e}`,{method:a,headers:s,cache:"no-store",credentials:"same-origin",...o===void 0?{}:{body:JSON.stringify(o)}});if(!l.ok){let r=await l.json().catch(()=>null);throw new xa(l.status,pt(r,l.statusText),r)}return l.json()}function Lt(e,a,o){return Ha(`/characters/${encodeURIComponent(e)}`,"PATCH",{data:a,versionSource:o.versionSource,versionReason:o.versionReason})}function dr(e){return Ha(`/characters/${encodeURIComponent(e)}/duplicate`,"POST")}function ir(e,a){return Ha(`/characters/${encodeURIComponent(e)}/avatar`,"POST",{avatar:a,filename:"card-editor-composite.png"})}function nr(e){return Ha("/characters","POST",{data:e})}function ur(e,a){let o=new URLSearchParams({limit:String(e.limit??50),offset:String(e.offset??0),sort:"name-asc"}),s=e.search?.trim();return s&&o.set("search",s),ea(`/characters/catalog?${o.toString()}`,a)}async function cr(e){let a=await ea("/lorebooks",e);return Array.isArray(a)?a.filter(o=>!!o&&typeof o.id=="string"&&typeof o.name=="string"):[]}function Ua(e,a){let o=a.prefix?.trim()?a.prefix:void 0,s=a.suffix?.trim()?a.suffix:void 0,l=a.removePrefix?.trim()?a.removePrefix:void 0,r=a.removeSuffix?.trim()?a.removeSuffix:void 0,d=e;return l&&d.toLowerCase().startsWith(l.toLowerCase())&&(d=d.slice(l.length)),r&&d.toLowerCase().endsWith(r.toLowerCase())&&(d=d.slice(0,-r.length)),d=d.trim(),d||(d=e),`${o??""}${d}${s??""}`}var $o=/&#(?:(x|X)([0-9a-fA-F]+)|([0-9]+));/g,Xo=[[/&lt;/g,"<"],[/&gt;/g,">"],[/&quot;/g,'"'],[/&apos;/g,"'"],[/&nbsp;/g,"\xA0"]];function Re(e){let o=e.replace($o,(s,l,r,d)=>{let n=l?Number.parseInt(r,16):Number(d);if(!Number.isInteger(n)||n<=0||n>1114111)return s;try{return String.fromCodePoint(n)}catch{return s}});for(let[s,l]of Xo)o=o.replace(s,l);return o.replace(/&amp;/g,"&")}var fr={_meta:{locale:"en",direction:"ltr"},"cardEditor.title":"Card Editor","cardEditor.panel.empty":"No bulk editing sessions yet.","cardEditor.error.network":"Could not reach Card Editor.","cardEditor.action.open":"Card Editor","cardEditor.dialog.title":"Bulk Card Editor","cardEditor.dialog.close":"Close","cardEditor.dialog.targets.title":"Targets \xB7 {{count}} characters","cardEditor.dialog.targets.loading":"Loading selected cards\u2026","cardEditor.dialog.targets.empty":"No targets left \u2014 close and select at least one character.","cardEditor.dialog.targets.loadFailed":"card could not be loaded","cardEditor.dialog.targets.notePlaceholder":"Focus on backstory\u2026","cardEditor.dialog.targets.noteLabel":"Note for {{name}}","cardEditor.dialog.targets.styleLabel":"Style override for {{name}}","cardEditor.dialog.targets.styleSession":"\u2014 use session style \u2014","cardEditor.dialog.targets.styleNone":"None","cardEditor.dialog.targets.unloadableBlock":"Remove cards that could not be loaded before dispatching.","cardEditor.dialog.targets.remove":"Remove {{name}}","cardEditor.dialog.search.placeholder":"Search characters\u2026","cardEditor.dialog.search.loading":"Searching\u2026","cardEditor.dialog.search.noResults":"No characters match.","cardEditor.dialog.search.error":"Characters could not be loaded.","cardEditor.dialog.model.title":"Model","cardEditor.dialog.model.connection":"Connection","cardEditor.dialog.model.connectionDefault":"\u2014 agent default \u2014","cardEditor.dialog.model.connectionsLoading":"Loading connections\u2026","cardEditor.dialog.model.connectionsError":"Connections could not be loaded.","cardEditor.dialog.model.preset":"Prompt preset","cardEditor.dialog.model.presetStandard":"Standard rewrite","cardEditor.dialog.model.presetStrict":"Strict surgical","cardEditor.dialog.model.presetRebalance":"Field rebalancing","cardEditor.dialog.model.presetXmlSimple":"XML \xB7 Simple","cardEditor.dialog.model.presetXmlComplex":"XML \xB7 Complex","cardEditor.dialog.model.presetCustom":"Custom\u2026","cardEditor.dialog.model.customTemplate":"Custom template","cardEditor.dialog.model.customTemplateHint":"The full prompt template sent for every card. Choosing Custom prefills this field with the current preset's body.","cardEditor.dialog.instructions.title":"Instructions & references","cardEditor.dialog.instructions.global":"Global instruction","cardEditor.dialog.instructions.globalPlaceholder":"Applies to every card \u2014 e.g. tighten prose, remove meta commentary\u2026","cardEditor.dialog.instructions.behavior":"Behavior character","cardEditor.dialog.instructions.behaviorHint":"One card whose behavior, judgment, and writing style guide how edits are written. The directive and notes still decide what changes.","cardEditor.dialog.instructions.behaviorNone":"None","cardEditor.dialog.instructions.lorebooks":"Global lorebooks","cardEditor.dialog.instructions.lorebooksHint":"Reference context applied to every card.","cardEditor.dialog.instructions.lorebooksFilter":"Filter lorebooks\u2026","cardEditor.dialog.instructions.lorebooksLoading":"Loading lorebooks\u2026","cardEditor.dialog.instructions.lorebooksEmpty":"No lorebooks in the library.","cardEditor.dialog.instructions.lorebooksNoneMatch":"No lorebooks match the filter.","cardEditor.dialog.instructions.lorebooksError":"Lorebooks could not be loaded.","cardEditor.dialog.processing.title":"Processing","cardEditor.dialog.processing.modeIndividual":"One agent per card","cardEditor.dialog.processing.modeBatched":"Batched \u2014 XML, N cards per call","cardEditor.dialog.processing.batchSize":"Batch size","cardEditor.dialog.processing.providerRetries":"Provider retries","cardEditor.dialog.processing.refusalRetries":"Refusal retries","cardEditor.dialog.processing.concurrency":"Concurrency","cardEditor.dialog.processing.rebalance":"Rebalance field content","cardEditor.dialog.processing.rebalanceHint":"Splits content into Description / Personality / Backstory / Appearance / Scenario.","cardEditor.dialog.processing.completionMode":"On completion","cardEditor.dialog.processing.completionAsk":"Ask (default)","cardEditor.dialog.processing.completionApply":"Always apply in place","cardEditor.dialog.processing.completionDuplicate":"Always duplicate","cardEditor.dialog.processing.completionCaption":"Apply mode holds stale cards for review instead of overwriting them. Duplicates use this session's prefix or suffix.","cardEditor.dialog.processing.autoDisabledNote":"The Card Editor's bulk settings require review, so auto-approve and on-completion writes are disabled here.","cardEditor.dialog.processing.overflowCaption":"On context overflow the failed batch is split and re-dispatched automatically until single-card calls remain.","cardEditor.dialog.saving.title":"Saving","cardEditor.dialog.saving.confirm":"In-place \u2014 confirm each card","cardEditor.dialog.saving.auto":"In-place \u2014 auto-approve (saves each character's latest revision)","cardEditor.dialog.saving.duplicate":"Duplicate \u2014 apply to copies","cardEditor.dialog.saving.duplicatePrefix":"Name prefix","cardEditor.dialog.saving.duplicatePrefixPlaceholder":"Prefix for the copy names","cardEditor.dialog.saving.duplicatePrefixHint":"Both affixes apply: copies are named prefix + name + suffix. Blank boxes are ignored.","cardEditor.dialog.saving.duplicateSuffix":"Name suffix","cardEditor.dialog.saving.duplicateSuffixPlaceholder":"Suffix for the copy names","cardEditor.dialog.saving.duplicateRemoveGroup":"Remove from name","cardEditor.dialog.saving.duplicateRemovePrefix":"Remove prefix","cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder":"Strip this from the start of the copy name","cardEditor.dialog.saving.duplicateRemoveSuffix":"Remove suffix","cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder":"Strip this from the end of the copy name","cardEditor.dialog.saving.duplicateNamePreview":"Copy name: {{name}}","cardEditor.dialog.saving.combined":"Combined \u2014 create one new card","cardEditor.dialog.saving.combinedName":"Combined card name","cardEditor.dialog.saving.combinedNamePlaceholder":"The one new card's name","cardEditor.dialog.saving.combinedCaption":"Each character's generated XML document is joined into ONE new card's description \u2014 no per-card writes.","cardEditor.dialog.saving.combinedNameRequired":"Enter a name for the combined card before dispatching.","cardEditor.dialog.saving.reviewRequiredHint":"The bulk settings require review, so auto-approve is unavailable \u2014 dispatches wait for your confirmation.","cardEditor.dialog.saving.caption":"In-place always writes a new revision. Auto-approve holds back cards that genuinely changed mid-run for review. Duplicates are renamed by the affixes above \u2014 prefix, suffix, and removals combine. Combined concatenates each generated XML document into one new card.","cardEditor.dialog.estimate":"Batched \xD7{{batch}} \u2192 {{batchedCalls}} calls \xB7 individual \u2192 {{individualCalls}} calls","cardEditor.dialog.dispatch":"Dispatch","cardEditor.dialog.dispatching":"Dispatching\u2026","cardEditor.dialog.dispatchError":"Could not create the session: {{message}}","cardEditor.panel.title":"Bulk runs","cardEditor.panel.openWorkspace":"Open Card Editor workspace","cardEditor.panel.summaryCounts":"{{active}} active \xB7 {{recent}} past sessions","cardEditor.panel.titleWithAgent":"Bulk runs \u2014 {{agent}}","cardEditor.panel.refresh":"Refresh","cardEditor.panel.loading":"Loading sessions\u2026","cardEditor.panel.loadError":"Sessions could not be loaded.","cardEditor.panel.activeTitle":"Active","cardEditor.panel.historyTitle":"History","cardEditor.panel.progress":"{{done}} of {{total}} cards","cardEditor.panel.modeIndividual":"individual","cardEditor.panel.modeBatched":"batched \xD7{{size}}","cardEditor.panel.saveMode.confirm":"confirm each card","cardEditor.panel.saveMode.auto":"auto-approve","cardEditor.panel.saveMode.duplicate":"duplicate","cardEditor.panel.saveMode.combined":"combined","cardEditor.panel.completionMode.ask":"on completion \xB7 ask","cardEditor.panel.completionMode.apply":"on completion \xB7 apply","cardEditor.panel.completionMode.duplicate":"on completion \xB7 duplicate","cardEditor.panel.enforcementProgress":"Applying completion outcome \xB7 {{done}} of {{total}} cards","cardEditor.panel.runAgain":"Run again","cardEditor.panel.live.batch":"Running batch {{index}} of {{count}}","cardEditor.panel.live.batchRetry":" \xB7 attempt {{attempt}}","cardEditor.panel.live.items":"Editing {{running}} of {{total}} cards","cardEditor.panel.live.queued":"{{count}} cards queued","cardEditor.panel.live.settling":"Finishing up\u2026","cardEditor.panel.cancel":"Cancel","cardEditor.panel.delete":"Delete","cardEditor.panel.deleteConfirm":"Delete this session? Its results are lost.","cardEditor.panel.deleteConfirmActive":"Still running \u2014 cancel it and delete?","cardEditor.panel.deleteYes":"Delete","cardEditor.panel.deleteYesActive":"Cancel & delete","cardEditor.panel.deleteNo":"Keep","cardEditor.panel.interruptedNotice":"The server restarted mid-run, so this session was interrupted. Failed items can still be retried from this session.","cardEditor.panel.statsFailed":"{{count}} failed","cardEditor.panel.sessionStatus.active":"active","cardEditor.panel.sessionStatus.completed":"completed","cardEditor.panel.sessionStatus.canceled":"canceled","cardEditor.panel.sessionStatus.interrupted":"interrupted","cardEditor.panel.back":"Back to sessions","cardEditor.panel.status.queued":"queued","cardEditor.panel.status.running":"running","cardEditor.panel.status.succeeded":"succeeded","cardEditor.panel.status.awaitingReview":"awaiting review","cardEditor.panel.status.needsReview":"needs review","cardEditor.panel.status.applied":"applied","cardEditor.panel.status.duplicated":"duplicated","cardEditor.panel.status.rejected":"rejected","cardEditor.panel.status.failedProvider":"failed \xB7 provider","cardEditor.panel.status.failedRefusal":"failed \xB7 refusal","cardEditor.panel.status.failedParse":"failed \xB7 parse","cardEditor.panel.status.canceled":"canceled","cardEditor.panel.status.interrupted":"interrupted","cardEditor.panel.status.unknown":"unknown","cardEditor.panel.detail.loading":"Loading session\u2026","cardEditor.panel.detail.loadError":"The session could not be loaded.","cardEditor.panel.detail.cancelAll":"Cancel all","cardEditor.panel.detail.rerunFailed":"Rerun all failed ({{count}})","cardEditor.panel.detail.reviewQueue":"Review queue ({{count}})","cardEditor.panel.detail.delete":"Delete session","cardEditor.panel.detail.summary":"{{fields}} fields \xB7 +{{added}}/\u2212{{removed}} words","cardEditor.panel.detail.noChanges":"no changes proposed","cardEditor.panel.detail.copyCreated":"copy: {{id}}","cardEditor.panel.detail.combine":"Create combined card ({{count}})","cardEditor.panel.detail.combinePartialConfirm":"{{count}} of {{total}} cards were collected. Create the combined card from the collected cards only?","cardEditor.panel.detail.combineYes":"Combine {{count}}","cardEditor.panel.detail.combineNo":"Cancel","cardEditor.panel.detail.combinedCreated":"combined card created: {{id}}","cardEditor.panel.detail.duplicateApplied":"Duplicate applied cards ({{count}})","cardEditor.panel.detail.duplicateAppliedPartial":"{{failed}} of {{total}} cards could not be duplicated \u2014 retry from the item row.","cardEditor.panel.detail.autoApplyError":"Auto-apply failed for {{name}}: {{message}}","cardEditor.panel.detail.actionError":"Action failed: {{message}}","cardEditor.panel.detail.pagePrev":"Previous page","cardEditor.panel.detail.pageNext":"Next page","cardEditor.panel.detail.page":"Page {{page}} of {{pages}}","cardEditor.panel.action.review":"Review","cardEditor.panel.action.rerun":"Rerun","cardEditor.panel.action.editRetry":"Edit & retry","cardEditor.panel.action.fixJson":"Fix JSON","cardEditor.panel.action.inspect":"Inspect","cardEditor.panel.action.cancelItem":"Cancel","cardEditor.panel.settings.title":"Bulk settings","cardEditor.panel.settings.maxParallelAgents":"Max parallel agents","cardEditor.panel.settings.maxParallelAgentsHint":"Upper bound on concurrent calls in bulk runs. 0 follows the connection's parallel job limit.","cardEditor.panel.settings.disableAutoVerdicts":"Require review (disable auto-approve / auto-apply)","cardEditor.panel.settings.disableAutoVerdictsHint":"Bulk dispatches always wait for your confirmation; auto-approve and on-completion apply/duplicate are turned off.","cardEditor.panel.settings.save":"Save settings","cardEditor.panel.settings.saved":"Saved.","cardEditor.queue.title":"Review changes","cardEditor.queue.close":"Back to the session","cardEditor.queue.position":"{{index}} of {{count}}","cardEditor.queue.empty":"Nothing left to review.","cardEditor.queue.dotsLabel":"Review progress","cardEditor.queue.dotLabel":"{{name}}: {{status}}","cardEditor.queue.chips.fields":"{{count}} fields","cardEditor.queue.chips.added":"+{{count}} words","cardEditor.queue.chips.removed":"\u2212{{count}} words","cardEditor.queue.chips.fieldWords":"{{count}} words","cardEditor.queue.duplicateNote":"Approving copies the current card and applies these fields to the copy.","cardEditor.queue.hiddenLines":"\u22EF {{count}} unchanged lines \u22EF","cardEditor.queue.miniRowWords":"+{{added}}/\u2212{{removed}} words","cardEditor.queue.field.expand":"show all hunks \u2192","cardEditor.queue.staleTitle":"{{count}} fields changed since the run \u2014 applying replaces them.","cardEditor.queue.staleApply":"Apply anyway","cardEditor.queue.staleSkip":"Skip","cardEditor.queue.applyFailed":"Applying failed: {{message}} \u2014 rerun the item from the session table.","cardEditor.queue.reportFailed":"The card was written but the confirmation could not be sent: {{message}} \u2014 reload the session to see the true state.","cardEditor.queue.verdictError":"The verdict failed: {{message}}","cardEditor.queue.prev":"Previous card","cardEditor.queue.next":"Next card","cardEditor.queue.reject":"Reject","cardEditor.queue.approve":"Approve","cardEditor.queue.rejectHint":"R","cardEditor.queue.approveHint":"A","cardEditor.queue.working":"Working\u2026","cardEditor.queue.approveAll":"Approve all remaining without review","cardEditor.queue.approveAllWorking":"Approving\u2026","cardEditor.editRetry.title":"Edit & retry \u2014 {{name}}","cardEditor.editRetry.close":"Close","cardEditor.editRetry.hint":"The exact rendered prompt sent to the model. Retry re-dispatches this card with the edited text.","cardEditor.editRetry.system":"System prompt","cardEditor.editRetry.user":"User prompt","cardEditor.editRetry.missing":"The rendered prompt was not retained for this item; use rerun instead.","cardEditor.editRetry.cancel":"Cancel","cardEditor.editRetry.retry":"Retry","cardEditor.editRetry.retrying":"Retrying\u2026","cardEditor.editRetry.error":"The retry failed: {{message}}","cardEditor.fixJson.title":"Fix JSON \u2014 {{name}}","cardEditor.fixJson.hint":"The model's response could not be parsed, even after auto-repair and a strict-JSON retry. Fix it and apply, or retry generation.","cardEditor.fixJson.response":"Raw model response","cardEditor.fixJson.dismiss":"Dismiss","cardEditor.fixJson.regenerate":"Retry generation","cardEditor.fixJson.apply":"Apply fix","cardEditor.workspace.title":"Card Editor","cardEditor.workspace.close":"Close","cardEditor.panel.status.awaitingSplit":"split proposed","cardEditor.panel.status.split":"split","cardEditor.panel.status.staged":"phase 1 done","cardEditor.dialog.model.presetTransform":"Transform to a schema","cardEditor.transform.title":"Schema transform","cardEditor.transform.schema":"Schema","cardEditor.transform.schemaBuiltIn":"{{name}} (built-in)","cardEditor.transform.editSchemas":"Edit schemas","cardEditor.transform.schemasError":"Schemas could not be loaded. Close the dialog and try again.","cardEditor.transform.formatLabel":"Write fields as","cardEditor.transform.format.markdown":"Markdown","cardEditor.transform.format.xml":"XML","cardEditor.transform.format.json":"JSON","cardEditor.transform.multiTitle":"When one card describes several characters","cardEditor.transform.multiMerge":"Keep them on one card","cardEditor.transform.multiMergeHint":"One result per source card. Each character gets its own document on that card.","cardEditor.transform.multiSplit":"Split them into separate cards","cardEditor.transform.multiSplitHint":"You confirm every split first. Split characters become new cards linked to the source, and the source card is never changed.","cardEditor.transform.outputModeTitle":"How the model answers","cardEditor.transform.outputStructured":"Structured fields (recommended)","cardEditor.transform.outputStructuredHint":"The model fills the schema as data and Marinara writes it as {{format}}.","cardEditor.transform.outputDocument":"The model writes the document itself","cardEditor.transform.outputDocumentHint":"The earlier method: the model writes each field's document text directly. Validation is skipped.","cardEditor.transform.providerJsonOn":"Provider JSON mode is on for the Card Editor agent. Connections that support it enforce the response shape; others use the normal prompt.","cardEditor.transform.providerJsonOff":"Provider JSON mode is off. Turn on \u201CUse structured output\u201D in the Card Editor agent settings to let supported connections enforce the response shape.","cardEditor.transform.providerJsonUnknown":"This Engine version does not report provider JSON mode, so the normal prompt is used.","cardEditor.transform.phase2":"Run a second phase","cardEditor.transform.phase2Hint":"After every split is decided, every Phase 1 result is processed again. Nothing is written to your cards until Phase 2 finishes.","cardEditor.transform.phase2Instruction":"Phase 2 instruction","cardEditor.transform.phase2InstructionPlaceholder":"For example: tighten the prose and make each card name its relations to the others.","cardEditor.transform.phase2Schema":"Phase 2 schema","cardEditor.transform.sameAsPhase1":"Same as Phase 1","cardEditor.transform.phase2AllowSplits":"Allow splits in Phase 2","cardEditor.pipeline.label":"Run totals","cardEditor.pipeline.count":"{{sources}} cards \u2192 {{results}} results","cardEditor.pipeline.splitsAccepted":"{{count}} source card(s) split into several characters","cardEditor.pipeline.noSplits":"No splits","cardEditor.pipeline.phaseLabel":"Shown phase","cardEditor.pipeline.phase":"Phase {{phase}}","cardEditor.pipeline.splitsPending":"{{count}} split(s) waiting for you","cardEditor.pipeline.startPhase2":"Start Phase 2 \xB7 {{count}} cards","cardEditor.panel.action.reviewSplit":"Review split","cardEditor.panel.detail.splitProposed":"The model proposes {{count}} characters for this card.","cardEditor.panel.detail.splitInto":"Split into {{count}} new cards. This card stays unchanged.","cardEditor.panel.detail.lineage":"{{index}} of {{count}} from {{origin}}","cardEditor.panel.detail.issues":"{{count}} schema issue(s)","cardEditor.split.title":"Split review \xB7 {{name}}","cardEditor.split.close":"Close split review","cardEditor.split.source":"Source card","cardEditor.split.sourceEmpty":"The source card has no description.","cardEditor.split.proposal":"The model proposes {{count}} characters.","cardEditor.split.reason":"Reason: {{reason}}","cardEditor.split.cardName":"Card {{index}} name","cardEditor.split.issues":"{{count}} schema issue(s)","cardEditor.split.outcome":"Accepting creates {{count}} new cards linked to the source. The source card is not changed.","cardEditor.split.skip":"Skip this card","cardEditor.split.retrySingle":"Retry as one card","cardEditor.split.accept":"Accept split \xB7 {{count}} cards","cardEditor.schemas.title":"Schema studio","cardEditor.schemas.close":"Close schema studio","cardEditor.schemas.loadError":"Schemas could not be loaded.","cardEditor.schemas.listLabel":"Schemas","cardEditor.schemas.builtIn":"Built-in","cardEditor.schemas.yours":"Yours","cardEditor.schemas.modeLabel":"Editor","cardEditor.schemas.modeBuilder":"Builder","cardEditor.schemas.modeText":"Text","cardEditor.schemas.textLabel":"Schema text","cardEditor.schemas.valid":"Valid schema","cardEditor.schemas.invalid":"Line {{line}}: {{message}}","cardEditor.schemas.kindGroup":"group","cardEditor.schemas.kindVocab":"values","cardEditor.schemas.kindRepeat":"repeats","cardEditor.schemas.maxChip":"max {{max}}","cardEditor.schemas.targetChip":"\u2192 {{field}}","cardEditor.schemas.nodeKey":"Element name","cardEditor.schemas.nodeTarget":"Card field","cardEditor.schemas.targetDefault":"description (default)","cardEditor.schemas.targetInherit":"Same as its top-level element","cardEditor.schemas.nodeHint":"Hint for the model","cardEditor.schemas.nodeHintPlaceholder":"What belongs here","cardEditor.schemas.nodeAttributes":"Attributes","cardEditor.schemas.nodeAttributesHint":"One per line as name=a | b | c. Leave the values empty for freeform; end with etc. to allow other values.","cardEditor.schemas.nodeMax":"Max length","cardEditor.schemas.nodeMaxNone":"none","cardEditor.schemas.nodeRepeat":"List of entries","cardEditor.schemas.addChild":"Add element","cardEditor.schemas.moveUp":"Move element up","cardEditor.schemas.moveDown":"Move element down","cardEditor.schemas.removeNode":"Remove","cardEditor.schemas.previewLabel":"Compiled preview","cardEditor.schemas.preview.markdown":"Markdown","cardEditor.schemas.preview.xml":"XML","cardEditor.schemas.preview.json":"JSON","cardEditor.schemas.preview.schema":"JSON Schema","cardEditor.schemas.previewHint.markdown":"The template the model sees when it writes Markdown itself.","cardEditor.schemas.previewHint.xml":"The template the model sees when it writes XML itself.","cardEditor.schemas.previewHint.json":"The data shape the model fills in structured mode, for every output format.","cardEditor.schemas.previewHint.schema":"Sent as provider structured output when the connection supports it.","cardEditor.schemas.name":"Schema name","cardEditor.schemas.copyName":"{{name}} copy","cardEditor.schemas.duplicate":"Save as new","cardEditor.schemas.save":"Save","cardEditor.schemas.delete":"Delete","cardEditor.schemas.deleteConfirm":"Delete \u201C{{name}}\u201D? Runs that already used it keep their copy.","cardEditor.schemas.deleteYes":"Delete schema","cardEditor.schemas.deleteNo":"Keep","cardEditor.avatar.open":"Avatar studio","cardEditor.avatar.title":"Avatar studio","cardEditor.avatar.close":"Close avatar studio","cardEditor.avatar.images":"Images","cardEditor.avatar.loading":"Loading card images\u2026","cardEditor.avatar.noImage":"No avatar; shows initials","cardEditor.avatar.moveUp":"Move {{name}} earlier","cardEditor.avatar.moveDown":"Move {{name}} later","cardEditor.avatar.sourcesHint":"Defaults to every card in this run. The source images are never changed.","cardEditor.avatar.canvasLabel":"Avatar composite. Drag to pan, scroll or pinch to zoom. With the canvas focused: Tab changes cell, arrow keys pan, plus and minus zoom, 0 resets the cell.","cardEditor.avatar.selected":"Selected: {{name}} \xB7 zoom {{zoom}}%","cardEditor.avatar.layout":"Layout","cardEditor.avatar.method.square":"Square","cardEditor.avatar.method.portrait":"Portrait","cardEditor.avatar.method.best-fit":"Best fit","cardEditor.avatar.columns":"Columns","cardEditor.avatar.columnsAuto":"Auto","cardEditor.avatar.gap":"Gap \xB7 {{gap}} px","cardEditor.avatar.zoom":"Cell zoom \xB7 {{zoom}}%","cardEditor.avatar.resolution":"Export size","cardEditor.avatar.resetCell":"Reset cell","cardEditor.avatar.resetAll":"Reset all","cardEditor.avatar.keys":"Tab changes cell \xB7 arrows pan \xB7 + and \u2212 zoom \xB7 0 resets","cardEditor.avatar.target":"Use as avatar for","cardEditor.avatar.targetOption":"Avatar for {{name}}","cardEditor.avatar.noTargets":"No cards written yet","cardEditor.avatar.apply":"Use as avatar","cardEditor.avatar.applying":"Saving\u2026","cardEditor.avatar.applied":"Saved as the avatar of {{name}}."};var It=Object.fromEntries(Object.entries(fr).filter(([e,a])=>e!=="_meta"&&typeof a=="string")),mr={en:It};function Ko(e){let a=e?.trim().replaceAll("_","-").toLowerCase()||"en";return mr[a]??mr[a.split("-")[0]]??It}function Jo(e,a){return a?e.replaceAll(/\{\{([A-Za-z0-9_]+)\}\}/g,(o,s)=>{let l=a[s];return l==null?o:String(l)}):e}function ee(e,a,o){let s=Ko(e?.locale);return Jo(s[a]??It[a]??a,o)}var za=globalThis.__MARINARA_HOST__,Ia=za&&za.version===1&&za.modules?za.modules["react/jsx-runtime"]:void 0;if(!Ia)throw new Error("Marinara Engine does not provide react/jsx-runtime; this package needs capability API 1.341 or newer.");var Oe=Ia.Fragment,kd=Ia.default,t=Ia.jsx,i=Ia.jsxs;var Zo=200;function pr({name:e,avatarPath:a}){return t("span",{className:"ce-search-option-avatar","aria-hidden":"true",children:a?t("img",{src:a,alt:"",loading:"lazy"}):e.trim().charAt(0)||"?"})}function _a({localization:e,selection:a,onChange:o,allowInherit:s=!1,buttonLabel:l,inheritLabel:r,noneLabel:d}){let n=(E,X)=>ee(e,E,X),p=Ht(),h=se(null),u=se(null),[m,C]=c(!1),[v,S]=c(""),[M,N]=c([]),[B,R]=c(!1),[j,P]=c(!1),[A,T]=c(0),W=se(0);H(()=>{if(!m)return;let E=++W.current;R(!0),P(!1);let X=setTimeout(()=>{ur({search:v,limit:50,offset:0}).then($=>{W.current===E&&(N(Array.isArray($?.items)?$.items:[]),R(!1))}).catch(()=>{W.current===E&&(N([]),P(!0),R(!1))})},Zo);return()=>clearTimeout(X)},[m,v]),H(()=>{if(!m)return;let E=X=>{h.current&&X.target instanceof Node&&!h.current.contains(X.target)&&C(!1)};return document.addEventListener("pointerdown",E),()=>document.removeEventListener("pointerdown",E)},[m]);let oe=E=>{o(E),C(!1),S(""),u.current?.focus()},U=[...s?[{key:"inherit",label:r??"",avatarPath:null,selected:a.kind==="inherit",select:()=>oe({kind:"inherit"})}]:[],{key:"none",label:d,avatarPath:null,selected:a.kind==="none",select:()=>oe({kind:"none"})},...M.map(E=>({key:E.id,label:E.name,avatarPath:E.avatarPath,selected:a.kind==="character"&&a.id===E.id,select:()=>oe({kind:"character",id:E.id,name:E.name,avatarPath:E.avatarPath})}))],Z=U[Math.min(A,Math.max(U.length-1,0))],_=a.kind==="character"?a.name:a.kind==="inherit"?r??"":d,J=E=>{if(E.key==="Escape"){E.stopPropagation(),C(!1),u.current?.focus();return}if(E.key==="ArrowDown"||E.key==="ArrowUp"){if(E.preventDefault(),U.length===0)return;let X=E.key==="ArrowDown"?1:-1;T($=>(Math.min($,U.length-1)+X+U.length)%U.length);return}E.key==="Enter"&&Z&&(E.preventDefault(),Z.select())};return i("div",{className:"ce-search-select",ref:h,children:[i("button",{ref:u,type:"button",className:`mari-chrome-field ce-field ce-search-face${a.kind==="character"?"":" ce-search-face--muted"}`,"aria-haspopup":"listbox","aria-expanded":m,"aria-controls":m?p:void 0,onClick:()=>{C(E=>!E),T(0)},children:[t("span",{className:"ce-sr-only",children:`${l}: `}),a.kind==="character"?t(pr,{name:a.name,avatarPath:a.avatarPath}):null,t("span",{className:"ce-search-face-label",children:_}),t(ma,{className:`ce-icon ce-search-chevron${m?" ce-search-chevron--open":""}`,"aria-hidden":"true"})]}),m?i("div",{className:"ce-search-panel",children:[t("input",{type:"search",role:"combobox","aria-autocomplete":"list","aria-expanded":"true","aria-controls":p,"aria-activedescendant":Z?`${p}-${Z.key}`:void 0,"aria-label":n("cardEditor.dialog.search.placeholder"),className:"mari-chrome-field ce-field",placeholder:n("cardEditor.dialog.search.placeholder"),value:v,autoFocus:!0,onChange:E=>{S(E.target.value),T(0)},onKeyDown:J}),B?t("div",{className:"ce-caption",children:n("cardEditor.dialog.search.loading")}):null,j?t("div",{className:"ce-status ce-status--error",role:"alert",children:n("cardEditor.dialog.search.error")}):null,!B&&!j&&M.length===0?t("div",{className:"ce-caption",children:n("cardEditor.dialog.search.noResults")}):null,t("ul",{className:"ce-search-options",role:"listbox",id:p,"aria-label":l,children:U.map((E,X)=>t("li",{role:"presentation",children:i("button",{type:"button",role:"option",id:`${p}-${E.key}`,"aria-selected":E.selected,className:`ce-search-option${E===Z?" ce-search-option--active":""}`,onMouseEnter:()=>T(X),onClick:E.select,children:[E.key==="inherit"||E.key==="none"?null:t(pr,{name:E.label,avatarPath:E.avatarPath}),t("span",{className:"ce-search-option-name",children:E.label})]})},E.key))})]}):null]})}var hr='button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';function bt(){try{return typeof window>"u"?void 0:window.localStorage}catch{return}}function ve(e,a,o){let s=se(null),l=se(o);l.current=o;let r=se(a);return r.current=a,H(()=>{if(!e)return;let d=document.activeElement instanceof HTMLElement?document.activeElement:null,n=s.current;if(!n)return;let p=requestAnimationFrame(()=>(n.querySelector(hr)??n).focus()),h=u=>{if(u.key==="Escape"){if(u.isComposing||r.current())return;u.preventDefault(),l.current();return}if(u.key!=="Tab")return;let m=[...n.querySelectorAll(hr)];if(!n.contains(document.activeElement)){u.preventDefault(),(m[0]??n).focus();return}if(m.length===0){u.preventDefault(),n.focus();return}let C=m[0],v=m.at(-1);u.shiftKey&&document.activeElement===C?(u.preventDefault(),v.focus()):!u.shiftKey&&document.activeElement===v&&(u.preventDefault(),C.focus())};return document.addEventListener("keydown",h),()=>{cancelAnimationFrame(p),document.removeEventListener("keydown",h),requestAnimationFrame(()=>{d?.isConnected&&d.focus()})}},[e]),s}function je({id:e,label:a,value:o,min:s,max:l,onChange:r}){return i("label",{className:"ce-label",htmlFor:e,children:[t("span",{className:"ce-label-title",children:a}),t("input",{id:e,type:"number",className:"mari-chrome-field ce-field ce-number-input",value:o,min:s,max:l,step:1,inputMode:"numeric",onChange:d=>{if(d.target.value==="")return;let n=Number(d.target.value);Number.isFinite(n)&&r(Math.max(s,Math.min(l,Math.trunc(n))))}})]})}function ye({name:e,value:a,checked:o,onChange:s,title:l,disabled:r}){return i("label",{className:`ce-choice${r?" ce-choice--disabled":""}`,children:[t("input",{type:"radio",name:e,value:a,checked:o,disabled:r,onChange:()=>s(a)}),t("span",{className:"ce-choice-copy",children:t("strong",{children:l})})]})}function gr({localization:e,targets:a,targetsLoading:o,onUpdateTarget:s,onRemoveTarget:l}){let r=(d,n)=>ee(e,d,n);return i("fieldset",{className:"ce-section","data-ce-section":"targets",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.targets.title",{count:a.length})}),o?t("div",{className:"ce-status",children:r("cardEditor.dialog.targets.loading")}):null,!o&&a.length===0?t("p",{className:"ce-caption",children:r("cardEditor.dialog.targets.empty")}):null,t("ul",{className:"ce-targets",children:a.map((d,n)=>i("li",{className:"ce-target",children:[i("div",{className:"ce-target-identity",children:[t("span",{className:"ce-target-avatar","aria-hidden":"true",children:d.avatarPath?t("img",{src:d.avatarPath,alt:"",loading:"lazy"}):d.name.trim().charAt(0)||"?"}),i("span",{className:"ce-target-name",children:[d.name,d.loadError?i("span",{className:"ce-target-load-error",children:[" ",r("cardEditor.dialog.targets.loadFailed")]}):null]})]}),i("div",{className:"ce-target-controls",children:[t("input",{type:"text",className:"mari-chrome-field ce-field",value:d.note,placeholder:r("cardEditor.dialog.targets.notePlaceholder"),"aria-label":r("cardEditor.dialog.targets.noteLabel",{name:d.name}),...n===0?{"data-ce-autofocus":!0}:{},onChange:p=>s(d.characterId,{note:p.target.value})}),t(_a,{localization:e,selection:d.style,onChange:p=>s(d.characterId,{style:p}),allowInherit:!0,buttonLabel:r("cardEditor.dialog.targets.styleLabel",{name:d.name}),inheritLabel:r("cardEditor.dialog.targets.styleSession"),noneLabel:r("cardEditor.dialog.targets.styleNone")})]}),t("button",{type:"button",className:"ce-target-remove","aria-label":r("cardEditor.dialog.targets.remove",{name:d.name}),onClick:()=>l(d.characterId),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]},d.characterId))})]})}var Ct={standard:`You are the Card Editor. You rewrite existing character cards from the user's instruction while preserving each card's voice, facts, and intent.

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
- Preserve {{char}} and {{user}} macros exactly; never resolve, escape, or rename them.`};function xr(e){return e==="standard"||e==="strict"||e==="rebalance"||e==="xml-simple"||e==="xml-complex"}var vt=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions","backstory","appearance"],Lr=/^[A-Za-z_][\w.-]{0,63}$/;var Yo=`<character-name>
    <summary></summary>
    <description></description>
    <personality></personality>
    <backstory></backstory>
    <appearance></appearance>
    <scenario></scenario>
</character-name>`,Qo=`<!-- all freeform text unless attributed; attributed elements use the values given, only one unless stated otherwise -->
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
</character-name>`;function Ir(e,a,o){let s=Va(o);if(!s.ok)throw new Error(`built-in schema ${e} is invalid: ${s.errors[0]?.message}`);return{id:e,name:a,builtIn:!0,root:s.root}}var Vd=[Ir("simple","Simple",Yo),Ir("complex","Complex",Qo)];function es(e){let a=e.split("|").map(s=>s.trim()).filter(Boolean),o=a.length>0&&/^etc\.?$/i.test(a[a.length-1]);return{values:o?a.slice(0,-1):a,open:o}}function Va(e){let a=[],o=m=>e.slice(0,m).split(`
`).length,s=[],l=[],r,d,n=0,p=/<!--([\s\S]*?)-->|<\/\s*([^\s>]+)\s*>|<([^\s/>!]+)((?:\s+[^\s=>]+\s*=\s*"[^"]*")*)\s*(\/?)>|([^<]+)/g,h;for(;h=p.exec(e);){let m=o(h.index),[,C,v,S,M,N,B]=h;if(C!==void 0){let P=C.trim();s.length===0&&l.length===0?d=P:r=P;continue}if(B!==void 0){let P=B.trim();if(!P)continue;let A=s[s.length-1];A?A.hint||(A.hint=P):a.push({line:m,message:"Text outside the root element."});continue}if(v!==void 0){let P=s.pop();P?P.key!==v&&a.push({line:m,message:`Expected </${P.key}> but found </${v}>.`}):a.push({line:m,message:`Closing </${v}> has no opening tag.`});continue}if(S===void 0){a.push({line:m,message:"Unreadable markup."});continue}if(Lr.test(S)||a.push({line:m,message:`"${S}" is not a valid element name.`}),s.length>=8&&a.push({line:m,message:"Nesting deeper than 8 levels."}),++n>200){a.push({line:m,message:"More than 200 elements."});break}let R={key:S,attributes:[],children:[]};r&&(R.hint=r),r=void 0;for(let P of(M??"").matchAll(/([^\s=]+)\s*=\s*"([^"]*)"/g)){let[,A,T]=P;if(A==="max"){let W=Number(T);!Number.isInteger(W)||W<=0?a.push({line:m,message:`max on <${S}> must be a positive whole number.`}):R.maxLength=W}else if(A==="target")vt.includes(T)?R.target=T:a.push({line:m,message:`target="${T}" is not a card field.`});else if(A==="repeat")R.repeat=T==="true";else{Lr.test(A)||a.push({line:m,message:`"${A}" is not a valid attribute name.`}),R.attributes.some(U=>U.name===A)&&a.push({line:m,message:`Attribute "${A}" appears twice on <${S}>.`});let{values:W,open:oe}=es(T);R.attributes.push({name:A,values:W,...oe?{open:!0}:{}})}}R.attributes.some(P=>P.name==="text")&&a.push({line:m,message:`"text" is reserved for element text; rename the attribute on <${R.key}>.`});let j=s[s.length-1];j?(j.children.some(P=>P.key===R.key)&&a.push({line:m,message:`<${R.key}> appears twice under <${j.key}>.`}),j.children.push(R)):l.push(R),N||s.push(R)}for(let m of s)a.push({line:o(e.length),message:`<${m.key}> is never closed.`});l.length!==1&&a.length===0&&a.push({line:1,message:l.length===0?"The schema needs one root element.":"Only one root element is allowed."});let u=l[0];if(u){d&&!u.hint&&(u.hint=d);for(let m of u.children)Cr(m,!0,a);u.children.length===0&&a.length===0&&a.push({line:1,message:"The root needs at least one element."})}return a.length>0||!u?{ok:!1,errors:a}:{ok:!0,root:u}}function Cr(e,a,o){!a&&e.target&&o.push({line:1,message:`target is only allowed on top-level elements (<${e.key}>).`});for(let s of e.children)Cr(s,!1,o)}function br(e,a){let o=e.attributes.map(s=>` ${s.name}="${[...s.values,...s.open?["etc."]:[]].join(" | ")}"`);return a&&(e.maxLength&&o.push(` max="${e.maxLength}"`),e.target&&o.push(` target="${e.target}"`),e.repeat&&o.push(' repeat="true"')),o.join("")}function yt(e,a,o,s){let l="  ".repeat(a),r=a===0&&s?s:e.key,d=e.hint?`${l}<!-- ${e.hint} -->
`:"";if(e.children.length===0)return`${d}${l}<${r}${br(e,o)}></${r}>
`;let n=e.children.map(p=>yt(p,a+1,o)).join("");return`${d}${l}<${r}${br(e,o)}>
${n}${l}</${r}>
`}function ba(e){return yt(e,0,!0).trimEnd()}function Sr(e){let a=e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null;if(!a)throw new Error("schema must be an object");if(typeof a.id!="string"||!a.id.trim()||a.id.length>160)throw new Error("schema.id is required");if(typeof a.name!="string"||!a.name.trim()||a.name.length>120)throw new Error("schema.name is required");let o=typeof a.text=="string"?a.text:ba(vr(a.root,0));if(o.length>5e4)throw new Error("schema text must be at most 50000 characters");let s=Va(o);if(!s.ok)throw new Error(`schema is invalid: line ${s.errors[0].line}: ${s.errors[0].message}`);return{id:a.id.trim(),name:a.name.trim(),...a.builtIn===!0?{builtIn:!0}:{},root:s.root}}function vr(e,a){let o=e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null;if(!o||typeof o.key!="string"||a>8)throw new Error("schema.root is invalid");let s=Array.isArray(o.attributes)?o.attributes:[],l=Array.isArray(o.children)?o.children:[];return{key:o.key,...typeof o.hint=="string"&&o.hint?{hint:o.hint.replace(/--/g,"\u2013")}:{},attributes:s.map(r=>{let d=r;if(typeof d?.name!="string")throw new Error("schema attribute is invalid");let n=Array.isArray(d.values)?d.values.filter(p=>typeof p=="string"):[];return{name:d.name,values:n.map(p=>p.replace(/[|"]/g,"")),...d.open===!0?{open:!0}:{}}}),...typeof o.maxLength=="number"?{maxLength:o.maxLength}:{},...typeof o.target=="string"?{target:o.target}:{},...o.repeat===!0?{repeat:!0}:{},children:l.map(r=>vr(r,a+1))}}function as(e){return[...new Set(e.root.children.map(a=>a.target??"description"))]}function yr(e,a){e.maxLength&&a.push(`Text for ${e.key} must not exceed ${e.maxLength} characters.`);for(let o of e.children)yr(o,a);return a}function wr(e){let a={};for(let s of e.attributes)a[s.name]=s.values.length?`${s.values.join(" | ")}${s.open?" | \u2026":""}`:"";let o;if(e.children.length===0)e.attributes.length===0?o=e.hint??"":o={...a,text:e.hint??""};else{for(let s of e.children)a[s.key]=wr(s);o=a}return e.repeat?[o]:o}function St(e,a){if(a===0){let l=e.children.map(r=>St(r,1)).join(`
`);return`# {{character name}}
${e.hint?`<!-- ${e.hint} -->
`:""}
${l}`.trimEnd()}let o=[`${"#".repeat(Math.min(a+1,6))} ${ts(e.key)}${e.repeat?" (one block per entry)":""}`];e.hint&&o.push(`<!-- ${e.hint} -->`);for(let l of e.attributes)o.push(`- **${l.name}:** ${l.values.length?l.values.join(" | ")+(l.open?" | \u2026":""):"\u2026"}`);e.children.length===0&&o.push("\u2026");let s=e.children.map(l=>St(l,a+1));return[o.join(`
`),...s].join(`

`)}function kr(e,a){let o=yr(e.root,[]),s;a==="json-data"||a==="json"?s=JSON.stringify(wr(e.root),null,2):a==="markdown"?s=St(e.root,0):s=yt(e.root,0,!1).trimEnd();let l=["Attribute values list the allowed vocabulary; pick one unless stated otherwise. An empty value or a trailing \u2026 means freeform.",...a==="xml"?[`Replace the <${e.root.key}> root tag with the character's name in kebab-case.`]:[],...o];return`${s}

${l.join(`
`)}`}function Er(e){let a=e.hint?{description:e.hint}:{},o;if(e.children.length===0&&e.attributes.length===0)o={type:"string",...a,...e.maxLength?{maxLength:e.maxLength}:{}};else{let s={};for(let l of e.attributes)s[l.name]=l.values.length&&!l.open?{type:"string",enum:l.values}:{type:"string",...l.values.length?{description:`e.g. ${l.values.join(", ")}`}:{}};e.children.length===0&&(s.text={type:"string",...e.maxLength?{maxLength:e.maxLength}:{}});for(let l of e.children)s[l.key]=Er(l);o={type:"object",...a,properties:s,required:Object.keys(s),additionalProperties:!1}}return e.repeat?{type:"array",items:o}:o}function Pr(e,a){let o=as(e),s=a==="document"?{type:"object",properties:Object.fromEntries(o.map(l=>[l,{type:"string"}])),required:o,additionalProperties:!1}:Er({...e.root,repeat:!1});return{type:"object",properties:{results:{type:"array",items:{type:"object",properties:{sourceId:{type:"string"},characters:{type:"array",items:{type:"object",properties:{name:{type:"string"},fields:s},required:["name","fields"],additionalProperties:!1}},splitReason:{type:["string","null"]}},required:["sourceId","characters","splitReason"],additionalProperties:!1}}},required:["results"],additionalProperties:!1}}function ts(e){let a=e.replace(/[-_.]+/g," ").trim();return a?a[0].toUpperCase()+a.slice(1):e}var rs=["markdown","xml","json","schema"];function wt(e,a){return a.reduce((o,s)=>o.children[s],e)}function Ca(e,a,o){if(a.length===0)return o(e)??e;let[s,...l]=a,r=e.children.flatMap((d,n)=>{if(n!==s)return[d];if(l.length>0)return[Ca(d,l,o)];let p=o(d);return p?[p]:[]});return{...e,children:r}}function os(e){return e.attributes.map(a=>`${a.name}=${[...a.values,...a.open?["etc."]:[]].join(" | ")}`).join(`
`)}function ss(e){return e.split(`
`).map(a=>a.trim()).filter(Boolean).map(a=>{let[o="",s=""]=a.split("="),l=s.split("|").map(d=>d.trim().replace(/"/g,"")).filter(Boolean),r=l.length>0&&/^etc\.?$/i.test(l[l.length-1]);return{name:o.trim(),values:r?l.slice(0,-1):l,...r?{open:!0}:{}}})}function ls(){return`user-${globalThis.crypto.randomUUID().slice(0,8)}`}function Ar({localization:e,initialSchemaId:a,onClose:o,onSchemasChanged:s}){let l=(f,F)=>ee(e,f,F),[r,d]=c(null),[n,p]=c(!1),[h,u]=c(a??"simple"),[m,C]=c(""),[v,S]=c(null),[M,N]=c(""),[B,R]=c([]),[j,P]=c("builder"),[A,T]=c([]),[W,oe]=c("xml"),[U,Z]=c(!1),[_,J]=c(!1),[E,X]=c(null),[$,pe]=c(!1),me=ve(!0,()=>_,o),b=f=>{u(f.id),C(f.name),S(f.root),N(ba(f.root)),R([]),T(f.root.children.length>0?[0]:[]),Z(!1),pe(!1),X(null)};H(()=>{let f=new AbortController;return Ye(f.signal).then(F=>{d(F);let K=F.find(G=>G.id===a)??F[0];K&&b(K)}).catch(()=>p(!0)),()=>f.abort()},[]);let w=r?.find(f=>f.id===h)??null,k=w?.builtIn===!0,D=B.length===0,re=v?{id:h,name:m||h,root:v}:null,ce=re?W==="schema"?JSON.stringify(Pr(re,"structured"),null,2):kr(re,W):"",be=f=>{S(f),N(ba(f)),Z(!0)},le=f=>{v&&be(Ca(v,A,f))},qe=f=>{N(f),Z(!0);let F=Va(f);F.ok?(S(F.root),R([])):R(F.errors)},Ce=f=>{if(!v)return;let F=wt(v,f),K="new-element";for(let G=2;F.children.some(Y=>Y.key===K);G++)K=`new-element-${G}`;be(Ca(v,f,G=>({...G,children:[...G.children,{key:K,attributes:[],children:[]}]}))),T([...f,F.children.length])},Se=(f,F)=>{if(!v||f.length===0)return;let K=f.slice(0,-1),G=f[f.length-1],Y=G+F,he=wt(v,K);Y<0||Y>=he.children.length||(be(Ca(v,K,Le=>{let Pe=[...Le.children];return[Pe[G],Pe[Y]]=[Pe[Y],Pe[G]],{...Le,children:Pe}})),T([...K,Y]))},we=f=>{!v||f.length===0||(be(Ca(v,f,()=>null)),T(f.slice(0,-1)))},g=async f=>{if(!(!v||!D||_)){J(!0),X(null);try{let F=f||k?ls():h,K=(f||k?l("cardEditor.schemas.copyName",{name:m}):m).trim()||F,G=await Kt({id:F,name:K.slice(0,120),text:ba(v)}),Y=await Ye();d(Y),b(Y.find(he=>he.id===G.id)??G),s(Y,G.id)}catch(F){X(F instanceof Error?F.message:String(F))}finally{J(!1)}}},I=async()=>{if(!(!w||k||_)){J(!0);try{await Jt(w.id);let f=await Ye();d(f),f[0]&&b(f[0]),s(f,f[0]?.id??"simple")}catch(f){X(f instanceof Error?f.message:String(f))}finally{J(!1)}}},y=v?wt(v,A):null,q=A.length===1,V=(f,F,K)=>{let G=F.join(".")===A.join("."),Y=f.target??(K===1?"description":null);return i("li",{className:"ce-schema-node",style:{"--ce-depth":Math.min(K,4)},children:[i("button",{type:"button",className:`ce-schema-node-head${G?" ce-schema-node-head--selected":""}`,"aria-pressed":G,onClick:()=>T(F),children:[t("code",{className:"ce-schema-key",children:`<${f.key}>`}),f.children.length>0?t("span",{className:"ce-chip",children:l("cardEditor.schemas.kindGroup")}):f.attributes.some(he=>he.values.length>0)?t("span",{className:"ce-chip",children:l("cardEditor.schemas.kindVocab")}):null,f.repeat?t("span",{className:"ce-chip",children:l("cardEditor.schemas.kindRepeat")}):null,f.maxLength?t("span",{className:"ce-chip",children:l("cardEditor.schemas.maxChip",{max:f.maxLength})}):null,Y?t("span",{className:"ce-chip ce-chip--ok",children:l("cardEditor.schemas.targetChip",{field:Y})}):null,f.hint?t("span",{className:"ce-schema-hint",children:f.hint}):null]}),f.children.length>0?t("ul",{className:"ce-schema-tree",children:f.children.map((he,Le)=>V(he,[...F,Le],K+1))}):null]},F.join(".")||"root")};return t("div",{className:"ce-overlay",role:"presentation",onClick:()=>_?void 0:o(),children:i("section",{ref:me,className:"ce-dialog ce-shell ce-studio",role:"dialog","aria-modal":"true","aria-label":l("cardEditor.schemas.title"),tabIndex:-1,onClick:f=>f.stopPropagation(),children:[i("div",{className:"ce-dialog-head",children:[t("strong",{children:l("cardEditor.schemas.title")}),t("button",{type:"button",className:"ce-dialog-close",onClick:o,disabled:_,"aria-label":l("cardEditor.schemas.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),n?t("div",{className:"ce-status ce-status--error",role:"alert",children:l("cardEditor.schemas.loadError")}):null,i("div",{className:"ce-studio-body",children:[t("nav",{className:"ce-studio-list","aria-label":l("cardEditor.schemas.listLabel"),children:(r??[]).map(f=>i("button",{type:"button",className:"ce-studio-list-item","aria-pressed":f.id===h,onClick:()=>b(f),children:[t("strong",{children:f.name}),t("small",{children:f.builtIn?l("cardEditor.schemas.builtIn"):l("cardEditor.schemas.yours")})]},f.id))}),i("div",{className:"ce-studio-edit",children:[i("div",{className:"ce-studio-bar",children:[i("div",{className:"ce-segmented",role:"radiogroup","aria-label":l("cardEditor.schemas.modeLabel"),children:[t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":j==="builder",disabled:!D,onClick:()=>P("builder"),children:l("cardEditor.schemas.modeBuilder")}),t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":j==="text",onClick:()=>P("text"),children:l("cardEditor.schemas.modeText")})]}),t("span",{className:`ce-caption${D?"":" ce-item-failure"}`,role:"status",children:D?l("cardEditor.schemas.valid"):l("cardEditor.schemas.invalid",{line:B[0].line,message:B[0].message})})]}),j==="text"?t("textarea",{className:"mari-chrome-field ce-field ce-studio-text",value:M,spellCheck:!1,"aria-label":l("cardEditor.schemas.textLabel"),onChange:f=>qe(f.target.value)}):v?i(Oe,{children:[t("div",{className:"ce-studio-tree",children:t("ul",{className:"ce-schema-tree",children:V(v,[],0)})}),y?i("div",{className:"ce-studio-inspector",children:[i("label",{className:"ce-label",htmlFor:"ce-node-key",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeKey")}),t("input",{id:"ce-node-key",className:"mari-chrome-field ce-field",value:y.key,onChange:f=>le(F=>({...F,key:f.target.value.replace(/[^\w.-]/g,"-")||"element"}))})]}),i("label",{className:"ce-label",htmlFor:"ce-node-target",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeTarget")}),i("select",{id:"ce-node-target",className:"mari-chrome-field ce-field",value:y.target??"",disabled:!q,onChange:f=>le(F=>{let{target:K,...G}=F;return f.target.value?{...G,target:f.target.value}:G}),children:[t("option",{value:"",children:l(q?"cardEditor.schemas.targetDefault":"cardEditor.schemas.targetInherit")}),vt.filter(f=>f!=="description").map(f=>t("option",{value:f,children:f},f))]})]}),i("label",{className:"ce-label ce-studio-wide",htmlFor:"ce-node-hint",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeHint")}),t("input",{id:"ce-node-hint",className:"mari-chrome-field ce-field",value:y.hint??"",placeholder:l("cardEditor.schemas.nodeHintPlaceholder"),onChange:f=>le(F=>{let{hint:K,...G}=F,Y=f.target.value.replace(/--/g,"\u2013");return Y?{...G,hint:Y}:G})})]}),i("label",{className:"ce-label ce-studio-wide",htmlFor:"ce-node-attributes",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeAttributes")}),t("textarea",{id:"ce-node-attributes",className:"mari-chrome-field ce-field ce-textarea",rows:2,spellCheck:!1,defaultValue:os(y),onBlur:f=>le(F=>({...F,attributes:ss(f.target.value)}))},`${A.join(".")}:${h}`),t("small",{children:l("cardEditor.schemas.nodeAttributesHint")})]}),i("label",{className:"ce-label",htmlFor:"ce-node-max",children:[t("span",{className:"ce-label-title",children:l("cardEditor.schemas.nodeMax")}),t("input",{id:"ce-node-max",type:"number",min:0,className:"mari-chrome-field ce-field ce-number-input",value:y.maxLength??"",disabled:y.children.length>0,placeholder:l("cardEditor.schemas.nodeMaxNone"),onChange:f=>le(F=>{let{maxLength:K,...G}=F,Y=Math.trunc(Number(f.target.value));return Y>0?{...G,maxLength:Y}:G})})]}),i("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:y.repeat===!0,disabled:A.length===0,onChange:f=>le(F=>{let{repeat:K,...G}=F;return f.target.checked?{...G,repeat:!0}:G})}),t("span",{className:"ce-choice-copy",children:t("strong",{children:l("cardEditor.schemas.nodeRepeat")})})]}),i("div",{className:"ce-studio-node-actions ce-studio-wide",children:[i("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>Ce(A),children:[t(pa,{className:"ce-icon","aria-hidden":"true"}),l("cardEditor.schemas.addChild")]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A.length===0,"aria-label":l("cardEditor.schemas.moveUp"),onClick:()=>Se(A,-1),children:t(We,{className:"ce-icon","aria-hidden":"true"})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A.length===0,"aria-label":l("cardEditor.schemas.moveDown"),onClick:()=>Se(A,1),children:t(Ge,{className:"ce-icon","aria-hidden":"true"})}),i("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:A.length===0,onClick:()=>we(A),children:[t(ga,{className:"ce-icon","aria-hidden":"true"}),l("cardEditor.schemas.removeNode")]})]})]}):null]}):null]}),i("div",{className:"ce-studio-preview",children:[t("div",{className:"ce-studio-bar",children:t("div",{className:"ce-segmented",role:"radiogroup","aria-label":l("cardEditor.schemas.previewLabel"),children:rs.map(f=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":W===f,onClick:()=>oe(f),children:l(`cardEditor.schemas.preview.${f}`)},f))})}),t("pre",{className:"ce-studio-pre",tabIndex:0,"aria-label":l("cardEditor.schemas.previewLabel"),children:ce}),t("p",{className:"ce-caption",children:l(`cardEditor.schemas.previewHint.${W}`)})]})]}),i("div",{className:"ce-dialog-foot",children:[E?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:E}):null,i("label",{className:"ce-label ce-studio-name",htmlFor:"ce-schema-name",children:[t("span",{className:"ce-sr-only",children:l("cardEditor.schemas.name")}),t("input",{id:"ce-schema-name",className:"mari-chrome-field ce-field",value:m,disabled:k,placeholder:l("cardEditor.schemas.name"),onChange:f=>{C(f.target.value),Z(!0)}})]}),!k&&w?$?i("span",{className:"ce-confirm-strip",role:"group","aria-label":l("cardEditor.schemas.delete"),children:[t("span",{className:"ce-caption",children:l("cardEditor.schemas.deleteConfirm",{name:w.name})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:_,onClick:()=>{I()},children:l("cardEditor.schemas.deleteYes")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>pe(!1),children:l("cardEditor.schemas.deleteNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:_,onClick:()=>pe(!0),children:l("cardEditor.schemas.delete")}):null,t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:_||!D||!v,onClick:()=>{g(!0)},children:l("cardEditor.schemas.duplicate")}),k?null:t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:_||!D||!v||!U,onClick:()=>{g(!1)},children:l("cardEditor.schemas.save")})]})]})})}var ds=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions","backstory","appearance"],ne=class extends Error{constructor(a){super(a),this.name="SchemaError"}};var ei=new Set(ds);function Wa(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null}function Ke(e,a,o,s){if(e===void 0)return a;if(typeof e=="string"&&o.includes(e))return e;throw new ne(`${s} is invalid`)}function Mr(e,a,o){if(e===void 0)return a;if(typeof e=="string")return e;throw new ne(`${o} must be a string`)}function Sa(e,a,o){if(e===void 0)return;if(typeof e!="string")throw new ne(`${a} must be a string`);if(e.length>300)throw new ne(`${a} must be at most 300 characters`);let s=o?e:e.trim();if(!s.trim())throw new ne(`${a} must not be blank`);return s}function Rr(e,a){if(e==null)return null;if(typeof e=="string")return e;throw new ne(`${a} must be a string or null`)}function Ga(e,a,o,s,l){if(e===void 0)return a;if(typeof e!="number"||!Number.isFinite(e))throw new ne(`${l} must be a finite number`);return Math.max(o,Math.min(s,Math.trunc(e)))}var is=["markdown","xml","json"];function Tr(e,a){let o=Wa(e);if(!o)throw new ne(`${a} must be an object`);let s;try{s=Sr(o.schema)}catch(l){throw new ne(`${a}.schema: ${l instanceof Error?l.message:String(l)}`)}return{schema:s,format:Ke(o.format,"xml",is,`${a}.format`)}}function ns(e){let a=Wa(e);if(!a)throw new ne("transform settings are required for the transform task");let o=Tr(a,"transform"),s;if(a.phase2!==void 0){let l=Wa(a.phase2);if(!l)throw new ne("transform.phase2 must be an object");if(l.enabled!==void 0&&typeof l.enabled!="boolean")throw new ne("transform.phase2.enabled must be a boolean");if(l.allowSplits!==void 0&&typeof l.allowSplits!="boolean")throw new ne("transform.phase2.allowSplits must be a boolean");s={enabled:l.enabled===!0,instruction:Mr(l.instruction,"","transform.phase2.instruction"),allowSplits:l.allowSplits===!0,...l.override===void 0||l.override===null?{}:{override:Tr(l.override,"transform.phase2.override")}}}if(a.structuredOutput!==void 0&&typeof a.structuredOutput!="boolean")throw new ne("transform.structuredOutput must be a boolean");return{...o,outputMode:Ke(a.outputMode,"structured",["structured","document"],"transform.outputMode"),multiCharacter:Ke(a.multiCharacter,"split",["split","merge"],"transform.multiCharacter"),structuredOutput:a.structuredOutput!==!1,...s===void 0?{}:{phase2:s}}}function $a(e){let a=Wa(e);if(!a)throw new ne("session config must be an object");if(a.globalLorebookIds!==void 0&&!Array.isArray(a.globalLorebookIds))throw new ne("globalLorebookIds must be an array of strings");let o=a.globalLorebookIds??[];if(!o.every(m=>typeof m=="string"))throw new ne("globalLorebookIds must be an array of strings");if(a.rebalance!==void 0&&typeof a.rebalance!="boolean")throw new ne("rebalance must be a boolean");if(a.customTemplate!==void 0&&typeof a.customTemplate!="string")throw new ne("customTemplate must be a string");let s=Sa(a.duplicatePrefix,"duplicatePrefix",!0),l=Sa(a.duplicateSuffix,"duplicateSuffix",!0),r=Sa(a.duplicateRemovePrefix,"duplicateRemovePrefix",!0),d=Sa(a.duplicateRemoveSuffix,"duplicateRemoveSuffix",!0),n=Sa(a.combinedCardName,"combinedCardName",!1),p=Ke(a.saveMode,"confirm",["confirm","auto","duplicate","combined"],"saveMode");if(p==="combined"&&n===void 0)throw new ne("combinedCardName is required when saveMode is combined");let h=Ke(a.presetId,"standard",["standard","strict","rebalance","xml-simple","xml-complex","custom","transform"],"presetId"),u=h==="transform"?ns(a.transform):void 0;return{mode:Ke(a.mode,"individual",["individual","batched"],"mode"),batchSize:Ga(a.batchSize,4,1,16,"batchSize"),connectionId:Rr(a.connectionId,"connectionId"),presetId:h,...a.customTemplate===void 0?{}:{customTemplate:a.customTemplate},...u===void 0?{}:{transform:u},globalInstruction:Mr(a.globalInstruction,"","globalInstruction"),behaviorCharacterId:Rr(a.behaviorCharacterId,"behaviorCharacterId"),globalLorebookIds:[...o],rebalance:a.rebalance??!1,providerRetries:Ga(a.providerRetries,2,0,5,"providerRetries"),refusalRetries:Ga(a.refusalRetries,3,0,5,"refusalRetries"),concurrency:Ga(a.concurrency,1,1,16,"concurrency"),saveMode:p,completionMode:Ke(a.completionMode,"ask",["ask","apply","duplicate"],"completionMode"),...s===void 0?{}:{duplicatePrefix:s},...l===void 0?{}:{duplicateSuffix:l},...r===void 0?{}:{duplicateRemovePrefix:r},...d===void 0?{}:{duplicateRemoveSuffix:d},...n===void 0?{}:{combinedCardName:n}}}var Nr="cardEditor.bulkConfig";function Br(e){if(!e)return null;let a=null;try{a=e.getItem(Nr)}catch{return null}if(!a)return null;try{return $a(JSON.parse(a))}catch{return null}}function Dr(e,a){if(a)try{a.setItem(Nr,JSON.stringify(e))}catch{}}function Fr(e,a){let o=Number.isFinite(e)?Math.max(0,Math.trunc(e)):0,s=Number.isFinite(a)?Math.max(1,Math.min(16,Math.trunc(a))):4;return{batched:o===0?0:Math.ceil(o/s),individual:o}}var us={schemaId:"simple",format:"xml",outputMode:"structured",multiCharacter:"split",phase2Enabled:!1,phase2Instruction:"",phase2AllowSplits:!1,phase2SchemaId:null,phase2Format:null},Or=["markdown","xml","json"];function qr(e){return e?{schemaId:e.schema.id,format:e.format,outputMode:e.outputMode,multiCharacter:e.multiCharacter,phase2Enabled:e.phase2?.enabled===!0,phase2Instruction:e.phase2?.instruction??"",phase2AllowSplits:e.phase2?.allowSplits===!0,phase2SchemaId:e.phase2?.override?.schema.id??null,phase2Format:e.phase2?.override?.format??null}:{...us}}function Hr(e,a,o){let s=a.find(d=>d.id===e.schemaId)??a[0];if(!s)return null;let l=e.phase2SchemaId?a.find(d=>d.id===e.phase2SchemaId):void 0,r=e.phase2SchemaId||e.phase2Format?{schema:l??s,format:e.phase2Format??e.format}:void 0;return{schema:s,format:e.format,outputMode:e.outputMode,multiCharacter:e.multiCharacter,structuredOutput:o,...e.phase2Enabled?{phase2:{enabled:!0,instruction:e.phase2Instruction,allowSplits:e.phase2AllowSplits,...r?{override:r}:{}}}:{}}}function Ur({localization:e,draft:a,schemas:o,schemasError:s,agentStructuredOutput:l,onChange:r,onEditSchemas:d}){let n=(u,m)=>ee(e,u,m),p=(o??[]).map(u=>t("option",{value:u.id,children:u.builtIn?n("cardEditor.transform.schemaBuiltIn",{name:u.name}):u.name},u.id)),h=u=>n(`cardEditor.transform.format.${u}`);return i("fieldset",{className:"ce-section","data-ce-section":"transform",children:[t("legend",{className:"ce-section-heading",children:n("cardEditor.transform.title")}),i("div",{className:"ce-transform-row",children:[i("label",{className:"ce-label",htmlFor:"ce-transform-schema",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.schema")}),i("span",{className:"ce-inline-controls",children:[t("select",{id:"ce-transform-schema",className:"mari-chrome-field ce-field",value:a.schemaId,disabled:!o,onChange:u=>r({schemaId:u.target.value}),children:p}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:d,children:n("cardEditor.transform.editSchemas")})]})]}),i("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.formatLabel")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":n("cardEditor.transform.formatLabel"),children:Or.map(u=>t("button",{type:"button",role:"radio","aria-checked":a.format===u,className:"ce-segment",onClick:()=>r({format:u}),children:h(u)},u))})]})]}),s?t("div",{className:"ce-status ce-status--error",role:"alert",children:n("cardEditor.transform.schemasError")}):null,i("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.multiTitle")}),i("div",{className:"ce-choice-list",children:[t(ye,{name:"ce-multi",value:"merge",checked:a.multiCharacter==="merge",onChange:()=>r({multiCharacter:"merge"}),title:n("cardEditor.transform.multiMerge")}),t(ye,{name:"ce-multi",value:"split",checked:a.multiCharacter==="split",onChange:()=>r({multiCharacter:"split"}),title:n("cardEditor.transform.multiSplit")})]}),t("small",{children:a.multiCharacter==="split"?n("cardEditor.transform.multiSplitHint"):n("cardEditor.transform.multiMergeHint")})]}),i("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.outputModeTitle")}),i("div",{className:"ce-choice-list",children:[t(ye,{name:"ce-output-mode",value:"structured",checked:a.outputMode==="structured",onChange:()=>r({outputMode:"structured"}),title:n("cardEditor.transform.outputStructured")}),t(ye,{name:"ce-output-mode",value:"document",checked:a.outputMode==="document",onChange:()=>r({outputMode:"document"}),title:n("cardEditor.transform.outputDocument")})]}),t("small",{children:a.outputMode==="structured"?n("cardEditor.transform.outputStructuredHint",{format:h(a.format)}):n("cardEditor.transform.outputDocumentHint")})]}),t("p",{className:"ce-caption",role:"status",children:n(l===null?"cardEditor.transform.providerJsonUnknown":l?"cardEditor.transform.providerJsonOn":"cardEditor.transform.providerJsonOff")}),i("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:a.phase2Enabled,onChange:u=>r({phase2Enabled:u.target.checked})}),i("span",{className:"ce-choice-copy",children:[t("strong",{children:n("cardEditor.transform.phase2")}),t("small",{children:n("cardEditor.transform.phase2Hint")})]})]}),a.phase2Enabled?i("div",{className:"ce-phase2-box",children:[i("label",{className:"ce-label",htmlFor:"ce-phase2-instruction",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.phase2Instruction")}),t("textarea",{id:"ce-phase2-instruction",className:"mari-chrome-field ce-field ce-textarea",value:a.phase2Instruction,placeholder:n("cardEditor.transform.phase2InstructionPlaceholder"),onChange:u=>r({phase2Instruction:u.target.value})})]}),i("div",{className:"ce-transform-row",children:[i("label",{className:"ce-label",htmlFor:"ce-phase2-schema",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.phase2Schema")}),i("select",{id:"ce-phase2-schema",className:"mari-chrome-field ce-field",value:a.phase2SchemaId??"",onChange:u=>r({phase2SchemaId:u.target.value||null}),children:[t("option",{value:"",children:n("cardEditor.transform.sameAsPhase1")}),p]})]}),i("label",{className:"ce-label",htmlFor:"ce-phase2-format",children:[t("span",{className:"ce-label-title",children:n("cardEditor.transform.formatLabel")}),i("select",{id:"ce-phase2-format",className:"mari-chrome-field ce-field",value:a.phase2Format??"",onChange:u=>r({phase2Format:u.target.value||null}),children:[t("option",{value:"",children:n("cardEditor.transform.sameAsPhase1")}),Or.map(u=>t("option",{value:u,children:h(u)},u))]})]})]}),i("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:a.phase2AllowSplits,disabled:a.multiCharacter!=="split",onChange:u=>r({phase2AllowSplits:u.target.checked})}),t("span",{className:"ce-choice-copy",children:t("strong",{children:n("cardEditor.transform.phase2AllowSplits")})})]})]}):null]})}function zr({localization:e,characterIds:a,prefill:o,onClose:s,onDispatched:l}){let r=(x,z)=>ee(e,x,z),[d,n]=c([]),[p,h]=c(!0),[u,m]=c(null),[C,v]=c(!1),[S,M]=c(null),[N,B]=c(!1),[R,j]=c(""),[P]=c(()=>Br(bt())),[A,T]=c(P?.mode??"individual"),[W,oe]=c(P?.batchSize??4),[U,Z]=c(P?.connectionId??null),[_,J]=c(o?.presetId??P?.presetId??"standard"),[E,X]=c(P?.customTemplate??""),[$,pe]=c(o?.globalInstruction??P?.globalInstruction??""),[me,b]=c({kind:"none"}),[w,k]=c(P?.globalLorebookIds??[]),[D,re]=c(P?.rebalance??!1),[ce,be]=c(P?.providerRetries??2),[le,qe]=c(P?.refusalRetries??3),[Ce,Se]=c(P?.concurrency??1),[we,g]=c(P?.completionMode??"ask"),[I,y]=c(o?.saveMode??P?.saveMode??"confirm"),[q,V]=c(o?.duplicatePrefix??P?.duplicatePrefix??""),[f,F]=c(P?.duplicateSuffix??" (Edited)"),[K,G]=c(P?.duplicateRemovePrefix??""),[Y,he]=c(P?.duplicateRemoveSuffix??""),[Le,Pe]=c(o?.combinedCardName??(o?.label?`${o.label} \u2014 Cast`:P?.combinedCardName??"")),[Je,He]=c(()=>({...qr(P?.transform),...o?.schemaId?{schemaId:o.schemaId}:{},...o?.format?{format:o.format}:{}})),[ge,Ue]=c(null),[Te,tt]=c(!1),[L,Q]=c(null),[ae,ke]=c(!1),[Me,wa]=c(!1),[la,da]=c(null),[ka,Ea]=c(null),ze=ve(!ae,()=>Me,s),Ne=_==="transform";H(()=>{if(!Ne||ge!==null)return;let x=new AbortController;return Ye(x.signal).then(z=>{Ue(z),He(te=>z.some(xe=>xe.id===te.schemaId)?te:{...te,schemaId:z[0]?.id??"simple"})}).catch(()=>tt(!0)),Zt(x.signal).then(z=>Q(z.structuredOutput)).catch(()=>{}),()=>x.abort()},[Ne,ge]);let[rt]=c(()=>[...new Set(a)]);H(()=>{let x=!1,z=new AbortController;return h(!0),Promise.allSettled(rt.map(te=>Fe(te,z.signal))).then(te=>{x||(n(te.map((xe,Pa)=>{let na=rt[Pa];return xe.status==="fulfilled"?{characterId:na,name:xe.value.name,avatarPath:xe.value.avatarPath,card:xe.value.fields,note:"",style:{kind:"inherit"},loadError:!1}:{characterId:na,name:na,avatarPath:null,card:null,note:"",style:{kind:"inherit"},loadError:!0}})),h(!1))}),()=>{x=!0,z.abort()}},[rt]),H(()=>{let x=new AbortController;return or(x.signal).then(z=>m(z)).catch(()=>v(!0)),()=>x.abort()},[]),H(()=>{let x=new AbortController;return cr(x.signal).then(z=>M(z)).catch(()=>B(!0)),()=>x.abort()},[]),H(()=>{let x=P?.behaviorCharacterId;if(!x)return;let z=!1;return sr(x).then(te=>{z||b({kind:"character",id:te.id,name:te.name,avatarPath:te.avatarPath})}).catch(()=>{}),()=>{z=!0}},[P]),H(()=>{if(p)return;let x=ze.current,z=x?.querySelector("[data-ce-autofocus]");if(!x||!z)return;let te=document.activeElement;(!te||te===document.body||te instanceof HTMLElement&&te.classList.contains("ce-dialog-close")||te===x)&&z.focus()},[p,ze]);let Co=x=>{x==="custom"&&_!=="custom"&&(!E.trim()||Object.values(Ct).includes(E))&&xr(_)&&X(Ct[_]),J(x)},So=(x,z)=>n(te=>te.map(xe=>xe.characterId===x?{...xe,...z}:xe)),vo=x=>n(z=>z.filter(te=>te.characterId!==x)),ot=(S??[]).filter(x=>!R.trim()||x.name.toLocaleLowerCase().includes(R.trim().toLocaleLowerCase())),Mt=Fr(d.length,W),st=d.some(x=>x.loadError||!x.card),lt=I==="combined"&&Le.trim().length===0,Nt=Ne&&(ge===null||ge.length===0),yo=Ua(d[0]?.name??"Character",{prefix:q,suffix:f,removePrefix:K,removeSuffix:Y});H(()=>{let x=!1;return Na().then(z=>{x||Ea(z)}).catch(()=>{}),()=>{x=!0}},[]);let _e=ka?.disableAutoVerdicts===!0;H(()=>{_e&&(y(x=>x==="auto"?"confirm":x),g(x=>x==="ask"?x:"ask"))},[_e]);let dt=(u?.find(x=>x.id===U)??u?.find(x=>x.defaultForAgents)??u?.find(x=>x.isDefault)??null)?.maxParallelJobs,Bt=typeof dt=="number"&&Number.isFinite(dt)?Math.min(16,Math.max(1,Math.trunc(dt))):4,Dt=ka?.maxParallelAgents??null,ia=Dt===null?Bt:Math.min(Bt,Dt);H(()=>{Se(x=>Math.min(x,ia))},[ia]);let Ft=P?.concurrency!==void 0,Ot=se(!1);H(()=>{Ft||Ot.current||u===null&&!C||(Ot.current=!0,Se(ia))},[Ft,u,C,ia]);let wo=async()=>{if(Me||d.length===0||st||lt||Nt)return;wa(!0),da(null);let x=$a({...Ne?{transform:Hr(Je,ge??[],L!==!1)}:{},mode:A,batchSize:W,connectionId:U,presetId:_,..._==="custom"?{customTemplate:E}:{},globalInstruction:$,behaviorCharacterId:me.kind==="character"?me.id:null,globalLorebookIds:w,rebalance:D,providerRetries:ce,refusalRetries:le,concurrency:Ce,saveMode:I,completionMode:we,...q.trim()?{duplicatePrefix:q}:{},...f.trim()?{duplicateSuffix:f}:{},...K.trim()?{duplicateRemovePrefix:K}:{},...Y.trim()?{duplicateRemoveSuffix:Y}:{},...I==="combined"?{combinedCardName:Le.trim()}:{}});try{let z=[...new Set(d.flatMap(fe=>fe.style.kind==="character"?[fe.style.id]:[]))],[te,xe,Pa]=await Promise.all([Promise.all(z.map(fe=>Fe(fe))),me.kind==="character"?Fe(me.id):Promise.resolve(null),Promise.all(w.map(async fe=>({name:(S??[]).find(Eo=>Eo.id===fe)?.name??fe,entries:await lr(fe)})))]),na=new Map(te.map((fe,qt)=>[z[qt],fe])),ko=await $t({targets:d.map(fe=>({characterId:fe.characterId,characterName:fe.name,card:fe.card,...fe.note.trim()?{note:fe.note.trim()}:{},...fe.style.kind==="none"?{behaviorOverride:null}:fe.style.kind==="character"?{behaviorOverride:fe.style.id,behaviorOverrideCard:xt(na.get(fe.style.id))}:{}})),config:x,...o?.label?.trim()?{label:o.label.trim().slice(0,200)}:{},...Pa.length>0?{lorebooks:Pa}:{},...xe?{behaviorCharacter:xt(xe)}:{}});Dr(x,bt()),l(ko)}catch(z){da(z instanceof Error?z.message:String(z)),wa(!1)}};return i("div",{className:"ce-overlay",role:"presentation",onClick:()=>{Me||s()},children:[i("section",{ref:ze,className:"ce-dialog ce-shell",role:"dialog","aria-modal":"true","aria-label":r("cardEditor.dialog.title"),tabIndex:-1,onClick:x=>x.stopPropagation(),children:[i("div",{className:"ce-dialog-head",children:[t("strong",{children:r("cardEditor.dialog.title")}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:Me,"aria-label":r("cardEditor.dialog.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),i("div",{className:"ce-dialog-body",children:[t(gr,{localization:e,targets:d,targetsLoading:p,onUpdateTarget:So,onRemoveTarget:vo}),i("fieldset",{className:"ce-section","data-ce-section":"model",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.model.title")}),i("label",{className:"ce-label",htmlFor:"ce-connection",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.model.connection")}),i("select",{id:"ce-connection",className:"mari-chrome-field ce-field",value:U??"","data-ce-autofocus":!0,onChange:x=>Z(x.target.value||null),children:[t("option",{value:"",children:r("cardEditor.dialog.model.connectionDefault")}),(u??[]).map(x=>t("option",{value:x.id,children:x.model?`${x.name} \xB7 ${x.model}`:x.name},x.id))]})]}),u===null&&!C?t("p",{className:"ce-caption",children:r("cardEditor.dialog.model.connectionsLoading")}):null,C?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.dialog.model.connectionsError")}):null,i("label",{className:"ce-label",htmlFor:"ce-preset",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.model.preset")}),i("select",{id:"ce-preset",className:"mari-chrome-field ce-field",value:_,onChange:x=>Co(x.target.value),children:[t("option",{value:"transform",children:r("cardEditor.dialog.model.presetTransform")}),t("option",{value:"standard",children:r("cardEditor.dialog.model.presetStandard")}),t("option",{value:"strict",children:r("cardEditor.dialog.model.presetStrict")}),t("option",{value:"rebalance",children:r("cardEditor.dialog.model.presetRebalance")}),t("option",{value:"xml-simple",children:r("cardEditor.dialog.model.presetXmlSimple")}),t("option",{value:"xml-complex",children:r("cardEditor.dialog.model.presetXmlComplex")}),t("option",{value:"custom",children:r("cardEditor.dialog.model.presetCustom")})]})]}),_==="custom"?i("label",{className:"ce-label",htmlFor:"ce-custom-template",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.model.customTemplate")}),t("textarea",{id:"ce-custom-template",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:E,onChange:x=>X(x.target.value)}),t("small",{children:r("cardEditor.dialog.model.customTemplateHint")})]}):null]}),Ne?t(Ur,{localization:e,draft:Je,schemas:ge,schemasError:Te,agentStructuredOutput:L,onChange:x=>He(z=>({...z,...x})),onEditSchemas:()=>ke(!0)}):null,i("fieldset",{className:"ce-section","data-ce-section":"instructions",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.instructions.title")}),i("label",{className:"ce-label",htmlFor:"ce-global-instruction",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.instructions.global")}),t("textarea",{id:"ce-global-instruction",className:"mari-chrome-field ce-field ce-textarea",value:$,placeholder:r("cardEditor.dialog.instructions.globalPlaceholder"),onChange:x=>pe(x.target.value)})]}),i("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.instructions.behavior")}),t(_a,{localization:e,selection:me,onChange:b,buttonLabel:r("cardEditor.dialog.instructions.behavior"),noneLabel:r("cardEditor.dialog.instructions.behaviorNone")}),t("small",{children:r("cardEditor.dialog.instructions.behaviorHint")})]}),i("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.instructions.lorebooks")}),t("input",{type:"search",className:"mari-chrome-field ce-field",value:R,placeholder:r("cardEditor.dialog.instructions.lorebooksFilter"),"aria-label":r("cardEditor.dialog.instructions.lorebooksFilter"),onChange:x=>j(x.target.value)}),S===null&&!N?t("p",{className:"ce-caption",children:r("cardEditor.dialog.instructions.lorebooksLoading")}):null,N?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.dialog.instructions.lorebooksError")}):null,S!==null&&S.length===0?t("p",{className:"ce-caption",children:r("cardEditor.dialog.instructions.lorebooksEmpty")}):null,S!==null&&S.length>0&&ot.length===0?t("p",{className:"ce-caption",children:r("cardEditor.dialog.instructions.lorebooksNoneMatch")}):null,ot.length>0?t("div",{className:"ce-lorebook-list",children:ot.map(x=>i("label",{className:"ce-lorebook",children:[t("input",{type:"checkbox",checked:w.includes(x.id),onChange:z=>k(te=>z.target.checked?[...new Set([...te,x.id])]:te.filter(xe=>xe!==x.id))}),t("span",{className:"ce-lorebook-name",children:x.name})]},x.id))}):null,t("small",{children:r("cardEditor.dialog.instructions.lorebooksHint")})]})]}),i("fieldset",{className:"ce-section","data-ce-section":"processing",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.processing.title")}),i("div",{className:"ce-choice-list",children:[t(ye,{name:"ce-mode",value:"individual",checked:A==="individual",onChange:()=>T("individual"),title:r("cardEditor.dialog.processing.modeIndividual")}),t(ye,{name:"ce-mode",value:"batched",checked:A==="batched",onChange:()=>T("batched"),title:r("cardEditor.dialog.processing.modeBatched")})]}),i("div",{className:"ce-number-grid",children:[t(je,{id:"ce-batch-size",label:r("cardEditor.dialog.processing.batchSize"),value:W,min:1,max:16,onChange:oe}),t(je,{id:"ce-provider-retries",label:r("cardEditor.dialog.processing.providerRetries"),value:ce,min:0,max:5,onChange:be}),t(je,{id:"ce-refusal-retries",label:r("cardEditor.dialog.processing.refusalRetries"),value:le,min:0,max:5,onChange:qe}),t(je,{id:"ce-concurrency",label:r("cardEditor.dialog.processing.concurrency"),value:Ce,min:1,max:ia,onChange:Se})]}),Ne?null:i("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:D,onChange:x=>re(x.target.checked)}),i("span",{className:"ce-choice-copy",children:[t("strong",{children:r("cardEditor.dialog.processing.rebalance")}),t("small",{children:r("cardEditor.dialog.processing.rebalanceHint")})]})]}),i("label",{className:"ce-label",htmlFor:"ce-completion-mode",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.processing.completionMode")}),i("select",{id:"ce-completion-mode",className:"mari-chrome-field ce-field",value:we,onChange:x=>g(x.target.value),children:[t("option",{value:"ask",children:r("cardEditor.dialog.processing.completionAsk")}),t("option",{value:"apply",disabled:_e,children:r("cardEditor.dialog.processing.completionApply")}),t("option",{value:"duplicate",disabled:_e,children:r("cardEditor.dialog.processing.completionDuplicate")})]}),_e?t("small",{children:r("cardEditor.dialog.processing.autoDisabledNote")}):t("small",{children:r("cardEditor.dialog.processing.completionCaption")})]}),t("p",{className:"ce-caption",children:r("cardEditor.dialog.processing.overflowCaption")})]}),i("fieldset",{className:"ce-section","data-ce-section":"saving",children:[t("legend",{className:"ce-section-heading",children:r("cardEditor.dialog.saving.title")}),i("div",{className:"ce-choice-list",children:[t(ye,{name:"ce-save-mode",value:"confirm",checked:I==="confirm",onChange:x=>y(x),title:r("cardEditor.dialog.saving.confirm")}),t(ye,{name:"ce-save-mode",value:"auto",checked:I==="auto",onChange:x=>y(x),title:r("cardEditor.dialog.saving.auto"),disabled:_e}),t(ye,{name:"ce-save-mode",value:"duplicate",checked:I==="duplicate",onChange:x=>y(x),title:r("cardEditor.dialog.saving.duplicate")}),I==="duplicate"?i(Oe,{children:[i("label",{className:"ce-label",htmlFor:"ce-duplicate-prefix",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.saving.duplicatePrefix")}),t("input",{id:"ce-duplicate-prefix",type:"text",className:"mari-chrome-field ce-field",value:q,placeholder:r("cardEditor.dialog.saving.duplicatePrefixPlaceholder"),"aria-label":r("cardEditor.dialog.saving.duplicatePrefix"),onChange:x=>V(x.target.value)}),t("small",{children:r("cardEditor.dialog.saving.duplicatePrefixHint")})]}),i("label",{className:"ce-label",htmlFor:"ce-duplicate-suffix",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.saving.duplicateSuffix")}),t("input",{id:"ce-duplicate-suffix",type:"text",className:"mari-chrome-field ce-field",value:f,placeholder:r("cardEditor.dialog.saving.duplicateSuffixPlaceholder"),"aria-label":r("cardEditor.dialog.saving.duplicateSuffix"),onChange:x=>F(x.target.value)})]}),t("p",{className:"ce-divider-caption",children:r("cardEditor.dialog.saving.duplicateRemoveGroup")}),i("label",{className:"ce-label",htmlFor:"ce-duplicate-remove-prefix",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.saving.duplicateRemovePrefix")}),t("input",{id:"ce-duplicate-remove-prefix",type:"text",className:"mari-chrome-field ce-field",value:K,placeholder:r("cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder"),"aria-label":r("cardEditor.dialog.saving.duplicateRemovePrefix"),onChange:x=>G(x.target.value)})]}),i("label",{className:"ce-label",htmlFor:"ce-duplicate-remove-suffix",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.saving.duplicateRemoveSuffix")}),t("input",{id:"ce-duplicate-remove-suffix",type:"text",className:"mari-chrome-field ce-field",value:Y,placeholder:r("cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder"),"aria-label":r("cardEditor.dialog.saving.duplicateRemoveSuffix"),onChange:x=>he(x.target.value)})]}),t("p",{className:"ce-caption",children:r("cardEditor.dialog.saving.duplicateNamePreview",{name:yo})})]}):null,t(ye,{name:"ce-save-mode",value:"combined",checked:I==="combined",onChange:x=>y(x),title:r("cardEditor.dialog.saving.combined")}),I==="combined"?i("label",{className:"ce-label",htmlFor:"ce-combined-name",children:[t("span",{className:"ce-label-title",children:r("cardEditor.dialog.saving.combinedName")}),t("input",{id:"ce-combined-name",type:"text",className:"mari-chrome-field ce-field",value:Le,placeholder:r("cardEditor.dialog.saving.combinedNamePlaceholder"),"aria-label":r("cardEditor.dialog.saving.combinedName"),onChange:x=>Pe(x.target.value)}),t("small",{children:r("cardEditor.dialog.saving.combinedCaption")})]}):null]}),_e?t("p",{className:"ce-caption",children:r("cardEditor.dialog.saving.reviewRequiredHint")}):null,t("p",{className:"ce-caption",children:r("cardEditor.dialog.saving.caption")})]})]}),i("div",{className:"ce-dialog-foot",children:[la?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:r("cardEditor.dialog.dispatchError",{message:la})}):null,st?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:r("cardEditor.dialog.targets.unloadableBlock")}):null,lt?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:r("cardEditor.dialog.saving.combinedNameRequired")}):null,t("span",{className:"ce-estimate",children:r("cardEditor.dialog.estimate",{batch:W,batchedCalls:Mt.batched,individualCalls:Mt.individual})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:Me||d.length===0||st||lt||Nt,onClick:()=>{wo()},children:r(Me?"cardEditor.dialog.dispatching":"cardEditor.dialog.dispatch")})]})]}),ae?t(Ar,{localization:e,initialSchemaId:Je.schemaId,onClose:()=>ke(!1),onSchemasChanged:(x,z)=>{Ue(x),He(te=>({...te,schemaId:z}))}}):null]})}function cs(e,a){return e==="backstory"||e==="appearance"?{extensions:{[e]:a}}:{[e]:a}}function fs(e){let{name:a,...o}=e;return o}function aa(e){return(e instanceof Error?e.message:String(e??""))||"unknown error"}var _r=" (Copy)";async function ms(e,a,o){if(a.op==="hold")return{ok:!0};if(a.op==="collectForCombine")return{ok:!0};if(a.op==="patchField")return await Lt(a.characterId,cs(a.field,a.newText),{versionSource:a.versionSource,versionReason:a.versionReason}),{ok:!0};let s=a,l=await dr(a.characterId),r=typeof l?.id=="string"&&l.id?l.id:"";if(!r)throw new Error("The duplicate call returned no card id.");let d=gt(l),n=a.name??(d.endsWith(_r)?d.slice(0,-_r.length):d||e.characterName),p={name:Ua(n,{...s.namePrefix===void 0?{}:{prefix:s.namePrefix},...s.nameSuffix===void 0?{}:{suffix:s.nameSuffix},...s.stripNamePrefix===void 0?{}:{removePrefix:s.stripNamePrefix},...s.stripNameSuffix===void 0?{}:{removeSuffix:s.stripNameSuffix}})},h={...a.extensions};for(let[u,m]of Object.entries(a.fields))u==="backstory"||u==="appearance"?h[u]=m:p[u]=m;return Object.keys(h).length>0&&(p.extensions=h),await Lt(r,p,{versionSource:"agent",versionReason:`Card Editor bulk: ${o}`}),{ok:!0,resultCardId:r}}async function kt(e,a,o){let s=[];for(let[l,r]of a.entries())try{s.push({index:l,...await ms(e,r,o.label)})}catch(d){s.push({index:l,ok:!1,error:aa(d)})}return s}async function ta(e,a,o){try{let s=e.status==="completed"?e.config.completionMode??"ask":"ask",r=s==="duplicate"||s==="ask"&&(e.config.saveMode==="duplicate"||e.config.saveMode==="combined")?void 0:fs((await Fe(a.characterId)).fields),d=await ht(e.id,a.itemId,{verdict:"approve",...o.force?{force:!0}:{},...r===void 0?{}:{currentFields:r}});if(!ft(d))return{kind:"failed",message:"The verdict route answered an unexpected shape."};if(d.status==="needs-confirmation")return{kind:"needs-confirmation",holds:d.holds};let n=await kt(a,d.ops,{label:e.label}),p;try{p=await Oa(e.id,a.itemId,n)}catch(u){return{kind:"report-failed",message:aa(u)}}let h=n.find(u=>!u.ok);if(h){let u=p.items.find(m=>m.itemId===a.itemId);return{kind:"apply-failed",session:p,message:u?.failure?.message??h.error??"A card write failed."}}return{kind:"applied",session:p}}catch(s){return{kind:"failed",message:aa(s)}}}async function Xa(e,a){if(e.status!=="completed")return{session:e,failedCount:0,messages:[]};let o=e.config.completionMode??"ask",s=e.items.filter(n=>Array.isArray(n.pendingOps)||o==="apply"&&n.status==="awaiting-review"),l=e,r=0,d=[];a?.(0,s.length);for(let[n,p]of s.entries()){let h=l.items.find(u=>u.itemId===p.itemId)??p;try{if(Array.isArray(h.pendingOps)){let u=await kt(h,h.pendingOps,{label:l.label});l=await Oa(l.id,h.itemId,u),u.some(m=>!m.ok)&&(r+=1)}else{let u=await ta(l,h,{force:!1});u.kind==="applied"||u.kind==="apply-failed"?(l=u.session,u.kind==="apply-failed"&&(r+=1,d.push(u.message))):u.kind==="needs-confirmation"?l=await Qe(l.id):(r+=1,d.push(u.message))}}catch(u){r+=1,d.push(aa(u))}a?.(n+1,s.length)}return{session:l,failedCount:r,messages:d}}async function Vr(e,a){try{let o=await ht(e.id,a.itemId,{verdict:"reject"});return ft(o)?{kind:"failed",message:"The verdict route answered an unexpected shape."}:{kind:"rejected",session:o}}catch(o){return{kind:"failed",message:aa(o)}}}function ps(e){return e.filter(a=>a.status==="applied").map(a=>Re((a.updates??[]).find(o=>o.field==="description")?.newText??"")).filter(a=>a.trim().length>0)}async function Gr(e,a={}){try{let o=e.items.filter(p=>p.status==="applied"),s=ps(e.items);if(o.length===0||s.length===0)return{kind:"failed",message:"No collected cards to combine yet."};let l=e.config.combinedCardName?.trim()||e.label,r=await nr({name:l,description:s.join(`

`)}),d=typeof r?.id=="string"&&r.id?r.id:"";if(!d)throw new Error("The create call returned no card id.");return{kind:"combined",session:await rr(e.id,{itemIds:o.map(p=>p.itemId),resultCardId:d,...a.confirmPartial?{confirmPartial:!0}:{}})}}catch(o){return{kind:"failed",message:aa(o)}}}async function Wr(e){let{plans:a}=await tr(e.id),o=e,s=0;for(let l of a){let r=e.items.find(n=>n.itemId===l.itemId);if(!r)continue;let d=await kt(r,l.ops,{label:e.label});o=await Oa(e.id,l.itemId,d),d.some(n=>!n.ok)&&(s+=1)}return{session:o,failedCount:s}}function $r(e){return e.split(`
`)}function Xr(e,a){let o=$r(e),s=$r(a);if(e===a)return o.map(u=>({kind:"same",text:u}));let l=0;for(;l<o.length&&l<s.length&&o[l]===s[l];)l+=1;let r=o.length,d=s.length;for(;r>l&&d>l&&o[r-1]===s[d-1];)r-=1,d-=1;let n=o.slice(l,r),p=s.slice(l,d),h=o.slice(0,l).map(u=>({kind:"same",text:u}));if(n.length*p.length<=1e6){let u=Array.from({length:n.length+1},()=>new Uint32Array(p.length+1));for(let v=n.length-1;v>=0;v-=1)for(let S=p.length-1;S>=0;S-=1)u[v][S]=n[v]===p[S]?u[v+1][S+1]+1:Math.max(u[v+1][S],u[v][S+1]);let m=0,C=0;for(;m<n.length&&C<p.length;)n[m]===p[C]?(h.push({kind:"same",text:n[m]}),m+=1,C+=1):u[m+1][C]>=u[m][C+1]?(h.push({kind:"del",text:n[m]}),m+=1):(h.push({kind:"add",text:p[C]}),C+=1);for(;m<n.length;)h.push({kind:"del",text:n[m++]});for(;C<p.length;)h.push({kind:"add",text:p[C++]})}else{for(let u of n)h.push({kind:"del",text:u});for(let u of p)h.push({kind:"add",text:u})}for(let u of o.slice(r))h.push({kind:"same",text:u});return h}function jr(e,a=3){let o=[],s=[],l=0,r=()=>{s.length!==0&&(s.some(n=>n.kind!=="same")&&o.push({hiddenBefore:l,lines:s}),s=[],l=0)},d=0;for(;d<e.length;){if(e[d].kind!=="same"){s.push(e[d]),d+=1;continue}let n=d;for(;n<e.length&&e[n].kind==="same";)n+=1;let p=n-d,h=s.length>0,u=n<e.length;if(!h&&!u)break;h?u?p>a*2?(s.push(...e.slice(d,d+a)),r(),l=p-a*2,s.push(...e.slice(n-a,n))):s.push(...e.slice(d,n)):s.push(...e.slice(d,Math.min(n,d+a))):(l=Math.max(0,p-a),s.push(...e.slice(Math.max(d,n-a),n))),d=n}return r(),o}function Kr(e){return e.trim().split(/\s+/u).filter(Boolean).length}function ja(e,a){let o=new Map;for(let l of e.trim().split(/\s+/u).filter(Boolean))o.set(l,(o.get(l)??0)+1);let s=0;for(let l of a.trim().split(/\s+/u).filter(Boolean)){let r=o.get(l)??0;r===0?s+=1:r===1?o.delete(l):o.set(l,r-1)}return{added:s,removed:[...o.values()].reduce((l,r)=>l+r,0)}}var hs={queued:"cardEditor.panel.status.queued",running:"cardEditor.panel.status.running",succeeded:"cardEditor.panel.status.succeeded","awaiting-review":"cardEditor.panel.status.awaitingReview","needs-review":"cardEditor.panel.status.needsReview",applied:"cardEditor.panel.status.applied",duplicated:"cardEditor.panel.status.duplicated",rejected:"cardEditor.panel.status.rejected","failed-provider":"cardEditor.panel.status.failedProvider","failed-refusal":"cardEditor.panel.status.failedRefusal","failed-parse":"cardEditor.panel.status.failedParse",canceled:"cardEditor.panel.status.canceled",interrupted:"cardEditor.panel.status.interrupted","awaiting-split":"cardEditor.panel.status.awaitingSplit",split:"cardEditor.panel.status.split",staged:"cardEditor.panel.status.staged"};function va(e){return hs[e]??"cardEditor.panel.status.unknown"}function Ka(e){return e==="queued"||e==="running"||e==="succeeded"?"live":e==="awaiting-review"||e==="needs-review"||e==="awaiting-split"?"review":e==="applied"||e==="duplicated"||e==="split"||e==="staged"?"ok":e==="rejected"||e==="canceled"||e==="interrupted"?"muted":"danger"}var gs=["awaiting-review","needs-review"],xs=["failed-provider","failed-refusal","failed-parse"];function Ee(e){return gs.includes(e.status)}function ra(e){return xs.includes(e.status)}function Jr(e){return Ee(e)||e.status==="applied"||e.status==="duplicated"||e.status==="rejected"}function Zr(e){let a=e.updates??[];if(a.length===0)return null;let o=0,s=0;for(let l of a){let r=ja(e.snapshots[l.field]??Re(l.oldText),Re(l.newText));o+=r.added,s+=r.removed}return{fields:a.length,added:o,removed:s}}function Ja(e){let a=e.items.filter(d=>d.status==="running").length,o=e.items.filter(d=>d.status==="queued").length,s=e.batches.filter(d=>d.status!=="split"),l=s.findIndex(d=>d.status==="running"),r=l>=0?s[l]:null;return e.config.mode==="batched"&&r?{kind:"batch",runningItems:a,queuedItems:o,batchIndex:l+1,batchCount:s.length,batchAttempts:r.attempts}:a>0?{kind:"items",runningItems:a,queuedItems:o,batchIndex:0,batchCount:0,batchAttempts:0}:o>0?{kind:"queued",runningItems:a,queuedItems:o,batchIndex:0,batchCount:0,batchAttempts:0}:{kind:"done",runningItems:a,queuedItems:o,batchIndex:0,batchCount:0,batchAttempts:0}}function Yr(e){let a=e.items.some(r=>r.phase===2)?2:1,o=e.items.filter(r=>(r.phase??1)===a),s=e.items.filter(r=>(r.phase??1)===1&&r.parentItemId===void 0).length,l=o.filter(r=>r.status==="awaiting-split").length;return{sources:s,results:o.filter(r=>r.status!=="split"&&r.status!=="rejected"&&r.status!=="canceled").reduce((r,d)=>r+(d.status==="awaiting-split"?d.characters?.length??1:1),0),splitsPending:l,splitsAccepted:o.filter(r=>r.status==="split").length,phase:a,phase2Ready:e.config.transform?.phase2?.enabled===!0&&a===1&&e.status!=="active"&&l===0&&e.items.some(r=>r.status==="staged")}}function Qr(e,a){return!e.parentItemId||!e.lineage?.splitGroupId?!1:a.find(s=>s.itemId===e.parentItemId)?.status==="split"}var Ls={"2:3":.6666666666666666,"3:4":.75,"9:16":.5625},ao={method:"portrait",aspect:"3:4",columns:0,gap:8,resolution:2},ya={x:0,y:0,scale:100};function Za(e,a,o){return Math.min(o,Math.max(a,Math.round(e)))}function oa(e,a=50){let o=a>0?a:50;return{x:Za(Number.isFinite(e?.x)?e.x:0,-100,100),y:Za(Number.isFinite(e?.y)?e.y:0,-100,100),scale:Za(Number.isFinite(e?.scale)?e.scale:100,o,200)}}function Is(e,a){let o=Math.floor(e);if(!(o>0))return{cols:1,rows:1};let s=a>0&&Number.isFinite(a)?a:1,l={cols:1,rows:o},r=1/0;for(let d=1;d<=o;d++){let n=Math.ceil(o/d),p=Math.abs(n/d-s);p<r&&(r=p,l={cols:d,rows:n})}return l}function eo(e,a,o,s,l,r){let d=l>1?(a-l)/(l-1):s,n=r>1?(o-r)/(r-1):s,p=Math.min(Math.max(0,s),Math.max(0,Math.floor(Math.min(d,n)))),h=(a-p*(l-1))/l,u=(o-p*(r-1))/r;return h<=0||u<=0?[]:Array.from({length:e},(m,C)=>({x:C%l*(h+p),y:Math.floor(C/l)*(u+p),w:h,h:u}))}function to(e,a,o,s,l=[]){let r=Math.floor(a);if(!(r>0)||!(o>0)||!(s>0))return[];if(e.columns>=1){let u=Math.min(e.columns,r);return eo(r,o,s,e.gap,u,Math.ceil(r/u))}let d=s/o,n=d;if(e.method==="portrait")n=Ls[e.aspect]*d;else if(e.method==="best-fit"){let u=l.filter(m=>typeof m=="number"&&m>0);u.length>0&&(n=Math.exp(u.reduce((m,C)=>m+Math.log(C),0)/u.length)*d)}let{cols:p,rows:h}=Is(r,n);return eo(r,o,s,e.gap,p,h)}function Et(e,a,o){if(!(a>0)||!(o>0)||!(e.w>0)||!(e.h>0))return 50;let s=e.w/a,l=e.h/o;return Math.ceil(100*Math.min(s,l)/Math.max(s,l))}function ro(e,a,o,s){if(!(a>0)||!(o>0)||!(e.w>0)||!(e.h>0))return null;let l=oa(s,Et(e,a,o)),r=Math.max(e.w/a,e.h/o)*(l.scale/100),d=a*r,n=o*r;return{dx:e.x+(e.w-d)/2+l.x/100*e.w,dy:e.y+(e.h-n)/2+l.y/100*e.h,dw:d,dh:n}}function Pt(e,a,o,s){return oa({...e,x:e.x+a,y:e.y+o},s)}function Ya(e,a,o){return oa({...e,scale:e.scale+a},o)}function oo(e,a,o,s){return!(a>0)||!(o>0)?e:Za(e*(o/a),s,200)}function At(e,a,o){return e.findIndex(s=>a>=s.x&&a<s.x+s.w&&o>=s.y&&o<s.y+s.h)}function so(e){return{width:512*e.resolution,height:768*e.resolution}}function bs(e){let a=[...new Set(e.items.filter(r=>r.parentItemId===void 0).map(r=>r.characterId))],o=e.items.flatMap(r=>r.resultCardId?[r.resultCardId]:[]),s=e.items.filter(r=>r.status==="applied"&&!r.resultCardId).map(r=>r.characterId),l=[...new Set([...e.combinedCardId?[e.combinedCardId]:[],...o,...s])];return{sources:[...new Set([...a,...o])],targets:l}}function Cs(e){return new Promise(a=>{let o=new Image;o.onload=()=>a(o),o.onerror=()=>a(null),o.src=e})}function Ss(e){return e.split(/\s+/).filter(Boolean).slice(0,2).map(a=>a[0].toUpperCase()).join("")}function lo({localization:e,session:a,onClose:o}){let s=(g,I)=>ee(e,g,I),[{sources:l,targets:r}]=c(()=>bs(a)),[d,n]=c(null),[p,h]=c(()=>new Set(l)),[u,m]=c(l),[C,v]=c(r[0]??""),[S,M]=c(ao),[N,B]=c({}),[R,j]=c(0),[P,A]=c(!1),[T,W]=c(null),oe=se(null),U=se({pointers:new Map}),Z=ve(!0,()=>P,o);H(()=>{let g=!1,I=[...new Set([...l,...r])];return Promise.all(I.map(async y=>{try{let q=await Fe(y);return{id:y,name:q.name,image:q.avatarPath?await Cs(q.avatarPath):null}}catch{return{id:y,name:y,image:null}}})).then(y=>{g||n(y)}),()=>{g=!0}},[l,r]);let _=new Map((d??[]).map(g=>[g.id,g])),J=u.filter(g=>p.has(g)).map(g=>_.get(g)??{id:g,name:g,image:null}),E=so(S),X=to(S,J.length,E.width,E.height,J.map(g=>g.image?g.image.naturalWidth/g.image.naturalHeight:null)),$=Math.min(R,Math.max(0,J.length-1)),pe=g=>{let I=J[g],y=X[g];return I?.image&&y?Et(y,I.image.naturalWidth,I.image.naturalHeight):50},me=g=>N[g]??ya,b=(g,I)=>{let y=J[g];y&&B(q=>({...q,[y.id]:I(q[y.id]??ya,pe(g))}))};H(()=>{let g=oe.current,I=g?.getContext("2d");!g||!I||(I.clearRect(0,0,g.width,g.height),I.fillStyle="#16121f",I.fillRect(0,0,g.width,g.height),J.forEach((y,q)=>{let V=X[q];if(!V)return;I.save(),I.beginPath(),I.rect(V.x,V.y,V.w,V.h),I.clip();let f=y.image?ro(V,y.image.naturalWidth,y.image.naturalHeight,me(y.id)):null;y.image&&f?I.drawImage(y.image,f.dx,f.dy,f.dw,f.dh):(I.fillStyle="#2b2540",I.fillRect(V.x,V.y,V.w,V.h),I.fillStyle="#e8d4ff",I.font=`700 ${Math.round(Math.min(V.w,V.h)*.28)}px sans-serif`,I.textAlign="center",I.textBaseline="middle",I.fillText(Ss(y.name),V.x+V.w/2,V.y+V.h/2)),I.restore()}))});let w=g=>{let I=oe.current,y=I.getBoundingClientRect();return{x:(g.clientX-y.left)*I.width/y.width,y:(g.clientY-y.top)*I.height/y.height}},k=g=>{let I=w(g),y=At(X,I.x,I.y);if(y>=0&&U.current.pointers.size===0&&j(y),g.currentTarget.setPointerCapture(g.pointerId),U.current.pointers.set(g.pointerId,I),U.current.pointers.size===2){let[q,V]=[...U.current.pointers.values()];U.current.pinch={distance:Math.hypot(q.x-V.x,q.y-V.y),scale:me(J[$]?.id??"").scale}}},D=g=>{let I=U.current.pointers.get(g.pointerId);if(!I)return;let y=w(g);U.current.pointers.set(g.pointerId,y);let q=X[$];if(!q)return;if(U.current.pointers.size===2&&U.current.pinch){let[F,K]=[...U.current.pointers.values()],G=U.current.pinch;b($,(Y,he)=>({...Y,scale:oo(G.scale,G.distance,Math.hypot(F.x-K.x,F.y-K.y),he)}));return}let V=(y.x-I.x)/q.w*100,f=(y.y-I.y)/q.h*100;b($,(F,K)=>Pt(F,V,f,K))},re=g=>{U.current.pointers.delete(g.pointerId),U.current.pointers.size<2&&delete U.current.pinch},ce=g=>{let I=w(g),y=At(X,I.x,I.y);y<0||(j(y),b(y,(q,V)=>Ya(q,g.deltaY<0?5:-5,V)))},be=g=>{let I={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[g.key];if(g.key==="Tab"&&!g.shiftKey&&$<J.length-1)j($+1);else if(g.key==="Tab"&&g.shiftKey&&$>0)j($-1);else if(I)b($,(y,q)=>Pt(y,I[0],I[1],q));else if(g.key==="+"||g.key==="=")b($,(y,q)=>Ya(y,5,q));else if(g.key==="-")b($,(y,q)=>Ya(y,-5,q));else if(g.key==="0")b($,()=>ya);else return;g.preventDefault()},le=(g,I)=>m(y=>{let q=y.indexOf(g),V=q+I;if(q<0||V<0||V>=y.length)return y;let f=[...y];return[f[q],f[V]]=[f[V],f[q]],f}),qe=async()=>{let g=oe.current;if(!(!g||!C||P)){A(!0),W(null);try{await ir(C,g.toDataURL("image/png")),W({tone:"ok",text:s("cardEditor.avatar.applied",{name:_.get(C)?.name??C})})}catch(I){W({tone:"error",text:I instanceof Error?I.message:String(I)})}finally{A(!1)}}},Ce=J[$],Se=Ce?oa(me(Ce.id),pe($)).scale:100,we=(g,I,y,q)=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":g===I,onClick:()=>q(g),children:y},String(g));return t("div",{className:"ce-overlay",role:"presentation",onClick:()=>P?void 0:o(),children:i("section",{ref:Z,className:"ce-dialog ce-shell ce-avatar-studio",role:"dialog","aria-modal":"true","aria-label":s("cardEditor.avatar.title"),tabIndex:-1,onClick:g=>g.stopPropagation(),children:[i("div",{className:"ce-dialog-head",children:[t("strong",{children:s("cardEditor.avatar.title")}),t("button",{type:"button",className:"ce-dialog-close",onClick:o,disabled:P,"aria-label":s("cardEditor.avatar.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),i("div",{className:"ce-avatar-body",children:[i("div",{className:"ce-avatar-sources",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.images")}),d===null?t("p",{className:"ce-caption",children:s("cardEditor.avatar.loading")}):null,t("ul",{className:"ce-avatar-source-list",children:u.map((g,I)=>{let y=_.get(g);return i("li",{className:"ce-avatar-source",children:[i("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:p.has(g),onChange:q=>h(V=>{let f=new Set(V);return q.target.checked?f.add(g):f.size>1&&f.delete(g),f})}),i("span",{className:"ce-choice-copy",children:[t("strong",{children:y?.name??g}),y&&!y.image?t("small",{children:s("cardEditor.avatar.noImage")}):null]})]}),i("span",{className:"ce-inline-controls",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:I===0,"aria-label":s("cardEditor.avatar.moveUp",{name:y?.name??g}),onClick:()=>le(g,-1),children:t(We,{className:"ce-icon","aria-hidden":"true"})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:I===u.length-1,"aria-label":s("cardEditor.avatar.moveDown",{name:y?.name??g}),onClick:()=>le(g,1),children:t(Ge,{className:"ce-icon","aria-hidden":"true"})})]})]},g)})}),t("p",{className:"ce-caption",children:s("cardEditor.avatar.sourcesHint")})]}),i("div",{className:"ce-avatar-canvas-wrap",children:[t("canvas",{ref:oe,className:"ce-avatar-canvas",width:E.width,height:E.height,tabIndex:0,"aria-label":s("cardEditor.avatar.canvasLabel"),onPointerDown:k,onPointerMove:D,onPointerUp:re,onPointerCancel:re,onWheel:ce,onKeyDown:be}),t("p",{className:"ce-caption",role:"status",children:Ce?s("cardEditor.avatar.selected",{name:Ce.name,zoom:Se}):""})]}),i("div",{className:"ce-avatar-controls",children:[i("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.layout")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.avatar.layout"),children:["square","portrait","best-fit"].map(g=>we(g,S.method,s(`cardEditor.avatar.method.${g}`),I=>M({...S,method:I})))})]}),i("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.columns")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.avatar.columns"),children:[0,1,2,3,4].map(g=>we(g,S.columns,g===0?s("cardEditor.avatar.columnsAuto"):String(g),I=>M({...S,columns:I})))})]}),i("label",{className:"ce-label",htmlFor:"ce-avatar-gap",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.gap",{gap:S.gap})}),t("input",{id:"ce-avatar-gap",type:"range",min:0,max:48,value:S.gap,onChange:g=>M({...S,gap:Number(g.target.value)})})]}),i("label",{className:"ce-label",htmlFor:"ce-avatar-zoom",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.zoom",{zoom:Se})}),t("input",{id:"ce-avatar-zoom",type:"range",min:pe($),max:200,value:Se,disabled:!Ce,onChange:g=>b($,(I,y)=>oa({...I,scale:Number(g.target.value)},y))})]}),i("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:s("cardEditor.avatar.resolution")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.avatar.resolution"),children:[1,2,4].map(g=>we(g,S.resolution,`${512*g}\xD7${768*g}`,I=>M({...S,resolution:I})))})]}),i("div",{className:"ce-inline-controls",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!Ce,onClick:()=>b($,()=>ya),children:s("cardEditor.avatar.resetCell")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>B({}),children:s("cardEditor.avatar.resetAll")})]}),t("p",{className:"ce-caption",children:s("cardEditor.avatar.keys")})]})]}),i("div",{className:"ce-dialog-foot",children:[T?t("div",{className:`ce-status${T.tone==="error"?" ce-status--error":""} ce-foot-error`,role:T.tone==="error"?"alert":"status",children:T.text}):null,i("label",{className:"ce-label ce-studio-name",htmlFor:"ce-avatar-target",children:[t("span",{className:"ce-sr-only",children:s("cardEditor.avatar.target")}),i("select",{id:"ce-avatar-target",className:"mari-chrome-field ce-field",value:C,onChange:g=>v(g.target.value),children:[r.length===0?t("option",{value:"",children:s("cardEditor.avatar.noTargets")}):null,r.map(g=>t("option",{value:g,children:s("cardEditor.avatar.targetOption",{name:_.get(g)?.name??g})},g))]})]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:P||!C||d===null,onClick:()=>{qe()},children:s(P?"cardEditor.avatar.applying":"cardEditor.avatar.apply")})]})]})})}function io({localization:e,session:a,item:o,onClose:s,onRetried:l}){let r=(B,R)=>ee(e,B,R),d=o.failure?.renderedPrompt??null,[n,p]=c(d?.system??""),[h,u]=c(d?.user??""),[m,C]=c(!1),[v,S]=c(null),M=ve(!0,()=>m,s),N=async()=>{if(!(m||!d)){C(!0),S(null);try{l(await er(a.id,o.itemId,{system:n,user:h}))}catch(B){S(B instanceof Error?B.message:String(B)),C(!1)}}};return t("div",{className:"ce-overlay",role:"presentation",onClick:()=>{m||s()},children:i("section",{ref:M,className:"ce-dialog ce-shell ce-edit-retry",role:"dialog","aria-modal":"true","aria-label":r("cardEditor.editRetry.title",{name:o.characterName}),tabIndex:-1,onClick:B=>B.stopPropagation(),children:[i("div",{className:"ce-dialog-head",children:[t("strong",{children:r("cardEditor.editRetry.title",{name:o.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:m,"aria-label":r("cardEditor.editRetry.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),i("div",{className:"ce-dialog-body",children:[d?i(Oe,{children:[t("p",{className:"ce-caption",children:r("cardEditor.editRetry.hint")}),i("label",{className:"ce-label",htmlFor:"ce-retry-system",children:[t("span",{className:"ce-label-title",children:r("cardEditor.editRetry.system")}),t("textarea",{id:"ce-retry-system",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:n,"data-ce-autofocus":!0,onChange:B=>p(B.target.value)})]}),i("label",{className:"ce-label",htmlFor:"ce-retry-user",children:[t("span",{className:"ce-label-title",children:r("cardEditor.editRetry.user")}),t("textarea",{id:"ce-retry-user",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:h,onChange:B=>u(B.target.value)})]})]}):t("div",{className:"ce-status",role:"status",children:r("cardEditor.editRetry.missing")}),v?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.editRetry.error",{message:v})}):null]}),i("div",{className:"ce-dialog-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:m,onClick:s,children:r("cardEditor.editRetry.cancel")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:m||!d,onClick:()=>{N()},children:r(m?"cardEditor.editRetry.retrying":"cardEditor.editRetry.retry")})]})]})})}function no({localization:e,session:a,item:o,onClose:s,onUpdated:l}){let r=(S,M)=>ee(e,S,M),[d,n]=c(o.failure?.rawOutput??""),[p,h]=c(!1),[u,m]=c(o.failure?.message??null),C=ve(!0,()=>p,s),v=async S=>{if(!p){h(!0),m(null);try{l(await S())}catch(M){m(M instanceof Error?M.message:String(M)),h(!1)}}};return t("div",{className:"ce-overlay",role:"presentation",onClick:()=>{p||s()},children:i("section",{ref:C,className:"ce-dialog ce-shell ce-edit-retry",role:"dialog","aria-modal":"true","aria-label":r("cardEditor.fixJson.title",{name:o.characterName}),tabIndex:-1,onClick:S=>S.stopPropagation(),children:[i("div",{className:"ce-dialog-head",children:[t("strong",{children:r("cardEditor.fixJson.title",{name:o.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:p,"aria-label":r("cardEditor.editRetry.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),i("div",{className:"ce-dialog-body",children:[t("p",{className:"ce-caption",children:r("cardEditor.fixJson.hint")}),i("label",{className:"ce-label",htmlFor:"ce-fix-json",children:[t("span",{className:"ce-label-title",children:r("cardEditor.fixJson.response")}),t("textarea",{id:"ce-fix-json",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:d,spellCheck:!1,"data-ce-autofocus":!0,onChange:S=>n(S.target.value)})]}),u?t("div",{className:"ce-status ce-status--error",role:"alert",children:u}):null]}),i("div",{className:"ce-dialog-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p,onClick:s,children:r("cardEditor.fixJson.dismiss")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p,onClick:()=>{v(()=>La(a.id,o.itemId))},children:r("cardEditor.fixJson.regenerate")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:p||!d.trim(),onClick:()=>{v(()=>ar(a.id,o.itemId,d))},children:r(p?"cardEditor.editRetry.retrying":"cardEditor.fixJson.apply")})]})]})})}var uo=600;function co(e){let a=Re(e).trim();return a.length>uo?`${a.slice(0,uo)}\u2026`:a}function fo({localization:e,session:a,item:o,onClose:s,onUpdated:l}){let r=(N,B)=>ee(e,N,B),d=o.characters??[],[n,p]=c(()=>d.map(N=>N.name)),[h,u]=c(!1),[m,C]=c(null),v=ve(!0,()=>h,s),S=o.previousOutput??o.snapshots.description??"",M=async N=>{if(!h){u(!0),C(null);try{l(await Xt(a.id,o.itemId,N,N==="accept"?n.map(B=>B.trim()):void 0))}catch(B){C(B instanceof Error?B.message:String(B)),u(!1)}}};return t("div",{className:"ce-overlay",role:"presentation",onClick:()=>h?void 0:s(),children:i("section",{ref:v,className:"ce-dialog ce-shell ce-split-review",role:"dialog","aria-modal":"true","aria-label":r("cardEditor.split.title",{name:o.characterName}),tabIndex:-1,onClick:N=>N.stopPropagation(),children:[i("div",{className:"ce-dialog-head",children:[t("strong",{children:r("cardEditor.split.title",{name:o.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:s,disabled:h,"aria-label":r("cardEditor.split.close"),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),i("div",{className:"ce-split-body",children:[i("div",{className:"ce-split-source",children:[t("span",{className:"ce-label-title",children:r("cardEditor.split.source")}),t("pre",{className:"ce-split-source-text",tabIndex:0,children:co(S)||r("cardEditor.split.sourceEmpty")})]}),i("div",{className:"ce-split-proposal",children:[t("div",{className:"ce-notice",role:"status",children:i("span",{children:[t("strong",{children:r("cardEditor.split.proposal",{count:d.length})}),o.splitReason?` ${r("cardEditor.split.reason",{reason:o.splitReason})}`:""]})}),t("ol",{className:"ce-split-cards",children:d.map((N,B)=>{let R=Object.values(N.fields)[0]??"";return i("li",{className:"ce-split-card",children:[i("label",{className:"ce-label",htmlFor:`ce-split-name-${B}`,children:[t("span",{className:"ce-label-title",children:r("cardEditor.split.cardName",{index:B+1})}),t("input",{id:`ce-split-name-${B}`,className:"mari-chrome-field ce-field",value:n[B]??"",placeholder:N.name,onChange:j=>p(P=>P.map((A,T)=>T===B?j.target.value:A))})]}),t("pre",{className:"ce-split-card-text",children:co(R)}),N.issues?.length?t("small",{className:"ce-item-failure",children:r("cardEditor.split.issues",{count:N.issues.length})}):null]},`${B}:${N.name}`)})}),t("p",{className:"ce-caption",children:r("cardEditor.split.outcome",{count:d.length})})]})]}),i("div",{className:"ce-dialog-foot",children:[m?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:m}):null,t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:h,onClick:()=>{M("reject")},children:r("cardEditor.split.skip")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:h,onClick:()=>{M("retry-single")},children:r("cardEditor.split.retrySingle")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:h,onClick:()=>{M("accept")},children:r("cardEditor.split.accept",{count:d.length})})]})]})})}function sa(e,a,o=!0){let s=se(e);s.current=e;let[l,r]=c(null),d=Be(C=>r(C),[]),[n,p]=c(!1),[h,u]=c(typeof document>"u"?!0:document.visibilityState==="visible");H(()=>{if(!l||typeof IntersectionObserver>"u"){p(!0);return}let C=new IntersectionObserver(v=>{p(v.some(S=>S.isIntersecting))});return C.observe(l),()=>C.disconnect()},[l]),H(()=>{let C=()=>u(document.visibilityState==="visible");return document.addEventListener("visibilitychange",C),()=>document.removeEventListener("visibilitychange",C)},[]);let m=o&&n&&h;return H(()=>{if(!m)return;let C=!1,v=0,S=()=>{C||(s.current(),v=window.setTimeout(S,a))};return S(),()=>{C=!0,window.clearTimeout(v)}},[m,a]),d}var vs=3,ys=8;function ws(e){return(e.updates??[]).map(a=>{let o=e.snapshots[a.field]??Re(a.oldText),s=Re(a.newText),{added:l,removed:r}=ja(o,s),d=jr(Xr(o,s),vs);return{field:a.field,newText:s,added:l,removed:r,wordCount:Kr(s),hunks:d}})}function ks({preview:e,expanded:a,showAll:o,onToggle:s,onShowAll:l,t:r}){if(!a)return i("button",{type:"button",className:"ce-queue-minirow",onClick:s,children:[t("span",{className:"ce-queue-minirow-caret","aria-hidden":"true",children:"\u25B8"}),t("span",{className:"ce-queue-minirow-field",children:e.field}),t("span",{className:"ce-queue-minirow-words",children:r("cardEditor.queue.miniRowWords",{added:e.added,removed:e.removed})})]});let d=o?Number.POSITIVE_INFINITY:ys,n=!1,p=[];for(let h of e.hunks){if(d<=0){n=!0;break}let u=0;h.hiddenBefore>0&&(u=h.hiddenBefore,d-=1);let m=h.lines.slice(0,Math.max(0,d));m.length<h.lines.length&&(n=!0),d-=m.length,p.push({lines:m,hidden:u})}return i("section",{className:"ce-queue-field",children:[i("header",{className:"ce-queue-field-head",children:[t("strong",{className:"ce-queue-field-name",children:e.field}),t("span",{className:"ce-chip ce-chip--ok",children:r("cardEditor.queue.chips.added",{count:e.added})}),t("span",{className:"ce-chip ce-chip--danger",children:r("cardEditor.queue.chips.removed",{count:e.removed})}),t("span",{className:"ce-chip",children:r("cardEditor.queue.chips.fieldWords",{count:e.wordCount})})]}),t("div",{className:"ce-diff",role:"group","aria-label":e.field,children:p.map(({lines:h,hidden:u},m)=>i("div",{className:"ce-diff-hunk",children:[u>0?t("div",{className:"ce-diff-line ce-diff-line--marker",children:r("cardEditor.queue.hiddenLines",{count:u})}):null,h.map((C,v)=>i("div",{className:`ce-diff-line ce-diff-line--${C.kind}`,children:[t("span",{className:"ce-diff-sign","aria-hidden":"true",children:C.kind==="add"?"+":C.kind==="del"?"\u2212":"\xA0"}),t("span",{className:"ce-diff-text",children:C.text})]},v))]},m))}),n?t("button",{type:"button",className:"ce-queue-expander",onClick:l,children:r("cardEditor.queue.field.expand")}):null,t("pre",{className:"ce-queue-fullfield",children:e.newText})]})}function mo({localization:e,session:a,focusItemId:o,onRefresh:s,onClose:l}){let r=(w,k)=>ee(e,w,k),d=it(()=>a.items.filter(Jr),[a.items]),[n,p]=c(o),[h,u]=c(!1),[m,C]=c(null),[v,S]=c(null),[M,N]=c(null),[B,R]=c(null),[j,P]=c(new Set),A=d.findIndex(w=>w.itemId===n),T=A>=0?d[A]:null,W=it(()=>T?ws(T):[],[T]);H(()=>{if(T)return;let w=d.find(Ee)??d[0]??null;p(w?.itemId??null)},[T,d]);let oe=se(null);H(()=>{C(null),S(null),N(null),R(null),P(new Set),oe.current?.focus({preventScroll:!0})},[n]);let U=(w,k)=>B===null?k===0:B.has(w),Z=w=>R(k=>{let D=new Set(k??new Set(W[0]?[W[0].field]:[]));return D.has(w)?D.delete(w):D.add(w),D}),_=T!==null&&Ee(T),J=w=>{let k=d[w];k&&p(k.itemId)},E=w=>{let D=d.filter(re=>re.itemId!==w).find(Ee)??null;p(D?.itemId??w)},X=async w=>{if(!T||h||!_)return;u(!0),S(null),N(null);let k=await ta(a,T,{force:w});if(u(!1),k.kind==="needs-confirmation"){C(k.holds),s();return}if(k.kind==="applied"){let D=T.itemId;s(),E(D);return}if(k.kind==="apply-failed"){N(k.message),s();return}S(k.message)},$=async()=>{if(!T||h||!_)return;u(!0),S(null),N(null);let w=await Vr(a,T);if(u(!1),w.kind==="rejected"){let k=T.itemId;s(),E(k);return}S(w.message)},pe=async()=>{if(h)return;u(!0),S(null);let w=d.filter(Ee);for(let k of w)await ta(a,k,{force:!1});u(!1),s(),p(k=>d.some(D=>D.itemId===k&&Ee(D))?k:null)};H(()=>{let w=k=>{let D=k.target;if(!(D&&(D.tagName==="INPUT"||D.tagName==="TEXTAREA"||D.tagName==="SELECT"||D.isContentEditable))&&!h){if(k.key==="ArrowLeft"){A>0&&(k.preventDefault(),J(A-1));return}if(k.key==="ArrowRight"){A>=0&&A<d.length-1&&(k.preventDefault(),J(A+1));return}!_||k.ctrlKey||k.metaKey||k.altKey||(k.key==="r"||k.key==="R"?(k.preventDefault(),$()):(k.key==="a"||k.key==="A")&&(k.preventDefault(),X(!1)))}};return document.addEventListener("keydown",w),()=>document.removeEventListener("keydown",w)});let me=W.reduce((w,k)=>({added:w.added+k.added,removed:w.removed+k.removed}),{added:0,removed:0}),b=d.filter(Ee).length;return i("div",{className:"ce-queue",children:[i("div",{className:"ce-queue-head",children:[i("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:l,children:[t(Ae,{className:"ce-icon","aria-hidden":"true"}),r("cardEditor.queue.close")]}),t("strong",{className:"ce-panel-heading",children:r("cardEditor.queue.title")}),t("span",{className:"ce-caption",children:d.length===0?"":r("cardEditor.queue.position",{index:A+1,count:d.length})})]}),d.length>0?t("div",{className:"ce-queue-dots",role:"group","aria-label":r("cardEditor.queue.dotsLabel"),children:d.map((w,k)=>{let D=w.status==="applied"||w.status==="duplicated"?"approved":w.status==="rejected"?"rejected":"pending";return t("button",{type:"button",className:`ce-dot ce-dot--${D}${k===A?" ce-dot--current":""}`,"aria-label":r("cardEditor.queue.dotLabel",{name:w.characterName,status:r(va(w.status))}),"aria-current":k===A,onClick:()=>J(k)},w.itemId)})}):null,T?i("article",{className:"ce-queue-card",ref:oe,tabIndex:-1,"aria-label":T.characterName,children:[i("header",{className:"ce-queue-card-head",children:[t("h3",{className:"ce-queue-name",children:T.characterName}),t("span",{className:`ce-chip ce-chip--${Ka(T.status)}`,children:r(va(T.status))})]}),i("div",{className:"ce-queue-chips",children:[t("span",{className:"ce-chip",children:r("cardEditor.queue.chips.fields",{count:W.length})}),t("span",{className:"ce-chip ce-chip--ok",children:r("cardEditor.queue.chips.added",{count:me.added})}),t("span",{className:"ce-chip ce-chip--danger",children:r("cardEditor.queue.chips.removed",{count:me.removed})})]}),a.config.saveMode==="duplicate"?t("p",{className:"ce-caption",children:r("cardEditor.queue.duplicateNote")}):null,t("div",{className:"ce-queue-fields",children:W.map((w,k)=>t(ks,{preview:w,expanded:U(w.field,k),showAll:j.has(w.field),onToggle:()=>Z(w.field),onShowAll:()=>P(D=>new Set([...D,w.field])),t:r},w.field))}),m?i("div",{className:"ce-queue-stale",role:"alert",children:[t("p",{children:r("cardEditor.queue.staleTitle",{count:m.length})}),i("div",{className:"ce-queue-stale-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:h,onClick:()=>{X(!0)},children:r("cardEditor.queue.staleApply")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:h,onClick:()=>C(null),children:r("cardEditor.queue.staleSkip")})]})]}):null,M?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.queue.applyFailed",{message:M})}):null,v?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.queue.verdictError",{message:v})}):null,i("footer",{className:"ce-queue-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A<=0,"aria-label":r("cardEditor.queue.prev"),onClick:()=>J(A-1),children:t(Ae,{className:"ce-icon","aria-hidden":"true"})}),i("button",{type:"button",className:"mari-chrome-control ce-queue-reject",disabled:h||!_,onClick:()=>{$()},children:[t(ue,{className:"ce-icon","aria-hidden":"true"}),r("cardEditor.queue.reject"),t("kbd",{className:"ce-key-hint",children:r("cardEditor.queue.rejectHint")})]}),i("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary ce-queue-approve",disabled:h||!_,onClick:()=>{X(!1)},children:[t(fa,{className:"ce-icon","aria-hidden":"true"}),r(h?"cardEditor.queue.working":"cardEditor.queue.approve"),t("kbd",{className:"ce-key-hint",children:r("cardEditor.queue.approveHint")})]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A<0||A>=d.length-1,"aria-label":r("cardEditor.queue.next"),onClick:()=>J(A+1),children:t($e,{className:"ce-icon","aria-hidden":"true"})})]})]}):t("div",{className:"ce-status",role:"status",children:r("cardEditor.queue.empty")}),b>0?t("button",{type:"button",className:"ce-queue-approve-all",disabled:h,onClick:()=>{pe()},children:r(h?"cardEditor.queue.approveAllWorking":"cardEditor.queue.approveAll")}):null]})}var et=50;function Es({item:e,t:a}){if(ra(e)&&e.failure)return t("span",{className:"ce-item-failure",children:e.failure.message});if(e.status==="awaiting-split")return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.splitProposed",{count:e.characters?.length??0})});if(e.status==="split")return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.splitInto",{count:e.characters?.length??0})});if(e.resultCardId)return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.copyCreated",{id:e.resultCardId})});if(e.status==="applied"&&(e.updates??[]).length===0)return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.noChanges")});let o=Zr(e);return o?t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.summary",{fields:o.fields,added:o.added,removed:o.removed})}):null}function po({localization:e,sessionId:a,onBack:o,onDeleted:s,onRerun:l}){let r=(L,Q)=>ee(e,L,Q),[d,n]=c(null),[p,h]=c(!1),[u,m]=c(null),[C,v]=c(!1),[S,M]=c({}),[N,B]=c(null),[R,j]=c(null),[P,A]=c(0),[T,W]=c("closed"),[oe,U]=c(null),[Z,_]=c(null),J=se(new Set),[E,X]=c(!1),[$,pe]=c(null),[me,b]=c(!1),[w,k]=c(null),D=se(new Set),re=se(!1),ce=Be(()=>{Qe(a).then(L=>{n(L),h(!1)}).catch(()=>h(!0))},[a]),be=sa(ce,2e3);H(()=>{if(!d||Z!==null||oe!==null||T!=="closed")return;let L=d.items.find(Q=>Q.status==="failed-parse"&&Q.failure?.rawOutput&&!J.current.has(Q.itemId));L&&(J.current.add(L.itemId),_(L.itemId))},[oe,Z,T,d]),H(()=>{if(!d||(d.config.completionMode??"ask")!=="ask")return;let L=d.items.filter(Q=>Q.status==="awaiting-review"&&Q.autoApply===!0&&!D.current.has(Q.itemId));if(L.length!==0){for(let Q of L)D.current.add(Q.itemId);(async()=>{for(let Q of L){let ae=await ta(d,Q,{force:!1});(ae.kind==="failed"||ae.kind==="report-failed")&&M(ke=>({...ke,[Q.itemId]:ae.message}))}ce()})()}},[d,ce]),H(()=>{if(!d||re.current||d.status!=="completed")return;let L=d.config.completionMode??"ask";d.items.filter(ae=>Array.isArray(ae.pendingOps)||L==="apply"&&ae.status==="awaiting-review").length!==0&&(re.current=!0,Xa(d,(ae,ke)=>B({done:ae,total:ke})).then(ae=>{n(ae.session),ae.messages.length>0&&m(ae.messages[0])}).finally(()=>{re.current=!1,B(null),ce()}))},[d,ce]);let le=async(L,Q)=>{if(!R){j(L),m(null);try{let ae=await Q();ae?n(ae):ce()}catch(ae){m(ae instanceof Error?ae.message:String(ae))}finally{j(null)}}},qe=()=>{le("run-again",async()=>{let L=await Fa(a);return l?.(L.id),L})},Ce=()=>{le("rerun-all",async()=>{let L=(d?.items??[]).filter(ra);for(let Q of L)await La(a,Q.itemId)})},Se=()=>{le("delete",async()=>{await qa(a,{force:d?.status==="active"}),s()})},we=()=>{le("combine",async()=>{if(!d)return;let Q=d.items.filter(ke=>ke.status==="applied").length<d.items.length,ae=await Gr(d,...Q?[{confirmPartial:!0}]:[]);if(ae.kind==="failed")throw new Error(ae.message);return v(!1),ae.session})},g=L=>{le("duplicate-applied",async()=>{if(!d)return;let Q=await Wr(d);return Q.failedCount>0&&m(r("cardEditor.panel.detail.duplicateAppliedPartial",{failed:Q.failedCount,total:L})),Q.session})};if(p&&!d)return i("section",{className:"ce-shell ce-panel",ref:be,children:[i("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:o,children:[t(Ae,{className:"ce-icon","aria-hidden":"true"}),r("cardEditor.panel.back")]}),t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.panel.detail.loadError")})]});if(!d)return t("section",{className:"ce-shell ce-panel",ref:be,children:t("div",{className:"ce-status",role:"status",children:r("cardEditor.panel.detail.loading")})});if(T!=="closed")return t("section",{className:"ce-shell ce-panel",ref:be,children:t(mo,{localization:e,session:d,focusItemId:T,onRefresh:ce,onClose:()=>W("closed")})});let I=d.config.transform?Yr(d):null,y=w??I?.phase??1,q=I?d.items.filter(L=>(L.phase??1)===y):d.items,V=$?d.items.find(L=>L.itemId===$&&L.status==="awaiting-split")??null:null,f=d.items.filter(L=>L.status!=="split"&&L.status!=="staged").length,F=Z?d.items.find(L=>L.itemId===Z)??null:null,K=oe?d.items.find(L=>L.itemId===oe)??null:null,G=d.items.filter(Ee).length,Y=d.items.filter(ra).length,he=d.config.saveMode==="combined",Le=he?d.items.filter(L=>L.status==="applied").length:0,Pe=he&&!d.combinedCardId&&Le>0,Je=Pe&&Le<f,He=he?0:d.items.filter(L=>L.status==="applied"&&L.resultCardId===void 0&&(L.updates??[]).length>0).length,ge=Ja(d),Ue=Math.max(1,Math.ceil(q.length/et)),Te=Math.min(P,Ue-1),tt=q.slice(Te*et,Te*et+et);return i("section",{className:"ce-shell ce-panel",ref:be,"data-card-editor-view":"session-detail",children:[i("div",{className:"ce-panel-head",children:[i("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:o,children:[t(Ae,{className:"ce-icon","aria-hidden":"true"}),r("cardEditor.panel.back")]}),t("strong",{className:"ce-panel-heading",children:d.label}),t("span",{className:`ce-chip ce-chip--${d.status==="active"?"live":d.status==="completed"?"ok":"muted"}`,children:r(`cardEditor.panel.sessionStatus.${d.status}`)}),t("span",{className:"ce-chip",children:r(`cardEditor.panel.completionMode.${d.config.completionMode??"ask"}`)})]}),I?i("div",{className:"ce-pipeline",role:"group","aria-label":r("cardEditor.pipeline.label"),children:[i("div",{className:"ce-pipeline-count",children:[t("strong",{children:r("cardEditor.pipeline.count",{sources:I.sources,results:I.results})}),t("span",{className:"ce-caption",children:I.splitsAccepted>0?r("cardEditor.pipeline.splitsAccepted",{count:I.splitsAccepted}):r("cardEditor.pipeline.noSplits")})]}),d.config.transform?.phase2?.enabled?t("div",{className:"ce-segmented",role:"radiogroup","aria-label":r("cardEditor.pipeline.phaseLabel"),children:[1,2].map(L=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":y===L,disabled:L===2&&I.phase===1,onClick:()=>{k(L),A(0)},children:r("cardEditor.pipeline.phase",{phase:L})},L))}):null,I.splitsPending>0?t("span",{className:"ce-chip ce-chip--review",children:r("cardEditor.pipeline.splitsPending",{count:I.splitsPending})}):null]}):null,d.combinedCardId?t("div",{className:"ce-notice",role:"status",children:t("span",{children:r("cardEditor.panel.detail.combinedCreated",{id:d.combinedCardId})})}):null,d.status==="interrupted"?t("div",{className:"ce-notice",role:"status",children:t("span",{children:r("cardEditor.panel.interruptedNotice")})}):null,d.status==="active"?t("p",{className:"ce-caption",role:"status",children:ge.kind==="batch"?r("cardEditor.panel.live.batch",{index:ge.batchIndex,count:ge.batchCount})+(ge.batchAttempts>1?r("cardEditor.panel.live.batchRetry",{attempt:ge.batchAttempts}):""):ge.kind==="items"?r("cardEditor.panel.live.items",{running:ge.runningItems,total:d.stats.total}):ge.kind==="queued"?r("cardEditor.panel.live.queued",{count:ge.queuedItems}):r("cardEditor.panel.progress",{done:d.stats.done,total:d.stats.total})}):null,N?t("p",{className:"ce-caption ce-live-line",role:"status",children:r("cardEditor.panel.enforcementProgress",N)}):null,u?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.panel.detail.actionError",{message:u})}):null,i("div",{className:"ce-panel-actions",children:[Pe?Je&&!C?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>v(!0),children:r("cardEditor.panel.detail.combine",{count:Le})}):Je&&C?i("span",{className:"ce-confirm-strip",role:"group","aria-label":r("cardEditor.panel.detail.combine"),children:[t("span",{className:"ce-caption",children:r("cardEditor.panel.detail.combinePartialConfirm",{count:Le,total:f})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:we,children:r("cardEditor.panel.detail.combineYes",{count:Le})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>v(!1),children:r("cardEditor.panel.detail.combineNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:R!==null,onClick:we,children:r("cardEditor.panel.detail.combine",{count:Le})}):null,He>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>g(He),children:r("cardEditor.panel.detail.duplicateApplied",{count:He})}):null,I?.phase2Ready?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:R!==null,onClick:()=>{le("phase2",async()=>{let L=await jt(a);return k(2),L})},children:r("cardEditor.pipeline.startPhase2",{count:I.results})}):null,I||he?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>b(!0),children:r("cardEditor.avatar.open")}):null,G>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",onClick:()=>W(null),children:r("cardEditor.panel.detail.reviewQueue",{count:G})}):null,d.status==="active"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>{le("cancel-all",()=>Da(a))},children:r("cardEditor.panel.detail.cancelAll")}):null,d.status==="completed"||d.status==="canceled"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:qe,children:r("cardEditor.panel.runAgain")}):null,Y>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:Ce,children:r("cardEditor.panel.detail.rerunFailed",{count:Y})}):null,E?i("span",{className:"ce-confirm-strip",role:"group","aria-label":r("cardEditor.panel.delete"),children:[t("span",{className:"ce-caption",children:d.status==="active"?r("cardEditor.panel.deleteConfirmActive"):r("cardEditor.panel.deleteConfirm")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:R!==null,onClick:Se,children:d.status==="active"?r("cardEditor.panel.deleteYesActive"):r("cardEditor.panel.deleteYes")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>X(!1),children:r("cardEditor.panel.deleteNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>X(!0),children:r("cardEditor.panel.detail.delete")})]}),t("ul",{className:"ce-items",children:tt.map(L=>{let Q=Ee(L),ae=(L.status==="applied"||L.status==="duplicated")&&(L.updates??[]).length>0,ke=ra(L),Me=ra(L)&&L.failure?.renderedPrompt!==void 0,wa=L.status==="failed-parse"&&!!L.failure?.rawOutput,la=L.status==="queued"&&d.status==="active",da=L.status==="awaiting-split",ka=Qr(L,d.items),Ea=(L.characters??[]).reduce((ze,Ne)=>ze+(Ne.issues?.length??0),0);return i("li",{className:`ce-item${ka?" ce-item--child":""}`,children:[i("div",{className:"ce-item-main",children:[t("span",{className:"ce-item-name",children:L.characterName}),L.lineage?.splitGroupId?t("span",{className:"ce-chip",children:r("cardEditor.panel.detail.lineage",{index:L.lineage.splitIndex??1,count:L.lineage.splitCount??1,origin:L.lineage.originName})}):null,Ea>0?t("span",{className:"ce-chip ce-chip--review",title:(L.characters??[]).flatMap(ze=>ze.issues??[]).join(`
`),children:r("cardEditor.panel.detail.issues",{count:Ea})}):null,t("span",{className:`ce-chip ce-chip--${Ka(L.status)}`,children:r(va(L.status))})]}),i("div",{className:"ce-item-sub",children:[t(Es,{item:L,t:r}),S[L.itemId]?t("span",{className:"ce-item-failure",children:r("cardEditor.panel.detail.autoApplyError",{name:L.characterName,message:S[L.itemId]})}):null]}),Q||ae||ke||Me||la||da?i("div",{className:"ce-item-actions",children:[da?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",onClick:()=>pe(L.itemId),children:r("cardEditor.panel.action.reviewSplit")}):null,Q?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>W(L.itemId),children:r("cardEditor.panel.action.review")}):null,ae?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>W(L.itemId),children:r("cardEditor.panel.action.inspect")}):null,ke?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>{le(`rerun-${L.itemId}`,()=>La(a,L.itemId))},children:r("cardEditor.panel.action.rerun")}):null,wa?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>_(L.itemId),children:r("cardEditor.panel.action.fixJson")}):null,Me?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>U(L.itemId),children:r("cardEditor.panel.action.editRetry")}):null,la?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R!==null,onClick:()=>{le(`cancel-${L.itemId}`,()=>Qt(a,L.itemId))},children:r("cardEditor.panel.action.cancelItem")}):null]}):null]},L.itemId)})}),Ue>1?i("div",{className:"ce-pager",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:Te<=0,"aria-label":r("cardEditor.panel.detail.pagePrev"),onClick:()=>A(Te-1),children:t(Ae,{className:"ce-icon","aria-hidden":"true"})}),t("span",{className:"ce-caption",children:r("cardEditor.panel.detail.page",{page:Te+1,pages:Ue})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:Te>=Ue-1,"aria-label":r("cardEditor.panel.detail.pageNext"),onClick:()=>A(Te+1),children:t($e,{className:"ce-icon","aria-hidden":"true"})})]}):null,F&&F.status==="failed-parse"?t(no,{localization:e,session:d,item:F,onClose:()=>_(null),onUpdated:L=>{n(L),_(null)}}):null,V?t(fo,{localization:e,session:d,item:V,onClose:()=>pe(null),onUpdated:L=>{n(L),pe(null)}}):null,me?t(lo,{localization:e,session:d,onClose:()=>b(!1)}):null,K?t(io,{localization:e,session:d,item:K,onClose:()=>U(null),onRetried:L=>{n(L),U(null)}}):null]})}function Ps({localization:e}){let a=(M,N)=>ee(e,M,N),[o,s]=c(!1),[l,r]=c(0),[d,n]=c(!1),[p,h]=c(!1),[u,m]=c(!1),[C,v]=c(null);H(()=>{let M=!1;return Na().then(N=>{M||(r(N.maxParallelAgents??0),n(N.disableAutoVerdicts),s(!0))}).catch(()=>{M||v("Could not load the bulk settings.")}),()=>{M=!0}},[]);let S=async()=>{if(!(p||!o)){h(!0),v(null),m(!1);try{await Yt({version:1,maxParallelAgents:l>0?l:null,disableAutoVerdicts:d}),m(!0)}catch(M){v(M instanceof Error?M.message:String(M))}finally{h(!1)}}};return i("details",{className:"ce-settings","data-ce-section":"bulk-settings",children:[t("summary",{className:"ce-section-heading",children:a("cardEditor.panel.settings.title")}),t(je,{id:"ce-settings-max-parallel",label:a("cardEditor.panel.settings.maxParallelAgents"),value:l,min:0,max:16,onChange:M=>{r(M),m(!1)}}),t("p",{className:"ce-caption",children:a("cardEditor.panel.settings.maxParallelAgentsHint")}),i("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:d,onChange:M=>{n(M.target.checked),m(!1)}}),i("span",{className:"ce-choice-copy",children:[t("strong",{children:a("cardEditor.panel.settings.disableAutoVerdicts")}),t("small",{children:a("cardEditor.panel.settings.disableAutoVerdictsHint")})]})]}),i("div",{className:"ce-session-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p||!o,onClick:()=>{S()},children:a("cardEditor.panel.settings.save")}),u?t("span",{className:"ce-caption",children:a("cardEditor.panel.settings.saved")}):null]}),C?t("div",{className:"ce-status ce-status--error",role:"alert",children:a("cardEditor.panel.detail.actionError",{message:C})}):null]})}function As({session:e,t:a}){return i("span",{className:"ce-session-chips",children:[t("span",{className:"ce-chip",children:e.config.mode==="batched"?a("cardEditor.panel.modeBatched",{size:e.config.batchSize}):a("cardEditor.panel.modeIndividual")}),t("span",{className:"ce-chip",children:a(`cardEditor.panel.saveMode.${e.config.saveMode}`)}),t("span",{className:"ce-chip",children:a(`cardEditor.panel.completionMode.${e.config.completionMode??"ask"}`)})]})}function Rs({session:e,t:a}){let o=Ja(e),s=o.kind==="batch"?a("cardEditor.panel.live.batch",{index:o.batchIndex,count:o.batchCount})+(o.batchAttempts>1?a("cardEditor.panel.live.batchRetry",{attempt:o.batchAttempts}):""):o.kind==="items"?a("cardEditor.panel.live.items",{running:o.runningItems,total:e.stats.total}):o.kind==="queued"?a("cardEditor.panel.live.queued",{count:o.queuedItems}):a("cardEditor.panel.live.settling");return t("p",{className:"ce-caption ce-live-line",role:"status",children:s})}function ho({localization:e,agentName:a,detailId:o,onDetailIdChange:s,splitView:l=!1}){let r=(b,w)=>ee(e,b,w),[d,n]=c(null),[p,h]=c({}),[u,m]=c(!1),[C,v]=c(null),S=o!==void 0,M=S?o:C,N=b=>{S?s?.(b):v(b)},[B,R]=c(null),[j,P]=c(null),[A,T]=c(null),[W,oe]=c({}),U=se(new Set),Z=Be(()=>{Ba().then(async b=>{n(Array.isArray(b)?b:[]),m(!1);let w=(Array.isArray(b)?b:[]).filter(re=>re.status==="active"||re.status==="completed"&&(re.pendingApplyCount>0||re.enforcementPendingCount>0)),k=await Promise.allSettled(w.map(re=>Qe(re.id))),D={};k.forEach((re,ce)=>{re.status==="fulfilled"&&(D[w[ce].id]=re.value)}),h(D)}).catch(()=>m(!0))},[]),_=sa(Z,2e3,M===null);H(()=>{if(M===null)for(let b of Object.values(p)){if(b.status!=="completed"||U.current.has(b.id))continue;let w=b.config.completionMode??"ask";b.items.filter(D=>Array.isArray(D.pendingOps)||w==="apply"&&D.status==="awaiting-review").length!==0&&(U.current.add(b.id),Xa(b,(D,re)=>oe(ce=>({...ce,[b.id]:{done:D,total:re}}))).then(D=>{D.messages.length>0&&T(D.messages[0])}).finally(()=>{U.current.delete(b.id),oe(D=>{let{[b.id]:re,...ce}=D;return ce}),Z()}))}},[p,M,Z]);let J=async(b,w)=>{if(!j){P(b),T(null);try{await w(),Z()}catch(k){T(k instanceof Error?k.message:String(k))}finally{P(null)}}},E=M?t(po,{localization:e,sessionId:M,onBack:()=>{N(null),Z()},onDeleted:()=>{N(null),R(null),Z()},onRerun:b=>{N(b),Z()}}):null,X=d??[],$=X.filter(b=>b.status==="active"),pe=X.filter(b=>b.status!=="active"),me=i(Oe,{children:[i("div",{className:"ce-panel-head",children:[t("strong",{className:"ce-panel-heading",children:r("cardEditor.panel.title")}),i("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-refresh-button",disabled:j!==null,onClick:Z,children:[t(ha,{className:"ce-icon","aria-hidden":"true"}),r("cardEditor.panel.refresh")]})]}),u?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.panel.loadError")}):null,A?t("div",{className:"ce-status ce-status--error",role:"alert",children:r("cardEditor.panel.detail.actionError",{message:A})}):null,d===null&&!u?t("div",{className:"ce-status",role:"status",children:r("cardEditor.panel.loading")}):null,d!==null&&X.length===0?t("p",{className:"ce-caption",children:r("cardEditor.panel.empty")}):null,t(Ps,{localization:e}),$.length>0?i("div",{className:"ce-panel-section","data-ce-section":"active",children:[t("span",{className:"ce-section-heading",children:r("cardEditor.panel.activeTitle")}),t("ul",{className:"ce-sessions",children:$.map(b=>{let w=p[b.id],k=b.stats.total>0?b.stats.done/b.stats.total:0;return i("li",{className:"ce-session ce-session--active",children:[i("div",{className:"ce-session-top",children:[t("button",{type:"button",className:"ce-session-label",onClick:()=>N(b.id),children:b.label}),w?t(As,{session:w,t:r}):null]}),t("div",{className:"ce-progress",role:"progressbar","aria-valuemin":0,"aria-valuemax":b.stats.total,"aria-valuenow":b.stats.done,"aria-label":r("cardEditor.panel.progress",{done:b.stats.done,total:b.stats.total}),children:t("div",{className:"ce-progress-fill",style:{width:`${Math.round(k*100)}%`}})}),t("span",{className:"ce-caption",children:r("cardEditor.panel.progress",{done:b.stats.done,total:b.stats.total})}),w?t(Rs,{session:w,t:r}):null,t("div",{className:"ce-session-actions",children:t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:j!==null,onClick:()=>{J(b.id,()=>Da(b.id))},children:r("cardEditor.panel.cancel")})})]},b.id)})})]}):null,pe.length>0?i("div",{className:"ce-panel-section","data-ce-section":"history",children:[t("span",{className:"ce-section-heading",children:r("cardEditor.panel.historyTitle")}),t("ul",{className:"ce-sessions",children:pe.map(b=>i("li",{className:"ce-session",children:[t("button",{type:"button",className:"ce-session-label",onClick:()=>N(b.id),children:b.label}),i("span",{className:"ce-session-meta",children:[t("span",{className:`ce-chip ce-chip--${b.status==="completed"?"ok":"muted"}`,children:r(`cardEditor.panel.sessionStatus.${b.status}`)}),t("span",{className:"ce-chip",children:r(`cardEditor.panel.completionMode.${b.completionMode}`)}),t("span",{className:"ce-caption",children:r("cardEditor.panel.progress",{done:b.stats.done,total:b.stats.total})}),b.stats.failed>0?t("span",{className:"ce-chip ce-chip--danger",children:r("cardEditor.panel.statsFailed",{count:b.stats.failed})}):null,t("span",{className:"ce-caption ce-session-date",children:new Date(b.createdAt).toLocaleString()})]}),b.status==="interrupted"?t("p",{className:"ce-caption ce-session-note",children:r("cardEditor.panel.interruptedNotice")}):null,W[b.id]?t("p",{className:"ce-caption ce-live-line",role:"status",children:r("cardEditor.panel.enforcementProgress",W[b.id])}):null,b.status==="completed"||b.status==="canceled"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:j!==null,onClick:()=>{J(b.id,async()=>{let w=await Fa(b.id);N(w.id)})},children:r("cardEditor.panel.runAgain")}):null,B===b.id?i("span",{className:"ce-confirm-strip",role:"group","aria-label":r("cardEditor.panel.delete"),children:[t("span",{className:"ce-caption",children:r("cardEditor.panel.deleteConfirm")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:j!==null,onClick:()=>{J(b.id,async()=>{await qa(b.id),R(null)})},children:r("cardEditor.panel.deleteYes")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:j!==null,onClick:()=>R(null),children:r("cardEditor.panel.deleteNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-session-delete",disabled:j!==null,onClick:()=>R(b.id),children:r("cardEditor.panel.delete")})]},b.id))})]}):null]});return E?l?t("section",{className:"ce-shell ce-panel ce-panel--workspace","data-card-editor-view":"agent-panel",ref:_,"aria-label":a?r("cardEditor.panel.titleWithAgent",{agent:a}):r("cardEditor.panel.title"),children:i("div",{className:"ce-workspace-split",children:[t("div",{className:"ce-workspace-rail",children:me}),t("div",{className:"ce-workspace-main",children:E})]})}):E:t("section",{className:"ce-shell ce-panel","data-card-editor-view":"agent-panel",ref:_,"aria-label":a?r("cardEditor.panel.titleWithAgent",{agent:a}):r("cardEditor.panel.title"),children:me})}var Rt="marinara:capability-overlay",go="card-editor",Ts=new Set(["standard","strict","rebalance","xml-simple","xml-complex","custom","transform"]),Ms=new Set(["markdown","xml","json"]),Ns=new Set(["confirm","auto","duplicate","combined"]);function Bs(e){if(e===null||typeof e!="object"||Array.isArray(e))return;let a=e,o=d=>typeof a[d]=="string"?a[d]:void 0,s=o("presetId"),l=o("saveMode"),r={...s!==void 0&&Ts.has(s)?{presetId:s}:{},...o("globalInstruction")!==void 0?{globalInstruction:o("globalInstruction")}:{},...l!==void 0&&Ns.has(l)?{saveMode:l}:{},...o("duplicatePrefix")!==void 0?{duplicatePrefix:o("duplicatePrefix")}:{},...o("combinedCardName")!==void 0?{combinedCardName:o("combinedCardName")}:{},...o("label")!==void 0?{label:o("label")}:{},...o("schemaId")!==void 0&&/^[\w-]{1,80}$/.test(o("schemaId"))?{schemaId:o("schemaId")}:{},...Ms.has(o("format")??"")?{format:o("format")}:{}};return Object.keys(r).length>0?r:void 0}function Tt(e){window.dispatchEvent(new CustomEvent(Rt,{detail:{packageId:go,action:"open",payload:e}}))}function xo({localization:e}){let a=(m,C)=>ee(e,m,C),[o,s]=c(!1),[l,r]=c(null),[d,n]=c(null),[p,h]=c(void 0);if(H(()=>{let m=C=>{let v=C.detail;if(!v||v.packageId!==go)return;if(v.action==="close"){s(!1);return}if(v.action!=="open")return;let S=v.payload;r(typeof S?.sessionId=="string"&&S.sessionId?S.sessionId:null);let M=S?.dispatch?.characterIds;n(Array.isArray(M)?M.filter(N=>typeof N=="string"&&N.length>0):null),h(Bs(S?.dispatch?.prefill)),s(!0)};return window.addEventListener(Rt,m),()=>window.removeEventListener(Rt,m)},[]),H(()=>{if(!o||d!==null)return;let m=C=>{C.key==="Escape"&&s(!1)};return window.addEventListener("keydown",m),()=>window.removeEventListener("keydown",m)},[o,d]),!o)return null;let u=m=>{n(null),r(m.id)};return t("div",{className:"ce-overlay ce-workspace-overlay",children:i("div",{className:"ce-dialog ce-workspace",role:"dialog","aria-modal":"true","aria-label":a("cardEditor.workspace.title"),children:[i("div",{className:"ce-dialog-head",children:[t("span",{children:a("cardEditor.workspace.title")}),t("button",{type:"button",className:"ce-dialog-close","aria-label":a("cardEditor.workspace.close"),onClick:()=>s(!1),children:t(ue,{className:"ce-icon","aria-hidden":"true"})})]}),t("div",{className:"ce-workspace-body",children:t(ho,{localization:e,splitView:!0,detailId:l,onDetailIdChange:r})}),d!==null&&d.length>0?t(zr,{localization:e,characterIds:d,prefill:p,onClose:()=>n(null),onDispatched:u}):null]})})}function Lo({localization:e,agentName:a}){let o=(h,u)=>ee(e,h,u),[s,l]=c(null),r=Be(()=>{Ba().then(h=>l(Array.isArray(h)?h:[])).catch(()=>l([]))},[]),d=sa(r,5e3,!0),n=s?.filter(h=>h.status==="active").length??0,p=s?.filter(h=>h.status!=="active").length??0;return i("section",{className:"ce-shell ce-panel","data-card-editor-view":"agent-panel",ref:d,"aria-label":a?o("cardEditor.panel.titleWithAgent",{agent:a}):o("cardEditor.panel.title"),children:[t("div",{className:"ce-panel-head",children:t("strong",{className:"ce-panel-heading",children:o("cardEditor.panel.title")})}),t("p",{className:"ce-caption",children:o("cardEditor.panel.summaryCounts",{active:n,recent:p})}),t("button",{type:"button",className:"mari-chrome-control",onClick:()=>Tt(),children:o("cardEditor.panel.openWorkspace")})]})}var Io=`
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
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
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
  white-space: pre;
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
  display: grid;
  min-height: 0;
  place-items: center;
  align-content: center;
  gap: 0.5rem;
  overflow: auto;
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
  max-height: calc(min(90dvh, 58rem) - 9rem);
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
`;function Ds({props:e}){let a=(r,d)=>ee(e.localization,r,d),o=e.selectedCharacterIds??[],l=(e.selectionCount??o.length??0)>=1;return i("button",{type:"button",className:"mari-chrome-control ce-selection-button",disabled:!l,onClick:()=>{Tt({dispatch:{characterIds:o}}),e.onRequestClose?.()},children:[t(Ie,{className:"ce-icon","aria-hidden":"true"}),a("cardEditor.action.open")]})}function Fs({element:e}){let a=e.capabilityProps??{},o=e.getAttribute("view");return o==="selection-action"?t(Ds,{props:a}):o==="agent-panel"?t(Lo,{localization:a.localization,agentName:a.agent?.name}):o==="overlay"?t(xo,{localization:a.localization}):null}function Os({element:e}){let[,a]=c(0);H(()=>{let s=()=>a(l=>l+1);return e.addEventListener("marinara-capability-props",s),()=>e.removeEventListener("marinara-capability-props",s)},[e]);let o=e.capabilityProps?.localization?.direction==="rtl"?"rtl":"ltr";return i("div",{dir:o,style:{display:"contents"},children:[t("style",{children:Io}),t(Fs,{element:e})]})}var at=class extends HTMLElement{constructor(){super(...arguments);Ve(this,"__root",null);Ve(this,"capabilityProps")}attributeChangedCallback(o,s,l){o==="view"&&s!==l&&this.__root&&this.render()}render(){this.__root?.render(t(Os,{element:this}))}connectedCallback(){this.__root||(this.__root=Ut(this)),this.render()}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null)})}};Ve(at,"observedAttributes",["view"]);var bo="marinara-capability-card-editor";customElements.get(bo)||customElements.define(bo,at);
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
