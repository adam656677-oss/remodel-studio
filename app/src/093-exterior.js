/* ======================= exterior: foundation, steps, decks, porches, columns, railings ======================= */

/* ---- procedural textures (one foot = one texture unit in the 3D scene) ---- */
const _tex={};
function texOf(kind){if(_tex[kind])return _tex[kind];if(typeof document==='undefined')return null;
  const c=document.createElement('canvas');const S=256;c.width=c.height=S;const g=c.getContext('2d');let rep=[1,1];
  if(kind==='brick'){g.fillStyle='#d8d2c8';g.fillRect(0,0,S,S);const rows=9,cols=3;const bh=S/rows,bw=S/cols;
    for(let r=0;r<rows;r++)for(let k=-1;k<=cols;k++){const x=k*bw+(r%2?bw/2:0);const sh=0.85+((r*7+k*13)%10)/40;g.fillStyle=`rgb(${Math.round(160*sh)},${Math.round(72*sh)},${Math.round(56*sh)})`;g.fillRect(x+3,r*bh+3,bw-6,bh-5);}rep=[0.5,0.5];}
  else if(kind==='block'){g.fillStyle='#9a9993';g.fillRect(0,0,S,S);const rows=3,cols=1.5;const bh=S/rows,bw=S/cols;
    for(let r=0;r<rows;r++)for(let k=-1;k<=2;k++){const x=k*bw+(r%2?bw/2:0);g.fillStyle=`rgb(${170+r*4},${168+r*4},${160+r*3})`;g.fillRect(x+3,r*bh+3,bw-6,bh-6);}rep=[0.5,0.5];}
  else if(kind==='lattice'){g.clearRect(0,0,S,S);g.strokeStyle='#f3f1ea';g.lineWidth=S*0.09;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*S/2,0);g.lineTo(i*S/2+S,S);g.stroke();g.beginPath();g.moveTo(i*S/2+S,0);g.lineTo(i*S/2,S);g.stroke();}rep=[1,1];}
  else if(kind==='boards'){g.fillStyle='#ffffff';g.fillRect(0,0,S,S);for(let i=0;i<2;i++){g.fillStyle='rgba(0,0,0,0.28)';g.fillRect(0,i*S/2,S,S*0.025);g.fillStyle='rgba(0,0,0,0.05)';g.fillRect(0,i*S/2+S*0.18,S,S*0.012);}rep=[1,1];}
  else if(kind==='stone'){g.fillStyle='#8f8a80';g.fillRect(0,0,S,S);let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let i=0;i<26;i++){const x=rnd()*S,y=rnd()*S,w=30+rnd()*60,h=18+rnd()*30;const v=140+rnd()*60;g.fillStyle=`rgb(${v},${v-8},${v-20})`;g.beginPath();g.ellipse(x,y,w/2,h/2,rnd(),0,Math.PI*2);g.fill();}rep=[0.5,0.5];}
  else if(kind==='stucco'){g.fillStyle='#d9d4c9';g.fillRect(0,0,S,S);for(let i=0;i<1600;i++){const v=200+Math.random()*40;g.fillStyle=`rgba(${v},${v-4},${v-12},0.5)`;g.fillRect(Math.random()*S,Math.random()*S,2,2);}rep=[0.5,0.5];}
  else if(kind==='beadboard'){g.fillStyle='#ffffff';g.fillRect(0,0,S,S);for(let i=0;i<4;i++){g.fillStyle='rgba(0,0,0,0.16)';g.fillRect(i*S/4,0,S*0.012,S);}rep=[1,1];}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.anisotropy=4;if(THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;
  return (_tex[kind]=t);}
function texMat(ctx,kind,color,extra={}){const t=texOf(kind);return ctx.col(color,{map:t,key:'tx-'+kind+(extra.rot||''),roughness:.9,...(kind==='lattice'?{transparent:true,alphaTest:0.4,side:THREE.DoubleSide}:{}),...extra});}

/* ---- foundation ---- */
const FOUND_TYPES=[['crawl','Crawlspace: raised floor on a foundation wall'],['piers','Piers and beams: raised floor on piers'],['stemwall','Stem wall with a filled slab'],['slab','Slab on grade'],['basement','Basement']];
const FOUND_FINISH=[['brick','Brick'],['block','Painted block (CMU)'],['parge','Parged or stuccoed'],['stone','Stone veneer'],['siding','Siding carried down']];
const SKIRTS=[['lattice','Lattice'],['vinyl','Vinyl or board skirting'],['brick','Brick curtain wall'],['none','Open (no skirting)']];
function foundOf(p){const fr=framingOf(groundLevel(p));const s=p.settings?.foundation||{};
  return {type:fr.foundation||'crawl',raise:p.settings?.gradeOffset||0,finish:s.finish||'brick',color:s.color||null,vents:s.vents!==false,skirt:s.skirt||'lattice',
    pier:s.pier||16,pierSpacing:s.pierSpacing||96,wallT:s.wallT||8,footW:s.footW||16,footD:s.footD||8,frost:s.frost??12,access:s.access!==false,joistD:LUMBER[fr.joist]||9.25,girders:fr.girders||96,
    floorD:(fr.foundation==='slab'?0:(LUMBER[fr.joist]||9.25)+0.75+1.5)};}
const FOUND_COLOR={brick:0xa65a44,block:0xb9b6ae,parge:0xbdb7aa,stone:0x958d80,siding:0xeeeae0};
function addFoundation3D(p,add,std,ctxMaker){
  const f=foundOf(p);const first=groundLevel(p);const ol=buildingOutline(p,first.id);if(!ol)return false;
  const ctx=ctxMaker();const zg=first.elevation-f.raise;const zTop=first.elevation-f.floorD;const sloped=slopeOf(p).fall>0;const gAt=q=>sloped?gradeAt(p,q.x,q.y):zg;
  const finKind=f.finish==='brick'?'brick':f.finish==='block'?'block':f.finish==='stone'?'stone':f.finish==='parge'?'stucco':null;
  const fc=f.color?hexNum(f.color):FOUND_COLOR[f.finish]||0xb0aca4;const fmat=finKind?texMat(ctx,finKind,f.color?fc:0xffffff):ctx.col(fc,{roughness:.95});
  const extW=p.walls.find(w=>w.level===first.id&&w.kind==='exterior');const sidC=extW&&extW.color?hexNum(extW.color):SIDING_COLOR[(extW&&extW.siding)||'vinyl']||0xeeeae0;
  const outer=offsetPoly(ol.pts,0.5),inner=offsetPoly(ol.pts,-f.wallT),rimIn=offsetPoly(ol.pts,-6);
  // rim band (sill, rim joist, subfloor) in the siding color between the foundation and the wall
  if(f.type!=='slab'&&f.floorD>0)ctx.prism(ol.pts,zTop,first.elevation,ctx.col(sidC),[rimIn]);
  if(f.type==='basement'&&p.levels.some(l=>l.basement))return true; // the basement level's own walls are the foundation
  if(f.type==='slab'||f.type==='stemwall'||f.type==='crawl'||f.type==='basement'){
    const top=f.type==='slab'?first.elevation:zTop;const wm=f.type==='slab'&&!sloped?ctx.col(0xbdb9b1,{roughness:1}):fmat;
    if(sloped)addSteppedWall(ctx,p,outer,f.wallT+0.5,top,6,wm);else if(top-zg>0.3)ctx.prism(outer,zg-6,top,wm,[inner]);
    if(f.type==='crawl'&&f.vents&&top-zg>10){const area=ol.area/144;const nV=Math.max(4,Math.ceil(area/150/0.45));const per=polyPerimPts(ol.pts);
      const spots=alongOutline(outer,Math.max(48,per/nV),{corner:30});const vm=ctx.col(0x3a3b3c,{roughness:.6,metalness:.3});
      for(const v of spots){const n={x:v.d.y,y:-v.d.x};const ang=Math.atan2(v.d.y,v.d.x);const cz=Math.min(top-6,zg+(top-zg)/2+2);
        const nn=(()=>{const t={x:v.x+n.x*2,y:v.y+n.y*2};return inPoly(t.x,t.y,ol.pts.map(q=>[q.x,q.y]))?{x:-n.x,y:-n.y}:n;})();
        const czl=sloped?Math.max(gAt(v)+6,top-14):cz;if(top-gAt(v)>14)ctx.box(v.x+nn.x*0.3,v.y+nn.y*0.3,czl-4,16,1,8,ang,vm,false);}}
    return true;}
  if(f.type==='piers'){const pm=texMat(ctx,'block',0xffffff);const beamZ=zTop-7.5;
    // perimeter beam
    ctx.prism(offsetPoly(ol.pts,-1),beamZ,zTop,ctx.col(0x8c7a62,{roughness:.9}),[offsetPoly(ol.pts,-6.5)]);
    for(const q of alongOutline(offsetPoly(ol.pts,-f.pier/2-1),f.pierSpacing))ctx.box(q.x,q.y,gAt(q)-6,f.pier,f.pier,beamZ-gAt(q)+6,Math.atan2(q.d.y,q.d.x),pm);
    // interior girder lines
    const xs=ol.pts.map(q=>q.x),ys=ol.pts.map(q=>q.y);const B={x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)};const longX=B.x1-B.x0>=B.y1-B.y0;
    const lo=longX?B.y0:B.x0,hi=longX?B.y1:B.x1;const ng=Math.max(1,Math.round((hi-lo)/f.girders));
    for(let i=1;i<ng;i++){const v=lo+(hi-lo)*i/ng;const L=longX?B.x1-B.x0:B.y1-B.y0;const np=Math.max(1,Math.round(L/f.pierSpacing));
      for(let j=0;j<=np;j++){const u=(longX?B.x0:B.y0)+12+(L-24)*j/np;const x=longX?u:v,y=longX?v:u;if(inPoly(x,y,ol.pts.map(q=>[q.x,q.y]))){const g=gAt({x,y});ctx.box(x,y,g-6,f.pier,f.pier,beamZ-g+6,0,pm);}}
      const a=longX?{x:B.x0+8,y:v}:{x:v,y:B.y0+8},b=longX?{x:B.x1-8,y:v}:{x:v,y:B.y1-8};ctx.box((a.x+b.x)/2,(a.y+b.y)/2,beamZ,Math.hypot(b.x-a.x,b.y-a.y),4.5,7.5,longX?0:Math.PI/2,ctx.col(0x8c7a62,{roughness:.9}),false);}
    if(f.skirt!=='none'&&beamZ-zg>2){const sk=offsetPoly(ol.pts,-1.5);const mat=f.skirt==='lattice'?texMat(ctx,'lattice',0xffffff):f.skirt==='brick'?texMat(ctx,'brick',0xffffff):ctx.col(sidC,{roughness:.8});
      if(sloped)addSteppedWall(ctx,p,offsetPoly(ol.pts,-1),f.skirt==='brick'?4.5:1.25,beamZ,2,mat);else ctx.prism(sk,zg-2,beamZ,mat,[offsetPoly(ol.pts,f.skirt==='brick'?-5.5:-2.25)]);}
    return true;}
  return false;
}
function foundationFaces(p,F){const f=foundOf(p);const first=groundLevel(p);const ol=buildingOutline(p,first.id);if(!ol)return;const zg=first.elevation-f.raise,zTop=first.elevation-f.floorD;
  if(f.type!=='slab'&&f.floorD>0)polyFaces(F,ol.pts,zTop,first.elevation,'part',{fill:'#ffffff',w:0.4});
  const top=f.type==='slab'?first.elevation:f.type==='piers'?zTop-7.5:zTop;
  if(top-zg>0.3){const hatch=f.type==='piers'?(f.skirt==='lattice'?'lattice':f.skirt==='brick'?'brick':null):f.finish==='brick'?'brick':f.finish==='block'?'block':null;
    const ex={fill:f.type==='piers'&&f.skirt==='none'?'#ffffff':'#e4e4e4',hatch,w:0.5};if(slopeOf(p).fall>0)steppedFaces(F,p,offsetPoly(ol.pts,0.5),top,0,ex);else polyFaces(F,offsetPoly(ol.pts,0.5),zg,top,'part',ex);}}
function slopeChecks(p,add){const S=slopeOf(p);if(!S.fall)return;const G=gradeFrame(p);const first=groundLevel(p);const ol=buildingOutline(p,first.id);if(!ol)return;const f=foundOf(p);const R=(code,title)=>({set:'IRC',code,title});
  const pct=G.slope*100;const lowPt=ol.pts.reduce((a,q)=>gradeAt(p,q.x,q.y)<gradeAt(p,a.x,a.y)?q:a,ol.pts[0]);
  if(pct>10)add('warn',R('R403.1.5','Slope of footings'),'Step the footings',`The ground falls about ${pct.toFixed(0)}% across the house. Where the bottom of the footing would slope more than 1 in 10, footings must be level and stepped (IRC R403.1.5).`,null,lowPt,first.id);
  const lowExp=first.elevation-gradeAt(p,lowPt.x,lowPt.y);if(['crawl','stemwall'].includes(f.type)&&lowExp>48)add('warn',R('R404.1','Foundation wall height'),'Tall foundation wall on the low side',`About ${fmtLen(lowExp)} from the floor to the ground on the low side. Unbalanced backfill and plain masonry walls over about 4 ft need the reinforcement in IRC Table R404.1.1 or an engineered design.`,null,lowPt,first.id);
  if(f.type==='piers'&&lowExp>72)add('warn',R('R606','Tall piers'),'Tall piers on the low side',`Piers reach about ${fmtLen(lowExp)} on the low side. Isolated masonry piers taller than 10 times their least dimension need bracing or reinforcement; consider a pier-and-beam design checked by an engineer.`,null,lowPt,first.id);}
