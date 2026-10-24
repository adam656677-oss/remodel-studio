/* ======================= electrical plan ======================= */
// Devices: {id, level, type, x, y, rot (deg, the way the device faces), h (inches above floor), wall?:id, links?:[light ids], auto?:true, status}
// Rules follow 2021 IRC Chapters 39 (E3901-E3903) and R314/R315 at a planning level.
const ELEC={
  recept:{label:'Duplex receptacle',cat:'Receptacles',mount:'wall',h:16,sym:'recept'},
  gfci:{label:'GFCI receptacle',cat:'Receptacles',mount:'wall',h:16,sym:'recept',tag:'GFI'},
  counter:{label:'Countertop GFCI receptacle',cat:'Receptacles',mount:'wall',h:42,sym:'recept',tag:'GFI',gfci:true},
  weather:{label:'Weatherproof GFCI receptacle (outside)',cat:'Receptacles',mount:'wall',h:18,sym:'recept',tag:'WP',gfci:true,outside:true},
  r240:{label:'240-volt receptacle (range or dryer)',cat:'Receptacles',mount:'wall',h:6,sym:'r240'},
  floorrec:{label:'Floor receptacle',cat:'Receptacles',mount:'ceil',h:0,sym:'recept',tag:'F'},
  usb:{label:'USB receptacle',cat:'Receptacles',mount:'wall',h:16,sym:'recept',tag:'USB'},
  switch:{label:'Single-pole switch',cat:'Switches',mount:'wall',h:48,sym:'switch',tag:'S'},
  switch3:{label:'3-way switch',cat:'Switches',mount:'wall',h:48,sym:'switch',tag:'S3'},
  dimmer:{label:'Dimmer switch',cat:'Switches',mount:'wall',h:48,sym:'switch',tag:'SD'},
  occ:{label:'Occupancy sensor switch',cat:'Switches',mount:'wall',h:48,sym:'switch',tag:'SO'},
  light:{label:'Ceiling light',cat:'Lighting',mount:'ceil',h:96,sym:'light'},
  can:{label:'Recessed light',cat:'Lighting',mount:'ceil',h:96,sym:'can'},
  pendant:{label:'Pendant light',cat:'Lighting',mount:'ceil',h:96,sym:'light',tag:'P'},
  fan:{label:'Ceiling fan with light',cat:'Lighting',mount:'ceil',h:96,sym:'fan'},
  sconce:{label:'Wall sconce',cat:'Lighting',mount:'wall',h:66,sym:'sconce'},
  exterior:{label:'Exterior wall light',cat:'Lighting',mount:'wall',h:72,sym:'sconce',outside:true},
  undercab:{label:'Under-cabinet light',cat:'Lighting',mount:'wall',h:54,sym:'strip'},
  exit:{label:'Exit sign with emergency lights',cat:'Lighting',mount:'wall',h:84,sym:'exit'},
  exhaust:{label:'Bath exhaust fan',cat:'Ventilation and safety',mount:'ceil',h:96,sym:'exhaust'},
  smoke:{label:'Smoke alarm (hard-wired, interconnected)',cat:'Ventilation and safety',mount:'ceil',h:96,sym:'alarm',tag:'SD'},
  co:{label:'Carbon monoxide alarm',cat:'Ventilation and safety',mount:'ceil',h:96,sym:'alarm',tag:'CO'},
  combo:{label:'Smoke and CO alarm combo',cat:'Ventilation and safety',mount:'ceil',h:96,sym:'alarm',tag:'S/C'},
  panel:{label:'Electrical panel',cat:'Power and data',mount:'wall',h:60,sym:'panel'},
  data:{label:'Data or TV jack',cat:'Power and data',mount:'wall',h:16,sym:'data'},
  thermo:{label:'Thermostat',cat:'Power and data',mount:'wall',h:54,sym:'switch',tag:'T'},
  doorbell:{label:'Doorbell or camera',cat:'Power and data',mount:'wall',h:48,sym:'switch',tag:'DB',outside:true},
};
const ELEC_CATS=[...new Set(Object.values(ELEC).map(e=>e.cat))];
const isRecept=d=>['recept','gfci','counter','weather','usb'].includes(d.type);
const isLight=d=>['light','can','pendant','fan','sconce','exterior','undercab','exhaust'].includes(d.type);
function newElec(type,level,x,y,rot=0){const e=ELEC[type]||ELEC.recept;return {id:uid('el'),level,type,x,y,rot,h:e.h,status:'new'};}
// put a wall device on the face of the nearest wall, on the side the pointer is on
function snapElecToWall(p,levelId,d,raw,tol=24){
  let best=null;for(const w of p.walls.filter(w=>w.level===levelId&&w.status!=='demolish')){const pr=projSeg(raw,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});if(pr.d<=w.thick/2+tol&&(!best||pr.d<best.pr.d))best={w,pr};}
  if(!best)return {...d,x:raw.x,y:raw.y,wall:null};const {w,pr}=best;const dw=wdir(w);let n={x:-dw.y,y:dw.x};if((raw.x-pr.x)*n.x+(raw.y-pr.y)*n.y<0)n={x:-n.x,y:-n.y};
  const off=w.thick/2+1;return {...d,x:pr.x+n.x*off,y:pr.y+n.y*off,rot:Math.round(Math.atan2(n.y,n.x)*180/Math.PI),wall:w.id};}

