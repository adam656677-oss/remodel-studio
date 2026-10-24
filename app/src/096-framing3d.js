/* ======================= framing view: studs, plates, headers, joists and rafters ======================= */
const WOOD=0xd9b98a, WOOD2=0xc9a674, LVLC=0xc58f4c;
function addFraming3D(p,lv,walls,add,std,opts={}){
  const mW=std('fr-wood',WOOD,{roughness:.85}),mW2=std('fr-wood2',WOOD2,{roughness:.85}),mH=std('fr-lvl',LVLC,{roughness:.8});
  const e0=lv.elevation;const fr=framingOf(lv);const J=wallJoins(walls);
  const B=(cx,cy,z0,w,d,h,ang,m)=>add(new THREE.BoxGeometry(Math.max(0.05,w)*IN,Math.max(0.05,h)*IN,Math.max(0.05,d)*IN),m,cx*IN,(z0+h/2)*IN,cy*IN,-(ang||0),false);
  for(const w of walls){const L=wlen(w),d=wdir(w),H=wallH(p,w),ang=Math.atan2(d.y,d.x);const sd=LUMBER[studOf(w)]||3.5;const sA=-(J[w.id]?.a||0),sB=L+(J[w.id]?.b||0);
    const P=s=>({x:w.x1+d.x*s,y:w.y1+d.y*s});const run=(s0,s1,z0,h,m)=>{if(s1-s0<0.2)return;const c=P((s0+s1)/2);B(c.x,c.y,e0+z0,s1-s0,sd,h,ang,m);};
    // plates
    const ops=p.openings.filter(o=>o.wall===w.id&&o.status!=='demolish').map(o=>{const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));return {o,s0:pos-o.width/2-1.5,s1:pos+o.width/2+1.5};}).sort((a,b)=>a.s0-b.s0);
    {let c=sA;for(const q of ops){if(q.o.type==='door'){run(c,q.s0,0,1.5,mW2);c=q.s1;}}run(c,sB,0,1.5,mW2);}
    run(sA,sB,H-3,1.5,mW2);run(sA,sB,H-1.5,1.5,mW2);
    // studs on 16" layout from the wall start, plus corner studs, skipping openings
    const studH=H-4.5;const xs=new Set();for(let s=Math.max(0,sA+0.75);s<=sB-0.75;s+=16)xs.add(Math.round(s*100)/100);xs.add(sA+0.75);xs.add(sB-0.75);
    for(const s of xs){const inOp=ops.find(q=>s>q.s0-0.75&&s<q.s1+0.75);const c=P(s);
      if(!inOp){B(c.x,c.y,e0+1.5,1.5,sd,studH,ang,mW);continue;}
      const o=inOp.o;const sill=o.type==='door'?0:o.sill,head=sill+o.height;const hd=(w.bearing||w.kind==='exterior')?Math.min(11.25,H-4.5-head):1.5;
      if(o.type==='window'&&sill>3)B(c.x,c.y,e0+1.5,1.5,sd,sill-3-1.5,ang,mW); // cripples below
      const top=head+hd;if(H-3-top>1)B(c.x,c.y,e0+top,1.5,sd,H-3-top,ang,mW);} // cripples above
    for(const q of ops){const o=q.o;const sill=o.type==='door'?0:o.sill,head=sill+o.height;const bearing=w.bearing||w.kind==='exterior';const hd=bearing?Math.max(1.5,Math.min(11.25,H-4.5-head)):1.5;
      for(const s of [q.s0+0.75,q.s1-0.75]){const c=P(s);B(c.x,c.y,e0+1.5,1.5,sd,head-1.5,ang,mW);} // jacks
      for(const s of [q.s0-0.75,q.s1+0.75]){const c=P(s);B(c.x,c.y,e0+1.5,1.5,sd,studH,ang,mW);} // kings
      const c=P((q.s0+q.s1)/2);B(c.x,c.y,e0+head,q.s1-q.s0,sd,hd,ang,bearing&&hd>3?mH:mW);
      if(o.type==='window'){B(c.x,c.y,e0+sill-3,q.s1-q.s0-3,sd,1.5,ang,mW);}}}
  // floor joists (first floor over a crawlspace, or upper floors) and ceiling joists under the attic
  const ol=buildingOutline(p,lv.id);const first=groundLevel(p).id===lv.id;
  if(ol){const pts=ol.pts;const xs=pts.map(q=>q.x),ys=pts.map(q=>q.y);const bx=[Math.min(...xs),Math.max(...xs)],by=[Math.min(...ys),Math.max(...ys)];
    const alongX=fr.dir==='x'?true:fr.dir==='y'?false:(bx[1]-bx[0])<(by[1]-by[0]); // joists run the short way
    const joists=(depth,z,spacing,m)=>{const inner=offsetPoly(pts,-1.5);
      if(alongX){for(let y=by[0]+0.75;y<=by[1]-0.75;y+=spacing)for(const [a,b] of clipSegPoly({x:bx[0]-1,y},{x:bx[1]+1,y},inner)){B((a.x+b.x)/2,y,z,Math.hypot(b.x-a.x,b.y-a.y),1.5,depth,0,m);}}
      else{for(let x=bx[0]+0.75;x<=bx[1]-0.75;x+=spacing)for(const [a,b] of clipSegPoly({x,y:by[0]-1},{x,y:by[1]+1},inner)){B(x,(a.y+b.y)/2,z,1.5,Math.hypot(b.x-a.x,b.y-a.y),depth,0,m);}}
      for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];const L=dist(a,b);const dd={x:(b.x-a.x)/L,y:(b.y-a.y)/L};const nn=offsetPoly([a,b,{x:b.x+dd.y*-1,y:b.y-dd.x*-1}],0);B((a.x+b.x)/2,(a.y+b.y)/2,z,L,1.5,depth,Math.atan2(dd.y,dd.x),m);}};
    if(!(first&&fr.foundation==='slab')){const jd=LUMBER[fr.joist]||9.25;joists(jd,e0-0.75-jd,fr.spacing||16,mW);}
    if(!levelAbove(p,lv)){const cd=LUMBER[fr.ceiling]||5.5;joists(cd,e0+lv.height,fr.ceilingSpacing||16,mW2);}}
}
// rafters follow each roof face downhill, spaced along the ridge; ridge and hip boards on the creases
function addRafters3D(p,r,b,add,std){const rf=rafterOf(r);const rd=LUMBER[rf.rafter]||7.25;const sp=rf.spacing||16;const mW=std('fr-wood',WOOD,{roughness:.85}),mR=std('fr-ridge',WOOD2,{roughness:.85});
  for(const f of b.polys){const [a,c,e]=f;const u=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],v=[e[0]-a[0],e[1]-a[1],e[2]-a[2]];const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(Math.abs(n[2])<1e-9)continue;
    let g={x:n[0]/n[2],y:n[1]/n[2]};const gl=Math.hypot(g.x,g.y);if(gl<1e-6)continue;g={x:g.x/gl,y:g.y/gl};const per={x:-g.y,y:g.x};
    const xy=f.map(q=>({x:q[0],y:q[1]}));const proj=xy.map(q=>q.x*per.x+q.y*per.y),pg=xy.map(q=>q.x*g.x+q.y*g.y);const s0=Math.min(...proj),s1=Math.max(...proj),t0=Math.min(...pg),t1=Math.max(...pg);
    for(let s=s0+0.75;s<=s1-0.5;s+=sp){const A={x:per.x*s+g.x*(t0-2),y:per.y*s+g.y*(t0-2)},C={x:per.x*s+g.x*(t1+2),y:per.y*s+g.y*(t1+2)};
      for(const [q0,q1] of clipSegPoly(A,C,xy)){const z0=planeZ(f,q0.x,q0.y)-rd/2-0.75,z1=planeZ(f,q1.x,q1.y)-rd/2-0.75;const V=new THREE.Vector3((q1.x-q0.x)*IN,(z1-z0)*IN,(q1.y-q0.y)*IN);const L=V.length();if(L<0.05)continue;
        const m=add(new THREE.BoxGeometry(1.5*IN,L,rd*IN),mW,(q0.x+q1.x)/2*IN,(z0+z1)/2*IN,(q0.y+q1.y)/2*IN,0,false);const dir=V.clone().normalize();const side=new THREE.Vector3(per.x,0,per.y);
        const m4=new THREE.Matrix4().makeBasis(side,dir,new THREE.Vector3().crossVectors(side,dir).normalize());m.quaternion.setFromRotationMatrix(m4);}}}
  for(const l of b.lines){const a={x:l[0][0],y:l[0][1]},c={x:l[1][0],y:l[1][1]};const za=roofHeightAt(b,a.x,a.y),zc=roofHeightAt(b,c.x,c.y);if(!isFinite(za)||!isFinite(zc))continue;
    const V=new THREE.Vector3((c.x-a.x)*IN,(zc-za)*IN,(c.y-a.y)*IN);const L=V.length();if(L<0.05)continue;const dd=rd+2;const m=add(new THREE.BoxGeometry(1.5*IN,L,dd*IN),mR,(a.x+c.x)/2*IN,((za+zc)/2-dd/2)*IN,(a.y+c.y)/2*IN,0,false);
    const dir=V.clone().normalize();const up=new THREE.Vector3(0,1,0);let side=new THREE.Vector3().crossVectors(dir,up);if(side.length()<1e-6)side.set(1,0,0);side.normalize();const m4=new THREE.Matrix4().makeBasis(side,dir,new THREE.Vector3().crossVectors(side,dir).normalize());m.quaternion.setFromRotationMatrix(m4);}
}
