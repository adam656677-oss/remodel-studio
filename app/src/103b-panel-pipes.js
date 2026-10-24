/* ======================= electrical panel schedule, pipe and duct runs, proposal PDF ======================= */
const WIRE={15:'14 AWG',20:'12 AWG',25:'10 AWG',30:'10 AWG',35:'8 AWG',40:'8 AWG',45:'6 AWG',50:'6 AWG',60:'6 AWG',70:'4 AWG',80:'4 AWG',90:'3 AWG',100:'3 AWG'};
const breakerFor=amps=>[15,20,25,30,35,40,45,50,60,70,80,90,100].find(b=>b>=amps)||100;
function panelSchedule(p){const S=serviceLoad(p);const L=S.L;const C=[];const fx=(p.fixtures||[]).filter(f=>f.status!=='demolish');const has=re=>fx.some(f=>re.test(f.type+' '+(f.name||'')));
  const devIn=(r,pred)=>(p.elec||[]).filter(d=>d.level===r.level&&d.status!=='demolish'&&pred(d)&&inPoly(d.x,d.y,r.pts)).length;const isRec=d=>/recept|gfci|counter|usb|floorrec/.test(d.type),isLt=d=>/light|can|pendant|fan|sconce|undercab/.test(d.type);
  const add=(desc,amps,poles,prot,va,note='')=>C.push({desc,amps,poles,prot,va:Math.round(va),wire:WIRE[amps]||'',note});
  // dedicated appliance and HVAC circuits (NEC 210.11, 210.52(B), 422, 440)
  const kitchens=p.rooms.filter(r=>r.use==='kitchen');add('Kitchen countertop receptacles A',20,1,'GFCI/AFCI',1500,'small-appliance 210.11(C)(1)');add('Kitchen countertop receptacles B',20,1,'GFCI/AFCI',1500,'small-appliance');
  if(L.range==='electric')add('Range',50,2,'',12000,'240 V');if(has(/dishwasher|\bdw\b/i))add('Dishwasher',20,1,'GFCI',1200);add('Disposal',20,1,'GFCI',900);add('Microwave',20,1,'AFCI',1500);add('Refrigerator',20,1,'',700);
  if(has(/washer/i)||p.rooms.some(r=>r.use==='laundry'))add('Laundry receptacles',20,1,'GFCI/AFCI',1500,'210.11(C)(2)');if(L.dryer==='electric')add('Dryer',30,2,'',5000,'240 V');
  if(L.wh==='electric')add('Water heater',30,2,'',4500,'240 V');else if(L.wh==='hp')add('Heat pump water heater',30,2,'',4500,'240 V');
  const tons=S.tons;if(L.hvac==='heatpump'||L.hvac==='gasac'||L.hvac==='elecac'){const mca=Math.round(tons*5.6+3);add(`Outdoor unit (${tons} ton)`,breakerFor(Math.round(mca*1.5)),2,'',tons*1400,'match the nameplate maximum breaker');}
  if(L.hvac==='heatpump'||L.hvac==='elecac'){const a=Math.round(L.strips*1000/240*1.25);add(`Air handler with ${L.strips} kW heat`,breakerFor(a),2,'',L.strips*1000+600,'');}else if(L.hvac==='gasac')add('Furnace blower',15,1,'',600);
  else if(L.hvac==='minisplit')add('Mini-split outdoor unit',breakerFor(tons*7),2,'',tons*1200);
  if(L.ev)add('EV charger',40,2,'GFCI',7680,'625.54');if(L.well)add('Well pump',20,2,'',2000);
  // bathrooms, garage, outside (210.11(C)(3), 210.52(E), (G))
  const baths=p.rooms.filter(r=>r.use==='bath');baths.forEach((b,i)=>add(`${b.name} receptacles${baths.length>1?'':''}`,20,1,'GFCI',1500,'210.11(C)(3)'));
  if(p.rooms.some(r=>r.use==='garage'))add('Garage receptacles',20,1,'GFCI',1500,'210.52(G)');add('Outdoor receptacles',20,1,'GFCI',1000,'210.52(E)');
  // general lighting and receptacles: about 450 sq ft per 15 A circuit (3 VA per sq ft, 80% load), AFCI in living areas (210.12)
  const gen=p.rooms.filter(r=>!['kitchen','bath','garage','laundry','porch'].includes(r.use)).map(r=>({r,a:polyArea(r.pts)/144}));let cur=null;
  for(const g of gen){if(!cur||cur.a+g.a>450){cur={names:[],a:0,rec:0,lt:0};C.push(cur);}cur.names.push(g.r.name);cur.a+=g.a;cur.rec+=devIn(g.r,isRec);cur.lt+=devIn(g.r,isLt);}
  for(const c of C)if(c.names){c.desc='Lights and receptacles: '+c.names.join(', ');c.amps=15;c.poles=1;c.prot='AFCI';c.va=Math.round(c.a*3);c.wire=WIRE[15];c.note=(c.rec||c.lt)?`${c.rec} receptacles, ${c.lt} lights`:'';}
  const kl=kitchens.reduce((s,r)=>s+polyArea(r.pts)/144,0)+baths.reduce((s,r)=>s+polyArea(r.pts)/144,0);if(kl)add('Lights: kitchen, baths, smoke and CO alarms',15,1,'AFCI',kl*3,'smoke alarms on a lighting circuit');
  // number the spaces: left column odd, right column even; 2-pole breakers take two spaces in one column
  let left=1,right=2,lsum=0,rsum=0;const sorted=C.slice().sort((a,b)=>b.poles-a.poles||b.va-a.va);
  for(const c of sorted){const useLeft=lsum<=rsum;if(useLeft){c.space=c.poles===2?`${left},${left+2}`:String(left);left+=c.poles*2;lsum+=c.va;}else{c.space=c.poles===2?`${right},${right+2}`:String(right);right+=c.poles*2;rsum+=c.va;}}
  const spaces=Math.max(left-1,right-2);const size=[12,16,20,24,30,40,42].find(n=>n>=spaces+4)||42;
  return {S,circuits:sorted,spaces,size,main:S.size,lsum,rsum};}
