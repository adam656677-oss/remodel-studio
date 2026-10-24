/* ======================= brand-name appliances: real sizes, cut-outs and clearance checks ======================= */
const APPL_SUB={range:'Ranges',cooktop:'Cooktops',['wall oven']:'Wall ovens',microwave:'Microwaves',['range hood']:'Range hoods',dishwasher:'Dishwashers',refrigerator:'Refrigerators',washer:'Laundry',dryer:'Laundry',['washer/dryer']:'Laundry'};
function applItem(m){const cw=m.cutout&&m.cutout.w;const t=m.type,st=(m.subtype||'').toLowerCase();let base,w=m.w,d=m.d,h=m.h,elev;
  if(t==='range'){base='range';w=Math.max(m.w,cw||0)||30;d=Math.min(m.d||26,30);h=36;}
  else if(t==='cooktop'){base='range';w=cw?Math.max(30,Math.ceil((cw+1.5)/3)*3):Math.round(m.w);d=24;h=36;}
  else if(t==='wall oven'){base='tall';w=cw?Math.ceil(cw/3)*3+3:Math.round(m.w)+3;d=24;h=84;}
  else if(t==='microwave'){if(/over|otr/.test(st)){base='wallcab';w=30;d=15;h=17;elev=66;}else if(/drawer/.test(st)){base='base';w=cw?Math.ceil(cw/3)*3:Math.round(m.w);d=24;h=34.5;}else{base='tall';w=Math.max(30,Math.round(m.w));d=24;h=84;}}
  else if(t==='range hood'){base='wallcab';w=Math.round(m.w);d=Math.round(m.d||20);h=/chimney|wall/.test(st)?Math.min(36,Math.round(m.h||24)):Math.min(12,Math.round(m.h||6));elev=66;}
  else if(t==='dishwasher'){base='dw';w=cw||Math.round(m.w);d=24;h=34.5;}
  else if(t==='refrigerator'){if(/bev|undercounter|15/.test(st+(m.label||''))&&m.w<=24){base='dw';h=34.5;d=24;}else base='fridge';}
  else if(t==='dryer')base='dryer';else base='washer';
  return {id:'ap-'+m.model.replace(/[^A-Za-z0-9]/g,''),cat:'Appliances',sub:`${APPL_SUB[t]||'Appliances'} · brand models`,label:`${m.brand} ${m.model}: ${(m.label||'').replace(new RegExp('^'+m.brand+'\\s*'),'')}`,code:m.model,place:'fixture',base,w:+(w||30).toFixed(3),d:+(d||24).toFixed(3),h:+(h||36).toFixed(3),...(elev?{elev}:{}),appl:m,note:m.notes||''};}
{if(typeof APPL_DATA!=='undefined')for(const m of APPL_DATA){const it=applItem(m);registerLibItem(it);if(m.price)try{regPrice('Appliances',it.label,m.price);}catch(e){}}}
const applOf=f=>{const it=f.lib&&LIB_BY_ID[f.lib];return it&&it.appl?it.appl:null;};
// checks: opening between cabinets vs the cut-out, and clearance above cooking surfaces
regExtra({checks:(p,add)=>{for(const f of (p.fixtures||[]).filter(f=>f.status!=='demolish')){const m=applOf(f);if(!m)continue;
  let W=null;try{W=wallOfFixture(p,f);}catch(e){}
  if(W&&['range','dishwasher','refrigerator'].includes(m.type)){const IE=elevIE(p,W);const along=q=>(q.x-IE.start.x)*IE.dir.x+(q.y-IE.start.y)*IE.dir.y;const s=along(f);
    const floor=IE.fixtures.filter(g=>g.id!==f.id&&(g.elev||0)<24&&g.type!=='wallcab');let lft=null,rgt=null;for(const g of floor){const sg=along(g);const e0=sg-g.w/2,e1=sg+g.w/2;if(sg<s&&(lft==null||e1>lft))lft=e1;if(sg>s&&(rgt==null||e0<rgt))rgt=e0;}
    if(lft!=null&&rgt!=null){const open=rgt-lft;const need=m.type==='refrigerator'?(m.w+0.25+((m.clear&&m.clear.side)||0)*2):(m.cutout&&m.cutout.w)||m.w;
      if(open<need-0.05)add('error',null,`${m.brand} ${m.model}: opening too narrow`,`The opening between cabinets is ${fmtLen(open)}; this ${m.type} needs ${fmtLen(need)}${m.cutout&&m.cutout.note?` (${m.cutout.note})`:''}. Resize a neighbor or add the space.`,{kind:'fixture',id:f.id},{x:f.x,y:f.y},f.level);
      else if(m.type!=='refrigerator'&&open>need+0.6)add('warn',null,`${m.brand} ${m.model}: gap beside it`,`The opening is ${fmtLen(open)} for a ${fmtLen(need)} cut-out. Close it with a filler (${fmtLen(open-need)}).`,{kind:'fixture',id:f.id},{x:f.x,y:f.y},f.level);}}
  if(['range','cooktop'].includes(m.type)&&m.clear&&m.clear.above){const top=(f.elev||0)+36;const ups=(p.fixtures||[]).filter(g=>g.level===f.level&&g.type==='wallcab'&&!applOf(g)&&!/hood/i.test((g.name||'')+(g.lib||''))&&g.status!=='demolish');
    for(const g of ups){const a=fxCorners(f).map(c=>[c.x,c.y]);if(!inPoly(g.x,g.y,a)&&!fxCorners(g).some(c=>inPoly(c.x,c.y,a)))continue;const gap=(g.elev||0)-top;if(gap<m.clear.above-0.05)add('warn',null,`${m.brand} ${m.model}: cabinet too close above`,`The cabinet over it is ${fmtLen(gap)} above the cooking surface; the install guide calls for ${fmtLen(m.clear.above)}${m.clear.note?'. '+m.clear.note.slice(0,160):''}.`,{kind:'fixture',id:g.id},{x:g.x,y:g.y},f.level);}}
  if(m.type==='range hood'&&m.cfm&&m.cfm>400)add('tip',null,`${m.brand} ${m.model}: makeup air`,`${m.cfm} CFM is over 400: IRC M1503.6 requires makeup air for exhaust hoods over 400 CFM.`,{kind:'fixture',id:f.id},{x:f.x,y:f.y},f.level);}}});
