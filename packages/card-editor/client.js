var Fs=Object.defineProperty;var Os=(e,a,r)=>a in e?Fs(e,a,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[a]=r;var ra=(e,a,r)=>Os(e,typeof a!="symbol"?a+"":a,r);var $a=globalThis.__MARINARA_HOST__,U=$a&&$a.version===1&&$a.modules?$a.modules.react:void 0;if(!U)throw new Error("Marinara Engine does not provide react; this package needs capability API 1.341 or newer.");var ql=U.Activity,Hl=U.Children,Ul=U.Component,zl=U.Fragment,Gl=U.Profiler,Vl=U.PureComponent,_l=U.StrictMode,Wl=U.Suspense,Xl=U.ViewTransition,$l=U.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,jl=U.__COMPILER_RUNTIME,Kl=U.act,Jl=U.addTransitionType,Zl=U.cache,Ql=U.cacheSignal,Yl=U.captureOwnerStack,ed=U.cloneElement,fr=U.createContext,ha=U.createElement,ad=U.createRef,td=U.default,ja=U.forwardRef,rd=U.isValidElement,od=U.lazy,sd=U.memo,ld=U.startTransition,dd=U.unstable_useCacheRefresh,id=U.use,nd=U.useActionState,Oe=U.useCallback,mr=U.useContext,ud=U.useDebugValue,cd=U.useDeferredValue,W=U.useEffect,fd=U.useEffectEvent,pr=U.useId,md=U.useImperativeHandle,pd=U.useInsertionEffect,hd=U.useLayoutEffect,Ka=U.useMemo,gd=U.useOptimistic,xd=U.useReducer,se=U.useRef,m=U.useState,Ld=U.useSyncExternalStore,Id=U.useTransition,Cd=U.version;var Ja=globalThis.__MARINARA_HOST__,Ta=Ja&&Ja.version===1&&Ja.modules?Ja.modules["react-dom/client"]:void 0;if(!Ta)throw new Error("Marinara Engine does not provide react-dom/client; this package needs capability API 1.341 or newer.");var hr=Ta.createRoot,Sd=Ta.default,vd=Ta.hydrateRoot,kd=Ta.version;var gr=e=>e?.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();function xr(e,a,r=[]){if(a==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:gr(e),size:24,node:a,...r.length>0?{aliases:r}:{}}}var Lr=e=>{let a="",r=!1;for(let o of e){if(o==="-"||o==="_"||o<=" "){r=a.length>0;continue}a.length===0?a+=o.toLowerCase():a+=r?o.toUpperCase():o,r=!1}return a};var Ir=e=>{let a=Lr(e);return a.charAt(0).toUpperCase()+a.slice(1)};var Ba=(...e)=>e.filter((a,r,o)=>!!a&&a.trim()!==""&&o.indexOf(a)===r).join(" ").trim();var Ke={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};function wt(e){return e!=null}function Cr(e,a={}){let r=a.attributeNames??{},o=I=>r[I]??I,s=e.size??e.width??Ke.width,d=e.size??e.height??Ke.height,l=e.aliases?.filter(I=>typeof I=="string"&&I.trim()!=="").map(I=>`lucide-${I}`)??[],i=[...e.name?[`lucide-${e.name}`]:[],...l],n=a.className?.split(" ").filter(Boolean)??[],g=a.includeDefaultClasses===!1?Ba(...n):Ba("lucide",...i,...n),c=a.absoluteStrokeWidth?Number(a.strokeWidth??Ke["stroke-width"])*Number(e.size??e.width??Ke.width)/Number(a.size??a.width??Ke.width):a.strokeWidth??Ke["stroke-width"];return["svg",{...Object.entries(Ke).reduce((I,[C,k])=>(I[o(C)]=k,I),{}),..."color"in a&&a.color&&{[o("stroke")]:a.color},..."size"in a&&wt(a.size)&&{[o("width")]:a.size,[o("height")]:a.size},..."width"in a&&wt(a.width)&&{[o("width")]:a.width},..."height"in a&&wt(a.height)&&{[o("height")]:a.height},[o("stroke-width")]:c,...g&&{[o("class")]:g},[o("viewBox")]:`0 0 ${s} ${d}`,...a.hasA11yProp===!1?{[o("aria-hidden")]:"true"}:{},..."attributes"in a&&a.attributes},e.node.map(I=>{let[C,k,y]=I,T=a.nonScalingStroke?{[o("vector-effect")]:"non-scaling-stroke",...k}:k;return y?[C,T,y]:[C,T]})]}function br(e,a={}){return Cr(e,{...a,attributeNames:{...a.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}var Sr=e=>{for(let a in e)if(a.startsWith("aria-")||a==="role"||a==="title")return!0;return!1};var qs=fr({});var vr=()=>mr(qs);var kr=ja(({color:e,size:a,width:r,height:o,strokeWidth:s,absoluteStrokeWidth:d,nonScalingStroke:l,className:i="",children:n,iconNode:g=[],icon:c={node:g,aliases:[],size:24},...p},I)=>{let{size:C=24,strokeWidth:k=2,absoluteStrokeWidth:y=!1,nonScalingStroke:T=!1,color:K="currentColor",className:X=""}=vr()??{},q=!!n||Sr(p),[E,S,R=[]]=br(c,{color:e??K,width:r??a??C,height:o??a??C,strokeWidth:s??k,absoluteStrokeWidth:d??y,nonScalingStroke:l??T,className:Ba(X,i),hasA11yProp:q,attributes:p});return ha(E,{ref:I,...S},[...R.map(([F,v])=>ha(F,v)),...Array.isArray(n)?n:[n]])});function fe(e,a=[],r=[]){let o=typeof e=="string"?xr(e,a,r):e,s=ja(({className:d,...l},i)=>ha(kr,{ref:i,icon:o,className:d,...l}));return o.name&&(s.displayName=Ir(o.name)),s}var yr={name:"arrow-down",size:24,node:[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]]};yr.node;var oa=fe(yr);var wr={name:"arrow-up",size:24,node:[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]]};wr.node;var sa=fe(wr);var Er={name:"check",size:24,node:[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]};Er.node;var Ma=fe(Er);var Pr={name:"chevron-down",size:24,node:[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]};Pr.node;var Da=fe(Pr);var Ar={name:"chevron-left",size:24,node:[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]};Ar.node;var Je=fe(Ar);var Rr={name:"chevron-right",size:24,node:[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]};Rr.node;var Na=fe(Rr);var Tr={name:"plus",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]};Tr.node;var la=fe(Tr);var Br={name:"square-pen",size:24,node:[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],aliases:["pen-box","edit","pen-square"]};Br.node;var be=fe(Br);var Mr={name:"trash",size:24,node:[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],aliases:["trash-2"]};Mr.node;var Ze=fe(Mr);var Dr={name:"x",size:24,node:[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]};Dr.node;var me=fe(Dr);var Pt="/api",Hs="/card-editor",Nr="x-marinara-csrf";var Us="marinara_admin_secret";function At(e){let a=e.status;return a==="apply"||a==="needs-confirmation"}var da=class extends Error{constructor(r,o,s){super(o);ra(this,"status");ra(this,"payload");this.name="CardEditorApiError",this.status=r,this.payload=s}};function Rt(){if(typeof window>"u")return{};try{let e=window.localStorage.getItem(Us)?.trim();return e?{"X-Admin-Secret":e}:{}}catch{return{}}}function Tt(e,a){if(!e||typeof e!="object"||Array.isArray(e))return a;let r=e;if(typeof r.error=="string"&&r.error.trim())return r.error.trim();if(r.error&&typeof r.error=="object"&&!Array.isArray(r.error)){let o=r.error.message;if(typeof o=="string"&&o.trim())return o.trim()}return typeof r.message=="string"&&r.message.trim()?r.message.trim():a}async function ne(e,a="GET",r,o){let s=new Headers(Rt());a!=="GET"&&s.set(Nr,"1"),r!==void 0&&s.set("Content-Type","application/json");let d=await fetch(`${Pt}${Hs}${e}`,{method:a,headers:s,signal:o,cache:"no-store",credentials:"same-origin",...r===void 0?{}:{body:JSON.stringify(r)}});if(!d.ok){let l=await d.json().catch(()=>null);throw new da(d.status,Tt(l,d.statusText),l)}if(d.status!==204)return d.json()}function Qe(e,a=""){return`/sessions/${encodeURIComponent(e)}${a}`}function ia(e,a,r){return Qe(e,`/items/${encodeURIComponent(a)}${r}`)}function Fr(e){return ne("/sessions","POST",e)}function Or(e,a,r,o){return ne(ia(e,a,"/split"),"POST",{decision:r,...o?{names:o}:{}})}function qr(e){return ne(Qe(e,"/phase2"),"POST",{})}function xa(e){return ne("/schemas","GET",void 0,e)}function Hr(e){return ne(`/schemas/${encodeURIComponent(e.id)}`,"PUT",{name:e.name,text:e.text})}function Ur(e){return ne(`/schemas/${encodeURIComponent(e)}`,"DELETE")}function zr(e){return ne("/agent-config","GET",void 0,e)}function Za(e){return ne("/settings","GET",void 0,e)}function Gr(e){return ne("/settings","PUT",e)}function Qa(e){return ne("/sessions","GET",void 0,e)}function na(e,a){return ne(Qe(e),"GET",void 0,a)}function Vr(e){return ne(Qe(e,"/cancel"),"POST")}function _r(e){return ne(Qe(e,"/rerun"),"POST")}function Fa(e,a){return ne(ia(e,a,"/retry"),"POST")}function Wr(e,a){return ne(ia(e,a,"/cancel"),"POST")}function Xr(e,a,r){return ne(ia(e,a,"/edit-retry"),"POST",r)}function $r(e,a,r){return ne(ia(e,a,"/repair"),"POST",{rawOutput:r})}function Bt(e,a,r){return ne(ia(e,a,"/verdict"),"POST",r)}function Ya(e,a,r){return ne(ia(e,a,"/apply-result"),"POST",{results:r})}function jr(e){return ne(Qe(e,"/duplicate-applied"),"POST")}function Kr(e,a){return ne(Qe(e,"/combine"),"POST",a)}function Jr(e,a={}){let r=a.force?"?force=true":"";return ne(Qe(e,r),"DELETE")}async function La(e,a){let r=await fetch(`${Pt}${e}`,{headers:new Headers(Rt()),signal:a,cache:"no-store",credentials:"same-origin"});if(!r.ok){let o=await r.json().catch(()=>null);throw new da(r.status,Tt(o,r.statusText),o)}return r.json()}function Mt(e){try{let a=JSON.parse(e.data);if(a&&typeof a=="object"&&!Array.isArray(a)){let r=a.name;if(typeof r=="string"&&r.trim())return r}}catch{}return""}async function Zr(e){let a=await La("/connections",e);return Array.isArray(a)?a.filter(r=>r&&typeof r.id=="string"&&typeof r.name=="string"&&r.provider!=="image_generation"&&r.provider!=="video_generation"):[]}async function et(e,a){let r=await La(`/characters/${encodeURIComponent(e)}`,a),o=typeof r?.id=="string"&&r.id?r.id:e;return{id:o,name:Mt(r)||o,avatarPath:typeof r?.avatarPath=="string"&&r.avatarPath?r.avatarPath:null}}var zs=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions"];function Et(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:{}}function ga(e){return typeof e=="string"?e:""}function Gs(e,a){let r=(()=>{try{return Et(JSON.parse(typeof e?.data=="string"?e.data:"{}"))}catch{return{}}})(),o=Et(r.extensions),s={name:ga(r.name),backstory:ga(o.backstory),appearance:ga(o.appearance),...Object.fromEntries(zs.map(l=>[l,ga(r[l])]))},d=typeof e?.id=="string"&&e.id?e.id:a;return{id:d,name:s.name.trim()||d,avatarPath:typeof e?.avatarPath=="string"&&e.avatarPath?e.avatarPath:null,fields:s}}async function _e(e,a){let r=await La(`/characters/${encodeURIComponent(e)}`,a);return Gs(r,e)}function Dt(e){let{fields:a}=e;return{name:a.name,description:a.description,personality:a.personality,backstory:a.backstory,appearance:a.appearance,system_prompt:a.system_prompt}}async function Qr(e,a){let r=await La(`/lorebooks/${encodeURIComponent(e)}/entries`,a);return Array.isArray(r)?r.map(o=>{let s=Et(o);return{name:ga(s.name),content:ga(s.content),enabled:s.enabled!==!1&&s.enabled!=="false"}}):[]}async function at(e,a,r){let o=new Headers(Rt());o.set(Nr,"1"),r!==void 0&&o.set("Content-Type","application/json");let s=await fetch(`${Pt}${e}`,{method:a,headers:o,cache:"no-store",credentials:"same-origin",...r===void 0?{}:{body:JSON.stringify(r)}});if(!s.ok){let d=await s.json().catch(()=>null);throw new da(s.status,Tt(d,s.statusText),d)}return s.json()}function Nt(e,a,r){return at(`/characters/${encodeURIComponent(e)}`,"PATCH",{data:a,versionSource:r.versionSource,versionReason:r.versionReason})}function Yr(e){return at(`/characters/${encodeURIComponent(e)}/duplicate`,"POST")}function eo(e,a){return at(`/characters/${encodeURIComponent(e)}/avatar`,"POST",{avatar:a,filename:"card-editor-composite.png"})}function ao(e){return at("/characters","POST",{data:e})}function to(e,a){let r=new URLSearchParams({limit:String(e.limit??50),offset:String(e.offset??0),sort:"name-asc"}),o=e.search?.trim();return o&&r.set("search",o),La(`/characters/catalog?${r.toString()}`,a)}async function ro(e){let a=await La("/lorebooks",e);return Array.isArray(a)?a.filter(r=>!!r&&typeof r.id=="string"&&typeof r.name=="string"):[]}function tt(e,a){let r=a.prefix?.trim()?a.prefix:void 0,o=a.suffix?.trim()?a.suffix:void 0,s=a.removePrefix?.trim()?a.removePrefix:void 0,d=a.removeSuffix?.trim()?a.removeSuffix:void 0,l=e;return s&&l.toLowerCase().startsWith(s.toLowerCase())&&(l=l.slice(s.length)),d&&l.toLowerCase().endsWith(d.toLowerCase())&&(l=l.slice(0,-d.length)),l=l.trim(),l||(l=e),`${r??""}${l}${o??""}`}var Vs=/&#(?:(x|X)([0-9a-fA-F]+)|([0-9]+));/g,_s=[[/&lt;/g,"<"],[/&gt;/g,">"],[/&quot;/g,'"'],[/&apos;/g,"'"],[/&nbsp;/g,"\xA0"]];function qe(e){let r=e.replace(Vs,(o,s,d,l)=>{let i=s?Number.parseInt(d,16):Number(l);if(!Number.isInteger(i)||i<=0||i>1114111)return o;try{return String.fromCodePoint(i)}catch{return o}});for(let[o,s]of _s)r=r.replace(o,s);return r.replace(/&amp;/g,"&")}var oo={_meta:{locale:"en",direction:"ltr"},"cardEditor.title":"Card Editor","cardEditor.panel.empty":"No bulk editing sessions yet.","cardEditor.error.network":"Could not reach Card Editor.","cardEditor.action.open":"Card Editor","cardEditor.dialog.title":"Bulk Card Editor","cardEditor.dialog.close":"Close","cardEditor.dialog.draft.restored":"Restored your unsent draft: {{count}} characters and {{notes}} notes.","cardEditor.dialog.rerun.restored":"Rerunning {{count}} cards from \u201C{{label}}\u201D with their notes and settings.","cardEditor.dialog.draft.discard":"Start fresh","cardEditor.dialog.presets.title":"Presets","cardEditor.dialog.presets.name":"Preset name","cardEditor.dialog.presets.namePlaceholder":"Type a new name or pick a saved preset","cardEditor.dialog.presets.hint":"Presets save every setting below except the targets and their notes.","cardEditor.dialog.presets.load":"Load","cardEditor.dialog.presets.save":"Save","cardEditor.dialog.presets.overwrite":"Overwrite","cardEditor.dialog.presets.delete":"Delete","cardEditor.dialog.targets.title":"Targets \xB7 {{count}} characters","cardEditor.dialog.targets.loading":"Loading selected cards\u2026","cardEditor.dialog.targets.empty":"No cards yet. Search above to add characters to this run.","cardEditor.dialog.targets.loadFailed":"card could not be loaded","cardEditor.dialog.targets.notePlaceholder":"Focus on backstory\u2026","cardEditor.dialog.targets.noteLabel":"Note for {{name}}","cardEditor.dialog.targets.styleLabel":"Style override for {{name}}","cardEditor.dialog.targets.styleSession":"\u2014 use session style \u2014","cardEditor.dialog.targets.styleNone":"None","cardEditor.dialog.targets.unloadableBlock":"Remove cards that could not be loaded before dispatching.","cardEditor.dialog.targets.remove":"Remove {{name}}","cardEditor.dialog.search.placeholder":"Search characters\u2026","cardEditor.dialog.search.loading":"Searching\u2026","cardEditor.dialog.search.noResults":"No characters match.","cardEditor.dialog.search.error":"Characters could not be loaded.","cardEditor.dialog.search.invalid":"Invalid search: {{message}}","cardEditor.dialog.model.title":"Model","cardEditor.dialog.model.connection":"Connection","cardEditor.dialog.model.connectionDefault":"\u2014 agent default \u2014","cardEditor.dialog.model.connectionsLoading":"Loading connections\u2026","cardEditor.dialog.model.connectionsError":"Connections could not be loaded.","cardEditor.dialog.model.preset":"Prompt preset","cardEditor.dialog.model.presetStandard":"Standard rewrite","cardEditor.dialog.model.presetStrict":"Strict surgical","cardEditor.dialog.model.presetRebalance":"Field rebalancing","cardEditor.dialog.model.presetXmlSimple":"XML \xB7 Simple","cardEditor.dialog.model.presetXmlComplex":"XML \xB7 Complex","cardEditor.dialog.model.presetCustom":"Custom\u2026","cardEditor.dialog.model.customTemplate":"Custom template","cardEditor.dialog.model.customTemplateHint":"The full prompt template sent for every card. Choosing Custom prefills this field with the current preset's body.","cardEditor.dialog.instructions.title":"Instructions & references","cardEditor.dialog.instructions.global":"Global instruction","cardEditor.dialog.instructions.globalPlaceholder":"Applies to every card \u2014 e.g. tighten prose, remove meta commentary\u2026","cardEditor.dialog.instructions.behavior":"Behavior character","cardEditor.dialog.instructions.behaviorHint":"One card whose behavior, judgment, and writing style guide how edits are written. The directive and notes still decide what changes.","cardEditor.dialog.instructions.behaviorNone":"None","cardEditor.dialog.instructions.lorebooks":"Global lorebooks","cardEditor.dialog.instructions.lorebooksHint":"Reference context applied to every card.","cardEditor.dialog.instructions.lorebooksFilter":"Filter lorebooks\u2026","cardEditor.dialog.instructions.lorebooksLoading":"Loading lorebooks\u2026","cardEditor.dialog.instructions.lorebooksEmpty":"No lorebooks in the library.","cardEditor.dialog.instructions.lorebooksNoneMatch":"No lorebooks match the filter.","cardEditor.dialog.instructions.lorebooksError":"Lorebooks could not be loaded.","cardEditor.dialog.processing.title":"Processing","cardEditor.dialog.processing.modeIndividual":"One agent per card","cardEditor.dialog.processing.modeBatched":"Batched \u2014 XML, N cards per call","cardEditor.dialog.processing.batchSize":"Batch size","cardEditor.dialog.processing.providerRetries":"Provider retries","cardEditor.dialog.processing.refusalRetries":"Refusal retries","cardEditor.dialog.processing.concurrency":"Concurrency","cardEditor.dialog.processing.rebalance":"Rebalance field content","cardEditor.dialog.processing.rebalanceHint":"Splits content into Description / Personality / Backstory / Appearance / Scenario.","cardEditor.dialog.processing.completionMode":"On completion","cardEditor.dialog.processing.completionAsk":"Ask (default)","cardEditor.dialog.processing.completionApply":"Always apply in place","cardEditor.dialog.processing.completionDuplicate":"Always duplicate","cardEditor.dialog.processing.completionCaption":"Apply mode holds stale cards for review instead of overwriting them. Duplicates use this session's prefix or suffix.","cardEditor.dialog.processing.autoDisabledNote":"The Card Editor's bulk settings require review, so auto-approve and on-completion writes are disabled here.","cardEditor.dialog.processing.overflowCaption":"On context overflow the failed batch is split and re-dispatched automatically until single-card calls remain.","cardEditor.dialog.saving.title":"Saving","cardEditor.dialog.saving.confirm":"In-place \u2014 confirm each card","cardEditor.dialog.saving.auto":"In-place \u2014 auto-approve (saves each character's latest revision)","cardEditor.dialog.saving.duplicate":"Duplicate \u2014 apply to copies","cardEditor.dialog.saving.duplicatePrefix":"Name prefix","cardEditor.dialog.saving.duplicatePrefixPlaceholder":"Prefix for the copy names","cardEditor.dialog.saving.duplicatePrefixHint":"Both affixes apply: copies are named prefix + name + suffix. Blank boxes are ignored.","cardEditor.dialog.saving.duplicateSuffix":"Name suffix","cardEditor.dialog.saving.duplicateSuffixPlaceholder":"Suffix for the copy names","cardEditor.dialog.saving.duplicateRemoveGroup":"Remove from name","cardEditor.dialog.saving.duplicateRemovePrefix":"Remove prefix","cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder":"Strip this from the start of the copy name","cardEditor.dialog.saving.duplicateRemoveSuffix":"Remove suffix","cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder":"Strip this from the end of the copy name","cardEditor.dialog.saving.duplicateNamePreview":"Copy name: {{name}}","cardEditor.dialog.saving.combined":"Combined \u2014 create one new card","cardEditor.dialog.saving.combinedName":"Combined card name","cardEditor.dialog.saving.combinedNamePlaceholder":"The one new card's name","cardEditor.dialog.saving.combinedCaption":"Each character's generated XML document is joined into ONE new card's description \u2014 no per-card writes.","cardEditor.dialog.saving.combinedNameRequired":"Enter a name for the combined card before dispatching.","cardEditor.dialog.saving.reviewRequiredHint":"The bulk settings require review, so auto-approve is unavailable \u2014 dispatches wait for your confirmation.","cardEditor.dialog.saving.caption":"In-place always writes a new revision. Auto-approve holds back cards that genuinely changed mid-run for review. Duplicates are renamed by the affixes above \u2014 prefix, suffix, and removals combine. Combined concatenates each generated XML document into one new card.","cardEditor.dialog.estimate":"Batched \xD7{{batch}} \u2192 {{batchedCalls}} calls \xB7 individual \u2192 {{individualCalls}} calls","cardEditor.dialog.dispatch":"Dispatch","cardEditor.dialog.dispatching":"Dispatching\u2026","cardEditor.dialog.dispatchError":"Could not create the session: {{message}}","cardEditor.panel.title":"Bulk runs","cardEditor.panel.openWorkspace":"Open Card Editor workspace","cardEditor.panel.summaryCounts":"{{active}} active \xB7 {{recent}} past sessions","cardEditor.panel.titleWithAgent":"Bulk runs \u2014 {{agent}}","cardEditor.panel.refresh":"Refresh","cardEditor.panel.loading":"Loading sessions\u2026","cardEditor.panel.loadError":"Sessions could not be loaded.","cardEditor.panel.activeTitle":"Active","cardEditor.panel.historyTitle":"History","cardEditor.panel.progress":"{{done}} of {{total}} cards","cardEditor.panel.modeIndividual":"individual","cardEditor.panel.modeBatched":"batched \xD7{{size}}","cardEditor.panel.saveMode.confirm":"confirm each card","cardEditor.panel.saveMode.auto":"auto-approve","cardEditor.panel.saveMode.duplicate":"duplicate","cardEditor.panel.saveMode.combined":"combined","cardEditor.panel.completionMode.ask":"on completion \xB7 ask","cardEditor.panel.completionMode.apply":"on completion \xB7 apply","cardEditor.panel.completionMode.duplicate":"on completion \xB7 duplicate","cardEditor.panel.enforcementProgress":"Applying completion outcome \xB7 {{done}} of {{total}} cards","cardEditor.panel.runAgain":"Run again","cardEditor.panel.live.batch":"Running batch {{index}} of {{count}}","cardEditor.panel.live.batchRetry":" \xB7 attempt {{attempt}}","cardEditor.panel.live.items":"Editing {{running}} of {{total}} cards","cardEditor.panel.live.queued":"{{count}} cards queued","cardEditor.panel.live.settling":"Finishing up\u2026","cardEditor.panel.cancel":"Cancel","cardEditor.panel.delete":"Delete","cardEditor.panel.deleteConfirm":"Delete this session? Its results are lost.","cardEditor.panel.deleteConfirmActive":"Still running \u2014 cancel it and delete?","cardEditor.panel.deleteYes":"Delete","cardEditor.panel.deleteYesActive":"Cancel & delete","cardEditor.panel.deleteNo":"Keep","cardEditor.panel.interruptedNotice":"The server restarted mid-run, so this session was interrupted. Failed items can still be retried from this session.","cardEditor.panel.statsFailed":"{{count}} failed","cardEditor.panel.sessionStatus.active":"active","cardEditor.panel.sessionStatus.completed":"completed","cardEditor.panel.sessionStatus.canceled":"canceled","cardEditor.panel.sessionStatus.interrupted":"interrupted","cardEditor.panel.back":"Back to sessions","cardEditor.panel.status.queued":"queued","cardEditor.panel.status.running":"running","cardEditor.panel.status.succeeded":"succeeded","cardEditor.panel.status.awaitingReview":"awaiting review","cardEditor.panel.status.needsReview":"needs review","cardEditor.panel.status.applied":"applied","cardEditor.panel.status.duplicated":"duplicated","cardEditor.panel.status.rejected":"rejected","cardEditor.panel.status.failedProvider":"failed \xB7 provider","cardEditor.panel.status.failedRefusal":"failed \xB7 refusal","cardEditor.panel.status.failedParse":"failed \xB7 parse","cardEditor.panel.status.canceled":"canceled","cardEditor.panel.status.interrupted":"interrupted","cardEditor.panel.status.unknown":"unknown","cardEditor.panel.detail.loading":"Loading session\u2026","cardEditor.panel.detail.loadError":"The session could not be loaded.","cardEditor.panel.detail.cancelAll":"Cancel all","cardEditor.panel.detail.rerunFailed":"Rerun all failed ({{count}})","cardEditor.panel.detail.reviewQueue":"Review queue ({{count}})","cardEditor.panel.detail.delete":"Delete session","cardEditor.panel.detail.summary":"{{fields}} fields \xB7 +{{added}}/\u2212{{removed}} words","cardEditor.panel.detail.noChanges":"no changes proposed","cardEditor.panel.detail.copyCreated":"copy: {{id}}","cardEditor.panel.detail.combine":"Create combined card ({{count}})","cardEditor.panel.detail.combinePartialConfirm":"{{count}} of {{total}} cards were collected. Create the combined card from the collected cards only?","cardEditor.panel.detail.combineYes":"Combine {{count}}","cardEditor.panel.detail.combineNo":"Cancel","cardEditor.panel.detail.combinedCreated":"combined card created: {{id}}","cardEditor.panel.detail.duplicateApplied":"Duplicate applied cards ({{count}})","cardEditor.panel.detail.duplicateAppliedPartial":"{{failed}} of {{total}} cards could not be duplicated \u2014 retry from the item row.","cardEditor.panel.detail.autoApplyError":"Auto-apply failed for {{name}}: {{message}}","cardEditor.panel.detail.actionError":"Action failed: {{message}}","cardEditor.panel.detail.pagePrev":"Previous page","cardEditor.panel.detail.pageNext":"Next page","cardEditor.panel.detail.page":"Page {{page}} of {{pages}}","cardEditor.panel.action.review":"Review","cardEditor.panel.action.rerun":"Rerun","cardEditor.panel.action.editRetry":"Edit & retry","cardEditor.panel.action.fixJson":"Fix JSON","cardEditor.panel.action.inspect":"Inspect","cardEditor.panel.action.cancelItem":"Cancel","cardEditor.panel.settings.title":"Bulk settings","cardEditor.panel.settings.maxParallelAgents":"Max parallel agents","cardEditor.panel.settings.maxParallelAgentsHint":"Upper bound on concurrent calls in bulk runs. 0 follows the connection's parallel job limit.","cardEditor.panel.settings.disableAutoVerdicts":"Require review (disable auto-approve / auto-apply)","cardEditor.panel.settings.disableAutoVerdictsHint":"Bulk dispatches always wait for your confirmation; auto-approve and on-completion apply/duplicate are turned off.","cardEditor.panel.settings.save":"Save settings","cardEditor.panel.settings.saved":"Saved.","cardEditor.queue.title":"Review changes","cardEditor.queue.close":"Back to the session","cardEditor.queue.position":"{{index}} of {{count}}","cardEditor.queue.empty":"Nothing left to review.","cardEditor.queue.dotsLabel":"Review progress","cardEditor.queue.dotLabel":"{{name}}: {{status}}","cardEditor.queue.chips.fields":"{{count}} fields","cardEditor.queue.chips.added":"+{{count}} words","cardEditor.queue.chips.removed":"\u2212{{count}} words","cardEditor.queue.chips.fieldWords":"{{count}} words","cardEditor.queue.duplicateNote":"Approving copies the current card and applies these fields to the copy.","cardEditor.queue.hiddenLines":"\u22EF {{count}} unchanged lines \u22EF","cardEditor.queue.miniRowWords":"+{{added}}/\u2212{{removed}} words","cardEditor.queue.field.expand":"show all hunks \u2192","cardEditor.queue.staleTitle":"{{count}} fields changed since the run \u2014 applying replaces them.","cardEditor.queue.staleApply":"Apply anyway","cardEditor.queue.staleSkip":"Skip","cardEditor.queue.applyFailed":"Applying failed: {{message}} \u2014 rerun the item from the session table.","cardEditor.queue.reportFailed":"The card was written but the confirmation could not be sent: {{message}} \u2014 reload the session to see the true state.","cardEditor.queue.verdictError":"The verdict failed: {{message}}","cardEditor.queue.prev":"Previous card","cardEditor.queue.next":"Next card","cardEditor.queue.reject":"Reject","cardEditor.queue.approve":"Approve","cardEditor.queue.rejectHint":"R","cardEditor.queue.approveHint":"A","cardEditor.queue.working":"Working\u2026","cardEditor.queue.approveAll":"Approve all remaining without review","cardEditor.queue.approveAllWorking":"Approving\u2026","cardEditor.editRetry.title":"Edit & retry \u2014 {{name}}","cardEditor.editRetry.close":"Close","cardEditor.editRetry.hint":"The exact rendered prompt sent to the model. Retry re-dispatches this card with the edited text.","cardEditor.editRetry.system":"System prompt","cardEditor.editRetry.user":"User prompt","cardEditor.editRetry.missing":"The rendered prompt was not retained for this item; use rerun instead.","cardEditor.editRetry.cancel":"Cancel","cardEditor.editRetry.retry":"Retry","cardEditor.editRetry.retrying":"Retrying\u2026","cardEditor.editRetry.error":"The retry failed: {{message}}","cardEditor.fixJson.title":"Fix JSON \u2014 {{name}}","cardEditor.fixJson.hint":"The model's response could not be parsed, even after auto-repair and a strict-JSON retry. Fix it and apply, or retry generation.","cardEditor.fixJson.response":"Raw model response","cardEditor.fixJson.dismiss":"Dismiss","cardEditor.fixJson.regenerate":"Retry generation","cardEditor.fixJson.apply":"Apply fix","cardEditor.workspace.title":"Card Editor","cardEditor.workspace.close":"Close","cardEditor.panel.status.awaitingSplit":"split proposed","cardEditor.panel.status.split":"split","cardEditor.panel.status.staged":"phase 1 done","cardEditor.dialog.model.presetTransform":"Transform to a schema","cardEditor.transform.title":"Schema transform","cardEditor.transform.schema":"Schema","cardEditor.transform.schemaBuiltIn":"{{name}} (built-in)","cardEditor.transform.editSchemas":"Edit schemas","cardEditor.transform.schemasError":"Schemas could not be loaded. Close the dialog and try again.","cardEditor.transform.formatLabel":"Write fields as","cardEditor.transform.format.markdown":"Markdown","cardEditor.transform.format.xml":"XML","cardEditor.transform.format.json":"JSON","cardEditor.transform.multiTitle":"When one card describes several characters","cardEditor.transform.multiMerge":"Keep them on one card","cardEditor.transform.multiMergeHint":"One result per source card. Each character gets its own document on that card.","cardEditor.transform.multiSplit":"Split them into separate cards","cardEditor.transform.multiSplitHint":"You confirm every split first. Split characters become new cards linked to the source, and the source card is never changed.","cardEditor.transform.outputModeTitle":"How the model answers","cardEditor.transform.outputStructured":"Structured fields (recommended)","cardEditor.transform.outputStructuredHint":"The model fills the schema as data and Marinara writes it as {{format}}.","cardEditor.transform.outputDocument":"The model writes the document itself","cardEditor.transform.outputDocumentHint":"The earlier method: the model writes each field's document text directly. Validation is skipped.","cardEditor.transform.providerJsonOn":"Provider JSON mode is on for the Card Editor agent. Connections that support it enforce the response shape; others use the normal prompt.","cardEditor.transform.providerJsonOff":"Provider JSON mode is off. Turn on \u201CUse structured output\u201D in the Card Editor agent settings to let supported connections enforce the response shape.","cardEditor.transform.providerJsonUnknown":"This Engine version does not report provider JSON mode, so the normal prompt is used.","cardEditor.transform.phase2":"Run a second phase","cardEditor.transform.phase2Hint":"After every split is decided, every Phase 1 result is processed again. Nothing is written to your cards until Phase 2 finishes.","cardEditor.transform.phase2Instruction":"Phase 2 instruction","cardEditor.transform.phase2InstructionPlaceholder":"For example: tighten the prose and make each card name its relations to the others.","cardEditor.transform.phase2Schema":"Phase 2 schema","cardEditor.transform.sameAsPhase1":"Same as Phase 1","cardEditor.transform.phase2AllowSplits":"Allow splits in Phase 2","cardEditor.pipeline.label":"Run totals","cardEditor.pipeline.count":"{{sources}} cards \u2192 {{results}} results","cardEditor.pipeline.splitsAccepted":"{{count}} source card(s) split into several characters","cardEditor.pipeline.noSplits":"No splits","cardEditor.pipeline.phaseLabel":"Shown phase","cardEditor.pipeline.phase":"Phase {{phase}}","cardEditor.pipeline.splitsPending":"{{count}} split(s) waiting for you","cardEditor.pipeline.startPhase2":"Start Phase 2 \xB7 {{count}} cards","cardEditor.panel.action.reviewSplit":"Review split","cardEditor.panel.detail.splitProposed":"The model proposes {{count}} characters for this card.","cardEditor.panel.detail.splitInto":"Split into {{count}} new cards. This card stays unchanged.","cardEditor.panel.detail.lineage":"{{index}} of {{count}} from {{origin}}","cardEditor.panel.detail.issues":"{{count}} schema issue(s)","cardEditor.split.title":"Split review \xB7 {{name}}","cardEditor.split.close":"Close split review","cardEditor.split.source":"Source card","cardEditor.split.sourceEmpty":"The source card has no description.","cardEditor.split.proposal":"The model proposes {{count}} characters.","cardEditor.split.reason":"Reason: {{reason}}","cardEditor.split.cardName":"Card {{index}} name","cardEditor.split.issues":"{{count}} schema issue(s)","cardEditor.split.outcome":"Accepting creates {{count}} new cards linked to the source. The source card is not changed.","cardEditor.split.skip":"Skip this card","cardEditor.split.retrySingle":"Retry as one card","cardEditor.split.accept":"Accept split \xB7 {{count}} cards","cardEditor.schemas.title":"Schema studio","cardEditor.schemas.close":"Close schema studio","cardEditor.schemas.loadError":"Schemas could not be loaded.","cardEditor.schemas.listLabel":"Schemas","cardEditor.schemas.builtIn":"Built-in","cardEditor.schemas.yours":"Yours","cardEditor.schemas.modeLabel":"Editor","cardEditor.schemas.modeBuilder":"Builder","cardEditor.schemas.modeText":"Text","cardEditor.schemas.textLabel":"Schema text","cardEditor.schemas.valid":"Valid schema","cardEditor.schemas.invalid":"Line {{line}}: {{message}}","cardEditor.schemas.kindGroup":"group","cardEditor.schemas.kindVocab":"values","cardEditor.schemas.kindRepeat":"repeats","cardEditor.schemas.maxChip":"max {{max}}","cardEditor.schemas.targetChip":"\u2192 {{field}}","cardEditor.schemas.nodeKey":"Element name","cardEditor.schemas.nodeTarget":"Card field","cardEditor.schemas.targetDefault":"description (default)","cardEditor.schemas.targetInherit":"Same as its top-level element","cardEditor.schemas.nodeHint":"Hint for the model","cardEditor.schemas.nodeHintPlaceholder":"What belongs here","cardEditor.schemas.nodeAttributes":"Attributes","cardEditor.schemas.nodeAttributesHint":"One per line as name=a | b | c. Leave the values empty for freeform; end with etc. to allow other values.","cardEditor.schemas.nodeMax":"Max length","cardEditor.schemas.nodeMaxNone":"none","cardEditor.schemas.nodeRepeat":"List of entries","cardEditor.schemas.addChild":"Add element","cardEditor.schemas.moveUp":"Move element up","cardEditor.schemas.moveDown":"Move element down","cardEditor.schemas.removeNode":"Remove","cardEditor.schemas.previewLabel":"Compiled preview","cardEditor.schemas.preview.markdown":"Markdown","cardEditor.schemas.preview.xml":"XML","cardEditor.schemas.preview.json":"JSON","cardEditor.schemas.preview.schema":"JSON Schema","cardEditor.schemas.previewHint.markdown":"The template the model sees when it writes Markdown itself.","cardEditor.schemas.previewHint.xml":"The template the model sees when it writes XML itself.","cardEditor.schemas.previewHint.json":"The data shape the model fills in structured mode, for every output format.","cardEditor.schemas.previewHint.schema":"Sent as provider structured output when the connection supports it.","cardEditor.schemas.name":"Schema name","cardEditor.schemas.copyName":"{{name}} copy","cardEditor.schemas.duplicate":"Save as new","cardEditor.schemas.save":"Save","cardEditor.schemas.delete":"Delete","cardEditor.schemas.deleteConfirm":"Delete \u201C{{name}}\u201D? Runs that already used it keep their copy.","cardEditor.schemas.deleteYes":"Delete schema","cardEditor.schemas.deleteNo":"Keep","cardEditor.avatar.open":"Avatar studio","cardEditor.avatar.title":"Avatar studio","cardEditor.avatar.close":"Close avatar studio","cardEditor.avatar.images":"Images","cardEditor.avatar.loading":"Loading card images\u2026","cardEditor.avatar.noImage":"No avatar; shows initials","cardEditor.avatar.moveUp":"Move {{name}} earlier","cardEditor.avatar.moveDown":"Move {{name}} later","cardEditor.avatar.sourcesHint":"Defaults to every card in this run. The source images are never changed.","cardEditor.avatar.canvasLabel":"Avatar composite. Drag to pan, scroll or pinch to zoom. With the canvas focused: Tab changes cell, arrow keys pan, plus and minus zoom, 0 resets the cell.","cardEditor.avatar.selected":"Selected: {{name}} \xB7 zoom {{zoom}}%","cardEditor.avatar.layout":"Layout","cardEditor.avatar.method.square":"Square","cardEditor.avatar.method.portrait":"Portrait","cardEditor.avatar.method.best-fit":"Best fit","cardEditor.avatar.columns":"Columns","cardEditor.avatar.columnsAuto":"Auto","cardEditor.avatar.gap":"Gap \xB7 {{gap}} px","cardEditor.avatar.zoom":"Cell zoom \xB7 {{zoom}}%","cardEditor.avatar.resolution":"Export size","cardEditor.avatar.resetCell":"Reset cell","cardEditor.avatar.resetAll":"Reset all","cardEditor.avatar.keys":"Tab changes cell \xB7 arrows pan \xB7 + and \u2212 zoom \xB7 0 resets","cardEditor.avatar.target":"Use as avatar for","cardEditor.avatar.targetOption":"Avatar for {{name}}","cardEditor.avatar.noTargets":"No cards written yet","cardEditor.avatar.apply":"Use as avatar","cardEditor.avatar.applying":"Saving\u2026","cardEditor.avatar.applied":"Saved as the avatar of {{name}}.","cardEditor.dialog.targets.add":"Add characters\u2026","cardEditor.setup.summary":"Run summary","cardEditor.setup.targets":"Targets","cardEditor.workspace.newRun":"New run","cardEditor.workspace.newRunCount":"New run \xB7 {{count}} characters selected","cardEditor.workspace.draft":"Unsent draft","cardEditor.workspace.draftCount":"{{count}} cards","cardEditor.workspace.pickRun":"Pick a run on the left, or start a new one.","cardEditor.workspace.runs":"Runs","cardEditor.workspace.run":"Run","cardEditor.workspace.stages":"Run stages","cardEditor.workspace.stage.setup":"Setup","cardEditor.workspace.stage.processing":"Processing","cardEditor.workspace.stage.review":"Review","cardEditor.workspace.stage.finish":"Finish","cardEditor.workspace.items":"Items","cardEditor.workspace.filterItems":"Filter cards by name\u2026","cardEditor.workspace.statusFilter":"Filter by status","cardEditor.workspace.group.all":"All {{count}}","cardEditor.workspace.group.review":"Awaiting review {{count}}","cardEditor.workspace.group.approved":"Approved {{count}}","cardEditor.workspace.group.split":"Split {{count}}","cardEditor.workspace.group.failed":"Failed {{count}}","cardEditor.workspace.group.rejected":"Rejected {{count}}","cardEditor.workspace.group.running":"In progress {{count}}","cardEditor.workspace.selectListed":"Select the {{count}} cards shown","cardEditor.workspace.selectItem":"Select {{name}}","cardEditor.workspace.noItems":"No card matches these filters.","cardEditor.workspace.pickItem":"Pick a card from the list to see its changes.","cardEditor.workspace.tab.changes":"Changes","cardEditor.workspace.tab.split":"Split","cardEditor.workspace.tab.retry":"Prompt & retry","cardEditor.workspace.tab.json":"Raw output","cardEditor.workspace.tab.summary":"Details","cardEditor.workspace.selectedCount":"{{count}} selected","cardEditor.workspace.approveSelected":"Approve selected ({{count}})","cardEditor.workspace.rejectSelected":"Reject selected ({{count}})","cardEditor.workspace.rerunSelected":"Rerun selected ({{count}})","cardEditor.workspace.approveAll":"Approve all remaining ({{count}})"};var Ft=Object.fromEntries(Object.entries(oo).filter(([e,a])=>e!=="_meta"&&typeof a=="string")),so={en:Ft};function Xs(e){let a=e?.trim().replaceAll("_","-").toLowerCase()||"en";return so[a]??so[a.split("-")[0]]??Ft}function $s(e,a){return a?e.replaceAll(/\{\{([A-Za-z0-9_]+)\}\}/g,(r,o)=>{let s=a[o];return s==null?r:String(s)}):e}function te(e,a,r){let o=Xs(e?.locale);return $s(o[a]??Ft[a]??a,r)}var rt=globalThis.__MARINARA_HOST__,Oa=rt&&rt.version===1&&rt.modules?rt.modules["react/jsx-runtime"]:void 0;if(!Oa)throw new Error("Marinara Engine does not provide react/jsx-runtime; this package needs capability API 1.341 or newer.");var He=Oa.Fragment,Fi=Oa.default,t=Oa.jsx,u=Oa.jsxs;var js=200;function lo({name:e,avatarPath:a}){return t("span",{className:"ce-search-option-avatar","aria-hidden":"true",children:a?t("img",{src:a,alt:"",loading:"lazy"}):e.trim().charAt(0)||"?"})}function qa({localization:e,selection:a,onChange:r,allowInherit:o=!1,buttonLabel:s,inheritLabel:d,noneLabel:l}){let i=(A,J)=>te(e,A,J),n=pr(),g=se(null),c=se(null),[p,I]=m(!1),[C,k]=m(""),[y,T]=m([]),[K,X]=m(!1),[q,E]=m(!1),[S,R]=m(null),[F,v]=m(0),P=se(0);W(()=>{if(!p)return;let A=++P.current;X(!0),E(!1),R(null);let J=setTimeout(()=>{to({search:C,limit:50,offset:0}).then(Z=>{P.current===A&&(T(Array.isArray(Z?.items)?Z.items:[]),X(!1))}).catch(Z=>{if(P.current!==A)return;(Z instanceof da?Z.payload:null)?.code==="query_syntax"?R(Z.message):(T([]),E(!0)),X(!1)})},js);return()=>clearTimeout(J)},[p,C]),W(()=>{if(!p)return;let A=J=>{g.current&&J.target instanceof Node&&!g.current.contains(J.target)&&I(!1)};return document.addEventListener("pointerdown",A),()=>document.removeEventListener("pointerdown",A)},[p]);let Q=A=>{r(A),I(!1),k(""),c.current?.focus()},H=[...o?[{key:"inherit",label:d??"",avatarPath:null,selected:a.kind==="inherit",select:()=>Q({kind:"inherit"})}]:[],...l===void 0?[]:[{key:"none",label:l,avatarPath:null,selected:a.kind==="none",select:()=>Q({kind:"none"})}],...y.map(A=>({key:A.id,label:A.name,avatarPath:A.avatarPath,title:A.comment?.trim()||void 0,tags:A.tags,selected:a.kind==="character"&&a.id===A.id,select:()=>Q({kind:"character",id:A.id,name:A.name,avatarPath:A.avatarPath})}))],_=H[Math.min(F,Math.max(H.length-1,0))],re=a.kind==="character"?a.name:a.kind==="inherit"?d??"":l??s,j=A=>{if(A.key==="Escape"){A.stopPropagation(),I(!1),c.current?.focus();return}if(A.key==="ArrowDown"||A.key==="ArrowUp"){if(A.preventDefault(),H.length===0)return;let J=A.key==="ArrowDown"?1:-1;v(Z=>(Math.min(Z,H.length-1)+J+H.length)%H.length);return}A.key==="Enter"&&_&&(A.preventDefault(),_.select())};return u("div",{className:"ce-search-select",ref:g,children:[u("button",{ref:c,type:"button",className:`mari-chrome-field ce-field ce-search-face${a.kind==="character"?"":" ce-search-face--muted"}`,"aria-haspopup":"listbox","aria-expanded":p,"aria-controls":p?n:void 0,onClick:()=>{I(A=>!A),v(0)},children:[t("span",{className:"ce-sr-only",children:`${s}: `}),a.kind==="character"?t(lo,{name:a.name,avatarPath:a.avatarPath}):null,t("span",{className:"ce-search-face-label",children:re}),t(Da,{className:`ce-icon ce-search-chevron${p?" ce-search-chevron--open":""}`,"aria-hidden":"true"})]}),p?u("div",{className:"ce-search-panel",children:[t("input",{type:"search",role:"combobox","aria-autocomplete":"list","aria-expanded":"true","aria-controls":n,"aria-activedescendant":_?`${n}-${_.key}`:void 0,"aria-label":i("cardEditor.dialog.search.placeholder"),className:"mari-chrome-field ce-field",placeholder:i("cardEditor.dialog.search.placeholder"),value:C,autoFocus:!0,onChange:A=>{k(A.target.value),v(0)},onKeyDown:j}),K?t("div",{className:"ce-caption",children:i("cardEditor.dialog.search.loading")}):null,S?t("div",{className:"ce-status ce-status--error",role:"alert",children:i("cardEditor.dialog.search.invalid",{message:S})}):null,q?t("div",{className:"ce-status ce-status--error",role:"alert",children:i("cardEditor.dialog.search.error")}):null,!K&&!q&&!S&&y.length===0?t("div",{className:"ce-caption",children:i("cardEditor.dialog.search.noResults")}):null,t("ul",{className:"ce-search-options",role:"listbox",id:n,"aria-label":s,children:H.map((A,J)=>t("li",{role:"presentation",children:u("button",{type:"button",role:"option",id:`${n}-${A.key}`,"aria-selected":A.selected,className:`ce-search-option${A===_?" ce-search-option--active":""}`,onMouseEnter:()=>v(J),onClick:A.select,children:[A.key==="inherit"||A.key==="none"?null:t(lo,{name:A.label,avatarPath:A.avatarPath}),u("span",{className:"ce-search-option-text",children:[t("span",{className:"ce-search-option-name",children:A.label}),A.title?t("em",{className:"ce-search-option-meta",children:A.title}):null,A.tags?.length?u("span",{className:"ce-search-option-meta",children:[A.tags.slice(0,3).join(" \xB7 "),A.tags.length>3?` +${A.tags.length-3}`:""]}):null]})]})},A.key))})]}):null]})}var io='button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';function we(){try{return typeof window>"u"?void 0:window.localStorage}catch{return}}function no(e,a,r){let o=se(null),s=se(r);s.current=r;let d=se(a);return d.current=a,W(()=>{if(!e)return;let l=document.activeElement instanceof HTMLElement?document.activeElement:null,i=o.current;if(!i)return;let n=requestAnimationFrame(()=>(i.querySelector(io)??i).focus()),g=c=>{if(c.key==="Escape"){if(c.isComposing||c.defaultPrevented||d.current())return;c.preventDefault(),s.current();return}if(c.key!=="Tab")return;let p=[...i.querySelectorAll(io)];if(!i.contains(document.activeElement)){c.preventDefault(),(p[0]??i).focus();return}if(p.length===0){c.preventDefault(),i.focus();return}let I=p[0],C=p.at(-1);c.shiftKey&&document.activeElement===I?(c.preventDefault(),C.focus()):!c.shiftKey&&document.activeElement===C&&(c.preventDefault(),I.focus())};return document.addEventListener("keydown",g),()=>{cancelAnimationFrame(n),document.removeEventListener("keydown",g),requestAnimationFrame(()=>{l?.isConnected&&l.focus()})}},[e]),o}function Ee({className:e,label:a,busy:r=!1,closeOnEscape:o=!0,onClose:s,children:d,...l}){let i=se(s);i.current=s;let n=se(r);return n.current=r,W(()=>{if(!o)return;let g=c=>{c.key!=="Escape"||c.isComposing||c.defaultPrevented||c.target?.closest("input, textarea, select, [contenteditable]")||(c.preventDefault(),n.current||i.current())};return document.addEventListener("keydown",g,!0),()=>document.removeEventListener("keydown",g,!0)},[o]),t("section",{className:`ce-pane ${e}`,"aria-label":a,...l,children:d})}function ua({id:e,label:a,value:r,min:o,max:s,onChange:d}){return u("label",{className:"ce-label",htmlFor:e,children:[t("span",{className:"ce-label-title",children:a}),t("input",{id:e,type:"number",className:"mari-chrome-field ce-field ce-number-input",value:r,min:o,max:s,step:1,inputMode:"numeric",onChange:l=>{if(l.target.value==="")return;let i=Number(l.target.value);Number.isFinite(i)&&d(Math.max(o,Math.min(s,Math.trunc(i))))}})]})}function Pe({name:e,value:a,checked:r,onChange:o,title:s,disabled:d}){return u("label",{className:`ce-choice${d?" ce-choice--disabled":""}`,children:[t("input",{type:"radio",name:e,value:a,checked:r,disabled:d,onChange:()=>o(a)}),t("span",{className:"ce-choice-copy",children:t("strong",{children:s})})]})}function uo({localization:e,targets:a,targetsLoading:r,onUpdateTarget:o,onRemoveTarget:s,onAddTarget:d}){let l=(i,n)=>te(e,i,n);return u("fieldset",{className:"ce-section","data-ce-section":"targets",children:[t("legend",{className:"ce-section-heading",children:l("cardEditor.dialog.targets.title",{count:a.length})}),t(qa,{localization:e,selection:{kind:"none"},onChange:i=>{i.kind==="character"&&d(i)},buttonLabel:l("cardEditor.dialog.targets.add")}),r?t("div",{className:"ce-status",children:l("cardEditor.dialog.targets.loading")}):null,!r&&a.length===0?t("p",{className:"ce-caption",children:l("cardEditor.dialog.targets.empty")}):null,t("ul",{className:"ce-targets",children:a.map((i,n)=>u("li",{className:"ce-target",children:[u("div",{className:"ce-target-identity",children:[t("span",{className:"ce-target-avatar","aria-hidden":"true",children:i.avatarPath?t("img",{src:i.avatarPath,alt:"",loading:"lazy"}):i.name.trim().charAt(0)||"?"}),u("span",{className:"ce-target-name",children:[i.name,i.loadError?u("span",{className:"ce-target-load-error",children:[" ",l("cardEditor.dialog.targets.loadFailed")]}):null]})]}),u("div",{className:"ce-target-controls",children:[t("input",{type:"text",className:"mari-chrome-field ce-field",value:i.note,placeholder:l("cardEditor.dialog.targets.notePlaceholder"),"aria-label":l("cardEditor.dialog.targets.noteLabel",{name:i.name}),...n===0?{"data-ce-autofocus":!0}:{},onChange:g=>o(i.characterId,{note:g.target.value})}),t(qa,{localization:e,selection:i.style,onChange:g=>o(i.characterId,{style:g}),allowInherit:!0,buttonLabel:l("cardEditor.dialog.targets.styleLabel",{name:i.name}),inheritLabel:l("cardEditor.dialog.targets.styleSession"),noneLabel:l("cardEditor.dialog.targets.styleNone")})]}),t("button",{type:"button",className:"ce-target-remove","aria-label":l("cardEditor.dialog.targets.remove",{name:i.name}),onClick:()=>s(i.characterId),children:t(me,{className:"ce-icon","aria-hidden":"true"})})]},i.characterId))})]})}var Ot={standard:`You are the Card Editor. You rewrite existing character cards from the user's instruction while preserving each card's voice, facts, and intent.

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
- Preserve {{char}} and {{user}} macros exactly; never resolve, escape, or rename them.`};function co(e){return e==="standard"||e==="strict"||e==="rebalance"||e==="xml-simple"||e==="xml-complex"}var Ht=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions","backstory","appearance"],fo=/^[A-Za-z_][\w.-]{0,63}$/;var Ks=`<character-name>
    <summary></summary>
    <description></description>
    <personality></personality>
    <backstory></backstory>
    <appearance></appearance>
    <scenario></scenario>
