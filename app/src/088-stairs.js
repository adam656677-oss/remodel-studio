/* ======================= stairs: straight, L, U, winders and spiral ======================= */
// x,y = middle of the bottom step's front edge; dir = direction you walk up (N/E/S/W) or a = angle in radians.
const STAIR_SHAPES=[['straight','Straight'],['L','L-shaped with landing'],['Lw','L-shaped with winders'],['U','U-shaped (switchback)'],['spiral','Spiral']];
function stairDir(s){if(s.a!=null)return {x:Math.cos(s.a),y:Math.sin(s.a)};return DIRS[s.dir]||DIRS.N;}
function stairGeo(p,s){
  const lv=lvlOf(p,s.level)||p.levels[0];const up=levelAbove(p,lv);const rise=s.rise??(up?up.elevation-lv.elevation:lv.height+FLOOR_DEPTH);
  const shape=s.shape||'straight';const maxR=shape==='spiral'?9.5:MAX_RISER;const N=Math.max(2,Math.ceil(rise/maxR-1e-9));const rh=rise/N;
  const T=s.tread||MIN_TREAD,W=s.width||36,hw=W/2;const d=stairDir(s);const n={x:-d.y,y:d.x};const turn=s.turn==='left'?-1:1;
  const P=(o,a,c)=>({x:o.x+d.x*a+n.x*c,y:o.y+d.y*a+n.y*c});const O={x:s.x,y:s.y};
  const steps=[];const landings=[];const path=[];const rails=[];
  const rect=(o,dd,a0,a1,c0,c1)=>{const nn={x:-dd.y,y:dd.x};const Q=(a,c)=>({x:o.x+dd.x*a+nn.x*c,y:o.y+dd.y*a+nn.y*c});return [Q(a0,c0),Q(a1,c0),Q(a1,c1),Q(a0,c1)];};
  let k=0; // step index (top of step k+1 is at (k+1)*rh)
  if(shape==='straight'){for(let i=0;i<N-1;i++)steps.push({poly:rect(O,d,i*T,(i+1)*T,-hw,hw),z:(i+1)*rh,nose:[P(O,i*T,-hw),P(O,i*T,hw)]});path.push(P(O,0,0),P(O,(N-1)*T,0));
    rails.push({side:1,pts:[...Array(N).keys()].map(i=>({...P(O,i*T,hw-2),z:i*rh}))},{side:-1,pts:[...Array(N).keys()].map(i=>({...P(O,i*T,-hw+2),z:i*rh}))});}
  else if(shape==='L'||shape==='Lw'){const n1=Math.max(2,Math.min(N-2,s.split??Math.round(N/2)));const winders=shape==='Lw'?Math.max(2,Math.min(4,s.winders||3)):0;
    const f1=n1-1;for(let i=0;i<f1;i++)steps.push({poly:rect(O,d,i*T,(i+1)*T,-hw,hw),z:(i+1)*rh,nose:[P(O,i*T,-hw),P(O,i*T,hw)]});k=f1;
    const a1=f1*T;const d2={x:n.x*turn,y:n.y*turn};const n2={x:-d2.y,y:d2.x};
    if(!winders){landings.push({poly:rect(O,d,a1,a1+W,-hw,hw),z:(k+1)*rh});k++;}
    else{const piv=P(O,a1,turn*hw);const A=[P(O,a1,-turn*hw),P(O,a1+W,-turn*hw),P(O,a1+W,turn*hw)];
      const ang0=Math.atan2(A[0].y-piv.y,A[0].x-piv.x),ang1=Math.atan2(A[2].y-piv.y,A[2].x-piv.x);let da=ang1-ang0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
      const ray=t=>{const a=ang0+da*t;const dir={x:Math.cos(a),y:Math.sin(a)};let best=1e9;
        for(const [u,v] of [[A[0],A[1]],[A[1],A[2]]]){const r={x:v.x-u.x,y:v.y-u.y};const den=dir.x*r.y-dir.y*r.x;if(Math.abs(den)<1e-9)continue;const tt=((u.x-piv.x)*r.y-(u.y-piv.y)*r.x)/den,uu=((u.x-piv.x)*dir.y-(u.y-piv.y)*dir.x)/den;if(tt>1e-6&&uu>=-1e-6&&uu<=1+1e-6)best=Math.min(best,tt);}
        return {x:piv.x+dir.x*best,y:piv.y+dir.y*best};};
      for(let i=0;i<winders;i++){const t0=i/winders,t1=(i+1)/winders;const q=[piv,ray(t0)];if(t0<0.5-1e-9&&t1>0.5+1e-9)q.push(A[1]);q.push(ray(t1));k++;steps.push({poly:q,z:k*rh,winder:true,nose:[piv,ray(t0)]});}}
    const zL=k*rh;const o2=P(O,a1+W/2,turn*hw);const R2=(c,i)=>({x:o2.x+d2.x*i*T+n2.x*c,y:o2.y+d2.y*i*T+n2.y*c});const rest=N-1-k;const k0=k;
    for(let i=0;i<rest;i++){k++;steps.push({poly:[R2(-hw,i),R2(-hw,i+1),R2(hw,i+1),R2(hw,i)],z:k*rh,nose:[R2(-hw,i),R2(hw,i)]});}
    path.push(P(O,0,0),P(O,a1+W/2,0),R2(0,rest));
    rails.push({side:turn,pts:[...[...Array(f1+1).keys()].map(i=>({...P(O,i*T,turn*(hw-2)),z:i*rh})),...[...Array(rest+1).keys()].map(i=>({...R2(turn*(hw-2),i),z:(k0+i)*rh}))]});
    rails.push({side:-turn,pts:[...[...Array(f1+1).keys()].map(i=>({...P(O,i*T,-turn*(hw-2)),z:i*rh})),{...P(O,a1+W-2,-turn*(hw-2)),z:zL},{...P(O,a1+W-2,turn*(hw-2)),z:zL},...[...Array(rest+1).keys()].map(i=>({...R2(-turn*(hw-2),i),z:(k0+i)*rh}))]});}
  else if(shape==='U'){const n1=Math.max(2,Math.min(N-2,s.split??Math.round(N/2)));const gap=s.gap??4;const f1=n1-1;
    for(let i=0;i<f1;i++)steps.push({poly:rect(O,d,i*T,(i+1)*T,-hw,hw),z:(i+1)*rh,nose:[P(O,i*T,-hw),P(O,i*T,hw)]});k=f1;
    const a1=f1*T;const Wl=s.landing||W;const side=turn;landings.push({poly:[P(O,a1,-side*hw),P(O,a1+Wl,-side*hw),P(O,a1+Wl,side*(hw+gap+W)),P(O,a1,side*(hw+gap+W))],z:(k+1)*rh});k++;const zL=k*rh;
    const back={x:-d.x,y:-d.y};const o2=P(O,a1,side*(W+gap));const rest=N-1-k;
    for(let i=0;i<rest;i++){k++;steps.push({poly:rect(o2,back,i*T,(i+1)*T,-hw,hw),z:k*rh,nose:[]});}
    path.push(P(O,0,0),P(O,a1+Wl/2,0),P(O,a1+Wl/2,side*(W+gap)),{x:o2.x+back.x*rest*T,y:o2.y+back.y*rest*T});
    rails.push({side:-side,pts:[...[...Array(f1+1).keys()].map(i=>({...P(O,i*T,-side*(hw-2)),z:i*rh})),{...P(O,a1+Wl-2,-side*(hw-2)),z:zL},{...P(O,a1+Wl-2,side*(W+gap+hw-2)),z:zL},...[...Array(rest+1).keys()].map(i=>({...P(o2,-i*T,side*(hw-2)),z:zL+i*rh}))]});
    rails.push({side:side,inner:true,pts:[...[...Array(f1+1).keys()].map(i=>({...P(O,i*T,side*(hw-2)),z:i*rh})),...[...Array(rest+1).keys()].reverse().map(i=>({...P(o2,-i*T,-side*(hw-2)),z:zL+i*rh})).reverse()]});}
  else if(shape==='spiral'){const R=Math.max(26,W)+3;
    const total=(s.sweep||360)*Math.PI/180;const step=total/(N-1);const a0=Math.atan2(-d.y,-d.x);const cen={x:s.x,y:s.y};
    for(let i=0;i<N-1;i++){const t0=a0+turn*i*step,t1=a0+turn*(i+1)*step;const q=[{x:cen.x+3*Math.cos(t0),y:cen.y+3*Math.sin(t0)}];const m=6;for(let j=0;j<=m;j++){const t=t0+(t1-t0)*j/m;q.push({x:cen.x+R*Math.cos(t),y:cen.y+R*Math.sin(t)});}
      q.push({x:cen.x+3*Math.cos(t1),y:cen.y+3*Math.sin(t1)});steps.push({poly:q,z:(i+1)*rh,nose:[q[0],q[1]]});}
    const pts=[];for(let i=0;i<N;i++){const t=a0+turn*i*step;pts.push({x:cen.x+(R-2)*Math.cos(t),y:cen.y+(R-2)*Math.sin(t),z:i*rh});}rails.push({side:1,pts});
    for(let i=0;i<=24;i++){const t=a0+turn*(i/24)*total;path.push({x:cen.x+R*0.6*Math.cos(t),y:cen.y+R*0.6*Math.sin(t)});}
    return {lv,rise,N,rh,T,W,shape,steps,landings,path,rails,center:cen,R,outline:circlePts(cen,R+1),checkT:Math.min(T,(R-12)*step)};}
  const all=[...steps.map(x=>x.poly),...landings.map(x=>x.poly)].flat();const outline=hullPts(all);
  return {lv,rise,N,rh,T,W,shape,steps,landings,path,rails,outline};
}
const circlePts=(c,r,n=32)=>[...Array(n).keys()].map(i=>({x:c.x+r*Math.cos(i/n*2*Math.PI),y:c.y+r*Math.sin(i/n*2*Math.PI)}));
const stairPieces=g=>[...g.steps.map(x=>x.poly),...g.landings.map(x=>x.poly)];
function stairHit(p,s,raw){const g=stairGeo(p,s);return g.shape==='spiral'?Math.hypot(raw.x-g.center.x,raw.y-g.center.y)<=g.R:stairPieces(g).some(q=>ptsIn(raw,q));}
function stairSVG(p,s,S,view,isSel,ghost){const g=stairGeo(p,s);const pl=q=>q.map(v=>S(v.x,v.y).join(',')).join(' ');const cls='st'+(isSel?' st-sel':'')+(ghost?' st-ghost':'');const out=[];
  stairPieces(g).forEach((q,i)=>out.push(html`<polygon key=${'p'+i} points=${pl(q)} className=${cls}/>`));
  if(!ghost&&g.path.length>1){const pts=g.path.map(q=>S(q.x,q.y));const L=pts.length;const B=pts[L-1],A=pts[L-2];const ang=Math.atan2(B[1]-A[1],B[0]-A[0]),ah=8;
    out.push(html`<polyline key="path" points=${pts.map(q=>q.join(',')).join(' ')} className="st" fill="none"/>`,html`<polygon key="ah" className="st-arrow" points=${`${B[0]},${B[1]} ${B[0]-ah*Math.cos(ang-0.45)},${B[1]-ah*Math.sin(ang-0.45)} ${B[0]-ah*Math.cos(ang+0.45)},${B[1]-ah*Math.sin(ang+0.45)}`}/>`);
    if(view.s>0.5){const [x,y]=pts[0];out.push(html`<text key="t" x=${x} y=${y+14} textAnchor="middle" className="dimt halo">UP ${g.N}R</text>`);}}
  if(ghost){const c=g.outline.reduce((a,q)=>({x:a.x+q.x/g.outline.length,y:a.y+q.y/g.outline.length}),{x:0,y:0});const [x,y]=S(c.x,c.y);out.push(html`<text key="dn" x=${x} y=${y} textAnchor="middle" className="dimt halo">DN · OPEN BELOW</text>`);}
  // 4'-0" cut line on the floor it starts from
  if(!ghost&&g.shape!=='spiral'){const cut=g.steps.find(st=>st.z>=48);if(cut&&cut.nose.length===2){const [a,b]=cut.nose;const A=S(a.x,a.y),B=S(b.x,b.y);out.push(html`<line key="cut" x1=${A[0]} y1=${A[1]-6} x2=${B[0]} y2=${B[1]+6} className="st-cut"/>`);}}
  return out;}
