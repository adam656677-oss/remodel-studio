/* ======================= model ======================= */
const FLOOR_DEPTH=12;      // floor framing + subfloor between levels (in)
const MAX_RISER=7.75, MIN_TREAD=10;   // 2021 IRC R311.7.5
const uid=p=>p+Math.random().toString(36).slice(2,9);
const WALL_PRESETS={
  ext4:{label:'Exterior 2×4',thick:5.5,kind:'exterior',bearing:true},
  ext6:{label:'Exterior 2×6',thick:7.5,kind:'exterior',bearing:true},
  int4:{label:'Interior 2×4',thick:4.5,kind:'interior',bearing:false},
  int6:{label:'Interior 2×6',thick:6.5,kind:'interior',bearing:false},
  pony:{label:'Pony wall 42" (half wall)',thick:4.5,kind:'interior',bearing:false,height:42},
  knee:{label:'Knee wall 36" (2×4)',thick:4.5,kind:'interior',bearing:false,height:36},
};
const ROOM_USES=[['living','Living'],['bedroom','Bedroom'],['kitchen','Kitchen'],['dining','Dining'],['bath','Bath'],['hall','Hall'],['laundry','Laundry'],['closet','Closet'],['garage','Garage'],['office','Office'],['assembly','Meeting or assembly'],['classroom','Classroom'],['retail','Retail or sales'],['storage','Storage'],['shop','Shop or work bay'],['corridor','Corridor'],['other','Other']];
const DIRS={N:{x:0,y:-1},E:{x:1,y:0},S:{x:0,y:1},W:{x:-1,y:0}};

