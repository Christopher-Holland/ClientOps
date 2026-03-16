"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Drawer } from "@/app/components/ui/Drawer";
import { ProjectEditor, type Project, type ProjectStatus } from "@/app/components/projects/ProjectEditor";
import { Filters, type ProjectFilters, type SortByDue } from "@/app/components/projects/Filters";
import { toYYYYMMDD } from "@/app/components/ui/DateInput";

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
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function newProjectDraft(defaultStatus: ProjectStatus = "Discovery"): Project {
  return {
    id: `p_${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    client: "",
    pricingType: "fixed",
    amount: 0,
    hoursInvested: undefined,
    status: defaultStatus,
    due: "",
    next: "",
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultProjectStatus, setDefaultProjectStatus] = useState<ProjectStatus>("Discovery");

  const searchParams = useSearchParams();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const hasOpenedFromParam = useRef(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsRes, settingsRes] = await Promise.all([
        fetch("/api/projects", { credentials: "include" }),
        fetch("/api/settings", { credentials: "include" }),
      ]);
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data);
      }
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        const status = settings.settings?.defaultProjectStatus;
        if (status && ["Discovery", "Build", "Review", "Live"].includes(status)) {
          setDefaultProjectStatus(status);
        }
      }
      if (!projectsRes.ok) {
        if (projectsRes.status === 401) {
          setError("Please sign in to view projects.");
          setProjects([]);
          return;
        }
        throw new Error("Failed to load projects");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (searchParams.get("new") === "1" && !hasOpenedFromParam.current) {
      hasOpenedFromParam.current = true;
      setEditingId(null);
      setEditorOpen(true);
      window.history.replaceState({}, "", "/dashboard/projects");
    }
  }, [searchParams]);

  const editingProject = useMemo(() => {
    if (!editingId) return null;
    return projects.find((p) => p.id === editingId) ?? null;
  }, [projects, editingId]);

  const editorProject = editingProject ?? newProjectDraft(defaultProjectStatus);
  const isEdit = Boolean(editingProject);

  const [filters, setFilters] = useState<ProjectFilters>({
    project: "",
    client: "",
    status: "",
    dueDate: "",
  });
  const [sortByDue, setSortByDue] = useState<SortByDue>(null);

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (filters.project.trim()) {
      const q = filters.project.toLowerCase().trim();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (filters.client) {
      result = result.filter((p) => p.client === filters.client);
    }
    if (filters.status) {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters.dueDate.trim()) {
      const filterDate = filters.dueDate.trim();
      result = result.filter((p) => toYYYYMMDD(p.due) === filterDate || p.due === filterDate);
    }

    if (sortByDue) {
      const monthOrder: Record<string, number> = {
        jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
        jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
      };
      function dueSortKey(due: string): number {
        if (!due || due === "—") return Infinity;
        const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(due.trim());
        if (iso) {
          return parseInt(iso[1], 10) * 10000 + parseInt(iso[2], 10) * 100 + parseInt(iso[3], 10);
        }
        const m = due.match(/^([a-zA-Z]{3})\s*(\d+)/);
        if (!m) return Infinity;
        const month = monthOrder[m[1].toLowerCase()] ?? 12;
        const day = parseInt(m[2], 10) || 1;
        const year = new Date().getFullYear();
        return year * 10000 + month * 100 + day;
      }
      result.sort((a, b) => {
        const ka = dueSortKey(a.due);
        const kb = dueSortKey(b.due);
        if (ka === kb) return 0;
        return sortByDue === "asc"
          ? (ka > kb ? 1 : -1)
          : (ka < kb ? 1 : -1);
      });
    }

    return result;
  }, [projects, filters, sortByDue]);

  function openNew() {
    setEditingId(null);
    setEditorOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      setProjects((prev) => prev.filter((p) => p.id !== id));
      closeEditor();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete project");
    }
  }

  async function handleSave(patch: Partial<Project>) {
    if (isEdit && editingProject) {
      try {
        const res = await fetch(`/api/projects/${editingProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to save");
        const updated = await res.json();
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updated : p)));
        closeEditor();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save project");
      }
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editorProject, ...patch }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setProjects((prev) => [data, ...prev]);
      closeEditor();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create project");
    }
  }

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
          <Filters
            projects={projects}
            filters={filters}
            onFiltersChange={setFilters}
            sortByDue={sortByDue}
            onSortByDueChange={setSortByDue}
          />
          <Button variant="primary" onClick={() => openNew()}>
            New project
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Card className="p-0">
        {/* Mobile: card list */}
        <div className="space-y-0 md:hidden">
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Loading projects…
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No projects yet. Create one to get started.
            </div>
          ) : (
            filteredAndSortedProjects.map((p) => {
              const r = effectiveRate(p);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openEdit(p.id)}
                  className="w-full text-left border-t border-border/70 p-4 first:border-t-0 hover:bg-surface/60 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <StatusPill status={p.status} />
                  </div>
                  <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                    <span>Client: {p.client}</span>
                    <span>Pricing: {formatPricing(p)}</span>
                    <span>Due: {p.due}</span>
                    <span>{p.next}</span>
                    {r ? (
                      <span className="text-xs text-muted-foreground">
                        Effective rate: {formatMoney(r)}/hr
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    Loading projects…
                  </td>
                </tr>
              ) : filteredAndSortedProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    No projects yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                filteredAndSortedProjects.map((p) => {
                  const r = effectiveRate(p);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => openEdit(p.id)}
                      className="border-t border-border/70 hover:bg-surface/60 transition cursor-pointer"
                    >
                      <td className="px-5 py-4 font-medium">{p.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">{p.client}</td>
                      <td className="px-5 py-4 text-muted-foreground">{formatPricing(p)}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={p.status} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{p.due}</td>
                      <td className="px-5 py-4">
                        <div>{p.next}</div>
                        {r ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Effective rate: {formatMoney(r)}/hr
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
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

      <Drawer
        open={editorOpen}
        onClose={closeEditor}
        title={isEdit ? (editingProject?.name ?? "Edit project") : "New project"}
        footer={null}
      >
        <ProjectEditor
          project={editorProject}
          onCancel={closeEditor}
          onDelete={isEdit ? handleDelete : undefined}
          onSave={handleSave}
        />
      </Drawer>
    </div>
  );
}
