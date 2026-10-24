/* ======================= light color (Kelvin), switch groups and the lighting schedule ======================= */
const KELVINS=[[2200,'2200 K (candlelight)'],[2700,'2700 K (warm white)'],[3000,'3000 K (soft white)'],[3500,'3500 K (neutral)'],[4000,'4000 K (cool white)'],[5000,'5000 K (daylight)']];
// black-body color, Tanner Helland's fit; returns 0..1 RGB
function kelvinRGB(K){const t=K/100;let r,g,b;if(t<=66){r=255;g=99.4708025861*Math.log(t)-161.1195681661;b=t<=19?0:138.5177312231*Math.log(t-10)-305.0447927307;}
  else{r=329.698727446*Math.pow(t-60,-0.1332047592);g=288.1221695283*Math.pow(t-60,-0.0755148492);b=255;}const c=v=>Math.max(0,Math.min(255,v))/255;return [c(r),c(g),c(b)];}
const kelvinHex=K=>{const [r,g,b]=kelvinRGB(K);return (Math.round(r*255)<<16)|(Math.round(g*255)<<8)|Math.round(b*255);};
{const _rl=renderLights;renderLights=function(p){const out=_rl(p);const devs=(p.elec||[]).filter(d=>d.status!=='demolish'&&LUMENS[d.type]);
  // match lights back to devices by position to carry their color
  for(const L of out){if(L.auto){L.color=kelvinRGB(2700);continue;}const M=IN*0.3048;const d=devs.find(d=>Math.abs(d.x*M-L.pos[0])<1e-6&&Math.abs(d.y*M-L.pos[2])<1e-6);L.color=kelvinRGB((d&&d.kelvin)||2700);}return out;};}
// fixture type marks: same type, lumens and color get the same letter (A, B, C ...)
function lightKey(d){return [d.type,d.lumens||LUMENS[d.type],d.kelvin||2700,d.dim?1:0].join('|');}
function lightMarks(p){const keys=[];for(const d of (p.elec||[]))if(LUMENS[d.type]&&d.status!=='demolish'&&!d.mark){const k=lightKey(d);if(!keys.includes(k))keys.push(k);}
  const m={};keys.forEach((k,i)=>{m[k]=String.fromCharCode(65+(i%26))+(i>=26?Math.floor(i/26):'');});return m;}
function lightMark(p,d){return d.mark||lightMarks(p)[lightKey(d)]||'A';}
// switch groups: each switch and the lights it runs
function switchGroups(p){const sw=(p.elec||[]).filter(d=>['switch','switch3','dimmer','occ'].includes(d.type)&&d.status!=='demolish');const roomOf=d=>(p.rooms.find(r=>r.level===d.level&&inPoly(d.x,d.y,r.pts))||{}).name||'';
  return sw.map((s,i)=>{const ls=(s.links||[]).map(id=>(p.elec||[]).find(d=>d.id===id)).filter(Boolean);return {id:s.id,label:`S${i+1}`,type:ELEC[s.type].label,room:roomOf(s),lights:ls,dim:s.type==='dimmer',watts:ls.reduce((w,l)=>w+Math.round((l.lumens||LUMENS[l.type])/90),0)};});}
function lightingSchedule(p){const rows={};const roomOf=d=>(p.rooms.find(r=>r.level===d.level&&inPoly(d.x,d.y,r.pts))||{}).name||'outside';const groups=switchGroups(p);
  for(const d of (p.elec||[])){if(!LUMENS[d.type]||d.status==='demolish')continue;const mk=lightMark(p,d);const R=rows[mk]=rows[mk]||{mark:mk,type:ELEC[d.type].label,lumens:d.lumens||LUMENS[d.type],kelvin:d.kelvin||2700,dim:!!d.dim,qty:0,rooms:new Set(),sw:new Set()};
    R.qty++;R.rooms.add(roomOf(d));for(const g of groups)if(g.lights.includes(d))R.sw.add(g.label);}
  return Object.values(rows).sort((a,b)=>a.mark>b.mark?1:-1).map(r=>({...r,watts:Math.round(r.lumens/90),rooms:[...r.rooms].join(', '),sw:[...r.sw].join(' ')||'none'}));}
