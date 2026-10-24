/* ======================= drain and vent sizing by fixture units, riser diagram, duct sizing by room ======================= */
// IRC 2021: P3004.1 drainage fixture units, P3005.4.1 horizontal fixture branches and stacks, P3005.4.2 building drains,
// P3201.7 trap sizes, P3113.1 vent size (at least half the drain, 1-1/4" minimum). Ducts: equal-friction sizing at 0.08" per 100'.
const TRAP={wc:'3" (integral)',lav:'1-1/4"',tub:'1-1/2"',shower:'2"',ksink:'1-1/2"',dw:'1-1/2" (through the sink)',cw:'2"',ltub:'1-1/2"',bar:'1-1/2"'};
const BRANCH=[[3,'1-1/2"'],[6,'2"'],[12,'2-1/2"'],[20,'3"'],[160,'4"'],[360,'5"']];
const VENT={'1-1/2"':'1-1/4"','2"':'1-1/2"','2-1/2"':'1-1/2"','3"':'2"','4"':'2"','5"':'2-1/2"'};
const branchSize=(dfu,wc)=>{if(wc)return dfu<=20?'3"':'4"';for(const [m,s] of BRANCH)if(dfu<=m)return s;return '6"';};
function drainRooms(p){const out=[];const fx=(p.fixtures||[]).filter(f=>f.status!=='demolish');
  for(const r of p.rooms){const list=[];for(const f of fx){if(f.level!==r.level||!inPoly(f.x,f.y,r.pts))continue;const t=f.type+' '+(FIXTURES[f.type]?.label||'')+' '+(f.name||'');const m=PLUMB.find(x=>x[1].test(t)&&!(x[0]==='cw'&&/dish/i.test(t)));if(m)list.push({f,k:m[0],label:m[2],dfu:m[3]});}
    if(!list.length)continue;const wc=list.filter(x=>x.k==='wc').length;const lav=list.filter(x=>x.k==='lav').length,ts=list.filter(x=>x.k==='tub'||x.k==='shower').length;
    const grp=Math.min(wc,lav,ts);const dfu=list.reduce((s,x)=>s+x.dfu,0)-grp*(3+1+2-5);// a full bathroom group counts 5
    const size=branchSize(dfu,wc>0);out.push({room:r,list,dfu,size,vent:VENT[size]||'2"',wc,lv:lvlOf(p,r.level)});}
  return out;}
function drainSizing(p){const R=drainRooms(p);const P=plumbingCalc(p);const lvls=sortedLevels(p);
  const stacks=lvls.map(l=>{const rs=R.filter(x=>x.room.level===l.id);const dfu=rs.reduce((s,x)=>s+x.dfu,0);const wc=rs.some(x=>x.wc);return {lv:l,dfu,size:dfu?branchSize(dfu,wc):null};});
  const above=i=>stacks.slice(i).reduce((s,x)=>s+x.dfu,0);stacks.forEach((s,i)=>{const d=above(i);const wc=stacks.slice(i).some(x=>x.size==='3"'||x.size==='4"');s.stackDfu=d;s.stack=d?(wc?(d<=48?'3"':'4"'):branchSize(d,false)):null;});
  return {rooms:R,stacks,building:P.drain,DFU:P.DFU,vent:P.DFU?(R.some(r=>r.wc)?'3" through the roof (main vent)':'2" through the roof'):null};}
