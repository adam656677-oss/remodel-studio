/* ======================= wall framing elevations, header schedule and cut list ======================= */
// Same layout as the 3D framing view: studs 16" o.c. from the wall start, single bottom plate (cut at doors), double top plate,
// king and jack studs at each opening, headers sized by the structure check (R602.7), sills and cripples.
function wallFraming(p,w,headers){const L=wlen(w),H=wallH(p,w);const J=wallJoins(p.walls.filter(x=>x.level===w.level));const sA=-(J[w.id]?.a||0),sB=L+(J[w.id]?.b||0);const sp=w.studSpacing||16;const st=studOf(w);
  const M=[];const add=(kind,s0,s1,z0,z1,extra={})=>{if(s1-s0>0.1&&z1-z0>0.1)M.push({kind,s0,s1,z0,z1,...extra});};const bearing=w.bearing||w.kind==='exterior';
  const ops=p.openings.filter(o=>o.wall===w.id&&o.status!=='demolish').map(o=>{const pos=Math.max(o.width/2,Math.min(L-o.width/2,o.pos));return {o,s0:pos-o.width/2-1.5,s1:pos+o.width/2+1.5,ro0:pos-o.width/2,ro1:pos+o.width/2};}).sort((a,b)=>a.s0-b.s0);
  {let c=sA;for(const q of ops){if(q.o.type==='door'){add('plate',c,q.ro0,0,1.5);c=q.ro1;}}add('plate',c,sB,0,1.5);}
  add('plate',sA,sB,H-3,H-1.5);add('plate',sA,sB,H-1.5,H,{top:true});
  const xs=new Set();for(let s=Math.max(0,sA+0.75);s<=sB-0.75;s+=sp)xs.add(Math.round(s*100)/100);xs.add(sA+0.75);xs.add(sB-0.75);
  for(const q of ops){const o=q.o;const sill=o.type==='door'?0:o.sill,head=sill+o.height;const hd0=headers&&headers[o.id];const hd=bearing?Math.max(3.5,Math.min(11.25,H-4.5-head,hd0&&hd0.d||11.25)):1.5;
    add('king',q.s0-1.5,q.s0,1.5,H-3);add('king',q.s1,q.s1+1.5,1.5,H-3);add('jack',q.s0,q.ro0,1.5,head);add('jack',q.ro1,q.s1,1.5,head);
    add('header',q.s0,q.s1,head,head+hd,{o,size:hd0?hd0.size:(bearing?'(2) 2x12':'Flat 2x'),span:q.s1-q.s0});if(H-3-(head+hd)>0.2&&H-3-(head+hd)<6)add('block',q.s0,q.s1,head+hd,H-3);
    if(o.type==='window'){add('sill',q.ro0,q.ro1,sill-1.5,sill);if(sill>4)add('sill',q.ro0,q.ro1,sill-3,sill-1.5);}
    q.head=head;q.hd=hd;q.sill=sill;}
  for(const s of [...xs].sort((a,b)=>a-b)){const q=ops.find(q=>s>q.s0-2.25&&s<q.s1+2.25);if(!q){add('stud',s-0.75,s+0.75,1.5,H-3);continue;}if(s<=q.s0-0.75||s>=q.s1+0.75)continue;
    if(q.o.type==='window'&&q.sill-4.5>=6)add('cripple',s-0.75,s+0.75,1.5,q.sill-3);const top=q.head+q.hd;if(H-3-top>=6)add('cripple',s-0.75,s+0.75,top,H-3);}
  // corner backing: three-stud corners at the ends that meet another wall
  for(const [end,s] of [['a',sA],['b',sB]])if(J[w.id]?.[end])add('corner',end==='a'?s+1.5:s-3,end==='a'?s+3:s-1.5,1.5,H-3);
  return {M,L,H,sA,sB,ops,stud:st,bearing};}
function headerMap(p){const out={};let mem=[];try{mem=analyzeStructure(p);}catch(e){}for(const m of mem)if(m.kind==='header'&&m.target)out[m.target.id]={size:m.size,d:/2x12/.test(m.size)?11.25:/2x10/.test(m.size)?9.25:/2x8/.test(m.size)?7.25:/2x6/.test(m.size)?5.5:/LVL/.test(m.size)?11.875:1.5,ok:m.ratio==null||m.ratio<=1,span:m.span};return out;}
// cut list for one wall or the whole job
function framingCutList(p,walls){const HM=headerMap(p);const rows={};const add=(item,qty,unit='EA')=>{rows[item]=rows[item]||{item,qty:0,unit};rows[item].qty+=qty;};
  for(const w of walls){const F=wallFraming(p,w,HM);const st=F.stud;const precut=F.H-4.5;const studName=`${st} stud ${Math.abs(precut-92.625)<0.3?'92-5/8" precut':Math.abs(precut-104.625)<0.3?'104-5/8" precut':fmtLen(precut)}`;
    for(const m of F.M){const L=m.s1-m.s0,Hh=m.z1-m.z0;if(['stud','king','corner'].includes(m.kind))add(studName,1);else if(m.kind==='jack')add(`${st} jack stud ${fmtLen(Math.ceil(Hh*8)/8)}`,1);else if(m.kind==='cripple')add(`${st} cripple ${fmtLen(Math.ceil(Hh*8)/8)}`,1);
      else if(m.kind==='plate')add(`${st} plate${m.top?' (top)':''}, LF`,L/12,'LF');else if(m.kind==='sill')add(`${st} rough sill ${fmtLen(Math.ceil(L*8)/8)}`,1);else if(m.kind==='header')add(`Header ${m.size} x ${fmtLen(Math.ceil(m.span*8)/8)}`,1);}}
  return Object.values(rows).map(r=>({...r,qty:r.unit==='LF'?Math.ceil(r.qty*1.05):r.qty})).sort((a,b)=>a.item>b.item?1:-1);}
