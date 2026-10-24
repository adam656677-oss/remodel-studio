import sys as _s,json; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
for n in ['GLTFExporter.js','USDZExporter.js','STLExporter.js','OBJExporter.js']: MAP['exporters/'+n]=D/'three/examples/js/exporters'/n
MAP['fflate@0.7.4/umd/index.js']=D/'fflate/umd/index.js'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg = b.new_context(viewport={'width':1400,'height':900},accept_downloads=True).new_page()
    def route(r):
        u=r.request.url
        for k,f in MAP.items():
            if u.endswith(k): return r.fulfill(path=str(f), content_type='application/javascript')
        if 'fonts.g' in u: return r.abort()
        if u.startswith('http://app.local'): return r.fulfill(body=page_html, content_type='text/html')
        return r.continue_()
    pg.route('**/*', route)
    pg.goto('http://app.local/'); pg.wait_for_timeout(1000)
    pg.get_by_role('button', name='AR / Export').click(); pg.wait_for_timeout(300)
    pg.get_by_role('button',name='Open Render').click()
    pg.wait_for_function("()=>{const b=[...document.querySelectorAll('.rs-side button')].find(b=>b.textContent==='Render');return b&&!b.disabled}",timeout=60000)
    print('render views', pg.evaluate("()=>document.querySelector('#rs-cam').options.length")); b.close()
