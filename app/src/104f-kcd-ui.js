/* ======================= 20/20-style panels: modifications and attributes on the cabinet inspector, cabinet order report, countertop shop drawing ======================= */
function KcdPanel({p,o,up,commit}){if(!isCab(o)||o.type==='filler')return null;const st=cabStyle(p,o);const m=(o.cab||{}).mods||{};const S=p.settings?.cab||{};
  const upc=patch=>up({cab:{...(o.cab||{}),...patch}});const upm=(k,v)=>upc({mods:{...m,[k]:v}});
  const setJob=patch=>commit({...p,settings:{...p.settings,cab:{...S,...patch}}});const setZone=(z,patch)=>setJob({zones:{...(S.zones||{}),[z]:{...((S.zones||{})[z]||{}),...patch}}});
  const list=CAB_MODS.filter(x=>x[4](o)&&!(x[0]==='ss'&&st.softClose!==false));const auto=cabMods(p,o).filter(x=>x.k==='rd'&&!m.rd);
  const ZF=[['','Same as the kitchen'],...CAB_FIN.map(x=>[x[0],x[1]])],ZS=[['','Same as the kitchen'],...CAB_STYLES];
  return html`<div className="sec kcd"><h3>Modifications</h3>
      <div className="stat"><span>Order SKU</span><span className="mono">${cabSkuFull(p,o)}</span></div>
      ${auto.length?html`<p className="note">Reduced depth (RD) is added because this cabinet is ${fmtLen(o.d)} deep.</p>`:null}
      <div className="modlist">${list.map(([k,label,code,price,ok,counted])=>html`<label key=${k} className="check mod"><input type="checkbox" checked=${!!m[k]} onChange=${e=>upm(k,e.target.checked?1:0)}/> ${label} <small className="mono">${code} · $${Math.round(price*cabLineF(p,o))}</small>
        ${counted&&m[k]?html`<input className="inp mono qty" type="number" min="1" max="6" value=${m[k]} aria-label=${label+' quantity'} onChange=${e=>upm(k,Math.max(1,Math.min(6,+e.target.value||1)))}/>`:null}</label>`)}</div>
      <${Field} label="Attribute group" id="kc-z"><${Sel} id="kc-z" value=${(o.cab||{}).zone||cabZone(o)||'perimeter'} onChange=${v=>upc({zone:v})} options=${[['perimeter','Perimeter'],...CAB_ZONES]}/><//></div>
    <div className="sec kcd"><h3>Job attributes (all cabinets)</h3>
      <${Field} label="Wood or door material" id="kc-sp"><${Sel} id="kc-sp" value=${st.species} onChange=${v=>setJob({species:v})} options=${CAB_SPECIES.map(x=>[x[0],x[1]])}/><//>
      <${Field} label="Door overlay" id="kc-ov"><${Sel} id="kc-ov" value=${st.overlay} onChange=${v=>setJob({overlay:v})} options=${CAB_OVERLAY.map(x=>[x[0],x[1]])}/><//>
      <${Field} label="Drawer box" id="kc-db"><${Sel} id="kc-db" value=${st.drawerBox} onChange=${v=>setJob({drawerBox:v})} options=${CAB_DRAWER.map(x=>[x[0],x[1]])}/><//>
      <label className="check"><input type="checkbox" checked=${st.softClose!==false} onChange=${e=>setJob({softClose:e.target.checked})}/> Soft-close doors and drawers standard</label>
      <h4>Two-tone and attribute groups</h4>
      ${CAB_ZONES.map(([z,l])=>{const zs=(S.zones||{})[z]||{};return html`<div key=${z} className="row2"><${Field} label=${l+' finish'} id=${'kz-f-'+z}><${Sel} id=${'kz-f-'+z} value=${zs.finish||''} onChange=${v=>setZone(z,{finish:v||null,color:null})} options=${ZF}/><//><${Field} label="Door style" id=${'kz-s-'+z}><${Sel} id=${'kz-s-'+z} value=${zs.style||''} onChange=${v=>setZone(z,{style:v||null})} options=${ZS}/><//></div>`;})}</div>
    <div className="sec kcd"><h3>Moldings and decorative pieces (all)</h3>
      <${Field} label="Crown profile" id="kc-cr"><${Sel} id="kc-cr" value=${st.crownProfile} onChange=${v=>setJob({crownProfile:v,crown:true})} options=${CAB_CROWN.map(x=>[x[0],x[1]])}/><//>
      <div className="row2"><label className="check"><input type="checkbox" checked=${st.toeSkin} onChange=${e=>setJob({toeSkin:e.target.checked})}/> Toe kick skins</label><label className="check"><input type="checkbox" checked=${st.scribe} onChange=${e=>setJob({scribe:e.target.checked})}/> Scribe at walls</label></div>
      <div className="row2"><label className="check"><input type="checkbox" checked=${st.valance} onChange=${e=>setJob({valance:e.target.checked})}/> Valance over sink window</label><label className="check"><input type="checkbox" checked=${st.dwPanel} onChange=${e=>setJob({dwPanel:e.target.checked})}/> Panel-ready dishwasher</label></div>
      <label className="check"><input type="checkbox" checked=${st.fridgePanels} onChange=${e=>setJob({fridgePanels:e.target.checked})}/> Refrigerator end panels</label>
      <${Field} label="Island legs or posts" id="kc-lg"><${Sel} id="kc-lg" value=${st.islandLegs} onChange=${v=>setJob({islandLegs:v})} options=${CAB_LEGS}/><//>
      <${Field} label="Island back panel" id="kc-bk"><${Sel} id="kc-bk" value=${st.islandBack} onChange=${v=>setJob({islandBack:v})} options=${CAB_BACK}/><//>
      <p className="note">Moldings, panels, legs, corbels and hardware are counted in the Builder's list and the Cabinet order report.</p></div>`;}
{const _CP=CabinetPanel;CabinetPanel=function(props){return html`<${_CP} ...${props}/><${KcdPanel} ...${props}/>`;};}

/* ---- cabinet order report: by manufacturer, list price, multiplier, margin ---- */
const orderOf=p=>({mult:0.45,margin:35,freight:3,install:85,tax:7,...(p.settings?.order||{})});
function cabOrder(p){const O=orderOf(p);const nums=cabNumbers(p);const cabs=(p.fixtures||[]).filter(f=>isCab(f)&&f.status!=='demolish').sort((a,b)=>(nums[a.id]||999)-(nums[b.id]||999));
  const groups={};let boxes=0;
  for(const f of cabs){const st=cabStyle(p,f);const v=(typeof vendorLabel==='function'&&vendorLabel(st))||'Cabinets (no manufacturer chosen)';const g=groups[v]=groups[v]||{vendor:v,lines:[]};
    const lf=cabLineF(p,f);const mods=(f.cab||{}).price!=null?[]:cabMods(p,f).map(m=>({...m,each:Math.round(m.price*lf)}));const total=cabPrice(p,f);const modsT=mods.reduce((s,m)=>s+m.each*m.qty,0);
    const L=(CAB_LAYOUTS[f.type]||CAB_LAYOUTS.base).find(x=>x[0]===cabLayout(f));if(f.type!=='filler')boxes++;
    g.lines.push({n:nums[f.id]||'',qty:1,sku:cabSku(f)+cabHingeTag(p,f),desc:`${(L||['',fxLabel(f)])[1]}, ${fmtLen(f.w)} x ${fmtLen(cabBoxH(f))} x ${fmtLen(f.d)}`,attr:`${(CAB_STYLES.find(x=>x[0]===st.style)||['',''])[1]} · ${(st.color?'custom color':(CAB_FIN.find(x=>x[0]===st.finish)||['',''])[1])}`,hinge:cabHingeTag(p,f),list:total-modsT,mods,book:(f.cab||{}).book||null});}
  const acc=cabTrimRows(p).filter(r=>r.price>0).map(r=>({...r,list:r.price}));
  let list=0;for(const g of Object.values(groups))for(const l of g.lines)list+=l.list+l.mods.reduce((s,m)=>s+m.each*m.qty,0);const accList=acc.reduce((s,r)=>s+r.list*r.qty,0);list+=accList;
  const net=list*O.mult;const sell=O.margin<100?net/(1-O.margin/100):net;const freight=net*O.freight/100;const install=boxes*O.install;const tax=sell*O.tax/100;
  return {O,groups:Object.values(groups),acc,boxes,list,net,sell,freight,install,tax,total:sell+freight+install+tax};}
const $0=v=>'$'+Math.round(v).toLocaleString('en-US');
function cabOrderCSV(p){const R=cabOrder(p);const q=s=>'"'+String(s).replace(/"/g,'""')+'"';const out=[['Manufacturer','#','Qty','SKU','Description','Attributes','Hinge','List each','List ext'].map(q).join(',')];
  for(const g of R.groups)for(const l of g.lines){out.push([g.vendor,l.n,l.qty,l.sku,l.desc,l.attr,l.hinge,l.list,l.list*l.qty].map(q).join(','));for(const m of l.mods)out.push([g.vendor,'',m.qty,'  '+m.code,'  '+m.label,'','',m.each,m.each*m.qty].map(q).join(','));}
  for(const r of R.acc)out.push(['Moldings and accessories','',r.qty,r.code,r.item,r.unit,'',r.list,Math.round(r.list*r.qty*100)/100].map(q).join(','));
  out.push('');for(const [k,v] of [['List total',R.list],[`Net (x ${R.O.mult})`,R.net],[`Sell at ${R.O.margin}% margin`,R.sell],[`Freight ${R.O.freight}%`,R.freight],[`Installation ${R.boxes} boxes`,R.install],[`Tax ${R.O.tax}%`,R.tax],['Total',R.total]])out.push([q(k),'','','','','','','',Math.round(v)].join(','));return out.join('\n');}
function cabOrderPDF(d,p){const R=cabOrder(p);let y=0.75;const L=0.5,Rx=8.0;const T=(t,x,b,sz=8.5,al)=>{d.setFont('helvetica',b?'bold':'normal');d.setFontSize(sz);d.text(String(t),x,y,al?{align:al}:undefined);};
  const nl=(h=0.17)=>{y+=h;if(y>10.4){d.addPage();y=0.6;}};
  T('Cabinet order report',L,true,16);nl(0.26);T((p.name||'Project')+' · '+new Date().toLocaleDateString(),L,false,10);nl(0.3);
  for(const g of R.groups){T(g.vendor.toUpperCase(),L,true,10);nl(0.2);T('#',L,true);T('QTY',L+0.35,true);T('SKU',L+0.75,true);T('DESCRIPTION',L+2.3,true);T('LIST',Rx,true,8.5,'right');nl(0.06);d.setDrawColor(150);d.line(L,y,Rx,y);nl(0.16);
    for(const l of g.lines){T(l.n,L);T(l.qty,L+0.35);T(l.sku,L+0.75,true);T((l.desc+' · '+l.attr).slice(0,72),L+2.3);T($0(l.list),Rx,false,8.5,'right');nl();for(const m of l.mods){T(m.code,L+0.95);T(m.label+(m.qty>1?' x'+m.qty:''),L+2.45);T($0(m.each*m.qty),Rx,false,8.5,'right');nl();}}nl(0.1);}
  if(R.acc.length){T('MOLDINGS, PANELS AND HARDWARE',L,true,10);nl(0.22);for(const r of R.acc){T(r.qty+' '+r.unit,L+0.2);T(r.code,L+0.75,true);T(r.item.slice(0,70),L+2.3);T($0(r.list*r.qty),Rx,false,8.5,'right');nl();}nl(0.1);}
  d.line(L+4.5,y,Rx,y);nl(0.18);for(const [k,v,b] of [['List total',R.list],[`Net at ${R.O.mult} multiplier`,R.net],[`Sell price at ${R.O.margin}% margin`,R.sell,true],[`Freight (${R.O.freight}% of net)`,R.freight],[`Installation (${R.boxes} boxes x $${R.O.install})`,R.install],[`Sales tax (${R.O.tax}%)`,R.tax],['Total',R.total,true]]){T(k,L+4.6,b,9);T($0(v),Rx,b,9,'right');nl();}
  nl(0.15);T('Planning prices. List prices come from your price books where loaded; confirm with the manufacturer or dealer before ordering.',L,false,7.5);}
function CabinetOrderView({p,commit}){const R=useMemo(()=>cabOrder(p),[p]);const O=R.O;const [msg,setMsg]=useState(null);const setO=patch=>commit({...p,settings:{...p.settings,order:{...O,...patch}}});
  const csv=async()=>setMsg(await saveFile(safeName(p.name)+' cabinet order.csv',cabOrderCSV(p)));
  const pdf=async()=>{try{await loadJsPDF();const {jsPDF}=window.jspdf;const d=new jsPDF({unit:'in',format:'letter'});cabOrderPDF(d,p);setMsg(await saveFile(safeName(p.name)+' cabinet order.pdf',d.output('blob')));}catch(e){setMsg({ok:false,t:e.message||'The PDF could not be made.'});}};
  if(!R.groups.length)return html`<div className="mathead"><div><h2>Cabinet order</h2><p className="note">Place cabinets from the Library (Cabinets) or with the cabinet run tool, and the order report fills in here.</p></div></div>`;
  return html`<div className="cab-order"><div className="mathead"><div><h2>Cabinet order</h2><p className="note">Grouped by manufacturer, with modifications under each cabinet, the way a 20/20 order report reads. List prices come from your price books where loaded, otherwise planning prices.</p></div>
      <div className="row"><button className="btn" onClick=${csv}>CSV</button><button className="btn primary" onClick=${pdf}>PDF</button></div></div>
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
    <div className="grid4 order-set"><${Field} label="Dealer multiplier" id="co-m"><${NumInput} id="co-m" value=${O.mult} onChange=${v=>v>0&&v<=1.5&&setO({mult:v})}/><//><${Field} label="Margin %" id="co-g"><${NumInput} id="co-g" value=${O.margin} onChange=${v=>v>=0&&v<95&&setO({margin:v})}/><//>
      <${Field} label="Freight % of net" id="co-f"><${NumInput} id="co-f" value=${O.freight} onChange=${v=>v>=0&&setO({freight:v})}/><//><${Field} label="Install $ per box" id="co-i"><${NumInput} id="co-i" value=${O.install} onChange=${v=>v>=0&&setO({install:v})}/><//><${Field} label="Sales tax %" id="co-t"><${NumInput} id="co-t" value=${O.tax} onChange=${v=>v>=0&&setO({tax:v})}/><//></div>
    ${R.groups.map(g=>html`<div key=${g.vendor} className="order-g"><h3>${g.vendor}</h3><table className="mat"><thead><tr><th>#</th><th>Qty</th><th>SKU</th><th>Description</th><th>Hinge</th><th className="num">List</th></tr></thead><tbody>
      ${g.lines.map(l=>html`<${Fragment} key=${l.n+l.sku}><tr><td>${l.n}</td><td>${l.qty}</td><td className="mono"><b>${l.sku}</b></td><td>${l.desc}<br/><small>${l.attr}${l.book?' · price book '+l.book:''}</small></td><td>${l.hinge||''}</td><td className="num mono">${$0(l.list)}</td></tr>
        ${l.mods.map(m=>html`<tr key=${m.code} className="modrow"><td></td><td>${m.qty}</td><td className="mono">${m.code}</td><td>${m.label}</td><td></td><td className="num mono">${$0(m.each*m.qty)}</td></tr>`)}<//>`)}</tbody></table></div>`)}
    ${R.acc.length?html`<div className="order-g"><h3>Moldings, panels and hardware</h3><table className="mat"><thead><tr><th>Qty</th><th>Code</th><th>Item</th><th className="num">List</th></tr></thead><tbody>${R.acc.map(r=>html`<tr key=${r.item}><td>${r.qty} ${r.unit}</td><td className="mono">${r.code}</td><td>${r.item}${r.note?html`<br/><small>${r.note}</small>`:null}</td><td className="num mono">${$0(r.list*r.qty)}</td></tr>`)}</tbody></table></div>`:null}
    <div className="order-tot">${[['List total',R.list],[`Net (x ${O.mult})`,R.net],[`Sell at ${O.margin}% margin`,R.sell,1],[`Freight ${O.freight}%`,R.freight],[`Installation, ${R.boxes} boxes`,R.install],[`Tax ${O.tax}%`,R.tax],['Total',R.total,1]].map(([k,v,b])=>html`<div key=${k} className=${'stat'+(b?' strong':'')}><span>${k}</span><span className="mono">${$0(v)}</span></div>`)}</div></div>`;}

/* ---- countertop shop drawing ---- */
const SLAB={quartz:[120,55],granite:[110,62],marble:[108,60],laminate:[144,25],butcher:[96,25.5],solid:[144,30],concrete:[96,40]};
function ctrPieces(p,lvId){const cs=counterSet(p);const sl=SLAB[cs.mat]||SLAB.quartz;const out=[];
  for(const c of counterGeo(p,lvId)){const P=c.pts;let best=null;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];const L=dist(a,b);if(!best||L>best.L)best={L,d:{x:(b.x-a.x)/L,y:(b.y-a.y)/L}};}
    const u=best.d,v={x:-u.y,y:u.x};const U=q=>q.x*u.x+q.y*u.y,V=q=>q.x*v.x+q.y*v.y;const us=P.map(U),vs=P.map(V);const u0=Math.min(...us),u1=Math.max(...us),v0=Math.min(...vs),v1=Math.max(...vs);
    const poly=P.map(q=>[q.x,q.y]);const pt=(uu,vv)=>({x:u.x*uu+v.x*vv,y:u.y*uu+v.y*vv});const seams=[];
    const span=(uu)=>{let a=null,segs=[];for(let t=0;t<=200;t++){const vv=v0+(v1-v0)*t/200;const q=pt(uu,vv);const inn=inPoly(q.x,q.y,poly);if(inn&&a==null)a=vv;if(!inn&&a!=null){segs.push([a,vv]);a=null;}}if(a!=null)segs.push([a,v1]);return segs;};
    // inside corners: seam from the reflex corner across the shorter leg
    for(let i=0;i<P.length;i++){const a=P[(i+P.length-1)%P.length],b=P[i],c2=P[(i+1)%P.length];const cr=(b.x-a.x)*(c2.y-b.y)-(b.y-a.y)*(c2.x-b.x);const area=polyArea(poly)*(1);const ccw=P.reduce((s,q,j)=>{const r=P[(j+1)%P.length];return s+(q.x*r.y-r.x*q.y);},0)>0;
      if((ccw&&cr<0)||(!ccw&&cr>0)){let bestS=null;for(const dd of [{x:b.x-a.x,y:b.y-a.y},{x:b.x-c2.x,y:b.y-c2.y}]){const L=Math.hypot(dd.x,dd.y);const n={x:dd.x/L,y:dd.y/L};let t=1;while(t<200&&inPoly(b.x+n.x*t,b.y+n.y*t,poly))t+=0.5;if(t>1.5&&(!bestS||t<bestS.t))bestS={t,n};}
        if(bestS&&P.length>4)seams.push([b,{x:b.x+bestS.n.x*bestS.t,y:b.y+bestS.n.y*bestS.t}]);}}
    if(u1-u0>sl[0]&&seams.length===0){const n=Math.ceil((u1-u0)/sl[0]);for(let i=1;i<n;i++){let uu=u0+(u1-u0)*i/n;for(const h of c.holes){const hu=h.map(U);const a=Math.min(...hu)-4,b=Math.max(...hu)+4;if(uu>a&&uu<b)uu=(uu-a<b-uu)?a:b;}for(const [a,b] of span(uu))seams.push([pt(uu,a),pt(uu,b)]);}}
    out.push({c,u,v,u0,u1,v0,v1,seams,L:u1-u0,D:v1-v0,sf:c.area/144,U,V,pt});}
  return out;}
