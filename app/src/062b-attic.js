/* ======================= attic rooms (half-story): knee walls under the roof ======================= */
function atticRegion(p,base,floorZ,knee){const roofs=p.roofs.filter(r=>r.level===base.id);if(!roofs.length)return null;const bs=roofs.map(r=>roofBuild(r,roofTop(p,r)));
  const ol=buildingOutline(p,base.id);if(!ol)return null;const inner=offsetPoly(ol.pts,-6);const xs=inner.map(q=>q.x),ys=inner.map(q=>q.y);const g=3;
  const x0=Math.min(...xs),y0=Math.min(...ys),nx=Math.ceil((Math.max(...xs)-x0)/g),ny=Math.ceil((Math.max(...ys)-y0)/g);const fill=new Uint8Array(nx*ny);const IP=inner.map(q=>[q.x,q.y]);
  const under=(x,y)=>{let z=-Infinity;for(const b of bs){const h=roofHeightAt(b,x,y);if(h>z)z=h;}return z-11-floorZ;};let peak=0;
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=x0+(i+0.5)*g,y=y0+(j+0.5)*g;if(!inPoly(x,y,IP))continue;const h=under(x,y);if(h>peak)peak=h;if(h>=knee)fill[j*nx+i]=1;}
  const loops=maskLoops(fill,nx,ny,x0,y0,g).map(l=>simplifyLoop(l,2)).filter(l=>l.length>=3).sort((a,b)=>Math.abs(polyArea(b.map(q=>[q.x,q.y])))-Math.abs(polyArea(a.map(q=>[q.x,q.y]))));
  return loops.length?{pts:loops[0],peak,outline:ol.pts,under}:{pts:null,peak,outline:ol.pts,under};}
function makeAttic(p,base,knee=48){const fr=framingOf(base);const floorZ=base.elevation+base.height+(LUMBER[fr.ceiling]||5.5)+0.75;
  const R=atticRegion(p,base,floorZ,knee);if(!R)return {err:'Draw the roof over this level first; the attic is figured from it.'};if(!R.pts||R.peak<84)return {err:`Only about ${fmtLen(Math.max(0,R.peak))} from the attic floor to the roof at the peak. Habitable attic space needs at least 7 ft; try a steeper roof or add dormers.`};
  let q=p;let up=sortedLevels(q).find(l=>l.attic&&l.elevation>base.elevation);
  if(!up){up={id:uid('lv'),name:'Attic',elevation:Math.round(floorZ*4)/4,height:Math.min(96,Math.floor((R.peak-8)/6)*6),attic:true};q={...q,levels:[...q.levels,up]};}
  const walls=[];const P=R.pts;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if(dist(a,b)<6)continue;const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    if(nearPolyline(m,R.outline,14,true))continue; // gable end: the roof's gable wall closes it
    walls.push({id:uid('w'),level:up.id,x1:a.x,y1:a.y,x2:b.x,y2:b.y,thick:4.5,kind:'interior',bearing:false,height:knee,preset:'knee',status:'new'});}
  const room={id:uid('rm'),level:up.id,name:'Attic room',use:'bedroom',pts:P.map(q=>[q.x,q.y]),ceiling:'vaulted',ceilingH:up.height,status:'new'};
  q={...q,walls:[...q.walls.filter(w=>!(w.level===up.id&&w.preset==='knee')),...walls],rooms:[...q.rooms.filter(r=>!(r.level===up.id&&r.name==='Attic room')),room]};
  return {p:q,level:up,walls:walls.length,area:polyArea(room.pts)/144,peak:R.peak};}
// usable floor area under a sloped ceiling: nothing under 5 ft counts, half the required 70 sq ft needs 7 ft (R304.1, R305.1)
function slopedArea(p,lv,r){const f=vaultFn(p,lv,r.ceilingH||null);const xs=r.pts.map(q=>q[0]),ys=r.pts.map(q=>q[1]);const g=6;let a5=0,a7=0,all=0;
  for(let x=Math.min(...xs)+g/2;x<Math.max(...xs);x+=g)for(let y=Math.min(...ys)+g/2;y<Math.max(...ys);y+=g){if(!inPoly(x,y,r.pts))continue;all+=g*g;const h=f(x,y);if(h>=60)a5+=g*g;if(h>=84)a7+=g*g;}
  return {all:all/144,a5:a5/144,a7:a7/144};}
regExtra({checks:(p,add)=>{for(const lv of p.levels){const rooms=p.rooms.filter(r=>r.level===lv.id&&(r.ceiling==='vaulted'||lv.attic));if(!rooms.length)continue;const R=(code,title)=>({set:'IRC',code,title});
    for(const r of rooms){if(!['bedroom','living','office','other','dining'].includes(r.use||'other'))continue;const A=slopedArea(p,lv,r);const c=polyLabelPt(r.pts);const pt={x:c[0],y:c[1]};const T={kind:'room',id:r.id};
      if(A.a5<70-0.5)add('error',R('R304.1','Minimum room area'),`${r.name}: too little floor area with headroom`,`Only ${A.a5.toFixed(0)} sq ft has 5 ft or more of headroom (floor under 5 ft does not count); a habitable room needs 70 sq ft.`,T,pt,lv.id);
      else if(A.a7<35-0.5)add('error',R('R305.1','Ceiling height'),`${r.name}: not enough area at 7 ft`,`Only ${A.a7.toFixed(0)} sq ft has 7 ft of headroom; at least half of the required 70 sq ft must have 7 ft under a sloped ceiling.`,T,pt,lv.id);}
    if(lv.attic&&rooms.length){const below=sortedLevels(p).filter(l=>l.elevation<lv.elevation).pop();const hasStair=below&&p.stairs.some(s=>s.level===below.id);const c=polyLabelPt(rooms[0].pts);
      if(!hasStair)add('error',R('R311.7','Stairways'),'The attic rooms need a stairway','Living space in an attic needs a code stair (7-3/4" max riser, 10" min tread, 36" wide). Add a stair on the floor below.',null,{x:c[0],y:c[1]},lv.id);
      add('warn',R('R502.3','Floor joists'),'Check the attic floor framing',`The ceiling joists under the attic become floor joists. Living space needs joists sized for 30 psf (sleeping) or 40 psf live load; ceiling joists usually need to be upsized or sistered.`,null,{x:c[0],y:c[1]},lv.id);}}}});
