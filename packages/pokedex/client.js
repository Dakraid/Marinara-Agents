var Ue=Object.defineProperty;var Ee=(a,e,o)=>e in a?Ue(a,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):a[e]=o;var D=(a,e,o)=>Ee(a,typeof e!="symbol"?e+"":e,o);var _=globalThis.__MARINARA_HOST__,l=_&&_.version===1&&_.modules?_.modules.react:void 0;if(!l)throw new Error("Marinara Engine does not provide react; this package needs capability API 1.341 or newer.");var Ia=l.Activity,ga=l.Children,ha=l.Component,Ca=l.Fragment,Sa=l.Profiler,ka=l.PureComponent,Pa=l.StrictMode,wa=l.Suspense,ya=l.ViewTransition,ba=l.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Aa=l.__COMPILER_RUNTIME,Ma=l.act,Ba=l.addTransitionType,Ra=l.cache,Da=l.cacheSignal,Fa=l.captureOwnerStack,Ta=l.cloneElement,de=l.createContext,q=l.createElement,va=l.createRef,ue=l.default,K=l.forwardRef,qa=l.isValidElement,Oa=l.lazy,Ua=l.memo,Ea=l.startTransition,Ha=l.unstable_useCacheRefresh,Ga=l.use,Na=l.useActionState,Va=l.useCallback,le=l.useContext,za=l.useDebugValue,Wa=l.useDeferredValue,B=l.useEffect,Xa=l.useEffectEvent,_a=l.useId,Ka=l.useImperativeHandle,Qa=l.useInsertionEffect,$a=l.useLayoutEffect,se=l.useMemo,Za=l.useOptimistic,Ja=l.useReducer,F=l.useRef,S=l.useState,ja=l.useSyncExternalStore,Ya=l.useTransition,et=l.version;var Q=globalThis.__MARINARA_HOST__,O=Q&&Q.version===1&&Q.modules?Q.modules["react-dom/client"]:void 0;if(!O)throw new Error("Marinara Engine does not provide react-dom/client; this package needs capability API 1.341 or newer.");var fe=O.createRoot,tt=O.default,ot=O.hydrateRoot,rt=O.version;var $=globalThis.__MARINARA_HOST__,r=$&&$.version===1&&$.modules?$.modules["@tanstack/react-query"]:void 0;if(!r)throw new Error("Marinara Engine does not provide @tanstack/react-query; this package needs capability API 1.341 or newer.");var ut=r.CancelledError,lt=r.HydrationBoundary,st=r.InfiniteQueryObserver,ft=r.IsRestoringProvider,it=r.Mutation,nt=r.MutationCache,ct=r.MutationObserver,pt=r.QueriesObserver,mt=r.Query,Lt=r.QueryCache,ie=r.QueryClient,xt=r.QueryClientContext,ne=r.QueryClientProvider,It=r.QueryErrorResetBoundary,gt=r.QueryObserver,ht=r.dataTagErrorSymbol,Ct=r.dataTagSymbol,St=r.defaultScheduler,kt=r.defaultShouldDehydrateMutation,Pt=r.defaultShouldDehydrateQuery,wt=r.dehydrate,yt=r.dehydrateQuery,bt=r.environmentManager,At=r.experimental_streamedQuery,Mt=r.focusManager,Bt=r.hashKey,Rt=r.hydrate,Dt=r.infiniteQueryOptions,Ft=r.isCancelledError,Tt=r.isServer,vt=r.keepPreviousData,qt=r.matchMutation,Ot=r.matchQuery,Ut=r.mutationOptions,Et=r.noop,Ht=r.notifyManager,Gt=r.onlineManager,Nt=r.partialMatchKey,Vt=r.queryOptions,zt=r.replaceEqualDeep,Wt=r.shouldThrowError,Xt=r.skipToken,_t=r.timeoutManager,Kt=r.unsetMarker,Qt=r.useInfiniteQuery,$t=r.useIsFetching,Zt=r.useIsMutating,Jt=r.useIsRestoring,jt=r.useMutation,Yt=r.useMutationState,eo=r.usePrefetchInfiniteQuery,ao=r.usePrefetchQuery,to=r.useQueries,T=r.useQuery,oo=r.useQueryClient,ro=r.useQueryErrorResetBoundary,uo=r.useSuspenseInfiniteQuery,lo=r.useSuspenseQueries,so=r.useSuspenseQuery;var ce={_meta:{locale:"en",direction:"ltr"},"pokedex.error.interface":"Pok\xE9dex stopped.","pokedex.error.retry":"Try again","pokedex.error.noChat":"Open a Roleplay chat to use the Pok\xE9dex.","pokedex.settings.autoScan":"Auto-scan new Pok\xE9mon","pokedex.settings.autoScanHelp":"Generate a full Pok\xE9dex entry the first time a Pok\xE9mon physically appears or is directly interacted with.","pokedex.settings.injectTrackerContext":"Inject tracker context","pokedex.settings.injectTrackerContextHelp":"Add the active harem, pregnancies, and recent encounters to the prompt every roleplay turn.","pokedex.settings.renderScanCards":"Render scan cards in chat","pokedex.settings.renderScanCardsHelp":"Append the generated Pok\xE9dex card to the assistant message that introduced the Pok\xE9mon.","pokedex.settings.maxRecentEncounters":"Recent encounters kept","pokedex.settings.maxRecentEncountersHelp":"How many recent encounters are remembered and injected, from 3 to 25.","pokedex.toolbar.label":"Pok\xE9dex","pokedex.toolbar.ariaLabel":"Pok\xE9dex tracker, {{count}} scanned","pokedex.toolbar.open":"Open the tracker panel","pokedex.tracker.title":"Pok\xE9dex","pokedex.tracker.loading":"Loading Pok\xE9dex\u2026","pokedex.tracker.error":"Could not load the Pok\xE9dex.","pokedex.tracker.scanned":"{{count}} scanned","pokedex.tracker.harem":"Active harem","pokedex.tracker.haremEmpty":"No active harem members","pokedex.tracker.relationship":"Relationship","pokedex.tracker.affection":"Affection","pokedex.tracker.lastInteraction":"Last interaction","pokedex.tracker.status":"Status/location","pokedex.tracker.removeMember":"Remove from harem","pokedex.tracker.removeMemberTitle":"Remove from harem?","pokedex.tracker.removeMemberMessage":"{{name}} leaves the active harem. Their Pok\xE9dex entry stays in the collection.","pokedex.tracker.pregnancy":"Pregnancy status","pokedex.tracker.pregnancyEmpty":"No current pregnancies","pokedex.tracker.eggsExpected":"{{count}} eggs expected","pokedex.tracker.bred":"bred {{when}}","pokedex.tracker.sire":"sire: {{name}}","pokedex.tracker.markLaid":"Mark laid","pokedex.tracker.markLaidTitle":"Mark eggs as laid?","pokedex.tracker.markLaidMessage":"{{name}}'s pregnancy is resolved and removed from the tracker.","pokedex.tracker.encounters":"Recent encounters","pokedex.tracker.encountersEmpty":"No recent encounters","pokedex.tracker.outcome.met":"met","pokedex.tracker.outcome.joined":"joined","pokedex.tracker.outcome.left":"left","pokedex.tracker.outcome.battled":"battled","pokedex.tracker.outcome.fled":"fled","pokedex.tracker.collection":"Pok\xE9dex collection","pokedex.tracker.collectionEmpty":"No Pok\xE9mon scanned yet. New Pok\xE9mon are scanned automatically the first time they appear in the story.","pokedex.tracker.deleteEntry":"Delete entry","pokedex.tracker.deleteEntryTitle":"Delete Pok\xE9dex entry?","pokedex.tracker.deleteEntryMessage":"This permanently removes {{name}} from this chat's Pok\xE9dex, harem, pregnancies, and encounters.","pokedex.card.general":"### GENERAL ###","pokedex.card.sexual":"### SEXUAL ###","pokedex.card.category":"Category","pokedex.card.gender":"Gender","pokedex.card.gender.male":"Male","pokedex.card.gender.female":"Female","pokedex.card.gender.futanari":"Futanari","pokedex.card.archetype":"Archetype","pokedex.card.speech":"Speech","pokedex.card.height":"Height","pokedex.card.weight":"Weight","pokedex.card.knowledge":"Knowledge","pokedex.card.details":"Details","pokedex.card.evolutionRequirement":"Evolution","pokedex.card.affection":"Affection","pokedex.card.heat":"Heat","pokedex.time.justNow":"just now","pokedex.time.minutesAgo":"{{count}}m ago","pokedex.time.hoursAgo":"{{count}}h ago","pokedex.time.daysAgo":"{{count}}d ago"};var Z=globalThis.__MARINARA_HOST__,U=Z&&Z.version===1&&Z.modules?Z.modules["react/jsx-runtime"]:void 0;if(!U)throw new Error("Marinara Engine does not provide react/jsx-runtime; this package needs capability API 1.341 or newer.");var ae=U.Fragment,no=U.default,t=U.jsx,s=U.jsxs;function Ge(a){return Object.fromEntries(Object.entries(a).filter(([e,o])=>e!=="_meta"&&typeof o=="string"))}var E={en:Ge(ce)};function pe(a){return a?.trim().replaceAll("_","-")||"en"}function Ne(a){let e=E[a]??E[a.toLowerCase()];return e||(E[a.split("-")[0].toLowerCase()]??E.en)}function Ve(a,e){return e?a.replaceAll(/\{\{([A-Za-z0-9_]+)\}\}/g,(o,d)=>{let f=e[d];return f==null?o:String(f)}):a}function J(a,e,o){let d=Ne(pe(a?.locale));return Ve(d[e]??E.en[e]??e,o)}var me=de({direction:"ltr",t:(a,e)=>J(void 0,a,e)});function Le({localization:a,children:e}){let o=pe(a?.locale),d=a?.direction==="rtl"?"rtl":"ltr",f=se(()=>({direction:d,t:(i,p)=>J({locale:o},i,p)}),[d,o]);return t(me.Provider,{value:f,children:t("div",{dir:d,style:{display:"contents"},children:e})})}function k(){return le(me)}var ze="/api/pokedex",We="x-marinara-csrf";var Xe="marinara_admin_secret";function _e(){if(typeof window>"u")return{};try{let a=window.localStorage.getItem(Xe)?.trim();return a?{"X-Admin-Secret":a}:{}}catch{return{}}}async function H(a,e="GET",o,d){let f=new Headers(_e());e!=="GET"&&f.set(We,"1"),o!==void 0&&f.set("Content-Type","application/json");let i=await fetch(`${ze}${a}`,{method:e,headers:f,signal:d,cache:"no-store",credentials:"same-origin",...o===void 0?{}:{body:JSON.stringify(o)}});if(!i.ok){let p=await i.json().catch(()=>null),L=typeof p?.error=="string"?p.error:typeof p?.message=="string"?p.message:i.statusText;throw new Error(L||"Pok\xE9dex request failed")}return i.json()}function G(a,e){return`/chats/${encodeURIComponent(a)}${e}`}function v(a,e){return H(G(a,"/state"),"GET",void 0,e)}function xe(a,e){return H(G(a,"/settings"),"PATCH",e)}function Ie(a,e){return H(G(a,`/dex/${encodeURIComponent(e)}`),"DELETE")}function ge(a,e){return H(G(a,`/harem/${encodeURIComponent(e)}/remove`),"POST")}function he(a,e){return H(G(a,`/pregnancies/${encodeURIComponent(e)}/resolve`),"POST")}var j=Object.freeze({autoScan:!0,injectTrackerContext:!0,renderScanCards:!0,maxRecentEncounters:10});var Ke=[{key:"autoScan",label:"pokedex.settings.autoScan",help:"pokedex.settings.autoScanHelp"},{key:"injectTrackerContext",label:"pokedex.settings.injectTrackerContext",help:"pokedex.settings.injectTrackerContextHelp"},{key:"renderScanCards",label:"pokedex.settings.renderScanCards",help:"pokedex.settings.renderScanCardsHelp"}],Se=3,ke=25;function Ce(a){return{...a,maxRecentEncounters:Math.min(ke,Math.max(Se,Math.trunc(a.maxRecentEncounters)||j.maxRecentEncounters))}}function Pe({props:a}){let{t:e}=k(),{onDirtyChange:o}=a,d=a.chatId??"",[f,i]=S({...j}),[p,L]=S(!1),[I,m]=S(""),c=F(null),h=F({...j}),w=F(0),y=T({enabled:!!d,queryKey:["pokedex","state",d],queryFn:()=>v(d)});B(()=>{!y.data||c.current===d||(c.current=d,h.current=y.data.settings,w.current=0,i(y.data.settings),o?.(!1))},[d,o,y.data]);let M=g=>{let C={...h.current,...g};h.current=C,w.current+=1,i(C),m(""),o?.(!0)};return B(()=>{if(!d||c.current!==d||w.current===0)return;let g=w.current,C=window.setTimeout(()=>{let R=Ce(h.current);h.current=R,i(R),L(!0),xe(d,R).then(b=>{if(c.current===d&&w.current===g){let u=b.settings??R;h.current=u,w.current=0,i(u),o?.(!1)}}).catch(b=>m(b instanceof Error?b.message:String(b))).finally(()=>L(!1))},500);return()=>window.clearTimeout(C)},[d,o,f]),!d||a.chatMode!=="roleplay"?t("div",{className:"pd-shell pd-status",children:e("pokedex.error.noChat")}):s("section",{className:"pd-shell pd-stack",children:[Ke.map(g=>s("label",{className:"pd-check",children:[t("input",{type:"checkbox",checked:f[g.key],disabled:p,onChange:C=>M({[g.key]:C.target.checked})}),s("span",{className:"pd-check-copy",children:[t("strong",{children:e(g.label)}),t("small",{children:e(g.help)})]})]},g.key)),s("label",{className:"pd-number-field",children:[s("span",{className:"pd-number-copy",children:[t("strong",{children:e("pokedex.settings.maxRecentEncounters")}),t("small",{children:e("pokedex.settings.maxRecentEncountersHelp")})]}),t("input",{className:"mari-chrome-field pd-field pd-number-input",type:"number",min:Se,max:ke,step:1,disabled:p,value:f.maxRecentEncounters,onChange:g=>{let C=Number.parseInt(g.target.value,10);Number.isFinite(C)&&M({maxRecentEncounters:C})},onBlur:()=>M({maxRecentEncounters:Ce(h.current).maxRecentEncounters})})]}),I?t("div",{className:"pd-status",role:"status",children:I}):null]})}var Qe='[data-tracker-panel-toggle="roleplay-hud"]',$e='[data-component="TrackerDataSidebar"]';function Ze(){let a=document.querySelector(Qe);if(a){a.click();return}let e=document.querySelector($e);if(!e)return;e.scrollIntoView({block:"nearest"}),e.querySelector("button, [href], [tabindex]")?.focus()}function we({props:a}){let{t:e}=k(),o=a.chatId??"",d=a.chatMode==="roleplay"&&!!o,[f,i]=S(!1),p=F(null),L=T({enabled:d,queryKey:["pokedex","state",o],queryFn:()=>v(o),refetchInterval:2500}),I=L.data?Object.keys(L.data.dex).length:0,m=L.data?.latestScan?.at??null;return B(()=>{if(!m)return;if(p.current===null){p.current=m;return}if(p.current===m)return;p.current=m,i(!0);let c=window.setTimeout(()=>i(!1),2600);return()=>window.clearTimeout(c)},[m]),d?t("div",{className:"pd-shell pd-toolbar",children:s("button",{type:"button",className:`${a.toolbarButtonClass??"mari-chrome-control mari-chrome-control--small pd-toolbar-button--fallback"} pd-toolbar-button${f?" pd-toolbar-button--pulse":""}`,title:e("pokedex.toolbar.open"),"aria-label":e("pokedex.toolbar.ariaLabel",{count:I}),onClick:Ze,children:[t("span",{className:"pd-toolbar-label","aria-hidden":"true",children:e("pokedex.toolbar.label")}),I>0?t("span",{className:"pd-toolbar-badge","aria-hidden":"true",children:I}):null]})}):null}var ye=a=>a.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Je=a=>a.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,o,d)=>d?d.toUpperCase():o.toLowerCase()),te=a=>{let e=Je(a);return e.charAt(0).toUpperCase()+e.slice(1)},Y=(...a)=>a.filter((e,o,d)=>!!e&&e.trim()!==""&&d.indexOf(e)===o).join(" ").trim(),be=a=>{for(let e in a)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};var Ae={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var Me=K(({color:a="currentColor",size:e=24,strokeWidth:o=2,absoluteStrokeWidth:d,className:f="",children:i,iconNode:p,...L},I)=>q("svg",{ref:I,...Ae,width:e,height:e,stroke:a,strokeWidth:d?Number(o)*24/Number(e):o,className:Y("lucide",f),...!i&&!be(L)&&{"aria-hidden":"true"},...L},[...p.map(([m,c])=>q(m,c)),...Array.isArray(i)?i:[i]]));var P=(a,e)=>{let o=K(({className:d,...f},i)=>q(Me,{ref:i,iconNode:e,className:Y(`lucide-${ye(te(a))}`,`lucide-${a}`,d),...f}));return o.displayName=te(a),o};var je=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],N=P("book-open",je);var Ye=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],V=P("chevron-down",Ye);var ea=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],A=P("loader-circle",ea);var aa=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],z=P("refresh-cw",aa);var ta=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],W=P("trash-2",ta);function Re(a){return a==="male"?"\u2642":a==="female"?"\u2640":"\u26A5"}function oa(a,e){return a==="male"?`${e("pokedex.card.gender.male")} \u2642`:a==="female"?`${e("pokedex.card.gender.female")} \u2640`:`${e("pokedex.card.gender.futanari")} \u26A5`}function X(a,e,o){let d=Number.isFinite(a)?Math.max(0,Math.min(5,Math.trunc(a))):0;return e.repeat(d)+o.repeat(5-d)}function Be(a){return Number.isInteger(a)?String(a):String(Math.round(a*100)/100)}var ra={width:"100%",boxSizing:"border-box",border:"2px solid #232328",borderRadius:"8px",padding:"8px",textAlign:"center",fontFamily:"Consolas,monaco,monospace",color:"#fff",backgroundColor:"#111114",backgroundImage:"url(https://files.catbox.moe/xu0jxk.png)",backgroundSize:"cover",backgroundPosition:"center"},da={display:"block",width:"50%",height:"auto",margin:"0 auto"},ua={fontSize:"20px",fontWeight:"bold",color:"#fff"},la={margin:"8px 0",whiteSpace:"pre-wrap",textAlign:"left",font:"inherit",lineHeight:1.35},sa={margin:"8px 0",textAlign:"left",color:"#e0115f",lineHeight:1.4},fa={border:0,borderTop:"1px solid #232328",margin:"8px 0"},ia={fontStyle:"italic"},na={marginTop:"6px",fontWeight:"bold"};function De({entry:a}){let{t:e}=k(),o=Math.max(1,Math.min(1025,Math.trunc(a.dexNumber))),d=String(o).padStart(3,"0"),f=X(a.affection.rating,"\u2764\uFE0F","\u{1F494}"),i=X(a.heat.rating,"\u{1F525}","\u25B3"),p=X(a.starRating,"\u2605","\u2606"),L=[e("pokedex.card.general"),`${e("pokedex.card.category")}: "${a.category}"`,`${e("pokedex.card.gender")}: "${oa(a.gender,e)}"`,`${e("pokedex.card.archetype")}: "${a.archetype}"`,`${e("pokedex.card.speech")}: "${a.speech}"`,`${e("pokedex.card.height")}: ${Be(a.heightM)} m`,`${e("pokedex.card.weight")}: ${Be(a.weightKg)} kg`].join(`
`),I=[e("pokedex.card.sexual"),`${e("pokedex.card.knowledge")}: "${a.sexualKnowledge}"`,`${e("pokedex.card.details")}: "${a.anatomicalDetails}"`,`${e("pokedex.card.evolutionRequirement")}: "${a.evolutionRequirement}"`].join(`
`);return s("div",{className:"pd-card",style:ra,children:[t("img",{src:`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${d}.png`,alt:a.species,style:da,loading:"lazy"}),s("div",{style:ua,children:[a.name," #",o]}),t("pre",{style:la,children:`${L}

${I}`}),s("div",{style:sa,children:[s("div",{children:[e("pokedex.card.affection"),": ",f," (",a.affection.state,")"]}),s("div",{children:["\u21B3 ",a.affection.cause]}),s("div",{children:[e("pokedex.card.heat"),": ",i," (",a.heat.state,")"]}),s("div",{children:["\u21B3 ",a.heat.advice]})]}),t("hr",{style:fa}),s("div",{style:ia,children:["\u201C",a.trainerReview,"\u201D"]}),s("div",{style:na,children:[p," (",a.verdict.toUpperCase(),")"]})]})}function Fe(a,e){let o=Date.parse(a);if(Number.isNaN(o))return a;let d=Math.max(0,Math.floor((Date.now()-o)/1e3));if(d<60)return e("pokedex.time.justNow");let f=Math.floor(d/60);if(f<60)return e("pokedex.time.minutesAgo",{count:f});let i=Math.floor(f/60);return i<24?e("pokedex.time.hoursAgo",{count:i}):e("pokedex.time.daysAgo",{count:Math.floor(i/24)})}function oe(a,e){return a.dex[e]??null}function Te({props:a}){let{t:e}=k(),o=a.chatId??"",d=a.chatMode==="roleplay"&&!!o,f=a.mobileCompact===!0,[i,p]=S(!1),[L,I]=S(""),m=T({enabled:d,queryKey:["pokedex","state",o],queryFn:()=>v(o),refetchInterval:2500}),c=m.data??null,h=c?Object.values(c.dex).sort((u,n)=>u.dexNumber-n.dexNumber):[],w=c?[...c.recentEncounters].sort((u,n)=>n.at.localeCompare(u.at)):[],y=async(u,n,x)=>a.confirmAction?a.confirmAction({title:u,message:n,confirmLabel:x,tone:"destructive"}):window.confirm(n),M=async u=>{I("");try{await u(),await m.refetch()}catch(n){I(n instanceof Error?n.message:String(n))}},g=async(u,n)=>{await y(e("pokedex.tracker.removeMemberTitle"),e("pokedex.tracker.removeMemberMessage",{name:n}),e("pokedex.tracker.removeMember"))&&await M(()=>ge(o,u))},C=async(u,n)=>{await y(e("pokedex.tracker.markLaidTitle"),e("pokedex.tracker.markLaidMessage",{name:n}),e("pokedex.tracker.markLaid"))&&await M(()=>he(o,u))},R=async(u,n)=>{await y(e("pokedex.tracker.deleteEntryTitle"),e("pokedex.tracker.deleteEntryMessage",{name:n}),e("pokedex.tracker.deleteEntry"))&&await M(()=>Ie(o,u))};if(!d)return null;let b=s(ae,{children:[f?null:t("span",{className:"pd-tracker-chevron-frame","aria-hidden":"true",children:t(V,{className:`pd-tracker-chevron${i?" pd-tracker-chevron--collapsed":""}`})}),t("span",{className:"pd-tracker-icon","aria-hidden":"true",children:t(N,{className:"pd-tracker-panel-icon"})}),t("strong",{className:"pd-tracker-title",children:e("pokedex.tracker.title")}),h.length>0?t("span",{className:"pd-tracker-count","aria-hidden":"true",children:e("pokedex.tracker.scanned",{count:h.length})}):null]});return s("section",{className:`pd-shell pd-tracker${f?" pd-tracker--mobile-compact":""}`,"aria-label":e("pokedex.tracker.title"),children:[f?null:t("div",{className:"pd-tracker-veil","aria-hidden":"true"}),s("div",{className:"pd-tracker-content",children:[t("div",{className:"pd-tracker-header",children:f?t("div",{className:"pd-tracker-toggle pd-tracker-toggle--static",children:b}):t("button",{type:"button",className:"pd-tracker-toggle","aria-expanded":!i,"aria-label":e("pokedex.tracker.title"),onClick:()=>p(u=>!u),children:b})}),f||!i?s("div",{className:"pd-tracker-body",children:[m.isPending?s("div",{className:"pd-status",role:"status",children:[t(A,{className:"pd-icon pd-spin","aria-hidden":"true"}),e("pokedex.tracker.loading")]}):m.isError||!c?s("div",{className:"pd-status pd-status--error",role:"alert",children:[t("span",{children:m.error instanceof Error?m.error.message:e("pokedex.tracker.error")}),s("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small","aria-label":e("pokedex.error.retry"),onClick:()=>{m.refetch()},children:[t(z,{className:"pd-icon","aria-hidden":"true"}),e("pokedex.error.retry")]})]}):s(ae,{children:[s("section",{className:"pd-section","aria-labelledby":"pd-harem-heading",children:[t("h3",{className:"pd-section-heading",id:"pd-harem-heading",children:e("pokedex.tracker.harem")}),c.harem.length===0?t("p",{className:"pd-empty",children:e("pokedex.tracker.haremEmpty")}):t("ul",{className:"pd-tree",children:c.harem.map(u=>{let n=oe(c,u.key),x=n?.name??u.key;return s("li",{className:"pd-tree-member",children:[s("div",{className:"pd-tree-row",children:[s("span",{className:"pd-tree-name",children:[x,n?` #${n.dexNumber}`:"",n?` | ${Re(n.gender)}`:""]}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small pd-action","aria-label":`${e("pokedex.tracker.removeMember")}: ${x}`,onClick:()=>{g(u.key,x)},children:e("pokedex.tracker.removeMember")})]}),s("div",{className:"pd-tree-sub",children:[e("pokedex.tracker.relationship"),": ",u.relationshipStatus]}),n?s("div",{className:"pd-tree-sub",children:[e("pokedex.tracker.affection"),":"," ",X(n.affection.rating,"\u2764\uFE0F","\u{1F494}")," (",n.affection.state,")"]}):null,s("div",{className:"pd-tree-sub",children:[e("pokedex.tracker.lastInteraction"),": ",u.lastInteraction]}),s("div",{className:"pd-tree-sub",children:[e("pokedex.tracker.status"),": ",u.currentStatus]})]},u.key)})})]}),s("section",{className:"pd-section","aria-labelledby":"pd-pregnancy-heading",children:[t("h3",{className:"pd-section-heading",id:"pd-pregnancy-heading",children:e("pokedex.tracker.pregnancy")}),c.pregnancies.length===0?t("p",{className:"pd-empty",children:e("pokedex.tracker.pregnancyEmpty")}):t("ul",{className:"pd-tree",children:c.pregnancies.map(u=>{let x=oe(c,u.key)?.name??u.key;return s("li",{className:"pd-tree-member",children:[s("div",{className:"pd-tree-row",children:[t("span",{className:"pd-tree-name",children:x}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small pd-action","aria-label":`${e("pokedex.tracker.markLaid")}: ${x}`,onClick:()=>{C(u.key,x)},children:e("pokedex.tracker.markLaid")})]}),s("div",{className:"pd-tree-sub",children:[e("pokedex.tracker.eggsExpected",{count:u.eggsExpected})," \xB7"," ",t("span",{title:u.bredAt,children:e("pokedex.tracker.bred",{when:Fe(u.bredAt,e)})})," ","\xB7 ",e("pokedex.tracker.sire",{name:u.sire})]})]},u.key)})})]}),s("section",{className:"pd-section","aria-labelledby":"pd-encounters-heading",children:[t("h3",{className:"pd-section-heading",id:"pd-encounters-heading",children:e("pokedex.tracker.encounters")}),w.length===0?t("p",{className:"pd-empty",children:e("pokedex.tracker.encountersEmpty")}):t("ul",{className:"pd-tree",children:w.map((u,n)=>{let x=oe(c,u.key),Oe=x?.name??u.key;return s("li",{className:"pd-tree-row",children:[s("span",{className:"pd-tree-name",children:[Oe,x?` #${x.dexNumber}`:""]}),s("span",{className:"pd-tree-detail",children:[e(`pokedex.tracker.outcome.${u.outcome}`)," \xB7"," ",t("span",{title:u.at,children:Fe(u.at,e)})]})]},`${u.key}-${u.at}-${n}`)})})]}),s("section",{className:"pd-section","aria-labelledby":"pd-collection-heading",children:[t("h3",{className:"pd-section-heading",id:"pd-collection-heading",children:e("pokedex.tracker.collection")}),h.length===0?t("p",{className:"pd-empty",children:e("pokedex.tracker.collectionEmpty")}):t("div",{className:"pd-card-grid",children:h.map(u=>s("div",{className:"pd-card-frame",children:[t(De,{entry:u}),t("div",{className:"pd-card-actions",children:t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small pd-icon-button",title:e("pokedex.tracker.deleteEntry"),"aria-label":`${e("pokedex.tracker.deleteEntry")}: ${u.name}`,onClick:()=>{R(u.key,u.name)},children:t(W,{className:"pd-icon","aria-hidden":"true"})})})]},u.key))})]})]}),L?t("div",{className:"pd-status",role:"status",children:L}):null]}):null]})]})}var ve=`
.pd-shell {
  --pd-chroma: var(--marinara-chat-chrome-accent, var(--foreground));
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

.pd-panel {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--card);
  padding: 0.75rem;
}

.pd-stack {
  display: grid;
  gap: 0.65rem;
}

.pd-field {
  box-sizing: border-box;
  width: 100%;
  padding: 0.5rem 0.625rem;
  font: inherit;
  font-size: 0.75rem;
}

.pd-number-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--muted-foreground);
}

.pd-number-copy {
  display: grid;
  min-width: 0;
  gap: 0.125rem;
}

.pd-number-copy strong {
  color: var(--foreground);
  font-size: 0.625rem;
  font-weight: 500;
}

.pd-number-copy small {
  color: var(--muted-foreground);
  font-size: 0.59375rem;
  line-height: 1.35;
}

.pd-number-input {
  height: 2.25rem;
  min-height: 2.25rem;
  font-variant-numeric: tabular-nums;
}

.pd-check {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--muted-foreground);
  font-size: 0.625rem;
}

.pd-check input[type="checkbox"] {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  margin: 0.125rem 0 0;
  accent-color: var(--pd-chroma);
  cursor: pointer;
}

.pd-check input[type="checkbox"]:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.pd-check input[type="checkbox"]:disabled {
  cursor: default;
  opacity: 0.4;
}

.pd-check-copy {
  display: grid;
  min-width: 0;
  gap: 0.125rem;
}

.pd-check-copy strong {
  color: var(--foreground);
  font-weight: 500;
}

.pd-check-copy small {
  font-size: 0.59375rem;
  line-height: 1.35;
}

.pd-status {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--muted);
  padding: 0.5rem 0.6rem;
  font-size: 0.7rem;
}

.pd-status--error {
  justify-content: space-between;
}

.pd-icon {
  width: 0.75rem;
  height: 0.75rem;
  flex: none;
}

.pd-spin {
  animation: pd-spin 0.8s linear infinite;
}

.pd-toolbar {
  display: inline-flex;
  flex: none;
}

.pd-toolbar-button {
  position: relative;
  box-sizing: border-box;
  flex: none;
  overflow: visible;
}

.pd-toolbar-button--fallback {
  width: 2rem;
  min-width: 2rem;
  height: 2rem;
  padding: 0.25rem;
}

.pd-toolbar-label {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font-size: 0.375rem;
  font-weight: 600;
  line-height: 0.5rem;
  letter-spacing: -0.02em;
  text-align: center;
  white-space: nowrap;
}

.pd-toolbar-badge {
  position: absolute;
  top: -0.3125rem;
  right: -0.3125rem;
  display: flex;
  min-width: 0.8125rem;
  height: 0.8125rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--marinara-chat-chrome-panel-bg, transparent);
  border-radius: 999px;
  background: var(--marinara-chat-chrome-button-bg-active, var(--muted));
  padding: 0 0.1875rem;
  color: var(--marinara-chat-chrome-button-text-active, var(--foreground));
  font-size: 0.5rem;
  font-weight: 700;
  line-height: 1;
  pointer-events: none;
}

.pd-toolbar-button--pulse {
  animation: pd-toolbar-pulse 0.9s ease-out 3;
}

.pd-tracker {
  position: relative;
  z-index: 10;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  background: var(--tracker-panel-section-background, color-mix(in srgb, var(--card) 5%, transparent));
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--foreground) 5%, transparent);
}

.pd-tracker-veil {
  position: absolute;
  z-index: 0;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--background) var(--tracker-profile-contrast-strong-top, 40%), transparent) 0%,
    color-mix(in srgb, var(--card) var(--tracker-profile-contrast-strong-mid, 30%), transparent) 52%,
    color-mix(in srgb, var(--background) var(--tracker-profile-contrast-strong-bottom, 42%), transparent) 100%
  );
}

.pd-tracker-content {
  position: relative;
  z-index: 10;
}

.pd-tracker-header {
  display: flex;
  min-height: 1.75rem;
  align-items: center;
  border-bottom: 1px solid color-mix(in srgb, var(--border) 42%, transparent);
  padding: 0.125rem 0.25rem;
}

.pd-tracker-toggle {
  box-sizing: border-box;
  display: flex;
  min-width: 0;
  width: 100%;
  flex: 1;
  align-self: stretch;
  align-items: center;
  gap: 0.25rem;
  border: 0;
  border-radius: 0.125rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.pd-tracker-toggle:hover {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
}

.pd-tracker-toggle:focus-visible {
  outline: 1px solid var(--border);
  outline-offset: -1px;
}

.pd-tracker-chevron-frame {
  display: flex;
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  align-items: center;
  justify-content: center;
}

.pd-tracker-chevron {
  width: 0.6875rem;
  height: 0.6875rem;
  flex: none;
  color: var(--tracker-profile-icon, var(--muted-foreground));
  opacity: 0.6;
  transition: transform 150ms ease;
}

.pd-tracker-chevron--collapsed {
  transform: rotate(-90deg);
}

.pd-tracker-icon {
  display: flex;
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  align-items: center;
  justify-content: center;
  color: var(--tracker-profile-icon, var(--muted-foreground));
  opacity: 0.75;
}

.pd-tracker-panel-icon {
  width: 0.6875rem;
  height: 0.6875rem;
}

.pd-tracker-title {
  min-width: 0;
  overflow: hidden;
  color: color-mix(in srgb, var(--foreground) 62%, transparent);
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 0.75rem;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.pd-tracker-count {
  flex: none;
  margin-left: auto;
  color: color-mix(in srgb, var(--foreground) 40%, transparent);
  font-size: 0.5625rem;
  font-weight: 500;
  line-height: 0.75rem;
  white-space: nowrap;
}

.pd-tracker-body {
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem;
}

.pd-section {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.pd-section-heading {
  margin: 0;
  color: color-mix(in srgb, var(--foreground) 55%, transparent);
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 0.75rem;
  text-transform: uppercase;
}

.pd-tree {
  display: grid;
  margin: 0;
  padding: 0;
  gap: 0.45rem;
  list-style: none;
}

.pd-tree-member {
  display: grid;
  gap: 0.125rem;
}

.pd-tree-row {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}

.pd-tree-name {
  min-width: 0;
  overflow: hidden;
  color: color-mix(in srgb, var(--foreground) 85%, transparent);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pd-tree-sub {
  padding-left: 0.75rem;
  color: color-mix(in srgb, var(--foreground) 62%, transparent);
  font-size: 0.625rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.pd-tree-detail {
  flex: none;
  color: color-mix(in srgb, var(--foreground) 45%, transparent);
  font-size: 0.59375rem;
  line-height: 1.3;
  white-space: nowrap;
}

.pd-action {
  flex: none;
  font-size: 0.5625rem;
}

.pd-empty {
  margin: 0;
  padding: 0.125rem 0;
  color: color-mix(in srgb, var(--foreground) 35%, transparent);
  font-size: 0.625rem;
  font-style: italic;
  line-height: 1.4;
}

.pd-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 0.5rem;
}

.pd-card-frame {
  position: relative;
  min-width: 0;
}

.pd-card {
  overflow-wrap: anywhere;
}

.pd-card-actions {
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 150ms ease;
}

.pd-card-frame:hover .pd-card-actions,
.pd-card-frame:focus-within .pd-card-actions {
  opacity: 1;
}

.pd-icon-button {
  width: 1.5rem;
  min-width: 1.5rem;
  height: 1.5rem;
  min-height: 1.5rem;
  padding: 0;
  background: color-mix(in srgb, var(--popover, #111114) 82%, transparent);
}

.pd-tracker--mobile-compact {
  border-bottom: 0;
  background: transparent;
  box-shadow: none;
}

.pd-tracker--mobile-compact .pd-tracker-header {
  min-height: 0;
  border-bottom: 0;
  padding: 0.5rem 0.75rem 0.25rem;
}

.pd-tracker--mobile-compact .pd-tracker-toggle--static {
  align-self: auto;
  cursor: default;
}

.pd-tracker--mobile-compact .pd-tracker-toggle--static:hover {
  background: transparent;
}

.pd-tracker--mobile-compact .pd-tracker-icon {
  color: var(--marinara-chat-chrome-button-text-active, var(--pd-chroma));
  opacity: 1;
}

.pd-tracker--mobile-compact .pd-tracker-body {
  padding: 0.25rem 0.75rem 0.5rem;
}

@media (hover: none) {
  .pd-card-actions {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pd-toolbar-button--pulse {
    animation: none;
  }

  .pd-tracker-chevron,
  .pd-card-actions {
    transition: none;
  }
}

@keyframes pd-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pd-toolbar-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--pd-chroma) 55%, transparent);
  }

  70% {
    box-shadow: 0 0 0 0.375rem transparent;
  }

  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}
`;var ca=new ie({defaultOptions:{queries:{retry:!1,staleTime:1e3}}}),re=class extends ue.Component{constructor(){super(...arguments);D(this,"state",{error:null})}static getDerivedStateFromError(o){return{error:o}}componentDidCatch(o){let d=o.message||J(this.props.element.capabilityProps?.localization,"pokedex.error.interface");this.props.element.capabilityRuntimeError=d,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:d},bubbles:!0})),console.error("Pok\xE9dex client capability stopped",o)}render(){return this.state.error?t(pa,{onRetry:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})}}):this.props.children}};function pa({onRetry:a}){let{t:e}=k();return s("div",{className:"pd-shell pd-panel pd-stack",role:"alert",children:[t("strong",{children:e("pokedex.error.interface")}),t("button",{type:"button",className:"mari-chrome-control mari-chrome-control--small",onClick:a,children:e("pokedex.error.retry")})]})}function ma({element:a}){let e=a.capabilityProps??{},o=a.getAttribute("view");return o==="settings"?t(Pe,{props:e}):o==="toolbar"?t(we,{props:e}):o==="tracker"?t(Te,{props:e}):null}function La({element:a}){let[,e]=S(0);return B(()=>{let o=()=>e(d=>d+1);return a.addEventListener("marinara-capability-props",o),()=>a.removeEventListener("marinara-capability-props",o)},[a]),s(Le,{localization:a.capabilityProps?.localization,children:[t("style",{children:ve}),t(re,{element:a,children:t(ma,{element:a})})]})}var ee=class extends HTMLElement{constructor(){super(...arguments);D(this,"__root",null);D(this,"capabilityProps");D(this,"capabilityRuntimeError")}attributeChangedCallback(o,d,f){o==="view"&&d!==f&&this.__root&&this.render()}render(){this.__root?.render(t(ne,{client:ca,children:t(La,{element:this})}))}connectedCallback(){this.__root||(this.__root=fe(this)),this.render()}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null)})}};D(ee,"observedAttributes",["view"]);var qe="marinara-capability-pokedex";customElements.get(qe)||customElements.define(qe,ee);
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/book-open.js:
lucide-react/dist/esm/icons/chevron-down.js:
lucide-react/dist/esm/icons/loader-circle.js:
lucide-react/dist/esm/icons/refresh-cw.js:
lucide-react/dist/esm/icons/trash-2.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.513.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
