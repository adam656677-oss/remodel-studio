from h import *
def sheet(pg,no,name):
    svg=pg.evaluate("(no)=>sheetToSVGString(buildSheets(window.__app.get()).find(s=>s.no===no))",no)
    pg2=pg.context.new_page(); pg2.set_viewport_size({'width':1700,'height':1080}); pg2.set_content('<body style="margin:0;background:#fff">'+svg.replace('<svg','<svg style="width:1700px;height:auto"',1)+'</body>'); pg2.wait_for_timeout(300); pg2.screenshot(path=str(OUT/name)); pg2.close()
with app(1400,900) as (pg,errs):
    pg.evaluate("""()=>{const a=window.__app;let p=a.get();const lv=p.levels[0].id;p={...p,settings:{...p.settings,gradeOffset:24,slope:{fall:60,dir:90}},
      site:[...(p.site||[]),{id:'wk1',level:lv,type:'walk',pts:[[60,360],[60,600],[400,640]],w:42,surf:'concrete',status:'new'},{id:'dr1',level:lv,type:'drive',pts:[[520,0],[640,0],[640,700],[520,700]],surf:'concrete',status:'new'}],
      decks:[...(p.decks||[]),{id:'dk1',level:lv,kind:'deck',pts:[[480,100],[620,100],[620,240],[480,240]],top:-1.5,status:'new'}]};a.commit(p)}""")
    print(pg.evaluate("()=>{const p=window.__app.get();const d=deckInfo(p,p.decks.find(d=>d.id==='dk1'));return [d.railReq,d.edges.map(e=>[e.house,Math.round(e.drop)]),d.railSegs.length, siteSlopes(p,p.site.find(s=>s.id==='wk1')).map(s=>s.pct.toFixed(1)), outlineSides(p).map(s=>s.uphill), downspouts(p).length]}"))
    print('checks',pg.evaluate("()=>{const out=[];regChecks(window.__app.get(),(...a)=>out.push(a[1].code+' '+a[2]));return out}"))
    sheet(pg,'A0.2','t36_site.png')
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1800)
    pg.evaluate("()=>{const st=window.__view3d;const b=new THREE.Box3().setFromObject(st.model);const c=b.getCenter(new THREE.Vector3());st.camera.position.set(c.x+60,c.y+25,c.z+55);st.controls.target.set(c.x,c.y-4,c.z);st.controls.update();st.render();}"); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t36_3d.png'))
    print(errs or 'no errors')
