import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1"],
  { stdio: "ignore" },
);
try {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch("http://localhost:3000")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "no-preference",
  });
  await page.goto("http://localhost:3000");
  await page.locator(".hero h1").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await mkdir("preview", { recursive: true });
  const ff = spawn(
    "ffmpeg",
    [
      "-y",
      "-f",
      "image2pipe",
      "-vcodec",
      "mjpeg",
      "-r",
      "12",
      "-i",
      "pipe:0",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "22",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "preview/animation-tour.mp4",
    ],
    { stdio: ["pipe", "ignore", "pipe"] },
  );
  let fferror = "";
  ff.stderr.on("data", (x) => (fferror += x));
  const positions = {
    36: "#expertise",
    66: "#work",
    94: ".about-split",
    122: "#certifications",
    148: ".contact-cta",
  };
  for (let i = 0; i < 180; i++) {
    if (i === 18) await page.mouse.move(1050, 350);
    if (positions[i])
      await page
        .locator(positions[i])
        .evaluate((el) =>
          el.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
    const frame = await page.screenshot({ type: "jpeg", quality: 80 });
    if (!ff.stdin.write(frame))
      await new Promise((r) => ff.stdin.once("drain", r));
    await new Promise((r) => setTimeout(r, 45));
  }
  ff.stdin.end();
  const code = await new Promise((r) => ff.on("exit", r));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://localhost:3000");
  await page.locator(".hero img").evaluate((img) => img.decode());
  await page.screenshot({ path: "preview/hero.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000");
  await page.locator(".hero img").evaluate((img) => img.decode());
  await page.screenshot({ path: "preview/mobile.png", fullPage: true });
  await browser.close();
  if (code !== 0) throw new Error(fferror);
  console.log("Animation tour recorded.");
} finally {
  server.kill("SIGTERM");
}
