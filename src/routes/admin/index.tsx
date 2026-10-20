import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Loader2, FileText, Clock, CheckCircle2, CreditCard, TrendingUp,
  Calendar, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { BookingRow } from "@/integrations/supabase/database.types";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const revenue = bookings
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + Number(b.total_zar ?? 0), 0);
    const potential = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + Number(b.total_zar ?? 0), 0);

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const thisMonth = bookings.filter((b) => {
      const d = new Date(b.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;

    const upcoming = bookings
      .filter((b) => b.status !== "cancelled" && new Date(b.travel_date) >= new Date(now.toDateString()))
      .sort((a, b) => a.travel_date.localeCompare(b.travel_date))
      .slice(0, 5);

    return { total, pending, confirmed, completed, revenue, potential, thisMonth, upcoming };
  }, [bookings]);

  const recent = bookings.slice(0, 5);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">A snapshot of your business at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total bookings" value={stats.total} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="This month" value={stats.thisMonth} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Pending" value={stats.pending} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Confirmed" value={stats.confirmed} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Paid revenue" value={`R ${stats.revenue.toFixed(0)}`} icon={<CreditCard className="h-5 w-5" />} />
        <StatCard label="Potential" value={`R ${stats.potential.toFixed(0)}`} icon={<CreditCard className="h-5 w-5" />} />
        <StatCard label="Upcoming trips" value={stats.upcoming.length} icon={<Calendar className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Recent bookings" linkTo="/admin/bookings" linkLabel="View all">
          {recent.length === 0 ? (
            <Empty text="No bookings yet." />
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((b) => (
                <li key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{b.customer_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {b.service_name} · <span className="font-mono">{b.reference}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground capitalize">
                    {b.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming trips" linkTo="/admin/bookings" linkLabel="Manage">
          {stats.upcoming.length === 0 ? (
            <Empty text="No upcoming trips scheduled." />
          ) : (
            <ul className="divide-y divide-border">
              {stats.upcoming.map((b) => (
                <li key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{b.customer_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{b.service_name}</div>
                  </div>
                  <div className="text-xs text-right whitespace-nowrap">
                    <div className="font-medium">{b.travel_date}</div>
                    {b.travel_time && <div className="text-muted-foreground">{b.travel_time.slice(0, 5)}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-accent">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-display font-bold">{value}</div>
    </div>
  );
}

function Panel({
  title, linkTo, linkLabel, children,
}: { title: string; linkTo: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display font-semibold text-lg">{title}</h2>
        <Link to={linkTo} className="text-xs text-accent hover:underline inline-flex items-center gap-1">
          {linkLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="py-6 text-center text-sm text-muted-foreground">{text}</div>;
}
