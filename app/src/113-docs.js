/* ======================= construction documents: revisions, finish and fixture schedules, DXF import ======================= */
function RevisionsEditor({p,commit}){const revs=(p.info&&p.info.revisions)||[];const set=list=>commit({...p,info:{...(p.info||{}),revisions:list}});
  return html`<div className="sec"><h3>Revisions</h3>
    ${revs.map((r,i)=>html`<div key=${i} className="revrow"><input className="inp mono" style=${{width:'3.2em'}} value=${r.no} onChange=${e=>set(revs.map((x,j)=>j===i?{...x,no:e.target.value}:x))} aria-label="Revision number"/>
      <input className="inp" style=${{width:'7.5em'}} value=${r.date} onChange=${e=>set(revs.map((x,j)=>j===i?{...x,date:e.target.value}:x))} aria-label="Revision date"/>
      <input className="inp" style=${{flex:1}} value=${r.desc} placeholder="What changed" onChange=${e=>set(revs.map((x,j)=>j===i?{...x,desc:e.target.value}:x))} aria-label="Revision description"/>
      <button className="btn danger" onClick=${()=>set(revs.filter((x,j)=>j!==i))} aria-label="Remove revision">✕</button></div>`)}
    <div className="row"><button className="btn" onClick=${()=>set([...revs,{no:String(revs.length+1),date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),desc:''}])}>Add revision</button></div>
    <p className="note">Revisions print in a table in every title block.</p></div>`;}
function drawRevisions(dl,p,x,y,w,k){const revs=(p.info&&p.info.revisions)||[];if(!revs.length)return y;dl.text(x,y,'REVISIONS',{size:5*k,bold:true,color:MID});y+=0.06*k;
  const rh=0.13*k;for(const r of revs.slice(-6)){y+=rh;dl.text(x,y,String(r.no||''),{size:5.5*k,bold:true});dl.text(x+0.25*k,y,String(r.date||''),{size:5.5*k});
    const lines=wrapText(String(r.desc||''),w-1.05*k,5.5*k).slice(0,2);lines.forEach((l,i)=>dl.text(x+1.05*k,y+i*0.11*k,l,{size:5.5*k}));y+=(lines.length>1?0.11*k:0);}
  return y+0.12*k;}
/* ---- schedules sheet ---- */
function roomFinishRows(p){return sortedLevels(p).flatMap(lv=>p.rooms.filter(r=>r.level===lv.id).map(r=>{const t=trimOf(p,r);const fin=r.finish||(r.use==='bath'||r.use==='kitchen'||r.use==='laundry'?'tile':r.use==='garage'?'concrete':'lvp');
  const lab=(LIB_BY_ID[t.base]||{label:'—'}).label.replace(/ baseboard/i,'');return [lv.name,r.name,(FLOOR_FINISH[fin]||{label:fin}).label,lab,(WALL_FIN&&WALL_FIN[r.wallFinish]?WALL_FIN[r.wallFinish][0]:'Painted drywall')+(r.wallColor?' '+colorName(r.wallColor):''),(CEILINGS[r.ceiling||'flat']||['Flat drywall'])[0],fmtLen(r.ceilingH||lv.height),Math.round(polyArea(r.pts)/144)+' SF'];}));}
function fixtureRows(p){const m=new Map();for(const f of (p.fixtures||[]).filter(f=>f.status!=='demolish'&&!isCab(f))){const t=FIXTURES[f.type]||{};if(t.cat==='Furniture')continue;const lab=fxLabel(f);const key=lab+'|'+(t.cat||'');const r=m.get(key)||{lab,cat:t.cat||'',n:0,rooms:new Set()};r.n++;const rm=p.rooms.find(r=>r.level===f.level&&inPoly(f.x,f.y,r.pts));if(rm)r.rooms.add(rm.name);m.set(key,r);}
  for(const o of (p.mep||[]).filter(o=>o.status!=='demolish')){const t=MEP[o.type]||{};const key=t.label+'|'+t.cat;const r=m.get(key)||{lab:t.label,cat:t.cat,n:0,rooms:new Set()};r.n++;m.set(key,r);}
  return [...m.values()].sort((a,b)=>a.cat.localeCompare(b.cat)||a.lab.localeCompare(b.lab)).map(r=>[r.cat,r.lab,String(r.n),[...r.rooms].join(', ')]);}
