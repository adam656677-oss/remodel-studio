/* ======================= materials ======================= */
// Builder's takeoff from the model. Quantities are estimates with waste included; prices are entered by the user.
const SIDING={vinyl:{label:'Vinyl siding'},fibercement:{label:'Fiber cement lap siding'},brick:{label:'Brick veneer'},wood:{label:'Wood lap siding'},concrete:{label:'Poured concrete or block (basement wall)'}};
const studOf=w=>w.thick>=6.25?'2x6':'2x4';
const stockLen=inches=>{for(const L of [8,10,12,14,16,18,20])if(L*12>=inches)return L;return Math.ceil(inches/24)*2;};
function precutFor(h){if(Math.abs(h-97.125)<4)return '92-5/8"';if(Math.abs(h-109.125)<4)return '104-5/8"';if(Math.abs(h-121.125)<4)return '116-5/8"';return null;}
function takeoff(p,{waste=0.1}={}){
  const rows=[];const add=(cat,item,qty,unit,note='',phase='new')=>{if(!(qty>0))return;const key=cat+'|'+item+'|'+phase;const r=rows.find(r=>r.key===key);if(r){r.qty=Math.round((r.qty+qty)*1000)/1000;if(note&&!r.note.includes(note))r.note+=(r.note?'; ':'')+note;}else rows.push({key,cat,item,qty,unit,note,phase});};
  const W=1+waste; const lvls=sortedLevels(p);const cabPrices={};
  const opArea=w=>p.openings.filter(o=>o.wall===w.id).reduce((s,o)=>s+o.width*o.height,0);
  const S=analyzeStructure(p);
  for(const lv of lvls){const fr=framingOf(lv);const first=lv.id===groundLevel(p).id;const walls=p.walls.filter(w=>w.level===lv.id);const J=wallJoins(walls.filter(w=>w.status!=='demolish'));
    for(const w of walls){const L=wlen(w),H=wallH(p,w);const sz=studOf(w);
      if(w.status==='demolish'){add('Demolition',`Remove ${w.kind} wall, ${fmtLen(H)} high`,L/12,'LF',w.bearing?'Bearing: shore first and install the new beam':'');
        add('Demolition','Drywall removal',(w.kind==='exterior'?1:2)*(L*H-opArea(w))/144,'SF');continue;}
      if(w.status==='existing')continue;
      const ops=p.openings.filter(o=>o.wall===w.id);const joins=(J[w.id]?.a?1:0)+(J[w.id]?.b?1:0);const mat=w.mat||'wood';const wallSF=(L*H-opArea(w))/144;
      if(mat==='cmu'){const t=w.thick>=11?'12"':'8"';add('Masonry',`${t} CMU block 8x16`,Math.ceil(wallSF*1.125*W),'EA','1.125 blocks per sq ft');add('Masonry','Type S mortar, 80 lb',Math.ceil(wallSF*1.125/30),'bag','about 1 bag per 30 blocks');
        add('Masonry','#4 rebar x 20\'',Math.ceil(L/48*H/240)+Math.ceil(H/16*L/240),'EA','vertical at 48" o.c. and bond beams; confirm with design');add('Masonry','Grout for filled cells',Math.ceil(L/48*H/12*0.5/27*10)/10,'CY');}
      else if(mat==='icf'){add('Masonry','ICF block (6" core) 16" x 48"',Math.ceil(wallSF/5.33*W),'EA');add('Masonry','Concrete for ICF core',Math.ceil(wallSF*0.5/27*10)/10,'CY','6" core');}
      else if(mat==='sip'){add('Wall framing','SIP wall panel 4x8, 6-1/2"',Math.ceil(wallSF*W/32),'EA');}
      else if(mat==='glassblock'){add('Masonry','Glass block 8x8',Math.ceil(wallSF*2.25*W),'EA');}
      else if(mat==='postframe'){add('Wall framing','6x6 treated post',Math.ceil(L/96)+1,'EA','8\' o.c.');add('Wall framing','2x4 girt x 16\'',Math.ceil(L/192)*Math.ceil(H/24),'EA','24" o.c.');}
      else{const metal=mat==='metalstud';const szz=metal?(w.thick>6?'6" metal':'3-5/8" metal'):sz;
      const studs=Math.ceil(L/16)+1+ops.length*2+joins*2; const pre=precutFor(H);
      add('Wall framing',metal?`${szz} stud x ${stockLen(H)}'`:pre?`${sz} stud, ${pre} precut`:`${sz} x ${stockLen(H-4.5)}' stud`,Math.ceil(studs*W),'EA',`${fmtLen(H)} walls at 16" o.c.`);
      const plateLF=L*3/12; const pt=first&&fr.foundation==='slab';
      add('Wall framing',metal?`${szz} track x 10'`:`${sz} x 16' plate`,metal?Math.ceil(L*2/12*W/10):Math.ceil(plateLF*(pt?2/3:1)*W/16),'EA',metal?'top and bottom track':'double top plate'+(pt?'':' and bottom plate'));
      if(pt&&!metal)add('Wall framing',`${sz} x 16' pressure-treated sill plate`,Math.ceil(L/12*W/16),'EA','bottom plate on slab');
      if(mat==='brickveneer')add('Siding','Brick veneer (modular)',Math.ceil(wallSF*6.75*W),'brick','about 6.75 per sq ft; add ties and weeps');
      if(mat==='stoneveneer')add('Siding','Manufactured stone veneer',Math.ceil(wallSF*W),'SF');}
      for(const o of ops){const m=S.find(x=>x.id==='h-'+o.id);const len=stockLen(o.width+3);
        if(!m||m.size==='Flat 2x')add('Wall framing',`${sz} x ${len}' (flat header)`,1,'EA');
        else{const b=BEAMS.find(b=>b.label===m.size)||BEAMS.find(b=>b.label===m.suggest);
          if(b&&b.lvl)add('Headers and beams',`1-3/4" x ${b.lvl===11.875?'11-7/8':b.lvl}" LVL x ${len}'`,b.plies,'EA',`header over ${openingMarks(p)[o.id]||'opening'}`);
          else if(b)add('Headers and beams',`${b.size} x ${len}' (header)`,b.plies,'EA',`header over ${openingMarks(p)[o.id]||'opening'}`);
          else add('Headers and beams',`Engineered header, ${fmtLen(o.width+3)} span`,1,'EA','size by engineer');}
        if(o.type==='door'){const dt=o.dtype||'swing';const sty=o.style?DOOR_STYLES[o.style]+' ':'';
          const hand=(dt==='swing'||dt==='double')?(()=>{const h=doorHanding(p,o);return h.res?`, ${h.res} (ANSI ${h.ansi})`:'';})():'';const dsp=doorSpec(p,o);const matN=(DOOR_MATS.find(x=>x[0]===dsp.door.mat)||['',''])[1].toLowerCase();
          add('Doors and windows',(o.name||(dt==='overhead'?`Overhead door ${fmtLen(o.width)} x ${fmtLen(o.height)}`:dt==='pocket'?`${sty}pocket door ${fmtLen(o.width)} x ${fmtLen(o.height)}`:`${w.kind==='exterior'?'Exterior prehung':'Interior prehung'} ${sty.toLowerCase()}${dt==='swing'?'':DOOR_TYPES[dt].toLowerCase()+' '}door ${fmtLen(o.width)} x ${fmtLen(o.height)}`))+hand,1,'EA',[matN,dsp.door.sidelites?dsp.door.sidelites+' sidelite'+(dsp.door.sidelites>1?'s':''):'',dsp.door.transom?'transom':'',dsp.door.fire20?'20-minute rated':''].filter(Boolean).join(', '));
          if(dt==='pocket')add('Doors and windows',`Pocket door frame kit ${fmtLen(o.width)}`,1,'EA');if(dt==='barn')add('Doors and windows','Barn door track and hardware',1,'set');if(dt==='bifold')add('Doors and windows','Bifold track and hardware',1,'set');
          }
        else{const wo=o.win||{};add('Doors and windows',(o.name||`${(WINDOW_OPS.find(x=>x[0]===(o.operation||'double-hung'))||['','Window'])[1]} window ${fmtLen(o.width)} x ${fmtLen(o.height)}`)+(o.operation==='casement'?(o.hinge?', hinged right':', hinged left'):''),1,'EA',[(WIN_FRAMES.find(x=>x[0]===(wo.frame||'vinyl'))||['',''])[1].toLowerCase(),(WIN_GLASS.find(x=>x[0]===(wo.glass||'lowe'))||['',''])[1].toLowerCase(),wo.screen==='none'?'no screen':wo.screen==='full'?'full screen':''].filter(Boolean).join(', '));}}
      const net=(L*H-opArea(w))/144;
      if(w.kind==='exterior'){
        if(mat!=='cmu'&&mat!=='icf'&&mat!=='sip'&&mat!=='glassblock')add('Sheathing and wrap','7/16" OSB wall sheathing 4x8',Math.ceil(net*W/32),'EA');
        add('Sheathing and wrap','House wrap 9\' x 150\' roll',net*W/1350,'roll');
        const sd=w.siding||'vinyl';const veneer=mat==='brickveneer'||mat==='stoneveneer'||mat==='cmu'||mat==='icf';
        if(veneer){}
        else if(sd==='brick')add('Siding',SIDING.brick.label,Math.ceil(net*6.75*W),'brick','about 6.75 per sq ft');
        else if(sd==='fibercement'||sd==='wood'||sd==='smartside')add('Siding',`${SIDING[sd].label}, 8-1/4" x 12'`,Math.ceil(net*W/7),'EA','7" exposure');
        else if(sd==='vinyl'||sd==='dutchlap')add('Siding',SIDING[sd].label,net*W/100,'square');
        else add('Siding',SIDING[sd]?SIDING[sd].label:'Siding',Math.ceil(net*W),'SF');
        add('Insulation',sz==='2x6'?'R-21 batts for 2x6 walls':'R-13 batts for 2x4 walls',Math.ceil(net*W),'SF');
        add('Drywall','1/2" drywall 4x12',Math.ceil(net*W/48),'EA','inside face of exterior walls');
      } else add('Drywall','1/2" drywall 4x12',Math.ceil(net*2*W/48),'EA','both faces of interior walls');
    }
    // floors and ceilings by room
    for(const r of p.rooms.filter(r=>r.level===lv.id)){const a=polyArea(r.pts)/144;
      const fj=S.find(x=>x.id==='fj-'+r.id);
      if(fj){const xs=r.pts.map(q=>q[0]),ys=r.pts.map(q=>q[1]);const width=fj.axis==='x'?Math.max(...ys)-Math.min(...ys):Math.max(...xs)-Math.min(...xs);
        add('Floor framing',`${fj.suggest||fj.size} x ${stockLen(fj.span+3)}' floor joist`,Math.ceil(width/fj.spacing)+1,'EA',`${fj.spacing}" o.c.`);
        add('Floor framing','3/4" T&G subfloor 4x8',Math.ceil(a*W/32),'EA');}
      const fin=r.finish||(r.use==='bath'||r.use==='kitchen'||r.use==='laundry'?'tile':r.use==='garage'?'concrete':'lvp');
      if(fin==='carpet')add('Flooring','Carpet and pad',Math.ceil(a*W/9),'SY');
      else if(fin==='tile'){add('Flooring','Floor tile',Math.ceil(a*W),'SF');add('Flooring','Thinset mortar, 50 lb',Math.ceil(a/90),'bag');}
      else if(fin==='hardwood')add('Flooring','Hardwood flooring',Math.ceil(a*W),'SF');
      else if(fin==='lvp')add('Flooring','Luxury vinyl plank',Math.ceil(a*W),'SF');
      else if(fin!=='concrete'&&FLOOR_FINISH[fin]){add('Flooring',FLOOR_FINISH[fin].label,Math.ceil(a*W),'SF');if(/porcelain|stone|brickpaver/.test(fin))add('Flooring','Thinset mortar, 50 lb',Math.ceil(a/80),'bag');}
      const cj=S.find(x=>x.id==='cj-'+r.id);
      if(cj){const xs=r.pts.map(q=>q[0]),ys=r.pts.map(q=>q[1]);const width=cj.axis==='x'?Math.max(...ys)-Math.min(...ys):Math.max(...xs)-Math.min(...xs);
        add('Roof and ceiling framing',`${cj.suggest||cj.size} x ${stockLen(cj.span+3)}' ceiling joist`,Math.ceil(width/cj.spacing)+1,'EA',`${cj.spacing}" o.c.`);
        add('Insulation','Attic insulation R-38 blown',Math.ceil(a),'SF');}
      if(isTop(p,lv)||true)add('Drywall','1/2" ceiling drywall 4x12',Math.ceil(a*W/48),'EA');
    }
  }
  // roofs
  for(const r of p.roofs){const lv=lvlOf(p,r.level);if(!lv)continue;const b=roofBuild(r,roofTop(p,r));const rf=rafterOf(r);
    let area=0;for(const t of b.roof){const [A,B,C]=t;const u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];area+=Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])/2;}
    area/=144; const ol=b.outline; let per=0;for(let i=0;i<4;i++)per+=Math.hypot(ol[i][0]-ol[(i+1)%4][0],ol[i][1]-ol[(i+1)%4][1]);per/=12;
    let ridge=0;for(const l of b.lines)ridge+=Math.hypot(l[0][0]-l[1][0],l[0][1]-l[1][1])/12;
    add('Roofing','7/16" OSB roof sheathing 4x8',Math.ceil(area*W/32),'EA');
    add('Roofing','Synthetic underlayment, 10 sq roll',area*W/1000,'roll');
    const cov=rf.cover||'asphalt';
    if(cov==='metal'||cov==='standing'||cov==='fivev')add('Roofing',ROOF_COVER[cov].label,Math.ceil(area*W),'SF');
    else if(cov==='tile'||cov==='concretetile'||cov==='slate'||cov==='shake')add('Roofing',ROOF_COVER[cov].label,area*W/100,'square');
    else if(cov==='tpo'||cov==='modbit'||cov==='epdm')add('Roofing',ROOF_COVER[cov].label,area*W/100,'square','low-slope membrane');
    else if(cov==='threetab'){add('Roofing','3-tab shingles (3 bundles per square)',Math.ceil(area*W/100*3),'bundle');add('Roofing','Starter strip',per/2,'LF','eaves');}
    else{add('Roofing','Architectural shingles (3 bundles per square)',Math.ceil(area*W/100*3),'bundle');add('Roofing','Starter strip',per/2,'LF','eaves');}
    add('Roofing','Ridge and hip cap',ridge,'LF');add('Roofing','Drip edge, 10\'',Math.ceil(per/10),'EA');
    const axis=roofAxis(r);const Ul=axis==='x'?r.w:r.h,Vl=axis==='x'?r.h:r.w;const run=(r.style==='shed'?Vl:Vl/2)+r.overhang;
    const rafterLen=run*Math.sqrt(1+Math.pow(r.pitch/12,2));const rm=S.find(x=>x.id==='rf-'+r.id);
    if(rf.system!=='trusses')add('Roof and ceiling framing',`${(rm&&rm.suggest)||rf.rafter} x ${stockLen(rafterLen)}' rafter`,(Math.ceil(Ul/rf.spacing)+1)*(r.style==='shed'?1:2),'EA',`${rf.spacing}" o.c.`);
    {const t=roofTrimOf(r);const {eaves}=roofEdges(b);const eL=eaves.reduce((s,[a,c])=>s+Math.hypot(c[0]-a[0],c[1]-a[1]),0)/12;
      if(rf.ice&&eL>0)add('Roofing','Ice and water barrier, 2 sq roll',Math.ceil(eL*((r.overhang??12)+24)/12/200*W*10)/10,'roll','eaves to 24" inside the wall (R905.1.2)');
      if(rf.vent&&rf.vent.ridge&&r.style!=='flat')add('Roofing','Ridge vent',Math.ceil(ridge*0.8),'LF','attic exhaust (R806.2)');if(rf.vent&&rf.vent.soffit&&eL>0)add('Roofing','Continuous soffit vent',Math.ceil(eL),'LF','attic intake');
      if(t.gutters&&eL>0){add('Roofing',`Gutter, 5" K-style ${t.gutterColor}`,Math.ceil(eL*W),'LF');add('Roofing','Downspout 2x3 with elbows',Math.max(2,eaves.length*2),'EA','one at each end of each eave run');}
      if(eL>0)add('Exterior trim',`1x${t.fascia+2} fascia board`,Math.ceil(eL*W),'LF');if(t.soffit&&eL>0)add('Exterior trim','Vented soffit',Math.ceil(eL*(r.overhang||12)/12*W),'SF');}
    if(r.style!=='shed')add('Roof and ceiling framing',`${LUMBER[(rm&&rm.suggest)||rf.rafter]>9?'2x12':'2x10'} ridge board`,Math.max(0,ridge),'LF');
  }
  for(const f of (p.fixtures||[])){const t=FIXTURES[f.type];if(!t||t.cat==='Furniture'||(f.lib&&(LIB_BY_ID[f.lib]||{}).cat==='Furniture'))continue;if(f.status==='demolish'){add('Demolition',`Remove ${fxLabel(f).toLowerCase()}`,1,'EA');continue;}if(f.status==='existing')continue;
    if(isCab(f)){const st=cabStyle(p,f);const it=`${cabSku(f)} ${(CAB_STYLES.find(x=>x[0]===st.style)||['',''])[1].toLowerCase()} ${(CAB_FIN.find(x=>x[0]===st.finish)||['',''])[1].toLowerCase()}`;add('Cabinets',it,1,'EA',f.cab&&f.cab.book?f.cab.book:'');cabPrices['Cabinets|'+it+'|new']=cabPrice(p,f);continue;}
    add(f.lib&&(LIB_BY_ID[f.lib]||{}).cat==='Appliances'?'Appliances':'Fixtures and cabinets',f.name||(/cab|base|vanity|tall|island/.test(f.type)?`${t.label} ${fmtLen(f.w)} wide`:t.label),1,'EA');
    if(COUNTERTOP.has(f.type))add('Fixtures and cabinets','Countertop',Math.ceil(f.w/12*10)/10,'LF',`${fmtLen(f.d+1.5)} deep`);}
  finishTakeoff(p,add,W);
  elecTakeoff(p,add,W);rampTakeoff(p,add,W);regTakeoff(p,add,W);
  // fasteners (rules of thumb)
  const studCount=rows.filter(r=>r.cat==='Wall framing'&&/stud/.test(r.item)).reduce((s,r)=>s+r.qty,0);
  add('Fasteners','16d framing nails',Math.ceil(studCount/10)*5,'lb','about 5 lb per 10 studs');
  const dw=rows.filter(r=>r.cat==='Drywall').reduce((s,r)=>s+r.qty,0);
  add('Fasteners','1-1/4" drywall screws',Math.ceil(dw/8)*5,'lb','about 5 lb per 8 sheets');
  add('Drywall','All-purpose joint compound, 4.5 gal',Math.ceil(dw*48/450),'box');add('Drywall','Paper joint tape, 500\'',Math.ceil(dw*48/1000),'roll');
  for(const r of rows){if(r.unit==='roll'||r.unit==='square'||r.unit==='LF'||r.unit==='gal')r.qty=Math.ceil(r.qty*10)/10;if(r.unit==='gal')r.qty=Math.ceil(r.qty);if(r.unit==='roll'||r.unit==='square')r.qty=Math.ceil(r.qty);if(r.unit==='LF')r.qty=Math.ceil(r.qty);}
  const order=['Demolition','Masonry','Wall framing','Headers and beams','Floor framing','Roof and ceiling framing','Sheathing and wrap','Roofing','Siding','Doors and windows','Insulation','Drywall','Ceilings','Wall finishes','Flooring','Trim and molding','Paint','Fixtures and cabinets','Appliances','Electrical','Ramps and site','Fasteners'];
  rows.sort((a,b)=>order.indexOf(a.cat)-order.indexOf(b.cat)||a.item.localeCompare(b.item));
  for(const r of rows)if(cabPrices[r.key]!=null)r.price=cabPrices[r.key];
  return rows;
}
function takeoffCSV(rows,prices){
  const q=v=>/[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':String(v);
  const lines=[['Category','Item','Quantity','Unit','Unit price','Total','Notes'].join(',')];let sum=0;
  for(const r of rows){const pr=prices[r.key.replace(/\|(new|demo)$/,'')];const t=pr!=null?pr*r.qty:'';if(t!=='')sum+=t;
    lines.push([r.cat,r.item,r.qty,r.unit,pr??'',t===''?'':t.toFixed(2),r.note].map(q).join(','));}
  lines.push(['','','','','Total',sum.toFixed(2),''].map(q).join(','));
  return lines.join('\r\n');
}
// price list import: CSV with item name and price columns; matched by item text
function parsePriceCSV(text){
  const out=[];for(const line of text.split(/\r?\n/)){if(!line.trim())continue;const cells=[];let cur='',inq=false;
    for(let i=0;i<line.length;i++){const ch=line[i];if(inq){if(ch==='"'&&line[i+1]==='"'){cur+='"';i++;}else if(ch==='"')inq=false;else cur+=ch;}else if(ch==='"')inq=true;else if(ch===','){cells.push(cur);cur='';}else cur+=ch;}cells.push(cur);
    const priceIdx=cells.findIndex(c=>/^\s*\$?\d+(\.\d+)?\s*$/.test(c));if(priceIdx<0)continue;const name=cells.filter((c,i)=>i!==priceIdx&&isNaN(parseFloat(c))).join(' ').trim();if(!name)continue;
    out.push({name,price:parseFloat(cells[priceIdx].replace('$',''))});}
  return out;
}
function matchPrices(rows,list){
  const norm=s=>s.toLowerCase().replace(/[^a-z0-9/]+/g,' ').trim();const res={};
  for(const r of rows){const rk=norm(r.item);let best=null,bs=0;for(const e of list){const ek=norm(e.name);if(ek===rk){best=e;bs=1e9;break;}
      const words=ek.split(' ').filter(Boolean);const hit=words.filter(w=>rk.includes(w)).length/Math.max(1,words.length);if(hit>bs&&hit>=0.75){bs=hit;best=e;}}
    if(best)res[r.key.replace(/\|(new|demo)$/,'')]=best.price;}
  return res;
}

function MaterialsView({p,commit}){
  const [tab,setTab]=useState(()=>{try{return localStorage.getItem('remodel-studio:mattab')||'list';}catch(e){return 'list';}});
  const pick=t=>{setTab(t);try{localStorage.setItem('remodel-studio:mattab',t);}catch(e){}};
  const tabs=html`<div className="seg mattabs" role="tablist">${[['list',"Builder's list"],['estimate','Estimate and labor'],['shop','Shopping list'],['selections','Selections'],['cabinets','Cabinet order'],['schedule','Job schedule']].map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${tab===k} className=${tab===k?'on':''} onClick=${()=>pick(k)}>${l}</button>`)}</div>`;
  if(tab==='selections')return html`<div className="matview"><div className="matinner">${tabs}<${SelectionsView} p=${p} commit=${commit}/></div></div>`;
  if(tab==='cabinets')return html`<div className="matview"><div className="matinner">${tabs}<${CabinetOrderView} p=${p} commit=${commit}/></div></div>`;
  if(tab==='shop')return html`<div className="matview"><div className="matinner">${tabs}<${ShoppingView} p=${p} commit=${commit}/></div></div>`;
  if(tab==='schedule')return html`<div className="matview"><div className="matinner">${tabs}<${ScheduleView} p=${p} commit=${commit}/></div></div>`;
  if(tab==='estimate')return html`<div className="matview"><div className="matinner">${tabs}<${EstimateView} p=${p} commit=${commit}/></div></div>`;
  return html`<${MaterialsList} p=${p} commit=${commit} tabs=${tabs}/>`;
}
function MaterialsList({p,commit,tabs}){
  const rows=useMemo(()=>takeoff(p,{waste:(p.settings?.waste??10)/100}),[p]);
  const prices=p.prices||{}; const [msg,setMsg]=useState(null); const [paste,setPaste]=useState(''); const [showImport,setShowImport]=useState(false);
  const setPrice=(k,v)=>{const np={...prices};if(v==null||v==='')delete np[k];else np[k]=v;commit({...p,prices:np});};
  const cats=[...new Set(rows.map(r=>r.cat))]; let total=0,priced=0;for(const r of rows){const pr=prices[r.key.replace(/\|(new|demo)$/,'')];if(pr!=null){total+=pr*r.qty;priced++;}}
  const csv=async()=>setMsg(await saveFile(safeName(p.name)+' materials.csv',takeoffCSV(rows,prices)));
  const doImport=()=>{const list=parsePriceCSV(paste);if(!list.length){setMsg({ok:false,t:'No prices found. Paste rows like: 2x4 stud 92-5/8" precut, 3.98'});return;}
    const m=matchPrices(rows,list);const n=Object.keys(m).length;commit({...p,prices:{...prices,...m}});setMsg({ok:true,t:`Matched ${n} of ${rows.length} items from ${list.length} prices.`});setShowImport(false);};
  return html`<div className="matview"><div className="matinner">${tabs}
    <div className="mathead"><div><h2>Builder's list</h2><p className="note">New work only, counted from the model with ${p.settings?.waste??10}% waste. Existing walls are left out; walls marked for demolition are listed under Demolition. Quantities are estimates; confirm before ordering.</p></div>
      <div className="row"><label className="note" htmlFor="waste">Waste %</label><input id="waste" className="inp mono" style=${{width:'64px'}} value=${p.settings?.waste??10} onChange=${e=>{const v=parseFloat(e.target.value);if(!isNaN(v)&&v>=0&&v<=50)commit({...p,settings:{...p.settings,waste:v}});}}/>
        <button className="btn" onClick=${()=>setShowImport(!showImport)}>Import price list…</button><button className="btn primary" onClick=${csv}>Download CSV</button></div></div>
    ${showImport?html`<div className="sec importbox"><h3>Import prices</h3><p className="note">Paste rows from a spreadsheet or a store cart with an item name and a price, one per line. Items are matched by name; you can edit any price afterwards.</p>
      <textarea id="price-paste" className="inp mono" rows="5" value=${paste} onChange=${e=>setPaste(e.target.value)} placeholder=${'2x4 stud 92-5/8" precut, 3.98\n7/16" OSB wall sheathing 4x8, 15.48'}></textarea>
      <div className="row"><button className="btn primary" onClick=${doImport}>Match prices</button><button className="btn" onClick=${()=>setShowImport(false)}>Cancel</button></div></div>`:null}
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
    <div className="mattotal"><span>${rows.length} items</span><span>${priced} priced</span><span className="mono">Total $${total.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>
    ${cats.map(c=>html`<section key=${c} className="matcat"><h3>${c}</h3><div className="tablewrap"><table className="mat"><colgroup><col style=${{width:"36%"}}/><col style=${{width:"8%"}}/><col style=${{width:"8%"}}/><col style=${{width:"12%"}}/><col style=${{width:"11%"}}/><col style=${{width:"25%"}}/></colgroup><thead><tr><th>Item</th><th className="num">Qty</th><th>Unit</th><th className="num">Unit price</th><th className="num">Total</th><th>Notes</th></tr></thead><tbody>
      ${rows.filter(r=>r.cat===c).map(r=>{const k=r.key.replace(/\|(new|demo)$/,'');const pr=prices[k];return html`<tr key=${r.key}><td>${r.item}</td><td className="num mono">${r.qty}</td><td>${r.unit}</td>
        <td className="num"><input className="inp mono priceinp" id=${'pr-'+k.replace(/[^\w]+/g,'_')} aria-label=${'Price for '+r.item} value=${pr??''} placeholder="$" inputMode="decimal" onChange=${e=>{const v=e.target.value.replace('$','');setPrice(k,v===''?null:isNaN(parseFloat(v))?pr:parseFloat(v));}}/></td>
        <td className="num mono">${pr!=null?'$'+(pr*r.qty).toFixed(2):''}</td><td className="note">${r.note}</td></tr>`;})}</tbody></table></div></section>`)}
  </div></div>`;
}

// Trim, ceilings, wall finishes and paint by room.
const colorName=h=>{if(!h)return 'default white';const x=LIB.find(x=>x.place==='color'&&x.hex.toLowerCase()===String(h).toLowerCase());return x?x.label.toLowerCase():'custom '+h;};
function finishTakeoff(p,add,W){
  const trimLF={};let trimPaintLF=0;
  for(const r of p.rooms){const lv=lvlOf(p,r.level);if(!lv)continue;const t=trimOf(p,r);const per=polyPerim(r.pts);const a=polyArea(r.pts)/144;const H=lv.height;
    const ops=roomOpenings(p,r);const doors=ops.filter(o=>o.type==='door'),wins=ops.filter(o=>o.type==='window');
    const doorW=doors.reduce((s,o)=>s+o.width,0);const runLF=Math.max(0,per-doorW)/12;
    const lf=(id,v)=>{const it=LIB_BY_ID[id];if(!it||it.profile==='none'||!(v>0))return;trimLF[it.label]=(trimLF[it.label]||0)+v;trimPaintLF+=v;};
    if(r.use!=='garage'){lf(t.base,runLF);lf(t.shoe,runLF);lf(t.crown,per/12);lf(t.chair,runLF);
      for(const o of doors)if(!['pocket','overhead'].includes(o.dtype))lf(t.casing,(2*o.height+o.width+6)/12);else if(o.dtype==='pocket')lf(t.casing,(2*o.height+o.width+6)/12);
      const st=LIB_BY_ID[t.stool];for(const o of wins){if(st&&st.profile==='stool'){lf(t.casing,(2*o.height+o.width+6)/12);lf(t.stool,2*(o.width+6)/12);}else lf(t.casing,(2*o.height+2*o.width+12)/12);}
      const wn=LIB_BY_ID[t.wainscot];if(wn&&wn.h>0)add('Wall finishes',wn.label,Math.ceil(runLF*wn.h/12*W),'SF');}
    // ceilings
    const ce=r.ceiling||'flat';
    if(ce==='act22'||ce==='act24'){add('Ceilings',ce==='act22'?'Acoustic ceiling tile 2x2':'Acoustic ceiling tile 2x4',Math.ceil(a/(ce==='act22'?4:8)*W),'EA');add('Ceilings','Suspended grid main tee 12\'',Math.ceil(a/48),'EA','4\' o.c.');add('Ceilings','Cross tee',Math.ceil(a/(ce==='act22'?4:8)),'EA');add('Ceilings','Wall angle 12\'',Math.ceil(per/144),'EA');}
    else if(['tng','plank','shiplap','beadboard'].includes(ce))add('Ceilings',CEILINGS[ce][0]+' ceiling boards',Math.ceil(a*W),'SF');
    else if(ce==='tin')add('Ceilings','Tin ceiling tile 2x2',Math.ceil(a/4*W),'EA');
    else if(ce==='beams')add('Ceilings','Decorative beam (box beam) 12\'',Math.ceil(per/2/144*Math.max(1,Math.round(Math.sqrt(a)/4))),'EA','one about every 4 ft');
    else if(ce==='coffered')add('Ceilings','Coffer beam material (1x and molding)',Math.ceil(a/16*8),'LF','4\' grid');
    else if(ce==='tray')add('Ceilings','Tray framing and drywall returns',Math.ceil(per/12),'LF');
    else if(ce==='popcorn')add('Ceilings','Popcorn ceiling: asbestos test before scraping',1,'test','homes before 1980');
    if(['knockdown','orangepeel'].includes(ce))add('Ceilings','Ceiling texture, 40 lb',Math.ceil(a/300),'bag');
    // wall finishes and paint
    const opA=ops.reduce((s,o)=>s+o.width*o.height,0)/144;const wallA=Math.max(0,per*H/144-opA);const wf=r.wallFinish||'paint';
    if(!r.tile&&['subway','largetile','mosaic','cement'].includes(wf)){const ta=r.use==='bath'||r.use==='kitchen'?Math.min(wallA,runLF*(r.use==='kitchen'?1.5:4)):wallA;add('Wall finishes',WALL_FIN[wf][0],Math.ceil(ta*W),'SF',r.use==='kitchen'?'backsplash height':r.use==='bath'?'wet-area height':'');}
    else if(wf==='frp')add('Wall finishes','FRP panel 4x8',Math.ceil(wallA*W/32),'EA');
    else if(wf==='wallpaper')add('Wall finishes','Wallpaper (56 sq ft roll)',Math.ceil(wallA*W/56),'roll');
    else if(['shiplap','beadboard','paneling','stone','brick'].includes(wf))add('Wall finishes',WALL_FIN[wf][0],Math.ceil(wallA*W),'SF');
    if(['paint','smooth','orangepeel','knockdown','cmu','plaster'].includes(wf)||!WALL_FIN[wf])add('Paint',`Wall paint, ${colorName(r.wallColor)}`,wallA*2/350,'gal','2 coats');
    if(!['act22','act24','tng','plank','tin','open'].includes(ce))add('Paint',`Ceiling paint, ${colorName(r.ceilingColor)}`,a*2/400,'gal','2 coats, flat');}
  for(const [label,v] of Object.entries(trimLF))add('Trim and molding',label,Math.ceil(v*W),'LF',`about ${Math.ceil(v*W/16)} pieces of 16'`);
  if(trimPaintLF)add('Paint',`Trim paint, semi-gloss, ${colorName(p.settings?.trimColor)}`,Math.max(1,trimPaintLF/400),'gal');
  if(Object.keys(trimLF).length)add('Trim and molding','Finish nails 2" (16 ga)',1,'box');
  const extA=p.walls.filter(w=>w.kind==='exterior'&&w.status!=='demolish'&&(w.mat||'wood')==='wood'&&!['brick','stone'].includes(w.siding)&&!['vinyl','dutchlap'].includes(w.siding||'vinyl')).reduce((s,w)=>s+(wlen(w)*wallH(p,w)-p.openings.filter(o=>o.wall===w.id).reduce((t,o)=>t+o.width*o.height,0))/144,0);
  if(extA>0){const cols=[...new Set(p.walls.filter(w=>w.kind==='exterior').map(w=>colorName(w.color)))];add('Paint',`Exterior paint, ${cols.join(' / ')}`,extA*2/300,'gal','2 coats on siding');}
}
