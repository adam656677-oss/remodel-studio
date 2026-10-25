# Remodel Studio — Core inventory (chrome, Designer, drawing tools, editing, 3D, project files)

All lengths in the program are inches internally and are shown as feet and inches (for example `12'-6 1/2"`). Any length box accepts `12'6"`, `12-6`, `150"`, `6 ft 3 in`, `6′ 3″` (pasted from the iPhone Measure app), `1.9 m`, `45 cm` or `120 mm`. A bare number is read as **feet** in wall-length and level boxes and as **inches** in door, window, thickness and most other boxes.

---

## 1. The window chrome

### 1.1 Header bar

Left to right:

- **Remodel Studio** brand mark.
- **File**, **Edit** and (outside the Design › Model page) **Help** menus. On the Design › Model page the Designer adds its own menu set in this same slot (View, Place, Report, Design, Draw, Dimensions, Render, Window, Help — see §2.2).
- **Project name**. A bullet (•) after the name means there are unsaved changes; hovering shows "(not saved)".
- **Search or ask** button with `Ctrl K` badge — opens the command palette (§1.8).
- **Undo** and **Redo** arrow buttons (greyed out when there is nothing to undo or redo). Undo history holds the last 200 changes.

### 1.2 File menu

| Item | Shortcut | What it does |
|---|---|---|
| New… | Ctrl+N | Opens the **New project** dialog: *Blank project* or *Sample house*. If the current project has unsaved changes a warning shows with a *Save current project* button. A blank project starts from **My standards** (§1.10) when any are saved. |
| Open… | Ctrl+O | Desktop: Windows Open dialog filtered to `.rsp` (and older `.json`) files. Browser: the **Open** dialog listing projects saved in this browser (name, square footage, saved date; *Open* / *Delete* per row) plus *Open a file on this computer…* (Chrome/Edge) or *Open a .json file…*. |
| ↻ *recent files* | — | Desktop only: up to 8 recently opened files, each reopens that file. |
| Save | Ctrl+S | Desktop: writes the current `.rsp` file (or asks where to save the first time). Browser: saves to this browser's project list and, if the project was opened from or saved to a file handle, rewrites that file too. |
| Save as… | Ctrl+Shift+S | **Save as** dialog: *Project name* box. Desktop: *Choose where to save…*. Browser: *Save in this browser* and *Save to a file on this computer…* (or *Download as a .json file* where file pickers are not available). The copy becomes the open project and gets a new project id. |
| Rename project… | — | Renames the open project (Enter confirms). |
| Backups… | — | Desktop backups dialog (§5.4). |
| Versions… | — | Named snapshots kept in this computer's browser storage (§5.5). |
| Show file in folder | — | Desktop only; opens Explorer at the saved file (disabled until the project has a path). |
| Download a copy (.json) | — | Browser only; downloads the project as a `.json` file. |
| Copy or paste project text… | — | Opens the **Save or open** text dialog: the whole project as JSON text with *Copy project*, *Download .json*, *Open pasted text*, *Open .json file*, and *New project…* (blank or sample, with a confirm step). |
| **Import ▸** | | *DWG or DXF drawing…* (import dialog) · *3D model (OBJ, GLB, DAE, STL)…* · *Vendor catalog…* · *Photos and scans…* (goes to Measure › Photos and measurements) · *Walls from a scan or plan photo…* |
| **Export ▸** | | *Print plans (PDF) and DXF…* (goes to Documents › Sheets) · *IFC for Revit or Archicad…* · *AR view and 3D model (USDZ, GLB, STL)…* · *Materials list (CSV)…* (goes to Cost) · *Homeowner binder (PDF)…* · *Render (photoreal)…* (Render studio) · *Photo match…* |
| My standards… | — | §1.10. |

### 1.3 Edit menu

| Item | Shortcut | What it does |
|---|---|---|
| Undo | Ctrl+Z | Steps back one change. |
| Redo | Ctrl+Y (also Ctrl+Shift+Z) | Steps forward. |
| Cut | Ctrl+X | Copies the selection to the program clipboard and deletes it. |
| Copy | Ctrl+C | Copies the selection (walls bring their doors and windows along). |
| Paste | Ctrl+V | Pastes on the current level, offset 24" right and down per paste (the second paste 48", and so on). A copied door or window pastes further along the same wall; if there is no room the message "There is no room to paste that here" shows. Rooms are pasted as "*name* copy". |
| Duplicate | Ctrl+D | Copy and paste in one step, 24" offset. |
| Rotate 90° or flip | E | Fixtures and cabinets turn 90°; stairs turn 90° (or step N→E→S→W); roofs swap ridge direction; a door swaps hinge side then swing side; section cuts, dormers, chimneys, MEP items and other parts turn as their type allows. |
| Delete | Del | Deletes the selection (every item of a multi-selection). Deleting a wall removes its doors and windows. |
| Select nothing | Esc | Clears the selection. |
| Save selection as block… | — | Opens **Blocks** with the selection ready to name (§1.12). |
| Blocks… | — | Opens the Blocks dialog. |

### 1.4 Help menu

Lessons… (§1.11) · Keyboard shortcuts (`?`, §1.13) · Appearance (light or dark)… (§1.9) · My standards… (§1.10). On the Design page the Designer's own Help menu adds *How the Designer works* (shows a one-line tip).

### 1.5 Workflow tabs and page pills

Under the header is the workflow bar: numbered tabs in job order. Clicking a tab opens the page you used last on that tab (remembered per tab). When a tab has more than one page, pills appear beside it.

| # | Tab | Pages (pills) | Purpose |
|---|---|---|---|
| 1 | **Home** | Dashboard | The job at a glance: Checks, Cost, Schedule, Orders, Field and Recent projects cards, *Open the design*, *New or open a project…*. |
| 2 | **Measure** | Photos and measurements | Photos, tape measurements, scans, underlays and field notes. |
| 3 | **Design** | Model · Systems (on narrow screens: Plan · 3D · Systems) | Draw and design the model; systems calculations. |
| 4 | **Check** | Issues | Code, NKBA, structure, clash and installation checks. The tab shows a red error count, an amber warning count, or ✓. |
| 5 | **Documents** | Sheets · Schedules | Plan set, presentation and schedules. |
| 6 | **Cost** | Cost | Builder's list, estimate, shopping, selections, orders, budget vs actual. |
| 7 | **Build** | Job | Job schedule (tab) and Field notes and punch list (tab). |

**Check page layout** (Design › Issues): left column has severity chips (Errors / Warnings / Tips with counts), category chips (IRC, IBC, ADA, NKBA, Structure, Framing, Electrical, Plumbing, Appliances, Cabinets, Energy, Zoning, Landscape, Model), a search box, *Show reviewed*, and the issue list grouped by level ("Whole job" for project-wide items). The middle is the plan with markers; the right column shows the chosen issue (severity pill, title, code reference, detail, where), *Show it in Design*, *Select it*, and a *Reviewed, leave as is* checkbox. Reviewed issues hide from the list and the plan until something about them changes but still print in the permit checklist. With nothing chosen it shows a summary table and *Wall framing and cut list…* / *Floor and ceiling joists…* buttons.

### 1.6 Option bar (right side of the workflow bar)

- **Design option** dropdown: lists the options (the first is "Option A") plus **+ New option (copy)**, which snapshots the current model as a new option (named Option B, C…) and switches to it. Switching options swaps the whole model (walls, rooms, fixtures and so on); the active option is the one drawn, checked and printed. Options can be renamed and deleted in the Project panel (§4.6).
- **Compare** dropdown (shows only when there are 2+ options): *Compare: off* or *vs Option X*. The other option's walls that differ are drawn in magenta on the plan.
- **Remodel layer**: *Existing + new* (default), *Existing only*, *New only*. Filters walls, doors/windows and fixtures by their remodel status in both the plan and 3D.
- **Level** dropdown: the level you are working on, sorted by elevation.
- **Library** button (hidden on the Design › Model page, which has the Catalog dock instead): opens the Library panel on the right (doors, windows, cabinets, fixtures, trim, finishes and colors). If you are on a non-drawing page it also returns you to the Design page.

### 1.7 Narrow-screen (phone/tablet) layout

Below 820 px the Design tab offers Plan, 3D and Systems pages, the classic left **tool rail** with fly-out groups replaces the ribbon, and the Inspector collapses to a drawer with a ▴/▾ button. Two-finger pinch zooms and pans the plan.

### 1.8 Command palette — Search or ask (Ctrl+K)

