/* ======================= construction library (catalog data) ======================= */
// Every item says how it goes into the model ("place"):
//   fixture: a box on plan drawn like its base fixture type   door / window: an opening preset
//   wall: a wall assembly        trim: a molding profile       ceiling / wallfin / floor / roof / siding: a finish
//   color: a paint or material color
// Sizes are common US stock sizes in inches. Names are generic descriptions, not brands.
const LIB=[];
const L_=(o)=>{LIB.push(o);return o;};
const fi=x=>{const f=Math.floor(x);const r=x-f;const fr=r>0.6?'-3/4':r>0.4?'-1/2':r>0.1?'-1/4':'';return f+fr;};

/* ---- doors ---- */
const DOOR_TYPES={swing:'Swing',double:'Double swing',slider:'Sliding',pocket:'Pocket',bifold:'Bifold',barn:'Barn (surface slider)',overhead:'Overhead garage'};
const DOOR_STYLES={flush:'Flush',panel6:'6-panel',panel2:'2-panel',shaker:'Shaker 1-panel',panel5:'5-panel shaker',louver:'Louvered',halflite:'Half-lite glass',fulllite:'Full-lite glass',french:'French (10- or 15-lite)',sixlite:'6-lite craftsman',plank:'Plank / barn',metal:'Hollow metal',storefront:'Aluminum storefront',garage:'Raised-panel garage',garageglass:'Garage with window row'};
for(const s of ['flush','panel6','panel2','shaker','panel5'])for(const w of [24,28,30,32,36])L_({id:`d-int-${s}-${w}`,cat:'Doors',sub:'Interior swing',label:`${DOOR_STYLES[s]} interior door ${w}" x 80"`,place:'door',width:w,height:80,dtype:'swing',style:s});
for(const w of [24,30,32,36])L_({id:`d-int-louver-${w}`,cat:'Doors',sub:'Interior swing',label:`Louvered door ${w}" x 80"`,place:'door',width:w,height:80,dtype:'swing',style:'louver'});
for(const s of ['panel6','shaker','halflite','fulllite','sixlite','panel2'])for(const w of [32,36])L_({id:`d-ext-${s}-${w}`,cat:'Doors',sub:'Exterior entry',label:`${DOOR_STYLES[s]} exterior entry door ${w}" x 80"`,place:'door',width:w,height:80,dtype:'swing',style:s,ext:true});
for(const w of [36,42])L_({id:`d-ext-8ft-${w}`,cat:'Doors',sub:'Exterior entry',label:`Tall entry door ${w}" x 96"`,place:'door',width:w,height:96,dtype:'swing',style:'shaker',ext:true});
L_({id:'d-ada-36',cat:'Doors',sub:'Accessible',label:'Accessible door 36" x 80", lever, 1/2" max threshold',place:'door',width:36,height:80,dtype:'swing',style:'shaker',ada:true});
L_({id:'d-ada-42',cat:'Doors',sub:'Accessible',label:'Accessible wide door 42" x 80"',place:'door',width:42,height:80,dtype:'swing',style:'shaker',ada:true});
L_({id:'d-ada-pocket-36',cat:'Doors',sub:'Accessible',label:'Accessible pocket door 36" x 80", D-pull',place:'door',width:36,height:80,dtype:'pocket',style:'shaker',ada:true});
for(const w of [48,60,72])L_({id:`d-french-${w}`,cat:'Doors',sub:'French and double',label:`French double door ${w}" x 80"`,place:'door',width:w,height:80,dtype:'double',style:'french'});
for(const w of [48,60,64,72])L_({id:`d-dbl-${w}`,cat:'Doors',sub:'French and double',label:`Double interior door ${w}" x 80" (closet or pantry)`,place:'door',width:w,height:80,dtype:'double',style:'panel6'});
for(const w of [60,72,96])L_({id:`d-patio-${w}`,cat:'Doors',sub:'Sliding patio',label:`Sliding patio door ${w}" x 80"`,place:'door',width:w,height:80,dtype:'slider',style:'fulllite',ext:true});
L_({id:'d-patio-144',cat:'Doors',sub:'Sliding patio',label:'Multi-slide patio door 144" x 96"',place:'door',width:144,height:96,dtype:'slider',style:'fulllite',ext:true});
for(const w of [24,28,30,32,36])L_({id:`d-pocket-${w}`,cat:'Doors',sub:'Pocket',label:`Pocket door ${w}" x 80"`,place:'door',width:w,height:80,dtype:'pocket',style:'shaker'});
for(const w of [24,30,36,48,60,72])L_({id:`d-bifold-${w}`,cat:'Doors',sub:'Bifold closet',label:`Bifold closet door ${w}" x 80"`,place:'door',width:w,height:80,dtype:'bifold',style:w>=48?'louver':'panel6'});
for(const w of [36,42,48])L_({id:`d-barn-${w}`,cat:'Doors',sub:'Barn',label:`Barn door ${w}" x 84" on surface track`,place:'door',width:w,height:84,dtype:'barn',style:'plank'});
for(const [w,h] of [[96,84],[108,84],[192,84],[216,84],[96,96],[192,96],[120,120],[144,144]])L_({id:`d-gar-${w}x${h}`,cat:'Doors',sub:'Garage and overhead',label:`Overhead door ${w/12}' x ${h/12}'`,place:'door',width:w,height:h,dtype:'overhead',style:w>=120&&h>=120?'metal':'garage',ext:true});
L_({id:'d-gar-glass-192',cat:'Doors',sub:'Garage and overhead',label:'Overhead door 16\' x 7\' with window row',place:'door',width:192,height:84,dtype:'overhead',style:'garageglass',ext:true});
for(const w of [36,42])L_({id:`d-hm-${w}`,cat:'Doors',sub:'Commercial',label:`Hollow metal door ${w}" x 84" in steel frame`,place:'door',width:w,height:84,dtype:'swing',style:'metal',ext:true});
L_({id:'d-hm-pair-72',cat:'Doors',sub:'Commercial',label:'Pair of hollow metal doors 72" x 84"',place:'door',width:72,height:84,dtype:'double',style:'metal',ext:true});
L_({id:'d-sf-36',cat:'Doors',sub:'Commercial',label:'Storefront entry door 36" x 84"',place:'door',width:36,height:84,dtype:'swing',style:'storefront',ext:true});
L_({id:'d-sf-72',cat:'Doors',sub:'Commercial',label:'Storefront pair 72" x 84"',place:'door',width:72,height:84,dtype:'double',style:'storefront',ext:true});
L_({id:'d-sf-36-96',cat:'Doors',sub:'Commercial',label:'Storefront entry door 36" x 96"',place:'door',width:36,height:96,dtype:'swing',style:'storefront',ext:true});

