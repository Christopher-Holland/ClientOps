import { Card } from "../../components/ui/Card";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage client records, status, and active projects.
        </p>
      </div>

      <Card>
        <div className="text-sm font-medium">Coming soon</div>
        <p className="mt-2 text-sm text-slate-600">
          This page will list clients with status, last contact date, and quick actions.
        </p>
      </Card>
    </div>
  );
}