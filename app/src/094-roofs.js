/* ======================= roofs: trim, visible roof lines, auto roof, dormers ======================= */
const ROOF_STYLES=[['gable','Gable'],['hip','Hip'],['dutch','Dutch gable (hip with gablets)'],['gambrel','Gambrel (barn)'],['mansard','Mansard'],['shed','Shed'],['flat','Flat or low slope']];
const GUTTER_COLORS={white:0xf4f4f0,bronze:0x5a4636,black:0x26282a,copper:0xb87333};
function roofTrimOf(r){return {fascia:6,gutters:true,gutterColor:'white',soffit:true,rake:true,...(r.trim||{})};}
// boundary edges of a roof: eaves (level, at the eave height) and rakes (sloped edges at gable ends)
function roofEdges(b){const key=q=>q.map(v=>Math.round(v*4)/4).join(',');const cnt=new Map();const all=[];
  for(const f of b.polys)for(let i=0;i<f.length;i++){const a=f[i],c=f[(i+1)%f.length];const k=[key(a),key(c)].sort().join('|');cnt.set(k,(cnt.get(k)||0)+1);all.push([a,c,k]);}
  const eaves=[],rakes=[];for(const [a,c,k] of all){if(cnt.get(k)!==1)continue;if(Math.abs(a[2]-c[2])<0.05&&Math.abs(a[2]-b.eave)<1)eaves.push([a,c]);else if(Math.abs(a[2]-c[2])>=0.05)rakes.push([a,c]);}
  return {eaves,rakes};}
