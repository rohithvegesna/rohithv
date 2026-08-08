# NIGHT RUN — loop notes (append-only)

Harness: `node scripts/loop-test.mjs [--url http://localhost:3000] [--iter NNN]`
Artifacts: `loop/artifacts/iter-NNN/` (gitignored)

## Iter 001 — boot + G1
Built harness. Desktop poses captured; drive run 118 avg fps. FAIL: Rapier WASM
OOB on teleport (vehicle controller state invalidated); draw stats wrong (autoReset).

## Iter 002 — teleport fix
Recreate vehicle controller per teleport + guarded updateVehicle. Full harness
green both viewports (120 avg fps). FAIL: 8 console issues (hydration warning
from pre-paint boot-gate class; three deprecations).

## Iter 003 (static) — X1
suppressHydrationWarning on <html>. Harness vs `serve out`: PASS — WASM, HDRI,
trailingSlash all fine on static export. 4 deprecation warnings remain.

## Iter 004 (static) — console clean
HDRLoader + PCFShadowMap. consoleIssues: 0. fps 106/120/115. Draws 238.
VERDICT: gameplay chain G2–G6 PASS (state-verified); U1–U3 PASS (shots);
P1 partial (fps ✓, draws 238 > 200 budget); V1–V5 NOT PASSED — car wheels
render inside the body (V2 automatic fail), island slabs float, lighting needs
its relentless pass. Next actions: wheel transform fix (world-space from
controller, not group-local y), draw-call merge pass (product instancing per
gondola), V1 lighting iteration, X1 ×3 stability reruns.

## Iter 005 — V2 wheels red→green
Added side_profile/three_quarter poses + wheelState() + rest/steer/spin
assertions (red: worldY −0.21, buried; suspension 0.02 bottomed). Root causes,
in order of discovery: (1) wheel meshes not driven from controller state;
(2) pose-settle stepped the world without updateVehicle → chassis bottomed on
its own collider and wheel rays started embedded; (3) suspension constants
were Bullet-style — Rapier wants real N/m (4800 N/m, 1500 N max force,
750/950 damping); (4) nondeterministic WASM OOB traced to StrictMode double-
mounting racing two RAPIER.init() calls — module-level singleton fixed it;
teleports now queue into the tick, one controller for life. Visual: body
narrowed (1.48 m over 1.5 m track) so wheels sit proud; rocker raised; brake/
reverse emissives wired. Evidence: iter-005 + iter-005-static (3×3 assertion
passes, console clean). VERDICT: PASS.

## Iter 006 — grounding (V3 partial)
Islands: beveled curb on dark base; column plinths; price-board plinth;
bollard base discs; oil-stain + tire-mark contact decals. First pass washed
the mood out — contrast restored with exposure 1.1→0.98, ambient 1.4→1.05,
canopy spots 260→190, fog pulled to 24..105. Evidence: iter-006-static.
VERDICT: PASS (nothing floats; night mood back).

## Iter 007 — bloom discipline (V5)
Threshold 0.1→0.32, intensity 0.75; togglePost() debug API; paired shots
post-all-on/off, ao-off, bloom-off in iter-007-static. Text never smears;
asphalt/paint never bloom (selective layer + threshold). VERDICT: PASS.

## Iter 008 — store interior (V4) + pose cameras
Foot poses gained yaw; store_aisle/checkout reframed; interior +150/+70
warm points. Aisle shot: dense shelves, readable fictional labels, cooler
glow. Nit: items sit ~2cm above shelf lips — logged, not shipped-blocking.
VERDICT: PASS.

## Iter 009 — P1 draw calls
Breakdown (at_pump): base 178 + bloom ~30 + AO ~23 = 231. Merges: canopy
cols/plinths/lights, cooler cabinets+glass, gondola shelving, island curbs
(each → 1 draw per material); interior group streams (hidden >24 m from the
door, incl. its lights). Result: at_pump 189, spawn 120, store_aisle 110 —
all <200 with full post. aim-150 not reached at the pump; budget met.
VERDICT: PASS.

## Iter 010 — G1 feel (provisional)
Tuning panel behind ?debug=1&tune=1 (all vehicle/camera constants live,
"dump config" → console JSON). Scripted metrics after retune (engineForce
2100, governor at 19 m/s, handbrake 22): 0→12.8 m/s in 4 s (top ~13),
full-lock at speed stable (no spin-out), handbrake scrubs to 4.15 m/s.
VERDICT: provisional PASS — needs a human hand on the wheel.

## Iter 011 — Chanel + exit
Removed the duplicate tire-mark strip. Static build: 3× full harness green
(fps 120 avg, 189 draws, console clean ×3). Freeze diff: exactly the 10
enumerated overlay strings. VERDICT: exit criteria met (G1 human pass
outstanding).

### G1 human test-drive instructions (for the owner)
1. `npm run dev` → http://localhost:3000/?debug=1&tune=1
2. Drive A: lot laps — full throttle spawn→canopy, brake into the bay.
3. Drive B: slalom the bollards at half throttle, then full-lock circles.
4. Drive C: approach road top-speed run, handbrake turn at the apron.
Report each as: floaty / grippy / twitchy / heavy (+ camera: laggy/tight).
Then hit "dump config" and paste the JSON; next session bakes it in.
