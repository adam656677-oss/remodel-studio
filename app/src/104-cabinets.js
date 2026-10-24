/* ======================= cabinets: configurator, fronts, countertops, crown, numbering, NKBA, price books ======================= */
const CAB_KINDS=new Set(['base','sinkbase','wallcab','tall','island','vanity','filler']);
const isCab=f=>CAB_KINDS.has(f.type);
const CAB_STYLES=[['shaker','Shaker'],['raised','Raised panel'],['flat','Slab (flat)'],['beadboard','Beadboard'],['inset','Inset shaker'],['louver','Louvered']];
const CAB_FIN=[['white','Painted white',0xf2f1ec],['linen','Painted linen',0xe9e2d3],['greige','Painted greige',0xb8afa2],['gray','Painted gray',0x8f969a],['sage','Painted sage',0x9aab8f],['navy','Painted navy',0x2e3e5c],['black','Painted black',0x2a2a2a],
  ['maple','Natural maple',0xd8b98a],['oak','Natural oak',0xc9a06a],['hickory','Rustic hickory',0xb88a5a],['cherry','Cherry',0x8e4a2f],['walnut','Walnut',0x5e4030],['espresso','Espresso',0x3b2a22]];
const CAB_HW=[['bar','Bar pulls'],['cup','Cup pulls and knobs'],['knob','Knobs'],['edge','Edge pulls'],['none','None (push to open)']];
const HW_FIN=[['nickel','Brushed nickel',0xb9bbb8],['black','Matte black',0x222222],['brass','Satin brass',0xc8a45a],['bronze','Oil-rubbed bronze',0x4a3628],['chrome','Polished chrome',0xdadada]];
const COUNTER_MATS=[['quartz','Quartz',0xe8e6e1],['granite','Granite',0x8a8174],['marble','Marble',0xf0efec],['laminate','Laminate',0xdcd6cc],['butcher','Butcher block',0xb8875a],['solid','Solid surface',0xf3f1ea],['concrete','Concrete',0xa7a49c]];
const EDGES=[['eased','Eased'],['bevel','Bevel'],['bullnose','Full bullnose'],['ogee','Ogee'],['mitered','Mitered 3"']];
const CAB_LINES=[['stock','Stock (builder grade)',1],['semi','Semi-custom',1.6],['custom','Custom',2.6]];
const CAB_LAYOUTS={base:[['door-drawer','Drawer over doors'],['doors','Full-height doors'],['drawers3','3 drawers'],['drawers4','4 drawers'],['open','Open shelves'],['trash','Pull-out trash']],
  sinkbase:[['false-doors','False front over doors'],['doors','Full-height doors'],['open-knee','Open knee space (ADA)']],
  wallcab:[['doors','Doors'],['glass','Glass doors'],['open','Open shelves'],['lift','Lift-up door']],
  tall:[['pantry','Pantry doors (upper and lower)'],['oven','Wall oven opening'],['broom','Full-height door']],
  vanity:[['door-drawer','Drawer over doors'],['doors','Doors'],['drawers3','3 drawers']],island:[['door-drawer','Drawers over doors'],['drawers3','3 drawers']],filler:[['filler','Filler']]};
const cabBoxH=f=>['base','sinkbase','vanity','island'].includes(f.type)&&!f.lib&&f.h>34.75?f.h-1.5:f.h;
function cabStyle(p,f){return {line:'semi',style:'shaker',finish:'white',color:null,hw:'bar',hwFin:'nickel',toe:4.5,crown:true,lightRail:false,frame:'framed',...(p.settings?.cab||{}),...(f.cab||{})};}
function cabLayout(f){const c=f.cab||{};if(c.layout)return c.layout;const lib=f.lib||'';if(/drawer/.test(lib))return 'drawers3';if(/ada/.test(lib))return 'open-knee';
  return {base:'door-drawer',sinkbase:'false-doors',wallcab:'doors',tall:/oven/.test(lib)?'oven':'pantry',vanity:'door-drawer',island:'door-drawer',filler:'filler'}[f.type]||'doors';}
function cabSku(f){const c=f.cab||{};if(c.sku)return c.sku;const W=Math.round(f.w),H=Math.round(f.h),L=cabLayout(f);
  switch(f.type){case 'base':return (L.startsWith('drawers')?'DB':L==='trash'?'BWB':'B')+W;case 'sinkbase':return (L==='open-knee'?'SBA':'SB')+W;case 'wallcab':return (Math.round(f.d)>=24?'W'+W+H+'-24':'W'+W+H)+(L==='glass'?'-GD':'');
    case 'tall':return (L==='oven'?'OC':'U')+W+Math.round(f.d)+H;case 'vanity':return 'V'+W+Math.round(f.d);case 'island':return 'B'+W+'-ISL';case 'filler':return f.elev>12?'WF'+W+H:'BF'+W;default:return f.type.toUpperCase();}}
// front panels in local coordinates: u from -w/2 to w/2 (left to right looking at the front), z from the cabinet bottom
function cabFronts(p,f){const st=cabStyle(p,f);const L=cabLayout(f);const W=f.w,H=cabBoxH(f);const g=0.125;const toe=['base','sinkbase','tall','vanity','island'].includes(f.type)?st.toe:0;const out=[];
  const u0=-W/2+g,u1=W/2-g;const leaves=(z0,z1,kind='door')=>{if(W>24&&kind!=='drawer'){out.push({kind,u0,u1:-g/2,z0,z1,hinge:'L'},{kind,u0:g/2,u1,z0,z1,hinge:'R'});}else out.push({kind,u0,u1,z0,z1,hinge:f.cab&&f.cab.hinge||'L'});};
  if(f.type==='filler'){out.push({kind:'panel',u0:-W/2,u1:W/2,z0:toe,z1:H});return {fronts:out,toe};}
  const top=H-(['base','sinkbase','vanity','island'].includes(f.type)?0:0);const zt=top-g;
  if(L==='doors'||L==='broom')leaves(toe+g,zt);
  else if(L==='glass')leaves(g,zt,'glass');
  else if(L==='open'||L==='open-knee'){out.push({kind:'open',u0,u1,z0:toe+g,z1:zt});}
  else if(L==='lift')out.push({kind:'door',u0,u1,z0:g,z1:zt,lift:true});
  else if(L==='door-drawer'){const dz=zt-5.75;out.push({kind:'drawer',u0,u1,z0:dz+g,z1:zt});leaves(toe+g,dz-g/2);}
  else if(L==='false-doors'){const dz=zt-5.75;out.push({kind:'false',u0,u1,z0:dz+g,z1:zt});leaves(toe+g,dz-g/2);}
  else if(L==='drawers3'||L==='drawers4'||L==='trash'){const n=L==='drawers4'?4:L==='trash'?2:3;const avail=zt-(toe+g);const parts=n===3?[0.25,0.33,0.42]:n===4?[0.19,0.24,0.27,0.30]:[0.2,0.8];let z=zt;
    for(let i=0;i<n;i++){const h=avail*parts[i];out.push({kind:'drawer',u0,u1,z0:z-h+g/2,z1:z-g/2});z-=h;}}
  else if(L==='pantry'){const split=toe+(H-toe)*0.45;leaves(toe+g,split-g/2);leaves(split+g/2,zt);}
  else if(L==='oven'){out.push({kind:'drawer',u0,u1,z0:toe+g,z1:toe+11});out.push({kind:'appliance',u0:u0+1,u1:u1-1,z0:toe+12,z1:toe+40});leaves(toe+41,zt);}
  else leaves(toe+g,zt);
  return {fronts:out,toe};}
// price: catalog price if the cabinet came from a price book, otherwise a planning price from the generic line
const CAB_RATE={base:9.5,sinkbase:8,wallcab:7.5,tall:16,vanity:9,island:11,filler:2.5};
function cabPrice(p,f){const c=f.cab||{};if(c.price!=null)return +c.price;const st=cabStyle(p,f);const line=(CAB_LINES.find(x=>x[0]===st.line)||CAB_LINES[1])[2];
  let base=(CAB_RATE[f.type]||8)*f.w*(f.type==='wallcab'?f.h/30:1);const L=cabLayout(f);if(/drawers/.test(L))base*=1.45;if(L==='trash')base*=1.6;if(L==='glass')base*=1.35;
  const sm={raised:1.08,inset:1.3,beadboard:1.05,louver:1.15}[st.style]||1;const fin=/^(white|linen|greige|gray|sage|navy|black)$/.test(st.finish)?1.1:1;
  return Math.round(base*line*sm*fin/5)*5;}
