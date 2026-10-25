# 2.1 layout: workflow tabs, one menu bar, ribbon, project browser, saved view setups, issues dock, color by, Ctrl+K
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(600)
    assert pg.locator('.wf-tab').count()==7 and pg.locator('.dz-menubar').count()==0
    for name,mode in [('Measure','capture'),('Check','check'),('Documents','sheets'),('Cost','materials'),('Build','build'),('Design','design')]:
        pg.click(f'.wf-tab:has-text("{name}")'); pg.wait_for_timeout(500)
        m=pg.evaluate("()=>document.querySelector('.wf-tab.on').innerText"); assert name in m, (name,m)
    assert pg.locator('.designer').count()==1
    pg.click('.wf-pages button:has-text("Systems")'); pg.wait_for_timeout(500); assert pg.locator('.designer').count()==0
    pg.click('.wf-pages button:has-text("Model")'); pg.wait_for_timeout(600); assert pg.locator('.designer').count()==1
    # ribbon: a tool button picks the tool and the ribbon follows the tool
    if not pg.evaluate("()=>document.querySelector('.ribbon').classList.contains('pinned')"): pg.click('.ribbon button:has-text("Pin open")'); pg.wait_for_timeout(200)
    pg.click('.rb-tabs button:has-text("Architecture")'); pg.wait_for_timeout(200); pg.click('.rb-btn[title^="Wall ("]'); pg.wait_for_timeout(200)
    assert pg.evaluate("()=>document.querySelector('.dz-status b').innerText")=='Wall'
    pg.click('.rb-tabs button:has-text("Home")'); pg.click('.rb-btn[title^="Select"]'); pg.wait_for_timeout(200)
    pg.click('.ribbon button:has-text("Icons only")'); pg.wait_for_timeout(200); assert pg.locator('.ribbon.compact').count()==1; pg.click('.ribbon button:has-text("Show labels")')
    # project browser: open an interior elevation in the active pane, then save and restore a view setup
    pg.click('.dz-ltabs button:has-text("Project browser")'); pg.wait_for_timeout(300)
    pg.click('.pb-h:has-text("Interior elevations")'); pg.wait_for_timeout(200); pg.click('.pb-room summary >> nth=0'); pg.click('.pb-room .pb-leaf >> nth=0'); pg.wait_for_timeout(600)
    v=pg.locator('.dz-pane.active .dz-vsel').input_value(); print('pane view',v); assert v.startswith('elev:')
    pg.click('.pb-leaf:has-text("Electrical plan")'); pg.wait_for_timeout(500); assert pg.locator('.dz-tabs button.on').inner_text()=='Electrical'
    pg.click('.pb-node button:has-text("Save the current views")'); pg.fill('.pb-name input','My kitchen check'); pg.click('.pb-name button[type=submit]'); pg.wait_for_timeout(400)
    assert pg.evaluate("()=>window.__app.get().settings.viewSets.length")==1
    pg.click('.dz-tabs button:has-text("All") >> nth=0'); pg.wait_for_timeout(200); pg.click('.pb-leaf:has-text("My kitchen check")'); pg.wait_for_timeout(400)
    assert pg.locator('.dz-tabs button.on').inner_text()=='Electrical'
    # sheets and schedules open from the browser
    pg.click('.pb-h:has-text("Sheets")'); pg.wait_for_timeout(2500); pg.click('.pb-leaf:has-text("A5.1")'); pg.wait_for_timeout(1500)
    assert 'A5.1' in pg.locator('.shwrap').inner_text()[:4000]
    pg.evaluate("()=>window.__app.setMode('design')"); pg.wait_for_timeout(800)
    # issues dock, color by, errors as badges and warnings as dots
    pg.click('.dz-issbtn'); pg.wait_for_timeout(300); assert pg.locator('.dz-issues .issue').count()>=1; pg.click('.dz-issues button:has-text("Warnings")'); assert pg.locator('.dz-issues .issue').count()>=5
    assert pg.locator('.dz-pane .iss-dot').count()>0 and pg.locator('.dz-pane .iss-error').count()>0
    pg.select_option('#dz-colorby','status'); pg.wait_for_timeout(600); assert pg.locator('.cb-legend').count()>=1 and pg.locator('.cb-over polygon, .cb-over line').count()>5
    pg.select_option('#dz-colorby','category'); pg.wait_for_timeout(400); t=pg.locator('.cb-legend').first.inner_text(); print(t); assert 'Cabinets' in t
    pg.select_option('#dz-colorby',''); pg.wait_for_timeout(300); assert pg.locator('.cb-legend').count()==0
    # Ctrl+K: answers, runs commands
    pg.keyboard.press('Control+k'); pg.wait_for_timeout(300); pg.keyboard.type('how many wall cabinets'); pg.wait_for_timeout(400)
    a=pg.locator('.cmdk-ans').inner_text(); print(a); assert 'wall cabinet' in a.lower() and any(c.isdigit() for c in a)
    pg.fill('.cmdk-in input','area of the kitchen'); pg.wait_for_timeout(300); assert 'square feet' in pg.locator('.cmdk-ans').inner_text()
    pg.fill('.cmdk-in input','go to sched'); pg.wait_for_timeout(300); pg.keyboard.press('Enter'); pg.wait_for_timeout(800); assert pg.locator('.schedview').count()==1
    pg.evaluate("()=>window.__app.setMode('design')"); pg.wait_for_timeout(600)
    pg.keyboard.press('Control+k'); pg.keyboard.type('move the island 6 in left'); pg.wait_for_timeout(300)
    x0=pg.evaluate("()=>window.__app.get().fixtures.find(f=>f.type==='island').x"); pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
    x1=pg.evaluate("()=>window.__app.get().fixtures.find(f=>f.type==='island').x"); print('island',x0,x1); assert abs((x0-x1)-6)<0.01
    pg.screenshot(path=str(OUT/'t74.png'))
    assert not errs, errs
print('PASS test74')
