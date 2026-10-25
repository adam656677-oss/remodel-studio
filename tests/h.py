# shared test harness: from h import *; with app() as (pg,errs): ...
import sys, pathlib, contextlib, json
from playwright.sync_api import sync_playwright
D = pathlib.Path('/tmp/claude-0/-home-claude/58317c86-cc15-508f-a16e-60ca34b4a5fd/scratchpad/deps/node_modules')
OUT = pathlib.Path('/tmp/claude-0/-home-claude/58317c86-cc15-508f-a16e-60ca34b4a5fd/scratchpad/shots'); OUT.mkdir(exist_ok=True)
MAP = {'react.production.min.js': D/'react/umd/react.production.min.js','react-dom.production.min.js': D/'react-dom/umd/react-dom.production.min.js',
 'htm.umd.js': D/'htm/dist/htm.umd.js','three.min.js': D/'three/build/three.min.js','OrbitControls.js': D/'three/examples/js/controls/OrbitControls.js',
 'fflate@0.7.4/umd/index.js':D/'fflate/umd/index.js','jspdf.umd.min.js':D/'jspdf/dist/jspdf.umd.min.js','pdf.js/3.11.174/pdf.min.js':D/'pdfjs-dist/build/pdf.min.js','pdf.js/3.11.174/pdf.worker.min.js':D/'pdfjs-dist/build/pdf.worker.min.js','xlsx/0.18.5/xlsx.full.min.js':D/'xlsx/dist/xlsx.full.min.js'}
for n in ['GLTFExporter.js','USDZExporter.js','STLExporter.js','OBJExporter.js']: MAP['exporters/'+n]=D/'three/examples/js/exporters'/n
for n in ['GLTFLoader.js','ColladaLoader.js','STLLoader.js']: MAP['loaders/'+n]=D/'three/examples/js/loaders'/n
def page_html():
    src = pathlib.Path('/home/claude/remodel-studio/index.html').read_text()
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + src + '</body></html>'
@contextlib.contextmanager
def app(w=1400,h=900,scheme='light',project=None,mode='split'):
    html=page_html()
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=b.new_context(viewport={'width':w,'height':h},color_scheme=scheme,accept_downloads=True); pg=ctx.new_page(); errs=[]
        pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type=='error' and 'ERR_FAILED' not in m.text else None)
        pg.on('pageerror', lambda e: errs.append(f'pageerror: {e}'))
        def route(r):
            u=r.request.url
            for k,f in MAP.items():
                if u.endswith(k): return r.fulfill(path=str(f), content_type='application/javascript')
            if 'fonts.g' in u: return r.abort()
            if u.startswith('http://app.local'): return r.fulfill(body=html, content_type='text/html')
            return r.continue_()
        pg.route('**/*', route)
        if mode: pg.add_init_script("try{if(!sessionStorage.getItem('rs-t-mode')){localStorage.setItem('remodel-studio:mode',%s);sessionStorage.setItem('rs-t-mode','1');}}catch(e){}"%json.dumps(mode))
        if project is not None:
            pg.add_init_script("localStorage.setItem('remodel-studio:project', %s)"%json.dumps(json.dumps(project)))
        pg.goto('http://app.local/'); pg.wait_for_timeout(1200)
        try: yield pg,errs
        finally: b.close()
def w2s(pg,x,y):
    return pg.evaluate("([x,y])=>{const v=window.__planView.view;const r=window.__planView.svg.current.getBoundingClientRect();return [r.left+x*v.s+v.tx,r.top+y*v.s+v.ty];}",[x,y])
def click_w(pg,x,y,**kw):
    sx,sy=w2s(pg,x,y); pg.mouse.click(sx,sy,**kw); pg.wait_for_timeout(120)
def proj(pg):
    return pg.evaluate("()=>JSON.parse(localStorage.getItem('remodel-studio:project'))")
def pick_tool(pg,tool_id):
    pg.evaluate("(id)=>window.__setTool&&window.__setTool(id)",tool_id); pg.wait_for_timeout(150)

def file_menu(pg,sub,item):
    """File > (Import|Export) > item, for the 2.2 submenus"""
    pg.get_by_role('button',name='File').click(); pg.wait_for_timeout(200)
    pg.locator('.menupop >> text='+sub).first.hover(); pg.wait_for_timeout(300)
    pg.locator('.submenu >> text='+item).first.click(); pg.wait_for_timeout(300)
