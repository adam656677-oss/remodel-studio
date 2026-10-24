/* ======================= site: driveways, walks, patios, beds, fences, trees, property lines ======================= */
const SITE_TYPES={
  drive:{label:'Driveway',poly:true,surf:[['concrete','Concrete'],['asphalt','Asphalt'],['gravel','Gravel'],['pavers','Pavers']],def:'concrete'},
  patio:{label:'Patio',poly:true,surf:[['pavers','Pavers'],['concrete','Concrete'],['stone','Flagstone'],['brick','Brick']],def:'pavers'},
  walk:{label:'Walkway',line:true,surf:[['concrete','Concrete'],['pavers','Pavers'],['stone','Stepping stones'],['gravel','Gravel'],['brick','Brick']],def:'concrete'},
  bed:{label:'Planting bed',poly:true,surf:[['mulch','Mulch'],['pinestraw','Pine straw'],['rock','River rock']],def:'mulch'},
  lawn:{label:'Lawn area',poly:true,surf:[['sod','Sod'],['seed','Seed']],def:'sod'},
  fence:{label:'Fence',line:true,surf:[['privacy','Wood privacy'],['picket','Picket'],['chain','Chain link'],['rail','Split rail'],['iron','Ornamental iron'],['vinyl','Vinyl privacy']],def:'privacy'},
  retwall:{label:'Retaining wall',line:true,surf:[['block','Segmental block'],['stone','Stone'],['timber','Timber'],['concrete','Concrete']],def:'block'},
  lot:{label:'Property line',poly:true,surf:[['line','Property line']],def:'line'},
  tree:{label:'Tree',point:true,surf:[['oak','Shade tree (oak, maple)'],['pine','Evergreen (pine, cedar)'],['crepe','Ornamental (crepe myrtle)'],['palm','Palm']],def:'oak'},
  shrub:{label:'Shrub',point:true,surf:[['round','Rounded shrub'],['boxwood','Boxwood'],['grass','Ornamental grass']],def:'round'},
};
const SITE_COLOR={concrete:0xc9c6bf,asphalt:0x3e4042,gravel:0xa59f93,pavers:0xa77b62,stone:0x9a9488,brick:0xa65a44,mulch:0x5b3a26,pinestraw:0x9a6a3a,rock:0x8c8a85,sod:0x5f8f3a,seed:0x6f9a48,
  privacy:0xb08a62,picket:0xf3f1ea,chain:0x9aa0a4,rail:0x9b7b55,iron:0x2b2d2f,vinyl:0xf1efe8,block:0x9e978b,timber:0x7b5b3a};
const siteZ=p=>(groundLevel(p)?.elevation||0)-(p.settings?.gradeOffset||0);
function stripPoly(pts,w){if(pts.length<2)return [];const L=pts.map(([x,y])=>({x,y}));const left=[],right=[];const h=w/2;
  for(let i=0;i<L.length;i++){const a=L[Math.max(0,i-1)],b=L[i],c=L[Math.min(L.length-1,i+1)];const d1={x:b.x-a.x,y:b.y-a.y},d2={x:c.x-b.x,y:c.y-b.y};const n1=norm2({x:-d1.y,y:d1.x}),n2=norm2({x:-d2.y,y:d2.x});
    let n=i===0?n2:i===L.length-1?n1:norm2({x:n1.x+n2.x,y:n1.y+n2.y});const k=i===0||i===L.length-1?1:1/Math.max(0.3,(n.x*n2.x+n.y*n2.y));left.push({x:b.x+n.x*h*k,y:b.y+n.y*h*k});right.push({x:b.x-n.x*h*k,y:b.y-n.y*h*k});}
  return [...left,...right.reverse()];}
