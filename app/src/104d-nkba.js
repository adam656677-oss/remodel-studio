/* ======================= NKBA kitchen and bath planning guidelines (kitchen guidelines numbered as in the 31-guideline NKBA set) ======================= */
// settings.nkba: {on, cooks:1|2, access:false (use the Access Standard values)}
const nkbaOf=p=>({on:true,cooks:1,access:false,...(p.settings?.nkba||{})});
const NK=(c,t)=>({set:'NKBA',code:c,title:t});
const BASE_RUN=new Set(['base','sinkbase','dw','range','island','vanity','filler']);
// ray from pt along dir: nearest wall or fixture hit (skips ids and wall-hung items)
function nkRay(p,lvId,pt,dir,skip=[],max=240,fxFilter=null){let best={t:max,kind:null,f:null};
  const ray=(poly,kind,f)=>{for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];const ex=b.x-a.x,ey=b.y-a.y;const den=dir.x*ey-dir.y*ex;if(Math.abs(den)<1e-9)continue;
    const t=((a.x-pt.x)*ey-(a.y-pt.y)*ex)/den,u=((a.x-pt.x)*dir.y-(a.y-pt.y)*dir.x)/den;if(t>0.01&&u>=0&&u<=1&&t<best.t)best={t,kind,f};}};
  for(const r of wallRects(p,lvId))ray(r,'wall',null);
  for(const f of (p.fixtures||[]))if(f.level===lvId&&!skip.includes(f.id)&&f.status!=='demolish'&&!WALL_HUNG.has(f.type)&&f.type!=='wallcab'&&(!fxFilter||fxFilter(f)))ray(fxCorners(f),'fx',f);
  return best;}
const fxFrontPt=(f,off=0)=>({x:f.x+fxFront(f).x*(f.d/2+off),y:f.y+fxFront(f).y*(f.d/2+off)});
const isMicro=f=>/micro/i.test((f.lib||'')+' '+(f.name||''))&&!/hood or micro/i.test(f.name||'');
const isWallOven=f=>/a-wo-|c-oven/.test(f.lib||'')||(f.type==='tall'&&(f.cab||{}).layout==='oven');
const isCook=f=>f.type==='range';
const segPolyLen=(a,b,poly)=>{let n=0,L=0;const N=40;for(let i=0;i<N;i++){const t=(i+0.5)/N;if(inPoly(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,poly))n++;}return dist(a,b)*n/N;};
// kitchens and baths on a level: rooms with that use or holding the key fixtures; falls back to the whole level
function nkAreas(p,lvId,kind){const fx=(p.fixtures||[]).filter(f=>f.level===lvId&&f.status!=='demolish');const rooms=p.rooms.filter(r=>r.level===lvId);
  const key=kind==='kitchen'?(f=>f.type==='sinkbase'&&!/laund/.test(f.lib||'')||f.type==='range'):(f=>['toilet','tub','shower','rollin'].includes(f.type)||f.type==='lav'&&!/urinal|laundry|mop|df-/.test(f.lib||''));
  const out=[];const used=new Set();
  for(const r of rooms){const inside=fx.filter(f=>inPoly(f.x,f.y,r.pts));const hit=inside.some(key);if(r.use===kind||(hit&&!(kind==='bath'&&r.use==='kitchen')&&!(kind==='kitchen'&&r.use==='bath')&&r.use!=='laundry'&&r.use!=='garage')){if(!inside.some(key)&&r.use!==kind)continue;out.push({room:r,fx:inside});inside.forEach(f=>used.add(f.id));}}
  const rest=fx.filter(f=>!used.has(f.id)&&!rooms.some(r=>inPoly(f.x,f.y,r.pts)));if(rest.some(key))out.push({room:null,fx:rest});
  return out.filter(a=>a.fx.some(key));}
