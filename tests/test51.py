from h import *
import base64
with app(1500,950) as (pg,errs):
    r=pg.evaluate("""()=>{let p=window.__app.get();const lv=groundLevel(p).id;
      const plants=[['liveoak',-500,-300],['natchez',-250,-150],['encore',60,-40],['encore',120,-40],['muhly',200,-40],['magnolia',700,-200],['loblolly',650,500],['knockout',300,-40],['sabal',-200,500]].map(([sp,x,y],i)=>({id:'tp'+i,level:lv,sp,x,y,status:'new'}));
      const bed={id:'tb',level:lv,type:'bed',surf:'mulch',pts:[[0,-90],[400,-90],[400,-10],[0,-10]],fill:{sp:'liriope',spacing:null},edge:'steel',irrig:'drip',status:'new'};
      const lawn={id:'tl',level:lv,type:'lawn',surf:'sod',sod:'staug',pts:[[-600,-500],[900,-500],[900,-100],[-600,-100]],irrig:'rotor',status:'new'};
      const play=[{id:'g1',level:lv,key:'gen-struct',x:-200,y:900,rot:0,status:'new'},{id:'g2',level:lv,key:'gen-swing2',x:200,y:900,rot:0,status:'new'},{id:'g3',level:lv,key:'gen-spring',x:-50,y:1150,rot:0,status:'new'}];
      const area={id:'pa1',level:lv,pts:playAreaAround(p,play),surf:'ewf',status:'new'};
      p={...p,plants,site:[...(p.site||[]),bed,lawn],play,playareas:[area]};window.__app.commit(p);
      return {iss:runChecks(p).filter(i=>/Landscape|CPSC|ASTM|ADA/.test(i.rule&&i.rule.set||'')&&i.target&&['plant','play','playarea'].includes(i.target.kind)).map(i=>i.rule.code+' '+i.title),
        take:takeoff(p,{waste:0}).filter(r=>/Landscape|Site|Playground/.test(r.cat)).map(r=>r.qty+' '+r.unit+' '+r.item)}}""")
    for k,v in r.items(): print(k); [print('  ',x) for x in v]
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.keyboard.press('f'); pg.wait_for_timeout(800); pg.screenshot(path=str(OUT/'land_plan.png'))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(3000); pg.screenshot(path=str(OUT/'land_3d.png'))
    for k in ['ls-liveoak','ls-natchez','ls-encore','ls-muhly','ls-sabal','ls-magnolia','pg-gen-struct','pg-gen-swing2','pg-gen-slide']:
        u=pg.evaluate("async id=>await requestPic('lib',LIB_BY_ID[id],window.__app.get(),{w:240,h:180})",k)
        if u: open(OUT/f'lp_{k}.png','wb').write(base64.b64decode(u.split(',')[1]))
    print(errs[:5])
