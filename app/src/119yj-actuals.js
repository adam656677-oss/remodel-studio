/* ======================= budget vs actual: receipts against the estimate ======================= */
// Each receipt (date, store, amount, what it was for, optional photo of the slip) goes into a bucket that matches the
// estimate: material categories from the builder's list, labor by trade, tax, dumpsters, permit and extras.
function budgetBuckets(p){let E;try{E=estimateOf(p);}catch(e){return {list:[],E:null};}const prices=p.prices||{};const mat={};
  for(const r of E.rows){const pr=prices[r.key.replace(/\|(new|demo)$/,'')]??r.price;if(pr!=null)mat[r.cat]=(mat[r.cat]||0)+pr*r.qty;}
  const list=[...Object.entries(mat).map(([c,v])=>({k:'mat:'+c,label:c,budget:v,grp:'Materials'})),...(E.E.selfLabor?[]:E.labor.map(l=>({k:'lab:'+l.t,label:'Labor: '+l.label,budget:l.cost,grp:'Labor'}))),
    ...(E.tax?[{k:'tax',label:'Sales tax',budget:E.tax,grp:'Other'}]:[]),...(E.dump?[{k:'dump',label:'Dumpsters',budget:E.dump,grp:'Other'}]:[]),...(E.permit?[{k:'permit',label:'Permit',budget:E.permit,grp:'Other'}]:[]),
    ...E.extras.map(x=>({k:'extra:'+x.name,label:x.name,budget:+x.cost,grp:'Other'})),{k:'other',label:'Other (not in the estimate)',budget:0,grp:'Other'}];
  return {list,E};}
function ReceiptPic({id}){const [u,setU]=useState(null);useEffect(()=>{let live=true;assetGet(id).then(a=>{if(live&&a)setU(blobURL(a.id,a.blob));}).catch(()=>{});return ()=>{live=false;};},[id]);
  return u?html`<a href=${u} target="_blank" rel="noopener"><img src=${u} alt="Receipt" className="rc-thumb"/></a>`:null;}
