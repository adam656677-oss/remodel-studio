/* ======================= File and Edit menus ======================= */
// Projects saved with File > Save live in this browser's project list (and, in the standalone copy on Chrome or Edge,
// also in a .json file you pick). The autosave in 030-storage.js stays as crash recovery.
const IDX_KEY='remodel-studio:index', PRJ_KEY=id=>'remodel-studio:proj:'+id;
function listSaved(){try{return JSON.parse(localStorage.getItem(IDX_KEY)||'[]');}catch(e){return [];}}
function saveToBrowser(p){
  try{localStorage.setItem(PRJ_KEY(p.id),JSON.stringify(p));const idx=listSaved().filter(x=>x.id!==p.id);idx.unshift({id:p.id,name:p.name,saved:new Date().toISOString(),area:Math.round(p.rooms.reduce((s,r)=>s+polyArea(r.pts),0)/144)});
    localStorage.setItem(IDX_KEY,JSON.stringify(idx));return true;}catch(e){return false;}
}
function loadFromBrowser(id){try{const q=JSON.parse(localStorage.getItem(PRJ_KEY(id))||'null');return validProject(q)?normalize(q):null;}catch(e){return null;}}
function deleteFromBrowser(id){try{localStorage.removeItem(PRJ_KEY(id));localStorage.setItem(IDX_KEY,JSON.stringify(listSaved().filter(x=>x.id!==id)));}catch(e){}}
const canPickFiles=()=>!framedView&&typeof window.showSaveFilePicker==='function';
async function writeHandle(h,p){const w=await h.createWritable();await w.write(JSON.stringify(p,null,1));await w.close();}
async function pickSaveHandle(p){return window.showSaveFilePicker({suggestedName:safeName(p.name)+'.json',types:[{description:'Remodel Studio project',accept:{'application/json':['.json']}}]});}

/* ---- clipboard for building parts ---- */
function copyParts(p,sel){if(sel&&sel.kind==='multi'){const items=sel.items.map(i=>copyParts(p,i)).filter(Boolean);return items.length?{kind:'multi',items}:null;}const o=findObj(p,sel);if(!o)return null;const clip={kind:sel.kind,obj:JSON.parse(JSON.stringify(o))};
  if(sel.kind==='wall')clip.openings=JSON.parse(JSON.stringify(p.openings.filter(x=>x.wall===o.id)));return clip;}
function pasteParts(p,clip,levelId,n=1){
  if(!clip)return null;if(clip.kind==='multi'){let q=p;const sels=[];for(const c of clip.items){if(c.kind==='opening')continue;const r=pasteParts(q,c,levelId,n);if(r){q=r.p;sels.push(r.sel);}}return sels.length?{p:q,sel:sels.length>1?{kind:'multi',items:sels}:sels[0]}:null;}
  const off=24*n;const o={...JSON.parse(JSON.stringify(clip.obj)),id:uid(clip.kind.slice(0,2))};
  if(clip.kind==='opening'){const w=p.walls.find(w=>w.id===o.wall);if(!w)return null;const L=wlen(w);let pos=o.pos+(o.width+12)*n;if(pos+o.width/2>L)pos=o.pos-(o.width+12)*n;if(pos-o.width/2<0)return null;o.pos=pos;return {p:{...p,openings:[...p.openings,o]},sel:{kind:'opening',id:o.id}};}
  o.level=levelId;
  if(clip.kind==='wall'){o.x1+=off;o.y1+=off;o.x2+=off;o.y2+=off;const ops=(clip.openings||[]).map(x=>({...x,id:uid('op'),wall:o.id}));return {p:{...p,walls:[...p.walls,o],openings:[...p.openings,...ops]},sel:{kind:'wall',id:o.id}};}
  if(clip.kind==='room'){o.pts=o.pts.map(([x,y])=>[x+off,y+off]);o.name=o.name+' copy';return {p:{...p,rooms:[...p.rooms,o]},sel:{kind:'room',id:o.id}};}
  if(clip.kind==='shape'){const q2=moveShape(o,off,off);const c=COLL.shape;return {p:{...p,shapes:[...(p.shapes||[]),q2]},sel:{kind:'shape',id:q2.id}};}
  if(OBJ[clip.kind]){const d=OBJ[clip.kind];const q2=d.move(o,off,off,p);return {p:{...p,[d.coll]:[...(p[d.coll]||[]),q2]},sel:{kind:clip.kind,id:q2.id}};}
  if(clip.kind==='dim'){o.a={x:o.a.x+off,y:o.a.y+off};o.b={x:o.b.x+off,y:o.b.y+off};return {p:{...p,dims:[...(p.dims||[]),o]},sel:{kind:'dim',id:o.id}};}
  o.x+=off;o.y+=off;if(o.leader)o.leader={x:o.leader.x+off,y:o.leader.y+off};const c=COLL[clip.kind];return {p:{...p,[c]:[...(p[c]||[]),o]},sel:{kind:clip.kind,id:o.id}};
}
function rotatePart(p,sel){const o=findObj(p,sel);if(!o)return null;
  if(sel.kind==='fixture')return updObj(p,'fixture',o.id,{rot:((o.rot||0)+90)%360});
  if(sel.kind==='stair'){if(o.a!=null)return updObj(p,'stair',o.id,{a:(o.a+Math.PI/2)%(2*Math.PI)});const order=['N','E','S','W'];return updObj(p,'stair',o.id,{dir:order[(order.indexOf(o.dir||'N')+1)%4]});}
  if(sel.kind==='roof')return updObj(p,'roof',o.id,{ridge:(o.ridge||'x')==='x'?'y':'x'});
  if(OBJ[sel.kind]&&OBJ[sel.kind].rotate){const q=OBJ[sel.kind].rotate(o,p);return q?updObj(p,sel.kind,o.id,q):null;}
  if(sel.kind==='opening'&&o.type==='door')return updObj(p,'opening',o.id,o.hinge?{hinge:0,swing:-(o.swing||1)}:{hinge:1});
  return null;}

