/* ======================= Render Studio: photoreal renders inside the app (GPU path tracing) ======================= */
// The engine (three-gpu-pathtracer on its own three.js) is embedded in the page as text and started the first time it is needed.
let _engineP=null;
function loadRenderEngine(){if(window.RSRender)return Promise.resolve(window.RSRender);if(_engineP)return _engineP;
  _engineP=new Promise((res,rej)=>{const el=document.getElementById('rs-render-engine');if(!el){rej(new Error('The render engine is missing from this copy of the app.'));return;}
    const done=()=>window.RSRender?res(window.RSRender):rej(new Error('The render engine did not start.'));
    try{const url=URL.createObjectURL(new Blob([el.textContent],{type:'text/javascript'}));const s=document.createElement('script');s.src=url;s.onload=()=>{URL.revokeObjectURL(url);done();};
      s.onerror=()=>{try{(0,eval)(el.textContent);done();}catch(e){rej(e);}};document.head.appendChild(s);}catch(e){try{(0,eval)(el.textContent);done();}catch(e2){rej(e2);}}});
  _engineP.catch(()=>{_engineP=null;});return _engineP;}
const RS_SIZES=[['draft','Draft 960 x 540',960,540],['hd','HD 1920 x 1080',1920,1080],['qhd','Large 2560 x 1440',2560,1440],['square','Square 1600 x 1600',1600,1600],['portrait','Portrait 1350 x 1688',1350,1688],['sheet','Plan sheet 3300 x 2100',3300,2100]];
const RS_QUAL=[[16,'Preview (16 passes)'],[64,'Quick (64 passes)'],[256,'Good (256 passes)'],[700,'Best (700 passes)'],[2000,'Final (2,000 passes)']];
const RS_SKY=[['day','Sunny, at the sun study time'],['golden','Golden hour (late afternoon)'],['overcast','Overcast, soft shadows'],['dusk','Dusk with the lights on'],['night','Night with the lights on']];
// lights from the electrical plan, in meters (three.js axes: x, up, plan y)
function renderLights(p){const M=IN*0.3048;const out=[];
  for(const d of (p.elec||[])){if(d.status==='demolish'||!LUMENS[d.type])continue;const lv=lvlOf(p,d.level);if(!lv)continue;const room=p.rooms.find(r=>r.level===lv.id&&inPoly(d.x,d.y,r.pts));const ch=(room&&room.ceilingH)||lv.height||96;
    const lm=d.lumens||LUMENS[d.type];let z,kind='disc',radius=0.07;
    if(d.type==='can'||d.type==='light'){z=lv.elevation+ch-0.6;radius=d.type==='light'?0.15:0.07;}
    else if(d.type==='fan'){z=lv.elevation+ch-14;radius=0.12;}
    else if(d.type==='pendant'){z=lv.elevation+Math.max(ch-30,66);kind='bulb';}
    else if(d.type==='sconce'){z=lv.elevation+68;kind='bulb';}
    else if(d.type==='undercab'){z=lv.elevation+53.5;kind='panel';}
    else if(d.type==='exterior'){z=lv.elevation+78;kind='bulb';}
    else{z=lv.elevation+ch-1;}
    out.push({pos:[d.x*M,z*M,d.y*M],lm,kind,radius,w:0.5,h:0.05});}
  // nothing drawn on the electrical plan yet: one ceiling light per room, about 20 lumens a square foot
  if(!out.length)for(const r of p.rooms){if(r.use==='porch')continue;const lv=lvlOf(p,r.level);if(!lv)continue;const c=polyLabelPt(r.pts);const a=polyArea(r.pts)/144;const ch=r.ceilingH||lv.height||96;
    out.push({pos:[c[0]*M,(lv.elevation+ch-0.6)*M,c[1]*M],lm:Math.max(800,a*20),kind:'disc',radius:0.18,auto:true});}
  return out;}