function stairDL(dl,p,s,PT,k){const g=stairGeo(p,s);for(const q of stairPieces(g))dl.poly(q.map(v=>PT(v.x,v.y)),{stroke:INK,w:0.5,fill:'#ffffff'});
  const pts=g.path.map(q=>PT(q.x,q.y));if(pts.length>1){dl.poly(pts,{stroke:INK,w:0.5,close:false});const B=pts[pts.length-1],A=pts[pts.length-2];const ang=Math.atan2(B[1]-A[1],B[0]-A[0]),ah=0.08*k;dl.poly([B,[B[0]-ah*Math.cos(ang-0.4),B[1]-ah*Math.sin(ang-0.4)],[B[0]-ah*Math.cos(ang+0.4),B[1]-ah*Math.sin(ang+0.4)]],{fill:INK});
    dl.text(pts[0][0],pts[0][1]+0.14*k,`UP ${g.N}R`,{size:6*k,bold:true,anchor:'middle'});}
  for(const r of g.rails)dl.poly(r.pts.map(q=>PT(q.x,q.y)),{stroke:INK,w:0.35,close:false,dash:[0.04,0.025]});}
function stair3D(p,lv,s,add,std,sel,mSel){const g=stairGeo(p,s);const e0=lv.elevation;const isSel=sel&&(sel.id===s.id);const c=s.color?hexNum(s.color):0xb08454;const m=isSel?mSel:std('stair-'+c,c,{roughness:.8});const rc=std('st-riser',0xf4f2ec,{roughness:.7});
  const ext=(poly,z0,z1,mat)=>{const sh=new THREE.Shape(poly.map(q=>new THREE.Vector2(q.x*IN,q.y*IN)));const geo=new THREE.ExtrudeGeometry(sh,{depth:Math.max(0.2,z1-z0)*IN,bevelEnabled:false});geo.rotateX(Math.PI/2);const mm=new THREE.Mesh(geo,mat);mm.position.set(0,(e0+z1)*IN,0);mm.castShadow=true;mm.receiveShadow=true;return add.raw?add.raw(mm):add(geo,mat,0,(e0+z1)*IN,0,0);};
  const closed=s.closed!==false&&g.shape!=='spiral';
  for(const st of g.steps){ext(st.poly,st.z-1.25,st.z,m);ext(st.poly,closed?0:st.z-g.rh,st.z-1.25,closed?rc:rc);}
  for(const l of g.landings){ext(l.poly,closed?0:l.z-10,l.z,m);}
  if(g.shape==='spiral')add(new THREE.CylinderGeometry(2*IN,2*IN,(g.rise+36)*IN,12),std('st-post',0x3a3d40,{metalness:.5,roughness:.4}),g.center.x*IN,(e0+(g.rise+36)/2)*IN,g.center.y*IN,0);
  // handrails 34" to 38" above the nosings
  const want=s.rails||'auto';const hm=std('st-rail',s.railColor?hexNum(s.railColor):0x6b4a2f,{roughness:.6});
  const rails=want==='none'?[]:want==='auto'?(g.N>=4?g.rails.slice(0,g.shape==='spiral'?1:(s.open?2:1)):[]):want==='both'?g.rails:g.rails.filter(r=>(want==='right'?1:-1)===r.side);
  for(const r of rails){for(let i=0;i+1<r.pts.length;i++){const a=r.pts[i],b=r.pts[i+1];const v=new THREE.Vector3((b.x-a.x)*IN,(b.z-a.z)*IN,(b.y-a.y)*IN);const L=v.length();if(L<0.01)continue;
      const cyl=add(new THREE.CylinderGeometry(0.85*IN,0.85*IN,L,10),hm,(a.x+b.x)/2*IN,(e0+(a.z+b.z)/2+36)*IN,(a.y+b.y)/2*IN,0,false);cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());}
    if(s.open||g.shape==='spiral')for(const q of r.pts)add(new THREE.BoxGeometry(1.5*IN,36*IN,1.5*IN),std('st-bal',0xf4f2ec,{roughness:.6}),q.x*IN,(e0+q.z+18)*IN,q.y*IN,0,false);}
}
function stairHole(p,lvAbove){ // outlines of stairs that arrive at this level (to cut the floor)
  const out=[];for(const s of p.stairs){const lv=lvlOf(p,s.level);if(!lv)continue;const up=levelAbove(p,lv);if(!up||up.id!==lvAbove.id)continue;const g=stairGeo(p,s);out.push(g.shape==='spiral'?circlePts(g.center,g.R+2,24):offsetPoly(g.outline,1));}return out;}
