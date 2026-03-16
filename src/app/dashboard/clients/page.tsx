"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSelectedMonth, isDateInMonth } from "@/lib/month";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Drawer } from "@/app/components/ui/Drawer";
import type { Client, ClientStatus } from "@/app/lib/store";
import { ClientEditor } from "@/app/components/clients/ClientEditor";

function StatusPill({ status }: { status: ClientStatus }) {
  const cls =
    status === "Active"
      ? "bg-accent/15 text-foreground"
      : status === "Lead"
        ? "bg-surface text-foreground"
        : "bg-surface text-muted-foreground";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const { year, month, isCurrentMonth } = useSelectedMonth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isNewlyCreated, setIsNewlyCreated] = useState(false);
  const hasOpenedFromParam = useRef(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please sign in to view clients.");
          return;
        }
        throw new Error("Failed to load clients");
      }
      const data = await res.json();
      setClients(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load clients");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const onNewClient = useCallback(async () => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New client", status: "Lead" }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create client");
      const c = await res.json();
      setClients((prev) => [c, ...prev]);
      setSelectedId(c.id);
      setIsNewlyCreated(true);
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create client");
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "1" && !hasOpenedFromParam.current) {
      hasOpenedFromParam.current = true;
      onNewClient();
      window.history.replaceState({}, "", "/dashboard/clients");
    }
  }, [searchParams, onNewClient]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const lastContact = c.lastContact?.trim();
      if (!lastContact) return isCurrentMonth;
      return isDateInMonth(lastContact, year, month);
    });
  }, [clients, year, month, isCurrentMonth]);

  const selected = useMemo(
    () => filteredClients.find((c) => c.id === selectedId) ?? null,
    [filteredClients, selectedId]
  );

  function onRowClick(id: string) {
    setSelectedId(id);
    setIsNewlyCreated(false);
    setOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      setClients((prev) => prev.filter((c) => c.id !== id));
      setOpen(false);
      setSelectedId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete client");
    }
  }

  async function onSave(patch: Partial<Client>) {
    if (!selected) return;
    try {
      const res = await fetch(`/api/clients/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setClients((prev) =>
        prev.map((c) => (c.id === selected.id ? updated : c))
      );
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save client");
    }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(clients, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent/70" />
            Clients
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track relationships, status, and next actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="secondary">
            Export
          </Button>
          <Button onClick={onNewClient} variant="primary">
            New client
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last contact</th>
                <th className="px-5 py-3">Next action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    Loading clients…
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    {clients.length === 0
                      ? "No clients yet. Create one to get started."
                      : "No clients with last contact in this month."}
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-border/70 hover:bg-surface/60 transition cursor-pointer"
                    onClick={() => onRowClick(c.id)}
                  >
                    <td className="px-5 py-4 font-medium">{c.name}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={c.status as ClientStatus} />
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {c.lastContact || "—"}
                    </td>
                    <td className="px-5 py-4">{c.nextAction || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer
        open={open}
        onClose={() => { setOpen(false); setIsNewlyCreated(false); }}
        title={selected ? selected.name : "Client"}
        footer={null}
      >
        {selected ? (
          <ClientEditor
            client={selected}
            onCancel={() => setOpen(false)}
            onDelete={!isNewlyCreated ? handleDelete : undefined}
            onSave={onSave}
          />
        ) : (
          <div className="text-sm text-muted-foreground">No client selected.</div>
        )}
      </Drawer>
    </div>
  );
}
