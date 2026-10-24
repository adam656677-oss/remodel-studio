import sys as _s; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
MAP['jspdf.umd.min.js']=D/'jspdf/dist/jspdf.umd.min.js'
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
    pg.goto('http://app.local/'); pg.wait_for_timeout(1000)
    pg.locator('#lib-btn').click(); pg.wait_for_timeout(400)
    pg.screenshot(path=str(OUT/'lib1.png'))
    # place french door
    pg.fill('#lib-q','french 60'); pg.wait_for_timeout(300)
    pg.locator('.libitem').first.get_by_role('button',name='Place on a wall').click(); pg.wait_for_timeout(300)
    svg=pg.locator('svg.plan'); bb=svg.bounding_box()
    # click on top wall of living: find via world->screen: use evaluate? approximate click near top wall center-left
    walls=pg.evaluate("JSON.parse(localStorage.getItem('remodel-studio:project')).walls.length")
    pg.mouse.move(190,329); pg.mouse.click(190,329); pg.wait_for_timeout(300)
    pr=lambda: pg.evaluate("JSON.parse(localStorage.getItem('remodel-studio:project'))")
    pg.wait_for_timeout(500); q=pr(); print('openings', len(q['openings']), [o.get('name') for o in q['openings'] if o.get('lib')])
    pg.screenshot(path=str(OUT/'dbg1.png'))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'dbg2.png'))
    # cabinet: wall cabinet 30x30 place on kitchen wall
    pg.fill('#lib-q','wall cabinet 30" x 30"'); pg.wait_for_timeout(300)
    pg.locator('.libitem').first.get_by_role('button',name='Place').click(); pg.wait_for_timeout(200)
    pg.mouse.move(270,592); pg.mouse.click(270,592); pg.wait_for_timeout(400)
    pg.keyboard.press('Escape'); pg.keyboard.press('Escape')
    # select living room and apply color + crown
    pg.mouse.click(230,370); pg.wait_for_timeout(300)
    pg.fill('#lib-q','sage'); pg.wait_for_timeout(300)
    pg.locator('.libitem').first.get_by_role('button',name='Room walls').click(); pg.wait_for_timeout(300)
    pg.fill('#lib-q','colonial crown 4-5/8'); pg.wait_for_timeout(300)
    pg.locator('.libitem').first.get_by_role('button',name='Whole house').click(); pg.wait_for_timeout(300)
    pg.fill('#lib-q','hardwood'); pg.wait_for_timeout(300)
    pg.locator('.libitem').first.get_by_role('button',name='Selected room').click(); pg.wait_for_timeout(300)
    pg.fill('#lib-q','navy'); pg.wait_for_timeout(300)
    pg.locator('.libitem').first.get_by_role('button',name='House siding').click(); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'lib3.png'))
    pg.get_by_role('button', name='3D', exact=True).click(); pg.wait_for_timeout(1500); pg.screenshot(path=str(OUT/'lib4.png')); pg.get_by_role('button',name='Show roof').click(); pg.wait_for_timeout(800); pg.screenshot(path=str(OUT/'lib5.png'))
    pg.get_by_role('button', name='Materials', exact=True).click(); pg.wait_for_timeout(800)
    t=pg.locator('.matview').inner_text(); import re
    for cat in ['Trim and molding','Paint','Doors and windows','Fixtures and cabinets','Flooring']:
        i=t.lower().find(cat.lower()); print('==',t[i:i+600].replace('\n',' | ')[:600])
    pg.get_by_role('button', name='Sheets', exact=True).click(); pg.wait_for_timeout(800)
    with pg.expect_download(timeout=30000) as dl:
        pg.get_by_role('button', name='Download PDF', exact=False).click()
    dl.value.save_as(str(OUT/'lib.pdf'))
    print(errs or 'no errors'); b.close()