function ActualsView({p,commit}){const B=useMemo(()=>budgetBuckets(p),[p]);const rec=p.receipts||[];const today=localDate();
  const [f,setF]=useState({date:today,store:'',amount:'',bucket:'',note:''});const [photo,setPhoto]=useState(null);const [msg,setMsg]=useState(null);
  const spent={};for(const r of rec)spent[r.bucket]=(spent[r.bucket]||0)+(+r.amount||0);
  const add=async()=>{const amt=+String(f.amount).replace(/[$,]/g,'');if(!(amt>0)){setMsg('Type the amount on the receipt.');return;}let pid=null;
    if(photo){try{const d=await downscale(photo);pid=uid('rc');await assetPut({id:pid,project:p.id||'default',kind:'receipt',blob:d.blob,w:d.w,h:d.h,name:photo.name,date:new Date().toISOString(),note:f.store});}catch(e){setMsg('The photo could not be saved: '+e.message);}}
    commit({...p,receipts:[...rec,{id:uid('rc'),date:f.date||today,store:f.store.trim(),amount:Math.round(amt*100)/100,bucket:f.bucket||'other',note:f.note.trim(),photo:pid}]});setF({...f,amount:'',note:''});setPhoto(null);setMsg('Receipt added.');};
  const del=id=>commit({...p,receipts:rec.filter(r=>r.id!==id)});const setR=(id,patch)=>commit({...p,receipts:rec.map(r=>r.id===id?{...r,...patch}:r)});
  const totB=B.list.reduce((s,b)=>s+b.budget,0),totS=rec.reduce((s,r)=>s+(+r.amount||0),0);const cont=B.E?B.E.cont:0;const over=B.list.reduce((s,b)=>s+Math.max(0,(spent[b.k]||0)-b.budget),0);
  const committed=(()=>{try{return trackRows(p).filter(r=>['ordered','delivered','installed'].includes(r.t.status)).reduce((s,r)=>s+(+(r.t.price??r.est)||0),0);}catch(e){return 0;}})();
  const csv=()=>{const q=s=>'"'+String(s??'').replace(/"/g,'""')+'"';const lab=k=>(B.list.find(b=>b.k===k)||{label:k}).label;return [['Date','Store','Amount','For','Note'].map(q).join(','),...rec.map(r=>[r.date,r.store,r.amount,lab(r.bucket),r.note].map(q).join(','))].join('\n');};
  const groups=['Materials','Labor','Other'];
  return html`<div className="actuals"><div className="mathead"><div><h2>Budget vs actual</h2><p className="note">Log every receipt against the estimate. Over-runs come out of the contingency first.</p></div>
      <div className="row"><button className="btn" onClick=${async()=>setMsg((await saveFile(safeName(p.name)+'-receipts.csv',csv())).t)}>Download receipts (CSV)</button></div></div>
    <div className="rw-stats"><div><span>Budget (before markup)</span><b>${money0(totB)}</b></div><div><span>Spent</span><b>${money0(totS)}</b><small>${rec.length} receipt${rec.length===1?'':'s'}</small></div><div><span>Ordered, not yet paid</span><b>${money0(committed)}</b><small>from the order tracker</small></div>
      <div><span>Contingency left</span><b className=${over>cont?'bad':''}>${money0(cont-over)}</b><small>${money0(cont)} carried, ${money0(over)} used</small></div></div>
    <section className="sec"><h3>Add a receipt</h3><div className="rc-form">
      <label>Date<input className="inp" type="date" value=${f.date} onChange=${e=>setF({...f,date:e.target.value})}/></label>
      <label>Store<input className="inp" value=${f.store} placeholder="Lowe's, Home Depot…" onInput=${e=>setF({...f,store:e.target.value})}/></label>
      <label>Amount<input className="inp mono" value=${f.amount} placeholder="$0.00" inputMode="decimal" onInput=${e=>setF({...f,amount:e.target.value})}/></label>
      <label>For<select className="inp" value=${f.bucket} onChange=${e=>setF({...f,bucket:e.target.value})}><option value="">Pick a budget line</option>${groups.map(g=>html`<optgroup key=${g} label=${g}>${B.list.filter(b=>b.grp===g).map(b=>html`<option key=${b.k} value=${b.k}>${b.label}</option>`)}</optgroup>`)}</select></label>
      <label>Note<input className="inp" value=${f.note} onInput=${e=>setF({...f,note:e.target.value})}/></label>
      <label>Photo of the receipt<input className="inp" type="file" accept="image/*" capture="environment" onChange=${e=>setPhoto(e.target.files[0]||null)}/></label>
      <div className="row"><button className="btn primary" onClick=${add}>Add receipt</button>${msg?html`<span className="note">${msg}</span>`:null}</div></div></section>
    <section className="sec"><h3>By budget line</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Line</th><th className="num">Budget</th><th className="num">Spent</th><th className="num">Left</th><th></th></tr></thead><tbody>
      ${groups.map(g=>html`<tr key=${'g'+g} className="grp"><td colSpan="5"><b>${g}</b></td></tr>${B.list.filter(b=>b.grp===g&&(b.budget>0||spent[b.k])).map(b=>{const s=spent[b.k]||0;const left=b.budget-s;const pct=b.budget>0?Math.min(1.2,s/b.budget):s>0?1.2:0;
        return html`<tr key=${b.k}><td>${b.label}</td><td className="num mono">${money0(b.budget)}</td><td className="num mono">${s?money0(s):''}</td><td className=${'num mono'+(left<0?' bad':'')}>${left<0?'−'+money0(-left):money0(left)}</td><td className="ba-bar"><i style=${{width:Math.round(pct/1.2*100)+'%',background:pct>1?'var(--bad)':pct>0.85?'var(--warn)':'var(--good)'}}></i></td></tr>`;})}`)}</tbody></table></div></section>
    <section className="sec"><h3>Receipts</h3>${rec.length?html`<div className="tablewrap"><table className="mat"><thead><tr><th>Date</th><th>Store</th><th className="num">Amount</th><th>For</th><th>Note</th><th>Photo</th><th></th></tr></thead><tbody>
      ${[...rec].sort((a,b)=>b.date.localeCompare(a.date)).map(r=>html`<tr key=${r.id}><td className="mono">${r.date}</td><td>${r.store}</td><td className="num mono">${money0(r.amount)}</td>
        <td><select className="inp" aria-label="Budget line" value=${r.bucket} onChange=${e=>setR(r.id,{bucket:e.target.value})}>${B.list.map(b=>html`<option key=${b.k} value=${b.k}>${b.label}</option>`)}${B.list.some(b=>b.k===r.bucket)?null:html`<option value=${r.bucket}>${r.bucket}</option>`}</select></td>
        <td>${r.note}</td><td>${r.photo?html`<${ReceiptPic} id=${r.photo}/>`:null}</td><td><button className="btn small danger" onClick=${()=>del(r.id)} aria-label="Delete receipt">✕</button></td></tr>`)}</tbody></table></div>`:html`<p className="note">No receipts yet.</p>`}</section></div>`;}
MAT_EXTRA.push(['actual','Budget vs actual',ActualsView]);
