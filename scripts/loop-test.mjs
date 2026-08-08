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
  "spawn,approach,at_pump,fueling,on_foot_lot,store_aisle,checkout,receipt"
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
