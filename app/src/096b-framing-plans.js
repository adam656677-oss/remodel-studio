/* ======================= roof truss layout, floor joist layout, their plans, schedules, 3D and takeoff ======================= */
// Trusses follow IRC R802.10 (engineered by the truss maker); floor framing follows R502 (spans, bearing, openings).
// Everything here is for planning and ordering: the truss supplier's drawings and the span tables govern.
const TRUSS_TYPES=[['common','Common (Fink W)'],['energy','Energy heel (raised heel for full attic insulation)'],['scissor','Scissor (vaulted ceiling)'],['attic','Attic (room in the roof)']];
function trussOpt(r){const f=r.framing||{};const t=f.trussType||'common';return {type:t,spacing:+f.trussSpacing||24,heel:f.heel??(t==='energy'?12:4.5),ply:f.girderPly||2,setback:f.setback||84,peak:!!f.peakTruss};}
const tPt=(axis,u,v)=>axis==='x'?{x:u,y:v}:{x:v,y:u};
// one line per truss or jack, plan coordinates from bearing to bearing
function trussLayout(p,r){const ax=roofAxis(r);const o=trussOpt(r);const st=r.style||'gable';const U0=ax==='x'?r.x:r.y,Ul=ax==='x'?r.w:r.h,V0=ax==='x'?r.y:r.x,Vl=ax==='x'?r.h:r.w;const sp=o.spacing;const items=[];
  const T=(mark,kind,u,v0,v1,extra={})=>items.push({mark,kind,a:tPt(ax,u,v0),b:tPt(ax,u,v1),u,span:v1-v0,...extra});
  const J=(mark,kind,v,u0,u1,extra={})=>items.push({mark,kind,a:tPt(ax,u0,v),b:tPt(ax,u1,v),v,span:Math.abs(u1-u0),jack:true,...extra});
  const z0=roofTop(p,r);
  if(st==='flat'||st==='shed'){const kind=st==='flat'?'flat':'mono';for(let u=U0+0.75;u<=U0+Ul-0.75+0.01;u+=sp){const end=u+sp>U0+Ul-0.75;T(kind==='flat'?'F1':'M1',kind,u,V0,V0+Vl);if(end)break;}
    const last=items[items.length-1];if(last&&U0+Ul-0.75-last.u>2)T(kind==='flat'?'F1':'M1',kind,U0+Ul-0.75,V0,V0+Vl);}
  else if(['hip','dutch','mansard'].includes(st)&&Ul>=Vl){// step-down hip set at each end, commons in the middle
    const half=Vl/2;const S=Math.max(36,Math.min(o.setback,half-12));
    for(const end of [0,1]){const sgn=end?-1:1,Ue=end?U0+Ul:U0;
      T('G1','girder',Ue+sgn*S,V0,V0+Vl,{ply:o.ply,flat:true});
      let k=1;for(let d=S+sp;d<half-0.5;d+=sp,k++)T('H'+k,'hip',Ue+sgn*d,V0,V0+Vl,{flat:true});
      for(let v=V0+sp;v<V0+Vl-0.5;v+=sp){const reach=Math.min(S,v-V0,V0+Vl-v);if(reach<6)continue;J('EJ'+Math.round(reach/12),'jack',v,Ue,Ue+sgn*reach);}
      for(let d=sp;d<S-0.5;d+=sp)for(const vv of [V0,V0+Vl]){const s2=vv===V0?1:-1;J('CJ'+Math.round(d/12),'jack',null,0,0,{a:tPt(ax,Ue+sgn*d,vv),b:tPt(ax,Ue+sgn*d,vv+s2*d),span:d,side:true});}}
    const c0=U0+half,c1=U0+Ul-half;if(c1>c0+0.5){let u=c0;while(u<=c1+0.01){T('T1','common',u,V0,V0+Vl);u+=sp;}}
    else T('T1','common',U0+Ul/2,V0,V0+Vl);}
  else{// gable, gambrel, salt box and the rest: gable-end trusses at the ends, commons between
    T('GE1','gable',U0+0.75,V0,V0+Vl);let u=U0+sp;while(u<U0+Ul-0.75-sp*0.5){T(st==='gambrel'?'T1G':'T1','common',u,V0,V0+Vl);u+=sp;}T('GE1','gable',U0+Ul-0.75,V0,V0+Vl);}
  for(const it of items)it.z0=z0;
  // schedule: one line per mark
  const pitch=`${r.pitch}/12`,oh=r.overhang??12;const rows={};for(const it of items){const k=it.mark+'|'+Math.round(it.span);const R=rows[k]=rows[k]||{mark:it.mark,kind:it.kind,qty:0,span:it.span,pitch,heel:o.heel,oh:it.jack&&!it.side?0:oh,ply:it.ply||1,type:it.kind==='common'?o.type:it.kind};R.qty+=it.ply||1;}
  const schedule=Object.values(rows).sort((a,b)=>(a.mark>b.mark?1:-1));
  return {items,schedule,axis:ax,opt:o,U0,Ul,V0,Vl};}
