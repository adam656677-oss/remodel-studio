import json,re
S='/tmp/claude-0/-home-claude/58317c86-cc15-508f-a16e-60ca34b4a5fd/scratchpad/'
c=json.load(open(S+'vendors_cabinets.json')); pr=json.load(open(S+'vendors_products.json'))
cabs=[]
for b in c['brands']:
    b=dict(b)
    for d in b['doors']:
        if d.get('kind')=='cathedral/arch': d['kind']='cathedral'
    cabs.append(b)
def unv(x): return 'unverified' in str(x.get('status',''))
def item(x):
    if isinstance(x,str): return {'name':x}
    o={'name':x.get('name','')}
    notes=[]
    for k in ('frame','material','type','texture','panels'):
        if isinstance(x.get(k),str): notes.append(x[k])
    for k in ('ops','types','textures'):
        if isinstance(x.get(k),list) and all(isinstance(t,str) for t in x[k]): notes.append(', '.join(x[k]))
    if x.get('notes'): notes.append(str(x['notes']))
    if notes: o['notes']='. '.join(notes)
    cols=x.get('colors')
    if isinstance(cols,list):
        o['colors']=[cc if isinstance(cc,str) else cc.get('name') for cc in cols]+[cc for cc in (x.get('regionalColors') or []) if isinstance(cc,str)]
    if unv(x): o['unv']=True
    return o
prod={}
for cat in ['windows','extDoors','intDoors','roofing','siding','flooring','countertops','plumbing']:
    out=[]
    for b in pr.get(cat,[]):
        nb={'brand':b['brand']}
        arr=b.get('series') or b.get('collections') or b.get('styles') or b.get('lines') or b.get('products') or []
        if cat=='countertops': nb['colors']=[x if isinstance(x,str) else x.get('name') for x in b.get('colors',[])]; arr=[{'name':n} for n in nb['colors']]
        nb['series']=[item(x) for x in arr]
        if not nb['series'] and b.get('types'): nb['series']=[{'name':t} for t in b['types']]
        cols=[]
        if isinstance(b.get('colors'),list) and cat!='countertops': cols=[x if isinstance(x,str) else x.get('name') for x in b['colors']]
        for k,v in (b.get('colorCollections') or {}).items():
            if isinstance(v,list): cols+= [x if isinstance(x,str) else x.get('name') for x in v]
        if cols: nb['colors']=cols
        for k in ('material','notes','parent','soldAt'):
            if b.get(k): nb[k]=b[k]
        src=[s for s in ([b.get('source')] if isinstance(b.get('source'),str) else [])+list(b.get('sources') or []) if isinstance(s,str) and s.startswith('http')]
        if src: nb['sources']=src
        if unv(b) or (nb['series'] and all(s.get('unv') for s in nb['series'])): nb['unv']=True
        out.append(nb)
    prod[cat]=out
a=pr['appliances']
types=[{'name':s['type']+(' '+'/'.join(str(w)+'"' for w in s.get('widths',[])) if s.get('widths') else ''),'notes':'; '.join(f"{k.replace('_in','')}: {v}" for k,v in s.items() if k not in('type','widths'))} for s in a['standards']]
prod['appliances']=[{'brand':br,'series':types,'unv':True,'notes':a['notes']} for br in a['brands']]
paint=[]
for b in pr['paint']:
    paint.append({'brand':b['brand'],'colors':[{k:v for k,v in col.items() if k in('name','code','hex','lrv')} for col in b['colors'] if col.get('hex')],'sources':[s for s in [b.get('source')] if isinstance(s,str) and s.startswith('http')]})
prod['paint']=paint
meta={'compiled':'2026-10-23','energyStar':pr['_meta'].get('energyStarV7'),'plumbing':pr.get('plumbingNotes'),'cabGaps':c['meta'].get('coverage_gaps')}
js='/* vendor catalogs compiled Oct 2026 from manufacturer websites and catalogs. Entries marked unv were not re-checked; confirm with the dealer. */\n'
js+='var VENDOR_CABS='+json.dumps(cabs,ensure_ascii=False,separators=(',',':'))+';\nvar VENDOR_PRODUCTS='+json.dumps(prod,ensure_ascii=False,separators=(',',':'))+';\nvar VENDOR_META='+json.dumps(meta,ensure_ascii=False,separators=(',',':'))+';\n'
open('/home/claude/remodel-studio/src/086c-vendor-data.js','w').write(js)
print(len(cabs),'cab brands',sum(len(b['doors']) for b in cabs),'doors')
for k,v in prod.items(): print(k,len(v),[ (x['brand'],len(x.get('series',[])),len(x.get('colors',[]))) for x in v][:8])
print(len(js)//1024,'KB')
