/* ======================= Designer tools: fill a cabinet run, under-cabinet lights, reflected ceiling plan ======================= */
const tierOf=f=>f.type==='wallcab'?'w':'b';
// the room wall a fixture backs onto
function wallOfFixture(p,f){return roomWalls(p).find(W=>{if(W.room.level!==f.level||!inPoly(f.x,f.y,W.room.pts))return false;const fr=fxFront(f);if(fr.x*W.n.x+fr.y*W.n.y<0.9)return false;const back={x:f.x-fr.x*f.d/2,y:f.y-fr.y*f.d/2};const pr=projSeg(back,W.a,W.b);return pr.d<10&&pr.tRaw>-0.05&&pr.tRaw<1.05;})||null;}
// fill every gap in the run the cabinet sits in: standard widths first, a filler for the rest (like Auto-fill in classic kitchen software)
function fillRun(p,f){const W=wallOfFixture(p,f);if(!W)return {p,n:0,msg:'Put the cabinet against a wall in a room first.'};const IE=elevIE(p,W);const along=pt=>(pt.x-IE.start.x)*IE.dir.x+(pt.y-IE.start.y)*IE.dir.y;const t=tierOf(f);
  const blocks=IE.fixtures.filter(g=>t==='w'?(g.type==='wallcab'||g.type==='tall'||g.type==='fridge'||(g.elev||0)+g.h>54):g.type!=='wallcab'&&(g.elev||0)<36).map(g=>{const s=along(g);return [s-g.w/2,s+g.w/2];});
  for(const o of IE.openings){const c=openingCenter(p,o);const s=along(c);const z0=o.type==='door'?0:o.sill,z1=z0+o.height;if(t==='b'?z0<36:z1>54)blocks.push([s-o.width/2-3,s+o.width/2+3]);}
  blocks.sort((a,b)=>a[0]-b[0]);const gaps=[];let cur=0;for(const [a,b] of blocks){if(a-cur>0.24)gaps.push([cur,a]);cur=Math.max(cur,b);}if(IE.len-cur>0.24)gaps.push([cur,IE.len]);
  // only gaps that touch the selected cabinet's run (no wide-open walls)
  const sF=along(f);const near=gaps.filter(([a,b])=>Math.abs(a-(sF+f.w/2))<0.6||Math.abs(b-(sF-f.w/2))<0.6);
  const add=[];const into={x:-IE.facing.x,y:-IE.facing.y};const mk=(type,s,w,lib,name)=>{const pt={x:IE.start.x+IE.dir.x*s,y:IE.start.y+IE.dir.y*s};const d=f.d;
    return {id:uid('fx'),level:f.level,type,x:pt.x+into.x*d/2,y:pt.y+into.y*d/2,w,d,h:f.h,elev:f.elev||0,rot:f.rot||0,status:'new',...(lib?{lib}:{}),name};};
  for(const [a,b] of near){let s=a,g=b-a;
    while(g>=9-0.01){const w=[...CAB_W].reverse().find(x=>x<=g+0.01);if(!w)break;const lib=t==='w'?null:`c-base-${w}`;add.push(mk(f.type==='sinkbase'?'base':f.type,s+w/2,w,LIB_BY_ID[lib]?lib:null,t==='w'?`Wall cabinet ${w}"`:`Base cabinet ${w}"`));s+=w;g-=w;}
    if(g>=0.24){add.push(mk('filler',s+g/2,Math.round(g*8)/8,null,`${t==='w'?'Wall':'Base'} filler ${fmtLen(Math.round(g*8)/8)}`));}}
  if(!add.length)return {p,n:0,msg:'There is no gap next to this cabinet to fill.'};
  return {p:{...p,fixtures:[...p.fixtures,...add]},n:add.length,msg:`Filled the run with ${add.filter(x=>x.type!=='filler').length} cabinet${add.filter(x=>x.type!=='filler').length===1?'':'s'} and ${add.filter(x=>x.type==='filler').length} filler${add.filter(x=>x.type==='filler').length===1?'':'s'}. Undo takes them out.`};}
