"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "UTC",
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];

const PROJECT_STATUSES = ["Discovery", "Build", "Review", "Live"];

const WEEK_STARTS = ["Sunday", "Monday"];

const DEFAULTS = {
  timezone: "America/New_York",
  currency: "USD",
  defaultProjectStatus: "Discovery",
  weekStartsOn: "Monday",
} as const;

type Settings = typeof DEFAULTS;

function escapeCsvCell(val: string | number | undefined): string {
  if (val === undefined || val === null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function isInCurrentMonth(isoDate: string | undefined, yyyy: number, mm: number): boolean {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}/.test(isoDate)) return false;
  const [y, m] = isoDate.slice(0, 7).split("-").map(Number);
  return y === yyyy && m === mm;
}

function dueInCurrentMonth(due: string, yyyy: number, mm: number): boolean {
  if (!due || due === "—") return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(due.trim());
  if (m) {
    const [, y, mo] = m.map(Number);
    return y === yyyy && mo === mm;
  }
  const monthNames: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  const short = /^([a-zA-Z]{3})\s*(\d+)/.exec(due);
  if (!short) return false;
  const mo = monthNames[short[1].toLowerCase()];
  return mo === mm;
}

function inputClass() {
  return [
    "w-full rounded-xl border border-border/70 bg-card px-3",
    "h-11 sm:h-10",
    "text-base sm:text-sm",
    "leading-none",
    "text-foreground placeholder:text-muted-foreground",
    "outline-none focus:ring-2 focus:ring-ring/15",
  ].join(" ");
}

