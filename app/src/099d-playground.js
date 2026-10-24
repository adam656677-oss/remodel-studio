/* ======================= playgrounds: equipment with use zones, safety surfacing, ADA play area checks ======================= */
// Catalog items come from 099e-gametime-data.js (GameTime). Each: {key, model, name, line, cat, ages, w, d, h, fall, uz:{w,d}, cap, ada, url, notes}
var PLAY=typeof PLAY!=='undefined'?PLAY:{};
const PLAY_CATS={structure:'Play structures',swing:'Swings',slide:'Slides',climber:'Climbers',spinner:'Spinners',rocker:'Rockers and spring riders',freestanding:'Freestanding play',musical:'Musical and sensory',sensory:'Musical and sensory',accessible:'Inclusive play',fitness:'Fitness',shade:'Shade',seating:'Site furnishings',other:'Other'};
const PLAY_SCHEMES={primary:['Primary',0x1f5fbf,0xf2c230,0xd8352f,0x2e8b57],earth:['Earthtone',0x6b5a3e,0xc9b48a,0x5b7a3a,0x8a4b2f],coastal:['Coastal',0x1d6f8f,0xe9e4d8,0x3fb0c4,0x0e3b4f],woodland:['Woodland',0x3a5a2f,0xd8c48a,0x8a5a2f,0x6f8f3a],bold:['Bold',0x6a2c91,0xff8c1a,0x00a3a3,0xe0218a]};
// surfacing: [key, label, loose fill?, accessible (ASTM F1951) when properly installed, critical fall height in ft at the default depth, default depth in]
const PLAY_SURF=[['ewf','Engineered wood fiber (EWF)',true,true,10,12],['woodchips','Wood chips',true,false,10,12],['mulch','Wood mulch (non-CCA)',true,false,7,12],['rubbermulch','Shredded rubber mulch',true,false,10,6],
  ['sand','Sand',true,false,4,12],['peagravel','Pea gravel',true,false,5,12],['pip','Poured-in-place rubber',false,true,8,3],['tiles','Rubber tiles',false,true,8,3.25],['turf','Synthetic turf with pad',false,true,8,2.5]];
// swing seats sold separately (GameTime), borders, and maker surfacing products; 099e fills these
const PLAY_SEATS={};const PLAY_SURF_GT=[];const GT_SURF_MAP={ewf:'EWF1',pip:'PIP1',tiles:'RecycledTiles1',turf:'Turf1',rubbermulch:'RecycledLoose1'};
const PLAY_BORDERS=[['timber','Recycled plastic timbers',10],['plastic','Plastic border',8],['curb','Concrete curb',6],['none','None',0]];
const borderOf=k=>PLAY_BORDERS.find(x=>x[0]===k)||PLAY_BORDERS[0];
const surfOf=k=>PLAY_SURF.find(s=>s[0]===k)||PLAY_SURF[0];
// CPSC Handbook Table 2: 9" compressed loose fill protects wood chips to 10 ft, wood mulch 7 ft, pea gravel 5 ft, sand 4 ft; 6" shredded rubber to 10 ft.
// Loose fill compresses about 25%, so 12" goes in for 9" compressed.
function surfRating(a){const S=surfOf(a.surf);if(!S[2])return a.rating||S[4];const depth=a.depth||S[5];const comp=a.surf==='rubbermulch'?depth:depth*0.75;
  if(a.surf==='rubbermulch')return comp>=6?10:0;if(comp<9-0.01)return 0;return S[4];}
const playFoot=o=>{const c=PLAY[o.key]||{};return {w:o.w||c.w||96,d:o.d||c.d||96};};
// use zone as a plan polygon around the item (rotated). Swings: twice the pivot height in front and behind (CPSC 5.3.8); slides: exit zone; others: 6 ft.
function playZone(o){const c=PLAY[o.key]||{};const f=playFoot(o);let hw,hd,cx=0,cy=0;
  if(c.cat==='seating'){hw=f.w/2;hd=f.d/2;}
  else if(o.uz||c.uz){const u=o.uz||c.uz;hw=u.w/2;hd=u.d/2;}
  else if(c.cat==='swing'){const pv=c.h||96;hw=f.w/2+72;hd=Math.max(f.d/2+72,2*pv);}
  else if(c.cat==='slide'){hw=f.w/2+72;hd=f.d/2+72;cy=0;hd+=Math.min(96,Math.max(72,c.fall||48))-72;}
  else{hw=f.w/2+72;hd=f.d/2+72;}
  const a=(o.rot||0)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);return [[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([u,v])=>({x:o.x+(u+cx)*ca-(v+cy)*sa,y:o.y+(u+cx)*sa+(v+cy)*ca}));}
