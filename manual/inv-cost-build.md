# Remodel Studio inventory: Home, Cost, Build, Site and outdoors, Settings

All lengths in the program are stored and typed in inches unless a box says otherwise. Any length box accepts `12'6"`, `12-6`, `150"`, `6 ft 3 in`, metric (`1.9 m`, `45 cm`, `120 mm`) or a value pasted from the iPhone Measure app. Wall-length and level boxes treat a bare number as feet; door, window, thickness and most other boxes treat it as inches. Lengths are displayed as feet-inches to the nearest 1/16" (for example `12'-6 1/2"`).

The workflow bar across the top reads **Home · 1 Measure · 2 Design · 3 Check · 4 Documents · 5 Cost · 6 Build**. Cost opens the Cost page (one page, with tabs). Build opens the Job page (one page, with tabs). The program remembers the last tab you were on in each page.

---

## Home dashboard

The Home workflow has one page, **Dashboard** ("The job at a glance"). It is the first thing you see when a project opens.

### Header

- **Project name** (large), then a line of facts: the address, "for *client*" if a client is entered, and `N rooms · N sq ft · N cabinets`. Square feet is the sum of all room areas; the cabinet count leaves out cabinets marked for demolition.
- **Open the design** button opens the Design › Model page.
- **New or open a project…** opens the New project dialog.

### Cards

Each card has a title, a button in its header that opens the related page, and a summary.

**Checks** (Open → Check page). Green when there are no errors, red when there are.
- Big number: count of **errors**; beside it, the count of **warnings**.
- Up to four error titles as links. Clicking one switches to the error's level, opens Design, and selects the item the error is about.
- If there are no errors: "No errors. *N* warnings to review." or "Nothing to review."

**Cost** (Open → Cost › Estimate and labor).
- Big number: the **estimate total** (materials, tax, labor, other costs, markup and contingency). Beside it, the total **spent** from receipts (Budget vs actual).
- A progress bar of spent against budget.
- Note line: `$N budget before markup · $N contingency` and, when some builder's-list items have no price, `· N items not priced`.
- If change orders exist: "N change orders, N waiting for signature."
- If there are no walls yet: "Draw walls to get an estimate."

**Schedule** (Open → Build › Job schedule).
- Big date: the **finish** date, with `N workdays from <start date>`.
- **Now:** the phase in progress today and the date it runs through.
- **Next:** the next phase and its start date.
- With no schedule: "The schedule builds from the estimate's labor hours."

**Orders** (Open → Cost › Selections and orders).
- Chips with the count of tracked items in each status (Choosing, Approved, Ordered, Delivered, Installed) — only statuses with items are shown.
- Red note when items are past their expected arrival date: "N items are past the expected arrival date."
- **Order by** list: the four soonest long-lead order-by dates, each as `date  item  (what it covers)`; a row is red if it should already have been ordered. "No long-lead items yet." when there are none.

**Field** (Open → Build › Field notes and punch list).
- Big number: **open punch items**; beside it `N questions · N wall photos`.
- Up to four open punch items as links (text, and `due <date>` if set). Clicking one opens Design on that level and selects the pin.

**Recent projects** (Open… → the Open project dialog).
- Up to six recently saved projects with the save date; click a name to open it. "Projects you save show here." when empty.

### Footer

"Measure → Design → Check → Documents → Cost → Build. Press Ctrl+K anywhere to find a command or ask the project a question."

---

## Cost workflow

Cost has one page with a row of tabs, in this order:

1. Builder's list
2. Estimate and labor
3. Change orders
4. Shopping list
5. Selections and orders
6. Budget vs actual
7. Bids
8. Cut plan
9. Cabinet order

### Builder's list (takeoff)

A material takeoff counted from the model. The header note reads: "New work only, counted from the model with N% waste. Existing walls are left out; walls marked for demolition are listed under Demolition. Quantities are estimates; confirm before ordering."

**Header controls**
- **Waste %** — a number box, default **10**. Accepts 0–50. Saved with the project. Waste is applied as a multiplier (1 + waste/100) to most quantities; it is not applied to count-type items (one door is one door) or to things like thinset bags, joint compound or paint.
- **Import price list…** — opens a paste box (see "Pricing sources" below).
- **Download CSV** — saves `<project> materials.csv` with columns Category, Item, Quantity, Unit, Unit price, Total, Notes and a final Total row.

**Totals bar**: `N items · N priced · Total $x,xxx.xx` (total counts only priced lines).

**Tables, one per category.** Columns: Item, Qty, Unit, Unit price (editable), Total, Notes. Type a price in the Unit price box to set it; clear the box to remove your price. A price you type is saved with the project and wins over every other price source.

**Units used**: EA (each), LF (linear feet), SF (square feet), SY (square yards), CY (cubic yards), bag, box, roll, square (100 sq ft of roofing or siding), bundle, brick, pair, set, gal, lb, ton, bale, pallet, LS (lump sum), test, note, SF face. LF, roll, square and gallon quantities are rounded up to whole numbers.

**Categories, in the order they appear, and how each is counted (plain words):**

| Category | What is counted |
|---|---|
| Demolition | Walls marked *demolish*: LF of wall to remove (bearing walls are noted "shore first and install the new beam") and SF of drywall to remove (one face for exterior walls, two for interior). Fixtures, cabinets and electrical devices marked demolish: one "Remove …" line each. |
| Masonry | CMU walls: 8" or 12" block at 1.125 blocks per sq ft, Type S mortar (1 bag per 30 blocks), #4 rebar, grout for filled cells. ICF: blocks at 5.33 sq ft each plus core concrete. Glass block: 2.25 per sq ft. |
| Wall framing | For each new wood or metal-stud wall: studs at 16" o.c. plus 1 end stud, 2 per opening and 2 per wall join (precut 92-5/8", 104-5/8" or 116-5/8" when the wall height matches; otherwise stock lengths); plates (double top plate and bottom plate as 16' pieces; on a slab the bottom plate is listed separately as pressure-treated); metal stud and track for metal walls; SIP panels (32 sq ft each); post-frame posts at 8' o.c. and 2x4 girts at 24" o.c.; flat 2x headers for openings that do not need a structural header. Brick or stone veneer walls add bricks (6.75 per sq ft) or SF of stone. |
| Headers and beams | One line per opening header sized by the structure check: LVL plies (1-3/4" x depth x stock length), dimensional lumber plies, or "Engineered header, size by engineer". |
| Floor framing | Per room on a framed floor: floor joists (room width ÷ spacing + 1, at the size the structure check suggests) and 3/4" T&G subfloor sheets (32 sq ft each). |
| Roof and ceiling framing | Ceiling joists per room; rafters per roof (run × pitch factor, both sides unless shed) when the roof is not trussed; ridge board (2x10 or 2x12) by ridge length; dormer framing packages. |
| Sheathing and wrap | 7/16" OSB wall sheathing (32 sq ft per sheet) on exterior wood walls; house wrap (9' x 150' rolls, 1,350 sq ft). |
| Roofing | 7/16" OSB roof sheathing; synthetic underlayment (10 sq rolls); the roof cover by type: shingles in bundles (3 per square) with starter strip along the eaves, metal in SF, tile/slate/shake in squares, low-slope membranes in squares; ridge and hip cap (LF), drip edge (10' pieces), ice and water barrier rolls when turned on, ridge vent (80% of ridge) and continuous soffit vent when turned on, gutters (5" K-style, color noted) and downspouts (2 per eave run). |
| Siding | Brick veneer (bricks), fiber cement / wood / SmartSide planks (8-1/4" x 12', 7" exposure), vinyl or Dutch lap (squares), other sidings in SF. Veneer walls (brick, stone, CMU, ICF) get no separate siding line. |
| Doors and windows | One line per door with its full description (prehung interior/exterior, style, type, size, handing with ANSI code, material, sidelites, transom, 20-minute rating); pocket door frame kits, barn door and bifold track sets. One line per window (operation, size, casement hinge side; frame, glass and screen in the notes). |
| Insulation | R-13 batts (2x4 walls) or R-21 (2x6) by net exterior wall area; R-38 blown attic insulation by room area on the top floor. |
| Drywall | 1/2" 4x12 sheets: one face of exterior walls, both faces of interior walls, ceilings by room area; all-purpose joint compound (4.5 gal boxes) and paper tape (500' rolls) from the sheet count. |
| Ceilings | By the room's ceiling type: acoustic tile (2x2 or 2x4) with grid tees, cross tees and wall angle; T&G, plank, shiplap or beadboard boards (SF); tin tiles; box beams (one about every 4 ft); coffer beam material (4' grid); tray framing; ceiling texture bags; a "Popcorn ceiling: asbestos test before scraping" line for popcorn ceilings. |
| Wall finishes | Tile (backsplash height in kitchens, wet-area height in baths, full height elsewhere), FRP panels, wallpaper (56 sq ft rolls), shiplap/beadboard/paneling/stone/brick (SF), wainscot by its height. |
| Flooring | By room finish: carpet and pad (SY), floor tile (SF) with thinset bags, hardwood, luxury vinyl plank, or any other library finish in SF (porcelain, stone and brick pavers also get thinset). Rooms default to tile in baths, kitchens and laundries, concrete in garages, LVP elsewhere. |
| Trim and molding | From the whole-house (or room) trim choices: base, shoe and chair rail along the room perimeter less door widths; crown by perimeter; casing per door and window (stool and apron when a stool profile is chosen); totals per profile in LF with "about N pieces of 16'"; one box of 2" finish nails. |
| Paint | Wall paint by room (2 coats at 350 sq ft per gallon, color named), ceiling paint (2 coats flat at 400), trim paint (semi-gloss), exterior paint on paintable siding (2 coats at 300). |
| Fixtures and cabinets | Plumbing fixtures, generic cabinets and other fixtures one each; countertop LF (depth noted) for counter-bearing cabinets. |
| Cabinets | One line per cabinet (SKU, door style and finish; price book named in the note). Each carries its own price (see Pricing sources). |
| Cabinet trim and accessories | Crown, light rail, toe skin, scribe, finished ends, panels, legs, corbels and hardware counted from the cabinet run (planning prices attached). |
| Countertops | Slab material from the countertop layout. |
| Appliances | Library appliances one each. |
| Electrical | Devices by type, new-work boxes, old-work (remodel) boxes for existing walls, fan-rated ceiling boxes, 14/2 and 12/2 NM-B cable (about 25 ft per device, 250' rolls), AFCI/dual-function breakers (about 10 devices per 15 A circuit, 4 per 20 A), wire connectors, cover plates. |
| Lighting fixtures | Chosen light fixtures by model with lumens in the note. |
| Door hardware | Levers, knobs, handlesets, pulls, deadbolts, flush bolts, with finish and brand, keyed to the door mark. |
| Plumbing / HVAC | Plumbing and HVAC symbols one each; pipe runs by system and size (LF); duct runs by size (LF). |
| Foundation | Footings, stem walls, slab concrete, block, anchor bolts and the like from the Foundation panel. |
| Decks, porches and steps | Decking, framing, posts, railing (LF), columns, step and landing material (wood or concrete). |
| Fireplace and chimney, Skylights, Tile, Framing (trusses and joists), Windows, Sitework | Added by their own tools when present. |
| Site and landscape | Driveways, patios and walks (concrete CY, asphalt SF, gravel tons, pavers SF plus base), mulch/pine straw/river rock for beds, sod pallets or seed, straw over seed, fence LF and posts, retaining wall SF face, trees and shrubs, edging, landscape fabric, irrigation heads/rotors/drip and valves, controller and backflow preventer, and a "Call 811 before digging" reminder line. |
| Landscape plants | Each species and container size, with the plan key and a planning price in the note; tree staking kits and planting soil for 15-gallon and larger trees. |
| Playground | Equipment by model and color scheme ("price by quote"), swing seats, surfacing (CY for loose fill, SF for unitary), drainage aggregate and geotextile under loose fill, wear mats, accessible entry ramp, borders, certified installation and signage. |
| Ramps and site | Concrete or wood ramps: concrete CY and forming, or treated decking, joists and posts; handrail LF; edge curb LF. |
| Fasteners | 16d framing nails (about 5 lb per 10 studs) and 1-1/4" drywall screws (about 5 lb per 8 sheets). |

Items are tagged "Selected: *brand product*" in the Notes column when a brand has been chosen on the Selections tab (roofing, siding, flooring, countertops, windows, exterior doors, interior doors) and cabinet lines are tagged with the cabinet maker.

**Pricing sources** (lowest to highest priority):
1. **Built-in planning prices.** Cabinets are priced from the generic line (stock / semi-custom / custom multipliers, door style, painted finish and drawer layout factors, rounded to $5); cabinet trim and accessories, chosen light fixtures and brand appliances carry planning prices. These show in the Unit price box as a starting value.
2. **Price-book prices.** If a cabinet dealer price book has been imported (Library › Cabinets) and chosen under Cabinet maker, each cabinet is priced by its SKU from the book.
3. **Store prices import** (Estimate and labor › Store prices › *Import store price list…*). Reads a CSV, Excel or JSON price list or cart export (Lowe's, Home Depot, 84 Lumber, Menards or any supplier), or rows pasted from a web page or spreadsheet. Columns are recognized by header (SKU / Item # / Model, Description / Product / Name, Price / Unit price / Each / Cost, UOM / Unit); without headers the longest text cell is the description and the last money cell is the price. Each builder's-list item is matched by size and description (fractions, inches, feet and dimensions like `2 in x 4 in x 8 ft` are normalized); matches of 55% or better are pre-selected, and you can pick another of up to six candidates or "No match" in each row. Fields: **Store** (text with suggestions), **Choose price list file…**, paste box, **Read pasted rows**, **Only items without a typed price** (checkbox, on). **Apply checked prices** writes the prices and records the store, SKU, description, unit and date for each; the Estimate tab then lists how many prices came from each store.
4. **Import price list…** on the Builder's list tab: paste lines like `2x4 stud 92-5/8" precut, 3.98`; items are matched by name (exact, or 75% of the words) and the matched prices are written. "Matched N of M items from K prices."
5. **Your own price edits** in the Unit price box always win.

