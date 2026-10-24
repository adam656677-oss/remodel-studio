/* ======================= systems: energy code, heating and cooling loads, electrical service, plumbing sizing ======================= */
// Planning calculations, not stamped designs. Values follow the 2021 IRC / IECC prescriptive tables, NEC 220.82 and IRC chapter 29-30.
const CZ={ // 2021 IRC Table N1102.1.2 (fenestration U, skylight U, SHGC, ceiling R, wall options [cavity, continuous], floor R, slab R and depth, crawl wall)
  '1A':{fen:0.50,sky:0.75,shgc:0.25,ceil:30,wall:[[13,0],[0,10]],floor:13,slab:[0,0],ach:5,heat:45,cool:94,label:'1A (south Florida)'},
  '2A':{fen:0.40,sky:0.65,shgc:0.25,ceil:49,wall:[[13,0],[0,10]],floor:13,slab:[0,0],ach:5,heat:32,cool:95,label:'2A (Gulf coast, south Louisiana)'},
  '3A':{fen:0.30,sky:0.55,shgc:0.25,ceil:49,wall:[[20,0],[13,5],[0,15]],floor:19,slab:[10,24],ach:3,heat:23,cool:95,label:'3A (Mississippi, Alabama, Georgia)'},
  '4A':{fen:0.30,sky:0.55,shgc:0.40,ceil:60,wall:[[20,5],[13,10],[0,15]],floor:19,slab:[10,48],ach:3,heat:15,cool:93,label:'4A (Tennessee, Kentucky, Virginia)'},
  '5A':{fen:0.30,sky:0.55,shgc:null,ceil:60,wall:[[20,5],[13,10],[0,15]],floor:30,slab:[10,48],ach:3,heat:5,cool:90,label:'5A (Ohio, Illinois, Pennsylvania)'}};
const DUCTS=[['attic','In a vented attic'],['crawl','In a vented crawlspace'],['inside','Inside the conditioned space']];
function energyOf(p){const z=(p.settings?.energy?.zone)||'3A';const c=CZ[z]||CZ['3A'];
  return {zone:z,wallCav:c.wall[1]?.[0]??c.wall[0][0],wallCi:c.wall[1]?.[1]??c.wall[0][1],ceil:c.ceil,floor:c.floor,slab:c.slab[0],winU:c.fen,shgc:c.shgc??0.40,skyU:c.sky,doorU:0.20,ach50:c.ach,
    tHeat:c.heat,tCool:c.cool,inHeat:70,inCool:75,grains:55,ducts:'attic',check:false,people:null,...(p.settings?.energy||{})};}
const setEnergy=(p,patch)=>({...p,settings:{...p.settings,energy:{...(p.settings?.energy||{}),...patch}}});
function wallU(cav,ci){const Rx=2.54;const wood=cav>15?6.88:4.38;const Reff=1/(0.75/(cav+Rx)+0.25/(wood+Rx))+ci;return 1/Reff;}
const ceilU=R=>1.07/(R+1.4), floorU=R=>1/(R+2.6);
// outward compass bearing (0 = north, 90 = east) of an exterior wall
function wallFacing(p,w){const ol=buildingOutline(p,w.level);const d=wdir(w);let n={x:-d.y,y:d.x};const m={x:(w.x1+w.x2)/2,y:(w.y1+w.y2)/2};
  if(ol&&inPoly(m.x+n.x*(w.thick/2+8),m.y+n.y*(w.thick/2+8),ol.pts.map(q=>[q.x,q.y])))n={x:-n.x,y:-n.y};
  const b=(Math.atan2(n.x,-n.y)*180/Math.PI+(siteOf(p).bearing||0)+360)%360;return {n,deg:b,dir:['N','NE','E','SE','S','SW','W','NW'][Math.round(b/45)%8]};}
