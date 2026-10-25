/* ======================= customize any library item before placing it, and keep favorites as My items ======================= */
const MY_KEY='remodel-studio:myitems';
function loadMyItems(){try{return JSON.parse(localStorage.getItem(MY_KEY)||'[]');}catch(e){return [];}}
function saveMyItems(l){try{localStorage.setItem(MY_KEY,JSON.stringify(l));return true;}catch(e){return false;}}
function registerLibItem(x){const old=LIB_BY_ID[x.id];if(old){const i=LIB.indexOf(old);if(i>=0)LIB[i]=x;else LIB.push(x);}else LIB.push(x);LIB_BY_ID[x.id]=x;if(x.cat&&!LIB_CATS.includes(x.cat)){if(x.cat==='My items')LIB_CATS.unshift(x.cat);else LIB_CATS.push(x.cat);}}
for(const x of loadMyItems())try{registerLibItem(x);}catch(e){}
// a library item carrying its customized object
function draftFromLib(it){if(it.draft)return JSON.parse(JSON.stringify(it.draft));
  if(it.place==='door'||it.place==='window'){const o=openingFromLib(it);if(it.ext)o.ext=true;if(it.ada)o.ada=true;return o;}
  if(it.place==='fixture')return {type:it.base,lib:it.id,name:it.label,w:it.w,d:it.d,h:it.h,elev:it.elev??(FIXTURES[it.base]?.elev||0),...(it.cab?{cab:it.cab}:{})};return null;}
function itemFromDraft(base,draft,{name,persist}){const id=(persist?'my-':'tmp-')+uid('i');const label=name||draft.name||base.label;
  const x={...base,id,label,cat:persist?'My items':base.cat,sub:persist?(base.place==='fixture'?(base.cat||'Items'):base.place==='door'?'Doors':'Windows'):base.sub,draft:{...draft,name:label,lib:id},hidden:!persist,from:base.id};
  if(base.place==='door'||base.place==='window'){x.width=draft.width;x.height=draft.height;x.sill=draft.sill;x.dtype=draft.dtype;x.style=draft.style;x.operation=draft.operation;}
  if(base.place==='fixture'){x.w=draft.w;x.d=draft.d;x.h=draft.h;x.elev=draft.elev;}
  return x;}
