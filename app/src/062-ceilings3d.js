/* ======================= ceilings in 3D: flat, vaulted (follows the roof), tray, coffered ======================= */
// heights are inches above the level floor; plan x/y in inches
// roofs over a level: its own, plus roofs set on a lower level that rise above this floor (an attic or half-story)
function roofsOver(p,lv){return (p.roofs||[]).filter(r=>{if(r.level===lv.id)return true;const rl=lvlOf(p,r.level);if(!rl||rl.elevation>=lv.elevation)return false;const b=roofBuild(r,roofTop(p,r));return b.peak>lv.elevation+12;});}
function vaultFn(p,lv,cap){const bs=roofsOver(p,lv).map(r=>roofBuild(r,roofTop(p,r)));const attic=!!lv.attic;
  return (x,y)=>{let z=-Infinity;for(const b of bs){const h=roofHeightAt(b,x,y);if(h>z)z=h;}if(!isFinite(z))return cap||lv.height;let h=z-11-lv.elevation;if(!attic)h=Math.max(lv.height,h);if(cap)h=Math.min(h,cap);return Math.max(0,h);};} // 2x8 rafter + sheathing + drywall under the roof
function addCeiling3D(p,lv,r,add,std,mat){const e0=lv.elevation;const H=r.ceilingH||lv.height;const kind=r.ceiling||'flat';const pts=r.pts.map(q=>({x:q[0],y:q[1]}));
  const flat=(poly,z,holes=[])=>{const sh=new THREE.Shape(poly.map(q=>new THREE.Vector2(q.x*IN,q.y*IN)));for(const h of holes)sh.holes.push(new THREE.Path(h.map(q=>new THREE.Vector2(q.x*IN,q.y*IN))));const g=new THREE.ShapeGeometry(sh);g.rotateX(Math.PI/2);return add(g,mat,0,(e0+z-0.05)*IN,0,0,false);};
  if(kind==='vaulted'){const f=vaultFn(p,lv,r.ceilingH||null);const xs=pts.map(q=>q.x),ys=pts.map(q=>q.y);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    const step=Math.max(6,Math.min(18,Math.max(x1-x0,y1-y0)/40));const nx=Math.ceil((x1-x0)/step),ny=Math.ceil((y1-y0)/step);const P=r.pts;const pos=[];
    const V=(x,y)=>[x*IN,(e0+f(x,y)-0.05)*IN,y*IN];
    for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const ax=x0+i*step,ay=y0+j*step,bx=Math.min(x1,ax+step),by=Math.min(y1,ay+step);if(!inPoly((ax+bx)/2,(ay+by)/2,P))continue;
      const a=V(ax,ay),b=V(bx,ay),c=V(bx,by),d=V(ax,by);pos.push(...a,...c,...b,...a,...d,...c);}
    if(!pos.length)return flat(pts,H);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return add(g,mat,0,0,0,0,false);}
  if(kind==='tray'){const inset=offsetPoly(pts,-Math.min(24,Math.max(12,Math.sqrt(polyArea(r.pts))*0.12)));const rise=12;
    if(polyArea(inset.map(q=>[q.x,q.y]))<144*4)return flat(pts,H);
    flat(pts,H,[inset]);flat(inset,H+rise);
    for(let i=0;i<inset.length;i++){const a=inset[i],b=inset[(i+1)%inset.length];const L=Math.hypot(b.x-a.x,b.y-a.y);if(L<1)continue;add(new THREE.BoxGeometry(L*IN,rise*IN,0.5*IN),mat,(a.x+b.x)/2*IN,(e0+H+rise/2)*IN,(a.y+b.y)/2*IN,-Math.atan2(b.y-a.y,b.x-a.x),false);}
    return;}
  flat(pts,H);
  if(kind==='coffered'){const xs=pts.map(q=>q.x),ys=pts.map(q=>q.y);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);const sp=Math.max(36,Math.min(60,(x1-x0)/4));const bw=5,bd=6;
    const beam=(a,b)=>{for(const [s,t] of clipSegPoly(a,b,pts)){const L=Math.hypot(t.x-s.x,t.y-s.y);if(L<6)continue;add(new THREE.BoxGeometry(L*IN,bd*IN,bw*IN),mat,(s.x+t.x)/2*IN,(e0+H-bd/2)*IN,(s.y+t.y)/2*IN,-Math.atan2(t.y-s.y,t.x-s.x),false);}};
    for(let x=x0+sp;x<x1-12;x+=sp)beam({x,y:y0-1},{x,y:y1+1});for(let y=y0+sp;y<y1-12;y+=sp)beam({x:x0-1,y},{x:x1+1,y});}
  if(kind==='open'){} // open to the joists: the flat plane stands in for now
}
// ceiling height at a point for code checks and section drawings
function ceilingHeightAt(p,lv,r,x,y){if((r.ceiling||'flat')==='vaulted')return vaultFn(p,lv,r.ceilingH||null)(x,y);return (r.ceilingH||lv.height)+((r.ceiling==='tray')?12:0);}
