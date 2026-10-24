/* ======================= structure ======================= */
// Planning-level wood checks: simple-span bending, shear and deflection for joists, rafters, headers and beams.
// Design values are approximate NDS reference values for visual-graded lumber; verify against the current NDS Supplement.
const LUMBER={'2x4':3.5,'2x6':5.5,'2x8':7.25,'2x10':9.25,'2x12':11.25};
const SPECIES={
  syp2:{label:'Southern Pine #2',Fb:{'2x4':1100,'2x6':1000,'2x8':925,'2x10':800,'2x12':750},CF:{'2x4':1,'2x6':1,'2x8':1,'2x10':1,'2x12':1},Fv:175,E:1.4e6},
  spf2:{label:'Spruce-Pine-Fir #1/#2',Fb:875,CF:{'2x4':1.5,'2x6':1.3,'2x8':1.2,'2x10':1.1,'2x12':1.0},Fv:135,E:1.4e6},
  df2:{label:'Douglas Fir-Larch #2',Fb:900,CF:{'2x4':1.5,'2x6':1.3,'2x8':1.2,'2x10':1.1,'2x12':1.0},Fv:180,E:1.6e6},
};
const LVL={Fb:2600,Fv:285,E:2.0e6,ply:1.75};
// header and beam choices, smallest first
const BEAMS=[
  {id:'2-2x6',label:'(2) 2x6',plies:2,size:'2x6'},{id:'2-2x8',label:'(2) 2x8',plies:2,size:'2x8'},{id:'2-2x10',label:'(2) 2x10',plies:2,size:'2x10'},
  {id:'2-2x12',label:'(2) 2x12',plies:2,size:'2x12'},{id:'3-2x12',label:'(3) 2x12',plies:3,size:'2x12'},
  {id:'2-lvl9',label:'(2) 1¾" x 9¼" LVL',plies:2,lvl:9.25},{id:'2-lvl12',label:'(2) 1¾" x 11⅞" LVL',plies:2,lvl:11.875},
  {id:'2-lvl14',label:'(2) 1¾" x 14" LVL',plies:2,lvl:14},{id:'3-lvl14',label:'(3) 1¾" x 14" LVL',plies:3,lvl:14},{id:'3-lvl16',label:'(3) 1¾" x 16" LVL',plies:3,lvl:16},{id:'3-lvl18',label:'(3) 1¾" x 18" LVL',plies:3,lvl:18},{id:'4-lvl18',label:'(4) 1¾" x 18" LVL',plies:4,lvl:18},
];
const FLOOR_FINISH={carpet:{label:'Carpet',dl:0},lvp:{label:'Vinyl plank',dl:0},hardwood:{label:'Hardwood',dl:1},tile:{label:'Tile',dl:5},concrete:{label:'Sealed concrete',dl:0}};
const ROOF_COVER={asphalt:{label:'Asphalt shingles',dl:10},metal:{label:'Metal panels',dl:6},tile:{label:'Clay or concrete tile',dl:20}};
const LIVE={bedroom:30,attic:10,atticStorage:20,roof:20,floor:40};
// IBC Table 1607.1 floor live loads (psf) by room use for commercial and city buildings; offices add 15 psf for partitions as dead load.
const IBC_LIVE={office:50,assembly:100,classroom:40,retail:100,storage:125,shop:125,corridor:100,hall:100,kitchen:50,bath:50,living:100,dining:100,other:50,garage:40,closet:50,laundry:50,bedroom:40};
function liveFor(p,r){if(p.settings?.code==='ibc')return IBC_LIVE[r.use]??50;return r.use==='bedroom'?LIVE.bedroom:LIVE.floor;}
function framingOf(lv){return {joist:'2x10',spacing:16,species:'syp2',dir:'auto',ceiling:'2x6',ceilingSpacing:16,atticStorage:false,foundation:'crawl',girders:96,...(lv.framing||{})};}
function rafterOf(r){return {system:'rafters',rafter:'2x8',spacing:24,species:'syp2',cover:'asphalt',...(r.framing||{})};}
// member design: b,d in inches, species values
function memberProps(spec,size,plies=1){
  if(spec.lvl)return {b:LVL.ply*spec.plies,d:spec.lvl,Fb:LVL.Fb*Math.pow(12/spec.lvl,0.136),Fv:LVL.Fv,E:LVL.E};
  const sp=SPECIES[spec.species||'syp2']||SPECIES.syp2; const sz=spec.size||size; const fb=typeof sp.Fb==='number'?sp.Fb:sp.Fb[sz];
  return {b:1.5*(spec.plies||plies),d:LUMBER[sz],Fb:fb*(sp.CF[sz]||1),Fv:sp.Fv,E:sp.E};
}
// uniform load w (plf) on a simple span L (in). Returns ratios (1.0 = at limit).
function checkMember(m,L,wTot,wLive,{Cr=1,CD=1,liveLim=360,totLim=240}={}){
  const w=wTot/12, wl=wLive/12; // lb/in
  const S=m.b*m.d*m.d/6, I=m.b*m.d*m.d*m.d/12;
  const M=w*L*L/8, V=w*L/2;
  const fb=M/S, Fb=m.Fb*Cr*CD; const fv=1.5*V/(m.b*m.d), Fv=m.Fv*CD;
  const dL=5*wl*Math.pow(L,4)/(384*m.E*I), dT=5*w*Math.pow(L,4)/(384*m.E*I);
  const rB=fb/Fb, rV=fv/Fv, rDL=dL/(L/liveLim), rDT=dT/(L/totLim);
  const ratio=Math.max(rB,rV,rDL,rDT);
  const gov=ratio===rB?'bending':ratio===rV?'shear':'deflection';
  return {ratio,rB,rV,rDL,rDT,gov,dL,dT};
}
// distance along a ray to the nearest support wall it crosses
function rayToSupport(pt,dir,supports,maxD=1e5){
  let best=null;
  for(const w of supports){const a={x:w.x1,y:w.y1},b={x:w.x2,y:w.y2};const ex=b.x-a.x,ey=b.y-a.y;const den=dir.x*ey-dir.y*ex;if(Math.abs(den)<1e-9)continue;
    const t=((a.x-pt.x)*ey-(a.y-pt.y)*ex)/den, u=((a.x-pt.x)*dir.y-(a.y-pt.y)*dir.x)/den;
    if(t>0.5&&u>=-0.02&&u<=1.02&&t<maxD&&(best==null||t<best))best=t;}
  return best;
}
function spanAcross(pt,axis,supports){const d=axis==='x'?{x:1,y:0}:{x:0,y:1};const a=rayToSupport(pt,d,supports),b=rayToSupport(pt,{x:-d.x,y:-d.y},supports);return a!=null&&b!=null?a+b:null;}
function floorSupports(p,lv){
  const below=sortedLevels(p).filter(l=>l.elevation<lv.elevation).pop();
  const src=below||lv; return p.walls.filter(w=>w.level===src.id&&(w.status!=='demolish'?(w.bearing||w.kind==='exterior'):w.bearing));
}
const isTop=(p,lv)=>!levelAbove(p,lv);
function suggestSize(L,wT,wL,spacing,species,opts){for(const sz of ['2x6','2x8','2x10','2x12']){const m=memberProps({species,size:sz},sz);if(checkMember(m,L,wT,wL,opts).ratio<=1)return sz;}return null;}
function suggestBeam(L,wT,wL,species,opts){for(const b of BEAMS){const m=memberProps(b.lvl?b:{...b,species},b.size,b.plies);if(checkMember(m,L,wT,wL,opts).ratio<=1)return b;}return null;}