function PanelTable({p}){const P=panelSchedule(p);return html`<section className="sec"><h3>Panel schedule (${P.main} A main, ${P.size} spaces)</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Space</th><th>Circuit</th><th className="num">Breaker</th><th>Wire</th><th>Protection</th><th className="num">VA</th><th>Notes</th></tr></thead><tbody>
  ${P.circuits.map((c,i)=>html`<tr key=${i}><td className="mono">${c.space}</td><td>${c.desc}</td><td className="num mono">${c.amps} A${c.poles===2?' 2P':''}</td><td>${c.wire}</td><td>${c.prot}</td><td className="num mono">${c.va.toLocaleString()}</td><td className="note">${c.note}</td></tr>`)}</tbody></table></div>
  <p className="note">${P.circuits.length} circuits using ${P.spaces} spaces; left bus ${P.lsum.toLocaleString()} VA, right bus ${P.rsum.toLocaleString()} VA. AFCI per NEC 210.12 and GFCI per 210.8 (2020/2023 NEC); use dual-function breakers where both apply. Wire sizes are copper NM-B at 60°C for typical runs.</p></section>`;}
function panelSheet(P0,p){const k=P0.k;const dl=DL();const A=sheetFrame(dl,P0,p,'E0.1','Electrical panel schedule','');const P=panelSchedule(p);let y=A.y0+0.3*k;const W=A.x1-A.x0;
  dl.text(A.x0,y,`PANEL "A": ${P.main} A MAIN BREAKER, 120/240 V 1-PHASE 3-WIRE, ${P.size} SPACES`,{size:7.5*k,bold:true});y+=0.1*k;
  const cw=[0.5,3.0,0.7,0.7,0.9,0.6,2.0].map(v=>v*k);const sc=Math.min(1,W/cw.reduce((a,b)=>a+b,0));
  y+=drawTable(dl,A.x0,y,['SPACE','CIRCUIT','BREAKER','WIRE','PROTECTION','VA','NOTES'].map((h,i)=>({h,w:cw[i]*sc})),P.circuits.map(c=>[c.space,c.desc,`${c.amps}A${c.poles===2?' 2P':''}`,c.wire,c.prot,c.va.toLocaleString(),c.note]),k,A.y1-0.6*k)+0.2*k;
  for(const t of [`Calculated service load ${Math.round(P.S.total).toLocaleString()} VA = ${Math.round(P.S.amps)} A at 240 V (NEC 220.82). Service and main: ${P.main} A.`,'Grounding electrode system per NEC 250.50: ground rods (2 unless one tests 25 ohms or less) and water pipe bond; bond gas piping (250.104(B)).','Tamper-resistant receptacles throughout (406.12). Smoke alarms hard-wired and interconnected with battery backup (IRC R314).'])
    {dl.text(A.x0,y,t,{size:5.5*k});y+=0.14*k;}
  return {id:'panel',no:'E0.1',title:'Electrical panel schedule',w:P0.w,h:P0.h,items:dl.items,scale:''};}