const TRUSS_KIND_LABEL={common:'Common',gable:'Gable end (with verticals for sheathing)',girder:'Hip girder',hip:'Step-down hip',jack:'Jack',mono:'Mono (single slope)',flat:'Flat (parallel chord)'};
// ---------- truss profile in its own plane, for 3D ----------
function trussProfile(p,r,b,it){const o=trussOpt(r);const L=Math.hypot(it.b.x-it.a.x,it.b.y-it.a.y);if(L<1)return null;const dir={x:(it.b.x-it.a.x)/L,y:(it.b.y-it.a.y)/L};const oh=it.jack&&!it.side?0:(r.overhang??12);
  const chord=3.5,shth=0.75;const surf=(s)=>{const q={x:it.a.x+dir.x*s,y:it.a.y+dir.y*s};const z=roofHeightAt(b,q.x,q.y);return isFinite(z)?z-shth-chord/2:NaN;};
  const cap=it.flat?surf(L/2):Infinity;const N=16;const top=[];for(let i=0;i<=N;i++){const s=-oh+(L+2*oh)*i/N;let z=surf(s);if(!isFinite(z))continue;z=Math.min(z,cap);top.push([s,z]);}
  if(top.length<2)return null;const zb=it.z0+chord/2;const scis=o.type==='scissor'&&it.kind==='common';const bot=scis?[[0,zb],[L/2,zb+L/2*(r.pitch/2)/12],[L,zb]]:[[0,zb],[L,zb]];
  const topAt=s=>{for(let i=1;i<top.length;i++)if(top[i][0]>=s){const [s0,z0]=top[i-1],[s1,z1]=top[i];return z0+(z1-z0)*(s-s0)/Math.max(1e-6,s1-s0);}return top[top.length-1][1];};
  const botAt=s=>{for(let i=1;i<bot.length;i++)if(bot[i][0]>=s){const [s0,z0]=bot[i-1],[s1,z1]=bot[i];return z0+(z1-z0)*(s-s0)/Math.max(1e-6,s1-s0);}return bot[bot.length-1][1];};
  const webs=[];const W=(s0,s1)=>webs.push([[s0,botAt(s0)],[s1,topAt(s1)]]);
  if(it.kind==='gable'){for(let s=16;s<L-4;s+=16)webs.push([[s,botAt(s)],[s,topAt(s)]]);}
  else if(it.kind==='mono'||it.jack){webs.push([[L-0.75,botAt(L-0.75)],[L-0.75,topAt(L-0.75)]]);if(L>72){W(L*0.5,L*0.5);W(L*0.5,L-1);} }
  else if(it.kind==='flat'){for(let s=24;s<L;s+=24){webs.push([[s,botAt(s)],[s,topAt(s)]]);}}
  else if(it.kind==='girder'||it.kind==='hip'){const rise=cap-zb;const run=rise/(r.pitch/12);const a=Math.min(run,L/2),c=Math.max(L-run,L/2);webs.push([[a,botAt(a)],[a,topAt(a)]],[[c,botAt(c)],[c,topAt(c)]]);if(c-a>48){for(let s=a+48;s<c-12;s+=48)webs.push([[s,botAt(s)],[s,topAt(s)]]);W(a,a+Math.min(48,(c-a)/2));}}
  else if(o.type==='attic'&&L>=240){const rw=Math.min(144,L*0.5);const s0=(L-rw)/2,s1=(L+rw)/2;const kh=Math.min(topAt(s0)-zb-6,90);for(const s of [s0,s1])webs.push([[s,zb],[s,zb+kh]]);webs.push([[s0,zb+kh],[s1,zb+kh]]);}
  else if(L<=240){webs.push([[L/2,botAt(L/2)],[L/2,topAt(L/2)]]);W(L/4,L/2);W(3*L/4,L/2);}
  else if(L<=432){W(L/3,L/4);W(L/3,L/2);W(2*L/3,L/2);W(2*L/3,3*L/4);}
  else{for(const f of [[1/6,1/8],[1/6,1/4],[1/3,1/4],[1/3,1/2],[2/3,1/2],[2/3,3/4],[5/6,3/4],[5/6,7/8]])W(L*f[0],L*f[1]);}
  return {dir,top,bot,webs,L,a:it.a};}