function addRoofTrim3D(p,lv,r,b,ctx){const t=roofTrimOf(r);if(r.style==='flat'&&(r.parapet||0)>0)return;const oh=r.overhang??12;if(oh<=0.5&&r.style!=='flat')return;
  const fm=ctx.col(r.trimColor?hexNum(r.trimColor):0xf6f4ee,{roughness:.6});const gm=ctx.col(GUTTER_COLORS[t.gutterColor]||0xf4f4f0,{roughness:.45,metalness:.1});
  const {eaves,rakes}=roofEdges(b);const zg0=-(p.settings?.gradeOffset||0);const cen={x:(b.u0+b.u1)/2,y:(b.v0+b.v1)/2};const C=b.axis==='x'?cen:{x:cen.y,y:cen.x};
  const fd=t.fascia||6;const spouts=[];
  for(const [a,c] of eaves){const L=Math.hypot(c[0]-a[0],c[1]-a[1]);if(L<6)continue;const d={x:(c[0]-a[0])/L,y:(c[1]-a[1])/L};let n={x:-d.y,y:d.x};const mid={x:(a[0]+c[0])/2,y:(a[1]+c[1])/2};
    if((C.x-mid.x)*n.x+(C.y-mid.y)*n.y>0)n={x:-n.x,y:-n.y}; // n points outward
    const ang=Math.atan2(d.y,d.x);const z=a[2];
    ctx.box(mid.x-n.x*0.4,mid.y-n.y*0.4,z-fd-0.5,L,0.75,fd+0.5,ang,fm);
    if(t.soffit&&oh>2){const so=oh-0.75;ctx.box(mid.x-n.x*(0.75+so/2),mid.y-n.y*(0.75+so/2),z-fd-0.25,L,so,0.5,ang,fm,false);}
    if(t.gutters){ctx.box(mid.x+n.x*2.6,mid.y+n.y*2.6,z-fd+0.5,L,4.5,4.5,ang,gm);spouts.push({x:a[0]+d.x*4+n.x*3,y:a[1]+d.y*4+n.y*3,z:z-fd+0.5,ang},{x:c[0]-d.x*4+n.x*3,y:c[1]-d.y*4+n.y*3,z:z-fd+0.5,ang});}}
  if(t.gutters){const seen=[];for(const s of spouts){if(seen.some(q=>Math.hypot(q.x-s.x,q.y-s.y)<30))continue;seen.push(s);const zg=gradeAt(p,s.x,s.y);const h=s.z-zg;if(h>12){ctx.box(s.x,s.y,zg+6,3,2,h-6,s.ang,gm,false);ctx.box(s.x,s.y,zg,3,10,3,s.ang,gm,false);}}}
  if(t.rake)for(const [a,c] of rakes){const A={x:a[0],y:a[1],z:a[2]-fd/2-0.2},B={x:c[0],y:c[1],z:c[2]-fd/2-0.2};ctx.stick(A,B,0.75,fd,fm);}
}
// roof plan: visible ridges, hips and valleys and the drip edge. A line is drawn only where the combined roof surface
// actually folds (so lines hidden under a taller roof, or between two roofs in the same plane, drop out).
function roofPlanGeo(p,lvId,roofs){
  const B=(roofs||p.roofs.filter(r=>r.level===lvId)).map(r=>({r,b:roofBuild(r,roofTop(p,r))}));
  const Hall=(x,y)=>{let m=-Infinity;for(const o of B){const h=roofHeightAt(o.b,x,y);if(h>m)m=h;}return m;};
  const runs=(a,c,test)=>{const L=Math.hypot(c[0]-a[0],c[1]-a[1]);const n=Math.max(6,Math.ceil(L/4));const out=[];let st=null;
    for(let i=0;i<=n;i++){const t=(i+0.5)/n;const ok=i<n&&test(a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t);const tt=i/n;if(ok&&st==null)st=tt;if(!ok&&st!=null){out.push([[a[0]+(c[0]-a[0])*st,a[1]+(c[1]-a[1])*st],[a[0]+(c[0]-a[0])*tt,a[1]+(c[1]-a[1])*tt]]);st=null;}}
    return out.filter(([u,v])=>Math.hypot(v[0]-u[0],v[1]-u[1])>1.5);};
  const fold=(a,c)=>{const L=Math.hypot(c[0]-a[0],c[1]-a[1])||1;const n=[-(c[1]-a[1])/L,(c[0]-a[0])/L];const d=3;
    return (x,y)=>{const h0=Hall(x,y);if(!isFinite(h0))return 0;const h1=Hall(x+n[0]*d,y+n[1]*d),h2=Hall(x-n[0]*d,y-n[1]*d);if(!isFinite(h1)||!isFinite(h2))return 0;return h1+h2-2*h0;};};
  const lines=[],edges=[];const seen=new Set();const addLine=(a,c,kind)=>{const k=[a,c].map(q=>q.map(v=>Math.round(v)).join(',')).sort().join('|');if(seen.has(k))return;seen.add(k);lines.push({a,b:c,kind});};
  const cand=[];for(const o of B)for(const l of o.b.lines)cand.push([[l[0][0],l[0][1]],[l[1][0],l[1][1]]]);
  for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++)for(const f1 of B[i].b.polys)for(const f2 of B[j].b.polys){const seg=planeMeet(f1,f2);if(seg)cand.push(seg);}
  for(const [a,c] of cand){const f=fold(a,c);for(const s of runs(a,c,(x,y)=>Math.abs(f(x,y))>0.4)){const m=[(s[0][0]+s[1][0])/2,(s[0][1]+s[1][1])/2];addLine(s[0],s[1],f(m[0],m[1])>0?'valley':'ridge');}}
  for(const o of B){const c0=cenOf(o.b);for(let i=0;i<4;i++){const a=o.b.outline[i],c=o.b.outline[(i+1)%4];const L=Math.hypot(c[0]-a[0],c[1]-a[1])||1;let n=[-(c[1]-a[1])/L,(c[0]-a[0])/L];
      const m=[(a[0]+c[0])/2,(a[1]+c[1])/2];if((c0.x-m[0])*n[0]+(c0.y-m[1])*n[1]>0)n=[-n[0],-n[1]];
      for(const s of runs(a,c,(x,y)=>{const h1=Hall(x-n[0]*1.5,y-n[1]*1.5),h2=Hall(x-n[0]*3,y-n[1]*3),hout=Hall(x+n[0]*1.5,y+n[1]*1.5);if(!isFinite(h1)||roofHeightAt(o.b,x-n[0]*1.5,y-n[1]*1.5)<h1-0.6)return false;
        if(!isFinite(hout))return true;const pred=h1+2*(h1-(isFinite(h2)?h2:h1));return Math.abs(hout-pred)>0.6;}))edges.push({a:s[0],b:s[1],r:o.r});}}
  return {B,lines,edges};}