function blankProject(){
  const lv={id:uid('lv'),name:'First floor',elevation:0,height:96};
  return {version:1,id:uid('prj'),name:'Untitled house',levels:[lv],walls:[],openings:[],rooms:[],stairs:[],roofs:[],fixtures:[],settings:{grid:6,ada:true,gradeOffset:24,rules:{},foundation:{finish:'brick'}},sheet:{paper:'tabloid',scale:'auto'},info:{address:'',client:'',designer:'',revision:'',date:''}};
}
function sampleProject(){
  const p=blankProject(); p.name='Sample house (example)'; p.settings.ada=true; const L=p.levels[0].id;
  const W=(x1,y1,x2,y2,pre,id)=>{const w={id,level:L,x1,y1,x2,y2,thick:WALL_PRESETS[pre].thick,kind:WALL_PRESETS[pre].kind,bearing:WALL_PRESETS[pre].bearing,height:null,status:'new'};p.walls.push(w);return id;};
  W(0,0,480,0,'ext4','wf'); W(480,0,480,336,'ext4','wr'); W(480,336,0,336,'ext4','wb'); W(0,336,0,0,'ext4','wl');
  W(240,0,240,336,'int4','wa'); p.walls.find(w=>w.id==='wa').bearing=true; p.levels[0].framing={joist:'2x8',spacing:16,species:'syp2',dir:'auto',ceiling:'2x10',ceilingSpacing:16,foundation:'crawl',girders:96}; W(240,168,480,168,'int4','wm'); W(360,168,360,264,'int4','wc'); W(360,264,480,264,'int4','wd'); W(0,192,96,192,'int4','wk');
  const D=(wall,pos,width,extra={})=>p.openings.push({id:uid('op'),wall,type:'door',pos,width,height:80,sill:0,hinge:0,swing:1,status:'new',...extra});
  const N=(wall,pos,width,height=48,sill=36)=>p.openings.push({id:uid('op'),wall,type:'window',pos,width,height,sill,operation:'double-hung',status:'new'});
  D('wf',150,36,{swing:1}); D('wb',420,36,{swing:1}); D('wa',120,36,{swing:1,hinge:1}); D('wa',250,36,{swing:1}); D('wc',48,32,{swing:1});
  N('wf',70,60); N('wf',360,48); N('wb',330,48); N('wb',180,36); N('wr',84,36,60,24); N('wr',216,24,36,48); N('wr',300,36); N('wl',240,48); N('wl',72,36);
  const R=(name,use,pts)=>p.rooms.push({id:uid('rm'),level:L,name,use,pts});
  R('Living','living',[[0,0],[240,0],[240,192],[0,192]]);
  R('Kitchen','kitchen',[[0,192],[240,192],[240,336],[0,336]]);
  R('Bedroom 1','bedroom',[[240,0],[480,0],[480,168],[240,168]]);
  R('Bath','bath',[[360,168],[480,168],[480,264],[360,264]]);
  R('Bedroom 2','bedroom',[[240,168],[360,168],[360,264],[480,264],[480,336],[240,336]]);
  const F=(type,x,y,rot,extra={})=>p.fixtures.push({...newFixture(type,L,x,y,rot),...extra});
  // bath (360..480 x 168..264): toilet on the east wall, sink on the north wall, tub across the south wall
  F('toilet',480-2.75-14,188,90); F('lav',380,168+2.25+10,0); F('tub',420,264-2.25-15,180);
  // kitchen (0..240 x 192..336): counters on the west and south walls
  F('fridge',2.75+15,220,270); F('base',2.75+12,266,270); F('range',2.75+13,300,270,{w:30}); F('sinkbase',150,336-2.75-12,180); F('dw',120,336-2.75-12,180); F('base',186,336-2.75-12,180,{w:36});
  p.roofs.push({id:uid('rf'),level:L,style:'gable',pitch:6,overhang:12,ridge:'x',x:-2.75,y:-2.75,w:485.5,h:341.5,framing:{system:'rafters',rafter:'2x8',spacing:16,species:'syp2',cover:'asphalt'}});
  return p;
}
const lvlOf=(p,id)=>p.levels.find(l=>l.id===id);
const sortedLevels=p=>[...p.levels].sort((a,b)=>a.elevation-b.elevation);
// the floor that sits on the foundation: the lowest level that is not a basement
function groundLevel(p){const s=sortedLevels(p);return s.find(l=>!l.basement)||s[0];}
function levelAbove(p,lv){const s=sortedLevels(p);const i=s.findIndex(l=>l.id===lv.id);return s[i+1]||null;}
const wlen=w=>Math.hypot(w.x2-w.x1,w.y2-w.y1);
const wdir=w=>{const L=wlen(w)||1;return {x:(w.x2-w.x1)/L,y:(w.y2-w.y1)/L};};
const wallH=(p,w)=>w.height??(lvlOf(p,w.level)?.height??96);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function projSeg(pt,a,b){const dx=b.x-a.x,dy=b.y-a.y,L2=dx*dx+dy*dy||1;const t=((pt.x-a.x)*dx+(pt.y-a.y)*dy)/L2;const tc=Math.max(0,Math.min(1,t));const x=a.x+dx*tc,y=a.y+dy*tc;return {t:tc,tRaw:t,x,y,d:Math.hypot(pt.x-x,pt.y-y)};}
function polyArea(pts){let s=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];s+=a[0]*b[1]-b[0]*a[1];}return Math.abs(s)/2;}
function polyPerim(pts){let s=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];s+=Math.hypot(a[0]-b[0],a[1]-b[1]);}return s;}
function inPoly(x,y,pts){let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;}
function polyLabelPt(pts){let a=0,cx=0,cy=0;for(let i=0;i<pts.length;i++){const [x0,y0]=pts[i],[x1,y1]=pts[(i+1)%pts.length];const f=x0*y1-x1*y0;a+=f;cx+=(x0+x1)*f;cy+=(y0+y1)*f;}
  if(Math.abs(a)<1e-6){const n=pts.length;return [pts.reduce((s,p)=>s+p[0],0)/n,pts.reduce((s,p)=>s+p[1],0)/n];}
  const c=[cx/(3*a),cy/(3*a)]; if(pts.length<=4&&inPoly(c[0],c[1],pts)) return c;
  // Irregular rooms: pick the inside point with the most room for a wide label (horizontal clearance counts most)
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const clear=(x,y)=>{let l=1e9,r=1e9,u=1e9,d=1e9;for(let k=0;k<pts.length;k++){const [ax,ay]=pts[k],[bx,by]=pts[(k+1)%pts.length];
      if((ay>y)!==(by>y)){const ix=ax+(y-ay)*(bx-ax)/(by-ay);if(ix<=x)l=Math.min(l,x-ix);else r=Math.min(r,ix-x);}
      if((ax>x)!==(bx>x)){const iy=ay+(x-ax)*(by-ay)/(bx-ax);if(iy<=y)u=Math.min(u,y-iy);else d=Math.min(d,iy-y);}}
    let e=1e9;for(let k=0;k<pts.length;k++){const A=pts[k],B=pts[(k+1)%pts.length];e=Math.min(e,projSeg({x,y},{x:A[0],y:A[1]},{x:B[0],y:B[1]}).d);}
    return Math.min(l,r,2.5*Math.min(u,d),2.2*e);};
  let best=c,bd=-1;
  for(let i=1;i<24;i++)for(let j=1;j<24;j++){const x=x0+(x1-x0)*i/24,y=y0+(y1-y0)*j/24;if(!inPoly(x,y,pts))continue;const sc=clear(x,y);if(sc>bd+1e-6){bd=sc;best=[x,y];}}
  return best;}

