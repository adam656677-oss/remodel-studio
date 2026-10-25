# screenshots for the user manual: every workflow page, key dialogs, light + dark
import os, sys
from h import *
from kitchen import KITCHEN_JS
OUT='manual/shots'; os.makedirs(OUT,exist_ok=True)
def shot(pg,name,full=False):
    pg.wait_for_timeout(500); pg.screenshot(path=f'{OUT}/{name}.png',full_page=full); print('shot',name)
def mode(pg,m,ms=900): pg.evaluate(f"()=>window.__app.setMode('{m}')"); pg.wait_for_timeout(ms)
def ls(pg,k,v): pg.evaluate(f"()=>localStorage.setItem('remodel-studio:{k}','{v}')")
def tab(pg,name): pg.get_by_role('tab',name=name,exact=True).first.click(); pg.wait_for_timeout(600)
def menu(pg,label): pg.get_by_role('button',name=label).first.click(); pg.wait_for_timeout(250)
def esc(pg): pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
scheme=sys.argv[1] if len(sys.argv)>1 else 'light'
W,H=1600,1000
with app(W,H,scheme=scheme,mode='design') as (pg,errs):
    pg.wait_for_timeout(1500); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(800)
    pg.evaluate("()=>{const p=window.__app.get();window.__app.commit({...p,rooms:p.rooms.map(r=>r.name==='Kitchen'?{...r,tile:{splash:'full',mat:'subway'}}:r)})}")
    sfx='' if scheme=='light' else '-dark'
    # dashboard
    mode(pg,'dashboard',1200); shot(pg,'dashboard'+sfx)
    if scheme=='dark':
        mode(pg,'design'); pg.evaluate("()=>window.__app.setLevelId(window.__app.get().levels[0].id)"); pg.wait_for_timeout(1500); shot(pg,'designer'+sfx)
        mode(pg,'3d',2500); shot(pg,'3d'+sfx)
        sys.exit(0)
    # designer
    mode(pg,'design',1500)
    if not pg.evaluate("()=>document.querySelector('.ribbon').classList.contains('pinned')"): pg.click('.ribbon button:has-text("Pin open")'); pg.wait_for_timeout(300)
    pg.click('.rb-tabs button:has-text("Home")'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const p=window.__app.get();const f=p.fixtures.find(f=>f.type==='island');if(f)window.__app.setSel({kind:'fixture',id:f.id})}"); pg.wait_for_timeout(900)
    shot(pg,'designer')
    for t in ['Architecture','Interiors','Structure','Systems','Site']:
        pg.click(f'.rb-tabs button:has-text("{t}")'); pg.wait_for_timeout(300)
        pg.locator('.ribbon').screenshot(path=f'{OUT}/ribbon-{t.lower()}.png'); print('ribbon',t)
    pg.click('.rb-tabs button:has-text("Home")'); pg.wait_for_timeout(200); pg.locator('.ribbon').screenshot(path=f'{OUT}/ribbon-home.png')
    pg.click('.ribbon button:has-text("Collapse")'); pg.wait_for_timeout(400); shot(pg,'designer-collapsed')
    pg.click('.ribbon button:has-text("Pin open")'); pg.wait_for_timeout(200)
    # inspector for a wall and a window
    pg.evaluate("()=>{const p=window.__app.get();window.__app.setSel({kind:'wall',id:p.walls[0].id})}"); pg.wait_for_timeout(700); pg.locator('.dz-insp, .inspector').first.screenshot(path=f'{OUT}/inspector-wall.png')
    pg.evaluate("()=>{const p=window.__app.get();const o=p.openings.find(o=>o.kind==='window')||p.openings[0];window.__app.setSel({kind:'opening',id:o.id})}"); pg.wait_for_timeout(700); pg.locator('.dz-insp, .inspector').first.screenshot(path=f'{OUT}/inspector-window.png')
    pg.evaluate("()=>{const p=window.__app.get();const r=p.rooms.find(r=>r.use==='kitchen');window.__app.setSel({kind:'room',id:r.id})}"); pg.wait_for_timeout(700); pg.locator('.dz-insp, .inspector').first.screenshot(path=f'{OUT}/inspector-room.png')
    pg.evaluate("()=>{const p=window.__app.get();const f=p.fixtures.find(f=>f.type==='base');if(f)window.__app.setSel({kind:'fixture',id:f.id})}"); pg.wait_for_timeout(700); pg.locator('.dz-insp, .inspector').first.screenshot(path=f'{OUT}/inspector-cabinet.png')
    pg.evaluate("()=>window.__app.setSel(null)"); pg.wait_for_timeout(300)
    # four views
    pg.click('.rb-tabs button:has-text("Home")'); pg.wait_for_timeout(200); pg.click('button[title="Four views"]'); pg.wait_for_timeout(2500); shot(pg,'designer-four')
    pg.click('button[title="One view"]'); pg.wait_for_timeout(800)
    # project browser + library
    pg.click('.dz-ltabs button:has-text("Project browser")'); pg.wait_for_timeout(400); pg.locator('.dz-dock, .dz-left').first.screenshot(path=f'{OUT}/project-browser.png')
    pg.click('.dz-ltabs button >> nth=0'); pg.wait_for_timeout(400); pg.locator('.dz-dock, .dz-left').first.screenshot(path=f'{OUT}/catalog.png')
    # menus
    menu(pg,'File'); pg.locator('.menupop >> text=Import').first.hover(); pg.wait_for_timeout(300); shot(pg,'menu-file-import'); esc(pg)
    menu(pg,'File'); pg.locator('.menupop >> text=Export').first.hover(); pg.wait_for_timeout(300); shot(pg,'menu-file-export'); esc(pg)
    menu(pg,'Edit'); shot(pg,'menu-edit'); esc(pg)
    for m in ['View','Report','Window','Help']:
        try: menu(pg,m); shot(pg,'menu-'+m.lower()); esc(pg)
        except Exception as e: print('no menu',m,e)
    # palette
    pg.keyboard.press('Control+k'); pg.keyboard.type('square feet of the kitchen'); pg.wait_for_timeout(500); shot(pg,'palette'); esc(pg)
    # appearance dialog
    menu(pg,'Help'); pg.get_by_text('Appearance (light or dark)…').click(); pg.wait_for_timeout(400); shot(pg,'appearance'); esc(pg)
    menu(pg,'Help'); pg.get_by_text('My standards…').click(); pg.wait_for_timeout(400); shot(pg,'standards'); esc(pg)
    menu(pg,'Help'); pg.get_by_text('Keyboard shortcuts').click(); pg.wait_for_timeout(400); shot(pg,'shortcuts'); esc(pg)
    menu(pg,'Help'); pg.get_by_text('Lessons…').click(); pg.wait_for_timeout(400); shot(pg,'lessons'); esc(pg)
    # dialogs via palette names
    for q,name in [('Vendor catalog','vendor-import'),('Store prices','store-prices'),('Roof wizard','roof-wizard'),('Floor and ceiling joists','joists'),('Remove or open a wall','wall-removal'),('Wall framing and cut list','wall-framing'),('Change cabinet door style','style-swap'),('Countertop slab layout','slab'),('Export IFC','ifc'),('Walls from a scan','scan-walls'),('Import DWG','dxf-import'),('Blocks','blocks'),('Photo match','photo-match'),('Render studio','render-studio'),('AR view and 3D export','ar-export'),('360','pano'),('Walk-through video','video')]:
        try:
            pg.keyboard.press('Control+k'); pg.keyboard.type(q); pg.wait_for_timeout(500); pg.keyboard.press('Enter'); pg.wait_for_timeout(1200); shot(pg,'dlg-'+name); esc(pg); pg.wait_for_timeout(200)
            if pg.locator('.modal-bg').count(): pg.locator('.modal-bg').first.evaluate("e=>e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))"); pg.wait_for_timeout(200)
            if pg.locator('.modal-bg').count(): pg.evaluate("()=>document.querySelectorAll('.modal-bg').forEach(e=>e.remove())")
        except Exception as e: print('dialog failed',q,e)
    # 3D
    mode(pg,'3d',3000); shot(pg,'3d')
    mode(pg,'split',2500); shot(pg,'split')
    # systems
    mode(pg,'systems',1000)
    for t,n in [('Energy code','energy'),('Heating and cooling','loads'),('Electrical service','electrical'),('Plumbing','plumbing'),('Lighting','lighting')]:
        tab(pg,t); shot(pg,'systems-'+n,True)
    # measure
    mode(pg,'capture',1000)
    for t,n in [('Photos','photos'),('Measure from photos','photo-measure'),('Photo assistant','photo-assistant'),('Scans and plan images','underlay'),('Make walls','make-walls'),('Field notes','field')]:
        tab(pg,t); shot(pg,'measure-'+n)
    # check
    mode(pg,'check',1500); shot(pg,'check',True)
    # documents
    ls(pg,'shtab','plans'); mode(pg,'sheets',1500); shot(pg,'sheets')
    tab(pg,'Board presentation'); shot(pg,'presentation',True)
    tab(pg,'Finish board'); shot(pg,'finish-board',True)
    mode(pg,'schedules',1500); shot(pg,'schedules')
    # cost
    for t,n in [('estimate','estimate'),('co','change-orders'),('shop','shopping'),('selections','selections'),('actual','actuals'),('bids','bids'),('cuts','cut-plan'),('cabinets','cabinet-order')]:
        ls(pg,'mattab',t); mode(pg,'materials',1500); shot(pg,'cost-'+n,n in ('estimate','selections'))
    ls(pg,'mattab','takeoff'); mode(pg,'materials',1500)
    if pg.get_by_role('tab',name="Builder's list").count(): tab(pg,"Builder's list")
    shot(pg,'cost-takeoff')
    # build
    for t,n in [('schedule','schedule'),('field','field'),('photos','wall-photos'),('inspections','inspections'),('binder','binder')]:
        ls(pg,'buildtab',t); mode(pg,'build',1500); shot(pg,'build-'+n,n in ('inspections','binder'))
    print('errors',errs)
