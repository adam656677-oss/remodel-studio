from h import *
with app(1500,950) as (pg,errs):
    n=pg.evaluate("""()=>{let p=window.__app.get();const lv=groundLevel(p).id;
      const plants=[['liveoak',-500,-300],['natchez',-250,-150],['encore',60,-40],['encore',120,-40],['muhly',200,-40],['magnolia',700,-200],['knockout',300,-40]].map(([sp,x,y],i)=>({id:'tp'+i,level:lv,sp,x,y,status:'new'}));
      const play=[{id:'g1',level:lv,key:'gt-pt24073',x:-200,y:900,rot:0,status:'new'},{id:'g2',level:lv,key:'gt-5192',x:350,y:900,rot:0,status:'new',seat:'gt-1481'},{id:'g4',level:lv,key:'gt-s1117',x:0,y:1200,rot:0,status:'new'}];
      const area={id:'pa1',level:lv,pts:playAreaAround(p,play),surf:'pip',status:'new'};
      p={...p,plants,play,playareas:[area]};window.__app.commit(p);const s=buildSheets(p);window.__app.setMode('sheets');return s.map(x=>x.no);}""")
    print(n); assert 'L1.0' in n and n.index('L1.0')==n.index('A0.2')+1
    pg.wait_for_timeout(1200)
    pg.locator('button',has_text='L1.0').first.click(); pg.wait_for_timeout(1000); pg.screenshot(path=str(OUT/'t54_L1.png'))
    print(errs or 'no errors'); assert not errs
    print('PASS')
