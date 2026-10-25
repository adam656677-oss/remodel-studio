/* ======================= typical details sheet (D1.1), drawn from this project's own framing and finishes ======================= */
// Six details, picked to match the job: wall section, opening framing, floor finish, shower, stair, deck ledger or
// cabinet backing. Sizes come from the model (stud size, joist depth, plate height, header sizes, stair geometry).
function detailPainter(dl,k,cell,bb){// bb: [x0,y0,x1,y1] in inches of the detail; cell in sheet inches
  const pad=0.28*k,labW=1.55*k;const aw=cell.w-pad*2-labW,ah=cell.h-pad*2-0.35*k;const ew=bb[2]-bb[0],eh=bb[3]-bb[1];const s=Math.min(aw/ew,ah/eh);
  const ox=cell.x+pad+(aw-ew*s)*0.35,oy=cell.y+0.3*k+ah-(ah-eh*s)/2;
  const X=x=>ox+(x-bb[0])*s,Y=y=>oy-(y-bb[1])*s;const notes=[];
  const D={s,X,Y,
    rect(x,y,w,h,o={}){dl.poly([[X(x),Y(y)],[X(x+w),Y(y)],[X(x+w),Y(y+h)],[X(x),Y(y+h)]],{stroke:INK,w:o.w||0.5,fill:o.fill||'#ffffff',dash:o.dash});
      if(o.hatch==='wood'){dl.line(X(x),Y(y),X(x+w),Y(y+h),0.25);dl.line(X(x),Y(y+h),X(x+w),Y(y),0.25);}
      if(o.hatch==='insul'){const n=Math.max(2,Math.round(h/(w||1)*1.5));const pts=[];for(let i=0;i<=n*2;i++){pts.push([X(x+(i%2?w*0.85:w*0.15)),Y(y+h*i/(n*2))]);}for(let i=0;i+1<pts.length;i++)dl.line(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],0.25,{color:MID});}
      if(o.hatch==='earth'){for(let t=0;t<w+h;t+=3){const a=[x+Math.max(0,t-h),y+Math.min(t,h)],b=[x+Math.min(t,w),y+Math.max(0,t-w)];dl.line(X(a[0]),Y(a[1]),X(b[0]),Y(b[1]),0.2,{color:MID});}}
      if(o.hatch==='conc'){for(let i=0;i<Math.min(40,w*h/30);i++){const px=x+((i*37)%97)/97*w,py=y+((i*53)%89)/89*h;dl.circle(X(px),Y(py),0.008*k,{fill:MID});}}},
    line(x1,y1,x2,y2,w=0.5,o={}){dl.line(X(x1),Y(y1),X(x2),Y(y2),w,o);},
    poly(pts,o={}){dl.poly(pts.map(([x,y])=>[X(x),Y(y)]),{stroke:INK,w:0.5,...o});},
    note(x,y,t){notes.push({x,y,t});},
    dim(x,y1,y2,t){const xx=X(x);dl.line(xx,Y(y1),xx,Y(y2),0.3);dl.line(xx-0.03*k,Y(y1),xx+0.03*k,Y(y1),0.3);dl.line(xx-0.03*k,Y(y2),xx+0.03*k,Y(y2),0.3);dl.text(xx-0.04*k,(Y(y1)+Y(y2))/2,t,{size:4.6*k,anchor:'end'});},
    finish(no,title,scaleLab){// labels down the right side with leaders, then the title bubble
      const lx=cell.x+cell.w-labW-0.05*k;notes.sort((a,b)=>Y(a.y)-Y(b.y));let last=-1e9;
      for(const n of notes){let ty=Math.max(Y(n.y),last+0.2*k);const lines=wrapText(n.t,labW,4.6*k).slice(0,3);if(ty+lines.length*0.09*k>cell.y+cell.h-0.4*k)continue;
        dl.line(X(n.x),Y(n.y),lx-0.03*k,ty-0.02*k,0.25);dl.circle(X(n.x),Y(n.y),0.012*k,{fill:INK});lines.forEach((l,i)=>dl.text(lx,ty+i*0.09*k,l,{size:4.6*k}));last=ty+(lines.length-1)*0.09*k;}
      const by=cell.y+cell.h-0.18*k,bx=cell.x+0.2*k;dl.circle(bx,by,0.13*k,{stroke:INK,w:0.6,fill:'#ffffff'});dl.line(bx-0.13*k,by,bx+0.13*k,by,0.4);dl.text(bx,by-0.03*k,String(no),{size:5.5*k,bold:true,anchor:'middle'});dl.text(bx,by+0.1*k,'D1.1',{size:4*k,anchor:'middle'});
      dl.text(bx+0.2*k,by+0.02*k,title.toUpperCase(),{size:6.5*k,bold:true});dl.text(bx+0.2*k,by+0.12*k,scaleLab||'NOT TO SCALE',{size:4.5*k,color:MID});}};
  return D;}
