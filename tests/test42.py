from h import *
with app(1400,900) as (pg,errs):
    r0=pg.evaluate("()=>{const p=window.__app.get();const r=makeAttic(p,p.levels[0],48);return r.err||'ok'}"); print('default roof:',r0)
    pg.evaluate("()=>{const a=window.__app;const p=a.get();a.commit({...p,roofs:p.roofs.map(r=>({...r,pitch:12}))})}")
    r=pg.evaluate("()=>{const a=window.__app;const p=a.get();const r=makeAttic(p,p.levels[0],48);if(r.err)return r.err;a.commit(r.p);a.setLevelId(r.level.id);const rm=r.p.rooms.find(x=>x.name==='Attic room');return {walls:r.walls,area:Math.round(r.area),peak:Math.round(r.peak),lv:r.level,sa:slopedArea(r.p,r.level,rm)}}"); print(r)
    print('checks',pg.evaluate("()=>{const out=[];regChecks(window.__app.get(),(...a)=>out.push(a[1].code+' '+a[2]));return out.filter(s=>/R30|R311|R502/.test(s))}"))
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(400); pg.keyboard.press('f'); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'t42_plan.png'))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1800)
    pg.select_option('select[aria-label="Section cut"]','x'); pg.wait_for_timeout(500); pg.locator('input[aria-label="Section position"]').fill('0.5'); pg.wait_for_timeout(700)
    pg.evaluate("()=>{const st=window.__view3d;const b=new THREE.Box3().setFromObject(st.model);const c=b.getCenter(new THREE.Vector3());st.camera.position.set(c.x+60,c.y+10,c.z+12);st.controls.target.set(c.x,c.y,c.z);st.controls.update();st.render();}"); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t42_3d.png'))
    print(errs or 'no errors')
