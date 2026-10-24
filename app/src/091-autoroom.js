/* ======================= click inside walls to make a room ======================= */
// Flood-fills a 2" grid from the click, stopping at walls (doors and windows count as wall here),
// traces the outline, then snaps each edge to the centerline of the wall it runs along.
function detectRoom(p,levelId,pt){
  const walls=p.walls.filter(w=>w.level===levelId&&w.status!=='demolish');if(walls.length<3)return null;
  const g=2;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const w of walls){x0=Math.min(x0,w.x1,w.x2);y0=Math.min(y0,w.y1,w.y2);x1=Math.max(x1,w.x1,w.x2);y1=Math.max(y1,w.y1,w.y2);}
  if(pt.x<=x0||pt.x>=x1||pt.y<=y0||pt.y>=y1)return null;
  x0-=g*4;y0-=g*4;x1+=g*4;y1+=g*4;const nx=Math.ceil((x1-x0)/g),ny=Math.ceil((y1-y0)/g);if(nx*ny>4e6)return null;
  const blk=new Uint8Array(nx*ny);const J=wallJoins(walls);
  for(const w of walls){const d=wdir(w),L=wlen(w),ja=(J[w.id]?.a||0)+0.5,jb=(J[w.id]?.b||0)+0.5,t=w.thick/2+0.5;
    const ax=Math.min(w.x1,w.x2)-t-ja,bx=Math.max(w.x1,w.x2)+t+jb,ay=Math.min(w.y1,w.y2)-t-ja,by=Math.max(w.y1,w.y2)+t+jb;
    for(let j=Math.max(0,Math.floor((ay-y0)/g));j<=Math.min(ny-1,Math.ceil((by-y0)/g));j++)for(let i=Math.max(0,Math.floor((ax-x0)/g));i<=Math.min(nx-1,Math.ceil((bx-x0)/g));i++){
      const cx=x0+(i+0.5)*g,cy=y0+(j+0.5)*g;const s=(cx-w.x1)*d.x+(cy-w.y1)*d.y;if(s<-ja||s>L+jb)continue;const off=Math.abs((cx-w.x1)*-d.y+(cy-w.y1)*d.x);if(off<=t)blk[j*nx+i]=1;}}
  const si=Math.floor((pt.x-x0)/g),sj=Math.floor((pt.y-y0)/g);if(blk[sj*nx+si])return null;
  const fill=new Uint8Array(nx*ny);const st=[sj*nx+si];fill[sj*nx+si]=1;let n=0;
  while(st.length){const c=st.pop();n++;const i=c%nx,j=(c-i)/nx;if(i===0||j===0||i===nx-1||j===ny-1)return null; // leaked outside: not enclosed
    for(const q of [c-1,c+1,c-nx,c+nx])if(!fill[q]&&!blk[q]){fill[q]=1;st.push(q);}}
  if(n*g*g<144*4)return null;
  // trace the outline: directed boundary edges with the filled cell on the left
  const edges=new Map();const key=(i,j)=>i+','+j;const addE=(a,b)=>{edges.set(key(...a),b);};
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){if(!fill[j*nx+i])continue;
    if(!fill[(j-1)*nx+i])addE([i+1,j],[i,j]);if(!fill[(j+1)*nx+i])addE([i,j+1],[i+1,j+1]);if(!fill[j*nx+i-1])addE([i,j],[i,j+1]);if(!fill[j*nx+i+1])addE([i+1,j+1],[i+1,j]);}
  const loops=[];const seen=new Set();
  for(const [k0] of edges){if(seen.has(k0))continue;const loop=[];let k=k0;let guard=0;while(!seen.has(k)&&guard++<1e6){seen.add(k);const [a,b]=k.split(',').map(Number);loop.push([a,b]);const nx_=edges.get(k);if(!nx_)break;k=key(...nx_);}if(loop.length>3)loops.push(loop);}
  const area=l=>{let s=0;for(let i=0;i<l.length;i++){const a=l[i],b=l[(i+1)%l.length];s+=a[0]*b[1]-b[0]*a[1];}return s/2;};
  let outer=loops.sort((a,b)=>Math.abs(area(b))-Math.abs(area(a)))[0];if(!outer)return null;
  let poly=outer.map(([i,j])=>[x0+i*g,y0+j*g]);
  // drop collinear points, then Douglas-Peucker to clean stair-steps on angled walls
  const dp=(pts,tol)=>{if(pts.length<3)return pts;let md=0,mi=0;const a=pts[0],b=pts[pts.length-1];for(let i=1;i<pts.length-1;i++){const d=projSeg({x:pts[i][0],y:pts[i][1]},{x:a[0],y:a[1]},{x:b[0],y:b[1]}).d;if(d>md){md=d;mi=i;}}
    return md>tol?[...dp(pts.slice(0,mi+1),tol).slice(0,-1),...dp(pts.slice(mi),tol)]:[a,b];};
  {let far=0;for(let i=1;i<poly.length;i++)if(Math.hypot(poly[i][0]-poly[0][0],poly[i][1]-poly[0][1])>Math.hypot(poly[far][0]-poly[0][0],poly[far][1]-poly[0][1]))far=i;
    poly=[...dp(poly.slice(0,far+1),g*1.6).slice(0,-1),...dp([...poly.slice(far),poly[0]],g*1.6).slice(0,-1)];}
  // snap each edge to the centerline of the parallel wall it hugs
  const lines=poly.map((a,i)=>{const b=poly[(i+1)%poly.length];const L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;const d={x:(b[0]-a[0])/L,y:(b[1]-a[1])/L};const m={x:(a[0]+b[0])/2,y:(a[1]+b[1])/2};
    let best=null;for(const w of walls){const wd=wdir(w);if(Math.abs(wd.x*d.y-wd.y*d.x)>0.12)continue;const q=projSeg(m,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});const lineD=Math.abs((m.x-w.x1)*-wd.y+(m.y-w.y1)*wd.x);
      if(Math.abs(lineD-w.thick/2)<g*2.5&&q.d<w.thick/2+g*3&&(!best||Math.abs(lineD-w.thick/2)<best.e))best={e:Math.abs(lineD-w.thick/2),p:{x:w.x1,y:w.y1},d:wd};}
    return best?{p:best.p,d:best.d}:{p:{x:a[0],y:a[1]},d};});
  const out=[];for(let i=0;i<lines.length;i++){const A=lines[(i-1+lines.length)%lines.length],B=lines[i];const den=A.d.x*B.d.y-A.d.y*B.d.x;
    if(Math.abs(den)<1e-6){out.push(poly[i]);continue;}const t=((B.p.x-A.p.x)*B.d.y-(B.p.y-A.p.y)*B.d.x)/den;out.push([Math.round((A.p.x+A.d.x*t)*16)/16,Math.round((A.p.y+A.d.y*t)*16)/16]);}
  let clean=out.filter((q,i)=>{const r=out[(i+1)%out.length];return Math.hypot(q[0]-r[0],q[1]-r[1])>0.5;});
  // remove spikes from stub walls (A-B-A) and points in the middle of straight runs
  for(let pass=0;pass<6;pass++){let changed=false;const n=clean.length;if(n<4)break;
    for(let i=0;i<clean.length;i++){const a=clean[(i-1+clean.length)%clean.length],b=clean[i],c=clean[(i+1)%clean.length];
      const cross=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);const same=Math.hypot(a[0]-c[0],a[1]-c[1])<0.5;
      if(same){clean.splice(i,1);clean.splice(i%clean.length,1);changed=true;break;}if(Math.abs(cross)<1e-6){clean.splice(i,1);changed=true;break;}}
    if(!changed)break;}
  return clean.length>=3?clean:null;
}
// move a set of items together (multi-select, nudging)
function moveItems(B,items,dx,dy){let q=B;const ids=k=>new Set(items.filter(i=>i.kind===k).map(i=>i.id));
  const W=ids('wall');if(W.size)q={...q,walls:q.walls.map(w=>W.has(w.id)?{...w,x1:w.x1+dx,y1:w.y1+dy,x2:w.x2+dx,y2:w.y2+dy}:w)};
  const R=ids('room');if(R.size)q={...q,rooms:q.rooms.map(r=>R.has(r.id)?{...r,pts:r.pts.map(([x,y])=>[x+dx,y+dy])}:r)};
  const F=ids('fixture');if(F.size)q={...q,fixtures:q.fixtures.map(f=>F.has(f.id)?{...f,x:f.x+dx,y:f.y+dy}:f)};
  const S=ids('stair');if(S.size)q={...q,stairs:q.stairs.map(s=>S.has(s.id)?{...s,x:s.x+dx,y:s.y+dy}:s)};
  const RF=ids('roof');if(RF.size)q={...q,roofs:q.roofs.map(r=>RF.has(r.id)?{...r,x:r.x+dx,y:r.y+dy}:r)};
  for(const k of ['elec','ramp','shape','dim','anno'])for(const id of ids(k))q=moveDraft(q,k,id,dx,dy);
  for(const k of Object.keys(OBJ))for(const id of ids(k))q=regMove(q,k,id,dx,dy);
  const O=ids('opening');for(const id of O){const o=q.openings.find(x=>x.id===id);const w=q.walls.find(x=>x.id===o.wall);if(!w||W.has(w.id))continue;const d=wdir(w);const L=wlen(w);const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos+dx*d.x+dy*d.y));q=updObj(q,'opening',id,{pos});}
  return q;}
