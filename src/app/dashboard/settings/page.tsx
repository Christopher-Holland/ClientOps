import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent/70" />
            Settings
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure preferences and workspace defaults.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button href="#" variant="secondary">Reset</Button>
          <Button href="#" variant="primary">Save changes</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column: sections */}
        <Card className="lg:col-span-2">
          <div className="text-sm font-semibold tracking-tight">Workspace</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Defaults for how you track clients and projects.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Timezone
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                America/New_York
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Used for dates, reminders, and due times.
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Currency
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">USD</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Used for invoices and estimates.
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Default project status
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                Discovery
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                New projects start here unless changed.
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Week starts on
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">
                Monday
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Affects weekly planning views (later).
              </div>
            </div>
          </div>
        </Card>

        {/* Right column: account & actions */}
        <Card>
          <div className="text-sm font-semibold tracking-tight">Account</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Basic profile and preferences.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Profile
              </div>
              <div className="mt-2 text-sm font-medium">Chris Holland</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Owner • Full access
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Notifications
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Email reminders and weekly summaries (later).
              </div>
              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-border/60">
                  Email
                </span>
                <span className="inline-flex items-center rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-border/60">
                  Weekly
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Data
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Import/export and backups (later).
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button href="#" variant="secondary">Export CSV</Button>
                <Button href="#" variant="secondary">Backup</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-semibold tracking-tight">Roadmap</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Once the core workflow is solid, we’ll wire these panels to real settings
          stored in the database.
        </p>
      </Card>
    </div>
  );
}