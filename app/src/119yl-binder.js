/* ======================= homeowner binder: one PDF with everything the owner needs after the job ======================= */
// Paint and finishes by room, cabinets, appliances with model numbers, manuals and warranty dates, fixtures, the panel
// schedule, lighting, where the shutoffs are, filter sizes, the wall photos, who did the work, and a maintenance calendar.
const BINDER_INFO=[['water','Main water shutoff'],['gas','Gas shutoff'],['panel','Electrical panel location'],['filter','HVAC filter size and location'],['wh','Water heater (make, model, size)'],['hvac','HVAC equipment (make, model)'],['attic','Attic access'],['crawl','Crawlspace access'],['notes','Other notes for the owner']];
const MAINT=[['Monthly','Test smoke and CO alarms (IRC R314, R315); test GFCI outlets with their test button; check the HVAC filter.'],['Every 1 to 3 months','Replace the HVAC filter.'],['Every 6 months','Clean the range hood filter; check under sinks for leaks; clean gutters in spring and fall.'],
  ['Yearly','Replace smoke alarm batteries; flush the water heater; clean the dryer vent all the way outside; vacuum refrigerator coils; re-caulk tub, shower and backsplash joints; check exterior caulk and paint; have the HVAC serviced.'],['Every 10 years','Replace smoke alarms (date on the back).']];
function binderOf(p){return {info:{},warranty:{},contacts:'',...(p.binder||{})};}
async function binderImg(id,maxW=900){try{const a=await assetGet(id);if(!a)return null;const url=blobURL(a.id,a.blob);const im=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url;});
  const sc=Math.min(1,maxW/im.naturalWidth);const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*sc);c.height=Math.round(im.naturalHeight*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return {url:c.toDataURL('image/jpeg',0.8),w:c.width,h:c.height};}catch(e){return null;}}
