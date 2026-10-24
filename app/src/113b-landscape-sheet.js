/* ======================= L1.0 landscape and play area plan, with plant and playground schedules ======================= */
function landscapeSheet(p){
  const pl=(p.plants||[]).filter(o=>o.status!=='demolish'),pg=(p.play||[]).filter(o=>o.status!=='demolish'),pa=(p.playareas||[]).filter(o=>o.status!=='demolish');
  if(!pl.length&&!pg.length&&!pa.length)return null;
  const P=PAPERS[p.sheet?.paper]||PAPERS.tabloid;const k=P.k;const R=1.2*k;const pp=filteredProject(p,'proposed');const lvls=sortedLevels(p);const lv0=lvls[0];
  let B=p.walls.length?planBounds(pp,lv0.id):{x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};
  const grow=q=>{B={x0:Math.min(B.x0,q.x),y0:Math.min(B.y0,q.y),x1:Math.max(B.x1,q.x),y1:Math.max(B.y1,q.y)};};
  for(const o of pl){const r=plantDims(p,o).s/2;grow({x:o.x-r,y:o.y-r});grow({x:o.x+r,y:o.y+r});}
  for(const o of pg)for(const q of playZone(o))grow(q);
  for(const a of pa)for(const [x,y] of a.pts)grow({x,y});
  for(const o of pp.site||[])if(!['lot'].includes(o.type))for(const q of siteOutline(o))grow(q);
  // codes: two letters, numbered when two species share them
  const spList=[...new Set(pl.map(o=>o.sp))];const used={};const code={};
  for(const sp of spList){let c=plantCode(sp);if(used[c]){used[c]++;c=c+used[c];}else used[c]=1;code[sp]=c;}
  const schedW=3.6*k;
  return planSheet(P,p,'L1.0','Landscape and play area plan',B,R,(dl,G)=>{const {PT,sc}=G;
    siteDL(dl,{...pp,site:(pp.site||[]).filter(o=>o.type!=='tree'&&o.type!=='shrub')},PT,k,sc);
    for(const w of pp.walls.filter(w=>w.level===lv0.id&&w.kind==='exterior')){const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2;dl.poly([PT(w.x1+n.x*t,w.y1+n.y*t),PT(w.x2+n.x*t,w.y2+n.y*t),PT(w.x2-n.x*t,w.y2-n.y*t),PT(w.x1-n.x*t,w.y1-n.y*t)],{fill:'#cfcfcf',stroke:INK,w:0.6});}
    if(p.walls.length){const BB=planBounds(pp,lv0.id);const c=PT((BB.x0+BB.x1)/2,(BB.y0+BB.y1)/2);dl.text(c[0],c[1],'HOUSE',{size:7*k,bold:true,anchor:'middle'});}
    for(const a of pa){const S=surfOf(a.surf);dl.poly(a.pts.map(([x,y])=>PT(x,y)),{stroke:INK,w:0.8,fill:'#f3efe6'});const [cx,cy]=polyLabelPt(a.pts);const q=PT(cx,cy);
      dl.text(q[0],q[1]+0.5*k*0,`PLAY AREA · ${S[1].toUpperCase()}${S[2]?' '+(a.depth||S[5])+'" DEEP':''}`,{size:4.6*k,anchor:'middle',color:MID});}
    for(const o of pg){const c=PLAY[o.key]||{};if(p.settings?.play?.zones!==false&&c.cat!=='seating')dl.poly(playZone(o).map(q=>PT(q.x,q.y)),{stroke:INK,w:0.35,dash:[0.06*k,0.04*k]});
      dl.poly(playRect(o).map(q=>PT(q.x,q.y)),{stroke:INK,w:0.7,fill:'#dfe6ef'});const q=PT(o.x,o.y);dl.text(q[0],q[1]+0.02*k,c.model||c.name||'PLAY',{size:4.6*k,bold:true,anchor:'middle'});}
    // plants: canopy circles, sized as shown in the project settings
    const big=o=>['shade','ornamental','evergreen','palm'].includes((PLANTS_SP[o.sp]||{}).kind);
    for(const o of [...pl].sort((a,b)=>plantDims(p,b).s-plantDims(p,a).s)){const r=Math.max(0.03*k,plantDims(p,o).s/2*sc);const q=PT(o.x,o.y);
      if(big(o)){const n=12,pts=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2;const rr=i%2?r*0.86:r;pts.push([q[0]+rr*Math.cos(a),q[1]+rr*Math.sin(a)]);}dl.poly(pts,{stroke:INK,w:0.35,fill:'#ffffff'});dl.circle(q[0],q[1],0.012*k,{fill:INK});}
      else dl.circle(q[0],q[1],r,{stroke:INK,w:0.35,fill:'#ffffff'});
      dl.text(q[0],q[1]+(big(o)?-0.03*k:0.02*k),code[o.sp]||'',{size:(big(o)?5.5:4.2)*k,bold:true,anchor:'middle'});}
    // schedules on the right
    const x=G.A.x1-schedW,cw=[0.42,1.75,0.4,0.95];let y=G.A.y0+0.2*k;
    if(spList.length){dl.text(x,y,'PLANT SCHEDULE',{size:6.5*k,bold:true});y+=0.1*k;
      const rows=spList.map(sp=>{const S=PLANTS_SP[sp]||{};const n=pl.filter(o=>o.sp===sp).length;const sz=plantSize((pl.find(o=>o.sp===sp)||{}).size||S.size)[1];return [code[sp],`${(S.name||sp).toUpperCase()} / ${S.bot||''}`,String(n),sz];});
      y+=drawTable(dl,x,y,['KEY','COMMON / BOTANICAL','QTY','SIZE'].map((h,i)=>({h,w:cw[i]*k})),rows,k,G.A.y1-1.4*k)+0.3*k;}
    if(pg.length){dl.text(x,y,'PLAYGROUND SCHEDULE',{size:6.5*k,bold:true});y+=0.1*k;const by={};for(const o of pg){by[o.key]=(by[o.key]||0)+1;}
      const rows=Object.entries(by).map(([key,n])=>{const c=PLAY[key]||{};return [c.model||'-',`${(c.brand||'').toUpperCase()} ${c.name||key}`.trim(),String(n),c.cat==='seating'?'-':fmtLen(c.fall||0)];});
      y+=drawTable(dl,x,y,['MODEL','ITEM','QTY','FALL HT'].map((h,i)=>({h,w:cw[i]*k})),rows,k,G.A.y1-1.0*k)+0.3*k;}
    const notes=['Plant sizes are at installation; circles show '+({plant:'size at planting',five:'size in 5 years',mature:'mature spread'}[landOf(p).show]||'mature spread')+'.',
      'Call 811 before digging. Keep trees 10 ft or more from the foundation.',
      pg.length?'Dashed lines are equipment use zones (CPSC Pub. 325, ASTM F1487). Keep use zones clear and covered with safety surfacing.':'',
      pa.length?'Surfacing must meet ASTM F1292 for the highest fall height, and ASTM F1951 where it is part of an accessible route (ADA 1008.2.6).':''].filter(Boolean);
    dl.text(x,y,'NOTES',{size:6*k,bold:true});y+=0.16*k;for(const t of notes){for(const ln of wrapText(t,schedW-0.05*k,4.8*k)){dl.text(x,y,ln,{size:4.8*k});y+=0.12*k;}y+=0.04*k;}
  },schedW+0.2*k,SITE_SCALES);}
{const _bs=buildSheets;buildSheets=function(p){const out=_bs(p);try{const s=landscapeSheet(p);if(s){const i=out.findIndex(x=>x.no==='A0.2');out.splice(i>=0?i+1:Math.min(1,out.length),0,s);}}catch(e){console.warn('landscape sheet',e);}return out;};}
