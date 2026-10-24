/* ======================= CAD file exchange: DXF blocks and inserts, DWG reading, sheet DXF export, glTF / DAE / STL models ======================= */
// ---- DXF reader with BLOCKS, INSERT (scaled, rotated, nested), bulged polylines, ellipses, splines, solids and dimension blocks ----
parseDXF=function(text){const lines=text.split(/\r?\n/);const pairs=[];for(let i=0;i+1<lines.length;i+=2)pairs.push([parseInt(lines[i].trim(),10),lines[i+1].replace(/\s+$/,'').replace(/^\s+/,'')]);
  let units=null;{const u=pairs.findIndex(([c,v])=>c===9&&v==='$INSUNITS');if(u>=0&&pairs[u+1])units=parseInt(pairs[u+1][1]);}
  const section=name=>{const s=pairs.findIndex((q,i)=>q[0]===2&&q[1]===name&&pairs[i-1]&&pairs[i-1][0]===0&&pairs[i-1][1]==='SECTION');if(s<0)return [];let e=s;while(e<pairs.length&&!(pairs[e][0]===0&&pairs[e][1]==='ENDSEC'))e++;return pairs.slice(s+1,e);};
  const group=list=>{const out=[];let cur=null;for(const [c,v] of list){if(c===0){if(cur)out.push(cur);cur={type:v,g:[]};continue;}if(cur)cur.g.push([c,v]);}if(cur)out.push(cur);return out;};
  // blocks
  const blocks={};let blk=null;for(const e of group(section('BLOCKS'))){if(e.type==='BLOCK'){const G=c=>{const x=e.g.find(q=>q[0]===c);return x?x[1]:null;};blk={name:G(2)||'',base:[parseFloat(G(10)||0),parseFloat(G(20)||0)],ents:[]};continue;}
    if(e.type==='ENDBLK'){if(blk)blocks[blk.name]=blk;blk=null;continue;}if(blk)blk.ents.push(e);}
  const prims=(e,layer0)=>{const G=c=>{const x=e.g.find(q=>q[0]===c);return x?parseFloat(x[1]):null;};const S=c=>{const x=e.g.find(q=>q[0]===c);return x?x[1]:null;};const all=c=>e.g.filter(q=>q[0]===c).map(q=>parseFloat(q[1]));
    let layer=S(8)||'0';if(layer==='0'&&layer0)layer=layer0;const out=[];
    switch(e.type){
      case 'LINE':out.push({shape:'line',pts:[[G(10),G(20)],[G(11),G(21)]],layer});break;
      case 'LWPOLYLINE':{const vs=[];let cur=null;for(const [c,v] of e.g){if(c===10){cur={x:+v,y:0,b:0};vs.push(cur);}else if(c===20&&cur)cur.y=+v;else if(c===42&&cur)cur.b=+v;}
        const closed=!!((G(70)||0)&1);out.push({shape:'pline',pts:bulgePts(vs,closed),closed,layer});break;}
      case 'CIRCLE':out.push({shape:'circle',cx:G(10),cy:G(20),r:G(40),layer});break;
      case 'ARC':{const cx=G(10),cy=G(20),r=G(40),a0=G(50)*Math.PI/180;let a1=G(51)*Math.PI/180;if(a1<a0)a1+=2*Math.PI;const am=(a0+a1)/2;out.push({shape:'arc',pts:[[cx+r*Math.cos(a0),cy+r*Math.sin(a0)],[cx+r*Math.cos(am),cy+r*Math.sin(am)],[cx+r*Math.cos(a1),cy+r*Math.sin(a1)]],layer});break;}
      case 'ELLIPSE':{const cx=G(10),cy=G(20),mx=G(11),my=G(21),ra=G(40)||1;let t0=G(41)??0,t1=G(42)??Math.PI*2;if(t1<t0)t1+=Math.PI*2;const n=Math.max(8,Math.round((t1-t0)/(Math.PI*2)*48));const L=Math.hypot(mx,my),ux=mx/L,uy=my/L;const pts=[];
        for(let i=0;i<=n;i++){const t=t0+(t1-t0)*i/n;const a=Math.cos(t)*L,b=Math.sin(t)*L*ra;pts.push([cx+a*ux-b*uy,cy+a*uy+b*ux]);}const closed=Math.abs(t1-t0-Math.PI*2)<1e-3;out.push({shape:'pline',pts:closed?pts.slice(0,-1):pts,closed,layer});break;}
      case 'SPLINE':{const fx=all(11),fy=all(21),cx=all(10),cy=all(20);const xs=fx.length>1?fx:cx,ys=fx.length>1?fy:cy;if(xs.length>1)out.push({shape:'pline',pts:xs.map((x,j)=>[x,ys[j]]),closed:!!((G(70)||0)&1),layer});break;}
      case 'SOLID':case '3DFACE':{const q=[[G(10),G(20)],[G(11),G(21)],[G(13),G(23)],[G(12),G(22)]].filter(v=>v[0]!=null);if(e.type==='3DFACE'){q.splice(2,2,[G(12),G(22)],[G(13),G(23)]);}out.push({shape:'pline',pts:q,closed:true,layer});break;}
      case 'TEXT':case 'MTEXT':case 'ATTRIB':{const t=(e.g.filter(q=>q[0]===1||q[0]===3).map(q=>q[1]).join('')).replace(/\\P/g,'\n').replace(/\{|\}|\\[A-Za-z][^;]*;/g,'');if(t)out.push({shape:'text',x:G(10),y:G(20),h:G(40)||G(41)||8,text:t,layer});break;}
      case 'INSERT':case 'DIMENSION':{const b=blocks[S(2)];if(!b)break;const ins=e.type==='DIMENSION'?[0,0]:[G(10)||0,G(20)||0];const sx=e.type==='DIMENSION'?1:(G(41)??1),sy=e.type==='DIMENSION'?1:(G(42)??sx);const rot=(e.type==='DIMENSION'?0:(G(50)||0))*Math.PI/180;
        const nc=Math.max(1,G(70)||1),nr=Math.max(1,G(71)||1),dc=G(44)||0,dr=G(45)||0;
        for(let ci=0;ci<Math.min(nc,50);ci++)for(let ri=0;ri<Math.min(nr,50);ri++){const off=[ins[0]+Math.cos(rot)*ci*dc-Math.sin(rot)*ri*dr,ins[1]+Math.sin(rot)*ci*dc+Math.cos(rot)*ri*dr];
          const X=([x,y])=>{const u=(x-b.base[0])*sx,v=(y-b.base[1])*sy;return [off[0]+u*Math.cos(rot)-v*Math.sin(rot),off[1]+u*Math.sin(rot)+v*Math.cos(rot)];};
          for(const be of b.ents){if((e._depth||0)>6)break;be._depth=(e._depth||0)+1;for(const q of prims(be,layer))out.push(xformPrim(q,X,sx,sy,rot));}}break;}}
    return out;};
  const ents=[];let pl=null;for(const e of group(section('ENTITIES'))){if(e.type==='POLYLINE'){const G=c=>{const x=e.g.find(q=>q[0]===c);return x?parseFloat(x[1]):null;};pl={shape:'pline',vs:[],closed:!!((G(70)||0)&1),layer:(e.g.find(q=>q[0]===8)||[0,'0'])[1]};continue;}
    if(e.type==='VERTEX'&&pl){const G=c=>{const x=e.g.find(q=>q[0]===c);return x?parseFloat(x[1]):null;};pl.vs.push({x:G(10),y:G(20),b:G(42)||0});continue;}
    if(e.type==='SEQEND'&&pl){if(pl.vs.length>1)ents.push({shape:'pline',pts:bulgePts(pl.vs,pl.closed),closed:pl.closed,layer:pl.layer});pl=null;continue;}
    for(const q of prims(e))if(q.pts?q.pts.every(v=>isFinite(v[0])&&isFinite(v[1])):isFinite(q.cx??q.x))ents.push(q);}
  const named=Object.values(blocks).filter(b=>!b.name.startsWith('*')&&b.ents.length).map(b=>{const list=[];for(const e of b.ents)for(const q of prims(e))list.push(q);return {name:b.name,ents:list};}).filter(b=>b.ents.length);
  return {ents,units,blocks:named};};
