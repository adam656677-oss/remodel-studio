/* ======================= field mode: pins for existing conditions, punch items and questions; room measuring checklist; tracing a wall from a photo ======================= */
const CAPTURE_EXTRA=[];
const PIN_KINDS={condition:['Existing condition','C','#c0582b'],punch:['Punch item','P','#2463c4'],question:['Question','?','#7a4bc4'],photo:['Photo spot','●','#2b8a57']};
const PIN_TRADES=[['','Any trade'],...TRADES.map(t=>[t[0],t[1]])];
regObj('fieldpin',{coll:'fieldpins',label:'Field pin',plural:'field pins',z:20,layer:'over',hitStage:'early',planSheet:false,
  pts:(p,o)=>[{x:o.x,y:o.y}],noBounds:true,hit:(p,o,raw,tol)=>Math.hypot(raw.x-o.x,raw.y-o.y)<=Math.max(10,(tol||6)*1.5),
  move:(o,dx,dy)=>({...o,x:o.x+dx,y:o.y+dy}),title:o=>(PIN_KINDS[o.cat]||PIN_KINDS.condition)[0]+(o.text?': '+o.text.slice(0,40):''),
  svg:(p,lv,o,S,view,isSel)=>{if(p.settings?.field?.hidePins)return null;const [x,y]=S(o.x,o.y);const K=PIN_KINDS[o.cat]||PIN_KINDS.condition;const done=o.cat==='punch'&&o.status==='done';
    return html`<g className=${'fieldpin'+(isSel?' sel':'')+(done?' done':'')}><path d=${`M${x} ${y} l-7 -12 a8 8 0 1 1 14 0 z`} fill=${done?'#8a8f96':K[2]}/><text x=${x} y=${y-13.5} textAnchor="middle" className="pin-l">${done?'✓':K[1]}</text>
      ${view.s>0.5&&o.text?html`<text x=${x+10} y=${y-14} className="pin-t">${o.text.slice(0,28)}</text>`:null}</g>`;},
  panel:(o,{p,up})=>{const K=PIN_KINDS[o.cat]||PIN_KINDS.condition;const add=async e=>{for(const f of e.target.files){const d=await downscale(f);await assetPut({id:uid('ph'),project:p.id||'default',kind:'photo',blob:d.blob,w:d.w,h:d.h,name:f.name,date:new Date().toISOString(),note:o.text||'',pin:{kind:'fieldpin',id:o.id}});}e.target.value='';up({photos:(o.photos||0)+e.target.files.length});};
    return html`<div className="sec field-panel"><h3>${K[0]}</h3>
      <${Field} label="Type" id="fp-c"><${Sel} id="fp-c" value=${o.cat||'condition'} onChange=${v=>up({cat:v})} options=${Object.entries(PIN_KINDS).map(([k,v])=>[k,v[0]])}/><//>
      <label className="lbl" htmlFor="fp-t">Note</label><textarea id="fp-t" className="inp" rows="3" value=${o.text||''} placeholder="What did you find, or what needs doing?" onChange=${e=>up({text:e.target.value})}></textarea>
      ${o.cat==='punch'?html`<div className="grid2"><${Field} label="Status" id="fp-s"><${Sel} id="fp-s" value=${o.status||'open'} onChange=${v=>up({status:v,doneDate:v==='done'?new Date().toISOString().slice(0,10):null})} options=${[['open','Open'],['progress','In progress'],['done','Done']]}/><//>
        <${Field} label="Trade" id="fp-tr"><${Sel} id="fp-tr" value=${o.trade||''} onChange=${v=>up({trade:v})} options=${PIN_TRADES}/><//><${Field} label="Due" id="fp-d"><input id="fp-d" type="date" className="inp" value=${o.due||''} onChange=${e=>up({due:e.target.value})}/><//><${Field} label="Assigned to" id="fp-a"><input id="fp-a" className="inp" value=${o.who||''} onChange=${e=>up({who:e.target.value})}/><//></div>`:null}
      ${o.cat==='condition'?html`<${Field} label="Severity" id="fp-sv"><${Sel} id="fp-sv" value=${o.sev||'note'} onChange=${v=>up({sev:v})} options=${[['note','Note'],['repair','Needs repair'],['hazard','Safety hazard']]}/><//>`:null}
      <div className="row"><label className="btn primary" htmlFor="fp-ph">Take or add photo</label><input id="fp-ph" type="file" accept="image/*" capture="environment" multiple hidden onChange=${add}/></div>
      <p className="note">Photos taken here are pinned to this spot and show below.</p></div>`;}});
I.fieldpin=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>`;
let PIN_PRESET={cat:'condition'};
regTool('fieldpin',{label:'Field pin (condition, punch, question)',short:'Pin',group:'draft',icon:I.fieldpin,mode:'click',
  hint:()=>html`<b>Field pin:</b> tap where something is: a crack, a soft floor, a leak, a punch item or a question. Add a photo and a note in its panel.`,
  place:(ctx,[pt])=>{const o={id:uid('fp'),level:ctx.lv.id,x:pt.x,y:pt.y,cat:PIN_PRESET.cat,text:'',status:'open',date:new Date().toISOString().slice(0,10)};return {p:{...ctx.p,fieldpins:[...(ctx.p.fieldpins||[]),o]},sel:{kind:'fieldpin',id:o.id}};}});
addToolToGroup('draft','fieldpin');
const pinRoom=(p,o)=>{const r=p.rooms.find(r=>r.level===o.level&&inPoly(o.x,o.y,r.pts));return r?r.name:'';};
function punchCSV(p){const q=s=>'"'+String(s??'').replace(/"/g,'""')+'"';const L=[['#','Type','Room','Note','Status','Trade','Assigned','Due','Date'].map(q).join(',')];(p.fieldpins||[]).forEach((o,i)=>L.push([i+1,(PIN_KINDS[o.cat]||PIN_KINDS.condition)[0],pinRoom(p,o),o.text,o.cat==='punch'?o.status||'open':'',TRADE_LABEL[o.trade]||'',o.who||'',o.due||'',o.date||''].map(q).join(',')));return L.join('\n');}
async function punchPDF(p,list){await loadJsPDF();const {jsPDF}=window.jspdf;const d=new jsPDF({unit:'in',format:'letter'});let y=0.8;const T=(t,x,b,sz=9.5)=>{d.setFont('helvetica',b?'bold':'normal');d.setFontSize(sz);d.text(String(t),x,y);};
  T('Field notes and punch list',0.6,true,16);y+=0.26;T((p.name||'Project')+' · '+new Date().toLocaleDateString(),0.6,false,10);y+=0.35;
  const photos=(await assetList(p.id||'default')).filter(a=>a.kind==='photo'&&a.pin&&a.pin.kind==='fieldpin');
  for(const [i,o] of list.entries()){if(y>9.6){d.addPage();y=0.7;}const K=PIN_KINDS[o.cat]||PIN_KINDS.condition;T(`${i+1}. ${K[0]}${o.cat==='punch'?' · '+(o.status||'open'):''}${pinRoom(p,o)?' · '+pinRoom(p,o):''}`,0.6,true,10);y+=0.18;
    for(const ln of d.setFontSize(9.5).splitTextToSize(o.text||'(no note)',7)){T(ln,0.8);y+=0.16;}const meta=[o.trade?TRADE_LABEL[o.trade]:'',o.who,o.due?'due '+o.due:''].filter(Boolean).join(' · ');if(meta){T(meta,0.8,false,8.5);y+=0.16;}
    const ph=photos.filter(a=>a.pin.id===o.id).slice(0,3);if(ph.length){let x=0.8;for(const a of ph){try{const url=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(a.blob);});const w=2.1,h=w*(a.h||3)/(a.w||4);if(y+h>10.3){d.addPage();y=0.7;}d.addImage(url,'JPEG',x,y,w,h);x+=w+0.15;}catch(e){}}y+=1.7;}y+=0.12;}
  return d.output('blob');}

/* ---- room measuring checklist: field numbers against the model ---- */
function roomWalls(p,r){const pts=r.pts.map(([x,y])=>({x,y}));return p.walls.filter(w=>w.level===r.level&&w.status!=='demolish').filter(w=>{const m={x:(w.x1+w.x2)/2,y:(w.y1+w.y2)/2};let best=1e9;for(let i=0;i<pts.length;i++)best=Math.min(best,segDistPt(m,pts[i],pts[(i+1)%pts.length]));return best<=w.thick/2+3&&wlen(w)>6;});}
// room sides as you would tape them: wall face to wall face
function roomEdges(p,r){const P=r.pts.map(([x,y])=>({x,y}));const walls=p.walls.filter(w=>w.level===r.level&&w.status!=='demolish');const n=P.length;
  const wallOn=(a,b)=>{const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};let best=null,bd=1e9;for(const w of walls){const d=segDistPt(m,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});if(d<bd){bd=d;best=w;}}return bd<=12?best:null;};
  const ws=P.map((a,i)=>wallOn(a,P[(i+1)%n]));const dirs=['N','NE','E','SE','S','SW','W','NW'];
  return P.map((a,i)=>{const b=P[(i+1)%n];const L=dist(a,b);const prev=ws[(i+n-1)%n],next=ws[(i+1)%n];const inside=Math.max(0,L-(prev?prev.thick/2:0)-(next?next.thick/2:0));
    const c=polyLabelPt(r.pts);const m={x:(a.x+b.x)/2-c[0],y:(a.y+b.y)/2-c[1]};const deg=(Math.atan2(m.x,-m.y)*180/Math.PI+(siteOf(p).bearing||0)+360)%360;return {a,b,inside:Math.round(inside*4)/4,dir:dirs[Math.round(deg/45)%8]};}).filter(e=>e.inside>6);}
function FieldView({p,commit,setSel,setMode}){const F=p.field||{};const meas=F.meas||{};const setF=patch=>commit({...p,field:{...F,...patch}});const setM=(k,v)=>setF({meas:{...meas,[k]:v}});
  const [filter,setFilter]=useState('all');const [roomId,setRoomId]=useState((p.rooms[0]||{}).id);const [msg,setMsg]=useState(null);const pins=p.fieldpins||[];
  const shown=pins.filter(o=>filter==='all'||(filter==='open'?o.cat==='punch'&&o.status!=='done':filter==='done'?o.cat==='punch'&&o.status==='done':o.cat===filter));
  const up=(id,patch)=>commit({...p,fieldpins:pins.map(o=>o.id===id?{...o,...patch}:o)});const go=o=>{setSel({kind:'fieldpin',id:o.id});setMode('plan');};
  const room=p.rooms.find(r=>r.id===roomId);const walls=room?roomWalls(p,room):[];const ops=room?p.openings.filter(o=>walls.some(w=>w.id===o.wall)):[];const lv=room?lvlOf(p,room.level):null;
  const mk=useMemo(()=>{try{return openingMarks(p)||{};}catch(e){return {};}},[p.openings]);const markOf=o=>{const m=mk[o.id];return m?(typeof m==='string'?m:m.mark||m.label||''):'';};
  const items=room?[...roomEdges(p,room).map((e,i)=>({k:'e:'+room.id+':'+i,label:`Wall ${i+1} (${e.dir})`,model:e.inside})),{k:'h:'+room.id,label:'Ceiling height',model:lv?lv.height:96},...ops.flatMap(o=>[{k:'ow:'+o.id,label:`${o.type==='door'?'Door':'Window'} ${markOf(o)} width`,model:o.width},{k:'oh:'+o.id,label:`${o.type==='door'?'Door':'Window'} ${markOf(o)} height`,model:o.height},...(o.type==='window'?[{k:'os:'+o.id,label:`Window ${markOf(o)} sill`,model:o.sill}]:[])])]:[];
  const doneN=items.filter(it=>meas[it.k]!=null).length;
  const pickPin=c=>{PIN_PRESET={cat:c};window.__app.setTool('fieldpin');setMode('plan');};
  return html`<div className="fieldview">
    <section className="fv-card"><h3>Drop a pin on the plan</h3><p className="note">Tap a kind, then tap the plan where it is. Each pin holds a note and photos from your phone camera.</p>
      <div className="fv-btns">${Object.entries(PIN_KINDS).map(([k,v])=>html`<button key=${k} className="btn big" onClick=${()=>pickPin(k)}><span className="pin-dot" style=${{background:v[2]}}>${v[1]}</span>${v[0]}</button>`)}</div></section>
    <section className="fv-card"><div className="row"><h3>Pins and punch list</h3><span className="spacer"></span><button className="btn" disabled=${!pins.length} onClick=${async()=>setMsg(await saveFile(safeName(p.name)+' punch list.csv',punchCSV(p)))}>CSV</button><button className="btn primary" disabled=${!shown.length} onClick=${async()=>{try{setMsg(await saveFile(safeName(p.name)+' punch list.pdf',await punchPDF(p,shown)));}catch(e){setMsg({ok:false,t:e.message});}}}>PDF with photos</button></div>
      ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
      <div className="seg">${[['all','All'],['condition','Conditions'],['open','Punch: open'],['done','Punch: done'],['question','Questions']].map(([k,l])=>html`<button key=${k} className=${filter===k?'on':''} onClick=${()=>setFilter(k)}>${l} (${(k==='all'?pins:pins.filter(o=>k==='open'?o.cat==='punch'&&o.status!=='done':k==='done'?o.cat==='punch'&&o.status==='done':o.cat===k)).length})</button>`)}</div>
      ${shown.length?html`<ul className="pinlist">${shown.map(o=>{const K=PIN_KINDS[o.cat]||PIN_KINDS.condition;return html`<li key=${o.id}><span className="pin-dot" style=${{background:o.cat==='punch'&&o.status==='done'?'#8a8f96':K[2]}}>${K[1]}</span>
        <button className="linkish" onClick=${()=>go(o)}><b>${o.text||'(no note yet)'}</b><small>${[K[0],pinRoom(p,o),o.trade?TRADE_LABEL[o.trade]:'',o.who,o.due?'due '+o.due:''].filter(Boolean).join(' · ')}</small></button>
        ${o.cat==='punch'?html`<label className="check"><input type="checkbox" checked=${o.status==='done'} onChange=${e=>up(o.id,{status:e.target.checked?'done':'open',doneDate:e.target.checked?new Date().toISOString().slice(0,10):null})}/> Done</label>`:null}</li>`;})}</ul>`:html`<p className="note">No pins yet.</p>`}</section>
    <section className="fv-card"><h3>Measuring checklist</h3><p className="note">Walk the room with a tape and enter what you measure. Differences from the model of more than 1/2" are flagged so you can fix the drawing.</p>
      <${Field} label="Room" id="fv-r"><${Sel} id="fv-r" value=${roomId||''} onChange=${setRoomId} options=${p.rooms.map(r=>[r.id,r.name+(r.status==='existing'?' (existing)':'')])}/><//>
      ${room?html`<div className="stat"><span>Measured</span><span className="mono">${doneN} of ${items.length}</span></div>
        <table className="mat fv-meas"><thead><tr><th>What</th><th className="num">Model</th><th>Field</th><th className="num">Difference</th></tr></thead><tbody>${items.map(it=>{const v=meas[it.k];const d=v!=null?v-it.model:null;return html`<tr key=${it.k} className=${d!=null&&Math.abs(d)>0.5?'off':''}><td>${it.label}</td><td className="num mono">${fmtLen(it.model)}</td>
          <td><${LenInput} id=${'fm-'+it.k} value=${v??''} onChange=${x=>setM(it.k,x>0?x:null)}/></td><td className="num mono">${d==null?'':Math.abs(d)<=0.5?'ok':(d>0?'+':'−')+fmtLen(Math.abs(d))}</td></tr>`;})}</tbody></table>
        <${Field} label="Room notes" id="fv-n"><textarea id="fv-n" className="inp" rows="2" value=${(F.notes||{})[room.id]||''} onChange=${e=>setF({notes:{...(F.notes||{}),[room.id]:e.target.value}})}></textarea><//>`:html`<p className="note">Draw rooms first (or use Room from measurements).</p>`}</section></div>`;}
CAPTURE_EXTRA.push(['field','Field mode',FieldView]);

/* ---- trace a wall from a photo: pick the wall's four corners, then box its windows and doors ---- */
function rectifyToCanvas(img,Hinv,Wpx,Hpx,L,Hin){const c=document.createElement('canvas');c.width=Wpx;c.height=Hpx;const g=c.getContext('2d');const src=document.createElement('canvas');src.width=img.naturalWidth;src.height=img.naturalHeight;const sg=src.getContext('2d');sg.drawImage(img,0,0);
  const sd=sg.getImageData(0,0,src.width,src.height).data;const out=g.createImageData(Wpx,Hpx);for(let y=0;y<Hpx;y++)for(let x=0;x<Wpx;x++){const s=x/Wpx*L,z=(1-y/Hpx)*Hin;const [u,v]=hApply(Hinv,[s,z]);const ui=Math.round(u),vi=Math.round(v);const o=(y*Wpx+x)*4;
    if(ui>=0&&vi>=0&&ui<src.width&&vi<src.height){const i=(vi*src.width+ui)*4;out.data[o]=sd[i];out.data[o+1]=sd[i+1];out.data[o+2]=sd[i+2];out.data[o+3]=255;}else{out.data[o+3]=0;}}g.putImageData(out,0,0);return c;}
function facadeWalls(p,lvId){const ext=p.walls.filter(w=>w.level===lvId&&w.kind==='exterior'&&w.status!=='demolish');return ext.map(w=>{const F=wallFacing(p,w);return {w,label:`${F.dir} wall, ${fmtLen(wlen(w))}`,n:F.n};});}
function FacadeTracer({p,commit,levelId,setMode,assets}){const walls=facadeWalls(p,levelId);const [wid,setWid]=useState(walls[0]&&walls[0].w.id);const W=walls.find(x=>x.w.id===wid);const [img,setImg]=useState(null);const [pts,setPts]=useState([]);const [rect,setRect]=useState(null);const [boxes,setBoxes]=useState([]);const [kind,setKind]=useState('window');const [msg,setMsg]=useState(null);
  const cv=useRef(null);const rc=useRef(null);const drag=useRef(null);
  const L=W?wlen(W.w):0,Hin=W?wallH(p,W.w):96;const scale=L?Math.min(900/L,8):1;const Wpx=Math.round(L*scale),Hpx=Math.round(Hin*scale);
  const photos=(assets.list||[]).filter(a=>a.kind==='photo');
  const load=url=>{const im=new Image();im.onload=()=>{setImg(im);setPts([]);setRect(null);setBoxes([]);};im.src=url;};
  const upload=async e=>{const f=e.target.files[0];if(!f)return;e.target.value='';const d=await downscale(f,2400);const id=uid('ph');await assetPut({id,project:p.id||'default',kind:'photo',blob:d.blob,w:d.w,h:d.h,name:f.name,date:new Date().toISOString(),note:'Facade: '+(W?W.label:''),pin:W?{kind:'wall',id:W.w.id}:null});assets.reload&&assets.reload();load(blobURL(id,d.blob));};
  useEffect(()=>{const c=cv.current;if(!c||!img)return;const s=Math.min(1,900/img.naturalWidth);c.width=img.naturalWidth*s;c.height=img.naturalHeight*s;const g=c.getContext('2d');g.drawImage(img,0,0,c.width,c.height);g.strokeStyle='#ff3b30';g.lineWidth=2;g.fillStyle='#ff3b30';
    pts.forEach((q,i)=>{g.beginPath();g.arc(q[0]*s,q[1]*s,5,0,7);g.fill();g.fillText(['bottom left','bottom right','top right','top left'][i],q[0]*s+7,q[1]*s-7);});if(pts.length>1){g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0]*s,q[1]*s):g.moveTo(q[0]*s,q[1]*s));if(pts.length===4)g.closePath();g.stroke();}},[img,pts]);
  useEffect(()=>{if(!img||pts.length!==4||!W){setRect(null);return;}// photo pixels -> wall inches (s along the outside face from its left end, z up from the floor)
    const Hm=homography(pts,[[0,0],[L,0],[L,Hin],[0,Hin]]);const Hinv=homography([[0,0],[L,0],[L,Hin],[0,Hin]],pts);setRect({Hm,c:rectifyToCanvas(img,Hinv,Wpx,Hpx,L,Hin)});},[img,pts,wid]);
  // the wall's left end as seen from outside
  const fromX1=W?((W.n.y)*wdir(W.w).x+(-W.n.x)*wdir(W.w).y)>0:true;const toPos=s=>fromX1?s:L-s;const toS=pos=>fromX1?pos:L-pos;
  useEffect(()=>{const c=rc.current;if(!c||!rect)return;c.width=Wpx;c.height=Hpx;const g=c.getContext('2d');g.drawImage(rect.c,0,0);const X=s=>s*scale,Y=z=>(Hin-z)*scale;
    g.lineWidth=2;g.setLineDash([6,4]);g.strokeStyle='#ffd60a';for(const o of p.openings.filter(o=>o.wall===W.w.id)){const s=toS(o.pos);const z0=o.type==='door'?0:o.sill;g.strokeRect(X(s-o.width/2),Y(z0+o.height),o.width*scale,o.height*scale);}
    g.setLineDash([]);for(const b of boxes){g.strokeStyle=b.type==='door'?'#ff3b30':'#30d158';g.strokeRect(X(b.s0),Y(b.z1),(b.s1-b.s0)*scale,(b.z1-b.z0)*scale);g.fillStyle=g.strokeStyle;g.font='12px sans-serif';g.fillText(`${b.type} ${fmtLen(b.s1-b.s0)} x ${fmtLen(b.z1-b.z0)}`,X(b.s0)+3,Y(b.z1)-4);}},[rect,boxes,p.openings]);
  const clickPhoto=e=>{if(pts.length>=4)return;const c=cv.current;const r=c.getBoundingClientRect();const s=c.width/r.width/Math.min(1,900/img.naturalWidth);setPts([...pts,[(e.clientX-r.left)*s,(e.clientY-r.top)*s]]);};
  const toWall=e=>{const c=rc.current;const r=c.getBoundingClientRect();const x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;return {s:x/scale,z:Hin-y/scale};};
  const down=e=>{if(!rect)return;drag.current=toWall(e);e.currentTarget.setPointerCapture(e.pointerId);};
  const upE=e=>{const a=drag.current;drag.current=null;if(!a)return;const b=toWall(e);const s0=Math.max(0,Math.min(a.s,b.s)),s1=Math.min(L,Math.max(a.s,b.s));let z0=Math.max(0,Math.min(a.z,b.z)),z1=Math.min(Hin,Math.max(a.z,b.z));if(s1-s0<6||z1-z0<6)return;
    const R=v=>Math.round(v*2)/2;const type=kind==='auto'?(z0<8?'door':'window'):kind;if(type==='door')z0=0;setBoxes([...boxes,{type,s0:R(s0),s1:R(s1),z0:R(z0),z1:R(z1)}]);};
  const apply=()=>{const add=boxes.map(b=>({id:uid('op'),wall:W.w.id,type:b.type,pos:toPos((b.s0+b.s1)/2),width:b.s1-b.s0,height:b.z1-b.z0,sill:b.type==='door'?0:b.z0,status:'existing',...(b.type==='door'?{dtype:'swing',hinge:0,swing:1}:{operation:'double-hung'})}));
    commit({...p,openings:[...p.openings,...add]});setMsg({ok:true,t:`Added ${add.length} opening${add.length===1?'':'s'} to the ${W.label} as existing. Check them on the plan; door swing and window style are in each panel.`});setBoxes([]);};
  if(!walls.length)return html`<p className="note">Draw the outside walls first; then trace each one from a photo.</p>`;
  return html`<div className="facade"><p className="note">Stand back and take the photo as straight-on as you can. Pick the wall, then click its four corners on the photo (floor line at the bottom, top plate or soffit line at the top). The photo is straightened to the wall's real size, and you can box the windows and doors on it.</p>
    <div className="grid2"><${Field} label="Wall" id="fc-w"><${Sel} id="fc-w" value=${wid} onChange=${v=>{setWid(v);setPts([]);setBoxes([]);}} options=${walls.map(x=>[x.w.id,x.label])}/><//>
      <div className="row"><label className="btn primary" htmlFor="fc-file">Take or choose photo…</label><input id="fc-file" type="file" accept="image/*" capture="environment" hidden onChange=${upload}/>
        ${photos.length?html`<select className="inp" value="" onChange=${e=>{const a=photos.find(x=>x.id===e.target.value);if(a)load(blobURL(a.id,a.blob));}} aria-label="Use a saved photo"><option value="">Or use a saved photo…</option>${photos.map(a=>html`<option key=${a.id} value=${a.id}>${a.name}</option>`)}</select>`:null}</div></div>
    ${img?html`<div className="fc-step"><b>1.</b> Click the corners: bottom left, bottom right, top right, top left (as you face the wall). ${pts.length?html`<button className="btn" onClick=${()=>setPts([])}>Start over</button>`:null}</div><canvas ref=${cv} className="fc-photo" onClick=${clickPhoto}></canvas>`:null}
    ${rect?html`<div className="fc-step"><b>2.</b> Drag a box over each window and door. Yellow dashes are openings already in the model.
        <${Sel} id="fc-k" value=${kind} onChange=${setKind} options=${[['window','Windows'],['door','Doors'],['auto','Doors if they touch the floor']]}/></div>
      <canvas ref=${rc} className="fc-rect" onPointerDown=${down} onPointerUp=${upE}></canvas>
      <div className="row"><button className="btn primary" disabled=${!boxes.length} onClick=${apply}>Add ${boxes.length||''} opening${boxes.length===1?'':'s'} to the model</button><button className="btn" disabled=${!boxes.length} onClick=${()=>setBoxes(boxes.slice(0,-1))}>Undo last box</button><span className="spacer"></span><button className="btn" onClick=${()=>setMode('3d')}>See it in 3D</button></div>`:null}
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}</div>`;}
CAPTURE_EXTRA.push(['facade','Trace a wall from a photo',FacadeTracer]);
