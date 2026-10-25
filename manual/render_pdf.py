# render manual.html with paged.js in Chromium and print it to PDF
import sys, os, time, subprocess
from playwright.sync_api import sync_playwright
H=os.path.dirname(os.path.abspath(__file__))
out=sys.argv[1] if len(sys.argv)>1 else f'{H}/Remodel Studio User Manual.pdf'
srv=subprocess.Popen(['python3','-m','http.server','8765','--bind','127.0.0.1'],cwd=H,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    t0=time.time(); pg.goto('http://127.0.0.1:8765/manual.html');
    pg.wait_for_function("()=>!!document.body.dataset.pagedDone",timeout=900000)
    n=pg.evaluate("()=>document.querySelectorAll('.pagedjs_page').length"); print('pages',n,'render s',round(time.time()-t0))
    pg.pdf(path=out,prefer_css_page_size=True,print_background=True,display_header_footer=False)
    print('errors',errs[:5]); b.close()
srv.terminate()
print('wrote',out,os.path.getsize(out)//1024,'KB')
