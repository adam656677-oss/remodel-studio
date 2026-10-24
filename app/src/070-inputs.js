/* ======================= inputs ======================= */
function LenInput({id,value,onChange,bare='in',placeholder}){
  const [text,setText]=useState(value==null?'':fmtLen(value)); const [bad,setBad]=useState(false);
  useEffect(()=>{setText(value==null?'':fmtLen(value));setBad(false);},[value]);
  const apply=()=>{ if(!text.trim()&&placeholder){onChange(null);return;} const v=parseLen(text,bare); if(v==null||v<0){setBad(true);return;} setBad(false); if(Math.abs(v-(value??-1))>1e-6) onChange(v); else setText(fmtLen(v)); };
  return html`<input id=${id} className=${'inp mono'+(bad?' bad':'')} value=${text} placeholder=${placeholder||''} inputMode="text" autoComplete="off"
    onChange=${e=>setText(e.target.value)} onBlur=${apply} onKeyDown=${e=>{if(e.key==='Enter')e.target.blur();if(e.key==='Escape'){setText(value==null?'':fmtLen(value));e.target.blur();}}} title="Examples: 12'6&quot;, 36&quot;, 6 ft 3 in, 1.9 m"/>`;
}
function NumInput({id,value,onChange,step=1,min,max}){
  const [text,setText]=useState(String(value)); useEffect(()=>setText(String(value)),[value]);
  const apply=()=>{const v=parseFloat(text);if(isNaN(v)){setText(String(value));return;}let c=v;if(min!=null)c=Math.max(min,c);if(max!=null)c=Math.min(max,c);if(c!==value)onChange(c);else setText(String(c));};
  return html`<input id=${id} className="inp mono" value=${text} inputMode="decimal" onChange=${e=>setText(e.target.value)} onBlur=${apply} onKeyDown=${e=>{if(e.key==='Enter')e.target.blur();}}/>`;
}
const Field=({label,id,children})=>html`<div className="field"><label htmlFor=${id}>${label}</label>${children}</div>`;
const Sel=({id,value,onChange,options})=>html`<select id=${id} className="inp" value=${value} onChange=${e=>onChange(e.target.value)}>${options.map(([v,l])=>html`<option key=${v} value=${v}>${l}</option>`)}</select>`;

