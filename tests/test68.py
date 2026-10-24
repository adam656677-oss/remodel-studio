# roof wizard, truss layout (gable, hip, shed, flat), floor joist layout with openings, framing sheets, takeoff, 3D trusses
from h import *
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200)
    r=pg.evaluate("""()=>{const p=window.__app.get();const lv=p.levels[0].id;const out={};
      for(const st of ['gable','hip','shed','flat','gambrel','dutch']){const rs=autoRoof(p,lv,{style:st,pitch:6,overhang:12}).map(r=>({...r,framing:{system:'trusses'}}));const q={...p,roofs:rs};
        let n=0,bad=0,marks=new Set();for(const r of rs){const L=trussLayout(q,r);const b=roofBuild(r,roofTop(q,r));for(const it of L.items){n++;marks.add(it.mark);if(!trussProfile(q,r,b,it))bad++;}}out[st]={n,bad,marks:[...marks].sort()};}
      // a second floor with a stair opening
      let q=JSON.parse(JSON.stringify(p));const l1=q.levels[0];const l2={id:'lv2',name:'Second floor',elevation:l1.elevation+l1.height+12,height:96};q.levels.push(l2);
      for(const w of q.walls.filter(w=>w.level===l1.id&&w.kind==='exterior'))q.walls.push({...w,id:w.id+'u',level:'lv2'});
      q.stairs=[{id:'st1',level:l1.id,x:300,y:40,dir:'S',width:36,tread:10}];
      const J=joistLayout(q,l2);const kinds={};for(const m of J.members)kinds[m.kind]=(kinds[m.kind]||0)+1;
      const S=buildSheets({...q,roofs:autoRoof(q,'lv2',{style:'gable',pitch:6,overhang:12}).map(r=>({...r,framing:{system:'trusses'}}))}).map(s=>s.no);
      q.levels=q.levels.map(l=>l.id==='lv2'?{...l,framing:{jtype:'ijoist',ijoist:'11.875',spacing:16}}:l);const J2=joistLayout(q,q.levels.find(l=>l.id==='lv2'));
      return {out,kinds,open:J.openings.length,warn:J.warn,sheets:S,ij:joistSchedule(J2).map(r=>r.item).slice(0,3),allow:[joistAllow(q,joistOpt(l1)),joistAllow(q,joistOpt(q.levels[1]))]};}""")
    import json;print(json.dumps(r)[:2500])
    o=r['out']; assert all(v['n']>5 and v['bad']==0 for v in o.values())
    assert 'GE1' in o['gable']['marks'] and 'G1' in o['hip']['marks'] and 'M1' in o['shed']['marks'] and 'F1' in o['flat']['marks']
    assert r['open']==1 and r['kinds'].get('trimmer',0)>=2 and r['kinds'].get('header',0)==2 and r['kinds'].get('tail',0)>=2
    assert 'S3.0' in r['sheets'] and any(s.startswith('S2.') for s in r['sheets'])
    assert 'I-joist' in ' '.join(r['ij'])
    # wizard builds a truss hip roof
    pg.click('#dz-menu-design'); pg.click('.menupop button:has-text("Roof wizard")'); pg.wait_for_timeout(1200)
    pg.click('.rw-style:has-text("Hip")'); pg.select_option('#rw-sys','trusses'); pg.check('text=Ice barrier at the eaves'); pg.wait_for_timeout(500)
    assert pg.locator('.rw-truss').count()==1
    pg.click('button:has-text("Build the roof")'); pg.wait_for_timeout(1000)
    q=pg.evaluate("()=>{const p=window.__app.get();return p.roofs.map(r=>[r.style,rafterOf(r).system,!!rafterOf(r).ice])}"); print(q); assert q and all(x[0]=='hip' and x[1]=='trusses' and x[2] for x in q)
    t=pg.evaluate("()=>takeoff(window.__app.get(),{waste:0}).filter(x=>/Truss G1|Ice and water|Ridge vent|rafter/.test(x.item)).map(x=>x.item)"); print(t)
    assert any('Truss G1' in x for x in t) and any('Ice and water' in x for x in t) and not any(' rafter' in x for x in t)
    # tabs and 3D
    pg.click('.dz-tabs button:has-text("Roof framing")'); pg.wait_for_timeout(500); assert pg.locator('.fr-girder').count()>=2
    pg.click('.dz-tabs button:has-text("Floor framing")'); pg.wait_for_timeout(500); assert pg.locator('.fr-j').count()>20
    pg.get_by_role('button',name='Framing').click(); pg.wait_for_timeout(2000)
    pg.evaluate("()=>window.dispatchEvent(new CustomEvent('rs-dialog',{detail:'joists'}))"); pg.wait_for_timeout(600); pg.select_option('#ff-type','truss'); pg.wait_for_timeout(500)
    assert 'floor trusses' in pg.locator('.ff-plan').text_content().lower()
    pg.screenshot(path=str(OUT/'t68.png'))
    print('errors',errs[:3]); assert not errs; print('PASS')
