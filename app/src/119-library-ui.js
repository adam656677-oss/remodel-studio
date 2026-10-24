/* ======================= construction library: hookup and panel ======================= */
// Add the library's finishes to the tables the rest of the app reads.
for(const [k,[label,dl,color]] of Object.entries(FLOOR_LIB)){FLOOR_FINISH[k]={label,dl};FLOOR_COLOR[k]=color;}
for(const [k,[label,dl,color]] of Object.entries(ROOF_LIB)){ROOF_COVER[k]={label,dl};ROOF_COLOR[k]=color;}
for(const [k,[label,color]] of Object.entries(SIDING_LIB)){SIDING[k]={label};SIDING_COLOR[k]=color;}
for(const x of LIB.filter(x=>x.place==='wall'))WALL_PRESETS[x.key]={label:x.label,thick:x.thick,kind:x.kind,bearing:x.bearing,mat:x.mat};
for(const op of [['single-hung','Single-hung'],['hopper','Hopper']])if(!WINDOW_OPS.find(o=>o[0]===op[0]))WINDOW_OPS.splice(1,0,op);

const DEFAULT_TRIM={base:'t-base-1',casing:'t-casing-11',crown:'t-crown-none',chair:'t-chair-none',shoe:'t-shoe-27',wainscot:'t-wainscot-none',stool:'t-stool-33'};
const TRIM_SLOTS=[['base','Baseboard'],['casing','Door and window casing'],['crown','Crown'],['chair','Chair or picture rail'],['shoe','Base shoe'],['wainscot','Wainscot'],['stool','Window stool']];
function trimOf(p,room){return {...DEFAULT_TRIM,...(p.settings?.trim||{}),...((room&&room.trim)||{})};}
const hexNum=h=>typeof h==='number'?h:parseInt(String(h||'').replace('#',''),16);
const fxDef=type=>{const it=LIB_BY_ID[type];if(it&&it.place==='fixture'){const b=FIXTURES[it.base]||{};return {...b,label:it.label,cat:it.cat==='Furniture'?'Furniture':b.cat,w:it.w,d:it.d,h:it.h,elev:it.elev??b.elev,free:it.free||b.cat==='Furniture'||it.base==='island'};}
  const t=FIXTURES[type]||FIXTURES.base;return {...t,free:t.cat==='Furniture'||type==='island'};};
const fxLabel=f=>f.name||(FIXTURES[f.type]||{}).label||f.type;
const _newFixture=newFixture;
newFixture=function(type,level,x,y,rot=0){const it=LIB_BY_ID[type];if(!it||it.place!=='fixture')return _newFixture(type,level,x,y,rot);
  return {id:uid('fx'),level,type:it.base,lib:it.id,name:it.label,x,y,w:it.w,d:it.d,h:it.h,elev:it.elev??(FIXTURES[it.base]?.elev||0),rot,status:'new'};};
const doorTypeLabel=o=>DOOR_TYPES[o.dtype||'swing'];
function openingFromLib(it){return it.place==='door'?{type:'door',width:it.width,height:it.height,sill:0,dtype:it.dtype,style:it.style,lib:it.id,name:it.label,hinge:0,swing:1}
  :{type:'window',width:it.width,height:it.height,sill:it.sill,operation:it.operation,lib:it.id,name:it.label};}

