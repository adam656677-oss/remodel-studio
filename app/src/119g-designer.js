/* ======================= Designer workspace (catalog dock, CAD toolbar, split views, view tabs) ======================= */
// Laid out like a classic kitchen-and-bath design program: menus and an icon bar on top, the catalog on the left
// (catalog list, picture, categories, "CODE > Description" items, Place / Move / Coords), drawing views in 1 to 4 panes,
// the CAD toolbar down the right side, view tabs along the bottom, and a status bar.
const libCode=it=>{if(it.code)return it.code;if(it.sku)return it.sku;const m=/\(([A-Z0-9][A-Z0-9 .\-\/]{1,14})\)/.exec(it.label||'');if(m)return m[1].replace(/\s+/g,'');
  return String(it.id).replace(/^(dc|c|a|p|f|d|w|t|v|km|my)-/,'').toUpperCase().replace(/[^A-Z0-9]+/g,'').slice(0,12);};
const DZ_DIRS=f=>Math.abs(f.y)>=Math.abs(f.x)?(f.y<0?'North':'South'):(f.x>0?'East':'West');
// every wall of every room, as an interior elevation (viewer stands in the room facing the wall)
function roomWalls(p,levelId){const out=[];
  for(const r of p.rooms.filter(r=>!levelId||r.level===levelId)){for(let i=0;i<r.pts.length;i++){const a={x:r.pts[i][0],y:r.pts[i][1]},b={x:r.pts[(i+1)%r.pts.length][0],y:r.pts[(i+1)%r.pts.length][1]};const L=dist(a,b);if(L<12)continue;
    const d={x:(b.x-a.x)/L,y:(b.y-a.y)/L};let n={x:-d.y,y:d.x};const mid={x:(a.x+b.x)/2+n.x*6,y:(a.y+b.y)/2+n.y*6};if(!inPoly(mid.x,mid.y,r.pts))n={x:-n.x,y:-n.y};
    const facing={x:-n.x,y:-n.y};let cov=0;for(const w of p.walls.filter(w=>w.level===r.level&&w.status!=='demolish')){const A={x:w.x1,y:w.y1},B={x:w.x2,y:w.y2};const pa=projSeg(A,a,b),pb=projSeg(B,a,b);const tol=w.thick/2+2;const dw=wdir(w);if(Math.abs(dw.x*d.y-dw.y*d.x)>0.05)continue;const ld=projSeg(a,A,B).d;if(ld>tol)continue;const t0=Math.max(0,Math.min(pa.tRaw,pb.tRaw)),t1=Math.min(1,Math.max(pa.tRaw,pb.tRaw));if(t1>t0)cov+=(t1-t0);}
    out.push({key:r.id+':'+i,room:r,i,a,b,L,n,facing,wall:Math.min(1,cov),label:`${r.name} · ${DZ_DIRS(facing).toLowerCase()} wall (${fmtLen(L)})`});}}
  return out;}
function elevIE(p,W){const r=W.room;const {a,b,L,n,facing}=W;const d={x:(b.x-a.x)/L,y:(b.y-a.y)/L};
  const fx=(p.fixtures||[]).filter(f=>f.level===r.level&&f.status!=='demolish'&&inPoly(f.x,f.y,r.pts));
  const on=fx.filter(f=>{const fr=fxFront(f);if(fr.x*n.x+fr.y*n.y<0.9)return false;const back={x:f.x-fr.x*f.d/2,y:f.y-fr.y*f.d/2};const pr=projSeg(back,a,b);return pr.d<10&&pr.tRaw>-0.05&&pr.tRaw<1.05;});
  const left={x:facing.y,y:-facing.x};const start=(d.x*left.x+d.y*left.y)>0?b:a;const dirLR=start===a?d:{x:-d.x,y:-d.y};
  const ops=p.openings.filter(o=>{const c=openingCenter(p,o);if(!c||c.w.level!==r.level)return false;const pr=projSeg(c,a,b);return pr.d<c.w.thick/2+1&&pr.tRaw>0&&pr.tRaw<1;});
  return {room:r,start,dir:dirLR,len:L,fixtures:on,openings:ops,facing,lv:lvlOf(p,r.level)};}
const DZ_SC=1/24; // drawing scale for on-screen elevations: 1/2" = 1'-0"
function dlBounds(items){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const A=(x,y)=>{if(!isFinite(x)||!isFinite(y))return;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);};
  for(const it of items){if(it.t==='line'){A(it.x1,it.y1);A(it.x2,it.y2);}else if(it.t==='poly')for(const q of it.pts)A(q[0],q[1]);else if(it.t==='circle'){A(it.cx-it.r,it.cy-it.r);A(it.cx+it.r,it.cy+it.r);}else if(it.t==='text'){const w=(it.s.length*it.size*0.55)/72;A(it.anchor==='middle'?it.x-w/2:it.anchor==='end'?it.x-w:it.x,it.y-it.size/72);A(it.anchor==='middle'?it.x+w/2:it.anchor==='end'?it.x:it.x+w,it.y);}}
  return {x0,y0,x1,y1};}
