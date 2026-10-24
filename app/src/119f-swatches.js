/* ======================= material swatches: drawn patterns for floors, wall finishes and ceilings ======================= */
// The same patterns texture the floors in 3D, so planks, tile and carpet read in the model and in renders.
const _swCache={};
function rng(seed){let s=seed>>>0||1;return ()=>((s=Math.imul(s^(s>>>15),2246822507)^Math.imul(s^(s>>>13),3266489909))>>>0)/4294967296;}
const shade=(hex,f)=>{const r=(hex>>16)&255,g=(hex>>8)&255,b=hex&255;const c=x=>Math.max(0,Math.min(255,Math.round(x*f)));return `rgb(${c(r)},${c(g)},${c(b)})`;};
const WALLFIN_COL={paint:0xe9e5dc,smooth:0xeeebe4,orangepeel:0xebe7de,knockdown:0xeae5db,shiplap:0xf2f0ea,beadboard:0xf3f1eb,paneling:0x9b6f45,subway:0xf4f4f1,largetile:0xd9d6cf,mosaic:0xb9c9cf,stone:0x9d958a,brick:0xa4543a,wallpaper:0xdfe7e2,frp:0xf1f1ec,cmu:0xdedbd3,plaster:0xe7dfd0,cement:0xe2e2de};
// draw a pattern on a 2D canvas context. S = pixels per inch, W/H in pixels
function drawFinish(g,kind,key,hex,W,H,S){const R=rng([...(kind+key)].reduce((a,c)=>a*31+c.charCodeAt(0),7));g.fillStyle=shade(hex,1);g.fillRect(0,0,W,H);
  const noise=(n,sz,amp,dark=true)=>{for(let i=0;i<n;i++){const f=1+(R()-0.5)*amp*(dark?2:1);g.fillStyle=shade(hex,f);const s=sz*(0.5+R());g.fillRect(R()*W,R()*H,s,s);}};
  const blotch=(n,sz,amp)=>{for(let i=0;i<n;i++){g.fillStyle=shade(hex,1+(R()-0.6)*amp);g.beginPath();g.ellipse(R()*W,R()*H,sz*(0.4+R()),sz*(0.3+R()*0.7),R()*3,0,7);g.fill();}};
  const lines=(sp,vert,col,wd=1)=>{g.fillStyle=col;for(let p=sp;p<(vert?W:H);p+=sp)vert?g.fillRect(p,0,wd,H):g.fillRect(0,p,W,wd);};
  const planks=(pw,plMin,plMax,grain)=>{for(let y=0;y<H;y+=pw*S){let x=-R()*plMax*S;while(x<W){const L=(plMin+R()*(plMax-plMin))*S;g.fillStyle=shade(hex,0.86+R()*0.26);g.fillRect(x,y,L,pw*S);
        if(grain)for(let k=0;k<4;k++){g.strokeStyle=shade(hex,0.78+R()*0.1);g.lineWidth=0.7;g.beginPath();const yy=y+R()*pw*S;g.moveTo(x,yy);g.bezierCurveTo(x+L*0.3,yy+(R()-0.5)*4,x+L*0.7,yy+(R()-0.5)*4,x+L,yy+(R()-0.5)*3);g.stroke();}
        g.fillStyle=shade(hex,0.6);g.fillRect(x,y,1.2,pw*S);x+=L;}g.fillStyle=shade(hex,0.62);g.fillRect(0,y,W,1.2);}};
  const tiles=(tw,th,grout,stagger,vary,gcol)=>{g.fillStyle=gcol||'#c9c6bf';g.fillRect(0,0,W,H);for(let r=0,y=0;y<H;r++,y+=th*S){const off=stagger&&r%2?tw*S/2:0;for(let x=-off;x<W;x+=tw*S){g.fillStyle=shade(hex,1+(R()-0.5)*vary);g.fillRect(x+grout,y+grout,tw*S-grout*2,th*S-grout*2);}}};
  const k=key||'';
  if(kind==='floor'){
    if(/lvp|laminate|engineered/.test(k))planks(7,30,60,true);else if(/hardwood/.test(k))planks(3.25,18,48,true);else if(/pine/.test(k))planks(5,30,72,true);
    else if(k==='tile')tiles(12,12,1.5,false,0.08);else if(k==='porcelain')tiles(24,12,1.2,true,0.06);else if(k==='stone'){tiles(16,16,2,false,0.22,'#a8a296');blotch(40,6,0.15);}
    else if(k==='brickpaver')tiles(8,4,1.6,true,0.25,'#8c8579');else if(k==='vct')tiles(12,12,0.6,false,0.18,shade(hex,0.9));
    else if(k==='carpet'){noise(W*H/6,1.5,0.18);}else if(k==='cork'){noise(W*H/8,2,0.4);}else if(/concrete|polished|epoxy/.test(k)){blotch(60,W/8,0.08);noise(W*H/40,1,0.15);if(k==='concrete'){g.strokeStyle=shade(hex,0.8);g.lineWidth=1.2;g.beginPath();g.moveTo(0,H*0.5);g.lineTo(W,H*0.5);g.moveTo(W*0.5,0);g.lineTo(W*0.5,H);g.stroke();}}
    else if(k==='sheetvinyl'){tiles(6,6,0.5,false,0.05,shade(hex,0.94));}else if(k==='rubber'){noise(W*H/10,1.5,0.5);}else noise(W*H/30,1.5,0.1);}
  else if(kind==='wallfin'){
    if(k==='orangepeel'){noise(W*H/5,1.2,0.07);}else if(k==='knockdown'){blotch(W*H/180,5,0.06);}else if(k==='shiplap'){lines(6*S,false,shade(hex,0.62),2);}
    else if(k==='beadboard'){lines(1.75*S,true,shade(hex,0.78),1.2);}else if(k==='paneling'){planks(6,96,96,true);}else if(k==='subway')tiles(6,3,1,true,0.04,'#bdbab3');
    else if(k==='largetile')tiles(24,12,1,true,0.06,'#bdbab3');else if(k==='mosaic')tiles(1.25,1.25,0.6,false,0.3,'#9aa');else if(k==='stone'){g.fillStyle='#6e675d';g.fillRect(0,0,W,H);for(let i=0;i<W*H/(S*S*30);i++){g.fillStyle=shade(hex,0.75+R()*0.5);g.beginPath();g.ellipse(R()*W,R()*H,S*(3+R()*4),S*(2+R()*2.5),R(),0,7);g.fill();}}
    else if(k==='brick')tiles(8,2.66,1.4,true,0.25,'#d8d2c6');else if(k==='cmu')tiles(16,8,1.2,true,0.06,shade(hex,0.85));else if(k==='frp'){noise(W*H/4,1,0.05);}
    else if(k==='wallpaper'){for(let y=0;y<H;y+=4*S)for(let x=(y/(4*S))%2?2*S:0;x<W;x+=4*S){g.fillStyle=shade(hex,0.84);g.beginPath();g.ellipse(x,y,S*0.8,S*1.4,0,0,7);g.fill();}}
    else if(k==='plaster'){blotch(80,W/6,0.07);}else if(k==='cement')tiles(12,12,1.5,false,0.05,'#aaa');else noise(W*H/60,1,0.03);}
  else if(kind==='ceiling'){
    if(k==='popcorn'){noise(W*H/2.5,2.2,0.18);}else if(k==='knockdown')blotch(W*H/180,5,0.06);else if(k==='orangepeel')noise(W*H/5,1.2,0.07);
    else if(/beadboard/.test(k))lines(1.75*S,true,shade(hex,0.78),1.2);else if(/tng|plank|shiplap/.test(k))planks(5.5,40,96,k!=='shiplap');
    else if(k==='act22'||k==='act24'){tiles(24,k==='act22'?24:48,2.5,false,0.02,'#f4f4f2');noise(W*H/6,1,0.05);}else if(k==='tin'){tiles(12,12,0.8,false,0.04,'#9a9a96');g.strokeStyle='rgba(0,0,0,.18)';for(let x=6*S;x<W;x+=12*S)for(let y=6*S;y<H;y+=12*S){g.beginPath();g.arc(x,y,3*S,0,7);g.stroke();}}
    else if(k==='coffered'||k==='beams'){lines(k==='coffered'?24*S:48*S,true,shade(hex,0.72),5);if(k==='coffered')lines(24*S,false,shade(hex,0.72),5);}else if(k==='tray'){g.strokeStyle=shade(hex,0.8);g.lineWidth=4;g.strokeRect(W*0.15,H*0.15,W*0.7,H*0.7);}
    else if(k==='open'){lines(16*S,true,shade(hex,0.7),6);}else noise(W*H/80,1,0.02);}}
