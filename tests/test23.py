from h import *
from test21b import cam
with app() as (pg,errs):
    pg.evaluate("()=>{const a=window.__app;let p={...a.get()};p.roofs=autoRoof(p,p.levels[0].id,{style:'hip',pitch:6,overhang:12});p.openings=p.openings.map(o=>o.type==='window'?{...o,shutters:'louvered',shutterColor:'#2f4a3a'}:o);a.commit(p);a.setMode('3d');}")
    pg.wait_for_timeout(1500)
    cam(pg,[20,10,-30],[20,4,14]); pg.screenshot(path=str(OUT/'t23_shutters.png'),clip={'x':60,'y':50,'width':1040,'height':800})
    pg.get_by_role('button',name='Framing').click(); pg.wait_for_timeout(1500)
    cam(pg,[50,30,-30],[20,4,14]); pg.screenshot(path=str(OUT/'t23_framing.png'),clip={'x':60,'y':50,'width':1040,'height':800})
    # curved wall tool
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(500)
    pg.evaluate("()=>window.__app.setTool('curvewall')"); pg.wait_for_timeout(200)
    click_w(pg,0,336); click_w(pg,0,0); click_w(pg,-96,168)
    P=pg.evaluate("()=>window.__app.get().walls.filter(w=>w.curve).length"); print('curve walls',P)
    pg.screenshot(path=str(OUT/'t23_curve.png'))
    print(errs or 'no errors')
