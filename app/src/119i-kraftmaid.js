/* ======================= KraftMaid (Lowe's 2022 spec book) as a vendor catalog in the Designer ======================= */
// Every SKU in the spec book becomes a catalog item. Cabinets place as cabinets (with the real SKU on the order);
// panels, moldings, hardware, trays and accessories add to the selected cabinet or to the order as loose items.
const KM_CAT="KraftMaid (Lowe's 2022)";
const KM_SECT_ORDER=['Wall Cabinets','Base Cabinets','Tall Cabinets','Vanity Cabinets','Office & Furniture','Passport','Panels, Shelving & Trays','Molding, Accents & Hardware'];
const KM_MODS=Object.fromEntries((typeof KM_DATA!=='undefined'?KM_DATA.mods:[]).map(m=>[m[0],{code:m[0],name:m[1],kind:m[2],desc:m[3],up:m[4],page:m[5]}]));
function kmBase(type,sku,title){const t=(sku+' '+title).toUpperCase();
  if(type==='wall'||type==='vanity_wall')return 'wallcab';if(type==='hood')return 'wallcab';
  if(type==='base'){if(/^(SB|SBK|SFSB|DSB|CSB|ASB|FSB|ISB|PSB)/.test(sku)||/SINK/.test(t))return 'sinkbase';return 'base';}
  if(type==='tall'||type==='vanity_tall')return 'tall';if(type==='vanity')return 'vanity';if(type==='office')return /BOOK|BKC|BKS/.test(t)||false?'tall':'base';if(type==='filler')return 'filler';return null;}
const kmStdD={wall:12,vanity_wall:8,hood:12,base:24,tall:24,vanity:21,vanity_tall:21,office:24,filler:0.75};
{if(typeof KM_DATA!=='undefined'){const seen=new Set();
  const sectIdx=s=>{const i=KM_SECT_ORDER.indexOf(s);return i<0?99:i;};
  const prods=[...KM_DATA.prods].sort((a,b)=>sectIdx(a[0])-sectIdx(b[0]));
  for(const [section,sub,title,type,page,feat,opts,skus] of prods){
    const subName=section==='Passport'&&!/^Passport/.test(sub)?'Passport · '+sub:sub;
    for(const [sku,w0,h0,d0,hinge,op,note,assumed] of skus){if(seen.has(sku))continue;seen.add(sku);
      const base=kmBase(type,sku,title);const d=d0||kmStdD[type]||0;const w=w0,h=h0;
      const dims=[w&&`${fi(w)}" W`,h&&`${fi(h)}" H`,d0&&`${fi(d0)}" D`].filter(Boolean).join(' x ');
      const it={id:'km-'+sku.replace(/[^A-Za-z0-9.]/g,'_'),cat:KM_CAT,sub:subName,label:`${title}${dims?' · '+dims:''}`,code:sku,sku,vendor:'kraftmaid',kmType:type,op:op||null,hingeReq:!!hinge,note:[note||'',assumed?'Some sizes are standard sizes, not printed on the page.':'',`Spec book page ${page}.`].filter(Boolean).join(' '),opts,kmFeat:feat};
      if(base&&w>0&&h>0&&d>0){Object.assign(it,{place:'fixture',base,w,d,h});
        if(base==='wallcab')it.elev=type==='hood'?Math.max(54,84-h+12):type==='vanity_wall'?48:(h>=30?54:Math.max(54,90-h));}
      else Object.assign(it,{place:'kmspec'});
      registerLibItem(it);}}
  // door styles and finishes from the book join the KraftMaid brand in Selections and the cabinet panel
  const v=VENDOR_CABS.find(x=>x.id==='kraftmaid');if(v){const LN="KraftMaid (Lowe's)";if(!v.lines.some(l=>l.name===LN))v.lines.push({name:LN,frame:'framed',overlay:['partial','full'],notes:"Door styles and finishes from the KraftMaid (Lowe's) 2022 Specification Book."});
    const kind=f=>{const t=f.join(' ').toLowerCase();return /slab/.test(t)?'slab':/raised/.test(t)?'raised':/mitered/.test(t)?'mitered':/beadboard/.test(t)?'beadboard':'shaker';};
    for(const [name,ov,codes,page,feat] of KM_DATA.doors){const nm=name+' (Lowe\'s)';if(!v.doors.some(x=>x.name===nm))v.doors.push({name:nm,lines:[LN],kind:kind(feat),material:[...new Set(codes.map(c=>c[1]).filter(Boolean))].join(', '),notes:`${ov} overlay; codes ${codes.map(c=>c[0]).join(', ')}. Spec book p. ${page}.`});}
    for(const [name,code,type] of KM_DATA.fins){if(!v.finishes.some(x=>x.name===name))v.finishes.push({name,type:type==='stain'?'stain':type||'paint',code});}}
}}
// SKU on the order: the book's pattern with the hinge letter where the book puts it
{const _sku=cabSku;cabSku=function(f){const c=f.cab||{};if(c.sku)return c.sku;const it=f.lib&&LIB_BY_ID[f.lib];if(!it||it.vendor!=='kraftmaid')return _sku(f);
  if(it.op){let hand=c.hand||'';if(!hand){try{const P=window.__app&&window.__app.get();hand=P?_kmHinge(P,f):'';}catch(e){}}return it.op.replace('{R|L}',hand||'R').replace('{RR|RL}','R'+(hand||'R')).replace('{LR|LL}','L'+(hand||'R'));}return it.sku;};}
