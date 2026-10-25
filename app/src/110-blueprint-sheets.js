/* ======================= blueprint sheets ======================= */
// Sheets are built as a display list in paper inches (y down), then drawn to SVG for the screen and to jsPDF for export,
// so the preview and the PDF come from the same geometry.
const SCALES=[[0.5,'1/2" = 1\'-0"'],[0.375,'3/8" = 1\'-0"'],[0.25,'1/4" = 1\'-0"'],[0.1875,'3/16" = 1\'-0"'],[0.125,'1/8" = 1\'-0"'],[0.09375,'3/32" = 1\'-0"'],[0.0625,'1/16" = 1\'-0"']];
const PAPERS={archd:{label:'24 x 36 in (ARCH D)',w:36,h:24,tb:3.2,k:1.3},tabloid:{label:'11 x 17 in (Tabloid)',w:17,h:11,tb:2.3,k:0.92},letter:{label:'8.5 x 11 in (Letter)',w:11,h:8.5,tb:1.75,k:0.74}};
const INK='#111111', MID='#555555', LIGHTI='#8c8c8c', FILL_NEW='#262626', FILL_EX='#b4b4b4';
const FONT='Helvetica, Arial, sans-serif';
const tw=(s,size,bold)=>String(s).length*size/72*(bold?0.6:0.54);

