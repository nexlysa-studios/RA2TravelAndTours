import { test, expect, type Page } from "@playwright/test";

const services = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "airport-transfer",
    name: "Private Airport Transfers",
    is_active: true,
    max_pax: 30,
    sort_order: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "cape-peninsula-tour",
    name: "Cape Peninsula Full Day Tour",
    is_active: true,
    max_pax: 30,
    sort_order: 2,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    slug: "custom-private-tour",
    name: "Custom Private Tours",
    is_active: true,
    max_pax: 30,
    sort_order: 3,
  },
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/rest/v1/services?**", (route) =>
    route.fulfill({ json: services }),
  );
});

async function fillBooking(page: Page) {
  await page.goto("/?service=airport-transfer#book", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByLabel("Tour or service")).toHaveValue(
    "airport-transfer",
  );
  await page.getByLabel("Full name", { exact: true }).fill("Sam Traveller");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("sam@example.com");
  await page
    .getByLabel("Phone / WhatsApp", { exact: true })
    .fill("+447700900123");
  await page.getByLabel("Preferred travel date").fill("2027-12-20");
  await page.getByLabel("Pickup time", { exact: false }).fill("10:30");
  await page
    .getByLabel("Pickup location", { exact: true })
    .fill("Cape Town International Airport");
  await page
    .getByLabel("Destination", { exact: false })
    .fill("Waterfront hotel");
  await page
    .getByLabel("Special requirements", { exact: false })
    .fill("One child seat");
  await page
    .getByLabel("Tell us about your trip", { exact: false })
    .fill("Flight RA200, family holiday");
}

test("booking receipt keeps WhatsApp sharing optional and includes all trip details", async ({
  page,
}) => {
  const submissions: Record<string, unknown>[] = [];
  await page.route("**/functions/v1/create-booking", async (route) => {
    submissions.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        saved: true,
        reference: "RA2-261020-TEST000001",
        serviceName: "Private Airport Transfers",
        emails: { customer: "sent", admin: "sent" },
      },
    });
  });
  await fillBooking(page);
  await page
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Thank you, Sam." }),
  ).toBeVisible();
  expect(submissions).toHaveLength(1);
  expect(submissions[0]).toMatchObject({
    serviceSlug: "airport-transfer",
    specialRequirements: "One child seat",
    passengers: 2,
  });
  expect(submissions[0]).not.toHaveProperty("total_zar");
  expect(page.url()).toContain("127.0.0.1");
  const link = page.getByRole("link", {
    name: /Send booking details on WhatsApp/,
  });
  const href = new URL((await link.getAttribute("href"))!);
  expect(href.pathname).toBe("/27788158817");
  const message = href.searchParams.get("text")!;
  for (const value of [
    "RA2-261020-TEST000001",
    "Sam Traveller",
    "sam@example.com",
    "+447700900123",
    "Private Airport Transfers",
    "Cape Town International Airport",
    "Waterfront hotel",
    "2027-12-20",
    "10:30",
    "One child seat",
    "Flight RA200",
  ])
    expect(message).toContain(value);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(
    page.getByText(/A confirmation of your request has been sent/),
  ).toBeVisible();
});

test("a failed email can be retried without creating another request", async ({
  page,
}) => {
  const submissions: Record<string, unknown>[] = [];
  await page.route("**/functions/v1/create-booking", (route) => {
    submissions.push(route.request().postDataJSON());
    return route.fulfill({
      json: {
        saved: true,
        reference: "RA2-261020-TEST000002",
        serviceName: "Private Airport Transfers",
        emails: {
          customer: submissions.length === 1 ? "failed" : "sent",
          admin: "sent",
        },
      },
    });
  });
  await fillBooking(page);
  await page
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByText(/Your request is saved, but we couldn't send/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry email confirmation" }).click();
  await expect(
    page.getByText(/A confirmation of your request has been sent/),
  ).toBeVisible();
  expect(submissions).toHaveLength(2);
  expect(submissions[1]).toEqual(submissions[0]);
});

test("a network failure shows a useful error and preserves the retry identity", async ({
  page,
}) => {
  const submissions: Record<string, unknown>[] = [];
  await page.route("**/functions/v1/create-booking", (route) => {
    submissions.push(route.request().postDataJSON());
    return submissions.length === 1
      ? route.fulfill({
          status: 503,
          json: { error: "Please try again shortly." },
        })
      : route.fulfill({
          json: {
            saved: true,
            reference: "RA2-261020-TEST000003",
            serviceName: "Private Airport Transfers",
            emails: { customer: "sent", admin: "sent" },
          },
        });
  });
  await fillBooking(page);
  await page
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Please try again shortly.",
  );
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Sam Traveller",
  );
  await page
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Thank you, Sam." }),
  ).toBeVisible();
  expect(submissions[1].requestId).toBe(submissions[0].requestId);
});

test("service loading failure offers a retry and WhatsApp alternative", async ({
  page,
}) => {
  await page.route("**/rest/v1/services?**", (route) =>
    route.fulfill({ status: 503, json: { message: "Unavailable" } }),
  );
  await page.goto("/#book", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByText("We couldn't load experiences.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Request a Quote", exact: true }),
  ).toBeDisabled();
  await page.route("**/rest/v1/services?**", (route) =>
    route.fulfill({ json: services }),
  );
  await page.getByRole("button", { name: "Try loading again" }).click();
  await expect(page.getByLabel("Tour or service")).toBeEnabled();
});