/* ---- symbols: primitives in output units, centered on (cx,cy), size r, facing angle a (radians) ---- */
function elecSym(type,cx,cy,r,a){
  const e=ELEC[type]||ELEC.recept;const out=[];const ca=Math.cos(a),sa=Math.sin(a);const P=(u,v)=>[cx+u*ca-v*sa,cy+u*sa+v*ca]; // u: away from wall, v: along wall
  const L=(a1,b1,a2,b2,w=1)=>out.push({t:'line',a:P(a1,b1),b:P(a2,b2),w});
  switch(e.sym){
    case 'recept':out.push({t:'circle',c:[cx,cy],r:r*0.55});L(-r*0.55,-r*0.32,-r*0.55-r*0.45,-r*0.32);L(-r*0.55,r*0.32,-r*0.55-r*0.45,r*0.32);if(e.tag)out.push({t:'text',p:P(r*1.25,0),s:e.tag,sz:r*0.75});break;
    case 'r240':out.push({t:'circle',c:[cx,cy],r:r*0.6});L(-r*0.6,-r*0.35,-r*1.1,-r*0.35);L(-r*0.6,0,-r*1.1,0);L(-r*0.6,r*0.35,-r*1.1,r*0.35);out.push({t:'text',p:P(r*1.3,0),s:'240',sz:r*0.7});break;
    case 'switch':out.push({t:'text',p:[cx,cy],s:e.tag||'S',sz:r*1.05,bold:true});break;
    case 'light':out.push({t:'circle',c:[cx,cy],r:r*0.7});L(-r*0.5,-r*0.5,r*0.5,r*0.5);L(-r*0.5,r*0.5,r*0.5,-r*0.5);if(e.tag)out.push({t:'text',p:[cx+r*1.1,cy-r*0.8],s:e.tag,sz:r*0.7});break;
    case 'can':out.push({t:'circle',c:[cx,cy],r:r*0.45});out.push({t:'circle',c:[cx,cy],r:r*0.2,fill:true});break;
    case 'fan':out.push({t:'circle',c:[cx,cy],r:r*0.35});for(let i=0;i<4;i++){const t=i*Math.PI/2+0.4;out.push({t:'line',a:[cx+Math.cos(t)*r*0.35,cy+Math.sin(t)*r*0.35],b:[cx+Math.cos(t)*r*1.15,cy+Math.sin(t)*r*1.15],w:1.6});}break;
    case 'sconce':out.push({t:'arc',c:P(0,0),r:r*0.6,a0:a-Math.PI/2,a1:a+Math.PI/2});L(0,-r*0.6,0,r*0.6);break;
    case 'strip':L(0,-r*1.2,0,r*1.2,2.4);break;
    case 'exit':out.push({t:'rect',c:[cx,cy],w:r*1.6,h:r*0.9});out.push({t:'text',p:[cx,cy],s:'EXIT',sz:r*0.5,bold:true});break;
    case 'exhaust':out.push({t:'rect',c:[cx,cy],w:r*1.3,h:r*1.3});L(-r*0.65,-r*0.65,r*0.65,r*0.65);L(-r*0.65,r*0.65,r*0.65,-r*0.65);break;
    case 'alarm':out.push({t:'circle',c:[cx,cy],r:r*0.75});out.push({t:'text',p:[cx,cy],s:e.tag,sz:r*(e.tag.length>2?0.5:0.65),bold:true});break;
    case 'panel':out.push({t:'rect',c:P(-r*0.2,0),w:r*0.8,h:r*1.8,fill:true,ang:a});break;
    case 'data':out.push({t:'poly',pts:[P(r*0.5,0),P(-r*0.4,-r*0.55),P(-r*0.4,r*0.55)]});break;
  }
  return out;
}
function elecSVG(d,S,s,cls){
  const [cx,cy]=S(d.x,d.y);const r=Math.max(6,Math.min(14,5*s));const a=(d.rot||0)*Math.PI/180;
  return elecSym(d.type,cx,cy,r,a).map((q,i)=>q.t==='circle'?html`<circle key=${i} cx=${q.c[0]} cy=${q.c[1]} r=${q.r} className=${cls+(q.fill?' el-fill':'')}/>`
    :q.t==='line'?html`<line key=${i} x1=${q.a[0]} y1=${q.a[1]} x2=${q.b[0]} y2=${q.b[1]} className=${cls} strokeWidth=${q.w||1}/>`
    :q.t==='text'?html`<text key=${i} x=${q.p[0]} y=${q.p[1]+q.sz*0.36} textAnchor="middle" className="el-t" style=${{fontSize:q.sz+'px',fontWeight:q.bold?700:500}}>${q.s}</text>`
    :q.t==='rect'?html`<rect key=${i} x=${q.c[0]-q.w/2} y=${q.c[1]-q.h/2} width=${q.w} height=${q.h} className=${cls+(q.fill?' el-fill':'')}/>`
    :q.t==='poly'?html`<polygon key=${i} points=${q.pts.map(x=>x.join(',')).join(' ')} className=${cls}/>`
    :q.t==='arc'?html`<path key=${i} d=${`M${q.c[0]+q.r*Math.cos(q.a0)},${q.c[1]+q.r*Math.sin(q.a0)} A${q.r},${q.r} 0 0 1 ${q.c[0]+q.r*Math.cos(q.a1)},${q.c[1]+q.r*Math.sin(q.a1)}`} className=${cls} fill="none"/>`:null);
}
function elecDL(dl,d,X,Y,k){const r=0.07*k;const a=(d.rot||0)*Math.PI/180;
  for(const q of elecSym(d.type,X(d.x),Y(d.y),r,a)){
    if(q.t==='circle')dl.circle(q.c[0],q.c[1],q.r,{stroke:INK,w:0.6,fill:q.fill?INK:'#ffffff'});
    else if(q.t==='line')dl.line(q.a[0],q.a[1],q.b[0],q.b[1],0.6*(q.w||1));
    else if(q.t==='text')dl.text(q.p[0],q.p[1]+q.sz*0.36,q.s,{size:q.sz*72,anchor:'middle',bold:!!q.bold});
    else if(q.t==='rect')dl.poly([[q.c[0]-q.w/2,q.c[1]-q.h/2],[q.c[0]+q.w/2,q.c[1]-q.h/2],[q.c[0]+q.w/2,q.c[1]+q.h/2],[q.c[0]-q.w/2,q.c[1]+q.h/2]],{stroke:INK,w:0.6,fill:q.fill?INK:'#ffffff'});
    else if(q.t==='poly')dl.poly(q.pts,{stroke:INK,w:0.6,fill:'#ffffff'});
    else if(q.t==='arc')dl.poly(arcPts(q.c[0],q.c[1],q.r,q.a0,q.a1,10),{stroke:INK,w:0.6,close:false});}}

