/* ======================= capture: photos, measurements, underlays, scans ======================= */
// Photos and scans are big, so they live in this browser's IndexedDB, keyed by project id; the project JSON keeps only references.
const DB_NAME='remodel-studio-assets';
function idb(){return new Promise((res,rej)=>{let r;try{r=indexedDB.open(DB_NAME,1);}catch(e){rej(e);return;}r.onupgradeneeded=()=>{r.result.createObjectStore('assets',{keyPath:'id'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function assetPut(a){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction('assets','readwrite');t.objectStore('assets').put(a);t.oncomplete=()=>res(a);t.onerror=()=>rej(t.error);});}
async function assetDel(id){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction('assets','readwrite');t.objectStore('assets').delete(id);t.oncomplete=()=>res();t.onerror=()=>rej(t.error);});}
async function assetList(project){const db=await idb();return new Promise((res,rej)=>{const out=[];const t=db.transaction('assets','readonly');const c=t.objectStore('assets').openCursor();c.onsuccess=()=>{const cur=c.result;if(cur){if(cur.value.project===project)out.push(cur.value);cur.continue();}else res(out);};c.onerror=()=>rej(c.error);});}
async function assetGet(id){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction('assets','readonly');const r=t.objectStore('assets').get(id);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error);});}
// object URLs for blobs, created once
const urlCache=new Map();const blobURL=(id,blob)=>{if(!urlCache.has(id))urlCache.set(id,URL.createObjectURL(blob));return urlCache.get(id);};
function useAssets(projectId){
  const [list,setList]=useState([]);const [err,setErr]=useState(null);
  const reload=useCallback(()=>{assetList(projectId).then(setList).catch(()=>setErr('This browser is not letting the app store photos (private window or storage turned off).'));},[projectId]);
  useEffect(()=>{reload();},[reload]);
  return {list,reload,err};
}
async function downscale(file,maxPx=2000){
  try{const bmp=await createImageBitmap(file);const k=Math.min(1,maxPx/Math.max(bmp.width,bmp.height));const c=document.createElement('canvas');c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);
    c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);return await new Promise(r=>c.toBlob(b=>r({blob:b,w:c.width,h:c.height}),'image/jpeg',0.86));}
  catch(e){return {blob:file,w:0,h:0};}
}

/* ---- building geometry from measurements ---- */
const SIDE_ORDER=['back','right','behind','left']; // clockwise from the top of the plan
function freeSpot(p,levelId,W){const ws=p.walls.filter(w=>w.level===levelId);if(!ws.length)return {x:0,y:0};let x1=-1e9,y0=1e9;for(const w of ws){x1=Math.max(x1,w.x1,w.x2);y0=Math.min(y0,w.y1,w.y2);}return {x:Math.ceil((x1+72)/12)*12,y:Math.round(y0/12)*12};}
function buildRoom(p,levelId,spec){
  const ext=WALL_PRESETS.ext4.thick, int=WALL_PRESETS.int4.thick; const th=s=>spec.exterior?.[s]?ext:int;
  const W=spec.width+(th('left')+th('right'))/2, D=spec.depth+(th('back')+th('behind'))/2;
  const o=spec.at||freeSpot(p,levelId,W); const x0=o.x,y0=o.y;
  const corners=[{x:x0,y:y0},{x:x0+W,y:y0},{x:x0+W,y:y0+D},{x:x0,y:y0+D}];
  const walls=[],openings=[];
  SIDE_ORDER.forEach((side,i)=>{const a=corners[i],b=corners[(i+1)%4];const pre=spec.exterior?.[side]?WALL_PRESETS.ext4:WALL_PRESETS.int4;
    // reuse an existing wall that already sits on this line
    const id=uid('w');walls.push({id,level:levelId,x1:a.x,y1:a.y,x2:b.x,y2:b.y,thick:pre.thick,kind:pre.kind,bearing:pre.bearing,height:spec.height||null,status:spec.status||'existing',side});
    const prevT=th(SIDE_ORDER[(i+3)%4]);
    for(const op of (spec.openings||[]).filter(q=>q.side===side)){const width=op.width||36;
      openings.push(op.type==='door'?{id:uid('op'),wall:id,type:'door',pos:(op.offset||0)+prevT/2+width/2,width,height:op.height||80,sill:0,hinge:0,swing:1,status:spec.status||'existing'}
        :{id:uid('op'),wall:id,type:'window',pos:(op.offset||0)+prevT/2+width/2,width,height:op.height||48,sill:op.sill??36,operation:op.operation||'double-hung',status:spec.status||'existing'});}});
  const room={id:uid('rm'),level:levelId,name:spec.name||'Room',use:spec.use||'living',pts:corners.map(c=>[c.x,c.y])};
  const lv=lvlOf(p,levelId); let levels=p.levels; if(spec.height&&lv&&!p.walls.some(w=>w.level===levelId))levels=p.levels.map(l=>l.id===levelId?{...l,height:spec.height}:l);
  return {project:{...p,levels,walls:[...p.walls,...walls.map(({side,...w})=>w)],openings:[...p.openings,...openings],rooms:[...p.rooms,room]},room};
}
// openings measured on the outside of a wall, offsets from the left end as you face the wall
function applyFacade(p,wall,spec){
  const ext=p.walls.filter(w=>w.level===wall.level&&w.kind==='exterior');const n=ext.length>2?outwardNormal(ext,wall):{x:-wdir(wall).y,y:wdir(wall).x};
  const f={x:-n.x,y:-n.y};const L={x:f.y,y:-f.x};const d=wdir(wall);const fromEnd=(d.x*L.x+d.y*L.y)>0;const len=wlen(wall);
  const ops=(spec.openings||[]).map(op=>{const width=op.width||36;let pos=(op.offset||0)+width/2;if(fromEnd)pos=len-pos;pos=Math.max(width/2,Math.min(len-width/2,pos));
    return op.type==='door'?{id:uid('op'),wall:wall.id,type:'door',pos,width,height:op.height||80,sill:0,hinge:0,swing:-1,status:spec.status||'existing'}:{id:uid('op'),wall:wall.id,type:'window',pos,width,height:op.height||48,sill:op.sill??36,operation:op.operation||'double-hung',status:spec.status||'existing'};});
  let q={...p,openings:[...p.openings,...ops]};
  if(spec.wallLength&&Math.abs(spec.wallLength-len)>0.5)q=setWallLength(q,wall,spec.wallLength);
  return q;
}

