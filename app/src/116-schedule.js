/* ======================= job schedule (Gantt) and payment schedule ======================= */
// Phases are built from the estimate's labor hours by trade. Each phase starts when the ones it depends on finish.
const PHASES=[
  {id:'permit',label:'Permit and ordering',fixed:10,deps:[]},
  {id:'demo',label:'Demolition',trades:['demo'],deps:['permit']},
  {id:'found',label:'Foundation and masonry',trades:['masonry'],deps:['demo'],insp:'Footing and foundation inspection'},
  {id:'framing',label:'Framing',trades:['framing'],deps:['found']},
  {id:'roof',label:'Roofing',trades:['roofing'],deps:['framing']},
  {id:'windows',label:'Windows and exterior doors',trades:['doors'],share:0.6,deps:['framing']},
  {id:'rough',label:'Plumbing, electrical and HVAC rough-in',trades:['plumbing','electrical'],share:0.7,parallel:true,deps:['roof','windows']},
  {id:'insp1',label:'Framing and rough-in inspections',fixed:2,milestone:true,deps:['rough']},
  {id:'siding',label:'Siding and exterior trim',trades:['siding'],deps:['windows']},
  {id:'insul',label:'Insulation',trades:['insulation'],deps:['insp1'],insp:'Insulation inspection'},
  {id:'drywall',label:'Drywall hang and finish',trades:['drywall','ceilings'],deps:['insul']},
  {id:'paint1',label:'Prime and first coat',trades:['paint'],share:0.5,deps:['drywall']},
  {id:'cab',label:'Cabinets and countertops',trades:['cabinets'],deps:['paint1']},
  {id:'tile',label:'Tile',trades:['tile'],deps:['paint1']},
  {id:'floor',label:'Flooring',trades:['flooring'],deps:['tile']},
  {id:'trim',label:'Interior doors and trim',trades:['finish','doors'],shareOf:{doors:0.4},deps:['floor','cab']},
  {id:'finishmep',label:'Plumbing and electrical trim-out',trades:['plumbing','electrical'],share:0.3,parallel:true,deps:['cab','tile']},
  {id:'paint2',label:'Final paint and touch-up',trades:['paint'],share:0.5,deps:['trim','finishmep']},
  {id:'general',label:'Cleanup and general labor',trades:['general'],deps:['paint2']},
  {id:'final',label:'Final inspection and punch list',fixed:3,milestone:true,deps:['general']}];
function schedOf(p){return {start:new Date().toISOString().slice(0,10),crew:2,crews:{},days:{},draws:null,...(p.settings?.sched||{})};}
const setSched=(p,patch)=>({...p,settings:{...p.settings,sched:{...schedOf(p),...patch}}});
// US holidays crews usually take off: New Year's, Memorial Day, July 4, Labor Day, Thanksgiving and the day after, Christmas Eve and Day
function isHoliday(x){const m=x.getMonth(),d=x.getDate(),w=x.getDay();const nth=(n)=>Math.ceil(d/7)===n;const last=d+7>new Date(x.getFullYear(),m+1,0).getDate();
  return (m===0&&d===1)||(m===6&&d===4)||(m===11&&(d===24||d===25))||(m===4&&w===1&&last)||(m===8&&w===1&&nth(1))||(m===10&&w===4&&nth(4))||(m===10&&w===5&&d>=23&&d<=29&&nth(4+(d<=28?0:1))&&new Date(x.getFullYear(),10,d-1).getDay()===4);}
