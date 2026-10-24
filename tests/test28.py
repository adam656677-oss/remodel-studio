from h import *
def cmd(pg,t):
    pg.locator('.cmdbar input').fill(t); pg.locator('.cmdbar input').press('Enter'); pg.wait_for_timeout(150)
with app() as (pg,errs):
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(500); pg.keyboard.press('f'); pg.wait_for_timeout(300)
    # line via command line with typed coordinates
    cmd(pg,'L'); cmd(pg,"-10',-5'"); cmd(pg,"@20',0"); cmd(pg,"@10'<90"); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    P=pg.evaluate("()=>window.__app.get().cad.map(c=>[c.shape,c.pts])"); print('cad',P)
    # rectangle typed
    cmd(pg,'REC'); cmd(pg,"0,-10'"); cmd(pg,"@6',4'"); pg.wait_for_timeout(200)
    # circle
    cmd(pg,'C'); cmd(pg,"30',-10'"); cmd(pg,'2'); pg.wait_for_timeout(200)
    P=pg.evaluate("()=>window.__app.get().cad.map(c=>[c.shape,c.r||c.pts])"); print('cad2',P)
    print(pg.locator('.cmdlog').inner_text() if pg.locator('.cmdlog').count() else '')
    # select the rect and rotate 90, mirror copy
    rid=pg.evaluate("()=>window.__app.get().cad.find(c=>c.shape==='rect').id")
    pg.evaluate("(id)=>{window.__app.setTool('select');window.__app.setSel({kind:'cad',id})}",rid); pg.wait_for_timeout(200)
    cmd(pg,'RO 90'); print('rot',pg.evaluate("(id)=>window.__app.get().cad.find(c=>c.id===id).pts",rid))
    # move the whole sample bath wall group: select two walls & mirror copy across x=600
    pg.evaluate("()=>{const a=window.__app;a.setSel({kind:'multi',items:[{kind:'wall',id:'wc'},{kind:'wall',id:'wd'}]});}"); pg.wait_for_timeout(200)
    cmd(pg,'MC'); cmd(pg,"600,0"); cmd(pg,"600,100"); pg.wait_for_timeout(200)
    print('walls',pg.evaluate("()=>window.__app.get().walls.length"))
    # offset a wall 10'
    cmd(pg,"O 10'"); click_w(pg,0,100); click_w(pg,-30,100)
    print('walls after offset',pg.evaluate("()=>window.__app.get().walls.length"))
    # trim: draw crossing line through the rect, trim middle
    cmd(pg,'L'); cmd(pg,"-5',-8'"); cmd(pg,"@15',0"); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    cmd(pg,'TR'); click_w(pg,36,-96); pg.wait_for_timeout(200)
    print('cad3',pg.evaluate("()=>window.__app.get().cad.filter(c=>c.shape==='line').map(c=>c.pts)"))
    cmd(pg,'AD'); click_w(pg,100,100); print('dims',pg.evaluate("()=>(window.__app.get().dims||[]).length"))
    cmd(pg,'SEC'); click_w(pg,300,-60); click_w(pg,300,400); print('sections',pg.evaluate("()=>(window.__app.get().sections||[]).map(s=>[s.label,s.a,s.b])"))
    pg.keyboard.press('f'); pg.wait_for_timeout(300)
    pg.get_by_role('button',name='Display').click(); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/'t28_plan.png'))
    print(errs or 'no errors')
