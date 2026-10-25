/* ======================= before-drywall photo record: photos pinned to the wall they show ======================= */
// Before a wall is closed up, take photos of the pipes, wires and blocking inside it and pin them to that spot on the
// wall. Years later the camera marks show on the plan and the wall elevations, and the Build page lists every photo.
I.wallphoto=RB_IC.photo;
const WP_STAGE=[['before','Before drywall'],['rough','Rough-in inspection'],['during','During work'],['after','Finished']];
function wpPoint(p,o){const w=p.walls.find(w=>w.id===o.wall);if(!w)return null;const d=wdir(w);const n={x:-d.y,y:d.x};const s=(o.side||1)*(w.thick/2+3);return {x:w.x1+(w.x2-w.x1)*o.t+n.x*s,y:w.y1+(w.y2-w.y1)*o.t+n.y*s,w};}
regObj('wallphoto',{coll:'wallphotos',label:'Wall photo',plural:'wall photos',z:21,layer:'over',hitStage:'early',planSheet:false,
  pts:(p,o)=>{const q=wpPoint(p,o);return q?[{x:q.x,y:q.y}]:[];},noBounds:true,hit:(p,o,raw,tol)=>{const q=wpPoint(p,o);return !!q&&Math.hypot(raw.x-q.x,raw.y-q.y)<=Math.max(9,(tol||6)*1.4);},
  move:(o,dx,dy)=>o,title:o=>'Wall photo'+(o.note?': '+o.note.slice(0,40):''),
  svg:(p,lv,o,S,view,isSel)=>{const q=wpPoint(p,o);if(!q)return null;const [x,y]=S(q.x,q.y);
    return html`<g className=${'wphoto'+(isSel?' sel':'')}><title>${(WP_STAGE.find(s=>s[0]===o.stage)||WP_STAGE[0])[1]} photo${o.n?` (${o.n})`:''}${o.note?': '+o.note:''}</title><rect x=${x-8} y=${y-6} width="16" height="12" rx="2.5"/><circle cx=${x} cy=${y} r="3.2"/><rect x=${x-3} y=${y-8.5} width="6" height="3" rx="1"/></g>`;},
  panel:(o,{p,up,commit})=>html`<${WallPhotoPanel} key=${o.id} o=${o} p=${p} up=${up}/>`});
function WallPhotoPanel({o,p,up}){{const q=wpPoint(p,o);const [pics,setPics]=useState([]);const [tick,setTick]=useState(0);
    useEffect(()=>{let live=true;assetList(p.id||'default').then(a=>{if(live)setPics(a.filter(x=>x.pin&&x.pin.kind==='wallphoto'&&x.pin.id===o.id));}).catch(()=>{});return ()=>{live=false;};},[o.id,tick]);
    const add=async e=>{const fs=[...e.target.files];for(const f of fs){const d=await downscale(f);await assetPut({id:uid('ph'),project:p.id||'default',kind:'photo',blob:d.blob,w:d.w,h:d.h,name:f.name,date:new Date().toISOString(),note:o.note||'',pin:{kind:'wallphoto',id:o.id}});}e.target.value='';up({n:(o.n||0)+fs.length});setTick(t=>t+1);};
    return html`<div className="sec"><h3>Wall photo</h3>${q?html`<p className="note">${fmtLen(o.t*wlen(q.w))} along this wall, ${o.side>0?'one':'the other'} side${o.z?`, ${fmtLen(o.z)} up`:''}.</p>`:null}
      <${Field} label="Stage" id="wp-st"><${Sel} id="wp-st" value=${o.stage||'before'} onChange=${v=>up({stage:v})} options=${WP_STAGE}/><//>
      <${Field} label="Height of the camera mark" id="wp-z"><${LenInput} id="wp-z" value=${o.z??48} onChange=${v=>v>=0&&up({z:v})}/><//>
      <${Field} label="Date" id="wp-d"><input id="wp-d" className="inp" type="date" value=${o.date||''} onChange=${e=>up({date:e.target.value})}/><//>
      <label className="lbl" htmlFor="wp-n">What it shows</label><textarea id="wp-n" className="inp" rows="2" value=${o.note||''} placeholder="Drain at 18 in, 12/2 to the island at 24 in, blocking for the TV" onChange=${e=>up({note:e.target.value})}></textarea>
      <div className="row"><button className="btn" onClick=${()=>up({side:-(o.side||1)})}>Other side of the wall</button><label className="btn primary" htmlFor="wp-file">Add photos…</label><input id="wp-file" type="file" accept="image/*" capture="environment" multiple hidden onChange=${add}/></div>
      <div className="wp-grid">${pics.map(a=>html`<a key=${a.id} href=${blobURL(a.id,a.blob)} target="_blank" rel="noopener"><img src=${blobURL(a.id,a.blob)} alt="Wall photo"/></a>`)}</div></div>`;}}
regTool('wallphoto',{label:'Wall photo (before drywall)',short:'Wall photo',group:'draft',icon:I.wallphoto,mode:'click',snap:'free',
  hint:()=>html`<b>Wall photo:</b> click the wall the photo shows, on the side you stood. Then add the photos in its panel.`,
  place:(ctx,[pt])=>{const p=ctx.p;let best=null;for(const w of p.walls.filter(w=>w.level===ctx.lv.id)){const pr=projSeg(pt,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});if(pr.d<w.thick/2+18&&(!best||pr.d<best.d))best={w,...pr};}
    if(!best)return null;const w=best.w;const d=wdir(w);const n={x:-d.y,y:d.x};const side=((pt.x-w.x1)*n.x+(pt.y-w.y1)*n.y)>=0?1:-1;
    const o={id:uid('wp'),level:ctx.lv.id,wall:w.id,t:Math.max(0.02,Math.min(0.98,best.tRaw)),side,z:48,stage:'before',date:localDate(),note:'',n:0};return {p:{...p,wallphotos:[...(p.wallphotos||[]),o]},sel:{kind:'wallphoto',id:o.id}};}});
