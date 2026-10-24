import sys as _s,json; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
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
    pg.get_by_role('button', name='Plan', exact=True).click(); pg.wait_for_timeout(500)
    def W(x,y):
        v=pg.evaluate("(()=>{const v=window.__planView.view;const r=window.__planView.svg.current.getBoundingClientRect();return [v.s,v.tx,v.ty,r.left,r.top]})()")
        return (v[3]+x*v[0]+v[1], v[4]+y*v[0]+v[2])
    pr=lambda: json.loads(pg.evaluate("localStorage.getItem('remodel-studio:project')"))
    # electrical auto place
    pg.locator('.tool',has_text='Electric').click(); pg.wait_for_timeout(200)
    pg.get_by_role('button',name='Auto-place this floor').click(); pg.wait_for_timeout(700)
    q=pr(); from collections import Counter; print('elec', Counter(d['type'] for d in q.get('elec',[])))
    pg.screenshot(path=str(OUT/'el1.png'))
    # ramp at front door (bottom wall y=336 near kitchen door at x ~ 60?)
    door=[o for o in q['openings'] if o['type']=='door']
    pg.keyboard.press('Escape'); pg.keyboard.press('g'); pg.wait_for_timeout(100)
    x,y=W(150,338); pg.mouse.click(x,y); pg.wait_for_timeout(400)
    # shape: L shaped built-in in living
    pg.keyboard.press('Escape'); pg.keyboard.press('u')
    for (a,c) in [(40,40),(100,40),(100,64),(64,64),(64,100),(40,100)]:
        x,y=W(a,c); pg.mouse.click(x,y); pg.wait_for_timeout(80)
    pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    pg.keyboard.press('Escape'); pg.keyboard.press('Escape');pg.keyboard.press('l')
    for (a,c) in [(0,-30),(240,-30)]:
        x,y=W(a,c); pg.mouse.click(x,y); pg.wait_for_timeout(100)
    pg.keyboard.press('Escape'); pg.keyboard.press('t'); x,y=W(300,60); pg.mouse.click(x,y); pg.wait_for_timeout(300)
    pg.fill('#an-t','NEW 36" POCKET DOOR\nVERIFY HEADER'); pg.wait_for_timeout(200)
    pg.keyboard.press('Escape')
    q=pr(); print('ramps',len(q.get('ramps',[])),'shapes',len(q.get('shapes',[])),'dims',len(q.get('dims',[])),'annos',len(q.get('annos',[])))
    pg.screenshot(path=str(OUT/'el2.png'))
    pg.get_by_role('button', name='3D', exact=True).click(); pg.wait_for_timeout(1500); pg.screenshot(path=str(OUT/'el3.png'))
    pg.get_by_role('button', name='Check').first.click(); pg.wait_for_timeout(400); print(pg.locator('.insp').first.inner_text()[:900].replace('\n',' | '))
    pg.get_by_role('button', name='Sheets', exact=True).click(); pg.wait_for_timeout(500)
    pg.get_by_role('tab', name='Plan set').click(); pg.wait_for_timeout(300)
    with pg.expect_download(timeout=60000) as dl: pg.get_by_role('button', name='Download PDF', exact=False).click()
    dl.value.save_as(str(OUT/'el.pdf'))
    pg.get_by_role('button', name='Materials', exact=True).click(); pg.wait_for_timeout(500); pg.get_by_role('tab', name="Builder's list").click(); pg.wait_for_timeout(300)
    t=pg.locator('.matview').inner_text().lower(); i=t.find('electrical\nitem'); print(t[i:i+700].replace('\n',' | ')); i=t.find('ramps and site'); print(t[i:i+400].replace('\n',' | '))
    print(errs or 'no errors'); b.close()
