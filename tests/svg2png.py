import sys,pathlib
from playwright.sync_api import sync_playwright
src,dst,clip=sys.argv[1],sys.argv[2],sys.argv[3] if len(sys.argv)>3 else None
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':3400,'height':2200})
    pg.set_content('<html><body style="margin:0;background:#fff">'+pathlib.Path(src).read_text()+'</body></html>')
    pg.evaluate("()=>{const s=document.querySelector('svg');s.style.width='3400px';s.style.height='auto';}")
    if clip:
        x,y,w,h=map(int,clip.split(','));pg.screenshot(path=dst,clip={'x':x,'y':y,'width':w,'height':h})
    else: pg.screenshot(path=dst,full_page=True)
    b.close()
