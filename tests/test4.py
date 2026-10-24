import sys as _s; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width':390,'height':800}, color_scheme='dark')
    pg.add_init_script("try{if(!sessionStorage.getItem('rs-t-mode')){localStorage.setItem('remodel-studio:mode','split');sessionStorage.setItem('rs-t-mode','1')}}catch(e){}")
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    def route(r):
        u=r.request.url
        for k,f in MAP.items():
            if u.endswith(k): return r.fulfill(path=str(f), content_type='application/javascript')
        if 'fonts.g' in u: return r.abort()
        if u.startswith('http://app.local'): return r.fulfill(body=page_html, content_type='text/html')
        return r.continue_()
    pg.route('**/*', route)
    pg.goto('http://app.local/'); pg.wait_for_timeout(800)
    pg.get_by_role('button', name='Sheets', exact=True).click(); pg.wait_for_timeout(500)
    pg.select_option('#sheet-pick', '1'); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/'sheets_mobile.png')); print(errs or 'ok')
    b.close()