function DL(){const a=[];return {items:a,
  line(x1,y1,x2,y2,w=0.5,o={}){a.push({t:'line',x1,y1,x2,y2,w,...o});},
  poly(pts,o={}){a.push({t:'poly',pts,...o});},
  text(x,y,s,o={}){a.push({t:'text',x,y,s:String(s),size:o.size||8,anchor:o.anchor||'start',rot:o.rot||0,bold:!!o.bold,color:o.color||INK});},
  circle(cx,cy,r,o={}){a.push({t:'circle',cx,cy,r,...o});},
};}
const arcPts=(cx,cy,r,a0,a1,n=14)=>{const out=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;out.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return out;};
function wrapText(s,maxW,size,bold){const words=String(s).split(/\s+/).filter(Boolean);const lines=[];let cur='';
  for(const w of words){const t=cur?cur+' '+w:w;if(tw(t,size,bold)>maxW&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);return lines;}

/* ---- opening marks shared by plans and schedules ---- */
function openingMarks(p){
  const order=sortedLevels(p).map(l=>l.id); const rows=[];
  for(const o of p.openings){const w=p.walls.find(w=>w.id===o.wall);if(!w)continue;const d=wdir(w);
    rows.push({o,w,li:order.indexOf(w.level),x:w.x1+d.x*o.pos,y:w.y1+d.y*o.pos});}
  rows.sort((a,b)=>a.li-b.li||Math.round(a.y/24)-Math.round(b.y/24)||a.x-b.x);
  const m={};let nd=0,nw=0;for(const r of rows)m[r.o.id]=r.o.type==='door'?'D'+(++nd):'W'+(++nw);
  return m;
}

/* ---- exterior wall sides ---- */
function extInside(ext,pt){let c=false;for(const w of ext){const a={x:w.x1,y:w.y1},b={x:w.x2,y:w.y2};if((a.y>pt.y)!==(b.y>pt.y)){const ix=a.x+(pt.y-a.y)*(b.x-a.x)/(b.y-a.y);if(ix>pt.x)c=!c;}}return c;}
function outwardNormal(ext,w){const d=wdir(w);let n={x:-d.y,y:d.x};const mx=(w.x1+w.x2)/2,my=(w.y1+w.y2)/2;
  if(extInside(ext,{x:mx+n.x*(w.thick/2+2),y:my+n.y*(w.thick/2+2)}))n={x:-n.x,y:-n.y};return n;}
function sideDims(p,lvId){
  const walls=p.walls.filter(w=>w.level===lvId&&w.status!=='demolish'); const ext=walls.filter(w=>w.kind==='exterior'); const J=wallJoins(walls);
  const S={top:{c:[],o:[]},bottom:{c:[],o:[]},left:{c:[],o:[]},right:{c:[],o:[]}};
  for(const w of ext){const d=wdir(w),n=outwardNormal(ext,w);const horiz=Math.abs(d.y)<0.01,vert=Math.abs(d.x)<0.01;if(!horiz&&!vert)continue;
    const side=horiz?(n.y<0?'top':'bottom'):(n.x<0?'left':'right'); const ax=horiz?'x':'y';
    const ja=J[w.id]?.a||0,jb=J[w.id]?.b||0; const a={x:w.x1-d.x*ja,y:w.y1-d.y*ja},b={x:w.x2+d.x*jb,y:w.y2+d.y*jb};
    S[side].c.push(a[ax],b[ax]);
    for(const o of p.openings.filter(o=>o.wall===w.id)){S[side].o.push(w[ax+'1']+d[ax]*o.pos);}
  }
  const uniq=arr=>{const s=[...arr].sort((a,b)=>a-b);const out=[];for(const v of s)if(!out.length||Math.abs(v-out[out.length-1])>0.4)out.push(v);return out;};
  const res={};
  for(const k of Object.keys(S)){const c=uniq(S[k].c);if(c.length<2){res[k]=[];continue;}const tiers=[];
    if(S[k].o.length)tiers.push(uniq([...c,...S[k].o]));
    if(c.length>2||!tiers.length)tiers.push(c);
    if(c.length>2)tiers.push([c[0],c[c.length-1]]);
    res[k]=tiers;}
  return res;
}

/* ---- dimension chain ---- */
function dimChain(dl,coords,horiz,linePos,objEdge,dir,map,k){
  const tick=0.055*k,ts=6.5*k; const P=c=>map(c);
  for(const c of coords){const pc=P(c);
    if(horiz){dl.line(pc,objEdge+dir*0.07*k,pc,linePos+dir*0.07*k,0.3,{color:MID});dl.line(pc-tick,linePos+tick,pc+tick,linePos-tick,1.1);}
    else{dl.line(objEdge+dir*0.07*k,pc,linePos+dir*0.07*k,pc,0.3,{color:MID});dl.line(linePos-tick,pc+tick,linePos+tick,pc-tick,1.1);}}
  const a=P(coords[0]),b=P(coords[coords.length-1]);
  if(horiz)dl.line(a-0.05*k,linePos,b+0.05*k,linePos,0.45);else dl.line(linePos,a-0.05*k,linePos,b+0.05*k,0.45);
  for(let i=0;i+1<coords.length;i++){const L=coords[i+1]-coords[i];const lab=fmtLen(L);const m=(P(coords[i])+P(coords[i+1]))/2;const seg=P(coords[i+1])-P(coords[i]);
    const tight=tw(lab,ts)>seg-0.04; const off=tight?0.16*k:0.05*k;
    if(horiz)dl.text(m,linePos-(dir<0?off:off)+(dir>0&&tight?0:0),lab,{size:ts,anchor:'middle'});
    else dl.text(linePos-off,m,lab,{size:ts,anchor:'middle',rot:-90});}
}

/* ---- floor plan drawing ---- */
function planBounds(p,lvId){
  const walls=p.walls.filter(w=>w.level===lvId);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const add=(x,y)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);};
  for(const w of walls){const t=w.thick/2;add(w.x1-t,w.y1-t);add(w.x1+t,w.y1+t);add(w.x2-t,w.y2-t);add(w.x2+t,w.y2+t);}
  for(const r of p.rooms.filter(r=>r.level===lvId))for(const q of r.pts)add(q[0],q[1]);
  for(const s of p.stairs.filter(s=>s.level===lvId))for(const c of stairGeo(p,s).outline)add(c.x,c.y);
  for(const r of (p.ramps||[]).filter(r=>r.level===lvId))for(const c of rampInfo(p,r).corners)add(c.x,c.y);
  for(const sh of (p.shapes||[]).filter(r=>r.level===lvId))for(const q of shapeOutline(sh))add(q[0],q[1]);
  for(const d of (p.dims||[]).filter(r=>r.level===lvId)){add(d.a.x,d.a.y);add(d.b.x,d.b.y);}
  for(const n of (p.annos||[]).filter(r=>r.level===lvId))add(n.x,n.y);
  for(const k of objKinds())if(!OBJ[k].noBounds)for(const o of objsOn(p,k,lvId))for(const q of regPts(p,k,o))add(q.x,q.y);
  if(x0>x1)return {x0:0,y0:0,x1:240,y1:240};return {x0,y0,x1,y1};
}
function drawPlan(dl,p,lv,sc,ox,oy,B,k,marks){
  const X=x=>ox+(x-B.x0)*sc, Y=y=>oy+(y-B.y0)*sc, PT=(x,y)=>[X(x),Y(y)];
  const walls=p.walls.filter(w=>w.level===lv.id); const J=wallJoins(walls); const ext=walls.filter(w=>w.kind==='exterior');
  // rooms first (light tint so tags read)
  for(const r of p.rooms.filter(r=>r.level===lv.id)) dl.poly(r.pts.map(q=>PT(q[0],q[1])),{fill:'#f4f4f4'});
  // stairs
  for(const s of p.stairs.filter(s=>{const l=lvlOf(p,s.level);const u=l&&levelAbove(p,l);return u&&u.id===lv.id;})){const g=stairGeo(p,s);dl.poly(g.outline.map(c=>PT(c.x,c.y)),{stroke:INK,w:0.5,dash:[0.06,0.04]});const c=g.outline.reduce((a,q)=>({x:a.x+q.x/g.outline.length,y:a.y+q.y/g.outline.length}),{x:0,y:0});const q=PT(c.x,c.y);dl.text(q[0],q[1],'DN',{size:6*k,bold:true,anchor:'middle'});}
  for(const s of p.stairs.filter(s=>s.level===lv.id))stairDL(dl,p,s,PT,k);
  for(const s of [].filter(s=>s.level===lv.id)){const si=stairInfo(p,s);dl.poly(si.corners.map(c=>PT(c.x,c.y)),{stroke:INK,w:0.6});
    for(let i=1;i<=si.treads;i++){const a=si.corners[0],b=si.corners[1];dl.line(...PT(a.x+si.d.x*s.tread*i,a.y+si.d.y*s.tread*i),...PT(b.x+si.d.x*s.tread*i,b.y+si.d.y*s.tread*i),0.4);}
    const a=PT(s.x+si.d.x*4,s.y+si.d.y*4),b=PT(s.x+si.d.x*(si.run-6),s.y+si.d.y*(si.run-6));dl.line(...a,...b,0.6);
    const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),ah=0.08*k;dl.poly([b,[b[0]-ah*Math.cos(ang-0.4),b[1]-ah*Math.sin(ang-0.4)],[b[0]-ah*Math.cos(ang+0.4),b[1]-ah*Math.sin(ang+0.4)]],{fill:INK});
    dl.text(a[0]+(b[0]-a[0])*0.5+0.06*k,a[1]+(b[1]-a[1])*0.5,`UP ${si.risers}R`,{size:6*k,bold:true});}
  // fixtures and cabinets
  for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id)){const c=fxCorners(f).map(q=>PT(q.x,q.y));const dash=f.type==='wallcab'||f.status==='demolish'?[0.05,0.03]:null;
    dl.poly(c,{stroke:INK,w:0.45,fill:'#ffffff',dash});const L=(a,b)=>{const A=fxLocal(f,...a),B2=fxLocal(f,...b);dl.line(...PT(A.x,A.y),...PT(B2.x,B2.y),0.35);};const E=(cx,cy,rx,ry)=>{const pts=[];for(let i=0;i<24;i++){const t=i/24*Math.PI*2;const q=fxLocal(f,cx+rx*Math.cos(t),cy+ry*Math.sin(t));pts.push(PT(q.x,q.y));}dl.poly(pts,{stroke:INK,w:0.35});};
    const W2=f.w/2,D2=f.d/2;
    if(f.type==='toilet'){L([-W2,-D2+8],[W2,-D2+8]);E(0,-D2+8+(f.d-8)/2,W2*0.85,(f.d-8)/2);} else if(f.type==='lav'||f.type==='vanity')E(0,1,W2*0.6,D2*0.55); else if(f.type==='tub'){const m=3;dl.poly([[-W2+m,-D2+m],[W2-m,-D2+m],[W2-m,D2-m],[-W2+m,D2-m]].map(([a,b])=>{const q=fxLocal(f,a,b);return PT(q.x,q.y);}),{stroke:INK,w:0.35});}
    else if(f.type==='shower'||f.type==='rollin'||f.type==='tall'){L([-W2,-D2],[W2,D2]);L([W2,-D2],[-W2,D2]);} else if(f.type==='range'){for(const [cx,cy] of [[-W2/2,-D2/2],[W2/2,-D2/2],[-W2/2,D2/2],[W2/2,D2/2]])E(cx,cy,Math.min(W2,D2)*0.28,Math.min(W2,D2)*0.28);}
    else if(['base','sinkbase','island'].includes(f.type))L([-W2,D2-1.5],[W2,D2-1.5]);
    const lab={fridge:'REF',dw:'DW',washer:'W',dryer:'D'}[f.type];if(lab){const q=PT(f.x,f.y);dl.text(q[0],q[1]+0.03*k,lab,{size:5*k,anchor:'middle',bold:true});}}
  // walls
  for(const w of walls){const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2,ja=J[w.id]?.a||0,jb=J[w.id]?.b||0;
    const a={x:w.x1-d.x*ja,y:w.y1-d.y*ja},b={x:w.x2+d.x*jb,y:w.y2+d.y*jb};
    const pts=[PT(a.x+n.x*t,a.y+n.y*t),PT(b.x+n.x*t,b.y+n.y*t),PT(b.x-n.x*t,b.y-n.y*t),PT(a.x-n.x*t,a.y-n.y*t)];
    if(w.status==='demolish')dl.poly(pts,{stroke:INK,w:0.5,dash:[0.06,0.04]});
    else dl.poly(pts,{fill:w.status==='existing'?FILL_EX:FILL_NEW,stroke:INK,w:0.3});}
  // openings
  for(const o of p.openings){const w=walls.find(w=>w.id===o.wall);if(!w)continue;const L=wlen(w),d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2;
    const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos)),s0=pos-o.width/2,s1=pos+o.width/2;
    const P=(s,off)=>PT(w.x1+d.x*s+n.x*off,w.y1+d.y*s+n.y*off);
    dl.poly([P(s0,t+0.4),P(s1,t+0.4),P(s1,-t-0.4),P(s0,-t-0.4)],{fill:'#ffffff'});
    dl.line(...P(s0,t),...P(s0,-t),0.6);dl.line(...P(s1,t),...P(s1,-t),0.6);
    let tagSide;
    if(o.type==='window'){dl.line(...P(s0,t),...P(s1,t),0.5);dl.line(...P(s0,-t),...P(s1,-t),0.5);dl.line(...P(s0,0),...P(s1,0),0.35);
      const on=w.kind==='exterior'?outwardNormal(ext,w):n; tagSide=(on.x*n.x+on.y*n.y)>0?1:-1;}
    else{const side=o.swing||1;for(const g of doorGeom(o,t,s0,s1))dl.poly(g.pts.map(([a,b])=>P(a,b)),{stroke:INK,w:g.dash?0.3:g.thick?0.9:0.7,close:false,dash:g.dash&&o.dtype&&o.dtype!=='swing'&&o.dtype!=='double'?[0.05,0.035]:undefined});tagSide=(o.dtype==='overhead')?side:-side;}
    const mk=marks[o.id];if(!mk)continue;const tp=P(pos,tagSide*(t+0.24*k/sc+(o.type==='door'?0:0)));const r=0.1*k;
    if(o.type==='door')dl.circle(tp[0],tp[1],r,{stroke:INK,fill:'#ffffff',w:0.5});
    else dl.poly([0,1,2,3,4,5].map(i=>[tp[0]+r*1.08*Math.cos(i*Math.PI/3),tp[1]+r*1.08*Math.sin(i*Math.PI/3)]),{stroke:INK,fill:'#ffffff',w:0.5});
    dl.text(tp[0],tp[1]+5*k/72*0.36,mk,{size:5*k,bold:true,anchor:'middle'});}
  for(const kk of objKinds('under'))if(OBJ[kk].dl&&OBJ[kk].planSheet!==false)for(const o of objsOn(p,kk,lv.id))OBJ[kk].dl(dl,p,lv,o,PT,k,sc);
  draftDL(dl,p,lv,X,Y,sc,k);
  for(const kk of objKinds('over'))if(OBJ[kk].dl&&OBJ[kk].planSheet!==false)for(const o of objsOn(p,kk,lv.id))OBJ[kk].dl(dl,p,lv,o,PT,k,sc);
  // room tags
  for(const r of p.rooms.filter(r=>r.level===lv.id)){const [cx,cy]=polyLabelPt(r.pts);const [x,y]=PT(cx,cy);const a=polyArea(r.pts)/144;
    const xs=r.pts.map(q=>q[0]),ys=r.pts.map(q=>q[1]);const rect=r.pts.length===4&&r.pts.every(q=>xs.filter(v=>Math.abs(v-q[0])<0.5).length===2&&ys.filter(v=>Math.abs(v-q[1])<0.5).length===2);
    dl.text(x,y-0.02*k,r.name.toUpperCase(),{size:7.5*k,bold:true,anchor:'middle'});
    dl.text(x,y+0.13*k,rect?`${fmtLen(Math.max(...xs)-Math.min(...xs))} x ${fmtLen(Math.max(...ys)-Math.min(...ys))}`:`${Math.round(a)} SF`,{size:5.5*k,anchor:'middle',color:MID});
    if(rect)dl.text(x,y+0.25*k,`${Math.round(a)} SF`,{size:5.5*k,anchor:'middle',color:MID});}
  // dimension strings
  const sd=sideDims(p,lv.id); const gap=0.5*k,step=0.27*k;
  sd.top.forEach((c,i)=>dimChain(dl,c,true,Y(B.y0)-gap-i*step,Y(B.y0),-1,X,k));
  sd.bottom.forEach((c,i)=>dimChain(dl,c,true,Y(B.y1)+gap+i*step+0.1*k,Y(B.y1),1,X,k));
  sd.left.forEach((c,i)=>dimChain(dl,c,false,X(B.x0)-gap-i*step,X(B.x0),-1,Y,k));
  sd.right.forEach((c,i)=>dimChain(dl,c,false,X(B.x1)+gap+i*step+0.1*k,X(B.x1),1,Y,k));
}
function drawingTitle(dl,x,y,title,scaleLabel,k,north,scIn,bearing=0){
  const r=0.16*k; dl.circle(x+r,y-r*0.4,r,{stroke:INK,w:0.8});
  dl.text(x+2*r+0.1*k,y,title.toUpperCase(),{size:10*k,bold:true});
  const tl=tw(title.toUpperCase(),10*k,true); dl.line(x+2*r+0.1*k,y+0.06*k,x+2*r+0.1*k+tl,y+0.06*k,1.2);
  dl.text(x+2*r+0.1*k,y+0.2*k,'SCALE: '+scaleLabel,{size:6.5*k});
  let nx=x+2*r+0.25*k+Math.max(tl,tw('SCALE: '+scaleLabel,6.5*k));
  if(north){const cx=nx+0.2*k,cy=y-0.05*k,R=0.15*k;const a=-bearing*Math.PI/180;const rot=([px,py])=>[cx+(px-cx)*Math.cos(a)-(py-cy)*Math.sin(a),cy+(px-cx)*Math.sin(a)+(py-cy)*Math.cos(a)];dl.circle(cx,cy,R,{stroke:INK,w:0.6});dl.poly([[cx,cy-R*1.25],[cx-R*0.45,cy+R*0.5],[cx,cy+R*0.15]].map(rot),{fill:INK});dl.poly([[cx,cy-R*1.25],[cx+R*0.45,cy+R*0.5],[cx,cy+R*0.15]].map(rot),{stroke:INK,w:0.5,fill:'#ffffff'});
    const np=rot([cx,cy-R*1.45]);dl.text(np[0],np[1]+0.03*k,'N',{size:6*k,bold:true,anchor:'middle'});nx=cx+0.35*k;}
  if(scIn){const ft=scIn>=0.25?8:scIn>=0.125?16:32;const L=ft*12*scIn/12;const bx=nx,by=y+0.08*k,h=0.05*k;
    for(let i=0;i<4;i++){const seg=L/4;dl.poly([[bx+seg*i,by-h],[bx+seg*(i+1),by-h],[bx+seg*(i+1),by],[bx+seg*i,by]],{fill:i%2?'#ffffff':INK,stroke:INK,w:0.4});}
    dl.text(bx,by-h-0.04*k,'0',{size:5*k,anchor:'middle'});dl.text(bx+L/2,by-h-0.04*k,String(ft/2),{size:5*k,anchor:'middle'});dl.text(bx+L,by-h-0.04*k,ft+' FT',{size:5*k,anchor:'middle'});}
}