function trusses3D(p,r,b,add,std){const lay=trussLayout(p,r);const mT=std('fr-truss',0xd9b98a,{roughness:.85}),mG=std('fr-girder',0xc58f4c,{roughness:.8}),mWb=std('fr-web',0xcfae80,{roughness:.85});
  const seg=(it,pr,P,Q,m,th,dp)=>{const A={x:pr.a.x+pr.dir.x*P[0],y:pr.a.y+pr.dir.y*P[0],z:P[1]},C={x:pr.a.x+pr.dir.x*Q[0],y:pr.a.y+pr.dir.y*Q[0],z:Q[1]};const V=new THREE.Vector3((C.x-A.x)*IN,(C.z-A.z)*IN,(C.y-A.y)*IN);const L=V.length();if(L<0.02)return;
    const mesh=add(new THREE.BoxGeometry(th*IN,L,dp*IN),m,(A.x+C.x)/2*IN,(A.z+C.z)/2*IN,(A.y+C.y)/2*IN,0,false);const dirv=V.clone().normalize();const side=new THREE.Vector3(-pr.dir.y,0,pr.dir.x);const third=new THREE.Vector3().crossVectors(side,dirv).normalize();mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side,dirv,third));};
  for(const it of lay.items){const pr=trussProfile(p,r,b,it);if(!pr)continue;const th=1.5*(it.ply||1);const m=it.kind==='girder'?mG:mT;
    for(let i=1;i<pr.top.length;i++)seg(it,pr,pr.top[i-1],pr.top[i],m,th,3.5);for(let i=1;i<pr.bot.length;i++)seg(it,pr,pr.bot[i-1],pr.bot[i],m,th,3.5);for(const [P,Q] of pr.webs)seg(it,pr,P,Q,mWb,1.5,3.5);}}
{const _ar=addRafters3D;addRafters3D=function(p,r,b,add,std){if(rafterOf(r).system==='trusses'&&r.style!=='flat'||(rafterOf(r).system==='trusses'&&r.style==='flat'))return trusses3D(p,r,b,add,std);return _ar(p,r,b,add,std);};}
// ---------- floor joists ----------
const IJOISTS={'9.5':{d:9.5,span:{12:208,16:193,19.2:181,24:162}},'11.875':{d:11.875,span:{12:248,16:229,19.2:215,24:193}},'14':{d:14,span:{12:281,16:259,19.2:243,24:218}},'16':{d:16,span:{12:311,16:287,19.2:269,24:241}}};
const FTRUSS={12:{d:12,span:216},14:{d:14,span:240},16:{d:16,span:264},18:{d:18,span:288},20:{d:20,span:312},24:{d:24,span:360}};
function joistOpt(lv){const fr=framingOf(lv);return {type:fr.jtype||'lumber',ij:fr.ijoist||'11.875',ft:+(fr.ftruss||16),...fr};}
function joistDepth(J){return J.type==='ijoist'?IJOISTS[J.ij].d:J.type==='truss'?FTRUSS[J.ft].d:(LUMBER[J.joist]||9.25);}
function joistLabel(J){return J.type==='ijoist'?`${J.ij}" I-joists`:J.type==='truss'?`${J.ft}" open-web floor trusses`:`${J.joist} joists`;}
// span limit for one joist (inches), 40 psf live (30 at bedrooms) + 10 dead plus finish
function joistAllow(p,J,use='living',finish=null){const sp=J.spacing||16;if(J.type==='ijoist'){const t=IJOISTS[J.ij].span;return t[sp]||t[16];}if(J.type==='truss'){const s=FTRUSS[J.ft].span;return s*(sp<=16?1.1:sp<=19.2?1.05:1);}
  const ll=use==='bedroom'?30:40,dl=10+(FLOOR_FINISH[finish]?.dl||0);const s=sp/12;const m=memberProps({species:J.species,size:J.joist},J.joist);let lo=24,hi=480;for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(checkMember(m,mid,(ll+dl)*s,ll*s,{Cr:1.15,liveLim:360,totLim:240}).ratio<=1)lo=mid;else hi=mid;}return Math.floor(lo);}
