/* ======================= saved versions, reusable blocks, keyboard shortcut card ======================= */
/* ---- versions: named snapshots kept in this computer's browser storage (with the photos) ---- */
function projSummary(p){let est=null;try{est=estimateOf(p).total;}catch(e){}return {walls:p.walls.length,rooms:p.rooms.length,area:Math.round(p.rooms.reduce((s,r)=>s+polyArea(r.pts)/144,0)),openings:p.openings.length,fixtures:(p.fixtures||[]).length,est};}
function VersionsModal({p,onRestore,onClose}){const [list,setList]=useState(null);const [name,setName]=useState('');const [msg,setMsg]=useState(null);
  const load=()=>assetList(p.id||'default').then(l=>setList(l.filter(a=>a.kind==='version').sort((a,b)=>b.date.localeCompare(a.date)))).catch(()=>setList([]));
  useEffect(()=>{load();},[]);const cur=useMemo(()=>projSummary(p),[p]);
  const save=async()=>{const nm=name.trim()||'Version '+new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
    await assetPut({id:uid('vr'),project:p.id||'default',kind:'version',name:nm,date:new Date().toISOString(),json:JSON.stringify(p),sum:projSummary(p)});setName('');setMsg({ok:true,t:`Saved "${nm}".`});load();};
  const diff=(a,b,f=x=>x)=>a===b?html`<span className="note">same</span>`:html`<b>${f(a)}</b> <span className="note">(now ${f(b)})</span>`;
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide" role="dialog" aria-label="Versions">
    <h2>Versions</h2><p className="note">Save a snapshot before a big change, compare it with what you have now, or go back to it. Restoring keeps the current drawing in Undo.</p>
    <div className="row"><input className="inp" style=${{flex:1}} placeholder="Name this version (for example: Before moving the kitchen)" value=${name} onChange=${e=>setName(e.target.value)} aria-label="Version name" onKeyDown=${e=>{if(e.key==='Enter')save();}}/><button className="btn primary" onClick=${save}>Save this version</button></div>
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
    ${list===null?html`<p className="note">Loading…</p>`:list.length?html`<div className="tablewrap"><table className="mat"><thead><tr><th>Version</th><th className="num">Rooms</th><th className="num">Area</th><th className="num">Estimate</th><th></th></tr></thead><tbody>
      ${list.map(v=>{const s=v.sum||{};return html`<tr key=${v.id}><td>${v.name}<div className="note">${new Date(v.date).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})}</div></td>
        <td className="num">${diff(s.rooms,cur.rooms)}</td><td className="num">${diff(s.area,cur.area,x=>x+' sf')}</td><td className="num">${s.est!=null&&cur.est!=null?diff(Math.round(s.est),Math.round(cur.est),x=>money(x)):''}</td>
        <td className="num"><button className="btn" onClick=${()=>{try{const q=normalize(JSON.parse(v.json));onRestore(q,v.name);}catch(e){setMsg({ok:false,t:'That version could not be read.'});}}}>Restore</button> <button className="btn danger" aria-label=${'Delete '+v.name} onClick=${async()=>{await assetDel(v.id);load();}}>✕</button></td></tr>`;})}</tbody></table></div>`
      :html`<p className="note">No saved versions of this project yet.</p>`}
    ${DESK?html`<p className="note">The desktop program also keeps a dated copy every time you save, in Documents › Remodel Studio › Backups.</p>`:null}
    <div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Close</button></div></div></div>`;}
/* ---- blocks: a selection saved for reuse in any project ---- */
const BLOCK_KEY='remodel-studio:blocks';
const loadBlocks=()=>{try{return JSON.parse(localStorage.getItem(BLOCK_KEY)||'[]');}catch(e){return [];}};
const saveBlocks=l=>{try{localStorage.setItem(BLOCK_KEY,JSON.stringify(l));return true;}catch(e){return false;}};
function makeBlock(p,sel,name){const items=selItems(sel).filter(i=>i.kind!=='opening');if(!items.length)return null;const c=selCenter(p,items);const T=T_move(-c.x,-c.y);
  const out=[];const wallIds=new Set();for(const it of items){const o=findObj(p,it);if(!o)continue;out.push({kind:it.kind,obj:JSON.parse(JSON.stringify(xformObj(p,it.kind,o,T)))});if(it.kind==='wall')wallIds.add(o.id);}
  const ops=p.openings.filter(o=>wallIds.has(o.wall)).map(o=>JSON.parse(JSON.stringify(o)));return {id:uid('bk'),name,date:new Date().toISOString(),items:out,openings:ops,count:out.length};}
let pendingBlock=null;
function placeBlock(p,lvId,B,pt){let q={...p};const temp=[];const wmap={};const tag='tmp'+Math.random().toString(36).slice(2,7);
  for(const it of B.items){const c=COLL[it.kind];if(!c)continue;const o={...JSON.parse(JSON.stringify(it.obj)),id:tag+temp.length,level:lvId};if(it.kind==='wall')wmap[it.obj.id]=o.id;q={...q,[c]:[...(q[c]||[]),o]};temp.push({kind:it.kind,id:o.id});}
  q={...q,openings:[...q.openings,...(B.openings||[]).filter(o=>wmap[o.wall]).map((o,i)=>({...o,id:tag+'op'+i,wall:wmap[o.wall]}))]};
  const r=xformItems(q,temp,T_move(pt.x,pt.y),true);let out=r.p;const isTmp=o=>String(o.id).startsWith(tag);
  for(const k of new Set(temp.map(t=>COLL[t.kind]).concat(['openings'])))out={...out,[k]:(out[k]||[]).filter(o=>!isTmp(o))};return {p:out,sel:r.sel};}
I.block=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>`;
regTool('block',{label:'Place a block',short:'Block',key:'',group:'draft',icon:I.block,mode:'click',
  hint:()=>pendingBlock?html`<b>Block "${pendingBlock.name}":</b> click to place a copy (its center goes where you click). Keep clicking to place more; Esc when done.`:html`<b>Blocks:</b> pick one under Edit › Blocks first.`,
  place:(ctx,[pt])=>{if(!pendingBlock)return null;const r=placeBlock(ctx.p,ctx.lv.id,pendingBlock,pt);return {p:r.p,sel:r.sel,keep:true};}});
