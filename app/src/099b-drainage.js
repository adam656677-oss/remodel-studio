/* ======================= drainage, walkway slopes, window fall protection ======================= */
function outlineSides(p){const first=groundLevel(p);const ol=buildingOutline(p,first.id);if(!ol)return [];const P=ol.pts;const c=polyLabelPt(P.map(q=>[q.x,q.y]));
  return P.map((a,i)=>{const b=P[(i+1)%P.length];const L=dist(a,b);const d={x:(b.x-a.x)/(L||1),y:(b.y-a.y)/(L||1)};let n={x:-d.y,y:d.x};const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    if(inPoly(m.x+n.x*6,m.y+n.y*6,P.map(q=>[q.x,q.y])))n={x:-n.x,y:-n.y};const G=gradeFrame(p);const towardHouse=G.fall?-(n.x*G.v.x+n.y*G.v.y)*G.slope:0; // >0: ground outside rises away = drains toward the house
    return {a,b,L,d,n,m,uphill:towardHouse<-1e-6?false:G.fall>0&&(n.x*G.v.x+n.y*G.v.y)<-0.3};}).filter(s=>s.L>48);}
function downspouts(p){if(!(p.roofs||[]).some(r=>roofTrimOf(r).gutters&&r.style!=='flat'))return [];const first=groundLevel(p);const ol=buildingOutline(p,first.id);if(!ol)return [];const P=ol.pts;
  const out=[];for(let i=0;i<P.length;i++){const a=P[(i-1+P.length)%P.length],b=P[i],c=P[(i+1)%P.length];const cr=(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);const ctr=polyLabelPt(P.map(q=>[q.x,q.y]));
    const o={x:b.x-ctr[0],y:b.y-ctr[1]};const L=Math.hypot(o.x,o.y)||1;if(inPoly(b.x+o.x/L*6,b.y+o.y/L*6,P.map(q=>[q.x,q.y])))continue;out.push({x:b.x,y:b.y,out:{x:o.x/L,y:o.y/L}});}return out;}
function drainageDL(dl,p,PT,k){const sides=outlineSides(p);const arrow=(x0,y0,x1,y1,w=0.5)=>{dl.line(x0,y0,x1,y1,w);const ang=Math.atan2(y1-y0,x1-x0),h=0.06*k;dl.poly([[x1,y1],[x1-h*Math.cos(ang-0.45),y1-h*Math.sin(ang-0.45)],[x1-h*Math.cos(ang+0.45),y1-h*Math.sin(ang+0.45)]],{fill:'#111111',stroke:'#111111',w:0.3});};
  for(const s of sides){const a=PT(s.m.x+s.n.x*30,s.m.y+s.n.y*30),b=PT(s.m.x+s.n.x*120,s.m.y+s.n.y*120);arrow(a[0],a[1],b[0],b[1]);
    dl.text(b[0]+s.n.x*0.05*k,b[1]+s.n.y*0.05*k+0.02*k,s.uphill?'SWALE':'5% MIN.',{size:4.5*k,anchor:'middle',color:'#555555'});
    if(s.uphill){const p0=PT(s.a.x+s.n.x*84-s.d.x*60,s.a.y+s.n.y*84-s.d.y*60),p1=PT(s.b.x+s.n.x*84+s.d.x*60,s.b.y+s.n.y*84+s.d.y*60);dl.line(p0[0],p0[1],p1[0],p1[1],0.7,{dash:[0.08*k,0.04*k,0.02*k,0.04*k]});
      const e0=PT(s.b.x+s.n.x*84+s.d.x*30,s.b.y+s.n.y*84+s.d.y*30),e1=PT(s.b.x+s.n.x*84+s.d.x*60,s.b.y+s.n.y*84+s.d.y*60);arrow(e0[0],e0[1],e1[0],e1[1]);
      const f0=PT(s.a.x+s.n.x*84-s.d.x*30,s.a.y+s.n.y*84-s.d.y*30),f1=PT(s.a.x+s.n.x*84-s.d.x*60,s.a.y+s.n.y*84-s.d.y*60);arrow(f0[0],f0[1],f1[0],f1[1]);}}
  for(const d of downspouts(p)){const q=PT(d.x,d.y);dl.circle(q[0],q[1],0.035*k,{stroke:INK,w:0.5,fill:'#ffffff'});const e=PT(d.x+d.out.x*48,d.y+d.out.y*48);dl.line(q[0],q[1],e[0],e[1],0.5,{dash:[0.03*k,0.02*k]});
    dl.text(e[0]+d.out.x*0.06*k,e[1]+d.out.y*0.06*k,'DS',{size:4.5*k,anchor:'middle',bold:true});}
  // walkway and driveway slopes
  for(const o of (p.site||[]).filter(o=>o.type==='walk'||o.type==='drive')){const sl=siteSlopes(p,o);for(const s of sl){if(s.pct<0.5)continue;const m=PT(s.m.x,s.m.y);dl.text(m[0],m[1]-0.05*k,`${s.pct.toFixed(1)}%`,{size:4.5*k,anchor:'middle',bold:true,color:s.pct>8.33?'#b00020':'#111111'});}}}
