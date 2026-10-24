from h import *
with app() as (pg,errs):
    pg.evaluate("()=>window.dispatchEvent(new Event('rs-vendor-import'))"); pg.wait_for_selector('#vc-file',state='attached')
    pg.select_option('#vc-t','cabinets'); pg.fill('#vc-brand','Acme Cabinet Co')
    pg.set_input_files('#vc-file','acme.xlsx'); pg.wait_for_selector('.vc-map',timeout=20000); pg.wait_for_timeout(500)
    print('hdr', pg.evaluate("()=>document.querySelector('#vc-hr').value"), pg.evaluate("()=>[...document.querySelectorAll('.vc-map select')].map(s=>s.id.slice(5)+'='+s.value).join(' ')"))
    print(pg.evaluate("()=>document.querySelector('.modal .msg')?.textContent"))
    pg.locator('button',has_text='Add to library').click(); pg.wait_for_timeout(300)
    print(pg.evaluate("()=>[...document.querySelectorAll('.modal .msg')].map(m=>m.textContent).join(' | ')"))
    r=pg.evaluate("()=>{const c=VENDOR_CABS.find(v=>v.name==='Acme Cabinet Co');return c&&{lines:c.lines.map(l=>l.name),doors:c.doors.map(d=>d.name+':'+d.kind),fin:c.finishes.map(f=>f.name+':'+f.type),book:c.book,pb:loadPriceBooks().map(b=>b.name+' '+b.items.length)}}")
    print(r)
    # paint PDF
    pg.select_option('#vc-t','paint'); pg.fill('#vc-brand','Test Paints')
    pg.set_input_files('#vc-file','paint.pdf'); pg.wait_for_timeout(2500)
    print('pdf map', pg.evaluate("()=>[...document.querySelectorAll('.vc-map select')].map(s=>s.id.slice(5)+'='+s.value).join(' ')"), pg.evaluate("()=>document.querySelector('.vc-prev')?.innerText.slice(0,200)"))
    pg.locator('button',has_text='Add to library').click(); pg.wait_for_timeout(300)
    print(pg.evaluate("()=>JSON.stringify(VENDOR_PRODUCTS.paint.find(b=>b.brand==='Test Paints'))"))
    pg.screenshot(path=str(OUT/'vendor_import.png'))
    print(errs)
