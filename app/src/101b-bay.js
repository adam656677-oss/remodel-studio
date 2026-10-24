/* ======================= bay, bow and garden (box) windows ======================= */
const BAY_KINDS=[['','Flat in the wall'],['bay45','Bay, 45° sides'],['bay30','Bay, 30° sides'],['bow','Bow (curved, 5 panels)'],['box','Garden or box window']];
function bayGeo(p,o,w){const k=o.bay&&o.bay.kind;if(!k||o.type!=='window'||!w||w.kind!=='exterior')return null;const L=wlen(w),d=wdir(w);const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));
  const f=wallFacing(p,w);const n=f.n;const t=w.thick/2;const D=Math.max(8,Math.min(o.bay.depth||(k==='box'?16:24),o.width/2-6));const s0=pos-o.width/2,s1=pos+o.width/2;
  const at=(s,off)=>({x:w.x1+d.x*s+n.x*off,y:w.y1+d.y*s+n.y*off});const A=at(s0,t),B=at(s1,t);let pts;
  if(k==='bay45'||k==='bay30'){const run=k==='bay45'?D:D*Math.sqrt(3);const r=Math.min(run,o.width/2-8);pts=[A,at(s0+r,t+D),at(s1-r,t+D),B];}
  else if(k==='bow'){pts=[];const N=5;for(let i=0;i<=N;i++){const u=i/N;const s=s0+(s1-s0)*u;const off=t+D*Math.sin(Math.PI*u);pts.push(at(s,off));}}
  else pts=[A,at(s0,t+D),at(s1,t+D),B];
  const panels=[];for(let i=0;i+1<pts.length;i++)panels.push({a:pts[i],b:pts[i+1]});return {pts,panels,n,d,D,t,A,B,kind:k,sill:o.sill,head:o.sill+o.height};}
function addBay3D(p,lv,w,o,add,std,mGlass,fr){const G=bayGeo(p,o,w);if(!G)return;const e0=lv.elevation;const z0=e0+G.sill,z1=e0+G.head;
  const sid=w.color?hexNum(w.color):SIDING_COLOR[w.siding||'vinyl']||0xeeeae0;const sm=std('bay-sid-'+sid,sid,{roughness:.8});const rf=(p.roofs||[])[0];const rc=rf&&rf.color?hexNum(rf.color):ROOF_COLOR[rf?rafterOf(rf).cover:'asphalt']||0x4a4f57;
  const rm=std('bay-roof-'+rc,rc,{roughness:.9,side:THREE.DoubleSide});
  for(const s of G.panels){const L=dist(s.a,s.b);const m={x:(s.a.x+s.b.x)/2,y:(s.a.y+s.b.y)/2};const ry=-Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x);
    add(new THREE.BoxGeometry(L*IN,(z1-z0)*IN,0.6*IN),mGlass,m.x*IN,((z0+z1)/2)*IN,m.y*IN,ry,false);
    add(new THREE.BoxGeometry((L+1)*IN,2*IN,4*IN),fr,m.x*IN,(z0-1)*IN,m.y*IN,ry);add(new THREE.BoxGeometry((L+1)*IN,2*IN,4*IN),fr,m.x*IN,(z1+1)*IN,m.y*IN,ry);}
  for(const q of G.pts)add(new THREE.BoxGeometry(3*IN,(z1-z0)*IN,3*IN),fr,q.x*IN,((z0+z1)/2)*IN,q.y*IN,0);
  // knee wall under the glass and the little roof over it
  const ring=[...G.pts,G.B,G.A];const shapeAt=(pts)=>{const sh=new THREE.Shape(pts.map(q=>new THREE.Vector2(q.x*IN,-q.y*IN)));const g=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false});g.rotateX(-Math.PI/2);return g;};
  const kneeH=Math.min(G.sill,18);if(kneeH>1){const g=shapeAt(G.pts);g.scale(1,kneeH*IN,1);add(g,sm,0,(z0-2-kneeH)*IN,0,0);}
  const pos=[];const N=G.pts.length-1;const back=i=>({x:G.A.x+(G.B.x-G.A.x)*i/N,y:G.A.y+(G.B.y-G.A.y)*i/N});const ov=3;
  const front=G.pts.map((q,i)=>{const c={x:(G.A.x+G.B.x)/2,y:(G.A.y+G.B.y)/2};const v={x:q.x-back(i).x,y:q.y-back(i).y};const l=Math.hypot(v.x,v.y)||1;return {x:q.x+G.n.x*ov,y:q.y+G.n.y*ov};});
  const V=(q,z)=>[q.x*IN,z*IN,q.y*IN];const zf=z1+2,zb=z1+2+Math.max(10,G.D*0.5);
  for(let i=0;i<N;i++){const a=front[i],b=front[i+1],c=back(i+1),d=back(i);pos.push(...V(a,zf),...V(b,zf),...V(c,zb),...V(a,zf),...V(c,zb),...V(d,zb));}
  const end=(q,bk)=>pos.push(...V(q,zf),...V(bk,zb),...V(bk,zf));end(front[0],G.A);end(front[N],G.B);
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.computeVertexNormals();add(rg,rm,0,0,0,0);
  {const g=shapeAt(front);g.scale(1,2*IN,1);add(g,fr,0,(z1)*IN,0,0);}}
