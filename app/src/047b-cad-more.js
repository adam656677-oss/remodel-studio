/* ======================= more drafting: ellipse, polygon, revision cloud, construction lines, fillet, chamfer, scale,
   break, join, explode, polar and grid arrays, match properties, area takeoff, angular and radius dimensions ======================= */
const setting=(p,k,d)=>(p.settings&&p.settings[k]!=null)?p.settings[k]:d;
// construction lines run across the whole drawing and never print
{const _g=cadGeom;cadGeom=function(c){if(c.xline&&c.pts&&c.pts.length===2){const [a,b]=c.pts;const L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;const d=[(b[0]-a[0])/L,(b[1]-a[1])/L];const R=200000;
  const A={x:a[0]-d[0]*R,y:a[1]-d[1]*R},B={x:a[0]+d[0]*R,y:a[1]+d[1]*R};return {pts:[A,B],closed:false,ends:[{x:a[0],y:a[1]},{x:b[0],y:b[1]}]};}return _g(c);};}
{const D=OBJ.cad;const _dl=D.dl;D.dl=(dl,p,lv,c,PT,k)=>{if(c.xline)return;return _dl(dl,p,lv,c,PT,k);};const _t=D.title;D.title=c=>c.xline?'Construction line':c.kind?({ellipse:'Ellipse',polygon:'Polygon',cloud:'Revision cloud',area:'Area outline'})[c.kind]||_t(c):_t(c);
  const _svg=D.svg;D.svg=(p,lv,c,S,view,isSel)=>{const out=_svg(p,lv,c,S,view,isSel);if(!out||c.kind!=='area'||!c.pts||c.pts.length<3)return out;const [x,y]=polyLabelPt(c.pts);const [sx,sy]=S(x,y);const A=polyArea(c.pts)/144;
    const per=c.pts.reduce((s,q,i)=>s+Math.hypot(c.pts[(i+1)%c.pts.length][0]-q[0],c.pts[(i+1)%c.pts.length][1]-q[1]),0);
    return html`<g>${out}<text x=${sx} y=${sy} textAnchor="middle" className="area-tag halo">${A.toFixed(1)} sq ft</text><text x=${sx} y=${sy+13} textAnchor="middle" className="area-tag sm halo">perimeter ${fmtLen(per)}</text></g>`;};}