/* ---- windows ---- */
const WIN_SIZES={'double-hung':[[24,36],[24,48],[28,54],[30,48],[30,54],[30,60],[32,60],[34,62],[36,48],[36,54],[36,60],[36,72],[40,60],[44,62]],
  'single-hung':[[24,36],[24,48],[30,48],[32,60],[36,48],[36,60],[36,72]],'casement':[[18,36],[24,36],[24,48],[24,60],[30,48],[30,60],[36,48]],
  'slider':[[36,24],[48,24],[48,36],[60,36],[60,48],[72,48]],'awning':[[24,20],[36,20],[36,24],[48,24],[60,24]],'hopper':[[32,16],[32,20],[32,24]],
  'fixed':[[24,48],[36,36],[48,48],[60,48],[60,60],[72,48],[72,60],[96,60]]};
const WIN_NAMES={'double-hung':'Double-hung','single-hung':'Single-hung','casement':'Casement','slider':'Sliding','awning':'Awning','hopper':'Basement hopper','fixed':'Picture (fixed)'};
for(const [op,list] of Object.entries(WIN_SIZES))for(const [w,h] of list)L_({id:`w-${op}-${w}x${h}`,cat:'Windows',sub:WIN_NAMES[op],label:`${WIN_NAMES[op]} window ${w}" x ${h}"`,place:'window',width:w,height:h,operation:op,sill:op==='hopper'?60:op==='awning'?60:h>=60?24:op==='slider'&&h<=36?48:36});
for(const [w,h] of [[36,12],[36,18],[60,18],[72,18],[72,24]])L_({id:`w-transom-${w}x${h}`,cat:'Windows',sub:'Transom',label:`Transom window ${w}" x ${h}"`,place:'window',width:w,height:h,operation:'fixed',sill:84});
for(const [w,h] of [[30,48],[24,60],[36,48]])L_({id:`w-egress-${w}x${h}`,cat:'Windows',sub:'Bedroom egress',label:`Egress casement ${w}" x ${h}" (meets IRC R310 at 44" sill)`,place:'window',width:w,height:h,operation:'casement',sill:30,egress:true});
L_({id:'w-egress-dh-36x60',cat:'Windows',sub:'Bedroom egress',label:'Egress double-hung 36" x 60" (meets IRC R310 at 44" sill)',place:'window',width:36,height:60,operation:'double-hung',sill:24,egress:true});
for(const [w,h] of [[48,72],[60,84],[72,84],[96,96]])L_({id:`w-storefront-${w}x${h}`,cat:'Windows',sub:'Commercial storefront',label:`Storefront glazing ${w}" x ${h}"`,place:'window',width:w,height:h,operation:'fixed',sill:12});