/* ---- point clouds (PLY from COLMAP, Polycam, etc.) ---- */
function parsePLY(buf){
  const bytes=new Uint8Array(buf);let hdrEnd=-1;const dec=new TextDecoder();
  for(let i=0;i<Math.min(bytes.length,65536)-10;i++){if(bytes[i]===101&&dec.decode(bytes.subarray(i,i+10))==='end_header'){hdrEnd=i+10;while(bytes[hdrEnd]===13||bytes[hdrEnd]===10){hdrEnd++;if(bytes[hdrEnd-1]===10)break;}break;}}
  if(hdrEnd<0)throw new Error('This file is not a PLY point cloud.');
  const hdr=dec.decode(bytes.subarray(0,hdrEnd)).split(/\r?\n/);const fmt=(hdr.find(l=>l.startsWith('format'))||'').split(' ')[1];
  let count=0,props=[],inVertex=false;
  for(const l of hdr){const t=l.trim().split(/\s+/);if(t[0]==='element'){inVertex=t[1]==='vertex';if(inVertex)count=+t[2];}else if(t[0]==='property'&&inVertex&&t[1]!=='list')props.push({type:t[1],name:t[2]});}
  const size={char:1,uchar:1,int8:1,uint8:1,short:2,ushort:2,int16:2,uint16:2,int:4,uint:4,int32:4,uint32:4,float:4,float32:4,double:8,float64:8};
  const idx=n=>props.findIndex(p=>p.name===n);const ix=idx('x'),iy=idx('y'),iz=idx('z'),ir=idx('red'),ig=idx('green'),ib=idx('blue');
  if(ix<0||iy<0||iz<0)throw new Error('The PLY file has no x, y, z points.');
  const step=Math.max(1,Math.ceil(count/150000));const n=Math.ceil(count/step);const P=new Float32Array(n*3),C=new Uint8Array(n*3);let k=0;
  if(fmt==='ascii'){const lines=dec.decode(bytes.subarray(hdrEnd)).split(/\r?\n/);for(let i=0;i<count&&i<lines.length;i+=step){const v=lines[i].trim().split(/\s+/).map(Number);P[k*3]=v[ix];P[k*3+1]=v[iy];P[k*3+2]=v[iz];if(ir>=0){C[k*3]=v[ir];C[k*3+1]=v[ig];C[k*3+2]=v[ib];}k++;}}
  else{const le=fmt!=='binary_big_endian';const dv=new DataView(buf);const offs=[];let stride=0;for(const p of props){offs.push(stride);stride+=size[p.type]||4;}
    const rd=(o,t)=>t==='float'||t==='float32'?dv.getFloat32(o,le):t==='double'||t==='float64'?dv.getFloat64(o,le):t==='uchar'||t==='uint8'?dv.getUint8(o):t==='char'||t==='int8'?dv.getInt8(o):t==='short'||t==='int16'?dv.getInt16(o,le):t==='ushort'||t==='uint16'?dv.getUint16(o,le):t==='uint'||t==='uint32'?dv.getUint32(o,le):dv.getInt32(o,le);
    for(let i=0;i<count;i+=step){const b=hdrEnd+i*stride;if(b+stride>buf.byteLength)break;P[k*3]=rd(b+offs[ix],props[ix].type);P[k*3+1]=rd(b+offs[iy],props[iy].type);P[k*3+2]=rd(b+offs[iz],props[iz].type);
      if(ir>=0){C[k*3]=rd(b+offs[ir],props[ir].type);C[k*3+1]=rd(b+offs[ig],props[ig].type);C[k*3+2]=rd(b+offs[ib],props[ib].type);}k++;}}
  return {points:P.slice(0,k*3),colors:ir>=0?C.slice(0,k*3):null,count:k,total:count};
}
// cloud → plan inches using the project's cloud transform (scale to inches, up axis, rotation, offset)
function cloudToPlan(cl,t){const n=cl.points.length/3;const out=new Float32Array(n*3);const s=t.scale||39.37;const a=(t.rot||0)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);
  for(let i=0;i<n;i++){let x=cl.points[i*3],y=cl.points[i*3+1],z=cl.points[i*3+2];let px,py,h;
    if(t.up==='z'){px=x;py=-y;h=z;}else if(t.up==='-y'){px=x;py=z;h=-y;}else{px=x;py=z;h=y;}
    px*=s;py*=s;h*=s;out[i*3]=px*ca-py*sa+(t.dx||0);out[i*3+1]=px*sa+py*ca+(t.dy||0);out[i*3+2]=h+(t.dz||0);}
  return out;}
// top-down picture of the points between two heights, for tracing walls
function cloudSliceImage(planPts,zLo,zHi){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const n=planPts.length/3;for(let i=0;i<n;i++){const z=planPts[i*3+2];if(z<zLo||z>zHi)continue;const x=planPts[i*3],y=planPts[i*3+1];x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  if(x0>x1)return null;const W=1024,k=W/Math.max(1,Math.max(x1-x0,y1-y0));const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil((x1-x0)*k));c.height=Math.max(1,Math.ceil((y1-y0)*k));
  const g=c.getContext('2d');g.fillStyle='rgba(200,60,40,0.55)';for(let i=0;i<n;i++){const z=planPts[i*3+2];if(z<zLo||z>zHi)continue;g.fillRect((planPts[i*3]-x0)*k,(planPts[i*3+1]-y0)*k,1.6,1.6);}
  return {url:c.toDataURL('image/png'),x:x0,y:y0,w:x1-x0,h:y1-y0};
}