/* ---- room wall space: runs of wall along the room outline, broken by doorways and open sides ---- */
function roomWallRuns(p,r){
  const walls=p.walls.filter(w=>w.level===r.level&&w.status!=='demolish');const n=r.pts.length;const edges=[];let acc=0;
  for(let i=0;i<n;i++){const a={x:r.pts[i][0],y:r.pts[i][1]},b={x:r.pts[(i+1)%n][0],y:r.pts[(i+1)%n][1]};const L=dist(a,b);if(L<0.5){continue;}const d={x:(b.x-a.x)/L,y:(b.y-a.y)/L};
    let nin={x:-d.y,y:d.x};const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if(!inPoly(mid.x+nin.x*6,mid.y+nin.y*6,r.pts))nin={x:-nin.x,y:-nin.y};
    const w=walls.find(w=>{const q=projSeg(mid,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});const dw=wdir(w);return q.d<w.thick/2+1.5&&Math.abs(dw.x*d.x+dw.y*d.y)>0.99;});
    const inset=w?Math.max(0,w.thick/2-projSeg(mid,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2}).d):0;
    const gaps=[];if(w){for(const o of p.openings.filter(o=>o.wall===w.id&&o.type==='door'&&o.status!=='demolish')){const c=openingCenter(p,o);const s=(c.x-a.x)*d.x+(c.y-a.y)*d.y;if(s>-o.width/2&&s<L+o.width/2)gaps.push([s-o.width/2,s+o.width/2]);}}
    edges.push({a,b,L,d,nin,w,inset,gaps,s0:acc});acc+=L;}
  const P=acc;const space=[];
  for(const e of edges){if(!e.w)continue;let c=0;for(const [g0,g1] of e.gaps.sort((x,y)=>x[0]-y[0])){if(g0>c)space.push([e.s0+c,e.s0+Math.min(g0,e.L)]);c=Math.max(c,g1);}if(c<e.L)space.push([e.s0+c,e.s0+e.L]);}
  // join pieces that meet at corners, including across the start of the loop
  const runs=[];for(const s of space){const last=runs[runs.length-1];if(last&&Math.abs(last[1]-s[0])<0.75)last[1]=s[1];else runs.push([...s]);}
  if(runs.length>1&&Math.abs(runs[runs.length-1][1]-P)<0.75&&Math.abs(runs[0][0])<0.75){const l=runs.pop();runs[0]=[l[0]-P,runs[0][1]];}
  const at=s=>{s=((s%P)+P)%P;const e=edges.find(e=>s>=e.s0-1e-6&&s<=e.s0+e.L+1e-6)||edges[edges.length-1];const t=s-e.s0;return {x:e.a.x+e.d.x*t+e.nin.x*(e.inset+1),y:e.a.y+e.d.y*t+e.nin.y*(e.inset+1),rot:Math.round(Math.atan2(e.nin.y,e.nin.x)*180/Math.PI),wall:e.w?e.w.id:null};};
  const sOf=pt=>{let best=null;for(const e of edges){const q=projSeg(pt,e.a,e.b);if(!best||q.d<best.d)best={d:q.d,s:e.s0+q.t*e.L};}return best;};
  return {runs,P,at,sOf,edges};
}
function roomDevices(p,r,pred){return (p.elec||[]).filter(d=>d.level===r.level&&d.status!=='demolish'&&pred(d)&&(inPoly(d.x,d.y,r.pts)||roomWallRuns(p,r).sOf(d).d<9));}
const GENERAL_ROOMS=new Set(['living','bedroom','dining','office','other','classroom','assembly','retail']);

