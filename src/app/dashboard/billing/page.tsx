import { Card } from "@/app/components/ui/Card";

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-accent/70" />
          Billing
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invoices, retainers, and payment tracking (later).
        </p>
      </div>

      <Card>
        <div className="text-sm font-semibold tracking-tight">Coming soon</div>
        <p className="mt-1 text-sm text-muted-foreground">
          We’ll add invoice records and due dates after Clients/Projects are solid.
        </p>
      </Card>
    </div>
  );
}