/* ---- pipe and duct runs ---- */
const PIPE_SYS={cw:{label:'Cold water',color:'#2f6fd0',dash:null,sizes:['1/2"','3/4"','1"'],def:'1/2"',z:-10,mat:'PEX'},hw:{label:'Hot water',color:'#d0402f',dash:null,sizes:['1/2"','3/4"'],def:'1/2"',z:-10,mat:'PEX'},
  dwv:{label:'Drain and waste',color:'#3d8a3d',dash:null,sizes:['1-1/2"','2"','3"','4"'],def:'2"',z:-16,mat:'PVC DWV'},vent:{label:'Vent',color:'#3d8a3d',dash:[6,4],sizes:['1-1/2"','2"','3"'],def:'1-1/2"',z:60,mat:'PVC DWV'},
  gas:{label:'Gas',color:'#c9a000',dash:[10,4,2,4],sizes:['1/2"','3/4"','1"'],def:'3/4"',z:-10,mat:'black steel or CSST'}};
const DUCT_SYS={supply:{label:'Supply duct',color:'#6a5acd',sizes:['6" round','8" round','10" round','12" round','14" x 8"','20" x 8"'],def:'8" round'},ret:{label:'Return duct',color:'#9a6a3a',sizes:['12" round','14" round','16" round','20" x 10"'],def:'14" round'}};
const ductW=s=>{const m=/(\d+)"\s*x\s*(\d+)/.exec(s);if(m)return +m[1];const r=/(\d+)"/.exec(s);return r?+r[1]:8;};
const pipeD=s=>{const m=/(\d+)-(\d+)\/(\d+)/.exec(s);if(m)return +m[1]+m[2]/m[3];const f=/(\d+)\/(\d+)/.exec(s);if(f)return f[1]/f[2];return parseFloat(s)||1;};
function runLen(pts){let s=0;for(let i=0;i+1<pts.length;i++)s+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);return s;}
regObj('pipe',{coll:'pipes',label:'Pipe run',plural:'pipe runs',z:3,layer:'over',
  pts:(p,o)=>o.pts.map(([x,y])=>({x,y})),hit:(p,o,raw,tol)=>nearPolyline(raw,o.pts.map(([x,y])=>({x,y})),Math.max(tol*0.6,3),false),
  move:(o,dx,dy)=>({...o,pts:o.pts.map(([x,y])=>[x+dx,y+dy])}),title:o=>`${PIPE_SYS[o.sys]?.label||'Pipe'} ${o.size||''}`,
  svg:(p,lv,o,S,view,isSel)=>{const s=PIPE_SYS[o.sys]||PIPE_SYS.cw;const pts=o.pts.map(([x,y])=>S(x,y).join(',')).join(' ');const m=o.pts[Math.floor((o.pts.length-1)/2)],m2=o.pts[Math.floor((o.pts.length-1)/2)+1]||m;const [mx,my]=S((m[0]+m2[0])/2,(m[1]+m2[1])/2);
    return html`<g className=${'pipe'+(isSel?' pipe-sel':'')}><polyline points=${pts} style=${{stroke:s.color,strokeDasharray:s.dash?s.dash.join(' '):undefined}}/>${view.s>0.4?html`<text x=${mx} y=${my-5} style=${{fill:s.color}}>${o.sys.toUpperCase()} ${o.size}</text>`:null}</g>`;},
  dl:(dl,p,lv,o,PT,k,sc)=>{const s=PIPE_SYS[o.sys]||PIPE_SYS.cw;for(let i=0;i+1<o.pts.length;i++){const a=PT(...o.pts[i]),b=PT(...o.pts[i+1]);dl.line(a[0],a[1],b[0],b[1],o.sys==='dwv'?1:0.6,{color:s.color,dash:s.dash?s.dash.map(v=>v*0.006*k):undefined});}
    const m=o.pts[0];const q=PT(m[0],m[1]);dl.text(q[0]+0.04*k,q[1]-0.04*k,`${o.sys.toUpperCase()} ${o.size}`,{size:4.5*k,color:s.color});},
  add3D:(p,lv,o,ctx)=>{const s=PIPE_SYS[o.sys]||PIPE_SYS.cw;const z=lv.elevation+(o.z??s.z);const r=Math.max(0.4,pipeD(o.size)/2+0.1);const m=ctx.col(parseInt(s.color.slice(1),16),{roughness:.5});
    for(let i=0;i+1<o.pts.length;i++){const a={x:o.pts[i][0],y:o.pts[i][1],z},b={x:o.pts[i+1][0],y:o.pts[i+1][1],z};ctx.stick(a,b,r*2,r*2,m,true);}},
  panel:(o,{up})=>html`<div className="sec"><h3>Pipe run</h3><${Field} label="System" id="pp-s"><${Sel} id="pp-s" value=${o.sys} onChange=${v=>up({sys:v,size:PIPE_SYS[v].def})} options=${Object.entries(PIPE_SYS).map(([k,v])=>[k,v.label])}/><//>
    <${Field} label="Size" id="pp-z"><${Sel} id="pp-z" value=${o.size} onChange=${v=>up({size:v})} options=${PIPE_SYS[o.sys].sizes.map(s=>[s,s])}/><//>
    <${Field} label="Height above the floor" id="pp-h"><${LenInput} id="pp-h" value=${o.z} placeholder=${fmtLen(PIPE_SYS[o.sys].z)+(PIPE_SYS[o.sys].z<0?' (below the floor)':'')} onChange=${v=>up({z:v})}/><//>
    <p className="note">${fmtLen(runLen(o.pts))} long. Drains slope 1/4" per foot toward the main (P3005.3).</p></div>`,
  takeoff:(p,add,W)=>{for(const o of (p.pipes||[]).filter(o=>o.status!=='existing')){const s=PIPE_SYS[o.sys]||PIPE_SYS.cw;const L=Math.ceil(runLen(o.pts)/12*W);add('Plumbing',`${s.mat} pipe ${o.size} (${s.label.toLowerCase()})`,L,'LF');
      const bends=Math.max(0,o.pts.length-2);if(bends)add('Plumbing',`${s.mat} ${o.size} elbows`,bends+1,'EA');add('Plumbing',`Pipe hangers and straps (${s.label.toLowerCase()})`,Math.ceil(L/4),'EA','about every 4 ft');}}});
