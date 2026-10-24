# KraftMaid spec book as a vendor catalog: SKUs, placement, hinge in the SKU, options, accessories on the order
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(500)
    r=pg.evaluate("""()=>{const k=LIB.filter(x=>x.vendor==='kraftmaid');return {n:k.length,place:k.filter(x=>x.place==='fixture').length,spec:k.filter(x=>x.place==='kmspec').length,
      bases:[...new Set(k.filter(x=>x.place==='fixture').map(x=>x.base))],b12:LIB_BY_ID['km-B12']&&[LIB_BY_ID['km-B12'].w,LIB_BY_ID['km-B12'].d,LIB_BY_ID['km-B12'].h,LIB_BY_ID['km-B12'].op],
      doors:VENDOR_CABS.find(v=>v.id==='kraftmaid').doors.filter(d=>/Lowe/.test(d.name)).length,mods:Object.keys(KM_MODS).length};}"""); print(r)
    assert r['n']>7000 and r['place']>4000 and r['spec']>1000 and r['doors']>=25 and r['mods']>100 and 'wallcab' in r['bases'] and 'sinkbase' in r['bases']
    # catalog shows up under vendor catalogs, search by SKU, place it
    pg.select_option('#dz-cat',"KraftMaid (Lowe's 2022)"); pg.wait_for_timeout(300); assert pg.locator('.dz-cat').count()>30
    pg.fill('.dz-search','B12'); pg.wait_for_timeout(300); pg.locator('.dz-item:has-text("B12 ")').first.click() if pg.locator('.dz-item:has-text("B12 ")').count() else pg.locator('.dz-item').first.click()
    pg.wait_for_timeout(300); pick=pg.evaluate("()=>document.querySelector('.dz-item.on b').innerText"); print('picked',pick)
    pg.click('.dz-acts .btn.primary'); click_w(pg,180,215); pg.wait_for_timeout(600)
    f=pg.evaluate("()=>{const p=window.__app.get();const f=p.fixtures.filter(f=>/^km-/.test(f.lib||'')).pop();return f&&{id:f.id,type:f.type,w:f.w,sku:cabSku(f),lib:f.lib}}"); print(f); assert f and f['sku'].startswith(pick.split('{')[0][:3])
    # hinge letter goes into the book's pattern; options and accessories reach the order
    r2=pg.evaluate("""(id)=>{let p=window.__app.get();const f=p.fixtures.find(x=>x.id===id);const it=LIB_BY_ID[f.lib];
      p=updObj(p,'fixture',id,{cab:{...(f.cab||{}),hand:'L',km:(it.opts||[]).filter(k=>KM_MODS[k]).slice(0,1),kmAcc:['DCSK21']}});p={...p,settings:{...p.settings,kmLoose:{'ACM8':2}}};window.__app.commit(p);
      const g=p.fixtures.find(x=>x.id===id);const O=cabOrder(p);return {sku:cabSku(g),full:cabSkuFull(p,g),op:it.op,acc:O.acc.map(a=>a.qty+' '+a.code),lines:O.groups.flatMap(g=>g.lines.map(l=>l.sku)).filter(s=>s.startsWith(it.sku.slice(0,2)))};}""",f['id']); print(r2)
    if r2['op']: assert 'L' in r2['sku'].replace(r2['op'].split('{')[0],'')[:2] or r2['sku'].endswith('L')
    assert any('DCSK21' in a for a in r2['acc']) and any('2 ACM8' in a for a in r2['acc'])
    # cabinet panel shows the KraftMaid block
    pg.evaluate("(id)=>window.__app.setSel({kind:'fixture',id})",f['id']); pg.wait_for_timeout(500)
    assert pg.locator('.km-sec').count()==1; pg.locator('.km-sec').scroll_into_view_if_needed(); pg.screenshot(path=str(OUT/'t65.png'))
    # spec-only item: add to order from the dock
    pg.fill('.dz-search','ACM8'); pg.wait_for_timeout(300); pg.locator('.dz-item').first.click(); pg.wait_for_timeout(200)
    labels=pg.locator('.dz-acts .btn').all_inner_texts(); print(labels); assert any('Add to' in l for l in labels)
    print('errors',errs[:3]); assert not errs; print('PASS')
