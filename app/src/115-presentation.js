/* ======================= board presentation ======================= */
// Off-screen 3D snapshots, then a 16:9 slide deck as a PDF: cover, before and after, saved views,
// design options side by side, floor plans, cost and code status.
let snapR=null;
function snapRenderer(w,h){if(!snapR){snapR=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});snapR.shadowMap.enabled=true;snapR.shadowMap.type=THREE.PCFSoftShadowMap;}snapR.setPixelRatio(1);snapR.setSize(w,h,false);return snapR;}
function renderSnapshot(p,{view=null,layer='proposed',w=1600,h=900,angle='aerial',levelId=null}={}){
  const R=snapRenderer(w,h);const scene=new THREE.Scene();scene.background=new THREE.Color(0xdfe8ef);
  const hemi=new THREE.HemisphereLight(0xeef4ff,0x8a8a78,0.42);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff4e2,0.62);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-0.0004;scene.add(sun);scene.add(sun.target);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshStandardMaterial({color:0xc9cfb8,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-0.02;ground.receiveShadow=true;scene.add(ground);
  const st={model:new THREE.Group(),sun,hemi,camera:new THREE.PerspectiveCamera(45,w/h,0.3,2000)};scene.add(st.model);
  const lvls=sortedLevels(p);const lid=view&&view.walk?view.walk.level:view&&view.level?view.level:levelId||lvls[lvls.length-1].id;
  const walk=view&&view.walk;
  buildModel(st,p,lid,null,{cutaway:walk?true:view?!!view.cutaway&&view.cutaway:false,showRoof:walk?true:view?view.showRoof!==false:angle!=='dollhouse',layer,interior:!!walk});
  ground.position.y=(st.groundY||0)-0.02;
  applySun(st,{on:false});
  const cam=st.camera;
  if(walk){const lv=lvlOf(p,walk.level)||lvls[0];st.walk={pos:{x:walk.x,y:walk.y},yaw:walk.yaw,pitch:walk.pitch||0};placeWalkCam(st,lv);}
  else if(view){cam.position.fromArray(view.pos);cam.fov=view.fov||45;cam.updateProjectionMatrix();cam.lookAt(new THREE.Vector3().fromArray(view.tgt||[0,0,0]));}
  else{const box=new THREE.Box3().setFromObject(st.model);if(!box.isEmpty()){const c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3());const r=Math.max(sz.x,sz.y,sz.z)*0.5+3;
      const vf=cam.fov*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*cam.aspect);const d=r/Math.sin(Math.min(vf,hf)/2)*0.85;
      const dir=angle==='street'?new THREE.Vector3(-0.15,0.18,1):angle==='dollhouse'?new THREE.Vector3(-0.45,0.85,0.6):new THREE.Vector3(-0.55,0.55,0.65);dir.normalize();
      cam.position.copy(c).addScaledVector(dir,d);if(angle==='street')cam.position.y=Math.max(cam.position.y,5.5);cam.lookAt(c);}}
  applyMetalEnv(st.model,R);R.render(scene,cam);const url=R.domElement.toDataURL('image/jpeg',0.9);
  st.model.traverse(o=>{if(o.geometry)o.geometry.dispose();});return url;
}
const PRES_DEFAULT={title:'',subtitle:'Remodel plan for board review',presenter:'',sections:{cover:true,beforeAfter:true,renders:true,views:true,options:true,plans:true,cost:true,code:true,structure:true},notes:''};
function presOf(p){return {...PRES_DEFAULT,...(p.present||{}),sections:{...PRES_DEFAULT.sections,...((p.present||{}).sections||{})}};}
function hasExisting(p){return p.walls.some(w=>w.status==='existing'||w.status==='demolish');}
async function buildPresentation(p,onProgress){
  await loadJsPDF();const {jsPDF}=window.jspdf;const P=presOf(p);const W=13.333,H=7.5;const d=new jsPDF({orientation:'landscape',unit:'in',format:[W,H]});let page=0;
  const ACC='#1f5fbf';const title=P.title||p.name||'Remodel plan';
  const newPage=(heading,sub)=>{if(page++)d.addPage([W,H],'landscape');d.setFillColor(ACC);d.rect(0,0,0.18,H,'F');
    if(heading){d.setFont('helvetica','bold');d.setFontSize(24);d.setTextColor('#111111');d.text(heading,0.6,0.75);if(sub){d.setFont('helvetica','normal');d.setFontSize(12);d.setTextColor('#555555');d.text(sub,0.6,1.08);}}
    d.setFont('helvetica','normal');d.setFontSize(9);d.setTextColor('#777777');d.text(title+(p.info?.address?'  ·  '+p.info.address:''),0.6,H-0.35);d.text(String(page),W-0.5,H-0.35,{align:'right'});d.setTextColor('#111111');};
  const img=(url,x,y,w,h,cap)=>{d.addImage(url,'JPEG',x,y,w,h);d.setDrawColor('#cccccc');d.setLineWidth(0.01);d.rect(x,y,w,h);if(cap){d.setFont('helvetica','bold');d.setFontSize(12);d.setTextColor('#111111');d.text(cap,x,y+h+0.3);}};
  const wrap=(t,x,y,w,size=11,lh=1.4)=>{d.setFontSize(size);const lines=d.splitTextToSize(String(t),w);d.text(lines,x,y);return y+lines.length*size/72*lh;};
  const step=async t=>{onProgress&&onProgress(t);await new Promise(r=>setTimeout(r,0));};
  const est=estimateOf(p);const iss=runChecks(p);const nE=iss.filter(i=>i.sev==='error').length,nW=iss.filter(i=>i.sev==='warn').length;
  // cover
  if(P.sections.cover){await step('Cover');newPage();const hero=renderSnapshot(p,{w:1800,h:Math.round(1800*H*0.62/(W-0.18)),angle:'aerial'});d.addImage(hero,'JPEG',0.18,0,W-0.18,H*0.62);
    d.setFont('helvetica','bold');d.setFontSize(34);d.setTextColor('#111111');d.text(title,0.6,H*0.62+0.8);d.setFont('helvetica','normal');d.setFontSize(16);d.setTextColor('#444444');
    d.text([P.subtitle,p.info?.address].filter(Boolean).join('  ·  '),0.6,H*0.62+1.25);d.setFontSize(12);d.text([P.presenter&&('Presented by '+P.presenter),new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})].filter(Boolean).join('  ·  '),0.6,H*0.62+1.65);
    const area=Math.round(p.rooms.reduce((s,r)=>s+polyArea(r.pts),0)/144);d.setFont('helvetica','bold');d.setFontSize(14);d.setTextColor(ACC);
    d.text(`${area.toLocaleString()} sq ft   ·   ${money(est.total)} planning estimate   ·   ${nE?nE+' code items to resolve':'no code failures found'}`,0.6,H*0.62+2.15);}
  // before and after
  if(P.sections.beforeAfter&&hasExisting(p)){await step('Before and after');newPage('Before and after','Existing building compared with the proposed remodel');
    const a=renderSnapshot(p,{layer:'existing',w:1200,h:800,angle:'dollhouse'});const b=renderSnapshot(p,{layer:'proposed',w:1200,h:800,angle:'dollhouse'});
    img(a,0.6,1.4,5.9,3.93,'Existing');img(b,6.85,1.4,5.9,3.93,'Proposed');
    const demo=p.walls.filter(w=>w.status==='demolish').length,nw=p.walls.filter(w=>(w.status||'new')==='new').length;d.setFont('helvetica','normal');d.setFontSize(11);d.setTextColor('#444444');
    d.text(`${demo} wall${demo===1?'':'s'} removed, ${nw} new wall${nw===1?'':'s'}, ${p.openings.filter(o=>(o.status||'new')==='new').length} new doors and windows.`,0.6,6.2);}
  // photoreal renders from the gallery
  if(P.sections.renders){let rn=[];try{rn=(await assetList(p.id||'default')).filter(a=>a.kind==='render').sort((a,b)=>String(a.date).localeCompare(String(b.date)));}catch(e){}
    for(const a of rn){await step('Render: '+a.name);newPage(rn.indexOf(a)?'Renderings (continued)':'Renderings','Photoreal renders of the proposed design');const ar=(a.w||16)/(a.h||9);let w=12.1,h=w/ar;if(h>5.4){h=5.4;w=h*ar;}img(a.url,(W-w)/2,1.35,w,h,a.name);}}
  // saved views
  if(P.sections.views){const vs=(p.views||[]);if(vs.length){for(let i=0;i<vs.length;i+=2){await step('Views '+(i+1));newPage(i?'Views (continued)':'Views of the design');
      const two=vs.slice(i,i+2);if(two.length===1){img(renderSnapshot(p,{view:two[0],w:1600,h:900}),0.6,1.3,10,5.625,two[0].name);}
      else two.forEach((v,j)=>img(renderSnapshot(p,{view:v,w:1200,h:800}),0.6+j*6.25,1.4,5.9,3.93,v.name));}}
    else{await step('Views');newPage('Views of the design');img(renderSnapshot(p,{w:1200,h:800,angle:'aerial'}),0.6,1.4,5.9,3.93,'Overall');img(renderSnapshot(p,{w:1200,h:800,angle:'dollhouse'}),6.85,1.4,5.9,3.93,'Inside, roof removed');}}
  // options
  const q=ensureOptions(p);if(P.sections.options&&q.options.length>1){await step('Options');newPage('Design options','Same view and same prices for each option');const n=Math.min(3,q.options.length);const w=(W-1.2-(n-1)*0.3)/n;
    q.options.slice(0,3).forEach((o,i)=>{const pp=optionProject(q,o);const e=estimateOf(pp);const x=0.6+i*(w+0.3);img(renderSnapshot(pp,{w:1100,h:780,angle:'dollhouse'}),x,1.4,w,w*0.71,o.name);
      d.setFont('helvetica','normal');d.setFontSize(11);d.setTextColor('#333333');let y=1.4+w*0.71+0.6;const fails=runChecks(pp).filter(i=>i.sev==='error').length;
      for(const t of [`Area: ${Math.round(e.area).toLocaleString()} sq ft`,`Estimate: ${money(e.total)}`,`Labor: about ${Math.round(e.totalH)} hours`,`Code items to resolve: ${fails}`]){d.text(t,x,y);y+=0.26;}});}
  // plans
  if(P.sections.plans){for(const lv of sortedLevels(p)){if(!p.walls.some(w=>w.level===lv.id))continue;await step('Plan '+lv.name);newPage(lv.name+' plan','Proposed layout');
      const pp=filteredProject(p,'proposed');const B=planBounds(pp,lv.id);const k=1.0;const R=1.0;const aw=W-1.2-2*R,ah=H-1.9-2*R;const sc=Math.min(aw/(B.x1-B.x0),ah/(B.y1-B.y0));
      const dl=DL();const ox=0.6+R+(aw-(B.x1-B.x0)*sc)/2,oy=1.35+R+(ah-(B.y1-B.y0)*sc)/2;drawPlan(dl,pp,lv,sc,ox,oy,B,k,openingMarks(p));drawSheetItems(d,dl.items);}}
  // cost
  if(P.sections.cost){await step('Cost');newPage('Planning estimate',activeOptionName(p)?'For '+activeOptionName(p):'Materials, labor and allowances');let y=1.6;
    const row=(t,v,b)=>{d.setFont('helvetica',b?'bold':'normal');d.setFontSize(b?16:13);d.setTextColor('#111111');d.text(t,0.8,y);d.text(v,7.2,y,{align:'right'});y+=b?0.5:0.38;};
    row('Materials'+(est.unpriced?` (${est.priced} of ${est.rows.length} items priced)`:''),money(est.mat));row(`Sales tax, ${est.E.tax}%`,money(est.tax));row('Labor',est.E.selfLabor?'self-performed':money(est.laborCost));
    if(est.dumps)row('Dumpsters',money(est.dump));if(est.permit)row('Permit',money(est.permit));for(const x of est.extras)row(x.name,money(+x.cost));if(!est.E.selfLabor)row(`Overhead and profit, ${est.E.markup}%`,money(est.markup));row(`Contingency, ${est.E.contingency}%`,money(est.cont));
    d.setDrawColor('#999999');d.line(0.8,y-0.2,7.2,y-0.2);y+=0.1;row('Total',money(est.total),true);
    d.setFont('helvetica','normal');d.setFontSize(11);d.setTextColor('#555555');wrap(`${est.perSF?money(est.perSF)+' per square foot. ':''}About ${Math.round(est.totalH)} labor hours. Planning-level estimate from the model's material list and typical production rates; get contractor quotes before approving funds.`,8,1.6,4.6);
    if(q.options.length>1){let y2=3.4;d.setFont('helvetica','bold');d.setFontSize(13);d.setTextColor('#111111');d.text('By option',8,y2);y2+=0.35;d.setFont('helvetica','normal');d.setFontSize(12);
      for(const o of q.options){const e=estimateOf(optionProject(q,o));d.text(o.name,8,y2);d.text(money(e.total),12.6,y2,{align:'right'});y2+=0.32;}}}
  // code
  if(P.sections.code){await step('Code');newPage('Code and accessibility review',`Checked against the ${p.settings?.code==='ibc'?'2021 IBC':'2021 IRC'}${p.settings?.code==='ibc'||p.settings?.ada!==false?' and the 2010 ADA Standards':''}`);
    d.setFont('helvetica','bold');d.setFontSize(40);d.setTextColor(nE?'#c0392b':'#2e7d32');d.text(String(nE),0.8,2.3);d.setFontSize(14);d.text('to resolve',0.8,2.65);
    d.setTextColor('#b7791f');d.setFontSize(40);d.text(String(nW),3.2,2.3);d.setFontSize(14);d.text('to review',3.2,2.65);
    let y=3.3;d.setTextColor('#111111');for(const i of iss.slice(0,12)){d.setFont('helvetica','bold');d.setFontSize(11);d.text((i.sev==='error'?'Resolve: ':'Review: ')+i.title,0.8,y);d.setFont('helvetica','normal');d.setFontSize(9);d.setTextColor('#555555');
      d.text(d.splitTextToSize((i.rule?`${i.rule.set} ${i.rule.code}. `:'')+(i.detail||''),11.6)[0],0.8,y+0.18);d.setTextColor('#111111');y+=0.42;if(y>H-0.8)break;}
    if(!iss.length){d.setFont('helvetica','normal');d.setFontSize(14);d.text('No problems were found in the planning check.',0.8,3.3);}}
  // structure
  if(P.sections.structure){const M=analyzeStructure(p);const over=M.filter(m=>m.ratio>1),beams=M.filter(m=>m.beam);if(over.length||beams.length){await step('Structure');newPage('Structure','Members that need attention (planning level; an engineer confirms)');let y=1.7;
    for(const m of [...beams,...over].slice(0,14)){d.setFont('helvetica','bold');d.setFontSize(12);d.text(m.label,0.8,y);d.setFont('helvetica','normal');d.setFontSize(11);d.setTextColor('#444444');
      d.text(m.beam?`Span ${fmtLen(m.span)}, about ${m.load}. Suggested: ${m.suggest}.`:`${m.size} over ${fmtLen(m.span)} is at ${Math.round(m.ratio*100)}% of capacity. ${m.suggest?'Suggested: '+m.suggest+'.':''}`,0.8,y+0.24);d.setTextColor('#111111');y+=0.62;}}}
  if(P.notes){await step('Notes');newPage('Notes');d.setFont('helvetica','normal');d.setTextColor('#222222');wrap(P.notes,0.8,1.7,11.6,14,1.5);}
  d.setProperties({title:title+' presentation',creator:'Remodel Studio'});return d;
}
function PresentationView({p,commit}){
  const P=presOf(p);const upd=patch=>commit({...p,present:{...(p.present||{}),...patch}});const sec=(k,v)=>upd({sections:{...P.sections,[k]:v}});
  const [busy,setBusy]=useState(null);const [msg,setMsg]=useState(null);const [preview,setPreview]=useState(null);
  const make=async()=>{setMsg(null);setBusy('Starting');try{const d=await buildPresentation(p,setBusy);setBusy('Saving');setMsg(await saveFile(safeName(p.name)+' presentation.pdf',d.output('blob')));}catch(e){console.error(e);setMsg({ok:false,t:'The presentation could not be made: '+(e.message||e)});}setBusy(null);};
  const peek=()=>{try{setPreview({a:renderSnapshot(p,{w:800,h:500,angle:hasExisting(p)?'dollhouse':'aerial'}),b:hasExisting(p)?renderSnapshot(p,{w:800,h:500,layer:'existing',angle:'dollhouse'}):null});}catch(e){setMsg({ok:false,t:'3D preview needs WebGL.'});}};
  const S=[['cover','Cover with a street view, area, cost and code status'],['beforeAfter','Before and after (existing vs. proposed)'],['renders','Photoreal renders in the gallery (Render in the 3D view)'],['views','Your saved 3D views (save them from the 3D view)'],['options','Design options side by side'],['plans','Floor plans'],['cost','Planning estimate'],['code','Code and accessibility review'],['structure','Structure items that need attention']];
  return html`<div className="matview"><div className="matinner presview">
    <div className="mathead"><div><h2>Board presentation</h2><p className="note">A widescreen PDF to show on a projector or hand out. It uses the active design option, your saved views, the estimate and the code check.</p></div></div>
    <div className="estgrid">
      <section className="estcard"><h3>Title</h3>
        <${Field} label="Title" id="pr-title"><input id="pr-title" className="inp" value=${P.title} placeholder=${p.name} onChange=${e=>upd({title:e.target.value})}/><//>
        <${Field} label="Subtitle" id="pr-sub"><input id="pr-sub" className="inp" value=${P.subtitle} onChange=${e=>upd({subtitle:e.target.value})}/><//>
        <${Field} label="Presented by" id="pr-by"><input id="pr-by" className="inp" value=${P.presenter} placeholder="Name, Public Works Director" onChange=${e=>upd({presenter:e.target.value})}/><//>
        <label className="note" htmlFor="pr-notes">Closing notes (optional)</label><textarea id="pr-notes" className="inp" rows="4" value=${P.notes} placeholder="Recommendation, schedule, funding source…" onChange=${e=>upd({notes:e.target.value})}></textarea></section>
      <section className="estcard"><h3>Slides</h3>${S.map(([k,l])=>html`<label key=${k} className="check"><input type="checkbox" id=${'pr-s-'+k} checked=${P.sections[k]} onChange=${e=>sec(k,e.target.checked)}/> ${l}</label>`)}
        <p className="note">${(p.views||[]).length} saved view${(p.views||[]).length===1?'':'s'} · ${ensureOptions(p).options.length} design option${ensureOptions(p).options.length===1?'':'s'}${hasExisting(p)?'':' · no existing walls marked, so before and after is skipped'}</p>
        <div className="row"><button className="btn primary" disabled=${!!busy} onClick=${make}>${busy?'Making: '+busy+'…':'Make presentation PDF'}</button><button className="btn" onClick=${peek}>Preview the cover image</button></div>
        ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}</section>
    </div>
    ${preview?html`<div className="presprev">${preview.b?html`<figure><img src=${preview.b} alt="Existing"/><figcaption>Existing</figcaption></figure>`:null}<figure><img src=${preview.a} alt="Proposed"/><figcaption>${preview.b?'Proposed':'Cover image'}</figcaption></figure></div>`:null}
  </div></div>`;
}
