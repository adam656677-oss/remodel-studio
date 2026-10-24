/* ======================= item pictures: every library item and every placed item drawn from its real 3D model ======================= */
// A tiny project is built around the one item (a wall for a door, a corner of a room for a cabinet, a house box for siding),
// rendered once off screen, and kept as an image. Pictures follow every option: style, size, color, hardware and handing.
const PIC_BG=0xeef1f4;const _picCache=new Map();const _picQueue=[];let _picBusy=false;
function picLevel(){return {id:'pv-l',name:'Preview',elevation:0,height:96};}
function picBase(p){const b=blankProject();return {...b,id:'preview',name:'Preview',levels:[picLevel()],walls:[],openings:[],rooms:[],fixtures:[],roofs:[],elec:[],stairs:[],ramps:[],shapes:[],dims:[],annos:[],
  settings:{...b.settings,...(p&&p.settings?{cab:p.settings.cab,trim:p.settings.trim,trimColor:p.settings.trimColor,hwFinish:p.settings.hwFinish,counter:p.settings.counter}:{}),gradeOffset:0,ada:false},site:p&&p.site};}
const pvWall=(id,x1,y1,x2,y2,kind,thick,extra={})=>({id,level:'pv-l',x1,y1,x2,y2,thick:thick||(kind==='exterior'?6.5:4.5),kind,bearing:false,height:null,status:'new',...extra});
// door or window: interior doors stand in one wall, exterior ones in the front of a small house so inside and outside are known
function picOpeningProject(p,o,real){const q=picBase(p);const ext=real?real.ext:!!(o.ext||o.type==='window'||o.dtype==='overhead'||['storefront','metal','garageglass','garage'].includes(o.style));
  const W=Math.max(o.width+60,108),D=280;const op={...o,id:'pv-o',wall:'pv-w1',pos:W/2,status:'new'};
  if(o.type==='door'&&real&&real.h){const h=real.h;const hr=/^RH/.test(h.res);const out=/outswing/.test(h.res);const dt=o.dtype||'swing';
    if(dt==='swing'||dt==='double'){op.hinge=hr?1:0;op.swing=ext?(out?1:-1):1;}else{op.hinge=/right|XO/.test(h.res)?1:0;op.swing=ext?-1:1;}}
  if(ext){q.walls=[pvWall('pv-w1',-W/2,0,W/2,0,'exterior',null,{siding:real&&real.siding}),pvWall('pv-w2',W/2,0,W/2,-D,'exterior'),pvWall('pv-w3',W/2,-D,-W/2,-D,'exterior'),pvWall('pv-w4',-W/2,-D,-W/2,0,'exterior')];
    q.rooms=[{id:'pv-r',level:'pv-l',name:'Inside',use:'living',pts:[[-W/2,-D],[W/2,-D],[W/2,0],[-W/2,0]]}];}
  else{q.walls=[pvWall('pv-w1',-W/2,0,W/2,0,'interior')];q.rooms=[{id:'pv-r1',level:'pv-l',name:'Room',use:'living',pts:[[-W/2,-60],[W/2,-60],[W/2,0],[-W/2,0]]},{id:'pv-r2',level:'pv-l',name:'Room',use:'living',pts:[[-W/2,0],[W/2,0],[W/2,60],[-W/2,60]]}];}
  q.openings=[op];return {q,ext,focus:{x:0,y:0,z:(o.type==='window'?(o.sill||0):0)+o.height/2,w:o.width+(o.type==='door'?10:14),h:o.height+(o.type==='door'?8:16)}};}
const WALL_ITEMS=new Set(['wallcab','base','sinkbase','tall','vanity','range','fridge','dw','washer','dryer','toilet','lav','tub','shower','rollin','grabbar','mirror','hood']);
function picFixtureProject(p,f){const q=picBase(p);const fx={...f,id:'pv-f',level:'pv-l',x:0,y:0,rot:0,status:'new'};const w=f.w||24,d=f.d||24;
  if(WALL_ITEMS.has(f.type)||/cab|vanity|base/.test(f.type||'')){q.walls=[pvWall('pv-wb',-w/2-30,-d/2-2.25,w/2+30,-d/2-2.25,'interior')];}
  const R=Math.max(w,d)/2+36;q.rooms=[{id:'pv-r',level:'pv-l',name:'',use:f.type==='toilet'||f.type==='lav'||f.type==='tub'?'bath':'kitchen',pts:[[-R,-d/2-2.25],[R,-d/2-2.25],[R,R],[-R,R]],finish:'lvp'}];
  q.fixtures=[fx];const z0=f.elev||0,h=f.h||30;return {q,focus:{x:0,y:0,z:z0+h/2,w:Math.max(w,12),h:Math.max(h,12),d}};}