regExtra({checks:slopeChecks});
function foundationChecks(p,add){
  const f=foundOf(p);const first=groundLevel(p);const ol=buildingOutline(p,first.id);if(!ol)return;const c={x:ol.pts[0].x,y:ol.pts[0].y};
  const R=(code,title)=>({set:'IRC',code,title});
  if(['crawl','piers'].includes(f.type)){const clear=f.raise-f.floorD;
    if(clear<18)add('warn',R('R317.1','Wood near the ground'),'Floor framing is close to the ground',`About ${fmtLen(Math.max(0,clear))} from grade to the bottom of the floor framing. Joists closer than 18" (girders closer than 12") to exposed ground must be pressure treated or naturally durable. Raise the floor or use treated framing.`,null,c,first.id);
    if(f.type==='crawl'&&!f.vents)add('warn',R('R408.1','Crawlspace ventilation'),'Crawlspace needs vents or a conditioned crawlspace',`Provide 1 sq ft of net vent area for each 150 sq ft of crawlspace (${Math.ceil(ol.area/144/150)} sq ft here), with one vent within 3 ft of each corner, or build a sealed, conditioned crawlspace per R408.3.`,null,c,first.id);
    if(f.type==='crawl'&&f.access===false)add('warn',R('R408.4','Crawlspace access'),'Crawlspace needs an access opening','At least 18" x 24" through the floor, or 16" x 24" through a perimeter wall.',null,c,first.id);}
  if(f.footW<12)add('error',R('R403.1.1','Footing width'),'Footing too narrow','Footings must be at least 12" wide (more for heavier loads and weak soils; see Table R403.1(1)).',null,c,first.id);
  if(f.footD<6)add('error',R('R403.1.1','Footing thickness'),'Footing too thin','Footings must be at least 6" thick.',null,c,first.id);
  if(f.frost<12)add('warn',R('R403.1.4','Footing depth'),'Footing too shallow','The bottom of exterior footings must be at least 12" below undisturbed ground and below the local frost line.',null,c,first.id);
  // exterior doors need a landing and steps when the floor is raised
  for(const lv of sortedLevels(p)){const ext=p.walls.filter(w=>w.level===lv.id&&w.kind==='exterior');const above=lv.elevation+f.raise;if(above<8)continue;
    for(const o of p.openings.filter(o=>o.type==='door'&&ext.some(w=>w.id===o.wall))){const w=ext.find(w=>w.id===o.wall);const cpt=openingCenter(p,o);const on=outwardNormal(ext,w);const out={x:cpt.x+on.x*(w.thick/2+18),y:cpt.y+on.y*(w.thick/2+18)};
      const served=(p.steps||[]).some(s=>s.level===lv.id&&ptsIn(out,stepsInfo(p,s).outline))||(p.decks||[]).some(d=>d.level===lv.id&&inPoly(out.x,out.y,d.pts))||(p.ramps||[]).some(r=>r.level===lv.id&&ptsIn(out,rampInfo(p,r).corners));
      if(!served)add(lv.elevation>0?'error':'warn',R('R311.3','Landing at exterior door'),'Outside door needs a landing and steps',`The floor is ${fmtLen(above)} above the ground here. Add a landing at least 36" deep and as wide as the door, with steps (Exterior → Steps, or "Add steps at every outside door").`,{kind:'opening',id:o.id},cpt,lv.id);}}
}
function foundationTakeoff(p,add,W){
  const f=foundOf(p);const first=groundLevel(p);const ol=buildingOutline(p,first.id);if(!ol)return;const per=polyPerimPts(ol.pts)/12;const area=ol.area/144;const C='Foundation';
  const footCY=per*(f.footW/12)*(f.footD/12)/27;
  if(f.type==='slab'||f.type==='stemwall'){add(C,`Concrete for ${f.type==='slab'?'slab with thickened edge':'slab'} (4")`,Math.ceil((area*(4/12)/27+(f.type==='slab'?per*(12/12)*(8/12)/27:0))*W*10)/10,'CY');add(C,'6 mil vapor retarder',Math.ceil(area*1.1),'SF');add(C,'#4 rebar, 20\'',Math.ceil(per*2/20*W),'EA','2 bars in the edge');}
  if(f.type!=='slab'){add(C,`Concrete for footings ${f.footW}" x ${f.footD}"`,Math.ceil(footCY*W*10)/10,'CY',`${Math.round(per)} LF of perimeter`);add(C,'#4 rebar, 20\'',Math.ceil(per*2/20*W),'EA','2 bars in the footing');}
  if(['crawl','stemwall','basement'].includes(f.type)){const h=(f.type==='basement'?96:f.raise-f.floorD+f.frost)/12;add(C,`8" CMU foundation block 8x16`,Math.ceil(per*Math.max(1,h)*1.125*W),'EA',`${fmtLen(h*12)} average height`);add(C,'Type S mortar, 80 lb',Math.ceil(per*Math.max(1,h)*1.125/30),'bag');
    if(f.finish==='brick')add(C,'Brick veneer on exposed foundation',Math.ceil(per*Math.max(0.5,(f.raise-f.floorD)/12)*7*W),'EA','about 7 bricks per sq ft');
    add(C,'Treated 2x6 sill plate with sill seal',Math.ceil(per*W),'LF');add(C,'1/2" anchor bolts with nuts and washers',Math.ceil(per/6)+2,'EA','6\' o.c. and within 12" of each end (R403.1.6)');}
  if(f.type==='crawl'&&f.vents)add(C,'Foundation vent 8x16',Math.max(4,Math.ceil(area/150/0.45)),'EA','1 sq ft net per 150 sq ft');
  if(f.type==='crawl'&&f.access)add(C,'Crawlspace access door 16x24',1,'EA');
  if(f.type==='piers'){const np=Math.ceil(per*12/f.pierSpacing)+Math.max(0,Math.round(Math.sqrt(area)*12/f.girders)-1)*Math.ceil(Math.sqrt(area)*12/f.pierSpacing);
    add(C,`Piers ${f.pier}" x ${f.pier}" CMU on 24" x 24" x 10" footings`,np,'EA');add(C,'Concrete for pier footings',Math.ceil(np*(2*2*10/12)/27*W*10)/10,'CY');
    if(f.skirt==='lattice')add(C,'Lattice skirting 4\' x 8\' panels',Math.ceil(per/8*W),'EA');else if(f.skirt==='vinyl')add(C,'Vinyl skirting',Math.ceil(per*W),'LF');else if(f.skirt==='brick')add(C,'Brick curtain wall',Math.ceil(per*Math.max(1,(f.raise-f.floorD)/12)*7*W),'EA');}
}
regExtra({takeoff:foundationTakeoff,checks:foundationChecks});

/* ---- steps (stoops) at doors and decks ---- */
// x,y = middle of the landing's back edge (against the house or deck); a = outward direction (radians)
function stepsInfo(p,s){
  const lv=lvlOf(p,s.level)||p.levels[0];const top=s.top??-0.75;const dd={x:Math.cos(s.a||0),y:Math.sin(s.a||0)};
  const zTop=lv.elevation+top;const est=(s.landing??48)+Math.max(0,(zTop-gradeAt(p,s.x,s.y))/7.5)*(s.tread||11);const zg=(s.ground??gradeAt(p,s.x+dd.x*est,s.y+dd.y*est));const fall=Math.max(0,s.rise??(zTop-zg));
  const n=Math.max(0,Math.ceil(fall/(s.maxRiser||7.5)-1e-9));const riserH=n?fall/n:0;const W=s.width||48,Ld=s.landing??48;const T=s.tread||11;
  const d={x:Math.cos(s.a||0),y:Math.sin(s.a||0)},nv={x:-d.y,y:d.x};const P=(u,v)=>({x:s.x+d.x*u+nv.x*v,y:s.y+d.y*u+nv.y*v});
  const side=s.side||'front';const fw=side==='front'?(s.fw||W):Math.min(s.fw||Math.max(36,Math.min(W,48)),Ld||W);
  const treads=Ld>0?n-1:Math.max(0,n-1);const run=treads*T;
  // flight frame: origin at the flight's top edge middle, fd = direction down the flight, fv = across
  let o,fd;if(side==='front'){o=P(Ld,0);fd=d;}else if(side==='left'){o=P(Ld-fw/2,-W/2);fd={x:-nv.x,y:-nv.y};}else{o=P(Ld-fw/2,W/2);fd=nv;}
  const fv={x:-fd.y,y:fd.x};const F=(u,v)=>({x:o.x+fd.x*u+fv.x*v,y:o.y+fd.y*u+fv.y*v});
  const landing=Ld>0?[P(0,-W/2),P(Ld,-W/2),P(Ld,W/2),P(0,W/2)]:[];const flight=treads>0?[F(0,-fw/2),F(run,-fw/2),F(run,fw/2),F(0,fw/2)]:[];
  const outline=Ld>0&&treads>0?hullPts([...landing,...flight]):landing.length?landing:flight.length?flight:[P(0,-W/2),P(1,-W/2),P(1,W/2),P(0,W/2)];
  const rails=n>=4||(s.rail==='both');const guard=fall>30;
  return {lv,zTop,zg,fall,n,riserH,treads,T,W,Ld,fw,run,d,nv,P,F,fd,fv,side,landing,flight,outline,rails,guard};
}
function hullPts(pts){const P=[...pts].sort((a,b)=>a.x-b.x||a.y-b.y);const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);const lo=[],up=[];
  for(const p of P){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}for(const p of [...P].reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
  return lo.slice(0,-1).concat(up.slice(0,-1));}