function dlBody(items){const s=sheetToSVGString({w:1,h:1,items});return s.slice(s.indexOf('/>',s.indexOf('<rect'))+2,s.lastIndexOf('</svg>'));}
// zoomable, pannable drawing that fits its pane
function DrawingSVG({B,body,hits=[],sel,onPick,label}){const pad=0.35;const full={x:B.x0-pad,y:B.y0-pad,w:B.x1-B.x0+2*pad,h:B.y1-B.y0+2*pad};const [vb,setVb]=useState(full);const ref=useRef(null);const drag=useRef(null);
  useEffect(()=>setVb(full),[B.x0,B.y0,B.x1,B.y1]);
  useEffect(()=>{const el=ref.current;if(!el)return;const wh=e=>{e.preventDefault();const r=el.getBoundingClientRect();setVb(v=>{const k=Math.exp(e.deltaY*0.0015);const sx=v.w/r.width,sy=v.h/r.height,s=Math.max(sx,sy);const mx=v.x+(e.clientX-r.left-(r.width-v.w/s)/2)*s,my=v.y+(e.clientY-r.top-(r.height-v.h/s)/2)*s;return {x:mx-(mx-v.x)*k,y:my-(my-v.y)*k,w:v.w*k,h:v.h*k};});};el.addEventListener('wheel',wh,{passive:false});return ()=>el.removeEventListener('wheel',wh);},[]);
  const down=e=>{if(e.target.closest('[data-hit]'))return;drag.current={x:e.clientX,y:e.clientY,v:vb};e.currentTarget.setPointerCapture(e.pointerId);};
  const move=e=>{const d=drag.current;if(!d)return;const r=ref.current.getBoundingClientRect();const s=Math.max(d.v.w/r.width,d.v.h/r.height);setVb({...d.v,x:d.v.x-(e.clientX-d.x)*s,y:d.v.y-(e.clientY-d.y)*s});};
  return html`<div className="dz-draw"><svg ref=${ref} className="dz-svg" viewBox=${`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} preserveAspectRatio="xMidYMid meet" onPointerDown=${down} onPointerMove=${move} onPointerUp=${()=>{drag.current=null;}} onDoubleClick=${()=>setVb(full)} aria-label=${label}>
    <rect x=${full.x-50} y=${full.y-50} width=${full.w+100} height=${full.h+100} fill="#ffffff"/><g dangerouslySetInnerHTML=${{__html:body}}/>
    ${hits.map(h=>html`<rect key=${h.id} data-hit=${h.id} x=${h.x} y=${h.y} width=${Math.max(0.02,h.w)} height=${Math.max(0.02,h.h)} className=${'dz-hit'+(sel&&sel.id===h.id?' on':'')} onClick=${()=>onPick&&onPick(h.id)}><title>${h.title}</title></rect>`)}</svg>
    <button className="btn dz-fit" onClick=${()=>setVb(full)} title="Fit (or double-click the drawing)">Fit</button></div>`;}
function ElevPane({p,wkey,sel,setSel,levelId}){const list=useMemo(()=>roomWalls(p),[p.rooms]);const W=list.find(w=>w.key===wkey)||list[0];
  const out=useMemo(()=>{if(!W)return null;const IE=elevIE(p,W);const dl=DL();try{drawInteriorElev(dl,p,IE,DZ_SC,0,0,1);}catch(e){console.error(e);}
    const H=IE.lv.height;const along=pt=>(pt.x-IE.start.x)*IE.dir.x+(pt.y-IE.start.y)*IE.dir.y;dl.text(IE.len*DZ_SC/2,-0.25,W.label.toUpperCase(),{size:9,anchor:'middle',bold:true});
    const hits=IE.fixtures.map(f=>{const s=along(f);const z0=f.elev||0;return {id:f.id,x:(s-f.w/2)*DZ_SC,y:(H-z0-f.h)*DZ_SC,w:f.w*DZ_SC,h:f.h*DZ_SC,title:f.name||(FIXTURES[f.type]||{}).label||f.type};});
    return {B:dlBounds(dl.items),body:dlBody(dl.items),hits,n:IE.fixtures.length};},[p,W&&W.key]);
  if(!W)return html`<div className="dz-empty">Draw a room to see its wall elevations.</div>`;
  return html`<${DrawingSVG} B=${out.B} body=${out.body} hits=${out.hits} sel=${sel} onPick=${id=>setSel({kind:'fixture',id})} label=${W.label}/>`;}
function ExtElevPane({p,view}){const out=useMemo(()=>{const dl=DL();try{const E=elevProject(p,elevFaces(p),view);if(!E.faces.length)return null;const sc=1/48;drawElevation(dl,p,E,sc,0,0,1);dl.text((E.u1-E.u0)*sc/2,-0.25,ELEV_VIEWS[view].title.toUpperCase(),{size:9,anchor:'middle',bold:true});}catch(e){console.error(e);return null;}
    return {B:dlBounds(dl.items),body:dlBody(dl.items)};},[p,view]);
  if(!out)return html`<div className="dz-empty">Draw walls to see the ${view} elevation.</div>`;
  return html`<${DrawingSVG} B=${out.B} body=${out.body} label=${ELEV_VIEWS[view].title}/>`;}
// ---------- bottom view tabs: what each plan pane shows ----------
const PLUMB_T=new Set(['toilet','lav','tub','shower','rollin','sinkbase','vanity','dw','washer','urinal','bidet','laundrysink','sink','waterheater','fountain']);
const isDecor=f=>{const it=f.lib&&LIB_BY_ID[f.lib];return !!(it&&it.model)||(FIXTURES[f.type]||{}).cat==='Furniture';};
const DZ_TABS=[
  ['all','All',{}],
  ['nodims','All (no dims)',{wallDims:false,dims:false}],
  ['cab','Cabinets',{fxOnly:f=>isCab(f)||['range','fridge','dw','hood'].includes(f.type)||CL_TYPES.has(f.type),elec:false,site:false,decks:false,roof:false,cabnums:false,issues:false,overlay:(p,lv,S,v)=>cabCalloutsSVG(p,lv,S,v)}],
  ['ctr','Countertops',{fxOnly:f=>COUNTERTOP.has(f.type),elec:false,site:false,roof:false,wallDims:false}],
  ['arch','Architecture',{fxOnly:()=>false,elec:false,counters:false}],
  ['elec','Electrical',{fxOnly:f=>!isDecor(f),dims:false}],
  ['plumb','Plumbing',{fxOnly:f=>PLUMB_T.has(f.type),elec:false,counters:false}],
  ['furn','Furniture',{fxOnly:f=>isDecor(f),elec:false,counters:false}],
  ['land','Landscape',{fxOnly:()=>false,elec:false,roomLabels:false,site:true,decks:true}],
  ['rfr','Roof framing',{fxOnly:()=>false,elec:false,counters:false,roomLabels:false,wallDims:false,dims:false,roof:false,issues:false,site:false,decks:false,overlay:(p,lv,S,v)=>roofFramingSVG(p,lv,S,v)}],
  ['ffr','Floor framing',{fxOnly:()=>false,elec:false,counters:false,roomLabels:false,wallDims:false,dims:false,roof:false,issues:false,site:false,decks:false,overlay:(p,lv,S,v)=>floorFramingSVG(p,lv,S,v)}],
  ['nkba','NKBA',{elec:false}],
  ['legend','Legend',{}],
  ['print','Print',{}],
];
// ---------- small icon set for the designer toolbar ----------
const DZI=(d,extra=null)=>html`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d=${d}/>${extra}</svg>`;
const DZ_IC={copy:DZI('M8 8h11v11H8zM5 16V5h11'),paste:DZI('M8 4h8v3H8zM6 6H4v15h16V6h-2'),dup:DZI('M4 4h10v10H4zM10 10h10v10H10z'),rot:DZI('M20 12a8 8 0 1 1-3-6.2M20 4v5h-5'),del:DZI('M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13'),
  fit:DZI('M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5'),l1:DZI('M4 4h16v16H4z'),l2:DZI('M4 4h16v16H4zM12 4v16'),l2h:DZI('M4 4h16v16H4zM4 12h16'),l3:DZI('M4 4h16v16H4zM12 4v16M12 12h8'),l4:DZI('M4 4h16v16H4zM12 4v16M4 12h16'),
  render:DZI('M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5'),pano:DZI('M3 12a9 4 0 1 0 18 0a9 4 0 1 0-18 0M12 3v18'),print:DZI('M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z'),walk:DZI('M13 4a1.5 1.5 0 1 0 0 .1M10 21l2-6 3 3v3M9 12l2-4 4 2 2 3M11 8l-3 3'),
  check:DZI('M4 12l5 5L20 6'),lib:DZI('M4 4h4v16H4zM10 4h4v16h-4zM16 5l3 1-3 14-3-1z'),insp:DZI('M4 5h16M4 12h16M4 19h10'),cab:DZI('M4 4h16v16H4zM12 4v16M9 11v2M15 11v2'),elev:DZI('M3 20h18M5 20V8h14v12M9 20v-6h6v6')};
// ---------- the workspace ----------
function DesignerView({D}){
  const {p,shown,commit,sel,setSel,tool,setTool,lv,setLevelId,say}=D;
  const ls=(k,d)=>{try{const v=localStorage.getItem('remodel-studio:dz-'+k);return v?JSON.parse(v):d;}catch(e){return d;}};const lsSet=(k,v)=>{try{localStorage.setItem('remodel-studio:dz-'+k,JSON.stringify(v));}catch(e){}};
  const [layout,setLayoutS]=useState(()=>ls('layout','2v'));const setLayout=v=>{setLayoutS(v);lsSet('layout',v);};
  const [views,setViewsS]=useState(()=>ls('views',['plan','3d','elev','ext:south']));const setViews=v=>{setViewsS(v);lsSet('views',v);};
  const [active,setActive]=useState(0);const [maxed,setMaxed]=useState(null);
  const [tab,setTab]=useState('all');const [dock,setDockS]=useState(()=>ls('dock',true));const setDock=v=>{setDockS(v);lsSet('dock',v);};
  const [insp,setInspS]=useState(()=>ls('insp',true));const setInsp=v=>{setInspS(v);lsSet('insp',v);};
  const [left,setLeftS]=useState(()=>ls('left','catalog'));const leftTab=v=>{if(dock&&left===v){setDock(false);return;}setLeftS(v);lsSet('left',v);setDock(true);};
  const [issuesOpen,setIssuesOpenS]=useState(()=>ls('issues',false));const setIssuesOpen=v=>{setIssuesOpenS(v);lsSet('issues',v);};
  const [colorBy,setColorByS]=useState(()=>ls('colorby',null));const setColorBy=v=>{setColorByS(v);lsSet('colorby',v);};
  const [naming,setNaming]=useState(false);const [slot,setSlot]=useState(()=>document.getElementById('rs-menuslot')||undefined);useLayoutEffect(()=>{if(!slot)setSlot(document.getElementById('rs-menuslot')||null);},[]);
  const nPanes={'1':1,'2v':2,'2h':2,'3':3,'4':4}[layout]||1;const shownIdx=maxed!=null?[maxed]:[...Array(nPanes).keys()];
  useEffect(()=>{if(!shownIdx.includes(active))setActive(shownIdx[0]);},[layout,maxed]);
  const cur=shownIdx.includes(active)?active:shownIdx[0];const setView=(i,v)=>{const a=[...views];while(a.length<4)a.push('plan');if(v==='3d'){const j=a.findIndex((x,k)=>x==='3d'&&k!==i&&k<nPanes);if(j>=0)a[j]=a[i]==='3d'?'plan':a[i];}a[i]=v;setViews(a);};
  const walls=useMemo(()=>roomWalls(p),[p.rooms]);
  // default elevation: the wall the selected item sits on, else the first wall with cabinets
  const selF=sel&&sel.kind==='fixture'?(p.fixtures||[]).find(f=>f.id===sel.id):null;
  const autoWall=useMemo(()=>{const pick=f=>walls.find(W=>{if(W.room.level!==f.level||!inPoly(f.x,f.y,W.room.pts))return false;const fr=fxFront(f);if(fr.x*W.n.x+fr.y*W.n.y<0.9)return false;const back={x:f.x-fr.x*f.d/2,y:f.y-fr.y*f.d/2};const pr=projSeg(back,W.a,W.b);return pr.d<10&&pr.tRaw>-0.05&&pr.tRaw<1.05;});
    if(selF){const w=pick(selF);if(w)return w.key;}for(const f of (p.fixtures||[]).filter(isCab)){const w=pick(f);if(w)return w.key;}return walls[0]&&walls[0].key;},[walls,selF&&selF.id,selF&&selF.x,selF&&selF.y,p.fixtures]);
  const T=DZ_TABS.find(t=>t[0]===tab)||DZ_TABS[0];
  const nk=useMemo(()=>D.issues.filter(i=>i.rule&&i.rule.set==='NKBA'),[D.issues]);
  const filter=T[2];
  const paneBody=(v,i)=>{const act=i===active;
    if(v==='rcp')return D.planFor({active:act,filter:RCP_FILTER,showElec:true,...(act?{}:{optbar:null})});
    if(v==='plan')return D.planFor({active:act,filter:colorBy?colorFilter(filter,colorBy):filter,...(tab==='nkba'?{issues:nk}:{}),...(act?{}:{optbar:null})});
    if(v==='3d')return html`<div className="pane" style=${{display:'grid'}}>${D.v3(colorBy?{tint:colorBy}:{})}<div className="corner"><button className=${'chip'+(D.showRoof?' on':'')} onClick=${()=>D.setShowRoof(!D.showRoof)}>Roof</button><button className=${'chip'+(D.cutaway?' on':'')} onClick=${()=>D.setCutaway(!D.cutaway)}>Cut at level</button></div></div>`;
    if(v.startsWith('ext:'))return html`<${ExtElevPane} p=${shown} view=${v.slice(4)}/>`;
    if(v.startsWith('elev'))return html`<${ElevPane} p=${shown} wkey=${v==='elev'?autoWall:v.slice(5)} sel=${sel} setSel=${setSel} levelId=${lv.id}/>`;
    return null;};
  const viewOpts=html`<option value="plan">Plan view</option><option value="rcp">Reflected ceiling plan</option><option value="3d">3D perspective</option><optgroup label="Wall elevations"><option value="elev">Elevation: follow selection</option>${walls.map(W=>html`<option key=${W.key} value=${'elev:'+W.key}>${W.label}</option>`)}</optgroup><optgroup label="Exterior elevations">${Object.keys(ELEV_VIEWS).map(k=>html`<option key=${k} value=${'ext:'+k}>${ELEV_VIEWS[k].title}</option>`)}</optgroup>`;
  const vname=v=>v==='plan'?'Plan':v==='rcp'?'Ceiling plan':v==='3d'?'3D':v==='elev'?'Elevation':v.startsWith('elev:')?((walls.find(W=>'elev:'+W.key===v)||{}).label||'Elevation'):v.startsWith('ext:')?ELEV_VIEWS[v.slice(4)].title:v;
  const pickTool=id=>{setTool(id);const i=views.findIndex((v,k)=>(v==='plan'||v==='rcp')&&k<nPanes);if(i>=0)setActive(i);else setView(cur,'plan');};
  const toolBtn=id=>{const ti=toolInfo(id);if(!ti)return null;return html`<button key=${id} className=${'dz-tool'+(tool===id?' on':'')} aria-pressed=${tool===id} onClick=${()=>pickTool(id)} title=${ti.label+(ti.key?' ('+ti.key+')':'')}>${ti.icon}</button>`;};
  const cadIds=[...new Set([...(TOOL_GROUPS.find(g=>g.id==='draft')||{tools:[]}).tools,'line','pline','rect','circle','arc','ellipse','polygon','spline','xline','hatch','revcloud','section','autodim','dim','dimang','dimrad','note','measure','measarea','op-move','op-copy','op-rotate','op-scale','op-offset','op-trim','op-extend','op-fillet','op-chamfer','op-break','op-join','op-explode','op-array','op-parray','op-garray','op-match'])].filter(id=>toolInfo(id));
  const archIds=['select','wall','door','window','room','fixture','stair','roof','elec'].filter(id=>toolInfo(id));
  const menus=[
    ['View',[{label:'Plan view in this pane',run:()=>setView(cur,'plan')},{label:'3D perspective in this pane',run:()=>setView(cur,'3d')},{label:'Elevation in this pane',run:()=>setView(cur,'elev')},{label:'Exterior elevation in this pane',run:()=>setView(cur,'ext:south')},{label:'Reflected ceiling plan in this pane',run:()=>setView(cur,'rcp')},'-',
      {label:'Fit all views',key:'F',run:()=>{D.fitPlan();D.fit3();}},{label:(D.showRoof?'Hide':'Show')+' roof in 3D',run:()=>D.setShowRoof(!D.showRoof)},{label:(D.cutaway?'Show':'Cut away')+' levels above',run:()=>D.setCutaway(!D.cutaway)},{label:(D.showElec?'Hide':'Show')+' electrical on plan',run:()=>D.setShowElec(!D.showElec)},{label:(D.structView?'Hide':'Show')+' structure check in 3D',run:()=>D.setStructView(!D.structView)},'-',
      ...['all','nodims','cab','ctr','arch','elec','plumb','furn','land','rfr','ffr','nkba'].map(k=>({label:'Plan shows: '+DZ_TABS.find(t=>t[0]===k)[1],run:()=>setTab(k)})),'-',{label:'Normal colors',run:()=>setColorBy(null),disabled:!colorBy},...COLOR_BY.map(c=>({label:'Color by '+c.label.toLowerCase(),run:()=>setColorBy(c.id)}))]],
    ['Place',[...archIds.map(id=>({label:toolInfo(id).label,key:toolInfo(id).key,run:()=>pickTool(id)})),'-',{label:'Roof wizard…',run:()=>D.setDlg('roofwiz')},{label:'Floor joists…',run:()=>D.setDlg('joists')},'-',{label:'Catalog item (from the left dock)…',run:()=>setDock(true)},
      ...['column','chimney','curvewall','deck','deckpoly','porch','steps','rail','skylight','dormer','plant','play','playarea','block','fieldpin'].filter(id=>toolInfo(id)).map(id=>({label:toolInfo(id).label,run:()=>pickTool(id)}))]],
    ['Report',[{label:'Check page (code, NKBA, structure, clashes)',run:()=>D.setMode('check')},{label:'Schedules (doors, windows, cabinets, finishes…)',run:()=>D.setMode('schedules')},{label:'Selections and orders',run:()=>{try{localStorage.setItem('remodel-studio:mattab','orders');}catch(e){}D.setMode('materials');}},{label:'Budget vs actual',run:()=>{try{localStorage.setItem('remodel-studio:mattab','actual');}catch(e){}D.setMode('materials');}},{label:'Wall photos',run:()=>{try{localStorage.setItem('remodel-studio:buildtab','photos');}catch(e){}D.setMode('build');}},{label:'Homeowner binder…',run:()=>D.setDlg('binder')},'-',{label:'Materials and price report',run:()=>D.setMode('materials')},{label:'Change orders',run:()=>D.setMode('materials')},{label:'Lighting schedule and scenes',run:()=>D.setMode('systems')},{label:'Drain, vent and duct sizing',run:()=>D.setMode('systems')},{label:'Cabinet order and schedule',run:()=>D.setMode('materials')},{label:'Code and NKBA check',run:()=>{D.setPanel('checks');setInsp(true);D.setCollapsed(false);}},{label:'Job schedule and lead times',run:()=>{try{localStorage.setItem('remodel-studio:buildtab','schedule');}catch(e){}D.setMode('build');}},{label:'Store prices…',run:()=>D.setDlg('storeprices')}]],
    ['Design',[{label:'Cabinet job settings (door, finish, species)…',run:()=>{D.setPanel('props');setSel(null);setInsp(true);D.setCollapsed(false);say('Job-wide cabinet settings are in the panel on the right when nothing is selected.');}},{label:'NKBA checks on or off',run:()=>{D.setPanel('checks');setInsp(true);D.setCollapsed(false);}},
      {label:'Lighting, energy and systems',run:()=>D.setMode('systems')},...LAYOUTS.map(([k,l])=>({label:'Layout: '+l,run:()=>{const room=(sel&&sel.kind==='room'&&p.rooms.find(r=>r.id===sel.id))||(selF&&p.rooms.find(r=>r.level===selF.level&&inPoly(selF.x,selF.y,r.pts)))||p.rooms.find(r=>r.level===lv.id&&(k==='bath5'?r.use==='bath':r.use==='kitchen'));if(!room){say('Select a room first.',false);return;}const r=layoutTemplate(p,room,k);if(r.n)commit(r.p);say(r.msg,!!r.n);}})),'-',{label:'Change door style and finish…',run:()=>D.setDlg('styleswap')},{label:'Countertop slab layout…',run:()=>D.setDlg('slab')},'-',{label:'Roof wizard…',run:()=>D.setDlg('roofwiz')},{label:'Floor framing (joists)…',run:()=>D.setDlg('joists')},{label:'Wall framing and cut list…',run:()=>D.setDlg('wallframe')},{label:'Show roof framing',run:()=>setTab('rfr')},{label:'Show floor framing',run:()=>setTab('ffr')},'-',{label:'Fill the cabinet run (cabinets and fillers)',disabled:!(selF&&isCab(selF)),run:()=>{const r=fillRun(p,selF);if(r.n)commit(r.p);say(r.msg,!!r.n);}},{label:'Under-cabinet lights for this level',run:()=>{const r=underCabLights(p,lv.id);if(r.n){commit(r.p);say(`Added ${r.n} under-cabinet light${r.n===1?'':'s'}.`);}else say('Every wall cabinet on this level already has an under-cabinet light, or there are no wall cabinets.',false);}},{label:'Remove or open a wall…',run:()=>D.setDlg('wallrm'),disabled:!(sel&&sel.kind==='wall')},{label:'Library and customize items',run:()=>{D.setPanel('library');setInsp(true);D.setCollapsed(false);}}]],
    ['Draw',cadIds.filter(id=>!/^op-|dim|meas/.test(id)).map(id=>({label:toolInfo(id).label,key:toolInfo(id).key,run:()=>pickTool(id)})).concat(['-'],cadIds.filter(id=>/^op-/.test(id)).map(id=>({label:toolInfo(id).label,key:toolInfo(id).key,run:()=>pickTool(id)})))],
    ['Dimensions',cadIds.filter(id=>/dim|meas/.test(id)).map(id=>({label:toolInfo(id).label,key:toolInfo(id).key,run:()=>pickTool(id)})).concat(['-',{label:'Show all dimensions',run:()=>setTab('all')},{label:'Hide dimensions',run:()=>setTab('nodims')}])],
    ['Render',[{label:'Render studio…',run:D.openRender},{label:'Photo match…',run:()=>D.setDlg('photomatch')},{label:'360° panorama…',run:()=>D.setDlg('pano')},{label:'Walk-through video…',run:()=>D.setDlg('video')},{label:'Export 3D model…',run:D.openExport}]],
    ['Window',[{label:'One view',run:()=>{setLayout('1');setMaxed(null);}},{label:'Two views side by side',run:()=>{setLayout('2v');setMaxed(null);}},{label:'Two views stacked',run:()=>{setLayout('2h');setMaxed(null);}},{label:'Three views',run:()=>{setLayout('3');setMaxed(null);}},{label:'Four views',run:()=>{setLayout('4');setMaxed(null);}},'-',
      {label:'Project browser',run:()=>{setLeftS('browser');lsSet('left','browser');setDock(true);}},{label:'Catalog',run:()=>{setLeftS('catalog');lsSet('left','catalog');setDock(true);}},{label:(dock?'Hide':'Show')+' the left panel',run:()=>setDock(!dock)},{label:(insp?'Hide':'Show')+' properties panel',run:()=>setInsp(!insp)},{label:(issuesOpen?'Hide':'Show')+' issues panel',run:()=>setIssuesOpen(!issuesOpen)}]],
    ['Help',[{label:'Lessons…',run:()=>D.setDlg('lessons')},{label:'Keyboard shortcuts',key:'?',run:()=>D.setDlg('keys')},{label:'How the Designer works',run:()=>say('Pick a catalog, then a category, then an item. Double-click it (or press Place) and click in the plan. Each pane has its own view list; click a pane to make it active. The tabs along the bottom change what the plans show.')}]]];
  const o=findObj(p,sel);const selName=sel?(sel.kind==='multi'?`${sel.items.length} items`:(o&&(o.name||(FIXTURES[o.type]||{}).label||o.type))||sel.kind):'Nothing selected';
  const ti=toolInfo(tool);const nErr=D.issues.filter(i=>i.sev==='error').length,nWarn=D.issues.filter(i=>i.sev==='warn').length;
  const gridCls='dz-panes dz-l'+(maxed!=null?'1':layout);
  const B={p,lv,commit,setLevelId,setMode:D.setMode,tab,setTab,activeView:views[cur],openView:v=>setView(cur,v),
    naming,setNaming,defName:`${lv.name} · ${DZ_TABS.find(t=>t[0]===tab)[1]}${colorBy?' · '+((COLOR_BY.find(c=>c.id===colorBy)||{}).label||''):''}`,
    saveSet:name=>{setNaming(false);if(!name)return;const sv={id:uid('vs'),name,layout,views:[...views],tab,level:lv.id,colorBy};commit({...p,settings:{...p.settings,viewSets:[...((p.settings&&p.settings.viewSets)||[]),sv]}});say('Saved the view setup "'+name+'". It is in the project browser.');},
    applySet:s=>{setLayout(s.layout);setViews(s.views);setTab(s.tab||'all');setMaxed(null);if(s.level&&lvlOf(p,s.level))setLevelId(s.level);setColorBy(s.colorBy||null);}};
  const R={D,p,lv,sel,selF,say,commit,tool,pickTool,layout,setLayout,maxed,setMaxed,dock,insp,setInsp,left,leftTab,issuesOpen,setIssuesOpen,tab,setTab,colorBy,setColorBy,saveSet:()=>{setLeftS('browser');lsSet('left','browser');setDock(true);setNaming(true);}};
  const menuEls=menus.map(([l,items])=>html`<${MenuButton} key=${l} id=${'dz-menu-'+l.toLowerCase()} label=${l} items=${items}/>`);
  const CB=colorBy&&COLOR_BY.find(c=>c.id===colorBy);
  return html`<div className=${'designer'+(dock?'':' nodock')+(insp?'':' noinsp')+(issuesOpen?' withiss':'')}>
    ${slot?ReactDOM.createPortal(menuEls,slot):slot===null?html`<div className="dz-menubar dz-mb-inline">${menuEls}</div>`:null}
    <${Ribbon} R=${R}/>
    ${dock?html`<div className="dz-left"><div className="dz-ltabs" role="tablist" aria-label="Left panel">${[['browser','Project browser'],['catalog','Catalog']].map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${left===k} className=${left===k?'on':''} onClick=${()=>{setLeftS(k);lsSet('left',k);}}>${l}</button>`)}<button className="dz-mini" onClick=${()=>setDock(false)} aria-label="Hide the left panel" title="Hide the left panel">‹</button></div>
      ${left==='browser'?html`<${ProjectBrowser} B=${B}/>`:html`<${CatalogDock} D=${D}/>`}</div>`:html`<button className="dz-showleft" onClick=${()=>setDock(true)} title="Show the project browser and catalog" aria-label="Show the left panel">›</button>`}
    <div className=${gridCls}>${shownIdx.map(i=>{const v=views[i]||'plan';return html`<section key=${'pane'+i+':'+(v==='3d'?'3d':'x')} className=${'dz-pane'+(i===active?' active':'')} onPointerDownCapture=${()=>setActive(i)} aria-label=${'View '+(i+1)}>
        <header className="dz-ph"><select className="inp dz-vsel" aria-label=${'View '+(i+1)} value=${v} onChange=${e=>setView(i,e.target.value)}>${viewOpts}</select><span className="dz-pt">${vname(v)}</span>
          <button className="dz-mini" onClick=${()=>setMaxed(maxed===i?null:i)} title=${maxed===i?'Restore the split views':'Maximize this view'}>${maxed===i?'❐':'□'}</button></header>
        <div className="dz-pb">${paneBody(v,i)}${tab==='legend'&&i===active?html`<${DZLegend} p=${shown} lv=${lv}/>`:null}${tab==='nkba'&&i===active?html`<${DZNkba} p=${p} commit=${commit} list=${nk} goTo=${D.goTo}/>`:null}${CB&&(v==='plan'||v==='3d')?html`<${ColorByLegend} p=${shown} lv=${lv} cb=${CB} onClose=${()=>setColorBy(null)}/>`:null}</div></section>`;})}</div>
    ${insp?html`<div className="dz-insp">${D.inspEl}</div>`:null}
    ${issuesOpen?html`<${IssuesDock} p=${p} issues=${D.issues} goTo=${D.goTo} onClose=${()=>setIssuesOpen(false)}/>`:null}
    <div className="dz-tabs" role="tablist" aria-label="Plan display">${DZ_TABS.map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${tab===k} className=${tab===k?'on':''} onClick=${()=>{if(k==='print'){D.setMode('sheets');return;}setTab(k);}}>${l}</button>`)}
      <span className="grow"></span><label className="dz-cbl" htmlFor="dz-colorby">Color by</label><select id="dz-colorby" className="inp dz-cbsel" value=${colorBy||''} onChange=${e=>setColorBy(e.target.value||null)}><option value="">Normal</option>${COLOR_BY.map(c=>html`<option key=${c.id} value=${c.id}>${c.label}</option>`)}</select>
      <button className=${'dz-issbtn'+(issuesOpen?' on':'')} onClick=${()=>setIssuesOpen(!issuesOpen)} aria-pressed=${issuesOpen}>Issues ${D.issues.filter(i=>i.sev==='error').length?html`<b className="bad">${D.issues.filter(i=>i.sev==='error').length}</b>`:null}</button></div>
    <footer className="dz-status"><span><b>${ti?ti.label:tool}</b></span><span>${selName}</span><span>${lv.name}</span><span>${D.layer==='both'?'Existing + new':D.layer}</span><span>${(p.fixtures||[]).filter(f=>f.level===lv.id).length} items on this level</span>
      <span className="grow"></span><button className=${'linkbtn '+(nErr?'bad':nWarn?'warn':'ok')} onClick=${()=>D.setMode('check')} title="Open the Check page">${nErr} errors · ${nWarn} warnings${nk.length?` · ${nk.length} NKBA`:''}</button></footer>
  </div>`;}
function DZLegend({p,lv}){const fx=(p.fixtures||[]).filter(f=>f.level===lv.id);const groups={};for(const f of fx){const it=f.lib&&LIB_BY_ID[f.lib];const k=it?(it.cat+' · '+(it.sub||'')):((FIXTURES[f.type]||{}).cat||'Other');const n=f.name||(FIXTURES[f.type]||{}).label||f.type;(groups[k]=groups[k]||{});groups[k][n]=(groups[k][n]||0)+1;}
  const el=(p.elec||[]).filter(d=>d.level===lv.id);const eg={};for(const d of el){const n=(ELEC[d.type]||{}).label||d.type;eg[n]=(eg[n]||0)+1;}
  return html`<div className="dz-legend" role="region" aria-label="Legend"><h4>Legend · ${lv.name}</h4>${Object.entries(groups).sort().map(([g,m])=>html`<div key=${g}><h5>${g}</h5><ul>${Object.entries(m).map(([n,c])=>html`<li key=${n}><span>${n}</span><b>${c}</b></li>`)}</ul></div>`)}
    ${el.length?html`<div><h5>Electrical</h5><ul>${Object.entries(eg).map(([n,c])=>html`<li key=${n}><span>${n}</span><b>${c}</b></li>`)}</ul></div>`:null}${!fx.length&&!el.length?html`<p className="note">Nothing placed on this level yet.</p>`:null}</div>`;}
function DZNkba({p,commit,list,goTo}){const on=nkbaOf(p).on;return html`<div className="dz-legend dz-nkba"><h4>NKBA guidelines</h4>${on?null:html`<p className="note">NKBA checks are off for this job.</p><button className="btn primary" onClick=${()=>commit({...p,settings:{...p.settings,nkba:{...(p.settings.nkba||{}),on:true}}})}>Turn on NKBA checks</button>`}
  ${on&&!list.length?html`<p className="note">No NKBA issues on this job.</p>`:null}<ul className="dz-nk">${list.slice(0,40).map(i=>html`<li key=${i.id} className=${'sev-'+i.sev}><button className="linkbtn" onClick=${()=>goTo(i)}>${i.rule&&i.rule.code?html`<b>${i.rule.code}</b> `:null}${i.title}</button></li>`)}</ul></div>`;}
// ---------- the catalog dock ----------
const DZ_GROUPS=[['Kitchen and bath',['Cabinets','Appliances','Plumbing','Bath accessories','Countertops']],['Rooms and furniture',['Living room','Bedroom','Dining room','Office','Kids room','Laundry and utility','Garage and storage','Games and fitness','Electronics','Furniture']],['Lighting and decor',['Lighting and fans','Decor and window treatments','Indoor plants','People and pets']],['Building',['Doors','Windows','Wall assemblies','Trim and molding','Floors','Wall finishes','Ceilings','Roofing','Siding','Colors']],['Outdoor',['Outdoor living','Plants','Landscape','Playground','Hardscape']]];
function CatalogDock({D}){const {sel,say}=D;
  const cats=LIB_CATS.filter(c=>LIB.some(x=>x.cat===c));const vendorCats=cats.filter(c=>LIB.some(x=>x.cat===c&&x.vendor));
  const [cat,setCatS]=useState(()=>{try{const v=localStorage.getItem('remodel-studio:dz-cat');if(v&&cats.includes(v))return v;}catch(e){}return cats.includes('Cabinets')?'Cabinets':cats[0];});
  const setCat=c=>{setCatS(c);setSub(null);setQ('');try{localStorage.setItem('remodel-studio:dz-cat',c);}catch(e){}};
  const [sub,setSub]=useState(null);const [q,setQ]=useState('');const [pick,setPick]=useState(null);const [tab,setTab]=useState('place');
  const inCat=useMemo(()=>LIB.filter(x=>cat==='__all'?true:x.cat===cat),[cat,LIB.length]);
  const subs=useMemo(()=>{const m=new Map();for(const x of inCat){const s=x.sub||'General';m.set(s,(m.get(s)||0)+1);}return [...m.entries()];},[inCat]);
  const qs=q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const items=useMemo(()=>{let a=qs.length?(cat==='__all'?LIB:inCat).filter(x=>{const t=(libCode(x)+' '+x.label+' '+(x.sub||'')+' '+x.cat).toLowerCase();return qs.every(w=>t.includes(w));}):sub?inCat.filter(x=>(x.sub||'General')===sub):[];return a.slice(0,qs.length?600:2500);},[inCat,sub,q,cat]);
  const it=pick&&LIB_BY_ID[pick];const acts=it?libActions(it,D.libCtx):[];const prim=acts.find(a=>a.primary);
  const place=x=>{const a=libActions(x,D.libCtx).find(a=>a.primary);if(a){a.run();say(`Click in the plan to place ${x.label}.`);}};
  const kindPic=x=>x.place==='plant'?'plant':x.place==='play'?'play':'fixture';
  const grouped=DZ_GROUPS.map(([g,cs])=>[g,cs.filter(c=>cats.includes(c)&&!vendorCats.includes(c))]).filter(g=>g[1].length);const rest=cats.filter(c=>!vendorCats.includes(c)&&!DZ_GROUPS.some(g=>g[1].includes(c)));
  return html`<aside className="dz-dock" aria-label="Catalog">
    <label className="dz-lab" htmlFor="dz-cat">Catalog</label>
    <select id="dz-cat" className="inp" value=${cat} onChange=${e=>setCat(e.target.value)}><option value="__all">All catalogs (search)</option>
      ${grouped.map(([g,cs])=>html`<optgroup key=${g} label=${g}>${cs.map(c=>html`<option key=${c} value=${c}>${c}</option>`)}</optgroup>`)}
      ${rest.length?html`<optgroup label="More">${rest.map(c=>html`<option key=${c} value=${c}>${c}</option>`)}</optgroup>`:null}
      ${vendorCats.length?html`<optgroup label="Cabinet vendor catalogs">${vendorCats.map(c=>html`<option key=${c} value=${c}>${c}</option>`)}</optgroup>`:null}</select>
    <div className="dz-preview">${it&&PIC_PLACES.has(it.place)?html`<${ItemPic} key=${it.id} kind="lib" obj=${it} p=${D.p} w=${260} h=${180} eager=${true} alt=${it.label}/>`:it?html`<${LibIcon} it=${it}/>`:html`<div className="dz-ph-empty">Pick an item to see it here</div>`}
      ${it?html`<div className="dz-pinfo"><b>${libCode(it)}</b> ${it.label}<div className="note">${libDims?libDims(it):''}</div>${it.note?html`<div className="note">${it.note}</div>`:null}</div>`:null}</div>
    <input className="inp dz-search" type="search" placeholder=${cat==='__all'?'Search every catalog':'Search '+cat} aria-label="Search the catalog" value=${q} onInput=${e=>setQ(e.target.value)}/>
    <div className="dz-list" role="listbox" aria-label=${sub||'Categories'}>
      ${!qs.length&&!sub?html`<div className="dz-row dz-hdr">${'< Categories >'}</div>${subs.map(([s,n])=>html`<button key=${s} className="dz-row dz-cat" onClick=${()=>setSub(s)}><span>${s}</span><small>${n}</small></button>`)}`
        :html`${!qs.length?html`<button className="dz-row dz-hdr dz-back" onClick=${()=>setSub(null)}>${'< Categories >'}</button><div className="dz-row dz-subt">${sub}</div>`:html`<div className="dz-row dz-subt">${items.length>=600?'600+':items.length} found</div>`}
          ${items.map(x=>html`<button key=${x.id} role="option" aria-selected=${pick===x.id} className=${'dz-row dz-item'+(pick===x.id?' on':'')} onClick=${()=>setPick(x.id)} onDoubleClick=${()=>place(x)} title=${x.label}><b>${libCode(x)}</b><span>${' > '+x.label}</span></button>`)}`}
    </div>
    <div className="dz-acts">${prim?html`<button className="btn primary" onClick=${()=>{prim.run();say(`Click in the plan to place ${it.label}.`);}}>${prim.label}</button>`:null}${acts.filter(a=>!a.primary).slice(0,3).map(a=>html`<button key=${a.label} className="btn" onClick=${a.run}>${a.label}</button>`)}</div>
    <div className="dz-ptabs" role="tablist">${[['place','Place'],['move','Move'],['coords','Coords']].map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${tab===k} className=${tab===k?'on':''} onClick=${()=>setTab(k)}>${l}</button>`)}</div>
    <${DZPlaceTabs} D=${D} tab=${tab}/>
  </aside>`;}