function bulgePts(vs,closed){const out=[];const n=vs.length;for(let i=0;i<n;i++){const a=vs[i];out.push([a.x,a.y]);if(!a.b||(!closed&&i===n-1))continue;const b=vs[(i+1)%n];const th=4*Math.atan(a.b);const L=Math.hypot(b.x-a.x,b.y-a.y);if(L<1e-9)continue;
    const d=L/(2*Math.tan(th/2));const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const nx=-(b.y-a.y)/L,ny=(b.x-a.x)/L;const cx=mx+nx*d,cy=my+ny*d;const R=Math.hypot(a.x-cx,a.y-cy);const a0=Math.atan2(a.y-cy,a.x-cx);const seg=Math.max(2,Math.round(Math.abs(th)/(Math.PI/16)));
    for(let k=1;k<seg;k++){const t=a0+th*k/seg;out.push([cx+R*Math.cos(t),cy+R*Math.sin(t)]);}}
  return out;}
function xformPrim(q,X,sx,sy,rot){if(q.shape==='circle'){if(Math.abs(Math.abs(sx)-Math.abs(sy))<1e-6){const [cx,cy]=X([q.cx,q.cy]);return {...q,cx,cy,r:q.r*Math.abs(sx)};}const pts=[];for(let i=0;i<36;i++){const t=i/36*Math.PI*2;pts.push(X([q.cx+q.r*Math.cos(t),q.cy+q.r*Math.sin(t)]));}return {shape:'pline',pts,closed:true,layer:q.layer};}
  if(q.shape==='text'){const [x,y]=X([q.x,q.y]);return {...q,x,y,h:q.h*Math.abs(sy)};}return {...q,pts:q.pts.map(X)};}