// inspector block with the model's published numbers
function ApplianceSpec({f}){const m=applOf(f);if(!m)return null;const c=m.cutout||{},cl=m.clear||{};const L=v=>v==null?'—':fmtLen(v);
  return html`<div className="sec appl"><h3>${m.brand} ${m.model}</h3><p className="note">${m.label}${m.subtype?' · '+m.subtype:''}</p>
    <div className="stat"><span>Size (W x H x D)</span><span className="mono">${L(m.w)} x ${L(m.h)} x ${L(m.d)}</span></div>
    ${c.w||c.h||c.d?html`<div className="stat"><span>Cut-out</span><span className="mono">${L(c.w)} x ${L(c.h)} x ${L(c.d)}</span></div>`:null}${c.note?html`<p className="note">${c.note}</p>`:null}
    ${cl.above!=null?html`<div className="stat"><span>Above cooking surface</span><span className="mono">${L(cl.above)}</span></div>`:null}${cl.note?html`<p className="note">${cl.note}</p>`:null}
    ${m.cfm?html`<div className="stat"><span>Airflow</span><span className="mono">${m.cfm} CFM</span></div>`:null}${m.elec?html`<div className="stat"><span>Electrical</span><span>${m.elec}</span></div>`:null}${m.fuel?html`<div className="stat"><span>Fuel</span><span>${m.fuel}</span></div>`:null}
    ${m.price?html`<div className="stat"><span>List price</span><span className="mono">$${m.price.toLocaleString()}</span></div>`:null}${m.notes?html`<p className="note">${m.notes}</p>`:null}
    ${m.url?html`<p className="note"><button className="linkbtn" onClick=${()=>window.open(m.url,'_blank','noopener')}>Spec page</button> · confirm with the current install guide before cutting cabinets.</p>`:null}</div>`;}
