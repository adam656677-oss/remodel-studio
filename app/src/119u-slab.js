/* ======================= countertop slab layout: pieces on slabs, seams and grain ======================= */
// Each countertop is cut at its seams into pieces; pieces are laid on slabs of the chosen material (or a photo of the real slab),
// grain runs along each piece's length unless turned. Placements save with the project and print on sheet A5.4.
function clipHalf(poly,a,b,keepLeft){const side=q=>((b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x))*(keepLeft?1:-1);const out=[];
  for(let i=0;i<poly.length;i++){const P=poly[i],Q=poly[(i+1)%poly.length];const sp=side(P),sq=side(Q);if(sp>=0)out.push(P);if((sp>=0)!==(sq>=0)){const t=sp/(sp-sq);out.push({x:P.x+(Q.x-P.x)*t,y:P.y+(Q.y-P.y)*t});}}
  const c=cleanPoly(out);return c.length>=3?c:null;}
function cleanPoly(P){let a=P.filter((q,i)=>{const r=P[(i+1)%P.length];return Math.hypot(q.x-r.x,q.y-r.y)>0.01;});let changed=true;while(changed&&a.length>3){changed=false;for(let i=0;i<a.length;i++){const p0=a[(i-1+a.length)%a.length],p1=a[i],p2=a[(i+1)%a.length];const cr=(p1.x-p0.x)*(p2.y-p1.y)-(p1.y-p0.y)*(p2.x-p1.x);if(Math.abs(cr)<1e-6){a.splice(i,1);changed=true;break;}}}return a;}
const polyA=pts=>Math.abs(pts.reduce((s,q,i)=>{const r=pts[(i+1)%pts.length];return s+q.x*r.y-r.x*q.y;},0)/2);
function slabPieces(p){const out=[];const added=[];for(const lv of sortedLevels(p)){let pcs=[];try{pcs=ctrPieces(p,lv.id);}catch(e){continue;}
  pcs.forEach((pc,ci)=>{let parts=[cleanPoly(pc.c.pts.map(q=>({x:q.x,y:q.y})))];
    for(const [a,b] of pc.seams){const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const next=[];for(const poly of parts){if(!inPoly(m.x,m.y,poly.map(q=>[q.x,q.y]))){next.push(poly);continue;}const L=clipHalf(poly,a,b,true),R=clipHalf(poly,a,b,false);if(L&&polyA(L)>4)next.push(L);if(R&&polyA(R)>4)next.push(R);}parts=next;}
    const maxL=(slabOpt(p).w||120)-2;const longest=poly=>{let best=null;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];const L=dist(a,b);if(!best||L>best.L)best={L,u:{x:(b.x-a.x)/L,y:(b.y-a.y)/L}};}return best.u;};
    for(let guard=0;guard<6;guard++){const next=[];let split=false;for(const poly of parts){const u=longest(poly);const us=poly.map(q=>q.x*u.x+q.y*u.y);const u0=Math.min(...us),u1=Math.max(...us);if(u1-u0<=maxL){next.push(poly);continue;}
      const cu=u0+(u1-u0)/2;const c=poly.reduce((a,q)=>({x:a.x+q.x/poly.length,y:a.y+q.y/poly.length}),{x:0,y:0});const off=cu-(c.x*u.x+c.y*u.y);const A={x:c.x+u.x*off,y:c.y+u.y*off},B={x:A.x-u.y,y:A.y+u.x};
      const L=clipHalf(poly,A,B,true),R=clipHalf(poly,A,B,false);if(L&&R){next.push(L,R);split=true;added.push([A,B]);}else next.push(poly);}parts=next;if(!split)break;}
    parts.forEach((poly,j)=>{let best=null;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];const L=dist(a,b);if(!best||L>best.L)best={L,u:{x:(b.x-a.x)/L,y:(b.y-a.y)/L}};}
      const u=best.u,v={x:-u.y,y:u.x};const us=poly.map(q=>q.x*u.x+q.y*u.y),vs=poly.map(q=>q.x*v.x+q.y*v.y);const u0=Math.min(...us),v0=Math.min(...vs);
      const loc=poly.map((q,i)=>[us[i]-u0,vs[i]-v0]);out.push({key:`${lv.id}:${ci}:${j}`,lv:lv.id,poly,loc,L:Math.max(...us)-u0,D:Math.max(...vs)-v0,sf:polyA(poly)/144,u,v,u0,v0});});});}
  out.added=added;return out;}