function headerSchedule(p){const HM=headerMap(p);const marks=openingMarks(p);const out=[];for(const o of p.openings.filter(o=>o.status!=='demolish')){const w=p.walls.find(w=>w.id===o.wall);if(!w)continue;const bearing=w.bearing||w.kind==='exterior';const h=HM[o.id];
  out.push({mark:marks[o.id]||'',type:o.type,ro:`${fmtLen(o.width)} x ${fmtLen(o.height)}`,header:h?h.size:(bearing?'(2) 2x12':'Flat 2x'),span:fmtLen(o.width+3),jacks:o.width+3>72?2:1,bearing,ok:h?h.ok:true,level:w.level});}
  return out.sort((a,b)=>a.mark>b.mark?1:-1);}
const FR_COL={block:'#d8c08f',plate:'#8a6a3a',stud:'#c8a06a',king:'#b08a52',jack:'#d4b07c',header:'#a5562a',sill:'#b08a52',cripple:'#e0c08c',corner:'#b08a52'};
function WallFramingSVG({p,w,H0=260,W0=760}){const F=useMemo(()=>wallFraming(p,w,headerMap(p)),[p,w.id]);const sc=Math.min((W0-40)/(F.sB-F.sA),(H0-50)/F.H);const X=s=>20+(s-F.sA)*sc,Y=z=>H0-30-z*sc;
  return html`<svg className="wf-svg" viewBox=${`0 0 ${W0} ${H0}`} role="img" aria-label="Wall framing elevation">${F.M.map((m,i)=>html`<rect key=${i} x=${X(m.s0)} y=${Y(m.z1)} width=${Math.max(0.5,(m.s1-m.s0)*sc)} height=${Math.max(0.5,(m.z1-m.z0)*sc)} fill=${FR_COL[m.kind]} stroke="#5a4020" strokeWidth="0.4"><title>${m.kind}${m.size?' '+m.size:''}</title></rect>`)}
    ${F.ops.map((q,i)=>html`<g key=${'o'+i}><rect x=${X(q.ro0)} y=${Y(q.head)} width=${(q.ro1-q.ro0)*sc} height=${(q.head-(q.sill||0))*sc} fill="none" stroke="#1d3f7a" strokeDasharray="4 3"/><text x=${X((q.ro0+q.ro1)/2)} y=${Y(q.head+q.hd)-3} textAnchor="middle" className="wf-t">${(F.M.find(m=>m.kind==='header'&&m.o===q.o)||{}).size||''}</text></g>`)}
    <line x1=${X(F.sA)} y1=${H0-12} x2=${X(F.sB)} y2=${H0-12} stroke="#888"/><text x=${X((F.sA+F.sB)/2)} y=${H0-2} textAnchor="middle" className="wf-t">${fmtLen(F.sB-F.sA)} · ${F.stud} @ ${w.studSpacing||16}" o.c. · ${F.bearing?'load-bearing':'non-bearing'}</text></svg>`;}
