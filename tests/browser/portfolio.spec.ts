import { test, expect } from "@playwright/test";
test("public routes fit required widths and images load", async ({ page }) => {
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/", "/projects", "/about", "/contact", "/certifications", "/login"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} at ${width}px overflows`,
      ).toBeTruthy();
      for (const img of await page.locator("img").all()) {
        await img.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            img.evaluate(
              (el) =>
                (el as HTMLImageElement).complete &&
                (el as HTMLImageElement).naturalWidth > 0,
            ),
          )
          .toBeTruthy();
      }
      expect(
        await page
          .locator("img")
          .evaluateAll((imgs) =>
            imgs.every(
              (img) =>
                (img as HTMLImageElement).complete &&
                (img as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      ).toBeTruthy();
    }
  }
});
test("mobile navigation handles keyboard and route changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Projects", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
});
test("unconfigured backend fails closed and never reports contact success", async ({
  page,
  request,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
  expect((await request.get("/api/admin?resource=messages")).status()).toBe(
    401,
  );
  expect(
    (
      await request.post("/api/admin", {
        headers: { Origin: "https://evil.example" },
        data: { action: "profile" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/upload", {
        headers: { Origin: "http://localhost:3000" },
      })
    ).status(),
  ).toBe(401);
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Test Visitor");
  await page.getByLabel("Email address").fill("test@example.com");
  await page
    .getByLabel("Your message")
    .fill("I would like to discuss a project with you.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".contact-form").getByRole("alert")).toContainText("not connected");
  await expect(page.getByText("Message received.")).not.toBeVisible();
});
test("known social and contact destinations are correct", async ({ page }) => {
  await page.goto("/contact");
  await expect(
    page.locator('a[href="mailto:contact.saqibmuhammad@gmail.com"]'),
  ).toBeVisible();
  await expect(page.locator('a[href="tel:+923308925715"]')).toBeVisible();
  await expect(
    page.locator('a[href="https://github.com/saqibturi"]').first(),
  ).toBeVisible();
});

test('redesign uses upright typography and public certificates',async({page})=>{await page.goto('/');await expect(page.locator('.hero h1')).toBeVisible();expect(await page.locator('.hero h1').evaluate(el=>getComputedStyle(el).fontStyle)).toBe('normal');await page.goto('/certifications');await expect(page.getByRole('heading',{level:1})).toContainText('getting better');await expect(page.locator('.certificate-empty')).toBeVisible();});