function dtWallSection(p,D){const g=groundLevel(p);const fr=framingOf(g);const E=energyOf(p);const ext=p.walls.find(w=>w.kind==='exterior'&&w.level===g.id);const stud=ext&&ext.thick>=6?5.5:3.5;const sName=stud>4?'2x6':'2x4';
  const J=joistOpt(g);const jd=joistDepth(J);const H=g.height;const found=fr.foundation||'crawl';const crawlH=found==='crawl'?Math.max(18,(p.settings?.gradeOffset||24)-jd):0;const roof=(p.roofs||[])[0];const pitch=roof?roof.pitch||6:6;
  let y=0;// grade at y=found==='slab'?8:crawlH
  if(found==='slab'){D.rect(-6,-12,40,12,{hatch:'earth',fill:'#ffffff',w:0.2});D.rect(-2,-12,10,20,{fill:'#e6e6e6',hatch:'conc'});D.rect(8,0,26,4,{fill:'#e6e6e6',hatch:'conc'});D.note(20,2,`4" concrete slab on 6 mil vapor retarder${E.slab?`, R-${E.slab} slab edge insulation`:''}`);D.note(2,-6,'Thickened slab edge or footing per R403.1');y=8;}
  else{const fh=found==='basement'?96:crawlH;D.rect(-6,-14,44,14,{hatch:'earth',fill:'#ffffff',w:0.2});D.rect(-4,-14,16,8,{fill:'#e6e6e6',hatch:'conc'});D.rect(0,-6,8,fh+6,{fill:'#eeeeee'});
    D.note(4,-10,'Concrete footing, below frost depth (R403.1)');D.note(4,fh*0.4,found==='basement'?'Concrete or block basement wall, damp-proofed (R406)':'Block or concrete stem wall; foundation vents (R408.1)');
    D.rect(0,fh,stud+0.5,1.5,{fill:'#f3e3c4',hatch:'wood'});D.note(stud/2,fh+0.75,'Treated sill plate, anchor bolts 6\' o.c. max (R403.1.6)');
    D.rect(0,fh+1.5,1.5,jd,{fill:'#f3e3c4'});D.note(0.75,fh+1.5+jd/2,'Rim joist');for(let i=0;i<3;i++)D.rect(10+i*10,fh+1.5,1.5,jd,{fill:'#f3e3c4'});D.note(25,fh+1.5+jd*0.6,`${joistLabel(J)} at ${J.spacing||16}" o.c.`);
    if(E.floor)D.rect(11.5,fh+1.5,8.5,jd*0.7,{hatch:'insul',w:0.2});if(E.floor)D.note(15,fh+1.5+jd*0.3,`R-${E.floor} floor insulation`);
    D.rect(0,fh+1.5+jd,40,0.75,{fill:'#f3e3c4'});D.note(34,fh+2.25+jd,'3/4" T&G subfloor, glued and nailed');y=fh+2.25+jd;}
  const y0=y;D.rect(0,y0,stud,1.5,{fill:'#f3e3c4',hatch:'wood'});D.rect(0,y0+1.5,stud,H-4.5,{fill:'#fbf3e3'});D.rect(0,y0+H-3,stud,1.5,{fill:'#f3e3c4',hatch:'wood'});D.rect(0,y0+H-1.5,stud,1.5,{fill:'#f3e3c4',hatch:'wood'});
  D.note(stud/2,y0+H*0.75,`${sName} studs at 16" o.c., double top plate`);D.rect(0.3,y0+3,stud-0.6,H-7,{hatch:'insul',w:0.15,fill:'transparent'});D.note(stud/2,y0+H*0.5,`R-${E.wallCav} cavity insulation${E.wallCi?` + R-${E.wallCi} continuous`:''}`);
  D.rect(-0.5,y0-1,0.5,H+1,{fill:'#e8d6b0'});D.rect(-1.1,y0-1,0.6,H+1,{fill:'#ffffff',dash:[0.02,0.02]});D.note(-0.8,y0+H*0.3,'7/16" OSB sheathing, water-resistive barrier (R703.2), siding (R703)');
  D.rect(stud,y0,0.5,H,{fill:'#ffffff'});D.note(stud+0.25,y0+H*0.4,'1/2" gypsum board (R702.3)');
  const cj=LUMBER[fr.ceiling]||5.5;D.rect(0,y0+H,34,cj,{fill:'#f3e3c4'});D.note(28,y0+H+cj/2,`${fr.ceiling} ceiling joists at ${fr.ceilingSpacing||16}" o.c.`);D.rect(stud,y0+H-0.5,30,0.5,{fill:'#ffffff'});
  D.rect(stud+1,y0+H+cj,28,10,{hatch:'insul',w:0.15,fill:'transparent'});D.note(20,y0+H+cj+6,`R-${E.ceil} attic insulation, baffles at the eaves`);
  const rise=pitch/12;const ry=y0+H+cj;const x1=-14,x2=36;D.poly([[x1,ry+rise*(x1-0)],[x2,ry+rise*x2],[x2,ry+rise*x2+7.25],[x1,ry+rise*x1+7.25]],{fill:'#f3e3c4'});D.note(30,ry+rise*30+3.6,roof&&rafterOf(roof).system==='trusses'?'Engineered roof trusses, hurricane ties to the top plate (R802.11)':`${rafterOf(roof||{}).rafter} rafters, ${pitch}:12, hurricane ties (R802.11)`);
  D.poly([[x1,ry+rise*x1+7.25],[x2,ry+rise*x2+7.25],[x2,ry+rise*x2+8],[x1,ry+rise*x1+8]],{fill:'#666666'});D.note(10,ry+rise*10+7.7,'Roof sheathing, underlayment, shingles (R905)');
  D.line(x1,ry+rise*x1,x1,ry+rise*x1+7.25,0.6);D.rect(x1,ry+rise*x1-0.75,-0,0.75);D.note(x1,ry+rise*x1+3,'Fascia, vented soffit (R806)');
  D.dim(-9,y0,y0+H,fmtLen(H)+' plate');}