async function binderPDF(p,onStep){await loadJsPDF();const {jsPDF}=window.jspdf;const d=new jsPDF({unit:'in',format:'letter'});const B=binderOf(p);const info=p.info||{};const L=0.75,R=7.75,W=R-L;let y=0.9;
  d.setLineWidth(0.008);const H=(t)=>{if(y>8.6){d.addPage();y=0.9;}else if(y>1.2)y+=0.35;d.setFont('helvetica','bold');d.setFontSize(15);d.text(t,L,y);y+=0.12;d.setDrawColor(40);d.line(L,y,R,y);y+=0.3;d.setFontSize(10);d.setFont('helvetica','normal');};
  const T=(t,o={})=>{d.setFont('helvetica',o.bold?'bold':'normal');d.setFontSize(o.size||10);const ls=d.splitTextToSize(String(t),o.w||W);for(const l of ls){if(y>10.3){d.addPage();y=0.9;}d.text(l,o.x||L,y);y+=(o.size||10)/72*1.35;}};
  const table=(cols,rows)=>{const tw=cols.reduce((s,c)=>s+c[1],0);const sc=W/tw;d.setFontSize(8.5);d.setFont('helvetica','bold');let x=L;for(const [h,w] of cols){d.text(h,x,y);x+=w*sc;}y+=0.06;d.line(L,y,R,y);y+=0.17;d.setFont('helvetica','normal');
    for(const r of rows){const cells=r.map((v,i)=>d.splitTextToSize(String(v??''),cols[i][1]*sc-0.08));const h=Math.max(...cells.map(c=>c.length))*0.15+0.05;if(y+h>10.4){d.addPage();y=0.9;}x=L;cells.forEach((c,i)=>{d.text(c,x,y);x+=cols[i][1]*sc;});y+=h;d.setDrawColor(210);d.line(L,y-0.1,R,y-0.1);d.setDrawColor(40);}y+=0.15;d.setFontSize(10);};
  const step=async t=>{onStep&&onStep(t);await new Promise(r=>setTimeout(r,0));};
  // cover
  await step('Cover');d.setFont('helvetica','bold');d.setFontSize(26);d.text('Homeowner binder',L,2);d.setFontSize(16);d.text(p.name||'',L,2.45);d.setFont('helvetica','normal');d.setFontSize(11);
  y=2.9;for(const l of [info.address,info.client?'Prepared for '+info.client:'',info.designer?'Prepared by '+info.designer:'',new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})])if(l){d.text(l,L,y);y+=0.22;}
  y+=0.3;T('Contents: where things are · paint and finishes · cabinets · appliances and warranties · plumbing fixtures · electrical panel · lighting · wall photos · who did the work · maintenance calendar.',{size:10});
  // where things are
  await step('Where things are');H('Where things are');const inf=B.info||{};const rows0=BINDER_INFO.map(([k,l])=>[l,inf[k]||'']).filter(r=>r[1]);
  if(rows0.length)table([['Item',2.2],['Location or details',5]],rows0);else T('Fill in the shutoff and equipment locations in Build › Homeowner binder.',{size:9});
  // paint and finishes
  await step('Finishes');H('Paint and finishes by room');const sel=typeof selOf==='function'?selOf(p):{};const brand=sel.paintBrand||'';
  table([['Room',1.4],['Floor',1.3],['Walls',1.6],['Wall color',1.6],['Trim and ceiling',1.5],['Ceiling',1.2]],sortedLevels(p).flatMap(lv=>p.rooms.filter(r=>r.level===lv.id).map(r=>[r.name,(FLOOR_FINISH[roomFloor(r)]||{label:roomFloor(r)}).label,(WALL_FIN[r.wallFinish||'paint']||[''])[0],[brand,r.paint&&r.paint.wall].filter(Boolean).join(' ')||(r.wallColor?colorName(r.wallColor):''),(r.paint&&r.paint.trim)||'',(CEILINGS[r.ceiling||'flat']||[''])[0]])));
  // cabinets
  const cabs=(p.fixtures||[]).filter(f=>isCab(f)&&f.status!=='demolish');if(cabs.length){await step('Cabinets');H('Cabinets');const st=cabStyle(p,cabs[0]);
    T(`${vendorLabel&&vendorLabel(st)||'Cabinets'} · ${(CAB_STYLES.find(x=>x[0]===st.style)||['',''])[1]} door · ${(CAB_FIN.find(x=>x[0]===st.finish)||['',''])[1]} · ${(CAB_HW.find(x=>x[0]===st.hw)||['',''])[1]}, ${(HW_FIN.find(x=>x[0]===st.hwFin)||['',''])[1]}`);y+=0.08;
    const num=cabNumbers(p);table([['#',0.4],['Code',1.4],['Size W x H x D',1.8],['Room',1.6]],cabs.map(f=>[num[f.id]||'',(()=>{try{return cabCode(p,f);}catch(e){return '';}})(),[f.w,f.h,f.d].map(fmtLen).join(' x '),(p.rooms.find(r=>r.level===f.level&&inPoly(f.x,f.y,r.pts))||{}).name||'']));
    T('Clean with a soft cloth and mild soap; dry right away. Keep the dishwasher and range from steaming the doors.',{size:9});}
  // appliances
  const app=(p.fixtures||[]).filter(f=>f.status!=='demolish'&&((f.lib&&LIB_BY_ID[f.lib]&&LIB_BY_ID[f.lib].cat==='Appliances')||['range','fridge','dw','washer','dryer'].includes(f.type)));if(app.length){await step('Appliances');H('Appliances and warranties');
    table([['Appliance',2.2],['Model',1.4],['Installed',1],['Warranty to',1],['Manual or spec page',2.4]],app.map(f=>{const m=applOf(f);const t=typeof trackFor==='function'?trackFor(p,'fx:'+f.id)||{}:{};const inst=t.installed||t.delivered||'';const yrs=+(B.warranty['fx:'+f.id]??1);
      const to=inst?(()=>{const x=new Date(inst+'T12:00:00');x.setFullYear(x.getFullYear()+yrs);return x.toISOString().slice(0,10);})():(yrs+' yr');return [m?`${m.brand} ${m.label||m.type}`:fxLabel(f),m?m.model:'',inst,to,m&&m.url?m.url:''];}));}
  // plumbing
  const pl=(p.fixtures||[]).filter(f=>f.status!=='demolish'&&PLUMB_T.has(f.type));if(pl.length){await step('Plumbing');H('Plumbing fixtures');table([['Fixture',3],['Room',2],['Notes',2.4]],pl.map(f=>[fxLabel(f),(p.rooms.find(r=>r.level===f.level&&inPoly(f.x,f.y,r.pts))||{}).name||'','']));
    T('Every fixture has its own shutoff valves under or behind it. Clean faucet aerators yearly.',{size:9});}
  // panel
  try{const P=panelSchedule(p);if(P.circuits.length){await step('Panel');H(`Electrical panel (${P.main} A main)`);table([['Space',0.6],['Circuit',3.1],['Breaker',0.9],['Protection',1.6]],P.circuits.map(c=>[c.space,c.desc,`${c.amps} A${c.poles===2?' 2P':''}`,c.prot]));}}catch(e){}
  // lighting
  try{const ls=lightingSchedule(p);if(ls.length){await step('Lighting');H('Lighting');table([['Mark',0.5],['Fixture',2],['Qty',0.5],['Color',0.9],['Lumens',0.8],['Rooms',2.6]],ls.map(r=>[r.mark,r.type,r.qty,r.kelvin+' K',r.lumens,r.rooms]));T('Replacement LED lamps should match the color (Kelvin) listed so rooms stay consistent.',{size:9});}}catch(e){}
  // wall photos with a picture each
  const wps=p.wallphotos||[];if(wps.length){await step('Wall photos');H('What is inside the walls');let assets=[];try{assets=(await assetList(p.id||'default')).filter(a=>a.pin&&a.pin.kind==='wallphoto');}catch(e){}
    for(const o of wps){const q=wpPoint(p,o);const room=q?(p.rooms.find(r=>r.level===q.w.level&&inPoly(q.x,q.y,r.pts))||{}).name||'':'';const a=assets.find(x=>x.pin.id===o.id);
      if(y>8.6){d.addPage();y=0.9;}T(`${room} · ${o.date||''} · ${(WP_STAGE.find(s=>s[0]===o.stage)||WP_STAGE[0])[1]}${o.note?': '+o.note:''}`,{bold:true,size:9.5});
      if(a){const im=await binderImg(a.id,700);if(im){const w=3.2,h=w*im.h/im.w;if(y+h>10.4){d.addPage();y=0.9;}d.addImage(im.url,'JPEG',L,y,w,h);y+=h+0.2;}}else y+=0.05;}}
  // contacts
  await step('Contacts');H('Who did the work');const vendors=[...new Set(Object.values(p.track||{}).map(t=>t.vendor).filter(Boolean))];if(B.contacts)T(B.contacts);if(vendors.length){y+=0.05;T('Suppliers: '+vendors.join(', '),{size:9.5});}if(!B.contacts&&!vendors.length)T('Add contractors and suppliers in Build › Homeowner binder.',{size:9});
  // maintenance
  H('Maintenance calendar');for(const [when,what] of MAINT){T(when,{bold:true});T(what,{size:9.5});y+=0.08;}
  return d;}
