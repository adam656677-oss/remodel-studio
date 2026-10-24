/* ======================= measure, color and trim from photos ======================= */
// A photo is set to scale one of two ways:
//   line: two points on something of known length (good when the surface faces the camera squarely)
//   rectangle: four corners of a known rectangle such as a door; a homography removes perspective,
//   so measurements anywhere on that same flat surface stay accurate even when the photo is taken at an angle.
function homography(src,dst){ // src/dst: 4 [x,y] pairs; returns 3x3 as array of 9 (h33=1)
  const A=[],b=[];for(let i=0;i<4;i++){const [x,y]=src[i],[u,v]=dst[i];A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v);}
  const n=8;for(let c=0;c<n;c++){let piv=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[piv][c]))piv=r;[A[c],A[piv]]=[A[piv],A[c]];[b[c],b[piv]]=[b[piv],b[c]];
    if(Math.abs(A[c][c])<1e-12)return null;for(let r=0;r<n;r++){if(r===c)continue;const f=A[r][c]/A[c][c];for(let k=c;k<n;k++)A[r][k]-=f*A[c][k];b[r]-=f*b[c];}}
  const h=b.map((v,i)=>v/A[i][i]);return [...h,1];}
const hApply=(H,[x,y])=>{const w=H[6]*x+H[7]*y+H[8];return [(H[0]*x+H[1]*y+H[2])/w,(H[3]*x+H[4]*y+H[5])/w];};
function calScale(cal){ // returns function(imgPtA,imgPtB) => inches, or null
  if(!cal)return null;
  if(cal.type==='line'&&cal.pts?.length===2&&cal.len>0){const px=Math.hypot(cal.pts[0][0]-cal.pts[1][0],cal.pts[0][1]-cal.pts[1][1]);if(px<2)return null;const k=cal.len/px;return (a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])*k;}
  if(cal.type==='rect'&&cal.pts?.length===4&&cal.w>0&&cal.h>0){const H=homography(cal.pts,[[0,0],[cal.w,0],[cal.w,cal.h],[0,cal.h]]);if(!H)return null;return (a,b)=>{const A=hApply(H,a),B=hApply(H,b);return Math.hypot(A[0]-B[0],A[1]-B[1]);};}
  return null;}
const CAL_PRESETS=[['Standard door 36" x 80"',36,80],['Door 32" x 80"',32,80],['Door 30" x 80"',30,80],['Garage door 16\' x 7\'',192,84],['Plywood sheet 48" x 96"',48,96],['Brick, 3 courses (8" tall) x 8" long',8,8],['8x16 concrete block',15.625,7.625],['Outlet cover plate 2-3/4" x 4-1/2"',2.75,4.5],['Letter paper 8-1/2" x 11"',8.5,11],['Tape or stick laid flat, 24" x 1"',24,1]];
function nearestColor(hex){const t=hexNum(hex);const r=(t>>16)&255,g=(t>>8)&255,b=t&255;let best=null;
  for(const x of LIB.filter(x=>x.place==='color')){const u=hexNum(x.hex);const dr=r-((u>>16)&255),dg=g-((u>>8)&255),db=b-(u&255);const d=Math.sqrt(2*dr*dr+4*dg*dg+3*db*db);if(!best||d<best.d)best={x,d};}return best;}
const toHex=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');