const SOLAR={N:35,NE:90,E:140,SE:110,S:70,SW:110,W:140,NW:90}; // peak gain per sq ft of glass at SHGC 1.0
/* ---- the building shell, room by room ---- */
function shellOf(p){const E=energyOf(p);const lvs=sortedLevels(p);const top=lvs[lvs.length-1],low=lvs[0];const F=foundOf(p);
  const extW=p.walls.filter(w=>w.kind==='exterior'&&w.status!=='demolish');const isUncond=r=>['garage','porch'].includes(r.use);
  const rooms=p.rooms.filter(r=>!isUncond(r)&&lvlOf(p,r.level));const items=[];
  for(const r of rooms){const lv=lvlOf(p,r.level);const H=r.ceilingH||lv.height;const area=polyArea(r.pts)/144;const it={id:r.id,name:r.name,level:lv.name,area,vol:area*H/12,walls:[],win:[],doors:[],ceil:0,floor:0,slabLF:0,sky:0};
    for(let i=0;i<r.pts.length;i++){const a={x:r.pts[i][0],y:r.pts[i][1]},b={x:r.pts[(i+1)%r.pts.length][0],y:r.pts[(i+1)%r.pts.length][1]};const L=dist(a,b);if(L<1)continue;
      for(const w of extW){if(w.level!==r.level)continue;const wa={x:w.x1,y:w.y1},wb={x:w.x2,y:w.y2};const pa=projSeg(a,wa,wb),pb=projSeg(b,wa,wb);if(pa.d>w.thick/2+3||pb.d>w.thick/2+3)continue;
        const t0=Math.max(0,Math.min(pa.tRaw,pb.tRaw)),t1=Math.min(1,Math.max(pa.tRaw,pb.tRaw));const ov=(t1-t0)*wlen(w);if(ov<2)continue;const f=wallFacing(p,w);const WL=wlen(w);
        const ops=p.openings.filter(o=>o.wall===w.id&&o.status!=='demolish'&&o.pos>=t0*WL-1&&o.pos<=t1*WL+1);let opA=0;
        for(const o of ops){const A=o.width*o.height/144;opA+=A;(o.type==='window'?it.win:it.doors).push({id:o.id,A,dir:f.dir});}
        it.walls.push({A:Math.max(0,ov*(w.height||H)/144-opA),dir:f.dir,len:ov});}}
    if(r.level===top.id||!lvs.some(l=>l.elevation>lv.elevation&&p.rooms.some(q=>q.level===l.id&&inPoly(...polyLabelPt(r.pts),q.pts))))it.ceil=area;
    if(r.level===low.id){if(['crawl','piers'].includes(F.type))it.floor=area;else if(F.type==='slab')it.slabLF=it.walls.reduce((s,w)=>s+w.len,0)/12;else it.bsmt=area;}
    for(const s of p.skylights||[]){if(s.status==='demolish')continue;const G=skyGeo(p,s);if(G&&inPoly(s.x,s.y,r.pts)&&lvlOf(p,r.level)===top)it.sky+=G.w*G.L/144;}
    items.push(it);}
  return {E,items,F};}
function loadCalc(p){const S=shellOf(p);const E=S.E;const dH=E.inHeat-E.tHeat,dC=E.tCool-E.inCool;const Uw=wallU(E.wallCav,E.wallCi),Uc=ceilU(E.ceil),Uf=floorU(E.floor);
  const totalVol=S.items.reduce((s,i)=>s+i.vol,0)||1;const stories=sortedLevels(p).length;const nFac=stories>1?16:18;const achN=E.ach50/nFac;const cfmH=achN*totalVol/60,cfmC=cfmH*0.6;
  const extA=S.items.reduce((s,i)=>s+i.walls.reduce((a,w)=>a+w.A,0)+i.win.reduce((a,w)=>a+w.A,0),0)||1;
  const bedrooms=p.rooms.filter(r=>r.use==='bedroom').length;const people=E.people??Math.max(2,bedrooms+1);const ductH=E.ducts==='attic'?1.15:E.ducts==='crawl'?1.10:1,ductC=E.ducts==='attic'?1.20:E.ducts==='crawl'?1.08:1;
  const rows=S.items.map(i=>{const wallA=i.walls.reduce((a,w)=>a+w.A,0),winA=i.win.reduce((a,w)=>a+w.A,0),doorA=i.doors.reduce((a,w)=>a+w.A,0);const share=(wallA+winA)/extA;
    const crawlFac=S.F.type==='crawl'||S.F.type==='piers'?0.6:1;
    const h=Uw*wallA*dH+E.winU*winA*dH+E.doorU*doorA*dH+Uc*i.ceil*dH+Uf*i.floor*dH*crawlFac+(i.slabLF*(E.slab>0?0.54:0.73)*dH)+E.skyU*i.sky*dH+1.08*cfmH*share*dH;
    const solar=i.win.reduce((s,w)=>s+w.A*E.shgc*SOLAR[w.dir],0)+i.sky*E.shgc*200;
    const kitchen=p.rooms.find(r=>r.id===i.id)?.use==='kitchen'?1200:0;const ppl=people*(i.area/(S.items.reduce((s,x)=>s+x.area,0)||1));
    const cs=Uw*wallA*(dC+12)+E.winU*winA*dC+E.doorU*doorA*(dC+10)+Uc*i.ceil*(dC+40)+E.skyU*i.sky*dC+solar+1.08*cfmC*share*dC+kitchen+ppl*230;
    const cl=0.68*cfmC*share*E.grains+ppl*200;
    return {...i,wallA,winA,doorA,heat:h*ductH,coolS:cs*ductC,coolL:cl};});
  const heat=rows.reduce((s,r)=>s+r.heat,0),coolS=rows.reduce((s,r)=>s+r.coolS,0),coolL=rows.reduce((s,r)=>s+r.coolL,0);const cool=coolS+coolL;
  const tons=Math.max(1.5,Math.ceil(cool/12000*2)/2);const cfm=tons*400;for(const r of rows)r.cfm=Math.round(cfm*r.coolS/(coolS||1)/5)*5;
  return {E,rows,heat,coolS,coolL,cool,tons,cfm,people,cfmInf:cfmH,achN,U:{wall:Uw,ceil:Uc,floor:Uf}};}