</character-name>`,Js=`<!-- all freeform text unless attributed; attributed elements use the values given, only one unless stated otherwise -->
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
</character-name>`;function mo(e,a,r){let o=ot(r);if(!o.ok)throw new Error(`built-in schema ${e} is invalid: ${o.errors[0]?.message}`);return{id:e,name:a,builtIn:!0,root:o.root}}var Yi=[mo("simple","Simple",Ks),mo("complex","Complex",Js)];function Zs(e){let a=e.split("|").map(o=>o.trim()).filter(Boolean),r=a.length>0&&/^etc\.?$/i.test(a[a.length-1]);return{values:r?a.slice(0,-1):a,open:r}}function ot(e){let a=[],r=p=>e.slice(0,p).split(`
`).length,o=[],s=[],d,l,i=0,n=/<!--([\s\S]*?)-->|<\/\s*([^\s>]+)\s*>|<([^\s/>!]+)((?:\s+[^\s=>]+\s*=\s*"[^"]*")*)\s*(\/?)>|([^<]+)/g,g;for(;g=n.exec(e);){let p=r(g.index),[,I,C,k,y,T,K]=g;if(I!==void 0){let E=I.trim();o.length===0&&s.length===0?l=E:d=E;continue}if(K!==void 0){let E=K.trim();if(!E)continue;let S=o[o.length-1];S?S.hint||(S.hint=E):a.push({line:p,message:"Text outside the root element."});continue}if(C!==void 0){let E=o.pop();E?E.key!==C&&a.push({line:p,message:`Expected </${E.key}> but found </${C}>.`}):a.push({line:p,message:`Closing </${C}> has no opening tag.`});continue}if(k===void 0){a.push({line:p,message:"Unreadable markup."});continue}if(fo.test(k)||a.push({line:p,message:`"${k}" is not a valid element name.`}),o.length>=8&&a.push({line:p,message:"Nesting deeper than 8 levels."}),++i>200){a.push({line:p,message:"More than 200 elements."});break}let X={key:k,attributes:[],children:[]};d&&(X.hint=d),d=void 0;for(let E of(y??"").matchAll(/([^\s=]+)\s*=\s*"([^"]*)"/g)){let[,S,R]=E;if(S==="max"){let F=Number(R);!Number.isInteger(F)||F<=0?a.push({line:p,message:`max on <${k}> must be a positive whole number.`}):X.maxLength=F}else if(S==="target")Ht.includes(R)?X.target=R:a.push({line:p,message:`target="${R}" is not a card field.`});else if(S==="repeat")X.repeat=R==="true";else{fo.test(S)||a.push({line:p,message:`"${S}" is not a valid attribute name.`}),X.attributes.some(P=>P.name===S)&&a.push({line:p,message:`Attribute "${S}" appears twice on <${k}>.`});let{values:F,open:v}=Zs(R);X.attributes.push({name:S,values:F,...v?{open:!0}:{}})}}X.attributes.some(E=>E.name==="text")&&a.push({line:p,message:`"text" is reserved for element text; rename the attribute on <${X.key}>.`});let q=o[o.length-1];q?(q.children.some(E=>E.key===X.key)&&a.push({line:p,message:`<${X.key}> appears twice under <${q.key}>.`}),q.children.push(X)):s.push(X),T||o.push(X)}for(let p of o)a.push({line:r(e.length),message:`<${p.key}> is never closed.`});s.length!==1&&a.length===0&&a.push({line:1,message:s.length===0?"The schema needs one root element.":"Only one root element is allowed."});let c=s[0];if(c){l&&!c.hint&&(c.hint=l);for(let p of c.children)ho(p,!0,a);c.children.length===0&&a.length===0&&a.push({line:1,message:"The root needs at least one element."})}return a.length>0||!c?{ok:!1,errors:a}:{ok:!0,root:c}}function ho(e,a,r){!a&&e.target&&r.push({line:1,message:`target is only allowed on top-level elements (<${e.key}>).`});for(let o of e.children)ho(o,!1,r)}function po(e,a){let r=e.attributes.map(o=>` ${o.name}="${[...o.values,...o.open?["etc."]:[]].join(" | ")}"`);return a&&(e.maxLength&&r.push(` max="${e.maxLength}"`),e.target&&r.push(` target="${e.target}"`),e.repeat&&r.push(' repeat="true"')),r.join("")}function Ut(e,a,r,o){let s="  ".repeat(a),d=a===0&&o?o:e.key,l=e.hint?`${s}<!-- ${e.hint} -->
`:"";if(e.children.length===0)return`${l}${s}<${d}${po(e,r)}></${d}>
`;let i=e.children.map(n=>Ut(n,a+1,r)).join("");return`${l}${s}<${d}${po(e,r)}>
${i}${s}</${d}>
`}function Ha(e){return Ut(e,0,!0).trimEnd()}function go(e){let a=e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null;if(!a)throw new Error("schema must be an object");if(typeof a.id!="string"||!a.id.trim()||a.id.length>160)throw new Error("schema.id is required");if(typeof a.name!="string"||!a.name.trim()||a.name.length>120)throw new Error("schema.name is required");let r=typeof a.text=="string"?a.text:Ha(xo(a.root,0));if(r.length>5e4)throw new Error("schema text must be at most 50000 characters");let o=ot(r);if(!o.ok)throw new Error(`schema is invalid: line ${o.errors[0].line}: ${o.errors[0].message}`);return{id:a.id.trim(),name:a.name.trim(),...a.builtIn===!0?{builtIn:!0}:{},root:o.root}}function xo(e,a){let r=e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null;if(!r||typeof r.key!="string"||a>8)throw new Error("schema.root is invalid");let o=Array.isArray(r.attributes)?r.attributes:[],s=Array.isArray(r.children)?r.children:[];return{key:r.key,...typeof r.hint=="string"&&r.hint?{hint:r.hint.replace(/--/g,"\u2013")}:{},attributes:o.map(d=>{let l=d;if(typeof l?.name!="string")throw new Error("schema attribute is invalid");let i=Array.isArray(l.values)?l.values.filter(n=>typeof n=="string"):[];return{name:l.name,values:i.map(n=>n.replace(/[|"]/g,"")),...l.open===!0?{open:!0}:{}}}),...typeof r.maxLength=="number"?{maxLength:r.maxLength}:{},...typeof r.target=="string"?{target:r.target}:{},...r.repeat===!0?{repeat:!0}:{},children:s.map(d=>xo(d,a+1))}}function Qs(e){return[...new Set(e.root.children.map(a=>a.target??"description"))]}function Lo(e,a){e.maxLength&&a.push(`Text for ${e.key} must not exceed ${e.maxLength} characters.`);for(let r of e.children)Lo(r,a);return a}function Io(e){let a={};for(let o of e.attributes)a[o.name]=o.values.length?`${o.values.join(" | ")}${o.open?" | \u2026":""}`:"";let r;if(e.children.length===0)e.attributes.length===0?r=e.hint??"":r={...a,text:e.hint??""};else{for(let o of e.children)a[o.key]=Io(o);r=a}return e.repeat?[r]:r}function qt(e,a){if(a===0){let s=e.children.map(d=>qt(d,1)).join(`
`);return`# {{character name}}
${e.hint?`<!-- ${e.hint} -->
`:""}
${s}`.trimEnd()}let r=[`${"#".repeat(Math.min(a+1,6))} ${Ys(e.key)}${e.repeat?" (one block per entry)":""}`];e.hint&&r.push(`<!-- ${e.hint} -->`);for(let s of e.attributes)r.push(`- **${s.name}:** ${s.values.length?s.values.join(" | ")+(s.open?" | \u2026":""):"\u2026"}`);e.children.length===0&&r.push("\u2026");let o=e.children.map(s=>qt(s,a+1));return[r.join(`
`),...o].join(`

