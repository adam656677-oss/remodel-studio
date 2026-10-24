# 2.0: drain/vent/duct sizing, riser diagram, wall framing and header schedule, lessons
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(500)
    r=pg.evaluate("""()=>{const p=window.__app.get();const D=drainSizing(p);const Dc=ductSizing(p);const w=p.walls[0];const F=wallFraming(p,w,headerMap(p));const cut=framingCutList(p,[w]);const hs=headerSchedule(p);
      return {rooms:D.rooms.map(r=>[r.room.name,r.dfu,r.size]),bd:D.building,ducts:Dc.rows.map(r=>[r.name,r.cfm,r.regs]),kinds:[...new Set(F.M.map(m=>m.kind))],cut:cut.length,hs:hs.map(h=>[h.mark,h.header,h.ok])};}""")
    print(json.dumps(r)[:900])
    assert len(r['rooms'])>=2 and all(x[1]>0 for x in r['rooms']) and r['bd'] in ('3"','4"')
    assert len(r['ducts'])>=4 and all(x[1]>0 and x[2]>=1 for x in r['ducts'])
    for k in ['plate','stud']: assert k in r['kinds'], r['kinds']
    assert r['cut']>3 and len(r['hs'])>=3 and all(h[2] for h in r['hs'])
    # wall framing dialog draws the elevation and the cut list
    pg.evaluate("()=>window.dispatchEvent(new CustomEvent('rs-dialog',{detail:'wallframe'}))"); pg.wait_for_timeout(800)
    assert pg.locator('.wf-svg').count()>=1 and pg.locator('.modal table.mat tr').count()>3
    pg.screenshot(path=str(OUT/'t72_wf.png')); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    if pg.locator('.modal-bg').count(): pg.locator('.modal-bg .btn:has-text("Done"), .modal-bg .btn:has-text("Close")').first.click(); pg.wait_for_timeout(200)
    # systems: plumbing tab shows the riser diagram, loads tab the duct table
    pg.evaluate("()=>window.__app.setMode('systems')"); pg.wait_for_timeout(600); pg.get_by_role('tab',name='Plumbing').click(); pg.wait_for_timeout(500)
    assert pg.locator('.rs-svg').count()>=1
    pg.evaluate("()=>window.__app.setMode('design')"); pg.wait_for_timeout(600)
    # lessons: start the one-wall kitchen, panel shows steps, progress moves after a template
    pg.evaluate("()=>window.dispatchEvent(new CustomEvent('rs-dialog',{detail:'lessons'}))"); pg.wait_for_timeout(600)
    assert pg.locator('.lesson-card').count()>=4
    pg.locator('.lesson-card').nth(0).locator('button').first.click(); pg.wait_for_timeout(1500)
    if pg.get_by_role('button',name='Discard').count(): pg.get_by_role('button',name='Discard').first.click(); pg.wait_for_timeout(1000)
    assert pg.locator('aside.lesson').count()==1
    before=pg.locator('aside.lesson .pill').inner_text()
    pg.evaluate("()=>{let p=window.__app.get();p=layoutTemplate(p,p.rooms[0],'one').p;p=underCabLights(p,p.levels[0].id).p;window.__app.commit(p);}"); pg.wait_for_timeout(800)
    after=pg.locator('aside.lesson .pill').inner_text(); print('lesson',before,'->',after)
    assert int(after.split('/')[0])>int(before.split('/')[0])
    pg.screenshot(path=str(OUT/'t72_lesson.png'))
    assert not errs, errs
print('PASS test72')