/* ---- energy code check ---- */
function energyCompliance(p){const E=energyOf(p);const C=CZ[E.zone]||CZ['3A'];const F=foundOf(p);const rows=[];const row=(item,req,prov,ok,note='')=>rows.push({item,req,prov,ok,note});
  const wallOk=C.wall.some(([c,ci])=>(E.wallCav>=c&&E.wallCi>=ci)||(c===0&&E.wallCi>=ci))||wallU(E.wallCav,E.wallCi)<=({'1A':0.084,'2A':0.084,'3A':0.060,'4A':0.045,'5A':0.045}[E.zone]||0.06);
  row('Wood-frame walls',C.wall.map(([c,ci])=>ci?(c?`R-${c}+${ci}ci`:`R-${ci}ci`):`R-${c}`).join(' or '),`R-${E.wallCav}${E.wallCi?'+'+E.wallCi+'ci':''} (U-${wallU(E.wallCav,E.wallCi).toFixed(3)})`,wallOk);
  row('Ceiling under attic','R-'+C.ceil,'R-'+E.ceil,E.ceil>=C.ceil,C.ceil>=49?'R-38 is allowed where full depth reaches over the top plates (N1102.2.1)':'' );
  if(['crawl','piers'].includes(F.type))row('Floor over crawlspace','R-'+C.floor,'R-'+E.floor,E.floor>=C.floor||E.floor>=13&&C.floor===19,'R-13 is allowed if it fills the joist cavity (N1102.2.7)');
  if(F.type==='slab'&&C.slab[0])row('Slab edge',`R-${C.slab[0]}, ${C.slab[1]/12} ft deep`,E.slab?'R-'+E.slab:'None',E.slab>=C.slab[0]);
  const wins=p.openings.filter(o=>o.type==='window'&&o.status==='new');row('Windows (U-factor)','U-'+C.fen.toFixed(2),'U-'+E.winU.toFixed(2),E.winU<=C.fen+1e-6,wins.length?'':'No new windows yet');
  if(C.shgc)row('Windows (SHGC)',C.shgc.toFixed(2),E.shgc.toFixed(2),E.shgc<=C.shgc+1e-6);
  if((p.skylights||[]).length)row('Skylights (U-factor)','U-'+C.sky.toFixed(2),'U-'+E.skyU.toFixed(2),E.skyU<=C.sky+1e-6);
  row('Air leakage (blower door)',`${C.ach} ACH50 or less`,E.ach50+' ACH50',E.ach50<=C.ach,'Tested per N1102.4.1.2');
  row('Ducts',E.ducts==='inside'?'Inside: no test-out limit':'Leakage test, 4 cfm25/100 sf',({attic:'In attic',crawl:'In crawlspace',inside:'Inside'})[E.ducts],true,E.ducts==='inside'?'':'Ducts outside conditioned space: insulate R-8 (3 in. or larger) and test (N1103.3)');
  return {E,C,rows,ok:rows.every(r=>r.ok)};}
regExtra({checks:(p,add)=>{const E=energyOf(p);if(!E.check)return;const C=energyCompliance(p);const lv=groundLevel(p);const ol=buildingOutline(p,lv.id);const pt=ol?{x:ol.pts[0].x,y:ol.pts[0].y}:{x:0,y:0};
  for(const r of C.rows)if(!r.ok)add('warn',{set:'IRC',code:'N1102.1.2',title:'Energy: '+r.item},r.item+' below the energy code',`Climate zone ${E.zone} needs ${r.req}; the project is set to ${r.prov}.${r.note?' '+r.note+'.':''}`,null,pt,lv.id);}});