// numbering: per level, sorted around each room so numbers read in order on the elevations
function cabNumbers(p){const m={};let n=1;for(const lv of sortedLevels(p)){const cabs=(p.fixtures||[]).filter(f=>f.level===lv.id&&isCab(f)&&f.status!=='demolish');
    const key=f=>{const r=p.rooms.find(r=>r.level===lv.id&&inPoly(f.x,f.y,r.pts));const c=r?polyLabelPt(r.pts):[0,0];const a=Math.atan2(f.y-c[1],f.x-c[0]);return [r?p.rooms.indexOf(r):999,f.type==='wallcab'?1:0,a];};
    cabs.sort((a,b)=>{const A=key(a),B=key(b);return A[0]-B[0]||A[1]-B[1]||A[2]-B[2];});for(const f of cabs)m[f.id]=n++;}return m;}

/* ---- countertops: union of the base cabinet tops with overhang, cut for sinks, with backsplash on wall sides ---- */
function counterSet(p){return {mat:'quartz',edge:'eased',thick:1.25,overhang:1,splash:'4',color:null,...(p.settings?.counter||{})};}
function counterGeo(p,lvId){const cs=counterSet(p);const cabs=(p.fixtures||[]).filter(f=>f.level===lvId&&f.status!=='demolish'&&(['base','sinkbase','island','vanity','dw'].includes(f.type)||(f.type==='filler'&&(f.elev||0)<12)));if(!cabs.length)return [];
  const groups={};for(const f of cabs){const top=f.type==='dw'?34.5+cs.thick:Math.round(((f.elev||0)+cabBoxH(f)+(f.type==='filler'?0:cs.thick))*4)/4;const k=f.cab&&f.cab.counterTop!=null?f.cab.counterTop:top;(groups[k]=groups[k]||[]).push(f);}
  const out=[];
  for(const [topS,list] of Object.entries(groups)){const top=+topS;if(list.every(f=>f.type==='dw'))continue;
    const rects=list.map(f=>{const back=f.type==='island'?(f.cab&&f.cab.seating?12:cs.overhang):0;const fr=f.type==='island'?cs.overhang:cs.overhang;return [[-f.w/2,-f.d/2-back],[f.w/2,-f.d/2-back],[f.w/2,f.d/2+fr],[-f.w/2,f.d/2+fr]].map(([a,b])=>fxLocal(f,a,b));});
    // islands get a 1" overhang at the ends too
    const xs=rects.flat().map(q=>q.x),ys=rects.flat().map(q=>q.y);const g=0.5;const x0=Math.min(...xs)-2,y0=Math.min(...ys)-2,nx=Math.ceil((Math.max(...xs)-x0+2)/g),ny=Math.ceil((Math.max(...ys)-y0+2)/g);if(nx*ny>4e6)continue;
    const fill=new Uint8Array(nx*ny);for(const R of rects){const rx=R.map(q=>q.x),ry=R.map(q=>q.y);const i0=Math.max(0,Math.floor((Math.min(...rx)-x0)/g)),i1=Math.min(nx-1,Math.ceil((Math.max(...rx)-x0)/g)),j0=Math.max(0,Math.floor((Math.min(...ry)-y0)/g)),j1=Math.min(ny-1,Math.ceil((Math.max(...ry)-y0)/g));
      const P=R.map(q=>[q.x,q.y]);for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)if(inPoly(x0+(i+0.5)*g,y0+(j+0.5)*g,P))fill[j*nx+i]=1;}
    for(const loop of maskLoops(fill,nx,ny,x0,y0,g)){const pts=simplifyLoop(loop,0.45);if(pts.length<3)continue;
      const holes=list.filter(f=>f.type==='sinkbase'&&inPoly(f.x,f.y,pts.map(q=>[q.x,q.y]))&&cabLayout(f)!=='open-knee').map(f=>{const sw=Math.min(f.w-6,33),sd=Math.min(f.d-6,18);return [[-sw/2,-sd/2+0.5],[sw/2,-sd/2+0.5],[sw/2,sd/2+0.5],[-sw/2,sd/2+0.5]].map(([a,b])=>fxLocal(f,a,b));});
      // backsplash along edges that sit against a wall face
      const walls=p.walls.filter(w=>w.level===lvId&&w.status!=='demolish');const splash=[];
      for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];const L=dist(a,b);if(L<3)continue;const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const on=walls.some(w=>{const pr=projSeg(m,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});return Math.abs(pr.d-w.thick/2)<1.2&&pr.tRaw>-0.02&&pr.tRaw<1.02;});if(on)splash.push([a,b]);}
      out.push({pts,holes,top,thick:cs.thick,splash,set:cs,area:polyArea(pts.map(q=>[q.x,q.y]))-holes.reduce((s,h)=>s+polyArea(h.map(q=>[q.x,q.y])),0)});}}
  return out;}
function maskLoops(fill,nx,ny,x0,y0,g){const edges=new Map();const key=(i,j)=>i+','+j;const F=(i,j)=>i>=0&&j>=0&&i<nx&&j<ny&&fill[j*nx+i];
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){if(!fill[j*nx+i])continue;if(!F(i,j-1))edges.set(key(i+1,j),[i,j]);if(!F(i,j+1))edges.set(key(i,j+1),[i+1,j+1]);if(!F(i-1,j))edges.set(key(i,j),[i,j+1]);if(!F(i+1,j))edges.set(key(i+1,j+1),[i+1,j]);}
  const loops=[];const seen=new Set();for(const [k0] of edges){if(seen.has(k0))continue;const loop=[];let k=k0,guard=0;while(!seen.has(k)&&guard++<1e6){seen.add(k);const [a,b]=k.split(',').map(Number);loop.push({x:x0+a*g,y:y0+b*g});const n=edges.get(k);if(!n)break;k=key(...n);}
    if(loop.length>3){let s=0;for(let i=0;i<loop.length;i++){const a=loop[i],b=loop[(i+1)%loop.length];s+=a.x*b.y-b.x*a.y;}if(s<0)loops.push(loop);}} // outer loops only
  return loops;}
function simplifyLoop(loop,tol){const P=loop.map(q=>[q.x,q.y]);const dp=(pts)=>{if(pts.length<3)return pts;let md=0,mi=0;const a=pts[0],b=pts[pts.length-1];for(let i=1;i<pts.length-1;i++){const d=projSeg({x:pts[i][0],y:pts[i][1]},{x:a[0],y:a[1]},{x:b[0],y:b[1]}).d;if(d>md){md=d;mi=i;}}
    return md>tol?[...dp(pts.slice(0,mi+1)).slice(0,-1),...dp(pts.slice(mi))]:[a,b];};let far=0;for(let i=1;i<P.length;i++)if(Math.hypot(P[i][0]-P[0][0],P[i][1]-P[0][1])>Math.hypot(P[far][0]-P[0][0],P[far][1]-P[0][1]))far=i;
  const r=[...dp(P.slice(0,far+1)).slice(0,-1),...dp([...P.slice(far),P[0]]).slice(0,-1)];return r.map(([x,y])=>({x:Math.round(x*8)/8,y:Math.round(y*8)/8}));}