/* ---- automatic layout ---- */
function autoElectrical(p,levelId){
  const lv=lvlOf(p,levelId);const keep=(p.elec||[]).filter(d=>!(d.auto&&d.level===levelId));const out=[];const add=(type,o)=>out.push({...newElec(type,levelId,o.x,o.y,o.rot||0),wall:o.wall||null,auto:true,...(o.extra||{})});
  const rooms=p.rooms.filter(r=>r.level===levelId);const fx=(p.fixtures||[]).filter(f=>f.level===levelId&&f.status!=='demolish');
  for(const r of rooms){const W=roomWallRuns(p,r);const [cx,cy]=polyLabelPt(r.pts);const area=polyArea(r.pts)/144;const lights=[];
    const counters=fx.filter(f=>COUNTERTOP.has(f.type)&&f.type!=='island'&&f.type!=='vanity'&&inPoly(f.x,f.y,r.pts));
    // general receptacles: no point on the wall line more than 6 ft from one (E3901.2.1)
    if(GENERAL_ROOMS.has(r.use)||r.use==='kitchen'||r.use==='dining'){
      for(const [s0,s1] of W.runs){const L=s1-s0;if(L<24)continue;
        const blocked=s=>{const q=W.at(s);return counters.some(f=>{const c=fxCorners(f);return projSeg(q,c[0],c[1]).d<6;});};
        const n=Math.ceil(L/144);for(let i=0;i<n;i++){const s=s0+L*(i+0.5)/n;if(r.use==='kitchen'&&blocked(s))continue;const q=W.at(s);add('recept',q);}}}
    // kitchen counters: every 4 ft, within 2 ft of each end (E3901.4)
    if(r.use==='kitchen'||counters.length){for(const f of counters){const back={x:f.x-fxFront(f).x*f.d/2,y:f.y-fxFront(f).y*f.d/2};const sd=fxSide(f);
        const n=Math.max(1,Math.ceil(f.w/48));for(let i=0;i<n;i++){const t=f.type==='sinkbase'?(i%2?1:-1)*(f.w/2-5):-f.w/2+f.w*(i+0.5)/n;const fr=fxFront(f);add('counter',{x:back.x+sd.x*t+fr.x*1,y:back.y+sd.y*t+fr.y*1,rot:Math.round(Math.atan2(fr.y,fr.x)*180/Math.PI),extra:{h:42}});}}
      for(const f of fx.filter(f=>f.type==='island'&&inPoly(f.x,f.y,r.pts)))add('counter',{x:f.x+fxSide(f).x*(f.w/2-6),y:f.y+fxSide(f).y*(f.w/2-6),rot:f.rot+90,extra:{h:30}});
      for(const f of fx.filter(f=>f.type==='range'&&inPoly(f.x,f.y,r.pts))){const b={x:f.x-fxFront(f).x*f.d/2,y:f.y-fxFront(f).y*f.d/2};add('r240',{x:b.x+fxFront(f).x,y:b.y+fxFront(f).y,rot:Math.round(Math.atan2(fxFront(f).y,fxFront(f).x)*180/Math.PI)});}}
    // bath: GFCI within 36" of each basin (E3901.6) and an exhaust fan
    if(r.use==='bath'){for(const f of fx.filter(f=>(f.type==='lav'||f.type==='vanity')&&inPoly(f.x,f.y,r.pts))){const b={x:f.x-fxFront(f).x*f.d/2,y:f.y-fxFront(f).y*f.d/2};const sd=fxSide(f);const fr=fxFront(f);
        add('gfci',{x:b.x+sd.x*(f.w/2+6)+fr.x,y:b.y+sd.y*(f.w/2+6)+fr.y,rot:Math.round(Math.atan2(fr.y,fr.x)*180/Math.PI),extra:{h:42}});}
      if(!fx.some(f=>(f.type==='lav'||f.type==='vanity')&&inPoly(f.x,f.y,r.pts))&&W.runs.length){const q=W.at(W.runs[0][0]+18);add('gfci',{...q,extra:{h:42}});}
      add('exhaust',{x:cx+18,y:cy});}
    if(r.use==='laundry'){const wsh=fx.find(f=>f.type==='washer'&&inPoly(f.x,f.y,r.pts));if(wsh){const b={x:wsh.x-fxFront(wsh).x*wsh.d/2,y:wsh.y-fxFront(wsh).y*wsh.d/2};add('gfci',{x:b.x+fxFront(wsh).x,y:b.y+fxFront(wsh).y,rot:Math.round(Math.atan2(fxFront(wsh).y,fxFront(wsh).x)*180/Math.PI),extra:{h:42}});}
      else if(W.runs.length){add('gfci',{...W.at(W.runs[0][0]+24),extra:{h:42}});}
      const dry=fx.find(f=>f.type==='dryer'&&inPoly(f.x,f.y,r.pts));if(dry){const b={x:dry.x-fxFront(dry).x*dry.d/2,y:dry.y-fxFront(dry).y*dry.d/2};add('r240',{x:b.x+fxFront(dry).x,y:b.y+fxFront(dry).y,rot:Math.round(Math.atan2(fxFront(dry).y,fxFront(dry).x)*180/Math.PI),extra:{h:36}});}}
    if(r.use==='garage'&&W.runs.length){const L=W.runs.reduce((s,x)=>s+x[1]-x[0],0);const n=Math.max(1,Math.round(Math.sqrt(area)/10));for(let i=0;i<n;i++)add('gfci',{...W.at(W.runs[0][0]+L*(i+0.5)/n),extra:{h:48}});}
    if((r.use==='hall'||r.use==='corridor')&&W.runs.length){const L=W.runs.reduce((s,x)=>s+x[1]-x[0],0)/2;if(L>=120)add('recept',W.at(W.runs[0][0]+Math.min(36,(W.runs[0][1]-W.runs[0][0])/2)));}
    // lighting outlet in every room, switched at the entry (E3903.2)
    if(r.use!=='closet'||area>=24){if(r.use==='kitchen'&&area>100){const xs=r.pts.map(q=>q[0]),ys=r.pts.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
        for(const fx_ of [0.25,0.75])for(const fy_ of [0.3,0.7]){const x=x0+(x1-x0)*fx_,y=y0+(y1-y0)*fy_;if(inPoly(x,y,r.pts))lights.push({type:'can',x,y});}}
      else lights.push({type:r.use==='bedroom'||r.use==='living'?'fan':'light',x:cx,y:cy+(r.use==='bath'?-14:0)});}
    const lightIds=[];for(const l of lights){add(l.type,l);lightIds.push(out[out.length-1].id);}
    if(r.use==='bath')lightIds.push(out.find(d=>d.type==='exhaust'&&inPoly(d.x,d.y,r.pts))?.id);
    const doors=roomOpenings(p,r).filter(o=>o.type==='door');
    if(lightIds.length&&doors.length){const o=doors[0];const w=p.walls.find(w=>w.id===o.wall);const c=openingCenter(p,o);const dw=wdir(w);const latch=o.hinge?-1:1;
      let nIn={x:-dw.y,y:dw.x};if(!inPoly(c.x+nIn.x*(w.thick/2+6),c.y+nIn.y*(w.thick/2+6),r.pts))nIn={x:-nIn.x,y:-nIn.y};
      const along=o.width/2+5;let s={x:c.x+dw.x*latch*along+nIn.x*(w.thick/2+1),y:c.y+dw.y*latch*along+nIn.y*(w.thick/2+1)};if(!inPoly(s.x+nIn.x*3,s.y+nIn.y*3,r.pts))s={x:c.x-dw.x*latch*along+nIn.x*(w.thick/2+1),y:c.y-dw.y*latch*along+nIn.y*(w.thick/2+1)};
      add(doors.length>1&&r.use!=='bath'?'switch3':'switch',{x:s.x,y:s.y,rot:Math.round(Math.atan2(nIn.y,nIn.x)*180/Math.PI),wall:w.id,extra:{links:lightIds.filter(Boolean)}});}
    // smoke alarm in every sleeping room (R314.3)
    if(r.use==='bedroom')add('smoke',{x:cx-24,y:cy-24});
  }
  // alarms outside sleeping areas: in rooms next to a bedroom that are not bedrooms
  const beds=rooms.filter(r=>r.use==='bedroom');const done=new Set();
  for(const b of beds)for(const o of roomOpenings(p,b).filter(o=>o.type==='door')){const c=openingCenter(p,o);const other=rooms.find(r=>r.id!==b.id&&r.use!=='bedroom'&&r.use!=='bath'&&r.use!=='closet'&&(inPoly(c.x+8,c.y,r.pts)||inPoly(c.x-8,c.y,r.pts)||inPoly(c.x,c.y+8,r.pts)||inPoly(c.x,c.y-8,r.pts)));
    if(other&&!done.has(other.id)){done.add(other.id);add('combo',{x:c.x+(inPoly(c.x+30,c.y,other.pts)?30:inPoly(c.x-30,c.y,other.pts)?-30:0),y:c.y+(inPoly(c.x,c.y+30,other.pts)?30:inPoly(c.x,c.y-30,other.pts)?-30:0)});}}
  if(!out.some(d=>d.type==='smoke'||d.type==='combo')&&rooms.length){const big=[...rooms].sort((a,b)=>polyArea(b.pts)-polyArea(a.pts))[0];const [x,y]=polyLabelPt(big.pts);add('smoke',{x:x+30,y:y+30});}
  // outside: a GFCI receptacle and a light at each exterior door (E3901.8, E3903.3)
  const ext=p.walls.filter(w=>w.level===levelId&&w.kind==='exterior'&&w.status!=='demolish');
  for(const o of p.openings.filter(o=>o.type==='door'&&ext.some(w=>w.id===o.wall))){const w=ext.find(w=>w.id===o.wall);const c=openingCenter(p,o);const dw=wdir(w);const on=outwardNormal(ext,w);const off=w.thick/2+1;
    add('exterior',{x:c.x+dw.x*(o.width/2+8)+on.x*off,y:c.y+dw.y*(o.width/2+8)+on.y*off,rot:Math.round(Math.atan2(on.y,on.x)*180/Math.PI),wall:w.id});
    add('weather',{x:c.x-dw.x*(o.width/2+14)+on.x*off,y:c.y-dw.y*(o.width/2+14)+on.y*off,rot:Math.round(Math.atan2(on.y,on.x)*180/Math.PI),wall:w.id});}
  if(lv&&lv===groundLevel(p)&&!keep.some(d=>d.type==='panel')){const g=rooms.find(r=>r.use==='garage'||r.use==='laundry')||rooms.find(r=>r.use==='hall')||rooms[0];if(g){const W=roomWallRuns(p,g);if(W.runs.length)add('panel',W.at(W.runs[W.runs.length-1][1]-14));}}
  return {...p,elec:[...keep,...out]};
}