/* ---- electrical service, NEC 220.82 optional method ---- */
const HVAC_TYPES=[['heatpump','Heat pump with electric backup strips'],['gasac','Gas furnace with central AC'],['elecac','Electric furnace with central AC'],['minisplit','Ductless mini-splits']];
function elecOf(p){return {hvac:'heatpump',strips:8,range:'electric',dryer:'electric',wh:'electric',ev:false,well:false,extra:[],...(p.settings?.elecLoad||{})};}
function serviceLoad(p){const L=elecOf(p);const LC=loadCalc(p);const fx=p.fixtures||[];const has=re=>fx.some(f=>f.status!=='demolish'&&re.test(f.type+' '+(FIXTURES[f.type]?.label||'')));const lines=[];const ln=(label,va,note='')=>lines.push({label,va:Math.round(va),note});
  const sf=p.rooms.filter(r=>!['garage','porch'].includes(r.use)).reduce((s,r)=>s+polyArea(r.pts)/144,0);ln(`General lighting and receptacles, ${Math.round(sf)} sq ft x 3 VA`,sf*3,'220.82(B)(1)');
  ln('Small-appliance circuits, 2 x 1,500 VA',3000,'220.82(B)(2)');if(has(/washer|laundry/i)||p.rooms.some(r=>r.use==='laundry'))ln('Laundry circuit',1500,'220.82(B)(2)');
  if(L.range==='electric')ln('Electric range',12000,'nameplate');if(has(/dishwasher|\bdw\b/i))ln('Dishwasher',1200);ln('Disposal',900);ln('Microwave (built-in)',1500);ln('Refrigerator',700);
  if(L.dryer==='electric')ln('Electric dryer',5000,'5,000 VA minimum');if(L.wh==='electric')ln('Electric water heater',4500);ln('Bath exhaust fans and attic fan',300);
  if(L.ev)ln('EV charger (40 A circuit, 32 A load)',7680);if(L.well)ln('Well pump, 1 hp',2000);for(const x of L.extra||[])if(x.va>0)ln(x.label||'Other appliance',x.va);
  const gen=lines.reduce((s,l)=>s+l.va,0);const genDemand=Math.min(gen,10000)+Math.max(0,gen-10000)*0.4;
  const comp=LC.tons*1400+600;let hv,hvNote;
  if(L.hvac==='heatpump'){const a=comp+L.strips*1000*0.65,b=comp;hv=Math.max(a,b);hvNote=`heat pump ${LC.tons} ton at 100% (${Math.round(comp).toLocaleString()} VA) + ${L.strips} kW strips at 65%`;}
  else if(L.hvac==='elecac'){hv=Math.max(comp,L.strips*1000*0.65);hvNote=`larger of AC (${Math.round(comp).toLocaleString()} VA) and ${L.strips} kW heat at 65%`;}
  else if(L.hvac==='minisplit'){hv=LC.tons*1200;hvNote='mini-split heat pumps at 100%';}else{hv=comp;hvNote=`central AC ${LC.tons} ton at 100%, gas heat`;}
  const total=genDemand+hv;const amps=total/240;const size=[100,125,150,200,225,320,400].find(a=>a>=amps*1.0)||400;
  return {L,lines,gen,genDemand,hv,hvNote,total,amps,size,tons:LC.tons};}
/* ---- plumbing: drainage fixture units (IRC P3004.1) and water supply fixture units (P2903.6) ---- */
const PLUMB=[['wc',/toilet|water closet|\bwc\b/i,'Water closet (1.6 gpf)',3,2.2],['lav',/\blav|lavatory|vanity sink|bath sink/i,'Lavatory',1,0.7],['tub',/tub/i,'Bathtub',2,1.4],['shower',/shower/i,'Shower',2,1.4],
  ['ksink',/sinkbase|kitchen sink|sink base|farm sink|prep sink/i,'Kitchen sink',2,1.4],['dw',/dishwasher|^dw\b/i,'Dishwasher',2,1.4],['cw',/(^|\s)washer|clothes washer/i,'Clothes washer standpipe',2,1.4],['ltub',/laundry sink|utility sink|laundry tub/i,'Laundry tub',2,1.4],['bar',/bar sink/i,'Bar sink',1,1.0]];
