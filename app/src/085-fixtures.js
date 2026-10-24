/* ======================= fixtures and cabinets ======================= */
// Each fixture is a box: center x,y; width w (side to side), depth d (back to front), height h, bottom elev.
// rot turns it on plan; the back is local -y, the front faces local +y.
const FIXTURES={
  toilet:{label:'Toilet',cat:'Bath',w:20,d:28,h:30,color:0xf4f4f2},
  lav:{label:'Lavatory sink',cat:'Bath',w:24,d:20,h:34,color:0xf4f4f2},
  vanity:{label:'Vanity cabinet',cat:'Bath',w:30,d:21,h:34,color:0xd8c3a1},
  tub:{label:'Bathtub 60"',cat:'Bath',w:60,d:30,h:20,color:0xf4f4f2},
  shower:{label:'Shower 36"',cat:'Bath',w:36,d:36,h:4,color:0xe8eef2},
  rollin:{label:'Roll-in shower 60" x 30"',cat:'Bath',w:60,d:30,h:1,color:0xe8eef2},
  base:{label:'Base cabinet',cat:'Kitchen',w:36,d:24,h:36,color:0xd8c3a1},
  sinkbase:{label:'Sink base cabinet',cat:'Kitchen',w:36,d:24,h:36,color:0xd8c3a1},
  wallcab:{label:'Wall cabinet',cat:'Kitchen',w:36,d:12,h:30,elev:54,color:0xd8c3a1},
  tall:{label:'Tall pantry cabinet',cat:'Kitchen',w:24,d:24,h:84,color:0xd8c3a1},
  range:{label:'Range',cat:'Kitchen',w:30,d:26,h:36,color:0x2f3236},
  fridge:{label:'Refrigerator',cat:'Kitchen',w:36,d:30,h:70,color:0xc9ccd0},
  dw:{label:'Dishwasher',cat:'Kitchen',w:24,d:24,h:34.5,color:0xc9ccd0},
  island:{label:'Island',cat:'Kitchen',w:72,d:36,h:36,color:0xd8c3a1},
  washer:{label:'Washer',cat:'Laundry',w:27,d:30,h:38,color:0xf0f0f0},
  dryer:{label:'Dryer',cat:'Laundry',w:27,d:30,h:38,color:0xf0f0f0},
  bed:{label:'Queen bed',cat:'Furniture',w:60,d:80,h:24,color:0xb7c4d4},
  sofa:{label:'Sofa',cat:'Furniture',w:84,d:36,h:32,color:0x8f9aa8},
  table:{label:'Dining table',cat:'Furniture',w:60,d:36,h:30,color:0xa8774a},
};
const COUNTERTOP=new Set(['base','sinkbase','island','vanity']);
const KITCHEN_FRONT=new Set(['base','sinkbase','range','fridge','dw','island','tall']);
function fxLocal(f,lx,ly){const a=(f.rot||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return {x:f.x+lx*c-ly*s,y:f.y+lx*s+ly*c};}
function fxCorners(f){return [[-f.w/2,-f.d/2],[f.w/2,-f.d/2],[f.w/2,f.d/2],[-f.w/2,f.d/2]].map(([a,b])=>fxLocal(f,a,b));}
function fxFront(f){const a=(f.rot||0)*Math.PI/180;return {x:-Math.sin(a),y:Math.cos(a)};}
function fxSide(f){const a=(f.rot||0)*Math.PI/180;return {x:Math.cos(a),y:Math.sin(a)};}
function newFixture(type,level,x,y,rot=0){const t=FIXTURES[type];return {id:uid('fx'),level,type,x,y,w:t.w,d:t.d,h:t.h,elev:t.elev||0,rot,status:'new'};}
// put the back of a fixture against the nearest wall face
function snapFixtureToWall(p,levelId,f,raw,tolIn){
  let best=null;for(const w of p.walls.filter(w=>w.level===levelId)){const pr=projSeg(raw,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});if(pr.d<=w.thick/2+tolIn&&(!best||pr.d<best.pr.d))best={w,pr};}
  if(!best)return {...f,x:raw.x,y:raw.y};
  const {w,pr}=best;const d=wdir(w);let n={x:-d.y,y:d.x};if((raw.x-pr.x)*n.x+(raw.y-pr.y)*n.y<0)n={x:-n.x,y:-n.y};
  const rot=Math.round(Math.atan2(-n.x,n.y)*180/Math.PI/90)*90;const g=6;
  const along={x:Math.round(pr.x/g)*g,y:Math.round(pr.y/g)*g}; const base=Math.abs(d.x)>Math.abs(d.y)?{x:along.x,y:pr.y}:{x:pr.x,y:along.y};
  return {...f,rot:((rot%360)+360)%360,x:base.x+n.x*(w.thick/2+f.d/2),y:base.y+n.y*(w.thick/2+f.d/2)};
}
function fxPlanSymbol(f,S,cls){
  const P=(lx,ly)=>{const q=fxLocal(f,lx,ly);return S(q.x,q.y);};const pts=a=>a.map(([x,y])=>P(x,y).join(',')).join(' ');
  const W=f.w/2,D=f.d/2;const out=[html`<polygon key="o" points=${pts([[-W,-D],[W,-D],[W,D],[-W,D]])} className=${cls+(f.type==='wallcab'?' fx-dash':'')}/>`];
  const ell=(cx,cy,rx,ry,k)=>{const a=[];for(let i=0;i<20;i++){const t=i/20*Math.PI*2;a.push([cx+rx*Math.cos(t),cy+ry*Math.sin(t)]);}out.push(html`<polygon key=${k} points=${pts(a)} className=${cls}/>`);};
  const ln=(a,b,k)=>{const A=P(...a),B=P(...b);out.push(html`<line key=${k} x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className=${cls}/>`);};
  const lab=(t)=>{const c=P(0,0);out.push(html`<text key="t" x=${c[0]} y=${c[1]+4} textAnchor="middle" className="fx-t">${t}</text>`);};
  switch(f.type){
    case 'toilet':out.length=0;out.push(html`<polygon key="tk" points=${pts([[-W,-D],[W,-D],[W,-D+8],[-W,-D+8]])} className=${cls}/>`);ell(0,-D+8+(f.d-8)/2,W*0.85,(f.d-8)/2,'b');break;
    case 'lav':ell(0,1,W*0.7,D*0.6,'b');break;
    case 'vanity':ell(0,1,W*0.45,D*0.55,'b');break;
    case 'tub':{const m=3;out.push(html`<polygon key="i" points=${pts([[-W+m,-D+m],[W-m,-D+m],[W-m,D-m],[-W+m,D-m]])} className=${cls}/>`);ell(-W+10,0,3,3,'dr');break;}
    case 'shower':case 'rollin':ln([-W,-D],[W,D],'x1');ln([W,-D],[-W,D],'x2');break;
    case 'sinkbase':{out.push(html`<polygon key="b1" points=${pts([[-W+3,-D+4],[-1.5,-D+4],[-1.5,D-3],[-W+3,D-3]])} className=${cls}/>`,html`<polygon key="b2" points=${pts([[1.5,-D+4],[W-3,-D+4],[W-3,D-3],[1.5,D-3]])} className=${cls}/>`);break;}
    case 'tall':ln([-W,-D],[W,D],'x1');ln([W,-D],[-W,D],'x2');break;
    case 'range':for(const [k,[cx,cy]] of [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]].entries()){const r=Math.min(W,D)*0.28;ell(cx,cy,r,r,'c'+k);}break;
    case 'fridge':lab('REF');break; case 'dw':lab('DW');break; case 'washer':lab('W');break; case 'dryer':lab('D');break;
    case 'bed':{out.push(html`<polygon key="p1" points=${pts([[-W+4,-D+4],[-2,-D+4],[-2,-D+16],[-W+4,-D+16]])} className=${cls}/>`,html`<polygon key="p2" points=${pts([[2,-D+4],[W-4,-D+4],[W-4,-D+16],[2,-D+16]])} className=${cls}/>`);ln([-W,-D+22],[W,-D+22],'f');break;}
    case 'sofa':ln([-W,-D+10],[W,-D+10],'bk');ln([-W+8,-D+10],[-W+8,D],'a1');ln([W-8,-D+10],[W-8,D],'a2');break;
    case 'island':case 'base':ln([-W,D-1.5],[W,D-1.5],'ct');break;
  }
  return out;
}
const WALL_HUNG=new Set(['wallcab','grabbar']); // mounted above the floor: don't block floor clearances
const ADA_TOILET={min:16,max:18}, IRC_TOILET_SIDE=15, IRC_TOILET_FRONT=21;
function rectsOverlap(a,b){ // separating axis on two convex quads
  for(const poly of [a,b])for(let i=0;i<4;i++){const p1=poly[i],p2=poly[(i+1)%4];const nx=-(p2.y-p1.y),ny=p2.x-p1.x;
    const pa=a.map(q=>q.x*nx+q.y*ny),pb=b.map(q=>q.x*nx+q.y*ny);if(Math.max(...pa)<=Math.min(...pb)+0.01||Math.max(...pb)<=Math.min(...pa)+0.01)return false;}
  return true;
}
function wallRects(p,levelId){return p.walls.filter(w=>w.level===levelId&&w.status!=='demolish').map(w=>{const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2;return [{x:w.x1+n.x*t,y:w.y1+n.y*t},{x:w.x2+n.x*t,y:w.y2+n.y*t},{x:w.x2-n.x*t,y:w.y2-n.y*t},{x:w.x1-n.x*t,y:w.y1-n.y*t}];});}
// distance from a point along a direction to the nearest wall face or fixture
function clearAlong(p,levelId,pt,dir,skipId,max=240){
  let best=max;const ray=(poly)=>{for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];const ex=b.x-a.x,ey=b.y-a.y;const den=dir.x*ey-dir.y*ex;if(Math.abs(den)<1e-9)continue;
      const t=((a.x-pt.x)*ey-(a.y-pt.y)*ex)/den,u=((a.x-pt.x)*dir.y-(a.y-pt.y)*dir.x)/den;if(t>0.01&&u>=0&&u<=1&&t<best)best=t;}};
  for(const r of wallRects(p,levelId))ray(r);
  for(const f of (p.fixtures||[]))if(f.level===levelId&&f.id!==skipId&&!WALL_HUNG.has(f.type)&&f.status!=='demolish')ray(fxCorners(f));
  return best;
}
function fixtureChecks(p,add,ada){
  const fx=(p.fixtures||[]).filter(f=>f.status!=='demolish');
  for(const f of fx){const T={kind:'fixture',id:f.id};const pt={x:f.x,y:f.y};const L=fxLabel(f);const side=fxSide(f),front=fxFront(f);
    const back={x:f.x-front.x*(f.d/2-1),y:f.y-front.y*(f.d/2-1)};
    if(f.type==='toilet'){
      const l=clearAlong(p,f.level,back,{x:-side.x,y:-side.y},f.id),r=clearAlong(p,f.level,back,side,f.id);const near=Math.min(l,r);
      const frontPt={x:f.x+front.x*(f.d/2),y:f.y+front.y*(f.d/2)};const fc=clearAlong(p,f.level,frontPt,front,f.id);
      if(near<IRC_TOILET_SIDE-0.01)add('error',{set:'IRC',code:'R307.1',title:'Toilet side clearance'},`${L}: too close to the side`,`Centerline is ${fmtLen(near)} from the nearest wall or fixture; needs ${IRC_TOILET_SIDE}".`,T,pt,f.level);
      if(fc<IRC_TOILET_FRONT-0.01)add('error',{set:'IRC',code:'R307.1',title:'Toilet front clearance'},`${L}: not enough room in front`,`${fmtLen(fc)} clear in front; needs ${IRC_TOILET_FRONT}".`,T,pt,f.level);
      if(ada){if(near<ADA_TOILET.min-0.01||near>ADA_TOILET.max+0.01)add('error',{set:'ADA',code:'604.2',title:'Toilet centerline to side wall'},`${L}: centerline ${fmtLen(near)} from side wall`,`ADA needs 16" to 18" from the side wall so grab bars can be used. Move it ${near<16?fmtLen(16-near)+' away from':fmtLen(near-18)+' toward'} the wall.`,T,pt,f.level);
        // 60" wide by 56" deep clear floor beside the toilet, measured from the side wall
        const sw=l<r?{x:-side.x,y:-side.y}:side;const wallPt={x:back.x+sw.x*Math.min(l,r),y:back.y+sw.y*Math.min(l,r)};const away={x:-sw.x,y:-sw.y};
        const zone=[wallPt,{x:wallPt.x+away.x*60,y:wallPt.y+away.y*60},{x:wallPt.x+away.x*60+front.x*56,y:wallPt.y+away.y*60+front.y*56},{x:wallPt.x+front.x*56,y:wallPt.y+front.y*56}];
        const hits=fx.filter(o=>o.id!==f.id&&o.level===f.level&&!WALL_HUNG.has(o.type)&&o.type!=='lav'&&rectsOverlap(zone,fxCorners(o)));
        if(hits.length)add('error',{set:'ADA',code:'604.3.1',title:'Toilet clearance 60" x 56"'},`${L}: clear floor space is blocked`,`${hits.map(o=>FIXTURES[o.type]?.label||o.type).join(', ')} sits in the 60" wide by 56" deep space beside the toilet.`,T,pt,f.level);}}
    if(ada&&(f.type==='lav'||f.type==='vanity')&&f.h>34.01)add('error',{set:'ADA',code:'606.3',title:'Lavatory rim height'},`${L}: rim too high`,`Rim at ${fmtLen(f.h)}; ADA needs 34" maximum with knee clearance below.`,T,pt,f.level);
    if(ada&&(f.type==='fridge'||f.type==='range'||f.type==='sinkbase'||f.type==='lav'||f.type==='washer'||f.type==='dryer')){
      const fp={x:f.x+front.x*(f.d/2+0.5),y:f.y+front.y*(f.d/2+0.5)};const c=clearAlong(p,f.level,fp,front,f.id);
      if(c<48-0.01&&!(f.type==='sinkbase'||f.type==='lav'))add('warn',{set:'ADA',code:'305.3',title:'Clear floor space 30" x 48"'},`${L}: tight clear floor space`,`${fmtLen(c)} in front; a forward approach needs 48" (a parallel approach needs 30" x 48" alongside).`,T,pt,f.level);}
  }
  // kitchen work aisles: opposing fronts
  const kf=fx.filter(f=>KITCHEN_FRONT.has(f.type));
  for(let i=0;i<kf.length;i++)for(let j=i+1;j<kf.length;j++){const a=kf[i],b=kf[j];if(a.level!==b.level)continue;const fa=fxFront(a),fb=fxFront(b);if(fa.x*fb.x+fa.y*fb.y>-0.99)continue;
    const pa={x:a.x+fa.x*a.d/2,y:a.y+fa.y*a.d/2},pb={x:b.x+fb.x*b.d/2,y:b.y+fb.y*b.d/2};const gap=(pb.x-pa.x)*fa.x+(pb.y-pa.y)*fa.y;if(gap<=0||gap>120)continue;
    const sa=fxSide(a);const lat=Math.abs((pb.x-pa.x)*sa.x+(pb.y-pa.y)*sa.y);if(lat>(a.w+b.w)/2-6)continue;
    const need=ada?40:36;if(gap<need-0.01)add('error',ada?{set:'ADA',code:'804.2.1',title:'Kitchen work aisle'}:{set:'IRC',code:'—',title:'Kitchen work aisle (good practice)'},`Kitchen aisle too narrow`,`${fmtLen(gap)} between ${fxLabel(a).toLowerCase()} and ${fxLabel(b).toLowerCase()}; needs ${need}"${ada?' (60" for a U-shaped kitchen)':''}.`,{kind:'fixture',id:a.id},{x:(pa.x+pb.x)/2,y:(pa.y+pb.y)/2},a.level);}
  if(ada){const counters=fx.filter(f=>f.type==='base'||f.type==='sinkbase'||f.type==='island');
    if(counters.length&&!counters.some(f=>f.h<=34.01&&f.w>=30))add('warn',{set:'ADA',code:'804.3',title:'Kitchen work surface'},'No lowered work surface in the kitchen','Provide at least one 30" wide counter section at 34" maximum height with knee space below.',{kind:'fixture',id:counters[0].id},{x:counters[0].x,y:counters[0].y},counters[0].level);}
}
function addFixtures3D(p,lv,add,std,sel,mSel){
  for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id&&f.status!=='demolish'&&isCab(f))){CUR_TAG={kind:'fixture',id:f.id};addCabinet3D(p,lv,f,add,std,sel,mSel);}
  CUR_TAG={kind:'counter'};addCounters3D(p,lv,add,std);CUR_TAG=null;addCabTrim3D(p,lv,add,std);
  for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id&&f.status!=='demolish'&&!isCab(f))){CUR_TAG={kind:'fixture',id:f.id};const t=FIXTURES[f.type]||{color:0xcccccc};const ry=-(f.rot||0)*Math.PI/180;const e0=lv.elevation+(f.elev||0);
    const isSel=sel&&sel.id===f.id; const col=f.color?hexNum(f.color):t.color;const mat=isSel?mSel:std('fx-'+f.type+'-'+col,col,{roughness:f.type==='fridge'||f.type==='dw'?.35:.7,metalness:f.type==='fridge'||f.type==='dw'?.3:0});
    try{if(fixtureModel3D(f,lv,add,std,isSel,mSel,col))continue;}catch(e){console.error(e);}
    if(f.type==='toilet'){const tk=add(new THREE.BoxGeometry(f.w*IN,15*IN,8*IN),mat,0,0,0,ry);const q1=fxLocal(f,0,-f.d/2+4);tk.position.set(q1.x*IN,(e0+15+7.5)*IN,q1.y*IN);
      const q2=fxLocal(f,0,4);const bowl=add(new THREE.CylinderGeometry(f.w*0.42*IN,f.w*0.32*IN,15*IN,20),mat,q2.x*IN,(e0+7.5)*IN,q2.y*IN,ry);bowl.scale.z=1.25;continue;}
    const h=COUNTERTOP.has(f.type)?f.h-1.5:f.h;
    add(new THREE.BoxGeometry(f.w*IN,h*IN,f.d*IN),mat,f.x*IN,(e0+h/2)*IN,f.y*IN,ry);
    if(COUNTERTOP.has(f.type)){const q=fxLocal(f,0,0.75);add(new THREE.BoxGeometry((f.w+0.5)*IN,1.5*IN,(f.d+1.5)*IN),std('counter',0xe9e6df,{roughness:.4}),q.x*IN,(e0+f.h-0.75)*IN,q.y*IN,ry);}
  }
}
