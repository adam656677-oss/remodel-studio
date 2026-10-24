/* ======================= decor library: furniture, lighting, fans, rugs, art, plants, bath, outdoor, games, garage, electronics, people ======================= */
// Each item draws with a 3D builder from DECOR_MODELS and a plan symbol below. Codes follow the catalog style "CODE > Description".
const DFAB={Gray:0x8d9196,Charcoal:0x45484c,Navy:0x2f3e5c,Cream:0xe6dccb,Sage:0x8fa58a,Rust:0xa5563a,Blush:0xd9a9a0,Mustard:0xc9a13b,Leather:0x7a4a2c,Black:0x26272a,Teal:0x2f6f73,White:0xf0eee9};
const DWOOD={Oak:0xb08a5a,Walnut:0x5e4130,Cherry:0x8a4a32,Espresso:0x3a2a20,White:0xeeeae2,Black:0x2a2a2a,Gray:0x8a8a86,Natural:0xc9a77c};
const DMETAL={'Matte black':0x2b2b2b,'Brushed nickel':0xb9bcbf,Brass:0xc8a45a,Chrome:0xd9dcdf,Bronze:0x5a4632};
const ab=s=>s.replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,3);
const DL_=(o)=>{const it={place:'fixture',base:'decor',...o};if(!it.code)it.code=it.id.replace(/^dc-/,'').toUpperCase().slice(0,14);registerLibItem(it);return it;};
const D_=(id,cat,sub,label,model,w,d,h,x={})=>DL_({id:'dc-'+id,cat,sub,label,model,w,d,h,...x});
const DW_=(id,cat,sub,label,model,w,d,h,elev,x={})=>DL_({id:'dc-'+id,cat,sub,label,model,w,d,h,elev,base:'decorwall',...x});
const DC_=(id,cat,sub,label,model,w,d,h,x={})=>DL_({id:'dc-'+id,cat,sub,label,model,w,d,h,elev:96-h,base:'decorceil',...x});
const each=(obj,fn)=>Object.entries(obj).forEach(([k,v])=>fn(k,v));
{
const LR='Living room',BR='Bedroom',DN='Dining room',OF='Office',KD='Kids room',BA='Bath accessories',LU='Laundry and utility',GA='Garage and storage',LT='Lighting and fans',DE='Decor and window treatments',PL='Indoor plants',OL='Outdoor living',GF='Games and fitness',EL='Electronics',PP='People and pets';
// ---------- living room ----------
for(const [st,sn] of [['track','Track-arm'],['rolled','Rolled-arm'],['tuxedo','Tuxedo']])for(const [w,n] of [[60,'loveseat'],[72,'sofa 72"'],[84,'sofa 84"'],[96,'sofa 96"']])each({Gray:1,Navy:1,Cream:1,Charcoal:1,Sage:1,Leather:1},c=>D_(`sofa-${st}-${w}-${c}`.toLowerCase(),LR,'Sofas and loveseats',`${sn} ${n}, ${c.toLowerCase()}`,'sofa',w,38,34,{col:DFAB[c],opt:{style:st,arm:st==='tuxedo'?5:6},code:`SF${st[0].toUpperCase()}${w}-${ab(c)}`}));
for(const [w,d,s] of [[110,84,'R'],[110,84,'L'],[124,94,'R'],[124,94,'L']])each({Gray:1,Cream:1,Charcoal:1,Navy:1},c=>D_(`sect-${w}-${s}-${c}`.toLowerCase(),LR,'Sectionals',`Sectional ${w}" x ${d}", ${s==='R'?'right':'left'}-arm chaise, ${c.toLowerCase()}`,'sectional',w,d,34,{col:DFAB[c],opt:{side:s,depth:38},code:`SEC${w}${s}-${ab(c)}`}));
each({Gray:1,Cream:1,Leather:1},c=>D_(`chaise-${c}`.toLowerCase(),LR,'Sectionals',`Chaise lounge, ${c.toLowerCase()}`,'chaise',30,64,32,{col:DFAB[c],code:`CHL-${ab(c)}`}));
for(const [st,sn,w,d,h] of [['club','Club chair',34,36,32],['wingback','Wingback chair',32,34,44],['slipper','Slipper chair',26,30,32],['barrel','Barrel swivel chair',30,30,30],['accent','Accent chair',28,30,32],['rocking','Rocking chair',24,34,40]])
  each(st==='rocking'?{Oak:1,White:1,Walnut:1}:{Gray:1,Navy:1,Cream:1,Mustard:1,Leather:1,Teal:1},c=>D_(`chair-${st}-${c}`.toLowerCase(),LR,'Chairs',`${sn}, ${c.toLowerCase()}`,'armchair',w,d,h,st==='rocking'?{wood:DWOOD[c],opt:{style:st},code:`CHR${ab(st)}-${ab(c)}`}:{col:DFAB[c],opt:{style:st},code:`CHR${ab(st)}-${ab(c)}`}));
each({Leather:1,Gray:1,Charcoal:1},c=>{D_(`recliner-${c}`.toLowerCase(),LR,'Chairs',`Recliner, ${c.toLowerCase()}`,'recliner',36,38,40,{col:DFAB[c],code:`RCL-${ab(c)}`});D_(`recliner-open-${c}`.toLowerCase(),LR,'Chairs',`Recliner, reclined (clearance), ${c.toLowerCase()}`,'recliner',36,66,40,{col:DFAB[c],opt:{open:true},code:`RCLO-${ab(c)}`});});
for(const [k,lab,w,d,h,o] of [['ott-rect','Ottoman, rectangle',36,24,18,{}],['ott-tuft','Tufted ottoman',48,30,18,{tufted:true}],['ott-round','Round pouf',20,20,16,{round:true}],['ott-round-lg','Round ottoman 36"',36,36,18,{round:true}]])each({Gray:1,Cream:1,Leather:1,Rust:1},c=>D_(`${k}-${c}`.toLowerCase(),LR,'Ottomans and benches',`${lab}, ${c.toLowerCase()}`,'ottoman',w,d,h,{col:DFAB[c],opt:o}));
D_('beanbag',LR,'Ottomans and benches','Bean bag chair','beanbag',36,36,28,{col:DFAB.Charcoal});
for(const [k,lab,w,d,h,o] of [['cof-rect-48','Coffee table 48" x 24"',48,24,18,{}],['cof-rect-54','Coffee table 54" x 28"',54,28,18,{}],['cof-glass','Glass coffee table 48"',48,24,17,{glass:true}],['cof-round-36','Round coffee table 36"',36,36,17,{shape:'round'}],['cof-round-42','Round coffee table 42"',42,42,17,{shape:'round'}],['cof-trunk','Trunk coffee table',44,24,19,{shape:'trunk'}]])
  each({Oak:1,Walnut:1,White:1,Black:1},c=>D_(`${k}-${c}`.toLowerCase(),LR,'Tables',`${lab}, ${c.toLowerCase()}`,'coffee',w,d,h,{wood:DWOOD[c],opt:o}));
for(const [k,lab,w,d,h,o] of [['end-sq','End table 22" square',22,22,24,{}],['end-round','Round side table 18"',18,18,24,{round:true}],['end-lamp','End table with lamp',22,22,24,{lamp:true}]])each({Oak:1,Walnut:1,White:1,Black:1},c=>D_(`${k}-${c}`.toLowerCase(),LR,'Tables',`${lab}, ${c.toLowerCase()}`,'endtable',w,d,h,{wood:DWOOD[c],opt:o}));
for(const [w,lab] of [[48,'Console table 48"'],[60,'Console table 60"']])each({Oak:1,Walnut:1,Black:1},c=>D_(`console-${w}-${c}`.toLowerCase(),LR,'Tables',`${lab}, ${c.toLowerCase()}`,'console',w,14,30,{wood:DWOOD[c]}));
for(const [w,tv] of [[48,43],[60,55],[72,65],[84,75]])each({Walnut:1,White:1,Black:1,Oak:1},c=>D_(`tvstand-${w}-${c}`.toLowerCase(),LR,'Media',`Media console ${w}" with ${tv}" TV, ${c.toLowerCase()}`,'tvstand',w,18,24,{wood:DWOOD[c],opt:{tv,front:DWOOD[c]},code:`MC${w}-${ab(c)}`}));
each({Walnut:1,White:1,Oak:1},c=>D_(`entertain-${c}`.toLowerCase(),LR,'Media',`Entertainment wall unit 120", ${c.toLowerCase()}`,'entertain',120,18,84,{wood:DWOOD[c]}));
for(const [w,h] of [[30,72],[36,72],[36,84],[48,84],[24,48]])each({Oak:1,White:1,Walnut:1,Black:1},c=>D_(`bookcase-${w}x${h}-${c}`.toLowerCase(),LR,'Storage',`Bookcase ${w}" x ${h}", ${c.toLowerCase()}`,'bookcase',w,12,h,{wood:DWOOD[c],code:`BK${w}${h}-${ab(c)}`}));
for(const [c_,r_] of [[2,2],[3,3],[4,2],[4,4],[2,4]])D_(`cube-${c_}x${r_}`,LR,'Storage',`Cube organizer ${c_} x ${r_}`,'cubeshelf',c_*14,15,r_*14,{wood:DWOOD.White,opt:{cols:c_,rows:r_}});
D_('ladder-shelf',LR,'Storage','Leaning ladder shelf','ladder',24,16,72,{wood:DWOOD.Oak});
each({Oak:1,Walnut:1},c=>D_(`piano-up-${c}`.toLowerCase(),LR,'Music','Upright piano','piano',58,24,48,{}));D_('piano-grand',LR,'Music','Baby grand piano','piano',58,60,40,{opt:{grand:true}});
// ---------- bedroom ----------
const BEDS=[['twin','Twin',38,75],['twinxl','Twin XL',38,80],['full','Full',54,75],['queen','Queen',60,80],['king','King',76,80],['calking','California king',72,84]];
for(const [st,sn] of [['panel','Panel bed'],['platform','Platform bed'],['upholstered','Upholstered bed'],['sleigh','Sleigh bed'],['poster','Four-poster bed'],['storage','Storage bed']])for(const [k,n,w,d] of BEDS){
  const woods=st==='upholstered'?{Gray:DFAB.Gray,Cream:DFAB.Cream,Navy:DFAB.Navy}:{Oak:DWOOD.Oak,Walnut:DWOOD.Walnut,White:DWOOD.White};
  each(woods,(c,v)=>D_(`bed-${st}-${k}-${c}`.toLowerCase(),BR,'Beds',`${sn}, ${n.toLowerCase()} (${w}" x ${d}" mattress), ${c.toLowerCase()}`,'bed',w+4,d+6,st==='poster'?84:st==='platform'?36:50,{col:st==='upholstered'?v:DFAB.White,wood:st==='upholstered'?DWOOD.Espresso:v,opt:{style:st},code:`BD${ab(st)}${k.toUpperCase().slice(0,3)}-${ab(c)}`}));}
each({Oak:1,White:1,Natural:1},c=>D_(`bunk-${c}`.toLowerCase(),KD,'Beds','Bunk bed, twin over twin','bunk',42,80,66,{wood:DWOOD[c],col:DFAB.Navy}));
each({Oak:1,White:1,Gray:1},c=>D_(`crib-${c}`.toLowerCase(),KD,'Nursery',`Crib, ${c.toLowerCase()}`,'crib',30,54,40,{wood:DWOOD[c],col:DFAB.Cream}));
D_('daybed',BR,'Beds','Daybed, twin','daybed',42,80,36,{wood:DWOOD.White,col:DFAB.Cream});
for(const [k,lab,w,d,h,o] of [['ns-1','Nightstand, 1 drawer',20,16,24,{drawers:1}],['ns-2','Nightstand, 2 drawers',24,18,26,{drawers:2}],['ns-3','Nightstand, 3 drawers',26,18,28,{drawers:3}],['ns-lamp','Nightstand with lamp',24,18,26,{drawers:2,lamp:true}]])
  each({Oak:1,Walnut:1,White:1,Espresso:1},c=>D_(`${k}-${c}`.toLowerCase(),BR,'Nightstands',`${lab}, ${c.toLowerCase()}`,'nightstand',w,d,h,{wood:DWOOD[c],opt:{...o,front:DWOOD[c]},code:`NS${w}-${ab(c)}`}));
for(const [k,lab,w,d,h,o] of [['dr-6','Dresser 60", 6 drawers',60,20,32,{rows:3,cols:2}],['dr-9','Dresser 66", 9 drawers',66,20,34,{rows:3,cols:3}],['dr-mir','Dresser 60" with mirror',60,20,32,{rows:3,cols:2,mirror:true}],['chest-5','Chest of drawers 36", 5 drawers',36,20,50,{rows:5,cols:1}],['lingerie','Lingerie chest 22"',22,16,52,{rows:7,cols:1}]])
  each({Oak:1,Walnut:1,White:1,Espresso:1},c=>D_(`${k}-${c}`.toLowerCase(),BR,'Dressers',`${lab}, ${c.toLowerCase()}`,'dresser',w,d,h,{wood:DWOOD[c],opt:{...o,front:DWOOD[c]},code:`DR${w}${o.cols||1}-${ab(c)}`}));
each({Oak:1,Walnut:1,White:1},c=>D_(`armoire-${c}`.toLowerCase(),BR,'Storage',`Armoire 48" x 24" x 78", ${c.toLowerCase()}`,'armoire',48,24,78,{wood:DWOOD[c]}));
each({White:1,Black:1},c=>D_(`vanitytable-${c}`.toLowerCase(),BR,'Storage',`Makeup vanity with mirror and stool, ${c.toLowerCase()}`,'vanitytable',42,18,30,{wood:DWOOD[c],col:DFAB.Blush}));
for(const [w,o] of [[48,{}],[60,{storage:true}]])each({Gray:1,Cream:1,Leather:1},c=>D_(`bench-${w}-${c}`.toLowerCase(),BR,'Benches',`Bed-end bench ${w}"${o.storage?', storage':''}, ${c.toLowerCase()}`,'bench',w,18,19,{col:DFAB[c],wood:DWOOD.Walnut,opt:o}));
// ---------- dining ----------
for(const [k,lab,w,d,n,o] of [['dt-36sq','Dining table 36" square, 4 chairs',36,36,4,{}],['dt-60x36','Dining table 60" x 36", 6 chairs',60,36,6,{}],['dt-72x40','Dining table 72" x 40", 6 chairs',72,40,6,{}],['dt-84x40','Dining table 84" x 40", 8 chairs',84,40,8,{}],['dt-96x42','Dining table 96" x 42", 8 chairs',96,42,8,{trestle:true}],['dt-108x44','Dining table 108" x 44", 10 chairs',108,44,10,{trestle:true}],
  ['dt-r42','Round dining table 42", 4 chairs',42,42,4,{shape:'round'}],['dt-r48','Round dining table 48", 4 chairs',48,48,4,{shape:'round'}],['dt-r60','Round dining table 60", 6 chairs',60,60,6,{shape:'round'}],['dt-oval','Oval dining table 72" x 42", 6 chairs',72,42,6,{shape:'oval',pedestal:false}]])
  each({Oak:1,Walnut:1,White:1,Black:1},c=>{D_(`${k}-${c}`.toLowerCase(),DN,'Dining sets',`${lab}, ${c.toLowerCase()}`,'table',w+36,d+36,30,{wood:DWOOD[c],col:DWOOD[c],opt:{...o,chairs:n,top:DWOOD[c]},code:`DS${w}${n}-${ab(c)}`});});
for(const [k,lab,w,d,o] of [['t-36sq','Dining table 36" square',36,36,{}],['t-60x36','Dining table 60" x 36"',60,36,{}],['t-72x40','Dining table 72" x 40"',72,40,{}],['t-96x42','Trestle table 96" x 42"',96,42,{trestle:true}],['t-r48','Round pedestal table 48"',48,48,{shape:'round'}],['t-r60','Round pedestal table 60"',60,60,{shape:'round'}],['t-metal','Metal-base table 72" x 36"',72,36,{metalBase:true}]])
  each({Oak:1,Walnut:1,White:1,Black:1},c=>D_(`${k}-${c}`.toLowerCase(),DN,'Tables',`${lab}, ${c.toLowerCase()}`,'table',w,d,30,{wood:DWOOD[c],opt:{...o,top:DWOOD[c]}}));
for(const [st,sn] of [['side','Side chair'],['upholstered','Upholstered dining chair'],['windsor','Windsor chair'],['parsons','Parsons chair']])each(st==='upholstered'||st==='parsons'?{Gray:1,Cream:1,Navy:1}:{Oak:1,Walnut:1,White:1,Black:1},c=>D_(`dc-${st}-${c}`.toLowerCase(),DN,'Chairs',`${sn}, ${c.toLowerCase()}`,'diningchair',18,20,36,{col:DFAB[c],wood:DWOOD[c]||DWOOD.Walnut,opt:{style:st}}));
for(const [h,n] of [[24,'Counter stool 24"'],[30,'Bar stool 30"']])for(const [k,o] of [['sq',{}],['back',{back:true,fabSeat:true}],['round',{round:true}],['round-uph',{round:true,fabSeat:true}]])
  each({Oak:1,Black:1,Walnut:1},c=>D_(`stool-${h}-${k}-${c}`.toLowerCase(),DN,'Stools',`${n}${o.back?', with back':''}${o.round?', round':''}${o.fabSeat?', upholstered':''}, ${c.toLowerCase()}`,'barstool',16,16,h,{wood:DWOOD[c],col:DFAB.Leather,metal:DMETAL['Matte black'],opt:o,code:`ST${h}${k.toUpperCase().slice(0,2)}-${ab(c)}`}));
for(const [w,o] of [[60,{}],[72,{}],[60,{hutch:true}],[72,{hutch:true}]])each({Oak:1,Walnut:1,White:1},c=>D_(`side-${w}${o.hutch?'h':''}-${c}`.toLowerCase(),DN,'Storage',`${o.hutch?'China cabinet with hutch':'Sideboard'} ${w}", ${c.toLowerCase()}`,'sideboard',w,18,34,{wood:DWOOD[c],opt:{...o,front:DWOOD[c]}}));
D_('barcart',DN,'Storage','Bar cart, brass and glass','barcart',30,16,32,{});
// ---------- office ----------
for(const [k,lab,w,d,o] of [['desk-48','Writing desk 48"',48,24,{}],['desk-60','Pedestal desk 60"',60,30,{style:'pedestal'}],['desk-72','Executive desk 72"',72,36,{style:'pedestal'}],['desk-hutch','Desk 60" with hutch',60,24,{style:'pedestal',hutch:true}],['desk-L','L-shaped desk 66" x 60"',66,60,{style:'L'}],['desk-stand','Standing desk 60"',60,30,{style:'standing'}]])
  each({Oak:1,Walnut:1,White:1,Espresso:1},c=>D_(`${k}-${c}`.toLowerCase(),OF,'Desks',`${lab}, ${c.toLowerCase()}`,'desk',w,d,o.style==='standing'?42:30,{wood:DWOOD[c],opt:o}));
each({Black:1,Gray:1,Leather:1},c=>D_(`ochair-${c}`.toLowerCase(),OF,'Chairs',`Office task chair, ${c.toLowerCase()}`,'officechair',26,26,40,{col:DFAB[c]}));
for(const [k,lab,w,d,h,n] of [['file-2','File cabinet, 2 drawer',15,22,28,2],['file-4','File cabinet, 4 drawer',15,26,52,4],['lat-2','Lateral file 36", 2 drawer',36,18,28,2],['lat-4','Lateral file 36", 4 drawer',36,18,52,4]])D_(k,OF,'Storage',lab,'filecab',w,d,h,{metal:0x6b7077,opt:{drawers:n}});
for(const [k,lab,w,d,h] of [['conf-8','Conference table 8\'',96,42,30],['conf-12','Conference table 12\'',144,48,30]])D_(k,OF,'Tables',lab+' with chairs','table',w+36,d+36,h,{wood:DWOOD.Walnut,opt:{chairs:Math.round(w/24)*2,chairFab:true,top:DWOOD.Walnut},col:DFAB.Black});
D_('computer',OF,'Equipment','Desktop computer and monitor','computer',24,12,18,{});D_('laptop',OF,'Equipment','Laptop','laptop',14,10,10,{});D_('printer',OF,'Equipment','Printer','soundbar',18,16,10,{});
// ---------- kids ----------
D_('toychest',KD,'Storage','Toy chest','toychest',36,18,20,{wood:DWOOD.White,col:DFAB.Blush});
D_('playkitchen',KD,'Play','Play kitchen','playkitchen',36,14,36,{});
D_('kidstable',KD,'Play','Kids table and 4 chairs','kidstable',60,60,20,{wood:DWOOD.White,opt:{chairs:4}});
D_('rockinghorse',KD,'Play','Rocking horse','rockinghorse',14,36,26,{});
for(const [c,v] of [['White',DWOOD.White],['Gray',DWOOD.Gray]])D_(`changer-${c}`.toLowerCase(),KD,'Nursery',`Changing table, ${c.toLowerCase()}`,'dresser',36,20,38,{wood:v,opt:{rows:3,cols:1,front:v}});
D_('glider',KD,'Nursery','Nursery glider','armchair',30,34,40,{col:DFAB.Cream,opt:{style:'swivel'}});
// ---------- bath accessories ----------
for(const [k,lab,w] of [['tb-18','Towel bar 18"',18],['tb-24','Towel bar 24"',24],['tb-30','Towel bar 30"',30]])each(DMETAL,(c,v)=>DW_(`${k}-${c}`.toLowerCase().replace(/ /g,''),BA,'Towel bars and rings',`${lab}, ${c.toLowerCase()}`,'towelbar',w,3,4,48,{metal:v,col:DFAB.White}));
each(DMETAL,(c,v)=>{const s=c.toLowerCase().replace(/ /g,'');DW_(`ring-${s}`,BA,'Towel bars and rings',`Towel ring, ${c.toLowerCase()}`,'towelring',8,3,8,44,{col:DFAB.White});DW_(`tp-${s}`,BA,'Paper holders and hooks',`Toilet paper holder, ${c.toLowerCase()}`,'tpholder',8,5,4,24);DW_(`hook-${s}`,BA,'Paper holders and hooks',`Robe hook, ${c.toLowerCase()}`,'robehook',2,3,3,66);});
for(const [w,h] of [[16,26],[20,26],[24,30]])DW_(`medcab-${w}`,BA,'Mirrors and cabinets',`Medicine cabinet ${w}" x ${h}", surface mount`,'medcab',w,5,h,48);
for(const [w,h] of [[24,30],[30,36],[36,36],[48,36],[60,36]])each({Black:0x2a2a2a,Brass:0xc8a45a,Nickel:0xb9bcbf},(c,v)=>DW_(`vmir-${w}-${c}`.toLowerCase(),BA,'Mirrors and cabinets',`Vanity mirror ${w}" x ${h}", ${c.toLowerCase()} frame`,'vanitymirror',w,1.5,h,40,{opt:{frame:v}}));
for(const [w,lab] of [[30,'Hinged shower door 30"'],[36,'Hinged shower door 36"'],[60,'Sliding glass tub door 60"']])DL_({id:`dc-sdoor-${w}`,cat:BA,sub:'Shower doors and rods',label:lab,place:'fixture',base:'decorwall',model:'showerdoor',w,d:2,h:72,elev:0});
DL_({id:'dc-srod-60',cat:BA,sub:'Shower doors and rods',label:'Shower rod and curtain 60"',place:'fixture',base:'decorwall',model:'showerrod',w:60,d:2,h:74,elev:0,col:DFAB.White});
each({White:1,Gray:1,Navy:1,Sage:1},c=>D_(`bathmat-${c}`.toLowerCase(),BA,'Rugs and hampers',`Bath mat 21" x 34", ${c.toLowerCase()}`,'bathmat',34,21,0.5,{col:DFAB[c]}));
D_('hamper',BA,'Rugs and hampers','Laundry hamper','hamper',18,14,24,{});
each({White:1,Espresso:1},c=>D_(`overtoilet-${c}`.toLowerCase(),BA,'Storage',`Over-the-toilet shelf, ${c.toLowerCase()}`,'overtoilet',24,9,64,{wood:DWOOD[c]}));
// ---------- laundry, utility, garage ----------
for(const [w,d,h] of [[36,14,72],[48,18,72],[48,24,72],[60,24,72]])D_(`wire-${w}x${d}`,GA,'Shelving',`Wire shelving ${w}" x ${d}" x ${h}"`,'wireshelf',w,d,h,{opt:{n:5}});
for(const [w,d] of [[60,24],[72,24],[96,24]])D_(`bench-wk-${w}`,GA,'Workshop',`Workbench ${w}" with pegboard`,'workbench',w,d,36,{wood:DWOOD.Natural});
for(const [c,v] of [['Red',0xc0392b],['Black',0x222222],['Blue',0x1f4f8a]])D_(`toolchest-${c}`.toLowerCase(),GA,'Workshop',`Rolling tool chest 41", ${c.toLowerCase()}`,'toolchest',41,24,48,{opt:{c:v}});
for(const [c,v] of [['Blue',0x1f5fbf],['Red',0xc0392b],['Black',0x222222]])D_(`bike-${c}`.toLowerCase(),GA,'Vehicles and sports',`Bicycle, ${c.toLowerCase()}`,'bike',24,70,40,{opt:{c:v}});
D_('motorcycle',GA,'Vehicles and sports','Motorcycle','motorcycle',32,86,46,{});
for(const [c,v] of [['Orange',0xe8732a],['Yellow',0xf2c230],['Green',0x2e8b57]])D_(`kayak-${c}`.toLowerCase(),GA,'Vehicles and sports',`Kayak 10', ${c.toLowerCase()}`,'kayak',30,120,14,{opt:{c:v}});
for(const [k,lab,c] of [['trash','Trash cart 96 gal',0x2f4f2f],['recycle','Recycling cart 96 gal',0x1f4f8a]])D_(k,GA,'Bins',lab,'trashbin',26,33,46,{opt:{c}});
D_('ironboard',LU,'Laundry','Ironing board','ironboard',54,15,36,{col:DFAB.Gray});D_('dryrack',LU,'Laundry','Folding drying rack','dryrack',30,24,40,{});D_('hamper-lu',LU,'Laundry','Laundry hamper','hamper',18,14,24,{});
for(const [w,d] of [[36,14],[48,18]])D_(`wire-lu-${w}`,LU,'Shelving',`Utility wire shelf ${w}" x ${d}" x 72"`,'wireshelf',w,d,72,{opt:{n:5}});
// ---------- lighting and fans ----------
for(const [w,b] of [[42,4],[44,5],[52,5],[60,3],[72,6]])each({'Matte black':1,'Brushed nickel':1,Bronze:1,White:1},c=>{const m=DMETAL[c]??0xf0f0f0;const bl=c==='White'?0xf0eee9:c==='Brushed nickel'?0x8a8f96:0x6b4f36;
  DC_(`fan-${w}-${c}`.toLowerCase().replace(/ /g,''),LT,'Ceiling fans',`Ceiling fan ${w}", ${b} blades, with light, ${c.toLowerCase()}`,'ceilfan',w,w,16,{metal:m,opt:{blades:b,blade:bl},code:`CF${w}${b}-${ab(c)}`});});
DC_('fan-52-nolight',LT,'Ceiling fans','Ceiling fan 52", no light, matte black','ceilfan',52,52,14,{metal:DMETAL['Matte black'],opt:{blades:5,light:false}});
for(const [st,sn,w,h,o] of [['candle','Candle chandelier, 6 arms',28,26,{arms:6}],['candle8','Candle chandelier, 8 arms',34,30,{arms:8}],['drum','Drum chandelier',24,22,{style:'drum'}],['linear','Linear chandelier 40"',40,16,{style:'linear'}],['lantern','Lantern chandelier',20,30,{style:'lantern'}]])
  each({'Matte black':1,Brass:1,'Brushed nickel':1,Bronze:1},c=>DC_(`chand-${st}-${c}`.toLowerCase().replace(/ /g,''),LT,'Chandeliers',`${sn}, ${c.toLowerCase()}`,'chandelier',w,st==='linear'?8:w,h+18,{metal:DMETAL[c],opt:{style:o.style||'candle',...o},code:`CH${ab(st)}-${ab(c)}`}));
for(const [st,sn,w] of [['globe','Globe pendant',12],['cone','Cone pendant',12],['lantern','Lantern pendant',10],['drum','Drum pendant',16]])each({'Matte black':1,Brass:1,'Brushed nickel':1},c=>DC_(`pend-${st}-${c}`.toLowerCase().replace(/ /g,''),LT,'Pendants',`${sn} ${w}", ${c.toLowerCase()}`,'pendant',w,w,30,{metal:DMETAL[c],opt:{style:st}}));
for(const [w,h] of [[11,6],[13,6],[16,8]])each({White:1,'Brushed nickel':1,'Matte black':1},c=>DC_(`flush-${w}-${c}`.toLowerCase().replace(/ /g,''),LT,'Flush mounts',`Flush mount ${w}", ${c.toLowerCase()}`,'flushlight',w,w,h,{metal:DMETAL[c]??0xf0f0f0}));
for(const [st,sn,h] of [['drum','Floor lamp, drum shade',62],['arc','Arc floor lamp',78],['tripod','Tripod floor lamp',60],['torchiere','Torchiere floor lamp',70]])each({'Matte black':1,Brass:1,'Brushed nickel':1},c=>D_(`flamp-${st}-${c}`.toLowerCase().replace(/ /g,''),LT,'Lamps',`${sn}, ${c.toLowerCase()}`,'floorlamp',st==='arc'?20:16,st==='arc'?60:16,h,{metal:DMETAL[c],wood:DWOOD.Walnut,opt:{style:st}}));
for(const [c,v] of [['Blue',0x5b7f8f],['White',0xf0eee9],['Green',0x6f8f5a],['Amber',0xc88a3a]])D_(`tlamp-${c}`.toLowerCase(),LT,'Lamps',`Table lamp 26", ${c.toLowerCase()} base`,'tablelamp',15,15,26,{metal:DMETAL.Brass,opt:{base:v}});
for(const [k,lab,w,h,o] of [['sconce','Wall sconce',6,12,{}],['bar2','Vanity light, 2 lights',16,8,{bar:true,lights:2}],['bar3','Vanity light, 3 lights',24,8,{bar:true,lights:3}],['bar4','Vanity light, 4 lights',32,8,{bar:true,lights:4}]])each({'Matte black':1,Brass:1,'Brushed nickel':1,Chrome:1},c=>DW_(`${k}-${c}`.toLowerCase().replace(/ /g,''),LT,'Sconces and vanity lights',`${lab}, ${c.toLowerCase()}`,'sconce',w,8,h,o.bar?78:66,{metal:DMETAL[c],opt:o}));
// ---------- decor and window treatments ----------
for(const [w,d] of [[60,36],[96,60],[120,96],[144,108],[96,30]])each({Cream:1,Gray:1,Navy:1,Rust:1,Sage:1},c=>D_(`rug-${w}x${d}-${c}`.toLowerCase(),DE,'Rugs',`Area rug ${w/12}' x ${d/12}', ${c.toLowerCase()}`,'rug',w,d,0.5,{col:DFAB[c],opt:{pattern:(w+d)%3===0,border:c==='Cream'?0x8a6a4a:0xe9e1cf},code:`RG${w/12}${d/12}-${ab(c)}`}));
for(const r of [60,72,96])each({Cream:1,Gray:1,Navy:1},c=>D_(`rug-r${r}-${c}`.toLowerCase(),DE,'Rugs',`Round rug ${r/12}', ${c.toLowerCase()}`,'rug',r,r,0.5,{col:DFAB[c],opt:{shape:'round'}}));
for(const w of [36,48,60,72,96])each({White:1,Gray:1,Navy:1,Sage:1,Cream:1},c=>DW_(`curtain-${w}-${c}`.toLowerCase(),DE,'Curtains and blinds',`Curtain panels and rod for ${w}" window, ${c.toLowerCase()}`,'curtain',w+12,6,96,0,{col:DFAB[c],metal:DMETAL['Matte black']}));
for(const w of [24,30,36,48,60])DW_(`blinds-${w}`,DE,'Curtains and blinds',`Horizontal blinds ${w}" x 60"`,'blinds',w,2.5,60,24);
for(const [k,lab,w,h,o] of [['art-s','Framed art 16" x 20"',16,20,{mat:true}],['art-m','Framed art 24" x 36"',24,36,{}],['art-l','Framed art 36" x 48"',36,48,{}],['art-xl','Canvas art 48" x 60"',48,60,{frame:0xeeeae2}],['art-pano','Panoramic art 60" x 24"',60,24,{}]])
  for(const [pn,pal] of [['Coastal',[0x8fb3c7,0xe6dccb,0x2f6f73,0xf0eee9]],['Warm abstract',[0xb84a3a,0xd9b26a,0x5a4632,0xe6dccb]],['Botanical',[0x3f7a3a,0x8fa58a,0xe6dccb,0x6f8f5a]],['Modern',[0x26272a,0xf0eee9,0xc8a45a,0x8d9196]]])
    DW_(`${k}-${pn}`.toLowerCase().replace(/ /g,''),DE,'Wall art',`${lab}, ${pn.toLowerCase()}`,'art',w,1.5,h,60-h/2,{opt:{...o,palette:pal}});
for(const [k,lab,w,h,o] of [['mir-rect','Wall mirror 30" x 40"',30,40,{}],['mir-round','Round mirror 30"',30,30,{shape:'round'}],['mir-round36','Round mirror 36"',36,36,{shape:'round'}],['mir-arch','Arched mirror 24" x 40"',24,40,{shape:'arch'}],['mir-floor','Floor mirror 24" x 66"',24,66,{floor:true}]])
  each({Gold:0xc8a45a,Black:0x2a2a2a,Wood:0x8a6a4a},(c,v)=>DW_(`${k}-${c}`.toLowerCase(),DE,'Mirrors',`${lab}, ${c.toLowerCase()} frame`,'mirror',w,1.5,h,o.floor?0:60-h/2,{opt:{...o,frame:v}}));
DW_('clock-24',DE,'Accents','Wall clock 24"','clock',24,2,24,60);
for(const n of [1,3])each({Oak:1,Walnut:1,White:1},c=>DW_(`wshelf-${n}-${c}`.toLowerCase(),DE,'Accents',`Floating shelf 36"${n>1?' x 3':''}, ${c.toLowerCase()}`,'wallshelf',36,10,n*14,50,{wood:DWOOD[c],opt:{n}}));
for(const [c,v] of [['Blue',0x5b7f8f],['White',0xf0eee9],['Terracotta',0xb8653a]]){D_(`vase-${c}`.toLowerCase(),DE,'Accents',`Floor vase 24", ${c.toLowerCase()}`,'vase',10,10,24,{opt:{c:v}});D_(`vasef-${c}`.toLowerCase(),DE,'Accents',`Vase with flowers 14", ${c.toLowerCase()}`,'vase',7,7,14,{opt:{c:v,stems:true}});}
// ---------- indoor plants ----------
for(const [k,lab,w,h,o] of [['fig','Fiddle-leaf fig',30,72,{kind:'tree'}],['fig5','Fiddle-leaf fig, 5\'',24,60,{kind:'tree'}],['olive','Olive tree',28,66,{kind:'tree'}],['ficus','Ficus tree',30,72,{kind:'tree'}],['palm','Areca palm',36,72,{kind:'palm'}],['kentia','Kentia palm',40,84,{kind:'palm'}],['bird','Bird of paradise',36,72,{kind:'monstera'}],['monstera','Monstera',36,48,{kind:'monstera'}],
  ['snake','Snake plant',16,36,{kind:'snake'}],['zz','ZZ plant',20,30,{kind:'bush'}],['pothos','Pothos, hanging',18,30,{kind:'hanging'}],['fern','Boston fern, hanging',22,30,{kind:'hanging'}],['peace','Peace lily',20,28,{kind:'flower',flower:0xf7f7f2}],['orchid','Orchid',10,22,{kind:'flower',flower:0xd98bc0,potScale:0.4}],
  ['succ','Succulent bowl',12,8,{kind:'succulent',potScale:0.45}],['herb','Herb pot',8,10,{kind:'bush',potScale:0.45}],['rubber','Rubber plant',24,48,{kind:'bush'}],['cactus','Cactus',14,36,{kind:'snake',leaf:0x4f8a4a}]])
  for(const [pc,pv] of [['Terracotta',0xb8653a],['White',0xf0eee9],['Black',0x2a2a2a]])D_(`pl-${k}-${pc}`.toLowerCase(),PL,'Plants',`${lab}, ${pc.toLowerCase()} pot`,'plant',w,w,h,{pot:pv,leaf:o.leaf,opt:o,code:`PL${ab(k)}${h}-${ab(pc)}`});
// ---------- outdoor living ----------
for(const [k,lab,w,d,n,o] of [['patio-r48','Patio table 48" round with 4 chairs',48,48,4,{shape:'round',metalBase:true,glass:true}],['patio-r60','Patio table 60" round with 6 chairs',60,60,6,{shape:'round',metalBase:true}],['patio-72','Patio table 72" x 40" with 6 chairs',72,40,6,{metalBase:true}],['patio-bistro','Bistro set, 2 chairs',24,24,2,{shape:'round',metalBase:true}]])
  each({Black:1,Teak:1},c=>D_(`${k}-${c}`.toLowerCase(),OL,'Patio dining',`${lab}, ${c.toLowerCase()}`,'patioset',w+36,d+36,30,{wood:c==='Teak'?0xa57a4a:DWOOD.Black,metal:c==='Teak'?0xa57a4a:DMETAL['Matte black'],opt:{...o,chairs:n,top:c==='Teak'?0xa57a4a:0x2a2a2a}}));
each({Gray:1,Cream:1,Navy:1},c=>{D_(`osofa-${c}`.toLowerCase(),OL,'Patio seating',`Outdoor sofa 80", ${c.toLowerCase()} cushions`,'sofa',80,34,32,{col:DFAB[c],wood:0xa57a4a,opt:{style:'track'}});D_(`ochair2-${c}`.toLowerCase(),OL,'Patio seating',`Outdoor lounge chair, ${c.toLowerCase()} cushions`,'armchair',32,34,30,{col:DFAB[c],opt:{style:'club'}});D_(`olounge-${c}`.toLowerCase(),OL,'Patio seating',`Chaise lounger, ${c.toLowerCase()}`,'lounge',26,78,36,{col:DFAB[c]});});
each({White:1,Natural:1,Teal:1,Red:1},c=>D_(`adk-${c}`.toLowerCase(),OL,'Patio seating',`Adirondack chair, ${c.toLowerCase()}`,'adirondack',30,36,38,{wood:{White:DWOOD.White,Natural:DWOOD.Natural,Teal:DFAB.Teal,Red:0xa5323a}[c]}));
D_('porchswing',OL,'Patio seating','Porch swing 60" (hangs from beam)','porchswing',60,24,96,{wood:DWOOD.White});
D_('hammock',OL,'Patio seating','Hammock with stand','hammock',150,48,48,{col:DFAB.Cream});
for(const [k,lab,w,o] of [['bench-o','Garden bench 60"',60,{}],['bench-ob','Garden bench 60" with back',60,{back:true}]])D_(k,OL,'Patio seating',lab,'bench_out',w,18,18,{wood:0xa57a4a,opt:o});
for(const w of [96,108,132])each({Cream:1,Navy:1,Teal:1},c=>D_(`umb-${w}-${c}`.toLowerCase(),OL,'Shade',`Patio umbrella ${w/12}', ${c.toLowerCase()}`,'umbrella',w,w,96,{col:DFAB[c]}));
for(const [k,lab,w,d] of [['grill-3','Gas grill, 3 burner',54,24],['grill-5','Gas grill, 5 burner',66,26]])D_(k,OL,'Cooking',lab,'grill',w,d,48,{});
for(const w of [96,120,144])D_(`okitchen-${w}`,OL,'Cooking',`Outdoor kitchen island ${w/12}'`,'outdoorkitchen',w,32,36,{});
for(const [k,lab,w,o] of [['fp-r36','Fire pit 36" round',36,{}],['fp-r48','Fire pit 48" round',48,{}],['fp-sq','Fire pit 42" square',42,{square:true}],['fp-tbl','Fire table 48" round',48,{table:true}]])D_(k,OL,'Fire features',lab,'firepit',w,w,o.table?24:16,{opt:o});
for(const [k,lab,w,d] of [['tub-7','Hot tub 7\' x 7\'',84,84],['tub-8','Hot tub 8\' x 8\'',96,96]])D_(k,OL,'Spa',lab,'hottub',w,d,36,{});
for(const [w,d] of [[120,120],[144,120],[144,144],[192,144]])D_(`pergola-${w}x${d}`,OL,'Shade',`Pergola ${w/12}' x ${d/12}'`,'pergola',w,d,108,{wood:DWOOD.Natural});
for(const [w,d,h] of [[24,24,24],[36,12,18],[48,18,24],[16,16,18]])D_(`planter-${w}x${d}`,OL,'Planters and water',`Planter box ${w}" x ${d}"`,'planter',w,d,h,{pot:0x6f6a62});
D_('fountain',OL,'Planters and water','Tiered fountain','fountain',42,42,60,{});D_('birdbath',OL,'Planters and water','Birdbath','birdbath',22,22,28,{});
// ---------- games and fitness ----------
for(const [k,lab,w,d] of [['pool-7','Pool table 7\'',80,44],['pool-8','Pool table 8\'',88,49]])D_(k,GF,'Games',`${lab} (allow 5' cue room each side)`,'pooltable',w,d,31,{wood:DWOOD.Walnut});
D_('pingpong',GF,'Games','Table tennis table','pingpong',108,60,30,{});D_('gametable',GF,'Games','Card table 36" with 4 chairs','gametable',72,72,30,{wood:DWOOD.Walnut,opt:{chairs:4,shape:'round',chairFab:true},col:DFAB.Black});
D_('treadmill',GF,'Fitness','Treadmill','treadmill',34,78,58,{});D_('exbike',GF,'Fitness','Exercise bike','exbike',24,48,48,{});D_('weightbench',GF,'Fitness','Weight bench with rack','weightbench',72,56,48,{col:DFAB.Black});
// ---------- electronics ----------
for(const tv of [43,50,55,65,75,85]){const w=Math.round(tv*0.872),h=Math.round(tv*0.49);D_(`tv-${tv}`,EL,'TVs',`TV ${tv}" on stand`,'tv',w,10,h+4,{});DW_(`tvw-${tv}`,EL,'TVs',`TV ${tv}", wall mounted`,'tvwall',w,3,h,60-h/2,{});}
D_('soundbar',EL,'Audio','Soundbar 36"','soundbar',36,4,3,{});for(const h of [36,42])D_(`spk-${h}`,EL,'Audio',`Tower speaker ${h}"`,'speaker',9,12,h,{});
// ---------- people and pets (scale figures) ----------
for(const [k,lab,o] of [['man','Man, 5\'10"',{kind:'man',shirt:0x3d5a80}],['woman','Woman, 5\'5"',{kind:'woman',shirt:0xa5563a}],['man2','Man, 6\'',{kind:'man',shirt:0x2f6f73,skin:0x8d5a3b}],['woman2','Woman, 5\'4"',{kind:'woman',shirt:0x6a4c93,skin:0xe0b89a,hair:0xb8873a}]])D_(`pp-${k}`,PP,'People',lab,'person',20,12,k==='man'?70:k==='man2'?72:k==='woman'?65:64,{opt:o});
D_('pp-child',PP,'People','Child, 4\'','person',14,9,48,{opt:{kind:'man',shirt:0xf2c230}});D_('pp-wc',PP,'People','Person in wheelchair (30" x 48" clear space)','person',30,48,52,{opt:{kind:'wheelchair'}});
D_('pp-dog-l',PP,'Pets','Large dog','dog',12,36,26,{});D_('pp-dog-s',PP,'Pets','Small dog','dog',8,18,12,{opt:{c:0x3b2b1e}});D_('pp-cat',PP,'Pets','Cat','cat',6,16,10,{opt:{c:0x8d9196}});
}
// ---------- plan symbols ----------
{const _fs=fxPlanSymbol;fxPlanSymbol=function(f,S,cls){const it=f.lib&&LIB_BY_ID[f.lib];const k=it&&it.model;if(!k||!DECOR_MODELS[k])return _fs(f,S,cls);
  const P=(lx,ly)=>{const q=fxLocal(f,lx,ly);return S(q.x,q.y);};const pts=a=>a.map(([x,y])=>P(x,y).join(',')).join(' ');const W=f.w/2,D=f.d/2;const out=[];let n=0;
  const rect=(x0,y0,x1,y1,c=cls)=>out.push(html`<polygon key=${'r'+n++} points=${pts([[x0,y0],[x1,y0],[x1,y1],[x0,y1]])} className=${c}/>`);
  const ell=(cx,cy,rx,ry,c=cls,seg=24)=>{const a=[];for(let i=0;i<seg;i++){const t=i/seg*Math.PI*2;a.push([cx+rx*Math.cos(t),cy+ry*Math.sin(t)]);}out.push(html`<polygon key=${'e'+n++} points=${pts(a)} className=${c}/>`);};
  const ln=(a,b,c=cls)=>{const A=P(...a),B=P(...b);out.push(html`<line key=${'l'+n++} x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className=${c}/>`);};
  const chairAt=(u,v,face)=>{rect(u-8,v-8,u+8,v+8);ln([u-8,v-face*7],[u+8,v-face*7]);};
  const o=it.opt||{};const dash=cls+' fx-dash';
  switch(k){
    case 'bed':case 'daybed':case 'crib':rect(-W,-D,W,D);if(k!=='crib'){const pw=W>30?W-6:W*2-12;for(const s of (W>30?[-1,1]:[0]))rect(s*(W/2)-pw/2+(W>30?0:0),-D+4,s*(W/2)+pw/2,-D+14);ln([-W,-D+22],[W,-D+22]);ln([-W,-D+22],[W*0.2,D]);}break;
    case 'bunk':rect(-W,-D,W,D);ln([-W,-D],[W,D]);ln([W,-D],[-W,D]);break;
    case 'sofa':case 'recliner':case 'armchair':{const arm=Math.min(7,W/5);rect(-W,-D,W,D);rect(-W+arm,-D+8,W-arm,D);const c=Math.max(1,Math.round((f.w-2*arm)/26));for(let i=1;i<c;i++){const u=-W+arm+(f.w-2*arm)*i/c;ln([u,-D+8],[u,D]);}break;}
    case 'sectional':{const dep=o.depth||38;const s=o.side==='L'?-1:1;rect(-W,-D,W,-D+dep);rect(s>0?W-dep:-W,-D+dep,s>0?W:-W+dep,D);ln([-W,-D+9],[W,-D+9]);break;}
    case 'chaise':case 'lounge':rect(-W,-D,W,D);ln([-W,-D+18],[W,-D+18]);break;
    case 'ottoman':case 'beanbag':if(o.round||k==='beanbag')ell(0,0,W,D);else rect(-W,-D,W,D);break;
    case 'table':case 'patioset':case 'gametable':case 'kidstable':{const round=o.shape==='round'||o.shape==='oval';const nC=o.chairs||0;const tw=nC?W-18:W,td=nC?D-18:D;
      if(round){const tr=tw,trd=td;ell(0,0,tr,trd);for(let i=0;i<nC;i++){const a=i/nC*Math.PI*2;const u=Math.cos(a)*(tr+5),v=Math.sin(a)*(trd+5);ell(u,v,8,8);}}
      else{rect(-tw,-td,tw,td);if(nC){const ends=(nC>=6||(nC===4&&f.w>=90))?2:0;const per=Math.ceil((nC-ends)/2);for(const sg of [-1,1])for(let i=0;i<per;i++)chairAt(-tw+2*tw*(i+0.5)/per,sg*(td+6),-sg);if(ends)for(const sg of [-1,1])rect(sg*(tw+6)-8,-8,sg*(tw+6)+8,8);}}break;}
    case 'diningchair':case 'officechair':case 'adirondack':rect(-W,-D,W,D);ln([-W,-D+3],[W,-D+3]);break;
    case 'barstool':ell(0,0,W,D);break;
    case 'coffee':case 'endtable':case 'console':if(o.shape==='round'||o.round)ell(0,0,W,D);else rect(-W,-D,W,D);break;
    case 'desk':if(o.style==='L'){rect(-W,-D,W,-D+24);rect(W-24,-D+24,W,D);}else rect(-W,-D,W,D);ell(0,D+10,9,9);break;
    case 'rug':case 'bathmat':if(o.shape==='round')ell(0,0,W,D,dash,40);else{rect(-W,-D,W,D,dash);rect(-W+5,-D+5,W-5,D-5,dash);}break;
    case 'plant':{ell(0,0,W*0.35,W*0.35);for(let i=0;i<8;i++){const a=i/8*Math.PI*2,b=a+0.35;ln([Math.cos(a)*W*0.35,Math.sin(a)*W*0.35],[Math.cos(b)*W*0.95,Math.sin(b)*W*0.95]);}ell(0,0,W*0.95,W*0.95,dash,16);break;}
    case 'planter':rect(-W,-D,W,D);for(let i=0;i<4;i++)ell(-W/2+(i%2)*W,-D/2+Math.floor(i/2)*D,Math.min(W,D)*0.3,Math.min(W,D)*0.3);break;
    case 'ceilfan':{ell(0,0,W,W,dash,32);ell(0,0,4,4);const b=o.blades||5;for(let i=0;i<b;i++){const a=i/b*Math.PI*2;ln([Math.cos(a)*4,Math.sin(a)*4],[Math.cos(a)*W*0.95,Math.sin(a)*W*0.95]);}break;}
    case 'chandelier':case 'pendant':case 'flushlight':{if(o.style==='linear'){rect(-W,-D,W,D,dash);}else ell(0,0,W,D,dash,24);ln([-W*0.5,0],[W*0.5,0]);ln([0,-D*0.5],[0,D*0.5]);break;}
    case 'floorlamp':case 'tablelamp':{const r=Math.min(W,8);const cy=k==='floorlamp'&&o.style==='arc'?D-10:0;ell(0,cy,r,r);ln([-r,cy-r],[r,cy+r]);ln([r,cy-r],[-r,cy+r]);if(cy)ell(0,-D+6,6,6);break;}
    case 'umbrella':ell(0,0,W,D,dash,8);ell(0,0,2,2);break;
    case 'firepit':case 'fountain':case 'birdbath':if(o.square)rect(-W,-D,W,D);else ell(0,0,W,D);ell(0,0,W*0.6,D*0.6);break;
    case 'hottub':rect(-W,-D,W,D);rect(-W+4,-D+4,W-4,D-4);ell(-W/2,-D/2,6,6);break;
    case 'pergola':{rect(-W,-D,W,D,dash);for(const a of [-1,1])for(const b of [-1,1])rect(a*(W-3)-3,b*(D-3)-3,a*(W-3)+3,b*(D-3)+3);const m=Math.round(f.w/16);for(let i=0;i<m;i++){const u=-W+f.w*(i+0.5)/m;ln([u,-D],[u,D],dash);}break;}
    case 'pooltable':rect(-W,-D,W,D);rect(-W+5,-D+5,W-5,D-5);for(const a of [-1,0,1])for(const b of [-1,1])ell(a*(W-5),b*(D-5),1.8,1.8);rect(-W-60,-D-60,W+60,D+60,dash);break;
    case 'pingpong':rect(-W,-D,W,D);ln([0,-D-3],[0,D+3]);ln([-W,0],[W,0]);break;
    case 'person':case 'dog':case 'cat':ell(0,0,W,D,cls);if(k==='person'&&o.kind!=='wheelchair')ell(0,0,W*0.4,D*0.6);break;
    case 'bike':case 'motorcycle':case 'kayak':ell(0,0,W,D);break;
    case 'curtain':case 'blinds':case 'showerrod':rect(-W,-D,W,D,dash);break;
    case 'showerdoor':rect(-W,-D,W,D);ln([-W,D],[-W+f.w*0.7,D+f.w*0.7*0.5],dash);break;
    default:rect(-W,-D,W,D,WALL_HUNG.has(f.type)?dash:cls);if(f.w>=14&&f.d>=10&&!WALL_HUNG.has(f.type)){ln([-W,-D],[W,D],cls+' fx-thin');}
  }
  return out;};}
// flat items (rugs, mats): picture from above so they show
{const _pj=picJob;picJob=function(kind,obj,p,opts={}){const j=_pj(kind,obj,p,opts);if(j&&j.focus&&(kind==='fixture'||obj.place==='fixture')&&(obj.h||0)<=2){const f=j.focus,m=Math.max(f.w||obj.w||48,obj.d||48);return {q:j.q,cam:{pos:[f.x,m*1.25,f.y+m*0.75],tgt:[f.x,0,f.y]}};}return j;};}
