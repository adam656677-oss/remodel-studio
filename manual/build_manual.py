# Assemble the Remodel Studio user manual: markdown parts -> one paged HTML -> PDF (paged.js + Chromium)
import re, os, json, html, sys
import markdown
from PIL import Image
H=os.path.dirname(os.path.abspath(__file__))
VERSION='2.3'
def md(text):
    return markdown.markdown(text,extensions=['tables','sane_lists','attr_list','md_in_html','fenced_code'])

# ---------- images: downscale copies for the PDF ----------
os.makedirs(f'{H}/img',exist_ok=True)
def img(name,maxw=1400):
    src=f'{H}/shots/{name}.png'; dst=f'{H}/img/{name}.jpg'
    if not os.path.exists(src): return None
    if not os.path.exists(dst) or os.path.getmtime(dst)<os.path.getmtime(src):
        im=Image.open(src).convert('RGB')
        if im.width>maxw: im=im.resize((maxw,round(im.height*maxw/im.width)),Image.LANCZOS)
        im.save(dst,'JPEG',quality=82,optimize=True)
    return f'img/{name}.jpg'
def figure(name,caption,cls=''):
    p=img(name)
    if not p: return ''
    im=Image.open(f'{H}/shots/{name}.png'); r=im.height/im.width
    k='tall' if r>1.25 else ('narrow' if im.width<900 else 'wide')
    return f'<figure class="shot {k} {cls}"><img src="{p}" alt="{html.escape(caption)}"><figcaption>{html.escape(caption)}</figcaption></figure>\n'
def figgroup(lst):
    # several small/tall pictures under one heading go side by side
    ims=[(n,c,Image.open(f'{H}/shots/{n}.png')) for n,c in lst if os.path.exists(f'{H}/shots/{n}.png')]
    small=[x for x in ims if x[2].width<900]
    big=[x for x in ims if x[2].width>=900]
    out=''.join(figure(n,c) for n,c,_ in big)
    for i in range(0,len(small),2):
        pair=small[i:i+2]
        out+='<figure class="shot pair">'+''.join(f'<div><img src="{img(n)}" alt="{html.escape(c)}"><figcaption>{html.escape(c)}</figcaption></div>' for n,c,_ in pair)+'</figure>\n'
    return out

