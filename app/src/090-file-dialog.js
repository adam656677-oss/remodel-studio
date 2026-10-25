/* ======================= file dialog ======================= */
function FileModal({p,onLoad,onClose}){
  const [text,setText]=useState(()=>JSON.stringify(p,null,1)); const [msg,setMsg]=useState(null); const [confirmNew,setConfirmNew]=useState(false);
    const tryLoad=(t)=>{try{const q=JSON.parse(t);if(!validProject(q))throw new Error();onLoad(normalize(q));setMsg({ok:true,t:'Project loaded.'});}catch(e){setMsg({ok:false,t:'That text is not a Remodel Studio project. Paste the full JSON copied from this dialog.'});}};
  const copy=async(e)=>{try{await navigator.clipboard.writeText(text);setMsg({ok:true,t:'Copied. Paste it into a .json file or a note to keep it.'});}catch(_){const ta=e.target.closest('.modal').querySelector('textarea');ta.focus();ta.select();setMsg({ok:true,t:'Text selected. Press Ctrl+C (or Copy) to copy it.'});}};
  const download=async()=>setMsg(await saveFile(safeName(p.name)+'.json',JSON.stringify(p,null,1)));
  const onFile=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{setText(String(r.result));tryLoad(String(r.result));};r.readAsText(f);};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-label="Save or open a project">
    <h2>Save or open</h2>
    <p className="note">Your work saves automatically in this browser. To keep a copy or move it to another computer, download it as a .json file, or copy the project text below and paste it back here later.</p>
    <textarea id="proj-json" value=${text} onChange=${e=>setText(e.target.value)} spellCheck=${false}></textarea>
    <div className="row">
      <button className="btn primary" onClick=${copy}>Copy project</button>
      <button className="btn" onClick=${download}>Download .json</button>
      <button className="btn" onClick=${()=>tryLoad(text)}>Open pasted text</button>
      <label className="btn" htmlFor="proj-file">Open .json file</label><input id="proj-file" type="file" accept=".json,application/json" hidden onChange=${onFile}/>
    </div>
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
    <div className="sec" style=${{padding:'12px 0 0',borderBottom:0,borderTop:'1px solid var(--line)'}}>
      ${confirmNew?html`<p className="note">Start over? The current project is replaced. Copy it first if you want to keep it.</p>
        <div className="row"><button className="btn danger" onClick=${()=>{onLoad(newStandardProject());onClose();}}>Start a blank project</button><button className="btn" onClick=${()=>{onLoad(sampleProject());onClose();}}>Load the sample house</button><button className="btn" onClick=${()=>setConfirmNew(false)}>Cancel</button></div>`
      :html`<div className="row"><button className="btn" onClick=${()=>setConfirmNew(true)}>New project…</button><span className="spacer"></span><button className="btn" onClick=${onClose}>Done</button></div>`}
    </div></div></div>`;
}