/* ---- the menu buttons ---- */
function MenuButton({label,items,id}){
  const [open,setOpen]=useState(false);const ref=useRef(null);const [sub,setSub]=useState(null);const [subRect,setSubRect]=useState(null);useEffect(()=>{if(!open)setSub(null);},[open]);
  useEffect(()=>{if(!open)return;const close=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};const kd=e=>{if(e.key==='Escape')setOpen(false);};
    document.addEventListener('pointerdown',close);window.addEventListener('keydown',kd);return ()=>{document.removeEventListener('pointerdown',close);window.removeEventListener('keydown',kd);};},[open]);
  return html`<div className="menu" ref=${ref}>
    <button id=${id} className=${'btn'+(open?' on':'')} aria-haspopup="menu" aria-expanded=${open} onClick=${()=>setOpen(!open)}>${label} <span aria-hidden="true">▾</span></button>
    ${open?html`<div className="menupop" role="menu">${items.map((it,i)=>it==='-'?html`<hr key=${i}/>`:it.sub?html`<div key=${i} className=${'subwrap'+(sub===i?' open':'')} onMouseEnter=${e=>{setSubRect(e.currentTarget.getBoundingClientRect());setSub(i);}}><button role="menuitem" aria-haspopup="menu" aria-expanded=${sub===i} onClick=${e=>{setSubRect(e.currentTarget.getBoundingClientRect());setSub(i);}}><span>${it.label}</span><span className="subcar" aria-hidden="true">▸</span></button></div>`
      :html`<button key=${i} role="menuitem" disabled=${it.disabled} onMouseEnter=${()=>setSub(null)} onClick=${()=>{setOpen(false);it.run();}}><span>${it.label}</span>${it.key?html`<kbd>${it.key}</kbd>`:null}</button>`)}</div>`:null}
    ${open&&sub!=null&&items[sub]&&items[sub].sub&&subRect?html`<div className="menupop submenu" role="menu" style=${{position:'fixed',left:Math.min(window.innerWidth-250,subRect.right+2)+'px',top:Math.min(window.innerHeight-40,subRect.top-6)+'px'}}>${items[sub].sub.map((s,j)=>s==='-'?html`<hr key=${j}/>`:html`<button key=${j} role="menuitem" disabled=${s.disabled} onClick=${()=>{setOpen(false);s.run();}}><span>${s.label}</span>${s.key?html`<kbd>${s.key}</kbd>`:null}</button>`)}</div>`:null}
  </div>`;
}

