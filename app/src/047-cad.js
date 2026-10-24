/* ======================= drafting: CAD lines, arcs, circles, splines, hatches, layers, edit commands ======================= */
const CAD_DASH={solid:null,dash:[0.12,0.06],hidden:[0.06,0.04],center:[0.25,0.05,0.05,0.05],dot:[0.01,0.04],phantom:[0.3,0.05,0.05,0.05,0.05,0.05]};
const CAD_DASH_SCREEN={solid:null,dash:'10 5',hidden:'5 4',center:'18 4 4 4',dot:'1.5 4',phantom:'22 4 4 4 4 4'};
const CAD_WEIGHTS=[['0.25','Fine'],['0.5','Thin'],['0.8','Medium'],['1.2','Heavy'],['2','Extra heavy']];
const HATCHES=[['none','No fill'],['solid','Solid'],['diag','Diagonal lines'],['cross','Crosshatch'],['concrete','Concrete'],['earth','Earth'],['gravel','Gravel'],['insul','Batt insulation'],['brick','Brick'],['wood','Wood grain'],['tile','Tile grid']];
const DEFAULT_LAYERS=[{id:'L-DRAFT',name:'Drafting',color:'#1d5fd1'},{id:'L-DIM',name:'Dimensions',color:'#3a3a3a'},{id:'L-TEXT',name:'Text and notes',color:'#3a3a3a'},{id:'L-DETAIL',name:'Details',color:'#7a3fa0'},{id:'L-SITE',name:'Site lines',color:'#2f7a3a'}];
const layersOf=p=>{const L=p.layers&&p.layers.length?p.layers:DEFAULT_LAYERS;return L;};
const layerOn=(p,id)=>{const l=layersOf(p).find(x=>x.id===(id||'L-DRAFT'));return !l||l.on!==false;};
const layerLocked=(p,id)=>{const l=layersOf(p).find(x=>x.id===(id||'L-DRAFT'));return !!(l&&l.lock);};
// what shows in the plan (Chief-style display settings)
const SHOW_KEYS=[['roomLabels','Room names and areas'],['wallDims','Wall lengths'],['fixtures','Fixtures and cabinets'],['elec','Electrical'],['roof','Roof lines'],['dims','Dimensions'],['notes','Notes'],['cad','Drafting lines'],['site','Site and landscape'],['decks','Decks, porches and steps'],['issues','Code-check markers'],['ghost','Floor below (ghosted)'],['cabnums','Cabinet numbers'],['legs','Switch legs (which switch runs which lights)']];
const showOf=p=>({roomLabels:true,wallDims:true,fixtures:true,elec:true,roof:true,dims:true,notes:true,cad:true,site:true,decks:true,issues:true,ghost:true,cabnums:true,...(p.settings?.show||{})});

/* ---- CAD geometry ---- */
function catmull(pts,closed,seg=8){if(pts.length<3)return pts;const out=[];const n=pts.length;const P=i=>closed?pts[(i+n)%n]:pts[Math.max(0,Math.min(n-1,i))];
  for(let i=0;i<(closed?n:n-1);i++){const p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2);for(let k=0;k<seg;k++){const t=k/seg,t2=t*t,t3=t2*t;
    out.push({x:0.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),y:0.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)});}}
  if(!closed)out.push(pts[n-1]);return out;}
function cadGeom(c){const P=(c.pts||[]).map(([x,y])=>({x,y}));
  if(c.shape==='circle'){const ctr={x:c.cx,y:c.cy};return {pts:circlePts(ctr,c.r,48),closed:true,ends:[{x:c.cx+c.r,y:c.cy},{x:c.cx-c.r,y:c.cy},{x:c.cx,y:c.cy+c.r},{x:c.cx,y:c.cy-c.r}],center:ctr};}
  if(c.shape==='arc'&&P.length===3){const arc=arcThrough(P[0],P[2],P[1]);if(!arc)return {pts:P,closed:false,ends:[P[0],P[2]]};return {pts:arcPoints(arc,6),closed:false,ends:[P[0],P[2]],center:{x:arc.cx,y:arc.cy},arc};}
  if(c.shape==='spline')return {pts:catmull(P,!!c.closed,10),closed:!!c.closed,ends:c.closed?P:[P[0],P[P.length-1]]};
  if(c.shape==='rect'||c.shape==='hatch')return {pts:P,closed:true,ends:P};
  return {pts:P,closed:!!c.closed,ends:P};}
function cadMove(c,dx,dy){return c.shape==='circle'?{...c,cx:c.cx+dx,cy:c.cy+dy}:{...c,pts:c.pts.map(([x,y])=>[x+dx,y+dy])};}
function hatchLines(c,poly,spacing,angle){const xs=poly.map(q=>q.x),ys=poly.map(q=>q.y);const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;const R=Math.hypot(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys))/2+spacing;
  const d={x:Math.cos(angle),y:Math.sin(angle)},n={x:-d.y,y:d.x};const out=[];for(let o=-R;o<=R;o+=spacing){const a={x:cx+n.x*o-d.x*R,y:cy+n.y*o-d.y*R},b={x:cx+n.x*o+d.x*R,y:cy+n.y*o+d.y*R};for(const s of clipSegPoly(a,b,poly))out.push(s);}return out;}
function hatchPattern(c,poly){const k=c.hatchScale||1;const H=c.hatch||'diag';const L=[];
  if(H==='diag')L.push(...hatchLines(c,poly,6*k,Math.PI/4));else if(H==='cross'){L.push(...hatchLines(c,poly,6*k,Math.PI/4),...hatchLines(c,poly,6*k,-Math.PI/4));}
  else if(H==='brick'){L.push(...hatchLines(c,poly,2.67*k,0));}else if(H==='tile'){L.push(...hatchLines(c,poly,12*k,0),...hatchLines(c,poly,12*k,Math.PI/2));}
  else if(H==='earth'){L.push(...hatchLines(c,poly,8*k,Math.PI/4),...hatchLines(c,poly,8*k,Math.PI/4+0.08));}else if(H==='wood'){L.push(...hatchLines(c,poly,1.5*k,0.05));}
  else if(H==='insul'){L.push(...hatchLines(c,poly,3*k,Math.PI/3),...hatchLines(c,poly,3*k,-Math.PI/3));}
  else if(H==='concrete'||H==='gravel'){const xs=poly.map(q=>q.x),ys=poly.map(q=>q.y);let seed=13;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};const area=polyArea(poly.map(q=>[q.x,q.y]));const n=Math.min(1500,Math.round(area/(H==='gravel'?20:30)/k));
    for(let i=0;i<n;i++){const q={x:Math.min(...xs)+rnd()*(Math.max(...xs)-Math.min(...xs)),y:Math.min(...ys)+rnd()*(Math.max(...ys)-Math.min(...ys))};if(!inPoly(q.x,q.y,poly.map(v=>[v.x,v.y])))continue;const r=(H==='gravel'?1.4:0.6)*k*(0.5+rnd());const a=rnd()*6.28;
      L.push([{x:q.x+r*Math.cos(a),y:q.y+r*Math.sin(a)},{x:q.x+r*Math.cos(a+2.1),y:q.y+r*Math.sin(a+2.1)}],[{x:q.x+r*Math.cos(a+2.1),y:q.y+r*Math.sin(a+2.1)},{x:q.x+r*Math.cos(a+4.2),y:q.y+r*Math.sin(a+4.2)}]);}}
  return L;}
