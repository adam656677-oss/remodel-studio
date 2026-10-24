/* ======================= sun study, AR and render kit ======================= */
// Sun position from the NOAA low-precision formulas (good to well under a degree for planning).
function sunPosition(date,lat,lon){
  const R=Math.PI/180; const n=date.getTime()/86400000+2440587.5-2451545.0;
  const L=((280.460+0.9856474*n)%360+360)%360, g=((357.528+0.9856003*n)%360+360)%360;
  const lam=L+1.915*Math.sin(g*R)+0.020*Math.sin(2*g*R), eps=23.439-0.0000004*n;
  const ra=Math.atan2(Math.cos(eps*R)*Math.sin(lam*R),Math.cos(lam*R))/R, dec=Math.asin(Math.sin(eps*R)*Math.sin(lam*R))/R;
  const gmst=((18.697374558+24.06570982441908*n)%24+24)%24; let ha=gmst*15+lon-ra; ha=((ha+180)%360+360)%360-180;
  const alt=Math.asin(Math.sin(lat*R)*Math.sin(dec*R)+Math.cos(lat*R)*Math.cos(dec*R)*Math.cos(ha*R))/R;
  const az=Math.atan2(-Math.sin(ha*R),Math.tan(dec*R)*Math.cos(lat*R)-Math.sin(lat*R)*Math.cos(ha*R))/R;
  return {alt,az:(az+360)%360};
}
// US daylight saving: second Sunday in March to first Sunday in November
function usDST(y,m,d){const nth=(month,k)=>{const f=new Date(Date.UTC(y,month,1)).getUTCDay();return 1+((7-f)%7)+7*(k-1);};
  const s=nth(2,2),e=nth(10,1);const v=m*100+d;return v>=200+s&&v<1000+e;}
function siteOf(p){return {name:'Forest, MS',lat:32.364,lon:-89.474,tz:-6,dst:true,bearing:0,...(p.site||{})};}
function sunFor(site,dateStr,minutes){
  const [y,m,d]=dateStr.split('-').map(Number); const off=site.tz+(site.dst&&usDST(y,m-1,d)?1:0);
  const utc=new Date(Date.UTC(y,m-1,d,0,0,0)+(minutes-off*60)*60000); return {...sunPosition(utc,site.lat,site.lon),offset:off};
}
const COMPASS=['north','northeast','east','southeast','south','southwest','west','northwest'];
const compassName=b=>COMPASS[Math.round((((b%360)+360)%360)/45)%8];
// direction toward the sun in plan coordinates (x right, y down); plan-up points at site.bearing
function sunPlanDir(az,bearing){const t=(az-bearing)*Math.PI/180;return {x:Math.sin(t),y:-Math.cos(t)};}