// line load (plf) delivered to a wall from floors and roofs above it
function wallLoad(p,w){
  const lv=lvlOf(p,w.level); if(!lv)return {total:0,live:0,parts:[]};
  const d=wdir(w),n={x:-d.y,y:d.x}; const mid={x:(w.x1+w.x2)/2,y:(w.y1+w.y2)/2};
  const parts=[];let total=0,live=0;
  const trib=(supports)=>{let t=0;for(const s of [1,-1]){const dd=rayToSupport({x:mid.x+n.x*s*(w.thick/2+0.6),y:mid.y+n.y*s*(w.thick/2+0.6)},{x:n.x*s,y:n.y*s},supports.filter(o=>o.id!==w.id),600);if(dd!=null)t+=dd/2;}return t/12;};// ft
  const levels=sortedLevels(p); const idx=levels.findIndex(l=>l.id===lv.id);
  for(let i=idx+1;i<levels.length;i++){const L2=levels[i];const sup=p.walls.filter(o=>o.level===levels[i-1].id&&(o.status!=='demolish'?(o.bearing||o.kind==='exterior'):o.bearing));
    const t=trib(sup.some(o=>o.id===w.id)?sup:[...sup,w]); if(t<=0)continue;
    const ll=LIVE.floor,dl=10; total+=t*(ll+dl); live+=t*ll; parts.push(`${L2.name} floor: ${t.toFixed(1)} ft x ${ll+dl} psf`);
    const wallAbove=L2.height/12*10; total+=wallAbove; parts.push(`${L2.name} walls: ${Math.round(wallAbove)} plf`);}
  // roof and ceiling at the top
  const top=levels[levels.length-1];
  const roofs=p.roofs.filter(r=>r.level===top.id);
  {
    for(const r of roofs){const rf=rafterOf(r);const axis=roofAxis(r);
      const along=axis==='x'?Math.abs(d.y)<0.2:Math.abs(d.x)<0.2; // wall parallel to the ridge = eave wall
      const inside=mid.x>=r.x-1&&mid.x<=r.x+r.w+1&&mid.y>=r.y-1&&mid.y<=r.y+r.h+1; if(!inside)continue;
      const Vl=axis==='x'?r.h:r.w; let t=0;
      if(w.kind==='exterior'&&(along||['hip','dutch','mansard'].includes(r.style)))t=(Vl/2)/12+r.overhang/12;
      if(t>0){const dl=ROOF_COVER[rf.cover]?.dl??10;const add=t*(LIVE.roof+dl);
        // walls on lower levels carry the roof through the walls above when they stack
        total+=add;live+=t*LIVE.roof;parts.push(`Roof: ${t.toFixed(1)} ft x ${LIVE.roof+dl} psf`);}}
    if(w.level===top.id){const fr=framingOf(top);const sup=p.walls.filter(o=>o.level===top.id&&(o.status!=='demolish'?(o.bearing||o.kind==='exterior'):o.bearing));
      const t=trib(sup.some(o=>o.id===w.id)?sup:[...sup,w]);if(t>0){const ll=fr.atticStorage?LIVE.atticStorage:LIVE.attic;total+=t*(ll+10);live+=t*ll;parts.push(`Ceiling: ${t.toFixed(1)} ft x ${ll+10} psf`);}}
  }
  return {total,live,parts};
}