const STEP_MATS=[['concrete','Concrete'],['brick','Brick'],['stone','Stone'],['wood','Treated wood'],['composite','Composite']];
const STEP_COLOR={concrete:0xc4c0b8,brick:0xa65a44,stone:0x9b9384,wood:0xa98a62,composite:0x8a7563};
const RAIL_STYLES=[['baluster','Wood balusters'],['metal','Metal balusters'],['cable','Cable'],['glass','Glass panels'],['board','Solid board'],['pipe','Pipe handrail only']];
const SIDES_ST=[['front','Straight out'],['left','Down the left side'],['right','Down the right side']];
function newSteps(lv,x,y,a,extra={}){return {id:uid('sp'),level:lv.id,x,y,a,width:48,landing:48,tread:11,side:'front',mat:'concrete',rail:'auto',railStyle:'metal',status:'new',...extra};}
regObj('steps',{coll:'steps',label:'Steps',plural:'steps and stoops',z:3,layer:'over',
  pts:(p,s)=>stepsInfo(p,s).outline,
  hit:(p,s,raw)=>ptsIn(raw,stepsInfo(p,s).outline),
  move:(s,dx,dy)=>({...s,id:s.id,x:s.x+dx,y:s.y+dy}),
  rotate:s=>({a:((s.a||0)+Math.PI/2)%(Math.PI*2)}),
  title:(s,p)=>{const si=stepsInfo(p,s);return si.n?`Steps · ${si.n} risers`:'Landing';},
  svg:(p,lv,s,S,view,isSel)=>{const si=stepsInfo(p,s);const pl=pts=>pts.map(q=>S(q.x,q.y).join(',')).join(' ');const out=[];
    if(si.landing.length)out.push(html`<polygon key="l" points=${pl(si.landing)} className=${'stp'+(isSel?' stp-sel':'')}/>`);
    if(si.flight.length){out.push(html`<polygon key="f" points=${pl(si.flight)} className=${'stp'+(isSel?' stp-sel':'')}/>`);
      for(let i=1;i<=si.treads;i++){const a=S(...Object.values(si.F(i*si.T,-si.fw/2))),b=S(...Object.values(si.F(i*si.T,si.fw/2)));out.push(html`<line key=${'t'+i} x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]} className="stp-l"/>`);}
      const A=S(...Object.values(si.F(4,0))),B=S(...Object.values(si.F(Math.max(6,si.run-4),0)));const ang=Math.atan2(B[1]-A[1],B[0]-A[0]),ah=7;
      out.push(html`<line key="ar" x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className="stp-l"/>`,html`<polygon key="ah" className="stp-a" points=${[B,[B[0]-ah*Math.cos(ang-0.45),B[1]-ah*Math.sin(ang-0.45)],[B[0]-ah*Math.cos(ang+0.45),B[1]-ah*Math.sin(ang+0.45)]].map(q=>q.join(',')).join(' ')}/>`);
      if(view.s>0.45)out.push(html`<text key="tx" x=${(A[0]+B[0])/2} y=${(A[1]+B[1])/2-6} textAnchor="middle" className="dimt halo">DN ${si.n}R</text>`);}
    return out;},
  dl:(dl,p,lv,s,PT,k)=>{const si=stepsInfo(p,s);const P2=q=>PT(q.x,q.y);if(si.landing.length)dl.poly(si.landing.map(P2),{stroke:INK,w:0.6,fill:'#ffffff'});
    if(si.flight.length){dl.poly(si.flight.map(P2),{stroke:INK,w:0.6,fill:'#ffffff'});for(let i=1;i<=si.treads;i++)dl.line(...P2(si.F(i*si.T,-si.fw/2)),...P2(si.F(i*si.T,si.fw/2)),0.35);
      const A=P2(si.F(4,0)),B=P2(si.F(Math.max(6,si.run-4),0));dl.line(...A,...B,0.5);const ang=Math.atan2(B[1]-A[1],B[0]-A[0]),ah=0.06*k;dl.poly([B,[B[0]-ah*Math.cos(ang-0.45),B[1]-ah*Math.sin(ang-0.45)],[B[0]-ah*Math.cos(ang+0.45),B[1]-ah*Math.sin(ang+0.45)]],{fill:INK});
      dl.text((A[0]+B[0])/2,(A[1]+B[1])/2-0.05*k,`DN ${si.n}R`,{size:5*k,anchor:'middle',bold:true});}},
  faces:(p,lv,s,F)=>{const si=stepsInfo(p,s);const fill=s.mat==='brick'?'#e4e4e4':'#ffffff';const hatch=s.mat==='brick'?'brick':null;
    if(si.landing.length)polyFaces(F,si.landing,si.zg,si.zTop,'part',{fill,hatch});
    for(let i=0;i<si.treads;i++){const z=si.zTop-(i+1)*si.riserH;polyFaces(F,[si.F(i*si.T,-si.fw/2),si.F((i+1)*si.T,-si.fw/2),si.F((i+1)*si.T,si.fw/2),si.F(i*si.T,si.fw/2)],si.zg,z,'part',{fill,hatch,w:0.35});}},
  add3D:(p,lv,s,ctx)=>{const si=stepsInfo(p,s);const mat=s.mat||'concrete';const c=s.color?hexNum(s.color):STEP_COLOR[mat];
    const m=ctx.isSel(s)?ctx.mSel:mat==='brick'?texMat(ctx,'brick',0xffffff):mat==='stone'?texMat(ctx,'stone',0xffffff):ctx.col(c,{roughness:.85});const solid=mat!=='wood'&&mat!=='composite';
    if(si.landing.length){if(solid)ctx.prism(si.landing,si.zg-2,si.zTop,m);else{ctx.prism(si.landing,si.zTop-1,si.zTop,m);for(const q of [si.P(si.Ld-3,-si.W/2+3),si.P(si.Ld-3,si.W/2-3)])ctx.box(q.x,q.y,si.zg,5.5,5.5,si.zTop-si.zg-1,Math.atan2(si.d.y,si.d.x),ctx.col(0x8f7552));ctx.prism(si.landing,si.zTop-8.25,si.zTop-1,ctx.col(0x8f7552),[offsetPoly(si.landing,-1.5)]);}}
    const ang=Math.atan2(si.fd.y,si.fd.x);
    for(let i=0;i<si.treads;i++){const z=si.zTop-(i+1)*si.riserH;const c0=si.F((i+0.5)*si.T,0);
      if(solid)ctx.box(c0.x,c0.y,si.zg-2,si.T,si.fw,z-si.zg+2,ang,m);else ctx.box(c0.x,c0.y,z-1,si.T+1,si.fw,1,ang,m);}
    if(!solid&&si.treads>0){const st=ctx.col(0x8f7552);for(const v of [-si.fw/2+1,0,si.fw/2-1]){const a=si.F(0,v),b=si.F(si.run+si.T*0.5,v);ctx.stick({...a,z:si.zTop-1.5},{...b,z:si.zg},1.5,9.25,st);}}
    // rails
    const style=s.railStyle||'metal';const want=s.rail==='none'?false:s.rail==='both'||si.rails;
    if(want&&si.treads>0)for(const v of [-si.fw/2+2,si.fw/2-2]){const a=si.F(0,v),b=si.F(si.run+si.T*0.5,v);ctx.railing([{...a,z:si.zTop},{...b,z:si.zg+si.riserH}],{h:34,style:style==='pipe'?'cable':style,metal:style==='metal'||style==='pipe',color:s.railColor});}
    if(si.guard&&s.rail!=='none'&&si.landing.length){const L=si.landing;const segs=[];if(si.side!=='left')segs.push([si.P(0,-si.W/2),si.P(si.Ld,-si.W/2)]);if(si.side!=='right')segs.push([si.P(0,si.W/2),si.P(si.Ld,si.W/2)]);if(si.side!=='front'){segs.push([si.P(si.Ld,-si.W/2),si.P(si.Ld,si.W/2)]);}
      for(const [a,b] of segs)ctx.railing([{...a,z:si.zTop},{...b,z:si.zTop}],{h:36,style:style==='pipe'?'metal':style,metal:style==='metal'||style==='pipe',color:s.railColor});}},
  panel:(s,{p,up})=>{const si=stepsInfo(p,s);const rOK=si.riserH<=7.75+1e-6,tOK=si.T>=10-1e-6,lOK=!si.Ld||si.Ld>=36;
    return html`<div className="sec"><h3>Landing and steps</h3>
      <${Field} label="Landing depth (0 for none)" id="sp-ld"><${LenInput} id="sp-ld" value=${s.landing??48} onChange=${v=>up({landing:v})}/><//>
      <${Field} label="Landing width" id="sp-w"><${LenInput} id="sp-w" value=${s.width||48} onChange=${v=>v>0&&up({width:v})}/><//>
      <${Field} label="Steps go" id="sp-sd"><${Sel} id="sp-sd" value=${s.side||'front'} onChange=${v=>up({side:v})} options=${SIDES_ST}/><//>
      ${s.side&&s.side!=='front'?html`<${Field} label="Step width" id="sp-fw"><${LenInput} id="sp-fw" value=${si.fw} onChange=${v=>v>0&&up({fw:v})}/><//>`:null}
      <${Field} label="Tread depth" id="sp-t"><${LenInput} id="sp-t" value=${s.tread||11} onChange=${v=>v>0&&up({tread:v})}/><//>
      <${Field} label="Landing top below the floor" id="sp-top"><${LenInput} id="sp-top" value=${-(s.top??-0.75)} onChange=${v=>up({top:-v})}/><//>
      <${Field} label="Total drop to the ground" id="sp-r"><${LenInput} id="sp-r" value=${s.rise} placeholder=${'Auto: '+fmtLen(si.fall)} onChange=${v=>up({rise:v})}/><//>
      <${Field} label="Built from" id="sp-m"><${Sel} id="sp-m" value=${s.mat||'concrete'} onChange=${v=>up({mat:v})} options=${STEP_MATS}/><//>
      <${ColorPick} id="sp-col" label="Color" value=${s.color} fallback=${'#'+STEP_COLOR[s.mat||'concrete'].toString(16).padStart(6,'0')} onChange=${v=>up({color:v})}/>
      <${Field} label="Handrails" id="sp-rl"><${Sel} id="sp-rl" value=${s.rail||'auto'} onChange=${v=>up({rail:v})} options=${[['auto','When required (4 or more risers)'],['both','Both sides'],['none','None']]}/><//>
      <${Field} label="Rail style" id="sp-rs"><${Sel} id="sp-rs" value=${s.railStyle||'metal'} onChange=${v=>up({railStyle:v})} options=${RAIL_STYLES}/><//>
      <div className="stat"><span>Risers</span><span className="mono">${si.n} at ${fmtLen(si.riserH)}</span></div>
      <div className="stat"><span>Run</span><span className="mono">${si.treads} treads, ${fmtLen(si.run)}</span></div>
      <div className="row"><span className=${'pill '+(rOK?'ok':'bad')}>Riser ${rOK?'≤':'>'} 7¾"</span><span className=${'pill '+(tOK?'ok':'bad')}>Tread ${tOK?'≥':'<'} 10"</span><span className=${'pill '+(lOK?'ok':'bad')}>Landing ${lOK?'≥':'<'} 36"</span>${si.rails?html`<span className="pill ok">Handrail needed</span>`:null}${si.guard?html`<span className="pill warn">Guard on landing (over 30")</span>`:null}</div>
      <p className="note">2021 IRC R311.3 landings, R311.7 stairs, R311.7.8 handrails (4 or more risers), R312.1 guards (more than 30" above grade). Press E to turn the steps.</p></div>`;},
  checks:(p,add)=>{for(const s of p.steps||[]){const si=stepsInfo(p,s);const T={kind:'steps',id:s.id};const pt={x:s.x,y:s.y};const R=(c,t)=>({set:'IRC',code:c,title:t});
    if(si.riserH>7.75+1e-6)add('error',R('R311.7.5.1','Riser height'),'Step risers too tall',`${fmtLen(si.riserH)}; the limit is 7-3/4".`,T,pt,s.level);
    if(si.T<10-1e-6&&si.treads)add('error',R('R311.7.5.2','Tread depth'),'Step treads too shallow',`${fmtLen(si.T)}; at least 10".`,T,pt,s.level);
    if(si.Ld&&si.Ld<36)add('error',R('R311.3','Landing depth'),'Landing too short','The landing must be at least 36" deep in the direction of travel.',T,pt,s.level);
    if(si.fw<36&&si.treads)add('error',R('R311.7.1','Stair width'),'Steps too narrow','At least 36" wide.',T,pt,s.level);
    if(si.rails&&s.rail==='none')add('error',R('R311.7.8','Handrails'),'Steps need a handrail','A handrail is required on at least one side of a flight with 4 or more risers.',T,pt,s.level);
    if(si.guard&&s.rail==='none')add('error',R('R312.1.1','Guards'),'Landing needs a guard','Open sides more than 30" above grade need a 36" guard with openings under 4".',T,pt,s.level);}},
  takeoff:(p,add,W)=>{const C='Decks, porches and steps';for(const s of p.steps||[]){if(s.status==='existing')continue;const si=stepsInfo(p,s);const mat=s.mat||'concrete';
    const vol=(si.Ld*si.W*Math.max(4,si.fall)+Array.from({length:si.treads},(_,i)=>si.T*si.fw*(si.fall-(i+1)*si.riserH)).reduce((a,b)=>a+b,0))/1728/27;
    if(mat==='concrete'||mat==='brick'||mat==='stone'){add(C,'Concrete for steps and stoop',Math.ceil(vol*W*10)/10,'CY','solid fill; use block or fill to reduce');if(mat!=='concrete')add(C,`${mat==='brick'?'Brick':'Stone'} veneer on steps`,Math.ceil((si.W*si.fall+si.Ld*si.fall*2+si.treads*si.fw*si.riserH*2)/144*W),'SF');}
    else{add(C,'2x12 treated stair stringer, 8\'',Math.ceil(3*Math.max(1,si.run/84)),'EA');add(C,`${mat==='composite'?'Composite':'5/4x6 treated'} tread boards`,Math.ceil(si.treads*2*Math.ceil(si.fw/96))+Math.ceil(si.Ld*si.W/144/2.75),'EA');}
    if((s.rail!=='none'&&si.rails)||s.rail==='both')add(C,'Handrail, both sides of steps',Math.ceil((si.run+24)*2/12),'LF');if(si.guard&&s.rail!=='none')add(C,'Guard rail at landing',Math.ceil((si.Ld*2+si.W)/12),'LF');}},
});
function addDoorSteps(p){const f=foundOf(p);let q=p;let n=0;
  for(const lv of sortedLevels(p)){if(lv.elevation+f.raise<8)continue;const ext=p.walls.filter(w=>w.level===lv.id&&w.kind==='exterior'&&w.status!=='demolish');
    for(const o of p.openings.filter(o=>o.type==='door'&&o.status!=='demolish'&&ext.some(w=>w.id===o.wall))){const w=ext.find(w=>w.id===o.wall);const c=openingCenter(p,o);const on=outwardNormal(ext,w);const out={x:c.x+on.x*(w.thick/2+18),y:c.y+on.y*(w.thick/2+18)};
      if((q.steps||[]).some(s=>s.level===lv.id&&ptsIn(out,stepsInfo(q,s).outline))||(q.decks||[]).some(d=>d.level===lv.id&&inPoly(out.x,out.y,d.pts))||(q.ramps||[]).some(r=>r.level===lv.id&&ptsIn(out,rampInfo(q,r).corners)))continue;
      const W=Math.max(48,o.width+12);const s=newSteps(lv,c.x+on.x*w.thick/2,c.y+on.y*w.thick/2,Math.atan2(on.y,on.x),{width:W,landing:Math.max(48,o.dtype==='overhead'?0:48),mat:o.dtype==='overhead'?'concrete':'concrete'});
      if(o.dtype==='overhead'){s.landing=0;s.width=o.width;}q={...q,steps:[...(q.steps||[]),s]};n++;}}
  return {p:q,n};}

