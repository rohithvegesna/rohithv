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

## Iter 012 — v7 theme first light (static)
Full-Service 1962 shipped across all routes. Harness rebuilt as
design-loop.mjs (screens + grayscale + console + axe + transfer).
FAIL: pubs color-contrast ×27 (faded item numbers); 2 console errors
(the 404 route's own document — expected, now filtered); transfer
metric measured decoded bytes.

## Iter 013 — a11y + measurement
text-steel/80 → text-steel; first-party-only encoded transfer (GA is
third-party, lazy). Result: console 0, axe clean ×6 routes, home 429KB.

## Iter 014 — eyes-on critique
Hero name rescaled (3-line poster kept deliberate at 2 sizes down),
crest EST. 2015 unclipped, 5-second transcript PASS, keyboard walk
PASS (skip link first, outlines everywhere), 360px + case page + pubs
+ 404 shots reviewed. Lighthouse static: 97/98 mobile, 100 desktop,
100 a11y/bp/seo everywhere, CLS 0.

## Iter 015 — Chanel + exit
Removed the footer's second perforation strip. 3× full runs green
(console 0, axe clean, 428KB). Freeze diff: adds Pump 01–04, the flip
digits (2,7,27) and the caption duplicate 'peer-reviewed publications';
removes the deleted schematic's figcaption (theme-bound decoration of
the banned circuit-board signature — enumerated, accepted). Diet:
out/ 9.0MB → 2.8MB; deps −4 (three, rapier, postprocessing, n8ao);
home first-party transfer 428KB incl. fonts. VERDICT: exit criteria met.

## Iter 016 — v8 first light (static)
The Trace shipped: library (Node/Bus/Packet/Region/Ticks/StateGlyph),
DG1 hero pipeline h+v, spine with docked sections, branch cards, case
figures on all four slugs, NO ROUTE TO HOST 404, slip footer, new
fonts/tokens. Console 0, axe clean ×6, home 403KB. RSC pitfall fixed
(client-module component map → CaseFigure lookup component).

## Iter 017 — mechanics + clip
404 label clip fixed (text ran off the viewBox). Verified live: spine
energize 0→0.59 on scroll, node probe writes the readout on focus,
packets ride offset-path (19.4%→24.8% in 500ms). 360px diagram variant
reviewed — designed, legible, not a shrink.

## Iter 018 — Chanel + exit
Removed the hero's second state glyph (BATCH); AUTH OK stays, paired
with the green return packet. Lighthouse static: home 98 / others
97–98 / desktop 100, all 100 a11y-bp-seo, CLS 0, LCP 0.5s desktop.
3× full runs green (console 0, axe clean, 398KB). Freeze ledger:
adds TXN SETTLED ✓, two probe hints, five Fig captions; the one
removal remains the deleted v3 schematic's own figcaption (enumerated
since v7). Triple gate: facts instant ✓, craft bookmarkable ✓,
template test — a living EMV pipeline with per-stage readouts and a
paper-figure system is reproducible by no template ✓. VERDICT: exit.

## Iter 019 — abstraction pass (owner request)
All diagrams reduced to high-level stages only: hero is now TAP → DEVICE →
SITE → CLOUD → SETTLED (no EMV kernel, no state machines, no payment-host/
ledger internals, no auth glyph); case figures cut to four abstract stages
each (protocol names — DHCP/PXE, TFTP — and operational sublabels removed);
node readouts rewritten as plain-language one-liners with zero operational
specifics. Captions shortened to match. Console 0, axe clean ×6, 396KB.
VERDICT: PASS — the living-diagram identity is intact, the disclosure is gone.
