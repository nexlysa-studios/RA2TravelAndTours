import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

type BookingFormValues = Omit<BookingRequest, "requestId">;

const BOOKING_STEPS = [
  { question: "What would you like to experience?", caption: "Choose your trip." },
  { question: "When are you travelling?", caption: "Choose your preferred date." },
  { question: "How many people are travelling?", caption: "We’ll help find the right fit." },
  { question: "Where should we pick you up?", caption: "An airport, hotel or address is perfect." },
  {
    question: "Where would you like to go?",
    caption: "You can skip this if you haven't decided yet.",
  },
  { question: "What name should we use?", caption: "So we know who we're planning this trip for." },
  { question: "What's your email address?", caption: "We'll send your personalised quote here." },
  {
    question: "What's the best number to reach you on?",
    caption: "A WhatsApp number works great too.",
  },
  { question: "What time works for you?", caption: "This is optional; South Africa time (UTC+2)." },
  {
    question: "Any special requests?",
    caption: "Child seats, accessibility needs or luggage details are helpful. This is optional.",
  },
  {
    question: "Anything else about your trip?",
    caption:
      "Share flight details, interests or anything else you'd like us to know. This is optional.",
  },
] as const;

export default function Booking({ defaultService = "" }: { defaultService?: string }) {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState(false);
  const [answers, setAnswers] = useState<BookingFormValues>({
    serviceSlug: defaultService,
    name: "",
    email: "",
    phone: "",
    pickup: "",
    destination: "",
    date: "",
    time: "",
    passengers: 2,
    specialRequirements: "",
    notes: "",
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [stepDirection, setStepDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [formError, setFormError] = useState("");
  const [reload, setReload] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
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
      const requested = new URL(window.location.href).searchParams.get("service");
      if (requested) setAnswers((current) => ({ ...current, serviceSlug: requested }));
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
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
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
      throw new Error(data?.error || "We couldn't save this request. Please try again.");
    return {
      request,
      reference: data.reference,
      serviceName: data.serviceName,
      emails: data.emails || { customer: "pending", admin: "pending" },
    } as Receipt;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentStep < BOOKING_STEPS.length - 1) {
      setStepDirection(1);
      setCurrentStep((step) => step + 1);
      setFormError("");
      return;
    }
    if (inFlight.current) return;
    const raw = {
      ...answers,
      website: new FormData(event.currentTarget).get("website"),
    };
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
      setFormError(error instanceof Error ? error.message : "Please check your details.");
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
      setFormError(error instanceof Error ? error.message : "Please try again or WhatsApp RA2.");
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
      setFormError("Your booking is safe. Please try again shortly or contact RA2 on WhatsApp.");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const input =
    "w-full px-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition text-foreground placeholder:text-muted-foreground/70 disabled:opacity-60";
  const label = "text-sm font-semibold text-foreground mb-2 block";
  const updateAnswer = <K extends keyof BookingFormValues>(key: K, value: BookingFormValues[K]) =>
    setAnswers((current) => ({ ...current, [key]: value }));

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
            Tell us what you want to experience and we'll help create the perfect itinerary for you.
          </p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Every journey is personal. We'll confirm availability and send a quote based on your
            dates, group and preferences.
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
                <div className="text-sm text-white/75">Available 24/7 for enquiries</div>
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
              <span className="text-sm font-semibold break-all">{SITE.email}</span>
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
                Your request has been saved. Our team will be in touch to confirm availability and
                your personalised quote.
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
                  {receipt.request.time ? ` at ${receipt.request.time} (South Africa)` : ""} ·{" "}
                  {receipt.request.passengers} travellers
                </p>
                <p className="text-muted-foreground">Pickup: {receipt.request.pickup}</p>
              </div>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                {receipt.emails.customer === "sent" ? (
                  <>
                    A confirmation of your request has been sent to{" "}
                    <strong className="text-foreground break-all">{receipt.request.email}</strong>.
                    Please check your spam folder too.
                  </>
                ) : (
                  "Your request is saved, but we couldn't send your email confirmation yet. You can retry below or share your details on WhatsApp."
                )}
              </p>
              <a
                href={whatsappLink(
                  bookingWhatsAppMessage(receipt.reference, receipt.serviceName, receipt.request),
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
                Optional: opens a ready-to-send message. You choose when to send it.
              </p>
              {(receipt.emails.customer !== "sent" || receipt.emails.admin !== "sent") && (
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
              ref={formRef}
              onSubmit={onSubmit}
              aria-label="Request a booking"
              aria-busy={submitting}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
            >
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    Request a quote
                  </span>
                  <span
                    className="text-sm font-medium text-muted-foreground"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    Step {currentStep + 1} of {BOOKING_STEPS.length}
                  </span>
                </div>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-label="Quote request progress"
                  aria-valuemin={1}
                  aria-valuemax={BOOKING_STEPS.length}
                  aria-valuenow={currentStep + 1}
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-ocean"
                    animate={{
                      width: `${((currentStep + 1) / BOOKING_STEPS.length) * 100}%`,
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: stepDirection * 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: stepDirection * -18 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="min-h-[320px] py-8 sm:py-10"
                    onAnimationComplete={() => {
                      if (currentStep > 0) questionRef.current?.focus({ preventScroll: true });
                    }}
                  >
                    <h3
                      ref={questionRef}
                      id="booking-question"
                      tabIndex={-1}
                      className="font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
                    >
                      {BOOKING_STEPS[currentStep].question}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {BOOKING_STEPS[currentStep].caption}
                    </p>

                    <fieldset
                      disabled={submitting}
                      aria-labelledby="booking-question"
                      className="mt-7 grid grid-cols-1 gap-5"
                    >
                      {currentStep === 0 && (
                        <div>
                          <label htmlFor="booking-service" className={label}>
                            Tour or service
                          </label>
                          <select
                            id="booking-service"
                            name="serviceSlug"
                            required
                            className={input}
                            value={answers.serviceSlug}
                            onChange={(event) => updateAnswer("serviceSlug", event.target.value)}
                            disabled={loadingServices || serviceError}
                          >
                            <option value="" disabled>
                              {loadingServices
                                ? "Loading experiences…"
                                : serviceError
                                  ? "Services unavailable"
                                  : "Choose your experience"}
                            </option>
                            {services.map((service) => (
                              <option key={service.id} value={service.slug}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                          {serviceError && (
                            <div role="alert" className="mt-4 rounded-xl bg-secondary p-4 text-sm">
                              <p>
                                We couldn't load experiences. You can still request a quote on{" "}
                                <a
                                  className="font-semibold underline"
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
                        </div>
                      )}

                      {currentStep === 1 && (
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
                            value={answers.date}
                            onChange={(event) => updateAnswer("date", event.target.value)}
                            className={input}
                          />
                        </div>
                      )}

                      {currentStep === 2 && (
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
                            value={answers.passengers}
                            onChange={(event) =>
                              updateAnswer("passengers", Number(event.target.value))
                            }
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
                      )}

                      {currentStep === 3 && (
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
                            autoComplete="street-address"
                            value={answers.pickup}
                            onChange={(event) => updateAnswer("pickup", event.target.value)}
                            className={input}
                            placeholder="Airport, hotel or address"
                          />
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div>
                          <label htmlFor="booking-destination" className={label}>
                            Destination{" "}
                            <span className="font-normal text-muted-foreground">(optional)</span>
                          </label>
                          <input
                            id="booking-destination"
                            name="destination"
                            maxLength={120}
                            value={answers.destination}
                            onChange={(event) => updateAnswer("destination", event.target.value)}
                            className={input}
                            placeholder="Where would you like to go?"
                          />
                        </div>
                      )}

                      {currentStep === 5 && (
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
                            value={answers.name}
                            onChange={(event) => updateAnswer("name", event.target.value)}
                            className={input}
                            placeholder="Your full name"
                          />
                        </div>
                      )}

                      {currentStep === 6 && (
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
                            value={answers.email}
                            onChange={(event) => updateAnswer("email", event.target.value)}
                            className={input}
                            placeholder="you@example.com"
                          />
                        </div>
                      )}

                      {currentStep === 7 && (
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
                            value={answers.phone}
                            onChange={(event) => updateAnswer("phone", event.target.value)}
                            className={input}
                            placeholder="+27 …"
                          />
                        </div>
                      )}

                      {currentStep === 8 && (
                        <div>
                          <label htmlFor="booking-time" className={label}>
                            Pickup time{" "}
                            <span className="font-normal text-muted-foreground">(optional)</span>
                          </label>
                          <input
                            id="booking-time"
                            name="time"
                            type="time"
                            value={answers.time}
                            onChange={(event) => updateAnswer("time", event.target.value)}
                            className={input}
                          />
                        </div>
                      )}

                      {currentStep === 9 && (
                        <div>
                          <label htmlFor="booking-requirements" className={label}>
                            Special requirements or trip details{" "}
                            <span className="font-normal text-muted-foreground">(optional)</span>
                          </label>
                          <textarea
                            id="booking-requirements"
                            name="specialRequirements"
                            maxLength={800}
                            rows={4}
                            value={answers.specialRequirements}
                            onChange={(event) =>
                              updateAnswer("specialRequirements", event.target.value)
                            }
                            className={input}
                            placeholder="Child seats, accessibility needs, luggage, flight number, interests…"
                          />
                        </div>
                      )}

                      {currentStep === 10 && (
                        <div>
                          <label htmlFor="booking-notes" className={label}>
                            Tell us about your trip{" "}
                            <span className="font-normal text-muted-foreground">(optional)</span>
                          </label>
                          <textarea
                            id="booking-notes"
                            name="notes"
                            maxLength={800}
                            rows={4}
                            value={answers.notes}
                            onChange={(event) => updateAnswer("notes", event.target.value)}
                            className={input}
                            placeholder="Your interests, flight number, preferred activities…"
                          />
                        </div>
                      )}
                    </fieldset>
                  </motion.div>
                </AnimatePresence>

                <div hidden aria-hidden="true">
                  <label htmlFor="booking-website">Website</label>
                  <input id="booking-website" name="website" autoComplete="off" tabIndex={-1} />
                </div>
                {formError && (
                  <p
                    role="alert"
                    className="mb-4 rounded-xl bg-destructive/5 p-4 text-sm text-destructive"
                  >
                    {formError}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
                  <button
                    type="button"
                    disabled={currentStep === 0 || submitting}
                    onClick={() => {
                      setStepDirection(-1);
                      setCurrentStep((step) => step - 1);
                      setFormError("");
                    }}
                    className="rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:invisible"
                  >
                    Back
                  </button>
                  {[4, 8, 9].includes(currentStep) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStepDirection(1);
                        setCurrentStep((step) => step + 1);
                      }}
                      className="rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    >
                      Skip
                    </button>
                  )}
                  {currentStep === BOOKING_STEPS.length - 1 && (
                    <button
                      type="button"
                      onClick={() => formRef.current?.requestSubmit()}
                      className="rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      (currentStep === 0 &&
                        (loadingServices ||
                          serviceError ||
                          !services.some((service) => service.slug === answers.serviceSlug)))
                    }
                    className="inline-flex min-w-36 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-semibold text-accent-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : currentStep === BOOKING_STEPS.length - 1 ? (
                      <>
                        <Send className="h-4 w-4" />
                        Request a Quote
                      </>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>
                <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
                  Your details are only used to respond to your enquiry and arrange your trip.
                  Availability and pricing are confirmed by our team.
                </p>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
