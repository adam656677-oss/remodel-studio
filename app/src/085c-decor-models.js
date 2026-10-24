/* ======================= decor and furniture models: beds, seating, tables, storage, lighting, rugs, art, plants, bath accessories, outdoor, games, garage, electronics, people ======================= */
// Each builder works in the item's frame: u across the width, v from the back (-d/2) to the front (+d/2), z up from the bottom of the item.
FIXTURES.decor={label:'Furniture or decor',cat:'Furniture',w:24,d:24,h:30,color:0x9aa3ad,free:true};
FIXTURES.decorwall={label:'Wall-mounted item',cat:'Furniture',w:24,d:2,h:24,elev:48,color:0x9aa3ad,free:true};
FIXTURES.decorceil={label:'Ceiling item',cat:'Furniture',w:24,d:24,h:12,elev:84,color:0x9aa3ad,free:true};
WALL_HUNG.add('decorwall');WALL_HUNG.add('decorceil');
const DECOR_MODELS={};
const hx=c=>typeof c==='number'?c:parseInt(String(c||'888888').replace('#',''),16);
function decorG(f,lv,add,std,isSel,mSel,it){const ry=-(f.rot||0)*Math.PI/180;const e0=lv.elevation+(f.elev||0);
  const M=(key,c,o={})=>isSel?mSel:std('dc-'+key+'-'+c+(o.transparent?'t':''),c,o);
  const col=f.color?hx(f.color):hx(it.col??0x8f9aa8),wood=hx(it.wood??0x8a6a4a),metal=hx(it.metal??0x2b2b2b);
  const at=(u,v,z)=>{const q=fxLocal(f,u,v);return [q.x*IN,(e0+z)*IN,q.y*IN];};
  const put=(g,m,u,v,z)=>{const [x,y,zz]=at(u,v,z);return add(g,m,x,y,zz,ry);};
  const G={W:f.w,D:f.d,H:f.h,M,col,
    fab:M('fab',col,{roughness:.95}),wood:M('wood',wood,{roughness:.6}),dark:M('dark',0x2a2a2a,{roughness:.5}),metal:M('metal',metal,{roughness:.35,metalness:.6}),chrome:M('chrome',0xd9dcdf,{roughness:.15,metalness:.85}),
    white:M('white',0xf4f4f2,{roughness:.4}),cream:M('cream',0xf2ead9,{roughness:.9}),glass:M('glass',0xcfe4ee,{roughness:.05,transparent:true,opacity:.3}),screen:M('screen',0x111316,{roughness:.15,metalness:.3}),
    leaf:M('leaf',hx(it.leaf??0x3f7a3a),{roughness:.85}),pot:M('pot',hx(it.pot??0xb8653a),{roughness:.8}),soil:M('soil',0x3b2b1e,{roughness:1}),gold:M('gold',0xc8a45a,{roughness:.3,metalness:.8}),
    B:(u,v,z,w,d,h,m,rz=0)=>{const g=new THREE.BoxGeometry(Math.max(.05,w)*IN,Math.max(.05,h)*IN,Math.max(.05,d)*IN);if(rz)g.rotateY(rz);return put(g,m,u,v,z+h/2);},
    Cy:(u,v,z,r,h,m,seg=18,rt=null)=>put(new THREE.CylinderGeometry((rt??r)*IN,r*IN,Math.max(.05,h)*IN,seg),m,u,v,z+h/2),
    Sp:(u,v,z,r,m,sx=1,sy=1,sz=1)=>{const g=new THREE.SphereGeometry(r*IN,16,12);g.scale(sx,sz,sy);return put(g,m,u,v,z);},
    Co:(u,v,z,r,h,m,seg=18)=>put(new THREE.ConeGeometry(r*IN,h*IN,seg),m,u,v,z+h/2),
    To:(u,v,z,R,t,m,flat=true)=>{const g=new THREE.TorusGeometry(R*IN,t*IN,8,28);if(flat)g.rotateX(Math.PI/2);return put(g,m,u,v,z);},
    St:(a,b,r,m,seg=10)=>{const A=new THREE.Vector3(a[0],a[2],a[1]),Bv=new THREE.Vector3(b[0],b[2],b[1]);const L=A.distanceTo(Bv);if(L<0.01)return;const g=new THREE.CylinderGeometry(r*IN,r*IN,L*IN,seg);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),Bv.clone().sub(A).normalize()));return put(g,m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);},
    Disc:(u,v,z,r,t,m)=>{const g=new THREE.CylinderGeometry(r*IN,r*IN,t*IN,28);g.rotateX(Math.PI/2);return put(g,m,u,v,z);},
    legs:(w,d,h,s,m,inset=1.5)=>{for(const a of [-1,1])for(const b of [-1,1])G.B(a*(w/2-inset-s/2),b*(d/2-inset-s/2),0,s,s,h,m);},
    opt:it.opt||{}};
  return G;}
{const _fm=fixtureModel3D;fixtureModel3D=function(f,lv,add,std,isSel,mSel,baseCol){const it=f.lib&&LIB_BY_ID[f.lib];const k=it&&it.model;if(k&&DECOR_MODELS[k]){DECOR_MODELS[k](decorG(f,lv,add,std,isSel,mSel,it),f,it);return true;}return _fm(f,lv,add,std,isSel,mSel,baseCol);};}
const DM=(k,fn)=>{DECOR_MODELS[k]=fn;};
// ---- shared pieces ----
function dChair(G,u,v,face,m,seatH=18,back=16,w=18){G.B(u,v,seatH-2,w,w,2.5,m);G.B(u,v-face*(w/2-1),seatH,w,1.6,back,m);for(const a of [-1,1])for(const b of [-1,1])G.B(u+a*(w/2-1.5),v+b*(w/2-1.5),0,1.4,1.4,seatH-2,m);}
function dBooks(G,u0,u1,v,z,d,hmax){let u=u0,k=0;const cols=[0x7a2e2e,0x2e4e7a,0xd9c9a3,0x355e3b,0x5a4632,0xb08d57,0x3a3a3a];while(u<u1-1.2){const bw=0.9+(k*7%5)*0.25,bh=Math.min(hmax,7+(k*5%4));G.B(u+bw/2,v,z,bw,d,bh,G.M('bk'+k%7,cols[k%7],{roughness:.8}));u+=bw+0.08;k++;}}
// ---- bedroom ----
DM('bed',(G,f,it)=>{const {W,D}=G;const s=G.opt.style||'panel';const mz=s==='platform'?8:12;const frameH=s==='platform'?8:12;
  G.B(0,0,0,W,D,frameH,s==='upholstered'?G.fab:G.wood);G.B(0,1,frameH,W-2,D-3,10,G.white);G.B(0,D*0.12,frameH+10,W,D*0.7,1.6,G.fab);G.B(0,D*0.12+D*0.33,frameH+3,W+0.5,1.6,8.6,G.fab);
  for(const sgn of (W>50?[-1,1]:[0]))G.B(sgn*(W/4-1),-D/2+10,frameH+10,W>50?W/2-6:W-10,12,5,G.cream);
  const hb=s==='upholstered'?G.fab:G.wood;const hh=s==='platform'?36:s==='poster'?82:s==='upholstered'?52:48;
  if(s==='sleigh'){for(let i=0;i<8;i++){const t=i/7;G.B(0,-D/2-1-3*Math.sin(t*Math.PI/2),20+t*24,W+2,2.2,4,hb);}for(let i=0;i<6;i++){const t=i/5;G.B(0,D/2+1+2*Math.sin(t*Math.PI/2),10+t*18,W+2,2.2,4,hb);}}
  else{G.B(0,-D/2+1,0,W+2,2,hh,hb);if(s==='upholstered')for(let i=1;i<6;i++)G.Sp(-W/2+W*i/6,-D/2+2.2,hh*0.6,0.6,G.dark);if(s!=='platform')G.B(0,D/2-1,0,W+2,2,s==='poster'?30:24,hb);}
  if(s==='poster')for(const a of [-1,1])for(const b of [-1,1]){G.Cy(a*(W/2+0.5),b*(D/2-1),0,1.8,82,G.wood,12);G.Sp(a*(W/2+0.5),b*(D/2-1),83,2.2,G.wood);}
  if(s==='storage')for(const a of [-1,1])for(let i=0;i<2;i++)G.B(a*(W/2+0.1),-D/4+i*D/2.5,2,0.4,D/3,7,G.dark);});
DM('bunk',(G)=>{const {W,D}=G;for(const a of [-1,1])for(const b of [-1,1])G.B(a*(W/2-1.5),b*(D/2-1.5),0,3,3,66,G.wood);for(const z of [8,46]){G.B(0,0,z,W-2,D-2,3,G.wood);G.B(0,0,z+3,W-4,D-4,7,G.white);G.B(0,4,z+10,W-4,D-10,1.2,G.fab);G.B(0,-D/2+8,z+10,W-12,10,4,G.cream);}
  G.B(0,-D/2+1.5,58,W-2,1.5,6,G.wood);for(let i=0;i<5;i++)G.B(W/2-8,D/2-1.5,10+i*9,10,1.5,1.2,G.wood);});
DM('crib',(G)=>{const {W,D,H}=G;for(const a of [-1,1])for(const b of [-1,1])G.B(a*(W/2-1),b*(D/2-1),0,2,2,H,G.wood);G.B(0,0,14,W-2,D-2,5,G.white);G.B(0,2,19,W-6,D-6,0.8,G.fab);
  for(const b of [-1,1]){G.B(0,b*(D/2-1),H-2,W,1.5,2,G.wood);G.B(0,b*(D/2-1),12,W,1.5,2,G.wood);for(let i=1;i<Math.floor(W/3.5);i++)G.B(-W/2+i*3.5,b*(D/2-1),14,0.8,0.8,H-16,G.wood);}
  for(const a of [-1,1])for(let i=1;i<Math.floor(D/3.5);i++)G.B(a*(W/2-1),-D/2+i*3.5,14,0.8,0.8,H-16,G.wood);});