function stairExtraChecks(p,s,add,T,pt){const g=stairGeo(p,s);const R=(c,t)=>({set:'IRC',code:c,title:t});
  if(g.shape==='spiral'){if(g.W<26)add('error',R('R311.7.10.1','Spiral stair width'),'Spiral stair too narrow','Spiral stairs need 26" clear width.',T,pt,s.level);
    if(g.rh>9.5+1e-6)add('error',R('R311.7.10.1','Spiral stair riser'),'Spiral stair risers too tall','Spiral stair risers may not exceed 9-1/2".',T,pt,s.level);
    if(g.checkT<6.75)add('error',R('R311.7.10.1','Spiral stair tread'),'Spiral stair treads too narrow','Treads need 6-3/4" at the walkline 12" from the narrow edge. Turn the stair through a larger angle or make it wider.',T,pt,s.level);}
  if(g.shape==='Lw'){const ws=g.steps.filter(x=>x.winder);if(ws.length){const piv=ws[0].poly[0];const a0=ws[0].poly[1],a2=ws[ws.length-1].poly[ws[ws.length-1].poly.length-1];
      const u1={x:(a0.x-piv.x),y:(a0.y-piv.y)},u2={x:(a2.x-piv.x),y:(a2.y-piv.y)};const l1=Math.hypot(u1.x,u1.y),l2=Math.hypot(u2.x,u2.y);u1.x/=l1;u1.y/=l1;u2.x/=l2;u2.y/=l2;
      const W1={x:piv.x+u1.x*12,y:piv.y+u1.y*12},Wc={x:piv.x+u1.x*12+u2.x*12,y:piv.y+u1.y*12+u2.y*12},W2={x:piv.x+u2.x*12,y:piv.y+u2.y*12};const path=[W1,Wc,W2];
      const hitLen=q=>{const dir={x:q.x-piv.x,y:q.y-piv.y};let acc=0;for(let i=0;i<2;i++){const A=path[i],B=path[i+1];const r={x:B.x-A.x,y:B.y-A.y};const den=dir.x*r.y-dir.y*r.x;const L=Math.hypot(r.x,r.y);
          if(Math.abs(den)>1e-9){const t=((A.x-piv.x)*r.y-(A.y-piv.y)*r.x)/den,u=((A.x-piv.x)*dir.y-(A.y-piv.y)*dir.x)/den;if(t>0&&u>=-1e-6&&u<=1+1e-6)return acc+u*L;}acc+=L;}return acc;};
      for(const st of ws){const d1=hitLen(st.poly[1]),d2=hitLen(st.poly[st.poly.length-1]);const walk=Math.abs(d2-d1);if(walk<10-0.05){add('error',R('R311.7.5.2.1','Winder treads'),'Winder treads too shallow at the walkline',`About ${fmtLen(walk)} at 12" from the narrow end; needs 10". Use fewer winders, a wider stair, or a landing.`,T,pt,s.level);break;}}}}
  // headroom 6'-8" measured from the nosing line (simple check against the floor above)
  const lv=lvlOf(p,s.level);const up=lv&&levelAbove(p,lv);if(up){const head=up.elevation-lv.elevation-FLOOR_DEPTH;// floor above sits over the stair unless cut away
    const holes=stairHole(p,up);if(!holes.length&&head<80)add('error',R('R311.7.2','Headroom'),'Stair headroom','There must be at least 6\'-8" of headroom over the stair.',T,pt,s.level);}
  const want=s.rails||'auto';if(g.N>=4&&want==='none')add('error',R('R311.7.8','Handrails'),'Stair needs a handrail','Flights with four or more risers need a handrail on at least one side, 34" to 38" above the nosings.',T,pt,s.level);}