// importDXF takes text or an already-read drawing
{const _imp=importDXF;importDXF=function(p,lvId,src,unit,origin){if(typeof src==='string')return _imp(p,lvId,src,unit,origin);const keep=parseDXF;parseDXF=()=>src;try{return _imp(p,lvId,'',unit,origin);}finally{parseDXF=keep;}};}
// DXF blocks become reusable Blocks (Edit > Blocks), centered on their middle
function dxfBlocksToLibrary(parsed,unit){const k={in:1,ft:12,mm:1/25.4,cm:1/2.54,m:39.3701}[unit||({1:'in',2:'ft',4:'mm',5:'cm',6:'m'}[parsed.units]||'in')];const out=[];
  for(const b of parsed.blocks.slice(0,200)){const xs=[],ys=[];for(const e of b.ents){if(e.shape==='circle'){xs.push(e.cx-e.r,e.cx+e.r);ys.push(e.cy-e.r,e.cy+e.r);}else if(e.shape==='text'){xs.push(e.x);ys.push(e.y);}else for(const [x,y] of e.pts){xs.push(x);ys.push(y);}}
    if(!xs.length)continue;const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;const T=([x,y])=>[(x-cx)*k,-(y-cy)*k];const items=[];
    for(const e of b.ents){if(e.shape==='text')continue;if(e.shape==='circle'){const [x,y]=T([e.cx,e.cy]);items.push({kind:'cad',obj:{id:uid('cd'),shape:'circle',cx:x,cy:y,r:e.r*k,pts:[],weight:0.25,dash:'solid',status:'new'}});}
      else items.push({kind:'cad',obj:{id:uid('cd'),shape:e.shape,pts:e.pts.map(T),closed:e.closed,weight:0.25,dash:'solid',status:'new'}});}
    if(items.length)out.push({id:uid('bk'),name:'DXF: '+b.name,date:new Date().toISOString(),items,openings:[],count:items.length,w:(Math.max(...xs)-Math.min(...xs))*k,d:(Math.max(...ys)-Math.min(...ys))*k});}
  return out;}
// ---- DWG: read with LibreDWG (GPL, WebAssembly), loaded on first use, then handled as DXF ----
const DWG_CDN='https://cdn.jsdelivr.net/npm/@mlightcad/libredwg-web@0.8.2/';let _dwgLib=null;
async function loadDWGReader(){if(_dwgLib)return _dwgLib;const mod=await import(DWG_CDN+'dist/libredwg-web.js');_dwgLib=await mod.LibreDwg.create(DWG_CDN+'wasm');return _dwgLib;}
async function dwgToDXFText(buf){const lib=await loadDWGReader();const out=lib.dwg_write_dxf(buf);if(!out)throw new Error('This DWG could not be read. Save it as DXF from the program that made it, or convert it with the free ODA File Converter.');return new TextDecoder('latin1').decode(out);}

// ---- sheet to DXF: every line, shape and note on the sheet, in paper inches (scale 1:1 on the paper) ----
function sheetToDXF(s){const out=[];const Y=y=>(s.h-y).toFixed(4);const X=x=>(+x).toFixed(4);const LAY=it=>it.t==='text'?'A-ANNO-TEXT':it.fill&&it.fill!=='none'&&it.fill!=='#ffffff'?'A-PATT':it.dash?'A-ANNO-HIDN':'A-ANNO';
  for(const it of s.items){const L=LAY(it);
    if(it.t==='line')out.push(`0\nLINE\n8\n${L}\n10\n${X(it.x1)}\n20\n${Y(it.y1)}\n11\n${X(it.x2)}\n21\n${Y(it.y2)}`);
    else if(it.t==='poly'){for(const ring of [it.pts,...(it.holes||[])]){if(!ring||ring.length<2)continue;out.push(`0\nLWPOLYLINE\n8\n${it.stroke&&it.stroke!=='none'?L:'A-PATT'}\n90\n${ring.length}\n70\n${it.close===false?0:1}\n`+ring.map(q=>`10\n${X(q[0])}\n20\n${Y(q[1])}`).join('\n'));}}
    else if(it.t==='circle')out.push(`0\nCIRCLE\n8\n${L}\n10\n${X(it.cx)}\n20\n${Y(it.cy)}\n40\n${(+it.r).toFixed(4)}`);
    else if(it.t==='text'&&it.s){const h=(it.size/72*0.72).toFixed(4);const al=it.anchor==='middle'?1:it.anchor==='end'?2:0;out.push(`0\nTEXT\n8\n${L}\n10\n${X(it.x)}\n20\n${Y(it.y)}\n40\n${h}\n1\n${String(it.s).replace(/\n/g,' ')}\n50\n${(-(it.rot||0)).toFixed(2)}\n72\n${al}\n11\n${X(it.x)}\n21\n${Y(it.y)}`);}}
  const layers=[['A-ANNO',7],['A-ANNO-TEXT',7],['A-ANNO-HIDN',8],['A-PATT',9]];
  return `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n1\n9\n$EXTMIN\n10\n0\n20\n0\n9\n$EXTMAX\n10\n${s.w}\n20\n${s.h}\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n${layers.length}\n`+layers.map(([l,c])=>`0\nLAYER\n2\n${l}\n70\n0\n62\n${c}\n6\nCONTINUOUS`).join('\n')+`\n0\nENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n${out.join('\n')}\n0\nENDSEC\n0\nEOF\n`;}
