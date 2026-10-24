/* ======================= doors in detail: slab styles, jambs and casing, hardware, hinges, handing ======================= */
DOOR_STYLES.garagecarriage='Carriage-house garage';
const HW_FINISHES=[['satin-nickel','Satin nickel',0xb6b8b5,.85,.35],['matte-black','Matte black',0x262626,.35,.6],['orb','Oil-rubbed bronze',0x4b3527,.6,.45],['aged-bronze','Aged bronze',0x6a5138,.6,.45],
  ['polished-chrome','Polished chrome',0xe6e8ea,1,.08],['stainless','Stainless steel',0xc9cacb,.9,.3],['satin-brass','Satin brass',0xc9a75e,.9,.35],['polished-brass','Polished brass',0xd8b13d,1,.12],
  ['antique-brass','Antique brass',0x9c7a3c,.8,.45],['white','White',0xf2f2f0,0,.5]];
const HW_TYPES=[['lever','Lever'],['knob','Knob'],['handleset','Handleset with thumb latch'],['pull','Pull handle'],['flushpull','Flush pull (pocket door)'],['barnpull','Barn door pull'],['pushbar','Push bar (exit device)'],['none','No hardware']];
const HW_FUNCS=[['passage','Passage (no lock)'],['privacy','Privacy (push-button lock)'],['keyed','Keyed entry'],['dummy','Dummy (fixed handle)'],['storeroom','Storeroom (always locked outside)']];
const HW_BRANDS=['Any brand','Kwikset','Schlage','Baldwin','Emtek','Weiser','Defiant','Yale','Delaney','Nostalgic Warehouse'];
const HW_ROSES=[['round','Round rose'],['square','Square rose (modern)'],['plate','Long backplate (traditional)']];
const LEVER_SHAPES=[['straight','Straight'],['curved','Curved'],['tube','Round tube']];
const DOOR_MATS=[['hollow','Hollow-core molded'],['solidcore','Solid-core molded'],['wood','Solid wood'],['mdf','Solid MDF'],['fiberglass','Fiberglass'],['steel','Steel'],['alum','Aluminum and glass']];
const DOOR_GLASS=[['clear','Clear'],['lowe','Low-E, tempered'],['frosted','Frosted (privacy)'],['rain','Rain glass'],['reeded','Reeded'],['decorative','Decorative leaded']];
const DOOR_THRESH=[['none','None (interior)'],['std','Standard sill, about 1"'],['ada','Low profile, 1/2" max (ADA)'],['saddle','Saddle']];
const DOOR_STOPS=[['baseboard','Baseboard stop'],['hinge','Hinge-pin stop'],['floor','Floor stop'],['wall','Wall bumper'],['none','None']];
const HINGE_SIZES=[['3.5','3-1/2"'],['4','4"'],['4.5','4-1/2" (heavy)']];
const HINGE_CORNERS=[['r58','5/8" radius'],['r14','1/4" radius'],['square','Square']];
const hwFinish=k=>HW_FINISHES.find(f=>f[0]===k)||HW_FINISHES[0];
// the rooms on each side of a door, and which side is outside
function doorSides(p,o){const w=p.walls.find(w=>w.id===o.wall);if(!w)return null;const d=wdir(w),n={x:-d.y,y:d.x};const L=wlen(w);const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));
  const c={x:w.x1+d.x*pos,y:w.y1+d.y*pos};const side=o.swing||1;const sw={x:n.x*side,y:n.y*side};const off=w.thick/2+8;
  const rooms=p.rooms.filter(r=>r.level===w.level);const at=v=>rooms.find(r=>inPoly(c.x+v.x*off,c.y+v.y*off,r.pts))||null;
  const ext=w.kind==='exterior';let outN=null;if(ext){const extW=p.walls.filter(x=>x.level===w.level&&x.kind==='exterior'&&x.status!=='demolish');outN=outwardNormal(extW,w);}
  return {w,d,n,c,sw,ext,outN,into:at(sw),from:at({x:-sw.x,y:-sw.y})};}