/* ---- cabinets (frameless and face-frame stock widths) ---- */
const CAB_W=[9,12,15,18,21,24,27,30,33,36,42,48];
for(const w of CAB_W)L_({id:`c-base-${w}`,cat:'Cabinets',sub:'Base cabinets',label:`Base cabinet ${w}" (B${w})`,place:'fixture',base:'base',w,d:24,h:34.5});
for(const w of [12,15,18,21,24,30,36])L_({id:`c-drawer-${w}`,cat:'Cabinets',sub:'Base cabinets',label:`Drawer base ${w}" (3 drawers)`,place:'fixture',base:'base',w,d:24,h:34.5});
for(const w of [30,33,36,42,48])L_({id:`c-sink-${w}`,cat:'Cabinets',sub:'Sink bases',label:`Sink base ${w}" (SB${w})`,place:'fixture',base:'sinkbase',w,d:24,h:34.5});
for(const w of [30,36])L_({id:`c-sink-ada-${w}`,cat:'Cabinets',sub:'Sink bases',label:`Accessible sink base ${w}", open knee space, 34" top`,place:'fixture',base:'sinkbase',w,d:24,h:32.5,ada:true});
for(const w of [36,39,42,45,48])L_({id:`c-blind-${w}`,cat:'Cabinets',sub:'Corner bases',label:`Blind corner base ${w}"`,place:'fixture',base:'base',w,d:24,h:34.5});
for(const w of [33,36])L_({id:`c-lazy-${w}`,cat:'Cabinets',sub:'Corner bases',label:`Lazy Susan corner base ${w}" x ${w}"`,place:'fixture',base:'base',w,d:w,h:34.5});
for(const h of [30,36,42])for(const w of [9,12,15,18,21,24,27,30,33,36])L_({id:`c-wall-${w}x${h}`,cat:'Cabinets',sub:`Wall cabinets ${h}" high`,label:`Wall cabinet ${w}" x ${h}" (W${w}${h})`,place:'fixture',base:'wallcab',w,d:12,h,elev:h===42?54:h===36?54:54});
for(const [w,h] of [[30,12],[30,15],[30,18],[33,15],[36,12],[36,15],[36,18],[36,24]])L_({id:`c-bridge-${w}x${h}`,cat:'Cabinets',sub:'Bridge and over-fridge',label:`Bridge wall cabinet ${w}" x ${h}"`,place:'fixture',base:'wallcab',w,d:h===24?24:12,h,elev:84-h});
for(const w of [24,27])L_({id:`c-wallcorner-${w}`,cat:'Cabinets',sub:'Wall cabinets 30" high',label:`Diagonal corner wall cabinet ${w}"`,place:'fixture',base:'wallcab',w,d:w,h:30,elev:54});
L_({id:'c-micro-30',cat:'Cabinets',sub:'Bridge and over-fridge',label:'Microwave wall cabinet 30" x 18"',place:'fixture',base:'wallcab',w:30,d:12,h:18,elev:66});
for(const w of [18,24,30,36])for(const h of [84,90,96])L_({id:`c-tall-${w}x${h}`,cat:'Cabinets',sub:'Tall cabinets',label:`Pantry cabinet ${w}" x ${h}"`,place:'fixture',base:'tall',w,d:24,h});
for(const w of [30,33])L_({id:`c-oven-${w}`,cat:'Cabinets',sub:'Tall cabinets',label:`Wall oven cabinet ${w}" x 84"`,place:'fixture',base:'tall',w,d:24,h:84});
for(const w of [24,30,36,42,48,60,72])L_({id:`c-van-${w}`,cat:'Cabinets',sub:'Bath vanities',label:`Vanity ${w}"${w>=60?' double sink':''}`,place:'fixture',base:'vanity',w,d:21,h:34.5});
for(const w of [24,30,36])L_({id:`c-van-ada-${w}`,cat:'Cabinets',sub:'Bath vanities',label:`Accessible vanity ${w}", open below, 34" max top`,place:'fixture',base:'vanity',w,d:21,h:32.5,ada:true});
for(const w of [12,18])L_({id:`c-vandr-${w}`,cat:'Cabinets',sub:'Bath vanities',label:`Vanity drawer base ${w}"`,place:'fixture',base:'base',w,d:21,h:34.5});
L_({id:'c-linen-18',cat:'Cabinets',sub:'Bath vanities',label:'Linen tower 18" x 84"',place:'fixture',base:'tall',w:18,d:21,h:84});
for(const [w,d] of [[48,36],[60,36],[72,36],[84,42],[96,42],[108,48]])L_({id:`c-island-${w}x${d}`,cat:'Cabinets',sub:'Islands and peninsulas',label:`Kitchen island ${w}" x ${d}"`,place:'fixture',base:'island',w,d,h:36,free:true});
for(const w of [60,72,84])L_({id:`c-pen-${w}`,cat:'Cabinets',sub:'Islands and peninsulas',label:`Peninsula ${w}" x 30"`,place:'fixture',base:'island',w,d:30,h:36});
for(const [w,d] of [[60,30],[72,30],[96,30]])L_({id:`c-desk-${w}`,cat:'Cabinets',sub:'Built-ins',label:`Built-in desk ${w}" x ${d}"`,place:'fixture',base:'base',w,d,h:30});
for(const w of [36,48,60])L_({id:`c-mud-${w}`,cat:'Cabinets',sub:'Built-ins',label:`Mudroom locker bench ${w}"`,place:'fixture',base:'tall',w,d:18,h:84});
for(const w of [36,48,72])L_({id:`c-book-${w}`,cat:'Cabinets',sub:'Built-ins',label:`Built-in bookcase ${w}" x 84"`,place:'fixture',base:'tall',w,d:12,h:84});
L_({id:'c-laund-30',cat:'Cabinets',sub:'Laundry',label:'Laundry wall cabinet 30" x 30" over washer',place:'fixture',base:'wallcab',w:30,d:12,h:30,elev:54});
L_({id:'c-laund-sinkbase',cat:'Cabinets',sub:'Laundry',label:'Laundry sink base 24"',place:'fixture',base:'sinkbase',w:24,d:24,h:34.5});