function joistLayout(p,lv){const J=joistOpt(lv);const first=groundLevel(p).id===lv.id;if(first&&J.foundation==='slab')return null;const ol=buildingOutline(p,lv.id);if(!ol)return null;const pts=ol.pts;
  const xs=pts.map(q=>q.x),ys=pts.map(q=>q.y);const bx=[Math.min(...xs),Math.max(...xs)],by=[Math.min(...ys),Math.max(...ys)];
  const alongX=J.dir==='x'?true:J.dir==='y'?false:(bx[1]-bx[0])<(by[1]-by[0]);// joists run the short way
  const inner=offsetPoly(pts,-1.5);const sp=J.spacing||16;const depth=joistDepth(J);const out={J,alongX,depth,members:[],openings:[],warn:[],level:lv.id};
  // supports: bearing walls on the level below (or this level's outside walls) and girders for crawlspace and basement floors
  const below=sortedLevels(p).filter(l=>l.elevation<lv.elevation).pop();const walls=floorSupports(p,lv);
  const sup=[];for(const w of walls){const d=wdir(w);const perp=alongX?Math.abs(d.y)>0.9:Math.abs(d.x)>0.9;if(!perp)continue;sup.push({c:alongX?(w.x1+w.x2)/2:(w.y1+w.y2)/2,a:alongX?Math.min(w.y1,w.y2):Math.min(w.x1,w.x2),b:alongX?Math.max(w.y1,w.y2):Math.max(w.x1,w.x2),kind:'wall'});}
  const lo=alongX?bx[0]:by[0],hi=alongX?bx[1]:by[1],clo=alongX?by[0]:bx[0],chi=alongX?by[1]:bx[1];
  if(first&&J.foundation!=='slab'&&(J.girders||0)>0){const n=Math.ceil((hi-lo)/J.girders);for(let i=1;i<n;i++){const c=lo+(hi-lo)*i/n;if(sup.some(s=>Math.abs(s.c-c)<24&&s.a<=clo+12&&s.b>=chi-12))continue;sup.push({c,a:clo,b:chi,kind:'girder'});
    const g=alongX?[{x:c,y:clo},{x:c,y:chi}]:[{x:clo,y:c},{x:chi,y:c}];for(const [a,b] of clipSegPoly(g[0],g[1],inner))out.members.push({kind:'girder',a,b,label:'GIRDER'});}}
  // stair openings in this floor
  for(const s of p.stairs){const sl=lvlOf(p,s.level);const up=sl&&levelAbove(p,sl);if(!up||up.id!==lv.id)continue;const si=stairInfo(p,s);const cx=si.corners.map(c=>c.x),cy=si.corners.map(c=>c.y);
    out.openings.push({x0:Math.min(...cx),y0:Math.min(...cy),x1:Math.max(...cx),y1:Math.max(...cy),what:'Stair'});}
  for(const ch of (p.chimneys||[])){const cl=lvlOf(p,ch.level);if(!cl||cl.elevation>=lv.elevation||ch.status==='demolish')continue;let body=null;try{body=chimneyPolys(ch).body;}catch(e){}if(!body||!body.length)continue;const bxs=body.map(q=>q.x??q[0]),bys=body.map(q=>q.y??q[1]);out.openings.push({x0:Math.min(...bxs)-2,y0:Math.min(...bys)-2,x1:Math.max(...bxs)+2,y1:Math.max(...bys)+2,what:'Chimney (2" clearance)'});}
  // joist lines across the cross axis, clipped to the rim, split at supports and openings
  const lines=[];for(let t=clo+0.75+sp;t<chi-0.75;t+=sp)lines.push(t);
  const spans=[];
  for(const t of lines){const A=alongX?{x:lo-2,y:t}:{x:t,y:lo-2},Bq=alongX?{x:hi+2,y:t}:{x:t,y:hi+2};
    for(const [a,b] of clipSegPoly(A,Bq,inner)){let s0=alongX?a.x:a.y,s1=alongX?b.x:b.y;if(s1<s0)[s0,s1]=[s1,s0];
      // openings cut this joist into tail joists
      const cuts=[];for(const o of out.openings){const ta=alongX?o.y0:o.x0,tb=alongX?o.y1:o.x1;if(t<ta||t>tb)continue;const ca=alongX?o.x0:o.y0,cb=alongX?o.x1:o.y1;cuts.push([ca,cb]);}
      let pieces=[[s0,s1]];for(const [ca,cb] of cuts)pieces=pieces.flatMap(([u0,u1])=>cb<=u0||ca>=u1?[[u0,u1]]:[[u0,ca],[cb,u1]]).filter(q=>q[1]-q[0]>3);
      for(const [u0,u1] of pieces){const tail=cuts.some(([ca,cb])=>Math.abs(u1-ca)<0.6||Math.abs(u0-cb)<0.6);
        const sups=sup.filter(s=>s.c>u0+3&&s.c<u1-3&&t>=s.a-1&&t<=s.b+1).map(s=>s.c).sort((x,y)=>x-y);const brk=[u0,...sups,u1];
        for(let i=1;i<brk.length;i++){const v0=brk[i-1],v1=brk[i];const P0=alongX?{x:v0,y:t}:{x:t,y:v0},P1=alongX?{x:v1,y:t}:{x:t,y:v1};spans.push({kind:tail?'tail':'joist',a:P0,b:P1,len:v1-v0,t});}}}}
  // trimmers (doubled) beside openings and headers (doubled) across them: R502.10
  for(const o of out.openings){const ta=alongX?o.y0:o.x0,tb=alongX?o.y1:o.x1,ca=alongX?o.x0:o.y0,cb=alongX?o.x1:o.y1;const hdrSpan=tb-ta;const dbl=hdrSpan>48?2:1;
    for(const tt of [ta-0.75,tb+0.75]){const A=alongX?{x:lo-2,y:tt}:{x:tt,y:lo-2},Bq=alongX?{x:hi+2,y:tt}:{x:tt,y:hi+2};for(const [a,b] of clipSegPoly(A,Bq,inner))out.members.push({kind:'trimmer',a,b,ply:dbl,label:dbl>1?'DBL TRIMMER':'TRIMMER'});}
    for(const cc of [ca-0.75,cb+0.75]){const a=alongX?{x:cc,y:ta}:{x:ta,y:cc},b=alongX?{x:cc,y:tb}:{x:tb,y:cc};out.members.push({kind:'header',a,b,ply:dbl,label:dbl>1?'DBL HEADER':'HEADER'});}
    if(hdrSpan>72)out.warn.push(`${o.what} opening header spans ${fmtLen(hdrSpan)}: R502.10 calls for hangers and an engineered header over 6'.`);}
  // drop joists that collide with trimmers
  const trimT=new Set(out.openings.flatMap(o=>[alongX?o.y0:o.x0,alongX?o.y1:o.x1]));
  for(const s of spans){if([...trimT].some(tt=>Math.abs(s.t-tt)<sp*0.35))continue;out.members.push(s);}
  // rim around the outside
  for(let i=0;i<inner.length;i++){const a=inner[i],b=inner[(i+1)%inner.length];out.members.push({kind:'rim',a,b,len:dist(a,b)});}
  // spans against the allowable span
  const roomAt=q=>p.rooms.find(r=>r.level===lv.id&&inPoly(q.x,q.y,r.pts));
  for(const m of out.members){if(m.kind!=='joist'&&m.kind!=='tail')continue;const mid={x:(m.a.x+m.b.x)/2,y:(m.a.y+m.b.y)/2};const rm=roomAt(mid);const al=joistAllow(p,J,rm?.use,rm?.finish);m.allow=al;m.ok=m.len<=al+0.5;}
  const bad=out.members.filter(m=>m.ok===false);if(bad.length)out.warn.push(`${bad.length} joist span${bad.length===1?'':'s'} longer than ${joistLabel(J)} at ${sp}" o.c. allow (longest ${fmtLen(Math.max(...bad.map(m=>m.len)))}). Add a beam or bearing wall below, use deeper joists, or close the spacing.`);
  out.sup=sup;out.inner=inner;out.lo=lo;out.hi=hi;return out;}
