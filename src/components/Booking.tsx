import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Send,
  Mail,
  Phone,
  Loader2,
  MessageCircle,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { SITE, whatsappLink } from "@/data/site";
import {
  parseBookingRequest,
  southAfricaToday,
  bookingWhatsAppMessage,
  type BookingRequest,
} from "../../shared/booking";
import { Reveal } from "./Section";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceRow } from "@/integrations/supabase/database.types";

type Receipt = {
  request: BookingRequest;
  reference: string;
  serviceName: string;
  emails: { customer: string; admin: string };
};
export default function Booking({
  defaultService = "",
}: {
  defaultService?: string;
}) {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState(false);
  const [serviceSlug, setServiceSlug] = useState(defaultService);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [formError, setFormError] = useState("");
  const [reload, setReload] = useState(0);
  const receiptRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<{ signature: string; id: string } | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    setLoadingServices(true);
    setServiceError(false);
    Promise.resolve(
      supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .abortSignal(controller.signal),
    )
      .then(({ data, error }) => {
        window.clearTimeout(timeout);
        if (!active) return;
        if (error || !data?.length) setServiceError(true);
        else setServices(data);
        setLoadingServices(false);
      })
      .catch(() => {
        if (active) {
          setServiceError(true);
          setLoadingServices(false);
        }
      });
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [reload]);

  useEffect(() => {
    const readSelection = () => {
      const requested = new URL(window.location.href).searchParams.get(
        "service",
      );
      if (requested) setServiceSlug(requested);
    };
    readSelection();
    window.addEventListener("hashchange", readSelection);
    window.addEventListener("popstate", readSelection);
    return () => {
      window.removeEventListener("hashchange", readSelection);
      window.removeEventListener("popstate", readSelection);
    };
  }, []);

  useEffect(() => {
    if (!receipt) return;
    receiptRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });
    receiptRef.current?.focus({ preventScroll: true });
  }, [receipt]);

  const submit = async (request: BookingRequest) => {
    const { data, error } = await supabase.functions.invoke("create-booking", {
      body: request,
      signal: AbortSignal.timeout(65_000),
    });
    if (error) {
      const response = (error as { context?: unknown }).context;
      if (response instanceof Response) {
        const details = await response.json().catch(() => null);
        if (details?.error) throw new Error(details.error);
      }
      throw new Error(
        "We couldn't confirm your request. Please try again; your request ID prevents duplicates. You can also contact RA2 on WhatsApp.",
      );
    }
    if (!data?.saved || !data.reference)
      throw new Error(
        data?.error || "We couldn't save this request. Please try again.",
      );
    return {
      request,
      reference: data.reference,
      serviceName: data.serviceName,
      emails: data.emails || { customer: "pending", admin: "pending" },
    } as Receipt;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    // Reuse the same id after a network failure; different details create a new request.
    const signature = JSON.stringify(raw);
    if (requestRef.current?.signature !== signature)
      requestRef.current = { signature, id: crypto.randomUUID() };
    let request: BookingRequest;
    try {
      request = parseBookingRequest({
        ...raw,
        requestId: requestRef.current!.id,
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Please check your details.",
      );
      return;
    }
    if (!services.some((s) => s.slug === request.serviceSlug)) {
      setFormError("Please choose an available service.");
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setFormError("");
    try {
      const result = await submit(request);
      setReceipt(result);
      toast.success(`Request received. Your reference is ${result.reference}.`);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Please try again or WhatsApp RA2.",
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const retryEmail = async () => {
    if (!receipt || inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setFormError("");
    try {
      const result = await submit(receipt.request);
      setReceipt(result);
      if (result.emails.customer === "sent")
        toast.success("Your confirmation email is on its way.");
      else
        setFormError(
          "Your booking is safe. Email delivery is still unavailable; please share your details with RA2 on WhatsApp.",
        );
    } catch {
      setFormError(
        "Your booking is safe. Please try again shortly or contact RA2 on WhatsApp.",
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const input =
    "w-full px-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition text-foreground placeholder:text-muted-foreground/70 disabled:opacity-60";
  const label = "text-sm font-semibold text-foreground mb-2 block";
  return (
    <section id="book" className="py-24 lg:py-32 bg-secondary/60">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
        <Reveal className="lg:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Let's plan something special
          </span>
          <h2 className="mt-4 font-display font-semibold text-4xl lg:text-5xl leading-[1.1] text-foreground text-balance">
            Your South African adventure starts here.
          </h2>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
            Tell us what you want to experience and we'll help create the
            perfect itinerary for you.
          </p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Every journey is personal. We'll confirm availability and send a
            quote based on your dates, group and preferences.
          </p>
          <div className="mt-8 space-y-4">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-primary text-white hover:bg-primary/90 transition shadow-elegant"
            >
              <MessageCircle className="h-7 w-7 shrink-0" />
              <div>
                <div className="font-semibold">WhatsApp RA2</div>
                <div className="text-sm text-white/75">
                  Available 24/7 for enquiries
                </div>
              </div>
              <ArrowUpRight className="ml-auto h-5 w-5" />
            </a>
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-card transition"
            >
              <Phone className="h-5 w-5 text-accent shrink-0" />
              <span className="text-sm font-semibold">{SITE.phone}</span>
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-card transition"
            >
              <Mail className="h-5 w-5 text-accent shrink-0" />
              <span className="text-sm font-semibold break-all">
                {SITE.email}
              </span>
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{SITE.address}</p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          {receipt ? (
            <div
              ref={receiptRef}
              tabIndex={-1}
              role="status"
              className="rounded-3xl bg-card border border-border shadow-elegant p-6 sm:p-10 outline-none"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary grid place-items-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Request received
              </p>
              <h3 className="mt-3 font-display text-3xl font-semibold">
                Thank you, {receipt.request.name.split(" ")[0]}.
              </h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Your request has been saved. Our team will be in touch to
                confirm availability and your personalised quote.
              </p>
              <div className="mt-6 rounded-2xl bg-secondary/60 p-5 space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Your booking reference{" "}
                  <strong className="block mt-1 font-mono text-base text-primary break-all">
                    {receipt.reference}
                  </strong>
                </p>
                <p className="font-semibold">{receipt.serviceName}</p>
                <p>
                  {receipt.request.date}
                  {receipt.request.time
                    ? ` at ${receipt.request.time} (South Africa)`
                    : ""}{" "}
                  · {receipt.request.passengers} travellers
                </p>
                <p className="text-muted-foreground">
                  Pickup: {receipt.request.pickup}
                </p>
              </div>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                {receipt.emails.customer === "sent" ? (
                  <>
                    A confirmation of your request has been sent to{" "}
                    <strong className="text-foreground break-all">
                      {receipt.request.email}
                    </strong>
                    . Please check your spam folder too.
                  </>
                ) : (
                  "Your request is saved, but we couldn't send your email confirmation yet. You can retry below or share your details on WhatsApp."
                )}
              </p>
              <a
                href={whatsappLink(
                  bookingWhatsAppMessage(
                    receipt.reference,
                    receipt.serviceName,
                    receipt.request,
                  ),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-white font-semibold transition hover:bg-primary/90"
              >
                <MessageCircle className="h-5 w-5" />
                Send booking details on WhatsApp
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                Optional: opens a ready-to-send message. You choose when to send
                it.
              </p>
              {(receipt.emails.customer !== "sent" ||
                receipt.emails.admin !== "sent") && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={retryEmail}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Retry email confirmation
                </button>
              )}
              {formError && (
                <p role="alert" className="mt-4 text-sm text-destructive">
                  {formError}
                </p>
              )}
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setReceipt(null);
                  setFormError("");
                  requestRef.current = null;
                }}
                className="mt-6 block text-sm font-semibold underline underline-offset-4 text-muted-foreground"
              >
                Plan another experience
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              aria-label="Request a booking"
              aria-busy={submitting}
              className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-card border border-border shadow-elegant"
            >
              <h3 className="font-display text-2xl font-semibold">
                Request a Quote
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A few details, and we'll take it from here.
              </p>
              <fieldset
                disabled={submitting}
                className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <div>
                  <label htmlFor="booking-name" className={label}>
                    Full name
                  </label>
                  <input
                    id="booking-name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={80}
                    className={input}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="booking-email" className={label}>
                    Email address
                  </label>
                  <input
                    id="booking-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={120}
                    className={input}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="booking-phone" className={label}>
                    Phone / WhatsApp
                  </label>
                  <input
                    id="booking-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    minLength={6}
                    maxLength={30}
                    className={input}
                    placeholder="+27 …"
                  />
                </div>
                <div>
                  <label htmlFor="booking-service" className={label}>
                    Tour or service
                  </label>
                  <select
                    id="booking-service"
                    name="serviceSlug"
                    required
                    className={input}
                    value={
                      services.some((s) => s.slug === serviceSlug)
                        ? serviceSlug
                        : ""
                    }
                    onChange={(e) => setServiceSlug(e.target.value)}
                    disabled={loadingServices || serviceError}
                  >
                    <option value="" disabled>
                      {loadingServices
                        ? "Loading experiences…"
                        : serviceError
                          ? "Services unavailable"
                          : "Choose your experience"}
                    </option>
                    {services.map((s) => (
                      <option key={s.id} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                {serviceError && (
                  <div
                    role="alert"
                    className="md:col-span-2 rounded-xl bg-secondary p-4 text-sm"
                  >
                    <p>
                      We couldn't load experiences. You can still request a
                      quote on{" "}
                      <a
                        className="underline font-semibold"
                        href={whatsappLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                      .
                    </p>
                    <button
                      type="button"
                      onClick={() => setReload((n) => n + 1)}
                      className="mt-2 font-bold text-accent"
                    >
                      Try loading again
                    </button>
                  </div>
                )}
                <div>
                  <label htmlFor="booking-date" className={label}>
                    Preferred travel date
                  </label>
                  <input
                    id="booking-date"
                    name="date"
                    type="date"
                    min={southAfricaToday()}
                    required
                    className={input}
                  />
                </div>
                <div>
                  <label htmlFor="booking-time" className={label}>
                    Pickup time{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="booking-time"
                    name="time"
                    type="time"
                    className={input}
                    aria-describedby="booking-time-help"
                  />
                  <p
                    id="booking-time-help"
                    className="mt-1.5 text-xs text-muted-foreground"
                  >
                    South Africa time (UTC+2)
                  </p>
                </div>
                <div>
                  <label htmlFor="booking-pickup" className={label}>
                    Pickup location
                  </label>
                  <input
                    id="booking-pickup"
                    name="pickup"
                    required
                    minLength={2}
                    maxLength={120}
                    className={input}
                    placeholder="Airport, hotel or address"
                  />
                </div>
                <div>
                  <label htmlFor="booking-destination" className={label}>
                    Destination{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="booking-destination"
                    name="destination"
                    maxLength={120}
                    className={input}
                    placeholder="Where would you like to go?"
                  />
                </div>
                <div>
                  <label htmlFor="booking-passengers" className={label}>
                    Number of travellers
                  </label>
                  <input
                    id="booking-passengers"
                    name="passengers"
                    type="number"
                    min={1}
                    max={30}
                    required
                    defaultValue={2}
                    className={input}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    More than 30?{" "}
                    <a
                      href={whatsappLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Let's arrange your group on WhatsApp.
                    </a>
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="booking-requirements" className={label}>
                    Special requirements{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="booking-requirements"
                    name="specialRequirements"
                    maxLength={800}
                    rows={2}
                    className={input}
                    placeholder="Child seats, accessibility needs, luggage, dietary needs…"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="booking-notes" className={label}>
                    Tell us about your trip{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="booking-notes"
                    name="notes"
                    maxLength={800}
                    rows={3}
                    className={input}
                    placeholder="Your interests, flight number, preferred activities or anything you'd like us to know…"
                  />
                </div>
                <div hidden aria-hidden="true">
                  <label htmlFor="booking-website">Website</label>
                  <input
                    id="booking-website"
                    name="website"
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </div>
                {formError && (
                  <p
                    role="alert"
                    className="md:col-span-2 rounded-xl bg-destructive/5 p-4 text-sm text-destructive"
                  >
                    {formError}
                  </p>
                )}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting || loadingServices || serviceError}
                    className="w-full px-7 py-4 rounded-full bg-accent text-accent-foreground font-semibold hover:opacity-90 transition shadow-glow inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving your request…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Request a Quote
                      </>
                    )}
                  </button>
                  <p className="mt-4 text-xs text-center leading-relaxed text-muted-foreground">
                    We'll use these details to respond to your enquiry and
                    arrange your trip. Availability and pricing are confirmed by
                    our team.
                  </p>
                </div>
              </fieldset>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
