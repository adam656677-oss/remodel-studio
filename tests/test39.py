from h import *
def sheet(pg,no,name):
    svg=pg.evaluate("(no)=>sheetToSVGString(buildSheets(window.__app.get()).find(s=>s.no===no))",no)
    pg2=pg.context.new_page(); pg2.set_viewport_size({'width':1700,'height':1080}); pg2.set_content('<body style="margin:0;background:#fff">'+svg.replace('<svg','<svg style="width:1700px;height:auto"',1)+'</body>'); pg2.wait_for_timeout(300); pg2.screenshot(path=str(OUT/name)); pg2.close()
with app(1400,900) as (pg,errs):
    info=pg.evaluate("""()=>{const a=window.__app;const p=a.get();const wins=p.openings.filter(o=>o.type==='window'&&p.walls.find(w=>w.id===o.wall)?.kind==='exterior');
      const bigs=wins.slice().sort((x,y)=>y.width-x.width);const k=['bay45','bow','box'];const ids=bigs.slice(0,3).map(o=>o.id);
      a.commit({...p,openings:p.openings.map(o=>{const i=ids.indexOf(o.id);return i>=0?{...o,width:Math.max(o.width,i===2?36:72),bay:{kind:k[i]}}:o})});return bigs.slice(0,3).map(o=>[o.id,o.width,o.wall])}""")
    print(info)
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(400); pg.keyboard.press('f'); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'t39_plan.png'))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1800)
    pg.evaluate("()=>{const st=window.__view3d;const b=new THREE.Box3().setFromObject(st.model);const c=b.getCenter(new THREE.Vector3());st.camera.position.set(c.x-30,c.y+12,c.z+48);st.controls.target.set(c.x,c.y-3,c.z);st.controls.update();st.render();}"); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t39_3d.png'))
    pg.evaluate("()=>{const st=window.__view3d;const b=new THREE.Box3().setFromObject(st.model);const c=b.getCenter(new THREE.Vector3());st.camera.position.set(c.x+30,c.y+12,c.z-48);st.controls.target.set(c.x,c.y-3,c.z);st.controls.update();st.render();}"); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t39_3db.png'))
    sheet(pg,'A2.1','t39_elev.png')
    print(pg.evaluate("()=>takeoff(window.__app.get(),{waste:0.1}).filter(r=>/Bay|bay|Bow|Garden/.test(r.item)).map(r=>r.item)"))
    print(errs or 'no errors')
