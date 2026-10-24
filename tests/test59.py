from h import *
import base64
with app(1500,1000) as (pg,errs):
    info=pg.evaluate("""()=>{const p=window.__app.get();const W=facadeWalls(p,p.levels[0].id)[0];const L=wlen(W.w),H=wallH(p,W.w);
      const P=[[100,700],[1100,650],[1080,250],[120,200]];const Hm=homography([[0,0],[L,0],[L,H],[0,H]],P);
      const c=document.createElement('canvas');c.width=1200;c.height=800;const g=c.getContext('2d');g.fillStyle='#87a96b';g.fillRect(0,0,1200,800);
      const quad=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach((q,i)=>{const [x,y]=hApply(Hm,q);i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.fill();};
      quad([[0,0],[L,0],[L,H],[0,H]],'#d8cbb0');quad([[48,36],[84,36],[84,84],[48,84]],'#3a5f8a');quad([[L-80,0],[L-44,0],[L-44,80],[L-80,80]],'#6b3e1f');
      return {url:c.toDataURL('image/png'),L,H,label:W.label,n:p.openings.length};}""")
    print(info['label'],info['L'],info['H'])
    pg.evaluate("()=>window.__app.setMode('capture')"); pg.wait_for_timeout(400)
    pg.get_by_role('tab',name='Trace a wall from a photo').click(); pg.wait_for_timeout(300)
    pg.locator('#fc-file').set_input_files(files=[{'name':'wall.png','mimeType':'image/png','buffer':base64.b64decode(info['url'].split(',')[1])}]); pg.wait_for_timeout(1200)
    box=pg.locator('canvas.fc-photo').bounding_box(); sc=box['width']/1200
    for (x,y) in [(100,700),(1100,650),(1080,250),(120,200)]: pg.mouse.click(box['x']+x*sc, box['y']+y*sc); pg.wait_for_timeout(100)
    pg.wait_for_timeout(1500)
    pg.locator('canvas.fc-rect').scroll_into_view_if_needed(); pg.wait_for_timeout(300); rb=pg.locator('canvas.fc-rect').bounding_box(); L,H=info['L'],info['H']
    def drag(s0,z0,s1,z1):
        X=lambda s: rb['x']+s/L*rb['width']; Y=lambda z: rb['y']+(1-z/H)*rb['height']
        pg.mouse.move(X(s0),Y(z1)); pg.mouse.down(); pg.mouse.move(X(s1),Y(z0),steps=4); pg.mouse.up(); pg.wait_for_timeout(150)
    drag(48,36,84,84)
    pg.locator('#fc-k').select_option('door'); rb=pg.locator('canvas.fc-rect').bounding_box(); drag(L-80,0,L-44,80)
    pg.screenshot(path=str(OUT/'facade.png'),full_page=True)
    pg.get_by_role('button',name='Add 2 openings to the model').click(); pg.wait_for_timeout(300)
    ops=pg.evaluate("()=>window.__app.get().openings.slice(-2).map(o=>[o.type,o.pos,o.width,o.height,o.sill])"); print(ops)
    w=ops[0]; assert w[0]=='window' and abs(w[2]-36)<2 and abs(w[3]-48)<2 and abs(w[4]-36)<2
    d=ops[1]; assert d[0]=='door' and abs(d[2]-36)<2 and abs(d[3]-80)<2
    # field mode
    pg.get_by_role('tab',name='Field mode').click(); pg.wait_for_timeout(300)
    pg.get_by_role('button',name='Punch item').click(); pg.wait_for_timeout(400)
    pg.mouse.move(700,500); pg.mouse.click(700,500); pg.wait_for_timeout(400)
    pg.locator('#fp-t').fill('Caulk tub surround'); pg.wait_for_timeout(200)
    pins=pg.evaluate("()=>window.__app.get().fieldpins"); print(pins); assert len(pins)==1 and pins[0]['cat']=='punch' and pins[0]['text']
    pg.screenshot(path=str(OUT/'pin_plan.png'))
    pg.evaluate("()=>window.__app.setMode('capture')"); pg.wait_for_timeout(300); pg.get_by_role('tab',name='Field mode').click(); pg.wait_for_timeout(300)
    pg.locator('.fv-meas input').first.fill("13'-2\""); pg.keyboard.press('Tab'); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/'fieldmode.png'),full_page=True)
    csv=pg.evaluate("()=>punchCSV(window.__app.get())"); assert 'Caulk' in csv
    ok=pg.evaluate("async()=>{const b=await punchPDF(window.__app.get(),window.__app.get().fieldpins);return b.size>1000;}"); assert ok
    print('errors',errs[:3]); assert not errs; print('PASS')
