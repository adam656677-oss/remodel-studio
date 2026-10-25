/* ======================= color-by views (Archicad Graphic Overrides, Revit view filters) ======================= */
// A rule maps each wall, room, opening or placed item to a {key,label,color}. Plans draw a tinted overlay; 3D swaps materials.
const CB_PAL=['#2f6fdb','#e0861a','#2a9d6a','#c2410c','#7c3aed','#0e9fb0','#b8325a','#8a6d1f','#4b5563','#d946ef','#65a30d','#0369a1'];
function cbCat(keys){const m={};keys.forEach((k,i)=>m[k]=CB_PAL[i%CB_PAL.length]);return m;}
function cbRamp(t){t=Math.max(0,Math.min(1,t));const a=[42,157,106],b=[224,164,58],c=[217,83,79];const L=(x,y,u)=>Math.round(x+(y-x)*u);const [p,q,u]=t<0.5?[a,b,t*2]:[b,c,(t-0.5)*2];return '#'+[L(p[0],q[0],u),L(p[1],q[1],u),L(p[2],q[2],u)].map(v=>v.toString(16).padStart(2,'0')).join('');}
const STATUS_C={existing:['Existing','#8a96a3'],new:['New','#2a9d6a'],demolish:['Remove','#d9534f']};
function fxCatName(f){const it=f.lib&&LIB_BY_ID[f.lib];if(it&&it.appl)return 'Appliances';if(isCab(f))return 'Cabinets';if(PLUMB_T.has(f.type))return 'Plumbing fixtures';if(isDecor(f))return 'Furniture and decor';return (it&&it.cat)||((FIXTURES[f.type]||{}).cat)||'Other';}
function fxVendor(p,f){const it=f.lib&&LIB_BY_ID[f.lib];if(it&&it.appl)return it.appl.brand;if(it&&it.vendor==='kraftmaid')return 'KraftMaid';if(isCab(f)){const v=cabStyle(p,f).vendor;return v?((typeof cabVendor==='function'&&(cabVendor(v)||{}).name)||v):'Generic cabinets';}if(it&&it.brand)return it.brand;return null;}
function fxPrice(p,f){const it=f.lib&&LIB_BY_ID[f.lib];if(it&&it.appl&&it.appl.price)return it.appl.price;if(isCab(f)){try{return cabPrice(p,f);}catch(e){}}const n=f.name||(FIXTURES[f.type]||{}).label;const v=DEFAULT_PRICES['Fixtures and cabinets|'+n]??DEFAULT_PRICES['Appliances|'+n];return v??null;}
const ORDER_ST=[['choosing','Choosing','#9aa5b1'],['approved','Approved','#2f6fdb'],['ordered','Ordered','#e0a43a'],['delivered','Delivered','#7c3aed'],['installed','Installed','#2a9d6a']];
const COLOR_BY=[
  {id:'status',label:'Remodel status',kinds:['wall','opening','fixture'],of:(p,o)=>{const s=STATUS_C[o.status||'new']||STATUS_C.new;return {key:o.status||'new',label:s[0],color:s[1]};}},
  {id:'category',label:'Item category',kinds:['fixture'],of:(p,o,k,ctx)=>{const c=fxCatName(o);return {key:c,label:c,color:ctx.cat(c)};}},
  {id:'vendor',label:'Vendor or brand',kinds:['fixture'],of:(p,o,k,ctx)=>{const v=fxVendor(p,o);return v?{key:v,label:v,color:ctx.cat(v)}:null;}},
  {id:'order',label:'Order status',kinds:['fixture'],of:(p,o)=>{const t=typeof trackFor==='function'?trackFor(p,typeof trackKeyOfFx==='function'?trackKeyOfFx(o):'fx:'+o.id):null;const st=(t&&t.status)||'choosing';const d=ORDER_ST.find(x=>x[0]===st)||ORDER_ST[0];return {key:d[0],label:d[1],color:d[2]};}},
  {id:'lead',label:'Lead time',kinds:['fixture'],of:(p,o)=>{const t=typeof trackFor==='function'?trackFor(p,typeof trackKeyOfFx==='function'?trackKeyOfFx(o):'fx:'+o.id):null;const d=t&&+t.lead;if(!d)return null;const b=d<=7?['≤ 1 week',0]:d<=21?['1–3 weeks',0.45]:d<=42?['3–6 weeks',0.75]:['Over 6 weeks',1];return {key:b[0],label:b[0],color:cbRamp(b[1]),rank:b[1]};}},
  {id:'cost',label:'Cost',kinds:['fixture'],of:(p,o)=>{const v=fxPrice(p,o);if(v==null)return null;const b=v<250?['Under $250',0]:v<1000?['$250–1,000',0.35]:v<3000?['$1,000–3,000',0.7]:['Over $3,000',1];return {key:b[0],label:b[0],color:cbRamp(b[1]),rank:b[1]};}},
  {id:'issues',label:'Issues',kinds:['wall','opening','fixture','room'],of:(p,o,k,ctx)=>{const s=ctx.iss[k+':'+o.id];return s?{key:s,label:s==='error'?'Has an error':s==='warn'?'Has a warning':'Has a tip',color:s==='error'?'#d9534f':s==='warn'?'#e0a43a':'#2f6fdb',rank:s==='error'?1:s==='warn'?0.5:0}:null;}},
  {id:'bearing',label:'Bearing walls',kinds:['wall'],of:(p,o)=>o.bearing||o.kind==='exterior'?{key:'b',label:'Bearing or exterior',color:'#c2410c'}:{key:'n',label:'Non-bearing',color:'#2f6fdb'}},
  {id:'roomuse',label:'Room use',kinds:['room'],of:(p,o,k,ctx)=>{const u=o.use||'other';const lab=u.charAt(0).toUpperCase()+u.slice(1);return {key:u,label:lab,color:ctx.cat(u)};}},
  {id:'finish',label:'Floor finish',kinds:['room'],of:(p,o,k,ctx)=>{const f=roomFloor(o);const lab=(typeof FLOOR_FINISH!=='undefined'&&FLOOR_FINISH[f]&&FLOOR_FINISH[f].label)||f;return {key:f,label:lab,color:ctx.cat(f)};}},
];
const _cbCtx=new WeakMap();
function cbContext(p){let c=_cbCtx.get(p);if(c)return c;const iss={};const rank={error:3,warn:2,tip:1};for(const i of runChecks(p)){if(!i.target||!i.target.id)continue;const k=i.target.kind+':'+i.target.id;if(!iss[k]||rank[i.sev]>rank[iss[k]])iss[k]=i.sev;}
  const keys=[];const cat=k=>{let i=keys.indexOf(k);if(i<0){keys.push(k);i=keys.length-1;}return CB_PAL[i%CB_PAL.length];};c={iss,cat};_cbCtx.set(p,c);return c;}
