// Remodel Studio desktop shell (Electron main process).
// The whole program lives in app/index.html; this file gives it real Windows file dialogs,
// .rsp file association, recent files, an unsaved-changes guard, and Blender rendering.
const {app,BrowserWindow,ipcMain,dialog,shell,Menu,nativeImage}=require('electron');
// use the graphics card for the built-in renderer even on laptops Chrome would normally skip
app.commandLine.appendSwitch('ignore-gpu-blocklist');app.commandLine.appendSwitch('force_high_performance_gpu');
const path=require('path'),fs=require('fs'),os=require('os'),{spawn}=require('child_process');

let win=null, dirty=false, closing=false, pendingPath=null, renderProc=null;
const userFile=n=>path.join(app.getPath('userData'),n);
const readJSON=(f,d)=>{try{return JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){return d;}};
const writeJSON=(f,v)=>{try{fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(v,null,1));}catch(e){}};
const settings=()=>readJSON(userFile('settings.json'),{});
const setSetting=(k,v)=>{const s=settings();s[k]=v;writeJSON(userFile('settings.json'),s);};
const docsDir=()=>path.join(app.getPath('documents'),'Remodel Studio');
const projectsDir=()=>{const d=path.join(docsDir(),'Projects');fs.mkdirSync(d,{recursive:true});return d;};
const fileArg=argv=>argv.slice(1).find(a=>/\.(rsp|json)$/i.test(a)&&fs.existsSync(a))||null;

function recent(){return readJSON(userFile('recent.json'),[]).filter(r=>fs.existsSync(r.path));}
function addRecent(p,name){const r=recent().filter(x=>x.path.toLowerCase()!==p.toLowerCase());r.unshift({path:p,name:name||path.basename(p,path.extname(p)),opened:new Date().toISOString()});writeJSON(userFile('recent.json'),r.slice(0,12));try{app.addRecentDocument(p);}catch(e){}}

if(!app.requestSingleInstanceLock()){app.quit();}
else app.on('second-instance',(e,argv)=>{const f=fileArg(argv);if(!win)return;if(win.isMinimized())win.restore();win.focus();if(f)win.webContents.send('open-path',f);});
pendingPath=fileArg(process.argv);

// updates: a newer copy of the program page in Documents\Remodel Studio\app replaces the built-in one
function pagePath(){const upd=path.join(docsDir(),'app','index.html');try{if(fs.existsSync(upd)&&!settings().ignoreUpdate&&fs.statSync(upd).size>100000)return upd;}catch(e){}return path.join(__dirname,'app','index.html');}
function loadPage(){if(win)win.loadFile(pagePath());}
function createWindow(){
  const st=settings().window||{width:1600,height:1000};
  win=new BrowserWindow({width:st.width,height:st.height,x:st.x,y:st.y,minWidth:900,minHeight:600,show:false,backgroundColor:'#f4f1ea',
    title:'Remodel Studio',icon:path.join(__dirname,'build','icon.png'),autoHideMenuBar:true,
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true,spellcheck:false}});
  if(st.max)win.maximize();
  win.once('ready-to-show',()=>win.show());
  loadPage();
  // links open in the normal browser
  win.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/i.test(url))shell.openExternal(url);return {action:'deny'};});
  win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('file:')){e.preventDefault();shell.openExternal(url);}});
  // any plain browser download gets a Save As dialog
  win.webContents.session.on('will-download',(e,item)=>{item.setSaveDialogOptions({defaultPath:path.join(app.getPath('documents'),item.getFilename())});});
  const remember=()=>{if(!win||win.isMinimized())return;const b=win.getNormalBounds();setSetting('window',{...b,max:win.isMaximized()});};
  win.on('resize',remember);win.on('move',remember);
  win.on('close',e=>{
    if(closing||!dirty)return;
    e.preventDefault();
    const r=dialog.showMessageBoxSync(win,{type:'warning',buttons:['Save','Don\'t save','Cancel'],defaultId:0,cancelId:2,title:'Remodel Studio',
      message:'Save changes to this project before closing?',detail:'Your changes will be lost if you don\'t save them.'});
    if(r===0)win.webContents.send('save-then-close');
    else if(r===1){closing=true;win.close();}
  });
  win.on('closed',()=>{win=null;});
}

