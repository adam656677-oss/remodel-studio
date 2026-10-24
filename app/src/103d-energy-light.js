/* ======================= energy: total UA trade-off (IECC R402.1.5, the REScheck method); lighting: fixture library, recessed layouts, point-by-point foot-candles ======================= */
// 2021 IECC Table R402.1.2 maximum assembly U-factors by climate zone number
const UA_REF={1:{fen:0.50,sky:0.75,ceil:0.035,wall:0.084,floor:0.064},2:{fen:0.40,sky:0.65,ceil:0.026,wall:0.084,floor:0.064},3:{fen:0.30,sky:0.55,ceil:0.026,wall:0.060,floor:0.047},4:{fen:0.30,sky:0.55,ceil:0.024,wall:0.060,floor:0.047},5:{fen:0.30,sky:0.55,ceil:0.024,wall:0.045,floor:0.033}};
function uaTradeoff(p){const S=shellOf(p);const E=S.E;const R=UA_REF[parseInt(E.zone)]||UA_REF[3];const winU=id=>{const o=p.openings.find(x=>x.id===id);return (o&&(o.u||(o.win&&o.win.u)))||E.winU;};
  const A={wall:0,win:0,door:0,ceil:0,floor:0,sky:0};let winUA=0;for(const it of S.items){for(const w of it.walls)A.wall+=w.A;for(const w of it.win){A.win+=w.A;winUA+=w.A*winU(w.id);}for(const d of it.doors)A.door+=d.A;A.ceil+=it.ceil;A.floor+=it.floor||0;A.sky+=it.sky||0;}
  const prop={wall:A.wall*wallU(E.wallCav,E.wallCi),win:winUA,door:A.door*E.doorU,ceil:A.ceil*ceilU(E.ceil),floor:A.floor*floorU(E.floor),sky:A.sky*E.skyU};
  // one opaque door up to 24 SF is exempt (R402.3.4); it is left out of both sides
  const exempt=Math.min(24,A.door);const ref={wall:A.wall*R.wall,win:A.win*R.fen,door:(A.door-exempt)*R.fen,ceil:A.ceil*R.ceil,floor:A.floor*R.floor,sky:A.sky*R.sky};prop.door=(A.door-exempt)*E.doorU;
  const sum=o=>Object.values(o).reduce((s,v)=>s+v,0);const P=sum(prop),Rf=sum(ref);const glaz=A.win+A.sky;const cfa=S.items.reduce((s,i)=>s+i.area,0);
  return {E,A,prop,ref,P,R:Rf,pass:P<=Rf+1e-6,better:Rf>0?(1-P/Rf)*100:0,glazPct:cfa?glaz/cfa*100:0,shgcOK:(CZ[E.zone]||{}).shgc==null||E.shgc<=CZ[E.zone].shgc,slab:S.F.type==='slab'};}
function UAPanel({p}){const U=useMemo(()=>uaTradeoff(p),[p]);const rows=[['Walls','wall'],['Windows','win'],['Doors (one 24 SF door exempt)','door'],['Ceilings','ceil'],['Floors over crawlspace','floor'],['Skylights','sky']].filter(([,k])=>U.A[k]>0);
  return html`<section className="sec"><h3>Total UA trade-off (IECC R402.1.5, the REScheck method)</h3>
    <p className="note">Instead of meeting every R-value, the whole shell can pass if its total heat loss (area x U-factor, added up) is no more than a house built exactly to Table R402.1.2. Better windows can make up for thinner walls, and the other way around. SHGC, air sealing and duct rules still apply on their own.</p>
    <div className="tablewrap"><table className="mat"><thead><tr><th>Assembly</th><th className="num">Area SF</th><th className="num">This project UA</th><th className="num">Code house UA</th></tr></thead><tbody>
      ${rows.map(([l,k])=>html`<tr key=${k}><td>${l}</td><td className="num mono">${Math.round(U.A[k]).toLocaleString()}</td><td className="num mono">${U.prop[k].toFixed(1)}</td><td className="num mono">${U.ref[k].toFixed(1)}</td></tr>`)}
      <tr className="strong"><td>Total UA (Btu/h·°F)</td><td></td><td className="num mono"><b>${U.P.toFixed(1)}</b></td><td className="num mono"><b>${U.R.toFixed(1)}</b></td></tr></tbody></table></div>
    <div className="stat strong"><span>Result</span><span><span className=${'pill '+(U.pass?'ok':'bad')}>${U.pass?'Passes':'Fails'}</span> ${Math.abs(U.better).toFixed(1)}% ${U.better>=0?'better':'worse'} than code</span></div>
    <div className="stat"><span>Window SHGC (mandatory in zone ${U.E.zone})</span><span className=${'pill '+(U.shgcOK?'ok':'warn')}>${U.shgcOK?'Meets':'Too high'}</span></div><div className="stat"><span>Glass area</span><span className="mono">${U.glazPct.toFixed(1)}% of floor area</span></div>
    ${U.slab?html`<p className="note">Slab edges are left out here; slab edge insulation still has to meet Table R402.1.3.</p>`:null}<p className="note">Window U-factors come from each window's own value when one is set (vendor products), otherwise the project value. For a permit, print the REScheck report from energycode.gov with these same inputs.</p></section>`;}

