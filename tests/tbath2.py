from h import *
with app() as (pg,errs):
    pg.evaluate("""()=>{let p=window.__app.get();const lv=p.levels[0].id;let q=placeBlock(p,lv,bathTemplate('rollin'),{x:700,y:100}).p;q=placeBlock(q,lv,bathTemplate('half'),{x:850,y:100}).p;q=placeBlock(q,lv,bathTemplate('tub'),{x:700,y:250}).p;window.__app.commit(q);}""")
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(400); pg.keyboard.press('f'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const v=window.__planView;}")
    sx,sy=w2s(pg,775,175); pg.mouse.move(sx,sy)
    for i in range(3): pg.mouse.wheel(0,-300); pg.wait_for_timeout(80)
    pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'bath_tpl.png')); print(errs)
