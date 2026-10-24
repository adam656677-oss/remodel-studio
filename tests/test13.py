import sys as _s; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width':1400,'height':860}); errs=[]
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
    pg.goto('http://app.local/'); pg.wait_for_timeout(1000)
    pg.get_by_role('button', name='3D', exact=True).click(); pg.wait_for_timeout(800)
    pg.get_by_role('button', name='Walk through').click(); pg.wait_for_timeout(600)
    pg.screenshot(path=str(OUT/'walk1.png'))
    pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(900); pg.keyboard.up('ArrowLeft')
    pg.keyboard.down('w'); pg.wait_for_timeout(2500); pg.keyboard.up('w'); pg.wait_for_timeout(300)
    print('pos', pg.evaluate('JSON.stringify(window.__view3d.walk.pos)'), 'tool', pg.locator('.tool.on').inner_text())
    pg.screenshot(path=str(OUT/'walk2.png'))
    pg.get_by_role('button', name='Views').click(); pg.fill('input[aria-label="View name"]','Living from kitchen'); pg.get_by_role('button',name='Save view').click(); pg.wait_for_timeout(300)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
    pg.select_option('select[aria-label="Section cut"]','h'); pg.wait_for_timeout(300)
    pg.locator('.v3range').fill('0.35'); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'walk3.png'))
    print('views', pg.evaluate("JSON.parse(localStorage.getItem('remodel-studio:project')).views.length"))
    print(errs or 'no errors'); b.close()