const cenOf=b=>({x:(b.outline[0][0]+b.outline[2][0])/2,y:(b.outline[0][1]+b.outline[2][1])/2});
// xy segment where two planar faces have the same height, clipped to both faces' footprints
function planeMeet(f1,f2){const pl=f=>{const [a,b,c]=f;const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(Math.abs(n[2])<1e-9)return null;
    return {A:-n[0]/n[2],B:-n[1]/n[2],C:a[2]+(n[0]*a[0]+n[1]*a[1])/n[2]};};
  const p1=pl(f1),p2=pl(f2);if(!p1||!p2)return null;const a=p1.A-p2.A,b=p1.B-p2.B,c=p1.C-p2.C;if(Math.hypot(a,b)<1e-6)return null; // a x + b y + c = 0
  // clip the line to the overlap of both footprints' bounding boxes
  const bb=f=>{const xs=f.map(q=>q[0]),ys=f.map(q=>q[1]);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];};const b1=bb(f1),b2=bb(f2);
  const x0=Math.max(b1[0],b2[0]),y0=Math.max(b1[1],b2[1]),x1=Math.min(b1[2],b2[2]),y1=Math.min(b1[3],b2[3]);if(x0>x1||y0>y1)return null;
  const pts=[];if(Math.abs(b)>1e-9)for(const x of [x0,x1]){const y=-(a*x+c)/b;if(y>=y0-1e-6&&y<=y1+1e-6)pts.push([x,y]);}if(Math.abs(a)>1e-9)for(const y of [y0,y1]){const x=-(b*y+c)/a;if(x>=x0-1e-6&&x<=x1+1e-6)pts.push([x,y]);}
  if(pts.length<2)return null;pts.sort((p,q)=>p[0]-q[0]||p[1]-q[1]);const s=[pts[0],pts[pts.length-1]];
  // keep only the part inside both faces
  const inF=(f,x,y)=>inPoly(x,y,f.map(q=>[q[0],q[1]]));let t0=null,t1=null;const n=60;for(let i=0;i<=n;i++){const t=i/n;const x=s[0][0]+(s[1][0]-s[0][0])*t,y=s[0][1]+(s[1][1]-s[0][1])*t;if(inF(f1,x,y)&&inF(f2,x,y)){if(t0==null)t0=t;t1=t;}}
  if(t0==null||t1-t0<1e-3)return null;const P=t=>[s[0][0]+(s[1][0]-s[0][0])*t,s[0][1]+(s[1][1]-s[0][1])*t];return [P(Math.max(0,t0-0.5/n)),P(Math.min(1,t1+0.5/n))];}

