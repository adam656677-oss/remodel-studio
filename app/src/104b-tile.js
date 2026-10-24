/* ======================= tile zones: backsplash, tub and shower surround, wainscot, full-height walls ======================= */
const TILE_MATS=[['subway','Subway tile 3" x 6"',3,6,0xf3f2ee],['square','Ceramic 4" x 4"',4,4,0xf0eee8],['large','Porcelain 12" x 24"',24,12,0xd9d6cf],['mosaic','Mosaic 1" sheets',1,1,0xe6ebee],['hex','Hexagon 2"',2,2,0xf2f2f2],['stone','Stone 12" x 12"',12,12,0xc9c0b0],['beadboard','Beadboard (wood)',3,96,0xf6f4ee]];
const SPLASH=[['','None'],['4','4" splash'],['18','Up to the wall cabinets'],['full','Full height to the ceiling']];
const SURROUND=[['','None'],['60','60" above the floor'],['72','72"'],['84','84"'],['96','96"'],['ceil','To the ceiling']];
const WAINS=[['','None'],['36','36"'],['42','42"'],['48','48"'],['54','54"'],['full','All walls, floor to ceiling']];
function tileOf(r){return {splash:'',surround:'',wains:'',mat:'subway',color:null,wainsMat:null,...(r.tile||{})};}
function tileZones(p,r){if(!r.tile)return [];const T=tileOf(r);const lv=lvlOf(p,r.level);if(!lv)return [];const H=r.ceilingH||lv.height;const RW=roomWallRuns(p,r);const zones=[];
  const fx=(p.fixtures||[]).filter(f=>f.level===r.level&&f.status!=='demolish'&&inPoly(f.x,f.y,r.pts));
  const onEdge=(e,f,tol)=>{const C=fxCorners(f);const ss=[],ds=[];for(const q of C){const pr=projSeg(q,e.a,e.b);ds.push(pr.d);ss.push((q.x-e.a.x)*e.d.x+(q.y-e.a.y)*e.d.y);}
    const near=ds.filter(d=>d<e.inset+tol).length>=2;return near?[Math.max(0,Math.min(...ss)),Math.min(e.L,Math.max(...ss))]:null;};
  const push=(e,s0,s1,z0,z1,kind,mat)=>{if(s1-s0<1||z1-z0<1)return;const P=s=>({x:e.a.x+e.d.x*s+e.nin.x*(e.inset+0.3),y:e.a.y+e.d.y*s+e.nin.y*(e.inset+0.3)});zones.push({kind,a:P(s0),b:P(s1),z0,z1,nin:e.nin,e,s0,s1,mat,wall:e.w&&e.w.id});};
  for(const e of RW.edges){if(!e.w)continue;const sur=[];
    if(T.surround)for(const f of fx.filter(f=>/tub|shower|rollin/.test(f.type))){const sp=onEdge(e,f,4);if(!sp)continue;sur.push(sp);push(e,sp[0],sp[1],0,T.surround==='ceil'?H:+T.surround,'surround',T.mat);}
    if(T.wains){const z1=T.wains==='full'?H:+T.wains;let c=0;for(const [g0,g1] of [...e.gaps,...sur].sort((a,b)=>a[0]-b[0])){if(g0>c)push(e,c,Math.min(g0,e.L),0,z1,'wains',T.wainsMat||T.mat);c=Math.max(c,g1);}if(c<e.L)push(e,c,e.L,0,z1,'wains',T.wainsMat||T.mat);}
    if(T.splash){const runs=fx.filter(f=>(isCab(f)&&!/wallcab|tall/.test(f.type))||/range|cooktop/.test(f.type)).map(f=>({f,sp:onEdge(e,f,4)})).filter(x=>x.sp).sort((a,b)=>a.sp[0]-b.sp[0]);
      // merge touching cabinets into continuous runs so the splash is one piece per run
      const merged=[];for(const x of runs){const last=merged[merged.length-1];if(last&&x.sp[0]<=last.s1+1){last.s1=Math.max(last.s1,x.sp[1]);last.fs.push(x.f);}else merged.push({s0:x.sp[0],s1:x.sp[1],fs:[x.f]});}
      for(const m of merged){const top=36;const wc=fx.find(g=>g.type==='wallcab'&&onEdge(e,g,4));const z1=T.splash==='4'?top+4:T.splash==='full'?H:(wc?(wc.elev||54):top+18);push(e,m.s0,m.s1,top,z1,'splash',T.mat);}}}
  // windows inside a zone are cut out (they are counted by area only)
  for(const z of zones){let cut=0;for(const o of p.openings.filter(o=>o.wall===z.wall&&o.type==='window')){const c=openingCenter(p,o);const s=(c.x-z.e.a.x)*z.e.d.x+(c.y-z.e.a.y)*z.e.d.y;
      const ou=Math.max(0,Math.min(z.s1,s+o.width/2)-Math.max(z.s0,s-o.width/2)),ov=Math.max(0,Math.min(z.z1,o.sill+o.height)-Math.max(z.z0,o.sill));cut+=ou*ov;}z.area=Math.max(0,((z.s1-z.s0)*(z.z1-z.z0)-cut)/144);}
  return zones;}
