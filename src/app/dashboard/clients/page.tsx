"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Drawer } from "@/app/components/ui/Drawer";
import {
  Client,
  ClientStatus,
  createClient,
  loadClients,
  saveClients,
  seedClients,
  updateClient,
} from "@/app/lib/store";
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
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loaded = loadClients();
    if (loaded.length === 0) {
      const seeded = seedClients();
      setClients(seeded);
      saveClients(seeded);
      return;
    }
    setClients(loaded);
  }, []);

  const selected = useMemo(
    () => clients.find((c) => c.id === selectedId) ?? null,
    [clients, selectedId]
  );

  function persist(next: Client[]) {
    setClients(next);
    saveClients(next);
  }

  function onNewClient() {
    const c = createClient({ name: "New client", status: "Lead" });
    const next = [c, ...clients];
    persist(next);
    setSelectedId(c.id);
    setOpen(true);
  }

  function onRowClick(id: string) {
    setSelectedId(id);
    setOpen(true);
  }

  function onSave(patch: Partial<Client>) {
    if (!selected) return;
    const next = clients.map((c) =>
      c.id === selected.id ? updateClient(c, patch) : c
    );
    persist(next);
    setOpen(false);
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
          <Button
            onClick={() => {
              saveClients(clients);
            }}
            variant="secondary"
          >
            Export
          </Button>
          <Button onClick={onNewClient} variant="primary">
            New client
          </Button>
        </div>
      </div>

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
              {clients.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-border/70 hover:bg-surface/60 transition cursor-pointer"
                  onClick={() => onRowClick(c.id)}
                >
                  <td className="px-5 py-4 font-medium">{c.name}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={c.status} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {c.lastContact || "—"}
                  </td>
                  <td className="px-5 py-4">{c.nextAction || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={selected ? selected.name : "Client"}
        footer={null}
      >
        {selected ? (
          <ClientEditor
            client={selected}
            onCancel={() => setOpen(false)}
            onSave={onSave}
          />
        ) : (
          <div className="text-sm text-muted-foreground">No client selected.</div>
        )}
      </Drawer>
    </div>
  );
}