DM('nightstand',(G)=>{const {W,D,H}=G;G.B(0,0,3,W,D,H-3,G.wood);G.legs(W,D,3,1.8,G.wood,0.5);const n=G.opt.drawers||2;for(let i=0;i<n;i++){const z=3+(H-3)*(i+0.5)/n;G.B(0,D/2,z-0.4,W-2,0.3,(H-3)/n-1,G.M('front',hx(G.opt.front??0x9a7a58),{roughness:.6}));G.Sp(0,D/2+0.8,z,0.6,G.metal);}
  if(G.opt.lamp){G.Cy(-W/4,0,H,2.5,1,G.metal);G.Cy(-W/4,0,H+1,0.4,9,G.metal);G.Cy(-W/4,0,H+9,4.5,7,G.cream,18,3.2);}});
DM('dresser',(G)=>{const {W,D,H}=G;G.B(0,0,3,W,D,H-3,G.wood);G.legs(W,D,3,2,G.wood,1);const rows=G.opt.rows||Math.max(3,Math.round((H-3)/10));const cols=G.opt.cols||(W>46?2:1);const fr=G.M('front',hx(G.opt.front??0x9a7a58),{roughness:.6});
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const z=3+(H-3)*r/rows+0.5,h=(H-3)/rows-1,u=-W/2+W*(c+0.5)/cols;G.B(u,D/2,z,W/cols-1.5,0.3,h,fr);for(const s of (W/cols>24?[-1,1]:[0]))G.Sp(u+s*W/cols/4,D/2+0.8,z+h/2,0.6,G.metal);}
  if(G.opt.mirror){G.B(0,-D/2+1,H,W*0.8,1.2,34,G.wood);G.B(0,-D/2+1.8,H+2,W*0.8-4,0.3,30,G.M('mir',0xbfd3dc,{roughness:.05,metalness:.9}));}});
DM('armoire',(G)=>{const {W,D,H}=G;G.B(0,0,4,W,D,H-6,G.wood);G.B(0,0,H-2,W+2,D+2,2,G.wood);G.legs(W,D,4,2.5,G.wood,1);G.B(0,D/2,6,0.4,0.4,H-10,G.dark);for(const s of [-1,1])G.B(s*2,D/2+0.6,H/2,0.7,0.7,8,G.metal);});
DM('vanitytable',(G)=>{const {W,D,H}=G;G.B(0,0,H-1.5,W,D,1.5,G.wood);G.legs(W,D,H-1.5,1.6,G.wood);G.B(0,D/2-0.5,H-6,W-4,0.4,4,G.wood);G.B(0,-D/2+1,H,W*0.6,1,22,G.wood);G.B(0,-D/2+1.6,H+1.5,W*0.6-3,0.3,19,G.M('mir',0xbfd3dc,{roughness:.05,metalness:.9}));
  G.Cy(0,D/2+10,0,7,17,G.fab,20);});
DM('bench',(G)=>{const {W,D,H}=G;G.B(0,0,H-4,W,D,4,G.fab);G.legs(W,D,H-4,1.8,G.wood,1);if(G.opt.storage)G.B(0,0,4,W-2,D-2,H-8,G.wood);});
DM('daybed',(G)=>{const {W,D}=G;G.B(0,0,0,W,D,14,G.wood);G.B(0,0,14,W-2,D-2,8,G.white);G.B(0,-D/2+1,0,W,2,34,G.wood);for(const s of [-1,1])G.B(s*(W/2-1),0,0,2,D,30,G.wood);G.B(0,2,22,W-4,D-6,1.2,G.fab);for(let i=0;i<3;i++)G.B(-W/3+i*W/3,-D/2+5,22,W/3-4,6,14,G.fab);});
// ---- seating ----
function dSofa(G,W,D,H,opts={}){const arm=opts.arm??6;const style=opts.style||'track';const seatZ=17;G.B(0,0,0,W,D,3,G.dark);G.B(0,1,3,W-2*arm,D-8,seatZ-8,G.fab);
  const n=opts.cushions||Math.max(1,Math.round((W-2*arm)/26));const cw=(W-2*arm)/n;for(let i=0;i<n;i++)G.B(-W/2+arm+cw*(i+0.5),3,seatZ-5,cw-0.8,D-12,5,G.fab);
  G.B(0,-D/2+4.5,3,W,9,(style==='tuxedo'?H-3:H-3),G.fab);for(let i=0;i<n;i++)G.B(-W/2+arm+cw*(i+0.5),-D/2+11,seatZ,cw-1,6,H-seatZ-4,G.fab);
  for(const s of [-1,1]){const ah=style==='tuxedo'?H-3:style==='rolled'?22:21;G.B(s*(W/2-arm/2),1,3,arm,D-2,ah-3,G.fab);if(style==='rolled')G.Cy(s*(W/2-arm/2),1,ah,arm*0.62,0.1,G.fab);if(style==='rolled'){const g=new THREE.CylinderGeometry(arm*0.62*IN,arm*0.62*IN,(D-2)*IN,16);g.rotateX(Math.PI/2);}}
  if(style==='rolled')for(const s of [-1,1])G.St([s*(W/2-arm/2),-D/2+3,21],[s*(W/2-arm/2),D/2-1,21],arm*0.6,G.fab,14);
  if(opts.legs!==false)G.legs(W,D,3,2,G.wood,2);}
DM('sofa',(G)=>{dSofa(G,G.W,G.D,G.H,{style:G.opt.style,cushions:G.opt.cushions,arm:G.opt.arm});for(const s of [-1,1])G.B(s*(G.W/2-G.opt.arm*1.2-8||s*(G.W/2-16)),-G.D/2+12,20,14,4,14,G.M('pil',hx(G.opt.pillow??0xe9e1cf),{roughness:.9}));});
DM('sectional',(G)=>{const {W,D,H}=G;const dep=G.opt.depth||38;const side=G.opt.side||'R';// L shape: main run along the back, return on one side
  dSofa(G,W,dep,H,{style:'track',arm:6,cushions:Math.max(2,Math.round((W-12)/28))});const s=side==='R'?1:-1;const rl=D-dep;if(rl>8){G.B(s*(W/2-dep/2),dep/2+rl/2-D/2+dep/2-dep/2,0,dep,rl,3,G.dark);
    const uc=s*(W/2-dep/2),vc=-D/2+dep+rl/2;G.B(uc,vc,3,dep-12,rl,9,G.fab);G.B(uc,vc,12,dep-12,rl-1,5,G.fab);G.B(s*(W/2-3),vc,3,6,rl,18,G.fab);G.B(uc,D/2-3,3,dep,6,18,G.fab);}});
DM('chaise',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,3,G.dark);G.B(0,0,3,W-2,D-2,12,G.fab);for(let i=0;i<8;i++){const t=i/7;G.B(0,-D/2+3+t*14,15+Math.pow(1-t,1.5)*16,W-2,4,4,G.fab);}G.B(-W/2+3,-D/2+6,3,6,D*0.4,22,G.fab);});
DM('armchair',(G)=>{const s=G.opt.style||'club';const {W,D,H}=G;if(s==='wingback'){G.legs(W,D,6,2,G.wood,2);G.B(0,0,6,W-8,D-4,10,G.fab);G.B(0,3,16,W-8,D-10,4,G.fab);G.B(0,-D/2+3,6,W-2,6,H-6,G.fab);for(const x of [-1,1]){G.B(x*(W/2-3),0,6,6,D-4,18,G.fab);G.B(x*(W/2-3),-D/2+8,22,6,10,H-22,G.fab);}return;}
  if(s==='slipper'){G.legs(W,D,7,1.5,G.wood,2);G.B(0,1,7,W,D-4,10,G.fab);G.B(0,-D/2+2.5,7,W,5,H-7,G.fab);return;}
  if(s==='swivel'||s==='barrel'){G.Cy(0,0,0,W*0.3,4,G.dark);const g=new THREE.CylinderGeometry(W/2*IN,W/2*IN,(H-4)*IN,24,1,true,Math.PI*0.25,Math.PI*1.5);g.rotateY(Math.PI);G.Cy(0,0,4,W/2-1,10,G.fab,24);G.Cy(0,0,14,W/2-3,4,G.fab,24);
    for(let i=0;i<10;i++){const a=Math.PI*(0.15+0.07*i)+Math.PI;G.B(Math.cos(a)*(W/2-2.5),Math.sin(a)*(D/2-2.5),14,5,5,H-14,G.fab,-a);}return;}
  if(s==='rocking'){for(const x of [-1,1])G.St([x*(W/2-2),-D/2-4,1],[x*(W/2-2),D/2+4,1],1,G.wood);dChair(G,0,0,1,G.wood,17,24,W-4);return;}
  if(s==='accent'){G.legs(W,D,9,1.4,G.metal,2);G.B(0,0,9,W-2,D-2,8,G.fab);G.B(0,-D/2+3,15,W-2,4,H-15,G.fab);for(const x of [-1,1])G.B(x*(W/2-1.5),0,15,3,D-4,8,G.fab);return;}
  dSofa(G,W,D,H,{style:'track',arm:6,cushions:1});});