/* ---- code checks ---- */
function elecChecks(p,add){
  if(!(p.elec||[]).length)return;const R=(code,title)=>({set:'IRC',code,title});
  for(const r of p.rooms){const c=polyLabelPt(r.pts);const pt={x:c[0],y:c[1]};const T={kind:'room',id:r.id};const W=roomWallRuns(p,r);
    const rec=roomDevices(p,r,isRecept).map(d=>W.sOf(d)).filter(x=>x.d<12).map(x=>x.s);
    if(GENERAL_ROOMS.has(r.use)){for(const [s0,s1] of W.runs){const L=s1-s0;if(L<24)continue;const pts=rec.flatMap(s=>[s,s+W.P,s-W.P]).filter(s=>s>=s0-1&&s<=s1+1).sort((a,b)=>a-b);
        let worst=0;if(!pts.length)worst=L;else{worst=Math.max(pts[0]-s0,s1-pts[pts.length-1]);for(let i=1;i<pts.length;i++)worst=Math.max(worst,(pts[i]-pts[i-1])/2);}
        if(worst>72.5){add('error',R('E3901.2.1','Receptacle spacing, 6 ft rule'),`${r.name}: receptacles too far apart`,`A stretch of wall ${fmtLen(L)} long has a point about ${fmtLen(worst)} from the nearest receptacle; the limit is 6'-0". Use Auto-place or add receptacles.`,T,W.at((s0+s1)/2),r.level);break;}}}
    if(r.use==='bath'){const lavs=(p.fixtures||[]).filter(f=>f.level===r.level&&(f.type==='lav'||f.type==='vanity')&&f.status!=='demolish'&&inPoly(f.x,f.y,r.pts));const gf=roomDevices(p,r,d=>isRecept(d));
      for(const f of lavs)if(!gf.some(d=>Math.hypot(d.x-f.x,d.y-f.y)<=36+f.w/2))add('error',R('E3901.6','Bathroom receptacle'),`${r.name}: no receptacle near the sink`,'Put a GFCI receptacle within 36" of the outside edge of each basin.',T,{x:f.x,y:f.y},r.level);
      if(!roomDevices(p,r,d=>d.type==='exhaust').length)add('warn',R('R303.3','Bathroom ventilation'),`${r.name}: no exhaust fan`,'Baths need an exhaust fan vented outside unless an openable window of 3 sq ft is provided.',T,pt,r.level);}
    if(r.use==='kitchen'){const ct=(p.fixtures||[]).filter(f=>f.level===r.level&&COUNTERTOP.has(f.type)&&f.type!=='island'&&f.type!=='vanity'&&f.status!=='demolish'&&inPoly(f.x,f.y,r.pts));
      const cr=roomDevices(p,r,isRecept).filter(d=>d.h>=30);const L=ct.reduce((s,f)=>s+f.w,0);if(L>=12&&cr.length<Math.ceil(L/48))add('error',R('E3901.4.1','Countertop receptacles'),`${r.name}: not enough countertop receptacles`,`${fmtLen(L)} of counter needs about ${Math.ceil(L/48)} GFCI receptacles (no point more than 24" from one). Found ${cr.length}.`,T,pt,r.level);
      if(roomDevices(p,r,d=>isRecept(d)&&d.type==='recept'&&d.h>=30).length)add('warn',R('E3902.6','GFCI protection'),`${r.name}: countertop receptacles need GFCI`,'All kitchen countertop receptacles must be GFCI protected.',T,pt,r.level);}
    if(r.use!=='closet'&&r.use!=='storage'&&!roomDevices(p,r,isLight).length)add('warn',R('E3903.2','Lighting outlet'),`${r.name}: no light`,'Habitable rooms, baths, halls, stairways and garages need a wall-switched lighting outlet.',T,pt,r.level);
    if(r.use==='bedroom'&&!roomDevices(p,r,d=>d.type==='smoke'||d.type==='combo').length)add('error',R('R314.3','Smoke alarms'),`${r.name}: no smoke alarm`,'Every sleeping room needs a smoke alarm, interconnected with the others.',T,pt,r.level);
    if(r.use==='laundry'&&!roomDevices(p,r,isRecept).length)add('error',R('E3901.7','Laundry receptacle'),`${r.name}: no laundry receptacle`,'Provide at least one receptacle for the laundry, on a 20-amp circuit.',T,pt,r.level);}
  const lvls=sortedLevels(p);const anySD=(p.elec||[]).some(d=>d.type==='smoke'||d.type==='combo');
  for(const lv of lvls){if(!p.rooms.some(r=>r.level===lv.id))continue;if(!(p.elec||[]).some(d=>d.level===lv.id&&(d.type==='smoke'||d.type==='combo')))add('error',R('R314.3','Smoke alarms'),`${lv.name}: no smoke alarm on this floor`,'Each story needs at least one smoke alarm, plus one in each bedroom and outside sleeping areas.',null,null,lv.id);}
  if(anySD&&!(p.elec||[]).some(d=>d.type==='co'||d.type==='combo')&&p.rooms.some(r=>r.use==='bedroom'))add('warn',R('R315.3','Carbon monoxide alarms'),'No carbon monoxide alarm','If the house has a gas or wood-burning appliance or an attached garage, put CO alarms outside each sleeping area.',null,null,lvls[0].id);
  const ext=p.walls.filter(w=>w.kind==='exterior'&&w.status!=='demolish');if(ext.length&&!(p.elec||[]).some(d=>d.type==='weather'))add('warn',R('E3901.8','Outdoor receptacles'),'No outdoor receptacles','Provide GFCI outdoor receptacles at the front and back of the house, no more than 6\'-6" above grade.',null,null,lvls[0].id);
}

