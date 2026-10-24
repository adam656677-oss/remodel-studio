import sys as _s; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for (w,h,name) in [(390,844,'phone'),(1280,800,'laptop')]:
        pg = b.new_page(viewport={'width':w,'height':h}); errs=[]
        pg.add_init_script("try{if(!sessionStorage.getItem('rs-t-mode')){localStorage.setItem('remodel-studio:mode','split');sessionStorage.setItem('rs-t-mode','1')}}catch(e){}")
        pg.on('pageerror', lambda e: errs.append(str(e)))
        def route(r):
            u=r.request.url
            for k,f in MAP.items():
                if u.endswith(k): return r.fulfill(path=str(f), content_type='application/javascript')
            if 'fonts.g' in u: return r.abort()
            if u.startswith('http://app.local'): return r.fulfill(body=page_html, content_type='text/html')
            return r.continue_()
        pg.route('**/*', route)
        pg.goto('http://app.local/'); pg.wait_for_timeout(1000)
        pg.locator('#lib-btn').click(); pg.wait_for_timeout(400)
        pg.screenshot(path=str(OUT/f'lay_{name}.png'))
        print(name, pg.evaluate('document.documentElement.scrollWidth'), errs or 'ok')
    b.close()