/* ---- auto roof: split the footprint into overlapping rectangles, one roof each ---- */
function autoRoof(p,lvId,opt={}){const ol=buildingOutline(p,lvId);const st=opt.style||'hip',pitch=opt.pitch||6,oh=opt.overhang??12;
  const mk=(x,y,w,h)=>({id:uid('rf'),level:lvId,style:st,pitch,overhang:oh,ridge:w>=h?'x':'y',x,y,w,h,auto:true});
  if(!ol){const r=roofOverLevel(p,lvId);return r?[{...r,style:st,pitch,overhang:oh}]:[];}
  const P=ol.pts;const orth=P.every((q,i)=>{const n=P[(i+1)%P.length];return Math.abs(q.x-n.x)<0.5||Math.abs(q.y-n.y)<0.5;});
  const xs0=P.map(q=>q.x),ys0=P.map(q=>q.y);if(!orth||P.length<=4)return [mk(Math.min(...xs0),Math.min(...ys0),Math.max(...xs0)-Math.min(...xs0),Math.max(...ys0)-Math.min(...ys0))];
  // grid on the outline's own x and y breaks (exact rectangles, no rounding)
  const X=[...new Set(P.map(q=>Math.round(q.x*16)/16))].sort((a,b)=>a-b),Y=[...new Set(P.map(q=>Math.round(q.y*16)/16))].sort((a,b)=>a-b);
  const nx=X.length-1,ny=Y.length-1;if(nx>30||ny>30)return [mk(Math.min(...xs0),Math.min(...ys0),Math.max(...xs0)-Math.min(...xs0),Math.max(...ys0)-Math.min(...ys0))];const inside=[];for(let j=0;j<ny;j++){inside.push([]);for(let i=0;i<nx;i++)inside[j].push(inPoly((X[i]+X[i+1])/2,(Y[j]+Y[j+1])/2,P.map(q=>[q.x,q.y])));}
  const area=(i0,j0,i1,j1)=>(X[i1]-X[i0])*(Y[j1]-Y[j0]);const full=(i0,j0,i1,j1)=>{for(let j=j0;j<j1;j++)for(let i=i0;i<i1;i++)if(!inside[j][i])return false;return true;};
  const cov=inside.map(r=>r.map(()=>false));const chosen=[];
  const uncovered=(i0,j0,i1,j1)=>{let a=0;for(let j=j0;j<j1;j++)for(let i=i0;i<i1;i++)if(!cov[j][i])a+=(X[i+1]-X[i])*(Y[j+1]-Y[j]);return a;};
  for(let guard=0;guard<12;guard++){let best=null;
    for(let j0=0;j0<ny;j0++)for(let i0=0;i0<nx;i0++){if(!inside[j0][i0])continue;for(let j1=j0+1;j1<=ny;j1++)for(let i1=i0+1;i1<=nx;i1++){if(!full(i0,j0,i1,j1))break;const u=uncovered(i0,j0,i1,j1);if(u<=0)continue;
      const w=X[i1]-X[i0],h=Y[j1]-Y[j0];const score=u+0.15*area(i0,j0,i1,j1)-(Math.min(w,h)<60?1e6:0);if(!best||score>best.s)best={s:score,i0,j0,i1,j1};}}
    if(!best)break;for(let j=best.j0;j<best.j1;j++)for(let i=best.i0;i<best.i1;i++)cov[j][i]=true;chosen.push({x:X[best.i0],y:Y[best.j0],w:X[best.i1]-X[best.i0],h:Y[best.j1]-Y[best.j0]});
    if(inside.every((r,j)=>r.every((v,i)=>!v||cov[j][i])))break;}
  // a wing reaches into the body it joins only as far as that body's ridge (or its gable end), and its ridge runs into the body
  const hipLike=['hip','dutch','mansard'].includes(st);const out=[];
  for(const [k,R] of chosen.entries()){let r={...R};let ridge=r.w>=r.h?'x':'y';
    for(const Q of chosen.slice(0,k)){const ox=Math.min(r.x+r.w,Q.x+Q.w)-Math.max(r.x,Q.x),oy=Math.min(r.y+r.h,Q.y+Q.h)-Math.max(r.y,Q.y);if(ox<=0.5||oy<=0.5)continue;
      const qAxis=Q.w>=Q.h?'x':'y';const extX=r.x<Q.x-0.5||r.x+r.w>Q.x+Q.w+0.5,extY=r.y<Q.y-0.5||r.y+r.h>Q.y+Q.h+0.5;
      if(extX&&!extY){const east=r.x+r.w>Q.x+Q.w+0.5;const cut=qAxis==='x'&&!hipLike?(east?Q.x+Q.w-0.5:Q.x+0.5):Q.x+Q.w/2;
        if(east){const x1=r.x+r.w;r.x=Math.max(r.x,cut);r.w=x1-r.x;}else{r.w=Math.min(r.x+r.w,cut)-r.x;}ridge='x';}
      else if(extY&&!extX){const south=r.y+r.h>Q.y+Q.h+0.5;const cut=qAxis==='y'&&!hipLike?(south?Q.y+Q.h-0.5:Q.y+0.5):Q.y+Q.h/2;
        if(south){const y1=r.y+r.h;r.y=Math.max(r.y,cut);r.h=y1-r.y;}else{r.h=Math.min(r.y+r.h,cut)-r.y;}ridge='y';}}
    const o=mk(r.x,r.y,r.w,r.h);if(k>0)o.ridge=ridge;out.push(o);}
  return out;}

