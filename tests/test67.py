# layout templates: kitchens and a bath dropped into a room, cabinets back to the wall and inside the room
from h import *
with app(1600,1000,mode='design') as (pg,errs):
    pg.wait_for_timeout(1200)
    r=pg.evaluate("""()=>{const out={};const base=window.__app.get();
      const k=base.rooms.find(r=>r.use==='kitchen')||base.rooms[0];const b=base.rooms.find(r=>r.use==='bath');
      for(const kind of ['one','L','Lisl','U','galley','bath5']){const room=kind==='bath5'?b:k;const R=layoutTemplate(base,room,kind);const add=R.p.fixtures.slice(base.fixtures.length);
        const inside=add.every(f=>inPoly(f.x,f.y,room.pts));const kinds={};for(const f of add)kinds[f.type]=(kinds[f.type]||0)+1;
        // nothing overlaps in the same tier
        let ov=0;for(let i=0;i<add.length;i++)for(let j=i+1;j<add.length;j++){const A=add[i],B=add[j];if(((A.elev||0)>=48)!==((B.elev||0)>=48))continue;const ca=fxCorners(A),cb=fxCorners(B);const bx=q=>({x0:Math.min(...q.map(c=>c.x)),x1:Math.max(...q.map(c=>c.x)),y0:Math.min(...q.map(c=>c.y)),y1:Math.max(...q.map(c=>c.y))});const a=bx(ca),c=bx(cb);const ox=Math.min(a.x1,c.x1)-Math.max(a.x0,c.x0),oy=Math.min(a.y1,c.y1)-Math.max(a.y0,c.y0);if(ox>1&&oy>1)ov++;}
        out[kind]={n:R.n,inside,kinds,ov,msg:R.msg};}
      return out;}""")
    for k,v in r.items(): print(k,v)
    assert all(r[k]['kinds'].get('sinkbase')==1 for k in ['one','L','U','galley']) and r['one']['n']>=4 and r['L']['n']>r['one']['n'] and r['U']['n']>=r['L']['n'] and r['bath5']['kinds'].get('toilet')==1
    for k,v in r.items(): assert v['inside'] and v['ov']==0, k
    pg.evaluate("()=>{const p=window.__app.get();const k=p.rooms.find(r=>r.use==='kitchen');window.__app.commit(layoutTemplate(p,k,'L').p);}")
    pg.wait_for_timeout(1500); pg.screenshot(path=str(OUT/'t67.png'))
    print('errors',errs[:3]); assert not errs; print('PASS')
