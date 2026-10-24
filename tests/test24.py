from h import *
from test21b import cam
with app() as (pg,errs):
    pg.evaluate("""()=>{const a=window.__app;let p={...a.get()};const L1=p.levels[0];const L2={id:'lv2',name:'Second floor',elevation:108,height:96};p.levels=[...p.levels,L2];
      p.stairs=[{id:'s1',level:L1.id,x:60,y:150,width:36,tread:10,dir:'N',rise:null,shape:'L',turn:'right'},{id:'s2',level:L1.id,x:300,y:300,width:36,tread:10,dir:'N',rise:null,shape:'U',turn:'right'},
        {id:'s3',level:L1.id,x:420,y:80,width:30,tread:10,dir:'E',rise:null,shape:'spiral',turn:'right'},{id:'s4',level:L1.id,x:150,y:320,width:36,tread:10,dir:'N',shape:'Lw',turn:'left',rise:null}];
      p.rooms=[...p.rooms,{id:'r2',level:'lv2',name:'Upstairs',use:'bedroom',pts:[[0,0],[480,0],[480,336],[0,336]]}];a.commit(p);a.setMode('plan');}""")
    pg.wait_for_timeout(600); pg.keyboard.press('f'); pg.wait_for_timeout(400)
    pg.screenshot(path=str(OUT/'t24_plan.png'))
    print(pg.evaluate("()=>window.__app.get().stairs.map(s=>{const g=stairGeo(window.__app.get(),s);return [s.shape,g.N,g.rh.toFixed(2),g.steps.length,g.landings.length]})"))
    print(pg.evaluate("()=>runChecks(window.__app.get()).filter(i=>i.target&&i.target.kind==='stair').map(i=>i.title)"))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500)
    pg.get_by_role('button',name='Show roof').click(); pg.wait_for_timeout(500)
    cam(pg,[20,40,20],[20,0,15]); pg.screenshot(path=str(OUT/'t24_3d.png'),clip={'x':60,'y':50,'width':1040,'height':800})
    print(errs or 'no errors')