// what to order for the floor framing
function joistSchedule(L){const J=L.J;const rows=[];const len=m=>m.len??dist(m.a,m.b);const buy=x=>Math.max(8,Math.ceil((x+3)/24)*2);// stock lengths in even feet, with 1-1/2" bearing each end
  const byLen={};for(const m of L.members.filter(m=>m.kind==='joist'||m.kind==='tail'))byLen[buy(len(m))]=(byLen[buy(len(m))]||0)+1;
  const name=joistLabel(J).replace(/s$/,'');for(const [ft,n] of Object.entries(byLen).sort((a,b)=>a[0]-b[0]))rows.push({item:`${name} ${ft}'`,qty:n,unit:'EA'});
  const tr=L.members.filter(m=>m.kind==='trimmer'||m.kind==='header');for(const m of tr)rows.push({item:`${m.kind==='trimmer'?'Trimmer':'Header'} (${m.ply>1?'doubled ':''}${J.type==='lumber'?J.joist:'rim board'}) ${buy(len(m))}'`,qty:m.ply||1,unit:'EA'});
  const rimLF=L.members.filter(m=>m.kind==='rim').reduce((s,m)=>s+len(m),0)/12;rows.push({item:J.type==='lumber'?`Rim joist ${J.joist}`:`Rim board ${fi(joistDepth(J))}" LSL`,qty:Math.ceil(rimLF*1.05),unit:'LF'});
  const hangers=L.members.filter(m=>m.kind==='tail').length+tr.filter(m=>m.kind==='header').length*2;if(hangers)rows.push({item:J.type==='ijoist'?'I-joist hangers':'Joist hangers',qty:hangers,unit:'EA'});
  const gir=L.members.filter(m=>m.kind==='girder');if(gir.length)rows.push({item:'Girder, (3) 2x10 built-up or LVL per plan',qty:Math.ceil(gir.reduce((s,m)=>s+len(m),0)/12),unit:'LF'});
  const blk=L.sup.filter(s=>s.kind==='girder'||s.kind==='wall').length;const nJ=L.members.filter(m=>m.kind==='joist').length;if(blk)rows.push({item:`Blocking at bearing lines (${J.type==='lumber'?J.joist:'I-joist blocking'})`,qty:Math.ceil(nJ/Math.max(1,blk+1))*blk,unit:'EA'});
  const area=Math.abs(polyArea(L.inner.map(q=>[q.x,q.y])))/144;rows.push({item:'Subfloor 23/32" T&G, 4x8',qty:Math.ceil(area/32*1.08),unit:'SHT'},{item:'Subfloor adhesive, 28 oz',qty:Math.ceil(area/60),unit:'TUBE'});
  return rows;}
function trussOrder(p){const rows=[];for(const r of p.roofs.filter(r=>r.status!=='existing'&&rafterOf(r).system==='trusses')){const L=trussLayout(p,r);for(const s of L.schedule)rows.push({...s,roof:r.id});}return rows;}
// ---------- takeoff ----------
regExtra({takeoff:(p,add)=>{const C='Framing (trusses and joists)';
  for(const r of p.roofs.filter(r=>r.status!=='existing'&&rafterOf(r).system==='trusses')){const L=trussLayout(p,r);
    for(const s of L.schedule)add(C,`Truss ${s.mark}: ${TRUSS_KIND_LABEL[s.kind]||s.kind}${s.kind==='common'&&s.type!=='common'?' ('+s.type+')':''}, ${fmtLen(s.span)} span, ${s.pitch}${s.ply>1?`, ${s.ply}-ply`:''}`,s.qty,'EA');
    const bear=L.items.reduce((n,it)=>n+(it.jack?1:2),0);add(C,'Hurricane ties (truss to plate)',bear,'EA','R802.11 uplift connection');
    const hang=L.items.filter(it=>it.jack&&!it.side).length;if(hang)add(C,'Jack truss hangers at hip girders',hang,'EA');
    const rows=L.Vl>=432?3:L.Vl>=288?2:1;add(C,'Permanent truss bracing, 2x4 continuous lateral',Math.ceil(rows*L.Ul/12*1.1),'LF','per truss drawings');}
  for(const lv of p.levels){const L=joistLayout(p,lv);if(!L||!L.members.some(m=>m.kind==='joist'))continue;if(!(p.walls||[]).some(w=>w.level===lv.id&&w.status!=='existing'))continue;for(const r of joistSchedule(L))add(C,`${lv.name}: ${r.item}`,r.qty,r.unit);}}});