// handing in both conventions. Residential: exterior named from outside (inswing/outswing); interior named from the side the door swings toward.
// ANSI/BHMA: named from the outside, or the push side for interior doors; reverse bevel (R) when it swings toward that side.
function doorHanding(p,o){const S=doorSides(p,o);const dt=o.dtype||'swing';if(!S)return {res:'',ansi:'',both:''};const hU=o.hinge?1:-1;const hv={x:S.d.x*hU,y:S.d.y*hU};
  const right=v=>({x:-v.y,y:v.x});const dot=(a,b)=>a.x*b.x+a.y*b.y;
  if(dt==='swing'||dt==='double'){let res,ansi;
    if(S.ext){const v={x:-S.outN.x,y:-S.outN.y};const hr=dot(hv,right(v))>0;const inswing=dot(S.sw,S.outN)<0;ansi=(hr?'RH':'LH')+(inswing?'':'R');res=(hr?'RH':'LH')+(inswing?' inswing':' outswing');}
    else{const hrPush=dot(hv,right(S.sw))>0;ansi=hrPush?'RH':'LH';res=hrPush?'LH':'RH';}
    if(dt==='double'){res=(res.startsWith('RH')?'RH active':'LH active')+res.slice(2);ansi+=' active';}
    return {res,ansi,both:`${res} (ANSI ${ansi})`,ext:S.ext,into:S.into,from:S.from};}
  // sliding, pocket, barn and bifold: which way it opens, seen from the outside or from the room it serves
  const v=S.ext?{x:-S.outN.x,y:-S.outN.y}:S.sw;const mv=dt==='barn'?{x:-hv.x,y:-hv.y}:hv;const hr=dot(mv,right(v))>0;
  const word=dt==='slider'?(hr?'XO (right panel fixed)':'OX (left panel fixed)'):dt==='pocket'?(hr?'pocket on the right':'pocket on the left'):dt==='barn'?(hr?'slides right':'slides left'):dt==='bifold'?(hr?'folds to the right':'folds to the left'):'';
  return {res:word,ansi:'',both:word?word+(S.ext?', seen from outside':''):'',ext:S.ext,into:S.into,from:S.from};}
// everything a door is made of, with sensible defaults filled in from where it is
function doorSpec(p,o){const S=doorSides(p,o)||{};const dt=o.dtype||'swing';const st=o.style||'panel6';const ext=S.ext!==undefined?!!S.ext:!!o.ext;const uses=[S.into,S.from].filter(Boolean).map(r=>r.use);
  const garageHouse=uses.includes('garage')&&uses.some(u=>u!=='garage')&&!ext;
  const type=dt==='pocket'?'flushpull':dt==='barn'?'barnpull':dt==='slider'||st==='storefront'?'pull':dt==='overhead'?'none':dt==='bifold'?'knob':'lever';
  const func=ext?'keyed':uses.some(u=>u==='bath'||u==='bedroom')?'privacy':dt==='bifold'?'dummy':'passage';
  const H=o.height||80;const hw0={type,func,finish:p.settings?.hwFinish||'satin-nickel',brand:p.settings?.hwBrand||'Any brand',rose:'round',lever:'straight',deadbolt:ext&&(dt==='swing'||dt==='double')};
  const hw={...hw0,...(o.hw||{})};
  const mat0=st==='storefront'?'alum':st==='metal'?'steel':ext?'fiberglass':garageHouse?'solidcore':st==='plank'?'wood':'hollow';
  const door0={mat:mat0,thick:ext||garageHouse||['wood','solidcore','steel','fiberglass'].includes(o.door?.mat||mat0)?1.75:1.375,glass:ext?'lowe':'clear',sidelites:0,sideW:12,transom:0,transomH:14,
    threshold:ext?(o.ada?'ada':'std'):'none',stop:dt==='swing'||dt==='double'?'baseboard':'none',closer:garageHouse,kick:false,viewer:false,fire20:false};
  const door={...door0,...(o.door||{})};
  const hn0={n:H<=60?2:H<=90?3:4,size:ext||door.mat!=='hollow'||H>80?'4':'3.5',corner:'r58',finish:hw.finish,spring:garageHouse};
  const hinges={...hn0,...(o.hinges||{})};
  return {hw,door,hinges,ext,garageHouse,sides:S};}
// the slab, the opening left for it, and sidelites/transom, along the wall (u) and up (y), in inches
function doorUnit(o,spec){const d=spec.door;const ow=o.width,H=o.height;const jamb=0.75,gap=0.125;
  const sl=Math.max(0,Math.min(2,d.sidelites|0)),sW=d.sideW||12,mull=1.5;const tr=d.transom?(d.transomH||14):0;
  const u0=-ow/2+jamb+(sl===2||(sl===1&&!o.hinge)?sW+mull:0),u1=ow/2-jamb-(sl===2||(sl===1&&o.hinge)?sW+mull:0);
  const top=H-jamb-(tr?tr+mull:0);return {u0:u0+gap,u1:u1-gap,y0:0.5,y1:top-gap,sl,sW,mull,tr,jamb,ow,H};}