/* ---- dialogs ---- */
function OpenModal({onOpen,onClose,onFile}){
  const [list,setList]=useState(listSaved);const [msg,setMsg]=useState(null);
  const pick=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const q=JSON.parse(String(r.result));if(!validProject(q))throw 0;onOpen(normalize(q),null);onClose();}catch(_){setMsg('That file is not a Remodel Studio project.');}};r.readAsText(f);};
  const pickHandle=async()=>{try{const [h]=await window.showOpenFilePicker({types:[{description:'Remodel Studio project',accept:{'application/json':['.json']}}]});const f=await h.getFile();const q=JSON.parse(await f.text());if(!validProject(q))throw 0;onOpen(normalize(q),h);onClose();}catch(e){if(e&&e.name==='AbortError')return;setMsg('That file is not a Remodel Studio project.');}};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-label="Open a project">
    <h2>Open</h2>
    ${list.length?html`<div className="openlist">${list.map(x=>html`<div key=${x.id} className="openrow">
        <button className="btn primary" onClick=${()=>{const q=loadFromBrowser(x.id);if(!q){setMsg('That saved project could not be read.');return;}onOpen(q,null);onClose();}}>Open</button>
        <div className="grow"><b>${x.name}</b><div className="note">${x.area} sq ft · saved ${new Date(x.saved).toLocaleString()}</div></div>
        <button className="btn danger" aria-label=${'Delete '+x.name} onClick=${()=>{deleteFromBrowser(x.id);setList(listSaved());}}>Delete</button></div>`)}</div>`
      :html`<p className="note">No projects saved in this browser yet. Use File, Save to add the one you are working on.</p>`}
    <div className="row">${canPickFiles()?html`<button className="btn" onClick=${pickHandle}>Open a file on this computer…</button>`:html`<label className="btn" htmlFor="open-file">Open a .json file…</label><input id="open-file" type="file" accept=".json,application/json" hidden onChange=${pick}/>`}
      <span className="spacer"></span><button className="btn" onClick=${onClose}>Cancel</button></div>
    ${msg?html`<div className="msg err">${msg}</div>`:null}
  </div></div>`;
}
function SaveAsModal({p,onSave,onClose}){
  const [name,setName]=useState(p.name);
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-label="Save as">
    <h2>Save as</h2>
    <${Field} label="Project name" id="saveas-name"><input id="saveas-name" className="inp" value=${name} onChange=${e=>setName(e.target.value)} autoFocus/><//>
    <p className="note">Saves a separate copy with this name. The copy becomes the project you are working on.</p>
    <div className="row">${DESK?html`<button className="btn primary" disabled=${!name.trim()} onClick=${()=>onSave(name.trim(),'file')}>Choose where to save…</button>`:html`<button className="btn primary" disabled=${!name.trim()} onClick=${()=>onSave(name.trim(),'browser')}>Save in this browser</button>
      <button className="btn" disabled=${!name.trim()} onClick=${()=>onSave(name.trim(),'file')}>${canPickFiles()?'Save to a file on this computer…':'Download as a .json file'}</button>`}
      <span className="spacer"></span><button className="btn" onClick=${onClose}>Cancel</button></div>
  </div></div>`;
}
function NewModal({dirty,onNew,onSaveFirst,onClose}){
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-label="New project">
    <h2>New project</h2>
    ${dirty?html`<div className="msg err">The current project has changes that are not saved. Save it first if you want to keep them.</div>`:null}
    <div className="row">${dirty?html`<button className="btn" onClick=${onSaveFirst}>Save current project</button>`:null}
      <button className="btn primary" onClick=${()=>onNew('blank')}>Blank project</button><button className="btn" onClick=${()=>onNew('sample')}>Sample house</button>
      <span className="spacer"></span><button className="btn" onClick=${onClose}>Cancel</button></div>
  </div></div>`;
}
function RenameModal({p,onDone,onClose}){const [name,setName]=useState(p.name);
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-label="Rename project">
    <h2>Rename</h2><${Field} label="Project name" id="ren-name"><input id="ren-name" className="inp" value=${name} onChange=${e=>setName(e.target.value)} autoFocus onKeyDown=${e=>{if(e.key==='Enter'&&name.trim())onDone(name.trim());}}/><//>
    <div className="row"><button className="btn primary" disabled=${!name.trim()} onClick=${()=>onDone(name.trim())}>Rename</button><span className="spacer"></span><button className="btn" onClick=${onClose}>Cancel</button></div></div></div>`;}