// placing a customized item copies everything it carries
{const _ofl=openingFromLib;openingFromLib=function(it){if(it&&it.draft){const {id,wall,pos,ext,...rest}=it.draft;return {...rest,lib:it.id,name:it.label,hinge:rest.hinge??0,swing:rest.swing??1};}return _ofl(it);};}
{const _nf=newFixture;newFixture=function(type,level,x,y,rot=0){const it=LIB_BY_ID[type];if(it&&it.draft){const {id,...rest}=it.draft;return {...rest,id:uid('fx'),level,x,y,rot,lib:it.id,name:it.label,status:'new'};}return _nf(type,level,x,y,rot);};}
function ItemCustomizeModal({it,p,ctx,onClose}){const [o,setO]=useState(()=>draftFromLib(it));const [name,setName]=useState(it.draft?it.label:'');const [msg,setMsg]=useState(null);
  const up=patch=>setO(x=>({...x,...patch}));const kind=it.place==='fixture'?'fixture':'draft';
  const place=()=>{const x=itemFromDraft(it,o,{name:name.trim(),persist:false});registerLibItem(x);
    if(it.place==='fixture'){ctx.setFixtureType(x.id);ctx.setTool('fixture');}else{ctx.setOpenPreset(s=>({...s,[it.place]:x.id}));ctx.setTool(it.place);}
    ctx.setMode&&ctx.setMode(m=>m==='3d'||m==='materials'||m==='sheets'||m==='systems'?'plan':m);onClose();};
  const keep=()=>{const nm=name.trim()||o.name||it.label;const x=itemFromDraft(it,o,{name:nm,persist:true});const l=loadMyItems().filter(y=>y.id!==it.id).concat(x);
    if(!saveMyItems(l)){setMsg({ok:false,t:'Could not save on this computer.'});return;}registerLibItem(x);setMsg({ok:true,t:`Saved as "${nm}" in My items.`});};
  const del=()=>{saveMyItems(loadMyItems().filter(y=>y.id!==it.id));const i=LIB.findIndex(y=>y.id===it.id);if(i>=0)LIB.splice(i,1);delete LIB_BY_ID[it.id];onClose();};
  if(!o)return null;
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide custmodal" role="dialog" aria-label="Customize item">
    <h2>${it.label}</h2><p className="note">Change anything, then place it. Save it to My items to reuse it in any project.</p>
    <div className="cust-body"><div className="cust-left">
      ${it.place==='door'?html`<${DoorEditor} p=${p} o=${o} up=${up} draft=${true}/>`:it.place==='window'?html`<div className="sec"><h3>Picture</h3><${PicPane} kind="draft" obj=${o} p=${p}/></div>
        <div className="sec"><h3>Window</h3><div className="grid2"><${Field} label="Opens as" id="cw-op"><${Sel} id="cw-op" value=${o.operation||'double-hung'} onChange=${v=>up({operation:v})} options=${WINDOW_OPS}/><//>
          <${Field} label="Grilles" id="cw-gr"><${Sel} id="cw-gr" value=${o.grille||''} onChange=${v=>up({grille:v||null})} options=${GRILLES}/><//>
          ${(o.operation==='casement')?html`<${Field} label="Hinged on" id="cw-h"><${Sel} id="cw-h" value=${String(o.hinge||0)} onChange=${v=>up({hinge:+v})} options=${[['0','Left, seen from outside'],['1','Right, seen from outside']]}/><//>`:null}
          <${Field} label="Frame" id="cw-f"><${Sel} id="cw-f" value=${(o.win||{}).frame||'vinyl'} onChange=${v=>up({win:{...(o.win||{}),frame:v}})} options=${WIN_FRAMES}/><//>
          <${Field} label="Glass" id="cw-g"><${Sel} id="cw-g" value=${(o.win||{}).glass||'lowe'} onChange=${v=>up({win:{...(o.win||{}),glass:v}})} options=${WIN_GLASS}/><//>
          <${Field} label="Sill height" id="cw-s"><${LenInput} id="cw-s" value=${o.sill} onChange=${v=>up({sill:v})}/><//></div>
          <${ColorPick} id="cw-c" label="Frame color" value=${o.color} fallback="#f7f7f4" onChange=${v=>up({color:v})}/></div>`
        :html`<${FixturePicEditor} p=${p} o=${o} up=${up}/>${isCab(o)?html`<${CabinetPanel} p=${p} o=${o} up=${up} commit=${()=>{}}/>`:html`<div className="sec"><${ColorPick} id="cf-c" label="Color" value=${o.color} fallback="#d9d4c9" onChange=${v=>up({color:v})}/></div>`}`}
    </div><div className="cust-right">
      <div className="sec"><h3>Size</h3><div className="grid1">${it.place==='fixture'?html`
        <${Field} label="Width" id="cu-w"><${LenInput} id="cu-w" value=${o.w} onChange=${v=>v>0&&up({w:v})}/><//><${Field} label="Depth" id="cu-d"><${LenInput} id="cu-d" value=${o.d} onChange=${v=>v>0&&up({d:v})}/><//>
        <${Field} label="Height" id="cu-h"><${LenInput} id="cu-h" value=${o.h} onChange=${v=>v>0&&up({h:v})}/><//><${Field} label="Off the floor" id="cu-e"><${LenInput} id="cu-e" value=${o.elev||0} onChange=${v=>v>=0&&up({elev:v})}/><//>`:html`
        <${Field} label="Width" id="cu-w"><${LenInput} id="cu-w" value=${o.width} onChange=${v=>v>6&&up({width:v})}/><//><${Field} label="Height" id="cu-h"><${LenInput} id="cu-h" value=${o.height} onChange=${v=>v>6&&up({height:v})}/><//>`}</div></div>
      <div className="sec"><h3>Name</h3><input className="inp" value=${name} placeholder=${o.name||it.label} onChange=${e=>setName(e.target.value)} aria-label="Item name"/></div>
      ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
      <div className="row"><button className="btn primary" onClick=${place}>${it.place==='fixture'?'Place':'Place on a wall'}</button><button className="btn" onClick=${keep}>${it.cat==='My items'?'Save changes':'Save to My items'}</button></div>
      ${it.cat==='My items'?html`<div className="row"><button className="btn danger" onClick=${del}>Remove from My items</button></div>`:null}
      <div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Cancel</button></div></div></div></div></div>`;}
