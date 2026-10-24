from h import *
with app(1400,900) as (pg,errs):
    # manual light without link + auto link
    pg.evaluate("()=>{const a=window.__app;let p=a.get();p=autoElectrical(p,p.levels[0].id);p={...p,elec:p.elec.map(d=>({...d,links:undefined}))};a.commit(p)}")
    print('before',pg.evaluate("()=>{const out=[];regChecks(window.__app.get(),(...a)=>out.push(a[2]));return out.filter(s=>/switch/.test(s))}"))
    print(pg.evaluate("()=>{const a=window.__app;const r=autoLinkSwitches(a.get(),a.get().levels[0].id);a.commit(r.p);return r.n}"))
    print('after',pg.evaluate("()=>{const out=[];regChecks(window.__app.get(),(...a)=>out.push(a[2]));return out.filter(s=>/switch/.test(s))}"))
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(400); pg.keyboard.press('f'); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'t45_plan.png'))
    pg.evaluate("()=>window.__app.setMode('materials')"); pg.wait_for_timeout(400); pg.get_by_role('tab',name='Shopping list').click(); pg.wait_for_timeout(500)
    pg.locator('table.shop input[type=checkbox]').first.check(); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/'t45_shop.png'))
    pg.get_by_role('button',name='By store department').click(); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'t45_shop2.png'))
    with pg.expect_download(timeout=30000) as dl: pg.get_by_role('button',name='Print list (PDF)').click()
    print('pdf',dl.value.suggested_filename)
    print(errs or 'no errors')