Press **Ctrl+K** or click **Search or ask**. One text box; ↑ ↓ move, Enter runs, Esc closes. It works offline.

What you can type:

- **Command names** – every page ("Go to Check › Issues"), Save / Open / New / Save as / Backups / Versions, Undo / Redo, every dialog (Roof wizard, Floor and ceiling joists, Wall framing and cut list, Remove or open a wall, Change cabinet door style and finish, Countertop slab layout, Lessons, 360° panorama, Walk-through video, Photo match, Export IFC, Store prices, Import DWG or DXF, Import 3D model, Import vendor catalog, Keyboard shortcuts, Blocks, Walls from a scan or plan photo, Homeowner binder, My standards, Appearance), Render studio, AR view and 3D export, specific Cost/Documents/Build tabs (Cut plan for sheet goods, Bids and quotes, Actual costs, Change orders, Selections and orders, Finish board, Board presentation, Inspection prep, Homeowner binder, Wall photos, Job dashboard), every **Tool:** (switches to Design and picks the tool), every **Schedule:**, and every **Level:**.
- **"Place: …" catalog items** – type part of a catalog code or name (for example `B36`, `sink base`, `pendant`). Up to eight matching library items appear as *Place: <item>* with their catalog category; choosing one switches to Design and arms the placing tool so your next click in the plan places it.
- **Questions and simple commands**, answered from the model itself (an **Answer** box appears; some answers add an action row):
  - *how many / count / number of …* (`how many base cabinets in the kitchen`, `how many lights on the second floor`) → count and list, with *Select them in Design*. Scope words "in the <room>" or "on the <level>" are understood. `how many errors` gives the error and warning counts.
  - *select / find / show / where is / highlight …* → matches with a select action.
  - *area / square feet / how big of <room or level>* → square footage.
  - *linear feet / how long / length of …* → total length of matching walls or fixtures; `linear feet of counter` totals countertop runs.
  - *cost / price / estimate / budget* → estimate total, materials, labor, unpriced count and $/sq ft, with *Open the estimate*.
  - *errors / issues / what's wrong* → error list with *Open the Check page*.
  - *move the <thing> 6 in left* (also `move it 6 in left` for the selection; directions left/right/up/down/north/south/east/west/forward/back) → *Move it* action.
  - *set the lights in the kitchen to 3000K* → *Apply* action that sets color temperature.
- **Local AI (optional)** – the footer shows *Use a local AI (Ollama)…*. Turning it on looks for Ollama at `127.0.0.1:11434`; if it is running, a model dropdown appears and any question longer than three characters gets an extra row *Ask the local AI (model): "…"*. The answer (with a *Copy* button) is produced from a plain-text summary of the project (levels, rooms, placed items, electrical counts, openings, estimate, check results). Nothing leaves the computer. If Ollama is not running the footer says so with a *Turn off* link. The chosen model and the on/off choice are remembered.

### 1.9 Appearance dialog (Help › Appearance)

Three radio buttons: **Follow Windows** (default; uses Windows Settings › Personalization › Colors), **Light**, **Dark**. Applies to the whole program including the plan and 3D views, immediately. *Done* closes.

### 1.10 My standards (File › My standards / Help › My standards)

Your personal defaults that every new blank project starts with. The dialog shows a table of what is saved: Cabinets (door style, finish, line, vendor), Trim profiles, Framing (floor joist size and spacing, ceiling joists, foundation type), Estimate (markup %, contingency %, tax %, own-labor flag), Code (IRC or IBC, ADA on, NKBA on), Energy (climate zone) and the saved date. Buttons: **Save this project's settings as my standards**, **Apply my standards to this project** (cabinets without their own style follow the new defaults), **Clear**, Close. Standards also carry the snap grid, waste %, hardware finish and brand, selections and the designer name. The sample house and lesson projects do not receive standards.

### 1.11 Lessons (Help › Lessons)

Cards for each lesson with level, minutes and step count; **Start** opens a fresh practice project (your own project stays available under File › Open; save it first if it has changes). Lessons: *Kitchen basics: a one-wall kitchen* (Beginner, 15 min), *Work triangle, aisles and an island* (Intermediate, 20 min), *Bath planning: clearances that pass* (Beginner, 15 min), *From design to order: styles, codes and change orders* (Advanced, 20 min). While a lesson is open a **Lesson** panel floats over the workspace listing the steps; each step checks itself off as the model meets it, the current step shows its hint, other steps have a *Hint* link, and there are *All lessons*, *Close lesson* and a collapse (–/+) button.

### 1.12 Blocks (Edit › Blocks)

A block is any group of walls, doors, cabinets, fixtures, drafting or site items saved for reuse in this or any other project. Select items first (Shift-drag a box), name them, **Save selection as block**. The list shows *Accessible bath templates* (walls, a 36" door, fixtures and grab bars to the 2010 ADA Standards) and *Your blocks*, each with **Place** (arms the Block tool: click to drop a copy, keep clicking for more, Esc when done) and delete. *Export blocks…* / *Import blocks…* move them as a `.json` file. Blocks live in this computer's browser storage.

### 1.13 Keyboard shortcuts (Help › Keyboard shortcuts, or `?`)

**Program**

| Keys | Action |
|---|---|
| Ctrl+N / Ctrl+O / Ctrl+S / Ctrl+Shift+S | New / Open / Save / Save as |
| Ctrl+Z · Ctrl+Y or Ctrl+Shift+Z | Undo · Redo |
| Ctrl+C / Ctrl+X / Ctrl+V | Copy / cut / paste |
| Ctrl+D | Duplicate |
| Ctrl+K | Search or ask |
| E | Rotate 90° or flip the selection |
| Del or Backspace | Delete the selection |
| Esc | Finish the current run (wall, room, line…), then put the tool away (back to Select), then select nothing; also closes dialogs and menus |
| Enter | Finish a wall/room/shape run or polyline; with a typed length pending, applies that length |
| F | Fit the drawing (plan and 3D) in the window |
| Arrow keys | Nudge the selection 1" (Shift: 12") |
| Shift-drag | Box-select everything inside; Shift-click adds or removes one item |
| Alt-drag or middle-drag | Pan the plan |
| Right-click or double-click | Finish the current run |
| / or ; | Focus the command line |
| ? | Keyboard shortcuts card |
| 0-9 ' " / - (while drawing) | Type a length for the next segment (bare numbers are feet) |
| Shift (while drawing or dragging) | Free angle instead of 45° snaps; drag fixtures freely away from walls |

**Tool keys** (single letter, no modifier): V Select · W Wall · D Door · N Window · R Room · X Fixture · S Stair · O Roof · Y Electric · G Ramp · U Shape · L Dimension · T Note · M Measure · I Line · K Deck · P Porch · J Steps · C Column · H Railing.

**3D walk-through**: W/S or ↑/↓ walk, A/D step sideways, ←/→ turn, Shift hurry, drag to look, Esc stop.

**Command line** (see §3.2): L, PL, REC, C, A, W, M / CO, RO 90, MI, AR, O 6, TR / EX, AD, SEC, and points as `x,y`, `@dx,dy`, `@L<A`.

---

## 2. The Designer (Design › Model)

The Designer is laid out like a kitchen-and-bath design program: menus and a ribbon on top, a dock on the left, one to four view panes in the middle, the Inspector (properties) on the right, an optional Issues dock under the views, and a strip of plan-display tabs with the status readout along the bottom. Layout, pane views, dock choice, ribbon tab, pin state and icons-only state are all remembered between sessions.

### 2.1 Ribbon

Tabs across the top; click a tab to open its tool groups. Each group is a row of buttons with the group name underneath.

- **Pin open / Collapse** button at the right end of the tab row keeps the ribbon body open or collapses it to just its tabs (more room to draw). When collapsed, clicking a tab drops the body down temporarily; it closes after you pick a tool, click elsewhere or press Esc.
- **Icons only / Show labels** toggles button labels (visible only while the body is open).
- Picking a tool from another tab makes the ribbon jump to that tool's tab.