function leafRegions(style,W,H){const S=Math.min(4.75,W*0.16),T=4.75,B=Math.min(9.5,H*0.12),M=7;const R=[];const reg=(x0,x1,y0,y1,kind,x={})=>R.push({x0,x1,y0,y1,kind,...x});
  const c1=[S,W/2-2],c2=[W/2+2,W-S];
  switch(style){
    case 'shaker':reg(S,W-S,B,H-T,'panel',{flat:true});break;
    case 'panel2':{const ly=H*0.45;reg(S,W-S,B,ly-M/2,'panel');reg(S,W-S,ly+M/2,H-T,'panel');break;}
    case 'panel6':for(const [a,b] of [[B,H*0.40],[H*0.47,H*0.80],[H*0.85,H-T]])for(const c of [c1,c2])reg(c[0],c[1],a,b,'panel');break;
    case 'panel5':{const n=5,g=4,h=(H-T-B-g*(n-1))/n;for(let i=0;i<n;i++)reg(S,W-S,B+i*(h+g),B+i*(h+g)+h,'panel',{flat:true});break;}
    case 'louver':reg(S,W-S,B,H-T,'louver');break;
    case 'halflite':reg(S,W-S,H*0.5,H-T,'glass');reg(S,W-S,B,H*0.5-M,'panel',{flat:true});break;
    case 'fulllite':reg(S,W-S,B,H-T,'glass');break;
    case 'french':reg(S,W-S,B,H-T,'glass',{cols:W>=30?3:2,rows:5});break;
    case 'sixlite':{const gy=H*0.66;reg(S,W-S,gy,H-T,'glass',{cols:3,rows:2});const w3=(W-2*S-2*3)/3;for(let i=0;i<3;i++)reg(S+i*(w3+3),S+i*(w3+3)+w3,B,gy-M,'panel',{flat:true});break;}
    case 'storefront':reg(4.5,W-4.5,10,H-4.5,'glass');break;
    case 'garageglass':case 'garage':case 'garagecarriage':break;
  }
  return R;}
// door panel styles that read as raised (traditional) vs flat (shaker)
function addDoorSlab(L,u0,u1,y0,y1,zc,thick,style,mats){const W=u1-u0,H=y1-y0;const R=leafRegions(style,W,H);
  const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(W,0);sh.lineTo(W,H);sh.lineTo(0,H);sh.lineTo(0,0);
  for(const r of R){const h=new THREE.Path();h.moveTo(r.x0,r.y0);h.lineTo(r.x0,r.y1);h.lineTo(r.x1,r.y1);h.lineTo(r.x1,r.y0);h.lineTo(r.x0,r.y0);sh.holes.push(h);}
  const geo=new THREE.ExtrudeGeometry(sh,{depth:thick,bevelEnabled:false});geo.translate(u0,y0,zc-thick/2);L.mesh(geo,mats.slab);
  for(const r of R){const cx=u0+(r.x0+r.x1)/2,cy=y0+(r.y0+r.y1)/2,rw=r.x1-r.x0,rh=r.y1-r.y0;
    if(r.kind==='panel'){L.box(rw,rh,thick*0.42,cx,cy,zc,mats.slab);if(!r.flat&&rw>4&&rh>4)L.box(rw-3.2,rh-3.2,thick*0.78,cx,cy,zc,mats.slab);}
    else if(r.kind==='glass'){L.box(rw,rh,0.5,cx,cy,zc,mats.glass,false);const cols=r.cols||1,rows=r.rows||1;
      for(let i=1;i<cols;i++)L.box(0.875,rh,thick*0.7,u0+r.x0+rw*i/cols,cy,zc,mats.slab);for(let j=1;j<rows;j++)L.box(rw,0.875,thick*0.7,cx,y0+r.y0+rh*j/rows,zc,mats.slab);}
    else if(r.kind==='louver'){const n=Math.max(3,Math.floor(rh/1.7));for(let i=0;i<n;i++){const g=new THREE.BoxGeometry(rw,1.45,thick*0.7);g.rotateX(0.6);g.translate(cx,y0+r.y0+(i+0.5)*rh/n,zc);L.mesh(g,mats.slab);}}}
  if(style==='plank'){for(let x=5.5;x<W-1;x+=5.5)for(const s of [-1,1])L.box(0.35,H-0.5,0.12,u0+x,y0+H/2,zc+s*(thick/2+0.02),mats.dark,false);
    for(const s of [-1,1]){L.box(W-2,5,0.75,u0+W/2,y0+H*0.2,zc+s*(thick/2+0.37),mats.slab);L.box(W-2,5,0.75,u0+W/2,y0+H*0.8,zc+s*(thick/2+0.37),mats.slab);}}}