function slabOpt(p){const cs=counterSet(p);const sl=SLAB[cs.mat]||SLAB.quartz;const S=p.settings?.slab||{};return {mat:cs.mat,w:S.w||sl[0],h:S.h||sl[1],img:S.img||null,place:S.place||{},kerf:S.kerf??0.25,edge:S.edge??1};}
// shelf packing: longest pieces first, grain along the slab length
function autoNest(pieces,O){const place={};const slabs=[];const fit=(pc)=>{for(let si=0;si<slabs.length;si++){const S=slabs[si];for(const sh of S.shelves){if(sh.h>=pc.D&&sh.x+pc.L<=O.w-O.edge){const at={slab:si,x:sh.x,y:sh.y,rot:0};sh.x+=pc.L+O.kerf;return at;}}
      const used=S.shelves.reduce((s,sh)=>Math.max(s,sh.y+sh.h),O.edge);if(used+pc.D<=O.h-O.edge&&pc.L<=O.w-2*O.edge){const sh={y:used+O.kerf,h:pc.D,x:O.edge+pc.L+O.kerf};S.shelves.push(sh);return {slab:si,x:O.edge,y:sh.y,rot:0};}}
    if(pc.L>O.w-2*O.edge||pc.D>O.h-2*O.edge)return null;const S={shelves:[{y:O.edge,h:pc.D,x:O.edge+pc.L+O.kerf}]};slabs.push(S);return {slab:slabs.length-1,x:O.edge,y:O.edge,rot:0};};
  for(const pc of [...pieces].sort((a,b)=>b.L-a.L||b.D-a.D)){const at=fit(pc);if(at)place[pc.key]=at;}return place;}
function slabSummary(p){const O=slabOpt(p);const P=slabPieces(p);const place={...autoNest(P,O),...O.place};const n=P.reduce((m,pc)=>place[pc.key]?Math.max(m,place[pc.key].slab+1):m,0);const area=P.reduce((s,pc)=>s+pc.sf,0);
  const tooBig=P.filter(pc=>!place[pc.key]);return {O,P,place,slabs:n,area,yieldPct:n?Math.round(area/(n*O.w*O.h/144)*100):0,tooBig};}
