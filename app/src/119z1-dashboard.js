/* ======================= job dashboard: the job at a glance, the first thing you see when a project opens ======================= */
const dashMoney=v=>'$'+Math.round(v||0).toLocaleString('en-US');
function dashData(p){const out={};try{const I=runChecks(p);out.err=I.filter(i=>i.sev==='error');out.warn=I.filter(i=>i.sev==='warn').length;}catch(e){out.err=[];out.warn=0;}
  try{out.est=estimateOf(p);}catch(e){out.est=null;}
  try{const J=jobSchedule(p);out.J=J;out.orders=orderDates(p,J).filter(o=>o.order).sort((a,b)=>a.order-b.order);}catch(e){out.J=null;out.orders=[];}
  try{const B=budgetBuckets(p);const spent=(p.receipts||[]).reduce((s,r)=>s+(+r.amount||0),0);out.budget={total:B.list.reduce((s,b)=>s+b.budget,0),spent,cont:B.E?B.E.cont:0};}catch(e){out.budget=null;}
  try{const T=trackRows(p);out.track={n:T.length,by:ORDER_ST.map(([k,l])=>[l,T.filter(r=>(r.t.status||'choosing')===k).length]),late:T.filter(r=>{const st=r.t.status||'choosing';if(['delivered','installed'].includes(st))return false;const eta=etaOf(r);return eta&&eta<localDate();})};}catch(e){out.track=null;}
  const pins=(p.fieldpins||[]);out.punch=pins.filter(o=>o.cat==='punch'&&o.status!=='done');out.questions=pins.filter(o=>o.cat==='question');
  out.co=((p.contract||{}).changeOrders||[]);out.photos=(p.wallphotos||[]).length;
  out.rooms=p.rooms.length;out.area=Math.round(p.rooms.reduce((s,r)=>s+polyArea(r.pts)/144,0));out.cabs=(p.fixtures||[]).filter(f=>isCab(f)&&f.status!=='demolish').length;
  out.phase=(()=>{if(!out.J)return null;const today=new Date();const cur=out.J.rows.find(r=>r.s<=today&&r.e>=today);const next=out.J.rows.find(r=>r.s>today);return {cur,next};})();
  return out;}