# screenshots inserted after the heading whose text contains the key (first match per key)
FIGS={
 'Header bar':[('menu-file-import','The File menu with the Import submenu.')],
 'File menu':[('menu-file-export','File › Export.')],
 'Edit menu':[('menu-edit','The Edit menu.')],
 'Help menu':[('menu-help','The Help menu (outside the Designer).')],
 'Tab bar and page control':[('dashboard','The Home tab with the tab bar along the bottom.')],
 'Command palette':[('palette','Search or ask: a question about the project.')],
 'Appearance dialog':[('appearance','Help › Appearance.')],
 'My standards':[('standards','My standards.')],
 'Lessons':[('lessons','Help › Lessons.')],
 'Blocks':[('dlg-blocks','Edit › Blocks.')],
 'Keyboard shortcuts':[('shortcuts','The Keyboard shortcuts dialog.')],
 'Ribbon':[('ribbon-home','The Home ribbon tab.'),('ribbon-architecture','Architecture.'),('ribbon-interiors','Interiors.'),('ribbon-structure','Structure.'),('ribbon-systems','Systems.'),('ribbon-site','Site.'),('designer-collapsed','The ribbon collapsed to its tabs; a tab opens as a popover.')],
 'Designer menus':[('menu-view','The View menu.'),('menu-report','The Report menu.'),('menu-window','The Window menu.')],
 'Left dock':[('catalog','The Catalog dock.'),('project-browser','The Project browser dock.')],
 'View panes':[('designer-four','Four views: plan, 3D, elevation and exterior.'),('split','Plan and 3D side by side.')],
 'Inspector':[('inspector-wall','The Inspector for a wall.'),('inspector-window','A window.'),('inspector-room','A room.'),('inspector-cabinet','A cabinet.')],
 'The 3D view':[('3d','The 3D view.'),('3d-dark','The 3D view in dark mode.')],
 'Vendor catalog import':[('dlg-vendor-import','File › Import › Vendor catalog.')],
 'Store prices':[('dlg-store-prices','Store prices.')],
 'Change door style and finish':[('dlg-style-swap','Change cabinet door style and finish.')],
 'Countertop slab layout':[('dlg-slab','Countertop slab layout.')],
 'Lighting plan and schedule':[('systems-lighting','Systems › Lighting.')],
 'Cabinet order':[('cost-cabinet-order','Cost › Cabinet order.')],
 'Photos':[('measure-photos','Measure › Photos.')],
 'Measure from photos':[('measure-photo-measure','Measure from photos.')],
 'Photo assistant':[('measure-photo-assistant','Photo assistant.')],
 'Scans and plan images':[('measure-underlay','Scans and plan images.'),('dlg-dxf-import','Import a DWG or DXF drawing.')],
 'Make walls':[('measure-make-walls','Make walls.'),('dlg-scan-walls','Walls from a scan or plan photo.')],
 'Field notes':[('measure-field','Field notes.')],
 'Import a 3D model':[('dlg-obj-import','Import a 3D model.')],
 'Photo match':[('dlg-photo-match','Photo match.')],
 'Check page':[('check','The Check page.')],
 'Remove or open a wall':[('dlg-wall-removal','Remove or open a wall.')],
 'Floor and ceiling joists':[('dlg-joists','Floor and ceiling joists.')],
 'Roof wizard':[('dlg-roof-wizard','Roof wizard.')],
 'Wall framing':[('dlg-wall-framing','Wall framing and cut list.')],
 'Energy code':[('systems-energy','Systems › Energy code.')],
 'Heating and cooling':[('systems-loads','Systems › Heating and cooling.')],
 'Electrical service':[('systems-electrical','Systems › Electrical service.')],
 'Plumbing':[('systems-plumbing','Systems › Plumbing.')],
 'Plan set':[('sheets','Documents › Sheets.')],
 'IFC export':[('dlg-ifc','Export IFC.')],
 'Board presentation':[('presentation','Documents › Board presentation.')],
 'Finish board':[('finish-board','Documents › Finish board.')],
 'Schedules':[('schedules','Documents › Schedules.')],
 'AR view and 3D export':[('dlg-ar-export','AR view and 3D export.')],
 '360':[('dlg-pano','360° panorama.')],
 'Walk-through video':[('dlg-video','Walk-through video.')],
 'Home dashboard':[('dashboard','The dashboard.'),('dashboard-dark','The dashboard in dark mode.')],
 "Builder's list":[('cost-takeoff',"Cost › Builder's list.")],
 'Estimate and labor':[('cost-estimate','Cost › Estimate and labor.')],
 'Change orders':[('cost-change-orders','Cost › Change orders.')],
 'Shopping list':[('cost-shopping','Cost › Shopping list.')],
 'Selections and orders':[('cost-selections','Cost › Selections and orders.')],
 'Budget vs actual':[('cost-actuals','Cost › Budget vs actual.')],
 'Bids':[('cost-bids','Cost › Bids.')],
 'Cut plan':[('cost-cut-plan','Cost › Cut plan.')],
 'Job schedule':[('build-schedule','Build › Job schedule.')],
 'Field notes and punch list':[('build-field','Build › Field notes and punch list.')],
 'Wall photos':[('build-wall-photos','Build › Wall photos.')],
 'Inspection prep':[('build-inspections','Build › Inspection prep.')],
 'Homeowner binder':[('build-binder','Build › Homeowner binder.')],
}
used_figs=set()


