import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search, Mail, Phone, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { BookingRow } from "@/integrations/supabase/database.types";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

interface CustomerAgg {
  email: string;
  name: string;
  phone: string;
  bookings: number;
  totalSpend: number;
  lastBooking: string;
  rows: BookingRow[];
}

function AdminCustomers() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const customers = useMemo<CustomerAgg[]>(() => {
    const map = new Map<string, CustomerAgg>();
    for (const b of bookings) {
      const key = b.customer_email.toLowerCase();
      const cur = map.get(key);
      if (cur) {
        cur.bookings += 1;
        cur.totalSpend += b.payment_status === "paid" ? Number(b.total_zar ?? 0) : 0;
        if (b.created_at > cur.lastBooking) {
          cur.lastBooking = b.created_at;
          cur.name = b.customer_name;
          cur.phone = b.customer_phone;
        }
        cur.rows.push(b);
      } else {
        map.set(key, {
          email: b.customer_email,
          name: b.customer_name,
          phone: b.customer_phone,
          bookings: 1,
          totalSpend: b.payment_status === "paid" ? Number(b.total_zar ?? 0) : 0,
          lastBooking: b.created_at,
          rows: [b],
        });
      }
    }
    return [...map.values()].sort((a, b) => b.lastBooking.localeCompare(a.lastBooking));
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q),
    );
  }, [customers, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">Everyone who's ever booked with you, with lifetime stats.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="Unique customers" value={customers.length} />
        <Stat label="Repeat customers" value={customers.filter((c) => c.bookings > 1).length} />
        <Stat
          label="Lifetime paid revenue"
          value={`R ${customers.reduce((s, c) => s + c.totalSpend, 0).toFixed(0)}`}
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border outline-none focus:border-accent text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading customers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No customers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Contact</th>
                  <th className="text-left px-4 py-3">Bookings</th>
                  <th className="text-left px-4 py-3">Paid spend</th>
                  <th className="text-left px-4 py-3">Last booking</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.email} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.name}</div>
                      {c.bookings > 1 && (
                        <span className="text-xs text-accent inline-flex items-center gap-1 mt-0.5">
                          <Users className="h-3 w-3" /> Repeat customer
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${c.email}`} className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {c.email}
                      </a>
                      <br />
                      <a href={`tel:${c.phone}`} className="text-xs text-muted-foreground hover:text-accent inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-semibold">{c.bookings}</td>
                    <td className="px-4 py-3 whitespace-nowrap">R {c.totalSpend.toFixed(0)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(c.lastBooking).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-display font-bold">{value}</div>
    </div>
  );
}
