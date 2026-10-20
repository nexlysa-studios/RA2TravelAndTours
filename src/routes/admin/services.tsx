import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, RefreshCw, Save, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceRow } from "@/integrations/supabase/database.types";

export const Route = createFileRoute("/admin/services")({
  component: AdminServices,
});

function AdminServices() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<ServiceRow>>>({});

  const load = async () => {
    setLoading(true);
    // Admin needs to see inactive services too — go through service-side select.
    // Anon policy hides is_active=false rows; admins bypass via has_role policy.
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setServices((data as ServiceRow[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const setDraft = (id: string, patch: Partial<ServiceRow>) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  const save = async (s: ServiceRow) => {
    const patch = drafts[s.id];
    if (!patch || Object.keys(patch).length === 0) {
      toast.message("No changes");
      return;
    }
    setSavingId(s.id);
    const { error } = await (supabase.from("services") as any).update(patch).eq("id", s.id);
    setSavingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, ...patch } : x)));
    setDrafts((d) => {
      const n = { ...d };
      delete n[s.id];
      return n;
    });
    toast.success("Service updated");
  };

  const toggleActive = async (s: ServiceRow) => {
    const next = !s.is_active;
    const { error } = await (supabase.from("services") as any).update({ is_active: next }).eq("id", s.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, is_active: next } : x)));
    toast.success(next ? "Service activated" : "Service deactivated");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">Edit pricing, descriptions and availability.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-secondary text-sm font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading services...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {services.map((s) => {
            const d = drafts[s.id] ?? {};
            const merged = { ...s, ...d };
            const dirty = Object.keys(d).length > 0;
            return (
              <div key={s.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display font-semibold text-lg">{s.name}</h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                        {s.category.replace("_", " ")}
                      </span>
                      {!s.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{s.slug}</p>
                  </div>
                  <button
                    onClick={() => toggleActive(s)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
                      s.is_active
                        ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                        : "border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                    }`}
                  >
                    {s.is_active ? <><Power className="h-3 w-3" /> Active</> : <><PowerOff className="h-3 w-3" /> Inactive</>}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Display name"
                    value={merged.name}
                    onChange={(v) => setDraft(s.id, { name: v })}
                  />
                  <Input
                    label="Duration"
                    value={merged.duration ?? ""}
                    onChange={(v) => setDraft(s.id, { duration: v })}
                  />
                  <Input
                    label="Price (ZAR)"
                    type="number"
                    value={merged.price_zar == null ? "" : String(merged.price_zar)}
                    onChange={(v) => setDraft(s.id, { price_zar: v === "" ? null : Number(v) })}
                  />
                  <Input
                    label="Max passengers"
                    type="number"
                    value={merged.max_pax == null ? "" : String(merged.max_pax)}
                    onChange={(v) => setDraft(s.id, { max_pax: v === "" ? null : Number(v) })}
                  />
                  <Input
                    label="Sort order"
                    type="number"
                    value={String(merged.sort_order)}
                    onChange={(v) => setDraft(s.id, { sort_order: Number(v) || 0 })}
                  />
                  <Input
                    label="Price note"
                    value={merged.price_note ?? ""}
                    onChange={(v) => setDraft(s.id, { price_note: v })}
                  />
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Description</label>
                    <textarea
                      value={merged.description ?? ""}
                      onChange={(e) => setDraft(s.id, { description: e.target.value })}
                      rows={3}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => save(s)}
                    disabled={!dirty || savingId === s.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold disabled:opacity-50"
                  >
                    {savingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save changes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Input({
  label, value, onChange, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
      />
    </div>
  );
}