// sun direction toward the sun, in three.js axes, for the date and time given
function sunVector3(p,date,min){const site=siteOf(p);const s=sunFor(site,date,min);const d=sunPlanDir(s.az,site.bearing);const el=Math.max(s.alt,1)*Math.PI/180;return {v:[d.x*Math.cos(el),Math.sin(el),d.y*Math.cos(el)],alt:s.alt,az:s.az};}
function goldenMinute(p,date){const site=siteOf(p);let best=17*60;for(let m=12*60;m<=21*60;m+=5){const s=sunFor(site,date,m);if(s.alt<=12){best=m;break;}}return best;}
// camera presets from the render kit's logic, converted back from Blender axes; plus the view on screen right now
async function renderSetup(p,sun){const {cams,files}=await renderKitFiles(p,sun);const fromB=a=>[a[0],a[2],-a[1]];const out=[];
  const st=window.__view3d;if(st&&st.camera){const c=st.camera;const pos=c.position.clone().multiplyScalar(0.3048);let tgt;
    if(st.walk&&st.walk.on){const dir=new THREE.Vector3();c.getWorldDirection(dir);tgt=c.position.clone().add(dir.multiplyScalar(8)).multiplyScalar(0.3048);}else tgt=st.controls.target.clone().multiplyScalar(0.3048);
    out.push({id:'screen',name:'The 3D view as it is now',pos:pos.toArray(),target:tgt.toArray(),vfov:c.fov});}
  const nice={street:'Street view',aerial:'Aerial view'};
  for(const [k,v] of Object.entries(cams)){const hf=2*Math.atan(18/v.lens);out.push({id:k,name:nice[k]||(k.startsWith('view_')?'Saved view: '+k.slice(5).replace(/_/g,' '):k.replace(/^\w/,c=>c.toUpperCase())+' corner'),pos:fromB(v.location),target:fromB(v.target),hfov:hf*180/Math.PI});}
  return {cams:out,glb:files['model.glb']};}
