/* ======================= import your own vendor catalogs (CSV, Excel, JSON or PDF) ======================= */
// Imported catalogs are kept on this computer and added to the built-in library in every project.
const VC_KEY='remodel-studio:vendors';
const XLSX_URL='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
function loadCustomVendors(){try{const v=JSON.parse(localStorage.getItem(VC_KEY)||'{}');return {cabs:v.cabs||[],products:v.products||{}};}catch(e){return {cabs:[],products:{}};}}
function saveCustomVendors(v){try{localStorage.setItem(VC_KEY,JSON.stringify(v));return true;}catch(e){return false;}}
const _builtinCabs=VENDOR_CABS.slice();const _builtinProd=JSON.parse(JSON.stringify(VENDOR_PRODUCTS||{}));
function applyCustomVendors(){const v=loadCustomVendors();VENDOR_CABS=_builtinCabs.filter(b=>!v.cabs.some(c=>c.id===b.id)).concat(v.cabs);
  const prod=JSON.parse(JSON.stringify(_builtinProd));for(const [cat,list] of Object.entries(v.products)){prod[cat]=(prod[cat]||[]).filter(b=>!list.some(c=>c.brand===b.brand)).concat(list);}VENDOR_PRODUCTS=prod;}
applyCustomVendors();
const VC_TYPES=[['cabinets','Cabinet catalog (lines, door styles, finishes, SKUs)'],['pricebook','Cabinet price list (SKUs and prices only)'],...SEL_CATS.map(c=>[c[0],c[1]+' catalog']),['paint','Paint colors (name, code, hex)']];
// the columns each kind of catalog can use, with the header words that find them
const VC_FIELDS={
  cabinets:[['line','Line or series',['line','series','collection','product line']],['door','Door style',['door','style','door style','door name']],['kind','Door type',['door type','construction','panel','kind']],['material','Material or species',['material','species','wood']],
    ['finish','Finish or color',['finish','color','colour','stain','paint']],['finishType','Finish type',['finish type','paint/stain','type of finish']],['sku','SKU',['sku','item #','item','code','model','part']],['desc','Description',['desc','description','name']],
    ['type','Cabinet type',['cabinet type','category','class','type']],['w','Width',['width','w']],['h','Height',['height','h']],['d','Depth',['depth','d']],['price','Price',['price','list','cost','msrp','amount','retail']]],
  pricebook:[['sku','SKU',['sku','item #','item','code','model','part']],['desc','Description',['desc','description','name']],['type','Cabinet type',['type','category','class']],['w','Width',['width','w']],['h','Height',['height','h']],['d','Depth',['depth','d']],['price','Price',['price','list','cost','msrp','amount']]],
  paint:[['name','Color name',['name','color name','color','colour']],['code','Color code',['code','number','#','id']],['hex','Hex color',['hex','html','rgb hex','web']],['lrv','LRV',['lrv','reflectance']]],
  product:[['line','Product line or style',['line','series','collection','style','product','model','name']],['color','Color',['color','colour','finish']],['notes','Notes',['notes','description','desc','material','type','size']],['sku','SKU',['sku','item','model #','part']],['price','Price',['price','cost','msrp']]]};
const vcFields=t=>VC_FIELDS[t]||VC_FIELDS.product;
function vcGuess(headers,t){const hd=headers.map(h=>String(h||'').toLowerCase().trim());const used=new Set();const map={};
  for(const [k,,keys] of vcFields(t)){let i=hd.findIndex((h,j)=>!used.has(j)&&keys.some(x=>h===x));if(i<0)i=hd.findIndex((h,j)=>!used.has(j)&&keys.some(x=>x.length>2&&h.includes(x)));if(i>=0){map[k]=i;used.add(i);}else map[k]=-1;}return map;}
