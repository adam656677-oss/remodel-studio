from h import *
from test21b import setup, cam
with app() as (pg,errs):
    setup(pg)
    # L-shaped house: add a wing on the right and auto-roof
    pg.evaluate("""()=>{const a=window.__app;let p={...a.get()};const L=p.levels[0].id;const W=(x1,y1,x2,y2)=>({id:uid('w'),level:L,x1,y1,x2,y2,thick:5.5,kind:'exterior',bearing:true,height:null,status:'new'});
      // replace the right wall with an L wing going 168" further right on the top half
      p.walls=p.walls.filter(w=>w.id!=='wr');p.walls.push(W(480,0,648,0),W(648,0,648,192),W(648,192,480,192),W(480,192,480,336));
      p.openings=p.openings.filter(o=>o.wall!=='wr');
      p.roofs=autoRoof(p,L,{style:'hip',pitch:6,overhang:12});a.commit(p);}""")
    pg.wait_for_timeout(500)
    P=pg.evaluate("()=>window.__app.get().roofs.map(r=>[r.style,r.ridge,r.x,r.y,r.w,r.h])"); print('roofs',P)
    pg.screenshot(path=str(OUT/'t22_plan.png'))
    pg.get_by_role('button',name='3D',exact=True).click(); pg.wait_for_timeout(1500)
    cam(pg,[70,40,-40],[25,0,14]); pg.screenshot(path=str(OUT/'t22_3d.png'))
    cam(pg,[10,10,-34],[20,4,10]); pg.screenshot(path=str(OUT/'t22_porch.png'))
    # styles
    for st in ['gable','dutch','gambrel','mansard']:
        pg.evaluate("(st)=>{const a=window.__app;let p={...a.get()};p={...p,roofs:autoRoof(p,p.levels[0].id,{style:st,pitch:st==='gambrel'?5:6,overhang:12})};a.commit(p);}",st); pg.wait_for_timeout(600)
        cam(pg,[70,40,-40],[25,0,14]); pg.screenshot(path=str(OUT/f't22_{st}.png'))
    print(errs or 'no errors')