I.ellipse=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="12" rx="9" ry="5.5"/></svg>`;
I.polygon=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 6-3 10H7L4 9z"/></svg>`;
I.cloud=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 15a2.5 2.5 0 0 1 0-5 3 3 0 0 1 5-2 3 3 0 0 1 5 0 3 3 0 0 1 4 3 2.5 2.5 0 0 1-1 5 3 3 0 0 1-5 1 3 3 0 0 1-5 0 2.5 2.5 0 0 1-3-2z"/></svg>`;
I.xline=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2"><path d="M2 20L22 4"/><circle cx="9" cy="14.5" r="1.4" stroke-dasharray="none"/></svg>`;
I.fillet=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V12a8 8 0 0 1 8-8h8"/></svg>`;
I.chamfer=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10l6-6h10"/></svg>`;
I.scale=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="10" height="10"/><path d="M13 11V3h8v8h-8M16 8l5-5"/></svg>`;
I.brk=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12h8M14 12h8"/><path d="M10 8l4 8"/></svg>`;
I.join=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18l6-8h6l6-6"/><circle cx="9" cy="10" r="1.6"/><circle cx="15" cy="10" r="1.6"/></svg>`;
I.explode=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>`;
I.parray=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="4" r="2"/><circle cx="19" cy="9" r="2"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/><circle cx="5" cy="9" r="2"/></svg>`;
I.garray=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="5" height="5"/><rect x="10" y="3" width="5" height="5"/><rect x="17" y="3" width="4" height="5"/><rect x="3" y="10" width="5" height="5"/><rect x="10" y="10" width="5" height="5"/><rect x="3" y="17" width="5" height="4"/></svg>`;
I.match=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20l8-8"/><path d="M12 12l3-8 5 5-8 3z"/></svg>`;
I.area=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 18L6 6l12 2 2 10z"/><text x="8" y="15" font-size="7" stroke="none" fill="currentColor">ft²</text></svg>`;
I.dimang=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20h16M4 20L16 6"/><path d="M12 20a8 8 0 0 0-2.5-5.8"/></svg>`;
I.dimrad=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="14" r="7"/><path d="M10 14l8-8"/><path d="M18 6h4"/></svg>`;
const ellipsePts=(c,rx,ry,n=48)=>{const o=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;o.push([c.x+rx*Math.cos(a),c.y+ry*Math.sin(a)]);}return o;};
regTool('ellipse',{label:'Ellipse',group:'draft',icon:I.ellipse,mode:'two',ortho:false,hint:n=>n?'Click a corner of the box the ellipse fits in.':html`<b>Ellipse:</b> click the center.`,
  place:(ctx,[a,b])=>{const rx=Math.abs(b.x-a.x),ry=Math.abs(b.y-a.y);if(rx<0.5||ry<0.5)return null;return cadPlace(ctx,cadNew(ctx,'pline',{kind:'ellipse',closed:true,pts:ellipsePts(a,rx,ry)}));}});
regTool('polygon',{label:'Polygon (equal sides)',group:'draft',icon:I.polygon,mode:'two',ortho:false,hint:(n,ctx)=>n?`Click a corner (${setting(ctx.p,'polyN',6)} sides; type POL 8 to change).`:html`<b>Polygon:</b> click the center.`,
  place:(ctx,[a,b])=>{const n=Math.max(3,setting(ctx.p,'polyN',6));const r=dist(a,b);if(r<0.5)return null;const a0=Math.atan2(b.y-a.y,b.x-a.x);const pts=[];for(let i=0;i<n;i++){const t=a0+i/n*Math.PI*2;pts.push([a.x+r*Math.cos(t),a.y+r*Math.sin(t)]);}return cadPlace(ctx,cadNew(ctx,'pline',{kind:'polygon',closed:true,pts}));}});
// revision cloud: scallops along a closed outline
function cloudPts(P,arc=10){const out=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];const L=dist(a,b);const n=Math.max(1,Math.round(L/arc));
    for(let k=0;k<n;k++){const s={x:a.x+(b.x-a.x)*k/n,y:a.y+(b.y-a.y)*k/n},e={x:a.x+(b.x-a.x)*(k+1)/n,y:a.y+(b.y-a.y)*(k+1)/n};const m={x:(s.x+e.x)/2,y:(s.y+e.y)/2};const nx=-(e.y-s.y),ny=e.x-s.x;const l=Math.hypot(nx,ny)||1;
      for(let j=0;j<6;j++){const t=j/6;const ang=Math.PI*t;const r=dist(s,e)/2;out.push([m.x-(e.x-s.x)/2*Math.cos(ang)-nx/l*r*Math.sin(ang)*0.9,m.y-(e.y-s.y)/2*Math.cos(ang)-ny/l*r*Math.sin(ang)*0.9]);}}}return out;}
regTool('revcloud',{label:'Revision cloud',group:'draft',icon:I.cloud,mode:'chain',min:3,closable:true,hint:n=>n?'Click the next corner; click the first point to close.':html`<b>Revision cloud:</b> click around the changed area. Tag it with the revision number in a note.`,
  place:(ctx,pts)=>{const closed=dist(pts[0],pts[pts.length-1])<0.6;const P=closed?pts.slice(0,-1):pts;if(P.length<3)return null;const s=Math.max(6,Math.min(24,Math.sqrt(Math.abs(polyArea(P.map(q=>[q.x,q.y]))))/6));
    return cadPlace(ctx,cadNew(ctx,'pline',{kind:'cloud',closed:true,weight:0.8,layer:'L-TEXT',pts:cloudPts(P,s)}));}});
regTool('xline',{label:'Construction line',group:'draft',icon:I.xline,mode:'two',hint:n=>n?'Click a second point for the direction.':html`<b>Construction line:</b> an endless guide line that never prints. Click a point it passes through.`,
  place:(ctx,[a,b])=>dist(a,b)<0.5?null:{...cadPlace(ctx,cadNew(ctx,'line',{xline:true,dash:'center',weight:0.25,color:'#9a6fd0',pts:[[a.x,a.y],[b.x,b.y]]})),keep:true}});
regTool('measarea',{label:'Area takeoff',group:'measure',icon:I.area,mode:'chain',min:3,closable:true,hint:n=>n?'Click the next corner; click the first point to close.':html`<b>Area takeoff:</b> click around any area (flooring, paving, roof) to tag its square footage and perimeter.`,
  place:(ctx,pts)=>{const closed=dist(pts[0],pts[pts.length-1])<0.6;const P=closed?pts.slice(0,-1):pts;if(P.length<3)return null;return cadPlace(ctx,cadNew(ctx,'pline',{kind:'area',closed:true,dash:'dash',weight:0.5,color:'#d97a1c',layer:'L-TEXT',pts:P.map(q=>[q.x,q.y])}));}});
// pick the CAD line segment nearest a point: {c, si, A, B, d}
function nearCadSeg(ctx,raw,skip){const tol=12/ctx.view.s;let best=null;for(const c of (ctx.p.cad||[]).filter(c=>c.level===ctx.lv.id&&c.id!==skip&&(c.shape==='line'||c.shape==='pline'||c.shape==='rect')&&!c.xline)){
    const P=c.pts;const n=P.length+((c.shape==='rect'||c.closed)?1:0);for(let i=0;i+1<n;i++){const A={x:P[i][0],y:P[i][1]},B={x:P[(i+1)%P.length][0],y:P[(i+1)%P.length][1]};const d=projSeg(raw,A,B).d;if(d<tol&&(!best||d<best.d))best={c,si:i,A,B,d};}}return best;}
function lineInter(A,B,C,D){const r={x:B.x-A.x,y:B.y-A.y},s={x:D.x-C.x,y:D.y-C.y};const den=r.x*s.y-r.y*s.x;if(Math.abs(den)<1e-9)return null;const t=((C.x-A.x)*s.y-(C.y-A.y)*s.x)/den;return {x:A.x+r.x*t,y:A.y+r.y*t};}
// fillet or chamfer two drafting lines (or two walls, radius 0) where they meet
function cornerOp(ctx,a,b,mode){const p=ctx.p;const L1=nearCadSeg(ctx,a),L2=L1&&nearCadSeg(ctx,b,L1.c.id);
  if(!L1||!L2){// walls: square up the corner
    const W=ctx.walls.map(w=>({w,d:projSeg(a,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2}).d})).sort((x,y)=>x.d-y.d)[0];const W2=ctx.walls.filter(w=>!W||w.id!==W.w.id).map(w=>({w,d:projSeg(b,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2}).d})).sort((x,y)=>x.d-y.d)[0];
    if(!W||!W2||W.d>W.w.thick+12/ctx.view.s||W2.d>W2.w.thick+12/ctx.view.s)return null;const w1=W.w,w2=W2.w;const X=lineInter({x:w1.x1,y:w1.y1},{x:w1.x2,y:w1.y2},{x:w2.x1,y:w2.y1},{x:w2.x2,y:w2.y2});if(!X)return null;
    const fix=(w,click)=>{const d1=Math.hypot(w.x1-X.x,w.y1-X.y),d2=Math.hypot(w.x2-X.x,w.y2-X.y);const keep1=Math.hypot(w.x1-click.x,w.y1-click.y)>Math.hypot(w.x2-click.x,w.y2-click.y);return keep1?{x2:X.x,y2:X.y}:{x1:X.x,y1:X.y};};
    let q=updObj(p,'wall',w1.id,fix(w1,a));q=updObj(q,'wall',w2.id,fix(w2,b));return {p:q,sel:null,keep:true};}
  const X=lineInter(L1.A,L1.B,L2.A,L2.B);if(!X)return null;const R=mode==='fillet'?setting(p,'filletR',0):setting(p,'chamferD',6);
  // keep the side of each line that was clicked
  const away=(L,click)=>{const da=dist(L.A,X),db=dist(L.B,X);const pa=projSeg(click,L.A,L.B).t;const tX=projSeg(X,L.A,L.B).t;const keepA=pa<tX;const far=keepA?L.A:L.B;const v={x:far.x-X.x,y:far.y-X.y};const l=Math.hypot(v.x,v.y)||1;return {far,u:{x:v.x/l,y:v.y/l},keepA};};
  const s1=away(L1,a),s2=away(L2,b);let T1,T2,extra=null;
  if(mode==='fillet'&&R>0){const cosA=s1.u.x*s2.u.x+s1.u.y*s2.u.y;const ang=Math.acos(Math.max(-1,Math.min(1,cosA)));if(ang<1e-3||Math.abs(ang-Math.PI)<1e-3)return null;const t=R/Math.tan(ang/2);
    T1={x:X.x+s1.u.x*t,y:X.y+s1.u.y*t};T2={x:X.x+s2.u.x*t,y:X.y+s2.u.y*t};const bis={x:s1.u.x+s2.u.x,y:s1.u.y+s2.u.y};const bl=Math.hypot(bis.x,bis.y)||1;const cd=R/Math.sin(ang/2);const C={x:X.x+bis.x/bl*cd,y:X.y+bis.y/bl*cd};
    const mid={x:C.x-bis.x/bl*R,y:C.y-bis.y/bl*R};extra=cadNew(ctx,'arc',{pts:[[T1.x,T1.y],[mid.x,mid.y],[T2.x,T2.y]],layer:L1.c.layer,weight:L1.c.weight,dash:L1.c.dash,color:L1.c.color});}
  else if(mode==='chamfer'){T1={x:X.x+s1.u.x*R,y:X.y+s1.u.y*R};T2={x:X.x+s2.u.x*R,y:X.y+s2.u.y*R};extra=cadNew(ctx,'line',{pts:[[T1.x,T1.y],[T2.x,T2.y]],layer:L1.c.layer,weight:L1.c.weight,dash:L1.c.dash,color:L1.c.color});}
  else{T1=X;T2=X;}
  const setEnd=(L,s,T)=>{const c=L.c;const pts=c.pts.map(q=>[...q]);if(c.shape==='line'){pts[s.keepA?1:0]=[T.x,T.y];}else{const i=s.keepA?L.si+1:L.si;pts[i%pts.length]=[T.x,T.y];}return pts;};
  let q=updObj(p,'cad',L1.c.id,{pts:setEnd(L1,s1,T1)});q=updObj(q,'cad',L2.c.id,{pts:setEnd(L2,s2,T2)});if(extra)q={...q,cad:[...q.cad,extra]};return {p:q,sel:null,keep:true};}
regTool('op-fillet',{label:'Fillet (round or square a corner)',group:'edit',icon:I.fillet,mode:'two',snap:'free',ortho:false,
  hint:(n,ctx)=>n?'Click the second line.':html`<b>Fillet:</b> click two lines (or two walls) to join them at a corner, rounded at ${fmtLen(setting(ctx.p,'filletR',0))} radius (type F 6 to set; 0 makes a square corner).`,
  place:(ctx,[a,b])=>cornerOp(ctx,a,b,'fillet')});
regTool('op-chamfer',{label:'Chamfer (cut a corner)',group:'edit',icon:I.chamfer,mode:'two',snap:'free',ortho:false,
  hint:(n,ctx)=>n?'Click the second line.':html`<b>Chamfer:</b> click two lines to cut the corner ${fmtLen(setting(ctx.p,'chamferD',6))} back from where they meet (type CHA 12 to set).`,
  place:(ctx,[a,b])=>cornerOp(ctx,a,b,'chamfer')});
const T_scale=(c,f)=>({pt:q=>({x:c.x+(q.x-c.x)*f,y:c.y+(q.y-c.y)*f}),vec:v=>v,scale:f});
regTool('op-scale',{label:'Scale',group:'edit',icon:I.scale,mode:'click',
  hint:(n,ctx)=>needSel(ctx)?opHint('Scale')(n,ctx):html`<b>Scale:</b> click the base point to scale the selection ${setting(ctx.p,'scaleF',2)} times (type SC 0.5 to set the factor).`,
  place:(ctx,[a])=>{if(needSel(ctx))return null;return xformItems(ctx.p,selItems(ctx.sel),T_scale(a,setting(ctx.p,'scaleF',2)));}});
regTool('op-break',{label:'Break at a point',group:'edit',icon:I.brk,mode:'click',snap:'free',
  hint:()=>html`<b>Break:</b> click a drafting line where it should be split into two pieces.`,
  place:(ctx,[pt],info)=>{const raw=(info&&info.raw)||pt;const L=nearCadSeg(ctx,raw);if(!L||L.c.shape==='rect'||L.c.closed)return null;const pr=projSeg(raw,L.A,L.B);const X=[L.A.x+(L.B.x-L.A.x)*pr.t,L.A.y+(L.B.y-L.A.y)*pr.t];
    const c=L.c;const a=[...c.pts.slice(0,L.si+1),X],b=[X,...c.pts.slice(L.si+1)];const mk=pts=>({...c,id:uid('cd'),pts,shape:pts.length===2?'line':'pline'});
    return {p:{...ctx.p,cad:[...ctx.p.cad.filter(x=>x.id!==c.id),mk(a),mk(b)]},sel:null,keep:true};}});
regTool('op-join',{label:'Join lines',group:'edit',icon:I.join,mode:'click',
  hint:(n,ctx)=>needSel(ctx)?opHint('Join')(n,ctx):html`<b>Join:</b> click anywhere to join the selected drafting lines that touch end to end into one polyline.`,
  place:(ctx)=>{const ids=new Set(selItems(ctx.sel).filter(i=>i.kind==='cad').map(i=>i.id));const segs=(ctx.p.cad||[]).filter(c=>ids.has(c.id)&&(c.shape==='line'||c.shape==='pline')&&!c.closed);if(segs.length<2)return null;
    let chain=[...segs[0].pts];const rest=segs.slice(1).map(c=>[...c.pts]);const same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<0.25;let grew=true;
    while(grew&&rest.length){grew=false;for(let i=0;i<rest.length;i++){const s=rest[i];const h=chain[0],t=chain[chain.length-1];
      if(same(t,s[0])){chain=[...chain,...s.slice(1)];}else if(same(t,s[s.length-1])){chain=[...chain,...s.slice(0,-1).reverse()];}else if(same(h,s[s.length-1])){chain=[...s.slice(0,-1),...chain];}else if(same(h,s[0])){chain=[...s.slice(1).reverse(),...chain];}else continue;rest.splice(i,1);grew=true;break;}}
    const closed=same(chain[0],chain[chain.length-1]);if(closed)chain=chain.slice(0,-1);const used=segs.length-rest.length;if(used<2)return null;const keep=new Set(rest.map(()=>null));
    const usedIds=new Set(segs.filter(s=>!rest.some(r=>JSON.stringify(r)===JSON.stringify(s.pts))).map(s=>s.id));const n={...segs[0],id:uid('cd'),shape:'pline',pts:chain,closed};
    return {p:{...ctx.p,cad:[...ctx.p.cad.filter(c=>!usedIds.has(c.id)),n]},sel:{kind:'cad',id:n.id},tool:'select'};}});
regTool('op-explode',{label:'Explode into lines',group:'edit',icon:I.explode,mode:'click',
  hint:(n,ctx)=>needSel(ctx)?opHint('Explode')(n,ctx):html`<b>Explode:</b> click to break the selected polylines and rectangles into separate lines.`,
  place:(ctx)=>{const ids=new Set(selItems(ctx.sel).filter(i=>i.kind==='cad').map(i=>i.id));const src=(ctx.p.cad||[]).filter(c=>ids.has(c.id)&&(c.shape==='pline'||c.shape==='rect'));if(!src.length)return null;const made=[];
    for(const c of src){const P=c.pts;const closed=c.shape==='rect'||c.closed;for(let i=0;i+1<P.length+(closed?1:0);i++)made.push({...c,id:uid('cd'),shape:'line',kind:undefined,closed:false,hatch:undefined,pts:[P[i],P[(i+1)%P.length]]});}
    return {p:{...ctx.p,cad:[...ctx.p.cad.filter(c=>!src.includes(c)),...made]},sel:null,tool:'select'};}});
regTool('op-parray',{label:'Polar array (around a center)',group:'edit',icon:I.parray,mode:'click',
  hint:(n,ctx)=>needSel(ctx)?opHint('Polar array')(n,ctx):html`<b>Polar array:</b> click the center. Makes ${setting(ctx.p,'parrN',6)} copies around a full circle (type APO 8 to change the count).`,
  place:(ctx,[c])=>{if(needSel(ctx))return null;const n=Math.max(2,setting(ctx.p,'parrN',6));let q=ctx.p;for(let i=1;i<n;i++)q=xformItems(q,selItems(ctx.sel),T_rot(c,360*i/n),true).p;return {p:q,sel:ctx.sel,tool:'select'};}});
regTool('op-garray',{label:'Grid array (rows and columns)',group:'edit',icon:I.garray,mode:'two',
  hint:(n,ctx)=>{if(needSel(ctx))return opHint('Grid array')(n,ctx);const [r,c]=setting(ctx.p,'garr',[3,3]);return n?`Click the spacing to the next copy diagonally (${r} rows x ${c} columns; type AG 4x5 to change).`:html`<b>Grid array:</b> click a base point on the selection.`;},
  place:(ctx,[a,b])=>{if(needSel(ctx))return null;const [R,C]=setting(ctx.p,'garr',[3,3]);let q=ctx.p;for(let i=0;i<R;i++)for(let j=0;j<C;j++){if(!i&&!j)continue;q=xformItems(q,selItems(ctx.sel),T_move((b.x-a.x)*j,(b.y-a.y)*i),true).p;}return {p:q,sel:ctx.sel,tool:'select'};}});
// match properties: first click picks the source, the next clicks paint its layer, line type, weight, color and fill
let MATCH_SRC=null;
regTool('op-match',{label:'Match properties',group:'edit',icon:I.match,mode:'click',snap:'free',
  hint:()=>MATCH_SRC?html`<b>Match properties:</b> click drafting items to give them the same layer, line type, weight, color and fill. Esc when done.`:html`<b>Match properties:</b> click the drafting item to copy from.`,
  place:(ctx,[pt],info)=>{const raw=(info&&info.raw)||pt;const tol=12/ctx.view.s;const hit=(ctx.p.cad||[]).filter(c=>c.level===ctx.lv.id).find(c=>{const g=cadGeom(c);return nearPolyline(raw,g.pts,tol,g.closed);});if(!hit)return null;
    if(!MATCH_SRC||MATCH_SRC.id===hit.id){MATCH_SRC=hit;return {p:ctx.p,sel:{kind:'cad',id:hit.id},keep:true};}
    const {layer,dash,weight,color,hatch,hatchScale}=MATCH_SRC;return {p:updObj(ctx.p,'cad',hit.id,{layer,dash,weight,color,...(hit.closed||hit.shape==='rect'||hit.shape==='circle'?{hatch,hatchScale}:{})}),sel:{kind:'cad',id:hit.id},keep:true};}});
/* ---- angular dimension ---- */
regObj('adim',{coll:'adims',label:'Angle dimension',plural:'angle dimensions',z:8,layer:'over',noBounds:true,
  pts:(p,o)=>[o.v,o.a,o.b],hit:(p,o,raw,tol)=>Math.abs(dist(raw,o.v)-(o.r||36))<tol*1.5,move:(o,dx,dy)=>({...o,v:{x:o.v.x+dx,y:o.v.y+dy},a:{x:o.a.x+dx,y:o.a.y+dy},b:{x:o.b.x+dx,y:o.b.y+dy}}),
  xform:(o,T)=>({...o,v:T.pt(o.v),a:T.pt(o.a),b:T.pt(o.b)}),title:o=>`Angle ${adimDeg(o).toFixed(1)}°`,
  svg:(p,lv,o,S,view,isSel)=>{if(!showOf(p).dims)return null;const g=adimGeo(o);const pts=g.arc.map(q=>S(q.x,q.y).join(',')).join(' ');const [tx,ty]=S(g.t.x,g.t.y);const [vx,vy]=S(o.v.x,o.v.y);
    return html`<g className=${'adim'+(isSel?' adim-sel':'')}><line x1=${vx} y1=${vy} x2=${S(g.ea.x,g.ea.y)[0]} y2=${S(g.ea.x,g.ea.y)[1]} className="adim-ext"/><line x1=${vx} y1=${vy} x2=${S(g.eb.x,g.eb.y)[0]} y2=${S(g.eb.x,g.eb.y)[1]} className="adim-ext"/><polyline points=${pts} fill="none"/><text x=${tx} y=${ty} textAnchor="middle" className="halo">${adimDeg(o).toFixed(1)}°</text></g>`;},
  dl:(dl,p,lv,o,PT,k)=>{const g=adimGeo(o);dl.poly(g.arc.map(q=>PT(q.x,q.y)),{stroke:INK,w:0.35,close:false});dl.line(...PT(o.v.x,o.v.y),...PT(g.ea.x,g.ea.y),0.25);dl.line(...PT(o.v.x,o.v.y),...PT(g.eb.x,g.eb.y),0.25);const t=PT(g.t.x,g.t.y);dl.text(t[0],t[1],adimDeg(o).toFixed(1)+'°',{size:6*k,anchor:'middle'});},
  panel:(o,{up})=>html`<div className="sec"><h3>Angle dimension</h3><div className="stat"><span>Angle</span><span className="mono">${adimDeg(o).toFixed(2)}°</span></div><${Field} label="Arc radius" id="ad-r"><${LenInput} id="ad-r" value=${o.r||36} onChange=${v=>v>0&&up({r:v})}/><//></div>`});
