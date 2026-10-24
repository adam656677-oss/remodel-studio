from h import *
import sys
def setup(pg):
    pg.evaluate("""()=>{const a=window.__app;let p=a.get();p={...p,settings:{...p.settings,gradeOffset:30,foundation:{finish:'brick'}}};
      const lv=p.levels[0];
      p.decks=[newDeck(lv,[[96,-96],[300,-96],[300,-2.75],[96,-2.75]],'porch'),newDeck(lv,[[300,338.75],[456,338.75],[456,468],[300,468]],'deck')];
      p.steps=[newSteps(lv,200,-96,-Math.PI/2,{deck:p.decks[0].id,landing:0,width:48,fw:48,top:-0.75})];
      a.commit(addDoorSteps(p).p);}""")
    pg.wait_for_timeout(300)
def cam(pg,pos,tgt):
    pg.evaluate("([p,t])=>{const s=window.__view3d;s.camera.position.set(...p);s.controls.target.set(...t);s.controls.update();s.render();}",[pos,tgt]); pg.wait_for_timeout(400)
if __name__=='__main__':
  with app() as (pg,errs):
    setup(pg)
    pg.get_by_role('button',name='3D',exact=True).click(); pg.wait_for_timeout(1500)
    cam(pg,[10,14,-38],[20,0,10]); pg.screenshot(path=str(OUT/'t21_front.png'))
    cam(pg,[50,8,-20],[25,2,5]); pg.screenshot(path=str(OUT/'t21_front2.png'))
    print(errs or 'no errors')
