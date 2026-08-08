/* NIGHT RUN loop harness. Usage:
   node scripts/loop-test.mjs [--url http://localhost:3000] [--iter 001] [--poses a,b]
   Writes screenshots + state dumps + console logs to loop/artifacts/iter-NNN/. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const URL = arg("url", "http://localhost:3000");
const ITER = arg("iter", "000");
const POSES = arg(
  "poses",
  "spawn,approach,at_pump,fueling,on_foot_lot,store_aisle,checkout,receipt,side_profile,three_quarter"
).split(",");
const DIR = `loop/artifacts/iter-${ITER}`;
mkdirSync(DIR, { recursive: true });

const consoleLog = [];
const browser = await chromium.launch({ args: ["--use-gl=angle"] });

async function runViewport(tag, viewport, mobile) {
  const ctx = await browser.newContext({
    viewport,
    hasTouch: mobile,
    isMobile: mobile,
    userAgent: mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
      : undefined,
  });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning")
      consoleLog.push(`[${tag}] ${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => consoleLog.push(`[${tag}] pageerror: ${e}`));
  await page.goto(`${URL}/?debug=1`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: `${DIR}/${tag}-loading.png` });
  await page.waitForFunction("window.__game", { timeout: 30000 });
  await page.evaluate("window.__game.ready");
  // start (mobile shows tap-to-start)
  if (mobile) {
    const btn = page.locator("text=Tap to start");
    try { await btn.click({ timeout: 6000 }); } catch {}
  }
  await page.waitForTimeout(700);
  const states = {};
  for (const pose of POSES) {
    await page.evaluate(`window.__game.teleport(${JSON.stringify(pose)})`);
    await page.evaluate("window.__game.screenshotReady()");
    await page.screenshot({ path: `${DIR}/${tag}-${pose}.png` });
    states[pose] = await page.evaluate("window.__game.state()");
  }
  // V2 wheel assertions (desktop only)
  if (!mobile && POSES.includes("side_profile")) {
    await page.evaluate("window.__game.teleport('side_profile')");
    await page.waitForTimeout(400);
    const ws = await page.evaluate("window.__game.wheelState()");
    const fails = [];
    ws.wheels.forEach((w, i) => {
      if (w.worldY == null || Math.abs(w.worldY - ws.wheelRadius) > ws.wheelRadius * 0.15)
        fails.push(`w${i} worldY=${w.worldY} (want ~${ws.wheelRadius})`);
      if (w.lateral == null || w.lateral < ws.halfTrack * 0.9)
        fails.push(`w${i} lateral=${w.lateral} (want >=${(ws.halfTrack * 0.9).toFixed(2)})`);
      if (w.suspension != null && (w.suspension < 0 || w.suspension > 0.48))
        fails.push(`w${i} suspension=${w.suspension}`);
    });
    // steering assertion
    await page.evaluate("window.__game.input([{down:'KeyA'}])");
    await page.waitForTimeout(1000);
    const ws2 = await page.evaluate("window.__game.wheelState()");
    await page.evaluate("window.__game.input([{up:'KeyA'}])");
    if (Math.abs(ws2.wheels[0].steering) < 0.1) fails.push(`steering front=${ws2.wheels[0].steering}`);
    if (Math.abs(ws2.wheels[2].steering) > 0.01) fails.push(`steering rear=${ws2.wheels[2].steering}`);
    // spin assertion
    const r0 = ws2.wheels[0].rotation;
    await page.evaluate("window.__game.input([{down:'KeyW'}])");
    await page.waitForTimeout(2500);
    const ws3 = await page.evaluate("window.__game.wheelState()");
    await page.evaluate("window.__game.input([{up:'KeyW'}])");
    if (Math.abs(ws3.wheels[0].rotation - r0) < 1) fails.push(`no spin: ${r0} -> ${ws3.wheels[0].rotation}`);
    states.wheelAssertions = { fails, rest: ws, steer: ws2.wheels.map((w) => w.steering), spun: ws3.wheels[0].rotation };
    console.log(fails.length ? `V2 ASSERTIONS FAIL:\n  ${fails.join("\n  ")}` : "V2 ASSERTIONS PASS");
  }

  // 10s driven run for fps (desktop only)
  if (!mobile) {
    await page.evaluate("window.__game.teleport('spawn')");
    await page.keyboard.down("w");
    await page.waitForTimeout(5000);
    await page.keyboard.up("w");
    await page.keyboard.down("a");
    await page.keyboard.down("w");
    await page.waitForTimeout(2500);
    await page.keyboard.up("a");
    await page.keyboard.up("w");
    await page.waitForTimeout(2500);
    states.driven = await page.evaluate("window.__game.state()");
    await page.screenshot({ path: `${DIR}/${tag}-driven.png` });
  }
  writeFileSync(`${DIR}/${tag}-state.json`, JSON.stringify(states, null, 2));
  await ctx.close();
  return states;
}

const desktop = await runViewport("desktop", { width: 1600, height: 900 }, false);
const mobileStates = await runViewport("mobile", { width: 390, height: 844 }, true);
writeFileSync(`${DIR}/console.log`, consoleLog.join("\n") || "(clean)");
const summary = {
  desktopFps: desktop.driven?.fps,
  desktopDraws: desktop.at_pump?.drawCalls,
  desktopTris: desktop.at_pump?.triangles,
  mobileTier: mobileStates.spawn?.tier,
  consoleIssues: consoleLog.length,
};
writeFileSync(`${DIR}/summary.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary));
await browser.close();
