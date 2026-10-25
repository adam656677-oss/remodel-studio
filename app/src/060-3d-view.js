/* ======================= 3D view ======================= */
const IN=1/12; // inches → scene feet
function cssVar(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()||'#888';}
function View3D({project:p,levelId,sel,cutaway,showRoof,fitToken,struct,layer,sunInfo,cloud,commit,setSel,tint}){
  const host=useRef(null); const S=useRef(null); const [err,setErr]=useState(null);
  const [modelTick,setModelTick]=useState(0);useEffect(()=>{const h=()=>setModelTick(t=>t+1);window.addEventListener('rs-models',h);return ()=>window.removeEventListener('rs-models',h);},[]);
  const [paintOn,setPaintOn]=useState(false);const [hit,setHit]=useState(null);const [walk,setWalk]=useState(false); const [clip,setClip]=useState({mode:'off',v:0.5}); const [viewsOpen,setViewsOpen]=useState(false); const [framing,setFraming]=useState(false); const [vname,setVname]=useState('');
  useEffect(()=>{
    let renderer; try{renderer=new THREE.WebGLRenderer({antialias:true});}catch(e){setErr('3D view needs WebGL, which this browser has turned off.');return;}
    renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.localClippingEnabled=true;
    host.current.appendChild(renderer.domElement);
    const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(45,1,0.3,2000); camera.position.set(40,35,55);
    const controls=new THREE.OrbitControls(camera,renderer.domElement); controls.maxPolarAngle=Math.PI*0.495; controls.screenSpacePanning=true;
    const hemi=new THREE.HemisphereLight(0xeef4ff,0x8a8a78,0.42); scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xfff4e2,0.62); sun.position.set(-40,70,30); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.bias=-0.0004; scene.add(sun); scene.add(sun.target);
    const groundMat=new THREE.MeshStandardMaterial({color:0xcccccc,roughness:1});
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),groundMat); ground.rotation.x=-Math.PI/2; ground.position.y=-0.02; ground.receiveShadow=true; scene.add(ground);
    const model=new THREE.Group(); scene.add(model);
    // render after making sure the canvas still matches its box (a resize can arrive before the observer fires, e.g. when the pane layout changes)
    const syncSize=()=>{const h=host.current;if(!h)return false;const r=h.getBoundingClientRect();const w=Math.round(r.width),ht=Math.round(r.height);if(w&&ht&&(Math.abs(renderer.domElement.width-w*renderer.getPixelRatio())>1||Math.abs(renderer.domElement.height-ht*renderer.getPixelRatio())>1)){renderer.setSize(w,ht,false);camera.aspect=w/ht;camera.updateProjectionMatrix();return true;}return false;};
    const render=()=>{syncSize();renderer.render(scene,camera);};
    controls.addEventListener('change',render);
    const ro=new ResizeObserver(()=>{if(!host.current)return;const r=host.current.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();const st=S.current;if(st)st.sized=true;if(st&&!st.fitted&&st.model.children.length){fit3d(st);st.fitted=true;}render();});
    ro.observe(host.current);
    const themeSync=()=>{scene.background=new THREE.Color(cssVar('--sky'));groundMat.color.set(cssVar('--ground'));render();};
    const mq=window.matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener?.('change',themeSync);
    const mo=new MutationObserver(themeSync); mo.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    themeSync();
    S.current={renderer,scene,camera,controls,sun,hemi,model,ground,render,syncSize,themeSync,fitted:false,clipPlane:new THREE.Plane(new THREE.Vector3(0,-1,0),1e6),walk:{on:false,yaw:0,pitch:0,keys:new Set(),pos:null}};
    window.__view3d=S.current;
    return ()=>{ro.disconnect();mo.disconnect();mq.removeEventListener?.('change',themeSync);controls.dispose();renderer.dispose();renderer.domElement.remove();if(window.__view3d===S.current)window.__view3d=null;};
  },[]);

  useEffect(()=>{const st=S.current;if(st&&st.syncSize&&st.syncSize())st.render();});
  const selRef=useRef(sel);selRef.current=sel;useEffect(()=>{const st=S.current;if(!st||!st.model)return;highlight3D(st.model,sel);st.render();},[sel]);
  useEffect(()=>{const st=S.current;if(!st)return;buildModel(st,p,levelId,null,{cutaway:walk?true:cutaway,showRoof:walk?true:showRoof,struct,layer,interior:walk,ceilings:clip.mode!=='off',framing:framing&&!walk});try{applyMetalEnv(st.model,st.renderer);}catch(e){}if(tint&&typeof tint3D==='function'){try{tint3D(st.model,p,tint);}catch(e){console.error(e);}}highlight3D(st.model,selRef.current);if(st.themeSync){const bg=cssVar('--sky');if(!st.scene.background||'#'+st.scene.background.getHexString()!==bg.toLowerCase())st.themeSync();}if(st.ground){updateGround3D(st,p);const see=!!(lvlOf(p,levelId)?.basement)&&(cutaway||walk);const gm=st.ground.material;if(gm.transparent!==see){gm.transparent=see;gm.opacity=see?0.22:1;gm.depthWrite=!see;gm.needsUpdate=true;}}if(cloud&&cloud.pts){const n=cloud.pts.length/3;const arr=new Float32Array(n*3);for(let i=0;i<n;i++){arr[i*3]=cloud.pts[i*3]*IN;arr[i*3+1]=cloud.pts[i*3+2]*IN;arr[i*3+2]=cloud.pts[i*3+1]*IN;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(arr,3));let mat;if(cloud.colors){const c=new Float32Array(n*3);for(let i=0;i<n*3;i++)c[i]=cloud.colors[i]/255;g.setAttribute('color',new THREE.BufferAttribute(c,3));mat=new THREE.PointsMaterial({size:0.12,vertexColors:true});}else mat=new THREE.PointsMaterial({size:0.12,color:0xc0503a});st.model.add(new THREE.Points(g,mat));}
    applyClip(st,clip,p);if(!st.fitted&&st.sized&&!st.walk.on){fit3d(st);st.fitted=true;}st.render();applySun(st,sunInfo);st.render();if(window.__onModelBuilt)window.__onModelBuilt(st);},[tint,p,levelId,cutaway,showRoof,struct,layer,sunInfo,cloud,walk,framing,clip.mode!=='off',modelTick]);
  useEffect(()=>{const st=S.current;if(st&&fitToken&&!st.walk.on){fit3d(st);st.render();}},[fitToken]);
  useEffect(()=>{const st=S.current;if(!st)return;applyClip(st,clip,p);st.render();},[clip]);

  /* ---- walk-through ---- */
  const lvl=lvlOf(p,levelId)||p.levels[0];
  const startWalk=(at)=>{const st=S.current;if(!st)return;const W=st.walk;let x,y,yaw=0;
    if(at){x=at.x;y=at.y;yaw=at.yaw||0;W.pitch=at.pitch||0;}
    else{const r=sel&&sel.kind==='room'?p.rooms.find(r=>r.id===sel.id):null;const rooms=p.rooms.filter(q=>q.level===lvl.id);const tgt=r||rooms[0];
      if(tgt){const c=polyLabelPt(tgt.pts);x=c[0];y=c[1];}else{const B=planBounds(p,lvl.id);x=(B.x0+B.x1)/2;y=(B.y0+B.y1)/2;}W.pitch=0;}
    W.on=true;W.pos={x,y};W.yaw=yaw;st.controls.enabled=false;setWalk(true);placeWalkCam(st,lvl);st.render();host.current&&host.current.focus();};
  const stopWalk=()=>{const st=S.current;if(!st)return;st.walk.on=false;st.walk.keys.clear();st.controls.enabled=true;setWalk(false);setTimeout(()=>{fit3d(st);st.render();},0);};
  useEffect(()=>{const st=S.current;if(!st||!walk)return;const W=st.walk;let raf=0,last=performance.now();
    const step=t=>{const dt=Math.min(0.06,(t-last)/1000);last=t;const k=W.keys;let f=0,s=0,turn=0;
      if(k.has('w')||k.has('arrowup')||k.has('fwd'))f+=1;if(k.has('s')||k.has('arrowdown')||k.has('back'))f-=1;if(k.has('a')||k.has('left'))s-=1;if(k.has('d')||k.has('right'))s+=1;
      if(k.has('arrowleft')||k.has('tl'))turn+=1;if(k.has('arrowright')||k.has('tr'))turn-=1;
      if(f||s||turn){const sp=(k.has('shift')?96:48)*dt;W.yaw+=turn*1.6*dt;const fx=Math.sin(W.yaw),fy=Math.cos(W.yaw);
        const dx=(fx*f+fy*s)*sp, dy=(fy*f-fx*s)*sp;const P=W.pos;
        if(!walkBlocked(p,lvl.id,layer,P,{x:P.x+dx,y:P.y+dy}))W.pos={x:P.x+dx,y:P.y+dy};else if(!walkBlocked(p,lvl.id,layer,P,{x:P.x+dx,y:P.y}))W.pos={x:P.x+dx,y:P.y};else if(!walkBlocked(p,lvl.id,layer,P,{x:P.x,y:P.y+dy}))W.pos={x:P.x,y:P.y+dy};
        placeWalkCam(st,lvl);st.render();}
      raf=requestAnimationFrame(step);};raf=requestAnimationFrame(step);
    const kd=e=>{const t=document.activeElement;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;const key=e.key.toLowerCase();
      if(key==='escape'){stopWalk();e.preventDefault();e.stopPropagation();return;}
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(key)){W.keys.add(key);e.preventDefault();e.stopPropagation();}};
    const ku=e=>{W.keys.delete(e.key.toLowerCase());};
    const el=st.renderer.domElement;let drag=null;
    const pd=e=>{drag={x:e.clientX,y:e.clientY};try{el.setPointerCapture(e.pointerId);}catch(_){}};
    const pm=e=>{if(!drag)return;W.yaw-=(e.clientX-drag.x)*0.005;W.pitch=Math.max(-1.2,Math.min(1.2,W.pitch-(e.clientY-drag.y)*0.004));drag={x:e.clientX,y:e.clientY};placeWalkCam(st,lvl);st.render();};
    const pu=()=>{drag=null;};
    window.addEventListener('keydown',kd,true);window.addEventListener('keyup',ku,true);el.addEventListener('pointerdown',pd);el.addEventListener('pointermove',pm);el.addEventListener('pointerup',pu);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',kd,true);window.removeEventListener('keyup',ku,true);el.removeEventListener('pointerdown',pd);el.removeEventListener('pointermove',pm);el.removeEventListener('pointerup',pu);};},[walk,p,lvl&&lvl.id,layer]);
  const hold=k=>({onPointerDown:e=>{e.preventDefault();S.current&&S.current.walk.keys.add(k);},onPointerUp:()=>S.current&&S.current.walk.keys.delete(k),onPointerLeave:()=>S.current&&S.current.walk.keys.delete(k),onPointerCancel:()=>S.current&&S.current.walk.keys.delete(k)});

  /* ---- click in 3D: select the part, or paint it ---- */
  useEffect(()=>{const st=S.current;if(!st)return;const el=st.renderer.domElement;let d0=null;
    const pd=e=>{d0={x:e.clientX,y:e.clientY,b:e.button};};
    const pu=e=>{if(!d0||st.walk.on)return;const moved=Math.hypot(e.clientX-d0.x,e.clientY-d0.y);const b=d0.b;d0=null;if(moved>5||b!==0)return;const h=pick3D(st,e.clientX,e.clientY);
      if(paintOn){const r=host.current.getBoundingClientRect();setHit(h?{h,x:e.clientX-r.left,y:e.clientY-r.top}:null);return;}
      if(h&&h.tag&&h.tag.id&&setSel&&COLL[h.tag.kind])setSel({kind:h.tag.kind,id:h.tag.id});};
    el.addEventListener('pointerdown',pd);el.addEventListener('pointerup',pu);return ()=>{el.removeEventListener('pointerdown',pd);el.removeEventListener('pointerup',pu);};},[paintOn,setSel]);
  /* ---- saved views ---- */
  const views=p.views||[];
  const saveView=()=>{const st=S.current;if(!st||!commit)return;const c=st.camera;const name=vname.trim()||(st.walk.on?'Walk view ':'View ')+(views.length+1);
    const v={id:uid('vw'),name,pos:c.position.toArray(),tgt:st.walk.on?null:st.controls.target.toArray(),walk:st.walk.on?{x:st.walk.pos.x,y:st.walk.pos.y,yaw:st.walk.yaw,pitch:st.walk.pitch,level:lvl.id}:null,fov:c.fov,level:lvl.id,showRoof,cutaway,layer};
    commit({...p,views:[...views,v]});setVname('');};
  const goView=v=>{const st=S.current;if(!st)return;if(v.walk){startWalk(v.walk);return;}if(st.walk.on){st.walk.on=false;st.walk.keys.clear();st.controls.enabled=true;setWalk(false);}
    st.camera.position.fromArray(v.pos);st.controls.target.fromArray(v.tgt||[0,0,0]);st.camera.fov=v.fov||45;st.camera.updateProjectionMatrix();st.controls.update();st.render();};
  const goRef=useRef(null);goRef.current=goView;useEffect(()=>{const f=e=>{const v=(p.views||[]).find(x=>x.id===e.detail);if(v&&goRef.current)goRef.current(v);};window.addEventListener('rs-goview',f);return ()=>window.removeEventListener('rs-goview',f);},[p.views]);
  const maxH=Math.max(...p.levels.map(l=>l.elevation+l.height))+48;
  return html`<div className="pane"><div ref=${host} className="view3d" tabIndex="0"></div><span className="badge3d">${walk?'Walking · '+lvl.name:'3D model'}</span>${struct?html`<div className="legend"><span><i style=${{background:'#4caf6a'}}></i>Under 85%</span><span><i style=${{background:'#e0a43a'}}></i>85–100%</span><span><i style=${{background:'#d9534f'}}></i>Over capacity</span><span><i style=${{background:'#8fb4d9'}}></i>Bearing wall</span></div>`:null}
    <div className="v3tools">
      <button className=${'chip'+(walk?' on':'')} onClick=${()=>walk?stopWalk():startWalk()} title="Walk through at eye level (W A S D or arrow keys, drag to look, Esc to stop)">${walk?'Stop walking':'Walk through'}</button>
      <button className=${'chip'+(viewsOpen?' on':'')} onClick=${()=>setViewsOpen(!viewsOpen)} title="Save and return to camera views">Views${views.length?' ('+views.length+')':''}</button>
      <button className=${'chip'+(paintOn?' on':'')} onClick=${()=>{setPaintOn(!paintOn);setHit(null);}} title="Click any surface to change its finish or color">Paint</button>
      <button className=${'chip'+(framing?' on':'')} onClick=${()=>setFraming(!framing)} title="Show studs, plates, headers, joists and rafters">Framing</button>
      <button className="chip" onClick=${()=>openDialog('pano')} title="Make a 360° panorama from this camera spot">360°</button>
      <button className="chip" onClick=${()=>openDialog('video')} title="Record a walkthrough or fly-around video">Video</button>
      <select className="inp v3sel" value=${clip.mode} onChange=${e=>setClip({...clip,mode:e.target.value})} aria-label="Section cut"><option value="off">No section cut</option><option value="h">Cut height</option><option value="x">Cut left to right</option><option value="y">Cut front to back</option>${(p.sections||[]).map(s=>html`<option key=${s.id} value=${'s:'+s.id}>Section ${s.label}</option>`)}</select>
      ${clip.mode!=='off'?html`<button className=${'chip'+(clip.flip?' on':'')} onClick=${()=>setClip({...clip,flip:!clip.flip})} title="Keep the other side of the cut">Flip</button>`:null}
      ${clip.mode!=='off'&&!clip.mode.startsWith('s:')?html`<input type="range" className="v3range" min="0" max="1" step="0.005" value=${clip.v} onInput=${e=>setClip({...clip,v:+e.target.value})} aria-label="Section position"/>`:null}
    </div>
    ${paintOn&&hit&&commit?html`<${PaintCard} p=${p} commit=${commit} hit=${hit.h} onClose=${()=>setHit(null)} pos=${{left:Math.max(8,Math.min(hit.x+12,(host.current?.clientWidth||800)-300))+'px',top:Math.max(8,Math.min(hit.y-20,(host.current?.clientHeight||600)-340))+'px'}}/>`:null}
    ${viewsOpen?html`<div className="v3views"><div className="row"><input className="inp" placeholder=${walk?'Name this walk view':'Name this view'} value=${vname} onChange=${e=>setVname(e.target.value)} aria-label="View name"/><button className="btn primary" onClick=${saveView} disabled=${!commit}>Save view</button></div>
      ${views.length?views.map(v=>html`<div key=${v.id} className="v3view"><button className="btn" onClick=${()=>goView(v)}>${v.walk?'🚶 ':''}${v.name}</button><button className="btn danger" aria-label=${'Delete '+v.name} onClick=${()=>commit({...p,views:views.filter(x=>x.id!==v.id)})}>✕</button></div>`):html`<p className="note">Set up a camera angle, or walk to a spot, then save it. Saved views go into the board presentation.</p>`}</div>`:null}
    ${walk?html`<div className="walkpad" aria-label="Walk controls"><button className="btn" ...${hold('tl')} aria-label="Turn left">⟲</button><button className="btn" ...${hold('fwd')} aria-label="Forward">▲</button><button className="btn" ...${hold('tr')} aria-label="Turn right">⟳</button>
      <button className="btn" ...${hold('left')} aria-label="Step left">◀</button><button className="btn" ...${hold('back')} aria-label="Back">▼</button><button className="btn" ...${hold('right')} aria-label="Step right">▶</button></div>`:null}
    ${err?html`<div className="overlay"><div className="hint">${err}</div></div>`:html`<div className="overlay"><div className="hint">${paintOn&&!walk?'Paint: click any wall, floor, ceiling, roof, cabinet or other part to change its finish or color. Inside walls take the room color.':walk?'W/S or ↑/↓ to walk, A/D to step sideways, ←/→ to turn, drag to look around, hold Shift to hurry. Doors let you through; walls stop you. Esc stops walking.':'Drag to orbit, right-drag or two fingers to pan, scroll or pinch to zoom.'}</div></div>`}</div>`;
}
const EYE=64; // eye height, inches
function placeWalkCam(st,lv){const W=st.walk;const c=st.camera;c.position.set(W.pos.x*IN,(lv.elevation+EYE)*IN,W.pos.y*IN);
  const fx=Math.sin(W.yaw)*Math.cos(W.pitch),fy=Math.sin(W.pitch),fz=Math.cos(W.yaw)*Math.cos(W.pitch);c.lookAt(c.position.x+fx,c.position.y+fy,c.position.z+fz);if(c.fov!==60){c.fov=60;c.updateProjectionMatrix();}}
