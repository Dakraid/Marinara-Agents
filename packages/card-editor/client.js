var po=Object.defineProperty;var mo=(e,a,r)=>a in e?po(e,a,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[a]=r;var Ce=(e,a,r)=>mo(e,typeof a!="symbol"?a+"":a,r);var oa=globalThis.__MARINARA_HOST__,k=oa&&oa.version===1&&oa.modules?oa.modules.react:void 0;if(!k)throw new Error("Marinara Engine does not provide react; this package needs capability API 1.341 or newer.");var sr=k.Activity,lr=k.Children,dr=k.Component,ir=k.Fragment,nr=k.Profiler,ur=k.PureComponent,cr=k.StrictMode,fr=k.Suspense,pr=k.ViewTransition,mr=k.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,gr=k.__COMPILER_RUNTIME,hr=k.act,xr=k.addTransitionType,Lr=k.cache,Ir=k.cacheSignal,Cr=k.captureOwnerStack,Sr=k.cloneElement,br=k.createContext,_e=k.createElement,vr=k.createRef,kr=k.default,ra=k.forwardRef,wr=k.isValidElement,yr=k.lazy,Pr=k.memo,Er=k.startTransition,Ar=k.unstable_useCacheRefresh,Rr=k.use,Br=k.useActionState,xe=k.useCallback,Mr=k.useContext,Dr=k.useDebugValue,Tr=k.useDeferredValue,E=k.useEffect,Fr=k.useEffectEvent,st=k.useId,qr=k.useImperativeHandle,Nr=k.useInsertionEffect,Or=k.useLayoutEffect,Ma=k.useMemo,Hr=k.useOptimistic,Ur=k.useReducer,W=k.useRef,f=k.useState,zr=k.useSyncExternalStore,Vr=k.useTransition,Gr=k.version;var sa=globalThis.__MARINARA_HOST__,We=sa&&sa.version===1&&sa.modules?sa.modules["react-dom/client"]:void 0;if(!We)throw new Error("Marinara Engine does not provide react-dom/client; this package needs capability API 1.341 or newer.");var lt=We.createRoot,Wr=We.default,Xr=We.hydrateRoot,Kr=We.version;var dt=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),go=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,r,l)=>l?l.toUpperCase():r.toLowerCase()),Da=e=>{let a=go(e);return a.charAt(0).toUpperCase()+a.slice(1)},la=(...e)=>e.filter((a,r,l)=>!!a&&a.trim()!==""&&l.indexOf(a)===r).join(" ").trim(),it=e=>{for(let a in e)if(a.startsWith("aria-")||a==="role"||a==="title")return!0};var nt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var ut=ra(({color:e="currentColor",size:a=24,strokeWidth:r=2,absoluteStrokeWidth:l,className:d="",children:t,iconNode:s,...n},p)=>_e("svg",{ref:p,...nt,width:a,height:a,stroke:e,strokeWidth:l?Number(r)*24/Number(a):r,className:la("lucide",d),...!t&&!it(n)&&{"aria-hidden":"true"},...n},[...s.map(([m,u])=>_e(m,u)),...Array.isArray(t)?t:[t]]));var te=(e,a)=>{let r=ra(({className:l,...d},t)=>_e(ut,{ref:t,iconNode:a,className:la(`lucide-${dt(Da(e))}`,`lucide-${e}`,l),...d}));return r.displayName=Da(e),r};var ho=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],Xe=te("check",ho);var xo=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],Ke=te("chevron-down",xo);var Lo=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],ue=te("chevron-left",Lo);var Io=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],Se=te("chevron-right",Io);var Co=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],je=te("refresh-cw",Co);var So=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],oe=te("square-pen",So);var bo=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Q=te("x",bo);var Fa="/api",vo="/card-editor",ct="x-marinara-csrf";var ko="marinara_admin_secret";function qa(e){let a=e.status;return a==="apply"||a==="needs-confirmation"}var Je=class extends Error{constructor(r,l,d){super(l);Ce(this,"status");Ce(this,"payload");this.name="CardEditorApiError",this.status=r,this.payload=d}};function Na(){if(typeof window>"u")return{};try{let e=window.localStorage.getItem(ko)?.trim();return e?{"X-Admin-Secret":e}:{}}catch{return{}}}function Oa(e,a){if(!e||typeof e!="object"||Array.isArray(e))return a;let r=e;if(typeof r.error=="string"&&r.error.trim())return r.error.trim();if(r.error&&typeof r.error=="object"&&!Array.isArray(r.error)){let l=r.error.message;if(typeof l=="string"&&l.trim())return l.trim()}return typeof r.message=="string"&&r.message.trim()?r.message.trim():a}async function Y(e,a="GET",r,l){let d=new Headers(Na());a!=="GET"&&d.set(ct,"1"),r!==void 0&&d.set("Content-Type","application/json");let t=await fetch(`${Fa}${vo}${e}`,{method:a,headers:d,signal:l,cache:"no-store",credentials:"same-origin",...r===void 0?{}:{body:JSON.stringify(r)}});if(!t.ok){let s=await t.json().catch(()=>null);throw new Je(t.status,Oa(s,t.statusText),s)}if(t.status!==204)return t.json()}function be(e,a=""){return`/sessions/${encodeURIComponent(e)}${a}`}function Re(e,a,r){return be(e,`/items/${encodeURIComponent(a)}${r}`)}function ft(e){return Y("/sessions","POST",e)}function da(e){return Y("/settings","GET",void 0,e)}function pt(e){return Y("/settings","PUT",e)}function ia(e){return Y("/sessions","GET",void 0,e)}function Be(e,a){return Y(be(e),"GET",void 0,a)}function na(e){return Y(be(e,"/cancel"),"POST")}function ua(e){return Y(be(e,"/rerun"),"POST")}function $e(e,a){return Y(Re(e,a,"/retry"),"POST")}function mt(e,a){return Y(Re(e,a,"/cancel"),"POST")}function gt(e,a,r){return Y(Re(e,a,"/edit-retry"),"POST",r)}function ht(e,a,r){return Y(Re(e,a,"/repair"),"POST",{rawOutput:r})}function Ha(e,a,r){return Y(Re(e,a,"/verdict"),"POST",r)}function ca(e,a,r){return Y(Re(e,a,"/apply-result"),"POST",{results:r})}function xt(e){return Y(be(e,"/duplicate-applied"),"POST")}function Lt(e,a){return Y(be(e,"/combine"),"POST",a)}function fa(e,a={}){let r=a.force?"?force=true":"";return Y(be(e,r),"DELETE")}async function Me(e,a){let r=await fetch(`${Fa}${e}`,{headers:new Headers(Na()),signal:a,cache:"no-store",credentials:"same-origin"});if(!r.ok){let l=await r.json().catch(()=>null);throw new Je(r.status,Oa(l,r.statusText),l)}return r.json()}function Ua(e){try{let a=JSON.parse(e.data);if(a&&typeof a=="object"&&!Array.isArray(a)){let r=a.name;if(typeof r=="string"&&r.trim())return r}}catch{}return""}async function It(e){let a=await Me("/connections",e);return Array.isArray(a)?a.filter(r=>r&&typeof r.id=="string"&&typeof r.name=="string"&&r.provider!=="image_generation"&&r.provider!=="video_generation"):[]}async function Ct(e,a){let r=await Me(`/characters/${encodeURIComponent(e)}`,a),l=typeof r?.id=="string"&&r.id?r.id:e;return{id:l,name:Ua(r)||l,avatarPath:typeof r?.avatarPath=="string"&&r.avatarPath?r.avatarPath:null}}var wo=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions"];function Ta(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:{}}function Ae(e){return typeof e=="string"?e:""}function yo(e,a){let r=(()=>{try{return Ta(JSON.parse(typeof e?.data=="string"?e.data:"{}"))}catch{return{}}})(),l=Ta(r.extensions),d={name:Ae(r.name),backstory:Ae(l.backstory),appearance:Ae(l.appearance),...Object.fromEntries(wo.map(s=>[s,Ae(r[s])]))},t=typeof e?.id=="string"&&e.id?e.id:a;return{id:t,name:d.name.trim()||t,avatarPath:typeof e?.avatarPath=="string"&&e.avatarPath?e.avatarPath:null,fields:d}}async function De(e,a){let r=await Me(`/characters/${encodeURIComponent(e)}`,a);return yo(r,e)}function za(e){let{fields:a}=e;return{name:a.name,description:a.description,personality:a.personality,backstory:a.backstory,appearance:a.appearance,system_prompt:a.system_prompt}}async function St(e,a){let r=await Me(`/lorebooks/${encodeURIComponent(e)}/entries`,a);return Array.isArray(r)?r.map(l=>{let d=Ta(l);return{name:Ae(d.name),content:Ae(d.content),enabled:d.enabled!==!1&&d.enabled!=="false"}}):[]}async function Va(e,a,r){let l=new Headers(Na());l.set(ct,"1"),r!==void 0&&l.set("Content-Type","application/json");let d=await fetch(`${Fa}${e}`,{method:a,headers:l,cache:"no-store",credentials:"same-origin",...r===void 0?{}:{body:JSON.stringify(r)}});if(!d.ok){let t=await d.json().catch(()=>null);throw new Je(d.status,Oa(t,d.statusText),t)}return d.json()}function Ga(e,a,r){return Va(`/characters/${encodeURIComponent(e)}`,"PATCH",{data:a,versionSource:r.versionSource,versionReason:r.versionReason})}function bt(e){return Va(`/characters/${encodeURIComponent(e)}/duplicate`,"POST")}function vt(e){return Va("/characters","POST",{data:e})}function kt(e,a){let r=new URLSearchParams({limit:String(e.limit??50),offset:String(e.offset??0),sort:"name-asc"}),l=e.search?.trim();return l&&r.set("search",l),Me(`/characters/catalog?${r.toString()}`,a)}async function wt(e){let a=await Me("/lorebooks",e);return Array.isArray(a)?a.filter(r=>!!r&&typeof r.id=="string"&&typeof r.name=="string"):[]}function pa(e,a){let r=a.prefix?.trim()?a.prefix:void 0,l=a.suffix?.trim()?a.suffix:void 0,d=a.removePrefix?.trim()?a.removePrefix:void 0,t=a.removeSuffix?.trim()?a.removeSuffix:void 0,s=e;return d&&s.toLowerCase().startsWith(d.toLowerCase())&&(s=s.slice(d.length)),t&&s.toLowerCase().endsWith(t.toLowerCase())&&(s=s.slice(0,-t.length)),s=s.trim(),s||(s=e),`${r??""}${s}${l??""}`}var Po=/&#(?:(x|X)([0-9a-fA-F]+)|([0-9]+));/g,Eo=[[/&lt;/g,"<"],[/&gt;/g,">"],[/&quot;/g,'"'],[/&apos;/g,"'"],[/&nbsp;/g,"\xA0"]];function Le(e){let r=e.replace(Po,(l,d,t,s)=>{let n=d?Number.parseInt(t,16):Number(s);if(!Number.isInteger(n)||n<=0||n>1114111)return l;try{return String.fromCodePoint(n)}catch{return l}});for(let[l,d]of Eo)r=r.replace(l,d);return r.replace(/&amp;/g,"&")}var yt={_meta:{locale:"en",direction:"ltr"},"cardEditor.title":"Card Editor","cardEditor.panel.empty":"No bulk editing sessions yet.","cardEditor.error.network":"Could not reach Card Editor.","cardEditor.action.open":"Card Editor","cardEditor.dialog.title":"Bulk Card Editor","cardEditor.dialog.close":"Close","cardEditor.dialog.targets.title":"Targets \xB7 {{count}} characters","cardEditor.dialog.targets.loading":"Loading selected cards\u2026","cardEditor.dialog.targets.empty":"No targets left \u2014 close and select at least one character.","cardEditor.dialog.targets.loadFailed":"card could not be loaded","cardEditor.dialog.targets.notePlaceholder":"Focus on backstory\u2026","cardEditor.dialog.targets.noteLabel":"Note for {{name}}","cardEditor.dialog.targets.styleLabel":"Style override for {{name}}","cardEditor.dialog.targets.styleSession":"\u2014 use session style \u2014","cardEditor.dialog.targets.styleNone":"None","cardEditor.dialog.targets.unloadableBlock":"Remove cards that could not be loaded before dispatching.","cardEditor.dialog.targets.remove":"Remove {{name}}","cardEditor.dialog.search.placeholder":"Search characters\u2026","cardEditor.dialog.search.loading":"Searching\u2026","cardEditor.dialog.search.noResults":"No characters match.","cardEditor.dialog.search.error":"Characters could not be loaded.","cardEditor.dialog.model.title":"Model","cardEditor.dialog.model.connection":"Connection","cardEditor.dialog.model.connectionDefault":"\u2014 agent default \u2014","cardEditor.dialog.model.connectionsLoading":"Loading connections\u2026","cardEditor.dialog.model.connectionsError":"Connections could not be loaded.","cardEditor.dialog.model.preset":"Prompt preset","cardEditor.dialog.model.presetStandard":"Standard rewrite","cardEditor.dialog.model.presetStrict":"Strict surgical","cardEditor.dialog.model.presetRebalance":"Field rebalancing","cardEditor.dialog.model.presetXmlSimple":"XML \xB7 Simple","cardEditor.dialog.model.presetXmlComplex":"XML \xB7 Complex","cardEditor.dialog.model.presetCustom":"Custom\u2026","cardEditor.dialog.model.customTemplate":"Custom template","cardEditor.dialog.model.customTemplateHint":"The full prompt template sent for every card. Choosing Custom prefills this field with the current preset's body.","cardEditor.dialog.instructions.title":"Instructions & references","cardEditor.dialog.instructions.global":"Global instruction","cardEditor.dialog.instructions.globalPlaceholder":"Applies to every card \u2014 e.g. tighten prose, remove meta commentary\u2026","cardEditor.dialog.instructions.behavior":"Behavior character","cardEditor.dialog.instructions.behaviorHint":"One card whose behavior, judgment, and writing style guide how edits are written. The directive and notes still decide what changes.","cardEditor.dialog.instructions.behaviorNone":"None","cardEditor.dialog.instructions.lorebooks":"Global lorebooks","cardEditor.dialog.instructions.lorebooksHint":"Reference context applied to every card.","cardEditor.dialog.instructions.lorebooksFilter":"Filter lorebooks\u2026","cardEditor.dialog.instructions.lorebooksLoading":"Loading lorebooks\u2026","cardEditor.dialog.instructions.lorebooksEmpty":"No lorebooks in the library.","cardEditor.dialog.instructions.lorebooksNoneMatch":"No lorebooks match the filter.","cardEditor.dialog.instructions.lorebooksError":"Lorebooks could not be loaded.","cardEditor.dialog.processing.title":"Processing","cardEditor.dialog.processing.modeIndividual":"One agent per card","cardEditor.dialog.processing.modeBatched":"Batched \u2014 XML, N cards per call","cardEditor.dialog.processing.batchSize":"Batch size","cardEditor.dialog.processing.providerRetries":"Provider retries","cardEditor.dialog.processing.refusalRetries":"Refusal retries","cardEditor.dialog.processing.concurrency":"Concurrency","cardEditor.dialog.processing.rebalance":"Rebalance field content","cardEditor.dialog.processing.rebalanceHint":"Splits content into Description / Personality / Backstory / Appearance / Scenario.","cardEditor.dialog.processing.completionMode":"On completion","cardEditor.dialog.processing.completionAsk":"Ask (default)","cardEditor.dialog.processing.completionApply":"Always apply in place","cardEditor.dialog.processing.completionDuplicate":"Always duplicate","cardEditor.dialog.processing.completionCaption":"Apply mode holds stale cards for review instead of overwriting them. Duplicates use this session's prefix or suffix.","cardEditor.dialog.processing.autoDisabledNote":"The Card Editor's bulk settings require review, so auto-approve and on-completion writes are disabled here.","cardEditor.dialog.processing.overflowCaption":"On context overflow the failed batch is split and re-dispatched automatically until single-card calls remain.","cardEditor.dialog.saving.title":"Saving","cardEditor.dialog.saving.confirm":"In-place \u2014 confirm each card","cardEditor.dialog.saving.auto":"In-place \u2014 auto-approve (saves each character's latest revision)","cardEditor.dialog.saving.duplicate":"Duplicate \u2014 apply to copies","cardEditor.dialog.saving.duplicatePrefix":"Name prefix","cardEditor.dialog.saving.duplicatePrefixPlaceholder":"Prefix for the copy names","cardEditor.dialog.saving.duplicatePrefixHint":"Both affixes apply: copies are named prefix + name + suffix. Blank boxes are ignored.","cardEditor.dialog.saving.duplicateSuffix":"Name suffix","cardEditor.dialog.saving.duplicateSuffixPlaceholder":"Suffix for the copy names","cardEditor.dialog.saving.duplicateRemoveGroup":"Remove from name","cardEditor.dialog.saving.duplicateRemovePrefix":"Remove prefix","cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder":"Strip this from the start of the copy name","cardEditor.dialog.saving.duplicateRemoveSuffix":"Remove suffix","cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder":"Strip this from the end of the copy name","cardEditor.dialog.saving.duplicateNamePreview":"Copy name: {{name}}","cardEditor.dialog.saving.combined":"Combined \u2014 create one new card","cardEditor.dialog.saving.combinedName":"Combined card name","cardEditor.dialog.saving.combinedNamePlaceholder":"The one new card's name","cardEditor.dialog.saving.combinedCaption":"Each character's generated XML document is joined into ONE new card's description \u2014 no per-card writes.","cardEditor.dialog.saving.combinedNameRequired":"Enter a name for the combined card before dispatching.","cardEditor.dialog.saving.reviewRequiredHint":"The bulk settings require review, so auto-approve is unavailable \u2014 dispatches wait for your confirmation.","cardEditor.dialog.saving.caption":"In-place always writes a new revision. Auto-approve holds back cards that genuinely changed mid-run for review. Duplicates are renamed by the affixes above \u2014 prefix, suffix, and removals combine. Combined concatenates each generated XML document into one new card.","cardEditor.dialog.estimate":"Batched \xD7{{batch}} \u2192 {{batchedCalls}} calls \xB7 individual \u2192 {{individualCalls}} calls","cardEditor.dialog.dispatch":"Dispatch","cardEditor.dialog.dispatching":"Dispatching\u2026","cardEditor.dialog.dispatchError":"Could not create the session: {{message}}","cardEditor.panel.title":"Bulk runs","cardEditor.panel.openWorkspace":"Open Card Editor workspace","cardEditor.panel.summaryCounts":"{{active}} active \xB7 {{recent}} past sessions","cardEditor.panel.titleWithAgent":"Bulk runs \u2014 {{agent}}","cardEditor.panel.refresh":"Refresh","cardEditor.panel.loading":"Loading sessions\u2026","cardEditor.panel.loadError":"Sessions could not be loaded.","cardEditor.panel.activeTitle":"Active","cardEditor.panel.historyTitle":"History","cardEditor.panel.progress":"{{done}} of {{total}} cards","cardEditor.panel.modeIndividual":"individual","cardEditor.panel.modeBatched":"batched \xD7{{size}}","cardEditor.panel.saveMode.confirm":"confirm each card","cardEditor.panel.saveMode.auto":"auto-approve","cardEditor.panel.saveMode.duplicate":"duplicate","cardEditor.panel.saveMode.combined":"combined","cardEditor.panel.completionMode.ask":"on completion \xB7 ask","cardEditor.panel.completionMode.apply":"on completion \xB7 apply","cardEditor.panel.completionMode.duplicate":"on completion \xB7 duplicate","cardEditor.panel.enforcementProgress":"Applying completion outcome \xB7 {{done}} of {{total}} cards","cardEditor.panel.runAgain":"Run again","cardEditor.panel.live.batch":"Running batch {{index}} of {{count}}","cardEditor.panel.live.batchRetry":" \xB7 attempt {{attempt}}","cardEditor.panel.live.items":"Editing {{running}} of {{total}} cards","cardEditor.panel.live.queued":"{{count}} cards queued","cardEditor.panel.live.settling":"Finishing up\u2026","cardEditor.panel.cancel":"Cancel","cardEditor.panel.delete":"Delete","cardEditor.panel.deleteConfirm":"Delete this session? Its results are lost.","cardEditor.panel.deleteConfirmActive":"Still running \u2014 cancel it and delete?","cardEditor.panel.deleteYes":"Delete","cardEditor.panel.deleteYesActive":"Cancel & delete","cardEditor.panel.deleteNo":"Keep","cardEditor.panel.interruptedNotice":"The server restarted mid-run, so this session was interrupted. Failed items can still be retried from this session.","cardEditor.panel.statsFailed":"{{count}} failed","cardEditor.panel.sessionStatus.active":"active","cardEditor.panel.sessionStatus.completed":"completed","cardEditor.panel.sessionStatus.canceled":"canceled","cardEditor.panel.sessionStatus.interrupted":"interrupted","cardEditor.panel.back":"Back to sessions","cardEditor.panel.status.queued":"queued","cardEditor.panel.status.running":"running","cardEditor.panel.status.succeeded":"succeeded","cardEditor.panel.status.awaitingReview":"awaiting review","cardEditor.panel.status.needsReview":"needs review","cardEditor.panel.status.applied":"applied","cardEditor.panel.status.duplicated":"duplicated","cardEditor.panel.status.rejected":"rejected","cardEditor.panel.status.failedProvider":"failed \xB7 provider","cardEditor.panel.status.failedRefusal":"failed \xB7 refusal","cardEditor.panel.status.failedParse":"failed \xB7 parse","cardEditor.panel.status.canceled":"canceled","cardEditor.panel.status.interrupted":"interrupted","cardEditor.panel.status.unknown":"unknown","cardEditor.panel.detail.loading":"Loading session\u2026","cardEditor.panel.detail.loadError":"The session could not be loaded.","cardEditor.panel.detail.cancelAll":"Cancel all","cardEditor.panel.detail.rerunFailed":"Rerun all failed ({{count}})","cardEditor.panel.detail.reviewQueue":"Review queue ({{count}})","cardEditor.panel.detail.delete":"Delete session","cardEditor.panel.detail.summary":"{{fields}} fields \xB7 +{{added}}/\u2212{{removed}} words","cardEditor.panel.detail.noChanges":"no changes proposed","cardEditor.panel.detail.copyCreated":"copy: {{id}}","cardEditor.panel.detail.combine":"Create combined card ({{count}})","cardEditor.panel.detail.combinePartialConfirm":"{{count}} of {{total}} cards were collected. Create the combined card from the collected cards only?","cardEditor.panel.detail.combineYes":"Combine {{count}}","cardEditor.panel.detail.combineNo":"Cancel","cardEditor.panel.detail.combinedCreated":"combined card created: {{id}}","cardEditor.panel.detail.duplicateApplied":"Duplicate applied cards ({{count}})","cardEditor.panel.detail.duplicateAppliedPartial":"{{failed}} of {{total}} cards could not be duplicated \u2014 retry from the item row.","cardEditor.panel.detail.autoApplyError":"Auto-apply failed for {{name}}: {{message}}","cardEditor.panel.detail.actionError":"Action failed: {{message}}","cardEditor.panel.detail.pagePrev":"Previous page","cardEditor.panel.detail.pageNext":"Next page","cardEditor.panel.detail.page":"Page {{page}} of {{pages}}","cardEditor.panel.action.review":"Review","cardEditor.panel.action.rerun":"Rerun","cardEditor.panel.action.editRetry":"Edit & retry","cardEditor.panel.action.fixJson":"Fix JSON","cardEditor.panel.action.inspect":"Inspect","cardEditor.panel.action.cancelItem":"Cancel","cardEditor.panel.settings.title":"Bulk settings","cardEditor.panel.settings.maxParallelAgents":"Max parallel agents","cardEditor.panel.settings.maxParallelAgentsHint":"Upper bound on concurrent calls in bulk runs. 0 follows the connection's parallel job limit.","cardEditor.panel.settings.disableAutoVerdicts":"Require review (disable auto-approve / auto-apply)","cardEditor.panel.settings.disableAutoVerdictsHint":"Bulk dispatches always wait for your confirmation; auto-approve and on-completion apply/duplicate are turned off.","cardEditor.panel.settings.save":"Save settings","cardEditor.panel.settings.saved":"Saved.","cardEditor.queue.title":"Review changes","cardEditor.queue.close":"Back to the session","cardEditor.queue.position":"{{index}} of {{count}}","cardEditor.queue.empty":"Nothing left to review.","cardEditor.queue.dotsLabel":"Review progress","cardEditor.queue.dotLabel":"{{name}}: {{status}}","cardEditor.queue.chips.fields":"{{count}} fields","cardEditor.queue.chips.added":"+{{count}} words","cardEditor.queue.chips.removed":"\u2212{{count}} words","cardEditor.queue.chips.fieldWords":"{{count}} words","cardEditor.queue.duplicateNote":"Approving copies the current card and applies these fields to the copy.","cardEditor.queue.hiddenLines":"\u22EF {{count}} unchanged lines \u22EF","cardEditor.queue.miniRowWords":"+{{added}}/\u2212{{removed}} words","cardEditor.queue.field.expand":"show all hunks \u2192","cardEditor.queue.staleTitle":"{{count}} fields changed since the run \u2014 applying replaces them.","cardEditor.queue.staleApply":"Apply anyway","cardEditor.queue.staleSkip":"Skip","cardEditor.queue.applyFailed":"Applying failed: {{message}} \u2014 rerun the item from the session table.","cardEditor.queue.reportFailed":"The card was written but the confirmation could not be sent: {{message}} \u2014 reload the session to see the true state.","cardEditor.queue.verdictError":"The verdict failed: {{message}}","cardEditor.queue.prev":"Previous card","cardEditor.queue.next":"Next card","cardEditor.queue.reject":"Reject","cardEditor.queue.approve":"Approve","cardEditor.queue.rejectHint":"R","cardEditor.queue.approveHint":"A","cardEditor.queue.working":"Working\u2026","cardEditor.queue.approveAll":"Approve all remaining without review","cardEditor.queue.approveAllWorking":"Approving\u2026","cardEditor.editRetry.title":"Edit & retry \u2014 {{name}}","cardEditor.editRetry.close":"Close","cardEditor.editRetry.hint":"The exact rendered prompt sent to the model. Retry re-dispatches this card with the edited text.","cardEditor.editRetry.system":"System prompt","cardEditor.editRetry.user":"User prompt","cardEditor.editRetry.missing":"The rendered prompt was not retained for this item; use rerun instead.","cardEditor.editRetry.cancel":"Cancel","cardEditor.editRetry.retry":"Retry","cardEditor.editRetry.retrying":"Retrying\u2026","cardEditor.editRetry.error":"The retry failed: {{message}}","cardEditor.fixJson.title":"Fix JSON \u2014 {{name}}","cardEditor.fixJson.hint":"The model's response could not be parsed, even after auto-repair and a strict-JSON retry. Fix it and apply, or retry generation.","cardEditor.fixJson.response":"Raw model response","cardEditor.fixJson.dismiss":"Dismiss","cardEditor.fixJson.regenerate":"Retry generation","cardEditor.fixJson.apply":"Apply fix","cardEditor.workspace.title":"Card Editor","cardEditor.workspace.close":"Close"};var _a=Object.fromEntries(Object.entries(yt).filter(([e,a])=>e!=="_meta"&&typeof a=="string")),Pt={en:_a};function Ro(e){let a=e?.trim().replaceAll("_","-").toLowerCase()||"en";return Pt[a]??Pt[a.split("-")[0]]??_a}function Bo(e,a){return a?e.replaceAll(/\{\{([A-Za-z0-9_]+)\}\}/g,(r,l)=>{let d=a[l];return d==null?r:String(d)}):e}function V(e,a,r){let l=Ro(e?.locale);return Bo(l[a]??_a[a]??a,r)}var ma=globalThis.__MARINARA_HOST__,Ze=ma&&ma.version===1&&ma.modules?ma.modules["react/jsx-runtime"]:void 0;if(!Ze)throw new Error("Marinara Engine does not provide react/jsx-runtime; this package needs capability API 1.341 or newer.");var Te=Ze.Fragment,Ds=Ze.default,o=Ze.jsx,i=Ze.jsxs;var Mo=200;function Et({name:e,avatarPath:a}){return o("span",{className:"ce-search-option-avatar","aria-hidden":"true",children:a?o("img",{src:a,alt:"",loading:"lazy"}):e.trim().charAt(0)||"?"})}function ga({localization:e,selection:a,onChange:r,allowInherit:l=!1,buttonLabel:d,inheritLabel:t,noneLabel:s}){let n=(b,N)=>V(e,b,N),p=st(),m=W(null),u=W(null),[g,I]=f(!1),[v,S]=f(""),[w,M]=f([]),[q,A]=f(!1),[j,B]=f(!1),[F,P]=f(0),U=W(0);E(()=>{if(!g)return;let b=++U.current;A(!0),B(!1);let N=setTimeout(()=>{kt({search:v,limit:50,offset:0}).then(Z=>{U.current===b&&(M(Array.isArray(Z?.items)?Z.items:[]),A(!1))}).catch(()=>{U.current===b&&(M([]),B(!0),A(!1))})},Mo);return()=>clearTimeout(N)},[g,v]),E(()=>{if(!g)return;let b=N=>{m.current&&N.target instanceof Node&&!m.current.contains(N.target)&&I(!1)};return document.addEventListener("pointerdown",b),()=>document.removeEventListener("pointerdown",b)},[g]);let J=b=>{r(b),I(!1),S(""),u.current?.focus()},G=[...l?[{key:"inherit",label:t??"",avatarPath:null,selected:a.kind==="inherit",select:()=>J({kind:"inherit"})}]:[],{key:"none",label:s,avatarPath:null,selected:a.kind==="none",select:()=>J({kind:"none"})},...w.map(b=>({key:b.id,label:b.name,avatarPath:b.avatarPath,selected:a.kind==="character"&&a.id===b.id,select:()=>J({kind:"character",id:b.id,name:b.name,avatarPath:b.avatarPath})}))],O=G[Math.min(F,Math.max(G.length-1,0))],H=a.kind==="character"?a.name:a.kind==="inherit"?t??"":s,$=b=>{if(b.key==="Escape"){b.stopPropagation(),I(!1),u.current?.focus();return}if(b.key==="ArrowDown"||b.key==="ArrowUp"){if(b.preventDefault(),G.length===0)return;let N=b.key==="ArrowDown"?1:-1;P(Z=>(Math.min(Z,G.length-1)+N+G.length)%G.length);return}b.key==="Enter"&&O&&(b.preventDefault(),O.select())};return i("div",{className:"ce-search-select",ref:m,children:[i("button",{ref:u,type:"button",className:`mari-chrome-field ce-field ce-search-face${a.kind==="character"?"":" ce-search-face--muted"}`,"aria-haspopup":"listbox","aria-expanded":g,"aria-controls":g?p:void 0,onClick:()=>{I(b=>!b),P(0)},children:[o("span",{className:"ce-sr-only",children:`${d}: `}),a.kind==="character"?o(Et,{name:a.name,avatarPath:a.avatarPath}):null,o("span",{className:"ce-search-face-label",children:H}),o(Ke,{className:`ce-icon ce-search-chevron${g?" ce-search-chevron--open":""}`,"aria-hidden":"true"})]}),g?i("div",{className:"ce-search-panel",children:[o("input",{type:"search",role:"combobox","aria-autocomplete":"list","aria-expanded":"true","aria-controls":p,"aria-activedescendant":O?`${p}-${O.key}`:void 0,"aria-label":n("cardEditor.dialog.search.placeholder"),className:"mari-chrome-field ce-field",placeholder:n("cardEditor.dialog.search.placeholder"),value:v,autoFocus:!0,onChange:b=>{S(b.target.value),P(0)},onKeyDown:$}),q?o("div",{className:"ce-caption",children:n("cardEditor.dialog.search.loading")}):null,j?o("div",{className:"ce-status ce-status--error",role:"alert",children:n("cardEditor.dialog.search.error")}):null,!q&&!j&&w.length===0?o("div",{className:"ce-caption",children:n("cardEditor.dialog.search.noResults")}):null,o("ul",{className:"ce-search-options",role:"listbox",id:p,"aria-label":d,children:G.map((b,N)=>o("li",{role:"presentation",children:i("button",{type:"button",role:"option",id:`${p}-${b.key}`,"aria-selected":b.selected,className:`ce-search-option${b===O?" ce-search-option--active":""}`,onMouseEnter:()=>P(N),onClick:b.select,children:[b.key==="inherit"||b.key==="none"?null:o(Et,{name:b.label,avatarPath:b.avatarPath}),o("span",{className:"ce-search-option-name",children:b.label})]})},b.key))})]}):null]})}var At='button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';function Wa(){try{return typeof window>"u"?void 0:window.localStorage}catch{return}}function Fe(e,a,r){let l=W(null),d=W(r);d.current=r;let t=W(a);return t.current=a,E(()=>{if(!e)return;let s=document.activeElement instanceof HTMLElement?document.activeElement:null,n=l.current;if(!n)return;let p=requestAnimationFrame(()=>(n.querySelector(At)??n).focus()),m=u=>{if(u.key==="Escape"){if(u.isComposing||t.current())return;u.preventDefault(),d.current();return}if(u.key!=="Tab")return;let g=[...n.querySelectorAll(At)];if(!n.contains(document.activeElement)){u.preventDefault(),(g[0]??n).focus();return}if(g.length===0){u.preventDefault(),n.focus();return}let I=g[0],v=g.at(-1);u.shiftKey&&document.activeElement===I?(u.preventDefault(),v.focus()):!u.shiftKey&&document.activeElement===v&&(u.preventDefault(),I.focus())};return document.addEventListener("keydown",m),()=>{cancelAnimationFrame(p),document.removeEventListener("keydown",m),requestAnimationFrame(()=>{s?.isConnected&&s.focus()})}},[e]),l}function ve({id:e,label:a,value:r,min:l,max:d,onChange:t}){return i("label",{className:"ce-label",htmlFor:e,children:[o("span",{className:"ce-label-title",children:a}),o("input",{id:e,type:"number",className:"mari-chrome-field ce-field ce-number-input",value:r,min:l,max:d,step:1,inputMode:"numeric",onChange:s=>{if(s.target.value==="")return;let n=Number(s.target.value);Number.isFinite(n)&&t(Math.max(l,Math.min(d,Math.trunc(n))))}})]})}function ke({name:e,value:a,checked:r,onChange:l,title:d,disabled:t}){return i("label",{className:`ce-choice${t?" ce-choice--disabled":""}`,children:[o("input",{type:"radio",name:e,value:a,checked:r,disabled:t,onChange:()=>l(a)}),o("span",{className:"ce-choice-copy",children:o("strong",{children:d})})]})}function Rt({localization:e,targets:a,targetsLoading:r,onUpdateTarget:l,onRemoveTarget:d}){let t=(s,n)=>V(e,s,n);return i("fieldset",{className:"ce-section","data-ce-section":"targets",children:[o("legend",{className:"ce-section-heading",children:t("cardEditor.dialog.targets.title",{count:a.length})}),r?o("div",{className:"ce-status",children:t("cardEditor.dialog.targets.loading")}):null,!r&&a.length===0?o("p",{className:"ce-caption",children:t("cardEditor.dialog.targets.empty")}):null,o("ul",{className:"ce-targets",children:a.map((s,n)=>i("li",{className:"ce-target",children:[i("div",{className:"ce-target-identity",children:[o("span",{className:"ce-target-avatar","aria-hidden":"true",children:s.avatarPath?o("img",{src:s.avatarPath,alt:"",loading:"lazy"}):s.name.trim().charAt(0)||"?"}),i("span",{className:"ce-target-name",children:[s.name,s.loadError?i("span",{className:"ce-target-load-error",children:[" ",t("cardEditor.dialog.targets.loadFailed")]}):null]})]}),i("div",{className:"ce-target-controls",children:[o("input",{type:"text",className:"mari-chrome-field ce-field",value:s.note,placeholder:t("cardEditor.dialog.targets.notePlaceholder"),"aria-label":t("cardEditor.dialog.targets.noteLabel",{name:s.name}),...n===0?{"data-ce-autofocus":!0}:{},onChange:p=>l(s.characterId,{note:p.target.value})}),o(ga,{localization:e,selection:s.style,onChange:p=>l(s.characterId,{style:p}),allowInherit:!0,buttonLabel:t("cardEditor.dialog.targets.styleLabel",{name:s.name}),inheritLabel:t("cardEditor.dialog.targets.styleSession"),noneLabel:t("cardEditor.dialog.targets.styleNone")})]}),o("button",{type:"button",className:"ce-target-remove","aria-label":t("cardEditor.dialog.targets.remove",{name:s.name}),onClick:()=>d(s.characterId),children:o(Q,{className:"ce-icon","aria-hidden":"true"})})]},s.characterId))})]})}var Xa={standard:`You are the Card Editor. You rewrite existing character cards from the user's instruction while preserving each card's voice, facts, and intent.

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
- Preserve {{char}} and {{user}} macros exactly; never resolve, escape, or rename them.`};function Bt(e){return e==="standard"||e==="strict"||e==="rebalance"||e==="xml-simple"||e==="xml-complex"}var Do=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions","backstory","appearance"],ee=class extends Error{constructor(a){super(a),this.name="SchemaError"}};var $s=new Set(Do);function To(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null}function ha(e,a,r,l){if(e===void 0)return a;if(typeof e=="string"&&r.includes(e))return e;throw new ee(`${l} is invalid`)}function Fo(e,a,r){if(e===void 0)return a;if(typeof e=="string")return e;throw new ee(`${r} must be a string`)}function Ye(e,a,r){if(e===void 0)return;if(typeof e!="string")throw new ee(`${a} must be a string`);if(e.length>300)throw new ee(`${a} must be at most 300 characters`);let l=r?e:e.trim();if(!l.trim())throw new ee(`${a} must not be blank`);return l}function Mt(e,a){if(e==null)return null;if(typeof e=="string")return e;throw new ee(`${a} must be a string or null`)}function xa(e,a,r,l,d){if(e===void 0)return a;if(typeof e!="number"||!Number.isFinite(e))throw new ee(`${d} must be a finite number`);return Math.max(r,Math.min(l,Math.trunc(e)))}function La(e){let a=To(e);if(!a)throw new ee("session config must be an object");if(a.globalLorebookIds!==void 0&&!Array.isArray(a.globalLorebookIds))throw new ee("globalLorebookIds must be an array of strings");let r=a.globalLorebookIds??[];if(!r.every(m=>typeof m=="string"))throw new ee("globalLorebookIds must be an array of strings");if(a.rebalance!==void 0&&typeof a.rebalance!="boolean")throw new ee("rebalance must be a boolean");if(a.customTemplate!==void 0&&typeof a.customTemplate!="string")throw new ee("customTemplate must be a string");let l=Ye(a.duplicatePrefix,"duplicatePrefix",!0),d=Ye(a.duplicateSuffix,"duplicateSuffix",!0),t=Ye(a.duplicateRemovePrefix,"duplicateRemovePrefix",!0),s=Ye(a.duplicateRemoveSuffix,"duplicateRemoveSuffix",!0),n=Ye(a.combinedCardName,"combinedCardName",!1),p=ha(a.saveMode,"confirm",["confirm","auto","duplicate","combined"],"saveMode");if(p==="combined"&&n===void 0)throw new ee("combinedCardName is required when saveMode is combined");return{mode:ha(a.mode,"individual",["individual","batched"],"mode"),batchSize:xa(a.batchSize,4,1,16,"batchSize"),connectionId:Mt(a.connectionId,"connectionId"),presetId:ha(a.presetId,"standard",["standard","strict","rebalance","xml-simple","xml-complex","custom"],"presetId"),...a.customTemplate===void 0?{}:{customTemplate:a.customTemplate},globalInstruction:Fo(a.globalInstruction,"","globalInstruction"),behaviorCharacterId:Mt(a.behaviorCharacterId,"behaviorCharacterId"),globalLorebookIds:[...r],rebalance:a.rebalance??!1,providerRetries:xa(a.providerRetries,2,0,5,"providerRetries"),refusalRetries:xa(a.refusalRetries,3,0,5,"refusalRetries"),concurrency:xa(a.concurrency,1,1,16,"concurrency"),saveMode:p,completionMode:ha(a.completionMode,"ask",["ask","apply","duplicate"],"completionMode"),...l===void 0?{}:{duplicatePrefix:l},...d===void 0?{}:{duplicateSuffix:d},...t===void 0?{}:{duplicateRemovePrefix:t},...s===void 0?{}:{duplicateRemoveSuffix:s},...n===void 0?{}:{combinedCardName:n}}}var Dt="cardEditor.bulkConfig";function Tt(e){if(!e)return null;let a=null;try{a=e.getItem(Dt)}catch{return null}if(!a)return null;try{return La(JSON.parse(a))}catch{return null}}function Ft(e,a){if(a)try{a.setItem(Dt,JSON.stringify(e))}catch{}}function qt(e,a){let r=Number.isFinite(e)?Math.max(0,Math.trunc(e)):0,l=Number.isFinite(a)?Math.max(1,Math.min(16,Math.trunc(a))):4;return{batched:r===0?0:Math.ceil(r/l),individual:r}}function Nt({localization:e,characterIds:a,prefill:r,onClose:l,onDispatched:d}){let t=(c,D)=>V(e,c,D),[s,n]=f([]),[p,m]=f(!0),[u,g]=f(null),[I,v]=f(!1),[S,w]=f(null),[M,q]=f(!1),[A,j]=f(""),[B]=f(()=>Tt(Wa())),[F,P]=f(B?.mode??"individual"),[U,J]=f(B?.batchSize??4),[G,O]=f(B?.connectionId??null),[H,$]=f(r?.presetId??B?.presetId??"standard"),[b,N]=f(B?.customTemplate??""),[Z,ne]=f(r?.globalInstruction??B?.globalInstruction??""),[X,h]=f({kind:"none"}),[x,C]=f(B?.globalLorebookIds??[]),[y,K]=f(B?.rebalance??!1),[le,wa]=f(B?.providerRetries??2),[we,ea]=f(B?.refusalRetries??3),[Ue,ye]=f(B?.concurrency??1),[Pe,ce]=f(B?.completionMode??"ask"),[re,me]=f(r?.saveMode??B?.saveMode??"confirm"),[ge,de]=f(r?.duplicatePrefix??B?.duplicatePrefix??""),[fe,pe]=f(B?.duplicateSuffix??" (Edited)"),[Ee,L]=f(B?.duplicateRemovePrefix??""),[R,T]=f(B?.duplicateRemoveSuffix??""),[se,aa]=f(r?.combinedCardName??(r?.label?`${r.label} \u2014 Cast`:B?.combinedCardName??"")),[he,ze]=f(!1),[$a,Za]=f(null),[Ya,ro]=f(null),ya=Fe(!0,()=>he,l),[Pa]=f(()=>[...new Set(a)]);E(()=>{let c=!1,D=new AbortController;return m(!0),Promise.allSettled(Pa.map(z=>De(z,D.signal))).then(z=>{c||(n(z.map((ae,ta)=>{let Ge=Pa[ta];return ae.status==="fulfilled"?{characterId:Ge,name:ae.value.name,avatarPath:ae.value.avatarPath,card:ae.value.fields,note:"",style:{kind:"inherit"},loadError:!1}:{characterId:Ge,name:Ge,avatarPath:null,card:null,note:"",style:{kind:"inherit"},loadError:!0}})),m(!1))}),()=>{c=!0,D.abort()}},[Pa]),E(()=>{let c=new AbortController;return It(c.signal).then(D=>g(D)).catch(()=>v(!0)),()=>c.abort()},[]),E(()=>{let c=new AbortController;return wt(c.signal).then(D=>w(D)).catch(()=>q(!0)),()=>c.abort()},[]),E(()=>{let c=B?.behaviorCharacterId;if(!c)return;let D=!1;return Ct(c).then(z=>{D||h({kind:"character",id:z.id,name:z.name,avatarPath:z.avatarPath})}).catch(()=>{}),()=>{D=!0}},[B]),E(()=>{if(p)return;let c=ya.current,D=c?.querySelector("[data-ce-autofocus]");if(!c||!D)return;let z=document.activeElement;(!z||z===document.body||z instanceof HTMLElement&&z.classList.contains("ce-dialog-close")||z===c)&&D.focus()},[p,ya]);let so=c=>{c==="custom"&&H!=="custom"&&(!b.trim()||Object.values(Xa).includes(b))&&Bt(H)&&N(Xa[H]),$(c)},lo=(c,D)=>n(z=>z.map(ae=>ae.characterId===c?{...ae,...D}:ae)),io=c=>n(D=>D.filter(z=>z.characterId!==c)),Ea=(S??[]).filter(c=>!A.trim()||c.name.toLocaleLowerCase().includes(A.trim().toLocaleLowerCase())),Qa=qt(s.length,U),Aa=s.some(c=>c.loadError||!c.card),Ra=re==="combined"&&se.trim().length===0,no=pa(s[0]?.name??"Character",{prefix:ge,suffix:fe,removePrefix:Ee,removeSuffix:R});E(()=>{let c=!1;return da().then(D=>{c||ro(D)}).catch(()=>{}),()=>{c=!0}},[]);let Ie=Ya?.disableAutoVerdicts===!0;E(()=>{Ie&&(me(c=>c==="auto"?"confirm":c),ce(c=>c==="ask"?c:"ask"))},[Ie]);let Ba=(u?.find(c=>c.id===G)??u?.find(c=>c.defaultForAgents)??u?.find(c=>c.isDefault)??null)?.maxParallelJobs,et=typeof Ba=="number"&&Number.isFinite(Ba)?Math.min(16,Math.max(1,Math.trunc(Ba))):4,at=Ya?.maxParallelAgents??null,Ve=at===null?et:Math.min(et,at);E(()=>{ye(c=>Math.min(c,Ve))},[Ve]);let tt=B?.concurrency!==void 0,ot=W(!1);E(()=>{tt||ot.current||u===null&&!I||(ot.current=!0,ye(Ve))},[tt,u,I,Ve]);let uo=async()=>{if(he||s.length===0||Aa||Ra)return;ze(!0),Za(null);let c=La({mode:F,batchSize:U,connectionId:G,presetId:H,...H==="custom"?{customTemplate:b}:{},globalInstruction:Z,behaviorCharacterId:X.kind==="character"?X.id:null,globalLorebookIds:x,rebalance:y,providerRetries:le,refusalRetries:we,concurrency:Ue,saveMode:re,completionMode:Pe,...ge.trim()?{duplicatePrefix:ge}:{},...fe.trim()?{duplicateSuffix:fe}:{},...Ee.trim()?{duplicateRemovePrefix:Ee}:{},...R.trim()?{duplicateRemoveSuffix:R}:{},...re==="combined"?{combinedCardName:se.trim()}:{}});try{let D=[...new Set(s.flatMap(_=>_.style.kind==="character"?[_.style.id]:[]))],[z,ae,ta]=await Promise.all([Promise.all(D.map(_=>De(_))),X.kind==="character"?De(X.id):Promise.resolve(null),Promise.all(x.map(async _=>({name:(S??[]).find(fo=>fo.id===_)?.name??_,entries:await St(_)})))]),Ge=new Map(z.map((_,rt)=>[D[rt],_])),co=await ft({targets:s.map(_=>({characterId:_.characterId,characterName:_.name,card:_.card,..._.note.trim()?{note:_.note.trim()}:{},..._.style.kind==="none"?{behaviorOverride:null}:_.style.kind==="character"?{behaviorOverride:_.style.id,behaviorOverrideCard:za(Ge.get(_.style.id))}:{}})),config:c,...r?.label?.trim()?{label:r.label.trim().slice(0,200)}:{},...ta.length>0?{lorebooks:ta}:{},...ae?{behaviorCharacter:za(ae)}:{}});Ft(c,Wa()),d(co)}catch(D){Za(D instanceof Error?D.message:String(D)),ze(!1)}};return o("div",{className:"ce-overlay",role:"presentation",onClick:()=>{he||l()},children:i("section",{ref:ya,className:"ce-dialog ce-shell",role:"dialog","aria-modal":"true","aria-label":t("cardEditor.dialog.title"),tabIndex:-1,onClick:c=>c.stopPropagation(),children:[i("div",{className:"ce-dialog-head",children:[o("strong",{children:t("cardEditor.dialog.title")}),o("button",{type:"button",className:"ce-dialog-close",onClick:l,disabled:he,"aria-label":t("cardEditor.dialog.close"),children:o(Q,{className:"ce-icon","aria-hidden":"true"})})]}),i("div",{className:"ce-dialog-body",children:[o(Rt,{localization:e,targets:s,targetsLoading:p,onUpdateTarget:lo,onRemoveTarget:io}),i("fieldset",{className:"ce-section","data-ce-section":"model",children:[o("legend",{className:"ce-section-heading",children:t("cardEditor.dialog.model.title")}),i("label",{className:"ce-label",htmlFor:"ce-connection",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.model.connection")}),i("select",{id:"ce-connection",className:"mari-chrome-field ce-field",value:G??"","data-ce-autofocus":!0,onChange:c=>O(c.target.value||null),children:[o("option",{value:"",children:t("cardEditor.dialog.model.connectionDefault")}),(u??[]).map(c=>o("option",{value:c.id,children:c.model?`${c.name} \xB7 ${c.model}`:c.name},c.id))]})]}),u===null&&!I?o("p",{className:"ce-caption",children:t("cardEditor.dialog.model.connectionsLoading")}):null,I?o("div",{className:"ce-status ce-status--error",role:"alert",children:t("cardEditor.dialog.model.connectionsError")}):null,i("label",{className:"ce-label",htmlFor:"ce-preset",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.model.preset")}),i("select",{id:"ce-preset",className:"mari-chrome-field ce-field",value:H,onChange:c=>so(c.target.value),children:[o("option",{value:"standard",children:t("cardEditor.dialog.model.presetStandard")}),o("option",{value:"strict",children:t("cardEditor.dialog.model.presetStrict")}),o("option",{value:"rebalance",children:t("cardEditor.dialog.model.presetRebalance")}),o("option",{value:"xml-simple",children:t("cardEditor.dialog.model.presetXmlSimple")}),o("option",{value:"xml-complex",children:t("cardEditor.dialog.model.presetXmlComplex")}),o("option",{value:"custom",children:t("cardEditor.dialog.model.presetCustom")})]})]}),H==="custom"?i("label",{className:"ce-label",htmlFor:"ce-custom-template",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.model.customTemplate")}),o("textarea",{id:"ce-custom-template",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:b,onChange:c=>N(c.target.value)}),o("small",{children:t("cardEditor.dialog.model.customTemplateHint")})]}):null]}),i("fieldset",{className:"ce-section","data-ce-section":"instructions",children:[o("legend",{className:"ce-section-heading",children:t("cardEditor.dialog.instructions.title")}),i("label",{className:"ce-label",htmlFor:"ce-global-instruction",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.instructions.global")}),o("textarea",{id:"ce-global-instruction",className:"mari-chrome-field ce-field ce-textarea",value:Z,placeholder:t("cardEditor.dialog.instructions.globalPlaceholder"),onChange:c=>ne(c.target.value)})]}),i("div",{className:"ce-label",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.instructions.behavior")}),o(ga,{localization:e,selection:X,onChange:h,buttonLabel:t("cardEditor.dialog.instructions.behavior"),noneLabel:t("cardEditor.dialog.instructions.behaviorNone")}),o("small",{children:t("cardEditor.dialog.instructions.behaviorHint")})]}),i("div",{className:"ce-label",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.instructions.lorebooks")}),o("input",{type:"search",className:"mari-chrome-field ce-field",value:A,placeholder:t("cardEditor.dialog.instructions.lorebooksFilter"),"aria-label":t("cardEditor.dialog.instructions.lorebooksFilter"),onChange:c=>j(c.target.value)}),S===null&&!M?o("p",{className:"ce-caption",children:t("cardEditor.dialog.instructions.lorebooksLoading")}):null,M?o("div",{className:"ce-status ce-status--error",role:"alert",children:t("cardEditor.dialog.instructions.lorebooksError")}):null,S!==null&&S.length===0?o("p",{className:"ce-caption",children:t("cardEditor.dialog.instructions.lorebooksEmpty")}):null,S!==null&&S.length>0&&Ea.length===0?o("p",{className:"ce-caption",children:t("cardEditor.dialog.instructions.lorebooksNoneMatch")}):null,Ea.length>0?o("div",{className:"ce-lorebook-list",children:Ea.map(c=>i("label",{className:"ce-lorebook",children:[o("input",{type:"checkbox",checked:x.includes(c.id),onChange:D=>C(z=>D.target.checked?[...new Set([...z,c.id])]:z.filter(ae=>ae!==c.id))}),o("span",{className:"ce-lorebook-name",children:c.name})]},c.id))}):null,o("small",{children:t("cardEditor.dialog.instructions.lorebooksHint")})]})]}),i("fieldset",{className:"ce-section","data-ce-section":"processing",children:[o("legend",{className:"ce-section-heading",children:t("cardEditor.dialog.processing.title")}),i("div",{className:"ce-choice-list",children:[o(ke,{name:"ce-mode",value:"individual",checked:F==="individual",onChange:()=>P("individual"),title:t("cardEditor.dialog.processing.modeIndividual")}),o(ke,{name:"ce-mode",value:"batched",checked:F==="batched",onChange:()=>P("batched"),title:t("cardEditor.dialog.processing.modeBatched")})]}),i("div",{className:"ce-number-grid",children:[o(ve,{id:"ce-batch-size",label:t("cardEditor.dialog.processing.batchSize"),value:U,min:1,max:16,onChange:J}),o(ve,{id:"ce-provider-retries",label:t("cardEditor.dialog.processing.providerRetries"),value:le,min:0,max:5,onChange:wa}),o(ve,{id:"ce-refusal-retries",label:t("cardEditor.dialog.processing.refusalRetries"),value:we,min:0,max:5,onChange:ea}),o(ve,{id:"ce-concurrency",label:t("cardEditor.dialog.processing.concurrency"),value:Ue,min:1,max:Ve,onChange:ye})]}),i("label",{className:"ce-choice",children:[o("input",{type:"checkbox",checked:y,onChange:c=>K(c.target.checked)}),i("span",{className:"ce-choice-copy",children:[o("strong",{children:t("cardEditor.dialog.processing.rebalance")}),o("small",{children:t("cardEditor.dialog.processing.rebalanceHint")})]})]}),i("label",{className:"ce-label",htmlFor:"ce-completion-mode",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.processing.completionMode")}),i("select",{id:"ce-completion-mode",className:"mari-chrome-field ce-field",value:Pe,onChange:c=>ce(c.target.value),children:[o("option",{value:"ask",children:t("cardEditor.dialog.processing.completionAsk")}),o("option",{value:"apply",disabled:Ie,children:t("cardEditor.dialog.processing.completionApply")}),o("option",{value:"duplicate",disabled:Ie,children:t("cardEditor.dialog.processing.completionDuplicate")})]}),Ie?o("small",{children:t("cardEditor.dialog.processing.autoDisabledNote")}):o("small",{children:t("cardEditor.dialog.processing.completionCaption")})]}),o("p",{className:"ce-caption",children:t("cardEditor.dialog.processing.overflowCaption")})]}),i("fieldset",{className:"ce-section","data-ce-section":"saving",children:[o("legend",{className:"ce-section-heading",children:t("cardEditor.dialog.saving.title")}),i("div",{className:"ce-choice-list",children:[o(ke,{name:"ce-save-mode",value:"confirm",checked:re==="confirm",onChange:c=>me(c),title:t("cardEditor.dialog.saving.confirm")}),o(ke,{name:"ce-save-mode",value:"auto",checked:re==="auto",onChange:c=>me(c),title:t("cardEditor.dialog.saving.auto"),disabled:Ie}),o(ke,{name:"ce-save-mode",value:"duplicate",checked:re==="duplicate",onChange:c=>me(c),title:t("cardEditor.dialog.saving.duplicate")}),re==="duplicate"?i(Te,{children:[i("label",{className:"ce-label",htmlFor:"ce-duplicate-prefix",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.saving.duplicatePrefix")}),o("input",{id:"ce-duplicate-prefix",type:"text",className:"mari-chrome-field ce-field",value:ge,placeholder:t("cardEditor.dialog.saving.duplicatePrefixPlaceholder"),"aria-label":t("cardEditor.dialog.saving.duplicatePrefix"),onChange:c=>de(c.target.value)}),o("small",{children:t("cardEditor.dialog.saving.duplicatePrefixHint")})]}),i("label",{className:"ce-label",htmlFor:"ce-duplicate-suffix",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.saving.duplicateSuffix")}),o("input",{id:"ce-duplicate-suffix",type:"text",className:"mari-chrome-field ce-field",value:fe,placeholder:t("cardEditor.dialog.saving.duplicateSuffixPlaceholder"),"aria-label":t("cardEditor.dialog.saving.duplicateSuffix"),onChange:c=>pe(c.target.value)})]}),o("p",{className:"ce-divider-caption",children:t("cardEditor.dialog.saving.duplicateRemoveGroup")}),i("label",{className:"ce-label",htmlFor:"ce-duplicate-remove-prefix",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.saving.duplicateRemovePrefix")}),o("input",{id:"ce-duplicate-remove-prefix",type:"text",className:"mari-chrome-field ce-field",value:Ee,placeholder:t("cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder"),"aria-label":t("cardEditor.dialog.saving.duplicateRemovePrefix"),onChange:c=>L(c.target.value)})]}),i("label",{className:"ce-label",htmlFor:"ce-duplicate-remove-suffix",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.saving.duplicateRemoveSuffix")}),o("input",{id:"ce-duplicate-remove-suffix",type:"text",className:"mari-chrome-field ce-field",value:R,placeholder:t("cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder"),"aria-label":t("cardEditor.dialog.saving.duplicateRemoveSuffix"),onChange:c=>T(c.target.value)})]}),o("p",{className:"ce-caption",children:t("cardEditor.dialog.saving.duplicateNamePreview",{name:no})})]}):null,o(ke,{name:"ce-save-mode",value:"combined",checked:re==="combined",onChange:c=>me(c),title:t("cardEditor.dialog.saving.combined")}),re==="combined"?i("label",{className:"ce-label",htmlFor:"ce-combined-name",children:[o("span",{className:"ce-label-title",children:t("cardEditor.dialog.saving.combinedName")}),o("input",{id:"ce-combined-name",type:"text",className:"mari-chrome-field ce-field",value:se,placeholder:t("cardEditor.dialog.saving.combinedNamePlaceholder"),"aria-label":t("cardEditor.dialog.saving.combinedName"),onChange:c=>aa(c.target.value)}),o("small",{children:t("cardEditor.dialog.saving.combinedCaption")})]}):null]}),Ie?o("p",{className:"ce-caption",children:t("cardEditor.dialog.saving.reviewRequiredHint")}):null,o("p",{className:"ce-caption",children:t("cardEditor.dialog.saving.caption")})]})]}),i("div",{className:"ce-dialog-foot",children:[$a?o("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:t("cardEditor.dialog.dispatchError",{message:$a})}):null,Aa?o("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:t("cardEditor.dialog.targets.unloadableBlock")}):null,Ra?o("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:t("cardEditor.dialog.saving.combinedNameRequired")}):null,o("span",{className:"ce-estimate",children:t("cardEditor.dialog.estimate",{batch:U,batchedCalls:Qa.batched,individualCalls:Qa.individual})}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:he||s.length===0||Aa||Ra,onClick:()=>{uo()},children:t(he?"cardEditor.dialog.dispatching":"cardEditor.dialog.dispatch")})]})]})})}function qo(e,a){return e==="backstory"||e==="appearance"?{extensions:{[e]:a}}:{[e]:a}}function No(e){let{name:a,...r}=e;return r}function qe(e){return(e instanceof Error?e.message:String(e??""))||"unknown error"}var Ot=" (Copy)";async function Oo(e,a,r){if(a.op==="hold")return{ok:!0};if(a.op==="collectForCombine")return{ok:!0};if(a.op==="patchField")return await Ga(a.characterId,qo(a.field,a.newText),{versionSource:a.versionSource,versionReason:a.versionReason}),{ok:!0};let l=a,d=await bt(a.characterId),t=typeof d?.id=="string"&&d.id?d.id:"";if(!t)throw new Error("The duplicate call returned no card id.");let s=Ua(d),n=s.endsWith(Ot)?s.slice(0,-Ot.length):s||e.characterName,p={name:pa(n,{...l.namePrefix===void 0?{}:{prefix:l.namePrefix},...l.nameSuffix===void 0?{}:{suffix:l.nameSuffix},...l.stripNamePrefix===void 0?{}:{removePrefix:l.stripNamePrefix},...l.stripNameSuffix===void 0?{}:{removeSuffix:l.stripNameSuffix}})},m={};for(let[u,g]of Object.entries(a.fields))u==="backstory"||u==="appearance"?m[u]=g:p[u]=g;return Object.keys(m).length>0&&(p.extensions=m),await Ga(t,p,{versionSource:"agent",versionReason:`Card Editor bulk: ${r}`}),{ok:!0,resultCardId:t}}async function Ka(e,a,r){let l=[];for(let[d,t]of a.entries())try{l.push({index:d,...await Oo(e,t,r.label)})}catch(s){l.push({index:d,ok:!1,error:qe(s)})}return l}async function Ne(e,a,r){try{let l=e.status==="completed"?e.config.completionMode??"ask":"ask",t=l==="duplicate"||l==="ask"&&(e.config.saveMode==="duplicate"||e.config.saveMode==="combined")?void 0:No((await De(a.characterId)).fields),s=await Ha(e.id,a.itemId,{verdict:"approve",...r.force?{force:!0}:{},...t===void 0?{}:{currentFields:t}});if(!qa(s))return{kind:"failed",message:"The verdict route answered an unexpected shape."};if(s.status==="needs-confirmation")return{kind:"needs-confirmation",holds:s.holds};let n=await Ka(a,s.ops,{label:e.label}),p;try{p=await ca(e.id,a.itemId,n)}catch(u){return{kind:"report-failed",message:qe(u)}}let m=n.find(u=>!u.ok);if(m){let u=p.items.find(g=>g.itemId===a.itemId);return{kind:"apply-failed",session:p,message:u?.failure?.message??m.error??"A card write failed."}}return{kind:"applied",session:p}}catch(l){return{kind:"failed",message:qe(l)}}}async function Ia(e,a){if(e.status!=="completed")return{session:e,failedCount:0,messages:[]};let r=e.config.completionMode??"ask",l=e.items.filter(n=>Array.isArray(n.pendingOps)||r==="apply"&&n.status==="awaiting-review"),d=e,t=0,s=[];a?.(0,l.length);for(let[n,p]of l.entries()){let m=d.items.find(u=>u.itemId===p.itemId)??p;try{if(Array.isArray(m.pendingOps)){let u=await Ka(m,m.pendingOps,{label:d.label});d=await ca(d.id,m.itemId,u),u.some(g=>!g.ok)&&(t+=1)}else{let u=await Ne(d,m,{force:!1});u.kind==="applied"||u.kind==="apply-failed"?(d=u.session,u.kind==="apply-failed"&&(t+=1,s.push(u.message))):u.kind==="needs-confirmation"?d=await Be(d.id):(t+=1,s.push(u.message))}}catch(u){t+=1,s.push(qe(u))}a?.(n+1,l.length)}return{session:d,failedCount:t,messages:s}}async function Ht(e,a){try{let r=await Ha(e.id,a.itemId,{verdict:"reject"});return qa(r)?{kind:"failed",message:"The verdict route answered an unexpected shape."}:{kind:"rejected",session:r}}catch(r){return{kind:"failed",message:qe(r)}}}function Ho(e){return e.filter(a=>a.status==="applied").map(a=>Le((a.updates??[]).find(r=>r.field==="description")?.newText??"")).filter(a=>a.trim().length>0)}async function Ut(e,a={}){try{let r=e.items.filter(p=>p.status==="applied"),l=Ho(e.items);if(r.length===0||l.length===0)return{kind:"failed",message:"No collected cards to combine yet."};let d=e.config.combinedCardName?.trim()||e.label,t=await vt({name:d,description:l.join(`