function picFinishProject(p,it){const q=picBase(p);
  if(it.place==='floor'||it.place==='wallfin'||it.place==='ceiling'){const S=84;q.walls=[pvWall('pv-a',-S,-S,S,-S,'interior'),pvWall('pv-b',-S,S,-S,-S,'interior')];
    q.rooms=[{id:'pv-r',level:'pv-l',name:'',use:'living',pts:[[-S,-S],[S,-S],[S,S],[-S,S]],...(it.place==='floor'?{finish:it.key}:it.place==='wallfin'?{wallFinish:it.key}:{ceiling:it.key})}];
    return {q,cam:it.place==='floor'?{pos:[60,110,140],tgt:[-10,0,-10]}:it.place==='ceiling'?{pos:[50,40,60],tgt:[-40,100,-40],walk:true}:{pos:[90,70,120],tgt:[-40,45,-60]}};}
  if(it.place==='roof'||it.place==='siding'){const W=120,D=96;q.walls=[pvWall('pv-w1',-W/2,D/2,W/2,D/2,'exterior'),pvWall('pv-w2',W/2,D/2,W/2,-D/2,'exterior'),pvWall('pv-w3',W/2,-D/2,-W/2,-D/2,'exterior'),pvWall('pv-w4',-W/2,-D/2,-W/2,D/2,'exterior')];
    if(it.place==='siding')q.walls=q.walls.map(w=>({...w,siding:it.key}));q.rooms=[{id:'pv-r',level:'pv-l',name:'',use:'living',pts:[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2]]}];
    q.roofs=[{id:'pv-roof',level:'pv-l',style:'gable',pitch:7,overhang:12,ridge:'x',x:-W/2-3.25,y:-D/2-3.25,w:W+6.5,h:D+6.5,framing:{system:'rafters',rafter:'2x8',spacing:16,species:'syp2',cover:it.place==='roof'?it.key:'asphalt'}}];
    return {q,cam:it.place==='roof'?{pos:[150,190,200],tgt:[0,90,0]}:{pos:[70,70,190],tgt:[0,55,0]}};}
  return null;}
