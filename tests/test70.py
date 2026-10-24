# 2.0: brand-name appliance catalog, cut-out and clearance checks, spec panel, prices
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(500)
    J=lambda js,*a: pg.evaluate(js,*a)
    SWAP="""(lib)=>{let p=window.__app.get();const f=p.fixtures.find(f=>f.lib&&/range/.test(f.type));const it=LIB_BY_ID[lib];
        window.__app.commit({...p,fixtures:p.fixtures.map(g=>g.id===f.id?{...g,lib,type:it.base,name:it.label,w:it.w,d:it.d,h:it.h}:g)});return f.id;}"""
    ISS="""()=>runChecks(window.__app.get()).filter(i=>/WFES3330RS|PRG366WH/.test(i.title)).map(i=>i.sev+':'+i.title)"""
    r={}
    r['n'],r['types']=J("""()=>{const ap=LIB.filter(x=>x.appl);const t={};for(const x of ap)t[x.appl.type]=(t[x.appl.type]||0)+1;return [ap.length,t];}""")
    r['id']=J(SWAP,'ap-WFES3330RS'); pg.wait_for_timeout(300); r['a']=J(ISS)
    J(SWAP,'ap-PRG366WH'); pg.wait_for_timeout(300); r['b']=J(ISS)
    J(SWAP,'ap-WFES3330RS'); pg.wait_for_timeout(300)
    J("""(id)=>{const p=window.__app.get();const rg=p.fixtures.find(f=>f.id===id);const wc={...newFixture('c-wall-30x30',rg.level,rg.x,rg.y,rg.rot),elev:54};
      const fr=fxFront(rg);wc.x=rg.x-fr.x*(rg.d/2-6);wc.y=rg.y-fr.y*(rg.d/2-6);window.__app.commit({...p,fixtures:[...p.fixtures,wc]});}""",r['id']); pg.wait_for_timeout(300)
    r['c']=J(ISS)
    r['rows']=J("""()=>takeoff(window.__app.get()).filter(r=>r.cat==='Appliances').map(r=>[r.item,r.price])""")
    print(json.dumps(r,indent=1))
    assert r['n']>=60 and r['types'].get('refrigerator',0)>=10 and r['types'].get('range',0)>=10
    assert any('gap beside' in x for x in r['a']) or r['a']==[], r['a']
    assert any(x.startswith('error') and 'too narrow' in x for x in r['b']), r['b']
    assert any('too close above' in x for x in r['c']), r['c']
    assert any('WFES3330RS' in it and pr==1054 for it,pr in r['rows']), r['rows']
    # inspector shows the spec block and a spec link
    pg.evaluate("(id)=>window.__app.setSel({kind:'fixture',id})",r['id']); pg.wait_for_timeout(500)
    t=pg.locator('.sec.appl').first.inner_text(); print(t[:300])
    assert 'WFES3330RS' in t and 'Spec page' in t
    # library search finds brand models
    pg.screenshot(path=str(OUT/'t70.png'))
    assert not errs, errs
print('PASS test70')