const cadColor=(p,c)=>c.color||(layersOf(p).find(l=>l.id===(c.layer||'L-DRAFT'))||{}).color||'#1d5fd1';
regObj('cad',{coll:'cad',label:'Drafting',plural:'drafting items',z:8,layer:'over',
  pts:(p,c)=>{const g=cadGeom(c);return g.pts;},
  hit:(p,c,raw,tol)=>{if(!layerOn(p,c.layer)||layerLocked(p,c.layer))return false;const g=cadGeom(c);if(c.shape==='hatch'&&c.hatch==='solid'&&inPoly(raw.x,raw.y,g.pts.map(q=>[q.x,q.y])))return true;return nearPolyline(raw,g.pts,tol*1.1,g.closed);},
  move:(c,dx,dy)=>cadMove(c,dx,dy),freeMove:false,
  title:c=>({line:'Line',pline:'Polyline',rect:'Rectangle',circle:'Circle',arc:'Arc',spline:'Spline',hatch:'Filled region'})[c.shape]||'Drafting',
  svg:(p,lv,c,S,view,isSel)=>{if(!layerOn(p,c.layer)||!showOf(p).cad)return null;const g=cadGeom(c);const col=isSel?'var(--accent)':cadColor(p,c);const w=Math.max(0.8,(+c.weight||0.5)*1.6)*(isSel?1.6:1);
    const pts=g.pts.map(q=>S(q.x,q.y).join(',')).join(' ');const dash=CAD_DASH_SCREEN[c.dash||'solid']||undefined;const out=[];
    if(c.shape==='hatch'||((c.hatch&&c.hatch!=='none')&&g.closed)){if(c.hatch==='solid')out.push(html`<polygon key="f" points=${pts} fill=${c.fill||col} fillOpacity="0.35" stroke="none"/>`);else for(const [i,[a,b]] of hatchPattern(c,g.pts).entries()){const A=S(a.x,a.y),B=S(b.x,b.y);out.push(html`<line key=${'h'+i} x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} stroke=${col} strokeWidth="0.6" strokeOpacity="0.7"/>`);}}
    out.push(g.closed?html`<polygon key="o" points=${pts} fill="none" stroke=${col} strokeWidth=${w} strokeDasharray=${dash}/>`:html`<polyline key="o" points=${pts} fill="none" stroke=${col} strokeWidth=${w} strokeDasharray=${dash} strokeLinecap="round" strokeLinejoin="round"/>`);
    if(isSel)for(const [i,q] of (c.shape==='circle'?[{x:c.cx,y:c.cy}]:c.pts.map(([x,y])=>({x,y}))).entries()){const [x,y]=S(q.x,q.y);out.push(html`<rect key=${'g'+i} x=${x-3.5} y=${y-3.5} width="7" height="7" className="cad-grip"/>`);}
    return out;},
  dl:(dl,p,lv,c,PT,k)=>{if(!layerOn(p,c.layer)||layersOf(p).find(l=>l.id===c.layer&&l.print===false))return;const g=cadGeom(c);const w=(+c.weight||0.5);const P2=q=>PT(q.x,q.y);
    if(c.shape==='hatch'||((c.hatch&&c.hatch!=='none')&&g.closed)){if(c.hatch==='solid')dl.poly(g.pts.map(P2),{fill:'#d0d0d0'});else for(const [a,b] of hatchPattern(c,g.pts))dl.line(...P2(a),...P2(b),0.2,{color:MID});}
    dl.poly(g.pts.map(P2),{stroke:INK,w,close:g.closed,dash:CAD_DASH[c.dash||'solid']?CAD_DASH[c.dash].map(v=>v*k):undefined});},
  panel:(c,{p,up})=>html`<div className="sec"><h3>${({line:'Line',pline:'Polyline',rect:'Rectangle',circle:'Circle',arc:'Arc',spline:'Spline',hatch:'Filled region'})[c.shape]}</h3>
    <${Field} label="Layer" id="cd-l"><${Sel} id="cd-l" value=${c.layer||'L-DRAFT'} onChange=${v=>up({layer:v})} options=${layersOf(p).map(l=>[l.id,l.name])}/><//>
    <${Field} label="Line type" id="cd-d"><${Sel} id="cd-d" value=${c.dash||'solid'} onChange=${v=>up({dash:v})} options=${Object.keys(CAD_DASH).map(k=>[k,k[0].toUpperCase()+k.slice(1)])}/><//>
    <${Field} label="Line weight" id="cd-w"><${Sel} id="cd-w" value=${String(c.weight||0.5)} onChange=${v=>up({weight:+v})} options=${CAD_WEIGHTS}/><//>
    <${ColorPick} id="cd-c" label="Color on screen" value=${c.color} fallback=${cadColor(p,{...c,color:null})} onChange=${v=>up({color:v})}/>
    ${c.shape==='circle'?html`<${Field} label="Radius" id="cd-r"><${LenInput} id="cd-r" value=${c.r} onChange=${v=>v>0&&up({r:v})}/><//>`:null}
    ${c.shape==='hatch'||c.shape==='rect'||c.closed||c.shape==='circle'?html`<${Field} label="Fill" id="cd-h"><${Sel} id="cd-h" value=${c.hatch||'none'} onChange=${v=>up({hatch:v})} options=${HATCHES}/><//>${c.hatch&&c.hatch!=='none'&&c.hatch!=='solid'?html`<${Field} label="Pattern scale" id="cd-hs"><${NumInput} id="cd-hs" value=${c.hatchScale||1} min=${0.25} max=${8} onChange=${v=>up({hatchScale:v})}/><//>`:null}`:null}
    ${(c.shape==='line'||c.shape==='pline')&&c.pts.length>=2?html`<div className="stat"><span>Length</span><span className="mono">${fmtLen(c.pts.reduce((s,q,i)=>i?s+Math.hypot(q[0]-c.pts[i-1][0],q[1]-c.pts[i-1][1]):0,0))}</span></div>`:null}
    ${c.shape==='line'&&c.pts.length===2?html`<div className="stat"><span>Angle</span><span className="mono">${(((Math.atan2(-(c.pts[1][1]-c.pts[0][1]),c.pts[1][0]-c.pts[0][0])*180/Math.PI)+360)%360).toFixed(1)}°</span></div>`:null}
    ${c.shape==='pline'?html`<label className="check"><input type="checkbox" checked=${!!c.closed} onChange=${e=>up({closed:e.target.checked})}/> Closed</label>`:null}
    <p className="note">Drafting prints on the plan sheets in black at the line weight you choose. Use the Edit tools to move, copy, rotate, mirror, offset, trim and extend.</p></div>`,
  xform:(c,T)=>c.shape==='circle'?{...c,...(()=>{const q=T.pt({x:c.cx,y:c.cy});return {cx:q.x,cy:q.y};})(),r:c.r*(T.scale||1)}:{...c,pts:c.pts.map(([x,y])=>{const q=T.pt({x,y});return [q.x,q.y];})},
});
/* ---- drafting tools ---- */
I.line=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20L20 4"/><circle cx="4" cy="20" r="1.6"/><circle cx="20" cy="4" r="1.6"/></svg>`;
I.pline=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 19l6-10 6 6 6-10"/></svg>`;
I.rect=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="6" width="16" height="12"/></svg>`;
I.circle=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1"/></svg>`;
I.arc=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 18A9 9 0 0 1 20 18"/></svg>`;
I.spline=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18c4-12 8 4 11-6s5-6 7-6"/></svg>`;
I.hatch=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h16v16H4z"/><path d="M4 12l8-8M4 20L20 4M12 20l8-8"/></svg>`;
const cadNew=(ctx,shape,extra)=>({id:uid('cd'),level:ctx.lv.id,shape,layer:ctx.p.settings?.cadLayer||'L-DRAFT',weight:0.5,dash:'solid',status:'new',...extra});
const cadPlace=(ctx,o)=>({p:{...ctx.p,cad:[...(ctx.p.cad||[]),o]},sel:{kind:'cad',id:o.id}});
const pl=(S,pts)=>pts.map(q=>S(q.x,q.y).join(',')).join(' ');
regTool('line',{label:'Line',key:'I',group:'draft',icon:I.line,mode:'chain',min:2,
  hint:n=>n?html`Click the next point, or type a length (or @x,y, or 10'${'<'}45) in the command line. Each segment is its own line. Enter or Esc to stop.`:html`<b>Line:</b> click the start point. Snaps to ends, midpoints, intersections and perpendiculars.`,
  place:(ctx,pts)=>{if(pts.length<2)return null;let q=ctx.p;const made=[];for(let i=0;i+1<pts.length;i++){const o=cadNew(ctx,'line',{pts:[[pts[i].x,pts[i].y],[pts[i+1].x,pts[i+1].y]]});made.push(o);}q={...q,cad:[...(q.cad||[]),...made]};return {p:q,sel:made.length>1?{kind:'multi',items:made.map(o=>({kind:'cad',id:o.id}))}:{kind:'cad',id:made[0].id}};}});
regTool('pline',{label:'Polyline',group:'draft',icon:I.pline,mode:'chain',min:2,closable:true,
  hint:n=>n?html`Click the next point; click the first point to close; Enter or Esc to finish.`:html`<b>Polyline:</b> click points; it stays one object.`,
  place:(ctx,pts)=>{if(pts.length<2)return null;const closed=pts.length>=3&&dist(pts[0],pts[pts.length-1])<0.6;const P=closed?pts.slice(0,-1):pts;return cadPlace(ctx,cadNew(ctx,'pline',{pts:P.map(q=>[q.x,q.y]),closed:closed||(ctx.closedChain===true)}));}});
regTool('rect',{label:'Rectangle',group:'draft',icon:I.rect,mode:'rect',
  ghost:(ctx,pts,cur,S)=>{if(pts.length<2)return null;const [a,b]=[pts[0],pts[pts.length-1]];return html`<polygon points=${pl(S,[a,{x:b.x,y:a.y},b,{x:a.x,y:b.y}])} className="draft"/>`;},
  hint:()=>html`<b>Rectangle:</b> drag, or click two corners. Type @width,height for an exact size.`,
  place:(ctx,[a,b])=>{if(Math.abs(a.x-b.x)<0.5||Math.abs(a.y-b.y)<0.5)return null;return cadPlace(ctx,cadNew(ctx,'rect',{pts:[[a.x,a.y],[b.x,a.y],[b.x,b.y],[a.x,b.y]]}));}});
regTool('circle',{label:'Circle',group:'draft',icon:I.circle,mode:'two',
  ghost:(ctx,pts,cur,S,view)=>{if(pts.length<2)return null;const r=dist(pts[0],pts[1]);const [x,y]=S(pts[0].x,pts[0].y);return html`<circle cx=${x} cy=${y} r=${r*view.s} className="draft" fill="none"/><text x=${x} y=${y-r*view.s-8} textAnchor="middle" className="draft-t halo">R ${fmtLen(r)}</text>`;},
  hint:n=>n?html`Click a point on the circle, or type the radius.`:html`<b>Circle:</b> click the center.`,
  place:(ctx,[a,b])=>{const r=dist(a,b);if(r<0.25)return null;return cadPlace(ctx,cadNew(ctx,'circle',{cx:a.x,cy:a.y,r,pts:[]}));}});
regTool('arc',{label:'Arc (3 points)',group:'draft',icon:I.arc,mode:'chain',max:3,min:3,ortho:false,
  ghost:(ctx,pts,cur,S)=>{if(pts.length<3)return pts.length>1?html`<polyline points=${pl(S,pts)} className="draft"/>`:null;const arc=arcThrough(pts[0],pts[2],pts[1]);return arc?html`<polyline points=${pl(S,arcPoints(arc,6))} className="draft" fill="none"/>`:null;},
  hint:n=>n===0?html`<b>Arc:</b> click the start.`:n===1?html`Click a point the arc passes through.`:html`Click the end of the arc.`,
  place:(ctx,pts)=>{if(pts.length<3)return null;return cadPlace(ctx,cadNew(ctx,'arc',{pts:pts.map(q=>[q.x,q.y])}));}});
regTool('spline',{label:'Spline (smooth curve)',group:'draft',icon:I.spline,mode:'chain',min:3,closable:true,ortho:false,
  ghost:(ctx,pts,cur,S)=>pts.length>2?html`<polyline points=${pl(S,catmull(pts,false,10))} className="draft" fill="none"/>`:null,
  hint:n=>n?html`Click more points; Enter to finish; click the first point to close.`:html`<b>Spline:</b> click points the smooth curve passes through.`,
  place:(ctx,pts)=>{const closed=pts.length>=4&&dist(pts[0],pts[pts.length-1])<0.6;const P=closed?pts.slice(0,-1):pts;if(P.length<3)return null;return cadPlace(ctx,cadNew(ctx,'spline',{pts:P.map(q=>[q.x,q.y]),closed}));}});
regTool('hatch',{label:'Filled region (hatch)',group:'draft',icon:I.hatch,mode:'chain',min:3,closable:true,
  hint:n=>n>=3?html`Click the first point or press Enter to close the region.`:html`<b>Filled region:</b> click the corners. Pick the pattern (concrete, earth, insulation, brick…) in the panel. Click inside a room or closed outline first to fill it automatically.`,
  place:(ctx,pts)=>{const closed=dist(pts[0],pts[pts.length-1])<0.6;const P=closed?pts.slice(0,-1):pts;if(P.length<3)return null;return cadPlace(ctx,cadNew(ctx,'hatch',{pts:P.map(q=>[q.x,q.y]),hatch:'diag',weight:0.25}));}});
for(const id of ['line','pline','rect','circle','arc','spline','hatch'])addToolToGroup('draft',id);

/* ---- moving, rotating and mirroring anything ---- */
// T: {pt:q=>q', vec:v=>v', flip:bool (mirror)}; items: [{kind,id}]
function xformObj(p,kind,o,T){const P=q=>T.pt(q);const ang=(a)=>{const v=T.vec({x:Math.cos(a),y:Math.sin(a)});return Math.atan2(v.y,v.x);};
  const rotDeg=(deg,frontFn)=>{const a=deg*Math.PI/180;const f=frontFn(a);const v=T.vec(f);return ((Math.round(Math.atan2(-v.x,v.y)*180/Math.PI*100)/100)%360+360)%360;};
  switch(kind){
    case 'wall':{const a=P({x:o.x1,y:o.y1}),b=P({x:o.x2,y:o.y2});return {...o,x1:a.x,y1:a.y,x2:b.x,y2:b.y};}
    case 'room':return {...o,pts:o.pts.map(([x,y])=>{const q=P({x,y});return [q.x,q.y];})};
    case 'fixture':{const q=P(o);return {...o,x:q.x,y:q.y,rot:rotDeg(o.rot||0,a=>({x:-Math.sin(a),y:Math.cos(a)}))};}
    case 'stair':{const q=P(o);const d=stairDir(o);const v=T.vec(d);return {...o,x:q.x,y:q.y,a:Math.atan2(v.y,v.x),...(T.flip&&o.turn?{turn:o.turn==='left'?'right':'left'}:{})};}
    case 'roof':{const cs=[{x:o.x,y:o.y},{x:o.x+o.w,y:o.y},{x:o.x+o.w,y:o.y+o.h},{x:o.x,y:o.y+o.h}].map(P);const xs=cs.map(q=>q.x),ys=cs.map(q=>q.y);const nx=Math.min(...xs),ny=Math.min(...ys);const nw=Math.max(...xs)-nx,nh=Math.max(...ys)-ny;
      const swapped=Math.abs(nw-o.w)>0.5&&Math.abs(nw-o.h)<0.5;return {...o,x:nx,y:ny,w:nw,h:nh,ridge:swapped?((o.ridge||'x')==='x'?'y':'x'):o.ridge};}
    case 'elec':{const q=P(o);return {...o,x:q.x,y:q.y,rot:rotDeg(o.rot||0,a=>({x:-Math.sin(a),y:Math.cos(a)}))};}
    case 'ramp':{const q=P(o);const v=T.vec(DIRS[o.dir]||DIRS.S);const dir=Math.abs(v.x)>Math.abs(v.y)?(v.x>0?'E':'W'):(v.y>0?'S':'N');return {...o,x:q.x,y:q.y,dir};}
    case 'shape':return o.kind==='round'?{...o,...(()=>{const q=P({x:o.cx,y:o.cy});return {cx:q.x,cy:q.y};})()}:{...o,pts:o.pts.map(([x,y])=>{const q=P({x,y});return [q.x,q.y];}),holes:(o.holes||[]).map(h=>h.map(([x,y])=>{const q=P({x,y});return [q.x,q.y];}))};
    case 'dim':{const a=P(o.a),b=P(o.b);return {...o,a,b,off:T.flip?-(o.off??18):o.off};}
    case 'anno':{const q=P(o);return {...o,x:q.x,y:q.y,leader:o.leader?P(o.leader):null};}
    default:{const d=OBJ[kind];if(d&&d.xform)return d.xform(o,T);const r={...o};if(o.pts)r.pts=o.pts.map(([x,y])=>{const q=P({x,y});return [q.x,q.y];});if(o.x!=null&&o.y!=null){const q=P(o);r.x=q.x;r.y=q.y;}if(o.a!=null)r.a=ang(o.a);if(o.rot!=null)r.rot=rotDeg(o.rot,a=>({x:-Math.sin(a),y:Math.cos(a)}));return r;}}}
function xformItems(p,items,T,copy=false){let q={...p};const sel=[];const wallIdMap={};
  for(const it of items){if(it.kind==='opening')continue;const c=COLL[it.kind];const o=(q[c]||[]).find(x=>x.id===it.id);if(!o)continue;let n=xformObj(q,it.kind,o,T);
    if(copy){n={...JSON.parse(JSON.stringify(n)),id:uid(it.kind.slice(0,2))};q={...q,[c]:[...(q[c]||[]),n]};if(it.kind==='wall')wallIdMap[o.id]=n.id;}else q={...q,[c]:q[c].map(x=>x.id===it.id?n:x)};sel.push({kind:it.kind,id:n.id});}
  // doors and windows ride along with their walls; a mirror swaps their swing
  if(copy){const ops=q.openings.filter(o=>wallIdMap[o.wall]).map(o=>({...o,id:uid('op'),wall:wallIdMap[o.wall],...(T.flip?{swing:-(o.swing||1)}:{})}));q={...q,openings:[...q.openings,...ops]};}
  else if(T.flip){const moved=new Set(items.filter(i=>i.kind==='wall').map(i=>i.id));q={...q,openings:q.openings.map(o=>moved.has(o.wall)?{...o,swing:-(o.swing||1)}:o)};}
  return {p:q,sel:sel.length>1?{kind:'multi',items:sel}:sel[0]||null};}
const T_move=(dx,dy)=>({pt:q=>({x:q.x+dx,y:q.y+dy}),vec:v=>v});
const T_rot=(c,deg)=>{const a=deg*Math.PI/180,cs=Math.cos(a),sn=Math.sin(a);return {pt:q=>({x:c.x+(q.x-c.x)*cs-(q.y-c.y)*sn,y:c.y+(q.x-c.x)*sn+(q.y-c.y)*cs}),vec:v=>({x:v.x*cs-v.y*sn,y:v.x*sn+v.y*cs})};};
const T_mirror=(a,b)=>{const L=dist(a,b)||1;const d={x:(b.x-a.x)/L,y:(b.y-a.y)/L};const ref=v=>{const k=2*(v.x*d.x+v.y*d.y);return {x:k*d.x-v.x,y:k*d.y-v.y};};return {pt:q=>{const r=ref({x:q.x-a.x,y:q.y-a.y});return {x:a.x+r.x,y:a.y+r.y};},vec:ref,flip:true};};
const selItems=sel=>!sel?[]:sel.kind==='multi'?sel.items:[{kind:sel.kind,id:sel.id}];
function selCenter(p,items){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const add=q=>{x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y);};
  for(const it of items){const o=findObj(p,it);if(!o)continue;if(it.kind==='wall'){add({x:o.x1,y:o.y1});add({x:o.x2,y:o.y2});}else if(o.pts)o.pts.forEach(([x,y])=>add({x,y}));else if(o.a&&o.b&&it.kind==='dim'){add(o.a);add(o.b);}else if(o.x!=null)add(o);else if(o.cx!=null)add({x:o.cx,y:o.cy});}
  return x0>x1?{x:0,y:0}:{x:(x0+x1)/2,y:(y0+y1)/2};}

/* ---- edit tools ---- */
I.move=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M2 12h20"/><path d="M9 5l3-3 3 3M9 19l3 3 3-3M5 9l-3 3 3 3M19 9l3 3-3 3"/></svg>`;
I.copy=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12"/><path d="M4 16V4h12"/></svg>`;
I.rotate=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 12a8 8 0 1 1-3-6.2"/><path d="M20 3v6h-6"/></svg>`;
I.mirror=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20" stroke-dasharray="2 2"/><path d="M9 6L3 18h6zM15 6l6 12h-6z"/></svg>`;
I.array=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="9" width="5" height="6"/><rect x="9.5" y="9" width="5" height="6"/><rect x="17" y="9" width="5" height="6"/></svg>`;
I.offset=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 16L16 3"/><path d="M8 21L21 8" stroke-dasharray="3 2"/></svg>`;
I.trim=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18"/><path d="M3 12h7" /><path d="M14 12h7" stroke-dasharray="2 2"/><circle cx="6" cy="18" r="2"/><circle cx="6" cy="6" r="2"/><path d="M8 7l8 9M8 17l8-9"/></svg>`;
I.extend=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 3v18"/><path d="M3 12h11"/><path d="M14 12h6" stroke-dasharray="2 2"/><path d="M15 9l3 3-3 3"/></svg>`;
I.autodim=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="9" width="12" height="12"/><path d="M6 4h12M6 2v4M18 2v4M12 2v4"/></svg>`;
const needSel=ctx=>!selItems(ctx.sel).length;
const opHint=(t)=>(n,ctx)=>needSel(ctx)?html`<b>${t}:</b> select what to change first (click, Shift-click, or Shift-drag a box with the Select tool), then pick this tool.`:t;
regTool('op-move',{label:'Move',key:'',group:'edit',icon:I.move,mode:'two',
  hint:(n,ctx)=>needSel(ctx)?opHint('Move')(n,ctx):n?html`Click where the base point goes (or type @x,y or 10'${'<'}90).`:html`<b>Move:</b> click a base point on the selection.`,
  ghost:(ctx,pts,cur,S)=>pts.length>1?html`<line x1=${S(pts[0].x,pts[0].y)[0]} y1=${S(pts[0].x,pts[0].y)[1]} x2=${S(pts[1].x,pts[1].y)[0]} y2=${S(pts[1].x,pts[1].y)[1]} className="meas"/>`:null,
  place:(ctx,[a,b])=>{if(needSel(ctx))return null;const r=xformItems(ctx.p,selItems(ctx.sel),T_move(b.x-a.x,b.y-a.y));return {...r,keep:true};}});
regTool('op-copy',{label:'Copy',group:'edit',icon:I.copy,mode:'two',
  hint:(n,ctx)=>needSel(ctx)?opHint('Copy')(n,ctx):n?html`Click where the copy goes. The tool stays on for more copies.`:html`<b>Copy:</b> click a base point on the selection.`,
  place:(ctx,[a,b])=>{if(needSel(ctx))return null;const r=xformItems(ctx.p,selItems(ctx.sel),T_move(b.x-a.x,b.y-a.y),true);return {p:r.p,sel:ctx.sel,keep:true};}});
regTool('op-rotate',{label:'Rotate',group:'edit',icon:I.rotate,mode:'two',ortho:false,
  hint:(n,ctx)=>needSel(ctx)?opHint('Rotate')(n,ctx):n?html`Move the mouse to set the angle (snaps to 15°; hold Shift for any angle) and click, or type an angle like 30 or -90.`:html`<b>Rotate:</b> click the point to rotate around, or type an angle to turn it around its center.`,
  ghost:(ctx,pts,cur,S)=>{if(pts.length<2)return null;const a=pts[0],b=pts[1];const deg=Math.round(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI/15)*15;const [x,y]=S(a.x,a.y),[x2,y2]=S(b.x,b.y);return html`<line x1=${x} y1=${y} x2=${x2} y2=${y2} className="meas"/><text x=${x2} y=${y2-10} className="draft-t halo">${-deg}°</text>`;},
  place:(ctx,[a,b],info)=>{if(needSel(ctx))return null;const deg=info&&info.angle!=null?info.angle:Math.round(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI/15)*15;const r=xformItems(ctx.p,selItems(ctx.sel),T_rot(a,deg));return r;}});
for(const [id,copy,label] of [['op-mirror',false,'Mirror'],['op-mirrorcopy',true,'Mirror copy']])
  regTool(id,{label,group:'edit',icon:I.mirror,mode:'two',
    hint:(n,ctx)=>needSel(ctx)?opHint(label)(n,ctx):n?html`Click the second point of the mirror line.`:html`<b>${label}:</b> click the first point of the mirror line (snaps to 45°).`,
    ghost:(ctx,pts,cur,S)=>pts.length>1?html`<line x1=${S(pts[0].x,pts[0].y)[0]} y1=${S(pts[0].x,pts[0].y)[1]} x2=${S(pts[1].x,pts[1].y)[0]} y2=${S(pts[1].x,pts[1].y)[1]} className="meas" strokeDasharray="8 4"/>`:null,
    place:(ctx,[a,b])=>{if(needSel(ctx)||dist(a,b)<0.5)return null;return xformItems(ctx.p,selItems(ctx.sel),T_mirror(a,b),copy);}});
regTool('op-array',{label:'Array (row of copies)',group:'edit',icon:I.array,mode:'two',
  hint:(n,ctx)=>needSel(ctx)?opHint('Array')(n,ctx):n?html`Click the spacing to the next copy. Makes ${ctx.p.settings?.arrayN||3} in all (type AR 5 in the command line to change).`:html`<b>Array:</b> click a base point.`,
  place:(ctx,[a,b])=>{if(needSel(ctx))return null;const n=Math.max(2,ctx.p.settings?.arrayN||3);let q=ctx.p;for(let i=1;i<n;i++)q=xformItems(q,selItems(ctx.sel),T_move((b.x-a.x)*i,(b.y-a.y)*i),true).p;return {p:q,sel:ctx.sel};}});
// offset: click a wall or CAD line, then the side
function offsetTarget(ctx,raw){const tol=10/ctx.view.s;let best=null;for(const c of (ctx.p.cad||[]).filter(c=>c.level===ctx.lv.id)){const g=cadGeom(c);for(let i=0;i+1<g.pts.length+(g.closed?1:0);i++){const a=g.pts[i],b=g.pts[(i+1)%g.pts.length];const d=projSeg(raw,a,b).d;if(d<tol&&(!best||d<best.d))best={kind:'cad',o:c,d};}}
  for(const w of ctx.walls){const d=projSeg(raw,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2}).d;if(d<w.thick/2+tol&&(!best||d<best.d))best={kind:'wall',o:w,d};}return best;}