# ---------- proofreading fixes applied to the source text ----------
FIXES=[
 ("- **Check tab (workflow step 3)** at the top of the window. Its button carries live badges: a red count of errors, an amber count of warnings, or a green check mark when there are none. Its single page is **Issues**.","- **Check tab** in the tab bar at the bottom of the window. It wears a live badge: a red count of errors or, when there are none, an amber count of warnings. Its single page is **Issues**."),
 ("(see 1.3)","(see *Adjustable rule values* below)"),("(see 1.9)","(see *Aging in place* below)"),
 ("Sheets (see 4.3):","Sheets (see *Every sheet the plan set can produce* in the Documents part):"),
 ("| See 3.7 |","| See *Systems sheets* below |"),("see 5.5)","see *Walk-through video* in the next chapter)"),
 ('; the setting "revClouds" can turn them off',''),
 ("(revision clouds; can be turned off with the `revClouds` setting)","(revision clouds)"),
 (" Pins can be hidden on the plan with the `field.hidePins` setting.",""),
 ("— the `gradeOffset` setting; a new project starts at 24\".","— a new project starts at 24\"."),
 ("(`version` 1)",""),
 ("- The catalog also exists as a JSON file (appliances.json: `{\"generated\": \"...\", \"models\": [ {brand, model, type, subtype, label, w, h, d, cutout:{w,h,d,note}, clear:{above,side,back,note}, fuel, elec, price, url, price_note, sources[], notes} ]}`); the program's copy is built from it.","- The appliance catalog is also kept as a data file that lists every model with its brand, type, size, cut-out, clearances, fuel, electrical need, price and sources; the program's copy is built from it, and a vendor catalog import of the *Appliances* kind adds to it."),
 ('"Each analysis uses your own Claude usage." Outside Claude the mode explains','When the program runs outside an AI service the panel explains'),
 ("inside Claude, **Identify trim and finishes** sends the photo (reduced to 1600 px) to Claude, which","when an AI service is available, **Identify trim and finishes** sends the photo (reduced to 1600 px) to it, and the assistant"),
 ('"Pick one to four photos. Claude looks at them,','"Pick one to four photos. The assistant looks at them,'),
 ("Click the **Library** button in the top bar","Click the **Library** button in the title bar"),
 ("### Item properties (the right-hand panel for a placed item)","### Item properties (the Inspector for a placed item)"),
 ("(right-hand panel, **Title block**)","(Inspector, **Title block**)"),
 ("Tabs across the top; click a tab to open its tool groups.","Ribbon tabs run across the top of the ribbon; click a tab to open its tool groups."),
 ("### Header bar","### Menu bar"),("### Designer menus (in the header menu slot)","### Designer menus (in the menu bar)"),
 ("Options can be renamed and deleted in the Project panel (§9.6)","Options can be renamed and deleted in the Project panel (see *Design options* in the chapter on selecting and editing)"),
 ("**Plan check panel** (Properties panel variant)","**Plan check panel** (an Inspector panel)"),
]
def apply_fixes(t):
    for a,b in FIXES: t=t.replace(a,b)
    t=re.sub(r'\b[Pp]roperties panel\b','Inspector',t)
    t=t.replace('right-hand panel','Inspector')
    return t

# ---------- chapter sources ----------
def split_h2(path):
    text=apply_fixes(open(path,encoding='utf-8').read())
    text=text.split('\n',1)[1] if text.startswith('# ') else text   # drop the file title
    parts=re.split(r'(?m)^## ',text)
    out=[]
    for p in parts[1:]:
        title,body=p.split('\n',1)
        out.append((title.strip(),body))
    return out

def rewrite_section_refs(body,chapmap,localnums):
    # "§n.m" / "§n" inside a file refer to that file's ## numbering -> global chapter numbers
    def rep(m):
        n=int(m.group(1)); rest=m.group(2) or ''
        g=chapmap.get(n)
        return f'§{g}{rest}' if g else m.group(0)
    return re.sub(r'§(\d+)(\.\d+)?',rep,body)

BOOK=[]  # list of ('part',title,blurb) | ('chapter',title,html)
def add_part(title,blurb): BOOK.append(('part',title,blurb))
def add_chapter(title,body_md,src=None):
    BOOK.append(('chapter',title,body_md))

