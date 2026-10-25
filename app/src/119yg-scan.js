/* ======================= walls from a scan or a plan photo (Chief As-Built / Houzz Pro style) ======================= */
// Source points: a PLY point cloud (any scanning app), or the dark pixels of the plan underlay (a photo or PDF of a
// paper plan). Walls are found by a Hough-style search for the main direction, then 1D histograms across each of the two
// square directions: each peak is a wall face; two faces 3"-8" apart are one wall. Runs split at gaps become walls,
// ends are joined at corners. From a scan, gaps at both heights become doors and gaps only up high become windows.
function dominantAngle(P0){let P=P0;if(P0.length>40000){const k=Math.ceil(P0.length/40000);const T=[];for(let i=0;i<P0.length;i+=2*k)T.push(P0[i],P0[i+1]);P=T;}let best=0,bs=-1;for(let a=0;a<90;a+=0.5){const t=a*Math.PI/180,c=Math.cos(t),s=Math.sin(t);const h1=new Map(),h2=new Map();
    for(let i=0;i<P.length;i+=2){const x=P[i],y=P[i+1];const r1=Math.round((x*c+y*s)/2),r2=Math.round((-x*s+y*c)/2);h1.set(r1,(h1.get(r1)||0)+1);h2.set(r2,(h2.get(r2)||0)+1);}
    let sc=0;for(const v of h1.values())sc+=v*v;for(const v of h2.values())sc+=v*v;if(sc>bs){bs=sc;best=a;}}
  // refine to 0.1 degree
  let b2=best,s2=-1;for(let a=best-0.6;a<=best+0.6;a+=0.05){const t=a*Math.PI/180,c=Math.cos(t),s=Math.sin(t);const h=new Map();for(let i=0;i<P.length;i+=2){const r=Math.round((P[i]*c+P[i+1]*s)/0.5);h.set(r,(h.get(r)||0)+1);}let sc=0;for(const v of h.values())sc+=v*v;if(sc>s2){s2=sc;b2=a;}}return b2;}
function faceLines(P,axis,bin,minFrac){// axis 0: lines of constant y (horizontal walls); returns [{c, pts:[along...]}]
  const H=new Map();for(let i=0;i<P.length;i+=2){const v=axis?P[i]:P[i+1];const b=Math.round(v/bin);H.set(b,(H.get(b)||0)+1);}
  const keys=[...H.keys()].sort((a,b)=>a-b);const max=Math.max(...H.values());const thr=Math.max(4,max*minFrac);const peaks=[];
  for(const k of keys){const v=H.get(k);if(v<thr)continue;if(v>=(H.get(k-1)||0)&&v>=(H.get(k+1)||0))peaks.push(k);}
  // merge peaks closer than 2 bins
  const merged=[];for(const k of peaks){const l=merged[merged.length-1];if(l&&k-l.k1<=2){l.k1=k;if(H.get(k)>H.get(l.k))l.k=k;}else merged.push({k,k1:k});}
  return merged.map(m=>{const c=(m.k)*bin;const along=[];for(let i=0;i<P.length;i+=2){const v=axis?P[i]:P[i+1];if(Math.abs(v-c)<=bin*1.5)along.push(axis?P[i+1]:P[i]);}along.sort((a,b)=>a-b);return {c,along};});}