function bayPlanSVG(p,o,w,S,isSel){const G=bayGeo(p,o,w);if(!G)return null;const pl=(arr)=>arr.map(q=>S(q.x,q.y).join(',')).join(' ');const inner=G.pts.map(q=>({x:q.x-G.n.x*1.5,y:q.y-G.n.y*1.5}));
  return html`<g key=${'bay'+o.id} className=${'bayw'+(isSel?' bay-sel':'')}><polyline points=${pl(G.pts)}/><polyline points=${pl(inner)}/></g>`;}
function bayFaces(p,F){for(const o of p.openings){const w=p.walls.find(x=>x.id===o.wall);const G=bayGeo(p,o,w);if(!G)continue;const lv=lvlOf(p,w.level);if(!lv)continue;const e0=lv.elevation;
  for(const s of G.panels){const L=dist(s.a,s.b)||1;const nn={x:(s.b.y-s.a.y)/L,y:-(s.b.x-s.a.x)/L};const n=(nn.x*G.n.x+nn.y*G.n.y)>0?nn:{x:-nn.x,y:-nn.y};
    F.push({kind:'part',pts:[[s.a.x,s.a.y,e0+G.sill-18],[s.b.x,s.b.y,e0+G.sill-18],[s.b.x,s.b.y,e0+G.sill],[s.a.x,s.a.y,e0+G.sill]],n,fill:'#ffffff',w:0.4});
    F.push({kind:'window',pts:[[s.a.x,s.a.y,e0+G.sill],[s.b.x,s.b.y,e0+G.sill],[s.b.x,s.b.y,e0+G.head],[s.a.x,s.a.y,e0+G.head]],n,o:{...o,width:L}});
    F.push({kind:'part',pts:[[s.a.x+G.n.x*3,s.a.y+G.n.y*3,e0+G.head+2],[s.b.x+G.n.x*3,s.b.y+G.n.y*3,e0+G.head+2],[s.b.x-G.n.x*G.D*0.5,s.b.y-G.n.y*G.D*0.5,e0+G.head+2+Math.max(10,G.D*0.5)],[s.a.x-G.n.x*G.D*0.5,s.a.y-G.n.y*G.D*0.5,e0+G.head+2+Math.max(10,G.D*0.5)]],n,fill:'#d0d0d0',w:0.5});}}}
regExtra({takeoff:(p,add)=>{for(const o of p.openings){if(o.status==='existing')continue;const w=p.walls.find(x=>x.id===o.wall);const G=bayGeo(p,o,w);if(!G)continue;const label=(BAY_KINDS.find(b=>b[0]===G.kind)||[0,''])[1];
  add('Windows and doors',`${label} window unit, ${Math.round(o.width)}" x ${Math.round(o.height)}" (${G.panels.length} panels)`,1,'EA');add('Windows and doors','Bay roof: framing, sheathing, shingles or metal, flashing',1,'LOT');add('Windows and doors','Bay seat board and knee-wall framing',1,'LOT');}}});
