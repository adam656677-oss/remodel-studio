# Remodel Studio

A personal remodel planning and drafting program: floor plans and 3D, structure, code checks (IRC/IBC 2021, ADA 2010), cabinets and vendor catalogs, materials and estimates, plan sheets, and photoreal rendering inside the app.

## Layout

- `app/` — the program. `src/*.js` are joined in order by `build.py` into one page.
  - `app/render-engine/` — the built-in renderer (three-gpu-pathtracer). Rebuild `rs-render-engine.js` from `engine.js` with esbuild.
  - `app/github/index.html` — the built web version (open it in a browser, or serve it with GitHub Pages).
- `desktop/` — the Windows program (Electron wrapper). `make-installer.sh` builds `Remodel Studio Setup <version>.exe`.
- `tests/` — automated tests (Python + Playwright) and the vendor research data.

## Build

```
cd app && python3 build.py          # writes index.html and github/*.html
cd desktop && ./make-installer.sh   # Windows installer (needs Node, npm and makensis)
```
