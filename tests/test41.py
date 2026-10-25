from h import *
def sheet(pg,no,name):
    svg=pg.evaluate("(no)=>sheetToSVGString(buildSheets(window.__app.get()).find(s=>s.no===no))",no)
    pg2=pg.context.new_page(); pg2.set_viewport_size({'width':1700,'height':1080}); pg2.set_content('<body style="margin:0;background:#fff">'+svg.replace('<svg','<svg style="width:1700px;height:auto"',1)+'</body>'); pg2.wait_for_timeout(300); pg2.screenshot(path=str(OUT/name)); pg2.close()
with app(1400,900) as (pg,errs):
    P=pg.evaluate("()=>{const P=panelSchedule(window.__app.get());return [P.circuits.map(c=>c.space+' '+c.desc+' '+c.amps+'A '+c.prot),P.spaces,P.size,P.lsum,P.rsum]}"); print(P)
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(300); pg.keyboard.press('f'); pg.wait_for_timeout(300)
    for tool,pts in [('pipedwv',[(440,280),(440,320),(250,320)]),('pipecw',[(430,300),(300,300)]),('ductsup',[(240,170),(120,170),(120,60)]),('ductret',[(300,200),(360,200)])]:
        pg.evaluate("(t)=>window.__app.setTool(t)",tool); pg.wait_for_timeout(150)
        for x,y in pts: click_w(pg,x,y)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
    print(pg.evaluate("()=>{const p=window.__app.get();return [(p.pipes||[]).map(o=>o.sys+' '+o.size+' '+o.pts.length),(p.ducts||[]).map(o=>o.sys+' '+o.size)]}"))
    pg.keyboard.press('Escape'); pg.screenshot(path=str(OUT/'t41_plan.png'))
    print(pg.evaluate("()=>takeoff(window.__app.get(),{waste:0.1}).filter(r=>/Plumbing|HVAC/.test(r.cat)).map(r=>r.item+' '+r.qty+r.unit)"))
    pg.evaluate("()=>window.__app.setMode('systems')"); pg.wait_for_timeout(400); pg.get_by_role('tab',name='Electrical service').click(); pg.wait_for_timeout(400); pg.screenshot(path=str(OUT/'t41_panel.png'),full_page=True)
    sheet(pg,'E0.1','t41_sheet.png')
    pg.evaluate("()=>window.__app.setMode('build')"); pg.wait_for_timeout(400); pg.get_by_role('tab',name='Job schedule').click(); pg.wait_for_timeout(400)
    with pg.expect_download(timeout=30000) as dl: pg.get_by_role('button',name='Proposal PDF').click()
    d=dl.value; d.save_as(str(OUT/'t41_proposal.pdf')); print('pdf',d.suggested_filename)
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500); pg.get_by_role('button',name='Show roof').click(); pg.wait_for_timeout(1000)
    pg.evaluate("()=>{const st=window.__view3d;const b=new THREE.Box3().setFromObject(st.model);const c=b.getCenter(new THREE.Vector3());st.camera.position.set(c.x+4,c.y+30,c.z+26);st.controls.target.set(c.x,c.y-3,c.z);st.controls.update();st.render();}"); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t41_3d.png'))
    print(errs or 'no errors')