const GPM=[[0,0],[1,3],[2,5],[3,6.5],[4,8],[5,9.4],[6,10.7],[8,12.8],[10,14.6],[12,16],[15,17.5],[20,19.6],[25,21.5],[30,23.3],[40,26.3],[50,29.1],[60,32],[80,38],[100,43.5]];
const gpmFor=w=>{for(let i=1;i<GPM.length;i++)if(w<=GPM[i][0]){const [a,ga]=GPM[i-1],[b,gb]=GPM[i];return ga+(gb-ga)*(w-a)/(b-a);}return 43.5+(w-100)*0.25;};
function plumbingCalc(p){const counts={};const per={};const fx=(p.fixtures||[]).filter(f=>f.status!=='demolish');
  for(const f of fx){const t=f.type+' '+(FIXTURES[f.type]?.label||'')+' '+(f.name||'');const m=PLUMB.find(x=>x[1].test(t)&&!(x[0]==='cw'&&/dish/i.test(t)));if(!m)continue;counts[m[0]]=(counts[m[0]]||0)+1;
    const rm=p.rooms.find(r=>r.level===f.level&&inPoly(f.x,f.y,r.pts));const k=rm?rm.id:'none';(per[k]=per[k]||[]).push(m[0]);}
  const fd=(p.mep||[]).filter(o=>o.type==='floordrain'&&o.status!=='demolish').length;const hb=(p.mep||[]).filter(o=>o.type==='hosebibb'&&o.status!=='demolish').length;
  // bathroom groups: water closet + lavatory + tub or shower in one room count 5 DFU / 3.6 WSFU
  let groups=0;const left={...counts};for(const k in per){const L=per[k];const wc=L.filter(x=>x==='wc').length,lav=L.filter(x=>x==='lav').length,ts=L.filter(x=>x==='tub'||x==='shower').length;const g=Math.min(wc,lav,ts);if(g>0){groups+=g;left.wc-=g;left.lav-=g;let rem=g;for(const t of ['tub','shower']){const n=Math.min(rem,L.filter(x=>x===t).length);left[t]-=n;rem-=n;}}}
  const rows=[];if(groups)rows.push({label:'Bathroom group (WC, lav, tub or shower)',n:groups,dfu:5,wsfu:3.6});
  for(const [k,,label,dfu,ws] of PLUMB)if(left[k]>0)rows.push({label,n:left[k],dfu,wsfu:ws});if(fd)rows.push({label:'Floor drain',n:fd,dfu:2,wsfu:0});if(hb)rows.push({label:'Hose bibb',n:hb,dfu:0,wsfu:2.5});
  const DFU=rows.reduce((s,r)=>s+r.n*r.dfu,0),WSFU=rows.reduce((s,r)=>s+r.n*r.wsfu,0);const gpm=gpmFor(WSFU);
  const drain=counts.wc?(DFU<=42?'3"':DFU<=216?'4"':'5" or larger'):(DFU<=8?'2"':DFU<=21?'2-1/2"':'3"');const service=gpm<=12.5?'3/4"':gpm<=20?'1"':gpm<=32?'1-1/4"':'1-1/2"';
  const baths=Math.max(groups,(counts.tub||0)+(counts.shower||0));const tank=baths<=1?40:baths<=2?50:baths<=3?65:80;
  return {rows,DFU,WSFU,gpm,drain,service,tank,baths,counts};}