addToolToGroup('draft','block');
function BlocksModal({p,sel,setTool,onClose,say}){const [list,setList]=useState(loadBlocks);const [name,setName]=useState('');const can=sel&&selItems(sel).some(i=>i.kind!=='opening');
  const add=()=>{const B=makeBlock(p,sel,name.trim()||'Block '+(list.length+1));if(!B)return;const l=[B,...list];if(saveBlocks(l)){setList(l);setName('');}};
  const exp=async()=>{say&&say((await saveFile('Remodel Studio blocks.json',JSON.stringify(list,null,1))).t);};
  const imp=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const a=JSON.parse(t);if(Array.isArray(a)){const l=[...a.filter(b=>b&&b.items),...list];saveBlocks(l);setList(l);}}catch(err){}});e.target.value='';};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide" role="dialog" aria-label="Blocks">
    <h2>Blocks</h2><p className="note">Save any group of walls, doors, cabinets, fixtures, drafting or site items as a block, then drop it into this or any other project: a standard bath, a closet layout, a detail you draw often.</p>
    <div className="row"><input className="inp" style=${{flex:1}} placeholder=${can?'Name for the selected items':'Select items in the plan first (Shift-drag a box)'} disabled=${!can} value=${name} onChange=${e=>setName(e.target.value)} aria-label="Block name"/><button className="btn primary" disabled=${!can} onClick=${add}>Save selection as block</button></div>
    <h3>Accessible bath templates</h3><p className="note">Walls, a 36" door, fixtures and grab bars laid out to the 2010 ADA Standards (toilet 18" to centerline, 60" turning space, 34" lavatory).</p>
    <div className="blocklist">${BATH_TEMPLATES.map(([k,l])=>html`<div key=${k} className="blockrow"><div><b>${l}</b></div><span className="spacer"></span><button className="btn primary" onClick=${()=>{pendingBlock=bathTemplate(k);setTool('block');onClose();}}>Place</button></div>`)}</div>
    <h3>Your blocks</h3>
    ${list.length?html`<div className="blocklist">${list.map(B=>html`<div key=${B.id} className="blockrow"><div><b>${B.name}</b><div className="note">${B.count} item${B.count===1?'':'s'}${B.openings&&B.openings.length?`, ${B.openings.length} door${B.openings.length===1?'':'s'} or window${B.openings.length===1?'':'s'}`:''}</div></div>
      <span className="spacer"></span><button className="btn primary" onClick=${()=>{pendingBlock=B;setTool('block');onClose();}}>Place</button><button className="btn danger" aria-label=${'Delete '+B.name} onClick=${()=>{const l=list.filter(x=>x.id!==B.id);saveBlocks(l);setList(l);}}>✕</button></div>`)}</div>`:html`<p className="note">No blocks yet.</p>`}
    <div className="row"><button className="btn" onClick=${exp} disabled=${!list.length}>Export blocks…</button><label className="btn" htmlFor="bk-imp">Import blocks…</label><input id="bk-imp" type="file" accept=".json" hidden onChange=${imp}/><span className="spacer"></span><button className="btn" onClick=${onClose}>Close</button></div></div></div>`;}
/* ---- keyboard shortcut card ---- */
function KeysModal({onClose}){const tools=allToolKeys().map(([id,k])=>[k.toUpperCase(),(toolInfo(id)||{}).label||id]).sort((a,b)=>a[0].localeCompare(b[0]));
  const app=[['Ctrl+N','New project'],['Ctrl+O','Open'],['Ctrl+S','Save'],['Ctrl+Shift+S','Save as'],['Ctrl+Z','Undo'],['Ctrl+Y or Ctrl+Shift+Z','Redo'],['Ctrl+C / X / V','Copy, cut, paste'],['Ctrl+D','Duplicate'],['E','Rotate 90° or flip the selection'],['Del or Backspace','Delete the selection'],['Esc','Finish the current tool, then select nothing'],['F','Fit the drawing in the window'],['Arrow keys','Nudge the selection 1" (Shift: 12")'],['Shift-drag','Select everything in a box'],['/ or ;','Type a command or coordinates'],['?','This card']];
  const cmds=[['L','Line'],['PL','Polyline'],['REC','Rectangle'],['C','Circle'],['A','Arc'],['W','Wall'],['M / CO','Move / copy'],['RO 90','Rotate'],['MI','Mirror'],['AR','Array'],['O 6','Offset 6"'],['TR / EX','Trim / extend'],['AD','Auto dimension'],['SEC','Section cut'],['x,y  @dx,dy  @L<A','Points: absolute, relative, distance and angle']];
  const T=(rows)=>html`<table className="mat keys"><tbody>${rows.map(([k,l])=>html`<tr key=${k+l}><td><kbd>${k}</kbd></td><td>${l}</td></tr>`)}</tbody></table>`;
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide" role="dialog" aria-label="Keyboard shortcuts">
    <h2>Keyboard shortcuts</h2><div className="keygrid"><div><h3>Program</h3>${T(app)}</div><div><h3>Tools</h3>${T(tools)}</div><div><h3>Command line</h3>${T(cmds)}</div></div>
    <div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Close</button></div></div></div>`;}