| Tab | Group | Buttons |
|---|---|---|
| **Home** | Select | Select |
| | Clipboard | Copy, Paste, Duplicate, Rotate, Delete |
| | Views | Fit; One, Two, Stacked, Three, Four (pane layouts) |
| | Panels | Browser, Catalog (left dock tabs; clicking the open one hides the dock), Properties (right panel on/off), Issues (dock on/off) |
| **Architecture** | Walls | Wall, Curved wall, Column, Fireplace |
| | Doors and windows | Door, Window |
| | Rooms | Room |
| | Stairs | Stair, L-shaped stair, L stair with winders, U-shaped stair, Spiral stair, Railing |
| | Roof | Roof, Auto roof, Dormer, Skylight, Roof wizard (dialog) |
| | Exterior | Ramp, Deck, Porch, Deck or porch outline, Steps |
| **Interiors** | Place | Fixture, Base cabinet run, Wall cabinet run, Catalog |
| | Kitchen and bath | Layout templates menu (One-wall kitchen, L-shaped kitchen, L-shaped kitchen with island, U-shaped kitchen, Galley kitchen, Bath: tub, toilet and vanity on one wall — applied to the selected room or the first kitchen/bath on the level), Fill run (fills the selected cabinet's run with stock widths and a filler), Door style and finish (dialog), Countertop slabs (dialog), Under-cabinet lights (adds one LED strip under every wall cabinet on the level that has none) |
| **Structure** | Framing | Roof wizard, Floor and ceiling joists, Wall framing, Remove or open a wall (needs a wall selected) |
| | Show | Floor framing plan, Roof framing plan (plan display tabs), Structure check in 3D (colors members by load) |
| | Posts | Column |
| **Systems** | Electrical | Electric, Auto-place this floor (lays out receptacles, lights, switches and alarms to IRC rules; replaces earlier auto-placed devices, keeps manual ones), Link switches (runs a switch leg from each unswitched light to the nearest switch in its room) |
| | Plumbing and HVAC | Plumbing item, HVAC item, Cold water pipe, Hot water pipe, Drain pipe, Gas pipe, Supply duct, Return duct |
| | Calculations | Systems page |
| **Site** | Site and landscape | Driveway, Walkway, Patio, Planting bed, Lawn area, Fence, Retaining wall, Property line, Tree, Shrub, Plant, Play area and surfacing, Play equipment |
| **Annotate** | Dimensions | Dimension, Automatic dimensions, Angle dimension, Radius dimension |
| | Text and tags | Note, Keynote, Tag by example |
| | Markup | Revision cloud, Section cut, Field pin, Wall photo |
| | Measure | Measure, Area takeoff |
| **Draw** | Lines and shapes | Line, Polyline, Rectangle, Circle, Arc, Spline, Ellipse, Polygon, Construction line, Filled region, Shape, Block |
| **Modify** | Modify | Move, Copy, Rotate, Mirror, Mirror copy, Array, Offset, Trim, Extend, Fillet, Chamfer, Scale, Break, Join, Explode, Polar array, Grid array, Match properties |
| **View** | Render | Render, 360° panorama, Video, Photo match |
| | Color by | *Color the views by* dropdown (§4.7) |
| | Export | Export 3D, IFC for Revit or Archicad, Print plans |
| | Saved views | Save view setup |

### 2.2 Designer menus (in the header menu slot)

- **View** – Plan view / 3D perspective / Elevation / Exterior elevation / Reflected ceiling plan *in this pane*; Fit all views (F); Hide/Show roof in 3D; Cut away/Show levels above; Hide/Show electrical on plan; Hide/Show structure check in 3D; *Plan shows:* one entry per plan display tab (All, All (no dims), Cabinets, Countertops, Architecture, Electrical, Plumbing, Furniture, Landscape, Roof framing, Floor framing, NKBA); Normal colors and *Color by …* entries.
- **Place** – Select, Wall, Door, Window, Room, Fixture, Stair, Roof, Electric (with keys); Roof wizard…; Floor joists…; Catalog item (from the left dock)…; Column, Fireplace, Curved wall, Deck, Deck or porch outline, Porch, Steps, Railing, Skylight, Dormer, Plant, Play equipment, Play area, Block, Field pin.
- **Report** – Job dashboard; Check; Schedules; Plan set and presentation; Cost: Builder's list / Estimate / Change orders / Shopping list / Selections and orders / Budget vs actual / Cabinet order; Build: Job schedule and order dates / Field notes and punch list / Wall photos / Homeowner binder; Systems; Store prices….
- **Design** – Cabinet job settings (door, finish, species)… (opens the Project panel); NKBA checks on or off (opens the Plan check panel); Lighting, energy and systems; Layout: one entry per template; Change door style and finish…; Countertop slab layout…; Roof wizard…; Floor framing (joists)…; Wall framing and cut list…; Show roof framing; Show floor framing; Fill the cabinet run; Under-cabinet lights for this level; Remove or open a wall…; Library and customize items.
- **Draw** – every drawing tool, then every Modify tool.
- **Dimensions** – Dimension, Automatic dimensions, Angle dimension, Radius dimension, Measure, Area takeoff; Show all dimensions; Hide dimensions.
- **Render** – Render studio…, Photo match…, 360° panorama…, Walk-through video…, Export 3D model….
- **Window** – One view, Two views side by side, Two views stacked, Three views, Four views; Project browser; Catalog; Hide/Show the left panel; Hide/Show properties panel; Hide/Show issues panel.
- **Help** – Lessons…, Keyboard shortcuts, My standards…, Appearance…, How the Designer works.

### 2.3 Left dock

Two tabs: **Project browser** and **Catalog**; a ‹ button hides the dock (a › tab on the edge brings it back).

**Project browser** (a tree; open/closed state of each branch is remembered):

- **Levels and plans** – each level; the current level expands to *Floor plan*, *Reflected ceiling plan*, *Electrical plan*, *Plumbing plan*, *Cabinet plan (NKBA)*, *Floor framing*, *Roof framing* (each sets the active pane's view and plan display tab).
- **Interior elevations** – one entry per room, expandable to each wall ("North wall · 12'-0"") which opens that wall elevation in the active pane.
- **Exterior elevations** – North/South/East/West views.
- **3D views** – *3D model* plus every saved camera view.
- **Saved view setups** – saved pane layouts (apply by clicking; × deletes) and *Save the current views…* (names and saves the layout, pane views, plan tab, level and color-by).
- **Sheets** – the plan-set sheets by number; clicking opens Documents › Sheets at that sheet.
- **Schedules** – each schedule type; opens Documents › Schedules.
- **Design options** – switch options by clicking.

**Catalog** (the classic catalog list):

- *Catalog* dropdown: **All catalogs (search)** plus grouped catalogs — *Kitchen and bath* (Cabinets, Appliances, Plumbing, Bath accessories, Countertops), *Rooms and furniture* (Living room, Bedroom, Dining room, Office, Kids room, Laundry and utility, Garage and storage, Games and fitness, Electronics, Furniture), *Lighting and decor* (Lighting and fans, Decor and window treatments, Indoor plants, People and pets), *Building* (Doors, Windows, Wall assemblies, Trim and molding, Floors, Wall finishes, Ceilings, Roofing, Siding, Colors), *Outdoor* (Outdoor living, Plants, Landscape, Playground, Hardscape), *More*, and *Cabinet vendor catalogs* (for example KraftMaid).
- Preview picture and info (code, name, dimensions, note) of the picked item.
- Search box (searches the chosen catalog, or every catalog).
- List: `< Categories >` with counts; click a category to list its items as **CODE > Description**. Single-click picks (shows the preview); **double-click** or the primary action button (for example *Place*) arms the placing tool — then click in the plan. Up to three secondary actions show as buttons.
- **Place / Move / Coords** tabs act on the selected placed item:
  - *Place*: **Offset from wall** (0 = tight to the wall; pushes the item out from the wall behind it) with Apply; **Angle** with Apply; **Height off floor** with −/+ step buttons (for items that have an elevation).
  - *Move*: **Step** (1/8", 1/4", 1/2", 1", 3", 6", 1', 2'); arrow pad (↑ ← → ↓), ⟳ rotate 90°, *Forward*/*Back* (along the item's facing), *Turn 15°* / *Turn −15°*.
  - *Coords*: X, Y, Z (height off floor), Width, Depth, Height, Angle — type and press Enter.

### 2.4 View panes

- **Layouts**: One, Two side by side (default), Two stacked, Three, Four. Each pane has a header with a **view dropdown**, the view name, and a □ maximize / ❐ restore button. Click a pane to make it active (the active pane gets the option bar, command line and keyboard focus).
- **View choices** per pane: *Plan view*, *Reflected ceiling plan* (ceiling lights, fans, alarms, wall and tall cabinets; no dimensions), *3D perspective* (only one pane may be 3D at a time), *Wall elevations* ▸ *Elevation: follow selection* (shows the wall the selected item sits on, else the first wall with cabinets) and one entry per room wall, *Exterior elevations* ▸ North, South, East, West.
- **Elevation panes** are drawn at 1/2" = 1'-0" (exterior at 1/4" = 1'-0"), scroll-wheel zoom, drag to pan, double-click or **Fit** to refit; clicking a fixture in an interior elevation selects it.
- The 3D pane has **Roof** and **Cut at level** chips in its corner (plus the 3D toolbar, §4.8).
- Picking a drawing tool activates the first plan/ceiling pane (or turns the active pane into a plan).

### 2.5 Plan display tabs (bottom strip)

All · All (no dims) · Cabinets (cabinets and appliances only, with cabinet callouts) · Countertops · Architecture (no fixtures or electrical) · Electrical · Plumbing (plumbing fixtures only) · Furniture · Landscape (site items, decks; fits to the lot) · Roof framing · Floor framing · NKBA (shows the NKBA issue list beside the plan, with a *Turn on NKBA checks* button if they are off) · Legend (counts of everything placed on the level by category) · Print (jumps to Documents › Sheets). Also in the strip: **Color by** dropdown (§4.7), **Issues** button with the error count (toggles the Issues dock), and the **status strip**: current tool, selected item name (or "Nothing selected"), and "N errors · N warnings (· N NKBA)" which opens the Check page.

### 2.6 Inspector (right panel, "Properties")

Shows the properties of the selected item, or the **Project** panel when nothing is selected. Header: kind, title, **Delete** and ✕ (deselect). Sections have headings; **click a heading to fold or unfold** that section, and the folded set is remembered by heading name across projects. The panel starts with any *Code checks* and *Structure* cards that apply to the selected item, and ends with pinned photos. Section contents per item type are listed with the tools in §3 and §4.

**Project panel** (nothing selected): Project — Name, **Snap grid** (1", 3", 6" default, 1'), **Building code** (House: 2021 IRC / Commercial or city building: 2021 IBC; IBC adds *Occupancy group* and *Fire sprinklers throughout*; IRC adds *Accessible design (2010 ADA checks)*), NKBA settings, counts (walls · openings · rooms, floor area), *Save, open or start new…*; **Foundation** (§3.11); **Landscape** (USDA zone, Show plants: At planting / In 5 years / Mature, Show flowers in 3D); **Trim (whole house)** per trim slot plus trim color; **Design options** (cards with name box, Active pill or *Open*, delete ✕, stats: area, cost, fails; *New option from this one*); **Levels** (§3.10); **Typing lengths** help note.

### 2.7 Issues dock

A strip under the panes with Errors / Warnings / Tips / All filter buttons (with counts), *Open the Check page*, × to close, and up to 200 issues; clicking one goes to the level, selects the item and opens its properties.

---

## 3. Drawing and placement tools

### 3.1 How drawing works

- The plan is a top-down drawing. **Scroll** zooms (Ctrl+scroll zooms faster; range 0.08× to 20×), **Alt-drag**, **middle-drag** or dragging empty space with Select pans, **F** or the **Fit** button fits the building (the Landscape tab fits the lot). A faint grid is drawn at 1 ft (closer zoom), 5 ft or 10 ft; heavier lines every 10 ft.
- A **hint** at the top of the plan explains the current tool's next click. **Coordinates** of the cursor (and the active snap name) show in the corner; a typed length appears as you type.
- **Snapping** (§3.3) is on by default. Hold **Shift** for free angles.
- **Click-click tools** (walls, rooms, lines, polylines): click points; a wall run continues from the last point. Finish with **Enter**, **Esc**, **double-click**, **right-click** or the **Finish** / **Close room** button. Clicking the first point again closes a room or polygon.
- **Typing a length** while a run is active: type `12'6"`, `150"` or a bare number (feet) and press Enter; the next point is placed that far along the cursor direction. Backspace edits.
- **Two-point tools** (circle, rectangle, offset…): first click, second click (rectangles may also be dragged).
- **Click-to-place tools** (fixtures, stairs, electrical, trees…): one click. Many stay armed so you can keep placing; others return to Select after one placement (noted below).
- **Esc** ends the run, a second Esc puts the tool away (back to Select), a third clears the selection.
- A **Display** button (plan corner) opens the Display popover: *Show in the plan* checkboxes (Room names and areas, Wall lengths, Fixtures and cabinets, Electrical, Roof lines, Dimensions, Notes, Drafting lines, Site and landscape, Decks porches and steps, Code-check markers, Floor below (ghosted), Cabinet numbers, Switch legs), the **Snaps** chips, and **Drafting layers** (radio = current layer, color, On/Off, Lock, Print, *New layer*). Default layers: Drafting (blue), Dimensions, Text and notes, Details (purple), Site lines (green). These settings are saved with the project.
- The **option bar** above the plan (badge "Plan · <level>") changes with the tool: Wall → wall type dropdown and **45° snap on/off** chip; Door/Window → type dropdown and *More in the Library…*; Fixture → fixture dropdown (Bath, Kitchen, Laundry, Furniture) and *More in the Library…*; Electric → device dropdown, **Auto-place this floor**, **Link switches to lights**; otherwise **Issues shown/hidden**, **Electrical shown/hidden**, and **Move underlay** (when an underlay image or scan exists on the level; drag it with Select).
- The **ghosted floor below** is drawn under the current level's plan.

### 3.2 Command line

A text box under the plan (press **/** or **;** to focus it; Esc clears and leaves). Type and press Enter:

- **Tool aliases**: L/line, PL/pline/polyline, REC/rect/rectangle, C/circle, A/arc, SPL/spline, H/hatch/fill, W/wall, R/room, D/door, N/window, DIM/dimension, T/text/note, V/select, S/stair, ROOF, DECK, PORCH, STEPS, COL/column, RAIL, M/move, CO/CP/copy, RO/rotate, MI/mirror, MC (mirror copy), AR/array, O/offset, TR/trim, EX/extend, AD/autodim, SEC/section, ME/measure, CAB (base cabinet run), CURVE (curved wall), DORMER, AUTOROOF, EL/ellipse, POL/polygon, RC/revcloud, XL/xline, F/fillet, CHA/chamfer, SC/scale, BR/break, J/join, X/explode, APO (polar array), AG (grid array), MA/matchprop, AA/area, DAN/dimang, DRA/dimrad. Any registered tool id also works.
- **Points**: `12',8'` absolute; `@36",0` relative to the last point; `@10'<90` distance and angle (degrees, counter-clockwise). A bare length (`12'6"`) applies to the active run.
- **Values**: `GRID 3"` snap grid; `OSNAP on|off|all|end mid int…` snap modes (bare `OS` opens Display); `LAYER name` / `LA name` switches to or creates a drafting layer (bare opens Display); `RO 90` rotates the selection 90° (about the first clicked point if the Rotate tool is active, else its center); `O 10'` sets the offset distance and arms Offset; `AR 5` sets the array count and arms Array; `F 6` fillet radius; `CHA 12` chamfer distance; `SC 0.5` scale factor; `POL 8` polygon sides; `APO 8` polar array count; `AG 4x5` grid array rows × columns; `SS` select similar (same kind; drafting: same layer and shape; fixtures: same type).
- **Actions**: `U`/undo, `REDO`, `Z`/zoom/fit, `E`/erase/del/delete.
A short reply ("Snap grid 6"", "Rotated 90°", "Unknown command…") appears beside the box.

### 3.3 Snapping and grid

- **Snap grid** default **6"** (Project panel: 1", 3", 6", 1'). Free clicks round to the grid.
- **Object snaps** (Display popover or `OSNAP`): Endpoint ■, Midpoint ▲, Intersection ✕, Center ○, Perpendicular ⊥ (needs a previous point), Nearest (off by default) and Grid. On by default: end, mid, int, cen, perp, grid. Snaps work on wall centerlines and faces, wall ends, door/window jambs, room corners and edges, drafting lines (ends, centers of circles and arcs), decks, fixture corners, columns and site lines. Snap tolerance is about 12 screen pixels. A glyph at the cursor shows which snap is active and the coordinate readout names it.
- **45° snap** (wall option bar chip, default on): while a wall, room, shape, dimension or drafting run has a previous point, the next point snaps to 45° increments and whole grid steps; Shift inverts it for that click.
- Room drawing also snaps to other room corners and back to the room's first corner.

### 3.4 Tool table

Keys are single letters with no modifier. "Stays armed" means you can keep placing; "→ Select" means the tool returns to Select after one placement.

| Tool | Key | What it does | How to use |
|---|---|---|---|
| **Select** | V | Select, move, stretch and edit | Click an item. Drag to move (snaps to the grid; cabinets and plumbing fixtures snap their backs to the nearest wall unless Shift is held; wall-mounted electrical snaps to the wall face). Drag a wall's end dot to stretch it (joined wall ends move together); drag a room's corner dot to reshape. Shift-click adds/removes items; Shift-drag an empty area box-selects. Drag empty space to pan. Clicking a code-check marker opens that issue. |
| **Wall** | W | Straight walls, continuous run | Pick the wall type in the option bar. Click corner after corner (or type lengths + Enter). Closing on the first point ends the run. Enter/Esc/double-click/right-click/Finish stop. Walls are status **New**. |
| **Curved wall** | — | A curve built from short straight walls (so doors and windows still fit) | Three clicks: start, end, a point the curve passes through (its bulge). Uses the current wall type. Selects all the segments. |
| **Door** | D | Door in a wall | Hover a wall; a ghost shows the door hinged at the end nearest the pointer, swinging to the side you are on. Click to place. Option bar: *Standard 36" door* or any library door (Interior swing, Exterior entry, French and double, Sliding patio, Pocket, Bifold closet, Barn, Garage and overhead, Commercial storefront, Accessible…). Default 36" × 80". |
| **Window** | N | Window in a wall | Hover a wall and click. Option bar: *Standard 36" × 48" window* (sill 36", double-hung) or a library window (Bedroom egress, Transom, …). |
| **Room** | R | Room polygon (name, use, finishes, area) | **Click inside closed walls** and the room draws itself (auto-detect, snapped to wall centerlines), or click each corner in order and close on the first corner / Enter. New rooms are "Room N", use Living. |
| **Fixture** | X | Cabinets, plumbing fixtures, appliances, furniture (basic set) | Pick a type in the option bar (Bath: Toilet, Lavatory sink, Vanity cabinet, Bathtub 60", Shower 36", Roll-in shower 60"×30"; Kitchen: Base cabinet, Sink base, Wall cabinet, Tall pantry, Range, Refrigerator, Dishwasher, Island; Laundry: Washer, Dryer; Furniture: Queen bed, Sofa, Dining table) or any Library/Catalog item. A ghost follows the cursor; click to place. Wall-backed items turn to put their back against the nearest wall. Stays armed. |
| **Base cabinet run** / **Wall cabinet run** | — | Fills a stretch of wall with stock cabinets | Click where the run starts against a wall (a corner or a door edge), then where it ends along the same wall. Fills with widths 36" down to 9" and a filler for the remainder; a ghost previews. |
| **Stair** | S | Straight stair | Click where the bottom step starts (36" wide, 10" treads, runs up the page). → Select. Set shape, direction, width, rise in the panel. |
| **L-shaped stair** / **L stair with winders** / **U-shaped stair** / **Spiral stair** | — | Stairs of that shape | One click at the bottom step (spiral: 60" diameter). Press E to turn. → Select. |
| **Railing** | H | Guard/handrail along any edge | Click points along the edge; Enter/Esc finishes. 36" high, balusters. |
| **Roof** | O | Rectangular roof | Drag a rectangle over the walls (ghost shows size), or click once to roof the whole level from its outline. New roofs: gable, 6/12, 12" overhang, ridge along the long side. → Select. |
| **Automatic roof** | — | Roofs the level from its outside walls | One click anywhere. L, T and U footprints get a roof per wing with valleys. Existing roofs on the level are replaced. Style/pitch/overhang come from *Automatic roof settings* in the Project panel. → Select. |
| **Dormer** | — | Dormer on a roof slope | Click on a roof slope where the dormer's front wall goes; it faces down the slope. Press E to turn. → Select. |
| **Skylight** | — | Skylight on the roof plane under the click | Click on a roof (show roof lines). Default 2×4 fixed. |
| **Fireplace and chimney** | — | Fireplace with chimney | Click to place; turn it so the firebox faces the room. Chimney height is figured from the roof. |
| **Column or post** | C | Column | Click. 8" square by default; style, size, height, bottom in the panel. |
| **Ramp** | G | ADA ramp from an outside door | Click on the outside wall at a door; the ramp runs away from the house at 1:12 with 60" landings, 48" wide. → Select. |
| **Deck** / **Porch** | K / P | Rectangular deck or porch against the house | Drag a rectangle (or click two corners); the edge touching the house snaps to the wall face and becomes the ledger. Porches come covered with columns. Minimum 24" each way. → Select. |
| **Deck or porch outline** | — | Any-shape deck | Click each corner; close on the first or Enter. → Select. |
| **Steps or stoop** | J | Landing and steps | Click an outside wall at a door (the landing centers on the door) or the edge of a deck/porch. Sized to code from the floor height. → Select. |
| **Electric** | Y | Electrical device | Pick the device in the option bar (Receptacles: Duplex, GFCI, Countertop GFCI, Weatherproof GFCI, 240-volt, Floor, USB; Switches: Single-pole, 3-way, Dimmer, Occupancy sensor; Lighting: Ceiling light, Recessed, Pendant, Ceiling fan with light, Wall sconce, Exterior wall light, Under-cabinet, Exit sign; Ventilation and safety: Bath exhaust fan, Smoke alarm, CO alarm, Smoke/CO combo; Power and data: Panel, Data or TV jack, Thermostat, Doorbell or camera). Click to place; wall devices snap to the wall face on the side you click. Stays armed. |
| **Plumbing item** / **HVAC item** | — | Plumbing or HVAC symbol | Click to place (water heater by default for plumbing, floor supply register for HVAC); each click repeats the last type used; change the type in the panel. Wall items snap to the wall. |
| **Cold water / Hot water / Drain / Gas pipe**, **Supply / Return duct** | — | Pipe or duct runs | Click points along the run; Enter/Esc finishes. Size and height in the panel. |
| **Driveway** / **Patio** / **Planting bed** / **Lawn area** / **Property line** | — | Site areas | Click the corners; close on the first point or Enter. Placed on the ground level. → Select. |
| **Walkway** / **Fence** / **Retaining wall** | — | Site lines | Click points; Enter/Esc finishes. Walk 36" wide; fence 72" high; retaining wall 30" high × 12" thick. → Select. |
| **Tree** / **Shrub** | — | Generic tree (20' canopy) or shrub (42") | Click; keep clicking. Kind and size in the panel. |
| **Plant** | — | A specific plant species | Click; places the last plant chosen (boxwood by default). Pick species in the Library › Landscaping or in the panel. |
| **Play equipment** | — | Playground item (GameTime catalog) | Click; places the chosen item with its dashed use zone. Pick items in the Library › Playground. |
| **Play area and surfacing** | — | Safety surfacing outline | Click the corners; close on the first. → Select. |
| **Shape** | U | Custom solid (built-ins, porches, planters, angled counters) | Click the corners of any outline; close/Enter. Makes a 36"-high extrusion. |
| **Line** | I | Drafting line(s) | Click points; each segment is its own line. Enter/Esc stops. |
| **Polyline** | — | Connected line, one object | Click points; click the first point to close; Enter/Esc finishes. |
| **Rectangle** | — | Rectangle | Drag or click two corners; `@w,h` for an exact size. |
| **Circle** | — | Circle | Click the center, then a point on the circle (or type the radius). |
| **Arc (3 points)** | — | Arc | Click start, a point it passes through, end. |
| **Spline (smooth curve)** | — | Smooth curve | Click 3+ points; Enter finishes; click the first point to close. |
| **Ellipse** | — | Ellipse | Click the center, then a corner of the box it fits in. |
| **Polygon (equal sides)** | — | Regular polygon (6 sides default; `POL 8`) | Click the center, then a corner. |
| **Construction line** | — | Endless guide line that never prints | Click a point, then a direction point. Stays armed. |
| **Filled region (hatch)** | — | Hatched/filled area | Click the corners; close/Enter. Default diagonal pattern; pick the pattern in the panel. |
| **Revision cloud** | — | Scalloped cloud around a changed area | Click around the area; click the first point to close. Tag it with a note. |
| **Block** | — | Place a saved block | Pick a block in Edit › Blocks first, then click to drop copies (center at the click). Esc when done. |
| **Dimension** | L | Linear dimension that prints | Click two points (snaps to wall ends and corners; 45° snap from the first point). 18" offset by default; drag to move. |
| **Automatic dimensions** | — | Exterior dimension strings (overall, corners, door and window centers) | One click. Earlier automatic dimensions on the floor are replaced. → Select. |
| **Angle dimension** | — | Angle between two legs | Click the corner (vertex), a point on the first leg, a point on the second leg. |
| **Radius dimension** | — | Radius/diameter note with arrow | Click a circle or arc, then where the label goes. → Select. |
| **Note** | T | Text note (prints in capitals) | Click where it goes; type the text in the panel. → Select. |
| **Keynote** | — | Numbered note tag (diamond) tied to a project-wide keynote list | Click to place; reuses the last keynote; pick another or make a new one in the panel. |
| **Tag by example** | — | Labels every item like the one you click | Click a cabinet, appliance, door, window, light or room; every item of that kind on the level gets a tag (cabinet code, appliance model, door/window mark, light mark, room name and area). Stays armed. |
| **Section cut** | — | Section line that becomes a building-section sheet (A3.x) | Click the start and end; it snaps square to the plan. Letters A, B, C… assigned automatically. → Select. |
| **Field pin** | — | Pin for an existing condition, punch item, question or photo spot | Tap where it is; add a note and photos in the panel. |
| **Wall photo (before drywall)** | — | Camera mark pinned to a wall | Click the wall on the side you stood; add photos in the panel. |
| **Measure** | M | Temporary distance readout | Click two points (45° snap from the first). A third click starts over. Nothing is added to the model. |
| **Area takeoff** | — | Tagged outline showing square feet and perimeter | Click around any area; close on the first point. Stored as a dashed orange drafting outline. |
| **Move** | — | Move the selection by two points | Select first. Click a base point, then the destination (or type `@x,y` / `10'<90`). Stays armed. |
| **Copy** | — | Copy the selection | Select first; base point, destination. Stays armed for more copies. |
| **Rotate** | — | Rotate the selection | Select first; click the pivot, then move the mouse (snaps to 15°; Shift for any angle) and click — or type an angle such as `30` or `-90` (`RO 45` rotates about the center). |
| **Mirror** / **Mirror copy** | — | Flip the selection across a line (copy keeps the original) | Select first; click two points of the mirror line (45° snap). Door swings flip with their walls. |
| **Array (row of copies)** | — | N copies in a row (3 default; `AR 5`) | Select first; base point, then the spacing point. |
| **Polar array** | — | Copies around a center (6 default; `APO 8`) | Select first; click the center. → Select. |
| **Grid array** | — | Rows × columns (3×3 default; `AG 4x5`) | Select first; base point, then the diagonal spacing point. → Select. |
| **Offset** | — | Parallel copy of a line, polyline, circle or **wall** (6" default; `O 10'`) | Click the item, then the side. A wall offset makes a parallel new wall. Stays armed. |
| **Trim** | — | Cut away part of a drafting line | Click the part to remove; it is cut back to the nearest crossing lines or wall faces on each side. |
| **Extend** | — | Stretch a drafting line to the next edge | Click near the end of the line; it extends to the next line or wall face it points at. |
| **Fillet** | — | Join two lines (or two walls) at a corner, rounded by the fillet radius (0 = square; `F 6`) | Click the first line, then the second. For walls, both are trimmed/extended to meet. |
| **Chamfer** | — | Cut a corner back (6" default; `CHA 12`) | Click two lines. |
| **Scale** | — | Scale the selection (×2 default; `SC 0.5`) | Select first; click the base point. |
| **Break at a point** | — | Split a drafting line in two | Click the line where it should split. |
| **Join lines** | — | Join selected end-to-end lines into one polyline | Select the lines; click anywhere. → Select. |
| **Explode into lines** | — | Break selected polylines/rectangles into lines | Select; click. → Select. |
| **Match properties** | — | Copy layer, line type, weight, color and fill between drafting items | Click the source item, then each item to change. Esc when done. |

### 3.5 Walls

- **Wall types (presets)**: Exterior 2×4 (5 1/2" thick, bearing) — the default; Exterior 2×6 (7 1/2", bearing); Interior 2×4 (4 1/2"); Interior 2×6 (6 1/2"); Pony wall 42" (half wall, 4 1/2" thick, 42" high); Knee wall 36" (2×4, 36" high). Walls without their own height use the level's wall height (default **96"**).
- **Wall panel (Inspector)**: *Size* — Length (editing stretches the wall), Framing preset (plus Custom), Thickness, Height (blank = level height). *Structure and plan* — Load-bearing wall checkbox; *Remove this wall (wizard)…* / *Removal: beam, posts and footings…*; *Framing and cut list…*; Side (Exterior/Interior); **Remodel status** (Existing / New / Demolish); Siding (exterior walls: Vinyl, Fiber cement lap, Brick veneer, Wood lap, Poured concrete or block); Outside color / Color (both sides); a note with the opening count. *Add to this wall* — Door at center, Window at center.
- Plan drawing: new walls, existing walls and demolished walls are styled differently; wall lengths are labeled along exterior walls (interior walls when zoomed in or selected). Joined walls clean up at corners.

### 3.6 Doors and windows (openings)

- **Door panel**: Door editor (Door type: Swing, Double swing, Sliding, Pocket, Bifold, Barn (surface slider), Overhead garage; Door style: Flush, 6-panel, 2-panel, Shaker 1-panel, 5-panel shaker, Louvered, Half-lite glass, Full-lite glass, French, 6-lite craftsman, Plank/barn, Hollow metal, Aluminum storefront, Raised-panel garage, Garage with window row; Slab material, Thickness, Glass, Sidelites and width, Transom and height, Frame, Door color, Outside color, Threshold, Door stop, 20-minute rated, Self-closing, Kick plate, Peephole/viewer; Hinge side and Handing tiles; **Hardware**: Handle type, Function, Finish, Brand, Rose, Lever shape, Hinge size, Hinge corners, Hinges per leaf, Screen); *Size* — Type (Door/Window), Width, Height; *Position* — From wall start (edge of the opening from the wall's starting corner), **Flip hinge side**, **Flip swing**; a warning pill if under 36" (ADA 32" clear); *Outside trim and shutters* on exterior walls (Outside casing: None/1x4/1x6/1x8 craftsman; Trim color); *Header* on bearing/exterior walls (Size automatically or a beam size).
- **Window panel**: Window editor (operation picture, lock and crank finish, screen), Width, Height, **Sill height** (default 36"), Projection (Flat in the wall / Bay 45° / Bay 30° / Bow / Garden or box window, with *Projects out* depth), Grilles (None, Colonial 6 over 6, Prairie, Craftsman 3 over 1, Diamond), Top (Square / Half-round transom / Eyebrow arch — exterior, non-bay), Opens as (Double-hung, Casement, Slider, Awning, Fixed), Net clear opening readout, Position, Frame color, outside casing, Shutters (None, Louvered, Raised panel, Board and batten, Bahama) with shutter color, trim color, header.
- Doors and windows move along their wall when dragged; copies paste further along the wall. A window whose sill is below grade on an exterior basement wall gets a window well automatically.

### 3.7 Rooms

- Room panel: Name, **Use** (Living, Bedroom, Kitchen, Dining, Bath, Hall, Laundry, Closet, Garage, Office, Meeting or assembly, Classroom, Retail or sales, Storage, Shop or work bay, Corridor, Other — sets code rules and floor live load), **Floor finish** (Carpet, Vinyl plank, Hardwood, Tile, Sealed concrete; default tile for bath/kitchen/laundry, concrete for garage, vinyl plank otherwise), Floor area, Perimeter, Corners. **Finishes and colors**: Ceiling (Flat drywall smooth, knockdown, orange peel, popcorn, and vaulted/tray/coffered and other kinds), Ceiling height (blank = level height; for vaulted: *Flat at (collar ties)* height), Walls finish (Painted drywall eggshell, Level 5 smooth, Orange peel, Knockdown, Shiplap, Beadboard…), Wall color, tile settings, Ceiling color, Floor color, and *Trim in this room* (per slot, with *Use the whole-house trim*).
- Auto-detect: with the Room tool, click inside enclosed walls (doors and windows count as wall) and the outline is traced and snapped to wall centerlines.
- Drag a selected room's corner dots to reshape; drag the room to move it.

### 3.8 Stairs

Stair panel: *Layout* — Shape (Straight, L-shaped with landing, L-shaped with winders, U-shaped (switchback), Spiral), Direction up (Up the page, Right, Down the page, Left, Angled), Turns (right/left), Risers before the turn, Winders in the turn (2–4), Gap between flights (U), Turns through degrees (spiral, 180–720), Width (spiral: Diameter), Tread depth (10" min), Total rise (blank = auto from the level above, else level height + 12" floor depth). *Rails and finish* — Handrails (When required (4+ risers), Right, Left, Both, None), Open sides with balusters, Closed underneath, Tread color. *Result* — risers count and height, Riser/Tread/Width OK pills (IRC R311.7: 7 3/4" max riser, 10" min tread, 36" wide). The floor above gets an opening over the stair automatically.

### 3.9 Roofs

Roof panel: *Shape* — Style (Gable, Hip, Dutch gable, Gambrel, Mansard, Shed, Flat or low slope), Pitch x/12 (flat: drainage slope and parapet height; gambrel/mansard: upper and lower pitch and break-in distance; dutch: gablet set-in), Overhang (default 12"), Ridge runs (Left to right / Top to bottom), Slope the other way (shed), Wall height under it. *Eaves and gutters* — Fascia board (1x4/1x6/1x8/1x10), Boxed soffit, Gutters and downspouts with gutter color (white/bronze/black/copper), Rake trim, Trim color. *Footprint* — Width, Depth, Peak above floor. *Framing and covering* — Covering, Roof color, Framing (Rafters and ceiling joists / Engineered trusses) with rafter size, spacing (12/16/19.2/24), lumber species, or truss type, truss spacing, heel height, hip girder setback and plies; *Roof wizard…* button. Pressing **E** on a roof swaps its ridge direction.

### 3.10 Levels and stories

In the Project panel › **Levels** (listed top to bottom): a radio to work on that level, Name, Floor elevation, Wall height, *Floor and ceiling framing* (Foundation type on the ground level: Crawlspace / Slab on grade / Basement; Floor joists size and Spacing; Joists run; Girders every; Lumber; on the top level Ceiling joists and Attic storage; *Joist layout, I-joists and floor trusses…*), Delete level. Buttons: **Add level** (new level above the top one: elevation = top + height + 12" floor framing depth, same wall height; named "Second floor" then "Level N"), **Add basement** (8"-thick concrete walls inside the ground-floor footprint, 8 ft tall, a Basement room; sets the foundation to Basement), **Copy exterior walls up** (copies the exterior walls to the level above, creating it if needed), **Make attic rooms** (finds the space under the roof with 4 ft or more of headroom and puts knee walls and a room there), **Roof this level**, and *Automatic roof settings* (Style: Gable/Hip/Dutch gable/Gambrel, default Hip; Pitch default 6; Overhang default 12"; *Roof this level automatically*).

### 3.11 Foundation, grade and exterior (Project panel › Foundation)

Type (Crawlspace, Piers and beams, Stem wall with filled slab, Slab on grade, Basement); **Finished floor above the ground** (grade offset, default 24"); **Ground falls across the house** (fall) with *Downhill toward* (N, NE, E, SE, S, SW, W, NW); Exposed foundation finish (Brick, Painted block, Parged, Stone veneer, Siding carried down); for piers: Skirting (Lattice, Vinyl/board, Brick curtain wall, Open), Pier size, Piers every; Foundation color; Foundation vents and Crawlspace access door (crawl); Footings (Width, Thickness, Bottom below grade); *Add steps at every outside door*.

Deck/porch panel: Name, Type, Surface (Treated wood, Composite, Cedar, Concrete, Brick pavers, Stone or tile), color, Top below the floor, Boards run, Joists/Spacing, Posts every, Skirting, area and height readouts; *Railing* (Where: only where required over 30" / all open sides / none; Style: Wood balusters, Metal balusters, Cable, Glass, Solid board; Height; color); *Roof over it* (Covered checkbox; Shed/Gable/Hip, pitch, overhang, beam height, Columns style and size, column spacing, Ceiling beadboard/open rafters, roof color). Steps panel: Landing depth (0 = none) and width, Steps go (Straight out / Down the left / Down the right), Tread depth, Landing top below floor, Total drop, Built from (Concrete, Brick, Stone, Treated wood, Composite), color, Handrails, Rail style, riser/tread/landing pills. Column panel: Style (Square, Round, Tapered craftsman, Turned, Plain 6x6 post), Size, Height, Bottom above the floor (negative to reach the ground), Color. Railing panel: Style (adds Pipe handrail only), Height, Bottom above the floor, Color.

### 3.12 Site, landscape, drainage and playground

- **Site item panel**: Surface/Kind/Style (Driveway: Concrete, Asphalt, Gravel, Pavers; Patio: Pavers, Concrete, Flagstone, Brick; Walkway: Concrete, Pavers, Stepping stones, Gravel, Brick; Planting bed: Mulch, Pine straw, River rock; Lawn: Sod, Seed; Fence: Wood privacy, Picket, Chain link, Split rail, Ornamental iron, Vinyl privacy; Retaining wall: Segmental block, Stone, Timber, Concrete; Tree: Shade, Evergreen, Ornamental, Palm; Shrub: Rounded, Boxwood, Ornamental grass), Color, Canopy spread/Height (tree), Width (walk), Height (fence), Height above grade and Thickness (retaining wall), Area or Length. Beds add Mass planting species with spacing and plant count, Edging (None, Steel, Aluminum, Plastic, Brick soldier course, Natural stone), Landscape fabric; lawns add Grass (Bermuda, St. Augustine, Zoysia, Centipede, Tall fescue); both add Irrigation (None, Spray heads, Rotors, Drip line).
- **Plant panel**: picture, Plant species (grouped by kind), botanical/size/sun/water/zone note, zone warning, Size to buy, Mature spread, Mature height, Show size (At planting / In 5 years / Mature), "Shown now" size.
- **Drainage checks** run automatically: ground sloping toward the house (IRC R401.3), walkway slope (ADA 403.3/405.2), steep driveways, and low window sills high above grade (R312.2.1). Downspouts and drainage arrows appear on the site sheet when gutters are on.
- **Play equipment panel**: picture, Item (GameTime catalog by category), maker info, Width, Depth, Fall height, Rotation, Colors scheme, Seats (swing frames), play-event counts for structures. **Play area panel**: Surfacing (Engineered wood fiber, Wood chips, Wood mulch, Shredded rubber mulch, and unitary surfaces), Installed depth or Tested critical fall height and Thickness, Border, GameTime product link, Area.

### 3.13 Electrical details

Device panel: Type, Height to center (or ceiling), light output lumens, Color temperature, Dimmable, Fixture mark, Remodel status (Existing/New/Remove), Room, "Placed by Auto-place" note; switches list *Controls these lights* checkboxes (switch legs draw on the plan as curves; faint for unselected switches). Auto-place follows IRC E3901 spacing (general receptacles so no wall point is more than 6 ft from one, counter receptacles every 4 ft, bath GFCI near basins, exhaust fans, 240-V for ranges, and so on).

### 3.14 Drafting item panel

Line/Polyline/Rectangle/Circle/Arc/Spline/Filled region: Layer, Line type (Solid, Dash, Hidden, Center, Dot, Phantom), Line weight (Fine 0.25, Thin 0.5, Medium 0.8, Heavy 1.2, Extra heavy 2), Color on screen, Radius (circle), Fill (No fill, Solid, Diagonal lines, Crosshatch, Concrete, Earth, Gravel, Batt insulation, Brick, Wood grain, Tile grid) with Pattern scale, Length and Angle readouts, Closed (polyline). Drafting prints on plan sheets in black at the chosen weight. Dimension panel: Offset from the points, *Flip to the other side*, Text (blank = measured). Note panel: text, Text size (Small/Normal/Large/Title), *Add a leader arrow* with arrow x/y. Angle dimension: Arc radius. Section cut: Label (up to 3 letters), *Look the other way*. Shape panel: Name, Kind (Outline pushed up / Round: column, post, cone), Bottom and Top diameter (round), Height, Bottom above floor, Color, Footprint, *Cut a hole using* another shape inside it, Remove holes. Ramp panel: Rise, Runs down toward, Width (outside of rails), Slope 1 in N (8–20), Built from (Treated wood/Concrete), Edge curb or guard, runs and total length, compliance pills. Keynote panel: Note picker (+ New keynote), Text, Number, Builder's list item link. Tag panel: *Remove every tag made with this one*. Field pin panel: Type (Existing condition, Punch item, Question, Photo spot), Note, Status/Trade/Due/Assigned to (punch), Severity (condition), *Take or add photo*. Wall photo panel: Stage (Before drywall, Rough-in inspection, During work, Finished), camera mark height (48" default), Date, What it shows, *Other side of the wall*, *Add photos…*, photo grid.

---

## 4. Selecting and editing

### 4.1 Selection
Click with Select. The Inspector shows the item; the status strip names it. **Shift-click** adds or removes an item; **Shift-drag** on empty space box-selects everything inside (the Inspector then lists counts by type with *Delete all*). Clicking in 3D also selects (§4.8). Hit order favors small items (notes, electrical, dimensions, registered parts) over fixtures, stairs, walls, roofs and rooms.

### 4.2 Moving and nudging
Drag to move (grid steps; multi-selections move together). Walls drag with their joined ends; dragging a wall end dot stretches every wall sharing that corner. Arrow keys nudge **1"**, Shift+arrow **12"** (a single selected wall nudges both ends with joined walls). The Catalog dock's *Move* tab offers steps from 1/8" to 2' and Forward/Back along the item's facing. `move the island 6 in left` in Ctrl+K also works.

### 4.3 Rotate, copy, paste, duplicate, delete, undo
See §1.3. Fixtures also have *Turn 90°*, *Turn around*, *Add fillers* (cabinets) and *Add one beside* buttons in their panel. Undo keeps 200 steps; restoring a Version keeps the previous drawing in Undo.

### 4.4 Remodel status
Walls, doors/windows, fixtures, electrical and most parts have **Existing / New / Demolish (Remove)**. Everything you draw is New. Demolished walls and fixtures draw in the demolition style, are left out of 3D, elevations and the new-work takeoff, and show in red under *Color by › Remodel status*. The *Existing + new / Existing only / New only* layer filter (§1.6) hides the others while you work; hidden items are kept safe when you save a change. The *Remove or open a wall* wizard (Structure ribbon / wall panel) handles beams, posts and footings for a removed bearing wall.

### 4.5 Design options
See §1.6 and the Project panel. Each option is a separate copy of the model; the Project panel shows area, priced cost and fail count per option, lets you rename the active one, open another, delete one (not the last), or *New option from this one*. The Compare dropdown overlays another option's differing walls in magenta.

### 4.6 Revisions and revision clouds
Draw revision clouds by hand with the **Revision cloud** tool. In addition, when the contract is locked, each change order records which parts changed; the plan sheets then draw red clouds around those areas with a revision triangle carrying the revision number, and the title blocks list the revision. Void change orders lose their clouds; clouds can be turned off in settings.

### 4.7 Color by
Dropdown in the plan tab strip and the View ribbon: Normal colors, **Remodel status** (Existing grey, New green, Remove red), **Item category**, **Vendor or brand**, **Order status** (Choosing, Approved, Ordered, Delivered, Installed), **Lead time** (≤1 week … over 6 weeks), **Cost** (under $250 … over $3,000), **Issues** (error/warning/tip), **Bearing walls**, **Room use**, **Floor finish**. Plans draw a tinted overlay, 3D swaps materials, and a legend card lists each value with a count (× returns to normal colors). Color-by is saved with view setups.

### 4.8 The 3D view
- **Navigation**: drag to orbit, right-drag or two fingers to pan, scroll or pinch to zoom; the camera cannot go below the ground plane. **Fit** (F) frames the model.
- **Corner chips**: *Show roof* / *Roof*, *Cut at level* (hides levels above the one you are working on), *Sun* (sun study), *Render* (Render studio), *AR / Export*, *Loads* (colors members by capacity: green under 85%, amber 85–100%, red over, blue bearing walls), *Fit*.
- **3D toolbar**: **Walk through** (eye height 64"; W/S or ↑/↓ walk, A/D sidestep, ←/→ turn, Shift hurries, drag to look, Esc stops; doors let you through and walls stop you; on-screen arrow pad for touch; the badge reads "Walking · <level>"), **Views** (name and *Save view*; saved views, including walk views 🚶, replay the camera and feed the board presentation; delete ✕), **Paint** (click any wall, floor, ceiling, roof, cabinet, counter, foundation or other part: a paint card offers the relevant finish dropdown and color swatches — Siding + *All outside walls*; Wall color; room walls finish + color; Floor finish + color; Ceiling kind + color; Roof covering + color + *All roofs*; Foundation finish/skirting + color; Cabinets door style + finish + *Whole kitchen*; Countertop material; fixture or object color), **Framing** (shows studs, plates, headers, joists and rafters), **360°** (panorama dialog), **Video** (walk-through or fly-around recording), **Section cut** dropdown (No section cut, Cut height, Cut left to right, Cut front to back, or any drawn Section A/B/…) with a position slider and **Flip**.
- **Clicking** a part selects it (and opens its properties). Lighting scenes (Cooking, Dinner, Night light, Everything on — per switch group dimmer levels) are set up in Systems › Lighting and used by the render studio.
- **Sun study** (Sun chip): panel with date, time slider (5 AM–9 PM), *Play day*, quick dates (Mar 20, Jun 21, Sep 22, Dec 21), sun altitude/bearing readout, and *Location and orientation* (Place, Top of plan faces compass direction, Latitude, Longitude, UTC offset, US daylight saving). The north arrow on sheets follows the orientation.
- Ceilings are modeled per room (flat, vaulted following the roof, tray, coffered…) and appear when a section cut is active.

---

## 5. Project files, saving and the desktop program

### 5.1 Where projects live
- **Desktop (Windows) program**: projects are **`.rsp`** files (JSON text inside). Older `.json` project files also open. The default folder is **Documents\Remodel Studio\Projects**; the last folder used is remembered. Double-clicking an `.rsp` file in Explorer opens it in Remodel Studio (file association); a second copy of the program hands the file to the running one.
- **Browser version**: *File › Save* stores the project in this browser's project list (name, area, saved date); *Save as* can also write a `.json` file on your computer (Chrome/Edge file picker, which is then rewritten on each Save) or download one. *Download a copy (.json)* and *Copy or paste project text* move projects between computers.
- In both versions a working copy is written to browser storage about 0.3 s after every change (crash recovery); the program reopens it on the next start. On the desktop the window title shows the project name with a • when unsaved.

### 5.2 New, open, save, recent
See §1.2. On the desktop, closing the window with unsaved changes asks **Save / Don't save / Cancel**. The Home dashboard's *Recent projects* card and File menu list recent files (desktop: last 12 kept, 8 shown in the menu). Opening a project lands on the Home dashboard.

### 5.3 File format
A project is one JSON document (`version` 1) holding the name, levels, walls, openings, rooms, stairs, roofs, fixtures, electrical, drafting, site items, settings (grid, code, ADA, foundation, show/snap/layer settings, standards-derived defaults), sheet setup, project info, design options, saved 3D views, view setups and keynotes. Blocks, My standards, theme and layout preferences are kept per computer, not in the file. Photos and Versions are kept in the browser's asset store on the computer.

### 5.4 Backups (desktop)
**File › Backups…** Every save writes a dated copy to **Documents\Remodel Studio\Backups\<project>** (at most one per 3 minutes; the newest 25 kept). While there are unsaved changes an **autosave copy** is written every 5 minutes (newest 40 kept). The dialog groups copies by project with time, Saved/Autosave, size and **Open** (opens as an unsaved copy named "… (restored <date>)" — save it to keep it); *Open the backups folder*. In the browser version the dialog points to Versions instead.

### 5.5 Versions
**File › Versions…** Named snapshots stored in this computer's browser storage: name it (default "Version <date time>"), **Save this version**; the table compares each version's rooms, area and estimate with the current project ("same" or old → now), **Restore** (keeps the current drawing in Undo) and delete.

### 5.6 Desktop program specifics
- Window opens at 1600×1000 (minimum 900×600), remembers size and position, hides its own menu bar (Alt shows a small **View** menu — Reload the program, full screen, zoom in/out/reset, Developer tools — and **Help** menu — Open my projects folder, Open backups folder, Open renders folder, *Use the built-in program version* (ignore an updated program page placed in Documents\Remodel Studio\app), About Remodel Studio).
- Exports and downloads prompt a Windows Save As dialog (default: Documents or the last export folder). Renders go to Documents\Remodel Studio\Renders. Web links open in the normal browser.
- The program uses the graphics card for the built-in renderer; Blender is found automatically (or picked) for photoreal rendering.