regTool('op-offset',{label:'Offset',group:'edit',icon:I.offset,mode:'two',snap:'free',
  hint:(n,ctx)=>n?html`Click the side for the offset copy (${fmtLen(ctx.p.settings?.offsetD||6)} away; type O 12 to change the distance).`:html`<b>Offset:</b> click a line, polyline, circle or wall. A wall offset makes a parallel wall (type O 10' for a 10 ft room).`,
  place:(ctx,[a,b],info)=>{const t=offsetTarget(ctx,a);if(!t)return null;const D=ctx.p.settings?.offsetD||6;
    if(t.kind==='wall'){const w=t.o;const d=wdir(w);let n={x:-d.y,y:d.x};if((b.x-w.x1)*n.x+(b.y-w.y1)*n.y<0)n={x:-n.x,y:-n.y};const nw={...w,id:uid('w'),x1:w.x1+n.x*D,y1:w.y1+n.y*D,x2:w.x2+n.x*D,y2:w.y2+n.y*D,status:'new'};return {p:{...ctx.p,walls:[...ctx.p.walls,nw]},sel:{kind:'wall',id:nw.id},keep:true};}
    const c=t.o;if(c.shape==='circle'){const out=dist(b,{x:c.cx,y:c.cy})>c.r;const n={...c,id:uid('cd'),r:Math.max(0.25,c.r+(out?D:-D))};return {p:{...ctx.p,cad:[...ctx.p.cad,n]},sel:{kind:'cad',id:n.id},keep:true};}
    const P=c.pts.map(([x,y])=>({x,y}));const closed=c.shape==='rect'||c.shape==='hatch'||c.closed;
    if(closed){const inside=inPoly(b.x,b.y,c.pts);const q=offsetPoly(P,inside?-D:D);const n={...c,id:uid('cd'),pts:q.map(v=>[v.x,v.y])};return {p:{...ctx.p,cad:[...ctx.p.cad,n]},sel:{kind:'cad',id:n.id},keep:true};}
    // open polyline: offset each segment and join
    const segs=[];for(let i=0;i+1<P.length;i++){const A=P[i],B=P[i+1];const L=dist(A,B)||1;let n={x:-(B.y-A.y)/L,y:(B.x-A.x)/L};segs.push({A,B,n});}
    const pr=projSeg(b,segs[0].A,segs[0].B);const sgn=((b.x-pr.x)*segs[0].n.x+(b.y-pr.y)*segs[0].n.y)>=0?1:-1;const lines=segs.map(s=>({p:{x:s.A.x+s.n.x*D*sgn,y:s.A.y+s.n.y*D*sgn},d:{x:s.B.x-s.A.x,y:s.B.y-s.A.y},end:{x:s.B.x+s.n.x*D*sgn,y:s.B.y+s.n.y*D*sgn}}));
    const out=[lines[0].p];for(let i=1;i<lines.length;i++){const A=lines[i-1],B=lines[i];const den=A.d.x*B.d.y-A.d.y*B.d.x;if(Math.abs(den)<1e-9){out.push(B.p);continue;}const t=((B.p.x-A.p.x)*B.d.y-(B.p.y-A.p.y)*B.d.x)/den;out.push({x:A.p.x+A.d.x*t,y:A.p.y+A.d.y*t});}out.push(lines[lines.length-1].end);
    const n={...c,id:uid('cd'),pts:out.map(v=>[v.x,v.y])};return {p:{...ctx.p,cad:[...ctx.p.cad,n]},sel:{kind:'cad',id:n.id},keep:true};}});