/* ---- elevations ---- */
const ELEV_VIEWS={
  north:{title:'North elevation',u:(x,y)=>-x,depth:(x,y)=>y,dir:{x:0,y:1}},
  south:{title:'South elevation',u:(x,y)=>x,depth:(x,y)=>-y,dir:{x:0,y:-1}},
  east:{title:'East elevation',u:(x,y)=>-y,depth:(x,y)=>-x,dir:{x:-1,y:0}},
  west:{title:'West elevation',u:(x,y)=>y,depth:(x,y)=>x,dir:{x:1,y:0}},
};
function elevFaces(p){
  const F=[];try{foundationFaces(p,F);}catch(e){console.error(e);}try{bayFaces(p,F);}catch(e){console.error(e);}
  for(const lv of sortedLevels(p)){
    const walls=p.walls.filter(w=>w.level===lv.id&&w.status!=='demolish'); const J=wallJoins(walls); const e0=lv.elevation;
    for(const w of walls){const L=wlen(w),d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2,H=wallH(p,w);const sA=-(J[w.id]?.a||0),sB=L+(J[w.id]?.b||0);
      const at=(s,off,z)=>[w.x1+d.x*s+n.x*off,w.y1+d.y*s+n.y*off,z];
      const ops=p.openings.filter(o=>o.wall===w.id).map(o=>{const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));const sill=o.type==='door'?0:o.sill;return {o,s0:pos-o.width/2,s1:pos+o.width/2,z0:e0+sill,z1:e0+Math.min(H,sill+o.height)};});
      for(const sgn of [1,-1]){const off=sgn*t;
        F.push({kind:'wall',pts:[at(sA,off,e0),at(sB,off,e0),at(sB,off,e0+H),at(sA,off,e0+H)],holes:ops.map(q=>[at(q.s0,off,q.z0),at(q.s1,off,q.z0),at(q.s1,off,q.z1),at(q.s0,off,q.z1)]),n:{x:n.x*sgn,y:n.y*sgn},ext:w.kind==='exterior',exist:w.status==='existing'});}
      if(!(J[w.id]?.a))F.push({kind:'end',pts:[at(sA,t,e0),at(sA,-t,e0),at(sA,-t,e0+H),at(sA,t,e0+H)],n:{x:-d.x,y:-d.y}});
      if(!(J[w.id]?.b))F.push({kind:'end',pts:[at(sB,t,e0),at(sB,-t,e0),at(sB,-t,e0+H),at(sB,t,e0+H)],n:{x:d.x,y:d.y}});
      for(const q of ops){F.push({kind:q.o.type,pts:[at(q.s0,0,q.z0),at(q.s1,0,q.z0),at(q.s1,0,q.z1),at(q.s0,0,q.z1)],n:null,o:q.o});}
    }
    for(const k of objKinds())if(OBJ[k].faces)for(const o of objsOn(p,k,lv.id))if(o.status!=='demolish')OBJ[k].faces(p,lv,o,F);
    for(const r of p.roofs.filter(r=>r.level===lv.id)){const b=roofBuild(r,roofTop(p,r));
      for(const q of b.polys)F.push({kind:'roof',pts:q,n:null});for(const q of b.fpolys)F.push({kind:'gable',pts:q,n:null});}
  }
  return F;
}
function elevProject(p,F,view){
  const V=ELEV_VIEWS[view];const out=[];
  for(const f of F){if(f.n&&(f.n.x*V.dir.x+f.n.y*V.dir.y)>-1e-6)continue;
    const pr=pt=>[V.u(pt[0],pt[1]),pt[2]];const depth=Math.min(...f.pts.map(pt=>V.depth(pt[0],pt[1])));
    const pts=f.pts.map(pr);const us=pts.map(q=>q[0]);if(Math.max(...us)-Math.min(...us)<0.01&&f.kind!=='roof'&&f.kind!=='gable')continue;
    out.push({...f,p2:pts,h2:(f.holes||[]).map(h=>h.map(pr)),depth:f.kind==='window'||f.kind==='door'?depth+0.01:depth});}
  out.sort((a,b)=>b.depth-a.depth);
  let u0=1e9,u1=-1e9,z0=1e9,z1=-1e9;for(const f of out)for(const [u,z] of f.p2){u0=Math.min(u0,u);u1=Math.max(u1,u);z0=Math.min(z0,z);z1=Math.max(z1,z);}
  return {faces:out,u0,u1,z0,z1,view};
}
function drawElevation(dl,p,E,sc,ox,oy,k){
  // ox,oy: paper position of (u0, top z1)
  const U=u=>ox+(u-E.u0)*sc, Z=z=>oy+(E.z1-z)*sc; const P=q=>[U(q[0]),Z(q[1])];
  for(const f of E.faces){
    if(f.kind==='wall') dl.poly(f.p2.map(P),{holes:f.h2.map(h=>h.map(P)),fill:'#ffffff',stroke:INK,w:0.6});
    else if(f.kind==='end') dl.poly(f.p2.map(P),{fill:'#ffffff',stroke:INK,w:0.6});
    else if(f.kind==='roof') dl.poly(f.p2.map(P),{fill:'#cfcfcf',stroke:INK,w:0.6});
    else if(f.kind==='gable') dl.poly(f.p2.map(P),{fill:'#ffffff',stroke:INK,w:0.5});
    else if(f.kind==='part'){const q2=f.p2.map(P);dl.poly(q2,{fill:f.fill||'#ffffff',stroke:INK,w:f.w||0.45,dash:f.dash});if(f.hatch)elevHatch(dl,q2,f.hatch,sc,k);}
    else if(f.kind==='window'){const q=f.p2.map(P);dl.poly(q,{fill:'#e9e9e9',stroke:INK,w:0.5});const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]);const xa=Math.min(...xs),xb=Math.max(...xs),ya=Math.min(...ys),yb=Math.max(...ys);
      if(f.o&&f.o.grille)for(const [u0,v0,u1,v1] of grilleLines({...f.o,width:Math.max(1,(xb-xa)/sc)}))dl.line(xa+(xb-xa)*u0,yb-(yb-ya)*v0,xa+(xb-xa)*u1,yb-(yb-ya)*v1,0.25,{color:MID});
      if(f.o&&f.o.top&&!f.o.bay?.kind){const ww=p.walls.find(x=>x.id===f.o.wall);const avail=ww?(wallH(p,ww)-(f.o.sill+f.o.height)-5)*sc:r;const r=(xb-xa)/2,cx=(xa+xb)/2,rise=Math.min(f.o.top==='arch'?r:Math.min(r*0.45,14*sc),avail);if(rise>3*sc){const N=20;let pv=null;for(let i=0;i<=N;i++){const a=Math.PI*i/N;const pt=[cx-Math.cos(a)*r,ya-Math.sin(a)*rise];if(pv)dl.line(pv[0],pv[1],pt[0],pt[1],0.6);pv=pt;}dl.line(xa,ya,xb,ya,0.4);}}
      dl.line(xa,(ya+yb)/2,xb,(ya+yb)/2,0.4);dl.line(xa-0.03*k,yb+0.02*k,xb+0.03*k,yb+0.02*k,1);}
    else if(f.kind==='door'){const q=f.p2.map(P);dl.poly(q,{fill:'#ffffff',stroke:INK,w:0.6});const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]);const xa=Math.min(...xs),xb=Math.max(...xs),ya=Math.min(...ys),yb=Math.max(...ys);
      const o=f.o,st=o.style||'panel2',dt=o.dtype||'swing';const R=(x0,y0,x1,y1,fill)=>dl.poly([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],{stroke:MID,w:0.35,fill});
      if(dt==='overhead'){const n=4;for(let i=1;i<n;i++)dl.line(xa,ya+(yb-ya)*i/n,xb,ya+(yb-ya)*i/n,0.35,{color:MID});if(st==='garageglass'){const wy=ya+(yb-ya)*0.06;for(let i=0;i<4;i++){const x0=xa+(xb-xa)*(0.05+i*0.24);R(x0,wy,x0+(xb-xa)*0.18,wy+(yb-ya)*0.15,'#e9e9e9');}}}
      else{const leaves=dt==='double'||dt==='slider'||dt==='bifold'&&o.width>=48?2:1;
        for(let L=0;L<leaves;L++){const x0=xa+(xb-xa)*L/leaves,x1=xa+(xb-xa)*(L+1)/leaves;const ins=(x1-x0)*0.15;if(L)dl.line(x0,ya,x0,yb,0.5);
          if(['fulllite','french','storefront'].includes(st)||dt==='slider'){R(x0+ins*0.6,ya+ins*0.6,x1-ins*0.6,yb-ins*0.9,'#ececec');if(st==='french'){for(let i=1;i<5;i++)dl.line(x0+ins*0.6,ya+(yb-ya)*i/5,x1-ins*0.6,ya+(yb-ya)*i/5,0.25,{color:MID});dl.line((x0+x1)/2,ya+ins*0.6,(x0+x1)/2,yb-ins*0.9,0.25,{color:MID});}}
          else if(st==='halflite'){R(x0+ins,ya+ins,x1-ins,(ya+yb)/2-ins*0.3,'#ececec');R(x0+ins,(ya+yb)/2+ins*0.3,x1-ins,yb-ins);}
          else if(st==='sixlite'){const gy=ya+(yb-ya)*0.32;R(x0+ins,ya+ins,x1-ins,gy,'#ececec');for(let i=1;i<3;i++)dl.line(x0+ins+(x1-x0-2*ins)*i/3,ya+ins,x0+ins+(x1-x0-2*ins)*i/3,gy,0.25,{color:MID});dl.line(x0+ins,(ya+gy)/2,x1-ins,(ya+gy)/2,0.25,{color:MID});R(x0+ins,gy+ins*0.6,x1-ins,yb-ins);}
          else if(st==='panel6'){for(const [r0,r1] of [[0.06,0.2],[0.25,0.55],[0.6,0.94]])for(const [c0,c1] of [[0.14,0.46],[0.54,0.86]])R(x0+(x1-x0)*c0,ya+(yb-ya)*r0,x0+(x1-x0)*c1,ya+(yb-ya)*r1);}
          else if(st==='panel5'){for(let i=0;i<5;i++)R(x0+ins,ya+(yb-ya)*(0.06+i*0.18),x1-ins,ya+(yb-ya)*(0.06+i*0.18+0.15));}
          else if(st==='shaker')R(x0+ins,ya+ins,x1-ins,yb-ins);
          else if(st==='louver'){for(let y=ya+ins;y<yb-ins;y+=(yb-ya)/28)dl.line(x0+ins,y,x1-ins,y,0.2,{color:MID});}
          else if(st==='plank'){for(let i=1;i<5;i++)dl.line(x0+(x1-x0)*i/5,ya,x0+(x1-x0)*i/5,yb,0.25,{color:MID});dl.line(x0,yb,x1,ya,0.35,{color:MID});}
          else if(st==='flush'||st==='metal'){}
          else{R(x0+ins,ya+ins,x1-ins,(ya+yb)/2-ins*0.4);R(x0+ins,(ya+yb)/2+ins*0.4,x1-ins,yb-ins);}
          if(dt!=='slider'&&dt!=='pocket'&&dt!=='barn')dl.circle(leaves===2?(L?x0+ins*0.55:x1-ins*0.55):(o.hinge?x0+ins*0.55:x1-ins*0.55),(ya+yb)/2+0.02*k,0.018*k,{fill:INK});}}}
  }
  // ground line
  if(E.view&&slopeOf(p).fall>0){const V=ELEV_VIEWS[E.view];const first=groundLevel(p);const ol=buildingOutline(p,first.id);
    if(ol){const dmin=Math.min(...ol.pts.map(q=>V.depth(q.x,q.y)));const toXY=(u,dd)=>E.view==='north'?{x:-u,y:dd}:E.view==='south'?{x:u,y:-dd}:E.view==='east'?{x:-dd,y:-u}:{x:dd,y:u};
      const ext=0.4*k/sc;const pts=[];for(let i=0;i<=24;i++){const u=E.u0-ext+(E.u1-E.u0+2*ext)*i/24;const q=toXY(u,dmin);pts.push([U(u),Z(gradeAt(p,q.x,q.y))]);}
      for(let i=0;i+1<pts.length;i++)dl.line(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],2.2);}}
  else{const gz=Z(Math.min(-(p.settings?.gradeOffset||0),E.z0));dl.line(U(E.u0)-0.4*k,gz,U(E.u1)+0.4*k,gz,2.2);}
  // level markers
  const mx=U(E.u1)+0.25*k; const marks=[];
  for(const l of sortedLevels(p)){marks.push(['FIN. FLOOR',l.name,l.elevation]);marks.push(['TOP OF PLATE',l.name,l.elevation+l.height]);}
  let peak=-1e9;for(const f of E.faces)if(f.kind==='roof')for(const q of f.p2)peak=Math.max(peak,q[1]);if(peak>-1e9)marks.push(['RIDGE','',peak]);
  marks.sort((a,b)=>a[2]-b[2]); let lastY=1e9, lastCol=0;
  for(const [lab,lvn,z] of marks){const y=Z(z); const col=(Math.abs(lastY-y)<0.26*k&&lastCol===0)?1:0; lastY=y; lastCol=col; const lx=mx+col*0.8*k;
    dl.line(U(E.u1)+0.05*k,y,lx+0.55*k,y,0.35,{dash:[0.05,0.03],color:MID});
    dl.circle(lx,y,0.045*k,{stroke:INK,w:0.5,fill:'#ffffff'});dl.poly([[lx,y],[lx+0.045*k,y],[lx,y-0.045*k]].concat(arcPts(lx,y,0.045*k,-Math.PI/2,0,5).slice(1,-1).reverse()),{fill:INK});
    dl.text(lx+0.09*k,y-0.05*k,lab,{size:5.2*k,bold:true});dl.text(lx+0.09*k,y+0.1*k,fmtLen(z),{size:5.2*k});}
}

