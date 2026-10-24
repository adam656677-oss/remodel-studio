from h import *
from kitchen import KITCHEN_JS
with app(1500,950) as (pg,errs):
    pg.evaluate(KITCHEN_JS)
    r=pg.evaluate("""()=>{const p=window.__app.get();const J=jobSchedule(p);return {rows:J.rows.map(r=>r.id+' '+r.s.toISOString().slice(0,10)+(r.wait?' wait:'+r.wait.id:'')),od:orderDates(p,J).map(L=>L.id+' '+L.days+' '+(L.order&&L.order.toISOString().slice(0,10))+(L.holds?' HOLDS':''))};}""")
    for k,v in r.items(): print(k); [print('  ',x) for x in v]
    ids=[x.split()[0] for x in r['rows']]
    assert 'ctr' in ids and 'inspI' in ids
    pg.evaluate("()=>window.__app.setMode('materials')"); pg.get_by_role('tab',name='Job schedule').click(); pg.wait_for_timeout(600)
    assert pg.get_by_text('Order dates for long-lead items').count()==1
    print('errors',errs[:3]); assert not errs; print('PASS')