function buildMenu(){Menu.setApplicationMenu(Menu.buildFromTemplate([
  {label:'View',submenu:[{role:'reload',label:'Reload the program'},{role:'togglefullscreen'},{type:'separator'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{type:'separator'},{role:'toggleDevTools',label:'Developer tools'}]},
  {label:'Help',submenu:[
    {label:'Open my projects folder',click:()=>shell.openPath(projectsDir())},
    {label:'Open backups folder',click:()=>{const d=path.join(docsDir(),'Backups');fs.mkdirSync(d,{recursive:true});shell.openPath(d);}},
    {label:'Open renders folder',click:()=>{const d=path.join(docsDir(),'Renders');fs.mkdirSync(d,{recursive:true});shell.openPath(d);}},
    {label:'Use the built-in program version',type:'checkbox',checked:!!settings().ignoreUpdate,click:m=>{setSetting('ignoreUpdate',m.checked);loadPage();}},
    {type:'separator'},{label:'About Remodel Studio',click:()=>dialog.showMessageBox(win,{title:'Remodel Studio',message:'Remodel Studio '+app.getVersion(),detail:'Built for Adam. Personal use only.\nProgram page: '+pagePath()+'\nElectron '+process.versions.electron})}]}
]));}

/* ---------- file dialogs ---------- */
const PROJ_FILTERS=[{name:'Remodel Studio project',extensions:['rsp']},{name:'Older project files (.json)',extensions:['json']},{name:'All files',extensions:['*']}];
ipcMain.handle('info',()=>({version:app.getVersion(),platform:process.platform,documents:docsDir(),projects:projectsDir(),pending:pendingPath}));
ipcMain.handle('take-pending',()=>{const p=pendingPath;pendingPath=null;if(!p)return null;try{const text=fs.readFileSync(p,'utf8');addRecent(p);return {path:p,text};}catch(e){return {error:e.message};}});
ipcMain.handle('open-dialog',async()=>{
  const r=await dialog.showOpenDialog(win,{title:'Open project',defaultPath:settings().lastDir||projectsDir(),filters:PROJ_FILTERS,properties:['openFile']});
  if(r.canceled||!r.filePaths[0])return null;const p=r.filePaths[0];setSetting('lastDir',path.dirname(p));
  try{const text=fs.readFileSync(p,'utf8');addRecent(p);return {path:p,text};}catch(e){return {error:e.message};}});
ipcMain.handle('read-path',async(e,p)=>{try{const text=fs.readFileSync(p,'utf8');addRecent(p);return {path:p,text};}catch(err){return {error:err.message};}});
// every save also keeps a dated copy in Documents\Remodel Studio\Backups\<project> (newest 25, at most one per 3 minutes)
const lastBackup={};
function backup(p,text){try{const base=path.basename(p,path.extname(p)).replace(/[<>:"/\\|?*]+/g,'_');const now=Date.now();if(lastBackup[p]&&now-lastBackup[p]<180000)return;lastBackup[p]=now;
  const dir=path.join(docsDir(),'Backups',base);fs.mkdirSync(dir,{recursive:true});const d=new Date();const pad=n=>String(n).padStart(2,'0');
  fs.writeFileSync(path.join(dir,`${base} ${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}${pad(d.getMinutes())}.rsp`),text);
  const all=fs.readdirSync(dir).filter(n=>n.endsWith('.rsp')).sort();for(const n of all.slice(0,Math.max(0,all.length-25)))fs.unlinkSync(path.join(dir,n));}catch(e){}}
ipcMain.handle('auto-backup',(e,name,text)=>{try{const base=String(name||'Untitled').replace(/[<>:"/\\|?*]+/g,'_').slice(0,80);const dir=path.join(docsDir(),'Backups',base);fs.mkdirSync(dir,{recursive:true});const d=new Date();const pad=n=>String(n).padStart(2,'0');
  const f=path.join(dir,`${base} ${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}${pad(d.getMinutes())} autosave.rsp`);fs.writeFileSync(f,text);
  const all=fs.readdirSync(dir).filter(n=>n.endsWith('.rsp')).sort();for(const n of all.slice(0,Math.max(0,all.length-40)))fs.unlinkSync(path.join(dir,n));return {ok:true,path:f};}catch(err){return {ok:false,error:err.message};}});
ipcMain.handle('list-backups',()=>{const root=path.join(docsDir(),'Backups');const out=[];try{for(const d of fs.readdirSync(root)){const dir=path.join(root,d);let st;try{st=fs.statSync(dir);}catch(e){continue;}if(!st.isDirectory())continue;
  for(const n of fs.readdirSync(dir).filter(n=>n.endsWith('.rsp'))){const f=path.join(dir,n);const s2=fs.statSync(f);out.push({project:d,name:n,path:f,mtime:s2.mtimeMs,size:s2.size});}}}catch(e){}return out.sort((a,b)=>b.mtime-a.mtime).slice(0,300);});
ipcMain.handle('open-backups-folder',()=>{const root=path.join(docsDir(),'Backups');try{fs.mkdirSync(root,{recursive:true});}catch(e){}return shell.openPath(root);});
ipcMain.handle('write-path',async(e,p,text,name)=>{try{fs.writeFileSync(p+'.tmp',text);fs.renameSync(p+'.tmp',p);addRecent(p,name);backup(p,text);return {ok:true,path:p};}catch(err){return {ok:false,error:err.message};}});
ipcMain.handle('save-project-as',async(e,name,text)=>{
  const r=await dialog.showSaveDialog(win,{title:'Save project as',defaultPath:path.join(settings().lastDir||projectsDir(),name+'.rsp'),filters:PROJ_FILTERS.slice(0,1)});
  if(r.canceled||!r.filePath)return null;setSetting('lastDir',path.dirname(r.filePath));
  try{fs.writeFileSync(r.filePath,text);addRecent(r.filePath,name);backup(r.filePath,text);return {ok:true,path:r.filePath};}catch(err){return {ok:false,error:err.message};}});
ipcMain.handle('save-file',async(e,filename,data)=>{
  const ext=path.extname(filename).slice(1).toLowerCase();
  const r=await dialog.showSaveDialog(win,{title:'Save',defaultPath:path.join(settings().exportDir||docsDir(),filename),filters:ext?[{name:ext.toUpperCase()+' file',extensions:[ext]},{name:'All files',extensions:['*']}]:[]});
  if(r.canceled||!r.filePath)return {ok:false,canceled:true};setSetting('exportDir',path.dirname(r.filePath));
  try{fs.mkdirSync(path.dirname(r.filePath),{recursive:true});fs.writeFileSync(r.filePath,typeof data==='string'?data:Buffer.from(data));return {ok:true,path:r.filePath};}catch(err){return {ok:false,error:err.message};}});
ipcMain.handle('recent',()=>recent());
ipcMain.handle('forget-recent',(e,p)=>{writeJSON(userFile('recent.json'),recent().filter(x=>x.path!==p));return recent();});
ipcMain.handle('show-in-folder',(e,p)=>{shell.showItemInFolder(p);});
ipcMain.handle('open-external',(e,p)=>shell.openPath(p));
ipcMain.on('set-dirty',(e,v,title)=>{dirty=!!v;if(win&&title)win.setTitle(title);});
ipcMain.on('close-now',()=>{closing=true;if(win)win.close();});

/* ---------- Blender ---------- */
function findBlender(){
  const saved=settings().blender;if(saved&&fs.existsSync(saved))return saved;
  const roots=[process.env['ProgramFiles'],process.env['ProgramFiles(x86)'],process.env['LOCALAPPDATA']&&path.join(process.env['LOCALAPPDATA'],'Programs'),'C:\\Program Files'].filter(Boolean);
  const found=[];
  for(const r of roots){const bf=path.join(r,'Blender Foundation');if(!fs.existsSync(bf))continue;
    for(const d of fs.readdirSync(bf)){const exe=path.join(bf,d,'blender.exe');if(fs.existsSync(exe))found.push(exe);}}
  const steam=['C:\\Program Files (x86)\\Steam\\steamapps\\common\\Blender\\blender.exe'];for(const s of steam)if(fs.existsSync(s))found.push(s);
  found.sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));return found[0]||null;
}
ipcMain.handle('find-blender',()=>findBlender());
ipcMain.handle('pick-blender',async()=>{const r=await dialog.showOpenDialog(win,{title:'Find blender.exe',filters:[{name:'Blender',extensions:['exe']}],properties:['openFile']});
  if(r.canceled||!r.filePaths[0])return null;setSetting('blender',r.filePaths[0]);return r.filePaths[0];});
ipcMain.handle('render',async(e,job)=>{
  const exe=findBlender();if(!exe)return {ok:false,error:'Blender was not found. Use "Find Blender…" to point to blender.exe.'};
  if(renderProc)return {ok:false,error:'A render is already running.'};
  const safe=String(job.name||'house').replace(/[^\w\- ]+/g,'').trim()||'house';
  const stamp=new Date().toISOString().replace(/[:T]/g,'-').slice(0,16);
  const dir=path.join(docsDir(),'Renders',safe,stamp);fs.mkdirSync(dir,{recursive:true});
  for(const [n,data] of Object.entries(job.files))fs.writeFileSync(path.join(dir,n),typeof data==='string'?data:Buffer.from(data));
  const args=['-b','-P',path.join(dir,'render.py'),'--',path.join(dir,'scene.json'),...(job.args||[])];
  const started=Date.now();
  return await new Promise(resolve=>{
    renderProc=spawn(exe,args,{cwd:dir,windowsHide:true});
    const log=d=>{const s=String(d);if(win)win.webContents.send('render-log',s);};
    renderProc.stdout.on('data',log);renderProc.stderr.on('data',log);
    renderProc.on('error',err=>{renderProc=null;resolve({ok:false,error:err.message,dir});});
    renderProc.on('close',code=>{renderProc=null;
      const imgs=fs.readdirSync(dir).filter(f=>/\.png$/i.test(f)).map(f=>path.join(dir,f)).filter(f=>fs.statSync(f).mtimeMs>=started-1000);
      const images=imgs.map(f=>({path:f,name:path.basename(f,'.png'),url:'data:image/png;base64,'+fs.readFileSync(f).toString('base64')}));
      resolve({ok:images.length>0,code,dir,images,seconds:Math.round((Date.now()-started)/1000),error:images.length?null:'Blender finished without making an image (exit code '+code+').'});});
  });
});
ipcMain.handle('cancel-render',()=>{if(renderProc){try{renderProc.kill();}catch(e){}renderProc=null;return true;}return false;});

app.whenReady().then(()=>{buildMenu();createWindow();
  // self-test used when building: node ./ RS_SELFTEST=1
  if(process.env.RS_SELFTEST)win.webContents.once('did-finish-load',async()=>{
    await new Promise(r=>setTimeout(r,2500));
    const out=await win.webContents.executeJavaScript(`(async()=>{const r={};r.desk=!!window.rsDesktop;r.title=document.title;
      r.rooms=document.querySelectorAll('svg').length;r.err=window.__errs||null;
      r.brand=!!document.querySelector('.brand');r.projname=(document.querySelector('.projname')||{}).textContent;
      return r;})()`);
    console.log('SELFTEST',JSON.stringify(out),'title:',win.getTitle());
    closing=true;app.quit();});
});
app.on('window-all-closed',()=>app.quit());
