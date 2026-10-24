/* ======================= 360° panorama: cube capture from the 3D camera, saved as an equirectangular image with a drag-to-look viewer ======================= */
function makePanorama(st,W=4096){const {renderer,scene,camera}=st;const H=W/2;const size=Math.min(2048,renderer.capabilities.maxCubemapSize||2048);
  const cubeRT=new THREE.WebGLCubeRenderTarget(size,{generateMipmaps:false});const cubeCam=new THREE.CubeCamera(0.2,2000,cubeRT);cubeCam.position.copy(camera.position);
  const hidden=[];scene.traverse(o=>{if(o.userData&&o.userData.noPano&&o.visible){o.visible=false;hidden.push(o);}});
  cubeCam.update(renderer,scene);hidden.forEach(o=>o.visible=true);
  const mat=new THREE.ShaderMaterial({uniforms:{map:{value:cubeRT.texture},yaw:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:'uniform samplerCube map;uniform float yaw;varying vec2 vUv;const float PI=3.14159265359;void main(){float lon=(vUv.x-0.5)*2.*PI+yaw;float lat=(vUv.y-0.5)*PI;vec3 d=vec3(cos(lat)*sin(lon),sin(lat),-cos(lat)*cos(lon));gl_FragColor=textureCube(map,d);}',depthTest:false,depthWrite:false});
  const dir=new THREE.Vector3();camera.getWorldDirection(dir);mat.uniforms.yaw.value=Math.atan2(dir.x,-dir.z);
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);const sc=new THREE.Scene();sc.add(quad);const oc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const rt=new THREE.WebGLRenderTarget(W,H);const prevTM=renderer.toneMapping;renderer.setRenderTarget(rt);renderer.render(sc,oc);
  const buf=new Uint8Array(W*H*4);renderer.readRenderTargetPixels(rt,0,0,W,H,buf);renderer.setRenderTarget(null);renderer.toneMapping=prevTM;
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');const img=g.createImageData(W,H);
  for(let y=0;y<H;y++){const src=(H-1-y)*W*4;img.data.set(buf.subarray(src,src+W*4),y*W*4);}g.putImageData(img,0,0);
  cubeRT.dispose();rt.dispose();mat.dispose();quad.geometry.dispose();st.render&&st.render();return cv;}
function PanoViewer({url}){const host=useRef(null);
  useEffect(()=>{if(!host.current||!url)return;const r=new THREE.WebGLRenderer({antialias:true});const el=host.current;r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));el.appendChild(r.domElement);
    const scene=new THREE.Scene();const cam=new THREE.PerspectiveCamera(75,1,0.1,100);const tex=new THREE.TextureLoader().load(url,()=>draw());tex.encoding=THREE.sRGBEncoding;
    const geo=new THREE.SphereGeometry(10,64,32);geo.scale(-1,1,1);scene.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex})));
    let lon=0,lat=0,fov=75,drag=null;const draw=()=>{const R=el.getBoundingClientRect();r.setSize(R.width,R.height,false);cam.aspect=R.width/Math.max(1,R.height);cam.fov=fov;cam.updateProjectionMatrix();
      const phi=(90-lat)*Math.PI/180,th=lon*Math.PI/180;cam.lookAt(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));r.render(scene,cam);};
    const dn=e=>{drag={x:e.clientX,y:e.clientY,lon,lat};el.setPointerCapture(e.pointerId);};const mv=e=>{if(!drag)return;lon=drag.lon-(e.clientX-drag.x)*0.15;lat=Math.max(-85,Math.min(85,drag.lat+(e.clientY-drag.y)*0.15));draw();};const up=()=>{drag=null;};
    const wh=e=>{e.preventDefault();fov=Math.max(30,Math.min(100,fov+e.deltaY*0.04));draw();};
    el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('wheel',wh,{passive:false});const ro=new ResizeObserver(draw);ro.observe(el);lon=-90;draw();
    return ()=>{ro.disconnect();el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('wheel',wh);tex.dispose();geo.dispose();r.dispose();r.domElement.remove();};},[url]);
  return html`<div ref=${host} className="panoview" aria-label="360 degree panorama, drag to look around"></div>`;}
function PanoModal({p,onClose}){const [url,setUrl]=useState(null);const [msg,setMsg]=useState(null);const [busy,setBusy]=useState(true);const blob=useRef(null);
  useEffect(()=>{const st=window.__view3d;if(!st){setMsg({ok:false,t:'Open the 3D view first, then pick a spot (Walk through works best).'});setBusy(false);return;}
    setTimeout(()=>{try{const cv=makePanorama(st);cv.toBlob(b=>{blob.current=b;setUrl(URL.createObjectURL(b));setBusy(false);},'image/jpeg',0.92);}catch(e){setMsg({ok:false,t:'Could not make the panorama: '+(e.message||e)});setBusy(false);}},50);
    return ()=>{if(url)URL.revokeObjectURL(url);};},[]);
  const save=async()=>{if(blob.current)setMsg(await saveFile(safeName(p.name)+' 360.jpg',blob.current));};
  const keep=async()=>{if(!blob.current)return;const fr=new FileReader();fr.onload=async()=>{await assetPut({id:uid('rn'),project:p.id||'default',kind:'render',name:'360° panorama',date:new Date().toISOString(),url:fr.result,w:4096,h:2048,pano:true});setMsg({ok:true,t:'Added to the render gallery and board presentation.'});};fr.readAsDataURL(blob.current);};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide panomodal" role="dialog" aria-label="360 panorama"><h2>360° panorama</h2>
    <p className="note">Taken from the current 3D camera spot. Drag to look around, scroll to zoom. The saved image is a standard 2:1 panorama that phones, Facebook and 360 viewers open.</p>
    ${busy?html`<div className="note">Capturing…</div>`:null}${url?html`<${PanoViewer} url=${url}/>`:null}
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
    <div className="row"><button className="btn primary" disabled=${!url} onClick=${save}>Save image</button><button className="btn" disabled=${!url} onClick=${keep}>Add to gallery</button><span className="spacer"></span><button className="btn" onClick=${onClose}>Close</button></div></div></div>`;}
EXTRA_DIALOGS.pano=PanoModal;