function runsOf(along,gap,minLen){const out=[];let s=null,e=null,n=0;for(const v of along){if(s==null){s=e=v;n=1;continue;}if(v-e>gap){if(e-s>=minLen&&n>=4)out.push([s,e]);s=e=v;n=1;}else{e=v;n++;}}if(s!=null&&e-s>=minLen&&n>=4)out.push([s,e]);return out;}
function wallsFromPoints(P,o={}){const bin=o.bin||1.5,gap=o.gap||14,minLen=o.minLen||24,thick=o.thick||4.5;if(P.length<40)return {walls:[],angle:0};
  const ang=dominantAngle(P);const t=-ang*Math.PI/180,c=Math.cos(t),s=Math.sin(t);const R=new Float32Array(P.length);for(let i=0;i<P.length;i+=2){R[i]=P[i]*c-P[i+1]*s;R[i+1]=P[i]*s+P[i+1]*c;}
  let segs=[];for(const axis of [0,1]){const lines=faceLines(R,axis,bin,o.minFrac||0.08);
    // pair faces 3"-8" apart into one wall
    const used=new Set();const walls=[];for(let i=0;i<lines.length;i++){if(used.has(i))continue;let j=-1;for(let q=i+1;q<lines.length;q++){const d=lines[q].c-lines[i].c;if(d>=2.5&&d<=8.5&&!used.has(q)){j=q;break;}if(d>8.5)break;}
      if(j>=0){used.add(i);used.add(j);const along=[...lines[i].along,...lines[j].along].sort((a,b)=>a-b);walls.push({c:(lines[i].c+lines[j].c)/2,th:Math.max(3.5,lines[j].c-lines[i].c+0.5),along,pair:true});}
      else{used.add(i);walls.push({c:lines[i].c,th:o.solid?Math.max(3.5,thick):thick,along:lines[i].along,pair:false});}}
    for(const w of walls)for(const [a,b] of runsOf(w.along,gap,minLen))segs.push({axis,c:w.c,a,b,th:w.th,pair:w.pair});}
  // single faces on the outside are exterior walls: move the line outward by half a thickness
  const xs=segs.filter(s=>s.axis===1).map(s=>s.c),ys=segs.filter(s=>s.axis===0).map(s=>s.c);const bx=[Math.min(...xs),Math.max(...xs)],by=[Math.min(...ys),Math.max(...ys)];
  for(const sg of segs){const lo=sg.axis?bx[0]:by[0],hi=sg.axis?bx[1]:by[1];sg.ext=Math.abs(sg.c-lo)<6||Math.abs(sg.c-hi)<6;if(sg.ext&&!sg.pair&&!o.solid){const th=o.extThick||5.5;sg.th=th;sg.c+=(Math.abs(sg.c-lo)<6?-1:1)*th/2;}}
  // join corners: stretch ends to meet perpendicular walls within reach
  const reach=o.reach||16;for(const sg of segs){for(const end of ['a','b']){const v=sg[end];let best=null;for(const q of segs){if(q.axis===sg.axis)continue;if(sg.c<q.a-reach||sg.c>q.b+reach)continue;const d=Math.abs(q.c-v);if(d<=reach&&(!best||d<best.d))best={d,c:q.c};}if(best)sg[end]=best.c;}}
  segs=segs.filter(s=>s.b-s.a>=minLen*0.75);
  // drop near-duplicates
  const keep=[];for(const sg of segs){if(keep.some(k=>k.axis===sg.axis&&Math.abs(k.c-sg.c)<3&&Math.min(k.b,sg.b)-Math.max(k.a,sg.a)>0.6*(sg.b-sg.a)))continue;keep.push(sg);}
  // collinear runs with a door-sized gap become one wall with a door
  keep.sort((u,v)=>u.axis-v.axis||u.c-v.c||u.a-v.a);const fin=[];const doors=[];
  for(const sg of keep){const l=fin[fin.length-1];if(l&&l.axis===sg.axis&&Math.abs(l.c-sg.c)<2.5){const g=sg.a-l.b;if(g>=24&&g<=50){(l.doors=l.doors||[]).push({pos:(l.b+sg.a)/2-l.a0,width:Math.round(g/2)*2});l.b=sg.b;continue;}}fin.push({...sg,a0:sg.a});}
  for(const sg of fin)for(const d of (sg.doors||[]))d.pos=d.pos+(sg.a0-sg.a);
  const back=(x,y)=>({x:x*c+y*s,y:-x*s+y*c});
  fin.forEach((sg,i)=>{for(const d of (sg.doors||[]))doors.push({wall:i,type:'door',pos:d.pos,width:d.width});});
  return {angle:ang,doors,walls:fin.map(sg=>{const A=sg.axis?back(sg.c,sg.a):back(sg.a,sg.c),B=sg.axis?back(sg.c,sg.b):back(sg.b,sg.c);return {x1:A.x,y1:A.y,x2:B.x,y2:B.y,thick:Math.round(sg.th*2)/2,ext:sg.ext};})};}