function playRect(o){const f=playFoot(o);const a=(o.rot||0)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);return [[-f.w/2,-f.d/2],[f.w/2,-f.d/2],[f.w/2,f.d/2],[-f.w/2,f.d/2]].map(([u,v])=>({x:o.x+u*ca-v*sa,y:o.y+u*sa+v*ca}));}
function polyGap(A,B){if(rectsOverlap(A,B))return 0;let m=1e9;for(const P of [A,B]){const Q=P===A?B:A;for(const q of P)for(let i=0;i<Q.length;i++)m=Math.min(m,segDistPt(q,Q[i],Q[(i+1)%Q.length]));}return m;}
const playZ=(p,o)=>slopeOf(p).fall>0?gradeAt(p,o.x,o.y):siteZ(p);
const schemeOf=(p,o)=>PLAY_SCHEMES[o.scheme||p.settings?.play?.scheme||'primary']||PLAY_SCHEMES.primary;
regObj('play',{coll:'play',label:'Play equipment',plural:'play equipment',z:-3,layer:'under',hitStage:'late',planSheet:false,
  pts:(p,o)=>playZone(o),noBounds:true,hit:(p,o,raw)=>inPoly(raw.x,raw.y,playRect(o).map(q=>[q.x,q.y])),
  move:(o,dx,dy)=>({...o,x:o.x+dx,y:o.y+dy}),rotate:(o,deg)=>({...o,rot:((o.rot||0)+deg)%360}),
  title:o=>{const c=PLAY[o.key]||{};return (c.model?c.model+' ':'')+(c.name||'Play equipment');},
  svg:(p,lv,o,S,view,isSel)=>{const c=PLAY[o.key]||{};const pl=pts=>pts.map(q=>S(q.x,q.y).join(',')).join(' ');const sc=schemeOf(p,o);const col='#'+sc[1].toString(16).padStart(6,'0');
    const [x,y]=S(o.x,o.y);const showZ=p.settings?.play?.zones!==false;
    return html`<g>${showZ?html`<polygon points=${pl(playZone(o))} className="usezone"/>`:null}<polygon points=${pl(playRect(o))} fill=${col} fillOpacity="0.28" className=${'playfoot'+(isSel?' site-sel':'')}/>
      ${view.s>0.35?html`<text x=${x} y=${y+3} textAnchor="middle" className="plant-code">${c.model||PLAY_CATS[c.cat]?.split(' ')[0]||'Play'}</text>`:null}</g>`;},
  add3D:(p,lv,o,ctx)=>{if(lv.id!==groundLevel(p).id)return;try{addPlay3D(p,o,ctx);}catch(e){console.error('play',e);}},
  panel:(o,{p,up,commit})=>{const c=PLAY[o.key]||{};const f=playFoot(o);const items=Object.values(PLAY);
    return html`<div className="sec"><h3>Play equipment</h3><${PicPane} kind="play" obj=${o} p=${p}/>
      <${Field} label="Item" id="pg-k"><select id="pg-k" className="inp" value=${o.key} onChange=${e=>up({key:e.target.value,w:null,d:null,uz:null})}>${Object.keys(PLAY_CATS).filter((k,i,a)=>a.indexOf(k)===i).map(cat=>{const l=items.filter(x=>x.cat===cat);return l.length?html`<optgroup key=${cat} label=${PLAY_CATS[cat]}>${l.map(x=>html`<option key=${x.key} value=${x.key}>${x.model?x.model+' · ':''}${x.name}</option>`)}</optgroup>`:null;})}</select><//>
      <p className="note">${[c.brand||'GameTime',c.line,c.ages?'ages '+c.ages:'',c.cap?c.cap+' users':'',c.ada?c.ada.replace('-',' '):''].filter(Boolean).join(' · ')}${c.notes?html`<br/>${c.notes}`:null}${c.url?html`<br/><a href=${c.url} target="_blank" rel="noopener">Product page</a>`:null}${c.est&&!o.w?html`<br/><b>Size is estimated</b> from the published use zone. Check the maker's CAD drawing and enter the real width and depth.`:null}${c.deckFall&&o.fall==null?html`<br/><b>Fall height</b> equals the deck it attaches to. Set it to match.`:null}</p>
      <div className="grid2"><${Field} label="Width" id="pg-w"><${LenInput} id="pg-w" value=${f.w} onChange=${v=>v>0&&up({w:v})}/><//><${Field} label="Depth" id="pg-d"><${LenInput} id="pg-d" value=${f.d} onChange=${v=>v>0&&up({d:v})}/><//>
        <${Field} label="Fall height" id="pg-fh"><${LenInput} id="pg-fh" value=${o.fall??c.fall??0} onChange=${v=>v>=0&&up({fall:v})}/><//><${Field} label="Rotation" id="pg-r"><${NumInput} id="pg-r" value=${o.rot||0} onChange=${v=>up({rot:v})}/><//>
        <${Field} label="Colors" id="pg-sc"><${Sel} id="pg-sc" value=${o.scheme||p.settings?.play?.scheme||'primary'} onChange=${v=>up({scheme:v})} options=${Object.entries(PLAY_SCHEMES).map(([k,v])=>[k,v[0]])}/><//>
        ${c.cat==='swing'&&/frame/i.test(c.name||'')&&Object.keys(PLAY_SEATS).length?html`<${Field} label="Seats" id="pg-seat"><${Sel} id="pg-seat" value=${o.seat||''} onChange=${v=>up({seat:v||null})} options=${[['','Belt seats (standard)'],...Object.values(PLAY_SEATS).map(x=>[x.key,x.model+' · '+x.name])]}/><//>`:null}
        ${c.cat==='structure'?html`<${Field} label="Elevated play events" id="pg-ev"><${NumInput} id="pg-ev" value=${o.elev??c.elevated??0} onChange=${v=>v>=0&&up({elev:Math.round(v)})}/><//><${Field} label="Ground-level play events" id="pg-gl"><${NumInput} id="pg-gl" value=${o.ground??c.groundEvents??0} onChange=${v=>v>=0&&up({ground:Math.round(v)})}/><//><${Field} label="Elevated reached by ramp or transfer" id="pg-ea"><${NumInput} id="pg-ea" value=${o.elevAcc??c.elevAcc??0} onChange=${v=>v>=0&&up({elevAcc:Math.round(v)})}/><//><${Field} label="Ground-level types" id="pg-gt"><${NumInput} id="pg-gt" value=${o.groundTypes??c.groundTypes??0} onChange=${v=>v>=0&&up({groundTypes:Math.round(v)})}/><//>`:null}</div>
      ${(()=>{const u=playZone(o);const W=Math.hypot(u[1].x-u[0].x,u[1].y-u[0].y),D=Math.hypot(u[2].x-u[1].x,u[2].y-u[1].y);return html`<div className="stat"><span>Use zone</span><span className="mono">${fmtLen(W)} x ${fmtLen(D)}</span></div>`;})()}
      <label className="check"><input type="checkbox" checked=${p.settings?.play?.zones!==false} onChange=${e=>commit({...p,settings:{...p.settings,play:{...(p.settings?.play||{}),zones:e.target.checked}}})}/> Show use zones on the plan</label></div>`;},
  takeoff:(p,add)=>{const C='Playground';const by={};for(const o of p.play||[]){if(o.status==='existing'||o.status==='demolish')continue;const c=PLAY[o.key];if(!c)continue;const k=o.key+'|'+(o.scheme||'');by[k]=by[k]||{c,n:0,sc:schemeOf(p,o)[0]};by[k].n++;}
    for(const {c,n,sc} of Object.values(by))add(C,`${c.brand||'GameTime'} ${c.model?'#'+c.model+' ':''}${c.name}`,n,'EA',`${sc} colors; price by quote`);
    const seats={};for(const o of p.play||[]){if(o.status==='existing'||o.status==='demolish'||!o.seat||!PLAY_SEATS[o.seat])continue;const c=PLAY[o.key]||{};const bays=Math.max(1,Math.round(playFoot(o).w/120));seats[o.seat]=(seats[o.seat]||0)+bays*(/expression|zero/i.test(PLAY_SEATS[o.seat].name)?1:2);}
    for(const [k,n] of Object.entries(seats)){const x=PLAY_SEATS[k];add(C,`GameTime #${x.model} ${x.name}`,n,'EA','swing seats with hangers');}
    if(Object.keys(by).length){add(C,'Installation by a certified installer (NPSI/CPSI inspection after install)',1,'LS');add(C,'Playground signage: age group and adult supervision',Math.max(1,(p.playareas||[]).length),'EA','CPSC Handbook 2.3');}}});
