# 2.0: slab layout, change orders, lighting schedule with Kelvin, backups dialog
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(500)
    S=pg.evaluate("()=>{const S=slabSummary(window.__app.get());return {n:S.P.length,slabs:S.slabs,y:S.yieldPct,big:S.tooBig.length}}"); print(S)
    assert S['n']>=3 and S['slabs']>=1 and S['big']==0 and 0<S['y']<=100
    pg.evaluate("()=>window.dispatchEvent(new CustomEvent('rs-dialog',{detail:'slab'}))"); pg.wait_for_timeout(800)
    assert pg.locator('.modal svg').count()>=1; pg.screenshot(path=str(OUT/'t73_slab.png'))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    if pg.locator('.modal-bg').count(): pg.locator('.modal-bg button:has-text("Done")').first.click(); pg.wait_for_timeout(300)
    # lighting: three cans at 3000 K + a dimmer linked to them
    pg.evaluate("""()=>{const p=window.__app.get();const lv=p.levels[0].id;const k=p.rooms.find(r=>r.use==='kitchen');const c=k.pts.reduce((a,q)=>[a[0]+q[0]/k.pts.length,a[1]+q[1]/k.pts.length],[0,0]);
      const L=[0,1,2].map(i=>({id:'lt'+i,level:lv,type:'can',x:c[0]-40+i*40,y:c[1],status:'new',kelvin:3000,dim:true}));
      const sw={id:'swk',level:lv,type:'dimmer',x:k.pts[0][0]+6,y:k.pts[0][1]+6,status:'new',links:L.map(l=>l.id)};
      window.__app.commit({...p,elec:[...(p.elec||[]),...L,sw]});}"""); pg.wait_for_timeout(500)
    ls=pg.evaluate("()=>lightingSchedule(window.__app.get()).filter(r=>r.kelvin===3000).map(r=>[r.mark,r.qty,r.dim,r.sw])"); print(ls)
    assert ls and ls[0][1]==3 and ls[0][2] and ls[0][3].startswith('S')
    assert pg.evaluate("()=>renderLights(window.__app.get()).some(L=>L.color&&Math.abs(L.color[2]-kelvinRGB(3000)[2])<1e-6)")
    # change orders
    pg.evaluate("()=>window.__app.setMode('materials')"); pg.wait_for_timeout(600)
    if pg.get_by_role('tab',name='Estimate').count(): pg.get_by_role('tab',name='Estimate').click(); pg.wait_for_timeout(600)
    pg.click('button:has-text("Lock the contract")'); pg.wait_for_timeout(500)
    pg.evaluate("()=>{const p=window.__app.get();window.__app.commit({...p,fixtures:p.fixtures.filter(f=>f.type!=='dw')});}"); pg.wait_for_timeout(800)
    d=pg.evaluate("()=>{const D=changeDiff(window.__app.get());return [D.lines.length,D.delta]}"); print('diff',d)
    assert d[0]>=1 and d[1]<0
    pg.fill('input[aria-label="Change description"]','Owner removed the dishwasher.'); pg.click('button:has-text("Create change order")'); pg.wait_for_timeout(500)
    co=pg.evaluate("()=>window.__app.get().contract.changeOrders.map(c=>[c.no,c.delta,c.status])"); print(co)
    assert len(co)==1 and co[0][1]<0 and co[0][2]=='pending'
    assert pg.evaluate("()=>changeDiff(window.__app.get()).lines.length")==0
    n=pg.evaluate("async()=>{const p=window.__app.get();const d=await changeOrderPDF(p,p.contract.changeOrders[0]);return d.output('datauristring').length}"); assert n>5000
    # backups dialog (web version explains File > Versions)
    pg.evaluate("()=>window.dispatchEvent(new CustomEvent('rs-dialog',{detail:'backups'}))"); pg.wait_for_timeout(500)
    assert 'Versions' in pg.locator('.modal[aria-label="Backups"]').inner_text()
    assert not errs, errs
print('PASS test73')
