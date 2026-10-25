from h import *
with app() as (pg,errs):
    pg.evaluate("""()=>{const a=window.__app;let p=a.get();p={...p,settings:{...p.settings,gradeOffset:30,foundation:{finish:'brick'}}};a.commit(p);}""")
    pg.wait_for_timeout(300)
    # porch by drag on the front (y=0 wall, house is 0..480 x 0..336); front is y<0
    pg.evaluate("()=>window.__app.setTool('porch')"); pg.wait_for_timeout(200)
    a=w2s(pg,96,-2.75); b=w2s(pg,300,-96)
    pg.mouse.move(*a); pg.mouse.down(); pg.mouse.move(b[0],b[1],steps=6); pg.mouse.up(); pg.wait_for_timeout(300)
    # deck on the back
    pg.evaluate("()=>window.__app.setTool('deck')"); pg.wait_for_timeout(200)
    a=w2s(pg,300,338.75); b=w2s(pg,456,470)
    pg.mouse.move(*a); pg.mouse.down(); pg.mouse.move(b[0],b[1],steps=6); pg.mouse.up(); pg.wait_for_timeout(300)
    P=pg.evaluate("()=>window.__app.get()")
    print('decks',[(d['kind'],d['pts']) for d in P.get('decks',[])])
    # steps on porch front edge and auto steps
    pg.evaluate("()=>window.__app.setTool('steps')"); pg.wait_for_timeout(200)
    click_w(pg,200,-96)
    pg.get_by_role('button',name='Select').first.click() if False else None
    pg.evaluate("()=>{window.__app.setSel(null);window.__app.setTool('select');}"); pg.wait_for_timeout(200)
    pg.get_by_role('button',name='Add steps at every outside door').click(); pg.wait_for_timeout(300)
    P=pg.evaluate("()=>window.__app.get()")
    print('steps',[(round(s['x']),round(s['y']),round(s['a'],2),s.get('deck'),s['landing']) for s in P.get('steps',[])])
    print('checks',pg.evaluate("()=>runChecks(window.__app.get()).filter(i=>/R31|R40|R50|R317/.test(i.rule&&i.rule.code||'')).map(i=>i.rule.code+' '+i.title)"))
    pg.screenshot(path=str(OUT/'t21_plan.png'))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500)
    pg.screenshot(path=str(OUT/'t21_3d.png'))
    rows=pg.evaluate("()=>takeoff(window.__app.get()).filter(r=>/Foundation|Decks/.test(r.cat)).map(r=>r.cat+': '+r.item+' '+r.qty+' '+r.unit)")
    print('\n'.join(rows))
    print(errs or 'no errors')
