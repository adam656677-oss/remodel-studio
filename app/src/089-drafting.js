/* ======================= ramps, custom shapes, dimensions and notes ======================= */
/* ---- ADA ramp: x,y is the top end (at the door); it runs down in direction dir ---- */
function rampInfo(p,r){
  const slope=Math.max(12,r.slope||12);const rise=Math.max(0,r.rise??((lvlOf(p,r.level)||p.levels[0]).elevation-gradeAt(p,r.x,r.y)));const maxRun=r.maxRise||30;
  const nRuns=Math.max(1,Math.ceil(rise/maxRun-1e-9));const runRise=rise/nRuns;const runLen=runRise*slope;const land=Math.max(60,r.landing||60);
  const d=DIRS[r.dir]||DIRS.S;const n={x:-d.y,y:d.x};const pieces=[];let s=0,z=0; // z measured down from the top
  pieces.push({kind:'landing',s0:0,s1:land,z0:0,z1:0,top:true});s=land;
  for(let i=0;i<nRuns;i++){pieces.push({kind:'run',s0:s,s1:s+runLen,z0:z,z1:z+runRise});s+=runLen;z+=runRise;if(i<nRuns-1){pieces.push({kind:'landing',s0:s,s1:s+land,z0:z,z1:z});s+=land;}}
  pieces.push({kind:'landing',s0:s,s1:s+land,z0:z,z1:z,bottom:true});s+=land;
  const W=r.width||48;const P=(sAlong,off)=>({x:r.x+d.x*sAlong+n.x*off,y:r.y+d.y*sAlong+n.y*off});
  return {slope,rise,nRuns,runRise,runLen,land,total:s,width:W,pieces,d,n,P,rails:rise>6,corners:[P(0,-W/2),P(0,W/2),P(s,W/2),P(s,-W/2)]};
}
function rampChecks(p,add){
  for(const r of p.ramps||[]){const ri=rampInfo(p,r);const T={kind:'ramp',id:r.id};const pt={x:r.x,y:r.y};const R=(code,title)=>({set:'ADA',code,title});
    if(ri.slope<12-1e-6)add('error',R('405.2','Ramp slope'),'Ramp too steep',`1:${ri.slope}; the maximum is 1:12.`,T,pt,r.level);
    if(ri.runRise>30.01)add('error',R('405.6','Ramp rise'),'Ramp run rises too much',`Each run rises ${fmtLen(ri.runRise)}; the limit is 30" between landings.`,T,pt,r.level);
    if(ri.width-(ri.rails?3.5:0)<36-0.01)add('error',R('405.5','Ramp clear width'),'Ramp too narrow',`About ${fmtLen(ri.width-(ri.rails?3.5:0))} between handrails; needs 36".`,T,pt,r.level);
    if(ri.land<60)add('error',R('405.7.3','Landing length'),'Ramp landings too short','Landings must be at least 60" long.',T,pt,r.level);
    if(ri.rails&&r.rails===false)add('error',R('405.8','Handrails'),'Ramp needs handrails','Ramps that rise more than 6" need handrails on both sides, 34" to 38" high.',T,pt,r.level);
    if(ri.rise>6&&!r.edge)add('warn',R('405.9','Edge protection'),'Add ramp edge protection','Use a 4" curb or a rail so a wheel cannot drop off the side.',T,pt,r.level);}
}
function rampTakeoff(p,add,W){
  for(const r of p.ramps||[]){if(r.status==='existing')continue;const ri=rampInfo(p,r);const area=ri.total*ri.width/144;const mat=r.mat||'wood';
    if(mat==='concrete'){add('Ramps and site',`Concrete for ramp and landings (4" slab plus fill)`,Math.ceil(area*(4/12)/27*W*10)/10+Math.ceil(area*(ri.rise/2/12)/27*10)/10,'CY','fill depth averaged; confirm');add('Ramps and site','Ramp forming and finishing',Math.ceil(area),'SF');}
    else{add('Ramps and site','5/4x6 treated decking, 16\'',Math.ceil(ri.total/5.5/Math.max(1,Math.floor(192/ri.width))*W),'EA','boards run across the ramp');add('Ramps and site','2x8 treated joist, 16\'',(Math.ceil(ri.width/16)+1)*Math.ceil(ri.total/192),'EA','16" o.c. along the ramp');add('Ramps and site','4x4 treated post',Math.ceil(ri.total/72+1)*2,'EA','6\' o.c. both sides');}
    if(ri.rails)add('Ramps and site','Handrail, 1-1/2" round, both sides',Math.ceil((ri.total+24)*2/12),'LF','extend 12" past top and bottom');
    if(ri.rise>6)add('Ramps and site','Edge curb or guard',Math.ceil(ri.total*2/12),'LF');}
}
/* ---- custom shapes ---- */
function shapeOutline(s){if(s.kind==='round'){const pts=[];const r=(s.d||24)/2;for(let i=0;i<32;i++){const a=i/32*Math.PI*2;pts.push([s.cx+r*Math.cos(a),s.cy+r*Math.sin(a)]);}return pts;}return s.pts||[];}
function shapeCenter(s){if(s.kind==='round')return {x:s.cx,y:s.cy};const c=polyLabelPt(s.pts);return {x:c[0],y:c[1]};}
function moveShape(s,dx,dy){return s.kind==='round'?{...s,cx:s.cx+dx,cy:s.cy+dy}:{...s,pts:s.pts.map(([x,y])=>[x+dx,y+dy]),holes:(s.holes||[]).map(h=>h.map(([x,y])=>[x+dx,y+dy]))};}
function cutShape(p,targetId,cutterId){const t=(p.shapes||[]).find(s=>s.id===targetId),c=(p.shapes||[]).find(s=>s.id===cutterId);if(!t||!c||t.kind==='round')return null;
  const hole=shapeOutline(c);if(!hole.every(([x,y])=>inPoly(x,y,t.pts)))return null;
  const rest=(p.shapes||[]).filter(s=>s.id!==cutterId).map(s=>s.id===targetId?{...s,holes:[...(s.holes||[]),hole]}:s);return {...p,shapes:rest};}