DM('recliner',(G)=>{const {W,D,H}=G;dSofa(G,W,D,H,{style:'rolled',arm:7,cushions:1,legs:false});if(G.opt.open)G.B(0,D/2+8,9,W-14,16,5,G.fab);});
DM('ottoman',(G)=>{const {W,D,H}=G;if(G.opt.round){G.Cy(0,0,3,W/2,H-3,G.fab,28);G.Cy(0,0,0,W/2-3,3,G.dark,20);return;}G.B(0,0,4,W,D,H-4,G.fab);G.legs(W,D,4,1.6,G.wood,1.5);if(G.opt.tufted)for(let i=1;i<4;i++)for(let j=1;j<3;j++)G.Sp(-W/2+W*i/4,-D/2+D*j/3,H,0.5,G.dark);});
DM('beanbag',(G)=>{G.Sp(0,0,G.H*0.42,G.W/2,G.fab,1,G.D/G.W,0.85);});
DM('diningchair',(G)=>{const s=G.opt.style||'side';const {W,D,H}=G;const m=s==='upholstered'||s==='parsons'?G.fab:G.wood;if(s==='windsor'){G.B(0,0,17,W,D,1.5,G.wood);for(const a of [-1,1])for(const b of [-1,1])G.St([a*(W/2-2),b*(D/2-2),0],[a*(W/2-1),b*(D/2-1),17],0.7,G.wood);for(let i=0;i<7;i++){const u=-W/2+2+i*(W-4)/6;G.St([u,-D/2+1,18.5],[u*1.1,-D/2-1,H-2],0.35,G.wood);}G.B(0,-D/2-1,H-3,W+2,2.5,2.5,G.wood);return;}
  dChair(G,0,0,1,m,18,H-18,Math.min(W,D));if(s==='upholstered'||s==='parsons')G.B(0,0.5,18,W-1,D-1,2,G.fab);});
DM('barstool',(G)=>{const {W,H}=G;const seat=H;if(G.opt.back){G.B(0,-W/2+1,seat,W-2,1.5,14,G.opt.fabSeat?G.fab:G.wood);}if(G.opt.round){G.Cy(0,0,seat-2,W/2,2,G.opt.fabSeat?G.fab:G.wood,22);G.Cy(0,0,0,W/2-1,1,G.metal,20);G.Cy(0,0,1,1,seat-3,G.metal);G.To(0,0,10,W/2-3,0.4,G.metal);return;}
  G.B(0,0,seat-2,W,W,2,G.opt.fabSeat?G.fab:G.wood);for(const a of [-1,1])for(const b of [-1,1])G.St([a*(W/2-1),b*(W/2-1),0],[a*(W/2-2),b*(W/2-2),seat-2],0.6,G.metal);for(const b of [-1,1])G.B(0,b*(W/2-2.5),10,W-4,0.8,0.8,G.metal);});
DM('officechair',(G)=>{const {W}=G;for(let i=0;i<5;i++){const a=i/5*Math.PI*2;G.St([0,0,3],[Math.cos(a)*W/2.2,Math.sin(a)*W/2.2,2],0.7,G.dark);G.Sp(Math.cos(a)*W/2.2,Math.sin(a)*W/2.2,1,1,G.dark);}G.Cy(0,0,3,1,14,G.chrome);G.B(0,1,17,W*0.8,W*0.8,3,G.fab);G.B(0,-W*0.36,20,W*0.75,2.5,22,G.fab);for(const x of [-1,1]){G.B(x*W*0.42,1,20,1.2,10,7,G.dark);}});
DM('bench_out',(G)=>{const {W,D,H}=G;for(let i=0;i<4;i++)G.B(0,-D/2+D*(i+0.5)/4,H-1.5,W,D/4-0.6,1.5,G.wood);for(const x of [-1,1])G.B(x*(W/2-3),0,0,2.5,D,H-1.5,G.metal);if(G.opt.back){for(let i=0;i<3;i++)G.B(0,-D/2-1,H+3+i*5,W,1,3.5,G.wood);for(const x of [-1,1])G.B(x*(W/2-3),-D/2-1,0,2,2,H+16,G.metal);}});
// ---- tables ----
DM('table',(G)=>{const s=G.opt.shape||'rect';const n=G.opt.chairs||0;const W=n?G.W-36:G.W,D=n?G.D-36:G.D,H=G.H;const seat=Math.min(18,H*0.6),cs=Math.min(17,Math.max(11,H*0.55));
  const top=G.M('top',hx(G.opt.top??(G.opt.glass?0xcfe4ee:G.col)),G.opt.glass?{roughness:.05,transparent:true,opacity:.45}:{roughness:.55});const base=G.opt.metalBase?G.metal:G.wood;
  if(s==='round'||s==='oval'){G.Sp(0,0,H-0.75,W/2,top,1,D/W,0.75/(W/2));
    if(G.opt.pedestal!==false){G.Cy(0,0,0,Math.min(W,D)*0.2,2,base,20);G.Cy(0,0,2,3,H-4,base,16,2.2);}else{for(const x of [-1,1])G.Cy(x*W*0.3,0,0,1.6,H-1.5,base);}}
  else{G.B(0,0,H-1.5,W,D,1.5,top);if(G.opt.trestle){for(const x of [-1,1]){G.B(x*(W/2-10),0,0,4,D-6,2.5,base);G.B(x*(W/2-10),0,2.5,3,3,H-5,base);}G.B(0,0,10,W-20,2,3,base);}else if(G.opt.metalBase){for(const x of [-1,1]){G.B(x*(W/2-4),0,0,2,D-4,1.5,base);G.B(x*(W/2-4),0,H-3,2,D-4,1.5,base);G.B(x*(W/2-4),0,1.5,2,1.5,H-4.5,base);}}
    else G.legs(W,D,H-1.5,G.opt.leg||2.5,base,2);if(G.opt.shelf)G.B(0,0,5,W-6,D-6,0.8,base);if(G.opt.apron)G.B(0,D/2-2,H-5,W-6,0.8,3.5,base);}
  if(n){const cm=G.opt.chairFab?G.fab:G.wood;
    if(s==='round'||s==='oval'){for(let i=0;i<n;i++){const a=i/n*Math.PI*2;const u=Math.cos(a)*(W/2+5),v=Math.sin(a)*(D/2+5);G.B(u,v,seat-2,cs,cs,2.5,cm,-a+Math.PI/2);G.B(u+Math.cos(a)*(cs/2-1),v+Math.sin(a)*(cs/2-1),seat,cs,1.5,seat*0.85,cm,-a+Math.PI/2);for(let k=0;k<4;k++){const b=a+Math.PI/4+k*Math.PI/2;G.B(u+Math.cos(b)*(cs*0.55),v+Math.sin(b)*(cs*0.55),0,1.3,1.3,seat-2,cm);}}}
    else{const ends=(n>=6||(n===4&&W>=54))?2:0;const per=Math.ceil((n-ends)/2);for(const sg of [-1,1])for(let i=0;i<per;i++){const u=-W/2+W*(i+0.5)/per;dChair(G,u,sg*(D/2+5),-sg,cm,seat,seat*0.85,cs);}
      if(ends)for(const sg of [-1,1]){const u=sg*(W/2+5);G.B(u,0,seat-2,cs,cs,2.5,cm);G.B(u+sg*(cs/2-1),0,seat,1.5,cs,seat*0.85,cm);for(const a of [-1,1])for(const b of [-1,1])G.B(u+a*(cs/2-1.5),b*(cs/2-1.5),0,1.3,1.3,seat-2,cm);}}}});
DM('desk',(G)=>{const s=G.opt.style||'writing';const {W,D,H}=G;if(s==='L'){G.B(0,-D/2+12,H-1.25,W,24,1.25,G.wood);G.B(W/2-12,6,H-1.25,24,D-24,1.25,G.wood);G.B(-W/2+1,-D/2+12,0,2,22,H-1.25,G.wood);G.B(W/2-12,D/2-1,0,22,2,H-1.25,G.wood);G.B(W/2-12,-D/2+12,0,22,22,H-1.25,G.wood);
    G.B(-W/4,-D/2+16,H-1.25+0.1,22,8,1,G.dark);G.B(-W/4,-D/2+5,H,22,1.5,14,G.screen);return;}
  if(s==='standing'){G.B(0,0,H-1.25,W,D,1.25,G.wood);for(const x of [-1,1]){G.B(x*(W/2-6),0,0,3,D-4,1.5,G.metal);G.B(x*(W/2-6),0,1.5,2.5,2.5,H-2.75,G.metal);}G.B(0,-D/2+5,H,20,1.5,13,G.screen);return;}
  G.B(0,0,H-1.25,W,D,1.25,G.wood);if(s==='pedestal'||W>=54){G.B(W/2-9,0,0,16,D-2,H-1.25,G.wood);for(let i=0;i<3;i++)G.B(W/2-9,D/2-0.6,3+i*9,14,0.4,8,G.M('front',0x7a5c3e));G.B(-W/2+1,0,0,2,D-2,H-1.25,G.wood);}else{G.legs(W,D,H-1.25,1.8,G.wood,1);G.B(0,D/2-1,H-5,W-4,1,3.5,G.wood);}
  if(G.opt.hutch){G.B(0,-D/2+5,H,W,10,30,G.wood);G.B(0,-D/2+0.5,H+1,W-2,0.5,28,G.dark);}});
DM('coffee',(G)=>{const s=G.opt.shape||'rect';const {W,D,H}=G;if(s==='round'){G.Cy(0,0,H-1.5,W/2,1.5,G.wood,32);G.Cy(0,0,3,W/2-4,0.8,G.wood,28);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;G.B(Math.cos(a)*(W/2-6),Math.sin(a)*(W/2-6),0,1.6,1.6,H-1.5,G.metal);}return;}
  if(s==='trunk'){G.B(0,0,2,W,D,H-2,G.wood);G.B(0,0,H-3,W+0.5,D+0.5,1,G.metal);G.B(0,D/2+0.2,H/2,3,0.6,3,G.metal);G.legs(W,D,2,2,G.dark,0.5);return;}
  G.B(0,0,H-1.5,W,D,1.5,G.opt.glass?G.glass:G.wood);G.legs(W,D,H-1.5,1.8,G.opt.glass?G.metal:G.wood,1);G.B(0,0,4,W-4,D-4,0.8,G.wood);dBooks(G,-W/2+4,-W/4,0,4.8,7,3);});
