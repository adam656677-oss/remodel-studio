/* ======================= keynotes (numbered notes linked to the builder's list) and tag by example ======================= */
// A keynote is one note with a number, kept once per project (p.keynotes) and placed as tags on any plan (p.kntags).
// The legend sheet lists every keynote with its linked builder's-list item and quantity. Tag by example labels every
// item of the same kind as the one you click (cabinet codes, appliance models, door marks, room names).
I.keynote=RB_IC.keynote;I.tagall=DZI('M3 12V4h8l10 10-8 8L3 12zM7.5 7.5v.1');
function keynotesOf(p){return (p.keynotes||[]).map((k,i)=>({...k,no:k.no||String(i+1)}));}
function kntagSize(view){return Math.max(9,Math.min(14,10*Math.sqrt(view.s||1)));}
regObj('kntag',{coll:'kntags',label:'Keynote',plural:'keynote tags',z:22,layer:'over',hitStage:'early',
  pts:(p,o)=>[{x:o.x,y:o.y}],noBounds:true,hit:(p,o,raw,tol)=>Math.hypot(raw.x-o.x,raw.y-o.y)<=Math.max(9,(tol||6)*1.4),
  move:(o,dx,dy)=>({...o,x:o.x+dx,y:o.y+dy}),title:(o,p)=>{const k=p&&keynotesOf(p).find(k=>k.id===o.note);return 'Keynote '+(k?k.no+': '+k.text.slice(0,40):'');},
  svg:(p,lv,o,S,view,isSel)=>{const k=keynotesOf(p).find(k=>k.id===o.note);if(!k)return null;const [x,y]=S(o.x,o.y);const r=kntagSize(view);
    return html`<g className=${'kntag'+(isSel?' sel':'')}><title>${k.no}: ${k.text}</title><path d=${`M${x} ${y-r} L${x+r} ${y} L${x} ${y+r} L${x-r} ${y} Z`}/><text x=${x} y=${y+4} textAnchor="middle">${k.no}</text></g>`;},
  dl:(dl,p,lv,o,PT,k)=>{const n=keynotesOf(p).find(x=>x.id===o.note);if(!n)return;const [x,y]=PT(o.x,o.y);const r=0.075*k;dl.poly([[x,y-r],[x+r,y],[x,y+r],[x-r,y]],{stroke:INK,w:0.6,fill:'#ffffff'});dl.text(x,y+0.025*k,n.no,{size:5*k,bold:true,anchor:'middle'});},
  panel:(o,{p,up,commit})=>{const ks=keynotesOf(p);const k=ks.find(x=>x.id===o.note);const rows=(()=>{try{return takeoff(p,{waste:0});}catch(e){return [];}})();
    const setNote=patch=>commit({...p,keynotes:(p.keynotes||[]).map(x=>x.id===o.note?{...x,...patch}:x)});
    return html`<div className="sec"><h3>Keynote ${k?k.no:''}</h3>
      <${Field} label="Note" id="kn-pick"><${Sel} id="kn-pick" value=${o.note} onChange=${v=>{if(v==='__new'){const id=uid('kn');commit({...p,keynotes:[...(p.keynotes||[]),{id,no:String(ks.length+1),text:'New note'}],kntags:p.kntags.map(t=>t.id===o.id?{...t,note:id}:t)});return;}up({note:v});}} options=${[...ks.map(x=>[x.id,x.no+'  '+x.text.slice(0,44)]),['__new','+ New keynote']]}/><//>
      ${k?html`<label className="lbl" htmlFor="kn-t">Text (every tag with this number changes)</label><textarea id="kn-t" className="inp" rows="3" key=${k.id} defaultValue=${k.text} onBlur=${e=>e.target.value!==k.text&&setNote({text:e.target.value})}></textarea>
        <${Field} label="Number" id="kn-no"><input id="kn-no" className="inp mono" key=${'n'+k.id} defaultValue=${k.no} onBlur=${e=>e.target.value&&e.target.value!==k.no&&setNote({no:e.target.value})}/><//>
        <${Field} label="Builder's list item" id="kn-it"><${Sel} id="kn-it" value=${k.item||''} onChange=${v=>setNote({item:v||null})} options=${[['','Not linked'],...rows.map(r=>[r.cat+'|'+r.item,r.cat+' · '+r.item])]}/><//>
        <p className="note">Keynotes print on the plans as numbered diamonds; sheet A0.3 lists them with the linked item and quantity.</p>`:null}</div>`;}});
