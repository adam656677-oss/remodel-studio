/* ======================= code checks ======================= */
// Rule values live here so a code change or local amendment edits a number, not the program.
// Each project can override a value (settings.rules).
const RULES=[
  {id:'ceiling',set:'IRC',code:'R305.1',title:'Ceiling height, habitable rooms',unit:'in',value:84},
  {id:'ceilingBath',set:'IRC',code:'R305.1 Exc.',title:'Ceiling height, baths and laundry',unit:'in',value:80},
  {id:'roomArea',set:'IRC',code:'R304.1',title:'Habitable room floor area',unit:'sf',value:70},
  {id:'roomDim',set:'IRC',code:'R304.2',title:'Habitable room, least dimension',unit:'in',value:84},
  {id:'hall',set:'IRC',code:'R311.6',title:'Hallway clear width',unit:'in',value:36},
  {id:'riser',set:'IRC',code:'R311.7.5.1',title:'Stair riser height, maximum',unit:'in',value:7.75},
  {id:'tread',set:'IRC',code:'R311.7.5.2',title:'Stair tread depth, minimum',unit:'in',value:10},
  {id:'stairW',set:'IRC',code:'R311.7.1',title:'Stair width, minimum',unit:'in',value:36},
  {id:'egressArea',set:'IRC',code:'R310.2.1',title:'Egress window net opening',unit:'sf',value:5.7},
  {id:'egressAreaGrade',set:'IRC',code:'R310.2.1 Exc.',title:'Egress net opening at grade floor',unit:'sf',value:5.0},
  {id:'egressW',set:'IRC',code:'R310.2.1',title:'Egress net clear width',unit:'in',value:20},
  {id:'egressH',set:'IRC',code:'R310.2.1',title:'Egress net clear height',unit:'in',value:24},
  {id:'egressSill',set:'IRC',code:'R310.2.2',title:'Egress sill height, maximum',unit:'in',value:44},
  {id:'exitDoorW',set:'IRC',code:'R311.2',title:'Egress door clear width',unit:'in',value:32},
  {id:'exitDoorH',set:'IRC',code:'R311.2',title:'Egress door clear height',unit:'in',value:78},
  {id:'guardSill',set:'IRC',code:'R312.2.1',title:'Upper-floor window sill without opening limit',unit:'in',value:24},
  {id:'doorClear',set:'ADA',code:'404.2.3',title:'Door clear width',unit:'in',value:32},
  {id:'latchPull',set:'ADA',code:'404.2.4.1',title:'Latch-side clearance, pull side',unit:'in',value:18},
  {id:'turning',set:'ADA',code:'304.3.1',title:'Turning space diameter',unit:'in',value:60},
  {id:'route',set:'ADA',code:'403.5.1',title:'Accessible route clear width',unit:'in',value:36},
  {id:'rampRun',set:'ADA',code:'405.2',title:'Ramp run per inch of rise (1:12)',unit:'ratio',value:12},
  {id:'rampRise',set:'ADA',code:'405.6',title:'Ramp rise per run, maximum',unit:'in',value:30},
];
const DOOR_STOP_LOSS=2;  // leaf width minus clear opening at 90° (stops and leaf thickness), approx.
const WINDOW_OPS=[['double-hung','Double-hung'],['casement','Casement'],['slider','Slider'],['awning','Awning'],['fixed','Fixed']];
const HABITABLE=new Set(['living','bedroom','dining']);
function rv(p,id){const o=p.settings?.rules?.[id];if(o!=null&&isFinite(o))return o;return RULES.find(r=>r.id===id).value;}
function ruleOf(id){return RULES.find(r=>r.id===id);}
// Net clear opening of a window from its rough size and how it opens (approximate; frames vary by maker).
function windowNet(o){
  const op=o.operation||'double-hung';const W=o.width-4,H=o.height-4;
  if(op==='fixed')return {w:0,h:0,area:0};
  if(op==='double-hung')return {w:W,h:(o.height-6)/2,area:W*(o.height-6)/2/144};
  if(op==='slider')return {w:(o.width-6)/2,h:H,area:(o.width-6)/2*H/144};
  return {w:W,h:H,area:W*H/144};
}
function openingCenter(p,o){const w=p.walls.find(w=>w.id===o.wall);if(!w)return null;const d=wdir(w);return {x:w.x1+d.x*o.pos,y:w.y1+d.y*o.pos,w};}
// openings sitting on a room's boundary
function roomOpenings(p,r){
  const out=[];for(const o of p.openings){const c=openingCenter(p,o);if(!c||c.w.level!==r.level)continue;
    for(let i=0;i<r.pts.length;i++){const a=r.pts[i],b=r.pts[(i+1)%r.pts.length];const pr=projSeg(c,{x:a[0],y:a[1]},{x:b[0],y:b[1]});if(pr.d<=c.w.thick/2+1.5&&pr.tRaw>-0.01&&pr.tRaw<1.01){out.push(o);break;}}}
  return out;
}
// does the room have a side not closed by walls (open plan)?
function roomOpenSide(p,r){
  const walls=p.walls.filter(w=>w.level===r.level&&w.status!=='demolish');
  for(let i=0;i<r.pts.length;i++){const a={x:r.pts[i][0],y:r.pts[i][1]},b={x:r.pts[(i+1)%r.pts.length][0],y:r.pts[(i+1)%r.pts.length][1]};const L=dist(a,b);if(L<1)continue;
    const iv=[];for(const w of walls){const A={x:w.x1,y:w.y1},B={x:w.x2,y:w.y2};const pa=projSeg(A,a,b),pb=projSeg(B,a,b);
      const la=Math.hypot(A.x-(a.x+(b.x-a.x)*pa.tRaw),A.y-(a.y+(b.y-a.y)*pa.tRaw)),lb=Math.hypot(B.x-(a.x+(b.x-a.x)*pb.tRaw),B.y-(a.y+(b.y-a.y)*pb.tRaw));
      if(la<1&&lb<1){const t0=Math.max(0,Math.min(pa.tRaw,pb.tRaw)),t1=Math.min(1,Math.max(pa.tRaw,pb.tRaw));if(t1>t0)iv.push([t0*L,t1*L]);}}
    iv.sort((x,y)=>x[0]-y[0]);let cur=0,gap=0;for(const [s,e] of iv){if(s>cur)gap=Math.max(gap,s-cur);cur=Math.max(cur,e);}gap=Math.max(gap,L-cur);
    if(gap>24)return true;}
  return false;
}
function maxInscribedDiameter(pts,obs=[]){
  const xs=pts.map(q=>q[0]),ys=pts.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);let best=0;
  for(let i=1;i<40;i++)for(let j=1;j<40;j++){const x=x0+(x1-x0)*i/40,y=y0+(y1-y0)*j/40;if(!inPoly(x,y,pts))continue;if(obs.some(o=>inPoly(x,y,o)))continue;let d=1e9;
    for(const poly of [pts,...obs])for(let k=0;k<poly.length;k++){const a=poly[k],b=poly[(k+1)%poly.length];d=Math.min(d,projSeg({x,y},{x:a[0],y:a[1]},{x:b[0],y:b[1]}).d);}best=Math.max(best,d);}
  return best*2;
}
const isRect=pts=>pts.length===4&&pts.every(q=>pts.filter(v=>Math.abs(v[0]-q[0])<0.5).length===2&&pts.filter(v=>Math.abs(v[1]-q[1])<0.5).length===2);
const rectDims=pts=>{const xs=pts.map(q=>q[0]),ys=pts.map(q=>q[1]);return [Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)];};
// distance along a wall face from a point s to the nearest wall touching that face, toward dirSign
function faceClearance(p,w,s,dirSign,side){
  const L=wlen(w),d=wdir(w),n={x:-d.y,y:d.x};let best=dirSign>0?L-s:s;
  for(const o of p.walls){if(o===w||o.level!==w.level)continue;
    for(const e of [{x:o.x1,y:o.y1},{x:o.x2,y:o.y2}]){const pr=projSeg(e,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});if(pr.d>w.thick/2+1)continue;
      const other=e.x===o.x1&&e.y===o.y1?{x:o.x2,y:o.y2}:{x:o.x1,y:o.y1};const sideOf=(other.x-e.x)*n.x+(other.y-e.y)*n.y;if(sideOf*side<=0)continue;
      const se=pr.tRaw*L;const dd=(se-s)*dirSign-o.thick/2;if(dd>=-0.5&&dd<best)best=dd;}}
  return best;
}
function runChecks(p){
  const I=[];const add=(sev,ruleId,title,detail,target,pt,level)=>I.push({id:I.length,sev,rule:ruleId?(typeof ruleId==='string'?ruleOf(ruleId):ruleId):null,title,detail,target,pt,level});
  const ibc=p.settings?.code==='ibc'; const ada=ibc||p.settings?.ada!==false; const grade=p.settings?.gradeOffset||0; const lvls=sortedLevels(p); const first=groundLevel(p);
  // ---- model problems ----
  for(const w of p.walls){if(wlen(w)<1)add('warn',null,'Wall has no length','Delete it or drag an end to give it length.',{kind:'wall',id:w.id},{x:w.x1,y:w.y1},w.level);}
  for(const w of p.walls){const L=wlen(w);const ops=p.openings.filter(o=>o.wall===w.id).map(o=>({o,s0:o.pos-o.width/2,s1:o.pos+o.width/2})).sort((a,b)=>a.s0-b.s0);
    for(const q of ops){const c=openingCenter(p,q.o);if(q.o.width>L-1)add('error',null,`${q.o.type==='door'?'Door':'Window'} is wider than its wall`,`${fmtLen(q.o.width)} opening in a ${fmtLen(L)} wall.`,{kind:'opening',id:q.o.id},c,w.level);
      else if(q.s0<1.5||q.s1>L-1.5)add('warn',null,`${q.o.type==='door'?'Door':'Window'} is tight to a corner`,'Leave about 3" from the corner for framing and trim.',{kind:'opening',id:q.o.id},c,w.level);
      if(q.o.type==='window'&&q.o.sill+q.o.height>wallH(p,w)-4)add('warn',null,'Window head is above the wall top','Lower the window or its sill; leave room for a header.',{kind:'opening',id:q.o.id},c,w.level);}
    for(let i=1;i<ops.length;i++)if(ops[i].s0<ops[i-1].s1-0.5){const c=openingCenter(p,ops[i].o);add('error',null,'Openings overlap',`Two openings share the same part of this wall.`,{kind:'opening',id:ops[i].o.id},c,w.level);}}
  // ---- rooms ----
  for(const r of p.rooms){const lv=lvlOf(p,r.level);if(!lv)continue;const c=polyLabelPt(r.pts);const pt={x:c[0],y:c[1]};const T={kind:'room',id:r.id};
    const area=polyArea(r.pts)/144; const ceiling=lv.height;
    const bathLike=r.use==='bath'||r.use==='laundry';
    if(!ibc&&r.use!=='closet'&&r.use!=='garage'){const need=bathLike?rv(p,'ceilingBath'):rv(p,'ceiling');
      if(ceiling<need-0.01)add('error',bathLike?'ceilingBath':'ceiling',`${r.name}: ceiling too low`,`Ceiling ${fmtLen(ceiling)}; needs at least ${fmtLen(need)}.`,T,pt,r.level);}
    if(!ibc&&HABITABLE.has(r.use)){
      if(area<rv(p,'roomArea')-0.01)add('error','roomArea',`${r.name}: room too small`,`${area.toFixed(1)} sq ft; habitable rooms need ${rv(p,'roomArea')} sq ft.`,T,pt,r.level);
      if(isRect(r.pts)){const m=Math.min(...rectDims(r.pts))-4.5;if(m<rv(p,'roomDim')-0.01)add('error','roomDim',`${r.name}: room too narrow`,`About ${fmtLen(m)} clear; needs ${fmtLen(rv(p,'roomDim'))} in every direction.`,T,pt,r.level);}}
    if(!ibc&&r.use==='hall'&&isRect(r.pts)){const m=Math.min(...rectDims(r.pts))-4.5;
      if(m<rv(p,'hall')-0.01)add('error','hall',`${r.name}: hallway too narrow`,`About ${fmtLen(m)} clear; needs ${fmtLen(rv(p,'hall'))}.`,T,pt,r.level);
      else if(ada&&m<rv(p,'route')-0.01)add('error','route',`${r.name}: accessible route too narrow`,`About ${fmtLen(m)} clear; needs ${fmtLen(rv(p,'route'))}.`,T,pt,r.level);}
    const ops=roomOpenings(p,r);
    if(!ops.some(o=>o.type==='door')&&!roomOpenSide(p,r)&&r.use!=='closet')add('warn',null,`${r.name}: no way in`,'No door or open side was found on this room. Add a door or check the room outline.',T,pt,r.level);
    if(!ibc&&r.use==='bedroom'){
      const atGrade=lv.id===first.id&&(lv.elevation-first.elevation+grade)<=44;
      const needA=atGrade?rv(p,'egressAreaGrade'):rv(p,'egressArea');
      const wins=ops.filter(o=>{if(o.type!=='window')return false;const w=p.walls.find(w=>w.id===o.wall);return w&&w.kind==='exterior';});
      const ok=wins.find(o=>{const n=windowNet(o);return n.area>=needA-0.01&&n.w>=rv(p,'egressW')-0.01&&n.h>=rv(p,'egressH')-0.01&&o.sill<=rv(p,'egressSill')+0.01;});
      if(!ok){let why='No exterior window found in this bedroom.';
        if(wins.length){const best=wins.map(o=>({o,n:windowNet(o)})).sort((a,b)=>b.n.area-a.n.area)[0];const f=[];
          if(best.n.area<needA)f.push(`opens ${best.n.area.toFixed(1)} sq ft (needs ${needA})`);if(best.n.w<rv(p,'egressW'))f.push(`${fmtLen(best.n.w)} wide (needs ${fmtLen(rv(p,'egressW'))})`);
          if(best.n.h<rv(p,'egressH'))f.push(`${fmtLen(best.n.h)} high (needs ${fmtLen(rv(p,'egressH'))})`);if(best.o.sill>rv(p,'egressSill'))f.push(`sill ${fmtLen(best.o.sill)} (max ${fmtLen(rv(p,'egressSill'))})`);
          why=`Best window ${(openingMarks(p)[best.o.id]||'')} (${best.o.operation||'double-hung'}): ${f.join(', ')}. A 36" × 60" double-hung or a 30" × 48" casement with a sill at 44" or lower would pass. Net opening is estimated from the window size.`;}
        add('error','egressArea',`${r.name}: no emergency escape window`,why,T,pt,r.level);}}
    if(ada&&(r.use==='bath'||r.use==='kitchen')){const obs=(p.fixtures||[]).filter(f=>f.level===r.level&&!WALL_HUNG.has(f.type)&&f.status!=='demolish'&&!['lav','vanity'].includes(f.type)&&inPoly(f.x,f.y,r.pts)).map(f=>fxCorners(f).map(c=>[c.x,c.y]));const dia=maxInscribedDiameter(r.pts,obs)-4.5;
      if(dia<rv(p,'turning')-0.01)add('error','turning',`${r.name}: no wheelchair turning space`,`Largest clear circle is about ${fmtLen(dia)} with the fixtures and cabinets as drawn; needs ${fmtLen(rv(p,'turning'))}.`,T,pt,r.level);}
  }
  // ---- doors ----
  const marks=openingMarks(p);
  for(const o of p.openings.filter(o=>o.type==='door')){const c=openingCenter(p,o);if(!c)continue;const w=c.w;const T={kind:'opening',id:o.id};const mk=marks[o.id]||'Door';
    const clear=o.width-DOOR_STOP_LOSS;
    if(ada&&clear<rv(p,'doorClear')-0.01)add('error','doorClear',`${mk}: door too narrow for a wheelchair`,`${fmtLen(o.width)} door gives about ${fmtLen(clear)} clear; needs ${fmtLen(rv(p,'doorClear'))}. Use a ${fmtLen(rv(p,'doorClear')+DOOR_STOP_LOSS)} door or wider.`,T,c,w.level);
    if(ada){const L=wlen(w);const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));const latchS=o.hinge?pos-o.width/2:pos+o.width/2;const dirSign=o.hinge?-1:1;
      const cl=faceClearance(p,w,latchS,dirSign,o.swing||1);
      if(cl<rv(p,'latchPull')-0.01)add('error','latchPull',`${mk}: not enough room beside the latch`,`About ${fmtLen(Math.max(0,cl))} beside the latch on the pull side; needs ${fmtLen(rv(p,'latchPull'))}. Move the door or flip its hinge.`,T,c,w.level);}}
  // ---- egress door ----
  const extDoors=p.openings.filter(o=>{if(o.type!=='door')return false;const w=p.walls.find(w=>w.id===o.wall);return w&&w.kind==='exterior'&&w.level===first?.id;});
  if(!ibc&&p.walls.length&&first){
    if(!extDoors.length)add('error','exitDoorW','No exterior door on the first floor','Every house needs at least one egress door to the outside.',null,null,first.id);
    else if(!extDoors.some(o=>o.width-DOOR_STOP_LOSS>=rv(p,'exitDoorW')-0.01&&o.height>=rv(p,'exitDoorH')-0.01))
      add('error','exitDoorW','No exterior door is wide or tall enough for egress',`At least one needs ${fmtLen(rv(p,'exitDoorW'))} clear width and ${fmtLen(rv(p,'exitDoorH'))} height.`,{kind:'opening',id:extDoors[0].id},openingCenter(p,extDoors[0]),first.id);}
  // ---- stairs ----
  if(!ibc)for(const s of p.stairs){const si=stairInfo(p,s);const T={kind:'stair',id:s.id};const pt={x:s.x,y:s.y};
    if(si.riserH>rv(p,'riser')+1e-6)add('error','riser','Stair risers too tall',`${si.risers} risers at ${fmtLen(si.riserH)}; max ${fmtLen(rv(p,'riser'))}.`,T,pt,s.level);
    if(s.tread<rv(p,'tread')-1e-6)add('error','tread','Stair treads too shallow',`${fmtLen(s.tread)} treads; need ${fmtLen(rv(p,'tread'))}.`,T,pt,s.level);
    if(s.width<rv(p,'stairW')-1e-6&&s.shape!=='spiral')add('error','stairW','Stair too narrow',`${fmtLen(s.width)} wide; needs ${fmtLen(rv(p,'stairW'))}.`,T,pt,s.level);
    stairExtraChecks(p,s,add,T,pt);}
  // ---- upper-floor window sills ----
  for(const o of p.openings.filter(o=>o.type==='window')){const c=openingCenter(p,o);if(!c)continue;const lv=lvlOf(p,c.w.level);if(!lv||!first)continue;
    const drop=lv.elevation-first.elevation+grade;
    if(c.w.kind==='exterior'&&drop>72&&o.sill<rv(p,'guardSill')-0.01)add('warn','guardSill',`${marks[o.id]||'Window'}: low sill on an upper floor`,`Sill ${fmtLen(o.sill)} with a ${fmtLen(drop)} drop outside. Raise it to ${fmtLen(rv(p,'guardSill'))} or use a window-opening limiting device.`,{kind:'opening',id:o.id},c,c.w.level);}
  // ---- accessible entrance ----
  if(ada&&grade>0.5&&first){const runs=Math.ceil(grade/rv(p,'rampRise'));const len=grade*rv(p,'rampRun');
    add('warn','rampRun','Entrance is above the ground',`The first floor is ${fmtLen(grade)} above grade. A 1:${rv(p,'rampRun')} ramp needs about ${fmtLen(len)} of run${runs>1?` in ${runs} runs with 60" landings between`:''}, or a lift.`,extDoors[0]?{kind:'opening',id:extDoors[0].id}:null,extDoors[0]?openingCenter(p,extDoors[0]):null,first.id);}
  fixtureChecks(p,add,ada);
  elecChecks(p,add);rampChecks(p,add);regChecks(p,add);
  if(ibc)ibcChecks(p,add);
  // ---- structure ----
  for(const m of analyzeStructure(p)){const R={set:ibc?'IBC':'IRC',code:ibc?(m.kind==='floor'?'1607.1':m.kind==='header'||m.kind==='beam'?'2308.4':'2308.7'):m.code,title:'Wood member check (NDS values, planning level)'};
    if(m.beam){add('warn',R,`New beam needed where bearing wall is removed`,(m.suggest==='Engineer to size'?`Span ${fmtLen(m.span)}, load about ${m.load}. No beam in the standard list carries this; an engineer should size it (often steel, or a shorter span with an added post).`:`Span ${fmtLen(m.span)}, load about ${m.load}. Suggested ${m.suggest}, with posts and footings at both ends. Have an engineer confirm before removing the wall.`),m.target,m.pt,m.level);continue;}
    if(m.ratio>1){const sp=m.spacing?` at ${m.spacing}" o.c.`:'';add('error',R,`${m.label} overstressed`,`${m.size}${sp} over ${fmtLen(m.span)} is at ${Math.round(m.ratio*100)}% of capacity (${govLabel[m.gov]}). ${m.suggest?`Use ${m.suggest}${m.kind==='header'?'':sp}`.replace(/\.?$/,'.'):'Shorten the span or add a beam.'}`,m.target,m.pt,m.level);}
    else if(m.ratio>0.95&&m.kind!=='header')add('warn',R,`${m.label} near limit`,`${m.size} over ${fmtLen(m.span)} is at ${Math.round(m.ratio*100)}% of capacity (${govLabel[m.gov]}).`,m.target,m.pt,m.level);}
  const rank={error:0,warn:1,info:2};I.sort((a,b)=>rank[a.sev]-rank[b.sev]);
  return I;
}

