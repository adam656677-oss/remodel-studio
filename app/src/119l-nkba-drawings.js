/* ======================= NKBA graphics: cabinet codes and centerlines on plans and elevations ======================= */
// NKBA Kitchen and Bathroom Planning Guidelines graphics standards: cabinet nomenclature on every cabinet,
// centerlines (CL) of sinks, cooking surfaces and plumbing fixtures dimensioned from a fixed wall, overall wall dimensions.
const CL_TYPES=new Set(['sinkbase','range','toilet','lav','vanity','tub','shower','dw','fridge','washer','dryer']);
const clOf=f=>CL_TYPES.has(f.type)||(f.type==='wallcab'&&/hood/i.test((f.name||'')+(f.lib||'')))||/sink|cooktop|hood/i.test(f.name||'');
const cabCode=(p,f)=>{try{return cabSku(f)+(cabHingeTag(p,f)||'');}catch(e){return '';}};
function nkbaOn(p){return (p.settings?.drawStd??true)!==false;}
// ---- elevations: codes in each cabinet, CL marks and a centerline dimension row ----
{const _ie=drawInteriorElev;drawInteriorElev=function(dl,p,IE,sc,ox,oy,k){_ie(dl,p,IE,sc,ox,oy,k);if(!nkbaOn(p))return;try{const H=IE.lv.height;const U=s=>ox+s*sc,Z=z=>oy+(H-z)*sc;const along=pt=>(pt.x-IE.start.x)*IE.dir.x+(pt.y-IE.start.y)*IE.dir.y;
  for(const f of IE.fixtures){if(!isCab(f)||f.type==='filler')continue;const s=along(f);const z0=f.elev||0,bh=cabBoxH(f);const code=cabCode(p,f);if(!code)continue;const size=Math.min(4.6*k,f.w*sc*72/ (code.length*0.62)/1.1);
    dl.text(U(s),Z(z0+Math.min(bh-2,bh*0.5))+size/72*0.35,code,{size:Math.max(2.6*k,size),anchor:'middle',bold:true,color:'#1d3f7a'});}
  const cls=[];for(const f of IE.fixtures){if(!clOf(f))continue;const s=along(f);if(s<1||s>IE.len-1)continue;cls.push(s);const top=Math.min(H,(f.elev||0)+f.h+8);
    dl.line(U(s),Z(-2),U(s),Z(top),0.3,{dash:[0.06*k,0.03*k,0.015*k,0.03*k],color:'#1d3f7a'});dl.text(U(s),Z(top)-0.03*k,'CL',{size:4.4*k,anchor:'middle',bold:true,color:'#1d3f7a'});}
  if(cls.length){const cs=[0,...[...new Set(cls.map(v=>Math.round(v*4)/4))].sort((a,b)=>a-b)];dimChain(dl,cs,true,Z(0)+0.62*k,Z(0),1,s=>U(s),k);}}catch(e){console.warn('nkba elev',e);}};}
// ---- plan overlay: codes on cabinets and CL dimensions from the nearer wall end ----
function cabCalloutsSVG(p,lv,S,view){const out=[];
  for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id&&isCab(f)&&f.type!=='filler'&&f.status!=='demolish')){const code=cabCode(p,f);if(!code)continue;const [x,y]=S(f.x,f.y);let ang=(f.rot||0)%180;if(ang>90)ang-=180;
    const fs=Math.max(7,Math.min(12,f.w*view.s/(code.length*0.62)));out.push(html`<text key=${'cc'+f.id} x=${x} y=${y+fs*0.35} textAnchor="middle" transform=${`rotate(${ang} ${x} ${y})`} className=${'nk-code'+(f.type==='wallcab'?' nk-up':'')} style=${{fontSize:fs+'px'}}>${code}</text>`);}
  for(const f of (p.fixtures||[]).filter(f=>f.level===lv.id&&clOf(f)&&f.status!=='demolish')){let W=null;try{W=wallOfFixture(p,f);}catch(e){}if(!W)continue;const d={x:(W.b.x-W.a.x)/W.L,y:(W.b.y-W.a.y)/W.L};const s=(f.x-W.a.x)*d.x+(f.y-W.a.y)*d.y;
    const fromA=s<=W.L-s;const e0=fromA?W.a:W.b;const len=fromA?s:W.L-s;const off=(f.d||24)+10;const P=t=>({x:e0.x+(fromA?d.x:-d.x)*t+W.n.x*off,y:e0.y+(fromA?d.y:-d.y)*t+W.n.y*off});
    const A=S(P(0).x,P(0).y),B=S(P(len).x,P(len).y),C=S(f.x,f.y);let ang=Math.atan2(B[1]-A[1],B[0]-A[0])*180/Math.PI;if(ang>90)ang-=180;if(ang<=-90)ang+=180;const m=[(A[0]+B[0])/2,(A[1]+B[1])/2];
    out.push(html`<g key=${'cl'+f.id} className="nk-dim"><line x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]}/><line x1=${B[0]} y1=${B[1]} x2=${C[0]} y2=${C[1]} className="nk-cl"/>
      ${[A,B].map((q,i)=>html`<line key=${i} x1=${q[0]-4} y1=${q[1]+4} x2=${q[0]+4} y2=${q[1]-4} className="nk-tick"/>`)}<text x=${m[0]} y=${m[1]-4} textAnchor="middle" transform=${`rotate(${ang} ${m[0]} ${m[1]})`} className="nk-dimt halo">CL ${fmtLen(len)}</text></g>`);}
  return out;}
