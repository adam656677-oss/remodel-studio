# 2.1: Check page, clash and notch checks (IRC R502.8.1, R602.6), reviewed issues
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(500)
    pg.evaluate("""()=>{let p=window.__app.get();const lv=p.levels[0].id;const w=p.walls.find(w=>w.kind!=='exterior'&&Math.abs(w.x1-w.x2)<1);
      const pipes=[{id:'pp1',level:lv,sys:'dwv',size:'3"',pts:[[30,100],[300,100]],z:-5,status:'new'},{id:'pp2',level:lv,sys:'dwv',size:'2"',pts:[[w.x1,Math.min(w.y1,w.y2)+10],[w.x1,Math.min(w.y1,w.y2)+80]],z:20,status:'new'},
        {id:'pp3',level:lv,sys:'cw',size:'1/2"',pts:[[30,120],[300,120]],z:-4,status:'new'},{id:'pp4',level:lv,sys:'dwv',size:'2"',pts:[[30,140],[300,140]],z:-30,status:'new'},{id:'pp5',level:lv,sys:'cw',size:'3/4"',pts:[[60,20],[60,300]],z:-12,status:'new'}];
      const ducts=[{id:'dd1',level:lv,sys:'supply',size:'8" round',where:'crawl',pts:[[40,60],[300,60]],status:'new'},{id:'dd2',level:lv,sys:'supply',size:'10" round',where:'crawl',pts:[[20,30],[20,300]],status:'new'}];
      window.__app.commit({...p,pipes,ducts});}"""); pg.wait_for_timeout(500)
    iss=pg.evaluate("()=>runChecks(window.__app.get()).filter(i=>i.rule&&i.rule.set==='Framing').map(i=>[i.sev,i.rule.code,i.title,i.target&&i.target.id])"); print('\n'.join(map(str,iss)))
    by={}
    for s,c,t,tid in iss: by.setdefault(tid,[]).append((s,c,t))
    assert any(s=='error' and c=='R502.8.1' for s,c,t in by['pp1']), 'big drain through 2x8 joists'
    assert all(s!='error' for s,c,t in by.get('pp3',[])), 'small water line is fine'
    assert 'pp4' not in by, 'hangs below the joists'
    assert any(s=='error' and c=='R602.6' for s,c,t in by['pp2']), '2 in drain in a 2x4 wall'
    assert any('hits' in t for s,c,t in by.get('pp5',[])), 'pipe crossing a duct at the same height'
    # the Check page lists them under Framing; filter, pick, mark reviewed
    pg.click('.wf-tab:has-text("Check")'); pg.wait_for_timeout(800)
    assert pg.locator('.ck-cats button:has-text("Framing")').count()==1
    n0=pg.locator('.ck-scroll .issue').count(); pg.click('.ck-cats button:has-text("IRC")'); pg.wait_for_timeout(200); n1=pg.locator('.ck-scroll .issue').count(); print(n0,n1); assert n1<n0
    pg.click('.ck-cats button:has-text("IRC")'); pg.fill('.ck-list input[type=search]','hole'); pg.wait_for_timeout(200)
    pg.locator('.ck-scroll .issue').first.click(); pg.wait_for_timeout(300); d=pg.locator('.ck-detail').inner_text(); print(d[:300]); assert 'R502.8.1' in d
    n2=pg.locator('.ck-scroll .issue').count(); pg.check('.ck-detail input[type=checkbox]'); pg.wait_for_timeout(300); assert pg.locator('.ck-scroll .issue').count()==n2-1
    pg.fill('.ck-list input[type=search]',''); pg.locator('.ck-scroll .issue').first.click(); pg.click('.ck-detail button:has-text("Show it in Design")'); pg.wait_for_timeout(800)
    assert pg.locator('.designer').count()==1 and 'Nothing selected' not in pg.locator('.dz-status').inner_text()
    pg.screenshot(path=str(OUT/'t75.png'))
    assert not errs, errs
print('PASS test75')