function schedulesSheet(P,p){const k=P.k;const dl=DL();const A=sheetFrame(dl,P,p,'A6.1','Schedules','');let y=A.y0+0.3*k;const W=A.x1-A.x0;
  dl.text(A.x0,y,'ROOM FINISH SCHEDULE',{size:8*k,bold:true});y+=0.1*k;const rf=roomFinishRows(p);
  const cw=[0.9,1.25,1.15,1.1,1.7,1.25,0.65,0.6].map(v=>v*k);const sc=Math.min(1,W/cw.reduce((a,b)=>a+b,0));
  y+=drawTable(dl,A.x0,y,['LEVEL','ROOM','FLOOR','BASE','WALLS','CEILING','CLG HT','AREA'].map((h,i)=>({h,w:cw[i]*sc})),rf,k,A.y1-2*k)+0.35*k;
  dl.text(A.x0,y,'PLUMBING, APPLIANCE AND MECHANICAL SCHEDULE',{size:8*k,bold:true});y+=0.1*k;const fr=fixtureRows(p);
  const cw2=[1.2,3.2,0.5,3.0].map(v=>v*k);const sc2=Math.min(1,W/cw2.reduce((a,b)=>a+b,0));
  drawTable(dl,A.x0,y,['TYPE','ITEM','QTY','LOCATION'].map((h,i)=>({h,w:cw2[i]*sc2})),fr.length?fr:[['—','No fixtures yet','','']],k,A.y1-0.1*k);
  return {id:'sched',no:'A6.1',title:'Schedules',w:P.w,h:P.h,items:dl.items,scale:''};}
/* ---- DXF import (ASCII): LINE, LWPOLYLINE, POLYLINE, CIRCLE, ARC, TEXT become drafting items ---- */
function parseDXF(text){const lines=text.split(/\r?\n/);const pairs=[];for(let i=0;i+1<lines.length;i+=2)pairs.push([parseInt(lines[i].trim(),10),lines[i+1].trim()]);
  const ents=[];let i=pairs.findIndex(([c,v])=>c===2&&v==='ENTITIES');if(i<0)i=0;let cur=null;let units=null;
  {const u=pairs.findIndex(([c,v])=>c===9&&v==='$INSUNITS');if(u>=0&&pairs[u+1])units=parseInt(pairs[u+1][1]);}
  for(;i<pairs.length;i++){const [c,v]=pairs[i];if(c===0){if(cur)ents.push(cur);if(v==='ENDSEC'){cur=null;break;}cur={type:v,g:[]};continue;}if(cur)cur.g.push([c,v]);}
  if(cur)ents.push(cur);const out=[];let polyl=null;
  for(const e of ents){const G=c=>{const x=e.g.find(q=>q[0]===c);return x?parseFloat(x[1]):null;};const all=c=>e.g.filter(q=>q[0]===c).map(q=>parseFloat(q[1]));const layer=(e.g.find(q=>q[0]===8)||[0,'0'])[1];
    if(e.type==='LINE')out.push({shape:'line',pts:[[G(10),G(20)],[G(11),G(21)]],layer});
    else if(e.type==='LWPOLYLINE'){const xs=all(10),ys=all(20);const closed=(G(70)||0)&1;out.push({shape:'pline',pts:xs.map((x,j)=>[x,ys[j]]),closed:!!closed,layer});}
    else if(e.type==='POLYLINE'){polyl={shape:'pline',pts:[],closed:!!((G(70)||0)&1),layer};}
    else if(e.type==='VERTEX'&&polyl)polyl.pts.push([G(10),G(20)]);
    else if(e.type==='SEQEND'&&polyl){if(polyl.pts.length>1)out.push(polyl);polyl=null;}
    else if(e.type==='CIRCLE')out.push({shape:'circle',cx:G(10),cy:G(20),r:G(40),layer});
    else if(e.type==='ARC'){const cx=G(10),cy=G(20),r=G(40),a0=G(50)*Math.PI/180;let a1=G(51)*Math.PI/180;if(a1<a0)a1+=2*Math.PI;const am=(a0+a1)/2;
      out.push({shape:'arc',pts:[[cx+r*Math.cos(a0),cy+r*Math.sin(a0)],[cx+r*Math.cos(am),cy+r*Math.sin(am)],[cx+r*Math.cos(a1),cy+r*Math.sin(a1)]],layer});}
    else if(e.type==='TEXT'||e.type==='MTEXT'){const t=(e.g.find(q=>q[0]===1)||[0,''])[1].replace(/\\P/g,'\n').replace(/\{|\}|\\[A-Za-z][^;]*;/g,'');if(t)out.push({shape:'text',x:G(10),y:G(20),h:G(40)||G(41)||8,text:t,layer});}}
  return {ents:out,units};}