/* ---- the Systems page ---- */
function SystemsView({p,commit}){const [tab,setTab]=useState('energy');const E=energyOf(p);const up=patch=>commit(setEnergy(p,patch));
  const tabs=[['energy','Energy code'],['loads','Heating and cooling'],['elec','Electrical service'],['plumb','Plumbing'],['light','Lighting']];
  const num=(id,label,val,set,step=1,suffix='')=>html`<label className="fld"><span>${label}</span><span className="row"><input id=${id} className="inp mono" style=${{width:'6em'}} type="number" step=${step} value=${val} onChange=${e=>{const v=parseFloat(e.target.value);if(!isNaN(v))set(v);}}/>${suffix?html`<span className="note">${suffix}</span>`:null}</span></label>`;
  let body=null;
  if(tab==='energy'){const C=energyCompliance(p);body=html`<section className="sec"><h3>Building shell</h3><div className="sysgrid">
      <${Field} label="Climate zone" id="ez"><${Sel} id="ez" value=${E.zone} onChange=${v=>{const c=CZ[v];up({zone:v,tHeat:c.heat,tCool:c.cool});}} options=${Object.entries(CZ).map(([k,c])=>[k,c.label])}/><//>
      ${num('e-wc','Wall cavity R',E.wallCav,v=>up({wallCav:v}))}${num('e-wci','Wall continuous R (foam)',E.wallCi,v=>up({wallCi:v}))}${num('e-ce','Ceiling R',E.ceil,v=>up({ceil:v}))}
      ${num('e-fl','Floor R',E.floor,v=>up({floor:v}))}${num('e-sl','Slab edge R',E.slab,v=>up({slab:v}))}${num('e-wu','Window U-factor',E.winU,v=>up({winU:v}),0.01)}${num('e-sh','Window SHGC',E.shgc,v=>up({shgc:v}),0.01)}
      ${num('e-sk','Skylight U-factor',E.skyU,v=>up({skyU:v}),0.01)}${num('e-du','Door U-factor',E.doorU,v=>up({doorU:v}),0.01)}${num('e-ach','Air leakage',E.ach50,v=>up({ach50:v}),0.5,'ACH50')}
      <${Field} label="Ducts" id="e-dc"><${Sel} id="e-dc" value=${E.ducts} onChange=${v=>up({ducts:v})} options=${DUCTS}/><//></div>
      <label className="check"><input type="checkbox" checked=${!!E.check} onChange=${e=>up({check:e.target.checked})}/> Include energy code items in the code check list</label></section>
    <section className="sec"><h3>2021 IRC prescriptive check (Table N1102.1.2), climate zone ${E.zone}</h3>
      <div className="tablewrap"><table className="mat"><thead><tr><th>Component</th><th>Required</th><th>This project</th><th>Result</th></tr></thead><tbody>
      ${C.rows.map(r=>html`<tr key=${r.item}><td>${r.item}${r.note?html`<div className="note">${r.note}</div>`:null}</td><td>${r.req}</td><td>${r.prov}</td><td><span className=${'pill '+(r.ok?'ok':'warn')}>${r.ok?'Meets':'Below'}</span></td></tr>`)}</tbody></table></div>
      <p className="note">In a remodel the energy code applies to the new and altered parts (N1109). Existing walls you leave closed do not have to be brought up to these values.</p></section>`;}
  if(tab==='loads'){const L=loadCalc(p);body=html`<section className="sec"><h3>Design conditions</h3><div className="sysgrid">
      ${num('l-th','Winter outdoor',E.tHeat,v=>up({tHeat:v}),1,'°F')}${num('l-tc','Summer outdoor',E.tCool,v=>up({tCool:v}),1,'°F')}${num('l-ih','Indoor winter',E.inHeat,v=>up({inHeat:v}),1,'°F')}${num('l-ic','Indoor summer',E.inCool,v=>up({inCool:v}),1,'°F')}
      ${num('l-gr','Moisture difference',E.grains,v=>up({grains:v}),1,'grains')}${num('l-pp','People',L.people,v=>up({people:v}))}</div>
      <p className="note">Forest, MS (Jackson design data): about 23°F winter and 95°F summer. Change the shell values on the Energy code tab.</p></section>
    <div className="mattotal"><span>Heating <b className="mono">${Math.round(L.heat).toLocaleString()} Btu/h</b></span><span>Cooling <b className="mono">${Math.round(L.cool).toLocaleString()} Btu/h</b> (${Math.round(L.coolS/L.cool*100)}% sensible)</span><span>Equipment <b className="mono">${L.tons} ton</b>, about ${L.cfm} cfm</span></div>
    <section className="sec"><h3>Room by room</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Room</th><th className="num">Area</th><th className="num">Glass</th><th className="num">Heating</th><th className="num">Cooling</th><th className="num">Airflow</th></tr></thead><tbody>
      ${L.rows.map(r=>html`<tr key=${r.id}><td>${r.name} <span className="note">${r.level}</span></td><td className="num mono">${Math.round(r.area)} sf</td><td className="num mono">${Math.round(r.winA)} sf</td><td className="num mono">${Math.round(r.heat).toLocaleString()}</td><td className="num mono">${Math.round(r.coolS+r.coolL).toLocaleString()}</td><td className="num mono">${r.cfm} cfm</td></tr>`)}</tbody></table></div>
      <p className="note">A simplified Manual J style estimate: wall U-${L.U.wall.toFixed(3)}, ceiling U-${L.U.ceil.toFixed(3)}, ${L.achN.toFixed(2)} natural air changes per hour, window solar gain by the direction each wall faces, and duct losses for ducts ${DUCTS.find(d=>d[0]===E.ducts)[1].toLowerCase()}. Use it to size and compare; have the HVAC contractor run a full Manual J for the permit.</p></section>`;}
  if(tab==='elec'){const S=serviceLoad(p);const L=S.L;const ue=patch=>commit({...p,settings:{...p.settings,elecLoad:{...L,...patch}}});
    body=html`<section className="sec"><h3>Major appliances</h3><div className="sysgrid">
      <${Field} label="Heating and cooling" id="el-h"><${Sel} id="el-h" value=${L.hvac} onChange=${v=>ue({hvac:v})} options=${HVAC_TYPES}/><//>${['heatpump','elecac'].includes(L.hvac)?num('el-s','Backup heat',L.strips,v=>ue({strips:v}),1,'kW'):null}
      <${Field} label="Range" id="el-r"><${Sel} id="el-r" value=${L.range} onChange=${v=>ue({range:v})} options=${[['electric','Electric'],['gas','Gas']]}/><//>
      <${Field} label="Dryer" id="el-d"><${Sel} id="el-d" value=${L.dryer} onChange=${v=>ue({dryer:v})} options=${[['electric','Electric'],['gas','Gas']]}/><//>
      <${Field} label="Water heater" id="el-w"><${Sel} id="el-w" value=${L.wh} onChange=${v=>ue({wh:v})} options=${[['electric','Electric'],['gas','Gas'],['hp','Heat pump water heater']]}/><//></div>
      <label className="check"><input type="checkbox" checked=${L.ev} onChange=${e=>ue({ev:e.target.checked})}/> EV charger</label><label className="check"><input type="checkbox" checked=${L.well} onChange=${e=>ue({well:e.target.checked})}/> Well pump</label></section>
    <section className="sec"><h3>Service load (NEC 220.82, optional method for a dwelling)</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Load</th><th className="num">VA</th><th>Note</th></tr></thead><tbody>
      ${S.lines.map((l,i)=>html`<tr key=${i}><td>${l.label}</td><td className="num mono">${l.va.toLocaleString()}</td><td className="note">${l.note}</td></tr>`)}
      <tr><td><b>General load</b></td><td className="num mono"><b>${S.gen.toLocaleString()}</b></td><td className="note">first 10,000 VA at 100%, the rest at 40%: ${Math.round(S.genDemand).toLocaleString()} VA</td></tr>
      <tr><td><b>Heating and cooling</b></td><td className="num mono"><b>${Math.round(S.hv).toLocaleString()}</b></td><td className="note">${S.hvNote} (220.82(C))</td></tr></tbody></table></div>
      <div className="mattotal"><span>Calculated load <b className="mono">${Math.round(S.total).toLocaleString()} VA</b></span><span><b className="mono">${Math.round(S.amps)} A</b> at 240 V</span><span>Service size <b className="mono">${S.size} A</b></span></div>
      <p className="note">Heat pump size comes from the cooling load (${S.tons} ton). Range, dryer and water heater use typical nameplate ratings; put in real ones when the appliances are chosen.</p></section><${PanelTable} p=${p}/>`;}
  if(tab==='plumb'){const P=plumbingCalc(p);body=html`<section className="sec"><h3>Fixture units</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Fixture</th><th className="num">Count</th><th className="num">DFU each</th><th className="num">WSFU each</th></tr></thead><tbody>
      ${P.rows.length?P.rows.map(r=>html`<tr key=${r.label}><td>${r.label}</td><td className="num mono">${r.n}</td><td className="num mono">${r.dfu}</td><td className="num mono">${r.wsfu}</td></tr>`):html`<tr><td colSpan="4" className="note">Place toilets, sinks, tubs, showers and appliances to size the plumbing.</td></tr>`}</tbody></table></div>
      <div className="mattotal"><span>Drainage <b className="mono">${P.DFU} DFU</b></span><span>Supply <b className="mono">${Math.round(P.WSFU*10)/10} WSFU</b> ≈ ${P.gpm.toFixed(1)} gpm peak</span></div>
      <div className="tablewrap"><table className="mat"><tbody><tr><td>Building drain (1/4" per ft)</td><td><b>${P.drain}</b></td><td className="note">IRC Table P3005.4.2; 3" minimum with a water closet</td></tr>
        <tr><td>Water service line</td><td><b>${P.service}</b></td><td className="note">Typical for 40 to 60 psi and under 100 ft developed length (P2903.7); check with the pressure at the meter</td></tr>
        <tr><td>Water heater</td><td><b>${P.tank} gal tank</b> or tankless</td><td className="note">${P.baths} bath${P.baths===1?'':'s'}; size a tank by first-hour rating</td></tr></tbody></table></div></section>`;}
  if(tab==='light')body=html`<${LightingTab} p=${p} commit=${commit}/>`;
  return html`<div className="matview"><div className="matinner"><div className="seg mattabs" role="tablist">${tabs.map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${tab===k} className=${tab===k?'on':''} onClick=${()=>setTab(k)}>${l}</button>`)}</div>
    <div className="mathead"><div><h2>${tabs.find(t=>t[0]===tab)[1]}</h2><p className="note">Calculated from the model. Planning numbers to size and compare; not a stamped design.</p></div></div>${body}</div></div>`;}
/* ---- sheet M0.1 ---- */
function systemsSheet(P,p){const k=P.k;const dl=DL();const A=sheetFrame(dl,P,p,'M0.1','Energy and systems calculations','');const W=A.x1-A.x0;let y=A.y0+0.3*k;const colW=(W-0.4*k)/2;const x2=A.x0+colW+0.4*k;
  const C=energyCompliance(p),L=loadCalc(p),S=serviceLoad(p),PL=plumbingCalc(p);
  dl.text(A.x0,y,`ENERGY CODE, CLIMATE ZONE ${C.E.zone} (2021 IRC N1102.1.2)`,{size:7*k,bold:true});y+=0.1*k;
  const cw=[1.5,1.25,1.25,0.5].map(v=>v*k);const sc=Math.min(1,colW/cw.reduce((a,b)=>a+b,0));
  y+=drawTable(dl,A.x0,y,['COMPONENT','REQUIRED','PROVIDED','OK'].map((h,i)=>({h,w:cw[i]*sc})),C.rows.map(r=>[r.item,r.req,r.prov,r.ok?'YES':'NO']),k,A.y1)+0.3*k;
  dl.text(A.x0,y,`HEATING AND COOLING LOADS (${C.E.tHeat}°F / ${C.E.tCool}°F)`,{size:7*k,bold:true});y+=0.1*k;
  const cw2=[1.4,0.6,0.8,0.8,0.6].map(v=>v*k);const sc2=Math.min(1,colW/cw2.reduce((a,b)=>a+b,0));
  y+=drawTable(dl,A.x0,y,['ROOM','AREA','HEAT BTU/H','COOL BTU/H','CFM'].map((h,i)=>({h,w:cw2[i]*sc2})),[...L.rows.map(r=>[r.name,Math.round(r.area)+' SF',Math.round(r.heat).toLocaleString(),Math.round(r.coolS+r.coolL).toLocaleString(),String(r.cfm)]),['TOTAL','',Math.round(L.heat).toLocaleString(),Math.round(L.cool).toLocaleString(),String(L.cfm)]],k,A.y1)+0.12*k;
  dl.text(A.x0,y,`Equipment: ${L.tons} ton cooling, about ${L.cfm} cfm. Simplified Manual J estimate; final sizing by the HVAC contractor.`,{size:5.5*k});
  let y2=A.y0+0.3*k;dl.text(x2,y2,'ELECTRICAL SERVICE (NEC 220.82)',{size:7*k,bold:true});y2+=0.1*k;const cw3=[2.6,0.7].map(v=>v*k);const sc3=Math.min(1,colW/cw3.reduce((a,b)=>a+b,0));
  y2+=drawTable(dl,x2,y2,['LOAD','VA'].map((h,i)=>({h,w:cw3[i]*sc3})),[...S.lines.map(l=>[l.label,l.va.toLocaleString()]),['General load demand (10 kVA + 40%)',Math.round(S.genDemand).toLocaleString()],['Heating and cooling (220.82(C))',Math.round(S.hv).toLocaleString()],[`TOTAL: ${Math.round(S.amps)} A at 240 V, use ${S.size} A service`,Math.round(S.total).toLocaleString()]],k,A.y1)+0.3*k;
  dl.text(x2,y2,'PLUMBING FIXTURE UNITS (IRC P3004.1, P2903.6)',{size:7*k,bold:true});y2+=0.1*k;const cw4=[2,0.4,0.5,0.5].map(v=>v*k);const sc4=Math.min(1,colW/cw4.reduce((a,b)=>a+b,0));
  y2+=drawTable(dl,x2,y2,['FIXTURE','QTY','DFU','WSFU'].map((h,i)=>({h,w:cw4[i]*sc4})),[...PL.rows.map(r=>[r.label,String(r.n),String(r.n*r.dfu),String(Math.round(r.n*r.wsfu*10)/10)]),['TOTAL','',String(PL.DFU),String(Math.round(PL.WSFU*10)/10)]],k,A.y1)+0.12*k;
  for(const t of [`Building drain ${PL.drain} at 1/4" per ft. Water service ${PL.service} (${PL.gpm.toFixed(1)} gpm peak).`,`Water heater: ${PL.tank} gallon tank or tankless sized for the fixtures.`]){dl.text(x2,y2,t,{size:5.5*k});y2+=0.13*k;}
  return {id:'sys',no:'M0.1',title:'Energy and systems calculations',w:P.w,h:P.h,items:dl.items,scale:''};}