function SunPanel({p,commit,sun,setSun}){
  const site=siteOf(p); const pos=sunFor(site,sun.date,sun.min);
  const up=patch=>commit({...p,site:{...site,...patch}});
  useEffect(()=>{if(!sun.play)return;const t=setInterval(()=>setSun(s=>({...s,min:s.min>=20*60?6*60:s.min+10})),120);return ()=>clearInterval(t);},[sun.play]);
  const hh=Math.floor(sun.min/60),mm=sun.min%60; const t12=`${((hh+11)%12)+1}:${String(mm).padStart(2,'0')} ${hh<12?'AM':'PM'}`;
  return html`<div className="sunpanel">
    <div className="row"><b>Sun study</b><span className="spacer"></span><span className="note mono">${pos.alt>0?`${Math.round(pos.alt)}° up, from the ${compassName(pos.az)} (${Math.round(pos.az)}°)`:'Sun is down'}</span></div>
    <div className="row"><input id="sun-date" type="date" className="inp" style=${{width:'auto'}} value=${sun.date} onChange=${e=>e.target.value&&setSun(s=>({...s,date:e.target.value}))}/>
      <span className="mono">${t12}</span><button className="btn" onClick=${()=>setSun(s=>({...s,play:!s.play}))}>${sun.play?'Pause':'Play day'}</button></div>
    <input id="sun-time" type="range" min="300" max="1260" step="5" value=${sun.min} onInput=${e=>setSun(s=>({...s,min:+e.target.value}))} aria-label="Time of day"/>
    <div className="row sunquick">${[['Mar 20','03-20'],['Jun 21','06-21'],['Sep 22','09-22'],['Dec 21','12-21']].map(([l,md])=>html`<button key=${md} className="chip" onClick=${()=>setSun(s=>({...s,date:s.date.slice(0,4)+'-'+md}))}>${l}</button>`)}</div>
    <details><summary className="note">Location and orientation</summary><div className="grid2 sungrid">
      <label>Place<input id="site-name" className="inp" value=${site.name} onChange=${e=>up({name:e.target.value})}/></label>
      <label>Top of plan faces<select id="site-bearing" className="inp" value=${String(site.bearing)} onChange=${e=>up({bearing:+e.target.value})}>${COMPASS.map((c,i)=>html`<option key=${c} value=${String(i*45)}>${c[0].toUpperCase()+c.slice(1)}</option>`)}</select></label>
      <label>Latitude<input id="site-lat" className="inp mono" value=${site.lat} inputMode="decimal" onChange=${e=>{const v=parseFloat(e.target.value);if(!isNaN(v)&&v>=-90&&v<=90)up({lat:v});}}/></label>
      <label>Longitude<input id="site-lon" className="inp mono" value=${site.lon} inputMode="decimal" onChange=${e=>{const v=parseFloat(e.target.value);if(!isNaN(v)&&v>=-180&&v<=180)up({lon:v});}}/></label>
      <label>UTC offset (standard)<input id="site-tz" className="inp mono" value=${site.tz} onChange=${e=>{const v=parseFloat(e.target.value);if(!isNaN(v))up({tz:v});}}/></label>
      <label className="check"><input id="site-dst" type="checkbox" checked=${site.dst} onChange=${e=>up({dst:e.target.checked})}/> US daylight saving</label></div>
      <p className="note">Set where the top of the plan points; elevations and the north arrow on the plan sheets follow it.</p></details>
  </div>`;
}

/* ---- loading exporters on demand ---- */
const loaded={};
function loadScript(src){if(window.__inlinedLibs&&window.__inlinedLibs.includes(src))return Promise.resolve();if(loaded[src])return loaded[src];loaded[src]=new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=()=>res();s.onerror=()=>{delete loaded[src];rej(new Error('A needed library did not load. Check the internet connection and try again.'));};document.head.appendChild(s);});return loaded[src];}
async function loadExporters(){await loadScript('https://cdn.jsdelivr.net/npm/fflate@0.7.4/umd/index.js');
  await loadScript('https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/exporters/GLTFExporter.js');await loadScript('https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/exporters/USDZExporter.js');}
