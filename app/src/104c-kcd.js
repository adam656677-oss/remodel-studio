/* ======================= 20/20-style cabinet design: modifications, attribute groups, job attributes, moldings and decorative pieces, corner checks ======================= */
// ---- modifications: [key, label, SKU code, planning list price (stock line), applies to, counted?]
const BASEISH=f=>['base','sinkbase','vanity','island'].includes(f.type);
const CAB_MODS=[
  ['rd','Reduced depth','RD',35,f=>f.type!=='filler'],
  ['rot','Roll-out tray','ROT',95,f=>BASEISH(f)||f.type==='tall',true],
  ['td','Tray divider','TD',45,f=>BASEISH(f)||f.type==='wallcab'],
  ['spo','Spice or utensil pull-out','SPO',140,f=>BASEISH(f)||f.type==='tall'],
  ['wbk','Waste basket kit (double bin)','WBK',150,f=>f.type==='base'||f.type==='sinkbase'],
  ['cd','Cutlery divider','CD',40,f=>BASEISH(f)],
  ['peg','Peg drawer system','PEG',110,f=>BASEISH(f)],
  ['bco','Blind corner pull-out','BCO',350,f=>/c-blind/.test(f.lib||'')],
  ['to','Sink tip-out tray','TO',35,f=>f.type==='sinkbase'||f.type==='vanity'],
  ['mi','Matching interior','MI',60,f=>f.type==='wallcab'||f.type==='tall'],
  ['ulp','Under-cabinet light prep (recessed bottom)','ULP',25,f=>f.type==='wallcab'],
  ['xs','Extended stile for scribing','XS',30,f=>f.type!=='filler'],
  ['gfd','Glass-ready mullion doors','GFD',90,f=>f.type==='wallcab'||f.type==='tall'],
  ['ss','Soft-close upgrade','SC',30,f=>f.type!=='filler'],
  ['ad','Appliance garage','AG',260,f=>f.type==='wallcab'&&(f.elev||0)<40],
];
// 20/20-style SKUs for corner, oven and specialty boxes
{const _sku=cabSku;cabSku=function(f){const c=f.cab||{};if(c.sku)return c.sku;const lib=f.lib||'';const W=Math.round(f.w),H=Math.round(f.h);
  if(/c-blind-/.test(lib))return 'BBC'+W+'-'+(c.blind||'L');if(/c-lazy-/.test(lib))return 'LS'+W;if(/c-wallcorner-/.test(lib))return 'WDC'+W+H;if(/c-micro-/.test(lib))return 'WMC'+W+H;
  if(/c-vandr-/.test(lib))return 'VDB'+W;if(/c-pen-/.test(lib))return 'PEN'+W;return _sku(f);};}
const stdDepth=f=>({base:24,sinkbase:24,wallcab:12,tall:24,vanity:21,island:null}[f.type]);
function cabMods(p,f){const st=cabStyle(p,f);const m={...((f.cab||{}).mods||{})};const sd=stdDepth(f);if(sd&&f.d<sd-0.4&&!/bridge|micro|c-wall-|c-wallcorner|c-vandr|c-mud|c-book|c-linen|c-laund|c-desk/.test(f.lib||'')&&m.rd!==0)m.rd=m.rd||1;if(st.softClose!==false)delete m.ss;
  const out=[];for(const [k,label,code,price,ok,counted] of CAB_MODS){const q=m[k];if(q&&ok(f))out.push({k,label,code:code+(counted&&q>1?q:''),qty:counted?q:1,price,ok});}
  if(st.endL)out.push({k:'fel',label:'Finished left end',code:'FEL',qty:1,price:45});if(st.endR)out.push({k:'fer',label:'Finished right end',code:'FER',qty:1,price:45});return out;}
