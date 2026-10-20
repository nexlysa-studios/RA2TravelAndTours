import { createClient } from "@supabase/supabase-js";
import { corsHeaders, json } from "../_shared/http.ts";
import { sendBookingEmails } from "../_shared/emails.ts";

Deno.serve(async (request) => {
  let headers: Record<string, string>;
  try {
    headers = corsHeaders(request);
  } catch {
    return json({ error: "Origin not allowed." }, 403);
  }
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (request.method !== "POST")
    return json({ error: "Use POST." }, 405, headers);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const token = request.headers
      .get("authorization")
      ?.replace(/^Bearer /i, "");
    if (!token) return json({ error: "Sign in to continue." }, 401, headers);
    const {
      data: { user },
      error,
    } = await db.auth.getUser(token);
    if (error || !user)
      return json({ error: "Sign in to continue." }, 401, headers);
    const { data: isAdmin, error: roleError } = await db.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (roleError || !isAdmin)
      return json({ error: "Admin access required." }, 403, headers);
    const text = await request.text();
    if (text.length > 512)
      return json({ error: "Request too large." }, 413, headers);
    const { bookingId } = JSON.parse(text);
    if (typeof bookingId !== "string" || !/^[0-9a-f-]{36}$/i.test(bookingId))
      return json({ error: "Invalid booking." }, 400, headers);
    const { data: booking, error: loadError } = await db
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();
    if (loadError || !booking)
      return json({ error: "Booking not found." }, 404, headers);
    return json({ emails: await sendBookingEmails(db, booking) }, 200, headers);
  } catch {
    return json(
      { error: "Email delivery is unavailable. Please try again." },
      500,
      headers,
    );
  }
});
