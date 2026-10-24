/* ======================= shaped 3D models for fixtures, appliances and furniture ======================= */
// Each model is built in the fixture's own frame: u across the width, v from back (-d/2, against the wall) to front (+d/2), z up from the floor.
function fixtureKind(f){const named=((f.name||'')+' '+(f.lib||'')).toLowerCase();
  const tests=[['bunk',/bunk/],['bed',/\bbed\b|f-.*bed/],['recliner',/recliner/],['armchair',/armchair|accent chair|club chair/],['sofa',/sofa|loveseat|sectional|couch/],
    ['officechair',/office chair|desk chair/],['desk',/desk/],['coffee',/coffee table/],['endtable',/end table|side table/],['dining',/dining table|kitchen table|table/],
    ['nightstand',/nightstand/],['dresser',/dresser|chest of drawers|filing|lateral file/],['wardrobe',/wardrobe|armoire/],['bookcase',/bookcase|bookshelf|shelving/],['tv',/tv console|media|entertainment/],
    ['car',/car \(|\bcar\b|sedan/],['truck',/pickup|truck/],['mower',/mower/],['golfcart',/golf cart/],
    ['tub',/\btub\b|bathtub|soaking/],['rollin',/roll-in/],['shower',/shower/],['lav',/\blav\b|lavatory|pedestal|vessel/],['range',/range|cooktop|stove/],['fridge',/fridge|refrigerator/],['dw',/\bdw\b|dishwasher/],
    ['dryer',/dryer/],['washer',/washer/]];
  const order=['bunk','bed','recliner','armchair','sofa','officechair','desk','coffee','endtable','nightstand','dresser','wardrobe','bookcase','tv','car','truck','mower','golfcart','dining','tub','rollin','shower','lav','range','fridge','dw','dryer','washer'];
  const T=Object.fromEntries(tests);for(const k of order)if(T[k].test(named))return k;const ty=String(f.type||'').toLowerCase();for(const k of order)if(T[k].test(ty))return k;return null;}
function fixtureModel3D(f,lv,add,std,isSel,mSel,baseCol){
  if(f.type==='model')return modelMesh3D(f,lv,add,std,isSel,mSel,baseCol);
  if(f.type==='grabbar'){const g=new THREE.CylinderGeometry(0.75*IN,0.75*IN,f.w*IN,12);g.rotateZ(Math.PI/2);const q=fxLocal(f,0,0);add(g,isSel?mSel:std('grab',0xc9ccd0,{metalness:.7,roughness:.25}),q.x*IN,(lv.elevation+(f.elev||33))*IN,q.y*IN,-(f.rot||0)*Math.PI/180);
    for(const s of [-1,1]){const e=fxLocal(f,s*(f.w/2-1),-0.8);add(new THREE.CylinderGeometry(1.4*IN,1.4*IN,0.6*IN,12).rotateX(Math.PI/2),isSel?mSel:std('grab',0xc9ccd0,{metalness:.7,roughness:.25}),e.x*IN,(lv.elevation+(f.elev||33))*IN,e.y*IN,-(f.rot||0)*Math.PI/180);}return true;}
  const kind=fixtureKind(f);if(!kind)return false;const ry=-(f.rot||0)*Math.PI/180;const e0=lv.elevation+(f.elev||0);
  const W=f.w,D=f.d,H=f.h;const M=(key,c,o={})=>isSel?mSel:std('m3-'+key+'-'+c,c,o);
  const wood=M('wood',0x8a6a4a,{roughness:.6}),dark=M('dark',0x2a2a2a,{roughness:.5}),white=M('white',0xf4f4f2,{roughness:.35}),steel=M('steel',0xc9ccd0,{roughness:.3,metalness:.6}),glassB=M('glassb',0x1b1d20,{roughness:.1,metalness:.3});
  const fab=M('fab',baseCol,{roughness:.95});
  const box=(u,v,z,w,d,h,mat)=>{const q=fxLocal(f,u,v);return add(new THREE.BoxGeometry(Math.max(.1,w)*IN,Math.max(.1,h)*IN,Math.max(.1,d)*IN),mat,q.x*IN,(e0+z+h/2)*IN,q.y*IN,ry);};
  const cyl=(u,v,z,r,h,mat,seg=16)=>{const q=fxLocal(f,u,v);return add(new THREE.CylinderGeometry(r*IN,r*IN,h*IN,seg),mat,q.x*IN,(e0+z+h/2)*IN,q.y*IN,ry);};
  const disc=(u,v,z,r,t,mat)=>{const g=new THREE.CylinderGeometry(r*IN,r*IN,t*IN,24);g.rotateX(Math.PI/2);const q=fxLocal(f,u,v);return add(g,mat,q.x*IN,(e0+z)*IN,q.y*IN,ry);}; // faces the front
  const legs=(w,d,h,s=2,inset=2,mat=wood)=>{for(const a of [-1,1])for(const b of [-1,1])box(a*(w/2-inset-s/2),b*(d/2-inset-s/2),0,s,s,h,mat);};
  const chair=(u,v,face,mat=wood)=>{const sgn=face;box(u,v,0,1.5,1.5,17,mat);box(u,v,17,18,18,2,mat);box(u,v-sgn*8,19,18,2,16,mat);for(const a of [-1,1])for(const b of [-1,1])box(u+a*8,v+b*8,0,1.5,1.5,17,mat);};
  switch(kind){
    case 'bed':case 'bunk':{box(0,0,0,W,D,12,wood);box(0,2,12,W-2,D-4,10,white);box(0,-D/2+1.5,0,W,3,kind==='bunk'?60:44,wood);
      for(const s of (W>50?[-1,1]:[0]))box(s*(W/4-1),-D/2+11,22,W>50?W/2-8:W-10,13,5,M('pillow',0xfbfbf8,{roughness:.9}));box(0,D*0.18,22,W,D*0.62,1.5,fab);
      if(kind==='bunk'){box(0,2,48,W-2,D-4,8,white);for(const a of [-1,1])for(const b of [-1,1])box(a*(W/2-1.5),b*(D/2-1.5),0,3,3,64,wood);box(0,D*0.18,56,W,D*0.62,1.5,fab);}return true;}
    case 'sofa':case 'armchair':case 'recliner':{const arm=kind==='sofa'?7:6;box(0,0,0,W,D,4,dark);box(0,1,4,W-2*arm,D-8,12,fab);
      const n=kind==='sofa'?Math.max(2,Math.round((W-2*arm)/28)):1;const cw=(W-2*arm)/n;for(let i=0;i<n;i++)box(-W/2+arm+cw*(i+0.5),3,16,cw-1,D-12,5,fab);
      box(0,-D/2+4.5,4,W,9,H-4,fab);for(const s of [-1,1])box(s*(W/2-arm/2),1,4,arm,D-2,20,fab);return true;}
    case 'dining':{const round=/round/.test((f.name||'').toLowerCase());if(round){cyl(0,0,H-1.5,Math.min(W,D)/2,1.5,wood,32);cyl(0,0,0,3,H-1.5,wood);box(0,0,0,18,18,1.5,wood);}
      else{box(0,0,H-1.5,W,D,1.5,wood);legs(W,D,H-1.5,2.5,3);}
      const along=Math.max(1,Math.floor(W/26));for(const s of [-1,1])for(let i=0;i<along;i++){const u=-W/2+W*(i+0.5)/along;chair(u,s*(D/2+6),-s);}
      if(W>=60&&D>=36){chair(-W/2-6,0,0);chair(W/2+6,0,0);}return true;}
    case 'desk':{box(0,0,H-1.25,W,D,1.25,wood);box(W/2-9,0,0,16,D-2,H-1.25,wood);for(let i=0;i<3;i++)box(W/2-9,D/2-0.6,4+i*8.5,14,0.4,7.5,M('wood2',0x7a5c3e));box(-W/2+1,0,0,2,D-2,H-1.25,wood);return true;}
    case 'officechair':{cyl(0,0,0,12,1,dark,5);cyl(0,0,1,1.2,16,steel);box(0,0,17,20,19,3,dark);box(0,-9,20,19,2.5,20,dark);return true;}
    case 'coffee':case 'endtable':case 'nightstand':{if(kind==='nightstand'){box(0,0,2,W,D,H-2,wood);legs(W,D,2,1.5,0.5);for(const z of [H*0.35,H*0.7])box(0,D/2-0.3,z-3,W-3,0.6,0.6,dark);return true;}
      box(0,0,H-1.5,W,D,1.5,wood);legs(W,D,H-1.5,2,1.5);box(0,0,5,W-4,D-4,0.75,wood);return true;}
    case 'dresser':{box(0,0,3,W,D,H-3,wood);legs(W,D,3,2,1);const rows=Math.max(3,Math.round(H/11));const cols=W>48?2:1;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const z=3+(H-3)*(r+0.5)/rows;box(-W/2+W*(c+0.5)/cols,D/2,z-0.2,W/cols-3,0.5,0.5,dark);
        cyl(-W/2+W*(c+0.5)/cols,D/2+0.6,z+1,0.6,0.8,steel,8);}return true;}
    case 'wardrobe':{box(0,0,0,W,D,H,wood);box(0,D/2,1,0.4,0.4,H-2,dark);for(const s of [-1,1])box(s*2.5,D/2+0.5,H/2-6,0.8,0.8,12,steel);return true;}
    case 'bookcase':{for(const s of [-1,1])box(s*(W/2-0.4),0,0,0.75,D,H,wood);box(0,-D/2+0.2,0,W,0.4,H,wood);box(0,0,H-0.75,W,D,0.75,wood);const n=Math.max(2,Math.floor(H/13));
      for(let i=0;i<n;i++){const z=i*H/n;box(0,0,z,W-1.5,D,0.75,wood);if(i<n-1){let u=-W/2+2;let k=0;while(u<W/2-4){const bw=1+((k*7)%3);const bh=8+((k*5)%4);box(u+bw/2,0,z+0.75,bw,D*0.7,bh,M('book'+(k%5),[0x7a2e2e,0x2e4a7a,0x3c6b45,0xb08a3c,0x5a4a3a][k%5]));u+=bw+0.3;k++;}}}return true;}
    case 'tv':{box(0,0,0,W,D,H,wood);box(0,0,H+2,Math.min(W-6,58),2,33,glassB);box(0,0,H,10,8,2,dark);return true;}
    case 'car':case 'truck':case 'golfcart':case 'mower':{const body=M('car',baseCol,{roughness:.35,metalness:.4});const lenAxisV=D>=W;const L=lenAxisV?D:W,Wd=lenAxisV?W:D;
      const B=(a,b,z,l,w,h,m)=>lenAxisV?box(b,a,z,w,l,h,m):box(a,b,z,l,w,h,m);const wheel=(a,b)=>{const g=new THREE.CylinderGeometry(13*IN,13*IN,8*IN,18);if(lenAxisV)g.rotateZ(Math.PI/2);else g.rotateX(Math.PI/2);const q=lenAxisV?fxLocal(f,b,a):fxLocal(f,a,b);add(g,dark,q.x*IN,(e0+13)*IN,q.y*IN,ry);};
      if(kind==='mower'){B(0,0,8,L,Wd*0.8,14,M('mow',0x2f6b2f));B(-L*0.15,0,22,L*0.25,Wd*0.4,8,dark);return true;}
      const cl=kind==='truck'?0.38:0.5;B(0,0,10,L*0.92,Wd*0.9,22,body);B(kind==='truck'?L*0.12:-L*0.02,0,32,L*cl,Wd*0.82,18,M('cabin',0x9fb4c4,{roughness:.1,metalness:.3}));
      for(const a of [-L*0.32,L*0.32])for(const b of [-Wd*0.4,Wd*0.4])wheel(a,b);return true;}
    case 'tub':{const t=3;box(0,0,0,W,D,2,white);box(0,-D/2+t/2,0,W,t,H,white);box(0,D/2-t/2,0,W,t,H,white);box(-W/2+t/2,0,0,t,D,H,white);box(W/2-t/2,0,0,t,D,H,white);
      box(0,0,2,W-2*t,D-2*t,0.5,M('tubin',0xe6eef2,{roughness:.2}));cyl((f.hand==='L'?-1:1)*(W/2-6),-D/2+t+1,H+2,0.8,3,steel,10);return true;}
    case 'shower':case 'rollin':{box(0,0,0,W,D,kind==='rollin'?0.5:4,white);const gl=M('glass',0xcfe4ee,{roughness:.05,transparent:true,opacity:.28});
      if(kind==='shower')box(0,D/2-0.3,4,W,0.4,72,gl);else box(0,D/2-0.5,78,W,0.6,0.6,steel);cyl(0,-D/2+2,76,2.5,1,steel,14);box(0,-D/2+1.5,40,3,1,6,steel);return true;}
    case 'lav':{if(/pedestal/.test((f.name||'').toLowerCase())){cyl(0,-2,0,4,30,white);box(0,0,30,W,D,5,white);}else box(0,0,H-6,W,D,6,white);
      const g=new THREE.CylinderGeometry(W*0.32*IN,W*0.26*IN,0.6*IN,24);g.scale(1,1,0.75);const q=fxLocal(f,0,1);add(g,M('bowl',0xdfe3e5,{roughness:.2}),q.x*IN,(e0+H+0.1)*IN,q.y*IN,ry);cyl(0,-D/2+2.5,H,0.7,6,steel,10);return true;}
    case 'range':{box(0,0,0,W,D,H-1,steel);box(0,0,H-1,W,D-2,1,glassB);for(const a of [-1,1])for(const b of [-1,1])cyl(a*W/4.5,b*D/5,H,W/9,0.15,M('burner',0x3a3a3a),20);
      box(0,D/2+0.1,6,W-4,0.4,20,glassB);box(0,D/2+1,27,W-6,1,1,steel);box(0,-D/2+1.5,H,W,3,7,steel);return true;}
    case 'fridge':{box(0,0,0,W,D,H,steel);const split=W>=33;if(split){box(0,D/2+0.1,H*0.33,0.5,0.4,H*0.67,dark);for(const s of [-1,1])box(s*2,D/2+1.2,H*0.45,1,1,H*0.4,steel);}
      else box((f.hand==='R'?-1:1)*(W/2-3),D/2+1.2,H*0.45,1,1,H*0.4,steel);box(0,D/2+0.1,H*0.32,W,0.4,0.5,dark);box(0,D/2+1.2,H*0.2,W*0.5,1,1,steel);return true;}
    case 'dw':{box(0,0,0,W,D,H-1.5,steel);box(0,D/2+1,H-6,W-4,1,1,steel);return true;}
    case 'washer':case 'dryer':{box(0,0,0,W,D,H,white);box(0,D/2+0.1,H-6,W,0.4,6,M('panel',0xdedfdd));disc(0,D/2+0.5,H*0.45,W*0.3,1,M('door',0x9aa3a8,{roughness:.2,metalness:.4}));disc(0,D/2+0.9,H*0.45,W*0.22,0.4,glassB);return true;}
  }
  return false;}