// ---------- plan overlays (Designer tabs and the framing sheets) ----------
function rafterLines(r,b){const rf=rafterOf(r);const sp=rf.spacing||16;const out=[];
  for(const f of b.polys){const [a,c,e]=f;const u=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],v=[e[0]-a[0],e[1]-a[1],e[2]-a[2]];const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(Math.abs(n[2])<1e-9)continue;
    let g={x:n[0]/n[2],y:n[1]/n[2]};const gl=Math.hypot(g.x,g.y);if(gl<1e-6)continue;g={x:g.x/gl,y:g.y/gl};const per={x:-g.y,y:g.x};const xy=f.map(q=>({x:q[0],y:q[1]}));
    const proj=xy.map(q=>q.x*per.x+q.y*per.y),pg=xy.map(q=>q.x*g.x+q.y*g.y);const s0=Math.min(...proj),s1=Math.max(...proj),t0=Math.min(...pg),t1=Math.max(...pg);
    for(let s=s0+0.75;s<=s1-0.5;s+=sp){const A={x:per.x*s+g.x*(t0-2),y:per.y*s+g.y*(t0-2)},C={x:per.x*s+g.x*(t1+2),y:per.y*s+g.y*(t1+2)};for(const [q0,q1] of clipSegPoly(A,C,xy))out.push({a:q0,b:q1});}}
  return out;}
function roofFramingSVG(p,lv,S,view){const out=[];const fs=Math.max(8,Math.min(12,11*view.s));
  for(const r of p.roofs.filter(r=>r.level===lv.id)){const sys=rafterOf(r).system;const b=roofBuild(r,roofTop(p,r));
    out.push(html`<polygon key=${'ro'+r.id} points=${b.outline.map(q=>S(q[0],q[1]).join(',')).join(' ')} className="fr-roof"/>`);
    if(sys!=='trusses'){const rf=rafterOf(r);rafterLines(r,b).forEach((l,i)=>{const A=S(l.a.x,l.a.y),B=S(l.b.x,l.b.y);out.push(html`<line key=${r.id+'rf'+i} x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className="fr-truss"/>`);});
      for(const [i,l] of (b.lines||[]).entries()){const A=S(l[0][0],l[0][1]),B=S(l[1][0],l[1][1]);out.push(html`<line key=${r.id+'rl'+i} x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className="fr-gable"/>`);}
      const c=S(r.x+r.w/2,r.y+r.h/2);out.push(html`<text key=${'rl'+r.id} x=${c[0]} y=${c[1]} textAnchor="middle" className="fr-t halo">${rf.rafter} RAFTERS @ ${rf.spacing}" O.C.</text>`);continue;}
    const L=trussLayout(p,r);L.items.forEach((it,i)=>{const A=S(it.a.x,it.a.y),B=S(it.b.x,it.b.y);out.push(html`<line key=${r.id+'t'+i} x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className=${'fr-truss fr-'+it.kind}/>`);});
    // marks every few trusses
    const seen={};L.items.forEach((it,i)=>{if(it.side)return;const k=it.mark;seen[k]=(seen[k]||0)+1;if(it.kind==='common'&&seen[k]%3!==2)return;if(it.jack&&seen[k]>1)return;const m=S((it.a.x+it.b.x)/2,(it.a.y+it.b.y)/2);
      out.push(html`<text key=${r.id+'m'+i} x=${m[0]} y=${m[1]} textAnchor="middle" className="fr-mark halo" style=${{fontSize:fs+'px'}}>${it.mark}${it.ply>1?' ('+it.ply+')':''}</text>`);});}
  return out;}