// simple pattern fills for elevation parts (scale-aware)
function elevHatch(dl0,q,kind,sc,k){const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]);const xa=Math.min(...xs),xb=Math.max(...xs),ya=Math.min(...ys),yb=Math.max(...ys);if(xb-xa<0.01||yb-ya<0.01)return;
  // hatch lines are clipped to the face outline so sloped and odd-shaped faces hatch correctly
  const Q=q.map(v=>({x:v[0],y:v[1]}));const isRect=q.length===4&&new Set(xs.map(v=>v.toFixed(4))).size<=2&&new Set(ys.map(v=>v.toFixed(4))).size<=2;
  const dl=isRect?dl0:{...dl0,line:(x0,y0,x1,y1,w,o)=>{for(const [a,b] of clipSegPoly({x:x0,y:y0},{x:x1,y:y1},Q))dl0.line(a.x,a.y,b.x,b.y,w,o);}};
  const lw=0.15,o={color:MID};
  if(kind==='brick'||kind==='block'){const step=(kind==='brick'?2.67:8)*sc;if(step<0.012)return;let r=0;for(let y=yb-step;y>ya+step*0.3;y-=step,r++){dl.line(xa,y,xb,y,lw,o);}}
  else if(kind==='lattice'){const s=6*sc;for(let x=xa-(yb-ya);x<xb;x+=s){const x0=Math.max(xa,x),y0=yb-(x0-x),x1=Math.min(xb,x+(yb-ya)),y1=yb-(x1-x);if(x1>x0)dl.line(x0,y0,x1,y1,lw,o);const xx0=Math.max(xa,x),yy0=ya+(xx0-x),xx1=Math.min(xb,x+(yb-ya)),yy1=ya+(xx1-x);if(xx1>xx0)dl.line(xx0,yy0,xx1,yy1,lw,o);}}
  else if(kind==='rail'){dl.line(xa,ya+0.01*k,xb,ya+0.01*k,0.6);dl.line(xa,yb-3.5*sc,xb,yb-3.5*sc,0.35);const s=5.5*sc;if(s>0.01)for(let x=xa+s;x<xb-s*0.3;x+=s)dl.line(x,ya,x,yb-3.5*sc,0.2,o);}
  else if(kind==='lap'){const s=6*sc;if(s>0.015)for(let y=yb-s;y>ya;y-=s)dl.line(xa,y,xb,y,0.12,o);}}

