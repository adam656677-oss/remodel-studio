/* ======================= long-lead items: order dates, and phases that wait on deliveries ======================= */
// workdays from order to delivery (typical; change them to your supplier's quotes)
function leadItems(p,S,rows){const lead=(S||schedOf(p)).leads||{};const fx=(p.fixtures||[]).filter(f=>f.status==='new'||!f.status);const ops=p.openings.filter(o=>o.status!=='existing'&&o.status!=='demolish');const out=[];
  const L=(id,label,phase,days,what)=>out.push({id,label,phase,days:lead[id]??days,def:days,what});
  const wins=ops.filter(o=>o.type==='window').length,extD=ops.filter(o=>o.type==='door'&&(o.ext||(p.walls.find(w=>w.id===o.wall)||{}).kind==='exterior')).length;
  if(wins||extD)L('windows','Windows and exterior doors','windows',25,`${wins} window${wins===1?'':'s'}${extD?`, ${extD} exterior door${extD===1?'':'s'}`:''}`);
  const cabs=fx.filter(f=>isCab(f));if(cabs.length){const line=cabStyle(p,cabs[0]).line;L('cabinets','Cabinets','cab',line==='stock'?10:line==='custom'?45:30,`${cabs.length} cabinets, ${(CAB_LINES.find(x=>x[0]===line)||['',''])[1].toLowerCase()}`);}
  const app=fx.filter(f=>['range','fridge','dw','washer','dryer'].includes(f.type)||/^a-/.test(f.lib||''));if(app.length)L('appliances','Appliances','finishmep',10,`${app.length} appliance${app.length===1?'':'s'}`);
  const plumb=fx.filter(f=>['toilet','lav','tub','shower','rollin'].includes(f.type));if(plumb.length)L('plumbing','Plumbing fixtures','finishmep',7,`${plumb.length} fixture${plumb.length===1?'':'s'}`);
  if(p.roofs.some(r=>rafterOf(r).system==='trusses'&&r.status!=='existing'))L('trusses','Roof trusses','framing',15,'engineered trusses');
  const tile=(rows||takeoff(p,{waste:0})).some(r=>/tile/i.test(r.item)&&r.unit==='SF');if(tile)L('tile','Tile','tile',5,'tile and setting materials');
  if(p.rooms.some(r=>/hardwood|engineered/.test(r.floor||'')))L('floor','Hardwood flooring (plus 3 days to acclimate)','floor',8,'wood flooring');
  return out;}
function orderDates(p,J){const S=J.S;return leadItems(p,S).map(L=>{const r=J.rows.find(x=>x.id===L.phase);const need=r?r.s:null;let order=null;if(need){order=new Date(need);let k=0;while(k<L.days){order.setDate(order.getDate()-1);if(isWork(order))k++;}}
  const late=order&&order<J.start;return {...L,need,order:late?J.start:order,late,holds:r&&r.wait&&r.wait.id===L.id};});}
function LeadsPanel({p,commit}){const J=useMemo(()=>jobSchedule(p),[p]);const S=J.S;const list=orderDates(p,J);const up=(id,v)=>{const l={...(S.leads||{})};if(v==null)delete l[id];else l[id]=v;commit(setSched(p,{leads:l}));};
  const insp=J.rows.filter(r=>r.milestone);
  return html`<section className="sec leads"><h3>Order dates for long-lead items</h3><p className="note">Lead times are typical workdays from order to delivery; type your supplier's numbers. Items are assumed ordered at signing, so a long lead can hold a phase back.</p>
    ${list.length?html`<div className="tablewrap"><table className="mat"><thead><tr><th>Item</th><th className="num">Lead (workdays)</th><th>Needed</th><th>Order by</th><th></th></tr></thead><tbody>
      ${list.map(L=>html`<tr key=${L.id} className=${L.late||L.holds?'warnrow':''}><td>${L.label}<div className="note">${L.what}</div></td><td className="num"><input className="inp mono priceinp" aria-label=${'Lead time for '+L.label} value=${(S.leads||{})[L.id]??''} placeholder=${String(L.def)} onChange=${e=>{const v=parseInt(e.target.value);up(L.id,v>=0&&e.target.value!==''?v:null);}}/></td>
        <td>${L.need?fmtD(L.need):''}</td><td>${L.order?fmtD(L.order):''}</td><td>${L.holds?html`<span className="pill warn">holds the schedule</span>`:L.late?html`<span className="pill warn">order at signing</span>`:null}</td></tr>`)}</tbody></table></div>`:html`<p className="note">No long-lead items in the model yet.</p>`}
    <h3>Inspections</h3><ul className="note insplist">${insp.map(r=>html`<li key=${r.id}><b>${fmtD(r.s)}</b> ${r.label}</li>`)}</ul></section>`;}
{const _SV=ScheduleView;ScheduleView=function(props){return html`<${_SV} ...${props}/><${LeadsPanel} ...${props}/>`;};}
