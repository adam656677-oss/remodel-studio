# 2.1: interactive schedules — edits flow into the model; hardware totals; CSV
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(500)
    pg.click('.wf-tab:has-text("Documents")'); pg.wait_for_timeout(400); pg.click('.wf-pages button:has-text("Schedules")'); pg.wait_for_timeout(800)
    pg.click('.schedview .mattabs button:has-text("Doors")'); pg.wait_for_timeout(400)
    n=pg.locator('table.sched tbody tr').count(); print('doors',n); assert n>=4
    # change the width of the first door in the table
    did=pg.evaluate("()=>{const m=openingMarks(window.__app.get());return Object.entries(m).find(([id,k])=>k==='D1')[0]}")
    inp=pg.locator('table.sched tbody tr').first.locator('input').first; inp.fill('2\'8"'); inp.press('Enter'); pg.wait_for_timeout(400)
    w=pg.evaluate("(id)=>window.__app.get().openings.find(o=>o.id===id).width",did); print('D1 width',w); assert abs(w-32)<0.01
    pg.locator('table.sched tbody tr').first.locator('select').first.select_option('pocket'); pg.wait_for_timeout(300)
    assert pg.evaluate("(id)=>window.__app.get().openings.find(o=>o.id===id).dtype",did)=='pocket'
    # windows: sill
    pg.click('.schedview .mattabs button:has-text("Windows")'); pg.wait_for_timeout(400); r0=pg.locator('table.sched tbody tr').first
    sill=r0.locator('input').nth(2); sill.fill('30"'); sill.press('Enter'); pg.wait_for_timeout(300)
    assert pg.evaluate("()=>{const p=window.__app.get();const m=openingMarks(p);const id=Object.entries(m).find(([id,k])=>k==='W1')[0];return p.openings.find(o=>o.id===id).sill}")==30
    # cabinets: finish for one cabinet
    pg.click('.schedview .mattabs button:has-text("Cabinets")'); pg.wait_for_timeout(500); assert pg.locator('table.sched tbody tr').count()>=10
    row=pg.locator('table.sched tbody tr').nth(2); fid=None
    sels=row.locator('select'); sels.nth(1).select_option('navy'); pg.wait_for_timeout(300)
    assert pg.evaluate("()=>window.__app.get().fixtures.filter(f=>f.cab&&f.cab.finish==='navy').length")==1
    # rooms and finishes
    pg.click('.schedview .mattabs button:has-text("Rooms and finishes")'); pg.wait_for_timeout(400)
    kr=pg.locator('table.sched tbody tr:has(input[value="Kitchen"])'); kr.locator('select').first.select_option('hardwood'); pg.wait_for_timeout(300)
    assert pg.evaluate("()=>window.__app.get().rooms.find(r=>r.name==='Kitchen').finish")=='hardwood'
    nt=kr.locator('input').last; nt.fill('Match the existing oak'); nt.press('Enter'); pg.wait_for_timeout(300)
    assert pg.evaluate("()=>window.__app.get().rooms.find(r=>r.name==='Kitchen').finishNote")=='Match the existing oak'
    # hardware totals; sort; lighting
    pg.click('.schedview .mattabs button:has-text("Cabinet hardware")'); pg.wait_for_timeout(400); t=pg.locator('.schedview section.sec').first.inner_text(); print(t[:200]); assert 'Bar pull' in t
    pg.click('.schedview .mattabs button:has-text("Appliances")'); pg.wait_for_timeout(300); assert pg.locator('table.sched tbody tr').count()>=3
    with pg.expect_download() as dl: pg.click('button:has-text("Download CSV")')
    csv=open(dl.value.path()).read(); print(csv[:200]); assert csv.startswith('"Appliance"')
    pg.click('.schedview .mattabs button:has-text("Doors")'); pg.wait_for_timeout(300); pg.click('table.sched thead button:has-text("Width")'); pg.wait_for_timeout(200)
    first=pg.locator('table.sched tbody tr').first.locator('td').first.inner_text(); print('sorted first',first)
    pg.locator('table.sched tbody tr').first.locator('button:has-text("Show")').click(); pg.wait_for_timeout(800); assert pg.locator('.designer').count()==1
    assert not errs, errs
print('PASS test76')