`)}function Co(e,a){let r=Lo(e.root,[]),o;a==="json-data"||a==="json"?o=JSON.stringify(Io(e.root),null,2):a==="markdown"?o=qt(e.root,0):o=Ut(e.root,0,!1).trimEnd();let s=["Attribute values list the allowed vocabulary; pick one unless stated otherwise. An empty value or a trailing \u2026 means freeform.",...a==="xml"?[`Replace the <${e.root.key}> root tag with the character's name in kebab-case.`]:[],...r];return`${o}

${s.join(`
`)}`}function bo(e){let a=e.hint?{description:e.hint}:{},r;if(e.children.length===0&&e.attributes.length===0)r={type:"string",...a,...e.maxLength?{maxLength:e.maxLength}:{}};else{let o={};for(let s of e.attributes)o[s.name]=s.values.length&&!s.open?{type:"string",enum:s.values}:{type:"string",...s.values.length?{description:`e.g. ${s.values.join(", ")}`}:{}};e.children.length===0&&(o.text={type:"string",...e.maxLength?{maxLength:e.maxLength}:{}});for(let s of e.children)o[s.key]=bo(s);r={type:"object",...a,properties:o,required:Object.keys(o),additionalProperties:!1}}return e.repeat?{type:"array",items:r}:r}function So(e,a){let r=Qs(e),o=a==="document"?{type:"object",properties:Object.fromEntries(r.map(s=>[s,{type:"string"}])),required:r,additionalProperties:!1}:bo({...e.root,repeat:!1});return{type:"object",properties:{results:{type:"array",items:{type:"object",properties:{sourceId:{type:"string"},characters:{type:"array",items:{type:"object",properties:{name:{type:"string"},fields:o},required:["name","fields"],additionalProperties:!1}},splitReason:{type:["string","null"]}},required:["sourceId","characters","splitReason"],additionalProperties:!1}}},required:["results"],additionalProperties:!1}}function Ys(e){let a=e.replace(/[-_.]+/g," ").trim();return a?a[0].toUpperCase()+a.slice(1):e}var el=["markdown","xml","json","schema"];function zt(e,a){return a.reduce((r,o)=>r.children[o],e)}function Ua(e,a,r){if(a.length===0)return r(e)??e;let[o,...s]=a,d=e.children.flatMap((l,i)=>{if(i!==o)return[l];if(s.length>0)return[Ua(l,s,r)];let n=r(l);return n?[n]:[]});return{...e,children:d}}function al(e){return e.attributes.map(a=>`${a.name}=${[...a.values,...a.open?["etc."]:[]].join(" | ")}`).join(`
`)}function tl(e){return e.split(`
`).map(a=>a.trim()).filter(Boolean).map(a=>{let[r="",o=""]=a.split("="),s=o.split("|").map(l=>l.trim().replace(/"/g,"")).filter(Boolean),d=s.length>0&&/^etc\.?$/i.test(s[s.length-1]);return{name:r.trim(),values:d?s.slice(0,-1):s,...d?{open:!0}:{}}})}function rl(){return`user-${globalThis.crypto.randomUUID().slice(0,8)}`}function vo({localization:e,initialSchemaId:a,onClose:r,onSchemasChanged:o}){let s=(h,B)=>te(e,h,B),[d,l]=m(null),[i,n]=m(!1),[g,c]=m(a??"simple"),[p,I]=m(""),[C,k]=m(null),[y,T]=m(""),[K,X]=m([]),[q,E]=m("builder"),[S,R]=m([]),[F,v]=m("xml"),[P,Q]=m(!1),[H,_]=m(!1),[re,j]=m(null),[A,J]=m(!1),Z=h=>{c(h.id),I(h.name),k(h.root),T(Ha(h.root)),X([]),R(h.root.children.length>0?[0]:[]),Q(!1),J(!1),j(null)};W(()=>{let h=new AbortController;return xa(h.signal).then(B=>{l(B);let D=B.find(O=>O.id===a)??B[0];D&&Z(D)}).catch(()=>n(!0)),()=>h.abort()},[]);let M=d?.find(h=>h.id===g)??null,N=M?.builtIn===!0,Y=K.length===0,ge=C?{id:g,name:p||g,root:C}:null,xe=ge?F==="schema"?JSON.stringify(So(ge,"structured"),null,2):Co(ge,F):"",ke=h=>{k(h),T(Ha(h)),Q(!0)},he=h=>{C&&ke(Ua(C,S,h))},Me=h=>{T(h),Q(!0);let B=ot(h);B.ok?(k(B.root),X([])):X(B.errors)},Ae=h=>{if(!C)return;let B=zt(C,h),D="new-element";for(let O=2;B.children.some(ee=>ee.key===D);O++)D=`new-element-${O}`;ke(Ua(C,h,O=>({...O,children:[...O.children,{key:D,attributes:[],children:[]}]}))),R([...h,B.children.length])},ce=(h,B)=>{if(!C||h.length===0)return;let D=h.slice(0,-1),O=h[h.length-1],ee=O+B,le=zt(C,D);ee<0||ee>=le.children.length||(ke(Ua(C,D,Le=>{let ye=[...Le.children];return[ye[O],ye[ee]]=[ye[ee],ye[O]],{...Le,children:ye}})),R([...D,ee]))},Se=h=>{!C||h.length===0||(ke(Ua(C,h,()=>null)),R(h.slice(0,-1)))},Re=async h=>{if(!(!C||!Y||H)){_(!0),j(null);try{let B=h||N?rl():g,D=(h||N?s("cardEditor.schemas.copyName",{name:p}):p).trim()||B,O=await Hr({id:B,name:D.slice(0,120),text:Ha(C)}),ee=await xa();l(ee),Z(ee.find(le=>le.id===O.id)??O),o(ee,O.id)}catch(B){j(B instanceof Error?B.message:String(B))}finally{_(!1)}}},L=async()=>{if(!(!M||N||H)){_(!0);try{await Ur(M.id);let h=await xa();l(h),h[0]&&Z(h[0]),o(h,h[0]?.id??"simple")}catch(h){j(h instanceof Error?h.message:String(h))}finally{_(!1)}}},w=C?zt(C,S):null,b=S.length===1,V=(h,B,D)=>{let O=B.join(".")===S.join("."),ee=h.target??(D===1?"description":null);return u("li",{className:"ce-schema-node",style:{"--ce-depth":Math.min(D,4)},children:[u("button",{type:"button",className:`ce-schema-node-head${O?" ce-schema-node-head--selected":""}`,"aria-pressed":O,onClick:()=>R(B),children:[t("code",{className:"ce-schema-key",children:`<${h.key}>`}),h.children.length>0?t("span",{className:"ce-chip",children:s("cardEditor.schemas.kindGroup")}):h.attributes.some(le=>le.values.length>0)?t("span",{className:"ce-chip",children:s("cardEditor.schemas.kindVocab")}):null,h.repeat?t("span",{className:"ce-chip",children:s("cardEditor.schemas.kindRepeat")}):null,h.maxLength?t("span",{className:"ce-chip",children:s("cardEditor.schemas.maxChip",{max:h.maxLength})}):null,ee?t("span",{className:"ce-chip ce-chip--ok",children:s("cardEditor.schemas.targetChip",{field:ee})}):null,h.hint?t("span",{className:"ce-schema-hint",children:h.hint}):null]}),h.children.length>0?t("ul",{className:"ce-schema-tree",children:h.children.map((le,Le)=>V(le,[...B,Le],D+1))}):null]},B.join(".")||"root")};return u(Ee,{className:"ce-studio",label:s("cardEditor.schemas.title"),busy:H,closeOnEscape:!0,onClose:r,children:[u("div",{className:"ce-dialog-head",children:[t("strong",{children:s("cardEditor.schemas.title")}),t("button",{type:"button",className:"ce-dialog-close",onClick:r,disabled:H,"aria-label":s("cardEditor.schemas.close"),children:t(me,{className:"ce-icon","aria-hidden":"true"})})]}),i?t("div",{className:"ce-status ce-status--error",role:"alert",children:s("cardEditor.schemas.loadError")}):null,u("div",{className:"ce-studio-body",children:[t("nav",{className:"ce-studio-list","aria-label":s("cardEditor.schemas.listLabel"),children:(d??[]).map(h=>u("button",{type:"button",className:"ce-studio-list-item","aria-pressed":h.id===g,onClick:()=>Z(h),children:[t("strong",{children:h.name}),t("small",{children:h.builtIn?s("cardEditor.schemas.builtIn"):s("cardEditor.schemas.yours")})]},h.id))}),u("div",{className:"ce-studio-edit",children:[u("div",{className:"ce-studio-bar",children:[u("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.schemas.modeLabel"),children:[t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":q==="builder",disabled:!Y,onClick:()=>E("builder"),children:s("cardEditor.schemas.modeBuilder")}),t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":q==="text",onClick:()=>E("text"),children:s("cardEditor.schemas.modeText")})]}),t("span",{className:`ce-caption${Y?"":" ce-item-failure"}`,role:"status",children:Y?s("cardEditor.schemas.valid"):s("cardEditor.schemas.invalid",{line:K[0].line,message:K[0].message})})]}),q==="text"?t("textarea",{className:"mari-chrome-field ce-field ce-studio-text",value:y,spellCheck:!1,"aria-label":s("cardEditor.schemas.textLabel"),onChange:h=>Me(h.target.value)}):C?u(He,{children:[t("div",{className:"ce-studio-tree",children:t("ul",{className:"ce-schema-tree",children:V(C,[],0)})}),w?u("div",{className:"ce-studio-inspector",children:[u("label",{className:"ce-label",htmlFor:"ce-node-key",children:[t("span",{className:"ce-label-title",children:s("cardEditor.schemas.nodeKey")}),t("input",{id:"ce-node-key",className:"mari-chrome-field ce-field",value:w.key,onChange:h=>he(B=>({...B,key:h.target.value.replace(/[^\w.-]/g,"-")||"element"}))})]}),u("label",{className:"ce-label",htmlFor:"ce-node-target",children:[t("span",{className:"ce-label-title",children:s("cardEditor.schemas.nodeTarget")}),u("select",{id:"ce-node-target",className:"mari-chrome-field ce-field",value:w.target??"",disabled:!b,onChange:h=>he(B=>{let{target:D,...O}=B;return h.target.value?{...O,target:h.target.value}:O}),children:[t("option",{value:"",children:s(b?"cardEditor.schemas.targetDefault":"cardEditor.schemas.targetInherit")}),Ht.filter(h=>h!=="description").map(h=>t("option",{value:h,children:h},h))]})]}),u("label",{className:"ce-label ce-studio-wide",htmlFor:"ce-node-hint",children:[t("span",{className:"ce-label-title",children:s("cardEditor.schemas.nodeHint")}),t("input",{id:"ce-node-hint",className:"mari-chrome-field ce-field",value:w.hint??"",placeholder:s("cardEditor.schemas.nodeHintPlaceholder"),onChange:h=>he(B=>{let{hint:D,...O}=B,ee=h.target.value.replace(/--/g,"\u2013");return ee?{...O,hint:ee}:O})})]}),u("label",{className:"ce-label ce-studio-wide",htmlFor:"ce-node-attributes",children:[t("span",{className:"ce-label-title",children:s("cardEditor.schemas.nodeAttributes")}),t("textarea",{id:"ce-node-attributes",className:"mari-chrome-field ce-field ce-textarea",rows:2,spellCheck:!1,defaultValue:al(w),onBlur:h=>he(B=>({...B,attributes:tl(h.target.value)}))},`${S.join(".")}:${g}`),t("small",{children:s("cardEditor.schemas.nodeAttributesHint")})]}),u("label",{className:"ce-label",htmlFor:"ce-node-max",children:[t("span",{className:"ce-label-title",children:s("cardEditor.schemas.nodeMax")}),t("input",{id:"ce-node-max",type:"number",min:0,className:"mari-chrome-field ce-field ce-number-input",value:w.maxLength??"",disabled:w.children.length>0,placeholder:s("cardEditor.schemas.nodeMaxNone"),onChange:h=>he(B=>{let{maxLength:D,...O}=B,ee=Math.trunc(Number(h.target.value));return ee>0?{...O,maxLength:ee}:O})})]}),u("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:w.repeat===!0,disabled:S.length===0,onChange:h=>he(B=>{let{repeat:D,...O}=B;return h.target.checked?{...O,repeat:!0}:O})}),t("span",{className:"ce-choice-copy",children:t("strong",{children:s("cardEditor.schemas.nodeRepeat")})})]}),u("div",{className:"ce-studio-node-actions ce-studio-wide",children:[u("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>Ae(S),children:[t(la,{className:"ce-icon","aria-hidden":"true"}),s("cardEditor.schemas.addChild")]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:S.length===0,"aria-label":s("cardEditor.schemas.moveUp"),onClick:()=>ce(S,-1),children:t(sa,{className:"ce-icon","aria-hidden":"true"})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:S.length===0,"aria-label":s("cardEditor.schemas.moveDown"),onClick:()=>ce(S,1),children:t(oa,{className:"ce-icon","aria-hidden":"true"})}),u("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:S.length===0,onClick:()=>Se(S),children:[t(Ze,{className:"ce-icon","aria-hidden":"true"}),s("cardEditor.schemas.removeNode")]})]})]}):null]}):null]}),u("div",{className:"ce-studio-preview",children:[t("div",{className:"ce-studio-bar",children:t("div",{className:"ce-segmented",role:"radiogroup","aria-label":s("cardEditor.schemas.previewLabel"),children:el.map(h=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":F===h,onClick:()=>v(h),children:s(`cardEditor.schemas.preview.${h}`)},h))})}),t("pre",{className:"ce-studio-pre",tabIndex:0,"aria-label":s("cardEditor.schemas.previewLabel"),children:xe}),t("p",{className:"ce-caption",children:s(`cardEditor.schemas.previewHint.${F}`)})]})]}),u("div",{className:"ce-dialog-foot",children:[re?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:re}):null,u("label",{className:"ce-label ce-studio-name",htmlFor:"ce-schema-name",children:[t("span",{className:"ce-sr-only",children:s("cardEditor.schemas.name")}),t("input",{id:"ce-schema-name",className:"mari-chrome-field ce-field",value:p,disabled:N,placeholder:s("cardEditor.schemas.name"),onChange:h=>{I(h.target.value),Q(!0)}})]}),!N&&M?A?u("span",{className:"ce-confirm-strip",role:"group","aria-label":s("cardEditor.schemas.delete"),children:[t("span",{className:"ce-caption",children:s("cardEditor.schemas.deleteConfirm",{name:M.name})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:H,onClick:()=>{L()},children:s("cardEditor.schemas.deleteYes")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>J(!1),children:s("cardEditor.schemas.deleteNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:H,onClick:()=>J(!0),children:s("cardEditor.schemas.delete")}):null,t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:H||!Y||!C,onClick:()=>{Re(!0)},children:s("cardEditor.schemas.duplicate")}),N?null:t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:H||!Y||!C||!P,onClick:()=>{Re(!1)},children:s("cardEditor.schemas.save")})]})]})}var ol=["description","personality","scenario","first_mes","mes_example","creator_notes","system_prompt","post_history_instructions","backstory","appearance"],ue=class extends Error{constructor(a){super(a),this.name="SchemaError"}};var cn=new Set(ol);function lt(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:null}function ca(e,a,r,o){if(e===void 0)return a;if(typeof e=="string"&&r.includes(e))return e;throw new ue(`${o} is invalid`)}function wo(e,a,r){if(e===void 0)return a;if(typeof e=="string")return e;throw new ue(`${r} must be a string`)}function za(e,a,r){if(e===void 0)return;if(typeof e!="string")throw new ue(`${a} must be a string`);if(e.length>300)throw new ue(`${a} must be at most 300 characters`);let o=r?e:e.trim();if(!o.trim())throw new ue(`${a} must not be blank`);return o}function ko(e,a){if(e==null)return null;if(typeof e=="string")return e;throw new ue(`${a} must be a string or null`)}function st(e,a,r,o,s){if(e===void 0)return a;if(typeof e!="number"||!Number.isFinite(e))throw new ue(`${s} must be a finite number`);return Math.max(r,Math.min(o,Math.trunc(e)))}var sl=["markdown","xml","json"];function yo(e,a){let r=lt(e);if(!r)throw new ue(`${a} must be an object`);let o;try{o=go(r.schema)}catch(s){throw new ue(`${a}.schema: ${s instanceof Error?s.message:String(s)}`)}return{schema:o,format:ca(r.format,"xml",sl,`${a}.format`)}}function ll(e){let a=lt(e);if(!a)throw new ue("transform settings are required for the transform task");let r=yo(a,"transform"),o;if(a.phase2!==void 0){let s=lt(a.phase2);if(!s)throw new ue("transform.phase2 must be an object");if(s.enabled!==void 0&&typeof s.enabled!="boolean")throw new ue("transform.phase2.enabled must be a boolean");if(s.allowSplits!==void 0&&typeof s.allowSplits!="boolean")throw new ue("transform.phase2.allowSplits must be a boolean");o={enabled:s.enabled===!0,instruction:wo(s.instruction,"","transform.phase2.instruction"),allowSplits:s.allowSplits===!0,...s.override===void 0||s.override===null?{}:{override:yo(s.override,"transform.phase2.override")}}}if(a.structuredOutput!==void 0&&typeof a.structuredOutput!="boolean")throw new ue("transform.structuredOutput must be a boolean");return{...r,outputMode:ca(a.outputMode,"structured",["structured","document"],"transform.outputMode"),multiCharacter:ca(a.multiCharacter,"split",["split","merge"],"transform.multiCharacter"),structuredOutput:a.structuredOutput!==!1,...o===void 0?{}:{phase2:o}}}function dt(e){let a=lt(e);if(!a)throw new ue("session config must be an object");if(a.globalLorebookIds!==void 0&&!Array.isArray(a.globalLorebookIds))throw new ue("globalLorebookIds must be an array of strings");let r=a.globalLorebookIds??[];if(!r.every(p=>typeof p=="string"))throw new ue("globalLorebookIds must be an array of strings");if(a.rebalance!==void 0&&typeof a.rebalance!="boolean")throw new ue("rebalance must be a boolean");if(a.customTemplate!==void 0&&typeof a.customTemplate!="string")throw new ue("customTemplate must be a string");let o=za(a.duplicatePrefix,"duplicatePrefix",!0),s=za(a.duplicateSuffix,"duplicateSuffix",!0),d=za(a.duplicateRemovePrefix,"duplicateRemovePrefix",!0),l=za(a.duplicateRemoveSuffix,"duplicateRemoveSuffix",!0),i=za(a.combinedCardName,"combinedCardName",!1),n=ca(a.saveMode,"confirm",["confirm","auto","duplicate","combined"],"saveMode");if(n==="combined"&&i===void 0)throw new ue("combinedCardName is required when saveMode is combined");let g=ca(a.presetId,"standard",["standard","strict","rebalance","xml-simple","xml-complex","custom","transform"],"presetId"),c=g==="transform"?ll(a.transform):void 0;return{mode:ca(a.mode,"individual",["individual","batched"],"mode"),batchSize:st(a.batchSize,4,1,16,"batchSize"),connectionId:ko(a.connectionId,"connectionId"),presetId:g,...a.customTemplate===void 0?{}:{customTemplate:a.customTemplate},...c===void 0?{}:{transform:c},globalInstruction:wo(a.globalInstruction,"","globalInstruction"),behaviorCharacterId:ko(a.behaviorCharacterId,"behaviorCharacterId"),globalLorebookIds:[...r],rebalance:a.rebalance??!1,providerRetries:st(a.providerRetries,2,0,5,"providerRetries"),refusalRetries:st(a.refusalRetries,3,0,5,"refusalRetries"),concurrency:st(a.concurrency,1,1,16,"concurrency"),saveMode:n,completionMode:ca(a.completionMode,"ask",["ask","apply","duplicate"],"completionMode"),...o===void 0?{}:{duplicatePrefix:o},...s===void 0?{}:{duplicateSuffix:s},...d===void 0?{}:{duplicateRemovePrefix:d},...l===void 0?{}:{duplicateRemoveSuffix:l},...i===void 0?{}:{combinedCardName:i}}}var Eo="cardEditor.bulkConfig";function Po(e){if(!e)return null;let a=null;try{a=e.getItem(Eo)}catch{return null}if(!a)return null;try{return dt(JSON.parse(a))}catch{return null}}function Ao(e,a){if(a)try{a.setItem(Eo,JSON.stringify(e))}catch{}}var it="cardEditor.bulkDraft",Gt="cardEditor.bulkPresets";function We(e){return e&&typeof e=="object"&&!Array.isArray(e)?e:null}function Ro(e,a){let r=We(e);return r?.kind==="inherit"||r?.kind==="none"?{kind:r.kind}:r?.kind==="character"&&typeof r.id=="string"&&typeof r.name=="string"?{kind:"character",id:r.id,name:r.name,avatarPath:typeof r.avatarPath=="string"?r.avatarPath:null}:a}function To(e,a){let r=We(a);if(!r)return e;let o={...e};for(let[s,d]of Object.entries(e)){let l=r[s];l!==void 0&&(Array.isArray(d)?Array.isArray(l)&&l.every(i=>typeof i=="string")&&(o[s]=l):d===null?(l===null||typeof l=="string")&&(o[s]=l):typeof l==typeof d&&(typeof d!="object"||We(l))&&(o[s]=typeof d=="object"?To(d,l):l))}return o}function Bo(e,a){return{...To(a,e),behavior:Ro(We(e)?.behavior,a.behavior)}}function Vt(e,a){try{let r=e?.getItem(a);return r?JSON.parse(r):null}catch{return null}}function _t(e,a,r){try{e?.setItem(a,JSON.stringify(r))}catch{}}function Mo(e){let a={};for(let[s,d]of Object.entries(We(e.targets)??{})){let l=We(d);l&&(a[s]={note:typeof l.note=="string"?l.note:"",style:Ro(l.style,{kind:"inherit"})})}let r=Array.isArray(e.ids)?e.ids.filter(s=>typeof s=="string"):[];return{ids:[...new Set([...r.filter(s=>Object.prototype.hasOwnProperty.call(a,s)),...Object.keys(a)])],targets:a}}function Do(e){let a=We(Vt(e,it));return a?Mo(a):null}function No(e,a){let r=We(Vt(e,it));return r?{form:Bo(r.form,a),...Mo(r)}:null}function Fo(e,a){return[...new Set([...a?.ids??[],...e])].map(r=>({characterId:r,...a?.targets[r]??{note:"",style:{kind:"inherit"}}}))}function Oo(e,a){_t(a,it,e)}function Wt(e){try{e?.removeItem(it)}catch{}}function qo(e,a){let r=Vt(e,Gt);return Array.isArray(r)?r.flatMap(o=>{let s=We(o);return typeof s?.name=="string"&&s.name.trim()?[{name:s.name,form:Bo(s.form,a)}]:[]}):[]}function Ho(e,a,r){let o=[...e.filter(s=>s.name!==a.name),a].sort((s,d)=>s.name.localeCompare(d.name));return _t(r,Gt,o),o}function Uo(e,a,r){let o=e.filter(s=>s.name!==a);return _t(r,Gt,o),o}function zo(e,a){let r=Number.isFinite(e)?Math.max(0,Math.trunc(e)):0,o=Number.isFinite(a)?Math.max(1,Math.min(16,Math.trunc(a))):4;return{batched:r===0?0:Math.ceil(r/o),individual:r}}var dl={schemaId:"simple",format:"xml",outputMode:"structured",multiCharacter:"split",phase2Enabled:!1,phase2Instruction:"",phase2AllowSplits:!1,phase2SchemaId:null,phase2Format:null},Go=["markdown","xml","json"];function Vo(e){return e?{schemaId:e.schema.id,format:e.format,outputMode:e.outputMode,multiCharacter:e.multiCharacter,phase2Enabled:e.phase2?.enabled===!0,phase2Instruction:e.phase2?.instruction??"",phase2AllowSplits:e.phase2?.allowSplits===!0,phase2SchemaId:e.phase2?.override?.schema.id??null,phase2Format:e.phase2?.override?.format??null}:{...dl}}function _o(e,a,r){let o=a.find(l=>l.id===e.schemaId)??a[0];if(!o)return null;let s=e.phase2SchemaId?a.find(l=>l.id===e.phase2SchemaId):void 0,d=e.phase2SchemaId||e.phase2Format?{schema:s??o,format:e.phase2Format??e.format}:void 0;return{schema:o,format:e.format,outputMode:e.outputMode,multiCharacter:e.multiCharacter,structuredOutput:r,...e.phase2Enabled?{phase2:{enabled:!0,instruction:e.phase2Instruction,allowSplits:e.phase2AllowSplits,...d?{override:d}:{}}}:{}}}function Wo({localization:e,draft:a,schemas:r,schemasError:o,agentStructuredOutput:s,onChange:d,onEditSchemas:l}){let i=(c,p)=>te(e,c,p),n=(r??[]).map(c=>t("option",{value:c.id,children:c.builtIn?i("cardEditor.transform.schemaBuiltIn",{name:c.name}):c.name},c.id)),g=c=>i(`cardEditor.transform.format.${c}`);return u("fieldset",{className:"ce-section","data-ce-section":"transform",children:[t("legend",{className:"ce-section-heading",children:i("cardEditor.transform.title")}),u("div",{className:"ce-transform-row",children:[u("label",{className:"ce-label",htmlFor:"ce-transform-schema",children:[t("span",{className:"ce-label-title",children:i("cardEditor.transform.schema")}),u("span",{className:"ce-inline-controls",children:[t("select",{id:"ce-transform-schema",className:"mari-chrome-field ce-field",value:a.schemaId,disabled:!r,onChange:c=>d({schemaId:c.target.value}),children:n}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:l,children:i("cardEditor.transform.editSchemas")})]})]}),u("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:i("cardEditor.transform.formatLabel")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":i("cardEditor.transform.formatLabel"),children:Go.map(c=>t("button",{type:"button",role:"radio","aria-checked":a.format===c,className:"ce-segment",onClick:()=>d({format:c}),children:g(c)},c))})]})]}),o?t("div",{className:"ce-status ce-status--error",role:"alert",children:i("cardEditor.transform.schemasError")}):null,u("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:i("cardEditor.transform.multiTitle")}),u("div",{className:"ce-choice-list",children:[t(Pe,{name:"ce-multi",value:"merge",checked:a.multiCharacter==="merge",onChange:()=>d({multiCharacter:"merge"}),title:i("cardEditor.transform.multiMerge")}),t(Pe,{name:"ce-multi",value:"split",checked:a.multiCharacter==="split",onChange:()=>d({multiCharacter:"split"}),title:i("cardEditor.transform.multiSplit")})]}),t("small",{children:a.multiCharacter==="split"?i("cardEditor.transform.multiSplitHint"):i("cardEditor.transform.multiMergeHint")})]}),u("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:i("cardEditor.transform.outputModeTitle")}),u("div",{className:"ce-choice-list",children:[t(Pe,{name:"ce-output-mode",value:"structured",checked:a.outputMode==="structured",onChange:()=>d({outputMode:"structured"}),title:i("cardEditor.transform.outputStructured")}),t(Pe,{name:"ce-output-mode",value:"document",checked:a.outputMode==="document",onChange:()=>d({outputMode:"document"}),title:i("cardEditor.transform.outputDocument")})]}),t("small",{children:a.outputMode==="structured"?i("cardEditor.transform.outputStructuredHint",{format:g(a.format)}):i("cardEditor.transform.outputDocumentHint")})]}),t("p",{className:"ce-caption",role:"status",children:i(s===null?"cardEditor.transform.providerJsonUnknown":s?"cardEditor.transform.providerJsonOn":"cardEditor.transform.providerJsonOff")}),u("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:a.phase2Enabled,onChange:c=>d({phase2Enabled:c.target.checked})}),u("span",{className:"ce-choice-copy",children:[t("strong",{children:i("cardEditor.transform.phase2")}),t("small",{children:i("cardEditor.transform.phase2Hint")})]})]}),a.phase2Enabled?u("div",{className:"ce-phase2-box",children:[u("label",{className:"ce-label",htmlFor:"ce-phase2-instruction",children:[t("span",{className:"ce-label-title",children:i("cardEditor.transform.phase2Instruction")}),t("textarea",{id:"ce-phase2-instruction",className:"mari-chrome-field ce-field ce-textarea",value:a.phase2Instruction,placeholder:i("cardEditor.transform.phase2InstructionPlaceholder"),onChange:c=>d({phase2Instruction:c.target.value})})]}),u("div",{className:"ce-transform-row",children:[u("label",{className:"ce-label",htmlFor:"ce-phase2-schema",children:[t("span",{className:"ce-label-title",children:i("cardEditor.transform.phase2Schema")}),u("select",{id:"ce-phase2-schema",className:"mari-chrome-field ce-field",value:a.phase2SchemaId??"",onChange:c=>d({phase2SchemaId:c.target.value||null}),children:[t("option",{value:"",children:i("cardEditor.transform.sameAsPhase1")}),n]})]}),u("label",{className:"ce-label",htmlFor:"ce-phase2-format",children:[t("span",{className:"ce-label-title",children:i("cardEditor.transform.formatLabel")}),u("select",{id:"ce-phase2-format",className:"mari-chrome-field ce-field",value:a.phase2Format??"",onChange:c=>d({phase2Format:c.target.value||null}),children:[t("option",{value:"",children:i("cardEditor.transform.sameAsPhase1")}),Go.map(c=>t("option",{value:c,children:g(c)},c))]})]})]}),u("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:a.phase2AllowSplits,disabled:a.multiCharacter!=="split",onChange:c=>d({phase2AllowSplits:c.target.checked})}),t("span",{className:"ce-choice-copy",children:t("strong",{children:i("cardEditor.transform.phase2AllowSplits")})})]})]}):null]})}var il={standard:"cardEditor.dialog.model.presetStandard",strict:"cardEditor.dialog.model.presetStrict",rebalance:"cardEditor.dialog.model.presetRebalance","xml-simple":"cardEditor.dialog.model.presetXmlSimple","xml-complex":"cardEditor.dialog.model.presetXmlComplex",custom:"cardEditor.dialog.model.presetCustom",transform:"cardEditor.dialog.model.presetTransform"};function Xo({localization:e,characterIds:a,prefill:r,rerun:o,onClose:s,onDispatched:d}){let l=(f,G)=>te(e,f,G),[i,n]=m([]),[g,c]=m(!0),[p,I]=m(null),[C,k]=m(!1),[y,T]=m(null),[K,X]=m(!1),[q,E]=m(""),[S]=m(()=>o?.config??Po(we())),[R]=m(()=>({mode:S?.mode??"individual",batchSize:S?.batchSize??4,connectionId:S?.connectionId??null,presetId:r?.presetId??S?.presetId??"standard",customTemplate:S?.customTemplate??"",globalInstruction:r?.globalInstruction??S?.globalInstruction??"",behavior:{kind:"none"},globalLorebookIds:S?.globalLorebookIds??[],rebalance:S?.rebalance??!1,providerRetries:S?.providerRetries??2,refusalRetries:S?.refusalRetries??3,concurrency:S?.concurrency??1,completionMode:S?.completionMode??"ask",saveMode:r?.saveMode??S?.saveMode??"confirm",duplicatePrefix:r?.duplicatePrefix??S?.duplicatePrefix??"",duplicateSuffix:S?.duplicateSuffix??" (Edited)",duplicateRemovePrefix:S?.duplicateRemovePrefix??"",duplicateRemoveSuffix:S?.duplicateRemoveSuffix??"",combinedCardName:r?.combinedCardName??(r?.label?`${r.label} \u2014 Cast`:S?.combinedCardName??""),transformDraft:{...Vo(S?.transform),...r?.schemaId?{schemaId:r.schemaId}:{},...r?.format?{format:r.format}:{}}})),[F,v]=m(()=>o?null:No(we(),R)),[P]=m(()=>F?.form??R),[Q,H]=m(P.mode),[_,re]=m(P.batchSize),[j,A]=m(P.connectionId),[J,Z]=m(P.presetId),[M,N]=m(P.customTemplate),[Y,ge]=m(P.globalInstruction),[xe,ke]=m(P.behavior),[he,Me]=m(P.globalLorebookIds),[Ae,ce]=m(P.rebalance),[Se,Re]=m(P.providerRetries),[L,w]=m(P.refusalRetries),[b,V]=m(P.concurrency),[h,B]=m(P.completionMode),[D,O]=m(P.saveMode),[ee,le]=m(P.duplicatePrefix),[Le,ye]=m(P.duplicateSuffix),[De,va]=m(P.duplicateRemovePrefix),[ve,ka]=m(P.duplicateRemoveSuffix),[Xe,ya]=m(P.combinedCardName),[ze,Te]=m(P.transformDraft),[wa,Ea]=m(()=>qo(we(),R)),[$e,Be]=m(""),Ie=se(F!==null),je=se(!1),[Ge,ae]=m(null),[Pa,Ye]=m(!1),[Wa,Aa]=m(null),[ma,Xa]=m(!1),[ea,x]=m(!1),[z,$]=m(null),[pe,Ne]=m(null),de=J==="transform";W(()=>{if(!de||Ge!==null)return;let f=new AbortController;return xa(f.signal).then(G=>{ae(G),Te(oe=>G.some(Ce=>Ce.id===oe.schemaId)?oe:{...oe,schemaId:G[0]?.id??"simple"})}).catch(()=>Ye(!0)),zr(f.signal).then(G=>Aa(G.structuredOutput)).catch(()=>{}),()=>f.abort()},[de,Ge]);let[Fe]=m(()=>Fo(a,o?.targets??F));W(()=>{let f=!1,G=new AbortController;c(!0);let oe=Fe.map(({characterId:Ce})=>_e(Ce,G.signal));return Promise.allSettled(oe).then(Ce=>{f||(n(Ce.map((ta,yt)=>{let{characterId:Ra,...ie}=Fe[yt];return ta.status==="fulfilled"?{characterId:Ra,name:ta.value.name,avatarPath:ta.value.avatarPath,card:ta.value.fields,...ie,loadError:!1}:{characterId:Ra,name:Ra,avatarPath:null,card:null,...ie,loadError:!0}})),c(!1))}),()=>{f=!0,G.abort()}},[Fe]),W(()=>{let f=new AbortController;return Zr(f.signal).then(G=>I(G)).catch(()=>k(!0)),()=>f.abort()},[]),W(()=>{let f=new AbortController;return ro(f.signal).then(G=>T(G)).catch(()=>X(!0)),()=>f.abort()},[]),W(()=>{let f=S?.behaviorCharacterId;if(!f||Ie.current)return;let G=!1;return et(f).then(oe=>{G||ke({kind:"character",id:oe.id,name:oe.name,avatarPath:oe.avatarPath})}).catch(()=>{}),()=>{G=!0}},[S]);let It=f=>{f==="custom"&&J!=="custom"&&(!M.trim()||Object.values(Ot).includes(M))&&co(J)&&N(Ot[J]),Z(f)},Ct=(f,G)=>n(oe=>oe.map(Ce=>Ce.characterId===f?{...Ce,...G}:Ce)),Ps=(f,G)=>{Ie.current=!0,Ct(f,G)},As=f=>{Ie.current=!0,n(G=>G.filter(oe=>oe.characterId!==f))},Rs=f=>{if(Ie.current=!0,i.some(oe=>oe.characterId===f.id))return;let G={characterId:f.id,name:f.name,avatarPath:f.avatarPath??null,card:null,note:"",style:{kind:"inherit"},loadError:!1};n(oe=>[...oe,G]),_e(f.id).then(oe=>Ct(f.id,{name:oe.name,avatarPath:oe.avatarPath,card:oe.fields})).catch(()=>Ct(f.id,{loadError:!0}))},bt=(y??[]).filter(f=>!q.trim()||f.name.toLocaleLowerCase().includes(q.trim().toLocaleLowerCase())),ar=zo(i.length,_),St=i.some(f=>f.loadError),tr=i.some(f=>!f.loadError&&!f.card),vt=D==="combined"&&Xe.trim().length===0,rr=de&&(Ge===null||Ge.length===0),Ts=tt(i[0]?.name??"Character",{prefix:ee,suffix:Le,removePrefix:De,removeSuffix:ve});W(()=>{let f=!1;return Za().then(G=>{f||Ne(G)}).catch(()=>{}),()=>{f=!0}},[]);let Ve=pe?.disableAutoVerdicts===!0;W(()=>{Ve&&(O(f=>f==="auto"?"confirm":f),B(f=>f==="ask"?f:"ask"))},[Ve]);let kt=(p?.find(f=>f.id===j)??p?.find(f=>f.defaultForAgents)??p?.find(f=>f.isDefault)??null)?.maxParallelJobs,or=typeof kt=="number"&&Number.isFinite(kt)?Math.min(16,Math.max(1,Math.trunc(kt))):4,sr=pe?.maxParallelAgents??null,pa=sr===null?or:Math.min(or,sr);W(()=>{V(f=>Math.min(f,pa))},[pa]);let lr=F!==null||S?.concurrency!==void 0,dr=se(!1);W(()=>{lr||dr.current||p===null&&!C||(dr.current=!0,V(pa))},[lr,p,C,pa]);let ir={mode:Q,batchSize:_,connectionId:j,presetId:J,customTemplate:M,globalInstruction:Y,behavior:xe,globalLorebookIds:he,rebalance:Ae,providerRetries:Se,refusalRetries:L,concurrency:b,completionMode:h,saveMode:D,duplicatePrefix:ee,duplicateSuffix:Le,duplicateRemovePrefix:De,duplicateRemoveSuffix:ve,combinedCardName:Xe,transformDraft:ze},nr=JSON.stringify({form:ir,ids:i.map(f=>f.characterId),targets:Object.fromEntries(i.map(f=>[f.characterId,{note:f.note,style:f.style}]))});W(()=>{o||!Ie.current||je.current||g||Oo(JSON.parse(nr),we())},[nr,g,o]);let ur=f=>{Ie.current=!0,H(f.mode),re(f.batchSize),A(f.connectionId),Z(f.presetId),N(f.customTemplate),ge(f.globalInstruction),ke(f.behavior),Me(f.globalLorebookIds),ce(f.rebalance),Re(f.providerRetries),w(f.refusalRetries),V(Math.min(f.concurrency,pa)),B(Ve?"ask":f.completionMode),O(Ve&&f.saveMode==="auto"?"confirm":f.saveMode),le(f.duplicatePrefix),ye(f.duplicateSuffix),va(f.duplicateRemovePrefix),ka(f.duplicateRemoveSuffix),ya(f.combinedCardName),Te(f.transformDraft)},Bs=()=>{ur(R),n(f=>f.filter(G=>a.includes(G.characterId)).map(G=>({...G,note:"",style:{kind:"inherit"}}))),Ie.current=!1,Wt(we()),v(null)},Ms=()=>{let f=$e.trim();f&&Ea(G=>Ho(G,{name:f,form:ir},we()))},aa=wa.find(f=>f.name===$e.trim()),Ds=async()=>{if(ea||i.length===0||St||tr||vt||rr)return;x(!0),$(null);let f=dt({...de?{transform:_o(ze,Ge??[],Wa!==!1)}:{},mode:Q,batchSize:_,connectionId:j,presetId:J,...J==="custom"?{customTemplate:M}:{},globalInstruction:Y,behaviorCharacterId:xe.kind==="character"?xe.id:null,globalLorebookIds:he,rebalance:Ae,providerRetries:Se,refusalRetries:L,concurrency:b,saveMode:D,completionMode:h,...ee.trim()?{duplicatePrefix:ee}:{},...Le.trim()?{duplicateSuffix:Le}:{},...De.trim()?{duplicateRemovePrefix:De}:{},...ve.trim()?{duplicateRemoveSuffix:ve}:{},...D==="combined"?{combinedCardName:Xe.trim()}:{}});try{let G=[...new Set(i.flatMap(ie=>ie.style.kind==="character"?[ie.style.id]:[]))],[oe,Ce,ta]=await Promise.all([Promise.all(G.map(ie=>_e(ie))),xe.kind==="character"?_e(xe.id):Promise.resolve(null),Promise.all(he.map(async ie=>({name:(y??[]).find(Ns=>Ns.id===ie)?.name??ie,entries:await Qr(ie)})))]),yt=new Map(oe.map((ie,cr)=>[G[cr],ie])),Ra=await Fr({targets:i.map(ie=>({characterId:ie.characterId,characterName:ie.name,card:ie.card,...ie.note.trim()?{note:ie.note.trim()}:{},...ie.style.kind==="none"?{behaviorOverride:null}:ie.style.kind==="character"?{behaviorOverride:ie.style.id,behaviorOverrideCard:Dt(yt.get(ie.style.id))}:{}})),config:f,...o?{label:`${o.label} (rerun)`.slice(0,200)}:r?.label?.trim()?{label:r.label.trim().slice(0,200)}:{},...ta.length>0?{lorebooks:ta}:{},...Ce?{behaviorCharacter:Dt(Ce)}:{}});Ao(f,we()),je.current=!0,o||Wt(we()),d(Ra)}catch(G){$(G instanceof Error?G.message:String(G)),x(!1)}};return u(Ee,{className:"ce-setup",label:l("cardEditor.dialog.title"),busy:ea,closeOnEscape:!ma,onClose:s,onChangeCapture:()=>{Ie.current=!0},onClickCapture:f=>{f.target.closest("button, input, select, label")&&(Ie.current=!0)},children:[t("div",{className:"ce-setup-targets",children:t(uo,{localization:e,targets:i,targetsLoading:g,onUpdateTarget:Ps,onRemoveTarget:As,onAddTarget:Rs})}),t("div",{className:"ce-setup-config",children:ma?t(vo,{localization:e,initialSchemaId:ze.schemaId,onClose:()=>Xa(!1),onSchemasChanged:(f,G)=>{ae(f),Te(oe=>({...oe,schemaId:G}))}}):u(He,{children:[o?t("div",{className:"ce-status",role:"status",children:l("cardEditor.dialog.rerun.restored",{count:o.targets.ids.length,label:o.label})}):F?u("div",{className:"ce-status",role:"status",children:[t("span",{children:l("cardEditor.dialog.draft.restored",{count:F.ids.length,notes:Object.values(F.targets).filter(f=>f.note.trim()).length})})," ",t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:Bs,children:l("cardEditor.dialog.draft.discard")})]}):null,u("fieldset",{className:"ce-section","data-ce-section":"presets",children:[t("legend",{className:"ce-section-heading",children:l("cardEditor.dialog.presets.title")}),u("label",{className:"ce-label",htmlFor:"ce-settings-preset",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.presets.name")}),t("input",{id:"ce-settings-preset",type:"text",list:"ce-settings-preset-list",className:"mari-chrome-field ce-field",value:$e,placeholder:l("cardEditor.dialog.presets.namePlaceholder"),onChange:f=>Be(f.target.value)}),t("datalist",{id:"ce-settings-preset-list",children:wa.map(f=>t("option",{value:f.name},f.name))}),t("small",{children:l("cardEditor.dialog.presets.hint")})]}),u("div",{className:"ce-preset-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!aa,onClick:()=>aa&&ur(aa.form),children:l("cardEditor.dialog.presets.load")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!$e.trim(),onClick:Ms,children:l(aa?"cardEditor.dialog.presets.overwrite":"cardEditor.dialog.presets.save")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!aa,onClick:()=>aa&&Ea(f=>Uo(f,aa.name,we())),children:l("cardEditor.dialog.presets.delete")})]})]}),u("fieldset",{className:"ce-section","data-ce-section":"model",children:[t("legend",{className:"ce-section-heading",children:l("cardEditor.dialog.model.title")}),u("label",{className:"ce-label",htmlFor:"ce-connection",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.model.connection")}),u("select",{id:"ce-connection",className:"mari-chrome-field ce-field",value:j??"","data-ce-autofocus":!0,onChange:f=>A(f.target.value||null),children:[t("option",{value:"",children:l("cardEditor.dialog.model.connectionDefault")}),(p??[]).map(f=>t("option",{value:f.id,children:f.model?`${f.name} \xB7 ${f.model}`:f.name},f.id))]})]}),p===null&&!C?t("p",{className:"ce-caption",children:l("cardEditor.dialog.model.connectionsLoading")}):null,C?t("div",{className:"ce-status ce-status--error",role:"alert",children:l("cardEditor.dialog.model.connectionsError")}):null,u("label",{className:"ce-label",htmlFor:"ce-preset",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.model.preset")}),u("select",{id:"ce-preset",className:"mari-chrome-field ce-field",value:J,onChange:f=>It(f.target.value),children:[t("option",{value:"transform",children:l("cardEditor.dialog.model.presetTransform")}),t("option",{value:"standard",children:l("cardEditor.dialog.model.presetStandard")}),t("option",{value:"strict",children:l("cardEditor.dialog.model.presetStrict")}),t("option",{value:"rebalance",children:l("cardEditor.dialog.model.presetRebalance")}),t("option",{value:"xml-simple",children:l("cardEditor.dialog.model.presetXmlSimple")}),t("option",{value:"xml-complex",children:l("cardEditor.dialog.model.presetXmlComplex")}),t("option",{value:"custom",children:l("cardEditor.dialog.model.presetCustom")})]})]}),J==="custom"?u("label",{className:"ce-label",htmlFor:"ce-custom-template",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.model.customTemplate")}),t("textarea",{id:"ce-custom-template",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:M,onChange:f=>N(f.target.value)}),t("small",{children:l("cardEditor.dialog.model.customTemplateHint")})]}):null]}),de?t(Wo,{localization:e,draft:ze,schemas:Ge,schemasError:Pa,agentStructuredOutput:Wa,onChange:f=>Te(G=>({...G,...f})),onEditSchemas:()=>Xa(!0)}):null,u("fieldset",{className:"ce-section","data-ce-section":"instructions",children:[t("legend",{className:"ce-section-heading",children:l("cardEditor.dialog.instructions.title")}),u("label",{className:"ce-label",htmlFor:"ce-global-instruction",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.instructions.global")}),t("textarea",{id:"ce-global-instruction",className:"mari-chrome-field ce-field ce-textarea",value:Y,placeholder:l("cardEditor.dialog.instructions.globalPlaceholder"),onChange:f=>ge(f.target.value)})]}),u("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.instructions.behavior")}),t(qa,{localization:e,selection:xe,onChange:ke,buttonLabel:l("cardEditor.dialog.instructions.behavior"),noneLabel:l("cardEditor.dialog.instructions.behaviorNone")}),t("small",{children:l("cardEditor.dialog.instructions.behaviorHint")})]}),u("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.instructions.lorebooks")}),t("input",{type:"search",className:"mari-chrome-field ce-field",value:q,placeholder:l("cardEditor.dialog.instructions.lorebooksFilter"),"aria-label":l("cardEditor.dialog.instructions.lorebooksFilter"),onChange:f=>E(f.target.value)}),y===null&&!K?t("p",{className:"ce-caption",children:l("cardEditor.dialog.instructions.lorebooksLoading")}):null,K?t("div",{className:"ce-status ce-status--error",role:"alert",children:l("cardEditor.dialog.instructions.lorebooksError")}):null,y!==null&&y.length===0?t("p",{className:"ce-caption",children:l("cardEditor.dialog.instructions.lorebooksEmpty")}):null,y!==null&&y.length>0&&bt.length===0?t("p",{className:"ce-caption",children:l("cardEditor.dialog.instructions.lorebooksNoneMatch")}):null,bt.length>0?t("div",{className:"ce-lorebook-list",children:bt.map(f=>u("label",{className:"ce-lorebook",children:[t("input",{type:"checkbox",checked:he.includes(f.id),onChange:G=>Me(oe=>G.target.checked?[...new Set([...oe,f.id])]:oe.filter(Ce=>Ce!==f.id))}),t("span",{className:"ce-lorebook-name",children:f.name})]},f.id))}):null,t("small",{children:l("cardEditor.dialog.instructions.lorebooksHint")})]})]}),u("fieldset",{className:"ce-section","data-ce-section":"processing",children:[t("legend",{className:"ce-section-heading",children:l("cardEditor.dialog.processing.title")}),u("div",{className:"ce-choice-list",children:[t(Pe,{name:"ce-mode",value:"individual",checked:Q==="individual",onChange:()=>H("individual"),title:l("cardEditor.dialog.processing.modeIndividual")}),t(Pe,{name:"ce-mode",value:"batched",checked:Q==="batched",onChange:()=>H("batched"),title:l("cardEditor.dialog.processing.modeBatched")})]}),u("div",{className:"ce-number-grid",children:[t(ua,{id:"ce-batch-size",label:l("cardEditor.dialog.processing.batchSize"),value:_,min:1,max:16,onChange:re}),t(ua,{id:"ce-provider-retries",label:l("cardEditor.dialog.processing.providerRetries"),value:Se,min:0,max:5,onChange:Re}),t(ua,{id:"ce-refusal-retries",label:l("cardEditor.dialog.processing.refusalRetries"),value:L,min:0,max:5,onChange:w}),t(ua,{id:"ce-concurrency",label:l("cardEditor.dialog.processing.concurrency"),value:b,min:1,max:pa,onChange:V})]}),de?null:u("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:Ae,onChange:f=>ce(f.target.checked)}),u("span",{className:"ce-choice-copy",children:[t("strong",{children:l("cardEditor.dialog.processing.rebalance")}),t("small",{children:l("cardEditor.dialog.processing.rebalanceHint")})]})]}),u("label",{className:"ce-label",htmlFor:"ce-completion-mode",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.processing.completionMode")}),u("select",{id:"ce-completion-mode",className:"mari-chrome-field ce-field",value:h,onChange:f=>B(f.target.value),children:[t("option",{value:"ask",children:l("cardEditor.dialog.processing.completionAsk")}),t("option",{value:"apply",disabled:Ve,children:l("cardEditor.dialog.processing.completionApply")}),t("option",{value:"duplicate",disabled:Ve,children:l("cardEditor.dialog.processing.completionDuplicate")})]}),Ve?t("small",{children:l("cardEditor.dialog.processing.autoDisabledNote")}):t("small",{children:l("cardEditor.dialog.processing.completionCaption")})]}),t("p",{className:"ce-caption",children:l("cardEditor.dialog.processing.overflowCaption")})]}),u("fieldset",{className:"ce-section","data-ce-section":"saving",children:[t("legend",{className:"ce-section-heading",children:l("cardEditor.dialog.saving.title")}),u("div",{className:"ce-choice-list",children:[t(Pe,{name:"ce-save-mode",value:"confirm",checked:D==="confirm",onChange:f=>O(f),title:l("cardEditor.dialog.saving.confirm")}),t(Pe,{name:"ce-save-mode",value:"auto",checked:D==="auto",onChange:f=>O(f),title:l("cardEditor.dialog.saving.auto"),disabled:Ve}),t(Pe,{name:"ce-save-mode",value:"duplicate",checked:D==="duplicate",onChange:f=>O(f),title:l("cardEditor.dialog.saving.duplicate")}),D==="duplicate"?u(He,{children:[u("label",{className:"ce-label",htmlFor:"ce-duplicate-prefix",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.saving.duplicatePrefix")}),t("input",{id:"ce-duplicate-prefix",type:"text",className:"mari-chrome-field ce-field",value:ee,placeholder:l("cardEditor.dialog.saving.duplicatePrefixPlaceholder"),"aria-label":l("cardEditor.dialog.saving.duplicatePrefix"),onChange:f=>le(f.target.value)}),t("small",{children:l("cardEditor.dialog.saving.duplicatePrefixHint")})]}),u("label",{className:"ce-label",htmlFor:"ce-duplicate-suffix",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.saving.duplicateSuffix")}),t("input",{id:"ce-duplicate-suffix",type:"text",className:"mari-chrome-field ce-field",value:Le,placeholder:l("cardEditor.dialog.saving.duplicateSuffixPlaceholder"),"aria-label":l("cardEditor.dialog.saving.duplicateSuffix"),onChange:f=>ye(f.target.value)})]}),t("p",{className:"ce-divider-caption",children:l("cardEditor.dialog.saving.duplicateRemoveGroup")}),u("label",{className:"ce-label",htmlFor:"ce-duplicate-remove-prefix",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.saving.duplicateRemovePrefix")}),t("input",{id:"ce-duplicate-remove-prefix",type:"text",className:"mari-chrome-field ce-field",value:De,placeholder:l("cardEditor.dialog.saving.duplicateRemovePrefixPlaceholder"),"aria-label":l("cardEditor.dialog.saving.duplicateRemovePrefix"),onChange:f=>va(f.target.value)})]}),u("label",{className:"ce-label",htmlFor:"ce-duplicate-remove-suffix",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.saving.duplicateRemoveSuffix")}),t("input",{id:"ce-duplicate-remove-suffix",type:"text",className:"mari-chrome-field ce-field",value:ve,placeholder:l("cardEditor.dialog.saving.duplicateRemoveSuffixPlaceholder"),"aria-label":l("cardEditor.dialog.saving.duplicateRemoveSuffix"),onChange:f=>ka(f.target.value)})]}),t("p",{className:"ce-caption",children:l("cardEditor.dialog.saving.duplicateNamePreview",{name:Ts})})]}):null,t(Pe,{name:"ce-save-mode",value:"combined",checked:D==="combined",onChange:f=>O(f),title:l("cardEditor.dialog.saving.combined")}),D==="combined"?u("label",{className:"ce-label",htmlFor:"ce-combined-name",children:[t("span",{className:"ce-label-title",children:l("cardEditor.dialog.saving.combinedName")}),t("input",{id:"ce-combined-name",type:"text",className:"mari-chrome-field ce-field",value:Xe,placeholder:l("cardEditor.dialog.saving.combinedNamePlaceholder"),"aria-label":l("cardEditor.dialog.saving.combinedName"),onChange:f=>ya(f.target.value)}),t("small",{children:l("cardEditor.dialog.saving.combinedCaption")})]}):null]}),Ve?t("p",{className:"ce-caption",children:l("cardEditor.dialog.saving.reviewRequiredHint")}):null,t("p",{className:"ce-caption",children:l("cardEditor.dialog.saving.caption")})]})]})}),u("div",{className:"ce-dialog-foot ce-setup-summary",children:[t("h3",{className:"ce-section-heading",children:l("cardEditor.setup.summary")}),u("dl",{className:"ce-summary-list",children:[t("dt",{children:l("cardEditor.setup.targets")}),t("dd",{children:i.length}),t("dt",{children:l("cardEditor.dialog.model.preset")}),t("dd",{children:l(il[J])}),t("dt",{children:l("cardEditor.dialog.saving.title")}),t("dd",{children:l(`cardEditor.panel.saveMode.${D}`)}),t("dt",{children:l("cardEditor.dialog.processing.completionMode")}),t("dd",{children:l(`cardEditor.panel.completionMode.${h}`)})]}),z?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:l("cardEditor.dialog.dispatchError",{message:z})}):null,St?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:l("cardEditor.dialog.targets.unloadableBlock")}):null,vt?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:l("cardEditor.dialog.saving.combinedNameRequired")}):null,t("span",{className:"ce-estimate",children:l("cardEditor.dialog.estimate",{batch:_,batchedCalls:ar.batched,individualCalls:ar.individual})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:ea||i.length===0||St||tr||vt||rr,onClick:()=>{Ds()},children:l(ea?"cardEditor.dialog.dispatching":"cardEditor.dialog.dispatch")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-setup-cancel",onClick:s,disabled:ea,children:l("cardEditor.dialog.close")})]})]})}function nl(e,a){return e==="backstory"||e==="appearance"?{extensions:{[e]:a}}:{[e]:a}}function ul(e){let{name:a,...r}=e;return r}function Ia(e){return(e instanceof Error?e.message:String(e??""))||"unknown error"}var $o=" (Copy)",Xt=new Set;async function $t(e,a){if(Xt.has(e))return null;Xt.add(e);try{return await a()}finally{Xt.delete(e)}}async function cl(e,a,r){if(a.op==="hold")return{ok:!0};if(a.op==="collectForCombine")return{ok:!0};if(a.op==="patchField")return await Nt(a.characterId,nl(a.field,a.newText),{versionSource:a.versionSource,versionReason:a.versionReason}),{ok:!0};let o=a,s=await Yr(a.characterId),d=typeof s?.id=="string"&&s.id?s.id:"";if(!d)throw new Error("The duplicate call returned no card id.");let l=Mt(s),i=a.name??(l.endsWith($o)?l.slice(0,-$o.length):l||e.characterName),n={name:tt(i,{...o.namePrefix===void 0?{}:{prefix:o.namePrefix},...o.nameSuffix===void 0?{}:{suffix:o.nameSuffix},...o.stripNamePrefix===void 0?{}:{removePrefix:o.stripNamePrefix},...o.stripNameSuffix===void 0?{}:{removeSuffix:o.stripNameSuffix}})},g={...a.extensions};for(let[c,p]of Object.entries(a.fields))c==="backstory"||c==="appearance"?g[c]=p:n[c]=p;return Object.keys(g).length>0&&(n.extensions=g),await Nt(d,n,{versionSource:"agent",versionReason:`Card Editor bulk: ${r}`}),{ok:!0,resultCardId:d}}async function jt(e,a,r){let o=[];for(let[s,d]of a.entries())try{o.push({index:s,...await cl(e,d,r.label)})}catch(l){o.push({index:s,ok:!1,error:Ia(l)})}return o}async function Ca(e,a,r){return await $t(a.itemId,()=>fl(e,a,r))??{kind:"failed",message:"This card is already being saved."}}async function fl(e,a,r){try{let o=e.status==="completed"?e.config.completionMode??"ask":"ask",d=o==="duplicate"||o==="ask"&&(e.config.saveMode==="duplicate"||e.config.saveMode==="combined")?void 0:ul((await _e(a.characterId)).fields),l=await Bt(e.id,a.itemId,{verdict:"approve",...r.force?{force:!0}:{},...d===void 0?{}:{currentFields:d}});if(!At(l))return{kind:"failed",message:"The verdict route answered an unexpected shape."};if(l.status==="needs-confirmation")return{kind:"needs-confirmation",holds:l.holds};let i=await jt(a,l.ops,{label:e.label}),n;try{n=await Ya(e.id,a.itemId,i)}catch(c){return{kind:"report-failed",message:Ia(c)}}let g=i.find(c=>!c.ok);if(g){let c=n.items.find(p=>p.itemId===a.itemId);return{kind:"apply-failed",session:n,message:c?.failure?.message??g.error??"A card write failed."}}return{kind:"applied",session:n}}catch(o){return{kind:"failed",message:Ia(o)}}}async function nt(e,a){if(e.status!=="completed")return{session:e,failedCount:0,messages:[]};let r=e.config.completionMode??"ask",o=e.items.filter(i=>Array.isArray(i.pendingOps)||r==="apply"&&i.status==="awaiting-review"),s=e,d=0,l=[];a?.(0,o.length);for(let[i,n]of o.entries()){let g=s.items.find(c=>c.itemId===n.itemId)??n;try{if(Array.isArray(g.pendingOps)){let c=await $t(g.itemId,async()=>{let p=await na(s.id),I=p.items.find(y=>y.itemId===g.itemId);if(!I||!Array.isArray(I.pendingOps))return{session:p,failed:!1};let C=I.pendingOps,k=await jt(I,C,{label:p.label});return{session:await Ya(p.id,I.itemId,k),failed:k.some(y=>!y.ok)}});c&&(s=c.session,c.failed&&(d+=1))}else{let c=await Ca(s,g,{force:!1});c.kind==="applied"||c.kind==="apply-failed"?(s=c.session,c.kind==="apply-failed"&&(d+=1,l.push(c.message))):c.kind==="needs-confirmation"?s=await na(s.id):(d+=1,l.push(c.message))}}catch(c){d+=1,l.push(Ia(c))}a?.(i+1,o.length)}return{session:s,failedCount:d,messages:l}}async function ut(e,a){try{let r=await Bt(e.id,a.itemId,{verdict:"reject"});return At(r)?{kind:"failed",message:"The verdict route answered an unexpected shape."}:{kind:"rejected",session:r}}catch(r){return{kind:"failed",message:Ia(r)}}}function ml(e){return e.filter(a=>a.status==="applied").map(a=>qe((a.updates??[]).find(r=>r.field==="description")?.newText??"")).filter(a=>a.trim().length>0)}async function jo(e,a={}){try{let r=e.items.filter(n=>n.status==="applied"),o=ml(e.items);if(r.length===0||o.length===0)return{kind:"failed",message:"No collected cards to combine yet."};let s=e.config.combinedCardName?.trim()||e.label,d=await ao({name:s,description:o.join(`

