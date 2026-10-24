import json,sys
d=json.load(open('/tmp/claude-0/-home-claude/58317c86-cc15-508f-a16e-60ca34b4a5fd/scratchpad/km/kraftmaid.json'))
def n(v): return v if v is not None else 0
out={'meta':{'source':d['meta']['source'],'pages':d['meta']['pages'],'counts':d['meta']['counts']},
 'doors':[[x['name'],x.get('overlay') or '',[[c['code'],c.get('material') or '',c.get('profile') or '',c.get('overlay') or ''] for c in x['codes']],x.get('page',0),[f for f in x.get('features',[])][:6]] for x in d['doorStyles']],
 'fins':[[x['name'],x.get('code') or '',x.get('type') or '',x.get('collection') or '',x.get('species') or [],x.get('doorStyles') or [],x.get('page',0)] for x in d['finishes']],
 'mods':[[m['code'],m['name'],m['kind'],m.get('description',''),m.get('upcharge') or '',m.get('pageLabel') or str(m.get('page',''))] for m in d['mods']],
 'up':[[u.get('item'),u.get('category'),u.get('code') or '',u.get('percent')] for u in d['upchargeGuide']],
 'prods':[]}
for p in d['products']:
    sk=[]
    for s in p['skus']:
        sk.append([s['sku'],n(s['w']),n(s['h']),n(s['d']),1 if s['hinge'] else 0,s.get('orderPattern') or 0,s.get('note') or 0,1 if s.get('dimSource') else 0])
    out['prods'].append([p['section'],p['sub'],p['title'],p['type'],p.get('pageLabel') or str(p.get('page','')),' · '.join(p.get('features',[])[:5])[:400],p.get('options') or [],sk])
js='/* KraftMaid (Lowe\'s) 2022 Specification Book, parsed Oct 2026 for planning and ordering. The book prints no prices. Confirm SKUs and options with the dealer before ordering. */\nconst KM_DATA='+json.dumps(out,separators=(',',':'),ensure_ascii=False).replace('</','<\\/')+';\n'
open('/home/claude/remodel-studio/src/086e-kraftmaid-data.js','w').write(js)
print(len(js))
