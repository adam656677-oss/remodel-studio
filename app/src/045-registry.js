/* ======================= object and tool registry ======================= */
// Building parts added after the first release (decks, steps, columns, railings, dormers, CAD lines and so on)
// register here once. The plan, 3D, inspector, sheets, elevations, materials, estimate and code checks all
// read this registry, so a new part only has to describe itself.
//
// regObj(kind, {
//   coll, label, plural, z (draw/hit order), layer:'under'|'over',
//   svg(p,lv,o,S,view,isSel)      plan drawing (returns htm nodes)
//   hit(p,o,raw,tol)               true when raw (inches) is on the part
//   move(o,dx,dy,p)                moved copy
//   pts(p,o)                       outline points [{x,y}] for fit, box select and sheets
//   dl(dl,p,lv,o,PT,k,sc)          paper drawing on plan sheets
//   faces(p,lv,o,F)                push elevation faces
//   add3D(p,lv,o,ctx)              3D: ctx={add,std,sel,mSel,M,box,cyl,layer}
//   panel(o,ctx)                   inspector body: ctx={p,up,commit,setSel,lv}
//   title(o,p)                     inspector heading
//   takeoff(p,add,W) / checks(p,add)   once per collection
//   rotate(o) / roofish / noCopyOffset
// })
const OBJ={};
let CUR_TAG=null; // what the 3D meshes being built belong to (for clicking in 3D)
function regObj(kind,def){OBJ[kind]={label:kind,plural:kind+'s',z:0,layer:'over',...def};COLL[kind]=def.coll;if(!MODEL_KEYS.includes(def.coll))MODEL_KEYS.push(def.coll);}
const objsOn=(p,kind,lvId)=>(p[OBJ[kind].coll]||[]).filter(o=>o.level===lvId);
const objKinds=(layer)=>Object.keys(OBJ).filter(k=>!layer||OBJ[k].layer===layer).sort((a,b)=>OBJ[a].z-OBJ[b].z);
function regHit(p,lv,raw,tol,stage){
  for(const k of objKinds().reverse()){const d=OBJ[k];if(!d.hit||(stage&&(d.hitStage||'early')!==stage))continue;
    const list=objsOn(p,k,lv.id);for(let i=list.length-1;i>=0;i--)if(d.hit(p,list[i],raw,tol))return {kind:k,o:list[i]};}
  return null;}
function regMove(B,kind,id,dx,dy){const d=OBJ[kind];const c=d.coll;return {...B,[c]:(B[c]||[]).map(o=>o.id===id?d.move(o,dx,dy,B):o)};}
function regPts(p,kind,o){const d=OBJ[kind];return d&&d.pts?d.pts(p,o):(o.x!=null?[{x:o.x,y:o.y}]:[]);}
const REG_EXTRA=[];function regExtra(def){REG_EXTRA.push(def);}
function regTakeoff(p,add,W){for(const x of REG_EXTRA)if(x.takeoff)try{x.takeoff(p,add,W);}catch(e){console.error(e);}for(const k of objKinds()){const d=OBJ[k];if(d.takeoff)try{d.takeoff(p,add,W);}catch(e){console.error(k,e);}}}
function regChecks(p,add){for(const x of REG_EXTRA)if(x.checks)try{x.checks(p,add);}catch(e){console.error(e);}for(const k of objKinds()){const d=OBJ[k];if(d.checks)try{d.checks(p,add);}catch(e){console.error(k,e);}}}
// rectangle helpers used by many parts
function rectCorners(cx,cy,w,d,ang){const c=Math.cos(ang),s=Math.sin(ang);return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>({x:cx+u*c-v*s,y:cy+u*s+v*c}));}
const ptsIn=(raw,pts)=>inPoly(raw.x,raw.y,pts.map(q=>[q.x,q.y]));
const nearPolyline=(raw,pts,tol,closed)=>{for(let i=0;i<pts.length-(closed?0:1);i++){const a=pts[i],b=pts[(i+1)%pts.length];if(projSeg(raw,a,b).d<tol)return true;}return false;};
// elevation face helpers: a box as six faces with outward normals (back faces are dropped by the view)
function boxFaces(F,cx,cy,z0,w,d,h,ang,kind,extra={}){const C=rectCorners(cx,cy,w,d,ang);const z1=z0+h;
  for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4];const ex=b.x-a.x,ey=b.y-a.y,L=Math.hypot(ex,ey)||1;const n={x:ey/L,y:-ex/L};
    F.push({kind,pts:[[a.x,a.y,z0],[b.x,b.y,z0],[b.x,b.y,z1],[a.x,a.y,z1]],n,...extra});}
  F.push({kind,pts:C.map(q=>[q.x,q.y,z1]),n:null,top:true,...extra});}
