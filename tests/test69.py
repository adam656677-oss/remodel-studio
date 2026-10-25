# designer menus open fully on screen (left edge and bottom), small and large windows
from h import *
for (w,h) in [(1366,768),(1920,1080)]:
  with app(w,h,mode='design') as (pg,errs):
    pg.wait_for_timeout(1500)
    for m in ['FILE','EDIT','view','place','report','design','draw','dimensions','render','window','help']:
        pg.click('#menu-'+m.lower() if m.isupper() else '#dz-menu-'+m); pg.wait_for_timeout(300)
        r=pg.evaluate("""()=>{const m=document.querySelector('.menupop');const r=m.getBoundingClientRect();const el=document.elementFromPoint(r.left+30,r.top+15);return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom),innerWidth,innerHeight,!!(el&&m.contains(el))];}""")
        ok=r[0]>=0 and r[2]<=r[4] and r[3]<=r[5] and r[6]
        print(w,m,r,'OK' if ok else 'BAD'); assert ok, m
        if m in ('place','view'): pg.screenshot(path=str(OUT/f'menu_{w}_{m}.png'))
        pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    assert not errs
print('PASS')
