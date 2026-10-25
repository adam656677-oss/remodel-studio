# 2.1: walls from a plan image, IFC export (structure checked by ifcval.py), photo-match camera solve and render
import subprocess
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200)
    # a plan image: two rooms drawn with 5in black walls and a 36in door gap, 1 px = 1 inch, rotated 4 degrees
    r=pg.evaluate("""async()=>{const c=document.createElement('canvas');c.width=420;c.height=300;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,420,300);g.translate(30,30);g.rotate(4*Math.PI/180);g.fillStyle='#111';
        g.fillRect(0,0,340,5);g.fillRect(0,195,340,5);g.fillRect(0,0,5,200);g.fillRect(335,0,5,200);g.fillRect(170,0,5,60);g.fillRect(170,96,5,104);
        const blob=await new Promise(r=>c.toBlob(r,'image/png'));let p=window.__app.get();const id='ul-test';await assetPut({id,project:p.id||'default',kind:'underlay',blob,w:420,h:300,name:'plan.png'});
        const lv=p.levels[0].id;p={...p,walls:p.walls.filter(w=>w.level!==lv),openings:[],rooms:[],fixtures:[],underlay:{asset:id,level:lv,x:0,y:0,scale:1,opacity:0.5,w:420,h:300}};window.__app.commit(p);return lv;}""")
    pg.wait_for_timeout(500)
    pg.evaluate("()=>window.dispatchEvent(new CustomEvent('rs-dialog',{detail:'scanwalls'}))"); pg.wait_for_timeout(500)
    pg.select_option('#sw-src','image'); pg.click('button:has-text("Find walls")'); pg.wait_for_timeout(3000)
    msg=pg.locator('.modal').inner_text(); print(msg[msg.find('Found'):msg.find('Found')+120])
    pg.screenshot(path=str(OUT/'t78_scan.png'))
    pg.click('.modal button:has-text("Add")'); pg.wait_for_timeout(500)
    w=pg.evaluate("()=>{const p=window.__app.get();return {n:p.walls.length,lens:p.walls.map(w=>Math.round(Math.hypot(w.x2-w.x1,w.y2-w.y1))).sort((a,b)=>b-a),doors:p.openings.filter(o=>o.type==='door').map(o=>o.width)}}"); print(w)
    assert w['n']==5 and w['lens'][0]>=330 and w['lens'][0]<=350 and len(w['doors'])==1 and 34<=w['doors'][0]<=38
    # IFC
    pg.evaluate(KITCHEN_JS) if False else None
    t=pg.evaluate("()=>{const r=buildIFC(window.__app.get(),{items:true});return r.text}"); open('shots/t78.ifc','w').write(t)
    out=subprocess.run(['python3','ifcval.py','shots/t78.ifc'],capture_output=True,text=True).stdout; print(out); assert 'missing refs 0' in out and "bad []" in out and 'IFCWALL 5' in out and 'IFCDOOR 1' in out
    # photo match: make a known camera, project the corners, solve, compare
    pr=pg.evaluate("""()=>{const p=sampleProject();const room=p.rooms.find(r=>r.name==='Kitchen')||p.rooms[0];const refs=matchPoints(p,room);
      const cam=new THREE.PerspectiveCamera(100,1600/1200,0.1,500);const c=polyLabelPt(room.pts);const xs=room.pts.map(q=>q[0]),ys=room.pts.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);cam.position.set((x0+6)*IN,5.2,(y0+6)*IN);cam.lookAt((x0+x1)/2*IN+2,3.5,(y0+y1)/2*IN+2);cam.updateMatrixWorld();
      const pairs=[];for(const r of refs){const v=new THREE.Vector3(...r.X).project(cam);if(v.z<1&&Math.abs(v.x)<1.2&&Math.abs(v.y)<1.2)pairs.push({X:r.X,u:[(v.x+1)/2*1600,(1-v.y)/2*1200]});}
      const P=solveDLT(pairs);const errs=pairs.map(q=>{const r=projP(P,q.X);return Math.hypot(r[0]-q.u[0],r[1]-q.u[1]);});
      // a point not used in the solve
      const X=[c[0]*IN,2,c[1]*IN];const v=new THREE.Vector3(...X).project(cam);const r=projP(P,X);const hold=Math.hypot(r[0]-(v.x+1)/2*1600,r[1]-(1-v.y)/2*1200);
      const url=renderMatched(p,room,P,400,300);return {n:pairs.length,max:Math.max(...errs),hold,url:url.slice(0,30),len:url.length};}""")
    print(pr); assert pr['n']>=6 and pr['max']<0.5 and pr['hold']<0.5 and pr['url'].startswith('data:image/png') and pr['len']>5000
    pg.evaluate("()=>window.dispatchEvent(new CustomEvent('rs-dialog',{detail:'photomatch'}))"); pg.wait_for_timeout(600); assert pg.locator('.pm').count()==1
    assert not errs, errs
print('PASS test78')