function adimDeg(o){const a1=Math.atan2(o.a.y-o.v.y,o.a.x-o.v.x),a2=Math.atan2(o.b.y-o.v.y,o.b.x-o.v.x);let d=Math.abs(a2-a1)*180/Math.PI;if(d>180)d=360-d;return d;}
function adimGeo(o){const r=o.r||36;let a1=Math.atan2(o.a.y-o.v.y,o.a.x-o.v.x),a2=Math.atan2(o.b.y-o.v.y,o.b.x-o.v.x);let da=a2-a1;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;const arc=[];for(let i=0;i<=24;i++){const t=a1+da*i/24;arc.push({x:o.v.x+r*Math.cos(t),y:o.v.y+r*Math.sin(t)});}
  const tm=a1+da/2;return {arc,t:{x:o.v.x+(r+10)*Math.cos(tm),y:o.v.y+(r+10)*Math.sin(tm)},ea:{x:o.v.x+(r+6)*Math.cos(a1),y:o.v.y+(r+6)*Math.sin(a1)},eb:{x:o.v.x+(r+6)*Math.cos(a1+da),y:o.v.y+(r+6)*Math.sin(a1+da)}};}
regTool('dimang',{label:'Angle dimension',group:'draft',icon:I.dimang,mode:'chain',min:3,max:3,ortho:false,
  hint:n=>n===0?html`<b>Angle dimension:</b> click the corner (vertex).`:n===1?'Click a point on the first leg.':'Click a point on the second leg.',
  place:(ctx,[v,a,b])=>{const o={id:uid('ad'),level:ctx.lv.id,v,a,b,r:Math.max(18,Math.min(dist(v,a),dist(v,b))*0.5),status:'new'};return {p:{...ctx.p,adims:[...(ctx.p.adims||[]),o]},sel:{kind:'adim',id:o.id}};}});
