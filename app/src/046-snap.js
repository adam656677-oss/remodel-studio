/* ======================= object snaps ======================= */
// End, midpoint, intersection, center, perpendicular and nearest snaps on walls (centerlines and faces), CAD lines,
// rooms, decks and other outlines. Modes are kept in project settings so they stay as you set them.
const OSNAP_LIST=[['end','Endpoint'],['mid','Midpoint'],['int','Intersection'],['cen','Center'],['perp','Perpendicular'],['near','Nearest'],['grid','Grid']];
const osnapModes=p=>({end:true,mid:true,int:true,cen:true,perp:true,near:false,grid:true,...(p.settings?.osnap||{})});
const _snapCache=new WeakMap();
function snapGeom(p,lvId,faces){let m=_snapCache.get(p);if(!m){m={};_snapCache.set(p,m);}const k=lvId+(faces?'f':'');if(m[k])return m[k];
  const segs=[],pts=[],cens=[];const seg=(a,b,kind)=>{if(dist(a,b)>0.2)segs.push({a,b,kind});};
  const walls=p.walls.filter(w=>w.level===lvId);const J=wallJoins(walls);
  for(const w of walls){const a={x:w.x1,y:w.y1},b={x:w.x2,y:w.y2};seg(a,b,'wall');pts.push(a,b);
    if(faces){const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2,ja=J[w.id]?.a||0,jb=J[w.id]?.b||0;const A={x:w.x1-d.x*ja,y:w.y1-d.y*ja},B={x:w.x2+d.x*jb,y:w.y2+d.y*jb};
      for(const s of [1,-1]){const fa={x:A.x+n.x*t*s,y:A.y+n.y*t*s},fb={x:B.x+n.x*t*s,y:B.y+n.y*t*s};seg(fa,fb,'face');pts.push(fa,fb);}}}
  for(const o of p.openings){const c=openingCenter(p,o);if(!c||c.w.level!==lvId)continue;const d=wdir(c.w);for(const s of [-1,1])pts.push({x:c.x+d.x*s*o.width/2,y:c.y+d.y*s*o.width/2});}
  for(const r of p.rooms.filter(r=>r.level===lvId))for(let i=0;i<r.pts.length;i++){const a={x:r.pts[i][0],y:r.pts[i][1]},b={x:r.pts[(i+1)%r.pts.length][0],y:r.pts[(i+1)%r.pts.length][1]};seg(a,b,'room');pts.push(a);}
  for(const c of (p.cad||[]).filter(c=>c.level===lvId)){const g=cadGeom(c);for(let i=0;i+1<g.pts.length;i++)seg(g.pts[i],g.pts[i+1],'cad');if(g.closed&&g.pts.length>2)seg(g.pts[g.pts.length-1],g.pts[0],'cad');for(const q of g.ends)pts.push(q);if(g.center)cens.push(g.center);}
  for(const d of (p.decks||[]).filter(d=>d.level===lvId))for(let i=0;i<d.pts.length;i++){const a={x:d.pts[i][0],y:d.pts[i][1]},b={x:d.pts[(i+1)%d.pts.length][0],y:d.pts[(i+1)%d.pts.length][1]};seg(a,b,'deck');pts.push(a);}
  for(const f of (p.fixtures||[]).filter(f=>f.level===lvId)){const c=fxCorners(f);for(let i=0;i<4;i++){seg(c[i],c[(i+1)%4],'fx');pts.push(c[i]);}}
  for(const c of (p.columns||[]).filter(c=>c.level===lvId))cens.push({x:c.x,y:c.y});
  for(const s of (p.site||[]).filter(s=>s.level===lvId)){if(s.pts)for(let i=0;i+1<s.pts.length;i++)seg({x:s.pts[i][0],y:s.pts[i][1]},{x:s.pts[i+1][0],y:s.pts[i+1][1]},'site');if(s.x!=null)cens.push({x:s.x,y:s.y});}
  return (m[k]={segs,pts,cens});}
function segInter(a,b,c,d){const r={x:b.x-a.x,y:b.y-a.y},s={x:d.x-c.x,y:d.y-c.y};const den=r.x*s.y-r.y*s.x;if(Math.abs(den)<1e-9)return null;const t=((c.x-a.x)*s.y-(c.y-a.y)*s.x)/den,u=((c.x-a.x)*r.y-(c.y-a.y)*r.x)/den;
  if(t<-1e-6||t>1+1e-6||u<-1e-6||u>1+1e-6)return null;return {x:a.x+r.x*t,y:a.y+r.y*t,t,u};}
function osnap(raw,tol,G,modes,anchor){let best=null;const take=(q,kind,rank)=>{const d=dist(q,raw);if(d>tol)return;const sc=d+rank*tol*0.18;if(!best||sc<best.sc)best={x:q.x,y:q.y,kind,d,sc};};
  if(modes.end)for(const q of G.pts)take(q,'end',0);
  if(modes.cen)for(const q of G.cens)take(q,'cen',0.5);
  const near=G.segs.filter(s=>projSeg(raw,s.a,s.b).d<tol*1.5);
  if(modes.int)for(let i=0;i<near.length;i++)for(let j=i+1;j<near.length;j++){const q=segInter(near[i].a,near[i].b,near[j].a,near[j].b);if(q)take(q,'int',0.3);}
  if(modes.mid)for(const s of near)take({x:(s.a.x+s.b.x)/2,y:(s.a.y+s.b.y)/2},'mid',0.8);
  if(modes.perp&&anchor)for(const s of near){const pr=projSeg(anchor,s.a,s.b);if(pr.tRaw>=-0.001&&pr.tRaw<=1.001)take({x:pr.x,y:pr.y},'perp',1.2);}
  if(modes.near&&!best)for(const s of near){const pr=projSeg(raw,s.a,s.b);take({x:pr.x,y:pr.y},'near',2.5);}
  return best;}
function snapGlyph(c,S,key='cs'){const [x,y]=S(c.x,c.y);const k=c.kind;
  if(k==='end')return html`<rect key=${key} x=${x-6} y=${y-6} width="12" height="12" className="snap-end"/>`;
  if(k==='mid')return html`<polygon key=${key} points=${`${x},${y-7} ${x+7},${y+5} ${x-7},${y+5}`} className="snap-end"/>`;
  if(k==='int')return html`<g key=${key}><line x1=${x-6} y1=${y-6} x2=${x+6} y2=${y+6} className="snap-x"/><line x1=${x+6} y1=${y-6} x2=${x-6} y2=${y+6} className="snap-x"/></g>`;
  if(k==='cen')return html`<circle key=${key} cx=${x} cy=${y} r="6.5" className="snap-end"/>`;
  if(k==='perp')return html`<path key=${key} d=${`M${x-7},${y+6}H${x+7}M${x},${y+6}V${y-7}`} className="snap-x"/>`;
  if(k==='near')return html`<path key=${key} d=${`M${x-6},${y-6}H${x+6}L${x-6},${y+6}H${x+6}Z`} className="snap-end"/>`;
  return html`<g key=${key}><line x1=${x-7} y1=${y} x2=${x+7} y2=${y} className="snap-grid"/><line x1=${x} y1=${y-7} x2=${x} y2=${y+7} className="snap-grid"/></g>`;}
