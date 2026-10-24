/* ======================= landscaping: a plant palette for the Gulf South, plant symbols, growth, schedules and checks ======================= */
// Sizes are typical mature height and spread in feet for USDA zones 7-9; check the grower's tag for the cultivar you buy.
// [key, common name, botanical name, kind, height ft, spread ft, zone min, zone max, sun, water, growth, native SE, evergreen, form, foliage hex, flower hex or 0, bloom season, default size]
const SPECIES_RAW=[
  ['liveoak','Live oak','Quercus virginiana','shade',50,70,8,10,'full','low','med',1,1,'spreading',0x3f6b33,0,'','2cal'],
  ['willowoak','Willow oak','Quercus phellos','shade',60,40,5,9,'full','med','fast',1,0,'oval',0x4f7d36,0,'','2cal'],
  ['shumard','Shumard oak','Quercus shumardii','shade',60,45,5,9,'full','low','med',1,0,'oval',0x4a7a31,0,'red fall color','2cal'],
  ['redmaple','Red maple','Acer rubrum','shade',50,35,3,9,'full','med','fast',1,0,'oval',0x56803a,0,'red fall color','2cal'],
  ['magnolia','Southern magnolia','Magnolia grandiflora','shade',60,30,6,10,'full','med','med',1,1,'pyramidal',0x2f5a2c,0xf7f3e6,'May to June','15'],
  ['riverbirch','River birch','Betula nigra','shade',40,30,4,9,'full','high','fast',1,0,'oval',0x6a8f3d,0,'','15'],
  ['baldcypress','Bald cypress','Taxodium distichum','shade',60,25,4,10,'full','high','med',1,0,'pyramidal',0x6f8f3a,0,'rust fall color','2cal'],
  ['lacebark','Lacebark elm','Ulmus parvifolia','shade',45,40,5,9,'full','low','fast',0,0,'vase',0x5a8436,0,'','2cal'],
  ['ginkgo','Ginkgo','Ginkgo biloba','shade',45,30,3,8,'full','med','slow',0,0,'oval',0x6f9a3c,0,'gold fall color','2cal'],
  ['natchez','Crape myrtle Natchez','Lagerstroemia x fauriei','ornamental',25,20,7,9,'full','low','fast',0,0,'vase',0x5d8a3c,0xf6f4f0,'summer','15'],
  ['muskogee','Crape myrtle Muskogee','Lagerstroemia x fauriei','ornamental',22,18,7,9,'full','low','fast',0,0,'vase',0x5d8a3c,0xb68fd1,'summer','15'],
  ['dynamite','Crape myrtle Dynamite','Lagerstroemia indica','ornamental',15,12,7,9,'full','low','fast',0,0,'vase',0x5a7f37,0xc8253a,'summer','15'],
  ['dogwood','Flowering dogwood','Cornus florida','ornamental',25,25,5,9,'part','med','slow',1,0,'spreading',0x4f7a36,0xf8f6ee,'spring','15'],
  ['redbud','Eastern redbud','Cercis canadensis','ornamental',25,25,4,9,'part','low','med',1,0,'spreading',0x587f3b,0xd25c9e,'spring','15'],
  ['japmaple','Japanese maple','Acer palmatum','ornamental',15,15,5,8,'part','med','slow',0,0,'spreading',0x8a2c2c,0,'red foliage','15'],
  ['littlegem','Little Gem magnolia','Magnolia grandiflora Little Gem','ornamental',25,12,7,10,'full','med','slow',0,1,'columnar',0x2f5a2c,0xf7f3e6,'spring to summer','15'],
  ['vitex','Chaste tree','Vitex agnus-castus','ornamental',15,15,6,9,'full','low','fast',0,0,'vase',0x6f8f5a,0x8a7fd1,'summer','15'],
  ['yaupontree','Yaupon holly, tree form','Ilex vomitoria','ornamental',20,12,7,10,'full','low','med',1,1,'oval',0x456b34,0,'red berries in winter','15'],
  ['loblolly','Loblolly pine','Pinus taeda','evergreen',80,30,6,9,'full','low','fast',1,1,'pyramidal',0x35582e,0,'','15'],
  ['redcedar','Eastern red cedar','Juniperus virginiana','evergreen',40,15,2,9,'full','low','med',1,1,'pyramidal',0x2f4f2c,0,'','15'],
  ['leyland','Leyland cypress','x Cuprocyparis leylandii','evergreen',50,15,6,10,'full','med','fast',0,1,'columnar',0x355a33,0,'','15'],
  ['nellie','Nellie R. Stevens holly','Ilex x Nellie R. Stevens','evergreen',20,12,6,9,'full','med','med',0,1,'pyramidal',0x2e5a2e,0,'red berries in winter','15'],
  ['greengiant','Green Giant arborvitae','Thuja Green Giant','evergreen',40,15,5,8,'full','med','fast',0,1,'columnar',0x3d6a35,0,'','15'],
  ['waxmyrtle','Wax myrtle','Morella cerifera','evergreen',12,10,7,10,'full','low','fast',1,1,'oval',0x4f7a42,0,'','7'],
  ['sabal','Sabal palmetto','Sabal palmetto','palm',30,12,8,11,'full','low','slow',1,1,'palm',0x587f3a,0,'','15'],
  ['windmill','Windmill palm','Trachycarpus fortunei','palm',20,8,7,11,'part','med','slow',0,1,'palm',0x4a7533,0,'','15'],
  ['encore','Encore azalea','Rhododendron Encore','shrub',4,4,6,10,'part','med','med',0,1,'mound',0x3f6b33,0xe0559a,'spring and fall','3'],
  ['formosa','Formosa azalea','Rhododendron indica Formosa','shrub',8,8,7,9,'part','med','med',0,1,'mound',0x3f6b33,0xc3398a,'spring','3'],
  ['boxwood','Wintergreen boxwood','Buxus microphylla','shrub',3,3,5,9,'full','med','slow',0,1,'round',0x3b6b2f,0,'','3'],
  ['hawthorn','Indian hawthorn','Rhaphiolepis indica','shrub',4,4,7,10,'full','low','slow',0,1,'mound',0x3b5f30,0xf0b6c8,'spring','3'],
  ['loropetalum','Loropetalum Purple Diamond','Loropetalum chinense','shrub',5,5,7,10,'full','low','med',0,1,'mound',0x5a2a3a,0xe25aa0,'spring','3'],
  ['gardenia','Gardenia August Beauty','Gardenia jasminoides','shrub',5,4,7,10,'part','med','med',0,1,'round',0x2f5a2c,0xfbf9f0,'summer','3'],
  ['hydrangea','Bigleaf hydrangea','Hydrangea macrophylla','shrub',5,5,6,9,'part','high','fast',0,0,'mound',0x4f8a3a,0x6f8fd8,'summer','3'],
  ['oakleaf','Oakleaf hydrangea','Hydrangea quercifolia','shrub',6,6,5,9,'part','med','med',1,0,'mound',0x4a7a34,0xf4efe2,'summer','3'],
  ['dwarfyaupon','Dwarf yaupon','Ilex vomitoria Nana','shrub',3,4,7,10,'full','low','slow',1,1,'round',0x3f6635,0,'','3'],
  ['abelia','Glossy abelia','Abelia x grandiflora','shrub',5,5,6,9,'full','low','med',0,1,'mound',0x4f7a3d,0xf2dbe3,'summer','3'],
  ['knockout','Knock Out rose','Rosa Radrazz','shrub',4,4,5,10,'full','med','fast',0,0,'round',0x3e6a33,0xd8243c,'spring to frost','3'],
  ['distylium','Distylium Vintage Jade','Distylium','shrub',2,4,7,9,'full','low','med',0,1,'mound',0x3d6b3a,0,'','3'],
  ['burford','Dwarf Burford holly','Ilex cornuta Burfordii Nana','shrub',6,5,7,9,'full','low','slow',0,1,'round',0x2f5a2c,0,'red berries','3'],
  ['sasanqua','Sasanqua camellia','Camellia sasanqua','shrub',10,6,7,9,'part','med','slow',0,1,'oval',0x2e542b,0xf08aa8,'fall to winter','7'],
  ['viburnum','Sweet viburnum','Viburnum odoratissimum','shrub',15,10,8,10,'full','med','fast',0,1,'oval',0x3f6f34,0xf6f2e4,'spring','7'],
  ['firepower','Nandina Firepower','Nandina domestica Firepower','shrub',2,2,6,9,'full','low','slow',0,1,'round',0xa8452c,0,'red winter foliage','3'],
  ['muhly','Pink muhly grass','Muhlenbergia capillaris','grass',3,3,6,10,'full','low','fast',1,0,'fountain',0x7f8f52,0xe08ab8,'fall','1'],
  ['fountain','Fountain grass Hameln','Pennisetum alopecuroides','grass',2.5,2.5,5,9,'full','low','fast',0,0,'fountain',0x7a8f4a,0xe6dcc0,'late summer','1'],
  ['maiden','Maiden grass','Miscanthus sinensis','grass',6,4,5,9,'full','low','fast',0,0,'fountain',0x7f9a5a,0xe0d2b0,'fall','3'],
  ['liriope','Liriope Big Blue','Liriope muscari','groundcover',1.2,1.5,5,10,'part','low','med',0,1,'spiky',0x2f5a2c,0x8a6fd0,'late summer','1'],
  ['mondo','Mondo grass','Ophiopogon japonicus','groundcover',0.5,0.8,7,10,'shade','med','slow',0,1,'spiky',0x1f4a25,0,'','4in'],
  ['asianjas','Asiatic jasmine','Trachelospermum asiaticum','groundcover',0.5,3,7,10,'part','low','med',0,1,'mat',0x2f5a2c,0,'','4in'],
  ['bluerug','Blue Rug juniper','Juniperus horizontalis','groundcover',0.5,6,3,9,'full','low','med',0,1,'mat',0x5f7f7a,0,'','1'],
  ['daylily','Daylily Stella de Oro','Hemerocallis','perennial',1.5,1.5,3,9,'full','low','fast',0,0,'spiky',0x5a8a3a,0xf2c022,'summer','1'],
  ['hosta','Hosta','Hosta','perennial',2,3,3,9,'shade','med','med',0,0,'mound',0x5f8f4a,0xcab8e0,'summer','1'],
  ['coneflower','Purple coneflower','Echinacea purpurea','perennial',3,2,3,9,'full','low','fast',1,0,'round',0x4f7a36,0xc65aa0,'summer','1'],
  ['blackeyed','Black-eyed Susan','Rudbeckia fulgida','perennial',2.5,2,3,9,'full','low','fast',1,0,'round',0x4f7a36,0xf0b414,'summer to fall','1'],
  ['lantana','Lantana New Gold','Lantana camara','perennial',2,4,8,11,'full','low','fast',0,0,'mound',0x4f7a36,0xf4c020,'summer to frost','1'],
  ['salvia','Salvia Mystic Spires','Salvia longispicata x farinacea','perennial',2.5,2,7,10,'full','low','fast',0,0,'round',0x4f7a36,0x5a5ac8,'spring to frost','1'],
  ['annuals','Seasonal color (annuals)','annual bedding plants','perennial',1,1,1,13,'full','med','fast',0,0,'round',0x4f7a36,0xe85a7a,'one season','4in'],
];
const PLANTS_SP={};for(const r of SPECIES_RAW){const [k,name,bot,kind,h,s,z0,z1,sun,water,growth,native,ever,form,fol,flw,bloom,size]=r;PLANTS_SP[k]={k,name,bot,kind,h:h*12,s:s*12,z:[z0,z1],sun,water,growth,native:!!native,ever:!!ever,form,fol,flw,bloom,size};}
const PLANT_SIZES=[['4in','4" pot',6,6,6],['1','1 gallon',12,12,14],['3','3 gallon',18,20,32],['7','7 gallon',26,30,60],['15','15 gallon',48,72,120],['30','30 gallon',66,96,240],['2cal','2" caliper B&B',96,144,300],['3cal','3" caliper B&B',120,168,450]];
// [key, label, spread at planting in, height at planting in, planning price $]
const plantSize=k=>PLANT_SIZES.find(s=>s[0]===k)||PLANT_SIZES[2];
const LAND_SUN={full:'Full sun',part:'Part sun',shade:'Shade'};const LAND_WATER={low:'Low water once established',med:'Average water',high:'Moist soil'};
const ZONES=['6a','6b','7a','7b','8a','8b','9a','9b','10a'];const zoneNum=z=>parseInt(z,10)+(String(z).endsWith('b')?0.5:0);
function landOf(p){return {show:'mature',zone:'8a',...(p.settings?.land||{})};}
// spread and height shown now: at planting, in 5 years, or mature
function plantDims(p,o){const S=PLANTS_SP[o.sp]||PLANTS_SP.boxwood;const [,,s0,h0]=plantSize(o.size||S.size);const show=landOf(p).show;const ms=o.d||S.s,mh=o.h||S.h;
  if(show==='plant')return {s:Math.min(ms,s0),h:Math.min(mh,h0)};if(show==='five'){const f=S.growth==='fast'?0.75:S.growth==='med'?0.5:0.3;return {s:s0+(ms-s0)*f,h:h0+(mh-h0)*f};}return {s:ms,h:mh};}
