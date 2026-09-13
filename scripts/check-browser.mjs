import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium as playwrightChromium } from "@playwright/test";
const args = [];
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1"],
  { stdio: "pipe" },
);
server.stderr.on("data", (d) => process.stderr.write(d));
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch("http://localhost:3000");
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!ready) throw new Error("Server unavailable");
  const runner = spawn(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test"],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        ...(executablePath
          ? { PLAYWRIGHT_EXECUTABLE_PATH: executablePath }
          : {}),
      },
    },
  );
  const exit = await new Promise((resolve) => runner.on("exit", resolve));
  const browser = await playwrightChromium.launch({
    headless: true,
    executablePath,
    args,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await page.goto("http://localhost:3000");
  await page.locator(".hero h1").waitFor();
  await page.locator(".hero img").evaluate((img) => img.decode());
  await page.evaluate(() => document.fonts.ready);
  await mkdir("preview", { recursive: true });
  await page.screenshot({ path: "preview/desktop.png", fullPage: true });
  await page.screenshot({ path: "preview/hero.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000");
  await page.locator(".hero h1").waitFor();
  await page.locator(".hero img").evaluate((img) => img.decode());
  await page.screenshot({ path: "preview/mobile.png", fullPage: true });
  console.log(
    "Browser metrics:",
    await page.evaluate(() => ({
      width: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      resources: performance.getEntriesByType("resource").length,
      images: Array.from(document.images).map((i) => ({
        loaded: i.complete && i.naturalWidth > 0,
        src: i.getAttribute("src"),
      })),
    })),
  );
  await browser.close();
  if (exit !== 0) process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