const _ttex={};
function tileTex(mat){if(_ttex[mat])return _ttex[mat];if(typeof document==='undefined')return null;const m=TILE_MATS.find(t=>t[0]===mat)||TILE_MATS[0];const S=256;const c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');
  g.fillStyle='#ffffff';g.fillRect(0,0,S,S);g.strokeStyle='rgba(120,120,120,0.55)';g.lineWidth=2;const px=S/24; // texture is 24" square
  if(mat==='beadboard'){for(let x=0;x<S;x+=px*3){g.beginPath();g.moveTo(x,0);g.lineTo(x,S);g.stroke();}}
  else if(mat==='hex'){const r=px*1.15;for(let row=0;row*r*1.5<S+r;row++)for(let col=0;col*r*1.732<S+r;col++){const cx=col*r*1.732+(row%2?r*0.866:0),cy=row*r*1.5;g.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i+Math.PI/6;g.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));}g.closePath();g.stroke();}}
  else{const tw=m[3]*px,th=m[2]*px;for(let y=0,row=0;y<S;y+=th,row++){g.beginPath();g.moveTo(0,y);g.lineTo(S,y);g.stroke();const off=(mat==='subway'||mat==='large')&&row%2?tw/2:0;for(let x=-off;x<S;x+=tw){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+th);g.stroke();}}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;_ttex[mat]=t;return t;}
function addTile3D(p,lv,r,add,std){for(const z of tileZones(p,r)){const m=TILE_MATS.find(t=>t[0]===z.mat)||TILE_MATS[0];const col=r.tile.color?hexNum(r.tile.color):m[4];
    const mat=std('tile-'+z.mat+'-'+col,col,{map:tileTex(z.mat),roughness:z.mat==='beadboard'?.7:.25});const L=dist(z.a,z.b);const geo=uvBox(L,z.z1-z.z0,0.5,24);const mid={x:(z.a.x+z.b.x)/2+z.nin.x*0.25,y:(z.a.y+z.b.y)/2+z.nin.y*0.25};
    add(geo,mat,mid.x*IN,(lv.elevation+(z.z0+z.z1)/2)*IN,mid.y*IN,-Math.atan2(z.b.y-z.a.y,z.b.x-z.a.x),false);}}
// interior elevation: tile zones on the wall being drawn
function tileElevDL(dl,p,IE,U,Z,sc,k){for(const r of p.rooms.filter(r=>r.level===IE.lv.id&&r.tile))for(const z of tileZones(p,r)){const pa=projSeg(z.a,IE.start,{x:IE.start.x+IE.dir.x*IE.len,y:IE.start.y+IE.dir.y*IE.len});const pb=projSeg(z.b,IE.start,{x:IE.start.x+IE.dir.x*IE.len,y:IE.start.y+IE.dir.y*IE.len});
    if(pa.d>10||pb.d>10)continue;const s0=Math.max(0,Math.min(pa.tRaw,pb.tRaw)*IE.len),s1=Math.min(IE.len,Math.max(pa.tRaw,pb.tRaw)*IE.len);if(s1-s0<1)continue;
    dl.poly([[U(s0),Z(z.z0)],[U(s1),Z(z.z0)],[U(s1),Z(z.z1)],[U(s0),Z(z.z1)]],{fill:'#f1f4f6',stroke:INK,w:0.5});const m=TILE_MATS.find(t=>t[0]===z.mat)||TILE_MATS[0];const th=Math.max(m[2],3),tw=Math.max(m[3],3);
    if(z.mat!=='beadboard'&&th*sc>0.025)for(let zz=z.z0+th;zz<z.z1-0.5;zz+=th)dl.line(U(s0),Z(zz),U(s1),Z(zz),0.15,{color:'#999999'});
    if(z.mat!=='beadboard'&&tw*sc>0.025){let row=0;for(let zz=z.z0;zz<z.z1-0.5;zz+=th,row++){const off=row%2&&(z.mat==='subway'||z.mat==='large')?tw/2:0;for(let s=s0+tw-off;s<s1-0.5;s+=tw)dl.line(U(s),Z(zz),U(s),Z(Math.min(z.z1,zz+th)),0.15,{color:'#999999'});}}
    else if(z.mat==='beadboard')for(let s=s0+3;s<s1;s+=3)dl.line(U(s),Z(z.z0),U(s),Z(z.z1),0.15,{color:'#999999'});
    if((s1-s0)*sc>0.6*k)dl.text(U((s0+s1)/2),Z(z.z1)+0.09*k,(TILE_MATS.find(t=>t[0]===z.mat)||[0,'Tile'])[1].toUpperCase(),{size:4.2*k,anchor:'middle',color:'#555555'});}}
