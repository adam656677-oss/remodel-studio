/* ======================= lighting levels per room, accessible bath templates ======================= */
const LUMENS={light:1600,can:800,pendant:800,fan:1200,sconce:450,undercab:300,exterior:700};
const FC_TARGET={kitchen:[30,'cooking and prep need 50 at the counter; under-cabinet lights cover that'],bath:[30,'vanity light at face height'],living:[10,'add lamps for reading (30)'],dining:[20,''],bedroom:[10,'reading lamps by the bed'],hall:[5,''],laundry:[30,''],office:[30,'desk task light 50'],garage:[20,'workbench 50'],closet:[10,''],other:[10,'']};
function lightLevels(p){const CU=0.6,LLF=0.85;return p.rooms.filter(r=>r.use!=='porch').map(r=>{const a=polyArea(r.pts)/144;const devs=(p.elec||[]).filter(d=>d.level===r.level&&d.status!=='demolish'&&LUMENS[d.type]&&inPoly(d.x,d.y,r.pts));
  const lm=devs.reduce((s,d)=>s+(d.lumens||LUMENS[d.type]),0);const fc=a>0?lm*CU*LLF/a:0;const [target,tip]=FC_TARGET[r.use||'other']||FC_TARGET.other;const need=Math.max(0,Math.ceil((target*a/(CU*LLF)-lm)/800));
  const lv=lvlOf(p,r.level);const H=(r.ceilingH||lv?.height||96)/12;return {r,a,lm,fc,target,tip,need,devs:devs.length,spacing:Math.round(H)};});}
function LightingTab({p,commit}){const rows=lightLevels(p);return html`<section className="sec"><h3>Light levels by room</h3><div className="tablewrap"><table className="mat"><thead><tr><th>Room</th><th className="num">Fixtures</th><th className="num">Lumens</th><th className="num">Foot-candles</th><th className="num">Target</th><th>Advice</th></tr></thead><tbody>
  ${rows.map(x=>html`<tr key=${x.r.id}><td>${x.r.name}</td><td className="num mono">${x.devs}</td><td className="num mono">${x.lm.toLocaleString()}</td><td className="num mono">${x.fc.toFixed(0)}</td><td className="num mono">${x.target}</td>
    <td>${x.devs===0?html`<span className="pill warn">No lights</span> `:x.fc<x.target*0.8?html`<span className="pill warn">Dim</span> `:x.fc>x.target*2.5?html`<span className="pill">Bright</span> `:html`<span className="pill ok">Good</span> `}${x.need?`Add about ${x.need} six-inch recessed light${x.need===1?'':'s'} (800 lm), spaced about ${x.spacing} ft apart. `:''}<span className="note">${x.tip}</span></td></tr>`)}</tbody></table></div>
  <p className="note">Average light from the ceiling fixtures (lumens x 0.6 room utilization x 0.85 aging, over the floor area), compared with IES residential guidance. Lumens use typical LED values; set a fixture's own lumens in its panel.</p></section>`;}
/* ---- accessible bath templates (2010 ADA 603-609): walls, door, fixtures and grab bars placed as a block ---- */
FIXTURES.grabbar={label:'Grab bar',cat:'Bath',w:42,d:3,h:1.5,elev:33,color:0xc9ccd0,free:true};
function bathTemplate(kind){const wall=(x1,y1,x2,y2)=>({kind:'wall',obj:{id:uid('tw'),x1,y1,x2,y2,thick:4.5,kind:'interior',bearing:false,height:null,status:'new'}});
  const fx=(type,x,y,rot,extra={})=>{const t=FIXTURES[type];return {kind:'fixture',obj:{id:uid('tf'),type,x,y,rot,w:t.w,d:t.d,h:t.h,elev:t.elev||0,status:'new',...extra}};};
  const gb=(x,y,rot,len,elev=33.5,name)=>fx('grabbar',x,y,rot,{w:len,name:name||`Grab bar ${len}"`,elev});
  // finished interior half-sizes; walls sit on centerlines 2-1/4" outside the finished faces
  const half=kind==='half';const hx=half?42:56,hy=half?42:43;const X=hx+2.25,Y=hy+2.25;const items=[wall(-X,-Y,X,-Y),wall(X,-Y,X,Y),wall(X,Y,-X,Y),wall(-X,Y,-X,-Y)];
  const tcx=-hx+18; // toilet centerline 18" from the side wall (ADA 604.2)
  items.push(fx('toilet',tcx,-hy+14,0),fx('lav',tcx+18+12,-hy+10,0,{name:'Wall-hung lavatory, 34" max rim, knee space'}),
    gb(-hx+1,-hy+12+21,90,42,33.5,'Side grab bar 42"'),gb(tcx+6,-hy+1,0,36,33.5,'Rear grab bar 36"'));
  let label;
  if(kind==='rollin'){label='Accessible bath 9\'-4" x 7\'-2" with roll-in shower';items.push(fx('rollin',hx-15,-hy+30,90,{w:60,d:30,name:'Roll-in shower 60" x 30" with fold-down seat'}),gb(hx-1,-hy+30,90,48,34,'Shower back-wall grab bar 48"'),gb(hx-15,-hy+1,0,24,34,'Shower side grab bar 24"'));}
  else if(kind==='tub'){label='Accessible bath 9\'-4" x 7\'-2" with tub';items.push(fx('tub',hx-15,-hy+30,90,{w:60,d:30,name:'Bathtub 60" with a seat at the head end'}),gb(hx-1,-hy+18,90,24,34,'Tub back-wall grab bar 24"'),gb(hx-1,-hy+44,90,24,34,'Tub back-wall grab bar 24"'),gb(hx-15,-hy+1,0,24,34,'Control-end grab bar 24"'));}
  else label='Accessible half bath 7\'-0" x 7\'-0"';
  items.push({kind:'room',obj:{id:uid('tr'),name:half?'Half bath':'Bath',use:'bath',pts:[[-X,-Y],[X,-Y],[X,Y],[-X,Y]],status:'new'}});
  const dc=half?10:-19;const dw=items[2].obj;const openings=[{id:uid('to'),wall:dw.id,type:'door',pos:X-dc,width:36,height:80,sill:0,hinge:0,swing:1,status:'new',name:'36" door (32" clear)'}];
  return {id:'tpl-'+kind,name:label,items,openings,count:items.length,builtin:true};}
const BATH_TEMPLATES=[['rollin','Bath 9\'-4" x 7\'-2", roll-in shower'],['tub','Bath 9\'-4" x 7\'-2", tub with grab bars'],['half','Half bath 7\' x 7\'']];