/* ---- dormers ---- */
function dormerInfo(p,d){const r=p.roofs.find(x=>x.id===d.roof);if(!r)return null;const b=roofBuild(r,roofTop(p,r));const a=d.a||0;const dir={x:Math.cos(a),y:Math.sin(a)};const ux={x:-dir.y,y:dir.x};
  const W=(u,s,z)=>({x:d.x+ux.x*u-dir.x*s,y:d.y+ux.y*u-dir.y*s,z});const h=(u,s)=>{const q=W(u,s,0);return roofHeightAt(b,q.x,q.y);};
  const zf=h(0,0);if(!isFinite(zf))return null;const zf2=h(0,24);const ph=isFinite(zf2)?(zf2-zf)/24:0.5;if(ph<0.05)return null;
  const w=d.w||72,wh=d.wh||42,oh=d.oh??8,pd=(d.pitch||(d.style==='shed'?3:8))/12;const zp=zf+wh;const st=d.style||'gable';
  const tris=[],walls=[];const T=(A,B,C)=>tris.push([[A.x,A.y,A.z],[B.x,B.y,B.z],[C.x,C.y,C.z]]);
  let depth;
  if(st==='shed'){const sStar=(zp-zf)/Math.max(0.02,ph-pd);depth=sStar;const zAt=s=>zp+s*pd;const U=w/2+oh;
    T(W(-U,-oh,zAt(-oh)),W(U,-oh,zAt(-oh)),W(U,sStar+2,zAt(sStar+2)));T(W(-U,-oh,zAt(-oh)),W(U,sStar+2,zAt(sStar+2)),W(-U,sStar+2,zAt(sStar+2)));
    for(const sg of [-1,1])walls.push([W(sg*w/2,0,zf-2),W(sg*w/2,0,zp),W(sg*w/2,sStar,zAt(sStar))]);}
  else{const U=w/2+oh,zr=zp+(w/2)*pd,ze=zp-oh*pd;const sr=(zr-zf)/ph,se=(ze-zf)/ph;depth=sr;
    for(const sg of [-1,1]){const P1=W(0,-oh,zr),P2=W(0,sr,zr),P3=W(sg*U,Math.max(-oh,se),ze),P4=W(sg*U,-oh,ze);T(P1,P2,P3);T(P1,P3,P4);
      walls.push([W(sg*w/2,0,zf-2),W(sg*w/2,0,zp),W(sg*w/2,(zp-zf)/ph,zp)]);}
    walls.push([W(-w/2,0,zp),W(w/2,0,zp),W(0,0,zr)]); // front gable
  }
  const win={w:Math.min(w-14,d.winW||w-18),h:Math.min(wh-12,d.winH||36)};
  const foot=[W(-w/2-oh,-oh,0),W(w/2+oh,-oh,0),W(w/2+oh,depth,0),W(-w/2-oh,depth,0)];
  return {r,b,W,zf,zp,ph,pd,w,wh,oh,tris,walls,win,foot,depth,dir,ux,st};}