function polyFaces(F,pts,z0,z1,kind,extra={}){ // vertical prism
  let a2=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];a2+=a.x*b.y-b.x*a.y;}const sg=a2>0?1:-1;
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];const ex=b.x-a.x,ey=b.y-a.y,L=Math.hypot(ex,ey)||1;const n={x:sg*ey/L,y:-sg*ex/L};
    F.push({kind,pts:[[a.x,a.y,z0],[b.x,b.y,z0],[b.x,b.y,z1],[a.x,a.y,z1]],n,...extra});}}

/* ---- tools added through the registry ---- */
// regTool(id,{label,key,group,icon,mode:'click'|'two'|'chain'|'rect', min, place(ctx,pts,info)->{p,sel,keep}, ghost(ctx,pts,cursor,S,view), hint(n), snap:'grid'|'free'|'wall'})
const XTOOLS={};
function regTool(id,def){XTOOLS[id]={mode:'click',snap:'grid',...def};}
// tool groups shown in the left rail; built-in tools are listed by id
const TOOL_GROUPS=[
  {id:'select',label:'Select',tools:['select']},
  {id:'walls',label:'Walls',tools:['wall']},
  {id:'openings',label:'Doors and windows',tools:['door','window']},
  {id:'rooms',label:'Rooms',tools:['room']},
  {id:'interior',label:'Cabinets and fixtures',tools:['fixture']},
  {id:'stairs',label:'Stairs and rails',tools:['stair']},
  {id:'roof',label:'Roof',tools:['roof']},
  {id:'exterior',label:'Exterior',tools:['ramp']},
  {id:'site',label:'Site',tools:[]},
  {id:'mep',label:'Electrical and plumbing',tools:['elec']},
  {id:'draft',label:'Drafting',tools:['shape','dim','note']},
  {id:'measure',label:'Measure',tools:['measure']},
];
function addToolToGroup(group,id,after){const g=TOOL_GROUPS.find(g=>g.id===group);if(!g||g.tools.includes(id))return;const i=after?g.tools.indexOf(after):-1;if(i>=0)g.tools.splice(i+1,0,id);else g.tools.push(id);}

