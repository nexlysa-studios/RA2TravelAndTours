import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { PAGE_ALIASES, PUBLIC_PATHS } from "./data/public-pages";

type ServerEntry = (typeof import("@tanstack/react-start/server-entry"))["default"];

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} - try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function pageRedirect(request: Request): Response | undefined {
  if (request.method !== "GET" && request.method !== "HEAD") return;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const destination =
    PAGE_ALIASES[path] || (PUBLIC_PATHS.includes(path) && path !== url.pathname ? path : undefined);
  if (!destination) return;
  const target = new URL(destination, url);
  target.search = url.search;
  return new Response(null, {
    status: 301,
    headers: { Location: `${target.pathname}${target.search}${target.hash}` },
  });
}

function responseHeaders(request: Request, response: Response): Response {
  const path = new URL(request.url).pathname;
  const privatePage = path === "/admin" || path.startsWith("/admin/") || path.startsWith("/api/");
  const context = import.meta.env.RA2_DEPLOY_CONTEXT || process.env.CONTEXT || "";
  const preview = ["deploy-preview", "branch-deploy", "preview-server", "dev"].includes(context);
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (response.status >= 400 || privatePage || preview) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (privatePage || response.status >= 500) headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, ...options) {
    try {
      const redirect = pageRedirect(request);
      if (redirect) return responseHeaders(request, redirect);
      const handler = await getServerEntry();
      const response = await handler.fetch(request, ...options);
      return responseHeaders(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
} satisfies ServerEntry;