// openings from a scan: sample along each wall at two heights
function openingsFromCloud(XYZ,walls,floorZ){const out=[];for(const [wi,w] of walls.entries()){const L=Math.hypot(w.x2-w.x1,w.y2-w.y1);if(L<30)continue;const d={x:(w.x2-w.x1)/L,y:(w.y2-w.y1)/L};const nb=Math.ceil(L/3);const lo=new Uint16Array(nb),hi=new Uint16Array(nb);
    for(let i=0;i<XYZ.length;i+=3){const x=XYZ[i],y=XYZ[i+1],z=XYZ[i+2]-floorZ;const rx=x-w.x1,ry=y-w.y1;const t=rx*d.x+ry*d.y;if(t<0||t>=L)continue;const off=Math.abs(-rx*d.y+ry*d.x);if(off>w.thick/2+3)continue;const b=Math.floor(t/3);if(z>8&&z<30)lo[b]++;else if(z>44&&z<72)hi[b]++;}
    const scan=(arr,cond)=>{const runs=[];let s=-1;for(let b=0;b<=nb;b++){const g=b<nb&&cond(b);if(g&&s<0)s=b;if(!g&&s>=0){runs.push([s*3,b*3]);s=-1;}}return runs;};
    const loMed=[...lo].sort((a,b)=>a-b)[Math.floor(nb/2)]||1,hiMed=[...hi].sort((a,b)=>a-b)[Math.floor(nb/2)]||1;
    for(const [a,b] of scan(lo,k=>lo[k]<loMed*0.15&&hi[k]<hiMed*0.15))if(b-a>=24&&b-a<=76&&a>2&&b<L-2)out.push({wall:wi,type:'door',pos:(a+b)/2,width:Math.round((b-a)/2)*2});
    for(const [a,b] of scan(hi,k=>hi[k]<hiMed*0.15&&lo[k]>=loMed*0.4))if(b-a>=16&&b-a<=110&&a>2&&b<L-2)out.push({wall:wi,type:'window',pos:(a+b)/2,width:Math.round((b-a)/2)*2});}
  return out;}
async function scanSourcePoints(p,src,levelId){const lv=lvlOf(p,levelId)||p.levels[0];
  if(src==='cloud'){const cl=p.cloud;if(!cl)throw new Error('No scan is loaded. Add a .ply scan in Measure › Underlay and scans first.');const a=await assetGet(cl.asset);if(!a)throw new Error('The scan file is missing from this computer.');
    const XYZ=cloudToPlan({points:a.points},cl);const e=(lvlOf(p,cl.level)||lv).elevation;const lo=e+(cl.lo||12),hi=e+(cl.hi||72);const P=[];for(let i=0;i<XYZ.length;i+=3){const z=XYZ[i+2];if(z>=lo&&z<=hi)P.push(XYZ[i],XYZ[i+1]);}return {P:Float32Array.from(P),XYZ,floorZ:e};}
  const u=p.underlay;if(!u||u.level!==lv.id)throw new Error('No plan image on this level. Add one in Measure › Underlay and scans, set its scale, and drag it into place.');const a=await assetGet(u.asset);if(!a)throw new Error('The plan image is missing from this computer.');
  const img=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error('That image could not be read.'));im.src=blobURL(a.id,a.blob);});
  const step=Math.max(1,Math.round(1.5/u.scale));const W=Math.floor(img.naturalWidth/step),H=Math.floor(img.naturalHeight/step);const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');g.drawImage(img,0,0,W,H);const d=g.getImageData(0,0,W,H).data;
  let sum=0;for(let i=0;i<d.length;i+=4)sum+=d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11;const mean=sum/(d.length/4);const thr=Math.min(110,mean*0.55);const s=u.scale*step;const r=(u.rot||0)*Math.PI/180,cr=Math.cos(r),sr=Math.sin(r);const P=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;const v=d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11;if(v<thr&&d[i+3]>100){const px=x*s,py=y*s;P.push(u.x+px*cr-py*sr,u.y+px*sr+py*cr);}}
  return {P:Float32Array.from(P),XYZ:null,floorZ:0,solid:true};}