/* ---- 3D helpers handed to each part (all inputs in inches, plan x/y and elevation z) ---- */
function reg3DCtx(add,std,sel,mSel,layer,struct,opts,p,lv,group){
  const isSel=o=>!!sel&&(sel.id===o.id||(sel.kind==='multi'&&sel.items.some(i=>i.id===o.id)));
  const col=(c,extra)=>{const {key,...rest}=extra||{};return std('c-'+c+(key||'')+(rest.map?'-map':''),c,rest);};
  // box centered on (cx,cy) in plan, bottom at z0, rotated by ang (radians, plan)
  const box=(cx,cy,z0,w,d,h,ang,mat,shadow=true)=>add(new THREE.BoxGeometry(Math.max(0.01,w)*IN,Math.max(0.01,h)*IN,Math.max(0.01,d)*IN),mat,cx*IN,(z0+h/2)*IN,cy*IN,-(ang||0),shadow);
  const cyl=(cx,cy,z0,r,h,mat,seg=16,rTop)=>add(new THREE.CylinderGeometry((rTop??r)*IN,r*IN,h*IN,seg),mat,cx*IN,(z0+h/2)*IN,cy*IN,0);
  // a stick between two 3D points (rails, rafters, braces)
  const stick=(a,b,w,h,mat,round)=>{const v=new THREE.Vector3((b.x-a.x)*IN,(b.z-a.z)*IN,(b.y-a.y)*IN);const L=v.length();if(L<1e-6)return null;
    const g=round?new THREE.CylinderGeometry(w/2*IN,w/2*IN,L,10):new THREE.BoxGeometry(w*IN,L,h*IN);const m=add(g,mat,(a.x+b.x)/2*IN,(a.z+b.z)/2*IN,(a.y+b.y)/2*IN,0,false);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());if(!round){/* keep the board's wide face vertical */}return m;};
  // prism from a plan polygon [{x,y}] between z0 and z1
  const prism=(pts,z0,z1,mat,holes=[])=>{if(pts.length<3)return null;const sh=new THREE.Shape(pts.map(q=>new THREE.Vector2(q.x*IN,q.y*IN)));for(const h of holes)sh.holes.push(new THREE.Path(h.map(q=>new THREE.Vector2(q.x*IN,q.y*IN))));
    const g=new THREE.ExtrudeGeometry(sh,{depth:(z1-z0)*IN,bevelEnabled:false});g.rotateX(Math.PI/2);return add(g,mat,0,z1*IN,0,0);};
  // triangles [[x,y,z],...] in inches
  const tris=(list,mat,shadow=true)=>{const arr=[];for(const t of list)for(const v of t)arr.push(v[0]*IN,v[2]*IN,v[1]*IN);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));g.computeVertexNormals();return add(g,mat,0,0,0,0,shadow);};
  const quad=(a,b,c,d)=>[[a,b,c],[a,c,d]];
  // railing along a 3D polyline: posts, top and bottom rails, balusters 4" apart (IRC R312.1.3)
  const railing=(pts,o={})=>{const H=o.h||36,style=o.style||'baluster';const m=o.mat||col(o.color?hexNum(o.color):0xf4f2ec,{roughness:.6});
    const mk=o.metal?col(0x2f3235,{roughness:.4,metalness:.5}):m;
    for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1];const L=Math.hypot(b.x-a.x,b.y-a.y);if(L<1)continue;
      const top=(q,dz)=>({x:q.x,y:q.y,z:q.z+dz});
      stick(top(a,H),top(b,H),3.5,1.5,m);
      if(style!=='glass'&&style!=='cable')stick(top(a,3.5),top(b,3.5),3.5,1.5,m);
      const nPost=Math.max(1,Math.ceil(L/(o.postSpacing||72)));for(let j=0;j<=nPost;j++){const t=j/nPost;const q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};if(j===0&&i>0)continue;box(q.x,q.y,q.z,3.5,3.5,H+2,0,m);}
      if(style==='baluster'||style==='metal'){const n=Math.floor(L/5.5);for(let j=1;j<n;j++){const t=j/n;const q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};box(q.x,q.y,q.z+3.5,1.5,1.5,H-3.5,0,style==='metal'?col(0x2f3235,{roughness:.4,metalness:.5}):m,false);}}
      else if(style==='glass'){const gm=M('railglass',()=>new THREE.MeshStandardMaterial({color:0xbfd8e6,transparent:true,opacity:.3,roughness:.05,depthWrite:false}));const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const za=(a.z+b.z)/2;box(mid.x,mid.y,za+2,L,0.5,H-4,Math.atan2(b.y-a.y,b.x-a.x),gm,false);}
      else if(style==='cable'){for(let z=6;z<H-2;z+=3)stick(top(a,z),top(b,z),0.25,0.25,col(0x8a8f94,{metalness:.6,roughness:.3}),true);}
      else if(style==='board'){const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};box(mid.x,mid.y,(a.z+b.z)/2+3.5,L,0.75,H-3.5,Math.atan2(b.y-a.y,b.x-a.x),m);}}};
  return {add,std,col,sel,mSel,isSel,layer,struct,opts,p,lv,box,cyl,stick,prism,tris,quad,railing,group,matFor:(o,c,extra)=>isSel(o)?mSel:col(c,extra)};
}

// dialogs opened from anywhere: window.dispatchEvent(new CustomEvent('rs-dialog',{detail:name}))
const EXTRA_DIALOGS={};const openDialog=name=>window.dispatchEvent(new CustomEvent('rs-dialog',{detail:name}));