const plantCode=sp=>{const S=PLANTS_SP[sp];if(!S)return '?';const w=S.name.replace(/[^A-Za-z ]/g,'').split(/\s+/).filter(Boolean);return (w.length>1?w[0][0]+w[1][0]:w[0].slice(0,2)).toUpperCase();};
const PLANT_KIND_LABEL={shade:'Shade trees',ornamental:'Ornamental trees',evergreen:'Evergreen trees and screens',palm:'Palms',shrub:'Shrubs',grass:'Ornamental grasses',groundcover:'Groundcovers',perennial:'Perennials and color'};
function segDistPt(q,a,b){const dx=b.x-a.x,dy=b.y-a.y;const L=dx*dx+dy*dy||1;const t=Math.max(0,Math.min(1,((q.x-a.x)*dx+(q.y-a.y)*dy)/L));return Math.hypot(q.x-a.x-dx*t,q.y-a.y-dy*t);}
const plantZ=(p,o)=>slopeOf(p).fall>0?gradeAt(p,o.x,o.y):siteZ(p);
regObj('plant',{coll:'plants',label:'Plant',plural:'plants',z:-4,layer:'under',hitStage:'late',planSheet:false,
  pts:(p,o)=>{const r=plantDims(p,o).s/2;return [{x:o.x-r,y:o.y-r},{x:o.x+r,y:o.y+r}];},noBounds:true,
  hit:(p,o,raw,tol)=>Math.hypot(raw.x-o.x,raw.y-o.y)<=Math.max(10,plantDims(p,o).s/2*(PLANTS_SP[o.sp]&&['shade','ornamental','evergreen','palm'].includes(PLANTS_SP[o.sp].kind)?0.4:0.9)),
  move:(o,dx,dy)=>({...o,x:o.x+dx,y:o.y+dy}),
  title:o=>(PLANTS_SP[o.sp]||{name:'Plant'}).name,
  svg:(p,lv,o,S,view,isSel)=>{const sp=PLANTS_SP[o.sp]||PLANTS_SP.boxwood;const [x,y]=S(o.x,o.y);const r=Math.max(2.5,plantDims(p,o).s/2*view.s);const cls='plantsym kind-'+sp.kind+(isSel?' site-sel':'');const fill='#'+(o.color?hexNum(o.color):sp.fol).toString(16).padStart(6,'0');
    const tree=['shade','ornamental','evergreen','palm'].includes(sp.kind);const parts=[];
    if(sp.kind==='palm'){for(let i=0;i<9;i++){const a=i/9*Math.PI*2;parts.push(html`<line key=${i} x1=${x} y1=${y} x2=${x+r*Math.cos(a)} y2=${y+r*Math.sin(a)} className="plant-ray"/>`);}parts.push(html`<circle key="c" cx=${x} cy=${y} r=${r} fill=${fill} fillOpacity="0.25" className=${cls}/>`);}
    else if(tree){const n=sp.form==='pyramidal'||sp.kind==='evergreen'?16:11;const pts=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2;const rr=i%2?r*(sp.kind==='evergreen'?0.72:0.86):r;pts.push(`${x+rr*Math.cos(a)},${y+rr*Math.sin(a)}`);}
      parts.push(html`<polygon key="t" points=${pts.join(' ')} fill=${fill} fillOpacity="0.3" className=${cls}/>`,html`<circle key="k" cx=${x} cy=${y} r=${Math.max(1.2,3*view.s)} className="tree-trunk"/>`);}
    else if(sp.kind==='grass'||sp.form==='spiky'){for(let i=0;i<12;i++){const a=i/12*Math.PI*2;parts.push(html`<line key=${i} x1=${x+r*0.2*Math.cos(a)} y1=${y+r*0.2*Math.sin(a)} x2=${x+r*Math.cos(a)} y2=${y+r*Math.sin(a)} className="plant-ray"/>`);}parts.push(html`<circle key="c" cx=${x} cy=${y} r=${r} fill=${fill} fillOpacity="0.2" className=${cls}/>`);}
    else{parts.push(html`<circle key="c" cx=${x} cy=${y} r=${r} fill=${fill} fillOpacity="0.35" className=${cls}/>`);if(r>6)for(let i=0;i<6;i++){const a=i/6*Math.PI*2+0.3;parts.push(html`<line key=${'l'+i} x1=${x} y1=${y} x2=${x+r*0.75*Math.cos(a)} y2=${y+r*0.75*Math.sin(a)} className="plant-ray"/>`);}}
    if(sp.flw&&r>5)parts.push(html`<circle key="f" cx=${x+r*0.35} cy=${y-r*0.35} r=${Math.max(1.5,r*0.15)} fill=${'#'+sp.flw.toString(16).padStart(6,'0')} className="plant-flw"/>`);
    if(view.s>0.6&&r>9)parts.push(html`<text key="tx" x=${x} y=${y+3} textAnchor="middle" className="plant-code">${plantCode(o.sp)}</text>`);
    return html`<g>${parts}</g>`;},
  add3D:(p,lv,o,ctx)=>{if(lv.id!==groundLevel(p).id)return;const sp=PLANTS_SP[o.sp]||PLANTS_SP.boxwood;const {s,h}=plantDims(p,o);const z=plantZ(p,o);const sel=ctx.isSel&&ctx.isSel(o);
    const fol=sel?ctx.mSel:ctx.col(o.color?hexNum(o.color):sp.fol,{roughness:.95,flatShading:true,key:'pl-'+(o.color||sp.fol)});const trunk=ctx.col(0x5a4330,{roughness:1});
    const bloom=landOf(p).bloom!==false&&sp.flw;const fl=bloom?ctx.col(sp.flw,{roughness:.8,flatShading:true,key:'plf-'+sp.flw}):null;
    const ball=(cx,cy,cz,r,sy=1,m=fol)=>{const g=new THREE.IcosahedronGeometry(r*IN,1);g.scale(1,sy,1);ctx.add(g,m,cx*IN,cz*IN,cy*IN,0);};
    switch(sp.form){
      case 'palm':{ctx.cyl(o.x,o.y,z,Math.max(3,s*0.03),h*0.9,trunk,8,Math.max(2,s*0.025));for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ctx.stick({x:o.x,y:o.y,z:z+h*0.9},{x:o.x+Math.cos(a)*s*0.5,y:o.y+Math.sin(a)*s*0.5,z:z+h*0.72},2,Math.max(6,s*0.06),fol);}return;}
      case 'pyramidal':case 'columnar':{const tw=sp.form==='columnar'?0.5:1;if(sp.kind!=='evergreen'||sp.k==='nellie'||sp.k==='magnolia'||sp.k==='littlegem')ctx.cyl(o.x,o.y,z,Math.max(2,s*0.03),h*0.25,trunk,8);
        const g=new THREE.ConeGeometry(s/2*IN*tw*(sp.form==='columnar'?1.4:1),h*0.88*IN,10);ctx.add(g,fol,o.x*IN,(z+h*0.12+h*0.44)*IN,o.y*IN,0);
        if(fl){for(let i=0;i<8;i++){const a=i*2.4,rr=s*0.28*tw,zz=h*(0.3+0.07*i);ball(o.x+Math.cos(a)*rr,o.y+Math.sin(a)*rr,z+zz,Math.max(2,s*0.04),1,fl);}}return;}
      case 'vase':case 'oval':case 'spreading':{if(['shade','ornamental','evergreen'].includes(sp.kind)){const th=h*(sp.form==='spreading'?0.35:0.42);ctx.cyl(o.x,o.y,z,Math.max(2,s*0.025),th,trunk,8,Math.max(1.5,s*0.02));
          const cr=s/2,sy=sp.form==='spreading'?0.55:sp.form==='vase'?0.85:1.05;ball(o.x,o.y,z+th+cr*sy*0.85,cr,sy);if(s>100)ball(o.x+s*0.2,o.y-s*0.12,z+th+cr*sy*0.6,cr*0.6,sy);
          if(fl)for(let i=0;i<14;i++){const a=i*2.4,rr=cr*0.82,u=(i%5)/5;ball(o.x+Math.cos(a)*rr*(0.6+u*0.4),o.y+Math.sin(a)*rr*(0.6+u*0.4),z+th+cr*sy*(0.7+u*0.8),Math.max(2,s*0.05),1,fl);}return;}
        ball(o.x,o.y,z+h*0.5,s/2,h/s);if(fl)for(let i=0;i<6;i++){const a=i*2.4;ball(o.x+Math.cos(a)*s*0.32,o.y+Math.sin(a)*s*0.32,z+h*0.7,Math.max(1.5,s*0.08),1,fl);}return;}
      case 'fountain':case 'spiky':{const n=sp.form==='spiky'?9:13;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;ctx.stick({x:o.x,y:o.y,z},{x:o.x+Math.cos(a)*s*0.45,y:o.y+Math.sin(a)*s*0.45,z:z+h*(0.75+0.25*((i*7)%3)/2)},1,Math.max(0.6,s*0.03),fol);}
        if(fl){for(let i=0;i<7;i++){const a=i/7*Math.PI*2+0.4;ball(o.x+Math.cos(a)*s*0.32,o.y+Math.sin(a)*s*0.32,z+h*0.9,Math.max(1,s*0.07),1.6,fl);}}return;}
      case 'mat':{const g=new THREE.CylinderGeometry(s/2*IN,s/2*IN,Math.max(2,h)*IN,12);ctx.add(g,fol,o.x*IN,(z+Math.max(2,h)/2)*IN,o.y*IN,0);return;}
      default:{ball(o.x,o.y,z+h*0.42,s/2,Math.min(1.1,h/s*1.15));if(fl)for(let i=0;i<7;i++){const a=i*2.4;ball(o.x+Math.cos(a)*s*0.33,o.y+Math.sin(a)*s*0.33,z+h*0.62+((i%3)*h*0.08),Math.max(1.2,s*0.09),1,fl);}}}},
  panel:(o,{p,up,commit})=>{const sp=PLANTS_SP[o.sp]||PLANTS_SP.boxwood;const L=landOf(p);const zone=zoneNum(L.zone);const zOK=zone>=sp.z[0]&&zone<sp.z[1]+1;const dims=plantDims(p,o);
    const kinds=Object.keys(PLANT_KIND_LABEL);
    return html`<div className="sec"><h3>Plant</h3><${PicPane} kind="plant" obj=${o} p=${p}/>
      <${Field} label="Plant" id="pl-sp"><select id="pl-sp" className="inp" value=${o.sp} onChange=${e=>up({sp:e.target.value,size:PLANTS_SP[e.target.value].size,d:null,h:null})}>${kinds.map(k=>html`<optgroup key=${k} label=${PLANT_KIND_LABEL[k]}>${Object.values(PLANTS_SP).filter(s=>s.kind===k).map(s=>html`<option key=${s.k} value=${s.k}>${s.name}</option>`)}</optgroup>`)}</select><//>
      <p className="note"><i>${sp.bot}</i>. ${Math.round(sp.h/12)}' tall x ${Math.round(sp.s/12)}' wide when mature, ${sp.growth} growth. ${LAND_SUN[sp.sun]}; ${LAND_WATER[sp.water].toLowerCase()}. ${sp.ever?'Evergreen.':'Deciduous.'}${sp.flw?` Flowers: ${sp.bloom}.`:sp.bloom?` ${sp.bloom[0].toUpperCase()+sp.bloom.slice(1)}.`:''}${sp.native?' Native to the Southeast.':''} Zones ${sp.z[0]} to ${sp.z[1]}.</p>
      ${!zOK?html`<p className="note warnnote">Not rated for zone ${L.zone} (set the zone under Landscape settings in the Project panel).</p>`:null}
      <div className="grid2"><${Field} label="Size to buy" id="pl-sz"><${Sel} id="pl-sz" value=${o.size||sp.size} onChange=${v=>up({size:v})} options=${PLANT_SIZES.map(s=>[s[0],s[1]])}/><//>
        <${Field} label="Mature spread" id="pl-d"><${LenInput} id="pl-d" value=${o.d||sp.s} onChange=${v=>v>0&&up({d:v})}/><//>
        <${Field} label="Mature height" id="pl-h"><${LenInput} id="pl-h" value=${o.h||sp.h} onChange=${v=>v>0&&up({h:v})}/><//>
        <${Field} label="Show size" id="pl-show"><${Sel} id="pl-show" value=${L.show} onChange=${v=>commit({...p,settings:{...p.settings,land:{...L,show:v}}})} options=${[['plant','At planting'],['five','In 5 years'],['mature','Mature']]}/><//></div>
      <div className="stat"><span>Shown now</span><span className="mono">${fmtLen(dims.s)} wide x ${fmtLen(dims.h)} tall</span></div>
      <${ColorPick} id="pl-c" label="Foliage color" value=${o.color} fallback=${'#'+sp.fol.toString(16).padStart(6,'0')} onChange=${v=>up({color:v})}/></div>`;},
  takeoff:(p,add)=>{const C='Landscape plants';const by={};for(const o of p.plants||[]){if(o.status==='existing'||o.status==='demolish')continue;const sp=PLANTS_SP[o.sp];if(!sp)continue;const sz=o.size||sp.size;const k=o.sp+'|'+sz;by[k]=by[k]||{sp,sz,n:0};by[k].n++;}
    for(const {sp,sz,n} of Object.values(by))add(C,`${sp.name} (${sp.bot}), ${plantSize(sz)[1]}`,n,'EA',`key ${plantCode(sp.k)}; planning price about $${plantSize(sz)[4]} each`);
    const trees=(p.plants||[]).filter(o=>o.status!=='existing'&&PLANTS_SP[o.sp]&&['shade','ornamental','evergreen','palm'].includes(PLANTS_SP[o.sp].kind)&&/cal|15|30/.test(o.size||PLANTS_SP[o.sp].size)).length;
    if(trees){add(C,'Tree staking kit',trees,'EA','for 15 gal and larger');add(C,'Planting soil mix for trees',Math.ceil(trees*0.25*10)/10,'CY','about 1/4 CY per tree pit');}},
  checks:(p,add)=>{const L=landOf(p);const zone=zoneNum(L.zone);const first=groundLevel(p);const ext=p.walls.filter(w=>w.level===first.id&&w.kind==='exterior'&&w.status!=='demolish');
    for(const o of p.plants||[]){const sp=PLANTS_SP[o.sp];if(!sp||o.status==='demolish')continue;const T={kind:'plant',id:o.id};const pt={x:o.x,y:o.y};const mat=o.d||sp.s;
      if(!(zone>=sp.z[0]&&zone<sp.z[1]+1))add('warn',{set:'Landscape',code:'Hardiness',title:'Hardiness zone'},`${sp.name}: not hardy in zone ${L.zone}`,`Rated for USDA zones ${sp.z[0]} to ${sp.z[1]}.`,T,pt,o.level);
      let near=1e9;for(const w of ext){near=Math.min(near,segDistPt(pt,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2})-w.thick/2);}
      const tree=['shade','ornamental','evergreen','palm'].includes(sp.kind);
      if(tree&&(o.h||sp.h)>=360&&near<120)add('warn',{set:'Landscape',code:'Spacing',title:'Large tree near the house'},`${sp.name}: ${fmtLen(Math.max(0,near))} from the house`,'Large trees within 10 ft of the foundation can damage it and hang over the roof. Plant at least 15 to 20 ft away.',T,pt,o.level);
      else if(!tree&&near<mat/2+6&&near<1e8)add('warn',{set:'Landscape',code:'Spacing',title:'Shrub too close to the wall'},`${sp.name}: will grow into the wall`,`It spreads ${fmtLen(mat)}; plant its center at least ${fmtLen(mat/2+12)} from the wall for air flow and siding upkeep.`,T,pt,o.level);}
    // plants of the same kind crowding each other
    const ps=(p.plants||[]).filter(o=>o.status!=='demolish'&&PLANTS_SP[o.sp]);for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j];const sa=PLANTS_SP[a.sp],sb=PLANTS_SP[b.sp];if(sa.kind!==sb.kind)continue;
      const need=((a.d||sa.s)+(b.d||sb.s))/2*0.6;const dd=Math.hypot(a.x-b.x,a.y-b.y);if(dd<need-0.5)add('warn',{set:'Landscape',code:'Spacing',title:'Plants crowded'},`${sa.name} and ${sb.name} are close`,`${fmtLen(dd)} apart; about ${fmtLen(need)} or more lets them reach a natural size.`,{kind:'plant',id:a.id},{x:a.x,y:a.y},a.level);}}});
