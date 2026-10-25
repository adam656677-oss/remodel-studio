/* ======================= IFC export (IFC2X3 Coordination View) for Revit, Archicad, BIM viewers ======================= */
// Storeys, walls (with openings cut), doors, windows, spaces with their areas, floor slabs, cabinets and fixtures as
// furnishing elements, with the remodel status and code-relevant properties. Units are meters; plan Y flips to north.
const IFC_CH='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
function ifcGuid(){const b=new Uint8Array(16);crypto.getRandomValues(b);let n=0n;for(const x of b)n=(n<<8n)|BigInt(x);let s='';for(let i=0;i<22;i++){s=IFC_CH[Number(n%64n)]+s;n/=64n;}return s;}
function ifcWriter(){const L=[];let n=0;const add=t=>{n++;L.push(`#${n}=${t};`);return '#'+n;};return {add,lines:L};}
const ifcS=s=>"'"+String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"''").replace(/[^\x20-\x7e]/g,'?')+"'";
const ifcR=v=>{const x=Math.round(v*1e6)/1e6;return Number.isInteger(x)?x.toFixed(1):String(x);};
const toM=v=>v*0.0254;
function buildIFC(p,o={}){const W=ifcWriter();const A=W.add;const now=Math.floor(Date.now()/1000);
  const person=A(`IFCPERSON($,${ifcS(p.info&&p.info.designer||'')},$,$,$,$,$,$)`),org=A(`IFCORGANIZATION($,'Remodel Studio',$,$,$)`),po=A(`IFCPERSONANDORGANIZATION(${person},${org},$)`);
  const app=A(`IFCAPPLICATION(${org},'2.1','Remodel Studio','RemodelStudio')`);const oh=A(`IFCOWNERHISTORY(${po},${app},$,.ADDED.,$,$,$,${now})`);
  const P3=(x,y,z)=>A(`IFCCARTESIANPOINT((${ifcR(x)},${ifcR(y)},${ifcR(z)}))`),P2=(x,y)=>A(`IFCCARTESIANPOINT((${ifcR(x)},${ifcR(y)}))`),D3=(x,y,z)=>A(`IFCDIRECTION((${ifcR(x)},${ifcR(y)},${ifcR(z)}))`),D2=(x,y)=>A(`IFCDIRECTION((${ifcR(x)},${ifcR(y)}))`);
  const O=P3(0,0,0),Z=D3(0,0,1),X=D3(1,0,0);const ax0=A(`IFCAXIS2PLACEMENT3D(${O},${Z},${X})`);
  const ctx=A(`IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,${ax0},$)`);
  const uL=A(`IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)`),uA=A(`IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)`),uV=A(`IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)`),uR=A(`IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.)`);
  const units=A(`IFCUNITASSIGNMENT((${uL},${uA},${uV},${uR}))`);
  const proj=A(`IFCPROJECT('${ifcGuid()}',${oh},${ifcS(p.name)},${ifcS('Exported from Remodel Studio')},$,$,$,(${ctx}),${units})`);
  const place=(rel,x,y,z,dx=1,dy=0)=>{const a=A(`IFCAXIS2PLACEMENT3D(${P3(x,y,z)},${Z},${D3(dx,dy,0)})`);return A(`IFCLOCALPLACEMENT(${rel||'$'},${a})`);};
  const sitePl=place(null,0,0,0);const site=A(`IFCSITE('${ifcGuid()}',${oh},'Site',$,$,${sitePl},$,$,.ELEMENT.,$,$,$,$,$)`);
  const bldPl=place(sitePl,0,0,0);const bld=A(`IFCBUILDING('${ifcGuid()}',${oh},${ifcS(p.name)},$,$,${bldPl},$,$,.ELEMENT.,$,$,$)`);
  A(`IFCRELAGGREGATES('${ifcGuid()}',${oh},$,$,${proj},(${site}))`);A(`IFCRELAGGREGATES('${ifcGuid()}',${oh},$,$,${site},(${bld}))`);
  const extrude=(profile,depth,pos)=>A(`IFCEXTRUDEDAREASOLID(${profile},${pos||ax0},${Z},${ifcR(depth)})`);
  const body=(solid,type='SweptSolid')=>{const r=A(`IFCSHAPEREPRESENTATION(${ctx},'Body','${type}',(${solid}))`);return A(`IFCPRODUCTDEFINITIONSHAPE($,$,(${r}))`);};
  const rectProf=(w,h,cx=0,cy=0)=>{const a=A(`IFCAXIS2PLACEMENT2D(${P2(cx,cy)},${D2(1,0)})`);return A(`IFCRECTANGLEPROFILEDEF(.AREA.,$,${a},${ifcR(w)},${ifcR(h)})`);};
  const polyProf=pts=>{const ps=pts.map(([x,y])=>P2(x,y));ps.push(ps[0]);const pl=A(`IFCPOLYLINE((${ps.join(',')}))`);return A(`IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,$,${pl})`);};
  const pset=(obj,name,props)=>{const ps=Object.entries(props).filter(([k,v])=>v!=null).map(([k,v])=>A(`IFCPROPERTYSINGLEVALUE(${ifcS(k)},$,${typeof v==='boolean'?`IFCBOOLEAN(.${v?'T':'F'}.)`:typeof v==='number'?`IFCREAL(${ifcR(v)})`:`IFCLABEL(${ifcS(v)})`},$)`));if(!ps.length)return;
    const s=A(`IFCPROPERTYSET('${ifcGuid()}',${oh},${ifcS(name)},$,(${ps.join(',')}))`);A(`IFCRELDEFINESBYPROPERTIES('${ifcGuid()}',${oh},$,$,(${obj}),${s})`);};
  const statusOf=x=>x.status==='existing'?'Existing':x.status==='demolish'?'Demolish':'New';const keep=x=>o.demolished||x.status!=='demolish';
  const storeys=[];const counts={walls:0,doors:0,windows:0,spaces:0,slabs:0,items:0};
  for(const lv of sortedLevels(p)){const z=toM(lv.elevation);const stPl=place(bldPl,0,0,z);const st=A(`IFCBUILDINGSTOREY('${ifcGuid()}',${oh},${ifcS(lv.name)},$,$,${stPl},$,$,.ELEMENT.,${ifcR(z)})`);storeys.push(st);const inStorey=[],spaces=[];
    for(const w of p.walls.filter(w=>w.level===lv.id&&keep(w))){const Lw=wlen(w);if(Lw<1)continue;const d=wdir(w);const H=wallH(p,w);const ux=d.x,uy=-d.y;
      const pl=place(stPl,toM(w.x1),toM(-w.y1),0,ux,uy);const solid=extrude(rectProf(toM(Lw),toM(w.thick),toM(Lw/2),0),toM(H));
      const wall=A(`IFCWALL('${ifcGuid()}',${oh},${ifcS((w.kind==='exterior'?'Exterior':'Interior')+' wall')},$,${ifcS(w.assembly||w.kind)},${pl},${body(solid)},$)`);inStorey.push(wall);counts.walls++;
      pset(wall,'Pset_WallCommon',{IsExternal:w.kind==='exterior',LoadBearing:!!(w.bearing||w.kind==='exterior'),Reference:WALL_PRESETS[w.assembly]?WALL_PRESETS[w.assembly].label:null});pset(wall,'RemodelStudio',{Status:statusOf(w),Thickness_in:w.thick});
      for(const op of p.openings.filter(x=>x.wall===w.id&&keep(x))){const sill=op.type==='door'?0:(op.sill||0);const s0=op.pos-op.width/2;
        const opPl=place(pl,toM(s0),toM(-w.thick/2-1),toM(sill));const oSolid=extrude(rectProf(toM(op.width),toM(w.thick+2),toM(op.width/2),toM(w.thick/2+1)),toM(op.height));
        const opening=A(`IFCOPENINGELEMENT('${ifcGuid()}',${oh},'Opening',$,$,${opPl},${body(oSolid)},$)`);A(`IFCRELVOIDSELEMENT('${ifcGuid()}',${oh},$,$,${wall},${opening})`);
        const fPl=place(opPl,0,toM(w.thick/2+1-1),0);const fSolid=extrude(rectProf(toM(op.width),toM(2),toM(op.width/2),0),toM(op.height));const mark=(openingMarks(p)||{})[op.id]||'';
        const el=op.type==='door'?A(`IFCDOOR('${ifcGuid()}',${oh},${ifcS(mark||'Door')},$,${ifcS((DOOR_TYPES[op.dtype||'swing']||'Swing')+' '+(DOOR_STYLES[op.style||'panel6']||''))},${fPl},${body(fSolid)},${ifcS(mark)},${ifcR(toM(op.height))},${ifcR(toM(op.width))})`)
          :A(`IFCWINDOW('${ifcGuid()}',${oh},${ifcS(mark||'Window')},$,${ifcS((WINDOW_OPS.find(x=>x[0]===(op.operation||'double-hung'))||['',''])[1])},${fPl},${body(fSolid)},${ifcS(mark)},${ifcR(toM(op.height))},${ifcR(toM(op.width))})`);
        A(`IFCRELFILLSELEMENT('${ifcGuid()}',${oh},$,$,${opening},${el})`);inStorey.push(el);counts[op.type==='door'?'doors':'windows']++;pset(el,'RemodelStudio',{Status:statusOf(op),Width_in:op.width,Height_in:op.height,Sill_in:op.type==='window'?op.sill:null});}}
    for(const r of p.rooms.filter(r=>r.level===lv.id)){const pts=r.pts.map(q=>[toM(q[0]),toM(-q[1])]);const a2=pts.reduce((s,q,i)=>{const b=pts[(i+1)%pts.length];return s+q[0]*b[1]-b[0]*q[1];},0);const ccw=a2>0?pts:[...pts].reverse();
      const H=r.ceilingH||lv.height;const sp=A(`IFCSPACE('${ifcGuid()}',${oh},${ifcS(r.name)},$,${ifcS(r.use||'')},${place(stPl,0,0,0)},${body(extrude(polyProf(ccw),toM(H)))},${ifcS(r.name)},.ELEMENT.,.INTERNAL.,$)`);spaces.push(sp);counts.spaces++;
      pset(sp,'Pset_SpaceCommon',{Reference:r.use||null,GrossPlannedArea:Math.round(polyArea(r.pts)/144*0.092903*100)/100,FloorCovering:(FLOOR_FINISH[roomFloor(r)]||{}).label||null,CeilingCovering:(CEILINGS[r.ceiling||'flat']||[''])[0]});
      const slab=A(`IFCSLAB('${ifcGuid()}',${oh},${ifcS(r.name+' floor')},$,$,${place(stPl,0,0,toM(-1))},${body(extrude(polyProf(ccw),toM(1)))},$,.FLOOR.)`);inStorey.push(slab);counts.slabs++;}
    if(o.items!==false)for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id&&keep(f))){const fr=fxFront(f);const ang=(f.rot||0)*Math.PI/180;const ux=Math.cos(ang),uy=-Math.sin(ang);const c=fxCorners(f)[0];
      const pl=place(stPl,toM(c.x),toM(-c.y),toM(f.elev||0),ux,uy);const solid=extrude(rectProf(toM(f.w),toM(f.d),toM(f.w/2),toM(-f.d/2)),toM(f.h));const it=f.lib&&LIB_BY_ID[f.lib];const m=it&&it.appl;
      const name=m?`${m.brand} ${m.model}`:isCab(f)?(()=>{try{return cabCode(p,f);}catch(e){return fxLabel(f);}})():fxLabel(f);
      const el=A(`IFCFURNISHINGELEMENT('${ifcGuid()}',${oh},${ifcS(name)},${ifcS(fxLabel(f))},${ifcS((it&&it.cat)||(FIXTURES[f.type]||{}).cat||'')},${pl},${body(solid)},$)`);inStorey.push(el);counts.items++;
      pset(el,'RemodelStudio',{Status:statusOf(f),Width_in:f.w,Depth_in:f.d,Height_in:f.h,Vendor:m?m.brand:(it&&it.vendor)||null,Model:m?m.model:(it&&(it.sku||it.code))||null});}
    if(inStorey.length)A(`IFCRELCONTAINEDINSPATIALSTRUCTURE('${ifcGuid()}',${oh},$,$,(${inStorey.join(',')}),${st})`);
    if(spaces.length)A(`IFCRELAGGREGATES('${ifcGuid()}',${oh},$,$,${st},(${spaces.join(',')}))`);}
  if(storeys.length)A(`IFCRELAGGREGATES('${ifcGuid()}',${oh},$,$,${bld},(${storeys.join(',')}))`);
  const ts=new Date().toISOString().slice(0,19);const fn=safeName(p.name)+'.ifc';
  const text=`ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('ViewDefinition [CoordinationView_V2.0]'),'2;1');\nFILE_NAME(${ifcS(fn)},'${ts}',(${ifcS(p.info&&p.info.designer||'')}),('Remodel Studio'),'Remodel Studio 2.1','Remodel Studio','');\nFILE_SCHEMA(('IFC2X3'));\nENDSEC;\nDATA;\n${W.lines.join('\n')}\nENDSEC;\nEND-ISO-10303-21;\n`;
  return {text,counts,fn};}