/* ---- materials ---- */
function elecTakeoff(p,add,W){
  const ds=(p.elec||[]).filter(d=>d.status!=='existing');if(!ds.length)return;const cnt={};for(const d of ds){if(d.status==='demolish'){add('Demolition',`Remove ${ELEC[d.type]?.label.toLowerCase()||'device'}`,1,'EA');continue;}cnt[d.type]=(cnt[d.type]||0)+1;}
  for(const [t,n] of Object.entries(cnt))add('Electrical',ELEC[t].label,n,'EA');
  const boxes={old:0,neu:0,ceil:0};for(const d of ds.filter(d=>d.status!=='demolish')){const e=ELEC[d.type];if(!e||d.type==='panel'||d.type==='undercab')continue;const w=p.walls.find(w=>w.id===d.wall);
    if(e.mount==='ceil'&&!['smoke','co','combo','floorrec'].includes(d.type))boxes.ceil++;else if(w&&(w.status||'new')==='existing')boxes.old++;else boxes.neu++;}
  if(boxes.neu)add('Electrical','Single-gang new-work box',boxes.neu,'EA');if(boxes.old)add('Electrical','Single-gang old-work (remodel) box',boxes.old,'EA','for existing walls');if(boxes.ceil)add('Electrical','Ceiling fan-rated box',boxes.ceil,'EA');
  const n=ds.filter(d=>d.status!=='demolish'&&d.type!=='panel').length;const r20=ds.filter(d=>['counter','gfci','weather'].includes(d.type)).length;
  add('Electrical','14/2 NM-B cable, 250\' roll',Math.ceil(Math.max(0,n-r20)*25*W/250),'roll','about 25 ft per device');if(r20)add('Electrical','12/2 NM-B cable, 250\' roll',Math.ceil(r20*25*W/250),'roll','20-amp kitchen, bath, laundry and outdoor circuits');
  const circuits=Math.ceil(Math.max(0,n-r20)/10)+Math.ceil(r20/4);add('Electrical','AFCI or dual-function breaker',circuits,'EA','about 10 devices per 15-amp circuit; 20-amp for wet areas');
  add('Electrical','Wire connectors, assorted',Math.ceil(n/25),'box');add('Electrical','Device cover plates',ds.filter(d=>ELEC[d.type]?.mount==='wall'&&d.type!=='panel').length,'EA');
}
/* ---- switch legs: link unlinked lights to the switches in their room; NEC 210.70 switched lighting ---- */
const isLightT=t=>/^(light|can|pendant|fan|sconce|undercab|exterior)$/.test(t),isSwitchT=t=>/^(switch|switch3|dimmer|occ)$/.test(t);
function autoLinkSwitches(p,levelId){let n=0;const elec=(p.elec||[]).map(d=>({...d,links:d.links?[...d.links]:d.links}));const linked=new Set(elec.flatMap(d=>d.links||[]));
  for(const r of p.rooms.filter(r=>!levelId||r.level===levelId)){const inR=d=>d.level===r.level&&d.status!=='demolish'&&inPoly(d.x,d.y,r.pts);const sws=elec.filter(d=>inR(d)&&isSwitchT(d.type));
    const lts=elec.filter(d=>inR(d)&&isLightT(d.type)&&!linked.has(d.id)&&d.type!=='undercab');if(!sws.length||!lts.length)continue;
    // lights go to the nearest switch; 3-way pairs both control them
    for(const l of lts){const near=sws.slice().sort((a,b)=>Math.hypot(a.x-l.x,a.y-l.y)-Math.hypot(b.x-l.x,b.y-l.y))[0];const group=near.type==='switch3'?sws.filter(s=>s.type==='switch3'):[near];
      for(const s of group){s.links=[...new Set([...(s.links||[]),l.id])];}linked.add(l.id);n++;}}
  return {p:{...p,elec},n};}
