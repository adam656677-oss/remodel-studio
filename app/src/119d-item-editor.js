/* ======================= item editors: picture, handing, options and hardware for doors, windows and fixtures ======================= */
const STYLE_GLASS=new Set(['halflite','fulllite','french','sixlite','storefront','garageglass']);
const DOOR_STYLES_FOR={swing:null,double:null,slider:['fulllite','french','sixlite','plank','flush'],pocket:null,bifold:['panel6','panel2','shaker','panel5','louver','flush','fulllite','plank'],barn:['plank','shaker','panel5','fulllite','flush'],overhead:['garage','garageglass','garagecarriage']};
function PicPane({kind,obj,p,big=true}){const [back,setBack]=useState(false);
  return html`<div className="pic-pane"><${ItemPic} kind=${kind} obj=${obj} p=${p} w=${big?440:220} h=${big?330:165} back=${back} eager=${true} alt=${'Picture of '+(obj.name||kind)}/>
    <div className="seg pic-side" role="group" aria-label="Which side"><button className=${back?'':'on'} onClick=${()=>setBack(false)}>${kind==='opening'&&obj.type==='door'?'Front':'Front'}</button><button className=${back?'on':''} onClick=${()=>setBack(true)}>Back</button></div></div>`;}
// door: style picture grid, handing pictures, construction and hardware
function DoorEditor({p,o,up,draft=false}){const spec=doorSpec(p,o);const dt=o.dtype||'swing';const h=draft?null:doorHanding(p,o);
  const uh=patch=>up({hw:{...(o.hw||{}),...patch}});const ud=patch=>up({door:{...(o.door||{}),...patch}});const un=patch=>up({hinges:{...(o.hinges||{}),...patch}});
  const styles=(DOOR_STYLES_FOR[dt]||Object.keys(DOOR_STYLES).filter(k=>!/^garage/.test(k))).filter(k=>DOOR_STYLES[k]||/^garage/.test(k));
  const sLabel=k=>DOOR_STYLES[k]||({garage:'Raised panel',garageglass:'Panels with window row',garagecarriage:'Carriage house'})[k]||k;
  const swingish=dt==='swing'||dt==='double';const combos=swingish?[[0,1],[1,1],[0,-1],[1,-1]]:[[0,o.swing||1],[1,o.swing||1]];
  const fin=hwFinish(spec.hw.finish);
  return html`<div className="sec"><h3>Picture</h3><${PicPane} kind="opening" obj=${o} p=${p}/>
      ${h&&h.both?html`<p className="note"><b>${h.both}</b>${h.into&&swingish?html` · swings into ${h.into.name}`:h.ext&&swingish?html` · ${/outswing/.test(h.res)?'swings outside':'swings inside'}`:null}</p>`:null}</div>
    ${draft?null:html`<div className="sec"><h3>${swingish?'Handing':'Opening direction'}</h3><div className="hgrid">${combos.map(([hg,sw])=>{const q={...o,hinge:hg,swing:sw};const hh=doorHanding(p,q);const on=(o.hinge?1:0)===hg&&(o.swing||1)===sw;
        return html`<button key=${hg+'/'+sw} className=${'htbtn'+(on?' on':'')} onClick=${()=>up({hinge:hg,swing:sw})} aria-pressed=${on}>${handingTile(p,o,hg,sw)}<span className="htname">${hh.res}</span>${hh.ansi?html`<span className="note">ANSI ${hh.ansi}</span>`:null}</button>`;})}</div>
      <p className="note">${swingish?'Residential names: exterior doors seen from outside; interior doors seen from the side the door swings toward. ANSI names: seen from outside or the push side.':'Seen from outside, or from the room the door swings toward.'}</p></div>`}
    <div className="sec"><h3>Door</h3>
      <${Field} label="Door type" id="o-dt"><${Sel} id="o-dt" value=${dt} onChange=${v=>{const ok=DOOR_STYLES_FOR[v];up({dtype:v,lib:null,name:null,...(ok&&!ok.includes(o.style)?{style:ok[0]}:{})});}} options=${Object.entries(DOOR_TYPES)}/><//>
      <div className="stylegrid" role="listbox" aria-label="Door style">${styles.map(k=>{const on=(o.style||'panel6')===k;return html`<button key=${k} role="option" aria-selected=${on} className=${'stylebtn'+(on?' on':'')} onClick=${()=>up({style:k,lib:null,name:null})} title=${sLabel(k)}>
        <${ItemPic} kind=${draft?'draft':'opening'} obj=${{...o,style:k}} p=${p} w=${120} h=${150}/><span>${sLabel(k)}</span></button>`;})}</div>
      <div className="grid2"><${Field} label="Slab" id="o-mat"><${Sel} id="o-mat" value=${spec.door.mat} onChange=${v=>ud({mat:v})} options=${DOOR_MATS}/><//>
        <${Field} label="Thickness" id="o-th"><${Sel} id="o-th" value=${String(spec.door.thick)} onChange=${v=>ud({thick:+v})} options=${[['1.375','1-3/8"'],['1.75','1-3/4"'],['2.25','2-1/4"']]}/><//>
        ${STYLE_GLASS.has(o.style)||dt==='slider'||spec.door.sidelites||spec.door.transom?html`<${Field} label="Glass" id="o-gl"><${Sel} id="o-gl" value=${spec.door.glass} onChange=${v=>ud({glass:v})} options=${DOOR_GLASS}/><//>`:null}
        ${swingish&&(spec.ext||o.width>=48)?html`<${Field} label="Sidelites" id="o-sl"><${Sel} id="o-sl" value=${String(spec.door.sidelites||0)} onChange=${v=>ud({sidelites:+v})} options=${[['0','None'],['1','One, latch side'],['2','Both sides']]}/><//>
          ${spec.door.sidelites?html`<${Field} label="Sidelite width" id="o-slw"><${LenInput} id="o-slw" value=${spec.door.sideW||12} onChange=${v=>v>4&&ud({sideW:v})}/><//>`:null}
          <${Field} label="Transom" id="o-tr"><${Sel} id="o-tr" value=${spec.door.transom?'1':'0'} onChange=${v=>ud({transom:v==='1'})} options=${[['0','None'],['1','Glass transom above']]}/><//>
          ${spec.door.transom?html`<${Field} label="Transom height" id="o-trh"><${LenInput} id="o-trh" value=${spec.door.transomH||14} onChange=${v=>v>4&&ud({transomH:v})}/><//>`:null}`:null}
        ${swingish?html`<${Field} label="Threshold" id="o-thr"><${Sel} id="o-thr" value=${spec.door.threshold} onChange=${v=>ud({threshold:v})} options=${DOOR_THRESH}/><//>`:null}</div>
      ${spec.door.sidelites||spec.door.transom?html`<p className="note">The opening width and height are for the whole unit; the door slab is ${fmtLen(doorLeafW(o,spec))} wide by ${fmtLen(doorLeafH(o,spec))} high.</p>`:null}
      <label className="check"><input type="checkbox" checked=${!!spec.door.fire20} onChange=${e=>ud({fire20:e.target.checked})}/> 20-minute fire rated</label>
      ${spec.garageHouse?html`<p className="note">Between the garage and the house (IRC R302.5.1): solid wood, solid-core or steel at least 1-3/8" thick, or 20-minute rated, with a self-closing device.</p>`:null}
      <${ColorPick} id="o-col" label="Door color" value=${o.color} fallback=${'#8a5a35'} onChange=${v=>up({color:v})}/></div>
    ${dt!=='overhead'?html`<div className="sec"><h3>Hardware</h3>
      <div className="grid2"><${Field} label="Handle" id="o-hwt"><${Sel} id="o-hwt" value=${spec.hw.type} onChange=${v=>uh({type:v})} options=${HW_TYPES}/><//>
        ${['lever','knob','handleset'].includes(spec.hw.type)?html`<${Field} label="Function" id="o-hwf"><${Sel} id="o-hwf" value=${spec.hw.func} onChange=${v=>uh({func:v})} options=${HW_FUNCS}/><//>`:null}
        ${['lever','knob','handleset'].includes(spec.hw.type)?html`<${Field} label="Rose" id="o-hwr"><${Sel} id="o-hwr" value=${spec.hw.rose} onChange=${v=>uh({rose:v})} options=${HW_ROSES}/><//>`:null}
        ${spec.hw.type==='lever'||spec.hw.type==='handleset'?html`<${Field} label="Lever" id="o-hwl"><${Sel} id="o-hwl" value=${spec.hw.lever} onChange=${v=>uh({lever:v})} options=${LEVER_SHAPES}/><//>`:null}
        <${Field} label="Brand" id="o-hwb"><${Sel} id="o-hwb" value=${spec.hw.brand} onChange=${v=>uh({brand:v})} options=${HW_BRANDS.map(b=>[b,b])}/><//>
        ${swingish&&['lever','knob','handleset'].includes(spec.hw.type)?html`<label className="check" style=${{alignSelf:'end'}}><input type="checkbox" checked=${!!spec.hw.deadbolt} onChange=${e=>uh({deadbolt:e.target.checked})}/> Deadbolt</label>`:null}</div>
      <div className="finswatches" role="radiogroup" aria-label="Hardware finish">${HW_FINISHES.map(f=>html`<button key=${f[0]} role="radio" aria-checked=${f[0]===fin[0]} className=${'finsw'+(f[0]===fin[0]?' on':'')} title=${f[1]} onClick=${()=>up({hw:{...(o.hw||{}),finish:f[0]},hinges:{...(o.hinges||{}),finish:f[0]}})}><i style=${{background:'#'+f[2].toString(16).padStart(6,'0')}}></i><span>${f[1]}</span></button>`)}</div>
      ${swingish?html`<div className="grid2">
        <${Field} label="Hinges per leaf" id="o-hn"><${Sel} id="o-hn" value=${String(spec.hinges.n)} onChange=${v=>un({n:+v})} options=${[['2','2'],['3','3'],['4','4']]}/><//>
        <${Field} label="Hinge size" id="o-hs"><${Sel} id="o-hs" value=${spec.hinges.size} onChange=${v=>un({size:v})} options=${HINGE_SIZES}/><//>
        <${Field} label="Hinge corners" id="o-hc"><${Sel} id="o-hc" value=${spec.hinges.corner} onChange=${v=>un({corner:v})} options=${HINGE_CORNERS}/><//>
        <${Field} label="Door stop" id="o-st"><${Sel} id="o-st" value=${spec.door.stop} onChange=${v=>ud({stop:v})} options=${DOOR_STOPS}/><//></div>
        <div className="checkrow"><label className="check"><input type="checkbox" checked=${!!spec.door.closer} onChange=${e=>ud({closer:e.target.checked})}/> Self-closing (closer or spring hinges)</label>
          <label className="check"><input type="checkbox" checked=${!!spec.door.kick} onChange=${e=>ud({kick:e.target.checked})}/> Kick plate</label>
          <label className="check"><input type="checkbox" checked=${!!spec.door.viewer} onChange=${e=>ud({viewer:e.target.checked})}/> Peephole viewer</label></div>`:null}
      ${spec.hw.type==='knob'&&(p.settings?.ada!==false)?html`<p className="note warnnote">Knobs need a tight grasp and twist; ADA 309.4 calls for levers or pulls on accessible routes.</p>`:null}
      ${o.hw||o.door||o.hinges?html`<button className="btn" onClick=${()=>up({hw:null,door:null,hinges:null})}>Reset to the usual hardware for this door</button>`:null}</div>`:null}`;}
function doorLeafW(o,spec){const U=doorUnit(o,spec||{door:{}});const dt=o.dtype||'swing';const w=U.u1-U.u0;return dt==='double'?w/2:w;}
function doorLeafH(o,spec){const U=doorUnit(o,spec||{door:{}});return U.y1-U.y0;}
// window: picture, casement hinge side, glass and frame
const WIN_FRAMES=[['vinyl','Vinyl'],['wood','Wood'],['clad','Aluminum-clad wood'],['fiberglass','Fiberglass'],['composite','Composite (Fibrex)'],['alum','Aluminum']];
const WIN_GLASS=[['lowe','Double pane, low-E'],['lowe3','Triple pane, low-E'],['tempered','Tempered, low-E'],['obscure','Obscure (bath)'],['laminated','Laminated (impact)']];
function WindowEditor({p,o,up}){const ext=(()=>{const w=p.walls.find(w=>w.id===o.wall);return w&&w.kind==='exterior';})();const op=o.operation||'double-hung';
  const opt=o.win||{};const uw=patch=>up({win:{...opt,...patch}});
  return html`<div className="sec"><h3>Picture</h3><${PicPane} kind="opening" obj=${o} p=${p}/></div>
    ${op==='casement'?html`<div className="sec"><h3>Hinge side</h3><div className="hgrid two">${[0,1].map(hg=>{const on=(o.hinge?1:0)===hg;return html`<button key=${hg} className=${'htbtn'+(on?' on':'')} onClick=${()=>up({hinge:hg})} aria-pressed=${on}>
        <svg viewBox="0 0 80 60" className="htile" aria-hidden="true"><rect x="14" y="6" width="52" height="48" className="ht-win"/><polyline points=${hg?'66,6 14,30 66,54':'14,6 66,30 14,54'} className="ht-arc"/></svg><span className="htname">${hg?'Hinged on the right':'Hinged on the left'}</span><span className="note">seen from outside</span></button>`;})}</div></div>`:null}
    <div className="sec"><h3>Window</h3><div className="grid2">
      <${Field} label="Frame" id="o-wf"><${Sel} id="o-wf" value=${opt.frame||'vinyl'} onChange=${v=>uw({frame:v})} options=${WIN_FRAMES}/><//>
      <${Field} label="Glass" id="o-wg"><${Sel} id="o-wg" value=${opt.glass||'lowe'} onChange=${v=>uw({glass:v})} options=${WIN_GLASS}/><//>
      ${op!=='fixed'?html`<${Field} label="Screen" id="o-ws"><${Sel} id="o-ws" value=${opt.screen||'half'} onChange=${v=>uw({screen:v})} options=${[['half','Half screen'],['full','Full screen'],['none','No screen']]}/><//>`:null}
      ${op!=='fixed'?html`<${Field} label="Lock and crank finish" id="o-wh"><${Sel} id="o-wh" value=${opt.hw||'white'} onChange=${v=>uw({hw:v})} options=${HW_FINISHES.map(f=>[f[0],f[1]])}/><//>`:null}
      ${ext?html`<${ColorPick} id="o-wco" label="Outside color" value=${opt.outColor} fallback="#f7f7f4" onChange=${v=>uw({outColor:v})}/>`:null}</div>
      ${(()=>{const s=selOf(p).windows;return s&&s.brand?html`<p className="note">Selected: ${selText(p,'windows')}.</p>`:null;})()}</div>`;}
// fixtures, appliances, furniture and cabinets: picture plus hand where it applies
const HANDED={fridge:['Door hinged on the left','Door hinged on the right'],tub:['Drain on the left','Drain on the right']};const HAND_DEF={fridge:'L',tub:'R'};
function FixturePicEditor({p,o,up}){const hand=HANDED[o.type];
  return html`<div className="sec"><h3>Picture</h3><${PicPane} kind="fixture" obj=${o} p=${p}/>
    ${hand?html`<div className="seg" role="group" aria-label="Hand" style=${{marginTop:'8px'}}>${hand.map((t,i)=>html`<button key=${i} className=${(o.hand||HAND_DEF[o.type]||'L')===(i?'R':'L')?'on':''} onClick=${()=>up({hand:i?'R':'L'})}>${t}</button>`)}</div><p className="note">Seen from the front.</p>`:null}</div>`;}
