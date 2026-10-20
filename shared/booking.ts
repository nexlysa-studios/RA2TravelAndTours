export type BookingRequest = {
  requestId: string;
  serviceSlug: string;
  name: string;
  email: string;
  phone: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  specialRequirements: string;
  notes: string;
};

export class BookingValidationError extends Error {}

export function southAfricaToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Shared by the browser and Edge Function; the server always validates again. */
export function parseBookingRequest(
  input: unknown,
  today = southAfricaToday(),
): BookingRequest {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new BookingValidationError("Please check your booking details.");
  const value = input as Record<string, unknown>;
  const str = (
    key: string,
    label: string,
    min: number,
    max: number,
  ): string => {
    const raw = value[key] ?? "";
    if (typeof raw !== "string")
      throw new BookingValidationError(`Please check ${label}.`);
    const text = raw.trim();
    if (
      text.length < min ||
      text.length > max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)
    )
      throw new BookingValidationError(
        `${label} must be ${min ? `${min}–${max}` : `at most ${max}`} characters.`,
      );
    return text;
  };
  if (value.website)
    throw new BookingValidationError(
      "Unable to submit this request. Please contact RA2 on WhatsApp.",
    );
  const requestId = str("requestId", "Request ID", 36, 36);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      requestId,
    )
  )
    throw new BookingValidationError("Please refresh and try again.");
  const serviceSlug = str("serviceSlug", "Service", 2, 100);
  if (!/^[a-z0-9-]+$/.test(serviceSlug))
    throw new BookingValidationError("Please choose a service.");
  const name = str("name", "Name", 2, 80);
  const email = str("email", "Email", 3, 120).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))
    throw new BookingValidationError("Please enter a valid email address.");
  const phone = str("phone", "Phone / WhatsApp", 6, 30);
  if (!/^\+?[\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 6)
    throw new BookingValidationError(
      "Please enter a valid phone number, including your country code.",
    );
  const date = str("date", "Travel date", 10, 10);
  const parsedDate = new Date(`${date}T12:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date ||
    date < today
  )
    throw new BookingValidationError(
      "Please choose today or a future travel date.",
    );
  const time = str("time", "Time", 0, 5);
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw new BookingValidationError("Please enter a valid pickup time.");
  const passengers =
    typeof value.passengers === "string"
      ? Number(value.passengers)
      : value.passengers;
  if (
    typeof passengers !== "number" ||
    !Number.isInteger(passengers) ||
    passengers < 1 ||
    passengers > 30
  )
    throw new BookingValidationError(
      "Choose 1–30 travellers. For larger groups, please WhatsApp RA2.",
    );
  return {
    requestId,
    serviceSlug,
    name,
    email,
    phone,
    date,
    time,
    passengers,
    pickup: str("pickup", "Pickup location", 2, 120),
    destination: str("destination", "Destination", 0, 120),
    specialRequirements: str(
      "specialRequirements",
      "Special requirements",
      0,
      800,
    ),
    notes: str("notes", "Message", 0, 800),
  };
}

export function bookingWhatsAppMessage(
  reference: string,
  serviceName: string,
  b: BookingRequest,
) {
  return [
    `Hi RA2 Travel & Tours, I've submitted a booking request (${reference}).`,
    "",
    `Service: ${serviceName}`,
    `Name: ${b.name}`,
    `Email: ${b.email}`,
    `Phone / WhatsApp: ${b.phone}`,
    `Travel date: ${b.date}`,
    b.time ? `Pickup time: ${b.time} (South Africa)` : "",
    `Travellers: ${b.passengers}`,
    `Pickup: ${b.pickup}`,
    b.destination ? `Destination: ${b.destination}` : "",
    b.specialRequirements
      ? `Special requirements: ${b.specialRequirements}`
      : "",
    b.notes ? `Message: ${b.notes}` : "",
    "Please help me confirm availability and a personalised quote.",
  ]
    .filter(Boolean)
    .join("\n");
}
