import sys as _s; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
MAP['jspdf.umd.min.js']=D/'jspdf/dist/jspdf.umd.min.js'
MAP['fflate@0.7.4/umd/index.js']=D/'fflate/umd/index.js'
import json, zipfile
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    ctx = b.new_context(viewport={'width':1400,'height':860}, accept_downloads=True)
    pg = ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_FAILED' not in m.text else None)
    def route(r):
        u=r.request.url
        for k,f in MAP.items():
            if u.endswith(k): return r.fulfill(path=str(f), content_type='application/javascript')
        if 'fonts.g' in u: return r.abort()
        if u.startswith('http://app.local'): return r.fulfill(body=page_html, content_type='text/html')
        return r.continue_()
    pg.route('**/*', route)
    pg.goto('http://app.local/'); pg.wait_for_timeout(800)
    pg.get_by_role('button', name='Plan', exact=True).first.click(); pg.wait_for_timeout(300)
    raw=pg.evaluate("localStorage.getItem('remodel-studio:project')")
    pr=json.loads(raw)
    pr['settings'].update({'code':'ibc','occupancy':'B','sprinklered':False})
    for r in pr['rooms']:
        r['use']={'Living':'assembly','Kitchen':'office','Bedroom 1':'office','Bedroom 2':'storage','Bath':'bath'}.get(r['name'],r['use'])
    pg.evaluate("s=>localStorage.setItem('remodel-studio:project',s)", json.dumps(pr)); pg.reload(); pg.wait_for_timeout(900)
    pg.locator('.checkbtn').click(); pg.wait_for_timeout(500)
    print(pg.locator('.insp').first.inner_text()[:2500])
    pg.locator('.checkbtn').click(); pg.wait_for_timeout(300)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    pg.screenshot(path=str(OUT/'ibc_app.png'))
    pg.get_by_role('button', name='Sheets', exact=True).click(); pg.wait_for_timeout(600)
    print([t for t in pg.locator('.sheetbtn').all_inner_texts()])
    with pg.expect_download(timeout=20000) as dl:
        pg.get_by_role('button', name='Download PDF', exact=False).click()
    dl.value.save_as(str(OUT/'ibc.pdf'))
    with pg.expect_download(timeout=20000) as dl:
        pg.get_by_role('button', name='Download DXF', exact=False).click()
    dl.value.save_as(str(OUT/'dxf.zip')); print(pg.locator('.msg').inner_text())
    z=zipfile.ZipFile(OUT/'dxf.zip'); print(z.namelist())
    open(OUT/'plan.dxf','wb').write(z.read([n for n in z.namelist() if n.endswith('.dxf')][0]))
    print(errs or 'no errors'); b.close()
