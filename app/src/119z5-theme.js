/* ======================= appearance: follow Windows, or force light or dark ======================= */
const THEME_KEY='remodel-studio:theme';
function themeGet(){try{return localStorage.getItem(THEME_KEY)||'system';}catch(e){return 'system';}}
function themeApply(v){const el=document.documentElement;if(v==='light'||v==='dark')el.setAttribute('data-theme',v);else el.removeAttribute('data-theme');}
function themeSet(v){try{if(v==='system')localStorage.removeItem(THEME_KEY);else localStorage.setItem(THEME_KEY,v);}catch(e){}themeApply(v);window.dispatchEvent(new CustomEvent('rs-theme',{detail:v}));}
themeApply(themeGet());
const THEME_ITEMS=()=>[['system','Follow Windows'],['light','Light'],['dark','Dark']].map(([k,l])=>({label:(themeGet()===k?'\u2713 ':'\u2003')+l,run:()=>themeSet(k)}));
function AppearanceModal({onClose}){const [v,setV]=useState(themeGet());const pick=k=>{setV(k);themeSet(k);};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-label="Appearance" style=${{maxWidth:'420px'}}><h2>Appearance</h2>
    <p className="note">Light or dark colors for the whole program, including the plan and the 3D views. "Follow Windows" uses the setting in Windows Settings \u203a Personalization \u203a Colors.</p>
    <div className="seg" role="radiogroup" aria-label="Theme">${[['system','Follow Windows'],['light','Light'],['dark','Dark']].map(([k,l])=>html`<button key=${k} role="radio" aria-checked=${v===k} className=${v===k?'on':''} onClick=${()=>pick(k)}>${l}</button>`)}</div>
    <div className="row" style=${{marginTop:'14px',justifyContent:'flex-end'}}><button className="btn primary" onClick=${onClose}>Done</button></div></div></div>`;}
EXTRA_DIALOGS.appearance=AppearanceModal;
