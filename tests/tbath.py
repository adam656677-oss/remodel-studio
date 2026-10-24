from h import *
with app() as (pg,errs):
    r=pg.evaluate("""()=>{const out={};for(const [k] of BATH_TEMPLATES){let p=window.__app.get();p={...p,settings:{...p.settings,codeSet:'ada'}};const lv=p.levels[0].id;
      const ids=new Set(['walls','openings','fixtures','rooms'].flatMap(k=>(p[k]||[]).map(o=>o.id)));const q=placeBlock(p,lv,bathTemplate(k),{x:900,y:150}).p;const iss=runChecks(q).filter(i=>i.target&&!ids.has(i.target.id));out[k]=iss.map(i=>i.code+' '+i.title+' | '+(i.detail||'').slice(0,120));}return out;}""")
    for k,v in r.items(): print(k,json.dumps(v,indent=1))
    print(errs)
