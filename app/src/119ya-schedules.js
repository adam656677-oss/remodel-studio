/* ======================= interactive schedules (Archicad Interactive Schedule): edit in the table, the model follows ======================= */
const SCHED_TYPES=[['doors','Doors'],['windows','Windows'],['cabinets','Cabinets'],['hardware','Cabinet hardware'],['appliances','Appliances'],['plumbing','Plumbing fixtures'],['rooms','Rooms and finishes'],['lighting','Lighting']];
const roomFloor=r=>r.finish||(r.use==='bath'||r.use==='kitchen'||r.use==='laundry'?'tile':r.use==='garage'?'concrete':'lvp');
const S_STATUS=[['existing','Existing'],['new','New'],['demolish','Remove']];
function roomAt(p,level,x,y){return p.rooms.find(r=>r.level===level&&inPoly(x,y,r.pts));}
function openingRooms(p,o){const c=openingCenter(p,o);if(!c)return '';const w=c.w;const d=wdir(w);const n={x:-d.y,y:d.x};const a=roomAt(p,w.level,c.x+n.x*(w.thick/2+6),c.y+n.y*(w.thick/2+6)),b=roomAt(p,w.level,c.x-n.x*(w.thick/2+6),c.y-n.y*(w.thick/2+6));return [a&&a.name,b&&b.name].filter(Boolean).join(' / ')||'Outside';}
const setOpening=(p,o,patch)=>updObj(p,'opening',o.id,patch);
const setFx=(p,f,patch)=>updObj(p,'fixture',f.id,patch);
const setCab=(p,f,patch)=>updObj(p,'fixture',f.id,{cab:{...(f.cab||{}),...patch}});
const setRoom=(p,r,patch)=>({...p,rooms:p.rooms.map(x=>x.id===r.id?{...x,...patch}:x)});
function pullSize(fr){const w=fr.u1-fr.u0;if(fr.kind==='drawer')return w<=15?'3-3/4" (96 mm)':w<=24?'5-1/16" (128 mm)':w<=33?'6-5/16" (160 mm)':'7-9/16" (192 mm)';return fr.z1-fr.z0>=48?'Appliance pull 12" (305 mm)':'3-3/4" (96 mm)';}
function hardwareRows(p){const num=cabNumbers(p);const rows=[];const tot={};
  for(const f of (p.fixtures||[]).filter(f=>isCab(f)&&f.type!=='filler'&&f.status!=='demolish')){const st=cabStyle(p,f);if(st.hw==='none')continue;const hw=(CAB_HW.find(x=>x[0]===st.hw)||['',''])[1];const fin=(HW_FIN.find(x=>x[0]===st.hwFin)||['',''])[1];
    const per={};for(const fr of cabFronts(p,f).fronts){if(!['door','glass','drawer','false'].includes(fr.kind))continue;const kind=st.hw==='knob'?'Knob 1-1/4"':st.hw==='cup'&&fr.kind==='drawer'?'Cup pull 3"':st.hw==='cup'?'Knob 1-1/4"':st.hw==='edge'?'Edge pull '+(fr.u1-fr.u0>=24?'6"':'3"'):'Bar pull '+pullSize(fr);per[kind]=(per[kind]||0)+1;}
    for(const [k,n] of Object.entries(per)){const key=k+' · '+fin;tot[key]=(tot[key]||0)+n;}
    rows.push({id:f.id,f,no:num[f.id]||'',code:cabCode(p,f),hw,fin,per});}
  return {rows,tot};}
