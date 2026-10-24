import json,re,sys
j=json.load(open(sys.argv[1]))
out={};seats={};surf=[];curbs=[]
DEF={'climber':(72,48),'spinner':(48,48),'rocker':(48,24),'musical':(36,12),'sensory':(48,12),'fitness':(60,36),'freestanding':(48,48),'accessible':(60,60),'other':(36,36),'slide':(30,180),'structure':(300,200),'shade':(240,240),'seating':(72,24),'swing':(120,72)}
def key(m):return 'gt-'+re.sub(r'[^a-z0-9]+','-',m.lower()).strip('-')
for x in j['components']:
  cat=x['category'];nm=x['name'];notes=x.get('notes') or ''
  if cat=='surfacing':surf.append({'model':x['model'],'name':nm,'url':x['url'],'notes':notes});continue
  if cat=='border':
    h=re.search(r'(\d+)"',nm);curbs.append({'model':x['model'],'name':nm,'h':int(h.group(1)) if h else 8,'url':x['url']});continue
  if cat=='swing' and re.search(r'seat|zero-g|^expression swing(?! .*frame)|tot seat',nm,re.I) and not re.search(r'frame',nm,re.I):
    seats[key(x['model'])]={'key':key(x['model']),'model':x['model'],'name':nm,'ages':x['ages'],'ada':x['ada'],'url':x['url']};continue
  c={'key':key(x['model']),'brand':'GameTime','model':x['model'],'name':nm,'line':x['line'],'cat':cat,'ages':x['ages']}
  uz=x.get('usezone_in');fp=x.get('footprint_in');fh=x.get('fall_height_in');est=False
  if fp: w,d=fp['w'],fp['d']
  elif cat=='swing':
    pm=re.search(r"(\d+)'",nm);pv=int(pm.group(1))*12 if pm else (fh or 96)
    bm=re.search(r'(\d)\s*Bay',nm,re.I);bays=int(bm.group(1)) if bm else 1
    if uz and not re.search(r'frame',nm,re.I): w,d=max(48,uz['w']-144),max(48,uz['d']-144)
    else: w=bays*120 if not uz else max(96,uz['w']-144); d=round(pv*0.75)
    c['h']=pv;est=True
    if fh is None: fh=pv
  elif uz: w,d=max(18,uz['w']-144),max(18,uz['d']-144);est=True
  else:
    w,d=DEF.get(cat,(48,48));est=True
    if cat=='slide':
      if re.search(r'spiral|helix|tower',nm,re.I): w=d=96
      else: d=round((fh or 72)*2+60)
    if cat=='seating':
      if re.search(r'round',nm,re.I): w=d=78
      elif re.search(r'picnic|table',nm,re.I): w,d=(96 if re.search('wheelchair',nm,re.I) else 72),62
  if cat=='shade':
    m=re.match(r"(\d+)' x (\d+)' x (\d+)'",nm)
    if m: w,d,c['h']=int(m.group(1))*12,int(m.group(2))*12,int(m.group(3))*12
  c['w'],c['d']=w,d
  if est and not fp: c['est']=1
  if uz: c['uz']={'w':uz['w'],'d':uz['d']}
  if fh is None and cat in ('slide','climber','accessible'): fh=72;c['deckFall']=1
  c['fall']=fh if fh is not None else 0
  if x.get('height_in'): c['h']=x['height_in']
  if x.get('capacity'): c['cap']=x['capacity']
  if x.get('ada'): c['ada']=x['ada']
  m=re.search(r'(\d+) elevated components',notes);g=re.search(r'(\d+) ground-level components',notes)
  if m: c['elevated']=int(m.group(1))
  t=re.search(r'(\d+) ground-level types',notes);ea=re.search(r'(\d+) accessible by ramp',notes)
  if t: c['groundTypes']=int(t.group(1))
  if ea: c['elevAcc']=int(ea.group(1))
  if g: c['groundEvents']=int(g.group(1))
  c['url']=x['url']
  n=re.sub(r'Published use zone \(L x W\): .*?m\)\.\s*','',notes).strip()
  if n: c['notes']=n[:400]
  out[c['key']]=c
cols={}
for s in j['colors']:
  m=re.match(r'(.*) \(#([0-9A-Fa-f]{6})\)',s)
  if m: cols[m.group(1)]=m.group(2)
J=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'))
print('/* GameTime playground catalog, from gametime.com product pages (compiled %s). Footprints marked est are estimated from the published use zone; check the GameTime CAD drawing. */'%j['meta']['compiled'])
print('Object.assign(PLAY,'+J(out)+');')
print('Object.assign(PLAY_SEATS,'+J(seats)+');')
print('PLAY_SURF_GT.push(...'+J(surf)+');')
print('PLAY_BORDERS.push(...'+J([['gtcurb'+str(c['h']),'GameTime PlayCurb %s" (#%s)'%(c['h'],c['model']),c['h'],c['url']] for c in curbs])+');')
print('const GT_COLORS='+J(cols)+';')
print('''Object.assign(PLAY_SCHEMES,{
  'gt-classic':['GameTime: Metal Blue, Plastic Yellow, Plastic Red',0x000063,0xebd72c,0x940000,0x131e80],
  'gt-earth':['GameTime: Metal Brown, Lumber Sand, Plastic Green',0x4a3318,0xdebf83,0x004511,0x61473c],
  'gt-coastal':['GameTime: Metal Ocean, Metal Vanilla, Plastic Azure',0x1f7682,0xede6d8,0x58c0c7,0x10196b],
  'gt-woodland':['GameTime: Metal Dark Green, Timber Cedar, Plastic Spring Green',0x0a3b0a,0x967957,0x6bbd3d,0x334d3c],
  'gt-bright':['GameTime: Metal Royal Purple, Plastic Orange, Metal Spring Green',0x321478,0xe36c27,0x71c740,0x7c77c9]});''')
print('registerPlayLib();')
sys.stderr.write('%d items, %d seats, %d surf, %d curbs\n'%(len(out),len(seats),len(surf),len(curbs)))
