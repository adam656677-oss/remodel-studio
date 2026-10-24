from h import *
from test21b import setup, cam
with app() as (pg,errs):
    setup(pg)
    pg.evaluate("""()=>{const a=window.__app;let p={...a.get()};const L=p.levels[0].id;const W=(x1,y1,x2,y2)=>({id:uid('w'),level:L,x1,y1,x2,y2,thick:5.5,kind:'exterior',bearing:true,height:null,status:'new'});
      p.walls=p.walls.filter(w=>w.id!=='wr');p.walls.push(W(480,0,648,0),W(648,0,648,192),W(648,192,480,192),W(480,192,480,336));
      p.openings=p.openings.filter(o=>o.wall!=='wr');p.roofs=autoRoof(p,L,{style:'hip',pitch:6,overhang:12});
      p.dormers=[{id:'dm1',level:L,roof:p.roofs[0].id,x:150,y:40,a:-Math.PI/2,style:'gable',w:72,wh:42,pitch:8,oh:8,status:'new'},{id:'dm2',level:L,roof:p.roofs[0].id,x:150,y:300,a:Math.PI/2,style:'shed',w:120,wh:40,pitch:3,oh:8,status:'new'}];
      a.commit(p);a.setMode('plan');}""")
    pg.wait_for_timeout(500); pg.keyboard.press('f'); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t22c_plan.png'))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500)
    cam(pg,[-30,40,-40],[20,4,14]); pg.screenshot(path=str(OUT/'t22c_dormer.png'),clip={'x':60,'y':50,'width':1040,'height':800})
    cam(pg,[20,30,70],[20,4,14]); pg.screenshot(path=str(OUT/'t22c_back.png'),clip={'x':60,'y':50,'width':1040,'height':800})
    print(errs or 'no errors')