// trim and extend work on drafting lines against every edge in the drawing
function cutters(ctx,skipId){const G=snapGeom(ctx.p,ctx.lv.id,true);return G.segs.filter(s=>!(s.kind==='cad'&&s.id===skipId));}
regTool('op-trim',{label:'Trim',group:'edit',icon:I.trim,mode:'click',snap:'free',
  hint:()=>html`<b>Trim:</b> click the part of a drafting line to cut away. It is cut back to the nearest crossing lines or wall faces on each side.`,
  place:(ctx,[pt],{raw})=>{raw=raw||pt;const tol=10/ctx.view.s;const c=(ctx.p.cad||[]).filter(c=>c.level===ctx.lv.id&&(c.shape==='line'||c.shape==='pline')).map(c=>({c,d:Math.min(...c.pts.slice(0,-1).map((q,i)=>projSeg(raw,{x:q[0],y:q[1]},{x:c.pts[i+1][0],y:c.pts[i+1][1]}).d))})).sort((a,b)=>a.d-b.d)[0];
    if(!c||c.d>tol)return null;const o=c.c;let si=0,sd=1e9;for(let i=0;i+1<o.pts.length;i++){const d=projSeg(raw,{x:o.pts[i][0],y:o.pts[i][1]},{x:o.pts[i+1][0],y:o.pts[i+1][1]}).d;if(d<sd){sd=d;si=i;}}
    const A={x:o.pts[si][0],y:o.pts[si][1]},B={x:o.pts[si+1][0],y:o.pts[si+1][1]};const t0=projSeg(raw,A,B).t;
    const cutsSeg=[];for(const s of snapGeom(ctx.p,ctx.lv.id,true).segs){const q=segInter(A,B,s.a,s.b);if(q&&q.t>1e-4&&q.t<1-1e-4)cutsSeg.push(q.t);}
    for(const other of (ctx.p.cad||[]).filter(x=>x.level===ctx.lv.id&&x.id!==o.id)){const g=cadGeom(other);for(let i=0;i+1<g.pts.length+(g.closed?1:0);i++){const q=segInter(A,B,g.pts[i],g.pts[(i+1)%g.pts.length]);if(q&&q.t>1e-4&&q.t<1-1e-4)cutsSeg.push(q.t);}}
    const lo=Math.max(0,...cutsSeg.filter(t=>t<t0)),hi=Math.min(1,...cutsSeg.filter(t=>t>t0));const at=t=>[A.x+(B.x-A.x)*t,A.y+(B.y-A.y)*t];
    let parts=[];const before=o.pts.slice(0,si+1),after=o.pts.slice(si+1);
    if(lo>0)parts.push([...before,at(lo)]);else if(si>0)parts.push(before);if(hi<1)parts.push([at(hi),...after]);else if(after.length>1)parts.push(after);
    parts=parts.filter(q=>q.length>=2&&q.some((v,i)=>i&&Math.hypot(v[0]-q[0][0],v[1]-q[0][1])>0.1));
    const rest=(ctx.p.cad||[]).filter(x=>x.id!==o.id);const made=parts.map(pts=>({...o,id:uid('cd'),pts,shape:pts.length===2?'line':'pline',closed:false}));return {p:{...ctx.p,cad:[...rest,...made]},sel:null,keep:true};}});
