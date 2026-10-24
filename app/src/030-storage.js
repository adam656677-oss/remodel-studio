/* ======================= storage ======================= */
const SAVE_KEY='remodel-studio:project';
function loadSaved(){try{const s=localStorage.getItem(SAVE_KEY);if(!s)return null;const p=JSON.parse(s);return validProject(p)?normalize(p):null;}catch(e){return null;}}
function saveLocal(p){try{localStorage.setItem(SAVE_KEY,JSON.stringify(p));return true;}catch(e){return false;}}

