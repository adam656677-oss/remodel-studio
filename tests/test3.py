import sys as _s; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
MAP['jspdf.umd.min.js']=D/'jspdf/dist/jspdf.umd.min.js'
import sys
paper = sys.argv[1] if len(sys.argv)>1 else 'tabloid'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width':1400,'height':860}, accept_downloads=True)
    pg = ctx.new_page()
    pg.add_init_script("try{if(!sessionStorage.getItem('rs-t-mode')){localStorage.setItem('remodel-studio:mode','split');sessionStorage.setItem('rs-t-mode','1')}}catch(e){}")
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_FAILED' not in m.text else None)
    def route(r):
        u=r.request.url
        for k,f in MAP.items():
            if u.endswith(k): return r.fulfill(path=str(f), content_type='application/javascript')
        if 'fonts.g' in u: return r.abort()
        if u.startswith('http://app.local'): return r.fulfill(body=page_html, content_type='text/html')
        return r.continue_()
    pg.route('**/*', route)
    pg.goto('http://app.local/'); pg.wait_for_timeout(800)
    if len(sys.argv)>2:
        pg.get_by_role('button', name='Copy exterior walls up').click(); pg.wait_for_timeout(300)
        pg.get_by_role('button', name='Roof this level').click(); pg.wait_for_timeout(200)
        pg.select_option('#f-st', 'hip'); pg.wait_for_timeout(200)
    pg.get_by_role('button', name='Sheets', exact=True).click(); pg.wait_for_timeout(500)
    pg.select_option('#sh-paper', paper); pg.wait_for_timeout(300)
    pg.fill('#sh-addr','123 Oak St, Forest, MS'); pg.locator('#sh-addr').blur(); pg.fill('#sh-client','Friend'); pg.locator('#sh-client').blur(); pg.wait_for_timeout(200)
    btns = pg.locator('.sheetbtn')
    for i in range(btns.count()):
        btns.nth(i).click(); pg.wait_for_timeout(250)
        pg.locator('.paper').screenshot(path=str(OUT/f'sheet_{paper}_{i}.png'))
    with pg.expect_download(timeout=20000) as dl:
        pg.get_by_role('button', name='Download PDF', exact=False).click()
    d=dl.value; d.save_as(str(OUT/f'plans_{paper}.pdf')); print('pdf saved', d.suggested_filename)
    print(pg.locator('.msg').inner_text())
    print(errs or 'no errors')
    b.close()