regTool('op-extend',{label:'Extend',group:'edit',icon:I.extend,mode:'click',snap:'free',
  hint:()=>html`<b>Extend:</b> click near the end of a drafting line to stretch it to the next line or wall face it points at.`,
  place:(ctx,[pt],{raw})=>{raw=raw||pt;const tol=10/ctx.view.s;let best=null;for(const c of (ctx.p.cad||[]).filter(c=>c.level===ctx.lv.id&&(c.shape==='line'||c.shape==='pline'))){const n=c.pts.length;for(const [ei,pi] of [[0,1],[n-1,n-2]]){const e={x:c.pts[ei][0],y:c.pts[ei][1]};const d=dist(e,raw);if(d<Math.max(tol*3,24)&&(!best||d<best.d))best={c,ei,pi,d};}}
    if(!best)return null;const c=best.c;const E={x:c.pts[best.ei][0],y:c.pts[best.ei][1]},Pp={x:c.pts[best.pi][0],y:c.pts[best.pi][1]};const L=dist(E,Pp)||1;const dir={x:(E.x-Pp.x)/L,y:(E.y-Pp.y)/L};const far={x:E.x+dir.x*2400,y:E.y+dir.y*2400};
    let tmin=null;for(const s of snapGeom(ctx.p,ctx.lv.id,true).segs){const q=segInter(E,far,s.a,s.b);if(q&&q.t>1e-5&&(tmin==null||q.t<tmin))tmin=q.t;}
    for(const other of (ctx.p.cad||[]).filter(x=>x.level===ctx.lv.id&&x.id!==c.id)){const g=cadGeom(other);for(let i=0;i+1<g.pts.length+(g.closed?1:0);i++){const q=segInter(E,far,g.pts[i],g.pts[(i+1)%g.pts.length]);if(q&&q.t>1e-5&&(tmin==null||q.t<tmin))tmin=q.t;}}
    if(tmin==null)return null;const NE=[E.x+(far.x-E.x)*tmin,E.y+(far.y-E.y)*tmin];const pts=c.pts.map((q,i)=>i===best.ei?NE:q);return {p:updObj(ctx.p,'cad',c.id,{pts}),sel:{kind:'cad',id:c.id},keep:true};}});