function floorFramingSVG(p,lv,S,view){const L=joistLayout(p,lv);if(!L)return [html`<text key="nf" x="20" y="60" className="fr-t">This floor is a slab: no joists.</text>`];const out=[];
  L.members.forEach((m,i)=>{const A=S(m.a.x,m.a.y),B=S(m.b.x,m.b.y);out.push(html`<line key=${'j'+i} x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]} className=${'fr-j fr-'+m.kind+(m.ok===false?' fr-bad':'')}/>`);});
  for(const [i,o] of L.openings.entries()){const a=S(o.x0,o.y0),b=S(o.x1,o.y1);out.push(html`<g key=${'op'+i}><rect x=${Math.min(a[0],b[0])} y=${Math.min(a[1],b[1])} width=${Math.abs(b[0]-a[0])} height=${Math.abs(b[1]-a[1])} className="fr-open"/><line x1=${a[0]} y1=${a[1]} x2=${b[0]} y2=${b[1]} className="fr-open"/><line x1=${a[0]} y1=${b[1]} x2=${b[0]} y2=${a[1]} className="fr-open"/></g>`);}
  const xs=L.inner.map(q=>q.x),ys=L.inner.map(q=>q.y);const cs=[L.lo,...L.sup.map(q=>q.c).sort((x,y)=>x-y),L.hi];let bi=0;for(let i=1;i<cs.length;i++)if(cs[i]-cs[i-1]>cs[bi+1]-cs[bi])bi=i-1;const mid=(cs[bi]+cs[bi+1])/2,bay=cs[bi+1]-cs[bi];const cc=L.alongX?(Math.min(...ys)+Math.max(...ys))/2:(Math.min(...xs)+Math.max(...xs))/2;const c=L.alongX?{x:mid,y:cc}:{x:cc,y:mid};const len=Math.min(96,bay*0.38);
  const A=S(L.alongX?c.x-len:c.x,L.alongX?c.y:c.y-len),B=S(L.alongX?c.x+len:c.x,L.alongX?c.y:c.y+len);const ang=Math.atan2(B[1]-A[1],B[0]-A[0]);const ah=9;
  out.push(html`<g key="arr" className="fr-arrow"><line x1=${A[0]} y1=${A[1]} x2=${B[0]} y2=${B[1]}/>${[[A,ang+Math.PI],[B,ang]].map(([P,a],k)=>html`<polygon key=${k} points=${`${P[0]},${P[1]} ${P[0]-ah*Math.cos(a-0.45)},${P[1]-ah*Math.sin(a-0.45)} ${P[0]-ah*Math.cos(a+0.45)},${P[1]-ah*Math.sin(a+0.45)}`}/>`)}</g>`);
  const T=S(c.x,c.y);out.push(html`<text key="lab" x=${T[0]+(L.alongX?0:10)} y=${T[1]+(L.alongX?-10:4)} textAnchor=${L.alongX?'middle':'start'} className="fr-t halo">${joistLabel(L.J).toUpperCase()} @ ${L.J.spacing}" O.C.</text>`);
  for(const [i,m] of L.members.filter(m=>m.kind==='girder').entries()){const q=S(m.a.x+(m.b.x-m.a.x)*0.1,m.a.y+(m.b.y-m.a.y)*0.1);out.push(html`<text key=${'g'+i} x=${q[0]+6} y=${q[1]-6} className="fr-mark halo">GIRDER</text>`);}
  return out;}