# Part 1: front matter (hand written)
front=open(f'{H}/front.md',encoding='utf-8').read()
add_part('Getting started','Installing the program, finding your way around the window, light and dark mode, and a first project.')
for t,b in re.findall(r'(?ms)^## (.+?)\n(.*?)(?=^## |\Z)',front): add_chapter(t,b)

def load(path,part_title,part_blurb,order=None,strip_num=True):
    secs=split_h2(path)
    if part_title: add_part(part_title,part_blurb)
    return secs

core=split_h2(f'{H}/inv-core.md'); lib=split_h2(f'{H}/inv-library.md'); chk=split_h2(f'{H}/inv-checks-docs.md'); cost=split_h2(f'{H}/inv-cost-build.md')
def title_of(t): return re.sub(r'^\d+\.\s*','',t).strip()

# plan the chapter order first so cross references can be renumbered
plan=[('part','The window','The menus, the tab bar, the command palette, standards, lessons, shortcuts and project files.'),
      ('ch','core',0),('ch','core',4),
      ('part','Designing','The Designer, every drawing and placement tool, selecting and editing, and the 3D view.'),
      ('ch','core',1),('ch','core',2),('ch','core',3),
      ('part','The Library and vendors','The catalog, custom items, vendor catalogs and price books, appliances, finishes and paint.'),
      ('ch','lib',0),('ch','lib',1),
      ('part','Kitchens and baths','Cabinets, countertops, tile, hardware, the NKBA guidelines and the kitchen drawings.'),
      ('ch','lib',2),
      ('part','Measuring','Photos, tape measurements, scans and plan images, making walls and field notes.'),
      ('ch','lib',3),
      ('part','Checking','The Check page and every code, accessibility, NKBA, structure, clash, aging-in-place and energy rule.'),
      ('ch','chk',0),
      ('part','Structure and systems','Spans and loads, framing, wall removal, electrical, plumbing, heating and cooling, energy and lighting.'),
      ('ch','chk',1),('ch','chk',2),
      ('part','Documents','The plan set, schedules, keynotes, details, revisions, presentation, finish board, renders and exports.'),
      ('ch','chk',3),('ch','chk',4),
      ('part','Cost','Builder\'s list, estimate, change orders, shopping, selections and orders, budget, bids, cut plan and cabinet order.'),
      ('ch','cost',1),
      ('part','Building','The dashboard, the job schedule, field notes, wall photos, inspection prep and the homeowner binder.'),
      ('ch','cost',0),('ch','cost',2),
      ('part','Site and settings','Site and landscape tools, and every project setting in one place.'),
      ('ch','cost',3),('ch','cost',4)]
SRC={'core':core,'lib':lib,'chk':chk,'cost':cost}
# global chapter numbers
chapno=len([b for b in BOOK if b[0]=='chapter'])
chapmaps={k:{} for k in SRC}
for item in plan:
    if item[0]=='ch':
        chapno+=1; k,i=item[1],item[2]; local=re.match(r'^(\d+)\.',SRC[k][i][0]); chapmaps[k][int(local.group(1)) if local else i+1]=chapno
