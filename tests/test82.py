# 2.2 extras: my standards, water supply sizing, calendar export, inspection prep, bids, aging in place, cut plan, finish board, palette pages
import re
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(600)
    # my standards: save from this project, apply to a blank one
    pg.evaluate("()=>{const p=window.__app.get();window.__app.commit({...p,settings:{...p.settings,selections:{...(p.settings.selections||{}),paintBrand:'Sherwin-Williams'}}})}"); pg.wait_for_timeout(300)
    std=pg.evaluate("()=>{const S=standardsFrom(window.__app.get());saveStandards(S);return S}"); print('std keys',list(std.keys())[:8]); assert std
    b=pg.evaluate("()=>newStandardProject().settings.selections"); print(b); assert b and b.get('paintBrand')=='Sherwin-Williams'
    pg.evaluate("()=>window.__app.setMode('design')"); pg.keyboard.press('Control+k'); pg.keyboard.type('My standards'); pg.wait_for_timeout(400); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
    assert pg.locator('.modal, .dialog, [role=dialog]',has_text='standards').count()>=1; pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    # water supply sizing
    ws=pg.evaluate("()=>supplySizing(window.__app.get())"); assert ws and ws.get('WSFU')>0 and ws.get('rooms')
    pg.evaluate("()=>window.__app.setMode('systems')"); pg.wait_for_timeout(800)
    pg.get_by_role('tab',name=re.compile('Plumb')).first.click(); pg.wait_for_timeout(500)
    t=pg.locator('.matinner, .sysview, main').first.inner_text(); assert 'WSFU' in t or 'fixture unit' in t.lower()
    # calendar export
    ics=pg.evaluate("()=>icsText(scheduleEvents(window.__app.get()))"); assert ics.startswith('BEGIN:VCALENDAR') and 'BEGIN:VEVENT' in ics and ics.count('BEGIN:VEVENT')>=3
    mi=pg.evaluate("()=>icsText(maintenanceEvents(window.__app.get()))"); assert 'RRULE' in mi or 'BEGIN:VEVENT' in mi
    # inspection prep
    ip=pg.evaluate("()=>inspectionPrep(window.__app.get())"); print('inspections',[x['phase'] for x in ip]); assert len(ip)>=3 and all(x['items'] for x in ip)
    pg.evaluate("()=>{localStorage.setItem('remodel-studio:buildtab','inspections');window.__app.setMode('build')}"); pg.wait_for_timeout(800)
    assert pg.locator('.insp-prep').count()==1 and pg.locator('.insp-prep input[type=checkbox]').count()>=5
    pg.locator('.insp-prep input[type=checkbox]').first.check(); pg.wait_for_timeout(300)
    assert pg.evaluate("()=>Object.keys(window.__app.get().settings.inspDone||{}).length")==1 and pg.locator('.insp-prep input[type=checkbox]').first.is_checked()
    # bids
    pg.evaluate("()=>{localStorage.setItem('remodel-studio:mattab','bids');window.__app.setMode('materials')}"); pg.wait_for_timeout(800)
    assert pg.get_by_role('tab',name='Bids',exact=True).get_attribute('aria-selected')=='true'
    sc=pg.evaluate("()=>scopeByTrade(window.__app.get()).map(x=>x.label)"); print('trades',sc); assert len(sc)>=3
    pg.locator('input[aria-label="Bidder"]').first.fill('ACME Plumbing'); pg.keyboard.press('Tab'); pg.wait_for_timeout(200)
    pg.locator('input[aria-label="Amount"]').first.fill('12500'); pg.keyboard.press('Tab'); pg.wait_for_timeout(300)
    bids=pg.evaluate("()=>window.__app.get().bids"); print('bids',str(bids)[:160]); assert bids and any(any(q.get('who')=='ACME Plumbing' and q.get('amount')==12500 for q in v.get('quotes',[])) for v in bids.values())
    pg.locator('button',has_text='Choose').first.click(); pg.wait_for_timeout(300); assert pg.evaluate("()=>Object.values(window.__app.get().bids).some(b=>b.pick===0)")
    # aging in place panel in Check
    pg.evaluate("()=>window.__app.setMode('check')"); pg.wait_for_timeout(900)
    assert pg.locator('.ck-wrap .aging').count()==1
    ag=pg.evaluate("()=>agingChecks(window.__app.get()).length"); print('aging items',ag); assert ag>=3
    # cut plan
    pg.evaluate("()=>{localStorage.setItem('remodel-studio:mattab','cuts');window.__app.setMode('materials')}"); pg.wait_for_timeout(900)
    assert pg.locator('.cutopt').count()==1
    pcs=pg.evaluate("()=>{const P=cutPiecesFromModel(window.__app.get());return {n:P.length,kinds:[...new Set(P.map(x=>x.sheet))]}}"); print(pcs); assert pcs['n']>20 and 'dw412' in pcs['kinds']
    nest=pg.evaluate("()=>{const P=cutPiecesFromModel(window.__app.get()).filter(x=>x.sheet==='dw412');const S=nestSheets(P,SHEETS.dw412);const area=P.reduce((s,q)=>s+q.w*q.h,0);return {sheets:S.length,yieldPct:area/(S.length*48*144),overlap:S.some(sh=>sh.pieces.some((a,i)=>sh.pieces.some((b,j)=>j>i&&a.x<b.x+b.w-0.01&&b.x<a.x+a.w-0.01&&a.y<b.y+b.h-0.01&&b.y<a.y+a.h-0.01))),outside:S.some(sh=>sh.pieces.some(q=>q.x+q.w>48.01||q.y+q.h>144.01))}}")
    print(nest); assert nest['sheets']>=2 and nest['yieldPct']>0.6 and not nest['overlap'] and not nest['outside']
    assert pg.locator('.cut-sheet').count()>=2
    alt=pg.evaluate("()=>{const P=cutPiecesFromModel(window.__app.get(),96).filter(x=>x.sheet==='dw412');const S=nestSheets(P,SHEETS.dw48);return {bad:S.filter(sh=>sh.pieces.some(q=>q.bad)).length,maxLen:Math.max(...P.map(q=>Math.max(q.w,q.h)))}}"); print('4x8',alt); assert alt['bad']==0 and alt['maxLen']<=96
    assert pg.evaluate("()=>{let p=window.__app.get();p={...p,rooms:p.rooms.map(r=>r.name==='Kitchen'?{...r,tile:{splash:'full',mat:'subway'}}:r)};return tileZones(p,p.rooms.find(r=>r.name==='Kitchen')).length>0&&cutPiecesFromModel(p).some(x=>/backer/.test(x.label)&&!/floor/.test(x.label))}")
    pg.locator('button',has_text='Add a piece').click(); pg.wait_for_timeout(300)
    pg.select_option('.cutopt select.inp >> nth=0','ply48'); pg.wait_for_timeout(400)
    assert pg.locator('.cut-sheet').count()>=1 and pg.evaluate("()=>(window.__app.get().cutExtra||[]).length")==1
    with pg.expect_download() as dl: pg.locator('button',has_text='Cut list CSV').click()
    assert dl.value.suggested_filename.endswith('.csv')
    # finish board
    fb=pg.evaluate("()=>finishBoard(window.__app.get()).map(x=>x.group)"); print('board',fb); assert 'Cabinets' in fb and 'Flooring' in fb and 'Hardware' in fb and 'Countertops' in fb
    pg.evaluate("()=>{localStorage.setItem('remodel-studio:shtab','finishes');window.__app.setMode('sheets')}"); pg.wait_for_timeout(900)
    assert pg.locator('.finishboard .fb-tile').count()>=4 and pg.locator('.fb-tile img').first.evaluate('e=>e.naturalWidth')>0
    with pg.expect_download() as dl: pg.locator('button',has_text='Finish board PDF').click()
    assert dl.value.suggested_filename.endswith('finish-board.pdf')
    pres=pg.evaluate("()=>presOf(window.__app.get()).sections.finishes"); assert pres is True
    # palette pages
    pg.evaluate("()=>window.__app.setMode('design')"); pg.wait_for_timeout(400)
    pg.keyboard.press('Control+k'); pg.keyboard.type('Finish board'); pg.wait_for_timeout(400); pg.keyboard.press('Enter'); pg.wait_for_timeout(700)
    assert pg.locator('.finishboard').count()==1
    pg.keyboard.press('Control+k'); pg.keyboard.type('Job dashboard'); pg.wait_for_timeout(400); pg.keyboard.press('Enter'); pg.wait_for_timeout(700)
    assert pg.locator('.dashview').count()==1
    print(errs); assert not errs
print('test82 ok')