DM('endtable',(G)=>{const {W,D,H}=G;if(G.opt.round){G.Cy(0,0,H-1.2,W/2,1.2,G.wood,26);G.Cy(0,0,0,W/4,1,G.wood,20);G.Cy(0,0,1,1.2,H-2,G.metal);}else{G.B(0,0,H-1.5,W,D,1.5,G.wood);G.legs(W,D,H-1.5,1.6,G.wood,0.8);G.B(0,0,8,W-2,D-2,0.8,G.wood);}
  if(G.opt.lamp){G.Cy(0,-1,H,2.5,1,G.metal);G.Cy(0,-1,H+1,0.4,10,G.metal);G.Cy(0,-1,H+10,5,8,G.cream,18,3.5);}});
DM('console',(G)=>{const {W,D,H}=G;G.B(0,0,H-1.5,W,D,1.5,G.wood);G.legs(W,D,H-1.5,1.6,G.wood,1);G.B(0,0,6,W-3,D-2,0.8,G.wood);G.B(0,D/2-1,H-6,W-4,1,4.5,G.wood);G.Cy(-W/3,0,H,3,10,G.M('vase',0x5b7f8f,{roughness:.3}),14,2);});
DM('sideboard',(G)=>{const {W,D,H}=G;G.B(0,0,6,W,D,H-6,G.wood);G.legs(W,D,6,2,G.wood,1.5);const n=Math.max(2,Math.round(W/18));for(let i=0;i<n;i++){const u=-W/2+W*(i+0.5)/n;G.B(u,D/2,8,W/n-1.2,0.3,H-10,G.M('front',hx(G.opt.front??0x9a7a58),{roughness:.6}));G.B(u+(i%2?-1:1)*(W/n/2-2),D/2+0.7,H/2,0.6,0.6,4,G.metal);}
  if(G.opt.hutch){G.B(0,-D/2+5,H,W-4,10,40,G.wood);for(let i=0;i<n;i++)G.B(-W/2+2+(W-4)*(i+0.5)/n,-D/2+10.3,H+2,(W-4)/n-1.5,0.3,36,G.glass);}});
DM('barcart',(G)=>{const {W,D,H}=G;for(const z of [6,H-1])G.B(0,0,z,W,D,1,G.glass);for(const a of [-1,1])for(const b of [-1,1])G.Cy(a*(W/2-1),b*(D/2-1),2,0.5,H-2,G.gold,8);for(const a of [-1,1])G.To(a*(W/2-1),D/2-2,3,2.5,0.4,G.dark,false);for(let i=0;i<4;i++)G.Cy(-W/3+i*W/5,0,H,1.4,9,G.M('bottle'+i,[0x2e5e3b,0x6b2d2d,0xd9c9a3,0x3a3a3a][i],{roughness:.2}),12,0.6);});
// ---- storage and media ----
DM('bookcase',(G)=>{const {W,D,H}=G;for(const s of [-1,1])G.B(s*(W/2-0.4),0,0,0.8,D,H,G.wood);G.B(0,-D/2+0.2,0,W,0.4,H,G.wood);G.B(0,0,H-0.8,W,D,0.8,G.wood);const n=Math.max(2,Math.round(H/14));
  for(let i=0;i<n;i++){const z=i*(H-0.8)/n;G.B(0,0,z,W-1.6,D,0.8,G.wood);if(G.opt.books!==false&&i<n)dBooks(G,-W/2+1.5,W/2-1.5,0,z+0.8,D*0.7,Math.min(11,(H-0.8)/n-2));}});
DM('cubeshelf',(G)=>{const {W,D,H}=G;const c=G.opt.cols||Math.round(W/14),r=G.opt.rows||Math.round(H/14);for(let i=0;i<=c;i++)G.B(-W/2+W*i/c,0,0,0.8,D,H,G.wood);for(let j=0;j<=r;j++)G.B(0,0,H*j/r-(j===r?0.8:0),W,D,0.8,G.wood);
  for(let i=0;i<c;i++)for(let j=0;j<r;j++)if((i+j)%3===0)G.B(-W/2+W*(i+0.5)/c,0.5,H*j/r+0.8,W/c-2,D-2,H/r-2,G.M('bin'+(i%3),[0xb9a68a,0x6f7f8f,0xe3dccf][i%3],{roughness:.95}));});
DM('ladder',(G)=>{const {W,D,H}=G;for(const s of [-1,1])G.St([s*(W/2-1),D/2-1,0],[s*(W/2-1),-D/2+1,H],0.8,G.wood);const n=5;for(let i=0;i<n;i++){const t=(i+0.3)/n;const dd=D*(1-t)*0.9+3;G.B(0,D/2-1-(D-2)*t+dd/2-1.5,H*t,W-2,dd,0.8,G.wood);}});
DM('tvstand',(G)=>{const {W,D,H}=G;G.B(0,0,2,W,D,H-2,G.wood);G.legs(W,D,2,2,G.dark,1);const n=Math.max(2,Math.round(W/20));for(let i=0;i<n;i++)G.B(-W/2+W*(i+0.5)/n,D/2,3,W/n-1.5,0.3,H-5,i===1&&n>2?G.dark:G.M('front',hx(G.opt.front??0x9a7a58),{roughness:.6}));
  const tv=G.opt.tv||55;const tw=tv*0.872,th=tv*0.49;G.B(0,-1,H,10,7,1,G.dark);G.B(0,-1,H+1,2,2,3,G.dark);G.B(0,-1,H+4,tw,1.3,th,G.screen);});
DM('entertain',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,24,G.wood);for(const s of [-1,1]){G.B(s*(W/2-9),0,24,18,D-4,H-24,G.wood);for(let i=1;i<5;i++)G.B(s*(W/2-9),0,24+(H-24)*i/5,17,D-5,0.8,G.white);}G.B(0,0,H-8,W,D-4,8,G.wood);const tw=Math.min(W-40,65*0.872);G.B(0,-2,30,tw,1.3,tw*0.56,G.screen);});
DM('filecab',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,H,G.metal);const n=G.opt.drawers||Math.round(H/14);for(let i=0;i<n;i++){const z=H*(i+0.5)/n;G.B(0,D/2,z-H/n/2+0.5,W-1,0.3,H/n-1,G.M('fc',0x8a8f96,{roughness:.4,metalness:.5}));G.B(0,D/2+0.6,z+H/n*0.2,5,0.6,0.8,G.chrome);}});
DM('toychest',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,H-2,G.wood);G.B(0,0,H-2,W+1,D+1,2,G.fab);for(let i=0;i<3;i++)G.Sp(-W/3+i*W/3,D/2+0.3,H/2,2.2,G.M('ty'+i,[0xd9534f,0x1f5fbf,0xf2c230][i],{roughness:.5}),1,0.2,1);});
// ---- lighting (decor) ----
DM('floorlamp',(G)=>{const s=G.opt.style||'drum';const {H}=G;if(s==='arc'){G.B(0,-G.D/2+6,0,12,12,2,G.M('marble',0xe8e6e1,{roughness:.3}));const pts=[];for(let i=0;i<=10;i++){const t=i/10;pts.push([0,-G.D/2+6+Math.sin(t*Math.PI/2)*(G.D-16),2+Math.sin(Math.PI*t*0.95)*(H-12)+t*0]);}for(let i=0;i<10;i++)G.St(pts[i],pts[i+1],0.6,G.chrome);const e=pts[10];G.Sp(e[0],e[1],e[2]-2,7,G.chrome,1,1,0.6);return;}
  if(s==='tripod'){for(let i=0;i<3;i++){const a=i/3*Math.PI*2;G.St([Math.cos(a)*9,Math.sin(a)*9,0],[0,0,H-18],0.7,G.wood);}G.Cy(0,0,H-16,9,14,G.cream,22,7.5);return;}
  if(s==='torchiere'){G.Cy(0,0,0,6,1.2,G.metal,20);G.Cy(0,0,1.2,0.5,H-10,G.metal);G.Cy(0,0,H-9,7,8,G.M('alab',0xf5efe3,{roughness:.4}),20,4);return;}
  G.Cy(0,0,0,6,1.2,G.metal,20);G.Cy(0,0,1.2,0.5,H-14,G.metal);G.Cy(0,0,H-15,8,14,G.cream,22);});
DM('tablelamp',(G)=>{const {W,H}=G;G.Cy(0,0,0,W*0.25,1,G.metal,18);G.Sp(0,0,H*0.25,W*0.24,G.M('base',hx(G.opt.base??0x5b7f8f),{roughness:.3}),1,1,1.2);G.Cy(0,0,H*0.42,0.4,H*0.18,G.metal);G.Cy(0,0,H*0.58,W/2,H*0.42,G.cream,22,W*0.36);});
DM('ceilfan',(G)=>{const {W,H}=G;const blades=G.opt.blades||5;G.Cy(0,0,H-4,2.5,4,G.metal);G.Cy(0,0,H-12,0.6,8,G.metal);G.Cy(0,0,H-17,5,5,G.metal,20);for(let i=0;i<blades;i++){const a=i/blades*Math.PI*2;G.B(Math.cos(a)*(W/4+3),Math.sin(a)*(W/4+3),H-15,W/2-8,5.5,0.4,G.M('blade',hx(G.opt.blade??0x7a5c3e),{roughness:.6}),-a);}
  if(G.opt.light!==false)G.Sp(0,0,H-19,4.5,G.M('glow',0xfff6e0,{roughness:.2,emissive:0x5a5040}),1,1,0.6);});
