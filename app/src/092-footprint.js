/* ======================= building footprint ======================= */
// Outline of the outside faces of the exterior walls on one level, as [{x,y}] points.
// Used by foundations, auto roofs, decks against the house and the site plan.
const _fpCache=new WeakMap();
function buildingOutline(p,levelId){
  let m=_fpCache.get(p.walls);if(!m){m=new Map();_fpCache.set(p.walls,m);}
  if(m.has(levelId))return m.get(levelId);const r=computeOutline(p,levelId);m.set(levelId,r);return r;}
function computeOutline(p,levelId){
  const walls=p.walls.filter(w=>w.level===levelId&&w.kind==='exterior'&&w.status!=='demolish');if(walls.length<3)return null;
  const g=2;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const w of walls){const t=w.thick+g*4;x0=Math.min(x0,w.x1-t,w.x2-t);y0=Math.min(y0,w.y1-t,w.y2-t);x1=Math.max(x1,w.x1+t,w.x2+t);y1=Math.max(y1,w.y1+t,w.y2+t);}
  const nx=Math.ceil((x1-x0)/g),ny=Math.ceil((y1-y0)/g);if(nx*ny>6e6)return null;
  const blk=new Uint8Array(nx*ny);const J=wallJoins(walls);
  for(const w of walls){const d=wdir(w),L=wlen(w),ja=(J[w.id]?.a||0)+0.5,jb=(J[w.id]?.b||0)+0.5,t=w.thick/2+0.5;
    const ax=Math.min(w.x1,w.x2)-t-ja,bx=Math.max(w.x1,w.x2)+t+jb,ay=Math.min(w.y1,w.y2)-t-ja,by=Math.max(w.y1,w.y2)+t+jb;
    for(let j=Math.max(0,Math.floor((ay-y0)/g));j<=Math.min(ny-1,Math.ceil((by-y0)/g));j++)for(let i=Math.max(0,Math.floor((ax-x0)/g));i<=Math.min(nx-1,Math.ceil((bx-x0)/g));i++){
      const cx=x0+(i+0.5)*g,cy=y0+(j+0.5)*g;const s=(cx-w.x1)*d.x+(cy-w.y1)*d.y;if(s<-ja||s>L+jb)continue;if(Math.abs((cx-w.x1)*-d.y+(cy-w.y1)*d.x)<=t)blk[j*nx+i]=1;}}
  // flood the outside from the border; everything else is the building
  const out=new Uint8Array(nx*ny);const st=[0];out[0]=1;while(st.length){const c=st.pop();const i=c%nx,j=(c-i)/nx;
    if(i>0&&!out[c-1]&&!blk[c-1]){out[c-1]=1;st.push(c-1);}if(i<nx-1&&!out[c+1]&&!blk[c+1]){out[c+1]=1;st.push(c+1);}
    if(j>0&&!out[c-nx]&&!blk[c-nx]){out[c-nx]=1;st.push(c-nx);}if(j<ny-1&&!out[c+nx]&&!blk[c+nx]){out[c+nx]=1;st.push(c+nx);}}
  const fill=new Uint8Array(nx*ny);let n=0;for(let c=0;c<nx*ny;c++)if(!out[c]){fill[c]=1;n++;}if(n*g*g<144*20)return null;
  const poly=maskToPoly(fill,nx,ny,x0,y0,g,walls,+1);if(!poly)return null;
  return {pts:poly.map(([x,y])=>({x,y})),area:polyArea(poly)};
}
// trace a filled grid region and snap its edges to wall faces. side=+1 snaps to the wall face on the outside of the region, -1 inside.
function maskToPoly(fill,nx,ny,x0,y0,g,walls,side){
  const edges=new Map();const key=(i,j)=>i+','+j;const addE=(a,b)=>edges.set(key(...a),b);
  const F=(i,j)=>i>=0&&j>=0&&i<nx&&j<ny&&fill[j*nx+i];
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){if(!fill[j*nx+i])continue;
    if(!F(i,j-1))addE([i+1,j],[i,j]);if(!F(i,j+1))addE([i,j+1],[i+1,j+1]);if(!F(i-1,j))addE([i,j],[i,j+1]);if(!F(i+1,j))addE([i+1,j+1],[i+1,j]);}
  const loops=[];const seen=new Set();
  for(const [k0] of edges){if(seen.has(k0))continue;const loop=[];let k=k0,guard=0;while(!seen.has(k)&&guard++<2e6){seen.add(k);const [a,b]=k.split(',').map(Number);loop.push([a,b]);const nx_=edges.get(k);if(!nx_)break;k=key(...nx_);}if(loop.length>3)loops.push(loop);}
  const area=l=>{let s=0;for(let i=0;i<l.length;i++){const a=l[i],b=l[(i+1)%l.length];s+=a[0]*b[1]-b[0]*a[1];}return s/2;};
  const outer=loops.sort((a,b)=>Math.abs(area(b))-Math.abs(area(a)))[0];if(!outer)return null;
  let poly=outer.map(([i,j])=>[x0+i*g,y0+j*g]);
  const dp=(pts,tol)=>{if(pts.length<3)return pts;let md=0,mi=0;const a=pts[0],b=pts[pts.length-1];for(let i=1;i<pts.length-1;i++){const d=projSeg({x:pts[i][0],y:pts[i][1]},{x:a[0],y:a[1]},{x:b[0],y:b[1]}).d;if(d>md){md=d;mi=i;}}
    return md>tol?[...dp(pts.slice(0,mi+1),tol).slice(0,-1),...dp(pts.slice(mi),tol)]:[a,b];};
  {let far=0;for(let i=1;i<poly.length;i++)if(Math.hypot(poly[i][0]-poly[0][0],poly[i][1]-poly[0][1])>Math.hypot(poly[far][0]-poly[0][0],poly[far][1]-poly[0][1]))far=i;
    poly=[...dp(poly.slice(0,far+1),g*1.6).slice(0,-1),...dp([...poly.slice(far),poly[0]],g*1.6).slice(0,-1)];}
  const lines=poly.map((a,i)=>{const b=poly[(i+1)%poly.length];const L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;const d={x:(b[0]-a[0])/L,y:(b[1]-a[1])/L};const m={x:(a[0]+b[0])/2,y:(a[1]+b[1])/2};
    let best=null;for(const w of walls){const wd=wdir(w);if(Math.abs(wd.x*d.y-wd.y*d.x)>0.12)continue;const q=projSeg(m,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});const sd=(m.x-w.x1)*-wd.y+(m.y-w.y1)*wd.x;const lineD=Math.abs(sd);
      if(Math.abs(lineD-w.thick/2)<g*2.5&&q.d<w.thick/2+g*3&&(!best||Math.abs(lineD-w.thick/2)<best.e)){const sg=sd>=0?1:-1;best={e:Math.abs(lineD-w.thick/2),p:{x:w.x1+(-wd.y)*sg*w.thick/2,y:w.y1+wd.x*sg*w.thick/2},d:wd};}}
    return best?{p:best.p,d:best.d}:{p:{x:a[0],y:a[1]},d};});
  const out=[];for(let i=0;i<lines.length;i++){const A=lines[(i-1+lines.length)%lines.length],B=lines[i];const den=A.d.x*B.d.y-A.d.y*B.d.x;
    if(Math.abs(den)<1e-6){out.push(poly[i]);continue;}const t=((B.p.x-A.p.x)*B.d.y-(B.p.y-A.p.y)*B.d.x)/den;out.push([Math.round((A.p.x+A.d.x*t)*16)/16,Math.round((A.p.y+A.d.y*t)*16)/16]);}
  let clean=out.filter((q,i)=>{const r=out[(i+1)%out.length];return Math.hypot(q[0]-r[0],q[1]-r[1])>0.5;});
  for(let pass=0;pass<8;pass++){let changed=false;if(clean.length<4)break;
    for(let i=0;i<clean.length;i++){const a=clean[(i-1+clean.length)%clean.length],b=clean[i],c=clean[(i+1)%clean.length];
      const cross=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(Math.hypot(a[0]-c[0],a[1]-c[1])<0.5){clean.splice(i,1);clean.splice(i%clean.length,1);changed=true;break;}if(Math.abs(cross)<1e-6){clean.splice(i,1);changed=true;break;}}
    if(!changed)break;}
  return clean.length>=3?clean:null;
}
// offset a simple polygon [{x,y}]; d>0 grows it, d<0 shrinks it (mitered corners)
function offsetPoly(pts,d){const n=pts.length;if(n<3)return pts;let a2=0;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];a2+=a.x*b.y-b.x*a.y;}const sg=a2>0?1:-1; // outward normal sign for y-down plan
  const L=pts.map((a,i)=>{const b=pts[(i+1)%n];const ex=b.x-a.x,ey=b.y-a.y,l=Math.hypot(ex,ey)||1;const nn={x:sg*ey/l,y:-sg*ex/l};return {p:{x:a.x+nn.x*d,y:a.y+nn.y*d},d:{x:ex/l,y:ey/l},n:nn};});
  return pts.map((q,i)=>{const A=L[(i-1+n)%n],B=L[i];const den=A.d.x*B.d.y-A.d.y*B.d.x;if(Math.abs(den)<1e-6)return {x:q.x+B.n.x*d,y:q.y+B.n.y*d};
    const t=((B.p.x-A.p.x)*B.d.y-(B.p.y-A.p.y)*B.d.x)/den;return {x:A.p.x+A.d.x*t,y:A.p.y+A.d.y*t};});}
const polyPerimPts=pts=>{let s=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];s+=Math.hypot(b.x-a.x,b.y-a.y);}return s;};
// points spaced along a closed outline, starting `start` from each corner (used for vents, piers)
function alongOutline(pts,spacing,{corner=0,closed=true}={}){const out=[];const n=closed?pts.length:pts.length-1;
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%pts.length];const L=Math.hypot(b.x-a.x,b.y-a.y);if(L<1)continue;const d={x:(b.x-a.x)/L,y:(b.y-a.y)/L};
    const usable=L-2*corner;if(usable<=0){out.push({x:a.x+d.x*L/2,y:a.y+d.y*L/2,d,edge:i});continue;}const k=Math.max(1,Math.ceil(usable/spacing));for(let j=0;j<=k;j++){if(j===0&&corner===0&&i>0)continue;const s=corner+usable*j/k;out.push({x:a.x+d.x*s,y:a.y+d.y*s,d,edge:i,s,L});}}
  return out;}