/* ---- the Capture screen ---- */
const ROOM_PROMPT=`You are helping someone measure a room so it can be drawn to scale for a remodel plan. The photos show one room from the inside.
Name the walls by where they are from the first photo's camera position: "back" = the wall the camera faces, "left", "right", and "behind" = the wall behind the camera (only if another photo shows it).
List every door and window on those walls, in left-to-right order as you face each wall from inside the room.
Reply with only JSON in this shape:
{"roomName": string, "use": one of "living","bedroom","kitchen","dining","bath","hall","laundry","closet","garage","other",
 "summary": one short sentence,
 "walls": [{"side": "back"|"left"|"right"|"behind", "exterior": true if it looks like an outside wall (windows to the outdoors)}],
 "openings": [{"side": "back"|"left"|"right"|"behind", "type": "door"|"window", "label": short description, "operation": for windows one of "double-hung","casement","slider","fixed","awning"}],
 "notes": [things worth measuring or checking, such as a beam, soffit, sloped ceiling, step or damage; at most 5]}`;
const FACADE_PROMPT=`You are helping someone measure the outside of a house so it can be drawn to scale for a remodel plan. The photos show one side of the house from outside.
List every door and window on that side in left-to-right order as you face the wall.
Reply with only JSON in this shape:
{"summary": one short sentence, "openings": [{"type": "door"|"window", "label": short description, "operation": for windows one of "double-hung","casement","slider","fixed","awning"}],
 "notes": [things worth measuring or checking, such as roof overhang, porch, steps, siding type, damage; at most 5]}`;