DM('chandelier',(G)=>{const {W,H}=G;const s=G.opt.style||'candle';G.Cy(0,0,H-3,3,3,G.metal);G.Cy(0,0,H-15,0.3,12,G.metal);if(s==='drum'){G.Cy(0,0,0,W/2,H-16,G.M('shade',hx(G.opt.shade??0xe9e1cf),{roughness:.9}),28);return;}
  if(s==='linear'){G.B(0,0,4,W,4,1.5,G.metal);for(let i=0;i<5;i++)G.Sp(-W/2+W*(i+0.5)/5,0,2,2.8,G.glass);for(const x of [-1,1])G.St([x*W/3,0,5.5],[0,0,H-15],0.2,G.metal);return;}
  if(s==='lantern'){const r=W/2;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;G.St([Math.cos(a)*r,Math.sin(a)*r,2],[Math.cos(a)*r,Math.sin(a)*r,H-18],0.4,G.metal);}G.Cy(0,0,0,r,2,G.metal,6);G.Co(0,0,H-18,r+1,4,G.metal,6);G.Cy(0,0,H*0.35,1.5,4,G.glass);return;}
  G.Cy(0,0,H*0.25,2.5,6,G.metal);const n=G.opt.arms||6;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;const x=Math.cos(a)*W/2.3,y=Math.sin(a)*W/2.3;G.St([0,0,H*0.3],[x,y,H*0.3],0.35,G.metal);G.Cy(x,y,H*0.3,1.2,1,G.metal);G.Cy(x,y,H*0.3+1,0.5,3.5,G.white);}});
DM('pendant',(G)=>{const {W,H}=G;const s=G.opt.style||'globe';G.Cy(0,0,H-1,2.5,1,G.metal);G.Cy(0,0,W*0.6,0.15,H-W*0.6-1,G.dark,6);if(s==='globe')G.Sp(0,0,W/2,W/2,G.M('glb',0xf4f1e8,{roughness:.2,transparent:true,opacity:.75}));else if(s==='cone')G.Co(0,0,0,W/2,W*0.6,G.metal,22);else if(s==='lantern'){for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;G.St([Math.cos(a)*W/2.4,Math.sin(a)*W/2.4,0],[Math.cos(a)*W/2.4,Math.sin(a)*W/2.4,W],0.3,G.metal);}G.B(0,0,0,W*0.75,W*0.75,0.5,G.metal);G.B(0,0,W,W*0.75,W*0.75,0.5,G.metal);}
  else G.Cy(0,0,0,W/2,W*0.5,G.M('shade',0xe9e1cf,{roughness:.9}),22);});
DM('sconce',(G)=>{const {W,H}=G;G.B(0,-G.D/2+0.3,H*0.3,W*0.5,0.6,H*0.4,G.metal);if(G.opt.bar){G.B(0,-G.D/2+2,H*0.45,W,1,1,G.metal);for(let i=0;i<(G.opt.lights||3);i++){const n=G.opt.lights||3;G.Sp(-W/2+W*(i+0.5)/n,1,H*0.45,2.6,G.M('glb',0xf4f1e8,{roughness:.2}));}return;}G.St([0,-G.D/2+0.6,H*0.5],[0,0,H*0.5],0.4,G.metal);G.Cy(0,0,H*0.35,W/2,H*0.5,G.cream,18,W*0.35);});
DM('flushlight',(G)=>{const {W,H}=G;G.Cy(0,0,H-1,W*0.35,1,G.metal,24);G.Sp(0,0,H-1,W/2,G.M('glb',0xf4f1e8,{roughness:.25}),1,1,H/W*1.2);});
// ---- soft goods and wall decor ----
DM('rug',(G)=>{const {W,D}=G;const s=G.opt.shape||'rect';const bc=G.M('rugb',hx(G.opt.border??0xe9e1cf),{roughness:1});if(s==='round'){G.Cy(0,0,0,W/2,0.4,G.fab,40);G.To(0,0,0.4,W/2-3,0.6,bc);return;}
  G.B(0,0,0,W,D,0.4,G.fab);G.B(0,0,0.4,W-8,D-8,0.05,bc);G.B(0,0,0.45,W-12,D-12,0.05,G.fab);if(G.opt.pattern)for(let i=1;i<4;i++)G.B(0,-D/2+D*i/4,0.5,W-16,1.2,0.05,bc);});
DM('curtain',(G)=>{const {W,H}=G;G.Cy(0,-G.D/2+2,H-1.5,0.6,0.01,G.metal);G.St([-W/2-3,-G.D/2+2,H-2],[W/2+3,-G.D/2+2,H-2],0.6,G.metal);for(const s of [-1,1]){G.Sp(s*(W/2+3.5),-G.D/2+2,H-2,1.2,G.metal);const pw=W*0.28;for(let i=0;i<6;i++)G.B(s*(W/2-pw/2)+(i-2.5)*pw/6,-G.D/2+3+(i%2)*0.8,0,pw/6+0.3,1.2,H-3,G.fab);}});
DM('blinds',(G)=>{const {W,H}=G;G.B(0,0,H-2.5,W,2.5,2.5,G.white);const n=Math.floor((H-3)/1.6);for(let i=0;i<n;i++)G.B(0,0,H-3-i*1.6,W-0.5,2,0.12,G.white);});
DM('art',(G)=>{const {W,H}=G;const fr=G.M('frame',hx(G.opt.frame??0x2a2a2a),{roughness:.5});G.B(0,0,0,W,G.D,H,fr);const cw=W-(G.opt.mat?6:2.5),ch=H-(G.opt.mat?6:2.5);if(G.opt.mat)G.B(0,0.2,1.5,W-3,G.D,H-3,G.white);
  const cols=G.opt.palette||[0x2e4e7a,0xd9b26a,0xb84a3a,0x6f8f5a];const n=cols.length;for(let i=0;i<n;i++)G.B(-cw/2+cw*(i+0.5)/n,0.4,(H-ch)/2+ch*((i*37)%n)/n*0.3,cw/n,G.D,ch*(0.6+((i*13)%4)*0.1),G.M('pa'+i,cols[i],{roughness:.9}));});
DM('mirror',(G)=>{const {W,H}=G;const s=G.opt.shape||'rect';const fr=G.M('frame',hx(G.opt.frame??0xc8a45a),{roughness:.3,metalness:.6});const mr=G.M('mir',0xc7d9e2,{roughness:.02,metalness:.95});
  if(s==='round'){G.Disc(0,0,H/2,W/2,G.D,fr);G.Disc(0,0.2,H/2,W/2-1.5,G.D,mr);return;}if(s==='arch'){G.B(0,0,0,W,G.D,H-W/2,fr);G.Disc(0,0,H-W/2,W/2,G.D,fr);G.B(0,0.2,1.2,W-2.4,G.D,H-W/2-1.2,mr);G.Disc(0,0.2,H-W/2,W/2-1.2,G.D,mr);return;}
  if(G.opt.floor){G.B(0,0,0,W,G.D,H,fr);G.B(0,0.2,1.5,W-3,G.D,H-3,mr);G.St([0,-G.D/2,H*0.6],[0,-14,0],0.5,fr);return;}G.B(0,0,0,W,G.D,H,fr);G.B(0,0.2,1.5,W-3,G.D,H-3,mr);});