function analyzeStructure(p){
  const M=[];const lvls=sortedLevels(p);
  for(const lv of lvls){const fr=framingOf(lv);const first=lv.id===groundLevel(p).id;
    const slab=first&&fr.foundation==='slab';
    const sup=floorSupports(p,lv);
    for(const r of p.rooms.filter(r=>r.level===lv.id)){
      const c=polyLabelPt(r.pts);const pt={x:c[0],y:c[1]};
      // floor joists
      if(!slab&&r.use!=='garage'){
        let axis=fr.dir, L=null;
        if(axis==='auto'){const sx=spanAcross(pt,'x',sup),sy=spanAcross(pt,'y',sup);if(sx!=null&&(sy==null||sx<=sy)){axis='x';L=sx;}else if(sy!=null){axis='y';L=sy;}}
        else L=spanAcross(pt,axis,sup);
        if(first&&fr.foundation==='crawl'&&fr.girders>0){if(axis==='auto')axis='x';L=L==null?fr.girders:Math.min(L,fr.girders);}
        if(L!=null){const dlF=10+(FLOOR_FINISH[r.finish]?.dl||0)+(p.settings?.code==='ibc'&&r.use==='office'?15:0); const ll=liveFor(p,r);
          const s=fr.spacing/12; const wT=(ll+dlF)*s, wL=ll*s; const m=memberProps({species:fr.species,size:fr.joist},fr.joist);
          const res=checkMember(m,L,wT,wL,{Cr:1.15,liveLim:360,totLim:240});
          M.push({kind:'floor',id:'fj-'+r.id,label:`${r.name} floor joists`,level:lv.id,target:{kind:'room',id:r.id},pt,size:fr.joist,spacing:fr.spacing,species:fr.species,span:L,axis,load:`${ll} live + ${dlF} dead psf`,...res,
            suggest:res.ratio>1?suggestSize(L,wT,wL,fr.spacing,fr.species,{Cr:1.15,liveLim:360,totLim:240}):null,code:'R502.3'});}}
      // ceiling joists on the top level
      const trussed=p.roofs.some(rf=>rf.level===lv.id&&rafterOf(rf).system==='trusses');
      if(isTop(p,lv)&&!trussed){const csup=p.walls.filter(o=>o.level===lv.id&&(o.status!=='demolish'?(o.bearing||o.kind==='exterior'):o.bearing));
        const sx=spanAcross(pt,'x',csup),sy=spanAcross(pt,'y',csup);let L=null,axis='x';if(sx!=null&&(sy==null||sx<=sy)){L=sx;}else if(sy!=null){L=sy;axis='y';}
        if(L!=null){const ll=fr.atticStorage?LIVE.atticStorage:LIVE.attic,dl=fr.atticStorage?10:5;const s=fr.ceilingSpacing/12;const m=memberProps({species:fr.species,size:fr.ceiling},fr.ceiling);
          const res=checkMember(m,L,(ll+dl)*s,ll*s,{Cr:1.15,liveLim:240,totLim:240});
          M.push({kind:'ceiling',id:'cj-'+r.id,label:`${r.name} ceiling joists`,level:lv.id,target:{kind:'room',id:r.id},pt,size:fr.ceiling,spacing:fr.ceilingSpacing,species:fr.species,span:L,axis,load:`${ll} live + ${dl} dead psf (attic)`,...res,
            suggest:res.ratio>1?suggestSize(L,(ll+dl)*s,ll*s,fr.ceilingSpacing,fr.species,{Cr:1.15,liveLim:240,totLim:240}):null,code:'R802.5'});}}
    }
    // headers in bearing and exterior walls
    for(const w of p.walls.filter(w=>w.level===lv.id&&w.status!=='demolish')){
      const ops=p.openings.filter(o=>o.wall===w.id); if(!ops.length)continue;
      const carries=w.bearing||w.kind==='exterior'; const load=carries?wallLoad(p,w):{total:0,live:0,parts:[]};
      for(const o of ops){const c=openingCenter(p,o);const L=o.width+3;
        if(!carries||load.total<1){M.push({kind:'header',id:'h-'+o.id,label:`${openingMarks(p)[o.id]||'Opening'} header`,level:lv.id,target:{kind:'opening',id:o.id},pt:c,size:'Flat 2x',span:L,ratio:0,gov:'none',load:'Non-bearing wall',parts:[],code:'R602.7.5'});continue;}
        const wT=load.total,wL=load.live; const req=suggestBeam(L,wT,wL,'syp2',{liveLim:360,totLim:240});
        const chosen=o.header&&o.header!=='auto'?BEAMS.find(b=>b.id===o.header):req;
        const res=chosen?checkMember(memberProps(chosen.lvl?chosen:{...chosen,species:'syp2'},chosen.size,chosen.plies),L,wT,wL,{liveLim:360,totLim:240}):{ratio:9,gov:'bending'};
        M.push({kind:'header',id:'h-'+o.id,label:`${openingMarks(p)[o.id]||'Opening'} header`,level:lv.id,target:{kind:'opening',id:o.id},pt:c,size:chosen?chosen.label:'Beyond the listed sizes',auto:!o.header||o.header==='auto',span:L,load:`${Math.round(wT)} plf`,parts:load.parts,...res,
          suggest:(!chosen||res.ratio>1)?(req?req.label:'Engineer to size'):null,code:'R602.7'});}}
    // removed bearing walls need a beam
    for(const w of p.walls.filter(w=>w.level===lv.id&&w.status==='demolish'&&w.bearing)){
      const load=wallLoad(p,w);const L=wlen(w);const req=suggestBeam(L,load.total,load.live,'syp2',{liveLim:360,totLim:240});
      M.push({kind:'beam',id:'b-'+w.id,label:'Beam to replace removed bearing wall',level:lv.id,target:{kind:'wall',id:w.id},pt:{x:(w.x1+w.x2)/2,y:(w.y1+w.y2)/2},size:req?req.label:'Engineer to size',span:L,load:`${Math.round(load.total)} plf`,parts:load.parts,ratio:req?0.99:9,gov:'bending',beam:true,
        suggest:req?req.label:'Engineer to size',code:'R301.1.3'});}
  }
  // rafters
  for(const r of p.roofs){const rf=rafterOf(r);if(rf.system==='trusses')continue;const axis=roofAxis(r);const Vl=axis==='x'?r.h:r.w;
    const L=r.style==='shed'?Vl:Vl/2; const dl=ROOF_COVER[rf.cover]?.dl??10; const s=rf.spacing/12;
    const m=memberProps({species:rf.species,size:rf.rafter},rf.rafter); const res=checkMember(m,L,(LIVE.roof+dl)*s,LIVE.roof*s,{Cr:1.15,CD:1.25,liveLim:240,totLim:180});
    M.push({kind:'rafter',id:'rf-'+r.id,label:`${r.style[0].toUpperCase()+r.style.slice(1)} roof rafters`,level:r.level,target:{kind:'roof',id:r.id},pt:{x:r.x+r.w/2,y:r.y+r.h/2},size:rf.rafter,spacing:rf.spacing,species:rf.species,span:L,load:`${LIVE.roof} live + ${dl} dead psf (horizontal span)`,...res,
      suggest:res.ratio>1?suggestSize(L,(LIVE.roof+dl)*s,LIVE.roof*s,rf.spacing,rf.species,{Cr:1.15,CD:1.25,liveLim:240,totLim:180}):null,code:'R802.4'});}
  return M;
}
const govLabel={bending:'bending',shear:'shear',deflection:'deflection',none:'none'};