/* ---- decks and porches ---- */
const DECK_SURF=[['wood','Treated wood'],['composite','Composite boards'],['cedar','Cedar'],['concrete','Concrete'],['brick','Brick pavers'],['stone','Stone or tile']];
const DECK_COLOR={wood:0xa98a62,composite:0x8a7563,cedar:0xb27b55,concrete:0xc4c0b8,brick:0xa65a44,stone:0xa39b8c};
const COLS=[['square','Square'],['round','Round'],['tapered','Tapered craftsman'],['turned','Turned'],['post','Plain 6x6 post']];
function deckOf(d){return {kind:'deck',top:-1.5,surf:'wood',joist:'2x8',spacing:16,post:'6x6',postSpacing:96,beam:'2-2x10',dir:'auto',skirt:'lattice',...d,
  rail:{style:'baluster',edges:'auto',h:36,...(d.rail||{})},roof:{on:false,style:'shed',pitch:3,overhang:12,plate:null,col:'square',colSize:8,colSpacing:120,ceiling:'beadboard',...(d.roof||{})}};}
function deckInfo(p,d0){const d=deckOf(d0);const lv=lvlOf(p,d.level)||p.levels[0];const raise=p.settings?.gradeOffset||0;const zTop=lv.elevation+d.top;const dc=polyLabelPt(d.pts);const zg=gradeAt(p,dc[0],dc[1]);const height=zTop-zg;
  const pts=d.pts.map(([x,y])=>({x,y}));const ol=buildingOutline(p,d.level);
  const onHouse=(a,b)=>{if(!ol)return false;const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};return [a,b,m].every(q=>nearPolyline(q,ol.pts,3,true));};
  // guard rule (R312.1.1): more than 30" to the ground at any point within 36" of the open edge
  const cen0=pts.reduce((s,q)=>({x:s.x+q.x/pts.length,y:s.y+q.y/pts.length}),{x:0,y:0});
  const edgeDrop=(a,b)=>{const L=dist(a,b)||1;const dir={x:(b.x-a.x)/L,y:(b.y-a.y)/L};let n={x:-dir.y,y:dir.x};const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if((m.x-cen0.x)*n.x+(m.y-cen0.y)*n.y<0)n={x:-n.x,y:-n.y};
    let g=Infinity;for(let t=0;t<=1.0001;t+=0.25)for(const o of [0,18,36]){const q={x:a.x+(b.x-a.x)*t+n.x*o,y:a.y+(b.y-a.y)*t+n.y*o};g=Math.min(g,gradeAt(p,q.x,q.y));}return zTop-g;};
  const edges=pts.map((a,i)=>{const b=pts[(i+1)%pts.length];const house=onHouse(a,b);return {a,b,i,L:dist(a,b),house,drop:house?0:edgeDrop(a,b)};});
  const railReq=edges.some(e=>!e.house&&e.drop>30);const railOn=d.rail.edges==='all'||(d.rail.edges==='auto'&&railReq);
  // steps that leave from this deck cut the rail
  const stepsHere=(p.steps||[]).filter(s=>s.level===d.level&&(s.deck===d.id||inPoly(s.x-Math.cos(s.a||0)*2,s.y-Math.sin(s.a||0)*2,d.pts)));
  const railSegs=[];if(railOn&&d.rail.edges!=='none')for(const e of edges){if(e.house||e.L<1||(d.rail.edges==='auto'&&e.drop<=30))continue;const dir={x:(e.b.x-e.a.x)/e.L,y:(e.b.y-e.a.y)/e.L};let cuts=[];
    for(const s of stepsHere){const si=stepsInfo(p,s);const c={x:s.x,y:s.y};const pr=projSeg(c,e.a,e.b);if(pr.d>3)continue;const sc=pr.t*e.L;const half=(si.Ld>0?si.W:si.fw)/2;cuts.push([sc-half,sc+half]);}
    cuts.sort((a,b)=>a[0]-b[0]);let c0=0;for(const [u0,u1] of cuts){if(u0>c0+2)railSegs.push([{x:e.a.x+dir.x*c0,y:e.a.y+dir.y*c0},{x:e.a.x+dir.x*u0,y:e.a.y+dir.y*u0}]);c0=Math.max(c0,u1);}if(c0<e.L-2)railSegs.push([{x:e.a.x+dir.x*c0,y:e.a.y+dir.y*c0},e.b]);}
  // frame: local axes from the house edge (u along the house, v away from it)
  const he=edges.filter(e=>e.house).sort((a,b)=>b.L-a.L)[0]||edges.slice().sort((a,b)=>b.L-a.L)[0];
  const ux={x:(he.b.x-he.a.x)/he.L,y:(he.b.y-he.a.y)/he.L};let vx={x:-ux.y,y:ux.x};const cen=pts.reduce((s,q)=>({x:s.x+q.x/pts.length,y:s.y+q.y/pts.length}),{x:0,y:0});
  if((cen.x-he.a.x)*vx.x+(cen.y-he.a.y)*vx.y<0)vx={x:-vx.x,y:-vx.y};
  const loc=q=>({u:(q.x-he.a.x)*ux.x+(q.y-he.a.y)*ux.y,v:(q.x-he.a.x)*vx.x+(q.y-he.a.y)*vx.y});const us=pts.map(q=>loc(q).u),vs=pts.map(q=>loc(q).v);
  const U0=Math.min(...us),U1=Math.max(...us),V0=Math.min(...vs),V1=Math.max(...vs);const W=(u,v,z)=>({x:he.a.x+ux.x*u+vx.x*v,y:he.a.y+ux.y*u+vx.y*v,z});
  return {d,lv,zTop,zg,height,pts,edges,railSegs,railReq,railOn,houseEdge:he.house?he:null,ux,vx,U0,U1,V0,V1,W,area:polyArea(d.pts)/144};
}
// porch roof: shed, gable (pediment facing out) or hip, framed on columns along the open sides
function porchRoof(p,di){const d=di.d,r=d.roof;if(!r.on)return null;const lv=di.lv;const pitch=r.pitch/12;const oh=r.overhang;const {U0,U1,V0,V1,W}=di;const attached=!!di.houseEdge;
  const span=V1-V0,wid=U1-U0;const wallTop=lv.elevation+lv.height;
  let plate=r.plate!=null?di.zTop+r.plate:(attached&&r.style==='shed'?Math.max(di.zTop+88,Math.min(di.zTop+96,wallTop-8-(span)*pitch)):di.zTop+96);plate=Math.max(di.zTop+78,plate);
  const tris=[];const T=(a,b,c)=>tris.push([[a.x,a.y,a.z],[b.x,b.y,b.z],[c.x,c.y,c.z]]);const Q=(a,b,c,e)=>{T(a,b,c);T(a,c,e);};
  const vb=attached?V0:V0-oh;const ua=U0-oh,ub=U1+oh,ve=V1+oh;let peak=plate;const fascia=[];
  // tie into the house roof: carry the porch roof back until it meets the main roof surface (or stop at the wall when it tucks under the eave)
  const mains=attached?p.roofs.filter(x=>x.level===d.level).map(x=>roofBuild(x,roofTop(p,x))):[];
  const mainZ=(u,v)=>{const q=W(u,v,0);let m=-Infinity;for(const b of mains)m=Math.max(m,roofHeightAt(b,q.x,q.y));return m;};
  const vEnd=(u,zf)=>{if(!mains.length)return vb;const z0=mainZ(u,V0+0.5);if(isFinite(z0)&&z0-zf(u,V0)>4)return V0;let prev=V0;
    for(let v=V0;v>V0-720;v-=3){const m=mainZ(u,v);if(isFinite(m)&&m-zf(u,v)>=0){let a=v,b2=prev;for(let i=0;i<14;i++){const c=(a+b2)/2;const mc=mainZ(u,c);if(isFinite(mc)&&mc-zf(u,c)>=0)a=c;else b2=c;}return a;}prev=v;}return V0;};
  if(r.style==='shed'){const zAt=v=>plate+(V1-v)*pitch;const zf=(u,v)=>zAt(v);const ea=vEnd(ua,zf),eb=vEnd(ub,zf);Q(W(ua,ea,zAt(ea)),W(ub,eb,zAt(eb)),W(ub,ve,zAt(ve)),W(ua,ve,zAt(ve)));peak=Math.max(zAt(ea),zAt(eb));fascia.push([W(ua,ve,zAt(ve)),W(ub,ve,zAt(ve))]);}
  else if(r.style==='gable'){const um=(U0+U1)/2,zr=plate+(wid/2)*pitch,ze=plate-oh*pitch;peak=zr;const zf=(u,v)=>plate+(wid/2-Math.abs(u-um))*pitch;const ea=vEnd(ua,zf),em=vEnd(um,zf),eb=vEnd(ub,zf);
    Q(W(ua,ea,ze),W(um,em,zr),W(um,ve,zr),W(ua,ve,ze));Q(W(um,em,zr),W(ub,eb,ze),W(ub,ve,ze),W(um,ve,zr));
    // pediment (vertical gable end at the front)
    T(W(U0,V1,plate),W(U1,V1,plate),W(um,V1,zr));fascia.push([W(ua,vb,ze),W(ua,ve,ze)],[W(ub,vb,ze),W(ub,ve,ze)]);}
  else{const half=wid/2,zr=plate+half*pitch,ze=plate-oh*pitch;const um=(U0+U1)/2;const vr=Math.max(vb,V1-half);peak=zr;const zf=(u,v)=>plate+(half-Math.abs(u-um))*pitch;const ea=vEnd(ua,zf),em=vEnd(um,zf),eb=vEnd(ub,zf);
    Q(W(ua,ea,ze),W(um,em,zr),W(um,vr,zr),W(ua,ve,ze));Q(W(um,em,zr),W(ub,eb,ze),W(ub,ve,ze),W(um,vr,zr));T(W(ua,ve,ze),W(um,vr,zr),W(ub,ve,ze));if(!attached){T(W(ua,vb,ze),W(um,vb,zr),W(ub,vb,ze));}
    fascia.push([W(ua,ve,ze),W(ub,ve,ze)],[W(ua,vb,ze),W(ua,ve,ze)],[W(ub,vb,ze),W(ub,ve,ze)]);}
  // columns: corners on the open sides and spaced along them
  const cs=r.colSize||8;const cols=[];const inset=cs/2+1;const addC=(u,v)=>{if(!cols.some(c=>Math.hypot(c.u-u,c.v-v)<cs))cols.push({u,v});};
  const front=V1-inset;const nF=Math.max(1,Math.ceil((wid-2*inset)/(r.colSpacing||120)));for(let i=0;i<=nF;i++)addC(U0+inset+(wid-2*inset)*i/nF,front);
  if(!attached){const nB=nF;for(let i=0;i<=nB;i++)addC(U0+inset+(wid-2*inset)*i/nB,V0+inset);}
  const nS=Math.max(1,Math.ceil((span-2*inset)/(r.colSpacing||120)));for(let i=1;i<nS;i++){addC(U0+inset,V0+inset+(span-2*inset)*i/nS);addC(U1-inset,V0+inset+(span-2*inset)*i/nS);}
  const beams=[[W(U0,V1-inset,plate),W(U1,V1-inset,plate)],[W(U0+inset,V0,plate),W(U0+inset,V1,plate)],[W(U1-inset,V0,plate),W(U1-inset,V1,plate)]];if(!attached)beams.push([W(U0,V0+inset,plate),W(U1,V0+inset,plate)]);
  const outline=[W(ua,vb,0),W(ub,vb,0),W(ub,ve,0),W(ua,ve,0)];
  return {plate,peak,tris,cols:cols.map(c=>({...W(c.u,c.v,plate),u:c.u,v:c.v})),beams,outline,fascia,ceiling:[W(U0,V0,0),W(U1,V0,0),W(U1,V1,0),W(U0,V1,0)],attached,wallTop};
}
function column3D(ctx,x,y,z0,h,shape,size,mat){const s=size||8;
  if(shape==='round'||shape==='turned'){ctx.box(x,y,z0,s+3,s+3,1.5,0,mat);ctx.cyl(x,y,z0+1.5,s/2,h-4.5,mat,20,shape==='turned'?s*0.42:s*0.46);ctx.box(x,y,z0+h-3,s+3,s+3,3,0,mat);if(shape==='turned'){for(const t of [0.18,0.82])ctx.cyl(x,y,z0+h*t,s*0.55,3,mat,16);}}
  else if(shape==='tapered'){ctx.box(x,y,z0,s+6,s+6,Math.min(32,h*0.35),0,mat);const z1=z0+Math.min(32,h*0.35);ctx.add(new THREE.CylinderGeometry(s*0.38*Math.SQRT2*IN,s*0.55*Math.SQRT2*IN,(h-z1+z0-3)*IN,4),mat,x*IN,(z1+(h-(z1-z0)-3)/2)*IN,y*IN,Math.PI/4);ctx.box(x,y,z0+h-3,s+2,s+2,3,0,mat);}
  else if(shape==='post')ctx.box(x,y,z0,5.5,5.5,h,0,mat);
  else{ctx.box(x,y,z0,s+2,s+2,2,0,mat);ctx.box(x,y,z0+2,s,s,h-5,0,mat);ctx.box(x,y,z0+h-3,s+2,s+2,3,0,mat);}}