/* ---- title block, border, tables ---- */
function sheetFrame(dl,P,p,no,title,scaleLabel){
  const k=P.k,m=0.5,W=P.w,H=P.h; const x0=W-m-P.tb, pad=0.12*k;
  dl.poly([[m,m],[W-m,m],[W-m,H-m],[m,H-m]],{stroke:INK,w:1.6});
  dl.line(x0,m,x0,H-m,1.2);
  const info=p.info||{}; let y=m+pad+0.12*k; const tx=x0+pad, tw_=P.tb-2*pad;
  dl.text(tx,y,'REMODEL STUDIO',{size:5.5*k,bold:true,color:MID}); y+=0.3*k;
  for(const l of wrapText((p.name||'Untitled house').toUpperCase(),tw_,10*k,true).slice(0,3)){dl.text(tx,y,l,{size:10*k,bold:true});y+=0.2*k;}
  y+=0.04*k;
  const kv=(lab,val)=>{if(!val)return;dl.text(tx,y,lab,{size:5*k,bold:true,color:MID});y+=0.13*k;for(const l of wrapText(val,tw_,6.5*k).slice(0,3)){dl.text(tx,y,l,{size:6.5*k});y+=0.13*k;}y+=0.06*k;};
  kv('DESIGN OPTION',activeOptionName(p));kv('ADDRESS',info.address);kv('PREPARED FOR',info.client);kv('DRAWN BY',info.designer);
  kv('DATE',info.date||new Date().toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}));kv('REVISION',info.revision);y=drawRevisions(dl,p,tx,y,tw_,k);
  y+=0.04*k;dl.line(x0,y,W-m,y,0.6);y+=0.2*k;
  kv('CODE BASIS','2021 IRC, 2021 IBC, 2010 ADA Standards');
  for(const l of wrapText('Planning drawings. Verify all dimensions in the field before building. Not engineered.',tw_,5.5*k)){dl.text(tx,y,l,{size:5.5*k,color:MID});y+=0.11*k;}
  // bottom block
  const by=H-m-1.05*k; dl.line(x0,by,W-m,by,1.2);
  let yy=by+0.22*k;for(const l of wrapText(title.toUpperCase(),tw_,8*k,true).slice(0,2)){dl.text(tx,yy,l,{size:8*k,bold:true});yy+=0.16*k;}
  if(scaleLabel)dl.text(tx,yy+0.02*k,'SCALE: '+scaleLabel,{size:5.5*k});
  dl.text(W-m-pad,H-m-pad,no,{size:24*k,bold:true,anchor:'end'});
  dl.text(tx,H-m-pad,'SHEET',{size:5*k,bold:true,color:MID});
  return {x0:m+0.25*k,y0:m+0.25*k,x1:x0-0.25*k,y1:H-m-0.25*k};
}
function drawTable(dl,x,y,cols,rows,k,maxY){
  const rh=0.17*k,hs=5.2*k,bs=6*k; const W=cols.reduce((s,c)=>s+c.w,0);
  dl.poly([[x,y],[x+W,y],[x+W,y+rh],[x,y+rh]],{fill:'#e6e6e6',stroke:INK,w:0.6});
  let cx=x;for(const c of cols){dl.text(cx+0.05*k,y+rh-0.055*k,c.h,{size:hs,bold:true});cx+=c.w;}
  let yy=y+rh,shown=0;
  for(const r of rows){if(maxY&&yy+rh>maxY)break;cx=x;r.forEach((v,i)=>{dl.text(cx+0.05*k,yy+rh-0.05*k,v,{size:bs});cx+=cols[i].w;});dl.line(x,yy+rh,x+W,yy+rh,0.3,{color:MID});yy+=rh;shown++;}
  dl.line(x,y,x,yy,0.6);dl.line(x+W,y,x+W,yy,0.6);dl.line(x,yy,x+W,yy,0.6);
  cx=x;for(const c of cols.slice(0,-1)){cx+=c.w;dl.line(cx,y,cx,yy,0.3,{color:MID});}
  if(shown<rows.length)dl.text(x,yy+0.14*k,`+ ${rows.length-shown} more not shown at this paper size`,{size:5*k,color:MID});
  return yy-y+(shown<rows.length?0.2*k:0);
}