const TRIM_PROMPT=()=>`You are looking at a photo of a building, inside or outside, for a remodel plan. Identify the trim, doors, windows and finishes you can actually see. Pick each answer only from the ids listed; use null when you cannot see it or are not sure.
Baseboard ids: ${LIB.filter(x=>x.place==='trim'&&x.slot==='base').map(x=>`${x.id} (${x.label})`).join('; ')}
Casing ids: ${LIB.filter(x=>x.place==='trim'&&x.slot==='casing').map(x=>`${x.id} (${x.label})`).join('; ')}
Crown ids: ${LIB.filter(x=>x.place==='trim'&&x.slot==='crown').map(x=>`${x.id} (${x.label})`).join('; ')}
Chair rail ids: ${LIB.filter(x=>x.place==='trim'&&x.slot==='chair').map(x=>`${x.id} (${x.label})`).join('; ')}
Wainscot ids: ${LIB.filter(x=>x.place==='trim'&&x.slot==='wainscot').map(x=>`${x.id} (${x.label})`).join('; ')}
Door style keys: ${Object.entries(DOOR_STYLES).map(([k,v])=>`${k} (${v})`).join('; ')}
Door type keys: ${Object.entries(DOOR_TYPES).map(([k,v])=>`${k} (${v})`).join('; ')}
Window operation keys: ${Object.entries(WIN_NAMES).map(([k,v])=>`${k} (${v})`).join('; ')}
Ceiling keys: ${Object.entries(CEILINGS).map(([k,v])=>`${k} (${v[0]})`).join('; ')}
Wall finish keys: ${Object.entries(WALL_FIN).map(([k,v])=>`${k} (${v[0]})`).join('; ')}
Floor keys: ${Object.entries(FLOOR_LIB).map(([k,v])=>`${k} (${v[0]})`).join('; ')}
Siding keys: ${Object.entries(SIDING_LIB).map(([k,v])=>`${k} (${v[0]})`).join('; ')}
Roofing keys: ${Object.entries(ROOF_LIB).map(([k,v])=>`${k} (${v[0]})`).join('; ')}
Reply with JSON only, in this shape:
{"summary":"one sentence on what the photo shows","inside":true,
 "trim":{"base":id|null,"casing":id|null,"crown":id|null,"chair":id|null,"wainscot":id|null},
 "door":{"style":key|null,"type":key|null},"window":{"operation":key|null,"grilles":true|false|null},
 "ceiling":key|null,"wallFinish":key|null,"floor":key|null,"siding":key|null,"roofing":key|null,
 "colors":{"walls":"#rrggbb"|null,"trim":"#rrggbb"|null,"ceiling":"#rrggbb"|null,"floor":"#rrggbb"|null,"door":"#rrggbb"|null,"siding":"#rrggbb"|null,"roof":"#rrggbb"|null,"cabinets":"#rrggbb"|null},
 "confidence":{"trim":"high"|"medium"|"low","finishes":"high"|"medium"|"low"},
 "notes":["short notes, e.g. existing popcorn ceiling, water stains, out-of-plumb walls"]}
Colors in a photo shift with lighting, so give your best estimate of the paint color, not the shadowed pixel color.`;

