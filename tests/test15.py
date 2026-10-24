import sys as _s,json; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
MAP['jspdf.umd.min.js']=D/'jspdf/dist/jspdf.umd.min.js'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg = b.new_context(viewport={'width':1400,'height':900},accept_downloads=True).new_page(); errs=[]
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
    pr=json.loads(pg.evaluate("localStorage.getItem('remodel-studio:project')"))
    for w in pr['walls']: w['status']='existing'
    for o in pr['openings']: o['status']='existing'
    for w in pr['walls']:
        if w['id']=='wa': w['status']='demolish'
    pr['views']=[{'id':'v1','name':'Front yard','pos':[-15,12,50],'tgt':[20,4,14],'fov':45,'walk':None},{'id':'v2','name':'Kitchen','pos':[0,0,0],'walk':{'x':120,'y':260,'yaw':3.14,'pitch':0,'level':pr['levels'][0]['id']}}]
    pg.evaluate("s=>localStorage.setItem('remodel-studio:project',s)", json.dumps(pr)); pg.reload(); pg.wait_for_timeout(1000)
    pg.locator('#option-pick').select_option('__new'); pg.wait_for_timeout(300)
    pg.get_by_role('button', name='Sheets', exact=True).click(); pg.wait_for_timeout(400)
    pg.get_by_role('tab', name='Board presentation').click(); pg.wait_for_timeout(300)
    pg.fill('#pr-by','Adam, Public Works Director')
    pg.get_by_role('button',name='Preview the cover image').click(); pg.wait_for_timeout(3000)
    pg.screenshot(path=str(OUT/'pres1.png'))
    with pg.expect_download(timeout=120000) as dl: pg.get_by_role('button',name='Make presentation PDF').click()
    dl.value.save_as(str(OUT/'pres.pdf'))
    print(errs or 'no errors'); b.close()