function BinderView({p,commit}){const B=binderOf(p);const [busy,setBusy]=useState(null);const [msg,setMsg]=useState(null);const set=patch=>commit({...p,binder:{...B,...patch}});
  const app=(p.fixtures||[]).filter(f=>f.status!=='demolish'&&f.lib&&LIB_BY_ID[f.lib]&&LIB_BY_ID[f.lib].appl);
  const make=async()=>{setBusy('Starting');setMsg(null);try{const d=await binderPDF(p,t=>setBusy(t));const r=await saveFile(safeName(p.name)+' homeowner binder.pdf',d.output('blob'));setMsg(r.t);}catch(e){console.error(e);setMsg('Could not make the binder: '+(e.message||e));}setBusy(null);};
  return html`<div className="binder"><div className="mathead"><div><h2>Homeowner binder</h2><p className="note">One PDF for the owner at the end of the job: finishes and paint colors, cabinets, appliances with model numbers and warranty dates, fixtures, the panel schedule, lighting, wall photos, contacts and a maintenance calendar. Most of it comes from the model; fill in the rest here.</p></div>
      <div className="row"><button className="btn primary" disabled=${!!busy} onClick=${make}>${busy?busy+'…':'Make the binder (PDF)'}</button></div></div>${msg?html`<p className="note">${msg}</p>`:null}
    <section className="sec"><h3>Where things are</h3><div className="sysgrid">${BINDER_INFO.map(([k,l])=>html`<${Field} key=${k} label=${l} id=${'bd-'+k}><input id=${'bd-'+k} className="inp" key=${'bd-'+k+(B.info[k]||'')} defaultValue=${B.info[k]||''} onBlur=${e=>e.target.value!==(B.info[k]||'')&&set({info:{...B.info,[k]:e.target.value}})}/><//>`)}</div></section>
    ${app.length?html`<section className="sec"><h3>Appliance warranties</h3><p className="note">Years of coverage from the installed or delivered date in Cost › Selections and orders.</p><table className="mat"><tbody>${app.map(f=>{const m=applOf(f);const k='fx:'+f.id;return html`<tr key=${f.id}><td>${m.brand} ${m.model}</td><td><select className="inp" aria-label=${'Warranty years for '+m.model} value=${String(B.warranty[k]??1)} onChange=${e=>set({warranty:{...B.warranty,[k]:+e.target.value}})}>${[1,2,3,5,10].map(v=>html`<option key=${v} value=${v}>${v} year${v===1?'':'s'}</option>`)}</select></td></tr>`;})}</tbody></table></section>`:null}
    <section className="sec"><h3>Who did the work</h3><textarea className="inp" rows="4" aria-label="Contractors and suppliers" placeholder="Electrician: name, phone, license. Plumber: … Cabinets: …" key=${'bdc'+B.contacts.length} defaultValue=${B.contacts} onBlur=${e=>e.target.value!==B.contacts&&set({contacts:e.target.value})}></textarea></section></div>`;}
BUILD_TABS.push(['binder','Homeowner binder',BinderView]);
EXTRA_DIALOGS.binder=({p,commit,onClose})=>html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide" role="dialog" aria-label="Homeowner binder"><${BinderView} p=${p} commit=${commit}/><div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Close</button></div></div></div>`;
