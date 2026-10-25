/* ======================= revisions from change orders: model snapshot, clouds on the plan sheets ======================= */
// When the contract is locked, a light snapshot of the model is kept (one hash and box per part). Each change order
// records which parts changed since the last one, adds a revision to the title blocks, and the plan sheets cloud
// those areas with a revision triangle. Void change orders lose their clouds.
const SNAP_COLLS=[['walls','wall'],['openings','opening'],['rooms','room'],['fixtures','fixture'],['elec','elec'],['pipes','pipe'],['ducts','duct'],['stairs','stair']];
function h32(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36);}
function partBox(p,kind,o){const B=(xs,ys,pad=0)=>[Math.min(...xs)-pad,Math.min(...ys)-pad,Math.max(...xs)+pad,Math.max(...ys)+pad].map(v=>Math.round(v));
  try{if(kind==='wall')return B([o.x1,o.x2],[o.y1,o.y2],(o.thick||5)/2+6);if(kind==='opening'){const c=openingCenter(p,o);return c?B([c.x],[c.y],o.width/2+8):null;}
    if(kind==='room')return B(o.pts.map(q=>q[0]),o.pts.map(q=>q[1]),0);if(kind==='fixture'){const c=fxCorners(o);return B(c.map(q=>q.x),c.map(q=>q.y),4);}
    if(kind==='pipe'||kind==='duct')return B(o.pts.map(q=>q[0]),o.pts.map(q=>q[1]),8);if(typeof o.x==='number')return B([o.x],[o.y],kind==='stair'?40:10);}catch(e){}return null;}
function partLevel(p,kind,o){if(o.level)return o.level;if(kind==='opening'){const w=p.walls.find(w=>w.id===o.wall);return w&&w.level;}return null;}
function modelSnap(p){const S={};for(const [coll,kind] of SNAP_COLLS)for(const o of (p[coll]||[])){const {id,...rest}=o;S[kind+':'+o.id]={h:h32(JSON.stringify(rest)),l:partLevel(p,kind,o),b:partBox(p,kind,o)};}return S;}
function modelDiff(A,B){if(!A||!B)return [];const out=[];for(const [k,v] of Object.entries(B)){const a=A[k];if(!a)out.push({k,ch:'add',l:v.l,b:v.b});else if(a.h!==v.h)out.push({k,ch:'mod',l:v.l||a.l,b:v.b||a.b});}
  for(const [k,a] of Object.entries(A))if(!B[k])out.push({k,ch:'del',l:a.l,b:a.b});return out.filter(x=>x.b&&x.l);}
// group nearby boxes so one cloud covers a cluster of changes
function clusterBoxes(boxes,gap=30){const cs=boxes.map(b=>[...b]);let merged=true;while(merged){merged=false;for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++){const a=cs[i],b=cs[j];if(a[0]-gap<=b[2]&&b[0]-gap<=a[2]&&a[1]-gap<=b[3]&&b[1]-gap<=a[3]){cs[i]=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.max(a[3],b[3])];cs.splice(j,1);merged=true;j--;}}}return cs;}
function revisionClouds(p,levelId){const C=p.contract;if(!C||!(C.changeOrders||[]).length||(p.settings&&p.settings.revClouds===false))return [];const out=[];
  for(const co of C.changeOrders){if(co.status==='void'||!co.changed||!co.changed.length)continue;const bs=co.changed.filter(c=>c.l===levelId).map(c=>c.b);if(!bs.length)continue;
    for(const b of clusterBoxes(bs))out.push({rev:co.rev||co.no,box:[b[0]-10,b[1]-10,b[2]+10,b[3]+10]});}return out;}
{const _dp=drawPlan;drawPlan=function(dl,p,lv,sc,ox,oy,B,k,marks){_dp(dl,p,lv,sc,ox,oy,B,k,marks);try{const cl=revisionClouds(p,lv.id);if(!cl.length)return;const X=x=>ox+(x-B.x0)*sc,Y=y=>oy+(y-B.y0)*sc;
    for(const c of cl){const [x0,y0,x1,y1]=[X(c.box[0]),Y(c.box[1]),X(c.box[2]),Y(c.box[3])];const P=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];const arc=Math.max(0.12*k,Math.min(0.3*k,Math.min(x1-x0,y1-y0)/4));
      dl.poly(cloudPts(P,arc),{stroke:'#c0392b',w:0.8});const tx=x1+0.02*k,ty=y0-0.02*k,s=0.17*k;dl.poly([[tx,ty-s],[tx+s*0.9,ty+s*0.55],[tx-s*0.9,ty+s*0.55]],{stroke:'#c0392b',w:0.7,fill:'#ffffff'});
      dl.text(tx,ty+s*0.38,String(c.rev),{size:6.5*k,bold:true,anchor:'middle',color:'#c0392b'});}}catch(e){console.warn('revision clouds',e);}};}
// the next revision number for the title block table
function nextRevNo(p){const revs=(p.info&&p.info.revisions)||[];const n=revs.map(r=>parseInt(r.no)).filter(v=>isFinite(v));return String((n.length?Math.max(...n):0)+1);}
