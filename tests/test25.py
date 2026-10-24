from h import *
from test21b import setup, cam
with app() as (pg,errs):
    setup(pg)
    pg.evaluate("""()=>{const a=window.__app;let p={...a.get()};const L=p.levels[0].id;
      p.site=[{id:'d1',level:L,type:'drive',surf:'concrete',pts:[[500,-300],[620,-300],[620,60],[500,60]]},{id:'w1',level:L,type:'walk',surf:'concrete',w:36,pts:[[200,-118],[200,-240],[500,-240]]},
        {id:'t1',level:L,type:'tree',surf:'oak',x:-150,y:-200,d:300},{id:'t2',level:L,type:'tree',surf:'pine',x:700,y:400,d:180},{id:'s1',level:L,type:'shrub',surf:'round',x:20,y:-30,d:36},{id:'s2',level:L,type:'shrub',surf:'boxwood',x:340,y:-30,d:30},
        {id:'f1',level:L,type:'fence',surf:'privacy',h:72,pts:[[-60,300],[-60,600],[560,600],[560,480]]},{id:'b1',level:L,type:'bed',surf:'mulch',pts:[[-12,-12],[96,-12],[96,-48],[-12,-48]]},
        {id:'lt',level:L,type:'lot',surf:'line',pts:[[-300,-420],[780,-420],[780,700],[-300,700]]},{id:'rw',level:L,type:'retwall',surf:'block',h:30,w:12,pts:[[-200,450],[-200,650]]}];
      p.mep=[{id:'m1',level:L,type:'condenser',x:520,y:250,rot:0},{id:'m2',level:L,type:'wh',x:20,y:300,rot:0},{id:'m3',level:L,type:'supply',x:120,y:60,rot:0},{id:'m4',level:L,type:'returnGrille',x:240,y:100,rot:90}];
      a.commit(p);a.setMode('plan');}""")
    pg.wait_for_timeout(600); pg.keyboard.press('f'); pg.wait_for_timeout(400)
    pg.screenshot(path=str(OUT/'t25_plan.png'))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500)
    cam(pg,[-30,35,-60],[20,0,10]); pg.screenshot(path=str(OUT/'t25_3d.png'),clip={'x':60,'y':50,'width':1040,'height':800})
    rows=pg.evaluate("()=>takeoff(window.__app.get()).filter(r=>/Site|HVAC|Plumbing/.test(r.cat)).map(r=>r.cat+': '+r.item+' '+r.qty+' '+r.unit)"); print('\n'.join(rows))
    print(errs or 'no errors')
