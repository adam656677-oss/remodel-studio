/* ======================= photo match: line the 3D camera up with a real photo of the room ======================= */
// Click six or more room corners (floor and ceiling) on a photo; a direct linear transform solves the camera that took
// it. The new design then renders from exactly that camera and blends over the real photo.
function jacobiEig(A0){const n=A0.length;const A=A0.map(r=>[...r]);const V=A.map((r,i)=>r.map((_,j)=>i===j?1:0));
  for(let sweep=0;sweep<80;sweep++){let off=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)off+=A[i][j]*A[i][j];if(off<1e-22)break;
    for(let p=0;p<n;p++)for(let q=p+1;q<n;q++){if(Math.abs(A[p][q])<1e-300)continue;const th=(A[q][q]-A[p][p])/(2*A[p][q]);const t=Math.sign(th||1)/(Math.abs(th)+Math.sqrt(th*th+1));const c=1/Math.sqrt(t*t+1),s=t*c;
      for(let k=0;k<n;k++){const akp=A[k][p],akq=A[k][q];A[k][p]=c*akp-s*akq;A[k][q]=s*akp+c*akq;}for(let k=0;k<n;k++){const apk=A[p][k],aqk=A[q][k];A[p][k]=c*apk-s*aqk;A[q][k]=s*apk+c*aqk;}
      for(let k=0;k<n;k++){const vkp=V[k][p],vkq=V[k][q];V[k][p]=c*vkp-s*vkq;V[k][q]=s*vkp+c*vkq;}}}
  return {vals:A.map((r,i)=>r[i]),vecs:V};}
function solveDLT(pairs){// pairs: [{X:[x,y,z],u:[u,v]}] → 3x4 P, or null
  if(pairs.length<6)return null;const ys=pairs.map(q=>q.X[1]);if(Math.max(...ys)-Math.min(...ys)<1e-6)return null;// all on one plane: need floor and ceiling corners
  const n=pairs.length;const mean=(a,k)=>a.reduce((s,x)=>s+x[k],0)/a.length;
  const W=pairs.map(q=>q.X),U=pairs.map(q=>q.u);const wc=[0,1,2].map(k=>mean(W,k)),uc=[0,1].map(k=>mean(U,k));
  const ws=Math.sqrt(3)/(W.reduce((s,x)=>s+Math.hypot(x[0]-wc[0],x[1]-wc[1],x[2]-wc[2]),0)/n||1),us=Math.SQRT2/(U.reduce((s,x)=>s+Math.hypot(x[0]-uc[0],x[1]-uc[1]),0)/n||1);
  const M=Array.from({length:12},()=>new Array(12).fill(0));
  for(const q of pairs){const X=(q.X[0]-wc[0])*ws,Y=(q.X[1]-wc[1])*ws,Z=(q.X[2]-wc[2])*ws,u=(q.u[0]-uc[0])*us,v=(q.u[1]-uc[1])*us;
    const r1=[X,Y,Z,1,0,0,0,0,-u*X,-u*Y,-u*Z,-u],r2=[0,0,0,0,X,Y,Z,1,-v*X,-v*Y,-v*Z,-v];for(const r of [r1,r2])for(let i=0;i<12;i++)for(let j=0;j<12;j++)M[i][j]+=r[i]*r[j];}
  const E=jacobiEig(M);let k=0;for(let i=1;i<12;i++)if(E.vals[i]<E.vals[k])k=i;const h=E.vecs.map(r=>r[k]);
  const Pn=[h.slice(0,4),h.slice(4,8),h.slice(8,12)];
  // undo the normalisation: P = Tu^-1 · Pn · Tw
  const Tw=[[ws,0,0,-ws*wc[0]],[0,ws,0,-ws*wc[1]],[0,0,ws,-ws*wc[2]],[0,0,0,1]],Tui=[[1/us,0,uc[0]],[0,1/us,uc[1]],[0,0,1]];
  const mul=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,a,i)=>s+a*B[i][j],0)));let P=mul(Tui,mul(Pn,Tw));
  const nz=Math.hypot(P[2][0],P[2][1],P[2][2]);P=P.map(r=>r.map(v=>v/nz));const w0=P[2][0]*W[0][0]+P[2][1]*W[0][1]+P[2][2]*W[0][2]+P[2][3];if(w0<0)P=P.map(r=>r.map(v=>-v));return P;}
const projP=(P,X)=>{const w=P[2][0]*X[0]+P[2][1]*X[1]+P[2][2]*X[2]+P[2][3];return [(P[0][0]*X[0]+P[0][1]*X[1]+P[0][2]*X[2]+P[0][3])/w,(P[1][0]*X[0]+P[1][1]*X[1]+P[1][2]*X[2]+P[1][3])/w,w];};
function matchPoints(p,room){const lv=lvlOf(p,room.level);const e=lv.elevation,H=room.ceilingH||lv.height;const out=[];const dirs=room.pts.map((q,i)=>{const c=polyLabelPt(room.pts);const dx=q[0]-c[0],dy=q[1]-c[1];return (Math.abs(dx)>Math.abs(dy)*0.4?(dx>0?'east':'west'):'')+(Math.abs(dy)>Math.abs(dx)*0.4?(dy>0?'south':'north'):'');});
  room.pts.forEach((q,i)=>{const nm=dirs[i].replace(/^(east|west)(north|south)$/,'$2$1')||'corner '+(i+1);for(const [z,lab] of [[0,'floor'],[H,'ceiling']])out.push({key:`c${i}${lab[0]}`,label:`${nm.charAt(0).toUpperCase()+nm.slice(1)} corner, ${lab}`,X:[q[0]*IN,(e+z)*IN,q[1]*IN]});});
  return out;}
