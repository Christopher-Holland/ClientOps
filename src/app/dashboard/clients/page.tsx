import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

type ClientStatus = "Lead" | "Active" | "On hold";

const clients: Array<{
  name: string;
  status: ClientStatus;
  lastContact: string;
  nextAction: string;
}> = [
    {
      name: "ACME Co.",
      status: "Lead",
      lastContact: "Mar 1",
      nextAction: "Follow up on proposal",
    },
    {
      name: "Oliver — Site Refresh",
      status: "Active",
      lastContact: "Feb 28",
      nextAction: "Send revised timeline",
    },
    {
      name: "Local Studio",
      status: "On hold",
      lastContact: "Feb 10",
      nextAction: "Check in next week",
    },
  ];

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
          <Button href="#" variant="secondary">Export</Button>
          <Button href="#" variant="primary">New client</Button>
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
                  key={c.name}
                  className="border-t border-border/70 hover:bg-surface/60 transition"
                >
                  <td className="px-5 py-4 font-medium">{c.name}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={c.status} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{c.lastContact}</td>
                  <td className="px-5 py-4">{c.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold tracking-tight">Next step</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a client detail page with notes, contacts, and linked projects.
        </p>
      </Card>
    </div>
  );
}