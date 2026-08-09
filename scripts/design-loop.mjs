/* v7 design loop harness.
   node scripts/design-loop.mjs [--url http://localhost:3000] [--iter NNN] [--axe 1]
   Screenshots (color + grayscale) desktop/mobile per route, console policing,
   per-route transfer sizes. Artifacts → loop/artifacts/iter-NNN/. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const URL = arg("url", "http://localhost:3000");
const ITER = arg("iter", "012");
const RUN_AXE = arg("axe", "");
const ROUTES = [
  ["home", "/"],
  ["work", "/work/"],
  ["cs", "/work/fuel-dispenser-platform/"],
  ["pubs", "/publications/"],
  ["press", "/press/"],
  ["404", "/definitely-not-here/"],
];
const DIR = `loop/artifacts/iter-${ITER}`;
mkdirSync(DIR, { recursive: true });

const consoleLog = [];
const transfers = {};
const browser = await chromium.launch();

async function shoot(tag, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    const txt = m.text();
    // the 404 route's own document request is expected to 404
    if (txt.includes("status of 404")) return;
    if (m.type() === "error" || m.type() === "warning")
      consoleLog.push(`[${tag}] ${m.type()}: ${txt.slice(0, 200)}`);
  });
  page.on("pageerror", (e) => consoleLog.push(`[${tag}] pageerror: ${e}`));
  for (const [name, path] of ROUTES) {
    const sizes = [];
    const onResp = (r) => {
      if (!r.url().startsWith(URL)) return; // first-party budget only
      sizes.push(r.request().sizes().then((s2) => s2.responseBodySize).catch(() => 0));
    };
    page.on("response", onResp);
    await page.goto(URL + path, { waitUntil: "networkidle" });
    page.off("response", onResp);
    const all = await Promise.all(sizes);
    transfers[`${tag}-${name}`] = Math.round(all.reduce((a, b) => a + b, 0) / 1024);
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${DIR}/${tag}-${name}.png`, fullPage: true });
    await page.addStyleTag({ content: "html{filter:grayscale(1)}" });
    await page.screenshot({ path: `${DIR}/${tag}-${name}-gray.png`, fullPage: true });
    await page.addStyleTag({ content: "html{filter:none}" });
  }
  await ctx.close();
}

await shoot("d", { width: 1600, height: 900 });
await shoot("m", { width: 390, height: 844 });

let axeIssues = null;
if (RUN_AXE) {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  axeIssues = {};
  for (const [name, path] of ROUTES) {
    await page.goto(URL + path, { waitUntil: "networkidle" });
    const res = await new AxeBuilder({ page }).analyze();
    axeIssues[name] = res.violations.map((v) => `${v.id} ×${v.nodes.length} (${v.impact})`);
  }
  await ctx.close();
}

writeFileSync(`${DIR}/console.log`, consoleLog.join("\n") || "(clean)");
const summary = { transfersKB: transfers, consoleIssues: consoleLog.length, axe: axeIssues };
writeFileSync(`${DIR}/summary.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ consoleIssues: consoleLog.length, axe: axeIssues, homeKB: transfers["d-home"] }));
await browser.close();