// walls stop you, door openings let you through
function walkBlocked(p,levelId,layer,from,to){
  for(const w of p.walls){if(w.level!==levelId||!inLayer(w.status,layer)||(w.status==='demolish'&&layer!=='existing'))continue;const pr=projSeg(to,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});if(pr.d>w.thick/2+7)continue;
    const L=wlen(w),s=pr.t*L;const inDoor=p.openings.some(o=>o.wall===w.id&&o.type==='door'&&inLayer(o.status,layer)&&o.dtype!=='overhead'&&Math.abs(s-o.pos)<o.width/2-6)||p.openings.some(o=>o.wall===w.id&&o.type==='door'&&o.dtype==='overhead'&&Math.abs(s-o.pos)<o.width/2-6);
    if(inDoor)continue;const pf=projSeg(from,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});if(pf.d<=w.thick/2+7&&pr.d>=pf.d)continue; // already stuck: allow moving away
    return true;}
  return false;}
function applyClip(st,clip,p){const pl=st.clipPlane;const box=new THREE.Box3().setFromObject(st.model);let on=clip&&clip.mode!=='off'&&!box.isEmpty();
  if(on&&clip.mode.startsWith('s:')){const s=(p||st.p||{sections:[]}).sections?.find(x=>'s:'+x.id===clip.mode);if(!s)on=false;else{const d={x:s.b.x-s.a.x,y:s.b.y-s.a.y};const L=Math.hypot(d.x,d.y)||1;const n={x:-d.y/L*(s.look||1),y:d.x/L*(s.look||1)};
      // keep what the section looks at: n·(P-A) >= 0
      pl.normal.set(n.x,0,n.y);pl.constant=-(n.x*s.a.x+n.y*s.a.y)*IN;}}
  else if(on){const v=clip.v;if(clip.mode==='h'){pl.normal.set(0,-1,0);pl.constant=box.min.y+(box.max.y-box.min.y)*v;}else if(clip.mode==='x'){pl.normal.set(-1,0,0);pl.constant=box.min.x+(box.max.x-box.min.x)*v;}else{pl.normal.set(0,0,-1);pl.constant=box.min.z+(box.max.z-box.min.z)*v;}}
  if(on&&clip.flip){pl.normal.negate();pl.constant=-pl.constant;}
  st.model.traverse(o=>{if(!o.isMesh)return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){const want=on?[pl]:null;if((m.clippingPlanes||null)!==want&&!(want&&m.clippingPlanes&&m.clippingPlanes[0]===pl)){m.clippingPlanes=want;m.clipShadows=true;m.needsUpdate=true;}}});}
