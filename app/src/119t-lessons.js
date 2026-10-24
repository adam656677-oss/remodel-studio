/* ======================= lesson mode: guided exercises the app checks as you work ======================= */
// Each lesson starts a practice project and lists steps; a step turns green when the model meets it.
function practiceRoom(name,use,W,D,opts={}){const p=blankProject();p.name='Practice: '+name;const L=p.levels[0].id;p.settings.nkba={on:true,cooks:1};p.settings.ada=false;p.levels[0].framing={joist:'2x10',spacing:16,species:'syp2',dir:'auto',ceiling:'2x10',ceilingSpacing:16,foundation:'slab',girders:0};
  const Wl=(x1,y1,x2,y2,id)=>{p.walls.push({id,level:L,x1,y1,x2,y2,thick:WALL_PRESETS.ext4.thick,kind:'exterior',bearing:true,height:null,status:'existing'});};
  Wl(0,0,W,0,'n');Wl(W,0,W,D,'e');Wl(W,D,0,D,'s');Wl(0,D,0,0,'w');
  if(opts.window!==false)p.openings.push({id:'win1',wall:'n',type:'window',pos:opts.winPos??W/2,width:opts.winW||36,height:opts.winH||42,sill:opts.sill??42,operation:'double-hung',status:'existing'});
  p.openings.push({id:'door1',wall:opts.doorWall||'s',type:'door',pos:opts.doorPos??(W-24),width:36,height:80,sill:0,hinge:0,swing:1,status:'existing'});
  const t=WALL_PRESETS.ext4.thick/2;p.rooms.push({id:'room1',level:L,name,use,pts:[[t,t],[W-t,t],[W-t,D-t],[t,D-t]]});return p;}
