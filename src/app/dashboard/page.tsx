import { Card } from "@/app/components/ui/Card";

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          A quick snapshot of active work, pipeline, and next actions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-xs font-medium text-slate-500">Active clients</div>
          <div className="mt-2 text-2xl font-semibold">3</div>
          <div className="mt-2 text-sm text-slate-600">2 projects in progress</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Pipeline</div>
          <div className="mt-2 text-2xl font-semibold">5</div>
          <div className="mt-2 text-sm text-slate-600">Leads to follow up</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Next invoices</div>
          <div className="mt-2 text-2xl font-semibold">2</div>
          <div className="mt-2 text-sm text-slate-600">Due this month</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Tasks</div>
          <div className="mt-2 text-2xl font-semibold">12</div>
          <div className="mt-2 text-sm text-slate-600">Across all projects</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Activity</div>
              <div className="mt-1 text-sm text-slate-600">
                Recent updates across clients and projects.
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {[
              "Sent proposal to ACME Co.",
              "Updated scope notes for Oliver’s site refresh.",
              "Queued invoice draft for February retainer.",
              "Reviewed dashboard UI feedback and logged next actions.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium">Next actions</div>
          <p className="mt-1 text-sm text-slate-600">
            Keep momentum with small, high-impact tasks.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• Follow up with 2 leads</li>
            <li>• Draft 1 invoice</li>
            <li>• Confirm scope on 1 active project</li>
            <li>• Add notes after calls</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}