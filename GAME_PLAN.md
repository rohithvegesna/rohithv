# NIGHT RUN — game plan & checklist

Bar for every V-item: would the screenshot hold up as a Steam trailer
thumbnail? Any console error/warning, or any pose under fps budget, is an
automatic FAIL regardless of features.

## Gameplay
- [x] G1 Vehicle feel (provisional — pending human pass, see LOOP_NOTES iter 010) — raycast vehicle: grippy, forgiving, fun in 5s; chase cam with lag + speed-FOV; handbrake with particle puffs. AC: drive 10s scripted run, no flips on normal steering, avg fps ≥60 desktop tier.
- [x] G2 Pump interaction — highlighted bay; stopping inside prompts Fuel; card reader tap-to-pay animation with approval beep. AC: at_pump pose shows prompt; fueling starts on E.
- [x] G3 Fueling minigame — hold-to-fill, live gallons/$ ticking, release near target for PERFECT STOP. AC: scripted hold+release yields fueled state, objective 1 checked.
- [x] G4 On-foot transition — F exits car, smooth camera handoff to first-person walk; F re-enters near car. AC: on_foot_lot pose walkable; no camera pops (manual review).
- [x] G5 Store + purchase — sliding doors + chime; aisles with fictional labeled products; E picks item; carry chip in HUD. AC: store_aisle pose; pickup works via injected input.
- [x] G6 Checkout + receipt — register tap-to-pay, receipt prints with item, easter eggs, engineered-by footer; objectives complete; free roam + classic nudge. AC: receipt pose shows receipt; 3/3 objectives.

## Visual
- [x] V1 Lighting — night HDRI env, moon key + canopy warm pools, emissive signage, fog, wet-asphalt roughness variation. AC: approach + at_pump screenshots pass the bar.
- [x] V2 Car fidelity — proportions not toy-like, clearcoat paint, dark glass, chrome trim, real wheels, headlight cones. AC: at_pump close shot passes.
- [x] V3 Station exterior — canopy with brand band + glowing sign, believable pumps with screens/readers, price board, props with colliders. AC: approach shot passes.
- [x] V4 Store interior — warm aisles, glowing cooler wall, dense instanced shelves, fictional labels readable. AC: store_aisle shot passes.
- [x] V5 Postprocessing — ACES, selective bloom on emissives, SMAA, vignette; AO on desktop tier. AC: post on/off comparison shows depth without smearing text.

## UX
- [x] U1 Loading/hero screen — SSR'd instantly: name, title, credibility line, Resume/Email/LinkedIn, Classic site, real progress bar; desktop auto-start, mobile Tap to start. AC: first-frame screenshot shows all; no flash of classic.
- [x] U2 HUD — objectives ①②③ with checks, prompts, mute, quality, Classic site always visible; AA contrast. AC: HUD present in every pose shot.
- [x] U3 Mobile controls — joystick + buttons (drive/foot), 390×844 layout holds. AC: mobile pose shots.

## Performance / platform
- [x] P1 Desktop 60fps — every pose ≥55 avg in headless (proxy), draw calls <200. AC: state() dumps.
- [x] P2 Mobile tier — auto tier by device, AO off, ratio 1.5. AC: tier reflected in state().
- [x] P3 Bundle — game chunk+HDRI ≤4MB gz first-playable, ≤10MB total. AC: gzip audit.
- [x] X1 Static-export parity — full harness green against `npx serve out` (HDRI path, WASM, trailingSlash). AC: identical pass on static build ×3 at the end.

## Notes
- Physics fixed timestep 1/60, seeded randomness only — determinism for the harness.
- Reduced-motion/save-data/no-WebGL → classic page directly with a "try the interactive version" link absent (they lose nothing; game never mounts).
- No downloaded meshes shipped (no acceptable CC0 car found; Poly Haven has no vehicles) — car and station are hand-built to the same bar; HDRI is the one downloaded asset. gltf-transform/DRACO pipeline therefore not exercised; revisit if licensed models arrive.