function lightingCSV(p){const q=s=>'"'+String(s).replace(/"/g,'""')+'"';return [['Mark','Fixture','Qty','Lumens','Kelvin','Watts (LED est.)','Dimmable','Switches','Rooms'].map(q).join(','),...lightingSchedule(p).map(r=>[r.mark,r.type,r.qty,r.lumens,r.kelvin,r.watts,r.dim?'yes':'no',r.sw,r.rooms].map(q).join(','))].join('\n');}
function LightingSchedule({p,commit}){const rows=lightingSchedule(p);const groups=switchGroups(p);const [k,setK]=useState('3000');
  const setAll=()=>commit({...p,elec:(p.elec||[]).map(d=>LUMENS[d.type]?{...d,kelvin:+k}:d)});
  return html`<section className="sec ls"><h3>Lighting schedule</h3>
    ${rows.length?html`<div className="tablewrap"><table className="mat"><thead><tr><th>Mark</th><th>Fixture</th><th className="num">Qty</th><th className="num">Lumens</th><th>Color</th><th className="num">Watts</th><th>Dim</th><th>Switches</th><th>Rooms</th></tr></thead><tbody>
      ${rows.map(r=>html`<tr key=${r.mark}><td className="mono"><b>${r.mark}</b></td><td>${r.type}</td><td className="num">${r.qty}</td><td className="num">${r.lumens}</td><td><span className="kswatch" style=${{background:'#'+kelvinHex(r.kelvin).toString(16).padStart(6,'0')}}></span> ${r.kelvin} K</td><td className="num">${r.watts}</td><td>${r.dim?'yes':''}</td><td className="mono">${r.sw}</td><td>${r.rooms}</td></tr>`)}</tbody></table></div>
      <div className="row"><label>Set every light to <select className="inp" value=${k} onChange=${e=>setK(e.target.value)} aria-label="Color temperature for every light">${KELVINS.map(([v,l])=>html`<option key=${v} value=${v}>${l}</option>`)}</select></label><button className="btn" onClick=${setAll}>Apply</button>
        <button className="btn" onClick=${()=>saveFile(safeName(p.name)+'-lighting-schedule.csv',lightingCSV(p))}>Download CSV</button></div>`:html`<p className="note">No lights on the electrical plan yet.</p>`}
    <h3>Switch groups</h3>${groups.length?html`<ul className="note insplist">${groups.map(g=>html`<li key=${g.id}><b>${g.label}</b> ${g.type} in ${g.room||'no room'}: ${g.lights.length?g.lights.map(l=>lightMark(p,l)).join(', '):'no lights linked'}${g.lights.length?` · about ${g.watts} W LED`:''}${g.dim?' · dimmer':''}</li>`)}</ul>`:html`<p className="note">No switches yet. Electrical › Link switches ties lights to the nearest switch.</p>`}</section>`;}
{const _LT=LightingTab;LightingTab=function(props){return html`<${_LT} ...${props}/><${LightingSchedule} ...${props}/>`;};}
// 3D view: room fill light takes the room's light color
function roomLightColor(p,r){const ls=(p.elec||[]).filter(d=>LUMENS[d.type]&&d.status!=='demolish'&&d.level===r.level&&inPoly(d.x,d.y,r.pts)&&d.kelvin);if(!ls.length)return 0xfff1dc;const K=ls.reduce((s,d)=>s+d.kelvin,0)/ls.length;const c=kelvinRGB(K);const mix=v=>Math.round((v*0.7+0.3)*255);return (mix(c[0])<<16)|(mix(c[1])<<8)|mix(c[2]);}