/* ---- stair tools for each shape ---- */
I.stairL=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 21V9h8"/><path d="M8 21V13h12"/><path d="M4 17h4M4 13h4M12 9v4M16 9v4"/><path d="M4 9V3h8v6"/></svg>`;
I.stairU=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21V4h18v17"/><path d="M11 21V8M13 21V8"/><path d="M3 17h8M3 13h8M13 17h8M13 13h8"/></svg>`;
I.stairS=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="1.5"/><path d="M12 12L21 12M12 12l6.4-6.4M12 12V3M12 12L5.6 5.6"/></svg>`;
for(const [id,label,shape,ic] of [['stairL','L-shaped stair','L','stairL'],['stairLw','L stair with winders','Lw','stairL'],['stairU','U-shaped stair','U','stairU'],['stairSp','Spiral stair','spiral','stairS']]){
  regTool(id,{label,group:'stairs',icon:I[ic],mode:'click',hint:()=>html`<b>${label}:</b> click where the bottom step starts. It runs up the page; press E to turn it and set the turn, split and width in the panel.`,
    place:(ctx,[pt])=>{const s={id:uid('st'),level:ctx.lv.id,x:pt.x,y:pt.y,width:shape==='spiral'?60:36,tread:MIN_TREAD,dir:'N',rise:null,shape,turn:'right'};return {p:{...ctx.p,stairs:[...ctx.p.stairs,s]},sel:{kind:'stair',id:s.id},tool:'select'};}});
  addToolToGroup('stairs',id);}
