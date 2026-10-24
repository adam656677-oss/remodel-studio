from h import *
from kitchen import KITCHEN_JS
with app(1500,950) as (pg,errs):
    pg.evaluate(KITCHEN_JS)
    r=pg.evaluate("""()=>{const p=window.__app.get();const codes=runChecks(p).filter(i=>i.rule&&i.rule.set==='NKBA').map(i=>i.rule.code);
      const off=runChecks({...p,settings:{...p.settings,nkba:{on:false}}}).filter(i=>i.rule&&i.rule.set==='NKBA').length;return {codes,off};}""")
    print(r)
    for c in ['K6','K9','K17','K19','K27','K30','K31','B-backing']: assert c in r['codes'], c
    assert r['off']==0
    assert pg.locator('#p-nkba').count()==1
    print('errors',errs[:3]); assert not errs; print('PASS')
