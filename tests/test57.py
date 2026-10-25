from h import *
DXF = "\n".join(str(x) for x in [0,'SECTION',2,'HEADER',9,'$INSUNITS',70,1,0,'ENDSEC',
 0,'SECTION',2,'BLOCKS',0,'BLOCK',8,0,2,'CHAIR',10,0,20,0,0,'LINE',8,0,10,0,20,0,11,18,21,0,0,'LINE',8,0,10,18,20,0,11,18,21,18,0,'CIRCLE',8,0,10,9,20,9,40,4,0,'ENDBLK',0,'ENDSEC',
 0,'SECTION',2,'ENTITIES',
 0,'LWPOLYLINE',8,'WALLS',90,4,70,1,10,0,20,0,42,0,10,100,20,0,42,1,10,100,20,50,10,0,20,50,
 0,'INSERT',8,'FURN',2,'CHAIR',10,200,20,0,41,1,42,1,50,90,
 0,'INSERT',8,'FURN',2,'CHAIR',10,300,20,0,41,2,42,2,50,0,70,3,71,1,44,30,45,0,
 0,'ELLIPSE',8,'X',10,0,20,100,11,20,21,0,40,0.5,41,0,42,6.283185,
 0,'TEXT',8,'NOTES',10,0,20,-20,40,6,1,'HELLO',
 0,'ENDSEC',0,'EOF'])
with app(1500,950) as (pg,errs):
    r=pg.evaluate("""(t)=>{const P=parseDXF(t);const p=window.__app.get();const lv=p.levels[0].id;
      const pl=P.ents.find(e=>e.layer==='WALLS');const res=importDXF(p,lv,P,null);
      const blocks=dxfBlocksToLibrary(P);
      const sh=buildSheets(p);const d=sheetToDXF(sh.find(s=>s.no==='A1.1'));const back=parseDXF(d);
      let stairOK=true;try{dxfForLevel(p,p.levels[0]);}catch(e){stairOK=e.message;}
      return {n:P.ents.length,types:P.ents.map(e=>e.shape+':'+e.layer),plPts:pl.pts.length,maxX:Math.max(...pl.pts.map(q=>q[0])),imported:res.n,blocks:blocks.map(b=>b.name+' '+b.count+' '+Math.round(b.w)),
        sheetEnts:back.ents.length,stairOK,chairX:P.ents.filter(e=>e.layer==='FURN'&&e.shape==='circle').map(e=>[Math.round(e.cx),Math.round(e.cy),e.r])};}""",DXF)
    print(r)
    assert r['plPts']>6 and r['maxX']>120   # bulge arc bulges out past x=100 by 25
    assert len(r['chairX'])==4 and r['imported']>8 and r['sheetEnts']>200 and r['stairOK'] is True
    m=pg.evaluate("""async()=>{await loadExporters();await loadScript('https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/exporters/STLExporter.js');
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(0.5,1,2),new THREE.MeshStandardMaterial({color:0x336699}));const sc=new THREE.Scene();sc.add(mesh);
      const glb=await new Promise(res=>new THREE.GLTFExporter().parse(sc,res,e=>res(null),{binary:true}));const stl=new THREE.STLExporter().parse(sc);
      const A=await loadModelFile(new File([glb],'box.glb'),'m','y');const B=await loadModelFile(new File([stl],'box.stl'),'m','y');
      return [[A.w,A.d,A.h,A.color],[B.w,B.d,B.h]].map(x=>x.map(v=>typeof v==='number'?Math.round(v):v));}""")
    print(m); assert m[0][:3]==[20,79,39] and m[0][3]=='#336699', m
    pg.evaluate("()=>window.__app.setMode('plan')")
    file_menu(pg,'Import','DWG or DXF drawing…')
    assert pg.get_by_text('Choose DWG or DXF file…').count()==1
    pg.locator('#dxf-file').set_input_files(files=[{'name':'t.dxf','mimeType':'application/dxf','buffer':DXF.encode()}]); pg.wait_for_timeout(600)
    pg.screenshot(path=str(OUT/'dxf_modal.png'))
    pg.get_by_role('button',name='Save its 1 blocks to my Blocks').click(); pg.wait_for_timeout(300)
    assert pg.evaluate("()=>loadBlocks().some(b=>b.name==='DXF: CHAIR')")
    print('errors',errs[:3]); assert not errs; print('PASS')