/* ---- window grilles and arched tops ---- */
const GRILLES=[['','No grilles'],['colonial','Colonial grid (6 over 6)'],['prairie','Prairie (border lites)'],['craftsman','Craftsman (3 over 1)'],['diamond','Diamond (upper sash)']];
const WIN_TOPS=[['','Square top'],['arch','Half-round transom above'],['eyebrow','Eyebrow arch transom above']];
// grille lines in window-local units: u 0..1 across, v 0..1 up (0 = sill); returns [[u0,v0,u1,v1],...]
function grilleLines(o){const g=o.grille;if(!g)return [];const dh=['double-hung','single-hung'].includes(o.operation||'double-hung');const L=[];const W=o.width,H=o.height;const iu=4/W,iv=4/H;
  if(g==='colonial'){for(const u of [1/3,2/3])L.push([u,0,u,1]);if(dh){L.push([0,0.25,1,0.25],[0,0.75,1,0.75]);}else L.push([0,1/3,1,1/3],[0,2/3,1,2/3]);}
  else if(g==='prairie'){for(const u of [iu,1-iu])L.push([u,dh?0.5:0,u,1]);L.push([0,1-iv,1,1-iv]);if(!dh){for(const u of [iu,1-iu])L.push([u,0,u,1]);L.push([0,iv,1,iv]);}else L.push([0,0.5+iv,1,0.5+iv]);}
  else if(g==='craftsman'){for(const u of [0.25,0.5,0.75])L.push([u,dh?0.5:0.6,u,1]);if(!dh)L.push([0,0.6,1,0.6]);}
  else if(g==='diamond'){const v0=dh?0.5:0.5;for(let i=-3;i<=3;i++){L.push([Math.max(0,i/4),v0+Math.max(0,-i/4)*0.5,Math.min(1,(i+4)/4),v0+Math.min(1,(4-i)/4)*0.5]);}}
  return L.filter(l=>l.every(x=>x>=-1e-6&&x<=1+1e-6));}
function addGrilles3D(o,px,py,ry,z0,ow,add,mat){for(const [u0,v0,u1,v1] of grilleLines({...o,width:ow})){const a={u:(u0-0.5)*ow,v:v0*o.height},b={u:(u1-0.5)*ow,v:v1*o.height};const L=Math.hypot(b.u-a.u,b.v-a.v);if(L<1)continue;
  const g=new THREE.BoxGeometry(L*IN,0.75*IN,0.9*IN);g.rotateZ(Math.atan2(b.v-a.v,b.u-a.u));const cu=(a.u+b.u)/2,cv=(a.v+b.v)/2;const c=Math.cos(-ry),s=Math.sin(-ry);
  add(g,mat,(px+cu*c)*IN,(z0+cv)*IN,(py+cu*s)*IN,ry,false);}}
function addWinTop3D(o,w,px,py,ry,d,z1,ow,add,std,mGlass,fr,outN,t,avail=999){if(!o.top)return;const r=ow/2;const rise=Math.min(o.top==='arch'?r:Math.min(r*0.45,14),avail-5);if(rise<3)return;
  const sh=new THREE.Shape();const N=24;for(let i=0;i<=N;i++){const a=Math.PI*i/N;const x=-Math.cos(a)*r,y=Math.sin(a)*rise;i?sh.lineTo(x*IN,y*IN):sh.moveTo(x*IN,y*IN);}
  const g=new THREE.ShapeGeometry(sh);const off=(t/2+0.6);const m=add(g,mGlass,(px+outN.x*off)*IN,(z1+2)*IN,(py+outN.y*off)*IN,ry,false);
  const ring=new THREE.Shape();for(let i=0;i<=N;i++){const a=Math.PI*i/N;const x=-Math.cos(a)*(r+3),y=Math.sin(a)*(rise+3);i?ring.lineTo(x*IN,y*IN):ring.moveTo(x*IN,y*IN);}
  for(let i=N;i>=0;i--){const a=Math.PI*i/N;ring.lineTo(-Math.cos(a)*r*IN,Math.sin(a)*rise*IN);}
  add(new THREE.ExtrudeGeometry(ring,{depth:1.2*IN,bevelEnabled:false}),fr,(px+outN.x*(off-0.4))*IN,(z1+2)*IN,(py+outN.y*(off-0.4))*IN,ry,false);
  add(new THREE.BoxGeometry((ow+6)*IN,2*IN,1.5*IN),fr,(px+outN.x*off)*IN,(z1+1)*IN,(py+outN.y*off)*IN,ry,false);}
