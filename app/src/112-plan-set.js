/* ======================= full plan set ======================= */
function filteredProject(p,mode){
  const keep=s=>mode==='proposed'?(s||'new')!=='demolish':mode==='existing'?(s||'new')!=='new':true;
  return {...p,walls:p.walls.filter(w=>keep(w.status)),openings:p.openings.filter(o=>keep(o.status)),fixtures:(p.fixtures||[]).filter(f=>keep(f.status))};
}
const hasRemodel=p=>p.walls.some(w=>w.status==='existing'||w.status==='demolish')&&p.walls.some(w=>w.status!=='existing');
const SITE_SCALES=[...SCALES,[0.05,'1" = 20\'-0"'],[1/30,'1" = 30\'-0"'],[0.025,'1" = 40\'-0"'],[1/60,'1" = 60\'-0"'],[0.01,'1" = 100\'-0"']].sort((a,b)=>b[0]-a[0]);
function planSheet(P,p,no,title,B,R,draw,reserve=0,scales=SCALES){
  const k=P.k,below=0.6*k; const dl0=DL(); const A0=sheetFrame(dl0,P,p,no,title,''); const fitW=A0.x1-A0.x0-reserve, fitH=A0.y1-A0.y0;
  const s=pickScale(fitW,fitH,sc=>(B.x1-B.x0)*sc+2*R,sc=>(B.y1-B.y0)*sc+2*R+below,p.sheet?.scale,scales);
  const sc=s[0]/12,dw=(B.x1-B.x0)*sc,dh=(B.y1-B.y0)*sc; const ox=A0.x0+Math.max(R,(fitW-dw)/2), oy=A0.y0+Math.max(R,(fitH-below-dh)/2);
  const dl=DL(); sheetFrame(dl,P,p,no,title,s[1]);
  const X=x=>ox+(x-B.x0)*sc, Y=y=>oy+(y-B.y0)*sc;
  draw(dl,{sc,ox,oy,X,Y,PT:(x,y)=>[X(x),Y(y)],k,B,A:A0});
  drawingTitle(dl,ox,Math.min(A0.y1-0.12*k,oy+dh+R+0.15*k),title,s[1],k,true,s[0],siteOf(p).bearing);
  return {id:'s-'+no,no,title,w:P.w,h:P.h,items:dl.items,scale:s[1]};
}
/* ---- section cut ---- */
function sectionSpec(p){
  const lv=groundLevel(p); if(!lv)return null; const B=planBounds(p,lv.id); if(!p.walls.length)return null;
  const big=[...p.roofs].sort((a,b)=>b.w*b.h-a.w*a.h)[0]; let axis=big?roofAxis(big):((B.x1-B.x0)>=(B.y1-B.y0)?'x':'y');
  // cut across the ridge, through the middle, nudged off any wall that sits exactly on the line
  let c=axis==='x'?(B.x0+B.x1)/2:(B.y0+B.y1)/2;
  for(let tries=0;tries<8;tries++){const near=p.walls.some(w=>{const a=axis==='x'?w.x1:w.y1,b=axis==='x'?w.x2:w.y2;return Math.abs(a-b)<0.5&&Math.abs(a-c)<w.thick/2+3;})||p.rooms.some(r=>r.pts.some(q=>Math.abs((axis==='x'?q[0]:q[1])-c)<1));if(!near)break;c+=24;}
  return {axis,c,view:axis==='x'?'west':'north',B};
}
function drawSectionMark(dl,spec,X,Y,B,k){
  if(!spec)return; const ext=0.35*k/1; let a,b,dir;
  const o=1.25*k;if(spec.axis==='x'){a=[X(spec.c),Y(B.y0)-o];b=[X(spec.c),Y(B.y1)+o];dir=[1,0];}else{a=[X(B.x0)-o,Y(spec.c)];b=[X(B.x1)+o,Y(spec.c)];dir=[0,1];}
  dl.line(...a,...b,1.1,{dash:[0.18*k,0.05*k,0.03*k,0.05*k]});
  for(const q of [a,b]){const r=0.11*k;dl.circle(q[0],q[1],r,{stroke:INK,fill:'#ffffff',w:0.7});dl.text(q[0],q[1]+0.035*k,'A',{size:6.5*k,bold:true,anchor:'middle'});
    const t=[q[0]+dir[0]*r,q[1]+dir[1]*r];dl.poly([[t[0]+dir[0]*0.12*k,t[1]+dir[1]*0.12*k],[t[0]-dir[1]*0.07*k,t[1]+dir[0]*0.07*k],[t[0]+dir[1]*0.07*k,t[1]-dir[0]*0.07*k]],{fill:INK});}
}
function clipPolyDepth(pts,depth,c){const out=[];for(let i=0;i<pts.length;i++){const A=pts[i],Bq=pts[(i+1)%pts.length];const da=depth(A)-c,db=depth(Bq)-c;
    if(da>=0)out.push(A);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push([A[0]+(Bq[0]-A[0])*t,A[1]+(Bq[1]-A[1])*t,A[2]+(Bq[2]-A[2])*t]);}}return out;}
