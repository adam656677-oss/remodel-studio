from h import *
CSV = """Item #,Description,Price,UOM
1000574,2 in. x 4 in. x 92-5/8 in. Premium Kiln-Dried Whitewood Stud,3.98,EA
161640,2 in. x 4 in. x 16 ft. #2 Prime Ground Contact Pressure-Treated Lumber,9.47,EA
202093,1/2 in. x 4 ft. x 12 ft. UltraLight Drywall Panel,17.48,EA
2050,7/16 in. x 4 ft. x 8 ft. OSB Sheathing,15.25,EA
5510,2 in. x 10 in. x 8 ft. #2 Southern Yellow Pine Lumber,13.98,EA
5511,2 in. x 8 in. x 10 ft. #2 Southern Yellow Pine Lumber,11.27,EA
99331,Owens Corning Duration Architectural Shingles 32.8 sq ft per bundle,42.98,bundle
7711,Kwikset Tylo Satin Nickel Privacy Door Knob,14.97,EA
"""
with app(1500,950) as (pg,errs):
    r=pg.evaluate("""(csv)=>{const p=window.__app.get();const rows=takeoff(p,{waste:0.1});const L=plRowsFromTable(parseCSVRows(csv));const M=matchStoreItems(rows,L);
      const out={};for(const r of rows){const c=M[r.key];if(c&&c.length&&c[0].s>=0.55)out[r.item]=c[0].x.desc+' '+c[0].s.toFixed(2);}return {n:L.length,out};}""",CSV)
    for k,v in r['out'].items(): print(k,'->',v)
    assert r['n']==8
    assert '2 in. x 4 in. x 92-5/8' in r['out'].get('2x4 stud, 92-5/8" precut','')
    assert 'Drywall' in r['out'].get('1/2" drywall 4x12','')
    # UI flow: open via estimate tab
    pg.evaluate("()=>window.__app.setMode('materials')"); pg.get_by_role('tab',name='Estimate and labor').click(); pg.wait_for_timeout(500)
    pg.get_by_role('button',name='Import store price list…').click(); pg.wait_for_timeout(300)
    pg.locator('#sp-file').set_input_files(files=[{'name':'hd.csv','mimeType':'text/csv','buffer':CSV.encode()}]); pg.wait_for_timeout(800)
    pg.screenshot(path=str(OUT/'sp_modal.png'))
    pg.get_by_role('button',name='Apply checked prices').click(); pg.wait_for_timeout(300)
    src=pg.evaluate("()=>window.__app.get().priceSrc"); print(len(src)); assert len(src)>=4
    pg.get_by_role('button',name='Close').click()
    # trade risk + options diff
    t0=pg.evaluate("()=>estimateOf(window.__app.get()).total")
    pg.evaluate("""()=>{const a=window.__app;let p=a.get();p={...p,estimate:{...(p.estimate||{}),contTrade:{framing:20}}};p=addOption(p);p={...p,walls:p.walls.slice(0,-1)};a.commit(p);}"""); pg.wait_for_timeout(500)
    t1=pg.evaluate("()=>estimateOf(window.__app.get()).total"); print(t0,t1)
    d=pg.evaluate("()=>{const p=window.__app.get();const P=ensureOptions(p);const D=optionDiff(p,P.options[0],P.options[1]);return [D.lines.length,Math.round(D.total)];}"); print(d); assert d[0]>0
    pg.evaluate("()=>{const a=window.__app;const p=a.get();a.commit({...p,estimate:{...p.estimate,alternates:true}});}")
    ok=pg.evaluate("async()=>{const d=await proposalPDF(window.__app.get());return d.output('datauristring').length>10000;}"); assert ok
    pg.wait_for_timeout(300); pg.screenshot(path=str(OUT/'est_more.png'),full_page=True)
    print('errors',errs[:3]); assert not errs; print('PASS')
