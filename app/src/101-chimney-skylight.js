/* ======================= fireplaces and chimneys, skylights ======================= */
I.chimney=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 12l9-8 9 8"/><path d="M15 7V3h3v7"/><path d="M5 11v9h14v-9"/><path d="M9 20v-5a3 3 0 0 1 6 0v5"/></svg>`;
I.skylight=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 16L12 5l10 11"/><path d="M8 12.5l4-4.4 4 4.4-4 3.2z"/><path d="M12 2v1M5 5l.8.8M19 5l-.8.8"/></svg>`;
const CHIMNEY_KINDS=[['masonry','Masonry fireplace and chimney'],['prefab','Factory-built fireplace in a framed chase'],['stove','Wood or pellet stove with metal flue (no firebox)']];
const CHIM_FINISH=[['brick','Brick'],['stone','Stone veneer'],['stucco','Stucco'],['siding','Siding (framed chase)']];
const chimOf=c=>({kind:'masonry',w:60,d:24,rot:0,openW:36,openH:30,finish:'brick',mantel:true,top:null,...c});
const chimAng=c=>(c.rot||0)*Math.PI/180;
function chimFront(c){const a=chimAng(c);return {x:-Math.sin(a),y:Math.cos(a)};}
// R1003.9: 3 ft above where it passes through the roof and 2 ft above any part of the building within 10 ft
function chimneyNeed(p,c){c=chimOf(c);const bs=(p.roofs||[]).map(r=>roofBuild(r,roofTop(p,r)));const zAt=(x,y)=>{let z=-Infinity;for(const b of bs){const h=roofHeightAt(b,x,y);if(h>z)z=h;}return z;};
  const C=rectCorners(c.x,c.y,c.w,c.d,chimAng(c));let through=-Infinity;for(const q of [...C,{x:c.x,y:c.y}])through=Math.max(through,zAt(q.x,q.y));
  let near=-Infinity;for(let dx=-120-c.w/2;dx<=120+c.w/2;dx+=12)for(let dy=-120-c.w/2;dy<=120+c.w/2;dy+=12){const x=c.x+dx,y=c.y+dy;let dmin=Infinity;for(let i=0;i<4;i++)dmin=Math.min(dmin,projSeg({x,y},C[i],C[(i+1)%4]).d);if(ptsIn({x,y},C))dmin=0;if(dmin>120)continue;near=Math.max(near,zAt(x,y));}
  const lv=lvlOf(p,c.level)||p.levels[0];const wallTop=Math.max(...p.levels.map(l=>l.elevation+l.height));
  const base=isFinite(through)?through:wallTop;const need=Math.max(base+36,isFinite(near)?near+24:base+24);return {through:isFinite(through)?through:null,near:isFinite(near)?near:null,need:Math.ceil(need/2)*2,lv};}
function chimneyTop(p,c){const n=chimneyNeed(p,c);return c.top!=null?c.top:n.need;}
function hearthSize(c){c=chimOf(c);const big=c.openW*c.openH/144>=6;return {depth:big?20:16,side:big?12:8,big};}
function chimneyPolys(c){c=chimOf(c);const a=chimAng(c);const F=chimFront(c);const body=rectCorners(c.x,c.y,c.w,c.d,a);if(c.kind==='stove')return {body,hearth:null,open:null};
  const H=hearthSize(c);const hw=c.openW+2*H.side;const hc={x:c.x+F.x*(c.d/2+H.depth/2),y:c.y+F.y*(c.d/2+H.depth/2)};
  const oc={x:c.x+F.x*(c.d/2-6),y:c.y+F.y*(c.d/2-6)};return {body,hearth:rectCorners(hc.x,hc.y,hw,H.depth,a),open:rectCorners(oc.x,oc.y,c.openW,12,a)};}
