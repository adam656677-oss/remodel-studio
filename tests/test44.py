from h import *
def sheet(pg,title,name):
    svg=pg.evaluate("(t)=>{const s=buildSheets(window.__app.get()).find(s=>s.title.includes(t));return s?sheetToSVGString(s):null}",title)
    if not svg: print('no sheet',title); return
    pg2=pg.context.new_page(); pg2.set_viewport_size({'width':1700,'height':1080}); pg2.set_content('<body style="margin:0;background:#fff">'+svg.replace('<svg','<svg style="width:1700px;height:auto"',1)+'</body>'); pg2.wait_for_timeout(300); pg2.screenshot(path=str(OUT/name)); pg2.close()
with app(1400,900) as (pg,errs):
    pg.evaluate("()=>{const a=window.__app;const p=a.get();a.commit({...p,rooms:p.rooms.map(r=>r.use==='kitchen'?{...r,tile:{splash:'18',mat:'subway'}}:r.use==='bath'?{...r,tile:{surround:'84',wains:'42',mat:'large',wainsMat:'beadboard'}}:r)})}")
    print(pg.evaluate("()=>{const p=window.__app.get();return p.rooms.filter(r=>r.tile).map(r=>[r.name,tileZones(p,r).map(z=>z.kind+' '+Math.round(z.s1-z.s0)+'x'+Math.round(z.z1-z.z0)+' '+z.area.toFixed(1))])}"))
    print(pg.evaluate("()=>takeoff(window.__app.get(),{waste:0.1}).filter(r=>/Tile|Wall finishes/.test(r.cat)).map(r=>r.item+' '+r.qty+r.unit)"))
    sheet(pg,'Kitchen and bath elevations','t44_elev.png')
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500); pg.get_by_role('button',name='Walk through').click(); pg.wait_for_timeout(800)
    for nm,x,y,yaw in [('kitchen',240,200,3.14),('bath',360,230,1.0)]:
        pg.evaluate("([x,y,yaw])=>{const st=window.__view3d;st.walk.pos={x,y};st.walk.yaw=yaw;st.walk.pitch=-0.1;placeWalkCam(st,window.__app.get().levels[0]);st.render();}",[x,y,yaw]); pg.wait_for_timeout(600)
        pg.screenshot(path=str(OUT/f't44_{nm}.png'))
    print(errs or 'no errors')