/* ---- appliances ---- */
for(const w of [24,30,36,48])L_({id:`a-range-${w}`,cat:'Appliances',sub:'Cooking',label:`Range ${w}"`,place:'fixture',base:'range',w,d:26,h:36});
for(const w of [30,36])L_({id:`a-cook-${w}`,cat:'Appliances',sub:'Cooking',label:`Cooktop ${w}" in base cabinet`,place:'fixture',base:'range',w,d:24,h:36});
for(const w of [27,30])L_({id:`a-wo-${w}`,cat:'Appliances',sub:'Cooking',label:`Double wall oven ${w}"`,place:'fixture',base:'tall',w:w+3,d:24,h:84});
for(const w of [30,36])L_({id:`a-hood-${w}`,cat:'Appliances',sub:'Cooking',label:`Range hood or microwave ${w}"`,place:'fixture',base:'wallcab',w,d:15,h:16,elev:66});
for(const [w,lab] of [[28,'Top-freezer refrigerator 28"'],[30,'Top-freezer refrigerator 30"'],[33,'Bottom-freezer refrigerator 33"'],[36,'French-door refrigerator 36"'],[36,'Side-by-side refrigerator 36"'],[30,'Column refrigerator 30"'],[42,'Built-in refrigerator 42"'],[48,'Built-in refrigerator 48"']])L_({id:`a-fridge-${lab.replace(/\W+/g,'').toLowerCase()}`,cat:'Appliances',sub:'Refrigeration',label:lab,place:'fixture',base:'fridge',w,d:/Built-in|Column/.test(lab)?24:30,h:/Built-in|Column/.test(lab)?84:70});
L_({id:'a-bev-15',cat:'Appliances',sub:'Refrigeration',label:'Under-counter beverage cooler 15"',place:'fixture',base:'dw',w:15,d:24,h:34.5});
L_({id:'a-freezer',cat:'Appliances',sub:'Refrigeration',label:'Chest freezer 48" x 30"',place:'fixture',base:'washer',w:48,d:30,h:34,free:true});
for(const w of [18,24])L_({id:`a-dw-${w}`,cat:'Appliances',sub:'Dishwashers',label:`Dishwasher ${w}"`,place:'fixture',base:'dw',w,d:24,h:34.5});
L_({id:'a-wash-27',cat:'Appliances',sub:'Laundry',label:'Front-load washer 27"',place:'fixture',base:'washer',w:27,d:32,h:39});
L_({id:'a-dry-27',cat:'Appliances',sub:'Laundry',label:'Front-load dryer 27"',place:'fixture',base:'dryer',w:27,d:32,h:39});
L_({id:'a-wash-tl',cat:'Appliances',sub:'Laundry',label:'Top-load washer 28"',place:'fixture',base:'washer',w:28,d:28,h:42});
L_({id:'a-stack-27',cat:'Appliances',sub:'Laundry',label:'Stacked washer and dryer 27"',place:'fixture',base:'washer',w:27,d:32,h:78});
L_({id:'a-wh-40',cat:'Appliances',sub:'Mechanical',label:'Tank water heater 40 gal (22" dia.)',place:'fixture',base:'washer',w:22,d:22,h:60,free:true});
L_({id:'a-wh-50',cat:'Appliances',sub:'Mechanical',label:'Tank water heater 50 gal (24" dia.)',place:'fixture',base:'washer',w:24,d:24,h:62,free:true});
L_({id:'a-wh-tankless',cat:'Appliances',sub:'Mechanical',label:'Tankless water heater (wall-hung)',place:'fixture',base:'wallcab',w:18,d:10,h:28,elev:48});
L_({id:'a-furnace',cat:'Appliances',sub:'Mechanical',label:'Furnace or air handler 21" x 28"',place:'fixture',base:'washer',w:21,d:28,h:48,free:true});
L_({id:'a-condenser',cat:'Appliances',sub:'Mechanical',label:'Outdoor A/C or heat pump unit 30" x 30"',place:'fixture',base:'washer',w:30,d:30,h:32,free:true});
L_({id:'a-panel',cat:'Appliances',sub:'Mechanical',label:'Electrical panel 14" x 4" (36" clear in front)',place:'fixture',base:'wallcab',w:14,d:4,h:30,elev:48});
L_({id:'a-fp-36',cat:'Appliances',sub:'Fireplaces',label:'Fireplace insert 36"',place:'fixture',base:'tall',w:42,d:22,h:42});
L_({id:'a-fp-42',cat:'Appliances',sub:'Fireplaces',label:'Fireplace insert 42"',place:'fixture',base:'tall',w:48,d:22,h:42});
L_({id:'a-stove',cat:'Appliances',sub:'Fireplaces',label:'Wood stove on hearth 48" x 48"',place:'fixture',base:'washer',w:48,d:48,h:30,free:true});