function addShapes3D(p,lv,add,std,sel,mSel){
  for(const s of (p.shapes||[]).filter(s=>s.level===lv.id&&s.status!=='demolish')){CUR_TAG={kind:'shape',id:s.id};const col=s.color?hexNum(s.color):0xd9d4c7;const mat=sel&&sel.id===s.id?mSel:std('shape-'+col,col,{roughness:.75});const z0=lv.elevation+(s.z||0);
    if(s.kind==='round'){const g=new THREE.CylinderGeometry((s.dTop??s.d)/2*IN,s.d/2*IN,s.h*IN,40);add(g,mat,s.cx*IN,(z0+s.h/2)*IN,s.cy*IN);continue;}
    if((s.pts||[]).length<3)continue;const sh=new THREE.Shape(s.pts.map(q=>new THREE.Vector2(q[0]*IN,q[1]*IN)));for(const h of s.holes||[])sh.holes.push(new THREE.Path(h.map(q=>new THREE.Vector2(q[0]*IN,q[1]*IN))));
    const g=new THREE.ExtrudeGeometry(sh,{depth:s.h*IN,bevelEnabled:false});g.rotateX(Math.PI/2);add(g,mat,0,(z0+s.h)*IN,0);}
}
function addRamps3D(p,lv,add,std,sel,mSel){
  for(const r of (p.ramps||[]).filter(r=>r.level===lv.id)){CUR_TAG={kind:'ramp',id:r.id};const ri=rampInfo(p,r);const isSel=sel&&sel.id===r.id;const col=(r.mat||'wood')==='concrete'?0xc9c6bd:0xa98a62;const m=isSel?mSel:std('ramp-'+col,col,{roughness:.85});const mr=std('rail',0x6d7378,{roughness:.4,metalness:.4});
    const top=lv.elevation;const ry=-Math.atan2(ri.d.y,ri.d.x);
    for(const pc of ri.pieces){const L=pc.s1-pc.s0;const mid=ri.P((pc.s0+pc.s1)/2,0);const zt=top-(pc.z0+pc.z1)/2;
      if(pc.kind==='landing'){add(new THREE.BoxGeometry(L*IN,4*IN,ri.width*IN),m,mid.x*IN,(zt-2)*IN,mid.y*IN,ry);if(zt-4>0.5){add(new THREE.BoxGeometry(L*IN,(zt-4)*IN,ri.width*IN),m,mid.x*IN,((zt-4)/2)*IN,mid.y*IN,ry);}}
      else{const dz=pc.z1-pc.z0;const len=Math.hypot(L,dz);const g=new THREE.BoxGeometry(len*IN,4*IN,ri.width*IN);const mesh=add(g,m,mid.x*IN,(zt-2)*IN,mid.y*IN,0);mesh.rotation.set(0,ry,0);mesh.rotateZ(-Math.atan2(dz,L));}
      if(ri.rails&&r.rails!==false)for(const sd of [-1,1]){const a=ri.P(pc.s0,sd*(ri.width/2-1)),b=ri.P(pc.s1,sd*(ri.width/2-1));const za=top-pc.z0+36,zb=top-pc.z1+36;
        const v=new THREE.Vector3((b.x-a.x)*IN,(zb-za)*IN,(b.y-a.y)*IN);const len=v.length();const cyl=new THREE.CylinderGeometry(0.75*IN,0.75*IN,len,10);const mm=add(cyl,mr,(a.x+b.x)/2*IN,(za+zb)/2*IN,(a.y+b.y)/2*IN,0,false);mm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());
        const post=add(new THREE.CylinderGeometry(0.9*IN,0.9*IN,36*IN,8),mr,a.x*IN,(top-pc.z0+18)*IN,a.y*IN,0,false);}}}
}
function addElec3D(p,lv,add,std,sel,mSel){
  const mW=std('elec-plate',0xf4f4f0,{roughness:.5});const mL=M('elec-light',()=>new THREE.MeshStandardMaterial({color:0xfffaf0,emissive:0xfff1d0,emissiveIntensity:0.6}));
  for(const d of (p.elec||[]).filter(d=>d.level===lv.id&&d.status!=='demolish')){const e=ELEC[d.type];if(!e)continue;CUR_TAG={kind:'elec',id:d.id};const isSel=sel&&sel.id===d.id;const a=-(d.rot||0)*Math.PI/180;
    if(e.mount==='wall'){const pw=d.type==='panel'?14:d.type==='exterior'||d.type==='sconce'?5:2.75,ph=d.type==='panel'?30:d.type==='exterior'||d.type==='sconce'?8:4.5;
      add(new THREE.BoxGeometry(0.6*IN,ph*IN,pw*IN),isSel?mSel:(isLight(d)?mL:mW),d.x*IN,(lv.elevation+d.h)*IN,d.y*IN,a,false);}
    else{const r=d.type==='fan'?24:d.type==='can'?3:d.type==='exhaust'?5:['smoke','co','combo'].includes(d.type)?3:6;const z=lv.elevation+lv.height-1;
      add(new THREE.CylinderGeometry(r*IN,r*IN,1.5*IN,d.type==='fan'?24:16),isSel?mSel:(isLight(d)&&d.type!=='fan'?mL:mW),d.x*IN,z*IN,d.y*IN,0,false);}}
}
/* ---- plan drawing helpers for screen ---- */
function draftSVG(p,lv,S,view,sel){
  const out=[];const s=view.s;const isSel=id=>!!sel&&(sel.id===id||(sel.kind==='multi'&&sel.items.some(i=>i.id===id)));
  for(const r of (p.ramps||[]).filter(r=>r.level===lv.id)){const ri=rampInfo(p,r);const c=ri.corners.map(q=>S(q.x,q.y).join(',')).join(' ');const parts=[html`<polygon key="o" points=${c} className=${'ramp'+(isSel(r.id)?' ramp-sel':'')}/>`];
    ri.pieces.forEach((pc,i)=>{if(pc.kind!=='run'){const a=ri.P(pc.s1,-ri.width/2),b=ri.P(pc.s1,ri.width/2);if(pc.s1<ri.total-0.1){const A=S(a.x,a.y),B=S(b.x,b.y);parts.push(html`<line key=${'l'+i} x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className="ramp-l"/>`);}return;}
      const a=ri.P(pc.s0+4,0),b=ri.P(pc.s1-4,0);const A=S(a.x,a.y),B=S(b.x,b.y);const ang=Math.atan2(B[1]-A[1],B[0]-A[0]);const ah=7;
      parts.push(html`<line key=${'r'+i} x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className="ramp-l"/>`,html`<polygon key=${'h'+i} points=${[B,[B[0]-ah*Math.cos(ang-0.45),B[1]-ah*Math.sin(ang-0.45)],[B[0]-ah*Math.cos(ang+0.45),B[1]-ah*Math.sin(ang+0.45)]].map(q=>q.join(',')).join(' ')} className="ramp-a"/>`);
      const m=ri.P((pc.s0+pc.s1)/2,0);const M_=S(m.x,m.y);parts.push(html`<text key=${'t'+i} x=${M_[0]} y=${M_[1]-6} textAnchor="middle" className="ramp-t halo">DN 1:${ri.slope}</text>`);
      if(ri.rails&&r.rails!==false)for(const sd of [-1,1]){const q0=ri.P(pc.s0,sd*(ri.width/2-1)),q1=ri.P(pc.s1,sd*(ri.width/2-1));const Q0=S(q0.x,q0.y),Q1=S(q1.x,q1.y);parts.push(html`<line key=${'hr'+i+sd} x1=${Q0[0]} y1=${Q0[1]} x2=${Q1[0]} y2=${Q1[1]} className="ramp-rail"/>`);}});
    out.push(html`<g key=${r.id}>${parts}</g>`);}
  for(const sh of (p.shapes||[]).filter(x=>x.level===lv.id)){const o=shapeOutline(sh);if(o.length<3)continue;out.push(html`<g key=${sh.id}><polygon points=${o.map(q=>S(q[0],q[1]).join(',')).join(' ')} className=${'shape'+(isSel(sh.id)?' shape-sel':'')}/>${(sh.holes||[]).map((h,i)=>html`<polygon key=${i} points=${h.map(q=>S(q[0],q[1]).join(',')).join(' ')} className="shape-hole"/>`)}
    ${s>0.4&&sh.name?(()=>{const c=shapeCenter(sh);const [x,y]=S(c.x,c.y);return html`<text x=${x} y=${y+4} textAnchor="middle" className="shape-t halo">${sh.name}</text>`;})():null}</g>`);}
  for(const dm of (p.dims||[]).filter(x=>x.level===lv.id)){const L=dist(dm.a,dm.b);if(L<0.5)continue;const d={x:(dm.b.x-dm.a.x)/L,y:(dm.b.y-dm.a.y)/L},n={x:-d.y,y:d.x};const off=dm.off??18;
    const a=S(dm.a.x+n.x*off,dm.a.y+n.y*off),b=S(dm.b.x+n.x*off,dm.b.y+n.y*off),a0=S(dm.a.x,dm.a.y),b0=S(dm.b.x,dm.b.y);const cls='udim'+(isSel(dm.id)?' udim-sel':'');
    let ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;if(ang>90)ang-=180;if(ang<=-90)ang+=180;const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;const t=5;
    out.push(html`<g key=${dm.id}><line x1=${a0[0]} y1=${a0[1]} x2=${a[0]} y2=${a[1]} className="udim-ext"/><line x1=${b0[0]} y1=${b0[1]} x2=${b[0]} y2=${b[1]} className="udim-ext"/><line x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]} className=${cls}/>
      ${[a,b].map((q,i)=>html`<line key=${i} x1=${q[0]-t} y1=${q[1]+t} x2=${q[0]+t} y2=${q[1]-t} className=${cls} strokeWidth="2"/>`)}<text x=${mx} y=${my-5} textAnchor="middle" transform=${`rotate(${ang} ${mx} ${my})`} className=${'udim-t halo'+(isSel(dm.id)?' udim-sel':'')}>${dm.label||fmtLen(Math.round(L*16)/16)}</text></g>`);}
  for(const n of (p.annos||[]).filter(x=>x.level===lv.id)){const [x,y]=S(n.x,n.y);const lines=String(n.text||'').split('\n');const fs=Math.max(10,Math.min(22,(n.size||9)*1.35*Math.min(1.4,Math.max(0.7,s))));
    out.push(html`<g key=${n.id}>${n.leader?(()=>{const [lx,ly]=S(n.leader.x,n.leader.y);return html`<line x1=${x} y1=${y} x2=${lx} y2=${ly} className="anno-l"/><circle cx=${lx} cy=${ly} r="2.5" className="anno-dot"/>`;})():null}
      <text x=${x} y=${y} className=${'anno halo'+(isSel(n.id)?' anno-sel':'')} style=${{fontSize:fs+'px'}}>${lines.map((l,i)=>html`<tspan key=${i} x=${x} dy=${i?fs*1.2:0}>${l}</tspan>`)}</text></g>`);}
  return out;
}
function draftHit(p,lv,raw,tolIn){
  for(const n of (p.annos||[]).filter(x=>x.level===lv.id)){const lines=String(n.text||'').split('\n');const fs=(n.size||9)*1.35;const k=tolIn/8;const w=Math.max(...lines.map(l=>l.length))*fs*0.6*k,h=lines.length*fs*1.2*k;
    if(raw.x>=n.x-tolIn*0.5&&raw.x<=n.x+w&&raw.y>=n.y-fs*k&&raw.y<=n.y+h)return {kind:'anno',o:n};}
  for(const d of (p.elec||[]).filter(x=>x.level===lv.id))if(Math.hypot(d.x-raw.x,d.y-raw.y)<tolIn*1.3)return {kind:'elec',o:d};
  for(const dm of (p.dims||[]).filter(x=>x.level===lv.id)){const L=dist(dm.a,dm.b);if(L<0.5)continue;const d={x:(dm.b.x-dm.a.x)/L,y:(dm.b.y-dm.a.y)/L},n={x:-d.y,y:d.x};const off=dm.off??18;if(projSeg(raw,{x:dm.a.x+n.x*off,y:dm.a.y+n.y*off},{x:dm.b.x+n.x*off,y:dm.b.y+n.y*off}).d<tolIn)return {kind:'dim',o:dm};}
  for(const r of (p.ramps||[]).filter(x=>x.level===lv.id))if(inPoly(raw.x,raw.y,rampInfo(p,r).corners.map(c=>[c.x,c.y])))return {kind:'ramp',o:r};
  for(const s of (p.shapes||[]).filter(x=>x.level===lv.id))if(inPoly(raw.x,raw.y,shapeOutline(s)))return {kind:'shape',o:s};
  return null;
}
function moveDraft(B,kind,id,dx,dy){
  if(kind==='elec'){const d=B.elec.find(x=>x.id===id);return updObj(B,'elec',id,{x:d.x+dx,y:d.y+dy});}
  if(kind==='ramp'){const r=B.ramps.find(x=>x.id===id);return updObj(B,'ramp',id,{x:r.x+dx,y:r.y+dy});}
  if(kind==='shape'){return {...B,shapes:B.shapes.map(s=>s.id===id?moveShape(s,dx,dy):s)};}
  if(kind==='dim'){const m=B.dims.find(x=>x.id===id);return updObj(B,'dim',id,{a:{x:m.a.x+dx,y:m.a.y+dy},b:{x:m.b.x+dx,y:m.b.y+dy}});}
  if(kind==='anno'){const n=B.annos.find(x=>x.id===id);return updObj(B,'anno',id,{x:n.x+dx,y:n.y+dy,leader:n.leader?{x:n.leader.x+dx,y:n.leader.y+dy}:null});}
  return B;
}
/* ---- paper drawing (sheets) ---- */
function draftDL(dl,p,lv,X,Y,sc,k,{elec=false}={}){
  const PT=(x,y)=>[X(x),Y(y)];
  for(const r of (p.ramps||[]).filter(r=>r.level===lv.id)){const ri=rampInfo(p,r);dl.poly(ri.corners.map(q=>PT(q.x,q.y)),{stroke:INK,w:0.7,fill:'#ffffff'});
    for(const pc of ri.pieces){if(pc.kind!=='run'){if(pc.s1<ri.total-0.1){const a=ri.P(pc.s1,-ri.width/2),b=ri.P(pc.s1,ri.width/2);dl.line(...PT(a.x,a.y),...PT(b.x,b.y),0.4);}continue;}
      const a=ri.P(pc.s0+4,0),b=ri.P(pc.s1-4,0);const A=PT(a.x,a.y),B=PT(b.x,b.y);dl.line(...A,...B,0.5);const ang=Math.atan2(B[1]-A[1],B[0]-A[0]),ah=0.06*k;dl.poly([B,[B[0]-ah*Math.cos(ang-0.45),B[1]-ah*Math.sin(ang-0.45)],[B[0]-ah*Math.cos(ang+0.45),B[1]-ah*Math.sin(ang+0.45)]],{fill:INK});
      const m=ri.P((pc.s0+pc.s1)/2,ri.width/4);dl.text(...PT(m.x,m.y),`DN 1:${ri.slope}`,{size:5.5*k,anchor:'middle',bold:true});
      if(ri.rails&&r.rails!==false)for(const sd of [-1,1]){const q0=ri.P(pc.s0,sd*(ri.width/2-1)),q1=ri.P(pc.s1,sd*(ri.width/2-1));dl.line(...PT(q0.x,q0.y),...PT(q1.x,q1.y),0.35,{dash:[0.04,0.03]});}}
    const c=ri.P(ri.total/2,-ri.width/2-14);dl.text(...PT(c.x,c.y),`ADA RAMP, ${fmtLen(ri.rise)} RISE, ${ri.nRuns} RUN${ri.nRuns>1?'S':''}, 60" LANDINGS`,{size:5*k,anchor:'middle'});}
  for(const sh of (p.shapes||[]).filter(x=>x.level===lv.id)){const o=shapeOutline(sh);if(o.length<3)continue;dl.poly(o.map(q=>PT(q[0],q[1])),{stroke:INK,w:0.5,fill:'#eeeeee',holes:(sh.holes||[]).map(h=>h.map(q=>PT(q[0],q[1])))});
    if(sh.name){const c=shapeCenter(sh);dl.text(...PT(c.x,c.y),sh.name.toUpperCase(),{size:5*k,anchor:'middle'});}}
  for(const dm of (p.dims||[]).filter(x=>x.level===lv.id)){const L=dist(dm.a,dm.b);if(L<0.5)continue;const d={x:(dm.b.x-dm.a.x)/L,y:(dm.b.y-dm.a.y)/L},n={x:-d.y,y:d.x};const off=dm.off??18;
    const a=PT(dm.a.x+n.x*off,dm.a.y+n.y*off),b=PT(dm.b.x+n.x*off,dm.b.y+n.y*off);dl.line(...PT(dm.a.x,dm.a.y),...a,0.3,{color:MID});dl.line(...PT(dm.b.x,dm.b.y),...b,0.3,{color:MID});dl.line(...a,...b,0.45);
    const t=0.055*k;for(const q of [a,b])dl.line(q[0]-t,q[1]+t,q[0]+t,q[1]-t,1.1);let ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;if(ang>90)ang-=180;if(ang<=-90)ang+=180;
    dl.text((a[0]+b[0])/2,(a[1]+b[1])/2-0.05*k,dm.label||fmtLen(Math.round(L*16)/16),{size:6.5*k,anchor:'middle',rot:-ang});}
  for(const nt of (p.annos||[]).filter(x=>x.level===lv.id)){const [x,y]=PT(nt.x,nt.y);if(nt.leader){const [lx,ly]=PT(nt.leader.x,nt.leader.y);dl.line(x,y,lx,ly,0.4);dl.circle(lx,ly,0.02*k,{fill:INK});}
    String(nt.text||'').split('\n').forEach((l,i)=>dl.text(x,y+i*(nt.size||9)*k/72*1.25,l.toUpperCase(),{size:(nt.size||9)*k*0.8}));}
  if(elec){for(const d of (p.elec||[]).filter(x=>x.level===lv.id&&x.status!=='demolish'))elecDL(dl,d,X,Y,k);
    for(const sw of (p.elec||[]).filter(x=>x.level===lv.id&&x.links&&x.links.length))for(const id of sw.links){const t=(p.elec||[]).find(x=>x.id===id);if(!t)continue;const A=PT(sw.x,sw.y),B=PT(t.x,t.y);const mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2;const nx=-(B[1]-A[1])*0.18,ny=(B[0]-A[0])*0.18;
      const pts=[];for(let i=0;i<=12;i++){const u=i/12;pts.push([(1-u)*(1-u)*A[0]+2*u*(1-u)*(mx+nx)+u*u*B[0],(1-u)*(1-u)*A[1]+2*u*(1-u)*(my+ny)+u*u*B[1]]);}dl.poly(pts,{stroke:INK,w:0.35,close:false,dash:[0.05,0.03]});}}
}
