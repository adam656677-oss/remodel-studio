import sys, pathlib
from playwright.sync_api import sync_playwright
D = pathlib.Path('/tmp/claude-0/-home-claude/58317c86-cc15-508f-a16e-60ca34b4a5fd/scratchpad/deps/node_modules')
OUT = pathlib.Path('/tmp/claude-0/-home-claude/58317c86-cc15-508f-a16e-60ca34b4a5fd/scratchpad/shots'); OUT.mkdir(exist_ok=True)
MAP = {
 'react.production.min.js': D/'react/umd/react.production.min.js',
 'react-dom.production.min.js': D/'react-dom/umd/react-dom.production.min.js',
 'htm.umd.js': D/'htm/dist/htm.umd.js',
 'three.min.js': D/'three/build/three.min.js',
 'OrbitControls.js': D/'three/examples/js/controls/OrbitControls.js',
}
src = pathlib.Path('/home/claude/remodel-studio/index.html').read_text()
page_html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + src + '</body></html>'
w = int(sys.argv[1]) if len(sys.argv) > 1 else 1400
h = int(sys.argv[2]) if len(sys.argv) > 2 else 860
scheme = sys.argv[3] if len(sys.argv) > 3 else 'light'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': w, 'height': h}, color_scheme=scheme)
    errs = []
    pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append(f'pageerror: {e}'))
    def route(r):
        u = r.request.url
        for k, f in MAP.items():
            if u.endswith(k):
                return r.fulfill(path=str(f), content_type='application/javascript')
        if 'fonts.g' in u: return r.abort()
        if u.startswith('http://app.local'): return r.fulfill(body=page_html, content_type='text/html')
        return r.continue_()
    pg.route('**/*', route)
    pg.goto('http://app.local/')
    pg.wait_for_timeout(1500)
    pg.screenshot(path=str(OUT/f'start_{w}_{scheme}.png'))
    if w >= 1000:
        svg = pg.locator('svg.plan')
        bb = svg.bounding_box()
        # select a wall: click on front wall midpoint
        st = pg.evaluate("()=>1")
        # Click the wall tool and draw an addition: three walls off the right side
        pg.keyboard.press('w')
        # find screen coords of world point using the dims: get transform by reading a handle — instead compute from the first wall polygon
        pts = pg.evaluate("""()=>{const pl=[...document.querySelectorAll('svg.plan polygon.w-new')][0].getAttribute('points');return pl}""")
        print('wall0 pts', pts)
        pg.mouse.click(bb['x'] + bb['width'] * 0.85, bb['y'] + bb['height'] * 0.2)
        pg.mouse.move(bb['x'] + bb['width'] * 0.95, bb['y'] + bb['height'] * 0.2)
        pg.keyboard.type("10'6")
        pg.wait_for_timeout(100)
        pg.screenshot(path=str(OUT/'typing.png'))
        pg.keyboard.press('Enter')
        pg.mouse.move(bb['x'] + bb['width'] * 0.95, bb['y'] + bb['height'] * 0.5)
        pg.wait_for_timeout(100)
        pg.mouse.click(bb['x'] + bb['width'] * 0.95, bb['y'] + bb['height'] * 0.5)
        pg.keyboard.press('Escape')
        n = pg.evaluate("()=>JSON.parse(localStorage.getItem('remodel-studio:project')||'{}').walls?.length")
        pg.wait_for_timeout(500)
        n = pg.evaluate("()=>JSON.parse(localStorage.getItem('remodel-studio:project')||'{}').walls?.length")
        print('walls after drawing', n)
        # select tool, click a wall
        pg.keyboard.press('v')
        pg.mouse.click(bb['x'] + bb['width'] * 0.25, bb['y'] + bb['height'] * 0.5)
        pg.wait_for_timeout(300)
        pg.screenshot(path=str(OUT/'select.png'))
        pg.keyboard.press('Control+z'); pg.keyboard.press('Control+z')
        pg.wait_for_timeout(500)
        n = pg.evaluate("()=>JSON.parse(localStorage.getItem('remodel-studio:project')||'{}').walls?.length")
        print('walls after undo x2', n)
        # 3D only
        pg.evaluate("()=>window.__app.setMode('3d')")
        pg.wait_for_timeout(800)
        pg.screenshot(path=str(OUT/f'3d_{scheme}.png'))
        pg.get_by_role('button', name='Show roof', exact=True).click()
        pg.wait_for_timeout(500)
        pg.screenshot(path=str(OUT/'3d_noroof.png'))
        pg.get_by_role('button', name='File').click()
        pg.wait_for_timeout(300)
        pg.screenshot(path=str(OUT/'file.png'))
    print('\n'.join(errs) or 'no console errors')
    b.close()
