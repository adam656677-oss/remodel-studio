#!/usr/bin/env python3
"""Assemble index.html (artifact page) and github/index.html (standalone) from src/."""
import glob, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
head=open('src/head.html').read(); css=open('src/style.css').read(); markup=open('src/markup.html').read()
js=''.join(open(f).read() for f in sorted(glob.glob('src/*.js')))
eng=open('render-engine/rs-render-engine.js').read().replace('</script','<\\/script')
page=head+'<style>'+css+'</style>'+markup+'<script type="text/plain" id="rs-render-engine">'+eng+'</script>'+"<script>\n"+js+"</script>\n"
open('index.html','w').write(page)
os.makedirs('github',exist_ok=True)
t_end=page.index('</style>')+len('</style>')
std='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+page[:t_end]+'\n</head>\n<body>\n'+page[t_end:]+'\n</body>\n</html>\n'
open('github/index.html','w').write(std)
print('built', len(page), 'bytes')

# Offline copy: every library built in, so it opens without internet (fonts fall back to system fonts).
D='/tmp/claude-0/-home-claude/58317c86-cc15-508f-a16e-60ca34b4a5fd/scratchpad/deps/node_modules/'
if os.path.isdir(D):
  core={'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js':'react/umd/react.production.min.js',
   'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js':'react-dom/umd/react-dom.production.min.js',
   'https://unpkg.com/htm@3.1.1/dist/htm.umd.js':'htm/dist/htm.umd.js','https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js':'three/build/three.min.js',
   'https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/controls/OrbitControls.js':'three/examples/js/controls/OrbitControls.js'}
  lazy={'https://cdn.jsdelivr.net/npm/fflate@0.7.4/umd/index.js':'fflate/umd/index.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js':'jspdf/dist/jspdf.umd.min.js'}
  lazy['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js']='pdfjs-dist/build/pdf.min.js'
  lazy['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js']='xlsx/dist/xlsx.full.min.js'
  for n in ['GLTFExporter','USDZExporter','STLExporter','OBJExporter']:lazy['https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/exporters/%s.js'%n]='three/examples/js/exporters/%s.js'%n
  esc=lambda t:t.replace('</script','<\\/script')
  off=std
  for url,path in core.items():off=off.replace('<script src="%s"></script>'%url,'<script>'+esc(open(D+path).read())+'</script>')
  wk='<script type="text/plain" id="pdfjs-worker">'+esc(open(D+'pdfjs-dist/build/pdf.worker.min.js').read())+'</script>'
  pre=wk+'<script>window.__inlinedLibs='+repr(list(lazy.keys())).replace("'",'"')+';</script>'+''.join('<script>'+esc(open(D+p).read())+'</script>' for p in lazy.values())
  off=off.replace('<script>\n'+js[:40],pre+'<script>\n'+js[:40],1)
  assert 'cdnjs.cloudflare.com/ajax/libs/react/' not in off.split('<script>')[0]
  open('github/Remodel Studio offline.html','w').write(off)
  print('offline', len(off), 'bytes')