function applySun(st,si){
  const box=new THREE.Box3().setFromObject(st.model); if(box.isEmpty()) return;
  const c=box.getCenter(new THREE.Vector3()), s=box.getSize(new THREE.Vector3()); const r=Math.max(s.x,s.y,s.z)*0.5+4;
  if(si&&si.on){const d=sunPlanDir(si.az,si.bearing);const el=si.alt*Math.PI/180;const v=new THREE.Vector3(d.x*Math.cos(el),Math.max(Math.sin(el),0.02),d.y*Math.cos(el));
    st.sun.position.copy(c).addScaledVector(v,r*3);st.sun.intensity=si.alt>0?0.8:0;st.hemi.intensity=si.alt>0?0.4:0.12;}
  else{st.sun.position.set(c.x-r*1.2,c.y+r*2.2,c.z+r*0.8);st.sun.intensity=0.62;st.hemi.intensity=0.42;}
  st.sun.target.position.copy(c); const sc=st.sun.shadow.camera; sc.left=-r*1.8; sc.right=r*1.8; sc.top=r*1.8; sc.bottom=-r*1.8; sc.near=0.5; sc.far=r*8; sc.updateProjectionMatrix();
}
function fit3d(st){
  const box=new THREE.Box3().setFromObject(st.model); if(box.isEmpty()) return;
  const c=box.getCenter(new THREE.Vector3()), sz=box.getSize(new THREE.Vector3()); const r=Math.max(sz.x,sz.y,sz.z)*0.5+4;
  const vf=st.camera.fov*Math.PI/180, hf=2*Math.atan(Math.tan(vf/2)*st.camera.aspect); const d=r/Math.sin(Math.min(vf,hf)/2)*0.92;
  st.controls.target.copy(c); st.camera.position.set(c.x-d*0.55,c.y+d*0.55,c.z+d*0.65); st.camera.updateProjectionMatrix(); st.controls.update();
  st.sun.position.set(c.x-r*1.2,c.y+r*2.2,c.z+r*0.8); st.sun.target.position.copy(c);
  const sc=st.sun.shadow.camera; sc.left=-r*1.6; sc.right=r*1.6; sc.top=r*1.6; sc.bottom=-r*1.6; sc.near=0.5; sc.far=r*6; sc.updateProjectionMatrix();
}
const matCache={};
function M(key,make){return matCache[key]||(matCache[key]=make());}
// which remodel layer an item shows in: 'proposed' hides demolished work, 'existing' hides new work
function inLayer(status,layer){status=status||'new';if(layer==='proposed')return status!=='demolish';if(layer==='existing')return status!=='new';return true;}
const SIDING_COLOR={vinyl:0xeeeae0,fibercement:0xb9c3c9,brick:0x9a4b35,wood:0xc9a17a,concrete:0xb4b1aa};
const ROOF_COLOR={asphalt:0x4a4f57,metal:0x6b7d86,tile:0xa5553a};
const FLOOR_COLOR={carpet:0xb8ad9c,lvp:0xb89a74,hardwood:0xa8774a,tile:0xd8d6cf,concrete:0xb9b7b0};
const ratioColor=r=>r==null?0xcfcfcf:r>1?0xd9534f:r>0.85?0xe0a43a:0x4caf6a;
// selection highlight without a rebuild: swap materials on the meshes tagged with the selected part
let _hlMat=null;function highlight3D(model,sel){if(!model)return;const ids=new Set(sel?(sel.kind==='multi'?sel.items.map(i=>i.id):[sel.id]):[]);if(!_hlMat)_hlMat=new THREE.MeshStandardMaterial({color:cssVar('--accent'),roughness:.6});
  model.traverse(o=>{if(!o.isMesh)return;if(o.userData.origMat){o.material=o.userData.origMat;delete o.userData.origMat;}const t=o.userData.tag;if(t&&t.id&&ids.has(t.id)){o.userData.origMat=o.material;o.material=_hlMat;}});}
