/* ======================= tool rail with fly-out groups ======================= */
function toolInfo(id){const t=TOOLS.find(x=>x[0]===id);if(t)return {id,label:t[1],key:t[2],icon:I[id]};const x=XTOOLS[id];
  return x?{id,label:x.label,key:x.key||'',icon:x.icon||I[x.iconOf]||I.shape,short:x.short}:null;}
const allToolKeys=()=>[...TOOLS.map(t=>[t[0],t[2]]),...Object.entries(XTOOLS).filter(([k,x])=>x.key).map(([k,x])=>[k,x.key])];
function ToolRail({tool,setTool,narrow,setCollapsed}){
  const [open,setOpen]=useState(null);const [pos,setPos]=useState(null);const last=useRef((()=>{try{return JSON.parse(localStorage.getItem('remodel-studio:lasttool')||'{}');}catch(e){return {};}})());
  const groups=TOOL_GROUPS.map(g=>({...g,tools:g.tools.filter(id=>toolInfo(id))})).filter(g=>g.tools.length);
  const groupOf=id=>groups.find(g=>g.tools.includes(id));
  useEffect(()=>{const g=groupOf(tool);if(g){last.current[g.id]=tool;try{localStorage.setItem('remodel-studio:lasttool',JSON.stringify(last.current));}catch(e){}}},[tool]);
  useEffect(()=>{if(!open)return;const close=e=>{if(!e.target.closest('.flyout')&&!e.target.closest('.rail'))setOpen(null);};const kd=e=>{if(e.key==='Escape')setOpen(null);};
    document.addEventListener('pointerdown',close);window.addEventListener('keydown',kd);return ()=>{document.removeEventListener('pointerdown',close);window.removeEventListener('keydown',kd);};},[open]);
  const pick=id=>{setTool(id);setOpen(null);if(narrow&&id!=='select')setCollapsed(true);};
  const og=open&&groups.find(g=>g.id===open);
  return html`<nav className="rail" aria-label="Tools">${groups.map(g=>{const cur=g.tools.includes(tool)?tool:(last.current[g.id]&&g.tools.includes(last.current[g.id])?last.current[g.id]:g.tools[0]);const ti=toolInfo(cur);const on=g.tools.includes(tool);const many=g.tools.length>1;
      return html`<button key=${g.id} className=${'tool'+(on?' on':'')+(many?' grp':'')+(open===g.id?' open':'')} aria-pressed=${on} aria-haspopup=${many?'menu':undefined} title=${many?`${g.label}: ${ti.label}${ti.key?' ('+ti.key+')':''}. Click again for more.`:`${ti.label}${ti.key?' ('+ti.key+')':''}`}
        onClick=${e=>{if(!many){pick(cur);return;}const r=e.currentTarget.getBoundingClientRect();
          if(!on){setTool(cur);if(narrow&&cur!=='select')setCollapsed(true);setPos(r);setOpen(g.id);return;}setPos(r);setOpen(open===g.id?null:g.id);}}>${ti.icon}<small>${ti.short||ti.label}</small>${many?html`<i className="grp-mark" aria-hidden="true"></i>`:null}</button>`;})}
    ${og&&pos?html`<div className="flyout" role="menu" aria-label=${og.label} style=${narrow?{left:Math.max(8,Math.min(window.innerWidth-260,pos.left))+'px',bottom:(window.innerHeight-pos.top+6)+'px'}:{left:(pos.right+6)+'px',top:Math.max(8,Math.min(window.innerHeight-og.tools.length*40-50,pos.top))+'px'}}>
      <div className="fly-h">${og.label}</div>
      ${og.tools.map(id=>{const ti=toolInfo(id);return html`<button key=${id} role="menuitem" className=${tool===id?'on':''} onClick=${()=>pick(id)}><span className="fly-i">${ti.icon}</span><span className="grow">${ti.label}</span>${ti.key?html`<kbd>${ti.key}</kbd>`:null}</button>`;})}</div>`:null}
  </nav>`;}
