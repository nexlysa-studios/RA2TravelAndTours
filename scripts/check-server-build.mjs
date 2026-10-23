import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// GSAP must be compiled by Vite, not resolved as an external module in Lambda.
const externalGsap = /\b(?:from\s*|import\s*\(\s*|require\s*\(\s*)["']gsap(?:\/[^"']*)?["']/;
async function checkImports(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await checkImports(path);
    else if (/\.m?js$/.test(entry.name)) {
      assert.ok(
        !externalGsap.test(await readFile(path, "utf8")),
        `GSAP was externalized in ${path}`,
      );
    }
  }
}
await checkImports(fileURLToPath(new URL("../dist/server", import.meta.url)));

// Import the real Netlify entry directly, without Vite's preview compatibility layer.
const { default: handler } = await import("../.netlify/v1/functions/server.mjs");
for (const [path, status] of [
  ["/", 200],
  ["/gallery", 200],
  ["/packages", 200],
  ["/cape-peninsula-tour", 200],
  ["/this-page-does-not-exist", 404],
]) {
  const response = await handler(new Request(`https://ra2travelandtours.co.za${path}`));
  assert.equal(response.status, status, `Server startup/render failed for ${path}`);
  assert.match(response.headers.get("content-type") || "", /text\/html/);
  await response.text();
}
console.log("Server build verified: GSAP bundled; Netlify entry renders public pages and 404s.");