function sectionData(p,spec){
  const V=ELEV_VIEWS[spec.view]; const dep=pt=>V.depth(pt[0],pt[1]); const cDepth=V.depth(spec.axis==='x'?spec.c:0,spec.axis==='y'?spec.c:0);
  const P=filteredProject(p,'proposed'); const F=elevFaces(P); const faces=[];
  for(const f of F){if(f.n&&(f.n.x*V.dir.x+f.n.y*V.dir.y)>-1e-6)continue;let pts=f.pts;if(pts.every(q=>dep(q)<cDepth-0.01))continue;
    if(pts.some(q=>dep(q)<cDepth))pts=clipPolyDepth(pts,dep,cDepth);if(pts.length<3)continue;
    const holes=(f.holes||[]).map(h=>clipPolyDepth(h,dep,cDepth)).filter(h=>h.length>=3);
    const pr=q=>[V.u(q[0],q[1]),q[2]];const p2=pts.map(pr);const us=p2.map(q=>q[0]);if(Math.max(...us)-Math.min(...us)<0.01&&f.kind!=='roof'&&f.kind!=='gable')continue;
    faces.push({...f,p2,h2:holes.map(h=>h.map(pr)),depth:Math.min(...pts.map(dep))+(f.kind==='window'||f.kind==='door'?0.01:0)});}
  faces.sort((a,b)=>b.depth-a.depth);
  // cut walls
  const cuts=[];const lvls=sortedLevels(P);
  for(const lv of lvls){const ws=P.walls.filter(w=>w.level===lv.id);const J=wallJoins(ws);
    for(const w of ws){const d=wdir(w);const ja=J[w.id]?.a||0,jb=J[w.id]?.b||0;const a={x:w.x1-d.x*ja,y:w.y1-d.y*ja},b={x:w.x2+d.x*jb,y:w.y2+d.y*jb};
      const va=spec.axis==='x'?a.x:a.y, vb=spec.axis==='x'?b.x:b.y; if((va-spec.c)*(vb-spec.c)>0)continue; if(Math.abs(va-vb)<0.01)continue;
      const t=(spec.c-va)/(vb-va); const pt={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}; const u=V.u(pt.x,pt.y); const sinA=Math.abs(spec.axis==='x'?d.x:d.y)||1; const hw=w.thick/2/sinA;
      const H=wallH(P,w); const s=t*wlen({x1:a.x,y1:a.y,x2:b.x,y2:b.y})-ja; const op=P.openings.find(o=>o.wall===w.id&&Math.abs(s-o.pos)<o.width/2);
      const e0=lv.elevation; const segs=op?[[e0,e0+(op.type==='door'?0:op.sill)],[e0+(op.type==='door'?0:op.sill)+op.height,e0+H]]:[[e0,e0+H]];
      for(const [z0,z1] of segs)if(z1-z0>0.5)cuts.push({kind:'wall',u0:u-hw,u1:u+hw,z0,z1,ext:w.kind==='exterior'});}}
  // floors and ceilings cut through rooms
  const bands=[];
  const intervals=(pts)=>{const xs=[];for(let i=0;i<pts.length;i++){const A=pts[i],Bq=pts[(i+1)%pts.length];const va=spec.axis==='x'?A[0]:A[1],vb=spec.axis==='x'?Bq[0]:Bq[1];
      if((va-spec.c)*(vb-spec.c)<0){const t=(spec.c-va)/(vb-va);const x=A[0]+(Bq[0]-A[0])*t,y=A[1]+(Bq[1]-A[1])*t;xs.push(V.u(x,y));}}xs.sort((m,n)=>m-n);const out=[];for(let i=0;i+1<xs.length;i+=2)out.push([xs[i],xs[i+1]]);return out;};
  for(const lv of lvls){const fr=framingOf(lv);const first=lv===lvls[0];const depth=first&&fr.foundation==='slab'?4:(LUMBER[fr.joist]||9.25)+0.75;
    for(const r of P.rooms.filter(r=>r.level===lv.id))for(const [u0,u1] of intervals(r.pts)){bands.push({kind:'floor',u0,u1,z0:lv.elevation-depth+0.75,z1:lv.elevation+0.75,slab:first&&fr.foundation==='slab'});
      if(!levelAbove(P,lv))bands.push({kind:'ceiling',u0,u1,z0:lv.elevation+lv.height,z1:lv.elevation+lv.height+(LUMBER[fr.ceiling]||5.5)});
      bands.push({kind:'label',u:(u0+u1)/2,z:lv.elevation+lv.height*0.45,text:r.name.toUpperCase()});}}
  // roof cut lines
  const roofCuts=[];
  for(const r of P.roofs){const lv=lvlOf(P,r.level);if(!lv)continue;const b=roofBuild(r,roofTop(P,r));const rd=LUMBER[rafterOf(r).rafter]||7.25;
    for(const poly of b.polys){const hits=[];for(let i=0;i<poly.length;i++){const A=poly[i],Bq=poly[(i+1)%poly.length];const da=dep(A)-cDepth,db=dep(Bq)-cDepth;
        if((da>=0)!==(db>=0)&&Math.abs(da-db)>1e-9){const t=da/(da-db);hits.push([V.u(A[0]+(Bq[0]-A[0])*t,A[1]+(Bq[1]-A[1])*t),A[2]+(Bq[2]-A[2])*t]);}}
      if(hits.length>=2)roofCuts.push({a:hits[0],b:hits[1],depth:rd});}}
  let u0=1e9,u1=-1e9,z0=1e9,z1=-1e9;const grow=(u,z)=>{u0=Math.min(u0,u);u1=Math.max(u1,u);z0=Math.min(z0,z);z1=Math.max(z1,z);};
  for(const f of faces)for(const [u,z] of f.p2)grow(u,z);for(const c of cuts){grow(c.u0,c.z0);grow(c.u1,c.z1);}for(const r of roofCuts){grow(...r.a);grow(...r.b);}
  const grade=Math.min(-(p.settings?.gradeOffset||0),gradeLow(p));grow(u0,Math.min(z0,grade-18));
  return {faces,cuts,bands,roofCuts,u0,u1,z0,z1,grade,spec};
}
function drawSection(dl,p,S,sc,ox,oy,k){
  const U=u=>ox+(u-S.u0)*sc, Z=z=>oy+(S.z1-z)*sc; const P=q=>[U(q[0]),Z(q[1])];
  for(const f of S.faces){const q=f.p2.map(P);
    if(f.kind==='wall')dl.poly(q,{holes:f.h2.map(h=>h.map(P)),fill:'#ffffff',stroke:MID,w:0.4});
    else if(f.kind==='roof')dl.poly(q,{fill:'#e3e3e3',stroke:MID,w:0.4});
    else if(f.kind==='window'||f.kind==='door')dl.poly(q,{fill:f.kind==='window'?'#efefef':'#ffffff',stroke:MID,w:0.4});
    else dl.poly(q,{fill:'#ffffff',stroke:MID,w:0.4});}
  for(const b of S.bands){if(b.kind==='label'){dl.text(U(b.u),Z(b.z),b.text,{size:6.5*k,bold:true,anchor:'middle'});continue;}
    dl.poly([[U(b.u0),Z(b.z0)],[U(b.u1),Z(b.z0)],[U(b.u1),Z(b.z1)],[U(b.u0),Z(b.z1)]],{fill:b.kind==='floor'?(b.slab?'#9a9a9a':'#bdbdbd'):'#d6d6d6',stroke:INK,w:0.5});}
  for(const c of S.cuts)dl.poly([[U(c.u0),Z(c.z0)],[U(c.u1),Z(c.z0)],[U(c.u1),Z(c.z1)],[U(c.u0),Z(c.z1)]],{fill:FILL_NEW,stroke:INK,w:0.6});
  for(const r of S.roofCuts){const a=P(r.a),b=P(r.b),dd=r.depth*sc;dl.poly([a,b,[b[0],b[1]+dd],[a[0],a[1]+dd]],{fill:'#8a8a8a',stroke:INK,w:0.6});dl.line(...a,...b,2.2);}
  if(S.spec&&slopeOf(p).fall>0){const sp=S.spec;const toXY=u=>sp.axis==='x'?{x:sp.c,y:sp.view==='west'?u:-u}:{x:sp.view==='south'?u:-u,y:sp.c};const ext=0.4*k/sc;let prev=null;
    for(let i=0;i<=24;i++){const u=S.u0-ext+(S.u1-S.u0+2*ext)*i/24;const q=toXY(u);const pt=[U(u),Z(gradeAt(p,q.x,q.y))];if(prev)dl.line(prev[0],prev[1],pt[0],pt[1],2.2);prev=pt;}}
  else{const gz=Z(S.grade);dl.line(U(S.u0)-0.4*k,gz,U(S.u1)+0.4*k,gz,2.2);}
  // stem walls and footings under exterior cut walls
  for(const c of S.cuts.filter(c=>c.ext&&Math.abs(c.z0-groundLevel(p).elevation)<1)){const fr=framingOf(groundLevel(p));const sp=S.spec,mu=(c.u0+c.u1)/2;const gq=sp&&slopeOf(p).fall>0?(sp.axis==='x'?gradeAt(p,sp.c,sp.view==='west'?mu:-mu):gradeAt(p,sp.view==='south'?mu:-mu,sp.c)):S.grade;const bot=gq-12;
    const top=fr.foundation==='slab'?c.z0-4:c.z0-((LUMBER[fr.joist]||9.25)+0.75);dl.poly([[U(c.u0),Z(top)],[U(c.u1),Z(top)],[U(c.u1),Z(bot)],[U(c.u0),Z(bot)]],{fill:'#cfcfcf',stroke:INK,w:0.5});
    const fw=(c.u1-c.u0)/2+6;const m=(c.u0+c.u1)/2;dl.poly([[U(m-fw),Z(bot)],[U(m+fw),Z(bot)],[U(m+fw),Z(bot-8)],[U(m-fw),Z(bot-8)]],{fill:'#cfcfcf',stroke:INK,w:0.5});}
  // level markers
  const mx=U(S.u1)+0.25*k;let lastY=1e9,lastCol=0;const marks=[];for(const l of sortedLevels(p)){marks.push(['FIN. FLOOR',l.elevation]);marks.push(['TOP OF PLATE',l.elevation+l.height]);}
  let peak=-1e9;for(const r of S.roofCuts)peak=Math.max(peak,r.a[1],r.b[1]);if(peak>-1e9)marks.push(['RIDGE',peak]);marks.sort((a,b)=>a[1]-b[1]);
  for(const [lab,z] of marks){const y=Z(z);const col=(Math.abs(lastY-y)<0.26*k&&lastCol===0)?1:0;lastY=y;lastCol=col;const lx=mx+col*0.8*k;dl.line(U(S.u1)+0.05*k,y,lx+0.55*k,y,0.35,{dash:[0.05,0.03],color:MID});
    dl.circle(lx,y,0.045*k,{stroke:INK,w:0.5,fill:'#ffffff'});dl.text(lx+0.09*k,y-0.05*k,lab,{size:5.2*k,bold:true});dl.text(lx+0.09*k,y+0.1*k,fmtLen(z),{size:5.2*k});}
}
/* ---- foundation, roof and framing plans ---- */
function drawFoundation(dl,p,lv,G){
  const {PT,sc,k}=G;const fr=framingOf(lv);const walls=p.walls.filter(w=>w.level===lv.id);const J=wallJoins(walls);
  const off=(w,o)=>{const d=wdir(w),n={x:-d.y,y:d.x},ja=J[w.id]?.a||0,jb=J[w.id]?.b||0;const a={x:w.x1-d.x*(ja+(w.kind==='exterior'?6:4)),y:w.y1-d.y*(ja+(w.kind==='exterior'?6:4))},b={x:w.x2+d.x*(jb+(w.kind==='exterior'?6:4)),y:w.y2+d.y*(jb+(w.kind==='exterior'?6:4))};return [PT(a.x+n.x*o,a.y+n.y*o),PT(b.x+n.x*o,b.y+n.y*o)];};
  for(const w of walls){if(!(w.kind==='exterior'||w.bearing))continue;const t=w.thick/2;
    const d=wdir(w),n={x:-d.y,y:d.x},ja=J[w.id]?.a||0,jb=J[w.id]?.b||0;const a={x:w.x1-d.x*ja,y:w.y1-d.y*ja},b={x:w.x2+d.x*jb,y:w.y2+d.y*jb};
    if(fr.foundation==='slab'&&w.kind!=='exterior'){for(const s of [1,-1]){const [A,B2]=off(w,s*(t+4));dl.line(...A,...B2,0.4,{dash:[0.06,0.04]});}continue;}
    dl.poly([PT(a.x+n.x*t,a.y+n.y*t),PT(b.x+n.x*t,b.y+n.y*t),PT(b.x-n.x*t,b.y-n.y*t),PT(a.x-n.x*t,a.y-n.y*t)],{fill:fr.foundation==='slab'?'#ffffff':'#bdbdbd',stroke:INK,w:0.6});
    const fw=w.kind==='exterior'?8:6;for(const s of [1,-1]){const [A,B2]=off(w,s*(t+fw));dl.line(...A,...B2,0.4,{dash:[0.06,0.04]});}}
  const B=planBounds(p,lv.id);
  if(fr.foundation==='slab'){const ext=walls.filter(w=>w.kind==='exterior');const c=PT((B.x0+B.x1)/2,(B.y0+B.y1)/2);
    dl.text(c[0],c[1],'4" CONCRETE SLAB ON GRADE OVER 6 MIL VAPOR RETARDER',{size:6*k,bold:true,anchor:'middle'});dl.text(c[0],c[1]+0.14*k,'THICKENED EDGE AT EXTERIOR WALLS (DASHED)',{size:5.5*k,anchor:'middle',color:MID});return;}
  // crawlspace girders and piers
  const gs=fr.girders>0?fr.girders:96; const longX=(B.x1-B.x0)>=(B.y1-B.y0);
  const lo=longX?B.y0:B.x0, hi=longX?B.y1:B.x1; const n=Math.max(1,Math.round((hi-lo)/gs)); const step=(hi-lo)/n;
  for(let i=1;i<n;i++){const v=lo+i*step;const A=longX?PT(B.x0+6,v):PT(v,B.y0+6),B2=longX?PT(B.x1-6,v):PT(v,B.y1-6);dl.line(...A,...B2,1.6,{dash:[0.12,0.05]});
    const L=longX?(B.x1-B.x0):(B.y1-B.y0);const np=Math.max(1,Math.round(L/96));for(let j=0;j<=np;j++){const u=(longX?B.x0:B.y0)+6+(L-12)*j/np;const c=longX?PT(u,v):PT(v,u);const h=8*sc;dl.poly([[c[0]-h,c[1]-h],[c[0]+h,c[1]-h],[c[0]+h,c[1]+h],[c[0]-h,c[1]+h]],{fill:'#ffffff',stroke:INK,w:0.6});}
    if(i===1){const lp=longX?PT(B.x0+(B.x1-B.x0)*0.27,v):PT(v,B.y0+(B.y1-B.y0)*0.27);dl.text(lp[0]+(longX?0:-0.2*k),lp[1]-(longX?0.2*k:0),`GIRDER ON 16" x 16" PIERS AT ABOUT 8'-0" O.C.`,{size:5.5*k,anchor:'middle',bold:true,rot:longX?0:-90});}}
  const c=PT(B.x0+(B.x1-B.x0)*0.27,B.y0+Math.min(step,(B.y1-B.y0))*0.5);dl.text(c[0],c[1],`CRAWLSPACE: ${fr.joist.toUpperCase()} FLOOR JOISTS AT ${fr.spacing}" O.C. OVER GIRDERS AT ${fmtLen(gs)} O.C.`,{size:5.5*k,anchor:'middle'});
}
function drawRoofPlan(dl,p,lv,G){
  const {PT,k}=G;
  for(const w of p.walls.filter(w=>w.level===lv.id&&w.kind==='exterior')){const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2;dl.poly([PT(w.x1+n.x*t,w.y1+n.y*t),PT(w.x2+n.x*t,w.y2+n.y*t),PT(w.x2-n.x*t,w.y2-n.y*t),PT(w.x1-n.x*t,w.y1-n.y*t)],{stroke:MID,w:0.35,dash:[0.05,0.04]});}
  const RG=roofPlanGeo(p,lv.id);for(const e of RG.edges)dl.line(...PT(e.a[0],e.a[1]),...PT(e.b[0],e.b[1]),1.1);for(const l of RG.lines)dl.line(...PT(l.a[0],l.a[1]),...PT(l.b[0],l.b[1]),l.kind==='valley'?0.7:0.9,l.kind==='valley'?{dash:[0.08,0.03]}:undefined);
  for(const d of (p.dormers||[]).filter(d=>d.level===lv.id)){const di=dormerInfo(p,d);if(!di)continue;dl.poly(di.foot.map(q=>PT(q.x,q.y)),{stroke:INK,w:0.8});}
  for(const r of p.roofs.filter(r=>r.level===lv.id)){const b=roofBuild(r,roofTop(p,r));
    for(const poly of b.polys){const cx=poly.reduce((s,q)=>s+q[0],0)/poly.length,cy=poly.reduce((s,q)=>s+q[1],0)/poly.length;
      const [A,B2,C]=poly;const u=[B2[0]-A[0],B2[1]-A[1],B2[2]-A[2]],v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];let nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0];if(nz<0){nx=-nx;ny=-ny;}
      const m=Math.hypot(nx,ny);if(m<1e-6)continue;nx/=m;ny/=m;const L=0.45*k/G.sc;const a=PT(cx-nx*L/2,cy-ny*L/2),bb=PT(cx+nx*L/2,cy+ny*L/2);dl.line(...a,...bb,0.6);
      const ang=Math.atan2(bb[1]-a[1],bb[0]-a[0]),ah=0.06*k;dl.poly([bb,[bb[0]-ah*Math.cos(ang-0.4),bb[1]-ah*Math.sin(ang-0.4)],[bb[0]-ah*Math.cos(ang+0.4),bb[1]-ah*Math.sin(ang+0.4)]],{fill:INK});
      const pz=Math.abs(nz)>1e-9?(Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2])/Math.abs(nz))*12:r.pitch;if(roofHeightAt(b,cx,cy)<Math.max(...RG.B.map(o=>roofHeightAt(o.b,cx,cy)))-1)continue;
      dl.text((a[0]+bb[0])/2+0.05*k,(a[1]+bb[1])/2-0.05*k,`${Math.round(pz*4)/4}:12`,{size:6*k,bold:true});}
    const ol=b.outline;const c=PT((ol[0][0]+ol[2][0])/2,(ol[0][1]+ol[2][1])/2+(ol[2][1]-ol[0][1])*0.32);const rf=rafterOf(r);
    dl.text(c[0],c[1],`${ROOF_COVER[rf.cover]?.label.toUpperCase()||'ROOFING'} · ${fmtLen(r.overhang)} OVERHANG · ${rf.system==='trusses'?'ENGINEERED TRUSSES':`${rf.rafter.toUpperCase()} RAFTERS AT ${rf.spacing}" O.C.`}`,{size:5.5*k,anchor:'middle'});}
}
function drawFraming(dl,p,lv,G,members){
  const {PT,k,sc}=G;const marks=openingMarks(p);
  const walls=p.walls.filter(w=>w.level===lv.id);const J=wallJoins(walls.filter(w=>w.status!=='demolish'));
  for(const w of walls){const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2,ja=J[w.id]?.a||0,jb=J[w.id]?.b||0;const a={x:w.x1-d.x*ja,y:w.y1-d.y*ja},b={x:w.x2+d.x*jb,y:w.y2+d.y*jb};
    const pts=[PT(a.x+n.x*t,a.y+n.y*t),PT(b.x+n.x*t,b.y+n.y*t),PT(b.x-n.x*t,b.y-n.y*t),PT(a.x-n.x*t,a.y-n.y*t)];
    if(w.status==='demolish')dl.poly(pts,{stroke:INK,w:0.4,dash:[0.05,0.03]});else dl.poly(pts,{fill:w.bearing||w.kind==='exterior'?'#7a7a7a':'#ffffff',stroke:INK,w:0.45});}
  for(const m of members.filter(m=>m.level===lv.id)){
    if(m.kind==='floor'||m.kind==='ceiling'){const r=p.rooms.find(r=>r.id===m.target.id);if(!r)continue;const [cx,cy]=polyLabelPt(r.pts);const off=m.kind==='ceiling'?0.28*k/sc:0;
      const xs=r.pts.map(q=>q[0]),ys=r.pts.map(q=>q[1]);const L=Math.min(m.span,m.axis==='x'?Math.max(...xs)-Math.min(...xs):Math.max(...ys)-Math.min(...ys))*0.6;const a=m.axis==='x'?PT(cx-L/2,cy+off):PT(cx+off,cy-L/2),bb=m.axis==='x'?PT(cx+L/2,cy+off):PT(cx+off,cy+L/2);
      dl.line(...a,...bb,0.6);for(const [p0,p1] of [[a,bb],[bb,a]]){const ang=Math.atan2(p0[1]-p1[1],p0[0]-p1[0]),ah=0.06*k;dl.poly([p0,[p0[0]-ah*Math.cos(ang-0.45),p0[1]-ah*Math.sin(ang-0.45)],[p0[0]-ah*Math.cos(ang+0.45),p0[1]-ah*Math.sin(ang+0.45)]],{fill:INK});}
      const lab=`${m.kind==='ceiling'?'CJ ':''}${(m.ratio>1&&m.suggest?m.suggest:m.size).toUpperCase()} @ ${m.spacing}" O.C.`;const mid=[(a[0]+bb[0])/2,(a[1]+bb[1])/2];
      dl.text(mid[0]+(m.axis==='x'?0:0.06*k),mid[1]-(m.axis==='x'?0.05*k:0),lab,{size:5.5*k,bold:true,anchor:m.axis==='x'?'middle':'start',color:m.ratio>1?'#b3261e':INK});}
    else if(m.kind==='header'&&m.size!=='Flat 2x'){const o=p.openings.find(o=>o.id===m.target.id);const c=o&&openingCenter(p,o);if(!c)continue;const w=c.w,d=wdir(w),n={x:-d.y,y:d.x};const q=PT(c.x+n.x*(w.thick/2+8),c.y+n.y*(w.thick/2+8));
      dl.text(q[0],q[1],`${marks[o.id]||''} HDR: ${(m.ratio>1&&m.suggest?m.suggest:m.size).replace('¾','3/4').replace('⅞','7/8').replace('¼','1/4')}`,{size:5*k,anchor:'middle',rot:Math.abs(d.y)>0.7?-90:0,color:m.ratio>1?'#b3261e':INK});}
    else if(m.kind==='beam'){const w=p.walls.find(w=>w.id===m.target.id);if(!w)continue;dl.line(...PT(w.x1,w.y1),...PT(w.x2,w.y2),2.6,{dash:[0.15,0.05]});const q=PT((w.x1+w.x2)/2,(w.y1+w.y2)/2);
      const vb=Math.abs(wdir(w).y)>0.7;dl.text(q[0]+(vb?-0.12*k:0),q[1]+(vb?0:-0.12*k),`NEW BEAM: ${String(m.suggest).replace('¾','3/4').replace('⅞','7/8').replace('¼','1/4')} WITH POSTS AT EACH END`,{size:5.5*k,bold:true,anchor:'middle',rot:vb?-90:0});}}
}
/* ---- accessibility plan overlays ---- */
function inscribedCircle(pts,obs=[]){const xs=pts.map(q=>q[0]),ys=pts.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);let best={r:0,x:(x0+x1)/2,y:(y0+y1)/2};
  for(let i=1;i<40;i++)for(let j=1;j<40;j++){const x=x0+(x1-x0)*i/40,y=y0+(y1-y0)*j/40;if(!inPoly(x,y,pts)||obs.some(o=>inPoly(x,y,o)))continue;let d=1e9;for(const poly of [pts,...obs])for(let k=0;k<poly.length;k++){const a=poly[k],b=poly[(k+1)%poly.length];d=Math.min(d,projSeg({x,y},{x:a[0],y:a[1]},{x:b[0],y:b[1]}).d);}if(d>best.r)best={r:d,x,y};}
  return best;}