function siteSlopes(p,o){if(o.type==='walk'){const out=[];for(let i=0;i+1<o.pts.length;i++){const a={x:o.pts[i][0],y:o.pts[i][1]},b={x:o.pts[i+1][0],y:o.pts[i+1][1]};const L=dist(a,b);if(L<12)continue;
      out.push({m:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},pct:Math.abs(gradeAt(p,b.x,b.y)-gradeAt(p,a.x,a.y))/L*100,L});}return out;}
  const P=o.pts.map(([x,y])=>({x,y}));if(P.length<3)return [];let best=null;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];const L=dist(a,b);if(!best||L>best.L)best={a,b,L};}
  const c=polyLabelPt(o.pts);return [{m:{x:c[0],y:c[1]},pct:Math.abs(gradeAt(p,best.b.x,best.b.y)-gradeAt(p,best.a.x,best.a.y))/best.L*100,L:best.L}];}
regExtra({checks:(p,add)=>{const first=groundLevel(p);const R=(set,code,title)=>({set,code,title});
  // R401.3 drainage
  for(const s of outlineSides(p))if(s.uphill){add('warn',R('IRC','R401.3','Drainage'),'Ground slopes toward the house',`On this side the lot is uphill from the house, so water runs toward the foundation. Grade a swale to carry it around, and keep at least 6" of fall in the first 10 ft away from the wall (R401.3).`,null,s.m,first.id);break;}
  // walkways
  const ada=p.settings?.ada!==false;for(const o of (p.site||[]).filter(o=>o.type==='walk')){const sl=siteSlopes(p,o);const mx=sl.reduce((a,s)=>s.pct>a.pct?s:a,{pct:0});if(!sl.length)continue;
    if(mx.pct>8.33)add(ada?'error':'warn',R('ADA','403.3 / 405.2','Walking surface slope'),'Walkway too steep',`One run slopes about ${mx.pct.toFixed(1)}%. Walks steeper than 5% are ramps; ramps can be no steeper than 8.33% (1:12). Add steps or switch back the walk.`,{kind:'site',id:o.id},mx.m,o.level);
    else if(mx.pct>5&&ada)add('warn',R('ADA','403.3','Walking surface slope'),'Walkway is a ramp',`It slopes about ${mx.pct.toFixed(1)}%. Over 5%, an accessible route has to be built as a ramp: handrails on both sides when it rises more than 6", and level landings every 30" of rise (ADA 405).`,{kind:'site',id:o.id},mx.m,o.level);}
  for(const o of (p.site||[]).filter(o=>o.type==='drive')){const s=siteSlopes(p,o)[0];if(s&&s.pct>15)add('warn',R('Site','Guideline','Driveway slope'),'Steep driveway',`About ${s.pct.toFixed(0)}% along its length; over 12 to 15% cars can scrape and it gets slick when wet. Most cities limit driveway grades; check the local rule.`,{kind:'site',id:o.id},s.m,o.level);}
  // R312.2.1 window fall protection
  for(const o of p.openings){if(o.type!=='window'||(o.operation||'double-hung')==='fixed'||o.status==='demolish')continue;const c=openingCenter(p,o);if(!c||c.w.kind!=='exterior')continue;const lv=lvlOf(p,c.w.level);if(!lv)continue;
    if(o.sill>=24)continue;const f=wallFacing(p,c.w);const out={x:c.x+f.n.x*(c.w.thick/2+12),y:c.y+f.n.y*(c.w.thick/2+12)};const drop=lv.elevation+o.sill-gradeAt(p,out.x,out.y);
    if(drop>72)add('warn',R('IRC','R312.2.1','Window fall protection'),'Low window sill high above the ground',`Sill is ${fmtLen(o.sill)} above the floor and about ${fmtLen(drop)} above the ground outside. Raise the sill to 24" or use a window opening control device or fall prevention device (ASTM F2090).`,{kind:'opening',id:o.id},c,c.w.level);}}});
