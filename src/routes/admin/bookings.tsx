import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Loader2,
  RefreshCw,
  Search,
  Calendar,
  Users,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  FileText,
  Trash2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type {
  BookingRow,
  BookingStatus,
  PaymentStatus,
} from "@/integrations/supabase/database.types";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

const STATUS_FILTERS: Array<{ value: "all" | BookingStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  confirmed: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
};

const paymentStyles: Record<PaymentStatus, string> = {
  unpaid: "bg-muted text-muted-foreground",
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  refunded: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  failed: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
};

function AdminBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<BookingRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BookingRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBookings((data as BookingRow[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const revenue = bookings
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + Number(b.total_zar ?? 0), 0);
    return { total, pending, confirmed, revenue };
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!q) return true;
      return (
        b.reference?.toLowerCase().includes(q) ||
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_email.toLowerCase().includes(q) ||
        b.customer_phone.toLowerCase().includes(q) ||
        b.service_name.toLowerCase().includes(q)
      );
    });
  }, [bookings, filter, query]);

  const updateBooking = async (id: string, patch: Partial<BookingRow>) => {
    const { error } = await (supabase.from("bookings") as any)
      .update(patch)
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
    if (selected?.id === id) setSelected((s) => (s ? { ...s, ...patch } : s));
    toast.success("Booking updated");
  };

  const deleteBooking = async (b: BookingRow) => {
    setDeleting(true);
    const { error } = await supabase.from("bookings").delete().eq("id", b.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBookings((prev) => prev.filter((x) => x.id !== b.id));
    if (selected?.id === b.id) setSelected(null);
    setConfirmDelete(null);
    toast.success(`Booking ${b.reference ?? ""} deleted`);
  };

  const exportCsv = () => {
    const rows = [
      [
        "Reference",
        "Created",
        "Customer",
        "Email",
        "Phone",
        "Service",
        "Pickup",
        "Destination",
        "Date",
        "Time",
        "Pax",
        "Total",
        "Status",
        "Payment",
      ],
      ...filtered.map((b) => [
        b.reference,
        b.created_at,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.service_name,
        b.pickup_location,
        b.destination ?? "",
        b.travel_date,
        b.travel_time ?? "",
        String(b.passengers),
        b.total_zar != null ? String(b.total_zar) : "",
        b.status,
        b.payment_status,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Manage every enquiry that comes in.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-secondary text-sm font-medium"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-secondary text-sm font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total bookings"
          value={stats.total}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Confirmed"
          value={stats.confirmed}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="Paid revenue"
          value={`R ${stats.revenue.toFixed(0)}`}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reference, name, email, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border outline-none focus:border-accent text-sm"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                  filter === f.value
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background border-border hover:border-accent/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading
            bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No bookings match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Reference</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Service</th>
                  <th className="text-left px-4 py-3">Travel</th>
                  <th className="text-left px-4 py-3">Pax</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-border hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {b.reference}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.customer_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.customer_email}
                      </div>
                    </td>
                    <td className="px-4 py-3">{b.service_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.travel_date}
                      {b.travel_time ? ` · ${b.travel_time.slice(0, 5)}` : ""}
                    </td>
                    <td className="px-4 py-3">{b.passengers}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.total_zar
                        ? `R ${Number(b.total_zar).toFixed(0)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[b.status]}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${paymentStyles[b.payment_status]}`}
                      >
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelected(b)}
                          className="px-2 py-1 rounded-md text-xs font-medium text-accent hover:bg-accent/10"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => setConfirmDelete(b)}
                          aria-label="Delete booking"
                          title="Delete booking"
                          className="p-1.5 rounded-md text-rose-600 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onUpdate={(patch) => updateBooking(selected.id, patch)}
          onDelete={() => setConfirmDelete(selected)}
        />
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={() => !deleting && setConfirmDelete(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-elegant"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-lg">Delete booking?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This permanently removes{" "}
              <span className="font-mono">{confirmDelete.reference}</span> for{" "}
              <span className="font-medium text-foreground">
                {confirmDelete.customer_name}
              </span>
              . This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-full border border-border text-sm hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteBooking(confirmDelete)}
                disabled={deleting}
                className="px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}{" "}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-accent">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-display font-bold">{value}</div>
    </div>
  );
}