regObj('chimney',{coll:'chimneys',label:'Fireplace and chimney',plural:'fireplaces and chimneys',z:5,layer:'over',
  pts:(p,c)=>chimneyPolys(c).body,hit:(p,c,raw,tol)=>{const P=chimneyPolys(c);return ptsIn(raw,P.body)||(P.hearth&&ptsIn(raw,P.hearth));},
  move:(c,dx,dy)=>({...c,x:c.x+dx,y:c.y+dy}),rotate:c=>({rot:((c.rot||0)+90)%360}),
  title:c=>(CHIMNEY_KINDS.find(k=>k[0]===chimOf(c).kind)||[0,'Chimney'])[1],
  svg:(p,lv,c,S,view,isSel)=>{const P=chimneyPolys(c);const pl=a=>a.map(q=>S(q.x,q.y).join(',')).join(' ');const k=chimOf(c);
    return html`<g className=${'chim'+(isSel?' chim-sel':'')}>${P.hearth?html`<polygon points=${pl(P.hearth)} className="chim-hearth"/>`:null}<polygon points=${pl(P.body)} className=${'chim-body chim-'+k.finish}/>
      ${P.open?html`<polygon points=${pl(P.open)} className="chim-open"/>`:html`<circle cx=${S(k.x,k.y)[0]} cy=${S(k.x,k.y)[1]} r=${Math.max(3,4*view.s)} className="chim-open"/>`}</g>`;},
  dl:(dl,p,lv,c,PT,k,sc)=>{const P=chimneyPolys(c);const pp=a=>a.map(q=>PT(q.x,q.y));if(P.hearth)dl.poly(pp(P.hearth),{stroke:INK,w:0.4,fill:'#f2f2f2'});dl.poly(pp(P.body),{stroke:INK,w:0.9,fill:'#d8d8d8'});if(P.open)dl.poly(pp(P.open),{stroke:INK,w:0.5,fill:'#555555'});
    const q=PT(c.x,c.y);dl.text(q[0],q[1]-0.02*k,chimOf(c).kind==='stove'?'STOVE':'FP',{size:5*k,bold:true,anchor:'middle'});},
  faces:(p,lv,c,F)=>{const k=chimOf(c);const g=gradeAt(p,k.x,k.y);const top=chimneyTop(p,k);const col=k.finish==='brick'?'#b9806a':k.finish==='stone'?'#b8b0a2':'#efece6';
    boxFaces(F,k.x,k.y,g,k.w,k.d,top-g,chimAng(k),'part',{fill:col,hatch:k.finish==='brick'?'brick':k.finish==='stone'?'stone':null});},
  add3D:(p,lv,c,ctx)=>{const k=chimOf(c);const g=gradeAt(p,k.x,k.y);const top=chimneyTop(p,k);const a=chimAng(k);const F=chimFront(k);
    const col=k.finish==='brick'?0xa45a42:k.finish==='stone'?0xb1a796:k.finish==='stucco'?0xe8e1d4:0xe9e4d8;let mat=ctx.isSel(c)?ctx.mSel:k.finish==='brick'?texMat(ctx,'brick',0xffffff):k.finish==='stone'?texMat(ctx,'stone',0xffffff):ctx.col(col,{roughness:.9});
    if(k.kind!=='stove'){const geo=uvBox(k.w,top-g,k.d,24);ctx.add(geo,mat,k.x*IN,(g+(top-g)/2)*IN,k.y*IN,-a,true);}else{ctx.box(k.x,k.y,lv.elevation,28,24,30,a,ctx.matFor(c,0x2b2b2b,{roughness:.5,metalness:.5}));}
    // cap and flue
    if(k.kind==='masonry'){ctx.box(k.x,k.y,top,k.w+3,k.d+3,4,a,ctx.col(0x9a9690));ctx.box(k.x,k.y,top+4,13,13,10,a,ctx.col(0xb7735a));}
    else{const fx=k.kind==='stove'?k.x:k.x,fy=k.y;const z0=k.kind==='stove'?lv.elevation+30:top;ctx.cyl(fx,fy,z0,4,(k.kind==='stove'?top+18:top+20)-z0,ctx.col(0x8d9296,{metalness:.6,roughness:.4}),16);
      if(k.kind!=='stove')ctx.box(k.x,k.y,top,k.w+2,k.d+2,1.5,a,ctx.col(0x7b8085,{metalness:.5}));ctx.cyl(fx,fy,(k.kind==='stove'?top+18:top+20),8,4,ctx.col(0x5c6064,{metalness:.5}),16,6);}
    if(k.kind==='stove')return;const e=lv.elevation;const P=chimneyPolys(k);
    // firebox opening, hearth and mantel on the room side
    const oc={x:k.x+F.x*(k.d/2+0.2),y:k.y+F.y*(k.d/2+0.2)};ctx.box(oc.x,oc.y,e+ (k.kind==='masonry'?0:6),k.openW,0.6,k.openH,a,ctx.col(0x161616,{roughness:1}));
    const H=hearthSize(k);const hc={x:k.x+F.x*(k.d/2+H.depth/2),y:k.y+F.y*(k.d/2+H.depth/2)};ctx.box(hc.x,hc.y,e,k.openW+2*H.side,H.depth,1.5,a,ctx.col(0x8f8a82,{roughness:.7}));
    if(k.mantel){const mc={x:k.x+F.x*(k.d/2+3),y:k.y+F.y*(k.d/2+3)};ctx.box(mc.x,mc.y,e+(k.kind==='masonry'?0:6)+k.openH+18,Math.min(k.w+6,k.openW+30),6,4,a,ctx.col(0x7a5232,{roughness:.6}));}},
  panel:(c,{p,up,lv})=>{const k=chimOf(c);const n=chimneyNeed(p,k);const top=chimneyTop(p,k);const H=hearthSize(k);
    return html`<div className="sec"><h3>Fireplace and chimney</h3>
    <${Field} label="Type" id="ch-k"><${Sel} id="ch-k" value=${k.kind} onChange=${v=>up({kind:v,finish:v==='prefab'&&k.finish==='brick'?'siding':k.finish})} options=${CHIMNEY_KINDS}/><//>
    ${k.kind!=='stove'?html`<${Field} label="Exterior finish" id="ch-f"><${Sel} id="ch-f" value=${k.finish} onChange=${v=>up({finish:v})} options=${CHIM_FINISH}/><//>
    <div className="grid2"><${Field} label="Width" id="ch-w"><${LenInput} id="ch-w" value=${k.w} onChange=${v=>v>12&&up({w:v})}/><//><${Field} label="Depth" id="ch-d"><${LenInput} id="ch-d" value=${k.d} onChange=${v=>v>8&&up({d:v})}/><//></div>
    <div className="grid2"><${Field} label="Firebox opening width" id="ch-ow"><${LenInput} id="ch-ow" value=${k.openW} onChange=${v=>v>12&&up({openW:v})}/><//><${Field} label="Opening height" id="ch-oh"><${LenInput} id="ch-oh" value=${k.openH} onChange=${v=>v>12&&up({openH:v})}/><//></div>
    <label className="check"><input type="checkbox" checked=${k.mantel} onChange=${e=>up({mantel:e.target.checked})}/> Mantel</label>`:null}
    <${Field} label="Top of chimney" id="ch-t"><${LenInput} id="ch-t" value=${k.top} placeholder=${'Code minimum: '+fmtLen(n.need)} onChange=${v=>up({top:v||null})}/><//>
    <${Field} label="Facing" id="ch-r"><${Sel} id="ch-r" value=${String(k.rot||0)} onChange=${v=>up({rot:+v})} options=${[['0','Firebox faces down the plan'],['90','Faces left'],['180','Faces up'],['270','Faces right']]}/><//>
    <p className="note">Code height (IRC R1003.9): 3 ft above the roof where it passes through and 2 ft above anything within 10 ft. That puts the top at ${fmtLen(n.need)} above the first floor${k.top!=null?`; you set ${fmtLen(top)}`:''}.${k.kind!=='stove'?` Hearth extension (R1001.9): ${H.depth}" in front and ${H.side}" past each side of the opening${H.big?' (opening 6 sq ft or larger)':''}.`:''}</p></div>`;},
  takeoff:(p,add,W)=>{const C='Fireplace and chimney';for(const c0 of (p.chimneys||[]).filter(c=>c.status!=='existing')){const k=chimOf(c0);const g=gradeAt(p,k.x,k.y);const top=chimneyTop(p,k);const lv=lvlOf(p,k.level)||p.levels[0];
      const faceSF=2*(k.w+k.d)*(top-g)/144;
      if(k.kind==='masonry'){const bricks=Math.ceil(faceSF*6.75*W);if(k.finish==='brick')add(C,'Face brick',bricks,'EA','about 6.75 per sq ft of face');else if(k.finish==='stone')add(C,'Stone veneer',Math.ceil(faceSF*W),'SF');else add(C,'Stucco over block',Math.ceil(faceSF*W),'SF');
        add(C,'CMU block for chimney core',Math.ceil(faceSF*1.125*0.6),'EA');add(C,'Clay flue liner, 13" x 13"',Math.ceil((top-lv.elevation-k.openH)/24),'EA','2 ft sections');add(C,'Firebrick and refractory mortar (firebox)',1,'LOT');
        add(C,'Mortar, type S, 80 lb',Math.ceil(faceSF*6.75/125)+4,'bag');add(C,'Concrete footing for chimney',Math.round((k.w+24)*(k.d+24)*12/46656*10)/10,'CY','12" thick, 12" past each side');add(C,'Chimney cap and spark arrestor',1,'EA');add(C,'Damper',1,'EA');add(C,'Step and counter flashing kit',1,'EA');}
      else if(k.kind==='prefab'){add(C,'Factory-built fireplace unit (listed)',1,'EA');add(C,'Class A chimney pipe',Math.ceil((top-lv.elevation-60)/12),'LF');add(C,'Chase framing and sheathing',Math.ceil(faceSF*W),'SF');add(C,'Chase cover with storm collar',1,'EA');}
      else{add(C,'Wood or pellet stove (listed)',1,'EA');add(C,'Class A chimney pipe',Math.ceil((top-lv.elevation-30)/12),'LF');add(C,'Ceiling support box and roof flashing',1,'EA');add(C,'Non-combustible floor protection',Math.ceil(48*52/144),'SF');}
      if(k.kind!=='stove')add(C,'Hearth extension (stone or tile on backer)',Math.ceil((k.openW+2*hearthSize(k).side)*hearthSize(k).depth/144),'SF');if(k.mantel&&k.kind!=='stove')add(C,'Mantel shelf',1,'EA');}},
  checks:(p,add)=>{for(const c0 of p.chimneys||[]){const k=chimOf(c0);const n=chimneyNeed(p,k);const T={kind:'chimney',id:k.id};const pt={x:k.x,y:k.y};const R=(code,title)=>({set:'IRC',code,title});
      if(k.top!=null&&k.top<n.need-0.5)add('error',R(k.kind==='masonry'?'R1003.9':'R1005.3','Chimney termination height'),'Chimney too short',`The top is at ${fmtLen(k.top)}; it needs ${fmtLen(n.need)} (3 ft above the roof where it passes through and 2 ft above anything within 10 ft).`,T,pt,k.level);
      if(k.kind!=='stove'&&k.openW*k.openH>0&&k.d<20&&k.kind==='masonry')add('warn',R('R1001.6','Firebox depth'),'Firebox may be too shallow',`A masonry firebox must be at least 20" deep (12" for a Rumford). The chimney is only ${fmtLen(k.d)} deep here.`,T,pt,k.level);}}});
