from h import *
import base64
with app(1500,950) as (pg,errs):
    r=pg.evaluate("""()=>{let p=window.__app.get();const lv=groundLevel(p).id;
      const n=Object.values(PLAY).filter(c=>c.brand==='GameTime').length;
      const lib=LIB.filter(x=>x.cat==='Playground');
      const play=[{id:'g1',level:lv,key:'gt-pt24144',x:-300,y:1100,rot:0,status:'new'},{id:'g2',level:lv,key:'gt-5192',x:450,y:1100,rot:0,status:'new',seat:'gt-5375'},
        {id:'g3',level:lv,key:'gt-6299',x:-300,y:1500,rot:0,status:'new'},{id:'g4',level:lv,key:'gt-s1117',x:400,y:1550,rot:0,status:'new'}];
      const area={id:'pa1',level:lv,pts:playAreaAround(p,play),surf:'ewf',border:'gtcurb12',status:'new'};
      p={...p,play,playareas:[area]};window.__app.commit(p);
      const t=takeoff(p,{waste:0}).filter(r=>/Playground/.test(r.cat)).map(r=>r.qty+' '+r.unit+' '+r.item);
      const iss=runChecks(p).filter(i=>i.target&&['play','playarea'].includes(i.target.kind)).map(i=>i.sev+' '+i.rule.code+' '+i.title);
      return {n,lib:lib.length,subs:[...new Set(lib.map(x=>x.sub))],seats:Object.keys(PLAY_SEATS).length,surfGT:PLAY_SURF_GT.length,borders:PLAY_BORDERS.map(b=>b[0]),
        schemes:Object.keys(PLAY_SCHEMES),t,iss,est:Object.values(PLAY).filter(c=>c.est).length};}""")
    for k,v in r.items(): print(k,':'); [print('  ',x) for x in v] if isinstance(v,list) else print('  ',v)
    assert r['n']>=110 and r['seats']>=5 and r['surfGT']>=5
    assert any('PlayCurb' in x for x in r['t']) and any('Zero-G' in x for x in r['t']) and any('PT24144' in x for x in r['t'])
    pg.evaluate("()=>{window.__app.setMode('plan');window.__app.setSel({kind:'play',id:'g2'});}"); pg.keyboard.press('f'); pg.wait_for_timeout(900); pg.screenshot(path=str(OUT/'gt_plan.png'))
    assert pg.locator('#pg-seat').count()==1
    assert pg.get_by_text('Size is estimated').count()>=1
    pg.evaluate("()=>window.__app.setSel({kind:'playarea',id:'pa1'})"); pg.wait_for_timeout(400)
    assert pg.get_by_text('GameTime option: Engineered Wood Fiber').count()==1
    pg.evaluate("()=>{window.__app.setSel(null);window.__app.setMode('3d');}"); pg.wait_for_timeout(3500); pg.screenshot(path=str(OUT/'gt_3d.png'))
    for k in ['pg-gt-pt24144','pg-gt-5192','pg-gt-6299','pg-gt-qri154','pg-gt-91770','pg-gen-sandbox','pg-gen-fort']:
        u=pg.evaluate("async id=>await requestPic('lib',LIB_BY_ID[id],window.__app.get(),{w:240,h:180})",k)
        assert u, k
        open(OUT/f'gp_{k}.png','wb').write(base64.b64decode(u.split(',')[1]))
    print('errors',errs[:5]); assert not errs
    print('PASS')