function finishSwatch(kind,key,hex,w=160,h=120,inches=36){const id=[kind,key,hex,w,h,inches].join('|');if(_swCache[id])return _swCache[id];const c=document.createElement('canvas');c.width=w;c.height=h;
  drawFinish(c.getContext('2d'),kind,key,hex,w,h,w/inches);return (_swCache[id]=c.toDataURL('image/png'));}
// tiling texture for 3D floors: one tile covers `inches` square
const _floorTex={};
function floorTexture(key,hex){const id=key+'|'+hex;if(_floorTex[id])return _floorTex[id];const N=512,inches=96;const c=document.createElement('canvas');c.width=c.height=N;drawFinish(c.getContext('2d'),'floor',key,hex,N,N,N/inches);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12/inches,12/inches);t.anisotropy=4;if('encoding' in t)t.encoding=THREE.sRGBEncoding;return (_floorTex[id]=t);}
// a soft studio environment so metal (hardware, appliances, faucets) reflects something
const _envFor=new WeakMap();
function studioEnv(renderer){if(_envFor.has(renderer))return _envFor.get(renderer);let tex=null;
  try{const pm=new THREE.PMREMGenerator(renderer);const sc=new THREE.Scene();const mk=(c)=>new THREE.MeshBasicMaterial({color:c,side:THREE.BackSide});
    const room=new THREE.Mesh(new THREE.BoxGeometry(20,10,20),[mk(0xb9bcc2),mk(0xa9adb3),mk(0xf4f6fa),mk(0x6b6760),mk(0xc8ccd2),mk(0xc2c6cc)]);sc.add(room);
    const panel=(x,y,z,w,h,ry=0,rx=0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx,ry,0);sc.add(m);};
    panel(0,4.9,0,8,8,0,Math.PI/2);panel(-9.9,2,0,6,4,Math.PI/2);panel(9.9,2,-3,4,3,-Math.PI/2);
    tex=pm.fromScene(sc,0.04).texture;pm.dispose();}catch(e){tex=null;}_envFor.set(renderer,tex);return tex;}