const cabLineF=(p,f)=>(CAB_LINES.find(x=>x[0]===cabStyle(p,f).line)||CAB_LINES[1])[2];
function cabSkuFull(p,f){const b=cabSku(f);const m=cabMods(p,f).map(x=>x.code);const h=cabHingeTag(p,f);return [b+(h?h:''),...m].join(' ');}
// single-door cabinets carry the hinge side in the SKU (20/20 style: B15L / B15R)
function cabHingeTag(p,f){const {fronts}=cabFronts(p,f);const doors=fronts.filter(x=>x.kind==='door'||x.kind==='glass');if(!doors.length)return '';const hs=new Set(doors.map(d=>d.hinge));return hs.size===1?[...hs][0]:'';}
// job attributes and price factors
const CAB_SPECIES=[['maple','Maple',1],['oak','Oak',0.97],['cherry','Cherry',1.12],['hickory','Hickory',1.05],['birch','Birch',0.98],['walnut','Walnut',1.25],['mdf','Paint-grade MDF doors',0.95]];
const CAB_OVERLAY=[['full','Full overlay',1],['partial','Standard (partial) overlay',0.95],['inset','Inset',1.2]];
const CAB_DRAWER=[['standard','Standard drawer box',1],['dovetail','Dovetail hardwood drawer box',1.06],['metal','Metal box (frameless)',1.04]];
const CAB_CROWN=[['cove','Cove crown 2-1/4"',2.25],['crown','Crown 3-1/2"',3.5],['stacked','Stacked crown 2-piece 5-1/2"',5.5],['flat','Flat batten 1-1/2"',1.5]];
const CAB_LEGS=[['none','None'],['turned2','2 turned legs (open end)'],['turned4','4 turned legs'],['posts2','2 square posts'],['posts4','4 square posts']];
const CAB_BACK=[['flat','Flat panel'],['beadboard','Beadboard'],['raised','Raised panels'],['shaker','Shaker panels (match doors)']];
const CAB_ZONES=[['upper','Wall cabinets'],['island','Island'],['tall','Tall cabinets'],['vanity','Vanities']];
function cabZone(f){const c=f.cab||{};if(c.zone)return c.zone==='perimeter'?null:c.zone;return {wallcab:'upper',island:'island',tall:'tall',vanity:'vanity'}[f.type]||null;}
{const _cs=cabStyle;cabStyle=function(p,f){const g=_cs(p,{...f,cab:undefined});const z=cabZone(f||{});const zs=(z&&p.settings?.cab?.zones?.[z])||{};const clean=Object.fromEntries(Object.entries(zs).filter(([,v])=>v!=null&&v!==''));
  return {species:'maple',overlay:'full',drawerBox:'standard',softClose:true,crownProfile:'crown',toeSkin:true,scribe:true,valance:false,islandLegs:'none',islandBack:'shaker',fridgePanels:false,dwPanel:false,...g,...clean,...((f&&f.cab)||{})};};}
{const _cp=cabPrice;cabPrice=function(p,f){const c=f.cab||{};if(c.price!=null)return +c.price;let v=_cp(p,f);const st=cabStyle(p,f);
  const k=(CAB_SPECIES.find(x=>x[0]===st.species)||[0,0,1])[2]*(st.style==='inset'?1:(CAB_OVERLAY.find(x=>x[0]===st.overlay)||[0,0,1])[2])*(/drawer/.test(cabLayout(f))||BASEISH(f)?(CAB_DRAWER.find(x=>x[0]===st.drawerBox)||[0,0,1])[2]:1);
  v=v*k+cabMods(p,f).reduce((s,m)=>s+m.price*m.qty,0)*cabLineF(p,f);return Math.round(v/5)*5;};}
{const _sr=cabScheduleRows;cabScheduleRows=function(p){const nums=cabNumbers(p);const fx=(p.fixtures||[]).filter(f=>isCab(f)&&f.status!=='demolish'&&nums[f.id]).sort((a,b)=>nums[a.id]-nums[b.id]);return _sr(p).map((r,i)=>fx[i]?[r[0],cabSkuFull(p,fx[i]),...r.slice(2)]:r);};}

