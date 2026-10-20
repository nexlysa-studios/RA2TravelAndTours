import { defineConfig, devices } from "@playwright/test";
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  fullyParallel: false,
  expect: { timeout: 15_000 },
  workers: 2,
  use: {
    baseURL: externalBaseUrl || "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    channel:
      process.env.PLAYWRIGHT_BROWSER_CHANNEL ||
      (process.platform === "win32" ? "msedge" : undefined),
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "npm run dev -- --host 127.0.0.1 --port 5173",
        url: "http://127.0.0.1:5173",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