const issuesOf=p=>{try{return runChecks(p);}catch(e){return [];}};
const hasCode=(p,re)=>issuesOf(p).some(i=>i.sev!=='tip'&&i.rule&&re.test(i.rule.code||''));
const fxOfType=(p,t)=>(p.fixtures||[]).filter(f=>(Array.isArray(t)?t.includes(f.type):f.type===t)&&f.status!=='demolish');
const nearWall=(p,f,id)=>{const w=p.walls.find(w=>w.id===id);if(!w)return false;const pr=projSeg({x:f.x,y:f.y},{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});return pr.d<(f.d||24)/2+w.thick/2+3;};
const alongWall=(p,f,id)=>{const w=p.walls.find(w=>w.id===id);const d=wdir(w);return (f.x-w.x1)*d.x+(f.y-w.y1)*d.y;};
const LESSONS=[
  {id:'k1',title:'Kitchen basics: a one-wall kitchen',level:'Beginner',minutes:15,intro:'A 14\' x 11\' kitchen with a window on the north wall. Build a working one-wall kitchen and clear the NKBA warnings.',
    setup:()=>practiceRoom('Kitchen','kitchen',168,132),
    steps:[{t:'Center a 36" sink base under the window.',h:'Catalog › Cabinets › Sink bases, or the KraftMaid catalog (SB36). Place it on the north wall; nudge it with Move until it lines up.',ok:p=>fxOfType(p,'sinkbase').some(f=>nearWall(p,f,'n')&&Math.abs(alongWall(p,f,'n')-84)<=3)},
      {t:'Put a dishwasher right beside the sink.',h:'NKBA K13: the dishwasher edge within 36" of the sink.',ok:p=>fxOfType(p,'dw').length>0&&!hasCode(p,/^K13$/)},
      {t:'Add a 30" range with landing area on both sides.',h:'NKBA K17: 12" on one side and 15" on the other. Keep it away from the window (K20).',ok:p=>fxOfType(p,'range').length>0&&!hasCode(p,/^K1[78]$|^K20$/)},
      {t:'Add a refrigerator with a 15" landing area.',h:'NKBA K16. Put it at the end of the run, door swinging away from the counter.',ok:p=>fxOfType(p,'fridge').length>0&&!hasCode(p,/^K16$/)},
      {t:'Fill the rest of the run with base cabinets and fillers.',h:'Select a base cabinet, then Design › Fill the cabinet run.',ok:p=>fxOfType(p,['base','filler']).filter(f=>nearWall(p,f,'n')).length>=2},
      {t:'Add wall cabinets and a hood over the range.',h:'Wall cabinets 30" or 36" high at 54" up; a 30" hood from Appliances › Cooking. NKBA K19.',ok:p=>fxOfType(p,'wallcab').length>=3&&!hasCode(p,/^K19$/)},
      {t:'Light the counters.',h:'Design › Under-cabinet lights for this level (NKBA K31).',ok:p=>!issuesOf(p).some(i=>/task lighting/i.test(i.title||''))&&(p.elec||[]).some(d=>d.type==='undercab')}]},
  {id:'k2',title:'Work triangle, aisles and an island',level:'Intermediate',minutes:20,intro:'A 15\' x 15\' kitchen. Lay out an L-shaped kitchen with an island and keep the aisles and work triangle inside the NKBA guidelines.',
    setup:()=>practiceRoom('Kitchen','kitchen',180,180,{doorWall:'e',doorPos:150}),
    steps:[{t:'Lay out an L-shaped kitchen with an island.',h:'Select the room, then Design › Layout: L-shaped kitchen with island.',ok:p=>fxOfType(p,'island').length>0&&fxOfType(p,'sinkbase').length>0},
      {t:'Keep the work aisles at least 42" wide.',h:'NKBA K6. Select the island and use Move or Coords to slide it.',ok:p=>fxOfType(p,'island').length>0&&!hasCode(p,/^K6$/)},
      {t:'Keep the work triangle legs between 4\' and 9\' and the total under 26\'.',h:'NKBA K3. Move the range or the refrigerator along the run.',ok:p=>fxOfType(p,'range').length>0&&!hasCode(p,/^K3$/)},
      {t:'Add seating at the island with 36" behind the stools.',h:'Select the island, turn on Seating in its cabinet panel (NKBA K8 and K9).',ok:p=>fxOfType(p,'island').some(f=>f.cab&&f.cab.seating)&&!hasCode(p,/^K[89]$/)},
      {t:'Give the cook a receptacle on every counter.',h:'Electrical › Auto-place, or place countertop GFCI receptacles (NKBA K30).',ok:p=>!hasCode(p,/^K30$/)&&(p.elec||[]).some(d=>d.type==='counter')}]},
  {id:'b1',title:'Bath planning: clearances that pass',level:'Beginner',minutes:15,intro:'An 8\' x 7\' hall bath. Place a tub, toilet and vanity with the clearances the code and NKBA call for.',
    setup:()=>practiceRoom('Bath','bath',96,84,{winPos:60,winW:24,winH:36,sill:54,doorWall:'s',doorPos:72,doorW:36}),
    steps:[{t:'Put a 60" tub across the west end.',h:'Catalog › Plumbing › Bathtub 60". Rotate it so it runs north–south against the west wall.',ok:p=>fxOfType(p,'tub').length>0},
      {t:'Place a toilet with 15" from its centerline to any wall or fixture.',h:'IRC R307.1 and NKBA: 15" minimum to each side, 21" clear in front (30" recommended).',ok:p=>fxOfType(p,'toilet').length>0&&!issuesOf(p).some(i=>/toilet|water closet/i.test(i.title||'')&&i.sev!=='tip')},
      {t:'Add a vanity at least 30" wide with 21" clear in front.',h:'Catalog › Cabinets › Bath vanities.',ok:p=>fxOfType(p,'vanity').some(f=>f.w>=30)&&!issuesOf(p).some(i=>/vanity|lavatory/i.test(i.title||'')&&i.sev==='error')},
      {t:'Clear every error in the code check.',h:'Open Check at the top right; click an issue to jump to it.',ok:p=>fxOfType(p,['tub','toilet','vanity']).length>=3&&!issuesOf(p).some(i=>i.sev==='error')}]},
  {id:'o1',title:'From design to order: styles, codes and change orders',level:'Advanced',minutes:20,intro:'Finish a kitchen the way you would for a client: pick the look, print the drawings and handle a change after signing.',
    setup:()=>{const p=practiceRoom('Kitchen','kitchen',168,132);const q=layoutTemplate(p,p.rooms[0],'L').p;return {...q,name:'Practice: Order and change orders'};},
    steps:[{t:'Change the whole job to a Shaker door in Painted white with brushed nickel bar pulls.',h:'Design › Change door style and finish.',ok:p=>{const c=p.settings.cab||{};return c.style==='shaker'&&c.finish==='white'&&(c.hw||'bar')==='bar'&&(c.hwFin||'nickel')==='nickel';}},
      {t:'Pick a cabinet maker for the order.',h:'Project panel › Cabinet maker. KraftMaid has the full Lowe\'s spec book.',ok:p=>!!(p.settings.cab||{}).vendor},
      {t:'Lock the contract.',h:'Materials › Estimate › Contract and change orders › Lock the contract.',ok:p=>!!p.contract},
      {t:'Make a change after signing: swap one base cabinet for a 3-drawer base.',h:'Select a base cabinet, Catalog › Cabinets › Base cabinets › Drawer base, then Swap selected.',ok:p=>!!p.contract&&(p.fixtures||[]).some(f=>/c-drawer-/.test(f.lib||''))},
      {t:'Write the change order.',h:'Materials › Estimate › Create change order. Print the PDF for signatures.',ok:p=>!!(p.contract&&p.contract.changeOrders&&p.contract.changeOrders.length)}]},
];
function lessonOf(p){const L=p.lesson&&LESSONS.find(x=>x.id===p.lesson.id);return L||null;}
function LessonPanel({p,commit,setDlg}){const L=lessonOf(p);const [open,setOpen]=useState(true);const [hint,setHint]=useState(null);const res=useMemo(()=>L?L.steps.map(s=>{try{return !!s.ok(p);}catch(e){return false;}}):[],[p,L&&L.id]);
  if(!L)return null;const done=res.filter(Boolean).length;const next=res.findIndex(x=>!x);
  return html`<aside className=${'lesson'+(open?'':' min')} aria-label="Lesson"><header><b>Lesson: ${L.title}</b><span className="grow"></span><span className="pill">${done} / ${L.steps.length}</span><button className="dz-mini" onClick=${()=>setOpen(!open)} aria-label=${open?'Collapse lesson':'Expand lesson'}>${open?'–':'+'}</button></header>
    ${open?html`<p className="note">${L.intro}</p><ol>${L.steps.map((s,i)=>html`<li key=${i} className=${res[i]?'ok':i===next?'cur':''}><span className="lk">${res[i]?'✓':i+1}</span><span>${s.t}${hint===i||i===next?html`<small>${s.h}</small>`:html` <button className="linkbtn" onClick=${()=>setHint(i)}>Hint</button>`}</span></li>`)}</ol>
      ${done===L.steps.length?html`<p className="lesson-done">Lesson complete. Nice work.</p>`:null}
      <div className="row"><button className="btn small" onClick=${()=>setDlg('lessons')}>All lessons</button><span className="spacer"></span><button className="btn small" onClick=${()=>commit({...p,lesson:null})}>Close lesson</button></div>`:null}</aside>`;}
APP_OVERLAYS.push(LessonPanel);
function LessonsModal({p,onClose}){const start=L=>{const q={...L.setup(),lesson:{id:L.id,started:new Date().toISOString().slice(0,10)}};q.id=uid('prj');window.__app.load(q);window.__app.setMode('design');onClose();window.__say&&window.__say(`Lesson started in a new practice project. Your own project is still in File › Open.`);};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide" role="dialog" aria-label="Lessons"><h2>Lessons</h2><p className="note">Each lesson opens a practice project and checks your work as you go. ${window.__app&&window.__app.dirty&&window.__app.dirty()?html`<b>Save your current project first</b> (File › Save); the lesson opens a new one.`:''}</p>
    <div className="lessons">${LESSONS.map(L=>html`<div key=${L.id} className="lesson-card"><h3>${L.title}</h3><p className="note">${L.level} · about ${L.minutes} minutes · ${L.steps.length} steps</p><p>${L.intro}</p><button className="btn primary" onClick=${()=>start(L)}>Start</button></div>`)}</div>
    <div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Close</button></div></div></div>`;}
EXTRA_DIALOGS.lessons=LessonsModal;