// column helpers: [key,label,get,edit?]
const C=(k,label,get,o={})=>({k,label,get,...o});
function schedDef(p,type){const L=id=>lvlOf(p,id)?.name||'';
  if(type==='doors'||type==='windows'){const marks=openingMarks(p);const hs={};try{for(const h of headerSchedule(p))hs[h.mark]=h;}catch(e){}
    const ops=p.openings.filter(o=>o.type===(type==='doors'?'door':'window')).map(o=>({id:o.id,o,m:marks[o.id]||'',w:p.walls.find(w=>w.id===o.wall)})).filter(r=>r.w).sort((a,b)=>(a.m||'').localeCompare(b.m||'',undefined,{numeric:true}));
    const common=[C('m','Mark',r=>r.m,{mono:true}),C('pic','',r=>r,{pic:r=>['opening',r.o]}),C('lv','Level',r=>L(r.w.level)),C('rooms','Rooms',r=>openingRooms(p,r.o)),
      C('w','Width',r=>r.o.width,{len:true,set:(q,r,v)=>setOpening(q,r.o,{width:v})}),C('h','Height',r=>r.o.height,{len:true,set:(q,r,v)=>setOpening(q,r.o,{height:v})})];
    const tail=[C('hdr','Header',r=>{const h=hs[r.m];return h?h.header+(h.ok?'':' (check)'):'';}),C('st','Status',r=>r.o.status||'new',{sel:S_STATUS,set:(q,r,v)=>setOpening(q,r.o,{status:v})})];
    if(type==='doors')return {rows:ops,target:r=>({kind:'opening',id:r.id}),level:r=>r.w.level,cols:[...common,C('dt','Type',r=>r.o.dtype||'swing',{sel:Object.entries(DOOR_TYPES),set:(q,r,v)=>setOpening(q,r.o,{dtype:v})}),C('sty','Style',r=>r.o.style||'panel6',{sel:Object.entries(DOOR_STYLES),set:(q,r,v)=>setOpening(q,r.o,{style:v})}),
      C('hand','Handing',r=>{try{return doorHanding(p,r.o).res||'';}catch(e){return '';}}),C('hw','Hardware',r=>{try{return hwName(doorSpec(p,r.o));}catch(e){return '';}}),...tail]};
    return {rows:ops,target:r=>({kind:'opening',id:r.id}),level:r=>r.w.level,cols:[...common,C('sill','Sill',r=>r.o.sill,{len:true,set:(q,r,v)=>setOpening(q,r.o,{sill:v})}),C('head','Head',r=>fmtLen(r.o.sill+r.o.height)),
      C('op','Operation',r=>r.o.operation||'double-hung',{sel:WINDOW_OPS,set:(q,r,v)=>setOpening(q,r.o,{operation:v})}),C('net','Net clear opening',r=>{const n=windowNet(r.o);return n.area?n.area.toFixed(1)+' sf ('+fmtLen(n.w)+' x '+fmtLen(n.h)+')':'fixed';}),...tail]};}
  if(type==='cabinets'){const num=cabNumbers(p);const rows=(p.fixtures||[]).filter(f=>isCab(f)).map(f=>({id:f.id,f})).sort((a,b)=>(num[a.id]||999)-(num[b.id]||999));
    return {rows,target:r=>({kind:'fixture',id:r.id}),level:r=>r.f.level,cols:[C('no','#',r=>num[r.id]||'',{mono:true}),C('pic','',r=>r,{pic:r=>['fixture',r.f]}),C('code','Code',r=>{try{return cabCode(p,r.f);}catch(e){return '';}},{mono:true}),C('room','Room',r=>(roomAt(p,r.f.level,r.f.x,r.f.y)||{}).name||''),
      C('w','Width',r=>r.f.w,{len:true,set:(q,r,v)=>setFx(q,r.f,{w:v})}),C('d','Depth',r=>r.f.d,{len:true,set:(q,r,v)=>setFx(q,r.f,{d:v})}),C('h','Height',r=>r.f.h,{len:true,set:(q,r,v)=>setFx(q,r.f,{h:v})}),
      C('sty','Door style',r=>cabStyle(p,r.f).style,{sel:CAB_STYLES,set:(q,r,v)=>setCab(q,r.f,{style:v})}),C('fin','Finish',r=>cabStyle(p,r.f).finish,{sel:CAB_FIN.map(x=>[x[0],x[1]]),set:(q,r,v)=>setCab(q,r.f,{finish:v})}),
      C('hinge','Hinge',r=>(r.f.cab||{}).hinge||'',{sel:[['','Auto'],['L','Left'],['R','Right']],set:(q,r,v)=>setCab(q,r.f,{hinge:v||null})}),C('price','Price',r=>{try{return '$'+Math.round(cabPrice(p,r.f)).toLocaleString();}catch(e){return '';}},{num:true}),
      C('st','Status',r=>r.f.status||'new',{sel:S_STATUS,set:(q,r,v)=>setFx(q,r.f,{status:v})})]};}
  if(type==='hardware'){const H=hardwareRows(p);return {rows:H.rows,totals:H.tot,target:r=>({kind:'fixture',id:r.id}),level:r=>r.f.level,cols:[C('no','#',r=>r.no,{mono:true}),C('code','Cabinet',r=>r.code,{mono:true}),C('hw','Hardware',r=>r.hw),C('fin','Finish',r=>r.fin),C('per','Pieces',r=>Object.entries(r.per).map(([k,n])=>n+' × '+k).join(', '))]};}
  if(type==='appliances'){const rows=(p.fixtures||[]).filter(f=>{const it=f.lib&&LIB_BY_ID[f.lib];return (it&&it.cat==='Appliances')||['range','fridge','dw','washer','dryer'].includes(f.type);}).map(f=>({id:f.id,f,m:applOf(f)}));
    return {rows,target:r=>({kind:'fixture',id:r.id}),level:r=>r.f.level,cols:[C('pic','',r=>r,{pic:r=>['fixture',r.f]}),C('item','Appliance',r=>r.m?r.m.brand+' '+r.m.model:fxLabel(r.f)),C('type','Type',r=>r.m?r.m.type+(r.m.subtype?' · '+r.m.subtype:''):(FIXTURES[r.f.type]||{}).label),C('room','Room',r=>(roomAt(p,r.f.level,r.f.x,r.f.y)||{}).name||''),
      C('size','Size W x H x D',r=>r.m?[r.m.w,r.m.h,r.m.d].map(v=>v?fmtLen(v):'—').join(' x '):[r.f.w,r.f.h,r.f.d].map(fmtLen).join(' x ')),C('cut','Cut-out',r=>r.m&&r.m.cutout&&r.m.cutout.w?fmtLen(r.m.cutout.w)+' wide':''),C('elec','Electrical or fuel',r=>r.m?[r.m.elec,r.m.fuel].filter(Boolean).join(' · '):''),
      C('price','List price',r=>r.m&&r.m.price?'$'+r.m.price.toLocaleString():'',{num:true}),C('url','Spec',r=>r.m&&r.m.url?r.m.url:'',{link:true}),C('st','Status',r=>r.f.status||'new',{sel:S_STATUS,set:(q,r,v)=>setFx(q,r.f,{status:v})})]};}
  if(type==='plumbing'){const rows=(p.fixtures||[]).filter(f=>PLUMB_T.has(f.type)).map(f=>({id:f.id,f}));
    return {rows,target:r=>({kind:'fixture',id:r.id}),level:r=>r.f.level,cols:[C('pic','',r=>r,{pic:r=>['fixture',r.f]}),C('item','Fixture',r=>fxLabel(r.f)),C('room','Room',r=>(roomAt(p,r.f.level,r.f.x,r.f.y)||{}).name||''),C('lv','Level',r=>L(r.f.level)),
      C('w','Width',r=>r.f.w,{len:true,set:(q,r,v)=>setFx(q,r.f,{w:v})}),C('d','Depth',r=>r.f.d,{len:true,set:(q,r,v)=>setFx(q,r.f,{d:v})}),C('st','Status',r=>r.f.status||'new',{sel:S_STATUS,set:(q,r,v)=>setFx(q,r.f,{status:v})})]};}
  if(type==='rooms'){const rows=sortedLevels(p).flatMap(lv=>p.rooms.filter(r=>r.level===lv.id).map(r=>({id:r.id,r,lv})));const bases=LIB.filter(x=>x.id.startsWith('t-base-')).map(x=>[x.id,x.label.replace(/ baseboard/i,'')]);
    const floorDef=r=>r.finish||(r.use==='bath'||r.use==='kitchen'||r.use==='laundry'?'tile':r.use==='garage'?'concrete':'lvp');
    return {rows,target:r=>({kind:'room',id:r.id}),level:r=>r.r.level,cols:[C('lv','Level',r=>r.lv.name),C('name','Room',r=>r.r.name,{txt:true,set:(q,r,v)=>setRoom(q,r.r,{name:v})}),C('area','Area',r=>Math.round(polyArea(r.r.pts)/144)+' sf',{num:true}),
      C('fl','Floor',r=>floorDef(r.r),{sel:Object.entries(FLOOR_FINISH).map(([k,v])=>[k,v.label]),set:(q,r,v)=>setRoom(q,r.r,{finish:v})}),C('base','Base',r=>trimOf(p,r.r).base,{sel:bases,set:(q,r,v)=>setRoom(q,r.r,{trim:{...(r.r.trim||{}),base:v}})}),
      C('wall','Walls',r=>r.r.wallFinish||'paint',{sel:Object.entries(WALL_FIN).map(([k,v])=>[k,v[0]]),set:(q,r,v)=>setRoom(q,r.r,{wallFinish:v})}),C('paint','Wall color',r=>(r.r.paint&&r.r.paint.wall)||(r.r.wallColor?colorName(r.r.wallColor):''),{txt:true,set:(q,r,v)=>setRoom(q,r.r,{paint:{...(r.r.paint||{}),wall:v||null}})}),
      C('ceil','Ceiling',r=>r.r.ceiling||'flat',{sel:Object.entries(CEILINGS).map(([k,v])=>[k,v[0]]),set:(q,r,v)=>setRoom(q,r.r,{ceiling:v})}),C('ch','Ceiling height',r=>r.r.ceilingH||r.lv.height,{len:true,set:(q,r,v)=>setRoom(q,r.r,{ceilingH:v})}),
      C('note','Notes',r=>r.r.finishNote||'',{txt:true,set:(q,r,v)=>setRoom(q,r.r,{finishNote:v})})]};}
  if(type==='lighting'){const groups={};for(const d of (p.elec||[]).filter(d=>LUMENS[d.type]&&d.status!=='demolish')){const m=lightMark(p,d);(groups[m]=groups[m]||[]).push(d);}const sw=switchGroups(p);
    const rows=Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0])).map(([m,ds])=>({id:'mk-'+m,m,ds,d:ds[0]}));const setAll=(q,r,patch)=>({...q,elec:q.elec.map(e=>r.ds.some(x=>x.id===e.id)?{...e,...patch}:e)});
    return {rows,target:r=>({kind:'elec',id:r.d.id}),level:r=>r.d.level,cols:[C('m','Mark',r=>r.m,{mono:true}),C('type','Fixture',r=>(ELEC[r.d.type]||{}).label),C('qty','Qty',r=>r.ds.length,{num:true}),
      C('lm','Lumens',r=>r.d.lumens||LUMENS[r.d.type],{numEdit:true,set:(q,r,v)=>setAll(q,r,{lumens:v})}),C('k','Color',r=>String(r.d.kelvin||2700),{sel:KELVINS.map(([v,l])=>[String(v),l]),set:(q,r,v)=>setAll(q,r,{kelvin:+v})}),
      C('dim','Dimmable',r=>r.d.dim?'yes':'no',{sel:[['yes','Yes'],['no','No']],set:(q,r,v)=>setAll(q,r,{dim:v==='yes'})}),C('w','Watts (LED)',r=>Math.round((r.d.lumens||LUMENS[r.d.type])/90)*r.ds.length,{num:true}),
      C('sw','Switches',r=>sw.filter(g=>g.lights.some(l=>r.ds.includes(l))).map(g=>g.label).join(' ')||'none'),C('rooms','Rooms',r=>[...new Set(r.ds.map(d=>(roomAt(p,d.level,d.x,d.y)||{}).name).filter(Boolean))].join(', '))]};}
  return {rows:[],cols:[]};}
