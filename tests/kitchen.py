# shared: build an L-shaped test kitchen with an island in the sample house
KITCHEN_JS = """()=>{let p=window.__app.get();const lv=p.levels[0].id;const k=p.rooms.find(r=>r.use==='kitchen');
  const keep=p.fixtures.filter(f=>!inPoly(f.x,f.y,k.pts));const F=(id,x,y,rot,extra={})=>({...newFixture(id,lv,x,y,rot),...extra});
  const L=[F('a-fridge-frenchdoorrefrigerator36',17.75,214,270),F('c-drawer-18',14.75,241,270),F('a-range-30',15.75,265,270),F('c-base-24',14.75,297.25,270),
    F('c-blind-42',23.75,321.25,180),F('c-sink-36',62.75,321.25,180),F('a-dw-24',92.75,321.25,180),F('c-base-30',119.75,321.25,180,{cab:{layout:'trash'}}),F('c-base-36',152.75,321.25,180,{cab:{mods:{rot:2,cd:1}}}),
    F('c-wall-30x30',119.75,327.25,180),F('c-wall-36x30',152.75,327.25,180),F('c-wall-15x30',190.25,327.25,180,{cab:{hinge:'R'}}),F('c-base-15',178.25,321.25,180,{cab:{hinge:'R'}}),
    F('c-island-72x36',130,250,0,{cab:{seating:true}})];
  p={...p,fixtures:[...keep,...L]};window.__app.commit(p);return L.map(f=>[f.type,f.lib,f.w,f.d]);}"""
