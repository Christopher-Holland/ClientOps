import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

type ProjectStatus = "Discovery" | "Build" | "Review" | "Live";
type PricingType = "fixed" | "hourly" | "retainer";

type Project = {
  name: string;
  client: string;
  pricingType: PricingType;
  amount: number; // local-only for now (later: switch to amountCents)
  hoursInvested?: number; // optional
  status: ProjectStatus;
  due: string;
  next: string;
};

const projects: Project[] = [
  {
    name: "ClientOps MVP",
    client: "Internal",
    pricingType: "fixed",
    amount: 10000,
    hoursInvested: 40,
    status: "Build",
    due: "Mar 15",
    next: "Implement Clients table + detail",
  },
  {
    name: "Portfolio Refresh",
    client: "Chris Holland",
    pricingType: "fixed",
    amount: 500,
    hoursInvested: 6,
    status: "Live",
    due: "—",
    next: "Replace My Ledger with ClientOps",
  },
  {
    name: "Oliver Site Refresh",
    client: "Oliver",
    pricingType: "hourly",
    amount: 75, // hourly rate
    hoursInvested: 8,
    status: "Review",
    due: "Mar 6",
    next: "Review final copy + deploy",
  },
];

function formatMoney(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatPricing(p: Project) {
  if (p.pricingType === "fixed") return formatMoney(p.amount);
  if (p.pricingType === "hourly") return `${formatMoney(p.amount)}/hr`;
  return `${formatMoney(p.amount)}/mo`;
}

function effectiveRate(p: Project) {
  if (p.pricingType !== "fixed") return null;
  if (!p.hoursInvested || p.hoursInvested <= 0) return null;
  return p.amount / p.hoursInvested;
}

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
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

function EffectiveRateLine({ p }: { p: Project }) {
  const r = effectiveRate(p);
  if (!r) return null;
  return (
    <div className="mt-1 text-xs text-muted-foreground">
      Effective rate: {formatMoney(r)}/hr
    </div>
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
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track delivery, milestones, and due dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button href="#" variant="secondary">
            Filters
          </Button>
          <Button href="#" variant="primary">
            New project
          </Button>
        </div>
      </div>

      <Card className="p-0">
        {/* Mobile: card list */}
        <div className="space-y-0 md:hidden">
          {projects.map((p) => (
            <div
              key={p.name}
              className="border-t border-border/70 p-4 first:border-t-0"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">{p.name}</span>
                <StatusPill status={p.status} />
              </div>

              <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                <span>Client: {p.client}</span>
                <span>Project Fee: {formatPricing(p)}</span>
                <span>Due: {p.due}</span>
                <span>{p.next}</span>
                <EffectiveRateLine p={p} />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Project Fee</th>
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
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatPricing(p)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{p.due}</td>
                  <td className="px-5 py-4">
                    <div>{p.next}</div>
                    <EffectiveRateLine p={p} />
                  </td>
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