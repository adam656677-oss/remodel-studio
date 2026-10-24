from h import *
with app(1400,900) as (pg,errs):
    pg.evaluate("""()=>{const a=window.__app;const p=a.get();const rooms=p.rooms.map(r=>r.name==='Living'?{...r,ceiling:'vaulted'}:r.name==='Kitchen'?{...r,ceiling:'tray'}:r.name==='Bedroom 1'?{...r,ceiling:'coffered'}:r);
      a.commit({...p,rooms,sections:[{id:'sx1',a:{x:-60,y:150},b:{x:540,y:150},look:1,label:'A',level:p.levels[0].id}]})}""")
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500)
    pg.select_option('select[aria-label="Section cut"]','s:sx1'); pg.wait_for_timeout(1500)
    pg.screenshot(path=str(OUT/'t31_section.png'))
    pg.get_by_role('button',name='Flip').click(); pg.wait_for_timeout(1000); pg.screenshot(path=str(OUT/'t31_flip.png'))
    pg.select_option('select[aria-label="Section cut"]','off'); pg.wait_for_timeout(500)
    pg.get_by_role('button',name='Walk through').click(); pg.wait_for_timeout(1500)
    for i in range(10): pg.keyboard.press('ArrowLeft')
    pg.wait_for_timeout(800); pg.screenshot(path=str(OUT/'t31_walk.png'))
    print(errs or 'no errors')
