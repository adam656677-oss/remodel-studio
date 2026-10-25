import pathlib
from playwright.sync_api import sync_playwright
OUT=pathlib.Path('shots'); html=pathlib.Path('/home/claude/remodel-studio/github/Remodel Studio offline.html').read_text()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_context(viewport={'width':1400,'height':900},accept_downloads=True).new_page(); errs=[]; reqs=[]
    pg.add_init_script("try{if(!sessionStorage.getItem('rs-t-mode')){localStorage.setItem('remodel-studio:mode','split');sessionStorage.setItem('rs-t-mode','1')}}catch(e){}")
    pg.on('pageerror', lambda e: errs.append(str(e)))
    def route(r):
        u=r.request.url
        if u.startswith('http://app.local'): return r.fulfill(body=html, content_type='text/html')
        reqs.append(u); return r.abort()
    pg.route('**/*', route)
    pg.goto('http://app.local/'); pg.wait_for_timeout(1500)
    print('rendered:', pg.locator('.brand').count())
    pg.evaluate("()=>window.__app.setMode('sheets')"); pg.wait_for_timeout(500)
    pg.get_by_role('tab', name='Plan set').click()
    with pg.expect_download(timeout=60000) as dl: pg.get_by_role('button', name='Download PDF', exact=False).click()
    print('pdf', dl.value.suggested_filename)
    pg.evaluate("()=>window.__app.setMode('split')"); pg.wait_for_timeout(500)
    pg.get_by_role('button', name='AR / Export').click()
    with pg.expect_download(timeout=60000) as dl: pg.get_by_role('button',name='STL for 3D printing').click()
    print('stl', dl.value.suggested_filename)
    print('blocked requests:', [u for u in reqs if 'fonts' not in u])
    print(errs or 'no errors'); b.close()
