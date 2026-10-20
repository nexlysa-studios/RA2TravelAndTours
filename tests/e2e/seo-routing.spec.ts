import { test, expect } from "@playwright/test";

const origin = "https://ra2travelandtours.co.za";
test.use({ javaScriptEnabled: false });

test("every sitemap page renders searchable HTML and consistent metadata without JavaScript", async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()["content-type"]).toContain("application/xml");
  const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  expect(urls.length).toBeGreaterThan(10);
  expect(new Set(urls).size).toBe(urls.length);
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const url of urls) {
    expect(url).toMatch(/^https:\/\/ra2travelandtours\.co\.za\//);
    expect(url).not.toContain("/admin");
    const response = await page.goto(new URL(url).pathname, { waitUntil: "domcontentloaded" });
    expect(response?.status(), url).toBe(200);
    await expect(page.locator("h1"), url).toHaveCount(1);
    await expect(page.locator("title"), url).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", url);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    const title = await page.title();
    const description = (await page.locator('meta[name="description"]').getAttribute("content"))!;
    expect(title).toContain("RA2 Travel & Tours");
    expect(titles.has(title), `Duplicate title at ${url}`).toBe(false);
    expect(descriptions.has(description), `Duplicate description at ${url}`).toBe(false);
    titles.add(title);
    descriptions.add(description);
    expect(description.length).toBeGreaterThan(60);
    const socialImage = (await page.locator('meta[property="og:image"]').getAttribute("content"))!;
    expect(socialImage).toMatch(/^https:\/\/ra2travelandtours\.co\.za\//);
    expect(socialImage).toBe(
      await page.locator('meta[name="twitter:image"]').getAttribute("content"),
    );
    const graph = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(graph.length).toBe(1);
    const entities = JSON.parse(graph[0])["@graph"] as Record<string, unknown>[];
    expect(entities.some((entity) => entity["@type"] === "TravelAgency")).toBe(true);
    expect(entities.some((entity) => entity["@type"] === "WebSite")).toBe(true);
    if (new URL(url).pathname.startsWith("/blog/")) {
      expect(entities.some((entity) => entity["@type"] === "BlogPosting")).toBe(true);
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    }
    const imageResponse = await request.get(new URL(socialImage).pathname);
    expect(imageResponse.status(), socialImage).toBe(200);
    expect(imageResponse.headers()["content-type"]).toMatch(/^image\//);
  }
});

test("internal links and section anchors resolve", async ({ page, request }) => {
  test.setTimeout(120_000);
  const sitemap = await request.get("/sitemap.xml");
  const paths = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  const internalLinks = new Set<string>();
  for (const path of paths) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const links = await page
      .locator("a[href]")
      .evaluateAll((elements) => elements.map((element) => element.getAttribute("href")!));
    for (const href of links) {
      const url = new URL(href, `${origin}${path}`);
      if (url.origin === origin) internalLinks.add(`${url.pathname}${url.search}${url.hash}`);
    }
  }
  for (const href of internalLinks) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
    const hash = new URL(href, origin).hash.slice(1);
    if (hash) expect(await response.text(), href).toContain(`id="${decodeURIComponent(hash)}"`);
  }
});

test("redirects keep query parameters and unknown URLs return real 404s", async ({ request }) => {
  for (const [from, to] of [
    ["/packages/?service=airport-transfer", "/packages?service=airport-transfer"],
    ["/blog/", "/blog"],
    ["/tours?source=bookmark", "/packages?source=bookmark"],
    ["/contact", "/#book"],
    ["/index.html", "/"],
  ]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(301);
    expect(response.headers().location, from).toBe(to);
  }
  for (const path of [
    "/this-page-does-not-exist",
    "/blog/missing-article",
    "/assets/missing-image.png",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
    expect(response.headers()["x-robots-tag"], path).toContain("noindex");
  }
  const admin = await request.get("/admin/login");
  expect(admin.status()).toBe(200);
  expect(admin.headers()["x-robots-tag"]).toContain("noindex");
  expect(admin.headers()["cache-control"]).toContain("no-store");
});