regObj('duct',{coll:'ducts',label:'Duct run',plural:'duct runs',z:2,layer:'over',
  pts:(p,o)=>o.pts.map(([x,y])=>({x,y})),hit:(p,o,raw,tol)=>nearPolyline(raw,o.pts.map(([x,y])=>({x,y})),Math.max(ductW(o.size)/2,tol*0.6),false),
  move:(o,dx,dy)=>({...o,pts:o.pts.map(([x,y])=>[x+dx,y+dy])}),title:o=>`${DUCT_SYS[o.sys]?.label||'Duct'} ${o.size||''}`,
  svg:(p,lv,o,S,view,isSel)=>{const s=DUCT_SYS[o.sys]||DUCT_SYS.supply;const poly=stripPoly(o.pts,ductW(o.size)).map(q=>S(q.x,q.y).join(',')).join(' ');const [mx,my]=S(...o.pts[0]);
    return html`<g className=${'duct'+(isSel?' duct-sel':'')}><polygon points=${poly} style=${{stroke:s.color}}/>${view.s>0.4?html`<text x=${mx+6} y=${my-6} style=${{fill:s.color}}>${o.size}</text>`:null}</g>`;},
  dl:(dl,p,lv,o,PT,k,sc)=>{const s=DUCT_SYS[o.sys]||DUCT_SYS.supply;dl.poly(stripPoly(o.pts,ductW(o.size)).map(q=>PT(q.x,q.y)),{stroke:s.color,w:0.5,dash:[0.04*k,0.025*k]});const q=PT(...o.pts[0]);dl.text(q[0]+0.04*k,q[1]-0.04*k,o.size,{size:4.5*k,color:s.color});},
  add3D:(p,lv,o,ctx)=>{const s=DUCT_SYS[o.sys]||DUCT_SYS.supply;const attic=(o.where||'attic')==='attic';const z=attic?lv.elevation+lv.height+10:lv.elevation-12;const wd=ductW(o.size);const round=/round/.test(o.size);const m=ctx.col(0xb9bcc0,{roughness:.4,metalness:.5});
    for(let i=0;i+1<o.pts.length;i++){const a={x:o.pts[i][0],y:o.pts[i][1],z},b={x:o.pts[i+1][0],y:o.pts[i+1][1],z};ctx.stick(a,b,wd,round?wd:8,m,round);}},
  panel:(o,{up})=>html`<div className="sec"><h3>Duct run</h3><${Field} label="Type" id="dc-s"><${Sel} id="dc-s" value=${o.sys} onChange=${v=>up({sys:v,size:DUCT_SYS[v].def})} options=${Object.entries(DUCT_SYS).map(([k,v])=>[k,v.label])}/><//>
    <${Field} label="Size" id="dc-z"><${Sel} id="dc-z" value=${o.size} onChange=${v=>up({size:v})} options=${DUCT_SYS[o.sys].sizes.map(s=>[s,s])}/><//>
    <${Field} label="Runs in" id="dc-w"><${Sel} id="dc-w" value=${o.where||'attic'} onChange=${v=>up({where:v})} options=${[['attic','Attic'],['crawl','Crawlspace or below the floor']]}/><//>
    <p className="note">${fmtLen(runLen(o.pts))} long. Ducts outside the conditioned space need R-8 insulation (N1103.3).</p></div>`,
  takeoff:(p,add,W)=>{for(const o of (p.ducts||[]).filter(o=>o.status!=='existing')){const L=Math.ceil(runLen(o.pts)/12*W);const round=/round/.test(o.size);add('HVAC',`${round?'Insulated flex or rigid round duct':'Rectangular sheet-metal duct, R-8 wrap'} ${o.size}`,L,'LF');
      if(o.pts.length>2)add('HVAC',`Duct elbows ${o.size}`,o.pts.length-2,'EA');}}});
