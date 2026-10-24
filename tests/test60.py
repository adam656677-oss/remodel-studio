from h import *
with app(1500,950) as (pg,errs):
    r=pg.evaluate("""()=>{const p=window.__app.get();return p.walls.filter(w=>w.kind!=='exterior').map(w=>{const g=bearingGuess(p,w);return [w.id,Math.round(wlen(w)),g.likely,g.why[0]];});}""")
    for x in r: print(x)
    wid=max(r,key=lambda x:x[1])[0]
    pg.evaluate("id=>{window.__app.setMode('plan');window.__app.setSel({kind:'wall',id});}",wid); pg.wait_for_timeout(400)
    pg.get_by_role('button',name='Remove this wall (wizard)…').click(); pg.wait_for_timeout(500)
    pg.locator('.wallrm input[type=checkbox]').first.check(); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/'wallrm.png'))
    pg.get_by_role('button',name='Mark wall for removal with this beam').click(); pg.wait_for_timeout(400)
    w=pg.evaluate("id=>window.__app.get().walls.find(w=>w.id===id)",wid); print(w['status'],w['removal']); assert w['status']=='demolish' and w['removal']['label']
    rows=pg.evaluate("()=>takeoff(window.__app.get(),{waste:0}).filter(r=>/beam|Post|footing|shoring|Patch|hangers/i.test(r.item)).map(r=>r.qty+' '+r.unit+' '+r.item)"); print(rows); assert len(rows)>=4
    print('errors',errs[:3]); assert not errs; print('PASS')