let KN_LAST=null;
regTool('keynote',{label:'Keynote',short:'Keynote',group:'draft',icon:I.keynote,mode:'click',
  hint:()=>html`<b>Keynote:</b> click to place a numbered note. It reuses the last note; pick another or make a new one in its panel.`,
  place:(ctx,[pt])=>{let p=ctx.p;let ks=p.keynotes||[];let note=KN_LAST&&ks.some(k=>k.id===KN_LAST)?KN_LAST:null;
    if(!note){note=uid('kn');ks=[...ks,{id:note,no:String(ks.length+1),text:'New note'}];p={...p,keynotes:ks};}KN_LAST=note;
    const o={id:uid('kt'),level:ctx.lv.id,x:pt.x,y:pt.y,note};return {p:{...p,kntags:[...(p.kntags||[]),o]},sel:{kind:'kntag',id:o.id}};}});
addToolToGroup('draft','keynote','note');
// ---------- tag by example ----------
function tagText(p,kind,o){try{if(kind==='fixture'){const it=o.lib&&LIB_BY_ID[o.lib];if(it&&it.appl)return it.appl.model;if(isCab(o))return cabCode(p,o);return it?libCode(it):fxLabel(o);}
  if(kind==='opening')return openingMarks(p)[o.id]||o.type;if(kind==='room')return `${o.name} ${Math.round(polyArea(o.pts)/144)} sf`;if(kind==='elec')return LUMENS[o.type]?lightMark(p,o):(ELEC[o.type]||{}).label||o.type;}catch(e){}return '';}
function tagAnchor(p,t){const o=findObj(p,t.target);if(!o)return null;if(t.target.kind==='opening'){const c=openingCenter(p,o);return c?{x:c.x,y:c.y,o}:null;}if(t.target.kind==='room'){const c=polyLabelPt(o.pts);return {x:c[0],y:c[1],o};}return typeof o.x==='number'?{x:o.x,y:o.y,o}:null;}
regObj('tag',{coll:'tags',label:'Tag',plural:'tags',z:21,layer:'over',
  pts:(p,o)=>{const a=tagAnchor(p,o);return a?[{x:a.x+o.dx,y:a.y+o.dy}]:[];},noBounds:true,hit:(p,o,raw,tol)=>{const a=tagAnchor(p,o);return !!a&&Math.hypot(raw.x-(a.x+o.dx),raw.y-(a.y+o.dy))<=Math.max(8,(tol||6)*1.3);},
  move:(o,dx,dy)=>({...o,dx:o.dx+dx,dy:o.dy+dy}),title:(o,p)=>'Tag '+(p?tagText(p,o.target.kind,findObj(p,o.target)||{}):''),
  svg:(p,lv,o,S,view,isSel)=>{const a=tagAnchor(p,o);if(!a)return null;const t=tagText(p,o.target.kind,a.o);const [x,y]=S(a.x+o.dx,a.y+o.dy);const [ax,ay]=S(a.x,a.y);
    return html`<g className=${'tagx'+(isSel?' sel':'')}>${Math.hypot(o.dx,o.dy)>6?html`<line x1=${ax} y1=${ay} x2=${x} y2=${y}/>`:null}<text x=${x} y=${y} textAnchor="middle">${t}</text></g>`;},
  dl:(dl,p,lv,o,PT,k)=>{const a=tagAnchor(p,o);if(!a)return;const t=tagText(p,o.target.kind,a.o);const [x,y]=PT(a.x+o.dx,a.y+o.dy);const [ax,ay]=PT(a.x,a.y);if(Math.hypot(o.dx,o.dy)>6)dl.line(ax,ay,x,y,0.3);dl.text(x,y,t,{size:5*k,anchor:'middle',bold:true});},
  panel:(o,{p,up,commit})=>html`<div className="sec"><h3>Tag</h3><p className="note">Shows ${tagText(p,o.target.kind,findObj(p,o.target)||{})}. Drag to move it; it follows its item.</p>
    <button className="btn" onClick=${()=>commit({...p,tags:(p.tags||[]).filter(t=>!(t.level===o.level&&t.kind2===o.kind2))})}>Remove every tag made with this one</button></div>`});
