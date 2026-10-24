from h import *
from kitchen import KITCHEN_JS
import base64
with app(1500,950) as (pg,errs):
    print(pg.evaluate(KITCHEN_JS))
    r=pg.evaluate("""()=>{const p=window.__app.get();const I=runChecks(p);
      const R=cabOrder(p);return {nk:I.filter(i=>i.rule&&['NKBA','Cabinets'].includes(i.rule.set)).map(i=>i.sev+' '+i.rule.code+' '+i.title),
        skus:R.groups.flatMap(g=>g.lines.map(l=>l.n+' '+l.sku+' '+l.mods.map(m=>m.code).join('+')+' $'+l.list)),acc:R.acc.map(a=>a.qty+' '+a.unit+' '+a.item+' $'+a.list),
        tot:[R.list,R.net,R.sell,R.total].map(Math.round),
        take:takeoff(p,{waste:0}).filter(r=>/Cabinet trim/.test(r.cat)).map(r=>r.qty+' '+r.unit+' '+r.item),
        sheets:buildSheets(p).map(s=>s.no+' '+s.title)};}""")
    for k,v in r.items():
        print(k); [print('   ',x) for x in v] if isinstance(v,list) else print('   ',v)
    assert any('Blind corner' in x for x in r['nk'])
    assert any('Countertop shop drawing' in s for s in r['sheets'])
    # inspector: select the drawer-18 cabinet, check mods panel
    fid=pg.evaluate("()=>window.__app.get().fixtures.find(f=>f.lib==='c-base-36'&&f.rot===180).id")
    pg.evaluate("id=>{window.__app.setMode('plan');window.__app.setSel({kind:'fixture',id});}",fid); pg.wait_for_timeout(600)
    pg.get_by_text('Modifications').first.scroll_into_view_if_needed(); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'k_insp.png'))
    pg.get_by_label('Spice or utensil pull-out',exact=False).first.check(); pg.wait_for_timeout(300)
    sku=pg.evaluate("id=>cabSkuFull(window.__app.get(),window.__app.get().fixtures.find(f=>f.id===id))",fid); print('sku after',sku); assert 'SPO' in sku
    pg.evaluate("()=>{window.__app.setSel(null);window.__app.setMode('materials');}"); pg.wait_for_timeout(500)
    pg.get_by_role('tab',name='Cabinet order').click(); pg.wait_for_timeout(600); pg.screenshot(path=str(OUT/'k_order.png'),full_page=True)
    pg.evaluate("()=>window.__app.setMode('sheets')"); pg.wait_for_timeout(1200)
    for nm in ['A5.0','A5.1','A5.3','A5.4','A5.2']:
        b=pg.locator('button',has_text=nm)
        if b.count(): b.first.click(); pg.wait_for_timeout(900); pg.screenshot(path=str(OUT/f'k_{nm}.png'))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(2500); pg.screenshot(path=str(OUT/'k_3d.png'))
    pg.get_by_role('button',name='360°').click(); pg.wait_for_selector('.panoview canvas',timeout=20000)
    print('errors',errs[:5]); assert not errs
    print('PASS')