function wallSectionBB(p){const g=groundLevel(p);const fr=framingOf(g);const jd=joistDepth(joistOpt(g));const H=g.height;const found=fr.foundation||'crawl';const fh=found==='basement'?96:found==='crawl'?Math.max(18,(p.settings?.gradeOffset||24)-jd):0;
  const y0=found==='slab'?8:fh+2.25+jd;const cj=LUMBER[fr.ceiling]||5.5;const pitch=((p.roofs||[])[0]||{}).pitch||6;const top=y0+H+cj+pitch/12*36+10;return [-26,-16,44,Math.max(150,top)];}
function dtHeader(p,D){let hs=[];try{hs=headerSchedule(p);}catch(e){}const big=hs.sort((a,b)=>(parseInt(b.span)||0)-(parseInt(a.span)||0))[0];const w=48,h=80;const hd=big&&/2x12/.test(big.header)?11.25:big&&/2x10/.test(big.header)?9.25:big&&/2x8/.test(big.header)?7.25:5.5;
  const top=h+hd+6;D.rect(-6,0,4.5,1.5,{fill:'#f3e3c4',hatch:'wood'});D.rect(w+6,0,3,1.5,{fill:'#f3e3c4',hatch:'wood'});D.note(-4,0.75,'Bottom plate cut out at door openings');D.rect(-6,top,w+12+3,1.5,{fill:'#f3e3c4',hatch:'wood'});D.rect(-6,top+1.5,w+12+3,1.5,{fill:'#f3e3c4',hatch:'wood'});
  D.rect(-6,1.5,1.5,top-1.5,{fill:'#fbf3e3'});D.rect(w+7.5,1.5,1.5,top-1.5,{fill:'#fbf3e3'});D.note(-5.25,top*0.6,'King stud each side');
  D.rect(-4.5,1.5,1.5,h-1.5,{fill:'#f3e3c4'});D.rect(w+6,1.5,1.5,h-1.5,{fill:'#f3e3c4'});D.note(w+6.75,h*0.4,`Jack (trimmer) stud${big&&big.jacks>1?'s, '+big.jacks+' each side':''} (R602.7.5)`);
  D.rect(-4.5,h,w+12,hd,{fill:'#f3e3c4'});D.note(w/2,h+hd/2,`Header ${big?big.header:'(2) 2x6'} on edge with 1/2" spacer${big?`, at ${big.mark} (largest opening)`:''} (R602.7)`);
  for(const x of [10,26,40])D.rect(x,h+hd,1.5,top-h-hd,{fill:'#fbf3e3'});D.note(26.75,h+hd+3,'Cripple studs at 16" o.c.');D.dim(-10,1.5,h,'R.O. '+fmtLen(h-1.5));D.line(-3,h,w+6,h,0.3,{dash:[0.03,0.02]});}