// render a tiny project off screen; cam in inches (x, up, plan y)
function snapPreview(q,{w=160,h=120,cam,focus,front=1}={}){const R=snapRenderer(w,h);const scene=new THREE.Scene();scene.background=new THREE.Color(PIC_BG);
  scene.add(new THREE.HemisphereLight(0xf4f7ff,0x9a958a,0.55));const sun=new THREE.DirectionalLight(0xfff6e8,0.62);sun.position.set(-4,9,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-0.0005;
  const sc=sun.shadow.camera;sc.left=sc.bottom=-12;sc.right=sc.top=12;scene.add(sun);scene.add(sun.target);const fill=new THREE.DirectionalLight(0xffffff,0.25);fill.position.set(5,3,-6);scene.add(fill);
  const st={model:new THREE.Group(),sun,camera:new THREE.PerspectiveCamera(32,w/h,0.05,500)};scene.add(st.model);
  const keep=CUR_TAG;try{buildModel(st,q,'pv-l',null,{cutaway:false,showRoof:!!(q.roofs&&q.roofs.length),layer:'proposed',interior:!!(cam&&cam.walk)});}finally{CUR_TAG=keep;}
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xd9dccf,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-0.03;ground.receiveShadow=true;scene.add(ground);
  const c=st.camera;if(cam){c.position.set(cam.pos[0]*IN,cam.pos[1]*IN,cam.pos[2]*IN);c.lookAt(cam.tgt[0]*IN,cam.tgt[1]*IN,cam.tgt[2]*IN);}
  else if(focus){const vf=c.fov*Math.PI/180;const need=Math.max(focus.h/2/Math.tan(vf/2),focus.w/2/Math.tan(vf/2)/c.aspect)*1.12;const dist=need+(focus.d||0)/2;
    const tx=focus.x*IN,ty=focus.z*IN,tz=focus.y*IN;const ang=front===0?0:0.32*(front<0?-1:1);const side=front<0?-1:1;
    c.position.set(tx+Math.sin(ang)*dist*IN,ty+dist*IN*0.16,tz+side*Math.cos(ang)*dist*IN);c.lookAt(tx,ty,tz);}
  applyMetalEnv(st.model,R);sun.target.position.set(0,0,0);R.render(scene,c);const url=R.domElement.toDataURL('image/png');
  st.model.traverse(o=>{if(o.geometry)o.geometry.dispose();});ground.geometry.dispose();return url;}
// what to build for a library item or a placed object
function picJob(kind,obj,p,opts={}){
  if(kind==='opening'||kind==='draft'||obj.place==='door'||obj.place==='window'){const o=obj.place?openingFromLib(obj):obj;let real=null;
    if(kind==='opening'&&p&&p.walls.find(w=>w.id===o.wall)){const S=doorSides(p,o);real={ext:S&&S.ext,h:o.type==='door'?doorHanding(p,o):null,siding:S&&S.w.siding};}
    if(obj.place==='door'&&obj.ext)o.ext=true;const {q,focus}=picOpeningProject(p,o,real);return {q,focus,front:opts.back?-1:1};}
  if(kind==='fixture'||obj.place==='fixture'){const f=obj.place?{type:obj.base,lib:obj.id,name:obj.label,w:obj.w,d:obj.d,h:obj.h,elev:obj.elev??(FIXTURES[obj.base]?.elev||0),...(obj.cab?{cab:obj.cab}:{}),...(obj.fx||{})}:obj;
    const {q,focus}=picFixtureProject(p,f);return {q,focus,front:opts.back?-1:1};}
  if(kind==='plant'||obj.place==='plant'){const q=picBase(p);const o={...(obj.place?{sp:obj.sp}:obj),id:'pv-p',level:'pv-l',x:0,y:0,status:'new'};q.plants=[o];q.settings={...q.settings,land:{...(p&&p.settings?.land||{}),show:'mature'}};const S=PLANTS_SP[o.sp]||PLANTS_SP.boxwood;const s=o.d||S.s,h=o.h||S.h;
    return {q,focus:{x:0,y:0,z:h/2,w:s*1.05,h:h*1.05,d:s*0.3},front:1};}
  if(kind==='play'||obj.place==='play'){const q=picBase(p);const o={...(obj.place?{key:obj.key}:obj),id:'pv-g',level:'pv-l',x:0,y:0,rot:0,status:'new'};q.play=[o];const c=PLAY[o.key]||{};const fp=playFoot(o);
    return {q,focus:{x:0,y:0,z:(c.h||96)/2,w:Math.max(fp.w,fp.d)*1.1,h:(c.h||96)*1.1,d:fp.d*0.5},front:1};}
  if(['floor','wallfin','ceiling'].includes(obj.place)){const hex=obj.place==='floor'?(FLOOR_COLOR[obj.key]??0xb89a74):obj.place==='wallfin'?(WALLFIN_COL[obj.key]??0xe9e5dc):((CEILINGS[obj.key]||[])[1]??0xf8f6f2);return {swatch:[obj.place,obj.key,hex]};}
  if(['roof','siding'].includes(obj.place)){const r=picFinishProject(p,obj);if(r)return {q:r.q,cam:r.cam};}
  return null;}
function picKey(kind,obj,p,opts){const s=p&&p.settings?JSON.stringify([p.settings.cab,p.settings.trimColor,p.settings.hwFinish,p.settings.trim]):'';
  let o=obj;if(kind==='opening'&&p){const S=doorSides(p,obj);o={...obj,_h:obj.type==='door'?doorHanding(p,obj).res:'',_e:S&&S.ext,_s:S&&S.w.siding,pos:0,wall:0,id:0};}
  if(kind==='fixture'||kind==='plant'||kind==='play')o={...obj,x:0,y:0,rot:0,id:0,level:0};return kind+'|'+JSON.stringify(o)+'|'+s+'|'+JSON.stringify(opts||{});}
function requestPic(kind,obj,p,opts={}){const key=picKey(kind,obj,p,opts);if(_picCache.has(key))return Promise.resolve(_picCache.get(key));
  return new Promise(res=>{_picQueue.push({key,kind,obj,p,opts,res});pumpPics();});}
function pumpPics(){if(_picBusy||!_picQueue.length)return;_picBusy=true;
  const run=()=>{const job=_picQueue.shift();if(!job){_picBusy=false;return;}
    if(_picCache.has(job.key)){job.res(_picCache.get(job.key));}
    else{let url=null;try{const j=picJob(job.kind,job.obj,job.p,job.opts);if(j&&j.swatch)url=finishSwatch(j.swatch[0],j.swatch[1],j.swatch[2],job.opts.w||160,job.opts.h||120);else if(j)url=snapPreview(j.q,{w:job.opts.w||160,h:job.opts.h||120,cam:j.cam,focus:j.focus,front:j.front});}catch(e){console.error('picture',e);}
      if(_picCache.size>600)_picCache.delete(_picCache.keys().next().value);_picCache.set(job.key,url);job.res(url);}
    if(_picQueue.length)setTimeout(run,0);else _picBusy=false;};
  setTimeout(run,0);}
// lazy picture: renders when it scrolls into view
function ItemPic({kind,obj,p,w=160,h=120,className='',alt='',back=false,eager=false}){const [url,setUrl]=useState(()=>_picCache.get(picKey(kind,obj,p,{w,h,back}))||null);const ref=useRef(null);const [seen,setSeen]=useState(eager);
  useEffect(()=>{if(seen||!ref.current)return;if(typeof IntersectionObserver==='undefined'){setSeen(true);return;}const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){setSeen(true);io.disconnect();}},{rootMargin:'200px'});io.observe(ref.current);return ()=>io.disconnect();},[seen]);
  const key=picKey(kind,obj,p,{w,h,back});
  useEffect(()=>{if(!seen)return;let live=true;const c=_picCache.get(key);if(c!==undefined){setUrl(c);return;}requestPic(kind,obj,p,{w,h,back}).then(u=>{if(live)setUrl(u);});return ()=>{live=false;};},[key,seen]);
  return html`<span ref=${ref} className=${'itempic '+className} style=${{aspectRatio:w+' / '+h}}>${url?html`<img src=${url} alt=${alt} draggable="false"/>`:html`<span className="itempic-wait" aria-hidden="true"></span>`}</span>`;}
