/* ======================= clash and notch checks: pipes and ducts against joists, girders, studs and each other ======================= */
// IRC R502.8.1: bored holes in sawn joists no larger than 1/3 of the depth and no closer than 2" to the top or bottom edge.
// IRC R602.6: bored holes in studs no larger than 40% of the stud width in bearing walls (60% if doubled), 60% in
// non-bearing walls, with at least 5/8" left to the edge. I-joists follow the maker's hole chart; never cut the flanges.
const PIPE_OD={'1/2"':0.625,'3/4"':0.875,'1"':1.125,'1-1/2"':1.9,'2"':2.375,'3"':3.5,'4"':4.5};
const GAS_OD={'1/2"':0.84,'3/4"':1.05,'1"':1.315};
const pipeOD=o=>o.sys==='gas'?(GAS_OD[o.size]||1.05):(PIPE_OD[o.size]||(pipeD(o.size)+0.375));
const R_JOIST={set:'Framing',code:'R502.8.1',title:'Drilling and notching of floor joists'};
const R_STUD={set:'Framing',code:'R602.6',title:'Drilling and notching of studs'};
const R_GIRDER={set:'Framing',code:'R502.8',title:'Beams and girders are not cut or bored'};
const R_CLASH={set:'Framing',code:'Coordination',title:'Two systems in the same space'};
const _jlCache=new WeakMap();
function floorLayoutCached(p,lv){let m=_jlCache.get(p);if(!m){m=new Map();_jlCache.set(p,m);}if(!m.has(lv.id)){let L=null;try{L=joistLayout(p,lv,'floor');}catch(e){}m.set(lv.id,L);}return m.get(lv.id);}
function segCross(a,b,c,d){const r={x:b.x-a.x,y:b.y-a.y},s={x:d.x-c.x,y:d.y-c.y};const den=r.x*s.y-r.y*s.x;if(Math.abs(den)<1e-9)return null;const t=((c.x-a.x)*s.y-(c.y-a.y)*s.x)/den,u=((c.x-a.x)*r.y-(c.y-a.y)*r.x)/den;if(t<0||t>1||u<0||u>1)return null;return {x:a.x+r.x*t,y:a.y+r.y*t,t,u};}
function runSegs(o){const s=[];for(let i=0;i+1<o.pts.length;i++)s.push([{x:o.pts[i][0],y:o.pts[i][1]},{x:o.pts[i+1][0],y:o.pts[i+1][1]}]);return s;}
const sysName=o=>(PIPE_SYS[o.sys]||{}).label||'Pipe';
function clashChecks(p,add){
  const pipes=(p.pipes||[]).filter(o=>o.status!=='demolish'&&o.pts&&o.pts.length>1);const ducts=(p.ducts||[]).filter(o=>o.status!=='demolish'&&o.pts&&o.pts.length>1);
  if(!pipes.length&&!ducts.length)return;const first=groundLevel(p);
  for(const lv of p.levels){const L=floorLayoutCached(p,lv);const lvPipes=pipes.filter(o=>o.level===lv.id);const lvDucts=ducts.filter(o=>o.level===lv.id);
    // ---- floor framing: pipes below the floor surface, ducts in the crawlspace ----
    if(L&&L.members){const J=L.J;const depth=L.depth||joistDepth(J);const jt=-0.75,jb=jt-depth;const joists=L.members.filter(m=>(m.kind==='joist'||m.kind==='tail')&&m.a&&m.b);const girders=L.members.filter(m=>m.kind==='girder'&&m.a&&m.b);
      const name=joistLabel(J).replace(/s$/,'');const open=lv.id===first.id&&J.foundation!=='slab';
      for(const o of lvPipes){const z=o.z??(PIPE_SYS[o.sys]||PIPE_SYS.cw).z;if(z>=0)continue;const od=pipeOD(o);const top=z+od/2,bot=z-od/2;
        let cross=0,pt=null,gpt=null;for(const [a,b] of runSegs(o)){for(const m of joists){const x=segCross(a,b,m.a,m.b);if(x){cross++;pt=pt||x;}}for(const g of girders){const x=segCross(a,b,g.a,g.b);if(x)gpt=gpt||x;}}
        const T={kind:'pipe',id:o.id};const lab=`${sysName(o)} ${o.size}`;
        if(gpt&&top>jb-9.25&&bot<jb)add('error',R_GIRDER,`${lab} runs through a girder`,`The run crosses the girder under the ${lv.name} floor at ${fmtLen(-z)} below the floor. Girders are not bored; drop the pipe below the girder (${fmtLen(depth+9.25+0.75+od/2)} or more below the floor) or route around it.`,T,gpt,lv.id);
        if(!cross||top<=jb)continue;// hangs below the joists
        const hole=od+0.25;
        if(J.type==='truss'){if(hole>5)add('warn',R_JOIST,`${lab} needs the truss chase`,`Open-web floor trusses pass pipes between the webs. A ${fmtLen(hole)} hole needs the truss's duct chase or a run parallel to the trusses.`,T,pt,lv.id);continue;}
        if(J.type==='ijoist'){const max=Math.max(1.5,depth-3.5);if(hole>max)add('error',R_JOIST,`${lab} is too big for the I-joist webs`,`It crosses ${cross} ${name}${cross===1?'':'s'}. A ${fmtLen(hole)} hole is more than these ${fmtLen(depth)} I-joists allow (about ${fmtLen(max)} in the web, by the maker's chart). Run it parallel to the joists, hang it below them, or use deeper joists.`,T,pt,lv.id);
          else add('tip',R_JOIST,`${lab} bores through ${cross} I-joist${cross===1?'':'s'}`,`Use the knockouts or holes from the maker's chart (${fmtLen(hole)} hole, centered in the web, away from the bearing ends). Never cut the flanges.`,T,pt,lv.id);continue;}
        const max=depth/3;const edgeTop=jt-(top+0.125),edgeBot=(bot-0.125)-jb;
        if(hole>max+0.01)add('error',R_JOIST,`${lab} needs a ${fmtLen(hole)} hole in ${name}s`,`It crosses ${cross} ${name}${cross===1?'':'s'} inside the joist depth. Bored holes may be no larger than 1/3 of the depth (${fmtLen(max)} in a ${fmtLen(depth)} joist). Run it parallel to the joists, drop it below them${open?' in the crawlspace':' in a soffit'}, or use deeper joists.`,T,pt,lv.id);
        else if(edgeTop<2||edgeBot<2)add('warn',R_JOIST,`${lab}: hole too close to the joist edge`,`At ${fmtLen(-z)} below the floor the ${fmtLen(hole)} hole is ${fmtLen(Math.min(edgeTop,edgeBot))} from the ${edgeTop<edgeBot?'top':'bottom'} edge; keep 2" or more. Set the pipe height to about ${fmtLen(-(jt-depth/2))} below the floor to center it.`,T,pt,lv.id);
        else add('tip',R_JOIST,`${lab} bores through ${cross} joist${cross===1?'':'s'}`,`${fmtLen(hole)} holes, centered in the ${fmtLen(depth)} joists, within the 1/3-depth limit. Keep holes 2" from the edges and away from notches.`,T,pt,lv.id);}
      if(lv.id===first.id&&J.foundation!=='slab')for(const o of lvDucts.filter(o=>(o.where||'attic')==='crawl')){const h=/round/.test(o.size)?ductW(o.size):(+(/x\s*(\d+)/.exec(o.size)||[0,8])[1]);const zc=-12;const top=zc+h/2;if(top<=jb)continue;
        let cross=0,pt=null;for(const [a,b] of runSegs(o))for(const m of joists){const x=segCross(a,b,m.a,m.b);if(x){cross++;pt=pt||x;}}
        if(cross)add(J.type==='truss'&&h<=10?'tip':'error',R_JOIST,`${o.size} ${(DUCT_SYS[o.sys]||{}).label||'duct'} crosses ${cross} ${name}${cross===1?'':'s'}`,J.type==='truss'&&h<=10?`Run it through the trusses' center chase.`:`A duct this size cannot pass through the joists. Hang it below the joists (its top ${fmtLen(depth+0.75)} or more below the floor) or run it between two joists in the same direction.`,{kind:'duct',id:o.id},pt,lv.id);}}
    // ---- studs: pipes running inside a wall bore every stud they pass ----
    const walls=p.walls.filter(w=>w.level===lv.id&&w.status!=='demolish');
    for(const o of lvPipes){const z=o.z??(PIPE_SYS[o.sys]||PIPE_SYS.cw).z;if(z<=0)continue;const od=pipeOD(o);const hole=od+0.25;
      for(const [a,b] of runSegs(o)){const sl=dist(a,b);if(sl<12)continue;const sd={x:(b.x-a.x)/sl,y:(b.y-a.y)/sl};
        for(const w of walls){const wd=wdir(w);if(Math.abs(wd.x*sd.y-wd.y*sd.x)>0.06)continue;const pa=projSeg(a,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2}),pb=projSeg(b,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});const perp=q=>Math.abs((q.x-w.x1)*(-wd.y)+(q.y-w.y1)*wd.x);if(perp(a)>w.thick/2||perp(b)>w.thick/2)continue;
          const ov=(Math.min(1,Math.max(pa.tRaw,pb.tRaw))-Math.max(0,Math.min(pa.tRaw,pb.tRaw)))*wlen(w);if(ov<14)continue;
          const studW=w.thick>=6?5.5:w.thick>=4.5?3.5:2.5;const bearing=w.bearing||w.kind==='exterior';const lim=studW*(bearing?0.4:0.6);const studs=Math.max(1,Math.floor(ov/16));
          const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const lab=`${sysName(o)} ${o.size}`;
          if(hole>lim+0.01)add('error',R_STUD,`${lab} is too big for the ${studW>=5?'2x6':'2x4'} studs`,`It runs ${fmtLen(ov)} inside a ${bearing?'bearing':'non-bearing'} wall, through about ${studs} studs. A ${fmtLen(hole)} hole is more than ${bearing?'40':'60'}% of a ${fmtLen(studW)} stud (${fmtLen(lim)}). ${bearing?'Double the studs (60% allowed), fur the wall out, ':''}${studW<5?'frame this wall with 2x6 studs, ':''}or run the pipe in the floor.`,{kind:'pipe',id:o.id},mid,lv.id);
          else add('tip',R_STUD,`${lab} bores about ${studs} stud${studs===1?'':'s'}`,`${fmtLen(hole)} holes in ${fmtLen(studW)} studs are within the limit; leave 5/8" to each edge and add nail plates where the pipe is within 1-1/4" of the face (P2603.2.1).`,{kind:'pipe',id:o.id},mid,lv.id);}}}
    // ---- pipes against ducts at the same height ----
    for(const o of lvPipes){const z=o.z??(PIPE_SYS[o.sys]||PIPE_SYS.cw).z;const od=pipeOD(o);
      for(const d of lvDucts){const crawl=(d.where||'attic')==='crawl';const zc=crawl?-12:lv.height+10;const h=/round/.test(d.size)?ductW(d.size):8;if(Math.abs(z-zc)>h/2+od/2)continue;
        hit:for(const [a,b] of runSegs(o))for(const [c,e] of runSegs(d)){const x=segCross(a,b,c,e);if(x){add('warn',R_CLASH,`${sysName(o)} ${o.size} hits the ${d.size} duct`,`They cross at the same height (${fmtLen(Math.abs(z))} ${z<0?'below':'above'} the floor). Move one up or down by ${fmtLen(h/2+od/2-Math.abs(z-zc)+1)} or more.`,{kind:'pipe',id:o.id},x,lv.id);break hit;}}}}}}
regExtra({checks:(p,add)=>{try{clashChecks(p,add);}catch(e){console.error('clash',e);}}});