regObj('deck',{coll:'decks',label:'Deck or porch',plural:'decks and porches',z:-2,layer:'under',hitStage:'late',
  pts:(p,d)=>{const di=deckInfo(p,d);const pr=porchRoof(p,di);return pr?[...di.pts,...pr.outline]:di.pts;},
  hit:(p,d,raw)=>inPoly(raw.x,raw.y,d.pts),
  move:(d,dx,dy)=>({...d,pts:d.pts.map(([x,y])=>[x+dx,y+dy])}),
  title:(d,p)=>{const di=deckInfo(p,d);return `${di.d.kind==='porch'?'Porch':'Deck'} · ${Math.round(di.area)} sq ft`;},
  svg:(p,lv,d,S,view,isSel)=>{const di=deckInfo(p,d);const pl=pts=>pts.map(q=>S(q.x,q.y).join(',')).join(' ');const out=[];const id='dk'+d.id;
    const ang=Math.atan2(di.ux.y,di.ux.x)*180/Math.PI+(di.d.dir==='across'?90:0);const sp=Math.max(3,5.75*view.s);const solid=['concrete','brick','stone'].includes(di.d.surf);
    out.push(html`<defs key="df"><pattern id=${id} patternUnits="userSpaceOnUse" width=${sp} height=${sp} patternTransform=${`rotate(${ang})`}><line x1="0" y1="0" x2=${sp} y2="0" className="deck-b"/></pattern></defs>`);
    out.push(html`<polygon key="p" points=${pl(di.pts)} className=${'deck'+(isSel?' deck-sel':'')} fill=${solid?undefined:`url(#${id})`}/>`);
    for(const [a,b] of di.railSegs){const A=S(a.x,a.y),B=S(b.x,b.y);out.push(html`<line key=${'r'+a.x+a.y} x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className="deck-rail"/>`);}
    const pr=porchRoof(p,di);if(pr){out.push(html`<polygon key="ro" points=${pl(pr.outline)} className="porch-roof"/>`);for(const [i,c] of pr.cols.entries()){const [x,y]=S(c.x,c.y);const r=(di.d.roof.colSize||8)/2*view.s;out.push(di.d.roof.col==='round'||di.d.roof.col==='turned'?html`<circle key=${'c'+i} cx=${x} cy=${y} r=${Math.max(2.5,r)} className="col"/>`:html`<rect key=${'c'+i} x=${x-Math.max(2.5,r)} y=${y-Math.max(2.5,r)} width=${Math.max(5,2*r)} height=${Math.max(5,2*r)} className="col"/>`);}}
    if(view.s>0.35){const [cx,cy]=polyLabelPt(d.pts);const [x,y]=S(cx,cy);out.push(html`<text key="t" x=${x} y=${y} textAnchor="middle" className="rname halo">${di.d.name||(di.d.kind==='porch'?'Porch':'Deck')}</text>`,html`<text key="t2" x=${x} y=${y+14} textAnchor="middle" className="rarea halo">${Math.round(di.area)} sq ft · ${fmtLen(di.height)} above grade</text>`);}
    return out;},
  dl:(dl,p,lv,d,PT,k,sc)=>{const di=deckInfo(p,d);const P2=q=>PT(q.x,q.y);dl.poly(di.pts.map(P2),{stroke:INK,w:0.7,fill:'#ffffff'});
    if(!['concrete','brick','stone'].includes(di.d.surf)){const {U0,U1,V0,V1,W}=di;for(let v=V0+6;v<V1;v+=12){const a=W(U0,v,0),b=W(U1,v,0);const segs=clipSegPoly(a,b,di.pts);for(const [s0,s1] of segs)dl.line(...P2(s0),...P2(s1),0.15,{color:LIGHTI});}}
    for(const [a,b] of di.railSegs){dl.line(...P2(a),...P2(b),1.1);}
    const pr=porchRoof(p,di);if(pr){dl.poly(pr.outline.map(P2),{stroke:INK,w:0.35,dash:[0.06,0.04]});for(const c of pr.cols){const q=P2(c);const h=(di.d.roof.colSize||8)/2*sc;dl.poly([[q[0]-h,q[1]-h],[q[0]+h,q[1]-h],[q[0]+h,q[1]+h],[q[0]-h,q[1]+h]],{stroke:INK,w:0.5,fill:'#ffffff'});}}
    const [cx,cy]=polyLabelPt(d.pts);const q=PT(cx,cy);dl.text(q[0],q[1],(di.d.name||(di.d.kind==='porch'?'PORCH':'DECK')).toUpperCase(),{size:6.5*k,anchor:'middle',bold:true});
    dl.text(q[0],q[1]+0.13*k,`${DECK_SURF.find(x=>x[0]===di.d.surf)[1].toUpperCase()}${di.d.kind==='deck'||!['concrete','brick','stone'].includes(di.d.surf)?`, ${di.d.joist.toUpperCase()} JOISTS @ ${di.d.spacing}" O.C.`:''}`,{size:4.8*k,anchor:'middle',color:MID});},
  faces:(p,lv,d,F)=>{const di=deckInfo(p,d);const solid=['concrete','brick','stone'].includes(di.d.surf);
    polyFaces(F,di.pts,solid?di.zg:di.zTop-9,di.zTop,'part',{fill:'#ffffff',hatch:di.d.surf==='brick'?'brick':null});
    if(!solid&&di.height>10)polyFaces(F,offsetPoly(di.pts,-2),di.zg,di.zTop-9,'part',{fill:'#ffffff',hatch:di.d.skirt==='lattice'?'lattice':null,w:0.3});
    for(const [a,b] of di.railSegs)polyFaces(F,[a,b,{x:b.x+0.01,y:b.y+0.01},{x:a.x+0.01,y:a.y+0.01}],di.zTop,di.zTop+(di.d.rail.h||36),'part',{fill:'#ffffff',hatch:'rail',w:0.4});
    const pr=porchRoof(p,di);if(pr){for(const c of pr.cols)boxFaces(F,c.x,c.y,di.zTop,di.d.roof.colSize||8,di.d.roof.colSize||8,pr.plate-di.zTop,0,'part',{fill:'#ffffff',w:0.4});
      for(const t of pr.tris)F.push({kind:'roof',pts:t,n:null});}},
  add3D:(p,lv,d,ctx)=>{const di=deckInfo(p,d);const D=di.d;const sel=ctx.isSel(d);const solid=['concrete','brick','stone'].includes(D.surf);const c=D.color?hexNum(D.color):DECK_COLOR[D.surf];
    const surfM=sel?ctx.mSel:solid?(D.surf==='brick'?texMat(ctx,'brick',0xffffff):D.surf==='stone'?texMat(ctx,'stone',0xffffff):ctx.col(c,{roughness:.85})):(()=>{const t=texOf('boards').clone();t.needsUpdate=true;t.rotation=Math.atan2(di.ux.y,di.ux.x)+(D.dir==='across'?Math.PI/2:0);return ctx.col(c,{map:t,key:'deck-'+d.id+'-'+t.rotation.toFixed(2),roughness:.8});})();
    const frameM=ctx.col(0x8f7552,{roughness:.9});const trimM=ctx.col(D.trimColor?hexNum(D.trimColor):0xf4f2ec,{roughness:.7});
    if(solid){const sm=D.foundation==='brick'||D.surf==='brick'?texMat(ctx,'brick',0xffffff):ctx.col(0xbdb9b1,{roughness:1});ctx.prism(di.pts,di.zg-4,di.zTop-1,sm);ctx.prism(di.pts,di.zTop-1,di.zTop,surfM);}
    else{const jd=LUMBER[D.joist]||7.25;ctx.prism(di.pts,di.zTop-1,di.zTop,surfM);
      // rim/fascia board and posts
      ctx.prism(di.pts,di.zTop-1-jd,di.zTop-1,trimM,[offsetPoly(di.pts,-1.5)]);
      const zb=di.zTop-1-jd;for(const e of di.edges){if(e.house)continue;const n=Math.max(1,Math.ceil(e.L/(D.postSpacing||96)));for(let i=0;i<=n;i++){const t=i/n;const q={x:e.a.x+(e.b.x-e.a.x)*t,y:e.a.y+(e.b.y-e.a.y)*t};
          const off=(()=>{const dir={x:(e.b.x-e.a.x)/e.L,y:(e.b.y-e.a.y)/e.L};let nn={x:-dir.y,y:dir.x};if(!inPoly(q.x+nn.x*4,q.y+nn.y*4,d.pts))nn={x:-nn.x,y:-nn.y};return {x:q.x+nn.x*5,y:q.y+nn.y*5};})();
          const gq=gradeAt(p,off.x,off.y);if(zb-gq>2)ctx.box(off.x,off.y,gq,5.5,5.5,zb-gq,Math.atan2(e.b.y-e.a.y,e.b.x-e.a.x),frameM);}}
      if(D.skirt!=='none'&&zb-di.zg>4){const m=D.skirt==='lattice'?texMat(ctx,'lattice',0xffffff):D.skirt==='brick'?texMat(ctx,'brick',0xffffff):trimM;const sk=offsetPoly(di.pts,-1);
        for(const e of di.edges){if(e.house)continue;const mid={x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2};const dir={x:(e.b.x-e.a.x)/e.L,y:(e.b.y-e.a.y)/e.L};let nn={x:-dir.y,y:dir.x};if(!inPoly(mid.x+nn.x*4,mid.y+nn.y*4,d.pts))nn={x:-nn.x,y:-nn.y};
          ctx.box(mid.x+nn.x*1.5,mid.y+nn.y*1.5,di.zg-1,e.L,0.75,zb-di.zg+1,Math.atan2(dir.y,dir.x),m,false);}}}
    for(const [a,b] of di.railSegs)ctx.railing([{...a,z:di.zTop},{...b,z:di.zTop}],{h:D.rail.h||36,style:D.rail.style,metal:D.rail.style==='metal',color:D.rail.color});
    const pr=porchRoof(p,di);if(pr){const R=D.roof;const cm=ctx.col(R.colColor?hexNum(R.colColor):0xf6f4ee,{roughness:.6});for(const c of pr.cols)column3D(ctx,c.x,c.y,di.zTop,pr.plate-di.zTop,R.col,R.colSize,cm);
      for(const [a,b] of pr.beams)ctx.stick({...a,z:pr.plate-5.5},{...b,z:pr.plate-5.5},11,5.5,cm);
      const rc=R.color?hexNum(R.color):(p.roofs[0]&&p.roofs[0].color?hexNum(p.roofs[0].color):ROOF_COLOR[R.cover||'asphalt']??0x4a4f57);
      const rm=M('porchroof-'+rc,()=>new THREE.MeshStandardMaterial({color:rc,roughness:.9,side:THREE.DoubleSide,flatShading:true}));ctx.tris(pr.tris.filter((t,i)=>!(R.style==='gable'&&i===pr.tris.length-1)),rm);
      if(R.style==='gable')ctx.tris([pr.tris[pr.tris.length-1]],M('gable',()=>new THREE.MeshStandardMaterial({color:0xf1ece2,roughness:.9,side:THREE.DoubleSide})));
      if(R.ceiling!=='none'){const cg=new THREE.ShapeGeometry(new THREE.Shape(pr.ceiling.map(q=>new THREE.Vector2(q.x*IN,q.y*IN))));cg.rotateX(Math.PI/2);ctx.add(cg,texMat(ctx,'beadboard',0xffffff,{side:THREE.DoubleSide}),0,(pr.plate-0.5)*IN,0,0,false);}
      for(const [a,b] of pr.fascia)ctx.stick({...a,z:a.z-3},{...b,z:b.z-3},1,7.25,ctx.col(0xf6f4ee,{roughness:.6}));}},
  panel:(d,{p,up})=>{const di=deckInfo(p,d);const D=di.d;const R=D.roof;const upR=patch=>up({rail:{...D.rail,...patch}});const upF=patch=>up({roof:{...R,...patch}});
    return html`<div className="sec"><h3>${D.kind==='porch'?'Porch':'Deck'}</h3>
      <${Field} label="Name" id="dk-n"><input id="dk-n" className="inp" value=${D.name||''} placeholder=${D.kind==='porch'?'Porch':'Deck'} onChange=${e=>up({name:e.target.value})}/><//>
      <${Field} label="Type" id="dk-k"><${Sel} id="dk-k" value=${D.kind} onChange=${v=>up({kind:v})} options=${[['deck','Deck'],['porch','Porch']]}/><//>
      <${Field} label="Surface" id="dk-s"><${Sel} id="dk-s" value=${D.surf} onChange=${v=>up({surf:v})} options=${DECK_SURF}/><//>
      <${ColorPick} id="dk-c" label="Surface color" value=${D.color} fallback=${'#'+DECK_COLOR[D.surf].toString(16).padStart(6,'0')} onChange=${v=>up({color:v})}/>
      <${Field} label="Top below the floor" id="dk-t"><${LenInput} id="dk-t" value=${-D.top} onChange=${v=>up({top:-v})}/><//>
      ${['concrete','brick','stone'].includes(D.surf)?null:html`<${Field} label="Boards run" id="dk-dir"><${Sel} id="dk-dir" value=${D.dir} onChange=${v=>up({dir:v})} options=${[['auto','Along the house'],['across','Away from the house']]}/><//>
      <div className="row2"><${Field} label="Joists" id="dk-j"><${Sel} id="dk-j" value=${D.joist} onChange=${v=>up({joist:v})} options=${Object.keys(LUMBER).filter(k=>k!=='2x4').map(k=>[k,k])}/><//><${Field} label="Spacing" id="dk-sp"><${Sel} id="dk-sp" value=${String(D.spacing)} onChange=${v=>up({spacing:+v})} options=${[['12','12" o.c.'],['16','16" o.c.'],['24','24" o.c.']]}/><//></div>
      <${Field} label="Posts every" id="dk-ps"><${LenInput} id="dk-ps" value=${D.postSpacing} onChange=${v=>v>0&&up({postSpacing:v})}/><//>
      <${Field} label="Skirting" id="dk-sk"><${Sel} id="dk-sk" value=${D.skirt} onChange=${v=>up({skirt:v})} options=${SKIRTS}/><//>`}
      <div className="stat"><span>Area</span><span className="mono">${Math.round(di.area)} sq ft</span></div>
      <div className="stat"><span>Height above the ground</span><span className="mono">${fmtLen(di.height)}</span></div></div>
    <div className="sec"><h3>Railing</h3>
      <${Field} label="Where" id="dk-re"><${Sel} id="dk-re" value=${D.rail.edges} onChange=${v=>upR({edges:v})} options=${[['auto','Only where required (over 30")'],['all','All open sides'],['none','None']]}/><//>
      <${Field} label="Style" id="dk-rs"><${Sel} id="dk-rs" value=${D.rail.style} onChange=${v=>upR({style:v})} options=${RAIL_STYLES.filter(x=>x[0]!=='pipe')}/><//>
      <${Field} label="Height" id="dk-rh"><${LenInput} id="dk-rh" value=${D.rail.h} onChange=${v=>v>0&&upR({h:v})}/><//>
      <${ColorPick} id="dk-rc" label="Rail color" value=${D.rail.color} fallback="#f4f2ec" onChange=${v=>upR({color:v})}/>
      ${di.railReq?html`<p className="note">More than 30" above the ground, so a 36" guard is required on open sides (R312.1.1). Steps placed on an edge leave a gap.</p>`:null}</div>
    <div className="sec"><h3>Roof over it</h3>
      <label className="check"><input type="checkbox" checked=${R.on} onChange=${e=>upF({on:e.target.checked})}/> Covered (porch roof on columns)</label>
      ${R.on?html`<${Field} label="Roof style" id="dk-rst"><${Sel} id="dk-rst" value=${R.style} onChange=${v=>upF({style:v})} options=${[['shed','Shed, sloping away from the house'],['gable','Gable with a front pediment'],['hip','Hip']]}/><//>
        <div className="row2"><${Field} label="Pitch (x/12)" id="dk-rp"><${NumInput} id="dk-rp" value=${R.pitch} min=${1} max=${16} onChange=${v=>upF({pitch:v})}/><//><${Field} label="Overhang" id="dk-ro"><${LenInput} id="dk-ro" value=${R.overhang} onChange=${v=>upF({overhang:v})}/><//></div>
        <${Field} label="Beam height above the porch" id="dk-rpl"><${LenInput} id="dk-rpl" value=${R.plate} placeholder=${'Auto: '+fmtLen((porchRoof(p,di)||{plate:0}).plate-di.zTop)} onChange=${v=>upF({plate:v})}/><//>
        <div className="row2"><${Field} label="Columns" id="dk-cl"><${Sel} id="dk-cl" value=${R.col} onChange=${v=>upF({col:v})} options=${COLS}/><//><${Field} label="Column size" id="dk-cs"><${LenInput} id="dk-cs" value=${R.colSize} onChange=${v=>v>0&&upF({colSize:v})}/><//></div>
        <${Field} label="Columns no more than" id="dk-csp"><${LenInput} id="dk-csp" value=${R.colSpacing} onChange=${v=>v>0&&upF({colSpacing:v})}/><//>
        <${Field} label="Ceiling" id="dk-ce"><${Sel} id="dk-ce" value=${R.ceiling} onChange=${v=>upF({ceiling:v})} options=${[['beadboard','Beadboard'],['none','Open rafters']]}/><//>
        <${ColorPick} id="dk-rcol" label="Roof color" value=${R.color} fallback="#4a4f57" onChange=${v=>upF({color:v})}/>`:null}</div>`;},
  checks:(p,add)=>{for(const d of p.decks||[]){const di=deckInfo(p,d);const T={kind:'deck',id:d.id};const [cx,cy]=polyLabelPt(d.pts);const pt={x:cx,y:cy};const R=(c,t)=>({set:'IRC',code:c,title:t});
    if(di.railReq&&di.d.rail.edges==='none')add('error',R('R312.1.1','Guards'),`${di.d.kind==='porch'?'Porch':'Deck'} needs a guard rail`,`It is ${fmtLen(di.height)} above the ground; open sides more than 30" up need a 36" guard.`,T,pt,d.level);
    if(di.d.rail.h<36&&(di.railOn||di.d.rail.edges==='all'))add('error',R('R312.1.2','Guard height'),'Guard rail too low','Guards must be at least 36" high.',T,pt,d.level);
    if(!['concrete','brick','stone'].includes(di.d.surf)){const span=Math.min(di.V1-di.V0,di.U1-di.U0);const max=DECK_SPAN[di.d.joist]?.[di.d.spacing];if(max&&span>max*1.0+1)add('warn',R('R507.6','Deck joist span'),'Deck joists may be over-spanned',`About ${fmtLen(span)} span for ${di.d.joist} at ${di.d.spacing}" o.c.; Table R507.6 allows about ${fmtLen(max)} (Southern pine). Add a beam or use deeper joists.`,T,pt,d.level);
}
    if(di.d.roof.on){const pr=porchRoof(p,di);if(pr&&pr.plate-di.zTop<80)add('warn',null,'Porch beam is low',`The porch beam is ${fmtLen(pr.plate-di.zTop)} above the porch floor. Lower the pitch or make the roof shallower to keep at least 6'-8" of headroom.`,T,pt,d.level);}}},
  takeoff:(p,add,W)=>{const C='Decks, porches and steps';for(const d of p.decks||[]){if(d.status==='existing')continue;const di=deckInfo(p,d);const D=di.d;const A=di.area;const per=polyPerimPts(di.pts)/12;const open=di.edges.filter(e=>!e.house).reduce((s,e)=>s+e.L,0)/12;
    if(['concrete','brick','stone'].includes(D.surf)){add(C,`Concrete for ${D.kind} slab and fill`,Math.ceil(A*Math.max(4,di.height)/12/27*W*10)/10,'CY','solid; reduce with fill or a block foundation');if(D.surf!=='concrete')add(C,`${D.surf==='brick'?'Brick pavers':'Stone or tile'} on ${D.kind}`,Math.ceil(A*W),'SF');add(C,`Brick or block around the ${D.kind}`,Math.ceil(open*Math.max(1,di.height/12)*W),'SF');}
    else{const sp=D.spacing||16;const span=di.V1-di.V0,len=di.U1-di.U0;add(C,`${D.joist} treated joists, ${stockLen(span)}'`,Math.ceil(len/sp+1),'EA',`${sp}" o.c.`);add(C,`${D.joist} treated rim and ledger, 16'`,Math.ceil(per/16*W),'EA');
      add(C,`${D.surf==='composite'?'Composite':D.surf==='cedar'?'Cedar 5/4x6':'5/4x6 treated'} decking`,Math.ceil(A/(5.75/12*16)*W),'EA','16\' boards');add(C,'6x6 treated posts, 10\'',Math.ceil(open*12/(D.postSpacing||96))+2,'EA');add(C,'Concrete for post footings',Math.ceil((Math.ceil(open*12/(D.postSpacing||96))+2)*(2*2*1)/27*10)/10,'CY','24" x 24" x 12"');
      add(C,'Joist hangers',Math.ceil(len/sp+1)*2,'EA');if(D.skirt==='lattice')add(C,'Lattice skirting 4\' x 8\'',Math.ceil(open/8),'EA');}
    const rl=di.railSegs.reduce((s,[a,b])=>s+dist(a,b),0)/12;if(rl>0){add(C,`Guard rail, ${RAIL_STYLES.find(x=>x[0]===D.rail.style)[1].toLowerCase()}`,Math.ceil(rl*W),'LF');if(['baluster','metal'].includes(D.rail.style))add(C,'Balusters',Math.ceil(rl*12/5.5),'EA','under 4" clear');}
    const pr=porchRoof(p,di);if(pr){const R=D.roof;add(C,`Porch columns, ${COLS.find(x=>x[0]===R.col)[1].toLowerCase()} ${R.colSize}"`,pr.cols.length,'EA');add(C,'Porch beam, (2) 2x10',Math.ceil(pr.beams.reduce((s,[a,b])=>s+dist(a,b),0)/12*W),'LF');
      let ra=0;for(const t of pr.tris){const [a,b,c]=t;const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];const cr=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];ra+=Math.hypot(...cr)/2;}
      if(R.style==='gable')ra-=0;add('Roofing',`Porch roof covering`,Math.ceil(ra/144/100*W*10)/10,'SQ','100 sq ft per square');add(C,'Porch rafters 2x6, 12\'',Math.ceil((di.U1-di.U0)/16+1)*(R.style==='shed'?1:2),'EA');if(R.ceiling==='beadboard')add(C,'Beadboard porch ceiling',Math.ceil(A*W),'SF');}}},
});
// IRC Table R507.6 maximum deck joist spans, Southern pine, 40 psf live + 10 dead (approx.)
const DECK_SPAN={'2x6':{12:117,16:107,24:89},'2x8':{12:158,16:143,24:117},'2x10':{12:200,16:181,24:149},'2x12':{12:216,16:216,24:181}};
function clipSegPoly(a,b,pts){const ts=[0,1];const P=pts;for(let i=0;i<P.length;i++){const c=P[i],d=P[(i+1)%P.length];const r={x:b.x-a.x,y:b.y-a.y},s={x:d.x-c.x,y:d.y-c.y};const den=r.x*s.y-r.y*s.x;if(Math.abs(den)<1e-9)continue;
  const t=((c.x-a.x)*s.y-(c.y-a.y)*s.x)/den,u=((c.x-a.x)*r.y-(c.y-a.y)*r.x)/den;if(t>0&&t<1&&u>=0&&u<=1)ts.push(t);}ts.sort((x,y)=>x-y);const out=[];
  for(let i=0;i+1<ts.length;i++){const m=(ts[i]+ts[i+1])/2;const q={x:a.x+(b.x-a.x)*m,y:a.y+(b.y-a.y)*m};if(inPoly(q.x,q.y,pts.map(v=>[v.x,v.y])))out.push([{x:a.x+(b.x-a.x)*ts[i],y:a.y+(b.y-a.y)*ts[i]},{x:a.x+(b.x-a.x)*ts[i+1],y:a.y+(b.y-a.y)*ts[i+1]}]);}return out;}