// Place / Move / Coords act on the selected item
function DZPlaceTabs({D,tab}){const {p,sel,commit}=D;const o=findObj(p,sel);const kind=sel&&sel.kind;const hasXY=o&&typeof o.x==='number'&&typeof o.y==='number';
  const [step,setStep]=useState(1);const [off,setOff]=useState('');const [ang,setAng]=useState('');
  if(!hasXY)return html`<div className="dz-ptab note">Select a cabinet, fixture or other placed item to ${tab==='place'?'set its offset and angle':tab==='move'?'nudge it':'type its coordinates'}.</div>`;
  const up=patch=>commit(updObj(p,kind,o.id,patch));
  const fr=kind==='fixture'?fxFront(o):{x:0,y:1};
  if(tab==='place')return html`<div className="dz-ptab"><div className="dz-f"><label htmlFor="dz-off">Offset from wall</label><input id="dz-off" className="inp mono" placeholder='0"' value=${off} onChange=${e=>setOff(e.target.value)}/><button className="btn" onClick=${()=>{const L=parseLen(off||'0','in');if(L==null)return;let q={...o};if(kind==='fixture'){const snapped=snapFixtureToWall(p,o.level,{...o},{x:o.x-fr.x*24,y:o.y-fr.y*24},40);q={...snapped,x:snapped.x+fr.x*L,y:snapped.y+fr.y*L,rot:o.rot};}up({x:q.x,y:q.y});}}>Apply</button></div>
      <div className="dz-f"><label htmlFor="dz-ang">Angle</label><input id="dz-ang" className="inp mono" placeholder=${String(o.rot||0)+'°'} value=${ang} onChange=${e=>setAng(e.target.value)}/><button className="btn" onClick=${()=>{const a=parseFloat(ang);if(isFinite(a))up({rot:((a%360)+360)%360});}}>Apply</button></div>
      ${'elev' in o?html`<div className="dz-f"><label>Height off floor</label><span className="mono">${fmtLen(o.elev||0)}</span>${[-1,1].map(s=>html`<button key=${s} className="btn" onClick=${()=>up({elev:Math.max(0,(o.elev||0)+s*step)})}>${s<0?'−':'+'}${step}"</button>`)}</div>`:null}
      <p className="note">Offset pushes the item out from the wall behind it (0 = tight to the wall).</p></div>`;
  if(tab==='move'){const mv=(dx,dy)=>commit(moveItems(p,[{kind,id:o.id}],dx,dy));
    return html`<div className="dz-ptab"><div className="dz-f"><label htmlFor="dz-step">Step</label><select id="dz-step" className="inp" value=${step} onChange=${e=>setStep(+e.target.value)}>${[0.125,0.25,0.5,1,3,6,12,24].map(v=>html`<option key=${v} value=${v}>${fmtLen(v)}</option>`)}</select></div>
      <div className="dz-pad"><span></span><button className="btn" onClick=${()=>mv(0,-step)} aria-label="Move up">↑</button><span></span><button className="btn" onClick=${()=>mv(-step,0)} aria-label="Move left">←</button><button className="btn" onClick=${()=>up({rot:(((o.rot||0)+90)%360)})} aria-label="Rotate 90°">⟳</button><button className="btn" onClick=${()=>mv(step,0)} aria-label="Move right">→</button><span></span><button className="btn" onClick=${()=>mv(0,step)} aria-label="Move down">↓</button><span></span></div>
      ${kind==='fixture'?html`<div className="dz-f"><button className="btn" onClick=${()=>up({x:o.x+fr.x*step,y:o.y+fr.y*step})}>Forward ${fmtLen(step)}</button><button className="btn" onClick=${()=>up({x:o.x-fr.x*step,y:o.y-fr.y*step})}>Back ${fmtLen(step)}</button></div>`:null}
      <div className="dz-f"><button className="btn" onClick=${()=>up({rot:(((o.rot||0)+15)%360)})}>Turn 15°</button><button className="btn" onClick=${()=>up({rot:(((o.rot||0)+345)%360)})}>Turn −15°</button></div></div>`;}
  const fld=(k,lab,unit='in')=>k in o||k==='x'||k==='y'?html`<div className="dz-f" key=${k}><label htmlFor=${'dz-c-'+k}>${lab}</label><input id=${'dz-c-'+k} key=${o.id+k+o[k]} className="inp mono" defaultValue=${unit==='deg'?String(o[k]||0):fmtLen(o[k]||0)} onKeyDown=${e=>{if(e.key==='Enter')e.target.blur();}} onBlur=${e=>{const v=unit==='deg'?parseFloat(e.target.value):parseLen(e.target.value,'in');if(v==null||!isFinite(v)||v===o[k])return;up({[k]:unit==='deg'?((v%360)+360)%360:(k==='w'||k==='d'||k==='h'?Math.max(0.5,v):v)});}}/></div>`:null;
  return html`<div className="dz-ptab dz-coords">${fld('x','X')}${fld('y','Y')}${fld('elev','Z (height off floor)')}${fld('w','Width')}${fld('d','Depth')}${fld('h','Height')}${fld('rot','Angle','deg')}</div>`;}