// a clean, finished-looking copy of the model in meters (no selection, no demolished work)
function exportScene(p,opts={}){
  const st={model:new THREE.Group()}; buildModel(st,p,sortedLevels(p).slice(-1)[0].id,null,{cutaway:false,showRoof:opts.showRoof!==false,layer:'proposed'});
  const root=new THREE.Group(); root.name=(p.name||'House'); st.model.scale.setScalar(0.3048); root.add(st.model); root.updateMatrixWorld(true);
  // split multi-material meshes (walls with a different color on each face) into one mesh per material
  const multi=[];st.model.traverse(o=>{if(o.isMesh&&Array.isArray(o.material))multi.push(o);});
  for(const o of multi){const geo=o.geometry;const par=o.parent;for(const g of geo.groups){const sub=geo.clone();sub.setIndex(Array.from(geo.index.array.slice(g.start,g.start+g.count)));sub.clearGroups();
      const m=new THREE.Mesh(sub,o.material[g.materialIndex]);m.position.copy(o.position);m.rotation.copy(o.rotation);m.scale.copy(o.scale);par.add(m);}par.remove(o);}
  root.updateMatrixWorld(true);
  {const names=new Map(Object.entries(matCache).map(([k,m])=>[m,k]));st.model.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)&&names.has(o.material))o.material.name=names.get(o.material);});}
  st.model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(o.material.color)o.material.color.convertSRGBToLinear();if(o.material.transparent&&o.material.opacity<0.5&&o.material.color.r>0.8&&o.material.color.g<0.5)o.visible=false;}});
  return root;
}
const isIOS=()=>/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
async function openAR(p){
  await loadExporters(); const root=exportScene(p); const ex=new THREE.USDZExporter(); const arr=await ex.parse(root);
  const blob=new Blob([arr],{type:'model/vnd.usdz+zip'});
  if(isIOS()&&!framedView){const a=document.createElement('a');a.rel='ar';a.href=URL.createObjectURL(blob);const img=document.createElement('img');a.appendChild(img);document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();},1000);return {ok:true,t:'Opening AR Quick Look…'};}
  // elsewhere, hand over the file inside a zip so it can be AirDropped or opened on the iPhone
  const zip=fflate.zipSync({[safeName(p.name)+'.usdz']:arr},{level:0});
  const r=await saveFile(safeName(p.name)+' AR model.zip',new Blob([zip],{type:'application/zip'}));
  return r.ok?{ok:true,t:'Saved. Unzip it on the iPhone (Files app) and tap the .usdz file to open it in AR.'}:r;
}
async function renderKitFiles(p,sun,opt={}){
  await loadExporters(); const root=exportScene(p);
  const glb=await new Promise((res,rej)=>new THREE.GLTFExporter().parse(root,res,rej,{binary:true}));
  // camera presets in Blender coordinates (meters, Z up): Blender X = x, Blender Y = -z, Blender Z = y
  const box=new THREE.Box3().setFromObject(root); const c=box.getCenter(new THREE.Vector3()), s=box.getSize(new THREE.Vector3());
  const R=Math.max(s.x,s.z)*0.5; const B=v=>[+v.x.toFixed(3),+(-v.z).toFixed(3),+v.y.toFixed(3)];
  const site=siteOf(p); const pos=sunFor(site,sun.date,sun.min);
  const tgt=new THREE.Vector3(c.x,Math.min(c.y,1.6),c.z); const cams={}; const site0=siteOf(p);
  // corner views named by compass direction (plan up = site bearing)
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const pb=Math.atan2(sx,-sz)*180/Math.PI;const name=compassName(site0.bearing+pb);
    const v=new THREE.Vector3(c.x+sx*(s.x/2+R*1.1),1.65,c.z+sz*(s.z/2+R*1.1));cams[name]={location:B(v),target:B(tgt),lens:28};}
  // street view faces the side with the first exterior door
  let sn={x:0,y:1};const ext=p.walls.filter(w=>w.kind==='exterior');const door=p.openings.find(o=>o.type==='door'&&ext.some(w=>w.id===o.wall));
  if(door){const w=p.walls.find(w=>w.id===door.wall);sn=outwardNormal(ext,w);}
  cams.street={location:B(new THREE.Vector3(c.x+sn.x*(s.x/2+R*1.4)-sn.y*s.x*0.15,1.65,c.z+sn.y*(s.z/2+R*1.4)+sn.x*s.z*0.15)),target:B(tgt),lens:32};
  cams.aerial={location:B(new THREE.Vector3(c.x-R*1.6,R*2.0,c.z+R*1.8)),target:B(c),lens:35};
  // the views you saved in 3D (feet in the viewer, meters here)
  for(const v of (p.views||[])){const ps=new THREE.Vector3().fromArray(v.pos).multiplyScalar(0.3048);let tg;
    if(v.tgt)tg=new THREE.Vector3().fromArray(v.tgt).multiplyScalar(0.3048);
    else if(v.walk){const yw=v.walk.yaw||0,pt=v.walk.pitch||0;tg=ps.clone().add(new THREE.Vector3(Math.sin(yw)*Math.cos(pt),Math.sin(pt),Math.cos(yw)*Math.cos(pt)));}
    else continue;
    const lens=+(18/Math.tan(((v.walk?60:(v.fov||45))*Math.PI/180)/2)*(9/16)).toFixed(1);
    cams['view_'+String(v.name).replace(/[^\w]+/g,'_').slice(0,30)]={location:B(ps),target:B(tg),lens:Math.max(12,lens)};}
  // sun: direction toward the sun in plan, then in Blender axes
  const d=sunPlanDir(pos.az,site.bearing); const el=Math.max(pos.alt,2)*Math.PI/180;
  const sunVec=[+(d.x*Math.cos(el)).toFixed(4),+(-d.y*Math.cos(el)).toFixed(4),+Math.sin(el).toFixed(4)];
  const scene={project:p.name,created:new Date().toISOString(),model:'model.glb',sun:{altitude:+pos.alt.toFixed(2),azimuth:+pos.az.toFixed(2),vector:sunVec,date:sun.date,minutes:sun.min,place:site.name},
    cameras:cams,default_camera:'street',resolution:[1920,1080],samples:128,output:'render.png'};
  if(opt.size)scene.resolution=opt.size;if(opt.samples)scene.samples=opt.samples;
  const enc=t=>new TextEncoder().encode(t);
  return {cams,files:{'model.glb':new Uint8Array(glb),'scene.json':enc(JSON.stringify(scene,null,2)),'render.py':enc(RENDER_PY),'README.txt':enc(RENDER_README)}};
}
async function renderKit(p,sun){
  const {files}=await renderKitFiles(p,sun);
  const zip=fflate.zipSync(files,{level:6});
  return saveFile(safeName(p.name)+' render kit.zip',new Blob([zip],{type:'application/zip'}));
}
const RENDER_README=`Remodel Studio render kit
=========================

What is here
  model.glb    the house in meters, exported from Remodel Studio
  scene.json   sun position, camera presets, image size and quality
  render.py    Blender script that renders a photoreal image with Cycles

You need
  Blender 4.2 or newer (free, blender.org). An NVIDIA card (your RTX 2070) renders much faster.

Render
  1. Unzip this folder somewhere, for example C:\\Renders\\house
  2. Open Command Prompt in that folder and run:
       "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe" -b -P render.py -- scene.json
     (change the Blender path to match your version)
  3. The image is saved as render.png next to the script.

Options (add after scene.json)
  --camera street        one of: street (faces the front door), aerial, northwest, northeast,
                         southwest, southeast (corner views named by compass direction)
  --all                  render every camera preset
  --samples 256          more samples = cleaner image, longer render
  --size 3840x2160       image size
  --open                 open the scene in Blender instead of rendering (drop -b)

Tip: run without -b and with --open to adjust materials or cameras by hand, then render with F12.
`;
const RENDER_PY=`# Remodel Studio render script for Blender 4.2+ (Cycles).
# Usage: blender -b -P render.py -- scene.json [--camera NAME | --all] [--samples N] [--size WxH] [--open]
import bpy, json, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if not argv:
    raise SystemExit("Give the scene.json path after --")
scene_path = os.path.abspath(argv[0])
base = os.path.dirname(scene_path)
cfg = json.load(open(scene_path))

def opt(name, default=None):
    if name in argv:
        i = argv.index(name)
        return argv[i + 1] if i + 1 < len(argv) and not argv[i + 1].startswith("--") else True
    return default

# fresh scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=os.path.join(base, cfg.get("model", "model.glb")))

# ground
bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, -0.01))
ground = bpy.context.active_object
gmat = bpy.data.materials.new("Ground"); gmat.use_nodes = True
gb = gmat.node_tree.nodes.get("Principled BSDF")
gb.inputs["Base Color"].default_value = (0.20, 0.27, 0.13, 1)
gb.inputs["Roughness"].default_value = 0.95
ground.data.materials.append(gmat)

# soften glTF materials a little for a natural look
for m in bpy.data.materials:
    if not m.use_nodes or m.name == "Ground":
        continue
    b = m.node_tree.nodes.get("Principled BSDF")
    if b and "Roughness" in b.inputs and b.inputs["Roughness"].default_value < 0.3 and m.blend_method != "BLEND":
        b.inputs["Roughness"].default_value = 0.35

# surface detail by material name (siding laps, shingles, grass, wood grain)
def add_bump(m, kind):
    nt = m.node_tree; b = nt.nodes.get("Principled BSDF")
    if not b: return
    tc = nt.nodes.new("ShaderNodeTexCoord"); bump = nt.nodes.new("ShaderNodeBump")
    if kind == "lap":
        t = nt.nodes.new("ShaderNodeTexWave"); t.wave_type = "BANDS"; t.bands_direction = "Z"; t.wave_profile = "SAW"
        t.inputs["Scale"].default_value = 5.5; nt.links.new(tc.outputs["Object"], t.inputs["Vector"]); out = t.outputs["Fac"]; bump.inputs["Strength"].default_value = 0.35
    elif kind in ("brick", "shingle"):
        t = nt.nodes.new("ShaderNodeTexBrick"); nt.links.new(tc.outputs["Object"], t.inputs["Vector"])
        if kind == "brick":
            t.inputs["Scale"].default_value = 7.0; t.inputs["Mortar Size"].default_value = 0.012; t.inputs["Color2"].default_value = b.inputs["Base Color"].default_value
            col = list(b.inputs["Base Color"].default_value); t.inputs["Color1"].default_value = (col[0]*0.85, col[1]*0.85, col[2]*0.85, 1); t.inputs["Mortar"].default_value = (0.6, 0.58, 0.55, 1)
            nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
        else:
            t.inputs["Scale"].default_value = 3.0; t.inputs["Mortar Size"].default_value = 0.004; t.inputs["Row Height"].default_value = 0.5
        out = t.outputs["Fac"]; bump.inputs["Strength"].default_value = 0.4
    elif kind == "grass":
        t = nt.nodes.new("ShaderNodeTexNoise"); t.inputs["Scale"].default_value = 60.0; nt.links.new(tc.outputs["Object"], t.inputs["Vector"])
        ramp = nt.nodes.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].color = (0.05, 0.10, 0.025, 1); ramp.color_ramp.elements[1].color = (0.16, 0.24, 0.07, 1)
        nt.links.new(t.outputs["Fac"], ramp.inputs["Fac"]); nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"]); out = t.outputs["Fac"]; bump.inputs["Strength"].default_value = 0.6
    elif kind == "wood":
        t = nt.nodes.new("ShaderNodeTexWave"); t.wave_type = "BANDS"; t.inputs["Scale"].default_value = 3.0; t.inputs["Distortion"].default_value = 6.0
        nt.links.new(tc.outputs["Object"], t.inputs["Vector"]); out = t.outputs["Fac"]; bump.inputs["Strength"].default_value = 0.08
    else:
        return
    nt.links.new(out, bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
for m in list(bpy.data.materials):
    n = m.name.lower()
    if not m.use_nodes: continue
    if n.startswith("ext-") or n.startswith("ext"):
        add_bump(m, "brick" if abs(m.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value[0] - 0.3) < 0.08 and m.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value[1] < 0.1 else "lap")
    elif n.startswith("roof-") and "metal" not in n and "standing" not in n and "fivev" not in n: add_bump(m, "shingle")
    elif n.startswith("floor-") or n.startswith("door") or n == "stair": add_bump(m, "wood")
add_bump(gmat, "grass")

# sun and sky
sv = Vector(cfg["sun"]["vector"]).normalized()
bpy.ops.object.light_add(type="SUN", location=(0, 0, 50))
sun = bpy.context.active_object
sun.data.energy = 5.0 if cfg["sun"]["altitude"] > 5 else 1.0
sun.data.angle = math.radians(0.6)
sun.rotation_euler = (-sv).to_track_quat("-Z", "Y").to_euler()
world = bpy.data.worlds.new("Sky"); scn.world = world; world.use_nodes = True
nt = world.node_tree; bg = nt.nodes.get("Background")
try:
    sky = nt.nodes.new("ShaderNodeTexSky")
    for t in ("NISHITA", "MULTIPLE_SCATTERING", "SINGLE_SCATTERING", "HOSEK_WILKIE"):
        try:
            sky.sky_type = t; break
        except Exception:
            pass
    if hasattr(sky, "sun_elevation"):
        sky.sun_elevation = math.radians(max(cfg["sun"]["altitude"], 1))
        sky.sun_rotation = math.atan2(sv.x, sv.y)
    if hasattr(sky, "sun_disc"):
        sky.sun_disc = False
    nt.links.new(sky.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.14
except Exception as e:
    print("Sky texture not available, using a plain sky:", e)
    bg.inputs["Color"].default_value = (0.55, 0.68, 0.85, 1); bg.inputs["Strength"].default_value = 0.8

# render settings
scn.render.engine = "CYCLES"
scn.cycles.samples = int(opt("--samples", cfg.get("samples", 128)))
scn.cycles.use_denoising = True
w, h = cfg.get("resolution", [1920, 1080])
if opt("--size"):
    w, h = [int(v) for v in str(opt("--size")).lower().split("x")]
scn.render.resolution_x, scn.render.resolution_y = w, h
try:
    scn.view_settings.view_transform = "AgX"
    scn.view_settings.look = "AgX - Medium High Contrast"
except Exception:
    try:
        scn.view_settings.view_transform = "Filmic"
    except Exception:
        pass
prefs = bpy.context.preferences.addons["cycles"].preferences
device = "CPU"
for kind in ("OPTIX", "CUDA", "HIP", "METAL", "ONEAPI"):
    try:
        prefs.compute_device_type = kind
        prefs.get_devices()
        devs = [d for d in prefs.devices if d.type == kind]
        if devs:
            for d in prefs.devices:
                d.use = d.type == kind
            device = kind
            break
    except Exception:
        pass
scn.cycles.device = "GPU" if device != "CPU" else "CPU"
print("Rendering on", device)

def make_camera(name):
    c = cfg["cameras"][name]
    cam_data = bpy.data.cameras.new(name); cam_data.lens = c.get("lens", 28)
    cam = bpy.data.objects.new(name, cam_data); scn.collection.objects.link(cam)
    cam.location = Vector(c["location"])
    cam.rotation_euler = (Vector(c["target"]) - cam.location).to_track_quat("-Z", "Y").to_euler()
    return cam

names = list(cfg["cameras"].keys()) if opt("--all") else [opt("--camera", cfg.get("default_camera", "street"))]
for n in names:
    if n not in cfg["cameras"]:
        raise SystemExit("Unknown camera %s. Choose from: %s" % (n, ", ".join(cfg["cameras"])))
cams = [make_camera(n) for n in names]
scn.camera = cams[0]

if opt("--open"):
    print("Scene ready. Press F12 in Blender to render.")
else:
    for cam, n in zip(cams, names):
        scn.camera = cam
        out = os.path.join(base, cfg.get("output", "render.png") if len(names) == 1 else "render_%s.png" % n)
        scn.render.filepath = out
        bpy.ops.render.render(write_still=True)
        print("Saved", out)
`;