DM('clock',(G)=>{const {W}=G;G.Disc(0,0,W/2,W/2,G.D,G.M('frame',0x2a2a2a));G.Disc(0,0.3,W/2,W/2-1,G.D,G.white);G.B(0,G.D,W/2+W*0.15,0.4,0.2,W*0.3,G.dark);G.B(W*0.1,G.D,W/2,W*0.22,0.2,0.4,G.dark);});
DM('wallshelf',(G)=>{const {W,D,H}=G;const n=G.opt.n||1;for(let i=0;i<n;i++){const z=i*(H/n);G.B(0,0,z,W,D,1.2,G.wood);dBooks(G,-W/2+2,-W/6,0,z+1.2,D*0.7,8);G.Cy(W/4,0,z+1.2,2,5,G.M('vase',0x5b7f8f,{roughness:.3}),14,1.5);}});
DM('tvwall',(G)=>{const {W,H}=G;G.B(0,-G.D/2+0.5,H*0.3,8,1,H*0.4,G.dark);G.B(0,0.2,0,W,G.D-1,H,G.screen);});
DM('vase',(G)=>{const {W,H}=G;G.Cy(0,0,0,W*0.35,H*0.7,G.M('vase',hx(G.opt.c??0x5b7f8f),{roughness:.25}),18,W*0.5);G.Cy(0,0,H*0.7,W*0.5,H*0.12,G.M('vase',hx(G.opt.c??0x5b7f8f),{roughness:.25}),18,W*0.25);if(G.opt.stems)for(let i=0;i<5;i++){const a=i*1.3;G.St([0,0,H*0.8],[Math.cos(a)*W*0.6,Math.sin(a)*W*0.6,H*1.4],0.2,G.leaf);G.Sp(Math.cos(a)*W*0.6,Math.sin(a)*W*0.6,H*1.4,1.2,G.M('flw',0xe8a0b4,{roughness:.8}));}});
// ---- plants (indoor) ----
DM('plant',(G)=>{const {W,H}=G;const s=G.opt.kind||'tree';const pr=Math.min(W,G.D)*(G.opt.potScale||0.32);const ph=Math.min(H*0.3,pr*2);G.Cy(0,0,0,pr*0.85,ph,G.pot,20,pr);G.Cy(0,0,ph-0.8,pr*0.95,0.6,G.soil,18);const top=ph;
  if(s==='tree'){G.Cy(0,0,top,0.8,H*0.45,G.M('trunk',0x6b4f36,{roughness:.9}),8,0.6);for(let i=0;i<9;i++){const a=i*2.4,r=W*0.22*(0.5+(i%3)*0.25);G.Sp(Math.cos(a)*r,Math.sin(a)*r,top+H*0.45+(i%4)*H*0.09,W*0.2,G.leaf,1,1,0.8);}return;}
  if(s==='snake'){for(let i=0;i<9;i++){const a=i*0.7,r=pr*0.5*(i%3)/2;G.B(Math.cos(a)*r,Math.sin(a)*r,top,2.4,0.6,(H-top)*(0.6+(i%3)*0.2),G.leaf,a);}return;}
  if(s==='palm'){G.Cy(0,0,top,0.7,(H-top)*0.4,G.M('trunk',0x8a7a50),6);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const z0=top+(H-top)*0.35;G.St([0,0,z0],[Math.cos(a)*W*0.42,Math.sin(a)*W*0.42,z0+(H-top)*0.45],0.35,G.leaf);for(let k=1;k<5;k++){const t=k/5;G.B(Math.cos(a)*W*0.42*t,Math.sin(a)*W*0.42*t,z0+(H-top)*0.45*t+1,5*(1-t*0.5),1.4,0.15,G.leaf,-a+Math.PI/2);}}return;}
  if(s==='monstera'){for(let i=0;i<8;i++){const a=i*2.2,r=W*0.3;const z=top+(H-top)*(0.3+(i%4)*0.17);G.St([0,0,top],[Math.cos(a)*r*0.8,Math.sin(a)*r*0.8,z],0.25,G.leaf);G.Sp(Math.cos(a)*r,Math.sin(a)*r,z,W*0.16,G.leaf,1,1,0.15);}return;}
  if(s==='hanging'){G.Cy(0,0,H-1,0.3,0.1,G.dark);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;G.St([Math.cos(a)*pr,Math.sin(a)*pr,ph],[0,0,H],0.12,G.dark);}for(let i=0;i<8;i++){const a=i/8*Math.PI*2;for(let k=0;k<5;k++)G.Sp(Math.cos(a)*(pr+1),Math.sin(a)*(pr+1),ph-k*3,1.6,G.leaf,1,1,0.6);}return;}
  if(s==='succulent'){for(let i=0;i<7;i++){const a=i*2.3,r=pr*0.55*(i%3)/2;G.Sp(Math.cos(a)*r,Math.sin(a)*r,top+1.5,2.2,G.M('succ'+i%3,[0x7fa38a,0x9fb38a,0x6f8f7a][i%3],{roughness:.6}),1,1,0.7);}return;}
  if(s==='flower'){for(let i=0;i<10;i++){const a=i*2.1,r=pr*0.6;G.Sp(Math.cos(a)*r*0.6,Math.sin(a)*r*0.6,top+(H-top)*0.35,W*0.18,G.leaf,1,1,0.6);}for(let i=0;i<6;i++){const a=i*1.7;G.Sp(Math.cos(a)*W*0.18,Math.sin(a)*W*0.18,top+(H-top)*0.7,2,G.M('flw',hx(G.opt.flower??0xf2f2ee),{roughness:.7}));}return;}
  for(let i=0;i<12;i++){const a=i*2.4,r=W*0.25*((i%3)+1)/3;G.Sp(Math.cos(a)*r,Math.sin(a)*r,top+(H-top)*(0.25+(i%4)*0.18),W*0.17,G.leaf,1,1,0.7);}});
// ---- bath accessories ----
DM('towelbar',(G)=>{const {W,H}=G;for(const s of [-1,1])G.Cy(s*(W/2-1),0,H/2-1,1,2,G.chrome,12);G.St([-W/2+1,1,H/2],[W/2-1,1,H/2],0.4,G.chrome);if(G.opt.towel!==false)G.B(0,1.5,H/2-14,W*0.6,0.8,14,G.fab);});
DM('towelring',(G)=>{G.Cy(0,-0.5,G.H-1.5,1.2,1,G.chrome);G.To(0,1,G.H/2,G.W/2-0.5,0.3,G.chrome,false);G.B(0,1.4,1,G.W*0.5,0.8,G.H*0.55,G.fab);});
DM('tpholder',(G)=>{for(const s of [-1,1])G.B(s*3,-0.5,G.H/2-1,1,2,2,G.chrome);const g=new THREE.CylinderGeometry(2.3*IN,2.3*IN,4.3*IN,18);g.rotateZ(Math.PI/2);G.St([-2.2,1.5,G.H/2],[2.2,1.5,G.H/2],2.3,G.white,18);});
DM('robehook',(G)=>{G.Cy(0,-0.5,G.H/2,0.8,0.01,G.chrome);G.St([0,-0.5,G.H/2],[0,1.8,G.H/2+1],0.3,G.chrome);G.Sp(0,1.8,G.H/2+1.2,0.5,G.chrome);});
DM('medcab',(G)=>{const {W,H}=G;G.B(0,0,0,W,G.D,H,G.white);G.B(0,G.D/2+0.1,0.5,W-1,0.3,H-1,G.M('mir',0xc7d9e2,{roughness:.02,metalness:.95}));});
DM('showerdoor',(G)=>{const {W,H}=G;G.B(0,0,0,W,0.4,H,G.glass);G.B(0,0,H-1,W,1,1,G.chrome);for(const s of [-1,1])G.B(s*(W/2),0,0,1,1,H,G.chrome);G.B(W/2-3,0.8,H/2-6,0.6,0.6,12,G.chrome);});
DM('showerrod',(G)=>{const {W,H}=G;G.St([-W/2,0,H-1],[W/2,0,H-1],0.5,G.chrome);for(let i=0;i<10;i++)G.B(-W/2+3+i*(W*0.5-3)/10,(i%2)*0.6,8,W*0.05+0.4,1,H-10,G.fab);});
DM('bathmat',(G)=>{G.B(0,0,0,G.W,G.D,0.5,G.fab);});
DM('hamper',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,H,G.M('wick',0xb9a07a,{roughness:1}));G.B(0,0,H,W+0.5,D+0.5,1,G.M('wick',0xb9a07a,{roughness:1}));});
DM('overtoilet',(G)=>{const {W,D,H}=G;for(const s of [-1,1])G.B(s*(W/2-0.6),0,0,1.2,D,H,G.wood);for(const z of [H-1,H-14,H-27])G.B(0,0,z,W,D,0.8,G.wood);G.Cy(-W/4,0,H-13,2,5,G.M('vase',0x5b7f8f),14);});
DM('vanitymirror',(G)=>{const {W,H}=G;G.B(0,0,0,W,G.D,H,G.M('frame',hx(G.opt.frame??0x2a2a2a),{roughness:.4}));G.B(0,0.2,1,W-2,G.D,H-2,G.M('mir',0xc7d9e2,{roughness:.02,metalness:.95}));});
// ---- laundry, utility and garage ----
DM('wireshelf',(G)=>{const {W,D,H}=G;for(const a of [-1,1])for(const b of [-1,1])G.Cy(a*(W/2-0.6),b*(D/2-0.6),0,0.5,H,G.chrome,8);const n=G.opt.n||5;for(let i=0;i<n;i++){const z=1+i*(H-2)/(n-1);G.B(0,0,z,W,D,0.4,G.M('wire',0xb9bcbf,{roughness:.4,metalness:.6}));}
  for(let i=0;i<3;i++)G.B(-W/3+i*W/3,0,5+i%2*20,W/4,D-4,8,G.M('tote'+i,[0x3d5a80,0x6f7f8f,0x9fb38a][i],{roughness:.6}));});
DM('ironboard',(G)=>{const {W,D,H}=G;G.Sp(0,0,H,W/2,G.fab,1,D/W,0.03);G.St([-W*0.3,-D/3,0],[W*0.3,D/3,H],0.4,G.metal);G.St([W*0.3,-D/3,0],[-W*0.3,D/3,H],0.4,G.metal);});
DM('dryrack',(G)=>{const {W,D,H}=G;for(const s of [-1,1])G.St([s*W/2,-D/2,0],[s*W/2,0,H],0.3,G.metal);for(const s of [-1,1])G.St([s*W/2,D/2,0],[s*W/2,0,H],0.3,G.metal);for(let i=1;i<6;i++){const t=i/6;G.St([-W/2,-D/2*(1-t),H*t],[W/2,-D/2*(1-t),H*t],0.2,G.metal);G.St([-W/2,D/2*(1-t),H*t],[W/2,D/2*(1-t),H*t],0.2,G.metal);}});
DM('workbench',(G)=>{const {W,D,H}=G;G.B(0,0,H-1.75,W,D,1.75,G.wood);G.legs(W,D,H-1.75,3.5,G.wood,1);G.B(0,0,6,W-4,D-4,0.75,G.wood);G.B(0,-D/2+0.5,H,W,0.8,30,G.M('peg',0xb59a72,{roughness:.9}));for(let i=0;i<8;i++)G.B(-W/2+6+i*(W-12)/7,-D/2+1.5,H+8+(i%3)*6,1,1.2,5,G.metal);});
DM('toolchest',(G)=>{const {W,D,H}=G;G.B(0,0,4,W,D,H-4,G.M('tc',hx(G.opt.c??0xc0392b),{roughness:.35,metalness:.4}));for(let i=0;i<6;i++)G.B(0,D/2+0.4,6+i*(H-8)/6,W-3,0.6,1,G.chrome);for(const a of [-1,1])for(const b of [-1,1])G.Cy(a*(W/2-3),b*(D/2-3),0,2,4,G.dark);});
DM('bike',(G)=>{const {W,D,H}=G;const L=Math.max(W,D),al=D>=W;const P=(a,z)=>al?[0,a,z]:[a,0,z];  for(const a of [-L/2+14,L/2-14]){G.St(P(a,14),P(0,18),0.6,G.M('bf',hx(G.opt.c??0x1f5fbf),{metalness:.4,roughness:.4}));G.St(P(a,14),P(a*0.6,34),0.6,G.M('bf',hx(G.opt.c??0x1f5fbf),{metalness:.4,roughness:.4}));}
  G.St(P(-L*0.15,34),P(L*0.25,34),0.6,G.M('bf',hx(G.opt.c??0x1f5fbf),{metalness:.4,roughness:.4}));for(const a of [-L/2+14,L/2-14]){for(let i=0;i<16;i++){const t=i/16*Math.PI*2;G.St(P(a+Math.cos(t)*13,14+Math.sin(t)*13),P(a+Math.cos(t+0.4)*13,14+Math.sin(t+0.4)*13),1,G.dark,6);}}});