/* ---- 3D cabinets ---- */
const _cabTex={};function cabTex(style){if(_cabTex[style])return _cabTex[style];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,128,128);
  if(style==='shaker'||style==='inset'){g.fillStyle='rgba(0,0,0,0.16)';g.fillRect(18,18,92,4);g.fillRect(18,18,4,92);g.fillStyle='rgba(255,255,255,0.6)';g.fillRect(18,106,92,4);g.fillRect(106,18,4,92);g.fillStyle='rgba(0,0,0,0.05)';g.fillRect(22,22,84,84);}
  else if(style==='raised'){g.fillStyle='rgba(0,0,0,0.12)';g.fillRect(16,16,96,6);g.fillRect(16,16,6,96);g.fillStyle='rgba(255,255,255,0.55)';g.fillRect(16,106,96,6);g.fillRect(106,16,6,96);g.fillStyle='rgba(0,0,0,0.08)';g.fillRect(30,30,68,4);g.fillRect(30,30,4,68);g.fillStyle='rgba(255,255,255,0.5)';g.fillRect(30,94,68,4);g.fillRect(94,30,4,68);}
  else if(style==='beadboard'){g.fillStyle='rgba(0,0,0,0.14)';g.fillRect(14,14,100,3);g.fillRect(14,111,100,3);for(let x=24;x<110;x+=12)g.fillRect(x,17,2,94);}
  else if(style==='louver'){g.fillStyle='rgba(0,0,0,0.18)';for(let y=16;y<112;y+=8)g.fillRect(14,y,100,3);}
  const t=new THREE.CanvasTexture(c);if(THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;return (_cabTex[style]=t);}
function addCabinet3D(p,lv,f,add,std,sel,mSel){const st=cabStyle(p,f);const isSel=sel&&(sel.id===f.id||(sel.kind==='multi'&&sel.items.some(i=>i.id===f.id)));
  const fc=st.color?hexNum(st.color):(CAB_FIN.find(x=>x[0]===st.finish)||CAB_FIN[0])[2];const box=isSel?mSel:std('cab-'+fc,fc,{roughness:.6});const front=isSel?mSel:std('cabf-'+st.style+'-'+fc,fc,{roughness:.55,map:st.style==='flat'?null:cabTex(st.style)});
  const hwc=(HW_FIN.find(x=>x[0]===st.hwFin)||HW_FIN[0])[2];const hw=std('hw-'+hwc,hwc,{roughness:.3,metalness:.8});const ry=-(f.rot||0)*Math.PI/180;const e0=lv.elevation+(f.elev||0);
  const {fronts,toe}=cabFronts(p,f);const L=(u,v)=>fxLocal(f,u,v);
  const B=(u,v,z,w,d,h,m,shadow=true)=>{const q=L(u,v);return add(new THREE.BoxGeometry(Math.max(0.05,w)*IN,Math.max(0.05,h)*IN,Math.max(0.05,d)*IN),m,q.x*IN,(e0+z+h/2)*IN,q.y*IN,ry,shadow);};
  const D=f.d;if(f.type==='filler'){B(0,0,toe,f.w,D-0.75,f.h-toe,box);if(toe)B(0,-1.5,0,f.w,D-3.75,toe,std('toe',0x2b2b2b,{roughness:.9}));return;}
  // carcass and toe kick
  const BH=cabBoxH(f);B(0,-0.375,toe,f.w,D-0.75,BH-toe,box);if(toe)B(0,-1.875,0,f.w,D-3.75,toe,std('toe',0x2b2b2b,{roughness:.9}));
  const fz=D/2-0.375;
  for(const fr of fronts){const w=fr.u1-fr.u0,h=fr.z1-fr.z0,uc=(fr.u0+fr.u1)/2;
    if(fr.kind==='open'){B(uc,fz-0.5,fr.z0,w,0.4,0.75,box);B(uc,fz-6,fr.z0+h/2,w-1.5,D-8,0.75,box);continue;}
    if(fr.kind==='appliance'){B(uc,fz,fr.z0,w,0.8,h,std('oven',0x2f3236,{roughness:.35,metalness:.4}));B(uc,fz+0.6,fr.z0+h*0.4,w*0.7,0.4,h*0.45,std('ovenglass',0x111214,{roughness:.1}));continue;}
    if(fr.kind==='glass'){const fw=2.25;B(uc,fz,fr.z0,w,0.75,fw,front);B(uc,fz,fr.z1-fw,w,0.75,fw,front);B(fr.u0+fw/2,fz,fr.z0,fw,0.75,h,front);B(fr.u1-fw/2,fz,fr.z0,fw,0.75,h,front);
      B(uc,fz-0.1,fr.z0+fw,w-2*fw,0.3,h-2*fw,M('glass',()=>new THREE.MeshStandardMaterial({color:0x9cc3e0,transparent:true,opacity:.35,roughness:.1,metalness:.1,depthWrite:false})),false);}
    else B(uc,fz,fr.z0,w,0.75,h,fr.kind==='drawer'||fr.kind==='false'?front:front);
    if(st.hw==='none'||fr.kind==='false'&&false)continue;
    // hardware
    if(fr.kind==='drawer'||fr.kind==='false'){const len=w>20?(st.hw==='cup'?3.5:w>30?10:6):4;if(st.hw==='knob')B(uc,fz+0.9,fr.z0+h/2-0.5,1,1,1,hw,false);else if(st.hw==='edge')B(uc,fz+0.5,fr.z1-0.6,len,0.6,0.6,hw,false);else B(uc,fz+0.9,fr.z0+h/2-0.35,len,0.7,0.7,hw,false);}
    else if(fr.kind==='door'||fr.kind==='glass'){const side=fr.hinge==='L'?fr.u1-2:fr.u0+2;const zc=f.type==='wallcab'||f.elev>40?fr.z0+3.5:f.type==='tall'&&fr.z0>40?fr.z0+3.5:fr.z1-3.5;const hl=st.hw==='knob'||st.hw==='cup'?1:5;
      if(fr.lift){B(uc,fz+0.9,fr.z0+2,6,0.7,0.7,hw,false);}else B(side,fz+0.9,zc-hl/2,0.7,0.7,hl,hw,false);}}
  // finished end panels
  if(st.endL)B(-f.w/2-0.375,0,toe,0.75,D,BH-toe,box);if(st.endR)B(f.w/2+0.375,0,toe,0.75,D,BH-toe,box);
}
function addCounters3D(p,lv,add,std){for(const c of counterGeo(p,lv.id)){const s=c.set;const col=s.color?hexNum(s.color):(COUNTER_MATS.find(x=>x[0]===s.mat)||COUNTER_MATS[0])[2];
  const m=std('ctr-'+s.mat+'-'+col,col,{roughness:s.mat==='quartz'||s.mat==='marble'||s.mat==='granite'?.25:s.mat==='laminate'?.5:.7,metalness:s.mat==='granite'?.05:0,map:s.mat==='granite'?speckTex():null});
  const sh=new THREE.Shape(c.pts.map(q=>new THREE.Vector2(q.x*IN,q.y*IN)));for(const h of c.holes)sh.holes.push(new THREE.Path(h.map(q=>new THREE.Vector2(q.x*IN,q.y*IN))));
  const geo=new THREE.ExtrudeGeometry(sh,{depth:c.thick*IN,bevelEnabled:s.edge==='bullnose'||s.edge==='bevel',bevelThickness:0.25*IN,bevelSize:0.25*IN,bevelSegments:s.edge==='bullnose'?3:1});geo.rotateX(Math.PI/2);
  add(geo,m,0,(lv.elevation+c.top)*IN,0,0,false);
  for(const h of c.holes){const xs=h.map(q=>q.x),ys=h.map(q=>q.y);const sg=new THREE.Shape(h.map(q=>new THREE.Vector2(q.x*IN,q.y*IN)));const g2=new THREE.ShapeGeometry(sg);g2.rotateX(Math.PI/2);add(g2,std('sinkbowl',0xc7c9cb,{roughness:.25,metalness:.6,side:THREE.DoubleSide}),0,(lv.elevation+c.top-8)*IN,0,0,false);}
  const sh2=s.splash==='full'?18:s.splash==='none'?0:+s.splash||4;if(sh2>0)for(const [a,b] of c.splash){const L=dist(a,b);const d={x:(b.x-a.x)/L,y:(b.y-a.y)/L};let n={x:-d.y,y:d.x};const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if(!inPoly(mid.x+n.x*2,mid.y+n.y*2,c.pts.map(q=>[q.x,q.y])))n={x:-n.x,y:-n.y};
    add(new THREE.BoxGeometry(L*IN,sh2*IN,0.75*IN),s.splash==='full'?std('tile-splash',0xf4f4f1,{roughness:.3,map:subwayTex()}):m,(mid.x+n.x*0.375)*IN,(lv.elevation+c.top+sh2/2)*IN,(mid.y+n.y*0.375)*IN,-Math.atan2(d.y,d.x),false);}}}