I.plant=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21v-7"/><path d="M12 14c-4 0-7-3-7-7 4 0 7 3 7 7zM12 12c0-4 3-7 7-7 0 4-3 7-7 7z"/></svg>`;
let PLANT_PRESET={sp:'boxwood'};
regTool('plant',{label:'Plant',group:'site',icon:I.plant,mode:'click',snap:'grid',
  hint:()=>html`<b>Plant:</b> click to place ${(PLANTS_SP[PLANT_PRESET.sp]||{}).name||'a plant'}. Each click adds another; pick plants in the Library under Landscaping or change it in the panel.`,
  place:(ctx,pts)=>{const lv=groundLevel(ctx.p);const sp=PLANTS_SP[PLANT_PRESET.sp]||PLANTS_SP.boxwood;const o={id:uid('pl'),level:lv.id,sp:sp.k,size:PLANT_PRESET.size||sp.size,x:pts[0].x,y:pts[0].y,status:'new',...(PLANT_PRESET.color?{color:PLANT_PRESET.color}:{})};
    return {p:{...ctx.p,plants:[...(ctx.p.plants||[]),o]},sel:{kind:'plant',id:o.id}};}});
addToolToGroup('site','plant');
/* ---- landscape library entries ---- */
for(const sp of Object.values(PLANTS_SP))registerLibItem({id:'ls-'+sp.k,cat:'Landscaping',sub:PLANT_KIND_LABEL[sp.kind],label:`${sp.name}`,place:'plant',sp:sp.k,native:sp.native});
/* ---- beds, lawns: groundcover fill, sod varieties, edging, irrigation ---- */
const SOD=[['bermuda','Bermuda (Tifway 419)',0.25],['staug','St. Augustine',0],['zoysia','Zoysia',0],['centipede','Centipede',0.25],['fescue','Tall fescue',6]];
const EDGING=[['none','No edging'],['steel','Steel edging'],['alum','Aluminum edging'],['plastic','Plastic edging'],['brick','Brick soldier course'],['stone','Natural stone']];
const IRRIG=[['none','No irrigation'],['spray','Spray heads'],['rotor','Rotors'],['drip','Drip line']];
{const S=OBJ.site;const _panel=S.panel,_take=S.takeoff,_a3=S.add3D;
  S.panel=(o,ctx)=>{const base=_panel(o,ctx);if(o.type!=='bed'&&o.type!=='lawn')return base;const {up}=ctx;const A=polyArea(o.pts)/144;
    const gc=o.fill&&PLANTS_SP[o.fill.sp];const sp=o.fill?.spacing||(gc?Math.max(6,Math.round(gc.s*0.75)):12);const n=gc?Math.ceil(A*144/(sp*sp*0.866)):0;
    return html`${base}<div className="sec"><h3>${o.type==='bed'?'Planting':'Turf'}</h3>
      ${o.type==='lawn'?html`<${Field} label="Grass" id="si-sod"><${Sel} id="si-sod" value=${o.sod||'bermuda'} onChange=${v=>up({sod:v})} options=${SOD.map(s=>[s[0],s[1]])}/><//>`:html`
        <${Field} label="Mass planting" id="si-gc"><select id="si-gc" className="inp" value=${o.fill?.sp||''} onChange=${e=>up({fill:e.target.value?{sp:e.target.value,spacing:null}:null})}><option value="">None (mulch only)</option>${['groundcover','perennial','grass','shrub'].map(k=>html`<optgroup key=${k} label=${PLANT_KIND_LABEL[k]}>${Object.values(PLANTS_SP).filter(s=>s.kind===k).map(s=>html`<option key=${s.k} value=${s.k}>${s.name}</option>`)}</optgroup>`)}</select><//>
        ${gc?html`<${Field} label="Spacing on center" id="si-gcs"><${LenInput} id="si-gcs" value=${sp} onChange=${v=>v>2&&up({fill:{...o.fill,spacing:v}})}/><//><div className="stat"><span>Plants to fill it</span><span className="mono">${n} (${plantSize(gc.size)[1]})</span></div>`:null}
        <${Field} label="Edging" id="si-ed"><${Sel} id="si-ed" value=${o.edge||'steel'} onChange=${v=>up({edge:v})} options=${EDGING}/><//>
        <label className="check"><input type="checkbox" checked=${o.fabric!==false} onChange=${e=>up({fabric:e.target.checked})}/> Landscape fabric under the mulch</label>`}
      <${Field} label="Irrigation" id="si-ir"><${Sel} id="si-ir" value=${o.irrig||'none'} onChange=${v=>up({irrig:v})} options=${IRRIG}/><//></div>`;};
  S.takeoff=(p,add,W)=>{_take(p,add,W);const C='Site and landscape';let irr=false;
    for(const o of p.site||[]){if(o.status==='existing'||(o.type!=='bed'&&o.type!=='lawn'))continue;const A=polyArea(o.pts)/144;const per=polyPerimPts(o.pts.map(([x,y])=>({x,y})))/12;
      if(o.type==='lawn'&&o.surf!=='seed'){const s=SOD.find(x=>x[0]===(o.sod||'bermuda'));add(C,`${s[1]} sod pallets`,Math.ceil(A*W/450),'pallet','about 450 sq ft per pallet');}
      if(o.type==='lawn'&&o.surf==='seed'){const s=SOD.find(x=>x[0]===(o.sod||'bermuda'));if(s[2])add(C,`${s[1]} seed`,Math.ceil(A/1000*s[2]*10)/10,'lb',`${s[2]} lb per 1,000 sq ft`);}
      if(o.type==='bed'){const gc=o.fill&&PLANTS_SP[o.fill.sp];if(gc){const sp=o.fill.spacing||Math.max(6,Math.round(gc.s*0.75));add('Landscape plants',`${gc.name} (${gc.bot}), ${plantSize(gc.size)[1]}, ${fmtLen(sp)} on center`,Math.ceil(A*144/(sp*sp*0.866)),'EA','mass planting');}
        if(o.fabric!==false&&o.surf!=='pinestraw')add(C,'Landscape fabric',Math.ceil(A*1.1),'SF');const ed=o.edge||'steel';if(ed!=='none')add(C,`${(EDGING.find(e=>e[0]===ed)||['',''])[1]}`,Math.ceil(per),'LF','bed edge');}
      if(o.irrig&&o.irrig!=='none'){irr=true;if(o.irrig==='spray')add(C,'Irrigation spray heads (pop-up, 4")',Math.ceil(A/150),'EA','about 1 per 150 sq ft');else if(o.irrig==='rotor')add(C,'Irrigation rotors',Math.ceil(A/900),'EA','about 1 per 900 sq ft');else add(C,'Drip line, 12" emitter spacing',Math.ceil(A/1.5),'LF','rows 18" apart');
        add(C,'Irrigation zone valve',Math.max(1,Math.ceil(A/(o.irrig==='rotor'?4000:o.irrig==='drip'?2500:1500))),'EA');}}
    if(irr){add(C,'Irrigation controller with rain sensor',1,'EA');add(C,'Backflow preventer (as the water purveyor requires)',1,'EA');}
    if((p.plants||[]).length||(p.site||[]).some(o=>o.type==='bed'||o.type==='lawn'))add(C,'Call 811 before digging (free utility locate)',1,'note','Mississippi 811: at least 2 working days before');};
  // groundcover plants scattered in beds
  S.add3D=(p,lv,o,ctx)=>{_a3(p,lv,o,ctx);if(o.type!=='bed'||!o.fill||lv.id!==groundLevel(p).id)return;const gc=PLANTS_SP[o.fill.sp];if(!gc)return;const sp=o.fill.spacing||Math.max(6,Math.round(gc.s*0.75));
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of o.pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}const z=siteZ(p)+2;let n=0;
    const m=ctx.col(gc.fol,{roughness:.95,flatShading:true,key:'pl-'+gc.fol});const fl=gc.flw?ctx.col(gc.flw,{roughness:.8,key:'plf-'+gc.flw}):null;
    const r=Math.min(gc.s/2,sp*0.55);for(let y=y0+sp/2,row=0;y<y1;y+=sp*0.866,row++)for(let x=x0+sp/2+(row%2?sp/2:0);x<x1;x+=sp){if(!inPoly(x,y,o.pts))continue;if(++n>500)return;
      const g=new THREE.IcosahedronGeometry(r*IN,0);g.scale(1,Math.min(1,gc.h/gc.s),1);ctx.add(g,m,x*IN,(z+Math.min(gc.h,gc.s)*0.35)*IN,y*IN,0,false);if(fl&&n%2)ctx.add(new THREE.IcosahedronGeometry(r*0.35*IN,0),fl,x*IN,(z+Math.min(gc.h,gc.s)*0.7)*IN,y*IN,0,false);}};}
/* ---- landscape settings (zone, size shown, flowers) live in the Project panel ---- */
function LandscapeSettings({p,commit}){const L=landOf(p);const up=patch=>commit({...p,settings:{...p.settings,land:{...L,...patch}}});
  return html`<div className="sec"><h3>Landscape</h3><div className="grid2"><${Field} label="USDA zone" id="ld-z"><${Sel} id="ld-z" value=${L.zone} onChange=${v=>up({zone:v})} options=${ZONES.map(z=>[z,z])}/><//>
    <${Field} label="Show plants" id="ld-s"><${Sel} id="ld-s" value=${L.show} onChange=${v=>up({show:v})} options=${[['plant','At planting'],['five','In 5 years'],['mature','Mature']]}/><//></div>
    <label className="check"><input type="checkbox" checked=${L.bloom!==false} onChange=${e=>up({bloom:e.target.checked})}/> Show flowers in 3D</label>
    <p className="note">Forest, Mississippi is in zone 8a. Plants rated outside the zone are flagged in Check.</p></div>`;}
