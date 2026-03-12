"use client";

import { useCallback } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { loadClients } from "@/app/lib/store";

// Seed data matching projects, billing, revenue pages (page-specific, no DB)
const SEED_PROJECTS = [
  { id: "p_clientops_mvp", name: "ClientOps MVP", client: "Internal", pricingType: "fixed" as const, amount: 10000, hoursInvested: 40, status: "Build" as const, due: "Mar 15", next: "Implement Clients table + detail" },
  { id: "p_portfolio_refresh", name: "Portfolio Refresh", client: "Chris Holland", pricingType: "fixed" as const, amount: 500, hoursInvested: 6, status: "Live" as const, due: "—", next: "Replace My Ledger with ClientOps" },
  { id: "p_oliver_refresh", name: "Oliver Site Refresh", client: "Oliver", pricingType: "hourly" as const, amount: 75, hoursInvested: 8, status: "Review" as const, due: "Mar 6", next: "Review final copy + deploy" },
  { id: "p_maintenance_retainer", name: "Maintenance Retainer", client: "ACME Co.", pricingType: "retainer" as const, amount: 600, hoursInvested: undefined, status: "Live" as const, due: "—", next: "Monthly updates + support" },
];

const SEED_INVOICES = [
  { id: "inv_oliver_001", client: "Oliver", project: "Site Refresh", amount: 500, status: "Sent" as const, issuedOn: "2026-03-01", dueOn: "2026-03-08", paidOn: "", notes: "Net 7." },
  { id: "inv_internal_001", client: "Internal", project: "ClientOps MVP", amount: 1000, status: "Draft" as const, issuedOn: "2026-03-02", dueOn: "2026-03-15", paidOn: "", notes: "Placeholder." },
  { id: "inv_portfolio_001", client: "Chris Holland", project: "Portfolio Refresh", amount: 500, status: "Paid" as const, issuedOn: "2026-02-20", dueOn: "2026-02-27", paidOn: "2026-02-22", notes: "Paid via transfer." },
];

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

export default function SettingsPage() {
  const handleExportCsv = useCallback(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = now.getMonth() + 1;

    const clients = loadClients().filter(
      (c) =>
        isInCurrentMonth(c.createdAt, yyyy, mm) ||
        isInCurrentMonth(c.updatedAt, yyyy, mm) ||
        isInCurrentMonth(c.lastContact, yyyy, mm)
    );

    const projects = SEED_PROJECTS.filter((p) => dueInCurrentMonth(p.due, yyyy, mm));

    const invoices = SEED_INVOICES.filter(
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
    revenueProjects.forEach((p) => {
      rows.push([p.name, p.client, p.pricingType, p.amount, p.hoursInvested ?? "", p.status, p.due, p.next].map(escapeCsvCell).join(","));
    });
    rows.push("");

    rows.push("BILLING");
    rows.push("Client,Project,Amount,Status,Issued On,Due On,Paid On,Notes");
    invoices.forEach((i) => {
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

  return (
    <div className="space-y-8">
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
          <Button href="#" variant="secondary">Reset</Button>
          <Button href="#" variant="primary">Save changes</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column: sections */}
        <Card className="lg:col-span-2">
          <div className="text-sm font-semibold tracking-tight">Workspace</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Defaults for how you track clients and projects.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Timezone
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                America/New_York
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Used for dates, reminders, and due times.
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Currency
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">USD</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Used for invoices and estimates.
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Default project status
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                Discovery
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                New projects start here unless changed.
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Week starts on
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                Monday
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Affects weekly planning views (later).
              </div>
            </div>
          </div>
        </Card>

        {/* Right column: account & actions */}
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
              <div className="mt-2 text-sm font-medium">Chris Holland</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Owner • Full access
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Notifications
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Email reminders and weekly summaries (later).
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
                Import/export and backups (later).
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={handleExportCsv}>Export CSV</Button>
                <Button href="#" variant="secondary">Backup</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-semibold tracking-tight">Roadmap</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Once the core workflow is solid, we’ll wire these panels to real settings
          stored in the database.
        </p>
      </Card>
    </div>
  );
}