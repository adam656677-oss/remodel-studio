## File formats

| Format | Direction | Where | Notes |
|---|---|---|---|
| `.rsp` | Open, save | File menu (Windows program) | A Remodel Studio project: the whole model, options, revisions, settings, selections, orders, field notes, bids and schedule in one file. Older `.json` projects open too. |
| `.json` | Open, save | File menu (web version), *Copy or paste project text* | The same project as plain JSON text. |
| `.pdf` | Export | Documents, Cost, Build, Render | Plan set, permit package, presentation, finish board, estimate proposal, change orders, bid requests, purchase orders, cabinet order, inspection prep, homeowner binder. |
| `.dxf` | Import, export | File › Import › DWG or DXF; Documents › Print plans and DXF | Export writes layers for walls, openings, rooms, fixtures, dimensions, notes and drafting. Import reads lines, polylines, arcs, circles and text and can turn walls into walls. |
| `.dwg` | Import | File › Import › DWG or DXF | AutoCAD drawings (converted on import). |
| `.ifc` | Export | File › Export › IFC | IFC 2x3 walls, openings, slabs, roofs, spaces and items for Revit, Archicad and IFC viewers. |
| `.obj`, `.glb`, `.gltf`, `.dae`, `.stl` | Import | File › Import › 3D model | Furniture, fixtures and site models placed as items. |
| `.usdz`, `.glb`, `.stl` | Export | File › Export › AR view and 3D model | The model for AR on an iPhone or iPad (USDZ), for other 3D programs (GLB) or for printing (STL). |
| `.csv` | Export | Cost (builder's list, estimate, cut list), Schedules | Opens in Excel. |
| `.xlsx`, `.csv`, `.pdf`, `.json` | Import | File › Import › Vendor catalog; Store prices | Vendor catalogs and price books; store price lists. |
| `.ics` | Export | Build › Job schedule | Calendar file of the schedule phases and the maintenance reminders for Outlook, Google Calendar or the iPhone. |
| `.png`, `.jpg` | Export, import | Render studio, Views, Measure | Renders and saved views out; photos, scans and plan images in. |
| `.pdf` (plans) | Import | Measure › Scans and plan images | A PDF plan placed as an underlay. |
| `.ply` | Import | Measure › Scans and plan images, Walls from a scan | Point clouds from COLMAP, Polycam, 3D Scanner App and other LiDAR apps; large clouds are thinned to about 150,000 points. |

## Troubleshooting

**The 3D view is blank or very slow.** The graphics driver may not support WebGL 2. Update the display driver from the computer maker's site. On a laptop with two graphics chips, set Windows *Graphics settings* to use the high-performance chip for Remodel Studio. Use *Cut at level* to hide the floors above and *One view* while drawing; the model only rebuilds after you stop editing.

**A tool key (W, R, D…) does nothing.** The plan does not have the keyboard focus; click once on the plan (on empty space with Select) and try again. Keys are ignored while the cursor is in a text box.

**My walls will not join at the corner.** Snapping is off or the ends are not on the same grid point. Turn **Snap** on in the Display popover, or drag one wall's end dot onto the other wall's end; the endpoint snap marker (■) shows when it will join.

**The room tool does not trace the room.** There is a gap in the walls. Zoom in at each corner and drag the wall end dots together until the endpoint snap (■) shows; or click the corners yourself with the Room tool and close on the first point. Doors and windows count as wall.

**The Check tab shows errors I disagree with.** Select the issue on the Check page and tick **Reviewed, leave as is**; it leaves the list but still prints on the permit checklist with your note. Check that the **Building code**, **ADA** and **NKBA** switches in the Project panel match the job.

**Prices show "no price".** Those items have no price in the built-in list, your edits, a store price list or a vendor catalog. Type a price in the **Price** column of the builder's list (kept with the project), import a store price list or a vendor catalog, or set your usual prices in **My standards**.

**The vendor catalog import found nothing.** The file's first row must contain column names the importer recognizes (see *Vendor catalog import*). Download the template from the import dialog, paste the maker's data into it and import that. PDF price books work when the text is selectable; a scanned PDF must be run through OCR first.

**A PDF will not download in the web version.** Pop-ups or downloads are blocked for the page. Allow downloads for the site in the browser's address-bar icon, or use the Windows program.

**The project is gone from the browser list.** The browser's site data was cleared or a different browser profile is in use. Open the `.json` copy you saved, or restore a **Version** if one exists. Keep a file copy of every job with **Save as… › Save to a file on this computer**.

**The sample house opens every time.** The last project is remembered only after it is saved once. Save your project with **Ctrl+S**.

**Dark mode does not follow Windows.** **Help › Appearance** is set to *Light* or *Dark*; choose **Follow Windows**.

**Voice notes do not record.** The microphone is blocked. In Windows Settings › Privacy › Microphone allow desktop apps; in the browser allow the microphone for the page.

**The photo assistant says it is not available.** The assistant needs an AI service. In the Windows program it uses a local model when Ollama is installed and running (see *Command palette*); otherwise the photo tools that do not need AI (measuring, color picking, underlays) still work.

**Where are my backups?** **File › Backups…** lists them with dates; *Restore* opens one as a new unsaved project so nothing is overwritten.

## Getting more help

- **Help › Lessons** walks through drawing, cabinets, checks and documents on a practice room.
- **Help › Keyboard shortcuts** lists every key.
- **Ctrl+K** and type a question in plain words: *how many bedrooms*, *square feet of the kitchen*, *what is the panel size*.
- The cover of every PDF the program prints carries the program version; quote it when you report a problem.
