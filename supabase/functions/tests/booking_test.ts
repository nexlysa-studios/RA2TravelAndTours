import {
  parseBookingRequest,
  southAfricaToday,
  BookingValidationError,
  bookingWhatsAppMessage,
} from "../../../shared/booking.ts";
import {
  bookingEmail,
  sendViaResend,
  type EmailBooking,
} from "../_shared/emails.ts";

function assert(value: unknown, message = "Assertion failed"): asserts value {
  if (!value) throw new Error(message);
}
const request = {
  requestId: "eec238aa-647d-4372-874e-87c75e5f83cc",
  serviceSlug: "airport-transfer",
  name: "  Jane & John  ",
  email: "  JANE@example.com ",
  phone: "+27 78 815 8817",
  pickup: "Airport",
  destination: "Hotel",
  date: "2027-12-20",
  time: "08:30",
  passengers: "2",
  notes: "Flight RA2",
  specialRequirements: "Child seat",
};
const booking: EmailBooking = {
  id: "eec238aa-647d-4372-874e-87c75e5f83cc",
  reference: "RA2-261020-1234567890",
  service_name: "Private Airport Transfers",
  customer_name: "Jane <script>alert('x')</script>",
  customer_email: "jane@example.com",
  customer_phone: "+27788158817",
  pickup_location: "Airport & terminal",
  destination: "Hotel",
  travel_date: "2027-12-20",
  travel_time: "08:30:00",
  passengers: 2,
  special_requirements: "Child seat",
  notes: "Two bags",
  customer_email_sent_at: null,
  admin_email_sent_at: null,
};

Deno.test(
  "normalises shared booking input and rejects malformed dates, times and traveller counts",
  () => {
    const parsed = parseBookingRequest(request, "2026-10-20");
    assert(parsed.name === "Jane & John");
    assert(parsed.email === "jane@example.com");
    assert(parsed.passengers === 2);
    for (const patch of [
      { date: "2026-10-19" },
      { date: "2027-02-30" },
      { time: "25:00" },
      { passengers: "2.5" },
      { passengers: 31 },
      { email: "bad@address" },
      { requestId: "invented" },
      { website: "spam" },
      { phone: "abcdefg" },
      { serviceSlug: "../admin" },
    ]) {
      let rejected = false;
      try {
        parseBookingRequest({ ...request, ...patch }, "2026-10-20");
      } catch (error) {
        rejected = error instanceof BookingValidationError;
      }
      assert(rejected, `Expected rejection for ${JSON.stringify(patch)}`);
    }
  },
);

Deno.test(
  "travel dates follow South Africa across the UTC date boundary",
  () => {
    assert(southAfricaToday(new Date("2026-10-20T22:30:00Z")) === "2026-10-21");
    assert(southAfricaToday(new Date("2026-10-20T21:30:00Z")) === "2026-10-20");
  },
);

Deno.test(
  "WhatsApp message includes the reference, itinerary and special requirements",
  () => {
    const message = bookingWhatsAppMessage(
      booking.reference,
      booking.service_name,
      parseBookingRequest(request, "2026-10-20"),
    );
    for (const value of [
      booking.reference,
      booking.service_name,
      "Jane & John",
      "jane@example.com",
      "Airport",
      "Hotel",
      "2027-12-20",
      "08:30",
      "Child seat",
      "Flight RA2",
    ])
      assert(message.includes(value), value);
  },
);

Deno.test(
  "emails escape untrusted HTML and use the correct reply-to recipients",
  () => {
    const customer = bookingEmail(booking, "customer");
    const admin = bookingEmail(booking, "admin");
    assert(customer.reply_to === "rezah@ra2travelandtours.co.za");
    assert(admin.reply_to === booking.customer_email);
    assert(customer.to[0] === booking.customer_email);
    assert(!customer.html.includes("<script>"));
    assert(customer.html.includes("&lt;script&gt;"));
    assert(customer.html.includes("Airport &amp; terminal"));
    assert(customer.text.includes("Child seat"));
    assert(customer.html.includes("Personalised quote to follow"));
    assert(customer.text.includes("Your trip is confirmed once"));
  },
);

Deno.test(
  "Resend retries temporary failures with the same idempotency key",
  async () => {
    const original = globalThis.fetch;
    const keys: string[] = [];
    let calls = 0;
    globalThis.fetch = ((_input: unknown, init?: RequestInit) => {
      keys.push(new Headers(init?.headers).get("Idempotency-Key")!);
      calls++;
      return Promise.resolve(
        new Response(
          JSON.stringify(
            calls === 1 ? { message: "Busy" } : { id: "email-test-id" },
          ),
          { status: calls === 1 ? 429 : 200 },
        ),
      );
    }) as typeof fetch;
    try {
      const id = await sendViaResend(
        bookingEmail(booking, "customer"),
        "test-key",
        "test-idempotency",
      );
      assert(id === "email-test-id");
      assert(calls === 2);
      assert(keys.every((k) => k === "test-idempotency"));
    } finally {
      globalThis.fetch = original;
    }
  },
);

Deno.test(
  "a domain verification failure is actionable and is not retried",
  async () => {
    const original = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (() => {
      calls++;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            message: "The ra2travelandtours.co.za domain is not verified.",
          }),
          { status: 403 },
        ),
      );
    }) as typeof fetch;
    try {
      let code = "";
      try {
        await sendViaResend(
          bookingEmail(booking, "customer"),
          "test-key",
          "test-idempotency",
        );
      } catch (error) {
        code = (error as Error).message;
      }
      assert(code === "sender_domain_not_verified");
      assert(calls === 1);
    } finally {
      globalThis.fetch = original;
    }
  },
);
