# 2.2 layout + dashboard: Home dashboard, File submenus, collapsed ribbon popover, folding panel sections, Make walls tab, merged Selections, Change orders tab
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(600)
    # workflows
    tabs=pg.locator('.wf-tab'); n=tabs.count(); print('wf tabs',n); assert n==7
    assert pg.locator('.wf-tab',has_text='Home').count()==1
    # dashboard
    pg.evaluate("()=>window.__app.setMode('dashboard')"); pg.wait_for_timeout(900)
    assert pg.locator('.dashview').count()==1
    cards=pg.locator('.dash-card'); print('cards',cards.count()); assert cards.count()>=6
    assert 'estimate' in pg.locator('.dash-card',has_text='Cost').inner_text()
    pg.locator('.dash-card',has_text='Checks').locator('button.btn',has_text='Open').click(); pg.wait_for_timeout(500)
    assert pg.locator('.checkview').count()==1
    pg.evaluate("()=>window.__app.setMode('dashboard')"); pg.wait_for_timeout(500)
    pg.locator('button',has_text='Open the design').click(); pg.wait_for_timeout(600)
    assert pg.locator('.designer').count()==1
    # File menu has Import / Export submenus and My standards
    pg.locator('.menubar button, .menubtn, header button',has_text='File').first.click(); pg.wait_for_timeout(250)
    assert pg.locator('.menupop',has_text='Export').count()>=1
    pg.locator('.menupop >> text=Export').first.hover(); pg.wait_for_timeout(300)
    assert pg.locator('.submenu').count()==1 and pg.locator('.submenu').inner_text().count('\n')>=3
    assert pg.locator('.menupop',has_text='My standards').count()>=1
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    # ribbon collapses to a popover and can be pinned
    assert pg.locator('.ribbon').count()==1
    pinned=pg.evaluate("()=>document.querySelector('.ribbon').classList.contains('pinned')")
    if pinned: pg.locator('.ribbon button',has_text='Collapse').click(); pg.wait_for_timeout(200)
    assert pg.evaluate("()=>document.querySelector('.ribbon').classList.contains('collapsed')")
    pg.locator('.rb-tabs [role=tab]').nth(1).click(); pg.wait_for_timeout(250)
    assert pg.evaluate("()=>document.querySelector('.ribbon').classList.contains('open')")
    pg.locator('.rb-body .rb-btn').first.click(); pg.wait_for_timeout(250)
    assert not pg.evaluate("()=>document.querySelector('.ribbon').classList.contains('open')")
    pg.locator('.ribbon button',has_text='Pin open').click(); pg.wait_for_timeout(200)
    assert pg.evaluate("()=>document.querySelector('.ribbon').classList.contains('pinned')")
    assert pg.evaluate("()=>localStorage.getItem('rb-pinned')")=='1' or pg.evaluate("()=>localStorage.getItem('remodel-studio:rb-pinned')") in ('1','true')
    pg.locator('.ribbon button',has_text='Collapse').click(); pg.wait_for_timeout(200)
    # inspector sections fold
    pg.evaluate("()=>{const p=window.__app.get();window.__app.setSel({kind:'wall',id:p.walls[0].id})}"); pg.wait_for_timeout(500)
    h3=pg.locator('.secfold .sec > h3').first; key=h3.evaluate('e=>e.textContent'); h3.click(); pg.wait_for_timeout(200)
    assert pg.evaluate("()=>!!document.querySelector('.secfold .sec[data-closed]')")
    assert key.split('(')[0].strip() in pg.evaluate("()=>localStorage.getItem('remodel-studio:sec-closed')")
    h3.click(); pg.wait_for_timeout(200); assert not pg.evaluate("()=>!!document.querySelector('.secfold .sec[data-closed]')")
    # status strip inline, drawing area share
    assert pg.locator('.dz-tabs .dz-status b').count()==1
    share=pg.evaluate("()=>{const r=document.querySelector('.dz-panes').getBoundingClientRect();return r.width*r.height/(innerWidth*innerHeight)}"); print('panes share',round(share,3)); assert share>0.5
    # Measure: Make walls tab
    pg.evaluate("()=>window.__app.setMode('capture')"); pg.wait_for_timeout(800)
    pg.get_by_role('tab',name='Make walls').click(); pg.wait_for_timeout(300)
    t=pg.locator('.capview, .matview, main').inner_text(); assert 'tape' in t.lower() or 'scan' in t.lower()
    # Cost: merged Selections and orders, Change orders tab, Cut plan tab
    pg.evaluate("()=>window.__app.setMode('materials')"); pg.wait_for_timeout(800)
    pg.get_by_role('tab',name='Selections and orders',exact=True).click(); pg.wait_for_timeout(500)
    assert pg.locator('.matinner.wide').count()>=1 and pg.locator('h2',has_text='Selections and orders').count()==1 and pg.locator('h2',has_text='Selections').count()>=2
    pg.get_by_role('tab',name='Change orders',exact=True).click(); pg.wait_for_timeout(400)
    assert pg.locator('text=Lock the contract').count()>=1 or pg.locator('text=change order').count()>=1
    assert pg.get_by_role('tab',name='Cut plan',exact=True).count()==1
    print(errs); assert not errs
print('test81 ok')