/* ---- the sheet set ---- */
function pickScale(fitW,fitH,needW,needH,choice,list=SCALES){
  if(choice&&choice!=='auto'){const s=list.find(s=>String(s[0])===String(choice));if(s){const sc=s[0]/12;if(list===SCALES||(needW(sc)<=fitW&&needH(sc)<=fitH))return s;}}
  for(const s of list){const sc=s[0]/12;if(needW(sc)<=fitW&&needH(sc)<=fitH)return s;}
  return list[list.length-1];
}
/* ---- renderers ---- */
function sheetItemEl(it,i){
  const sw=w=>(w||0.5)/72;
  if(it.t==='line')return html`<line key=${i} x1=${it.x1} y1=${it.y1} x2=${it.x2} y2=${it.y2} stroke=${it.color||INK} strokeWidth=${sw(it.w)} strokeDasharray=${it.dash?it.dash.join(' '):undefined}/>`;
  if(it.t==='poly'){const ring=r=>'M'+r.map(q=>q[0].toFixed(4)+' '+q[1].toFixed(4)).join('L')+(it.close===false?'':'Z');
    return html`<path key=${i} d=${[it.pts,...(it.holes||[])].map(ring).join('')} fillRule="evenodd" fill=${it.fill||'none'} stroke=${it.stroke||'none'} strokeWidth=${sw(it.w)} strokeDasharray=${it.dash?it.dash.join(' '):undefined} strokeLinejoin="round"/>`;}
  if(it.t==='circle')return html`<circle key=${i} cx=${it.cx} cy=${it.cy} r=${it.r} fill=${it.fill||'none'} stroke=${it.stroke||'none'} strokeWidth=${sw(it.w)}/>`;
  if(it.t==='text')return html`<text key=${i} x=${it.x} y=${it.y} fontSize=${it.size/72} fontFamily=${FONT} fontWeight=${it.bold?700:400} textAnchor=${it.anchor} fill=${it.color} transform=${it.rot?`rotate(${it.rot} ${it.x} ${it.y})`:undefined}>${it.s}</text>`;
  return null;
}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function sheetToSVGString(s){
  const sw=w=>((w||0.5)/72).toFixed(4); const parts=[];
  for(const it of s.items){
    if(it.t==='line')parts.push(`<line x1="${it.x1}" y1="${it.y1}" x2="${it.x2}" y2="${it.y2}" stroke="${it.color||INK}" stroke-width="${sw(it.w)}"${it.dash?` stroke-dasharray="${it.dash.join(' ')}"`:''}/>`);
    else if(it.t==='poly'){const ring=r=>'M'+r.map(q=>q[0].toFixed(4)+' '+q[1].toFixed(4)).join('L')+(it.close===false?'':'Z');
      parts.push(`<path d="${[it.pts,...(it.holes||[])].map(ring).join('')}" fill-rule="evenodd" fill="${it.fill||'none'}" stroke="${it.stroke||'none'}" stroke-width="${sw(it.w)}"${it.dash?` stroke-dasharray="${it.dash.join(' ')}"`:''} stroke-linejoin="round"/>`);}
    else if(it.t==='circle')parts.push(`<circle cx="${it.cx}" cy="${it.cy}" r="${it.r}" fill="${it.fill||'none'}" stroke="${it.stroke||'none'}" stroke-width="${sw(it.w)}"/>`);
    else if(it.t==='text')parts.push(`<text x="${it.x}" y="${it.y}" font-size="${(it.size/72).toFixed(4)}" font-family="${FONT}" font-weight="${it.bold?700:400}" text-anchor="${it.anchor}" fill="${it.color}"${it.rot?` transform="rotate(${it.rot} ${it.x} ${it.y})"`:''}>${esc(it.s)}</text>`);}
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${s.w}in" height="${s.h}in" viewBox="0 0 ${s.w} ${s.h}"><rect width="${s.w}" height="${s.h}" fill="#ffffff"/>${parts.join('')}</svg>`;
}
let jspdfLoading=null;
function loadJsPDF(){
  if(window.jspdf)return Promise.resolve();
  if(!jspdfLoading)jspdfLoading=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=()=>res();s.onerror=()=>{jspdfLoading=null;rej(new Error('The PDF library did not load. Check your internet connection and try again.'));};document.head.appendChild(s);});
  return jspdfLoading;
}
function drawSheetItems(doc,items,k=1,ox=0,oy=0){
  const X=x=>ox+x*k,Y=y=>oy+y*k;const nn=v=>v==='none'||v==='transparent'?null:v;
  for(let it of items){if(it.fill==='none'||it.stroke==='none'||it.color==='none'||it.fill==='transparent')it={...it,fill:nn(it.fill),stroke:nn(it.stroke),color:nn(it.color)};
    if(it.t==='line'){doc.setLineWidth(it.w/72*k);doc.setDrawColor(it.color||INK);doc.setLineDashPattern((it.dash||[]).map(v=>v*k),0);doc.line(X(it.x1),Y(it.y1),X(it.x2),Y(it.y2));}
    else if(it.t==='poly'){if(!it.fill&&!it.stroke)continue;doc.setLineDashPattern((it.dash||[]).map(v=>v*k),0);if(it.stroke){doc.setDrawColor(it.stroke);doc.setLineWidth((it.w||0.5)/72*k);}if(it.fill)doc.setFillColor(it.fill);
      for(const r of [it.pts,...(it.holes||[])]){doc.moveTo(X(r[0][0]),Y(r[0][1]));for(let j=1;j<r.length;j++)doc.lineTo(X(r[j][0]),Y(r[j][1]));if(it.close!==false)doc.close();}
      if(it.fill&&it.stroke)doc.fillStrokeEvenOdd();else if(it.fill)doc.fillEvenOdd();else doc.stroke();}
    else if(it.t==='circle'){doc.setLineDashPattern([],0);if(it.stroke){doc.setDrawColor(it.stroke);doc.setLineWidth((it.w||0.5)/72*k);}if(it.fill)doc.setFillColor(it.fill);doc.circle(X(it.cx),Y(it.cy),it.r*k,it.fill&&it.stroke?'FD':it.fill?'F':'S');}
    else if(it.t==='text'){doc.setFont('helvetica',it.bold?'bold':'normal');doc.setFontSize(it.size*k);doc.setTextColor(it.color||INK);
      const w=doc.getTextWidth(it.s);const dx=it.anchor==='middle'?-w/2:it.anchor==='end'?-w:0;const a=(it.rot||0)*Math.PI/180;
      doc.text(it.s,X(it.x)+dx*Math.cos(a),Y(it.y)+dx*Math.sin(a),it.rot?{angle:-it.rot}:undefined);}
  }
  doc.setLineDashPattern([],0);doc.setTextColor(INK);
}
async function sheetsToPDF(sheets,p){
  await loadJsPDF(); const {jsPDF}=window.jspdf; let doc=null;
  for(const s of sheets){const o=s.w>=s.h?'landscape':'portrait';
    if(!doc)doc=new jsPDF({orientation:o,unit:'in',format:[s.w,s.h]});else doc.addPage([s.w,s.h],o);
    drawSheetItems(doc,s.items);
  }
  doc.setProperties({title:(p.name||'House')+' plans',creator:'Remodel Studio'});
  return doc.output('blob');
}