/* ---- runs, exposed ends and wall contact ---- */
const TIER_BASE=new Set(['base','sinkbase','dw','range','fridge','tall','island','filler','vanity','washer','dryer']);
function cabNeighbors(p,f){const lv=f.level;const upper=f.type==='wallcab';const others=(p.fixtures||[]).filter(o=>o.level===lv&&o.id!==f.id&&o.status!=='demolish'&&(upper?(o.type==='wallcab'||o.type==='tall'):TIER_BASE.has(o.type)));
  const walls=wallRects(p,lv);const res={};
  for(const s of [-1,1]){const q=fxLocal(f,s*(f.w/2+1.25),0);const qf=fxLocal(f,s*(f.w/2+1.25),f.d/2-1);
    const nb=others.find(o=>inPoly(q.x,q.y,fxCorners(o).map(c=>[c.x,c.y]))||inPoly(qf.x,qf.y,fxCorners(o).map(c=>[c.x,c.y])));
    const wall=walls.some(r=>inPoly(q.x,q.y,r.map(c=>[c.x,c.y])));res[s]=nb?{kind:'fx',f:nb}:wall?{kind:'wall'}:{kind:'open'};}
  return res;}
const cabTop=f=>(f.elev||0)+f.h;
/* ---- moldings, panels, decorative pieces and hardware (planning list prices, stock line) ---- */
function cabTrimRows(p,lvId=null){const fx=(p.fixtures||[]).filter(f=>f.status!=='demolish'&&(lvId==null||f.level===lvId));const cabs=fx.filter(isCab);if(!cabs.length)return [];
  const st0=cabStyle(p,{type:'wallcab'});const lineF=(CAB_LINES.find(x=>x[0]===cabStyle(p,{}).line)||CAB_LINES[1])[2];const rows=[];const R=(item,qty,unit,price,note='',code='')=>{if(qty>0)rows.push({item,qty,unit,price:Math.round(price*lineF*100)/100,note,code});};
  let crown=0,rail=0,toe=0,scribe=0,feAuto=[],dwEnd=0,corners=0;
  for(const f of cabs){if(f.type==='filler')continue;const nb=cabNeighbors(p,f);const st=cabStyle(p,f);
    if(f.type==='wallcab'||(f.type==='tall'&&cabTop(f)>=82)){if(st.crown){crown+=f.w;for(const s of [-1,1])if(nb[s].kind==='open')crown+=f.d,corners++;}
      if(f.type==='wallcab'&&st.lightRail){rail+=f.w;for(const s of [-1,1])if(nb[s].kind==='open')rail+=f.d;}}
    if(['base','sinkbase','tall','vanity'].includes(f.type)&&st.toeSkin){toe+=f.w;for(const s of [-1,1])if(nb[s].kind==='open')toe+=f.d-3;}
    if(f.type==='island'&&st.toeSkin)toe+=2*(f.w+f.d);
    if(st.scribe)for(const s of [-1,1])if(nb[s].kind==='wall')scribe+=cabBoxH(f)-(['base','sinkbase','tall','vanity'].includes(f.type)?st.toe:0);
    for(const s of [-1,1])if(nb[s].kind==='open'&&!(s<0?st.endL:st.endR)&&f.type!=='island')feAuto.push({f,side:s});}
  for(const d of fx.filter(f=>f.type==='dw')){const nb=cabNeighbors(p,d);for(const s of [-1,1])if(nb[s].kind==='open')dwEnd++;}
  const sticks=(lf,waste=0.15,extra=0)=>Math.ceil((lf*(1+waste)+extra*12)/96);
  const cp=(CAB_CROWN.find(x=>x[0]===st0.crownProfile)||CAB_CROWN[1]);
  R(`Crown molding, ${cp[1]}`,sticks(crown,0.15,corners),'8 ft',cp[0]==='stacked'?140:cp[0]==='cove'?70:95,`${Math.round(crown/12)} LF along wall cabinets and exposed ends`,'CM8');
  R('Light rail molding',sticks(rail),'8 ft',65,`${Math.round(rail/12)} LF under wall cabinets`,'LR8');
  R('Toe kick skin',sticks(toe,0.1),'8 ft',40,`${Math.round(toe/12)} LF`,'TK8');
  R('Scribe molding',sticks(scribe,0.1),'8 ft',28,`${Math.round(scribe/12)} LF where cabinets meet walls`,'SM8');
  const fe=cabs.reduce((s,f)=>s+(cabStyle(p,f).endL?1:0)+(cabStyle(p,f).endR?1:0),0);
  if(dwEnd)R('Dishwasher end panel 24" x 34-1/2"',dwEnd,'EA',160,'exposed dishwasher side','DWEP');
  if(st0.dwPanel)R('Panel-ready dishwasher door panel',fx.filter(f=>f.type==='dw').length,'EA',220,'match door style','DWP');
  if(st0.fridgePanels){let n=0;for(const r of fx.filter(f=>f.type==='fridge')){const nb=cabNeighbors(p,{...r,type:'base'});n+=[-1,1].filter(s=>nb[s].kind!=='wall').length;}R('Refrigerator end panel (REP) 1-1/2" x 27" x 96"',n,'EA',395,'flanking the refrigerator','REP2796');}
  for(const i of cabs.filter(f=>f.type==='island')){const s=cabStyle(p,i);R(`Island back panel, ${(CAB_BACK.find(x=>x[0]===s.islandBack)||['',''])[1].toLowerCase()}, ${fmtLen(i.w)} x ${fmtLen(cabBoxH(i)-s.toe)}`,1,'EA',Math.round(i.w*3.2),'','IBP');
    R(`Island end panels, ${fmtLen(i.d)} deep`,2,'EA',140,'','IEP');
    if(s.seating){const n=Math.ceil(i.w/36)+1;R('Corbels under seating overhang',n,'EA',65,'about every 36"','CORB');}
    const lg={turned2:2,turned4:4,posts2:2,posts4:4}[s.islandLegs];if(lg)R(/posts/.test(s.islandLegs)?'Square posts 3-1/2" x 34-1/2"':'Turned legs 3-1/2" x 34-1/2"',lg,'EA',160,'','LEG');}
  if(st0.valance)for(const s of fx.filter(f=>f.type==='sinkbase')){const w=p.openings.find(o=>o.type==='window'&&(()=>{const c=openingCenter(p,o);return c&&c.w.level===s.level&&dist(c,s)<s.d/2+c.w.thick+4;})());if(w&&!fx.some(f=>f.type==='wallcab'&&rectsOverlap(fxCorners(f),fxCorners(s))))R(`Valance over sink window, ${fmtLen(w.width+6)}`,1,'EA',120,'','VAL');}
  // hardware from the actual fronts
  let pulls=0,hinges=0,slides=0;for(const f of cabs){if(f.type==='filler')continue;const st=cabStyle(p,f);for(const fr of cabFronts(p,f).fronts){if(fr.kind==='door'||fr.kind==='glass'){hinges+=fr.z1-fr.z0>=48?3:2;if(st.hw!=='none')pulls++;}if(fr.kind==='drawer'){slides++;if(st.hw!=='none')pulls++;}if(fr.kind==='false'&&st.hw!=='none')pulls++;}slides+=((f.cab||{}).mods||{}).rot||0;}
  const hw=(CAB_HW.find(x=>x[0]===st0.hw)||['','Pulls'])[1];const hf=(HW_FIN.find(x=>x[0]===st0.hwFin)||['',''])[1];
  if(pulls)rows.push({item:`Cabinet hardware: ${hw.toLowerCase()}, ${hf.toLowerCase()}`,qty:pulls,unit:'EA',price:st0.hw==='knob'?6:st0.hw==='cup'?9:st0.hw==='edge'?14:11,note:'one per door and drawer',code:'HW'});
  if(hinges)rows.push({item:`Concealed hinges${st0.softClose!==false?', soft-close':''}`,qty:hinges,unit:'EA',price:0,note:'included with cabinets; for counting',code:'HNG'});
  if(slides)rows.push({item:`Drawer slides${st0.softClose!==false?', full-extension soft-close':''}`,qty:slides,unit:'PR',price:0,note:'included with cabinets; for counting',code:'SLD'});
  rows.feAuto=feAuto;return rows;}