function dtFloorTile(p,D){const tile=p.rooms.some(r=>(r.finish||(r.use==='bath'||r.use==='kitchen'?'tile':''))==='tile');const g=groundLevel(p);const J=joistOpt(g);const jd=Math.min(11.25,joistDepth(J));
  D.rect(0,0,40,jd,{fill:'#ffffff'});for(const x of [2,18,34])D.rect(x,0,1.5,jd,{fill:'#f3e3c4'});D.note(18.75,jd/2,`${joistLabel(J)} at ${J.spacing||16}" o.c.; tile needs L/360, stone L/720`);
  D.rect(0,jd,40,0.75,{fill:'#f3e3c4'});D.note(30,jd+0.4,'3/4" plywood or OSB subfloor');D.rect(0,jd+0.75,40,0.5,{fill:'#dfe5ea'});D.note(25,jd+1,tile?'1/4" cement backer or uncoupling membrane, thinset bonded (ANSI A118)':'Underlayment per flooring maker');
  D.rect(0,jd+1.25,40,0.4,{fill:'#c9ccd0'});D.rect(0,jd+1.65,40,0.4,{fill:tile?'#e8e1d5':'#d7c19b'});D.note(12,jd+1.85,tile?'Modified thinset, 95% coverage wet areas; tile with 1/8" grout joints':'Finish flooring');
  D.rect(40,jd+2.05,0.5,6,{fill:'#ffffff'});D.note(40.25,jd+5,'1/4" movement joint at walls and every 20-25 ft (TCNA EJ171)');}