function IFCModal({p,onClose}){const [o,setO]=useState({items:true,demolished:false});const [msg,setMsg]=useState(null);
  const go=async()=>{try{const r=buildIFC(p,o);const res=await saveFile(r.fn,r.text);setMsg(`${res.t} ${r.counts.walls} walls, ${r.counts.doors} doors, ${r.counts.windows} windows, ${r.counts.spaces} spaces, ${r.counts.items} cabinets and fixtures.`);}catch(e){console.error(e);setMsg('Could not write the IFC file: '+(e.message||e));}};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-label="Export IFC"><h2>Export IFC</h2>
    <p className="note">IFC is the open file format Revit, Archicad and most BIM viewers read. The file has every level, wall (with door and window openings cut), room as a space with its area, floor, cabinet and fixture, with the remodel status on each part.</p>
    <label className="chk"><input type="checkbox" checked=${o.items} onChange=${e=>setO({...o,items:e.target.checked})}/> Cabinets, appliances, fixtures and furniture</label>
    <label className="chk"><input type="checkbox" checked=${o.demolished} onChange=${e=>setO({...o,demolished:e.target.checked})}/> Include parts marked for removal</label>
    <p className="note">In Revit: Insert › Link IFC (or File › Open › IFC). In Archicad: File › Open, or Interoperability › IFC › Merge.</p>
    ${msg?html`<p className="note">${msg}</p>`:null}<div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Close</button><button className="btn primary" onClick=${go}>Save the .ifc file</button></div></div></div>`;}
EXTRA_DIALOGS.ifc=IFCModal;