function buildModel(st,p,levelId,sel,opts={}){
  const {cutaway=true,showRoof=true,struct=null,layer='both'}=opts;
  const g=st.model; while(g.children.length){const c=g.children.pop();c.geometry&&c.geometry.dispose();}
  const accent=cssVar('--accent');
  const std=(key,color,extra={})=>M(key,()=>new THREE.MeshStandardMaterial({color,roughness:.9,...extra}));
  const mInt=std('int',0xfbfaf6);
  const mDemo=M('demo',()=>new THREE.MeshStandardMaterial({color:0xd9534f,transparent:true,opacity:.3,depthWrite:false}));
  const mSel=new THREE.MeshStandardMaterial({color:accent,roughness:.6});
  const mDoor=std('door',0x8a5a35,{roughness:.7});
  const mGlass=M('glass',()=>new THREE.MeshStandardMaterial({color:0x9cc3e0,transparent:true,opacity:.35,roughness:.1,metalness:.1,depthWrite:false}));
  const mFrame=std('frame',0xf7f7f4,{roughness:.6});
  const mGable=M('gable',()=>new THREE.MeshStandardMaterial({color:0xf1ece2,roughness:.9,side:THREE.DoubleSide}));
  const mStair=std('stair',0xb08454,{roughness:.8});
  const mBear=std('s-bear',0x8fb4d9), mNon=std('s-non',0xe7e7e7);
  const sMat=r=>std('s-'+ratioColor(r),ratioColor(r),{roughness:.7});
  const cur=lvlOf(p,levelId)||p.levels[0];
  const shown=sortedLevels(p).filter(l=>!cutaway||l.elevation<=cur.elevation);
  CUR_TAG=null;const add=(geo,mat,x,y,z,ry=0,shadow=true)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=shadow;m.receiveShadow=true;if(CUR_TAG)m.userData.tag=CUR_TAG;g.add(m);return m;};
  const g0=Math.max(p.settings?.gradeOffset||0,...(p.ramps||[]).map(r=>rampInfo(p,r).rise));st.groundY=-g0*IN;
  if(!struct||true){const first=groundLevel(p);let done=false;CUR_TAG={kind:'foundation'};try{done=addFoundation3D(p,add,std,()=>reg3DCtx(add,std,sel,mSel,layer,struct,opts,p,first,g));}catch(e){console.error('foundation',e);}
    if(!done&&g0>0.5){const fm=std('found',0x9d9b93,{roughness:1});
    for(const w of p.walls.filter(w=>w.level===first.id&&w.kind==='exterior'&&w.status!=='demolish')){const L=wlen(w),d=wdir(w);const mid=L/2;add(new THREE.BoxGeometry((L+w.thick)*IN,g0*IN,(w.thick+1)*IN),fm,(w.x1+d.x*mid)*IN,(first.elevation-g0/2)*IN,(w.y1+d.y*mid)*IN,-Math.atan2(d.y,d.x));}}}
  for(const lv of shown){
    const ws=p.walls.filter(w=>w.level===lv.id&&inLayer(w.status,layer)); const J=wallJoins(ws.filter(w=>w.status!=='demolish')); const e0=lv.elevation;
    const extW=ws.filter(w=>w.kind==='exterior'&&w.status!=='demolish'); const lvRooms=p.rooms.filter(r=>r.level===lv.id);
    const roomAt=(x,y)=>lvRooms.find(r=>inPoly(x,y,r.pts));
    const sideMat=(w,sgn)=>{const d=wdir(w),n={x:-d.y*sgn,y:d.x*sgn};const mx=(w.x1+w.x2)/2,my=(w.y1+w.y2)/2;
      if(w.kind==='exterior'){const on=outwardNormal(extW,w);if(on.x*n.x+on.y*n.y>0){const c=w.color?hexNum(w.color):SIDING_COLOR[w.siding||'vinyl']||0xeeeae0;return std('ext-'+c,c);}}
      else if(w.color){const c=hexNum(w.color);return std('wc-'+c,c);}
      const r=roomAt(mx+n.x*(w.thick/2+4),my+n.y*(w.thick/2+4));const c=r&&r.wallColor?hexNum(r.wallColor):null;return c!=null?std('wc-'+c,c):mInt;};
    if(opts.framing){addFraming3D(p,lv,ws.filter(w=>w.status!=='demolish'),add,std,opts);
      if(showRoof)for(const r of p.roofs.filter(r=>r.level===lv.id))addRafters3D(p,r,roofBuild(r,roofTop(p,r)),add,std);continue;}
    for(const w of ws){CUR_TAG={kind:'wall',id:w.id};
      const L=wlen(w),d=wdir(w),H=wallH(p,w),t=w.thick; const ry=-Math.atan2(d.y,d.x);
      const isSel=sel&&sel.id===w.id;
      let mat=w.kind==='exterior'?(()=>{const e=w.color?hexNum(w.color):SIDING_COLOR[w.siding||'vinyl'];const a=sideMat(w,1),b=sideMat(w,-1);return [a===mInt?b:a,a===mInt?b:a,mInt,mInt,a,b];})():(()=>{const a=sideMat(w,1),b=sideMat(w,-1);return a===mInt&&b===mInt?mInt:[mInt,mInt,mInt,mInt,a,b];})();
      if(struct)mat=w.bearing||w.kind==='exterior'?mBear:mNon;
      if(w.status==='demolish'&&layer!=='existing')mat=mDemo;
      if(isSel)mat=mSel;
      const ops=p.openings.filter(o=>o.wall===w.id&&inLayer(o.status,layer)).map(o=>{const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));return {...o,s0:pos-o.width/2,s1:pos+o.width/2};}).sort((a,b)=>a.s0-b.s0);
      const sA=-(J[w.id]?.a||0), sB=L+(J[w.id]?.b||0); const pieces=[]; let c=sA;
      for(const o of ops){const s0=Math.max(o.s0,c),s1=Math.min(o.s1,sB);if(s1<=s0)continue;if(s0>c)pieces.push([c,s0,0,H]);
        const sill=o.type==='door'?0:o.sill,head=Math.min(H,sill+o.height);if(sill>0)pieces.push([s0,s1,0,sill]);if(head<H)pieces.push([s0,s1,head,H]);c=s1;
        const mid=(s0+s1)/2, px=w.x1+d.x*mid, py=w.y1+d.y*mid, ow=s1-s0;
        const fr=o.color?std('fr-'+hexNum(o.color),hexNum(o.color),{roughness:.6}):mFrame;
        if(o.type==='window'){const bay=o.bay&&o.bay.kind&&w.kind==='exterior';if(bay){try{addBay3D(p,lv,w,o,add,std,mGlass,fr);}catch(e){console.error(e);}}else add(new THREE.BoxGeometry(ow*IN,o.height*IN,0.6*IN),mGlass,px*IN,(e0+sill+o.height/2)*IN,py*IN,ry,false);
          add(new THREE.BoxGeometry((ow+3)*IN,1.5*IN,(t+1.5)*IN),fr,px*IN,(e0+sill-0.75)*IN,py*IN,ry);add(new THREE.BoxGeometry((ow+3)*IN,1.5*IN,(t+1.5)*IN),fr,px*IN,(e0+sill+o.height+0.75)*IN,py*IN,ry);
          for(const sx of [-1,1])add(new THREE.BoxGeometry(1.5*IN,o.height*IN,(t+1.5)*IN),fr,(px+d.x*sx*(ow/2+0.75))*IN,(e0+sill+o.height/2)*IN,(py+d.y*sx*(ow/2+0.75))*IN,ry);
          if(w.kind==='exterior'&&!struct&&!bay)addOpeningOutside3D(w,o,extW,{px,py,ow,d,t,ry,z0:e0+sill,h:o.height},add,std);
          if(w.kind==='exterior')try{addWell3D(p,o,w,add,std);}catch(e){console.error(e);}
          if(!bay&&o.grille)addGrilles3D(o,px,py,ry,e0+sill,ow,add,fr);
          if(!bay&&o.top&&w.kind==='exterior'){const on=outwardNormal(extW,w);addWinTop3D(o,w,px,py,ry,d,e0+sill+o.height,ow,add,std,mGlass,fr,on,t,H-(sill+o.height));}
          if(!bay&&['double-hung','single-hung','slider'].includes(o.operation||'double-hung')){const hz=o.operation==='slider';add(new THREE.BoxGeometry((hz?1.5:ow)*IN,(hz?o.height:1.5)*IN,(t*0.4)*IN),fr,px*IN,(e0+sill+o.height/2)*IN,py*IN,ry,false);}}
        else{const op=o.id===sel?.id;const st=o.style||'';const dc=o.color?hexNum(o.color):o.dtype==='overhead'?0xeeeeea:st==='metal'?0x8d9296:st==='storefront'?0x6f7378:null;
          const dm=op?mSel:dc!=null?std('door-'+dc,dc,{roughness:.6}):mDoor;const tagW=CUR_TAG;CUR_TAG={kind:'opening',id:o.id};
          const tc=p.settings?.trimColor?hexNum(p.settings.trimColor):0xf6f4ee;const trimMat=std('trim-'+tc,tc,{roughness:.55});
          let casingW=2.5;try{const it=LIB_BY_ID[trimOf(p,roomAt(px+d.y*(t/2+6),py-d.x*(t/2+6))||roomAt(px-d.y*(t/2+6),py+d.x*(t/2+6))).casing];if(it&&it.profile!=='none')casingW=it.h||2.5;else if(it)casingW=0;}catch(e){}
          try{addDoor3D(p,w,o,{px,py,ow,d,t,ry,e0,add,std,mGlass,dm,trimMat,casingW});}catch(e){console.error('door',e);add(new THREE.BoxGeometry(ow*IN,o.height*IN,1.75*IN),dm,px*IN,(e0+o.height/2)*IN,py*IN,ry);}
          CUR_TAG=tagW;
          if(w.kind==='exterior'&&!struct)addOpeningOutside3D(w,o,extW,{px,py,ow,d,t,ry,z0:e0,h:o.height},add,std);}
        if(struct&&struct.has('h-'+o.id)){const r=struct.get('h-'+o.id);const hd=Math.min(11.25,Math.max(3,H-head-0.5));add(new THREE.BoxGeometry((ow+3)*IN,hd*IN,(t+0.4)*IN),sMat(r),px*IN,(e0+head+hd/2)*IN,py*IN,ry,false);}
      }
      if(c<sB)pieces.push([c,sB,0,H]);
      for(const [s0,s1,z0,z1] of pieces){const mid=(s0+s1)/2;add(new THREE.BoxGeometry((s1-s0)*IN,(z1-z0)*IN,t*IN),mat,(w.x1+d.x*mid)*IN,(e0+(z0+z1)/2)*IN,(w.y1+d.y*mid)*IN,ry);}
      if(struct&&struct.has('b-'+w.id)&&layer!=='existing'){const r=struct.get('b-'+w.id);const mid=L/2;add(new THREE.BoxGeometry(L*IN,11.875*IN,(t+0.6)*IN),sMat(r),(w.x1+d.x*mid)*IN,(e0+H-6)*IN,(w.y1+d.y*mid)*IN,ry,false);}
    }
    for(const r of p.rooms.filter(r=>r.level===lv.id)){CUR_TAG={kind:'room',id:r.id,part:'floor'};
      const shape=new THREE.Shape(r.pts.map(q=>new THREE.Vector2(q[0]*IN,q[1]*IN)));for(const h of stairHole(p,lv))if(h.every(q=>inPoly(q.x,q.y,r.pts)))shape.holes.push(new THREE.Path(h.map(q=>new THREE.Vector2(q.x*IN,q.y*IN))));
      const geo=new THREE.ExtrudeGeometry(shape,{depth:0.75*IN,bevelEnabled:false}); geo.rotateX(Math.PI/2);
      const fin=r.finish||(r.use==='bath'||r.use==='kitchen'||r.use==='laundry'?'tile':r.use==='garage'?'concrete':'lvp');
      const fcol=r.floorColor?hexNum(r.floorColor):FLOOR_COLOR[fin]||0xcfc6b8;let mat=(()=>{try{return std('floorT-'+fin+'-'+fcol,0xffffff,{roughness:/tile|porcelain|polished|epoxy|vct/.test(fin)?.45:.8,map:floorTexture(fin,fcol)});}catch(e){return std('floor-'+fcol,fcol,{roughness:.85});}})();
      if(struct){const a=struct.get('fj-'+r.id),b=struct.get('cj-'+r.id);const v=Math.max(a??-1,b??-1);mat=sMat(v<0?null:v);}
      if(sel&&sel.id===r.id)mat=mSel;
      const m=add(geo,mat,0,(e0+0.75)*IN,0,0,false); m.receiveShadow=true;
      if(r.tile){CUR_TAG={kind:'room',id:r.id,part:'tile'};try{addTile3D(p,lv,r,add,std);}catch(e){console.error(e);}}
      if((opts.interior||opts.ceilings)&&lv.id===cur.id){CUR_TAG={kind:'room',id:r.id,part:'ceiling'};const cc=r.ceilingColor?hexNum(r.ceilingColor):((CEILINGS[r.ceiling||'flat']||[])[1]??0xf7f6f2);
        addCeiling3D(p,lv,r,add,std,std('ceil-'+cc,cc,{side:THREE.DoubleSide,roughness:.95,emissive:new THREE.Color(cc).multiplyScalar(opts.interior?0.28:0.08)}));
        const [lx,ly]=polyLabelPt(r.pts);const a=polyArea(r.pts)/144;const L=new THREE.PointLight(roomLightColor(p,r),0.3+Math.min(0.3,a/900),Math.max(18,Math.sqrt(a)*2.2),1.4);L.position.set(lx*IN,(e0+lv.height-14)*IN,ly*IN);g.add(L);}
    }
    for(const s of p.stairs.filter(s=>s.level===lv.id)){CUR_TAG={kind:'stair',id:s.id};stair3D(p,lv,s,add,std,sel,mSel);}CUR_TAG=null;
    for(const s of [].filter(s=>s.level===lv.id)){
      const si=stairInfo(p,s); const ry=-Math.atan2(si.d.y,si.d.x); const isSel=sel&&sel.id===s.id;
      for(let i=0;i<si.treads;i++){const h=(i+1)*si.riserH;const along=i*s.tread+s.tread/2;add(new THREE.BoxGeometry(s.tread*IN,h*IN,s.width*IN),isSel?mSel:mStair,(s.x+si.d.x*along)*IN,(e0+h/2)*IN,(s.y+si.d.y*along)*IN,ry);}
    }
    if(typeof addFixtures3D==='function')addFixtures3D(p,lv,add,std,sel,mSel);CUR_TAG=null;
    if(!struct)addTrim3D(p,lv,ws.filter(w=>w.status!=='demolish'),add,std);
    addShapes3D(p,lv,add,std,sel,mSel);addRamps3D(p,lv,add,std,sel,mSel);CUR_TAG=null;
    {const ctx=reg3DCtx(add,std,sel,mSel,layer,struct,opts,p,lv,g);for(const k of objKinds()){const d=OBJ[k];if(!d.add3D||(d.roofish&&!showRoof))continue;for(const o of objsOn(p,k,lv.id))if(inLayer(o.status||'new',layer)){CUR_TAG={kind:k,id:o.id};try{d.add3D(p,lv,o,ctx);}catch(e){console.error(k,e);}}}}CUR_TAG=null;if(!struct)addElec3D(p,lv,add,std,sel,mSel);
    if(showRoof) for(const r of p.roofs.filter(r=>r.level===lv.id)){CUR_TAG={kind:'roof',id:r.id};
      const top=roofTop(p,r); const b=roofBuild(r,top); const isSel=sel&&sel.id===r.id; const cov=rafterOf(r).cover||'asphalt';
      const mk=(tris)=>{const arr=[];for(const tr of tris)for(const v of tr)arr.push(v[0]*IN,v[2]*IN,v[1]*IN);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));geo.computeVertexNormals();return geo;};
      const rcol=r.color?hexNum(r.color):ROOF_COLOR[cov]??0x4a4f57;let rm=M('roof-'+cov+'-'+rcol,()=>new THREE.MeshStandardMaterial({color:rcol,roughness:cov==='metal'?.5:.95,metalness:cov==='metal'?.3:0,side:THREE.DoubleSide,flatShading:true}));
      if(struct&&struct.has('rf-'+r.id)){const c=ratioColor(struct.get('rf-'+r.id));rm=M('roofs-'+c,()=>new THREE.MeshStandardMaterial({color:c,roughness:.8,side:THREE.DoubleSide,flatShading:true}));}
      if(b.roof.length) add(mk(b.roof),isSel?mSel:rm,0,0,0);
      if(b.fill.length){const ew=extW[0];const gc=r.style==='flat'?(r.color?hexNum(r.color):0xd8d4cc):ew&&ew.color?hexNum(ew.color):SIDING_COLOR[(ew&&ew.siding)||'vinyl']||0xf1ece2;add(mk(b.fill),M('gable-'+gc,()=>new THREE.MeshStandardMaterial({color:gc,roughness:.9,side:THREE.DoubleSide})),0,0,0);}
      if(!struct){try{addRoofTrim3D(p,lv,r,b,reg3DCtx(add,std,sel,mSel,layer,struct,opts,p,lv,g));}catch(e){console.error('trim',e);}}
    }
  }
}

