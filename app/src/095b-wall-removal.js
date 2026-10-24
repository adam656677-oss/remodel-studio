/* ======================= wall removal wizard: is it bearing, beam size, posts, footings, shoring, and what goes on the list ======================= */
const SOIL_PSF=1500; // IRC Table R401.4.1 presumptive bearing for clay, sandy clay, silty clay (CL, ML, MH, CH) when soil is not tested
// does the framing above land on this wall? compare joist spans with and without it
function bearingGuess(p,w){const lv=lvlOf(p,w.level);if(!lv)return {likely:false,why:[]};if(w.kind==='exterior')return {likely:true,why:['Outside walls carry the roof and ceiling.']};
  const why=[];let likely=false;const top=isTop(p,lv);const fr=framingOf(lv);const above=levelAbove(p,lv);
  const sups=(withW)=>p.walls.filter(o=>o.level===lv.id&&o.id!==w.id&&(o.status!=='demolish'?(o.bearing||o.kind==='exterior'):o.bearing)).concat(withW?[w]:[]);
  const S1=sups(true),S0=sups(false);const rooms=p.rooms.filter(r=>r.level===lv.id).filter(r=>{const P=r.pts.map(([x,y])=>({x,y}));const m={x:(w.x1+w.x2)/2,y:(w.y1+w.y2)/2};for(let i=0;i<P.length;i++)if(segDistPt(m,P[i],P[(i+1)%P.length])<=w.thick/2+3)return true;return false;});
  const trussed=p.roofs.some(rf=>rf.level===lv.id&&rafterOf(rf).system==='trusses');
  for(const r of rooms){const c=polyLabelPt(r.pts);const pt={x:c[0],y:c[1]};const sx1=spanAcross(pt,'x',S1),sy1=spanAcross(pt,'y',S1);let axis='x',L1=sx1;if(sy1!=null&&(sx1==null||sy1<sx1)){axis='y';L1=sy1;}
    const L0=spanAcross(pt,axis,S0);const d=wdir(w);const crosses=axis==='x'?Math.abs(d.y)>0.7:Math.abs(d.x)>0.7;
    if(crosses&&L1!=null&&(L0==null||L0>L1+12)){likely=true;why.push(`${top&&!trussed?'Ceiling':'Floor'} joists over ${r.name} likely run ${axis==='x'?'east-west':'north-south'} and land on this wall (span ${fmtLen(L1)}; without it about ${L0?fmtLen(L0):'the whole house'}).`);}}
  if(trussed&&top&&!above){why.push('The roof is framed with trusses, which usually span wall to wall without interior support. Confirm in the attic.');if(!above)likely=false;}
  if(above){const wa=p.walls.filter(o=>o.level===above.id&&o.status!=='demolish');const m={x:(w.x1+w.x2)/2,y:(w.y1+w.y2)/2};if(wa.some(o=>segDistPt(m,{x:o.x1,y:o.y1},{x:o.x2,y:o.y2})<8)){likely=true;why.push(`A wall on ${above.name} sits right above this one.`);}}
  if(!why.length)why.push('Nothing in the model lands on this wall. Still look in the attic or crawlspace: joists that lap or butt over it, a beam or girder below it, or posts under it mean it is bearing.');
  return {likely,why};}
function removalDesign(p,w,o={}){const L=wlen(w);const load=wallLoad(p,{...w,bearing:true});const species=o.species||'syp2';const opts={liveLim:360,totLim:240};
  const fits=BEAMS.map(b=>{const m=memberProps(b.lvl?b:{...b,species},b.size,b.plies);const r=checkMember(m,L+6,load.total+(o.selfWt??12),load.live,opts);return {b,ratio:r.ratio,gov:r.gov};});
  const pick=o.beam?fits.find(f=>f.b.id===o.beam):fits.find(f=>f.ratio<=1);const R=(load.total+(o.selfWt??12))*(L+6)/12/2;// lb at each end
  const post=R<=3000?'(2) 2x4 jack studs':R<=5500?'(3) 2x4 jack studs or 4x4 post':R<=9000?'4x6 post or (3) 2x6 studs':'6x6 post (engineer to confirm)';
  const area=R/(o.soil||SOIL_PSF);const side=Math.max(16,Math.ceil(Math.sqrt(area)*12/2)*2);const depth=side>=24?12:10;const cy=(side*side*depth)/46656;
  return {L,load,fits,pick,R,post,footing:{side,depth,cy},hangers:o.flush?Math.ceil(L/16)*2:0};}
