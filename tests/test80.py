# 2.1 review fixes: palette context, area vs feet, room selection, catalog placement, floor color-by, clash edge cases, photo match keeps its render, wall photo marks, details bounds
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(500)
    # "move it" uses the selection
    fid=pg.evaluate("()=>{const f=window.__app.get().fixtures.find(f=>f.type==='island');window.__app.setSel({kind:'fixture',id:f.id});return f.id}"); pg.wait_for_timeout(200)
    x0=pg.evaluate("(id)=>window.__app.get().fixtures.find(f=>f.id===id).x",fid)
    pg.keyboard.press('Control+k'); pg.keyboard.type('move it 3 in right'); pg.wait_for_timeout(300); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    assert abs(pg.evaluate("(id)=>window.__app.get().fixtures.find(f=>f.id===id).x",fid)-x0-3)<0.01
    pg.keyboard.press('Control+k'); pg.keyboard.type('square feet of the kitchen'); pg.wait_for_timeout(300); a=pg.locator('.cmdk-ans').inner_text(); print(a); assert 'Kitchen' in a and 'square feet' in a
    pg.fill('.cmdk-in input','how many bedrooms'); pg.wait_for_timeout(300); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
    s=pg.evaluate("()=>document.querySelector('.dz-status').innerText"); print(s); assert '2 items' in s
    # "Place:" picks that catalog item
    pg.keyboard.press('Control+k'); pg.keyboard.type('B36 base cabinet'); pg.wait_for_timeout(400)
    rows=pg.locator('.cmdk-row.k-lib'); assert rows.count()>=1; rows.first.click(); pg.wait_for_timeout(300)
    n0=pg.evaluate("()=>window.__app.get().fixtures.length"); click_w(pg,300,250); pg.wait_for_timeout(300)
    nf=pg.evaluate("()=>{const p=window.__app.get();return [p.fixtures.length,p.fixtures[p.fixtures.length-1].type]}"); print(nf); assert nf[0]==n0+1 and nf[1]=='base'
    pg.evaluate("()=>window.__app.setTool('select')")
    # floor finish color-by uses the room's real finish
    rows=pg.evaluate("()=>{const p=window.__app.get();return cbLegendRows(p,p.levels[0],COLOR_BY.find(c=>c.id==='finish')).map(r=>r.label)}"); print(rows); assert any('tile' in r.lower() for r in rows) and len(rows)>=2
    # clash edge cases: pipe inside the joist depth crossing the girder line is not a girder clash; a pipe longer than its wall is still checked
    pg.evaluate("""()=>{let p=window.__app.get();const lv=p.levels[0].id;const L=joistLayout(p,p.levels[0],'floor');const g=L.members.find(m=>m.kind==='girder');const w=p.walls.find(w=>w.kind!=='exterior'&&Math.abs(w.x1-w.x2)<1);
      const gy=g?(g.a.y+g.b.y)/2:150,gx=g?(g.a.x+g.b.x)/2:150;const vert=g&&Math.abs(g.a.x-g.b.x)<1;
      const pipes=[{id:'g1',level:lv,sys:'cw',size:'1/2"',pts:vert?[[gx-40,60],[gx+40,60]]:[[60,gy-40],[60,gy+40]],z:-4,status:'new'},{id:'s1',level:lv,sys:'dwv',size:'2"',pts:[[w.x1,Math.min(w.y1,w.y2)-40],[w.x1,Math.max(w.y1,w.y2)+40]],z:18,status:'new'}];
      window.__app.commit({...p,pipes});}"""); pg.wait_for_timeout(300)
    iss=pg.evaluate("()=>runChecks(window.__app.get()).filter(i=>i.target&&['g1','s1'].includes(i.target.id)).map(i=>i.target.id+' '+i.rule.code+' '+i.title)"); print(iss)
    assert not any(x.startswith('g1 R502.8 ') for x in iss) and any(x.startswith('s1 R602.6') for x in iss)
    # wall photo shows only on its own wall's elevation
    pg.evaluate("""()=>{let p=window.__app.get();const w=p.walls.find(w=>w.kind==='exterior'&&Math.abs(w.y1-w.y2)<1&&w.y1>300);const t=(100-w.x1)/(w.x2-w.x1);const d=wdir(w);const n={x:-d.y,y:d.x};const side=n.y<0?1:-1;
      window.__app.commit({...p,wallphotos:[{id:'wp1',level:w.level,wall:w.id,t,side,z:48,stage:'before',date:'2026-10-24',note:''}]});}"""); pg.wait_for_timeout(300)
    m=pg.evaluate("""()=>{const p=window.__app.get();const k=p.rooms.find(r=>r.name==='Kitchen');let n=0;for(const W of roomWalls(p).filter(W=>W.room.id===k.id)){const dl=DL();drawInteriorElev(dl,p,elevIE(p,W),1/24,0,0,1);if(dl.items.some(i=>i.t==='text'&&/^PHOTO/.test(i.s)))n++;}return n;}""")
    print('elevations with the photo mark',m); assert m==1
    # basement wall section stays inside its cell
    b=pg.evaluate("""()=>{let p=window.__app.get();p={...p,levels:p.levels.map(l=>({...l,framing:{...(l.framing||{}),foundation:'basement'}}))};const s=buildSheets(p).find(s=>s.no==='D1.1');const ys=s.items.filter(i=>i.t==='poly'&&i.fill==='#eeeeee').flatMap(i=>i.pts.map(q=>q[1]));return [Math.min(...ys),Math.max(...ys)];}""")
    print('basement wall y',b); assert b[0]>0.9
    # photo match keeps its render after it saves
    pg.evaluate("""async()=>{const c=document.createElement('canvas');c.width=800;c.height=600;const g=c.getContext('2d');g.fillStyle='#888';g.fillRect(0,0,800,600);const blob=await new Promise(r=>c.toBlob(r,'image/png'));
      let p=window.__app.get();await assetPut({id:'ph-pm',project:p.id||'default',kind:'photo',blob,w:800,h:600,name:'k.png'});const room=p.rooms.find(r=>r.name==='Kitchen');const refs=matchPoints(p,room);
      const xs=room.pts.map(q=>q[0]),ys=room.pts.map(q=>q[1]);const cam=new THREE.PerspectiveCamera(100,800/600,0.1,500);cam.position.set((Math.min(...xs)+6)*IN,5.2,(Math.min(...ys)+6)*IN);cam.lookAt((Math.min(...xs)+Math.max(...xs))/2*IN+2,3.5,(Math.min(...ys)+Math.max(...ys))/2*IN+2);cam.updateMatrixWorld();
      const pts={};for(const r of refs){const v=new THREE.Vector3(...r.X).project(cam);if(v.z<1&&Math.abs(v.x)<1.2&&Math.abs(v.y)<1.2)pts[r.key]=[(v.x+1)/2*800,(1-v.y)/2*600];}
      window.__app.commit({...p,photomatch:{asset:'ph-pm',room:room.id,pts}});}"""); pg.wait_for_timeout(400)
    pg.evaluate("()=>window.dispatchEvent(new CustomEvent('rs-dialog',{detail:'photomatch'}))"); pg.wait_for_timeout(1200)
    pg.click('.pm button:has-text("Show the design")'); pg.wait_for_timeout(1500); assert pg.locator('.pm-shot').count()==1, 'render stays'
    pg.screenshot(path=str(OUT/'t80_pm.png'))
    assert not errs, errs
print('PASS test80')