/* ---- free-standing columns and posts ---- */
regObj('column',{coll:'columns',label:'Column or post',plural:'columns and posts',z:4,layer:'over',
  pts:(p,c)=>rectCorners(c.x,c.y,c.size||8,c.size||8,0),hit:(p,c,raw,tol)=>Math.abs(raw.x-c.x)<=(c.size||8)/2+tol*0.5&&Math.abs(raw.y-c.y)<=(c.size||8)/2+tol*0.5,
  move:(c,dx,dy)=>({...c,x:c.x+dx,y:c.y+dy}),title:c=>`${(COLS.find(x=>x[0]===c.shape)||['','Column'])[1]} column`,
  svg:(p,lv,c,S,view,isSel)=>{const [x,y]=S(c.x,c.y);const r=Math.max(3,(c.size||8)/2*view.s);return c.shape==='round'||c.shape==='turned'?html`<circle cx=${x} cy=${y} r=${r} className=${'col'+(isSel?' col-sel':'')}/>`:html`<g><rect x=${x-r} y=${y-r} width=${2*r} height=${2*r} className=${'col'+(isSel?' col-sel':'')}/><line x1=${x-r} y1=${y-r} x2=${x+r} y2=${y+r} className="col-x"/><line x1=${x+r} y1=${y-r} x2=${x-r} y2=${y+r} className="col-x"/></g>`;},
  dl:(dl,p,lv,c,PT,k,sc)=>{const q=PT(c.x,c.y);const h=(c.size||8)/2*sc;if(c.shape==='round'||c.shape==='turned')dl.circle(q[0],q[1],h,{stroke:INK,w:0.6,fill:'#ffffff'});else{dl.poly([[q[0]-h,q[1]-h],[q[0]+h,q[1]-h],[q[0]+h,q[1]+h],[q[0]-h,q[1]+h]],{stroke:INK,w:0.6,fill:'#ffffff'});dl.line(q[0]-h,q[1]-h,q[0]+h,q[1]+h,0.3);dl.line(q[0]+h,q[1]-h,q[0]-h,q[1]+h,0.3);}},
  faces:(p,lv,c,F)=>boxFaces(F,c.x,c.y,lv.elevation+(c.base||0),c.size||8,c.size||8,c.height??lv.height,0,'part',{fill:'#ffffff'}),
  add3D:(p,lv,c,ctx)=>column3D(ctx,c.x,c.y,lv.elevation+(c.base||0),c.height??lv.height,c.shape||'square',c.size||8,ctx.matFor(c,c.color?hexNum(c.color):0xf6f4ee,{roughness:.6})),
  panel:(c,{p,up,lv})=>html`<div className="sec"><h3>Column</h3>
    <${Field} label="Style" id="cl-s"><${Sel} id="cl-s" value=${c.shape||'square'} onChange=${v=>up({shape:v})} options=${COLS}/><//>
    <${Field} label="Size" id="cl-z"><${LenInput} id="cl-z" value=${c.size||8} onChange=${v=>v>0&&up({size:v})}/><//>
    <${Field} label="Height" id="cl-h"><${LenInput} id="cl-h" value=${c.height} placeholder=${'Wall height: '+fmtLen(lv.height)} onChange=${v=>up({height:v})}/><//>
    <${Field} label="Bottom above the floor" id="cl-b"><${LenInput} id="cl-b" value=${c.base||0} onChange=${v=>up({base:v})}/><//>
    <${ColorPick} id="cl-c" label="Color" value=${c.color} fallback="#f6f4ee" onChange=${v=>up({color:v})}/>
    <p className="note">Use a negative bottom (for example -24") for posts that go down to the ground under a raised floor.</p></div>`,
  takeoff:(p,add,W)=>{for(const c of p.columns||[]){if(c.status==='existing')continue;add('Decks, porches and steps',`${(COLS.find(x=>x[0]===c.shape)||['','Column'])[1]} column ${c.size||8}"`,1,'EA');}},
});

