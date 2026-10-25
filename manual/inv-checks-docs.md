# Remodel Studio inventory: Check, Structure, Systems, Documents, Render and views

All dimensions are inches unless written as feet. "Error", "Warning" and "Tip" are the three severities the app uses. Every number below is the exact value the app uses.

---

## 1. Check workflow

### 1.1 Where the checks live

- **Check tab (workflow step 3)** at the top of the window. Its button carries live badges: a red count of errors, an amber count of warnings, or a green check mark when there are none. Its single page is **Issues**.
- **Issues dock** in the Designer (Design step): Home ribbon tab › Panels › **Issues** toggles a strip docked under the views. Its header has a segmented filter **Errors / Warnings / Tips / All** (each with its count), an **Open the Check page** button and a close (×) button. The list shows up to 200 issues; clicking one jumps to the item (sets the level, selects the target, opens its Properties panel). Each row shows the severity dot, the title, and a small line with the code reference (set and section, e.g. "IRC R311.7.5.1") or the category, plus the room and level.
- **Plan markers** in the Designer plan views: the **Issues shown / hidden** chip above the plan toggles code-check markers. Markers are drawn at each issue's point on the current level; tips are not drawn. Red badges are errors, small dots are warnings. Clicking a marker goes to the item.
- **Plan check panel** (Properties panel variant): a "Summary" with pills "N fails" and "N to check", a sentence naming the code basis, a filter **All / Fails / To check / Tips**, issues grouped by level (or "Whole house"), each row labelled **Fails**, **Check** or **Tip** with title, detail and the rule reference ("Model check" when there is no code rule). Below it a **Structure** section lists every checked member as a card with a capacity bar (green under 85 %, amber 85–100 %, red over 100 %), its size, spacing, span, load, governing check (bending, shear or deflection), a suggested size, and an expandable **Load breakdown**. A **Show rule values / Hide rule values** button opens the editable rule table (see 1.3).
- **Checks also appear** on the cover sheet A0.1 ("Code check summary", first 8 items), in the Board presentation (Code slide and Structure slide), in Inspection prep (open errors marked ⚠), and in the permit checklist.

### 1.2 The Check page (Issues)

Three columns:

**Left column (issue list)**
- Severity chips: **Errors**, **Warnings**, **Tips**, each with its total count; click to show/hide that severity. Errors and warnings start on, tips start off.
- Category chips, one per category present, with a count; click to toggle a category in or out. Categories, in display order: **IRC, IBC, ADA, NKBA, Structure, Framing, Electrical, Plumbing, Appliances, Cabinets, Energy, Zoning, Landscape, Model**, followed by any other code set that appears (for example NEC is shown under Electrical; CPSC, ASTM, Site, Practice appear by their own name). An issue is filed under its rule's code set; issues with no rule are sorted by keywords in their text (notch/bore/clash → Framing; joist/rafter/beam/header/span → Structure; outlet/GFCI/circuit/smoke → Electrical; drain/vent/pipe/DFU → Plumbing; R-value/insulation/U-factor → Energy; anything else → Model).
- A **Search issues** box (matches title, detail and code section) and a **Show reviewed** checkbox.
- The list is grouped by level in building order, with a final **Whole job** group for issues that have no level. Each row: severity dot, title, and a sub-line with "SET CODE · Room · Level". Reviewed issues are hidden unless Show reviewed is on.

**Middle column**: the plan view of the current level with the filtered issues drawn as markers. Clicking a marker selects that issue.

**Right column (detail)** when an issue is selected:
- Pill: "Error / Warning / Tip · Category".
- Title, the rule line "SET CODE · rule title", the full explanation, the room and level.
- **Show it in Design** (switches to the Design workflow, sets the level, selects the item) and **Select it**.
- **Reviewed, leave as is** checkbox. Reviewed issues (keyed by title + target + level) hide from the list and the plan "until something about them changes"; they still print in the permit checklist. The date reviewed is shown.

When nothing is selected the right column shows a **Checks** table (category × Errors / Warnings / Tips counts) and two shortcut buttons: **Wall framing and cut list…** and **Floor and ceiling joists…**.

Below the three columns, the **Aging in place (universal design)** panel (see 1.9).

Empty state text: "No issues. The model passes every check that is turned on." or "Nothing matches these filters."

### 1.3 Code settings (where they are set)

With nothing selected in the Designer, the Properties panel shows the **Project** section:

- **Building code**: *House: 2021 IRC* (default) or *Commercial or city building: 2021 IBC*.
- When IBC is chosen: **Occupancy group** (B: Business (offices, city hall, clinics) — default; A-3: Assembly (meeting rooms, community center); M: Mercantile (stores); E: Educational; S-1: Storage or shop (public works garage)) and **Fire sprinklers throughout** checkbox. ADA checks are always on under IBC.
- When IRC is chosen: **Accessible design (2010 ADA checks)** checkbox (on by default).
- **NKBA kitchen and bath planning guidelines** checkbox (on by default). When on: **Cooks at once** (*One (42" aisles)* / *Two or more (48" aisles)*) and **Use Access Standard values** checkbox.
- Under IBC a **Code analysis (2021 IBC)** summary block appears: occupancy (and "sprinklered"), occupant load per level, exits required on the first floor, travel distance limit, toilets · lavatories needed (and drawn), drinking fountains · service sink.
- The NKBA legend on the plan also offers a **Turn on NKBA checks** button when they are off.
- Energy code items are included only when **Include energy code items in the code check list** is ticked on the Systems › Energy code tab.
- **Rule values** (Plan check panel › Show rule values): every adjustable rule for the active code set (IRC rules under IRC, IBC rules under IBC, ADA rules when ADA is on) is listed as "SET CODE — title" with an editable value (length input for inch rules, number input otherwise) and a **Reset** button when changed. Changed values are saved with the project and marked. Note: "Change a value to match a local amendment."
- **My standards** (File dialog) saves code/ADA/NKBA/energy settings as the defaults for new projects.
- Ground height for egress and ramp checks comes from the project's grade offset (first floor above grade, default 24").

### 1.4 Adjustable rule values

| Set | Code | Rule | Default |
|---|---|---|---|
| IRC | R305.1 | Ceiling height, habitable rooms | 84 in |
| IRC | R305.1 Exc. | Ceiling height, baths and laundry | 80 in |
| IRC | R304.1 | Habitable room floor area | 70 sf |
| IRC | R304.2 | Habitable room, least dimension | 84 in |
| IRC | R311.6 | Hallway clear width | 36 in |
| IRC | R311.7.5.1 | Stair riser height, maximum | 7.75 in |
| IRC | R311.7.5.2 | Stair tread depth, minimum | 10 in |
| IRC | R311.7.1 | Stair width, minimum | 36 in |
| IRC | R310.2.1 | Egress window net opening | 5.7 sf |
| IRC | R310.2.1 Exc. | Egress net opening at grade floor | 5.0 sf |
| IRC | R310.2.1 | Egress net clear width | 20 in |
| IRC | R310.2.1 | Egress net clear height | 24 in |
| IRC | R310.2.2 | Egress sill height, maximum | 44 in |
| IRC | R311.2 | Egress door clear width | 32 in |
| IRC | R311.2 | Egress door clear height | 78 in |
| IRC | R312.2.1 | Upper-floor window sill without opening limit | 24 in |
| ADA | 404.2.3 | Door clear width | 32 in |
| ADA | 404.2.4.1 | Latch-side clearance, pull side | 18 in |
| ADA | 304.3.1 | Turning space diameter | 60 in |
| ADA | 403.5.1 | Accessible route clear width | 36 in |
| ADA | 405.2 | Ramp run per inch of rise (1:12) | 12 |
| ADA | 405.6 | Ramp rise per run, maximum | 30 in |
| IBC | 1208.2 | Ceiling height, occupiable spaces | 90 in |
| IBC | 1010.1.1 | Egress door clear width | 32 in |
| IBC | 1010.1.1 | Egress door height | 80 in |
| IBC | 1020.3 | Corridor width, 50 or more occupants | 44 in |
| IBC | 1020.3 | Corridor width, under 50 occupants | 36 in |
| IBC | 1006.2.1 | Most occupants in a room with one exit door | 49 people |
| IBC | 1005.3.2 | Door egress width per occupant (no sprinklers) | 0.2 in |
| IBC | 1005.3.2 Exc. | Door egress width per occupant (sprinklered) | 0.15 in |
| IBC | 1005.3.1 | Stair egress width per occupant (no sprinklers) | 0.3 in |
| IBC | 1011.5.2 | Stair riser height, maximum | 7 in |
| IBC | 1011.5.2 | Stair tread depth, minimum | 11 in |
| IBC | 1011.2 | Stair width, minimum | 44 in |
| IBC | 1007.1.1 | Exit separation, fraction of the diagonal (no sprinklers) | 0.5 |
| IBC | 1007.1.1 Exc. 2 | Exit separation, fraction of the diagonal (sprinklered) | 0.333 |

A door's clear opening is taken as its leaf width minus 2". A window's net clear opening is estimated from its rough size: casement/awning = (W − 4) × (H − 4); double-hung = (W − 4) × (H − 6)/2; slider = (W − 6)/2 × (H − 4); fixed = none. Rectangular room clear dimensions subtract 4.5" for wall finish.

### 1.5 Complete rule table: IRC house checks

Run when the code is 2021 IRC (most are skipped under IBC).

