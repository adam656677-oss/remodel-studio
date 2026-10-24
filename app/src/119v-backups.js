/* ======================= automatic backup copies (desktop) and the Backups dialog ======================= */
// Every save already keeps a dated copy in Documents\Remodel Studio\Backups. This also writes an autosave copy every
// 5 minutes while there are unsaved changes, so a crash or a bad save never costs more than a few minutes of work.
function AutoBackup(){useEffect(()=>{if(!DESK||!DESK.autoBackup)return;const t=setInterval(()=>{try{const a=window.__app;if(!a||!a.dirty||!a.dirty())return;const p=a.get();if(!p||!(p.walls||[]).length)return;DESK.autoBackup(p.name||'Untitled',JSON.stringify(p));}catch(e){}},300000);return ()=>clearInterval(t);},[]);return null;}
APP_OVERLAYS.push(AutoBackup);
function BackupsModal({p,onClose}){const [list,setList]=useState(null);const [msg,setMsg]=useState(null);
  useEffect(()=>{if(DESK&&DESK.listBackups)DESK.listBackups().then(setList);else setList([]);},[]);
  const restore=async b=>{const r=await DESK.readPath(b.path);if(r.error){setMsg(r.error);return;}try{const q=parseProjectText(r.text);window.__app.load({...q,name:q.name+' (restored '+new Date(b.mtime).toLocaleDateString()+')'});onClose();window.__say&&window.__say('Backup opened as an unsaved copy. Save it to keep it.');}catch(e){setMsg(e.message);}};
  const groups={};for(const b of list||[])(groups[b.project]=groups[b.project]||[]).push(b);
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide" role="dialog" aria-label="Backups"><h2>Backups</h2>
    ${!DESK?html`<p className="note">In the web version, earlier versions are kept in this browser: File › Versions.</p>`:html`<p className="note">A dated copy is kept every time you save, and an autosave copy every 5 minutes while there are unsaved changes (Documents\\Remodel Studio\\Backups). The newest 25 saves and 40 autosaves per project are kept.</p>
      ${list==null?html`<p className="note">Loading…</p>`:!list.length?html`<p className="note">No backups yet.</p>`:Object.entries(groups).map(([proj,bs])=>html`<details key=${proj} open=${proj===safeName(p.name)}><summary><b>${proj}</b> · ${bs.length} cop${bs.length===1?'y':'ies'}</summary>
        <table className="mat"><tbody>${bs.slice(0,30).map(b=>html`<tr key=${b.path}><td>${new Date(b.mtime).toLocaleString()}</td><td>${/autosave/.test(b.name)?'Autosave':'Saved'}</td><td className="num">${Math.round(b.size/1024)} KB</td><td><button className="btn small" onClick=${()=>restore(b)}>Open</button></td></tr>`)}</tbody></table></details>`)}
      <div className="row"><button className="btn" onClick=${()=>DESK.openBackupsFolder&&DESK.openBackupsFolder()}>Open the backups folder</button></div>`}
    ${msg?html`<p className="note bad">${msg}</p>`:null}<div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Close</button></div></div></div>`;}
EXTRA_DIALOGS.backups=BackupsModal;