regExtra({takeoff:(p,add,W)=>{const C='Tile';for(const r of p.rooms.filter(r=>r.tile&&r.status!=='existing')){const zs=tileZones(p,r);if(!zs.length)continue;const by={};for(const z of zs){by[z.mat]=(by[z.mat]||0)+z.area;}
  for(const [mat,a] of Object.entries(by)){const m=TILE_MATS.find(t=>t[0]===mat)||TILE_MATS[0];if(mat==='beadboard'){add('Wall finishes','Beadboard wainscot panels 4x8',Math.ceil(a*W/32),'EA',r.name);add('Wall finishes','Chair rail cap for wainscot',Math.ceil(zs.filter(z=>z.kind==='wains').reduce((s,z)=>s+(z.s1-z.s0),0)/12),'LF');continue;}
    add(C,m[1]+' wall tile',Math.ceil(a*(mat==='subway'||mat==='hex'?1.15:1.1)),'SF',r.name+(mat==='subway'?' (15% waste for the offset pattern)':''));add(C,'Thinset mortar, 50 lb',Math.ceil(a/80),'bag');add(C,'Grout, 10 lb',Math.ceil(a/60),'bag');}
  const wet=zs.filter(z=>z.kind==='surround').reduce((s,z)=>s+z.area,0);if(wet>0){add(C,'Cement backer board 3x5 (wet walls)',Math.ceil(wet*W/15),'EA');add(C,'Waterproofing membrane (liquid or sheet)',Math.ceil(wet),'SF','shower and tub walls');}
  const edgeLF=zs.reduce((s,z)=>s+(z.s1-z.s0)/12+(z.kind==='surround'?2*(z.z1-z.z0)/12:0),0);if(edgeLF>0)add(C,'Tile edge trim (metal or bullnose)',Math.ceil(edgeLF*W),'LF');}}});
function TilePanel({p,r,up}){const T=tileOf(r);const set=patch=>up({tile:{...T,...patch}});const has=!!r.tile;
  return html`<details className="framing" open=${has}><summary>Tile and wainscot</summary>
    <${Field} label="Backsplash" id="t-sp"><${Sel} id="t-sp" value=${T.splash} onChange=${v=>set({splash:v})} options=${SPLASH}/><//>
    <${Field} label="Tub or shower walls" id="t-su"><${Sel} id="t-su" value=${T.surround} onChange=${v=>set({surround:v})} options=${SURROUND}/><//>
    <${Field} label="Wainscot" id="t-wa"><${Sel} id="t-wa" value=${T.wains} onChange=${v=>set({wains:v})} options=${WAINS}/><//>
    <${Field} label="Tile" id="t-mt"><${Sel} id="t-mt" value=${T.mat} onChange=${v=>set({mat:v})} options=${TILE_MATS.filter(t=>t[0]!=='beadboard').map(t=>[t[0],t[1]])}/><//>
    ${T.wains?html`<${Field} label="Wainscot material" id="t-wm"><${Sel} id="t-wm" value=${T.wainsMat||T.mat} onChange=${v=>set({wainsMat:v})} options=${TILE_MATS.map(t=>[t[0],t[1]])}/><//>`:null}
    <${ColorPick} id="t-col" label="Tile color" value=${T.color} fallback=${'#'+((TILE_MATS.find(t=>t[0]===T.mat)||TILE_MATS[0])[4]).toString(16).padStart(6,'0')} onChange=${v=>set({color:v})}/>
    ${has?html`<p className="note">${Math.round(tileZones(p,r).reduce((s,z)=>s+z.area,0))} sq ft of tile on the walls, shown in 3D, the interior elevations and the materials list.</p>`:null}</details>`;}
