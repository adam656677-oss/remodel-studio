from h import *
from kitchen import KITCHEN_JS
import base64
with app(1500,950) as (pg,errs):
    pg.evaluate(KITCHEN_JS)
    U=pg.evaluate("()=>{const U=uaTradeoff(window.__app.get());return [U.P,U.R,U.pass,U.better,U.A];}"); print('UA',U); assert U[1]>0
    r=pg.evaluate("""()=>{let p=window.__app.get();const r=p.rooms.find(x=>x.use==='kitchen');const before=lightGrid(p,r).avg;const L=autoCanLayout(p,r,'w6');p=applyCanLayout(p,r,L);window.__app.commit(p);const G=lightGrid(p,r);
      return {n:L.n,sp:L.spacing,before,after:G.avg,min:G.min,take:takeoff(p,{waste:0}).filter(x=>x.cat==='Lighting fixtures').map(x=>x.qty+' '+x.item+' $'+x.price)};}"""); print(r)
    assert r['n']>=4 and r['after']>=20 and r['take']
    pg.evaluate("()=>window.__app.setMode('systems')"); pg.wait_for_timeout(400)
    pg.get_by_role('tab',name='Energy code').click() if pg.get_by_role('tab',name='Energy code').count() else None
    pg.wait_for_timeout(400); assert pg.get_by_text('Total UA trade-off').count()==1
    pg.screenshot(path=str(OUT/'ua.png'),full_page=True)
    t=pg.get_by_role('tab',name='Lighting'); t.click() if t.count() else pg.get_by_text('Lighting',exact=True).first.click(); pg.wait_for_timeout(500)
    pg.get_by_text('Lighting layout and foot-candles').scroll_into_view_if_needed(); pg.screenshot(path=str(OUT/'light.png'))
    # presentation extras
    html=pg.evaluate("async()=>await clientReviewHTML(window.__app.get())"); print('review html',len(html)); assert 'Send comments' in html and len(html)>100000
    open(OUT/'review.html','w').write(html)
    pg.evaluate("()=>window.__app.setMode('sheets')"); pg.wait_for_timeout(500); pg.get_by_role('tab',name='Board presentation').click(); pg.wait_for_timeout(500)
    pg.get_by_role('button',name='Show before and after').click(); pg.wait_for_timeout(3000)
    pg.locator('.ba').scroll_into_view_if_needed(); pg.screenshot(path=str(OUT/'ba.png'))
    vid=pg.evaluate("async()=>{try{const r=await recordWalkthrough(window.__app.get(),{mode:'orbit',secs:1.2,w:320,h:180});return [r.blob.size,r.ext,r.secs];}catch(e){return String(e);}}"); print('video',vid)
    print('errors',errs[:3]); assert not errs; print('PASS')
