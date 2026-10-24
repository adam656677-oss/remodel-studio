from h import *
def sheet(pg,no,name):
    svg=pg.evaluate("(no)=>sheetToSVGString(buildSheets(window.__app.get()).find(s=>s.no===no))",no)
    pg2=pg.context.new_page(); pg2.set_viewport_size({'width':1700,'height':1080}); pg2.set_content('<body style="margin:0;background:#fff">'+svg.replace('<svg','<svg style="width:1700px;height:auto"',1)+'</body>'); pg2.wait_for_timeout(300); pg2.screenshot(path=str(OUT/name)); pg2.close()
with app(1400,900) as (pg,errs):
    pg.evaluate("()=>{const a=window.__app;let p=a.get();p={...p,settings:{...p.settings,gradeOffset:24,slope:{fall:40,dir:90}}};const r=addDoorSteps(p);p=r.p||r;a.commit(p)}")
    print(pg.evaluate("()=>{const p=window.__app.get();return [gradeAt(p,0,0),gradeAt(p,480,0),(p.steps||[]).map(s=>{const i=stepsInfo(p,s);return [Math.round(i.zg),i.treads]})]}"))
    print('checks',pg.evaluate("()=>{const out=[];regChecks(window.__app.get(),(...a)=>out.push(a[2]));return out}"))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1800)
    pg.evaluate("()=>{const st=window.__view3d;const b=new THREE.Box3().setFromObject(st.model);const c=b.getCenter(new THREE.Vector3());st.camera.position.set(c.x+10,c.y+6,c.z+62);st.controls.target.set(c.x,c.y-2,c.z);st.controls.update();st.render();}"); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t35_3d.png'))
    pg.evaluate("()=>{const a=window.__app;const p=a.get();a.commit({...p,levels:p.levels.map((l,i)=>i?l:{...l,framing:{...framingOf(l),foundation:'piers'}})})}"); pg.wait_for_timeout(1500)
    pg.screenshot(path=str(OUT/'t35_piers.png'))
    sheet(pg,'A2.1','t35_elev.png'); sheet(pg,'A0.2','t35_site.png'); sheet(pg,'A3.1','t35_sec.png')
    print(errs or 'no errors')
