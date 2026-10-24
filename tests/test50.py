# doors and items: pictures, handing picker, hardware, customize-before-place, My items
from h import *
with app(1500,1000) as (pg,errs):
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(300)
    did=pg.evaluate("()=>{const p=window.__app.get();const o=p.openings.find(o=>o.type==='door'&&p.walls.find(w=>w.id===o.wall).kind==='exterior');window.__app.setSel({kind:'opening',id:o.id});return o.id}")
    pg.wait_for_selector('.pic-pane img',timeout=30000)
    pg.locator('.htbtn',has_text='LH outswing').click(); pg.wait_for_timeout(300)
    o=pg.evaluate("id=>{const p=window.__app.get();const o=p.openings.find(x=>x.id===id);return [o.hinge,o.swing,doorHanding(p,o).both]}",did); print('after LH outswing',o)
    assert 'LH outswing' in o[2] and 'LHR' in o[2]
    pg.locator('.stylebtn',has_text='Half-lite glass').click(); pg.wait_for_timeout(200)
    pg.select_option('#o-hwt','knob'); pg.wait_for_timeout(200)
    pg.locator('.finsw',has_text='Matte black').click(); pg.wait_for_timeout(200)
    pg.locator('label.check',has_text='Kick plate').locator('input').check(); pg.wait_for_timeout(200)
    o=pg.evaluate("id=>{const p=window.__app.get();const o=p.openings.find(x=>x.id===id);return {style:o.style,hw:o.hw,door:o.door,hinges:o.hinges,iss:runChecks(p).filter(i=>i.target&&i.target.id===id).map(i=>i.title)}}",did); print(o)
    assert o['style']=='halflite' and o['hw']['type']=='knob' and o['hw']['finish']=='matte-black' and o['door']['kick']
    assert any('knob' in t for t in o['iss'])
    rows=pg.evaluate("()=>takeoff(window.__app.get(),{waste:0}).filter(r=>r.cat==='Door hardware').map(r=>r.qty+' '+r.item)"); print(rows)
    assert any('Kick plate' in r for r in rows) and any('matte black' in r for r in rows)
    # interior bath door: privacy default and garage rule
    # customize from the library and place
    pg.locator('button',has_text='Library').first.click(); pg.wait_for_timeout(800)
    pg.locator('.libcats button',has_text='Doors').first.click(); pg.wait_for_timeout(300)
    pg.wait_for_timeout(3000);n=pg.evaluate("()=>document.querySelectorAll('.liblist img').length"); print('library pictures',n)
    pg.locator('.libitem',has_text='6-panel interior door 32').locator('button',has_text='Customize').click(); pg.wait_for_selector('.custmodal')
    pg.select_option('.custmodal #o-hwt','lever'); pg.locator('.custmodal .finsw',has_text='Oil-rubbed bronze').click()
    pg.locator('.custmodal input[aria-label="Item name"]').fill('Hall door ORB')
    pg.locator('.custmodal button',has_text='Save to My items').click(); pg.wait_for_timeout(200)
    print(pg.evaluate("()=>document.querySelector('.custmodal .msg')?.textContent"))
    pg.locator('.custmodal button',has_text='Place on a wall').click(); pg.wait_for_timeout(300)
    n0=pg.evaluate("()=>window.__app.get().openings.length")
    pg.evaluate("()=>window.__app.setLevelId(window.__app.get().levels[0].id)")
    sx,sy=w2s(pg,400,6); pg.mouse.move(sx-20,sy); pg.wait_for_timeout(100); pg.mouse.move(sx,sy); pg.wait_for_timeout(300); pg.mouse.click(sx,sy); pg.wait_for_timeout(400)
    print('tool preset',pg.evaluate("()=>document.querySelector('.hint')?.textContent?.slice(0,120)"))
    o=pg.evaluate("()=>{const p=window.__app.get();const o=p.openings.find(o=>String(o.lib||'').startsWith('tmp-'))||{};return {n:p.openings.length,name:o.name,hw:o.hw,libs:p.openings.map(o=>o.lib||o.type)}}"); print(o)
    assert o['n']==n0+1 and o['hw'] and o['hw']['finish']=='orb' and o['name']=='Hall door ORB'
    print('my items', pg.evaluate("()=>LIB.filter(x=>x.cat==='My items').map(x=>x.label)"))
    # fixture hand
    pg.get_by_role('button',name='Close library').click(); pg.wait_for_timeout(300)
    fid=pg.evaluate("()=>{const p=window.__app.get();const f=p.fixtures.find(f=>f.type==='tub');window.__app.setSel({kind:'fixture',id:f.id});return f.id}")
    pg.wait_for_timeout(500); pg.locator('.seg button',has_text='Drain on the left').click(); pg.wait_for_timeout(200)
    print('tub hand',pg.evaluate("id=>window.__app.get().fixtures.find(f=>f.id===id).hand",fid))
    print(errs or 'no errors')
