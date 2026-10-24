/* ======================= sloped lot: ground elevation anywhere on the site ======================= */
// settings.gradeOffset is the finished floor above the ground on the HIGH side of the house. settings.slope.fall is how far
// the ground drops across the house toward slope.dir (compass degrees, 0 = north/up on the plan, 90 = east).
const SLOPE_DIRS=[[0,'North (top of the plan)'],[45,'Northeast'],[90,'East (right)'],[135,'Southeast'],[180,'South (bottom of the plan)'],[225,'Southwest'],[270,'West (left)'],[315,'Northwest']];
function slopeOf(p){const s=p.settings?.slope||{};return {fall:+s.fall||0,dir:s.dir??180};}
const _gradeCache=new WeakMap();
function gradeFrame(p){let c=_gradeCache.get(p);if(c)return c;const S=slopeOf(p);const lv=groundLevel(p);const base=(lv?lv.elevation:0)-(p.settings?.gradeOffset||0);
  const a=S.dir*Math.PI/180;const v={x:Math.sin(a),y:-Math.cos(a)};let s0=0,s1=1;
  const ol=lv&&S.fall?buildingOutline(p,lv.id):null;if(ol){const ss=ol.pts.map(q=>q.x*v.x+q.y*v.y);s0=Math.min(...ss);s1=Math.max(...ss);if(s1-s0<12)s1=s0+12;}
  c={base,fall:S.fall,v,s0,s1,dir:S.dir,slope:S.fall?S.fall/(s1-s0):0};_gradeCache.set(p,c);return c;}
// ground elevation (inches, same datum as level elevations) at plan point x,y
function gradeAt(p,x,y){const G=gradeFrame(p);if(!G.fall)return G.base;return G.base-G.fall*((x*G.v.x+y*G.v.y)-G.s0)/(G.s1-G.s0);}
const gradeLow=p=>{const G=gradeFrame(p);return G.base-G.fall;};
// stepped foundation helpers: split a polyline ring into short runs so each piece can stop at the ground below it
function ringPieces(pts,maxLen=24){const out=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];const L=Math.hypot(b.x-a.x,b.y-a.y);if(L<0.5)continue;const n=Math.max(1,Math.ceil(L/maxLen));
  for(let j=0;j<n;j++){const t0=j/n,t1=(j+1)/n;out.push({a:{x:a.x+(b.x-a.x)*t0,y:a.y+(b.y-a.y)*t0},b:{x:a.x+(b.x-a.x)*t1,y:a.y+(b.y-a.y)*t1},len:L/n,ang:Math.atan2(b.y-a.y,b.x-a.x)});}}return out;}
// a foundation wall following the outline: top is flat, bottom follows the ground (minus the footing depth)
function addSteppedWall(ctx,p,pts,thick,zTop,below,mat,tile=24){const inward=(()=>{let a2=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];a2+=a.x*b.y-b.x*a.y;}return a2>0?-1:1;})();
  for(const s of ringPieces(pts)){const mid={x:(s.a.x+s.b.x)/2,y:(s.a.y+s.b.y)/2};const d={x:Math.cos(s.ang),y:Math.sin(s.ang)};const n={x:-d.y*inward,y:d.x*inward};
    const zb=Math.min(gradeAt(p,s.a.x,s.a.y),gradeAt(p,s.b.x,s.b.y))-below;const h=zTop-zb;if(h<0.3)continue;const c={x:mid.x+n.x*thick/2,y:mid.y+n.y*thick/2};
    const geo=uvBox(s.len+0.02,h,thick,tile);ctx.add(geo,mat,c.x*IN,(zb+h/2)*IN,c.y*IN,-s.ang,true);}}
// elevation faces for the same wall: quads whose bottom edge follows the slope exactly
function steppedFaces(F,p,pts,zTop,below,extra){let a2=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];a2+=a.x*b.y-b.x*a.y;}const sg=a2>0?1:-1;
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];const ex=b.x-a.x,ey=b.y-a.y,L=Math.hypot(ex,ey)||1;const n={x:sg*ey/L,y:-sg*ex/L};
    const za=gradeAt(p,a.x,a.y)-below,zb=gradeAt(p,b.x,b.y)-below;if(zTop-Math.min(za,zb)<0.3)continue;F.push({kind:'part',pts:[[a.x,a.y,za],[b.x,b.y,zb],[b.x,b.y,zTop],[a.x,a.y,zTop]],n,...extra});}}
// 3D ground follows the slope
function updateGround3D(st,p){const g=st.ground;if(!g)return;const G=gradeFrame(p);
  if(!G.fall){if(g.userData.baked){const pos=g.geometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,0);pos.needsUpdate=true;g.geometry.computeVertexNormals();}g.position.y=(st.groundY||0)-0.02;return;}
  if(!g.userData.baked){g.geometry=new THREE.PlaneGeometry(600,600,1,1);g.geometry.rotateX(-Math.PI/2);g.rotation.set(0,0,0);g.userData.baked=true;}
  const pos=g.geometry.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i)/IN,y=pos.getZ(i)/IN;pos.setY(i,(gradeAt(p,x,y)-0.25)*IN);}pos.needsUpdate=true;g.geometry.computeVertexNormals();g.position.set(0,0,0);}
// site plan: spot grades at the house corners (finished floor = 100.00') and a slope arrow
function gradeDL(dl,p,PT,k){const S=slopeOf(p);const first=groundLevel(p);const ol=buildingOutline(p,first.id);if(!ol)return;const el=z=>(100+(z-first.elevation)/12).toFixed(2)+"'";
  const c=polyLabelPt(ol.pts.map(q=>[q.x,q.y]));const cp=PT(c[0],c[1]);dl.text(cp[0],cp[1]+0.16*k,'FF '+el(first.elevation),{size:6*k,bold:true,anchor:'middle'});
  for(const q of ol.pts){const a=PT(q.x,q.y);const d={x:q.x-c[0],y:q.y-c[1]};const L=Math.hypot(d.x,d.y)||1;const o=[a[0]+d.x/L*0.12*k,a[1]+d.y/L*0.12*k];
    dl.line(o[0]-0.03*k,o[1]-0.03*k,o[0]+0.03*k,o[1]+0.03*k,0.5);dl.line(o[0]-0.03*k,o[1]+0.03*k,o[0]+0.03*k,o[1]-0.03*k,0.5);dl.text(o[0]+0.05*k,o[1]-0.04*k,el(gradeAt(p,q.x,q.y)),{size:5*k});}
  try{drainageDL(dl,p,PT,k);}catch(e){console.error(e);}
  if(!S.fall)return;const G=gradeFrame(p);const v=G.v;const span=(G.s1-G.s0)*0.35;const a=PT(c[0]-v.x*span,c[1]-v.y*span),b=PT(c[0]+v.x*span,c[1]+v.y*span);
  dl.line(a[0],a[1],b[0],b[1],0.8,{dash:[0.06*k,0.04*k]});const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const h=0.09*k;
  dl.poly([b,[b[0]-h*Math.cos(ang-0.4),b[1]-h*Math.sin(ang-0.4)],[b[0]-h*Math.cos(ang+0.4),b[1]-h*Math.sin(ang+0.4)]],{fill:'#111111',stroke:'#111111',w:0.4});
  dl.text((a[0]+b[0])/2,(a[1]+b[1])/2-0.06*k,`SLOPE ${(G.slope*100).toFixed(1)}% DOWN`,{size:5.5*k,bold:true,anchor:'middle'});}