regTool('chimney',{label:'Fireplace and chimney',short:'Fireplace',key:'',group:'walls',icon:I.chimney,mode:'click',
  hint:()=>html`<b>Fireplace:</b> click to place a fireplace and chimney. Turn it so the firebox faces the room; the chimney height is figured from the roof (IRC R1003.9).`,
  place:(ctx,[pt])=>{const c={id:uid('ch'),level:ctx.lv.id,x:pt.x,y:pt.y,...chimOf({}),status:'new'};return {p:{...ctx.p,chimneys:[...(ctx.p.chimneys||[]),c]},sel:{kind:'chimney',id:c.id}};}});

// a box whose texture coordinates run in real units (tile = texture size in inches), so brick and stone keep their scale
function uvBox(w,h,d,tile){const g=new THREE.BoxGeometry(w*IN,h*IN,d*IN);const uv=g.attributes.uv;const dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let i=0;i<uv.count;i++){const f=Math.floor(i/4);uv.setXY(i,uv.getX(i)*dims[f][0]/tile,uv.getY(i)*dims[f][1]/tile);}uv.needsUpdate=true;return g;}
/* ---- skylights: sit on the roof plane under the click ---- */
const SKY_SIZES=[['2246','2x4 (22-1/2" x 46-1/2")',22.5,46.5],['2222','2x2 (22-1/2" x 22-1/2")',22.5,22.5],['3030','30" x 30"',30.5,30.5],['3046','30" x 46"',30.5,46.5],['2270','2x6 (22-1/2" x 70-1/2")',22.5,70.5],['tube10','10" sun tunnel',10,10],['tube14','14" sun tunnel',14,14]];
const skyOf=s=>({size:'2246',type:'fixed',...s});
function roofPlaneAt(p,x,y,lvId){let best=null;for(const r of p.roofs||[]){if(lvId&&r.level!==lvId)continue;const b=roofBuild(r,roofTop(p,r));for(const f of b.polys){if(!inPoly(x,y,f.map(q=>[q[0],q[1]])))continue;const z=planeZ(f,x,y);if(!best||z>best.z){
      const e=0.5;const gx=(planeZ(f,x+e,y)-planeZ(f,x-e,y))/(2*e),gy=(planeZ(f,x,y+e)-planeZ(f,x,y-e))/(2*e);best={z,gx,gy,roof:r};}}}return best;}