`)}),s=typeof t?.id=="string"&&t.id?t.id:"";if(!s)throw new Error("The create call returned no card id.");return{kind:"combined",session:await Lt(e.id,{itemIds:r.map(p=>p.itemId),resultCardId:s,...a.confirmPartial?{confirmPartial:!0}:{}})}}catch(r){return{kind:"failed",message:qe(r)}}}async function zt(e){let{plans:a}=await xt(e.id),r=e,l=0;for(let d of a){let t=e.items.find(n=>n.itemId===d.itemId);if(!t)continue;let s=await Ka(t,d.ops,{label:e.label});r=await ca(e.id,d.itemId,s),s.some(n=>!n.ok)&&(l+=1)}return{session:r,failedCount:l}}function Vt(e){return e.split(`
`)}function Gt(e,a){let r=Vt(e),l=Vt(a);if(e===a)return r.map(u=>({kind:"same",text:u}));let d=0;for(;d<r.length&&d<l.length&&r[d]===l[d];)d+=1;let t=r.length,s=l.length;for(;t>d&&s>d&&r[t-1]===l[s-1];)t-=1,s-=1;let n=r.slice(d,t),p=l.slice(d,s),m=r.slice(0,d).map(u=>({kind:"same",text:u}));if(n.length*p.length<=1e6){let u=Array.from({length:n.length+1},()=>new Uint32Array(p.length+1));for(let v=n.length-1;v>=0;v-=1)for(let S=p.length-1;S>=0;S-=1)u[v][S]=n[v]===p[S]?u[v+1][S+1]+1:Math.max(u[v+1][S],u[v][S+1]);let g=0,I=0;for(;g<n.length&&I<p.length;)n[g]===p[I]?(m.push({kind:"same",text:n[g]}),g+=1,I+=1):u[g+1][I]>=u[g][I+1]?(m.push({kind:"del",text:n[g]}),g+=1):(m.push({kind:"add",text:p[I]}),I+=1);for(;g<n.length;)m.push({kind:"del",text:n[g++]});for(;I<p.length;)m.push({kind:"add",text:p[I++]})}else{for(let u of n)m.push({kind:"del",text:u});for(let u of p)m.push({kind:"add",text:u})}for(let u of r.slice(t))m.push({kind:"same",text:u});return m}function _t(e,a=3){let r=[],l=[],d=0,t=()=>{l.length!==0&&(l.some(n=>n.kind!=="same")&&r.push({hiddenBefore:d,lines:l}),l=[],d=0)},s=0;for(;s<e.length;){if(e[s].kind!=="same"){l.push(e[s]),s+=1;continue}let n=s;for(;n<e.length&&e[n].kind==="same";)n+=1;let p=n-s,m=l.length>0,u=n<e.length;if(!m&&!u)break;m?u?p>a*2?(l.push(...e.slice(s,s+a)),t(),d=p-a*2,l.push(...e.slice(n-a,n))):l.push(...e.slice(s,n)):l.push(...e.slice(s,Math.min(n,s+a))):(d=Math.max(0,p-a),l.push(...e.slice(Math.max(s,n-a),n))),s=n}return t(),r}function Wt(e){return e.trim().split(/\s+/u).filter(Boolean).length}function Ca(e,a){let r=new Map;for(let d of e.trim().split(/\s+/u).filter(Boolean))r.set(d,(r.get(d)??0)+1);let l=0;for(let d of a.trim().split(/\s+/u).filter(Boolean)){let t=r.get(d)??0;t===0?l+=1:t===1?r.delete(d):r.set(d,t-1)}return{added:l,removed:[...r.values()].reduce((d,t)=>d+t,0)}}var Uo={queued:"cardEditor.panel.status.queued",running:"cardEditor.panel.status.running",succeeded:"cardEditor.panel.status.succeeded","awaiting-review":"cardEditor.panel.status.awaitingReview","needs-review":"cardEditor.panel.status.needsReview",applied:"cardEditor.panel.status.applied",duplicated:"cardEditor.panel.status.duplicated",rejected:"cardEditor.panel.status.rejected","failed-provider":"cardEditor.panel.status.failedProvider","failed-refusal":"cardEditor.panel.status.failedRefusal","failed-parse":"cardEditor.panel.status.failedParse",canceled:"cardEditor.panel.status.canceled",interrupted:"cardEditor.panel.status.interrupted"};function Qe(e){return Uo[e]??"cardEditor.panel.status.unknown"}function Sa(e){return e==="queued"||e==="running"||e==="succeeded"?"live":e==="awaiting-review"||e==="needs-review"?"review":e==="applied"||e==="duplicated"?"ok":e==="rejected"||e==="canceled"||e==="interrupted"?"muted":"danger"}var zo=["awaiting-review","needs-review"],Vo=["failed-provider","failed-refusal","failed-parse"];function ie(e){return zo.includes(e.status)}function Oe(e){return Vo.includes(e.status)}function Xt(e){return ie(e)||e.status==="applied"||e.status==="duplicated"||e.status==="rejected"}function Kt(e){let a=e.updates??[];if(a.length===0)return null;let r=0,l=0;for(let d of a){let t=Ca(e.snapshots[d.field]??Le(d.oldText),Le(d.newText));r+=t.added,l+=t.removed}return{fields:a.length,added:r,removed:l}}function ba(e){let a=e.items.filter(s=>s.status==="running").length,r=e.items.filter(s=>s.status==="queued").length,l=e.batches.filter(s=>s.status!=="split"),d=l.findIndex(s=>s.status==="running"),t=d>=0?l[d]:null;return e.config.mode==="batched"&&t?{kind:"batch",runningItems:a,queuedItems:r,batchIndex:d+1,batchCount:l.length,batchAttempts:t.attempts}:a>0?{kind:"items",runningItems:a,queuedItems:r,batchIndex:0,batchCount:0,batchAttempts:0}:r>0?{kind:"queued",runningItems:a,queuedItems:r,batchIndex:0,batchCount:0,batchAttempts:0}:{kind:"done",runningItems:a,queuedItems:r,batchIndex:0,batchCount:0,batchAttempts:0}}function jt({localization:e,session:a,item:r,onClose:l,onRetried:d}){let t=(q,A)=>V(e,q,A),s=r.failure?.renderedPrompt??null,[n,p]=f(s?.system??""),[m,u]=f(s?.user??""),[g,I]=f(!1),[v,S]=f(null),w=Fe(!0,()=>g,l),M=async()=>{if(!(g||!s)){I(!0),S(null);try{d(await gt(a.id,r.itemId,{system:n,user:m}))}catch(q){S(q instanceof Error?q.message:String(q)),I(!1)}}};return o("div",{className:"ce-overlay",role:"presentation",onClick:()=>{g||l()},children:i("section",{ref:w,className:"ce-dialog ce-shell ce-edit-retry",role:"dialog","aria-modal":"true","aria-label":t("cardEditor.editRetry.title",{name:r.characterName}),tabIndex:-1,onClick:q=>q.stopPropagation(),children:[i("div",{className:"ce-dialog-head",children:[o("strong",{children:t("cardEditor.editRetry.title",{name:r.characterName})}),o("button",{type:"button",className:"ce-dialog-close",onClick:l,disabled:g,"aria-label":t("cardEditor.editRetry.close"),children:o(Q,{className:"ce-icon","aria-hidden":"true"})})]}),i("div",{className:"ce-dialog-body",children:[s?i(Te,{children:[o("p",{className:"ce-caption",children:t("cardEditor.editRetry.hint")}),i("label",{className:"ce-label",htmlFor:"ce-retry-system",children:[o("span",{className:"ce-label-title",children:t("cardEditor.editRetry.system")}),o("textarea",{id:"ce-retry-system",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:n,"data-ce-autofocus":!0,onChange:q=>p(q.target.value)})]}),i("label",{className:"ce-label",htmlFor:"ce-retry-user",children:[o("span",{className:"ce-label-title",children:t("cardEditor.editRetry.user")}),o("textarea",{id:"ce-retry-user",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:m,onChange:q=>u(q.target.value)})]})]}):o("div",{className:"ce-status",role:"status",children:t("cardEditor.editRetry.missing")}),v?o("div",{className:"ce-status ce-status--error",role:"alert",children:t("cardEditor.editRetry.error",{message:v})}):null]}),i("div",{className:"ce-dialog-foot",children:[o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:g,onClick:l,children:t("cardEditor.editRetry.cancel")}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:g||!s,onClick:()=>{M()},children:t(g?"cardEditor.editRetry.retrying":"cardEditor.editRetry.retry")})]})]})})}function Jt({localization:e,session:a,item:r,onClose:l,onUpdated:d}){let t=(S,w)=>V(e,S,w),[s,n]=f(r.failure?.rawOutput??""),[p,m]=f(!1),[u,g]=f(r.failure?.message??null),I=Fe(!0,()=>p,l),v=async S=>{if(!p){m(!0),g(null);try{d(await S())}catch(w){g(w instanceof Error?w.message:String(w)),m(!1)}}};return o("div",{className:"ce-overlay",role:"presentation",onClick:()=>{p||l()},children:i("section",{ref:I,className:"ce-dialog ce-shell ce-edit-retry",role:"dialog","aria-modal":"true","aria-label":t("cardEditor.fixJson.title",{name:r.characterName}),tabIndex:-1,onClick:S=>S.stopPropagation(),children:[i("div",{className:"ce-dialog-head",children:[o("strong",{children:t("cardEditor.fixJson.title",{name:r.characterName})}),o("button",{type:"button",className:"ce-dialog-close",onClick:l,disabled:p,"aria-label":t("cardEditor.editRetry.close"),children:o(Q,{className:"ce-icon","aria-hidden":"true"})})]}),i("div",{className:"ce-dialog-body",children:[o("p",{className:"ce-caption",children:t("cardEditor.fixJson.hint")}),i("label",{className:"ce-label",htmlFor:"ce-fix-json",children:[o("span",{className:"ce-label-title",children:t("cardEditor.fixJson.response")}),o("textarea",{id:"ce-fix-json",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:s,spellCheck:!1,"data-ce-autofocus":!0,onChange:S=>n(S.target.value)})]}),u?o("div",{className:"ce-status ce-status--error",role:"alert",children:u}):null]}),i("div",{className:"ce-dialog-foot",children:[o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p,onClick:l,children:t("cardEditor.fixJson.dismiss")}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p,onClick:()=>{v(()=>$e(a.id,r.itemId))},children:t("cardEditor.fixJson.regenerate")}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:p||!s.trim(),onClick:()=>{v(()=>ht(a.id,r.itemId,s))},children:t(p?"cardEditor.editRetry.retrying":"cardEditor.fixJson.apply")})]})]})})}function He(e,a,r=!0){let l=W(e);l.current=e;let[d,t]=f(null),s=xe(I=>t(I),[]),[n,p]=f(!1),[m,u]=f(typeof document>"u"?!0:document.visibilityState==="visible");E(()=>{if(!d||typeof IntersectionObserver>"u"){p(!0);return}let I=new IntersectionObserver(v=>{p(v.some(S=>S.isIntersecting))});return I.observe(d),()=>I.disconnect()},[d]),E(()=>{let I=()=>u(document.visibilityState==="visible");return document.addEventListener("visibilitychange",I),()=>document.removeEventListener("visibilitychange",I)},[]);let g=r&&n&&m;return E(()=>{if(!g)return;let I=!1,v=0,S=()=>{I||(l.current(),v=window.setTimeout(S,a))};return S(),()=>{I=!0,window.clearTimeout(v)}},[g,a]),s}var Go=3,_o=8;function Wo(e){return(e.updates??[]).map(a=>{let r=e.snapshots[a.field]??Le(a.oldText),l=Le(a.newText),{added:d,removed:t}=Ca(r,l),s=_t(Gt(r,l),Go);return{field:a.field,newText:l,added:d,removed:t,wordCount:Wt(l),hunks:s}})}function Xo({preview:e,expanded:a,showAll:r,onToggle:l,onShowAll:d,t}){if(!a)return i("button",{type:"button",className:"ce-queue-minirow",onClick:l,children:[o("span",{className:"ce-queue-minirow-caret","aria-hidden":"true",children:"\u25B8"}),o("span",{className:"ce-queue-minirow-field",children:e.field}),o("span",{className:"ce-queue-minirow-words",children:t("cardEditor.queue.miniRowWords",{added:e.added,removed:e.removed})})]});let s=r?Number.POSITIVE_INFINITY:_o,n=!1,p=[];for(let m of e.hunks){if(s<=0){n=!0;break}let u=0;m.hiddenBefore>0&&(u=m.hiddenBefore,s-=1);let g=m.lines.slice(0,Math.max(0,s));g.length<m.lines.length&&(n=!0),s-=g.length,p.push({lines:g,hidden:u})}return i("section",{className:"ce-queue-field",children:[i("header",{className:"ce-queue-field-head",children:[o("strong",{className:"ce-queue-field-name",children:e.field}),o("span",{className:"ce-chip ce-chip--ok",children:t("cardEditor.queue.chips.added",{count:e.added})}),o("span",{className:"ce-chip ce-chip--danger",children:t("cardEditor.queue.chips.removed",{count:e.removed})}),o("span",{className:"ce-chip",children:t("cardEditor.queue.chips.fieldWords",{count:e.wordCount})})]}),o("div",{className:"ce-diff",role:"group","aria-label":e.field,children:p.map(({lines:m,hidden:u},g)=>i("div",{className:"ce-diff-hunk",children:[u>0?o("div",{className:"ce-diff-line ce-diff-line--marker",children:t("cardEditor.queue.hiddenLines",{count:u})}):null,m.map((I,v)=>i("div",{className:`ce-diff-line ce-diff-line--${I.kind}`,children:[o("span",{className:"ce-diff-sign","aria-hidden":"true",children:I.kind==="add"?"+":I.kind==="del"?"\u2212":"\xA0"}),o("span",{className:"ce-diff-text",children:I.text})]},v))]},g))}),n?o("button",{type:"button",className:"ce-queue-expander",onClick:d,children:t("cardEditor.queue.field.expand")}):null,o("pre",{className:"ce-queue-fullfield",children:e.newText})]})}function $t({localization:e,session:a,focusItemId:r,onRefresh:l,onClose:d}){let t=(x,C)=>V(e,x,C),s=Ma(()=>a.items.filter(Xt),[a.items]),[n,p]=f(r),[m,u]=f(!1),[g,I]=f(null),[v,S]=f(null),[w,M]=f(null),[q,A]=f(null),[j,B]=f(new Set),F=s.findIndex(x=>x.itemId===n),P=F>=0?s[F]:null,U=Ma(()=>P?Wo(P):[],[P]);E(()=>{if(P)return;let x=s.find(ie)??s[0]??null;p(x?.itemId??null)},[P,s]);let J=W(null);E(()=>{I(null),S(null),M(null),A(null),B(new Set),J.current?.focus({preventScroll:!0})},[n]);let G=(x,C)=>q===null?C===0:q.has(x),O=x=>A(C=>{let y=new Set(C??new Set(U[0]?[U[0].field]:[]));return y.has(x)?y.delete(x):y.add(x),y}),H=P!==null&&ie(P),$=x=>{let C=s[x];C&&p(C.itemId)},b=x=>{let y=s.filter(K=>K.itemId!==x).find(ie)??null;p(y?.itemId??x)},N=async x=>{if(!P||m||!H)return;u(!0),S(null),M(null);let C=await Ne(a,P,{force:x});if(u(!1),C.kind==="needs-confirmation"){I(C.holds),l();return}if(C.kind==="applied"){let y=P.itemId;l(),b(y);return}if(C.kind==="apply-failed"){M(C.message),l();return}S(C.message)},Z=async()=>{if(!P||m||!H)return;u(!0),S(null),M(null);let x=await Ht(a,P);if(u(!1),x.kind==="rejected"){let C=P.itemId;l(),b(C);return}S(x.message)},ne=async()=>{if(m)return;u(!0),S(null);let x=s.filter(ie);for(let C of x)await Ne(a,C,{force:!1});u(!1),l(),p(C=>s.some(y=>y.itemId===C&&ie(y))?C:null)};E(()=>{let x=C=>{let y=C.target;if(!(y&&(y.tagName==="INPUT"||y.tagName==="TEXTAREA"||y.tagName==="SELECT"||y.isContentEditable))&&!m){if(C.key==="ArrowLeft"){F>0&&(C.preventDefault(),$(F-1));return}if(C.key==="ArrowRight"){F>=0&&F<s.length-1&&(C.preventDefault(),$(F+1));return}!H||C.ctrlKey||C.metaKey||C.altKey||(C.key==="r"||C.key==="R"?(C.preventDefault(),Z()):(C.key==="a"||C.key==="A")&&(C.preventDefault(),N(!1)))}};return document.addEventListener("keydown",x),()=>document.removeEventListener("keydown",x)});let X=U.reduce((x,C)=>({added:x.added+C.added,removed:x.removed+C.removed}),{added:0,removed:0}),h=s.filter(ie).length;return i("div",{className:"ce-queue",children:[i("div",{className:"ce-queue-head",children:[i("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:d,children:[o(ue,{className:"ce-icon","aria-hidden":"true"}),t("cardEditor.queue.close")]}),o("strong",{className:"ce-panel-heading",children:t("cardEditor.queue.title")}),o("span",{className:"ce-caption",children:s.length===0?"":t("cardEditor.queue.position",{index:F+1,count:s.length})})]}),s.length>0?o("div",{className:"ce-queue-dots",role:"group","aria-label":t("cardEditor.queue.dotsLabel"),children:s.map((x,C)=>{let y=x.status==="applied"||x.status==="duplicated"?"approved":x.status==="rejected"?"rejected":"pending";return o("button",{type:"button",className:`ce-dot ce-dot--${y}${C===F?" ce-dot--current":""}`,"aria-label":t("cardEditor.queue.dotLabel",{name:x.characterName,status:t(Qe(x.status))}),"aria-current":C===F,onClick:()=>$(C)},x.itemId)})}):null,P?i("article",{className:"ce-queue-card",ref:J,tabIndex:-1,"aria-label":P.characterName,children:[i("header",{className:"ce-queue-card-head",children:[o("h3",{className:"ce-queue-name",children:P.characterName}),o("span",{className:`ce-chip ce-chip--${Sa(P.status)}`,children:t(Qe(P.status))})]}),i("div",{className:"ce-queue-chips",children:[o("span",{className:"ce-chip",children:t("cardEditor.queue.chips.fields",{count:U.length})}),o("span",{className:"ce-chip ce-chip--ok",children:t("cardEditor.queue.chips.added",{count:X.added})}),o("span",{className:"ce-chip ce-chip--danger",children:t("cardEditor.queue.chips.removed",{count:X.removed})})]}),a.config.saveMode==="duplicate"?o("p",{className:"ce-caption",children:t("cardEditor.queue.duplicateNote")}):null,o("div",{className:"ce-queue-fields",children:U.map((x,C)=>o(Xo,{preview:x,expanded:G(x.field,C),showAll:j.has(x.field),onToggle:()=>O(x.field),onShowAll:()=>B(y=>new Set([...y,x.field])),t},x.field))}),g?i("div",{className:"ce-queue-stale",role:"alert",children:[o("p",{children:t("cardEditor.queue.staleTitle",{count:g.length})}),i("div",{className:"ce-queue-stale-actions",children:[o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:m,onClick:()=>{N(!0)},children:t("cardEditor.queue.staleApply")}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:m,onClick:()=>I(null),children:t("cardEditor.queue.staleSkip")})]})]}):null,w?o("div",{className:"ce-status ce-status--error",role:"alert",children:t("cardEditor.queue.applyFailed",{message:w})}):null,v?o("div",{className:"ce-status ce-status--error",role:"alert",children:t("cardEditor.queue.verdictError",{message:v})}):null,i("footer",{className:"ce-queue-foot",children:[o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:F<=0,"aria-label":t("cardEditor.queue.prev"),onClick:()=>$(F-1),children:o(ue,{className:"ce-icon","aria-hidden":"true"})}),i("button",{type:"button",className:"mari-chrome-control ce-queue-reject",disabled:m||!H,onClick:()=>{Z()},children:[o(Q,{className:"ce-icon","aria-hidden":"true"}),t("cardEditor.queue.reject"),o("kbd",{className:"ce-key-hint",children:t("cardEditor.queue.rejectHint")})]}),i("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary ce-queue-approve",disabled:m||!H,onClick:()=>{N(!1)},children:[o(Xe,{className:"ce-icon","aria-hidden":"true"}),t(m?"cardEditor.queue.working":"cardEditor.queue.approve"),o("kbd",{className:"ce-key-hint",children:t("cardEditor.queue.approveHint")})]}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:F<0||F>=s.length-1,"aria-label":t("cardEditor.queue.next"),onClick:()=>$(F+1),children:o(Se,{className:"ce-icon","aria-hidden":"true"})})]})]}):o("div",{className:"ce-status",role:"status",children:t("cardEditor.queue.empty")}),h>0?o("button",{type:"button",className:"ce-queue-approve-all",disabled:m,onClick:()=>{ne()},children:t(m?"cardEditor.queue.approveAllWorking":"cardEditor.queue.approveAll")}):null]})}var va=50;function Ko({item:e,t:a}){if(Oe(e)&&e.failure)return o("span",{className:"ce-item-failure",children:e.failure.message});if(e.resultCardId)return o("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.copyCreated",{id:e.resultCardId})});if(e.status==="applied"&&(e.updates??[]).length===0)return o("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.noChanges")});let r=Kt(e);return r?o("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.summary",{fields:r.fields,added:r.added,removed:r.removed})}):null}function Zt({localization:e,sessionId:a,onBack:r,onDeleted:l,onRerun:d}){let t=(L,R)=>V(e,L,R),[s,n]=f(null),[p,m]=f(!1),[u,g]=f(null),[I,v]=f(!1),[S,w]=f({}),[M,q]=f(null),[A,j]=f(null),[B,F]=f(0),[P,U]=f("closed"),[J,G]=f(null),[O,H]=f(null),$=W(new Set),[b,N]=f(!1),Z=W(new Set),ne=W(!1),X=xe(()=>{Be(a).then(L=>{n(L),m(!1)}).catch(()=>m(!0))},[a]),h=He(X,2e3);E(()=>{if(!s||O!==null||J!==null||P!=="closed")return;let L=s.items.find(R=>R.status==="failed-parse"&&R.failure?.rawOutput&&!$.current.has(R.itemId));L&&($.current.add(L.itemId),H(L.itemId))},[J,O,P,s]),E(()=>{if(!s||(s.config.completionMode??"ask")!=="ask")return;let L=s.items.filter(R=>R.status==="awaiting-review"&&R.autoApply===!0&&!Z.current.has(R.itemId));if(L.length!==0){for(let R of L)Z.current.add(R.itemId);(async()=>{for(let R of L){let T=await Ne(s,R,{force:!1});(T.kind==="failed"||T.kind==="report-failed")&&w(se=>({...se,[R.itemId]:T.message}))}X()})()}},[s,X]),E(()=>{if(!s||ne.current||s.status!=="completed")return;let L=s.config.completionMode??"ask";s.items.filter(T=>Array.isArray(T.pendingOps)||L==="apply"&&T.status==="awaiting-review").length!==0&&(ne.current=!0,Ia(s,(T,se)=>q({done:T,total:se})).then(T=>{n(T.session),T.messages.length>0&&g(T.messages[0])}).finally(()=>{ne.current=!1,q(null),X()}))},[s,X]);let x=async(L,R)=>{if(!A){j(L),g(null);try{let T=await R();T?n(T):X()}catch(T){g(T instanceof Error?T.message:String(T))}finally{j(null)}}},C=()=>{x("run-again",async()=>{let L=await ua(a);return d?.(L.id),L})},y=()=>{x("rerun-all",async()=>{let L=(s?.items??[]).filter(Oe);for(let R of L)await $e(a,R.itemId)})},K=()=>{x("delete",async()=>{await fa(a,{force:s?.status==="active"}),l()})},le=()=>{x("combine",async()=>{if(!s)return;let R=s.items.filter(se=>se.status==="applied").length<s.items.length,T=await Ut(s,...R?[{confirmPartial:!0}]:[]);if(T.kind==="failed")throw new Error(T.message);return v(!1),T.session})},wa=L=>{x("duplicate-applied",async()=>{if(!s)return;let R=await zt(s);return R.failedCount>0&&g(t("cardEditor.panel.detail.duplicateAppliedPartial",{failed:R.failedCount,total:L})),R.session})};if(p&&!s)return i("section",{className:"ce-shell ce-panel",ref:h,children:[i("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:r,children:[o(ue,{className:"ce-icon","aria-hidden":"true"}),t("cardEditor.panel.back")]}),o("div",{className:"ce-status ce-status--error",role:"alert",children:t("cardEditor.panel.detail.loadError")})]});if(!s)return o("section",{className:"ce-shell ce-panel",ref:h,children:o("div",{className:"ce-status",role:"status",children:t("cardEditor.panel.detail.loading")})});if(P!=="closed")return o("section",{className:"ce-shell ce-panel",ref:h,children:o($t,{localization:e,session:s,focusItemId:P,onRefresh:X,onClose:()=>U("closed")})});let we=O?s.items.find(L=>L.itemId===O)??null:null,ea=J?s.items.find(L=>L.itemId===J)??null:null,Ue=s.items.filter(ie).length,ye=s.items.filter(Oe).length,Pe=s.config.saveMode==="combined",ce=Pe?s.items.filter(L=>L.status==="applied").length:0,re=Pe&&!s.combinedCardId&&ce>0,me=re&&ce<s.items.length,ge=Pe?0:s.items.filter(L=>L.status==="applied"&&L.resultCardId===void 0&&(L.updates??[]).length>0).length,de=ba(s),fe=Math.max(1,Math.ceil(s.items.length/va)),pe=Math.min(B,fe-1),Ee=s.items.slice(pe*va,pe*va+va);return i("section",{className:"ce-shell ce-panel",ref:h,"data-card-editor-view":"session-detail",children:[i("div",{className:"ce-panel-head",children:[i("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:r,children:[o(ue,{className:"ce-icon","aria-hidden":"true"}),t("cardEditor.panel.back")]}),o("strong",{className:"ce-panel-heading",children:s.label}),o("span",{className:`ce-chip ce-chip--${s.status==="active"?"live":s.status==="completed"?"ok":"muted"}`,children:t(`cardEditor.panel.sessionStatus.${s.status}`)}),o("span",{className:"ce-chip",children:t(`cardEditor.panel.completionMode.${s.config.completionMode??"ask"}`)})]}),s.combinedCardId?o("div",{className:"ce-notice",role:"status",children:o("span",{children:t("cardEditor.panel.detail.combinedCreated",{id:s.combinedCardId})})}):null,s.status==="interrupted"?o("div",{className:"ce-notice",role:"status",children:o("span",{children:t("cardEditor.panel.interruptedNotice")})}):null,s.status==="active"?o("p",{className:"ce-caption",role:"status",children:de.kind==="batch"?t("cardEditor.panel.live.batch",{index:de.batchIndex,count:de.batchCount})+(de.batchAttempts>1?t("cardEditor.panel.live.batchRetry",{attempt:de.batchAttempts}):""):de.kind==="items"?t("cardEditor.panel.live.items",{running:de.runningItems,total:s.stats.total}):de.kind==="queued"?t("cardEditor.panel.live.queued",{count:de.queuedItems}):t("cardEditor.panel.progress",{done:s.stats.done,total:s.stats.total})}):null,M?o("p",{className:"ce-caption ce-live-line",role:"status",children:t("cardEditor.panel.enforcementProgress",M)}):null,u?o("div",{className:"ce-status ce-status--error",role:"alert",children:t("cardEditor.panel.detail.actionError",{message:u})}):null,i("div",{className:"ce-panel-actions",children:[re?me&&!I?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:()=>v(!0),children:t("cardEditor.panel.detail.combine",{count:ce})}):me&&I?i("span",{className:"ce-confirm-strip",role:"group","aria-label":t("cardEditor.panel.detail.combine"),children:[o("span",{className:"ce-caption",children:t("cardEditor.panel.detail.combinePartialConfirm",{count:ce,total:s.items.length})}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:le,children:t("cardEditor.panel.detail.combineYes",{count:ce})}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:()=>v(!1),children:t("cardEditor.panel.detail.combineNo")})]}):o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:A!==null,onClick:le,children:t("cardEditor.panel.detail.combine",{count:ce})}):null,ge>0?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:()=>wa(ge),children:t("cardEditor.panel.detail.duplicateApplied",{count:ge})}):null,Ue>0?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",onClick:()=>U(null),children:t("cardEditor.panel.detail.reviewQueue",{count:Ue})}):null,s.status==="active"?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:()=>{x("cancel-all",()=>na(a))},children:t("cardEditor.panel.detail.cancelAll")}):null,s.status==="completed"||s.status==="canceled"?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:C,children:t("cardEditor.panel.runAgain")}):null,ye>0?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:y,children:t("cardEditor.panel.detail.rerunFailed",{count:ye})}):null,b?i("span",{className:"ce-confirm-strip",role:"group","aria-label":t("cardEditor.panel.delete"),children:[o("span",{className:"ce-caption",children:s.status==="active"?t("cardEditor.panel.deleteConfirmActive"):t("cardEditor.panel.deleteConfirm")}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:A!==null,onClick:K,children:s.status==="active"?t("cardEditor.panel.deleteYesActive"):t("cardEditor.panel.deleteYes")}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:()=>N(!1),children:t("cardEditor.panel.deleteNo")})]}):o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:()=>N(!0),children:t("cardEditor.panel.detail.delete")})]}),o("ul",{className:"ce-items",children:Ee.map(L=>{let R=ie(L),T=(L.status==="applied"||L.status==="duplicated")&&(L.updates??[]).length>0,se=Oe(L),aa=Oe(L)&&L.failure?.renderedPrompt!==void 0,he=L.status==="failed-parse"&&!!L.failure?.rawOutput,ze=L.status==="queued"&&s.status==="active";return i("li",{className:"ce-item",children:[i("div",{className:"ce-item-main",children:[o("span",{className:"ce-item-name",children:L.characterName}),o("span",{className:`ce-chip ce-chip--${Sa(L.status)}`,children:t(Qe(L.status))})]}),i("div",{className:"ce-item-sub",children:[o(Ko,{item:L,t}),S[L.itemId]?o("span",{className:"ce-item-failure",children:t("cardEditor.panel.detail.autoApplyError",{name:L.characterName,message:S[L.itemId]})}):null]}),R||T||se||aa||ze?i("div",{className:"ce-item-actions",children:[R?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>U(L.itemId),children:t("cardEditor.panel.action.review")}):null,T?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>U(L.itemId),children:t("cardEditor.panel.action.inspect")}):null,se?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:()=>{x(`rerun-${L.itemId}`,()=>$e(a,L.itemId))},children:t("cardEditor.panel.action.rerun")}):null,he?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:()=>H(L.itemId),children:t("cardEditor.panel.action.fixJson")}):null,aa?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:()=>G(L.itemId),children:t("cardEditor.panel.action.editRetry")}):null,ze?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:A!==null,onClick:()=>{x(`cancel-${L.itemId}`,()=>mt(a,L.itemId))},children:t("cardEditor.panel.action.cancelItem")}):null]}):null]},L.itemId)})}),fe>1?i("div",{className:"ce-pager",children:[o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:pe<=0,"aria-label":t("cardEditor.panel.detail.pagePrev"),onClick:()=>F(pe-1),children:o(ue,{className:"ce-icon","aria-hidden":"true"})}),o("span",{className:"ce-caption",children:t("cardEditor.panel.detail.page",{page:pe+1,pages:fe})}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:pe>=fe-1,"aria-label":t("cardEditor.panel.detail.pageNext"),onClick:()=>F(pe+1),children:o(Se,{className:"ce-icon","aria-hidden":"true"})})]}):null,we&&we.status==="failed-parse"?o(Jt,{localization:e,session:s,item:we,onClose:()=>H(null),onUpdated:L=>{n(L),H(null)}}):null,ea?o(jt,{localization:e,session:s,item:ea,onClose:()=>G(null),onRetried:L=>{n(L),G(null)}}):null]})}function jo({localization:e}){let a=(w,M)=>V(e,w,M),[r,l]=f(!1),[d,t]=f(0),[s,n]=f(!1),[p,m]=f(!1),[u,g]=f(!1),[I,v]=f(null);E(()=>{let w=!1;return da().then(M=>{w||(t(M.maxParallelAgents??0),n(M.disableAutoVerdicts),l(!0))}).catch(()=>{w||v("Could not load the bulk settings.")}),()=>{w=!0}},[]);let S=async()=>{if(!(p||!r)){m(!0),v(null),g(!1);try{await pt({version:1,maxParallelAgents:d>0?d:null,disableAutoVerdicts:s}),g(!0)}catch(w){v(w instanceof Error?w.message:String(w))}finally{m(!1)}}};return i("details",{className:"ce-settings","data-ce-section":"bulk-settings",children:[o("summary",{className:"ce-section-heading",children:a("cardEditor.panel.settings.title")}),o(ve,{id:"ce-settings-max-parallel",label:a("cardEditor.panel.settings.maxParallelAgents"),value:d,min:0,max:16,onChange:w=>{t(w),g(!1)}}),o("p",{className:"ce-caption",children:a("cardEditor.panel.settings.maxParallelAgentsHint")}),i("label",{className:"ce-choice",children:[o("input",{type:"checkbox",checked:s,onChange:w=>{n(w.target.checked),g(!1)}}),i("span",{className:"ce-choice-copy",children:[o("strong",{children:a("cardEditor.panel.settings.disableAutoVerdicts")}),o("small",{children:a("cardEditor.panel.settings.disableAutoVerdictsHint")})]})]}),i("div",{className:"ce-session-actions",children:[o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p||!r,onClick:()=>{S()},children:a("cardEditor.panel.settings.save")}),u?o("span",{className:"ce-caption",children:a("cardEditor.panel.settings.saved")}):null]}),I?o("div",{className:"ce-status ce-status--error",role:"alert",children:a("cardEditor.panel.detail.actionError",{message:I})}):null]})}function Jo({session:e,t:a}){return i("span",{className:"ce-session-chips",children:[o("span",{className:"ce-chip",children:e.config.mode==="batched"?a("cardEditor.panel.modeBatched",{size:e.config.batchSize}):a("cardEditor.panel.modeIndividual")}),o("span",{className:"ce-chip",children:a(`cardEditor.panel.saveMode.${e.config.saveMode}`)}),o("span",{className:"ce-chip",children:a(`cardEditor.panel.completionMode.${e.config.completionMode??"ask"}`)})]})}function $o({session:e,t:a}){let r=ba(e),l=r.kind==="batch"?a("cardEditor.panel.live.batch",{index:r.batchIndex,count:r.batchCount})+(r.batchAttempts>1?a("cardEditor.panel.live.batchRetry",{attempt:r.batchAttempts}):""):r.kind==="items"?a("cardEditor.panel.live.items",{running:r.runningItems,total:e.stats.total}):r.kind==="queued"?a("cardEditor.panel.live.queued",{count:r.queuedItems}):a("cardEditor.panel.live.settling");return o("p",{className:"ce-caption ce-live-line",role:"status",children:l})}function Yt({localization:e,agentName:a,detailId:r,onDetailIdChange:l,splitView:d=!1}){let t=(h,x)=>V(e,h,x),[s,n]=f(null),[p,m]=f({}),[u,g]=f(!1),[I,v]=f(null),S=r!==void 0,w=S?r:I,M=h=>{S?l?.(h):v(h)},[q,A]=f(null),[j,B]=f(null),[F,P]=f(null),[U,J]=f({}),G=W(new Set),O=xe(()=>{ia().then(async h=>{n(Array.isArray(h)?h:[]),g(!1);let x=(Array.isArray(h)?h:[]).filter(K=>K.status==="active"||K.status==="completed"&&(K.pendingApplyCount>0||K.enforcementPendingCount>0)),C=await Promise.allSettled(x.map(K=>Be(K.id))),y={};C.forEach((K,le)=>{K.status==="fulfilled"&&(y[x[le].id]=K.value)}),m(y)}).catch(()=>g(!0))},[]),H=He(O,2e3,w===null);E(()=>{if(w===null)for(let h of Object.values(p)){if(h.status!=="completed"||G.current.has(h.id))continue;let x=h.config.completionMode??"ask";h.items.filter(y=>Array.isArray(y.pendingOps)||x==="apply"&&y.status==="awaiting-review").length!==0&&(G.current.add(h.id),Ia(h,(y,K)=>J(le=>({...le,[h.id]:{done:y,total:K}}))).then(y=>{y.messages.length>0&&P(y.messages[0])}).finally(()=>{G.current.delete(h.id),J(y=>{let{[h.id]:K,...le}=y;return le}),O()}))}},[p,w,O]);let $=async(h,x)=>{if(!j){B(h),P(null);try{await x(),O()}catch(C){P(C instanceof Error?C.message:String(C))}finally{B(null)}}},b=w?o(Zt,{localization:e,sessionId:w,onBack:()=>{M(null),O()},onDeleted:()=>{M(null),A(null),O()},onRerun:h=>{M(h),O()}}):null,N=s??[],Z=N.filter(h=>h.status==="active"),ne=N.filter(h=>h.status!=="active"),X=i(Te,{children:[i("div",{className:"ce-panel-head",children:[o("strong",{className:"ce-panel-heading",children:t("cardEditor.panel.title")}),i("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-refresh-button",disabled:j!==null,onClick:O,children:[o(je,{className:"ce-icon","aria-hidden":"true"}),t("cardEditor.panel.refresh")]})]}),u?o("div",{className:"ce-status ce-status--error",role:"alert",children:t("cardEditor.panel.loadError")}):null,F?o("div",{className:"ce-status ce-status--error",role:"alert",children:t("cardEditor.panel.detail.actionError",{message:F})}):null,s===null&&!u?o("div",{className:"ce-status",role:"status",children:t("cardEditor.panel.loading")}):null,s!==null&&N.length===0?o("p",{className:"ce-caption",children:t("cardEditor.panel.empty")}):null,o(jo,{localization:e}),Z.length>0?i("div",{className:"ce-panel-section","data-ce-section":"active",children:[o("span",{className:"ce-section-heading",children:t("cardEditor.panel.activeTitle")}),o("ul",{className:"ce-sessions",children:Z.map(h=>{let x=p[h.id],C=h.stats.total>0?h.stats.done/h.stats.total:0;return i("li",{className:"ce-session ce-session--active",children:[i("div",{className:"ce-session-top",children:[o("button",{type:"button",className:"ce-session-label",onClick:()=>M(h.id),children:h.label}),x?o(Jo,{session:x,t}):null]}),o("div",{className:"ce-progress",role:"progressbar","aria-valuemin":0,"aria-valuemax":h.stats.total,"aria-valuenow":h.stats.done,"aria-label":t("cardEditor.panel.progress",{done:h.stats.done,total:h.stats.total}),children:o("div",{className:"ce-progress-fill",style:{width:`${Math.round(C*100)}%`}})}),o("span",{className:"ce-caption",children:t("cardEditor.panel.progress",{done:h.stats.done,total:h.stats.total})}),x?o($o,{session:x,t}):null,o("div",{className:"ce-session-actions",children:o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:j!==null,onClick:()=>{$(h.id,()=>na(h.id))},children:t("cardEditor.panel.cancel")})})]},h.id)})})]}):null,ne.length>0?i("div",{className:"ce-panel-section","data-ce-section":"history",children:[o("span",{className:"ce-section-heading",children:t("cardEditor.panel.historyTitle")}),o("ul",{className:"ce-sessions",children:ne.map(h=>i("li",{className:"ce-session",children:[o("button",{type:"button",className:"ce-session-label",onClick:()=>M(h.id),children:h.label}),i("span",{className:"ce-session-meta",children:[o("span",{className:`ce-chip ce-chip--${h.status==="completed"?"ok":"muted"}`,children:t(`cardEditor.panel.sessionStatus.${h.status}`)}),o("span",{className:"ce-chip",children:t(`cardEditor.panel.completionMode.${h.completionMode}`)}),o("span",{className:"ce-caption",children:t("cardEditor.panel.progress",{done:h.stats.done,total:h.stats.total})}),h.stats.failed>0?o("span",{className:"ce-chip ce-chip--danger",children:t("cardEditor.panel.statsFailed",{count:h.stats.failed})}):null,o("span",{className:"ce-caption ce-session-date",children:new Date(h.createdAt).toLocaleString()})]}),h.status==="interrupted"?o("p",{className:"ce-caption ce-session-note",children:t("cardEditor.panel.interruptedNotice")}):null,U[h.id]?o("p",{className:"ce-caption ce-live-line",role:"status",children:t("cardEditor.panel.enforcementProgress",U[h.id])}):null,h.status==="completed"||h.status==="canceled"?o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:j!==null,onClick:()=>{$(h.id,async()=>{let x=await ua(h.id);M(x.id)})},children:t("cardEditor.panel.runAgain")}):null,q===h.id?i("span",{className:"ce-confirm-strip",role:"group","aria-label":t("cardEditor.panel.delete"),children:[o("span",{className:"ce-caption",children:t("cardEditor.panel.deleteConfirm")}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:j!==null,onClick:()=>{$(h.id,async()=>{await fa(h.id),A(null)})},children:t("cardEditor.panel.deleteYes")}),o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:j!==null,onClick:()=>A(null),children:t("cardEditor.panel.deleteNo")})]}):o("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-session-delete",disabled:j!==null,onClick:()=>A(h.id),children:t("cardEditor.panel.delete")})]},h.id))})]}):null]});return b?d?o("section",{className:"ce-shell ce-panel ce-panel--workspace","data-card-editor-view":"agent-panel",ref:H,"aria-label":a?t("cardEditor.panel.titleWithAgent",{agent:a}):t("cardEditor.panel.title"),children:i("div",{className:"ce-workspace-split",children:[o("div",{className:"ce-workspace-rail",children:X}),o("div",{className:"ce-workspace-main",children:b})]})}):b:o("section",{className:"ce-shell ce-panel","data-card-editor-view":"agent-panel",ref:H,"aria-label":a?t("cardEditor.panel.titleWithAgent",{agent:a}):t("cardEditor.panel.title"),children:X})}var ja="marinara:capability-overlay",Qt="card-editor",Zo=new Set(["standard","strict","rebalance","xml-simple","xml-complex","custom"]),Yo=new Set(["confirm","auto","duplicate","combined"]);function Qo(e){if(e===null||typeof e!="object"||Array.isArray(e))return;let a=e,r=s=>typeof a[s]=="string"?a[s]:void 0,l=r("presetId"),d=r("saveMode"),t={...l!==void 0&&Zo.has(l)?{presetId:l}:{},...r("globalInstruction")!==void 0?{globalInstruction:r("globalInstruction")}:{},...d!==void 0&&Yo.has(d)?{saveMode:d}:{},...r("duplicatePrefix")!==void 0?{duplicatePrefix:r("duplicatePrefix")}:{},...r("combinedCardName")!==void 0?{combinedCardName:r("combinedCardName")}:{},...r("label")!==void 0?{label:r("label")}:{}};return Object.keys(t).length>0?t:void 0}function Ja(e){window.dispatchEvent(new CustomEvent(ja,{detail:{packageId:Qt,action:"open",payload:e}}))}function eo({localization:e}){let a=(g,I)=>V(e,g,I),[r,l]=f(!1),[d,t]=f(null),[s,n]=f(null),[p,m]=f(void 0);if(E(()=>{let g=I=>{let v=I.detail;if(!v||v.packageId!==Qt)return;if(v.action==="close"){l(!1);return}if(v.action!=="open")return;let S=v.payload;t(typeof S?.sessionId=="string"&&S.sessionId?S.sessionId:null);let w=S?.dispatch?.characterIds;n(Array.isArray(w)?w.filter(M=>typeof M=="string"&&M.length>0):null),m(Qo(S?.dispatch?.prefill)),l(!0)};return window.addEventListener(ja,g),()=>window.removeEventListener(ja,g)},[]),E(()=>{if(!r||s!==null)return;let g=I=>{I.key==="Escape"&&l(!1)};return window.addEventListener("keydown",g),()=>window.removeEventListener("keydown",g)},[r,s]),!r)return null;let u=g=>{n(null),t(g.id)};return o("div",{className:"ce-overlay ce-workspace-overlay",children:i("div",{className:"ce-dialog ce-workspace",role:"dialog","aria-modal":"true","aria-label":a("cardEditor.workspace.title"),children:[i("div",{className:"ce-dialog-head",children:[o("span",{children:a("cardEditor.workspace.title")}),o("button",{type:"button",className:"ce-dialog-close","aria-label":a("cardEditor.workspace.close"),onClick:()=>l(!1),children:o(Q,{className:"ce-icon","aria-hidden":"true"})})]}),o("div",{className:"ce-workspace-body",children:o(Yt,{localization:e,splitView:!0,detailId:d,onDetailIdChange:t})}),s!==null&&s.length>0?o(Nt,{localization:e,characterIds:s,prefill:p,onClose:()=>n(null),onDispatched:u}):null]})})}function ao({localization:e,agentName:a}){let r=(m,u)=>V(e,m,u),[l,d]=f(null),t=xe(()=>{ia().then(m=>d(Array.isArray(m)?m:[])).catch(()=>d([]))},[]),s=He(t,5e3,!0),n=l?.filter(m=>m.status==="active").length??0,p=l?.filter(m=>m.status!=="active").length??0;return i("section",{className:"ce-shell ce-panel","data-card-editor-view":"agent-panel",ref:s,"aria-label":a?r("cardEditor.panel.titleWithAgent",{agent:a}):r("cardEditor.panel.title"),children:[o("div",{className:"ce-panel-head",children:o("strong",{className:"ce-panel-heading",children:r("cardEditor.panel.title")})}),o("p",{className:"ce-caption",children:r("cardEditor.panel.summaryCounts",{active:n,recent:p})}),o("button",{type:"button",className:"mari-chrome-control",onClick:()=>Ja(),children:r("cardEditor.panel.openWorkspace")})]})}var to=`
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