export default function SettingsPage() {
  const [user, setUser] = useState<{ name: string | null; email: string; role?: string } | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [draft, setDraft] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { credentials: "include", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || (res.status === 401 ? "Please sign in to view settings." : "Failed to load settings");
        throw new Error(msg);
      }
      setUser(data.user);
      const s = data.settings ?? DEFAULTS;
      setSettings(s);
      setDraft(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const dirty =
    draft.timezone !== settings.timezone ||
    draft.currency !== settings.currency ||
    draft.defaultProjectStatus !== settings.defaultProjectStatus ||
    draft.weekStartsOn !== settings.weekStartsOn;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSettings(draft);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [draft]);

  const handleReset = useCallback(() => {
    setDraft(DEFAULTS);
  }, []);

  const handleExportCsv = useCallback(async () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = now.getMonth() + 1;

    let clients: Array<{ name: string; status: string; email?: string; lastContact?: string; nextAction?: string; notes?: string; createdAt: string; updatedAt: string }> = [];
    let projects: Array<{ name: string; client: string; pricingType: string; amount: number; hoursInvested?: number; status: string; due: string; next: string }> = [];
    let invoices: Array<{ client: string; project?: string; amount: number; status: string; issuedOn?: string; dueOn?: string; paidOn?: string; notes?: string }> = [];
    try {
      const [clientsRes, projectsRes, invoicesRes] = await Promise.all([
        fetch("/api/clients", { credentials: "include" }),
        fetch("/api/projects", { credentials: "include" }),
        fetch("/api/invoices", { credentials: "include" }),
      ]);
      if (clientsRes.ok) clients = await clientsRes.json();
      if (projectsRes.ok) projects = await projectsRes.json();
      if (invoicesRes.ok) invoices = await invoicesRes.json();
    } catch {
      // fallback to empty
    }
    clients = clients.filter(
      (c) =>
        isInCurrentMonth(c.createdAt, yyyy, mm) ||
        isInCurrentMonth(c.updatedAt, yyyy, mm) ||
        isInCurrentMonth(c.lastContact, yyyy, mm)
    );

    projects = projects.filter((p) => dueInCurrentMonth(p.due, yyyy, mm));

    invoices = invoices.filter(
      (i) =>
        isInCurrentMonth(i.issuedOn, yyyy, mm) ||
        isInCurrentMonth(i.dueOn, yyyy, mm) ||
        isInCurrentMonth(i.paidOn, yyyy, mm)
    );

    const revenueProjects = projects;

    const rows: string[] = [];
    rows.push("CLIENTS");
    rows.push("Name,Status,Email,Last Contact,Next Action,Notes");
    clients.forEach((c) => {
      rows.push([c.name, c.status, c.email ?? "", c.lastContact ?? "", c.nextAction ?? "", c.notes ?? ""].map(escapeCsvCell).join(","));
    });
    rows.push("");

    rows.push("PROJECTS");
    rows.push("Name,Client,Pricing Type,Amount,Hours Invested,Status,Due,Next");
    revenueProjects.forEach((p: { name: string; client: string; pricingType: string; amount: number; hoursInvested?: number; status: string; due: string; next: string }) => {
      rows.push([p.name, p.client, p.pricingType, p.amount, p.hoursInvested ?? "", p.status, p.due, p.next].map(escapeCsvCell).join(","));
    });
    rows.push("");

    rows.push("BILLING");
    rows.push("Client,Project,Amount,Status,Issued On,Due On,Paid On,Notes");
    invoices.forEach((i: { client: string; project?: string; amount: number; status: string; issuedOn?: string; dueOn?: string; paidOn?: string; notes?: string }) => {
      rows.push([i.client, i.project ?? "", i.amount, i.status, i.issuedOn ?? "", i.dueOn ?? "", i.paidOn ?? "", i.notes ?? ""].map(escapeCsvCell).join(","));
    });
    rows.push("");

    rows.push("REVENUE");
    rows.push("Name,Client,Pricing Type,Amount,Hours Invested,Status,Due");
    revenueProjects.forEach((p) => {
      rows.push([p.name, p.client, p.pricingType, p.amount, p.hoursInvested ?? "", p.status, p.due].map(escapeCsvCell).join(","));
    });

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientops-export-${yyyy}-${String(mm).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 animate-pulse rounded bg-surface" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-xl bg-surface lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-xl bg-surface" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(error || success) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            success
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {success ? "Settings saved." : error}
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent/70" />
            Settings
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure preferences and workspace defaults.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={!dirty}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!dirty || saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="text-sm font-semibold tracking-tight">Workspace</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Defaults for how you track clients and projects.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <label className="text-xs font-medium text-muted-foreground">
                Timezone
              </label>
              <select
                className={`${inputClass()} mt-2`}
                value={draft.timezone}
                onChange={(e) => setDraft((s) => ({ ...s, timezone: e.target.value }))}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-muted-foreground">
                Used for dates, reminders, and due times.
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <label className="text-xs font-medium text-muted-foreground">
                Currency
              </label>
              <select
                className={`${inputClass()} mt-2`}
                value={draft.currency}
                onChange={(e) => setDraft((s) => ({ ...s, currency: e.target.value }))}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-muted-foreground">
                Used for invoices and estimates.
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <label className="text-xs font-medium text-muted-foreground">
                Default project status
              </label>
              <select
                className={`${inputClass()} mt-2`}
                value={draft.defaultProjectStatus}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, defaultProjectStatus: e.target.value }))
                }
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-muted-foreground">
                New projects start here unless changed.
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <label className="text-xs font-medium text-muted-foreground">
                Week starts on
              </label>
              <select
                className={`${inputClass()} mt-2`}
                value={draft.weekStartsOn}
                onChange={(e) => setDraft((s) => ({ ...s, weekStartsOn: e.target.value }))}
              >
                {WEEK_STARTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-muted-foreground">
                Affects weekly planning views (later).
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold tracking-tight">Account</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Basic profile and preferences.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Profile
              </div>
              <div className="mt-2 text-sm font-medium">
                {user?.name || user?.email || "—"}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {user?.email}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {user?.role
                  ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} • ${["owner", "admin"].includes(user.role) ? "Full access" : "Member access"}`
                  : "Owner • Full access"}
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Notifications
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Email reminders and weekly summaries (coming soon).
              </div>
              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-border/60">
                  Email
                </span>
                <span className="inline-flex items-center rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-border/60">
                  Weekly
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Data
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Export current month data as CSV.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={handleExportCsv}>
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