const DXF_UNITS=[['in','Inches'],['ft','Feet'],['mm','Millimeters'],['cm','Centimeters'],['m','Meters']];
function importDXF(p,lvId,text,unit,origin={x:0,y:0}){const {ents,units}=parseDXF(text);const u=unit||({1:'in',2:'ft',4:'mm',5:'cm',6:'m'}[units]||'in');const k={in:1,ft:12,mm:1/25.4,cm:1/2.54,m:39.3701}[u];
  // DXF y points up; the plan's y points down
  const T=([x,y])=>[origin.x+x*k,origin.y-y*k];let L=layersOf(p);const lmap={};
  for(const e of ents){const nm='DXF '+e.layer;if(!lmap[e.layer]){let l=L.find(x=>x.name===nm);if(!l){l={id:'L-X'+Math.random().toString(36).slice(2,6).toUpperCase(),name:nm,color:'#6a6a6a'};L=[...L,l];}lmap[e.layer]=l.id;}}
  const cad=[],annos=[];for(const e of ents){const layer=lmap[e.layer];
    if(e.shape==='circle'){const [cx,cy]=T([e.cx,e.cy]);cad.push({id:uid('cd'),level:lvId,shape:'circle',cx,cy,r:e.r*k,pts:[],layer,weight:0.25,dash:'solid',status:'existing'});}
    else if(e.shape==='text'){const [x,y]=T([e.x,e.y]);annos.push({id:uid('an'),level:lvId,x,y,text:e.text,size:Math.max(6,Math.min(18,e.h*k/1.5)),layer});}
    else cad.push({id:uid('cd'),level:lvId,shape:e.shape,pts:e.pts.map(T),closed:e.closed,layer,weight:0.25,dash:'solid',status:'existing'});}
  // move the drawing next to the house if it landed far away
  const xs=cad.flatMap(c=>c.shape==='circle'?[c.cx]:c.pts.map(q=>q[0])),ys=cad.flatMap(c=>c.shape==='circle'?[c.cy]:c.pts.map(q=>q[1]));let dx=0,dy=0;
  if(xs.length&&p.walls.length){const B=planBounds(p,lvId);const x0=Math.min(...xs),y0=Math.min(...ys);if(Math.abs(x0-B.x0)>12000||Math.abs(y0-B.y0)>12000){dx=B.x0-x0;dy=B.y1+120-y0;}}
  else if(xs.length){dx=-Math.min(...xs);dy=-Math.min(...ys);}
  const mv=c=>c.shape==='circle'?{...c,cx:c.cx+dx,cy:c.cy+dy}:{...c,pts:c.pts.map(([x,y])=>[x+dx,y+dy])};
  return {p:{...p,layers:L,cad:[...(p.cad||[]),...cad.map(mv)],annos:[...(p.annos||[]),...annos.map(a=>({...a,x:a.x+dx,y:a.y+dy}))]},n:cad.length+annos.length,unit:u};}
