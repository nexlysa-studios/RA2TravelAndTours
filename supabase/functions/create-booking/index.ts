import { createClient } from "@supabase/supabase-js";
import {
  parseBookingRequest,
  BookingValidationError,
} from "../../../shared/booking.ts";
import { corsHeaders, json } from "../_shared/http.ts";
import { sendBookingEmails } from "../_shared/emails.ts";

export async function handleBooking(request: Request) {
  let headers: Record<string, string>;
  try {
    headers = corsHeaders(request);
  } catch {
    return json(
      { error: "This website is not allowed to submit bookings." },
      403,
    );
  }
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (request.method !== "POST")
    return json({ error: "Use POST to submit a booking." }, 405, {
      ...headers,
      Allow: "POST, OPTIONS",
    });
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "Send booking details as JSON." }, 415, headers);
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 16_384)
      return json({ error: "Your request is too large." }, 413, headers);
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return json(
        { error: "Please check your booking details." },
        400,
        headers,
      );
    }
    const booking = parseBookingRequest(raw);
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("SUPABASE_NOT_CONFIGURED");
    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Supabase's gateway supplies x-forwarded-for. Store a salted hash, never the IP.
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${key}:${ip}`),
    );
    const ipHash = Array.from(new Uint8Array(digest), (n) =>
      n.toString(16).padStart(2, "0"),
    ).join("");
    const { data, error } = await db.rpc("create_booking_request", {
      p_request: booking,
      p_ip_hash: ipHash,
    });
    if (error) {
      const known: Record<string, { status: number; message: string }> = {
        RATE_LIMITED: {
          status: 429,
          message:
            "Too many requests. Please wait a few minutes or contact RA2 on WhatsApp.",
        },
        SERVICE_UNAVAILABLE: {
          status: 400,
          message:
            "This service is currently unavailable. Please choose another or WhatsApp RA2.",
        },
        GROUP_TOO_LARGE: {
          status: 400,
          message:
            "Please contact RA2 on WhatsApp to arrange transport for this group size.",
        },
        REQUEST_MISMATCH: {
          status: 409,
          message:
            "This request was already submitted with different details. Please refresh before starting a new request.",
        },
      };
      for (const [code, info] of Object.entries(known))
        if (error.message.includes(code))
          return json({ error: info.message }, info.status, {
            ...headers,
            ...(info.status === 429 ? { "Retry-After": "600" } : {}),
          });
      console.error("booking_save_failed", { code: error.code });
      return json(
        {
          error:
            "We couldn't save your request. Please try again or WhatsApp RA2.",
        },
        500,
        headers,
      );
    }
    // The database supplies the reference and service snapshot. Never email arbitrary client payloads.
    let emails: { customer: string; admin: string } = {
      customer: "pending",
      admin: "pending",
    };
    try {
      emails = await sendBookingEmails(db, data);
    } catch {
      console.error("booking_notifications_failed", {
        reference: data.reference,
      });
    }
    return json(
      {
        saved: true,
        reference: data.reference,
        serviceName: data.service_name,
        emails,
      },
      200,
      headers,
    );
  } catch (error) {
    if (error instanceof BookingValidationError)
      return json({ error: error.message }, 400, headers);
    console.error("booking_unavailable");
    return json(
      {
        error:
          "We couldn't complete your request. Please try again or contact RA2 on WhatsApp.",
      },
      500,
      headers,
    );
  }
}

Deno.serve(handleBooking);