const isWork=x=>{const w=x.getDay();return w!==0&&w!==6&&!isHoliday(x);};
function addWorkdays(d,n){const x=new Date(d);let k=0;while(k<n){x.setDate(x.getDate()+1);if(isWork(x))k++;}return x;}
function nextWorkday(d){const x=new Date(d);while(!isWork(x))x.setDate(x.getDate()+1);return x;}
function jobSchedule(p){const S=schedOf(p);const est=estimateOf(p);const hrs={};for(const l of est.labor)hrs[l.t]=l.h;const out=[];const byId={};
  const start=nextWorkday(new Date(S.start+'T08:00:00'));
  for(const ph of PHASES){let h=0;if(ph.trades)for(const t of ph.trades){const f=ph.shareOf&&ph.shareOf[t]!=null?ph.shareOf[t]:ph.share??1;h+=(hrs[t]||0)*f;}
    const crew=S.crews[ph.id]||S.crew;let days=ph.fixed!=null?ph.fixed:Math.ceil(h/(ph.parallel?Math.max(1,ph.trades.length):1)/(crew*8));if(S.days[ph.id]!=null)days=S.days[ph.id];
    const depEnd=ph.deps.map(d=>byId[d]).filter(Boolean).map(d=>d.skip?d.depEnd:d.e).filter(Boolean);
    const ds=depEnd.length?new Date(Math.max(...depEnd.map(d=>d.getTime()))):null;
    if(ph.fixed==null&&h<=0&&S.days[ph.id]==null){byId[ph.id]={...ph,skip:true,s:null,e:null,depEnd:ds};continue;}
    const sd=ds?nextWorkday(new Date(ds.getTime()+864e5)):start;
    const e=days>0?addWorkdays(sd,days-1):sd;const r={...ph,h:Math.round(h),days,crew,s:sd,e,depEnd:ds};byId[ph.id]=r;out.push(r);}
  const end=out.length?new Date(Math.max(...out.map(r=>r.e.getTime()))):start;const wd=(a,b)=>{let n=0;const x=new Date(a);while(x<=b){if(isWork(x))n++;x.setDate(x.getDate()+1);}return n;};
  return {S,rows:out,start,end,workdays:wd(start,end),est};}
const DEFAULT_DRAWS=[['Deposit at signing',10,'permit'],['Framing complete',25,'framing'],['Dried in, rough-ins passed',20,'insp1'],['Drywall finished',20,'drywall'],['Cabinets and trim set',15,'trim'],['Final inspection and punch list',10,'final']];
function drawSchedule(p,J){const S=J.S;const list=(S.draws||DEFAULT_DRAWS.map(([label,pct,after])=>({label,pct,after})));const total=J.est.total;const byId=Object.fromEntries(J.rows.map(r=>[r.id,r]));
  return list.map(d=>{const r=byId[d.after];return {...d,amt:total*d.pct/100,date:r?r.e:J.end};});}
const fmtD=d=>d?d.toLocaleDateString('en-US',{month:'short',day:'numeric'}):'';
function GanttSVG({J}){const rows=J.rows;if(!rows.length)return null;const day=864e5;const t0=J.start.getTime(),t1=J.end.getTime()+day;const span=Math.max(7,(t1-t0)/day);
  const W=900,lab=230,rh=24,H=rows.length*rh+34;const X=t=>lab+(t-t0)/day/span*(W-lab-10);const weeks=[];for(let t=t0;t<=t1;t+=7*day)weeks.push(t);
  return html`<svg className="gantt" viewBox=${`0 0 ${W} ${H}`} role="img" aria-label="Job schedule chart">
    ${weeks.map((t,i)=>html`<g key=${'w'+i}><line x1=${X(t)} y1="20" x2=${X(t)} y2=${H} className="gw"/><text x=${X(t)+3} y="13" className="gt">${fmtD(new Date(t))}</text></g>`)}
    ${rows.map((r,i)=>{const y=28+i*rh;const x0=X(r.s.getTime()),x1=X(r.e.getTime()+day);return html`<g key=${r.id}><text x="4" y=${y+12} className="gl">${r.label}</text>
      ${r.milestone?html`<path d=${`M${x1-6},${y+9}l6,-7l6,7l-6,7z`} className="gm"/>`:html`<rect x=${x0} y=${y+2} width=${Math.max(3,x1-x0-2)} height=${rh-8} rx="3" className=${'gb gb-'+(r.trades?r.trades[0]:'fixed')}/>`}
      <text x=${(r.milestone?x1+10:x1+2)} y=${y+12} className="gt">${r.days}d</text></g>`;})}</svg>`;}