function dtShower(p,D){D.rect(0,0,44,0.75,{fill:'#f3e3c4'});D.note(30,0.4,'Subfloor');D.poly([[4,0.75],[40,0.75],[40,2.2],[22,1.4],[4,2.2]],{fill:'#e6e6e6'});D.note(10,1.6,'Mortar pre-slope 1/4" per foot to the drain (P2709.2)');
  D.poly([[4,2.2],[22,1.4],[40,2.2],[40,2.4],[22,1.6],[4,2.4]],{fill:'#2a6fb0'});D.note(32,2.3,'Waterproof membrane (P2709.2.1), up the walls 3" above the curb and 72" min at the head');
  D.rect(21,0,2,1.6,{fill:'#9aa0a6'});D.note(22,0.4,'Clamping-ring or bonded-flange drain');D.rect(40,0.75,4,4.5,{fill:'#f3e3c4'});D.note(42,3,'Curb, 2" min above the drain, wrapped in membrane');
  D.rect(0,2.4,1.5,46,{fill:'#f3e3c4'});D.rect(1.5,2.4,0.5,46,{fill:'#dfe5ea'});D.note(1.75,30,'Cement, fiber-cement or glass-mat backer board, not greenboard (R702.4.2)');D.rect(2,2.4,0.4,46,{fill:'#e8e1d5'});D.note(2.2,18,'Tile on walls to 72" above the drain (R307.2)');
  D.rect(2,2.4,38,0.4,{fill:'#e8e1d5'});}
function dtStair(p,D){const R=7.75,T=10,n=6;let x=0,y=0;const pts=[[0,0]];for(let i=0;i<n;i++){y+=R;pts.push([x,y]);x+=T;pts.push([x,y]);}pts.push([x,y-9],[0,-9]);D.poly(pts,{fill:'#f3e3c4'});
  D.note(T*1.5,R*2,'Riser 7-3/4" max, tread 10" min, measured nosing to nosing (R311.7.5)');D.note(T*0.5+0.5,R+0.4,'Nosing 3/4" to 1-1/4" where treads are under 11" (R311.7.5.3)');
  D.line(0,R+34,x,y+34,0.6);D.note(x*0.6,R+34+(y-R)*0.6,'Handrail 34" to 38" above the nosings, graspable 1-1/4" to 2" (R311.7.8)');D.line(x,y,x+20,y,0.5);D.line(x,y+36,x+20,y+36,0.6);for(let i=0;i<4;i++)D.line(x+2+i*4.5,y,x+2+i*4.5,y+36,0.3);D.note(x+12,y+36,'Guard 36" min where the drop is over 30"; a 4" sphere must not pass (R312.1)');
  D.dim(-4,0,R,'7-3/4" max');D.line(0,R*1+80,x,y+80,0.3,{dash:[0.03,0.02]});D.note(x*0.3,R+80+(y-R)*0.3,'Headroom 6\'-8" min (R311.7.2)');}
function dtLedger(p,D){D.rect(0,0,7.25,60,{fill:'#fbf3e3'});D.note(3.6,40,'House rim joist and band');D.rect(7.25,30,1.5,9.25,{fill:'#c7d9b8',hatch:'wood'});D.note(8,36,'2x10 treated ledger, no siding behind it (R507.9.1)');
  for(const y of [32.5,36.75])D.line(4,y,8.75,y,0.9);D.note(6,32.5,'1/2" lag screws or through-bolts, staggered, spacing per Table R507.9.1.3(1)');D.poly([[6,39.25],[9.5,39.25],[11,40.5],[6,41]],{fill:'#9aa0a6'});D.note(8,40,'Z-flashing over the ledger, lapped under the WRB (R703.4)');
  D.rect(8.75,30,30,9.25,{fill:'#c7d9b8'});D.note(25,34.5,'Deck joists in joist hangers');D.rect(8.75,39.25,30,1,{fill:'#c7d9b8'});D.note(30,40,'Decking');D.rect(36,0,3.5,30,{fill:'#c7d9b8'});D.note(37.75,15,'Post, beam and footing per R507.3–R507.5');}