// ---------- framing sheets in the plan set ----------
function framingSheets(p){const out=[];const P=PAPERS[p.sheet?.paper]||PAPERS.tabloid;const k=P.k;const R=1.2*k;const pp=filteredProject(p,'proposed');
  const lineDL=(dl,PT,a,b,w,o={})=>{const A=PT(a.x,a.y),B=PT(b.x,b.y);dl.line(A[0],A[1],B[0],B[1],w,o);};
  const wallsDL=(dl,PT,lvId)=>{for(const w of pp.walls.filter(w=>w.level===lvId)){const d=wdir(w),n={x:-d.y,y:d.x},t=w.thick/2;dl.poly([PT(w.x1+n.x*t,w.y1+n.y*t),PT(w.x2+n.x*t,w.y2+n.y*t),PT(w.x2-n.x*t,w.y2-n.y*t),PT(w.x1-n.x*t,w.y1-n.y*t)],{fill:'#e6e6e6',stroke:MID,w:0.35});}};
  const table=(dl,A,title,head,rows,k)=>{let y=A.y0+0.3*k;const x=A.x1-3.4*k;dl.text(x,y,title,{size:7*k,bold:true});y+=0.2*k;dl.text(x,y,head.join('   '),{size:4.6*k,bold:true,color:MID});y+=0.16*k;for(const r of rows.slice(0,34)){dl.text(x,y,r,{size:4.6*k});y+=0.15*k;}return y;};
  // roof framing
  const tr=p.roofs.filter(r=>rafterOf(r).system==='trusses');
  if(tr.length){const lvId=tr[0].level;let B=planBounds(pp,lvId);for(const r of tr){const oh=r.overhang??12;B={x0:Math.min(B.x0,r.x-oh),y0:Math.min(B.y0,r.y-oh),x1:Math.max(B.x1,r.x+r.w+oh),y1:Math.max(B.y1,r.y+r.h+oh)};}
    out.push(planSheet(P,p,'S3.0','Roof truss layout',B,R,(dl,G)=>{const {PT,A}=G;wallsDL(dl,PT,lvId);const rows=[];
      for(const r of tr){const L=trussLayout(p,r);const b=roofBuild(r,roofTop(p,r));dl.poly(b.outline.map(q=>PT(q[0],q[1])),{stroke:INK,w:0.6,dash:[0.08*k,0.04*k]});
        for(const it of L.items)lineDL(dl,PT,it.a,it.b,it.kind==='girder'?1.6:it.kind==='gable'?1.0:0.5,it.jack?{dash:[0.05*k,0.03*k]}:{});
        const seen={};for(const it of L.items){if(it.side)continue;seen[it.mark]=(seen[it.mark]||0)+1;if(it.kind==='common'&&seen[it.mark]%3!==2)continue;if(it.jack&&seen[it.mark]>1)continue;const m=PT((it.a.x+it.b.x)/2,(it.a.y+it.b.y)/2);dl.text(m[0],m[1]-0.03*k,it.mark+(it.ply>1?` (${it.ply})`:''),{size:5*k,bold:true,anchor:'middle'});}
        for(const s of L.schedule)rows.push(`${s.mark.padEnd(5)} ${String(s.qty).padStart(3)}  ${(TRUSS_KIND_LABEL[s.kind]||s.kind).split(' (')[0].padEnd(14)} ${fmtLen(s.span).padEnd(9)} ${s.pitch}  heel ${fi(s.heel)}"${s.ply>1?'  '+s.ply+'-ply':''}`);}
      let y=table(dl,A,'TRUSS SCHEDULE',['MARK','QTY','TYPE','SPAN','PITCH'],rows,k);
      for(const t of ['Trusses designed by the truss manufacturer to IRC R802.10 and','ANSI/TPI 1; submit drawings before fabrication.','Fasten each truss to the plate per R802.11 (uplift).','Install permanent bracing per the truss drawings and BCSI.','Girders (G1) are multi-ply; hang jacks with hangers.'])dl.text(A.x1-3.4*k,(y+=0.15*k),t,{size:4.4*k,color:MID});},3.5*k));}
  // floor framing per level
  for(const lv of sortedLevels(p)){const L=joistLayout(p,lv);if(!L||!L.members.some(m=>m.kind==='joist'))continue;const B=planBounds(pp,lv.id);const no='S2.'+(sortedLevels(p).indexOf(lv)+1);
    out.push(planSheet(P,p,no,`${lv.name} joist layout`,B,R,(dl,G)=>{const {PT,A}=G;const below=sortedLevels(p).filter(l=>l.elevation<lv.elevation).pop();wallsDL(dl,PT,below?below.id:lv.id);
      for(const m of L.members){const w={rim:1.2,girder:1.8,header:1.2,trimmer:1.2,joist:0.35,tail:0.35}[m.kind]||0.4;lineDL(dl,PT,m.a,m.b,w,m.kind==='girder'?{dash:[0.12*k,0.04*k,0.03*k,0.04*k]}:m.ok===false?{color:'#c23a32'}:{});}
      for(const o of L.openings){const a=PT(o.x0,o.y0),b=PT(o.x1,o.y1);dl.line(a[0],a[1],b[0],b[1],0.4);dl.line(a[0],b[1],b[0],a[1],0.4);dl.text((a[0]+b[0])/2,(a[1]+b[1])/2,'OPEN',{size:5*k,bold:true,anchor:'middle'});}
      const xs=L.inner.map(q=>q.x),ys=L.inner.map(q=>q.y);const c=PT((Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2);dl.text(c[0],c[1]-0.08*k,`${joistLabel(L.J).toUpperCase()} @ ${L.J.spacing}" O.C.`,{size:6.5*k,bold:true,anchor:'middle'});
      const rows=joistSchedule(L).map(r=>`${String(r.qty).padStart(4)} ${r.unit.padEnd(5)} ${r.item}`);let y=table(dl,A,'FLOOR FRAMING SCHEDULE',['QTY','UNIT','ITEM'],rows,k);
      for(const t of [...L.warn.slice(0,3),'Bearing 1-1/2" on wood, 3" on masonry (R502.6).','Double trimmers and headers over 4\' openings (R502.10).','Full-depth blocking or rim at joist ends (R502.7).'])dl.text(A.x1-3.4*k,(y+=0.15*k),t.slice(0,78),{size:4.4*k,color:MID});},3.5*k));}
  return out;}
{const _bs=buildSheets;buildSheets=function(p){const out=_bs(p);try{const fs=framingSheets(p);if(fs.length){let i=-1;out.forEach((x,j)=>{if(/^S1/.test(x.no))i=j;});if(i<0)i=out.findIndex(x=>/^A6|^M|^E/.test(x.no))-1;out.splice(i>=0?i+1:out.length,0,...fs.sort((a,b)=>a.no>b.no?1:-1));}}catch(e){console.warn('framing sheets',e);}return out;};}
// ---------- checks ----------
regExtra({checks:(p,add)=>{for(const lv of p.levels){let L=null;try{L=joistLayout(p,lv);}catch(e){}if(!L)continue;const bad=L.members.filter(m=>m.ok===false);if(bad.length){const m=bad.sort((a,b)=>b.len-a.len)[0];add('warn',null,`${lv.name}: floor joists overspanned`,`${joistLabel(L.J)} at ${L.J.spacing}" o.c. reach about ${fmtLen(m.allow)} here; the longest run is ${fmtLen(m.len)}. Add a beam or bearing wall, go deeper, or close the spacing (R502.3).`,null,{x:(m.a.x+m.b.x)/2,y:(m.a.y+m.b.y)/2},lv.id);}}
  for(const r of p.roofs.filter(r=>r.status!=='existing'&&r.style!=='flat')){const v=(r.framing||{}).vent;if(v&&v.none){const lv=lvlOf(p,r.level);add('warn',null,'Attic is not vented',`R806.1 requires cross ventilation of enclosed attics (1/150 of the attic area, or 1/300 with balanced high and low vents), unless the attic is built unvented under R806.5.`,{kind:'roof',id:r.id},{x:r.x+r.w/2,y:r.y+r.h/2},r.level);}}}});