function ScheduleView({p,commit}){const J=useMemo(()=>jobSchedule(p),[p]);const S=J.S;const draws=drawSchedule(p,J);const [msg,setMsg]=useState(null);
  const up=patch=>commit(setSched(p,patch));const setDraws=list=>up({draws:list});const curDraws=S.draws||DEFAULT_DRAWS.map(([label,pct,after])=>({label,pct,after}));
  const pctSum=curDraws.reduce((s,d)=>s+(+d.pct||0),0);
  const csv=async()=>{const L=[['Phase','Start','Finish','Workdays','Crew','Labor hours']];for(const r of J.rows)L.push([r.label,r.s.toISOString().slice(0,10),r.e.toISOString().slice(0,10),r.days,r.fixed!=null?'':r.crew,r.h||'']);
    L.push([]);L.push(['Payment','Percent','Amount','Due']);for(const d of draws)L.push([d.label,d.pct,Math.round(d.amt),d.date.toISOString().slice(0,10)]);
    setMsg(await saveFile(`${safeName(p.name)} schedule.csv`,L.map(r=>r.map(v=>/[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':v).join(',')).join('\n')));};
  return html`<div>
    <div className="mathead"><div><h2>Job schedule</h2><p className="note">Built from the estimate's labor hours: weekdays only, skipping the major holidays; phases start when the work before them is done. Change the crew size or type a number of days for any phase.</p></div>
      <div className="row"><label className="note" htmlFor="js-start">Start</label><input id="js-start" type="date" className="inp" value=${S.start} onChange=${e=>e.target.value&&up({start:e.target.value})}/>
        <label className="note" htmlFor="js-crew">Crew</label><input id="js-crew" className="inp mono" style=${{width:'4em'}} type="number" min="1" value=${S.crew} onChange=${e=>{const v=parseInt(e.target.value);if(v>0)up({crew:v});}}/>
        <button className="btn" onClick=${csv}>Download CSV</button><button className="btn primary" onClick=${async()=>{try{const d=await proposalPDF(p);setMsg(await saveFile(safeName(p.name)+' proposal.pdf',d.output('blob')));}catch(e){setMsg({ok:false,t:e.message});}}}>Proposal PDF</button></div></div>
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
    <div className="mattotal"><span>Start <b>${J.start.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</b></span><span>Finish <b>${J.end.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</b></span><span><b className="mono">${J.workdays}</b> workdays</span></div>
    <div className="tablewrap ganttwrap"><${GanttSVG} J=${J}/></div>
    <section className="sec"><h3>Phases</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Phase</th><th>Start</th><th>Finish</th><th className="num">Labor hours</th><th className="num">Crew</th><th className="num">Days</th></tr></thead><tbody>
      ${J.rows.map(r=>html`<tr key=${r.id}><td>${r.label}${r.insp?html`<div className="note">then ${r.insp.toLowerCase()}</div>`:null}</td><td>${fmtD(r.s)}</td><td>${fmtD(r.e)}</td><td className="num mono">${r.h||''}</td>
        <td className="num">${r.fixed!=null?'':html`<input className="inp mono priceinp" aria-label=${'Crew for '+r.label} value=${S.crews[r.id]??''} placeholder=${String(S.crew)} onChange=${e=>{const v=parseInt(e.target.value);const c={...S.crews};if(v>0)c[r.id]=v;else delete c[r.id];up({crews:c});}}/>`}</td>
        <td className="num"><input className="inp mono priceinp" aria-label=${'Days for '+r.label} value=${S.days[r.id]??''} placeholder=${String(r.days)} onChange=${e=>{const v=parseInt(e.target.value);const d={...S.days};if(v>=0&&e.target.value!=='')d[r.id]=v;else delete d[r.id];up({days:d});}}/></td></tr>`)}</tbody></table></div></section>
    <section className="sec"><h3>Payment schedule</h3><p className="note">Draws on the estimate total of ${money(J.est.total)}, due when the phase finishes.${Math.abs(pctSum-100)>0.01?html` <span className="pill warn">Adds up to ${pctSum}%</span>`:''}</p>
      <div className="tablewrap"><table className="mat"><thead><tr><th>Draw</th><th className="num">Percent</th><th className="num">Amount</th><th>Due after</th><th>Date</th><th></th></tr></thead><tbody>
      ${draws.map((d,i)=>html`<tr key=${i}><td><input className="inp" aria-label="Draw name" value=${d.label} onChange=${e=>setDraws(curDraws.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/></td>
        <td className="num"><input className="inp mono priceinp" aria-label="Percent" value=${d.pct} onChange=${e=>{const v=parseFloat(e.target.value);if(!isNaN(v))setDraws(curDraws.map((x,j)=>j===i?{...x,pct:v}:x));}}/></td><td className="num mono">${money(d.amt)}</td>
        <td><${Sel} id=${'dr-a'+i} value=${d.after} onChange=${v=>setDraws(curDraws.map((x,j)=>j===i?{...x,after:v}:x))} options=${PHASES.map(ph=>[ph.id,ph.label])}/></td><td>${fmtD(d.date)}</td>
        <td><button className="btn danger" aria-label="Remove draw" onClick=${()=>setDraws(curDraws.filter((x,j)=>j!==i))}>✕</button></td></tr>`)}</tbody></table></div>
      <div className="row"><button className="btn" onClick=${()=>setDraws([...curDraws,{label:'New draw',pct:0,after:'final'}])}>Add draw</button><button className="btn" onClick=${()=>up({draws:null})}>Reset to the standard draws</button></div></section></div>`;}