function RiserSVG({p,W=640}){const D=drainSizing(p);const lv=D.stacks.filter(s=>s.dfu>0||true);const rowH=110,H=60+lv.length*rowH;const X0=80;
  const els=[];lv.forEach((s,i)=>{const y=H-40-i*rowH;els.push(html`<line key=${'fl'+i} x1="20" y1=${y} x2=${W-20} y2=${y} className="rs-floor"/><text key=${'fln'+i} x="24" y=${y-4} className="rs-t">${s.lv.name}</text>`);
    const rs=D.rooms.filter(r=>r.room.level===s.lv.id);rs.forEach((r,j)=>{const x=X0+90+j*Math.max(120,(W-X0-120)/Math.max(1,rs.length));const yb=y-18;
      els.push(html`<g key=${'r'+i+j}><line x1=${X0} y1=${yb+10} x2=${x} y2=${yb+10} className="rs-drain"/><text x=${(X0+x)/2} y=${yb+24} textAnchor="middle" className="rs-s">${r.size} · ${r.dfu} DFU</text>
        ${r.list.map((f,m)=>html`<g key=${m}><line x1=${x+m*16} y1=${yb+10} x2=${x+m*16} y2=${yb-14} className="rs-drain"/><circle cx=${x+m*16} cy=${yb-18} r="4" className="rs-fx"/><title>${f.label}</title></g>`)}
        <line x1=${x-8} y1=${yb+10} x2=${x-8} y2=${yb-50} className="rs-vent"/><text x=${x} y=${yb-30} className="rs-s">${r.room.name}: ${r.list.map(f=>f.k.toUpperCase()).join(' ')} · vent ${r.vent}</text></g>`);});});
  const yTop=H-40-(lv.length-1)*rowH-60;els.push(html`<line key="stack" x1=${X0} y1=${H-30} x2=${X0} y2=${yTop} className="rs-drain rs-stack"/><line key="vtr" x1=${X0} y1=${yTop} x2=${X0} y2=${yTop-20} className="rs-vent"/><text key="vtrt" x=${X0+6} y=${yTop-8} className="rs-s">VTR ${D.vent||''}</text>`);
  els.push(html`<line key="bd" x1=${X0} y1=${H-30} x2=${W-20} y2=${H-30} className="rs-drain rs-stack"/><text key="bdt" x=${W-24} y=${H-14} textAnchor="end" className="rs-s">Building drain ${D.building} at 1/4" per foot · ${D.DFU} DFU</text>`);
  D.stacks.forEach((s,i)=>{if(s.stack){const y=H-40-i*rowH;els.push(html`<text key=${'st'+i} x=${X0-6} y=${y-40} textAnchor="end" className="rs-s">${s.stack}</text>`);}});
  return html`<svg className="rs-svg" viewBox=${`0 0 ${W} ${H}`} role="img" aria-label="Plumbing riser diagram">${els}</svg>`;}
function DrainSizingPanel({p}){const D=drainSizing(p);if(!D.rooms.length)return html`<section className="sec"><h3>Drain and vent sizing</h3><p className="note">Place plumbing fixtures to size the drains.</p></section>`;
  return html`<section className="sec"><h3>Drain and vent sizing (IRC P3005, P3113)</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Room</th><th>Fixtures (trap size)</th><th className="num">DFU</th><th>Branch drain</th><th>Vent</th></tr></thead><tbody>
    ${D.rooms.map(r=>html`<tr key=${r.room.id}><td>${r.room.name}</td><td>${r.list.map(x=>`${x.label} ${TRAP[x.k]||''}`).join('; ')}</td><td className="num">${r.dfu}</td><td>${r.size}</td><td>${r.vent}</td></tr>`)}</tbody></table></div>
    <p className="note">Stacks: ${D.stacks.filter(s=>s.stack).map(s=>`${s.lv.name} ${s.stack} (${s.stackDfu} DFU)`).join(' · ')}. Building drain ${D.building} at 1/4" per foot. A 3" branch takes no more than 2 water closets; slope 1/4" per foot under 3", 1/8" per foot at 3" and over.</p>
    <h3>Riser diagram</h3><${RiserSVG} p=${p}/></section>`;}
