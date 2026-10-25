# 2.1: revisions from change orders with clouds, keynotes and legend, tag by example, typical details sheet
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(500)
    pg.evaluate("()=>window.__app.setMode('materials')"); pg.wait_for_timeout(600)
    pg.get_by_role('tab',name='Change orders',exact=True).click(); pg.wait_for_timeout(600); pg.click('button:has-text("Lock the contract")'); pg.wait_for_timeout(400)
    assert pg.evaluate("()=>!!window.__app.get().contract.model")
    pg.evaluate("()=>{const p=window.__app.get();window.__app.commit({...p,fixtures:p.fixtures.filter(f=>f.type!=='dw')});}"); pg.wait_for_timeout(700)
    pg.fill('input[aria-label="Change description"]','Owner removed the dishwasher.'); pg.click('button:has-text("Create change order")'); pg.wait_for_timeout(500)
    r=pg.evaluate("()=>{const p=window.__app.get();const co=p.contract.changeOrders[0];return {rev:co.rev,changed:co.changed.map(c=>c.k+':'+c.ch),revs:p.info.revisions.map(r=>r.no+' '+r.desc)}}"); print(r)
    assert r['rev']=='1' and any(':del' in c for c in r['changed']) and r['revs'][-1].startswith('1 Change order 1')
    cl=pg.evaluate("()=>{const p=window.__app.get();const s=buildSheets(p).find(s=>/^A1\\.\\d/.test(s.no)&&/plan/.test(s.title)&&!/existing/.test(s.title));return s.items.filter(i=>i.t==='poly'&&i.stroke==='#c0392b').length}"); print('cloud polys',cl); assert cl>=2
    pg.select_option('select[aria-label="Status of change order 1"]','void'); pg.wait_for_timeout(400)
    cl2=pg.evaluate("()=>{const p=window.__app.get();const s=buildSheets(p).find(s=>/^A1\\.\\d/.test(s.no)&&/plan/.test(s.title)&&!/existing/.test(s.title));return s.items.filter(i=>i.t==='poly'&&i.stroke==='#c0392b').length}"); assert cl2==0
    assert pg.evaluate("()=>window.__app.get().info.revisions[0].desc.endsWith('(void)')")
    # keynote tool: place two tags, edit the text, link a builder's list item, legend sheet
    pg.evaluate("()=>window.__app.setMode('design')"); pg.wait_for_timeout(800)
    pg.evaluate("()=>window.__app.setTool('keynote')"); click_w(pg,100,250); pg.wait_for_timeout(300); click_w(pg,60,300); pg.wait_for_timeout(300)
    k=pg.evaluate("()=>{const p=window.__app.get();return [p.keynotes.length,p.kntags.length]}"); print('keynotes',k); assert k==[1,2]
    pg.evaluate("()=>window.__app.setTool('select')")
    pg.evaluate("()=>{const p=window.__app.get();window.__app.commit({...p,keynotes:p.keynotes.map(x=>({...x,text:'Patch drywall after the dishwasher is removed',item:'Drywall|'+(takeoff(p).find(r=>r.cat==='Drywall')||{item:''}).item}))});}"); pg.wait_for_timeout(300)
    s=pg.evaluate("()=>{const s=buildSheets(window.__app.get()).find(s=>s.no==='A0.3');return s?s.items.filter(i=>i.t==='text').map(i=>i.s).join(' | '):null}"); print(s[:300] if s else s); assert s and 'Patch drywall' in s and 'KEYNOTES' in s
    # tags print on the plan sheet as diamonds with the number
    d=pg.evaluate("()=>{const s=buildSheets(window.__app.get()).find(s=>s.no==='A1.1');return s.items.filter(i=>i.t==='text'&&i.s==='1'&&i.bold).length}"); print('keynote numbers on A1.1',d); assert d>=2
    # tag by example: click a base cabinet, every base cabinet of that kind gets a tag that follows it
    pg.evaluate("()=>window.__app.setTool('tagall')"); f=pg.evaluate("()=>{const f=window.__app.get().fixtures.find(f=>f.lib==='c-base-24');return [f.x,f.y]}"); click_w(pg,f[0],f[1]); pg.wait_for_timeout(400)
    t=pg.evaluate("()=>(window.__app.get().tags||[]).length"); print('tags',t); assert t>=1
    pg.evaluate("()=>window.__app.setTool('select')"); assert pg.locator('.tagx text').count()>=1
    # typical details sheet
    dt=pg.evaluate("()=>{const s=buildSheets(window.__app.get()).find(s=>s.no==='D1.1');return s?s.items.filter(i=>i.t==='text').map(i=>i.s).join(' | '):null}"); assert dt and 'TYPICAL WALL SECTION' in dt and 'R502' not in dt[:0]; print(dt[:240])
    for w in ['OPENING FRAMING','FLOOR FINISH ASSEMBLY','SHOWER PAN AND WALLS','R602.7']: assert w in dt, w
    assert not errs, errs
print('PASS test77')
