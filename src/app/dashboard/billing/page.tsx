"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Drawer } from "@/app/components/ui/Drawer";
import { InvoiceEditor, type Invoice, type InvoiceStatus } from "@/app/components/billing/InvoiceEditor";
import { Filters, type InvoiceFilters, type SortByDue } from "@/app/components/billing/Filters";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function parseYMD(s?: string) {
  // Expect "YYYY-MM-DD"
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo, d));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function isOverdue(inv: Invoice, todayUTC: Date) {
  if (inv.status === "Paid") return false;
  const due = parseYMD(inv.dueOn);
  if (!due) return false;
  return due.getTime() < todayUTC.getTime();
}

function StatusPill({ status }: { status: InvoiceStatus }) {
  const cls =
    status === "Paid"
      ? "bg-accent/15 text-foreground"
      : status === "Sent"
        ? "bg-amber-500/15 text-foreground"
        : status === "Overdue"
          ? "bg-red-500/15 text-foreground"
          : "bg-surface text-muted-foreground";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function newInvoiceDraft(): Invoice {
  return {
    id: `inv_${Math.random().toString(36).slice(2, 10)}`,
    client: "",
    project: "",
    amount: 0,
    status: "Draft",
    issuedOn: "",
    dueOn: "",
    paidOn: "",
    notes: "",
  };
}

export default function BillingPage() {
  // Using UTC "today" to keep comparisons consistent in v0
  const todayUTC = useMemo(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }, []);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "inv_oliver_001",
      client: "Oliver",
      project: "Site Refresh",
      amount: 500,
      status: "Sent",
      issuedOn: "2026-03-01",
      dueOn: "2026-03-08",
      notes: "Net 7. Follow up if not paid by due date.",
    },
    {
      id: "inv_internal_001",
      client: "Internal",
      project: "ClientOps MVP",
      amount: 1000,
      status: "Draft",
      issuedOn: "2026-03-02",
      dueOn: "2026-03-15",
      notes: "Placeholder internal invoice record.",
    },
    {
      id: "inv_portfolio_001",
      client: "Chris Holland",
      project: "Portfolio Refresh",
      amount: 500,
      status: "Paid",
      issuedOn: "2026-02-20",
      dueOn: "2026-02-27",
      paidOn: "2026-02-22",
      notes: "Paid via transfer.",
    },
  ]);

  // Auto-tag overdue for display (does NOT mutate status)
  const decorated = useMemo(() => {
    return invoices.map((inv) => {
      const overdue = isOverdue(inv, todayUTC);
      return {
        ...inv,
        _displayStatus: overdue && inv.status !== "Paid" ? ("Overdue" as const) : inv.status,
      };
    });
  }, [invoices, todayUTC]);

  const stats = useMemo(() => {
    const outstanding = decorated
      .filter((i) => i._displayStatus !== "Paid")
      .reduce((sum, i) => sum + i.amount, 0);

    const overdue = decorated
      .filter((i) => i._displayStatus === "Overdue")
      .reduce((sum, i) => sum + i.amount, 0);

    // Collected "this month" (simple v0: match paidOn month to todayUTC month)
    const collected = decorated
      .filter((i) => i._displayStatus === "Paid")
      .filter((i) => {
        const p = parseYMD(i.paidOn);
        if (!p) return false;
        return (
          p.getUTCFullYear() === todayUTC.getUTCFullYear() &&
          p.getUTCMonth() === todayUTC.getUTCMonth()
        );
      })
      .reduce((sum, i) => sum + i.amount, 0);

    return { outstanding, overdue, collected };
  }, [decorated, todayUTC]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingInvoice = useMemo(() => {
    if (!editingId) return null;
    return invoices.find((i) => i.id === editingId) ?? null;
  }, [invoices, editingId]);

  const editorInvoice = editingInvoice ?? newInvoiceDraft();
  const isEdit = Boolean(editingInvoice);

  const [filters, setFilters] = useState<InvoiceFilters>({
    client: "",
    project: "",
    status: "",
    dueDate: "",
  });
  const [sortByDue, setSortByDue] = useState<SortByDue>(null);

  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...decorated];

    if (filters.client) {
      result = result.filter((i) => i.client === filters.client);
    }
    if (filters.project.trim()) {
      const q = filters.project.toLowerCase().trim();
      result = result.filter((i) =>
        (i.project ?? "").toLowerCase().includes(q)
      );
    }
    if (filters.status) {
      result = result.filter((i) => i._displayStatus === filters.status);
    }
    if (filters.dueDate.trim()) {
      const filterDate = filters.dueDate.trim();
      result = result.filter((i) => (i.dueOn ?? "") === filterDate);
    }

    if (sortByDue) {
      function dueSortKey(due?: string): number {
        if (!due) return Infinity;
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(due.trim());
        if (!m) return Infinity;
        const y = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10);
        const d = parseInt(m[3], 10);
        return y * 10000 + mo * 100 + d;
      }
      result.sort((a, b) => {
        const ka = dueSortKey(a.dueOn);
        const kb = dueSortKey(b.dueOn);
        if (ka === kb) return 0;
        return sortByDue === "asc"
          ? (ka > kb ? 1 : -1)
          : (ka < kb ? 1 : -1);
      });
    }

    return result;
  }, [decorated, filters, sortByDue]);

  function openNew() {
    setEditingId(null);
    setEditorOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    closeEditor();
  }

  function handleSave(patch: Partial<Invoice>) {
    if (isEdit && editingInvoice) {
      setInvoices((prev) =>
        prev.map((i) => (i.id === editingInvoice.id ? { ...i, ...patch } : i))
      );
      setEditorOpen(false);
      return;
    }

    const created: Invoice = { ...editorInvoice, ...patch, id: editorInvoice.id };
    setInvoices((prev) => [created, ...prev]);
    setEditorOpen(false);
  }

  function markPaid(id: string) {
    // v0 sets paidOn to "today" in YYYY-MM-DD (UTC)
    const y = todayUTC.getUTCFullYear();
    const m = String(todayUTC.getUTCMonth() + 1).padStart(2, "0");
    const d = String(todayUTC.getUTCDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "Paid", paidOn: i.paidOn || todayStr } : i
      )
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent/70" />
            Billing
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track invoices, due dates, and who owes what.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filters
            invoices={decorated}
            filters={filters}
            onFiltersChange={setFilters}
            sortByDue={sortByDue}
            onSortByDueChange={setSortByDue}
          />
          <Button variant="primary" onClick={() => openNew()}>
            New invoice
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Outstanding</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {formatMoney(stats.outstanding)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Unpaid invoices.</p>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Overdue</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {formatMoney(stats.overdue)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Past due date.</p>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Collected (this month)</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {formatMoney(stats.collected)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Paid invoices.</p>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-0">
        <div className="border-b border-border/70 px-5 py-4">
          <div className="text-sm font-semibold tracking-tight">Invoices</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Click an invoice to edit. Mark paid when money hits the account.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Issued</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-t border-border/70 hover:bg-surface/60 transition"
                >
                  <td
                    className="px-5 py-4 font-medium cursor-pointer"
                    onClick={() => openEdit(inv.id)}
                  >
                    {inv.client}
                  </td>
                  <td
                    className="px-5 py-4 text-muted-foreground cursor-pointer"
                    onClick={() => openEdit(inv.id)}
                  >
                    {inv.project || "—"}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatMoney(inv.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={inv._displayStatus} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{inv.issuedOn || "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground">{inv.dueOn || "—"}</td>
                  <td className="px-5 py-4">
                    {inv._displayStatus !== "Paid" ? (
                      <button
                        type="button"
                        onClick={() => markPaid(inv.id)}
                        className="rounded-xl px-3 py-2 text-xs font-medium text-foreground border border-border/70 hover:bg-surface-hover transition"
                      >
                        Mark paid
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Paid {inv.paidOn ? `(${inv.paidOn})` : ""}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="space-y-0 md:hidden">
          {filteredAndSortedInvoices.map((inv) => (
            <div
              key={inv.id}
              className="border-t border-border/70 p-4 first:border-t-0"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(inv.id)}
                  className="text-left"
                >
                  <div className="font-medium text-foreground">{inv.client}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {inv.project || "—"}
                  </div>
                </button>
                <StatusPill status={inv._displayStatus} />
              </div>

              <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                <span>Amount: {formatMoney(inv.amount)}</span>
                <span>Issued: {inv.issuedOn || "—"}</span>
                <span>Due: {inv.dueOn || "—"}</span>
                {inv._displayStatus !== "Paid" ? (
                  <button
                    type="button"
                    onClick={() => markPaid(inv.id)}
                    className="mt-2 inline-flex w-fit rounded-xl px-3 py-2 text-xs font-medium text-foreground border border-border/70 hover:bg-surface-hover transition"
                  >
                    Mark paid
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Paid {inv.paidOn ? `(${inv.paidOn})` : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Drawer
        open={editorOpen}
        onClose={closeEditor}
        title={isEdit ? "Edit invoice" : "New invoice"}
      >
        <InvoiceEditor
          invoice={editorInvoice}
          onCancel={closeEditor}
          onDelete={isEdit ? handleDelete : undefined}
          onSave={handleSave}
        />
      </Drawer>
    </div>
  );
}