/* ---- saving files (artifact viewer or a normal browser) ---- */
let dlNS; const framedView=(()=>{try{return window.self!==window.top;}catch(e){return true;}})();
async function getDownloads(){if(dlNS!==undefined)return dlNS;try{dlNS=window.claude&&window.claude.use?await window.claude.use('downloads'):null;}catch(e){dlNS=null;}return dlNS;}
async function saveFile(filename,data){
  if(DESK){try{const bytes=data instanceof Blob?new Uint8Array(await data.arrayBuffer()):data;const r=await DESK.saveFile(filename,bytes);
    if(r&&r.ok)return {ok:true,t:'Saved '+r.path+'.',path:r.path};if(r&&r.canceled)return {ok:false,t:'Save cancelled.'};return {ok:false,t:'Could not save: '+((r&&r.error)||'unknown error')};}catch(e){return {ok:false,t:'Could not save: '+(e.message||e)};}}
  const dl=await getDownloads();
  if(dl){try{await dl.save({filename,data});return {ok:true,t:'Saved '+filename+'.'};}
    catch(e){if(e&&e.code==='declined')return {ok:false,t:'Save cancelled.'};if(e&&e.code==='rate_limited')return {ok:false,t:'Another save is waiting for your answer. Try again in a moment.'};return {ok:false,t:'Saving files is not available in this view.'};}}
  if(framedView)return {ok:false,t:'Saving files is not available in this view. Open the standalone copy of the app to save files.'};
  const b=data instanceof Blob?data:new Blob([data]);const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  return {ok:true,t:'Downloaded '+filename+'.'};
}
const safeName=s=>(s||'house').replace(/[^\w\- ]+/g,'').trim()||'house';