function questionsFor(kind,a){
  const q=[];
  if(kind==='room'){q.push({id:'width',label:'Room width: back wall, inside corner to corner',bare:'ft'},{id:'depth',label:'Room depth: left wall, inside corner to corner',bare:'ft'},{id:'height',label:'Ceiling height',bare:'ft'});}
  else q.push({id:'wallLength',label:'Wall length, outside corner to corner',bare:'ft'});
  (a.openings||[]).forEach((o,i)=>{const nm=`${o.type==='door'?'Door':'Window'} ${i+1}${o.side?` (${o.side} wall)`:''}: ${o.label||''}`;
    q.push({id:`o${i}.offset`,label:`${nm}: left corner to the edge of the opening`,bare:'in',group:nm});
    q.push({id:`o${i}.width`,label:`${nm}: width`,bare:'in',group:nm});q.push({id:`o${i}.height`,label:`${nm}: height`,bare:'in',group:nm});
    if(o.type==='window')q.push({id:`o${i}.sill`,label:`${nm}: floor to sill`,bare:'in',group:nm});});
  return q;
}
function CaptureView({p,commit,sel,setSel,levelId,setLevelId,setMode,libCtx}){
  const pid=p.id||'default'; const assets=useAssets(pid);
  const [tab,setTab]=useState('measure');
  return html`<div className="matview"><div className="matinner">
    <div className="mathead"><div><h2>Capture</h2><p className="note">Turn photos and tape measurements into the model. Photos and scans are kept in this browser only; the project file stores where they are pinned.</p></div></div>
    <div className="seg" role="tablist">${[['measure','Measure, color and trim from photos'],['assistant','Photo assistant'],['room','Room from measurements'],['photos','Photos'],['underlay','Underlay and scans']].map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${tab===k} className=${tab===k?'on':''} onClick=${()=>setTab(k)}>${l}</button>`)}</div>
    ${assets.err?html`<div className="msg err">${assets.err}</div>`:null}
    ${tab==='measure'?html`<${PhotoMeasure} p=${p} commit=${commit} sel=${sel} assets=${assets} libCtx=${libCtx}/>`:null}
    ${tab==='assistant'?html`<${PhotoAssistant} p=${p} commit=${commit} sel=${sel} levelId=${levelId} assets=${assets} setMode=${setMode} setSel=${setSel}/>`:null}
    ${tab==='room'?html`<${RoomWizard} p=${p} commit=${commit} levelId=${levelId} setMode=${setMode} setSel=${setSel}/>`:null}
    ${tab==='photos'?html`<${PhotoGallery} p=${p} commit=${commit} sel=${sel} assets=${assets}/>`:null}
    ${tab==='underlay'?html`<${UnderlayPanel} p=${p} commit=${commit} levelId=${levelId} assets=${assets} setMode=${setMode}/>`:null}
  </div></div>`;
}
function MeasureForm({questions,values,setValues}){
  let last=null;
  return html`<div className="qform">${questions.map(q=>{const head=q.group&&q.group!==last?(last=q.group,html`<h4 key=${'h'+q.id}>${q.group}</h4>`):null;
    return html`${head}<div key=${q.id} className="field"><label htmlFor=${'q-'+q.id.replace('.','-')}>${q.group?q.label.replace(q.group+': ',''):q.label}</label><${LenInput} id=${'q-'+q.id.replace('.','-')} value=${values[q.id]??null} bare=${q.bare} placeholder=${q.bare==='ft'?'e.g. 12\'6"':'e.g. 36"'} onChange=${v=>setValues(s=>({...s,[q.id]:v}))}/></div>`;})}</div>`;
}
function PhotoAssistant({p,commit,sel,levelId,assets,setMode,setSel}){
  const [kind,setKind]=useState('room'); const [files,setFiles]=useState([]); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState(null);
  const [ans,setAns]=useState(null); const [vals,setVals]=useState({}); const [sampleFn,setSampleFn]=useState(undefined); const ctl=useRef(null);
  useEffect(()=>{let live=true;(async()=>{try{const s=window.claude&&window.claude.use?await window.claude.use('sample'):null;if(!s){if(live)setSampleFn(null);return;}const lim=await s.limits().catch(()=>null);if(live)setSampleFn(()=>lim&&lim.images?s:null);}catch(e){if(live)setSampleFn(null);}})();return ()=>{live=false;};},[]);
  const wall=sel&&sel.kind==='wall'?p.walls.find(w=>w.id===sel.id):null;
  const analyze=async()=>{if(!sampleFn||!files.length)return;setBusy(true);setMsg(null);setAns(null);ctl.current=new AbortController();
    try{const imgs=[];for(const f of files.slice(0,4))imgs.push((await downscale(f,1600)).blob);
      const a=await sampleFn.json(kind==='room'?ROOM_PROMPT:FACADE_PROMPT,{images:imgs,signal:ctl.current.signal});
      if(!a||!Array.isArray(a.openings))throw {code:'invalid_json'};setAns(a);setVals({});
      for(const f of files){const d=await downscale(f);await assetPut({id:uid('ph'),project:p.id||'default',kind:'photo',blob:d.blob,w:d.w,h:d.h,name:f.name,date:new Date().toISOString(),note:a.summary||'',pin:null});}assets.reload();}
    catch(e){console.warn('photo analysis failed',e);const c=e&&e.code;setMsg({ok:false,t:c==='not_granted'?'Claude was not allowed to look at the photos. Use “Room from measurements” instead.':c==='rate_limited'?'Too many requests right now. Try again in a minute.':c==='cancelled'?'Stopped.':c==='image_rejected'?'One of the photos could not be read. Try a JPEG or PNG.':'The photos could not be analyzed. Try clearer photos, or use “Room from measurements”.'});}
    setBusy(false);};
  const qs=ans?questionsFor(kind,ans):[];const missing=qs.filter(q=>vals[q.id]==null&&!/sill$/.test(q.id)&&!/offset$/.test(q.id));
  const build=()=>{
    const ops=(ans.openings||[]).map((o,i)=>({side:o.side||'back',type:o.type==='door'?'door':'window',operation:o.operation,offset:vals[`o${i}.offset`]??0,width:vals[`o${i}.width`],height:vals[`o${i}.height`],sill:vals[`o${i}.sill`]}));
    if(kind==='room'){const ext={};for(const w of (ans.walls||[]))ext[w.side]=!!w.exterior;
      const {project,room}=buildRoom(p,levelId,{name:ans.roomName,use:ROOM_USES.some(u=>u[0]===ans.use)?ans.use:'other',width:vals.width,depth:vals.depth,height:vals.height,exterior:ext,openings:ops,status:'existing'});
      commit(project);setSel({kind:'room',id:room.id});setMsg({ok:true,t:`${ans.roomName||'Room'} added to the plan as existing work. The back wall is at the top of the plan.`});}
    else{if(!wall){setMsg({ok:false,t:'Select the outside wall in the plan first, then come back.'});return;}
      commit(applyFacade(p,wall,{wallLength:vals.wallLength,openings:ops,status:'existing'}));setMsg({ok:true,t:`${ops.length} opening${ops.length===1?'':'s'} added to the selected wall.`});}
  };
  return html`<section className="capcard">
    <p className="note">Pick one to four photos. Claude looks at them, lists the walls, doors and windows it sees, and asks only for the measurements needed to draw them to scale.${sampleFn===null?'':' Each analysis uses your own Claude usage.'}</p>
    ${sampleFn===null?html`<div className="msg err">The photo assistant runs inside Claude only. In this view, use “Room from measurements”, which asks the same questions without the photo step.</div>`:null}
    <div className="row"><div className="seg">${[['room','A room, from inside'],['facade','A side of the house, from outside']].map(([k,l])=>html`<button key=${k} className=${kind===k?'on':''} onClick=${()=>{setKind(k);setAns(null);}}>${l}</button>`)}</div></div>
    ${kind==='facade'?html`<p className="note">${wall?html`Openings will be added to the selected wall (${fmtLen(wlen(wall))}).`:'Select the outside wall in the plan first; openings are added to it.'}</p>`:null}
    <div className="row"><label className="btn" htmlFor="cap-files">Choose photos…</label><input id="cap-files" type="file" accept="image/*" multiple hidden onChange=${e=>{setFiles([...e.target.files].slice(0,4));setAns(null);}}/>
      <span className="note">${files.length?files.length+' photo'+(files.length>1?'s':'')+' chosen':'No photos yet'}</span>
      <button className="btn primary" disabled=${!sampleFn||!files.length||busy} onClick=${analyze}>${busy?'Looking at the photos…':'Analyze photos'}</button>${busy?html`<button className="btn" onClick=${()=>ctl.current&&ctl.current.abort()}>Stop</button>`:null}</div>
    ${files.length?html`<div className="thumbs">${files.map((f,i)=>html`<img key=${i} src=${blobURL('f'+i+f.name+f.size,f)} alt=${'Photo '+(i+1)}/>`)}</div>`:null}
    ${ans?html`<div className="capresult"><h3>${ans.roomName||'What the photos show'}</h3><p>${ans.summary||''}</p>
      ${(ans.notes||[]).length?html`<ul className="note">${ans.notes.map((n,i)=>html`<li key=${i}>${n}</li>`)}</ul>`:null}
      <h3>Measurements needed</h3><p className="note">Measure with a tape for 1-inch accuracy. Values from the iPhone Measure app can be pasted in. Offsets and sills left blank are treated as 0 and 36".</p>
      <${MeasureForm} questions=${qs} values=${vals} setValues=${setVals}/>
      <div className="row"><button className="btn primary" disabled=${missing.length>0} onClick=${build}>${kind==='room'?'Add room to plan':'Add openings to wall'}</button>${missing.length?html`<span className="note">${missing.length} measurement${missing.length>1?'s':''} still needed</span>`:null}</div></div>`:null}
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}${msg.ok?html` <button className="btn" onClick=${()=>setMode('split')}>Open the plan</button>`:null}</div>`:null}
  </section>`;
}
function RoomWizard({p,commit,levelId,setMode,setSel}){
  const [name,setName]=useState('Room');const [use,setUse]=useState('living');const [vals,setVals]=useState({});const [ops,setOps]=useState([]);const [ext,setExt]=useState({back:true,left:false,right:false,behind:false});const [status,setStatus]=useState('existing');const [msg,setMsg]=useState(null);
  const addOp=t=>setOps(o=>[...o,{id:uid('q'),side:'back',type:t,offset:null,width:t==='door'?36:36,height:t==='door'?80:48,sill:t==='door'?0:36,operation:'double-hung'}]);
  const upOp=(id,patch)=>setOps(o=>o.map(x=>x.id===id?{...x,...patch}:x));
  const go=()=>{if(!(vals.width>0&&vals.depth>0)){setMsg({ok:false,t:'Enter the room width and depth.'});return;}
    const {project,room}=buildRoom(p,levelId,{name,use,width:vals.width,depth:vals.depth,height:vals.height,exterior:ext,openings:ops,status});commit(project);setSel({kind:'room',id:room.id});setMsg({ok:true,t:`${name} added to the plan.`});};
  return html`<section className="capcard">
    <p className="note">Measure one room at a time from the inside. Stand facing the wall you call “back”; it goes at the top of the plan. Offsets are from the left inside corner as you face each wall.</p>
    <div className="grid2 capgrid"><label>Room name<input id="rw-name" className="inp" value=${name} onChange=${e=>setName(e.target.value)}/></label>
      <label>Use<${Sel} id="rw-use" value=${use} onChange=${setUse} options=${ROOM_USES}/></label>
      <label>Width (back wall)<${LenInput} id="rw-w" value=${vals.width??null} bare="ft" placeholder="e.g. 12'6&quot;" onChange=${v=>setVals(s=>({...s,width:v}))}/></label>
      <label>Depth (left wall)<${LenInput} id="rw-d" value=${vals.depth??null} bare="ft" placeholder="e.g. 11'" onChange=${v=>setVals(s=>({...s,depth:v}))}/></label>
      <label>Ceiling height<${LenInput} id="rw-h" value=${vals.height??null} bare="ft" placeholder="8'" onChange=${v=>setVals(s=>({...s,height:v}))}/></label>
      <label>Status<${Sel} id="rw-st" value=${status} onChange=${setStatus} options=${[['existing','Existing (as-built)'],['new','New construction']]}/></label></div>
    <div className="row"><span className="note">Outside walls:</span>${['back','left','right','behind'].map(s=>html`<label key=${s} className="check"><input type="checkbox" id=${'rw-ext-'+s} checked=${!!ext[s]} onChange=${e=>setExt(x=>({...x,[s]:e.target.checked}))}/> ${s}</label>`)}</div>
    <h3>Doors and windows</h3>
    ${ops.map((o,i)=>html`<div key=${o.id} className="oprow"><b>${o.type==='door'?'Door':'Window'} ${i+1}</b>
      <label>Wall<${Sel} id=${'rw-s'+o.id} value=${o.side} onChange=${v=>upOp(o.id,{side:v})} options=${[['back','Back'],['right','Right'],['behind','Behind'],['left','Left']]}/></label>
      <label>From left corner<${LenInput} id=${'rw-o'+o.id} value=${o.offset} placeholder="0" onChange=${v=>upOp(o.id,{offset:v})}/></label>
      <label>Width<${LenInput} id=${'rw-w'+o.id} value=${o.width} onChange=${v=>upOp(o.id,{width:v})}/></label>
      <label>Height<${LenInput} id=${'rw-h'+o.id} value=${o.height} onChange=${v=>upOp(o.id,{height:v})}/></label>
      ${o.type==='window'?html`<label>Sill<${LenInput} id=${'rw-sl'+o.id} value=${o.sill} onChange=${v=>upOp(o.id,{sill:v})}/></label>`:null}
      <button className="btn danger" onClick=${()=>setOps(x=>x.filter(y=>y.id!==o.id))} aria-label="Remove">✕</button></div>`)}
    <div className="row"><button className="btn" onClick=${()=>addOp('door')}>Add door</button><button className="btn" onClick=${()=>addOp('window')}>Add window</button><span className="spacer"></span><button className="btn primary" onClick=${go}>Add room to plan</button></div>
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}${msg.ok?html` <button className="btn" onClick=${()=>setMode('split')}>Open the plan</button>`:null}</div>`:null}
  </section>`;
}
function PhotoGallery({p,commit,sel,assets}){
  const photos=assets.list.filter(a=>a.kind==='photo').sort((a,b)=>b.date.localeCompare(a.date));const [msg,setMsg]=useState(null);
  const label=pin=>{if(!pin)return 'Not pinned';const o=findObj(p,pin);if(!o)return 'Pinned to a deleted item';return pin.kind==='room'?o.name:pin.kind==='wall'?`${o.kind} wall, ${fmtLen(wlen(o))}`:pin.kind==='opening'?(openingMarks(p)[o.id]||'opening'):pin.kind;};
  const add=async e=>{for(const f of e.target.files){const d=await downscale(f);await assetPut({id:uid('ph'),project:p.id||'default',kind:'photo',blob:d.blob,w:d.w,h:d.h,name:f.name,date:new Date().toISOString(),note:'',pin:sel?{...sel}:null});}assets.reload();setMsg({ok:true,t:sel?'Added and pinned to the selected item.':'Added. Select an item in the plan and use “Pin to selection”.'});};
  const upd=async(a,patch)=>{await assetPut({...a,...patch});assets.reload();};
  return html`<section className="capcard">
    <div className="row"><label className="btn primary" htmlFor="ph-add">Add photos…</label><input id="ph-add" type="file" accept="image/*" multiple hidden onChange=${add}/><span className="note">${sel?'New photos are pinned to the item selected in the plan.':'Tip: select a room or wall in the plan first to pin new photos to it.'}</span></div>
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
    ${photos.length?html`<div className="gallery">${photos.map(a=>html`<figure key=${a.id}><img src=${blobURL(a.id,a.blob)} alt=${a.note||a.name}/>
      <figcaption><div className="note"><b>${label(a.pin)}</b> · ${new Date(a.date).toLocaleDateString()}</div>
        <input className="inp" id=${'ph-n-'+a.id} placeholder="Note" value=${a.note||''} onChange=${e=>upd(a,{note:e.target.value})}/>
        <div className="row"><button className="btn" disabled=${!sel} onClick=${()=>upd(a,{pin:{...sel}})}>Pin to selection</button><button className="btn danger" onClick=${async()=>{await assetDel(a.id);assets.reload();}}>Delete</button></div></figcaption></figure>`)}</div>`
      :html`<p className="note">No photos yet. Photos you analyze with the assistant are kept here too.</p>`}
  </section>`;
}
/* ---- PDF pages as underlays (pdf.js loads only when a PDF is picked) ---- */
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',PDFJS_WORKER='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
async function loadPdfJs(){await loadScript(PDFJS);const lib=window.pdfjsLib;if(!lib)throw new Error('The PDF reader did not load. Check the internet connection and try again.');
  if(!lib.GlobalWorkerOptions.workerSrc){const inl=document.getElementById('pdfjs-worker');lib.GlobalWorkerOptions.workerSrc=inl?URL.createObjectURL(new Blob([inl.textContent],{type:'text/javascript'})):PDFJS_WORKER;}return lib;}
async function openPdf(file){const lib=await loadPdfJs();return lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;}
// renders one page so its long side is about maxPx; returns {blob,w,h,ptsW,ptsH} (points are 1/72 inch on the paper)
async function renderPdfPage(doc,n,maxPx=3600){const pg=await doc.getPage(n);const v1=pg.getViewport({scale:1});const sc=Math.min(6,maxPx/Math.max(v1.width,v1.height));const v=pg.getViewport({scale:sc});
  const c=document.createElement('canvas');c.width=Math.round(v.width);c.height=Math.round(v.height);const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
  await pg.render({canvasContext:ctx,viewport:v}).promise;const blob=await new Promise(r=>c.toBlob(r,'image/png'));return {blob,w:c.width,h:c.height,ptsW:v1.width,ptsH:v1.height};}
const PDF_SCALES=[['','I will calibrate with two points'],['48','1/4" = 1\'-0"'],['64','3/16" = 1\'-0"'],['96','1/8" = 1\'-0"'],['32','3/8" = 1\'-0"'],['24','1/2" = 1\'-0"'],['120','1" = 10\' (site)'],['240','1" = 20\' (site)'],['360','1" = 30\' (site)']];
function UnderlayPanel({p,commit,levelId,assets,setMode}){
  const u=p.underlay||null; const [msg,setMsg]=useState(null); const [pdf,setPdf]=useState(null); const [pdfPage,setPdfPage]=useState(1); const [pdfScale,setPdfScale]=useState(''); const [busy,setBusy]=useState(false); const [cal,setCal]=useState([]); const [dist,setDist]=useState(null); const imgRef=useRef(null);
  const img=u&&assets.list.find(a=>a.id===u.asset);
  const placePdf=async()=>{if(!pdf)return;setBusy(true);try{const d=await renderPdfPage(pdf.doc,pdfPage);const id=uid('ul');await assetPut({id,project:p.id||'default',kind:'underlay',blob:d.blob,w:d.w,h:d.h,name:pdf.name+' p'+pdfPage,date:new Date().toISOString()});assets.reload();
      const B=planBounds(p,levelId);let scale;const ratio=+pdfScale;
      // paper inches per pixel = ptsW/72/w; a 1/4" scale means 1 paper inch = 48 real inches
      if(ratio>0)scale=d.ptsW/72/d.w*ratio;else scale=Math.max(240,B.x1-B.x0)/d.w;
      commit({...p,underlay:{asset:id,level:levelId,x:B.x0,y:B.y0,scale,opacity:0.5,w:d.w,h:d.h}});setCal([]);
      setMsg({ok:true,t:ratio>0?`Page ${pdfPage} placed at the drawing scale (${fmtLen(d.w*scale)} across). Check it with one known dimension, then drag it into place.`:`Page ${pdfPage} placed. Now set its scale: click two points on it that you know the distance between.`});}
    catch(err){setMsg({ok:false,t:err.message||'That PDF could not be read.'});}setBusy(false);};
  const pick=async e=>{const f=e.target.files[0];if(!f)return;
    if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){setBusy(true);try{const doc=await openPdf(f);setPdf({doc,name:f.name.replace(/\.pdf$/i,''),pages:doc.numPages});setPdfPage(1);setMsg({ok:true,t:doc.numPages>1?`This PDF has ${doc.numPages} pages. Pick the page with the plan, then place it.`:'Pick the drawing scale if it is printed on the page, then place it.'});}catch(err){setMsg({ok:false,t:err.message||'That PDF could not be read.'});}setBusy(false);e.target.value='';return;}
    const d=await downscale(f,3000);const id=uid('ul');await assetPut({id,project:p.id||'default',kind:'underlay',blob:d.blob,w:d.w,h:d.h,name:f.name,date:new Date().toISOString()});assets.reload();
    const B=planBounds(p,levelId);const fitW=Math.max(240,B.x1-B.x0);commit({...p,underlay:{asset:id,level:levelId,x:B.x0,y:B.y0,scale:fitW/d.w,opacity:0.5,w:d.w,h:d.h}});setCal([]);setMsg({ok:true,t:'Image added. Now set its scale: click two points on it that you know the distance between.'});};
  const onImgClick=e=>{const r=imgRef.current.getBoundingClientRect();const px=(e.clientX-r.left)/r.width*u.w,py=(e.clientY-r.top)/r.height*u.h;setCal(c=>c.length>=2?[[px,py]]:[...c,[px,py]]);};
  const applyCal=()=>{if(cal.length<2||!(dist>0))return;const pxd=Math.hypot(cal[1][0]-cal[0][0],cal[1][1]-cal[0][1]);if(pxd<2)return;commit({...p,underlay:{...u,scale:dist/pxd}});setMsg({ok:true,t:`Scale set: ${fmtLen(u.w*dist/pxd)} across. Drag it into place in the plan with “Move underlay”.`});};
  const cloud=p.cloud||null; const [cbusy,setCbusy]=useState(false);
  const pickPLY=async e=>{const f=e.target.files[0];if(!f)return;setCbusy(true);try{const buf=await f.arrayBuffer();const cl=parsePLY(buf);const id=uid('pc');await assetPut({id,project:p.id||'default',kind:'cloud',points:cl.points,colors:cl.colors,count:cl.count,name:f.name,date:new Date().toISOString()});assets.reload();
      commit({...p,cloud:{asset:id,level:levelId,scale:39.37,up:'y',rot:0,dx:0,dy:0,dz:0,lo:12,hi:72}});setMsg({ok:true,t:`Loaded ${cl.count.toLocaleString()} points${cl.total>cl.count?` (thinned from ${cl.total.toLocaleString()})`:''}. Set its scale with a known distance below.`});}
    catch(err){setMsg({ok:false,t:err.message||'That file could not be read.'});}setCbusy(false);};
  const cup=patch=>commit({...p,cloud:{...cloud,...patch}});
  return html`<section className="capcard">
    <h3>Image or PDF underlay</h3><p className="note">Trace over a PDF of old plans, a surveyor's plat, a photo of a hand sketch, or a satellite view. It shows under the plan on ${lvlOf(p,u?u.level:levelId)?.name||'this level'}.</p>
    <div className="row"><label className="btn" htmlFor="ul-file">${busy?'Reading…':u?'Replace image or PDF…':'Add image or PDF…'}</label><input id="ul-file" type="file" accept="image/*,application/pdf,.pdf" hidden onChange=${pick}/>
      ${u?html`<button className="btn danger" onClick=${()=>commit({...p,underlay:null})}>Remove underlay</button>`:null}</div>
    ${pdf?html`<div className="pdfpick">
      ${pdf.pages>1?html`<${Field} label=${`Page (1 to ${pdf.pages})`} id="pdf-pg"><input id="pdf-pg" className="inp" type="number" min="1" max=${pdf.pages} value=${pdfPage} onChange=${e=>setPdfPage(Math.max(1,Math.min(pdf.pages,+e.target.value||1)))}/><//>`:null}
      <${Field} label="Drawing scale" id="pdf-sc"><${Sel} id="pdf-sc" value=${pdfScale} onChange=${setPdfScale} options=${PDF_SCALES}/><//>
      <div className="row"><button className="btn primary" disabled=${busy} onClick=${placePdf}>${busy?'Working…':'Place page on the plan'}</button><button className="btn" onClick=${()=>setPdf(null)}>Cancel</button></div></div>`:null}
    ${u&&img?html`<div className="calwrap"><img ref=${imgRef} src=${blobURL(img.id,img.blob)} alt="Underlay image" onClick=${onImgClick}/>${cal.map((c,i)=>html`<span key=${i} className="calpt" style=${{left:(c[0]/u.w*100)+'%',top:(c[1]/u.h*100)+'%'}}>${i+1}</span>`)}</div>
      <div className="row"><span className="note">${cal.length<2?`Click point ${cal.length+1} on the image.`:'Distance between the two points:'}</span>${cal.length===2?html`<${LenInput} id="ul-dist" value=${dist} bare="ft" placeholder="e.g. 28'" onChange=${setDist}/><button className="btn primary" disabled=${!(dist>0)} onClick=${applyCal}>Set scale</button>`:null}</div>
      <div className="grid2 capgrid"><label>Opacity<input id="ul-op" type="range" min="0.1" max="1" step="0.05" value=${u.opacity} onInput=${e=>commit({...p,underlay:{...u,opacity:+e.target.value}})}/></label>
        <label>Width on plan<${LenInput} id="ul-w" value=${u.w*u.scale} bare="ft" onChange=${v=>v>0&&commit({...p,underlay:{...u,scale:v/u.w}})}/></label></div>
      <div className="row"><button className="btn" onClick=${()=>setMode('plan')}>Open plan to trace</button></div>`:null}
    <h3>Point cloud scan</h3><p className="note">Import a PLY point cloud from COLMAP (made from your photos with the capture kit below) or from a scanning app. A slice through the walls shows on the plan for tracing, and the points show in 3D.</p>
    <div className="row"><label className="btn" htmlFor="pc-file">${cbusy?'Reading…':cloud?'Replace scan…':'Import .ply scan…'}</label><input id="pc-file" type="file" accept=".ply" hidden onChange=${pickPLY}/>
      ${cloud?html`<button className="btn danger" onClick=${()=>commit({...p,cloud:null})}>Remove scan</button>`:null}<button className="btn" onClick=${async()=>setMsg(await captureKit(p))}>Download capture kit (.zip)</button></div>
    ${cloud?html`<div className="grid2 capgrid">
      <label>Scan units<${Sel} id="pc-units" value=${String(cloud.scale)} onChange=${v=>cup({scale:+v})} options=${[['39.37','Meters'],['12','Feet'],['1','Inches'],[String(cloud.scale),'Calibrated ('+(+cloud.scale).toFixed(3)+')']]}/></label>
      <label>Up axis<${Sel} id="pc-up" value=${cloud.up} onChange=${v=>cup({up:v})} options=${[['y','Y up'],['-y','Y down (COLMAP)'],['z','Z up']]}/></label>
      <label>Rotate<${Sel} id="pc-rot" value=${String(cloud.rot)} onChange=${v=>cup({rot:+v})} options=${[0,15,30,45,60,75,90,180,270].map(a=>[String(a),a+'°'])}/></label>
      <label>Slice from floor<${LenInput} id="pc-lo" value=${cloud.lo} bare="ft" onChange=${v=>cup({lo:v})}/></label>
      <label>Slice to<${LenInput} id="pc-hi" value=${cloud.hi} bare="ft" onChange=${v=>cup({hi:v})}/></label>
</div>
      <p className="note">COLMAP scans have no true size. On the plan, use the Measure tool across something you measured with a tape (a wall, a door), then enter both numbers here.</p>
      <${ScanScale} cloud=${cloud} cup=${cup}/>`:null}
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
  </section>`;
}
const CAPTURE_README=`Remodel Studio capture kit: photos to a point cloud with COLMAP
================================================================

What it does
  Turns 40-150 overlapping photos of a room or the outside of a house into a 3D point cloud (.ply)
  you can import in Remodel Studio (Capture > Underlay and scans) and trace walls over.

You need (free)
  COLMAP 3.9 or newer for Windows with CUDA: https://github.com/colmap/colmap/releases
  Python 3.10 or newer: https://www.python.org
  Your RTX 2070 makes the dense step much faster.

Take the photos (iPhone 17e)
  - Walk slowly; every photo should overlap the last by about 70%.
  - Interior: stand in each corner and shoot the opposite walls; then shoot along each wall.
  - Exterior: two laps around the house, at about 15 ft and 30 ft.
  - Avoid mirrors, glass and bright windows; overcast light is best outside.
  - Copy the photos to a folder on the laptop, for example C:\\Scans\\living\\images

Run
  python capture.py C:\\Scans\\living\\images --colmap "C:\\COLMAP\\COLMAP.bat"
  Add --quick for a faster sparse cloud only (good enough to trace walls).

Result
  C:\\Scans\\living\\cloud.ply   import this in Remodel Studio
  Then set the scale with one wall you measured with a tape (COLMAP does not know true size).
`;
const CAPTURE_PY=`"""Remodel Studio capture helper: run COLMAP on a folder of photos and write cloud.ply.
Usage: python capture.py IMAGES_FOLDER [--colmap PATH_TO_COLMAP] [--quick]
"""
import argparse, os, shutil, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument("images")
ap.add_argument("--colmap", default=shutil.which("colmap") or shutil.which("COLMAP.bat") or "colmap")
ap.add_argument("--quick", action="store_true", help="sparse cloud only (faster)")
a = ap.parse_args()

images = os.path.abspath(a.images)
if not os.path.isdir(images):
    sys.exit("Folder not found: " + images)
work = os.path.dirname(images.rstrip("\\\\/"))
db = os.path.join(work, "database.db")
sparse = os.path.join(work, "sparse")
dense = os.path.join(work, "dense")
os.makedirs(sparse, exist_ok=True)

def run(*args):
    print(">", " ".join(args), flush=True)
    r = subprocess.run([a.colmap, *args])
    if r.returncode != 0:
        sys.exit("COLMAP step failed: " + args[0])

run("feature_extractor", "--database_path", db, "--image_path", images, "--ImageReader.single_camera", "1")
run("exhaustive_matcher", "--database_path", db)
run("mapper", "--database_path", db, "--image_path", images, "--output_path", sparse)
model = os.path.join(sparse, "0")
out = os.path.join(work, "cloud.ply")
if a.quick:
    run("model_converter", "--input_path", model, "--output_path", out, "--output_type", "PLY")
else:
    run("image_undistorter", "--image_path", images, "--input_path", model, "--output_path", dense, "--output_type", "COLMAP")
    run("patch_match_stereo", "--workspace_path", dense)
    run("stereo_fusion", "--workspace_path", dense, "--output_path", out)
print("Done:", out)
print("Import it in Remodel Studio: Capture > Underlay and scans > Import .ply scan")
`;
async function captureKit(p){await loadScript('https://cdn.jsdelivr.net/npm/fflate@0.7.4/umd/index.js');
  const zip=fflate.zipSync({'capture.py':fflate.strToU8(CAPTURE_PY),'README.txt':fflate.strToU8(CAPTURE_README)},{level:6});
  return saveFile('Remodel Studio capture kit.zip',new Blob([zip],{type:'application/zip'}));}

