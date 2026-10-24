from h import *
from test21b import setup
import json
with app() as (pg,errs):
    setup(pg)
    pg.evaluate("""()=>{const a=window.__app;let p={...a.get()};const L=p.levels[0].id;p.roofs=autoRoof(p,L,{style:'hip',pitch:6,overhang:12});
      p.site=[{id:'d1',level:L,type:'drive',surf:'concrete',pts:[[500,-300],[620,-300],[620,60],[500,60]]},{id:'t1',level:L,type:'tree',surf:'oak',x:-150,y:-200,d:300},{id:'lt',level:L,type:'lot',surf:'line',pts:[[-300,-420],[780,-420],[780,700],[-300,700]]}];
      p.openings=p.openings.map(o=>o.type==='window'?{...o,shutters:'louvered'}:o);a.commit(p);a.setMode('sheets');}""")
    pg.wait_for_timeout(1500)
    names=pg.evaluate("()=>[...document.querySelectorAll('button')].map(b=>b.textContent).filter(t=>/^A|^S|^E/.test(t)).slice(0,30)")
    print(names)
    for nm in ['A0.2','A3.1','A2.1']:
        b=pg.locator('button',has_text=nm)
        if b.count(): b.first.click(); pg.wait_for_timeout(800); pg.screenshot(path=str(OUT/f't26_{nm}.png'))
    print(errs or 'no errors')