/* ---- railings drawn anywhere ---- */
regObj('rail',{coll:'rails',label:'Railing',plural:'railings',z:5,layer:'over',
  pts:(p,r)=>r.pts.map(([x,y])=>({x,y})),hit:(p,r,raw,tol)=>nearPolyline(raw,r.pts.map(([x,y])=>({x,y})),tol*1.2,false),
  move:(r,dx,dy)=>({...r,pts:r.pts.map(([x,y])=>[x+dx,y+dy])}),title:r=>`Railing · ${fmtLen(r.pts.reduce((s,q,i)=>i?s+Math.hypot(q[0]-r.pts[i-1][0],q[1]-r.pts[i-1][1]):0,0))}`,
  svg:(p,lv,r,S,view,isSel)=>html`<polyline points=${r.pts.map(([x,y])=>S(x,y).join(',')).join(' ')} className=${'rail'+(isSel?' rail-sel':'')}/>`,
  dl:(dl,p,lv,r,PT)=>dl.poly(r.pts.map(([x,y])=>PT(x,y)),{stroke:INK,w:1.1,close:false}),
  faces:(p,lv,r,F)=>{for(let i=0;i+1<r.pts.length;i++){const a={x:r.pts[i][0],y:r.pts[i][1]},b={x:r.pts[i+1][0],y:r.pts[i+1][1]};polyFaces(F,[a,b,{x:b.x+0.01,y:b.y+0.01},{x:a.x+0.01,y:a.y+0.01}],lv.elevation+(r.base||0),lv.elevation+(r.base||0)+(r.h||36),'part',{fill:'#ffffff',hatch:'rail',w:0.4});}},
  add3D:(p,lv,r,ctx)=>ctx.railing(r.pts.map(([x,y])=>({x,y,z:lv.elevation+(r.base||0)})),{h:r.h||36,style:r.style||'baluster',metal:r.style==='metal',color:r.color,mat:ctx.isSel(r)?ctx.mSel:null}),
  panel:(r,{up})=>html`<div className="sec"><h3>Railing</h3>
    <${Field} label="Style" id="rl-s"><${Sel} id="rl-s" value=${r.style||'baluster'} onChange=${v=>up({style:v})} options=${RAIL_STYLES}/><//>
    <${Field} label="Height" id="rl-h"><${LenInput} id="rl-h" value=${r.h||36} onChange=${v=>v>0&&up({h:v})}/><//>
    <${Field} label="Bottom above the floor" id="rl-b"><${LenInput} id="rl-b" value=${r.base||0} onChange=${v=>up({base:v})}/><//>
    <${ColorPick} id="rl-c" label="Color" value=${r.color} fallback="#f4f2ec" onChange=${v=>up({color:v})}/>
    <p className="note">Guards: 36" high in homes (R312.1.2), 42" in commercial buildings (IBC 1015.3), openings under 4".</p></div>`,
  takeoff:(p,add,W)=>{for(const r of p.rails||[]){if(r.status==='existing')continue;let L=0;for(let i=1;i<r.pts.length;i++)L+=Math.hypot(r.pts[i][0]-r.pts[i-1][0],r.pts[i][1]-r.pts[i-1][1]);add('Decks, porches and steps',`Railing, ${(RAIL_STYLES.find(x=>x[0]===(r.style||'baluster'))||['','rail'])[1].toLowerCase()}`,Math.ceil(L/12*W),'LF');}},
});

/* ---- tools ---- */
I.deck=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 10h18v4H3z"/><path d="M5 14v6M19 14v6M12 14v6M3 6h18"/><path d="M3 6v4M21 6v4"/></svg>`;
I.porch=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2 9l10-5 10 5"/><path d="M5 9v10M19 9v10M12 9v10"/><path d="M3 19h18"/></svg>`;
I.steps=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 20h6v-4h4v-4h4V8h4"/><path d="M3 20V8h18"/></svg>`;
I.column=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 3h10M7 21h10M9 3v18M15 3v18"/></svg>`;
I.rail=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7h18M3 18h18M5 7v11M19 7v11M9 7v11M12 7v11M15 7v11"/></svg>`;
I.found=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h16v8H4z"/><path d="M2 12h20v4H2zM4 16v4h4v-4M16 16v4h4v-4"/></svg>`;
const deckGhost=(kind)=>(ctx,pts,cur,S)=>{if(pts.length<2)return null;const a=pts[0],b=pts[pts.length-1];const R=[[a.x,a.y],[b.x,a.y],[b.x,b.y],[a.x,b.y]].map(([x,y])=>S(x,y).join(',')).join(' ');
  const [tx,ty]=S((a.x+b.x)/2,Math.min(a.y,b.y));return html`<polygon points=${R} className="draft-fill"/><text x=${tx} y=${ty-8} textAnchor="middle" className="draft-t halo">${kind} ${fmtLen(Math.abs(b.x-a.x))} × ${fmtLen(Math.abs(b.y-a.y))}</text>`;};
function newDeck(lv,pts,kind){const porch=kind==='porch';return {id:uid('dk'),level:lv.id,kind,pts,top:porch?-0.75:-1.5,surf:porch?'concrete':'wood',joist:'2x8',spacing:16,postSpacing:96,skirt:porch?'none':'lattice',
  rail:{style:porch?'baluster':'baluster',edges:'auto',h:36},roof:{on:porch,style:'shed',pitch:3,overhang:12,plate:null,col:'square',colSize:8,colSpacing:120,ceiling:'beadboard'},status:'new'};}
// a rectangle drawn near the house snaps its near edge to the wall face
function snapRectToHouse(ctx,a,b){const ol=buildingOutline(ctx.p,ctx.lv.id);let x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),y0=Math.min(a.y,b.y),y1=Math.max(a.y,b.y);if(!ol)return [x0,y0,x1,y1];
  const tol=14;for(let i=0;i<ol.pts.length;i++){const p0=ol.pts[i],p1=ol.pts[(i+1)%ol.pts.length];if(Math.abs(p0.y-p1.y)<0.5){const y=p0.y;if(Math.abs(y0-y)<tol)y0=y;if(Math.abs(y1-y)<tol)y1=y;}if(Math.abs(p0.x-p1.x)<0.5){const x=p0.x;if(Math.abs(x0-x)<tol)x0=x;if(Math.abs(x1-x)<tol)x1=x;}}
  return [x0,y0,x1,y1];}
for(const kind of ['deck','porch'])regTool(kind,{label:kind==='deck'?'Deck':'Porch',key:kind==='deck'?'K':'P',group:'exterior',icon:I[kind],mode:'rect',
  ghost:deckGhost(kind==='deck'?'Deck':'Porch'),
  hint:n=>html`<b>${kind==='deck'?'Deck':'Porch'}:</b> drag a rectangle (or click two corners) against the house. The edge touching the house becomes the ledger; the open sides get posts${kind==='porch'?', columns and a roof':' and a guard rail when it is more than 30" up'}. Use <b>${kind==='deck'?'Deck outline':'Porch outline'}</b> for other shapes.`,
  place:(ctx,[a,b])=>{if(Math.abs(a.x-b.x)<24||Math.abs(a.y-b.y)<24)return null;const [x0,y0,x1,y1]=snapRectToHouse(ctx,a,b);const d=newDeck(ctx.lv,[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],kind);return {p:{...ctx.p,decks:[...(ctx.p.decks||[]),d]},sel:{kind:'deck',id:d.id},tool:'select'};}});
regTool('deckpoly',{label:'Deck or porch outline',group:'exterior',icon:I.deck,mode:'chain',min:3,closable:true,
  hint:n=>n>=3?html`Click the first corner or press Enter to finish the outline.`:html`<b>Deck outline:</b> click each corner of an L-shaped, angled or wraparound deck or porch.`,
  place:(ctx,pts)=>{if(pts.length<3)return null;const d=newDeck(ctx.lv,pts.map(q=>[q.x,q.y]),'deck');return {p:{...ctx.p,decks:[...(ctx.p.decks||[]),d]},sel:{kind:'deck',id:d.id},tool:'select'};}});
regTool('steps',{label:'Steps or stoop',short:'Steps',key:'J',group:'exterior',icon:I.steps,mode:'click',snap:'free',
  hint:()=>html`<b>Steps:</b> click on an outside wall (at a door) or on the edge of a deck or porch. The landing and steps are sized to the code from the floor height; change them in the panel.`,
  place:(ctx,[pt],{raw})=>{const p=ctx.p,lv=ctx.lv;raw=raw||pt;
    // on a deck edge?
    for(const d of (p.decks||[]).filter(d=>d.level===lv.id)){const di=deckInfo(p,d);for(const e of di.edges){if(e.house)continue;const pr=projSeg(raw,e.a,e.b);if(pr.d<18){const dir={x:(e.b.x-e.a.x)/e.L,y:(e.b.y-e.a.y)/e.L};let n={x:-dir.y,y:dir.x};if(inPoly(pr.x+n.x*4,pr.y+n.y*4,d.pts))n={x:-n.x,y:-n.y};
      const s=newSteps(lv,pr.x,pr.y,Math.atan2(n.y,n.x),{deck:d.id,landing:0,width:48,fw:48,top:di.d.top,mat:['concrete','brick','stone'].includes(di.d.surf)?di.d.surf:di.d.surf==='composite'?'composite':'wood',railStyle:di.d.rail.style});return {p:{...p,steps:[...(p.steps||[]),s]},sel:{kind:'steps',id:s.id},tool:'select'};}}}
    const nw=ctx.nearestWall(raw);if(!nw||nw.w.kind!=='exterior')return null;const ext=p.walls.filter(w=>w.level===lv.id&&w.kind==='exterior');const on=outwardNormal(ext,nw.w);
    let c={x:nw.pr.x,y:nw.pr.y};let W=48;const door=p.openings.filter(o=>o.wall===nw.w.id&&o.type==='door').map(o=>({o,c:openingCenter(p,o)})).sort((a,b)=>dist(a.c,c)-dist(b.c,c))[0];
    if(door&&dist(door.c,c)<door.o.width/2+24){c=door.c;W=Math.max(48,door.o.width+12);}
    const s=newSteps(lv,c.x+on.x*nw.w.thick/2,c.y+on.y*nw.w.thick/2,Math.atan2(on.y,on.x),{width:W});return {p:{...p,steps:[...(p.steps||[]),s]},sel:{kind:'steps',id:s.id},tool:'select'};}});