// automatic dimensions: outside strings for the exterior walls (overall, wall breaks, openings)
function autoDims(p,lvId){const ol=buildingOutline(p,lvId);if(!ol)return [];const P=ol.pts;const xs=P.map(q=>q.x),ys=P.map(q=>q.y);const B={x0:Math.min(...xs),y0:Math.min(...ys),x1:Math.max(...xs),y1:Math.max(...ys)};const out=[];
  const mk=(a,b,off,label)=>out.push({id:uid('dm'),level:lvId,a,b,off,layer:'L-DIM',auto:true,...(label?{label}:{})});
  // overall
  mk({x:B.x0,y:B.y0},{x:B.x1,y:B.y0},-60);mk({x:B.x1,y:B.y0},{x:B.x1,y:B.y1},-60);
  // breaks along each side
  const side=(axis,edge,off)=>{const pts=[];for(const q of P){if(axis==='x'?Math.abs(q.y-edge)<60:Math.abs(q.x-edge)<60)pts.push(axis==='x'?q.x:q.y);}
    for(const o of p.openings){const c=openingCenter(p,o);if(!c||c.w.level!==lvId||c.w.kind!=='exterior')continue;const d=wdir(c.w);if(axis==='x'?Math.abs(d.y)>0.1:Math.abs(d.x)>0.1)continue;if(axis==='x'?Math.abs(c.y-edge)>40:Math.abs(c.x-edge)>40)continue;pts.push(axis==='x'?c.x:c.y);}
    const u=[...new Set(pts.map(v=>Math.round(v*4)/4))].sort((a,b)=>a-b);for(let i=0;i+1<u.length;i++){if(u[i+1]-u[i]<2)continue;mk(axis==='x'?{x:u[i],y:edge}:{x:edge,y:u[i]},axis==='x'?{x:u[i+1],y:edge}:{x:edge,y:u[i+1]},off);}};
  side('x',B.y0,-36);side('y',B.x1,-36);side('x',B.y1,36);side('y',B.x0,36);return out;}