function PhotoMeasure({p,commit,sel,assets,libCtx}){
  const photos=assets.list.filter(a=>a.kind==='photo').sort((a,b)=>b.date.localeCompare(a.date));
  const [curId,setCurId]=useState(null);const cur=photos.find(a=>a.id===curId)||photos[0]||null;
  const [mode,setMode]=useState('scale');const [calType,setCalType]=useState('rect');const [pend,setPend]=useState([]);
  const [vb,setVb]=useState(null);const svgRef=useRef(null);const dragRef=useRef(null);const [hoverPt,setHoverPt]=useState(null);
  const [color,setColor]=useState(null);const [msg,setMsg]=useState(null);const canvasRef=useRef(null);
  const [ai,setAi]=useState(null);const [busy,setBusy]=useState(false);const [sampleFn,setSampleFn]=useState(undefined);
  useEffect(()=>{let live=true;(async()=>{try{const s=window.claude&&window.claude.use?await window.claude.use('sample'):null;if(!s){if(live)setSampleFn(null);return;}const lim=await s.limits().catch(()=>null);if(live)setSampleFn(()=>lim&&lim.images?s:null);}catch(e){if(live)setSampleFn(null);}})();return ()=>{live=false;};},[]);
  // image pixels for color picking
  const url=cur?blobURL(cur.id,cur.blob):null;
  const [dims,setDims]=useState(null);
  useEffect(()=>{setPend([]);setColor(null);setAi(cur&&cur.ai||null);setMsg(null);if(!cur){setDims(null);return;}let live=true;const img=new Image();img.onload=()=>{if(!live)return;const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);canvasRef.current=c;setDims({w:img.naturalWidth,h:img.naturalHeight});setVb({x:0,y:0,w:img.naturalWidth,h:img.naturalHeight});};img.src=url;return ()=>{live=false;};},[cur&&cur.id]);
  const save=async patch=>{if(!cur)return;await assetPut({...cur,...patch});assets.reload();};
  const cal=cur&&cur.cal;const meas=(cur&&cur.meas)||[];const scaleFn=calScale(cal);
  const add=async e=>{let first=null;for(const f of e.target.files){const d=await downscale(f,2400);const id=uid('ph');first=first||id;await assetPut({id,project:p.id||'default',kind:'photo',blob:d.blob,w:d.w,h:d.h,name:f.name,date:new Date().toISOString(),note:'',pin:sel?{...sel}:null});}assets.reload();if(first)setCurId(first);};
  // screen <-> image coordinates
  const toImg=e=>{const r=svgRef.current.getBoundingClientRect();return [vb.x+(e.clientX-r.left)/r.width*vb.w,vb.y+(e.clientY-r.top)/r.height*vb.h];};
  const pxPerScreen=()=>{const r=svgRef.current.getBoundingClientRect();return vb.w/r.width;};
  useEffect(()=>{const el=svgRef.current;if(!el||!vb)return;const wh=e=>{e.preventDefault();const [ix,iy]=toImg(e);const f=Math.exp(e.deltaY*0.0015);setVb(v=>{const w=Math.max(40,Math.min(dims.w*1.5,v.w*f)),h=w*v.h/v.w;return {x:ix-(ix-v.x)*w/v.w,y:iy-(iy-v.y)*h/v.h,w,h};});};
    el.addEventListener('wheel',wh,{passive:false});return ()=>el.removeEventListener('wheel',wh);});
  const sampleAt=(x,y,r=4)=>{const c=canvasRef.current;if(!c)return null;const x0=Math.max(0,Math.round(x-r)),y0=Math.max(0,Math.round(y-r));const w=Math.min(c.width-x0,2*r+1),h=Math.min(c.height-y0,2*r+1);if(w<1||h<1)return null;
    const d=c.getContext('2d').getImageData(x0,y0,w,h).data;let R=0,G=0,B=0,n=0;for(let i=0;i<d.length;i+=4){R+=d[i];G+=d[i+1];B+=d[i+2];n++;}return [R/n,G/n,B/n];};
  const corrected=rgb=>{const wp=cur&&cur.white;if(!wp)return rgb;return rgb.map((v,i)=>v*(235/Math.max(1,wp[i])));};
  const handles=[];if(cal&&cal.pts)cal.pts.forEach((q,i)=>handles.push({kind:'cal',i,q}));meas.forEach((m,j)=>{handles.push({kind:'m',j,end:0,q:m.a});handles.push({kind:'m',j,end:1,q:m.b});});
  const onDown=e=>{if(!vb)return;const pt=toImg(e);const tol=10*pxPerScreen();try{svgRef.current.setPointerCapture(e.pointerId);}catch(_){}
    if(e.button===1||e.button===2||e.altKey||mode==='pan'){dragRef.current={pan:true,sx:e.clientX,sy:e.clientY,v:{...vb}};return;}
    const h=handles.find(h=>Math.hypot(h.q[0]-pt[0],h.q[1]-pt[1])<tol);if(h){dragRef.current={h,sx:e.clientX,sy:e.clientY,moved:false,at:h.q};return;}
    placeAt(pt);};
  const placeAt=pt=>{
    if(mode==='scale'){const need=calType==='rect'?4:2;const next=[...pend,pt];if(next.length>=need){const base=calType==='rect'?{type:'rect',w:cal&&cal.type==='rect'?cal.w:36,h:cal&&cal.type==='rect'?cal.h:80}:{type:'line',len:cal&&cal.type==='line'?cal.len:36};save({cal:{...base,pts:next}});setPend([]);}else setPend(next);}
    else if(mode==='measure'){const next=[...pend,pt];if(next.length===2){save({meas:[...meas,{a:next[0],b:next[1],name:'Measurement '+(meas.length+1)}]});setPend([]);}else setPend(next);}
    else if(mode==='color'||mode==='white'){const rgb=sampleAt(pt[0],pt[1],Math.max(2,Math.round(3*pxPerScreen())));if(!rgb)return;
      if(mode==='white'){save({white:rgb});setMode('color');setMsg({ok:true,t:'White point set. Colors picked from this photo are now corrected for its lighting.'});}
      else{const c=corrected(rgb);const hex=toHex(...c);setColor({hex,raw:toHex(...rgb),pt,near:nearestColor(hex)});}}};
  const onMove=e=>{if(!vb)return;const pt=toImg(e);setHoverPt(pt);const D=dragRef.current;if(!D)return;
    if(D.pan){const r=svgRef.current.getBoundingClientRect();const k=D.v.w/r.width;setVb({...D.v,x:D.v.x-(e.clientX-D.sx)*k,y:D.v.y-(e.clientY-D.sy)*k});return;}
    if(!D.moved&&Math.hypot(e.clientX-D.sx,e.clientY-D.sy)<4)return;D.moved=true;
    if(D.h.kind==='cal'){D.live={...cal,pts:cal.pts.map((q,i)=>i===D.h.i?pt:q)};}else{D.live=meas.map((m,j)=>j!==D.h.j?m:{...m,[D.h.end?'b':'a']:pt});}
    // show the live position immediately
    if(cur){if(D.h.kind==='cal')cur.cal=D.live;else cur.meas=D.live;setHoverPt([...pt]);}};
  const onUp=()=>{const D=dragRef.current;dragRef.current=null;if(D&&D.h&&!D.moved){if(!(D.h.kind==='cal'&&mode==='scale'))placeAt(D.at);return;}if(D&&D.live){if(D.h.kind==='cal')save({cal:D.live});else save({meas:D.live});}};
  // what a measurement can be used for, given the current selection
  const o=findObj(p,sel);
  const uses=[];if(o&&sel.kind==='wall'){uses.push(['wall-len','Wall length'],['wall-h','Wall height']);}
  if(o&&sel.kind==='opening'){uses.push(['op-w',o.type==='door'?'Door width':'Window width'],['op-h',o.type==='door'?'Door height':'Window height']);if(o.type==='window')uses.push(['op-sill','Sill height']);}
  if(o&&sel.kind==='fixture')uses.push(['fx-w','Width'],['fx-d','Depth'],['fx-h','Height']);
  uses.push(['tr-base','Match baseboard by height'],['tr-casing','Match casing by width'],['tr-crown','Match crown by height']);
  const useMeas=(k,v)=>{const up=patch=>commit(updObj(p,sel.kind,sel.id,patch));const r=Math.round(v*4)/4;
    if(k==='wall-len')commit(setWallLength(p,o,r));else if(k==='wall-h')up({height:r});else if(k==='op-w'){const w=p.walls.find(w=>w.id===o.wall);const L=w?wlen(w):999;if(r<L)up({width:r,pos:Math.max(r/2,Math.min(L-r/2,o.pos))});}
    else if(k==='op-h')up({height:r});else if(k==='op-sill')up({sill:r});else if(k==='fx-w')up({w:r});else if(k==='fx-d')up({d:r});else if(k==='fx-h')up({h:r});
    else if(k.startsWith('tr-')){const slot=k.slice(3);const best=LIB.filter(x=>x.place==='trim'&&x.slot===slot&&x.h>0).sort((a,b)=>Math.abs(a.h-v)-Math.abs(b.h-v))[0];
      if(best){const room=o&&sel.kind==='room'?o:null;commit(room?updObj(p,'room',room.id,{trim:{...(room.trim||{}),[slot]:best.id}}):{...p,settings:{...p.settings,trim:{...(p.settings.trim||{}),[slot]:best.id}}});setMsg({ok:true,t:`Closest match: ${best.label}, used for ${room?room.name:'the whole house'}.`});}}
    if(!k.startsWith('tr-'))setMsg({ok:true,t:'Applied '+fmtLen(r)+'.'});};
  // identify trim and finishes with Claude
  const identify=async()=>{if(!sampleFn||!cur)return;setBusy(true);setMsg(null);try{const a=await sampleFn.json(TRIM_PROMPT(),{images:[(await downscale(cur.blob,1600)).blob]});if(!a||typeof a!=='object')throw {code:'invalid_json'};setAi(a);save({ai:a,note:cur.note||a.summary||''});}
    catch(e){const c=e&&e.code;setMsg({ok:false,t:c==='not_granted'?'Claude was not allowed to look at the photo.':c==='rate_limited'?'Too many requests right now. Try again in a minute.':'The photo could not be analyzed. Try a clearer, well-lit photo.'});}setBusy(false);};
  const aiRows=[];if(ai){const T=ai.trim||{};for(const [slot] of TRIM_SLOTS)if(T[slot]&&LIB_BY_ID[T[slot]])aiRows.push({k:'trim-'+slot,label:TRIM_SLOTS.find(s=>s[0]===slot)[1],val:LIB_BY_ID[T[slot]].label,it:LIB_BY_ID[T[slot]]});
    if(ai.ceiling&&CEILINGS[ai.ceiling])aiRows.push({k:'ceil',label:'Ceiling',val:CEILINGS[ai.ceiling][0],it:LIB.find(x=>x.place==='ceiling'&&x.key===ai.ceiling)});
    if(ai.wallFinish&&WALL_FIN[ai.wallFinish])aiRows.push({k:'wf',label:'Walls',val:WALL_FIN[ai.wallFinish][0],it:LIB.find(x=>x.place==='wallfin'&&x.key===ai.wallFinish)});
    if(ai.floor&&FLOOR_LIB[ai.floor])aiRows.push({k:'fl',label:'Floor',val:FLOOR_LIB[ai.floor][0],it:LIB.find(x=>x.place==='floor'&&x.key===ai.floor)});
    if(ai.siding&&SIDING_LIB[ai.siding])aiRows.push({k:'si',label:'Siding',val:SIDING_LIB[ai.siding][0],it:LIB.find(x=>x.place==='siding'&&x.key===ai.siding)});
    if(ai.roofing&&ROOF_LIB[ai.roofing])aiRows.push({k:'ro',label:'Roofing',val:ROOF_LIB[ai.roofing][0],it:LIB.find(x=>x.place==='roof'&&x.key===ai.roofing)});
    const d=ai.door||{};if(d.style||d.type){const it=LIB.find(x=>x.place==='door'&&(!d.style||x.style===d.style)&&(!d.type||x.dtype===d.type));aiRows.push({k:'door',label:'Door',val:[d.type&&DOOR_TYPES[d.type],d.style&&DOOR_STYLES[d.style]].filter(Boolean).join(', '),it});}
    const w=ai.window||{};if(w.operation){const it=LIB.find(x=>x.place==='window'&&x.operation===w.operation);aiRows.push({k:'win',label:'Windows',val:(WIN_NAMES[w.operation]||w.operation)+(w.grilles?' with grilles':''),it});}
    for(const [k,v] of Object.entries(ai.colors||{}))if(/^#[0-9a-f]{6}$/i.test(v||''))aiRows.push({k:'c-'+k,label:k[0].toUpperCase()+k.slice(1)+' color',val:v+' · close to '+nearestColor(v).x.label,it:{id:'tmp-'+k,place:'color',hex:v},color:v});}
  const S=vb&&svgRef.current?pxPerScreen():1;const sw=1.6*S, r=5*S, fs=13*S;
  const calPts=(cal&&cal.pts)||[];const prec=scaleFn&&hoverPt?scaleFn(hoverPt,[hoverPt[0]+2,hoverPt[1]]):null;
  return html`<section className="capcard pm">
    <div className="row"><label className="btn primary" htmlFor="pm-add">Add photos…</label><input id="pm-add" type="file" accept="image/*" multiple hidden onChange=${add}/>
      <span className="note">${photos.length?`${photos.length} photo${photos.length>1?'s':''}. Pick one below.`:'Add a photo of a wall, room or the outside of the building.'}</span></div>
    ${photos.length?html`<div className="pmthumbs">${photos.map(a=>html`<button key=${a.id} className=${'pmthumb'+(cur&&a.id===cur.id?' on':'')} onClick=${()=>setCurId(a.id)} aria-label=${'Use photo '+(a.note||a.name)}><img src=${blobURL(a.id,a.blob)} alt=""/>${a.cal?html`<span className="pill ok">scaled</span>`:null}</button>`)}</div>`:null}
    ${cur&&dims?html`<div className="pmgrid">
      <div className="pmstage">
        <div className="seg pmmodes" role="tablist">${[['scale','1 · Set scale'],['measure','2 · Measure'],['color','Pick color'],['trim','Trim and finishes'],['pan','Move']].map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${mode===k} className=${mode===k?'on':''} onClick=${()=>{setMode(k);setPend([]);}}>${l}</button>`)}</div>
        <svg ref=${svgRef} className="pmsvg" viewBox=${vb?`${vb.x} ${vb.y} ${vb.w} ${vb.h}`:`0 0 ${dims.w} ${dims.h}`} style=${{aspectRatio:`${dims.w} / ${dims.h}`,cursor:mode==='pan'?'grab':'crosshair'}}
          onPointerDown=${onDown} onPointerMove=${onMove} onPointerUp=${onUp} onPointerLeave=${()=>setHoverPt(null)} onContextMenu=${e=>e.preventDefault()}>
          <image href=${url} x="0" y="0" width=${dims.w} height=${dims.h}/>
          ${calPts.length?html`<polygon points=${calPts.map(q=>q.join(',')).join(' ')} className="pm-cal" strokeWidth=${sw}/>`:null}
          ${calPts.map((q,i)=>html`<circle key=${'c'+i} cx=${q[0]} cy=${q[1]} r=${r} className="pm-calpt" strokeWidth=${sw}/>`)}
          ${meas.map((m,j)=>{const v=scaleFn?scaleFn(m.a,m.b):null;return html`<g key=${'m'+j}><line x1=${m.a[0]} y1=${m.a[1]} x2=${m.b[0]} y2=${m.b[1]} className="pm-meas" strokeWidth=${sw*1.4}/>
            <circle cx=${m.a[0]} cy=${m.a[1]} r=${r*0.8} className="pm-mpt"/><circle cx=${m.b[0]} cy=${m.b[1]} r=${r*0.8} className="pm-mpt"/>
            <text x=${(m.a[0]+m.b[0])/2} y=${(m.a[1]+m.b[1])/2-8*S} textAnchor="middle" className="pm-t" style=${{fontSize:fs+'px',strokeWidth:3*S+'px'}}>${v!=null?fmtLen(Math.round(v*4)/4):'set scale'}</text></g>`;})}
          ${pend.map((q,i)=>html`<circle key=${'p'+i} cx=${q[0]} cy=${q[1]} r=${r} className="pm-pend"/>`)}
          ${pend.length&&hoverPt?html`<line x1=${pend[pend.length-1][0]} y1=${pend[pend.length-1][1]} x2=${hoverPt[0]} y2=${hoverPt[1]} className="pm-pendl" strokeWidth=${sw}/>`:null}
          ${color?html`<circle cx=${color.pt[0]} cy=${color.pt[1]} r=${r*1.6} className="pm-colpt" style=${{fill:color.raw}} strokeWidth=${sw}/>`:null}
        </svg>
        ${hoverPt&&dims&&mode!=='pan'?html`<div className="pmloupe" aria-hidden="true"><svg viewBox=${`${hoverPt[0]-30*S/2} ${hoverPt[1]-30*S/2} ${30*S} ${30*S}`}><image href=${url} x="0" y="0" width=${dims.w} height=${dims.h}/><line x1=${hoverPt[0]} y1=${hoverPt[1]-30*S} x2=${hoverPt[0]} y2=${hoverPt[1]+30*S} className="pm-cross" strokeWidth=${S*0.3}/><line x1=${hoverPt[0]-30*S} y1=${hoverPt[1]} x2=${hoverPt[0]+30*S} y2=${hoverPt[1]} className="pm-cross" strokeWidth=${S*0.3}/></svg></div>`:null}
        <p className="note">Scroll to zoom, right-drag or Alt-drag to move the photo, drag any dot to fine-tune it. The magnifier shows exactly where a click lands.${prec!=null?` At the pointer, 2 pixels is about ${fmtLen(Math.max(1/16,Math.round(prec*16)/16))} on the scaled surface.`:''}</p>
      </div>
      <div className="pmside">
        ${mode==='scale'?html`<h3>Set the scale</h3>
          <div className="seg">${[['rect','Known rectangle (best)'],['line','Known length']].map(([k,l])=>html`<button key=${k} className=${calType===k?'on':''} onClick=${()=>{setCalType(k);setPend([]);}}>${l}</button>`)}</div>
          ${calType==='rect'?html`<p className="note">Click the four corners of something rectangular and flat whose size you know, in this order: <b>top-left, top-right, bottom-right, bottom-left</b>. A door, a sheet of plywood or a window sash works well. This corrects for the camera angle, so anything on the same flat wall measures true.</p>
            <${Field} label="Known size" id="pm-pre"><select id="pm-pre" className="inp" value="" onChange=${e=>{const pr=CAL_PRESETS[+e.target.value];if(pr)save({cal:{...(cal||{}),type:'rect',pts:cal&&cal.type==='rect'?cal.pts:[],w:pr[1],h:pr[2]}});}}><option value="">Pick a common size…</option>${CAL_PRESETS.map((pr,i)=>html`<option key=${i} value=${i}>${pr[0]}</option>`)}</select><//>
            <div className="row2"><${Field} label="Width" id="pm-cw"><${LenInput} id="pm-cw" value=${cal&&cal.type==='rect'?cal.w:36} onChange=${v=>v>0&&save({cal:{...(cal||{pts:[]}),type:'rect',w:v,h:cal&&cal.type==='rect'?cal.h:80}})}/><//><${Field} label="Height" id="pm-ch"><${LenInput} id="pm-ch" value=${cal&&cal.type==='rect'?cal.h:80} onChange=${v=>v>0&&save({cal:{...(cal||{pts:[]}),type:'rect',h:v,w:cal&&cal.type==='rect'?cal.w:36}})}/><//></div>`
          :html`<p className="note">Click both ends of something whose length you know, like a tape laid on the floor or the width of a door. Works best when that surface faces the camera straight on.</p>
            <${Field} label="Known length" id="pm-cl"><${LenInput} id="pm-cl" value=${cal&&cal.type==='line'?cal.len:36} onChange=${v=>v>0&&save({cal:{...(cal||{pts:[]}),type:'line',len:v}})}/><//>`}
          <div className="stat"><span>Points</span><span className="mono">${pend.length?`${pend.length} of ${calType==='rect'?4:2} clicked`:calPts.length?'set — drag to adjust':'none yet'}</span></div>
          ${cal?html`<div className="row"><button className="btn" onClick=${()=>{save({cal:null});setPend([]);}}>Clear scale</button>${scaleFn?html`<button className="btn primary" onClick=${()=>setMode('measure')}>Next: measure</button>`:null}</div>`:null}`:null}
        ${mode==='measure'?html`<h3>Measure</h3>
          ${scaleFn?html`<p className="note">Click two points to measure between them. Measure on the same flat surface you scaled from; things closer or farther from the camera measure wrong.</p>`:html`<div className="msg err">Set the scale first, then measure.</div>`}
          ${meas.length?html`<div className="pmmeas">${meas.map((m,j)=>{const v=scaleFn?scaleFn(m.a,m.b):null;return html`<div key=${j} className="pmrow">
            <input className="inp" value=${m.name} aria-label="Measurement name" onChange=${e=>save({meas:meas.map((x,i)=>i===j?{...x,name:e.target.value}:x)})}/>
            <span className="mono pmv">${v!=null?fmtLen(Math.round(v*4)/4):'—'}</span>
            ${v!=null?html`<select className="inp" value="" aria-label="Use this measurement" onChange=${e=>{if(e.target.value)useMeas(e.target.value,v);}}><option value="">Use for…</option>${uses.map(([k,l])=>html`<option key=${k} value=${k}>${l}</option>`)}</select>`:null}
            <button className="btn danger" aria-label="Delete measurement" onClick=${()=>save({meas:meas.filter((_,i)=>i!==j)})}>✕</button></div>`;})}</div>`:null}
          <p className="note">${o?html`Selected in the plan: <b>${sel.kind==='room'?o.name:sel.kind==='opening'?(openingMarks(p)[o.id]||o.type):sel.kind==='fixture'?fxLabel(o):sel.kind}</b>. “Use for…” writes the value to it.`:'Select a wall, door, window or cabinet in the plan to send measurements to it.'}</p>`:null}
        ${mode==='color'||mode==='white'?html`<h3>Pick a color</h3>
          <p className="note">Click the wall, trim, door or siding. The app averages a small patch so texture and noise don't throw it off.</p>
          <div className="row"><button className=${'btn'+(mode==='white'?' on':'')} onClick=${()=>setMode(mode==='white'?'color':'white')}>${mode==='white'?'Now click something white or light gray…':'Correct lighting: click a white object'}</button>${cur.white?html`<button className="btn" onClick=${()=>save({white:null})}>Clear correction</button>`:null}</div>
          ${color?html`<div className="pmcolor"><span className="libswatch" style=${{background:color.hex}}></span><div><b className="mono">${color.hex.toUpperCase()}</b><div className="note">Closest library color: <b>${color.near.x.label}</b> ${color.near.x.hex}${cur.white?' · lighting corrected':''}</div></div></div>
            <div className="libacts">${libActions({id:'tmp',place:'color',hex:color.hex},libCtx).map((a,i)=>html`<button key=${i} className=${'btn'+(a.primary?' primary':'')} onClick=${()=>{a.run();setMsg({ok:true,t:'Color applied: '+a.label+'.'});}}>${a.label}</button>`)}
              <button className="btn" onClick=${()=>setColor({...color,hex:color.near.x.hex})}>Use the library color instead</button></div>`:html`<p className="note">No color picked yet.</p>`}`:null}
        ${mode==='trim'?html`<h3>Trim, doors and finishes</h3>
          ${sampleFn?html`<p className="note">Claude looks at this photo and matches what it sees to the library: baseboard, casing, crown, chair rail, wainscot, door and window types, ceiling, wall and floor finishes, siding, roofing and colors. Each analysis uses your own Claude usage.</p>
            <div className="row"><button className="btn primary" disabled=${busy} onClick=${identify}>${busy?'Looking at the photo…':ai?'Look again':'Identify trim and finishes'}</button></div>`
          :html`<div className="msg err">Automatic identification runs inside Claude only. Here you can still measure trim on a scaled photo: measure the baseboard height or casing width, then pick “Match baseboard by height” or “Match casing by width”. Or open the Library and pick a profile by eye.</div>`}
          ${ai?html`<p>${ai.summary||''}</p>${aiRows.length?html`<div className="pmmeas">${aiRows.map(r=>html`<div key=${r.k} className="pmrow ai">${r.color?html`<span className="libswatch sm" style=${{background:r.color}}></span>`:r.it?html`<${LibIcon} it=${r.it}/>`:null}
              <div className="grow"><div className="note">${r.label}</div><b>${r.val}</b></div>
              <div className="libacts">${r.it?libActions(r.it,libCtx).filter(a=>!/Place|Draw/.test(a.label)).slice(0,3).map((a,i)=>html`<button key=${i} className=${'btn'+(a.primary?' primary':'')} onClick=${()=>{a.run();setMsg({ok:true,t:r.label+': '+a.label.toLowerCase()+'.'});}}>${a.label}</button>`):null}</div></div>`)}</div>`:html`<p className="note">Nothing could be matched in this photo.</p>`}
            ${(ai.notes||[]).length?html`<ul className="note">${ai.notes.map((n,i)=>html`<li key=${i}>${n}</li>`)}</ul>`:null}
            ${ai.confidence?html`<p className="note">Confidence: trim ${ai.confidence.trim||'?'}, finishes ${ai.confidence.finishes||'?'}. Check trim sizes with a tape or by measuring on a scaled photo.</p>`:null}`:null}`:null}
        ${mode==='pan'?html`<h3>Move and zoom</h3><p className="note">Drag to move the photo, scroll to zoom.</p><div className="row"><button className="btn" onClick=${()=>setVb({x:0,y:0,w:dims.w,h:dims.h})}>Fit photo</button></div>`:null}
        ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
        <div className="row" style=${{marginTop:'8px'}}><button className="btn" onClick=${()=>setVb({x:0,y:0,w:dims.w,h:dims.h})}>Fit photo</button><button className="btn danger" onClick=${async()=>{await assetDel(cur.id);assets.reload();setCurId(null);}}>Delete photo</button></div>
      </div></div>`:null}
  </section>`;
}