regTool('column',{label:'Column or post',short:'Column',key:'C',group:'walls',icon:I.column,mode:'click',
  hint:()=>html`<b>Column:</b> click to place a column or post. Set style, size and height in the panel.`,
  place:(ctx,[pt])=>{const c={id:uid('cl'),level:ctx.lv.id,x:pt.x,y:pt.y,shape:'square',size:8,height:null,base:0,status:'new'};return {p:{...ctx.p,columns:[...(ctx.p.columns||[]),c]},sel:{kind:'column',id:c.id}};}});
regTool('rail',{label:'Railing',key:'H',group:'stairs',icon:I.rail,mode:'chain',min:2,
  hint:n=>n?html`Click the next point; press Enter or Esc to finish the railing.`:html`<b>Railing:</b> click points along the edge (balcony, stair opening, retaining wall). Press Enter to finish.`,
  place:(ctx,pts)=>{if(pts.length<2)return null;const r={id:uid('rl'),level:ctx.lv.id,pts:pts.map(q=>[q.x,q.y]),h:36,base:0,style:'baluster',status:'new'};return {p:{...ctx.p,rails:[...(ctx.p.rails||[]),r]},sel:{kind:'rail',id:r.id}};}});
addToolToGroup('exterior','deck');addToolToGroup('exterior','porch');addToolToGroup('exterior','deckpoly');addToolToGroup('exterior','steps');addToolToGroup('walls','column');addToolToGroup('stairs','rail');

/* ---- project panel: foundation and outside of the house ---- */
function FoundationPanel({p,commit}){const f=foundOf(p);const [msg,setMsg]=useState(null);const first=groundLevel(p);
  const upS=patch=>commit({...p,settings:{...p.settings,foundation:{...(p.settings.foundation||{}),...patch}}});
  const setType=v=>commit({...p,levels:p.levels.map(l=>l.id===first.id?{...l,framing:{...framingOf(l),foundation:v}}:l)});
  const raised=['crawl','piers'].includes(f.type);
  return html`<div className="sec"><h3>Foundation</h3>
    <${Field} label="Type" id="fd-t"><${Sel} id="fd-t" value=${f.type} onChange=${setType} options=${FOUND_TYPES}/><//>
    <${Field} label=${slopeOf(p).fall?'Floor above the ground (high side)':'Finished floor above the ground'} id="p-grade"><${LenInput} id="p-grade" value=${p.settings.gradeOffset||0} onChange=${v=>commit({...p,settings:{...p.settings,gradeOffset:v}})}/><//>
    <${Field} label="Ground falls across the house" id="p-fall"><${LenInput} id="p-fall" value=${slopeOf(p).fall||null} placeholder="Level lot" onChange=${v=>commit({...p,settings:{...p.settings,slope:{...slopeOf(p),fall:Math.max(0,v||0)}}})}/><//>
    ${slopeOf(p).fall?html`<${Field} label="Downhill toward" id="p-sdir"><${Sel} id="p-sdir" value=${String(slopeOf(p).dir)} onChange=${v=>commit({...p,settings:{...p.settings,slope:{...slopeOf(p),dir:+v}}})} options=${SLOPE_DIRS.map(([d,l])=>[String(d),l])}/><//>
      <p className="note">Floor is ${fmtLen(p.settings.gradeOffset||0)} above the ground on the high side and ${fmtLen((p.settings.gradeOffset||0)+slopeOf(p).fall)} on the low side (${(slopeOf(p).fall/Math.max(1,gradeFrame(p).s1-gradeFrame(p).s0)*100).toFixed(1)}% slope). The foundation, piers, steps, decks and ground follow the slope.</p>`:null}
    ${f.type!=='slab'&&f.type!=='piers'?html`<${Field} label="Exposed foundation finish" id="fd-f"><${Sel} id="fd-f" value=${f.finish} onChange=${v=>upS({finish:v})} options=${FOUND_FINISH}/><//>`:null}
    ${f.type==='piers'?html`<${Field} label="Skirting between piers" id="fd-sk"><${Sel} id="fd-sk" value=${f.skirt} onChange=${v=>upS({skirt:v})} options=${SKIRTS}/><//>
      <div className="row2"><${Field} label="Pier size" id="fd-ps"><${LenInput} id="fd-ps" value=${f.pier} onChange=${v=>v>0&&upS({pier:v})}/><//><${Field} label="Piers every" id="fd-pp"><${LenInput} id="fd-pp" value=${f.pierSpacing} onChange=${v=>v>0&&upS({pierSpacing:v})}/><//></div>`:null}
    ${f.type!=='slab'?html`<${ColorPick} id="fd-c" label="Foundation color" value=${f.color} fallback=${'#'+(FOUND_COLOR[f.finish]||0xb0aca4).toString(16).padStart(6,'0')} onChange=${v=>upS({color:v})}/>`:null}
    ${f.type==='crawl'?html`<label className="check"><input type="checkbox" checked=${f.vents} onChange=${e=>upS({vents:e.target.checked})}/> Foundation vents (R408.1)</label><label className="check"><input type="checkbox" checked=${f.access} onChange=${e=>upS({access:e.target.checked})}/> Crawlspace access door (R408.4)</label>`:null}
    <details className="framing"><summary>Footings</summary><div className="grid2">
      <label>Width<${LenInput} id="fd-fw" value=${f.footW} onChange=${v=>v>0&&upS({footW:v})}/></label><label>Thickness<${LenInput} id="fd-fd" value=${f.footD} onChange=${v=>v>0&&upS({footD:v})}/></label>
      <label>Bottom below grade<${LenInput} id="fd-fr" value=${f.frost} onChange=${v=>v>=0&&upS({frost:v})}/></label></div></details>
    ${raised?html`<div className="stat"><span>Ground to bottom of floor framing</span><span className="mono">${fmtLen(Math.max(0,f.raise-f.floorD))}</span></div>`:null}
    <div className="row"><button className="btn" onClick=${()=>{const r=addDoorSteps(p);if(r.n){commit(r.p);setMsg(`Added ${r.n} landing${r.n>1?'s':''} with steps. Click one to change it.`);}else setMsg('Every outside door already has steps, a deck, a porch or a ramp (or the floor is at grade).');}}>Add steps at every outside door</button></div>
    ${msg?html`<p className="note">${msg}</p>`:null}
    <p className="note">Draw decks, porches, steps, ramps and columns from the Exterior tools on the left.</p></div>`;}

/* ---- outside casing and shutters on doors and windows ---- */
const SHUTTERS=[['none','None'],['louvered','Louvered'],['panel','Raised panel'],['board','Board and batten'],['bahama','Bahama (top hinged)']];
function addOpeningOutside3D(w,o,extW,g,add,std){const on=outwardNormal(extW,w);const n0={x:-g.d.y,y:g.d.x};const sg=(on.x*n0.x+on.y*n0.y)>0?1:-1;const nx=n0.x*sg,ny=n0.y*sg;
  const ct=o.extTrim??(w.siding==='brick'?0:3.5);const tc=o.trimColor?hexNum(o.trimColor):0xf6f4ee;const tm=std('xtrim-'+tc,tc,{roughness:.6});const off=g.t/2+0.4;
  const B=(along,up,wd,ht,dp,out,mat)=>add(new THREE.BoxGeometry(wd*IN,ht*IN,dp*IN),mat,(g.px+g.d.x*along+nx*(off+out))*IN,(g.z0+up)*IN,(g.py+g.d.y*along+ny*(off+out))*IN,g.ry,false);
  if(ct>0){B(0,g.h+ct/2,g.ow+ct*2,ct,0.75,0.375,tm);for(const s of [-1,1])B(s*(g.ow/2+ct/2),g.h/2-(o.type==='window'?1.5:0),ct,g.h+(o.type==='window'?3:0),0.75,0.375,tm);
    if(o.type==='window'){B(0,-1,g.ow+ct*2+1,1.25,1.75,0.9,tm);B(0,-ct/2-1.5,g.ow+ct*2,ct*0.8,0.75,0.375,tm);}}
  const sh=o.type==='window'?o.shutters||'none':'none';if(sh==='none')return;
  const sc=o.shutterColor?hexNum(o.shutterColor):0x2f3b33;const kind=sh==='louvered'?'louver':sh==='board'?'bb':sh==='panel'?'rpanel':'louver';
  const sm=std('shut-'+kind+'-'+sc,sc,{roughness:.7,map:shutterTex(kind)});
  if(sh==='bahama'){const m=B(0,g.h*0.58,g.ow+ct*2+4,g.h*0.85,1.25,5,sm);m.rotateX(-0.35);return;}
  const sw=Math.max(10,g.ow/2);for(const s of [-1,1])B(s*(g.ow/2+ct+sw/2+0.5),g.h/2,sw,g.h,1.25,1,sm);}
function shutterTex(kind){const key='sh-'+kind;if(_tex[key])return _tex[key];const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,64,256);
  g.fillStyle='rgba(0,0,0,0.3)';if(kind==='louver'){g.fillRect(0,0,64,10);g.fillRect(0,246,64,10);g.fillRect(0,124,64,8);g.fillRect(0,0,6,256);g.fillRect(58,0,6,256);for(let y=14;y<240;y+=7)g.fillRect(6,y,52,2);}
  else if(kind==='bb'){for(const x of [20,42])g.fillRect(x,0,2,256);g.fillRect(0,30,64,8);g.fillRect(0,218,64,8);}
  else{g.strokeStyle='rgba(0,0,0,0.35)';g.lineWidth=3;g.strokeRect(9,12,46,104);g.strokeRect(9,140,46,104);}
  const t=new THREE.CanvasTexture(c);if(THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;return (_tex[key]=t);}

/* ---- curved wall: three clicks (start, end, a point on the curve) make a run of short straight walls ---- */
function arcThrough(a,b,c){const d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));if(Math.abs(d)<1e-6)return null;
  const ux=((a.x*a.x+a.y*a.y)*(b.y-c.y)+(b.x*b.x+b.y*b.y)*(c.y-a.y)+(c.x*c.x+c.y*c.y)*(a.y-b.y))/d,uy=((a.x*a.x+a.y*a.y)*(c.x-b.x)+(b.x*b.x+b.y*b.y)*(a.x-c.x)+(c.x*c.x+c.y*c.y)*(b.x-a.x))/d;
  const R=Math.hypot(a.x-ux,a.y-uy);const A0=Math.atan2(a.y-uy,a.x-ux),A1=Math.atan2(b.y-uy,b.x-ux),Ac=Math.atan2(c.y-uy,c.x-ux);
  const norm=t=>((t%(2*Math.PI))+2*Math.PI)%(2*Math.PI);let sweep=norm(A1-A0);if(norm(Ac-A0)>sweep)sweep=sweep-2*Math.PI; // pass through c
  return {cx:ux,cy:uy,R,A0,sweep};}
function arcPoints(arc,maxSeg=24){const n=Math.max(2,Math.ceil(Math.abs(arc.sweep)*arc.R/maxSeg),Math.ceil(Math.abs(arc.sweep)/(Math.PI/18)));const out=[];
  for(let i=0;i<=n;i++){const t=arc.A0+arc.sweep*i/n;out.push({x:arc.cx+arc.R*Math.cos(t),y:arc.cy+arc.R*Math.sin(t)});}return out;}
I.curvewall=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M3 20C3 10 10 4 21 4"/></svg>`;
regTool('curvewall',{label:'Curved wall',short:'Curve',group:'walls',icon:I.curvewall,mode:'chain',max:3,min:3,ortho:false,
  hint:n=>n===0?html`<b>Curved wall:</b> click where the curve starts.`:n===1?html`Click where the curve ends.`:html`Click a point the curve passes through (its bulge). It is built from short straight walls, so doors and windows still fit.`,
  ghost:(ctx,pts,cur,S)=>{if(pts.length<3){return pts.length>1?html`<polyline points=${pts.map(q=>S(q.x,q.y).join(',')).join(' ')} className="draft"/>`:null;}const arc=arcThrough(pts[0],pts[1],pts[2]);if(!arc)return null;return html`<polyline points=${arcPoints(arc).map(q=>S(q.x,q.y).join(',')).join(' ')} className="draft" strokeWidth="4"/>`;},
  place:(ctx,pts)=>{if(pts.length<3)return null;const arc=arcThrough(pts[0],pts[1],pts[2]);if(!arc||arc.R>1e5)return null;const pre=WALL_PRESETS[ctx.wallPreset]||WALL_PRESETS.ext4;const ap=arcPoints(arc);
    const ws=[];for(let i=0;i+1<ap.length;i++)ws.push({id:uid('w'),level:ctx.lv.id,x1:ap[i].x,y1:ap[i].y,x2:ap[i+1].x,y2:ap[i+1].y,thick:pre.thick,kind:pre.kind,bearing:pre.bearing,height:pre.height??null,status:'new',assembly:ctx.wallPreset,curve:true});
    return {p:{...ctx.p,walls:[...ctx.p.walls,...ws]},sel:{kind:'multi',items:ws.map(w=>({kind:'wall',id:w.id}))}};}});
addToolToGroup('walls','curvewall','wall');