/* ---- plumbing ---- */
L_({id:'p-wc-round',cat:'Plumbing',sub:'Toilets',label:'Toilet, round bowl',place:'fixture',base:'toilet',w:20,d:26,h:29});
L_({id:'p-wc-elong',cat:'Plumbing',sub:'Toilets',label:'Toilet, elongated bowl',place:'fixture',base:'toilet',w:20,d:29,h:30});
L_({id:'p-wc-ada',cat:'Plumbing',sub:'Toilets',label:'Accessible toilet, 17"-19" seat height',place:'fixture',base:'toilet',w:20,d:30,h:31,ada:true});
L_({id:'p-wc-wall',cat:'Plumbing',sub:'Toilets',label:'Wall-hung toilet with in-wall carrier',place:'fixture',base:'toilet',w:15,d:22,h:16});
L_({id:'p-urinal',cat:'Plumbing',sub:'Toilets',label:'Wall-hung urinal',place:'fixture',base:'lav',w:18,d:14,h:24});
L_({id:'p-bidet',cat:'Plumbing',sub:'Toilets',label:'Bidet',place:'fixture',base:'toilet',w:15,d:22,h:15});
for(const [w,d,lab] of [[18,16,'Wall-hung lavatory 18"'],[20,18,'Wall-hung lavatory 20"'],[24,20,'Pedestal sink 24"'],[20,17,'Accessible wall-hung lavatory, 34" rim'],[48,20,'Trough sink 48"'],[36,22,'Commercial lavatory counter 36"']])L_({id:`p-lav-${lab.replace(/\W+/g,'').toLowerCase()}`,cat:'Plumbing',sub:'Sinks',label:lab,place:'fixture',base:'lav',w,d,h:34,ada:/Accessible/.test(lab)});
L_({id:'p-laundry-sink',cat:'Plumbing',sub:'Sinks',label:'Laundry tub 24" x 22"',place:'fixture',base:'lav',w:24,d:22,h:34});
L_({id:'p-mop-24',cat:'Plumbing',sub:'Sinks',label:'Mop (service) sink 24" x 24"',place:'fixture',base:'shower',w:24,d:24,h:12});
L_({id:'p-df-hilo',cat:'Plumbing',sub:'Sinks',label:'Hi-lo drinking fountain pair',place:'fixture',base:'lav',w:38,d:19,h:36});
for(const [w,d] of [[60,30],[60,32],[60,36],[66,32],[72,32],[72,36]])L_({id:`p-tub-${w}x${d}`,cat:'Plumbing',sub:'Tubs',label:`Bathtub ${w}" x ${d}"`,place:'fixture',base:'tub',w,d,h:20});
L_({id:'p-tub-corner',cat:'Plumbing',sub:'Tubs',label:'Corner soaking tub 60" x 60"',place:'fixture',base:'tub',w:60,d:60,h:22});
L_({id:'p-tub-free',cat:'Plumbing',sub:'Tubs',label:'Freestanding tub 67" x 32"',place:'fixture',base:'tub',w:67,d:32,h:23,free:true});
L_({id:'p-tub-walkin',cat:'Plumbing',sub:'Tubs',label:'Walk-in tub 52" x 30"',place:'fixture',base:'tub',w:52,d:30,h:38});
for(const [w,d] of [[32,32],[36,36],[42,36],[48,36],[48,48],[60,32],[60,36],[60,42],[72,36]])L_({id:`p-sh-${w}x${d}`,cat:'Plumbing',sub:'Showers',label:`Shower ${w}" x ${d}"`,place:'fixture',base:'shower',w,d,h:4});
L_({id:'p-sh-transfer',cat:'Plumbing',sub:'Showers',label:'Accessible transfer shower 36" x 36"',place:'fixture',base:'shower',w:36,d:36,h:1,ada:true});
L_({id:'p-sh-rollin-60x30',cat:'Plumbing',sub:'Showers',label:'Accessible roll-in shower 60" x 30"',place:'fixture',base:'rollin',w:60,d:30,h:1,ada:true});
L_({id:'p-sh-rollin-60x36',cat:'Plumbing',sub:'Showers',label:'Roll-in shower 60" x 36" (alternate)',place:'fixture',base:'rollin',w:60,d:36,h:1,ada:true});

/* ---- furniture ---- */
for(const [w,d,lab] of [[38,75,'Twin bed'],[54,75,'Full bed'],[60,80,'Queen bed'],[76,80,'King bed'],[72,84,'California king bed'],[39,80,'Twin XL bed'],[42,78,'Bunk bed']])L_({id:`f-${lab.replace(/\W+/g,'').toLowerCase()}`,cat:'Furniture',sub:'Bedroom',label:lab,place:'fixture',base:'bed',w,d,h:24,free:true});
for(const [w,d,h,lab] of [[24,18,26,'Nightstand'],[60,20,34,'Dresser'],[36,20,50,'Chest of drawers'],[48,24,72,'Wardrobe']])L_({id:`f-${lab.replace(/\W+/g,'').toLowerCase()}`,cat:'Furniture',sub:'Bedroom',label:lab,place:'fixture',base:'tall',w,d,h,free:true});
for(const [w,lab] of [[60,'Loveseat'],[72,'Sofa 72"'],[84,'Sofa 84"'],[96,'Sofa 96"'],[110,'Sectional 110"']])L_({id:`f-${lab.replace(/\W+/g,'').toLowerCase()}`,cat:'Furniture',sub:'Living',label:lab,place:'fixture',base:'sofa',w,d:lab.startsWith('Sectional')?84:36,h:32,free:true});
for(const [w,d,h,lab] of [[34,36,40,'Recliner'],[32,32,34,'Armchair'],[48,24,18,'Coffee table'],[60,18,24,'TV console'],[24,24,24,'End table'],[36,16,72,'Bookcase'],[30,30,30,'Piano bench area']])L_({id:`f-${lab.replace(/\W+/g,'').toLowerCase()}`,cat:'Furniture',sub:'Living',label:lab,place:'fixture',base:'table',w,d,h,free:true});
for(const [w,d,lab] of [[36,36,'Dining table 36" square (4 seats)'],[48,48,'Dining table 48" round (4 seats)'],[60,36,'Dining table 60" x 36" (6 seats)'],[72,40,'Dining table 72" x 40" (6 seats)'],[96,42,'Dining table 96" x 42" (8 seats)'],[18,20,'Dining chair'],[72,18,'Bench']])L_({id:`f-${lab.replace(/\W+/g,'').toLowerCase()}`,cat:'Furniture',sub:'Dining',label:lab,place:'fixture',base:'table',w,d,h:lab.includes('chair')?36:30,free:true});
for(const [w,d,h,lab] of [[48,24,30,'Desk 48"'],[60,30,30,'Desk 60"'],[72,30,30,'Executive desk 72"'],[26,26,40,'Office chair'],[18,28,52,'Filing cabinet, 4 drawer'],[36,18,52,'Lateral file'],[96,42,30,'Conference table 8\''],[144,48,30,'Conference table 12\''],[84,30,42,'Reception desk'],[24,20,30,'Student desk'],[72,30,30,'Folding table 6\''],[60,30,36,'Workbench 5\''],[96,24,72,'Shelving unit 8\'']])L_({id:`f-${lab.replace(/\W+/g,'').toLowerCase()}`,cat:'Furniture',sub:'Office, school and shop',label:lab,place:'fixture',base:'table',w,d,h,free:true});
for(const [w,d,lab] of [[108,216,'Car (parking space 9\' x 18\')'],[96,240,'Pickup truck'],[48,72,'Riding mower'],[42,84,'Golf cart']])L_({id:`f-${lab.replace(/\W+/g,'').toLowerCase()}`,cat:'Furniture',sub:'Garage',label:lab,place:'fixture',base:'table',w,d,h:60,free:true});