function cbItems(p,lv,cb){const ctx=cbContext(p);const out=[];const push=(k,o)=>{if(!cb.kinds.includes(k))return;const r=cb.of(p,o,k,ctx);if(r)out.push({k,o,...r});};
  for(const r of p.rooms.filter(r=>r.level===lv.id))push('room',r);for(const w of p.walls.filter(w=>w.level===lv.id))push('wall',w);
  for(const o of p.openings){const w=p.walls.find(w=>w.id===o.wall);if(w&&w.level===lv.id)push('opening',o);}for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id))push('fixture',f);return out;}
function colorFilter(filter,id){const cb=COLOR_BY.find(c=>c.id===id);if(!cb)return filter;const base=filter&&filter.overlay;
  return {...filter,overlay:(p,lv,S,view)=>{const items=cbItems(p,lv,cb);const els=[];
    for(const it of items){const c=it.color;if(it.k==='room')els.push(html`<polygon key=${'r'+it.o.id} points=${it.o.pts.map(q=>S(q[0],q[1]).join(',')).join(' ')} fill=${c} fillOpacity="0.22" stroke="none" pointerEvents="none"/>`);
      else if(it.k==='wall'){const [x1,y1]=S(it.o.x1,it.o.y1),[x2,y2]=S(it.o.x2,it.o.y2);els.push(html`<line key=${'w'+it.o.id} x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke=${c} strokeOpacity="0.75" strokeWidth=${Math.max(4,(it.o.thick||4.5)*view.s*0.9)} strokeLinecap="butt" pointerEvents="none"/>`);}
      else if(it.k==='opening'){const cc=openingCenter(p,it.o);if(cc){const [x,y]=S(cc.x,cc.y);els.push(html`<circle key=${'o'+it.o.id} cx=${x} cy=${y} r=${Math.max(5,it.o.width*view.s*0.35)} fill=${c} fillOpacity="0.45" stroke=${c} pointerEvents="none"/>`);}}
      else{const pts=fxCorners(it.o).map(q=>S(q.x,q.y).join(',')).join(' ');els.push(html`<polygon key=${'f'+it.o.id} points=${pts} fill=${c} fillOpacity="0.5" stroke=${c} strokeWidth="1.5" pointerEvents="none"/>`);}}
    return html`${base?base(p,lv,S,view):null}<g className="cb-over">${els}</g>`;}};}
function cbLegendRows(p,lv,cb){const m=new Map();for(const it of cbItems(p,lv,cb)){const r=m.get(it.key)||{label:it.label,color:it.color,n:0,rank:it.rank??0};r.n++;m.set(it.key,r);}return [...m.values()].sort((a,b)=>(a.rank-b.rank)||a.label.localeCompare(b.label));}
function ColorByLegend({p,lv,cb,onClose}){const rows=cbLegendRows(p,lv,cb);
  return html`<div className="cb-legend" role="region" aria-label=${'Colored by '+cb.label}><header><b>${cb.label}</b><button className="dz-mini" onClick=${onClose} aria-label="Back to normal colors" title="Back to normal colors">×</button></header>
    ${rows.length?html`<ul>${rows.map(r=>html`<li key=${r.label}><i style=${{background:r.color}}></i><span>${r.label}</span><b>${r.n}</b></li>`)}</ul>`:html`<p className="note">Nothing on ${lv.name} has a value for this yet.</p>`}</div>`;}
// 3D: swap the material of every tagged mesh that has a color
function tint3D(model,p,id){const cb=COLOR_BY.find(c=>c.id===id);if(!cb||!model)return;const ctx=cbContext(p);const memo=new Map();const mats=new Map();const gray=new THREE.MeshStandardMaterial({color:0xd5d9de,roughness:0.9,transparent:true,opacity:0.55});
  const colorOf=tag=>{const k=tag.kind+':'+tag.id;if(memo.has(k))return memo.get(k);let c=null;if(cb.kinds.includes(tag.kind)){const o=findObj(p,tag);if(o){const r=cb.of(p,o,tag.kind,ctx);c=r?r.color:null;}}memo.set(k,c);return c;};
  const visit=(obj,tag)=>{const t=obj.userData&&obj.userData.tag&&obj.userData.tag.id?obj.userData.tag:tag;if(obj.isMesh){const c=t?colorOf(t):null;if(c){let m=mats.get(c);if(!m){m=new THREE.MeshStandardMaterial({color:new THREE.Color(c),roughness:0.7,metalness:0});mats.set(c,m);}obj.material=m;}else if(!(t&&t.kind==='foundation'))obj.material=gray;}
    for(const ch of obj.children)visit(ch,t);};visit(model,null);}