// handle, rose and lock on one face of a leaf. f = +1/-1 is the face (along local z); hingeDir = +1/-1 along u
function addHandle(L,spec,uL,yH,zFace,f,hingeDir,hm,which){const hw=spec.hw;const t=hw.type;const Z=zFace;
  const rose=(y,r=1.3)=>{if(hw.rose==='square')L.box(2.4,2.4,0.35,uL,y,Z+f*0.18,hm);else if(hw.rose==='plate')L.box(2.4,9,0.3,uL,y+1.5,Z+f*0.15,hm);else L.cyl(r,0.35,uL,y,Z+f*0.18,hm,'z');};
  if(t==='none')return;
  if(t==='knob'){rose(yH);L.cyl(0.45,1.6,uL,yH,Z+f*1.1,hm,'z');L.sphere(1.1,uL,yH,Z+f*2.2,hm);}
  else if(t==='lever'||(t==='handleset'&&which!=='out')){rose(yH);L.cyl(0.4,1.5,uL,yH,Z+f*1.0,hm,'z');const len=4.6;
    if(hw.lever==='tube')L.cyl(0.35,len,uL+hingeDir*len/2,yH,Z+f*1.9,hm,'x');else{const g=new THREE.BoxGeometry(len,0.7,0.6);if(hw.lever==='curved')g.rotateZ(-hingeDir*0.12);g.translate(uL+hingeDir*len/2,yH-(hw.lever==='curved'?0.25:0),Z+f*1.9);L.mesh(g,hm);}}
  else if(t==='handleset'){L.box(2.6,11,0.4,uL,yH+2,Z+f*0.2,hm);L.box(1.0,7,1.0,uL,yH,Z+f*2.4,hm);L.box(0.8,0.8,2.2,uL,yH+3.2,Z+f*1.2,hm);L.box(0.8,0.8,2.2,uL,yH-3.2,Z+f*1.2,hm);L.box(0.6,1.1,0.9,uL,yH+3.9,Z+f*2.6,hm);}
  else if(t==='pull'){L.cyl(0.5,16,uL,yH+2,Z+f*2.6,hm,'y');L.box(0.6,0.6,2.4,uL,yH+9,Z+f*1.3,hm);L.box(0.6,0.6,2.4,uL,yH-5,Z+f*1.3,hm);}
  else if(t==='flushpull'){L.box(1.6,4.5,0.12,uL,yH,Z+f*0.04,hm);L.box(1.1,3.8,0.14,uL,yH,Z+f*0.06,L.dark);}
  else if(t==='barnpull'){L.cyl(0.45,11,uL,yH,Z+f*2.0,hm,'y');L.box(0.7,0.7,2,uL,yH+5,Z+f*1.0,hm);L.box(0.7,0.7,2,uL,yH-5,Z+f*1.0,hm);}
  else if(t==='pushbar'){L.box(Math.abs(hingeDir)*24,2.2,2.2,uL+hingeDir*12,yH-2,Z+f*1.6,hm);}
  if(hw.deadbolt&&['lever','knob','handleset'].includes(t)&&!(t==='handleset'&&which==='out'))L.cyl(1.05,0.5,uL,yH+5.5,Z+f*0.3,hm,'z');}
function addHinges(L,spec,uH,y0,y1,zFace,hm){const n=Math.max(2,spec.hinges.n|0),h=+spec.hinges.size||3.5;const ys=[];const top=y1-7-h/2,bot=y0+11+h/2;
  for(let i=0;i<n;i++)ys.push(n===1?top:top-(top-bot)*i/(n-1));for(const y of ys){L.cyl(0.3,h,uH,y,zFace,hm,'y');L.box(0.1,h,0.9,uH,y,zFace,hm);}}
