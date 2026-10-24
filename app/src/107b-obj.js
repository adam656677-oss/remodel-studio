/* ======================= import an OBJ model (SketchUp, Blender, manufacturer downloads) as furniture or a fixture ======================= */
FIXTURES.model={label:'Imported 3D model',cat:'Furniture',w:24,d:24,h:30,color:0xb8ad9a,free:true};
const MODEL_CACHE={};
function parseOBJ(text,unit,up){const k={in:1,ft:12,m:39.3701,cm:1/2.54,mm:1/25.4}[unit]||1;const V=[];const tris=[];let faces=0;
  for(const line of text.split(/\r?\n/)){if(line.startsWith('v ')){const a=line.trim().split(/\s+/);V.push([+a[1],+a[2],+a[3]]);}
    else if(line.startsWith('f ')){const idx=line.trim().split(/\s+/).slice(1).map(t=>{const i=parseInt(t.split('/')[0],10);return i<0?V.length+i:i-1;});for(let i=1;i+1<idx.length;i++)tris.push(idx[0],idx[i],idx[i+1]);faces++;}}
  if(!V.length||!tris.length)throw new Error('No geometry found. Export the model as OBJ with faces (triangles or polygons).');
  const maxT=200000;const step=tris.length/3>maxT?Math.ceil(tris.length/3/maxT):1;
  // plan x, plan y, height
  const P=V.map(([x,y,z])=>up==='z'?[x*k,-y*k,z*k]:[x*k,z*k,y*k]);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;for(const [x,y,z] of P){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);z0=Math.min(z0,z);z1=Math.max(z1,z);}
  const cx=(x0+x1)/2,cy=(y0+y1)/2;const out=[];for(let t=0;t<tris.length;t+=3*step)for(let j=0;j<3;j++){const q=P[tris[t+j]];if(!q)continue;out.push(q[0]-cx,q[1]-cy,q[2]-z0);}
  return {pos:new Float32Array(out),w:x1-x0,d:y1-y0,h:z1-z0,tris:out.length/9,thinned:step>1};}
async function loadModels(projectId){try{const list=await assetList(projectId||'default');let n=0;for(const a of list)if(a.kind==='model'&&!MODEL_CACHE[a.id]){MODEL_CACHE[a.id]={pos:a.pos instanceof Float32Array?a.pos:new Float32Array(a.pos),w:a.w,d:a.d,h:a.h};n++;}
  if(n)window.dispatchEvent(new Event('rs-models'));}catch(e){}}
const _modelGeo={};
function modelMesh3D(f,lv,add,std,isSel,mSel,col){const M=MODEL_CACHE[f.model];if(!M)return false;const key=f.model+'|'+f.w+'|'+f.d+'|'+f.h;let g=_modelGeo[key];
  if(!g){const sx=f.w/(M.w||1),sy=f.d/(M.d||1),sz=f.h/(M.h||1);const a=new Float32Array(M.pos.length);for(let i=0;i<M.pos.length;i+=3){a[i]=M.pos[i]*sx*IN;a[i+1]=M.pos[i+2]*sz*IN;a[i+2]=M.pos[i+1]*sy*IN;}
    g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));g.computeVertexNormals();_modelGeo[key]=g;}
  const m=add(g,isSel?mSel:std('model-'+col,col,{roughness:.7,side:THREE.DoubleSide}),f.x*IN,(lv.elevation+(f.elev||0))*IN,f.y*IN,-(f.rot||0)*Math.PI/180);return !!m;}
function OBJImportModal({p,levelId,commit,setSel,onClose}){const [unit,setUnit]=useState('in');const [up,setUp]=useState('y');const [msg,setMsg]=useState(null);const [busy,setBusy]=useState(false);
  const pick=async e=>{const f=e.target.files[0];if(!f)return;setBusy(true);try{const M=parseOBJ(await f.text(),unit,up);if(M.w<1||M.d<1||M.h<0.5)throw new Error(`The model is only ${fmtLen(M.w)} x ${fmtLen(M.d)} x ${fmtLen(M.h)}. Check the units.`);
      const id=uid('md');await assetPut({id,project:p.id||'default',kind:'model',name:f.name,date:new Date().toISOString(),pos:M.pos,w:M.w,d:M.d,h:M.h});MODEL_CACHE[id]={pos:M.pos,w:M.w,d:M.d,h:M.h};
      const B=planBounds(p,levelId);const fx={id:uid('fx'),level:levelId,type:'model',model:id,name:f.name.replace(/\.obj$/i,''),x:(B.x0+B.x1)/2,y:(B.y0+B.y1)/2,w:Math.round(M.w*4)/4,d:Math.round(M.d*4)/4,h:Math.round(M.h*4)/4,elev:0,rot:0,status:'new'};
      commit({...p,fixtures:[...(p.fixtures||[]),fx]});setSel({kind:'fixture',id:fx.id});setMsg({ok:true,t:`Placed "${fx.name}": ${fmtLen(fx.w)} x ${fmtLen(fx.d)} x ${fmtLen(fx.h)}, ${M.tris.toLocaleString()} triangles${M.thinned?' (thinned to keep it fast)':''}. Drag it into place; size and color are in its panel.`});}
    catch(err){setMsg({ok:false,t:err.message||'That file could not be read.'});}setBusy(false);e.target.value='';};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-label="Import 3D model">
    <h2>Import a 3D model</h2><p className="note">Bring in furniture, appliances or fixtures as OBJ files: from SketchUp (File › Export › 3D Model › OBJ), Blender, or a manufacturer's download page. Colors and textures are not brought in; pick a color in its panel.</p>
    <div className="grid2"><${Field} label="Model units" id="ob-u"><${Sel} id="ob-u" value=${unit} onChange=${setUnit} options=${[['in','Inches'],['ft','Feet'],['m','Meters'],['cm','Centimeters'],['mm','Millimeters']]}/><//>
      <${Field} label="Up direction" id="ob-up"><${Sel} id="ob-up" value=${up} onChange=${setUp} options=${[['y','Y is up (most OBJ files)'],['z','Z is up (SketchUp, some CAD)']]}/><//></div>
    <div className="row"><label className="btn primary" htmlFor="ob-file">${busy?'Reading…':'Choose OBJ file…'}</label><input id="ob-file" type="file" accept=".obj" hidden onChange=${pick}/><span className="spacer"></span><button className="btn" onClick=${onClose}>Done</button></div>
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}</div></div>`;}