function sameKind(kind,a,b){if(kind==='fixture')return a.lib&&b.lib?a.lib===b.lib||(isCab(a)&&isCab(b)&&a.type===b.type):a.type===b.type;if(kind==='opening')return a.type===b.type;if(kind==='elec')return a.type===b.type;return true;}
regTool('tagall',{label:'Tag by example',short:'Tag all',group:'draft',icon:I.tagall,mode:'click',snap:'free',
  hint:()=>html`<b>Tag by example:</b> click a cabinet, appliance, door, window, light or room. Every item like it on this level gets a tag.`,
  place:(ctx,[pt])=>{const p=ctx.p;const lv=ctx.lv.id;let best=null;
    const cand=[...(p.fixtures||[]).filter(f=>f.level===lv).map(o=>({kind:'fixture',o,d:inPoly(pt.x,pt.y,fxCorners(o).map(q=>[q.x,q.y]))?0:Math.hypot(o.x-pt.x,o.y-pt.y)})),
      ...p.openings.map(o=>{const c=openingCenter(p,o);return c&&c.w.level===lv?{kind:'opening',o,d:Math.hypot(c.x-pt.x,c.y-pt.y)}:null;}).filter(Boolean),...(p.elec||[]).filter(d=>d.level===lv).map(o=>({kind:'elec',o,d:Math.hypot(o.x-pt.x,o.y-pt.y)}))];
    for(const c of cand)if(c.d<30&&(!best||c.d<best.d))best=c;if(!best){const r=p.rooms.find(r=>r.level===lv&&inPoly(pt.x,pt.y,r.pts));if(r)best={kind:'room',o:r};}if(!best)return null;
    const coll={fixture:p.fixtures||[],opening:p.openings,elec:p.elec||[],room:p.rooms}[best.kind];const lvOf=o=>best.kind==='opening'?(p.walls.find(w=>w.id===o.wall)||{}).level:o.level;
    const like=coll.filter(o=>lvOf(o)===lv&&sameKind(best.kind,best.o,o)&&!(p.tags||[]).some(t=>t.target.id===o.id));const kind2=best.kind+':'+(best.o.lib||best.o.type||'room');
    const off=o=>{if(best.kind==='fixture'){const fr=fxFront(o);return {dx:fr.x*(o.d/2+8),dy:fr.y*(o.d/2+8)};}if(best.kind==='room')return {dx:0,dy:14};return {dx:0,dy:-14};};
    const tags=like.map(o=>({id:uid('tg'),level:lv,target:{kind:best.kind,id:o.id},kind2,...off(o)}));if(!tags.length)return null;
    (ctx.say||window.__say||(()=>{}))(`Tagged ${tags.length} item${tags.length===1?'':'s'}.`);return {p:{...p,tags:[...(p.tags||[]),...tags]},keep:true};}});
addToolToGroup('draft','tagall','keynote');
// ---------- keynote legend sheet ----------
function keynoteSheet(p){const ks=keynotesOf(p);if(!ks.length)return null;const P=PAPERS[p.sheet?.paper]||PAPERS.tabloid;const k=P.k;const dl=DL();const A=sheetFrame(dl,P,p,'A0.3','Keynote legend','');
  let rows=[];try{rows=takeoff(p,{waste:(p.settings?.waste??10)/100});}catch(e){}const used=id=>[...new Set((p.kntags||[]).filter(t=>t.note===id).map(t=>(lvlOf(p,t.level)||{}).name).filter(Boolean))].join(', ');
  let y=A.y0+0.3*k;dl.text(A.x0,y,'KEYNOTES',{size:9*k,bold:true});y+=0.15*k;const W=A.x1-A.x0;const cw=[0.5,4.6,3.2,0.8,1.6].map(v=>v*k);const sc=Math.min(1,W/cw.reduce((a,b)=>a+b,0));
  const data=ks.map(n=>{const r=n.item&&rows.find(r=>r.cat+'|'+r.item===n.item);return [n.no,wrapText(n.text||'',cw[1]*sc,6*k)[0]||'',r?r.item:'',r?`${r.qty} ${r.unit}`:'',used(n.id)];});
  drawTable(dl,A.x0,y,['NO.','NOTE','BUILDER\'S LIST ITEM','QTY','WHERE'].map((h,i)=>({h,w:cw[i]*sc})),data,k,A.y1-0.2*k);
  return {id:'kn',no:'A0.3',title:'Keynote legend',w:P.w,h:P.h,items:dl.items,scale:''};}
{const _bs=buildSheets;buildSheets=function(p){const out=_bs(p);try{const s=keynoteSheet(p);if(s){const i=out.findIndex(x=>x.no==='A0.2');out.splice(i>=0?i+1:1,0,s);}}catch(e){console.warn('keynote sheet',e);}return out;};}
