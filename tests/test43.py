from h import *
with app(1400,900) as (pg,errs):
    r=pg.evaluate("""()=>{const a=window.__app;const p=a.get();const r=makeBasement(p);if(r.err)return r.err;let q=r.p;const b=r.level;
      const w=q.walls.filter(x=>x.level===b.id).sort((x,y)=>wlen(y)-wlen(x))[0];
      q={...q,openings:[...q.openings,{id:'opw1',wall:w.id,type:'window',pos:wlen(w)/2,width:36,height:48,sill:44,operation:'casement',status:'new'}],rooms:q.rooms.map(rm=>rm.level===b.id?{...rm,use:'bedroom',name:'Basement bedroom'}:rm)};
      a.commit(q);a.setLevelId(b.id);const G=wellOf(q,q.openings.find(o=>o.id==='opw1'));return {b,G:G&&{W:G.W,P:G.P,depth:Math.round(G.depth),ladder:G.ladder,area:G.area.toFixed(1)},grade:gradeAt(q,0,0),ground:groundLevel(q).name}}"""); print(r)
    print('checks',pg.evaluate("()=>{const out=[];regChecks(window.__app.get(),(...a)=>out.push((a[1]?a[1].code:'')+' '+a[2]));return out}"))
    print(pg.evaluate("()=>takeoff(window.__app.get(),{waste:0.1}).filter(r=>/well|Well|ladder/.test(r.item)).map(r=>r.item)"))
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.wait_for_timeout(400); pg.keyboard.press('f'); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'t43_plan.png'))
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1800)
    pg.evaluate("()=>{const st=window.__view3d;const b=new THREE.Box3().setFromObject(st.model);const c=b.getCenter(new THREE.Vector3());st.camera.position.set(c.x+30,c.y+20,c.z-45);st.controls.target.set(c.x,c.y-6,c.z);st.controls.update();st.render();}"); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t43_3d.png'))
    print(errs or 'no errors')
