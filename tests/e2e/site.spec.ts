import { test, expect } from "@playwright/test";

test("RA2 identity, fonts and layout render correctly", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle("Private Cape Town Tours | RA2 Travel & Tours");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Discover Cape Town.Experience South Africa.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ra2travelandtours.co.za/",
  );
  await expect(page.locator("body")).not.toContainText(/travel\s*buzz/i);
  expect(
    await page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain("Manrope");
  expect(
    await page.locator("h1").evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain("Outfit");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test("public pages have valid RA2 metadata and navigation", async ({ page }) => {
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
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      path,
    ).toBe(true);
  }
});

test("mobile menu navigates to the airport section", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile menu interaction");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  const menuLinks = page.locator("#staggered-menu-panel .sm-panel-item");
  await expect(menuLinks.first()).toBeVisible();
  expect(await menuLinks.first().evaluate((link) => getComputedStyle(link, "::after").right)).toBe(
    "0px",
  );
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

test("featured tours carousel is usable across screen sizes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const featuredTours = page.getByRole("region", {
    name: "Featured private tours",
  });
  await featuredTours.scrollIntoViewIfNeeded();
  await expect(featuredTours.getByRole("heading", { name: "Cape Town City Tour" })).toBeVisible();
  await expect(
    featuredTours.getByRole("button", { name: "Next featured tour" }).first(),
  ).toBeEnabled();
  await featuredTours.getByRole("button", { name: "Next featured tour" }).first().click();
  await expect(page.getByRole("button", { name: "Go to Stellenbosch Wine Tour" })).toHaveAttribute(
    "aria-current",
    "true",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("homepage gallery uses the animated photo reel accessibly", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const gallery = page.locator("#gallery");
  await expect(
    gallery.getByRole("heading", { name: "Every frame, brought into focus." }),
  ).toBeVisible();
  await expect(
    gallery.getByText(
      "Images curve in from one edge, flatten out at the centre, then fade away round the other.",
    ),
  ).toBeVisible();
  const imageBand = gallery.locator(".pointer-events-none.absolute.inset-0");
  await expect
    .poll(() => imageBand.evaluate((element) => Number(getComputedStyle(element).opacity)))
    .toBeGreaterThan(0.9);
  await expect
    .poll(() =>
      imageBand
        .locator("img")
        .evaluateAll(
          (images) => images.filter((image) => image.complete && image.naturalWidth > 0).length,
        ),
    )
    .toBeGreaterThan(0);
  const tiles = gallery.locator("[aria-hidden='true'] > div");
  await expect
    .poll(() =>
      tiles.evaluateAll(
        (elements) =>
          elements.filter((element) => getComputedStyle(element).visibility === "visible").length,
      ),
    )
    .toBeGreaterThan(0);
  const tile = tiles.first();
  await expect
    .poll(() => tile.evaluate((element) => getComputedStyle(element).animationName))
    .not.toBe("none");
  expect(await tile.evaluate((element) => getComputedStyle(element).animationPlayState)).toBe(
    "paused",
  );
  for (const [width, height, minSectionHeight, maxSectionHeight] of [
    [320, 568, 400, 500],
    [390, 844, 400, 500],
    [768, 1024, 520, 520],
    [1280, 800, 560, 560],
  ]) {
    await page.setViewportSize({ width, height });
    const layout = await gallery.evaluate((section) => {
      const bounds = section.getBoundingClientRect();
      const heading = section.querySelector("h2")?.getBoundingClientRect();
      const caption = section.querySelector("p")?.getBoundingClientRect();
      return {
        sectionHeight: bounds.height,
        sectionWidth: bounds.width,
        sectionLeft: bounds.left,
        sectionRight: bounds.right,
        headingInside: Boolean(
          heading && heading.top >= bounds.top && heading.bottom <= bounds.bottom,
        ),
        captionInside: Boolean(
          caption && caption.top >= bounds.top && caption.bottom <= bounds.bottom,
        ),
        viewportWidth: window.innerWidth,
      };
    });
    expect(layout.sectionHeight, `${width}px section height`).toBeGreaterThanOrEqual(
      minSectionHeight,
    );
    expect(layout.sectionHeight, `${width}px section height`).toBeLessThanOrEqual(maxSectionHeight);
    expect(layout.headingInside, `${width}px heading position`).toBe(true);
    expect(layout.captionInside, `${width}px caption position`).toBe(true);
    expect(layout.sectionWidth, `${width}px section width`).toBeLessThanOrEqual(width);
    expect(layout.sectionLeft, `${width}px section left edge`).toBeGreaterThanOrEqual(0);
    expect(layout.sectionRight, `${width}px section right edge`).toBeLessThanOrEqual(
      layout.viewportWidth,
    );
  }
  await page.reload({ waitUntil: "domcontentloaded" });
  const reloadedGallery = page.locator("#gallery");
  const reloadedBand = reloadedGallery.locator(".pointer-events-none.absolute.inset-0");
  await expect
    .poll(() => reloadedBand.evaluate((element) => Number(getComputedStyle(element).opacity)))
    .toBeGreaterThan(0.9);
  await expect
    .poll(() =>
      reloadedBand
        .locator("img")
        .evaluateAll(
          (images) => images.filter((image) => image.complete && image.naturalWidth > 0).length,
        ),
    )
    .toBeGreaterThan(0);
});

test("sitemap and robots use the production RA2 domain", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("https://ra2travelandtours.co.za/cape-peninsula-tour");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /admin");
});

test("gallery supports opening a photograph and closing with Escape", async ({ page }) => {
  await page.goto("/gallery", { waitUntil: "domcontentloaded" });
  const photograph = page.locator("#gallery button").first();
  await photograph.click();
  await expect(page.getByRole("dialog", { name: "Cape Town travel photograph" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