function ExportModal({p,sun,onClose,onRender}){
  const [busy,setBusy]=useState(null);const [msg,setMsg]=useState(null);
  const run=async(kind,fn)=>{setBusy(kind);setMsg(null);try{setMsg(await fn());}catch(e){setMsg({ok:false,t:e.message||'Export failed.'});}setBusy(null);};
  return html`<div className="modal-bg" onPointerDown=${e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-label="Share and render">
    <h2>AR, render and export</h2>
    <div className="sec" style=${{padding:0,borderBottom:0}}><h3>See it full size on your iPhone</h3>
      <p className="note">Makes an AR model of the proposed design (demolished work left out). On an iPhone in Safari it opens straight into AR Quick Look; place it in the yard or a room and walk around it at full size. LiDAR is not needed.${framedView?' Inside Claude, it saves a .zip instead: unzip it in the Files app and tap the .usdz file.':''}</p>
      <div className="row"><button className="btn primary" disabled=${!!busy} onClick=${()=>run('ar',()=>openAR(p))}>${busy==='ar'?'Building AR model…':'View in AR'}</button></div></div>
    <div className="sec" style=${{padding:'12px 0 0',borderBottom:0,borderTop:'1px solid var(--line)'}}><h3>Photoreal render</h3>
      <p className="note">Renders right here on this computer's graphics card, with real sun and sky, glass, reflections and the lights from the electrical plan. No other program is needed.</p>
      <div className="row"><button className="btn primary" onClick=${()=>{onClose();onRender&&onRender();}}>Open Render</button></div></div>
    <${ExportCAD} p=${p} busy=${busy} run=${run}/>
    ${msg?html`<div className=${'msg'+(msg.ok?'':' err')}>${msg.t}</div>`:null}
    <div className="row"><span className="spacer"></span><button className="btn" onClick=${onClose}>Done</button></div></div></div>`;
}