I.dormer=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2 20L12 6l10 14"/><path d="M8 14l3-4 3 4v4H8z"/><path d="M10 15h2"/></svg>`;
I.autoroof=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2 12L8 6h8l6 6"/><path d="M8 6l-2 6M16 6l2 6M4 12h16v8H4z"/></svg>`;
regObj('dormer',{coll:'dormers',label:'Dormer',plural:'dormers',z:6,layer:'over',roofish:true,
  pts:(p,d)=>{const di=dormerInfo(p,d);return di?di.foot:[{x:d.x,y:d.y}];},hit:(p,d,raw)=>{const di=dormerInfo(p,d);return di?ptsIn(raw,di.foot):Math.hypot(raw.x-d.x,raw.y-d.y)<12;},
  move:(d,dx,dy)=>({...d,x:d.x+dx,y:d.y+dy}),rotate:d=>({a:((d.a||0)+Math.PI/2)%(Math.PI*2)}),title:d=>`${d.style==='shed'?'Shed':'Gable'} dormer`,
  svg:(p,lv,d,S,view,isSel)=>{const di=dormerInfo(p,d);if(!di)return html`<circle cx=${S(d.x,d.y)[0]} cy=${S(d.x,d.y)[1]} r="6" className="iss-warn"/>`;const pl=pts=>pts.map(q=>S(q.x,q.y).join(',')).join(' ');
    const fa=S(...Object.values(di.W(-di.w/2,0,0)).slice(0,2)),fb=S(...Object.values(di.W(di.w/2,0,0)).slice(0,2));
    return html`<g><polygon points=${pl(di.foot)} className=${'dormer'+(isSel?' dormer-sel':'')}/><line x1=${fa[0]} y1=${fa[1]} x2=${fb[0]} y2=${fb[1]} className="dormer-f"/>${di.st!=='shed'?(()=>{const A=S(...Object.values(di.W(0,-di.oh,0)).slice(0,2)),B=S(...Object.values(di.W(0,di.depth,0)).slice(0,2));return html`<line x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className="roofr"/>`;})():null}</g>`;},
  dl:(dl,p,lv,d,PT)=>{const di=dormerInfo(p,d);if(!di)return;dl.poly(di.foot.map(q=>PT(q.x,q.y)),{stroke:INK,w:0.4,dash:[0.06,0.04]});const a=di.W(-di.w/2,0,0),b=di.W(di.w/2,0,0);dl.line(...PT(a.x,a.y),...PT(b.x,b.y),0.9);},
  faces:(p,lv,d,F)=>{const di=dormerInfo(p,d);if(!di)return;for(const t of di.tris)F.push({kind:'roof',pts:t,n:null});const n={x:di.dir.x,y:di.dir.y};
    const fr=[di.W(-di.w/2,0,di.zf-2),di.W(di.w/2,0,di.zf-2),di.W(di.w/2,0,di.zp),di.W(-di.w/2,0,di.zp)];const wz=di.zf+6;const ww=di.win.w/2;
    F.push({kind:'wall',pts:fr.map(q=>[q.x,q.y,q.z]),holes:[[di.W(-ww,0,wz),di.W(ww,0,wz),di.W(ww,0,wz+di.win.h),di.W(-ww,0,wz+di.win.h)].map(q=>[q.x,q.y,q.z])],n,ext:true});
    F.push({kind:'window',pts:[di.W(-ww,-0.1,wz),di.W(ww,-0.1,wz),di.W(ww,-0.1,wz+di.win.h),di.W(-ww,-0.1,wz+di.win.h)].map(q=>[q.x,q.y,q.z]),n:null,o:{type:'window'}});
    for(const w of di.walls)F.push({kind:'gable',pts:w.map(q=>[q.x,q.y,q.z]),n:null});},
  add3D:(p,lv,d,ctx)=>{const di=dormerInfo(p,d);if(!di)return;const ext=p.walls.find(w=>w.level===lv.id&&w.kind==='exterior');const sc=d.color?hexNum(d.color):ext&&ext.color?hexNum(ext.color):SIDING_COLOR[(ext&&ext.siding)||'vinyl']||0xeeeae0;
    const wm=ctx.isSel(d)?ctx.mSel:M('dormerwall-'+sc,()=>new THREE.MeshStandardMaterial({color:sc,roughness:.9,side:THREE.DoubleSide}));
    const cov=rafterOf(di.r).cover||'asphalt';const rc=di.r.color?hexNum(di.r.color):ROOF_COLOR[cov]??0x4a4f57;const rm=M('roof-'+cov+'-'+rc,()=>new THREE.MeshStandardMaterial({color:rc,roughness:cov==='metal'?.5:.95,metalness:cov==='metal'?.3:0,side:THREE.DoubleSide,flatShading:true}));
    ctx.tris(di.tris,rm);ctx.tris(di.walls.map(w=>w.map(q=>[q.x,q.y,q.z])),wm);
    // front wall with the window opening
    const ang=Math.atan2(di.ux.y,di.ux.x);const c=di.W(0,0,0);const ww=di.win.w,wz=di.zf+6;const fw=di.w,t=5;const side=(fw-ww)/2;
    const cx=s=>({x:c.x+di.ux.x*s+di.dir.x*t/2,y:c.y+di.ux.y*s+di.dir.y*t/2});
    for(const sg of [-1,1]){const q=cx(sg*(ww/2+side/2));ctx.box(q.x,q.y,di.zf-2,side,t,di.wh+2,ang,wm);}
    {const q=cx(0);ctx.box(q.x,q.y,di.zf-2,ww,t,wz-di.zf+2,ang,wm);ctx.box(q.x,q.y,wz+di.win.h,ww,t,di.zp-(wz+di.win.h),ang,wm);
      const g=M('glass',()=>new THREE.MeshStandardMaterial({color:0x9cc3e0,transparent:true,opacity:.35,roughness:.1,metalness:.1,depthWrite:false}));ctx.box(q.x,q.y,wz,ww,0.6,di.win.h,ang,g,false);
      const fm=ctx.col(0xf7f7f4,{roughness:.6});ctx.box(q.x,q.y,wz-1.5,ww+3,t+1.5,1.5,ang,fm);ctx.box(q.x,q.y,wz+di.win.h,ww+3,t+1.5,1.5,ang,fm);ctx.box(q.x,q.y,wz+di.win.h/2-0.75,ww,t*0.4,1.5,ang,fm,false);}},
  panel:(d,{p,up})=>{const di=dormerInfo(p,d);return html`<div className="sec"><h3>Dormer</h3>
    ${di?null:html`<div className="msg err">The dormer is not on a sloped roof. Drag it onto a roof slope.</div>`}
    <${Field} label="Style" id="dm-s"><${Sel} id="dm-s" value=${d.style||'gable'} onChange=${v=>up({style:v,pitch:v==='shed'?3:8})} options=${[['gable','Gable'],['shed','Shed']]}/><//>
    <${Field} label="Width" id="dm-w"><${LenInput} id="dm-w" value=${d.w||72} onChange=${v=>v>12&&up({w:v})}/><//>
    <${Field} label="Front wall height" id="dm-h"><${LenInput} id="dm-h" value=${d.wh||42} onChange=${v=>v>12&&up({wh:v})}/><//>
    <${Field} label="Dormer roof pitch (x/12)" id="dm-p"><${NumInput} id="dm-p" value=${d.pitch||(d.style==='shed'?3:8)} min=${1} max=${18} onChange=${v=>up({pitch:v})}/><//>
    <${Field} label="Overhang" id="dm-o"><${LenInput} id="dm-o" value=${d.oh??8} onChange=${v=>up({oh:v})}/><//>
    <div className="row2"><${Field} label="Window width" id="dm-ww"><${LenInput} id="dm-ww" value=${d.winW} placeholder=${di?fmtLen(di.win.w):''} onChange=${v=>up({winW:v})}/><//><${Field} label="Window height" id="dm-wh"><${LenInput} id="dm-wh" value=${d.winH} placeholder=${di?fmtLen(di.win.h):''} onChange=${v=>up({winH:v})}/><//></div>
    <${ColorPick} id="dm-c" label="Siding color" value=${d.color} fallback="#eeeae0" onChange=${v=>up({color:v})}/>
    <p className="note">Press E to turn it to face another roof slope. ${di&&di.st==='shed'&&di.ph<=di.pd?'The dormer roof must be flatter than the main roof.':''}</p></div>`;},
  takeoff:(p,add,W)=>{for(const d of p.dormers||[]){const di=dormerInfo(p,d);if(!di)continue;add('Roof and ceiling framing',`Dormer framing package, ${fmtLen(di.w)} wide`,1,'EA','cheeks, rafters, valleys');add('Windows',`Dormer window ${fmtLen(di.win.w)} x ${fmtLen(di.win.h)}`,1,'EA');}},
});
regTool('dormer',{label:'Dormer',group:'roof',icon:I.dormer,mode:'click',snap:'free',
  hint:()=>html`<b>Dormer:</b> click on a roof slope where the dormer's front wall goes. It faces down the slope; press E to turn it.`,
  place:(ctx,[pt])=>{const p=ctx.p;const rs=p.roofs.filter(r=>r.level===ctx.lv.id);for(const r of rs){const b=roofBuild(r,roofTop(p,r));const z=roofHeightAt(b,pt.x,pt.y);if(!isFinite(z))continue;
      const g=6;const dzx=roofHeightAt(b,pt.x+g,pt.y)-roofHeightAt(b,pt.x-g,pt.y),dzy=roofHeightAt(b,pt.x,pt.y+g)-roofHeightAt(b,pt.x,pt.y-g);if(!isFinite(dzx)||!isFinite(dzy)||Math.hypot(dzx,dzy)<0.1)continue;
      const a=Math.atan2(-dzy,-dzx);const d={id:uid('dm'),level:ctx.lv.id,roof:r.id,x:pt.x,y:pt.y,a,style:'gable',w:72,wh:42,pitch:8,oh:8,status:'new'};return {p:{...p,dormers:[...(p.dormers||[]),d]},sel:{kind:'dormer',id:d.id},tool:'select'};}
    return null;}});
regTool('autoroof',{label:'Automatic roof',short:'Auto roof',group:'roof',icon:I.autoroof,mode:'click',snap:'free',
  hint:()=>html`<b>Automatic roof:</b> click anywhere to roof this level from its outside walls. L, T and U shapes get a roof for each wing with valleys where they meet. Existing roofs on this level are replaced. Style, pitch and overhang come from the roof settings in the Project panel.`,
  place:(ctx)=>{const p=ctx.p;const def=p.settings.roofDefault||{};const rs=autoRoof(p,ctx.lv.id,def);if(!rs.length)return null;
    return {p:{...p,roofs:[...p.roofs.filter(r=>r.level!==ctx.lv.id),...rs],dormers:(p.dormers||[]).filter(d=>p.roofs.some(r=>r.id===d.roof&&r.level!==ctx.lv.id))},sel:rs.length>1?{kind:'multi',items:rs.map(r=>({kind:'roof',id:r.id}))}:{kind:'roof',id:rs[0].id},tool:'select'};}});
addToolToGroup('roof','autoroof');addToolToGroup('roof','dormer');