for item in plan:
    if item[0]=='part': add_part(item[1],item[2])
    else:
        k,i=item[1],item[2]; t,b=SRC[k][i]
        b=rewrite_section_refs(b,chapmaps[k],None)
        b=re.sub(r'(?m)^### \d+\.\d+\s+','### ',b)      # drop local numbers; CSS numbers chapters and sections
        b=re.sub(r'(?m)^#### \d+(\.\d+)+\s+','#### ',b)
        if k=='core' and i==0:
            b=re.sub(r'(?ms)^### Workflow tabs and page pills.*?(?=^### Option bar)','''### Tab bar and page control

The seven workflows sit in the **tab bar** along the bottom of the window, in job order, each with an icon. Clicking a tab opens the page you used last on that tab (remembered per tab). The **Check** tab wears a red badge with the error count or an amber one with the warning count. Under the menu bar, the **title bar** names the current workflow and, when it has more than one page, shows a **page control** (a segmented control) to switch between them.

| Tab | Pages | Purpose |
|---|---|---|
| **Home** | Dashboard | The job at a glance: Checks, Cost, Schedule, Orders, Field and Recent projects cards, *Open the design*, *New or open a project…*. |
| **Measure** | Photos and measurements | Photos, tape measurements, scans, underlays and field notes. |
| **Design** | Model · Systems (on narrow screens: Plan · 3D · Systems) | Draw and design the model; systems calculations. |
| **Check** | Issues | Code, NKBA, structure, clash and installation checks. |
| **Documents** | Sheets · Schedules | Plan set, presentation, finish board and schedules. |
| **Cost** | Cost | Builder's list, estimate, change orders, shopping, selections and orders, budget vs actual, bids, cut plan, cabinet order. |
| **Build** | Job | Job schedule, field notes and punch list, wall photos, inspection prep, homeowner binder. |

**Check page layout**: left column has severity chips (Errors / Warnings / Tips with counts), category chips (IRC, IBC, ADA, NKBA, Structure, Framing, Electrical, Plumbing, Appliances, Cabinets, Energy, Zoning, Landscape, Model), a search box, *Show reviewed*, and the issue list grouped by level ("Whole job" for project-wide items). The middle is the plan with markers; the right column shows the chosen issue (severity pill, title, code reference, detail, where), *Show it in Design*, *Select it*, and a *Reviewed, leave as is* checkbox. Reviewed issues hide from the list and the plan until something about them changes but still print in the permit checklist. With nothing chosen it shows a summary table and *Wall framing and cut list…* / *Floor and ceiling joists…* buttons.

''',b)
            b=b.replace('### Option bar (right side of the workflow bar)','### Title bar controls (right side)')
            b=b.replace('Under the header is the workflow bar','Under the menu bar is the title bar')
        add_chapter(title_of(t),b)

add_part('Appendices','File formats, troubleshooting, where to get help, the glossary and the index. Every keyboard shortcut is listed in the chapter on the window chrome.')
app=open(f'{H}/appendix.md',encoding='utf-8').read()
for t,b in re.findall(r'(?ms)^## (.+?)\n(.*?)(?=^## |\Z)',app): add_chapter(t,b)
gl=open(f'{H}/glossary.md',encoding='utf-8').read()
for t,b in re.findall(r'(?ms)^## (.+?)\n(.*?)(?=^## |\Z)',gl): add_chapter(t,b)

# ---------- render ----------
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')[:60]
out=[]; toc=[]; index={}; ids=set()
def uid(base):
    i=base; n=2
    while i in ids: i=f'{base}-{n}'; n+=1
    ids.add(i); return i