regTool('autodim',{label:'Automatic dimensions',group:'draft',icon:I.autodim,mode:'click',snap:'free',
  hint:()=>html`<b>Automatic dimensions:</b> click to add exterior dimension strings (overall, corners, door and window centers). Earlier automatic ones on this floor are replaced.`,
  place:(ctx)=>{const ds=autoDims(ctx.p,ctx.lv.id);if(!ds.length)return null;return {p:{...ctx.p,dims:[...(ctx.p.dims||[]).filter(d=>!(d.auto&&d.level===ctx.lv.id)),...ds]},sel:null,tool:'select'};}});
addToolToGroup('draft','autodim','dim');
TOOL_GROUPS.splice(TOOL_GROUPS.findIndex(g=>g.id==='measure'),0,{id:'edit',label:'Edit (move, copy, rotate…)',tools:['op-move','op-copy','op-rotate','op-mirror','op-mirrorcopy','op-array','op-offset','op-trim','op-extend']});

/* ---- section and interior elevation markers ---- */
I.section=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v20" stroke-dasharray="4 2 1 2"/><circle cx="12" cy="4" r="2.5"/><circle cx="12" cy="20" r="2.5"/><path d="M15 4h5M15 20h5"/></svg>`;
regObj('section',{coll:'sections',label:'Section cut',plural:'section cuts',z:9,layer:'over',noBounds:true,
  pts:(p,s)=>[s.a,s.b],hit:(p,s,raw,tol)=>projSeg(raw,s.a,s.b).d<tol*1.4,move:(s,dx,dy)=>({...s,a:{x:s.a.x+dx,y:s.a.y+dy},b:{x:s.b.x+dx,y:s.b.y+dy}}),
  rotate:s=>({look:-(s.look||1)}),title:s=>`Section ${s.label||''}`,
  svg:(p,lv,s,S,view,isSel)=>{const A=S(s.a.x,s.a.y),B=S(s.b.x,s.b.y);const L=Math.hypot(B[0]-A[0],B[1]-A[1])||1;const d=[(B[0]-A[0])/L,(B[1]-A[1])/L];const n=[-d[1]*(s.look||1),d[0]*(s.look||1)];
    return html`<g className=${'secmark'+(isSel?' secmark-sel':'')}><line x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]}/>${[A,B].map((q,i)=>html`<g key=${i}><circle cx=${q[0]} cy=${q[1]} r="10"/><text x=${q[0]} y=${q[1]+4} textAnchor="middle">${s.label||'?'}</text><path d=${`M${q[0]+n[0]*10},${q[1]+n[1]*10} l${n[0]*10-d[1]*6},${n[1]*10+d[0]*6} l${d[1]*12},${-d[0]*12}z`}/></g>`)}</g>`;},
  dl:(dl,p,lv,s,PT,k)=>{const A=PT(s.a.x,s.a.y),B=PT(s.b.x,s.b.y);dl.line(...A,...B,1.1,{dash:[0.18*k,0.05*k,0.03*k,0.05*k]});const L=Math.hypot(B[0]-A[0],B[1]-A[1])||1;const d=[(B[0]-A[0])/L,(B[1]-A[1])/L];const n=[-d[1]*(s.look||1),d[0]*(s.look||1)];
    for(const q of [A,B]){const r=0.11*k;dl.circle(q[0],q[1],r,{stroke:INK,fill:'#ffffff',w:0.7});dl.text(q[0],q[1]+0.035*k,s.label||'?',{size:6.5*k,bold:true,anchor:'middle'});const t=[q[0]+n[0]*r,q[1]+n[1]*r];dl.poly([[t[0]+n[0]*0.12*k,t[1]+n[1]*0.12*k],[t[0]-d[0]*0.07*k,t[1]-d[1]*0.07*k],[t[0]+d[0]*0.07*k,t[1]+d[1]*0.07*k]],{fill:INK});}},
  panel:(s,{up})=>html`<div className="sec"><h3>Section cut</h3><${Field} label="Label" id="sc-l"><input id="sc-l" className="inp" value=${s.label||''} onChange=${e=>up({label:e.target.value.toUpperCase().slice(0,3)})}/><//>
    <div className="row"><button className="btn" onClick=${()=>up({look:-(s.look||1)})}>Look the other way</button></div><p className="note">Each section cut becomes its own sheet in the plan set (A3.x). Cuts snap square to the drawing.</p></div>`,
});
regTool('section',{label:'Section cut',group:'draft',icon:I.section,mode:'two',
  hint:n=>n?html`Click the other end of the cut line. It snaps square to the plan; use the panel to flip which way it looks.`:html`<b>Section cut:</b> click where the cut line starts. Every cut you draw makes a building section sheet.`,
  place:(ctx,[a,b])=>{if(dist(a,b)<24)return null;const horiz=Math.abs(b.x-a.x)>=Math.abs(b.y-a.y);const B={x:horiz?b.x:a.x,y:horiz?a.y:b.y};const used=new Set((ctx.p.sections||[]).map(s=>s.label));let L='A';for(const c of 'ABCDEFGHJKLMNP')if(!used.has(c)){L=c;break;}
    const s={id:uid('sc'),level:ctx.lv.id,a,b:B,look:1,label:L,status:'new'};return {p:{...ctx.p,sections:[...(ctx.p.sections||[]),s]},sel:{kind:'section',id:s.id},tool:'select'};}});