function renderMatched(p,room,P,W,H){const R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(W,H,false);R.setClearColor(0x000000,0);R.outputEncoding=THREE.sRGBEncoding;const scene=new THREE.Scene();
  const hemi=new THREE.HemisphereLight(0xfff8ee,0x9a9488,0.75);scene.add(hemi);const sun=new THREE.DirectionalLight(0xfff4e2,0.35);sun.position.set(30,60,20);scene.add(sun);
  const st={model:new THREE.Group(),sun,hemi,camera:new THREE.PerspectiveCamera(45,W/H,0.3,2000)};scene.add(st.model);buildModel(st,p,room.level,null,{cutaway:true,showRoof:false,layer:'proposed',interior:true,ceilings:true});
  const cam=new THREE.Camera();cam.matrixAutoUpdate=false;cam.matrix.identity();cam.matrixWorld.identity();cam.matrixWorldInverse.identity();const n=0.2,f=400,A=(f+n)/(f-n),B=-2*f*n/(f-n);const r=P;
  const rows=[r[0].map((v,i)=>2/W*v-r[2][i]),r[2].map((v,i)=>v-2/H*r[1][i]),r[2].map((v,i)=>A*v+(i===3?B:0)),r[2]];
  cam.projectionMatrix.set(...rows[0],...rows[1],...rows[2],...rows[3]);cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  R.render(scene,cam);const out=R.domElement.toDataURL('image/png');st.model.traverse(o=>{if(o.geometry)o.geometry.dispose();});R.dispose();R.forceContextLoss&&R.forceContextLoss();return out;}