// radius or diameter of a circle or arc: a note with an arrow
regTool('dimrad',{label:'Radius dimension',group:'draft',icon:I.dimrad,mode:'two',snap:'free',ortho:false,
  hint:n=>n?'Click where the label goes.':html`<b>Radius dimension:</b> click a circle or arc.`,
  place:(ctx,[a,b])=>{const tol=14/ctx.view.s;let best=null;for(const c of (ctx.p.cad||[]).filter(c=>c.level===ctx.lv.id)){const g=cadGeom(c);if(!g.center)continue;const r=c.shape==='circle'?c.r:dist(g.center,g.ends[0]);const d=Math.abs(dist(a,g.center)-r);if(d<tol&&(!best||d<best.d))best={c,g,r,d};}
    if(!best)return null;const n={id:uid('an'),level:ctx.lv.id,x:b.x,y:b.y,text:`R ${fmtLen(best.r)}  (DIA ${fmtLen(best.r*2)})`,leader:{x:a.x,y:a.y},size:'normal',status:'new'};return {p:{...ctx.p,annos:[...(ctx.p.annos||[]),n]},sel:{kind:'anno',id:n.id},tool:'select'};}});
for(const id of ['ellipse','polygon','revcloud','xline','dimang','dimrad'])addToolToGroup('draft',id);
for(const id of ['op-fillet','op-chamfer','op-scale','op-break','op-join','op-explode','op-parray','op-garray','op-match'])addToolToGroup('edit',id);
addToolToGroup('measure','measarea');
Object.assign(CMD_TOOLS,{el:'ellipse',ellipse:'ellipse',pol:'polygon',polygon:'polygon',revcloud:'revcloud',rc:'revcloud',xl:'xline',xline:'xline',f:'op-fillet',fillet:'op-fillet',cha:'op-chamfer',chamfer:'op-chamfer',
  sc:'op-scale',scale:'op-scale',br:'op-break',break:'op-break',j:'op-join',join:'op-join',x:'op-explode',explode:'op-explode',apo:'op-parray',ag:'op-garray',ma:'op-match',matchprop:'op-match',aa:'measarea',area:'measarea',dan:'dimang',dimang:'dimang',dra:'dimrad',dimrad:'dimrad'});