DM('trashbin',(G)=>{const {W,D,H}=G;G.B(0,0,3,W,D,H-6,G.M('tb',hx(G.opt.c??0x2f4f2f),{roughness:.6}));G.B(0,1,H-3,W+1,D+1,3,G.M('tb',hx(G.opt.c??0x2f4f2f),{roughness:.6}));for(const s of [-1,1])G.Cy(s*(W/2-2),-D/2+3,0,3,1,G.dark);});
DM('motorcycle',(G)=>{const {W,D}=G;const al=D>=W;const L=Math.max(W,D);const P=(a,z)=>al?[0,a,z]:[a,0,z];const body=G.M('mc',hx(G.opt.c??0x1a1a1a),{roughness:.3,metalness:.5});for(const a of [-L/2+12,L/2-12])for(let i=0;i<14;i++){const t=i/14*Math.PI*2;G.St(P(a+Math.cos(t)*12,12+Math.sin(t)*12),P(a+Math.cos(t+0.5)*12,12+Math.sin(t+0.5)*12),2,G.dark,6);}
  const [u,v]=al?[0,0]:[0,0];G.B(u,v,16,al?10:L*0.55,al?L*0.55:10,12,body);G.St(P(L*0.3,26),P(L*0.35,40),0.8,G.chrome);G.St(P(L/2-12,12),P(L*0.32,30),1,G.chrome);});
DM('kayak',(G)=>{const {W,D,H}=G;const al=D>=W;G.Sp(0,0,H/2,Math.max(W,D)/2,G.M('ky',hx(G.opt.c??0xe8732a),{roughness:.4}),al?Math.min(W,D)/Math.max(W,D):1,al?1:Math.min(W,D)/Math.max(W,D),H/Math.max(W,D));});
// ---- outdoor living ----
DM('patioset',(G)=>{DECOR_MODELS.table(G);});
DM('lounge',(G)=>{const {W,D}=G;G.B(0,0,8,W,D,3,G.metal);for(const s of [-1,1])for(const b of [-1,1])G.B(s*(W/2-1),b*(D/2-3),0,1.5,1.5,8,G.metal);G.B(0,4,11,W-2,D-12,3,G.fab);for(let i=0;i<6;i++){const t=i/5;G.B(0,-D/2+2+t*10,12+Math.pow(1-t,1)*20,W-2,3,3,G.fab);}});
DM('adirondack',(G)=>{const {W,D}=G;for(let i=0;i<5;i++)G.B(0,-D/2+8+i*4,12-i*1.2,W-8,3.5,1,G.wood);for(let i=0;i<7;i++){const u=-W/2+6+i*(W-12)/6;G.St([u,-D/2+8,12],[u*1.25,-D/2-4,38-Math.abs(i-3)*2],1.6,G.wood,4);}for(const s of [-1,1]){G.B(s*(W/2-2.5),0,22,6,D-6,1,G.wood);G.B(s*(W/2-2.5),D/2-6,0,2,2,22,G.wood);G.B(s*(W/2-2.5),-D/2+8,0,2,2,14,G.wood);}});
DM('porchswing',(G)=>{const {W,D}=G;dChair(G,0,0,1,G.wood,18,18,1);G.B(0,0,16,W,D,2,G.wood);for(let i=0;i<8;i++)G.B(-W/2+W*(i+0.5)/8,-D/2+1,18,W/9,1,16,G.wood);for(const s of [-1,1]){G.B(s*(W/2-1),0,18,2,D,9,G.wood);G.St([s*(W/2-1),-D/2+1,34],[s*(W/2-1),0,96],0.2,G.metal);G.St([s*(W/2-1),D/2-1,27],[s*(W/2-1),0,96],0.2,G.metal);}});
DM('hammock',(G)=>{const {W,D}=G;const al=W>=D;const L=Math.max(W,D);for(const s of [-1,1]){const [u,v]=al?[s*L/2,0]:[0,s*L/2];G.B(u,v,0,4,4,2,G.metal);G.St(al?[s*L/2,-10,2]:[-10,s*L/2,2],al?[s*L/2,0,48]:[0,s*L/2,48],0.8,G.metal);G.St(al?[s*L/2,10,2]:[10,s*L/2,2],al?[s*L/2,0,48]:[0,s*L/2,48],0.8,G.metal);}
  for(let i=0;i<12;i++){const t=i/11-0.5;const z=24+Math.pow(t*2,2)*16;G.B(al?t*L*0.75:0,al?0:t*L*0.75,z,al?L*0.075:Math.min(W,D)*0.8,al?Math.min(W,D)*0.8:L*0.075,0.4,G.fab);}});
DM('umbrella',(G)=>{const {W,H}=G;G.Cy(0,0,0,9,2,G.dark,20);G.Cy(0,0,2,0.8,H-2,G.metal);G.Co(0,0,H-16,W/2,14,G.fab,8);});
DM('grill',(G)=>{const {W,D,H}=G;G.B(0,0,0,W*0.6,D,H-14,G.dark);for(const s of [-1,1])G.B(s*(W/2-W*0.1),0,H-16,W*0.2,D,1,G.dark);G.B(0,0,H-16,W*0.6,D,8,G.M('ss',0xc0c4c8,{metalness:.7,roughness:.3}));const g=new THREE.CylinderGeometry(D/2*IN,D/2*IN,W*0.6*IN,20,1,false,0,Math.PI);G.St([-W*0.3,0,H-8],[W*0.3,0,H-8],D/2-0.5,G.M('ss',0xc0c4c8,{metalness:.7,roughness:.3}),20);G.B(0,D/2+1.5,H-6,W*0.4,1,1,G.chrome);for(let i=0;i<3;i++)G.Cy(-W*0.15+i*W*0.15,D/2+0.5,H-20,1,1,G.dark);});
DM('firepit',(G)=>{const {W,H}=G;if(G.opt.square){G.B(0,0,0,W,G.D,H,G.M('stone',0x8a8378,{roughness:1}));G.B(0,0,H-2,W-8,G.D-8,2.2,G.dark);}else{G.Cy(0,0,0,W/2,H,G.M('stone',0x8a8378,{roughness:1}),24);G.Cy(0,0,H-2,W/2-4,2.2,G.dark,24);}
  G.Co(0,0,H,W*0.18,W*0.25,G.M('fire',0xff8a2a,{roughness:.6,emissive:0xa04010}),8);if(G.opt.table)G.Cy(0,0,H-1,W/2+2,1,G.M('stone2',0xb0a898,{roughness:.8}),24);});