function camFov(c,w,h){if(c.vfov)return c.vfov;const hf=c.hfov*Math.PI/180;return 2*Math.atan(Math.tan(hf/2)/(w/h))*180/Math.PI;}
const fmtTime=s=>s<60?`${Math.round(s)} s`:`${Math.floor(s/60)} min ${String(Math.round(s%60)).padStart(2,'0')} s`;
function RenderStudio({p,sun,onClose}){
  const saved=p.settings?.render||{};const [o,setO]=useState({smooth:saved.smooth!==false,auto:saved.auto!==false,cam:saved.cam||'screen',size:saved.size||'hd',q:saved.q||256,sky:saved.sky||'day',lights:saved.lights!==false,level:saved.level??1,ev:saved.ev??0,dof:false});
  const [setup,setSetup]=useState(null);const [state,setState]=useState({phase:'idle',n:0,t:0,msg:null});const [gallery,setGallery]=useState([]);const [big,setBig]=useState(null);
  const canvasHost=useRef(null);const job=useRef(null);const up=patch=>setO(x=>({...x,...patch}));
  const refreshGallery=useCallback(async()=>{try{const l=await assetList(p.id||'default');setGallery(l.filter(a=>a.kind==='render').sort((a,b)=>String(b.date).localeCompare(String(a.date))));}catch(e){}},[p.id]);
  useEffect(()=>{let live=true;(async()=>{try{const s=await renderSetup(p,sun);if(live){setSetup(s);if(!s.cams.find(c=>c.id===o.cam))up({cam:s.cams[0]?.id});}}catch(e){if(live)setState({phase:'error',n:0,t:0,msg:e.message||'Could not prepare the model.'});}})();refreshGallery();return ()=>{live=false;};},[]);
  useEffect(()=>()=>{stop(true);},[]);
  const stop=(dispose)=>{const j=job.current;if(!j)return;j.stopped=true;if(dispose&&j.h){try{j.h.dispose();}catch(e){}job.current=null;}};
  const start=async()=>{stop(true);if(!setup)return;const sz=RS_SIZES.find(s=>s[0]===o.size)||RS_SIZES[1];const [,,W,H]=window.__rsTestSize||sz;const cam=setup.cams.find(c=>c.id===o.cam)||setup.cams[0];
    const host=canvasHost.current;host.innerHTML='';const cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.className='rs-canvas';host.appendChild(cv);
    const j={stopped:false,h:null,t0:performance.now(),W,H};job.current=j;setState({phase:'loading',n:0,t:0,msg:'Starting the render engine…'});
    try{const E=await loadRenderEngine();if(j.stopped)return;setState(s=>({...s,msg:'Building the light model of the house…'}));
      const minute=o.sky==='golden'?goldenMinute(p,sun.date):sun.min;const sv=sunVector3(p,sun.date,minute);const night=o.sky==='dusk'||o.sky==='night';
      const glb=setup.glb.buffer.slice(setup.glb.byteOffset,setup.glb.byteOffset+setup.glb.byteLength);
      j.h=await E.create(cv,{glb,width:W,height:H,sky:sv.alt<=0&&(o.sky==='day'||o.sky==='golden')?'dusk':o.sky,sunDir:sv.v,camera:{pos:cam.pos,target:cam.target,fov:camFov(cam,W,H),fStop:o.dof?4:22},
        lights:o.lights||night?renderLights(p):[],lightLevel:o.level,ev:o.ev,autoExposure:o.auto,denoise:o.smooth,groundY:siteZ(p)*IN*0.3048,bounces:o.q>=700?8:6,tiles:W*H>2.5e6?3:2});
      commit2({render:{smooth:o.smooth,auto:o.auto,cam:o.cam,size:o.size,q:o.q,sky:o.sky,lights:o.lights,level:o.level,ev:o.ev}});
      j.t0=performance.now();setState({phase:'run',n:0,t:0,msg:null});
      const tick=()=>{if(j.stopped||job.current!==j)return;const t1=performance.now();let n=j.h.samples;while(performance.now()-t1<40&&n<o.q){n=j.h.step(1);}
        const t=(performance.now()-j.t0)/1000;setState({phase:n>=o.q?'done':'run',n,t,msg:null});if(n<o.q)requestAnimationFrame(tick);};
      requestAnimationFrame(tick);}
    catch(e){setState({phase:'error',n:0,t:0,msg:(e&&e.message||'The render failed.')+(/WebGL|context/i.test(String(e&&e.message))?' This computer\'s graphics card may not support WebGL 2.':'')});}};
  const commit2=patch=>{try{window.__app&&window.__app.commit({...window.__app.get(),settings:{...window.__app.get().settings,...patch}});}catch(e){}};
  const exposure=ev=>{up({ev});const j=job.current;if(j&&j.h)j.h.setExposure(ev);};
  const blobOf=async(type,q)=>{const j=job.current;if(!j||!j.h)return null;return j.h.toBlob(type,q);};
  const saveImg=async()=>{const b=await blobOf('image/png');if(!b)return;const cam=setup.cams.find(c=>c.id===o.cam);const r=await saveFile(`${safeName(p.name)} render ${safeName(cam?cam.name:'view')}.png`,b);setState(s=>({...s,msg:r.t}));};
  const keep=async()=>{const b=await blobOf('image/jpeg',0.92);if(!b)return;const url=await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(b);});const cam=setup.cams.find(c=>c.id===o.cam);
    await assetPut({id:uid('rn'),project:p.id||'default',kind:'render',name:`${cam?cam.name:'View'} · ${(RS_SKY.find(s=>s[0]===o.sky)||['',''])[1].split(',')[0]}`,date:new Date().toISOString(),url,w:job.current.W,h:job.current.H,passes:state.n});
    refreshGallery();setState(s=>({...s,msg:'Added to the project gallery. Renders in the gallery go on the presentation board.'}));};
  const delImg=async a=>{await assetDel(a.id);refreshGallery();};
  const sz=RS_SIZES.find(s=>s[0]===o.size)||RS_SIZES[1];const pct=Math.min(100,state.n/o.q*100);const eta=state.n>2&&state.phase==='run'?state.t/state.n*(o.q-state.n):null;
  const busy=state.phase==='run'||state.phase==='loading';
  return html`<div className="modal-bg rs-bg" onPointerDown=${e=>{if(e.target===e.currentTarget&&!busy)onClose();}}><div className="modal rs-modal" role="dialog" aria-label="Render">
    <div className="rs-head"><h2>Render</h2><span className="note">Photoreal path tracing on this computer's graphics card: real sun and sky, glass, reflections and light bouncing between rooms.</span><span className="spacer"></span><button className="btn" onClick=${()=>{stop(true);onClose();}}>Close</button></div>
    <div className="rs-body">
      <div className="rs-stage"><div className="rs-frame" style=${{aspectRatio:sz[2]+' / '+sz[3]}}><div className="rs-host" ref=${canvasHost}></div>${state.phase==='idle'?html`<div className="rs-empty">Pick a view and press Render. The picture starts grainy and clears up as passes add up.</div>`:null}</div>
        <div className="rs-prog"><div className="bar"><i style=${{width:pct+'%'}}></i></div><span className="mono">${state.phase==='loading'?state.msg:state.phase==='idle'?'Ready':`${state.n} of ${o.q} passes · ${fmtTime(state.t)}${eta!=null?' · about '+fmtTime(eta)+' left':''}${state.phase==='done'?' · finished':''}`}</span></div>
        ${state.phase==='error'||(state.msg&&state.phase!=='loading')?html`<div className=${'msg'+(state.phase==='error'?' err':'')}>${state.msg}</div>`:null}</div>
      <div className="rs-side">
        <${Field} label="View" id="rs-cam"><${Sel} id="rs-cam" value=${o.cam} onChange=${v=>up({cam:v})} options=${(setup?setup.cams:[]).map(c=>[c.id,c.name])}/><//>
        <${Field} label="Light and sky" id="rs-sky"><${Sel} id="rs-sky" value=${o.sky} onChange=${v=>up({sky:v})} options=${RS_SKY}/><//>
        <p className="note">${o.sky==='day'?`Sun on ${sun.date} at ${Math.floor(sun.min/60)}:${String(sun.min%60).padStart(2,'0')} (set it with Sun in the 3D view).`:o.sky==='golden'?'Low warm sun about an hour before sunset.':o.sky==='overcast'?'Even light, no hard shadows; good for interiors and materials.':'Fixtures from the electrical plan light the rooms.'}</p>
        <label className="check"><input type="checkbox" checked=${o.lights||o.sky==='dusk'||o.sky==='night'} disabled=${o.sky==='dusk'||o.sky==='night'} onChange=${e=>up({lights:e.target.checked})}/> Lights on (${(()=>{const L=renderLights(p);return L.length&&L[0].auto?'no fixtures drawn yet, so one ceiling light per room':L.length+' fixtures from the electrical plan';})()})</label>
        ${(o.lights||o.sky==='dusk'||o.sky==='night')?html`<${Field} label="Light brightness" id="rs-lv"><input id="rs-lv" type="range" min="0.25" max="4" step="0.25" value=${o.level} onInput=${e=>up({level:+e.target.value})}/><span className="mono">${o.level}x</span><//>`:null}
        <label className="check"><input type="checkbox" checked=${o.auto} onChange=${e=>up({auto:e.target.checked})}/> Auto exposure (like a camera)</label>
        <${Field} label=${o.auto?'Brighter or darker':'Exposure'} id="rs-ev"><input id="rs-ev" type="range" min="-3" max="3" step="0.25" value=${o.ev} onInput=${e=>exposure(+e.target.value)}/><span className="mono">${o.ev>0?'+':''}${o.ev} EV</span><//>
        <${Field} label="Image size" id="rs-sz"><${Sel} id="rs-sz" value=${o.size} onChange=${v=>up({size:v})} options=${RS_SIZES.map(s=>[s[0],s[1]])}/><//>
        <${Field} label="Quality" id="rs-q"><${Sel} id="rs-q" value=${String(o.q)} onChange=${v=>up({q:+v})} options=${RS_QUAL.map(q=>[String(q[0]),q[1]])}/><//>
        <label className="check"><input type="checkbox" checked=${o.smooth} onChange=${e=>{up({smooth:e.target.checked});const j=job.current;if(j&&j.h)j.h.setDenoise(e.target.checked);}}/> Smooth out grain</label>
        <label className="check"><input type="checkbox" checked=${o.dof} onChange=${e=>up({dof:e.target.checked})}/> Camera depth of field</label>
        <div className="row">${busy?html`<button className="btn" onClick=${()=>{stop(false);setState(s=>({...s,phase:'done'}));}}>Stop</button>`:html`<button className="btn primary" disabled=${!setup} onClick=${start}>${setup?(state.phase==='done'?'Render again':'Render'):'Preparing…'}</button>`}
          <button className="btn" disabled=${state.n<1} onClick=${saveImg}>Save image</button><button className="btn" disabled=${state.n<1} onClick=${keep}>Add to gallery</button></div>
        <p className="note">Change the exposure while it renders. Size and light changes apply on the next render. Bigger images and more passes take longer; a draft takes seconds, a final at plan-sheet size can take many minutes.</p>
        <p className="note">Engine: three-gpu-pathtracer by Garrett Johnson (MIT license), built on three.js.</p>
        ${gallery.length?html`<h3>Gallery</h3><div className="rgal">${gallery.map(a=>html`<div key=${a.id} className="rthumbw"><button className="rthumb" onClick=${()=>setBig(a)} title=${a.name}><img src=${a.url} alt=${a.name}/></button><button className="xbtn" title="Remove from gallery" aria-label=${'Remove '+a.name} onClick=${()=>delImg(a)}>×</button></div>`)}</div>`:null}
      </div></div>
    ${big?html`<div className="modal-bg" onPointerDown=${()=>setBig(null)}><img className="rbig" src=${big.url} alt=${big.name}/></div>`:null}</div></div>`;}