// build one door into the model. g = {px,py,ow,d,t,ry,e0,H(wall),extW,sel,add,std,mGlass,dm,trimMat}
function addDoor3D(p,w,o,g){const spec=doorSpec(p,o);const dt=o.dtype||'swing';const st=o.style||'panel6';const {add,std}=g;const n={x:-g.d.y,y:g.d.x};
  const side=o.swing||1;const hU=o.hinge?1:-1;const fin=hwFinish(spec.hw.finish);const hm=std('hw-'+fin[0],fin[2],{metalness:fin[3],roughness:fin[4]});
  const dark=std('door-dark',0x2c2a27,{roughness:.8});
  const L={dark,mesh:(geo,mat,shadow=true)=>{geo.scale(IN,IN,IN);return add(geo,mat,g.px*IN,g.e0*IN,g.py*IN,g.ry,shadow);},
    box(w,h,d,u,y,z,mat,shadow=true){const geo=new THREE.BoxGeometry(w,h,d);geo.translate(u,y,z);return this.mesh(geo,mat,shadow);},
    cyl(r,len,u,y,z,mat,axis){const geo=new THREE.CylinderGeometry(r,r,len,14);if(axis==='z')geo.rotateX(Math.PI/2);else if(axis==='x')geo.rotateZ(Math.PI/2);geo.translate(u,y,z);return this.mesh(geo,mat,false);},
    sphere(r,u,y,z,mat){const geo=new THREE.SphereGeometry(r,16,12);geo.translate(u,y,z);return this.mesh(geo,mat,false);}};
  const mats={slab:g.dm,glass:g.mGlass,dark};const U=doorUnit(o,spec);const thick=spec.door.thick||1.75;const t=g.t;
  // where outside is, for the handleset and the exterior trim
  let outZ=0;if(spec.ext&&spec.sides&&spec.sides.outN){outZ=(spec.sides.outN.x*n.x+spec.sides.outN.y*n.y)>0?1:-1;}
  const jm=g.trimMat;
  // jambs and head
  if(dt!=='overhead'){for(const s of [-1,1])L.box(U.jamb,o.height,t+0.25,s*(o.width/2-U.jamb/2),o.height/2,0,jm);L.box(o.width,U.jamb,t+0.25,0,o.height-U.jamb/2,0,jm);
    if(U.sl||U.tr){const glassBox=(u0,u1,y0,y1)=>{L.box(u1-u0,y1-y0,0.5,(u0+u1)/2,(y0+y1)/2,0,g.mGlass,false);};const ga=-o.width/2+U.jamb,gb=o.width/2-U.jamb;
      if(U.sl===2||(U.sl===1&&!o.hinge)){glassBox(ga,ga+U.sW,1,U.y1);L.box(U.mull,U.y1,t*0.6,ga+U.sW+U.mull/2,U.y1/2,0,jm);}
      if(U.sl===2||(U.sl===1&&o.hinge)){glassBox(gb-U.sW,gb,1,U.y1);L.box(U.mull,U.y1,t*0.6,gb-U.sW-U.mull/2,U.y1/2,0,jm);}
      if(U.tr){glassBox(ga,gb,U.y1+U.mull,o.height-U.jamb);L.box(gb-ga,U.mull,t*0.6,0,U.y1+U.mull/2,0,jm);}}
    // interior casing on faces that are inside the house
    const cw=g.casingW||2.5;for(const f of [-1,1]){if(spec.ext&&f===outZ)continue;const z=f*(t/2+0.375);
      for(const s of [-1,1])L.box(cw,o.height+cw,0.75,s*(o.width/2+cw/2),(o.height+cw)/2,z,jm,false);L.box(o.width+2*cw,cw,0.75,0,o.height+cw/2,z,jm,false);}}
  const zc=side*(t/2-thick/2-0.5);const yH=36;const leaves=[];
  if(dt==='swing')leaves.push({u0:U.u0,u1:U.u1,hinge:hU,active:true});
  else if(dt==='double'){const m=(U.u0+U.u1)/2;leaves.push({u0:U.u0,u1:m-0.06,hinge:-1,active:hU<0},{u0:m+0.06,u1:U.u1,hinge:1,active:hU>0});}
  if(leaves.length){for(const lf of leaves){addDoorSlab(L,lf.u0,lf.u1,U.y0,U.y1,zc,thick,st,mats);const uLatch=lf.hinge>0?lf.u0+2.6:lf.u1-2.6;const uHinge=lf.hinge>0?lf.u1:lf.u0;
      addHinges(L,spec,uHinge,U.y0,U.y1,zc+side*(thick/2),hm);
      const sp=lf.active?spec:{...spec,hw:{...spec.hw,deadbolt:false,type:spec.hw.type==='handleset'?'lever':spec.hw.type}};
      for(const f of [-1,1]){const which=spec.ext?(f===outZ?'out':'in'):'';addHandle(L,sp,uLatch,yH,zc+f*thick/2,f,lf.hinge,hm,which);}
      if(spec.door.kick)L.box(lf.u1-lf.u0-2,8,0.06,(lf.u0+lf.u1)/2,U.y0+4,zc-side*(thick/2+0.03),hm,false);
      if(spec.door.viewer&&lf.active)for(const f of [-1,1])L.cyl(0.5,0.3,(lf.u0+lf.u1)/2,58,zc+f*(thick/2+0.15),hm,'z');
      if(spec.door.closer&&lf.active){const uc=uHinge-lf.hinge*7;L.box(10,2.4,2.2,uc,U.y1-3,zc+side*(thick/2+1.1),hm);L.box(9,0.6,0.6,uc-lf.hinge*3,U.y1+1.2,zc+side*(thick/2+1.6),hm);}}
    if(spec.door.threshold!=='none')L.box(o.width,spec.door.threshold==='ada'?0.5:1,t+1,0,0.25,0,hm,false);return;}
  if(dt==='slider'){const m=(U.u0+U.u1)/2;const fixedRight=hU>0;for(const [a,b,z,fixed] of [[U.u0,m+1,-0.9,!fixedRight],[m-1,U.u1,0.9,fixedRight]]){addDoorSlab(L,a,b,U.y0,U.y1,z,1.75,st==='plank'?'plank':st==='panel6'?'fulllite':st,mats);
      if(!fixed){const uL=fixedRight?a+2.5:b-2.5;for(const f of [-1,1])addHandle(L,{...spec,hw:{...spec.hw,type:spec.hw.type==='lever'?'pull':spec.hw.type}},uL,yH,z+f*0.875,f,fixedRight?1:-1,hm,'');}}
    L.box(o.width,1,t,0,0.5,0,hm,false);return;}
  if(dt==='pocket'){addDoorSlab(L,U.u0,U.u1,U.y0,U.y1,0,thick,st,mats);const uL=hU>0?U.u0+1.8:U.u1-1.8;for(const f of [-1,1])addHandle(L,{...spec,hw:{...spec.hw,type:spec.hw.type==='lever'||spec.hw.type==='knob'?'flushpull':spec.hw.type}},uL,yH,f*thick/2,f,hU,hm,'');return;}
  if(dt==='bifold'){const nP=o.width>=48?4:2;const pw=(U.u1-U.u0)/nP;for(let i=0;i<nP;i++)addDoorSlab(L,U.u0+i*pw+0.06,U.u0+(i+1)*pw-0.06,U.y0,U.y1,zc,1.125,st,mats);
    const knobAt=nP===2?[hU>0?U.u0+pw*0.25:U.u1-pw*0.25]:[U.u0+pw*1.0-1.5,U.u0+pw*3.0+1.5];for(const u of knobAt)L.sphere(0.8,u,yH,zc+side*(0.56+0.8),hm);
    L.box(o.width,1,2,0,U.y1+0.6,zc,hm,false);return;}
  if(dt==='barn'){const wb=o.width+4,hb=o.height+2,zb=side*(t/2+1.25+thick/2);addDoorSlab(L,-wb/2,wb/2,0.5,hb,zb,thick,st==='panel6'?'plank':st,mats);
    L.box(o.width*2+8,1.2,0.6,(hU>0?-1:1)*(o.width/2),hb+2.5,side*(t/2+0.8),hm,false);for(const u of [-wb/2+5,wb/2-5]){L.box(1.6,5,0.3,u,hb+1,zb+side*(thick/2+0.2),hm,false);L.cyl(1.6,0.6,u,hb+2.6,side*(t/2+1.4),hm,'z');}
    const uL=hU>0?-wb/2+3:wb/2-3;for(const f of [-1,1])addHandle(L,{...spec,hw:{...spec.hw,type:'barnpull'}},uL,yH+4,zb+f*thick/2,f,hU,hm,'');return;}
  if(dt==='overhead'){const rows=o.height>96?5:4,cols=Math.max(2,Math.round(o.width/24));const rh=o.height/rows,cwid=o.width/cols;const zo=outZ?outZ*(t/2-1):0;
    L.box(o.width,o.height,1.75,0,o.height/2,zo,mats.slab);for(let r=0;r<rows;r++){const glassRow=st==='garageglass'&&r===rows-1;
      for(let c=0;c<cols;c++){const cu=-o.width/2+cwid*(c+0.5),cy=rh*(r+0.5);if(glassRow)L.box(cwid-5,rh-6,0.4,cu,cy,zo+(outZ||1)*0.9,mats.glass,false);else if(st!=='garage'||true)L.box(cwid-5,rh-6,0.5,cu,cy,zo+(outZ||1)*0.95,mats.slab);}
      if(r)L.box(o.width,0.4,0.2,0,rh*r,zo+(outZ||1)*0.95,dark,false);}
    if(st==='garagecarriage'){L.box(0.3,o.height,0.25,0,o.height/2,zo+(outZ||1)*1.0,dark,false);for(const s of [-1,1])L.cyl(0.45,10,s*6,o.height*0.45,zo+(outZ||1)*1.6,hm,'y');}return;}
}
/* ---- plan diagram of one handing choice, for the picker ---- */
function handingTile(p,o,hinge,swing,opts={}){const q={...o,hinge,swing};const h=doorHanding(p,q);const S=doorSides(p,q);const W=120,H0=124;const dt=o.dtype||'swing';
  // draw with the reference side (outside, or the side the drawing is looked at from) at the bottom
  let ref,ext=false;if(S){ext=S.ext;ref=ext?S.outN:{x:S.n.x,y:S.n.y};}else ref={x:0,y:1};
  const a={x:ref.y,y:-ref.x};const dU=S?(S.d.x*a.x+S.d.y*a.y>0?1:-1):1;const nS=S?((S.n.x*ref.x+S.n.y*ref.y)>0?1:-1):1;
  const sideDown=(swing||1)*nS;const hingeX=(hinge?1:-1)*dU;const ww=44,cx=W/2,cy=62,wt=8;const hx=cx+hingeX*ww/2,lx=cx-hingeX*ww/2;
  const els=[];els.push(html`<rect x="4" y=${cy-wt/2} width=${cx-ww/2-4} height=${wt} className="ht-wall"/>`,html`<rect x=${cx+ww/2} y=${cy-wt/2} width=${W-4-cx-ww/2} height=${wt} className="ht-wall"/>`);
  if(dt==='swing'||dt==='double'){const leaves=dt==='double'?[[cx-ww/2,1],[cx+ww/2,-1]]:[[hx,-hingeX]];for(const [x0,dir] of leaves){const r=dt==='double'?ww/2:ww;const y0=cy+sideDown*wt/2;
      els.push(html`<line x1=${x0} y1=${y0} x2=${x0} y2=${y0+sideDown*r} className="ht-leaf"/>`,html`<path d=${`M${x0} ${y0+sideDown*r} A${r} ${r} 0 0 ${(dir*sideDown)>0?0:1} ${x0+dir*r} ${y0}`} className="ht-arc"/>`,html`<circle cx=${x0} cy=${y0} r="2.2" className="ht-hinge"/>`);}}
  else{const yy=cy+sideDown*(wt/2+3);els.push(html`<line x1=${cx-ww/2} y1=${yy} x2=${cx+ww/2} y2=${yy} className="ht-leaf"/>`,html`<path d=${`M${cx} ${yy+sideDown*6} l${-hingeX*14} 0 m0 0 l${hingeX*4} -3 m${-hingeX*4} 3 l${hingeX*4} 3`} className="ht-arc"/>`);}
  const lab=(t,y)=>html`<text x=${cx} y=${y} textAnchor="middle" className="ht-lab">${t}</text>`;
  const roomBelow=S&&!ext?(()=>{const v=ref;const rooms=p.rooms.filter(r=>r.level===S.w.level);const r=rooms.find(r=>inPoly(S.c.x+v.x*(S.w.thick/2+8),S.c.y+v.y*(S.w.thick/2+8),r.pts));return r?r.name:'';})():'';
  const roomAbove=S&&!ext?(()=>{const v={x:-ref.x,y:-ref.y};const rooms=p.rooms.filter(r=>r.level===S.w.level);const r=rooms.find(r=>inPoly(S.c.x+v.x*(S.w.thick/2+8),S.c.y+v.y*(S.w.thick/2+8),r.pts));return r?r.name:'';})():'';
  return html`<svg viewBox=${`0 0 ${W} ${H0}`} className="htile" aria-hidden="true">${els}${lab(ext?'Inside':roomAbove,9)}${lab(ext?'Outside':roomBelow,H0-3)}</svg>`;}
