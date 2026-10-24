import sys as _s,json; _a=_s.argv; _s.argv=[_a[0]]; exec(open("test.py").read().split("with sync_playwright() as p:")[0]); _s.argv=_a
J=json.load(open('wall.json'))
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    ctx = b.new_context(viewport={'width':1400,'height':900}); pg = ctx.new_page(); pg.add_init_script("try{if(!sessionStorage.getItem('rs-t-mode')){localStorage.setItem('remodel-studio:mode','split');sessionStorage.setItem('rs-t-mode','1')}}catch(e){}"); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_FAILED' not in m.text else None)
    def route(r):
        u=r.request.url
        for k,f in MAP.items():
            if u.endswith(k): return r.fulfill(path=str(f), content_type='application/javascript')
        if 'fonts.g' in u: return r.abort()
        if u.startswith('http://app.local'): return r.fulfill(body=page_html, content_type='text/html')
        return r.continue_()
    pg.route('**/*', route)
    pg.add_init_script('''window.claude={use:async(n)=>{if(n!=='sample')return null;const f=async()=>({text:'ok'});f.limits=async()=>({images:{maxCount:4}});
      f.json=async(prompt,opts)=>{await new Promise(r=>setTimeout(r,200));return {summary:'Living room wall with a 6-panel door and a double-hung window.',inside:true,trim:{base:'t-base-1',casing:'t-casing-11',crown:null,chair:null,wainscot:null},door:{style:'panel6',type:'swing'},window:{operation:'double-hung',grilles:false},ceiling:null,wallFinish:'paint',floor:'hardwood',siding:null,roofing:null,colors:{walls:'#b2b9a0',trim:'#f7f7f3',door:'#8a5a35'},confidence:{trim:'medium',finishes:'high'},notes:['Baseboard looks about 3-1/4 in tall']};};return f;}};''')
    pg.goto('http://app.local/'); pg.wait_for_timeout(1000)
    pg.get_by_role('button', name='Capture', exact=True).click(); pg.wait_for_timeout(400)
    pg.set_input_files('#pm-add','wall.jpg'); pg.wait_for_timeout(1500)
    svg=pg.locator('.pmsvg'); bb=svg.bounding_box(); print('svg',bb)
    S=lambda q:(bb['x']+q[0]/1600*bb['width'], bb['y']+q[1]/1100*bb['height'])
    pg.select_option('#pm-pre','0'); pg.wait_for_timeout(300)
    for q in J['door']:
        x,y=S(q); pg.mouse.move(x,y); pg.mouse.click(x,y); pg.wait_for_timeout(150)
    pg.wait_for_timeout(400)
    pg.get_by_role('tab',name='2 · Measure').click(); pg.wait_for_timeout(200)
    w=J['win']
    for a,c in [(w[0],w[1]),(w[1],w[2]),(J['base'][0],J['base'][1])]:
        for q in (a,c):
            x,y=S(q); pg.mouse.move(x,y); pg.mouse.click(x,y); pg.wait_for_timeout(150)
    pg.wait_for_timeout(500)
    print('measurements:', pg.locator('.pmv').all_inner_texts())
    pg.screenshot(path=str(OUT/'pm1.png'))
    pg.get_by_role('tab',name='Pick color').click(); x,y=S(J['wall']); pg.mouse.click(x,y); pg.wait_for_timeout(300)
    print('raw color:', pg.locator('.pmcolor').inner_text().replace('\n',' '))
    pg.get_by_role('button',name='Correct lighting: click a white object').click(); x,y=S(J['trimwhite']); pg.mouse.click(x,y); pg.wait_for_timeout(300); print('after white:', pg.locator('.pmside').inner_text()[:300].replace('\n',' | '))
    x,y=S(J['wall']); pg.mouse.click(x,y); pg.wait_for_timeout(300)
    print('corrected:', pg.locator('.pmcolor').inner_text().replace('\n',' '))
    pg.screenshot(path=str(OUT/'pm2.png'))
    pg.get_by_role('tab',name='Trim and finishes').click(); pg.get_by_role('button',name='Identify trim and finishes').click(); pg.wait_for_timeout(800)
    print(pg.locator('.pmside').inner_text()[:700].replace('\n',' | '))
    pg.screenshot(path=str(OUT/'pm3.png'))
    print(errs or 'no errors'); b.close()