regExtra({takeoff:(p,add)=>{for(const r of cabTrimRows(p)){regPrice('Cabinet trim and accessories',r.item,r.price);add('Cabinet trim and accessories',r.item,r.qty,r.unit,r.note);}
  for(const f of (p.fixtures||[]).filter(f=>isCab(f)&&f.status!=='demolish'))for(const m of cabMods(p,f))if(!['fel','fer'].includes(m.k)){const it=`Cabinet modification: ${m.label.toLowerCase()} (${m.code})`;regPrice('Cabinet trim and accessories',it,Math.round(m.price*cabLineF(p,f)));add('Cabinet trim and accessories',it,m.qty,'EA');}},
 checks:(p,add)=>{try{cabCornerChecks(p,add);}catch(e){console.warn('cabinet checks',e);}}});

/* ---- corner and clearance checks (20/20-style collision rules) ---- */
function cabCornerChecks(p,add){const N=(c,t)=>({set:'Cabinets',code:c,title:t});const nums=cabNumbers(p);const lab=f=>nums[f.id]?'#'+nums[f.id]:fxLabel(f).toLowerCase();
  for(const lv of p.levels){const fx=(p.fixtures||[]).filter(f=>f.level===lv.id&&f.status!=='demolish');const T=f=>({kind:'fixture',id:f.id});
    const perp=(a,b)=>{const d=Math.abs((((a.rot||0)-(b.rot||0))%180+180)%180);return Math.abs(d-90)<2;};
    for(const B of fx.filter(f=>TIER_BASE.has(f.type)||f.type==='wallcab')){const upper=B.type==='wallcab';
      for(const s of [-1,1]){const q=fxLocal(B,s*(B.w/2+0.75),B.d/2-2);const A=fx.find(o=>o!==B&&perp(o,B)&&(upper?o.type==='wallcab':(isCab(o)&&o.type!=='wallcab'))&&inPoly(q.x,q.y,fxCorners(o).map(c=>[c.x,c.y])));if(!A)continue;
        const pt={x:q.x,y:q.y};
        if(/c-lazy|c-wallcorner/.test(A.lib||''))continue;
        if(/c-blind/.test(A.lib||'')){add('warn',N('Blind corner','Pull distance'),`Add a filler at the blind corner (${lab(A)})`,`${lab(B)} butts straight into the blind corner cabinet. Put a 3" filler between them so doors, drawers and pulls clear each other, and set the blind cabinet's pull distance.`,T(A),pt,lv.id);continue;}
        if(B.type==='filler'||A.type==='filler')continue;
        if(B.type==='dw')add('warn',N('Corner','Appliance door'),'Dishwasher is tight to an inside corner',`The open dishwasher door will hit the handles on ${lab(A)}. Keep a 3" filler or a cabinet between the dishwasher and the corner.`,T(B),pt,lv.id);
        else add('warn',N('Corner','Door and drawer collision'),`Doors are blocked at the inside corner (${lab(A)})`,`${lab(B)} sits in front of ${lab(A)}'s doors or drawers. Use a blind corner or lazy Susan cabinet there, or add fillers so both sets of fronts open.`,T(A),pt,lv.id);}}
    for(const r of fx.filter(f=>f.type==='fridge')){const sd=fxSide(r);for(const s of [-1,1]){const h=nkRay(p,lv.id,fxLocal(r,s*(r.w/2-0.5),r.d/2-6),{x:sd.x*s,y:sd.y*s},[r.id],12);if(h.kind==='wall'&&h.t<2)add('warn',N('Clearance','Refrigerator door'),'Refrigerator is tight to a wall','The door may not open far enough to pull out the crisper drawers. Leave 2" to 4" or put a filler and panel between the refrigerator and the wall.',T(r),fxFrontPt(r),lv.id);}}
    const ta=cabTrimRows(p,lv.id).feAuto||[];for(const {f,side} of ta)add('tip',N('Finished ends','Exposed end'),`Exposed ${side<0?'left':'right'} end on ${lab(f)} is unfinished`,`Order a finished ${side<0?'left end (FEL)':'right end (FER)'} or an applied end panel for the side that shows.`,T(f),fxLocal(f,side*f.w/2,0),lv.id);}}
