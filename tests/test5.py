import sys as _s; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
MAP['jspdf.umd.min.js']=D/'jspdf/dist/jspdf.umd.min.js'
w=int(_a[1]) if len(_a)>1 else 1400; h=int(_a[2]) if len(_a)>2 else 860
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width':w,'height':h})
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_FAILED' not in m.text else None)
    def route(r):
        u=r.request.url
        for k,f in MAP.items():
            if u.endswith(k): return r.fulfill(path=str(f), content_type='application/javascript')
        if 'fonts.g' in u: return r.abort()
        if u.startswith('http://app.local'): return r.fulfill(body=page_html, content_type='text/html')
        return r.continue_()
    pg.route('**/*', route)
    pg.goto('http://app.local/'); pg.wait_for_timeout(900)
    pg.screenshot(path=str(OUT/f'chk_start_{w}.png'))
    pg.locator('.checkbtn').click(); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/f'chk_panel_{w}.png'))
    pg.locator('.issue').first.click(); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/f'chk_goto_{w}.png'))
    print(errs or 'no errors')
    b.close()