// counter length beside a fixture on one side (inches), following the countertop
function nkRun(f,counters,side){const sd=fxSide(f);const o={x:f.x+sd.x*side*(f.w/2+1),y:f.y+sd.y*side*(f.w/2+1)};let L=0;for(let s=0;s<144;s+=2){const q={x:o.x+sd.x*side*s,y:o.y+sd.y*side*s};if(counters.some(c=>inPoly(q.x,q.y,c.pts.map(v=>[v.x,v.y]))))L=s+2;else break;}return L;}
// counter directly across from a fixture front, within reach
function nkAcross(p,lvId,f,counters,max=48){const fr=fxFront(f);const a=fxFrontPt(f,1);for(let s=2;s<=max;s+=2){const q={x:a.x+fr.x*s,y:a.y+fr.y*s};if(counters.some(c=>inPoly(q.x,q.y,c.pts.map(v=>[v.x,v.y]))))return s;}return null;}
function doorSwingRect(p,o){const S=doorSides(p,o);if(!S)return null;const dt=o.dtype||'swing';if(['pocket','barn','bifold','slider','opening','garage','overhead'].includes(dt))return null;const t=S.w.thick/2,W=o.width;
  const P=(u,v)=>({x:S.c.x+S.d.x*u+S.sw.x*(t+v),y:S.c.y+S.d.y*u+S.sw.y*(t+v)});return {S,pts:[P(-W/2,0),P(W/2,0),P(W/2,W),P(-W/2,W)]};}
function areaDoors(p,lvId,room){if(!room)return [];return p.openings.filter(o=>o.type==='door'&&o.status!=='demolish').filter(o=>{const S=doorSides(p,o);return S&&S.w.level===lvId&&(S.into===room||S.from===room);});}