/* ---- lighting fixtures: [key, label, ELEC type, lumens, beam angle, watts, planning price] ---- */
const LIGHT_FIX=[['w4','4" LED wafer downlight',  'can',650,100,9,22],['w6','6" LED wafer downlight','can',1000,100,13,26],['r6','6" retrofit can light','can',900,90,12,24],['g4','4" adjustable gimbal (accent)','can',700,40,10,38],
  ['flush','Flush-mount ceiling light','light',1600,120,18,45],['drum','Drum pendant','pendant',1200,120,15,120],['mini','Mini pendant (island)','pendant',500,60,7,80],['fan','Ceiling fan with LED light','fan',1200,120,16,190],
  ['sconce','Wall sconce','sconce',450,120,6,60],['vanity','Vanity bar light, 3 lights','sconce',1500,120,18,90],['ucab','Under-cabinet LED, per 24"','undercab',350,110,5,40]];
const fixOf=d=>LIGHT_FIX.find(x=>x[0]===d.fix)||null;
const devLumens=d=>d.lumens||(fixOf(d)||[])[3]||LUMENS[d.type]||0;
function beamOf(d){const f=fixOf(d);return f?f[4]:d.type==='can'?90:d.type==='pendant'?110:d.type==='undercab'?110:120;}
// point-by-point illuminance on the work plane (30" up), cosine-power intensity from each fixture's beam angle; 20% added for light off walls and ceiling
function lightGrid(p,r,step=12){const lv=lvlOf(p,r.level);const H=(r.ceilingH||lv?.height||96);const devs=(p.elec||[]).filter(d=>d.level===r.level&&d.status!=='demolish'&&LUMENS[d.type]&&inPoly(d.x,d.y,r.pts));
  const xs=r.pts.map(q=>q[0]),ys=r.pts.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);const pts=[];
  const src=devs.map(d=>{const B=beamOf(d)*Math.PI/180;const n=Math.max(0.5,Math.log(0.5)/Math.log(Math.cos(B/2)));const lm=devLumens(d)*0.85;const z=(d.type==='sconce'?(d.h||66):d.type==='undercab'?54:d.type==='pendant'?Math.min(H,66):H);return {x:d.x,y:d.y,z,I0:lm*(n+1)/(2*Math.PI),n,down:d.type!=='sconce'};});
  for(let y=y0+step/2;y<y1;y+=step)for(let x=x0+step/2;x<x1;x+=step){if(!inPoly(x,y,r.pts))continue;let E=0;for(const s of src){const dz=(s.z-30)/12;if(dz<=0)continue;const dx=(x-s.x)/12,dy=(y-s.y)/12;const d2=dx*dx+dy*dy+dz*dz;const c=dz/Math.sqrt(d2);E+=(s.down?s.I0*Math.pow(c,s.n):s.I0*0.5)*c/d2;}pts.push({x,y,E:E*1.2});}
  const vals=pts.map(q=>q.E);const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;return {pts,avg,min:vals.length?Math.min(...vals):0,max:vals.length?Math.max(...vals):0,step,box:{x0,x1,y0,y1},devs:devs.length};}
// recessed grid sized for the room's target
function autoCanLayout(p,r,fixKey='w6',target=null){const f=LIGHT_FIX.find(x=>x[0]===fixKey)||LIGHT_FIX[1];const a=polyArea(r.pts)/144;const [tgt]=FC_TARGET[r.use||'other']||FC_TARGET.other;const T=target||tgt;
  const lv=lvlOf(p,r.level);const H=(r.ceilingH||lv?.height||96)/12;let n=Math.max(1,Math.ceil(T*a/(0.6*0.85*f[3])));
  const xs=r.pts.map(q=>q[0]),ys=r.pts.map(q=>q[1]);const W=Math.max(...xs)-Math.min(...xs),D=Math.max(...ys)-Math.min(...ys);const maxS=Math.max(48,H*12*0.9);
  let cols=Math.max(1,Math.round(Math.sqrt(n*W/D))),rows=Math.max(1,Math.ceil(n/cols));while(W/cols>maxS)cols++;while(D/rows>maxS)rows++;
  const out=[];for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const x=Math.min(...xs)+W*(i+0.5)/cols,y=Math.min(...ys)+D*(j+0.5)/rows;if(inPoly(x,y,r.pts))out.push({x,y});}
  return {pts:out,fix:f,n:out.length,spacing:Math.round(Math.max(W/cols,D/rows))};}
function applyCanLayout(p,r,L,replace=true){const keep=(p.elec||[]).filter(d=>!(replace&&d.level===r.level&&d.status!=='existing'&&['can','light'].includes(d.type)&&inPoly(d.x,d.y,r.pts)));
  const add=L.pts.map(q=>({...newElec(L.fix[2],r.level,q.x,q.y),fix:L.fix[0],lumens:L.fix[3]}));return {...p,elec:[...keep,...add]};}
