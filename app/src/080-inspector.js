/* ======================= inspector ======================= */
function IssueRow({i,onClick}){
  return html`<button className=${'issue sev-'+i.sev} onClick=${onClick} disabled=${!onClick}>
    <span className=${'pill '+(i.sev==='error'?'bad':'warn')}>${i.sev==='error'?'Fails':'Check'}</span>
    <span className="issue-t"><b>${i.title}</b><span>${i.detail}</span>${i.rule?html`<small>${i.rule.set} ${i.rule.code} · ${i.rule.title}</small>`:html`<small>Model check</small>`}</span></button>`;
}
function RuleRow({p,r,commit}){
  const ov=p.settings?.rules?.[r.id]; const val=rv(p,r.id); const set=v=>{const rules={...(p.settings.rules||{})};if(v==null||Math.abs(v-r.value)<1e-9)delete rules[r.id];else rules[r.id]=v;commit({...p,settings:{...p.settings,rules}});};
  return html`<div className=${'rulerow'+(ov!=null?' changed':'')}><div><b>${r.set} ${r.code}</b><span>${r.title}</span></div>
    ${r.unit==='in'?html`<${LenInput} id=${'rule-'+r.id} value=${val} onChange=${set}/>`:html`<${NumInput} id=${'rule-'+r.id} value=${val} step=${0.1} min=${0} onChange=${set}/>`}
    ${ov!=null?html`<button className="btn" onClick=${()=>set(null)} title=${'Reset to '+r.value}>Reset</button>`:html`<span></span>`}</div>`;
}
function MemberCard({m}){
  const pct=Math.round(m.ratio*100); const cls=m.ratio>1?'bad':m.ratio>0.85?'warn':'ok';
  return html`<div className="member"><div className="mrow"><b>${m.label}</b><span className=${'pill '+cls}>${m.kind==='header'&&m.size==='Flat 2x'?'No load':m.beam?'Beam needed':pct+'%'}</span></div>
    ${m.size!=='Flat 2x'?html`<div className="bar"><span className=${cls} style=${{width:Math.min(100,pct)+'%'}}></span></div>`:null}
    <div className="note">${m.size}${m.spacing?` at ${m.spacing}" o.c.`:''} · span ${fmtLen(m.span)}${m.load?' · '+m.load:''}${m.gov&&m.gov!=='none'&&!m.beam?' · governed by '+govLabel[m.gov]:''}</div>
    ${m.suggest?html`<div className="note"><b>Suggested:</b> ${m.suggest}</div>`:null}
    ${m.parts&&m.parts.length?html`<details><summary className="note">Load breakdown</summary>${m.parts.map((t,i)=>html`<div key=${i} className="note mono">${t}</div>`)}</details>`:null}</div>`;
}
function ChecksPanel({p,issues,goTo,commit,setPanel,members=[]}){
  const [filter,setFilter]=useState('all'); const [rulesOpen,setRulesOpen]=useState(false);
  const nE=issues.filter(i=>i.sev==='error').length,nW=issues.filter(i=>i.sev==='warn').length;
  const list=issues.filter(i=>filter==='all'||i.sev===filter);
  const lvName=id=>lvlOf(p,id)?.name||'';
  const groups=[];for(const i of list){const g=lvName(i.level)||'Whole house';let G=groups.find(x=>x.g===g);if(!G)groups.push(G={g,items:[]});G.items.push(i);}
  return html`<div className="sec"><h3>Summary</h3>
      <div className="row"><span className=${'pill '+(nE?'bad':'ok')}>${nE} fail${nE===1?'s':''}</span><span className=${'pill '+(nW?'warn':'ok')}>${nW} to check</span></div>
      <p className="note">Checked against the ${p.settings?.code==='ibc'?'2021 IBC':'2021 IRC'}${p.settings?.code==='ibc'||p.settings?.ada!==false?' and the 2010 ADA Standards':''} as the building is drawn now. Tap an item to go to it. These are planning checks, not a plan review.</p>
      <div className="seg" role="group" aria-label="Filter">${[['all','All'],['error','Fails'],['warn','To check']].map(([k,l])=>html`<button key=${k} className=${filter===k?'on':''} onClick=${()=>setFilter(k)}>${l}</button>`)}</div></div>
    ${groups.length?groups.map(G=>html`<div key=${G.g} className="sec"><h3>${G.g}</h3>${G.items.map(i=>html`<${IssueRow} key=${i.id} i=${i} onClick=${i.target||i.level?()=>goTo(i):null}/>`)}</div>`)
      :html`<div className="sec"><p className="note">${issues.length?'Nothing in this filter.':'No problems found. Keep drawing; checks update as you go.'}</p></div>`}
    <div className="sec"><h3>Structure</h3><p className="note">Joists, rafters, headers and beams sized for ${p.settings?.code==='ibc'?'2021 IBC Table 1607.1 live loads by room use (offices 50 psf plus 15 psf partitions, assembly and corridors 100, storage 125; roof 20)':'2021 IRC live loads (40 psf floors, 30 psf bedrooms, 20 psf roof, attic 10 or 20 psf)'} using approximate NDS lumber values. Bars show the share of capacity used. Planning level only; an engineer signs off real changes.</p>
      ${[...members].filter(m=>!(m.kind==='header'&&m.size==='Flat 2x')).sort((a,b)=>b.ratio-a.ratio).map(m=>html`<button key=${m.id} className="memberbtn" onClick=${()=>goTo({level:m.level,target:m.target})}><${MemberCard} m=${m}/></button>`)}</div>
    <div className="sec"><button className="btn" onClick=${()=>setRulesOpen(!rulesOpen)} aria-expanded=${rulesOpen}>${rulesOpen?'Hide':'Show'} rule values</button>
      ${rulesOpen?html`<p className="note">Change a value to match a local amendment. Changed values are saved with this project.</p>${RULES.filter(r=>(r.set==='IRC'&&p.settings?.code!=='ibc')||(r.set==='IBC'&&p.settings?.code==='ibc')||(r.set==='ADA'&&(p.settings?.code==='ibc'||p.settings?.ada!==false))).map(r=>html`<${RuleRow} key=${r.id} p=${p} r=${r} commit=${commit}/>`)}`:null}</div>`;
}
function Inspector({libCtx,p,levelId,setLevelId,sel,setSel,commit,onDelete,collapsed,setCollapsed,onFile,panel,setPanel,issues,goTo,members=[]}){
  const o=findObj(p,sel);
  const up=(patch)=>commit(updObj(p,sel.kind,sel.id,patch));
  if(panel==='library') return html`<${LibraryPanel} ctx=${libCtx} onClose=${()=>setPanel('props')} collapsed=${collapsed} setCollapsed=${setCollapsed}/>`;
  if(panel==='checks') return html`<aside className=${'insp'+(collapsed?' collapsed':'')}>
    <div className="insp-h"><div style=${{minWidth:0,flex:1}}><div className="kind">Code check</div><h2>Plan check</h2></div>
      <button className="btn" onClick=${()=>setPanel('props')} aria-label="Close plan check">✕</button>
      <button className="btn mobile-only" onClick=${()=>setCollapsed(!collapsed)} aria-label=${collapsed?'Show panel':'Hide panel'}>${collapsed?'▴':'▾'}</button></div>
    <${ChecksPanel} p=${p} issues=${issues} goTo=${goTo} commit=${commit} setPanel=${setPanel} members=${members}/></aside>`;
  const mine=o&&issues?issues.filter(i=>i.target&&i.target.id===sel.id):[];
  const myMembers=o?members.filter(m=>m.target&&m.target.id===sel.id):[];
  const memberEl=myMembers.length?html`<div className="sec"><h3>Structure</h3>${myMembers.map(m=>html`<${MemberCard} key=${m.id} m=${m}/>`)}</div>`:null;
  const mineEl=mine.length?html`<div className="sec"><h3>Code checks</h3>${mine.map(i=>html`<${IssueRow} key=${i.id} i=${i}/>`)}</div>`:null;
  let title='Project',kind='', body;
  if(sel&&sel.kind==='multi'){const counts={};for(const i of sel.items)counts[i.kind]=(counts[i.kind]||0)+1;const nm={...Object.fromEntries(Object.entries(OBJ).map(([k,d])=>[k,d.plural])),wall:'walls',room:'rooms',fixture:'fixtures and cabinets',stair:'stairs',roof:'roofs',elec:'electrical devices',ramp:'ramps',shape:'shapes',dim:'dimensions',anno:'notes',opening:'doors and windows'};
    return html`<aside className=${'insp'+(collapsed?' collapsed':'')}><div className="insp-h"><div style=${{minWidth:0,flex:1}}><div className="kind">Selection</div><h2>${sel.items.length} items</h2></div>
      <button className="btn danger" onClick=${onDelete}>Delete all</button><button className="btn" onClick=${()=>setSel(null)} aria-label="Close">✕</button></div>
      <div className="sec"><h3>Selected</h3>${Object.entries(counts).map(([k,n])=>html`<div key=${k} className="stat"><span>${nm[k]||k}</span><span className="mono">${n}</span></div>`)}
      <p className="note">Drag any of them to move them together. Arrow keys nudge 1" (Shift: 12"). Ctrl+C / Ctrl+V copy them; Ctrl+D duplicates; Delete removes them. Shift-click adds or removes one item.</p></div></aside>`;}
  if(o&&sel.kind==='wall'){
    const L=wlen(o); title=o.kind==='exterior'?'Exterior wall':'Interior wall'; kind='Wall';
    const presetKey=(o.assembly&&WALL_PRESETS[o.assembly]&&WALL_PRESETS[o.assembly].thick===o.thick?o.assembly:null)||Object.keys(WALL_PRESETS).find(k=>WALL_PRESETS[k].thick===o.thick&&WALL_PRESETS[k].kind===o.kind)||'custom';
    const nOps=p.openings.filter(x=>x.wall===o.id).length;
    body=html`<div className="sec"><h3>Size</h3>
      <${Field} label="Length" id="w-len"><${LenInput} id="w-len" value=${L} bare="ft" onChange=${v=>v>0&&commit(setWallLength(p,o,v))}/><//>
      <${Field} label="Framing" id="w-pre"><${Sel} id="w-pre" value=${presetKey} onChange=${k=>{if(k==='custom')return;const pr=WALL_PRESETS[k];up({thick:pr.thick,kind:pr.kind,mat:pr.mat||'wood',assembly:k});}} options=${[...Object.entries(WALL_PRESETS).map(([k,v])=>[k,`${v.label} (${fmtLen(v.thick)})`]),['custom','Custom']]}/><//>
      <${Field} label="Thickness" id="w-t"><${LenInput} id="w-t" value=${o.thick} onChange=${v=>v>0&&up({thick:v})}/><//>
      <${Field} label="Height" id="w-h"><${LenInput} id="w-h" value=${o.height} placeholder=${'Level: '+fmtLen(lvlOf(p,o.level).height)} onChange=${v=>up({height:v})}/><//>
    </div>
    <div className="sec"><h3>Structure and plan</h3>
      <label className="check"><input id="w-bear" type="checkbox" checked=${!!o.bearing} onChange=${e=>up({bearing:e.target.checked})}/> Load-bearing wall</label>
      <${Field} label="Side" id="w-kind"><${Sel} id="w-kind" value=${o.kind} onChange=${v=>up({kind:v})} options=${[['exterior','Exterior'],['interior','Interior']]}/><//>
      <${Field} label="Remodel status" id="w-st"><${Sel} id="w-st" value=${o.status||'new'} onChange=${v=>up({status:v})} options=${[['existing','Existing'],['new','New'],['demolish','Demolish']]}/><//>
      ${o.kind==='exterior'?html`<${Field} label="Siding" id="w-sid"><${Sel} id="w-sid" value=${o.siding||'vinyl'} onChange=${v=>up({siding:v})} options=${Object.entries(SIDING).map(([k,v])=>[k,v.label])}/><//>`:null}
      <${ColorPick} id="w-col" label=${o.kind==='exterior'?'Outside color':'Color (both sides)'} value=${o.color} fallback=${'#'+((o.kind==='exterior'?SIDING_COLOR[o.siding||'vinyl']:0xfbfaf6)||0xeeeeee).toString(16).padStart(6,'0')} onChange=${v=>up({color:v})}/>
      <p className="note">${nOps} opening${nOps===1?'':'s'} in this wall. Mark walls that carry floor or ceiling joists as load-bearing; headers and beams are sized from that.</p>
    </div>
    <div className="sec"><h3>Add to this wall</h3><div className="row">
      <button className="btn" onClick=${()=>{const op={id:uid('op'),wall:o.id,type:'door',pos:L/2,width:36,height:80,sill:0,hinge:0,swing:1,status:'new'};commit({...p,openings:[...p.openings,op]});setSel({kind:'opening',id:op.id});}}>Door at center</button>
      <button className="btn" onClick=${()=>{const op={id:uid('op'),wall:o.id,type:'window',pos:L/2,width:36,height:48,sill:36,operation:'double-hung',status:'new'};commit({...p,openings:[...p.openings,op]});setSel({kind:'opening',id:op.id});}}>Window at center</button></div></div>`;
  } else if(o&&sel.kind==='opening'){
    const w=p.walls.find(w=>w.id===o.wall); const L=w?wlen(w):0; kind=o.type==='door'?'Door':'Window'; const mk=openingMarks(p)[o.id]; title=`${mk?mk+' · ':''}${fmtLen(o.width)} ${kind.toLowerCase()}`;
    const fromStart=o.pos-o.width/2;
    body=html`${o.type==='door'?html`<${DoorEditor} p=${p} o=${o} up=${up}/>`:html`<${WindowEditor} p=${p} o=${o} up=${up}/>`}<div className="sec"><h3>Size</h3>
      <${Field} label="Type" id="o-type"><${Sel} id="o-type" value=${o.type} onChange=${v=>up(v==='door'?{type:'door',sill:0,height:80,hinge:o.hinge||0,swing:o.swing||1}:{type:'window',sill:36,height:48,operation:'double-hung'})} options=${[['door','Door'],['window','Window']]}/><//>
      ${o.name?html`<p className="note">From the library: ${o.name}</p>`:null}
      <${Field} label="Width" id="o-w"><${LenInput} id="o-w" value=${o.width} onChange=${v=>v>0&&v<L&&up({width:v,pos:Math.max(v/2,Math.min(L-v/2,o.pos))})}/><//>
      <${Field} label="Height" id="o-h"><${LenInput} id="o-h" value=${o.height} onChange=${v=>v>0&&up({height:v})}/><//>
      ${o.type==='window'?html`<${Field} label="Sill height" id="o-s"><${LenInput} id="o-s" value=${o.sill} onChange=${v=>up({sill:v})}/><//>
      ${(()=>{const w=p.walls.find(x=>x.id===o.wall);return w&&w.kind==='exterior'?html`<${Field} label="Projection" id="o-bay"><${Sel} id="o-bay" value=${(o.bay&&o.bay.kind)||''} onChange=${v=>up({bay:v?{...(o.bay||{}),kind:v}:null})} options=${BAY_KINDS}/><//>
        ${o.bay&&o.bay.kind?html`<${Field} label="Projects out" id="o-bayd"><${LenInput} id="o-bayd" value=${o.bay.depth} placeholder=${o.bay.kind==='box'?'16"':'24"'} onChange=${v=>up({bay:{...o.bay,depth:v||null}})}/><//>`:null}`:null;})()}
      <${Field} label="Grilles" id="o-gr"><${Sel} id="o-gr" value=${o.grille||''} onChange=${v=>up({grille:v||null})} options=${GRILLES}/><//>
      ${(()=>{const w=p.walls.find(x=>x.id===o.wall);return w&&w.kind==='exterior'&&!(o.bay&&o.bay.kind)?html`<${Field} label="Top" id="o-top"><${Sel} id="o-top" value=${o.top||''} onChange=${v=>up({top:v||null})} options=${WIN_TOPS}/><//>`:null;})()}
      <${Field} label="Opens as" id="o-op"><${Sel} id="o-op" value=${o.operation||'double-hung'} onChange=${v=>up({operation:v})} options=${WINDOW_OPS}/><//>
      ${(()=>{const n=windowNet(o);return html`<div className="stat"><span>Net clear opening</span><span className="mono">${n.area.toFixed(1)} sq ft · ${fmtLen(Math.max(0,n.w))} × ${fmtLen(Math.max(0,n.h))}</span></div>`;})()}`:null}
    </div>
    <div className="sec"><h3>Position</h3>
      <${Field} label="From wall start" id="o-pos"><${LenInput} id="o-pos" value=${fromStart} onChange=${v=>up({pos:Math.max(o.width/2,Math.min(L-o.width/2,v+o.width/2))})}/><//>
      <p className="note">Measured from the wall's starting corner to the edge of the opening. Wall length is ${fmtLen(L)}.</p>
      ${o.type==='door'?html`<div className="row"><button className="btn" onClick=${()=>up({hinge:o.hinge?0:1})}>Flip hinge side</button><button className="btn" onClick=${()=>up({swing:-(o.swing||1)})}>Flip swing</button></div>`:null}
      ${o.type==='door'&&o.width<36?html`<span className="pill warn">Under 36" — may not give the 32" ADA clear opening</span>`:null}
    </div>
    ${o.type==='door'?null:html`<div className="sec"><h3>Color</h3><${ColorPick} id="o-col" label="Frame color" value=${o.color} fallback="#f7f7f4" onChange=${v=>up({color:v})}/></div>`}
    ${w&&w.kind==='exterior'?html`<div className="sec"><h3>Outside trim and shutters</h3>
      <${Field} label="Outside casing" id="o-xc"><${Sel} id="o-xc" value=${String(o.extTrim??(w.siding==='brick'?0:3.5))} onChange=${v=>up({extTrim:+v})} options=${[['0','None (brick mould only)'],['3.5','1x4 flat'],['5.5','1x6 flat'],['7.25','1x8 craftsman']]}/><//>
      ${o.type==='window'?html`<${Field} label="Shutters" id="o-sh"><${Sel} id="o-sh" value=${o.shutters||'none'} onChange=${v=>up({shutters:v})} options=${SHUTTERS}/><//>
        ${(o.shutters||'none')!=='none'?html`<${ColorPick} id="o-shc" label="Shutter color" value=${o.shutterColor} fallback="#2f3b33" onChange=${v=>up({shutterColor:v})}/>`:null}`:null}
      <${ColorPick} id="o-xtc" label="Trim color" value=${o.trimColor} fallback="#f6f4ee" onChange=${v=>up({trimColor:v})}/></div>`:null}
    ${w&&(w.bearing||w.kind==='exterior')?html`<div className="sec"><h3>Header</h3><${Field} label="Header" id="o-hdr"><${Sel} id="o-hdr" value=${o.header||'auto'} onChange=${v=>up({header:v})} options=${[['auto','Size automatically'],...BEAMS.map(b=>[b.id,b.label])]}/><//></div>`:null}`;
  } else if(o&&sel.kind==='room'){
    kind='Room'; title=o.name; const a=polyArea(o.pts)/144;
    body=html`<div className="sec"><h3>Room</h3>
      <${Field} label="Name" id="r-name"><input id="r-name" className="inp" value=${o.name} onChange=${e=>up({name:e.target.value})}/><//>
      <${Field} label="Use" id="r-use"><${Sel} id="r-use" value=${o.use} onChange=${v=>up({use:v})} options=${ROOM_USES}/><//>
      <${Field} label="Floor finish" id="r-fin"><${Sel} id="r-fin" value=${o.finish||(o.use==='bath'||o.use==='kitchen'||o.use==='laundry'?'tile':o.use==='garage'?'concrete':'lvp')} onChange=${v=>up({finish:v})} options=${Object.entries(FLOOR_FINISH).map(([k,v])=>[k,v.label])}/><//>
      <div className="stat"><span>Floor area</span><span className="mono">${a.toFixed(1)} sq ft</span></div>
      <div className="stat"><span>Perimeter</span><span className="mono">${fmtLen(polyPerim(o.pts))}</span></div>
      <div className="stat"><span>Corners</span><span className="mono">${o.pts.length}</span></div>
      <p className="note">Room use sets the code rules and the floor live load (bedrooms 30 psf, other rooms 40 psf). Drag corner dots to reshape.</p></div>
    <${RoomFinishes} p=${p} o=${o} up=${up} commit=${commit}/>`;
  } else if(o&&sel.kind==='fixture'){
    const t=FIXTURES[o.type]||{label:o.type}; kind=o.lib?(LIB_BY_ID[o.lib]||{}).cat||t.cat:t.cat||'Fixture'; title=fxLabel(o);
    body=html`<${FixturePicEditor} p=${p} o=${o} up=${up}/><div className="sec"><h3>Size</h3>
      <${Field} label="Width" id="x-w"><${LenInput} id="x-w" value=${o.w} onChange=${v=>v>0&&up({w:v})}/><//>
      <${Field} label="Depth" id="x-d"><${LenInput} id="x-d" value=${o.d} onChange=${v=>v>0&&up({d:v})}/><//>
      <${Field} label=${COUNTERTOP.has(o.type)?'Counter height':o.type==='lav'?'Rim height':'Height'} id="x-h"><${LenInput} id="x-h" value=${o.h} onChange=${v=>v>0&&up({h:v})}/><//>
      ${o.type==='wallcab'?html`<${Field} label="Bottom above floor" id="x-e"><${LenInput} id="x-e" value=${o.elev||0} onChange=${v=>up({elev:v})}/><//>`:null}
      <div className="row"><button className="btn" onClick=${()=>up({rot:((o.rot||0)+90)%360})}>Turn 90°</button><button className="btn" onClick=${()=>up({rot:((o.rot||0)+180)%360})}>Turn around</button>${isCab(o)?html`<button className="btn" onClick=${()=>{const r=addFillers(p,o.level);commit(r.p);}} title="Fill gaps under 6 inches between cabinets and walls">Add fillers</button>`:null}
        <button className="btn" onClick=${()=>{const f={...o,id:uid('fx')};const sd=fxSide(o);f.x+=sd.x*o.w;f.y+=sd.y*o.w;commit({...p,fixtures:[...p.fixtures,f]});setSel({kind:'fixture',id:f.id});}}>Add one beside</button></div>
      <${ColorPick} id="x-col" label="Color or finish" value=${o.color} fallback=${'#'+((FIXTURES[o.type]||{}).color||0xcccccc).toString(16).padStart(6,'0')} onChange=${v=>up({color:v})}/>
      <${Field} label="Remodel status" id="x-st"><${Sel} id="x-st" value=${o.status||'new'} onChange=${v=>up({status:v})} options=${[['existing','Existing'],['new','New'],['demolish','Remove']]}/><//>
      <p className="note">${o.type==='toilet'?'ADA: centerline 16" to 18" from the side wall, with a 60" x 56" clear space.':COUNTERTOP.has(o.type)?'Standard counters are 36" high; ADA kitchens need a 30" section at 34" maximum.':'Drag to move. Hold Shift while dragging to move away from walls.'}</p></div>${isCab(o)?html`<${CabinetPanel} p=${p} o=${o} up=${up} commit=${commit}/>`:null}`;
  } else if(o&&OBJ[sel.kind]){const d=OBJ[sel.kind];kind=d.label;title=d.title?d.title(o,p):d.label;body=d.panel?d.panel(o,{p,up,commit,setSel,lv:lvlOf(p,o.level)||p.levels[0]}):null;
  } else if(o&&sel.kind==='stair'){
    kind='Stair'; const g=stairGeo(p,o); title=`${(STAIR_SHAPES.find(x=>x[0]===(o.shape||'straight'))||['','Stair'])[1]} · ${g.N} risers`;
    const rOK=g.rh<=(o.shape==='spiral'?9.5:MAX_RISER)+1e-6, tOK=o.tread>=MIN_TREAD-1e-6||o.shape==='spiral', wOK=o.width>=(o.shape==='spiral'?26:36);const sh=o.shape||'straight';
    body=html`<div className="sec"><h3>Layout</h3>
      <${Field} label="Shape" id="s-sh"><${Sel} id="s-sh" value=${sh} onChange=${v=>up({shape:v,width:v==='spiral'?Math.max(60,o.width):o.width})} options=${STAIR_SHAPES}/><//>
      <${Field} label="Direction up" id="s-dir"><${Sel} id="s-dir" value=${o.a!=null?'free':o.dir} onChange=${v=>v!=='free'&&up({dir:v,a:null})} options=${[['N','Up the page'],['E','Right'],['S','Down the page'],['W','Left'],...(o.a!=null?[['free','Angled']]:[])]}/><//>
      ${sh!=='straight'?html`<${Field} label="Turns" id="s-tu"><${Sel} id="s-tu" value=${o.turn||'right'} onChange=${v=>up({turn:v})} options=${[['right','To the right'],['left','To the left']]}/><//>`:null}
      ${['L','Lw','U'].includes(sh)?html`<${Field} label="Risers before the turn" id="s-sp"><${NumInput} id="s-sp" value=${o.split??Math.round(g.N/2)} min=${2} max=${g.N-2} onChange=${v=>up({split:Math.round(v)})}/><//>`:null}
      ${sh==='Lw'?html`<${Field} label="Winders in the turn" id="s-wi"><${Sel} id="s-wi" value=${String(o.winders||3)} onChange=${v=>up({winders:+v})} options=${[['2','2'],['3','3'],['4','4']]}/><//>`:null}
      ${sh==='U'?html`<${Field} label="Gap between flights" id="s-gap"><${LenInput} id="s-gap" value=${o.gap??4} onChange=${v=>up({gap:v})}/><//>`:null}
      ${sh==='spiral'?html`<${Field} label="Turns through (degrees)" id="s-sw"><${NumInput} id="s-sw" value=${o.sweep||360} min=${180} max=${720} onChange=${v=>up({sweep:v})}/><//>`:null}
      <${Field} label=${sh==='spiral'?'Diameter':'Width'} id="s-w"><${LenInput} id="s-w" value=${sh==='spiral'?(o.width+3)*2:o.width} onChange=${v=>v>0&&up({width:sh==='spiral'?v/2-3:v})}/><//>
      ${sh!=='spiral'?html`<${Field} label="Tread depth" id="s-t"><${LenInput} id="s-t" value=${o.tread} onChange=${v=>v>0&&up({tread:v})}/><//>`:null}
      <${Field} label="Total rise" id="s-r"><${LenInput} id="s-r" value=${o.rise} placeholder=${'Auto: '+fmtLen(g.rise)} onChange=${v=>up({rise:v})}/><//>
    </div>
    <div className="sec"><h3>Rails and finish</h3>
      <${Field} label="Handrails" id="s-rl"><${Sel} id="s-rl" value=${o.rails||'auto'} onChange=${v=>up({rails:v})} options=${[['auto','When required (4+ risers)'],['right','Right side going up'],['left','Left side going up'],['both','Both sides'],['none','None']]}/><//>
      <label className="check"><input type="checkbox" checked=${!!o.open} onChange=${e=>up({open:e.target.checked})}/> Open sides with balusters</label>
      <label className="check"><input type="checkbox" checked=${o.closed!==false} onChange=${e=>up({closed:e.target.checked})}/> Closed underneath</label>
      <${ColorPick} id="s-col" label="Tread color" value=${o.color} fallback="#b08454" onChange=${v=>up({color:v})}/></div>
    <div className="sec"><h3>Result</h3>
      <div className="stat"><span>Risers</span><span className="mono">${g.N} at ${fmtLen(g.rh)}</span></div>
      <div className="row"><span className=${'pill '+(rOK?'ok':'bad')}>Riser ${rOK?'OK':'too tall'}</span><span className=${'pill '+(tOK?'ok':'bad')}>Tread ${tOK?'OK':'too short'}</span><span className=${'pill '+(wOK?'ok':'bad')}>Width ${wOK?'OK':'too narrow'}</span></div>
      <p className="note">2021 IRC R311.7: risers 7-3/4" max, treads 10" min, 36" wide, 6'-8" headroom, handrails 34" to 38". Winders 10" at the walkline (R311.7.5.2.1); spiral stairs per R311.7.10.1. The floor above gets an opening over the stair automatically.</p></div>`;
  } else if(o&&sel.kind==='elec'){
    const e=ELEC[o.type]||{};kind='Electrical';title=e.label||'Device';const lights=(p.elec||[]).filter(d=>d.level===o.level&&isLight(d));const isSw=['switch','switch3','dimmer','occ'].includes(o.type);
    const roomOf=d=>(p.rooms.find(r=>r.level===d.level&&inPoly(d.x,d.y,r.pts))||{}).name||'no room';
    body=html`<div className="sec"><h3>Device</h3>
      <${Field} label="Type" id="e-type"><${Sel} id="e-type" value=${o.type} onChange=${v=>up({type:v,h:ELEC[v].h})} options=${Object.entries(ELEC).map(([k,v])=>[k,v.label])}/><//>
      <${Field} label=${e.mount==='ceil'?'Height (ceiling)':'Height to center'} id="e-h"><${LenInput} id="e-h" value=${o.h} onChange=${v=>up({h:v})}/><//>
      ${LUMENS[o.type]?html`<${Field} label="Light output" id="e-lm"><input id="e-lm" className="inp mono" value=${o.lumens??''} placeholder=${LUMENS[o.type]+' lumens'} onChange=${ev=>{const v=parseInt(ev.target.value);up({lumens:v>0?v:null});}}/><//>`:null}
      <${Field} label="Remodel status" id="e-st"><${Sel} id="e-st" value=${o.status||'new'} onChange=${v=>up({status:v})} options=${[['existing','Existing'],['new','New'],['demolish','Remove']]}/><//>
      <div className="stat"><span>Room</span><span>${roomOf(o)}</span></div>
      ${o.auto?html`<p className="note">Placed by Auto-place. Running Auto-place again replaces it; change anything here to keep it as your own.</p>`:null}</div>
    ${isSw?html`<div className="sec"><h3>Controls these lights</h3>${lights.length?lights.map(l=>html`<label key=${l.id} className="check"><input type="checkbox" checked=${(o.links||[]).includes(l.id)} onChange=${ev=>up({links:ev.target.checked?[...(o.links||[]),l.id]:(o.links||[]).filter(x=>x!==l.id),auto:false})}/> ${ELEC[l.type].label} in ${roomOf(l)}</label>`):html`<p className="note">No lights on this floor yet.</p>`}</div>`:null}`;
  } else if(o&&sel.kind==='ramp'){
    const ri=rampInfo(p,o);kind='Ramp';title=`ADA ramp · ${fmtLen(ri.rise)} rise`;
    body=html`<div className="sec"><h3>Ramp</h3>
      <${Field} label="Rise (floor to ground)" id="rp-r"><${LenInput} id="rp-r" value=${o.rise} placeholder=${'From grade: '+fmtLen(p.settings?.gradeOffset||24)} onChange=${v=>up({rise:v})}/><//>
      <${Field} label="Runs down toward" id="rp-d"><${Sel} id="rp-d" value=${o.dir||'S'} onChange=${v=>up({dir:v})} options=${[['N','Top of the page'],['E','Right'],['S','Bottom of the page'],['W','Left']]}/><//>
      <${Field} label="Width (outside of rails)" id="rp-w"><${LenInput} id="rp-w" value=${o.width||48} onChange=${v=>v>0&&up({width:v})}/><//>
      <${Field} label="Slope, 1 in" id="rp-s"><${NumInput} id="rp-s" value=${o.slope||12} min=${8} max=${20} onChange=${v=>up({slope:v})}/><//>
      <${Field} label="Built from" id="rp-m"><${Sel} id="rp-m" value=${o.mat||'wood'} onChange=${v=>up({mat:v})} options=${[['wood','Treated wood'],['concrete','Concrete']]}/><//>
      <label className="check"><input type="checkbox" checked=${!!o.edge} onChange=${e=>up({edge:e.target.checked})}/> Edge curb or guard on both sides</label>
      <div className="stat"><span>Runs</span><span className="mono">${ri.nRuns} × ${fmtLen(ri.runLen)} (${fmtLen(ri.runRise)} rise each)</span></div>
      <div className="stat"><span>Total length</span><span className="mono">${fmtLen(ri.total)}</span></div>
      <div className="row"><span className=${'pill '+(ri.slope>=12?'ok':'bad')}>1:${ri.slope}</span><span className=${'pill '+(ri.runRise<=30?'ok':'bad')}>≤ 30" per run</span><span className=${'pill '+(ri.width-3.5>=36?'ok':'bad')}>36" clear</span><span className="pill ok">60" landings</span>${ri.rails?html`<span className="pill ok">Handrails both sides</span>`:null}</div>
      <p className="note">2010 ADA Standards 405. The top landing is at the door; the bottom landing needs a level 60" clear area too.</p></div>`;
  } else if(o&&sel.kind==='shape'){
    kind='Shape';title=o.name||'Shape';const others=(p.shapes||[]).filter(x=>x.id!==o.id&&x.level===o.level);
    body=html`<div className="sec"><h3>Shape</h3>
      <${Field} label="Name" id="sh-n"><input id="sh-n" className="inp" value=${o.name||''} onChange=${e=>up({name:e.target.value})}/><//>
      <${Field} label="Kind" id="sh-k"><${Sel} id="sh-k" value=${o.kind} onChange=${v=>{if(v===o.kind)return;if(v==='round'){const c=shapeCenter(o);const xs=shapeOutline(o).map(q=>q[0]),ys=shapeOutline(o).map(q=>q[1]);const d=Math.max(6,Math.min(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)));up({kind:'round',cx:c.x,cy:c.y,d,dTop:d});}else{up({kind:'extrude',pts:shapeOutline(o).filter((_,i)=>i%4===0),holes:[]});}}} options=${[['extrude','Outline pushed up (extrude)'],['round','Round: column, post, cone (revolve)']]}/><//>
      ${o.kind==='round'?html`<${Field} label="Bottom diameter" id="sh-d"><${LenInput} id="sh-d" value=${o.d} onChange=${v=>v>0&&up({d:v})}/><//><${Field} label="Top diameter" id="sh-dt"><${LenInput} id="sh-dt" value=${o.dTop??o.d} onChange=${v=>v>=0&&up({dTop:v})}/><//>`:null}
      <${Field} label="Height" id="sh-h"><${LenInput} id="sh-h" value=${o.h} onChange=${v=>v>0&&up({h:v})}/><//>
      <${Field} label="Bottom above floor" id="sh-z"><${LenInput} id="sh-z" value=${o.z||0} onChange=${v=>up({z:v})}/><//>
      <${ColorPick} id="sh-c" label="Color" value=${o.color} fallback="#d9d4c7" onChange=${v=>up({color:v})}/>
      ${o.kind==='extrude'?html`<div className="stat"><span>Footprint</span><span className="mono">${(polyArea(o.pts)/144-(o.holes||[]).reduce((s,h)=>s+polyArea(h)/144,0)).toFixed(1)} sq ft</span></div>
        ${others.length?html`<${Field} label="Cut a hole using" id="sh-cut"><select id="sh-cut" className="inp" value="" onChange=${e=>{const q=cutShape(p,o.id,e.target.value);if(q)commit(q);else alert('Draw the cutting shape fully inside this one first.');}}><option value="">Pick a shape inside this one…</option>${others.map(x=>html`<option key=${x.id} value=${x.id}>${x.name||x.id}</option>`)}</select><//>`:null}
        ${(o.holes||[]).length?html`<div className="row"><span className="note">${o.holes.length} hole${o.holes.length>1?'s':''}</span><button className="btn" onClick=${()=>up({holes:[]})}>Remove holes</button></div>`:null}`:null}
      <p className="note">Use shapes for anything the library doesn't have: built-ins, columns, porches, steps, planters, angled counters. To cut an opening, draw a second shape inside this one and pick it under “Cut a hole”.</p></div>`;
  } else if(o&&sel.kind==='dim'){
    kind='Dimension';title=fmtLen(Math.round(dist(o.a,o.b)*16)/16);
    body=html`<div className="sec"><h3>Dimension</h3>
      <${Field} label="Offset from the points" id="dm-o"><${LenInput} id="dm-o" value=${o.off??18} onChange=${v=>up({off:v})}/><//>
      <button className="btn" onClick=${()=>up({off:-(o.off??18)})}>Flip to the other side</button>
      <${Field} label="Text (blank = measured)" id="dm-l"><input id="dm-l" className="inp" value=${o.label||''} placeholder=${fmtLen(dist(o.a,o.b))} onChange=${e=>up({label:e.target.value})}/><//>
      <p className="note">Dimensions print on the plan sheets. Drag to move.</p></div>`;
  } else if(o&&sel.kind==='anno'){
    kind='Note';title='Note';
    body=html`<div className="sec"><h3>Note</h3>
      <textarea id="an-t" className="inp" rows="4" value=${o.text} onChange=${e=>up({text:e.target.value})} aria-label="Note text"></textarea>
      <${Field} label="Text size" id="an-s"><${Sel} id="an-s" value=${String(o.size||9)} onChange=${v=>up({size:+v})} options=${[['7','Small'],['9','Normal'],['12','Large'],['16','Title']]}/><//>
      <div className="row">${o.leader?html`<button className="btn" onClick=${()=>up({leader:null})}>Remove arrow</button>`:html`<button className="btn" onClick=${()=>up({leader:{x:o.x-24,y:o.y+24}})}>Add a leader arrow</button>`}</div>
      ${o.leader?html`<div className="row2"><${Field} label="Arrow x" id="an-lx"><${LenInput} id="an-lx" value=${o.leader.x} onChange=${v=>up({leader:{...o.leader,x:v}})}/><//><${Field} label="Arrow y" id="an-ly"><${LenInput} id="an-ly" value=${o.leader.y} onChange=${v=>up({leader:{...o.leader,y:v}})}/><//></div>`:null}
      <p className="note">Notes print on the plan sheets in capitals. Drag to move.</p></div>`;
  } else if(o&&sel.kind==='roof'){
    kind='Roof'; title=o.style[0].toUpperCase()+o.style.slice(1)+' roof'; const lv=lvlOf(p,o.level); const b=roofBuild(o,roofTop(p,o));
    body=html`<div className="sec"><h3>Shape</h3>
      <${Field} label="Style" id="f-st"><${Sel} id="f-st" value=${o.style} onChange=${v=>up({style:v})} options=${ROOF_STYLES}/><//>
      ${o.style!=='flat'?html`<${Field} label=${['gambrel','mansard'].includes(o.style)?'Upper pitch (x/12)':'Pitch (x/12)'} id="f-p"><${NumInput} id="f-p" value=${o.pitch} min=${0.5} max=${24} onChange=${v=>up({pitch:v})}/><//>`:html`<${Field} label="Slope for drainage (x/12)" id="f-fs"><${NumInput} id="f-fs" value=${o.flatSlope??0.25} min=${0.125} max=${2} step=${0.125} onChange=${v=>up({flatSlope:v})}/><//>
        <${Field} label="Parapet height (0 for none)" id="f-par"><${LenInput} id="f-par" value=${o.parapet||0} onChange=${v=>up({parapet:v})}/><//>`}
      ${['gambrel','mansard'].includes(o.style)?html`<${Field} label="Lower pitch (x/12)" id="f-p2"><${NumInput} id="f-p2" value=${o.pitch2??(o.style==='mansard'?24:21)} min=${6} max=${40} onChange=${v=>up({pitch2:v})}/><//>
        <${Field} label="Break in from the wall" id="f-brk"><${LenInput} id="f-brk" value=${o.brk} placeholder="Auto" onChange=${v=>up({brk:v})}/><//>`:null}
      ${o.style==='dutch'?html`<${Field} label="Gablet set in from the end" id="f-gb"><${LenInput} id="f-gb" value=${o.gablet} placeholder="Auto" onChange=${v=>up({gablet:v})}/><//>`:null}
      <${Field} label="Overhang" id="f-o"><${LenInput} id="f-o" value=${o.overhang} onChange=${v=>up({overhang:v})}/><//>
      ${!['hip','dutch','mansard'].includes(o.style)?html`<${Field} label="Ridge runs" id="f-r"><${Sel} id="f-r" value=${o.ridge} onChange=${v=>up({ridge:v})} options=${[['x','Left to right'],['y','Top to bottom']]}/><//>`:null}
      ${o.style==='shed'?html`<label className="check"><input type="checkbox" checked=${!!o.flip} onChange=${e=>up({flip:e.target.checked})}/> Slope the other way</label>`:null}
      <${Field} label="Wall height under it" id="f-pl"><${LenInput} id="f-pl" value=${o.plate} placeholder=${'Level: '+fmtLen(lv.height)} onChange=${v=>up({plate:v})}/><//>
    </div>
    ${(()=>{const t=roofTrimOf(o);const upt=patch=>up({trim:{...t,...patch}});return html`<div className="sec"><h3>Eaves and gutters</h3>
      <${Field} label="Fascia board" id="f-fa"><${Sel} id="f-fa" value=${String(t.fascia)} onChange=${v=>upt({fascia:+v})} options=${[['4','1x4'],['6','1x6'],['8','1x8'],['10','1x10']]}/><//>
      <label className="check"><input type="checkbox" checked=${t.soffit} onChange=${e=>upt({soffit:e.target.checked})}/> Boxed soffit</label>
      <label className="check"><input type="checkbox" checked=${t.gutters} onChange=${e=>upt({gutters:e.target.checked})}/> Gutters and downspouts</label>
      ${t.gutters?html`<${Field} label="Gutter color" id="f-gc"><${Sel} id="f-gc" value=${t.gutterColor} onChange=${v=>upt({gutterColor:v})} options=${[['white','White'],['bronze','Bronze'],['black','Black'],['copper','Copper']]}/><//>`:null}
      <label className="check"><input type="checkbox" checked=${t.rake} onChange=${e=>upt({rake:e.target.checked})}/> Rake trim at the gable ends</label>
      <${ColorPick} id="f-tc" label="Trim color" value=${o.trimColor} fallback="#f6f4ee" onChange=${v=>up({trimColor:v})}/></div>`;})()}
    <div className="sec"><h3>Footprint</h3>
      <${Field} label="Width" id="f-w"><${LenInput} id="f-w" value=${o.w} bare="ft" onChange=${v=>v>0&&up({w:v})}/><//>
      <${Field} label="Depth" id="f-h"><${LenInput} id="f-h" value=${o.h} bare="ft" onChange=${v=>v>0&&up({h:v})}/><//>
      <div className="stat"><span>Peak above floor</span><span className="mono">${fmtLen(b.peak-lv.elevation)}</span></div></div>
    ${(()=>{const rf=rafterOf(o);const upf=patch=>up({framing:{...rf,...patch}});return html`<div className="sec"><h3>Framing and covering</h3>
      <${Field} label="Covering" id="f-cov"><${Sel} id="f-cov" value=${rf.cover} onChange=${v=>upf({cover:v})} options=${Object.entries(ROOF_COVER).map(([k,v])=>[k,v.label])}/><//>
      <${ColorPick} id="f-col" label="Roof color" value=${o.color} fallback=${'#'+(ROOF_COLOR[rf.cover]||0x4a4f57).toString(16).padStart(6,'0')} onChange=${v=>up({color:v})}/>
      <${Field} label="Framing" id="f-sys"><${Sel} id="f-sys" value=${rf.system} onChange=${v=>upf({system:v})} options=${[['rafters','Rafters and ceiling joists'],['trusses','Engineered trusses']]}/><//>
      ${rf.system==='rafters'?html`<${Field} label="Rafter size" id="f-raf"><${Sel} id="f-raf" value=${rf.rafter} onChange=${v=>upf({rafter:v})} options=${Object.keys(LUMBER).map(k=>[k,k])}/><//>
      <${Field} label="Spacing" id="f-sp"><${Sel} id="f-sp" value=${String(rf.spacing)} onChange=${v=>upf({spacing:+v})} options=${[['12','12" o.c.'],['16','16" o.c.'],['19.2','19.2" o.c.'],['24','24" o.c.']]}/><//>
      <${Field} label="Lumber" id="f-spc"><${Sel} id="f-spc" value=${rf.species} onChange=${v=>upf({species:v})} options=${Object.entries(SPECIES).map(([k,v])=>[k,v.label])}/><//>`:html`<p className="note">Truss design comes from the truss supplier; rafter and ceiling joist checks are skipped.</p>`}</div>`;})()}`;
  } else {
    const lvls=sortedLevels(p);
    const area=p.rooms.reduce((s,r)=>s+polyArea(r.pts),0)/144;
    const lv=lvlOf(p,levelId)||lvls[0];
    const updLv=(id,patch)=>commit({...p,levels:p.levels.map(l=>l.id===id?{...l,...patch}:l)});
    const addLevel=()=>{const top=lvls[lvls.length-1];const nl={id:uid('lv'),name:lvls.length===1?'Second floor':`Level ${lvls.length+1}`,elevation:top.elevation+top.height+FLOOR_DEPTH,height:top.height};commit({...p,levels:[...p.levels,nl]});setLevelId(nl.id);};
    const copyUp=()=>{let q=p;let up=levelAbove(q,lv);if(!up){up={id:uid('lv'),name:'Second floor',elevation:lv.elevation+lv.height+FLOOR_DEPTH,height:lv.height};q={...q,levels:[...q.levels,up]};}
      const cp=q.walls.filter(w=>w.level===lv.id&&w.kind==='exterior').map(w=>({...w,id:uid('w'),level:up.id,status:'new'}));commit({...q,walls:[...q.walls,...cp]});setLevelId(up.id);};
    const delLevel=(id)=>{if(p.levels.length<2)return;const wid=new Set(p.walls.filter(w=>w.level===id).map(w=>w.id));
      commit({...p,levels:p.levels.filter(l=>l.id!==id),walls:p.walls.filter(w=>!wid.has(w.id)),openings:p.openings.filter(o=>!wid.has(o.wall)),rooms:p.rooms.filter(r=>r.level!==id),stairs:p.stairs.filter(s=>s.level!==id),roofs:p.roofs.filter(r=>r.level!==id),fixtures:(p.fixtures||[]).filter(f=>f.level!==id)});
      if(id===levelId)setLevelId(p.levels.find(l=>l.id!==id).id);};
    body=html`<div className="sec"><h3>Project</h3>
      <${Field} label="Name" id="p-name"><input id="p-name" className="inp" value=${p.name} onChange=${e=>commit({...p,name:e.target.value})}/><//>
      <${Field} label="Snap grid" id="p-grid"><${Sel} id="p-grid" value=${String(p.settings.grid)} onChange=${v=>commit({...p,settings:{...p.settings,grid:+v}})} options=${[['1','1"'],['3','3"'],['6','6"'],['12','1\'']]}/><//>
      <${Field} label="Building code" id="p-code"><${Sel} id="p-code" value=${p.settings.code||'irc'} onChange=${v=>commit({...p,settings:{...p.settings,code:v}})} options=${[['irc','House: 2021 IRC'],['ibc','Commercial or city building: 2021 IBC']]}/><//>
      ${p.settings.code==='ibc'?html`<${Field} label="Occupancy group" id="p-occ"><${Sel} id="p-occ" value=${p.settings.occupancy||'B'} onChange=${v=>commit({...p,settings:{...p.settings,occupancy:v}})} options=${Object.entries(OCCUPANCIES).map(([k,v])=>[k,v.label])}/><//>
        <label className="check"><input id="p-spr" type="checkbox" checked=${!!p.settings.sprinklered} onChange=${e=>commit({...p,settings:{...p.settings,sprinklered:e.target.checked}})}/> Fire sprinklers throughout</label>`
      :html`<label className="check"><input id="p-ada" type="checkbox" checked=${p.settings.ada!==false} onChange=${e=>commit({...p,settings:{...p.settings,ada:e.target.checked}})}/> Accessible design (2010 ADA checks)</label>`}
      <div className="stat"><span>Walls · openings · rooms</span><span className="mono">${p.walls.length} · ${p.openings.length} · ${p.rooms.length}</span></div>
      <div className="stat"><span>Floor area (rooms)</span><span className="mono">${Math.round(area)} sq ft</span></div>
      <div className="row"><button className="btn" onClick=${onFile}>Save, open or start new…</button></div>
    </div>
    <${FoundationPanel} p=${p} commit=${commit}/><${LandscapeSettings} p=${p} commit=${commit}/>
    ${p.settings.code==='ibc'?html`<${IbcSummary} p=${p}/>`:null}
    ${(()=>{const t=trimOf(p,null);const opts=slot=>LIB.filter(x=>x.place==='trim'&&x.slot===slot).map(x=>[x.id,x.label]);const ups=patch=>commit({...p,settings:{...p.settings,...patch}});
      return html`<div className="sec"><h3>Trim (whole house)</h3>
        ${TRIM_SLOTS.map(([slot,lab])=>html`<${Field} key=${slot} label=${lab} id=${'p-tr-'+slot}><${Sel} id=${'p-tr-'+slot} value=${t[slot]} onChange=${v=>ups({trim:{...(p.settings.trim||{}),[slot]:v}})} options=${opts(slot)}/><//>`)}
        <${ColorPick} id="p-trc" label="Trim color" value=${p.settings.trimColor} onChange=${v=>ups({trimColor:v})}/>
        <p className="note">Rooms can override these in their own panel. Trim lengths go into the materials list. The Library has more profiles.</p></div>`;})()}
    ${(()=>{const q=ensureOptions(p);const fin=pp=>{const rows=takeoff(pp,{waste:(pp.settings?.waste??10)/100});const pr=pp.prices||{};let t=0,n=0;for(const r of rows){const v=pr[r.key.replace(/\|(new|demo)$/,'')];if(v!=null){t+=v*r.qty;n++;}}const iss=runChecks(pp);return {area:Math.round(pp.rooms.reduce((s,r)=>s+polyArea(r.pts),0)/144),cost:n?t:null,fails:iss.filter(i=>i.sev==='error').length};};
      return html`<div className="sec"><h3>Design options</h3><p className="note">Each option is a separate copy of the house. Switch with the option menu at the top; the active one is drawn, checked and printed.</p>
        ${q.options.map(o=>{const pp=optionProject(q,o);const f=fin(pp);const on=o.id===q.activeOption;return html`<div key=${o.id} className=${'optcard'+(on?' on':'')}>
          <div className="optname">${on?html`<input className="inp" id=${'opt-'+o.id} value=${o.name} aria-label="Option name" onChange=${e=>commit({...q,options:q.options.map(x=>x.id===o.id?{...x,name:e.target.value}:x)})}/>`:html`<b>${o.name}</b>`}
            ${on?html`<span className="pill ok">Active</span>`:html`<button className="btn" onClick=${()=>commit(switchOption(q,o.id))}>Open</button>`}
            ${q.options.length>1?html`<button className="btn danger" onClick=${()=>commit(deleteOption(q,o.id))} aria-label=${'Delete '+o.name}>✕</button>`:null}</div>
          <div className="optstats mono"><span>${f.area} SF</span><span>${f.cost==null?'No prices':'$'+Math.round(f.cost).toLocaleString('en-US')}</span><span className=${f.fails?'bad':''}>${f.fails} fail${f.fails===1?'':'s'}</span></div></div>`;})}
        <div className="row"><button className="btn" onClick=${()=>commit(addOption(p))}>New option from this one</button></div></div>`;})()}
    <div className="sec"><h3>Levels</h3>
      ${[...lvls].reverse().map(l=>html`<div key=${l.id} className=${'lvl'+(l.id===lv.id?' on':'')}>
        <input type="radio" name="lvl" id=${'lv-'+l.id} checked=${l.id===lv.id} onChange=${()=>setLevelId(l.id)} aria-label=${'Work on '+l.name}/>
        <div style=${{display:'grid',gap:'6px',minWidth:0}}>
          <input className="inp" id=${'lvn-'+l.id} value=${l.name} onChange=${e=>updLv(l.id,{name:e.target.value})}/>
          <div className="grid2"><label>Floor elevation<${LenInput} id=${'lve-'+l.id} value=${l.elevation} bare="ft" onChange=${v=>updLv(l.id,{elevation:v})}/></label>
          <label>Wall height<${LenInput} id=${'lvh-'+l.id} value=${l.height} bare="ft" onChange=${v=>v>0&&updLv(l.id,{height:v})}/></label></div>
          ${(()=>{const fr=framingOf(l);const first=l.id===groundLevel(p).id;const top=!levelAbove(p,l);const upf=patch=>updLv(l.id,{framing:{...fr,...patch}});
            return html`<details className="framing"><summary>Floor and ceiling framing</summary><div className="grid2">
              ${first?html`<label>Foundation<${Sel} id=${'fnd-'+l.id} value=${fr.foundation} onChange=${v=>upf({foundation:v})} options=${[['crawl','Crawlspace'],['slab','Slab on grade'],['basement','Basement']]}/></label>`:null}
              ${first&&fr.foundation==='slab'?null:html`<label>Floor joists<${Sel} id=${'fj-'+l.id} value=${fr.joist} onChange=${v=>upf({joist:v})} options=${Object.keys(LUMBER).map(k=>[k,k])}/></label>
              <label>Spacing<${Sel} id=${'fs-'+l.id} value=${String(fr.spacing)} onChange=${v=>upf({spacing:+v})} options=${[['12','12" o.c.'],['16','16" o.c.'],['19.2','19.2" o.c.'],['24','24" o.c.']]}/></label>
              <label>Joists run<${Sel} id=${'fd-'+l.id} value=${fr.dir} onChange=${v=>upf({dir:v})} options=${[['auto','Shortest way'],['x','Left to right'],['y','Top to bottom']]}/></label>`}
              ${first&&fr.foundation==='crawl'?html`<label>Girders every<${LenInput} id=${'fg-'+l.id} value=${fr.girders} bare="ft" placeholder="Only under walls" onChange=${v=>upf({girders:v||0})}/></label>`:null}
              <label>Lumber<${Sel} id=${'fsp-'+l.id} value=${fr.species} onChange=${v=>upf({species:v})} options=${Object.entries(SPECIES).map(([k,v])=>[k,v.label])}/></label>
              ${top?html`<label>Ceiling joists<${Sel} id=${'fc-'+l.id} value=${fr.ceiling} onChange=${v=>upf({ceiling:v})} options=${Object.keys(LUMBER).map(k=>[k,k])}/></label>
              <label className="check"><input type="checkbox" id=${'fa-'+l.id} checked=${!!fr.atticStorage} onChange=${e=>upf({atticStorage:e.target.checked})}/> Attic storage</label>`:null}
            </div></details>`;})()}
          ${p.levels.length>1?html`<div><button className="btn danger" onClick=${()=>delLevel(l.id)}>Delete level</button></div>`:null}
        </div></div>`)}
      <div className="row"><button className="btn" onClick=${addLevel}>Add level</button><button className="btn" onClick=${()=>{const r=makeBasement(p);if(r.err){window.__say&&window.__say(r.err,false);return;}commit(r.p);setLevelId(r.level.id);window.__say&&window.__say('Basement added: 8" concrete walls, 8 ft tall. Add windows with wells for light and egress.');}} title="Add a full basement level under the first floor">Add basement</button><button className="btn" onClick=${copyUp}>Copy exterior walls up</button><button className="btn" onClick=${()=>{const base=p.roofs.some(r=>r.level===lv.id)?lv:lvls.slice().reverse().find(l=>p.roofs.some(r=>r.level===l.id));if(!base){window.__say&&window.__say('Draw a roof first; the attic is figured from it.',false);return;}const r=makeAttic(p,base,48);if(r.err){window.__say&&window.__say(r.err,false);return;}commit(r.p);setLevelId(r.level.id);window.__say&&window.__say(`Attic room: ${Math.round(r.area)} sq ft inside ${r.walls} knee walls, ${fmtLen(r.peak)} to the roof at the peak.`);}} title="Find the space under the roof with 4 ft or more of headroom, and put knee walls and a room there">Make attic rooms</button>
        <button className="btn" onClick=${()=>{const r=roofOverLevel(p,lv.id);if(r){commit({...p,roofs:[...p.roofs,r]});setSel({kind:'roof',id:r.id});}}}>Roof this level</button></div>
      ${(()=>{const d={style:'hip',pitch:6,overhang:12,...(p.settings.roofDefault||{})};const upd=patch=>commit({...p,settings:{...p.settings,roofDefault:{...d,...patch}}});return html`<details className="framing"><summary>Automatic roof settings</summary><div className="grid2">
        <label>Style<${Sel} id="rd-st" value=${d.style} onChange=${v=>upd({style:v})} options=${ROOF_STYLES.filter(x=>['gable','hip','dutch','gambrel'].includes(x[0]))}/></label><label>Pitch (x/12)<${NumInput} id="rd-p" value=${d.pitch} min=${1} max=${24} onChange=${v=>upd({pitch:v})}/></label>
        <label>Overhang<${LenInput} id="rd-o" value=${d.overhang} onChange=${v=>upd({overhang:v})}/></label></div>
        <div className="row"><button className="btn" onClick=${()=>{const rs=autoRoof(p,lv.id,d);if(rs.length)commit({...p,roofs:[...p.roofs.filter(r=>r.level!==lv.id),...rs]});}}>Roof this level automatically</button></div></details>`;})()}
    </div>
    <div className="sec"><h3>Typing lengths</h3><p className="note">Any length box takes 12'6", 12-6, 150", 6 ft 3 in, metric like 1.9 m, or a value pasted from the iPhone Measure app. Wall and level boxes treat a bare number as feet; door, window and thickness boxes treat it as inches.</p></div>`;
  }
  return html`<aside className=${'insp'+(collapsed?' collapsed':'')}>
    <div className="insp-h"><div style=${{minWidth:0,flex:1}}>${kind?html`<div className="kind">${kind}</div>`:null}<h2>${title}</h2></div>
      ${o?html`<button className="btn danger" onClick=${onDelete} title="Delete (Del)">Delete</button><button className="btn" onClick=${()=>setSel(null)} aria-label="Close">✕</button>`:null}
      <button className="btn mobile-only" onClick=${()=>setCollapsed(!collapsed)} aria-label=${collapsed?'Show panel':'Hide panel'}>${collapsed?'▴':'▾'}</button>
    </div>${mineEl}${memberEl}${body}${o?html`<${PinnedPhotos} p=${p} sel=${sel}/>`:null}</aside>`;
}

