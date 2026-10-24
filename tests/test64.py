# decor library: hundreds of items in many categories, every 3D builder renders, plan symbols, flat-item pictures
from h import *
with app(1400,900) as (pg,errs):
    r=pg.evaluate("""async()=>{const items=LIB.filter(x=>x.model);const cats={};for(const it of items)cats[it.cat]=(cats[it.cat]||0)+1;
      const models=[...new Set(items.map(x=>x.model))];const bad=[];
      // build every model in a scene and draw its plan symbol
      for(const k of models){const it=items.find(x=>x.model===k);
        const fx={id:'t',level:'L',type:it.base,lib:it.id,name:it.label,x:0,y:0,w:it.w,d:it.d,h:it.h,elev:it.elev||0,rot:0};let n=0;
        try{const ok=fixtureModel3D(fx,{elevation:0,height:96},(g)=>{n++;g.dispose();return {};},(k2,c,o)=>({}),false,{},0);if(!ok||!n)bad.push(k+':empty');}catch(e){bad.push(k+':'+e.message);}
        try{const s=fxPlanSymbol(fx,(x,y)=>[x,y],'fx');if(!s||!s.length)bad.push(k+':nosym');}catch(e){bad.push(k+':sym '+e.message);}}
      const rug=items.find(x=>x.model==='rug');const u=await requestPic('lib',rug,null,{w:120,h:90});
      return {n:items.length,cats,models:models.length,bad,rugPic:!!u};}""")
    print(r['n'],r['models'],r['cats'],r['bad'][:10],r['rugPic'])
    assert r['n']>=900 and r['models']>=80 and not r['bad'] and r['rugPic']
    for c in ['Living room','Bedroom','Dining room','Office','Bath accessories','Lighting and fans','Indoor plants','Outdoor living','People and pets']: assert r['cats'].get(c,0)>=5, c
    # place a sofa and a ceiling fan in the model and see them in 3D
    pg.evaluate("""()=>{const p=window.__app.get();const lv=p.levels[0].id;const mk=id=>{const it=LIB_BY_ID[id];return {id:uid('fx'),level:lv,type:it.base,lib:it.id,name:it.label,x:120,y:80,w:it.w,d:it.d,h:it.h,elev:it.elev||0,rot:0,status:'new'};};
      window.__app.commit({...p,fixtures:[...p.fixtures,mk('dc-sofa-track-84-gray'),{...mk('dc-fan-52-matteblack'),x:150,y:60}]});}""")
    pg.wait_for_timeout(1500); pg.screenshot(path=str(OUT/'t64.png'))
    t=pg.evaluate("()=>takeoff(window.__app.get(),{waste:0}).filter(x=>/sofa|fan/i.test(x.item)).map(x=>x.item)"); print(t)
    print('errors',errs[:3]); assert not errs; print('PASS')
