# San Francisco Victorian House

An original, interactive Three.js street scene: a Queen Anne-style Painted
Lady on a steep San Francisco hill - stacked bay windows, ornate trim,
bracketed cornice, turned porch columns and a high stoop, flanked by two
Italianate row houses. A Powell & Hyde cable car rolls past on tracks down
the slope, with street lamps, palms, hydrants and the downtown skyline in
the haze.

Everything is procedural: no external models, textures or downloads.

## Controls

- **Orbit** (default): drag to look around, scroll or pinch to zoom.
- **Walk** (desktop): move along the street with WASD or arrow keys.
- **Reset view**: return to the starting camera.

## Run it

Open `index.html` from any static web server (ES modules need HTTP, not
`file://`):

```
npx serve .
# or
python3 -m http.server
```

Then visit the printed local URL. The page is a single fullscreen scene:
`index.html` loads `bundle.js` + `bundle.css`, which inline the vendored
Three.js r170 build. No network requests, works offline once loaded.

## Source

The authored TypeScript source lives in `src/`:

- `scene.ts` - renderer, camera, lights, controls and animation loop
- `street.ts` - hill, tracks, cable car, lamps, backdrop and skyline
- `builders.ts` - the Victorian house and neighbor row houses
- `textures.ts` - procedural canvas textures (siding, glass, asphalt, sky)
- `standalone.ts` - fullscreen entry point (no page framework)
- `vendor/three.module.js` - Three.js r170, MIT licensed (see LICENSE-THREE.md)

Rebuild the bundle after editing:

```
npx esbuild src/standalone.ts --bundle --format=esm --outfile=bundle.js
```