// one LED strip light under every wall cabinet that has none
function underCabLights(p,levelId){const cabs=(p.fixtures||[]).filter(f=>f.level===levelId&&f.type==='wallcab'&&f.status!=='demolish');const have=(p.elec||[]).filter(d=>d.type==='undercab'&&d.level===levelId);const add=[];
  for(const f of cabs){if(have.some(d=>inPoly(d.x,d.y,fxCorners(f).map(c=>[c.x,c.y]))))continue;const fr=fxFront(f);const e=newElec('undercab',levelId,f.x+fr.x*(f.d/2-2),f.y+fr.y*(f.d/2-2),f.rot||0);e.auto=true;e.w=Math.max(8,f.w-4);add.push(e);}
  return {p:{...p,elec:[...(p.elec||[]),...add]},n:add.length};}
const RCP_EL=new Set(['light','can','pendant','fan','smoke','co','combo','exhaust','exit']);
const RCP_FILTER={issues:false,roof:false,fxOnly:f=>f.type==='decorceil'||f.type==='wallcab'||f.type==='tall',elOnly:d=>RCP_EL.has(d.type),wallDims:false,dims:false,counters:false,elec:true};
// ---------- layout templates: drop a whole kitchen or bath into a room ----------
const LAYOUTS=[['one','One-wall kitchen'],['L','L-shaped kitchen'],['Lisl','L-shaped kitchen with island'],['U','U-shaped kitchen'],['galley','Galley kitchen'],['bath5','Bath: tub, toilet and vanity on one wall']];
function roomEdgesOf(p,room){return roomWalls(p).filter(W=>W.room.id===room.id).sort((a,b)=>a.i-b.i);}
const hasWall=W=>W.wall>=0.6;
function layoutTemplate(p,room,kind){const E=roomEdgesOf(p,room);if(!E.length)return {p,n:0,msg:'That room has no walls long enough.'};const lv=lvlOf(p,room.level);
  const walled=E.filter(hasWall);if(!walled.length)return {p,n:0,msg:'That room has no walls to put cabinets against.'};const longest=[...walled].sort((a,b)=>b.L-a.L)[0];const idx=E.indexOf(longest);const nxt=k=>E[(idx+k+E.length)%E.length];
  const pick=kind==='one'||kind==='bath5'?[longest]:kind==='L'||kind==='Lisl'?[longest,nxt(1)]:kind==='U'?[nxt(-1),longest,nxt(1)]:[longest,E.find(W=>W!==longest&&Math.abs(W.n.x*longest.n.x+W.n.y*longest.n.y+1)<0.05)||nxt(2)];
  for(let i=pick.length-1;i>=0;i--)if(!pick[i]||!hasWall(pick[i]))pick.splice(i,1);
  const add=[];const rotFor=n=>Math.round((Math.atan2(-n.x,n.y)*180/Math.PI+360)%360);
  const put=(W,s,w,d,type,extra={})=>{const t=(s)/W.L;const pt={x:W.a.x+(W.b.x-W.a.x)*t,y:W.a.y+(W.b.y-W.a.y)*t};add.push({id:uid('fx'),level:room.level,type,x:pt.x+W.n.x*d/2,y:pt.y+W.n.y*d/2,w,d,h:(FIXTURES[type]||{}).h||34.5,elev:0,rot:rotFor(W.n),status:'new',_w:W.key,...extra});};
  const blocks=(W,tier)=>{const out=[];const d={x:(W.b.x-W.a.x)/W.L,y:(W.b.y-W.a.y)/W.L};for(const o of p.openings){const c=openingCenter(p,o);if(!c||c.w.level!==room.level)continue;const pr=projSeg(c,W.a,W.b);if(pr.d>c.w.thick/2+1||pr.tRaw<=0||pr.tRaw>=1)continue;
      const s=pr.tRaw*W.L;const z0=o.type==='door'?0:o.sill,z1=z0+o.height;if(o.type==='door'||(tier==='b'?z0<36:z1>54))out.push([s-o.width/2-3,s+o.width/2+3,o]);}return out.sort((a,b)=>a[0]-b[0]);};
  const segs=(W,a,b,tier)=>{const bl=blocks(W,tier);const out=[];let cur=a;for(const [x0,x1] of bl){if(x0>cur+0.5)out.push([cur,Math.min(x0,b)]);cur=Math.max(cur,x1);}if(b>cur+0.5)out.push([cur,b]);return out.filter(s=>s[1]-s[0]>=9);};
  const fill=(W,a,b,tier,specials=[])=>{// specials: [{w,type,at,extra}] placed first at "at" (or centered), then standard widths fill the rest
    const items=[];for(const sp of specials){let s0=Math.round((sp.at??(a+b)/2)-sp.w/2);s0=Math.max(a,Math.min(b-sp.w,s0));if(b-a<sp.w)continue;items.push([s0,s0+sp.w,sp]);}
    items.sort((x,y)=>x[0]-y[0]);let cur=a;const gaps=[];for(const [x0,x1] of items){if(x0-cur>0.24)gaps.push([cur,x0]);cur=Math.max(cur,x1);}if(b-cur>0.24)gaps.push([cur,b]);
    for(const [x0,x1,sp] of items)put(W,(x0+x1)/2,sp.w,sp.d||(tier==='w'?12:24),sp.type,sp.extra||{});
    for(const [g0,g1] of gaps){let s=g0,g=g1-g0;while(g>=9-0.01){const w=[...CAB_W].reverse().find(x=>x<=g+0.01&&x<=36);put(W,s+w/2,w,tier==='w'?12:24,tier==='w'?'wallcab':'base',tier==='w'?{h:30,elev:54,name:`Wall cabinet ${w}"`}:{name:`Base cabinet ${w}"`,lib:LIB_BY_ID['c-base-'+w]?'c-base-'+w:undefined});s+=w;g-=w;}
      if(g>=0.24)put(W,s+g/2,Math.round(g*8)/8,tier==='w'?12:24,'filler',tier==='w'?{h:30,elev:54}:{h:34.5});}};
  if(kind==='bath5'){const W=longest;const sg=segs(W,0,W.L,'b')[0];if(!sg||sg[1]-sg[0]<30+36+24)return {p,n:0,msg:'The longest wall needs about 7 1/2\' clear for a tub, toilet and vanity.'};
    {const t=(sg[0]+15)/W.L;const pt={x:W.a.x+(W.b.x-W.a.x)*t,y:W.a.y+(W.b.y-W.a.y)*t};add.push({id:uid('fx'),level:room.level,type:'tub',x:pt.x+W.n.x*30,y:pt.y+W.n.y*30,w:60,d:30,h:20,elev:0,rot:(rotFor(W.n)+90)%360,status:'new'});}
    put(W,sg[0]+30+18,20,28,'toilet',{h:30});const vw=Math.min(48,[...[24,30,36,48]].reverse().find(x=>x<=sg[1]-(sg[0]+30+36))||0);if(vw)put(W,sg[0]+30+36+vw/2,vw,21,'vanity',{h:34});
    for(const f of add)delete f._w;
    return {p:{...p,fixtures:[...p.fixtures,...add]},n:add.length,msg:`Laid out a bath on the ${DZ_DIRS(W.facing).toLowerCase()} wall. Undo takes it out.`};}
  // kitchens: runs along the picked walls; the run that meets a corner already taken starts 24" + 3" filler away from it
  const used=new Set(pick);const sinkW=kind==='U'?pick[1]:pick[0],rangeW=pick.length===1?pick[0]:kind==='U'?pick[0]:pick[1],fridgeW=pick[pick.length-1];
  pick.forEach((W,k)=>{const prev=E[(E.indexOf(W)-1+E.length)%E.length],next=E[(E.indexOf(W)+1)%E.length];let a=used.has(prev)&&pick.indexOf(prev)<k?27:0,b=W.L;if(used.has(next)&&pick.indexOf(next)<k)b-=27;
    const bs=segs(W,a,b,'b');const ws=segs(W,a,b,'w');const win=blocks(W,'w').find(x=>x[2].type==='window');
    bs.forEach((sg,j)=>{const sp=[];if(W===sinkW&&j===0)sp.push({w:36,type:'sinkbase',at:win?(win[0]+win[1])/2:undefined,extra:{name:'Sink base 36"'}});
      if(W===fridgeW&&j===bs.length-1&&sg[1]-sg[0]>=36+30+18)sp.push({w:36,d:30,type:'fridge',at:sg[1]-18,extra:{h:70,name:'Refrigerator 36"'}});
      if(W===rangeW&&(W===sinkW?j===0:j===bs.length-1||j===0)&&!sp.some(x=>x.type==='range')&&sg[1]-sg[0]>=30+30+(sp.length?40:0)){const at=pick.length>1?(sg[0]+sg[1])/2:sg[0]+Math.min(42,(sg[1]-sg[0])/2);sp.push({w:30,d:26,type:'range',at,extra:{h:36,name:'Range 30"'}});}
      fill(W,sg[0],sg[1],'b',sp);});
    // wall cabinets above, skipping the fridge, range and windows
    const skip=add.filter(f=>(f.type==='fridge'||f.type==='range')&&f._w===W.key).map(f=>{const t=((f.x-W.a.x)*(W.b.x-W.a.x)+(f.y-W.a.y)*(W.b.y-W.a.y))/(W.L*W.L)*W.L;return [t-f.w/2,t+f.w/2,f.type];});
    const at=s=>{const t=s/W.L;return {x:W.a.x+(W.b.x-W.a.x)*t,y:W.a.y+(W.b.y-W.a.y)*t};};
    for(const [x0,x1,ty] of skip){const pt=at((x0+x1)/2);if(ty==='range')add.push({id:uid('fx'),level:room.level,type:'wallcab',lib:'a-hood-30',name:'Range hood 30"',x:pt.x+W.n.x*7.5,y:pt.y+W.n.y*7.5,w:30,d:15,h:16,elev:66,rot:rotFor(W.n),status:'new'});
      else add.push({id:uid('fx'),level:room.level,type:'wallcab',name:'Over-fridge cabinet 36" x 15"',x:pt.x+W.n.x*12,y:pt.y+W.n.y*12,w:36,d:24,h:15,elev:72,rot:rotFor(W.n),status:'new'});}
    for(const sg of ws){let parts=[[sg[0],sg[1]]];for(const [x0,x1] of skip)parts=parts.flatMap(([a2,b2])=>x1<=a2||x0>=b2?[[a2,b2]]:[[a2,x0],[x1,b2]]).filter(q=>q[1]-q[0]>0.24);
      for(const [a2,b2] of parts)if(b2-a2>=9)fill(W,a2,b2,'w');}});
  if(kind==='Lisl'){const xs=room.pts.map(q=>q[0]),ys=room.pts.map(q=>q[1]);const bw=Math.max(...xs)-Math.min(...xs),bh=Math.max(...ys)-Math.min(...ys);
    if(Math.min(bw,bh)>=24*2+42*2+36){const cx=(Math.max(...xs)+Math.min(...xs))/2,cy=(Math.max(...ys)+Math.min(...ys))/2;const W=longest;const iw=Math.min(72,Math.floor((W.L-2*42-48)/12)*12);
      if(iw>=36)add.push({id:uid('fx'),level:room.level,type:'island',x:cx+W.n.x*6,y:cy+W.n.y*6,w:iw,d:36,h:34.5,elev:0,rot:rotFor({x:-W.n.x,y:-W.n.y}),status:'new',name:`Island ${iw}"`});}}
  for(const f of add)delete f._w;
  if(!add.length)return {p,n:0,msg:'There was no clear wall to lay out a kitchen.'};
  return {p:{...p,fixtures:[...p.fixtures,...add]},n:add.length,msg:`Laid out a ${(LAYOUTS.find(x=>x[0]===kind)||['',''])[1].replace(/^L-/,'L-').toLowerCase().replace('l-shaped','L-shaped')} in ${room.name}: ${add.filter(isCab).length} cabinets and ${add.filter(f=>!isCab(f)).length} appliances.${add.some(f=>f.type==='fridge')?'':' There was no clear 36" spot left for the refrigerator; place one from the catalog.'} Undo takes it out.`};}