chap=0
for kind,title,body in BOOK:
    if kind=='part':
        pid=uid('part-'+slug(title))
        out.append(f'<section class="part" id="{pid}"><div class="part-inner"><div class="part-label">Part</div><h1>{html.escape(title)}</h1><p>{html.escape(body)}</p></div></section>')
        toc.append(('part',title,pid,[]))
        continue
    chap+=1; cid=uid('ch-'+slug(title))
    h=md(body)
    # headings -> ids, figures, toc
    secs=[]
    def h3rep(m):
        t=re.sub(r'<[^>]+>','',m.group(1)); sid=uid(cid+'-'+slug(t)); secs.append((t,sid))
        figs=''
        for key,lst in FIGS.items():
            if key.lower() in t.lower() and key not in used_figs:
                used_figs.add(key); figs=figgroup(lst); break
        index.setdefault(t,sid)
        return f'<h3 id="{sid}">{m.group(1)}</h3>'+figs
    h=re.sub(r'<h3>(.*?)</h3>',h3rep,h)
    h=re.sub(r'<h4>(.*?)</h4>',lambda m:f'<h4 id="{uid(cid+"-"+slug(re.sub(r"<[^>]+>","",m.group(1))))}">{m.group(1)}</h4>',h)
    # bold terms in the glossary become index entries
    if title=='Glossary':
        def gl_rep(m):
            t=m.group(1); sid=uid('gl-'+slug(t)); index.setdefault(t,sid); return f'<p class="gl" id="{sid}"><strong>{t}</strong>'
        h=re.sub(r'<p><strong>(.*?)</strong>',gl_rep,h)
    # markdown images in front matter
    h=re.sub(r'<p><img alt="(.*?)" src="shots/(.*?)\.png" /></p>',lambda m:figure(m.group(2),html.unescape(m.group(1))),h)
    h=h.replace('<blockquote>','<blockquote class="note">')
    def tblrep(m):
        t=m.group(0); cols=t.count('<th>'); cls='tbl'
        if cols>=6: cls+=' wide'
        if 'Lines (frame)' in t: cls+=' vendors'
        return f'<div class="{cls}">'+t+'</div>'
    h=re.sub(r'<table>.*?</table>',tblrep,h,flags=re.S)
    h=re.sub(r'(<h3 id="[^"]+">.*?</h3>)(\s*<p>.*?</p>)?(\s*<div class="tbl"><table>.*?<tbody>\s*<tr>.*?</tr>)',lambda m:'<div class="keep">'+m.group(1)+(m.group(2) or '')+m.group(3)+'</div>'if False else m.group(0),h,flags=re.S)
    out.append(f'<section class="chapter" id="{cid}"><h2 data-chapter="{chap}"><span class="chno">{chap}</span>{html.escape(title)}</h2>{h}</section>')
    toc[-1][3].append((title,cid,secs)) if toc and toc[-1][0]=='part' else toc.append(('chapter',title,cid,secs))

# table of contents
t=['<section class="toc" id="toc"><h1>Contents</h1>']
cn=0
for kind,title,pid,chs in toc:
    t.append(f'<div class="toc-part"><a href="#{pid}">{html.escape(title)}</a></div>')
    for ctitle,cid,secs in chs:
        cn+=1
        t.append(f'<div class="toc-ch"><a href="#{cid}"><span class="n">{cn}</span><span class="t">{html.escape(ctitle)}</span><span class="pg"></span></a></div>')
        for st,sid in secs:
            t.append(f'<div class="toc-sec"><a href="#{sid}"><span class="t">{html.escape(st)}</span><span class="pg"></span></a></div>')
t.append('<div class="toc-ch"><a href="#index"><span class="n"></span><span class="t">Index</span><span class="pg"></span></a></div>')
t.append('</section>')

# index
ix=['<section class="index" id="index"><h1>Index</h1><div class="ix-cols">']
letter=None
for term in sorted(index,key=lambda s:re.sub(r'[^a-z0-9]','',s.lower())):
    L=re.sub(r'[^A-Za-z0-9]','',term)[:1].upper()
    if L!=letter: letter=L; ix.append(f'<div class="ix-letter">{L}</div>')
    ix.append(f'<div class="ix"><a href="#{index[term]}"><span class="t">{html.escape(term)}</span><span class="pg"></span></a></div>')
ix.append('</div></section>')

logo='cover-logo.jpg'
cover=f'''<section class="cover"><div class="cover-art"><img src="{logo}" alt="A&amp;A Remodeling"></div>
<div class="cover-text"><div class="cover-kicker">User manual</div><h1>Remodel Studio</h1><div class="cover-sub">The complete guide to every page, tool and report</div><div class="cover-ver">Version {VERSION} · Windows and web</div></div></section>
<section class="titlepage"><div class="tp-logo"><img src="{logo}" alt=""></div><h1>Remodel Studio</h1><div class="tp-sub">User manual · Version {VERSION}</div>
<div class="tp-body"><p>Remodel planning for one designer: measure, draw, design kitchens and baths, check against the 2021 IRC and IBC, the 2010 ADA Standards and the NKBA guidelines, size the structure and the systems, price the work, print the plan set and run the build.</p></div>
<div class="tp-foot"><p>Prepared for A&amp;A Remodeling.</p><p>Remodel Studio runs on your own computer; no account, subscription or internet connection is needed. The program's calculations are planning numbers and do not replace a licensed engineer, trade or contractor.</p><p>International Residential Code and International Building Code are registered trademarks of the International Code Council. NKBA and KCD are trademarks of the National Kitchen &amp; Bath Association. Other product and brand names belong to their owners.</p><p>October 2026.</p></div></section>'''

