from h import *
from test21b import cam
with app() as (pg,errs):
    # build a kitchen with runs on the kitchen walls (sample kitchen 0..240 x 192..336)
    pg.evaluate("""()=>{const a=window.__app;let p={...a.get()};p.fixtures=p.fixtures.filter(f=>!(f.x<240&&f.y>192));a.commit(p);a.setMode('plan');}""")
    pg.wait_for_timeout(500); pg.keyboard.press('f'); pg.wait_for_timeout(400)
    pg.evaluate("()=>window.__app.setTool('cabrun')"); pg.wait_for_timeout(200)
    click_w(pg,6,240); click_w(pg,6,333.25)   # west wall from y=240 to bottom
    pg.wait_for_timeout(300)
    click_w(pg,30,330); click_w(pg,180,330)   # south wall
    pg.evaluate("()=>window.__app.setTool('cabrunw')"); pg.wait_for_timeout(200)
    click_w(pg,30,330); click_w(pg,180,330)
    P=pg.evaluate("()=>window.__app.get().fixtures.filter(f=>isCab(f)).map(f=>[f.type,f.w,Math.round(f.x),Math.round(f.y),f.rot])"); print(P)
    # make one a sink base, add fridge/range/dw
    pg.evaluate("""()=>{const a=window.__app;let p={...a.get()};const L=p.levels[0].id;const fx=p.fixtures.map(f=>({...f}));
      const s=fx.find(f=>f.type==='base'&&f.y>300&&f.w>=30);if(s){s.type='sinkbase';s.lib=null;s.name=null;}
      fx.push({...newFixture('fridge',L,17.75,212,270)});p.fixtures=fx;p.settings={...p.settings,cab:{style:'shaker',finish:'sage',hw:'bar',hwFin:'brass',crown:true},counter:{mat:'quartz',edge:'eased',thick:1.25,overhang:1,splash:'full'}};a.commit(p);}""")
    pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t27_plan.png'))
    print(pg.evaluate("()=>counterGeo(window.__app.get(),window.__app.get().levels[0].id).map(c=>[c.pts.length,Math.round(c.area/144*10)/10,c.holes.length,c.splash.length])"))
    print(pg.evaluate("()=>runChecks(window.__app.get()).filter(i=>i.rule&&i.rule.set==='NKBA').map(i=>i.title)"))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500)
    pg.get_by_role('button',name='Show roof').click(); pg.wait_for_timeout(400)
    cam(pg,[14,9,13],[6,3,25]); pg.screenshot(path=str(OUT/'t27_3d.png'),clip={'x':60,'y':50,'width':1040,'height':800})
    rows=pg.evaluate("()=>takeoff(window.__app.get()).filter(r=>/Cabinets|Countertops/.test(r.cat)).map(r=>r.cat+': '+r.item+' x'+r.qty+' $'+(r.price||''))"); print('\n'.join(rows))
    est=pg.evaluate("()=>{const e=estimateOf(window.__app.get());return [Math.round(e.mat||0),Math.round(e.total||0)]}"); print('estimate',est)
    print(errs or 'no errors')
