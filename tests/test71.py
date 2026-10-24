# 2.0: NKBA cabinet codes and centerlines, style swap, ceiling joists, rafter schedule, new sheets
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(600)
    r=pg.evaluate("""()=>{const p=window.__app.get();const S=buildSheets(p);const lv=p.levels[0];const C=joistLayout(p,lv,'ceiling');
      return {sheets:S.map(s=>s.no),ceil:C&&C.members.length,raf:p.roofs.map(r=>rafterSchedule(p,r).map(x=>x.item)),code:cabCode(p,p.fixtures.find(f=>f.lib==='c-sink-36'))};}""")
    print(json.dumps(r)[:600])
    for s in ['A5.4','S2.9','S3.1','S4.1','P1.1']: assert s in r['sheets'], s
    assert r['ceil']>10 and any('rafter' in x for x in r['raf'][0]) and any('Ridge' in x for x in r['raf'][0])
    assert r['code'].startswith('SB36'), r['code']
    pg.click('.dz-tabs button:has-text("Cabinets")'); pg.wait_for_timeout(500)
    assert pg.locator('.nk-code').count()>=8 and pg.locator('.nk-dim').count()>=3
    # style swap: job-wide door style + finish changes every cabinet and shows a price
    pg.evaluate("()=>window.dispatchEvent(new CustomEvent('rs-dialog',{detail:'styleswap'}))"); pg.wait_for_timeout(600)
    pg.select_option('#sw-style','raised'); pg.select_option('#sw-finish','navy'); pg.wait_for_timeout(800)
    t=pg.locator('.modal').inner_text(); assert '$' in t, t[:300]
    pg.locator('.modal button.primary').first.click(); pg.wait_for_timeout(600)
    s=pg.evaluate("()=>{const p=window.__app.get();return p.fixtures.filter(isCab).map(f=>{const c=cabStyle(p,f);return c.style+'/'+c.finish;})}")
    print(set(s)); assert s and all(x=='raised/navy' for x in s), set(s)
    assert not errs, errs
print('PASS test71')