function speckTex(){if(_cabTex.speck)return _cabTex.speck;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,128,128);for(let i=0;i<900;i++){const v=Math.random();g.fillStyle=v<0.5?'rgba(40,35,30,0.5)':'rgba(255,255,255,0.6)';g.fillRect(Math.random()*128,Math.random()*128,1.5,1.5);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return (_cabTex.speck=t);}
function subwayTex(){if(_cabTex.sub)return _cabTex.sub;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#cfcfcb';g.fillRect(0,0,128,128);g.fillStyle='#ffffff';for(let r=0;r<8;r++)for(let k=-1;k<3;k++){const x=k*64+(r%2?32:0);g.fillRect(x+1,r*16+1,62,14);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1.5,1.5);return (_cabTex.sub=t);}
// crown and light rail along runs of wall cabinets (front and exposed ends)
function addCabTrim3D(p,lv,add,std){const walls=(p.fixtures||[]).filter(f=>f.level===lv.id&&(f.type==='wallcab'||f.type==='tall')&&f.status!=='demolish');if(!walls.length)return;
  for(const f of walls){const st=cabStyle(p,f);const fc=st.color?hexNum(st.color):(CAB_FIN.find(x=>x[0]===st.finish)||CAB_FIN[0])[2];const m=std('cab-'+fc,fc,{roughness:.6});const ry=-(f.rot||0)*Math.PI/180;const e0=lv.elevation+(f.elev||0);
    const exposed=side=>{const q=fxLocal(f,side*(f.w/2+2),0);return !walls.some(o=>o!==f&&inPoly(q.x,q.y,fxCorners(o).map(c=>[c.x,c.y])));};
    const strip=(z,h,depth)=>{const q=fxLocal(f,0,f.d/2+depth/2);add(new THREE.BoxGeometry((f.w+(exposed(-1)?depth:0)+(exposed(1)?depth:0))*IN,h*IN,depth*IN),m,(q.x+fxSide(f).x*((exposed(1)?depth:0)-(exposed(-1)?depth:0))/2)*IN,(e0+z+h/2)*IN,(q.y+fxSide(f).y*((exposed(1)?depth:0)-(exposed(-1)?depth:0))/2)*IN,ry,false);
      for(const sd of [-1,1])if(exposed(sd)){const e=fxLocal(f,sd*(f.w/2+depth/2),0);add(new THREE.BoxGeometry(depth*IN,h*IN,f.d*IN),m,e.x*IN,(e0+z+h/2)*IN,e.y*IN,ry,false);}};
    if(st.crown)strip(f.h,3.5,2.25);if(st.lightRail&&f.type==='wallcab')strip(-1.5,1.5,1);}}

/* ---- NKBA kitchen planning guidelines ---- */
function nkbaChecks(p,add){const N=(c,t)=>({set:'NKBA',code:c,title:t});
  for(const lv of p.levels){const fx=(p.fixtures||[]).filter(f=>f.level===lv.id&&f.status!=='demolish');const sink=fx.find(f=>f.type==='sinkbase'),cook=fx.find(f=>f.type==='range'||(f.lib||'').startsWith('a-cook')),fridge=fx.find(f=>f.type==='fridge');
    if(!sink&&!cook)continue;const T=f=>({kind:'fixture',id:f.id});const front=f=>({x:f.x+fxFront(f).x*f.d/2,y:f.y+fxFront(f).y*f.d/2});
    if(sink&&cook&&fridge){const a=dist(front(sink),front(cook))/12,b=dist(front(cook),front(fridge))/12,c=dist(front(fridge),front(sink))/12;const tot=a+b+c;
      if(tot>26)add('warn',N('Guideline 4','Work triangle'),'Kitchen work triangle is long',`Sink, cooktop and refrigerator are ${tot.toFixed(1)} ft apart in total; NKBA suggests 26 ft or less.`,T(sink),front(sink),lv.id);
      for(const [d,lab,f] of [[a,'sink to cooktop',sink],[b,'cooktop to refrigerator',cook],[c,'refrigerator to sink',fridge]])if(d<4||d>9)add('warn',N('Guideline 4','Work triangle legs'),`Work triangle leg ${d<4?'short':'long'}: ${lab}`,`${d.toFixed(1)} ft; NKBA suggests 4 to 9 ft for each leg.`,T(f),front(f),lv.id);}
    const counters=counterGeo(p,lv.id);const run=(f,side)=>{// counter length beside a fixture on one side (inches)
      const sd=fxSide(f);const o={x:f.x+sd.x*side*(f.w/2+1),y:f.y+sd.y*side*(f.w/2+1)};let L=0;for(let s=0;s<120;s+=2){const q={x:o.x+sd.x*side*s,y:o.y+sd.y*side*s};if(counters.some(c=>inPoly(q.x,q.y,c.pts.map(v=>[v.x,v.y]))))L=s+2;else break;}return L;};
    if(sink){const l=run(sink,-1),r=run(sink,1);const big=Math.max(l,r),small=Math.min(l,r);if(big<24||small<18)add('warn',N('Guideline 14','Sink landing area'),'Sink needs more counter beside it',`About ${fmtLen(l)} on one side and ${fmtLen(r)} on the other; NKBA suggests 24" on one side and 18" on the other.`,T(sink),front(sink),lv.id);
      const dw=fx.find(f=>f.type==='dw');if(dw&&dist(dw,sink)-(dw.w+sink.w)/2>36)add('warn',N('Guideline 19','Dishwasher placement'),'Dishwasher is far from the sink',`Keep the nearest edge of the dishwasher within 36" of the sink.`,T(dw),{x:dw.x,y:dw.y},lv.id);
      if(dw){const fr=fxFront(dw);const c=clearAlong(p,lv.id,front(dw),fr,dw.id);if(c<21)add('warn',N('Guideline 19','Dishwasher clearance'),'Not enough room to open the dishwasher','Leave 21" of clear floor space beside the open dishwasher door.',T(dw),front(dw),lv.id);}}
    if(cook){const l=run(cook,-1),r=run(cook,1);if(Math.min(l,r)<12||Math.max(l,r)<15)add('warn',N('Guideline 20','Cooking surface landing area'),'Cooktop needs more counter beside it',`About ${fmtLen(l)} and ${fmtLen(r)}; NKBA suggests 12" on one side and 15" on the other.`,T(cook),front(cook),lv.id);
      const above=fx.filter(f=>f.type==='wallcab'&&rectsOverlap(fxCorners(f),fxCorners(cook)));for(const w of above){const gap=(w.elev||0)-cook.h;if(gap<30&&!(w.lib||'').startsWith('a-hood')&&!(w.lib||'').includes('micro'))add('warn',N('Guideline 24','Clearance above cooktop'),'Cabinet too close above the cooktop',`${fmtLen(gap)} from the cooktop to the cabinet; allow 30" to unprotected combustible surfaces (24" if protected), per the cooktop and hood instructions (IRC M1901.1).`,T(w),{x:w.x,y:w.y},lv.id);}}
    if(fridge){const l=run(fridge,-1),r=run(fridge,1);if(Math.max(l,r)<15)add('warn',N('Guideline 17','Refrigerator landing area'),'Refrigerator needs a landing counter','Provide 15" of counter on the handle side, or across from it within 48".',T(fridge),front(fridge),lv.id);}
    const total=counters.reduce((s,c)=>{let L=0;for(let i=0;i<c.pts.length;i++){const a=c.pts[i],b=c.pts[(i+1)%c.pts.length];if(!c.splash.some(([u,v])=>u===a&&v===b))L+=0;}return s+c.area;},0)/24;
    const frontage=counters.reduce((s,c)=>s+c.area/24,0);if(sink&&frontage<158)add('warn',N('Guideline 13','Total countertop frontage'),'Not much counter space',`About ${Math.round(frontage)}" of 24"-deep countertop; NKBA suggests at least 158" for a kitchen.`,T(sink),front(sink),lv.id);}
}
regExtra({checks:(p,add)=>nkbaChecks(p,add),takeoff:(p,add,W)=>{const C='Countertops';for(const lv of p.levels)for(const c of counterGeo(p,lv.id)){const s=c.set;add(C,`${(COUNTER_MATS.find(x=>x[0]===s.mat)||['','Counter'])[1]} countertop ${s.thick>=1.2?'3 cm':'2 cm'}, ${(EDGES.find(x=>x[0]===s.edge)||['','eased'])[1].toLowerCase()} edge`,Math.ceil(c.area/144*W*10)/10,'SF');
  if(c.holes.length)add(C,'Undermount sink cutout',c.holes.length,'EA');const sl=c.splash.reduce((t,[a,b])=>t+dist(a,b),0);const sh=s.splash==='full'?18:s.splash==='none'?0:+s.splash||4;if(sh>0&&sl>0)add(C,s.splash==='full'?'Tile backsplash, full height to wall cabinets':`${sh}" backsplash`,s.splash==='full'?Math.ceil(sl*sh/144*W):Math.ceil(sl/12*W),s.splash==='full'?'SF':'LF');}}});

/* ---- price books (CSV): imported once, kept on this computer, and listed in the Library ---- */
const PB_KEY='remodel-studio:pricebooks';
function loadPriceBooks(){try{return JSON.parse(localStorage.getItem(PB_KEY)||'[]');}catch(e){return [];}}
function savePriceBooks(list){try{localStorage.setItem(PB_KEY,JSON.stringify(list));return true;}catch(e){return false;}}
function skuInfer(sku){const s=String(sku).toUpperCase().replace(/\s+/g,'');let m;
  if((m=s.match(/^(SBA|SB)(\d{2})/)))return {type:'sinkbase',w:+m[2]};if((m=s.match(/^(DB|BD)(\d{2})/)))return {type:'base',w:+m[2],layout:'drawers3'};if((m=s.match(/^(BWB|BBC|BLB|BB|B)(\d{2})/)))return {type:'base',w:+m[2]};
  if((m=s.match(/^W(\d{2})(\d{2})(?:-?(\d{2}))?/)))return {type:'wallcab',w:+m[1],h:+m[2],d:m[3]?+m[3]:12};if((m=s.match(/^(U|T|P|PC|OC)(\d{2})(\d{2})(\d{2})/)))return {type:'tall',w:+m[2],d:+m[3],h:+m[4]};
  if((m=s.match(/^V(SB)?(\d{2})(\d{2})?/)))return {type:'vanity',w:+m[2],d:m[3]?+m[3]:21};if((m=s.match(/^(BF|WF|F)(\d+)/)))return {type:'filler',w:+m[2]};return null;}
function parseCSVRows(text){const rows=[];let row=[],cur='',q=false;for(let i=0;i<text.length;i++){const ch=text[i];if(q){if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}
    else if(ch==='"')q=true;else if(ch===','||ch==='\t'){row.push(cur);cur='';}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cur);rows.push(row);row=[];cur='';}else cur+=ch;}
  if(cur||row.length){row.push(cur);rows.push(row);}return rows.filter(r=>r.some(c=>c.trim()));}