PAGED_CFG='''<script>window.PagedConfig={auto:false};</script>'''
PAGED_RUN='''<script>
(function(){const heads={};
class RepeatHeads extends Paged.Handler{constructor(c,p,q){super(c,p,q);}
  afterParsed(parsed){parsed.querySelectorAll('table').forEach(t=>{const th=t.querySelector('thead');if(th&&t.dataset.ref)heads[t.dataset.ref]=th.cloneNode(true);});}
  afterPageLayout(pageEl){pageEl.querySelectorAll('table[data-split-from]').forEach(t=>{if(t.querySelector('thead'))return;const h=heads[t.dataset.ref];if(h)t.insertBefore(h.cloneNode(true),t.firstChild);});}
  // move a page break that lands in the first rows of a table, in a lead paragraph or in a figure back to before the heading above it
  onOverflow(overflow,rendered,bounds){try{let n=overflow.startContainer;if(n.nodeType===1){const c=n.childNodes[overflow.startOffset];if(c)n=c;}if(n.nodeType!==1)n=n.parentElement;if(!n)return;
      let block=null;const tr=n.closest('tr');const tbl=n.closest('.tbl');
      if(tbl){const rows=tbl.querySelectorAll('tbody tr');const idx=tr?Array.prototype.indexOf.call(rows,tr):0;if(idx<=2&&!tbl.previousElementSibling?.matches('.pagedjs_hyphen'))block=tbl;}
      else if(n.closest('figure'))block=n.closest('figure');
      else if(n.matches('p')&&n.previousElementSibling&&/^H[34]$/.test(n.previousElementSibling.tagName))block=n;
      else if(n.closest('ul,ol')&&!n.closest('li')?.previousElementSibling&&n.closest('ul,ol').previousElementSibling&&/^H[34]$/.test(n.closest('ul,ol').previousElementSibling.tagName))block=n.closest('ul,ol');
      if(!block)return;
      let h=block.previousElementSibling,steps=0;
      while(h&&steps<2&&!/^H[34]$/.test(h.tagName)){if(h.matches('p')&&h.textContent.length<400){h=h.previousElementSibling;steps++;}else return;}
      if(!h||!/^H[34]$/.test(h.tagName)){const lead=block.previousElementSibling;if(lead&&lead.matches('p')&&lead.textContent.length<160&&lead.previousElementSibling)h=lead;else return;}
      if(h.previousElementSibling&&/^H[23]$/.test(h.previousElementSibling.tagName))h=h.previousElementSibling;
      if(!h.previousElementSibling)return;   // the heading is already first on the page
      overflow.setStartBefore(h);return overflow;}catch(e){}}}
Paged.registerHandlers(RepeatHeads);window.PagedPolyfill.preview().then(f=>{document.body.dataset.pagedDone=String((f&&f.total)||document.querySelectorAll('.pagedjs_page').length);});})();
</script>'''
doc=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Remodel Studio User Manual</title>
<style>{open(f"{H}/manual.css").read()}</style></head><body>
{cover}
{''.join(t)}
{''.join(out)}
{''.join(ix)}
{PAGED_CFG}
<script src="node_modules/pagedjs/dist/paged.polyfill.js"></script>
{PAGED_RUN}
</body></html>'''
open(f'{H}/manual.html','w',encoding='utf-8').write(doc)
print('chapters',chap,'figures',len(used_figs),'index',len(index),'words',len(re.sub(r'<[^>]+>',' ',doc).split()))