function dtBacking(p,D){D.rect(0,0,60,1.5,{fill:'#f3e3c4',hatch:'wood'});D.rect(0,94.5,60,1.5,{fill:'#f3e3c4',hatch:'wood'});for(const x of [0,16,32,48])D.rect(x,1.5,1.5,93,{fill:'#fbf3e3'});
  D.rect(1.5,32,46.5,3.5,{fill:'#f3e3c4',hatch:'wood'});D.note(30,33.75,'2x blocking at 32"–36" for base cabinets and countertop support');D.rect(1.5,52,46.5,3.5,{fill:'#f3e3c4',hatch:'wood'});D.note(30,53.75,'2x blocking at 54" for the bottom of wall cabinets');
  D.rect(1.5,82,46.5,3.5,{fill:'#f3e3c4',hatch:'wood'});D.note(30,83.75,'2x blocking at 84" for the top of 30" wall cabinets');D.rect(49.5,33,10.5,3.5,{fill:'#f3e3c4',hatch:'wood'});D.note(55,34.75,'Grab bar backing 33"–36" (ADA 609.4)');
  D.dim(-3,0,34,'34"');D.dim(-7,0,54,'54"');}
function detailsSheet(p){if(!p.walls.length)return null;const P=PAPERS[p.sheet?.paper]||PAPERS.tabloid;const k=P.k;const dl=DL();const A=sheetFrame(dl,P,p,'D1.1','Typical details','AS NOTED');
  const hasShower=(p.fixtures||[]).some(f=>['shower','rollin','tub'].includes(f.type));const hasStair=(p.stairs||[]).length>0;const hasDeck=(p.decks||[]).length>0||(p.porches||[]).length>0;
  const BACK=['Cabinet and grab bar backing',dtBacking,[-10,-2,62,98]];
  const list=[['Typical wall section',dtWallSection,wallSectionBB(p)],['Opening framing',dtHeader,[-12,-2,62,96]],['Floor finish assembly',dtFloorTile,[-2,-2,46,24]],
    hasShower?['Shower pan and walls',dtShower,[-2,-2,46,50]]:BACK,hasStair?['Stair, handrail and guard',dtStair,[-8,-12,84,132]]:null,hasDeck?['Deck ledger',dtLedger,[-2,-2,42,64]]:hasShower?BACK:null].filter(Boolean);
  const cols=3,rows=Math.ceil(list.length/cols);const cw=(A.x1-A.x0)/cols,ch=(A.y1-A.y0)/rows;
  list.forEach(([title,fn,ext],i)=>{const cell={x:A.x0+(i%cols)*cw,y:A.y0+Math.floor(i/cols)*ch,w:cw,h:ch};if(i%cols)dl.line(cell.x,cell.y+0.1*k,cell.x,cell.y+ch-0.1*k,0.3,{color:MID});if(i>=cols)dl.line(cell.x+0.1*k,cell.y,cell.x+cw-0.1*k,cell.y,0.3,{color:MID});
    const D=detailPainter(dl,k,cell,ext);try{fn(p,D);}catch(e){console.warn('detail',title,e);}D.finish(i+1,title,'NOT TO SCALE');});
  return {id:'dt',no:'D1.1',title:'Typical details',w:P.w,h:P.h,items:dl.items,scale:''};}
// shift a painter so detail coordinates can go negative (foundations below grade, eaves to the left)
function wrapDetail(D,dx,dy){const T=(x,y)=>[x+dx,y+dy];return {...D,rect:(x,y,w,h,o)=>D.rect(x+dx,y+dy,w,h,o),line:(x1,y1,x2,y2,w,o)=>D.line(x1+dx,y1+dy,x2+dx,y2+dy,w,o),poly:(pts,o)=>D.poly(pts.map(([x,y])=>T(x,y)),o),note:(x,y,t)=>D.note(x+dx,y+dy,t),dim:(x,a,b,t)=>D.dim(x+dx,a+dy,b+dy,t)};}
{const _bs=buildSheets;buildSheets=function(p){const out=_bs(p);try{const s=detailsSheet(p);if(s){let i=-1;out.forEach((x,j)=>{if(/^S/.test(x.no))i=j;});out.splice(i>=0?i+1:out.length,0,s);}}catch(e){console.warn('details sheet',e);}return out;};}