`)}),l=typeof d?.id=="string"&&d.id?d.id:"";if(!l)throw new Error("The create call returned no card id.");return{kind:"combined",session:await Kr(e.id,{itemIds:r.map(n=>n.itemId),resultCardId:l,...a.confirmPartial?{confirmPartial:!0}:{}})}}catch(r){return{kind:"failed",message:Ia(r)}}}async function Ko(e){let{plans:a}=await jr(e.id),r=e,o=0;for(let s of a){let d=e.items.find(i=>i.itemId===s.itemId);if(!d)continue;(await $t(d.itemId,async()=>{let i=await jt(d,s.ops,{label:e.label});return r=await Ya(e.id,s.itemId,i),i}))?.some(i=>!i.ok)&&(o+=1)}return{session:r,failedCount:o}}function Jo(e){return e.split(`
`)}function Zo(e,a){let r=Jo(e),o=Jo(a);if(e===a)return r.map(c=>({kind:"same",text:c}));let s=0;for(;s<r.length&&s<o.length&&r[s]===o[s];)s+=1;let d=r.length,l=o.length;for(;d>s&&l>s&&r[d-1]===o[l-1];)d-=1,l-=1;let i=r.slice(s,d),n=o.slice(s,l),g=r.slice(0,s).map(c=>({kind:"same",text:c}));if(i.length*n.length<=1e6){let c=Array.from({length:i.length+1},()=>new Uint32Array(n.length+1));for(let C=i.length-1;C>=0;C-=1)for(let k=n.length-1;k>=0;k-=1)c[C][k]=i[C]===n[k]?c[C+1][k+1]+1:Math.max(c[C+1][k],c[C][k+1]);let p=0,I=0;for(;p<i.length&&I<n.length;)i[p]===n[I]?(g.push({kind:"same",text:i[p]}),p+=1,I+=1):c[p+1][I]>=c[p][I+1]?(g.push({kind:"del",text:i[p]}),p+=1):(g.push({kind:"add",text:n[I]}),I+=1);for(;p<i.length;)g.push({kind:"del",text:i[p++]});for(;I<n.length;)g.push({kind:"add",text:n[I++]})}else{for(let c of i)g.push({kind:"del",text:c});for(let c of n)g.push({kind:"add",text:c})}for(let c of r.slice(d))g.push({kind:"same",text:c});return g}function Qo(e,a=3){let r=[],o=[],s=0,d=()=>{o.length!==0&&(o.some(i=>i.kind!=="same")&&r.push({hiddenBefore:s,lines:o}),o=[],s=0)},l=0;for(;l<e.length;){if(e[l].kind!=="same"){o.push(e[l]),l+=1;continue}let i=l;for(;i<e.length&&e[i].kind==="same";)i+=1;let n=i-l,g=o.length>0,c=i<e.length;if(!g&&!c)break;g?c?n>a*2?(o.push(...e.slice(l,l+a)),d(),s=n-a*2,o.push(...e.slice(i-a,i))):o.push(...e.slice(l,i)):o.push(...e.slice(l,Math.min(i,l+a))):(s=Math.max(0,n-a),o.push(...e.slice(Math.max(l,i-a),i))),l=i}return d(),r}function Yo(e){return e.trim().split(/\s+/u).filter(Boolean).length}function ct(e,a){let r=new Map;for(let s of e.trim().split(/\s+/u).filter(Boolean))r.set(s,(r.get(s)??0)+1);let o=0;for(let s of a.trim().split(/\s+/u).filter(Boolean)){let d=r.get(s)??0;d===0?o+=1:d===1?r.delete(s):r.set(s,d-1)}return{added:o,removed:[...r.values()].reduce((s,d)=>s+d,0)}}var pl={queued:"cardEditor.panel.status.queued",running:"cardEditor.panel.status.running",succeeded:"cardEditor.panel.status.succeeded","awaiting-review":"cardEditor.panel.status.awaitingReview","needs-review":"cardEditor.panel.status.needsReview",applied:"cardEditor.panel.status.applied",duplicated:"cardEditor.panel.status.duplicated",rejected:"cardEditor.panel.status.rejected","failed-provider":"cardEditor.panel.status.failedProvider","failed-refusal":"cardEditor.panel.status.failedRefusal","failed-parse":"cardEditor.panel.status.failedParse",canceled:"cardEditor.panel.status.canceled",interrupted:"cardEditor.panel.status.interrupted","awaiting-split":"cardEditor.panel.status.awaitingSplit",split:"cardEditor.panel.status.split",staged:"cardEditor.panel.status.staged"};function Ga(e){return pl[e]??"cardEditor.panel.status.unknown"}function Va(e){return e==="queued"||e==="running"||e==="succeeded"?"live":e==="awaiting-review"||e==="needs-review"||e==="awaiting-split"?"review":e==="applied"||e==="duplicated"||e==="split"||e==="staged"?"ok":e==="rejected"||e==="canceled"||e==="interrupted"?"muted":"danger"}var hl=["awaiting-review","needs-review"],gl=["failed-provider","failed-refusal","failed-parse"];function Ue(e){return hl.includes(e.status)}function fa(e){return gl.includes(e.status)}function Kt(e){return Ue(e)||e.status==="applied"||e.status==="duplicated"||e.status==="rejected"}function es(e){let a=e.updates??[];if(a.length===0)return null;let r=0,o=0;for(let s of a){let d=ct(e.snapshots[s.field]??qe(s.oldText),qe(s.newText));r+=d.added,o+=d.removed}return{fields:a.length,added:r,removed:o}}function ft(e){let a=e.items.filter(l=>l.status==="running").length,r=e.items.filter(l=>l.status==="queued").length,o=e.batches.filter(l=>l.status!=="split"),s=o.findIndex(l=>l.status==="running"),d=s>=0?o[s]:null;return e.config.mode==="batched"&&d?{kind:"batch",runningItems:a,queuedItems:r,batchIndex:s+1,batchCount:o.length,batchAttempts:d.attempts}:a>0?{kind:"items",runningItems:a,queuedItems:r,batchIndex:0,batchCount:0,batchAttempts:0}:r>0?{kind:"queued",runningItems:a,queuedItems:r,batchIndex:0,batchCount:0,batchAttempts:0}:{kind:"done",runningItems:a,queuedItems:r,batchIndex:0,batchCount:0,batchAttempts:0}}function as(e){let a=e.items.some(d=>d.phase===2)?2:1,r=e.items.filter(d=>(d.phase??1)===a),o=e.items.filter(d=>(d.phase??1)===1&&d.parentItemId===void 0).length,s=r.filter(d=>d.status==="awaiting-split").length;return{sources:o,results:r.filter(d=>d.status!=="split"&&d.status!=="rejected"&&d.status!=="canceled").reduce((d,l)=>d+(l.status==="awaiting-split"?l.characters?.length??1:1),0),splitsPending:s,splitsAccepted:r.filter(d=>d.status==="split").length,phase:a,phase2Ready:e.config.transform?.phase2?.enabled===!0&&a===1&&e.status!=="active"&&s===0&&e.items.some(d=>d.status==="staged")}}function ts(e,a){return!e.parentItemId||!e.lineage?.splitGroupId?!1:a.find(o=>o.itemId===e.parentItemId)?.status==="split"}function rs(e){return e.status==="active"?"processing":e.items.some(a=>Ue(a)||a.status==="awaiting-split")?"review":"finish"}var os=["review","approved","split","failed","rejected","running"];function mt(e){return Ue(e)?"review":e.status==="applied"||e.status==="duplicated"?"approved":e.status==="awaiting-split"||e.status==="split"?"split":fa(e)?"failed":e.status==="rejected"||e.status==="canceled"||e.status==="interrupted"?"rejected":"running"}function ss(e){let a=[];return e.status==="awaiting-split"&&a.push("split"),Kt(e)&&a.push("changes"),e.status==="failed-parse"&&e.failure?.rawOutput&&a.push("json"),fa(e)&&e.failure?.renderedPrompt!==void 0&&a.push("retry"),a.push("summary"),a}function ba(e,a,r=!0){let o=se(e);o.current=e;let[s,d]=m(null),l=Oe(I=>d(I),[]),[i,n]=m(!1),[g,c]=m(typeof document>"u"?!0:document.visibilityState==="visible");W(()=>{if(!s||typeof IntersectionObserver>"u"){n(!0);return}let I=new IntersectionObserver(C=>{n(C.some(k=>k.isIntersecting))});return I.observe(s),()=>I.disconnect()},[s]),W(()=>{let I=()=>c(document.visibilityState==="visible");return document.addEventListener("visibilitychange",I),()=>document.removeEventListener("visibilitychange",I)},[]);let p=r&&i&&g;return W(()=>{if(!p)return;let I=!1,C=0,k=()=>{I||(o.current(),C=window.setTimeout(k,a))};return k(),()=>{I=!0,window.clearTimeout(C)}},[p,a]),l}function xl({localization:e}){let a=(y,T)=>te(e,y,T),[r,o]=m(!1),[s,d]=m(0),[l,i]=m(!1),[n,g]=m(!1),[c,p]=m(!1),[I,C]=m(null);W(()=>{let y=!1;return Za().then(T=>{y||(d(T.maxParallelAgents??0),i(T.disableAutoVerdicts),o(!0))}).catch(()=>{y||C("Could not load the bulk settings.")}),()=>{y=!0}},[]);let k=async()=>{if(!(n||!r)){g(!0),C(null),p(!1);try{await Gr({version:1,maxParallelAgents:s>0?s:null,disableAutoVerdicts:l}),p(!0)}catch(y){C(y instanceof Error?y.message:String(y))}finally{g(!1)}}};return u("details",{className:"ce-settings","data-ce-section":"bulk-settings",children:[t("summary",{className:"ce-section-heading",children:a("cardEditor.panel.settings.title")}),t(ua,{id:"ce-settings-max-parallel",label:a("cardEditor.panel.settings.maxParallelAgents"),value:s,min:0,max:16,onChange:y=>{d(y),p(!1)}}),t("p",{className:"ce-caption",children:a("cardEditor.panel.settings.maxParallelAgentsHint")}),u("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:l,onChange:y=>{i(y.target.checked),p(!1)}}),u("span",{className:"ce-choice-copy",children:[t("strong",{children:a("cardEditor.panel.settings.disableAutoVerdicts")}),t("small",{children:a("cardEditor.panel.settings.disableAutoVerdictsHint")})]})]}),u("div",{className:"ce-session-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:n||!r,onClick:()=>{k()},children:a("cardEditor.panel.settings.save")}),c?t("span",{className:"ce-caption",children:a("cardEditor.panel.settings.saved")}):null]}),I?t("div",{className:"ce-status ce-status--error",role:"alert",children:a("cardEditor.panel.detail.actionError",{message:I})}):null]})}function Ll({session:e,t:a}){let r=ft(e),o=r.kind==="batch"?a("cardEditor.panel.live.batch",{index:r.batchIndex,count:r.batchCount})+(r.batchAttempts>1?a("cardEditor.panel.live.batchRetry",{attempt:r.batchAttempts}):""):r.kind==="items"?a("cardEditor.panel.live.items",{running:r.runningItems,total:e.stats.total}):r.kind==="queued"?a("cardEditor.panel.live.queued",{count:r.queuedItems}):a("cardEditor.panel.live.settling");return t("span",{className:"ce-caption ce-live-line",children:o})}function ls({localization:e,detailId:a,setupActive:r,onSelect:o,onNewRun:s}){let d=(v,P)=>te(e,v,P),[l,i]=m(null),[n,g]=m({}),[c,p]=m(!1),[I,C]=m(null),[k,y]=m({}),T=se(new Set),K=Oe(()=>{Qa().then(async v=>{i(Array.isArray(v)?v:[]),p(!1);let P=(Array.isArray(v)?v:[]).filter(_=>_.status==="active"||_.status==="completed"&&(_.pendingApplyCount>0||_.enforcementPendingCount>0)),Q=await Promise.allSettled(P.map(_=>na(_.id))),H={};Q.forEach((_,re)=>{_.status==="fulfilled"&&(H[P[re].id]=_.value)}),g(H)}).catch(()=>p(!0))},[]),X=ba(K,3e3,!0);W(()=>{for(let v of Object.values(n)){if(v.id===a||v.status!=="completed"||T.current.has(v.id))continue;let P=v.config.completionMode??"ask";v.items.filter(H=>Array.isArray(H.pendingOps)||P==="apply"&&H.status==="awaiting-review").length!==0&&(T.current.add(v.id),nt(v,(H,_)=>y(re=>({...re,[v.id]:{done:H,total:_}}))).then(H=>{H.messages.length>0&&C(H.messages[0])}).finally(()=>{T.current.delete(v.id),y(H=>{let{[v.id]:_,...re}=H;return re}),K()}))}},[n,a,K]);let q=Do(we()),E=l??[],S=E.filter(v=>v.status==="active"),R=E.filter(v=>v.status!=="active"),F=v=>{let P=n[v.id],Q=v.stats.total>0?v.stats.done/v.stats.total:0;return t("li",{children:u("button",{type:"button",className:`ce-run-row${v.status==="active"?" ce-run-row--active":""}`,"aria-current":!r&&v.id===a,onClick:()=>o(v.id),children:[t("span",{className:"ce-run-row-label",children:v.label}),u("span",{className:"ce-run-row-meta",children:[v.status==="active"?null:t("span",{className:`ce-chip ce-chip--${v.status==="completed"?"ok":"muted"}`,children:d(`cardEditor.panel.sessionStatus.${v.status}`)}),v.stats.failed>0?t("span",{className:"ce-chip ce-chip--danger",children:d("cardEditor.panel.statsFailed",{count:v.stats.failed})}):null,t("span",{className:"ce-caption",children:d("cardEditor.panel.progress",{done:v.stats.done,total:v.stats.total})})]}),v.status==="active"?t("span",{className:"ce-progress",role:"progressbar","aria-valuemin":0,"aria-valuemax":v.stats.total,"aria-valuenow":v.stats.done,"aria-label":d("cardEditor.panel.progress",{done:v.stats.done,total:v.stats.total}),children:t("span",{className:"ce-progress-fill",style:{width:`${Math.round(Q*100)}%`}})}):null,P&&v.status==="active"?t(Ll,{session:P,t:d}):null,k[v.id]?t("span",{className:"ce-caption ce-live-line",children:d("cardEditor.panel.enforcementProgress",k[v.id])}):null]})},v.id)};return u("nav",{className:"ce-rail",ref:X,"aria-label":d("cardEditor.panel.title"),"data-card-editor-view":"runs",children:[t("div",{className:"ce-rail-top",children:u("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary","aria-current":r,onClick:s,children:[t(la,{className:"ce-icon","aria-hidden":"true"}),d("cardEditor.workspace.newRun")]})}),u("div",{className:"ce-rail-runs",children:[q?t("div",{"data-ce-section":"draft",children:t("ul",{className:"ce-sessions",children:t("li",{children:u("button",{type:"button",className:"ce-run-row",onClick:s,children:[t("span",{className:"ce-run-row-label",children:d("cardEditor.workspace.draft")}),t("span",{className:"ce-run-row-meta",children:t("span",{className:"ce-caption",children:d("cardEditor.workspace.draftCount",{count:q.ids.length})})})]})})})}):null,c?t("div",{className:"ce-status ce-status--error",role:"alert",children:d("cardEditor.panel.loadError")}):null,I?t("div",{className:"ce-status ce-status--error",role:"alert",children:d("cardEditor.panel.detail.actionError",{message:I})}):null,l===null&&!c?t("div",{className:"ce-status",role:"status",children:d("cardEditor.panel.loading")}):null,l!==null&&E.length===0?t("p",{className:"ce-caption",children:d("cardEditor.panel.empty")}):null,S.length>0?u("div",{"data-ce-section":"active",children:[t("span",{className:"ce-rail-label",children:d("cardEditor.panel.activeTitle")}),t("ul",{className:"ce-sessions",children:S.map(F)})]}):null,R.length>0?u("div",{"data-ce-section":"history",children:[t("span",{className:"ce-rail-label",children:d("cardEditor.panel.historyTitle")}),t("ul",{className:"ce-sessions",children:R.map(F)})]}):null]}),t("div",{className:"ce-rail-foot",children:t(xl,{localization:e})})]})}var Il={"2:3":.6666666666666666,"3:4":.75,"9:16":.5625},is={method:"portrait",aspect:"3:4",columns:0,gap:8,resolution:2},_a={x:0,y:0,scale:100};function pt(e,a,r){return Math.min(r,Math.max(a,Math.round(e)))}function Sa(e,a=50){let r=a>0?a:50;return{x:pt(Number.isFinite(e?.x)?e.x:0,-100,100),y:pt(Number.isFinite(e?.y)?e.y:0,-100,100),scale:pt(Number.isFinite(e?.scale)?e.scale:100,r,200)}}function Cl(e,a){let r=Math.floor(e);if(!(r>0))return{cols:1,rows:1};let o=a>0&&Number.isFinite(a)?a:1,s={cols:1,rows:r},d=1/0;for(let l=1;l<=r;l++){let i=Math.ceil(r/l),n=Math.abs(i/l-o);n<d&&(d=n,s={cols:l,rows:i})}return s}function ds(e,a,r,o,s,d){let l=s>1?(a-s)/(s-1):o,i=d>1?(r-d)/(d-1):o,n=Math.min(Math.max(0,o),Math.max(0,Math.floor(Math.min(l,i)))),g=(a-n*(s-1))/s,c=(r-n*(d-1))/d;return g<=0||c<=0?[]:Array.from({length:e},(p,I)=>({x:I%s*(g+n),y:Math.floor(I/s)*(c+n),w:g,h:c}))}function ns(e,a,r,o,s=[]){let d=Math.floor(a);if(!(d>0)||!(r>0)||!(o>0))return[];if(e.columns>=1){let c=Math.min(e.columns,d);return ds(d,r,o,e.gap,c,Math.ceil(d/c))}let l=o/r,i=l;if(e.method==="portrait")i=Il[e.aspect]*l;else if(e.method==="best-fit"){let c=s.filter(p=>typeof p=="number"&&p>0);c.length>0&&(i=Math.exp(c.reduce((p,I)=>p+Math.log(I),0)/c.length)*l)}let{cols:n,rows:g}=Cl(d,i);return ds(d,r,o,e.gap,n,g)}function Jt(e,a,r){if(!(a>0)||!(r>0)||!(e.w>0)||!(e.h>0))return 50;let o=e.w/a,s=e.h/r;return Math.ceil(100*Math.min(o,s)/Math.max(o,s))}function us(e,a,r,o){if(!(a>0)||!(r>0)||!(e.w>0)||!(e.h>0))return null;let s=Sa(o,Jt(e,a,r)),d=Math.max(e.w/a,e.h/r)*(s.scale/100),l=a*d,i=r*d;return{dx:e.x+(e.w-l)/2+s.x/100*e.w,dy:e.y+(e.h-i)/2+s.y/100*e.h,dw:l,dh:i}}function Zt(e,a,r,o){return Sa({...e,x:e.x+a,y:e.y+r},o)}function ht(e,a,r){return Sa({...e,scale:e.scale+a},r)}function cs(e,a,r,o){return!(a>0)||!(r>0)?e:pt(e*(r/a),o,200)}function Qt(e,a,r){return e.findIndex(o=>a>=o.x&&a<o.x+o.w&&r>=o.y&&r<o.y+o.h)}function fs(e){return{width:512*e.resolution,height:768*e.resolution}}function bl(e){let a=[...new Set(e.items.filter(d=>d.parentItemId===void 0).map(d=>d.characterId))],r=e.items.flatMap(d=>d.resultCardId?[d.resultCardId]:[]),o=e.items.filter(d=>d.status==="applied"&&!d.resultCardId).map(d=>d.characterId),s=[...new Set([...e.combinedCardId?[e.combinedCardId]:[],...r,...o])];return{sources:[...new Set([...a,...r])],targets:s}}function Sl(e){return new Promise(a=>{let r=new Image;r.onload=()=>a(r),r.onerror=()=>a(null),r.src=e})}function vl(e){return e.split(/\s+/).filter(Boolean).slice(0,2).map(a=>a[0].toUpperCase()).join("")}function ms({localization:e,session:a,onClose:r}){let o=(L,w)=>te(e,L,w),[{sources:s,targets:d}]=m(()=>bl(a)),[l,i]=m(null),[n,g]=m(()=>new Set(s)),[c,p]=m(s),[I,C]=m(d[0]??""),[k,y]=m(is),[T,K]=m({}),[X,q]=m(0),[E,S]=m(!1),[R,F]=m(null),v=se(null),P=se({pointers:new Map});W(()=>{let L=!1,w=[...new Set([...s,...d])];return Promise.all(w.map(async b=>{try{let V=await _e(b);return{id:b,name:V.name,image:V.avatarPath?await Sl(V.avatarPath):null}}catch{return{id:b,name:b,image:null}}})).then(b=>{L||i(b)}),()=>{L=!0}},[s,d]);let Q=new Map((l??[]).map(L=>[L.id,L])),H=c.filter(L=>n.has(L)).map(L=>Q.get(L)??{id:L,name:L,image:null}),_=fs(k),re=ns(k,H.length,_.width,_.height,H.map(L=>L.image?L.image.naturalWidth/L.image.naturalHeight:null)),j=Math.min(X,Math.max(0,H.length-1)),A=L=>{let w=H[L],b=re[L];return w?.image&&b?Jt(b,w.image.naturalWidth,w.image.naturalHeight):50},J=L=>T[L]??_a,Z=(L,w)=>{let b=H[L];b&&K(V=>({...V,[b.id]:w(V[b.id]??_a,A(L))}))},M=L=>{let w=v.current,b=w?.getContext("2d");if(!w||!b)return;b.clearRect(0,0,w.width,w.height),b.fillStyle="#16121f",b.fillRect(0,0,w.width,w.height),H.forEach((h,B)=>{let D=re[B];if(!D)return;b.save(),b.beginPath(),b.rect(D.x,D.y,D.w,D.h),b.clip();let O=h.image?us(D,h.image.naturalWidth,h.image.naturalHeight,J(h.id)):null;h.image&&O?b.drawImage(h.image,O.dx,O.dy,O.dw,O.dh):(b.fillStyle="#2b2540",b.fillRect(D.x,D.y,D.w,D.h),b.fillStyle="#e8d4ff",b.font=`700 ${Math.round(Math.min(D.w,D.h)*.28)}px sans-serif`,b.textAlign="center",b.textBaseline="middle",b.fillText(vl(h.name),D.x+D.w/2,D.y+D.h/2)),b.restore()});let V=re[j];L&&V&&H.length>1&&(b.strokeStyle="#36cdde",b.lineWidth=Math.max(3,Math.round(w.width/256)),b.strokeRect(V.x+1.5,V.y+1.5,V.w-3,V.h-3))};W(()=>M(!0));let N=L=>{let w=v.current,b=w.getBoundingClientRect();return{x:(L.clientX-b.left)*w.width/b.width,y:(L.clientY-b.top)*w.height/b.height}},Y=L=>{let w=N(L),b=Qt(re,w.x,w.y);if(b>=0&&P.current.pointers.size===0&&q(b),L.currentTarget.setPointerCapture(L.pointerId),P.current.pointers.set(L.pointerId,w),P.current.pointers.size===2){let[V,h]=[...P.current.pointers.values()];P.current.pinch={distance:Math.hypot(V.x-h.x,V.y-h.y),scale:J(H[j]?.id??"").scale}}},ge=L=>{let w=P.current.pointers.get(L.pointerId);if(!w)return;let b=N(L);P.current.pointers.set(L.pointerId,b);let V=re[j];if(!V)return;if(P.current.pointers.size===2&&P.current.pinch){let[D,O]=[...P.current.pointers.values()],ee=P.current.pinch;Z(j,(le,Le)=>({...le,scale:cs(ee.scale,ee.distance,Math.hypot(D.x-O.x,D.y-O.y),Le)}));return}let h=(b.x-w.x)/V.w*100,B=(b.y-w.y)/V.h*100;Z(j,(D,O)=>Zt(D,h,B,O))},xe=L=>{P.current.pointers.delete(L.pointerId),P.current.pointers.size<2&&delete P.current.pinch},ke=L=>{let w=N(L),b=Qt(re,w.x,w.y);b<0||(q(b),Z(b,(V,h)=>ht(V,L.deltaY<0?5:-5,h)))},he=L=>{let w={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[L.key];if(L.key==="Tab"&&!L.shiftKey&&j<H.length-1)q(j+1);else if(L.key==="Tab"&&L.shiftKey&&j>0)q(j-1);else if(w)Z(j,(b,V)=>Zt(b,w[0],w[1],V));else if(L.key==="+"||L.key==="=")Z(j,(b,V)=>ht(b,5,V));else if(L.key==="-")Z(j,(b,V)=>ht(b,-5,V));else if(L.key==="0")Z(j,()=>_a);else return;L.preventDefault()},Me=(L,w)=>p(b=>{let V=b.indexOf(L),h=V+w;if(V<0||h<0||h>=b.length)return b;let B=[...b];return[B[V],B[h]]=[B[h],B[V]],B}),Ae=async()=>{let L=v.current;if(!(!L||!I||E)){S(!0),F(null);try{M(!1);let w=L.toDataURL("image/png");M(!0),await eo(I,w),F({tone:"ok",text:o("cardEditor.avatar.applied",{name:Q.get(I)?.name??I})})}catch(w){F({tone:"error",text:w instanceof Error?w.message:String(w)})}finally{S(!1)}}},ce=H[j],Se=ce?Sa(J(ce.id),A(j)).scale:100,Re=(L,w,b,V)=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":L===w,onClick:()=>V(L),children:b},String(L));return u(Ee,{className:"ce-avatar-studio",label:o("cardEditor.avatar.title"),busy:E,closeOnEscape:!1,onClose:r,children:[u("div",{className:"ce-dialog-head",children:[t("strong",{children:o("cardEditor.avatar.title")}),t("button",{type:"button",className:"ce-dialog-close",onClick:r,disabled:E,"aria-label":o("cardEditor.avatar.close"),children:t(me,{className:"ce-icon","aria-hidden":"true"})})]}),u("div",{className:"ce-avatar-body",children:[u("div",{className:"ce-avatar-sources",children:[t("span",{className:"ce-label-title",children:o("cardEditor.avatar.images")}),l===null?t("p",{className:"ce-caption",children:o("cardEditor.avatar.loading")}):null,t("ul",{className:"ce-avatar-source-list",children:c.map((L,w)=>{let b=Q.get(L);return u("li",{className:"ce-avatar-source",children:[u("label",{className:"ce-choice",children:[t("input",{type:"checkbox",checked:n.has(L),onChange:V=>g(h=>{let B=new Set(h);return V.target.checked?B.add(L):B.size>1&&B.delete(L),B})}),u("span",{className:"ce-choice-copy",children:[t("strong",{children:b?.name??L}),b&&!b.image?t("small",{children:o("cardEditor.avatar.noImage")}):null]})]}),u("span",{className:"ce-inline-controls",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:w===0,"aria-label":o("cardEditor.avatar.moveUp",{name:b?.name??L}),onClick:()=>Me(L,-1),children:t(sa,{className:"ce-icon","aria-hidden":"true"})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:w===c.length-1,"aria-label":o("cardEditor.avatar.moveDown",{name:b?.name??L}),onClick:()=>Me(L,1),children:t(oa,{className:"ce-icon","aria-hidden":"true"})})]})]},L)})}),t("p",{className:"ce-caption",children:o("cardEditor.avatar.sourcesHint")})]}),u("div",{className:"ce-avatar-canvas-wrap",children:[t("canvas",{ref:v,className:"ce-avatar-canvas",width:_.width,height:_.height,tabIndex:0,"aria-label":o("cardEditor.avatar.canvasLabel"),onPointerDown:Y,onPointerMove:ge,onPointerUp:xe,onPointerCancel:xe,onWheel:ke,onKeyDown:he}),t("p",{className:"ce-caption",role:"status",children:ce?o("cardEditor.avatar.selected",{name:ce.name,zoom:Se}):""})]}),u("div",{className:"ce-avatar-controls",children:[u("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:o("cardEditor.avatar.layout")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":o("cardEditor.avatar.layout"),children:["square","portrait","best-fit"].map(L=>Re(L,k.method,o(`cardEditor.avatar.method.${L}`),w=>y({...k,method:w})))})]}),u("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:o("cardEditor.avatar.columns")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":o("cardEditor.avatar.columns"),children:[0,1,2,3,4].map(L=>Re(L,k.columns,L===0?o("cardEditor.avatar.columnsAuto"):String(L),w=>y({...k,columns:w})))})]}),u("label",{className:"ce-label",htmlFor:"ce-avatar-gap",children:[t("span",{className:"ce-label-title",children:o("cardEditor.avatar.gap",{gap:k.gap})}),t("input",{id:"ce-avatar-gap",type:"range",min:0,max:48,value:k.gap,onChange:L=>y({...k,gap:Number(L.target.value)})})]}),u("label",{className:"ce-label",htmlFor:"ce-avatar-zoom",children:[t("span",{className:"ce-label-title",children:o("cardEditor.avatar.zoom",{zoom:Se})}),t("input",{id:"ce-avatar-zoom",type:"range",min:A(j),max:200,value:Se,disabled:!ce,onChange:L=>Z(j,(w,b)=>Sa({...w,scale:Number(L.target.value)},b))})]}),u("div",{className:"ce-label",children:[t("span",{className:"ce-label-title",children:o("cardEditor.avatar.resolution")}),t("div",{className:"ce-segmented",role:"radiogroup","aria-label":o("cardEditor.avatar.resolution"),children:[1,2,4].map(L=>Re(L,k.resolution,`${512*L}\xD7${768*L}`,w=>y({...k,resolution:w})))})]}),u("div",{className:"ce-inline-controls",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:!ce,onClick:()=>Z(j,()=>_a),children:o("cardEditor.avatar.resetCell")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:()=>K({}),children:o("cardEditor.avatar.resetAll")})]}),t("p",{className:"ce-caption",children:o("cardEditor.avatar.keys")})]})]}),u("div",{className:"ce-dialog-foot",children:[R?t("div",{className:`ce-status${R.tone==="error"?" ce-status--error":""} ce-foot-error`,role:R.tone==="error"?"alert":"status",children:R.text}):null,u("label",{className:"ce-label ce-studio-name",htmlFor:"ce-avatar-target",children:[t("span",{className:"ce-sr-only",children:o("cardEditor.avatar.target")}),u("select",{id:"ce-avatar-target",className:"mari-chrome-field ce-field",value:I,onChange:L=>C(L.target.value),children:[d.length===0?t("option",{value:"",children:o("cardEditor.avatar.noTargets")}):null,d.map(L=>t("option",{value:L,children:o("cardEditor.avatar.targetOption",{name:Q.get(L)?.name??L})},L))]})]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:E||!I||l===null,onClick:()=>{Ae()},children:o(E?"cardEditor.avatar.applying":"cardEditor.avatar.apply")})]})]})}function ps({localization:e,session:a,item:r,onClose:o,onRetried:s}){let d=(T,K)=>te(e,T,K),l=r.failure?.renderedPrompt??null,[i,n]=m(l?.system??""),[g,c]=m(l?.user??""),[p,I]=m(!1),[C,k]=m(null),y=async()=>{if(!(p||!l)){I(!0),k(null);try{s(await Xr(a.id,r.itemId,{system:i,user:g}))}catch(T){k(T instanceof Error?T.message:String(T)),I(!1)}}};return u(Ee,{className:"ce-edit-retry",label:d("cardEditor.editRetry.title",{name:r.characterName}),busy:p,closeOnEscape:!1,onClose:o,children:[u("div",{className:"ce-dialog-head",children:[t("strong",{children:d("cardEditor.editRetry.title",{name:r.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:o,disabled:p,"aria-label":d("cardEditor.editRetry.close"),children:t(me,{className:"ce-icon","aria-hidden":"true"})})]}),u("div",{className:"ce-dialog-body",children:[l?u(He,{children:[t("p",{className:"ce-caption",children:d("cardEditor.editRetry.hint")}),u("label",{className:"ce-label",htmlFor:"ce-retry-system",children:[t("span",{className:"ce-label-title",children:d("cardEditor.editRetry.system")}),t("textarea",{id:"ce-retry-system",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:i,"data-ce-autofocus":!0,onChange:T=>n(T.target.value)})]}),u("label",{className:"ce-label",htmlFor:"ce-retry-user",children:[t("span",{className:"ce-label-title",children:d("cardEditor.editRetry.user")}),t("textarea",{id:"ce-retry-user",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:g,onChange:T=>c(T.target.value)})]})]}):t("div",{className:"ce-status",role:"status",children:d("cardEditor.editRetry.missing")}),C?t("div",{className:"ce-status ce-status--error",role:"alert",children:d("cardEditor.editRetry.error",{message:C})}):null]}),u("div",{className:"ce-dialog-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:p,onClick:o,children:d("cardEditor.editRetry.cancel")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:p||!l,onClick:()=>{y()},children:d(p?"cardEditor.editRetry.retrying":"cardEditor.editRetry.retry")})]})]})}function hs({localization:e,session:a,item:r,onClose:o,onUpdated:s}){let d=(C,k)=>te(e,C,k),[l,i]=m(r.failure?.rawOutput??""),[n,g]=m(!1),[c,p]=m(r.failure?.message??null),I=async C=>{if(!n){g(!0),p(null);try{s(await C())}catch(k){p(k instanceof Error?k.message:String(k)),g(!1)}}};return u(Ee,{className:"ce-edit-retry",label:d("cardEditor.fixJson.title",{name:r.characterName}),busy:n,closeOnEscape:!1,onClose:o,children:[u("div",{className:"ce-dialog-head",children:[t("strong",{children:d("cardEditor.fixJson.title",{name:r.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:o,disabled:n,"aria-label":d("cardEditor.editRetry.close"),children:t(me,{className:"ce-icon","aria-hidden":"true"})})]}),u("div",{className:"ce-dialog-body",children:[t("p",{className:"ce-caption",children:d("cardEditor.fixJson.hint")}),u("label",{className:"ce-label",htmlFor:"ce-fix-json",children:[t("span",{className:"ce-label-title",children:d("cardEditor.fixJson.response")}),t("textarea",{id:"ce-fix-json",className:"mari-chrome-field ce-field ce-textarea ce-template-textarea",value:l,spellCheck:!1,"data-ce-autofocus":!0,onChange:C=>i(C.target.value)})]}),c?t("div",{className:"ce-status ce-status--error",role:"alert",children:c}):null]}),u("div",{className:"ce-dialog-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:n,onClick:o,children:d("cardEditor.fixJson.dismiss")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:n,onClick:()=>{I(()=>Fa(a.id,r.itemId))},children:d("cardEditor.fixJson.regenerate")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:n||!l.trim(),onClick:()=>{I(()=>$r(a.id,r.itemId,l))},children:d(n?"cardEditor.editRetry.retrying":"cardEditor.fixJson.apply")})]})]})}var gs=600;function xs(e){let a=qe(e).trim();return a.length>gs?`${a.slice(0,gs)}\u2026`:a}function Ls({localization:e,session:a,item:r,onClose:o,onUpdated:s}){let d=(y,T)=>te(e,y,T),l=r.characters??[],[i,n]=m(()=>l.map(y=>y.name)),[g,c]=m(!1),[p,I]=m(null),C=r.previousOutput??r.snapshots.description??"",k=async y=>{if(!g){c(!0),I(null);try{s(await Or(a.id,r.itemId,y,y==="accept"?i.map(T=>T.trim()):void 0))}catch(T){I(T instanceof Error?T.message:String(T)),c(!1)}}};return u(Ee,{className:"ce-split-review",label:d("cardEditor.split.title",{name:r.characterName}),busy:g,closeOnEscape:!1,onClose:o,children:[u("div",{className:"ce-dialog-head",children:[t("strong",{children:d("cardEditor.split.title",{name:r.characterName})}),t("button",{type:"button",className:"ce-dialog-close",onClick:o,disabled:g,"aria-label":d("cardEditor.split.close"),children:t(me,{className:"ce-icon","aria-hidden":"true"})})]}),u("div",{className:"ce-split-body",children:[u("div",{className:"ce-split-source",children:[t("span",{className:"ce-label-title",children:d("cardEditor.split.source")}),t("pre",{className:"ce-split-source-text",tabIndex:0,children:xs(C)||d("cardEditor.split.sourceEmpty")})]}),u("div",{className:"ce-split-proposal",children:[t("div",{className:"ce-notice",role:"status",children:u("span",{children:[t("strong",{children:d("cardEditor.split.proposal",{count:l.length})}),r.splitReason?` ${d("cardEditor.split.reason",{reason:r.splitReason})}`:""]})}),t("ol",{className:"ce-split-cards",children:l.map((y,T)=>{let K=Object.values(y.fields)[0]??"";return u("li",{className:"ce-split-card",children:[u("label",{className:"ce-label",htmlFor:`ce-split-name-${T}`,children:[t("span",{className:"ce-label-title",children:d("cardEditor.split.cardName",{index:T+1})}),t("input",{id:`ce-split-name-${T}`,className:"mari-chrome-field ce-field",value:i[T]??"",placeholder:y.name,onChange:X=>n(q=>q.map((E,S)=>S===T?X.target.value:E))})]}),t("pre",{className:"ce-split-card-text",children:xs(K)}),y.issues?.length?t("small",{className:"ce-item-failure",children:d("cardEditor.split.issues",{count:y.issues.length})}):null]},`${T}:${y.name}`)})}),t("p",{className:"ce-caption",children:d("cardEditor.split.outcome",{count:l.length})})]})]}),u("div",{className:"ce-dialog-foot",children:[p?t("div",{className:"ce-status ce-status--error ce-foot-error",role:"alert",children:p}):null,t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:g,onClick:()=>{k("reject")},children:d("cardEditor.split.skip")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:g,onClick:()=>{k("retry-single")},children:d("cardEditor.split.retrySingle")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:g,onClick:()=>{k("accept")},children:d("cardEditor.split.accept",{count:l.length})})]})]})}var kl=3,yl=8;function wl(e){return(e.updates??[]).map(a=>{let r=e.snapshots[a.field]??qe(a.oldText),o=qe(a.newText),{added:s,removed:d}=ct(r,o),l=Qo(Zo(r,o),kl);return{field:a.field,newText:o,added:s,removed:d,wordCount:Yo(o),hunks:l}})}function El({preview:e,expanded:a,showAll:r,onToggle:o,onShowAll:s,t:d}){if(!a)return u("button",{type:"button",className:"ce-queue-minirow",onClick:o,children:[t("span",{className:"ce-queue-minirow-caret","aria-hidden":"true",children:"\u25B8"}),t("span",{className:"ce-queue-minirow-field",children:e.field}),t("span",{className:"ce-queue-minirow-words",children:d("cardEditor.queue.miniRowWords",{added:e.added,removed:e.removed})})]});let l=r?Number.POSITIVE_INFINITY:yl,i=!1,n=[];for(let g of e.hunks){if(l<=0){i=!0;break}let c=0;g.hiddenBefore>0&&(c=g.hiddenBefore,l-=1);let p=g.lines.slice(0,Math.max(0,l));p.length<g.lines.length&&(i=!0),l-=p.length,n.push({lines:p,hidden:c})}return u("section",{className:"ce-queue-field",children:[u("header",{className:"ce-queue-field-head",children:[t("strong",{className:"ce-queue-field-name",children:e.field}),t("span",{className:"ce-chip ce-chip--ok",children:d("cardEditor.queue.chips.added",{count:e.added})}),t("span",{className:"ce-chip ce-chip--danger",children:d("cardEditor.queue.chips.removed",{count:e.removed})}),t("span",{className:"ce-chip",children:d("cardEditor.queue.chips.fieldWords",{count:e.wordCount})})]}),t("div",{className:"ce-diff",role:"group","aria-label":e.field,children:n.map(({lines:g,hidden:c},p)=>u("div",{className:"ce-diff-hunk",children:[c>0?t("div",{className:"ce-diff-line ce-diff-line--marker",children:d("cardEditor.queue.hiddenLines",{count:c})}):null,g.map((I,C)=>u("div",{className:`ce-diff-line ce-diff-line--${I.kind}`,children:[t("span",{className:"ce-diff-sign","aria-hidden":"true",children:I.kind==="add"?"+":I.kind==="del"?"\u2212":"\xA0"}),t("span",{className:"ce-diff-text",children:I.text})]},C))]},p))}),i?t("button",{type:"button",className:"ce-queue-expander",onClick:s,children:d("cardEditor.queue.field.expand")}):null,t("pre",{className:"ce-queue-fullfield",children:e.newText})]})}function Is({localization:e,session:a,focusItemId:r,onFocusChange:o,onRefresh:s}){let d=(M,N)=>te(e,M,N),l=Ka(()=>a.items.filter(Kt),[a.items]),[i,n]=m(r),g=M=>{n(M),M&&o(M)};W(()=>n(r),[r]);let[c,p]=m(!1),[I,C]=m(null),[k,y]=m(null),[T,K]=m(null),[X,q]=m(null),[E,S]=m(new Set),R=l.findIndex(M=>M.itemId===i),F=R>=0?l[R]:null,v=Ka(()=>F?wl(F):[],[F]),P=se(null);W(()=>{C(null),y(null),K(null),q(null),S(new Set),P.current?.focus({preventScroll:!0})},[i]);let Q=(M,N)=>X===null?N===0:X.has(M),H=M=>q(N=>{let Y=new Set(N??new Set(v[0]?[v[0].field]:[]));return Y.has(M)?Y.delete(M):Y.add(M),Y}),_=F!==null&&Ue(F),re=M=>{let N=l[M];N&&g(N.itemId)},j=M=>{let Y=l.filter(ge=>ge.itemId!==M).find(Ue)??null;g(Y?.itemId??M)},A=async M=>{if(!F||c||!_)return;p(!0),y(null),K(null);let N=await Ca(a,F,{force:M});if(p(!1),N.kind==="needs-confirmation"){C(N.holds),s();return}if(N.kind==="applied"){let Y=F.itemId;s(),j(Y);return}if(N.kind==="apply-failed"){K(N.message),s();return}y(N.message)},J=async()=>{if(!F||c||!_)return;p(!0),y(null),K(null);let M=await ut(a,F);if(p(!1),M.kind==="rejected"){let N=F.itemId;s(),j(N);return}y(M.message)};W(()=>{let M=N=>{let Y=N.target;if(!(Y&&(Y.tagName==="INPUT"||Y.tagName==="TEXTAREA"||Y.tagName==="SELECT"||Y.isContentEditable))&&!c){if(N.key==="ArrowLeft"){R>0&&(N.preventDefault(),re(R-1));return}if(N.key==="ArrowRight"){R>=0&&R<l.length-1&&(N.preventDefault(),re(R+1));return}!_||N.ctrlKey||N.metaKey||N.altKey||(N.key==="r"||N.key==="R"?(N.preventDefault(),J()):(N.key==="a"||N.key==="A")&&(N.preventDefault(),A(!1)))}};return document.addEventListener("keydown",M),()=>document.removeEventListener("keydown",M)});let Z=v.reduce((M,N)=>({added:M.added+N.added,removed:M.removed+N.removed}),{added:0,removed:0});return t("div",{className:"ce-queue",children:F?u("article",{className:"ce-queue-card",ref:P,tabIndex:-1,"aria-label":F.characterName,children:[u("header",{className:"ce-queue-card-head",children:[t("h3",{className:"ce-queue-name",children:F.characterName}),t("span",{className:`ce-chip ce-chip--${Va(F.status)}`,children:d(Ga(F.status))})]}),u("div",{className:"ce-queue-chips",children:[t("span",{className:"ce-chip",children:d("cardEditor.queue.chips.fields",{count:v.length})}),t("span",{className:"ce-chip ce-chip--ok",children:d("cardEditor.queue.chips.added",{count:Z.added})}),t("span",{className:"ce-chip ce-chip--danger",children:d("cardEditor.queue.chips.removed",{count:Z.removed})})]}),a.config.saveMode==="duplicate"?t("p",{className:"ce-caption",children:d("cardEditor.queue.duplicateNote")}):null,t("div",{className:"ce-queue-fields",children:v.map((M,N)=>t(El,{preview:M,expanded:Q(M.field,N),showAll:E.has(M.field),onToggle:()=>H(M.field),onShowAll:()=>S(Y=>new Set([...Y,M.field])),t:d},M.field))}),I?u("div",{className:"ce-queue-stale",role:"alert",children:[t("p",{children:d("cardEditor.queue.staleTitle",{count:I.length})}),u("div",{className:"ce-queue-stale-actions",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:c,onClick:()=>{A(!0)},children:d("cardEditor.queue.staleApply")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:c,onClick:()=>C(null),children:d("cardEditor.queue.staleSkip")})]})]}):null,T?t("div",{className:"ce-status ce-status--error",role:"alert",children:d("cardEditor.queue.applyFailed",{message:T})}):null,k?t("div",{className:"ce-status ce-status--error",role:"alert",children:d("cardEditor.queue.verdictError",{message:k})}):null,u("footer",{className:"ce-queue-foot",children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R<=0,"aria-label":d("cardEditor.queue.prev"),onClick:()=>re(R-1),children:t(Je,{className:"ce-icon","aria-hidden":"true"})}),u("button",{type:"button",className:"mari-chrome-control ce-queue-reject",disabled:c||!_,onClick:()=>{J()},children:[t(me,{className:"ce-icon","aria-hidden":"true"}),d("cardEditor.queue.reject"),t("kbd",{className:"ce-key-hint",children:d("cardEditor.queue.rejectHint")})]}),u("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary ce-queue-approve",disabled:c||!_,onClick:()=>{A(!1)},children:[t(Ma,{className:"ce-icon","aria-hidden":"true"}),d(c?"cardEditor.queue.working":"cardEditor.queue.approve"),t("kbd",{className:"ce-key-hint",children:d("cardEditor.queue.approveHint")})]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:R<0||R>=l.length-1,"aria-label":d("cardEditor.queue.next"),onClick:()=>re(R+1),children:t(Na,{className:"ce-icon","aria-hidden":"true"})})]})]}):t("div",{className:"ce-status",role:"status",children:d("cardEditor.queue.empty")})})}function Cs({item:e,t:a}){if(fa(e)&&e.failure)return t("span",{className:"ce-item-failure",children:e.failure.message});if(e.status==="awaiting-split")return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.splitProposed",{count:e.characters?.length??0})});if(e.status==="split")return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.splitInto",{count:e.characters?.length??0})});if(e.resultCardId)return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.copyCreated",{id:e.resultCardId})});if(e.status==="applied"&&(e.updates??[]).length===0)return t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.noChanges")});let r=es(e);return r?t("span",{className:"ce-item-result",children:a("cardEditor.panel.detail.summary",{fields:r.fields,added:r.added,removed:r.removed})}):null}function bs({localization:e,sessionId:a,onBack:r,onDeleted:o,onRerun:s,onRerunSelected:d,onStage:l}){let i=(x,z)=>te(e,x,z),[n,g]=m(null),[c,p]=m(!1),[I,C]=m(null),[k,y]=m(!1),[T,K]=m({}),[X,q]=m(null),[E,S]=m(null),[R,F]=m(null),[v,P]=m(null),[Q,H]=m(new Set),[_,re]=m("all"),[j,A]=m(""),[J,Z]=m("list"),M=se(new Set),[N,Y]=m(!1),[ge,xe]=m(!1),[ke,he]=m(null),Me=se(new Set),Ae=se(!1),ce=Oe(()=>{na(a).then(x=>{g(x),p(!1)}).catch(()=>p(!0))},[a]),Se=ba(ce,2e3),Re=(x,z=null)=>{F(x),P(z),xe(!1),Z("inspector")};W(()=>{if(!n||R!==null)return;let x=n.items.find(z=>z.status==="failed-parse"&&z.failure?.rawOutput&&!M.current.has(z.itemId));x&&(M.current.add(x.itemId),F(x.itemId),P("json"))},[R,n]);let L=n?rs(n):null,w=n?.label??"";W(()=>{L&&l?.(L,w)},[L,w,l]),W(()=>{if(!n||R!==null)return;let x=n.items.find(z=>Ue(z)||z.status==="awaiting-split")??n.items[0];x&&F(x.itemId)},[R,n]),W(()=>{if(!n||(n.config.completionMode??"ask")!=="ask")return;let x=n.items.filter(z=>z.status==="awaiting-review"&&z.autoApply===!0&&!Me.current.has(z.itemId));if(x.length!==0){for(let z of x)Me.current.add(z.itemId);(async()=>{for(let z of x){let $=await Ca(n,z,{force:!1});($.kind==="failed"||$.kind==="report-failed")&&K(pe=>({...pe,[z.itemId]:$.message}))}ce()})()}},[n,ce]),W(()=>{if(!n||Ae.current||n.status!=="completed")return;let x=n.config.completionMode??"ask";n.items.filter($=>Array.isArray($.pendingOps)||x==="apply"&&$.status==="awaiting-review").length!==0&&(Ae.current=!0,nt(n,($,pe)=>q({done:$,total:pe})).then($=>{$.messages.length>0&&C($.messages[0])}).finally(()=>{Ae.current=!1,q(null),ce()}))},[n,ce]);let b=async(x,z)=>{if(!E){S(x),C(null);try{let $=await z();$?g($):ce()}catch($){C($ instanceof Error?$.message:String($))}finally{S(null)}}},V=()=>{b("run-again",async()=>{let x=await _r(a);return s?.(x.id),x})},h=x=>{b("rerun-selected",async()=>{if(!n)return;let z=x.filter((de,Fe)=>x.findIndex(It=>It.characterId===de.characterId)===Fe),$=[...new Set(z.flatMap(de=>typeof de.behaviorOverride=="string"?[de.behaviorOverride]:[]))],pe=new Map((await Promise.allSettled($.map(de=>et(de)))).flatMap((de,Fe)=>de.status==="fulfilled"?[[$[Fe],de.value]]:[])),Ne={};for(let de of z){let Fe=typeof de.behaviorOverride=="string"?pe.get(de.behaviorOverride):void 0;Ne[de.characterId]={note:de.note??"",style:de.behaviorOverride===null?{kind:"none"}:Fe?{kind:"character",...Fe}:{kind:"inherit"}}}d?.({label:n.label,config:n.config,targets:{ids:z.map(de=>de.characterId),targets:Ne}})})},B=()=>{b("rerun-all",async()=>{let x=(n?.items??[]).filter(fa);for(let z of x)await Fa(a,z.itemId)})},D=()=>{b("delete",async()=>{await Jr(a,{force:n?.status==="active"}),o()})},O=()=>{b("combine",async()=>{if(!n)return;let z=n.items.filter(pe=>pe.status==="applied").length<n.items.length,$=await jo(n,...z?[{confirmPartial:!0}]:[]);if($.kind==="failed")throw new Error($.message);return y(!1),$.session})},ee=x=>{b("duplicate-applied",async()=>{if(!n)return;let z=await Ko(n);return z.failedCount>0&&C(i("cardEditor.panel.detail.duplicateAppliedPartial",{failed:z.failedCount,total:x})),z.session})};if(c&&!n)return u("section",{className:"ce-run ce-run--status",ref:Se,children:[u("button",{type:"button",className:"mari-chrome-control ce-back-button",onClick:r,children:[t(Je,{className:"ce-icon","aria-hidden":"true"}),i("cardEditor.panel.back")]}),t("div",{className:"ce-status ce-status--error",role:"alert",children:i("cardEditor.panel.detail.loadError")})]});if(!n)return t("section",{className:"ce-run ce-run--status",ref:Se,children:t("div",{className:"ce-status",role:"status",children:i("cardEditor.panel.detail.loading")})});let le=n.config.transform?as(n):null,Le=ke??le?.phase??1,ye=le?n.items.filter(x=>(x.phase??1)===Le):n.items,De=new Map;for(let x of ye)De.set(mt(x),(De.get(mt(x))??0)+1);let va=j.trim().toLocaleLowerCase(),ve=ye.filter(x=>(_==="all"||mt(x)===_)&&(!va||x.characterName.toLocaleLowerCase().includes(va))),ka=n.items.filter(x=>x.status!=="split"&&x.status!=="staged").length,Xe=n.items.filter(Ue),ya=n.items.filter(fa).length,ze=n.config.saveMode==="combined",Te=ze?n.items.filter(x=>x.status==="applied").length:0,wa=ze&&!n.combinedCardId&&Te>0,Ea=wa&&Te<ka,$e=ze?0:n.items.filter(x=>x.status==="applied"&&x.resultCardId===void 0&&(x.updates??[]).length>0).length,Be=ft(n),Ie=n.items.filter(x=>Q.has(x.itemId)),je=Ie.filter(Ue),Ge=ve.length>0&&ve.every(x=>Q.has(x.itemId)),ae=n.items.find(x=>x.itemId===R)??null,Pa=ae?ss(ae):[],Ye=v&&Pa.includes(v)?v:Pa[0]??null,Wa=x=>H(z=>{let $=new Set(z);return $.has(x)?$.delete(x):$.add(x),$}),Aa=(x,z,$)=>{b(x,async()=>{for(let pe of z){let Ne=$==="approve"?await Ca(n,pe,{force:!1}):await ut(n,pe);if(Ne.kind==="failed"||Ne.kind==="report-failed")throw new Error(Ne.message)}H(new Set)})},ma=x=>{g(x),P(null)},Xa=Be.kind==="batch"?i("cardEditor.panel.live.batch",{index:Be.batchIndex,count:Be.batchCount})+(Be.batchAttempts>1?i("cardEditor.panel.live.batchRetry",{attempt:Be.batchAttempts}):""):Be.kind==="items"?i("cardEditor.panel.live.items",{running:Be.runningItems,total:n.stats.total}):Be.kind==="queued"?i("cardEditor.panel.live.queued",{count:Be.queuedItems}):i("cardEditor.panel.progress",{done:n.stats.done,total:n.stats.total}),ea=ge?t(ms,{localization:e,session:n,onClose:()=>xe(!1)}):ae?Ye==="changes"?t(Is,{localization:e,session:n,focusItemId:ae.itemId,onFocusChange:F,onRefresh:ce}):Ye==="split"&&ae.status==="awaiting-split"?t(Ls,{localization:e,session:n,item:ae,onClose:()=>P("summary"),onUpdated:ma},ae.itemId):Ye==="json"&&ae.status==="failed-parse"?t(hs,{localization:e,session:n,item:ae,onClose:()=>P("summary"),onUpdated:ma},ae.itemId):Ye==="retry"?t(ps,{localization:e,session:n,item:ae,onClose:()=>P("summary"),onRetried:ma},ae.itemId):u("div",{className:"ce-inspector-summary",children:[t(Cs,{item:ae,t:i}),T[ae.itemId]?t("span",{className:"ce-item-failure",children:i("cardEditor.panel.detail.autoApplyError",{name:ae.characterName,message:T[ae.itemId]})}):null,u("div",{className:"ce-item-actions",children:[fa(ae)?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:()=>{b(`rerun-${ae.itemId}`,()=>Fa(a,ae.itemId))},children:i("cardEditor.panel.action.rerun")}):null,ae.status==="queued"&&n.status==="active"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:()=>{b(`cancel-${ae.itemId}`,()=>Wr(a,ae.itemId))},children:i("cardEditor.panel.action.cancelItem")}):null]})]}):t("p",{className:"ce-caption ce-inspector-empty",children:i("cardEditor.workspace.pickItem")});return u("section",{className:"ce-run",ref:Se,"data-card-editor-view":"session-detail","data-mobile-pane":J,children:[u("header",{className:"ce-run-head",children:[u("div",{className:"ce-run-title",children:[t("strong",{className:"ce-panel-heading",children:n.label}),t("span",{className:"ce-caption",role:"status",children:n.status==="active"?Xa:i("cardEditor.panel.progress",{done:n.stats.done,total:n.stats.total})})]}),t("span",{className:`ce-chip ce-chip--${n.status==="active"?"live":n.status==="completed"?"ok":"muted"}`,children:i(`cardEditor.panel.sessionStatus.${n.status}`)}),t("span",{className:"ce-chip",children:i(`cardEditor.panel.saveMode.${n.config.saveMode}`)}),t("span",{className:"ce-chip",children:i(`cardEditor.panel.completionMode.${n.config.completionMode??"ask"}`)}),le?t("span",{className:"ce-chip",children:i("cardEditor.pipeline.count",{sources:le.sources,results:le.results})}):null,le?.splitsPending?t("span",{className:"ce-chip ce-chip--review",children:i("cardEditor.pipeline.splitsPending",{count:le.splitsPending})}):null]}),n.combinedCardId||n.status==="interrupted"||X||I?u("div",{className:"ce-run-notices",children:[n.combinedCardId?t("div",{className:"ce-notice",role:"status",children:t("span",{children:i("cardEditor.panel.detail.combinedCreated",{id:n.combinedCardId})})}):null,n.status==="interrupted"?t("div",{className:"ce-notice",role:"status",children:t("span",{children:i("cardEditor.panel.interruptedNotice")})}):null,X?t("p",{className:"ce-caption ce-live-line",role:"status",children:i("cardEditor.panel.enforcementProgress",X)}):null,I?t("div",{className:"ce-status ce-status--error",role:"alert",children:i("cardEditor.panel.detail.actionError",{message:I})}):null]}):null,u("div",{className:"ce-run-body",children:[u("div",{className:"ce-run-list",children:[n.config.transform?.phase2?.enabled&&le?t("div",{className:"ce-segmented",role:"radiogroup","aria-label":i("cardEditor.pipeline.phaseLabel"),children:[1,2].map(x=>t("button",{type:"button",role:"radio",className:"ce-segment","aria-checked":Le===x,disabled:x===2&&le.phase===1,onClick:()=>he(x),children:i("cardEditor.pipeline.phase",{phase:x})},x))}):null,t("input",{type:"search",className:"mari-chrome-field ce-field",value:j,placeholder:i("cardEditor.workspace.filterItems"),"aria-label":i("cardEditor.workspace.filterItems"),onChange:x=>A(x.target.value)}),u("div",{className:"ce-filter-chips",role:"group","aria-label":i("cardEditor.workspace.statusFilter"),children:[t("button",{type:"button","aria-pressed":_==="all",onClick:()=>re("all"),children:i("cardEditor.workspace.group.all",{count:ye.length})}),os.filter(x=>De.has(x)).map(x=>t("button",{type:"button","aria-pressed":_===x,onClick:()=>re(x),children:i(`cardEditor.workspace.group.${x}`,{count:De.get(x)??0})},x))]}),u("label",{className:"ce-select-all",children:[t("input",{type:"checkbox",checked:Ge,disabled:ve.length===0,onChange:()=>H(x=>{let z=new Set(x);for(let $ of ve)Ge?z.delete($.itemId):z.add($.itemId);return z})}),t("span",{children:i("cardEditor.workspace.selectListed",{count:ve.length})})]}),t("ul",{className:"ce-items",children:ve.map(x=>{let z=ts(x,n.items),$=(x.characters??[]).reduce((pe,Ne)=>pe+(Ne.issues?.length??0),0);return u("li",{className:`ce-item${z?" ce-item--child":""}${x.itemId===R?" ce-item--selected":""}`,children:[t("input",{type:"checkbox",checked:Q.has(x.itemId),"aria-label":i("cardEditor.workspace.selectItem",{name:x.characterName}),onChange:()=>Wa(x.itemId)}),u("button",{type:"button",className:"ce-item-open","aria-current":x.itemId===R,onClick:()=>Re(x.itemId),children:[u("span",{className:"ce-item-main",children:[t("span",{className:"ce-item-name",children:x.characterName}),t("span",{className:`ce-chip ce-chip--${Va(x.status)}`,children:i(Ga(x.status))})]}),u("span",{className:"ce-item-sub",children:[x.lineage?.splitGroupId?t("span",{className:"ce-chip",children:i("cardEditor.panel.detail.lineage",{index:x.lineage.splitIndex??1,count:x.lineage.splitCount??1,origin:x.lineage.originName})}):null,$>0?t("span",{className:"ce-chip ce-chip--review",title:(x.characters??[]).flatMap(pe=>pe.issues??[]).join(`
`),children:i("cardEditor.panel.detail.issues",{count:$})}):null,t(Cs,{item:x,t:i})]})]})]},x.itemId)})}),ve.length===0?t("p",{className:"ce-caption",children:i("cardEditor.workspace.noItems")}):null]}),u("div",{className:"ce-inspector",children:[ae&&!ge?u(He,{children:[u("div",{className:"ce-inspector-head",children:[u("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-mobile-only",onClick:()=>Z("list"),children:[t(Je,{className:"ce-icon","aria-hidden":"true"}),i("cardEditor.workspace.items")]}),t("h3",{className:"ce-queue-name",children:ae.characterName}),t("span",{className:`ce-chip ce-chip--${Va(ae.status)}`,children:i(Ga(ae.status))})]}),t("div",{className:"ce-inspector-tabs",role:"tablist","aria-label":ae.characterName,children:Pa.map(x=>t("button",{type:"button",role:"tab","aria-selected":Ye===x,onClick:()=>P(x),children:i(`cardEditor.workspace.tab.${x}`)},x))})]}):null,t("div",{className:"ce-inspector-body",role:ae&&!ge?"tabpanel":void 0,children:ea})]})]}),u("footer",{className:"ce-bulkbar",children:[t("span",{className:"ce-caption ce-bulkbar-count",children:i("cardEditor.workspace.selectedCount",{count:Ie.length})}),u("div",{className:"ce-bulkbar-actions",children:[je.length>0?u(He,{children:[t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:E!==null,onClick:()=>Aa("approve-selected",je,"approve"),children:i("cardEditor.workspace.approveSelected",{count:je.length})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:E!==null,onClick:()=>Aa("reject-selected",je,"reject"),children:i("cardEditor.workspace.rejectSelected",{count:je.length})})]}):null,Xe.length>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:()=>Aa("approve-all",Xe,"approve"),children:E==="approve-all"?i("cardEditor.queue.approveAllWorking"):i("cardEditor.workspace.approveAll",{count:Xe.length})}):null,wa?Ea&&!k?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:()=>y(!0),children:i("cardEditor.panel.detail.combine",{count:Te})}):Ea&&k?u("span",{className:"ce-confirm-strip",role:"group","aria-label":i("cardEditor.panel.detail.combine"),children:[t("span",{className:"ce-caption",children:i("cardEditor.panel.detail.combinePartialConfirm",{count:Te,total:ka})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:O,children:i("cardEditor.panel.detail.combineYes",{count:Te})}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:()=>y(!1),children:i("cardEditor.panel.detail.combineNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:E!==null,onClick:O,children:i("cardEditor.panel.detail.combine",{count:Te})}):null,$e>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:()=>ee($e),children:i("cardEditor.panel.detail.duplicateApplied",{count:$e})}):null,le?.phase2Ready?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary mari-chrome-control--small",disabled:E!==null,onClick:()=>{b("phase2",async()=>{let x=await qr(a);return he(2),x})},children:i("cardEditor.pipeline.startPhase2",{count:le.results})}):null,d?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null||Ie.length===0,onClick:()=>h(Ie),children:i("cardEditor.workspace.rerunSelected",{count:Ie.length})}):null,ya>0?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:B,children:i("cardEditor.panel.detail.rerunFailed",{count:ya})}):null,le||ze?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small","aria-pressed":ge,onClick:()=>{xe(x=>!x),Z("inspector")},children:i("cardEditor.avatar.open")}):null,n.status==="active"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:()=>{b("cancel-all",()=>Vr(a))},children:i("cardEditor.panel.detail.cancelAll")}):null,n.status==="completed"||n.status==="canceled"?t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:V,children:i("cardEditor.panel.runAgain")}):null,N?u("span",{className:"ce-confirm-strip",role:"group","aria-label":i("cardEditor.panel.delete"),children:[t("span",{className:"ce-caption",children:n.status==="active"?i("cardEditor.panel.deleteConfirmActive"):i("cardEditor.panel.deleteConfirm")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small ce-danger-button",disabled:E!==null,onClick:D,children:n.status==="active"?i("cardEditor.panel.deleteYesActive"):i("cardEditor.panel.deleteYes")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:()=>Y(!1),children:i("cardEditor.panel.deleteNo")})]}):t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",disabled:E!==null,onClick:()=>Y(!0),children:i("cardEditor.panel.detail.delete")})]})]})]})}var Yt="marinara:capability-overlay",vs="card-editor",Pl=new Set(["standard","strict","rebalance","xml-simple","xml-complex","custom","transform"]),Al=new Set(["markdown","xml","json"]),Rl=new Set(["confirm","auto","duplicate","combined"]);function Tl(e){if(e===null||typeof e!="object"||Array.isArray(e))return;let a=e,r=l=>typeof a[l]=="string"?a[l]:void 0,o=r("presetId"),s=r("saveMode"),d={...o!==void 0&&Pl.has(o)?{presetId:o}:{},...r("globalInstruction")!==void 0?{globalInstruction:r("globalInstruction")}:{},...s!==void 0&&Rl.has(s)?{saveMode:s}:{},...r("duplicatePrefix")!==void 0?{duplicatePrefix:r("duplicatePrefix")}:{},...r("combinedCardName")!==void 0?{combinedCardName:r("combinedCardName")}:{},...r("label")!==void 0?{label:r("label")}:{},...r("schemaId")!==void 0&&/^[\w-]{1,80}$/.test(r("schemaId"))?{schemaId:r("schemaId")}:{},...Al.has(r("format")??"")?{format:r("format")}:{}};return Object.keys(d).length>0?d:void 0}function er(e){window.dispatchEvent(new CustomEvent(Yt,{detail:{packageId:vs,action:"open",payload:e}}))}var Ss=["setup","processing","review","finish"],xt=16;function Bl(e){let[a,r]=m(null);return W(()=>{if(!e)return;let o=()=>{let i=document.querySelector(".mari-editor-body")?.getBoundingClientRect(),n=i&&i.width>=640&&i.height>=420;r(n?{left:i.left+xt,top:i.top+xt,width:i.width-xt*2,height:i.height-xt*2}:null)};o();let s=new ResizeObserver(o);s.observe(document.documentElement);let d=document.querySelector(".mari-editor-body");return d&&s.observe(d),window.addEventListener("resize",o),()=>{s.disconnect(),window.removeEventListener("resize",o)}},[e]),a}function ks({localization:e}){let a=(q,E)=>te(e,q,E),[r,o]=m(!1),[s,d]=m(null),[l,i]=m(null),[n,g]=m(null),[c,p]=m("main"),I=Bl(r),C=Oe(()=>o(!1),[]),k=no(r,()=>document.activeElement instanceof HTMLTextAreaElement,C),y=Oe((q,E)=>g({stage:q,label:E}),[]);if(W(()=>{let q=E=>{let S=E.detail;if(!S||S.packageId!==vs)return;if(S.action==="close"){o(!1);return}if(S.action!=="open")return;let R=S.payload,F=R?.dispatch?.characterIds,v=Array.isArray(F)?F.filter(Q=>typeof Q=="string"&&Q.length>0):null,P=typeof R?.sessionId=="string"&&R.sessionId?R.sessionId:null;d(P),g(null),i(v&&v.length>0?{ids:v,prefill:Tl(R?.dispatch?.prefill),key:Date.now()}:null),p("main"),o(!0)};return window.addEventListener(Yt,q),()=>window.removeEventListener(Yt,q)},[]),!r)return null;let T=l?"setup":s?n?.stage??null:null,K=l?a("cardEditor.workspace.newRunCount",{count:l.ids.length}):s?n?.label??"":a("cardEditor.workspace.pickRun"),X=q=>{d(q),g(null),i(null),p("main")};return t("div",{className:"ce-overlay ce-workspace-overlay",role:"presentation",children:u("section",{ref:k,className:"ce-shell ce-workspace",role:"dialog","aria-modal":"true","aria-label":a("cardEditor.workspace.title"),tabIndex:-1,"data-pane":c,"data-placement":I?"editor":"viewport",style:I??void 0,children:[u("header",{className:"ce-workspace-head",children:[u("div",{className:"ce-workspace-title",children:[t("strong",{children:a("cardEditor.workspace.title")}),t("span",{className:"ce-caption",children:K})]}),T?t("ol",{className:"ce-steps","aria-label":a("cardEditor.workspace.stages"),children:Ss.map((q,E)=>{let S=Ss.indexOf(T),R=E<S?"done":E===S?"current":"todo";return u("li",{className:`ce-step ce-step--${R}`,"aria-current":R==="current"?"step":void 0,children:[t("span",{className:"ce-step-dot","aria-hidden":"true",children:R==="done"?"\u2713":E+1}),a(`cardEditor.workspace.stage.${q}`)]},q)})}):null,t("button",{type:"button",className:"ce-dialog-close","aria-label":a("cardEditor.workspace.close"),onClick:C,children:t(me,{className:"ce-icon","aria-hidden":"true"})})]}),u("div",{className:"ce-workspace-switch",role:"tablist","aria-label":a("cardEditor.workspace.title"),children:[t("button",{type:"button",role:"tab","aria-selected":c==="rail",onClick:()=>p("rail"),children:a("cardEditor.workspace.runs")}),t("button",{type:"button",role:"tab","aria-selected":c==="main",onClick:()=>p("main"),children:a(l?"cardEditor.workspace.stage.setup":"cardEditor.workspace.run")})]}),u("div",{className:"ce-workspace-body",children:[t(ls,{localization:e,detailId:s,setupActive:l!==null,onSelect:X,onNewRun:()=>{i({ids:[],key:Date.now()}),p("main")}}),t("div",{className:"ce-workspace-main",children:l?t(Xo,{localization:e,characterIds:l.ids,prefill:l.prefill,rerun:l.rerun,onClose:()=>i(null),onDispatched:q=>X(q.id)},l.key):s?t(bs,{localization:e,sessionId:s,onBack:()=>p("rail"),onDeleted:()=>X(null),onRerun:X,onRerunSelected:q=>{i({ids:q.targets.ids,rerun:q,key:Date.now()}),p("main")},onStage:y},s):u("div",{className:"ce-workspace-empty",children:[t("p",{className:"ce-caption",children:a("cardEditor.workspace.pickRun")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--primary",onClick:()=>i({ids:[],key:Date.now()}),children:a("cardEditor.workspace.newRun")})]})})]})]})})}function ys({localization:e,agentName:a}){let r=(g,c)=>te(e,g,c),[o,s]=m(null),d=Oe(()=>{Qa().then(g=>s(Array.isArray(g)?g:[])).catch(()=>s([]))},[]),l=ba(d,5e3,!0),i=o?.filter(g=>g.status==="active").length??0,n=o?.filter(g=>g.status!=="active").length??0;return u("section",{className:"ce-shell ce-panel","data-card-editor-view":"agent-panel",ref:l,"aria-label":a?r("cardEditor.panel.titleWithAgent",{agent:a}):r("cardEditor.panel.title"),children:[t("div",{className:"ce-panel-head",children:t("strong",{className:"ce-panel-heading",children:r("cardEditor.panel.title")})}),t("p",{className:"ce-caption",children:r("cardEditor.panel.summaryCounts",{active:i,recent:n})}),t("button",{type:"button",className:"mari-chrome-control",onClick:()=>er(),children:r("cardEditor.panel.openWorkspace")})]})}var ws=`
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
`;function Ml({props:e}){let a=(l,i)=>te(e.localization,l,i),r=e.selectedCharacterIds??[],s=(e.selectionCount??r.length??0)>=1,d=a("cardEditor.action.open");return u("button",{type:"button",className:"mari-chrome-control ce-selection-button","data-icon-only":e.iconOnly?"":void 0,"aria-label":e.iconOnly?d:void 0,disabled:!s,onClick:()=>{er({dispatch:{characterIds:r}}),e.onRequestClose?.()},children:[t(be,{className:"ce-icon","aria-hidden":"true"}),!e.iconOnly&&d]})}function Dl({element:e}){let a=e.capabilityProps??{},r=e.getAttribute("view");return r==="selection-action"?t(Ml,{props:a}):r==="agent-panel"?t(ys,{localization:a.localization,agentName:a.agent?.name}):r==="overlay"?t(ks,{localization:a.localization}):null}function Nl({element:e}){let[,a]=m(0);W(()=>{let o=()=>a(s=>s+1);return e.addEventListener("marinara-capability-props",o),()=>e.removeEventListener("marinara-capability-props",o)},[e]);let r=e.capabilityProps?.localization?.direction==="rtl"?"rtl":"ltr";return u("div",{dir:r,style:{display:"contents"},children:[t("style",{children:ws}),t(Dl,{element:e})]})}var Lt=class extends HTMLElement{constructor(){super(...arguments);ra(this,"__root",null);ra(this,"capabilityProps")}attributeChangedCallback(r,o,s){r==="view"&&o!==s&&this.__root&&this.render()}render(){this.__root?.render(t(Nl,{element:this}))}connectedCallback(){this.__root||(this.__root=hr(this)),this.render()}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null)})}};ra(Lt,"observedAttributes",["view"]);var Es="marinara-capability-card-editor";customElements.get(Es)||customElements.define(Es,Lt);
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs:
lucide-react/dist/esm/shared/src/utils/toLucideIconData.mjs:
lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs:
lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs:
lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs:
lucide-react/dist/esm/shared/src/build/defaultAttributes.mjs:
lucide-react/dist/esm/shared/src/build/buildLucideIconNode.mjs:
lucide-react/dist/esm/shared/src/build/buildLucideIconForReact.mjs:
lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs:
lucide-react/dist/esm/context.mjs:
lucide-react/dist/esm/Icon.mjs:
lucide-react/dist/esm/createLucideIcon.mjs:
lucide-react/dist/esm/icons/arrow-down.mjs:
lucide-react/dist/esm/icons/arrow-up.mjs:
lucide-react/dist/esm/icons/check.mjs:
lucide-react/dist/esm/icons/chevron-down.mjs:
lucide-react/dist/esm/icons/chevron-left.mjs:
lucide-react/dist/esm/icons/chevron-right.mjs:
lucide-react/dist/esm/icons/plus.mjs:
lucide-react/dist/esm/icons/square-pen.mjs:
lucide-react/dist/esm/icons/trash.mjs:
lucide-react/dist/esm/icons/x.mjs:
lucide-react/dist/esm/lucide-react.mjs:
  (**
   * @license lucide-react v1.61.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