/* ---- 3D printing and CAD exchange (STL, OBJ, GLB) ---- */
const PRINT_SCALES=[['48','1:48 (1/4" = 1\'), millimeters'],['96','1:96 (1/8" = 1\'), millimeters'],['1','Full size, millimeters'],['m','Full size, meters (CAD)']];
async function export3D(p,fmt,scaleKey,showRoof){
  await loadExporters();await loadScript('https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/exporters/STLExporter.js');await loadScript('https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/exporters/OBJExporter.js');
  const root=exportScene(p,{showRoof});root.traverse(o=>{if(o.isMesh&&o.material&&o.material.transparent&&o.material.opacity<0.5)o.visible=false;});
  const k=scaleKey==='m'?1:1000/(+scaleKey);root.scale.setScalar(k);root.updateMatrixWorld(true);
  // drop hidden meshes so the printer and CAD files only get solid parts
  const keep=new THREE.Group();root.traverse(o=>{if(o.isMesh&&o.visible){const m=new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld),o.material);m.name=o.name||'part';keep.add(m);}});keep.updateMatrixWorld(true);
  const base=safeName(p.name)+(showRoof?'':' no roof')+' '+(scaleKey==='m'?'full size m':scaleKey==='1'?'full size mm':'1-'+scaleKey);let files={};
  if(fmt==='stl'){for(const m of keep.children)m.geometry.rotateX(Math.PI/2); // printers expect Z up
    const data=new THREE.STLExporter().parse(keep,{binary:true});files[base+'.stl']=new Uint8Array(data.buffer||data);}
  else if(fmt==='obj'){files[base+'.obj']=fflate.strToU8(new THREE.OBJExporter().parse(keep));}
  else{const ab=await new Promise((res,rej)=>new THREE.GLTFExporter().parse(keep,res,rej,{binary:true}));files[base+'.glb']=new Uint8Array(ab);}
  files['README.txt']=fflate.strToU8(`3D model of ${p.name||'the house'} from Remodel Studio.\nUnits: ${scaleKey==='m'?'meters, full size':'millimeters'+(scaleKey==='1'?', full size':', scale 1:'+scaleKey)}.\nProposed design only (demolished work left out). Glass is left out so window openings stay open.\nSTL: for 3D printing; slice it in your printer's software. OBJ and GLB: open in Blender, Macad3D, FreeCAD, SketchUp and most CAD and 3D programs.\nTip for printing: print without the roof to see the floor plan, or print the roof separately.\n`);
  return saveFile(base+' '+fmt.toUpperCase()+'.zip',new Blob([fflate.zipSync(files,{level:6})],{type:'application/zip'}));}
