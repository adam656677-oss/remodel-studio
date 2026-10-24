from h import *
with app(1400,1000) as (pg,errs):
    print(pg.evaluate("()=>{const p=window.__app.get();const L=loadCalc(p);return {heat:Math.round(L.heat),cool:Math.round(L.cool),tons:L.tons,rows:L.rows.map(r=>[r.name,Math.round(r.wallA),Math.round(r.winA),r.ceil,r.floor,Math.round(r.heat),Math.round(r.coolS+r.coolL),r.cfm])}}"))
    print(pg.evaluate("()=>energyCompliance(window.__app.get()).rows.map(r=>[r.item,r.req,r.prov,r.ok])"))
    S=pg.evaluate("()=>{const s=serviceLoad(window.__app.get());return [s.lines.map(l=>l.label+' '+l.va),s.gen,Math.round(s.genDemand),Math.round(s.hv),Math.round(s.amps),s.size]}"); print(S)
    print(pg.evaluate("()=>{const x=plumbingCalc(window.__app.get());return [x.rows,x.DFU,x.WSFU,x.drain,x.service,x.tank]}"))
    pg.evaluate("()=>window.__app.setMode('systems')"); pg.wait_for_timeout(600)
    for t in ['Energy code','Heating and cooling','Electrical service','Plumbing']:
        pg.get_by_role('tab',name=t).click(); pg.wait_for_timeout(400); pg.screenshot(path=str(OUT/f"t33_{t.split()[0]}.png"),full_page=True)
    svg=pg.evaluate("()=>sheetToSVGString(buildSheets(window.__app.get()).find(s=>s.no==='M0.1'))")
    pg2=pg.context.new_page(); pg2.set_viewport_size({'width':1700,'height':1080}); pg2.set_content('<body style="margin:0;background:#fff">'+svg.replace('<svg','<svg style="width:1700px;height:auto"',1)+'</body>'); pg2.wait_for_timeout(300); pg2.screenshot(path=str(OUT/'t33_sheet.png')); pg2.close()
    print(errs or 'no errors')