async function vcReadFile(file){const name=file.name.toLowerCase();
  if(/\.json$/.test(name))return {json:JSON.parse(await file.text())};
  if(/\.xlsx?$|\.xlsm$|\.ods$/.test(name)){await loadScript(XLSX_URL);const wb=XLSX.read(new Uint8Array(await file.arrayBuffer()),{type:'array'});const sheets=wb.SheetNames.map(n=>({name:n,rows:XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:false,defval:''}).filter(r=>r.some(c=>String(c).trim()))}));return {sheets};}
  if(/\.pdf$/.test(name)){const doc=await openPdf(file);const lines=[];for(let i=1;i<=Math.min(doc.numPages,400);i++){const pg=await doc.getPage(i);const tc=await pg.getTextContent();
      // rebuild text lines from positioned runs; wide gaps become column breaks
      const rowsByY=new Map();for(const it of tc.items){if(!it.str.trim())continue;const y=Math.round(it.transform[5]/2.5);if(!rowsByY.has(y))rowsByY.set(y,[]);rowsByY.get(y).push({x:it.transform[4],w:it.width,s:it.str});}
      for(const y of [...rowsByY.keys()].sort((a,b)=>b-a)){const runs=rowsByY.get(y).sort((a,b)=>a.x-b.x);const cells=[];let cur='',end=-1e9;for(const r of runs){if(cur&&r.x-end>14){cells.push(cur.trim());cur='';}cur+=(cur&&r.x-end>1.5?' ':'')+r.s;end=r.x+r.w;}if(cur)cells.push(cur.trim());lines.push(cells);}}
    return {sheets:[{name:'PDF text',rows:lines}],pdf:true};}
  const text=await file.text();return {sheets:[{name:'Sheet',rows:parseCSVRows(text)}]};}