addToolToGroup('draft','section');
// a drawn cut as the spec the section sheet uses
function sectionSpecFrom(p,s){const horiz=Math.abs(s.b.x-s.a.x)>=Math.abs(s.b.y-s.a.y);const lv=groundLevel(p);const B=planBounds(p,lv.id);
  // looking direction is the normal on the "look" side; ELEV_VIEWS.dir points from the viewer into the building
  const d={x:s.b.x-s.a.x,y:s.b.y-s.a.y};const L=Math.hypot(d.x,d.y)||1;const n={x:-d.y/L*(s.look||1),y:d.x/L*(s.look||1)};
  if(horiz){return {axis:'y',c:s.a.y,view:n.y>0?'north':'south',B,label:s.label};}return {axis:'x',c:s.a.x,view:n.x>0?'west':'east',B,label:s.label};}

/* ---- command line ---- */
const CMD_TOOLS={l:'line',line:'line',pl:'pline',pline:'pline',polyline:'pline',rec:'rect',rect:'rect',rectangle:'rect',c:'circle',circle:'circle',a:'arc',arc:'arc',spl:'spline',spline:'spline',h:'hatch',hatch:'hatch',fill:'hatch',
  w:'wall',wall:'wall',r:'room',room:'room',d:'door',door:'door',n:'window',window:'window',dim:'dim',dimension:'dim',t:'note',text:'note',note:'note',v:'select',select:'select',s:'stair',stair:'stair',roof:'roof',deck:'deck',porch:'porch',steps:'steps',col:'column',column:'column',rail:'rail',
  m:'op-move',move:'op-move',co:'op-copy',cp:'op-copy',copy:'op-copy',ro:'op-rotate',rotate:'op-rotate',mi:'op-mirror',mirror:'op-mirror',mc:'op-mirrorcopy',ar:'op-array',array:'op-array',o:'op-offset',offset:'op-offset',tr:'op-trim',trim:'op-trim',ex:'op-extend',extend:'op-extend',
  ad:'autodim',autodim:'autodim',sec:'section',section:'section',me:'measure',measure:'measure',cab:'cabrun',curve:'curvewall',dormer:'dormer',autoroof:'autoroof'};
function parseCoord(txt,last){const t=txt.trim().replace(/\s+/g,'');if(!t)return null;const rel=t.startsWith('@');const s=rel?t.slice(1):t;
  if(s.includes('<')){const [Ls,As]=s.split('<');const L=parseLen(Ls,'ft');const A=parseFloat(As);if(L==null||!isFinite(A)||!last)return null;const a=A*Math.PI/180;return {x:last.x+L*Math.cos(a),y:last.y-L*Math.sin(a)};}
  if(s.includes(',')){const [xs,ys]=s.split(',');const x=parseLen(xs,'ft'),y=parseLen(ys,'ft');if(x==null||y==null)return null;if(rel){if(!last)return null;return {x:last.x+x,y:last.y+y};}return {x,y};}
  return null;}
function parseCommand(text){const t=text.trim();if(!t)return null;const [w0,...rest]=t.split(/\s+/);const w=w0.toLowerCase();const arg=rest.join(' ');
  if(/^@|^-?[\d.]+.*[,<]/.test(t))return {type:'coord',text:t};
  if(/^[\d.'"\- \/]+$/.test(t))return {type:'length',text:t};
  if(w==='u'||w==='undo')return {type:'undo'};if(w==='redo')return {type:'redo'};if(w==='z'||w==='zoom'||w==='fit')return {type:'fit'};
  if(w==='e'||w==='erase'||w==='del'||w==='delete')return {type:'erase'};
  if(w==='grid')return {type:'grid',val:parseLen(arg||'6"','in')};
  if(w==='osnap'||w==='os')return {type:'osnap',arg};
  if(w==='layer'||w==='la')return {type:'layer',arg};
  if((w==='ro'||w==='rotate')&&arg&&isFinite(parseFloat(arg)))return {type:'rotate',deg:parseFloat(arg)};
  if((w==='o'||w==='offset')&&arg)return {type:'offset',val:parseLen(arg,'ft'),tool:'op-offset'};
  if((w==='ar'||w==='array')&&arg)return {type:'array',n:Math.max(2,parseInt(arg)||3),tool:'op-array'};
  const tool=CMD_TOOLS[w]||(XTOOLS[w]?w:null);if(tool)return {type:'tool',id:tool};
  return {type:'unknown',text:t};}
/* ---- display popover: what shows, snaps, drafting layers ---- */
function DisplayPopover({p,commit,onClose}){const SH=showOf(p);const OS=osnapModes(p);const L=layersOf(p);const cur=p.settings?.cadLayer||'L-DRAFT';
  const setShow=(k,v)=>commit({...p,settings:{...p.settings,show:{...(p.settings.show||{}),[k]:v}}});const setOs=(k,v)=>commit({...p,settings:{...p.settings,osnap:{...OS,[k]:v}}});
  const upL=(id,patch)=>commit({...p,layers:L.map(l=>l.id===id?{...l,...patch}:l)});
  return html`<div className="layerpop" role="dialog" aria-label="Display">
    <div className="row" style=${{justifyContent:'space-between'}}><b>Display</b><button className="btn" onClick=${onClose} aria-label="Close">✕</button></div>
    <h4>Show in the plan</h4>${SHOW_KEYS.map(([k,l])=>html`<label key=${k} className="check"><input type="checkbox" checked=${SH[k]} onChange=${e=>setShow(k,e.target.checked)}/> ${l}</label>`)}
    <h4>Snaps</h4><div className="osnapbar">${OSNAP_LIST.map(([k,l])=>html`<button key=${k} className=${'chip'+(OS[k]?' on':'')} onClick=${()=>setOs(k,!OS[k])}>${l}</button>`)}</div>
    <h4>Drafting layers</h4>${L.map(l=>html`<div key=${l.id} className="layerrow"><input type="radio" name="curlayer" checked=${cur===l.id} onChange=${()=>commit({...p,layers:L,settings:{...p.settings,cadLayer:l.id}})} aria-label=${'Draw on '+l.name}/>
      <input type="color" value=${l.color||'#1d5fd1'} onChange=${e=>upL(l.id,{color:e.target.value})} aria-label=${l.name+' color'}/><span className="grow" style=${{flex:1}}>${l.name}</span>
      <button className=${'chip'+(l.on!==false?' on':'')} onClick=${()=>upL(l.id,{on:l.on===false})} title="Show or hide">${l.on!==false?'On':'Off'}</button>
      <button className=${'chip'+(l.lock?' on':'')} onClick=${()=>upL(l.id,{lock:!l.lock})} title="Lock so it cannot be picked">${l.lock?'Locked':'Lock'}</button>
      <button className=${'chip'+(l.print!==false?' on':'')} onClick=${()=>upL(l.id,{print:l.print===false})} title="Print on the plan sheets">Print</button></div>`)}
    <div className="row"><button className="btn" onClick=${()=>{const n={id:'L-'+Math.random().toString(36).slice(2,7).toUpperCase(),name:'Layer '+(L.length+1),color:'#'+Math.floor(Math.random()*0xaaaaaa).toString(16).padStart(6,'0')};commit({...p,layers:[...L,n],settings:{...p.settings,cadLayer:n.id}});}}>New layer</button></div>
    <p className="note">Type LAYER name in the command line to switch or create a layer. Lines, arcs, circles, splines and fills go on the current layer.</p></div>`;}