function PhotoMatchModal({p,commit,levelId,onClose}){const PM=p.photomatch||{};const [photos,setPhotos]=useState(null);const [asset,setAsset]=useState(PM.asset||null);const [img,setImg]=useState(null);
  const rooms=p.rooms;const [roomId,setRoomId]=useState(PM.room||((rooms.find(r=>r.use==='kitchen')||rooms[0]||{}).id));const room=rooms.find(r=>r.id===roomId);
  const [pts,setPts]=useState(PM.pts||{});const [active,setActive]=useState(null);const [view,setView]=useState('blend');const [op,setOp]=useState(0.65);const [shot,setShot]=useState(null);const [msg,setMsg]=useState(null);const cv=useRef(null);
  useEffect(()=>{assetList(p.id||'default').then(a=>setPhotos(a.filter(x=>x.kind==='photo'&&x.blob))).catch(()=>setPhotos([]));},[]);
  useEffect(()=>{if(!asset){setImg(null);return;}assetGet(asset).then(a=>{if(!a)return;const im=new Image();im.onload=()=>setImg(im);im.src=blobURL(a.id,a.blob);});},[asset]);
  const refs=room?matchPoints(p,room):[];const pairs=refs.filter(r=>pts[r.key]).map(r=>({X:r.X,u:pts[r.key],key:r.key}));
  const P=useMemo(()=>{try{return solveDLT(pairs);}catch(e){return null;}},[JSON.stringify(pairs)]);
  const err=P?Math.sqrt(pairs.reduce((s,q)=>{const r=projP(P,q.X);return s+(r[0]-q.u[0])**2+(r[1]-q.u[1])**2;},0)/pairs.length):null;
  useEffect(()=>{setShot(null);},[P&&JSON.stringify(P)]);
  const save=patch=>commit({...p,photomatch:{asset,room:roomId,pts,...patch}});
  const upload=async e=>{const f=e.target.files[0];if(!f)return;const d=await downscale(f,2400);const id=uid('ph');await assetPut({id,project:p.id||'default',kind:'photo',blob:d.blob,w:d.w,h:d.h,name:f.name,date:new Date().toISOString(),note:'photo match'});setPhotos(x=>[...(x||[]),{id,kind:'photo',blob:d.blob,name:f.name}]);setAsset(id);setPts({});};
  const W=img?Math.min(1600,img.naturalWidth):0,H=img?Math.round(W*img.naturalHeight/img.naturalWidth):0;
  const click=e=>{if(!img||!active)return;const r=e.currentTarget.getBoundingClientRect();const u=(e.clientX-r.left)/r.width*W,v=(e.clientY-r.top)/r.height*H;const np={...pts,[active]:[u,v]};setPts(np);
    const i=refs.findIndex(x=>x.key===active);const nxt=refs.slice(i+1).find(x=>!np[x.key]);setActive(nxt?nxt.key:null);};
  const doRender=()=>{if(!P||!room)return;try{setShot(renderMatched(p,room,P,W,H));save({});}catch(e){console.error(e);setMsg('Could not render: '+e.message);}};
  const exportPNG=async()=>{if(!shot||!img)return;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');if(view!=='model')g.drawImage(img,0,0,W,H);const m=new Image();await new Promise(r=>{m.onload=r;m.src=shot;});g.globalAlpha=view==='photo'?0:view==='model'?1:op;g.drawImage(m,0,0,W,H);
    const blob=await new Promise(r=>c.toBlob(r,'image/png'));setMsg((await saveFile(safeName(p.name)+' photo match.png',blob)).t);};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide pm" role="dialog" aria-label="Photo match"><h2>Photo match</h2>
    <p className="note">Pick a photo of a room, then click its corners on the photo in the order listed (floor and ceiling corners you can see). With six or more, the 3D camera matches the photo and the new design shows over the real room.</p>
    <div className="pm-grid"><div className="pm-side">
      <${Field} label="Room" id="pm-room"><${Sel} id="pm-room" value=${roomId||''} onChange=${v=>{setRoomId(v);setPts({});}} options=${rooms.map(r=>[r.id,r.name])}/><//>
      <div className="row"><label className="btn" htmlFor="pm-up">Upload a photo…</label><input id="pm-up" type="file" accept="image/*" hidden onChange=${upload}/></div>
      <div className="pm-thumbs">${(photos||[]).slice(-24).map(a=>html`<button key=${a.id} className=${'pm-th'+(asset===a.id?' on':'')} onClick=${()=>{setAsset(a.id);setPts({});}} title=${a.name||''}><img src=${blobURL(a.id,a.blob)} alt=""/></button>`)}${photos&&!photos.length?html`<p className="note">No photos yet. Upload one, or add photos in Measure.</p>`:null}</div>
      <h4>Corners (${pairs.length} of 6+, include some ceiling corners)</h4><div className="pm-refs">${refs.map(r=>html`<button key=${r.key} className=${'pm-ref'+(active===r.key?' on':'')+(pts[r.key]?' done':'')} onClick=${()=>setActive(r.key)}><span>${r.label}</span>${pts[r.key]?html`<small onClick=${e=>{e.stopPropagation();const n={...pts};delete n[r.key];setPts(n);}} title="Clear">✕</small>`:null}</button>`)}</div>
      ${err!=null?html`<p className=${'note '+(err>12?'bad':'')}>Fit: ${err.toFixed(1)} px average${err>12?' — recheck a corner or two':''}.</p>`:null}
      <div className="row"><button className="btn primary" disabled=${!P} onClick=${doRender}>Show the design</button></div>
      ${shot?html`<div className="seg">${[['blend','Blend'],['model','Design'],['photo','Photo']].map(([k,l])=>html`<button key=${k} className=${view===k?'on':''} onClick=${()=>setView(k)}>${l}</button>`)}</div>
        ${view==='blend'?html`<label>Design opacity <input type="range" min="0.1" max="1" step="0.05" value=${op} onInput=${e=>setOp(+e.target.value)}/></label>`:null}<button className="btn" onClick=${exportPNG}>Save as PNG</button>`:null}
      ${msg?html`<p className="note">${msg}</p>`:null}</div>
      <div className="pm-stage">${img?html`<div className="pm-img" style=${{aspectRatio:W+' / '+H}} onClick=${click}><img src=${img.src} alt="Room photo" style=${{opacity:shot&&view==='model'?0:1}}/>
          ${shot?html`<img className="pm-shot" src=${shot} alt="Design from the matched camera" style=${{opacity:view==='photo'?0:view==='model'?1:op}}/>`:null}
          <svg viewBox=${`0 0 ${W} ${H}`} preserveAspectRatio="none">${refs.filter(r=>pts[r.key]).map(r=>{const [u,v]=pts[r.key];const q=P?projP(P,r.X):null;return html`<g key=${r.key}>${q?html`<line x1=${u} y1=${v} x2=${q[0]} y2=${q[1]} stroke="#d9534f" strokeWidth=${W/600}/>`:null}<circle cx=${u} cy=${v} r=${W/160} fill=${active===r.key?'#e0a43a':'#2f6fdb'} stroke="#fff" strokeWidth=${W/800}/><text x=${u+W/120} y=${v-W/120} fontSize=${W/70} fill="#fff" stroke="#000" strokeWidth=${W/900} paintOrder="stroke">${r.label.replace(' corner','')}</text></g>`;})}</svg>
          ${active?html`<div className="pm-hint">Click: ${(refs.find(r=>r.key===active)||{}).label}</div>`:null}</div>`:html`<div className="pm-empty">Pick or upload a photo.</div>`}</div></div>
    <div className="row"><span className="spacer"></span><button className="btn" onClick=${()=>{save({});onClose();}}>Close</button></div></div></div>`;}
EXTRA_DIALOGS.photomatch=PhotoMatchModal;
