# more CAD: fillet, chamfer, scale, break, join, explode, arrays, ellipse, polygon, cloud, area, angle and radius dims, typed settings
from h import *
with app(1400,900) as (pg,errs):
    r=pg.evaluate("""()=>{let p=window.__app.get();const lv=p.levels[0];const mk=(id,pts,shape='line')=>({id,level:lv.id,shape,pts,layer:'L-DRAFT',weight:0.5,dash:'solid',status:'new'});
      p={...p,cad:[mk('c1',[[600,0],[700,0]]),mk('c2',[[720,20],[720,120]]),mk('c3',[[800,0],[900,0]]),mk('c4',[[920,20],[920,120]])]};
      const ctx=(pp,sel)=>({p:pp,lv,view:{s:1},walls:pp.walls.filter(w=>w.level===lv.id),sel,grid:6});const out={};
      let r=XTOOLS['op-fillet'].place(ctx(p),[{x:650,y:0},{x:720,y:80}]);p=r.p;out.fillet0=[p.cad.find(c=>c.id==='c1').pts,p.cad.find(c=>c.id==='c2').pts];
      p={...p,settings:{...p.settings,chamferD:12}};r=XTOOLS['op-chamfer'].place(ctx(p),[{x:850,y:0},{x:920,y:80}]);p=r.p;out.chamfer=p.cad.filter(c=>!['c1','c2','c3','c4'].includes(c.id)).map(c=>c.shape+JSON.stringify(c.pts));
      p={...p,cad:[...p.cad,mk('c5',[[600,300],[700,300]]),mk('c6',[[720,320],[720,420]])],settings:{...p.settings,filletR:12}};r=XTOOLS['op-fillet'].place(ctx(p),[{x:650,y:300},{x:720,y:380}]);p=r.p;out.filletArc=p.cad.filter(c=>c.shape==='arc').length;
      r=XTOOLS['op-break'].place(ctx(p),[{x:650,y:300}],{raw:{x:650,y:300}});p=r.p;out.afterBreak=p.cad.filter(c=>c.pts&&c.pts.some(q=>q[1]===300)).length;
      const lines=p.cad.filter(c=>c.pts&&c.pts.every(q=>q[1]===300));r=XTOOLS['op-join'].place(ctx(p,{kind:'multi',items:lines.map(c=>({kind:'cad',id:c.id}))}),[{x:0,y:0}]);p=r.p;out.joined=r.sel&&p.cad.find(c=>c.id===r.sel.id).pts.length;
      p={...p,cad:[...p.cad,mk('r1',[[0,600],[60,600],[60,660],[0,660]],'rect')]};r=XTOOLS['op-explode'].place(ctx(p,{kind:'cad',id:'r1'}),[{x:0,y:0}]);p=r.p;out.exploded=p.cad.filter(c=>c.shape==='line'&&c.pts.some(q=>q[1]===600||q[1]===660)).length;
      const n0=p.cad.length;p={...p,cad:[...p.cad,mk('s1',[[0,800],[20,800]])],settings:{...p.settings,parrN:6}};r=XTOOLS['op-parray'].place(ctx(p,{kind:'cad',id:'s1'}),[{x:0,y:900}]);p=r.p;out.polar=p.cad.length-n0;
      const n1=p.cad.length;p={...p,settings:{...p.settings,garr:[2,3]}};r=XTOOLS['op-garray'].place(ctx(p,{kind:'cad',id:'s1'}),[{x:0,y:800},{x:40,y:40}]);p=r.p;out.grid=p.cad.length-n1;
      r=XTOOLS['op-scale'].place(ctx({...p,settings:{...p.settings,scaleF:2}},{kind:'cad',id:'s1'}),[{x:0,y:800}]);out.scaled=r.p.cad.find(c=>c.id==='s1').pts;
      for(const [t,pts] of [['ellipse',[{x:0,y:1000},{x:60,y:30}]],['polygon',[{x:200,y:1000},{x:240,y:1000}]],['revcloud',[{x:300,y:1000},{x:400,y:1000},{x:400,y:1080},{x:300,y:1080},{x:300,y:1000}]],['measarea',[{x:0,y:1200},{x:120,y:1200},{x:120,y:1320},{x:0,y:1320},{x:0,y:1200}]],['xline',[{x:0,y:0},{x:10,y:10}]]]){r=XTOOLS[t].place(ctx(p),pts);p=r.p;out[t]=p.cad[p.cad.length-1].pts.length;}
      r=XTOOLS['dimang'].place(ctx(p),[{x:0,y:0},{x:100,y:0},{x:0,y:-100}]);p=r.p;out.angle=adimDeg(p.adims[0]);
      p={...p,cad:[...p.cad,{id:'ci',level:lv.id,shape:'circle',cx:500,cy:1000,r:30,layer:'L-DRAFT'}]};r=XTOOLS['dimrad'].place(ctx(p),[{x:530,y:1000},{x:600,y:950}]);p=r.p;out.radius=p.annos[p.annos.length-1].text;
      out.cmds=['F 6','CHA 3','SC 0.5','POL 8','APO 4','AG 4x5','SS'].map(t=>JSON.stringify(parseCommand(t)));
      window.__app.commit(p);return out;}""")
    for k,v in r.items(): print(k,v)
    pg.evaluate("()=>window.__app.setMode('plan')"); pg.keyboard.press('f'); pg.wait_for_timeout(600); pg.screenshot(path=str(OUT/'cad_more.png'))
    print(errs[:3] or 'no errors')