function nkbaKitchen(p,add){const K=nkbaOf(p);
  for(const lv of p.levels){const counters=counterGeo(p,lv.id);
   for(const A of nkAreas(p,lv.id,'kitchen')){const fx=A.fx;const T=f=>({kind:'fixture',id:f.id});const lvId=lv.id;const W=(code,t,title,detail,f,pt)=>add(t,NK(code,title.split(':')[0]),title,detail,T(f),pt||fxFrontPt(f),lvId);
    const sinks=fx.filter(f=>f.type==='sinkbase'&&!/laund/.test(f.lib||''));const sink=sinks.sort((a,b)=>b.w-a.w)[0];const cook=fx.find(isCook);const fridge=fx.find(f=>f.type==='fridge');const dw=fx.find(f=>f.type==='dw');
    const islands=fx.filter(f=>f.type==='island');const room=A.room;
    // 1 door/entry, 2 door interference
    for(const o of areaDoors(p,lvId,room)){const clear=o.width-2;const need=K.access?34:32;const c=openingCenter(p,o);
      if(clear<need-0.01)add('warn',NK('K1','Door/entry'),`Kitchen doorway is narrow`,`About ${fmtLen(clear)} clear opening; NKBA recommends at least ${need}" clear (a ${need===34?'3\'-0"':'2\'-10"'} door).`,{kind:'opening',id:o.id},c,lvId);
      const R=doorSwingRect(p,o);if(R&&R.S.into===room){const poly=R.pts.map(q=>[q.x,q.y]);for(const f of fx.filter(f=>['dw','range','fridge'].includes(f.type)||isWallOven(f))){const z=[fxFrontPt(f,1),fxFrontPt(f,18)];if(z.some(q=>inPoly(q.x,q.y,poly)))add('warn',NK('K2','Door interference'),`Door swings into the ${fxLabel(f).toLowerCase()} opening`,'An entry door and an appliance door should not run into each other. Move the door, change its swing, or use a pocket door.',{kind:'opening',id:o.id},c,lvId);}}}
    // 3 work triangle, 4 tall between centers, 5 traffic through the triangle
    if(sink&&cook&&fridge){const P=[fxFrontPt(sink),fxFrontPt(cook),fxFrontPt(fridge)];const a=dist(P[0],P[1])/12,b=dist(P[1],P[2])/12,c=dist(P[2],P[0])/12;const tot=a+b+c;
      if(tot>26)W('K3','warn','Work triangle is long',`Sink, cooking surface and refrigerator are ${tot.toFixed(1)} ft apart in total; NKBA recommends 26 ft or less.`,sink);
      for(const [d,lab,f] of [[a,'sink to cooking surface',sink],[b,'cooking surface to refrigerator',cook],[c,'refrigerator to sink',fridge]])if(d<4||d>9)W('K3','warn',`Work triangle leg ${d<4?'short':'long'}: ${lab}`,`${d.toFixed(1)} ft; NKBA recommends 4 to 9 ft for each leg.`,f);
      for(const isl of islands){const poly=fxCorners(isl).map(q=>[q.x,q.y]);for(const [u,v] of [[0,1],[1,2],[2,0]]){const L=segPolyLen(P[u],P[v],poly);if(L>12)W('K3','warn','Island cuts into the work triangle',`A triangle leg crosses the island for ${fmtLen(L)}; NKBA allows no more than 12".`,isl,{x:isl.x,y:isl.y});}}
      const tri=P.map(q=>[q.x,q.y]);
      for(const t of fx.filter(f=>f.type==='tall'&&f.h>=72&&f.d>=21&&!isWallOven(f))){const poly=fxCorners(t).map(q=>[q.x,q.y]);const ctr=[[sink,cook],[cook,fridge],[fridge,sink]];if(ctr.some(([m,n])=>segPolyLen({x:m.x,y:m.y},{x:n.x,y:n.y},poly)>2))W('K4','warn','Tall cabinet separates two work centers','NKBA recommends no full-height, full-depth tall cabinet between two primary work centers.',t,{x:t.x,y:t.y});}
      const ds=areaDoors(p,lvId,room).map(o=>openingCenter(p,o)).filter(Boolean);for(let i=0;i<ds.length;i++)for(let j=i+1;j<ds.length;j++){if(segPolyLen(ds[i],ds[j],tri)>24){add('warn',NK('K5','Work triangle traffic'),'Traffic path cuts through the work triangle','The straight path between two kitchen doors crosses the work triangle. Rearrange so through-traffic passes outside it.',T(sink),ds[i],lvId);i=ds.length;break;}}}
    // 6 work aisle, 7 walkway, 8 seating clearance, 9 knee space
    const needAisle=K.cooks>1?48:42;const faces=[];for(const f of fx.filter(f=>['base','sinkbase','dw','range','fridge','tall','island'].includes(f.type))){faces.push({f,side:1});if(f.type==='island')faces.push({f,side:-1});}
    const seen=new Set();
    for(const {f,side} of faces){const fr=fxFront(f);const dir={x:fr.x*side,y:fr.y*side};const off=f.type==='island'&&side===-1&&(f.cab||{}).seating?12:1;const pt={x:f.x+dir.x*(f.d/2+off),y:f.y+dir.y*(f.d/2+off)};
      const h=nkRay(p,lvId,pt,dir,[f.id],120,g=>g.type!=='filler');if(!h.kind)continue;const d=h.t;const k2=[f.id,h.f&&h.f.id].sort().join();
      if(f.type==='island'&&side===-1&&(f.cab||{}).seating){const need=K.access?36:32;if(d<need)W('K8','warn','Not enough room behind island seating',`${fmtLen(d)} from the seating edge to the nearest obstruction; NKBA recommends ${need}" with no traffic behind, ${K.access?'60':'36'}" to edge past and ${K.access?'60':'44'}" to walk past.`,f,pt);continue;}
      if(h.kind==='fx'&&BASE_RUN.has(h.f.type)||h.kind==='fx'&&['fridge','tall'].includes(h.f.type)){if(d<needAisle&&!seen.has(k2)){seen.add(k2);W('K6','warn','Work aisle is narrow',`${fmtLen(d)} between facing counters or appliances; NKBA recommends ${needAisle}" ${K.cooks>1?'for two cooks':'for one cook (48" for two)'}.`,f,pt);}}
      else if(h.kind==='wall'&&d<36)W('K7','warn','Walkway is narrow',`${fmtLen(d)} from the ${fxLabel(f).toLowerCase()} to the wall; NKBA recommends a 36" walkway.`,f,pt);}
    for(const isl of islands.filter(f=>(f.cab||{}).seating)){const top=(isl.elev||0)+isl.h;const needD=top<=31?18:top<=37?15:12;const ov=(isl.cab||{}).overhang??12;
      if(ov<needD)W('K9','warn','Seating knee space is shallow',`${fmtLen(ov)} overhang at a ${fmtLen(top)} high counter; NKBA recommends ${needD}" of knee space (18" at 30", 15" at 36", 12" at 42") and 24" of width per seat.`,isl,{x:isl.x,y:isl.y});}
    // 10-12 sink placement, landing, prep area
    for(const s of sinks){const l=nkRun(s,counters,-1),r=nkRun(s,counters,1);const big=Math.max(l,r),small=Math.min(l,r);
      if(s===sink){if(big<24||small<18)W('K11','warn','Sink landing area is short',`About ${fmtLen(l)} on one side and ${fmtLen(r)} on the other; NKBA recommends 24" on one side and 18" on the other.`,s);
        if(big<36)W('K12','warn','No 36" prep area next to the sink',`The longest counter beside the sink is ${fmtLen(big)}; NKBA recommends a continuous 36" wide by 24" deep work area next to it.`,s);}
      else if(big<18||small<3)W('K14','warn','Second sink needs counter beside it',`About ${fmtLen(l)} and ${fmtLen(r)}; NKBA recommends 3" on one side and 18" on the other.`,s);}
    // 13 dishwasher
    if(dw&&sink){const gap=dist(dw,sink)-(dw.w+sink.w)/2;if(gap>36)W('K13','warn','Dishwasher is far from the sink',`${fmtLen(gap)} between them; NKBA recommends the dishwasher edge within 36" of the sink edge.`,dw);
      const c=nkRay(p,lvId,fxFrontPt(dw,1),fxFront(dw),[dw.id],60);if(c.t<21)W('K13','warn','No standing room beside the open dishwasher',`${fmtLen(c.t)} in front of it; leave 21" of standing space beside the open door.`,dw);}
    // 15 waste
    const bins=fx.filter(f=>isCab(f)&&(cabLayout(f)==='trash'||((f.cab||{}).mods||{}).wbk)).length;if(sink&&bins<2)W('K15','tip',`Plan ${bins?'one more waste or recycling bin':'two waste and recycling bins'}`,'NKBA recommends two waste receptacles: one near the cleanup sink and one for recycling. Use a pull-out trash base or a waste-basket kit.',sink);
    // 16 refrigerator, 17 cooking surface, 18 clearance, 19 ventilation, 20 safety
    if(fridge){const l=nkRun(fridge,counters,-1),r=nkRun(fridge,counters,1);const ac=nkAcross(p,lvId,fridge,counters,48);if(Math.max(l,r)<15&&ac==null)W('K16','warn','Refrigerator needs a landing area','Provide 15" of counter on the handle side, or across from the front within 48".',fridge);}
    if(cook){const l=nkRun(cook,counters,-1),r=nkRun(cook,counters,1);if(Math.min(l,r)<12||Math.max(l,r)<15)W('K17','warn','Cooking surface needs landing area',`About ${fmtLen(l)} and ${fmtLen(r)}; NKBA recommends 12" on one side and 15" on the other.`,cook);
      if(islands.some(i=>inPoly(cook.x,cook.y,fxCorners(i).map(q=>[q.x,q.y])))){const back=nkRun({...cook,rot:(cook.rot||0)+90,w:cook.d},counters,-1);if(back<9)W('K17','warn','Island cooktop needs counter behind it','NKBA recommends 9" of countertop behind a cooking surface on an island or peninsula, at the same height.',cook);}
      const above=fx.filter(f=>f.type==='wallcab'&&rectsOverlap(fxCorners(f),fxCorners(cook)));const hood=above.find(f=>/hood|micro/i.test((f.lib||'')+(f.name||'')));
      for(const w of above){const gap=(w.elev||0)-cook.h;if(gap<30&&w!==hood)W('K18','warn','Cabinet too close above the cooking surface',`${fmtLen(gap)} to the cabinet above; allow 30" to unprotected combustibles (24" with a listed hood), per the appliance instructions and IRC M1901.1.`,w,{x:w.x,y:w.y});}
      if(!hood&&!(p.elec||[]).some(e=>e.level===lvId&&/hood/.test(e.type)&&dist(e,cook)<48))W('K19','warn','No hood over the cooking surface','NKBA recommends a ducted hood of at least 150 cfm. Add a range hood or microwave hood above it.',cook);
      for(const o of p.openings.filter(o=>o.type==='window')){const c=openingCenter(p,o);if(!c||c.w.level!==lvId)continue;const along=Math.abs((cook.x-c.x)*wdir(c.w).x+(cook.y-c.y)*wdir(c.w).y);if(along<(o.width+cook.w)/2&&dist(c,cook)<cook.d/2+c.w.thick+6)W('K20','warn','Cooking surface under a window','NKBA recommends no cooking surface below an operable window: curtains and reaching over burners are fire risks.',cook);}}
    if(sink)W('K20','tip','Fire extinguisher','Keep a fire extinguisher near the kitchen exit, 15" to 48" off the floor, away from the cooking surface.',sink);
    // 21 microwave, 23 oven landing
    for(const m of fx.filter(isMicro)){const b=m.elev||0;if(b>54)W('K21','warn','Microwave is mounted high',`Bottom at ${fmtLen(b)}; NKBA recommends 3" below the main cook's shoulder and no more than 54" off the floor.`,m,{x:m.x,y:m.y});else if(b>0&&b<15)W('K21','warn','Microwave is too low',`Bottom at ${fmtLen(b)}; an under-counter microwave should sit at least 15" off the floor.`,m,{x:m.x,y:m.y});}
    for(const o of fx.filter(isWallOven)){const l=nkRun(o,counters,-1),r=nkRun(o,counters,1);if(Math.max(l,r)<15&&nkAcross(p,lvId,o,counters,48)==null)W('K23','warn','Wall oven needs a landing area','NKBA recommends 15" of counter next to the oven, or across from it within 48" (not opening into a walkway).',o);}
    // 25 frontage and clearance above, 26 edges
    const myCtr=counters.filter(c=>fx.some(f=>inPoly(f.x,f.y,c.pts.map(q=>[q.x,q.y]))));const frontage=myCtr.reduce((s,c)=>s+c.area/24,0);
    if(sink&&frontage<158)W('K25','warn','Not much countertop',`About ${Math.round(frontage)}" of 24"-deep countertop; NKBA recommends at least 158" of frontage.`,sink);
    for(const w of fx.filter(f=>f.type==='wallcab'&&!/hood|micro|bridge/i.test((f.lib||'')+(f.name||'')))){const under=myCtr.find(c=>inPoly(w.x,w.y,c.pts.map(q=>[q.x,q.y]))||inPoly(w.x+fxFront(w).x*8,w.y+fxFront(w).y*8,c.pts.map(q=>[q.x,q.y])));if(under){const gap=(w.elev||0)-(under.top+under.thick*0);if(gap<15)W('K25','warn','Wall cabinet is low over the counter',`${fmtLen(gap)} from the countertop; NKBA recommends 15" of clearance above countertops.`,w,{x:w.x,y:w.y});}}
    if(islands.length&&(counterSet(p).edge==='eased'||counterSet(p).edge==='mitered'))W('K26','tip','Round the island corners','NKBA recommends clipped or rounded corners on countertops, especially islands in a walkway.',islands[0],{x:islands[0].x,y:islands[0].y});
    // 27 storage frontage, 29 corner storage
    const area=room?polyArea(room.pts)/144:0;const need=area>350?2000:area>150?1700:1400;let fr=0;
    for(const f of fx.filter(isCab)){const L=cabLayout(f);const w=f.w;if(f.type==='wallcab')fr+=w*(f.h>=36?4:f.h>=30?3:f.h>=24?2:1);else if(f.type==='tall')fr+=w*(isWallOven(f)?2:5);else if(['base','island','vanity'].includes(f.type))fr+=w*(/drawers4/.test(L)?4:/drawers3/.test(L)?3:L==='door-drawer'?3:L==='trash'||L==='open-knee'?0:2)+w*((f.cab||{}).mods?.rot||0);else if(f.type==='sinkbase')fr+=w*1;}
    if(sink&&fr&&fr<need)W('K27','warn','Storage is short of the NKBA target',`About ${Math.round(fr)}" of shelf and drawer frontage (estimated); NKBA recommends ${need}" for a ${area>350?'large (over 350 SF)':area>150?'medium (151 to 350 SF)':'small (under 150 SF)'} kitchen.`,sink);
    for(const b of fx.filter(f=>/c-blind/.test(f.lib||'')&&!((f.cab||{}).mods||{}).bco))W('K29','tip','Blind corner without a storage device','NKBA recommends at least one corner cabinet with a functional storage device. Add a blind-corner pull-out or use a lazy Susan.',b,{x:b.x,y:b.y});
    // 30 receptacles, 31 lighting
    const E=(p.elec||[]).filter(e=>e.level===lvId&&(!room||inPoly(e.x,e.y,room.pts)));
    if(sink&&myCtr.length&&!E.some(e=>e.type==='counter'||e.type==='gfci'))W('K30','warn','No countertop receptacles','Countertop receptacles need GFCI protection, and no point along a counter wall may be more than 24" from one (IRC E3901.4). Use the Electric tool to add them.',sink);
    if(fx.some(f=>f.type==='wallcab')&&!E.some(e=>e.type==='undercab'))W('K31','warn','No task lighting under the wall cabinets','NKBA recommends task lighting at every work surface. Add under-cabinet lights.',fx.find(f=>f.type==='wallcab'),null);
    if(room){const glaz=p.openings.filter(o=>o.type==='window'&&o.status!=='demolish').filter(o=>{const S=doorSides(p,o);return S&&(S.into===room||S.from===room);}).reduce((s,o)=>s+o.width*o.height/144,0);if(area&&glaz<area*0.08)add('warn',NK('K31','Lighting'),'Kitchen window area is small',`${glaz.toFixed(1)} SF of glass for ${Math.round(area)} SF of floor; NKBA recommends window area of at least 8% of the floor area (IRC R303.1).`,{kind:'room',id:room.id},{x:polyLabelPt(room.pts)[0],y:polyLabelPt(room.pts)[1]},lvId);}
   }}}