function schedCSV(def){const q=s=>'"'+String(s??'').replace(/"/g,'""')+'"';const cols=def.cols.filter(c=>!c.pic);const val=(c,r)=>{const v=c.get(r);return c.len?fmtLen(v):Array.isArray(c.sel)?((c.sel.find(x=>String(x[0])===String(v))||[v,v])[1]):v;};
  return [cols.map(c=>q(c.label)).join(','),...def.rows.map(r=>cols.map(c=>q(val(c,r))).join(','))].join('\n');}
function SchedCell({c,r,p,commit}){const v=c.get(r);const id='sc-'+c.k+'-'+r.id;
  if(c.pic){const [kind,obj]=c.pic(r);return html`<td className="sc-pic"><${ItemPic} kind=${kind} obj=${obj} p=${p} w=${64} h=${48} alt=""/></td>`;}
  if(c.set&&c.len)return html`<td className="num"><${LenInput} id=${id} value=${v} onChange=${x=>x>0&&commit(c.set(p,r,x))}/></td>`;
  if(c.set&&c.sel)return html`<td><select id=${id} className="inp" aria-label=${c.label} value=${v} onChange=${e=>commit(c.set(p,r,e.target.value))}>${c.sel.some(x=>String(x[0])===String(v))?null:html`<option value=${v}>${v}</option>`}${c.sel.map(([k,l])=>html`<option key=${k} value=${k}>${l}</option>`)}</select></td>`;
  if(c.set&&c.txt)return html`<td><input id=${id} className="inp" aria-label=${c.label} defaultValue=${v} key=${r.id+':'+v} onKeyDown=${e=>{if(e.key==='Enter')e.target.blur();}} onBlur=${e=>{if(e.target.value!==v)commit(c.set(p,r,e.target.value));}}/></td>`;
  if(c.set&&c.numEdit)return html`<td className="num"><input id=${id} className="inp mono num" aria-label=${c.label} defaultValue=${v} key=${r.id+':'+v} onKeyDown=${e=>{if(e.key==='Enter')e.target.blur();}} onBlur=${e=>{const x=+e.target.value;if(x>0&&x!==v)commit(c.set(p,r,x));}}/></td>`;
  if(c.link)return html`<td>${v?html`<button className="linkbtn" onClick=${()=>window.open(v,'_blank','noopener')}>Spec page</button>`:null}</td>`;
  return html`<td className=${(c.num?'num ':'')+(c.mono?'mono':'')}>${c.len?fmtLen(v):v}</td>`;}
function SchedulesView({p,commit,setMode,setSel,setLevelId}){const [type,setTypeS]=useState(()=>window.__rsSched||(()=>{try{return localStorage.getItem('remodel-studio:schedtype')||'doors';}catch(e){return 'doors';}})());
  const setType=t=>{setTypeS(t);try{localStorage.setItem('remodel-studio:schedtype',t);}catch(e){}};
  useEffect(()=>{const f=e=>setType(e.detail);window.addEventListener('rs-sched',f);window.__rsSched=null;return ()=>window.removeEventListener('rs-sched',f);},[]);
  const [pics,setPicsS]=useState(()=>{try{return localStorage.getItem('remodel-studio:schedpics')!=='0';}catch(e){return true;}});const setPics=v=>{setPicsS(v);try{localStorage.setItem('remodel-studio:schedpics',v?'1':'0');}catch(e){}};
  const [sort,setSort]=useState(null);const [q,setQ]=useState('');
  const def=useMemo(()=>schedDef(p,type),[p,type]);const cols=def.cols.filter(c=>pics||!c.pic);
  const qs=q.trim().toLowerCase();let rows=def.rows.filter(r=>!qs||cols.some(c=>!c.pic&&String(c.len?fmtLen(c.get(r)):c.get(r)).toLowerCase().includes(qs)));
  if(sort){const c=def.cols.find(c=>c.k===sort.k);if(c){const nv=v=>typeof v==='string'&&/^\$[\d,]+/.test(v)?+v.replace(/[$,]/g,''):v;rows=[...rows].sort((a,b)=>{const x=nv(c.get(a)),y=nv(c.get(b));return (typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y),undefined,{numeric:true}))*(sort.dir);});}}
  const show=r=>{if(def.level)setLevelId(def.level(r));setMode('design');setTimeout(()=>setSel(def.target(r)),60);};
  return html`<div className="matview schedview"><div className="matinner">
    <div className="mathead"><div><h2>Schedules</h2><p className="note">Change a value in the table and the model changes with it. Sort by clicking a heading. "Show" opens the item in Design.</p></div>
      <div className="row"><label className="chk"><input type="checkbox" checked=${pics} onChange=${e=>setPics(e.target.checked)}/> Pictures</label><input className="inp" type="search" placeholder="Filter rows" aria-label="Filter rows" value=${q} onInput=${e=>setQ(e.target.value)}/>
        <button className="btn" onClick=${()=>saveFile(safeName(p.name)+'-'+type+'-schedule.csv',schedCSV(def))}>Download CSV</button></div></div>
    <div className="seg mattabs" role="tablist">${SCHED_TYPES.map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${type===k} className=${type===k?'on':''} onClick=${()=>{setType(k);setSort(null);}}>${l}</button>`)}</div>
    ${def.totals&&Object.keys(def.totals).length?html`<section className="sec"><h3>Order totals</h3><table className="mat"><tbody>${Object.entries(def.totals).sort().map(([k,n])=>html`<tr key=${k}><td>${k}</td><td className="num mono">${n}</td></tr>`)}</tbody></table></section>`:null}
    ${rows.length?html`<div className="tablewrap"><table className="mat sched"><thead><tr>${cols.map(c=>html`<th key=${c.k} className=${c.num?'num':''}>${c.pic?'':html`<button className="sc-sort" onClick=${()=>setSort(s=>s&&s.k===c.k?{k:c.k,dir:-s.dir}:{k:c.k,dir:1})}>${c.label}${sort&&sort.k===c.k?(sort.dir>0?' ▲':' ▼'):''}</button>`}</th>`)}<th></th></tr></thead>
      <tbody>${rows.map(r=>html`<tr key=${r.id}>${cols.map(c=>html`<${SchedCell} key=${c.k} c=${c} r=${r} p=${p} commit=${commit}/>`)}<td><button className="btn small" onClick=${()=>show(r)}>Show</button></td></tr>`)}</tbody></table></div>`
      :html`<p className="note">${def.rows.length?'No rows match the filter.':'Nothing of this kind in the model yet.'}</p>`}
  </div></div>`;}
