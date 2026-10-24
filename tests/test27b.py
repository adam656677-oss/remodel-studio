from h import *
with app() as (pg,errs):
    pg.evaluate("""()=>{const a=window.__app;let p={...a.get()};const L=p.levels[0].id;p.fixtures=p.fixtures.filter(f=>!(f.x<240&&f.y>192));
      const ctx={p,lv:p.levels[0],nearestWall:raw=>{let best=null;for(const w of p.walls.filter(w=>w.level===L)){const pr=projSeg(raw,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2});if(pr.d<=w.thick/2+30&&(!best||pr.d<best.d))best={w,pr,d:pr.d};}return best;}};
      let r=cabRun(ctx,{x:6,y:240},{x:6,y:309.25},'base');ctx.p=r.p;r=cabRun(ctx,{x:2.75,y:330},{x:200,y:330},'base');ctx.p=r.p;r=cabRun(ctx,{x:26.75,y:330},{x:200,y:330},'wall');p=r.p;
      const fx=p.fixtures.map(f=>({...f}));const s=fx.find(f=>f.type==='base'&&f.y>300&&f.w>=30&&f.x>100);if(s){s.type='sinkbase';s.lib=null;s.name=null;}fx.push({...newFixture('fridge',L,17.75,212,270)});
      p={...p,fixtures:fx,settings:{...p.settings,cab:{style:'raised',finish:'white',hw:'bar',hwFin:'nickel',crown:true},counter:{mat:'granite',edge:'bullnose',thick:1.25,overhang:1,splash:'4'}}};a.commit(p);a.setMode('sheets');}""")
    pg.wait_for_timeout(1500)
    for nm in ['A5.0','A5.1']:
        b=pg.locator('button',has_text=nm)
        if b.count(): b.first.click(); pg.wait_for_timeout(800); pg.screenshot(path=str(OUT/f't27_{nm}.png'))
    print(errs or 'no errors')