const VC_KINDS=[[/shaker/i,'shaker'],[/slab|flat|plain|euro|modern/i,'flat'],[/inset/i,'inset'],[/bead/i,'beadboard'],[/mitered|miter/i,'mitered'],[/cathedral|arch/i,'cathedral'],[/louver/i,'louver'],[/raised/i,'raised'],[/recess/i,'shaker']];
const vcKind=(...s)=>{const t=s.filter(Boolean).join(' ');for(const [re,k] of VC_KINDS)if(re.test(t))return k;return 'other';};
const vcNum=v=>{const x=parseFloat(String(v??'').replace(/[$,\s"]/g,''));return isFinite(x)?x:null;};
const vcId=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'brand';
// turn mapped rows into a catalog entry
function vcBuild(t,brand,rows,map,extra={}){const get=(r,k)=>map[k]>=0?String(r[map[k]]??'').trim():'';const uniq=a=>[...new Set(a.filter(Boolean))];
  if(t==='cabinets'||t==='pricebook'){const lines=uniq(rows.map(r=>get(r,'line')));const doors=new Map();const fins=new Map();
    for(const r of rows){const dn=get(r,'door');if(dn){const d=doors.get(dn)||{name:dn,lines:[],kind:null,material:''};const ln=get(r,'line');if(ln&&!d.lines.includes(ln))d.lines.push(ln);d.kind=d.kind||vcKind(get(r,'kind'),dn);d.material=d.material||get(r,'material');doors.set(dn,d);}
      const fn=get(r,'finish');if(fn&&!fins.has(fn)){const ft=get(r,'finishType').toLowerCase();fins.set(fn,{name:fn,type:/paint|opaque|solid/.test(ft)?'paint':/stain|glaze|natural|clear/.test(ft)?'stain':(/white|gray|grey|graphite|charcoal|slate|blue|navy|green|sage|black|onyx|cream|linen|ivory|alabaster|paint/i.test(fn)?'paint':'stain')});}}
    // SKUs with prices become a price book that prices the cabinets in the plan
    const items=[];for(const r of rows){const sku=get(r,'sku');const price=vcNum(get(r,'price'));if(!sku||price==null)continue;const inf=skuInfer(sku)||{};const typ=get(r,'type').toLowerCase();
      const type=/sink/.test(typ)?'sinkbase':/wall|upper/.test(typ)?'wallcab':/tall|pantry|util|oven/.test(typ)?'tall':/vanit/.test(typ)?'vanity':/fill/.test(typ)?'filler':/base|drawer/.test(typ)?'base':inf.type;if(!type)continue;
      const w=vcNum(get(r,'w'))??inf.w,h=vcNum(get(r,'h'))??inf.h??({base:34.5,sinkbase:34.5,wallcab:30,tall:84,vanity:34.5,filler:34.5}[type]),d=vcNum(get(r,'d'))??inf.d??({base:24,sinkbase:24,wallcab:12,tall:24,vanity:21,filler:24}[type]);
      if(!w||items.some(x=>x.sku===sku))continue;items.push({sku,desc:get(r,'desc'),type,w,h,d,price,layout:inf.layout||(/drawer/.test(typ)?'drawers3':null)});}
    const cab=t==='cabinets'?{id:'custom-'+vcId(brand),name:brand,tier:'imported',custom:true,lines:lines.map(n=>({name:n})),doors:[...doors.values()].map(d=>({...d,kind:d.kind||'other'})),finishes:[...fins.values()],imported:new Date().toISOString(),file:extra.file||null}:null;
    return {cab,book:items.length?{id:uid('pb'),name:brand+(t==='cabinets'?' price list':''),items,imported:new Date().toISOString()}:null,counts:{lines:lines.length,doors:doors.size,finishes:fins.size,skus:items.length}};}
  if(t==='paint'){const colors=[];for(const r of rows){const name=get(r,'name');if(!name)continue;let hex=get(r,'hex');if(hex&&!hex.startsWith('#'))hex='#'+hex;if(hex&&!/^#[0-9a-f]{6}$/i.test(hex))hex='';colors.push({name,code:get(r,'code'),hex:hex||undefined,lrv:vcNum(get(r,'lrv'))??undefined});}
    return {prod:{brand,colors,custom:true,file:extra.file||null},counts:{colors:colors.length}};}
  const ser=new Map();for(const r of rows){const n=get(r,'line');if(!n)continue;const s=ser.get(n)||{name:n,colors:[],notes:''};const c=get(r,'color');if(c&&!s.colors.includes(c))s.colors.push(c);if(!s.notes)s.notes=get(r,'notes');ser.set(n,s);}
  const series=[...ser.values()].map(s=>({name:s.name,...(s.colors.length?{colors:s.colors}:{}),...(s.notes?{notes:s.notes}:{})}));
  const brandColors=uniq(rows.map(r=>get(r,'color')));
  return {prod:{brand,series,...(series.length?{}:{colors:brandColors}),custom:true,file:extra.file||null},counts:{lines:series.length,colors:brandColors.length}};}
// a JSON file in Remodel Studio's own format: {brands:[...]} for cabinets, or {windows:[...], paint:[...]} for products
function vcFromJSON(j){const out={cabs:[],products:{}};const brands=Array.isArray(j)?j:j.brands;
  if(Array.isArray(brands))for(const b of brands){if(b&&b.name&&(b.doors||b.lines))out.cabs.push({...b,id:b.id||'custom-'+vcId(b.name),custom:true});}
  for(const k of [...SEL_CATS.map(c=>c[0]),'paint'])if(Array.isArray(j[k]))out.products[k]=j[k].filter(b=>b&&b.brand).map(b=>({...b,custom:true}));
  return out;}
const VC_TEMPLATES={cabinets:'Line,Door style,Door type,Material,Finish,Finish type,SKU,Description,Cabinet type,Width,Height,Depth,Price\nClassic,Hampton,Shaker,Maple,Linen White,Paint,B15,Base 1 door,Base,15,34.5,24,289\nClassic,Hampton,Shaker,Maple,Espresso,Stain,W3030,Wall 2 door,Wall,30,30,12,325\n',
  pricebook:'SKU,Description,Type,Width,Height,Depth,Price\nB15,Base 1 door,Base,15,34.5,24,289\nSB36,Sink base,Sink,36,34.5,24,412\nW3030,Wall 2 door,Wall,30,30,12,325\n',
  paint:'Color name,Code,Hex,LRV\nAgreeable Gray,SW 7029,#d1cbc1,60\n',product:'Product line,Color,Notes,SKU,Price\n400 Series Double-Hung,White,Fibrex and wood,TW2846,612\n'};
function VendorImportModal({onClose,onDone}){const [t,setT]=useState('cabinets');const [brand,setBrand]=useState('');const [src,setSrc]=useState(null);const [sheet,setSheet]=useState(0);const [hdrRow,setHdrRow]=useState(0);const [map,setMap]=useState({});
  const [msg,setMsg]=useState(null);const [busy,setBusy]=useState(false);const [list,setList]=useState(loadCustomVendors);
  const rows=src&&src.sheets?(src.sheets[sheet]||src.sheets[0]).rows:[];const headers=rows[hdrRow]||[];const body=rows.slice(hdrRow+1);
  const remap=(tt,h)=>setMap(vcGuess(h,tt));
  useEffect(()=>{if(src&&src.sheets){const r=(src.sheets[sheet]||src.sheets[0]).rows;let best=0,bs=-1;for(let i=0;i<Math.min(15,r.length);i++){const g=vcGuess(r[i],t);const sc=Object.values(g).filter(x=>x>=0).length;if(sc>bs){bs=sc;best=i;}}setHdrRow(best);remap(t,r[best]||[]);}},[src,sheet]);
  const pick=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;setBusy(true);setMsg(null);
    try{const r=await vcReadFile(file);const fileId=uid('vf');try{await assetPut({id:fileId,project:'__catalogs',kind:'catalogfile',name:file.name,date:new Date().toISOString(),blob:file,type:file.type||''});}catch(err){}
      r.fileRef={id:fileId,name:file.name};setSrc(r);setSheet(0);if(!brand)setBrand(file.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').replace(/\b(price ?(list|book)|catalog|catalogue|20\d\d)\b/ig,'').trim());
      if(r.json){const j=vcFromJSON(r.json);setMsg({ok:true,t:`Found ${j.cabs.length} cabinet brand${j.cabs.length===1?'':'s'} and ${Object.values(j.products).reduce((s,l)=>s+l.length,0)} product brands in the file. Press Add to library.`});}
      else if(r.pdf)setMsg({ok:true,t:'Read the text of the PDF. Tables come through best; check the columns below. The PDF itself is kept so you can open it from the cabinet panel.'});}
    catch(err){setMsg({ok:false,t:err.message||'That file could not be read.'});}setBusy(false);};
  const built=useMemo(()=>{if(!src||src.json||!body.length||!brand.trim())return null;try{return vcBuild(t,brand.trim(),body,map,{file:src.fileRef});}catch(e){return null;}},[src,t,brand,map,hdrRow,sheet]);
  const save=()=>{const v=loadCustomVendors();let note='';
    if(src.json){const j=vcFromJSON(src.json);for(const c of j.cabs)v.cabs=v.cabs.filter(x=>x.id!==c.id).concat(c);for(const [k,l] of Object.entries(j.products)){v.products[k]=(v.products[k]||[]).filter(x=>!l.some(y=>y.brand===x.brand)).concat(l);}note=`${j.cabs.length} cabinet and ${Object.values(j.products).reduce((s,l)=>s+l.length,0)} product brands`;}
    else{if(!built){setMsg({ok:false,t:'Nothing to add yet: name the brand and match at least one column.'});return;}
      if(built.cab){if(!built.cab.lines.length&&!built.cab.doors.length&&!built.cab.finishes.length&&!built.book){setMsg({ok:false,t:'No lines, doors, finishes or priced SKUs were found with these columns.'});return;}v.cabs=v.cabs.filter(x=>x.id!==built.cab.id).concat(built.cab);}
      if(built.prod){const k=t==='paint'?'paint':t;v.products[k]=(v.products[k]||[]).filter(x=>x.brand!==built.prod.brand).concat(built.prod);}
      if(built.book){const books=loadPriceBooks().filter(b=>b.name!==built.book.name).concat(built.book);if(!savePriceBooks(books)){setMsg({ok:false,t:'The price list is too big to keep on this computer.'});return;}syncPriceBooksToLib();if(built.cab)built.cab.book=built.book.name;}
      note=Object.entries(built.counts).filter(([,n])=>n).map(([k,n])=>`${n} ${({lines:'lines',doors:'door styles',finishes:'finishes',skus:'priced SKUs',colors:'colors'})[k]}`).join(', ')||'the catalog';}
    if(!saveCustomVendors(v)){setMsg({ok:false,t:'The catalog is too big to keep on this computer. Split it into smaller files.'});return;}
    applyCustomVendors();setList(v);setMsg({ok:true,t:`Added ${brand||'the catalog'}: ${note}. It is in the brand lists now${built&&built.book?', and its SKUs are in the Library and price the cabinets':''}.`});onDone&&onDone();};
  const remove=(kind,key,cat)=>{const v=loadCustomVendors();if(kind==='cab'){const c=v.cabs.find(x=>x.id===key);v.cabs=v.cabs.filter(x=>x.id!==key);if(c&&c.book){savePriceBooks(loadPriceBooks().filter(b=>b.name!==c.book));syncPriceBooksToLib();}}else v.products[cat]=(v.products[cat]||[]).filter(x=>x.brand!==key);saveCustomVendors(v);applyCustomVendors();setList(v);onDone&&onDone();};
  const template=async()=>{const k=VC_TEMPLATES[t]?t:'product';const r=await saveFile(`Remodel Studio ${k==='product'?'product':k} catalog template.csv`,VC_TEMPLATES[k]);setMsg(r);};
  const F=vcFields(t);const colOpts=[['-1','(not in this file)'],...headers.map((h,i)=>[String(i),String(h||'Column '+(i+1)).slice(0,40)])];
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal wide" role="dialog" aria-label="Import vendor catalog">
    <h2>Import a vendor catalog</h2>
    <p className="note">Bring in a manufacturer's catalog or price list as Excel, CSV, PDF or JSON. Door styles, finishes, lines and colors join the brand lists; SKUs with prices go into a price book that prices the cabinets you draw. Catalogs stay on this computer and show up in every project.</p>
    <div className="grid2"><${Field} label="What is it?" id="vc-t"><${Sel} id="vc-t" value=${t} onChange=${v=>{setT(v);remap(v,headers);}} options=${VC_TYPES}/><//>
      <${Field} label="Brand name" id="vc-brand"><input id="vc-brand" className="inp" value=${brand} placeholder="e.g. Wolf Classic, Fabuwood, Sherwin-Williams" onChange=${e=>setBrand(e.target.value)}/><//></div>
    <div className="row"><label className="btn primary" htmlFor="vc-file">${busy?'Reading…':src?'Choose a different file…':'Choose catalog file…'}</label><input id="vc-file" type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,.xlsm,.ods,.pdf,.json" hidden onChange=${pick}/>
      <button className="btn" onClick=${template}>Download a template</button>${src?html`<span className="note">${src.fileRef?.name||''}</span>`:null}</div>
    ${src&&src.sheets?html`
      <div className="grid2">${src.sheets.length>1?html`<${Field} label="Sheet" id="vc-sh"><${Sel} id="vc-sh" value=${String(sheet)} onChange=${v=>setSheet(+v)} options=${src.sheets.map((s,i)=>[String(i),s.name+' ('+s.rows.length+' rows)'])}/><//>`:null}
        <${Field} label="Header row" id="vc-hr"><${Sel} id="vc-hr" value=${String(hdrRow)} onChange=${v=>{setHdrRow(+v);remap(t,rows[+v]||[]);}} options=${rows.slice(0,25).map((r,i)=>[String(i),`Row ${i+1}: ${r.slice(0,4).join(' | ').slice(0,60)}`])}/><//></div>
      <h3>Match the columns</h3><div className="vc-map">${F.map(([k,label])=>html`<${Field} key=${k} label=${label} id=${'vc-m-'+k}><${Sel} id=${'vc-m-'+k} value=${String(map[k]??-1)} onChange=${v=>setMap(m=>({...m,[k]:+v}))} options=${colOpts}/><//>`)}</div>
      ${built?html`<div className="msg">${Object.entries(built.counts).map(([k,n])=>`${n} ${({lines:'lines',doors:'door styles',finishes:'finishes',skus:'priced SKUs',colors:'colors'})[k]}`).join(' · ')} found in ${body.length} rows.</div>`:null}
      <div className="tablewrap vc-prev"><table className="mat"><thead><tr>${headers.map((h,i)=>html`<th key=${i}>${h}</th>`)}</tr></thead><tbody>${body.slice(0,8).map((r,i)=>html`<tr key=${i}>${headers.map((h,j)=>html`<td key=${j}>${r[j]}</td>`)}</tr>`)}</tbody></table></div>`:null}
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
    <div className="row"><button className="btn primary" disabled=${!src||busy} onClick=${save}>Add to library</button><span className="spacer"></span><button className="btn" onClick=${onClose}>Done</button></div>
    ${list.cabs.length||Object.values(list.products).some(l=>l.length)?html`<h3>Your imported catalogs</h3>
      ${list.cabs.map(c=>html`<div key=${c.id} className="stat"><span>${c.name} <span className="note">cabinets · ${c.doors?.length||0} doors, ${c.finishes?.length||0} finishes${c.book?' · priced':''}</span></span><span>${c.file?html`<button className="btn" onClick=${()=>openCatalogFile(c.file.id)}>Open file</button> `:null}<button className="btn danger" aria-label=${'Remove '+c.name} onClick=${()=>remove('cab',c.id)}>✕</button></span></div>`)}
      ${Object.entries(list.products).flatMap(([cat,l])=>l.map(b=>html`<div key=${cat+b.brand} className="stat"><span>${b.brand} <span className="note">${(VC_TYPES.find(x=>x[0]===cat)||['',cat])[1].replace(/ catalog$| \(.*\)$/,'')}</span></span><span>${b.file?html`<button className="btn" onClick=${()=>openCatalogFile(b.file.id)}>Open file</button> `:null}<button className="btn danger" aria-label=${'Remove '+b.brand} onClick=${()=>remove('prod',b.brand,cat)}>✕</button></span></div>`))}`:null}
  </div></div>`;}
async function openCatalogFile(id){try{const l=await assetList('__catalogs');const a=l.find(x=>x.id===id);if(!a||!a.blob){window.__say&&window.__say('That catalog file is no longer on this computer.');return;}
  const url=URL.createObjectURL(a.blob);const w=window.open(url,'_blank');if(!w){const x=document.createElement('a');x.href=url;x.download=a.name;x.click();}setTimeout(()=>URL.revokeObjectURL(url),60000);}catch(e){}}