// typed values: F 6 (fillet radius), CHA 12, SC 0.5, POL 8, APO 8, AG 4x5
{const _pc=parseCommand;parseCommand=function(text){const t=text.trim();const [w0,...rest]=t.split(/\s+/);const w=(w0||'').toLowerCase();const arg=rest.join(' ');
  if(arg){if(w==='f'||w==='fillet')return {type:'setting',key:'filletR',val:parseLen(arg,'in'),tool:'op-fillet'};if(w==='cha'||w==='chamfer')return {type:'setting',key:'chamferD',val:parseLen(arg,'in'),tool:'op-chamfer'};
    if(w==='sc'||w==='scale')return {type:'setting',key:'scaleF',val:parseFloat(arg),tool:'op-scale'};if(w==='pol'||w==='polygon')return {type:'setting',key:'polyN',val:Math.max(3,parseInt(arg)||6),tool:'polygon'};
    if(w==='apo')return {type:'setting',key:'parrN',val:Math.max(2,parseInt(arg)||6),tool:'op-parray'};if(w==='ag'){const m=arg.match(/(\d+)\s*[x*,]\s*(\d+)/i);if(m)return {type:'setting',key:'garr',val:[+m[1],+m[2]],tool:'op-garray'};}}
  if(w==='ss'||w==='selectsimilar')return {type:'similar'};return _pc(text);};}
// select every item like the current selection (same kind; for drafting, same layer and shape)
function selectSimilar(p,sel,levelId){const items=selItems(sel);if(!items.length)return null;const it=items[0];const o=findObj(p,it);if(!o)return null;const c=COLL[it.kind];
  const same=x=>x.level===(o.level||levelId)&&(it.kind!=='cad'||((x.layer||'L-DRAFT')===(o.layer||'L-DRAFT')&&x.shape===o.shape))&&(it.kind!=='fixture'||x.type===o.type)&&(it.kind!=='plant'||x.sp===o.sp)&&(it.kind!=='play'||x.key===o.key);
  const list=(p[c]||[]).filter(same).map(x=>({kind:it.kind,id:x.id}));return list.length>1?{kind:'multi',items:list}:list[0];}