const pieceXY=(pc,at)=>{const r=(at.rot||0)%360;return pc.loc.map(([x,y])=>{let X=x,Y=y;if(r===90){X=pc.D-y;Y=x;}else if(r===180){X=pc.L-x;Y=pc.D-y;}else if(r===270){X=y;Y=pc.L-x;}return [at.x+X,at.y+Y];});};
function SlabModal({p,commit,onClose}){const Sm=slabSummary(p);const {O,P}=Sm;const [place,setPlace]=useState(Sm.place);const [pick,setPick]=useState(null);const drag=useRef(null);const svg=useRef(null);
  const save=(pl,extra={})=>commit({...p,settings:{...p.settings,slab:{...(p.settings.slab||{}),place:pl,...extra}}});
  const n=Math.max(1,P.reduce((m,pc)=>place[pc.key]?Math.max(m,place[pc.key].slab+1):m,0)+(pick!=null?0:0));const gap=10,sc=Math.min(1,880/(O.w+gap))*1;const W=O.w,Ht=n*(O.h+gap)+O.h;
  const pt=e=>{const r=svg.current.getBoundingClientRect();const k=(W+20)/r.width;return {x:(e.clientX-r.left)*k-10,y:(e.clientY-r.top)*k-10};};
  const down=(e,key)=>{e.stopPropagation();setPick(key);const q=pt(e);drag.current={key,q,at:{...place[key]}};svg.current.setPointerCapture(e.pointerId);};
  const move=e=>{const d=drag.current;if(!d)return;const q=pt(e);let x=d.at.x+(q.x-d.q.x),y=d.at.y+(q.y-d.q.y);let slab=d.at.slab;const abs=y+slab*(O.h+gap);slab=Math.max(0,Math.floor(abs/(O.h+gap)));y=abs-slab*(O.h+gap);setPlace(pl=>({...pl,[d.key]:{...d.at,x:Math.round(x*4)/4,y:Math.round(y*4)/4,slab}}));};
  const up=()=>{if(drag.current){drag.current=null;save(place);}};
  const rot=k=>{const at=place[k];if(!at)return;const pl={...place,[k]:{...at,rot:((at.rot||0)+90)%360}};setPlace(pl);save(pl);};
  const auto=()=>{const pl=autoNest(P,O);setPlace(pl);save(pl);};
  const onImg=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');const s=Math.min(1,1600/im.width);c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);save(place,{img:c.toDataURL('image/jpeg',0.82)});};im.src=r.result;};r.readAsDataURL(f);};
  const used=[...new Set(Object.values(place).map(a=>a.slab))].length;const area=P.reduce((s,pc)=>s+pc.sf,0);
  const overlap=(()=>{const bad=new Set();const boxes=P.filter(pc=>place[pc.key]).map(pc=>{const xy=pieceXY(pc,place[pc.key]);const xs=xy.map(q=>q[0]),ys=xy.map(q=>q[1]);return {k:pc.key,s:place[pc.key].slab,x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)};});
    for(const a of boxes){if(a.x0<-0.01||a.y0<-0.01||a.x1>O.w+0.01||a.y1>O.h+0.01)bad.add(a.k);for(const b of boxes)if(a!==b&&a.s===b.s&&Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>0.2&&Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0)>0.2)bad.add(a.k);}return bad;})();
  const col='#'+((COUNTER_MATS.find(m=>m[0]===O.mat)||[])[2]||0xd9d6cf).toString(16).padStart(6,'0');
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide rw" role="dialog" aria-label="Countertop slab layout"><h2>Countertop slab layout</h2>
    ${!P.length?html`<p className="note">Place base cabinets first; the countertops are drawn over them.</p>`:html`
    <div className="row"><${Field} label="Slab size" id="sl-w"><span className="row"><${LenInput} id="sl-w" value=${O.w} onChange=${v=>v>24&&save(place,{w:v})}/> x <${LenInput} id="sl-h" value=${O.h} onChange=${v=>v>12&&save(place,{h:v})}/></span><//>
      <label className="btn">Slab photo…<input type="file" accept="image/*" hidden onChange=${onImg}/></label>${O.img?html`<button className="btn" onClick=${()=>save(place,{img:null})}>Remove photo</button>`:null}<button className="btn" onClick=${auto}>Auto-layout</button></div>
    <svg ref=${svg} className="slab-svg" viewBox=${`-10 -10 ${W+20} ${Ht+20}`} onPointerMove=${move} onPointerUp=${up} role="img" aria-label="Slabs with countertop pieces">
      <defs>${O.img?html`<pattern id="slabimg" patternUnits="userSpaceOnUse" width=${O.w} height=${O.h}><image href=${O.img} width=${O.w} height=${O.h} preserveAspectRatio="none"/></pattern>`:null}</defs>
      ${Array.from({length:n+1},(_,i)=>html`<g key=${'s'+i} transform=${`translate(0 ${i*(O.h+gap)})`}><rect width=${O.w} height=${O.h} fill=${O.img?'url(#slabimg)':col} stroke="#555" strokeWidth="0.4" opacity=${i===n?0.35:1}/><text x="2" y="5" className="slab-t">Slab ${i+1}${i===n?' (spare)':''}</text></g>`)}
      ${P.map((pc,i)=>{const at=place[pc.key];if(!at)return null;const xy=pieceXY(pc,at).map(([x,y])=>[x,y+at.slab*(O.h+gap)]);const cx=xy.reduce((s,q)=>s+q[0],0)/xy.length,cy=xy.reduce((s,q)=>s+q[1],0)/xy.length;const r=(at.rot||0)*Math.PI/180;const gx=Math.cos(r)*10,gy=Math.sin(r)*10;
        return html`<g key=${pc.key} className=${'slab-pc'+(pick===pc.key?' on':'')+(overlap.has(pc.key)?' bad':'')} onPointerDown=${e=>down(e,pc.key)} onDoubleClick=${()=>rot(pc.key)}><polygon points=${xy.map(q=>q.join(',')).join(' ')}/>
          <line x1=${cx-gx} y1=${cy-gy} x2=${cx+gx} y2=${cy+gy} className="slab-grain"/><text x=${cx} y=${cy+5} textAnchor="middle" className="slab-n">${i+1}</text></g>`;})}</svg>
    <div className="rw-stats"><div><span>Slabs</span><b>${used}</b><small>${fmtLen(O.w)} x ${fmtLen(O.h)} ${(COUNTER_MATS.find(m=>m[0]===O.mat)||['',O.mat])[1]}</small></div><div><span>Countertop</span><b>${area.toFixed(1)} sq ft</b><small>${P.length} pieces · yield ${used?Math.round(area/(used*O.w*O.h/144)*100):0}%</small></div></div>
    ${overlap.size?html`<p className="note bad">${overlap.size} piece${overlap.size===1?' overlaps another or runs':'s overlap or run'} off the slab (shown red).</p>`:null}${Sm.tooBig.length?html`<p className="note bad">${Sm.tooBig.length} piece${Sm.tooBig.length===1?' is':'s are'} longer than a slab: add a seam on the countertop shop drawing.</p>`:null}
    <p className="note">Drag pieces to match the veining; double-click a piece to turn it 90°. The line on each piece shows the grain direction.</p>`}
    <div className="row"><span className="spacer"></span><button className="btn primary" onClick=${onClose}>Done</button></div></div></div>`;}
EXTRA_DIALOGS.slab=SlabModal;
function slabSheet(p){const Sm=slabSummary(p);if(!Sm.P.length)return null;const P=PAPERS[p.sheet?.paper]||PAPERS.tabloid;const k=P.k;const dl=DL();const A=sheetFrame(dl,P,p,'A5.4','Countertop slab layout','');const {O}=Sm;
  const n=Math.max(1,Sm.slabs);const sc=Math.min((A.x1-A.x0-4*k)/O.w,(A.y1-A.y0-0.6*k)/(n*(O.h+12)));let y0=A.y0+0.3*k;
  for(let s=0;s<n;s++){const ox=A.x0+0.3*k,oy=y0+s*(O.h+12)*sc;dl.poly([[ox,oy],[ox+O.w*sc,oy],[ox+O.w*sc,oy+O.h*sc],[ox,oy+O.h*sc]],{stroke:INK,w:0.6,fill:'#f2f2f2'});dl.text(ox,oy-0.04*k,`SLAB ${s+1}`,{size:5*k,bold:true});
    Sm.P.forEach((pc,i)=>{const at=Sm.place[pc.key];if(!at||at.slab!==s)return;const xy=pieceXY(pc,at).map(([x,y])=>[ox+x*sc,oy+y*sc]);dl.poly(xy,{stroke:INK,w:0.5,fill:'#ffffff'});const cx=xy.reduce((a,q)=>a+q[0],0)/xy.length,cy=xy.reduce((a,q)=>a+q[1],0)/xy.length;
      const r=(at.rot||0)*Math.PI/180;dl.line(cx-Math.cos(r)*0.15*k,cy-Math.sin(r)*0.15*k,cx+Math.cos(r)*0.15*k,cy+Math.sin(r)*0.15*k,0.4,{color:MID});dl.text(cx,cy+0.05*k,String(i+1),{size:6*k,bold:true,anchor:'middle'});});}
  let y=A.y0+0.3*k;const x=A.x1-3.4*k;dl.text(x,y,'PIECES',{size:7*k,bold:true});y+=0.2*k;Sm.P.forEach((pc,i)=>{dl.text(x,y,`${String(i+1).padStart(2)}  ${fmtLen(pc.L)} x ${fmtLen(pc.D)}  ${pc.sf.toFixed(1)} sf`,{size:4.8*k});y+=0.15*k;});
  y+=0.1*k;dl.text(x,y,`${Sm.slabs} slab${Sm.slabs===1?'':'s'} ${fmtLen(O.w)} x ${fmtLen(O.h)}, yield ${Sm.yieldPct}%.`,{size:4.8*k,bold:true});y+=0.15*k;dl.text(x,y,'Line on each piece = grain direction. Fabricator to template on site.',{size:4.4*k,color:MID});
  return {id:'s-A5.4',no:'A5.4',title:'Countertop slab layout',w:P.w,h:P.h,items:dl.items,scale:''};}
{const _bs=buildSheets;buildSheets=function(p){const out=_bs(p);try{const s=slabSheet(p);if(s){const i=out.findIndex(x=>x.no==='A5.3');out.splice(i>=0?i+1:out.length,0,s);}}catch(e){console.warn('slab sheet',e);}return out;};}
