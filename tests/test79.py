# 2.1: selections and orders tracker (lead times feed the schedule, purchase orders), budget vs actual, wall photos, homeowner binder, lighting scenes
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(500)
    pg.evaluate("()=>{try{localStorage.setItem('remodel-studio:mattab','orders');}catch(e){}window.__app.setMode('materials')}"); pg.wait_for_timeout(1200)
    assert pg.locator('.orders').count()==1
    row=pg.locator('.orders tr:has-text("cabinets")').first
    row.locator('select').select_option('approved'); pg.wait_for_timeout(300)
    row=pg.locator('.orders tr:has-text("cabinets")').first; v=row.locator('input[aria-label^="Vendor"]'); v.fill('Lowe\'s'); v.press('Tab'); pg.wait_for_timeout(300)
    row=pg.locator('.orders tr:has-text("cabinets")').first; a=row.locator('input[aria-label^="$"]').first; a.fill('9000'); a.press('Tab'); pg.wait_for_timeout(300)
    row=pg.locator('.orders tr:has-text("cabinets")').first; pr=row.locator('input[aria-label^="$"]').nth(1); pr.fill('9650'); pr.press('Tab'); pg.wait_for_timeout(300)
    row=pg.locator('.orders tr:has-text("cabinets")').first; ld=row.locator('input[aria-label^="Lead time"]'); ld.fill('60'); ld.press('Tab'); pg.wait_for_timeout(400)
    t=pg.evaluate("()=>window.__app.get().track.cabinets"); print(t); assert t=={'status':'approved','vendor':"Lowe's",'allowance':9000,'price':9650,'lead':60}
    assert '+$650' in pg.locator('.orders .rw-stats').inner_text(); pg.screenshot(path=str(OUT/'t79_orders.png'))
    li=pg.evaluate("()=>leadItems(window.__app.get()).filter(L=>/tracker/.test(L.label)).map(L=>[L.phase,L.days])"); print(li); assert ['cab',60] in li
    with pg.expect_download() as dl: pg.click('.po-row button:has-text("PO PDF and mark ordered")')
    assert open(dl.value.path(),'rb').read(4)==b'%PDF'; pg.wait_for_timeout(300)
    t=pg.evaluate("()=>window.__app.get().track.cabinets"); print(t); assert t['status']=='ordered' and t['po'].startswith('PO-') and t['ordered']
    # color by order status shows the cabinets as ordered
    pg.evaluate("()=>window.__app.setMode('design')"); pg.wait_for_timeout(700); pg.select_option('#dz-colorby','order'); pg.wait_for_timeout(400); assert 'Ordered' in pg.locator('.cb-legend').first.inner_text(); pg.select_option('#dz-colorby','')
    # budget vs actual
    pg.evaluate("()=>{try{localStorage.setItem('remodel-studio:mattab','actual');}catch(e){}window.__app.setMode('materials')}"); pg.wait_for_timeout(1000)
    f=pg.locator('.rc-form'); f.locator('input').nth(1).fill('Home Depot'); f.locator('input').nth(2).fill('$412.50'); f.locator('select').select_option(index=1); f.locator('input').nth(3).fill('Drywall and mud'); pg.click('button:has-text("Add receipt")'); pg.wait_for_timeout(400)
    rc=pg.evaluate("()=>window.__app.get().receipts"); print(rc); assert len(rc)==1 and rc[0]['amount']==412.5
    assert '$413' in pg.locator('.actuals .rw-stats').inner_text() or '$412' in pg.locator('.actuals .rw-stats').inner_text()
    # wall photo tool: pin on a wall, shows on the Build page and on the elevation sheet
    pg.evaluate("()=>window.__app.setMode('design')"); pg.wait_for_timeout(700); pg.evaluate("()=>window.__app.setTool('wallphoto')")
    w=pg.evaluate("()=>{const p=window.__app.get();const k=p.rooms.find(r=>r.name==='Kitchen');const w=p.walls.find(w=>w.kind==='exterior'&&Math.abs(w.y1-w.y2)<1&&w.y1>300);return [100, w.y1-(w.thick/2+4)]}")
    click_w(pg,w[0],w[1]); pg.wait_for_timeout(400); pg.evaluate("()=>window.__app.setTool('select')")
    wp=pg.evaluate("()=>window.__app.get().wallphotos||[]"); print(wp); assert len(wp)==1 and wp[0]['side'] in (1,-1)
    assert pg.locator('label:has-text("Add photos")').count()==1
    pg.evaluate("()=>{try{localStorage.setItem('remodel-studio:buildtab','photos');}catch(e){}window.__app.setMode('build')}"); pg.wait_for_timeout(800); assert pg.locator('.wp-card').count()==1
    el=pg.evaluate("()=>{const s=buildSheets(window.__app.get()).filter(s=>/^A5\\.[12]/.test(s.no));return s.some(x=>x.items.some(i=>i.t==='text'&&/^PHOTO/.test(i.s)))}"); assert el, 'camera mark on an elevation'
    # homeowner binder
    pg.click('.mattabs button:has-text("Homeowner binder")'); pg.wait_for_timeout(400); pg.fill('#bd-water','Front yard by the meter'); pg.press('#bd-water','Tab'); pg.wait_for_timeout(300)
    with pg.expect_download(timeout=60000) as dl: pg.click('button:has-text("Make the binder")')
    data=open(dl.value.path(),'rb').read(); open('shots/binder.pdf','wb').write(data); print('binder bytes',len(data)); assert data[:4]==b'%PDF' and len(data)>8000
    # lighting scenes scale the render lights
    sc=pg.evaluate("""()=>{let p=window.__app.get();const lv=p.levels[0].id;const k=p.rooms.find(r=>r.name==='Kitchen');const c=polyLabelPt(k.pts);
      const L=[0,1].map(i=>({id:'lt'+i,level:lv,type:'can',x:c[0]-30+i*60,y:c[1],status:'new'}));const sw={id:'sw1',level:lv,type:'dimmer',x:k.pts[0][0]+6,y:k.pts[0][1]+6,status:'new',links:L.map(l=>l.id)};
      p={...p,elec:[...(p.elec||[]),...L,sw]};const gs=sceneGroups(p);p={...p,settings:{...p.settings,lightScenes:[{id:'s1',name:'Dinner',levels:{[gs[0].id]:0.25}}]}};
      const a=renderLights(p).reduce((s,l)=>s+l.lm,0),b=renderLights(p,'s1').reduce((s,l)=>s+l.lm,0);return [a,b];}"""); print('lumens',sc); assert abs(sc[1]-sc[0]*0.25)<1
    assert not errs, errs
print('PASS test79')