function nkbaBath(p,add){const K=nkbaOf(p);
  for(const lv of p.levels){const lvId=lv.id;
   for(const A of nkAreas(p,lvId,'bath')){const fx=A.fx;const room=A.room;const T=f=>({kind:'fixture',id:f.id});const W=(code,sev,title,detail,f,pt)=>add(sev,NK(code,title.split(':')[0]),title,detail,T(f),pt||fxFrontPt(f),lvId);
    for(const o of areaDoors(p,lvId,room)){const clear=o.width-2;const need=K.access?34:32;if(clear<need-0.01)add('warn',NK('B-door','Bath doorway'),'Bathroom doorway is narrow',`About ${fmtLen(clear)} clear; NKBA recommends at least ${need}" clear.`,{kind:'opening',id:o.id},openingCenter(p,o),lvId);
      const R=doorSwingRect(p,o);if(R&&R.S.into===room){const poly=R.pts.map(q=>[q.x,q.y]);for(const f of fx.filter(f=>['toilet','lav','vanity','tub','shower'].includes(f.type)))if(fxCorners(f).some(q=>inPoly(q.x,q.y,poly))||inPoly(f.x,f.y,poly))add('warn',NK('B-door','Door interference'),'Door swings into a fixture','NKBA recommends that no entry door interfere with a fixture or its clear floor space. Swing the door out, or use a pocket door.',{kind:'opening',id:o.id},openingCenter(p,o),lvId);}}
    for(const f of fx){const rayF=(off=1)=>nkRay(p,lvId,fxFrontPt(f,off),fxFront(f),[f.id],120).t;
      if(['toilet','lav','vanity','tub','shower'].includes(f.type)&&!/urinal|laundry|mop|df-/.test(f.lib||'')){const c=rayF();const code={toilet:21,lav:21,vanity:21,tub:21,shower:24}[f.type];if(c<30)W('B-clear',c<code?'warn':'tip',`Clear floor space in front of the ${fxLabel(f).toLowerCase()}`,`${fmtLen(c)} in front; NKBA recommends 30" (code minimum ${code}").`,f);}
      if(f.type==='toilet'&&!/bidet/.test(f.lib||'')){const sd=fxSide(f);const m=Math.min(...[-1,1].map(s=>nkRay(p,lvId,{x:f.x,y:f.y},{x:sd.x*s,y:sd.y*s},[f.id],60,g=>g.type!=='filler').t));if(m<18)W('B-wc','warn','Toilet is close to a side wall or fixture',`${fmtLen(m)} from the toilet centerline; NKBA recommends 18" (code minimum 15").`,f,{x:f.x,y:f.y});}
      if(f.type==='lav'||f.type==='vanity'){const n=f.type==='vanity'&&f.w>=60?2:1;const sd=fxSide(f);const bowls=n===2?[-f.w/4,f.w/4]:[0];
        for(const b of bowls){const c=fxLocal(f,b,0);const m=Math.min(...[-1,1].map(s=>nkRay(p,lvId,c,{x:sd.x*s,y:sd.y*s},[f.id],60,g=>['tall','shower','tub'].includes(g.type)).t));if(m<20)W('B-lav','warn','Sink is close to a side wall',`${fmtLen(m)} from the sink centerline to the nearest wall or tall object; NKBA recommends 20" (code minimum 15").`,f,c);}
        if(n===2&&f.w/2<36)W('B-lav2','warn','Double sinks are close together',`${fmtLen(f.w/2)} between bowl centers; NKBA recommends 36" (code minimum 30").`,f,{x:f.x,y:f.y});
        const top=(f.elev||0)+f.h+(f.type==='vanity'?1.25:0);if(top<32||top>43)W('B-lav','tip','Vanity height',`Counter at ${fmtLen(top)}; NKBA suggests 32" to 43", about 3" below the user's elbow.`,f,{x:f.x,y:f.y});}
      if(f.type==='shower'&&!/mop/.test(f.lib||'')){const a=Math.min(f.w,f.d),b=Math.max(f.w,f.d);if(a<36)W('B-shower','warn','Shower is small',`${fmtLen(f.w)} x ${fmtLen(f.d)} inside; NKBA recommends at least 36" x 36" (code minimum 30" x 30", 900 sq in).`,f,{x:f.x,y:f.y});}}
    const lavs=fx.filter(f=>f.type==='lav'&&!/urinal|laundry|mop|df-/.test(f.lib||''));for(let i=0;i<lavs.length;i++)for(let j=i+1;j<lavs.length;j++){const d=dist(lavs[i],lavs[j]);if(d<36)W('B-lav2','warn','Two sinks are close together',`${fmtLen(d)} between sink centers; NKBA recommends 36".`,lavs[i]);}
    if(room){const xs=room.pts.map(q=>q[0]),ys=room.pts.map(q=>q[1]);const a=Math.min(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)),b=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));
      if(fx.length&&fx.every(f=>f.type==='toilet'||WALL_HUNG.has(f.type))&&(a<36||b<66))add('warn',NK('B-wc','Toilet compartment'),'Toilet compartment is small',`${fmtLen(a)} x ${fmtLen(b)}; NKBA recommends 36" x 66" (code minimum 30" x 60").`,{kind:'room',id:room.id},{x:polyLabelPt(room.pts)[0],y:polyLabelPt(room.pts)[1]},lvId);
      const ctr={x:polyLabelPt(room.pts)[0],y:polyLabelPt(room.pts)[1]};const any=fx.find(f=>['toilet','tub','shower'].includes(f.type));
      if(any)add('tip',NK('B-backing','Grab bar backing'),'Block the walls for grab bars','Install solid blocking at the toilet, tub and shower walls now, so grab bars can be added later (NKBA; ICC A117.1 604/607/608).',T(any),ctr,lvId);
      if(any&&(any.type==='tub'||any.type==='shower'))add('tip',NK('B-valve','Shower controls'),'Shower and tub controls',`Place controls 38" to 48" high, offset toward the room, reachable from outside the spray; use pressure-balance or thermostatic valves (IRC P2708.4).`,T(any),ctr,lvId);}
   }}}
// replaces the earlier partial set
nkbaChecks=function(p,add){if(!nkbaOf(p).on)return;try{nkbaKitchen(p,add);}catch(e){console.warn('NKBA kitchen',e);}try{nkbaBath(p,add);}catch(e){console.warn('NKBA bath',e);}};
function NkbaSettings({p,commit}){const K=nkbaOf(p);const set=patch=>commit({...p,settings:{...p.settings,nkba:{...K,...patch}}});
  return html`<div className="nkba-set"><label className="check"><input id="p-nkba" type="checkbox" checked=${K.on} onChange=${e=>set({on:e.target.checked})}/> NKBA kitchen and bath planning guidelines</label>
    ${K.on?html`<div><${Field} label="Cooks at once" id="nk-c"><${Sel} id="nk-c" value=${String(K.cooks)} onChange=${v=>set({cooks:+v})} options=${[['1','One (42" aisles)'],['2','Two or more (48" aisles)']]}/><//>
      <label className="check"><input type="checkbox" checked=${K.access} onChange=${e=>set({access:e.target.checked})}/> Use Access Standard values</label></div>`:null}</div>`;}
