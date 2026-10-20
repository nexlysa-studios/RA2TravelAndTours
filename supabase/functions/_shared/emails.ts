import type { SupabaseClient } from "npm:@supabase/supabase-js@2.112.4";

export type EmailBooking = {
  id: string;
  reference: string;
  service_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location: string;
  destination: string | null;
  travel_date: string;
  travel_time: string | null;
  passengers: number;
  special_requirements: string | null;
  notes: string | null;
  customer_email_sent_at: string | null;
  admin_email_sent_at: string | null;
};

const COMPANY = "RA2 Travel & Tours";
const EMAIL = "rezah@ra2travelandtours.co.za";
const PHONE = "+27 78 815 8817";
const URL = "https://ra2travelandtours.co.za";
const escape = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function bookingDetails(
  b: EmailBooking,
): [string, string | number | null][] {
  const date = new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "long",
    timeZone: "Africa/Johannesburg",
  }).format(new Date(`${b.travel_date}T12:00:00Z`));
  return [
    ["Booking reference", b.reference],
    ["Experience", b.service_name],
    ["Name", b.customer_name],
    ["Email", b.customer_email],
    ["Phone / WhatsApp", b.customer_phone],
    ["Travel date", date],
    ["Pickup time (South Africa)", b.travel_time?.slice(0, 5) || null],
    ["Travellers", b.passengers],
    ["Pickup", b.pickup_location],
    ["Destination", b.destination],
    ["Special requirements", b.special_requirements],
    ["Message", b.notes],
    ["Price", "Personalised quote to follow"],
  ].filter(([, value]) => value !== null && value !== "") as [
    string,
    string | number | null,
  ][];
}

export function bookingEmail(b: EmailBooking, recipient: "customer" | "admin") {
  const isCustomer = recipient === "customer";
  const heading = isCustomer
    ? "Your adventure starts here."
    : "A new journey to plan.";
  const intro = isCustomer
    ? `Hi ${b.customer_name}, thank you for choosing RA2. We've received your booking request and will be in touch to confirm availability and prepare your personalised quote.`
    : `A booking request has been received through the RA2 website. Please contact ${b.customer_name} to discuss availability, the itinerary and a quote.`;
  const disclaimer =
    "This email acknowledges your request. Your trip is confirmed once availability, pricing and arrangements are agreed with RA2.";
  const details = bookingDetails(b);
  const text = `${COMPANY}\n\n${heading}\n\n${intro}\n\n${details.map(([key, value]) => `${key}: ${value}`).join("\n")}\n\n${disclaimer}\n\n${EMAIL}\n${PHONE}\n10 Kestel Street, Plumstead, Cape Town, South Africa\n${URL}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#faf9f6;font-family:Arial,sans-serif;color:#183d3c"><div style="max-width:600px;margin:24px auto;border:1px solid #dce4de;border-radius:20px;overflow:hidden;background:white"><div style="padding:30px;background:#2f4f4f;color:white"><a href="${URL}" style="color:white;text-decoration:none;font-size:27px;font-weight:bold">RA2<span style="color:#e3bf91">.</span> <span style="font-size:13px;letter-spacing:2px">TRAVEL &amp; TOURS</span></a><p style="margin:12px 0 0;color:#e3bf91;font-size:12px;letter-spacing:2px">YOUR JOURNEY. YOUR SOUTH AFRICA.</p></div><div style="padding:30px"><h1 style="font-size:28px;margin:0 0 16px">${heading}</h1><p style="font-size:15px;line-height:1.8;color:#5d706b">${escape(intro)}</p><table style="width:100%;border-collapse:collapse;margin:24px 0">${details.map(([key, value]) => `<tr><th scope="row" style="padding:12px 8px;border-bottom:1px solid #dce4de;text-align:left;vertical-align:top;color:#5d706b;font-size:12px;width:35%">${escape(key)}</th><td style="padding:12px 8px;border-bottom:1px solid #dce4de;font-size:14px;overflow-wrap:anywhere;white-space:pre-wrap">${escape(value)}</td></tr>`).join("")}</table><p style="font-size:13px;line-height:1.8;color:#5d706b">${escape(disclaimer)}</p><a href="${isCustomer ? `https://wa.me/27788158817?text=${encodeURIComponent(`Hi RA2, I'd like to discuss my booking request ${b.reference}.`)}` : `${URL}/admin/bookings`}" style="display:inline-block;padding:14px 22px;margin-top:12px;border-radius:30px;background:#926039;color:white;text-decoration:none;font-size:14px;font-weight:bold">${isCustomer ? "Chat to RA2 on WhatsApp" : "View bookings"}</a></div><div style="padding:22px 30px;background:#edf1ed;color:#5d706b;font-size:12px;line-height:1.8">${COMPANY}<br />10 Kestel Street, Plumstead, Cape Town, South Africa<br /><a href="mailto:${EMAIL}" style="color:#2f4f4f">${EMAIL}</a> · ${PHONE}</div></div></body></html>`;
  return {
    from:
      Deno.env.get("RESEND_FROM_EMAIL") ||
      `${COMPANY} <bookings@ra2travelandtours.co.za>`,
    to: [
      isCustomer
        ? b.customer_email
        : Deno.env.get("BOOKING_ADMIN_EMAIL") || EMAIL,
    ],
    reply_to: isCustomer ? EMAIL : b.customer_email,
    subject: isCustomer
      ? `Booking request received · ${b.reference} | ${COMPANY}`
      : `New booking received · ${b.reference} · ${b.service_name}`,
    html,
    text,
  };
}

