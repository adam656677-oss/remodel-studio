import sys as _s,json; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width':1400,'height':900}); errs=[]
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
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(400)
    pr=lambda: json.loads(pg.evaluate("localStorage.getItem('remodel-studio:project')"))
    def W(x,y):
        v=pg.evaluate("(()=>{const v=window.__planView.view;const r=window.__planView.svg.current.getBoundingClientRect();return [v.s,v.tx,v.ty,r.left,r.top]})()")
        return (v[3]+x*v[0]+v[1], v[4]+y*v[0]+v[2])
    q=pr(); orig={r['name']:r['pts'] for r in q['rooms']}; print('orig bedroom1', orig.get('Bedroom 1'), 'bath', orig.get('Bath'))
    pg.evaluate("s=>localStorage.setItem('remodel-studio:project',s)", json.dumps({**q,'rooms':[]})); pg.reload(); pg.wait_for_timeout(900)
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(300)
    pg.keyboard.press('r')
    for (x,y) in [(360,80),(420,210),(120,80),(300,300)]:
        sx,sy=W(x,y); pg.mouse.move(sx,sy); pg.mouse.click(sx,sy); pg.wait_for_timeout(250); pg.keyboard.press('Escape'); pg.keyboard.press('r')
    pg.wait_for_timeout(400); q=pr()
    for r in q['rooms']: print(r['name'], r['pts'])
    pg.keyboard.press('Escape'); pg.keyboard.press('Escape')
    # box select living area items and nudge
    a=W(-70,-70); c=W(250,400)
    pg.keyboard.down('Shift'); pg.mouse.move(*a); pg.mouse.down(); pg.mouse.move(*c,steps=5); pg.mouse.up(); pg.keyboard.up('Shift'); pg.wait_for_timeout(300)
    print(pg.locator('.insp').first.inner_text()[:200].replace('\n',' | '))
    pg.screenshot(path=str(OUT/'ms1.png'))
    pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(300); pg.keyboard.press('Control+z'); pg.wait_for_timeout(200)
    print(errs or 'no errors'); b.close()