regExtra({checks:(p,add)=>{const elec=(p.elec||[]).filter(d=>d.status!=='demolish');if(!elec.length)return;const R={set:'NEC',code:'210.70(A)',title:'Switched lighting outlets'};
  for(const r of p.rooms){if(!['living','bedroom','kitchen','bath','hall','dining','office','laundry','garage','other'].includes(r.use||'other'))continue;const inR=d=>d.level===r.level&&inPoly(d.x,d.y,r.pts);
    const lts=elec.filter(d=>inR(d)&&isLightT(d.type)),sws=elec.filter(d=>inR(d)&&isSwitchT(d.type));const c=polyLabelPt(r.pts);
    if(!sws.length&&(lts.length||elec.some(inR)))add('warn',R,`${r.name}: no wall switch`,`Every habitable room, bathroom, hallway, stair and attached garage needs a wall switch for a light or a switched receptacle (NEC 210.70). Add a switch at the door.`,{kind:'room',id:r.id},{x:c[0],y:c[1]},r.level);
    else if(sws.length&&lts.length&&!lts.some(l=>elec.some(s=>(s.links||[]).includes(l.id))))add('warn',R,`${r.name}: switch not linked to a light`,`Select the switch and tick the lights it controls, or use "Link switches to lights" in the Electrical tool, so the plan shows the switch legs.`,{kind:'room',id:r.id},{x:c[0],y:c[1]},r.level);}}});