function ScanWallsModal({p,commit,levelId,onClose}){const lv=lvlOf(p,levelId)||p.levels[0];const [src,setSrc]=useState(p.cloud?'cloud':'image');const [res,setRes]=useState(null);const [busy,setBusy]=useState(false);const [msg,setMsg]=useState(null);
  const [o,setO]=useState({minLen:24,gap:14,thick:4.5,extThick:5.5,replace:false,status:'existing'});
  const run=async()=>{setBusy(true);setMsg(null);try{const S=await scanSourcePoints(p,src,lv.id);if(S.P.length<80)throw new Error('Too few points to find walls. Widen the slice heights or check the image scale.');
      // thin very large sets for speed
      let P=S.P;if(P.length>240000){const k=Math.ceil(P.length/240000);const T=[];for(let i=0;i<P.length;i+=2*k)T.push(P[i],P[i+1]);P=Float32Array.from(T);}
      const R=wallsFromPoints(P,{...o,solid:!!S.solid});const ops=S.XYZ?openingsFromCloud(S.XYZ,R.walls,S.floorZ):R.doors;setRes({...R,ops,P});
      setMsg(`Found ${R.walls.length} wall${R.walls.length===1?'':'s'}${ops.length?`, ${ops.filter(x=>x.type==='door').length} doors and ${ops.filter(x=>x.type==='window').length} windows`:''}. Main direction ${R.angle.toFixed(1)}°.`);}catch(e){setMsg(e.message||String(e));setRes(null);}setBusy(false);};
  const apply=()=>{if(!res)return;let q=p;if(o.replace)q={...q,walls:q.walls.filter(w=>w.level!==lv.id),openings:q.openings.filter(op=>{const w=p.walls.find(w=>w.id===op.wall);return !w||w.level!==lv.id;})};
    const ws=res.walls.map(w=>({id:uid('w'),level:lv.id,x1:w.x1,y1:w.y1,x2:w.x2,y2:w.y2,thick:w.thick,kind:w.ext?'exterior':'interior',bearing:!!w.ext,height:null,status:o.status,fromScan:true}));
    const ops=res.ops.map(x=>{const w=ws[x.wall];return x.type==='door'?{id:uid('o'),wall:w.id,type:'door',pos:x.pos,width:Math.max(24,Math.min(72,x.width)),height:80,sill:0,hinge:0,swing:1,status:o.status}:{id:uid('o'),wall:w.id,type:'window',pos:x.pos,width:x.width,height:48,sill:36,operation:'double-hung',status:o.status};});
    commit({...q,walls:[...q.walls,...ws],openings:[...q.openings,...ops]});onClose();window.__say&&window.__say(`Added ${ws.length} walls${ops.length?' and '+ops.length+' openings':''} on ${lv.name}. Check them against your tape measurements; then use Rooms › Auto rooms.`);};
  const B=res&&res.walls.length?(()=>{const xs=res.walls.flatMap(w=>[w.x1,w.x2]),ys=res.walls.flatMap(w=>[w.y1,w.y2]);return [Math.min(...xs)-24,Math.min(...ys)-24,Math.max(...xs)+24,Math.max(...ys)+24];})():null;
  const dots=res?(()=>{const out=[];const st=Math.max(1,Math.floor(res.P.length/2/6000));for(let i=0;i<res.P.length;i+=2*st)out.push(`M${res.P[i].toFixed(1)} ${res.P[i+1].toFixed(1)}h0.1`);return out.join('');})():'';
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide" role="dialog" aria-label="Walls from a scan or plan photo"><h2>Walls from a scan or plan photo</h2>
    <p className="note">Finds straight, square walls in a point-cloud scan (.ply from Polycam, 3D Scanner App, COLMAP and others) or in the plan image under ${lv.name}. It works best on square rooms; check the result against your tape.</p>
    <div className="rw-grid"><div>
      <${Field} label="Source" id="sw-src"><${Sel} id="sw-src" value=${src} onChange=${v=>{setSrc(v);setRes(null);}} options=${[['cloud','Point-cloud scan'+(p.cloud?'':' (none loaded)')],['image','Plan image on this level'+(p.underlay&&p.underlay.level===lv.id?'':' (none)')]]}/><//>
      <${Field} label="Shortest wall" id="sw-min"><${LenInput} id="sw-min" value=${o.minLen} onChange=${v=>v>0&&setO({...o,minLen:v})}/><//>
      <${Field} label="Join gaps under" id="sw-gap"><${LenInput} id="sw-gap" value=${o.gap} onChange=${v=>v>0&&setO({...o,gap:v})}/><//>
      <${Field} label="Interior wall thickness (one face seen)" id="sw-th"><${LenInput} id="sw-th" value=${o.thick} onChange=${v=>v>0&&setO({...o,thick:v})}/><//>
      <${Field} label="Exterior wall thickness" id="sw-et"><${LenInput} id="sw-et" value=${o.extThick} onChange=${v=>v>0&&setO({...o,extThick:v})}/><//>
      <${Field} label="Mark new walls as" id="sw-st"><${Sel} id="sw-st" value=${o.status} onChange=${v=>setO({...o,status:v})} options=${[['existing','Existing'],['new','New']]}/><//>
      <label className="chk"><input type="checkbox" checked=${o.replace} onChange=${e=>setO({...o,replace:e.target.checked})}/> Replace the walls already on ${lv.name}</label>
      <div className="row"><button className="btn primary" onClick=${run} disabled=${busy}>${busy?'Finding walls…':'Find walls'}</button></div>${msg?html`<p className="note">${msg}</p>`:null}</div>
      <div className="sw-prev">${B?html`<svg viewBox=${`${B[0]} ${B[1]} ${B[2]-B[0]} ${B[3]-B[1]}`} preserveAspectRatio="xMidYMid meet" aria-label="Preview of the walls found"><rect x=${B[0]} y=${B[1]} width=${B[2]-B[0]} height=${B[3]-B[1]} fill="#fff"/><path d=${dots} stroke="#9aa5b1" strokeWidth=${Math.max(1,(B[2]-B[0])/400)} strokeLinecap="round"/>
        ${res.walls.map((w,i)=>html`<line key=${i} x1=${w.x1} y1=${w.y1} x2=${w.x2} y2=${w.y2} stroke=${w.ext?'#1f2937':'#2f6fdb'} strokeWidth=${w.thick} strokeOpacity="0.75"/>`)}
        ${res.ops.map((x,i)=>{const w=res.walls[x.wall];const L=Math.hypot(w.x2-w.x1,w.y2-w.y1);const t=x.pos/L;return html`<circle key=${'o'+i} cx=${w.x1+(w.x2-w.x1)*t} cy=${w.y1+(w.y2-w.y1)*t} r=${x.width/2} fill="none" stroke=${x.type==='door'?'#c2410c':'#0e9fb0'} strokeWidth="2"/>`;})}</svg>`:html`<p className="note">The walls found show here.</p>`}</div></div>
    <div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Cancel</button><button className="btn primary" disabled=${!res||!res.walls.length} onClick=${apply}>Add ${res?res.walls.length:''} walls</button></div></div></div>`;}
EXTRA_DIALOGS.scanwalls=ScanWallsModal;