### Estimate and labor

A planning estimate built from the builder's list plus labor from production rates. The page is a grid of cards.

**Summary card** (title shows the active design option name)
- Large total.
- Line: `$N per sq ft of room area · about N labor hours · roughly N weeks for a 2-person crew` (weeks = hours ÷ 80, or ÷ 20 when you do the labor yourself).
- Table: Materials (with a warning pill "N items have no price"), Sales tax on materials (N%), Labor (or "Labor (self-performed)"), Dumpsters (N × $cost) when any, Permit when non-zero, each Other cost by name, Overhead and profit (N%) (hidden when self-performed), Contingency (N%), Total.
- **Download estimate PDF** — `<project> estimate.pdf`: page 1 Planning estimate with project, address, date, Summary lines, Total, per-sq-ft and hours, Labor by trade (hours at rate), Design options comparison if more than one option; following pages list every material by category with quantity, item and extended price. Footer: "Planning estimate made with Remodel Studio. Quantities and labor hours are estimates; get quotes before committing."
- **Download CSV** — `<project> estimate.csv` with Section, Item, Hours, Rate, Amount rows for labor, materials, tax, dumpsters, permit, extras, markup, contingency and total.
- Note: "Planning estimate only. Prices come from the Builder's list tab; labor uses rule-of-thumb production rates. Replace the starting rates with local numbers."

**Settings card** (these are the estimate settings; they live here on the Estimate and labor tab and are saved with the project)

| Setting | Default | Notes |
|---|---|---|
| I'm doing the labor myself (show hours, no labor cost or markup) | off | When on, labor cost, overhead/profit and trade risk are zero; hours still show. |
| Overhead and profit % | 15 | Applied to the subtotal (materials + tax + labor + dumpsters + permit + other costs). |
| Contingency % | 15 | Applied to subtotal plus markup. |
| Sales tax on materials % | 7 | On priced materials only. |
| Permit fee $ | 0 | |
| Dumpsters | automatic | Computed from demolition quantities (about one 2,500-unit load; SF counts 1, LF counts 8, each counts 20; at least 1 when there is any demolition, 0 otherwise). Type a number to override. |
| Cost per dumpster $ | 450 | |
| Other costs | none | **Add a cost** adds a row (name, amount, remove ✕); the new row is named "Equipment rental". Suggested uses: engineering, survey, temporary power, cleanup. |

**Labor by trade card.** Table of Trade, Hours, Rate per hour (editable), Labor, with a Total row. Hours come from production rates applied to each builder's-list line (for example studs 0.12 h each, drywall sheets 1.1 h, interior doors 2.5 h, windows 3 h, paint 3.5 h per gallon, cabinets 1.5 h each, tile 0.12–0.15 h per sq ft, roofing 0.33 h per bundle). Trades and default rates:

| Trade | Default $/h |
|---|---|
| Demolition and haul-off | 35 |
| Framing carpentry | 55 |
| Masonry | 60 |
| Roofing | 55 |
| Siding and exterior | 50 |
| Doors and windows | 55 |
| Insulation | 40 |
| Drywall hang and finish | 50 |
| Ceilings | 50 |
| Tile | 60 |
| Flooring | 50 |
| Finish carpentry and trim | 55 |
| Painting | 45 |
| Cabinets and counters | 55 |
| Plumbing | 95 |
| Electrical | 90 |
| General labor | 35 |

**Compare design options card** (only when the project has more than one design option). Rows per option: Area, Materials, Labor, Hours, Total, Per sq ft; the active option is highlighted. Note: all options use the same prices, rates and markups; unpriced items count as $0.

