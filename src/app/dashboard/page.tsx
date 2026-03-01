import { Card } from "@/app/components/ui/Card";

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
          <div className="mt-2 text-sm text-muted-foreground">{subtext}</div>
        </div>

        {/* subtle accent mark */}
        <div className="mt-1 h-2 w-2 rounded-full bg-accent/70" />
      </div>
    </Card>
  );
}

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent/70" />
            Dashboard
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A quick snapshot of active work, pipeline, and next actions.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active clients" value="3" subtext="2 projects in progress" />
        <StatCard label="Pipeline" value="5" subtext="Leads to follow up" />
        <StatCard label="Next invoices" value="2" subtext="Due this month" />
        <StatCard label="Tasks" value="12" subtext="Across all projects" />
      </div>

      {/* Main row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity */}
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold tracking-tight">Activity</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Recent updates across clients and projects.
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Last 7 days
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {[
              "Sent proposal to ACME Co.",
              "Updated scope notes for Oliver’s site refresh.",
              "Queued invoice draft for February retainer.",
              "Reviewed dashboard UI feedback and logged next actions.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface p-3 text-sm text-foreground transition hover:bg-surface-hover"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent/60" />
                <span className="leading-6">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Next actions */}
        <Card>
          <div className="text-sm font-semibold tracking-tight">Next actions</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep momentum with small, high-impact tasks.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-foreground">
            {[
              "Follow up with 2 leads",
              "Draft 1 invoice",
              "Confirm scope on 1 active project",
              "Add notes after calls",
            ].map((text) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                <span className="leading-6">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-border/70 bg-surface p-3 text-sm text-muted-foreground">
            Tip: keep notes short, then convert them into tasks.
          </div>
        </Card>
      </div>
    </div>
  );
}