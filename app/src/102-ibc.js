/* ======================= 2021 IBC checks (commercial and city buildings) ======================= */
// Planning-level means-of-egress, occupant load and plumbing-fixture checks for buildings that fall under the IBC
// rather than the IRC. Values come from IBC 2021 Chapters 10, 12 and 29 for the common cases; local amendments
// can be entered as rule overrides.
const IBC_RULES=[
  {id:'ibcCeiling',set:'IBC',code:'1208.2',title:'Ceiling height, occupiable spaces',unit:'in',value:90},
  {id:'ibcDoorClear',set:'IBC',code:'1010.1.1',title:'Egress door clear width',unit:'in',value:32},
  {id:'ibcDoorH',set:'IBC',code:'1010.1.1',title:'Egress door height',unit:'in',value:80},
  {id:'ibcCorridor',set:'IBC',code:'1020.3',title:'Corridor width, 50 or more occupants',unit:'in',value:44},
  {id:'ibcCorridorSmall',set:'IBC',code:'1020.3',title:'Corridor width, under 50 occupants',unit:'in',value:36},
  {id:'ibcRoomOneExit',set:'IBC',code:'1006.2.1',title:'Most occupants in a room with one exit door',unit:'people',value:49},
  {id:'ibcDoorWPer',set:'IBC',code:'1005.3.2',title:'Door egress width per occupant (no sprinklers)',unit:'in',value:0.2},
  {id:'ibcDoorWPerSpr',set:'IBC',code:'1005.3.2 Exc.',title:'Door egress width per occupant (sprinklered)',unit:'in',value:0.15},
  {id:'ibcStairWPer',set:'IBC',code:'1005.3.1',title:'Stair egress width per occupant (no sprinklers)',unit:'in',value:0.3},
  {id:'ibcRiser',set:'IBC',code:'1011.5.2',title:'Stair riser height, maximum',unit:'in',value:7},
  {id:'ibcTread',set:'IBC',code:'1011.5.2',title:'Stair tread depth, minimum',unit:'in',value:11},
  {id:'ibcStairW',set:'IBC',code:'1011.2',title:'Stair width, minimum',unit:'in',value:44},
  {id:'ibcSepRatio',set:'IBC',code:'1007.1.1',title:'Exit separation, fraction of the diagonal (no sprinklers)',unit:'ratio',value:0.5},
  {id:'ibcSepRatioSpr',set:'IBC',code:'1007.1.1 Exc. 2',title:'Exit separation, fraction of the diagonal (sprinklered)',unit:'ratio',value:0.333},
];
RULES.push(...IBC_RULES);

// Occupancy groups offered, with travel distance (Table 1017.2), single-exit limits (Table 1006.3.4(2)) and
// plumbing-fixture ratios (Table 2902.1). Fixture ratios are people per fixture; first/then split where the table does.
const OCCUPANCIES={
  B:{label:'B: Business (offices, city hall, clinics)',travel:200,travelSpr:300,oneExit:{load:49,travel:75},
    wc:[[50,25],[Infinity,50]],lav:[[80,40],[Infinity,80]],df:100,lf:150},
  'A-3':{label:'A-3: Assembly (meeting rooms, community center)',travel:200,travelSpr:250,oneExit:{load:49,travel:75},
    wcSplit:{m:125,f:65},lav:[[Infinity,200]],df:500,lf:15},
  M:{label:'M: Mercantile (stores)',travel:200,travelSpr:250,oneExit:{load:49,travel:75},
    wc:[[Infinity,500]],lav:[[Infinity,750]],df:1000,lf:60},
  E:{label:'E: Educational',travel:200,travelSpr:250,oneExit:{load:49,travel:75},
    wc:[[Infinity,50]],lav:[[Infinity,50]],df:100,lf:20},
  S:{label:'S-1: Storage or shop (public works garage)',travel:200,travelSpr:250,oneExit:{load:29,travel:100},
    wc:[[Infinity,100]],lav:[[Infinity,100]],df:1000,lf:300},
};
// Occupant load factors by room use, IBC Table 1004.5 (sq ft per person; net where the table says net).
const LOAD_FACTOR={office:[150,'gross','Business areas'],assembly:[15,'net','Assembly, tables and chairs'],seating:[7,'net','Assembly, chairs only'],
  classroom:[20,'net','Classroom'],retail:[60,'gross','Mercantile'],storage:[300,'gross','Storage, stock, shipping'],shop:[100,'gross','Industrial areas'],
  kitchen:[200,'gross','Kitchen, commercial'],living:[150,'gross','Business areas'],dining:[15,'net','Assembly, tables and chairs'],
  bedroom:[200,'gross','Residential'],garage:[200,'gross','Parking garage'],other:[150,'gross','Business areas']};
