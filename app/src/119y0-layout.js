/* ======================= 2.1 layout: workflow tabs, Check page, Build page, project browser, issues panel, ribbon ======================= */
// One workspace for design (the Designer). Work is grouped the way a job runs: Measure → Design → Check → Documents → Cost → Build.
I.search=html`<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>`;
const WORKFLOWS=[
  {id:'measure',label:'Measure',pages:[['capture','Photos and measurements']],title:'Photos, tape measurements, scans, underlays and field notes'},
  {id:'design',label:'Design',pages:[['design','Model'],['systems','Systems']],narrowPages:[['plan','Plan'],['3d','3D'],['systems','Systems']],title:'Draw and design the model; systems calculations'},
  {id:'check',label:'Check',pages:[['check','Issues']],title:'Code, NKBA, structure, clash and installation checks'},
  {id:'docs',label:'Documents',pages:[['sheets','Sheets'],['schedules','Schedules']],title:'Plan set, presentation and schedules'},
  {id:'cost',label:'Cost',pages:[['materials','Cost']],title:"Builder's list, estimate, shopping, selections, orders, budget vs actual"},
  {id:'build',label:'Build',pages:[['build','Job']],title:'Job schedule, field notes and punch list, wall photos, homeowner binder'},
];
const wfPages=(w,narrow)=>narrow&&w.narrowPages?w.narrowPages:w.pages;
function wfOfMode(m){return WORKFLOWS.find(w=>w.pages.some(x=>x[0]===m)||(w.narrowPages||[]).some(x=>x[0]===m))||WORKFLOWS.find(w=>w.id==='design');}
function WorkflowTabs({mode,setMode,narrow,nErr,nWarn}){const cur=wfOfMode(mode);
  const lastPage=w=>{let v=null;try{v=localStorage.getItem('remodel-studio:wf:'+w.id);}catch(e){}const pg=wfPages(w,narrow);return pg.some(x=>x[0]===v)?v:pg[0][0];};
  const go=(w,pageId)=>{const id=pageId||lastPage(w);try{localStorage.setItem('remodel-studio:wf:'+w.id,id);}catch(e){}setMode(id);};
  const pages=wfPages(cur,narrow);
  const pills=pages.length>1?html`<div className="seg wf-pages" role="group" aria-label=${cur.label+' pages'}>${pages.map(([k,l])=>html`<button key=${k} className=${mode===k||(k==='design'&&['split','plan','3d'].includes(mode)&&!narrow)?'on':''} onClick=${()=>go(cur,k)}>${l}</button>`)}</div>`:null;
  return html`<div className="wf-tabs" role="tablist" aria-label="Workflow">${WORKFLOWS.map((w,i)=>html`<${Fragment} key=${w.id}><button role="tab" aria-selected=${cur.id===w.id} className=${'wf-tab'+(cur.id===w.id?' on':'')+(w.id==='check'?' checkbtn':'')} title=${w.title} onClick=${()=>go(w)}>
      <span className="wf-n">${i+1}</span>${w.label}${w.id==='check'?html`${nErr?html`<span className="cnt bad">${nErr}</span>`:null}${nWarn?html`<span className="cnt warn">${nWarn}</span>`:null}${!nErr&&!nWarn?html`<span className="cnt ok">✓</span>`:null}`:null}</button>${cur.id===w.id?pills:null}<//>`)}</div>`;}

/* ---------- issue categories ---------- */
const ISSUE_CATS=['IRC','IBC','ADA','NKBA','Structure','Framing','Electrical','Plumbing','Appliances','Cabinets','Energy','Zoning','Landscape','Model'];
function issueCat(i){const s=i.rule&&i.rule.set;if(s&&s!=='knee'&&s!=='inset'&&s!=='Practice'){if(s==='NEC')return 'Electrical';return s;}
  const t=(i.title||'')+' '+(i.detail||'');
  if(/notch|bore|drill|clash|runs through|crosses (a|the) (joist|beam|stud|header)/i.test(t))return 'Framing';
  if(/joist|rafter|beam|header|stud|overstress|over capacity|span|bearing|footing|truss|girder|post\b|column/i.test(t))return 'Structure';
  if(/outlet|receptacle|GFCI|AFCI|circuit|switch|smoke|panel|breaker|light/i.test(t))return 'Electrical';
  if(/drain|vent|trap|water heater|pipe|fixture unit|DFU/i.test(t))return 'Plumbing';
  if(/R-?value|insulation|energy|U-factor|SHGC/i.test(t))return 'Energy';
  return 'Model';}
const SEV_LABEL={error:'Errors',warn:'Warnings',tip:'Tips'};
function issueWhere(p,i){const lv=lvlOf(p,i.level);let room=null;if(i.pt)room=p.rooms.find(r=>r.level===i.level&&inPoly(i.pt.x,i.pt.y,r.pts));return [room&&room.name,lv&&lv.name].filter(Boolean).join(' · ');}
function issueKey(i){return [i.title,i.target?i.target.kind+':'+i.target.id:'',i.level||''].join('|');}

/* ---------- Check page ---------- */
function CheckView({p,commit,issues,planFor,setMode,setSel,setLevelId,setDlg,lv}){
  const [sev,setSev]=useState({error:true,warn:true,tip:false});const [cats,setCats]=useState(null);const [q,setQ]=useState('');const [cur,setCur]=useState(null);const [showRev,setShowRev]=useState(false);
  const reviewed=(p.settings&&p.settings.reviewed)||{};
  const counts=useMemo(()=>{const c={};for(const i of issues){const k=issueCat(i);c[k]=c[k]||{error:0,warn:0,tip:0,n:0};c[k][i.sev]=(c[k][i.sev]||0)+1;c[k].n++;}return c;},[issues]);
  const catList=ISSUE_CATS.filter(k=>counts[k]).concat(Object.keys(counts).filter(k=>!ISSUE_CATS.includes(k)));
  const qs=q.trim().toLowerCase();
  const list=issues.filter(i=>sev[i.sev]&&(!cats||cats.includes(issueCat(i)))&&(showRev||!reviewed[issueKey(i)])&&(!qs||((i.title||'')+' '+(i.detail||'')+' '+((i.rule&&i.rule.code)||'')).toLowerCase().includes(qs)));
  const sel=cur!=null?issues.find(i=>issueKey(i)===cur):null;
  const pick=i=>{setCur(issueKey(i));if(i.level)setLevelId(i.level);};
  const toggleCat=k=>setCats(c=>{const all=catList;const s=new Set(c||all);if(s.has(k))s.delete(k);else s.add(k);const a=[...s];return a.length===all.length?null:a;});
  const nSev=s=>issues.filter(i=>i.sev===s).length;
  const markReviewed=(i,on)=>commit({...p,settings:{...p.settings,reviewed:{...reviewed,[issueKey(i)]:on?localDate():undefined}}});
  const byLevel={};for(const i of list){const k=i.level||'';(byLevel[k]=byLevel[k]||[]).push(i);}
  const order=[...sortedLevels(p).map(l=>l.id),''];
  return html`<div className="checkview">
    <aside className="ck-list" aria-label="Issues">
      <div className="ck-sev">${['error','warn','tip'].map(s=>html`<button key=${s} className=${'chip ck-'+s+(sev[s]?' on':'')} aria-pressed=${!!sev[s]} onClick=${()=>setSev({...sev,[s]:!sev[s]})}>${SEV_LABEL[s]} <b>${nSev(s)}</b></button>`)}</div>
      <div className="ck-cats">${catList.map(k=>html`<button key=${k} className=${'chip small'+(!cats||cats.includes(k)?' on':'')} onClick=${()=>toggleCat(k)} title=${`${counts[k].error||0} errors, ${counts[k].warn||0} warnings`}>${k} <b>${counts[k].n}</b></button>`)}</div>
      <div className="row"><input className="inp" type="search" placeholder="Search issues" aria-label="Search issues" value=${q} onInput=${e=>setQ(e.target.value)}/><label className="chk small"><input type="checkbox" checked=${showRev} onChange=${e=>setShowRev(e.target.checked)}/> Show reviewed</label></div>
      <div className="ck-scroll">${!list.length?html`<p className="note">${issues.length?'Nothing matches these filters.':'No issues. The model passes every check that is turned on.'}</p>`:null}
        ${order.filter(k=>byLevel[k]).map(k=>html`<div key=${'l'+k}><h4 className="ck-lv">${k?(lvlOf(p,k)||{}).name:'Whole job'} <small>${byLevel[k].length}</small></h4>
          ${byLevel[k].map(i=>{const key=issueKey(i);return html`<button key=${key+i.id} className=${'issue sev-'+i.sev+(cur===key?' on':'')+(reviewed[key]?' rev':'')} onClick=${()=>pick(i)}>
            <span className=${'ck-dot '+i.sev}></span><span className="ck-t">${i.title}<small>${[i.rule&&i.rule.code?(i.rule.set+' '+i.rule.code):issueCat(i),issueWhere(p,i)].filter(Boolean).join(' · ')}</small></span></button>`;})}</div>`)}</div>
    </aside>
    <section className="ck-plan">${planFor({issues:list,onIssue:pick,active:true,optbar:null})}</section>
    <aside className="ck-detail" aria-label="Issue detail">${sel?html`<div>
      <p className=${'pill sev-'+sel.sev}>${sel.sev==='error'?'Error':sel.sev==='warn'?'Warning':'Tip'} · ${issueCat(sel)}</p>
      <h3>${sel.title}</h3>${sel.rule?html`<p className="mono small">${sel.rule.set} ${sel.rule.code||''}${sel.rule.title?' · '+sel.rule.title:''}</p>`:null}
      <p>${sel.detail}</p><p className="note">${issueWhere(p,sel)}</p>
      <div className="row"><button className="btn primary" onClick=${()=>{if(sel.level)setLevelId(sel.level);setMode('design');if(sel.target)setTimeout(()=>setSel(sel.target),50);}}>Show it in Design</button>
        ${sel.target?html`<button className="btn" onClick=${()=>setSel(sel.target)}>Select it</button>`:null}</div>
      <label className="chk"><input type="checkbox" checked=${!!reviewed[issueKey(sel)]} onChange=${e=>markReviewed(sel,e.target.checked)}/> Reviewed, leave as is${reviewed[issueKey(sel)]?' ('+reviewed[issueKey(sel)]+')':''}</label>
      <p className="note">Reviewed issues hide from this list and the plan until something about them changes. They still print in the permit checklist.</p></div>`
      :html`<div><h3>Checks</h3><p className="note">Pick an issue on the left or a marker on the plan. Red badges are errors; small dots are warnings and tips.</p>
        <table className="mat"><thead><tr><th>Check</th><th className="num">Errors</th><th className="num">Warnings</th><th className="num">Tips</th></tr></thead><tbody>${catList.map(k=>html`<tr key=${k}><td>${k}</td><td className="num">${counts[k].error||''}</td><td className="num">${counts[k].warn||''}</td><td className="num">${counts[k].tip||''}</td></tr>`)}</tbody></table>
        <div className="row"><button className="btn" onClick=${()=>setDlg('wallframe')}>Wall framing and cut list…</button><button className="btn" onClick=${()=>setDlg('joists')}>Floor and ceiling joists…</button></div></div>`}</aside>
  </div>`;}

/* ---------- Build page ---------- */
const BUILD_TABS=[];// [id,label,Component]
BUILD_TABS.push(['schedule','Job schedule',({p,commit})=>html`<${ScheduleView} p=${p} commit=${commit}/>`]);
BUILD_TABS.push(['field','Field notes and punch list',({p,commit,setSel,setMode})=>html`<${FieldView} p=${p} commit=${commit} setSel=${setSel} setMode=${setMode}/>`]);
function BuildView(props){const [tab,setTabS]=useState(()=>{try{return localStorage.getItem('remodel-studio:buildtab')||'schedule';}catch(e){return 'schedule';}});
  const pick=t=>{setTabS(t);try{localStorage.setItem('remodel-studio:buildtab',t);}catch(e){}};const T=BUILD_TABS.find(t=>t[0]===tab)||BUILD_TABS[0];
  return html`<div className="matview"><div className="matinner"><div className="seg mattabs" role="tablist">${BUILD_TABS.map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${T[0]===k} className=${T[0]===k?'on':''} onClick=${()=>pick(k)}>${l}</button>`)}</div>
    <${T[2]} ...${props}/></div></div>`;}

/* ---------- project browser (Revit's Project Browser, Archicad's Navigator) ---------- */
function PBNode({open,tog,k,label,n,children}){return html`<div className="pb-node"><button className="pb-h" aria-expanded=${!!open[k]} onClick=${()=>tog(k)}><span className="pb-car">${open[k]?'▾':'▸'}</span>${label}${n!=null?html`<small>${n}</small>`:null}</button>${open[k]?html`<div className="pb-kids">${children}</div>`:null}</div>`;}
function PBLeaf({label,on,run,title,extra}){return html`<div className="pb-leafrow"><button className=${'pb-leaf'+(on?' on':'')} onClick=${run} title=${title||label}>${label}</button>${extra||null}</div>`;}
function ProjectBrowser({B}){const {p,lv}=B;const [open0,setOpen]=useState(()=>{try{return JSON.parse(localStorage.getItem('remodel-studio:pb-open')||'null')||{levels:true,elev:false,ext:false,v3:true,sets:true,sheets:false,sched:false,opts:true};}catch(e){return {levels:true,v3:true,sets:true,opts:true};}});
  const open=B.naming?{...open0,sets:true}:open0;const tog=k=>{const o={...open0,[k]:!open0[k]};setOpen(o);try{localStorage.setItem('remodel-studio:pb-open',JSON.stringify(o));}catch(e){}};
  const walls=useMemo(()=>roomWalls(p),[p.rooms]);const byRoom={};for(const W of walls)(byRoom[W.room.id]=byRoom[W.room.id]||{room:W.room,ws:[]}).ws.push(W);
  const sig=JSON.stringify([p.levels.map(l=>l.id),(p.roofs||[]).length,p.rooms.length,(p.fixtures||[]).length>0,(p.stairs||[]).length,ensureOptions(p).options.length]);
  const sheets=useMemo(()=>{if(!open.sheets)return [];try{return buildSheets(p).map(s=>[s.no,s.title]);}catch(e){return [];}},[open.sheets,sig]);
  const sets=(p.settings&&p.settings.viewSets)||[];const v3=p.views||[];const opts=ensureOptions(p);
  return html`<div className="pb" role="tree" aria-label="Project browser">
    <${PBNode} open=${open} tog=${tog} k="levels" label="Levels and plans" n=${p.levels.length}>${sortedLevels(p).map(l=>html`<div key=${l.id} className="pb-lv"><${PBLeaf} label=${l.name} on=${l.id===lv.id} run=${()=>B.setLevelId(l.id)}/>
      ${l.id===lv.id?html`<div className="pb-kids">${[['plan','all','Floor plan'],['rcp',null,'Reflected ceiling plan'],['plan','elec','Electrical plan'],['plan','plumb','Plumbing plan'],['plan','cab','Cabinet plan (NKBA)'],['plan','ffr','Floor framing'],['plan','rfr','Roof framing']].map(([v,t,lab])=>html`<${PBLeaf} key=${lab} label=${lab} on=${B.activeView===v&&(t==null||B.tab===t)} run=${()=>{B.openView(v);if(t)B.setTab(t);}}/>`)}</div>`:null}</div>`)}<//>
    <${PBNode} open=${open} tog=${tog} k="elev" label="Interior elevations" n=${walls.length}>${Object.values(byRoom).map(({room,ws})=>html`<details key=${room.id} className="pb-room"><summary>${room.name}</summary>${ws.map(W=>html`<${PBLeaf} key=${W.key} label=${DZ_DIRS(W.facing)+' wall · '+fmtLen(W.L)} on=${B.activeView==='elev:'+W.key} run=${()=>B.openView('elev:'+W.key)}/>`)}</details>`)}${!walls.length?html`<p className="note">Draw a room to get elevations.</p>`:null}<//>
    <${PBNode} open=${open} tog=${tog} k="ext" label="Exterior elevations" n=${Object.keys(ELEV_VIEWS).length}>${Object.keys(ELEV_VIEWS).map(k=>html`<${PBLeaf} key=${k} label=${ELEV_VIEWS[k].title} on=${B.activeView==='ext:'+k} run=${()=>B.openView('ext:'+k)}/>`)}<//>
    <${PBNode} open=${open} tog=${tog} k="v3" label="3D views" n=${v3.length+1}><${PBLeaf} label="3D model" on=${B.activeView==='3d'} run=${()=>B.openView('3d')}/>${v3.map(v=>html`<${PBLeaf} key=${v.id} label=${v.name} run=${()=>{B.openView('3d');setTimeout(()=>window.dispatchEvent(new CustomEvent('rs-goview',{detail:v.id})),250);}}/>`)}<//>
    <${PBNode} open=${open} tog=${tog} k="sets" label="Saved view setups" n=${sets.length}>${sets.map(s=>html`<${PBLeaf} key=${s.id} label=${s.name} run=${()=>B.applySet(s)} extra=${html`<button className="pb-x" aria-label=${'Delete '+s.name} title="Delete" onClick=${()=>B.commit({...p,settings:{...p.settings,viewSets:sets.filter(x=>x.id!==s.id)}})}>×</button>`}/>`)}
      ${B.naming?html`<form className="pb-name" onSubmit=${e=>{e.preventDefault();B.saveSet(e.target.elements.vsname.value.trim());}}><input name="vsname" className="inp" aria-label="Name for this view setup" defaultValue=${B.defName} autoFocus/><button className="btn small primary" type="submit">Save</button><button className="btn small" type="button" onClick=${()=>B.setNaming(false)}>Cancel</button></form>`
        :html`<button className="btn small" onClick=${()=>B.setNaming(true)}>Save the current views…</button>`}<//>
    <${PBNode} open=${open} tog=${tog} k="sheets" label="Sheets" n=${open.sheets?sheets.length:null}>${sheets.map(([no,t])=>html`<${PBLeaf} key=${no} label=${no+' '+t} run=${()=>{window.__rsSheetNo=no;B.setMode('sheets');setTimeout(()=>window.dispatchEvent(new CustomEvent('rs-sheet',{detail:no})),60);}}/>`)}<//>
    <${PBNode} open=${open} tog=${tog} k="sched" label="Schedules" n=${SCHED_TYPES.length}>${SCHED_TYPES.map(([k,l])=>html`<${PBLeaf} key=${k} label=${l} run=${()=>{window.__rsSched=k;B.setMode('schedules');setTimeout(()=>window.dispatchEvent(new CustomEvent('rs-sched',{detail:k})),60);}}/>`)}<//>
    <${PBNode} open=${open} tog=${tog} k="opts" label="Design options" n=${opts.options.length}>${opts.options.map(o=>html`<${PBLeaf} key=${o.id} label=${o.name} on=${o.id===opts.activeOption} run=${()=>B.commit(switchOption(p,o.id))}/>`)}<//>
  </div>`;}

/* ---------- issues panel docked under the views ---------- */
function IssuesDock({p,issues,goTo,onClose}){const [f,setF]=useState('error');const list=issues.filter(i=>f==='all'||i.sev===f);
  return html`<section className="dz-issues" aria-label="Issues"><header><b>Issues</b><div className="seg">${[['error','Errors'],['warn','Warnings'],['tip','Tips'],['all','All']].map(([k,l])=>html`<button key=${k} className=${f===k?'on':''} onClick=${()=>setF(k)}>${l} ${k==='all'?issues.length:issues.filter(i=>i.sev===k).length}</button>`)}</div><span className="grow"></span>
      <button className="btn small" onClick=${()=>window.__app&&window.__app.setMode('check')}>Open the Check page</button><button className="dz-mini" onClick=${onClose} aria-label="Close issues">×</button></header>
    <div className="dz-iss-list">${list.slice(0,200).map(i=>html`<button key=${i.id} className=${'issue sev-'+i.sev} onClick=${()=>goTo(i)}><span className=${'ck-dot '+i.sev}></span><span>${i.title}</span><small>${[i.rule&&i.rule.code?i.rule.set+' '+i.rule.code:issueCat(i),issueWhere(p,i)].filter(Boolean).join(' · ')}</small></button>`)}${!list.length?html`<p className="note">None.</p>`:null}</div></section>`;}

/* ---------- ribbon (labeled tool groups by discipline, like Revit's ribbon tabs) ---------- */
const RB_IC={wiz:DZI('M4 20L15 9M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 11l.6 1.4L21 13l-1.4.6L19 15l-.6-1.4L17 13l1.4-.6z'),joist:DZI('M3 6h18M3 18h18M6 6v12M10 6v12M14 6v12M18 6v12'),stud:DZI('M4 4h16M4 20h16M7 4v16M12 4v16M17 4v16'),
  wallrm:DZI('M4 4h6v16H4zM14 4h6v16h-6M10 12h4'),style:DZI('M5 3h14v18H5zM8 6h8v5H8zM8 14h8v4H8z'),slab:DZI('M3 6h18v12H3zM9 6v12M15 6l-3 12'),fill:DZI('M3 8h18v10H3zM9 8v10M15 8v10M3 5h6'),ucl:DZI('M3 6h18v5H3zM6 14l-1 3M12 14v3M18 14l1 3'),
  tmpl:DZI('M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z'),bolt:DZI('M13 2L4 14h7l-1 8 9-12h-7z'),link:DZI('M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1'),calc:DZI('M5 3h14v18H5zM8 7h8M8 11h2M12 11h2M16 11v6M8 15h2M12 15h2'),
  video:DZI('M3 6h12v12H3zM15 10l6-3v10l-6-3'),exp:DZI('M12 3v12M7 10l5 5 5-5M4 19h16'),photo:DZI('M3 7h4l2-3h6l2 3h4v13H3zM12 17a4 4 0 1 0 0-.1'),save:DZI('M5 3h11l3 3v15H5zM8 3v6h8V3M8 21v-7h8v7'),
  issues:DZI('M12 3l9 16H3zM12 10v4M12 17v.1'),browser:DZI('M4 4h16v16H4zM4 9h16M9 9v11'),frame3:DZI('M4 20V9l8-5 8 5v11M8 20v-8M12 20V8M16 20v-8'),keynote:DZI('M12 3a7 7 0 1 0 0 14 7 7 0 1 0 0-14M9 10h6M12 7v6M12 17v4'),
  colorby:DZI('M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8zM7 12v.1M9 8v.1M14 7v.1M17 10v.1'),ifc:DZI('M4 4h16v16H4zM8 9h1M8 9v6M12 9v6M12 9h3M12 12h2M18 9h-2v6h2'),scan:DZI('M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M7 12h10')};
function ribbonSpec(R){const {D,p,lv,sel,selF,say,commit}=R;const T=id=>toolInfo(id)?{t:'tool',id}:null;const tg=(g,f=()=>true)=>((TOOL_GROUPS.find(x=>x.id===g)||{tools:[]}).tools).filter(id=>toolInfo(id)&&f(id)).map(T);
  const A=(label,icon,run,o={})=>({t:'act',label,icon,run,...o});
  const room=()=>(sel&&sel.kind==='room'&&p.rooms.find(r=>r.id===sel.id))||(selF&&p.rooms.find(r=>r.level===selF.level&&inPoly(selF.x,selF.y,r.pts)))||null;
  const tmplItems=LAYOUTS.map(([k,l])=>({label:l,run:()=>{const rm=room()||p.rooms.find(r=>r.level===lv.id&&(k==='bath5'?r.use==='bath':r.use==='kitchen'));if(!rm){say('Select a room first.',false);return;}const r=layoutTemplate(p,rm,k);if(r.n)commit(r.p);say(r.msg,!!r.n);}}));
  return [
    ['home','Home',[['Select',[T('select')]],['Clipboard',[A('Copy',DZ_IC.copy,D.doCopy,{disabled:!sel}),A('Paste',DZ_IC.paste,D.doPaste),A('Duplicate',DZ_IC.dup,D.doDup,{disabled:!sel}),A('Rotate',DZ_IC.rot,D.doRotate,{disabled:!sel}),A('Delete',DZ_IC.del,D.onDelete,{disabled:!sel})]],
      ['Views',[A('Fit',DZ_IC.fit,()=>{D.fitPlan();D.fit3();}),...[['1','l1','One'],['2v','l2','Two'],['2h','l2h','Stacked'],['3','l3','Three'],['4','l4','Four']].map(([k,ic,t])=>A(t,DZ_IC[ic],()=>{R.setLayout(k);R.setMaxed(null);},{on:R.layout===k&&R.maxed==null,title:t+' view'+(k==='1'?'':'s')}))]],
      ['Panels',[A('Browser',RB_IC.browser,()=>R.leftTab('browser'),{on:R.dock&&R.left==='browser'}),A('Catalog',DZ_IC.lib,()=>R.leftTab('catalog'),{on:R.dock&&R.left==='catalog'}),A('Properties',DZ_IC.insp,()=>R.setInsp(!R.insp),{on:R.insp}),A('Issues',RB_IC.issues,()=>R.setIssuesOpen(!R.issuesOpen),{on:R.issuesOpen})]]]],
    ['arch','Architecture',[['Walls',tg('walls')],['Doors and windows',tg('openings')],['Rooms',tg('rooms')],['Stairs',tg('stairs')],['Roof',[...tg('roof'),A('Roof wizard',RB_IC.wiz,()=>D.setDlg('roofwiz'))]],['Exterior',tg('exterior')]]],
    ['int','Interiors',[['Place',[...tg('interior'),A('Catalog',DZ_IC.lib,()=>R.leftTab('catalog'))]],['Kitchen and bath',[{t:'menu',label:'Layout templates',icon:RB_IC.tmpl,items:tmplItems},A('Fill run',RB_IC.fill,()=>{if(!(selF&&isCab(selF))){say('Select a cabinet in the run first.',false);return;}const r=fillRun(p,selF);if(r.n)commit(r.p);say(r.msg,!!r.n);},{title:'Fill the selected cabinet run with cabinets and fillers'}),
        A('Door style and finish',RB_IC.style,()=>D.setDlg('styleswap')),A('Countertop slabs',RB_IC.slab,()=>D.setDlg('slab')),A('Under-cabinet lights',RB_IC.ucl,()=>{const r=underCabLights(p,lv.id);if(r.n){commit(r.p);say(`Added ${r.n} under-cabinet light${r.n===1?'':'s'}.`);}else say('Every wall cabinet on this level already has an under-cabinet light, or there are no wall cabinets.',false);})]]]],
    ['struct','Structure',[['Framing',[A('Roof wizard',RB_IC.wiz,()=>D.setDlg('roofwiz')),A('Floor and ceiling joists',RB_IC.joist,()=>D.setDlg('joists')),A('Wall framing',RB_IC.stud,()=>D.setDlg('wallframe')),A('Remove or open a wall',RB_IC.wallrm,()=>D.setDlg('wallrm'),{disabled:!(sel&&sel.kind==='wall'),title:'Select a wall first'})]],
      ['Show',[A('Floor framing plan',RB_IC.joist,()=>R.setTab('ffr'),{on:R.tab==='ffr'}),A('Roof framing plan',RB_IC.frame3,()=>R.setTab('rfr'),{on:R.tab==='rfr'}),A('Structure check in 3D',DZ_IC.check,()=>D.setStructView(!D.structView),{on:D.structView})]],['Posts',[T('column')].filter(Boolean)]]],
    ['sys','Systems',[['Electrical',[T('elec'),A('Auto-place this floor',RB_IC.bolt,()=>{const q=autoElectrical(p,lv.id);commit(q);const n=(q.elec||[]).filter(d=>d.auto&&d.level===lv.id).length;say(`Placed ${n} devices on ${lv.name}. Manual devices were kept.`);}),A('Link switches',RB_IC.link,()=>{const r=autoLinkSwitches(p,lv.id);commit(r.p);say(r.n?`Linked ${r.n} light${r.n===1?'':'s'} to switches.`:'Every light already has a switch.');})]],
      ['Plumbing and HVAC',tg('mep',id=>id!=='elec')],['Calculations',[A('Systems page',RB_IC.calc,()=>D.setMode('systems'),{title:'Loads, panel, plumbing riser, duct sizing, lighting schedule'})]]]],
    ['site','Site',[['Site and landscape',tg('site')]]],
    ['anno','Annotate',[['Dimensions',['dim','autodim','dimang','dimrad'].map(T)],['Text and tags',['note','keynote','tagall'].map(T)],['Markup',['revcloud','section','fieldpin','wallphoto'].map(T)],['Measure',tg('measure')]]],
    ['draw','Draw',[['Lines and shapes',['line','pline','rect','circle','arc','spline','ellipse','polygon','xline','hatch','shape','block'].map(T)]]],
    ['modify','Modify',[['Modify',tg('edit')]]],
    ['view','View',[['Render',[A('Render',DZ_IC.render,D.openRender),A('360° panorama',DZ_IC.pano,()=>D.setDlg('pano')),A('Video',RB_IC.video,()=>D.setDlg('video')),A('Photo match',RB_IC.photo,()=>D.setDlg('photomatch'),{title:'Line the 3D camera up with a real photo of the room'})]],
      ['Color by',[{t:'colorby'}]],['Export',[A('Export 3D',RB_IC.exp,D.openExport),A('IFC for Revit or Archicad',RB_IC.ifc,()=>D.setDlg('ifc')),A('Print plans',DZ_IC.print,()=>D.setMode('sheets'))]],['Saved views',[A('Save view setup',RB_IC.save,R.saveSet)]]]],
  ].map(([k,l,groups])=>[k,l,groups.map(([gl,items])=>[gl,items.filter(Boolean)]).filter(g=>g[1].length)]);}
function Ribbon({R}){const tabs=ribbonSpec(R);const [tab,setTabS]=useState(()=>{try{return localStorage.getItem('remodel-studio:rb-tab')||'home';}catch(e){return 'home';}});const T=tabs.find(t=>t[0]===tab)||tabs[0];
  const [compact,setCompactS]=useState(()=>{try{return localStorage.getItem('remodel-studio:rb-compact')==='1';}catch(e){return false;}});
  const [pinned,setPinnedS]=useState(()=>{try{return localStorage.getItem('remodel-studio:rb-pinned')==='1';}catch(e){return false;}});const setPinned=v=>{setPinnedS(v);try{localStorage.setItem('remodel-studio:rb-pinned',v?'1':'0');}catch(e){}};
  const [open,setOpen]=useState(false);const rbRef=useRef(null);
  useEffect(()=>{if(!open||pinned)return;const close=e=>{if(rbRef.current&&!rbRef.current.contains(e.target))setOpen(false);};const kd=e=>{if(e.key==='Escape')setOpen(false);};document.addEventListener('pointerdown',close);window.addEventListener('keydown',kd);return ()=>{document.removeEventListener('pointerdown',close);window.removeEventListener('keydown',kd);};},[open,pinned]);
  const setTab=k=>{setTabS(k);try{localStorage.setItem('remodel-studio:rb-tab',k);}catch(e){}};const setCompact=v=>{setCompactS(v);try{localStorage.setItem('remodel-studio:rb-compact',v?'1':'0');}catch(e){}};
  // jump to the tab that holds the current tool
  useEffect(()=>{if(!R.tool||R.tool==='select')return;const has=t=>t[2].some(g=>g[1].some(it=>it.t==='tool'&&it.id===R.tool));if(!has(T)){const t=tabs.find(has);if(t)setTab(t[0]);}},[R.tool]);
  const done=()=>{if(!pinned)setOpen(false);};
  const btn=(it,i)=>{if(it.t==='tool'){const ti=toolInfo(it.id);return html`<button key=${it.id} className=${'rb-btn dz-tool'+(R.tool===it.id?' on':'')} aria-pressed=${R.tool===it.id} onClick=${()=>{R.pickTool(it.id);done();}} title=${ti.label+(ti.key?' ('+ti.key+')':'')}>${ti.icon}<span>${ti.short||ti.label}</span></button>`;}
    if(it.t==='menu')return html`<div key=${'m'+i} className="rb-menu"><${MenuButton} id=${'rb-'+it.label.replace(/\W+/g,'-').toLowerCase()} label=${html`<span className="rb-mi">${it.icon}<span>${it.label}</span></span>`} items=${it.items}/></div>`;
    if(it.t==='colorby')return html`<div key="cb" className="rb-colorby"><label htmlFor="rb-cb">Color the views by</label><select id="rb-cb" className="inp" value=${R.colorBy||''} onChange=${e=>R.setColorBy(e.target.value||null)}><option value="">Normal colors</option>${COLOR_BY.map(c=>html`<option key=${c.id} value=${c.id}>${c.label}</option>`)}</select></div>`;
    return html`<button key=${it.label} className=${'rb-btn'+(it.on?' on':'')} aria-pressed=${it.on!=null?!!it.on:undefined} disabled=${it.disabled} onClick=${()=>{it.run();if(it.on==null)done();}} title=${it.title||it.label}>${it.icon}<span>${it.label}</span></button>`;};
  const showBody=pinned||open;
  return html`<div ref=${rbRef} className=${'ribbon'+(compact?' compact':'')+(pinned?' pinned':' collapsed')+(showBody?' open':'')}>
    <div className="rb-tabs" role="tablist" aria-label="Tool groups">${tabs.map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${T[0]===k} className=${T[0]===k&&showBody?'on':''} onClick=${()=>{if(!pinned&&open&&T[0]===k){setOpen(false);return;}setTab(k);setOpen(true);}}>${l}</button>`)}<span className="grow"></span>
      ${showBody?html`<button className="rb-compact" onClick=${()=>setCompact(!compact)} title=${compact?'Show button labels':'Icons only'}>${compact?'Show labels':'Icons only'}</button>`:null}
      <button className="rb-compact" onClick=${()=>{setPinned(!pinned);setOpen(false);}} title=${pinned?'Collapse the toolbar to its tabs (more room to draw)':'Keep the toolbar open'}>${pinned?'Collapse':'Pin open'}</button></div>
    ${showBody?html`<div className="rb-body" role="toolbar" aria-label=${T[1]+' tools'}>${T[2].map(([gl,items])=>html`<div key=${gl} className="rb-group"><div className="rb-items">${items.map(btn)}</div><div className="rb-gl">${gl}</div></div>`)}</div>`:null}</div>`;}
