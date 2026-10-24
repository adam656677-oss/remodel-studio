import sys as _s; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
MAP['jspdf.umd.min.js']=D/'jspdf/dist/jspdf.umd.min.js'
MAP['fflate@0.7.4/umd/index.js']=D/'fflate/umd/index.js'
MAP['GLTFExporter.js']=D/'three/examples/js/exporters/GLTFExporter.js'
MAP['USDZExporter.js']=D/'three/examples/js/exporters/USDZExporter.js'
w=int(_a[1]) if len(_a)>1 else 1400; h=int(_a[2]) if len(_a)>2 else 860
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    ctx=b.new_context(viewport={'width':w,'height':h},accept_downloads=True); pg=ctx.new_page()
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type in ('error','warning') and 'ERR_FAILED' not in m.text else None)
    def route(r):
        u=r.request.url
        for k,f in MAP.items():
            if u.endswith(k): return r.fulfill(path=str(f), content_type='application/javascript')
        if 'fonts.g' in u: return r.abort()
        if u.startswith('http://app.local'): return r.fulfill(body=page_html, content_type='text/html')
        return r.continue_()
    pg.route('**/*', route)
    if 'MOCK' in __import__('os').environ:
        pg.add_init_script('''window.claude={use:async(n)=>{if(n!=='sample')return null;const f=async()=>({text:'ok'});f.limits=async()=>({maxPromptBytes:262144,images:{maxCount:4,maxInputBytes:2e7,mediaTypes:['image/png','image/jpeg']}});
          f.json=async(prompt,opts)=>{window.__lastPrompt=prompt;window.__imgs=opts.images.length;await new Promise(r=>setTimeout(r,200));return prompt.includes('inside')?{roomName:'Guest bedroom',use:'bedroom',summary:'A bedroom with one window on the back wall and a door on the left.',walls:[{side:'back',exterior:true},{side:'left',exterior:false}],openings:[{side:'back',type:'window',label:'centered window',operation:'double-hung'},{side:'left',type:'door',label:'entry door'}],notes:['Crack above the window header']}:{summary:'Front of the house',openings:[{type:'window',label:'left window'},{type:'door',label:'front door'}],notes:[]};};return f;}};''')
    pg.goto('http://app.local/'); pg.wait_for_timeout(900)
    steps=_a[3].split(',') if len(_a)>3 else []
    for st in steps:
        kind,_,arg=st.partition(':')
        if kind=='click': pg.locator(arg).first.click()
        elif kind=='role': pg.get_by_role('button', name=arg, exact=True).first.click()
        elif kind=='text': pg.get_by_text(arg, exact=False).first.click()
        elif kind=='shot': pg.screenshot(path=str(OUT/(arg+'.png')))
        elif kind=='sel':
            sid,val=arg.split('='); pg.select_option(sid,val)
        elif kind=='key': pg.keyboard.press(arg)
        elif kind=='dl':
            btn,fname=arg.split('>')
            with pg.expect_download(timeout=60000) as d: pg.get_by_role('button', name=btn, exact=False).first.click()
            d.value.save_as(str(OUT/fname)); print('saved',fname)
        elif kind=='fill':
            sid,val=arg.split('='); pg.fill(sid,val); pg.locator(sid).blur()
        elif kind=='file':
            sid,val=arg.split('='); pg.set_input_files(sid,val)
        elif kind=='wait': pg.wait_for_timeout(int(arg))
        elif kind=='msg': print('MSG:', pg.locator('.msg').first.inner_text())
        elif kind=='el':
            bb=pg.locator(arg).first.bounding_box(); pg.mouse.click(bb['x']+bb['width']/2, bb['y']+bb['height']*0.3)
        elif kind=='plan':
            x,y=arg.split('/'); bb=pg.locator('svg.plan').bounding_box(); pg.mouse.click(bb['x']+bb['width']*float(x), bb['y']+bb['height']*float(y))
        pg.wait_for_timeout(350)
    print(errs or 'no errors')
    b.close()