/* ---- sheets screen ---- */
function SheetsView({p,commit}){
  const [tab,setTab]=useState(()=>{if(window.__rsSheetNo)return 'plans';try{return localStorage.getItem('remodel-studio:shtab')||'plans';}catch(e){return 'plans';}});
  const pick=t=>{setTab(t);try{localStorage.setItem('remodel-studio:shtab',t);}catch(e){}};
  const tabs=html`<div className="seg shtabs" role="tablist">${[['plans','Plan set'],['present','Board presentation']].map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${tab===k} className=${tab===k?'on':''} onClick=${()=>pick(k)}>${l}</button>`)}</div>`;
  if(tab==='present')return html`<div className="shwrap">${tabs}<${PresentationView} p=${p} commit=${commit}/></div>`;
  return html`<div className="shwrap">${tabs}<${PlanSetView} p=${p} commit=${commit}/></div>`;
}
function PlanSetView({p,commit}){
  const sheets=useMemo(()=>buildSheets(p),[p]);
  const [idx,setIdx]=useState(()=>{const n=window.__rsSheetNo;window.__rsSheetNo=null;const i=n?sheets.findIndex(s=>s.no===n):-1;return i>=0?i:0;}); const [zoom,setZoom]=useState(1);
  useEffect(()=>{const f=e=>{const i=sheets.findIndex(s=>s.no===e.detail);if(i>=0)setIdx(i);};window.addEventListener('rs-sheet',f);return ()=>window.removeEventListener('rs-sheet',f);},[sheets]); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState(null);
  const cur=sheets[Math.min(idx,sheets.length-1)];
  const sh=p.sheet||{}; const info=p.info||{};
  const setSheet=patch=>commit({...p,sheet:{...sh,...patch}}); const setInfo=patch=>commit({...p,info:{...info,...patch}});
  const pdf=async()=>{setBusy(true);setMsg(null);try{const blob=await sheetsToPDF(sheets,p);setMsg(await saveFile(safeName(p.name)+' plans.pdf',blob));}catch(e){setMsg({ok:false,t:e.message||'The PDF could not be made.'});}setBusy(false);};
  const svg=async()=>{setMsg(await saveFile(`${safeName(p.name)} ${cur.no}.svg`,sheetToSVGString(cur)));};
  const dxf=async()=>{setBusy(true);setMsg(null);try{setMsg(await exportDXF(p));}catch(e){setMsg({ok:false,t:e.message||'The DXF files could not be made.'});}setBusy(false);};
  const lot=sh.lot||{}; const setLot=patch=>setSheet({lot:{...lot,...patch}});
  return html`<div className="sheets">
    <nav className="sheetlist" aria-label="Sheets">
      ${sheets.map((s,i)=>html`<button key=${s.id} className=${'sheetbtn'+(s===cur?' on':'')} onClick=${()=>setIdx(i)}><span className="mono">${s.no}</span><span>${s.title}</span></button>`)}
      <select id="sheet-pick" className="inp sheetpick" value=${Math.min(idx,sheets.length-1)} onChange=${e=>setIdx(+e.target.value)} aria-label="Sheet">${sheets.map((s,i)=>html`<option key=${s.id} value=${i}>${s.no} ${s.title}</option>`)}</select>
    </nav>
    <div className="sheetview">
      <div className="sheetbar"><span className="badgeplan">${cur.no} · ${cur.title}${cur.scale?' · '+cur.scale:''}</span><span className="spacer"></span>
        <button className="btn" onClick=${()=>setZoom(z=>Math.max(1,z/1.5))} aria-label="Zoom out">−</button><button className="btn" onClick=${()=>setZoom(1)}>Fit</button><button className="btn" onClick=${()=>setZoom(z=>Math.min(6,z*1.5))} aria-label="Zoom in">+</button></div>
      <div className="sheetscroll"><div className="paper" style=${{width:(zoom*100)+'%',aspectRatio:`${cur.w} / ${cur.h}`}}>
        <svg viewBox=${`0 0 ${cur.w} ${cur.h}`} width="100%" height="100%" role="img" aria-label=${cur.title}>${cur.items.map(sheetItemEl)}</svg></div></div>
    </div>
    <aside className="insp sheetpanel">
      <div className="insp-h"><div style=${{flex:1}}><div className="kind">Plan set</div><h2>Print and export</h2></div></div>
      <div className="sec"><h3>Paper</h3>
        <${Field} label="Sheet size" id="sh-paper"><${Sel} id="sh-paper" value=${sh.paper||'tabloid'} onChange=${v=>setSheet({paper:v})} options=${Object.entries(PAPERS).map(([k,v])=>[k,v.label])}/><//>
        <${Field} label="Drawing scale" id="sh-scale"><${Sel} id="sh-scale" value=${String(sh.scale||'auto')} onChange=${v=>setSheet({scale:v})} options=${[['auto','Largest that fits'],...SCALES.map(s=>[String(s[0]),s[1]])]}/><//>
        <p className="note">Scales are true when printed at 100% on the chosen paper. Choose a fixed scale if the builder needs one.</p></div>
      <div className="sec"><h3>Title block</h3>
        <${Field} label="Address" id="sh-addr"><input id="sh-addr" className="inp" value=${info.address||''} onChange=${e=>setInfo({address:e.target.value})}/><//>
        <${Field} label="Prepared for" id="sh-client"><input id="sh-client" className="inp" value=${info.client||''} onChange=${e=>setInfo({client:e.target.value})}/><//>
        <${Field} label="Drawn by" id="sh-by"><input id="sh-by" className="inp" value=${info.designer||''} onChange=${e=>setInfo({designer:e.target.value})}/><//>
        <${Field} label="Revision" id="sh-rev"><input id="sh-rev" className="inp" value=${info.revision||''} placeholder="e.g. A – first draft" onChange=${e=>setInfo({revision:e.target.value})}/><//>
        <${Field} label="Date" id="sh-date"><input id="sh-date" className="inp" value=${info.date||''} placeholder="Today" onChange=${e=>setInfo({date:e.target.value})}/><//></div>
      <${RevisionsEditor} p=${p} commit=${commit}/>
      <div className="sec"><h3>Lot for the site plan</h3>
        <div><${Field} label="Lot width" id="lot-w"><${LenInput} id="lot-w" value=${lot.w||0} onChange=${v=>setLot({w:v})}/><//><${Field} label="Lot depth" id="lot-d"><${LenInput} id="lot-d" value=${lot.d||0} onChange=${v=>setLot({d:v})}/><//></div>
        <div><${Field} label="Front setback" id="lot-f"><${LenInput} id="lot-f" value=${lot.front||0} onChange=${v=>setLot({front:v})}/><//><${Field} label="Left side setback" id="lot-l"><${LenInput} id="lot-l" value=${lot.left||0} onChange=${v=>setLot({left:v})}/><//></div>
        <p className="note">Leave the width at 0 to show just the house. Setbacks are measured from the top and left edges of the plan to the lot line.</p></div>
      <${ZoningPanel} p=${p} commit=${commit}/>
      <div className="sec"><h3>Export</h3>
        <button className="btn primary" disabled=${busy} onClick=${pdf}>${busy?'Making PDF…':`Download PDF (${sheets.length} sheets)`}</button>
        <button className="btn" onClick=${svg}>Download this sheet as SVG</button>
        <button className="btn" disabled=${busy} onClick=${dxf}>Download DXF floor plans (zip)</button>
        <button className="btn" disabled=${busy} onClick=${async()=>{setBusy(true);setMsg(null);try{setMsg(await exportSheetsDXF(p,sheets));}catch(e){setMsg({ok:false,t:e.message||'The DXF files could not be made.'});}setBusy(false);}}>Download all sheets as DXF (zip)</button>
        <button className="btn" onClick=${async()=>setMsg(await saveFile(`${safeName(p.name)} ${cur.no}.dxf`,sheetToDXF(cur)))}>Download this sheet as DXF</button>
        ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
        <p className="note">The PDF is vector, so lines stay sharp at any zoom. North is the top of the plan. DXF files are full size in inches, one per level, for AutoCAD, LibreCAD or other CAD programs.</p></div>
    </aside></div>`;
}