/* ---- play areas: safety surfacing, border, ADA ---- */
regObj('playarea',{coll:'playareas',label:'Play area',plural:'play areas',z:-6,layer:'under',hitStage:'late',planSheet:false,
  pts:(p,o)=>o.pts.map(([x,y])=>({x,y})),noBounds:true,hit:(p,o,raw)=>inPoly(raw.x,raw.y,o.pts),
  move:(o,dx,dy)=>({...o,pts:o.pts.map(([x,y])=>[x+dx,y+dy])}),
  title:o=>`Play area · ${surfOf(o.surf)[1]} · ${Math.round(polyArea(o.pts)/144)} sq ft`,
  svg:(p,lv,o,S,view,isSel)=>html`<polygon points=${o.pts.map(([x,y])=>S(x,y).join(',')).join(' ')} className=${'playarea surf-'+o.surf+(isSel?' site-sel':'')}/>`,
  add3D:(p,lv,o,ctx)=>{if(lv.id!==groundLevel(p).id)return;const S=surfOf(o.surf);const z=siteZ(p);const col=o.color?hexNum(o.color):({ewf:0xa8865e,woodchips:0x8f6a45,mulch:0x6b4a2f,rubbermulch:0x7a2f2a,sand:0xd9c79f,peagravel:0xb0a796,pip:0x2f6fb0,tiles:0x3a7a3a,turf:0x4f8f3a})[o.surf]||0x9a8a70;
    const m=ctx.isSel(o)?ctx.mSel:ctx.col(col,{roughness:1,key:'pa-'+o.surf});ctx.prism(o.pts.map(([x,y])=>({x,y})),z-0.5,z+(S[2]?1.5:0.6),m);
    const b=o.border||(S[2]?'timber':'none');if(b!=='none'){const bm=ctx.col(b==='timber'?0x6b5a40:b==='plastic'?0x2c4a8a:b.startsWith('gtcurb')?0x2b2b2b:0xb9b5ab,{roughness:.8,key:'pb-'+b});const pts=o.pts;for(let i=0;i<pts.length;i++){const a=pts[i],c=pts[(i+1)%pts.length];const L=Math.hypot(c[0]-a[0],c[1]-a[1]);ctx.box((a[0]+c[0])/2,(a[1]+c[1])/2,z,L,b==='curb'?6:b.startsWith('gtcurb')?4:8,borderOf(b)[2]||10,Math.atan2(c[1]-a[1],c[0]-a[0]),bm);}}},
  panel:(o,{p,up})=>{const S=surfOf(o.surf);const items=(p.play||[]).filter(e=>e.status!=='demolish'&&inPoly(e.x,e.y,o.pts));const maxFH=Math.max(0,...items.map(e=>e.fall??(PLAY[e.key]||{}).fall??0));const rate=surfRating(o);
    return html`<div className="sec"><h3>Play area</h3>
      <${Field} label="Surfacing" id="pa-s"><${Sel} id="pa-s" value=${o.surf} onChange=${v=>up({surf:v,depth:null,rating:null})} options=${PLAY_SURF.map(s=>[s[0],s[1]])}/><//>
      ${S[2]?html`<${Field} label="Installed depth" id="pa-d"><${LenInput} id="pa-d" value=${o.depth||S[5]} onChange=${v=>v>0&&up({depth:v})}/><//><p className="note">Loose fill packs down about 25%; install 12" to keep 9" (CPSC Handbook Table 2). Rubber mulch is installed at 6".</p>`
        :html`<${Field} label="Tested critical fall height" id="pa-r"><${LenInput} id="pa-r" value=${(o.rating||S[4])*12} onChange=${v=>v>0&&up({rating:v/12})}/><//><${Field} label="Thickness" id="pa-t"><${LenInput} id="pa-t" value=${o.depth||S[5]} onChange=${v=>v>0&&up({depth:v})}/><//><p className="note">Use the critical height the surfacing maker certifies to ASTM F1292 for this thickness.</p>`}
      <${Field} label="Border" id="pa-b"><${Sel} id="pa-b" value=${o.border||(S[2]?'timber':'none')} onChange=${v=>up({border:v})} options=${PLAY_BORDERS.map(x=>[x[0],x[1]])}/><//>
      ${(()=>{const g=PLAY_SURF_GT.find(x=>x.model===GT_SURF_MAP[o.surf]);return g?html`<p className="note">GameTime option: ${g.name} (${g.model}). <a href=${(g.notes.match(/https?:\/\/\S+/)||[g.url])[0]} target="_blank" rel="noopener">Product page</a></p>`:null;})()}
      <div className="stat"><span>Area</span><span className="mono">${Math.round(polyArea(o.pts)/144)} sq ft</span></div>
      <div className="stat"><span>Highest fall height inside</span><span className="mono">${fmtLen(maxFH)}</span></div>
      <div className="stat"><span>Surfacing protects to</span><span className=${'mono'+(rate*12<maxFH?' bad':'')}>${rate?rate+' ft':'not enough depth'}</span></div>
      <div className="stat"><span>Wheelchair accessible surface</span><span className="mono">${S[3]?'yes (ASTM F1951)':'no'}</span></div>
      <${ColorPick} id="pa-c" label="Color" value=${o.color} fallback="#a8865e" onChange=${v=>up({color:v})}/></div>`;},
  takeoff:(p,add)=>{const C='Playground';for(const o of p.playareas||[]){if(o.status==='existing')continue;const S=surfOf(o.surf);const A=polyArea(o.pts)/144;const per=polyPerimPts(o.pts.map(([x,y])=>({x,y})))/12;
      if(S[2]){const d=o.depth||S[5];add(C,`${S[1]} playground surfacing, ${d}" installed`,Math.ceil(A*d/12/27*10)/10,'CY',o.surf==='ewf'?'certified to ASTM F1292 and F2075':'');if(o.surf==='ewf'||o.surf==='woodchips')add(C,'Drainage aggregate and geotextile under loose fill',Math.ceil(A),'SF');add(C,'Wear mats under swings and slide exits',(p.play||[]).filter(e=>inPoly(e.x,e.y,o.pts)&&['swing','slide'].includes((PLAY[e.key]||{}).cat)).length*2||0,'EA');add(C,'Accessible entry ramp or surfacing transition',1,'EA','ADA 1008.2 at the access route');}
      else add(C,`${S[1]} surfacing, ${o.depth||S[5]}" thick`,Math.ceil(A),'SF','tested critical height '+(o.rating||S[4])+' ft');
      const b=o.border||(S[2]?'timber':'none');if(b!=='none')add(C,b==='timber'?'Recycled plastic playground timbers':b==='plastic'?'Playground border':b==='curb'?'Concrete curb':borderOf(b)[1],Math.ceil(per),'LF');}},
  checks:(p,add)=>{const items=(p.play||[]).filter(o=>o.status!=='demolish');const areas=(p.playareas||[]).filter(o=>o.status!=='demolish');const A=(set,code,title)=>({set,code,title});
    for(const o of items){const c=PLAY[o.key]||{};const T={kind:'play',id:o.id};const pt={x:o.x,y:o.y};const fh=o.fall??c.fall??0;const Z=playZone(o);
      const area=areas.find(a=>Z.every(q=>inPoly(q.x,q.y,a.pts)));
      if(!area)add('error',A('CPSC','5.2',  'Surfacing through the use zone'),`${c.name||'Play item'}: use zone not covered by safety surfacing`,'Draw a play area with impact-absorbing surfacing that covers the whole use zone (dashed outline).',T,pt,o.level);
      else{const r=surfRating(area);if(fh>0&&r*12<fh)add('error',A('ASTM','F1292',  'Surfacing for the fall height'),`${c.name||'Play item'}: surfacing too thin for a ${fmtLen(fh)} fall`,`${surfOf(area.surf)[1]} as drawn protects to ${r||0} ft. ${surfOf(area.surf)[2]?'Keep 9" compressed (12" installed) or choose a surface rated higher.':'Use a thicker system rated for this fall height.'}`,T,pt,o.level);}
      for(const q of items){if(q===o||q.id<o.id)continue;const cq=PLAY[q.key]||{};const fq=q.fall??cq.fall??0;const gap=polyGap(playRect(o),playRect(q));const swing=c.cat==='swing'||cq.cat==='swing';
        if(swing&&rectsOverlap(playZone(o),playZone(q))&&!(c.cat==='swing'&&cq.cat==='swing'&&false))add('error',A('CPSC','5.3.8','Swing use zones'),`${c.name} and ${cq.name}: swing zone overlaps`,'The use zone in front of and behind swings must not overlap any other use zone.',T,pt,o.level);
        else{const need=(fh>30||fq>30)?108:72;if(gap<need-0.5&&rectsOverlap(playZone(o),playZone(q)))add('error',A('CPSC','5.1',  'Space between equipment'),`${c.name} and ${cq.name} are ${fmtLen(gap)} apart`,`Use zones may overlap only with ${need===108?'9 ft between equipment when either play surface is over 30"':'6 ft between equipment'}.`,T,pt,o.level);}}}
    for(const a of areas){const T={kind:'playarea',id:a.id};const c0=polyLabelPt(a.pts);const pt={x:c0[0],y:c0[1]};const inside=items.filter(o=>inPoly(o.x,o.y,a.pts));const S=surfOf(a.surf);
      if(!S[3])add('warn',A('ADA','1008.2.6','Accessible ground surface'),`Play area: ${S[1].toLowerCase()} is not wheelchair accessible`,'Accessible routes in a play area need a surface that meets ASTM F1951 (EWF, poured rubber, tiles or turf). Provide at least an accessible path to the ground-level play components.',T,pt,a.level);
      const walks=(p.site||[]).filter(s=>s.type==='walk');const reach=walks.some(s=>s.pts.some(([x,y])=>{const q={x,y};let m=1e9;for(let i=0;i<a.pts.length;i++)m=Math.min(m,segDistPt(q,{x:a.pts[i][0],y:a.pts[i][1]},{x:a.pts[(i+1)%a.pts.length][0],y:a.pts[(i+1)%a.pts.length][1]}));return m<36||inPoly(x,y,a.pts);}));
      if(!reach&&inside.length)add('warn',A('ADA','240.1 / 1008.2','Accessible route to the play area'),'Play area: no walkway reaches it','Draw an accessible walkway (36" wide minimum, 60" preferred) from parking or the street to the play area.',T,pt,a.level);
      const elev=inside.reduce((s,o)=>s+(o.elev??(PLAY[o.key]||{}).elevated??0),0);const ground=inside.filter(o=>{const c=PLAY[o.key]||{};if(['swing','spinner','rocker','freestanding','musical','sensory','accessible'].includes(c.cat))return !/ramp|transfer/i.test(c.name||'');return ['climber','slide'].includes(c.cat)&&(c.ada==='ground-level'||c.ada==='inclusive'||!c.fall||(o.fall??c.fall)<=30);});
      const gTypes=new Set(ground.map(o=>(PLAY[o.key]||{}).cat));const extraT=inside.reduce((s,o)=>s+(o.groundTypes??(PLAY[o.key]||{}).groundTypes??0),0);const elevAcc=inside.reduce((s,o)=>s+(o.elevAcc??(PLAY[o.key]||{}).elevAcc??0),0);const gN=ground.length+inside.reduce((s,o)=>s+(o.ground??(PLAY[o.key]||{}).groundEvents??0),0);
      if(elev>=2){const T2=[[1,1,0,0],[2,4,1,1],[5,7,2,2],[8,10,3,3],[11,13,4,3],[14,16,5,3],[17,19,6,3],[20,22,7,4],[23,25,8,4]];const r=T2.find(t=>elev>=t[0]&&elev<=t[1]);const needN=r?r[2]:8+Math.ceil((elev-25)/3),needT=r?r[3]:5;
        if(gN<needN||gTypes.size+extraT<needT)add('warn',A('ADA','240.2.1.2','Ground-level play components'),`Play area: ${gN} ground-level play components for ${elev} elevated ones`,`ADA Table 240.2.1.2 asks for at least ${needN} ground-level components of ${needT} different types on an accessible route (unless half of the elevated ones are reached by ramp).`,T,pt,a.level);
        if(elev>=20)add('warn',A('ADA','240.2.2','Elevated play components'),'Play area: 20 or more elevated components','At least 25% of elevated components must be reached by ramp; the rest by ramp or transfer system (240.2.2).',T,pt,a.level);
        else if(elevAcc*2<elev)add('warn',A('ADA','240.2.2','Elevated play components'),`Play area: ${elev} elevated components`,'At least 50% of elevated play components must be on an accessible route: a ramp or a transfer system (240.2.2, 1008.2.4, 1008.3).',T,pt,a.level);}
      const ages=new Set(inside.map(o=>(PLAY[o.key]||{}).ages).filter(Boolean));if(ages.has('2-5')&&ages.has('5-12'))add('warn',A('CPSC','2.3','Age groups'),'Play area: 2-5 and 5-12 equipment together','Separate the 2-5 and 5-12 areas with a buffer such as a walkway or bench, and sign each for its age group.',T,pt,a.level);}}});
