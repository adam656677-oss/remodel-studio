/* ======================= estimate: materials + labor + markups ======================= */
// Labor hours come from rule-of-thumb production rates applied to the takeoff. Rates and prices are starting
// points to be replaced with local numbers; the estimate is for planning, not a bid.
const TRADES=[['demo','Demolition and haul-off',35],['framing','Framing carpentry',55],['masonry','Masonry',60],['roofing','Roofing',55],['siding','Siding and exterior',50],
  ['doors','Doors and windows',55],['insulation','Insulation',40],['drywall','Drywall hang and finish',50],['ceilings','Ceilings',50],['tile','Tile',60],['flooring','Flooring',50],
  ['finish','Finish carpentry and trim',55],['paint','Painting',45],['cabinets','Cabinets and counters',55],['plumbing','Plumbing',95],['electrical','Electrical',90],['general','General labor',35]];
const TRADE_LABEL=Object.fromEntries(TRADES.map(t=>[t[0],t[1]]));
function laborFor(r){ // -> [trade, hours]
  const c=r.cat,u=r.unit,i=r.item.toLowerCase(),q=r.qty;
  switch(c){
    case 'Demolition':return ['demo',u==='LF'?q*0.35:u==='SF'?q*0.02:/tub|shower/.test(i)?q*3:q*1.5];
    case 'Fireplace and chimney':return ['masonry',/brick/.test(i)?q*0.03:/veneer|stucco/.test(i)?q*0.15:/block/.test(i)?q*0.08:/unit|stove/.test(i)?q*6:/pipe/.test(i)?q*0.3:/hearth/.test(i)?q*0.5:/footing/.test(i)?q*4:q*1.5];
    case 'Skylights':return ['roofing',/kit|tubular/.test(i)?q*(/flashing/.test(i)?0.5:4):/shaft/.test(i)?q*0.08:q*4];
    case 'Masonry':return ['masonry',/cmu|block/.test(i)?q*0.08:/icf/.test(i)?q*0.25:/glass block/.test(i)?q*0.12:0];
    case 'Wall framing':return ['framing',/stud|panel|post|girt/.test(i)?q*(/sip/.test(i)?0.8:/post/.test(i)?1.5:0.12):0];
    case 'Headers and beams':return ['framing',q*1];
    case 'Floor framing':return ['framing',/joist/.test(i)?q*0.25:/subfloor/.test(i)?q*0.35:0];
    case 'Roof and ceiling framing':return ['framing',/rafter/.test(i)?q*0.35:/joist/.test(i)?q*0.2:u==='LF'?q*0.05:0];
    case 'Sheathing and wrap':return [/roof/.test(i)?'roofing':'framing',u==='roll'?q*2:q*0.3];
    case 'Roofing':return ['roofing',u==='bundle'?q*0.33:u==='square'?q*2.5:u==='SF'?q*0.025:/drip/.test(i)?q*0.2:u==='LF'?q*0.04:u==='roll'?q*1:0];
    case 'Siding':return ['siding',u==='square'?q*3.5:u==='brick'?q*0.01:u==='SF'?q*0.1:q*0.25];
    case 'Doors and windows':return ['doors',/overhead/.test(i)?q*8:/window|glazing/.test(i)?q*3:/lever|deadbolt|hardware|track/.test(i)?q*0.5:/frame kit/.test(i)?q*2:/exterior|entry|patio|storefront|hollow metal/.test(i)?q*4:q*2.5];
    case 'Insulation':return ['insulation',q*0.012];
    case 'Drywall':return ['drywall',u==='EA'?q*1.1:0];
    case 'Ceilings':return ['ceilings',/tile/.test(i)&&u==='EA'?q*0.05:u==='SF'?q*0.06:u==='LF'?q*0.15:u==='bag'?q*1.5:u==='EA'?q*0.3:0];
    case 'Wall finishes':return [/tile|frp|cement|mosaic|stone|brick/.test(i)?'tile':'finish',u==='SF'?q*(/tile|mosaic/.test(i)?0.15:0.06):u==='roll'?q*0.75:q*0.5];
    case 'Flooring':return [/tile|stone|porcelain|thinset|paver/.test(i)?'tile':'flooring',u==='SY'?q*0.15:u==='bag'?0:/tile|stone|porcelain|paver/.test(i)?q*0.12:/hardwood|oak|pine|engineered/.test(i)?q*0.06:q*0.03];
    case 'Trim and molding':return ['finish',u==='LF'?q*0.06:0];
    case 'Paint':return ['paint',q*3.5];
    case 'Fixtures and cabinets':return [/toilet|tub|shower|lav|sink|urinal|bidet|fountain|water heater/.test(i)?'plumbing':'cabinets',/countertop/.test(i)?q*0.5:/tub|shower/.test(i)?q*6:/toilet|lav|sink|urinal|bidet/.test(i)?q*2:/cabinet|vanity|island|pantry|base|tower|bookcase|desk|locker/.test(i)?q*1.5:q*1];
    case 'Appliances':return [/water heater|furnace|tankless|condenser|air handler/.test(i)?'plumbing':'general',/water heater|furnace|condenser/.test(i)?q*4:q*1];
    case 'Electrical':return ['electrical',/panel/.test(i)&&!/plate/.test(i)?q*8:/cable|connector|plate|breaker/.test(i)?(/breaker/.test(i)?q*0.5:0):/box/.test(i)?q*0.3:u==='EA'?q*0.6:0];
    case 'Cabinets':return ['cabinets',/^[BW]F|filler/i.test(i)?q*0.3:/^U|^OC|pantry/i.test(i)?q*2.5:q*1.5];
    case 'Countertops':return ['cabinets',u==='SF'?q*0.35:u==='LF'?q*0.25:q*0.5];
    case 'Foundation':return ['masonry',u==='CY'?q*3:/block|brick/i.test(i)&&u==='EA'?q*0.06:u==='LF'?q*0.04:u==='EA'?q*0.5:0];
    case 'Decks, porches and steps':return [/concrete|brick|stone|block/i.test(i)?'masonry':'framing',u==='CY'?q*3.5:u==='SF'?q*0.12:u==='LF'?q*0.35:u==='EA'?q*0.5:0];
    case 'Site and landscape':return [/concrete|paving|asphalt|block|stone|retaining/i.test(i)?'masonry':'general',u==='CY'?q*3:u==='SF'||u==='SF face'?q*0.05:u==='LF'?q*0.25:u==='ton'?q*1.5:u==='EA'?q*0.75:u==='bale'?q*0.1:0];
    case 'HVAC':return ['plumbing',/condenser|air handler|furnace/i.test(i)?q*8:q*1];
    case 'Plumbing':return ['plumbing',/water heater/i.test(i)?q*4:q*1.5];
    case 'Exterior trim':return ['siding',u==='LF'?q*0.08:u==='SF'?q*0.05:0];
    case 'Ramps and site':return [/concrete/i.test(i)?'masonry':'framing',u==='CY'?q*3:u==='SF'?q*0.08:u==='LF'?q*0.25:u==='EA'?q*0.4:0];
    default:return ['general',0];
  }
}
const EST_DEFAULTS={rates:Object.fromEntries(TRADES.map(t=>[t[0],t[2]])),markup:15,contingency:15,tax:7,permit:0,dumpsters:null,dumpsterCost:450,selfLabor:false,extras:[]};
function estimateOf(p){
  const E={...EST_DEFAULTS,...(p.estimate||{}),rates:{...EST_DEFAULTS.rates,...((p.estimate||{}).rates||{})}};
  const rows=takeoff(p,{waste:(p.settings?.waste??10)/100});const prices=p.prices||{};
  let mat=0,unpriced=0;const hours={};const lines=[];
  for(const r of rows){const k=r.key.replace(/\|(new|demo)$/,'');const pr=prices[k]??r.price;if(pr!=null)mat+=pr*r.qty;else if(r.cat!=='Fasteners'||true)unpriced++;
    const [t,h]=laborFor(r);if(h>0){hours[t]=(hours[t]||0)+h;}}
  const labor=Object.entries(hours).map(([t,h])=>({t,label:TRADE_LABEL[t],h:Math.round(h*10)/10,rate:E.rates[t]??35,cost:Math.round(h*10)/10*(E.rates[t]??35)})).sort((a,b)=>TRADES.findIndex(x=>x[0]===a.t)-TRADES.findIndex(x=>x[0]===b.t));
  const laborCost=E.selfLabor?0:labor.reduce((s,l)=>s+l.cost,0);const totalH=labor.reduce((s,l)=>s+l.h,0);
  const hasDemo=rows.some(r=>r.cat==='Demolition');const dumps=E.dumpsters!=null?E.dumpsters:hasDemo?Math.max(1,Math.ceil((rows.filter(r=>r.cat==='Demolition').reduce((s,r)=>s+(r.unit==='SF'?r.qty:r.unit==='LF'?r.qty*8:r.qty*20),0))/2500)):0;
  const extras=(E.extras||[]).filter(x=>x&&x.cost>0);
  const tax=mat*E.tax/100;const dump=dumps*E.dumpsterCost;const extraSum=extras.reduce((s,x)=>s+(+x.cost||0),0);
  const sub=mat+tax+laborCost+dump+(+E.permit||0)+extraSum;const markup=E.selfLabor?0:sub*E.markup/100;const cont=(sub+markup)*E.contingency/100;
  const total=sub+markup+cont;const area=p.rooms.reduce((s,r)=>s+polyArea(r.pts),0)/144;
  return {E,rows,mat,unpriced,priced:rows.length-unpriced,labor,laborCost,totalH,dumps,dump,tax,extras,extraSum,permit:+E.permit||0,sub,markup,cont,total,perSF:area>0?total/area:null,area,
    weeks:Math.max(1,Math.round(totalH/(E.selfLabor?20:40*2)*10)/10)};
}
const money=v=>'$'+Math.round(v).toLocaleString('en-US');
function EstimateView({p,commit}){
  const E0=p.estimate||{};const upd=patch=>commit({...p,estimate:{...E0,...patch}});
  const est=useMemo(()=>estimateOf(p),[p]);const E=est.E;const [msg,setMsg]=useState(null);
  const opts=ensureOptions(p).options;const cmp=useMemo(()=>opts.length>1?opts.map(o=>({o,e:estimateOf(optionProject(ensureOptions(p),o))})):null,[p]);
  const num=(id,label,val,onCh,suf)=>html`<label className="estnum" htmlFor=${id}><span>${label}</span><span className="estin"><input id=${id} className="inp mono" inputMode="decimal" value=${val} onChange=${e=>{const v=parseFloat(e.target.value);onCh(isNaN(v)?0:v);}}/>${suf?html`<i>${suf}</i>`:null}</span></label>`;
  const csv=async()=>{const L=[['Section','Item','Hours','Rate','Amount']];for(const l of est.labor)L.push(['Labor',l.label,l.h,l.rate,E.selfLabor?0:Math.round(l.cost)]);
    L.push(['Materials','Materials (priced items)','','',Math.round(est.mat)],['Materials',`Sales tax ${E.tax}%`,'','',Math.round(est.tax)],['Other','Dumpsters x'+est.dumps,'','',Math.round(est.dump)],['Other','Permit','','',est.permit]);
    for(const x of est.extras)L.push(['Other',x.name,'','',x.cost]);L.push(['Markup',`Overhead and profit ${E.markup}%`,'','',Math.round(est.markup)],['Contingency',`${E.contingency}%`,'','',Math.round(est.cont)],['Total','','','',Math.round(est.total)]);
    setMsg(await saveFile(safeName(p.name)+' estimate.csv',L.map(r=>r.map(v=>/[",]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':v).join(',')).join('\n')));};
  const pdf=async()=>{try{await loadJsPDF();const {jsPDF}=window.jspdf;const d=new jsPDF({unit:'in',format:'letter'});estimatePDF(d,p,est,cmp);setMsg(await saveFile(safeName(p.name)+' estimate.pdf',d.output('blob')));}catch(e){setMsg({ok:false,t:e.message||'The PDF could not be made.'});}};
  return html`<div className="estview">
    <div className="estgrid">
      <section className="estcard"><h3>Summary${activeOptionName(p)?' · '+activeOptionName(p):''}</h3>
        <div className="esttotal mono">${money(est.total)}</div>
        <div className="note">${est.perSF?money(est.perSF)+' per sq ft of room area · ':''}about ${Math.round(est.totalH)} labor hours${E.selfLabor?' (your own labor, not priced)':''} · roughly ${est.weeks} week${est.weeks===1?'':'s'} for a 2-person crew</div>
        <table className="esttbl"><tbody>
          <tr><td>Materials${est.unpriced?html` <span className="pill warn">${est.unpriced} items have no price</span>`:''}</td><td className="num mono">${money(est.mat)}</td></tr>
          <tr><td>Sales tax on materials (${E.tax}%)</td><td className="num mono">${money(est.tax)}</td></tr>
          <tr><td>Labor${E.selfLabor?' (self-performed)':''}</td><td className="num mono">${money(est.laborCost)}</td></tr>
          ${est.dumps?html`<tr><td>Dumpsters (${est.dumps} × ${money(E.dumpsterCost)})</td><td className="num mono">${money(est.dump)}</td></tr>`:null}
          ${est.permit?html`<tr><td>Permit</td><td className="num mono">${money(est.permit)}</td></tr>`:null}
          ${est.extras.map((x,i)=>html`<tr key=${i}><td>${x.name}</td><td className="num mono">${money(+x.cost)}</td></tr>`)}
          ${E.selfLabor?null:html`<tr><td>Overhead and profit (${E.markup}%)</td><td className="num mono">${money(est.markup)}</td></tr>`}
          <tr><td>Contingency (${E.contingency}%)</td><td className="num mono">${money(est.cont)}</td></tr>
          <tr className="sum"><td>Total</td><td className="num mono">${money(est.total)}</td></tr></tbody></table>
        <div className="row"><button className="btn primary" onClick=${pdf}>Download estimate PDF</button><button className="btn" onClick=${csv}>Download CSV</button></div>
        ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
        <p className="note">Planning estimate only. Prices come from the Builder's list tab; labor uses rule-of-thumb production rates. Replace the starting rates with local numbers.</p></section>
      <section className="estcard"><h3>Settings</h3>
        <label className="check"><input type="checkbox" id="est-self" checked=${!!E.selfLabor} onChange=${e=>upd({selfLabor:e.target.checked})}/> I'm doing the labor myself (show hours, no labor cost or markup)</label>
        <div className="estnums">
          ${num('est-markup','Overhead and profit',E.markup,v=>upd({markup:v}),'%')}${num('est-cont','Contingency',E.contingency,v=>upd({contingency:v}),'%')}
          ${num('est-tax','Sales tax on materials',E.tax,v=>upd({tax:v}),'%')}${num('est-permit','Permit fee',E.permit,v=>upd({permit:v}),'$')}
          ${num('est-dump','Dumpsters',est.dumps,v=>upd({dumpsters:v}),'')}${num('est-dumpc','Cost per dumpster',E.dumpsterCost,v=>upd({dumpsterCost:v}),'$')}</div>
        <h4>Other costs</h4>
        ${(E.extras||[]).map((x,i)=>html`<div key=${i} className="row estx"><input className="inp" aria-label="Cost name" value=${x.name} onChange=${e=>upd({extras:E.extras.map((y,j)=>j===i?{...y,name:e.target.value}:y)})}/><input className="inp mono" aria-label="Amount" inputMode="decimal" value=${x.cost} onChange=${e=>upd({extras:E.extras.map((y,j)=>j===i?{...y,cost:parseFloat(e.target.value)||0}:y)})}/><button className="btn danger" aria-label="Remove" onClick=${()=>upd({extras:E.extras.filter((_,j)=>j!==i)})}>✕</button></div>`)}
        <div className="row"><button className="btn" onClick=${()=>upd({extras:[...(E.extras||[]),{name:'Equipment rental',cost:0}]})}>Add a cost</button><span className="note">Engineering, survey, temporary power, cleanup…</span></div></section>
    </div>
    <section className="estcard"><h3>Labor by trade</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Trade</th><th className="num">Hours</th><th className="num">Rate per hour</th><th className="num">Labor</th></tr></thead><tbody>
      ${est.labor.map(l=>html`<tr key=${l.t}><td>${l.label}</td><td className="num mono">${l.h}</td><td className="num"><input className="inp mono priceinp" aria-label=${'Rate for '+l.label} value=${E.rates[l.t]} onChange=${e=>{const v=parseFloat(e.target.value);upd({rates:{...(E0.rates||{}),[l.t]:isNaN(v)?0:v}});}}/></td><td className="num mono">${E.selfLabor?'—':money(l.cost)}</td></tr>`)}
      <tr className="sum"><td>Total</td><td className="num mono">${Math.round(est.totalH)}</td><td></td><td className="num mono">${E.selfLabor?'—':money(est.laborCost)}</td></tr></tbody></table></div></section>
    ${cmp?html`<section className="estcard"><h3>Compare design options</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Option</th><th className="num">Area</th><th className="num">Materials</th><th className="num">Labor</th><th className="num">Hours</th><th className="num">Total</th><th className="num">Per sq ft</th></tr></thead><tbody>
      ${cmp.map(({o,e})=>html`<tr key=${o.id} className=${o.id===ensureOptions(p).activeOption?'on':''}><td>${o.name}</td><td className="num mono">${Math.round(e.area)} SF</td><td className="num mono">${money(e.mat)}</td><td className="num mono">${money(e.laborCost)}</td><td className="num mono">${Math.round(e.totalH)}</td><td className="num mono"><b>${money(e.total)}</b></td><td className="num mono">${e.perSF?money(e.perSF):''}</td></tr>`)}</tbody></table></div>
      <p className="note">Each option uses the same prices, rates and markups. Unpriced items count as $0, so price items in every option before comparing.</p></section>`:null}
  </div>`;
}
function estimatePDF(d,p,est,cmp){
  const E=est.E;let y=0.8;const L=0.75,R=7.75;const line=(t,v,b,sz=10)=>{d.setFont('helvetica',b?'bold':'normal');d.setFontSize(sz);d.text(String(t),L,y);if(v!=null)d.text(String(v),R,y,{align:'right'});y+=sz/72*1.5;};
  const rule=()=>{d.setDrawColor(150);d.setLineWidth(0.01);d.line(L,y-0.1,R,y-0.1);y+=0.05;};
  d.setFont('helvetica','bold');d.setFontSize(18);d.text('Planning estimate',L,y);y+=0.3;d.setFontSize(12);d.text((p.name||'Project')+(activeOptionName(p)?' · '+activeOptionName(p):''),L,y);y+=0.22;
  d.setFont('helvetica','normal');d.setFontSize(9);d.text([p.info?.address,new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})].filter(Boolean).join('   ·   '),L,y);y+=0.35;
  line('Summary',null,true,12);rule();
  line(`Materials (${est.priced} of ${est.rows.length} items priced)`,money(est.mat));line(`Sales tax on materials, ${E.tax}%`,money(est.tax));
  line('Labor'+(E.selfLabor?' (self-performed)':''),money(est.laborCost));if(est.dumps)line(`Dumpsters, ${est.dumps}`,money(est.dump));if(est.permit)line('Permit',money(est.permit));
  for(const x of est.extras)line(x.name,money(+x.cost));if(!E.selfLabor)line(`Overhead and profit, ${E.markup}%`,money(est.markup));line(`Contingency, ${E.contingency}%`,money(est.cont));rule();
  line('Total',money(est.total),true,13);y+=0.1;d.setFontSize(9);d.setFont('helvetica','normal');d.text(`${est.perSF?money(est.perSF)+' per sq ft · ':''}about ${Math.round(est.totalH)} labor hours`,L,y);y+=0.4;
  line('Labor by trade',null,true,12);rule();for(const l of est.labor)line(`${l.label}: ${l.h} h at $${l.rate}/h`,E.selfLabor?'—':money(l.cost));y+=0.2;
  if(cmp){line('Design options',null,true,12);rule();for(const {o,e} of cmp)line(`${o.name}: ${Math.round(e.area)} SF, ${Math.round(e.totalH)} h`,money(e.total));y+=0.2;}
  const cats=[...new Set(est.rows.map(r=>r.cat))];const prices=p.prices||{};
  d.addPage();y=0.8;line('Materials',null,true,12);rule();
  for(const c of cats){if(y>10.2){d.addPage();y=0.8;}line(c,null,true,10);for(const r of est.rows.filter(r=>r.cat===c)){if(y>10.4){d.addPage();y=0.8;}const pr=prices[r.key.replace(/\|(new|demo)$/,'')];
      d.setFont('helvetica','normal');d.setFontSize(8.5);d.text(`${r.qty} ${r.unit}`,L+0.1,y);d.text(String(r.item).slice(0,80),L+1.0,y);d.text(pr!=null?money(pr*r.qty):'—',R,y,{align:'right'});y+=0.17;}y+=0.08;}
  d.setFontSize(7.5);d.setTextColor(110);d.text('Planning estimate made with Remodel Studio. Quantities and labor hours are estimates; get quotes before committing.',L,10.6);d.setTextColor(0);
}