/* ---- wall assemblies ---- */
const WALL_LIB=[
  ['ext4','Exterior 2x4 wood frame',5.5,'exterior',true,'wood'],['ext6','Exterior 2x6 wood frame',7.5,'exterior',true,'wood'],
  ['ext4-brick','Exterior 2x4 with brick veneer',10.5,'exterior',true,'brickveneer'],['ext6-brick','Exterior 2x6 with brick veneer',12.5,'exterior',true,'brickveneer'],
  ['ext4-stone','Exterior 2x4 with stone veneer',11.5,'exterior',true,'stoneveneer'],['cmu8','8" CMU block wall',8,'exterior',true,'cmu'],['cmu8-fur','8" CMU with furring and drywall',9.75,'exterior',true,'cmu'],
  ['cmu12','12" CMU block wall',12,'exterior',true,'cmu'],['cmu8-brick','8" CMU with brick veneer',13,'exterior',true,'cmu'],['icf6','ICF wall, 6" concrete core',11,'exterior',true,'icf'],['sip6','SIP panel 6-1/2"',7,'exterior',true,'sip'],
  ['metal-ext','Exterior metal stud 6" with panels',8,'exterior',false,'metalstud'],['pole','Post-frame (pole barn) wall with metal panels',6,'exterior',true,'postframe'],
  ['int4','Interior 2x4 partition',4.5,'interior',false,'wood'],['int4-b','Interior 2x4 bearing wall',4.5,'interior',true,'wood'],['int6','Interior 2x6 plumbing wall',6.5,'interior',false,'wood'],
  ['int3','Interior 2x3 closet partition',3.5,'interior',false,'wood'],['int-ms358','Interior metal stud 3-5/8"',4.875,'interior',false,'metalstud'],['int-ms6','Interior metal stud 6"',7.25,'interior',false,'metalstud'],
  ['int-demise','Interior 2x4 with 5/8" Type X both sides (fire-rated)',4.75,'interior',false,'wood'],['int-sound','Interior staggered 2x4 on 2x6 plate (sound wall)',7.5,'interior',false,'wood'],['int-cmu','Interior 8" CMU',8,'interior',true,'cmu'],
  ['knee','Knee wall 2x4 (half-height)',4.5,'interior',false,'wood'],['pony','Glass block wall',4,'interior',false,'glassblock'],
];
for(const [k,label,thick,kind,bearing,mat] of WALL_LIB)L_({id:'wa-'+k,key:k,cat:'Wall assemblies',sub:kind==='exterior'?'Exterior walls':'Interior walls',label,place:'wall',thick,kind,bearing,mat,half:k==='knee'});

/* ---- trim and molding ---- */
const TRIM_LIB=[
  ['base','Ranch baseboard 2-1/4"',2.25,0.5,'ranch'],['base','Colonial baseboard 3-1/4"',3.25,0.56,'colonial'],['base','Colonial baseboard 4-1/4"',4.25,0.56,'colonial'],['base','Colonial baseboard 5-1/4"',5.25,0.56,'colonial'],
  ['base','Craftsman flat baseboard 1x6 (5-1/2")',5.5,0.75,'flat'],['base','Craftsman baseboard with cap 7-1/4"',7.25,0.75,'craftsman'],['base','Modern square baseboard 3-1/2"',3.5,0.5,'square'],['base','Tall colonial baseboard 7-1/4"',7.25,0.69,'colonial'],
  ['base','Rubber cove base 4" (commercial)',4,0.125,'cove'],['base','Tile base 4"',4,0.3,'square'],
  ['casing','Ranch casing 2-1/4"',2.25,0.56,'ranch'],['casing','Colonial casing 2-1/4"',2.25,0.69,'colonial'],['casing','Colonial casing 3-1/4"',3.25,0.69,'colonial'],['casing','Fluted casing 3-1/4" with rosettes',3.25,0.69,'fluted'],
  ['casing','Craftsman flat casing 1x4 with head cap',3.5,0.75,'craftsman'],['casing','Modern square casing 2-1/2"',2.5,0.5,'square'],['casing','Backband casing 3-1/2"',3.5,1.06,'backband'],['casing','Hollow metal frame (commercial)',2,0.06,'square'],
  ['crown','Cove crown 3-5/8"',3.625,0.56,'cove'],['crown','Colonial crown 3-5/8"',3.625,0.56,'ogee'],['crown','Colonial crown 4-5/8"',4.625,0.62,'ogee'],['crown','Colonial crown 5-1/4"',5.25,0.62,'ogee'],
  ['crown','Large crown 6-5/8"',6.625,0.69,'ogee'],['crown','Built-up crown 7-1/4" (frieze + crown)',7.25,1.25,'built'],['crown','Craftsman flat crown with cap 5-1/2"',5.5,0.75,'craftsman'],
  ['chair','Chair rail 2-5/8" at 32"-36"',2.625,0.69,'chair'],['chair','Picture rail 1-3/4" at 84"',1.75,0.69,'chair'],
  ['shoe','Base shoe 3/4"',0.75,0.5,'shoe'],['shoe','Quarter round 3/4"',0.75,0.75,'quarter'],
  ['wainscot','Beadboard wainscot 32" with cap',32,0.5,'bead'],['wainscot','Board and batten wainscot 48"',48,0.75,'batten'],['wainscot','Raised-panel wainscot 36"',36,0.75,'panel'],['wainscot','Shiplap wainscot 42"',42,0.5,'shiplap'],
  ['stool','Window stool and apron',3.5,0.75,'stool'],['stool','Picture-frame window casing (no stool)',0,0,'none'],
];
for(const [i,[slot,label,h,t,profile]] of TRIM_LIB.entries())L_({id:`t-${slot}-${i}`,cat:'Trim and molding',sub:{base:'Baseboard',casing:'Door and window casing',crown:'Crown',chair:'Chair and picture rail',shoe:'Shoe and quarter round',wainscot:'Wainscot',stool:'Window stool'}[slot],label,place:'trim',slot,h,t,profile});
const TRIM_NONE={crown:'No crown molding',chair:'No chair rail',shoe:'No base shoe',wainscot:'No wainscot'};
for(const [slot,label] of Object.entries(TRIM_NONE))L_({id:`t-${slot}-none`,cat:'Trim and molding',sub:{crown:'Crown',chair:'Chair and picture rail',shoe:'Shoe and quarter round',wainscot:'Wainscot'}[slot],label,place:'trim',slot,h:0,t:0,profile:'none'});