const _kmHinge=cabHingeTag;
{cabHingeTag=function(p,f){const it=f.lib&&LIB_BY_ID[f.lib];if(it&&it.vendor==='kraftmaid')return '';return _kmHinge(p,f);};}
// KraftMaid construction options on a cabinet (from the product's option chart)
{const _cm=cabMods;cabMods=function(p,f){const out=_cm(p,f);const km=(f.cab||{}).km||[];for(const code of km){const m=KM_MODS[code];out.push({k:'km-'+code,label:m?m.name:code,code,qty:1,price:0,ok:()=>true,up:m&&m.up});}return out;};}
// loose items and accessories on the order
{const _co=cabOrder;cabOrder=function(p){const R=_co(p);const rows=[];const add=(sku,qty,where)=>{const it=Object.values(LIB_BY_ID).find(x=>x.vendor==='kraftmaid'&&x.sku===sku);rows.push({qty,unit:'ea',code:sku,item:(it?it.label:sku)+(where?' · '+where:''),list:0,price:0});};
  const nums=cabNumbers(p);for(const f of p.fixtures||[])for(const s of ((f.cab||{}).kmAcc||[]))add(s,1,'for cabinet #'+(nums[f.id]||'?'));for(const [s,q] of Object.entries(p.settings?.kmLoose||{}))if(q>0)add(s,q,'');
  if(rows.length)R.acc=[...R.acc,...rows];return R;};}
// what a spec-book accessory can do in the catalog
{const _la=libActions;libActions=function(it,ctx){if(it.place!=='kmspec')return _la(it,ctx);const {p,sel,commit,say}=ctx;const o=findObj(p,sel);const fx=o&&sel.kind==='fixture'&&isCab(o)?o:null;const A=[];
  if(fx)A.push({label:'Add to selected cabinet',primary:true,run:()=>{commit(updObj(p,'fixture',fx.id,{cab:{...(fx.cab||{}),kmAcc:[...((fx.cab||{}).kmAcc||[]),it.sku]}}));say&&say(`${it.sku} added to cabinet ${cabSku(fx)}. It is on the cabinet order.`);}});
  A.push({label:'Add to order',primary:!fx,run:()=>{const L={...(p.settings?.kmLoose||{})};L[it.sku]=(L[it.sku]||0)+1;commit({...p,settings:{...p.settings,kmLoose:L}});say&&say(`${it.sku} added to the cabinet order (${L[it.sku]}).`);}});return A;};}
{const _ld=libDims;libDims=function(it){if(it.place==='kmspec')return it.kmType?`${it.kmType} · KraftMaid accessory`:'';return _ld(it);};}
// cabinet panel: KraftMaid options and accessories for the selected KraftMaid cabinet
function KmCabPanel({p,f,up}){const it=f.lib&&LIB_BY_ID[f.lib];if(!it||it.vendor!=='kraftmaid')return null;const c=f.cab||{};const km=c.km||[];const acc=c.kmAcc||[];
  const set=patch=>up({cab:{...c,...patch}});const avail=(it.opts||[]).filter(k=>KM_MODS[k]);
  return html`<div className="sec km-sec"><h3>KraftMaid ${it.sku}</h3><p className="note">${it.label}. ${it.note}</p>
    ${it.op?html`<${Field} label="Hinge" id="km-hand"><${Sel} id="km-hand" value=${c.hand||''} onChange=${v=>set({hand:v||null})} options=${[['','Automatic'],['R','Right (R)'],['L','Left (L)']]}/><//>`:null}
    <p className="note"><b>Order code:</b> <span className="mono">${cabSku(f)}${km.length?' '+km.join(' '):''}</span></p>
    ${avail.length?html`<div className="km-opts"><b>Options on the book's chart for this cabinet</b>${avail.map(k=>html`<label key=${k} className="chk"><input type="checkbox" checked=${km.includes(k)} onChange=${e=>set({km:e.target.checked?[...km,k]:km.filter(x=>x!==k)})}/> <span className="mono">${k}</span> ${KM_MODS[k].name}${KM_MODS[k].up?html` <small>(${KM_MODS[k].up})</small>`:null}</label>`)}</div>`:null}
    ${acc.length?html`<div className="km-acc"><b>Accessories</b>${acc.map((s,i)=>html`<div key=${i} className="km-accrow"><span className="mono">${s}</span><button className="btn small" onClick=${()=>set({kmAcc:acc.filter((x,j)=>j!==i)})}>Remove</button></div>`)}</div>`:null}
    ${it.kmFeat?html`<details><summary>Features from the book</summary><p className="note">${it.kmFeat}</p></details>`:null}</div>`;}
{const _CP=CabinetPanel;CabinetPanel=function(props){const f=props.o||props.f;return html`<${_CP} ...${props}/>${f&&props.p?html`<${KmCabPanel} p=${props.p} f=${f} up=${props.up}/>`:null}`;};}