// How far each wall end must extend to meet the wall it joins (clean corners and T's)
function wallJoins(walls){
  const J={};
  for(const w of walls){ const r={a:0,b:0};
    for(const [k,pt] of [['a',{x:w.x1,y:w.y1}],['b',{x:w.x2,y:w.y2}]]){
      for(const o of walls){ if(o===w) continue;
        const eA={x:o.x1,y:o.y1},eB={x:o.x2,y:o.y2};
        const touchEnd=dist(pt,eA)<0.6||dist(pt,eB)<0.6;
        const pr=projSeg(pt,eA,eB); const touchMid=pr.d<0.6&&pr.t>0.001&&pr.t<0.999;
        if(touchEnd){ const d1=wdir(w),d2=wdir(o); if(Math.abs(d1.x*d2.x+d1.y*d2.y)<0.999) r[k]=Math.max(r[k],o.thick/2-0.05); }
        else if(touchMid) r[k]=Math.max(r[k],o.thick/2-0.05);
      } }
    J[w.id]=r; }
  return J;
}
function stairInfo(p,s){
  const lv=lvlOf(p,s.level)||p.levels[0]; const up=levelAbove(p,lv);
  const rise=s.rise??(up? up.elevation-lv.elevation : lv.height+FLOOR_DEPTH);
  const risers=Math.max(1,Math.ceil(rise/MAX_RISER-1e-9)); const riserH=rise/risers; const treads=risers-1; const run=treads*s.tread;
  const d=DIRS[s.dir]||DIRS.N, n={x:-d.y,y:d.x}, hw=s.width/2;
  const c=[{x:s.x+n.x*hw,y:s.y+n.y*hw},{x:s.x-n.x*hw,y:s.y-n.y*hw}];
  const corners=[c[0],c[1],{x:c[1].x+d.x*run,y:c[1].y+d.y*run},{x:c[0].x+d.x*run,y:c[0].y+d.y*run}];
  return {rise,risers,riserH,treads,run,d,n,corners};
}
// Roof surfaces. Returns triangles in inches as [x,y,z] where z is elevation.
// styles: gable, hip, shed, gambrel, mansard, dutch (hip with gablets), flat (low slope, optional parapet)
const roofAxis=r=>['hip','dutch','mansard'].includes(r.style)?(r.w>=r.h?'x':'y'):(r.ridge||'x');
function roofTop(p,r){const lv=lvlOf(p,r.level)||p.levels[0];return lv.elevation+(r.plate??lv.height);}
function roofBuild(r,top){
  const p=r.pitch/12, st=r.style||'gable'; const flat=st==='flat'; const par=flat?(r.parapet||0):0; const oh=par>0?0:(r.overhang??12); let axis=roofAxis(r);
  const U0=axis==='x'?r.x:r.y, Ul=axis==='x'?r.w:r.h, V0=axis==='x'?r.y:r.x, Vl=axis==='x'?r.h:r.w;
  const M=(u,v,z)=>axis==='x'?[u,v,z]:[v,u,z];
  const u0=U0-oh,u1=U0+Ul+oh,v0=V0-oh,v1=V0+Vl+oh,vm=(v0+v1)/2,eave=top-oh*p;
  const roof=[],fill=[],lines=[],polys=[],fpolys=[];
  const poly=(arr,pts)=>{for(let i=1;i+1<pts.length;i++)arr.push([pts[0],pts[i],pts[i+1]]);(arr===roof?polys:fpolys).push(pts);};
  const tri=(arr,a,b,c)=>poly(arr,[a,b,c]);const quad=(arr,a,b,c,d)=>poly(arr,[a,b,c,d]);
  let peak=top; let eaveZ=eave;
  if(st==='hip'){
    const half=(v1-v0)/2, rz=eave+half*p; let ua=u0+half,ub=u1-half; if(ua>ub){ua=ub=(u0+u1)/2;} peak=rz;
    quad(roof,M(u0,v0,eave),M(u1,v0,eave),M(ub,vm,rz),M(ua,vm,rz));
    quad(roof,M(u1,v1,eave),M(u0,v1,eave),M(ua,vm,rz),M(ub,vm,rz));
    tri(roof,M(u0,v1,eave),M(u0,v0,eave),M(ua,vm,rz));
    tri(roof,M(u1,v0,eave),M(u1,v1,eave),M(ub,vm,rz));
    lines.push([M(ua,vm,0),M(ub,vm,0)],[M(u0,v0,0),M(ua,vm,0)],[M(u0,v1,0),M(ua,vm,0)],[M(u1,v0,0),M(ub,vm,0)],[M(u1,v1,0),M(ub,vm,0)]);
  } else if(st==='dutch'){
    const half=(v1-v0)/2, rz=eave+half*p; const g=Math.min(half*0.95,Math.max(6,r.gablet??half*0.5)); const zg=eave+g*p; peak=rz;
    const ua=u0+g,ub=u1-g;
    poly(roof,[M(u0,v0,eave),M(u1,v0,eave),M(ub,v0+g,zg),M(ub,vm,rz),M(ua,vm,rz),M(ua,v0+g,zg)]);
    poly(roof,[M(u1,v1,eave),M(u0,v1,eave),M(ua,v1-g,zg),M(ua,vm,rz),M(ub,vm,rz),M(ub,v1-g,zg)]);
    quad(roof,M(u0,v1,eave),M(u0,v0,eave),M(ua,v0+g,zg),M(ua,v1-g,zg));
    quad(roof,M(u1,v0,eave),M(u1,v1,eave),M(ub,v1-g,zg),M(ub,v0+g,zg));
    for(const u of [ua,ub])tri(fill,M(u,v0+g,zg),M(u,v1-g,zg),M(u,vm,rz));
    lines.push([M(ua,vm,0),M(ub,vm,0)],[M(u0,v0,0),M(ua,v0+g,0)],[M(u0,v1,0),M(ua,v1-g,0)],[M(u1,v0,0),M(ub,v0+g,0)],[M(u1,v1,0),M(ub,v1-g,0)],[M(ua,v0+g,0),M(ua,v1-g,0)],[M(ub,v0+g,0),M(ub,v1-g,0)]);
  } else if(st==='shed'){
    const flip=!!r.flip; const z=v=>flip?eave+(v-v0)*p:eave+(v1-v)*p; const hi=flip?v1:v0; peak=z(hi);
    quad(roof,M(u0,v0,z(v0)),M(u1,v0,z(v0)),M(u1,v1,z(v1)),M(u0,v1,z(v1)));
    const top0=top,zw=v=>flip?top0+(v-V0)*p:top0+(V0+Vl-v)*p;
    for(const u of [U0,U0+Ul]){const lo=flip?V0:V0+Vl,hiV=flip?V0+Vl:V0;tri(fill,M(u,V0,top),M(u,V0+Vl,top),M(u,hiV,zw(hiV)));}
    {const hiV=flip?V0+Vl:V0;quad(fill,M(U0,hiV,top),M(U0+Ul,hiV,top),M(U0+Ul,hiV,zw(hiV)),M(U0,hiV,zw(hiV)));}
    lines.push([M(u0,flip?v1:v0,0),M(u1,flip?v1:v0,0)]);
  } else if(st==='gambrel'){
    const p2=(r.pitch2??21)/12; const half=Vl/2; const b=Math.min(half*0.9,r.brk??half*0.35); const e2=top-oh*p2, zb=top+b*p2, rz=zb+(half-b)*p; peak=rz; eaveZ=e2;
    const vb0=V0+b,vb1=V0+Vl-b,vr=V0+half;
    quad(roof,M(u0,v0,e2),M(u1,v0,e2),M(u1,vb0,zb),M(u0,vb0,zb));quad(roof,M(u0,vb0,zb),M(u1,vb0,zb),M(u1,vr,rz),M(u0,vr,rz));
    quad(roof,M(u0,vr,rz),M(u1,vr,rz),M(u1,vb1,zb),M(u0,vb1,zb));quad(roof,M(u0,vb1,zb),M(u1,vb1,zb),M(u1,v1,e2),M(u0,v1,e2));
    for(const u of [U0,U0+Ul])poly(fill,[M(u,V0,top),M(u,vb0,zb),M(u,vr,rz),M(u,vb1,zb),M(u,V0+Vl,top)]);
    lines.push([M(u0,vr,0),M(u1,vr,0)],[M(u0,vb0,0),M(u1,vb0,0)],[M(u0,vb1,0),M(u1,vb1,0)]);
  } else if(st==='mansard'){
    const p2=(r.pitch2??24)/12; const half=Math.min(Ul,Vl)/2; const b=Math.min(half*0.8,r.brk??Math.min(36,half*0.4)); const e2=top-oh*p2, zb=top+b*p2; eaveZ=e2;
    const iu0=U0+b,iu1=U0+Ul-b,iv0=V0+b,iv1=V0+Vl-b;
    quad(roof,M(u0,v0,e2),M(u1,v0,e2),M(iu1,iv0,zb),M(iu0,iv0,zb));quad(roof,M(u1,v1,e2),M(u0,v1,e2),M(iu0,iv1,zb),M(iu1,iv1,zb));
    quad(roof,M(u0,v1,e2),M(u0,v0,e2),M(iu0,iv0,zb),M(iu0,iv1,zb));quad(roof,M(u1,v0,e2),M(u1,v1,e2),M(iu1,iv1,zb),M(iu1,iv0,zb));
    const ih=(iv1-iv0)/2,ivm=(iv0+iv1)/2,rz=zb+ih*p;let ua=iu0+ih,ub=iu1-ih;if(ua>ub){ua=ub=(iu0+iu1)/2;}peak=rz;
    quad(roof,M(iu0,iv0,zb),M(iu1,iv0,zb),M(ub,ivm,rz),M(ua,ivm,rz));quad(roof,M(iu1,iv1,zb),M(iu0,iv1,zb),M(ua,ivm,rz),M(ub,ivm,rz));
    tri(roof,M(iu0,iv1,zb),M(iu0,iv0,zb),M(ua,ivm,rz));tri(roof,M(iu1,iv0,zb),M(iu1,iv1,zb),M(ub,ivm,rz));
    lines.push([M(iu0,iv0,0),M(iu1,iv0,0)],[M(iu1,iv0,0),M(iu1,iv1,0)],[M(iu1,iv1,0),M(iu0,iv1,0)],[M(iu0,iv1,0),M(iu0,iv0,0)],[M(u0,v0,0),M(iu0,iv0,0)],[M(u1,v0,0),M(iu1,iv0,0)],[M(u1,v1,0),M(iu1,iv1,0)],[M(u0,v1,0),M(iu0,iv1,0)]);
    if(rz-zb>1)lines.push([M(ua,ivm,0),M(ub,ivm,0)],[M(iu0,iv0,0),M(ua,ivm,0)],[M(iu0,iv1,0),M(ua,ivm,0)],[M(iu1,iv0,0),M(ub,ivm,0)],[M(iu1,iv1,0),M(ub,ivm,0)]);
  } else if(flat){
    const pp=Math.max(0.125,r.flatSlope??0.25)/12; const z=v=>top+(v1-v)*pp+(r.thick??10); peak=z(v0)+par; eaveZ=z(v1);
    quad(roof,M(u0,v0,z(v0)),M(u1,v0,z(v0)),M(u1,v1,z(v1)),M(u0,v1,z(v1)));
    // roof edge (fascia band) all round
    const zt=v=>z(v);quad(fill,M(u0,v0,top),M(u1,v0,top),M(u1,v0,zt(v0)+par),M(u0,v0,zt(v0)+par));quad(fill,M(u1,v1,top),M(u0,v1,top),M(u0,v1,zt(v1)+par),M(u1,v1,zt(v1)+par));
    quad(fill,M(u0,v1,top),M(u0,v0,top),M(u0,v0,zt(v0)+par),M(u0,v1,zt(v1)+par));quad(fill,M(u1,v0,top),M(u1,v1,top),M(u1,v1,zt(v1)+par),M(u1,v0,zt(v0)+par));
    if(par>0)lines.push([M(u0+6,v0+6,0),M(u1-6,v0+6,0)],[M(u1-6,v0+6,0),M(u1-6,v1-6,0)],[M(u1-6,v1-6,0),M(u0+6,v1-6,0)],[M(u0+6,v1-6,0),M(u0+6,v0+6,0)]);
  } else {
    const rz=eave+(vm-v0)*p; peak=rz;
    quad(roof,M(u0,v0,eave),M(u1,v0,eave),M(u1,vm,rz),M(u0,vm,rz));
    quad(roof,M(u0,v1,eave),M(u0,vm,rz),M(u1,vm,rz),M(u1,v1,eave));
    for(const u of [U0,U0+Ul]) tri(fill,M(u,V0,top),M(u,V0+Vl,top),M(u,V0+Vl/2,top+Vl/2*p));
    lines.push([M(u0,vm,0),M(u1,vm,0)]);
  }
  const outline=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]].map(([u,v])=>M(u,v,0));
  return {roof,fill,lines,outline,peak,polys,fpolys,eave:eaveZ,axis,u0,u1,v0,v1};
}
// height of the top of a roof at plan point (x,y), or -Infinity outside it
function roofHeightAt(b,x,y){let best=-Infinity;for(const f of b.polys){if(!inPoly(x,y,f.map(q=>[q[0],q[1]])))continue;const z=planeZ(f,x,y);if(z>best)best=z;}return best;}
function planeZ(f,x,y){const [a,b,c]=f;const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  if(Math.abs(n[2])<1e-9){let m=-Infinity;for(const q of f)m=Math.max(m,q[2]);return m;}return a[2]-(n[0]*(x-a[0])+n[1]*(y-a[1]))/n[2];}
function roofOverLevel(p,levelId){
  const ws=p.walls.filter(w=>w.level===levelId&&w.kind==='exterior'&&w.status!=='demolish');
  const use=ws.length?ws:p.walls.filter(w=>w.level===levelId);
  if(!use.length) return null;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const w of use){const t=w.thick/2;x0=Math.min(x0,w.x1-t,w.x2-t);y0=Math.min(y0,w.y1-t,w.y2-t);x1=Math.max(x1,w.x1+t,w.x2+t);y1=Math.max(y1,w.y1+t,w.y2+t);}
  return {id:uid('rf'),level:levelId,style:'gable',pitch:6,overhang:12,ridge:(x1-x0)>=(y1-y0)?'x':'y',x:x0,y:y0,w:x1-x0,h:y1-y0};
}
// endpoints (on one level) sitting at pt
function endsAt(p,levelId,pt,skip){
  const out=[];for(const w of p.walls){if(w.level!==levelId)continue;
    if(!(skip&&skip.has(w.id+'a'))&&dist(pt,{x:w.x1,y:w.y1})<0.6)out.push({id:w.id,end:'a'});
    if(!(skip&&skip.has(w.id+'b'))&&dist(pt,{x:w.x2,y:w.y2})<0.6)out.push({id:w.id,end:'b'});}
  return out;
}
function moveEnds(p,list,pt){
  const m=new Map(list.map(e=>[e.id+e.end,e]));
  return {...p,walls:p.walls.map(w=>{const a=m.has(w.id+'a'),b=m.has(w.id+'b');if(!a&&!b)return w;return {...w,...(a?{x1:pt.x,y1:pt.y}:{}),...(b?{x2:pt.x,y2:pt.y}:{})};})};
}
const COLL={wall:'walls',opening:'openings',room:'rooms',stair:'stairs',roof:'roofs',fixture:'fixtures',elec:'elec',ramp:'ramps',shape:'shapes',dim:'dims',anno:'annos'};
function findObj(p,sel){if(!sel)return null;return (p[COLL[sel.kind]]||[]).find(o=>o.id===sel.id)||null;}
function updObj(p,kind,id,patch){const c=COLL[kind];return {...p,[c]:p[c].map(o=>o.id===id?{...o,...patch}:o)};}
function delObj(p,sel){
  const c=COLL[sel.kind]; let q={...p,[c]:p[c].filter(o=>o.id!==sel.id)};
  if(sel.kind==='wall') q.openings=q.openings.filter(o=>o.wall!==sel.id);
  return q;
}
function setWallLength(p,w,L){
  const d=wdir(w); const nb={x:w.x1+d.x*L,y:w.y1+d.y*L};
  const list=endsAt(p,w.level,{x:w.x2,y:w.y2}); return moveEnds(p,list,nb);
}
function validProject(p){return p&&Array.isArray(p.levels)&&p.levels.length&&Array.isArray(p.walls);}
function normalize(p){return {...p,version:1,id:p.id||uid('prj'),underlay:p.underlay||null,cloud:p.cloud||null,site:p.site||null,name:p.name||'Untitled house',levels:p.levels,walls:p.walls||[],openings:p.openings||[],rooms:p.rooms||[],stairs:p.stairs||[],roofs:p.roofs||[],fixtures:p.fixtures||[],options:p.options||null,activeOption:p.activeOption||null,prices:p.prices||{},settings:{grid:6,ada:true,gradeOffset:0,rules:{},...(p.settings||{})},sheet:{paper:'tabloid',scale:'auto',...(p.sheet||{})},info:{address:'',client:'',designer:'',revision:'',date:'',...(p.info||{})}};}


