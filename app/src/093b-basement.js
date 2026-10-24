/* ======================= basements and egress window wells ======================= */
function makeBasement(p,H=96){const lv=sortedLevels(p)[0];if(lv.basement)return {err:'This project already has a basement level.'};const ol=buildingOutline(p,lv.id);if(!ol)return {err:'Draw the outside walls first.'};
  const t=8;const P=offsetPoly(ol.pts,-t/2);const elev=lv.elevation-FLOOR_DEPTH-H;const b={id:uid('lv'),name:'Basement',elevation:elev,height:H,basement:true};
  const walls=P.map((a,i)=>{const c=P[(i+1)%P.length];return {id:uid('w'),level:b.id,x1:a.x,y1:a.y,x2:c.x,y2:c.y,thick:t,kind:'exterior',bearing:true,height:null,siding:'concrete',status:'new'};});
  const room={id:uid('rm'),level:b.id,name:'Basement',use:'other',pts:offsetPoly(ol.pts,-t).map(q=>[q.x,q.y]),finish:'concrete',status:'new'};
  const levels=[...p.levels.map(l=>l.id===lv.id?{...l,framing:{...framingOf(l),foundation:'basement'}}:l),b];
  return {p:{...p,levels,walls:[...p.walls,...walls],rooms:[...p.rooms,room]},level:b};}
// a window whose sill is below the ground outside needs a well; egress wells (bedrooms, basements) need 9 sq ft, 36" each way, a ladder over 44" deep (R310.2.3)
function wellGeo(p,o,w){if(o.type!=='window'||!w||w.kind!=='exterior'||o.status==='demolish')return null;const lv=lvlOf(p,w.level);if(!lv)return null;const L=wlen(w),d=wdir(w);const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));
  const f=wallFacing(p,w);const n=f.n;const t=w.thick/2;const c={x:w.x1+d.x*pos+n.x*t,y:w.y1+d.y*pos+n.y*t};const sillZ=lv.elevation+o.sill;const out={x:c.x+n.x*18,y:c.y+n.y*18};const g=gradeAt(p,out.x,out.y);
  if(sillZ>=g+2)return null;const W=Math.max(o.well?.width||0,o.width+12,36),P=Math.max(o.well?.proj||0,36);const depth=g+4-(sillZ-6);
  const pts=[];const N=12;for(let i=0;i<=N;i++){const a=Math.PI*i/N;pts.push({x:c.x-d.x*W/2*Math.cos(a)+n.x*P*Math.sin(a),y:c.y-d.y*W/2*Math.cos(a)+n.y*P*Math.sin(a)});}
  return {c,d,n,W,P,pts,top:g+4,bottom:sillZ-6,depth,ladder:depth-4>44,area:W*P/144,lv,sillZ,grade:g};}
function wellOf(p,o){const w=p.walls.find(x=>x.id===o.wall);return wellGeo(p,o,w);}
function wellPlanSVG(p,o,w,S,isSel){const G=wellGeo(p,o,w);if(!G)return null;const pl=G.pts.map(q=>S(q.x,q.y).join(',')).join(' ');const m=S(G.c.x+G.n.x*G.P*0.55,G.c.y+G.n.y*G.P*0.55);
  return html`<g key=${'well'+o.id} className=${'well'+(isSel?' well-sel':'')}><polyline points=${pl}/>${G.ladder?html`<text x=${m[0]} y=${m[1]+3} textAnchor="middle">LADDER</text>`:null}</g>`;}
function addWell3D(p,o,w,add,std){const G=wellGeo(p,o,w);if(!G)return;const m=std('well',0xb9bcbf,{roughness:.4,metalness:.5});const h=G.top-G.bottom;
  for(let i=0;i+1<G.pts.length;i++){const a=G.pts[i],b=G.pts[i+1];const L=dist(a,b);const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};add(new THREE.BoxGeometry((L+0.5)*IN,h*IN,0.8*IN),m,mid.x*IN,(G.bottom+h/2)*IN,mid.y*IN,-Math.atan2(b.y-a.y,b.x-a.x));}
  const sh=new THREE.Shape(G.pts.map(q=>new THREE.Vector2(q.x*IN,-q.y*IN)));const gg=new THREE.ShapeGeometry(sh);gg.rotateX(-Math.PI/2);add(gg,std('gravel',0x8e8a82,{roughness:1}),0,(G.bottom+0.5)*IN,0,0,false);
  if(G.ladder){for(let z=G.bottom+12;z<G.top-6;z+=12){const q={x:G.c.x+G.n.x*(G.P-3),y:G.c.y+G.n.y*(G.P-3)};add(new THREE.BoxGeometry(16*IN,1*IN,2*IN),m,q.x*IN,z*IN,q.y*IN,-Math.atan2(G.d.y,G.d.x));}}}
regExtra({takeoff:(p,add)=>{for(const o of p.openings){if(o.status==='existing')continue;const G=wellOf(p,o);if(!G)continue;
    add('Windows and doors',`Window well, galvanized ${Math.ceil(G.W/12)}' wide x ${Math.ceil(G.P/12)}' out x ${Math.ceil(G.depth/12)}' deep`,1,'EA');add('Windows and doors','Window well cover (clear, releasable from inside)',1,'EA');
    add('Sitework','Gravel for window well bottom and drain',Math.max(0.2,Math.round(G.W*G.P*12/46656*10)/10),'CY');if(G.ladder)add('Windows and doors','Window well ladder or steps',1,'EA','required over 44" deep (R310.2.3.1)');}},
  checks:(p,add)=>{const R=(code,title)=>({set:'IRC',code,title});
    for(const lv of p.levels.filter(l=>l.basement)){const hab=p.rooms.filter(r=>r.level===lv.id&&r.use!=='garage');if(!hab.length)continue;const ops=p.openings.filter(o=>{const w=p.walls.find(x=>x.id===o.wall);return w&&w.level===lv.id&&w.kind==='exterior'&&(o.type==='door'||(o.type==='window'&&o.width*o.height/144>=5.7));});
      if(!ops.length){const c=polyLabelPt(hab[0].pts);add('error',R('R310.1','Emergency escape'),'Basement needs an emergency escape opening','A basement with habitable space needs at least one egress window or exterior door (plus one in each sleeping room). Add a window of at least 5.7 sq ft net opening with a window well.',null,{x:c[0],y:c[1]},lv.id);}}
    for(const o of p.openings){const G=wellOf(p,o);if(!G)continue;const T={kind:'opening',id:o.id};const pt=G.c;
      if(G.area<9-0.01||G.W<36||G.P<36)add('error',R('R310.2.3','Window well size'),'Window well too small',`Wells for egress windows need 9 sq ft with 36" each way; this one is ${Math.round(G.W)}" x ${Math.round(G.P)}".`,T,pt,G.lv.id);
      if(G.ladder&&o.well&&o.well.ladder===false)add('error',R('R310.2.3.1','Ladder'),'Window well needs a ladder',`It is about ${fmtLen(G.depth)} deep; over 44" needs a permanent ladder or steps.`,T,pt,G.lv.id);}}});
