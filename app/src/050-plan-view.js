/* ======================= plan view ======================= */
function PlanView(props){
  const {compareWalls=[],project:p0,levelId,tool,setTool,sel,setSel,commit:commit0,setPreview:setPreview0,ortho,wallPreset,fitToken,onDelete,issues=[],onIssue,layer='both',fixtureType='toilet',under=null,ulMove=false,openPreset={},elecType='recept',showElec=true}=props;
  const p=layer==='both'?p0:{...p0,walls:p0.walls.filter(w=>inLayer(w.status,layer)),openings:p0.openings.filter(o=>inLayer(o.status,layer)),fixtures:(p0.fixtures||[]).filter(f=>inLayer(f.status,layer))};
  // when only existing or proposed work is shown, put the hidden items back before saving a change
  const unfilter=q=>{if(!q||layer==='both')return q;const r={...q};for(const k of ['walls','openings','fixtures']){const hidden=(p0[k]||[]).filter(x=>!(p[k]||[]).includes(x));const del=new Set();r[k]=[...(q[k]||[]),...hidden.filter(h=>!(q[k]||[]).some(y=>y.id===h.id))];}return r;};
  const commit=q=>commit0(unfilter(q)); const setPreview=q=>setPreview0(unfilter(q));
  const grid=p.settings.grid||6;
  const svgRef=useRef(null);
  const [size,setSize]=useState({w:800,h:600});
  const [view,setView]=useState({s:1,tx:40,ty:40});
  const vr=useRef(view); vr.current=view;
  const [cursor,setCursor]=useState(null);
  const [chain,setChain]=useState([]);
  const [lenBuf,setLenBuf]=useState('');
  const [rect,setRect]=useState(null);
  const [meas,setMeas]=useState([]);
  const [hover,setHover]=useState(null);
  const [shift,setShift]=useState(false); const [box,setBox]=useState(null); const [xpts,setXpts]=useState([]);
  const XT=XTOOLS[tool]||null; const SH=showOf(p0); const [disp,setDisp]=useState(false); const [cmd,setCmd]=useState(''); const [cmdLog,setCmdLog]=useState(''); const cmdRef=useRef(null);
  const drag=useRef(null), ptrs=useRef(new Map()), pinch=useRef(null);
  const lv=lvlOf(p,levelId)||p.levels[0];
  const walls=p.walls.filter(w=>w.level===lv.id);
  const below=sortedLevels(p).filter(l=>l.elevation<lv.elevation).pop();
  const ghost=below?p.walls.filter(w=>w.level===below.id):[];
  const joins=useMemo(()=>wallJoins(walls),[p.walls,lv.id]);

  useLayoutEffect(()=>{const el=svgRef.current;const ro=new ResizeObserver(()=>{const r=el.getBoundingClientRect();setSize({w:r.width,h:r.height});});ro.observe(el);return ()=>ro.disconnect();},[]);
  function fit(){
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const add=(x,y)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);};
    for(const w of walls){add(w.x1,w.y1);add(w.x2,w.y2);} for(const r of p.rooms.filter(r=>r.level===lv.id)) for(const q of r.pts) add(q[0],q[1]);
    for(const r of p.roofs.filter(r=>r.level===lv.id)){add(r.x-r.overhang,r.y-r.overhang);add(r.x+r.w+r.overhang,r.y+r.h+r.overhang);}
    for(const k of objKinds())for(const o of objsOn(p,k,lv.id))for(const q of regPts(p,k,o))add(q.x,q.y);
    if(x0>x1){x0=-60;y0=-60;x1=480;y1=360;}
    const el=svgRef.current;if(!el)return;const R=el.getBoundingClientRect();const W=R.width||size.w,H=R.height||size.h;
    const pad=70; const s=Math.min((W-pad*2)/Math.max(1,x1-x0),(H-pad*2)/Math.max(1,y1-y0));
    const sc=Math.max(0.15,Math.min(8,s)); setView({s:sc,tx:W/2-(x0+x1)/2*sc,ty:H/2-(y0+y1)/2*sc});
  }
  useEffect(()=>{const t=setTimeout(fit,30);return ()=>clearTimeout(t);},[fitToken,lv.id]);
  useEffect(()=>{setChain([]);setLenBuf('');setRect(null);setMeas([]);setHover(null);setXpts([]);},[tool,lv.id]);

  const S=(x,y)=>[x*view.s+view.tx,y*view.s+view.ty];
  const selHas=id=>!!sel&&(sel.id===id||(sel.kind==='multi'&&sel.items.some(i=>i.id===id)));
  window.__planView={view,svg:svgRef};
  const toWorld=e=>{const r=svgRef.current.getBoundingClientRect();const v=vr.current;return {x:(e.clientX-r.left-v.tx)/v.s,y:(e.clientY-r.top-v.ty)/v.s};};

  function snap(raw,{anchor=null,useOrtho=false,skip=null}={}){
    const tol=12/vr.current.s; let best=null;
    for(const w of walls)for(const [k,e] of [['a',{x:w.x1,y:w.y1}],['b',{x:w.x2,y:w.y2}]]){if(skip&&skip.has(w.id+k))continue;const d=dist(e,raw);if(d<tol&&(!best||d<best.d))best={x:e.x,y:e.y,d,kind:'end'};}
    if(tool==='room'||(drag.current&&drag.current.type==='vertex')) for(const r of p.rooms.filter(r=>r.level===lv.id)) r.pts.forEach((q,i)=>{if(drag.current&&drag.current.roomId===r.id&&drag.current.idx===i)return;const d=Math.hypot(q[0]-raw.x,q[1]-raw.y);if(d<tol&&(!best||d<best.d))best={x:q[0],y:q[1],d,kind:'end'};});
    if(chain.length>=3&&tool==='room'){const f=chain[0];const d=dist(f,raw);if(d<tol)best={x:f.x,y:f.y,d,kind:'end'};}
    {const modes=osnapModes(p);const o=osnap(raw,tol,snapGeom(p,lv.id,tool!=='wall'),modes,anchor);if(o&&(!best||o.d<best.d-0.5))best=o;if(XT&&xpts.length>=2&&XT.closable){const f=xpts[0];if(dist(f,raw)<tol)best={x:f.x,y:f.y,d:0,kind:'end'};}}
    if(best) return best;
    if(osnapModes(p).grid===false&&!(anchor&&useOrtho))return {...raw,kind:'none'};
    if(anchor&&useOrtho){const dx=raw.x-anchor.x,dy=raw.y-anchor.y;if(Math.hypot(dx,dy)<1e-6)return {...anchor,kind:'grid'};
      const ang=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*(Math.PI/4);const pr=dx*Math.cos(ang)+dy*Math.sin(ang);const Ls=Math.max(0,Math.round(pr/grid)*grid);
      return {x:anchor.x+Math.cos(ang)*Ls,y:anchor.y+Math.sin(ang)*Ls,kind:'ortho'};}
    return {x:Math.round(raw.x/grid)*grid,y:Math.round(raw.y/grid)*grid,kind:'grid'};
  }
  function nearestWall(raw){
    const tol=16/vr.current.s; let best=null;
    for(const w of walls){const pr=projSeg(raw,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});if(pr.d<=w.thick/2+tol&&(!best||pr.d<best.d))best={w,pr,d:pr.d};}
    return best;
  }
  function hit(raw){
    const tol=8/vr.current.s;
    if(sel&&sel.kind==='wall'){const w=walls.find(w=>w.id===sel.id);if(w){if(dist(raw,{x:w.x1,y:w.y1})<tol*1.6)return {kind:'end',w,end:'a'};if(dist(raw,{x:w.x2,y:w.y2})<tol*1.6)return {kind:'end',w,end:'b'};}}
    if(sel&&sel.kind==='room'){const r=p.rooms.find(r=>r.id===sel.id);if(r){const i=r.pts.findIndex(q=>Math.hypot(q[0]-raw.x,q[1]-raw.y)<tol*1.6);if(i>=0)return {kind:'vertex',r,idx:i};}}
    {const dh=draftHit({...p,elec:showElec?p.elec:[]},lv,raw,tol);if(dh)return dh;}
    {const rh=regHit(p,lv,raw,tol,'early');if(rh)return rh;}
    for(const o of p.openings){const w=walls.find(w=>w.id===o.wall);if(!w)continue;const pr=projSeg(raw,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});const s=pr.t*wlen(w);if(Math.abs(s-o.pos)<=o.width/2&&pr.d<=w.thick/2+tol)return {kind:'opening',o,w};}
    for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id&&f.type!=='wallcab'))if(inPoly(raw.x,raw.y,fxCorners(f).map(c=>[c.x,c.y])))return {kind:'fixture',f};
    for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id&&f.type==='wallcab'))if(inPoly(raw.x,raw.y,fxCorners(f).map(c=>[c.x,c.y])))return {kind:'fixture',f};
    for(const s of p.stairs.filter(s=>s.level===lv.id)){if(stairHit(p,s,raw))return {kind:'stair',s};}
    let bw=null;for(const w of walls){const pr=projSeg(raw,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});if(pr.d<=w.thick/2+tol*0.6&&(!bw||pr.d<bw.d))bw={w,d:pr.d};} if(bw)return {kind:'wall',w:bw.w};
    for(const r of p.roofs.filter(r=>r.level===lv.id)){const ol=roofBuild(r,0).outline;for(let i=0;i<4;i++){const a=ol[i],b=ol[(i+1)%4];if(projSeg(raw,{x:a[0],y:a[1]},{x:b[0],y:b[1]}).d<tol*1.5)return {kind:'roof',r};}}
    {const rh=regHit(p,lv,raw,tol,'late');if(rh)return rh;}
    for(const r of p.rooms.filter(r=>r.level===lv.id))if(inPoly(raw.x,raw.y,r.pts))return {kind:'room',r};
    return null;
  }

  /* ---- placing ---- */
  function addWall(a,b){
    if(dist(a,b)<1) return false;
    const pre=WALL_PRESETS[wallPreset];
    const w={id:uid('w'),level:lv.id,x1:a.x,y1:a.y,x2:b.x,y2:b.y,thick:pre.thick,kind:pre.kind,bearing:pre.bearing,height:pre.height??null,status:'new',...(pre.mat?{mat:pre.mat}:{}),assembly:wallPreset};
    commit({...p,walls:[...p.walls,w]}); return true;
  }
  function placeWallPt(pt){
    if(!chain.length){setChain([pt]);return;}
    const last=chain[chain.length-1]; if(!addWall(last,pt)) return;
    if(chain.length>=2&&dist(pt,chain[0])<0.6) setChain([]); else setChain([...chain,pt]);
  }
  function placeRoomPt(pt){
    if(tool==='room'&&!chain.length&&pt.kind!=='end'){const pts=detectRoom(p,lv.id,pt);if(pts){const n=p.rooms.filter(r=>r.level===lv.id).length+1;const r={id:uid('rm'),level:lv.id,name:'Room '+n,use:'living',pts};commit({...p,rooms:[...p.rooms,r]});setSel({kind:'room',id:r.id});return;}}
    if(chain.length>=3&&dist(pt,chain[0])<0.6){finishRoom();return;}
    if(chain.length&&dist(pt,chain[chain.length-1])<0.6) return;
    setChain([...chain,pt]);
  }
  function finishRoom(){
    if(chain.length<3){setChain([]);return;}
    if(tool==='shape'){const sh={id:uid('sh'),level:lv.id,name:'Shape '+((p.shapes||[]).length+1),kind:'extrude',pts:chain.map(c=>[c.x,c.y]),h:36,z:0,holes:[],status:'new'};commit({...p,shapes:[...(p.shapes||[]),sh]});setSel({kind:'shape',id:sh.id});setChain([]);return;}
    const n=p.rooms.filter(r=>r.level===lv.id).length+1;
    const r={id:uid('rm'),level:lv.id,name:'Room '+n,use:'living',pts:chain.map(c=>[c.x,c.y])};
    commit({...p,rooms:[...p.rooms,r]}); setSel({kind:'room',id:r.id}); setChain([]);
  }
  function placeOpening(){
    if(!hover) return; const {w,pos}=hover;
    const it=LIB_BY_ID[openPreset[tool]];
    const hs=tool==='door'&&hover.side?{hinge:hover.hinge||0,swing:hover.side}:{};
    const o=it?{id:uid('op'),wall:w.id,pos,hinge:0,swing:1,status:'new',...openingFromLib(it),...hs}:tool==='door'?{id:uid('op'),wall:w.id,type:'door',pos,width:36,height:80,sill:0,hinge:0,swing:1,status:'new',...hs}
                         :{id:uid('op'),wall:w.id,type:'window',pos,width:36,height:48,sill:36,operation:'double-hung',status:'new'};
    commit({...p,openings:[...p.openings,o]}); setSel({kind:'opening',id:o.id});
  }
  function xctx(){return {p,lv,commit,setSel,setTool,walls,nearestWall,grid,view:vr.current,wallPreset,sel};}
  function xPlace(pts,raw){const r=XT.place(xctx(),pts,{raw});setXpts([]);if(!r)return;if(r.p)commit(r.p);if(r.sel)setSel(r.sel);if(r.tool)setTool(r.tool);}
  function xAddPt(pt,raw){const need=XT.mode==='click'?1:XT.mode==='two'||XT.mode==='rect'?2:(XT.n||0);
    if(XT.mode==='chain'){if(xpts.length>=(XT.min||2)&&dist(pt,xpts[0])<0.6&&XT.closable){xPlace(xpts,raw);return;}if(xpts.length&&dist(pt,xpts[xpts.length-1])<0.6){if(xpts.length>=(XT.min||2))xPlace(xpts,raw);return;}const nx=[...xpts,pt];if(XT.max&&nx.length>=XT.max){xPlace(nx,raw);return;}setXpts(nx);return;}
    const nx=[...xpts,pt];if(nx.length>=need)xPlace(nx,raw);else setXpts(nx);}
  function xFinish(){if(XT&&XT.mode==='chain'&&xpts.length>=(XT.min||2))xPlace(xpts,null);else setXpts([]);}
  function finishChain(){ if(XT){xFinish();setLenBuf('');return;} if(tool==='room'||tool==='shape') finishRoom(); else setChain([]); setLenBuf(''); }
  function feedPoint(pt){
    if(XT){xAddPt(pt,null);return true;}if(tool==='wall'){placeWallPt(pt);return true;}if(tool==='room'||tool==='shape'){placeRoomPt(pt);return true;}
    if(tool==='dim'){if(meas.length===1){if(dist(meas[0],pt)>0.5){const dm={id:uid('dm'),level:lv.id,a:{x:meas[0].x,y:meas[0].y},b:{x:pt.x,y:pt.y},off:18};commit({...p,dims:[...(p.dims||[]),dm]});setSel({kind:'dim',id:dm.id});}setMeas([]);}else setMeas([pt]);return true;}
    if(tool==='measure'){setMeas(m=>m.length>=2||!m.length?[pt]:[m[0],pt]);return true;}
    return false;}
  function lastPoint(){const ch=XT?xpts:(tool==='dim'||tool==='measure')?meas:chain;return ch[ch.length-1]||null;}
  function runCmd(text){const c=parseCommand(text);if(!c)return;const say=m=>setCmdLog(m);
    if(c.type==='coord'){const last=lastPoint();const pt=parseCoord(c.text,last);if(!pt){say(last||!/^@|</.test(c.text)?'Could not read that point. Examples: 12\',8\'  @36",0  @10\'<90':'Click a first point, then type @dx,dy or length<angle.');return;}if(!feedPoint(pt))say('Pick a drawing tool first (for example L for a line or W for a wall).');else say('Point '+fmtLen(pt.x)+', '+fmtLen(pt.y));return;}
    if(c.type==='length'){if(!lastPoint()){say('Click a first point, then type a length.');return;}applyLen(c.text);return;}
    if(c.type==='tool'){setTool(c.id);say((toolInfo(c.id)||{label:c.id}).label);return;}
    if(c.type==='undo'){props.onUndo&&props.onUndo();return;}if(c.type==='redo'){props.onRedo&&props.onRedo();return;}
    if(c.type==='fit'){fit();return;}if(c.type==='erase'){if(sel)onDelete();return;}
    if(c.type==='grid'){if(c.val>0){commit({...p,settings:{...p.settings,grid:c.val}});say('Snap grid '+fmtLen(c.val));}return;}
    if(c.type==='osnap'){const a=c.arg.toLowerCase();if(!a){setDisp(true);return;}const m={};for(const [k] of OSNAP_LIST)m[k]=a==='on'||a==='all'?true:a==='off'?k==='grid':a.split(/[ ,]+/).some(w=>k.startsWith(w));commit({...p,settings:{...p.settings,osnap:m}});say('Snaps: '+Object.keys(m).filter(k=>m[k]).join(', '));return;}
    if(c.type==='layer'){const nm=c.arg.trim();if(!nm){setDisp(true);return;}const L=layersOf(p);let l=L.find(x=>x.name.toLowerCase()===nm.toLowerCase()||x.id.toLowerCase()===nm.toLowerCase());let layers=L;if(!l){l={id:'L-'+uid('').toUpperCase(),name:nm,color:'#'+Math.floor(Math.random()*0xaaaaaa).toString(16).padStart(6,'0')};layers=[...L,l];}
      commit({...p,layers,settings:{...p.settings,cadLayer:l.id}});say('Drawing on layer '+l.name);return;}
    if(c.type==='rotate'){const items=selItems(sel);if(!items.length){say('Select something to rotate first.');return;}const base=XT&&tool==='op-rotate'&&xpts[0]?xpts[0]:selCenter(p,items);const r=xformItems(p,items,T_rot(base,-c.deg));commit(r.p);setSel(r.sel);setXpts([]);say('Rotated '+c.deg+'°');return;}
    if(c.type==='offset'){if(c.val>0){commit({...p,settings:{...p.settings,offsetD:c.val}});setTool('op-offset');say('Offset distance '+fmtLen(c.val)+'. Click a line or wall, then the side.');}return;}
    if(c.type==='array'){commit({...p,settings:{...p.settings,arrayN:c.n}});setTool('op-array');say('Array of '+c.n+'. Click a base point, then the spacing.');return;}
    say('Unknown command: '+c.text+'. Try L, PL, REC, C, A, W, D, N, M, CO, RO 90, MI, AR 4, O 6, TR, EX, Z, U.');}
  function applyLen(text){
    const L=parseLen(text,'ft');
    const ch=XT?xpts:chain; if(L==null||L<=0||!ch.length) return;
    const last=ch[ch.length-1]; let d={x:1,y:0};
    if(cursor){const dx=cursor.x-last.x,dy=cursor.y-last.y,m=Math.hypot(dx,dy);if(m>1e-6)d={x:dx/m,y:dy/m};}
    if(XT&&XT.mode==='two'&&tool==='circle'){xAddPt({x:last.x+L,y:last.y},null);return;}
    const pt={x:last.x+d.x*L,y:last.y+d.y*L};
    if(XT) xAddPt(pt,null); else if(tool==='wall') placeWallPt(pt); else placeRoomPt(pt);
  }
  function applyLenBuf(){
    const L=parseLen(lenBuf,'ft'); setLenBuf('');
    const ch=XT?xpts:chain; if(L==null||L<=0||!ch.length) return;
    const last=ch[ch.length-1]; let d={x:1,y:0};
    if(cursor){const dx=cursor.x-last.x,dy=cursor.y-last.y,m=Math.hypot(dx,dy);if(m>1e-6)d={x:dx/m,y:dy/m};}
    const pt={x:last.x+d.x*L,y:last.y+d.y*L};
    if(XT) xAddPt(pt,null); else if(tool==='wall') placeWallPt(pt); else placeRoomPt(pt);
  }

  /* ---- keyboard ---- */
  useEffect(()=>{
    const kd=e=>{
      if(e.key==='Shift')setShift(true);
      const t=document.activeElement; const inField=t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName);
      // Esc ends the wall or room run even when a toolbar control still has focus
      if(e.key==='Escape'&&!e.defaultPrevented&&!document.querySelector('.modal-bg,.menupop')){
        if(chain.length||rect||meas.length||lenBuf||xpts.length){if(inField&&t.closest('.pane'))t.blur();if(chain.length||xpts.length)finishChain();setChain([]);setXpts([]);setLenBuf('');setRect(null);setMeas([]);e.preventDefault();return;}
        if(inField)return; if(tool!=='select'){setTool('select');}else setSel(null);return;}
      if(inField) return;
      if((e.key==='/'||e.key===';')&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey&&cmdRef.current){cmdRef.current.focus();e.preventDefault();return;}
      if(((tool==='wall'||tool==='room'||tool==='shape')&&chain.length)||(XT&&xpts.length&&XT.mode!=='click')){
        if(/^[0-9.'"\/ \-′″]$/.test(e.key)&&!e.ctrlKey&&!e.metaKey){setLenBuf(b=>b+e.key);e.preventDefault();return;}
        if(e.key==='Backspace'&&lenBuf){setLenBuf(b=>b.slice(0,-1));e.preventDefault();return;}
        if(e.key==='Enter'){ if(lenBuf) applyLenBuf(); else finishChain(); e.preventDefault(); return; }
      }
      if((e.key==='Delete'||e.key==='Backspace')&&sel){onDelete();e.preventDefault();}
      if(sel&&tool==='select'&&/^Arrow/.test(e.key)&&!e.ctrlKey&&!e.metaKey){const st=e.shiftKey?12:1;const dx=e.key==='ArrowLeft'?-st:e.key==='ArrowRight'?st:0,dy=e.key==='ArrowUp'?-st:e.key==='ArrowDown'?st:0;
        const items=sel.kind==='multi'?sel.items:[{kind:sel.kind,id:sel.id}];if(items.length===1&&items[0].kind==='wall'){const w=p.walls.find(x=>x.id===items[0].id);if(w){const la=endsAt(p,lv.id,{x:w.x1,y:w.y1}),lb=endsAt(p,lv.id,{x:w.x2,y:w.y2});let q=moveEnds(p,la,{x:w.x1+dx,y:w.y1+dy});q=moveEnds(q,lb,{x:w.x2+dx,y:w.y2+dy});commit(q);e.preventDefault();return;}}
        commit(moveItems(p,items,dx,dy));e.preventDefault();}
    };
    const ku=e=>{if(e.key==='Shift')setShift(false);};
    window.addEventListener('keydown',kd); window.addEventListener('keyup',ku);
    return ()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);};
  });

  /* ---- wheel zoom ---- */
  useEffect(()=>{const el=svgRef.current;const wh=e=>{e.preventDefault();const r=el.getBoundingClientRect();const mx=e.clientX-r.left,my=e.clientY-r.top;const v=vr.current;
    const f=Math.exp(-e.deltaY*(e.ctrlKey?0.01:0.0015));const s=Math.max(0.08,Math.min(20,v.s*f));setView({s,tx:mx-(mx-v.tx)*s/v.s,ty:my-(my-v.ty)*s/v.s});};
    el.addEventListener('wheel',wh,{passive:false});return ()=>el.removeEventListener('wheel',wh);},[]);

  /* ---- pointer ---- */
  function cursorFor(raw,e){
    const free=e&&e.shiftKey;
    if(tool==='wall'||tool==='room'||tool==='shape') return snap(raw,{anchor:chain[chain.length-1],useOrtho:ortho!==free&&chain.length>0});
    if(tool==='shape') return snap(raw,{anchor:chain[chain.length-1],useOrtho:ortho!==free&&chain.length>0});
    if(tool==='dim') return snap(raw,{anchor:meas.length===1?meas[0]:null,useOrtho:!free&&meas.length===1});
    if(XT){if(XT.snap==='free')return {...raw,kind:'none'};const last=xpts[xpts.length-1];return snap(raw,{anchor:last,useOrtho:!!last&&(XT.ortho!==false)&&ortho!==free});}
    if(tool==='roof'||tool==='stair'||tool==='measure'||tool==='fixture'||tool==='elec'||tool==='ramp'||tool==='note') return snap(raw,{anchor:tool==='measure'&&meas.length===1?meas[0]:null,useOrtho:tool==='measure'&&!free&&meas.length===1});
    return {...raw,kind:'none'};
  }
  function onDown(e){
    const el=svgRef.current; try{el.setPointerCapture(e.pointerId);}catch(_){} try{const a=document.activeElement;if(a&&a!==document.body&&/INPUT|SELECT|TEXTAREA|BUTTON/.test(a.tagName))a.blur();el.focus({preventScroll:true});}catch(_){}
    ptrs.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(ptrs.current.size===2){ // pinch / two-finger pan
      if(drag.current&&drag.current.base) setPreview(null);
      drag.current=null; const [a,b]=[...ptrs.current.values()];
      pinch.current={d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2,v:{...vr.current}}; return;
    }
    if(ptrs.current.size>2) return;
    if(e.button===2){finishChain();return;}
    if(e.button===1||(e.button===0&&e.altKey)){drag.current={type:'pan',sx:e.clientX,sy:e.clientY,v:{...vr.current}};return;}
    const raw=toWorld(e);
    if(tool==='select'||tool==='measure'){const r=svgRef.current.getBoundingClientRect();const mx=e.clientX-r.left,my=e.clientY-r.top;
      const mh=markerPts.find(m=>Math.hypot(m.x-mx,m.y-my)<11);if(mh&&onIssue){onIssue(mh.i);return;}}
    if(tool==='select'&&ulMove&&(p.underlay||p.cloud)){const tgt=under&&under.u?'underlay':'cloud';const o=p[tgt];drag.current={type:'ul',tgt,w0:raw,start:{x:e.clientX,y:e.clientY},base:p,ox:tgt==='underlay'?o.x:o.dx||0,oy:tgt==='underlay'?o.y:o.dy||0};return;}
    if(tool==='select'){
      const h=hit(raw);
      if(e.shiftKey&&!h){drag.current={type:'box',a:raw};setBox({a:raw,b:raw});return;}
      if(e.shiftKey&&h&&h.kind!=='end'&&h.kind!=='vertex'){const obj=h.f||h.o||h.s||h.w||h.r;const cur=sel?(sel.kind==='multi'?sel.items:[{kind:sel.kind,id:sel.id}]):[];
        const has=cur.some(i=>i.id===obj.id);const items=has?cur.filter(i=>i.id!==obj.id):[...cur,{kind:h.kind,id:obj.id}];setSel(items.length>1?{kind:'multi',items}:items.length?items[0]:null);return;}
      if(!h){setSel(null);drag.current={type:'pan',sx:e.clientX,sy:e.clientY,v:{...vr.current}};return;}
      if(sel&&sel.kind==='multi'&&selHas((h.f||h.o||h.s||h.w||h.r).id)){drag.current={type:'multi',base:p,start:{x:e.clientX,y:e.clientY},w0:raw,items:sel.items};return;}
      const base=p; const start={x:e.clientX,y:e.clientY};
      if(h.kind==='end'){const pt=h.end==='a'?{x:h.w.x1,y:h.w.y1}:{x:h.w.x2,y:h.w.y2};const list=endsAt(p,lv.id,pt);const other=h.end==='a'?{x:h.w.x2,y:h.w.y2}:{x:h.w.x1,y:h.w.y1};
        drag.current={type:'end',base,start,list,other,skip:new Set(list.map(l=>l.id+l.end))};return;}
      if(h.kind==='vertex'){drag.current={type:'vertex',base,start,roomId:h.r.id,idx:h.idx};return;}
      const kind=h.kind; const obj=h.f||h.o||h.s||h.w||h.r;
      setSel({kind,id:obj.id});
      let list=null; if(kind==='wall'){list=[...endsAt(p,lv.id,{x:h.w.x1,y:h.w.y1}),...endsAt(p,lv.id,{x:h.w.x2,y:h.w.y2})];}
      drag.current={type:'move',kind,id:obj.id,base,start,w0:raw,list,wall:h.w};
      return;
    }
    if(tool==='roof'){const pt=cursorFor(raw,e);drag.current={type:'rect',a:pt};setRect({a:pt,b:pt});return;}
    if(XT&&XT.mode==='rect'&&!xpts.length){const pt=cursorFor(raw,e);drag.current={type:'xrect',a:pt,start:{x:e.clientX,y:e.clientY}};return;}
    drag.current={type:'place',start:{x:e.clientX,y:e.clientY}};
  }
  function onMove(e){
    if(ptrs.current.has(e.pointerId)) ptrs.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch.current&&ptrs.current.size===2){const [a,b]=[...ptrs.current.values()];const pc=pinch.current;const r=svgRef.current.getBoundingClientRect();
      const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const s=Math.max(0.08,Math.min(20,pc.v.s*d/Math.max(1,pc.d)));
      const wx=(pc.mx-r.left-pc.v.tx)/pc.v.s,wy=(pc.my-r.top-pc.v.ty)/pc.v.s;setView({s,tx:mx-r.left-wx*s,ty:my-r.top-wy*s});return;}
    const raw=toWorld(e); const D=drag.current;
    if(D&&D.type==='pan'){setView({...D.v,tx:D.v.tx+e.clientX-D.sx,ty:D.v.ty+e.clientY-D.sy});return;}
    const c=cursorFor(raw,e); setCursor(c);
    if(tool==='door'||tool==='window'){const nw=nearestWall(raw);if(nw){const L=wlen(nw.w);const width=(LIB_BY_ID[openPreset[tool]]||{width:36}).width;let pos=Math.round(nw.pr.t*L);pos=Math.max(width/2,Math.min(L-width/2,pos));const dd=wdir(nw.w);const side=((raw.x-nw.w.x1)*(-dd.y)+(raw.y-nw.w.y1)*dd.x)>=0?1:-1;const along=(raw.x-nw.w.x1)*dd.x+(raw.y-nw.w.y1)*dd.y;setHover({w:nw.w,pos,width,side,hinge:along>pos?1:0});}else setHover(null);}
    if(!D) return;
    if(D.type==='rect'){setRect({a:D.a,b:c});return;}
    if(D.type==='xrect'){if(Math.hypot(e.clientX-D.start.x,e.clientY-D.start.y)>6)D.moved=true;if(D.moved)setRect({a:D.a,b:c});return;}
    if(D.type==='box'){setBox({a:D.a,b:raw});return;}
    if(D.type==='place') return;
    if(!D.moved){if(Math.hypot(e.clientX-D.start.x,e.clientY-D.start.y)<4)return;D.moved=true;}
    const B=D.base;
    if(D.type==='end'){const pt=snap(raw,{anchor:D.other,useOrtho:ortho!==e.shiftKey,skip:D.skip});setPreview(moveEnds(B,D.list,pt));return;}
    if(D.type==='ul'){const dx=raw.x-D.w0.x,dy=raw.y-D.w0.y;const B=D.base;setPreview(D.tgt==='underlay'?{...B,underlay:{...B.underlay,x:D.ox+dx,y:D.oy+dy}}:{...B,cloud:{...B.cloud,dx:D.ox+dx,dy:D.oy+dy}});return;}
    if(D.type==='vertex'){const pt=snap(raw,{});setPreview({...B,rooms:B.rooms.map(r=>r.id!==D.roomId?r:{...r,pts:r.pts.map((q,i)=>i===D.idx?[pt.x,pt.y]:q)})});return;}
    if(D.type==='multi'){const dx=Math.round((raw.x-D.w0.x)/grid)*grid, dy=Math.round((raw.y-D.w0.y)/grid)*grid;setPreview(moveItems(B,D.items,dx,dy));}
    if(D.type==='move'){
      const dx=Math.round((raw.x-D.w0.x)/grid)*grid, dy=Math.round((raw.y-D.w0.y)/grid)*grid;
      if(D.kind==='wall'){const m=new Map(D.list.map(l=>[l.id+l.end,1]));setPreview({...B,walls:B.walls.map(w=>{const a=m.has(w.id+'a'),b=m.has(w.id+'b');if(!a&&!b)return w;return {...w,...(a?{x1:w.x1+dx,y1:w.y1+dy}:{}),...(b?{x2:w.x2+dx,y2:w.y2+dy}:{})};})});}
      else if(D.kind==='opening'){const o=B.openings.find(o=>o.id===D.id);const w=B.walls.find(w=>w.id===o.wall);const pr=projSeg(raw,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});const L=wlen(w);
        let pos=Math.round(pr.t*L);pos=Math.max(o.width/2,Math.min(L-o.width/2,pos));setPreview(updObj(B,'opening',D.id,{pos}));}
      else if(D.kind==='room') setPreview({...B,rooms:B.rooms.map(r=>r.id!==D.id?r:{...r,pts:r.pts.map(q=>[q[0]+dx,q[1]+dy])})});
      else if(D.kind==='fixture'){const f=B.fixtures.find(f=>f.id===D.id);const moved={...f,x:f.x+dx,y:f.y+dy};const t=fxDef(f.lib||f.type);
        setPreview(updObj(B,'fixture',D.id,!t.free&&!e.shiftKey?snapFixtureToWall(B,lv.id,moved,{x:raw.x-(D.w0.x-f.x),y:raw.y-(D.w0.y-f.y)},f.d/2+6):moved));}
      else if(D.kind==='stair'){const s=B.stairs.find(s=>s.id===D.id);setPreview(updObj(B,'stair',D.id,{x:s.x+dx,y:s.y+dy}));}
      else if(D.kind==='roof'){const r=B.roofs.find(r=>r.id===D.id);setPreview(updObj(B,'roof',D.id,{x:r.x+dx,y:r.y+dy}));}
      else if(D.kind==='elec'){const d=B.elec.find(x=>x.id===D.id);const ed=ELEC[d.type];const moved={...d,x:d.x+dx,y:d.y+dy};setPreview(updObj(B,'elec',D.id,ed&&ed.mount==='wall'&&!e.shiftKey?snapElecToWall(B,lv.id,moved,{x:raw.x-(D.w0.x-d.x),y:raw.y-(D.w0.y-d.y)}):{x:moved.x,y:moved.y}));}
      else if(['ramp','shape','dim','anno'].includes(D.kind))setPreview(moveDraft(B,D.kind,D.id,dx,dy));
      else if(OBJ[D.kind])setPreview(regMove(B,D.kind,D.id,OBJ[D.kind].freeMove?raw.x-D.w0.x:dx,OBJ[D.kind].freeMove?raw.y-D.w0.y:dy));
    }
  }
  function onUp(e){
    ptrs.current.delete(e.pointerId);
    if(pinch.current){if(ptrs.current.size<2)pinch.current=null;drag.current=null;return;}
    const D=drag.current; drag.current=null; if(!D) return;
    if(D.type==='place'){
      if(Math.hypot(e.clientX-D.start.x,e.clientY-D.start.y)>12&&e.pointerType==='mouse') return;
      const raw=toWorld(e); const pt=cursorFor(raw,e);
      if(tool==='wall') placeWallPt(pt);
      else if(tool==='room'||tool==='shape') placeRoomPt(pt);
      else if(tool==='door'||tool==='window'){ if(e.pointerType!=='mouse'){const nw=nearestWall(raw);if(nw){const L=wlen(nw.w);let pos=Math.max(18,Math.min(L-18,Math.round(nw.pr.t*L)));const o=tool==='door'?{id:uid('op'),wall:nw.w.id,type:'door',pos,width:36,height:80,sill:0,hinge:0,swing:1,status:'new'}:{id:uid('op'),wall:nw.w.id,type:'window',pos,width:36,height:48,sill:36,operation:'double-hung',status:'new'};commit({...p,openings:[...p.openings,o]});setSel({kind:'opening',id:o.id});}} else placeOpening(); }
      else if(tool==='fixture'){let f=newFixture(fixtureType,lv.id,pt.x,pt.y,0);const t=fxDef(fixtureType);if(!t.free)f=snapFixtureToWall(p,lv.id,f,pt,f.d/2+18);commit({...p,fixtures:[...(p.fixtures||[]),f]});setSel({kind:'fixture',id:f.id});}
      else if(tool==='stair'){const s={id:uid('st'),level:lv.id,x:pt.x,y:pt.y,width:36,tread:MIN_TREAD,dir:'N',rise:null};commit({...p,stairs:[...p.stairs,s]});setSel({kind:'stair',id:s.id});setTool('select');}
      else if(tool==='measure'){ setMeas(m=>m.length>=2||!m.length?[pt]:[m[0],pt]); }
      else if(tool==='elec'){let d=newElec(elecType,lv.id,pt.x,pt.y,0);if(ELEC[elecType].mount==='wall')d=snapElecToWall(p,lv.id,d,raw);commit({...p,elec:[...(p.elec||[]),d]});setSel({kind:'elec',id:d.id});}
      else if(tool==='ramp'){const nw=nearestWall(raw);let x=pt.x,y=pt.y,dir='S';if(nw&&nw.w.kind==='exterior'){const ext=p.walls.filter(w=>w.level===lv.id&&w.kind==='exterior');const on=outwardNormal(ext,nw.w);dir=Math.abs(on.x)>Math.abs(on.y)?(on.x>0?'E':'W'):(on.y>0?'S':'N');x=nw.pr.x+on.x*nw.w.thick/2;y=nw.pr.y+on.y*nw.w.thick/2;}
        const r={id:uid('rp'),level:lv.id,x,y,dir,width:48,slope:12,rise:null,mat:'wood',status:'new'};commit({...p,ramps:[...(p.ramps||[]),r]});setSel({kind:'ramp',id:r.id});setTool('select');}
      else if(tool==='dim'){ if(meas.length===1){if(dist(meas[0],pt)>0.5){const dm={id:uid('dm'),level:lv.id,a:{x:meas[0].x,y:meas[0].y},b:{x:pt.x,y:pt.y},off:18};commit({...p,dims:[...(p.dims||[]),dm]});setSel({kind:'dim',id:dm.id});}setMeas([]);} else setMeas([pt]); }
      else if(XT){xAddPt(pt,raw);}
      else if(tool==='note'){const n={id:uid('an'),level:lv.id,x:pt.x,y:pt.y,text:'Note',size:9};commit({...p,annos:[...(p.annos||[]),n]});setSel({kind:'anno',id:n.id});setTool('select');}
      return;
    }
    if(D.type==='rect'){
      setRect(null); const a=D.a,b=cursorFor(toWorld(e),e);
      let r; if(Math.abs(a.x-b.x)<12||Math.abs(a.y-b.y)<12){r=roofOverLevel(p,lv.id);if(!r)return;}
      else r={id:uid('rf'),level:lv.id,style:'gable',pitch:6,overhang:12,ridge:Math.abs(a.x-b.x)>=Math.abs(a.y-b.y)?'x':'y',x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(a.x-b.x),h:Math.abs(a.y-b.y)};
      commit({...p,roofs:[...p.roofs,r]}); setSel({kind:'roof',id:r.id}); setTool('select'); return;
    }
    if(D.type==='xrect'){setRect(null);const pt=cursorFor(toWorld(e),e);if(D.moved)xPlace([D.a,pt],toWorld(e));else setXpts([D.a]);return;}
    if(D.type==='pan') return;
    if(D.type==='box'){setBox(null);const items=itemsInBox(p,lv.id,D.a,toWorld(e));setSel(items.length>1?{kind:'multi',items}:items.length?items[0]:null);return;}
    if(D.moved) props.commitPreview();
  }

  /* ---- drawing ---- */
  const {w:W,h:H}=size; const out=[];
  // grid
  const wx0=-view.tx/view.s, wy0=-view.ty/view.s, wx1=(W-view.tx)/view.s, wy1=(H-view.ty)/view.s;
  const gl=[]; const step=view.s*12>=7?12:view.s*60>=7?60:120;
  for(let x=Math.floor(wx0/step)*step;x<=wx1;x+=step){const sx=x*view.s+view.tx;gl.push(html`<line key=${'gx'+x} x1=${sx} y1=${0} x2=${sx} y2=${H} className=${x%120===0?'g-major':'g-minor'}/>`);}
  for(let y=Math.floor(wy0/step)*step;y<=wy1;y+=step){const sy=y*view.s+view.ty;gl.push(html`<line key=${'gy'+y} x1=${0} y1=${sy} x2=${W} y2=${sy} className=${y%120===0?'g-major':'g-minor'}/>`);}

  const poly=pts=>pts.map(([x,y])=>S(x,y).join(',')).join(' ');
  const wallPoly=(w,j)=>{const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2,ja=j?j.a:0,jb=j?j.b:0;
    const a={x:w.x1-d.x*ja,y:w.y1-d.y*ja},b={x:w.x2+d.x*jb,y:w.y2+d.y*jb};
    return [[a.x+n.x*t,a.y+n.y*t],[b.x+n.x*t,b.y+n.y*t],[b.x-n.x*t,b.y-n.y*t],[a.x-n.x*t,a.y-n.y*t]];};

  // rooms
  const rooms=p.rooms.filter(r=>r.level===lv.id);
  const roomEls=rooms.map(r=>html`<polygon key=${r.id} points=${poly(r.pts)} className=${'room r-'+r.use+(selHas(r.id)?' room-sel':'')}/>`);
  const roomLabels=rooms.map(r=>{const [cx,cy]=polyLabelPt(r.pts);const [sx,sy]=S(cx,cy);const a=polyArea(r.pts)/144;const xs=r.pts.map(q=>q[0]),ys=r.pts.map(q=>q[1]);const bw=(Math.max(...xs)-Math.min(...xs))*view.s,bh=(Math.max(...ys)-Math.min(...ys))*view.s;if(bw<r.name.length*9+10||bh<40)return null;
    return html`<g key=${'rl'+r.id}><text x=${sx} y=${sy-2} textAnchor="middle" className="rname halo">${r.name}</text><text x=${sx} y=${sy+13} textAnchor="middle" className="rarea halo">${Math.round(a)} sq ft</text></g>`;});
  // ghost of level below
  const ghostEls=[...ghost.map(w=>html`<polygon key=${'gh'+w.id} points=${poly(wallPoly(w))} className="w-ghost"/>`),...compareWalls.filter(w=>w.level===lv.id).map(w=>html`<polygon key=${'cmp'+w.id} points=${poly(wallPoly(w))} className="w-compare"/>`)];
  // stairs
  const cnum=useMemo(()=>cabNumbers(p),[p.fixtures,p.rooms]);const ctrGeo=useMemo(()=>counterGeo(p,lv.id),[p.fixtures,p.walls,p.settings,lv.id]);
  const fixEls=[...(p.fixtures||[]).filter(f=>f.level===lv.id).map(f=>html`<g key=${f.id} data-id=${f.id}>${fxPlanSymbol(f,S,'fx'+(selHas(f.id)?' fx-sel':'')+(f.status==='demolish'?' fx-demo':'')+(f.type==='filler'?' fx-filler':''))}${cnum[f.id]&&view.s>0.9&&SH.cabnums?(()=>{const [x,y]=S(f.x,f.y);return html`<g className="cabnum"><circle cx=${x} cy=${y} r="7"/><text x=${x} y=${y+3.5} textAnchor="middle">${cnum[f.id]}</text></g>`;})():null}</g>`),
    ...ctrGeo.map((c,i)=>html`<g key=${'ctr'+i}><polygon points=${c.pts.map(q=>S(q.x,q.y).join(',')).join(' ')} className="ctr"/>${c.holes.map((h,j)=>html`<polygon key=${j} points=${h.map(q=>S(q.x,q.y).join(',')).join(' ')} className="ctr-sink"/>`)}</g>`)];
  if(tool==='fixture'&&cursor){let g=newFixture(fixtureType,lv.id,cursor.x,cursor.y,0);if(!fxDef(fixtureType).free)g=snapFixtureToWall(p,lv.id,g,cursor,g.d/2+18);var fixGhost=html`<g className="fx-ghost">${fxPlanSymbol(g,S,'fx')}</g>`;}
  const elecEls=(p.elec||[]).filter(d=>d.level===lv.id).map(d=>html`<g key=${d.id} className=${d.status==='demolish'?'el-demo':''}>${elecSVG(d,S,view.s,'el'+(selHas(d.id)?' el-sel':''))}</g>`);
  if(SH.legs!==false&&showElec)for(const s2 of (p.elec||[]).filter(d=>d.level===lv.id&&d.links&&d.links.length&&!(sel&&sel.id===d.id)))for(const id of s2.links){const t=(p.elec||[]).find(d=>d.id===id);if(!t)continue;const [ax,ay]=S(s2.x,s2.y),[bx,by]=S(t.x,t.y);elecEls.push(html`<path key=${'lka'+s2.id+id} d=${`M${ax},${ay} Q${(ax+bx)/2-(by-ay)*0.2},${(ay+by)/2+(bx-ax)*0.2} ${bx},${by}`} className="el-link el-link-faint"/>`);}
  {const sw=sel&&sel.kind==='elec'?(p.elec||[]).find(d=>d.id===sel.id):null;if(sw&&sw.links)for(const id of sw.links){const t=(p.elec||[]).find(d=>d.id===id);if(!t)continue;const [ax,ay]=S(sw.x,sw.y),[bx,by]=S(t.x,t.y);elecEls.push(html`<path key=${'lk'+id} d=${`M${ax},${ay} Q${(ax+bx)/2-(by-ay)*0.2},${(ay+by)/2+(bx-ax)*0.2} ${bx},${by}`} className="el-link"/>`);}}
  if(tool==='elec'&&cursor){let g=newElec(elecType,lv.id,cursor.x,cursor.y,0);if(ELEC[elecType].mount==='wall')g=snapElecToWall(p,lv.id,g,cursor);elecEls.push(html`<g key="ghost" className="el-ghost">${elecSVG(g,S,view.s,'el')}</g>`);}
  const stairEls=[...p.stairs.filter(s=>{const l=lvlOf(p,s.level);const u=l&&levelAbove(p,l);return u&&u.id===lv.id;}).map(s=>html`<g key=${'gs'+s.id}>${stairSVG(p,s,S,view,false,true)}</g>`),
    ...p.stairs.filter(s=>s.level===lv.id).map(s=>html`<g key=${s.id}>${stairSVG(p,s,S,view,selHas(s.id),false)}</g>`)];
  const stairElsOld=[].map(s=>{const si=stairInfo(p,s);const isSel=selHas(s.id);const lines=[];
    for(let i=1;i<=si.treads;i++){const a={x:si.corners[0].x+si.d.x*s.tread*i,y:si.corners[0].y+si.d.y*s.tread*i},b={x:si.corners[1].x+si.d.x*s.tread*i,y:si.corners[1].y+si.d.y*s.tread*i};const [ax,ay]=S(a.x,a.y),[bx,by]=S(b.x,b.y);lines.push(html`<line key=${i} x1=${ax} y1=${ay} x2=${bx} y2=${by} className="st"/>`);}
    const [s0x,s0y]=S(s.x+si.d.x*6,s.y+si.d.y*6),[s1x,s1y]=S(s.x+si.d.x*(si.run-8),s.y+si.d.y*(si.run-8));
    const ang=Math.atan2(s1y-s0y,s1x-s0x);const ah=8;
    return html`<g key=${s.id}><polygon points=${poly(si.corners.map(c=>[c.x,c.y]))} className=${'st'+(isSel?' st-sel':'')}/>${lines}
      <line x1=${s0x} y1=${s0y} x2=${s1x} y2=${s1y} className="st"/>
      <polygon className="st-arrow" points=${`${s1x},${s1y} ${s1x-ah*Math.cos(ang-0.45)},${s1y-ah*Math.sin(ang-0.45)} ${s1x-ah*Math.cos(ang+0.45)},${s1y-ah*Math.sin(ang+0.45)}`}/>
      ${view.s>0.5?html`<text x=${(s0x+s1x)/2} y=${(s0y+s1y)/2-6} textAnchor="middle" className="dimt halo">UP ${si.risers}R</text>`:null}</g>`;});
  // walls
  const wallEls=walls.map(w=>html`<polygon key=${w.id} data-id=${w.id} points=${poly(wallPoly(w,joins[w.id]))} className=${'w-'+(w.status||'new')+(selHas(w.id)?' w-sel':'')}/>`);
  // openings
  const opEls=[];
  for(const o of p.openings){const w=walls.find(w=>w.id===o.wall);if(!w)continue;const L=wlen(w),d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2;
    const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));const s0=pos-o.width/2,s1=pos+o.width/2;
    const P=(s,off)=>S(w.x1+d.x*s+n.x*off,w.y1+d.y*s+n.y*off);
    const cut=[P(s0,t+0.6),P(s1,t+0.6),P(s1,-t-0.6),P(s0,-t-0.6)].map(q=>q.join(',')).join(' ');
    const isSel=selHas(o.id); const cls='op'+(isSel?' op-sel':'');
    const parts=[html`<polygon key="c" points=${cut} className="cut"/>`];
    const ln=(k,a,b,c=cls)=>parts.push(html`<line key=${k} x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]} className=${c}/>`);
    ln('j1',P(s0,t),P(s0,-t)); ln('j2',P(s1,t),P(s1,-t));
    if(o.type==='window'){ln('f1',P(s0,t),P(s1,t));ln('f2',P(s0,-t),P(s1,-t));ln('g',P(s0,0),P(s1,0),isSel?'op-sel':'op-glass');}
    else{doorGeom(o,t,s0,s1).forEach((g,i)=>parts.push(html`<polyline key=${'dg'+i} points=${g.pts.map(([a,b])=>P(a,b).join(',')).join(' ')} className=${cls+(g.thick?' op-thick':'')} strokeDasharray=${g.dash?'3 3':undefined} fill="none"/>`));}
    if(o.bay&&o.bay.kind){const bp=bayPlanSVG(p,o,w,S,isSel);if(bp)parts.push(bp);}
    if(o.type==='window'&&w.kind==='exterior'){const wp=wellPlanSVG(p,o,w,S,isSel);if(wp)parts.push(wp);}
    opEls.push(html`<g key=${o.id}>${parts}</g>`);}
  // wall dimensions
  let cx=0,cy=0; if(walls.length){for(const w of walls){cx+=w.x1+w.x2;cy+=w.y1+w.y2;}cx/=walls.length*2;cy/=walls.length*2;}
  const dimEls=walls.map(w=>{const L=wlen(w);const isSelW=selHas(w.id);if(L*view.s<46)return null;if(w.kind!=='exterior'&&!isSelW&&view.s<1.5)return null;const d=wdir(w);let n={x:-d.y,y:d.x};const mx=(w.x1+w.x2)/2,my=(w.y1+w.y2)/2;
    if(w.kind==='exterior'&&((mx-cx)*n.x+(my-cy)*n.y)<0)n={x:-n.x,y:-n.y};
    const off=w.thick/2+13/view.s;const [sx,sy]=S(mx+n.x*off,my+n.y*off);let ang=Math.atan2(d.y,d.x)*180/Math.PI;if(ang>90)ang-=180;if(ang<=-90)ang+=180;
    const isSel=selHas(w.id);return html`<text key=${'d'+w.id} x=${sx} y=${sy+4} textAnchor="middle" transform=${`rotate(${ang} ${sx} ${sy})`} className=${'dimt halo'+(isSel?' dimt-sel':'')}>${fmtLen(L)}</text>`;});
  // roofs
  const RG=useMemo(()=>roofPlanGeo(p,lv.id),[p.roofs,p.levels,lv.id]);
  const roofEls=[...p.roofs.filter(r=>r.level===lv.id).map(r=>{const b=roofBuild(r,0);const isSel=selHas(r.id);return isSel?html`<polygon key=${r.id} points=${poly(b.outline.map(q=>[q[0],q[1]]))} className="roofl roofl-sel"/>`:null;}),
    ...RG.edges.map((e,i)=>{const [ax,ay]=S(e.a[0],e.a[1]),[bx,by]=S(e.b[0],e.b[1]);return html`<line key=${'re'+i} x1=${ax} y1=${ay} x2=${bx} y2=${by} className="roofe"/>`;}),
    ...RG.lines.map((l,i)=>{const [ax,ay]=S(l.a[0],l.a[1]),[bx,by]=S(l.b[0],l.b[1]);return html`<line key=${'rl'+i} x1=${ax} y1=${ay} x2=${bx} y2=${by} className=${l.kind==='valley'?'roofv':'roofr'}/>`;})];
  // registered parts
  const hiddenKinds=new Set([...(SH.site?[]:['site']),...(SH.decks?[]:['deck','steps']),...(SH.cad?[]:['cad'])]);
  const regEls=layer2=>objKinds(layer2).flatMap(k=>{const d=OBJ[k];if(!d.svg||hiddenKinds.has(k))return [];return objsOn(p,k,lv.id).map(o=>html`<g key=${o.id} className=${o.status==='demolish'?'reg-demo':''}>${d.svg(p,lv,o,S,view,selHas(o.id))}</g>`);});
  const regUnder=regEls('under'), regOver=regEls('over');
  // selection handles
  const markerPts=[];{const seen={};for(const i of issues){if(!i.pt||i.level!==lv.id)continue;const key=Math.round(i.pt.x/6)+','+Math.round(i.pt.y/6);const n=seen[key]=(seen[key]||0)+1;const [sx,sy]=S(i.pt.x,i.pt.y);const isRoom=i.target&&i.target.kind==='room';markerPts.push({i,x:sx+(isRoom?0:14)+(n-1)*18,y:sy-(isRoom?30:14)});}}
  const markers=markerPts.map(m=>html`<g key=${'is'+m.i.id} className=${'iss iss-'+m.i.sev}><title>${m.i.title}</title><circle cx=${m.x} cy=${m.y} r="8.5"/><text x=${m.x} y=${m.y+4} textAnchor="middle">!</text></g>`);
  const handles=[];
  if(sel&&sel.kind==='wall'){const w=walls.find(w=>w.id===sel.id);if(w)for(const [k,x,y] of [['a',w.x1,w.y1],['b',w.x2,w.y2]]){const [sx,sy]=S(x,y);handles.push(html`<circle key=${k} cx=${sx} cy=${sy} r="6" className="handle"/>`);}}
  if(sel&&sel.kind==='room'){const r=rooms.find(r=>r.id===sel.id);if(r)r.pts.forEach((q,i)=>{const [sx,sy]=S(q[0],q[1]);handles.push(html`<circle key=${'v'+i} cx=${sx} cy=${sy} r="5" className="handle"/>`);});}
  // drafts
  const drafts=[];
  if((tool==='wall'||tool==='room'||tool==='shape')&&chain.length){
    if((tool==='room'||tool==='shape')&&chain.length>1) drafts.push(html`<polyline key="rc" points=${chain.map(c=>S(c.x,c.y).join(',')).join(' ')} className="draft"/>`);
    if(cursor){const last=chain[chain.length-1];const [ax,ay]=S(last.x,last.y),[bx,by]=S(cursor.x,cursor.y);const L=dist(last,cursor);
      if(tool==='wall'){const pre=WALL_PRESETS[wallPreset];drafts.push(html`<polygon key="wp" points=${poly(wallPoly({x1:last.x,y1:last.y,x2:cursor.x,y2:cursor.y,thick:pre.thick}))} className="draft-fill"/>`);}
      else drafts.push(html`<line key="rl" x1=${ax} y1=${ay} x2=${bx} y2=${by} className="draft"/>`);
      if(L>0.5)drafts.push(html`<text key="dl" x=${(ax+bx)/2} y=${(ay+by)/2-10} textAnchor="middle" className="draft-t halo">${fmtLen(L)}</text>`);}
  }
  if((tool==='room'||tool==='shape')&&chain.length){for(const [i,c] of chain.entries()){const [sx,sy]=S(c.x,c.y);drafts.push(html`<circle key=${'cp'+i} cx=${sx} cy=${sy} r=${i===0?5:3} className="snap-end"/>`);}}
  if(XT&&(xpts.length||cursor)){const pts=cursor&&tool!=='select'?[...xpts,cursor]:xpts;
    if(XT.ghost){const g=XT.ghost(xctx(),pts,cursor,S,view);if(g)drafts.push(html`<g key="xg" className="xghost">${g}</g>`);}
    else if(pts.length>1)drafts.push(html`<polyline key="xl" points=${pts.map(c=>S(c.x,c.y).join(',')).join(' ')} className="draft"/>`);
    if(xpts.length&&cursor){const last=xpts[xpts.length-1];const L=dist(last,cursor);const [ax,ay]=S(last.x,last.y),[bx,by]=S(cursor.x,cursor.y);if(L>0.5)drafts.push(html`<text key="xd" x=${(ax+bx)/2} y=${(ay+by)/2-10} textAnchor="middle" className="draft-t halo">${fmtLen(L)}</text>`);}
    for(const [i,c] of xpts.entries()){const [sx,sy]=S(c.x,c.y);drafts.push(html`<circle key=${'xp'+i} cx=${sx} cy=${sy} r="3.5" className="snap-end"/>`);}}
  if(box){const x0=Math.min(box.a.x,box.b.x),y0=Math.min(box.a.y,box.b.y),x1=Math.max(box.a.x,box.b.x),y1=Math.max(box.a.y,box.b.y);drafts.push(html`<polygon key="bx" points=${poly([[x0,y0],[x1,y0],[x1,y1],[x0,y1]])} className="selbox"/>`);}
  if(rect){const x0=Math.min(rect.a.x,rect.b.x),y0=Math.min(rect.a.y,rect.b.y),x1=Math.max(rect.a.x,rect.b.x),y1=Math.max(rect.a.y,rect.b.y);drafts.push(html`<polygon key="rr" points=${poly([[x0,y0],[x1,y0],[x1,y1],[x0,y1]])} className="draft-fill"/>`);
    const [tx,ty]=S((x0+x1)/2,y0);drafts.push(html`<text key="rt" x=${tx} y=${ty-8} textAnchor="middle" className="draft-t halo">${fmtLen(x1-x0)} × ${fmtLen(y1-y0)}</text>`);}
  if((tool==='door'||tool==='window')&&hover){const {w,pos,width}=hover;const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2+1;const P=(s,o)=>[w.x1+d.x*s+n.x*o,w.y1+d.y*s+n.y*o];
    drafts.push(html`<polygon key="oh" points=${poly([P(pos-width/2,t),P(pos+width/2,t),P(pos+width/2,-t),P(pos-width/2,-t)])} className="draft-fill"/>`);
    if(tool==='door'){const it=LIB_BY_ID[openPreset.door];const og={...(it?openingFromLib(it):{type:'door',width,height:80}),hinge:hover.hinge,swing:hover.side};doorGeom(og,w.thick/2,pos-width/2,pos+width/2).forEach((g,i)=>drafts.push(html`<polyline key=${'ohg'+i} points=${poly(g.pts.map(([a,b])=>P(a,b)))} className="draft-line" fill="none" strokeDasharray=${g.dash?'3 3':undefined}/>`));}}
  if(meas.length){const a=meas[0],b=meas[1]||(tool==='measure'||tool==='dim'?cursor:null);if(b){const [ax,ay]=S(a.x,a.y),[bx,by]=S(b.x,b.y);drafts.push(html`<line key="ml" x1=${ax} y1=${ay} x2=${bx} y2=${by} className="meas"/>`,html`<text key="mt" x=${(ax+bx)/2} y=${(ay+by)/2-8} textAnchor="middle" className="meas-t halo">${fmtLen(dist(a,b))}</text>`);}
    const [ax,ay]=S(a.x,a.y);drafts.push(html`<circle key="m0" cx=${ax} cy=${ay} r="3" className="snap-end"/>`);}
  if(cursor&&tool!=='select'&&tool!=='door'&&tool!=='window'){const [sx,sy]=S(cursor.x,cursor.y);
    drafts.push(snapGlyph(cursor,S));}

  const hints={
    select:html`<b>Select</b> an item to edit it. Drag to move; drag a wall's end dots to stretch it. <b>Shift-drag</b> a box or Shift-click to pick several; arrow keys nudge 1" (Shift: 12"). Drag empty space to pan.`,
    wall:chain.length?html`Click the next corner, or <b>type a length</b> (12'6", 150", bare numbers are feet) and press Enter. Press <b>Esc</b> (or Enter, double-click, right-click, or the Finish button) to stop drawing walls; press Esc again to put the wall tool away.`:html`<b>Wall:</b> click the first corner. Lines snap to 45° and the ${fmtLen(grid)} grid; hold Shift for free angles.`,
    door:html`<b>Door:</b> click on a wall to place ${LIB_BY_ID[openPreset.door]?html`a <b>${LIB_BY_ID[openPreset.door].label}</b>`:'a 36" door'}. It swings to the side your pointer is on, hinged at the end nearest the pointer; change handing and hardware after. Pick other doors in the Library.`,
    window:html`<b>Window:</b> click on a wall to place ${LIB_BY_ID[openPreset.window]?html`a <b>${LIB_BY_ID[openPreset.window].label}</b>`:'a 36" × 48" window'}. Pick other windows in the Library.`,
    room:chain.length>=3?html`Click the first corner or press Enter to close the room.`:html`<b>Room:</b> click <b>inside</b> closed walls and the room draws itself, or start on a wall corner and click each corner in order.`,
    fixture:html`<b>Fixture:</b> pick a fixture or cabinet at the top, then click to place it. Cabinets and plumbing fixtures turn to put their back against the nearest wall. Hold Shift while dragging to move freely.`,
    stair:html`<b>Stair:</b> click where the bottom step starts. Set direction and width in the panel.`,
    roof:html`<b>Roof:</b> drag a rectangle over the walls, or click once to roof the whole level.`,
    measure:html`<b>Measure:</b> click two points.`,
    elec:html`<b>Electrical:</b> pick a device at the top and click to place it. Wall devices snap to the wall face on the side you click. Use <b>Auto-place</b> to lay out a whole floor to the IRC spacing rules.`,
    ramp:html`<b>Ramp:</b> click on the outside wall at a door. The ramp runs away from the house at 1:12 with 60" landings; set the rise in the panel.`,
    shape:chain.length>=3?html`Click the first corner or press Enter (or Esc) to finish the shape.`:html`<b>Shape:</b> click the corners of any outline, then set its height to make a solid. Use it for built-ins, columns, porches, planters or counters.`,
    dim:meas.length?html`Click the second point. Lines snap to wall ends and corners.`:html`<b>Dimension:</b> click two points to add a dimension that prints on the plans. Drag it to move it; set its offset in the panel.`,
    note:html`<b>Note:</b> click where the note goes, then type it in the panel. Notes print on the plans.`,
  };
  const cur=tool==='select'?(drag.current&&drag.current.type==='pan'?'grabbing':'default'):'crosshair';
  return html`<div className="pane">
    <svg ref=${svgRef} tabIndex="0" className="plan" style=${{cursor:cur}} onPointerDown=${onDown} onPointerMove=${onMove} onPointerUp=${onUp} onPointerCancel=${onUp}
      onPointerLeave=${()=>setCursor(c=>tool==='select'?null:c)} onDoubleClick=${()=>{if(tool==='wall'||tool==='room'||tool==='shape'||(XT&&XT.mode==='chain'))finishChain();}} onContextMenu=${e=>e.preventDefault()}>
      <g>${gl}</g><g>${roomEls}</g>${under&&under.u?html`<image href=${under.u.url} x=${S(under.u.x,under.u.y)[0]} y=${S(under.u.x,under.u.y)[1]} width=${under.u.w*under.u.scale*view.s} height=${under.u.h*under.u.scale*view.s} opacity=${under.u.opacity} preserveAspectRatio="none" style=${{pointerEvents:'none'}}/>`:null}${under&&under.slice?html`<image href=${under.slice.url} x=${S(under.slice.x,under.slice.y)[0]} y=${S(under.slice.x,under.slice.y)[1]} width=${under.slice.w*view.s} height=${under.slice.h*view.s} preserveAspectRatio="none" style=${{pointerEvents:'none'}}/>`:null}<g>${SH.ghost?ghostEls:null}</g><g>${stairEls}</g><g>${SH.fixtures?fixEls:null}</g><g>${regUnder}</g><g>${draftSVG({...p,elec:[],dims:SH.dims?(p.dims||[]).filter(d=>layerOn(p,d.layer||'L-DIM')):[],annos:SH.notes?(p.annos||[]).filter(n=>layerOn(p,n.layer||'L-TEXT')):[]},lv,S,view,sel)}</g>${showElec?html`<g>${elecEls}</g>`:null}<g>${wallEls}</g><g>${opEls}</g><g>${regOver}</g><g>${SH.roof?roofEls:null}</g><g>${SH.roomLabels?roomLabels:null}</g><g>${SH.wallDims?dimEls:null}</g><g>${SH.issues?markers:null}</g><g>${drafts}</g><g>${typeof fixGhost!=='undefined'?fixGhost:null}</g><g>${handles}</g>
    </svg>
    <div className="optbar"><span className="badgeplan">Plan · ${lv.name}</span>${props.optbar}</div>
    <div className="corner"><button className=${'btn'+(disp?' on':'')} onClick=${()=>setDisp(!disp)} title="What shows in the plan, object snaps and drafting layers">Display</button><button className="btn" onClick=${fit} title="Fit drawing (F)">Fit</button></div>
    ${disp?html`<${DisplayPopover} p=${p} commit=${commit} onClose=${()=>setDisp(false)}/>`:null}
    <div className="overlay">
      <div className="hint">${XT?(XT.hint?XT.hint(xpts.length,xctx()):html`<b>${XT.label}</b>`):hints[tool]}</div>
      ${lenBuf?html`<div className="lenbuf">${lenBuf}▍</div>`:null}
      ${((tool==='wall'||tool==='room'||tool==='shape')&&chain.length)||(XT&&XT.mode==='chain'&&xpts.length)?html`<button className="btn" style=${{pointerEvents:'auto'}} onClick=${finishChain}>${tool==='room'?'Close room':'Finish'}</button>`:null}
      ${cursor&&cursor.kind!=='none'?html`<div className="coords">x ${fmtLen(cursor.x)}  y ${fmtLen(cursor.y)}${cursor.kind&&!['grid','ortho','none'].includes(cursor.kind)?' · '+(OSNAP_LIST.find(x=>x[0]===cursor.kind)||['',cursor.kind])[1]:''}</div>`:null}
    </div>
    ${props.narrow?null:html`<form className="cmdbar" onSubmit=${e=>{e.preventDefault();runCmd(cmd);setCmd('');}}><input ref=${cmdRef} className="inp" value=${cmd} placeholder="Command (press /): L line · W wall · @36,0 · 10'<45 · RO 90 · O 6 · MI · TR · U" onChange=${e=>setCmd(e.target.value)} onKeyDown=${e=>{if(e.key==='Escape'){setCmd('');e.target.blur();}}} aria-label="Command line"/>${cmdLog?html`<span className="cmdlog">${cmdLog}</span>`:null}</form>`}
  </div>`;
}

