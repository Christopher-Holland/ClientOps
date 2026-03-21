"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/app/components/ui/Card";
import { useSelectedMonth } from "@/lib/month";

function StatCard({
  label,
  value,
  subtext,
  href,
}: {
  label: string;
  value: string;
  subtext: string;
  href?: string;
}) {
  const content = (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
          <div className="mt-2 text-sm text-muted-foreground">{subtext}</div>
        </div>
        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent/70" />
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block transition hover:opacity-90">
        {content}
      </Link>
    );
  }
  return content;
}

function isDateInMonth(dateStr: string | undefined, year: number, month: number): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return false;
  const [y, m] = dateStr.slice(0, 7).split("-").map(Number);
  return y === year && m === month;
}

export default function DashboardHome() {
  const { year, month } = useSelectedMonth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeClients: 0,
    pipelineProjects: 0,
    invoicesDueThisMonth: 0,
    taskCount: 0,
  });
  const [activity, setActivity] = useState<Array<{ label: string; href?: string }>>([]);
  const [nextActions, setNextActions] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsRes, projectsRes, invoicesRes, tasksRes] = await Promise.all([
        fetch("/api/clients", { credentials: "include" }),
        fetch("/api/projects", { credentials: "include" }),
        fetch("/api/invoices", { credentials: "include" }),
        fetch("/api/tasks", { credentials: "include" }),
      ]);

      const clients = clientsRes.ok ? await clientsRes.json() : [];
      const projects = projectsRes.ok ? await projectsRes.json() : [];
      const invoices = invoicesRes.ok ? await invoicesRes.json() : [];
      const tasks = tasksRes.ok ? await tasksRes.json() : [];

      const activeClients = clients.filter((c: { status?: string }) => c.status === "Active").length;
      const pipelineProjects = projects.filter(
        (p: { status?: string }) => p.status === "Discovery"
      ).length;
      const invoicesDueThisMonth = invoices.filter(
        (i: { dueOn?: string; status?: string }) =>
          i.status !== "Paid" && isDateInMonth(i.dueOn, year, month)
      ).length;
      const taskCount = tasks.filter(
        (t: { status?: string }) => t.status !== "DONE"
      ).length;

      setStats({
        activeClients,
        pipelineProjects,
        invoicesDueThisMonth,
        taskCount,
      });

      const activityItems: Array<{ label: string; href?: string }> = [];
      const byUpdated = [
        ...clients.map((c: { name: string; updatedAt: string }) => ({
          type: "client" as const,
          name: c.name,
          updatedAt: c.updatedAt,
        })),
        ...projects.map((p: { name: string; client: string; updatedAt?: string }) => ({
          type: "project" as const,
          name: p.name,
          client: p.client,
          updatedAt: p.updatedAt ?? "",
        })),
      ].sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));

      for (const item of byUpdated.slice(0, 5)) {
        if (item.type === "client") {
          activityItems.push({
            label: `Updated client: ${item.name}`,
            href: "/dashboard/clients",
          });
        } else {
          activityItems.push({
            label: `Updated project: ${item.name} (${item.client})`,
            href: "/dashboard/projects",
          });
        }
      }

      if (activityItems.length === 0) {
        activityItems.push({ label: "No recent activity yet." });
      }

      setActivity(activityItems);

      const actions: string[] = [];
      const leadsToFollow = pipelineProjects;
      if (leadsToFollow > 0) {
        actions.push(`Follow up with ${leadsToFollow} lead${leadsToFollow !== 1 ? "s" : ""}`);
      }
      const draftsToCreate = invoices.filter(
        (i: { status?: string }) => i.status === "Draft"
      ).length;
      if (draftsToCreate > 0) {
        actions.push(`Draft ${draftsToCreate} invoice${draftsToCreate !== 1 ? "s" : ""}`);
      }
      const inProgress = projects.filter(
        (p: { status?: string }) => p.status === "Build" || p.status === "Review"
      ).length;
      if (inProgress > 0) {
        actions.push(`Review ${inProgress} active project${inProgress !== 1 ? "s" : ""}`);
      }
      const withNextAction = [
        ...clients.filter((c: { nextAction?: string }) => c.nextAction?.trim()),
        ...projects.filter((p: { next?: string }) => p.next?.trim()),
      ].length;
      if (withNextAction > 0) {
        actions.push(`${withNextAction} item${withNextAction !== 1 ? "s" : ""} with next actions`);
      }
      if (actions.length === 0) {
        actions.push("Add notes after calls");
        actions.push("Review pipeline and goals");
      }

      setNextActions(actions);
    } catch {
      setStats({ activeClients: 0, pipelineProjects: 0, invoicesDueThisMonth: 0, taskCount: 0 });
      setActivity([{ label: "Failed to load activity." }]);
      setNextActions(["Refresh the page to try again."]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-8">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active clients"
          value={loading ? "—" : String(stats.activeClients)}
          subtext={`${stats.pipelineProjects} in pipeline`}
          href="/dashboard/clients"
        />
        <StatCard
          label="Pipeline"
          value={loading ? "—" : String(stats.pipelineProjects)}
          subtext="Leads to follow up"
          href="/dashboard/projects"
        />
        <StatCard
          label="Next invoices"
          value={loading ? "—" : String(stats.invoicesDueThisMonth)}
          subtext="Due this month"
          href="/dashboard/billing"
        />
        <StatCard
          label="Tasks"
          value={loading ? "—" : String(stats.taskCount)}
          subtext="Across all projects"
          href="/dashboard/projects"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold tracking-tight">Activity</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Recent updates across clients and projects.
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Last 7 days</div>
          </div>

          <div className="mt-5 space-y-2">
            {loading ? (
              <div className="rounded-xl border border-border/70 bg-surface p-4 text-sm text-muted-foreground">
                Loading…
              </div>
            ) : (
              activity.map((item) =>
                item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface p-3 text-sm text-foreground transition hover:bg-surface-hover"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent/60" />
                    <span className="leading-6">{item.label}</span>
                  </Link>
                ) : (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface p-3 text-sm text-foreground"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent/60" />
                    <span className="leading-6">{item.label}</span>
                  </div>
                )
              )
            )}
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold tracking-tight">Next actions</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep momentum with small, high-impact tasks.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-foreground">
            {loading ? (
              <li className="text-muted-foreground">Loading…</li>
            ) : (
              nextActions.map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span className="leading-6">{text}</span>
                </li>
              ))
            )}
          </ul>

          <div className="mt-5 rounded-xl border border-border/70 bg-surface p-3 text-sm text-muted-foreground">
            Tip: keep notes short, then convert them into tasks.
          </div>
        </Card>
      </div>
    </div>
  );
}