addToolToGroup('draft','wallphoto','fieldpin');
// camera marks on the interior elevations
{const _ie=drawInteriorElev;drawInteriorElev=function(dl,p,IE,sc,ox,oy,k){_ie(dl,p,IE,sc,ox,oy,k);try{const list=(p.wallphotos||[]);if(!list.length)return;const H=IE.lv.height;const r=IE.room;
    for(const o of list){const q=wpPoint(p,o);if(!q||q.w.level!==r.level||!inPoly(q.x,q.y,r.pts))continue;const s=(q.x-IE.start.x)*IE.dir.x+(q.y-IE.start.y)*IE.dir.y;if(s<-2||s>IE.len+2)continue;
      const off=(q.x-IE.start.x)*(-IE.dir.y)+(q.y-IE.start.y)*IE.dir.x;if(Math.abs(off)>q.w.thick+12)continue;// only the wall it is pinned to
      const x=ox+s*sc,y=oy+(H-(o.z??48))*sc,c=0.06*k;dl.poly([[x-c,y-c*0.7],[x+c,y-c*0.7],[x+c,y+c*0.7],[x-c,y+c*0.7]],{stroke:'#7c3aed',w:0.6,fill:'#ffffff'});dl.circle(x,y,c*0.4,{stroke:'#7c3aed',w:0.5});
      dl.text(x+c*1.4,y+c*0.4,`PHOTO ${o.date||''}`,{size:4.2*k,color:'#7c3aed'});}}catch(e){console.warn('wall photo marks',e);}};}
// Build page: every wall photo, and walls with rough-in work that have no photo yet
function WallPhotosView({p,commit,setSel,setMode,setLevelId}){const [assets,setAssets]=useState(null);
  useEffect(()=>{let live=true;assetList(p.id||'default').then(a=>{if(live)setAssets(a.filter(x=>x.pin&&x.pin.kind==='wallphoto'));}).catch(()=>setAssets([]));return ()=>{live=false;};},[p.wallphotos]);
  const list=p.wallphotos||[];const roomOf=o=>{const q=wpPoint(p,o);return q?(p.rooms.find(r=>r.level===q.w.level&&inPoly(q.x,q.y,r.pts))||{}).name||'Outside':'';};
  const need=[];for(const w of p.walls.filter(w=>w.status!=='demolish')){const near=pt=>projSeg(pt,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2}).d<w.thick/2+2;
    const work=(p.elec||[]).some(d=>d.level===w.level&&d.status!=='existing'&&near(d))||(p.pipes||[]).some(o=>o.level===w.level&&o.pts.some(([x,y])=>near({x,y})));if(work&&!list.some(o=>o.wall===w.id))need.push(w);}
  const show=o=>{const q=wpPoint(p,o);if(q)setLevelId&&setLevelId(q.w.level);setMode('design');setTimeout(()=>setSel({kind:'wallphoto',id:o.id}),60);};
  return html`<div><div className="mathead"><div><h2>Wall photos</h2><p className="note">Photos of what is inside each wall, pinned where they were taken. Add one with the Wall photo tool (Design › Annotate), click the wall, then add photos in its panel.</p></div></div>
    ${need.length?html`<section className="sec warnbox"><h3>Walls with new wiring or piping and no photo yet</h3><p className="note">Take these before the insulation and drywall go up.</p><ul>${need.map(w=>{const lv=lvlOf(p,w.level);const rs=p.rooms.filter(r=>r.level===w.level&&(inPoly((w.x1+w.x2)/2+3,(w.y1+w.y2)/2+3,r.pts)||inPoly((w.x1+w.x2)/2-3,(w.y1+w.y2)/2-3,r.pts))).map(r=>r.name);return html`<li key=${w.id}>${rs.join(' / ')||'Wall'} · ${fmtLen(wlen(w))} · ${lv?lv.name:''}</li>`;})}</ul></section>`:null}
    ${list.length?html`<div className="wp-list">${list.map(o=>{const a=(assets||[]).filter(x=>x.pin.id===o.id);return html`<section key=${o.id} className="sec wp-card"><header><b>${roomOf(o)}</b> <span className="pill">${(WP_STAGE.find(s=>s[0]===o.stage)||WP_STAGE[0])[1]}</span> <span className="note">${o.date||''}</span><span className="spacer"></span><button className="btn small" onClick=${()=>show(o)}>Show on the plan</button></header>
      ${o.note?html`<p>${o.note}</p>`:null}<div className="wp-grid">${a.map(x=>html`<a key=${x.id} href=${blobURL(x.id,x.blob)} target="_blank" rel="noopener"><img src=${blobURL(x.id,x.blob)} alt="Wall photo"/></a>`)}${assets&&!a.length?html`<p className="note">No photos added to this mark yet.</p>`:null}</div></section>`;})}</div>`
      :html`<p className="note">No wall photos yet.</p>`}</div>`;}
BUILD_TABS.push(['photos','Wall photos',WallPhotosView]);