function skyGeo(p,s){s=skyOf(s);const sz=SKY_SIZES.find(z=>z[0]===s.size)||SKY_SIZES[0];const pl=roofPlaneAt(p,s.x,s.y,null);if(!pl)return null;
  const g=Math.hypot(pl.gx,pl.gy);const up=g>1e-4?{x:pl.gx/g,y:pl.gy/g}:{x:0,y:-1};const cr={x:-up.y,y:up.x};const cos=1/Math.sqrt(1+g*g);
  const w=sz[2],L=sz[3];const P=(u,v)=>{const x=s.x+cr.x*u+up.x*v*cos,y=s.y+cr.y*u+up.y*v*cos;return {x,y,z:pl.z+g*v*cos};};
  return {w,L,tube:s.size.startsWith('tube'),plan:[P(-w/2,-L/2),P(w/2,-L/2),P(w/2,L/2),P(-w/2,L/2)],pl,up,cr,g,cos,P,label:sz[1]};}
regObj('skylight',{coll:'skylights',label:'Skylight',plural:'skylights',z:9,layer:'over',
  pts:(p,s)=>{const G=skyGeo(p,s);return G?G.plan:[{x:s.x,y:s.y}];},hit:(p,s,raw,tol)=>{const G=skyGeo(p,s);return G?ptsIn(raw,G.plan)||Math.hypot(raw.x-s.x,raw.y-s.y)<tol:Math.hypot(raw.x-s.x,raw.y-s.y)<12;},
  move:(s,dx,dy)=>({...s,x:s.x+dx,y:s.y+dy}),title:(s,p)=>'Skylight '+((SKY_SIZES.find(z=>z[0]===skyOf(s).size)||[0,''])[1]),
  svg:(p,lv,s,S,view,isSel)=>{const G=skyGeo(p,s);if(!G)return html`<circle cx=${S(s.x,s.y)[0]} cy=${S(s.x,s.y)[1]} r="6" className="sky sky-off"/>`;if(G.tube){const [x,y]=S(s.x,s.y);return html`<g className=${'sky'+(isSel?' sky-sel':'')}><circle cx=${x} cy=${y} r=${G.w/2*view.s}/><circle cx=${x} cy=${y} r=${G.w/2*view.s*0.6}/></g>`;}
    const pl=G.plan.map(q=>S(q.x,q.y).join(',')).join(' ');const a=S(G.plan[0].x,G.plan[0].y),b=S(G.plan[2].x,G.plan[2].y),c=S(G.plan[1].x,G.plan[1].y),d=S(G.plan[3].x,G.plan[3].y);
    return html`<g className=${'sky'+(isSel?' sky-sel':'')}><polygon points=${pl}/><line x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]}/><line x1=${c[0]} y1=${c[1]} x2=${d[0]} y2=${d[1]}/></g>`;},
  dl:(dl,p,lv,s,PT,k,sc)=>{const G=skyGeo(p,s);if(!G)return;const pp=G.plan.map(q=>PT(q.x,q.y));dl.poly(pp,{stroke:INK,w:0.5,dash:[0.04*k,0.03*k]});dl.line(pp[0][0],pp[0][1],pp[2][0],pp[2][1],0.3,{dash:[0.04*k,0.03*k]});dl.line(pp[1][0],pp[1][1],pp[3][0],pp[3][1],0.3,{dash:[0.04*k,0.03*k]});},
  add3D:(p,lv,s,ctx)=>{const G=skyGeo(p,s);if(!G)return;const T=G.P;const curb=G.tube?3:5;
    // basis: X across the slope, Y along the roof normal, Z up the slope (scene: x, elevation, y)
    const ax=new THREE.Vector3(G.cr.x,0,G.cr.y),az=new THREE.Vector3(G.up.x*G.cos,G.g*G.cos,G.up.y*G.cos).normalize(),ay=new THREE.Vector3().crossVectors(az,ax).normalize();if(ay.y<0)ay.negate();
    const place=(m,lift)=>{if(!m)return;const M=new THREE.Matrix4().makeBasis(ax,ay,az);m.quaternion.setFromRotationMatrix(M);m.position.set(s.x*IN+ay.x*lift*IN,(G.pl.z+lift*ay.y)*IN,s.y*IN+ay.z*lift*IN);};
    if(G.tube){place(ctx.add(new THREE.CylinderGeometry(G.w/2*IN,G.w/2*IN,curb*IN,20),ctx.col(0xc8ccd0,{metalness:.5}),0,0,0,0,false),curb/2);place(ctx.add(new THREE.SphereGeometry(G.w/2*IN,20,10,0,Math.PI*2,0,Math.PI/2),M('skyglass',()=>new THREE.MeshPhysicalMaterial({color:0xdfeef7,transparent:true,opacity:.55,roughness:.05})),0,0,0,0,false),curb);return;}
    place(ctx.add(new THREE.BoxGeometry((G.w+3)*IN,curb*IN,(G.L+3)*IN),ctx.isSel(s)?ctx.mSel:ctx.col(0x3b3a38,{roughness:.5}),0,0,0,0,false),curb/2);
    place(ctx.add(new THREE.BoxGeometry(G.w*IN,0.6*IN,G.L*IN),M('skyglass2',()=>new THREE.MeshStandardMaterial({color:0x8fb6cf,roughness:.08,metalness:.3,transparent:true,opacity:.85})),0,0,0,0,false),curb+0.2);},
  panel:(s,{p,up})=>{const k=skyOf(s);const G=skyGeo(p,k);return html`<div className="sec"><h3>Skylight</h3>
    <${Field} label="Size" id="sk-s"><${Sel} id="sk-s" value=${k.size} onChange=${v=>up({size:v})} options=${SKY_SIZES.map(z=>[z[0],z[1]])}/><//>
    ${k.size.startsWith('tube')?null:html`<${Field} label="Type" id="sk-t"><${Sel} id="sk-t" value=${k.type} onChange=${v=>up({type:v})} options=${[['fixed','Fixed (deck mounted)'],['venting','Manual venting'],['solar','Solar-powered venting with rain sensor']]}/><//>`}
    <p className="note">${G?`Sits on the roof at ${fmtLen(G.pl.z)} above the first floor. Glass must be laminated or tempered (IRC R308.6). Plan a light shaft through the attic to the ceiling below.`:'Move it over a roof: no roof is under this skylight.'}</p></div>`;},
  takeoff:(p,add)=>{const C='Skylights';for(const s0 of (p.skylights||[]).filter(s=>s.status!=='existing')){const k=skyOf(s0);const sz=SKY_SIZES.find(z=>z[0]===k.size)||SKY_SIZES[0];
      if(k.size.startsWith('tube')){add(C,`Tubular skylight ${sz[1]} kit`,1,'EA');continue;}add(C,`Skylight ${sz[1]}, ${k.type==='fixed'?'fixed':k.type==='solar'?'solar venting':'venting'}`,1,'EA');add(C,'Skylight flashing kit',1,'EA');
      add(C,'Light shaft framing and drywall',Math.ceil(2*(sz[2]+sz[3])*36/144),'SF','about 3 ft deep');}},
  checks:(p,add)=>{for(const s of p.skylights||[]){if(!skyGeo(p,s))add('warn',{set:'IRC',code:'R308.6',title:'Skylight'},'Skylight is not on a roof','Move it over a roof plane; it cannot be drawn in 3D or framed as placed.',{kind:'skylight',id:s.id},{x:s.x,y:s.y},s.level);}}});
regTool('skylight',{label:'Skylight',short:'Skylight',key:'',group:'roof',icon:I.skylight,mode:'click',
  hint:()=>html`<b>Skylight:</b> click on a roof (show the roof lines in the plan). It sits on the roof slope; pick size and type in the panel.`,
  place:(ctx,[pt])=>{const s={id:uid('sk'),level:ctx.lv.id,x:pt.x,y:pt.y,size:'2246',type:'fixed',status:'new'};return {p:{...ctx.p,skylights:[...(ctx.p.skylights||[]),s]},sel:{kind:'skylight',id:s.id}};}});
addToolToGroup('walls','chimney');addToolToGroup('roof','skylight');
