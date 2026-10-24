import sys as _s,json,zipfile,struct; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
for n in ['GLTFExporter.js','USDZExporter.js','STLExporter.js','OBJExporter.js']: MAP['exporters/'+n]=D/'three/examples/js/exporters'/n
MAP['fflate@0.7.4/umd/index.js']=D/'fflate/umd/index.js'
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
    pg.goto('http://app.local/'); pg.wait_for_timeout(1000)
    pg.get_by_role('button', name='AR / Export').click(); pg.wait_for_timeout(300)
    for fmt in ['STL for 3D printing','OBJ']:
        with pg.expect_download(timeout=60000) as dl: pg.get_by_role('button',name=fmt).click()
        path=OUT/('x_'+fmt[:3]+'.zip'); dl.value.save_as(str(path)); z=zipfile.ZipFile(path); print(z.namelist())
        for nm in z.namelist():
            if nm.endswith('.stl'):
                d=z.read(nm); n=struct.unpack('<I',d[80:84])[0]; xs=[];
                for i in range(0,n,max(1,n//2000)):
                    off=84+i*50; v=struct.unpack('<12f',d[off:off+48]); xs+= [v[3:6],v[6:9],v[9:12]]
                import numpy as np; a=np.array(xs); print('tris',n,'bbox mm',a.min(0).round(1),a.max(0).round(1))
    print(errs or 'no errors'); b.close()
