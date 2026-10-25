import sys as _s; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    ctx = b.new_context(viewport={'width':1400,'height':860}, accept_downloads=True)
    pg = ctx.new_page(); errs=[]
    pg.add_init_script("try{if(!sessionStorage.getItem('rs-t-mode')){localStorage.setItem('remodel-studio:mode','split');sessionStorage.setItem('rs-t-mode','1')}}catch(e){}")
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_FAILED' not in m.text else None)
    def route(r):
        u=r.request.url
        for k,f in MAP.items():
            if u.endswith(k): return r.fulfill(path=str(f), content_type='application/javascript')
        if 'fonts.g' in u: return r.abort()
        if u.startswith('http://app.local'): return r.fulfill(body=page_html, content_type='text/html')
        return r.continue_()
    pg.route('**/*', route)
    pg.goto('http://app.local/'); pg.wait_for_timeout(900)
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(300)
    n0=len(pg.evaluate("JSON.parse(localStorage.getItem('remodel-studio:project')).walls"))
    pg.keyboard.press('w'); pg.wait_for_timeout(100)
    # choose wall type (focus select) then draw
    pg.select_option('#wall-preset','int4')
    svg=pg.locator('svg.plan'); bb=svg.bounding_box()
    x,y=bb['x']+bb['width']*0.15, bb['y']+bb['height']*0.15
    pg.mouse.click(x,y); pg.mouse.move(x+120,y); pg.mouse.click(x+120,y); pg.mouse.move(x+120,y+80); pg.mouse.click(x+120,y+80)
    pg.select_option('#wall-preset','int6')  # focus back in select mid-run
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    pg.mouse.move(x+200,y+200); pg.wait_for_timeout(200)
    print('draft after esc:', pg.locator('.draft-fill').count(), 'tool on:', pg.locator('.tool.on').inner_text())
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    print('tool after 2nd esc:', pg.locator('.tool.on').inner_text())
    pg.wait_for_timeout(500)
    n1=len(pg.evaluate("JSON.parse(localStorage.getItem('remodel-studio:project')).walls")); print('walls',n0,'->',n1)
    # select a fixture and copy/paste/rotate
    pg.locator('#menu-file').click(); pg.wait_for_timeout(200); pg.screenshot(path=str(OUT/'menu_file.png'))
    pg.get_by_role('menuitem', name='Save', exact=False).first.click(); pg.wait_for_timeout(300)
    print('toast:', pg.locator('.toast').inner_text())
    pg.keyboard.press('Control+o'); pg.wait_for_timeout(300); print(pg.locator('.openlist').inner_text()[:200]); pg.get_by_role('button',name='Cancel').click()
    pg.locator('#menu-edit').click(); pg.wait_for_timeout(200); pg.screenshot(path=str(OUT/'menu_edit.png')); pg.keyboard.press('Escape')
    # click a wall to select then ctrl+c ctrl+v
    pg.keyboard.press('v')
    pg.mouse.click(x+60,y); pg.wait_for_timeout(200)
    pg.keyboard.press('Control+c'); pg.keyboard.press('Control+v'); pg.wait_for_timeout(500)
    n2=len(pg.evaluate("JSON.parse(localStorage.getItem('remodel-studio:project')).walls")); print('after paste',n2)
    print('dirty dot:', pg.locator('.dirty').count())
    pg.keyboard.press('Control+s'); pg.wait_for_timeout(300); print('dirty after save:', pg.locator('.dirty').count())
    print(errs or 'no errors'); b.close()
