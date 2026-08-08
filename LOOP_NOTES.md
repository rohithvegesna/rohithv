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