const norm2=v=>{const l=Math.hypot(v.x,v.y)||1;return {x:v.x/l,y:v.y/l};};
const lineLen=pts=>pts.reduce((s,q,i)=>i?s+Math.hypot(q[0]-pts[i-1][0],q[1]-pts[i-1][1]):0,0);
function siteOutline(o){const T=SITE_TYPES[o.type];if(T.point){const r=(o.d||(o.type==='tree'?240:42))/2;return circlePts({x:o.x,y:o.y},r,20);}if(T.line)return o.type==='walk'?stripPoly(o.pts,o.w||36):stripPoly(o.pts,Math.max(6,o.w||6));return o.pts.map(([x,y])=>({x,y}));}
regObj('site',{coll:'site',label:'Site item',plural:'site items',z:-5,layer:'under',hitStage:'late',planSheet:false,
  pts:(p,o)=>SITE_TYPES[o.type].point?[{x:o.x-(o.d||60)/2,y:o.y-(o.d||60)/2},{x:o.x+(o.d||60)/2,y:o.y+(o.d||60)/2}]:siteOutline(o),noBounds:true,
  hit:(p,o,raw,tol)=>{const T=SITE_TYPES[o.type];if(T.point)return Math.hypot(raw.x-o.x,raw.y-o.y)<=Math.max(12,(o.d||60)/2*(o.type==='tree'?0.35:0.9));
    if(T.line)return nearPolyline(raw,o.pts.map(([x,y])=>({x,y})),Math.max(tol,(o.w||6)/2+tol*0.5),false);if(o.type==='lot')return nearPolyline(raw,o.pts.map(([x,y])=>({x,y})),tol*1.2,true);return inPoly(raw.x,raw.y,o.pts);},
  move:(o,dx,dy)=>SITE_TYPES[o.type].point?{...o,x:o.x+dx,y:o.y+dy}:{...o,pts:o.pts.map(([x,y])=>[x+dx,y+dy])},
  title:o=>{const T=SITE_TYPES[o.type];const s=(T.surf.find(x=>x[0]===o.surf)||T.surf[0])[1];return T.point?s:T.line?`${T.label} · ${fmtLen(lineLen(o.pts))}`:`${T.label} · ${Math.round(polyArea(o.pts)/144)} sq ft`;},
  svg:(p,lv,o,S,view,isSel)=>{const T=SITE_TYPES[o.type];const sel=isSel?' site-sel':'';const pl=pts=>pts.map(q=>S(q.x,q.y).join(',')).join(' ');
    if(o.type==='tree'){const [x,y]=S(o.x,o.y);const r=(o.d||240)/2*view.s;const n=o.surf==='pine'?14:o.surf==='palm'?7:10;const pts=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2;const rr=i%2?r*(o.surf==='palm'?0.45:0.82):r;pts.push([x+rr*Math.cos(a),y+rr*Math.sin(a)]);}
      return html`<g><polygon points=${pts.map(q=>q.join(',')).join(' ')} className=${'tree tree-'+o.surf+sel}/><circle cx=${x} cy=${y} r=${Math.max(1.5,4*view.s)} className="tree-trunk"/></g>`;}
    if(o.type==='shrub'){const [x,y]=S(o.x,o.y);const r=(o.d||42)/2*view.s;return html`<circle cx=${x} cy=${y} r=${Math.max(2,r)} className=${'shrub'+sel}/>`;}
    if(o.type==='fence'||o.type==='retwall'){return html`<polyline points=${o.pts.map(([x,y])=>S(x,y).join(',')).join(' ')} className=${(o.type==='fence'?'fence':'retwall')+sel}/>`;}
    if(o.type==='lot')return html`<polygon points=${pl(o.pts.map(([x,y])=>({x,y})))} className=${'lotline'+sel}/>`;
    const poly=siteOutline(o);return html`<polygon points=${pl(poly)} className=${'sitep sitep-'+o.surf+sel}/>`;},
  add3D:(p,lv,o,ctx)=>{if(lv.id!==groundLevel(p).id)return;const T=SITE_TYPES[o.type];const sloped=slopeOf(p).fall>0;const oc=o.x!=null?[o.x,o.y]:o.pts&&o.pts.length?polyLabelPt(o.pts.length>2?o.pts:[...o.pts,o.pts[0]]):[0,0];const z=sloped?gradeAt(p,oc[0],oc[1]):siteZ(p);const c=o.color?hexNum(o.color):SITE_COLOR[o.surf]??0xaaaaaa;const sel=ctx.isSel(o);const m=sel?ctx.mSel:ctx.col(c,{roughness:.95});
    if(o.type==='lot')return;
    if(o.type==='tree'){const d=o.d||240,h=o.h||Math.max(144,d*1.1);const tr=ctx.col(0x5a4330,{roughness:1});ctx.cyl(o.x,o.y,z,Math.max(3,d*0.03),h*(o.surf==='palm'?0.95:0.45),tr,8,Math.max(2,d*0.022));
      const lm=sel?ctx.mSel:ctx.col(o.surf==='pine'?0x2f5530:o.surf==='crepe'?0xb85c86:o.surf==='palm'?0x4f7a33:0x4c7a35,{roughness:.9,flatShading:true});
      if(o.surf==='pine'){ctx.add(new THREE.ConeGeometry(d/2*IN,h*0.8*IN,9),lm,o.x*IN,(z+h*0.2+h*0.4)*IN,o.y*IN,0);}
      else if(o.surf==='palm'){for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const L=d*0.5;ctx.stick({x:o.x,y:o.y,z:z+h*0.95},{x:o.x+Math.cos(a)*L,y:o.y+Math.sin(a)*L,z:z+h*0.8},2,10,lm);}}
      else{const g=new THREE.IcosahedronGeometry(d/2*IN,1);ctx.add(g,lm,o.x*IN,(z+h*0.62)*IN,o.y*IN,0);if(d>120){const g2=new THREE.IcosahedronGeometry(d/2.8*IN,1);ctx.add(g2,lm,(o.x+d*0.18)*IN,(z+h*0.48)*IN,(o.y-d*0.1)*IN,0);}}return;}
    if(o.type==='shrub'){const d=o.d||42;const lm=sel?ctx.mSel:ctx.col(o.surf==='boxwood'?0x3d6b2f:o.surf==='grass'?0x9aa25a:0x4f7d3a,{roughness:.95,flatShading:true});
      if(o.surf==='grass'){ctx.add(new THREE.ConeGeometry(d/2*IN,d*IN,7),lm,o.x*IN,(z+d/2)*IN,o.y*IN,0);}else{const g=new THREE.IcosahedronGeometry(d/2*IN,1);g.scale(1,0.8,1);ctx.add(g,lm,o.x*IN,(z+d*0.38)*IN,o.y*IN,0);}return;}
    if(o.type==='fence'){const H=o.h||72;const pts=o.pts.map(([x,y])=>({x,y}));const post=ctx.col(o.surf==='iron'?0x2b2d2f:o.surf==='chain'?0x8a9095:c,{roughness:.8});
      for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1];const L=dist(a,b);const ang=Math.atan2(b.y-a.y,b.x-a.x);const n=Math.max(1,Math.ceil(L/96));
        for(let j=0;j<=n;j++){const t=j/n;const q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};if(j===0&&i>0)continue;ctx.box(q.x,q.y,sloped?gradeAt(p,q.x,q.y):siteZ(p),o.surf==='chain'||o.surf==='iron'?2.5:3.5,o.surf==='chain'||o.surf==='iron'?2.5:3.5,H+2,0,post);}
        const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const z=sloped?gradeAt(p,mid.x,mid.y):siteZ(p);
        if(o.surf==='privacy'||o.surf==='vinyl'){const t=texOf('beadboard').clone();t.needsUpdate=true;t.repeat.set(L/12/5.5*12/12*2,1);ctx.box(mid.x,mid.y,z+2,L,0.75,H-2,ang,ctx.col(c,{map:texOf('beadboard'),key:'fence-'+o.surf,roughness:.9}));}
        else if(o.surf==='picket'){const k=Math.floor(L/5.5);for(let j=0;j<k;j++){const t=(j+0.5)/k;ctx.box(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,z+2,3.5,0.75,Math.min(H,42)-2,ang,m);}ctx.box(mid.x,mid.y,z+Math.min(H,42)*0.3,L,1.5,3.5,ang,m);ctx.box(mid.x,mid.y,z+Math.min(H,42)*0.75,L,1.5,3.5,ang,m);}
        else if(o.surf==='rail'){for(const zz of [18,36])ctx.box(mid.x,mid.y,z+zz,L,3,4,ang,m);}
        else if(o.surf==='chain'){const cm=M('chainlink',()=>new THREE.MeshStandardMaterial({color:0x9aa0a4,transparent:true,opacity:.35,metalness:.6,roughness:.4,side:THREE.DoubleSide,depthWrite:false}));ctx.box(mid.x,mid.y,z+1,L,0.2,H-1,ang,cm,false);ctx.box(mid.x,mid.y,z+H-1,L,1.5,1.5,ang,post,false);}
        else if(o.surf==='iron'){const k=Math.floor(L/5);for(let j=0;j<k;j++){const t=(j+0.5)/k;ctx.box(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,z+3,0.75,0.75,H-4,ang,post,false);}for(const zz of [4,H-6])ctx.box(mid.x,mid.y,z+zz,L,1,1.5,ang,post,false);}}return;}
    if(o.type==='retwall'){const H=o.h||30;const strip=stripPoly(o.pts,o.w||12);const rm=o.surf==='block'?texMat(ctx,'block',0xffffff):o.surf==='stone'?texMat(ctx,'stone',0xffffff):m;ctx.prism(strip,z-6,z+H,rm);return;}
    const poly=siteOutline(o);if(poly.length<3)return;const th=o.type==='bed'?2:o.type==='lawn'?0.3:1.5;
    const mm=sel?ctx.mSel:o.surf==='pavers'||o.surf==='brick'?texMat(ctx,'brick',o.surf==='pavers'?0xd9c7b8:0xffffff):o.surf==='stone'?texMat(ctx,'stone',0xffffff):m;
    if(sloped){const sh=new THREE.Shape(poly.map(q=>new THREE.Vector2(q.x*IN,-q.y*IN)));const g=new THREE.ShapeGeometry(sh);g.rotateX(-Math.PI/2);const ps=g.attributes.position;
      for(let i=0;i<ps.count;i++)ps.setY(i,(gradeAt(p,ps.getX(i)/IN,ps.getZ(i)/IN)+th)*IN);ps.needsUpdate=true;g.computeVertexNormals();
      const uv=g.attributes.uv;if(uv){for(let i=0;i<uv.count;i++)uv.setXY(i,ps.getX(i)/2,ps.getZ(i)/2);uv.needsUpdate=true;}ctx.add(g,mm,0,0,0,0,false).receiveShadow=true;return;}
    ctx.prism(poly,z-0.5,z+th,mm);},
  panel:(o,{p,up})=>{const T=SITE_TYPES[o.type];return html`<div className="sec"><h3>${T.label}</h3>
    <${Field} label=${T.point?'Kind':T.line&&o.type==='fence'?'Style':'Surface'} id="si-s"><${Sel} id="si-s" value=${o.surf||T.def} onChange=${v=>up({surf:v})} options=${T.surf}/><//>
    ${o.type!=='lot'?html`<${ColorPick} id="si-c" label="Color" value=${o.color} fallback=${'#'+(SITE_COLOR[o.surf]??0xaaaaaa).toString(16).padStart(6,'0')} onChange=${v=>up({color:v})}/>`:null}
    ${T.point?html`<${Field} label=${o.type==='tree'?'Canopy spread':'Spread'} id="si-d"><${LenInput} id="si-d" value=${o.d||(o.type==='tree'?240:42)} bare="ft" onChange=${v=>v>0&&up({d:v})}/><//>${o.type==='tree'?html`<${Field} label="Height" id="si-h"><${LenInput} id="si-h" value=${o.h} bare="ft" placeholder="Auto" onChange=${v=>up({h:v})}/><//>`:null}`:null}
    ${o.type==='walk'?html`<${Field} label="Width" id="si-w"><${LenInput} id="si-w" value=${o.w||36} onChange=${v=>v>0&&up({w:v})}/><//>`:null}
    ${o.type==='fence'?html`<${Field} label="Height" id="si-fh"><${LenInput} id="si-fh" value=${o.h||72} onChange=${v=>v>0&&up({h:v})}/><//>`:null}
    ${o.type==='retwall'?html`<${Field} label="Height above grade" id="si-rh"><${LenInput} id="si-rh" value=${o.h||30} onChange=${v=>v>0&&up({h:v})}/><//><${Field} label="Thickness" id="si-rt"><${LenInput} id="si-rt" value=${o.w||12} onChange=${v=>v>0&&up({w:v})}/><//>`:null}
    ${T.poly?html`<div className="stat"><span>Area</span><span className="mono">${Math.round(polyArea(o.pts)/144)} sq ft</span></div>`:null}${T.line?html`<div className="stat"><span>Length</span><span className="mono">${fmtLen(lineLen(o.pts))}</span></div>`:null}
    ${o.type==='retwall'&&(o.h||30)>48?html`<p className="note">Retaining walls over 4 ft (measured from the bottom of the footing) need an engineered design (IRC R404.4).</p>`:null}
    ${o.type==='fence'&&(o.h||72)>72?html`<p className="note">Many cities limit back-yard fences to 6 ft and front-yard fences to 3 or 4 ft. Check local zoning.</p>`:null}</div>`;},
  takeoff:(p,add,W)=>{const C='Site and landscape';for(const o of p.site||[]){if(o.status==='existing')continue;const T=SITE_TYPES[o.type];const A=T.poly?polyArea(o.pts)/144:o.type==='walk'?lineLen(o.pts)*(o.w||36)/144:0;const L=T.line?lineLen(o.pts)/12:0;
    if(o.type==='drive'||o.type==='patio'||o.type==='walk'){if(o.surf==='concrete')add(C,`Concrete ${T.label.toLowerCase()} (4", ${o.type==='drive'?'#3 rebar or mesh':'fiber mesh'})`,Math.ceil(A*(o.type==='drive'?5:4)/12/27*W*10)/10,'CY');else if(o.surf==='asphalt')add(C,'Asphalt paving, 2" over 6" base',Math.ceil(A*W),'SF');else if(o.surf==='gravel')add(C,`Gravel ${T.label.toLowerCase()}, 4" deep`,Math.ceil(A*4/12/27*1.4*W*10)/10,'ton');else{add(C,`${(T.surf.find(x=>x[0]===o.surf)||['',''])[1]} ${T.label.toLowerCase()}`,Math.ceil(A*W),'SF');add(C,'Compacted gravel base 4" and sand bed',Math.ceil(A*5/12/27*1.4*W*10)/10,'ton');}}
    else if(o.type==='bed'){add(C,`${o.surf==='rock'?'River rock':o.surf==='pinestraw'?'Pine straw bales':'Hardwood mulch'} for beds`,o.surf==='pinestraw'?Math.ceil(A/50):Math.ceil(A*3/12/27*W*10)/10,o.surf==='pinestraw'?'bale':'CY',o.surf==='pinestraw'?'about 50 sq ft per bale':'3" deep');add(C,'Landscape edging',Math.ceil(polyPerimPts(o.pts.map(([x,y])=>({x,y})))/12),'LF');}
    else if(o.type==='lawn')add(C,o.surf==='seed'?'Grass seed and straw':'Sod',Math.ceil(A*W),'SF');
    else if(o.type==='fence'){add(C,`${(T.surf.find(x=>x[0]===o.surf)||['',''])[1]} fence, ${fmtLen(o.h||72)} high`,Math.ceil(L*W),'LF');add(C,'Fence posts set in concrete',Math.ceil(L/8)+o.pts.length,'EA','8\' o.c.');}
    else if(o.type==='retwall')add(C,`${(T.surf.find(x=>x[0]===o.surf)||['',''])[1]} retaining wall, ${fmtLen(o.h||30)} high`,Math.ceil(L*(o.h||30)/12*W),'SF face');
    else if(o.type==='tree')add(C,`${(T.surf.find(x=>x[0]===o.surf)||['',''])[1]}`,1,'EA');else if(o.type==='shrub')add(C,`${(T.surf.find(x=>x[0]===o.surf)||['',''])[1]}, 3 gal`,1,'EA');}},
});
function siteDL(dl,p,PT,k,sc){for(const o of p.site||[]){const T=SITE_TYPES[o.type];const P2=q=>PT(q.x,q.y);
  if(o.type==='tree'){const q=P2(o);const r=(o.d||240)/2*sc;const n=o.surf==='pine'?14:10;const pts=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2;const rr=i%2?r*0.82:r;pts.push([q[0]+rr*Math.cos(a),q[1]+rr*Math.sin(a)]);}dl.poly(pts,{stroke:INK,w:0.3});dl.circle(q[0],q[1],0.012*k,{fill:INK});continue;}
  if(o.type==='shrub'){const q=P2(o);dl.circle(q[0],q[1],(o.d||42)/2*sc,{stroke:INK,w:0.3});continue;}
  if(o.type==='fence'){dl.poly(o.pts.map(([x,y])=>PT(x,y)),{stroke:INK,w:0.5,close:false,dash:[0.08,0.02,0.01,0.02]});continue;}
  if(o.type==='retwall'){dl.poly(stripPoly(o.pts,o.w||12).map(P2),{stroke:INK,w:0.5,fill:'#dddddd'});continue;}
  if(o.type==='lot'){dl.poly(o.pts.map(([x,y])=>PT(x,y)),{stroke:INK,w:1.3,dash:[0.25,0.06,0.04,0.06]});continue;}
  const poly=siteOutline(o);dl.poly(poly.map(P2),{stroke:INK,w:0.45,fill:o.type==='drive'||o.type==='walk'?'#eeeeee':o.type==='patio'?'#e6e6e6':'#f6f6f6'});
  const [cx,cy]=polyLabelPt(poly.map(q=>[q.x,q.y]));const q=PT(cx,cy);if(o.type!=='lawn')dl.text(q[0],q[1],`${(T.surf.find(x=>x[0]===o.surf)||['',''])[1].toUpperCase()} ${T.label.toUpperCase()}`,{size:4.8*k,anchor:'middle'});}}
/* ---- tools ---- */
I.tree=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="9" r="6"/><path d="M12 15v6"/></svg>`;
I.drive=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 21L10 3M17 21L14 3M12 5v3M12 11v3M12 17v3"/></svg>`;
I.fence=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 21V7l2-3 2 3v14M11 21V7l2-3 2 3v14M18 21V7l2-3 2 3"/><path d="M2 10h20M2 16h20"/></svg>`;
I.patio=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18v12H3z"/><path d="M3 12h18M9 6v6M15 12v6"/></svg>`;
I.walk=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20c4-2 4-6 8-8s4-6 8-8"/><path d="M7 21c4-2 4-6 8-8s4-6 8-8" opacity=".5"/></svg>`;
I.shrub=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="14" r="4"/><circle cx="16" cy="14" r="4"/><circle cx="12" cy="9" r="4"/></svg>`;
I.lot=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 2 1 2"><path d="M3 3h18v18H3z"/></svg>`;
I.bed=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 15c3-6 15-6 18 0-3 4-15 4-18 0z"/><circle cx="9" cy="13" r="1.5"/><circle cx="14" cy="12" r="1.5"/></svg>`;
I.retwall=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 20h18M5 20V12h14v8M5 16h14M9 12v4M14 16v4"/></svg>`;
const SITE_TOOLS=[['drive','drive','Driveway','chain',true],['walk','walk','Walkway','chain',false],['patio','patio','Patio','chain',true],['bed','bed','Planting bed','chain',true],['lawn','bed','Lawn area','chain',true],['fence','fence','Fence','chain',false],['retwall','retwall','Retaining wall','chain',false],['lot','lot','Property line','chain',true],['tree','tree','Tree','click',false],['shrub','shrub','Shrub','click',false]];
for(const [type,ic,label,mode,closed] of SITE_TOOLS){const id='site-'+type;
  regTool(id,{label,group:'site',icon:I[ic],mode,min:closed?3:2,closable:closed,snap:type==='tree'||type==='shrub'?'grid':'grid',
    hint:n=>mode==='click'?html`<b>${label}:</b> click to place. Set the kind and size in the panel; keep clicking to add more.`:n?html`Click the next point${closed&&n>=3?', click the first point to close':''}; press Enter or Esc to finish.`:html`<b>${label}:</b> click the ${closed?'corners of the area':'points along the line'}. Site items sit on the ground and show on the site plan.`,
    place:(ctx,pts)=>{const T=SITE_TYPES[type];const lv=sortedLevels(ctx.p)[0];const base={id:uid('si'),level:lv.id,type,surf:T.def,status:'new'};
      const o=T.point?{...base,x:pts[0].x,y:pts[0].y,d:type==='tree'?240:42}:{...base,pts:pts.map(q=>[q.x,q.y]),...(type==='walk'?{w:36}:{}),...(type==='fence'?{h:72}:{}),...(type==='retwall'?{h:30,w:12}:{})};
      if(!T.point&&pts.length<(closed?3:2))return null;return {p:{...ctx.p,site:[...(ctx.p.site||[]),o]},sel:{kind:'site',id:o.id},tool:T.point?undefined:'select'};}});
  addToolToGroup('site',id);}

/* ======================= plumbing and HVAC symbols ======================= */
const MEP={
  wh:{label:'Water heater (tank)',cat:'Plumbing',d:22,h:60,shape:'round'},whTankless:{label:'Water heater (tankless)',cat:'Plumbing',w:14,dp:8,h:24,wall:true,z:48},
  hosebibb:{label:'Hose bibb (exterior faucet)',cat:'Plumbing',w:3,dp:3,h:3,wall:true,z:18},cleanout:{label:'Sewer cleanout',cat:'Plumbing',d:6,h:2,shape:'round'},
  floordrain:{label:'Floor drain',cat:'Plumbing',d:6,h:0.5,shape:'round'},waterMeter:{label:'Water meter',cat:'Plumbing',d:12,h:2,shape:'round'},gasMeter:{label:'Gas meter',cat:'Plumbing',w:14,dp:10,h:18,wall:true,z:24},
  sumpPump:{label:'Sump pump',cat:'Plumbing',d:18,h:3,shape:'round'},softener:{label:'Water softener',cat:'Plumbing',d:12,h:44,shape:'round'},
  condenser:{label:'AC condenser or heat pump (outside)',cat:'HVAC',w:30,dp:30,h:32},airHandler:{label:'Air handler or furnace',cat:'HVAC',w:22,dp:28,h:52},
  minisplit:{label:'Mini-split head (wall)',cat:'HVAC',w:32,dp:9,h:12,wall:true,z:84},supply:{label:'Supply register (floor)',cat:'HVAC',w:12,dp:4,h:0.4},
  supplyCeil:{label:'Supply register (ceiling)',cat:'HVAC',w:10,dp:10,h:0.4,ceil:true},returnGrille:{label:'Return grille (wall)',cat:'HVAC',w:20,dp:1,h:20,wall:true,z:12},
  thermostat:{label:'Thermostat',cat:'HVAC',w:4,dp:1,h:5,wall:true,z:52},dryerVent:{label:'Dryer vent',cat:'HVAC',w:4,dp:2,h:4,wall:true,z:18},
};
const MEP_SYM={wh:'WH',whTankless:'TWH',hosebibb:'HB',cleanout:'CO',floordrain:'FD',waterMeter:'WM',gasMeter:'GM',sumpPump:'SP',softener:'WS',condenser:'AC',airHandler:'AH',minisplit:'MS',supply:'S',supplyCeil:'S',returnGrille:'R',thermostat:'T',dryerVent:'DV'};
regObj('mep',{coll:'mep',label:'Plumbing or HVAC',plural:'plumbing and HVAC items',z:2,layer:'over',
  pts:(p,o)=>[{x:o.x,y:o.y}],hit:(p,o,raw,tol)=>{const t=MEP[o.type]||{};const r=Math.max(tol,(t.d||Math.max(t.w||8,t.dp||8))/2);return Math.hypot(raw.x-o.x,raw.y-o.y)<=r;},
  move:(o,dx,dy)=>({...o,x:o.x+dx,y:o.y+dy}),rotate:o=>({rot:((o.rot||0)+90)%360}),title:o=>(MEP[o.type]||{}).label||'Item',
  svg:(p,lv,o,S,view,isSel)=>{const t=MEP[o.type]||{};const [x,y]=S(o.x,o.y);const cls='mep'+(isSel?' mep-sel':'');const a=(o.rot||0);
    const shape=t.shape==='round'?html`<circle cx=${x} cy=${y} r=${Math.max(5,(t.d||12)/2*view.s)} className=${cls}/>`:(()=>{const w=Math.max(8,(t.w||12)*view.s),h=Math.max(6,(t.dp||8)*view.s);return html`<rect x=${x-w/2} y=${y-h/2} width=${w} height=${h} className=${cls} transform=${`rotate(${a} ${x} ${y})`}/>`;})();
    return html`<g>${shape}${view.s>0.35?html`<text x=${x} y=${y+3.5} textAnchor="middle" className="mep-t">${MEP_SYM[o.type]||'?'}</text>`:null}</g>`;},
  dl:(dl,p,lv,o,PT,k,sc)=>{const t=MEP[o.type]||{};const q=PT(o.x,o.y);if(t.shape==='round')dl.circle(q[0],q[1],Math.max(0.05*k,(t.d||12)/2*sc),{stroke:INK,w:0.5,fill:'#ffffff'});else{const w=Math.max(0.08*k,(t.w||12)*sc)/2,h=Math.max(0.06*k,(t.dp||8)*sc)/2;dl.poly([[q[0]-w,q[1]-h],[q[0]+w,q[1]-h],[q[0]+w,q[1]+h],[q[0]-w,q[1]+h]],{stroke:INK,w:0.5,fill:'#ffffff'});}dl.text(q[0],q[1]+0.03*k,MEP_SYM[o.type]||'',{size:4.5*k,anchor:'middle',bold:true});},
  add3D:(p,lv,o,ctx)=>{const t=MEP[o.type]||{};const m=ctx.matFor(o,t.cat==='HVAC'?(o.type==='condenser'?0x9ea3a6:0xf2f2ee):(o.type==='wh'?0xe9e8e2:0xb9bcc0),{roughness:.5,metalness:.15});
    let z=lv.elevation+(t.ceil?lv.height-(t.h||1):t.z||0);if(o.type==='condenser'){z=siteZ(p);ctx.box(o.x,o.y,z,(t.w||30)+6,(t.dp||30)+6,3,0,ctx.col(0xbdb9b1));z+=3;}
    if(t.shape==='round')ctx.cyl(o.x,o.y,z,(t.d||12)/2,t.h||2,m,20);else ctx.box(o.x,o.y,z,t.w||12,t.dp||8,t.h||2,(o.rot||0)*Math.PI/180,m);},
  panel:(o,{up})=>html`<div className="sec"><h3>Item</h3><${Field} label="Type" id="mp-t"><${Sel} id="mp-t" value=${o.type} onChange=${v=>up({type:v})} options=${Object.entries(MEP).map(([k,v])=>[k,v.cat+': '+v.label])}/><//>
    <${Field} label="Notes" id="mp-n"><input id="mp-n" className="inp" value=${o.note||''} onChange=${e=>up({note:e.target.value})}/><//>
    ${o.type==='wh'?html`<p className="note">Gas water heaters in a garage must sit 18" above the floor (M1307.3) and be protected from vehicles; provide a pan and relief line (P2801.6, P2804.6.1).</p>`:null}
    ${o.type==='condenser'?html`<p className="note">Keep the clearances in the manufacturer's instructions; set it on a pad above grade.</p>`:null}</div>`,
  takeoff:(p,add)=>{for(const o of p.mep||[]){if(o.status==='existing')continue;const t=MEP[o.type];if(!t)continue;add(t.cat==='HVAC'?'HVAC':'Plumbing',t.label,1,'EA');}},
});
I.plumb=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h8v4h8v8"/><path d="M17 18h6"/><circle cx="5" cy="6" r="2"/></svg>`;
I.hvac=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="12" cy="12" r="4"/><path d="M12 8v8M8 12h8"/></svg>`;
for(const [cat,ic,id,def] of [['Plumbing','plumb','mep-plumb','wh'],['HVAC','hvac','mep-hvac','supply']]){
  regTool(id,{label:cat+' item',group:'mep',icon:I[ic],mode:'click',hint:()=>html`<b>${cat}:</b> click to place a ${MEP[def].label.toLowerCase()}; change the type in the panel. Each click adds another of the same type.`,
    place:(ctx,[pt])=>{const last=ctx.p.mep&&[...ctx.p.mep].reverse().find(o=>(MEP[o.type]||{}).cat===cat);const type=last?last.type:def;let x=pt.x,y=pt.y;
      if((MEP[type]||{}).wall){const nw=ctx.nearestWall(pt);if(nw){x=nw.pr.x;y=nw.pr.y;}}
      const o={id:uid('mp'),level:ctx.lv.id,type,x,y,rot:0,status:'new'};return {p:{...ctx.p,mep:[...(ctx.p.mep||[]),o]},sel:{kind:'mep',id:o.id}};}});
  addToolToGroup('mep',id);}
