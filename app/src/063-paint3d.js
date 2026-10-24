/* ======================= clicking in 3D: select, or paint a surface ======================= */
function pick3D(st,clientX,clientY){const r=st.renderer.domElement.getBoundingClientRect();const v=new THREE.Vector2(((clientX-r.left)/r.width)*2-1,-((clientY-r.top)/r.height)*2+1);
  const rc=new THREE.Raycaster();rc.setFromCamera(v,st.camera);const hits=rc.intersectObject(st.model,true);
  const clip=st.clipPlane;for(const h of hits){if(!h.object.isMesh||!h.object.userData.tag)continue;const mats=Array.isArray(h.object.material)?h.object.material:[h.object.material];
    if(mats[0]&&mats[0].clippingPlanes&&mats[0].clippingPlanes.length&&clip.distanceToPoint(h.point)<0)continue; // cut away by the section
    const n=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld):new THREE.Vector3(0,1,0);return {tag:h.object.userData.tag,pt:{x:h.point.x/IN,y:h.point.z/IN,z:h.point.y/IN},n:{x:n.x,y:n.z,z:n.y}};}
  return null;}
// what a click lands on, in words the paint card can act on
function paintTarget(p,h){const t=h.tag;if(!t)return null;
  if(t.kind==='wall'){const w=p.walls.find(w=>w.id===t.id);if(!w)return null;if(Math.abs(h.n.z)>0.7)return {kind:'wall-top',w};
    const q={x:h.pt.x+h.n.x*10,y:h.pt.y+h.n.y*10};const room=p.rooms.find(r=>r.level===w.level&&inPoly(q.x,q.y,r.pts));
    if(room)return {kind:'room-wall',room,w};return w.kind==='exterior'?{kind:'siding',w}:{kind:'wall-color',w};}
  if(t.kind==='room'){const r=p.rooms.find(r=>r.id===t.id);return r?{kind:t.part==='ceiling'?'ceiling':'floor',room:r}:null;}
  if(t.kind==='roof'){const r=p.roofs.find(r=>r.id===t.id);return r?{kind:'roof',roof:r}:null;}
  if(t.kind==='foundation')return {kind:'foundation'};
  if(t.kind==='counter')return {kind:'counter'};
  if(t.kind==='fixture'){const f=(p.fixtures||[]).find(f=>f.id===t.id);if(!f)return null;return isCab(f)?{kind:'cabinet',f}:{kind:'fixture',f};}
  const c=COLL[t.kind];const o=c&&(p[c]||[]).find(o=>o.id===t.id);return o?{kind:'object',okind:t.kind,o}:null;}
const SWATCH_FAMS=['Whites','Greiges and beiges','Grays','Blues','Greens','Reds and oranges','Browns and wood tones','Blacks and darks'];
function Swatches({value,onPick}){return html`<div className="swatches">${SWATCH_FAMS.flatMap(f=>(COLOR_LIB[f]||[]).slice(0,6)).map(([name,hex])=>html`<button key=${hex} className=${'sw'+(value&&value.toLowerCase()===hex?' on':'')} style=${{background:hex}} title=${name} aria-label=${name} onClick=${()=>onPick(hex)}></button>`)}
  <label className="sw swc" title="Any color"><input type="color" value=${value||'#ffffff'} onChange=${e=>onPick(e.target.value)} aria-label="Any color"/></label></div>`;}