function ExportCAD({p,busy,run}){const [sc,setSc]=useState('48');const [roof,setRoof]=useState(true);
  return html`<div className="sec" style=${{padding:'12px 0 0',borderBottom:0,borderTop:'1px solid var(--line)'}}><h3>3D print or open in another CAD program</h3>
    <p className="note">STL is for 3D printing a scale model for the board. OBJ and GLB open in Blender, Macad3D, FreeCAD, SketchUp and most 3D programs. Each comes in a .zip.</p>
    <div className="row2"><${Field} label="Scale and units" id="x3-sc"><${Sel} id="x3-sc" value=${sc} onChange=${setSc} options=${PRINT_SCALES}/><//><label className="check" style=${{alignSelf:'end'}}><input type="checkbox" checked=${roof} onChange=${e=>setRoof(e.target.checked)}/> Include the roof</label></div>
    <div className="row"><button className="btn primary" disabled=${!!busy} onClick=${()=>run('stl',()=>export3D(p,'stl',sc,roof))}>${busy==='stl'?'Building…':'STL for 3D printing'}</button>
      <button className="btn" disabled=${!!busy} onClick=${()=>run('obj',()=>export3D(p,'obj',sc,roof))}>${busy==='obj'?'Building…':'OBJ'}</button>
      <button className="btn" disabled=${!!busy} onClick=${()=>run('glb',()=>export3D(p,'glb',sc,roof))}>${busy==='glb'?'Building…':'GLB with colors'}</button></div></div>`;}