/* ---- ceilings ---- */
const CEILINGS={flat:['Flat drywall, smooth',0xf7f6f2],knockdown:['Flat drywall, knockdown texture',0xf3f1ea],orangepeel:['Flat drywall, orange peel',0xf4f2ec],popcorn:['Popcorn texture (existing; test for asbestos before removing if built before 1980)',0xefede6],
  tray:['Tray ceiling, 12" step',0xf7f6f2],coffered:['Coffered ceiling',0xf2efe8],vaulted:['Vaulted or cathedral',0xf7f6f2],beadboard:['Beadboard',0xf3efe5],tng:['Tongue-and-groove pine',0xd7b48a],plank:['Wood plank',0xc9a67c],
  beams:['Exposed beams over drywall',0xa7784f],shiplap:['Shiplap',0xf3f1ea],act22:['Suspended 2x2 acoustic tile',0xefefec],act24:['Suspended 2x4 acoustic tile',0xefefec],tin:['Tin (metal) tiles',0xc9c9c5],open:['Open to structure, painted',0x9a9a98]};
for(const [k,[label]] of Object.entries(CEILINGS))L_({id:'ce-'+k,key:k,cat:'Ceilings',sub:/Suspended|tin|Open/i.test(label)?'Commercial':/beam|plank|pine|Beadboard|Shiplap|Coffered|Tray|Vaulted/i.test(label)?'Feature':'Drywall',label,place:'ceiling'});

/* ---- wall finishes ---- */
const WALL_FIN={paint:['Painted drywall, eggshell'],smooth:['Level 5 smooth drywall'],orangepeel:['Orange peel texture'],knockdown:['Knockdown texture'],shiplap:['Shiplap'],beadboard:['Beadboard full height'],
  paneling:['Wood paneling'],subway:['Subway tile 3x6'],largetile:['Large-format tile 12x24'],mosaic:['Mosaic tile accent'],stone:['Stone veneer accent'],brick:['Thin brick accent'],wallpaper:['Wallpaper'],
  frp:['FRP panels (commercial, wet areas)'],cmu:['Painted CMU'],plaster:['Plaster'],cement:['Cement board with tile (wet area)']};
for(const [k,[label]] of Object.entries(WALL_FIN))L_({id:'wf-'+k,key:k,cat:'Wall finishes',sub:/tile|stone|brick|FRP|Cement/i.test(label)?'Tile, stone and wet areas':/paneling|Shiplap|Beadboard|Wallpaper/i.test(label)?'Wood and paper':'Paint and drywall',label,place:'wallfin'});

/* ---- floors, roofing, siding (extra entries added to the existing tables at start-up) ---- */
const FLOOR_LIB={lvp:['Luxury vinyl plank',0,0xb89a74],laminate:['Laminate plank',0,0xb08d63],hardwood:['Oak hardwood 3/4"',1,0xa8774a],engineered:['Engineered wood',1,0xb08158],
  pine:['Heart pine',1,0xc08b52],tile:['Ceramic tile',5,0xd8d6cf],porcelain:['Porcelain tile 12x24',6,0xc9c6bd],stone:['Natural stone tile',8,0xbfb5a3],carpet:['Carpet',0,0xb8ad9c],
  sheetvinyl:['Sheet vinyl',0,0xcfc9bb],vct:['Vinyl composition tile (VCT)',0,0xd2d0c8],rubber:['Rubber flooring',1,0x4b4d50],concrete:['Sealed concrete',0,0xb9b7b0],polished:['Polished concrete',0,0xa9a7a0],
  epoxy:['Epoxy coating',0,0x8e9aa3],cork:['Cork',0,0xb58e62],brickpaver:['Brick pavers',10,0x9a4b35]};
const ROOF_LIB={asphalt:['Architectural asphalt shingles',10,0x4a4f57],threetab:['3-tab asphalt shingles',8,0x55595f],metal:['Exposed-fastener metal panels',6,0x6b7d86],standing:['Standing seam metal',6,0x5d6e77],
  fivev:['5V crimp metal',6,0x8a969b],tile:['Clay tile',20,0xa5553a],concretetile:['Concrete tile',17,0x8c6f5d],slate:['Slate',15,0x4e555c],shake:['Cedar shake',5,0x8a6b4e],
  tpo:['TPO membrane (low slope)',2,0xdcdcd6],modbit:['Modified bitumen (low slope)',3,0x3c3e41],epdm:['EPDM rubber (low slope)',2,0x2d2f31]};
