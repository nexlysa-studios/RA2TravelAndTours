export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const configured =
    Deno.env
      .get("BOOKING_ALLOWED_ORIGINS")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const allowed = new Set([
    "https://ra2travelandtours.co.za",
    "https://www.ra2travelandtours.co.za",
    ...configured,
  ]);
  if (
    origin &&
    !allowed.has(origin) &&
    !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  )
    throw new Error("ORIGIN_NOT_ALLOWED");
  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
}

export function json(
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