function drawAccessibility(dl,p,lv,G){
  const {PT,sc,k}=G;const R=t=>t*sc;
  for(const r of p.rooms.filter(r=>r.level===lv.id&&(r.use==='bath'||r.use==='kitchen'))){const obs=(p.fixtures||[]).filter(f=>f.level===r.level&&f.type!=='wallcab'&&!['lav','vanity'].includes(f.type)&&inPoly(f.x,f.y,r.pts)).map(f=>fxCorners(f).map(c=>[c.x,c.y]));
    const ic=inscribedCircle(r.pts,obs);const c=PT(ic.x,ic.y);const ok=(ic.r*2-4.5)>=59.5;dl.circle(c[0],c[1],R(30),{stroke:ok?INK:'#b3261e',w:0.6,dash:[0.06,0.04]});
    dl.text(c[0],c[1]+R(30)+0.12*k,ok?'60" TURNING SPACE':'TURNING SPACE SHORT',{size:5*k,anchor:'middle',bold:true,color:ok?INK:'#b3261e'});}
  for(const o of p.openings.filter(o=>o.type==='door')){const c=openingCenter(p,o);if(!c||c.w.level!==lv.id)continue;const w=c.w,d=wdir(w),n={x:-d.y,y:d.x},L=wlen(w);
    const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));const side=o.swing||1;const latch=o.hinge?pos-o.width/2:pos+o.width/2;const dir=o.hinge?-1:1;
    const P0=(s,off)=>PT(w.x1+d.x*s+n.x*off,w.y1+d.y*s+n.y*off);const t=w.thick/2;
    dl.poly([P0(latch,side*t),P0(latch+dir*18,side*t),P0(latch+dir*18,side*(t+60)),P0(latch,side*(t+60))],{stroke:'#555555',w:0.4,dash:[0.04,0.03]});
    dl.poly([P0(pos-o.width/2,side*t),P0(pos+o.width/2,side*t),P0(pos+o.width/2,side*(t+60)),P0(pos-o.width/2,side*(t+60))],{stroke:'#555555',w:0.3,dash:[0.02,0.03]});}
  for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id&&f.type==='toilet')){const front=fxFront(f),side=fxSide(f);const back={x:f.x-front.x*(f.d/2-1),y:f.y-front.y*(f.d/2-1)};
    const l=clearAlong(p,f.level,back,{x:-side.x,y:-side.y},f.id),rr=clearAlong(p,f.level,back,side,f.id);const sw=l<rr?{x:-side.x,y:-side.y}:side;const wp={x:back.x+sw.x*Math.min(l,rr),y:back.y+sw.y*Math.min(l,rr)};const aw={x:-sw.x,y:-sw.y};
    dl.poly([[wp.x,wp.y],[wp.x+aw.x*60,wp.y+aw.y*60],[wp.x+aw.x*60+front.x*56,wp.y+aw.y*60+front.y*56],[wp.x+front.x*56,wp.y+front.y*56]].map(q=>PT(q[0],q[1])),{stroke:INK,w:0.5,dash:[0.08,0.04]});
    const q=PT(wp.x+aw.x*30+front.x*50,wp.y+aw.y*30+front.y*50);dl.text(q[0],q[1],'60" x 56" CLEAR',{size:5*k,anchor:'middle'});}
}
function drawAdaNotes(dl,p,x,y,k,maxW){
  const rows=[['Door clear width',fmtLen(rv(p,'doorClear'))+' min.','404.2.3'],['Latch side, pull side',fmtLen(rv(p,'latchPull'))+' min.','404.2.4'],['Threshold','1/2" max.','404.2.5'],['Turning space',fmtLen(rv(p,'turning'))+' circle','304.3.1'],
    ['Accessible route',fmtLen(rv(p,'route'))+' min.','403.5.1'],['Ramp slope','1:'+rv(p,'rampRun')+' max.','405.2'],['Toilet centerline','16" to 18" from side wall','604.2'],['Toilet clearance','60" x 56"','604.3'],['Lavatory rim','34" max.','606.3'],
    ['Grab bars','33" to 36" high','609.4'],['Work surface','34" max., 30" wide','902.3'],['Reach range','15" to 48"','308']];
  dl.text(x,y,'ACCESSIBILITY REQUIREMENTS (2010 ADA STANDARDS)',{size:6.5*k,bold:true});
  return drawTable(dl,x,y+0.08*k,[{h:'ITEM',w:Math.min(maxW*0.45,1.6*k)},{h:'REQUIREMENT',w:Math.min(maxW*0.35,1.4*k)},{h:'SECTION',w:Math.min(maxW*0.2,0.6*k)}],rows,k);
}
/* ---- interior elevations (kitchen and bath walls with fixtures) ---- */
function interiorWalls(p){
  const out=[];
  for(const r of p.rooms){const fx=(p.fixtures||[]).filter(f=>f.level===r.level&&f.status!=='demolish'&&inPoly(f.x,f.y,r.pts)&&f.type!=='bed'&&f.type!=='sofa'&&f.type!=='table'&&f.type!=='island');if(!fx.length)continue;
    for(let i=0;i<r.pts.length;i++){const a={x:r.pts[i][0],y:r.pts[i][1]},b={x:r.pts[(i+1)%r.pts.length][0],y:r.pts[(i+1)%r.pts.length][1]};const L=dist(a,b);if(L<12)continue;const d={x:(b.x-a.x)/L,y:(b.y-a.y)/L};
      let n={x:-d.y,y:d.x};const mid={x:(a.x+b.x)/2+n.x*6,y:(a.y+b.y)/2+n.y*6};if(!inPoly(mid.x,mid.y,r.pts))n={x:-n.x,y:-n.y};// n points into the room
      const on=fx.filter(f=>{const fr=fxFront(f);if(fr.x*n.x+fr.y*n.y<0.9)return false;const back={x:f.x-fr.x*f.d/2,y:f.y-fr.y*f.d/2};const pr=projSeg(back,a,b);return pr.d<8&&pr.tRaw>-0.05&&pr.tRaw<1.05;});
      if(!on.length)continue;
      // viewer inside, facing the wall: left end is a or b
      const facing={x:-n.x,y:-n.y};const left={x:facing.y,y:-facing.x};const start=(d.x*left.x+d.y*left.y)>0?b:a;const dirLR=start===a?d:{x:-d.x,y:-d.y};
      const ops=p.openings.filter(o=>{const c=openingCenter(p,o);if(!c||c.w.level!==r.level)return false;const pr=projSeg(c,a,b);return pr.d<c.w.thick/2+1&&pr.tRaw>0&&pr.tRaw<1;});
      out.push({room:r,start,dir:dirLR,len:L,fixtures:on,openings:ops,facing,lv:lvlOf(p,r.level)});}}
  return out;
}
function drawInteriorElev(dl,p,IE,sc,ox,oy,k){
  const H=IE.lv.height; const U=s=>ox+s*sc, Z=z=>oy+(H-z)*sc; const along=pt=>(pt.x-IE.start.x)*IE.dir.x+(pt.y-IE.start.y)*IE.dir.y;
  dl.poly([[U(0),Z(0)],[U(IE.len),Z(0)],[U(IE.len),Z(H)],[U(0),Z(H)]],{stroke:INK,w:1.2,fill:'#ffffff'});
  for(const o of IE.openings){const c=openingCenter(p,o);const s=along(c);const z0=o.type==='door'?0:o.sill;dl.poly([[U(s-o.width/2),Z(z0)],[U(s+o.width/2),Z(z0)],[U(s+o.width/2),Z(z0+o.height)],[U(s-o.width/2),Z(z0+o.height)]],{stroke:INK,w:0.6,fill:o.type==='window'?'#eeeeee':'#ffffff'});}
  try{tileElevDL(dl,p,IE,U,Z,sc,k);}catch(e){console.error(e);}
  const brk=[0,IE.len];
  const cnum=cabNumbers(p);const ctrs=counterGeo(p,IE.lv.id);
  for(const f of [...IE.fixtures].sort((a,b)=>(a.type==='wallcab')-(b.type==='wallcab'))){const s=along({x:f.x,y:f.y});const s0=s-f.w/2,s1=s+f.w/2;brk.push(s0,s1);const z0=f.elev||0,z1=z0+f.h;
    if(isCab(f)){cabElevDL(dl,p,f,s,U,Z,k,cnum[f.id]);if(['base','sinkbase','vanity','island'].includes(f.type)){const c=ctrs.find(c=>inPoly(f.x,f.y,c.pts.map(q=>[q.x,q.y])));if(c){const bh=z0+cabBoxH(f);dl.poly([[U(s0-0.5),Z(bh)],[U(s1+0.5),Z(bh)],[U(s1+0.5),Z(bh+c.thick)],[U(s0-0.5),Z(bh+c.thick)]],{stroke:INK,w:0.5,fill:'#bdbdbd'});
        const sp=c.set.splash==='full'?18:c.set.splash==='none'?0:+c.set.splash||4;if(sp>0)dl.poly([[U(s0),Z(bh+c.thick)],[U(s1),Z(bh+c.thick)],[U(s1),Z(bh+c.thick+sp)],[U(s0),Z(bh+c.thick+sp)]],{stroke:MID,w:0.35,fill:c.set.splash==='full'?'#f0f0f0':'#e2e2e2'});
        if(f.type==='sinkbase')dl.text(U(s),Z(bh+c.thick+2),'SINK',{size:4.5*k,anchor:'middle',color:MID});}}continue;}
    const box=(a,b,c,d,o={})=>dl.poly([[U(a),Z(b)],[U(c),Z(b)],[U(c),Z(d)],[U(a),Z(d)]],{stroke:INK,w:0.6,fill:'#ffffff',...o});
    if(COUNTERTOP.has(f.type)){box(s0,0,s1,4,{fill:'#d9d9d9'});box(s0,4,s1,z1-1.5);box(s0-0.5,z1-1.5,s1+0.5,z1,{fill:'#bdbdbd'});
      const nd=f.w>24?2:1;for(let i=1;i<nd;i++)dl.line(U(s0+f.w*i/nd),Z(4),U(s0+f.w*i/nd),Z(z1-7.5),0.4);dl.line(U(s0),Z(z1-7.5),U(s1),Z(z1-7.5),0.4);
      if(f.type==='sinkbase')dl.text(U(s),Z(z1+2),'SINK',{size:4.5*k,anchor:'middle',color:MID});}
    else if(f.type==='wallcab'){box(s0,z0,s1,z1);if(f.w>24)dl.line(U(s),Z(z0),U(s),Z(z1),0.4);}
    else if(f.type==='tall'){box(s0,0,s1,z1);dl.line(U(s0),Z(z1*0.45),U(s1),Z(z1*0.45),0.4);}
    else if(f.type==='fridge'){box(s0,0,s1,z1);dl.line(U(s0),Z(z1*0.62),U(s1),Z(z1*0.62),0.4);dl.text(U(s),Z(z1*0.4),'REF',{size:5*k,anchor:'middle',bold:true});}
    else if(f.type==='range'){box(s0,0,s1,z1);dl.line(U(s0),Z(z1-4),U(s1),Z(z1-4),0.4);dl.poly([[U(s0+2),Z(6)],[U(s1-2),Z(6)],[U(s1-2),Z(z1-10)],[U(s0+2),Z(z1-10)]],{stroke:INK,w:0.4});}
    else if(f.type==='dw'){box(s0,0,s1,z1);dl.text(U(s),Z(z1/2),'DW',{size:5*k,anchor:'middle',bold:true});}
    else if(f.type==='toilet'){box(s-f.w/2+2,0,s+f.w/2-2,15);box(s-f.w/2,15,s+f.w/2,30);}
    else if(f.type==='tub'){box(s0,0,s1,f.h);}
    else if(f.type==='shower'||f.type==='rollin'){box(s0,0,s1,f.h||2);box(s0,0,s1,80,{fill:'none',dash:[0.05,0.04]});}
    else if(f.type==='lav'){box(s-f.w/2,f.h-6,s+f.w/2,f.h);dl.line(U(s),Z(0),U(s),Z(f.h-6),0.6);}
    else box(s0,z0,s1,z1);}
  // dimension chain along the bottom and key heights on the right
  const cs=[...new Set(brk.map(v=>Math.round(Math.max(0,Math.min(IE.len,v))*4)/4))].sort((a,b)=>a-b);
  if(cs.length>=2)dimChain(dl,cs,true,Z(0)+0.32*k,Z(0),1,s=>U(s),k);
  const hs=new Set();for(const f of IE.fixtures){hs.add(f.elev||0);hs.add((f.elev||0)+f.h);}const hz=[0,...[...hs].filter(z=>z>0&&z<H),H].sort((a,b)=>a-b);
  const hz2=[...new Set(hz.map(z=>Math.round(z*4)/4))].filter((z,i,a)=>i===0||z-a[i-1]>=2);if(hz2.length>=2)dimChain(dl,hz2.map(z=>H-z).reverse(),false,U(IE.len)+0.32*k,U(IE.len),1,v=>oy+v*sc,k);
}
/* ---- the whole sheet set ---- */
function buildSheets(p){
  const P=PAPERS[p.sheet?.paper]||PAPERS.tabloid; const k=P.k; const marks=openingMarks(p); const lvls=sortedLevels(p); const out=[];
  const pp=filteredProject(p,'proposed'); const spec=sectionSpec(pp); const members=analyzeStructure(p); const R=1.4*k;
  // site plan
  if(p.walls.length){const lv0=lvls[0];const site=siteOf(p);const lot=p.sheet?.lot||null;let B=planBounds(pp,lv0.id);
    for(const r of pp.roofs)B={x0:Math.min(B.x0,r.x-r.overhang),y0:Math.min(B.y0,r.y-r.overhang),x1:Math.max(B.x1,r.x+r.w+r.overhang),y1:Math.max(B.y1,r.y+r.h+r.overhang)};
    if(lot&&lot.w>0&&lot.d>0){const lx=B.x0-(lot.left||0),ly=B.y0-(lot.front||0);B={x0:Math.min(B.x0,lx),y0:Math.min(B.y0,ly),x1:Math.max(B.x1,lx+lot.w),y1:Math.max(B.y1,ly+lot.d)};}
    for(const o of pp.site||[])for(const q of siteOutline(o)){B={x0:Math.min(B.x0,q.x),y0:Math.min(B.y0,q.y),x1:Math.max(B.x1,q.x),y1:Math.max(B.y1,q.y)};}
    for(const kk of ['deck','steps'])for(const o of objsOn(pp,kk,lv0.id))for(const q of regPts(pp,kk,o))B={x0:Math.min(B.x0,q.x),y0:Math.min(B.y0,q.y),x1:Math.max(B.x1,q.x),y1:Math.max(B.y1,q.y)};
    out.push(planSheet(P,p,'A0.2','Site plan',B,R,(dl,G)=>{const {PT}=G;siteDL(dl,pp,PT,k,G.sc);gradeDL(dl,pp,PT,k);for(const kk of ['deck','steps'])for(const o of objsOn(pp,kk,lv0.id))OBJ[kk].dl(dl,pp,lv0,o,PT,k,G.sc);
      for(const w of pp.walls.filter(w=>w.level===lv0.id&&w.kind==='exterior')){const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2;dl.poly([PT(w.x1+n.x*t,w.y1+n.y*t),PT(w.x2+n.x*t,w.y2+n.y*t),PT(w.x2-n.x*t,w.y2-n.y*t),PT(w.x1-n.x*t,w.y1-n.y*t)],{fill:'#cfcfcf',stroke:INK,w:0.6});}
      {const RG=roofPlanGeo(pp,lv0.id,pp.roofs.filter(r=>r.level===lv0.id));for(const e of RG.edges)dl.line(...PT(e.a[0],e.a[1]),...PT(e.b[0],e.b[1]),0.5,{dash:[0.08,0.04]});for(const l of RG.lines)dl.line(...PT(l.a[0],l.a[1]),...PT(l.b[0],l.b[1]),0.4);}
      const BB=planBounds(pp,lv0.id);const c=PT((BB.x0+BB.x1)/2,(BB.y0+BB.y1)/2);dl.text(c[0],c[1]-0.3*k,'HOUSE',{size:(lot&&lot.w>0?6:8)*k,bold:true,anchor:'middle'});
      const area=Math.round(pp.rooms.filter(r=>r.level===lv0.id).reduce((s,r)=>s+polyArea(r.pts),0)/144);if(!(lot&&lot.w>0))dl.text(c[0],c[1]-0.14*k,`${area} SF FIRST FLOOR · ${fmtLen(BB.x1-BB.x0)} x ${fmtLen(BB.y1-BB.y0)}`,{size:5.5*k,anchor:'middle'});
      dimChain(dl,[BB.x0,BB.x1],true,G.Y(BB.y1)+0.3*k,G.Y(BB.y1),1,G.X,k);dimChain(dl,[BB.y0,BB.y1],false,G.X(BB.x1)+0.3*k,G.X(BB.x1),1,G.Y,k);
      if(lot&&lot.w>0){const lx=BB.x0-(lot.left||0),ly=BB.y0-(lot.front||0);dl.poly([PT(lx,ly),PT(lx+lot.w,ly),PT(lx+lot.w,ly+lot.d),PT(lx,ly+lot.d)],{stroke:INK,w:1.4,dash:[0.25,0.06,0.04,0.06]});
const cx=(BB.x0+BB.x1)/2,cy=(BB.y0+BB.y1)/2;dimChain(dl,[lx,lx+lot.w],true,G.Y(ly)-0.35*k,G.Y(ly),-1,G.X,k);dimChain(dl,[ly,ly+lot.d],false,G.X(lx)-0.35*k,G.X(lx),-1,G.Y,k);
        if(lot.front>0)dimChain(dl,[ly,BB.y0],false,G.X(cx),G.X(cx),1,G.Y,k);if(lot.left>0)dimChain(dl,[lx,BB.x0],true,G.Y(cy),G.Y(cy),1,G.X,k);
        dl.text(...PT(lx+lot.w/2,ly+lot.d-0.2*k/G.sc),`LOT ${fmtLen(lot.w)} x ${fmtLen(lot.d)} · HOUSE ${area} SF${site.name?' · '+site.name.toUpperCase():''}`,{size:5.5*k,anchor:'middle',bold:true});}},0,SITE_SCALES));}
  // floor plans
  const remodel=hasRemodel(p); let n=1;
  for(const lv of lvls){
    if(remodel&&p.walls.some(w=>w.level===lv.id&&(w.status==='existing'||w.status==='demolish'))){const ep=filteredProject(p,'existing');const B=planBounds(ep,lv.id);
      out.push(planSheet(P,p,`A1.${n++}`,`${lv.name} existing and demolition plan`,B,R,(dl,G)=>{drawPlan(dl,ep,lv,G.sc,G.ox,G.oy,B,k,marks);const c=G.PT(B.x0,B.y1);dl.text(c[0],c[1]+0.45*k,'EXISTING WALLS GRAY · WALLS TO REMOVE DASHED',{size:5.5*k,color:MID});}));}
    const B=planBounds(pp,lv.id);
    out.push(planSheet(P,p,`A1.${n++}`,`${lv.name} ${remodel?'proposed ':''}plan`,B,R,(dl,G)=>{drawPlan(dl,pp,lv,G.sc,G.ox,G.oy,B,k,marks);if(spec&&!(pp.sections||[]).length)drawSectionMark(dl,spec,G.X,G.Y,B,k);}));}
  // foundation and roof plans
  if(p.walls.length){const lv0=lvls[0];const B=planBounds(pp,lv0.id);out.push(planSheet(P,p,`A1.${n++}`,'Foundation plan',B,R,(dl,G)=>drawFoundation(dl,pp,lv0,G)));
    const rlv=lvls.filter(l=>pp.roofs.some(r=>r.level===l.id));for(const lv of rlv){let B2=planBounds(pp,lv.id);for(const r of pp.roofs.filter(r=>r.level===lv.id))B2={x0:Math.min(B2.x0,r.x-r.overhang),y0:Math.min(B2.y0,r.y-r.overhang),x1:Math.max(B2.x1,r.x+r.w+r.overhang),y1:Math.max(B2.y1,r.y+r.h+r.overhang)};
      out.push(planSheet(P,p,`A1.${n++}`,rlv.length>1?`${lv.name} roof plan`:'Roof plan',B2,R,(dl,G)=>drawRoofPlan(dl,pp,lv,G)));}}
  // exterior elevations
  {const F=elevFaces(pp);const Es=Object.keys(ELEV_VIEWS).map(v=>({v,E:elevProject(pp,F,v)}));const dl0=DL();const A=sheetFrame(dl0,P,p,'A2.1','Exterior elevations','');
    const cw=(A.x1-A.x0)/2, ch=(A.y1-A.y0)/2; const mk=1.2*k, tt=0.6*k; const valid=Es.filter(e=>e.E.faces.length);
    const s=pickScale(cw,ch,sc=>Math.max(1,...valid.map(e=>(e.E.u1-e.E.u0)*sc))+mk+0.35*k,sc=>Math.max(1,...valid.map(e=>(e.E.z1-Math.min(0,e.E.z0))*sc))+tt+0.25*k,p.sheet?.scale);
    const sc=s[0]/12; const dl=DL();sheetFrame(dl,P,p,'A2.1','Exterior elevations',s[1]);
    Es.forEach(({v,E},i)=>{const cx=A.x0+(i%2)*cw, cy=A.y0+Math.floor(i/2)*ch;
      if(!E.faces.length){dl.text(cx+cw/2,cy+ch/2,'Nothing to show yet',{size:7*k,anchor:'middle',color:MID});return;}
      const w=(E.u1-E.u0)*sc,h=(E.z1-Math.min(0,E.z0))*sc;const ox=cx+Math.max(0.3*k,(cw-w-mk)/2),oy=cy+Math.max(0.2*k,(ch-h-tt)/2);
      drawElevation(dl,pp,E,sc,ox,oy,k);const fb=siteOf(p).bearing+{north:0,east:90,south:180,west:270}[v];drawingTitle(dl,ox,oy+h+0.42*k,`${compassName(fb)} elevation`,s[1],k,false,0);});
    out.push({id:'elev',no:'A2.1',title:'Exterior elevations',w:P.w,h:P.h,items:dl.items,scale:s[1]});}
  // building section
  const specs=(pp.sections||[]).length?pp.sections.map(s=>sectionSpecFrom(pp,s)):spec?[{...spec,label:'A'}]:[];
  specs.forEach((spec,si)=>{const no='A3.'+(si+1);const S=sectionData(p,spec);const dl0=DL();const A=sheetFrame(dl0,P,p,no,'Building section','');const fitW=A.x1-A.x0-1.4*k,fitH=A.y1-A.y0-0.8*k;
    const s=pickScale(fitW,fitH,sc=>(S.u1-S.u0)*sc,sc=>(S.z1-S.z0)*sc,p.sheet?.scale);const sc=s[0]/12;const w=(S.u1-S.u0)*sc,h=(S.z1-S.z0)*sc;
    const dl=DL();sheetFrame(dl,P,p,no,'Building section',s[1]);const ox=A.x0+Math.max(0.3*k,(fitW-w)/2),oy=A.y0+Math.max(0.3*k,(fitH-h)/2);
    drawSection(dl,p,S,sc,ox,oy,k);drawingTitle(dl,ox,oy+h+0.45*k,`Section ${spec.label||'A'}-${spec.label||'A'}`,s[1],k,false,0);
    out.push({id:'sect'+si,no,title:`Building section ${spec.label||'A'}`,w:P.w,h:P.h,items:dl.items,scale:s[1]});});
  // accessibility
  if(p.settings?.ada!==false&&p.walls.length){const lv0=lvls[0];const B=planBounds(pp,lv0.id);const notesW=2.9*k;
    out.push(planSheet(P,p,'A4.1','Accessibility plan',B,R,(dl,G)=>{drawPlan(dl,pp,lv0,G.sc,G.ox,G.oy,B,k,marks);drawAccessibility(dl,pp,lv0,G);drawAdaNotes(dl,p,G.A.x1-notesW,G.A.y0+0.15*k,k,notesW);},notesW+0.2*k));}
  // interior elevations
  {const cs=cabinetSheet(P,p,pp,k);if(cs)out.push(cs);}
  {const IEs=interiorWalls(pp);for(let si=0;si<IEs.length;si+=4){const group=IEs.slice(si,si+4);const no=`A5.${si/4+1}`;const dl0=DL();const A=sheetFrame(dl0,P,p,no,'Kitchen and bath elevations','');
      const cw=(A.x1-A.x0)/2,ch=(A.y1-A.y0)/2;const s=pickScale(cw,ch,sc=>Math.max(...group.map(g=>g.len))*sc+0.9*k,sc=>Math.max(...group.map(g=>g.lv.height))*sc+1.1*k,'auto');const sc=s[0]/12;
      const dl=DL();sheetFrame(dl,P,p,no,'Kitchen and bath elevations',s[1]);
      group.forEach((g,i)=>{const cx=A.x0+(i%2)*cw,cy=A.y0+Math.floor(i/2)*ch;const w=g.len*sc,h=g.lv.height*sc;const ox=cx+Math.max(0.2*k,(cw-w-0.9*k)/2),oy=cy+Math.max(0.2*k,(ch-h-1.1*k)/2);
        drawInteriorElev(dl,pp,g,sc,ox,oy,k);const bearing=siteOf(p).bearing+Math.atan2(g.facing.x,-g.facing.y)*180/Math.PI;drawingTitle(dl,ox,oy+h+0.75*k,`${g.room.name}: ${compassName(bearing)} wall`,s[1],k,false,0);});
      out.push({id:'int'+si,no,title:'Kitchen and bath elevations',w:P.w,h:P.h,items:dl.items,scale:s[1]});}}
  // framing plans
  {let m=1;for(const lv of lvls){const B=planBounds(pp,lv.id);out.push(planSheet(P,p,`S1.${m++}`,`${lv.name} framing plan`,B,R,(dl,G)=>{drawFraming(dl,{...pp,walls:p.walls},lv,G,members);const c=G.PT(B.x0,B.y1);dl.text(c[0],c[1]+0.45*k,'SHADED WALLS CARRY LOAD · SIZES IN RED NEED THE SUGGESTED UPGRADE · PLANNING LEVEL, HAVE AN ENGINEER CONFIRM',{size:5*k,color:MID});}));}}
  // electrical plans
  {let m=1;for(const lv of lvls){const devs=(pp.elec||[]).filter(d=>d.level===lv.id&&d.status!=='demolish');if(!devs.length)continue;const B=planBounds(pp,lv.id);const notesW=2.6*k;
    out.push(planSheet(P,p,`E1.${m++}`,`${lv.name} electrical plan`,B,R,(dl,G)=>{const dl2=DL();drawPlan(dl2,{...pp,fixtures:(pp.fixtures||[])},lv,G.sc,G.ox,G.oy,B,k,openingMarks(p));
        for(const it of dl2.items){if(it.t==='text'&&/^(W|D)\d+$/.test(it.s))continue;dl.items.push(it.t==='poly'&&it.fill==='#262626'?{...it,fill:'#7a7a7a'}:it);}
        for(const d of devs)elecDL(dl,d,G.X,G.Y,k);
        for(const sw of devs.filter(x=>x.links&&x.links.length))for(const id of sw.links){const t=devs.find(x=>x.id===id);if(!t)continue;const A=G.PT(sw.x,sw.y),Bp=G.PT(t.x,t.y);const mx=(A[0]+Bp[0])/2,my=(A[1]+Bp[1])/2;const nx=-(Bp[1]-A[1])*0.18,ny=(Bp[0]-A[0])*0.18;const pts=[];for(let i=0;i<=12;i++){const u=i/12;pts.push([(1-u)*(1-u)*A[0]+2*u*(1-u)*(mx+nx)+u*u*Bp[0],(1-u)*(1-u)*A[1]+2*u*(1-u)*(my+ny)+u*u*Bp[1]]);}dl.poly(pts,{stroke:INK,w:0.35,close:false,dash:[0.05,0.03]});}
        const used=[...new Set(devs.map(d=>d.type))];const x0=G.A.x1-notesW;let y=G.A.y0+0.15*k;dl.text(x0,y,'ELECTRICAL LEGEND',{size:6.5*k,bold:true});y+=0.12*k;
        for(const t of used){y+=0.22*k;elecDL(dl,{type:t,x:0,y:0,rot:0},()=>x0+0.12*k,()=>y-0.04*k,k);dl.text(x0+0.35*k,y,`${ELEC[t].label} (${devs.filter(d=>d.type===t).length})`,{size:5.5*k});}
        y+=0.3*k;for(const l of ['Receptacles: 16" to center unless noted; countertop 42".','Switches 48" to center; dashed lines show which lights a switch controls.','GFCI: kitchen counters, baths, laundry, garage and outside.','AFCI on bedroom, living and other habitable-room circuits.','Smoke and CO alarms hard-wired and interconnected.','Verify with the electrical inspector; planning drawing only.']){for(const w of wrapText(l,notesW,5.2*k)){dl.text(x0,y,w,{size:5.2*k,color:MID});y+=0.11*k;}y+=0.04*k;}
      },notesW+0.2*k));}}
  // cover goes first, with the index of everything after it
  const index=[['A0.1','Cover sheet and schedules'],...out.map(s=>[s.no,s.title])];
  out.unshift(coverSheet(P,p,index,marks));
  try{out.push(schedulesSheet(P,pp));}catch(e){console.error(e);}
  try{if(pp.rooms.length)out.push(systemsSheet(P,pp));}catch(e){console.error(e);}
  try{if(pp.rooms.length)out.push(panelSheet(P,pp));}catch(e){console.error(e);}
  return out;
}
function coverSheet(P,p,index,marks){
  const k=P.k,lvls=sortedLevels(p);const dl=DL();const A=sheetFrame(dl,P,p,'A0.1','Cover sheet and schedules','');
  let y=A.y0+0.35*k;dl.text(A.x0,y,(p.name||'Untitled house').toUpperCase(),{size:20*k,bold:true});y+=0.28*k;
  const sub=[p.info?.address,p.info?.client&&('Prepared for '+p.info.client),activeOptionName(p)].filter(Boolean).join('   ·   ');if(sub){dl.text(A.x0,y,sub,{size:8*k,color:MID});y+=0.2*k;}
  y+=0.15*k;const colW=(A.x1-A.x0-0.4*k)/2;let ly=y;
  dl.text(A.x0,ly,'SHEET INDEX',{size:7*k,bold:true});ly+=0.08*k;
  ly+=drawTable(dl,A.x0,ly,[{h:'SHEET',w:0.6*k},{h:'TITLE',w:Math.min(colW-0.6*k,2.8*k)}],index,k,A.y1-2.2*k)+0.25*k;
  dl.text(A.x0,ly,'FLOOR AREA (FROM ROOMS)',{size:7*k,bold:true});ly+=0.08*k;
  const ar=lvls.map(l=>[l.name,Math.round(p.rooms.filter(r=>r.level===l.id).reduce((s,r)=>s+polyArea(r.pts),0)/144)+' SF']);ar.push(['Total',Math.round(p.rooms.reduce((s,r)=>s+polyArea(r.pts),0)/144)+' SF']);
  ly+=drawTable(dl,A.x0,ly,[{h:'LEVEL',w:1.6*k},{h:'AREA',w:1*k}],ar,k)+0.25*k;
  dl.text(A.x0,ly,'GENERAL NOTES',{size:7*k,bold:true});ly+=0.18*k;
  for(const [i,nt] of ['Planning drawings produced in Remodel Studio. They are not engineered or sealed.','Dimensions are to the outside face of framing and to the centerline of openings unless noted.','Verify all existing conditions and dimensions in the field before ordering materials.',p.settings?.code==='ibc'?'Building follows the 2021 IBC; accessibility follows IBC Chapter 11 and the 2010 ADA Standards.':'Houses follow the 2021 IRC; accessibility targets the 2010 ADA Standards.'].entries()){
    for(const [j,l] of wrapText(`${i+1}. ${nt}`,colW,6.5*k).entries()){if(ly>A.y1-0.1*k)break;dl.text(A.x0+(j?0.12*k:0),ly,l,{size:6.5*k});ly+=0.13*k;}ly+=0.04*k;}
  {const iss=runChecks(p);const ne=iss.filter(i=>i.sev==='error').length,nw=iss.length-ne;ly+=0.1*k;
    if(ly<A.y1-0.4*k){dl.text(A.x0,ly,'CODE CHECK SUMMARY',{size:7*k,bold:true});ly+=0.18*k;
      for(const l of wrapText(`As drawn: ${ne} item${ne===1?'':'s'} fail and ${nw} need review against the ${p.settings?.code==='ibc'?'2021 IBC':'2021 IRC'}${p.settings?.code==='ibc'||p.settings?.ada!==false?' and 2010 ADA Standards':''}. Planning check only; not a plan review.`,colW,6.5*k)){dl.text(A.x0,ly,l,{size:6.5*k});ly+=0.13*k;}
      for(const i of iss.slice(0,8)){if(ly>A.y1-0.15*k)break;dl.text(A.x0+0.05*k,ly,`${i.sev==='error'?'FAILS':'CHECK'}  ${i.title}${i.rule?`  (${i.rule.set} ${i.rule.code})`:''}`,{size:6*k,color:i.sev==='error'?INK:MID});ly+=0.13*k;}}}
  const rx=A.x0+colW+0.4*k;let ry=y;const lvName=id=>lvlOf(p,id)?.name||'';
  const ops=Object.entries(marks).map(([id,m])=>({m,o:p.openings.find(o=>o.id===id)})).filter(r=>r.o).sort((a,b)=>a.m.slice(1)-b.m.slice(1));const wallOf=o=>p.walls.find(w=>w.id===o.wall);
  const doors=ops.filter(r=>r.o.type==='door').map(({m,o})=>{const sp=doorSpec(p,o);const h=doorHanding(p,o);const dt=o.dtype||'swing';return [m,`${fmtLen(o.width)} x ${fmtLen(o.height)}`,`${dt==='swing'?'':DOOR_TYPES[dt]+' '}${DOOR_STYLES[o.style||'panel6']||''}`.trim(),h.res?(h.ansi?`${h.res} / ${h.ansi}`:h.res):'',dt==='overhead'?'':hwName(sp).replace(/ set,/,','),[o.width>=34?'':'32" clear?',sp.door.fire20?'20 MIN':'',sp.door.closer?'CLOSER':''].filter(Boolean).join(' ')];});
  const wins=ops.filter(r=>r.o.type==='window').map(({m,o})=>[m,fmtLen(o.width),fmtLen(o.height),fmtLen(o.sill),fmtLen(o.sill+o.height),(WINDOW_OPS.find(x=>x[0]===(o.operation||'double-hung'))||['',''])[1],lvName(wallOf(o)?.level)]);
  const cw=Math.min(colW,5.15*k)/5.15;
  dl.text(rx,ry,'DOOR SCHEDULE',{size:7*k,bold:true});ry+=0.08*k;
  ry+=drawTable(dl,rx,ry,[{h:'MARK',w:0.38*k*cw},{h:'SIZE',w:0.85*k*cw},{h:'DOOR',w:0.9*k*cw},{h:'HANDING (RES / ANSI)',w:1.05*k*cw},{h:'HARDWARE',w:1.32*k*cw},{h:'NOTES',w:0.65*k*cw}],doors,k,(A.y1+A.y0)/2+0.4*k)+0.3*k;
  dl.text(rx,ry,'WINDOW SCHEDULE',{size:7*k,bold:true});ry+=0.08*k;
  const ibcOn=p.settings?.code==='ibc';
  ry+=drawTable(dl,rx,ry,[{h:'MARK',w:0.45*k*cw},{h:'WIDTH',w:0.65*k*cw},{h:'HEIGHT',w:0.65*k*cw},{h:'SILL',w:0.65*k*cw},{h:'HEAD',w:0.65*k*cw},{h:'TYPE',w:1.0*k*cw},{h:'LEVEL',w:1.05*k*cw}],wins,k,ibcOn?A.y1-2.2*k:A.y1-0.1*k)+0.3*k;
  if(ibcOn){const IA=ibcAnalysis(p);const O=IA.O;dl.text(rx,ry,'CODE ANALYSIS (2021 IBC)',{size:7*k,bold:true});ry+=0.08*k;
    const rows=[['Occupancy',`${IA.S.occ}${IA.S.spr?', sprinklered':', not sprinklered'}`],...IA.byLevel.map(l=>[l.lv.name+' occupant load',`${l.load} (${Math.round(l.area)} SF)`]),
      ['Exits required, first floor',String(IA.byLevel[0]&&IA.byLevel[0].load<=O.oneExit.load?1:IA.exitsFor(Math.max(1,IA.byLevel[0]?.load||0)))],['Travel distance limit',`${IA.S.spr?O.travelSpr:O.travel} ft (1017.2)`],
      ['Toilets / lavatories',`${IA.need.wc} / ${IA.need.lav} required, ${IA.have.wc} / ${IA.have.lav} shown`],['Drinking fountain / service sink',`${IA.need.df} / ${IA.need.service}`]];
    drawTable(dl,rx,ry,[{h:'ITEM',w:2.2*k*cw},{h:'VALUE',w:2.9*k*cw}],rows,k,A.y1-0.1*k);}
  return {id:'cover',no:'A0.1',title:'Cover sheet and schedules',w:P.w,h:P.h,items:dl.items};
}
/* ---- DXF export (AutoCAD R12, inches, one file per level) ---- */
function dxfForLevel(p,lv){
  const E=[];const marks=openingMarks(p);const Y=y=>-y;
  const line=(layer,x1,y1,x2,y2)=>E.push(`0\nLINE\n8\n${layer}\n10\n${x1.toFixed(4)}\n20\n${Y(y1).toFixed(4)}\n30\n0\n11\n${x2.toFixed(4)}\n21\n${Y(y2).toFixed(4)}\n31\n0`);
  const text=(layer,x,y,h,s,center)=>E.push(`0\nTEXT\n8\n${layer}\n10\n${x.toFixed(4)}\n20\n${Y(y).toFixed(4)}\n30\n0\n40\n${h}\n1\n${String(s).replace(/\n/g,' ')}${center?`\n72\n1\n11\n${x.toFixed(4)}\n21\n${Y(y).toFixed(4)}\n31\n0`:''}`);
  const arc=(layer,cx,cy,r,a0,a1)=>E.push(`0\nARC\n8\n${layer}\n10\n${cx.toFixed(4)}\n20\n${Y(cy).toFixed(4)}\n30\n0\n40\n${r.toFixed(4)}\n50\n${a0.toFixed(3)}\n51\n${a1.toFixed(3)}`);
  const walls=p.walls.filter(w=>w.level===lv.id&&w.status!=='demolish');const J=wallJoins(walls);
  for(const w of walls){const L=wlen(w),d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2;const ja=J[w.id]?.a||0,jb=J[w.id]?.b||0;const layer=w.status==='existing'?'A-WALL-EXST':'A-WALL';
    const P=(s,o)=>[w.x1+d.x*s+n.x*o,w.y1+d.y*s+n.y*o];const ops=p.openings.filter(o=>o.wall===w.id).map(o=>{const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));return {o,s0:pos-o.width/2,s1:pos+o.width/2};}).sort((a,b)=>a.s0-b.s0);
    let c=-ja;const pieces=[];for(const q of ops){if(q.s0>c)pieces.push([c,q.s0]);c=Math.max(c,q.s1);}if(c<L+jb)pieces.push([c,L+jb]);
    for(const [s0,s1] of pieces)for(const o of [t,-t])line(layer,...P(s0,o),...P(s1,o));
    if(!ja)line(layer,...P(-ja,t),...P(-ja,-t));if(!jb)line(layer,...P(L+jb,t),...P(L+jb,-t));
    for(const q of ops){line(layer,...P(q.s0,t),...P(q.s0,-t));line(layer,...P(q.s1,t),...P(q.s1,-t));const o=q.o;
      if(o.type==='window'){line('A-GLAZ',...P(q.s0,0),...P(q.s1,0));line('A-GLAZ',...P(q.s0,t),...P(q.s1,t));line('A-GLAZ',...P(q.s0,-t),...P(q.s1,-t));}
      else{for(const g of doorGeom(o,t,q.s0,q.s1))for(let i=0;i+1<g.pts.length;i++)line('A-DOOR',...P(...g.pts[i]),...P(...g.pts[i+1]));}
      const mk=marks[o.id];if(mk){const tp=P((q.s0+q.s1)/2,(o.type==='door'?-(o.swing||1):1)*(t+10));text('A-ANNO-TAGS',tp[0],tp[1],4,mk,true);}}}
  for(const r of p.rooms.filter(r=>r.level===lv.id)){for(let i=0;i<r.pts.length;i++){const a=r.pts[i],b=r.pts[(i+1)%r.pts.length];line('A-AREA',a[0],a[1],b[0],b[1]);}
    const [cx,cy]=polyLabelPt(r.pts);text('A-AREA-IDEN',cx,cy,6,r.name.toUpperCase(),true);text('A-AREA-IDEN',cx,cy+9,4,Math.round(polyArea(r.pts)/144)+' SF',true);}
  for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id&&f.status!=='demolish')){const c=fxCorners(f);for(let i=0;i<4;i++)line(f.type==='wallcab'?'A-FLOR-CASE-UPPR':'A-FLOR-FIXT',c[i].x,c[i].y,c[(i+1)%4].x,c[(i+1)%4].y);}
  for(const s of p.stairs.filter(s=>s.level===lv.id)){const g=stairGeo(p,s);for(const c of stairPieces(g))for(let i=0;i<c.length;i++)line('A-FLOR-STRS',c[i].x,c[i].y,c[(i+1)%c.length].x,c[(i+1)%c.length].y);}
  const layers=['A-WALL','A-WALL-EXST','A-GLAZ','A-DOOR','A-AREA','A-AREA-IDEN','A-ANNO-TAGS','A-FLOR-FIXT','A-FLOR-CASE-UPPR','A-FLOR-STRS'];const colors=[7,8,4,2,9,7,3,6,6,5];
  const tbl=`0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n${layers.length}\n`+layers.map((l,i)=>`0\nLAYER\n2\n${l}\n70\n0\n62\n${colors[i]}\n6\n${l==='A-FLOR-CASE-UPPR'?'DASHED':'CONTINUOUS'}`).join('\n')+`\n0\nENDTAB\n0\nENDSEC`;
  return `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n1\n0\nENDSEC\n${tbl}\n0\nSECTION\n2\nENTITIES\n${E.join('\n')}\n0\nENDSEC\n0\nEOF\n`;
}
async function exportDXF(p){await loadScript('https://cdn.jsdelivr.net/npm/fflate@0.7.4/umd/index.js');const pp=filteredProject(p,'proposed');const files={};
  for(const lv of sortedLevels(p))files[`${safeName(p.name)} ${safeName(lv.name)}.dxf`]=fflate.strToU8(dxfForLevel(pp,lv));
  files['README.txt']=fflate.strToU8('DXF floor plans from Remodel Studio, AutoCAD R12 format, drawn full size in inches (1 unit = 1 inch).\nLayers follow the US National CAD Standard names: A-WALL, A-DOOR, A-GLAZ, A-AREA and so on.\nOpen in AutoCAD, DraftSight, LibreCAD, QCAD, FreeCAD or 20-20 imports that accept DXF.\n');
  return saveFile(safeName(p.name)+' DXF plans.zip',new Blob([fflate.zipSync(files,{level:6})],{type:'application/zip'}));}