const toolPipe=(id,sys,label,key)=>regTool(id,{label,short:label.split(' ')[0],key,group:'mep',icon:I.elec,mode:'chain',min:2,
  hint:n=>n?html`Click the next point; Enter or Esc to finish the run.`:html`<b>${label}:</b> click points along the run. Set the size and height in the panel.`,
  place:(ctx,pts)=>{if(pts.length<2)return null;const isDuct=sys==='supply'||sys==='ret';const o={id:uid(isDuct?'du':'pi'),level:ctx.lv.id,sys,size:isDuct?DUCT_SYS[sys].def:PIPE_SYS[sys].def,pts:pts.map(q=>[q.x,q.y]),status:'new'};
    const c=isDuct?'ducts':'pipes';return {p:{...ctx.p,[c]:[...(ctx.p[c]||[]),o]},sel:{kind:isDuct?'duct':'pipe',id:o.id}};}});
toolPipe('pipecw','cw','Cold water pipe','');toolPipe('pipehw','hw','Hot water pipe','');toolPipe('pipedwv','dwv','Drain pipe','');toolPipe('pipegas','gas','Gas pipe','');toolPipe('ductsup','supply','Supply duct','');toolPipe('ductret','ret','Return duct','');
for(const t of ['pipecw','pipehw','pipedwv','pipegas','ductsup','ductret'])addToolToGroup('mep',t);
/* ---- proposal PDF: scope, price, schedule, payments, signatures ---- */
async function proposalPDF(p){await loadJsPDF();const {jsPDF}=window.jspdf;const d=new jsPDF({unit:'in',format:'letter'});const J=jobSchedule(p);const est=J.est;const draws=drawSchedule(p,J);const info=p.info||{};
  const L=0.8,R=7.7;let y=0.9;const T=(t,sz=10,b=false,x=L,opt)=>{d.setFont('helvetica',b?'bold':'normal');d.setFontSize(sz);d.text(String(t),x,y,opt);};const nl=(h=0.2)=>{y+=h;if(y>10.2){d.addPage();y=0.9;}};
  const rule=()=>{d.setDrawColor(170);d.setLineWidth(0.01);d.line(L,y,R,y);nl(0.18);};
  T('Remodeling proposal',22,true);nl(0.35);T(p.name||'Project',13,true);nl(0.22);T([info.address,info.client?'Prepared for '+info.client:null].filter(Boolean).join('   ·   ')||' ',10);nl(0.2);
  T(new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})+(info.designer?'   ·   Prepared by '+info.designer:''),9);nl(0.45);
  T('Scope of work',13,true);nl(0.1);rule();const area=p.rooms.reduce((s,r)=>s+polyArea(r.pts)/144,0);
  const scope=[`${Math.round(area).toLocaleString()} sq ft of finished rooms across ${p.levels.length} level${p.levels.length>1?'s':''}: ${p.rooms.map(r=>r.name).join(', ')}.`];
  const cats=[...new Set(est.rows.map(r=>r.cat))];scope.push('Work includes: '+cats.join(', ').toLowerCase()+'.');
  const nw=p.walls.filter(w=>w.status==='new').length,dm=p.walls.filter(w=>w.status==='demolish').length;if(nw||dm)scope.push(`${nw} new wall${nw===1?'':'s'}${dm?` and ${dm} wall${dm===1?'':'s'} removed`:''}, per the drawings.`);
  for(const s of scope){for(const ln of d.setFontSize(10).splitTextToSize(s,R-L)){T(ln,10);nl(0.18);}}nl(0.15);
  const selRows=[];if(typeof vendorLabel==='function'){const vl=vendorLabel(p.settings?.cab||{});if(vl)selRows.push(['Cabinets',vl]);for(const [k,lab] of SEL_CATS){const t=selText(p,k);if(t)selRows.push([lab,t]);}}
  if(selRows.length){T('Product selections',13,true);nl(0.1);rule();for(const [a,b] of selRows){T(a,9.5,true);for(const ln of d.setFontSize(9.5).splitTextToSize(b,R-L-1.6)){T(ln,9.5,false,L+1.6);nl(0.17);}}nl(0.15);}
  T('Price',13,true);nl(0.1);rule();const row=(a,b,bold)=>{T(a,10,bold);T(b,10,bold,R,{align:'right'});nl(0.2);};
  row('Materials and sales tax'+(est.unpriced?` (${est.priced} of ${est.rows.length} items priced)`:''),money(est.mat+est.tax));row('Labor',money(est.laborCost));if(est.permit)row('Permit',money(est.permit));if(est.dumps)row('Debris removal',money(est.dump));for(const x of est.extras)row(x.name,money(+x.cost));
  row('Overhead and profit',money(est.markup));row('Contingency',money(est.cont));d.setLineWidth(0.01);d.line(L,y-0.12,R,y-0.12);row('Total contract price',money(est.total),true);nl(0.2);
  T('Schedule',13,true);nl(0.1);rule();row('Start',J.start.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}));row('Substantial completion',J.end.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+` (${J.workdays} workdays)`);
  for(const r of J.rows){T(r.label,8.5);T(`${fmtD(r.s)} to ${fmtD(r.e)}`,8.5,false,R,{align:'right'});nl(0.16);}nl(0.15);
  T('Payment schedule',13,true);nl(0.1);rule();for(const dr of draws){T(`${dr.label} (${dr.pct}%)`,10);T(`${money(dr.amt)}   due about ${fmtD(dr.date)}`,10,false,R,{align:'right'});nl(0.2);}nl(0.15);
  T('Terms',13,true);nl(0.1);rule();for(const t of ['Changes to the scope are made by written change order with the price and time agreed before the work.','Owner provides access, utilities and a place to stage materials. Hidden conditions found when walls or floors are opened (rot, termite damage, wiring or plumbing not to code) are priced as changes.','Work is done to the 2021 IRC as adopted locally, with the permits and inspections listed in the schedule. This proposal is good for 30 days.'])
    for(const ln of d.setFontSize(9).splitTextToSize(t,R-L)){T(ln,9);nl(0.16);}
  nl(0.5);for(const who of ['Owner','Contractor']){d.setLineWidth(0.01);d.line(L,y,L+3.2,y);d.line(L+3.8,y,R,y);nl(0.16);T(who+' signature',8);T('Date',8,false,L+3.8);nl(0.45);}
  d.setFontSize(7.5);d.setTextColor(110);d.text('Prepared with Remodel Studio. Quantities, labor and schedule are planning estimates.',L,10.6);d.setTextColor(0);return d;}
