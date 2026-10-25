# Designer workspace: menus, catalog dock, panes, elevation picking, tabs, place/move/coords
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode=None) as (pg,errs):
    pg.wait_for_timeout(1200); assert pg.locator('.designer').count()==1, 'designer is the default on wide screens'
    pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(600)
    for m in ['View','Place','Report','Design','Draw','Dimensions','Render','Window','Help']: assert pg.locator('#dz-menu-'+m.lower()).count()==1, m
    assert pg.locator('.dz-menubar').count()==0 and pg.locator('header.top #dz-menu-view').count()==1, 'one menu bar'
    pg.click('.rb-tabs button:has-text("Draw")'); pg.wait_for_timeout(200); assert pg.locator('.rb-body .rb-btn').count()>=10, 'ribbon drawing tools'
    pg.click('.rb-tabs button:has-text("Home")'); pg.wait_for_timeout(200)
    # catalog: dropdown, categories, CODE > Description rows, preview picture
    pg.select_option('#dz-cat','Bedroom'); pg.click('.dz-cat:has-text("Beds")'); pg.wait_for_timeout(200)
    rows=pg.locator('.dz-item'); assert rows.count()>50; t=rows.first.inner_text(); print('row',t); assert '>' in t
    rows.nth(10).click(); pg.wait_for_selector('.dz-preview img',timeout=20000)
    # four panes, plan + 3d + elevation + exterior
    if not pg.evaluate("()=>document.querySelector('.ribbon').classList.contains('pinned')"): pg.click('.ribbon button:has-text("Pin open")'); pg.wait_for_timeout(200)
    pg.click('.rb-tabs button:has-text("Home")'); pg.wait_for_timeout(200); pg.click('button[title="Four views"]'); pg.wait_for_timeout(1500); assert pg.locator('.dz-pane').count()==4
    vals=[pg.locator('.dz-vsel').nth(i).input_value() for i in range(4)]; print(vals)
    # picking a cabinet in an elevation selects it
    n=pg.locator('.dz-hit').count(); print('hits',n); assert n>=3
    pg.locator('.dz-hit').nth(1).click(); pg.wait_for_timeout(300)
    s=pg.evaluate("()=>document.querySelector('.dz-status').innerText"); print(s); assert 'Nothing selected' not in s
    # coords tab edits the selection
    pg.click('.dz-ptabs button:has-text("Coords")'); x0=pg.input_value('#dz-c-x'); pg.fill('#dz-c-elev','2"'); pg.press('#dz-c-elev','Enter'); pg.wait_for_timeout(300)
    sel=pg.evaluate("()=>{const p=window.__app.get();return p.fixtures.filter(f=>f.elev===2).length}"); assert sel==1, 'Z coordinate applied'
    pg.click('.dz-ptabs button:has-text("Move")'); pg.click('button[aria-label="Move right"]'); pg.wait_for_timeout(200)
    # only one 3D pane at a time
    pg.select_option('.dz-vsel >> nth=0','3d'); pg.wait_for_timeout(800); n3=sum(1 for i in range(4) if pg.locator('.dz-vsel').nth(i).input_value()=='3d'); assert n3==1
    pg.select_option('.dz-vsel >> nth=0','plan'); pg.wait_for_timeout(800)
    # tabs filter the plan
    nfx=lambda: pg.evaluate("()=>document.querySelectorAll('.dz-pane .plan g[data-id]').length")
    a=nfx(); pg.click('.dz-tabs button:has-text("Architecture")'); pg.wait_for_timeout(400); b=nfx(); print('fixtures shown',a,b); assert b<a
    pg.click('.dz-tabs button:has-text("Cabinets")'); pg.wait_for_timeout(300)
    pg.click('.dz-tabs button:has-text("Legend")'); pg.wait_for_timeout(300); assert pg.locator('.dz-legend').count()==1
    pg.click('.dz-tabs button:has-text("NKBA")'); pg.wait_for_timeout(300); assert pg.locator('.dz-nkba').count()==1
    pg.click('.dz-tabs button:has-text("All")'); pg.wait_for_timeout(300)
    # menus run
    pg.click('#dz-menu-window'); pg.click('.menupop button:has-text("One view")'); pg.wait_for_timeout(500); assert pg.locator('.dz-pane').count()==1
    pg.click('#dz-menu-view'); pg.click('.menupop button:has-text("Reflected ceiling plan")'); pg.wait_for_timeout(600); assert pg.locator('.dz-vsel').first.input_value()=='rcp'
    pg.screenshot(path=str(OUT/'t63.png'))
    # layout persists across a reload
    pg.reload(); pg.wait_for_timeout(1500); assert pg.locator('.dz-pane').count()==1 and pg.locator('.designer').count()==1
    pg.evaluate("()=>window.__app.setMode('split')"); pg.wait_for_timeout(500); assert pg.locator('.designer').count()==0 and pg.locator('.rail').count()==1
    print('errors',errs[:3]); assert not errs; print('PASS')