export async function sendViaResend(
  payload: ReturnType<typeof bookingEmail>,
  key: string,
  idempotencyKey: string,
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt)
      await new Promise((resolve) => setTimeout(resolve, 900 * attempt));
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(8_000),
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        if (!data.id) throw new Error("provider_invalid_response");
        return data.id as string;
      }
      const rejection = await response.json().catch(() => ({}));
      const message =
        typeof rejection.message === "string" ? rejection.message : "";
      const code = /domain.*not verified|verify.*domain/i.test(message)
        ? "sender_domain_not_verified"
        : /only send testing emails|own email address/i.test(message)
          ? "test_sender_restricted"
          : response.status === 401 ||
              /api key is invalid|invalid api key/i.test(message)
            ? "invalid_api_key"
            : response.status === 403
              ? "sender_or_key_not_verified"
              : response.status === 429
                ? "provider_rate_limited"
                : "provider_rejected";
      if ((response.status === 429 || response.status >= 500) && attempt < 2)
        continue;
      throw new Error(code);
    } catch (error) {
      if (
        error instanceof Error &&
        ["TimeoutError", "AbortError", "TypeError"].includes(error.name) &&
        attempt < 2
      )
        continue;
      throw error;
    }
  }
  throw new Error("provider_unavailable");
}

/** Persistent delivery markers + a database lease + provider idempotency handle retries. */
export async function sendBookingEmails(
  db: SupabaseClient,
  booking: EmailBooking,
) {
  const statuses: Record<"customer" | "admin", string> = {
    customer: booking.customer_email_sent_at ? "sent" : "pending",
    admin: booking.admin_email_sent_at ? "sent" : "pending",
  };
  if (statuses.customer === "sent" && statuses.admin === "sent")
    return statuses;
  const { data: claimed, error: claimError } = await db.rpc(
    "claim_booking_emails",
    { p_booking_id: booking.id },
  );
  if (claimError || !claimed) return statuses;
  try {
    // Re-read after acquiring the lease; another invocation may have completed before us.
    const { data: current, error } = await db
      .from("bookings")
      .select("*")
      .eq("id", booking.id)
      .single();
    if (error) throw error;
    const key = Deno.env.get("RESEND_API_KEY");
    for (const recipient of ["customer", "admin"] as const) {
      if (current[`${recipient}_email_sent_at`]) {
        statuses[recipient] = "sent";
        continue;
      }
      try {
        if (!key) throw new Error("missing_api_key");
        const id = await sendViaResend(
          bookingEmail(current, recipient),
          key,
          `ra2-booking/${booking.id}/${recipient}`,
        );
        const { error: saveError } = await db
          .from("bookings")
          .update({
            [`${recipient}_email_sent_at`]: new Date().toISOString(),
            [`${recipient}_email_id`]: id,
            [`${recipient}_email_error`]: null,
          })
          .eq("id", booking.id);
        if (saveError) throw new Error("delivery_status_not_saved");
        statuses[recipient] = "sent";
        console.info("booking_email_sent", {
          reference: booking.reference,
          recipient,
          emailId: id,
        });
      } catch (error) {
        statuses[recipient] = "failed";
        const code =
          error instanceof Error && /^[a-z_]+$/.test(error.message)
            ? error.message
            : "provider_unavailable";
        await db
          .from("bookings")
          .update({ [`${recipient}_email_error`]: code })
          .eq("id", booking.id);
        console.error("booking_email_failed", {
          reference: booking.reference,
          recipient,
          code,
        });
      }
      // Space the two sends to respect the provider's default request rate.
      if (recipient === "customer")
        await new Promise((resolve) => setTimeout(resolve, 600));
    }
    return statuses;
  } finally {
    await db
      .from("bookings")
      .update({ email_claim_until: null })
      .eq("id", booking.id);
  }
}
