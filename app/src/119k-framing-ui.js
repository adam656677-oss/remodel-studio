/* ======================= roof wizard and floor framing dialogs ======================= */
const fitS=(B,W,H,pad=16)=>{const s=Math.min((W-2*pad)/Math.max(1,B.x1-B.x0),(H-2*pad)/Math.max(1,B.y1-B.y0));const ox=(W-(B.x1-B.x0)*s)/2,oy=(H-(B.y1-B.y0)*s)/2;return {S:(x,y)=>[ox+(x-B.x0)*s,oy+(y-B.y0)*s],s};};
const ROOF_ICONS={gable:'M4 18 L20 18 L20 12 L12 5 L4 12 Z',hip:'M3 18 L21 18 L17 9 L7 9 Z',dutch:'M3 18 L21 18 L17 10 L14 10 L14 7 L10 7 L10 10 L7 10 Z',gambrel:'M3 18 L21 18 L20 11 L15 6 L9 6 L4 11 Z',mansard:'M3 18 L21 18 L19 9 L5 9 Z',shed:'M4 18 L20 18 L20 9 L4 13 Z',flat:'M3 18 L21 18 L21 12 L3 12 Z'};
function RoofWizard({p,commit,levelId,onClose}){const lvls=sortedLevels(p);const topLv=lvls.filter(l=>!levelAbove(p,l)).pop()||lvls[lvls.length-1];
  const def=p.settings.roofDefault||{};const cur=p.roofs.find(r=>r.level===(levelId||topLv.id))||p.roofs[0]||{};const rf0=cur.framing||{};
  const [lv,setLv]=useState(()=>(p.roofs.some(r=>r.level===levelId)||!levelAbove(p,lvlOf(p,levelId)||topLv))?levelId||topLv.id:topLv.id);
  const [o,setO]=useState(()=>({style:cur.style||def.style||'hip',pitch:cur.pitch||def.pitch||6,overhang:cur.overhang??def.overhang??12,ridge:'auto',system:rf0.system||'trusses',trussType:rf0.trussType||'common',trussSpacing:rf0.trussSpacing||24,heel:rf0.heel??null,setback:rf0.setback||84,girderPly:rf0.girderPly||2,
    rafter:rf0.rafter||'2x8',spacing:rf0.spacing||16,species:rf0.species||'syp2',cover:rf0.cover||'asphalt',under:'synthetic',ice:false,drip:true,ridgeVent:true,soffitVent:true,gutters:true}));
  const set=patch=>setO(x=>({...x,...patch}));
  const framing={system:o.system,cover:o.cover,trussType:o.trussType,trussSpacing:o.trussSpacing,...(o.heel!=null?{heel:o.heel}:{}),setback:o.setback,girderPly:o.girderPly,rafter:o.rafter,spacing:o.spacing,species:o.species,under:o.under,ice:o.ice,drip:o.drip,vent:{ridge:o.ridgeVent,soffit:o.soffitVent,none:!o.ridgeVent&&!o.soffitVent}};
  const roofs=useMemo(()=>autoRoof(p,lv,{style:o.style,pitch:o.pitch,overhang:o.overhang}).map(r=>({...r,ridge:o.ridge==='auto'||['hip','dutch','mansard'].includes(o.style)?r.ridge:o.ridge,framing,trim:{...(r.trim||{}),gutters:o.gutters}})),[p,lv,o]);
  const q=useMemo(()=>({...p,roofs:[...p.roofs.filter(r=>r.level!==lv),...roofs]}),[p,roofs,lv]);
  const B0=planBounds(p,lv);const B=roofs.reduce((B,r)=>{const oh=r.overhang??12;return {x0:Math.min(B.x0,r.x-oh),y0:Math.min(B.y0,r.y-oh),x1:Math.max(B.x1,r.x+r.w+oh),y1:Math.max(B.y1,r.y+r.h+oh)};},B0);
  const {S}=fitS(B,380,260);const lvO=lvlOf(p,lv);
  // numbers: roofing, edges, ventilation, trusses
  const stats=useMemo(()=>{let area=0,plan=0;for(const r of roofs){const b=roofBuild(r,roofTop(q,r));for(const f of b.polys){const [a,c,e]=f;const u=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],v=[e[0]-a[0],e[1]-a[1],e[2]-a[2]];area+=Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])/2;}plan+=r.w*r.h;}
    let G={lines:[],edges:[]};try{G=roofPlanGeo(q,lv,roofs);}catch(e){}const len=k=>G.lines.filter(l=>l.kind===k).reduce((s,l)=>s+Math.hypot(l.b[0]-l.a[0],l.b[1]-l.a[1]),0)/12;const eave=G.edges.reduce((s,e)=>s+Math.hypot(e.b[0]-e.a[0],e.b[1]-e.a[1]),0)/12;
    const attic=plan/144;const nfa=Math.ceil(attic/300*144);const trusses=o.system==='trusses'?roofs.reduce((n,r)=>n+trussLayout(q,r).schedule.reduce((m,s)=>m+s.qty,0),0):0;
    return {sq:area/144/100,area:area/144,ridge:len('ridge'),hip:len('hip'),valley:len('valley'),eave,attic,nfa,trusses};},[roofs,q]);
  const T1=useMemo(()=>{if(o.system!=='trusses'||!roofs.length)return null;const r=roofs[0];const L=trussLayout(q,r);const it=L.items.find(i=>i.kind==='common')||L.items.find(i=>!i.jack);if(!it)return null;const b=roofBuild(r,roofTop(q,r));const pr=trussProfile(q,r,b,it);return pr&&{pr,it,sched:L.schedule};},[roofs,q,o.system]);
  const apply=()=>{const next={...q,dormers:(p.dormers||[]).filter(d=>q.roofs.some(r=>r.id===d.roof)),settings:{...p.settings,roofDefault:{style:o.style,pitch:o.pitch,overhang:o.overhang}}};commit(next);onClose();window.__say&&window.__say(`Built ${roofs.length} roof${roofs.length===1?'':'s'} on ${lvO.name}${o.system==='trusses'?` with ${stats.trusses} trusses and jacks`:''}. See the Roof framing tab and sheet S3.0.`);};
  const sel=(id,label,val,opts,on)=>html`<${Field} label=${label} id=${id}><${Sel} id=${id} value=${String(val)} onChange=${on} options=${opts}/><//>`;
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide rw" role="dialog" aria-label="Roof wizard"><h2>Roof wizard</h2>
    <div className="rw-grid"><div className="rw-left">
      <h3>1 · Shape</h3><div className="rw-styles">${ROOF_STYLES.map(([k,l])=>html`<button key=${k} className=${'rw-style'+(o.style===k?' on':'')} aria-pressed=${o.style===k} onClick=${()=>set({style:k})}><svg viewBox="0 0 24 22" width="44" height="40"><path d=${ROOF_ICONS[k]||ROOF_ICONS.gable}/></svg><span>${l.split(' (')[0]}</span></button>`)}</div>
      ${sel('rw-lv','Level',lv,lvls.map(l=>[l.id,l.name+(levelAbove(p,l)?'':' (top)')]),setLv)}
      ${sel('rw-pitch','Pitch',o.pitch,[2,3,4,5,6,7,8,9,10,12,14,16,18].map(n=>[String(n),`${n}/12${n<4?' (low slope)':''}`]),v=>set({pitch:+v}))}
      <${Field} label="Overhang" id="rw-oh"><${LenInput} id="rw-oh" value=${o.overhang} onChange=${v=>v>=0&&set({overhang:v})}/><//>
      ${['gable','gambrel','shed'].includes(o.style)?sel('rw-ridge','Ridge runs',o.ridge,[['auto','The long way (automatic)'],['x','East to west'],['y','North to south']],v=>set({ridge:v})):null}
      <h3>2 · Framing</h3>
      ${sel('rw-sys','System',o.system,[['trusses','Engineered trusses'],['rafters','Rafters and ceiling joists']],v=>set({system:v}))}
      ${o.system==='trusses'?html`${sel('rw-tt','Truss type',o.trussType,TRUSS_TYPES,v=>set({trussType:v}))}${sel('rw-tsp','Spacing',o.trussSpacing,[['16','16" o.c.'],['19.2','19.2" o.c.'],['24','24" o.c.']],v=>set({trussSpacing:+v}))}
        ${['hip','dutch','mansard'].includes(o.style)?html`<${Field} label="Hip girder setback" id="rw-sb"><${LenInput} id="rw-sb" value=${o.setback} bare="ft" onChange=${v=>v>0&&set({setback:v})}/><//>${sel('rw-gp','Girder plies',o.girderPly,[['2','2-ply'],['3','3-ply']],v=>set({girderPly:+v}))}`:null}`
        :html`${sel('rw-raf','Rafters',o.rafter,Object.keys(LUMBER).map(k=>[k,k]),v=>set({rafter:v}))}${sel('rw-rsp','Spacing',o.spacing,[['12','12" o.c.'],['16','16" o.c.'],['24','24" o.c.']],v=>set({spacing:+v}))}${sel('rw-spc','Lumber',o.species,Object.entries(SPECIES).map(([k,v])=>[k,v.label]),v=>set({species:v}))}`}
      <h3>3 · Covering and venting</h3>
      ${sel('rw-cov','Covering',o.cover,Object.entries(ROOF_COVER).map(([k,v])=>[k,v.label]),v=>set({cover:v}))}
      ${sel('rw-und','Underlayment',o.under,[['synthetic','Synthetic underlayment'],['felt30','#30 felt'],['ice','Ice and water shield, full roof']],v=>set({under:v}))}
      <label className="check"><input type="checkbox" checked=${o.ice} onChange=${e=>set({ice:e.target.checked})}/> Ice barrier at the eaves, 24" inside the wall (R905.1.2, cold climates)</label>
      <label className="check"><input type="checkbox" checked=${o.drip} onChange=${e=>set({drip:e.target.checked})}/> Drip edge at eaves and rakes (R905.2.8.5)</label>
      <label className="check"><input type="checkbox" checked=${o.ridgeVent} onChange=${e=>set({ridgeVent:e.target.checked})}/> Ridge vent</label>
      <label className="check"><input type="checkbox" checked=${o.soffitVent} onChange=${e=>set({soffitVent:e.target.checked})}/> Soffit vents</label>
      <label className="check"><input type="checkbox" checked=${o.gutters} onChange=${e=>set({gutters:e.target.checked})}/> Gutters and downspouts</label>
    </div><div className="rw-right">
      <h3>Roof framing plan</h3>
      <svg className="rw-plan" viewBox="0 0 380 260" role="img" aria-label="Roof framing preview">${q.walls.filter(w=>w.level===lv).map(w=>{const A=S(w.x1,w.y1),Bq=S(w.x2,w.y2);return html`<line key=${w.id} x1=${A[0]} y1=${A[1]} x2=${Bq[0]} y2=${Bq[1]} className="rw-wall"/>`;})}
        ${roofFramingSVG(q,lvO,S,{s:0.6})}</svg>
      ${T1?html`<h3>Typical truss (${T1.it.mark})</h3><${TrussSVG} pr=${T1.pr}/>`:null}
      <div className="rw-stats">
        <div><span>Roofing</span><b>${stats.sq.toFixed(1)} squares</b><small>${Math.round(stats.area)} sq ft</small></div>
        <div><span>Ridges and hips · valleys · eaves and rakes</span><b>${Math.round(stats.ridge)}' · ${Math.round(stats.valley)}' · ${Math.round(stats.eave)}'</b></div>
        <div><span>Attic ventilation (R806.2)</span><b>${stats.nfa} sq in free area</b><small>1/300 of ${Math.round(stats.attic)} sq ft with balanced high and low vents; ${Math.round(stats.nfa/2)} at the ridge, ${Math.round(stats.nfa/2)} at the soffits</small></div>
        ${o.system==='trusses'?html`<div><span>Trusses and jacks</span><b>${stats.trusses}</b><small>${T1?T1.sched.map(s=>s.qty+' '+s.mark).join(', '):''}</small></div>`:null}
      </div>
      ${!roofs.length?html`<p className="note bad">There are no outside walls on ${lvO.name} to roof.</p>`:null}
    </div></div>
    <div className="row"><span className="note">This replaces the roofs on ${lvO.name}. Undo brings them back.</span><span className="spacer"></span><button className="btn" onClick=${onClose}>Cancel</button><button className="btn primary" disabled=${!roofs.length} onClick=${apply}>Build the roof</button></div></div></div>`;}
function TrussSVG({pr,w=380,h=150}){const xs=[...pr.top.map(q=>q[0]),0,pr.L],zs=[...pr.top.map(q=>q[1]),...pr.bot.map(q=>q[1])];const B={x0:Math.min(...xs),x1:Math.max(...xs),y0:-Math.max(...zs),y1:-Math.min(...zs)};const {S}=fitS(B,w,h,12);const P=q=>S(q[0],-q[1]);
  const poly=a=>a.map(q=>P(q).join(',')).join(' ');
  return html`<svg className="rw-truss" viewBox=${`0 0 ${w} ${h}`} role="img" aria-label="Truss elevation"><polyline points=${poly(pr.top)} className="rw-chord"/><polyline points=${poly(pr.bot)} className="rw-chord"/>${pr.webs.map((wv,i)=>html`<line key=${i} x1=${P(wv[0])[0]} y1=${P(wv[0])[1]} x2=${P(wv[1])[0]} y2=${P(wv[1])[1]} className="rw-web"/>`)}
    <text x=${w/2} y=${h-2} textAnchor="middle" className="rw-dim">${fmtLen(pr.L)} span</text></svg>`;}
EXTRA_DIALOGS.roofwiz=RoofWizard;
// ---------- floor framing ----------
function FloorFramingModal({p,commit,levelId,onClose}){const lvls=sortedLevels(p);const [lid,setLid]=useState(levelId||lvls[0].id);const lv=lvlOf(p,lid)||lvls[0];const J=joistOpt(lv);
  const up=patch=>commit({...p,levels:p.levels.map(l=>l.id===lv.id?{...l,framing:{...(l.framing||{}),...patch}}:l)});
  const L=useMemo(()=>{try{return joistLayout(p,lv);}catch(e){console.error(e);return null;}},[p,lv.id]);const B=planBounds(p,lv.id);const {S}=fitS(B,420,300);const rows=L?joistSchedule(L):[];
  const first=groundLevel(p).id===lv.id;const sel=(id,label,val,opts,on)=>html`<${Field} label=${label} id=${id}><${Sel} id=${id} value=${String(val)} onChange=${on} options=${opts}/><//>`;
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide rw" role="dialog" aria-label="Floor framing"><h2>Floor framing</h2>
    <div className="rw-grid"><div className="rw-left">
      ${sel('ff-lv','Floor of',lid,lvls.map(l=>[l.id,l.name]),setLid)}
      ${first?sel('ff-fd','Foundation',J.foundation,[['crawl','Crawlspace'],['basement','Basement'],['slab','Slab on grade (no joists)']],v=>up({foundation:v})):null}
      ${first&&J.foundation==='slab'?html`<p className="note">A slab floor has no joists. Pick crawlspace or basement to frame this floor.</p>`:html`
      ${sel('ff-type','Joists',J.type,[['lumber','Dimensional lumber'],['ijoist','I-joists'],['truss','Open-web floor trusses']],v=>up({jtype:v}))}
      ${J.type==='lumber'?html`${sel('ff-sz','Size',J.joist,['2x6','2x8','2x10','2x12'].map(k=>[k,k]),v=>up({joist:v}))}${sel('ff-sp','Lumber',J.species,Object.entries(SPECIES).map(([k,v])=>[k,v.label]),v=>up({species:v}))}`:J.type==='ijoist'?sel('ff-ij','Depth',J.ij,Object.keys(IJOISTS).map(k=>[k,k.replace('.875','-7/8').replace('.5','-1/2')+'"']),v=>up({ijoist:v})):sel('ff-ft','Depth',J.ft,Object.keys(FTRUSS).map(k=>[k,k+'"']),v=>up({ftruss:+v}))}
      ${sel('ff-sp2','Spacing',J.spacing,[['12','12" o.c.'],['16','16" o.c.'],['19.2','19.2" o.c.'],['24','24" o.c.']],v=>up({spacing:+v}))}
      ${sel('ff-dir','Direction',J.dir,[['auto','Shortest span (automatic)'],['x','East to west'],['y','North to south']],v=>up({dir:v}))}
      ${first&&J.foundation!=='slab'?html`<${Field} label="Girder spacing" id="ff-gir"><${LenInput} id="ff-gir" value=${J.girders||0} bare="ft" onChange=${v=>v>=0&&up({girders:v})}/><//>`:null}
      <p className="note">Allowable spans: lumber from the NDS for 40 psf live (30 at bedrooms) plus 10 dead, L/360. I-joist and floor-truss spans are typical values; confirm with the maker's tables.</p>`}
      ${L&&L.warn.length?html`<ul className="ff-warn">${L.warn.map((t,i)=>html`<li key=${i}>${t}</li>`)}</ul>`:null}
    </div><div className="rw-right">
      <svg className="rw-plan ff-plan" viewBox="0 0 420 300" role="img" aria-label="Floor framing plan">${floorFramingSVG(p,lv,S,{s:0.6})}</svg>
      ${rows.length?html`<table className="mat ff-sched"><thead><tr><th>Item</th><th className="num">Qty</th><th>Unit</th></tr></thead><tbody>${rows.map((r,i)=>html`<tr key=${i}><td>${r.item}</td><td className="num">${r.qty}</td><td>${r.unit}</td></tr>`)}</tbody></table>`:null}
    </div></div>
    <div className="row"><span className="note">Changes save as you go. The joists show in the 3D framing view, the Floor framing tab and the S2 sheets.</span><span className="spacer"></span><button className="btn primary" onClick=${onClose}>Done</button></div></div></div>`;}
EXTRA_DIALOGS.joists=FloorFramingModal;