async function exportSheetsDXF(p,sheets){await loadScript('https://cdn.jsdelivr.net/npm/fflate@0.7.4/umd/index.js');const files={};for(const s of sheets)files[`${s.no} ${s.title}.dxf`.replace(/[\\/:*?"<>|]/g,'-')]=fflate.strToU8(sheetToDXF(s));return saveFile(safeName(p.name)+' sheets DXF.zip',new Blob([fflate.zipSync(files)]));}

// ---- 3D models: glTF / GLB, Collada (DAE) and STL, same path as OBJ ----
const MODEL_LOADERS={glb:'GLTFLoader',gltf:'GLTFLoader',dae:'ColladaLoader',stl:'STLLoader'};
async function loadModelFile(file,unit,up){const ext=(file.name.split('.').pop()||'').toLowerCase();if(ext==='obj')return parseOBJ(await file.text(),unit,up);
  const L=MODEL_LOADERS[ext];if(!L)throw new Error('Use an OBJ, GLB, glTF, DAE or STL file.');await loadScript(`https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/${L}.js`);
  let root;if(ext==='stl'){const g=new THREE.STLLoader().parse(await file.arrayBuffer());root=new THREE.Mesh(g,new THREE.MeshStandardMaterial());}
  else if(ext==='dae'){root=new THREE.ColladaLoader().parse(await file.text(),'').scene;up='y';}
  else{if(ext==='gltf'&&/"uri"\s*:\s*"(?!data:)/.test(await file.text()))throw new Error('This glTF points to separate .bin or texture files. Export it as a single GLB file instead.');
    {const data=ext==='glb'?await file.arrayBuffer():await file.text();root=await new Promise((res,rej)=>new THREE.GLTFLoader().parse(data,'',g=>res(g.scene),e=>rej(new Error('That glTF/GLB file could not be read.'))));}up='y';}
  return objectToModel(root,unit,up);}
function objectToModel(root,unit,up){const k={in:1,ft:12,m:39.3701,cm:1/2.54,mm:1/25.4}[unit]||1;root.updateMatrixWorld(true);const out=[];const cols={};let tris=0;const v=new THREE.Vector3();
  root.traverse(o=>{if(!o.isMesh||!o.geometry)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;const pa=g.attributes.position;if(!pa)return;const mats=Array.isArray(o.material)?o.material:[o.material];
    for(const m of mats)if(m&&m.color){const h=m.color.getHex();cols[h]=(cols[h]||0)+pa.count;}
    for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld);out.push(v.x,v.y,v.z);}tris+=pa.count/3;});
  if(!out.length)throw new Error('No geometry found in that file.');
  const step=tris>200000?Math.ceil(tris/200000):1;const P=[];for(let t=0;t<out.length;t+=9*step)for(let j=0;j<3;j++){const x=out[t+j*3],y=out[t+j*3+1],z=out[t+j*3+2];P.push(up==='z'?[x*k,-y*k,z*k]:[x*k,z*k,y*k]);}
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;for(const [x,y,z] of P){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);z0=Math.min(z0,z);z1=Math.max(z1,z);}
  const cx=(x0+x1)/2,cy=(y0+y1)/2;const pos=new Float32Array(P.length*3);P.forEach((q,i)=>{pos[i*3]=q[0]-cx;pos[i*3+1]=q[1]-cy;pos[i*3+2]=q[2]-z0;});
  const best=Object.entries(cols).sort((a,b)=>b[1]-a[1])[0];return {pos,w:x1-x0,d:y1-y0,h:z1-z0,tris:P.length/3,thinned:step>1,color:best&&+best[0]!==0xffffff?'#'+(+best[0]).toString(16).padStart(6,'0'):null};}