function ScanScale({cloud,cup}){const [a,setA]=useState(null),[b,setB]=useState(null);
  return html`<div className="row"><label className="note">Measured on plan<${LenInput} id="pc-meas" value=${a} bare="ft" onChange=${setA}/></label><label className="note">Real length<${LenInput} id="pc-true" value=${b} bare="ft" onChange=${setB}/></label>
    <button className="btn primary" disabled=${!(a>0&&b>0)} onClick=${()=>{cup({scale:cloud.scale*b/a});setA(null);setB(null);}}>Rescale scan</button></div>`;}
function PinnedPhotos({p,sel}){const {list}=useAssets(p.id||'default');const mine=list.filter(a=>a.kind==='photo'&&a.pin&&sel&&a.pin.id===sel.id);if(!mine.length)return null;
  return html`<div className="sec"><h3>Photos</h3><div className="thumbs">${mine.map(a=>html`<figure key=${a.id} className="thumbfig"><img src=${blobURL(a.id,a.blob)} alt=${a.note||a.name}/>${a.note?html`<figcaption className="note">${a.note}</figcaption>`:null}</figure>`)}</div></div>`;}
/* ---- underlay and scan on the plan ---- */
function useUnderlayImages(p,levelId){
  const [u,setU]=useState(null);const [slice,setSlice]=useState(null);const [cloudPts,setCloudPts]=useState(null);
  const ul=p.underlay;const cl=p.cloud;
  useEffect(()=>{let live=true;if(!ul||ul.level!==levelId){setU(null);return;}assetGet(ul.asset).then(a=>{if(live&&a)setU({...ul,url:blobURL(a.id,a.blob)});}).catch(()=>{});return ()=>{live=false;};},[ul&&ul.asset,ul&&ul.level,ul&&ul.x,ul&&ul.y,ul&&ul.scale,ul&&ul.opacity,levelId]);
  useEffect(()=>{let live=true;if(!cl){setSlice(null);setCloudPts(null);return;}assetGet(cl.asset).then(a=>{if(!live||!a)return;const pts=cloudToPlan({points:a.points},cl);setCloudPts({pts,colors:a.colors});const lv=lvlOf(p,cl.level);const e=(lv?lv.elevation:0);setSlice(cl.level===levelId?cloudSliceImage(pts,e+(cl.lo||12),e+(cl.hi||72)):null);}).catch(()=>{});return ()=>{live=false;};},[cl&&cl.asset,cl&&cl.scale,cl&&cl.up,cl&&cl.rot,cl&&cl.dx,cl&&cl.dy,cl&&cl.dz,cl&&cl.lo,cl&&cl.hi,cl&&cl.level,levelId]);
  return {u,slice,cloudPts};
}