/* ---- desktop: render straight in Blender on this computer ---- */
const RENDER_QUAL=[['draft','Draft: 1280 x 720, fast'],['good','Good: 1920 x 1080'],['best','Best: 2560 x 1440, slow']];
const QUAL_SET={draft:{size:[1280,720],samples:48},good:{size:[1920,1080],samples:128},best:{size:[2560,1440],samples:384}};
function DeskRender({p,sun}){
  const [exe,setExe]=useState(undefined);const [cam,setCam]=useState('street');const [q,setQ]=useState('good');
  const [busy,setBusy]=useState(false);const [log,setLog]=useState('');const [res,setRes]=useState(null);const [big,setBig]=useState(null);
  useEffect(()=>{DESK.findBlender().then(setExe);return DESK.on('render-log',t=>setLog(l=>(l+t).slice(-3000)));},[]);
  const camOpts=[['street','Street (front door side)'],['aerial','Aerial'],['all','Every view (corners, street, aerial, saved views)'],...(p.views||[]).map(v=>['view_'+String(v.name).replace(/[^\w]+/g,'_').slice(0,30),'Saved view: '+v.name])];
  const go=async()=>{setBusy(true);setRes(null);setLog('');try{const {files}=await renderKitFiles(p,sun,QUAL_SET[q]);
      const args=cam==='all'?['--all']:['--camera',cam];const r=await DESK.render({name:p.name,files,args});setRes(r);}catch(e){setRes({ok:false,error:e.message||String(e)});}setBusy(false);};
  const progress=(log.match(/Sample (\d+)\/(\d+)/g)||[]).slice(-1)[0];const saved=(log.match(/Saved /g)||[]).length;
  return html`<div className="sec" style=${{padding:'12px 0 0',borderBottom:0,borderTop:'1px solid var(--line)'}}><h3>Photoreal render with Blender</h3>
    ${exe===undefined?html`<p className="note">Looking for Blender…</p>`:exe?html`<p className="note">Using ${exe}. Sun at ${sun.date}, ${Math.floor(sun.min/60)}:${String(sun.min%60).padStart(2,'0')} (set it with the Sun button). Images are saved in Documents\Remodel Studio\Renders.</p>`
      :html`<p className="note">Blender was not found. Install it free from blender.org, or point to blender.exe.</p>`}
    <div className="row2"><${Field} label="Camera" id="dr-cam"><${Sel} id="dr-cam" value=${cam} onChange=${setCam} options=${camOpts}/><//><${Field} label="Quality" id="dr-q"><${Sel} id="dr-q" value=${q} onChange=${setQ} options=${RENDER_QUAL}/><//></div>
    <div className="row"><button className="btn primary" disabled=${busy||!exe} onClick=${go}>${busy?'Rendering…':'Render now'}</button>
      ${busy?html`<button className="btn" onClick=${()=>DESK.cancelRender()}>Stop</button>`:null}
      <button className="btn" onClick=${()=>DESK.pickBlender().then(x=>x&&setExe(x))}>Find Blender…</button>
      ${busy?html`<span className="note">${saved?saved+' image'+(saved>1?'s':'')+' done · ':''}${progress||'Loading the model…'}</span>`:null}</div>
    ${res?res.ok?html`<div className="rgal">${res.images.map(im=>html`<button key=${im.path} className="rthumb" onClick=${()=>setBig(im)} title=${im.name}><img src=${im.url} alt=${'Render '+im.name}/><span>${im.name.replace(/^render_?/,'')||'render'}</span></button>`)}</div>
        <div className="row"><span className="note">${res.images.length} image${res.images.length>1?'s':''} in ${res.seconds} s.</span><button className="btn" onClick=${()=>DESK.showInFolder(res.images[0].path)}>Show in folder</button></div>`
      :html`<div className="msg err">${res.error}</div>`:null}
    ${big?html`<div className="modal-bg" onPointerDown=${()=>setBig(null)}><img className="rbig" src=${big.url} alt=${'Render '+big.name}/></div>`:null}
  </div>`;}
