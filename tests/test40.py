from h import *
def sheet(pg,no,name):
    svg=pg.evaluate("(no)=>sheetToSVGString(buildSheets(window.__app.get()).find(s=>s.no===no))",no)
    pg2=pg.context.new_page(); pg2.set_viewport_size({'width':1700,'height':1080}); pg2.set_content('<body style="margin:0;background:#fff">'+svg.replace('<svg','<svg style="width:1700px;height:auto"',1)+'</body>'); pg2.wait_for_timeout(300); pg2.screenshot(path=str(OUT/name)); pg2.close()
with app(1400,900) as (pg,errs):
    pg.evaluate("""()=>{const a=window.__app;const p=a.get();const g=['colonial','prairie','craftsman','diamond'];let i=0;
      a.commit({...p,openings:p.openings.map(o=>{if(o.type!=='window')return o;const k=g[i%4];const top=i===1?'arch':i===2?'eyebrow':null;i++;return {...o,grille:k,top};})})}""")
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1800)
    pg.evaluate("()=>{const st=window.__view3d;const b=new THREE.Box3().setFromObject(st.model);const c=b.getCenter(new THREE.Vector3());st.camera.position.set(c.x+8,c.y+4,c.z+40);st.controls.target.set(c.x,c.y-1,c.z);st.controls.update();st.render();}"); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t40_3d.png'))
    pg.evaluate("()=>{const st=window.__view3d;const b=new THREE.Box3().setFromObject(st.model);const c=b.getCenter(new THREE.Vector3());st.camera.position.set(c.x-8,c.y+4,c.z-40);st.controls.target.set(c.x,c.y-1,c.z);st.controls.update();st.render();}"); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t40_3db.png'))
    sheet(pg,'A2.1','t40_elev.png')
    print(errs or 'no errors')
