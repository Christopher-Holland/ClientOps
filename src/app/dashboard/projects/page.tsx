import { Card } from "../../components/ui/Card";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track active work, deliverables, and next milestones.
        </p>
      </div>

      <Card>
        <div className="text-sm font-medium">Coming soon</div>
        <p className="mt-2 text-sm text-slate-600">
          This page will include project timelines, tasks, and links to client assets.
        </p>
      </Card>
    </div>
  );
}