// Baseboard and crown along each room edge, set in from the wall face and broken at door openings.
function addTrim3D(p,lv,walls,add,std){
  const tc=p.settings?.trimColor?hexNum(p.settings.trimColor):0xf7f6f1;const mT=std('trim-'+tc,tc,{roughness:.55});
  for(const r of p.rooms.filter(r=>r.level===lv.id)){const t=trimOf(p,r);const base=LIB_BY_ID[t.base],crown=LIB_BY_ID[t.crown],chair=LIB_BY_ID[t.chair],wain=LIB_BY_ID[t.wainscot];
    for(let i=0;i<r.pts.length;i++){const a={x:r.pts[i][0],y:r.pts[i][1]},b={x:r.pts[(i+1)%r.pts.length][0],y:r.pts[(i+1)%r.pts.length][1]};const L=dist(a,b);if(L<6)continue;const d={x:(b.x-a.x)/L,y:(b.y-a.y)/L};
      let n={x:-d.y,y:d.x};const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if(!inPoly(mid.x+n.x*6,mid.y+n.y*6,r.pts))n={x:-n.x,y:-n.y};
      const w=walls.find(w=>{const q=projSeg(mid,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});const dw=wdir(w);return q.d<w.thick/2+1&&Math.abs(dw.x*d.x+dw.y*d.y)>0.99;});if(!w)continue;
      const inset=Math.max(0,w.thick/2-projSeg(mid,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2}).d);
      const gaps=p.openings.filter(o=>o.wall===w.id&&o.type==='door').map(o=>{const c=openingCenter(p,o);const s=(c.x-a.x)*d.x+(c.y-a.y)*d.y;return [s-o.width/2-2.5,s+o.width/2+2.5];});
      const runs=[];let c=0;for(const [g0,g1] of gaps.sort((x,y)=>x[0]-y[0])){if(g0>c)runs.push([c,Math.min(g0,L)]);c=Math.max(c,g1);}if(c<L)runs.push([c,L]);
      const ry=-Math.atan2(d.y,d.x);const H=lv.height;
      const strip=(s0,s1,z0,h,th)=>{const m=(s0+s1)/2;const off=inset+th/2;add(new THREE.BoxGeometry((s1-s0)*IN,h*IN,th*IN),mT,(a.x+d.x*m+n.x*off)*IN,(lv.elevation+z0+h/2)*IN,(a.y+d.y*m+n.y*off)*IN,ry,false);};
      for(const [s0,s1] of runs){if(s1-s0<1)continue;
        if(base&&base.h>0)strip(s0,s1,0.75,base.h,Math.max(0.5,base.t));
        if(wain&&wain.h>0)strip(s0,s1,0.75+(base?base.h:0),wain.h-(base?base.h:0),0.4);
        if(chair&&chair.h>0)strip(s0,s1,chair.label.includes('84')?84:wain&&wain.h>0?wain.h:34,chair.h,chair.t);}
      if(crown&&crown.h>0)strip(0,L,H-crown.h*0.75,crown.h*0.75,crown.h*0.55);}
  }
}