function BookingDrawer({
  booking,
  onClose,
  onUpdate,
  onDelete,
}: {
  booking: BookingRow;
  onClose: () => void;
  onUpdate: (patch: Partial<BookingRow>) => void | Promise<void>;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(booking.admin_notes ?? "");
  const [sending, setSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    customer: string;
    admin: string;
  } | null>(null);

  const retryEmails = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-booking-emails",
        { body: { bookingId: booking.id } },
      );
      if (error || !data?.emails)
        throw new Error("Email retry failed. Check the Edge Function logs.");
      setEmailStatus(data.emails);
      if (data.emails.customer === "sent" && data.emails.admin === "sent")
        toast.success("Both booking emails have been sent.");
      else
        toast.warning(
          "Some emails are still pending. Check the delivery status and Edge Function logs.",
        );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't retry emails.",
      );
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    setNotes(booking.admin_notes ?? "");
    setEmailStatus(null);
  }, [booking.id, booking.admin_notes]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card h-full overflow-y-auto p-6 shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Reference
            </p>
            <h2 className="font-mono text-lg font-semibold">
              {booking.reference}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <Field label="Service" value={booking.service_name} />
          <Field label="Customer" value={booking.customer_name} />
          <Field
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            value={
              <a
                href={`mailto:${booking.customer_email}`}
                className="text-accent hover:underline"
              >
                {booking.customer_email}
              </a>
            }
          />
          <Field
            label="Phone"
            icon={<Phone className="h-4 w-4" />}
            value={
              <a
                href={`tel:${booking.customer_phone}`}
                className="text-accent hover:underline"
              >
                {booking.customer_phone}
              </a>
            }
          />
          <Field
            label="Pickup"
            icon={<MapPin className="h-4 w-4" />}
            value={booking.pickup_location}
          />
          {booking.destination && (
            <Field
              label="Destination"
              icon={<MapPin className="h-4 w-4" />}
              value={booking.destination}
            />
          )}
          <Field
            label="When"
            icon={<Calendar className="h-4 w-4" />}
            value={`${booking.travel_date}${booking.travel_time ? " at " + booking.travel_time.slice(0, 5) : ""}`}
          />
          <Field
            label="Passengers"
            icon={<Users className="h-4 w-4" />}
            value={String(booking.passengers)}
          />
          {booking.notes && (
            <Field label="Customer notes" value={booking.notes} />
          )}
          {booking.special_requirements && (
            <Field
              label="Special requirements"
              value={booking.special_requirements}
            />
          )}
          {booking.total_zar != null && (
            <Field
              label="Total"
              value={`R ${Number(booking.total_zar).toFixed(2)}`}
            />
          )}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
          <h3 className="font-semibold">Booking emails</h3>
          <p className="mt-2">
            Customer:{" "}
            {emailStatus?.customer ??
              (booking.customer_email_sent_at
                ? "sent"
                : booking.customer_email_error
                  ? "failed"
                  : "pending")}
          </p>
          <p className="mt-1">
            Admin:{" "}
            {emailStatus?.admin ??
              (booking.admin_email_sent_at
                ? "sent"
                : booking.admin_email_error
                  ? "failed"
                  : "pending")}
          </p>
          {(booking.customer_email_error || booking.admin_email_error) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Last error:{" "}
              {booking.customer_email_error || booking.admin_email_error}
            </p>
          )}
          <button
            type="button"
            onClick={retryEmails}
            disabled={sending}
            className="mt-3 inline-flex items-center gap-2 text-accent font-semibold disabled:opacity-50"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}Retry
            pending emails
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Status
            </label>
            <select
              value={booking.status}
              onChange={(e) =>
                onUpdate({ status: e.target.value as BookingStatus })
              }
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
            >
              {(
                [
                  "pending",
                  "confirmed",
                  "completed",
                  "cancelled",
                ] as BookingStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Payment
            </label>
            <select
              value={booking.payment_status}
              onChange={(e) =>
                onUpdate({ payment_status: e.target.value as PaymentStatus })
              }
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
            >
              {(
                ["unpaid", "paid", "refunded", "failed"] as PaymentStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Admin notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
            placeholder="Internal notes only the team sees..."
          />
          <button
            onClick={() => onUpdate({ admin_notes: notes })}
            className="mt-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold"
          >
            Save notes
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Created {new Date(booking.created_at).toLocaleString()}
          </p>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:bg-rose-500/10 px-3 py-1.5 rounded-md"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}
