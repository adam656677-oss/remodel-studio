# Inventory: Library, Vendors, Cabinets and Kitchen/Bath Design, Measure

All sizes in this document are inches unless a foot mark (') is shown. Defaults and option lists are taken from the program as built.

---

## 1. The Library

### Opening the Library

- Click the **Library** button in the top bar (tooltip: "Doors, windows, cabinets, fixtures, trim, finishes and colors"). It replaces the properties panel on the right side. Clicking it again returns to the properties panel. The button is not shown while the Designer (design mode) is active; from the Designer menu use **Library and customize items**.
- If you open the Library while on a page that has no drawing (Dashboard, Sheets, Schedules, Cost, Measure, Check, Build, Systems), the program switches to the plan (on a narrow screen) or the design view so there is a drawing to place into.
- When the Fixture, Door or Window tool is active, the options bar shows a **More in the Library…** button that opens the panel.
- On a phone-sized screen the panel header has a show/hide (▴/▾) button.

### Panel layout

- Header: item count ("N items") and the title **Library**, with a close (✕) button.
- **Search box** (placeholder "Search: 36 door, vanity, crown, sage…"). Typing searches every category at once; each word you type must appear in the item's name, subcategory or category. Results are ranked (exact phrase in the name first, then names that start with your first word, then shorter names). Up to 150 results are listed, grouped as "Category: Subcategory"; a footer says "Showing 150 of N. Type more words to narrow it down." when there are more. "Nothing matches. Try fewer words." appears when nothing is found.
- **Category chips** (shown only when the search box is empty). The chosen category is remembered on this computer between sessions (default: Doors).
- A note line tells you what is selected in the plan ("Selected: Kitchen. Buttons apply to it where they fit.") or, with nothing selected, "Select a room, wall, door, window, cabinet or roof in the plan to apply finishes and colors to it."
- With the **Cabinets** category open (and no search), a **Manufacturer price books** box appears above the list (see Price books, section 2).
- The list is grouped by subcategory. Each row shows a picture or icon, the name (with a green **ADA** pill for accessible items), a dimension/description line, and one or more action buttons.

### Pictures

Doors, windows, fixtures, cabinets, appliances, furniture, floors, wall finishes, ceilings, roofing, siding, plants and play equipment show a small rendered picture made from the real 3D model (a door is shown standing in a wall, a cabinet against a wall in a corner of a room, siding on a small house). Pictures follow the current kitchen style, trim and hardware finish of your project, so a cabinet picture changes when you change the door style. Pictures render as they scroll into view. Walls show a cut section with the layers colored (brick, sheathing, insulation, drywall and so on); trim shows a profile sketch; colors show a swatch.

### Dimension line

| Item kind | What the line shows |
|---|---|
| Fixture, cabinet, appliance, furniture | W x D x H, plus "· N" up" if it mounts above the floor |
| Door | Door type · door style |
| Window | Operation · sill height · square feet of clear opening (for operable windows) |
| Wall assembly | Thickness · "can carry load" or "partition" |
| Trim | Face height (wainscot: height) |
| Color | Hex value |
| Plant | Height x spread (feet) · sun · USDA zones · "native" where it applies |
| Playground piece | Model number · ages · fall height · use zone |

### Action buttons (what an item can do)

| Item kind | Buttons |
|---|---|
| Fixture, cabinet, appliance, furniture, decor | **Place** (primary); **Customize…** (or **Edit…** for a My items entry); **Swap selected** when a fixture is selected in the plan (keeps position, takes the new size, name and type) |
| Door, window | **Place on a wall** (primary); **Customize…**; **Apply to selected** when a door or window is selected (refuses with "That is wider than the wall." if it does not fit; otherwise swaps size, type and style in place) |
| Wall assembly | **Draw with this** (primary; becomes the Wall tool's preset); **Apply to selected** when a wall is selected (sets thickness, kind, bearing, material; a knee wall sets height 42") |
| Trim | **Whole house** (primary); **This room only** when a room is selected |
| Ceiling, wall finish, floor | **Selected room** (primary when a room is selected); **All rooms** |
| Roofing | **Selected roof**; **All roofs** |
| Siding | **Selected wall** (exterior wall selected); **All exterior walls** |
| Color | With a room selected: **Room walls**, **Room ceiling**, **Room floor**. With a wall: **Wall** or **Wall outside**. With a door/window: **Door** / **Window frame**. With a fixture: **Selected item**. With a roof: **Roof**. Always: **All interior walls**, **All trim**, **House siding**, **All cabinets**, **All doors** |
| Landscape plant | **Place**; **Swap selected** (plant selected); **Fill selected bed** (a planting bed is selected and the plant is a groundcover, perennial, grass or shrub) |
| Playground piece | **Place** |
| Safety surfacing | **Draw** (draws a play area with that surface) |
| KraftMaid spec-book accessory | **Add to selected cabinet** (goes on that cabinet's order line); **Add to order** (loose item on the cabinet order) |

### Placing an item

1. Click **Place** (or **Place on a wall**). The program switches to the Fixture (or Door/Window) tool and, if you were in the 3D view, to the split view. The options bar shows a drop-down with the chosen item (you can switch among basic fixture types there).
2. Move over the plan: a ghost outline follows the cursor. Cabinets, appliances, plumbing fixtures and other wall items snap their back to the nearest wall face (within about the item depth plus 18") and turn to face into the room, sliding along the wall on a 6" step. Furniture, islands, freestanding tubs, water heaters, condensers and anything marked free-standing place exactly where you click.
3. Click to place. The new item is selected and its panel opens on the right. Press **Esc** to finish the tool.
4. Afterwards, drag an item to move it (wall items re-snap to walls; hold **Shift** while dragging to move it away from walls). **E** rotates 90°. The panel offers **Turn 90°**, **Turn around**, **Add one beside** (duplicates next to it along the wall) and, for cabinets, **Add fillers**.

There is no drag-and-drop from the panel into the plan; placement is click **Place**, then click in the plan.

### Item properties (the right-hand panel for a placed item)

Every placed fixture shows: **Picture** (front/back toggle; refrigerators add a "Door hinged on the left / right" choice, tubs "Drain on the left / right"), **Size** (Width, Depth, Height; the height field is labelled Counter height for counter items and Rim height for lavatories; wall cabinets add Bottom above floor), rotate buttons, **Color or finish** (color picker plus a drop-down of library colors by family, with a reset ↺), **Remodel status** (Existing / New / Remove), a hint line (toilet: "ADA: centerline 16" to 18" from the side wall, with a 60" x 56" clear space."; counter items: "Standard counters are 36" high; ADA kitchens need a 30" section at 34" maximum."), and pinned photos. Cabinets add the cabinet panels (section 3). Brand-name appliances add the spec block (below).

### Category tree (every category and subcategory)

Categories, in panel order: **My items** (appears first once you have saved one), **Doors, Windows, Cabinets, Appliances, Plumbing, Furniture, Wall assemblies, Trim and molding, Ceilings, Wall finishes, Floors, Roofing, Siding, Colors**, then the furnishing categories **Living room, Bedroom, Kids room, Dining room, Office, Bath accessories, Garage and storage, Laundry and utility, Lighting and fans, Decor and window treatments, Indoor plants, Outdoor living, Games and fitness, Electronics, People and pets**, then **Landscaping, Playground**, **KraftMaid (Lowe's 2022)**, and any imported catalog you add.

**Doors** (all 80" high unless noted)
- Interior swing: Flush, 6-panel, 2-panel, Shaker 1-panel and 5-panel shaker doors in 24, 28, 30, 32, 36; Louvered 24, 30, 32, 36.
- Exterior entry: 6-panel, Shaker, Half-lite glass, Full-lite glass, 6-lite craftsman, 2-panel in 32 and 36; Tall entry door 36 and 42 x 96.
- Accessible: Accessible door 36" x 80" (lever, 1/2" max threshold); Accessible wide door 42"; Accessible pocket door 36" with D-pull.
- French and double: French double door 48, 60, 72; Double interior door 48, 60, 64, 72 (closet or pantry).
- Sliding patio: 60, 72, 96 x 80; Multi-slide 144" x 96".
- Pocket: 24, 28, 30, 32, 36.
- Bifold closet: 24, 30, 36, 48, 60, 72 (48 and wider are louvered).
- Barn: 36, 42, 48 x 84 on surface track.
- Garage and overhead: 8'x7', 9'x7', 16'x7', 18'x7', 8'x8', 16'x8', 10'x10', 12'x12'; 16'x7' with window row.
- Commercial: Hollow metal door 36, 42 x 84 in steel frame; pair 72 x 84; Storefront entry 36 x 84; Storefront pair 72 x 84; Storefront entry 36 x 96.
- Door types: Swing, Double swing, Sliding, Pocket, Bifold, Barn (surface slider), Overhead garage. Door styles: Flush, 6-panel, 2-panel, Shaker 1-panel, 5-panel shaker, Louvered, Half-lite glass, Full-lite glass, French (10- or 15-lite), 6-lite craftsman, Plank / barn, Hollow metal, Aluminum storefront, Raised-panel garage, Garage with window row (plus Carriage house for overhead doors in the editor).

**Windows** (width x height; default sills: 36", 24" for units 60" or taller, 48" for sliders 36" or shorter, 60" for awning and hopper, 84" for transoms, 12" for storefront)
- Double-hung: 24x36, 24x48, 28x54, 30x48, 30x54, 30x60, 32x60, 34x62, 36x48, 36x54, 36x60, 36x72, 40x60, 44x62.
- Single-hung: 24x36, 24x48, 30x48, 32x60, 36x48, 36x60, 36x72.
- Casement: 18x36, 24x36, 24x48, 24x60, 30x48, 30x60, 36x48.
- Sliding: 36x24, 48x24, 48x36, 60x36, 60x48, 72x48.
- Awning: 24x20, 36x20, 36x24, 48x24, 60x24.
- Basement hopper: 32x16, 32x20, 32x24.
- Picture (fixed): 24x48, 36x36, 48x48, 60x48, 60x60, 72x48, 72x60, 96x60.
- Transom: 36x12, 36x18, 60x18, 72x18, 72x24.
- Bedroom egress: Egress casement 30x48, 24x60, 36x48 (sill 30); Egress double-hung 36x60 (sill 24) — labelled "meets IRC R310 at 44" sill".
- Commercial storefront: 48x72, 60x84, 72x84, 96x96.

**Cabinets** (generic stock sizes; see section 3 for nomenclature)
- Base cabinets: Base cabinet 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 42, 48 (B-codes), 24 deep x 34-1/2 high; Drawer base (3 drawers) 12, 15, 18, 21, 24, 30, 36.
- Sink bases: 30, 33, 36, 42, 48 (SB-codes); Accessible sink base 30, 36 (open knee space, 34" top; 32-1/2 box).
- Corner bases: Blind corner base 36, 39, 42, 45, 48; Lazy Susan corner base 33x33, 36x36.
- Wall cabinets 30" high / 36" high / 42" high: widths 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 12 deep, bottom at 54". Diagonal corner wall cabinet 24, 27 (in the 30" group).
- Bridge and over-fridge: Bridge wall cabinet 30x12, 30x15, 30x18, 33x15, 36x12, 36x15, 36x18, 36x24 (the 24-high unit is 24 deep; all hang so the top is at 84"); Microwave wall cabinet 30x18 (bottom at 66").
- Tall cabinets: Pantry 18, 24, 30, 36 wide x 84, 90, 96 high; Wall oven cabinet 30, 33 x 84.
- Bath vanities: Vanity 24, 30, 36, 42, 48, 60, 72 (60 and 72 are double sink), 21 deep; Accessible vanity 24, 30, 36 (open below, 34" max top); Vanity drawer base 12, 18; Linen tower 18 x 84.
- Islands and peninsulas: Kitchen island 48x36, 60x36, 72x36, 84x42, 96x42, 108x48 (36 high, free-standing); Peninsula 60, 72, 84 x 30.
- Built-ins: Built-in desk 60, 72, 96 x 30 (30 high); Mudroom locker bench 36, 48, 60; Built-in bookcase 36, 48, 72 x 84.
- Laundry: Laundry wall cabinet 30x30 over washer; Laundry sink base 24.
- Price-book subcategories ("<Book name>: Base / Sink bases / Wall / Tall / Vanities / Fillers") appear here after you import a price book.

**Appliances**
- Cooking: Range 24, 30, 36, 48; Cooktop 30, 36 in base cabinet; Double wall oven 27, 30; Range hood or microwave 30, 36.
- Refrigeration: Top-freezer 28, 30; Bottom-freezer 33; French-door 36; Side-by-side 36; Column 30; Built-in 42, 48; Under-counter beverage cooler 15; Chest freezer 48x30.
- Dishwashers: 18, 24.
- Laundry: Front-load washer 27; Front-load dryer 27; Top-load washer 28; Stacked washer and dryer 27.
- Mechanical: Tank water heater 40 gal (22" dia.), 50 gal (24" dia.); Tankless water heater (wall-hung); Furnace or air handler 21x28; Outdoor A/C or heat pump unit 30x30; Electrical panel 14" x 4" (36" clear in front).
- Fireplaces: Fireplace insert 36, 42; Wood stove on hearth 48x48.
- Brand models: "Ranges · brand models", "Cooktops · brand models", "Wall ovens · brand models", "Microwaves · brand models", "Range hoods · brand models", "Dishwashers · brand models", "Refrigerators · brand models", "Laundry · brand models" (see Appliance catalog below).

**Plumbing**
- Toilets: round bowl; elongated bowl; Accessible toilet 17"-19" seat height; Wall-hung toilet with in-wall carrier; Wall-hung urinal; Bidet.
- Sinks: Wall-hung lavatory 18, 20; Pedestal sink 24; Accessible wall-hung lavatory 34" rim; Trough sink 48; Commercial lavatory counter 36; Laundry tub 24x22; Mop (service) sink 24x24; Hi-lo drinking fountain pair.
- Tubs: Bathtub 60x30, 60x32, 60x36, 66x32, 72x32, 72x36; Corner soaking tub 60x60; Freestanding tub 67x32; Walk-in tub 52x30.
- Showers: 32x32, 36x36, 42x36, 48x36, 48x48, 60x32, 60x36, 60x42, 72x36; Accessible transfer shower 36x36; Accessible roll-in shower 60x30; Roll-in shower 60x36 (alternate).

**Furniture** (simple blocks)
- Bedroom: Twin, Full, Queen, King, California king, Twin XL, Bunk bed; Nightstand, Dresser, Chest of drawers, Wardrobe.
- Living: Loveseat; Sofa 72, 84, 96; Sectional 110; Recliner; Armchair; Coffee table; TV console; End table; Bookcase; Piano bench area.
- Dining: Dining table 36 square (4 seats), 48 round (4), 60x36 (6), 72x40 (6), 96x42 (8); Dining chair; Bench.
- Office, school and shop: Desk 48, 60; Executive desk 72; Office chair; Filing cabinet 4 drawer; Lateral file; Conference table 8', 12'; Reception desk; Student desk; Folding table 6'; Workbench 5'; Shelving unit 8'.
- Garage: Car (parking space 9' x 18'); Pickup truck; Riding mower; Golf cart.

**Wall assemblies** (name, thickness, bearing)
- Exterior walls: Exterior 2x4 wood frame 5-1/2; Exterior 2x6 wood frame 7-1/2; 2x4 with brick veneer 10-1/2; 2x6 with brick veneer 12-1/2; 2x4 with stone veneer 11-1/2; 8" CMU block 8; 8" CMU with furring and drywall 9-3/4; 12" CMU 12; 8" CMU with brick veneer 13; ICF wall 6" core 11; SIP panel 6-1/2" (7); Exterior metal stud 6" with panels 8 (not bearing); Post-frame (pole barn) wall with metal panels 6.
- Interior walls: Interior 2x4 partition 4-1/2; Interior 2x4 bearing wall; Interior 2x6 plumbing wall 6-1/2; Interior 2x3 closet partition 3-1/2; Interior metal stud 3-5/8" (4-7/8); Interior metal stud 6" (7-1/4); Interior 2x4 with 5/8" Type X both sides (fire-rated) 4-3/4; Staggered 2x4 on 2x6 plate (sound wall) 7-1/2; Interior 8" CMU (bearing); Knee wall 2x4 (half-height, draws at 42"); Glass block wall 4.
- Each wall assembly is also a preset in the Wall tool's drop-down.

**Trim and molding**
- Baseboard: Ranch 2-1/4; Colonial 3-1/4, 4-1/4, 5-1/4; Craftsman flat 1x6 (5-1/2); Craftsman with cap 7-1/4; Modern square 3-1/2; Tall colonial 7-1/4; Rubber cove base 4" (commercial); Tile base 4".
- Door and window casing: Ranch 2-1/4; Colonial 2-1/4, 3-1/4; Fluted 3-1/4 with rosettes; Craftsman flat 1x4 with head cap; Modern square 2-1/2; Backband 3-1/2; Hollow metal frame (commercial).
- Crown: Cove 3-5/8; Colonial 3-5/8, 4-5/8, 5-1/4; Large crown 6-5/8; Built-up 7-1/4 (frieze + crown); Craftsman flat crown with cap 5-1/2; No crown molding.
- Chair and picture rail: Chair rail 2-5/8" at 32"-36"; Picture rail 1-3/4" at 84"; No chair rail.
- Shoe and quarter round: Base shoe 3/4; Quarter round 3/4; No base shoe.
- Wainscot: Beadboard 32" with cap; Board and batten 48"; Raised-panel 36"; Shiplap 42"; No wainscot.
- Window stool: Window stool and apron; Picture-frame casing (no stool).
- Whole-house defaults: Ranch baseboard 2-1/4, Colonial casing 2-1/4, no crown, no chair rail, Base shoe 3/4, no wainscot, Window stool and apron. A room's panel ("Trim in this room", under Finishes and colors) can override each slot; "Use the whole-house trim" clears the override.

**Ceilings**
- Drywall: Flat drywall smooth; knockdown texture; orange peel; Popcorn texture (existing; test for asbestos before removing if built before 1980).
- Feature: Tray ceiling 12" step; Coffered; Vaulted or cathedral; Beadboard; Tongue-and-groove pine; Wood plank; Exposed beams over drywall; Shiplap.
- Commercial: Suspended 2x2 acoustic tile; Suspended 2x4 acoustic tile; Tin (metal) tiles; Open to structure, painted.

**Wall finishes**
- Paint and drywall: Painted drywall eggshell; Level 5 smooth drywall; Orange peel texture; Knockdown texture; Plaster; Painted CMU.
- Wood and paper: Shiplap; Beadboard full height; Wood paneling; Wallpaper.
- Tile, stone and wet areas: Subway tile 3x6; Large-format tile 12x24; Mosaic tile accent; Stone veneer accent; Thin brick accent; FRP panels (commercial, wet areas); Cement board with tile (wet area).

**Floors**
- Wood and plank: Luxury vinyl plank; Laminate plank; Oak hardwood 3/4"; Engineered wood; Heart pine.
- Tile and stone: Ceramic tile; Porcelain tile 12x24; Natural stone tile; Brick pavers.
- Resilient and carpet: Carpet; Sheet vinyl; Cork.
- Commercial and garage: Vinyl composition tile (VCT); Rubber flooring; Sealed concrete; Polished concrete; Epoxy coating.
- Floor patterns (planks, tile grids, speckle) are drawn on the 3D floors and in swatches.

**Roofing**
- Shingles: Architectural asphalt shingles; 3-tab asphalt shingles; Cedar shake.
- Metal: Exposed-fastener metal panels; Standing seam metal; 5V crimp metal.
- Tile and slate: Clay tile; Concrete tile; Slate.
- Low slope: TPO membrane; Modified bitumen; EPDM rubber.

**Siding**
- Vinyl: Vinyl lap; Vinyl Dutch lap.
- Wood, fiber cement and metal: Fiber cement lap; Fiber cement board and batten; Engineered wood lap; Wood lap; Cedar shingle; Log siding; Metal wall panels.
- Masonry and stucco: Brick veneer; Stone veneer; Stucco; Painted CMU; Split-face block.

**Colors** (generic names, not brand colors)
- Whites: Pure white, Soft white, Warm white, Antique white, Linen, Bright white, Cool white, Ivory.
- Greiges and beiges: Agreeable greige, Light greige, Sand, Khaki, Taupe, Mushroom, Oatmeal, Wheat.
- Grays: Pale gray, Silver gray, Repose gray, Pewter, Charcoal, Slate gray, Graphite, Iron ore.
- Blues: Sky blue, Powder blue, Coastal blue, Denim, Navy, Teal, Slate blue, Porch ceiling blue.
- Greens: Sage, Olive, Hunter green, Mint, Celadon, Forest, Eucalyptus, Moss.
- Reds and oranges: Barn red, Brick red, Terracotta, Burgundy, Coral, Rust, Pumpkin.
- Yellows: Butter, Mustard, Pale yellow, Gold.
- Browns and wood tones: Natural oak, Honey oak, Walnut, Espresso, Cherry, Maple, Gray wash, Chocolate.
- Blacks and darks: Tricorn black, Soft black, Bronze, Black.
- Metals and stone: Brushed nickel, Stainless steel, Matte black metal, Galvalume, Copper, White quartz, Black granite, Butcher block.
- The same list fills every color drop-down in the item panels (room wall/ceiling/floor color, door color, cabinet custom color, countertop color, tile color, window outside color).

**Furnishings and decor** (every item draws as a shaped 3D model and a proper plan symbol; most come in several fabric, wood or metal colors; codes follow a "CODE > description" catalog style)
- Living room: Sofas and loveseats (Track-arm, Rolled-arm, Tuxedo in loveseat 60, sofa 72, 84, 96; gray, navy, cream, charcoal, sage, leather); Sectionals (110x84 and 124x94, right- or left-arm chaise, 4 colors; Chaise lounge); Chairs (Club, Wingback, Slipper, Barrel swivel, Accent, Rocking; Recliner and Recliner reclined for clearance); Ottomans and benches (rectangle, tufted, round pouf, round ottoman 36, Bean bag); Tables (coffee tables 48x24, 54x28, glass, round 36, round 42, trunk; end tables; console 48, 60); Media (Media console 48/60/72/84 with 43/55/65/75" TV; Entertainment wall unit 120"); Storage (Bookcases 30x72, 36x72, 36x84, 48x84, 24x48; Cube organizers 2x2, 3x3, 4x2, 4x4, 2x4; Leaning ladder shelf); Music (Upright piano, Baby grand piano).
- Bedroom: Beds (Panel, Platform, Upholstered, Sleigh, Four-poster, Storage, each in Twin, Twin XL, Full, Queen, King, California king; mattress sizes in the name); Daybed; Nightstands (1, 2, 3 drawers, with lamp); Dressers (60" 6-drawer, 66" 9-drawer, 60" with mirror, Chest 36" 5-drawer, Lingerie chest 22"); Storage (Armoire, Makeup vanity with mirror and stool); Benches (Bed-end bench 48, 60 storage).
- Kids room: Bunk bed twin over twin; Nursery (Crib, Changing table, Nursery glider); Storage (Toy chest); Play (Play kitchen, Kids table and 4 chairs, Rocking horse).
- Dining room: Dining sets (table with chairs: 36 square/4, 60x36/6, 72x40/6, 84x40/8, 96x42/8 trestle, 108x44/10 trestle, round 42/4, 48/4, 60/6, oval 72x42/6); Tables (without chairs: 36 square, 60x36, 72x40, trestle 96x42, round pedestal 48, 60, metal-base 72x36); Chairs (Side, Upholstered, Windsor, Parsons); Stools (Counter stool 24", Bar stool 30"; square, with back, round, round upholstered); Storage (Sideboard 60, 72; China cabinet with hutch 60, 72; Bar cart).
- Office: Desks (Writing 48, Pedestal 60, Executive 72, Desk 60 with hutch, L-shaped 66x60, Standing 60); Chairs (Office task chair); Storage (File cabinet 2 and 4 drawer, Lateral file 36" 2 and 4 drawer); Tables (Conference table 8', 12' with chairs); Equipment (Desktop computer and monitor, Laptop, Printer).
- Bath accessories: Towel bars and rings (18, 24, 30 bars; towel ring; five metal finishes: Matte black, Brushed nickel, Brass, Chrome, Bronze); Paper holders and hooks (toilet paper holder, robe hook); Mirrors and cabinets (Medicine cabinet 16x26, 20x26, 24x30 surface mount; Vanity mirror 24x30, 30x36, 36x36, 48x36, 60x36 in black, brass, nickel frame); Shower doors and rods (Hinged shower door 30, 36; Sliding glass tub door 60; Shower rod and curtain 60); Rugs and hampers (Bath mat 21x34; Laundry hamper); Storage (Over-the-toilet shelf).
- Garage and storage: Shelving (Wire shelving 36x14, 48x18, 48x24, 60x24 x 72); Workshop (Workbench 60, 72, 96 with pegboard; Rolling tool chest 41" red/black/blue); Vehicles and sports (Bicycle, Motorcycle, Kayak 10'); Bins (Trash cart 96 gal, Recycling cart 96 gal).
- Laundry and utility: Laundry (Ironing board, Folding drying rack, Laundry hamper); Shelving (Utility wire shelf 36x14, 48x18).
- Lighting and fans: Ceiling fans (42" 4-blade, 44" 5, 52" 5, 60" 3, 72" 6, with light, in matte black, brushed nickel, bronze, white; 52" no light); Chandeliers (Candle 6-arm, Candle 8-arm, Drum, Linear 40", Lantern); Pendants (Globe, Cone, Lantern, Drum); Flush mounts (11", 13", 16"); Lamps (Floor lamp drum shade, Arc, Tripod, Torchiere; Table lamp 26" in blue, white, green, amber); Sconces and vanity lights (Wall sconce; Vanity light 2, 3, 4 lights).
- Decor and window treatments: Rugs (5'x3', 8'x5', 10'x8', 12'x9', 8'x2.5' runner; round 5', 6', 8'; cream, gray, navy, rust, sage); Curtains and blinds (Curtain panels and rod for 36, 48, 60, 72, 96 windows; Horizontal blinds 24, 30, 36, 48, 60 x 60); Wall art (16x20 matted, 24x36, 36x48, canvas 48x60, panoramic 60x24; Coastal, Warm abstract, Botanical, Modern palettes); Mirrors (Wall mirror 30x40, Round 30, Round 36, Arched 24x40, Floor mirror 24x66; gold, black, wood frame); Accents (Wall clock 24"; Floating shelf 36" single or x3; Floor vase 24"; Vase with flowers 14").
- Indoor plants: Fiddle-leaf fig (6' and 5'), Olive tree, Ficus, Areca palm, Kentia palm, Bird of paradise, Monstera, Snake plant, ZZ plant, Pothos hanging, Boston fern hanging, Peace lily, Orchid, Succulent bowl, Herb pot, Rubber plant, Cactus; each in terracotta, white or black pot.
- Outdoor living: Patio dining (48 round/4, 60 round/6, 72x40/6, Bistro set; black or teak); Patio seating (Outdoor sofa 80", Outdoor lounge chair, Chaise lounger, Adirondack chair, Porch swing 60", Hammock with stand, Garden bench 60" with or without back); Shade (Patio umbrella 8', 9', 11'; Pergola 10x10, 12x10, 12x12, 16x12); Cooking (Gas grill 3 and 5 burner; Outdoor kitchen island 8', 10', 12'); Fire features (Fire pit 36, 48 round, 42 square, Fire table 48); Spa (Hot tub 7'x7', 8'x8'); Planters and water (Planter boxes, Tiered fountain, Birdbath).
- Games and fitness: Pool table 7', 8' (allow 5' cue room each side; the plan symbol shows the cue zone); Table tennis table; Card table 36" with 4 chairs; Treadmill; Exercise bike; Weight bench with rack.
- Electronics: TVs 43, 50, 55, 65, 75, 85 on stand and wall mounted; Soundbar 36"; Tower speaker 36, 42.
- People and pets: Man 5'10", Woman 5'5", Man 6', Woman 5'4", Child 4', Person in wheelchair (30" x 48" clear space); Large dog, Small dog, Cat.

**Landscaping**: every plant species in the site tools, grouped Shade trees, Ornamental trees, Evergreen trees and screens, Palms, Shrubs, Ornamental grasses, Groundcovers, Perennials and color.

**Playground**: every piece from the playground catalog grouped "GameTime: Play structures / Swings / Slides / Climbers / Spinners / Rockers and spring riders / Freestanding play / Musical and sensory / Inclusive play / Fitness / Shade / Site furnishings / Other", plus **Safety surfacing** (engineered wood fiber, wood chips, wood mulch, shredded rubber mulch and the other surfaces; "(accessible)" marks surfaces that meet accessibility).

### Finish and color pickers in room panels

Selecting a room shows **Finishes and colors**: Ceiling (the ceiling list), Ceiling height (or, for a vaulted ceiling, "Flat at (collar ties)"), Walls (wall finish list), Wall color, the **Tile and wainscot** group (section 3), Ceiling color, Floor color (default follows the floor finish), and the "Trim in this room" overrides.

### The item editor (Customize…)

Click **Customize…** on any door, window, cabinet, appliance, fixture or furniture item. A dialog titled with the item name opens ("Change anything, then place it. Save it to My items to reuse it in any project.").

Left side, by item kind:

- **Door**: Picture (Front/Back). Door type (the seven types; changing type picks a matching style). Door style grid with a picture of each style allowed for that type (sliders: full-lite, French, 6-lite, plank, flush; bifold: 6-panel, 2-panel, shaker, 5-panel, louvered, flush, full-lite, plank; barn: plank, shaker, 5-panel, full-lite, flush; overhead: Raised panel, Panels with window row, Carriage house; swing/double/pocket: all non-garage styles). Slab: Hollow-core molded, Solid-core molded, Solid wood, Solid MDF, Fiberglass, Steel, Aluminum and glass. Thickness: 1-3/8", 1-3/4", 2-1/4". Glass (shown for glass styles, sliders, or when sidelites/transom are on): Clear, Low-E tempered, Frosted (privacy), Rain glass, Reeded, Decorative leaded. Sidelites (exterior or 48"+ swing doors): None / One, latch side / Both sides, with Sidelite width (default 12). Transom: None / Glass transom above, with Transom height (default 14); a note gives the slab size when the opening is a whole unit. Threshold: None (interior), Standard sill about 1", Low profile 1/2" max (ADA), Saddle. "20-minute fire rated" checkbox (a note explains the IRC R302.5.1 garage-to-house requirement when it applies). Door color. **Hardware**: Handle (Lever, Knob, Handleset with thumb latch, Pull handle, Flush pull (pocket door), Barn door pull, Push bar (exit device), No hardware); Function (Passage, Privacy, Keyed entry, Dummy, Storeroom); Rose (Round, Square modern, Long backplate traditional); Lever shape (Straight, Curved, Round tube); Brand (Any brand, Kwikset, Schlage, Baldwin, Emtek, Weiser, Defiant, Yale, Delaney, Nostalgic Warehouse); Deadbolt; finish swatches (Satin nickel, Matte black, Oil-rubbed bronze, Aged bronze, Polished chrome, Stainless steel, Satin brass, Polished brass, Antique brass, White); Hinges per leaf 2/3/4; Hinge size 3-1/2", 4", 4-1/2" (heavy); Hinge corners 5/8" radius, 1/4" radius, Square; Door stop (Baseboard, Hinge-pin, Floor, Wall bumper, None); Self-closing; Kick plate; Peephole viewer. A warning appears for knobs when accessible design is on ("ADA 309.4 calls for levers or pulls"). "Reset to the usual hardware for this door" clears overrides. (On a placed door the same editor also shows **Handing** with four pictured choices and residential/ANSI names.)
- **Window**: Picture; Opens as (Double-hung, Single-hung, Casement, Slider, Awning, Hopper, Fixed); Grilles (No grilles, Colonial grid 6 over 6, Prairie border lites, Craftsman 3 over 1, Diamond upper sash); Hinged on (casements: left/right seen from outside); Frame (Vinyl, Wood, Aluminum-clad wood, Fiberglass, Composite (Fibrex), Aluminum); Glass (Double pane low-E, Triple pane low-E, Tempered low-E, Obscure (bath), Laminated (impact)); Sill height; Frame color. (A placed window also offers Screen: Half, Full, None; Lock and crank finish; Outside color on exterior walls.)
- **Fixture, appliance, furniture**: Picture with hand choice where it applies; a cabinet shows the full cabinet panel (layout, style, countertop); anything else shows a Color picker.

Right side: **Size** (fixtures: Width, Depth, Height, Off the floor; doors/windows: Width, Height), **Name**, then **Place** / **Place on a wall** (places a temporary customized copy), **Save to My items** (or **Save changes** when editing a My items entry), **Remove from My items**, **Cancel**.

### My items

- Saved items appear in the **My items** category (first chip), grouped by their original category (fixtures) or as Doors / Windows. They carry every option you set (size, style, hardware, color, cabinet layout).
- My items are stored in this computer's browser storage and are available in every project on this computer. The same storage limit applies as for blocks; a failure shows "Could not save on this computer."
- **Edit…** on a My items row reopens the editor; **Save changes** overwrites it; **Remove from My items** deletes it.
- Placing a My items entry copies all of its settings onto the new object.
- There is no separate export for My items (Blocks have export/import; see below).

### Blocks (Edit › Blocks)

A block is a saved group of walls, doors, cabinets, fixtures, drafting or site items that you can drop into this or any other project.

- Select items in the plan (Shift-drag a box), open **Edit › Blocks…** (or **Edit › Save selection as block…**, enabled when something is selected), type a name and click **Save selection as block**. Openings in selected walls come along; the block is stored centered on the selection.
- **Accessible bath templates** are built in: "Bath 9'-4" x 7'-2", roll-in shower", "Bath 9'-4" x 7'-2", tub with grab bars", "Half bath 7' x 7'" (walls, a 36" door, fixtures and grab bars to the 2010 ADA Standards: toilet 18" to centerline, 60" turning space, 34" lavatory).
- **Your blocks** lists each saved block with its item count and door/window count; **Place** starts the Block tool, **✕** deletes.
- Block tool: "click to place a copy (its center goes where you click). Keep clicking to place more; Esc when done." The tool is also in the drafting tool group.
- **Export blocks…** saves all blocks as "Remodel Studio blocks.json"; **Import blocks…** reads such a file and adds its blocks to the list.
- Blocks are kept in this computer's browser storage.

### Appliance catalog (brand models)

- 67 real models with published sizes, cut-outs and clearances, gathered October 2026 from manufacturer and retailer spec pages. Brands: GE (15), Whirlpool (10), Thermador (7), GE Profile (6), Samsung (5), Bosch (4), LG (3), Frigidaire (3), Frigidaire Gallery (3), Zephyr (2), Sharp (2), KitchenAid (2), Cafe (2), Broan-NuTone (2), Maytag (1). By type: refrigerators 14, ranges 12, wall ovens 8, cooktops 7, microwaves 7, range hoods 6, dishwashers 6, washers 4, dryers 2, stacked washer/dryer 1.
- Each appears under Appliances as "Brand Model: description" (for example "Whirlpool WFES3330RS: 30" freestanding electric range") with the model number as its code. Its footprint on the plan comes from the published size: ranges take the larger of the width and the cut-out width; cooktops take a base cabinet rounded up to a 3" stock width; wall ovens a tall cabinet 3" wider than the cut-out; over-the-range microwaves a 30 x 15 x 17 box at 66"; microwave drawers a base; range hoods a wall item at 66" (chimney hoods up to 36" high); dishwashers the cut-out width; refrigerators their real size (15" beverage coolers become under-counter units); washers and dryers their real size.
- With a brand appliance selected, the panel adds a block headed "Brand Model" with: Size (W x H x D), Cut-out (W x H x D) and its note, Above cooking surface clearance and note, Airflow (CFM), Electrical, Fuel, List price, notes, and a **Spec page** link ("confirm with the current install guide before cutting cabinets").
- Checks run automatically: "opening too narrow" (error) when the gap between neighboring floor cabinets is smaller than the cut-out (refrigerators: width + 1/4" + side clearance each side); "gap beside it" (warning) when the opening is more than 0.6" wider than the cut-out ("Close it with a filler"); "cabinet too close above" (warning) when a wall cabinet over a range or cooktop is lower than the published clearance; "makeup air" (tip) for hoods over 400 CFM (IRC M1503.6).
- List prices from the catalog feed the estimate's Appliances pricing.
- The catalog also exists as a JSON file (appliances.json: `{"generated": "...", "models": [ {brand, model, type, subtype, label, w, h, d, cutout:{w,h,d,note}, clear:{above,side,back,note}, fuel, elec, price, url, price_note, sources[], notes} ]}`); the program's copy is built from it.

---

## 2. Vendors

### Where vendor choices live

- **Cost › Selections and orders** — the top half is **Selections** (brands and products for the job); the bottom half is the orders tracker. Header: "Pick the brands and products for this job. They go on the materials list, the schedules and the proposal. N cabinet makers and N product brands are in the library." with an **Import vendor catalog…** button.
- **Cabinet panel › Cabinet maker** (select any cabinet) — brand, line, door style, finish and price book, with an **Import catalog…** button.
- **File › Import › Vendor catalog…** opens the import dialog directly. The Designer assistant also lists "Import vendor catalog".

### Selections page, section by section

1. **Door hardware, whole house**: Finish (Satin nickel default; Matte black, Oil-rubbed bronze, Aged bronze, Polished chrome, Stainless steel, Satin brass, Polished brass, Antique brass, White) and Brand (Any brand, Kwikset, Schlage, Baldwin, Emtek, Weiser, Defiant, Yale, Delaney, Nostalgic Warehouse). "Every door uses these unless you change it in the door's own panel. Hinges, stops and kick plates follow the finish."
2. **Cabinets**: shows the current maker · line · door · finish ("Generic cabinets." if none) and points to the cabinet panel's Kitchen style section.
3. One section per product category, each with **Brand** (Not chosen + brands; "(confirm with dealer)" marks entries not re-checked against the maker's current catalog), then **Product line** (Series / Lines / Collections / Product for appliances / Color for countertops), then **Color** where the line or brand lists colors. A note shows the line's frame, material or notes, and catalog links. Windows show the ENERGY STAR 7.0 Southern-zone targets (U-factor ≤ 0.32, SHGC ≤ 0.23; "Forest, MS is in the ENERGY STAR Southern zone").
4. **Paint colors**: Paint brand, then a per-room table (Wall color; Trim and ceiling) and a swatch strip of the brand's colors (first 48). Picking a color writes its hex to the room's wall color (or ceiling color) so the 3D view updates. "Screen colors are close, not exact; check a physical sample."

Selected brands are stamped onto the Builder's list rows ("Selected: Andersen 400 Series White") for roofing, siding, flooring, countertops, windows, exterior doors, interior doors; the cabinet rows carry the maker label.

### Built-in vendor list

**Cabinet makers** (5, compiled October 2026):

| Maker | Tier | Made by | Sold at | Lines (frame) | Door styles | Finishes |
|---|---|---|---|---|---|---|
| KraftMaid | semi-custom | Cabinetworks Group | dealers, Home Depot, Lowe's | KraftMaid (framed, half/full overlay); KraftMaid Vantage (framed); KraftMaid 200 Professional Series (framed); KraftMaid 400 Designer Series (framed); KraftMaid 600 Luxury Series (framed, frameless, inset); plus "KraftMaid (Lowe's)" from the spec book | 209 (+29 from the Lowe's book) | 53 paint/stain/specialty (+56 from the book) |
| Merillat (incl. Masterpiece) | stock (Basics, Classic) / semi-custom (Autograph, Masterpiece) | Cabinetworks Group | dealers, lumberyards/builder channel | Merillat Basics; Merillat Classic; Merillat Autograph; Masterpiece (all framed) | 70 | 42 |
| Diamond | semi-custom | MasterBrand | dealers, Lowe's | Diamond Vibe; Diamond Distinction; Diamond Edge (framed); Diamond Full Access (frameless) | 44 | 42 |
| Schrock | semi-custom | MasterBrand | dealers | Schrock Entra; Trademark; Boutique (framed); Schrock Full Access (frameless) | 43 | 23 |
| Mid Continent | semi-custom (builder-focused) | MasterBrand | dealers, builders | Mid Continent Signature (framed); Mid Continent Pivot (frameless) | 34 | 38 |

Door constructions recognized: shaker, slim shaker, raised, cathedral, arch, mitered, flat/slab, inset, beadboard, louver, glass-ready, other.

**Product brands** by Selections category:

| Category | Brands and lines |
|---|---|
| Windows | Andersen (100 Series, 200 Series, 400 Series, A-Series, E-Series, Andersen Aluminum); Pella (250 Series, Encompass, Lifestyle Series, Impervia, Reserve Traditional, Reserve Contemporary, Vista Series); Marvin (Ultimate, Elevate, Essential, Modern, Vivid); JELD-WEN (Premium Vinyl V-4500, Builders Vinyl V-2500, Premium Atlantic Vinyl, DF Hybrid Vinyl, Brickmould Vinyl, Flat Casing Vinyl, Siteline Clad-Wood, EpicVue Clad-Wood, W-2500, W-5500, Custom Wood, Auraline Composite, Builders Atlantic Aluminum); Simonton (5500, ComfortSmart, 5050, HarborLight, StormBreaker Plus, 6150, 6200, 6550, Brickmould 300, Brickmould 600, Contractor, DaylightMax, Madeira, Premium, Pro); Ply Gem (1100, 1500, 3700, 4700, 4800, 5000, Classic, MIRA aluminum-clad, East Premium/Pro/2000/5100, West Pro 200/700, West 400) |
| Exterior doors | Therma-Tru (Classic-Craft, Fiber-Classic, Smooth-Star, Pulse, Profiles and Traditions, Benchmark, Veris); Masonite (Belleville Smooth, Belleville Mahogany Textured, Belleville Oak Textured, Heritage Series Winslow, VistaGrande, Masonite HD Steel, Sta-Tru HD Steel, Utility Steel, Performance Door System Plus+); JELD-WEN (Custom Wood, Authentic Wood, Aurora Custom Fiberglass, Architectural Fiberglass, Design-Pro, Smooth-Pro, FiberLast, Steel); Pella (clad wood with glass, solid clad wood, solid fiberglass, fiberglass with glass, solid steel, aluminum-clad wood) |
| Interior doors | Masonite (Logan, Lincoln Park, Livingston, Riverside, Cheyenne, Winslow, Berkley, Melrose Flush, 2 Panel Roman, 2 Panel Arch-Top, 2 Panel Square, 4 Panel, 6 Panel, Flush); JELD-WEN (Birkdale, Caiman, Camden, Carrara, Colonist, Conmore, Craftsman III, Madison, Monroe, Rockport, Santa Fe) |
| Roofing | GAF (Timberline HDZ, UHDZ, NS, Camelot II, Grand Sequoia, Slateline, Royal Sovereign); Owens Corning (TruDefinition Duration, Oakridge, Duration Designer, Duration FLEX, Duration STORM, Supreme); CertainTeed (Landmark, Landmark Pro, Landmark Premium, XT 25, Presidential Shake, Grand Manor); Atlas (Pinnacle Pristine, StormMaster Shake, ProLAM, Briarwood Pro, Pinnacle Sun, Pinnacle Impact, Castlebrook); IKO (Dynasty, Cambridge, Cambridge Cool Colors, Nordic, Dynasty Cool Plus, Royal Estate, Crowne Slate, Armourshake, Marathon); TAMKO (Heritage, Titan XT, StormFighter FLEX, HailGuard, Elite Glass-Seal) |
| Siding | James Hardie (HardiePlank, HardiePanel, HardieShingle, HardieTrim; 13 colors); LP SmartSide (Lap, Nickel Gap, Shake Lap, Panel & Vertical, Trim & Fascia, Soffit; 16 colors); Ply Gem / Mastic / Variform; Royal; CertainTeed vinyl |
| Flooring (unverified) | LifeProof (Sterling Oak, Seasoned Wood); Pergo (Outlast+); COREtec (Plus, Pro Plus); Shaw (Floorte); Mohawk (RevWood); Armstrong (vinyl, LVT) |
| Countertops (unverified) | Silestone, Caesarstone, Cambria, MSI Q Quartz, Formica, Wilsonart, each with a short color list (Calacatta Gold, Calacatta Nuvo, Brittanicca, Calacatta Laza, etc.) |
| Plumbing fixtures (unverified) | Kohler (Cimarron, Highline, Wellworth, Santa Rosa, Memoirs); Moen (Arbor, Align, Brantford, Adler, Genta); Delta (Trinsic, Cassidy, Leland, Essa, Windemere); American Standard (Cadet, Champion, Studio); Gerber (Viper, Maxwell); Pfister (Pasadena, Ladera) |
| Appliances (unverified) | GE, GE Profile, Café, Whirlpool, KitchenAid, Frigidaire, Frigidaire Gallery, LG, Samsung, Bosch, Maytag — each with product types: range 30"/36", cooktop 30"/36", wall oven 27"/30", dishwasher 18"/24", refrigerator 30"/33"/36", over-the-range microwave 30", range hood 30"/36" |
| Paint | Sherwin-Williams (41 colors with SW codes, hex and LRV); Benjamin Moore (43 colors with codes); Behr (41 colors with codes) |

### Choosing a cabinet vendor, line, door and finish

In any cabinet's panel, **Cabinet maker**:

- **Brand**: Generic (no brand) or a maker (with its tier). Choosing a brand selects its first line.
- **Line**: the brand's lines with frame type.
- **Door style**: doors available in that line (with construction kind). Choosing a door sets the 3D door style from its construction (slab → flat, raised/cathedral/arch/mitered → raised panel, inset → inset, beadboard, louver, otherwise shaker).
- **Finish**: the brand's finishes with type (paint/stain). The finish name sets the screen color by its words (whites, linens, greiges, grays, greens, blues, blacks, espresso/walnut browns, cherry/cognac reds, honey/caramel ambers, natural/maple, oak/hickory/driftwood), unless you set a custom color.
- **Price book**: "Planning prices" or any imported price book (shows the SKU count). The line's frame (framed/frameless) is also applied.
- A note shows "Made by …; sold at …", the line's overlay and notes, the door material, catalog links, and an **Open <file>** button for a catalog file you imported.

### File › Import › Vendor catalog… (the import dialog)

"Bring in a manufacturer's catalog or price list as Excel, CSV, PDF or JSON. Door styles, finishes, lines and colors join the brand lists; SKUs with prices go into a price book that prices the cabinets you draw. Catalogs stay on this computer and show up in every project."

**Fields**
- **What is it?** — Cabinet catalog (lines, door styles, finishes, SKUs); Cabinet price list (SKUs and prices only); Windows catalog; Exterior doors catalog; Interior doors catalog; Roofing catalog; Siding catalog; Flooring catalog; Countertops catalog; Plumbing fixtures catalog; Appliances catalog; Paint colors (name, code, hex).
- **Brand name** — filled from the file name (with "price list", "price book", "catalog" and years removed); edit it.
- **Choose catalog file…** — accepted: `.csv`, `.tsv`, `.txt` (comma- or tab-separated), `.xlsx`, `.xls`, `.xlsm`, `.ods`, `.pdf`, `.json`.
- **Download a template** — saves a starter CSV for the chosen type.
- **Sheet** (spreadsheets with several sheets) and **Header row** (auto-detected among the first 15 rows by best column match; change it if wrong).
- **Match the columns** — one drop-down per field, pre-guessed from the header words; "(not in this file)" leaves a field out. A live count shows what was found ("3 lines · 12 door styles · 8 finishes · 140 priced SKUs found in 160 rows") and a preview table shows the first 8 rows.
- **Add to library**, **Done**.
- **Your imported catalogs** — each imported cabinet brand (door and finish counts, "priced" if it has a book) and product brand, with **Open file** (reopens the original file, which is kept on this computer) and **✕** to remove.

**Columns by catalog type** (header words that are recognized automatically; matching is case-insensitive, exact word first, then contains):

| Type | Field | Recognized header words |
|---|---|---|
| Cabinet catalog | Line or series | line, series, collection, product line |
| | Door style | door, style, door style, door name |
| | Door type | door type, construction, panel, kind |
| | Material or species | material, species, wood |
| | Finish or color | finish, color, colour, stain, paint |
| | Finish type | finish type, paint/stain, type of finish |
| | SKU | sku, item #, item, code, model, part |
| | Description | desc, description, name |
| | Cabinet type | cabinet type, category, class, type |
| | Width / Height / Depth | width, w / height, h / depth, d |
| | Price | price, list, cost, msrp, amount, retail |
| Cabinet price list | SKU, Description, Cabinet type, Width, Height, Depth, Price | as above (type: type, category, class) |
| Paint colors | Color name | name, color name, color, colour |
| | Color code | code, number, #, id |
| | Hex color | hex, html, rgb hex, web |
| | LRV | lrv, reflectance |
| Any product catalog | Product line or style | line, series, collection, style, product, model, name |
| | Color | color, colour, finish |
| | Notes | notes, description, desc, material, type, size |
| | SKU | sku, item, model #, part |
| | Price | price, cost, msrp |

**Templates** (what Download a template gives you):

```
Cabinet catalog:
Line,Door style,Door type,Material,Finish,Finish type,SKU,Description,Cabinet type,Width,Height,Depth,Price
Classic,Hampton,Shaker,Maple,Linen White,Paint,B15,Base 1 door,Base,15,34.5,24,289
Classic,Hampton,Shaker,Maple,Espresso,Stain,W3030,Wall 2 door,Wall,30,30,12,325

Cabinet price list:
SKU,Description,Type,Width,Height,Depth,Price
B15,Base 1 door,Base,15,34.5,24,289
SB36,Sink base,Sink,36,34.5,24,412
W3030,Wall 2 door,Wall,30,30,12,325

Paint colors:
Color name,Code,Hex,LRV
Agreeable Gray,SW 7029,#d1cbc1,60

Product catalog:
Product line,Color,Notes,SKU,Price
400 Series Double-Hung,White,Fibrex and wood,TW2846,612
```

**How rows become a catalog**
- Lines: every distinct Line value. Door styles: every distinct Door style, tagged with the lines it appears in, its material, and a construction guessed from the Door type or name (shaker; slab/flat/plain/euro/modern → flat; inset; bead → beadboard; mitered; cathedral/arch; louver; raised; recess → shaker; otherwise other).
- Finishes: every distinct Finish. Type comes from the Finish type column (paint/opaque/solid → paint; stain/glaze/natural/clear → stain); without it, names containing white, gray, grey, graphite, charcoal, slate, blue, navy, green, sage, black, onyx, cream, linen, ivory, alabaster or paint are treated as paint, everything else as stain.
- Price book SKUs: rows with both a SKU and a price. Cabinet type from the type column (sink → sink base; wall/upper → wall; tall/pantry/util/oven → tall; vanit → vanity; fill → filler; base/drawer → base) or inferred from the SKU: `SB36`/`SBA36` sink base, `DB18`/`BD18` drawer base, `B36`/`BB`/`BBC`/`BLB`/`BWB` base, `W3030` or `W3030-24` wall (width, height, optional depth), `U248496`/`T`/`P`/`PC`/`OC` + width/depth/height tall, `V3021`/`VSB` vanity (width, optional depth), `BF3`/`WF3`/`F3` filler. Missing heights default to 34.5 (base, sink, vanity, filler), 30 (wall), 84 (tall); depths 24 (base/sink/tall/filler), 12 (wall), 21 (vanity). Rows without a width are skipped; duplicate SKUs keep the first. A "Type" containing "drawer" sets a 3-drawer layout.
- Cabinet catalogs are stored as a brand named from the Brand field (tier "imported"); its price book is "<Brand> price list". A price-list import makes only the book, named for the brand.
- Paint: rows with a name; hex must be `#rrggbb` (a missing `#` is added; anything else is dropped so the color has no swatch); code and LRV optional.
- Other product catalogs: each distinct Product line becomes a series carrying the colors and the first notes seen with it; with no lines, the colors apply to the brand.

**Excel files** are read sheet by sheet (empty rows dropped). **PDF price books**: text is read page by page (up to 400 pages) and rebuilt into rows; runs of text more than about 14 points apart become separate columns, so tabular pages come through best ("Read the text of the PDF. Tables come through best; check the columns below. The PDF itself is kept so you can open it from the cabinet panel."). The paint PDF sample reads as columns Color name / Code / Hex with rows such as "Harbor Fog, HF 101, #9aa7ad".

**JSON files** use the program's own format and are added as-is after pressing Add to library:

```json
{
  "brands": [
    {
      "id": "kraftmaid", "name": "KraftMaid", "parent": "...", "tier": "semi-custom",
      "soldAt": ["dealers", "Home Depot", "Lowe's"],
      "lines": [{"name": "KraftMaid Vantage", "frame": "framed", "overlay": ["half","full"], "notes": "..."}],
      "doors": [{"name": "Amhurst", "lines": ["KraftMaid","KraftMaid Vantage"], "kind": "shaker", "material": "", "notes": "Full Overlay; ..."}],
      "finishes": [{"name": "Dove White", "type": "paint", "code": "..."}],
      "url": ["https://..."], "sources": ["https://..."]
    }
  ],
  "windows":   [{"brand": "Andersen", "series": [{"name": "400 Series", "frame": "...", "ops": ["double-hung","casement"], "notes": "..."}], "url": "..."}],
  "extDoors":  [{"brand": "...", "series": [...]}],
  "intDoors":  [{"brand": "...", "series": [...]}],
  "roofing":   [{"brand": "...", "series": [...] }],
  "siding":    [{"brand": "...", "series": [...], "colors": ["Arctic White", "..."]}],
  "flooring":  [...], "countertops": [...], "plumbing": [...], "appliances": [...],
  "paint":     [{"brand": "Sherwin-Williams", "colors": [{"name": "Agreeable Gray", "code": "SW 7029", "hex": "#d1cbc1", "lrv": 60.4}]}]
}
```

A bare array of cabinet brands also works. Each cabinet brand needs `name` and `doors` or `lines`; an `id` is made from the name if missing. Product categories use the keys windows, extDoors, intDoors, roofing, siding, flooring, countertops, plumbing, appliances, paint; each entry needs a `brand`. Sub-list keys per category: windows/extDoors/intDoors use `series`, roofing/siding/flooring use `lines` (series also accepted), countertops use `colors`, plumbing `collections`, appliances `types`; entries can be plain strings or `{name, colors[], notes, frame, material, type, unv}`. A door's `kind` uses the construction names above; a finish `type` is paint or stain. On load the dialog reports "Found N cabinet brands and N product brands in the file. Press Add to library."

**After import**
- "Added <Brand>: 3 lines, 12 door styles, 8 finishes, 140 priced SKUs. It is in the brand lists now, and its SKUs are in the Library and price the cabinets."
- Imported cabinet brands appear in the **Cabinet maker › Brand** list and the Selections cabinet note; imported product brands in their Selections section; paint brands in Selections › Paint colors. A brand with the same id/name as a built-in or earlier import replaces it.
- Price-book SKUs appear in the Library under **Cabinets › "<Book>: Base / Sink bases / Wall / Tall / Vanities / Fillers"**, labelled "SKU · description · $price". Placing one creates a cabinet carrying that SKU, price and book; any cabinet whose generated SKU matches a book entry (case- and space-insensitive) is priced from the chosen book.
- **Remove**: ✕ in "Your imported catalogs" removes the brand and, for a cabinet brand, its price book; price books alone can be removed in Library › Cabinets › Manufacturer price books.
- **Update**: import again with the same brand name; it replaces the earlier catalog.
- Storage: catalogs live in this computer's browser storage; an oversize file gives "The catalog is too big to keep on this computer. Split it into smaller files." or "The price list is too big to keep on this computer."

### Manufacturer price books (Library › Cabinets)

A simpler CSV-only path: name the book (e.g. "Wolf Classic 2026"), click **Import CSV…** (.csv or .txt, comma or tab). "Columns it looks for: SKU (required), Description, Type, Width, Height, Depth, Price (required). Sizes are read from SKUs like B36, SB36, DB18, W3030 and U248496 when the columns are missing." Errors: "Could not find a SKU or item column. Name the first column "SKU"." / "Could not find a price column. Name it "Price"." / "No cabinets were recognized. Check that the SKU, width and price columns have values." Success: "Imported N cabinets from <name>. Find them in the Library under Cabinets." Each book is listed with its item count and a remove ✕.

### Store prices (Cost › Estimate › Store prices, or Designer menu "Store prices…")

"Use a price list or cart export from Lowe's, Home Depot, 84 Lumber or your supplier: CSV, Excel or JSON, or paste rows copied from a web page or spreadsheet. Each builder's list item is matched by size and description; you check the matches before they are applied."

- **Store**: type any name; suggestions Lowe's, Home Depot, 84 Lumber, Menards, Local supplier.
- **Choose price list file…**: `.csv`, `.txt`, `.xlsx`, `.xls`, `.json`.
- **Paste rows** (tab-separated or comma-separated, one per line, e.g. `2 in x 4 in x 92-5/8 in Stud	1000574	3.98`), then **Read pasted rows**.
- Header words: SKU — sku, item #, item#, item number, model, model #, store sku, internet #, part, part #, product id, upc; Description — description, desc, product, product name, name, item, title, item description; Price — price, unit price, each, cost, sale price, your price, amount, price each; Unit — uom, unit, unit of measure, um, sold by. Without a header row, the longest text cell is the description and the last money-looking cell the price. JSON: an array or `{"items":[...]}` with `sku`/`model`/`id`, `description`/`name`/`title`, `price`/`cost`, `unit`/`uom`.
- The table lists each builder's-list item with a drop-down of up to six store items scored by word match (shown as a percentage); matches of 55% or better are pre-selected. **Only items without a typed price** hides items you already priced. **Apply checked prices** writes the prices (and the store, SKU, unit and date as the source) to the Builder's list, estimate and shopping list.

### KraftMaid catalog specifics

- The **KraftMaid (Lowe's 2022)** Library category holds every SKU from the KraftMaid (Lowe's) 2022 Specification Book (462 pages; 703 products, 7,158 unique SKUs; 29 door styles; 56 finishes; 149 construction options). "The book prints no prices. Confirm SKUs and options with the dealer before ordering."
- Subcategories follow the book's sections: Wall Cabinets (Wall Cabinets, Wall Corner, Wall End Run, Wall Specialty, Wall Open, Wall Microwave, Wall Hoods, Peninsula Wall and Corner, Wall Fillers, Wall Panels, Wall Shelving, Wall Accessories, Wall Decorative Accents, Valances, LED Lighting); Base Cabinets (Base Cabinets, Base Corner, Base Sink & Appliance, Base Specialty, Base End Run, Base Island, Base Peninsula, Peninsula Base Corner, Base Fillers, Base Panels, Base Accessories, Base Decorative Accents, Countertop & Shelf Supports); Tall Cabinets (Tall Cabinets, Tall Appliance, Tall Fillers, Tall Panels, Tall Accessories, Tall Decorative Accents); Vanity Cabinets (Vanity Cabinets, Vanity Sink, Vanity Tall, Vanity Wall, Fillers, Panels, Accessories, Decorative Accents); Office & Furniture (Office Cabinets, Bookshelves, Wood Tops, Furniture Fillers, Panels & Shelves, Accessories, Decorative Accents); Passport (accessible line: Passport Cabinets, Base Sink & Appliance, Passport Accessories); Panels, Shelving & Trays (Decorative Appliance Panels, Paneling, Roll-Out Trays, Shelf Kits); Molding, Accents & Hardware (Molding, Decorative Accents, Hardware).
- Cabinets (wall, base, tall, vanity, hood, office, filler SKUs with a size) place as cabinets with the real SKU; their label is "Title · W x H x D" and the note gives the book page ("Spec book page 212.") and "Some sizes are standard sizes, not printed on the page." where the book omitted a dimension. Wall cabinets hang at 54" (or so the top is at 90" for short ones); hoods at the height that puts the top at 84" plus 12"; vanity wall cabinets at 48".
- Panels, moldings, hardware, trays and accessories are spec items: **Add to selected cabinet** attaches the SKU to that cabinet (listed in its panel with Remove), **Add to order** adds a loose line; both appear under "Moldings, panels and hardware" on the Cabinet order.
- A placed KraftMaid cabinet shows a **KraftMaid <SKU>** block: Hinge (Automatic / Right (R) / Left (L)) for SKUs the book hands (the order code substitutes R/L, RR/RL or LR/LL as the book does); **Order code** (SKU plus any option codes); **Options on the book's chart for this cabinet** (checkboxes from the book's option-availability chart, e.g. APC All Plywood Construction 20%, CH Change Height 30%, with the upcharge shown); **Accessories**; and **Features from the book**.
- The book's 29 door styles join the KraftMaid brand as "<Name> (Lowe's)" (Bagley, Brenton, Briarwood, Carolton, Cayden, Dakota, Deveron, Durham, Elliot, Fox Ridge, Frederickton, Gentry, Gresham, Hartwell, Hoffman, Jamestown, Jaycey, Kirkland, Malibu, Meredith, Montclair, Parkhurst, Ruxton, Salem, Sonata, Stilton, Tuxbury, Vienna, Merrill) under a "KraftMaid (Lowe's)" line, with their door codes and page; its 56 finishes (32 paints, 21 stains, 2 glazes, 1 other, e.g. Aged Bourbon E75, Canvas G68, Cannon Grey H01) join the finish list with their codes.

### Paint brand color books

- Built in: Sherwin-Williams, Benjamin Moore and Behr (see counts above), each color with name, code and hex (SW colors also LRV).
- Import your own with **What is it? = Paint colors** from a CSV/Excel (columns Color name, Code, Hex, LRV) or a PDF color list laid out in columns, or in JSON (`"paint": [{"brand": "...", "colors": [{"name","code","hex","lrv"}]}]`).
- Apply: Cost › Selections and orders › Paint colors › choose the brand › pick a wall color and a trim/ceiling color per room. Wall choices set the room's wall color; trim/ceiling choices set the ceiling color (the trim color itself is the whole-house trim color set from the Library's Colors). The brand's colors show as swatches; "Default" clears a room back to the generic color.

---

## 3. Cabinets and kitchen/bath design

### Cabinet types and nomenclature

Cabinet types: base, sink base, wall cabinet, tall, island, vanity, filler. Every cabinet gets a stock-style SKU in its panel header and on drawings, schedules and the order:

| Cabinet | SKU pattern | Examples |
|---|---|---|
| Base | B + width; drawer bases DB + width; pull-out trash BWB + width | B36, DB18, BWB18 |
| Sink base | SB + width; open-knee (ADA) SBA + width | SB36, SBA36 |
| Wall | W + width + height, "-24" when 24" deep, "-GD" for glass doors | W3030, W3618-24, W3030-GD |
| Tall | U + width + depth + height; oven cabinet OC + … | U248496, OC309684 |
| Vanity | V + width + depth; vanity drawer base VDB + width | V3021, VDB18 |
| Island | B + width + "-ISL" | B72-ISL |
| Filler | BF + width (base), WF + width + height (wall) | BF3, WF330 |
| Corner and specialty | Blind corner BBC + width + -L/-R; Lazy Susan LS + width; Diagonal wall corner WDC + width + height; Microwave WMC + width + height; Peninsula PEN + width | BBC42-L, LS36, WDC2430, WMC3018, PEN72 |

Single-door cabinets 24" or narrower carry the hinge side (B15L / B15R). The full order SKU adds modification codes (e.g. "B36 ROT2 SC"). You can type your own **SKU** and a **Price override** in the cabinet panel.

Cabinets are **numbered** automatically per level, room by room, clockwise around each room with base cabinets before wall cabinets, so numbers read in order across the elevations ("Cabinet #4 · B36").

### Cabinet panel (select a cabinet)

- Header: Cabinet #n · SKU; **Price** (from the price book, or "(planning price)").
- **Layout** by type: base — Drawer over doors, Full-height doors, 3 drawers, 4 drawers, Open shelves, Pull-out trash; sink base — False front over doors, Full-height doors, Open knee space (ADA); wall — Doors, Glass doors, Open shelves, Lift-up door; tall — Pantry doors (upper and lower), Wall oven opening, Full-height door; vanity — Drawer over doors, Doors, 3 drawers; island — Drawers over doors, 3 drawers; filler — Filler.
- **Hinge side** Left/Right (single-door cabinets up to 24").
- **Finished left end**, **Finished right end**; islands: **12" seating overhang on the back**.
- **SKU**, **Price override**.
- **Cabinet maker** (section 2).
- **Kitchen style (all cabinets)**: Line — Stock (builder grade), Semi-custom (default), Custom (price factors 1, 1.6, 2.6); Door style — Shaker (default), Raised panel, Slab (flat), Beadboard, Inset shaker, Louvered; Finish — Painted white (default), linen, greige, gray, sage, navy, black; Natural maple, Natural oak, Rustic hickory, Cherry, Walnut, Espresso; Custom color; Hardware — Bar pulls (default), Cup pulls and knobs, Knobs, Edge pulls, None (push to open); Hardware finish — Brushed nickel (default), Matte black, Satin brass, Oil-rubbed bronze, Polished chrome; **Crown on uppers** (on by default); **Light rail** (off). **Different style for this one** / **Match the kitchen** set or clear a per-cabinet override.
- **Countertops (all)**: Material — Quartz (default), Granite, Marble, Laminate, Butcher block, Solid surface, Concrete; Color; Edge — Eased (default), Bevel, Full bullnose, Ogee, Mitered 3"; Thickness — 2 cm (3/4"), 3 cm (1-1/4", default), 1-1/2"; Overhang (default 1"); Backsplash — 4" splash (default), 6" splash, Tile to the uppers, None. "Countertops build themselves over base cabinets, sink bases, vanities and dishwashers, with sink cutouts and a backsplash wherever they meet a wall." Islands with seating get a 12" overhang on the back; sink bases get an undermount cutout (up to 33 x 18); counters are grouped by top height (a cabinet can be given its own counter height).
- **Modifications** (20/20-style) with code and planning price at the stock line (multiplied by the line factor): Reduced depth RD $35 (added automatically when a cabinet is shallower than standard); Roll-out tray ROT $95 (quantity 1-6); Tray divider TD $45; Spice or utensil pull-out SPO $140; Waste basket kit (double bin) WBK $150; Cutlery divider CD $40; Peg drawer system PEG $110; Blind corner pull-out BCO $350 (blind corner cabinets); Sink tip-out tray TO $35; Matching interior MI $60 (wall/tall); Under-cabinet light prep ULP $25; Extended stile for scribing XS $30; Glass-ready mullion doors GFD $90; Soft-close upgrade SC $30 (only when soft-close is not standard); Appliance garage AG $260 (low wall cabinets). Finished ends add FEL/FER $45. **Attribute group**: Perimeter, Wall cabinets, Island, Tall cabinets, Vanities.
- **Job attributes (all cabinets)**: Wood or door material — Maple (x1), Oak (0.97), Cherry (1.12), Hickory (1.05), Birch (0.98), Walnut (1.25), Paint-grade MDF doors (0.95); Door overlay — Full (x1), Standard (partial) (0.95), Inset (1.2); Drawer box — Standard, Dovetail hardwood (1.06), Metal box (frameless) (1.04); **Soft-close doors and drawers standard** (on). **Two-tone and attribute groups**: a finish and door style for each zone (Wall cabinets, Island, Tall cabinets, Vanities) or "Same as the kitchen".
- **Moldings and decorative pieces (all)**: Crown profile — Cove crown 2-1/4", Crown 3-1/2" (default), Stacked crown 2-piece 5-1/2", Flat batten 1-1/2"; Toe kick skins (on); Scribe at walls (on); Valance over sink window; Panel-ready dishwasher; Refrigerator end panels; Island legs or posts — None, 2 turned legs (open end), 4 turned legs, 2 square posts, 4 square posts; Island back panel — Flat panel, Beadboard, Raised panels, Shaker panels (match doors, default). Toe kick is 4-1/2". These are counted on the Builder's list and the Cabinet order (crown and light rail in 8' sticks with 15% waste, toe kick skin, scribe molding, dishwasher end panels, refrigerator end panels 1-1/2 x 27 x 96, island back and end panels, corbels every 36" under seating, legs/posts, valance; hardware one pull per door/drawer; hinges and slides counted at no charge).
- **Frame type** follows the vendor line (framed/frameless; default framed).

### Cabinet tools

- **Base cabinet run** and **Wall cabinet run** (interior tool group): click where the run starts against a wall and where it ends; the run fills with stock widths (36" down to 9") and a filler for what is left (wall cabinets 30" high at 54"). The ghost shows the layout before you click.
- **Add fillers** (cabinet panel) / **Fill the cabinet run** (Designer menu): closes gaps between 0.4" and 6" with filler cabinets.
- **Under-cabinet lights for this level** (Designer menu) adds a light under every wall cabinet.
- Corner checks: "Add a filler at the blind corner" (a cabinet butts straight into a blind corner; put a 3" filler and set the pull distance); "Dishwasher is tight to an inside corner" (keep a 3" filler or a cabinet between); "Doors are blocked at the inside corner" (use a blind corner or lazy Susan, or add fillers); "Refrigerator is tight to a wall" (leave 2"-4" or a filler and panel); "Exposed end … is unfinished" (order FEL/FER or an applied panel).

### Tile and wainscot (room panel)

- **Backsplash**: None; 4" splash; Up to the wall cabinets (18" or to the wall cabinet bottom); Full height to the ceiling — runs over continuous runs of base cabinets and ranges against a wall, starting at 36".
- **Tub or shower walls** (surround): None; 60" above the floor; 72"; 84"; 96"; To the ceiling — on the wall edges a tub, shower or roll-in shower sits against.
- **Wainscot**: None; 36"; 42"; 48"; 54"; All walls, floor to ceiling — around the room except at doors and surrounds.
- **Tile**: Subway 3" x 6"; Ceramic 4" x 4"; Porcelain 12" x 24"; Mosaic 1" sheets; Hexagon 2"; Stone 12" x 12"; wainscot can also be Beadboard (wood). **Wainscot material** can differ from the tile. **Tile color**.
- Windows inside a zone are deducted. The note reports square feet; zones show in 3D, on interior elevations (with tile grid and a label) and on the materials list (tile with 10-15% waste, thinset, grout, cement board and waterproofing for wet walls, edge trim; beadboard panels and chair rail cap).

### NKBA kitchen and bath planning guidelines

Turned on in the project panel: **NKBA kitchen and bath planning guidelines** (on by default), **Cooks at once** — One (42" aisles) or Two or more (48" aisles), **Use Access Standard values**. Kitchens and baths are found by room use or by their fixtures. Messages appear in the checks list with the guideline number. Rule texts as the program states them:

| Code | Finding | Text |
|---|---|---|
| K1 Door/entry | Kitchen doorway is narrow | About X clear opening; NKBA recommends at least 32" clear (a 2'-10" door) — 34" (a 3'-0" door) with the Access Standard. |
| K2 Door interference | Door swings into the … opening | An entry door and an appliance door should not run into each other. Move the door, change its swing, or use a pocket door. |
| K3 Work triangle | Work triangle is long | Sink, cooking surface and refrigerator are X ft apart in total; NKBA recommends 26 ft or less. |
| K3 | Work triangle leg short/long | X ft; NKBA recommends 4 to 9 ft for each leg. |
| K3 | Island cuts into the work triangle | A triangle leg crosses the island for X; NKBA allows no more than 12". |
| K4 | Tall cabinet separates two work centers | NKBA recommends no full-height, full-depth tall cabinet between two primary work centers. |
| K5 Work triangle traffic | Traffic path cuts through the work triangle | The straight path between two kitchen doors crosses the work triangle. Rearrange so through-traffic passes outside it. |
| K6 | Work aisle is narrow | X between facing counters or appliances; NKBA recommends 42" for one cook (48" for two). |
| K7 | Walkway is narrow | X from the … to the wall; NKBA recommends a 36" walkway. |
| K8 | Not enough room behind island seating | X from the seating edge to the nearest obstruction; NKBA recommends 32" with no traffic behind, 36" to edge past and 44" to walk past (Access: 36"/60"/60"). |
| K9 | Seating knee space is shallow | X overhang at a Y high counter; NKBA recommends 18" of knee space at 30", 15" at 36", 12" at 42", and 24" of width per seat. |
| K11 | Sink landing area is short | About X on one side and Y on the other; NKBA recommends 24" on one side and 18" on the other. |
| K12 | No 36" prep area next to the sink | The longest counter beside the sink is X; NKBA recommends a continuous 36" wide by 24" deep work area next to it. |
| K13 | Dishwasher is far from the sink | X between them; NKBA recommends the dishwasher edge within 36" of the sink edge. |
| K13 | No standing room beside the open dishwasher | X in front of it; leave 21" of standing space beside the open door. |
| K14 | Second sink needs counter beside it | About X and Y; NKBA recommends 3" on one side and 18" on the other. |
| K15 (tip) | Plan two waste and recycling bins / one more bin | NKBA recommends two waste receptacles: one near the cleanup sink and one for recycling. Use a pull-out trash base or a waste-basket kit. |
| K16 | Refrigerator needs a landing area | Provide 15" of counter on the handle side, or across from the front within 48". |
| K17 | Cooking surface needs landing area | About X and Y; NKBA recommends 12" on one side and 15" on the other. |
| K17 | Island cooktop needs counter behind it | NKBA recommends 9" of countertop behind a cooking surface on an island or peninsula, at the same height. |
| K18 | Cabinet too close above the cooking surface | X to the cabinet above; allow 30" to unprotected combustibles (24" with a listed hood), per the appliance instructions and IRC M1901.1. |
| K19 | No hood over the cooking surface | NKBA recommends a ducted hood of at least 150 cfm. Add a range hood or microwave hood above it. |
| K20 | Cooking surface under a window | NKBA recommends no cooking surface below an operable window: curtains and reaching over burners are fire risks. |
| K20 (tip) | Fire extinguisher | Keep a fire extinguisher near the kitchen exit, 15" to 48" off the floor, away from the cooking surface. |
| K21 | Microwave is mounted high / too low | Bottom at X; NKBA recommends 3" below the main cook's shoulder and no more than 54" off the floor / an under-counter microwave should sit at least 15" off the floor. |
| K23 | Wall oven needs a landing area | NKBA recommends 15" of counter next to the oven, or across from it within 48" (not opening into a walkway). |
| K25 | Not much countertop | About X" of 24"-deep countertop; NKBA recommends at least 158" of frontage. |
| K25 | Wall cabinet is low over the counter | X from the countertop; NKBA recommends 15" of clearance above countertops. |
| K26 (tip) | Round the island corners | NKBA recommends clipped or rounded corners on countertops, especially islands in a walkway. |
| K27 | Storage is short of the NKBA target | About X" of shelf and drawer frontage (estimated); NKBA recommends 1,400" for a small (under 150 SF), 1,700" for a medium (151 to 350 SF), 2,000" for a large (over 350 SF) kitchen. |
| K29 (tip) | Blind corner without a storage device | NKBA recommends at least one corner cabinet with a functional storage device. Add a blind-corner pull-out or use a lazy Susan. |
| K30 | No countertop receptacles | Countertop receptacles need GFCI protection, and no point along a counter wall may be more than 24" from one (IRC E3901.4). Use the Electric tool to add them. |
| K31 | No task lighting under the wall cabinets | NKBA recommends task lighting at every work surface. Add under-cabinet lights. |
| K31 Lighting | Kitchen window area is small | X SF of glass for Y SF of floor; NKBA recommends window area of at least 8% of the floor area (IRC R303.1). |

Bath guidelines:

| Code | Finding | Text |
|---|---|---|
| B-door | Bathroom doorway is narrow | About X clear; NKBA recommends at least 32" clear (34" Access). |
| B-door | Door swings into a fixture | NKBA recommends that no entry door interfere with a fixture or its clear floor space. Swing the door out, or use a pocket door. |
| B-clear | Clear floor space in front of the … | X in front; NKBA recommends 30" (code minimum 21", showers 24"). |
| B-wc | Toilet is close to a side wall or fixture | X from the toilet centerline; NKBA recommends 18" (code minimum 15"). |
| B-wc | Toilet compartment is small | X x Y; NKBA recommends 36" x 66" (code minimum 30" x 60"). |
| B-lav | Sink is close to a side wall | X from the sink centerline to the nearest wall or tall object; NKBA recommends 20" (code minimum 15"). |
| B-lav2 | Double sinks / two sinks are close together | X between bowl centers; NKBA recommends 36" (code minimum 30"). |
| B-lav (tip) | Vanity height | Counter at X; NKBA suggests 32" to 43", about 3" below the user's elbow. |
| B-shower | Shower is small | X x Y inside; NKBA recommends at least 36" x 36" (code minimum 30" x 30", 900 sq in). |
| B-backing (tip) | Block the walls for grab bars | Install solid blocking at the toilet, tub and shower walls now, so grab bars can be added later (NKBA; ICC A117.1 604/607/608). |
| B-valve (tip) | Shower and tub controls | Place controls 38" to 48" high, offset toward the room, reachable from outside the spray; use pressure-balance or thermostatic valves (IRC P2708.4). |

### NKBA/KCD-style drawings

- Interior elevations draw cabinets with fronts, hinge marks, handles, the number bubble, crown on uppers and an appliance front labelled OVEN; a dimension string runs across the wall cabinets; each cabinet carries its code (B36, W3030…) in blue; centerlines (CL) of sinks, cooking surfaces, hoods, dishwashers, refrigerators, washers, dryers, toilets, lavatories, vanities, tubs and showers are drawn with a centerline dimension row from the wall end. These NKBA graphics standards can be turned off with the drawing-standard setting in My standards.
- The plan overlay shows the cabinet codes on each cabinet and "CL X" dimensions from the nearer wall end for each fixture centerline.
- Sheet **A5.0 Cabinet plan and schedule**: the cabinet area with numbered cabinets, counters, REF/DW/RANGE labels, a schedule table (#, SKU, Type, W x H x D, Style, Price) and notes (manufacturer, style, hardware, countertops, planning total).
- **Countertop shop drawing** (an A5 sheet): each counter piece (C1, C2…) with edge dimensions (W marks wall sides), SINK cutouts with centerline from the end, suggested SEAM lines at inside corners and where a run is longer than a slab, a pieces table (size, SF, cutouts, seams), material, edge, backsplash and slab count notes ("SEAMS SHOWN ARE SUGGESTED; FABRICATOR TO CONFIRM." "VERIFY ALL DIMENSIONS AT TEMPLATE."). Slab sizes by material: quartz 120 x 55, granite 110 x 62, marble 108 x 60, laminate 144 x 25, butcher block 96 x 25.5, solid surface 144 x 30, concrete 96 x 40.

### Change door style and finish (Style swap dialog)

Designer menu › **Change door style and finish…** (also from the assistant). **Change**: Every cabinet in the job; Selected cabinets (when cabinets are selected); One room (pick the room); Perimeter base cabinets; Wall cabinets; Island; Tall cabinets; Vanities. Then Door style, Finish, Wood species, Hardware, Hardware finish (each defaults to "Keep (current)"); for the whole job with a vendor chosen, also the vendor's door and finish. A **Before / After** picture of a sample cabinet and **Cabinets now / After the change** totals with the difference and percentage (planning prices or the dealer price book). "Job-wide changes also clear the same choices set on single cabinets and zones." **Apply** (Undo puts them back).

### Countertop slab layout dialog

Designer menu › **Countertop slab layout…**. Counters are cut at their seams into pieces (pieces longer than a slab are split again) and laid on slabs. **Slab size** (defaults from the material, see above); **Slab photo…** (a photo of the real slab shows under the pieces; Remove photo); **Auto-layout** (longest pieces first, grain along the slab). Drag a piece to match the veining; double-click to turn it 90°; the line on each piece is the grain direction. Pieces that overlap or run off the slab show red; "N pieces are longer than a slab: add a seam on the countertop shop drawing." Stats: slabs used (size and material), countertop square feet, piece count and yield %. The layout saves with the project and prints as sheet **A5.4 Countertop slab layout** (slabs with numbered pieces, a pieces list, slab count and yield).

### Lighting plan and schedule

Systems › Lighting tab: **Light color and marks** — fixture types get marks (A, B, C…) by type, lumens, color temperature and dimmable; **Set every light to** 2200 K (candlelight), 2700 K (warm white), 3000 K (soft white), 3500 K (neutral), 4000 K (cool white), 5000 K (daylight) › Apply; **Open the lighting schedule** (Documents › Schedules › Lighting, editable, with CSV columns Mark, Fixture, Qty, Lumens, Kelvin, Watts (LED est.), Dimmable, Switches, Rooms). **Switch groups** lists each switch (S1, S2…) with its type, room, linked light marks, estimated LED watts and "dimmer" ("Electrical › Link switches ties lights to the nearest switch"). The 3D view tints room light by the average color temperature of the lights in it.

### Cabinet order (Cost › Cabinet order)

"Grouped by manufacturer, with modifications under each cabinet, the way a 20/20 order report reads. List prices come from your price books where loaded, otherwise planning prices." Settings: Dealer multiplier (0.45), Margin % (35), Freight % of net (3), Install $ per box (85), Sales tax % (7). For each manufacturer a table (#, Qty, SKU, Description with size and style/finish and price book, Hinge, List) with modification rows beneath; then **Moldings, panels and hardware** (qty, code, item, list); totals: List total, Net (x multiplier), Sell at margin, Freight, Installation (boxes x rate), Tax, Total. **CSV** and **PDF** buttons export the report ("Planning prices. List prices come from your price books where loaded; confirm with the manufacturer or dealer before ordering."). KraftMaid accessories added from the spec book appear as loose items.

### Hardware whole-house finish

Set under Cost › Selections and orders › Door hardware, whole house (Finish and Brand). Every door's hardware, hinges, stops and kick plates follow it until overridden in the door's own Hardware section; window lock and crank finishes use the same finish list. Cabinet hardware finish is separate (Kitchen style › Hardware finish).

---

## 4. The Measure workflow

Open with the **Measure** mode ("Photos and measurements"; "Photos, tape measurements, scans, underlays and field notes") or **File › Import › Photos and scans…**. The page is headed **Capture**: "Turn photos and tape measurements into the model. Photos and scans are kept in this browser only; the project file stores where they are pinned." Tabs: **Photos**, **Measure from photos**, **Photo assistant**, **Scans and plan images**, **Make walls**, **Field notes**. If the browser blocks storage: "This browser is not letting the app store photos (private window or storage turned off)."

### Photos

- **Add photos…** (several at once; photos are reduced to 2000 px and stored in this browser). New photos are pinned to the item selected in the plan ("Tip: select a room or wall in the plan first to pin new photos to it").
- Gallery of photos, newest first, each with its pin label (room name, "exterior wall, 24'", a door/window mark, or "Not pinned" / "Pinned to a deleted item"), date, a **Note** field, **Pin to selection** and **Delete**.
- Pinned photos also show in the selected item's panel under **Photos**.

### Measure from photos

Add or pick a photo (thumbnails; "scaled" pill once a scale is set). Modes above the photo: **1 · Set scale**, **2 · Measure**, **Pick color**, **Trim and finishes**, **Move**. Scroll to zoom, right-drag or Alt-drag to move, drag any dot to fine-tune; a magnifier shows where a click lands; a note reports the precision at the pointer ("2 pixels is about 1/8" on the scaled surface").

- **Set the scale** — **Known rectangle (best)**: click the four corners of a flat rectangle of known size in order top-left, top-right, bottom-right, bottom-left; this corrects the camera angle so everything on that same flat wall measures true. Pick a **Known size** preset (Standard door 36" x 80"; Door 32" x 80"; Door 30" x 80"; Garage door 16' x 7'; Plywood sheet 48" x 96"; Brick, 3 courses (8" tall) x 8" long; 8x16 concrete block 15-5/8 x 7-5/8; Outlet cover plate 2-3/4" x 4-1/2"; Letter paper 8-1/2" x 11"; Tape or stick laid flat 24" x 1") or type Width and Height (default 36 x 80). **Known length**: click both ends of something of known length (default 36"); best when the surface faces the camera straight on. Points status, **Clear scale**, **Next: measure**.
- **Measure** — click two points; the length appears on the photo. Each measurement has a name, a value, **Use for…** and delete. Use for… writes the value (rounded to 1/4") to the selected plan item: wall — Wall length, Wall height; door/window — width, height, sill (windows); fixture — Width, Depth, Height; always — Match baseboard by height, Match casing by width, Match crown by height (picks the closest trim profile and applies it to the selected room or the whole house: "Closest match: Colonial baseboard 3-1/4", used for Kitchen."). "Measure on the same flat surface you scaled from; things closer or farther from the camera measure wrong."
- **Pick color** — click the wall, trim, door or siding; a small patch is averaged. Shows the hex, the closest library color, and the same apply buttons as a Library color (Room walls, Room ceiling, …, All cabinets, All doors), plus **Use the library color instead**. **Correct lighting: click a white object** sets a white point so colors from that photo are corrected ("lighting corrected"); **Clear correction** removes it.
- **Trim and finishes** — inside Claude, **Identify trim and finishes** sends the photo (reduced to 1600 px) to Claude, which matches what it sees to the library: baseboard, casing, crown, chair rail, wainscot, door style and type, window operation and grilles, ceiling, wall finish, floor, siding, roofing, and estimated colors for walls, trim, ceiling, floor, door, siding, roof and cabinets, with a summary, notes (e.g. popcorn ceiling, water stains) and confidence (trim, finishes). Each row has a picture and up to three apply buttons (Whole house / This room only, Selected room / All rooms, etc.). "Each analysis uses your own Claude usage." Outside Claude the mode explains that identification is unavailable and that trim can still be matched by measuring it.
- **Move** — drag to pan, scroll to zoom, **Fit photo**. **Delete photo** removes it.

### Photo assistant

"Pick one to four photos. Claude looks at them, lists the walls, doors and windows it sees, and asks only for the measurements needed to draw them to scale." Choose **A room, from inside** or **A side of the house, from outside** (for a side, select the outside wall in the plan first; openings are added to it). **Choose photos…** (up to 4), **Analyze photos** (**Stop** cancels). The result lists the room name, a summary and notes, then **Measurements needed**: room width (back wall), depth (left wall), ceiling height, and for each door/window its offset from the left corner, width, height and (windows) sill — "Offsets and sills left blank are treated as 0 and 36"." **Add room to plan** builds the room as existing work with the back wall at the top of the plan; **Add openings to wall** adds them to the selected wall. Error texts cover not granted, rate limited, stopped, unreadable photo. Outside Claude: "The photo assistant runs inside Claude only. In this view, use "Room from measurements"."

### Scans and plan images (underlays)

**Image or PDF underlay** — "Trace over a PDF of old plans, a surveyor's plat, a photo of a hand sketch, or a satellite view." **Add image or PDF…** (images are stored at up to 3000 px). For a PDF: pick the **Page** (1 to N) and the **Drawing scale** — "I will calibrate with two points", 1/4" = 1'-0", 3/16" = 1'-0", 1/8" = 1'-0", 3/8" = 1'-0", 1/2" = 1'-0", 1" = 10' (site), 1" = 20' (site), 1" = 30' (site) — then **Place page on the plan** (a printed scale places it at true size; otherwise it is fitted to the drawing). Calibration: click two points on the image, enter the **Distance between the two points**, **Set scale**. Controls: **Opacity** slider (default 0.5), **Width on plan**, **Rotate (degrees)**, **Open plan to trace** (use "Move underlay" in the plan to drag it), **Replace** / **Remove underlay**. One underlay per project, shown under the level it was added on.

**Point cloud scan** — **Import .ply scan…** (PLY from COLMAP, Polycam, 3D Scanner App and others; large clouds are thinned to about 150,000 points). Settings: **Scan units** Meters (default), Feet, Inches, Calibrated; **Up axis** Y up, Y down (COLMAP), Z up; **Rotate** 0-270° in steps; **Slice from floor** (12") and **Slice to** (72") — points between those heights are drawn on the plan as a red slice for tracing, and all points show in 3D. **Rescale scan**: enter a length measured on the plan with the Measure tool and its real length. **Remove scan**. **Download capture kit (.zip)** gives a README and a Python script that runs COLMAP on 40-150 overlapping photos to make cloud.ply (COLMAP 3.9+ with CUDA and Python 3.10+; `--quick` for a sparse cloud).

### Make walls

Three ways:

1. **From tape measurements** (the room wizard): "Measure one room at a time from the inside. Stand facing the wall you call "back"; it goes at the top of the plan. Offsets are from the left inside corner as you face each wall." Fields: Room name, Use, Width (back wall), Depth (left wall), Ceiling height, Status (Existing (as-built) / New construction), Outside walls (back, left, right, behind checkboxes; outside walls are 2x4 exterior 5-1/2", inside walls 2x4 partitions 4-1/2"). **Add door** / **Add window** rows: Wall (Back, Right, Behind, Left), From left corner, Width (36), Height (80 / 48), Sill (36). **Add room to plan** places it to the right of existing walls (or sets the level height on an empty level), selects it and offers **Open the plan**.
2. **From a scan or plan image** — **Find the walls…** opens the dialog "Walls from a scan or plan photo": "Finds straight, square walls in a point-cloud scan or in the plan image under <level>. It works best on square rooms; check the result against your tape." Source: Point-cloud scan or Plan image on this level; Shortest wall (24"); Join gaps under (14"); Interior wall thickness (one face seen) (4-1/2"); Exterior wall thickness (5-1/2"); Mark new walls as Existing/New; **Replace the walls already on <level>**. **Find walls** reports "Found N walls, N doors and N windows. Main direction X°." with a preview (points, walls — exterior dark, interior blue — and openings). From a scan, gaps at both heights become doors (24"-76" wide) and gaps only up high become windows (16"-110"); from a plan image, door-sized gaps (24"-50") in a wall line become doors. **Add N walls** then "Check them against your tape measurements; then use Rooms › Auto rooms."
3. **Trace an outside wall from a photo** — "Stand back and take the photo as straight-on as you can. Pick the wall, then click its four corners on the photo (floor line at the bottom, top plate or soffit line at the top). The photo is straightened to the wall's real size, and you can box the windows and doors on it." Pick the **Wall** (each exterior wall by compass direction and length), **Take or choose photo…** (phone camera allowed) or use a saved photo. Step 1: click bottom left, bottom right, top right, top left (**Start over**). Step 2: on the straightened wall, drag a box over each window and door; choose **Windows**, **Doors** or **Doors if they touch the floor**; yellow dashes show openings already in the model; **Undo last box**; **Add N openings to the model** (as existing, doors swing, windows double-hung; check swing and style in each panel); **See it in 3D**. Needs outside walls drawn first.

### Field notes

- **Drop a pin on the plan**: tap a kind, then tap the plan. Kinds: **Existing condition** (C, orange), **Punch item** (P, blue), **Question** (?, purple), **Photo spot** (●, green). The Field pin tool is also in the drafting tools ("tap where something is: a crack, a soft floor, a leak, a punch item or a question").
- Pin panel: Type; Note; punch items add Status (Open, In progress, Done — done date recorded), Trade (Any trade or a trade from the schedule's trade list), Due date, Assigned to; conditions add Severity (Note, Needs repair, Safety hazard); **Take or add photo** (phone camera; photos are pinned to the spot and show in the panel). Done punch pins turn gray with a check mark. Pins can be hidden with the field "hide pins" setting.
- **Pins and punch list**: filter All / Conditions / Punch: open / Punch: done / Questions (with counts); click a pin to jump to it in the plan; Done checkbox; **CSV** (#, Type, Room, Note, Status, Trade, Assigned, Due, Date); **PDF with photos** ("Field notes and punch list", each pin with its note, trade, assignee, due date and up to three photos).
- **Measuring checklist**: pick a room; the table lists each wall (numbered, with compass direction, inside face to face), ceiling height, and each door/window width, height and sill with the model value; type the field value; differences over 1/2" are flagged ("ok" otherwise); a Measured count and Room notes. "Draw rooms first (or use Room from measurements)."
- Voice notes are not part of the field tools; notes are typed.

### Import a 3D model (File › Import › 3D model (OBJ, GLB, DAE, STL)…)

"Bring in furniture, appliances, play equipment or fixtures as OBJ, GLB/glTF, DAE (Collada) or STL files: from SketchUp (export OBJ or DAE; SketchUp Free exports STL), Blender, 3D Warehouse or a manufacturer's download page. The main color is kept; textures are not." **Model units**: Inches, Feet, Meters, Centimeters, Millimeters. **Up direction**: Y is up (most OBJ files), Z is up (SketchUp, some CAD). **Choose model file…** (.obj, .glb, .gltf, .dae, .stl; a glTF that references separate .bin or texture files must be re-exported as one GLB). Very large models are thinned to about 200,000 triangles. The model is placed at the center of the plan as an "Imported 3D model" fixture, sized from its bounding box (rounded to 1/4"), selected, and reported ("Placed "chair": 24" x 26" x 34", 12,340 triangles. Drag it into place; size and color are in its panel."). A model smaller than 1 x 1 x 1/2 inch is refused with "Check the units." Models are stored in this browser with the project's assets.

### Photo match (Designer menu / assistant: "Photo match")

"Pick a photo of a room, then click its corners on the photo in the order listed (floor and ceiling corners you can see). With six or more, the 3D camera matches the photo and the new design shows over the real room." Choose the **Room**, **Upload a photo…** or pick a saved one. The corner list names each room corner by direction ("Northwest corner, floor", "Northwest corner, ceiling", …); click a name then click it on the photo (the next unplaced corner becomes active; ✕ clears one). Include some ceiling corners (all points on one plane cannot be solved). A **Fit** line gives the average error in pixels ("recheck a corner or two" over 12 px). **Show the design** renders the model from the matched camera; view **Blend** (Design opacity slider), **Design**, **Photo**; **Save as PNG** exports the composite. The photo, room and corner points save with the project.