**Store prices card.** "N of M builder's list items have a price. From: Lowe's (12), Home Depot (4)…" plus a note that cabinet trim, moldings and modifications carry planning prices until priced. Button **Import store price list…** (dialog described above).

**Risk by trade card.** An extra contingency percentage on any one trade's labor, on top of the overall contingency. Table: Trade, Labor, Extra % (box per trade, default empty = 0, capped at 100). When any are set, a **Trade risk allowance** total appears and is added to contingency and the total. Ignored when labor is self-performed.

**What changes between options card** (more than one option). Pick **From** and **To** options; shows `To compared with From: ±$N`, then a table of every line whose quantity differs (Item, qty in A, qty in B, Cost change or "not priced") sorted by biggest change, followed by labor hour differences by trade. Checkbox **List the other options as priced alternates in the proposal** (off) — when on, the Proposal PDF lists each non-active option as "Alternate: *name* (add/deduct) ±$N".

### Change orders

Lock the contract when the client signs; afterwards every change to the model is detected against the locked estimate.

**Before locking**: a card "Contract and change orders" with the button **Lock the contract at today's estimate**. Locking stores a snapshot of today's estimate (date, total, materials, labor, every line with quantity and price) and a snapshot of the model.

**After locking**, four statistics: **Original contract (date)**, **Signed change orders** (sum of signed change-order amounts; count), **Contract now** (original + signed), **Unrecorded changes** (difference between today's estimate and the last snapshot, red when positive; count of changed lines).

**How changes are detected and priced**: today's builder's list is compared line by line (category + item + unit) with the last snapshot. Lines whose quantity changed by 0.01 or more are listed as **Added**, **Removed** or **Changed**, with Was and Now quantities and the material cost difference (quantity change × unit price; blank when unpriced). The change-order amount is the difference in the full estimate total, so it includes labor, markup and contingency.

**Creating a change order**: with changes present, type **Describe the change for the client** and optionally **+ days** (working days added or saved), then **Create change order**. This numbers the change order (#1, #2…), dates it, records the lines and amounts, sets its status to *Waiting for signature*, advances the baseline to today's snapshot, adds a revision row to the drawing revision history ("Change order N: description"), and clouds the changed parts on the plan sheets (revision clouds; can be turned off with the `revClouds` setting). Message: "Change order #N recorded as revision R; N changed parts are clouded on the plan sheets. Print it for signatures."

**Change orders table**: #, Date, Description, Amount, Status (select), PDF button. Status options and client signature flow:

| Status | Meaning |
|---|---|
| Waiting for signature | Just created; printed and sent to the client. |
| Signed | Client signed; the amount is added to "Contract now" and the revision row is marked "(signed)". |
| Void | Withdrawn; the revision row is marked "(void)". |

**Change order PDF** (`<project> change order N.pdf`): "CHANGE ORDER #N" and date; Project name; address and owner if entered; **Description of the change**; a table of Item (prefixed + added, − removed, ~ changed), Was, Now, Amount ("labor and markup" when the line has no unit price); Contract before this change; This change order (materials, labor, markup and contingency); New contract amount; "Schedule: adds/saves about N working days" when days were entered; the sentence "The work above is added to or removed from the contract at the amount shown. All other terms stay the same."; Owner and Contractor signature and date lines.

**Unlock the contract** (link at the bottom) removes the lock and all change orders.

### Shopping list

Everything on the builder's list (demolition lines left out), sorted the way you buy it, with check-off boxes saved in the project.

- **Group by**: **By job phase** (default) or **By store department**.
- Job phases, in order: Demolition · Foundation and site · Framing and dry-in · Rough-in · Insulation and drywall · Exterior finish · Interior finishes · Fixtures and final · Landscape.
- Store departments: Tool rental and disposal · Concrete and masonry · Masonry and specialty · Lumber and building materials · Hardware and fasteners · Roofing · Doors and windows · Plumbing · Heating and cooling · Electrical · Insulation · Drywall · Siding and exterior trim · Treated lumber and decking · Flooring · Tile · Wall paneling and finishes · Paint · Millwork and trim · Kitchen and bath · Kitchen and bath fixtures and appliances · Garden center · Other. (There is no aisle-level grouping.)
- **Hide items I have** checkbox.
- **CSV** — `<project> shopping list.csv` (Phase or Department, Item, Qty, Unit, Unit price, Total, Got it).
- **Print list (PDF)** — `<project> shopping list.pdf`, one section per group with check boxes (already-checked items are drawn checked), quantity, item and the other grouping as a right-hand note.
- Totals bar: `N items · N still to get` and **Clear checks** when any are checked.
- Each group shows its priced subtotal; rows show a checkbox, qty and unit, item, the other grouping, and extended price. Checked rows are struck through.

### Selections and orders

One tab with two halves. **Selections** (brands and products) is on top, **Selections and orders** (the tracker) below.

**Selections half**
- Header: "Pick the brands and products for this job. They go on the materials list, the schedules and the proposal. N cabinet makers and N product brands are in the library." Button **Import vendor catalog…**.
- **Door hardware, whole house**: **Finish** (default Satin nickel; choices: Satin nickel, Matte black, Oil-rubbed bronze, Aged bronze, Polished chrome, Stainless steel, Satin brass, Polished brass, Antique brass, White) and **Brand** (default Any brand; Kwikset, Schlage, Baldwin, Emtek, Weiser, Defiant, Yale, Delaney, Nostalgic Warehouse). Every door uses these unless changed in its own panel; hinges, stops and kick plates follow the finish.
- **Cabinets**: shows the chosen cabinet maker, line, door and finish (or "Generic cabinets."); change them in any cabinet's panel (Kitchen style) or the Cabinet maker panel (Brand, Line, Door style, Finish, Price book).
- One section per product category — **Windows**, **Exterior doors**, **Interior doors**, **Roofing**, **Siding**, **Flooring**, **Countertops**, **Plumbing fixtures**, **Appliances** — each with **Brand** (Not chosen / brand list; "(confirm with dealer)" marks unverified entries), then **Product line** (or **Color** for countertops, **Product** for appliances), then **Color** where the line has colors. Notes under the pickers show frame, material or catalog notes; windows show the ENERGY STAR 7.0 Southern-zone U-factor and SHGC; catalog links are listed.
- **Paint colors**: **Paint brand**, then a per-room table of **Wall color** and **Trim and ceiling** color from that brand's palette (choosing a color also sets the room's screen colors), a swatch strip, and the note "Screen colors are close, not exact; check a physical sample."

**Orders half (the tracker)**
- Header: "Track each purchase from choosing to installed. Allowance is what the contract carries; price is what you are actually paying. Lead times of items not yet delivered hold their phase in the job schedule."
- **Show** filter: Everything · Not delivered yet · Choosing · Approved · Ordered · Delivered · Installed.
- Statistics: **Allowances** (sum), **Prices** (sum), **Over or under allowance** (price − allowance for items with both; red when over), **Items** (count; N delivered).
- Rows are generated from the model, grouped by category: **Appliances** (brand and model when a library appliance), **Plumbing fixtures**, **Furniture and decor**, **Other** fixtures; **Cabinets** (one row for the whole set: count, style, finish, maker, rooms, planning price); **Countertops** ("template, fabricate and install"); **Lighting** (one row per light mark: type, Kelvin, dimmable, rooms, count); **Doors and windows** (one row for all windows, one for all doors); **Flooring** and **Tile** (one row per room with finish and sq ft).
- Columns: picture · Item (label, sub-line, Qty) · Room · **Status** (select) · **Vendor** · Estimate (from the builder's list) · **Allowance $** · **Price $** (with the over/under difference shown under it) · **Lead (workdays)** (placeholder is the typical lead) · **Ordered** (date) · **Arrives** (computed) · **Note**. Text boxes save when you leave them or press Enter.

Tracking statuses, in order:

| Status | What happens when you pick it |
|---|---|
| Choosing | Default. |
| Approved | Makes the item eligible for a purchase order (needs a vendor). |
| Ordered | Fills in today's **Ordered** date if empty. |
| Delivered | Records today's delivered date; the item no longer holds the schedule. |
| Installed | Records today's installed date; starts the appliance warranty clock in the binder. |

**ETA / lead times**: typical leads are 14 workdays for refrigerators and ranges, 7 for other appliances and plumbing fixtures, 10/30/45 for stock/semi-custom/custom cabinets, 10 for countertops, 5 for lighting, 25 for windows, 14 for doors, 8 for hardwood, 5 for other flooring and tile. **Arrives** = Ordered date + lead in weekdays, unless you type an ETA. Items not yet delivered feed the job schedule: their remaining lead (lead minus weekdays since ordering) can push back the phase they belong to (appliances, plumbing fixtures and lighting → trim-out; cabinets → Cabinets; countertops → Countertops; doors and windows → Windows; flooring → Flooring; tile → Tile).

**Order-by dates vs the schedule**: the Job schedule's long-lead table and the Dashboard show, for each lead item, the date its phase needs it and the latest **Order by** date (needed date minus lead in workdays). If that date is before the schedule start it says "order at signing"; if the lead actually delays the phase it says "holds the schedule".

**Purchase orders**: items set to *Approved* with a vendor are grouped by vendor with the count and total. **PO PDF** prints a purchase order; **PO PDF and mark ordered** also sets each item to Ordered today with the PO number. PO numbers run `PO-<first four letters of the project>-001`, `-002`… **Purchase order PDF** contents: "PURCHASE ORDER" and number; Vendor; Job (name · address); Date; Ordered by (designer); a table of Item (label — sub-line (room)), Qty, Price (tracker price, or the estimate), Need by (from the tracker's *need* field); Total; "Please confirm prices, lead times and delivery dates in writing."

### Budget vs actual

Log receipts against the estimate. "Over-runs come out of the contingency first."

- **Budget buckets** (automatic): one per material category on the builder's list (priced total), one per labor trade (hidden when self-performed), Sales tax, Dumpsters, Permit, each Other cost, and **Other (not in the estimate)** at $0. Grouped as Materials, Labor, Other.
- Statistics: **Budget (before markup)**, **Spent** (N receipts), **Ordered, not yet paid** (tracker items Ordered/Delivered/Installed at their price or estimate), **Contingency left** (contingency carried minus the sum of over-runs by bucket; red when exhausted).
- **Add a receipt** form: **Date** (today), **Store**, **Amount**, **For** (budget line select grouped Materials / Labor / Other), **Note**, **Photo of the receipt** (camera or file; stored with the project assets). **Add receipt**.
- **By budget line** table: Line, Budget, Spent, Left (red and negative when over), and a bar (green under 85%, amber to 100%, red over).
- **Receipts** table (newest first): Date, Store, Amount, For (changeable), Note, Photo thumbnail (opens full size), delete ✕.
- **Download receipts (CSV)** — `<project>-receipts.csv` (Date, Store, Amount, For, Note).

### Bids

One scope of work per trade, built from the builder's list; request bids, enter quotes, compare with the plan estimate.

- A tab strip of trades present in the job (a ✓ after a trade that has at least one quote). Each trade's scope groups the builder's-list items whose labor belongs to that trade, with their material total and labor hours.
- **Scope of work** text box (default text: "*Trade* for the *project* remodel as drawn. / Approximately N labor hours by the plan estimate. / Protect finished surfaces; clean up daily; haul your own debris. / Work to the 2021 IRC and the drawings; call for your own inspections."). Edit freely; saved per trade.
- **Bidder supplies materials too ($N of materials on the list)** checkbox (off). When off, the request says materials are furnished by the owner. The comparison estimate is labor only, or labor plus materials when on.
- **Bid request PDF** — `<project> bid request <trade>.pdf`: "REQUEST FOR BID" and trade; Job (name · address); Contact (designer); Date; "Please bid labor [and materials] …"; **Scope of work** bullets; **Quantities from the plan** (Item, Qty, Unit, up to 80 lines); fill-in lines for Bid amount, Days to complete, Start available; "Include: license number, insurance certificate, and what is excluded."; Signature and Date.
- Note beside the button: `N line items · plan estimate $N (N h labor [+ materials])`.
- **Quotes** table with three rows: **Bidder**, **Amount**, **Days**, **Start** (date), **Notes**, **vs estimate** (+/− against the plan estimate, red when higher), and a **Choose** button (becomes **Chosen**; click again to unchoose). Below: "The plan estimate for this trade is $N. Chosen bid: *who* at $N."
- **All trades** table (once any quote exists): Trade, Estimate, Low bid, Chosen.

### Cut plan (sheet-goods cut optimizer)

Nests pieces from the plan onto sheets with a cut diagram. Pieces come from the model: drywall by wall (horizontal 4-ft courses, full-length strips, one side for exterior walls and two for interior, openings reduce the count) and by ceiling, subfloor by room (not on a slab), sheathing on exterior walls, cement backer board under tile floors and in tile zones, plus any pieces you add. Nesting is shelf-cut (guillotine) with a 1/8" kerf; pieces may be rotated unless grain is locked.

- **Material** select: 1/2" drywall 4 x 12 · 1/2" drywall 4 x 8 · 3/4" plywood 4 x 8 · 7/16" OSB 4 x 8 · 3/4" T&G subfloor 4 x 8 · 1/2" cement board 3 x 5 ("(none)" after materials with no pieces).
- **Use 4 x 8 sheets instead** checkbox (shown for 4 x 12 drywall) — re-cuts the drywall strips to 8-ft lengths and nests on 4 x 8 sheets.
- **Cut list CSV** — `<project>-cutlist-<material>.csv` (Sheet, Piece, Width, Height, X, Y).
- Statistics: **Pieces**, **Sheets of <material>**, **Yield %** (piece area ÷ sheet area; sq ft of pieces), **Waste** sq ft.
- **Your own pieces (plywood, shelves, boxes)** table: Label, Sheet (select), Width, Height, Qty, **Grain fixed** (checkbox: do not rotate), remove ✕. **Add a piece** adds "Shelf", 3/4" plywood, 11-1/4" x 30", qty 4.
- Cut diagrams: up to 40 sheets drawn with each piece's size; caption "Sheet N · N% used". Pieces too big for the sheet are drawn red.

### Cabinet order

An order report grouped by manufacturer with modifications under each cabinet, "the way a 20/20 order report reads". List prices come from imported price books where loaded, otherwise planning prices. Empty state: "Place cabinets from the Library (Cabinets) or with the cabinet run tool, and the order report fills in here."

- **CSV** — `<project> cabinet order.csv` (Manufacturer, #, Qty, SKU, Description, Attributes, Hinge, List each, List ext; modification rows indented; moldings and accessories; totals).
- **PDF** — `<project> cabinet order.pdf` with the same content and the note "Planning prices. List prices come from your price books where loaded; confirm with the manufacturer or dealer before ordering."
- Order settings (saved with the project):

| Setting | Default |
|---|---|
| Dealer multiplier | 0.45 |
| Margin % | 35 |
| Freight % of net | 3 |
| Install $ per box | 85 |
| Sales tax % | 7 |

- One table per manufacturer: **#** (cabinet number as on the elevations), **Qty**, **SKU** (with hinge tag), **Description** (layout name, W x H x D; attributes line: door style · finish or "custom color" · price book), **Hinge**, **List**; modification rows (code, label, extended price) under each cabinet.
- **Moldings, panels and hardware** table: Qty, Code, Item (with note), List.
- Totals: List total · Net (× multiplier) · Sell at N% margin · Freight N% · Installation, N boxes (fillers are not boxes) · Tax N% · Total.

---

## Build workflow

Build has one page ("Job") with these tabs, in order: **Job schedule · Field notes and punch list · Wall photos · Homeowner binder · Inspection prep**.

### Job schedule

Built from the estimate's labor hours: weekdays only, skipping the major holidays; phases start when the work before them is done.

**Header controls**
- **Start** (date; default today). The schedule begins on the first workday on or after it.
- **Crew** (number, default 2) — the default crew size for every phase.
- **Download CSV** — `<project> schedule.csv`: Phase, Start, Finish, Workdays, Crew, Labor hours; then Payment, Percent, Amount, Due.
- **Proposal PDF** — see below.

**How durations are computed**: each phase adds up the labor hours of its trades (some phases take a share: windows 60% of door/window hours, rough-in 70% of plumbing and electrical, trim-out 30%, first paint 50%, final paint 50%, trim 40% of door hours). Days = hours ÷ (crew × 8), divided by the number of trades for phases whose trades work in parallel, rounded up. Phases with no hours are skipped. Inspections and a few others have fixed day counts. A phase starts on the workday after its latest dependency finishes; long-lead items (ordered at signing) can hold a phase back.

**Workdays and holidays**: Saturdays, Sundays and these holidays are skipped: New Year's Day, Memorial Day, July 4, Labor Day, Thanksgiving and the day after, Christmas Eve and Christmas Day.

**Phases, in order:**

| Phase | Duration from | Starts after | Notes |
|---|---|---|---|
| Permit and ordering | 10 days fixed | start | |
| Demolition | Demolition hours | Permit | |
| Foundation and masonry | Masonry hours | Demolition | then footing and foundation inspection |
| Footing and foundation inspection | 1 day, milestone | Foundation | only when there is foundation work |
| Framing | Framing hours | the inspection | |
| Roofing | Roofing hours | Framing | |
| Windows and exterior doors | 60% of Doors and windows hours | Framing | |
| Plumbing, electrical and HVAC rough-in | 70% of Plumbing + Electrical, in parallel | Roofing, Windows | |
| Framing and rough-in inspections | 2 days, milestone | Rough-in | |
| Siding and exterior trim | Siding hours | Windows | |
| Insulation | Insulation hours | Inspections | then insulation inspection |
| Insulation inspection | 1 day, milestone | Insulation | only when there is insulation |
| Drywall hang and finish | Drywall + Ceilings hours | Insulation inspection | |
| Prime and first coat | 50% of Painting | Drywall | |
| Cabinets and countertops | Cabinets hours | First coat | |
| Countertops: template, fabricate, install | 10 days fixed | Cabinets | only when the model has countertops |
| Tile | Tile hours | First coat, Countertops | |
| Flooring | Flooring hours | Tile | |
| Interior doors and trim | Finish carpentry + 40% of Doors | Flooring, Cabinets | |
| Plumbing and electrical trim-out | 30% of Plumbing + Electrical, in parallel | Cabinets, Countertops, Tile | |
| Final paint and touch-up | 50% of Painting | Trim, Trim-out | |
| Cleanup and general labor | General labor hours | Final paint | |
| Final inspection and punch list | 3 days, milestone | Cleanup | |

**Summary bar**: Start, Finish, N workdays. **Gantt chart**: week lines with dates, a bar per phase colored by trade, diamonds for milestones, day counts at the right.

**Phases table**: Phase (with "then <inspection>" where one follows), Start, Finish, Labor hours, **Crew** (per-phase override; placeholder is the default crew; blank for fixed phases), **Days** (type a number to override the computed days; clear to go back).

**Payment schedule**: "Draws on the estimate total of $N, due when the phase finishes." A warning pill shows when the percentages do not add up to 100. Table: **Draw** name, **Percent**, Amount, **Due after** (phase select), Date, remove ✕. **Add draw** (adds "New draw", 0%, after Final inspection). **Reset to the standard draws**. Standard draws:

| Draw | % | Due after |
|---|---|---|
| Deposit at signing | 10 | Permit and ordering |
| Framing complete | 25 | Framing |
| Dried in, rough-ins passed | 20 | Framing and rough-in inspections |
| Drywall finished | 20 | Drywall hang and finish |
| Cabinets and trim set | 15 | Interior doors and trim |
| Final inspection and punch list | 10 | Final inspection and punch list |

**Order dates for long-lead items**: "Lead times are typical workdays from order to delivery; type your supplier's numbers. Items are assumed ordered at signing, so a long lead can hold a phase back." Table: Item (with what it covers), **Lead (workdays)** (editable; placeholder is the default), Needed, Order by, and a pill "holds the schedule" or "order at signing". Long-lead items detected from the model and their default leads: Windows and exterior doors 25; Cabinets 10 (stock) / 30 (semi-custom) / 45 (custom); Appliances 10; Plumbing fixtures 7; Roof trusses 15; Tile 5; Hardwood flooring (plus 3 days to acclimate) 8; plus any item from the order tracker that is not yet delivered. **Inspections** list below it: the date of each milestone.

**Put it on your calendar** (.ics export): "An .ics file opens in Google Calendar, Outlook, iPhone and Android."
- **Schedule and order dates (.ics)** — `<project> schedule.ics`: an all-day event for every phase (description: N workdays, crew of N, or "Inspection or milestone"; milestones get a reminder the day before) and an "Order: <item>" event on each order-by date (description: what it covers, needed date, lead time; reminder the day before).
- **Maintenance reminders (.ics)** — `<project> maintenance.ics`: recurring reminders (monthly alarm/GFCI/filter check; HVAC filter every 2 months; range hood/under-sink/gutters every 6 months; yearly smoke-alarm batteries, water heater flush, dryer vent, re-caulk, HVAC service) and a "Warranty ends in 30 days" event for each installed library appliance using the binder's warranty years.

**Proposal PDF** (`<project> proposal.pdf`): "Remodeling proposal"; project name; address · Prepared for client; date · Prepared by designer. **Scope of work**: sq ft of finished rooms across N levels and the room names; "Work includes:" the builder's-list categories; N new walls and N walls removed. **Product selections** (cabinets and each chosen brand). **Price**: Materials and sales tax (N of M items priced), Labor, Permit, Debris removal, each other cost, Overhead and profit, Contingency, **Total contract price**; alternates when enabled. **Schedule**: Start, Substantial completion (N workdays), each phase with dates. **Payment schedule**: each draw with percent, amount and "due about <date>". **Terms**: changes by written change order; owner provides access, utilities and staging, hidden conditions priced as changes; work to the 2021 IRC as adopted locally, proposal good for 30 days. Owner and Contractor signature and date lines. Footer: "Prepared with Remodel Studio. Quantities, labor and schedule are planning estimates."

### Field notes and punch list

(Also available under Measure › Photos and measurements as "Field notes".)

**Drop a pin on the plan**: four big buttons; tap one, then tap the plan where it is. Pin kinds (letter on the pin, color):

| Kind | Marker | Color |
|---|---|---|
| Existing condition | C | rust |
| Punch item | P | blue |
| Question | ? | purple |
| Photo spot | ● | green |

The **Field pin** tool is also on the Design › Annotate ribbon (Markup group). Each pin's panel (Properties) has: **Type**; **Note** (text); for punch items **Status** (Open · In progress · Done), **Trade** (Any trade or one of the 17 trades), **Due** (date), **Assigned to**; for conditions **Severity** (Note · Needs repair · Safety hazard); **Take or add photo** (camera or files, several at once; photos are pinned to the spot and shown below); a **🎤 Dictate** button that adds speech to the note (browser speech recognition, when available). Done punch items turn gray with a ✓ on the plan. Pins can be hidden on the plan with the `field.hidePins` setting.

**Pins and punch list** card
- **CSV** — `<project> punch list.csv` (#, Type, Room, Note, Status, Trade, Assigned, Due, Date).
- **PDF with photos** — `<project> punch list.pdf`: each shown pin numbered with kind, status, room, note, trade · assignee · due, and up to three photos.
- Filter: **All · Conditions · Punch: open · Punch: done · Questions** (counts in each).
- The list: marker, note (click to select the pin on the plan), kind · room · trade · assignee · due; punch items have a **Done** checkbox.

**Measuring checklist**: pick a **Room**; the table lists each wall side (inside face to face, with compass direction), the ceiling height, and every door and window width and height (and window sill) with the model value, a **Field** box to type your tape measurement, and the **Difference** ("ok" within 1/2", otherwise ±). Rows off by more than 1/2" are flagged. "Measured N of M". **Room notes** text box per room.

### Wall photos

Photos of what is inside each wall, pinned where they were taken, so they appear on the plan, the interior elevations and the binder for years. Place one with the **Wall photo** tool (Design › Annotate › Markup): click the wall the photo shows, on the side you stood. The mark sits just off the wall face.

Wall photo panel: position note ("N along this wall, one/the other side, N up"); **Stage** (Before drywall · Rough-in inspection · During work · Finished; default Before drywall); **Height of the camera mark** (default 48"); **Date** (default today); **What it shows** (text, e.g. "Drain at 18 in, 12/2 to the island at 24 in, blocking for the TV"); **Other side of the wall** button; **Add photos…** (camera or files); thumbnails; a Dictate button.

**On elevations**: each mark prints on the interior elevation of the wall it is pinned to as a small camera symbol at its height with the label `PHOTO <date>`, in purple.

**Wall photos tab**: a warning box **Walls with new wiring or piping and no photo yet** ("Take these before the insulation and drywall go up.") listing room · wall length · level for every wall that has new electrical devices or pipe runs on it and no photo mark; then a card per mark: room, stage pill, date, **Show on the plan**, the note, and photo thumbnails ("No photos added to this mark yet.").

### Homeowner binder

One PDF for the owner at the end of the job. Most of it comes from the model; the rest you fill in here. Also reachable from File › Export › Homeowner binder (PDF)… as a dialog.

**Make the binder (PDF)** — `<project> homeowner binder.pdf` (progress shows each section as it is built). Sections, in order:
1. **Cover**: "Homeowner binder", project name, address, Prepared for client, Prepared by designer, date, and a contents line.
2. **Where things are**: a table of the items you filled in below (only filled items; otherwise a prompt to fill them in).
3. **Paint and finishes by room**: Room, Floor, Walls (finish), Wall color (paint brand + color, or the screen color name), Trim and ceiling, Ceiling type.
4. **Cabinets** (when any): maker · door style · finish · hardware and finish; table of #, Code, Size W x H x D, Room; a care note.
5. **Appliances and warranties** (when any): Appliance, Model, Installed (from the order tracker's installed or delivered date), Warranty to (installed date + years, or "N yr"), Manual or spec page (link).
6. **Plumbing fixtures** (when any): Fixture, Room, Notes; a note about shutoff valves and aerators.
7. **Electrical panel (N A main)**: Space, Circuit, Breaker, Protection from the panel schedule.
8. **Lighting**: Mark, Fixture, Qty, Color (K), Lumens, Rooms; a note to match Kelvin when replacing lamps.
9. **What is inside the walls**: each wall photo mark (room · date · stage: note) with one photo.
10. **Who did the work**: your contacts text plus "Suppliers: …" from the vendors in the order tracker.
11. **Maintenance calendar**: Monthly (test smoke/CO alarms and GFCIs; check the HVAC filter) · Every 1 to 3 months (replace the filter) · Every 6 months (range hood filter, under sinks, gutters) · Yearly (alarm batteries, flush water heater, dryer vent, refrigerator coils, re-caulk, exterior caulk and paint, HVAC service) · Every 10 years (replace smoke alarms).

**Fields you fill in**
- **Where things are**: Main water shutoff · Gas shutoff · Electrical panel location · HVAC filter size and location · Water heater (make, model, size) · HVAC equipment (make, model) · Attic access · Crawlspace access · Other notes for the owner. (Text boxes; saved when you leave the box.)
- **Appliance warranties** (for each library appliance): years of coverage — 1 (default), 2, 3, 5 or 10 — counted from the installed or delivered date in Cost › Selections and orders.
- **Who did the work**: a free text box ("Electrician: name, phone, license. Plumber: … Cabinets: …").

### Inspection prep

What the inspector checks at each visit, with this job's own sizes filled in. Tick items as you verify them (saved with the project, with the date); **Print** prints the page. Items marked ⚠ are open errors from the Check page that match the phase.

Phases and how their items are generated:
- **Footing and foundation** (shown unless the house is on a slab with no new exterior walls): footings below frost depth and the footing type for the foundation chosen (R403.1); rebar and anchor bolt layout (R403.1.6); vents or conditioned crawl and 18 x 24 access (R408); grade sloped 6" in 10 ft (R401.3); plus ⚠ footing/foundation/crawl errors.
- **Framing**: headers per the header schedule (first six marks, R602.7); floor joist size and spacing with rim and blocking, holes and notches (R502.8); fire blocking and draft stopping (R302.11); hurricane ties and truss layout (R802.11); stair geometry (R311.7); bedroom egress windows (R310); plus ⚠ header/joist/rafter/stair/egress/span/beam errors.
- **Rough plumbing, electrical and mechanical**: DWV sizes and the building drain size from the riser (P3005); water or air test (P2503.5); nail plates (P2603.2.1, E3802.1); receptacle spacing, GFCI/AFCI, interconnected smoke and CO alarms (E3902, R314, R315); bath fans and makeup air (M1503.6); dryer duct (M1502); plus ⚠ outlet/GFCI/AFCI/drain/vent/duct/smoke errors.
- **Insulation**: the wall cavity and continuous R, ceiling R and floor R from the energy settings (N1102.1.2); baffles and air barrier contact (N1102.4.1.1); air sealing before drywall; vapor retarder class (R702.7).
- **Final**: handrails and guards (R311.7.8, R312); tempered glass locations (R308.4); alarms, GFCI/AFCI test, panel labeled (E3706.2); water heater T&P and expansion tank (P2804); address numbers and landings (R319, R311.3); each library appliance "installed with its listed clearances" (up to four); plus ⚠ landing/threshold/handrail/guard/tempered errors.

Each phase header shows "N of M" ticked; a ticked item shows the date it was verified.

---

## Site and outdoors

Site tools are on the Design ribbon under **Site › Site and landscape**. Site items sit on the ground, draw under the plan, and show on the site plan sheet; they are left off the floor-plan sheets. Each site item has a status (new or existing); existing items are not counted in the builder's list.

### Site plan tools

Area tools (click the corners, click the first point to close; at least three points): **Driveway**, **Patio**, **Planting bed**, **Lawn area**, **Property line**. Line tools (click points along the line; Enter or Esc to finish): **Walkway**, **Fence**, **Retaining wall**. Point tools (click to place; keep clicking to add more): **Tree**, **Shrub**, **Plant**, **Play equipment**. Area tool: **Play area and surfacing**. All snap to the grid.

Panel fields by item (the first field is **Surface**, **Style** for fences, or **Kind** for trees and shrubs):

| Item | Choices (default first) | Other fields |
|---|---|---|
| Driveway | Concrete · Asphalt · Gravel · Pavers | Color; Area (sq ft) |
| Patio | Pavers · Concrete · Flagstone · Brick | Color; Area |
| Walkway | Concrete · Pavers · Stepping stones · Gravel · Brick | Color; **Width** (36"); Length |
| Planting bed | Mulch · Pine straw · River rock | Color; Area; **Mass planting** (None, or a groundcover/perennial/grass/shrub species) with **Spacing on center** (default 75% of the plant's spread, at least 6") and "Plants to fill it"; **Edging** (Steel (default) · No edging · Aluminum · Plastic · Brick soldier course · Natural stone); **Landscape fabric under the mulch** (on); **Irrigation** (No irrigation · Spray heads · Rotors · Drip line) |
| Lawn area | Sod · Seed | Color; Area; **Grass** (Bermuda (Tifway 419) · St. Augustine · Zoysia · Centipede · Tall fescue); **Irrigation** |
| Fence | Wood privacy · Picket · Chain link · Split rail · Ornamental iron · Vinyl privacy | Color; **Height** (72"); Length. Note over 72": many cities limit back-yard fences to 6 ft and front-yard fences to 3 or 4 ft. |
| Retaining wall | Segmental block · Stone · Timber · Concrete | Color; **Height above grade** (30"); **Thickness** (12"); Length. Note over 48": needs an engineered design (IRC R404.4). |
| Property line | (dashed lot line) | Area. Property lines draw as a long-dash lot line on the site plan and are not built in 3D. |
| Tree | Shade tree (oak, maple) · Evergreen (pine, cedar) · Ornamental (crepe myrtle) · Palm | Color; **Canopy spread** (20 ft; bare numbers are feet); **Height** (auto) |
| Shrub | Rounded shrub · Boxwood · Ornamental grass | Color; **Spread** (42") |

**Setbacks and the lot** are entered on the Documents › Sheets panel: **Lot for the site plan** (Lot width, Lot depth, Front setback, Left side setback — "Leave the width at 0 to show just the house. Setbacks are measured from the top and left edges of the plan to the lot line.") and **Zoning and permit packet** (Permit office, Parcel number, Front / Side / Rear setback (min), Max height, Max lot coverage %, Max impervious % — each defaults to Not set; a summary line gives heated area, footprint, lot area, coverage and impervious %; failing rules appear as Zoning errors in Check; **Permit packet (PDF)** prints the cover letter, project data, areas, site data, zoning compliance and sheet index).

Decks, porches, steps, ramps, columns and railings are Exterior tools (Architecture › Exterior) and are covered elsewhere; the Foundation panel has **Add steps at every outside door**.

### Trees and plants library (Landscaping)

The **Plant** tool places the species chosen in the Library under **Landscaping** (sub-groups: Shade trees, Ornamental trees, Evergreen trees and screens, Palms, Shrubs, Ornamental grasses, Groundcovers, Perennials and color). 56 species for the Gulf South (USDA zones 6–10), each with common and botanical name, mature height and spread, zone range, sun, water, growth rate, native flag, evergreen/deciduous, form, foliage and flower color and bloom season. Examples: Live oak, Willow oak, Shumard oak, Red maple, Southern magnolia, River birch, Bald cypress, Lacebark elm, Ginkgo; Crape myrtles Natchez/Muskogee/Dynamite, Flowering dogwood, Eastern redbud, Japanese maple, Little Gem magnolia, Chaste tree, tree-form Yaupon; Loblolly pine, Eastern red cedar, Leyland cypress, Nellie R. Stevens holly, Green Giant arborvitae, Wax myrtle; Sabal and Windmill palms; Encore and Formosa azaleas, Wintergreen boxwood, Indian hawthorn, Loropetalum, Gardenia, Bigleaf and Oakleaf hydrangea, Dwarf yaupon, Glossy abelia, Knock Out rose, Distylium, Dwarf Burford holly, Sasanqua camellia, Sweet viburnum, Nandina Firepower; Pink muhly, Fountain grass Hameln, Maiden grass; Liriope Big Blue, Mondo grass, Asiatic jasmine, Blue Rug juniper; Daylily Stella de Oro, Hosta, Purple coneflower, Black-eyed Susan, Lantana New Gold, Salvia Mystic Spires, Seasonal color (annuals).

Plant panel: picture; **Plant** (grouped select); a fact line (botanical name, mature size, growth, sun, water, evergreen/deciduous, flowers, native, zones); a warning when the species is not rated for the project's zone; **Size to buy** (4" pot · 1 gallon · 3 gallon · 7 gallon · 15 gallon · 30 gallon · 2" caliper B&B · 3" caliper B&B — each with a size at planting and a planning price); **Mature spread**; **Mature height**; **Show size** (At planting · In 5 years · Mature) — this is the project-wide landscape display setting; "Shown now" readout; **Foliage color**.

Plants draw as canopy symbols with a two-letter key (first letters of the common name), a flower dot when the species blooms, and in 3D as trunk-and-canopy, cone, palm, fountain or mat forms by species form; flowers appear in 3D when turned on. Growth display: at planting uses the container size; in 5 years grows 30/50/75% of the way for slow/medium/fast growers; mature uses the full size.

Landscape checks (Check page, category Landscape): not hardy in the project zone; large tree (30 ft or taller) within 10 ft of the house; shrub that will grow into the wall (center closer than half its spread plus 6"); plants of the same kind crowded (closer than 60% of their combined spread).

### Playground equipment (GameTime catalog)

The **Play equipment** tool places the item chosen in the Library under **Playground** (sub-groups by brand and category; **Safety surfacing** entries start the Play area tool with that surface). The catalog holds 7 generic items (2-bay belt swing frame, backyard wood swing set with fort and slide, composite 3-deck structure, freestanding slide, spring rider, 6 x 6 sandbox, 6 ft park bench) and 128 GameTime products compiled from gametime.com product pages (October 2026) across the lines PrimeTime, PowerScape, GTEvents, Xscape, Inclusive Play, Challenge Course, GT Jams, GTfit, THRIVE, VistaRope, KidNetix, Modern City, Altus Towers, Sensory Wave, Sensory Dome, TotStuff, Tuffclad, Duraclad, TuffCrete Fun Forms, Nature climbers, Shade (QuickRelease), Swing Shade, Spring riders, Site furnishings and Freestanding packages. Categories: Play structures, Swings, Slides, Climbers, Spinners, Rockers and spring riders, Freestanding play, Musical and sensory, Inclusive play, Fitness, Shade, Site furnishings, Other. Each item carries model number, name, line, age group (2-5, 5-12, 2-12), footprint, height, fall height, published use zone, capacity, accessibility (ground-level / transfer / inclusive), accessible-component counts, product URL and notes. Footprints marked "estimated" were taken from the published use zone.

Play equipment panel: picture; **Item** (grouped select); a fact line (brand · line · ages · users · accessibility, notes, **Product page** link, and warnings "Size is estimated…" or "Fall height equals the deck it attaches to"); **Width**, **Depth**, **Fall height**, **Rotation** (degrees); **Colors** (schemes: Primary (default) · Earthtone · Coastal · Woodland · Bold, plus GameTime palettes: Metal Blue/Plastic Yellow/Plastic Red; Metal Brown/Lumber Sand/Plastic Green; Metal Ocean/Metal Vanilla/Plastic Azure; Metal Dark Green/Timber Cedar/Plastic Spring Green; Metal Royal Purple/Plastic Orange/Metal Spring Green); for swing frames **Seats** (Belt seats (standard), or GameTime seats: 1481 Belt Swing Seat, 5293 Tot Seat 8', 4952 Nexgen Swing Seat Package, 5295 Expression Swing 8', 5375/5376 Zero-G, 5299 Expression Swing with Adaptive, 5297 Expression Swing Tandem); for structures **Elevated play events**, **Ground-level play events**, **Elevated reached by ramp or transfer**, **Ground-level types**; the **Use zone** size; **Show use zones on the plan** (on, project-wide). Use zones: 6 ft around most items, twice the pivot height in front of and behind swings, an exit zone for slides, none for benches and tables.

Play area panel: **Surfacing** (Engineered wood fiber (EWF) · Wood chips · Wood mulch (non-CCA) · Shredded rubber mulch · Sand · Pea gravel · Poured-in-place rubber · Rubber tiles · Synthetic turf with pad); for loose fill **Installed depth** (12" default; 6" for rubber mulch) with the note that loose fill packs down about 25%; for unitary surfaces **Tested critical fall height** (8 ft default) and **Thickness**; **Border** (Recycled plastic timbers (default for loose fill) · Plastic border · Concrete curb · None (default for unitary) · GameTime PlayCurb 12" (#4862) · GameTime PlayCurb 8" (#4850)); a GameTime surfacing option link (EWF, GT Impax PIP, tiles, turf, loose-fill rubber); **Area**; **Highest fall height inside**; **Surfacing protects to** (red when less than the highest fall height; "not enough depth" when loose fill is under 9" compressed); **Wheelchair accessible surface** (yes for EWF, PIP, tiles and turf per ASTM F1951); **Color**.

Playground checks (Check page): use zone not covered by safety surfacing (CPSC 5.2); surfacing too thin for the fall height (ASTM F1292); swing use zones overlapping other use zones (CPSC 5.3.8); equipment closer than 6 ft (9 ft when a play surface is over 30") (CPSC 5.1); play area surface not wheelchair accessible (ADA 1008.2.6); no walkway reaching the play area (ADA 240.1 / 1008.2); too few ground-level components for the number of elevated ones (ADA Table 240.2.1.2); elevated components not reached by ramp or transfer (ADA 240.2.2); 2-5 and 5-12 equipment mixed in one area (CPSC 2.3).

### Drainage, swales and downspouts

Drawn automatically on the site plan sheet from the house outline and the lot slope:
- A **drainage arrow** away from each side of the house, labeled **5% MIN.**; on a side where the lot is uphill from the house the label reads **SWALE** and a dashed swale line with arrows at both ends is drawn around that side.
- **Downspouts** (circle marked **DS** with a dashed splash line) at every outside corner of the house when any roof has gutters.
- **Walkway and driveway slopes** as percentages along each run (red over 8.33%).
- **Spot grades** at each house corner (finished floor = 100.00') and **FF 100.00'** at the center; on sloped lots a dashed slope arrow labeled **SLOPE N% DOWN**.

Related Check items: "Ground slopes toward the house" (IRC R401.3, with a swale recommendation); "Walkway too steep" over 8.33% (error with ADA checks on, otherwise warning) and "Walkway is a ramp" over 5% (ADA 403.3 / 405); "Steep driveway" over 15%; and "Low window sill high above the ground" (IRC R312.2.1) when an operable window sill under 24" is more than 72" above the ground outside.

### Grade and terrain

Set in the **Project › Foundation** panel (select nothing in the Design view to see the Project panel):
- **Type**: Crawlspace: raised floor on a foundation wall (default) · Piers and beams: raised floor on piers · Stem wall with a filled slab · Slab on grade · Basement.
- **Finished floor above the ground** (on a sloped lot: "Floor above the ground (high side)") — the `gradeOffset` setting; a new project starts at 24".
- **Ground falls across the house** — total drop in inches across the house footprint (blank = level lot).
- **Downhill toward** (only when a fall is set): North (top of the plan) · Northeast · East (right) · Southeast · South (bottom of the plan) (default) · Southwest · West (left) · Northwest. A note gives the floor height on the high and low sides and the slope percentage; the foundation, piers, steps, decks, site items, plants, play equipment and the 3D ground follow the slope, and the foundation wall steps down with the ground.
- Also in this panel: **Exposed foundation finish** (Brick (default) · Painted block (CMU) · Parged or stuccoed · Stone veneer · Siding carried down), **Skirting between piers** (Lattice (default) · Vinyl or board skirting · Brick curtain wall · Open), **Pier size** (16"), **Piers every** (96"), **Foundation color**, **Foundation vents (R408.1)** (on), **Crawlspace access door (R408.4)** (on), **Footings**: Width (16"), Thickness (8"), Bottom below grade (12"); "Ground to bottom of floor framing" readout; **Add steps at every outside door**.

### Landscape sheet (L1.0 Landscape and play area plan)

Added to the plan set after sheet A0.2 whenever the project has plants, play equipment or play areas. It shows: the site items (driveways, walks, patios, beds, lawns, fences, retaining walls, lot line) with surface labels; the house footprint shaded and labeled HOUSE; play areas with "PLAY AREA · <surface> [N" DEEP]"; play equipment footprints with model numbers and dashed use zones (when use zones are on); every plant as a canopy circle (sized at planting, 5 years or mature per the landscape setting) with a two-letter key (numbered when two species share letters). On the right: a **PLANT SCHEDULE** (KEY, COMMON / BOTANICAL, QTY, SIZE), a **PLAYGROUND SCHEDULE** (MODEL, ITEM, QTY, FALL HT) and **NOTES** (what the circles show; call 811, keep trees 10 ft from the foundation; use-zone and surfacing standards when relevant). Uses the site-plan scales.

---

## Settings and project info

Settings are saved inside the project file. They are edited in several places; this section lists every one, its default and where to change it.

### Project info (title block and documents)

Edited in **Documents › Sheets** (right-hand panel, **Title block**) and **Zoning and permit packet**; the project **Name** is in the Project panel (Design, nothing selected) or File › Rename project….

| Field | Default | Where | Used in |
|---|---|---|---|
| Project name | "Untitled house" | Project panel; File › Rename project… | everywhere |
| Address | blank | Sheets › Title block | title blocks, estimate, proposal, POs, binder, permit letter, dashboard |
| Prepared for (client) | blank | Sheets › Title block | title blocks, proposal, binder, permit letter, dashboard |
| Drawn by (designer) | blank | Sheets › Title block | title blocks, proposal, POs ("Ordered by"), bid requests ("Contact"), binder, permit letter; also saved in My standards |
| Revision | blank | Sheets › Title block | title block |
| Date | blank (today) | Sheets › Title block | title block |
| Permit office (jurisdiction) | blank | Sheets › Zoning and permit packet | permit cover letter |
| Parcel number | blank | Sheets › Zoning and permit packet | permit packet |
| Revision history | from change orders | Sheets › Revisions | revision table and clouds |

There is no separate permit-number field; the permit packet records the permit office and parcel.

### Project panel (Design view with nothing selected)

| Setting | Default | Choices / notes |
|---|---|---|
| Snap grid | 6" | 1" · 3" · 6" · 1' |
| Building code | House: 2021 IRC | or Commercial or city building: 2021 IBC |
| Occupancy group (IBC only) | B | IBC occupancy list |
| Fire sprinklers throughout (IBC only) | off | |
| Accessible design (2010 ADA checks) (IRC only) | on | |
| NKBA kitchen and bath planning guidelines | on | |
| Cooks at once (NKBA) | One (42" aisles) | or Two or more (48" aisles) |
| Use Access Standard values (NKBA) | off | |
| Foundation panel | see Grade and terrain above | |
| Landscape: USDA zone | 8a | 6a · 6b · 7a · 7b · 8a · 8b · 9a · 9b · 10a ("Forest, Mississippi is in zone 8a") |
| Landscape: Show plants | Mature | At planting · In 5 years · Mature |
| Landscape: Show flowers in 3D | on | |
| Trim (whole house) | program defaults per slot | Baseboard, Door and window casing, Crown, Chair or picture rail, Base shoe, Wainscot, Window stool — library profiles; **Trim color** |
| Automatic roof settings | Hip, 6/12, 12" overhang | Style (Gable · Hip · Dutch · Gambrel), Pitch, Overhang |
| Levels | one level | name, floor elevation, wall height; framing per level: Foundation (first level), Floor joists, Spacing (12 · 16 · 19.2 · 24), Joists run, Girders every, Lumber species, Ceiling joists (top level), Attic storage |
| Code rule values (Check page › rule list) | code values | any rule can be changed to a local amendment; changed values are saved with the project |

### Display popover (plan view: "Display" button, or type `osnap` in the command line)

- **Show in the plan** (all on by default): Room names and areas · Wall lengths · Fixtures and cabinets · Electrical · Roof lines · Dimensions · Notes · Drafting lines · Site and landscape · Decks, porches and steps · Code-check markers · Floor below (ghosted) · Cabinet numbers · Switch legs (off by default).
- **Snaps**: Endpoint (on) · Midpoint (on) · Intersection (on) · Center (on) · Perpendicular (on) · Nearest (off) · Grid (on). The command line accepts `osnap on`, `osnap off`, `osnap all` or a list such as `osnap end mid`.
- **Drafting layers**: current layer (default L-DRAFT), color, On/Off, Lock, Print, **New layer**.
- Command-line settings: `AR n` sets the Array count (default 3); `O n` sets the Offset distance (default 6").

### Units and precision

Lengths are shown in feet and inches to 1/16" everywhere; there is no unit or precision setting to change. Type metric values and they are converted. Bare numbers are inches except in wall-length and level boxes (feet) and boxes labeled in feet (tree spread and height, girder spacing, hip girder setback).

### Estimate settings

On **Cost › Estimate and labor › Settings** (and Labor by trade, Risk by trade): self-performed labor (off), Overhead and profit 15%, Contingency 15%, Sales tax 7%, Permit fee $0, Dumpsters (automatic), Cost per dumpster $450, Other costs (none), labor rates per trade (table above), extra contingency per trade (none), list alternates in the proposal (off). **Waste %** (10) is on the Builder's list tab. **Cabinet order** settings (multiplier 0.45, margin 35%, freight 3%, install $85 per box, tax 7%) are on the Cabinet order tab.

### Energy settings (Design › Systems › Energy code and Heating and cooling)

| Setting | Default | Notes |
|---|---|---|
| Climate zone | 3A (Mississippi, Alabama, Georgia) | 1A · 2A · 3A · 4A · 5A; changing it resets the outdoor design temperatures and the prescriptive R and U values |
| Wall cavity R | 20 (zone 3A) | |
| Wall continuous R (foam) | 0 | |
| Ceiling R | 49 | |
| Floor R | 19 | |
| Slab edge R | 10 | |
| Window U-factor | 0.30 | |
| Window SHGC | 0.25 | |
| Skylight U-factor | 0.55 | |
| Door U-factor | 0.20 | |
| Air leakage (ACH50) | 3 | |
| Ducts | In a vented attic | or In a vented crawlspace · Inside the conditioned space |
| Include energy code items in the code check list | off | |
| Winter outdoor / Summer outdoor °F | 23 / 95 (zone 3A) | |
| Indoor winter / Indoor summer °F | 70 / 75 | |
| Moisture difference (grains) | 55 | |
| People | auto | |

### Other settings saved with the project (and where they are set)

| Setting | Default | Where |
|---|---|---|
| Schedule: start, crew, per-phase crews and days, draws, lead times | today, 2, none, standard draws, typical leads | Build › Job schedule |
| Shopping check-offs | none | Cost › Shopping list |
| Inspection ticks | none | Build › Inspection prep |
| Reviewed issues | none | Check page ("Reviewed, leave as is") |
| Next PO number | 1 | advances when you print a PO and mark items ordered |
| Selections (brands, paint brand) | none | Cost › Selections and orders |
| Door hardware finish / brand | Satin nickel / Any brand | Cost › Selections (Door hardware, whole house) |
| Cabinet maker, line, door, finish, price book | Generic | any cabinet's panel or the Cabinet maker panel |
| Countertop material, edge, thickness, overhang, splash | quartz, eased, 1-1/4", 1", 4" | Countertop panel; Countertop slabs dialog adds slab size, kerf 1/4" and edge allowance 1" |
| Electrical load assumptions (HVAC, strips, range, dryer, water heater, EV, well) | heat pump, 8 kW strips, electric range/dryer/water heater, no EV, no well | Design › Systems › Electrical service |
| Lighting scenes | none | Lighting scenes panel (Render studio uses them) |
| Render options (smooth, auto, camera, size, quality, sky, lights) | on, on, screen, HD, 256, day, on | Render studio |
| Playground: show use zones, default color scheme | on, Primary | Play equipment panel |
| Revision clouds for change orders | on | internal; turned off only by project text |
| NKBA drawing standard for cabinet plans | on | NKBA drawings |
| Hide field pins | off | internal |
| Zoning limits | not set | Documents › Sheets › Zoning and permit packet |
| Lot size and setbacks for the site plan | 0 | Documents › Sheets › Lot for the site plan |
| Sheet paper and scale | Tabloid, largest that fits | Documents › Sheets › Paper |
| Saved view setups | none | Project browser › Saved view setups |
| KraftMaid loose accessories added to the order | none | KraftMaid catalog "Add to order" |

### My standards (File › My standards… or Help › My standards…)

Defaults that every new project starts with (kept in this browser or desktop install, not in the project). **Save this project's settings as my standards** stores: cabinet brand/line/door/finish, trim profiles, estimate rates, markup, contingency, tax, dumpster cost and self-labor, the first level's framing (joists, spacing, ceiling joists, foundation), energy settings, NKBA settings, ADA on/off, building code, NKBA drawing standard, waste %, grid, hardware finish and brand, product selections and the designer name, with the save date. The dialog summarizes them (Cabinets, Trim, Framing, Estimate, Code, Energy, Saved). **Apply my standards to this project** copies them into the open project (cabinets without their own style follow the new defaults). **Clear** removes them. The sample house, lesson rooms and picture previews do not receive standards.

### Appearance (Help › Appearance (light or dark)…)

Light or dark colors for the whole program including the plan and 3D views; "Follow Windows" uses the Windows Personalization › Colors setting.

### Backups, versions and autosave

- **File › Backups…** (desktop): every save keeps a dated copy in `Documents\Remodel Studio\Backups`, and an autosave copy is written every 5 minutes while there are unsaved changes (only when the project has walls). The newest 25 saves and 40 autosaves per project are kept. The dialog lists copies by project with time, Saved/Autosave, size and an **Open** button that opens the copy as an unsaved project named "… (restored <date>)"; **Open the backups folder**. In the web version the dialog points to File › Versions.
- **File › Versions…**: named snapshots stored in the browser with the project's assets; save one with a name (default "Version <date time>"), compare its summary with the current model, and restore it (Undo brings back what you had).
- **File › Download a copy (.json)** (web) and **Show file in folder** (desktop); **Copy or paste project text…** moves a project as text.

### Performance

Whole-project calculations (code checks, countertop geometry, cabinet numbering, structure analysis, room walls, header schedule) are cached per model version, so switching tabs and reopening panels does not recompute them until the model changes. There is nothing to configure; this is why the Dashboard, Check page and Cost tabs stay responsive on large projects.
