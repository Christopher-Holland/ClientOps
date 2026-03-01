import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

type ProjectStatus = "Discovery" | "Build" | "Review" | "Live";

const projects: Array<{
  name: string;
  client: string;
  status: ProjectStatus;
  due: string;
  next: string;
}> = [
    {
      name: "ClientOps MVP",
      client: "Internal",
      status: "Build",
      due: "Mar 15",
      next: "Implement Clients table + detail",
    },
    {
      name: "Portfolio Refresh",
      client: "Chris Holland",
      status: "Live",
      due: "—",
      next: "Replace My Ledger with ClientOps",
    },
    {
      name: "Oliver Site Refresh",
      client: "Oliver",
      status: "Review",
      due: "Mar 6",
      next: "Review final copy + deploy",
    },
  ];

function StatusPill({ status }: { status: ProjectStatus }) {
  const cls =
    status === "Live"
      ? "bg-accent/15 text-foreground"
      : status === "Build"
        ? "bg-surface text-foreground"
        : status === "Review"
          ? "bg-surface text-foreground"
          : "bg-surface text-muted-foreground";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent/70" />
            Projects
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track delivery, milestones, and due dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button href="#" variant="secondary">Filters</Button>
          <Button href="#" variant="primary">New project</Button>
        </div>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Next</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.name}
                  className="border-t border-border/70 hover:bg-surface/60 transition"
                >
                  <td className="px-5 py-4 font-medium">{p.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.client}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{p.due}</td>
                  <td className="px-5 py-4">{p.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold tracking-tight">Next step</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Add project detail with tasks, notes, and linked client.
        </p>
      </Card>
    </div>
  );
}