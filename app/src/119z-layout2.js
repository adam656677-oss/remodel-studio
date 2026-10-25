/* ======================= 2.2 layout: collapsible panel sections, auto-fit, resize handling, remembered ribbon state ======================= */
// Panel sections fold by clicking their heading; the closed set is remembered by heading text.
const SEC_CLOSED=(()=>{try{return new Set(JSON.parse(localStorage.getItem('remodel-studio:sec-closed')||'[]'));}catch(e){return new Set();}})();
function secApply(root){if(!root)return;for(const h of root.querySelectorAll('.sec > h3')){const sec=h.parentElement;const key=(h.textContent||'').trim().replace(/\s*\(.*$/,'');if(!key)continue;
    if(!h.dataset.fold){h.dataset.fold='1';h.addEventListener('click',e=>{if(e.target.closest('button,input,select,a'))return;const k=(h.textContent||'').trim().replace(/\s*\(.*$/,'');if(SEC_CLOSED.has(k))SEC_CLOSED.delete(k);else SEC_CLOSED.add(k);try{localStorage.setItem('remodel-studio:sec-closed',JSON.stringify([...SEC_CLOSED]));}catch(x){}secApply(root);});}
    if(SEC_CLOSED.has(key))sec.setAttribute('data-closed','1');else sec.removeAttribute('data-closed');}}
{const _I=Inspector;Inspector=function(props){const r=_I(props);return html`<${SecFolder} key="sf">${r}<//>`;};}
function SecFolder({children}){const ref=useRef(null);useEffect(()=>{secApply(ref.current);});return html`<div ref=${ref} className="secfold">${children}</div>`;}
// the designer fits its plan panes when they first show, when the layout changes and when the window is resized
{const _DV=DesignerView;DesignerView=function({D}){const r=_DV({D});const first=useRef(true);
  useEffect(()=>{const el=document.querySelector('.dz-panes');if(!el)return;let t=null,last=null;const ro=new ResizeObserver(es=>{const b=es[0].contentRect;const key=Math.round(b.width)+'x'+Math.round(b.height);if(key===last)return;last=key;clearTimeout(t);t=setTimeout(()=>{D.fitPlan();if(first.current){first.current=false;D.fit3();}},first.current?60:160);});ro.observe(el);return ()=>{ro.disconnect();clearTimeout(t);};},[]);
  return r;};}