// give metal surfaces the studio reflections (only metals, so painted walls keep their color and brightness)
function applyMetalEnv(root,renderer){const env=studioEnv(renderer);if(!env)return;root.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m&&m.isMeshStandardMaterial&&m.metalness>=0.3&&m.envMap!==env){m.envMap=env;m.envMapIntensity=0.9;m.needsUpdate=true;}}});}
/* ---- wall assembly section pictures (plan cut through the wall, outside on the left) ---- */
function wallLayers(it){const t=it.thick,m=it.mat,ext=it.kind==='exterior';const L=[];const dw=['dw',0.5],stud=n=>['stud',n],ins=n=>['ins',n];
  if(m==='brickveneer'){L.push(['brick',3.625],['gap',1],['sheath',0.5]);const s=t-3.625-1-0.5-0.5;L.push(ins(s),dw);}
  else if(m==='stoneveneer'){L.push(['stone',4.5],['gap',1],['sheath',0.5]);L.push(ins(t-4.5-1-0.5-0.5),dw);}
  else if(m==='cmu'){if(/brick/.test(it.key))L.push(['brick',3.625],['gap',1.375]);const b=/12/.test(it.key)?11.625:7.625;L.push(['cmu',b]);if(/fur/.test(it.key))L.push(['fur',1.5],dw);}
  else if(m==='icf')L.push(['foam',2.5],['conc',6],['foam',2.5]);
  else if(m==='sip')L.push(['sheath',0.5],['foam',t-1.5],['sheath',0.5],dw);
  else if(m==='metalstud'){if(ext)L.push(['panel',0.75],['sheath',0.5]);L.push(['mstud',t-(ext?1.75:1)],dw);if(!ext)L.unshift(dw);}
  else if(m==='postframe')L.push(['panel',0.5],['girt',1.5],['post',t-2]);
  else if(m==='glassblock')L.push(['glass',t]);
  else{if(ext)L.push(['siding',0.5],['sheath',0.5]);const n=/demise/.test(it.key||'')?[dw,dw]:[dw];if(!ext)L.push(...n);L.push(stud(t-(ext?1.5:n.length*0.5*2)));L.push(...n);}
  return L;}
