from h import *
with app(1400,900) as (pg,errs):
    pg.evaluate("""()=>{const a=window.__app;const p=a.get();const lv=p.levels[0].id;const L=id=>LIB_BY_ID[id];
      const items=[['f-queenbed',380,60,0],['f-nightstand',335,20,0],['f-dresser',430,150,180],['f-sofa84',120,40,0],['f-coffeetable',120,100,0],['f-tvconsole',120,160,180],['f-bookcase',30,100,90]];
      const fx=[];for(const [id,x,y,r] of items){const it=L(id);if(it)fx.push(newFixture(it.id,lv,x,y,r));else console.log('missing',id);}
      const dt=Object.values(LIB_BY_ID).find(x=>/Dining table 60/.test(x.label));fx.push(newFixture(dt.id,lv,330,260,0));
      const car=Object.values(LIB_BY_ID).find(x=>/^Car/.test(x.label));fx.push(newFixture(car.id,lv,620,200,0));
      const wsh=Object.values(LIB_BY_ID).find(x=>x.base==='washer');fx.push(newFixture(wsh.id,lv,500,320,180));
      a.commit({...p,fixtures:[...p.fixtures,...fx]});}""")
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500)
    pg.get_by_role('button',name='Show roof').click(); pg.wait_for_timeout(1200)
    pg.evaluate("()=>{const st=window.__view3d;const b=new THREE.Box3().setFromObject(st.model);const c=b.getCenter(new THREE.Vector3());st.camera.position.set(c.x+5,c.y+28,c.z+30);st.controls.target.set(c.x,c.y-3,c.z);st.controls.update();st.render();}"); pg.wait_for_timeout(600)
    pg.screenshot(path=str(OUT/'t38_furn.png'))
    pg.evaluate("()=>{const st=window.__view3d;st.camera.position.set(22,12,-6);st.controls.target.set(30,0,5);st.controls.update();st.render();}"); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT/'t38_furn2.png'))
    print(errs or 'no errors')