function WallFramingModal({p,commit,sel,levelId,onClose}){const walls=p.walls.filter(w=>w.status!=='demolish'&&w.level===(levelId||p.levels[0].id));const [wid,setWid]=useState(sel&&sel.kind==='wall'?sel.id:(walls[0]||{}).id);const w=p.walls.find(x=>x.id===wid);
  const [scope,setScope]=useState('wall');const list=scope==='wall'&&w?[w]:p.walls.filter(x=>x.status!=='demolish'&&x.status!=='existing');const cut=useMemo(()=>framingCutList(p,list),[p,scope,wid]);const hs=useMemo(()=>headerSchedule(p),[p]);
  const label=x=>{const L=wlen(x);return `${x.kind==='exterior'?'Outside':'Inside'} wall ${fmtLen(L)} (${Math.round(x.x1/12)},${Math.round(x.y1/12)} to ${Math.round(x.x2/12)},${Math.round(x.y2/12)})`;};
  const csv=()=>{const q=s=>'"'+String(s).replace(/"/g,'""')+'"';saveFile(safeName(p.name)+'-framing-cut-list.csv',[['Qty','Unit','Item'].map(q).join(','),...cut.map(r=>[Math.round(r.qty*10)/10,r.unit,r.item].map(q).join(','))].join('\n'));};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide rw" role="dialog" aria-label="Wall framing"><h2>Wall framing</h2>
    <div className="row"><${Field} label="Wall" id="wf-w"><${Sel} id="wf-w" value=${wid||''} onChange=${setWid} options=${walls.map(x=>[x.id,label(x)])}/><//>
      ${w?html`<${Field} label="Studs" id="wf-sp"><${Sel} id="wf-sp" value=${String(w.studSpacing||16)} onChange=${v=>commit(updObj(p,'wall',w.id,{studSpacing:+v}))} options=${[['12','12" o.c.'],['16','16" o.c.'],['24','24" o.c. (advanced framing)']]}/><//>`:null}</div>
    ${w?html`<${WallFramingSVG} p=${p} w=${w}/>`:html`<p className="note">No walls on this level.</p>`}
    <div className="rw-grid"><div><h3>Cut list <select className="inp" value=${scope} onChange=${e=>setScope(e.target.value)} aria-label="Cut list scope"><option value="wall">This wall</option><option value="all">All new walls</option></select> <button className="btn small" onClick=${csv}>Download CSV</button></h3>
      <div className="tablewrap"><table className="mat"><thead><tr><th className="num">Qty</th><th>Unit</th><th>Item</th></tr></thead><tbody>${cut.map((r,i)=>html`<tr key=${i}><td className="num">${Math.round(r.qty*10)/10}</td><td>${r.unit}</td><td>${r.item}</td></tr>`)}</tbody></table></div></div>
    <div><h3>Header schedule</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Mark</th><th>Opening</th><th>Header</th><th>Jacks</th></tr></thead><tbody>${hs.map((h,i)=>html`<tr key=${i} className=${h.ok?'':'warnrow'}><td className="mono">${h.mark}</td><td>${h.type} ${h.ro}</td><td>${h.header}${h.bearing?'':' (non-bearing)'}</td><td className="num">${h.jacks}</td></tr>`)}</tbody></table></div>
      <p className="note">Headers come from the structure check (IRC R602.7). Over 6' openings get two jack studs each side.</p></div></div>
    <div className="row"><span className="spacer"></span><button className="btn primary" onClick=${onClose}>Done</button></div></div></div>`;}
EXTRA_DIALOGS.wallframe=WallFramingModal;
// sheet: header schedule and framing elevations of the new outside walls
function wallFramingSheet(p){const P=PAPERS[p.sheet?.paper]||PAPERS.tabloid;const k=P.k;const walls=p.walls.filter(w=>w.status!=='demolish'&&w.status!=='existing'&&w.kind==='exterior').sort((a,b)=>wlen(b)-wlen(a)).slice(0,6);if(!walls.length)return null;
  const dl=DL();const A=sheetFrame(dl,P,p,'S4.1','Wall framing elevations','1/4" = 1\'-0"');const HM=headerMap(p);const colW=(A.x1-A.x0-3.6*k)/2;let i=0;
  for(const w of walls){const F=wallFraming(p,w,HM);const sc=Math.min((colW-0.3*k)/(F.sB-F.sA),1.25*k/F.H);const ox=A.x0+0.2*k+(i%2)*colW,oy=A.y0+0.35*k+Math.floor(i/2)*(1.75*k);
    for(const m of F.M)dl.poly([[ox+(m.s0-F.sA)*sc,oy+(F.H-m.z1)*sc],[ox+(m.s1-F.sA)*sc,oy+(F.H-m.z1)*sc],[ox+(m.s1-F.sA)*sc,oy+(F.H-m.z0)*sc],[ox+(m.s0-F.sA)*sc,oy+(F.H-m.z0)*sc]],{stroke:INK,w:0.25,fill:m.kind==='header'?'#c9c9c9':'#ffffff'});
    dl.text(ox,oy+F.H*sc+0.14*k,`WALL ${i+1}: ${fmtLen(F.sB-F.sA)} · ${F.stud} @ ${w.studSpacing||16}" O.C.`,{size:5.5*k,bold:true});i++;}
  let y=A.y0+0.3*k;const x=A.x1-3.4*k;dl.text(x,y,'HEADER SCHEDULE',{size:7*k,bold:true});y+=0.2*k;for(const h of headerSchedule(p).slice(0,40)){dl.text(x,y,`${h.mark.padEnd(4)} ${h.type.padEnd(6)} ${h.ro.padEnd(16)} ${h.header}`,{size:4.6*k});y+=0.15*k;}
  return {id:'s-S4.1',no:'S4.1',title:'Wall framing elevations',w:P.w,h:P.h,items:dl.items,scale:''};}
{const _bs=buildSheets;buildSheets=function(p){const out=_bs(p);try{const s=wallFramingSheet(p);if(s){let i=-1;out.forEach((x,j)=>{if(/^S/.test(x.no))i=j;});out.splice(i>=0?i+1:out.length,0,s);}}catch(e){console.warn('wall framing sheet',e);}return out;};}