/* ---- decorative pieces in 3D: corbels, island legs or posts, refrigerator end panels ---- */
{const _t3=addCabTrim3D;addCabTrim3D=function(p,lv,add,std){_t3(p,lv,add,std);try{const fx=(p.fixtures||[]).filter(f=>f.level===lv.id&&f.status!=='demolish');
  for(const i of fx.filter(f=>f.type==='island')){const st=cabStyle(p,i);const fc=st.color?hexNum(st.color):(CAB_FIN.find(x=>x[0]===st.finish)||CAB_FIN[0])[2];const m=std('cab-'+fc,fc,{roughness:.6});const ry=-(i.rot||0)*Math.PI/180;const e0=lv.elevation+(i.elev||0);const top=cabBoxH(i);
    const B=(u,v,z,w,d,h)=>{const q=fxLocal(i,u,v);add(new THREE.BoxGeometry(w*IN,h*IN,d*IN),m,q.x*IN,(e0+z+h/2)*IN,q.y*IN,ry);};
    if(st.seating){const n=Math.ceil(i.w/36)+1;for(let k=0;k<n;k++){const u=-i.w/2+3+(i.w-6)*k/(n-1);B(u,-i.d/2-4,top-9,2.5,8,8);B(u,-i.d/2-1.5,top-14,2.5,3,5);}}
    const lg={turned2:2,turned4:4,posts2:2,posts4:4}[st.islandLegs];if(lg){const pts=lg===2?[[-1,-1],[1,-1]]:[[-1,-1],[1,-1],[-1,1],[1,1]];const r=/posts/.test(st.islandLegs)?3.5:3;
      for(const [a,b] of pts){const u=a*(i.w/2+r/2+0.5),v=b*(i.d/2-r/2);if(/posts/.test(st.islandLegs))B(u,v,0,r,r,top);else{for(const [z,h,w] of [[0,4,3.5],[4,6,2.4],[10,3,3.2],[13,top-19,2.2],[top-6,6,3.5]])B(u,v,z,w,w,h);}}}}
  if(cabStyle(p,{type:'base'}).fridgePanels)for(const r of fx.filter(f=>f.type==='fridge')){const st=cabStyle(p,{type:'tall'});const fc=st.color?hexNum(st.color):(CAB_FIN.find(x=>x[0]===st.finish)||CAB_FIN[0])[2];const m=std('cab-'+fc,fc,{roughness:.6});const ry=-(r.rot||0)*Math.PI/180;
    const nb=cabNeighbors(p,{...r,type:'base'});const H=Math.max(84,...fx.filter(f=>f.type==='wallcab').map(cabTop));for(const s of [-1,1])if(nb[s].kind!=='wall'){const q=fxLocal(r,s*(r.w/2+0.75),0);add(new THREE.BoxGeometry(1.5*IN,H*IN,Math.max(r.d,24)*IN),m,q.x*IN,(lv.elevation+H/2)*IN,q.y*IN,ry);}}}catch(e){console.warn('cabinet decor 3D',e);}};}