| Code | What is checked | Threshold | Severity |
|---|---|---|---|
| — (Model) | Wall with no length | length < 1" | Warning |
| — (Model) | Door/window wider than its wall | opening width > wall length − 1 | Error |
| — (Model) | Opening tight to a corner | within 1.5" of a wall end ("leave about 3"") | Warning |
| — (Model) | Window head above the wall top | sill + height > wall height − 4 | Warning |
| — (Model) | Two openings overlap on a wall | overlap > 0.5" | Error |
| — (Model) | Room has no way in | no door on its boundary and no open side (gap > 24") and not a closet | Warning |
| R305.1 / R305.1 Exc. | Ceiling too low (all rooms except closet, garage) | 84" habitable; 80" bath and laundry | Error |
| R304.1 | Room too small (living, bedroom, dining) | 70 sf | Error |
| R304.2 | Room too narrow (rectangular living, bedroom, dining) | 84" clear in every direction | Error |
| R311.6 | Hallway too narrow (rectangular hall) | 36" clear | Error |
| ADA 403.5.1 | Accessible route too narrow (hall passes IRC but not ADA) | 36" | Error |
| R310.2.1 / R310.2.2 | Bedroom has no emergency escape window (exterior windows only) | 5.7 sf net (5.0 sf when the floor is 44" or less above grade), 20" wide, 24" high, sill ≤ 44". Detail names the best window and suggests "36" × 60" double-hung or 30" × 48" casement with a sill at 44" or lower" | Error |
| ADA 304.3.1 | No wheelchair turning space in a bath or kitchen (largest clear circle around floor-standing fixtures and cabinets, lavatories ignored) | 60" diameter | Error |
| ADA 404.2.3 | Door too narrow for a wheelchair | 32" clear (34" door) | Error |
| ADA 404.2.4.1 | Not enough room beside the latch on the pull side | 18" | Error |
| R311.2 | No exterior door on the first floor | at least one | Error |
| R311.2 | No exterior door wide or tall enough for egress | 32" clear, 78" high | Error |
| R311.7.5.1 | Stair risers too tall | 7.75" | Error |
| R311.7.5.2 | Stair treads too shallow | 10" | Error |
| R311.7.1 | Stair too narrow (not spiral) | 36" | Error |
| R311.7.10.1 | Spiral stair width / riser / tread at walkline | 26" clear; 9.5" riser; 6.75" tread at 12" from the narrow edge | Error |
| R311.7.5.2.1 | Winder treads at the walkline (L stair with winders) | 10" at 12" from the narrow end | Error |
| R311.7.2 | Stair headroom (floor above not cut away) | 80" (6'-8") | Error |
| R311.7.8 | Stair needs a handrail | flights with 4 or more risers and rails set to none | Error |
| R312.2.1 | Low sill on an upper floor (exterior window) | drop outside > 72" and sill < 24" | Warning |
| R312.2.1 (site version) | Window fall protection using the graded site (non-fixed exterior window) | sill < 24" and sill more than 72" above the ground outside | Warning |
| ADA 405.2 / 405.6 | Entrance is above the ground (first floor above grade) | grade offset > 0.5"; reports a 1:12 ramp length and the number of 30" runs with 60" landings, or a lift | Warning |
| R307.1 | Toilet too close to the side (centerline to wall or fixture) | 15" | Error |
| R307.1 | Not enough room in front of the toilet | 21" | Error |
| ADA 604.2 | Toilet centerline to side wall | 16" to 18" | Error |
| ADA 604.3.1 | Toilet clear floor space blocked | 60" wide × 56" deep from the side wall (lavatories and wall-hung items allowed) | Error |
| ADA 606.3 | Lavatory or vanity rim too high | 34" | Error |
| ADA 305.3 | Tight clear floor space in front of a refrigerator, range, washer or dryer | 48" (forward approach) | Warning |
| IRC good practice / ADA 804.2.1 | Kitchen aisle too narrow (opposing fronts within 120") | 36" (IRC); 40" with ADA on (60" for a U kitchen is noted) | Error |
| ADA 804.3 | No lowered work surface in the kitchen | one base counter 30" wide at 34" max | Warning |
| E3901.2.1 | Receptacles too far apart (living, bedroom, dining, kitchen, hall, office, etc.) | no point on a wall 24" or longer more than 6'-0" from a receptacle (72.5" allowance) | Error |
| E3901.6 | No receptacle near a bathroom sink | GFCI within 36" of the basin edge | Error |
| R303.3 | No exhaust fan in a bath | fan required unless 3 sf openable window | Warning |
| E3901.4.1 | Not enough countertop receptacles | about one per 48" of counter (counter ≥ 12", receptacles at 30"+ height) | Error |
| E3902.6 | Countertop receptacles need GFCI (plain receptacles at counter height in a kitchen) | all | Warning |
| E3903.2 | Room has no light (all rooms but closet and storage) | one switched lighting outlet | Warning |
| R314.3 | No smoke alarm in a bedroom; no smoke alarm on a floor with rooms | one per bedroom, one per story | Error |
| R315.3 | No carbon monoxide alarm (house has smoke alarms and bedrooms but no CO or combo) | one outside each sleeping area | Warning |
| E3901.7 | No laundry receptacle | one on a 20-amp circuit | Error |
| E3901.8 | No outdoor receptacles (house has exterior walls) | GFCI front and back, ≤ 6'-6" above grade | Warning |
| NEC 210.70(A) | Room has no wall switch; switch not linked to a light | one switch per habitable room/bath/hall/garage; links drawn | Warning |
| ADA 405.2 | Ramp too steep | 1:12 | Error |
| ADA 405.6 | Ramp run rises too much | 30" between landings | Error |
| ADA 405.5 | Ramp too narrow | 36" between handrails (3.5" deducted when rails are present) | Error |
| ADA 405.7.3 | Ramp landings too short | 60" | Error |
| ADA 405.8 | Ramp needs handrails | rise > 6" and rails turned off | Error |
| ADA 405.9 | Add ramp edge protection | rise > 6" and no edge set | Warning |
| R310.1 | Basement with habitable space needs an emergency escape opening | one exterior door or window ≥ 5.7 sf | Error |
| R310.2.3 | Window well too small | 9 sf, 36" each way | Error |
| R310.2.3.1 | Window well needs a ladder | depth > 44" | Error |
| R1003.9 / R1005.3 | Chimney too short | top 3 ft above the roof where it passes through and 2 ft above anything within 10 ft | Error |
| R1001.6 | Masonry firebox may be too shallow | 20" (12" Rumford) | Warning |
| R308.6 | Skylight is not on a roof | must sit over a roof plane | Warning |
| R304.1 (sloped ceilings) | Too little floor area with headroom (attic/vaulted bedroom, living, office, dining, other) | 70 sf with 5 ft or more headroom | Error |
| R305.1 (sloped ceilings) | Not enough area at 7 ft | 35 sf at 7 ft | Error |
| R311.7 | Attic rooms need a stairway | a stair on the floor below | Error |
| R502.3 | Check the attic floor framing (attic living space) | 30 or 40 psf joists | Warning |
| R401.3 | Ground slopes toward the house | lot uphill on a side; keep 6" fall in 10 ft | Warning |
| ADA 403.3 / 405.2 | Walkway too steep | > 8.33 % (error with ADA on, otherwise warning); 5–8.33 % "walkway is a ramp" warning with ADA | Error / Warning |
| Site guideline | Steep driveway | > 15 % | Warning |
| R403.1.5 | Step the footings (site falls across the house) | > 10 % slope | Warning |
| R404.1 | Tall foundation wall on the low side (crawl or stem wall) | > 48" floor to ground | Warning |
| R606 | Tall piers on the low side | > 72" | Warning |
| R317.1 | Floor framing close to the ground (crawl or piers) | < 18" grade to framing (12" for girders) | Warning |
| R408.1 | Crawlspace needs vents or a conditioned crawl | 1 sf per 150 sf, one within 3 ft of each corner | Warning |
| R408.4 | Crawlspace needs an access opening | 18" × 24" through floor or 16" × 24" through wall | Warning |
| R311.7.5.1 / R311.7.5.2 / R311.3 / R311.7.1 | Exterior steps: riser, tread, landing depth, width | 7.75"; 10"; 36" landing; 36" wide | Error |
| R311.7.8 / R312.1.1 | Steps need a handrail (4+ risers) / landing needs a guard (over 30") | rails set to none | Error |
| R312.1.1 | Deck or porch needs a guard rail | floor > 30" above ground | Error |
| R312.1.2 | Guard rail too low | 36" | Error |
| R507.6 | Deck joists may be over-spanned | Table R507.6 span for the joist size and spacing (Southern pine) | Warning |
| — | Porch beam is low | < 6'-8" above the porch floor | Warning |
| R302.5.1 | Door to the garage is not fire resistant | solid wood/solid-core/steel ≥ 1-3/8", or 20-minute rated | Error |
| R302.5.1 | Door to the garage needs a closer | self-closing | Error |
| ADA 309.4 | Knob hardware on a door | levers, push/pull or loop handles | Warning |
| ADA 404.2.5 | Threshold too tall (standard 1" sill on a swing or double door) | 1/2" (3/4" existing sliders) | Warning |
| Practice: Security | Outside door does not lock (passage hardware) | keyed entry and deadbolt | Warning |
| Practice: Privacy | Bathroom door has no privacy lock | privacy set | Warning |
| R502.3 (joist layout) | Floor joists overspanned (any level) | allowable span of the chosen joist at its spacing | Warning |
| R806.1 | Attic is not vented (ridge and soffit vents both off) | 1/150 or 1/300 with balanced vents | Warning |
| N1102.1.2 | Energy item below the energy code (only when turned on in Systems) | prescriptive table for the climate zone | Warning |
| Zoning: Local | Setback, lot coverage, impervious surface or height does not meet zoning (values entered in the plan set panel) | as entered | Error |
| Landscape: Hardiness | Plant not hardy in the project's USDA zone | species range | Warning |
| Landscape: Spacing | Large tree (30 ft or taller) within 10 ft of the house; shrub too close to the wall (center closer than half its spread + 6"); same-kind plants crowded (closer than 60 % of their combined spread) | as stated | Warning |
| CPSC 5.2 | Play item use zone not covered by safety surfacing | whole use zone inside a play area | Error |
| ASTM F1292 | Surfacing too thin for the fall height | surface rating ≥ fall height | Error |
| CPSC 5.3.8 | Swing use zone overlaps another | none | Error |
| CPSC 5.1 | Equipment too close (overlapping use zones) | 6 ft, or 9 ft when either play surface is over 30" | Error |
| ADA 1008.2.6 | Play area surface not wheelchair accessible | ASTM F1951 surface | Warning |
| ADA 240.1 / 1008.2 | No walkway reaches the play area | walk within 36" | Warning |
| ADA 240.2.1.2 | Too few ground-level play components for the elevated ones | Table 240.2.1.2 | Warning |
| ADA 240.2.2 | Elevated components: 20 or more need 25 % by ramp; otherwise 50 % on an accessible route | as stated | Warning |
| CPSC 2.3 | 2-5 and 5-12 equipment together | separate | Warning |

### 1.6 Appliance and cabinet checks

| Set | What is checked | Threshold | Severity |
|---|---|---|---|
| Appliances | Opening between cabinets too narrow for the range, dishwasher or refrigerator (library appliance with published cut-out) | cut-out width (refrigerator: width + 1/4" + side clearances) | Error |
| Appliances | Gap beside a range or dishwasher | opening more than 0.6" over the cut-out → add a filler | Warning |
| Appliances | Cabinet too close above a range or cooktop | the model's published clearance above the cooking surface | Warning |
| Appliances (IRC M1503.6) | Range hood over 400 CFM needs makeup air | > 400 CFM | Tip |
| Cabinets: Blind corner | Cabinet butts straight into a blind corner cabinet | add a 3" filler and set the pull distance | Warning |
| Cabinets: Corner | Dishwasher tight to an inside corner | 3" filler or a cabinet between | Warning |
| Cabinets: Corner | Doors and drawers blocked at an inside corner | use blind/lazy Susan or fillers | Warning |
| Cabinets: Clearance | Refrigerator tight to a wall | leave 2" to 4" | Warning |
| Cabinets: Finished ends | Exposed cabinet end is unfinished | order FEL/FER or an end panel | Tip |

### 1.7 Structure checks (from the span analysis)

| Code | What is checked | Threshold | Severity |
|---|---|---|---|
| R502.3 (floor joists), R802.5 (ceiling joists), R802.4 (rafters), R602.7 (headers) — IBC: 1607.1 floors, 2308.4 headers/beams, 2308.7 others | Member overstressed | capacity ratio > 100 % (bending, shear or deflection) with a suggested size | Error |
| same | Member near limit (not headers) | ratio > 95 % | Warning |
| R301.1.3 | New beam needed where a bearing wall is removed | span and plf load; suggested beam with posts and footings, or "Engineer to size" | Warning |

### 1.8 Clash and notching checks (Framing category)

| Code | What is checked | Threshold | Severity |
|---|---|---|---|
| R502.8 | Pipe below the floor runs through a girder | drop below the girder: joist depth + 9.25 + 0.75 + half the pipe | Error |
| R502.8.1 (open-web floor trusses) | Pipe needs the truss chase | hole (outside diameter + 1/4") > 5" | Warning |
| R502.8.1 (I-joists) | Pipe too big for the I-joist webs | hole > depth − 3.5" (min 1.5") | Error; otherwise Tip ("use the knockouts, never cut the flanges") |
| R502.8.1 (sawn joists) | Pipe needs too big a hole | hole > 1/3 of the joist depth | Error |
| R502.8.1 | Hole too close to the joist edge | < 2" from top or bottom (suggests the centered height) | Warning; otherwise Tip |
| R502.8.1 | Crawlspace duct crosses joists (first floor, not slab) | any duct, unless truss floor and duct ≤ 10" (then Tip: use the center chase) | Error / Tip |
| R602.6 | Pipe inside a wall bores studs (runs ≥ 14" along the wall) | hole > 40 % of the stud (bearing/exterior) or 60 % (non-bearing); 2x4 = 3.5", 2x6 = 5.5" | Error; otherwise Tip (nail plates where within 1-1/4" of the face, P2603.2.1) |
| Coordination | Pipe hits a duct at the same height | within half the duct height + half the pipe | Warning |

Pipe heights default to the system (cold/hot water and gas 10" below the floor, drains 16" below, vents 60" above). Pipe outside diameters: 1/2" = 0.625, 3/4" = 0.875, 1" = 1.125, 1-1/2" = 1.9, 2" = 2.375, 3" = 3.5, 4" = 4.5; gas 1/2" = 0.84, 3/4" = 1.05, 1" = 1.315. Ducts are taken as 12" below the floor in a crawlspace, or ceiling + 10" in an attic.

### 1.9 Aging in place (universal design) checklist

Shown at the bottom of the Check page as "N of 14 met", each item with a green (met) or amber (to do) dot, a title and advice. Not counted as errors.

| Item | Met when |
|---|---|
| Doors 32" clear or wider | every non-demolished door is ≥ 32" wide (34" door gives 32" clear) |
| Lever handles on every door | every door's hardware name includes "lever" |
| Zero-threshold or 60 × 36 shower | no shower, or a roll-in shower, or a shower ≥ 60 × 36 |
| A full bath on the entry level | a bath on the first level (or no baths) |
| A bedroom on the entry level | a bedroom on the ground level (or no bedrooms) |
| Stairs 36" wide with handrails both sides | every stair ≥ 36" wide |
| One step-free entry with a 1/2" threshold or less | an exterior door with threshold ≤ 1/2" |
| Grab bars (or blocking) at every toilet and shower | grab bars ≥ 2 × toilets |
| Bright, even kitchen lighting with task lights | ≥ 3 light fixtures in each kitchen |
| Switches 48" or lower, outlets 18" or higher | every switch/dimmer at ≤ 48" |
| Drawers instead of doors in base cabinets | drawer-base cabinets ≥ half the base cabinets |
| One lower work surface (30–34") | a countertop cabinet ≤ 34" high |
| Side-opening or wall oven at counter height | always met (informational) |
| Slip-resistant, low-glare flooring | every bath, kitchen and laundry floor is tile, LVP or concrete |

### 1.10 IBC checks (when the code is 2021 IBC)

Occupant loads use IBC Table 1004.5 by room use (office 150 gross; assembly/dining 15 net; seating 7 net; classroom 20 net; retail 60 gross; storage 300 gross; shop 100 gross; commercial kitchen 200 gross; living 150 gross; bedroom 200 gross; garage 200 gross; other 150 gross; occupancy default when the use is not listed: B 150, A-3 15, M 60, E 20, S 300). Halls, corridors, baths, restrooms, closets and laundries carry no load. Travel distance limits (Table 1017.2): B 200 ft / 300 sprinklered; A-3, M, E, S 200 / 250. One exit allowed for ≤ 49 occupants (S: 29) and ≤ 75 ft travel (S: 100 ft), single story. Required exits: 2 up to 500 occupants, 3 to 1,000, 4 above. Plumbing fixture ratios per Table 2902.1 by occupancy.

| Code | What is checked | Threshold | Severity |
|---|---|---|---|
| 1208.2 | Ceiling too low (occupiable rooms; not closet, storage, garage, bath, restroom) | 90" | Error |
| 1006.2.1 | Room needs two exit doors | more than 49 occupants with one door | Error |
| 1020.3 | Corridor too narrow (rectangular hall/corridor) | 44" clear with 50+ total occupants, else 36" | Error |
| 1010.1.1 | Egress door too narrow / too short (every door) | 32" clear (use a 36" door); 80" high | Error |
| 1006.3.3 | Needs N exits to the outside (first-floor exterior doors) | per occupant load and single-exit rule | Error |
| 1007.1.1 | Exits too close together | ≥ 1/2 of the building diagonal (1/3 sprinklered) | Error |
| 1005.3.2 | Exit doors too narrow for the occupant load | 0.2" per occupant (0.15" sprinklered) of clear door width | Error |
| 1017.2 | Travel distance to an exit too long (far room corner, walking along x then y) | 200/250/300 ft by occupancy; warning at 85 % of the limit | Error / Warning |
| 1006.3.3 | Upper floor needs N exit stairs | 1 for ≤ 49, else per load | Error |
| 1011.2 / 1005.3.1 | Exit stair too narrow | greater of 44" and 0.3" per occupant divided among stairs | Error |
| 1011.5.2 | Stair risers too tall / treads too shallow | 7" / 11" | Error |
| 2902.1 | Not enough toilets / lavatories | per occupancy table (split between sexes when over 15 occupants) | Error |
| 2902.1 | Drinking fountain and service sink | count needed; "not drawn as fixtures yet" | Info |
| 2902.2 | Separate restrooms required | over 15 occupants and fewer than 2 toilets | Warning |

### 1.11 NKBA checks (how they surface)

NKBA kitchen and bath guideline checks run only when the NKBA checkbox is on. They appear in the **NKBA** category with references such as "NKBA K1 Door/entry", "NKBA K3 Work triangle", "NKBA K6 Work aisle" (kitchen guidelines numbered K1…) and "NKBA B-…" items for baths; nearly all are Warnings, with a few Tips (grab-bar backing, shower controls). The **Cooks at once** setting changes the work-aisle target (42" for one cook, 48" for two) and **Use Access Standard values** raises door and seating clearances (for example 34" door clear instead of 32"). The rule details themselves are documented with the Design workflow.

---

## 2. Structure

### 2.1 Where structure tools live

**Structure ribbon tab** in the Designer:
- **Framing** group: *Roof wizard*, *Floor and ceiling joists*, *Wall framing*, *Remove or open a wall* (enabled only when a wall is selected; tooltip "Select a wall first").
- **Show** group: *Floor framing plan* (plan tab), *Roof framing plan* (plan tab), *Structure check in 3D* (toggle).
- **Posts** group: the *Column* tool.

Also: the 3D view's **Loads** chip ("Color members by how much of their capacity they use") and **Framing** chip; the wall Properties panel buttons **Remove this wall (wizard)…** / **Removal: beam, posts and footings…** and **Framing and cut list…**; a level's **Floor and ceiling framing** section in the Project properties with a **Joist layout, I-joists and floor trusses…** button; the roof's **Framing and covering** section; the opening's **Header** picker (bearing and exterior walls): *Size automatically* or any beam from the list.

### 2.2 Span and load analysis (planning level)

Every joist, rafter, header and removed-wall beam is checked as a simple span for bending, shear, live-load deflection and total-load deflection using approximate NDS reference values. Result: a capacity ratio (100 % = at the limit) and the governing check.

- **Lumber species/grades**: Southern Pine #2 (Fb 1100/1000/925/800/750 psi for 2x4/2x6/2x8/2x10/2x12, Fv 175, E 1.4e6), Spruce-Pine-Fir #1/#2 (Fb 875 × size factor 1.5/1.3/1.2/1.1/1.0, Fv 135, E 1.4e6), Douglas Fir-Larch #2 (Fb 900 × same size factors, Fv 180, E 1.6e6). LVL: Fb 2600 (depth-adjusted), Fv 285, E 2.0e6, 1-3/4" plies.
- **Beam and header choices** (smallest first): (2) 2x6, (2) 2x8, (2) 2x10, (2) 2x12, (3) 2x12, (2) 1¾" × 9¼" LVL, (2) 1¾" × 11⅞" LVL, (2) 1¾" × 14" LVL, (3) 1¾" × 14" LVL, (3) 1¾" × 16" LVL, (3) 1¾" × 18" LVL, (4) 1¾" × 18" LVL. Beyond that: "Engineer to size".
- **Live loads (IRC)**: floors 40 psf, bedrooms 30 psf, roof 20 psf, attic 10 psf (20 psf with attic storage). **IBC** by room use: office 50 (+15 psf partitions as dead load), assembly/retail/corridor/hall/living/dining 100, classroom 40, storage/shop 125, kitchen/bath/other/closet/laundry 50, garage 40, bedroom 40.
- **Dead loads**: floors 10 psf plus finish (hardwood +1, tile +5); ceilings 5 psf (10 with storage); roof covering asphalt 10, metal 6, clay/concrete tile 20; walls above 10 psf × height; floors above 10 psf.
- **Deflection limits**: floor joists and headers L/360 live, L/240 total; ceiling joists L/240; rafters L/240 live, L/180 total (with a 1.25 load-duration factor); repetitive-member factor 1.15 for joists and rafters.
- **Floor joists** per room: span measured across the room between bearing walls below (or exterior walls), in the chosen direction or the shorter way; on a crawlspace first floor the span is capped at the girder spacing. Garages and slab floors are skipped.
- **Ceiling joists** on the top level (skipped when the roof is trussed).
- **Rafters**: horizontal span = half the roof depth (full depth for a shed); skipped for trusses.
- **Headers**: span = opening width + 3"; load = line load on the wall from floors, walls and roof above (tributary half-spans). Non-bearing walls get "Flat 2x / No load". A header chosen by hand on the opening is checked; "auto" picks the smallest that passes.
- **Removed bearing walls** (status "demolish", bearing): beam sized from the wall's load over its full length.

Results show as: the Structure cards in the Plan check panel (sorted worst first, with load breakdown); errors and warnings in Check; red sizes on the S1.x framing plans; colors in 3D (Loads chip): green under 85 %, amber 85–100 %, red over capacity, blue bearing walls (legend shown in the view); headers drawn as colored blocks; the header schedule.

### 2.3 Remove or open a wall (dialog)

Opened from Structure › Remove or open a wall, or the wall panel. Needs a selected wall. Shows "L inside/outside wall on Level".

1. **Is it load-bearing?** Verdict "Probably load-bearing" / "Probably not load-bearing" with reasons: exterior walls always bear; joists over an adjacent room that run across the wall and whose span grows by more than 12" without it ("span X; without it about Y"); a wall on the level above within 8"; a trussed roof on the top level (not bearing unless a level is above); otherwise "Nothing in the model lands on this wall. Still look in the attic or crawlspace…". Checkbox **Treat it as load-bearing** (pre-set from the guess or the wall's bearing flag).
2. **Beam** (when bearing): load on the beam in plf with its breakdown; a **Beam** drop-down listing every stock beam with "N % of capacity (too small)"; "No stock beam in the list carries this" message; radio **Flush beam (in the ceiling, joist hangers)** / **Dropped beam (below the ceiling)**. Beam span is wall length + 6"; 12 plf self-weight added.
3. **Posts and footings**: load at each end (lb); post: ≤ 3,000 lb (2) 2x4 jack studs; ≤ 5,500 (3) 2x4 jack studs or 4x4 post; ≤ 9,000 4x6 post or (3) 2x6 studs; above that 6x6 post (engineer to confirm). **Soil bearing**: 1,500 psf (clay, untested; IRC default), 2,000 (sandy or silty clay), 3,000 (sand, gravel). Footing: square side = load/soil, rounded up to even inches, minimum 16"; 10" thick (12" when 24" or larger); note "(cut the slab)" / "on a pier in the crawlspace" / "carried down to the foundation".
4. **Before you cut**: checkbox **Temporary shoring walls on both sides (length each)** and a reminder list (wiring/plumbing/gas/ducts; permit and framing inspection; patch floor, walls, ceiling).
Non-bearing: "Remove it … comes out as demolition."

**Mark wall for removal (with this beam)** sets the wall to demolish and records the beam, posts, footing, reaction, shoring and soil. The builder's list then gets the LVL or lumber beam plies, posts, post footings (CY), joist hangers (flush), shoring (LF) and patching (LF).

### 2.4 Floor and ceiling joists (Floor framing dialog)

- **Frame**: *Floor joists* or *Ceiling joists (under a rafter roof or a flat ceiling)*; **Floor of / Ceiling of** level picker.
- Floor, first level: **Foundation** *Crawlspace / Basement / Slab on grade (no joists)*. A slab shows "A slab floor has no joists."
- **Joists**: *Dimensional lumber* (Size 2x6–2x12; Lumber species), *I-joists* (Depth 9-1/2", 11-7/8", 14", 16"), *Open-web floor trusses* (Depth 12", 14", 16", 18", 20", 24").
- **Spacing** 12 / 16 / 19.2 / 24" o.c.; **Direction** *Shortest span (automatic) / East to west / North to south*; **Girder spacing** (ft) on a non-slab first floor.
- Ceiling: Size 2x4–2x10, Spacing 12/16/24, Direction, **Attic used for storage (20 psf)**.
- Allowable spans: lumber from the NDS check for 40 psf live (30 at bedrooms) + 10 dead at L/360; I-joist spans (inches) 9-1/2": 208/193/181/162 at 12/16/19.2/24; 11-7/8": 248/229/215/193; 14": 281/259/243/218; 16": 311/287/269/241; floor trusses 12": 216, 14": 240, 16": 264, 18": 288, 20": 312, 24": 360 (×1.1 at ≤16", ×1.05 at 19.2").
- The layout draws joists clipped to the rim, split at bearing walls and girders, trimmed around stair and chimney openings (2" chimney clearance), with doubled trimmers and headers at openings over 48" (R502.10) and a warning when an opening header spans over 72". Over-spanned joists are red. Warnings list: "N joist spans longer than … allow (longest …)".
- Right side: framing plan preview and a **schedule** table (Item / Qty / Unit): joists by stock length (even feet, 1-1/2" bearing each end), trimmers and headers, rim joist or LSL rim board (LF), joist hangers, girder (LF), blocking at bearing lines, subfloor 23/32" T&G sheets and adhesive (or 1/2" ceiling drywall for ceilings).
- Changes save as you go; joists show in the 3D framing view, the Floor framing plan tab and the S2 sheets.

### 2.5 Roof wizard

Structure › Roof wizard (also Architecture › Roof, and the roof panel). Builds roofs over a level's exterior walls, replacing that level's roofs (undo restores them).

1. **Shape**: picture buttons for every roof style (gable, hip, dutch, gambrel, mansard, shed, flat); **Level**; **Pitch** 2–18/12 (2 and 3 marked low slope); **Overhang**; **Ridge runs** (gable/gambrel/shed): long way automatic, east–west, north–south.
2. **Framing**: **System** *Engineered trusses* or *Rafters and ceiling joists*. Trusses: **Truss type** Common (Fink W) / Energy heel (raised heel) / Scissor (vaulted ceiling) / Attic (room in the roof); **Spacing** 16/19.2/24; for hip, dutch, mansard: **Hip girder setback** (ft) and **Girder plies** 2/3. Rafters: **Rafters** 2x4–2x12, **Spacing** 12/16/24, **Lumber** species.
3. **Covering and venting**: Covering (asphalt shingles, metal panels, clay or concrete tile); Underlayment (synthetic, #30 felt, ice and water shield full roof); checkboxes Ice barrier at the eaves 24" inside the wall (R905.1.2), Drip edge (R905.2.8.5), Ridge vent, Soffit vents, Gutters and downspouts.

Right side: roof framing plan preview (trusses or rafters), a **Typical truss** elevation (chords and webs, span), and statistics: roofing in squares and sq ft; ridges and hips · valleys · eaves and rakes in feet; **Attic ventilation (R806.2)** net free area = 1/300 of the attic area with half at the ridge and half at soffits; count of trusses and jacks with marks (GE1 gable ends, T1 commons, G1 girders, H1… step-down hips, EJn/CJn jacks, M1 mono, F1 flat).

### 2.6 Wall framing and cut list (dialog)

Structure › Wall framing, or Check page shortcut, or the wall panel.
- **Wall** picker (walls on this level, labelled "Outside/Inside wall L (x,y to x,y)"); **Studs** 12 / 16 / 24" o.c. (advanced framing).
- **Framing elevation** drawing: single bottom plate (cut at doors), double top plate, studs 16" from the wall start, king and jack studs at openings, headers (sized by the structure check in bearing/exterior walls; flat 2x otherwise), rough sills (doubled when the sill is above 4"), cripples, blocking, three-stud corners. Header size labelled over each opening; caption "length · stud size @ spacing · load-bearing/non-bearing".
- **Cut list** scope *This wall* / *All new walls*, with **Download CSV**: studs as 92-5/8" or 104-5/8" precuts (or the exact length), jack studs and cripples by length, plates in LF (+5 %), rough sills, headers "size x length".
- **Header schedule** (Mark · Opening type and size · Header (non-bearing noted) · Jacks): two jacks each side for openings over 6 ft; rows that fail the check are flagged. Note: "Headers come from the structure check (IRC R602.7)."

### 2.7 Framing plans (Designer tabs and sheets)

- Plan tabs **Floor framing** and **Roof framing** overlay the layout on the plan (joists with a span arrow and label "2x10 JOISTS @ 16" O.C.", GIRDER labels, OPEN crossed openings, red over-spanned members; truss lines with marks every few trusses, or rafter lines with ridges/hips).
- 3D **Framing** chip shows studs, plates, headers (LVL colored for bearing headers), king/jack/cripple studs, floor and ceiling joists, rim, rafters or truss chords and webs.
- Sheets (see 4.3): S1.x framing plan per level (member sizes, headers, new beams), S2.x joist layout per level, S2.9 ceiling joists, S3.0 roof truss layout with truss schedule, S3.1 roof rafter framing with rafter schedule, S4.1 wall framing elevations with header schedule.

---

## 3. Systems page

Design workflow › **Systems** page (also Systems ribbon tab › Calculations › Systems page). Tabs: **Energy code**, **Heating and cooling**, **Electrical service**, **Plumbing**, **Lighting**. Header note: "Calculated from the model. Planning numbers to size and compare; not a stamped design."

### 3.1 Energy code

**Building shell** inputs: **Climate zone** 1A (south Florida), 2A (Gulf coast, south Louisiana), 3A (Mississippi, Alabama, Georgia — default), 4A (Tennessee, Kentucky, Virginia), 5A (Ohio, Illinois, Pennsylvania); choosing a zone also resets the design temperatures. Wall cavity R, Wall continuous R (foam), Ceiling R, Floor R, Slab edge R, Window U-factor, Window SHGC, Skylight U-factor, Door U-factor (default 0.20), Air leakage (ACH50), **Ducts** (In a vented attic / In a vented crawlspace / Inside the conditioned space), and **Include energy code items in the code check list**.

Defaults by zone (2021 IRC Table N1102.1.2): 

| Zone | Window U | Skylight U | SHGC | Ceiling R | Wall options | Floor R | Slab | ACH50 | Design °F heat/cool |
|---|---|---|---|---|---|---|---|---|---|
| 1A | 0.50 | 0.75 | 0.25 | 30 | R-13 or R-10ci | 13 | none | 5 | 45 / 94 |
| 2A | 0.40 | 0.65 | 0.25 | 49 | R-13 or R-10ci | 13 | none | 5 | 32 / 95 |
| 3A | 0.30 | 0.55 | 0.25 | 49 | R-20, R-13+5ci or R-15ci | 19 | R-10, 2 ft | 3 | 23 / 95 |
| 4A | 0.30 | 0.55 | 0.40 | 60 | R-20+5ci, R-13+10ci or R-15ci | 19 | R-10, 4 ft | 3 | 15 / 93 |
| 5A | 0.30 | 0.55 | none | 60 | R-20+5ci, R-13+10ci or R-15ci | 30 | R-10, 4 ft | 3 | 5 / 90 |

**2021 IRC prescriptive check table** (Component / Required / This project / Meets or Below): wood-frame walls (or a maximum U: 0.084 zones 1–2, 0.060 zone 3, 0.045 zones 4–5), ceiling under attic (R-38 allowed at full depth over plates), floor over crawlspace (R-13 allowed when it fills the cavity), slab edge, windows U-factor, windows SHGC, skylights U-factor (when skylights exist), air leakage (blower door), ducts (R-8 and leakage test 4 cfm25/100 sf when outside conditioned space). Note: the energy code applies to new and altered parts (N1109).

**Total UA trade-off (IECC R402.1.5, the REScheck method)**: table by assembly (Walls, Windows, Doors (one 24 SF door exempt), Ceilings, Floors over crawlspace, Skylights) with area, this project's UA and the code house UA (reference U: zone 1 fen 0.50/sky 0.75/ceil 0.035/wall 0.084/floor 0.064; zone 2 0.40/0.65/0.026/0.084/0.064; zone 3 0.30/0.55/0.026/0.060/0.047; zone 4 0.30/0.55/0.024/0.060/0.047; zone 5 0.30/0.55/0.024/0.045/0.033). Result **Passes/Fails** with "N % better/worse than code", SHGC mandatory check, glass area as % of floor area, and a slab-edge reminder. Window U-factors use each window's own value when set.

### 3.2 Heating and cooling

**Design conditions**: Winter outdoor, Summer outdoor, Indoor winter (70), Indoor summer (75), Moisture difference (55 grains), People (default bedrooms + 1, minimum 2). Note: "Forest, MS (Jackson design data): about 23°F winter and 95°F summer."

Method: a simplified Manual J. Wall U from the cavity and continuous R with 25 % framing; ceiling U = 1.07/(R+1.4); floor U = 1/(R+2.6); crawlspace floors at 60 %; slab edge 0.54 or 0.73 Btu/h·ft·°F (insulated/not); infiltration from ACH50 ÷ 18 (÷ 16 for two or more stories), cooling at 60 %; window solar gain by wall facing (N 35, NE/NW 90, E/W 140, SE/SW 110, S 70 Btu/h per sf × SHGC; skylights 200); kitchen +1,200 Btu/h; people 230 sensible + 200 latent each; duct losses ×1.15 heat/×1.20 cool in an attic, ×1.10/×1.08 in a crawlspace. Equipment = cooling ÷ 12,000 rounded up to the half ton (minimum 1.5 ton); airflow 400 cfm per ton.

Outputs: totals bar (Heating Btu/h, Cooling Btu/h with % sensible, Equipment tons and cfm); **Room by room** table (Room/level, Area, Glass, Heating, Cooling, Airflow cfm).

**Duct sizing (equal friction, 0.08" per 100')**: per room CFM, number of supply registers (one per 150 cfm), branch duct round size (6" ≤ 100 cfm, 7" ≤ 140, 8" ≤ 200, 9" ≤ 270, 10" ≤ 350, 12" ≤ 550, 14" ≤ 850, 16" ≤ 1250, 18" ≤ 1750, 20" ≤ 2400, else 22"), register (4" × 10" ≤ 100 cfm, 4" × 12" ≤ 150, else 6" × 12"); system note: tons, total CFM, supply trunk round and rectangular (8" × 14" ≤ 600 cfm, 8" × 18" ≤ 800, 8" × 22" ≤ 1000, 10" × 22" ≤ 1200, 10" × 28" ≤ 1600, else 12" × 30"), return free area (sq in at about 400 fpm) and filter grille (20 × 20 ≤ 800 cfm, 20 × 30 ≤ 1200, else two 20 × 25).

### 3.3 Electrical service

**Major appliances**: Heating and cooling (*Heat pump with electric backup strips* (default), *Gas furnace with central AC*, *Electric furnace with central AC*, *Ductless mini-splits*); Backup heat kW (heat pump and electric furnace; default 8); Range (Electric/Gas); Dryer (Electric/Gas); Water heater (Electric/Gas/Heat pump water heater); EV charger; Well pump.

**Service load (NEC 220.82 optional method)** table (Load, VA, Note): general lighting and receptacles at 3 VA/sq ft of conditioned rooms; small-appliance circuits 2 × 1,500; laundry 1,500 (when a washer or laundry room exists); electric range 12,000; dishwasher 1,200 (when drawn); disposal 900; microwave 1,500; refrigerator 700; electric dryer 5,000; electric water heater 4,500; fans 300; EV charger 7,680; well pump 2,000; any extra appliances. General demand: first 10,000 VA at 100 %, remainder at 40 %. Heating/cooling: compressor = tons × 1,400 + 600 VA; heat pump = compressor + strips at 65 %; electric furnace = larger of AC and strips at 65 %; mini-split = tons × 1,200; gas = AC only. Totals bar: calculated VA, amps at 240 V, **Service size** (100, 125, 150, 200, 225, 320 or 400 A).

**Panel schedule** ("N A main, N spaces"): columns Space, Circuit, Breaker (A, 2P), Wire (copper NM-B: 15 A 14 AWG, 20 A 12, 25–30 A 10, 35–40 A 8, 45–60 A 6, 70–80 A 4, 90–100 A 3), Protection (GFCI/AFCI), VA, Notes. Dedicated circuits: two 20 A kitchen countertop (GFCI/AFCI), range 50 A 2P, dishwasher 20 A GFCI, disposal 20 A GFCI, microwave 20 A AFCI, refrigerator 20 A, laundry 20 A GFCI/AFCI, dryer 30 A 2P, water heater 30 A 2P, outdoor unit (breaker from MCA = tons × 5.6 + 3, × 1.5), air handler with strips (kW × 1000/240 × 1.25), furnace blower 15 A, mini-split 2P, EV charger 40 A 2P GFCI, well pump 20 A 2P, each bathroom 20 A GFCI, garage 20 A GFCI, outdoor 20 A GFCI; general lighting/receptacle circuits grouped by about 450 sq ft per 15 A AFCI circuit ("Lights and receptacles: room, room…" with receptacle and light counts); kitchen and bath lights with smoke/CO alarms 15 A AFCI. Spaces numbered odd left / even right, balancing VA per bus; panel size 12, 16, 20, 24, 30, 40 or 42 spaces (4 spare). Footnote on NEC 210.12 AFCI, 210.8 GFCI, dual-function breakers, 60 °C copper.

### 3.4 Plumbing

**Fixture units** table (Fixture, Count, DFU each, WSFU each) built from placed fixtures: Water closet 1.6 gpf (3 DFU, 2.2 WSFU), Lavatory (1, 0.7), Bathtub (2, 1.4), Shower (2, 1.4), Kitchen sink (2, 1.4), Dishwasher (2, 1.4), Clothes washer standpipe (2, 1.4), Laundry tub (2, 1.4), Bar sink (1, 1.0), Floor drain (2, 0), Hose bibb (0, 2.5); a toilet + lavatory + tub/shower in one room counts as a **Bathroom group** (5 DFU, 3.6 WSFU). Totals: Drainage DFU, Supply WSFU ≈ peak gpm (IRC curve: 3 gpm at 1 WSFU, 5 at 2, 6.5 at 3, 8 at 4, 9.4 at 5, 10.7 at 6, 12.8 at 8, 14.6 at 10, 16 at 12, 17.5 at 15, 19.6 at 20, 21.5 at 25, 23.3 at 30, 26.3 at 40, 29.1 at 50, 32 at 60, 38 at 80, 43.5 at 100).

Results: **Building drain** (3" ≤ 42 DFU, 4" ≤ 216, else 5" or larger with a water closet; 2" ≤ 8, 2-1/2" ≤ 21, 3" otherwise without; Table P3005.4.2, 1/4" per ft); **Water service line** (3/4" ≤ 12.5 gpm, 1" ≤ 20, 1-1/4" ≤ 32, else 1-1/2"; P2903.7 at 40–60 psi under 100 ft); **Water heater** tank (40 gal for 1 bath, 50 for 2, 65 for 3, 80 above) or tankless.

**Drain and vent sizing (IRC P3005, P3113)**: per room — fixtures with trap sizes (WC 3" integral, lav 1-1/4", tub 1-1/2", shower 2", kitchen sink 1-1/2", dishwasher 1-1/2" through the sink, washer 2", laundry tub 1-1/2", bar 1-1/2"), DFU, branch drain (with a WC: 3" ≤ 20 DFU else 4"; without: 1-1/2" ≤ 3, 2" ≤ 6, 2-1/2" ≤ 12, 3" ≤ 20, 4" ≤ 160, 5" ≤ 360, else 6"), vent (1-1/4" for 1-1/2" drains, 1-1/2" for 2" and 2-1/2", 2" for 3" and 4", 2-1/2" for 5"). Stack size per level (3" ≤ 48 DFU with WCs, else 4"); building drain; vent through roof (3" main vent with a WC, else 2"). A **riser diagram** (SVG) draws each level, room branches, fixture drops, vents, the stack and the building drain. Notes: a 3" branch takes no more than 2 water closets; slope 1/4" per foot under 3", 1/8" at 3" and over.

**Water supply branches (P2903) and water heater**: per room WSFU (bathroom group credit), peak gpm, cold and hot branch size in PEX (hot at 75 % of WSFU; cumulative WSFU ≤ 1.5 → 1/2", ≤ 9 → 3/4", ≤ 16 → 1", ≤ 30 → 1-1/4", else 1-1/2"); building WSFU, gpm, service and main; note on 3/8" PEX to single lavatories/toilets and upsizing over 60 ft or under 40 psi. Water heater: **First-hour rating needed** (people × 20 gal + 6 if dishwasher + 15 if washer + 8; people = bedrooms + 1), **Tank size** (40 gal ≤ 50 FHR, 50 ≤ 65, 65 ≤ 80, else 80), **Tankless** peak gpm (2.0 per bath up to two + 1.5 kitchen sink) at a temperature rise of 120 °F minus ground water (1A 75°, 2A 70°, 3A 62°, 4A 55°, 5A 47°), with a unit suggestion (≥ 5 gpm two units or 199k BTU gas; ≥ 3.5 gpm 180–199k BTU gas; else 150k BTU gas or 27 kW electric).

### 3.5 Lighting

**Light levels by room** table (Room, Fixtures, Lumens, Foot-candles, Target, Advice): lumens default per fixture type (ceiling light 1,600, recessed can 800, pendant 800, fan light 1,200, sconce 450, under-cabinet 300, exterior 700, or the fixture's own lumens); foot-candles = lumens × 0.6 utilization × 0.85 aging ÷ floor area; targets kitchen 30 (50 at counters), bath 30, living 10, dining 20, bedroom 10, hall 5, laundry 30, office 30, garage 20, closet 10, other 10; pills **No lights**, **Dim** (< 80 % of target), **Bright** (> 2.5× target), **Good**; advice "Add about N six-inch recessed lights (800 lm), spaced about H ft apart" and a per-room tip.

**Lighting layout and foot-candles** (point-by-point planner): pick a room and a recessed fixture from the library (4" LED wafer 650 lm, 6" LED wafer 1,000 lm, 6" retrofit can 900, 4" gimbal 700, flush-mount 1,600, drum pendant 1,200, mini pendant 500, ceiling fan with light 1,200, wall sconce 450, vanity bar 1,500, under-cabinet LED per 24" 350 — each with beam angle, watts and a planning price). A color map on a 1 ft grid at 30" work-plane height (blue dim, yellow/red bright at twice the target) with existing lights as white dots and a suggested grid as blue rings; stats Average fc, Lowest/highest, Target, Evenness (avg/min); button **Place N recessed lights in Room** (replaces that room's non-existing cans/lights). The fixture library table is shown below. Note: 2,700–3,000 K, 90+ CRI.

**Light color and marks**: fixture type marks (A, B, C… per type/lumens/color/dimmable), **Set every light to** a Kelvin preset (2200 candlelight, 2700 warm white, 3000 soft white, 3500 neutral, 4000 cool white, 5000 daylight) with **Apply**, **Open the lighting schedule**; **Switch groups** list (S1, S2…: switch type, room, the marks it controls, LED watts, dimmer).

**Lighting scenes**: named dimmer levels per switch group (0–100 % sliders) used by Render; presets **Cooking**, **Dinner**, **Night light**, **Everything on**. Requires lights linked to switches (Electrical › Link switches).

### 3.6 Pipes and ducts on the plan

Systems ribbon › Plumbing and HVAC: chain-click tools **Cold water pipe**, **Hot water pipe**, **Drain pipe**, **Gas pipe**, **Supply duct**, **Return duct** (click points, Enter/Esc to finish). Each run's panel: **System** (Cold water, Hot water, Drain and waste, Vent, Gas) with sizes (cold 1/2", 3/4", 1" default 1/2"; hot 1/2", 3/4"; drain 1-1/2", 2", 3", 4" default 2"; vent 1-1/2", 2", 3" default 1-1/2"; gas 1/2", 3/4", 1" default 3/4", black steel or CSST), **Height above the floor** (defaults: water and gas 10" below the floor, drain 16" below, vent 60" above), run length and the 1/4" per foot drain slope note. Ducts: **Type** Supply (6", 8", 10", 12" round, 14" × 8", 20" × 8"; default 8" round) or Return (12", 14", 16" round, 20" × 10"; default 14" round); **Runs in** Attic or Crawlspace/below the floor; length and R-8 note. Pipes draw as colored lines labelled "CW 1/2"" etc. (blue cold, red hot, green drain/vent, gold gas); ducts as shaded strips with the size. They appear in 3D, on the plan sheets, in the builder's list (pipe LF, elbows, hangers; duct LF and elbows) and in the clash checks (1.8).

### 3.7 Systems sheets

Sheet **M0.1 Energy and systems calculations** (energy code table, room loads with totals and equipment, service load table, fixture units with drain/service/water heater), **E0.1 Electrical panel schedule** (panel header "PANEL A: N A MAIN BREAKER, 120/240 V 1-PHASE 3-WIRE, N SPACES", the schedule, grounding and tamper-resistant/smoke-alarm notes), **P1.1 Plumbing riser and duct schedule** (DWV per room, stacks, building drain and VTR; duct schedule per room with trunk and return).

---

## 4. Documents workflow

Documents tab › pages **Sheets** and **Schedules**. The Sheets page has tabs **Plan set**, **Board presentation**, **Finish board**.

### 4.1 Plan set page

Layout: a sheet list on the left (sheet number and title; also a drop-down), the sheet preview in the middle with a title bar "No · Title · scale" and **−**, **Fit**, **+** zoom (up to 6×), and a **Print and export** panel on the right:

- **Paper**: **Sheet size** *24 x 36 in (ARCH D)*, *11 x 17 in (Tabloid)* (default), *8.5 x 11 in (Letter)*; **Drawing scale** *Largest that fits* (default) or fixed 1/2", 3/8", 1/4", 3/16", 1/8", 3/32", 1/16" = 1'-0". Site sheets also use 1" = 20', 30', 40', 60', 100'. "Scales are true when printed at 100 % on the chosen paper."
- **Title block**: Address, Prepared for, Drawn by, Revision, Date (blank = today).
- **Revisions**: rows of number, date, description; **Add revision**; revisions print in a table in every title block (last 6).
- **Lot for the site plan**: Lot width, Lot depth, Front setback, Left side setback (0 width hides the lot).
- **Zoning and permit packet**: Permit office, Parcel number, Front/Side/Rear setback (min), Max height, Max lot coverage %, Max impervious %; a live line "Heated N sq ft · footprint N sq ft · lot · coverage % · impervious %" and per-rule OK/NO; **Permit packet (PDF)** button.
- **Export**: **Download PDF (N sheets)** (vector, one page per sheet at the chosen paper size), **Download this sheet as SVG**, **Download DXF floor plans (zip)**, **Download all sheets as DXF (zip)**, **Download this sheet as DXF**.

**Title block fields (every sheet)**: "REMODEL STUDIO"; project name (up to 3 lines); DESIGN OPTION (when options exist); ADDRESS; PREPARED FOR; DRAWN BY; DATE; REVISION; the revisions table; "CODE BASIS 2021 IRC, 2021 IBC, 2010 ADA Standards"; the disclaimer "Planning drawings. Verify all dimensions in the field before building. Not engineered."; bottom block with the sheet title, "SCALE: …", the sheet number in large type and "SHEET". Drawing titles carry a bubble, the title, scale, a north arrow (rotated to the site bearing) and a graphic scale bar. Dimension strings are drawn on all four sides of plans (overall, wall breaks, opening centerlines).

### 4.2 Every sheet the plan set can produce

Sheets appear only when the model has the content; numbering is automatic.

| Sheet | Name | What it shows |
|---|---|---|
| A0.1 | Cover sheet and schedules | Project name, address, client, option; **Sheet index**; **Floor area (from rooms)** per level and total; **General notes** (planning drawings; dimensions to outside face of framing and centerlines; verify existing; code basis); **Code check summary** (fail/review counts and up to 8 items); **Door schedule** (Mark, Size, Door type/style, Handing (Res / ANSI), Hardware, Notes: 32" clear?, 20 MIN, CLOSER); **Window schedule** (Mark, Width, Height, Sill, Head, Type, Level); under IBC a **Code analysis (2021 IBC)** table |
| A0.2 | Site plan | Site features, grading, decks and steps, first-floor exterior walls, roof outline, "HOUSE" label with area and overall size, overall dimensions, lot line with lot dimensions and setback dimensions when a lot is entered (site scales) |
| L1.0 | Landscape and play area plan | Site, house, play areas with surfacing labels, equipment with use zones, plant canopies with two-letter keys; **Plant schedule** (Key, Common / Botanical, Qty, Size), **Playground schedule** (Model, Item, Qty, Fall ht), notes (plant size shown, Call 811, CPSC/ASTM, ADA surfacing) |
| A0.3 | Keynote legend | Table No., Note, Builder's list item, Qty, Where (levels) for every keynote |
| A1.n | *Level* existing and demolition plan | For remodels with existing/demolished walls: existing walls gray, walls to remove dashed |
| A1.n | *Level* (proposed) plan | Floor plan: rooms tinted with name, size and SF, walls (new dark, existing gray), doors with swings and marks (circles), windows (hexagon marks), stairs (UP/DN), fixtures and cabinets, all registered plan objects, drafting, dimension strings, the section mark A-A when no sections are drawn |
| A1.n | Foundation plan | Bearing/exterior walls with footing lines; slab note "4" CONCRETE SLAB ON GRADE OVER 6 MIL VAPOR RETARDER / THICKENED EDGE…", or crawlspace girders and 16" × 16" piers at about 8' with the joist note |
| A1.n | Roof plan (or *Level* roof plan) | Roof edges, ridges/hips/valleys, dormers, slope arrows with pitch "n:12", covering, overhang and framing note |
| A2.1 | Exterior elevations | Four elevations (named by compass from the site bearing) with grade line (sloped when graded), finished floor / top of plate / ridge level markers, window grilles and arches, door styles |
| A3.n | Building section A (B, C…) | One per drawn section cut (or an automatic cut across the ridge): walls, floors, ceilings, roof, footings, room labels, level markers |
| A4.1 | Accessibility plan | First-floor plan with 60" turning circles in baths and kitchens (red when short), door maneuvering clearances, toilet 60" × 56" clear floor, and the **Accessibility requirements (2010 ADA Standards)** table (door clear width, latch side, threshold 1/2", turning space, accessible route, ramp slope, toilet centerline 16–18", toilet clearance, lavatory rim 34", grab bars 33–36", work surface 34"/30", reach range 15–48") |
| A5.0 | Cabinet plan and schedule | Numbered cabinet plan of the cabinet level with a schedule (#, SKU, Type, W x H x D, Style, Price) |
| A5.n | Kitchen and bath elevations | Interior elevations, four per sheet, of every wall carrying fixtures or cabinets: cabinets with numbers, counters and splash, appliances, plumbing fixtures, tile, bottom dimension string and heights; titled "Room: direction wall" |
| A5.n | Countertop shop drawing | Counter pieces with dimensions, "W" wall sides, sink cut-outs with centerline distance, suggested seams, piece table (PC, Size, SF, Cutouts, Seams), material/edge/splash/slab notes |
| A5.4 | Countertop slab layout | Pieces laid on slabs with grain lines, piece list, slab count and yield |
| A6.1 | Schedules | **Room finish schedule** (Level, Room, Floor, Base, Walls, Ceiling, Clg ht, Area) and **Plumbing, appliance and mechanical schedule** (Type, Item, Qty, Location) |
| S1.n | *Level* framing plan | Bearing walls shaded, joist span arrows with size and spacing ("CJ" for ceiling joists), header labels "D1 HDR: (2) 2x10", new beams "NEW BEAM: … WITH POSTS AT EACH END"; red where the suggested upgrade is needed |
| S2.n | *Level* joist layout | Joists, rim, girders, trimmers/headers, openings; **Floor framing schedule**; notes on bearing, doubled trimmers, blocking |
| S2.9 | *Top level* ceiling joists | Ceiling joist layout with its schedule |
| S3.0 | Roof truss layout | Trusses with marks, **Truss schedule** (Mark, Qty, Type, Span, Pitch, heel, ply), truss notes |
| S3.1 | Roof rafter framing | Rafter lines, ridges/hips, **Rafter framing schedule** (rafters by length, ridge/hip boards one size deeper, collar ties, hurricane ties) |
| S4.1 | Wall framing elevations | Up to six new exterior wall framing elevations at 1/4" and the **Header schedule** |
| D1.1 | Typical details | Six details drawn from the project: Typical wall section (foundation type, joists, studs, insulation R-values, ceiling joists, roof), Opening framing (largest header), Floor finish assembly (tile or other), Shower pan and walls (when a tub/shower exists) or Cabinet and grab bar backing, Stair handrail and guard (when stairs exist), Deck ledger (when decks exist); each with leader notes, code references and a detail bubble |
| M0.1 | Energy and systems calculations | See 3.7 |
| P1.1 | Plumbing riser and duct schedule | See 3.7 |
| E1.n | *Level* electrical plan | Plan with devices, dashed switch legs, an **Electrical legend** with counts, and notes (receptacle and switch heights, GFCI, AFCI, alarms) |
| E0.1 | Electrical panel schedule | See 3.7 |

Revision clouds: when the contract is locked and a change order is created (Cost › change orders), the parts that changed are clouded on the plan sheets with a red cloud and a revision triangle numbered with the change order's revision; void change orders lose their clouds; the setting "revClouds" can turn them off. A manual **Revision cloud** drawing tool (Annotate › Markup) also exists. Change orders add rows to the title-block revisions automatically ("Change order N: …", marked (signed)/(void) when the status changes).

### 4.3 Permit packet (PDF)

A letter-size cover letter and data package: date, "Building Official", the permit office, "Re: Building permit application, address"; a paragraph (remodel vs remodel and addition, 2021 IRC, ADA where applicable, number of sheets); **Project data** (project, address, parcel, owner, prepared by, occupancy and construction "R-3 one- and two-family dwelling, Type V-B", code basis "2021 IRC (, 2021 IBC), 2020 NEC", foundation); **Areas** (heated per level, total heated, garage, porches and decks, footprint, total under roof); **Site data** (lot size and area, lot coverage under roof, impervious sq ft and %, front/left/right/rear distances, building height average grade to peak); **Zoning compliance** rows (requirement · actual · complies / DOES NOT COMPLY); **Sheet index**; **Inspections** checklist (footing and foundation; under-slab plumbing; framing with rough plumbing/electrical/mechanical; insulation; final).

### 4.4 Board presentation

Sheets › **Board presentation**: a 13.333 × 7.5 in widescreen PDF. **Title** fields: Title (defaults to the project name), Subtitle ("Remodel plan for board review"), Presented by, Closing notes. **Slides** checkboxes:
- Cover with a street view, area, cost and code status (hero 3D image; "N sq ft · $ planning estimate · N code items to resolve / no code failures found")
- Before and after (existing vs. proposed) — dollhouse views; skipped when nothing is marked existing
- Photoreal renders in the gallery
- Your saved 3D views (two per slide; or an overall and dollhouse pair when none are saved)
- Design options side by side (up to 3, with area, estimate, labor hours, code items)
- Floor plans (one per level)
- Planning estimate (materials, tax, labor, dumpsters, permit, extras, overhead and profit, contingency, total; per-option totals)
- Code and accessibility review (counts to resolve/review and up to 12 items)
- Structure items that need attention (beams and overstressed members)
- Finish board (cabinets, counters, floors, tile, paint, hardware)
- Closing notes page when notes are entered.
Buttons **Make presentation PDF** (with progress) and **Preview the cover image**.

**Presentation extras** on the same page: **Before and after** interactive slider (view: overall or a saved view; angle From above / From the street / Dollhouse); **Walkthrough video** (opens the Video dialog, see 5.5); **Client review page**: one self-contained HTML file (before/after slider or the design image, up to 8 saved views, last 6 gallery renders, up to 3 plan sheets, price table) with a comment box per section and a **Send comments** button that saves a JSON file and opens an email; **Import client comments…** brings the JSON back as a checklist (who, section, date, text, done checkbox).

### 4.5 Finish board

Sheets › **Finish board**: tiles for every finish the model carries — Cabinets (door style, finish, framed/frameless, line, vendor), Countertops (material, thickness, edge, splash, brand), Flooring (per material/color with rooms), Tile (per material/color with where), Paint (per color with rooms), Wall finish, Hardware (pull style and finish, brand) — each with a generated swatch picture and color chip. **Extra samples** table (Group, Name, Where/note, Color) with **Add a sample**. **Finish board PDF** (landscape letter). The finish board also becomes a presentation slide.

### 4.6 Schedules page

Documents › **Schedules**: interactive tables ("Change a value in the table and the model changes with it"). Controls: **Pictures** toggle (thumbnail column), **Filter rows** search, **Download CSV**, click a heading to sort, **Show** on each row opens the item in Design. Types and columns:

| Schedule | Columns |
|---|---|
| Doors | Mark, picture, Level, Rooms, Width*, Height*, Type* (door type), Style*, Handing, Hardware, Header (from the header schedule, "(check)" when failing), Status* (Existing/New/Remove) |
| Windows | Mark, picture, Level, Rooms, Width*, Height*, Sill*, Head, Operation* (double-hung, casement, slider, awning, fixed), Net clear opening (sf and W × H, or "fixed"), Header, Status* |
| Cabinets | #, picture, Code, Room, Width*, Depth*, Height*, Door style*, Finish*, Hinge* (Auto/Left/Right), Price, Status* |
| Cabinet hardware | #, Cabinet code, Hardware, Finish, Pieces (e.g. "3 × Bar pull 5-1/16" (128 mm)"); plus an **Order totals** table by piece and finish. Pull sizes: drawers ≤ 15" 3-3/4" (96 mm), ≤ 24" 5-1/16" (128 mm), ≤ 33" 6-5/16" (160 mm), else 7-9/16" (192 mm); doors 3-3/4", tall doors 48"+ appliance pull 12"; cup pulls 3"; edge pulls 3"/6"; knobs 1-1/4" |
| Appliances | picture, Appliance (brand model), Type, Room, Size W x H x D, Cut-out, Electrical or fuel, List price, Spec (link), Status* |
| Plumbing fixtures | picture, Fixture, Room, Level, Width*, Depth*, Status* |
| Rooms and finishes | Level, Room*, Area, Floor*, Base*, Walls*, Wall color*, Ceiling*, Ceiling height*, Notes* |
| Lighting | Mark, Fixture, Qty, Lumens*, Color* (Kelvin), Dimmable*, Watts (LED), Switches, Rooms |

\* editable in the table.

### 4.7 Keynotes and tags

- **Keynote** tool (Annotate › Text and tags): click to place a numbered diamond; it reuses the last note. Its panel: **Note** picker (existing keynotes or "+ New keynote"), **Text** (every tag with this number changes), **Number**, **Builder's list item** link. Keynotes print as numbered diamonds and are listed on **A0.3 Keynote legend** with the linked item, quantity and the levels where they are used.
- **Tag by example** tool: click a cabinet, appliance, door, window, light or room; every item like it on the level gets a tag (cabinet code, appliance model, door/window mark, light mark, room name and SF). Tags follow their item; drag to offset (a leader is drawn when offset more than 6"). Panel button **Remove every tag made with this one**.

### 4.8 DXF / DWG export and import

**Export**
- **DXF floor plans (zip)**: AutoCAD R12 ASCII DXF, full size in inches, one file per level of the proposed design plus a README. Layers (US National CAD Standard names): A-WALL, A-WALL-EXST, A-GLAZ, A-DOOR, A-AREA (room outlines), A-AREA-IDEN (room name and SF), A-ANNO-TAGS (door/window marks), A-FLOR-FIXT, A-FLOR-CASE-UPPR (wall cabinets, dashed), A-FLOR-STRS.
- **This sheet as DXF / All sheets as DXF (zip)**: every line, shape and text of the sheet in paper inches on layers A-ANNO, A-ANNO-TEXT, A-ANNO-HIDN (dashed), A-PATT (filled).
- **This sheet as SVG**: the sheet at its paper size.

**Import a DWG or DXF drawing** (dialog): **Drawing units** (Read from the file (inches if not set), Inches, Feet, Millimeters, Centimeters, Meters); **Turn parallel line pairs into walls (CAD-to-walls)** (pairs 3.5"–12.5" apart with 50 % overlap become walls on the centerline; ≥ 5.4" become exterior/bearing; status existing); **Choose DWG or DXF file…**. Reads LINE, LWPOLYLINE and POLYLINE (with bulges/arcs), CIRCLE, ARC, ELLIPSE, SPLINE, SOLID/3DFACE, TEXT/MTEXT/ATTRIB, INSERT (scaled, rotated, arrayed, nested blocks) and DIMENSION blocks. Items land on "DXF <layer>" layers as existing drafting; text becomes notes; the drawing is moved next to the house if it lands far away. DWG files are converted with the free LibreDWG reader (about 11 MB, downloaded once). Named blocks can be saved with **Save its N blocks to my Blocks** for the Block tool.

### 4.9 IFC export

View ribbon › Export › **IFC for Revit or Archicad**. Writes an IFC2X3 Coordination View file in meters: storeys, walls (exterior/interior, with openings cut, IsExternal and LoadBearing properties, assembly name, status and thickness), doors and windows (marks, type/style or operation, width/height/sill), rooms as spaces (use, area, floor and ceiling covering) with floor slabs, and optionally cabinets/appliances/fixtures/furniture as furnishing elements (vendor, model, size, status). Options: **Cabinets, appliances, fixtures and furniture** (on) and **Include parts marked for removal** (off). The result message counts walls, doors, windows, spaces and items. Notes: Revit Insert › Link IFC; Archicad File › Open or IFC › Merge.

---

## 5. Render and views

### 5.1 3D view controls

Chips over the 3D view: **Walk through** (W/A/S/D or arrows, drag to look, Shift to hurry, Esc stops; doors let you through), **Views (N)**, **Paint**, **Framing**, **360°**, **Video**, a section-cut drop-down (No section cut / Cut height / Cut left to right / Cut front to back / Section A…) with **Flip** and a position slider; corner buttons **Show roof**, **Cut at level**, **Sun**, **Render**, **AR / Export**, **Loads**, **Fit**.

### 5.2 Saved views

Views chip › name field (or "Name this walk view") › **Save view**. Each saved view lists with a go-to button (🚶 for walk views) and a delete (✕). Saved views feed the Board presentation, the client review page, the Render studio camera list ("Saved view: …"), the render kit camera presets and the walkthrough video path. Project browser › 3D views also lists them.

### 5.3 Sun study

**Sun** chip opens the Sun study panel: date picker, time slider (5:00 AM to 9:00 PM in 5-minute steps), **Play day / Pause**, quick dates Mar 20, Jun 21, Sep 22, Dec 21; readout "N° up, from the <compass> (az°)" or "Sun is down". **Location and orientation**: Place (default Forest, MS), **Top of plan faces** (N/NE/E/…; elevations and the north arrow follow it), Latitude (32.364), Longitude (−89.474), UTC offset (standard, −6), US daylight saving. Sun position uses the NOAA low-precision formulas; shadows update in the 3D view.

### 5.4 Render studio

**Render** button (3D view or View ribbon › Render) opens the Render dialog: GPU path tracing in the app ("real sun and sky, glass, reflections and light bouncing between rooms"; engine three-gpu-pathtracer). Options:
- **View**: *The 3D view as it is now*, *Street view* (faces the first exterior door), *Aerial view*, four corner views named by compass (e.g. "Northwest corner"), and *Saved view: …* for each saved view.
- **Light and sky**: *Sunny, at the sun study time*; *Golden hour (late afternoon)* (first time after noon the sun drops to 12°); *Overcast, soft shadows*; *Dusk with the lights on*; *Night with the lights on*.
- **Lights on** (N fixtures from the electrical plan; or one ceiling light per room at about 20 lm/sf when none are drawn); **Lighting scene** (when scenes exist: All lights at full or a named scene); **Light brightness** 0.25× to 4×.
- **Auto exposure (like a camera)** and an **Exposure / Brighter or darker** slider −3 to +3 EV (live while rendering).
- **Image size**: Draft 960 × 540, HD 1920 × 1080, Large 2560 × 1440, Square 1600 × 1600, Portrait 1350 × 1688, Plan sheet 3300 × 2100.
- **Quality**: Preview (16 passes), Quick (64), Good (256), Best (700), Final (2,000). Best and Final use 8 light bounces, otherwise 6.
- **Smooth out grain** (denoise, live), **Camera depth of field** (f/4 instead of f/22).
- Buttons **Render / Render again / Stop**, **Save image** (PNG), **Add to gallery** (JPEG kept with the project; gallery renders go on the presentation board). Progress bar shows passes done, elapsed time and the estimate left. A **Gallery** of saved renders with remove buttons; click to enlarge. Settings are remembered with the project.

The **AR / Export** dialog also offers **Open Render**, and on the desktop build a **Photoreal render with Blender** section (finds blender.exe; Camera: Street, Aerial, Every view, or a saved view; Quality Draft 1280 × 720 / Good 1920 × 1080 / Best 2560 × 1440; renders with Cycles and shows the images; files saved in Documents\Remodel Studio\Renders). A **render kit** zip (model.glb, scene.json with sun and cameras, render.py, README) can be produced for Blender 4.2+ with command-line options --camera, --all, --samples, --size, --open.

### 5.5 AR view, 3D export, panorama, video

**AR / Export** dialog:
- **View in AR**: builds a USDZ of the proposed design (demolished work left out); on an iPhone in Safari it opens AR Quick Look; elsewhere a zip with the .usdz to AirDrop/open in Files.
- **3D print or open in another CAD program**: **Scale and units** *1:48 (1/4" = 1'), millimeters*, *1:96 (1/8" = 1'), millimeters*, *Full size, millimeters*, *Full size, meters (CAD)*; **Include the roof**; buttons **STL for 3D printing** (binary STL, Z up), **OBJ**, **GLB with colors**; each in a zip with a README. Glass is left out so openings stay open. **Export 3D** on the View ribbon opens the same dialog.
- Imported models for the library accept OBJ, GLB, glTF (single file), DAE and STL.

**360° panorama** (chip or View ribbon): captures a cube map from the current 3D camera (walk-through spot recommended) and writes a 4096 × 2048 equirectangular JPEG with a drag-to-look, scroll-to-zoom viewer; **Save image**, **Add to gallery** (also goes to the presentation).

**Walkthrough video** (chip, View ribbon or presentation page): **Path** *Fly around the outside* (orbit of 8 keyframes) or *Through my saved views* (two or more saved views, eased), **Seconds between views** 2/3/4/6, **Size** HD 1280 × 720, Full HD 1920 × 1080, Square 1080; checkboxes to include each saved view; records in real time with a progress bar to WebM (or MP4 where supported) at 8 Mbps; preview player, **Record again**, **Save video**.

### 5.6 Photo match (reference)

View ribbon › Render › **Photo match** lines the 3D camera up with a real photo by clicking six or more room corners (floor and ceiling); the design then renders from that camera and blends over the photo. Documented with the Measure workflow.
