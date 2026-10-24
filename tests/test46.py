from h import *
def sheet(pg,no,name):
    svg=pg.evaluate("(no)=>sheetToSVGString(buildSheets(window.__app.get()).find(s=>s.no===no))",no)
    pg2=pg.context.new_page(); pg2.set_viewport_size({'width':1700,'height':1080}); pg2.set_content('<body style="margin:0;background:#fff">'+svg.replace('<svg','<svg style="width:1700px;height:auto"',1)+'</body>'); pg2.wait_for_timeout(300); pg2.screenshot(path=str(OUT/name)); pg2.close()
with app(1400,900) as (pg,errs):
    # zoning + permit
    pg.evaluate("()=>{const a=window.__app;const p=a.get();a.commit({...p,sheet:{...(p.sheet||{}),lot:{w:900,d:1500,front:300,left:200}},settings:{...p.settings,zoning:{front:300,side:84,rear:240,coverage:35,imperv:50,height:420}}})}")
    print(pg.evaluate("()=>{const z=zoningRows(window.__app.get());return [z.rows,z.S.A,z.S.lotA,z.S.coverage,z.S.impervPct,z.S.height]}"))
    pg.evaluate("()=>window.__app.setMode('sheets')"); pg.wait_for_timeout(800)
    with pg.expect_download(timeout=30000) as dl: pg.get_by_role('button',name='Permit packet (PDF)').click()
    dl.value.save_as(str(OUT/'t46_permit.pdf')); print('permit pdf ok')
    # lighting
    pg.evaluate("()=>{const a=window.__app;a.commit(autoElectrical(a.get(),a.get().levels[0].id))}")
    print(pg.evaluate("()=>lightLevels(window.__app.get()).map(x=>[x.r.name,x.devs,x.lm,Math.round(x.fc),x.target,x.need])"))
    pg.evaluate("()=>window.__app.setMode('systems')"); pg.wait_for_timeout(400); pg.get_by_role('tab',name='Lighting').click(); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'t46_light.png'))
    # bath template
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(300); pg.keyboard.press('f')
    pg.get_by_role('button',name='Edit').click(); pg.get_by_text('Blocks…').click(); pg.wait_for_timeout(300)
    pg.locator('.blockrow').filter(has_text='roll-in').get_by_role('button',name='Place').click(); pg.wait_for_timeout(300)
    n0=pg.evaluate("()=>[window.__app.get().walls.length,window.__app.get().fixtures.length]"); click_w(pg,240,120); pg.wait_for_timeout(300); pg.keyboard.press('Escape')
    print('template',n0,pg.evaluate("()=>[window.__app.get().walls.length,window.__app.get().fixtures.length,window.__app.get().openings.length]"))
    pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'t46_bath.png'))
    # OBJ
    pg.get_by_role('button',name='File').click(); pg.get_by_text('Import 3D model (OBJ, GLB, DAE, STL)…').click(); pg.wait_for_timeout(300)
    pg.select_option('#ob-u','ft'); pg.set_input_files('#ob-file','box.obj'); pg.wait_for_timeout(1200); print(pg.locator('.modal .msg').inner_text()); pg.get_by_role('button',name='Done').click()
    # option compare
    pg.evaluate("()=>{const a=window.__app;let p=addOption(a.get());p={...p,walls:p.walls.filter(w=>w.id!=='wc')};a.commit(p)}"); pg.wait_for_timeout(300)
    pg.select_option('select[aria-label="Compare with option"]',index=1); pg.wait_for_timeout(400); print('compare els',pg.locator('.w-compare').count())
    pg.screenshot(path=str(OUT/'t46_compare.png'))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1800); pg.screenshot(path=str(OUT/'t46_3d.png'))
    print(errs or 'no errors')
