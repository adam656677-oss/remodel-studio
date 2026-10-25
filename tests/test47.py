from h import *
with app() as (pg,errs):
    r=pg.evaluate("""()=>{let p=window.__app.get();const km=VENDOR_CABS.find(v=>v.id==='kraftmaid');const d=km.doors.find(d=>d.kind==='shaker');const fin=km.finishes.find(f=>/blue|navy|gray|grey/i.test(f.name))||km.finishes[0];
      const cab=applyVendorCab({...(p.settings.cab||{}),vendor:'kraftmaid',vline:d.lines[0],vdoor:d.name,vfinish:fin.name});p={...p,settings:{...p.settings,cab,selections:{roofing:{brand:'GAF',item:'Timberline HDZ',color:'Charcoal'},windows:{brand:'Andersen',item:'400 Series'}}}};window.__app.commit(p);
      const rows=takeoff(p,{waste:.1});return {label:vendorLabel(cab),style:cab.style,color:cab.color,roof:rows.filter(r=>/Selected: GAF/.test(r.note)).length,win:rows.filter(r=>/Andersen/.test(r.note)).length,cabrow:rows.filter(r=>/KraftMaid/.test(r.note)).length,brands:VENDOR_CABS.length};}""")
    print(r)
    pg.evaluate("()=>window.__app.setMode('materials')"); pg.wait_for_timeout(500)
    pg.get_by_role('tab', name='Selections and orders', exact=True).click(); pg.wait_for_timeout(400)
    pg.select_option('#sl-pb','Sherwin-Williams'); pg.wait_for_timeout(300)
    first=pg.evaluate("()=>window.__app.get().rooms[0].id")
    opts=pg.evaluate(f"()=>[...document.querySelector('#pc-w-{first}').options].map(o=>o.value).slice(1,3)")
    pg.select_option(f'#pc-w-{first}',opts[0]); pg.wait_for_timeout(300)
    print('paint',pg.evaluate("()=>{const r=window.__app.get().rooms[0];return [r.paint,r.wallColor]}"))
    pg.screenshot(path=str(OUT/'selections.png'),full_page=False)
    # cabinet panel UI
    print('A5 manufacturer line test via sheet text skipped'); print(errs)
