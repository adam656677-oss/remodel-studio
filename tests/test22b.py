from h import *
from test21b import setup, cam
import sys
st=sys.argv[1] if len(sys.argv)>1 else 'hip'
with app() as (pg,errs):
    setup(pg)
    pg.evaluate("""(st)=>{const a=window.__app;let p={...a.get()};const L=p.levels[0].id;const W=(x1,y1,x2,y2)=>({id:uid('w'),level:L,x1,y1,x2,y2,thick:5.5,kind:'exterior',bearing:true,height:null,status:'new'});
      p.walls=p.walls.filter(w=>w.id!=='wr');p.walls.push(W(480,0,648,0),W(648,0,648,192),W(648,192,480,192),W(480,192,480,336));
      p.openings=p.openings.filter(o=>o.wall!=='wr');
      p.roofs=autoRoof(p,L,{style:st,pitch:6,overhang:12});a.commit(p);}""",st)
    pg.wait_for_timeout(500)
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500)
    cam(pg,[95,45,-30],[30,0,14]); pg.screenshot(path=str(OUT/f"t22b_{st}.png"),clip={"x":60,"y":50,"width":1040,"height":800}); cam(pg,[30,95,14.5],[30,0,14]); pg.screenshot(path=str(OUT/f"t22b_top_{st}.png"),clip={"x":60,"y":50,"width":1040,"height":800})
    print(errs or 'no errors')