// ---- ducts ----
const DUCT_RND=[[100,6],[140,7],[200,8],[270,9],[350,10],[550,12],[850,14],[1250,16],[1750,18],[2400,20]];
const ductFor=cfm=>{for(const [c,d] of DUCT_RND)if(cfm<=c)return d;return 22;};
function ductSizing(p){const L=loadCalc(p);const rows=L.rows.filter(r=>r.cfm>0).map(r=>{const regs=Math.max(1,Math.ceil(r.cfm/150));const per=r.cfm/regs;return {name:r.name||(p.rooms.find(x=>x.id===r.id)||{}).name||'Room',cfm:r.cfm,regs,run:ductFor(per),reg:per<=100?'4" x 10"':per<=150?'4" x 12"':'6" x 12"'};});
  const total=L.cfm;const trunkR=ductFor(total);const trunkRect=total<=600?'8" x 14"':total<=800?'8" x 18"':total<=1000?'8" x 22"':total<=1200?'10" x 22"':total<=1600?'10" x 28"':'12" x 30"';
  const ret=Math.ceil(total*144/(400*0.75)/2)*2;// grille free area at about 400 fpm face velocity
  return {rows,total,tons:L.tons,trunkR,trunkRect,returnSqIn:ret,returnGrille:total<=800?'20" x 20" filter grille':total<=1200?'20" x 30" filter grille':'(2) 20" x 25" filter grilles'};}
function DuctSizingPanel({p}){const D=ductSizing(p);return html`<section className="sec"><h3>Duct sizing (equal friction, 0.08" per 100')</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Room</th><th className="num">CFM</th><th className="num">Supply registers</th><th>Branch duct</th><th>Register</th></tr></thead><tbody>
  ${D.rows.map((r,i)=>html`<tr key=${i}><td>${r.name}</td><td className="num">${r.cfm}</td><td className="num">${r.regs}</td><td>${r.regs} x ${r.run}" round</td><td>${r.reg}</td></tr>`)}</tbody></table></div>
  <p className="note">${D.tons} ton system, ${D.total} CFM: supply trunk ${D.trunkR}" round or ${D.trunkRect}; return about ${D.returnSqIn} sq in free area (${D.returnGrille}). Confirm with ACCA Manual D for the final layout.</p></section>`;}
SYS_EXTRA.plumb=[...(SYS_EXTRA.plumb||[]),DrainSizingPanel];SYS_EXTRA.loads=[...(SYS_EXTRA.loads||[]),DuctSizingPanel];SYS_EXTRA.light=[...(SYS_EXTRA.light||[])];
// plan set: plumbing riser and duct schedule sheet
function mepSheet(p){const D=drainSizing(p);const Dc=ductSizing(p);if(!D.rooms.length&&!Dc.rows.length)return null;const P=PAPERS[p.sheet?.paper]||PAPERS.tabloid;const k=P.k;const dl=DL();const A=sheetFrame(dl,P,p,'P1.1','Plumbing riser and duct schedule','');let y=A.y0+0.3*k;const x=A.x0+0.2*k;
  const T=(t,b,sz=5.2)=>{dl.text(x,y,t,{size:sz*k,bold:b});y+=0.16*k;};T('DRAIN, WASTE AND VENT',true,7);
  for(const r of D.rooms)T(`${r.room.name.padEnd(18)} ${String(r.dfu).padStart(3)} DFU  branch ${r.size.padEnd(7)} vent ${r.vent}   ${r.list.map(f=>f.label).join(', ')}`);
  for(const s of D.stacks.filter(s=>s.stack))T(`Stack at ${s.lv.name}: ${s.stack} (${s.stackDfu} DFU)`);T(`Building drain ${D.building} at 1/4" per foot, ${D.DFU} DFU total. Vent through roof ${D.vent||''}.`,true);y+=0.2*k;
  T('DUCT SCHEDULE',true,7);for(const r of Dc.rows)T(`${r.name.padEnd(18)} ${String(r.cfm).padStart(4)} CFM  ${r.regs} x ${r.run}" round  register ${r.reg}`);T(`${Dc.tons} tons, ${Dc.total} CFM. Trunk ${Dc.trunkR}" round or ${Dc.trunkRect}. Return ${Dc.returnSqIn} sq in (${Dc.returnGrille}).`,true);
  return {id:'s-P1.1',no:'P1.1',title:'Plumbing riser and duct schedule',w:P.w,h:P.h,items:dl.items,scale:''};}
{const _bs=buildSheets;buildSheets=function(p){const out=_bs(p);try{const s=mepSheet(p);if(s){const i=out.findIndex(x=>/^M0/.test(x.no));out.splice(i>=0?i+1:out.length,0,s);}}catch(e){console.warn('mep sheet',e);}return out;};}
