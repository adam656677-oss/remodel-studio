/* ======================= desktop shell bridge ======================= */
// When running as the installed Windows program, window.rsDesktop gives real file dialogs,
// recent files, an unsaved-changes guard and Blender rendering. In a browser it is absent.
const DESK=(typeof window!=='undefined'&&window.rsDesktop&&window.rsDesktop.isDesktop)?window.rsDesktop:null;
function parseProjectText(text){const q=JSON.parse(text);if(!validProject(q))throw new Error('That file is not a Remodel Studio project.');return normalize(q);}