/* The workspace sizes to its content (capped), never a forced full-height void. */
.ce-dialog.ce-workspace {
  width: min(64rem, 100%);
  max-height: min(92dvh, 60rem);
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
  grid-template-columns: minmax(15rem, 20rem) minmax(0, 1fr);
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
  .ce-workspace-split {
    grid-template-columns: 1fr;
  }

  /* Mobile: the detail's back button provides the return navigation. */
  .ce-workspace-rail {
    display: none;
  }
}
`;function er({props:e}){let a=(t,s)=>V(e.localization,t,s),r=e.selectedCharacterIds??[],d=(e.selectionCount??r.length??0)>=1;return i("button",{type:"button",className:"mari-chrome-control ce-selection-button",disabled:!d,onClick:()=>{Ja({dispatch:{characterIds:r}}),e.onRequestClose?.()},children:[o(oe,{className:"ce-icon","aria-hidden":"true"}),a("cardEditor.action.open")]})}function ar({element:e}){let a=e.capabilityProps??{},r=e.getAttribute("view");return r==="selection-action"?o(er,{props:a}):r==="agent-panel"?o(ao,{localization:a.localization,agentName:a.agent?.name}):r==="overlay"?o(eo,{localization:a.localization}):null}function tr({element:e}){let[,a]=f(0);E(()=>{let l=()=>a(d=>d+1);return e.addEventListener("marinara-capability-props",l),()=>e.removeEventListener("marinara-capability-props",l)},[e]);let r=e.capabilityProps?.localization?.direction==="rtl"?"rtl":"ltr";return i("div",{dir:r,style:{display:"contents"},children:[o("style",{children:to}),o(ar,{element:e})]})}var ka=class extends HTMLElement{constructor(){super(...arguments);Ce(this,"__root",null);Ce(this,"capabilityProps")}attributeChangedCallback(r,l,d){r==="view"&&l!==d&&this.__root&&this.render()}render(){this.__root?.render(o(tr,{element:this}))}connectedCallback(){this.__root||(this.__root=lt(this)),this.render()}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null)})}};Ce(ka,"observedAttributes",["view"]);var oo="marinara-capability-card-editor";customElements.get(oo)||customElements.define(oo,ka);
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/check.js:
lucide-react/dist/esm/icons/chevron-down.js:
lucide-react/dist/esm/icons/chevron-left.js:
lucide-react/dist/esm/icons/chevron-right.js:
lucide-react/dist/esm/icons/refresh-cw.js:
lucide-react/dist/esm/icons/square-pen.js:
lucide-react/dist/esm/icons/x.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.513.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
