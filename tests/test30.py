from h import *
with app() as (pg,errs):
    pg.evaluate("()=>window.__app.setMode('capture')"); pg.wait_for_timeout(600)
    pg.get_by_role('tab',name='Underlay',exact=False).click() if pg.get_by_role('tab',name='Underlay',exact=False).count() else pg.get_by_text('Underlay',exact=False).first.click()
    pg.wait_for_timeout(300)
    pg.set_input_files('#ul-file','plan.pdf'); pg.wait_for_selector('#pdf-sc',timeout=30000)
    print(pg.locator('.capcard .msg').all_inner_texts())
    pg.fill('#pdf-pg','2'); pg.select_option('#pdf-sc','48'); pg.get_by_role('button',name='Place page on the plan').click(); pg.wait_for_function("()=>window.__app.get().underlay",timeout=30000)
    print(pg.locator('.capcard .msg').all_inner_texts())
    u=pg.evaluate("()=>window.__app.get().underlay"); print(u)
    print('width ft', u['w']*u['scale']/12, 'expected 11in*48/12=44')
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(600); pg.keyboard.press('f'); pg.wait_for_timeout(400)
    pg.screenshot(path=str(OUT/'t30_pdf.png'))
    print(errs or 'no errors')
