import { test, expect } from "@playwright/test";

test("RA2 identity, fonts and layout render correctly", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle("Private Cape Town Tours | RA2 Travel & Tours");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Take thescenic route.");
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
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Airport Transfers", exact: true })
    .click();
  await expect(page).toHaveURL(/#transfers$/);
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(
    page.getByRole("heading", { name: /A warm welcome\.\s*A smooth arrival\./ }),
  ).toBeInViewport();
});

test("journey filters show matching experiences and preserve service links", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const journeys = page.locator("#tours");
  await expect(journeys.locator("article")).toHaveCount(6);
  await journeys.getByRole("button", { name: /Wine & wildlife/ }).click();
  await expect(journeys.locator("article")).toHaveCount(2);
  await expect(journeys.getByRole("heading", { name: "Cape Winelands" })).toBeVisible();
  await expect(journeys.getByRole("heading", { name: "Aquila Game Reserve Safari" })).toBeVisible();
  await expect(
    journeys.getByRole("link", { name: "Explore Aquila Game Reserve Safari", exact: true }),
  ).toHaveAttribute("href", "/?service=aquila-safari#book");
  await journeys.getByRole("button", { name: /Coast & city/ }).click();
  await expect(journeys.getByRole("heading", { name: "Cape Town City Tour" })).toBeVisible();
  await journeys.getByRole("button", { name: /All journeys/ }).click();
  await expect(journeys.locator("article")).toHaveCount(6);
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
  const photograph = page.getByRole("button", { name: /^View photograph:/ }).first();
  await photograph.click();
  await expect(page.getByRole("dialog", { name: "Cape Town travel photograph" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(photograph).toBeFocused();
});

test("gallery filters and keyboard controls explore the selected collection", async ({ page }) => {
  await page.goto("/gallery", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Wildlife/ }).click();
  await expect(page.getByRole("status")).toHaveText("2 photographs");
  await page.getByRole("button", { name: "View photograph: A different kind of local" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "A different kind of local" })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("heading", { name: "Life on the Atlantic coast" })).toBeVisible();
  await dialog.getByRole("button", { name: "Next photograph" }).click();
  await expect(dialog.getByRole("heading", { name: "A different kind of local" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /All frames/ }).click();
  await expect(page.getByRole("button", { name: /^View photograph:/ })).toHaveCount(14);
});
