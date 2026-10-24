// Safe bridge between the page and the desktop shell. The page sees window.rsDesktop.
const {contextBridge,ipcRenderer}=require('electron');
const toBytes=d=>{if(typeof d==='string')return d;if(d instanceof ArrayBuffer)return new Uint8Array(d);if(ArrayBuffer.isView(d))return new Uint8Array(d.buffer,d.byteOffset,d.byteLength);return d;};
contextBridge.exposeInMainWorld('rsDesktop',{
  isDesktop:true,
  info:()=>ipcRenderer.invoke('info'),
  takePending:()=>ipcRenderer.invoke('take-pending'),
  openDialog:()=>ipcRenderer.invoke('open-dialog'),
  readPath:p=>ipcRenderer.invoke('read-path',p),
  writePath:(p,text,name)=>ipcRenderer.invoke('write-path',p,text,name),
  saveProjectAs:(name,text)=>ipcRenderer.invoke('save-project-as',name,text),
  saveFile:(filename,data)=>ipcRenderer.invoke('save-file',filename,toBytes(data)),
  recent:()=>ipcRenderer.invoke('recent'),
  forgetRecent:p=>ipcRenderer.invoke('forget-recent',p),
  showInFolder:p=>ipcRenderer.invoke('show-in-folder',p),
  openExternal:p=>ipcRenderer.invoke('open-external',p),
  setDirty:(v,title)=>ipcRenderer.send('set-dirty',v,title),
  closeNow:()=>ipcRenderer.send('close-now'),
  findBlender:()=>ipcRenderer.invoke('find-blender'),
  pickBlender:()=>ipcRenderer.invoke('pick-blender'),
  render:job=>{const files={};for(const [k,v] of Object.entries(job.files))files[k]=toBytes(v);return ipcRenderer.invoke('render',{...job,files});},
  cancelRender:()=>ipcRenderer.invoke('cancel-render'),
  on:(ch,fn)=>{if(!['open-path','save-then-close','render-log'].includes(ch))return ()=>{};const h=(e,...a)=>fn(...a);ipcRenderer.on(ch,h);return ()=>ipcRenderer.removeListener(ch,h);}
});