/* ---- tools ---- */
I.play=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21L8 5h8l5 16M6 13h12"/><path d="M10 13v5M14 13v5"/></svg>`;
I.playarea=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2"><path d="M3 6h18v14H3z"/></svg>`;
let PLAY_PRESET={key:null};let PLAYAREA_PRESET={surf:'ewf'};
regTool('play',{label:'Play equipment',group:'site',icon:I.play,mode:'click',snap:'grid',
  hint:()=>html`<b>Play equipment:</b> click to place ${(PLAY[PLAY_PRESET.key]||{}).name||'an item'}. Pick GameTime equipment in the Library under Playground. Use zones show as dashed outlines.`,
  place:(ctx,pts)=>{const lv=groundLevel(ctx.p);const key=PLAY[PLAY_PRESET.key]?PLAY_PRESET.key:Object.keys(PLAY)[0];if(!key)return null;const o={id:uid('pg'),level:lv.id,key,x:pts[0].x,y:pts[0].y,rot:0,status:'new'};
    return {p:{...ctx.p,play:[...(ctx.p.play||[]),o]},sel:{kind:'play',id:o.id}};}});
regTool('playarea',{label:'Play area and surfacing',group:'site',icon:I.playarea,mode:'chain',min:3,closable:true,snap:'grid',
  hint:n=>n?html`Click the next corner; click the first point to close.`:html`<b>Play area:</b> click the corners of the safety surfacing. It must cover every use zone.`,
  place:(ctx,pts)=>{if(pts.length<3)return null;const lv=groundLevel(ctx.p);const o={id:uid('pa'),level:lv.id,pts:pts.map(q=>[q.x,q.y]),surf:PLAYAREA_PRESET.surf||'ewf',status:'new'};return {p:{...ctx.p,playareas:[...(ctx.p.playareas||[]),o]},sel:{kind:'playarea',id:o.id},tool:'select'};}});
