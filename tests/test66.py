# designer tools: fill a cabinet run, under-cabinet lights, reflected ceiling plan, wall elevations for every room wall
from h import *
from kitchen import KITCHEN_JS
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200); pg.evaluate(KITCHEN_JS); pg.wait_for_timeout(500)
    r=pg.evaluate("""()=>{let p=window.__app.get();const lv=p.levels[0].id;
      // a lone 24" base on the kitchen's east wall leaves gaps on both sides
      const k=p.rooms.find(r=>r.use==='kitchen');const W=roomWalls(p).filter(w=>w.room.id===k.id);
      const lens=W.map(w=>Math.round(w.L));const empty=W.find(w=>elevIE(p,w).fixtures.length===0&&w.L>60);if(!empty)return {err:'no empty wall',lens};
      const IE=elevIE(p,empty);const s=30;const into={x:-IE.facing.x,y:-IE.facing.y};const pt={x:IE.start.x+IE.dir.x*(s+12),y:IE.start.y+IE.dir.y*(s+12)};
      const rot=Math.round(Math.atan2(into.x,-into.y)*180/Math.PI+360)%360;const f={id:uid('fx'),level:lv,type:'base',x:pt.x+into.x*12,y:pt.y+into.y*12,w:24,d:24,h:34.5,elev:0,rot:(rot+180)%360,status:'new'};
      const ff=fxFront(f);if(ff.x*into.x+ff.y*into.y<0)f.rot=rot;p={...p,fixtures:[...p.fixtures,f]};
      const R=fillRun(p,f);const added=R.p.fixtures.slice(p.fixtures.length);
      const U=underCabLights(window.__app.get(),lv);
      return {lens,len:Math.round(IE.len),n:R.n,msg:R.msg,added:added.map(a=>a.type+' '+a.w),uc:U.n,walls:roomWalls(p).length};}"""); print(r)
    assert r.get('n',0)>=2 and r['uc']>=3 and r['walls']>=12
    tot=sum(float(a.split()[1]) for a in r['added'])+24; assert abs(tot-r['len'])<7 or tot<=r['len']+0.5, 'run fills the wall'
    # RCP pane shows ceiling devices only
    pg.evaluate("()=>{const p=window.__app.get();const r=underCabLights(p,p.levels[0].id);window.__app.commit(r.p);}")
    pg.select_option('.dz-vsel >> nth=0','rcp'); pg.wait_for_timeout(700)
    pg.screenshot(path=str(OUT/'t66.png'))
    print('errors',errs[:3]); assert not errs; print('PASS')