function LightPlanner({p,commit}){const rooms=p.rooms.filter(r=>r.use!=='porch');const [rid,setRid]=useState((rooms.find(r=>r.use==='kitchen')||rooms[0]||{}).id);const [fix,setFix]=useState('w6');const r=rooms.find(x=>x.id===rid);
  const G=useMemo(()=>r?lightGrid(p,r):null,[p,rid]);const L=r?autoCanLayout(p,r,fix):null;const [tgt]=r?FC_TARGET[r.use||'other']||FC_TARGET.other:[0];
  if(!r)return null;const B=G.box;const sc=Math.min(520/(B.x1-B.x0),300/(B.y1-B.y0));const X=x=>(x-B.x0)*sc,Y=y=>(y-B.y0)*sc;const col=E=>{const t=Math.max(0,Math.min(1,E/(tgt*2||1)));const h=240-t*200;return `hsl(${h},80%,${45+t*15}%)`;};
  const devs=(p.elec||[]).filter(d=>d.level===r.level&&d.status!=='demolish'&&LUMENS[d.type]&&inPoly(d.x,d.y,r.pts));
  return html`<section className="sec lightplan"><h3>Lighting layout and foot-candles</h3>
    <div className="grid2"><${Field} label="Room" id="lp-r"><${Sel} id="lp-r" value=${rid} onChange=${setRid} options=${rooms.map(x=>[x.id,x.name])}/><//><${Field} label="Recessed fixture" id="lp-f"><${Sel} id="lp-f" value=${fix} onChange=${setFix} options=${LIGHT_FIX.filter(x=>x[2]==='can'||x[2]==='light').map(x=>[x[0],`${x[1]} · ${x[3]} lm`])}/><//></div>
    <div className="lp-wrap"><svg className="lp-svg" viewBox=${`0 0 ${(B.x1-B.x0)*sc} ${(B.y1-B.y0)*sc}`} role="img" aria-label="Foot-candle map">
      ${G.pts.map((q,i)=>html`<rect key=${i} x=${X(q.x-G.step/2)} y=${Y(q.y-G.step/2)} width=${G.step*sc+0.5} height=${G.step*sc+0.5} fill=${col(q.E)}/>`)}
      <polygon points=${r.pts.map(q=>X(q[0])+','+Y(q[1])).join(' ')} fill="none" stroke="#111" strokeWidth="2"/>
      ${devs.map(d=>html`<circle key=${d.id} cx=${X(d.x)} cy=${Y(d.y)} r="5" fill="#fff" stroke="#111"/>`)}
      ${L.pts.map((q,i)=>html`<circle key=${'n'+i} cx=${X(q.x)} cy=${Y(q.y)} r="4" fill="none" stroke="#1d5fd1" strokeDasharray="2 2"/>`)}</svg>
      <div className="lp-stats"><div className="stat"><span>Average</span><span className="mono">${G.avg.toFixed(0)} fc</span></div><div className="stat"><span>Lowest / highest</span><span className="mono">${G.min.toFixed(0)} / ${G.max.toFixed(0)} fc</span></div>
        <div className="stat"><span>Target (${r.use||'room'})</span><span className="mono">${tgt} fc</span></div><div className="stat"><span>Evenness (avg / min)</span><span className="mono">${G.min>0?(G.avg/G.min).toFixed(1):'-'} : 1</span></div>
        <p className="note">Blue is dim, yellow and red are bright (twice the target). White dots are the lights you have; blue rings are the suggested grid: ${L.n} x ${L.fix[1].toLowerCase()} about ${fmtLen(L.spacing)} apart.</p>
        <button className="btn primary" onClick=${()=>commit(applyCanLayout(p,r,L,true))}>Place ${L.n} recessed lights in ${r.name}</button></div></div>
    <h4>Fixture library</h4><div className="tablewrap"><table className="mat"><thead><tr><th>Fixture</th><th className="num">Lumens</th><th className="num">Beam</th><th className="num">Watts</th><th className="num">Planning price</th></tr></thead><tbody>${LIGHT_FIX.map(x=>html`<tr key=${x[0]}><td>${x[1]}</td><td className="num mono">${x[3]}</td><td className="num mono">${x[4]}°</td><td className="num mono">${x[5]}</td><td className="num mono">$${x[6]}</td></tr>`)}</tbody></table></div>
    <p className="note">Point-by-point on a 1 ft grid at counter-and-desk height (30"), from each fixture's lumens and beam spread, plus about 20% bounced off light walls and ceiling. 2,700 K to 3,000 K suits most homes; 90+ CRI makes skin and wood look right.</p></section>`;}
{const _LT=LightingTab;LightingTab=function(props){return html`<${_LT} ...${props}/><${LightPlanner} ...${props}/>`;};}
regExtra({takeoff:(p,add)=>{const by={};for(const d of p.elec||[]){if(d.status==='existing'||d.status==='demolish'||!d.fix)continue;const f=fixOf(d);if(!f)continue;by[f[0]]=(by[f[0]]||0)+1;}for(const [k,n] of Object.entries(by)){const f=LIGHT_FIX.find(x=>x[0]===k);regPrice('Lighting fixtures',f[1],f[6]);add('Lighting fixtures',f[1],n,'EA',`${f[3]} lm`);}}});