const NO_LOAD=new Set(['hall','corridor','bath','restroom','closet','laundry']);

function ibcSettings(p){const s=p.settings||{};return {on:s.code==='ibc',occ:OCCUPANCIES[s.occupancy]?s.occupancy:'B',spr:!!s.sprinklered};}
function fixtureNeed(table,load){if(!load)return 0;let need=0,left=load,prevCap=0;
  for(const [upTo,per] of table){const chunk=Math.min(left,upTo-prevCap);if(chunk<=0)break;need+=chunk/per;left-=chunk;prevCap=upTo;}
  return Math.max(1,Math.ceil(need-1e-9));}
function ibcAnalysis(p){
  const S=ibcSettings(p);const O=OCCUPANCIES[S.occ];const lvls=sortedLevels(p);const rooms=[];
  for(const r of p.rooms){const area=polyArea(r.pts)/144;const lf=NO_LOAD.has(r.use)?null:(LOAD_FACTOR[r.use]||[O.lf,'gross','Default for the occupancy']);
    rooms.push({r,area,lf,load:lf?Math.ceil(area/lf[0]-1e-9):0});}
  const byLevel=lvls.map(l=>({lv:l,load:rooms.filter(x=>x.r.level===l.id).reduce((s,x)=>s+x.load,0),area:rooms.filter(x=>x.r.level===l.id).reduce((s,x)=>s+x.area,0)}));
  const total=byLevel.reduce((s,x)=>s+x.load,0);
  const exitsFor=n=>n<=500?2:n<=1000?3:4;
  const wc=O.wcSplit?Math.ceil(total/2/O.wcSplit.m-1e-9)+Math.ceil(total/2/O.wcSplit.f-1e-9):fixtureNeed(O.wc,total);
  const lav=fixtureNeed(O.lav,total);
  const fx=(p.fixtures||[]).filter(f=>f.status!=='demolish');
  const have={wc:fx.filter(f=>f.type==='toilet').length,lav:fx.filter(f=>f.type==='lav'||f.type==='vanity').length};
  return {S,O,rooms,byLevel,total,exitsFor,need:{wc:total?wc:0,lav:total?lav:0,df:total?Math.max(1,Math.ceil(total/O.df-1e-9)):0,service:total?1:0},have,
    separate:total>15};
}
function ibcChecks(p,add){
  const A=ibcAnalysis(p);const {S,O}=A;const lvls=sortedLevels(p);const first=lvls[0];if(!first)return A;const marks=openingMarks(p);
  const R=(code,title)=>({set:'IBC',code,title});
  // ceiling heights and room exits
  for(const x of A.rooms){const r=x.r;const lv=lvlOf(p,r.level);if(!lv)continue;const c=polyLabelPt(r.pts);const pt={x:c[0],y:c[1]};const T={kind:'room',id:r.id};
    if(!['closet','storage','garage','bath','restroom'].includes(r.use)&&lv.height<rv(p,'ibcCeiling')-0.01)add('error','ibcCeiling',`${r.name}: ceiling too low`,`Ceiling ${fmtLen(lv.height)}; occupiable spaces need ${fmtLen(rv(p,'ibcCeiling'))}.`,T,pt,r.level);
    const doors=roomOpenings(p,r).filter(o=>o.type==='door');
    if(x.load>rv(p,'ibcRoomOneExit')&&doors.length<2)add('error','ibcRoomOneExit',`${r.name}: needs two exit doors`,`${x.load} occupants (${Math.round(x.area)} sq ft at ${x.lf[0]} ${x.lf[1]} per person). Rooms over ${rv(p,'ibcRoomOneExit')} need two doors, spaced apart.`,T,pt,r.level);
    if((r.use==='hall'||r.use==='corridor')&&isRect(r.pts)){const m=Math.min(...rectDims(r.pts))-4.5;const need=A.total>=50?rv(p,'ibcCorridor'):rv(p,'ibcCorridorSmall');
      if(m<need-0.01)add('error',A.total>=50?'ibcCorridor':'ibcCorridorSmall',`${r.name}: corridor too narrow`,`About ${fmtLen(m)} clear; needs ${fmtLen(need)} for ${A.total} occupants.`,T,pt,r.level);}}
  // doors
  for(const o of p.openings.filter(o=>o.type==='door')){const c=openingCenter(p,o);if(!c)continue;const clear=o.width-DOOR_STOP_LOSS;const mk=marks[o.id]||'Door';
    if(clear<rv(p,'ibcDoorClear')-0.01)add('error','ibcDoorClear',`${mk}: egress door too narrow`,`About ${fmtLen(clear)} clear; needs ${fmtLen(rv(p,'ibcDoorClear'))}. Use a 36" door.`,{kind:'opening',id:o.id},c,c.w.level);
    if(o.height<rv(p,'ibcDoorH')-0.01)add('error','ibcDoorH',`${mk}: door too short`,`${fmtLen(o.height)} high; needs ${fmtLen(rv(p,'ibcDoorH'))}.`,{kind:'opening',id:o.id},c,c.w.level);}
  // exits from the building (first floor exterior doors)
  const ext=p.openings.filter(o=>{if(o.type!=='door')return false;const w=p.walls.find(w=>w.id===o.wall);return w&&w.kind==='exterior'&&w.status!=='demolish'&&w.level===first.id;});
  const B=planBounds(p,first.id);const diag=Math.hypot(B.x1-B.x0,B.y1-B.y0);
  // travel distance: farthest room corner to the nearest exit, walking along x then y (conservative stand-in for the real path)
  let worst=0,worstRoom=null;
  if(ext.length)for(const x of A.rooms.filter(x=>x.r.level===first.id))for(const q of x.r.pts){const d=Math.min(...ext.map(o=>{const c=openingCenter(p,o);return Math.abs(c.x-q[0])+Math.abs(c.y-q[1]);}));if(d>worst){worst=d;worstRoom=x.r;}}
  const lim=(S.spr?O.travelSpr:O.travel)*12;
  const oneExitOK=A.byLevel[0].load<=O.oneExit.load&&worst<=O.oneExit.travel*12&&lvls.length===1;
  const needExits=oneExitOK?1:A.exitsFor(Math.max(1,A.byLevel[0].load));
  if(p.walls.length){
    if(ext.length<needExits)add('error',R('1006.3.3','Number of exits per story'),`Needs ${needExits} exits to the outside`,`${A.byLevel[0].load} occupants on the first floor${oneExitOK?'':`; one exit is allowed only for ${O.oneExit.load} or fewer people with no more than ${O.oneExit.travel} ft of travel (Table 1006.3.4(2))`}. Found ${ext.length}.`,null,null,first.id);
    if(ext.length>=2&&needExits>=2){let best=0;for(let i=0;i<ext.length;i++)for(let j=i+1;j<ext.length;j++){const a=openingCenter(p,ext[i]),b=openingCenter(p,ext[j]);best=Math.max(best,Math.hypot(a.x-b.x,a.y-b.y));}
      const ratio=S.spr?rv(p,'ibcSepRatioSpr'):rv(p,'ibcSepRatio');
      if(best<ratio*diag-0.5)add('error',S.spr?'ibcSepRatioSpr':'ibcSepRatio','Exits are too close together',`The farthest-apart exits are ${fmtLen(best)} apart; they must be at least ${S.spr?'1/3':'1/2'} of the building diagonal (${fmtLen(ratio*diag)}).`,{kind:'opening',id:ext[0].id},openingCenter(p,ext[0]),first.id);}
    const per=S.spr?rv(p,'ibcDoorWPerSpr'):rv(p,'ibcDoorWPer');const needW=A.byLevel[0].load*per;const haveW=ext.reduce((s,o)=>s+Math.max(0,o.width-DOOR_STOP_LOSS),0);
    if(ext.length&&haveW<needW-0.01)add('error',S.spr?'ibcDoorWPerSpr':'ibcDoorWPer','Exit doors too narrow for the occupant load',`${A.byLevel[0].load} people x ${per}" = ${fmtLen(needW)} of door width needed; exterior doors give about ${fmtLen(haveW)} clear.`,null,null,first.id);
    if(worst>lim)add('error',R('1017.2','Exit access travel distance'),'Travel distance to an exit too long',`From the far corner of ${worstRoom?.name||'a room'} it is about ${Math.round(worst/12)} ft (walking along the walls); the limit is ${lim/12} ft${S.spr?' with sprinklers':' without sprinklers'}.`,worstRoom?{kind:'room',id:worstRoom.id}:null,null,first.id);
    else if(worst>lim*0.85)add('warn',R('1017.2','Exit access travel distance'),'Travel distance close to the limit',`About ${Math.round(worst/12)} ft of a ${lim/12} ft limit. Check the real walking path.`,worstRoom?{kind:'room',id:worstRoom.id}:null,null,first.id);
    // upper floors need stairs as exits
    for(const l of A.byLevel.slice(1)){if(!l.load)continue;const st=p.stairs.filter(s=>{const to=levelAbove(p,lvlOf(p,s.level)||l.lv);return to&&to.id===l.lv.id;});const need=l.load<=O.oneExit.load?1:A.exitsFor(l.load);
      if(st.length<need)add('error',R('1006.3.3','Number of exits per story'),`${l.lv.name}: needs ${need} exit stair${need>1?'s':''}`,`${l.load} occupants on this floor; found ${st.length} stair${st.length===1?'':'s'} reaching it.`,null,null,l.lv.id);
      const sw=l.load*rv(p,'ibcStairWPer');for(const s of st)if(s.width<Math.max(rv(p,'ibcStairW'),sw/Math.max(1,st.length))-0.01)add('error','ibcStairW','Exit stair too narrow',`${fmtLen(s.width)} wide; needs ${fmtLen(Math.max(rv(p,'ibcStairW'),sw/Math.max(1,st.length)))}.`,{kind:'stair',id:s.id},{x:s.x,y:s.y},s.level);}}
  for(const s of p.stairs){const si=stairInfo(p,s);const T={kind:'stair',id:s.id};const pt={x:s.x,y:s.y};
    if(si.riserH>rv(p,'ibcRiser')+1e-6)add('error','ibcRiser','Stair risers too tall',`${si.risers} risers at ${fmtLen(si.riserH)}; max ${fmtLen(rv(p,'ibcRiser'))}.`,T,pt,s.level);
    if(s.tread<rv(p,'ibcTread')-1e-6)add('error','ibcTread','Stair treads too shallow',`${fmtLen(s.tread)} treads; need ${fmtLen(rv(p,'ibcTread'))}.`,T,pt,s.level);}
  // plumbing fixtures
  if(A.total){const R29=R('2902.1','Minimum plumbing fixtures');
    if(A.have.wc<A.need.wc)add('error',R29,'Not enough toilets',`${A.total} occupants (${S.occ}) need ${A.need.wc} water closet${A.need.wc>1?'s':''}${A.separate?', split between men\'s and women\'s rooms':''}; ${A.have.wc} drawn.`,null,null,first.id);
    if(A.have.lav<A.need.lav)add('error',R29,'Not enough lavatories',`${A.total} occupants need ${A.need.lav} lavator${A.need.lav>1?'ies':'y'}; ${A.have.lav} drawn.`,null,null,first.id);
    add('info',R29,'Drinking fountain and service sink',`Provide ${A.need.df} drinking fountain${A.need.df>1?'s':''} (a hi-lo pair counts for accessibility) and 1 service sink. These are not drawn as fixtures yet.`,null,null,first.id);
    if(A.separate&&A.have.wc<2)add('warn',R('2902.2','Separate facilities'),'Separate restrooms required',`Over 15 occupants: provide separate facilities for each sex, or single-user restrooms.`,null,null,first.id);}
  return A;
}
function IbcSummary({p}){
  const A=ibcAnalysis(p);const O=A.O;
  return html`<div className="sec"><h3>Code analysis (2021 IBC)</h3>
    <div className="stat"><span>Occupancy</span><span>${A.S.occ}${A.S.spr?' · sprinklered':''}</span></div>
    ${A.byLevel.map(l=>html`<div key=${l.lv.id} className="stat"><span>${l.lv.name} occupant load</span><span className="mono">${l.load}</span></div>`)}
    <div className="stat"><span>Exits required, first floor</span><span className="mono">${A.byLevel[0]&&A.byLevel[0].load<=O.oneExit.load?'1 (if travel ≤ '+O.oneExit.travel+' ft)':A.exitsFor(Math.max(1,A.byLevel[0]?.load||0))}</span></div>
    <div className="stat"><span>Travel distance limit</span><span className="mono">${A.S.spr?O.travelSpr:O.travel} ft</span></div>
    <div className="stat"><span>Toilets · lavatories needed</span><span className="mono">${A.need.wc} · ${A.need.lav} (have ${A.have.wc} · ${A.have.lav})</span></div>
    <div className="stat"><span>Drinking fountains · service sink</span><span className="mono">${A.need.df} · ${A.need.service}</span></div>
    <p className="note">Occupant loads use IBC Table 1004.5 by room use. Rooms marked hall, corridor, bath or closet carry no separate load. Planning check only; the building official makes the final call.</p></div>`;
}