DM('hottub',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,H,G.M('cab',0x5a4632,{roughness:.8}));G.B(0,0,H-1.5,W-8,D-8,1.6,G.M('water',0x4fa3c7,{roughness:.05,transparent:true,opacity:.75}));G.B(0,0,H,W,D,0.6,G.M('lip',0xe6e6e6));});
DM('planter',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,H,G.pot);G.B(0,0,H-1,W-2,D-2,0.6,G.soil);for(let i=0;i<8;i++){const a=i*2.4;G.Sp(Math.cos(a)*W*0.25,Math.sin(a)*D*0.25,H+4+(i%3)*3,Math.min(W,D)*0.18,G.leaf,1,1,0.8);}});
DM('fountain',(G)=>{const {W,H}=G;G.Cy(0,0,0,W/2,10,G.M('stone',0xb0a898,{roughness:.9}),26);G.Cy(0,0,9.5,W/2-2,0.6,G.M('water',0x4fa3c7,{roughness:.05,transparent:true,opacity:.7}),26);G.Cy(0,0,10,4,H-24,G.M('stone',0xb0a898),14);G.Cy(0,0,H-14,W/4,4,G.M('stone',0xb0a898),20,W/3);G.Cy(0,0,H-10,3,10,G.M('stone',0xb0a898),12,1.5);});
DM('birdbath',(G)=>{const {W,H}=G;G.Cy(0,0,0,W*0.3,2,G.M('stone',0xb0a898),18);G.Cy(0,0,2,3,H-6,G.M('stone',0xb0a898),12,2.2);G.Cy(0,0,H-4,W/2,4,G.M('stone',0xb0a898),24,W/2-2);G.Cy(0,0,H-0.6,W/2-2,0.4,G.M('water',0x4fa3c7,{transparent:true,opacity:.7}),22);});
DM('pergola',(G)=>{const {W,D,H}=G;for(const a of [-1,1])for(const b of [-1,1])G.B(a*(W/2-3),b*(D/2-3),0,6,6,H-8,G.wood);for(const b of [-1,1])G.B(0,b*(D/2-3),H-8,W+12,2,8,G.wood);for(let i=0;i<Math.round(W/16);i++)G.B(-W/2+W*(i+0.5)/Math.round(W/16),0,H-2,2,D+12,6,G.wood);});
DM('outdoorkitchen',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,H-2,G.M('stone',0x9a9286,{roughness:1}));G.B(0,0,H-2,W+1,D+1,2,G.M('ctop',0x3a3a3a,{roughness:.3}));G.B(-W/4,0,H,W*0.35,D-6,8,G.M('ss',0xc0c4c8,{metalness:.7,roughness:.3}));for(let i=0;i<2;i++)G.B(W/6+i*W/5,D/2+0.2,8,W/6,0.3,20,G.M('ss',0xc0c4c8,{metalness:.7,roughness:.3}));});
// ---- games, fitness, music ----
DM('pooltable',(G)=>{const {W,D,H}=G;G.B(0,0,H-6,W,D,6,G.wood);G.B(0,0,H-0.1,W-10,D-10,0.2,G.M('felt',0x1f6b3a,{roughness:1}));for(const a of [-1,1])for(const b of [-1,1])G.B(a*(W/2-6),b*(D/2-6),0,6,6,H-6,G.wood);for(const a of [-1,0,1])for(const b of [-1,1])G.Cy(a*(W/2-5),b*(D/2-5),H-0.2,1.8,0.3,G.dark);for(let i=0;i<6;i++)G.Sp(-W/4+(i%3)*2.4,(i-3)*1.2,H+1.1,1.1,G.M('ball'+i,[0xf2c230,0x1f5fbf,0xd9534f,0x6a2c91,0xff8c1a,0xf4f4f2][i]));});
DM('pingpong',(G)=>{const {W,D,H}=G;G.B(0,0,H-1,W,D,1,G.M('tt',0x1f4f8a,{roughness:.6}));G.B(0,0,H,0.3,D+6,6,G.M('net',0xf4f4f2,{transparent:true,opacity:.6}));G.B(0,0,H-0.02,W,0.6,0.05,G.white);for(const a of [-1,1])for(const b of [-1,1])G.B(a*(W/2-8),b*(D/2-6),0,2,2,H-1,G.dark);});
DM('piano',(G)=>{const {W,D,H}=G;const blk=G.M('piano',0x0d0d0f,{roughness:.15,metalness:.2});if(G.opt.grand){const g=new THREE.CylinderGeometry(1,1,1,4);G.B(0,-D/4,26,W,D/2,12,blk);G.Sp(W*0.15,D/6,32,D*0.42,blk,W/D*0.9,1,0.1);G.B(0,-D/2+3,26,W,6,4,G.white);for(const p of [[-W/2+4,-D/2+4],[W/2-4,-D/2+4],[0,D/2-8]])G.Cy(p[0],p[1],0,2,26,blk);G.B(0,-D/2-8,0,W*0.6,14,19,blk);return;}
  G.B(0,-D/2+6,0,W,12,H,blk);G.B(0,D/2-6,26,W,12,3,blk);G.B(0,D/2-6,29,W-6,8,0.8,G.white);for(let i=0;i<36;i++)if(i%7!==2&&i%7!==6)G.B(-W/2+5+i*(W-10)/36,D/2-8,29.8,0.5,4.5,0.6,blk);for(const s of [-1,1])G.B(s*(W/2-2),D/2-4,0,3,4,26,blk);G.B(0,D/2+12,0,W*0.6,14,19,blk);});
DM('treadmill',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,7,G.dark);G.B(0,0,7,W-6,D-10,0.5,G.M('belt',0x1a1a1a,{roughness:1}));for(const s of [-1,1])G.St([s*(W/2-2),-D/2+6,7],[s*(W/2-2),-D/2+10,H-6],1,G.metal);G.B(0,-D/2+10,H-8,W,6,6,G.dark);G.B(0,-D/2+10,H-2,W*0.5,4,8,G.screen);});
DM('exbike',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,4,2,G.dark);G.B(0,D/2-4,0,W,4,2,G.dark);G.St([0,-D/2+2,2],[0,0,H-14],1.5,G.dark);G.St([0,D/2-4,2],[0,-4,H-16],1.5,G.dark);G.Cy(0,-D/2+8,10,9,4,G.metal,20);G.B(0,4,H-18,9,11,3,G.dark);G.St([0,-D/2+6,22],[0,-D/2+4,H],1,G.metal);G.B(0,-D/2+4,H,16,2,2,G.dark);});
DM('weightbench',(G)=>{const {W,D,H}=G;G.B(0,0,H-3,12,D*0.7,3,G.fab);G.legs(12,D*0.7,H-3,2,G.metal,1);for(const s of [-1,1])G.B(s*(W/2-2),-D/2+6,0,2,2,44,G.metal);G.St([-W/2,-D/2+6,42],[W/2,-D/2+6,42],0.6,G.chrome);for(const s of [-1,1])G.Disc(s*(W/2-6),-D/2+6,42,8,2,G.dark);});
DM('gametable',(G)=>{DECOR_MODELS.table(G);G.Cy(0,0,G.H,(G.W-36)*0.42,0.2,G.M('felt',0x1f6b3a,{roughness:1}),28);});
// ---- electronics ----
DM('tv',(G)=>{const {W,H}=G;if(G.opt.stand!==false){G.B(0,0,0,W*0.25,8,1,G.dark);G.B(0,0,1,2,2,3,G.dark);}G.B(0,0,G.opt.stand!==false?4:0,W,1.3,H-(G.opt.stand!==false?4:0),G.screen);});
DM('soundbar',(G)=>{G.B(0,0,0,G.W,G.D,G.H,G.M('sb',0x2a2a2a,{roughness:.8}));});
DM('speaker',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,H,G.dark);G.Disc(0,D/2+0.1,H*0.7,W*0.3,0.3,G.metal);G.Disc(0,D/2+0.1,H*0.35,W*0.4,0.3,G.metal);});
DM('computer',(G)=>{const {W,D,H}=G;G.B(0,0,0,9,7,0.6,G.dark);G.B(0,0,0.6,1.5,1.5,6,G.dark);G.B(0,0,6,W,1,H-6,G.screen);G.B(0,D/2-2,0,W*0.75,5,0.6,G.M('kb',0xdcdcdc));});
DM('laptop',(G)=>{const {W,D}=G;G.B(0,0,0,W,D,0.6,G.M('lt',0xb9bcbf,{metalness:.6,roughness:.3}));G.B(0,-D/2,0.6,W,0.3,D*0.95,G.screen,0);});
// ---- kids ----
DM('playkitchen',(G)=>{const {W,D,H}=G;G.B(0,0,0,W,D,H-14,G.M('pk',0xf4e0c8,{roughness:.6}));G.B(0,-D/2+1,H-14,W,2,14,G.M('pk2',0x9fd3c7));for(const s of [-1,1])G.Cy(s*W/5,0,H-14,W/9,0.4,G.dark);G.B(0,D/2+0.2,6,W*0.4,0.3,10,G.glass);});
DM('kidstable',(G)=>{DECOR_MODELS.table(G);});
DM('rockinghorse',(G)=>{const {W,D,H}=G;const al=D>=W;const L=Math.max(W,D);for(const s of [-1,1])G.St(al?[s*4,-L/2,2]:[-L/2,s*4,2],al?[s*4,L/2,2]:[L/2,s*4,2],1,G.wood);G.Sp(0,0,H*0.6,L*0.3,G.M('hz',0xc8a070),al?0.5:1,al?1:0.5,0.6);G.Sp(al?0:L*0.3,al?L*0.3:0,H*0.85,L*0.14,G.M('hz',0xc8a070));for(const a of [-1,1])for(const b of [-1,1])G.St(al?[a*4,b*L*0.25,4]:[b*L*0.25,a*4,4],al?[a*3,b*L*0.2,H*0.55]:[b*L*0.2,a*3,H*0.55],0.8,G.M('hz',0xc8a070));});
// ---- people and pets (scale figures) ----
DM('person',(G)=>{const {H}=G;const s=G.opt.kind||'man';const skin=G.M('skin',hx(G.opt.skin??0xc69c7c),{roughness:.7}),shirt=G.M('shirt',hx(G.opt.shirt??0x3d5a80),{roughness:.9}),pants=G.M('pants',hx(G.opt.pants??0x2f3640),{roughness:.9});
  if(s==='wheelchair'){for(const x of [-1,1]){G.To(x*12,0,13,12,0.8,G.dark,false);}G.B(0,0,19,16,16,2,G.dark);G.B(0,-8,19,16,1.5,16,G.dark);G.B(0,1,21,14,14,5,pants);G.B(0,8,10,12,6,12,pants);G.B(0,-3,26,14,8,18,shirt);G.Sp(0,-3,49,4.6,skin);return;}
  const k=H/70;G.Cy(-2.6*k,0,0,1.7*k,32*k,pants,10);G.Cy(2.6*k,0,0,1.7*k,32*k,pants,10);G.B(0,0,31*k,s==='woman'?11*k:13*k,7*k,s==='woman'?22*k:23*k,shirt);if(s==='woman')G.Co(0,0,26*k,8*k,12*k,shirt,16);
  for(const x of [-1,1])G.St([x*(s==='woman'?6.5:7.5)*k,0,52*k],[x*8.5*k,0.5,32*k],1.3*k,skin);G.Cy(0,0,53*k,1.6*k,3*k,skin);G.Sp(0,0,60*k,4.4*k,skin,0.9,1,1.15);G.Sp(0,-0.6,62.5*k,4.6*k,G.M('hair',hx(G.opt.hair??0x3b2b1e)),0.95,1,0.75);});
DM('dog',(G)=>{const {W,D,H}=G;const al=D>=W;const L=Math.max(W,D);const fur=G.M('fur',hx(G.opt.c??0xc8a070),{roughness:1});G.Sp(0,0,H*0.62,L*0.32,fur,al?0.55:1,al?1:0.55,0.55);const hd=al?[0,L*0.38]:[L*0.38,0];G.Sp(hd[0],hd[1],H*0.85,L*0.13,fur);for(const a of [-1,1])for(const b of [-1,1])G.Cy(al?a*W*0.22:b*L*0.25,al?b*L*0.25:a*W*0.22,0,L*0.04,H*0.5,fur,8);});
DM('cat',(G)=>{DECOR_MODELS.dog(G);});