function ctrShopSheet(P,p,pp,k){const lv=sortedLevels(pp).find(l=>counterGeo(pp,l.id).length);if(!lv)return null;const pcs=ctrPieces(pp,lv.id);const cs=counterSet(pp);const sl=SLAB[cs.mat]||SLAB.quartz;
  let B={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};for(const pc of pcs)for(const q of pc.c.pts)B={x0:Math.min(B.x0,q.x),y0:Math.min(B.y0,q.y),x1:Math.max(B.x1,q.x),y1:Math.max(B.y1,q.y)};B={x0:B.x0-30,y0:B.y0-30,x1:B.x1+30,y1:B.y1+30};const tableW=3.6*k;
  const total=pcs.reduce((s,x)=>s+x.sf,0);const slabs=Math.ceil(total*1.3/(sl[0]*sl[1]/144));
  return {make:(no)=>planSheet(P,p,no,'Countertop shop drawing',B,0.4*k,(dl,G)=>{const {PT,sc}=G;
    pcs.forEach((pc,i)=>{const c=pc.c;dl.poly(c.pts.map(q=>PT(q.x,q.y)),{stroke:INK,w:0.9,fill:'#f4f4f4',holes:c.holes.map(h=>h.map(q=>PT(q.x,q.y)))});
      for(const h of c.holes){dl.poly(h.map(q=>PT(q.x,q.y)),{stroke:INK,w:0.5,fill:'#ffffff'});const hc={x:h.reduce((s,q)=>s+q.x,0)/h.length,y:h.reduce((s,q)=>s+q.y,0)/h.length};const q=PT(hc.x,hc.y);dl.text(q[0],q[1]+0.02*k,'SINK',{size:4.5*k,anchor:'middle',bold:true});
        const end=pc.U(hc)-pc.u0;dl.text(q[0],q[1]+0.14*k,`℄ ${fmtLen(end)} FROM END`,{size:3.8*k,anchor:'middle',color:MID});}
      const ccw=c.pts.reduce((s,q,j)=>{const r=c.pts[(j+1)%c.pts.length];return s+(q.x*r.y-r.x*q.y);},0)>0;
      for(let j=0;j<c.pts.length;j++){const a=c.pts[j],b=c.pts[(j+1)%c.pts.length];const L=dist(a,b);if(L<4)continue;const d={x:(b.x-a.x)/L,y:(b.y-a.y)/L};const n=ccw?{x:d.y,y:-d.x}:{x:-d.y,y:d.x};const off=0.13*k/sc;const m=PT((a.x+b.x)/2+n.x*off,(a.y+b.y)/2+n.y*off);
        const wallSide=c.splash.some(([s1,s2])=>dist(s1,a)<0.5&&dist(s2,b)<0.5||dist(s1,b)<0.5&&dist(s2,a)<0.5);let ang=Math.atan2(d.y,d.x)*180/Math.PI;if(ang>90)ang-=180;if(ang<-90)ang+=180;dl.text(m[0],m[1]+0.02*k,fmtLen(L)+(wallSide?' W':''),{size:4.2*k,anchor:'middle',rot:ang});}
      for(const [a,b] of pc.seams){dl.line(...PT(a.x,a.y),...PT(b.x,b.y),1.1,{dash:[0.06*k,0.03*k]});const m=PT((a.x+b.x)/2,(a.y+b.y)/2);dl.text(m[0]+0.05*k,m[1]-0.05*k,'SEAM',{size:3.8*k,bold:true});}
      let ctr=polyLabelPt(c.pts.map(q=>[q.x,q.y]));{let bi=0,bL=0;for(let j=0;j<c.pts.length;j++){const L=dist(c.pts[j],c.pts[(j+1)%c.pts.length]);if(L>bL){bL=L;bi=j;}}const a=c.pts[bi],b=c.pts[(bi+1)%c.pts.length];const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const d={x:(b.x-a.x)/bL,y:(b.y-a.y)/bL};for(const n of [{x:-d.y,y:d.x},{x:d.y,y:-d.x}]){const t={x:m.x+n.x*Math.min(12,pc.D/2),y:m.y+n.y*Math.min(12,pc.D/2)};if(inPoly(t.x,t.y,c.pts.map(q=>[q.x,q.y]))&&!c.holes.some(h=>inPoly(t.x,t.y,h.map(q=>[q.x,q.y])))){ctr=[t.x,t.y];break;}}}const q=PT(ctr[0],ctr[1]+0);dl.circle(q[0],q[1]-0.12*k,0.06*k,{stroke:INK,w:0.45,fill:'#ffffff'});dl.text(q[0],q[1]-0.12*k+0.022*k,'C'+(i+1),{size:4.4*k,anchor:'middle',bold:true});});
    const tx=G.A.x1-tableW;let ty=G.A.y0+0.15*k;dl.text(tx,ty,'COUNTERTOP PIECES',{size:7*k,bold:true});ty+=0.12*k;
    ty+=drawTable(dl,tx,ty,[{h:'PC',w:0.35*k},{h:'SIZE (L x D)',w:1.35*k},{h:'SF',w:0.5*k},{h:'CUTOUTS',w:0.65*k},{h:'SEAMS',w:0.6*k}],pcs.map((x,i)=>['C'+(i+1),`${fmtLen(x.L)} x ${fmtLen(x.D)}`,x.sf.toFixed(1),String(x.c.holes.length),String(x.seams.length)]),k,G.A.y1-1.6*k)+0.25*k;
    const notes=[`MATERIAL: ${(COUNTER_MATS.find(x=>x[0]===cs.mat)||['',''])[1].toUpperCase()} ${cs.thick>=1.2?'3 CM':'2 CM'}`,`EDGE: ${(EDGES.find(x=>x[0]===cs.edge)||['',''])[1].toUpperCase()} ON EXPOSED EDGES · OVERHANG ${fmtLen(cs.overhang)}`,`BACKSPLASH: ${cs.splash==='full'?'TILE TO WALL CABINETS':cs.splash==='none'?'NONE':cs.splash+'" ON WALL SIDES (W)'}`,`TOTAL ${total.toFixed(1)} SF · ABOUT ${slabs} SLAB${slabs>1?'S':''} AT ${fmtLen(sl[0])} x ${fmtLen(sl[1])}`,'SEAMS SHOWN ARE SUGGESTED; FABRICATOR TO CONFIRM.','VERIFY ALL DIMENSIONS AT TEMPLATE. W = WALL SIDE.'];
    for(const t of notes)for(const ln of wrapText(t,tableW,5*k)){dl.text(tx,ty,ln,{size:5*k,bold:/TOTAL/.test(t)});ty+=0.13*k;}},tableW+0.25*k)};}
{const _bs=buildSheets;buildSheets=function(p){const out=_bs(p);try{const P=PAPERS[p.sheet?.paper]||PAPERS.tabloid;const pp=filteredProject(p,'proposed');const cs=ctrShopSheet(P,p,pp,P.k);
  if(cs){const a5=out.filter(s=>/^A5\./.test(s.no));const n=a5.length?Math.max(...a5.map(s=>+s.no.split('.')[1]))+1:0;const s=cs.make('A5.'+n);const i=a5.length?out.indexOf(a5[a5.length-1])+1:out.length;out.splice(i,0,s);}}catch(e){console.warn('countertop sheet',e);}return out;};}

/* ---- interior elevations: a dimension string across the wall cabinets (20/20 style) ---- */
{const _ie=drawInteriorElev;drawInteriorElev=function(dl,p,IE,sc,ox,oy,k){_ie(dl,p,IE,sc,ox,oy,k);try{const H=IE.lv.height;const U=s=>ox+s*sc,Z=z=>oy+(H-z)*sc;const along=pt=>(pt.x-IE.start.x)*IE.dir.x+(pt.y-IE.start.y)*IE.dir.y;
  const ups=IE.fixtures.filter(f=>f.type==='wallcab'||(f.type==='tall'&&cabTop(f)>=80));if(!ups.length)return;const top=Math.max(...ups.map(cabTop));if((H-top)*sc<0.16*k)return;
  const xs=[0,IE.len];for(const f of ups){const s=along({x:f.x,y:f.y});xs.push(s-f.w/2,s+f.w/2);}const cs=[...new Set(xs.map(v=>Math.round(Math.max(0,Math.min(IE.len,v))*4)/4))].sort((a,b)=>a-b);
  if(cs.length>=3)dimChain(dl,cs,true,Z(top)-Math.min(0.24*k,(H-top)*sc*0.55),Z(top),-1,s=>U(s),k);}catch(e){}};}