function itemsInBox(p,levelId,a,b){const x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),y0=Math.min(a.y,b.y),y1=Math.max(a.y,b.y);const inB=(x,y)=>x>=x0&&x<=x1&&y>=y0&&y<=y1;const out=[];const L=o=>o.level===levelId;
  for(const w of p.walls.filter(L))if(inB(w.x1,w.y1)&&inB(w.x2,w.y2))out.push({kind:'wall',id:w.id});
  for(const r of p.rooms.filter(L))if(r.pts.every(q=>inB(q[0],q[1])))out.push({kind:'room',id:r.id});
  for(const f of (p.fixtures||[]).filter(L))if(inB(f.x,f.y))out.push({kind:'fixture',id:f.id});
  for(const s of p.stairs.filter(L))if(inB(s.x,s.y))out.push({kind:'stair',id:s.id});
  for(const d of (p.elec||[]).filter(L))if(inB(d.x,d.y))out.push({kind:'elec',id:d.id});
  for(const r of (p.ramps||[]).filter(L))if(inB(r.x,r.y))out.push({kind:'ramp',id:r.id});
  for(const s of (p.shapes||[]).filter(L)){const c=shapeCenter(s);if(inB(c.x,c.y))out.push({kind:'shape',id:s.id});}
  for(const d of (p.dims||[]).filter(L))if(inB(d.a.x,d.a.y)&&inB(d.b.x,d.b.y))out.push({kind:'dim',id:d.id});
  for(const n of (p.annos||[]).filter(L))if(inB(n.x,n.y))out.push({kind:'anno',id:n.id});
  for(const k of Object.keys(OBJ))for(const o of objsOn(p,k,levelId)){const q=regPts(p,k,o);if(q.length&&q.every(v=>inB(v.x,v.y)))out.push({kind:k,id:o.id});}
  return out;}