/* ---- what a library item can do right now ---- */
function libActions(it,ctx){
  const {p,sel,commit,setTool,setFixtureType,setWallPreset,setOpenPreset,setMode}=ctx;const o=findObj(p,sel);const A=[];
  const room=o&&sel.kind==='room'?o:null, wall=o&&sel.kind==='wall'?o:null, op=o&&sel.kind==='opening'?o:null, fx=o&&sel.kind==='fixture'?o:null, roof=o&&sel.kind==='roof'?o:null;
  const allRooms=patch=>commit({...p,rooms:p.rooms.map(r=>({...r,...patch(r)}))});
  switch(it.place){
    case 'fixture':A.push({label:'Place',primary:true,run:()=>{setFixtureType(it.id);setTool('fixture');setMode&&setMode(m=>m==='3d'?'split':m);}});A.push({label:it.cat==='My items'?'Edit…':'Customize…',run:()=>window.dispatchEvent(new CustomEvent('rs-customize',{detail:it.id}))});
      if(fx)A.push({label:'Swap selected',run:()=>commit(updObj(p,'fixture',fx.id,{type:it.base,lib:it.id,name:it.label,w:it.w,d:it.d,h:it.h,elev:it.elev??(FIXTURES[it.base]?.elev||0)}))});break;
    case 'door':case 'window':A.push({label:'Place on a wall',primary:true,run:()=>{setOpenPreset(s=>({...s,[it.place]:it.id}));setTool(it.place);}});A.push({label:it.cat==='My items'?'Edit…':'Customize…',run:()=>window.dispatchEvent(new CustomEvent('rs-customize',{detail:it.id}))});
      if(op)A.push({label:'Apply to selected',run:()=>{const w=p.walls.find(w=>w.id===op.wall);const L=w?wlen(w):999;const patch=openingFromLib(it);if(patch.width>L-1){ctx.say&&ctx.say('That is wider than the wall.',false);return;}
        commit(updObj(p,'opening',op.id,{...patch,pos:Math.max(patch.width/2,Math.min(L-patch.width/2,op.pos))}));}});break;
    case 'wall':A.push({label:'Draw with this',primary:true,run:()=>{setWallPreset(it.key);setTool('wall');}});
      if(wall)A.push({label:'Apply to selected',run:()=>commit(updObj(p,'wall',wall.id,{thick:it.thick,kind:it.kind,bearing:it.bearing,mat:it.mat,assembly:it.key,height:it.half?42:wall.height}))});break;
    case 'trim':A.push({label:'Whole house',primary:true,run:()=>commit({...p,settings:{...p.settings,trim:{...(p.settings.trim||{}),[it.slot]:it.id}}})});
      if(room)A.push({label:'This room only',run:()=>commit(updObj(p,'room',room.id,{trim:{...(room.trim||{}),[it.slot]:it.id}}))});break;
    case 'ceiling':case 'wallfin':case 'floor':{const key=it.place==='ceiling'?'ceiling':it.place==='wallfin'?'wallFinish':'finish';
      if(room)A.push({label:'Selected room',primary:true,run:()=>commit(updObj(p,'room',room.id,{[key]:it.key}))});
      A.push({label:'All rooms',primary:!room,run:()=>allRooms(()=>({[key]:it.key}))});break;}
    case 'roof':if(roof)A.push({label:'Selected roof',primary:true,run:()=>commit(updObj(p,'roof',roof.id,{framing:{...rafterOf(roof),cover:it.key}}))});
      A.push({label:'All roofs',primary:!roof,run:()=>commit({...p,roofs:p.roofs.map(r=>({...r,framing:{...rafterOf(r),cover:it.key}}))})});break;
    case 'siding':if(wall&&wall.kind==='exterior')A.push({label:'Selected wall',primary:true,run:()=>commit(updObj(p,'wall',wall.id,{siding:it.key}))});
      A.push({label:'All exterior walls',primary:!(wall&&wall.kind==='exterior'),run:()=>commit({...p,walls:p.walls.map(w=>w.kind==='exterior'?{...w,siding:it.key}:w)})});break;
    case 'color':{const c=it.hex;
      if(room){A.push({label:'Room walls',primary:true,run:()=>commit(updObj(p,'room',room.id,{wallColor:c}))});A.push({label:'Room ceiling',run:()=>commit(updObj(p,'room',room.id,{ceilingColor:c}))});A.push({label:'Room floor',run:()=>commit(updObj(p,'room',room.id,{floorColor:c}))});}
      if(wall)A.push({label:wall.kind==='exterior'?'Wall outside':'Wall',primary:!room,run:()=>commit(updObj(p,'wall',wall.id,{color:c}))});
      if(op)A.push({label:op.type==='door'?'Door':'Window frame',primary:true,run:()=>commit(updObj(p,'opening',op.id,{color:c}))});
      if(fx)A.push({label:'Selected item',primary:true,run:()=>commit(updObj(p,'fixture',fx.id,{color:c}))});
      if(roof)A.push({label:'Roof',primary:true,run:()=>commit(updObj(p,'roof',roof.id,{color:c}))});
      A.push({label:'All interior walls',run:()=>allRooms(()=>({wallColor:c}))});A.push({label:'All trim',run:()=>commit({...p,settings:{...p.settings,trimColor:c}})});
      A.push({label:'House siding',run:()=>commit({...p,walls:p.walls.map(w=>w.kind==='exterior'?{...w,color:c}:w)})});
      A.push({label:'All cabinets',run:()=>commit({...p,fixtures:(p.fixtures||[]).map(f=>/base|sinkbase|wallcab|tall|island|vanity/.test(f.type)?{...f,color:c}:f)})});
      A.push({label:'All doors',run:()=>commit({...p,openings:p.openings.map(o=>o.type==='door'?{...o,color:c}:o)})});break;}
  }
  return A;
}
function libDims(it){
  if(it.place==='fixture')return `${fi(it.w)}" W x ${fi(it.d)}" D x ${fi(it.h)}" H`+(it.elev?` · ${it.elev}" up`:'');
  if(it.place==='door')return `${DOOR_TYPES[it.dtype]} · ${DOOR_STYLES[it.style]}`;
  if(it.place==='window')return `${WIN_NAMES[it.operation]||it.operation} · sill ${it.sill}"`+(it.place==='window'&&it.operation!=='fixed'?` · ${windowNet(it).area.toFixed(1)} sq ft open`:'');
  if(it.place==='wall')return `${fmtLen(it.thick)} thick · ${it.bearing?'can carry load':'partition'}`;
  if(it.place==='trim')return it.profile==='none'?'':it.slot==='wainscot'?`${it.h}" high`:`${fi(it.h)}" face`;
  if(it.place==='color')return it.hex.toUpperCase();
  return '';
}
const PIC_PLACES=new Set(['door','window','fixture','floor','wallfin','ceiling','roof','siding']);
function LibIcon({it,p}){
  if(PIC_PLACES.has(it.place))return html`<${ItemPic} kind="lib" obj=${it} p=${p||(window.__app&&window.__app.get())} w=${128} h=${96} className="libpic" alt=""/>`;
  const box=(c)=>html`<svg viewBox="0 0 40 40" className="libicon" aria-hidden="true">${c}</svg>`;
  if(it.place==='color')return html`<span className="libswatch" style=${{background:it.hex}} aria-hidden="true"></span>`;
  if(it.place==='trim'){const h=Math.min(34,Math.max(4,it.slot==='wainscot'?30:it.h*5));const t=Math.max(3,it.t*14);const y0=37-h;
    const prof={colonial:`M4 37 L4 ${y0} Q${4+t} ${y0} ${4+t} ${y0+h*0.25} Q${4+t*0.5} ${y0+h*0.35} ${4+t*0.7} ${y0+h*0.5} L${4+t*0.7} 37 Z`,ranch:`M4 37 L4 ${y0} Q${4+t*1.1} ${y0+h*0.3} ${4+t*0.8} 37 Z`,
      ogee:`M4 3 L4 ${3+h} Q${4+h*0.4} ${3+h*0.9} ${4+h*0.5} ${3+h*0.5} Q${4+h*0.6} ${3+h*0.1} ${4+h} 3 Z`,cove:`M4 3 L4 ${3+h} Q${4+h*0.9} ${3+h*0.9} ${4+h} 3 Z`};
    const d=it.slot==='crown'?(it.profile==='cove'?prof.cove:prof.ogee):it.profile==='colonial'||it.profile==='fluted'?prof.colonial:it.profile==='ranch'?prof.ranch:it.profile==='none'?'':`M4 37 L4 ${y0} L${4+t} ${y0} L${4+t} 37 Z`;
    return box(html`<line x1="4" y1="2" x2="4" y2="38" className="li-wall"/><line x1="2" y1="37" x2="38" y2="37" className="li-wall"/>${d?html`<path d=${d} className="li-fill"/>`:null}`);}
  if(it.place==='door'){const t=it.dtype;return box(html`<line x1="2" y1="34" x2="38" y2="34" className="li-wall"/>${t==='slider'||t==='pocket'||t==='barn'?html`<line x1="6" y1="30" x2="24" y2="30" className="li-line"/><line x1="16" y1="26" x2="34" y2="26" className="li-line"/>`
    :t==='bifold'?html`<polyline points="6,34 12,24 18,34 24,24 30,34" className="li-line"/>`:t==='overhead'?html`<line x1="6" y1="20" x2="34" y2="20" className="li-line" strokeDasharray="3 2"/>`
    :t==='double'?html`<line x1="6" y1="34" x2="6" y2="17" className="li-line"/><path d="M6 17 A17 17 0 0 1 20 34" className="li-arc"/><line x1="34" y1="34" x2="34" y2="17" className="li-line"/><path d="M34 17 A17 17 0 0 0 20 34" className="li-arc"/>`
    :html`<line x1="8" y1="34" x2="8" y2="8" className="li-line"/><path d="M8 8 A26 26 0 0 1 34 34" className="li-arc"/>`}`);}
  if(it.place==='window'){const k=Math.min(30/it.width,30/it.height);const w=it.width*k,h=it.height*k;const x=20-w/2,y=20-h/2;
    return box(html`<rect x=${x} y=${y} width=${w} height=${h} className="li-fill"/>${it.operation==='double-hung'||it.operation==='single-hung'?html`<line x1=${x} y1=${20} x2=${x+w} y2=${20} className="li-line"/>`:it.operation==='slider'?html`<line x1=20 y1=${y} x2=20 y2=${y+h} className="li-line"/>`:it.operation==='casement'?html`<polyline points=${`${x+w},${y} ${x},${20} ${x+w},${y+h}`} className="li-arc"/>`:it.operation==='awning'||it.operation==='hopper'?html`<polyline points=${`${x},${y+h} 20,${y} ${x+w},${y+h}`} className="li-arc"/>`:null}`);}
  if(it.place==='fixture'){const k=Math.min(32/it.w,32/it.d);const w=it.w*k,d=it.d*k;return box(html`<rect x=${20-w/2} y=${20-d/2} width=${w} height=${d} rx="1.5" className=${it.base==='wallcab'?'li-dash':'li-fill'}/>`);}
  if(it.place==='wall')return html`<${WallSectionPic} it=${it}/>`;
  const col=it.place==='floor'?FLOOR_COLOR[it.key]:it.place==='roof'?ROOF_COLOR[it.key]:it.place==='siding'?SIDING_COLOR[it.key]:it.place==='ceiling'?(CEILINGS[it.key]||[])[1]:0xe9e6df;
  return html`<span className="libswatch" style=${{background:'#'+((col??0xdddddd).toString(16).padStart(6,'0'))}} aria-hidden="true"></span>`;
}
function LibraryPanel({ctx,onClose,collapsed,setCollapsed}){
  const [q,setQ]=useState('');const [cat,setCat]=useState(()=>{try{return localStorage.getItem('remodel-studio:libcat')||'Doors';}catch(e){return 'Doors';}});
  const pick=c=>{setCat(c);try{localStorage.setItem('remodel-studio:libcat',c);}catch(e){}};
  const words=q.toLowerCase().split(/\s+/).filter(Boolean);
  const items=LIB.filter(x=>!x.hidden&&(words.length?true:x.cat===cat)&&words.every(w=>(x.label+' '+x.sub+' '+x.cat).toLowerCase().includes(w)));
  if(words.length){const ql=q.toLowerCase().trim();const score=x=>{const l=x.label.toLowerCase();return (l.includes(ql)?0:1)*10+(l.startsWith(words[0])?0:1)+(l.length/200);};items.sort((a,b)=>score(a)-score(b));}
  const shown=items.slice(0,150);const groups=[];for(const x of shown){let g=groups.find(g=>g.k===x.cat+' / '+x.sub);if(!g)groups.push(g={k:x.cat+' / '+x.sub,sub:words.length?x.cat+': '+x.sub:x.sub,items:[]});g.items.push(x);}
  const o=findObj(ctx.p,ctx.sel);const selName=o?(ctx.sel.kind==='room'?o.name:ctx.sel.kind==='fixture'?fxLabel(o):ctx.sel.kind==='opening'?(openingMarks(ctx.p)[o.id]||o.type):ctx.sel.kind):null;
  return html`<aside className=${'insp'+(collapsed?' collapsed':'')}>
    <div className="insp-h"><div style=${{minWidth:0,flex:1}}><div className="kind">${LIB.length} items</div><h2>Library</h2></div>
      <button className="btn" onClick=${onClose} aria-label="Close library">✕</button>
      <button className="btn mobile-only" onClick=${()=>setCollapsed(!collapsed)} aria-label=${collapsed?'Show panel':'Hide panel'}>${collapsed?'▴':'▾'}</button></div>
    <div className="sec libtop">
      <input id="lib-q" className="inp" type="search" placeholder="Search: 36 door, vanity, crown, sage…" value=${q} onChange=${e=>setQ(e.target.value)} aria-label="Search the library"/>
      ${words.length?null:html`<div className="libcats">${LIB_CATS.map(c=>html`<button key=${c} className=${'chip'+(c===cat?' on':'')} onClick=${()=>pick(c)}>${c}</button>`)}</div>`}
      <p className="note">${selName?html`Selected: <b>${selName}</b>. Buttons apply to it where they fit.`:'Select a room, wall, door, window, cabinet or roof in the plan to apply finishes and colors to it.'}</p>
    </div>
    ${!words.length&&cat==='Cabinets'?html`<${PriceBookPanel} onChange=${()=>setQ(q=>q+' ').valueOf()||setTimeout(()=>setQ(q=>q.trim()),0)}/>`:null}
    <div className="liblist">${groups.map(g=>html`<div key=${g.k} className="libgrp"><h4>${g.sub}</h4>${g.items.map(it=>{const acts=libActions(it,ctx);return html`<div key=${it.id} className="libitem">
        <${LibIcon} it=${it} p=${ctx.p}/><div className="libtxt"><div className="libname">${it.label}${it.ada?html` <span className="pill ok">ADA</span>`:null}</div><div className="note">${libDims(it)}</div>
        <div className="libacts">${acts.map((a,i)=>html`<button key=${i} className=${'btn'+(a.primary?' primary':'')} onClick=${a.run}>${a.label}</button>`)}</div></div></div>`;})}</div>`)}
      ${items.length>shown.length?html`<p className="note" style=${{padding:'0 16px 16px'}}>Showing ${shown.length} of ${items.length}. Type more words to narrow it down.</p>`:null}
      ${!items.length?html`<p className="note" style=${{padding:'16px'}}>Nothing matches. Try fewer words.</p>`:null}</div>
  </aside>`;
}
/* ---- finish and color pickers used in the item panels ---- */
function ColorPick({id,label,value,onChange,fallback='#ffffff'}){
  const list=LIB.filter(x=>x.place==='color');
  return html`<${Field} label=${label} id=${id}><div className="colorpick"><input type="color" id=${id} value=${value||fallback} onChange=${e=>onChange(e.target.value)} aria-label=${label}/>
    <select className="inp" value=${list.find(x=>x.hex===value)?.id||''} onChange=${e=>{const x=LIB_BY_ID[e.target.value];onChange(x?x.hex:null);}} aria-label=${label+' by name'}>
      <option value="">${value?'Custom '+value:'Default'}</option>${Object.keys(COLOR_LIB).map(f=>html`<optgroup key=${f} label=${f}>${list.filter(x=>x.sub===f).map(x=>html`<option key=${x.id} value=${x.id}>${x.label}</option>`)}</optgroup>`)}</select>
    ${value?html`<button className="btn" onClick=${()=>onChange(null)} aria-label=${'Reset '+label}>↺</button>`:null}</div><//>`;
}
function RoomFinishes({p,o,up,commit}){
  const t=trimOf(p,o);const opts=slot=>LIB.filter(x=>x.place==='trim'&&x.slot===slot).map(x=>[x.id,x.label]);
  return html`<div className="sec"><h3>Finishes and colors</h3>
    <${Field} label="Ceiling" id="r-ceil"><${Sel} id="r-ceil" value=${o.ceiling||'flat'} onChange=${v=>up({ceiling:v})} options=${Object.entries(CEILINGS).map(([k,v])=>[k,v[0]])}/><//>
    ${(o.ceiling||'flat')!=='vaulted'?html`<${Field} label="Ceiling height" id="r-ch"><${LenInput} id="r-ch" value=${o.ceilingH} placeholder="Same as the level" onChange=${v=>up({ceilingH:v||null})}/><//>`:html`<${Field} label="Flat at (collar ties)" id="r-chv"><${LenInput} id="r-chv" value=${o.ceilingH} placeholder="Follows the roof to the peak" onChange=${v=>up({ceilingH:v||null})}/><//><p className="note">A vaulted ceiling follows the underside of the roof above this room.</p>`}
    <${Field} label="Walls" id="r-wf"><${Sel} id="r-wf" value=${o.wallFinish||'paint'} onChange=${v=>up({wallFinish:v})} options=${Object.entries(WALL_FIN).map(([k,v])=>[k,v[0]])}/><//>
    <${ColorPick} id="r-wc" label="Wall color" value=${o.wallColor} onChange=${v=>up({wallColor:v})}/>
    <${TilePanel} p=${p} r=${o} up=${up}/>
    <${ColorPick} id="r-cc" label="Ceiling color" value=${o.ceilingColor} onChange=${v=>up({ceilingColor:v})}/>
    <${ColorPick} id="r-fc" label="Floor color" value=${o.floorColor} fallback=${'#'+(FLOOR_COLOR[o.finish||'lvp']||0xb89a74).toString(16).padStart(6,'0')} onChange=${v=>up({floorColor:v})}/>
    <details className="frm"><summary>Trim in this room</summary><div className="grid1">
      ${TRIM_SLOTS.map(([slot,lab])=>html`<${Field} key=${slot} label=${lab} id=${'r-tr-'+slot}><${Sel} id=${'r-tr-'+slot} value=${t[slot]} onChange=${v=>up({trim:{...(o.trim||{}),[slot]:v}})} options=${opts(slot)}/><//>`)}
      ${o.trim?html`<button className="btn" onClick=${()=>up({trim:null})}>Use the whole-house trim</button>`:null}</div></details></div>`;
}
/* ---- door symbols on plan, by door type. Points are [distance along wall, offset from wall centerline]. ---- */
function doorGeom(o,t,s0,s1){
  const W=s1-s0,side=o.swing||1,out=[];const arc=(hs,dir,r,sd)=>{const pts=[];for(let k=0;k<=14;k++){const a=k/14*Math.PI/2;pts.push([hs+dir*r*Math.sin(a),sd*(t+r*Math.cos(a))]);}return pts;};
  switch(o.dtype||'swing'){
    case 'double':{const h=W/2;out.push({pts:[[s0,side*t],[s0,side*(t+h)]]},{pts:arc(s0,1,h,side),dash:true},{pts:[[s1,side*t],[s1,side*(t+h)]]},{pts:arc(s1,-1,h,side),dash:true});break;}
    case 'slider':{const L=W*0.55;out.push({pts:[[s0,t*0.35],[s0+L,t*0.35]],thick:true},{pts:[[s1-L,-t*0.35],[s1,-t*0.35]],thick:true});break;}
    case 'pocket':out.push({pts:[[s0,0],[s1,0]],thick:true},o.hinge?{pts:[[s1,0],[s1+W,0]],dash:true}:{pts:[[s0-W,0],[s0,0]],dash:true});break;
    case 'bifold':{const n=W>=48?4:2;const pts=[];for(let i=0;i<=n;i++)pts.push([s0+W*i/n,side*(t+(i%2?W/n*0.5:0))]);out.push({pts});break;}
    case 'barn':{const off=side*(t+1.5);out.push({pts:[[s0-2,off],[s1+2,off]],thick:true},o.hinge?{pts:[[s0-W-2,off],[s0-2,off]],dash:true}:{pts:[[s1+2,off],[s1+W+2,off]],dash:true});break;}
    case 'overhead':{const off=-side*(t+2);out.push({pts:[[s0,off],[s1,off]],dash:true},{pts:[[s0,off],[s0,off-side*Math.min(W,96)*0.4]],dash:true},{pts:[[s1,off],[s1,off-side*Math.min(W,96)*0.4]],dash:true});break;}
    default:{let a=s0,b=s1;if(o.door&&(o.door.sidelites||o.door.transom)){const U=doorUnit(o,{door:o.door});const mid=(s0+s1)/2;a=mid+U.u0;b=mid+U.u1;
        if(a-s0>2)out.push({pts:[[s0+0.75,0],[a-1,0]],thick:true});if(s1-b>2)out.push({pts:[[b+1,0],[s1-0.75,0]],thick:true});}
      const Wl=b-a;const hs=o.hinge?b:a,os=o.hinge?a:b;const dir=os>hs?1:-1;out.push({pts:[[hs,side*t],[hs,side*(t+Wl)]]},{pts:arc(hs,dir,Wl,side),dash:true});}
  }
  return out;
}