const SIDING_LIB={vinyl:['Vinyl lap siding',0xeeeae0],dutchlap:['Vinyl Dutch lap siding',0xe9e4d6],fibercement:['Fiber cement lap siding',0xb9c3c9],fcpanel:['Fiber cement board and batten',0xd9d6cc],
  smartside:['Engineered wood lap siding',0xb48b62],wood:['Wood lap siding',0xc9a17a],shingle:['Cedar shingle siding',0x9d7a55],log:['Log siding',0x8b6640],brick:['Brick veneer',0x9a4b35],
  stone:['Stone veneer',0x9b948a],stucco:['Stucco',0xe2d8c4],metalpanel:['Metal wall panels',0x9aa4a8],cmu:['Painted CMU',0xd8d4ca],splitface:['Split-face block',0xc4b8a6]};
for(const [k,[label]] of Object.entries(FLOOR_LIB))L_({id:'fl-'+k,key:k,cat:'Floors',sub:/tile|stone|paver/i.test(label)?'Tile and stone':/concrete|Epoxy|VCT|Rubber/i.test(label)?'Commercial and garage':/Carpet|vinyl|Cork/i.test(label)?'Resilient and carpet':'Wood and plank',label,place:'floor'});
for(const [k,[label]] of Object.entries(ROOF_LIB))L_({id:'ro-'+k,key:k,cat:'Roofing',sub:/low slope/.test(label)?'Low slope':/metal/i.test(label)?'Metal':/shingle|shake/i.test(label)?'Shingles':'Tile and slate',label,place:'roof'});
for(const [k,[label]] of Object.entries(SIDING_LIB))L_({id:'si-'+k,key:k,cat:'Siding',sub:/brick|stone|stucco|CMU|block/i.test(label)?'Masonry and stucco':/Vinyl/.test(label)?'Vinyl':'Wood, fiber cement and metal',label,place:'siding'});

/* ---- colors (generic paint and material colors) ---- */
const COLOR_LIB={
  Whites:[['Pure white','#f7f7f3'],['Soft white','#f2efe6'],['Warm white','#efe9dc'],['Antique white','#ece3cf'],['Linen','#e9e2d3'],['Bright white','#fbfbfa'],['Cool white','#eef0ef'],['Ivory','#f1e9d2']],
  'Greiges and beiges':[['Agreeable greige','#d1cbc0'],['Light greige','#d9d3c8'],['Sand','#d6c7ab'],['Khaki','#c3b091'],['Taupe','#a99b8a'],['Mushroom','#b5a99a'],['Oatmeal','#ddd2bd'],['Wheat','#e2cfa5']],
  Grays:[['Pale gray','#e1e2df'],['Silver gray','#c9cbc8'],['Repose gray','#c2c0ba'],['Pewter','#9b9c97'],['Charcoal','#4a4c4e'],['Slate gray','#6b7378'],['Graphite','#3b3d3f'],['Iron ore','#434241']],
  Blues:[['Sky blue','#b9d3e3'],['Powder blue','#c6d8e4'],['Coastal blue','#7fa3b8'],['Denim','#5b7896'],['Navy','#2a3a52'],['Teal','#3d7a7f'],['Slate blue','#6a7f99'],['Porch ceiling blue','#cde4e2']],
  Greens:[['Sage','#b2b9a0'],['Olive','#7e7f4f'],['Hunter green','#33533f'],['Mint','#cde3cf'],['Celadon','#b9cdb4'],['Forest','#2f4a37'],['Eucalyptus','#9fb1a1'],['Moss','#7d8a5b']],
  'Reds and oranges':[['Barn red','#7d2c26'],['Brick red','#9a4b35'],['Terracotta','#c06c4b'],['Burgundy','#5f2430'],['Coral','#e08a72'],['Rust','#a5552f'],['Pumpkin','#cf7a3c']],
  Yellows:[['Butter','#f3e3a5'],['Mustard','#c9a53e'],['Pale yellow','#f4ecc4'],['Gold','#c7a24e']],
  'Browns and wood tones':[['Natural oak','#c9a77c'],['Honey oak','#c0874a'],['Walnut','#6b4a32'],['Espresso','#3b2a22'],['Cherry','#8a4b32'],['Maple','#d9b98c'],['Gray wash','#a8a093'],['Chocolate','#4e342a']],
  'Blacks and darks':[['Tricorn black','#2b2b2b'],['Soft black','#3a3a38'],['Bronze','#5a4a3a'],['Black','#1d1d1d']],
  'Metals and stone':[['Brushed nickel','#b9b8b2'],['Stainless steel','#c9ccd0'],['Matte black metal','#2a2b2c'],['Galvalume','#a9b0b2'],['Copper','#b87333'],['White quartz','#ecebe6'],['Black granite','#2f3133'],['Butcher block','#c79b63']],
};
for(const [fam,list] of Object.entries(COLOR_LIB))for(const [name,hex] of list)L_({id:'co-'+name.replace(/\W+/g,'').toLowerCase(),cat:'Colors',sub:fam,label:name,place:'color',hex});
const LIB_BY_ID=Object.fromEntries(LIB.map(x=>[x.id,x]));
const LIB_CATS=[...new Set(LIB.map(x=>x.cat))];
