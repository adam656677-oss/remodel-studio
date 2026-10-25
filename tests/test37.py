from h import *
def scr(pg,x,y,z):
    return pg.evaluate("([x,y,z])=>{const st=window.__view3d;const v=new THREE.Vector3(x*IN,z*IN,y*IN).project(st.camera);const r=st.renderer.domElement.getBoundingClientRect();return [r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]}",[x,y,z])
with app(1400,1000) as (pg,errs):
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1800)
    # click a wall to select it
    x,y=scr(pg,240,340,48); pg.mouse.click(x,y); pg.wait_for_timeout(500)
    print('selected',pg.locator('.insp h2, .insp .kind, aside h2').first.inner_text() if pg.locator('aside h2').count() else pg.evaluate("()=>document.querySelector('.inspector, aside')?.innerText.slice(0,60)"))
    pg.get_by_role('button',name='Paint').click(); pg.wait_for_timeout(300)
    pg.mouse.click(x,y); pg.wait_for_timeout(500); print(pg.locator('.paintcard').inner_text()[:80])
    pg.locator('.paintcard .sw[title="Navy"]').click(); pg.wait_for_timeout(800)
    print('ext colors',pg.evaluate("()=>[...new Set(window.__app.get().walls.filter(w=>w.kind==='exterior').map(w=>w.color))]"))
    pg.locator('.paintcard').get_by_label('Close').click()
    zr=pg.evaluate("()=>{const p=window.__app.get();const r=p.roofs[0];return roofHeightAt(roofBuild(r,roofTop(p,r)),240,60)}");x2,y2=scr(pg,240,60,zr); pg.mouse.click(x2,y2); pg.wait_for_timeout(500); print(pg.locator('.paintcard').inner_text()[:60])
    pg.select_option('#pc-rc','metal'); pg.locator('.paintcard .sw[title="Hunter green"]').click(); pg.wait_for_timeout(800)
    print('roof',pg.evaluate("()=>window.__app.get().roofs.map(r=>[rafterOf(r).cover,r.color])"))
    pg.screenshot(path=str(OUT/'t37_paint.png'))
    print(errs or 'no errors')