function PaintCard({p,commit,hit,onClose,pos}){const T=useMemo(()=>paintTarget(p,hit),[p,hit]);const [all,setAll]=useState(true);
  if(!T)return html`<div className="paintcard" style=${pos}><div className="row"><b>Nothing to paint here</b><span className="spacer"></span><button className="btn" onClick=${onClose}>✕</button></div></div>`;
  const updRoom=(id,patch)=>commit({...p,rooms:p.rooms.map(r=>r.id===id?{...r,...patch}:r)});
  const updWall=(w,patch)=>commit({...p,walls:p.walls.map(x=>(x.id===w.id||(all&&x.kind==='exterior'&&w.kind==='exterior'&&x.status!=='demolish'))?{...x,...patch}:x)});
  const sel=(id,label,val,opts,on)=>html`<${Field} label=${label} id=${id}><${Sel} id=${id} value=${val} onChange=${on} options=${opts}/><//>`;
  let title='',body=null;
  if(T.kind==='siding'){title='Outside wall';body=html`${sel('pc-sd','Siding',T.w.siding||'vinyl',Object.entries(SIDING).map(([k,v])=>[k,v.label]),v=>updWall(T.w,{siding:v}))}
    <${Swatches} value=${T.w.color} onPick=${c=>updWall(T.w,{color:c})}/><label className="check"><input type="checkbox" checked=${all} onChange=${e=>setAll(e.target.checked)}/> All outside walls</label>`;}
  else if(T.kind==='wall-color'||T.kind==='wall-top'){title='Wall';body=html`<${Swatches} value=${T.w.color} onPick=${c=>commit({...p,walls:p.walls.map(x=>x.id===T.w.id?{...x,color:c}:x)})}/>`;}
  else if(T.kind==='room-wall'){title=T.room.name+' walls';body=html`${sel('pc-wf','Finish',T.room.wallFinish||'paint',Object.entries(WALL_FIN).map(([k,v])=>[k,v[0]]),v=>updRoom(T.room.id,{wallFinish:v}))}<${Swatches} value=${T.room.wallColor} onPick=${c=>updRoom(T.room.id,{wallColor:c})}/>`;}
  else if(T.kind==='floor'){title=T.room.name+' floor';body=html`${sel('pc-fl','Floor',T.room.finish||'lvp',Object.entries(FLOOR_FINISH).map(([k,v])=>[k,v.label]),v=>updRoom(T.room.id,{finish:v,floorColor:null}))}<${Swatches} value=${T.room.floorColor} onPick=${c=>updRoom(T.room.id,{floorColor:c})}/>`;}
  else if(T.kind==='ceiling'){title=T.room.name+' ceiling';body=html`${sel('pc-ce','Ceiling',T.room.ceiling||'flat',Object.entries(CEILINGS).map(([k,v])=>[k,v[0]]),v=>updRoom(T.room.id,{ceiling:v}))}<${Swatches} value=${T.room.ceilingColor} onPick=${c=>updRoom(T.room.id,{ceilingColor:c})}/>`;}
  else if(T.kind==='roof'){const rf=rafterOf(T.roof);const upR=patch=>commit({...p,roofs:p.roofs.map(r=>r.id===T.roof.id||all?{...r,...patch,...(patch.cover?{framing:{...rafterOf(r),cover:patch.cover}}:{})}:r)});
    title='Roof';body=html`${sel('pc-rc','Covering',rf.cover,Object.entries(ROOF_COVER).map(([k,v])=>[k,v.label]),v=>upR({cover:v,color:null}))}<${Swatches} value=${T.roof.color} onPick=${c=>upR({color:c})}/>${p.roofs.length>1?html`<label className="check"><input type="checkbox" checked=${all} onChange=${e=>setAll(e.target.checked)}/> All roofs</label>`:null}`;}
  else if(T.kind==='foundation'){const f=foundOf(p);const upS=patch=>commit({...p,settings:{...p.settings,foundation:{...(p.settings.foundation||{}),...patch}}});
    title='Foundation';body=html`${f.type!=='piers'?sel('pc-ff','Finish',f.finish,FOUND_FINISH,v=>upS({finish:v,color:null})):sel('pc-sk','Skirting',f.skirt,SKIRTS,v=>upS({skirt:v}))}<${Swatches} value=${f.color} onPick=${c=>upS({color:c})}/>`;}
  else if(T.kind==='cabinet'){const st=cabStyle(p,T.f);const setC=patch=>all?commit({...p,settings:{...p.settings,cab:{...(p.settings?.cab||{}),...patch}}}):commit({...p,fixtures:p.fixtures.map(f=>f.id===T.f.id?{...f,cab:{...(f.cab||{}),...patch}}:f)});
    title='Cabinets';body=html`${sel('pc-cs','Door style',st.door||st.style,CAB_STYLES,v=>setC({style:v}))}${sel('pc-cf','Finish',st.finish,CAB_FIN.map(x=>[x[0],x[1]]),v=>setC({finish:v}))}
      <label className="check"><input type="checkbox" checked=${all} onChange=${e=>setAll(e.target.checked)}/> Whole kitchen (every cabinet without its own setting)</label>`;}
  else if(T.kind==='counter'){const cs=counterSet(p);title='Countertops';body=html`${sel('pc-ct','Material',cs.mat,COUNTER_MATS.map(x=>[x[0],x[1]]),v=>commit({...p,settings:{...p.settings,counter:{...(p.settings?.counter||{}),mat:v}}}))}`;}
  else if(T.kind==='fixture'){title=fxLabel(T.f);body=html`<${Swatches} value=${T.f.color} onPick=${c=>commit({...p,fixtures:p.fixtures.map(f=>f.id===T.f.id?{...f,color:c}:f)})}/>`;}
  else if(T.kind==='object'){const d=OBJ[T.okind];title=d.title?d.title(T.o,p):d.label;const c=COLL[T.okind];body=html`<${Swatches} value=${T.o.color} onPick=${col=>commit({...p,[c]:p[c].map(o=>o.id===T.o.id?{...o,color:col}:o)})}/>`;}
  return html`<div className="paintcard" style=${pos} role="dialog" aria-label="Paint"><div className="row"><b>${title}</b><span className="spacer"></span><button className="btn" aria-label="Close" onClick=${onClose}>✕</button></div>${body}</div>`;}
