import json
d=json.load(open('/tmp/claude-0/-home-claude/58317c86-cc15-508f-a16e-60ca34b4a5fd/scratchpad/appl/appliances.json'))
keep=['brand','model','type','subtype','label','w','h','d','cutout','clear','fuel','elec','price','url','cfm','notes']
out=[{k:m.get(k) for k in keep if m.get(k) is not None} for m in d['models']]
js='/* Appliance models with published sizes, cut-outs and clearances, gathered Oct 2026 from manufacturer and retailer spec pages (url on each). Confirm with the current install guide before cutting cabinets. */\nconst APPL_DATA='+json.dumps(out,separators=(',',':'),ensure_ascii=False).replace('</','<\\/')+';\n'
open('/home/claude/remodel-studio/src/086f-appliance-data.js','w').write(js);print(len(js))