function parsePriceBook(text,name){const rows=parseCSVRows(text);if(rows.length<2)throw new Error('The file has no rows.');const hd=rows[0].map(h=>h.toLowerCase().trim());
  const col=(...keys)=>hd.findIndex(h=>keys.some(k=>h===k||h.includes(k)));const ci={sku:col('sku','item #','item','code','model','part'),desc:col('desc','name'),w:col('width','w (in)','w'),h:col('height','h (in)','h'),d:col('depth','d (in)','d'),type:col('type','category','class'),price:col('price','list','cost','msrp','amount')};
  if(ci.sku<0)throw new Error('Could not find a SKU or item column. Name the first column "SKU".');if(ci.price<0)throw new Error('Could not find a price column. Name it "Price".');
  const num=v=>{const x=parseFloat(String(v||'').replace(/[$,\s"]/g,''));return isFinite(x)?x:null;};const items=[];
  for(const r of rows.slice(1)){const sku=(r[ci.sku]||'').trim();if(!sku)continue;const inf=skuInfer(sku)||{};const typ=(ci.type>=0?(r[ci.type]||'').toLowerCase():'');
    const type=/sink/.test(typ)?'sinkbase':/wall|upper/.test(typ)?'wallcab':/tall|pantry|util|oven/.test(typ)?'tall':/vanit/.test(typ)?'vanity':/fill/.test(typ)?'filler':/base|drawer/.test(typ)?'base':inf.type;
    if(!type)continue;const w=num(r[ci.w])??inf.w,h=num(r[ci.h])??inf.h??({base:34.5,sinkbase:34.5,wallcab:30,tall:84,vanity:34.5,filler:34.5}[type]),d=num(r[ci.d])??inf.d??({base:24,sinkbase:24,wallcab:12,tall:24,vanity:21,filler:24}[type]);
    const price=num(r[ci.price]);if(!w||price==null)continue;items.push({sku,desc:ci.desc>=0?(r[ci.desc]||'').trim():'',type,w,h,d,price,layout:inf.layout||(/drawer/.test(typ)?'drawers3':null)});}
  if(!items.length)throw new Error('No cabinets were recognized. Check that the SKU, width and price columns have values.');
  return {id:uid('pb'),name:name||'Price book',items,imported:new Date().toISOString()};}
// add price-book cabinets to the Library list
function syncPriceBooksToLib(){for(let i=LIB.length-1;i>=0;i--)if(LIB[i].pb){delete LIB_BY_ID[LIB[i].id];LIB.splice(i,1);}
  for(const b of loadPriceBooks())for(const it of b.items){const id='pb-'+b.id+'-'+it.sku;const sub=`${b.name}: ${({base:'Base',sinkbase:'Sink bases',wallcab:'Wall',tall:'Tall',vanity:'Vanities',filler:'Fillers'})[it.type]||'Other'}`;
    const x={id,cat:'Cabinets',sub,label:`${it.sku}${it.desc?' · '+it.desc:''} · $${it.price}`,place:'fixture',base:it.type,w:it.w,d:it.d,h:it.h,elev:it.type==='wallcab'?(it.h>=42?54:84-it.h):0,pb:{book:b.name,sku:it.sku,price:it.price,layout:it.layout}};LIB.push(x);LIB_BY_ID[id]=x;}}
try{syncPriceBooksToLib();}catch(e){}
{const _nf2=newFixture;newFixture=function(type,level,x,y,rot=0){const f=_nf2(type,level,x,y,rot);const it=LIB_BY_ID[type];if(it&&it.pb)f.cab={...(f.cab||{}),sku:it.pb.sku,price:it.pb.price,book:it.pb.book,...(it.pb.layout?{layout:it.pb.layout}:{})};return f;};}
function PriceBookPanel({onChange}){const [books,setBooks]=useState(loadPriceBooks);const [msg,setMsg]=useState(null);const [name,setName]=useState('');
  const pick=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const b=parsePriceBook(String(r.result),name.trim()||file.name.replace(/\.(csv|txt)$/i,''));const list=[...loadPriceBooks(),b];
      if(!savePriceBooks(list)){setMsg({ok:false,t:'The price book is too big to keep on this computer.'});return;}setBooks(list);syncPriceBooksToLib();onChange&&onChange();setMsg({ok:true,t:`Imported ${b.items.length} cabinets from ${b.name}. Find them in the Library under Cabinets.`});setName('');}
    catch(err){setMsg({ok:false,t:err.message});}};r.readAsText(file);e.target.value='';};
  return html`<div className="sec"><h3>Manufacturer price books</h3>
    <p className="note">Import a CSV or tab-separated price book. Columns it looks for: SKU (required), Description, Type, Width, Height, Depth, Price (required). Sizes are read from SKUs like B36, SB36, DB18, W3030 and U248496 when the columns are missing.</p>
    <div className="row"><input className="inp" placeholder="Name, e.g. Wolf Classic 2026" value=${name} onChange=${e=>setName(e.target.value)} aria-label="Price book name" style=${{flex:1}}/>
      <label className="btn primary" htmlFor="pb-file">Import CSV…</label><input id="pb-file" type="file" accept=".csv,.txt,text/csv" hidden onChange=${pick}/></div>
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
    ${books.map(b=>html`<div key=${b.id} className="stat"><span>${b.name}</span><span className="mono">${b.items.length} items <button className="btn danger" onClick=${()=>{const l=loadPriceBooks().filter(x=>x.id!==b.id);savePriceBooks(l);setBooks(l);syncPriceBooksToLib();onChange&&onChange();}} aria-label=${'Remove '+b.name}>✕</button></span></div>`)}</div>`;}

/* ---- cabinet panel in the inspector ---- */
function CabinetPanel({p,o,up,commit}){const st=cabStyle(p,o);const upc=patch=>up({cab:{...(o.cab||{}),...patch}});const nums=cabNumbers(p);const L=cabLayout(o);
  const setAll=patch=>commit({...p,settings:{...p.settings,cab:{...(p.settings.cab||{}),...patch}},fixtures:p.fixtures.map(f=>isCab(f)&&f.cab?{...f,cab:Object.fromEntries(Object.entries(f.cab).filter(([k])=>!(k in patch)))}:f)});
  const cs=counterSet(p);const upCtr=patch=>commit({...p,settings:{...p.settings,counter:{...cs,...patch}}});
  return html`<div className="sec"><h3>Cabinet ${nums[o.id]?'#'+nums[o.id]:''} · ${cabSku(o)}</h3>
      <div className="stat"><span>Price</span><span className="mono">$${cabPrice(p,o).toLocaleString('en-US')}${o.cab&&o.cab.book?' · '+o.cab.book:' (planning price)'}</span></div>
      <${Field} label="Layout" id="cb-l"><${Sel} id="cb-l" value=${L} onChange=${v=>upc({layout:v})} options=${CAB_LAYOUTS[o.type]||CAB_LAYOUTS.base}/><//>
      ${(L==='doors'||L==='door-drawer'||L==='broom')&&o.w<=24?html`<${Field} label="Hinge side" id="cb-h"><${Sel} id="cb-h" value=${(o.cab&&o.cab.hinge)||'L'} onChange=${v=>upc({hinge:v})} options=${[['L','Left'],['R','Right']]}/><//>`:null}
      <div className="row2"><label className="check"><input type="checkbox" checked=${!!st.endL} onChange=${e=>upc({endL:e.target.checked})}/> Finished left end</label><label className="check"><input type="checkbox" checked=${!!st.endR} onChange=${e=>upc({endR:e.target.checked})}/> Finished right end</label></div>
      ${o.type==='island'?html`<label className="check"><input type="checkbox" checked=${!!(o.cab&&o.cab.seating)} onChange=${e=>upc({seating:e.target.checked})}/> 12" seating overhang on the back</label>`:null}
      <${Field} label="SKU" id="cb-sku"><input id="cb-sku" className="inp mono" value=${o.cab&&o.cab.sku||''} placeholder=${cabSku(o)} onChange=${e=>upc({sku:e.target.value||null})}/><//>
      <${Field} label="Price override" id="cb-pr"><input id="cb-pr" className="inp mono" value=${o.cab&&o.cab.price!=null?o.cab.price:''} placeholder="Planning price" onChange=${e=>{const v=parseFloat(e.target.value);upc({price:isFinite(v)?v:null});}}/><//></div>
    <${VendorCabPanel} p=${p} commit=${commit}/>
    <div className="sec"><h3>Kitchen style (all cabinets)</h3>
      <${Field} label="Line" id="cs-ln"><${Sel} id="cs-ln" value=${st.line} onChange=${v=>setAll({line:v})} options=${CAB_LINES.map(x=>[x[0],x[1]])}/><//>
      <${Field} label="Door style" id="cs-st"><${Sel} id="cs-st" value=${st.style} onChange=${v=>setAll({style:v})} options=${CAB_STYLES}/><//>
      <${Field} label="Finish" id="cs-fi"><${Sel} id="cs-fi" value=${st.finish} onChange=${v=>setAll({finish:v,color:null})} options=${CAB_FIN.map(x=>[x[0],x[1]])}/><//>
      <${ColorPick} id="cs-c" label="Custom color" value=${st.color} fallback=${'#'+(CAB_FIN.find(x=>x[0]===st.finish)||CAB_FIN[0])[2].toString(16).padStart(6,'0')} onChange=${v=>setAll({color:v})}/>
      <${Field} label="Hardware" id="cs-hw"><${Sel} id="cs-hw" value=${st.hw} onChange=${v=>setAll({hw:v})} options=${CAB_HW}/><//>
      <${Field} label="Hardware finish" id="cs-hf"><${Sel} id="cs-hf" value=${st.hwFin} onChange=${v=>setAll({hwFin:v})} options=${HW_FIN.map(x=>[x[0],x[1]])}/><//>
      <div className="row2"><label className="check"><input type="checkbox" checked=${st.crown} onChange=${e=>setAll({crown:e.target.checked})}/> Crown on uppers</label><label className="check"><input type="checkbox" checked=${st.lightRail} onChange=${e=>setAll({lightRail:e.target.checked})}/> Light rail</label></div>
      <div className="row"><button className="btn" onClick=${()=>upc({style:st.style==='shaker'?'raised':'shaker'})}>Different style for this one</button>${o.cab&&(o.cab.style||o.cab.finish||o.cab.color)?html`<button className="btn" onClick=${()=>upc({style:undefined,finish:undefined,color:undefined})}>Match the kitchen</button>`:null}</div></div>
    <div className="sec"><h3>Countertops (all)</h3>
      <${Field} label="Material" id="ct-m"><${Sel} id="ct-m" value=${cs.mat} onChange=${v=>upCtr({mat:v,color:null})} options=${COUNTER_MATS.map(x=>[x[0],x[1]])}/><//>
      <${ColorPick} id="ct-c" label="Color" value=${cs.color} fallback=${'#'+(COUNTER_MATS.find(x=>x[0]===cs.mat)||COUNTER_MATS[0])[2].toString(16).padStart(6,'0')} onChange=${v=>upCtr({color:v})}/>
      <div className="row2"><${Field} label="Edge" id="ct-e"><${Sel} id="ct-e" value=${cs.edge} onChange=${v=>upCtr({edge:v})} options=${EDGES}/><//><${Field} label="Thickness" id="ct-t"><${Sel} id="ct-t" value=${String(cs.thick)} onChange=${v=>upCtr({thick:+v})} options=${[['0.75','2 cm (3/4")'],['1.25','3 cm (1-1/4")'],['1.5','1-1/2"']]}/><//></div>
      <div className="row2"><${Field} label="Overhang" id="ct-o"><${LenInput} id="ct-o" value=${cs.overhang} onChange=${v=>upCtr({overhang:v})}/><//><${Field} label="Backsplash" id="ct-b"><${Sel} id="ct-b" value=${String(cs.splash)} onChange=${v=>upCtr({splash:v})} options=${[['4','4" splash'],['6','6" splash'],['full','Tile to the uppers'],['none','None']]}/><//></div>
      <p className="note">Countertops build themselves over base cabinets, sink bases, vanities and dishwashers, with sink cutouts and a backsplash wherever they meet a wall.</p></div>`;}

/* ---- auto fillers: close small gaps between cabinets and walls ---- */
function addFillers(p,lvId){let q=p;const cabs=(p.fixtures||[]).filter(f=>f.level===lvId&&['base','sinkbase','wallcab','tall','vanity'].includes(f.type)&&f.status!=='demolish');const add=[];
  for(const f of cabs){const sd=fxSide(f);for(const s of [-1,1]){const edge={x:f.x+sd.x*s*f.w/2,y:f.y+sd.y*s*f.w/2};const gap=clearAlong(p,lvId,edge,{x:sd.x*s,y:sd.y*s},f.id,12);
      if(gap>0.4&&gap<=6){const c={x:edge.x+sd.x*s*gap/2,y:edge.y+sd.y*s*gap/2};if(add.some(a=>dist(a,c)<1))continue;add.push({id:uid('fx'),level:lvId,type:'filler',x:c.x,y:c.y,w:Math.round(gap*16)/16,d:f.type==='wallcab'?12:f.d,h:f.h,elev:f.elev||0,rot:f.rot||0,status:'new'});}}}
  return {p:{...q,fixtures:[...q.fixtures,...add]},n:add.length};}
FIXTURES.filler={label:'Filler',cat:'Kitchen',w:3,d:24,h:34.5,color:0xd8c3a1};

/* ---- cabinet drawing on interior elevations (2020-style: fronts, hinge marks, handles, numbers) ---- */
function cabElevDL(dl,p,f,s,U,Z,k,num){const {fronts,toe}=cabFronts(p,f);const z0=f.elev||0;const BH=cabBoxH(f);const s0=s-f.w/2,s1=s+f.w/2;const st=cabStyle(p,f);
  const R=(a,b,c,d,o={})=>dl.poly([[U(a),Z(b)],[U(c),Z(b)],[U(c),Z(d)],[U(a),Z(d)]],{stroke:INK,w:0.55,fill:'#ffffff',...o});
  R(s0,z0,s1,z0+BH);if(toe)R(s0+0.5,z0,s1-0.5,z0+toe,{fill:'#d0d0d0',w:0.4});
  for(const fr of fronts){const a=s+fr.u0,b=s+fr.u1,c=z0+fr.z0,d=z0+fr.z1;if(fr.kind==='open'){R(a,c,b,d,{w:0.35});for(let z=c+(d-c)/3;z<d-1;z+=(d-c)/3)dl.line(U(a),Z(z),U(b),Z(z),0.35);continue;}
    R(a,c,b,d,{w:0.45,fill:fr.kind==='glass'?'#ececec':'#ffffff'});if(st.style!=='flat'&&fr.kind!=='appliance'&&b-a>6&&d-c>4){const m=Math.min(2.5,(b-a)/6,(d-c)/4);R(a+m,c+m,b-m,d-m,{w:0.25,stroke:MID,fill:'none'});}
    if(fr.kind==='door'||fr.kind==='glass'){const hx=fr.hinge==='L'?a:b,ox=fr.hinge==='L'?b:a;dl.poly([[U(ox),Z(c+0.5)],[U(hx),Z((c+d)/2)],[U(ox),Z(d-0.5)]],{stroke:MID,w:0.25,close:false,dash:[0.04,0.03]});
      if(st.hw!=='none'){const hz=f.type==='wallcab'||(f.elev||0)>40?c+3:d-3;const hxp=fr.hinge==='L'?b-1.5:a+1.5;dl.line(U(hxp),Z(hz-(st.hw==='knob'?0.4:2.5)),U(hxp),Z(hz+(st.hw==='knob'?0.4:2.5)),1.1);}}
    if((fr.kind==='drawer'||fr.kind==='false')&&st.hw!=='none'){const L=st.hw==='knob'?0.8:Math.min(8,(b-a)*0.35);const zm=(c+d)/2;dl.line(U((a+b)/2-L/2),Z(zm),U((a+b)/2+L/2),Z(zm),1.1);}
    if(fr.kind==='appliance')dl.text(U((a+b)/2),Z((c+d)/2),'OVEN',{size:4.5*k,anchor:'middle',bold:true});}
  if(f.type==='wallcab'&&st.crown)R(s0-1,z0+BH,s1+1,z0+BH+3.5,{fill:'#e2e2e2',w:0.4});
  if(num){const cx=U(s),cy=Z(z0)+(f.type==='wallcab'||(f.elev||0)>12?-0.0:0)+((f.type==='wallcab'||(f.elev||0)>12)?-(BH)*0+0:0);const y=(f.type==='wallcab'||(f.elev||0)>12)?Z(z0+BH)-0.12*k:Z(z0)+0.13*k;dl.circle(cx,y,0.065*k,{stroke:INK,w:0.45,fill:'#ffffff'});dl.text(cx,y+0.022*k,String(num),{size:4.6*k,anchor:'middle',bold:true});}}
function cabScheduleRows(p){const nums=cabNumbers(p);return (p.fixtures||[]).filter(f=>isCab(f)&&f.status!=='demolish'&&nums[f.id]).sort((a,b)=>nums[a.id]-nums[b.id]).map(f=>{const st=cabStyle(p,f);const L=(CAB_LAYOUTS[f.type]||CAB_LAYOUTS.base).find(x=>x[0]===cabLayout(f));
  return [String(nums[f.id]),cabSku(f),`${(L||['',f.type])[1]}`,`${fmtLen(f.w)} x ${fmtLen(cabBoxH(f))} x ${fmtLen(f.d)}`,`${(CAB_STYLES.find(x=>x[0]===st.style)||['',''])[1]}, ${(CAB_FIN.find(x=>x[0]===st.finish)||['',''])[1].replace('Painted ','')}`,'$'+cabPrice(p,f).toLocaleString('en-US')];});}
function cabinetSheet(P,p,pp,k){const lv=sortedLevels(pp).find(l=>(pp.fixtures||[]).some(f=>f.level===l.id&&isCab(f)));if(!lv)return null;const cabs=pp.fixtures.filter(f=>f.level===lv.id&&isCab(f));
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const f of cabs)for(const c of fxCorners(f)){x0=Math.min(x0,c.x);y0=Math.min(y0,c.y);x1=Math.max(x1,c.x);y1=Math.max(y1,c.y);}const pad=48;const B={x0:x0-pad,y0:y0-pad,x1:x1+pad,y1:y1+pad};const rows=cabScheduleRows(pp);const tableW=5.6*k;
  return planSheet(P,p,'A5.0','Cabinet plan and schedule',B,0.3*k,(dl,G)=>{const {PT,sc}=G;
    // walls and cabinets in the area, numbered
    const J=wallJoins(pp.walls.filter(w=>w.level===lv.id));for(const w of pp.walls.filter(w=>w.level===lv.id)){const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2,ja=J[w.id]?.a||0,jb=J[w.id]?.b||0;const a={x:w.x1-d.x*ja,y:w.y1-d.y*ja},b={x:w.x2+d.x*jb,y:w.y2+d.y*jb};
      const q=clipPolyRect([{x:a.x+n.x*t,y:a.y+n.y*t},{x:b.x+n.x*t,y:b.y+n.y*t},{x:b.x-n.x*t,y:b.y-n.y*t},{x:a.x-n.x*t,y:a.y-n.y*t}],B);if(q.length>=3)dl.poly(q.map(v=>PT(v.x,v.y)),{fill:FILL_NEW,stroke:INK,w:0.3});}
    for(const o of pp.openings){const c=openingCenter(pp,o);if(!c||c.w.level!==lv.id||c.x<B.x0||c.x>B.x1||c.y<B.y0||c.y>B.y1)continue;const w=c.w,d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2+0.3;const P2=(s,off)=>PT(c.x+d.x*s+n.x*off,c.y+d.y*s+n.y*off);
      dl.poly([P2(-o.width/2,t),P2(o.width/2,t),P2(o.width/2,-t),P2(-o.width/2,-t)],{fill:'#ffffff'});if(o.type==='window'){dl.line(...P2(-o.width/2,0),...P2(o.width/2,0),0.35);}}
    for(const c of counterGeo(pp,lv.id))dl.poly(c.pts.map(q=>PT(q.x,q.y)),{stroke:INK,w:0.5,fill:'#f2f2f2',holes:c.holes.map(h=>h.map(q=>PT(q.x,q.y)))});
    const nums=cabNumbers(pp);for(const f of pp.fixtures.filter(f=>f.level===lv.id&&f.status!=='demolish'&&f.x>B.x0&&f.x<B.x1&&f.y>B.y0&&f.y<B.y1)){const c=fxCorners(f).map(q=>PT(q.x,q.y));dl.poly(c,{stroke:INK,w:0.45,fill:isCab(f)?'#ffffff':'#f6f6f6',dash:f.type==='wallcab'?[0.05,0.03]:null});
      const q=PT(f.x,f.y);if(nums[f.id]){dl.circle(q[0],q[1],0.07*k,{stroke:INK,w:0.45,fill:'#ffffff'});dl.text(q[0],q[1]+0.025*k,String(nums[f.id]),{size:4.8*k,anchor:'middle',bold:true});}else{const lab={fridge:'REF',dw:'DW',range:'RANGE'}[f.type];if(lab)dl.text(q[0],q[1]+0.025*k,lab,{size:4.5*k,anchor:'middle',bold:true});}}
    const tx=G.A.x1-tableW;let ty=G.A.y0+0.15*k;const total=cabs.reduce((s,f)=>s+cabPrice(pp,f),0);
    dl.text(tx,ty,'CABINET SCHEDULE',{size:8*k,bold:true});ty+=0.12*k;
    const h=drawTable(dl,tx,ty,[{h:'#',w:0.3*k},{h:'SKU',w:1.0*k},{h:'TYPE',w:1.5*k},{h:'W x H x D',w:1.25*k},{h:'STYLE',w:1.0*k},{h:'PRICE',w:0.55*k}],rows,k,G.A.y1-1.4*k);ty+=h+0.25*k;
    const st=cabStyle(pp,{});const cs=counterSet(pp);const ctr=counterGeo(pp,lv.id);const area=ctr.reduce((s,c)=>s+c.area,0)/144;
    for(const line of [...(typeof vendorLabel==='function'&&vendorLabel(p.settings?.cab||{})?[`MANUFACTURER: ${vendorLabel(p.settings.cab).toUpperCase()}`]:[]),`STYLE: ${(CAB_STYLES.find(x=>x[0]===st.style)||['',''])[1].toUpperCase()} · ${(CAB_FIN.find(x=>x[0]===st.finish)||['',''])[1].toUpperCase()} · ${(CAB_LINES.find(x=>x[0]===st.line)||['',''])[1].toUpperCase()}`,
      `HARDWARE: ${(CAB_HW.find(x=>x[0]===st.hw)||['',''])[1].toUpperCase()}, ${(HW_FIN.find(x=>x[0]===st.hwFin)||['',''])[1].toUpperCase()}`,
      `COUNTERTOPS: ${(COUNTER_MATS.find(x=>x[0]===cs.mat)||['',''])[1].toUpperCase()} ${cs.thick>=1.2?'3 CM':'2 CM'}, ${(EDGES.find(x=>x[0]===cs.edge)||['',''])[1].toUpperCase()} EDGE, ${Math.round(area)} SF`,
      `CABINET TOTAL (PLANNING): $${total.toLocaleString('en-US')}`])
      {dl.text(tx,ty,line,{size:5.6*k,bold:/TOTAL/.test(line)});ty+=0.14*k;}},tableW+0.25*k);}

/* ---- cabinet run tool: click two points along a wall and it fills the run with stock widths ---- */
function fillWidths(L,stock=[36,33,30,27,24,21,18,15,12,9]){const n=Math.floor(L);const best=new Array(n+1).fill(null);best[0]=[];
  for(let x=1;x<=n;x++)for(const w of stock)if(w<=x&&best[x-w]){const c=[...best[x-w],w];if(!best[x]||c.length<best[x].length)best[x]=c;}
  for(let r=0;r<=Math.min(6,n);r++){const x=n-r;if(best[x])return {widths:best[x].sort((a,b)=>b-a),rest:L-x};}return {widths:[],rest:L};}
function cabRun(ctx,a,b,kind){const p=ctx.p,lv=ctx.lv;const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const nw=ctx.nearestWall(mid);if(!nw)return null;const w=nw.w;const d=wdir(w);
  let n={x:-d.y,y:d.x};if((mid.x-nw.pr.x)*n.x+(mid.y-nw.pr.y)*n.y<0)n={x:-n.x,y:-n.y};const sA=(a.x-w.x1)*d.x+(a.y-w.y1)*d.y,sB=(b.x-w.x1)*d.x+(b.y-w.y1)*d.y;let s0=Math.min(sA,sB),s1=Math.max(sA,sB);
  const L=s1-s0;if(L<9)return null;const {widths,rest}=fillWidths(L);const rot=((Math.round(Math.atan2(-n.x,n.y)*180/Math.PI/90)*90)%360+360)%360;const dep=kind==='wall'?12:24;
  const out=[];let s=s0;const face=w.thick/2;const mk=(type,ww,extra={})=>{const c={x:w.x1+d.x*(s+ww/2)+n.x*(face+dep/2),y:w.y1+d.y*(s+ww/2)+n.y*(face+dep/2)};s+=ww;
    return {id:uid('fx'),level:lv.id,type,x:c.x,y:c.y,w:ww,d:dep,h:kind==='wall'?30:34.5,elev:kind==='wall'?54:0,rot,status:'new',lib:kind==='wall'?`c-wall-${ww}x30`:`c-base-${ww}`,name:kind==='wall'?`Wall cabinet ${ww}" x 30" (W${ww}30)`:`Base cabinet ${ww}" (B${ww})`,...extra};};
  if(rest>=0.75){s+=0;}
  for(const ww of widths)out.push(mk(kind==='wall'?'wallcab':'base',ww));if(rest>=0.5)out.push({...mk('filler',Math.round(rest*16)/16),lib:null,name:null,h:kind==='wall'?30:34.5});
  return {p:{...p,fixtures:[...(p.fixtures||[]),...out]},sel:{kind:'multi',items:out.map(f=>({kind:'fixture',id:f.id}))}};}
I.cabrun=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="9" width="20" height="11"/><path d="M8 9v11M14 9v11M5 12v2M11 12v2M17 12v2M2 6h20"/></svg>`;
I.cabwall=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="20" height="9"/><path d="M8 3v9M14 3v9M5 9v2M11 9v2M17 9v2M2 18h20"/></svg>`;
for(const [id,kind,label,ic] of [['cabrun','base','Base cabinet run','cabrun'],['cabrunw','wall','Wall cabinet run','cabwall']]){
  regTool(id,{label,group:'interior',icon:I[ic],mode:'two',snap:'grid',
    hint:n=>n?html`Click where the run ends along the same wall. It fills with stock widths (36" down to 9") and a filler for what is left.`:html`<b>${label}:</b> click where the run starts against a wall (a corner or the edge of a door).`,
    ghost:(ctx,pts,cur,S)=>{if(pts.length<2)return null;const r=cabRun(ctx,pts[0],pts[1],kind);if(!r)return null;const add=r.p.fixtures.slice(ctx.p.fixtures.length);return add.map(f=>html`<g key=${f.id}>${fxPlanSymbol(f,S,'fx')}</g>`);},
    place:(ctx,[a,b])=>cabRun(ctx,a,b,kind)});
  addToolToGroup('interior',id);}

function clipPolyRect(pts,B){let out=pts;const clip=(inside,inter)=>{const res=[];for(let i=0;i<out.length;i++){const a=out[i],b=out[(i+1)%out.length];const ia=inside(a),ib=inside(b);if(ia)res.push(a);if(ia!==ib)res.push(inter(a,b));}out=res;};
  const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
  clip(q=>q.x>=B.x0,(a,b)=>lerp(a,b,(B.x0-a.x)/(b.x-a.x)));if(out.length)clip(q=>q.x<=B.x1,(a,b)=>lerp(a,b,(B.x1-a.x)/(b.x-a.x)));
  if(out.length)clip(q=>q.y>=B.y0,(a,b)=>lerp(a,b,(B.y0-a.y)/(b.y-a.y)));if(out.length)clip(q=>q.y<=B.y1,(a,b)=>lerp(a,b,(B.y1-a.y)/(b.y-a.y)));return out;}
