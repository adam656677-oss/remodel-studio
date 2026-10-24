/* ======================= swap door style, finish, species and hardware for the job, a zone, a room or the selection ======================= */
const SWAP_KEYS=['style','finish','species','hw','hwFin','vdoor','vfinish'];
function swapScopeCabs(p,scope,sel,room){const cabs=(p.fixtures||[]).filter(f=>isCab(f)&&f.status!=='demolish');
  if(scope==='job')return cabs;if(scope==='sel'){const ids=new Set(sel?(sel.kind==='multi'?sel.items.map(i=>i.id):[sel.id]):[]);return cabs.filter(f=>ids.has(f.id));}
  if(scope.startsWith('zone:')){const z=scope.slice(5);return cabs.filter(f=>(cabZone(f)||'perimeter')===z);}
  if(scope==='room'&&room)return cabs.filter(f=>f.level===room.level&&inPoly(f.x,f.y,room.pts));return [];}
function applySwap(p,scope,cabs,patch){const clean=Object.fromEntries(Object.entries(patch).filter(([,v])=>v!==''&&v!=null));if(!Object.keys(clean).length)return p;
  if(scope==='job'){const keys=Object.keys(clean);let next=applyVendorCab({...(p.settings.cab||{}),...clean});if(clean.finish)next={...next,color:null,colorSet:false};
    // job-wide: drop the same attributes from individual cabinets and zones so the new choice shows everywhere
    const zones=Object.fromEntries(Object.entries(next.zones||{}).map(([z,v])=>[z,Object.fromEntries(Object.entries(v||{}).filter(([k])=>!keys.includes(k)))]));
    return {...p,settings:{...p.settings,cab:{...next,zones}},fixtures:p.fixtures.map(f=>isCab(f)&&f.cab?{...f,cab:Object.fromEntries(Object.entries(f.cab).filter(([k])=>!keys.includes(k)))}:f)};}
  if(scope.startsWith('zone:')){const z=scope.slice(5);if(z!=='perimeter'){const zs={...((p.settings.cab||{}).zones||{})};zs[z]={...(zs[z]||{}),...clean,...(clean.finish?{color:null}:{})};return {...p,settings:{...p.settings,cab:{...(p.settings.cab||{}),zones:zs}}};}}
  const ids=new Set(cabs.map(f=>f.id));return {...p,fixtures:p.fixtures.map(f=>ids.has(f.id)?{...f,cab:{...(f.cab||{}),...clean,...(clean.finish?{color:null}:{})}}:f)};}
const cabTotal=(p,cabs)=>cabs.reduce((s,f)=>{try{return s+cabPrice(p,f);}catch(e){return s;}},0);
function StyleSwapModal({p,commit,sel,onClose}){const rooms=p.rooms.filter(r=>(p.fixtures||[]).some(f=>isCab(f)&&f.level===r.level&&inPoly(f.x,f.y,r.pts)));
  const hasSel=sel&&(sel.kind==='multi'?sel.items.some(i=>i.kind==='fixture'):sel.kind==='fixture');
  const [scope,setScope]=useState(hasSel?'sel':'job');const [roomId,setRoomId]=useState(rooms[0]?.id||'');const room=rooms.find(r=>r.id===roomId);
  const [patch,setPatch]=useState({});const set=(k,v)=>setPatch(x=>({...x,[k]:v}));
  const cabs=swapScopeCabs(p,scope,sel,room);const q=useMemo(()=>applySwap(p,scope,cabs,patch),[p,scope,roomId,JSON.stringify(patch),cabs.length]);
  const qCabs=cabs.map(f=>q.fixtures.find(x=>x.id===f.id)).filter(Boolean);const before=cabTotal(p,cabs),after=cabTotal(q,qCabs);
  const sample=cabs.find(f=>f.type==='base')||cabs[0];const st0=sample?cabStyle(p,sample):(p.settings.cab||{});const v=cabVendor((p.settings.cab||{}).vendor);
  const S=(k,label,opts)=>html`<${Field} label=${label} id=${'sw-'+k}><${Sel} id=${'sw-'+k} value=${patch[k]??''} onChange=${x=>set(k,x)} options=${[['',`Keep (${(opts.find(o=>o[0]===st0[k])||['',st0[k]||'—'])[1]})`],...opts.map(o=>[o[0],o[1]])]}/><//>`;
  const $=n=>'$'+Math.round(n).toLocaleString('en-US');const diff=after-before;
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide rw" role="dialog" aria-label="Change door style and finish"><h2>Change door style and finish</h2>
    <div className="rw-grid"><div className="rw-left">
      <${Field} label="Change" id="sw-scope"><${Sel} id="sw-scope" value=${scope} onChange=${setScope} options=${[['job','Every cabinet in the job'],...(hasSel?[['sel','Selected cabinets']]:[]),...(rooms.length?[['room','One room']]:[]),['zone:perimeter','Perimeter base cabinets'],...CAB_ZONES.map(([z,l])=>['zone:'+z,l])]}/><//>
      ${scope==='room'?html`<${Field} label="Room" id="sw-room"><${Sel} id="sw-room" value=${roomId} onChange=${setRoomId} options=${rooms.map(r=>[r.id,r.name])}/><//>`:null}
      ${S('style','Door style',CAB_STYLES)}${S('finish','Finish',CAB_FIN)}${S('species','Wood species',CAB_SPECIES)}${S('hw','Hardware',CAB_HW)}${S('hwFin','Hardware finish',HW_FIN)}
      ${v&&scope==='job'?html`${S('vdoor',v.name+' door',(v.doors||[]).map(d=>[d.name,d.name]))}${S('vfinish',v.name+' finish',(v.finishes||[]).map(f=>[f.name,f.name+(f.type?' ('+f.type+')':'')]))}`:null}
      <p className="note">${cabs.length} cabinet${cabs.length===1?'':'s'} will change. ${scope==='job'?'Job-wide changes also clear the same choices set on single cabinets and zones.':'Other cabinets keep their look.'}</p>
    </div><div className="rw-right">
      ${sample?html`<div className="sw-pics"><figure><${ItemPic} key=${'b'+JSON.stringify(cabStyle(p,sample))} kind="fixture" obj=${sample} p=${p} w=${200} h=${150} eager=${true} alt="Before"/><figcaption>Before</figcaption></figure>
        <figure><${ItemPic} key=${'a'+JSON.stringify(cabStyle(q,q.fixtures.find(x=>x.id===sample.id)||sample))} kind="fixture" obj=${q.fixtures.find(x=>x.id===sample.id)||sample} p=${q} w=${200} h=${150} eager=${true} alt="After"/><figcaption>After</figcaption></figure></div>`:html`<p className="note">There are no cabinets in that scope.</p>`}
      <div className="rw-stats"><div><span>Cabinets now</span><b>${$(before)}</b></div><div><span>After the change</span><b>${$(after)}</b><small className=${diff>0?'bad':'ok'}>${diff>=0?'+':'−'}${$(Math.abs(diff))} (${before?Math.round(diff/before*100):0}%)</small></div></div>
      <p className="note">Planning prices, or your dealer price book when one is chosen.</p>
    </div></div>
    <div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Cancel</button><button className="btn primary" disabled=${!cabs.length||!Object.values(patch).some(Boolean)} onClick=${()=>{commit(q);onClose();window.__say&&window.__say(`Changed ${cabs.length} cabinet${cabs.length===1?'':'s'}. Undo puts them back.`);}}>Apply</button></div></div></div>`;}
EXTRA_DIALOGS.styleswap=StyleSwapModal;
