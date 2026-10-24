import sys as _s; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
MAP['jspdf.umd.min.js']=D/'jspdf/dist/jspdf.umd.min.js'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg = b.new_context(viewport={'width':1400,'height':900},accept_downloads=True).new_page(); errs=[]
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
    pg.locator('#option-pick').select_option('__new'); pg.wait_for_timeout(400)
    pg.get_by_role('button', name='Materials', exact=True).click(); pg.wait_for_timeout(500)
    # price a few things
    for inp,v in list(zip(pg.locator('.priceinp').all()[:6],['4.25','8.9','15.5','3.1','42','12'])): inp.fill(v)
    pg.get_by_role('tab', name='Estimate and labor').click(); pg.wait_for_timeout(600)
    pg.fill('#est-permit','350'); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/'est1.png'),full_page=True)
    with pg.expect_download(timeout=30000) as dl: pg.get_by_role('button',name='Download estimate PDF').click()
    dl.value.save_as(str(OUT/'est.pdf'))
    print(pg.locator('.esttotal').inner_text())
    print(errs or 'no errors'); b.close()