/* ---- design options: each option keeps its own copy of the building ---- */
const MODEL_KEYS=['levels','walls','openings','rooms','stairs','roofs','fixtures','elec','ramps','shapes','dims','annos'];
function pickModel(p){const m={};for(const k of MODEL_KEYS)m[k]=p[k]||[];return m;}
function ensureOptions(p){if(p.options&&p.options.length&&p.activeOption)return p;return {...p,options:[{id:'opt-a',name:'Option A',model:null}],activeOption:'opt-a'};}
function switchOption(p,id){p=ensureOptions(p);if(id===p.activeOption)return p;const t=p.options.find(o=>o.id===id);if(!t||!t.model)return p;
  const options=p.options.map(o=>o.id===p.activeOption?{...o,model:pickModel(p)}:o.id===id?{...o,model:null}:o);return {...p,...t.model,options,activeOption:id};}
function addOption(p){p=ensureOptions(p);const options=p.options.map(o=>o.id===p.activeOption?{...o,model:pickModel(p)}:o);const id=uid('opt');
  const used=new Set(options.map(o=>o.name));let n=options.length;let name;do{name='Option '+String.fromCharCode(65+n);n++;}while(used.has(name));
  return {...p,...JSON.parse(JSON.stringify(pickModel(p))),options:[...options,{id,name,model:null}],activeOption:id};}
function deleteOption(p,id){p=ensureOptions(p);if(p.options.length<2)return p;if(id===p.activeOption){const other=p.options.find(o=>o.id!==id);p=switchOption(p,other.id);}return {...p,options:p.options.filter(o=>o.id!==id)};}
function optionProject(p,o){return o.id===p.activeOption||!o.model?p:{...p,...o.model};}
const activeOptionName=p=>(p.options&&p.options.length>1)?(p.options.find(o=>o.id===p.activeOption)||{}).name:'';