function WallSectionPic({it}){const L=wallLayers(it);const tot=L.reduce((s,l)=>s+l[1],0)||it.thick;const k=80/Math.max(tot,4.5);let x=4;const H=60,y0=3;const els=[];
  const fill={brick:'#a4543a',gap:'#ffffff',sheath:'#d9b77a',ins:'#f4d7d7',dw:'#f5f5f2',stone:'#9a938a',cmu:'#b8b6b0',fur:'#c9a36b',foam:'#cde8f0',conc:'#a7a7a2',panel:'#8d9aa6',mstud:'#e9eef1',girt:'#c9a36b',post:'#b48a55',glass:'#cfe5ee',siding:'#c4ccd4',stud:'#f4d7d7'};
  for(const [kind,th] of L){const w=Math.max(1.5,th*k);els.push(html`<rect key=${els.length} x=${x} y=${y0} width=${w} height=${H} fill=${fill[kind]||'#ddd'} stroke="#555" strokeWidth="0.6"/>`);
    if(kind==='ins'||kind==='stud'){els.push(html`<rect key=${els.length} x=${x} y=${y0+H/2-1.5*k/2*0} width=${w} height=${Math.min(H*0.3,1.5*k)} fill="#e0b97a" stroke="#555" strokeWidth="0.5"/>`);let zz='';for(let yy=y0+2;yy<y0+H-2;yy+=5)zz+=`${x+1},${yy} ${x+w-1},${yy+2.5} `;els.push(html`<polyline key=${els.length} points=${zz} fill="none" stroke="#c77" strokeWidth="0.6"/>`);}
    if(kind==='cmu'){els.push(html`<rect key=${els.length} x=${x+w*0.18} y=${y0+H*0.12} width=${w*0.64} height=${H*0.32} fill="#fff" stroke="#777" strokeWidth="0.5"/>`,html`<rect key=${els.length+1} x=${x+w*0.18} y=${y0+H*0.56} width=${w*0.64} height=${H*0.32} fill="#fff" stroke="#777" strokeWidth="0.5"/>`);}
    if(kind==='brick'||kind==='conc'){for(let i=1;i<7;i++)els.push(html`<line key=${els.length} x1=${x} y1=${y0+i*9} x2=${x+w} y2=${y0+i*9-5} stroke="rgba(0,0,0,.35)" strokeWidth="0.5"/>`);}
    x+=w;}
  return html`<svg viewBox="0 0 88 66" className="libicon wallsec" aria-hidden="true"><rect x="0" y="0" width="88" height="66" fill="#eef1f4"/>${els}</svg>`;}