function WallRemovalModal({p,commit,onClose,sel}){const w=p.walls.find(x=>sel&&x.id===sel.id)||null;const G=useMemo(()=>w?bearingGuess(p,w):null,[p,w&&w.id]);
  const [bear,setBear]=useState(w?(w.bearing||G.likely):false);const [flush,setFlush]=useState(true);const [beam,setBeam]=useState(null);const [soil,setSoil]=useState(SOIL_PSF);const [shore,setShore]=useState(true);
  if(!w)return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog"><h2>Remove a wall</h2><p className="note">Select a wall on the plan first, then open this again from its panel.</p><div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Close</button></div></div></div>`;
  const D=removalDesign(p,w,{flush,beam,soil});const lv=lvlOf(p,w.level);const fr=framingOf(lv);const first=lv.id===groundLevel(p).id;const slab=first&&fr.foundation==='slab';
  const apply=()=>{const rm=bear?{beam:(D.pick||{}).b?.id||null,label:D.pick?D.pick.b.label:'Engineer to size',flush,post:D.post,footing:D.footing,R:Math.round(D.R),shore,soil,span:D.L}:{shore:false};
    commit({...p,walls:p.walls.map(x=>x.id===w.id?{...x,bearing:bear,status:'demolish',removal:rm}:x)});onClose();};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide wallrm" role="dialog" aria-label="Remove a wall"><h2>Remove this wall</h2>
    <p className="note">${fmtLen(D.L)} ${w.kind==='exterior'?'outside':'inside'} wall on ${lv.name}. This sizes a replacement beam from the loads in the model for planning; have a licensed engineer or the building official confirm before you cut (IRC R301.1.3).</p>
    <div className="wr-grid"><section><h3>1. Is it load-bearing?</h3><div className=${'wr-verdict '+(G.likely?'yes':'no')}>${G.likely?'Probably load-bearing':'Probably not load-bearing'}</div><ul className="note">${G.why.map((t,i)=>html`<li key=${i}>${t}</li>`)}</ul>
        <label className="check"><input type="checkbox" checked=${bear} onChange=${e=>setBear(e.target.checked)}/> Treat it as load-bearing</label></section>
      ${bear?html`<section><h3>2. Beam</h3><div className="stat"><span>Load on the beam</span><span className="mono">${Math.round(D.load.total)} plf</span></div>${D.load.parts.map((t,i)=>html`<div key=${i} className="note">· ${t}</div>`)}
        <${Field} label="Beam" id="wr-b"><select id="wr-b" className="inp" value=${beam||(D.pick?D.pick.b.id:'')} onChange=${e=>setBeam(e.target.value||null)}>${D.fits.map(f=>html`<option key=${f.b.id} value=${f.b.id}>${f.b.label} · ${Math.round(f.ratio*100)}% of capacity${f.ratio>1?' (too small)':''}</option>`)}</select><//>
        ${!D.pick?html`<div className="msg err">No stock beam in the list carries this. An engineer needs to size it (steel or a deeper LVL).</div>`:null}
        <div className="row2"><label className="check"><input type="radio" name="wr-f" checked=${flush} onChange=${()=>setFlush(true)}/> Flush beam (in the ceiling, joist hangers)</label><label className="check"><input type="radio" name="wr-f" checked=${!flush} onChange=${()=>setFlush(false)}/> Dropped beam (below the ceiling)</label></div></section>
      <section><h3>3. Posts and footings</h3><div className="stat"><span>Load at each end</span><span className="mono">${Math.round(D.R).toLocaleString()} lb</span></div><div className="stat"><span>Post at each end</span><span>${D.post}</span></div>
        <${Field} label="Soil bearing" id="wr-s"><${Sel} id="wr-s" value=${String(soil)} onChange=${v=>setSoil(+v)} options=${[['1500','1,500 psf (clay, untested; IRC default)'],['2000','2,000 psf (sandy or silty clay)'],['3000','3,000 psf (sand, gravel)']]}/><//>
        <div className="stat"><span>Footing under each post</span><span>${D.footing.side}" x ${D.footing.side}" x ${D.footing.depth}" concrete${slab?' (cut the slab)':first?' on a pier in the crawlspace':' carried down to the foundation'}</span></div>
        <p className="note">The load must reach the ground: posts land on the footing or on a beam or wall below that is sized for it, with solid blocking through the floor.</p></section>
      <section><h3>4. Before you cut</h3><label className="check"><input type="checkbox" checked=${shore} onChange=${e=>setShore(e.target.checked)}/> Temporary shoring walls on both sides (${fmtLen(D.L+24)} each)</label>
        <ul className="note"><li>Check for wiring, plumbing, gas and ducts in the wall.</li><li>Get the permit; framing inspection before the ceiling closes.</li><li>Patch the floor, walls and ceiling where the wall was.</li></ul></section>`:html`<section><h3>2. Remove it</h3><p className="note">Not load-bearing: it comes out as demolition. Patch the floor, walls and ceiling where it met them.</p></section>`}</div>
    <div className="row"><button className="btn primary" onClick=${apply}>Mark wall for removal${bear?' with this beam':''}</button><span className="spacer"></span><button className="btn" onClick=${onClose}>Cancel</button></div></div></div>`;}
EXTRA_DIALOGS.wallrm=WallRemovalModal;
regExtra({takeoff:(p,add)=>{for(const w of p.walls.filter(w=>w.status==='demolish'&&w.removal&&w.bearing)){const r=w.removal;const L=wlen(w)+6;const ft=Math.ceil(L/12/2)*2;const b=BEAMS.find(x=>x.id===r.beam);
    if(b){if(b.lvl)add('Headers and beams',`1-3/4" x ${b.lvl}" LVL beam, ${ft}' (${b.plies} plies)`,b.plies,'EA','replacing a removed bearing wall');else add('Headers and beams',`${b.size} x ${ft}' (beam)`,b.plies,'EA','replacing a removed bearing wall');}
    else add('Headers and beams','Engineered beam (to be sized)',1,'EA','replacing a removed bearing wall');
    add('Headers and beams',`Posts: ${r.post}`,2,'EA','one at each end');
    if(r.footing)add('Foundation',`Post footing ${r.footing.side}" x ${r.footing.side}" x ${r.footing.depth}"`,Math.ceil(r.footing.cy*2*10)/10,'CY','two footings');
    if(r.flush)add('Headers and beams','Joist hangers for flush beam',Math.ceil(L/16)*2,'EA');
    if(r.shore)add('Demolition','Temporary shoring wall (rent or build)',Math.ceil(wlen(w)/12+2)*2,'LF','both sides of the wall');
    add('Demolition','Patch floor, walls and ceiling at removed wall',Math.ceil(wlen(w)/12),'LF');}}});