addToolToGroup('site','playarea');addToolToGroup('site','play');
// fit a play area around the selected equipment's use zones
function playAreaAround(p,items){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const o of items)for(const q of playZone(o)){x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y);}
  const r=v=>Math.round(v/6)*6;return [[r(x0)-6,r(y0)-6],[r(x1)+6,r(y0)-6],[r(x1)+6,r(y1)+6],[r(x0)-6,r(y1)+6]];}
/* ---- 3D: equipment drawn from its category and size ---- */
function addPlay3D(p,o,ctx){const c=PLAY[o.key]||{cat:'freestanding'};const f=playFoot(o);const z=playZ(p,o);const sc=schemeOf(p,o);const sel=ctx.isSel(o);
  const M=(i,extra={})=>sel?ctx.mSel:ctx.col(sc[i],{roughness:.55,...extra,key:'pg'+i+(extra.metalness?'m':'')});const post=M(1,{metalness:.3}),deck=M(2),acc=M(3),roof=M(4);const steel=ctx.col(0x9aa0a4,{roughness:.35,metalness:.7,key:'pgs'});
  const a=(o.rot||0)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);const W=(u,v)=>({x:o.x+u*ca-v*sa,y:o.y+u*sa+v*ca});
  const B=(u,v,z0,w,d,h,mat,ang=0)=>{const q=W(u,v);return ctx.box(q.x,q.y,z+z0,w,d,h,a+ang,mat);};
  const P=(u,v,z0,h,r=2.5,mat=post)=>{const q=W(u,v);return ctx.cyl(q.x,q.y,z+z0,r,h,mat,12);};
  const S=(u1,v1,z1,u2,v2,z2,w,mat,round=true)=>{const A1=W(u1,v1),A2=W(u2,v2);return ctx.stick({x:A1.x,y:A1.y,z:z+z1},{x:A2.x,y:A2.y,z:z+z2},w,w,mat,round);};
  const hw=f.w/2,hd=f.d/2,fh=o.fall??c.fall??0;
  if(/sandbox/i.test(c.name||'')){const wd=ctx.col(0x8a6a44,{roughness:.8,key:'sbx'});for(const s of [-1,1]){B(0,s*(hd-3),0,f.w,6,c.h||12,wd);B(s*(hw-3),0,0,6,f.d-12,c.h||12,wd);}B(0,0,0,f.w-12,f.d-12,(c.h||12)-3,ctx.col(0xe3d3a8,{roughness:1,key:'sand'}));return;}
  switch(c.cat){
    case 'swing':{const pv=c.h||96;const bays=Math.max(1,Math.round(f.w/(/saucer|tire|arch/i.test(c.name||'')?f.w:120)));const bw=f.w/bays;S(-hw,0,pv,hw,0,pv,3.5,post);for(let i=0;i<=bays;i++){const u=-hw+i*bw;S(u,0,pv,u,-hd,0,2.8,post);S(u,0,pv,u,hd,0,2.8,post);}
      const snm=(o.seat&&PLAY_SEATS[o.seat]?.name)||c.name||'';const kind=/tot|bucket|infant/i.test(snm)?'bucket':/expression/i.test(snm)?'expr':/saucer|nest|disk|disc/i.test(snm)?'saucer':/zero|accessible|inclusive|seat.?belt|molded/i.test(snm)?'bucket':'belt';
      for(let i=0;i<bays;i++){const u0=-hw+i*bw;const seats=kind==='saucer'?[u0+bw/2]:[u0+bw*0.3,u0+bw*0.7];for(const u of seats){const sz=kind==='saucer'?16:20;for(const s of [-1,1])S(u+s*(kind==='saucer'?14:7),0,pv,u+s*(kind==='saucer'?10:7),0,sz+2,0.5,steel);
          if(kind==='saucer'){const q=W(u,0);ctx.cyl(q.x,q.y,z+sz-2,20,3,acc,20);}else if(kind==='bucket'||(kind==='expr'&&u===seats[0]))B(u,0,sz-6,14,12,10,acc);else B(u,0,sz,22,6,1.2,M(4));}}return;}
    case 'slide':{const h=fh||48;B(0,-hd+10,h-4,24,20,4,deck);for(const s of [-1,1])for(const t of [-1,1])P(s*12,-hd+10+t*10,0,h+38);B(0,-hd+10,h+30,26,22,4,roof);
      const spiral=/spiral|corkscrew|twist/i.test(c.name||'');if(spiral){for(let i=0;i<14;i++){const t=i/14;const ang=t*Math.PI*1.6;const r=24;B(Math.cos(ang)*r*0.4,-hd+30+Math.sin(ang)*r,h*(1-t),20,10,1.5,acc,ang);}}
      else{S(0,-hd+20,h,0,hd-10,6,24,acc,false);B(0,hd-6,4,22,12,2,acc);}for(let k=1;k<5;k++)S(-9,-hd-4+k*0,h*k/5,9,-hd-4,h*k/5,1.2,steel);S(-10,-hd-4,0,-10,-hd-4,h,2,post);S(10,-hd-4,0,10,-hd-4,h,2,post);return;}
    case 'spinner':{P(0,0,0,30,3,steel);const q=W(0,0);if(/seat|spinami|cup|we.?go|whirl|merry|roundabout/i.test(c.name||'')&&f.w>60){ctx.cyl(q.x,q.y,z+6,f.w/2,4,deck,28);for(let i=0;i<4;i++){const an=i/4*Math.PI*2;S(Math.cos(an)*f.w*0.3,Math.sin(an)*f.w*0.3,10,0,0,32,1.6,steel);}}else{ctx.cyl(q.x,q.y,z+18,10,6,acc,20);ctx.cyl(q.x,q.y,z+30,3,10,post,12);}return;}
    case 'rocker':{if(/seesaw|teeter|see-saw/i.test(c.name||'')){P(0,0,0,20,4,steel);const L=Math.max(f.w,f.d)-8;const al=f.d>f.w;S(al?0:-L/2,al?-L/2:0,14,al?0:L/2,al?L/2:0,26,5,deck,false);for(const t of [-1,1]){B(al?0:t*(L/2-10),al?t*(L/2-10):0,22,al?20:16,al?16:20,4,acc);B(al?0:t*(L/2-10),al?t*(L/2-4):0,26,al?20:3,al?3:20,14,acc);}return;}
P(0,0,0,12,4,steel);const q=W(0,0);const g=new THREE.SphereGeometry(f.w*0.35*IN,14,10);g.scale(1,0.55,0.5);ctx.add(g,acc,q.x*IN,(z+20)*IN,q.y*IN,-a);B(0,0,24,6,3,10,post);return;}
    case 'climber':{const h=Math.max(36,fh||c.h||72);if(/boulder|rock/i.test(c.name||'')){const q=W(0,0);const g=new THREE.DodecahedronGeometry(Math.min(f.w,f.d)/2*IN,0);g.scale(1,h/Math.min(f.w,f.d),1);ctx.add(g,ctx.col(0x9a948a,{roughness:1,flatShading:true,key:'boulder'}),q.x*IN,(z+h/2)*IN,q.y*IN,0);return;}
      if(/net|web|rope|pyramid|space/i.test(c.name||'')){P(0,0,0,h+18,3,steel);for(let i=0;i<10;i++){const an=i/10*Math.PI*2;S(0,0,h+12,Math.cos(an)*hw,Math.sin(an)*hd,0,0.7,acc);}return;}
      for(const s of [-1,1])P(s*(hw-6),0,0,h,2.5);for(let i=0;i<8;i++){const t=i/8;S(-hw+6,0,h*t+6,hw-6,(i%2?8:-8),h*t+12,1.4,acc);}return;}
    case 'shade':{const h=c.h||120;for(const s of [-1,1])for(const t of [-1,1])P(s*(hw-4),t*(hd-4),0,h,3);const q=W(0,0);const g=new THREE.ConeGeometry(Math.hypot(hw,hd)*IN,30*IN,4,1,true);g.rotateY(Math.PI/4);ctx.add(g,M(4,{side:THREE.DoubleSide}),q.x*IN,(z+h+12)*IN,q.y*IN,-a);return;}
    case 'seating':{if(/table/i.test(c.name||'')){B(0,0,28,f.w,Math.min(30,f.d*0.45),2,deck);for(const s of [-1,1])B(0,s*f.d*0.38,17,f.w,10,2,deck);for(const s of [-1,1])P(s*(hw-10),0,0,28,2,steel);}else{B(0,0,17,f.w,Math.min(18,f.d),2,deck);B(0,-Math.min(18,f.d)/2,19,f.w,2,14,deck);for(const s of [-1,1])P(s*(hw-8),0,0,17,2,steel);}return;}
    case 'fitness':{const h=c.h||84;for(const s of [-1,1])P(s*(hw-4),0,0,h,3);S(-hw+4,0,h-6,hw-4,0,h-6,2,steel);B(0,0,18,f.w*0.6,Math.min(16,f.d),3,deck);return;}
    case 'musical':case 'sensory':{for(const s of [-1,1])P(s*(hw-3),0,0,c.h||60,2.5);B(0,0,18,f.w-8,2,Math.min(36,(c.h||60)-24),acc);for(let i=0;i<6;i++)B(-hw+10+i*(f.w-20)/5,1.5,26,4,1,16,deck);return;}
    case 'structure':{const nD=Math.max(1,Math.min(6,Math.round(f.w*f.d/(110*110))));const decks=[];const cols=Math.max(1,Math.round(nD/(f.d>f.w*0.8?2:1)));const rows=Math.ceil(nD/cols);const top=Math.max(32,fh||72);
      for(let i=0;i<nD;i++){const cI=i%cols,rI=Math.floor(i/cols);const u=-hw+f.w*(cI+0.5)/cols,v=-hd*0.55+(rows>1?rI*hd*1.1/(rows-1||1):0)*(rows>1?1:0);const dh=i%2?Math.max(24,top-24):top;decks.push({u,v,h:dh});}
      for(const d of decks){B(d.u,d.v,d.h-4,46,46,4,deck);for(const s of [-1,1])for(const t of [-1,1])P(d.u+s*22,d.v+t*22,0,d.h+48,2.5);for(const s of [-1,1])B(d.u+s*22,d.v,d.h,2,44,30,acc);}
      const hi=decks.reduce((m,d)=>d.h>m.h?d:m,decks[0]);const rq=W(hi.u,hi.v);const g=new THREE.ConeGeometry(36*IN,22*IN,4);g.rotateY(Math.PI/4);ctx.add(g,roof,rq.x*IN,(z+hi.h+48+11)*IN,rq.y*IN,-a);
      for(let i=0;i+1<decks.length;i++){const A1=decks[i],A2=decks[i+1];S(A1.u,A1.v,A1.h,A2.u,A2.v,A2.h,6,acc,false);}
      S(hi.u,hi.v+24,hi.h,hi.u,hd-8,8,22,acc,false);const lo=decks[decks.length-1];for(let k=1;k<4;k++)B(lo.u,-hd+4,lo.h*k/4-2,30,8,2,deck);return;}
    default:{for(const s of [-1,1])P(s*(hw-3),0,0,c.h||60,2.5);B(0,0,20,f.w-8,3,Math.max(12,(c.h||60)-30),acc);}}}
function registerPlayLib(){for(const c of Object.values(PLAY))registerLibItem({id:'pg-'+c.key,cat:'Playground',sub:(c.brand||'GameTime')+': '+(PLAY_CATS[c.cat]||'Other'),label:(c.model?c.model+' ':'')+c.name,place:'play',key:c.key});
  for(const s of PLAY_SURF)registerLibItem({id:'pgs-'+s[0],cat:'Playground',sub:'Safety surfacing',label:s[1]+(s[3]?' (accessible)':''),place:'playarea',surf:s[0]});}