/* ---- door hardware on the materials list, and door code checks ---- */
try{SHOP_MAP.unshift([/Door hardware/,'Door hardware',7]);}catch(e){}
function hwName(spec){const hw=spec.hw;const fin=hwFinish(hw.finish)[1].toLowerCase();const br=hw.brand&&hw.brand!=='Any brand'?hw.brand+' ':'';const f=(HW_FUNCS.find(x=>x[0]===hw.func)||['',''])[1].replace(/ \(.*\)/,'').toLowerCase();
  const t=hw.type==='handleset'?'handleset':hw.type==='knob'?'knob':hw.type==='lever'?'lever':(HW_TYPES.find(x=>x[0]===hw.type)||['',''])[1].toLowerCase();
  const s=["lever","knob","handleset"].includes(hw.type)?`${br}${f} ${t} set, ${fin}`:`${br}${t}, ${fin}`;return s.charAt(0).toUpperCase()+s.slice(1);}
regExtra({takeoff:(p,add)=>{for(const o of p.openings){if(o.type!=='door'||o.status==='existing'||o.status==='demolish')continue;const dt=o.dtype||'swing';if(dt==='overhead')continue;const spec=doorSpec(p,o);const hw=spec.hw;const mk=openingMarks(p)[o.id]||'';
    const leaves=dt==='double'?2:1;const fin=hwFinish(hw.finish)[1].toLowerCase();
    if(hw.type!=='none'){if(dt==='double'&&['lever','knob','handleset'].includes(hw.type)){add('Door hardware',hwName(spec),1,'EA',mk);add('Door hardware',hwName({...spec,hw:{...hw,func:'dummy',type:hw.type==='handleset'?'lever':hw.type}}),1,'EA',mk+' inactive leaf');add('Door hardware',`Flush bolts, ${fin}`,1,'pair',mk);}
      else add('Door hardware',hwName(spec),dt==='slider'?1:leaves,'EA',mk);}
    if(hw.deadbolt&&(dt==='swing'||dt==='double'))add('Door hardware',`${hw.brand&&hw.brand!=='Any brand'?hw.brand+' single':'Single'}-cylinder deadbolt, ${fin}`,1,'EA',mk);
    if(dt==='swing'||dt==='double'){const hn=spec.hinges;add('Door hardware',`${(HINGE_SIZES.find(x=>x[0]===hn.size)||['',hn.size+'"'])[1]} ${(HINGE_CORNERS.find(x=>x[0]===hn.corner)||['',''])[1].toLowerCase()} ${hn.spring?'spring ':''}hinges, ${hwFinish(hn.finish).at(1).toLowerCase()}`,hn.n*leaves,'EA',mk+(spec.door.mat==='hollow'?' (prehung doors come with hinges; order to change the finish)':''));
      if(spec.door.stop!=='none')add('Door hardware',`${(DOOR_STOPS.find(x=>x[0]===spec.door.stop)||['',''])[1]}, ${fin}`,leaves,'EA',mk);
      if(spec.door.closer)add('Door hardware','Door closer (residential, adjustable)',1,'EA',mk+(spec.garageHouse?' required at garage door, R302.5.1':''));
      if(spec.door.kick)add('Door hardware',`Kick plate 8" x ${Math.round(doorLeafW(o,spec)-2)}", ${fin}`,leaves,'EA',mk);
      if(spec.door.viewer)add('Door hardware',`Door viewer, ${fin}`,1,'EA',mk);
      if(spec.door.threshold==='ada')add('Door hardware','Low-profile ADA threshold, 1/2" max',1,'EA',mk);}}},
  checks:(p,add)=>{const ada=p.settings?.code==='ibc'||p.settings?.ada!==false;
    for(const o of p.openings){if(o.type!=='door'||o.status==='demolish')continue;const dt=o.dtype||'swing';if(dt==='overhead')continue;const spec=doorSpec(p,o);const S=spec.sides;if(!S||!S.w)continue;const c=openingCenter(p,o);const T={kind:'opening',id:o.id};const mk=openingMarks(p)[o.id]||'Door';const lv=S.w.level;
      if(ada&&spec.hw.type==='knob')add('warn',{set:'ADA',code:'309.4',title:'Operable parts'},`${mk}: knob hardware`,'Knobs need tight grasping and twisting. Use levers, push/pull or loop handles on accessible doors.',T,c,lv);
      if(ada&&spec.door.threshold==='std'&&(dt==='swing'||dt==='double'))add('warn',{set:'ADA',code:'404.2.5',title:'Thresholds'},`${mk}: threshold too tall`,'A standard 1" sill is over the 1/2" ADA limit (3/4" for existing sliding doors). Use a low-profile threshold.',T,c,lv);
      if(spec.garageHouse){const solid=['solidcore','wood','steel'].includes(spec.door.mat)&&(spec.door.thick||1.375)>=1.375-0.01;
        if(!solid&&!spec.door.fire20)add('error',{set:'IRC',code:'R302.5.1',title:'Garage to house door'},`${mk}: door to the garage is not fire resistant`,'Use solid wood, solid-core or steel at least 1-3/8" thick, honeycomb-core steel, or a 20-minute rated door.',T,c,lv);
        if(!spec.door.closer)add('error',{set:'IRC',code:'R302.5.1',title:'Garage to house door'},`${mk}: door to the garage needs a closer`,'Doors between the garage and the house must be self-closing or automatic-closing (closer or spring hinges).',T,c,lv);}
      if(spec.ext&&(dt==='swing'||dt==='double')&&spec.hw.func==='passage')add('warn',{set:'Practice',code:'Security',title:'Entry locks'},`${mk}: outside door does not lock`,'Passage hardware has no lock. Use a keyed entry set or handleset, and a deadbolt.',T,c,lv);
      const uses=[S.into,S.from].filter(Boolean).map(r=>r.use);if(!spec.ext&&uses.includes('bath')&&spec.hw.func==='passage'&&['lever','knob'].includes(spec.hw.type))add('warn',{set:'Practice',code:'Privacy',title:'Bathroom lock'},`${mk}: bathroom door has no privacy lock`,'Use privacy hardware on bathroom doors.',T,c,lv);}}});