function DXFImportModal({p,levelId,commit,onClose}){const [unit,setUnit]=useState('');const [msg,setMsg]=useState(null);const [walls,setWalls]=useState(false);
  const pick=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const res=importDXF(p,levelId,String(r.result),unit||null);if(!res.n){setMsg({ok:false,t:'No lines, arcs, circles or text were found. Save the drawing as an ASCII DXF (not binary or DWG).'});return;}
      let q=res.p;if(walls){const added=q.cad.slice((p.cad||[]).length).filter(c=>c.shape==='line'||c.shape==='pline');q=linesToWalls(q,levelId,added);}commit(q);setMsg({ok:true,t:`Imported ${res.n} items in ${DXF_UNITS.find(u=>u[0]===res.unit)[1].toLowerCase()} onto "DXF …" layers. Turn layers on and off with Display.`});}catch(err){setMsg({ok:false,t:'Could not read that file: '+err.message});}};r.readAsText(f);e.target.value='';};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-label="Import DXF">
    <h2>Import a DXF drawing</h2><p className="note">Brings in lines, polylines, arcs, circles and text from AutoCAD, LibreCAD, a surveyor's plat or a scanned plan traced in CAD. DWG files need to be saved as DXF first (free in LibreCAD or ODA File Converter).</p>
    <${Field} label="Drawing units" id="dxf-u"><${Sel} id="dxf-u" value=${unit} onChange=${setUnit} options=${[['','Read from the file (inches if not set)'],...DXF_UNITS]}/><//>
    <label className="check"><input type="checkbox" checked=${walls} onChange=${e=>setWalls(e.target.checked)}/> Turn parallel line pairs into walls (CAD-to-walls)</label>
    <div className="row"><label className="btn primary" htmlFor="dxf-file">Choose DXF file…</label><input id="dxf-file" type="file" accept=".dxf" hidden onChange=${pick}/><span className="spacer"></span><button className="btn" onClick=${onClose}>Done</button></div>
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}</div></div>`;}
// CAD-to-walls: pairs of parallel lines 3.5" to 12" apart become a wall on their centerline
function linesToWalls(p,lvId,list){const segs=[];for(const c of list){for(let i=0;i+1<c.pts.length;i++)segs.push({cid:c.id,a:{x:c.pts[i][0],y:c.pts[i][1]},b:{x:c.pts[i+1][0],y:c.pts[i+1][1]}});}
  const used=new Set();const walls=[];
  for(let i=0;i<segs.length;i++){if(used.has(i))continue;const s=segs[i];const L=dist(s.a,s.b);if(L<12)continue;const d={x:(s.b.x-s.a.x)/L,y:(s.b.y-s.a.y)/L};let best=null;
    for(let j=0;j<segs.length;j++){if(j===i||used.has(j))continue;const t=segs[j];const L2=dist(t.a,t.b);if(L2<12)continue;const d2={x:(t.b.x-t.a.x)/L2,y:(t.b.y-t.a.y)/L2};if(Math.abs(d.x*d2.y-d.y*d2.x)>0.02)continue;
      const off=Math.abs((t.a.x-s.a.x)*-d.y+(t.a.y-s.a.y)*d.x);if(off<3.4||off>12.5)continue;const u0=(t.a.x-s.a.x)*d.x+(t.a.y-s.a.y)*d.y,u1=(t.b.x-s.a.x)*d.x+(t.b.y-s.a.y)*d.y;const ov=Math.min(L,Math.max(u0,u1))-Math.max(0,Math.min(u0,u1));if(ov<L*0.5)continue;if(!best||off<best.off)best={j,off,t};}
    if(!best)continue;used.add(i);used.add(best.j);const n={x:-d.y,y:d.x};const sg=((best.t.a.x-s.a.x)*n.x+(best.t.a.y-s.a.y)*n.y)>0?1:-1;const h=best.off/2*sg;
    walls.push({id:uid('w'),level:lvId,x1:s.a.x+n.x*h,y1:s.a.y+n.y*h,x2:s.b.x+n.x*h,y2:s.b.y+n.y*h,thick:Math.round(best.off*4)/4,kind:best.off>=5.4?'exterior':'interior',bearing:best.off>=5.4,height:null,status:'existing'});}
  // drop drafting lines that were fully turned into walls
  const gone=new Set(list.filter(c=>segs.every((sg,i)=>sg.cid!==c.id||used.has(i))).map(c=>c.id));
  return {...p,walls:[...p.walls,...walls],cad:(p.cad||[]).filter(c=>!gone.has(c.id))};}
