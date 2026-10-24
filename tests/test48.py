from h import *
import time,base64,sys
T0=time.time()
def log(*a): print(round(time.time()-T0,1),*a,flush=True)
with app(1500,950) as (pg,errs):
    log('loaded')
    pg.evaluate("()=>{window.__rsTestSize=[0,0,480,270]}")
    pg.evaluate("()=>window.__app.setMode('3d')"); pg.wait_for_timeout(1500); log('3d')
    if len(sys.argv)>4 and sys.argv[4]=='walk':
        pg.locator('button',has_text='Walk through').click(); pg.wait_for_timeout(500)
        pg.evaluate("()=>{const p=window.__app.get();const c=r=>{const n=r.pts.length;return r.pts.reduce((a,q)=>[a[0]+q[0]/n,a[1]+q[1]/n],[0,0]);};const L=p.rooms.find(r=>/living/i.test(r.name))||p.rooms[0];const K=p.rooms.find(r=>/kitchen/i.test(r.name))||p.rooms[1];const a=c(L),b=c(K);const st=window.__view3d;st.walk.pos={x:a[0],y:a[1]};st.walk.yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);st.walk.pitch=-0.12;placeWalkCam(st,p.levels[0]);st.render();}")
        pg.wait_for_timeout(500); log('walk set')
    pg.evaluate("()=>{[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Render').click()}"); log('clicked')
    pg.wait_for_function("()=>{const b=[...document.querySelectorAll('.rs-side button')].find(b=>b.textContent==='Render');return b&&!b.disabled}",timeout=60000)
    log('cams',pg.evaluate("()=>[...document.querySelector('#rs-cam').options].map(o=>o.text)"))
    cam=sys.argv[1] if len(sys.argv)>1 else 'street'; sky=sys.argv[2] if len(sys.argv)>2 else 'day'
    pg.select_option('#rs-sz','draft'); pg.select_option('#rs-q',sys.argv[3] if len(sys.argv)>3 else '64'); pg.select_option('#rs-cam',cam); pg.select_option('#rs-sky',sky)
    pg.evaluate("()=>{[...document.querySelectorAll('.rs-side button')].find(b=>b.textContent==='Render').click()}"); log('render clicked')
    pg.wait_for_function("()=>!document.querySelector('.rs-prog')||/finished/.test(document.querySelector('.rs-prog').textContent)||document.querySelector('.msg.err')",timeout=600000,polling=1000)
    log(pg.evaluate("()=>document.querySelector('.rs-prog')?.textContent"), pg.evaluate("()=>document.querySelector('.msg.err')?.textContent"))
    d=pg.evaluate("()=>document.querySelector('.rs-canvas').toDataURL('image/png')"); log('got image')
    open(OUT/f'render_{cam}_{sky}{"_walk" if len(sys.argv)>4 else ""}.png','wb').write(base64.b64decode(d.split(',')[1]))
    log(errs[:5])
