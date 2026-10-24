/* ======================= app ======================= */
function App(){
  const narrow=window.matchMedia('(max-width: 820px)').matches;
  const [project,setProject]=useState(()=>loadSaved()||sampleProject());
  const [preview,setPreviewS]=useState(null); const previewRef=useRef(null);
  const setPreview=q=>{previewRef.current=q;setPreviewS(q);};
  const undo=useRef([]), redo=useRef([]); const [,tick]=useState(0);
  const [levelId,setLevelId]=useState(()=>project.levels[0].id);
  const [tool,setTool]=useState('select');
  const [sel,setSel]=useState(null);
  const [mode,setModeS]=useState(()=>{let m=null;try{m=localStorage.getItem('remodel-studio:mode');}catch(e){}return narrow?'plan':(['design','split','plan','3d'].includes(m)?m:'design');});
  const setMode=m=>{setModeS(m);if(['design','split','plan','3d'].includes(m)){try{localStorage.setItem('remodel-studio:mode',m);}catch(e){}}};
  const [ortho,setOrtho]=useState(true);
  const [wallPreset,setWallPreset]=useState('ext4'); const [fixtureType,setFixtureType]=useState('toilet'); const [openPreset,setOpenPreset]=useState({door:null,window:null}); const [elecType,setElecType]=useState('recept'); const [showElec,setShowElec]=useState(true);
  const [cutaway,setCutaway]=useState(true), [showRoof,setShowRoof]=useState(true);
  const [fitPlan,setFitPlan]=useState(0), [fit3,setFit3]=useState(0);
  const [modal,setModal]=useState(false); const [renderOpen,setRenderOpen]=useState(false);const [exportOpen,setExportOpen]=useState(false);
  const [sun,setSun]=useState(()=>{const d=new Date();const pad=n=>String(n).padStart(2,'0');return {on:false,play:false,date:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,min:15*60};}); const [collapsed,setCollapsed]=useState(narrow);

  const commit=useCallback(next=>{setProject(prev=>{if(prev===next)return prev;undo.current.push(prev);if(undo.current.length>200)undo.current.shift();redo.current=[];return next;});previewRef.current=null;setPreviewS(null);tick(t=>t+1);},[]);
  const commitPreview=()=>{const q=previewRef.current;if(q)commit(q);};
  const projRef=useRef(project);projRef.current=project;
  const doUndo=()=>{if(!undo.current.length)return;setProject(cur=>{redo.current.push(cur);return undo.current.pop();});tick(t=>t+1);};
  const doRedo=()=>{if(!redo.current.length)return;setProject(cur=>{undo.current.push(cur);return redo.current.pop();});tick(t=>t+1);};
  const load=q=>{undo.current.push(project);redo.current=[];setProject(q);setSel(null);setLevelId(q.levels[0].id);setFitPlan(x=>x+1);setFit3(x=>x+1);};
  // ---- file state ----
  const [cmpOpt,setCmpOpt]=useState(null);useEffect(()=>{loadModels(project.id);},[project.id]);
  const [dlg,setDlg]=useState(null);const [custIt,setCustIt]=useState(null);useEffect(()=>{const f=e=>setCustIt(e.detail);window.addEventListener('rs-customize',f);return ()=>window.removeEventListener('rs-customize',f);},[]);useEffect(()=>{const f=()=>setDlg('vendors');window.addEventListener('rs-vendor-import',f);return ()=>window.removeEventListener('rs-vendor-import',f);},[]);useEffect(()=>{const f=e=>setDlg(e.detail);window.addEventListener('rs-dialog',f);return ()=>window.removeEventListener('rs-dialog',f);},[]); const [toast,setToast]=useState(null); const fileHandle=useRef(null); const deskPath=useRef(null); const [recentFiles,setRecentFiles]=useState([]);
  const [savedProj,setSavedProj]=useState(()=>{if(DESK)return project;const q=listSaved().find(x=>x.id===project.id);return q?project:null;});
  const dirty=savedProj!==project;
  const say=(t,ok=true)=>{setToast({t,ok});clearTimeout(say.t);say.t=setTimeout(()=>setToast(null),3500);};
  const openProject=(q,h)=>{load(q);fileHandle.current=h||null;setSavedProj(q);say('Opened '+q.name+'.');};
  const deskSave=async(pp,asNew)=>{const text=JSON.stringify(pp,null,1);let r;
    if(deskPath.current&&!asNew)r=await DESK.writePath(deskPath.current,text,pp.name);else{r=await DESK.saveProjectAs(pp.name,text);if(!r)return false;}
    if(!r.ok){say('Could not save: '+(r.error||'unknown error'),false);return false;}
    deskPath.current=r.path;setSavedProj(pp);say('Saved '+r.path+'.');DESK.recent().then(setRecentFiles);return true;};
  const deskOpen=async(res)=>{if(!res)return;if(res.error){say('Could not open the file: '+res.error,false);return;}
    try{const q=parseProjectText(res.text);load(q);deskPath.current=res.path;fileHandle.current=null;setSavedProj(q);say('Opened '+res.path+'.');DESK.recent().then(setRecentFiles);}catch(e){say(e.message||'That file could not be read.',false);}};
  const doOpen=()=>{if(DESK)DESK.openDialog().then(deskOpen);else setDlg('open');};
  const doSave=async(pp=project)=>{if(DESK)return deskSave(pp,false);const ok=saveToBrowser(pp);let where=ok?'in this browser':'';
    if(fileHandle.current){try{await writeHandle(fileHandle.current,pp);where+=(where?' and ':'')+'to '+fileHandle.current.name;}catch(e){say('Could not write the file: '+(e.message||e),false);}}
    if(!ok&&!fileHandle.current){say('This browser would not save the project (storage full or turned off). Use File, Download a copy.',false);return false;}
    setSavedProj(pp);say('Saved '+where+'.');return true;};
  const saveAs=async(name,where)=>{const q={...project,name,id:uid('prj')};
    if(DESK){const r=await deskSave(q,true);if(r){setProject(q);setSavedProj(q);setDlg(null);}return;}
    if(where==='file'){if(canPickFiles()){try{const h=await pickSaveHandle(q);fileHandle.current=h;}catch(e){if(e&&e.name==='AbortError')return;}}
      else{fileHandle.current=null;const r=await saveFile(safeName(name)+'.json',JSON.stringify(q,null,1));if(!r.ok){say(r.t,false);return;}}}
    else fileHandle.current=null;
    setProject(q);setDlg(null);await doSave(q);};
  const newProject=kind=>{const q=kind==='sample'?sampleProject():blankProject();load(q);fileHandle.current=null;deskPath.current=null;setSavedProj(null);setDlg(null);say(kind==='sample'?'Sample house loaded.':'New blank project.');};
  const download=async()=>{const r=await saveFile(safeName(project.name)+'.json',JSON.stringify(project,null,1));say(r.t,r.ok);};
  // ---- clipboard ----
  const clip=useRef(null); const pasteN=useRef(0);
  const doCopy=()=>{if(!sel)return;clip.current=copyParts(project,sel);pasteN.current=0;if(clip.current)say('Copied.');};
  const doCut=()=>{if(!sel)return;clip.current=copyParts(project,sel);pasteN.current=0;onDelete();};
  const doPaste=()=>{if(!clip.current)return;pasteN.current++;const r=pasteParts(project,clip.current,lvlOf(project,levelId)?levelId:project.levels[0].id,pasteN.current);if(!r){say('There is no room to paste that here.',false);return;}commit(r.p);setSel(r.sel);};
  const doDup=()=>{if(!sel)return;const c=copyParts(project,sel);const r=pasteParts(project,c,lvlOf(project,levelId)?levelId:project.levels[0].id,1);if(r){commit(r.p);setSel(r.sel);}};
  const doRotate=()=>{if(!sel)return;const q=rotatePart(project,sel);if(q)commit(q);};

  useEffect(()=>{const t=setTimeout(()=>saveLocal(project),300);return ()=>clearTimeout(t);},[project]);
  // desktop: window title, unsaved-changes guard, files opened from Explorer
  const latest=useRef({});latest.current={doSave,deskOpen};
  useEffect(()=>{if(DESK)DESK.setDirty(dirty&&project.walls.length>0,project.name+(dirty?' •':'')+' — Remodel Studio');},[dirty,project.name]);
  useEffect(()=>{if(!DESK)return;DESK.recent().then(setRecentFiles);DESK.takePending().then(r=>{if(r)latest.current.deskOpen(r);});
    const off1=DESK.on('open-path',p=>DESK.readPath(p).then(r=>latest.current.deskOpen(r)));
    const off2=DESK.on('save-then-close',async()=>{if(await latest.current.doSave())DESK.closeNow();});
    return ()=>{off1();off2();};},[]);
  useEffect(()=>{if(!project.levels.find(l=>l.id===levelId))setLevelId(project.levels[0].id);},[project]);
  useEffect(()=>{if(!sel)return;if(sel.kind==='multi'){const items=sel.items.filter(i=>findObj(project,i));if(items.length!==sel.items.length)setSel(items.length>1?{kind:'multi',items}:items[0]||null);}else if(!findObj(project,sel))setSel(null);},[project]);

  const selShow=s=>{setSel(s);if(s)setCollapsed(false);};
  window.__app={setTool,commit,get:()=>projRef.current,setSel,setMode,setLevelId,load:q=>{load(q);fileHandle.current=null;deskPath.current=null;setSavedProj(null);},save:()=>doSave(),dirty:()=>dirty};
  const shown=preview||project;
  const issues=useMemo(()=>runChecks(project),[project]);
  const site=siteOf(project); const sunInfo=useMemo(()=>{if(!sun.on)return {on:false};const s=sunFor(site,sun.date,sun.min);return {on:true,alt:s.alt,az:s.az,bearing:site.bearing};},[sun.on,sun.date,sun.min,site.lat,site.lon,site.tz,site.dst,site.bearing]);
  const members=useMemo(()=>analyzeStructure(project),[project]);
  const [structView,setStructView]=useState(false); const [layer,setLayer]=useState('both');
  const structMap=useMemo(()=>structView?new Map(members.map(m=>[m.id,m.ratio])):null,[structView,members]);
  const [panel,setPanel]=useState('props'); const [showIssues,setShowIssues]=useState(true);
  const nErr=issues.filter(i=>i.sev==='error').length, nWarn=issues.filter(i=>i.sev==='warn').length;
  const goTo=i=>{if(i.level)setLevelId(i.level);if(i.target){setSel(i.target);setPanel('props');setCollapsed(false);}};
  const onDelete=()=>{if(!sel)return;if(sel.kind==='multi'){let q=project;for(const i of sel.items)if(findObj(q,i))q=delObj(q,i);commit(q);setSel(null);return;}if(findObj(project,sel)){commit(delObj(project,sel));setSel(null);}};
  useEffect(()=>{
    const kd=e=>{const k=e.key.toLowerCase();const mod=e.ctrlKey||e.metaKey;
      if(mod&&k==='n'){e.preventDefault();setDlg('new');return;}
      if(mod&&k==='s'){e.preventDefault();if(e.shiftKey)setDlg('saveas');else doSave();return;}
      if(mod&&k==='o'){e.preventDefault();doOpen();return;}
      const t=document.activeElement;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;if(modal||dlg)return;
      if(mod&&k==='c'){if(sel){e.preventDefault();doCopy();}return;}
      if(mod&&k==='x'){if(sel){e.preventDefault();doCut();}return;}
      if(mod&&k==='v'){if(clip.current){e.preventDefault();doPaste();}return;}
      if(mod&&k==='d'){e.preventDefault();doDup();return;}
      if(!mod&&!e.altKey&&k==='e'&&sel){doRotate();return;}
      if((e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();e.shiftKey?doRedo():doUndo();return;}
      if((e.ctrlKey||e.metaKey)&&k==='y'){e.preventDefault();doRedo();return;}
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      if(e.key==='?'||(e.shiftKey&&e.key==='/')){e.preventDefault();setDlg('keys');return;}
      const tl=allToolKeys().find(x=>x[1].toLowerCase()===k);if(tl){setTool(tl[0]);return;}
      if(k==='f'){setFitPlan(x=>x+1);setFit3(x=>x+1);}
    };window.addEventListener('keydown',kd);return ()=>window.removeEventListener('keydown',kd);});

  window.__say=say;
  const lv=lvlOf(project,levelId)||project.levels[0];
  const under=useUnderlayImages(shown,lv.id); const [ulMove,setUlMove]=useState(false);
  const ulChip=(shown.underlay&&shown.underlay.level===lv.id)||(shown.cloud&&shown.cloud.level===lv.id)?html`<button key="ul" className=${'chip'+(ulMove?' on':'')} onClick=${()=>setUlMove(!ulMove)} title="Drag the underlay or scan into place with the Select tool">Move underlay</button>`:null;
  const issueChip=html`<button key="ic" className=${'chip'+(showIssues?' on':'')} onClick=${()=>setShowIssues(!showIssues)} title="Show code-check markers on the plan">Issues ${showIssues?'shown':'hidden'}</button>`;
  const libBtn=html`<button key="lb" className="btn" onClick=${()=>{setPanel('library');setCollapsed(false);}}>More in the Library…</button>`;
  const fxPicker=html`<select id="fixture-type" className="inp" style=${{width:'auto',maxWidth:'260px'}} value=${fixtureType} onChange=${e=>setFixtureType(e.target.value)} aria-label="Fixture type">${LIB_BY_ID[fixtureType]?html`<option value=${fixtureType}>${LIB_BY_ID[fixtureType].label}</option>`:null}${['Bath','Kitchen','Laundry','Furniture'].map(c=>html`<optgroup key=${c} label=${c}>${Object.entries(FIXTURES).filter(([k,v])=>v.cat===c).map(([k,v])=>html`<option key=${k} value=${k}>${v.label}</option>`)}</optgroup>`)}</select>`;
  const openPick=k=>html`<select id=${k+'-preset'} className="inp" style=${{width:'auto',maxWidth:'260px'}} value=${openPreset[k]||''} onChange=${e=>setOpenPreset(s=>({...s,[k]:e.target.value||null}))} aria-label=${k+' type'}><option value="">${k==='door'?'Standard 36" door':'Standard 36" x 48" window'}</option>${[...new Set(LIB.filter(x=>x.place===k).map(x=>x.sub))].map(sb=>html`<optgroup key=${sb} label=${sb}>${LIB.filter(x=>x.place===k&&x.sub===sb).map(x=>html`<option key=${x.id} value=${x.id}>${x.label}</option>`)}</optgroup>`)}</select>`;
  const elecPick=html`<select id="elec-type" className="inp" style=${{width:'auto',maxWidth:'240px'}} value=${elecType} onChange=${e=>setElecType(e.target.value)} aria-label="Electrical device">${ELEC_CATS.map(c=>html`<optgroup key=${c} label=${c}>${Object.entries(ELEC).filter(([k,v])=>v.cat===c).map(([k,v])=>html`<option key=${k} value=${k}>${v.label}</option>`)}</optgroup>`)}</select>
    <button className="btn primary" onClick=${()=>{const q=autoElectrical(project,lv.id);commit(q);const n=(q.elec||[]).filter(d=>d.auto&&d.level===lv.id).length;say(`Placed ${n} devices on ${lv.name}. Manual devices were kept; earlier auto-placed ones were replaced.`);}} title="Lay out receptacles, lights, switches and alarms to the IRC rules">Auto-place this floor</button>
    <button className="btn" onClick=${()=>{const r=autoLinkSwitches(project,lv.id);commit(r.p);say(r.n?`Linked ${r.n} light${r.n===1?'':'s'} to the switches in their rooms.`:'Every light already has a switch, or a room has no switch to link to.');}} title="Run a switch leg from each unswitched light to the nearest switch in its room">Link switches to lights</button>`;
  const elecChip=html`<button key="ec" className=${'chip'+(showElec?' on':'')} onClick=${()=>setShowElec(!showElec)}>Electrical ${showElec?'shown':'hidden'}</button>`;
  const optbar=tool==='elec'?html`${elecPick}${issueChip}`:tool==='fixture'?html`${fxPicker}${libBtn}${issueChip}`:(tool==='door'||tool==='window')?html`${openPick(tool)}${libBtn}`:tool!=='wall'?html`${issueChip}${elecChip}${ulChip}`:html`
      <select id="wall-preset" className="inp" style=${{width:'auto'}} value=${wallPreset} onChange=${e=>setWallPreset(e.target.value)} aria-label="Wall type">${Object.entries(WALL_PRESETS).map(([k,v])=>html`<option key=${k} value=${k}>${v.label}</option>`)}</select>
      <button className=${'chip'+(ortho?' on':'')} onClick=${()=>setOrtho(!ortho)}>45° snap ${ortho?'on':'off'}</button>`;
  const cmpModel=cmpOpt&&(ensureOptions(project).options.find(o=>o.id===cmpOpt)||{}).model;const planFor=(x={})=>html`<${PlanView} compareWalls=${cmpModel&&cmpModel.walls?cmpModel.walls.filter(w=>!project.walls.some(x=>x.id===w.id&&Math.abs(x.x1-w.x1)+Math.abs(x.y1-w.y1)+Math.abs(x.x2-w.x2)+Math.abs(x.y2-w.y2)<0.5)):[]} project=${shown} levelId=${lv.id} tool=${tool} setTool=${setTool} sel=${sel} setSel=${selShow} commit=${commit} setPreview=${setPreview} commitPreview=${commitPreview}
      ortho=${ortho} wallPreset=${wallPreset} layer=${layer} fixtureType=${fixtureType} openPreset=${openPreset} elecType=${elecType} showElec=${showElec||tool==='elec'} under=${under} ulMove=${ulMove&&tool==='select'} fitToken=${fitPlan} onDelete=${onDelete} onUndo=${doUndo} onRedo=${doRedo} narrow=${narrow} optbar=${optbar} issues=${showIssues?issues:[]} onIssue=${goTo} ...${x}/>`;const planEl=planFor();const inspEl=html`<${Inspector} libCtx=${{p:project,sel,commit,setTool,setFixtureType,setWallPreset,setOpenPreset,setMode,say}} p=${project} levelId=${lv.id} setLevelId=${setLevelId} sel=${sel} setSel=${selShow} commit=${commit} onDelete=${onDelete} collapsed=${collapsed} setCollapsed=${setCollapsed} onFile=${()=>setModal(true)} panel=${panel} setPanel=${setPanel} issues=${issues} goTo=${goTo} members=${members}/>`;
  const v3El=html`<div className="pane" style=${{display:'grid'}}><${View3D} commit=${commit} setSel=${setSel} project=${shown} levelId=${lv.id} sel=${sel} cutaway=${cutaway} showRoof=${showRoof} fitToken=${fit3} struct=${structMap} layer=${layer} sunInfo=${sunInfo} cloud=${under.cloudPts}/>${sun.on?html`<${SunPanel} p=${project} commit=${commit} sun=${sun} setSun=${setSun}/>`:null}
      <div className="corner"><button className=${'chip'+(showRoof?' on':'')} onClick=${()=>setShowRoof(!showRoof)}>Show roof</button><button className=${'chip'+(cutaway?' on':'')} onClick=${()=>setCutaway(!cutaway)} title="Hide levels above the one you are working on">Cut at level</button><button className=${'chip'+(sun.on?' on':'')} onClick=${()=>setSun(s=>({...s,on:!s.on,play:false}))} title="Sun and shadow study">Sun</button><button className="btn primary" onClick=${()=>setRenderOpen(true)} title="Photoreal render of this view, right here">Render</button><button className="btn" onClick=${()=>setExportOpen(true)} title="AR view on an iPhone, 3D printing and CAD export">AR / Export</button><button className=${'chip'+(structView?' on':'')} onClick=${()=>setStructView(!structView)} title="Color members by how much of their capacity they use">Loads</button><button className="btn" onClick=${()=>setFit3(x=>x+1)}>Fit</button></div></div>`;
  return html`<div className="app">
    <header className="top">
      <div className="brand">Remodel <span>Studio</span></div>
      <div className="menus">
      <${MenuButton} id="menu-file" label="File" items=${[
        {label:'New…',key:'Ctrl+N',run:()=>setDlg('new')},{label:'Open…',key:'Ctrl+O',run:doOpen},
        ...(DESK&&recentFiles.length?['-',...recentFiles.slice(0,8).map(r=>({label:'↻ '+r.name,run:()=>DESK.readPath(r.path).then(deskOpen)}))]:[]),'-',
        {label:'Save',key:'Ctrl+S',run:()=>doSave()},{label:'Save as…',key:'Ctrl+Shift+S',run:()=>setDlg('saveas')},{label:'Backups…',run:()=>setDlg('backups')},...(DESK?[{label:'Show file in folder',run:()=>deskPath.current&&DESK.showInFolder(deskPath.current),disabled:!deskPath.current}]:[{label:'Download a copy (.json)',run:download}]),{label:'Copy or paste project text…',run:()=>setModal(true)},{label:'Versions…',run:()=>setDlg('versions')},'-',
        {label:'Import DWG or DXF drawing…',run:()=>setDlg('dxf')},{label:'Import 3D model (OBJ, GLB, DAE, STL)…',run:()=>setDlg('obj')},{label:'Import vendor catalog…',run:()=>setDlg('vendors')},{label:'Add photos…',run:()=>setMode('capture')},{label:'Print plans (PDF) and DXF…',run:()=>setMode('sheets')},{label:'Materials list (CSV)…',run:()=>setMode('materials')},{label:'Render (photoreal)…',run:()=>setRenderOpen(true)},{label:'AR view and 3D export…',run:()=>setExportOpen(true)}]}/>
      <${MenuButton} id="menu-edit" label="Edit" items=${[
        {label:'Undo',key:'Ctrl+Z',run:doUndo,disabled:!undo.current.length},{label:'Redo',key:'Ctrl+Y',run:doRedo,disabled:!redo.current.length},'-',
        {label:'Cut',key:'Ctrl+X',run:doCut,disabled:!sel},{label:'Copy',key:'Ctrl+C',run:doCopy,disabled:!sel},{label:'Paste',key:'Ctrl+V',run:doPaste,disabled:!clip.current},
        {label:'Duplicate',key:'Ctrl+D',run:doDup,disabled:!sel},{label:'Rotate 90° or flip',key:'E',run:doRotate,disabled:!sel},{label:'Delete',key:'Del',run:onDelete,disabled:!sel},'-',
        {label:'Select nothing',key:'Esc',run:()=>setSel(null),disabled:!sel},'-',{label:'Save selection as block…',run:()=>setDlg('blocks'),disabled:!sel},{label:'Blocks…',run:()=>setDlg('blocks')},'-',{label:'Rename project…',run:()=>setDlg('rename')},{label:'Lessons…',run:()=>setDlg('lessons')},{label:'Keyboard shortcuts',key:'?',run:()=>setDlg('keys')}]}/>
      </div>
      <div className="projname" title=${project.name+(dirty?' (not saved)':'')}>${project.name}${dirty?html`<span className="dirty" aria-label="not saved"> •</span>`:null}</div>
      <div className="spacer"></div>
      <select id="option-pick" className="inp lvlsel" value=${ensureOptions(project).activeOption} onChange=${e=>{const v=e.target.value;if(v==='__new'){commit(addOption(project));}else commit(switchOption(project,v));setSel(null);}} aria-label="Design option" title="Design option">${ensureOptions(project).options.map(o=>html`<option key=${o.id} value=${o.id}>${o.name}</option>`)}<option value="__new">+ New option (copy)</option></select>${ensureOptions(project).options.length>1?html`<select className="inp lvlsel" value=${cmpOpt||''} onChange=${e=>setCmpOpt(e.target.value||null)} aria-label="Compare with option" title="Show another option's walls in magenta on the plan"><option value="">Compare: off</option>${ensureOptions(project).options.filter(o=>o.id!==ensureOptions(project).activeOption).map(o=>html`<option key=${o.id} value=${o.id}>vs ${o.name}</option>`)}</select>`:null}
      <select id="layer-pick" className="inp lvlsel" value=${layer} onChange=${e=>setLayer(e.target.value)} aria-label="Remodel layer" title="Which remodel work to show"><option value="both">Existing + new</option><option value="existing">Existing only</option><option value="proposed">Proposed</option></select>
      <select id="level-pick" className="inp lvlsel" value=${lv.id} onChange=${e=>setLevelId(e.target.value)} aria-label="Level">${sortedLevels(project).map(l=>html`<option key=${l.id} value=${l.id}>${l.name}</option>`)}</select>
      <div className="seg" role="group" aria-label="View">${[...(narrow?[]:[['design','Designer']]),['plan','Plan'],['split','Split'],['3d','3D'],['capture','Capture'],['sheets','Sheets'],['materials','Materials'],['systems','Systems']].map(([k,l])=>html`<button key=${k} className=${mode===k?'on':''} onClick=${()=>setMode(k)}>${l}</button>`)}</div>
      <button className=${'btn'+(panel==='library'&&mode!=='sheets'?' on':'')} id="lib-btn" onClick=${()=>{const open=!(panel==='library');setPanel(open?'library':'props');if(open){setCollapsed(false);if(['sheets','materials','capture'].includes(mode))setMode(narrow?'plan':'split');}}} title="Doors, windows, cabinets, fixtures, trim, finishes and colors">Library</button>
      <button className=${'btn checkbtn'+(panel==='checks'&&mode!=='sheets'?' on':'')} onClick=${()=>{const open=!(panel==='checks'&&mode!=='sheets');setPanel(open?'checks':'props');if(open){setCollapsed(false);if(mode==='sheets')setMode(narrow?'plan':'split');}}} title="Code check: 2021 IRC and 2010 ADA">Check
        ${nErr?html`<span className="cnt bad">${nErr}</span>`:null}${nWarn?html`<span className="cnt warn">${nWarn}</span>`:null}${!nErr&&!nWarn?html`<span className="cnt ok">✓</span>`:null}</button>
      <button className="btn undo-redo" onClick=${doUndo} disabled=${!undo.current.length} aria-label="Undo" title="Undo (Ctrl+Z)">${I.undo}</button>
      <button className="btn undo-redo" onClick=${doRedo} disabled=${!redo.current.length} aria-label="Redo" title="Redo (Ctrl+Y)">${I.redo}</button>
    </header>
    ${mode==='sheets'?html`<${SheetsView} p=${project} commit=${commit}/>`:mode==='materials'?html`<${MaterialsView} p=${project} commit=${commit}/>`:mode==='systems'?html`<${SystemsView} p=${project} commit=${commit}/>`:mode==='design'?html`<${DesignerView} D=${{p:project,shown,commit,sel,setSel:selShow,tool,setTool,lv,setLevelId,planFor,inspEl,libCtx:{p:project,sel,commit,setTool,setFixtureType,setWallPreset,setOpenPreset,setMode,say},setMode,say,setDlg,doUndo,doRedo,onDelete,issues,goTo,fixtureType,setFixtureType,setOpenPreset,setWallPreset,fitPlan:()=>setFitPlan(x=>x+1),fit3:()=>setFit3(x=>x+1),openRender:()=>setRenderOpen(true),openExport:()=>setExportOpen(true),layer,panel,setPanel,setCollapsed,showElec,setShowElec,v3:(x={})=>html`<${View3D} commit=${commit} setSel=${setSel} project=${shown} levelId=${lv.id} sel=${sel} cutaway=${cutaway} showRoof=${showRoof} fitToken=${fit3} struct=${structMap} layer=${layer} sunInfo=${sunInfo} cloud=${under.cloudPts} ...${x}/>`,cutaway,setCutaway,showRoof,setShowRoof,sun,setSun,undoN:undo.current.length,redoN:redo.current.length,doCopy,doPaste,doDup,doRotate,setStructView,structView}}/>`:mode==='capture'?html`<${CaptureView} libCtx=${{p:project,sel,commit,setTool,setFixtureType,setWallPreset,setOpenPreset,setMode,say}} p=${project} commit=${commit} sel=${sel} setSel=${setSel} levelId=${lv.id} setLevelId=${setLevelId} setMode=${setMode}/>`:html`<div className="main">
      <${ToolRail} tool=${tool} setTool=${setTool} narrow=${narrow} setCollapsed=${setCollapsed}/>
      <div className=${'stage'+(mode==='split'?' split':'')}>${mode!=='3d'?planEl:null}${mode!=='plan'?v3El:null}</div>
      ${inspEl}
    </div>`}
    ${modal?html`<${FileModal} p=${project} onLoad=${load} onClose=${()=>setModal(false)}/>`:null}
    ${dlg==='open'?html`<${OpenModal} onOpen=${openProject} onClose=${()=>setDlg(null)}/>`:null}
    ${dlg==='saveas'?html`<${SaveAsModal} p=${project} onSave=${saveAs} onClose=${()=>setDlg(null)}/>`:null}
    ${dlg==='new'?html`<${NewModal} dirty=${dirty&&(project.walls.length>0)} onNew=${newProject} onSaveFirst=${async()=>{await doSave();}} onClose=${()=>setDlg(null)}/>`:null}
    ${dlg==='versions'?html`<${VersionsModal} p=${project} onRestore=${(q,n)=>{commit(q);setDlg(null);say(`Restored "${n}". Undo brings back what you had.`);}} onClose=${()=>setDlg(null)}/>`:null}
    ${dlg==='blocks'?html`<${BlocksModal} p=${project} sel=${sel} setTool=${setTool} say=${say} onClose=${()=>setDlg(null)}/>`:null}
    ${dlg==='keys'?html`<${KeysModal} onClose=${()=>setDlg(null)}/>`:null}
    ${custIt&&LIB_BY_ID[custIt]?html`<${ItemCustomizeModal} it=${LIB_BY_ID[custIt]} p=${project} ctx=${{setTool,setFixtureType,setOpenPreset,setMode}} onClose=${()=>setCustIt(null)}/>`:null}
    ${dlg&&EXTRA_DIALOGS[dlg]?html`<${EXTRA_DIALOGS[dlg]} p=${project} commit=${commit} levelId=${lv.id} setMode=${setMode} sel=${sel} setSel=${setSel} onClose=${()=>setDlg(null)}/>`:null}
    ${dlg==='vendors'?html`<${VendorImportModal} onClose=${()=>setDlg(null)} onDone=${()=>commit({...project})}/>`:null}
    ${dlg==='obj'?html`<${OBJImportModal} p=${project} levelId=${lv.id} commit=${commit} setSel=${setSel} onClose=${()=>setDlg(null)}/>`:null}
    ${dlg==='dxf'?html`<${DXFImportModal} p=${project} levelId=${lv.id} commit=${commit} onClose=${()=>setDlg(null)}/>`:null}
    ${dlg==='rename'?html`<${RenameModal} p=${project} onDone=${n=>{commit({...project,name:n});setDlg(null);}} onClose=${()=>setDlg(null)}/>`:null}
    ${APP_OVERLAYS.map((C,i)=>html`<${C} key=${'ov'+i} p=${project} commit=${commit} setMode=${setMode} setDlg=${setDlg} sel=${sel} levelId=${lv.id}/>`)}
    ${toast?html`<div className=${'toast'+(toast.ok?'':' err')} role="status">${toast.t}</div>`:null}
    ${exportOpen?html`<${ExportModal} p=${project} sun=${sun} onClose=${()=>setExportOpen(false)} onRender=${()=>setRenderOpen(true)}/>`:null}${renderOpen?html`<${RenderStudio} p=${project} sun=${sun} onClose=${()=>setRenderOpen(false)}/>`:null}
  </div>`;
}
ReactDOM.createRoot(document.getElementById('root')).render(html`<${App}/>`);
