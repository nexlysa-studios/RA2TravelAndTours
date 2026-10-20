import { test, expect } from "@playwright/test";

test("RA2 identity, fonts and layout render correctly", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(
    "Private Cape Town Tours | RA2 Travel & Tours",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Discover Cape Town.Experience South Africa.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ra2travelandtours.co.za/",
  );
  await expect(page.locator("body")).not.toContainText(/travel\s*buzz/i);
  expect(
    await page
      .locator("body")
      .evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain("Manrope");
  expect(
    await page
      .locator("h1")
      .evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain("Outfit");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("public pages have valid RA2 metadata and navigation", async ({
  page,
}) => {
  for (const path of [
    "/packages",
    "/cape-peninsula-tour",
    "/cape-town-city-tour",
    "/stellenbosch-wine-tour",
    "/gallery",
    "/fleet",
    "/blog",
    "/blog/top-10-things-to-do-in-cape-town",
  ]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), path).toBe(200);
    await expect(page).toHaveTitle(/RA2 Travel & Tours/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://ra2travelandtours.co.za${path}`,
    );
    await expect(page.getByRole("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path,
    ).toBe(true);
  }
});

test("mobile menu navigates to the airport section", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Mobile menu interaction");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("button", { name: "Close menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .locator("#staggered-menu-panel")
    .getByRole("link", { name: "Airport Transfers", exact: true })
    .click();
  await expect(page).toHaveURL(/#transfers$/);
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(
    page.getByRole("heading", { name: "Arrive relaxed. Leave with memories." }),
  ).toBeInViewport();
});

test("sitemap and robots use the production RA2 domain", async ({
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain(
    "https://ra2travelandtours.co.za/cape-peninsula-tour",
  );
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /admin");
});

test("gallery supports opening a photograph and closing with Escape", async ({
  page,
}) => {
  await page.goto("/gallery", { waitUntil: "domcontentloaded" });
  const photograph = page.locator("#gallery button").first();
  await photograph.click();
  await expect(
    page.getByRole("dialog", { name: "Cape Town travel photograph" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