function DashCard({title,children,onOpen,openLabel='Open',cls=''}){return html`<section className=${'dash-card '+cls}><header><h3>${title}</h3>${onOpen?html`<button className="btn small" onClick=${onOpen}>${openLabel}</button>`:null}</header>${children}</section>`;}
function DashboardView({p,commit,setMode,setSel,setLevelId,setDlg,recent,openRecent}){const D=useMemo(()=>dashData(p),[p]);
  const goCost=tab=>{try{localStorage.setItem('remodel-studio:mattab',tab);}catch(e){}setMode('materials');};const goBuild=tab=>{try{localStorage.setItem('remodel-studio:buildtab',tab);}catch(e){}setMode('build');};
  const info=p.info||{};const sched=D.J;const fmt=d=>d?d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
  return html`<div className="matview dashview"><div className="matinner wide">
    <div className="dash-head"><div><h2>${p.name}</h2><p className="note">${[info.address,info.client?'for '+info.client:'',`${D.rooms} rooms · ${D.area.toLocaleString()} sq ft · ${D.cabs} cabinets`].filter(Boolean).join(' · ')}</p></div>
      <div className="row"><button className="btn primary" onClick=${()=>setMode('design')}>Open the design</button><button className="btn" onClick=${()=>setDlg('new')}>New or open a project…</button></div></div>
    <div className="dash-grid">
      <${DashCard} title="Checks" onOpen=${()=>setMode('check')} cls=${D.err.length?'bad':'ok'}><div className="dash-big">${D.err.length}<small>errors</small><span>${D.warn} warnings</span></div>
        <ul className="dash-list">${D.err.slice(0,4).map(i=>html`<li key=${i.id}><button className="linkbtn" onClick=${()=>{if(i.level)setLevelId(i.level);setMode('design');if(i.target)setTimeout(()=>setSel(i.target),60);}}>${i.title}</button></li>`)}${!D.err.length?html`<li className="note">No errors. ${D.warn?D.warn+' warnings to review.':'Nothing to review.'}</li>`:null}</ul><//>
      <${DashCard} title="Cost" onOpen=${()=>goCost('estimate')}>${D.est?html`<div className="dash-big">${dashMoney(D.est.total)}<small>estimate</small>${D.budget?html`<span>${dashMoney(D.budget.spent)} spent</span>`:null}</div>
        ${D.budget?html`<div className="dash-bar"><i style=${{width:Math.min(100,D.budget.total?D.budget.spent/D.budget.total*100:0)+'%'}}></i></div><p className="note">${dashMoney(D.budget.total)} budget before markup · ${dashMoney(D.budget.cont)} contingency${D.est.unpriced?` · ${D.est.unpriced} items not priced`:''}</p>`:null}
        ${D.co.length?html`<p className="note">${D.co.length} change order${D.co.length===1?'':'s'}, ${D.co.filter(c=>c.status==='pending').length} waiting for signature.</p>`:null}`:html`<p className="note">Draw walls to get an estimate.</p>`}<//>
      <${DashCard} title="Schedule" onOpen=${()=>goBuild('schedule')}>${sched?html`<div className="dash-big">${fmt(sched.end)}<small>finish</small><span>${sched.workdays} workdays from ${fmt(sched.start)}</span></div>
        ${D.phase&&D.phase.cur?html`<p><b>Now:</b> ${D.phase.cur.label} (through ${fmt(D.phase.cur.e)})</p>`:null}${D.phase&&D.phase.next?html`<p className="note"><b>Next:</b> ${D.phase.next.label}, ${fmt(D.phase.next.s)}</p>`:null}`:html`<p className="note">The schedule builds from the estimate's labor hours.</p>`}<//>
      <${DashCard} title="Orders" onOpen=${()=>goCost('selections')}>${D.track?html`<div className="dash-chips">${D.track.by.filter(([l,n])=>n).map(([l,n])=>html`<span key=${l} className="chip">${l} <b>${n}</b></span>`)}</div>
        ${D.track.late.length?html`<p className="note bad">${D.track.late.length} item${D.track.late.length===1?' is':'s are'} past the expected arrival date.</p>`:null}
        <h4>Order by</h4><ul className="dash-list">${D.orders.slice(0,4).map(o=>html`<li key=${o.id} className=${o.late?'bad':''}><b>${fmtD(o.order)}</b> ${o.label}<small>${o.what}</small></li>`)}${!D.orders.length?html`<li className="note">No long-lead items yet.</li>`:null}</ul>`:null}<//>
      <${DashCard} title="Field" onOpen=${()=>goBuild('field')}><div className="dash-big">${D.punch.length}<small>open punch items</small><span>${D.questions.length} questions · ${D.photos} wall photos</span></div>
        <ul className="dash-list">${D.punch.slice(0,4).map(o=>html`<li key=${o.id}><button className="linkbtn" onClick=${()=>{setLevelId(o.level);setMode('design');setTimeout(()=>setSel({kind:'fieldpin',id:o.id}),60);}}>${o.text||'Punch item'}</button>${o.due?html`<small>due ${o.due}</small>`:null}</li>`)}</ul><//>
      <${DashCard} title="Recent projects" onOpen=${()=>setDlg('open')} openLabel="Open…">${recent&&recent.length?html`<ul className="dash-list">${recent.slice(0,6).map(r=>html`<li key=${r.id||r.path}><button className="linkbtn" onClick=${()=>openRecent(r)}>${r.name}</button>${r.saved?html`<small>${new Date(r.saved).toLocaleDateString()}</small>`:null}</li>`)}</ul>`:html`<p className="note">Projects you save show here.</p>`}<//>
    </div>
    <p className="note dash-foot">Measure → Design → Check → Documents → Cost → Build. Press Ctrl+K anywhere to find a command or ask the project a question.</p>
  </div></div>`;}
WORKFLOWS.unshift({id:'home',label:'Home',pages:[['dashboard','Dashboard']],title:'The job at a glance'});
