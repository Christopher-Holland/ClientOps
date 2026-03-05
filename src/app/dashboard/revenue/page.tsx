// app/(whatever)/revenue/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Drawer } from "@/app/components/ui/Drawer";
import { RevenueEditor, type RevenueNote } from "@/app/components/revenue/RevenueEditor";
import { ProjectEditor, type Project, type ProjectStatus } from "@/app/components/projects/ProjectEditor";

// Initial project data (swap to shared store later)
const initialProjects: Project[] = [
    {
        id: "p_clientops_mvp",
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
        id: "p_portfolio_refresh",
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
        id: "p_oliver_refresh",
        name: "Oliver Site Refresh",
        client: "Oliver",
        pricingType: "hourly",
        amount: 75,
        hoursInvested: 8,
        status: "Review",
        due: "Mar 6",
        next: "Review final copy + deploy",
    },
    {
        id: "p_maintenance_retainer",
        name: "Maintenance Retainer",
        client: "ACME Co.",
        pricingType: "retainer",
        amount: 600,
        status: "Live",
        due: "—",
        next: "Monthly updates + support",
    },
];

function formatMoney(n: number, { decimals = 0 }: { decimals?: number } = {}) {
    return n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
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

function calcRevenueSnapshot(items: Project[]) {
    const mrr = items
        .filter((p) => p.pricingType === "retainer")
        .reduce((sum, p) => sum + p.amount, 0);

    const fixedTotal = items
        .filter((p) => p.pricingType === "fixed")
        .reduce((sum, p) => sum + p.amount, 0);

    const hourlyProjected = items
        .filter((p) => p.pricingType === "hourly")
        .reduce((sum, p) => sum + p.amount * (p.hoursInvested ?? 0), 0);

    const fixedNonLive = items
        .filter((p) => p.pricingType === "fixed" && p.status !== "Live")
        .reduce((sum, p) => sum + p.amount, 0);

    const projectedMonthly = mrr + hourlyProjected + fixedNonLive;

    const fixedWithHours = items.filter(
        (p) => p.pricingType === "fixed" && (p.hoursInvested ?? 0) > 0
    );

    const totalFixedDollars = fixedWithHours.reduce((sum, p) => sum + p.amount, 0);
    const totalHours = fixedWithHours.reduce((sum, p) => sum + (p.hoursInvested ?? 0), 0);
    const avgEffectiveRate = totalHours > 0 ? totalFixedDollars / totalHours : null;

    return {
        mrr,
        hourlyProjected,
        fixedTotal,
        fixedNonLive,
        projectedMonthly,
        avgEffectiveRate,
    };
}

function newRevenueNoteDraft(): RevenueNote {
    return {
        id: `rn_${Math.random().toString(36).slice(2, 10)}`,
        name: "",
        client: "",
        status: "Discovery",
        pricingType: "fixed",
        amount: 0,
        hoursInvested: undefined,
        date: new Date().toISOString().slice(0, 10),
        notes: "",
    };
}

function formatNotePricing(n: RevenueNote) {
    if (n.pricingType === "fixed") return formatMoney(n.amount);
    if (n.pricingType === "hourly") return `${formatMoney(n.amount)}/hr`;
    return `${formatMoney(n.amount)}/mo`;
}

export default function RevenuePage() {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [notes, setNotes] = useState<RevenueNote[]>([]);

    // Revenue note drawer
    const [noteEditorOpen, setNoteEditorOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<RevenueNote | null>(null);
    const [draftNote, setDraftNote] = useState<RevenueNote | null>(null);

    // Project drawer
    const [projectEditorOpen, setProjectEditorOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    const editingProject = useMemo(
        () => projects.find((p) => p.id === editingProjectId) ?? null,
        [projects, editingProjectId]
    );
    const isEditProject = Boolean(editingProject);

    const isEditNote = Boolean(editingNote);
    const editorNote = editingNote ?? draftNote ?? newRevenueNoteDraft(); // safety fallback

    const snap = calcRevenueSnapshot(projects);

    function openNewNote() {
        setEditingNote(null);
        setDraftNote(newRevenueNoteDraft());
        setNoteEditorOpen(true);
    }

    function openEditNote(note: RevenueNote) {
        setDraftNote(null);
        setEditingNote(note);
        setNoteEditorOpen(true);
    }

    function closeNoteEditor() {
        setNoteEditorOpen(false);
        setEditingNote(null);
        setDraftNote(null);
    }

    function handleNoteSave(patch: Partial<RevenueNote>) {
        if (isEditNote && editingNote) {
            setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? { ...n, ...patch } : n)));
        } else {
            const base = draftNote ?? editorNote;
            setNotes((prev) => [{ ...base, ...patch }, ...prev]);
        }
        closeNoteEditor();
    }

    function handleNoteDelete(id: string) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        closeNoteEditor();
    }

    function openEditProject(project: Project) {
        setEditingProjectId(project.id);
        setProjectEditorOpen(true);
    }

    function closeProjectEditor() {
        setProjectEditorOpen(false);
        setEditingProjectId(null);
    }

    function handleProjectSave(patch: Partial<Project>) {
        if (isEditProject && editingProject) {
            setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? { ...p, ...patch } : p)));
        }
        closeProjectEditor();
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-accent/70" />
                        Revenue
                    </div>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">Revenue</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Internal performance, projections, and rate sanity checks.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => { }}>
                        Date range
                    </Button>
                    <Button variant="primary" onClick={openNewNote}>
                        Add revenue note
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">MRR</div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">{formatMoney(snap.mrr)}</div>
                    <p className="mt-1 text-sm text-muted-foreground">Retainers / month.</p>
                </Card>

                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">Projected this month</div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                        {formatMoney(snap.projectedMonthly)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">MRR + hourly + active fixed work.</p>
                </Card>

                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">Hourly projected</div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                        {formatMoney(snap.hourlyProjected)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Based on hours invested (v0).</p>
                </Card>

                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">Avg effective rate</div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                        {snap.avgEffectiveRate ? `${formatMoney(snap.avgEffectiveRate)}/hr` : "—"}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Fixed-fee projects with hours.</p>
                </Card>
            </div>

            {/* Breakdown */}
            <Card className="p-0">
                <div className="border-b border-border/70 px-5 py-4">
                    <div className="text-sm font-semibold tracking-tight">Revenue by project</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        This is internal tracking — Billing will handle invoices and payments.
                    </p>
                </div>

                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                        <thead className="bg-surface">
                            <tr className="text-left text-xs font-medium text-muted-foreground">
                                <th className="px-5 py-3">Project</th>
                                <th className="px-5 py-3">Client</th>
                                <th className="px-5 py-3">Pricing</th>
                                <th className="px-5 py-3">Hours</th>
                                <th className="px-5 py-3">Effective rate</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => {
                                const er = effectiveRate(p);
                                return (
                                    <tr
                                        key={p.id}
                                        onClick={() => openEditProject(p)}
                                        className="border-t border-border/70 hover:bg-surface/60 transition cursor-pointer"
                                    >
                                        <td className="px-5 py-4 font-medium">{p.name}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{p.client}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{formatPricing(p)}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{p.hoursInvested ?? "—"}</td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {er ? `${formatMoney(er)}/hr` : "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusPill status={p.status} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="space-y-0 md:hidden">
                    {projects.map((p) => {
                        const er = effectiveRate(p);
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => openEditProject(p)}
                                className="w-full text-left border-t border-border/70 p-4 first:border-t-0 hover:bg-surface/60 transition"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="font-medium text-foreground">{p.name}</span>
                                    <StatusPill status={p.status} />
                                </div>
                                <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                                    <span>Client: {p.client}</span>
                                    <span>Pricing: {formatPricing(p)}</span>
                                    <span>Hours: {p.hoursInvested ?? "—"}</span>
                                    <span>Effective rate: {er ? `${formatMoney(er)}/hr` : "—"}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {notes.length > 0 ? (
                <Card className="p-0">
                    <div className="border-b border-border/70 px-5 py-4">
                        <div className="text-sm font-semibold tracking-tight">Revenue notes</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Revenue entries with project and pricing details.
                        </p>
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-sm">
                            <thead className="bg-surface">
                                <tr className="text-left text-xs font-medium text-muted-foreground">
                                    <th className="px-5 py-3">Project</th>
                                    <th className="px-5 py-3">Client</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Pricing</th>
                                    <th className="px-5 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notes.map((n) => (
                                    <tr
                                        key={n.id}
                                        onClick={() => openEditNote(n)}
                                        className="border-t border-border/70 hover:bg-surface/60 transition cursor-pointer"
                                    >
                                        <td className="px-5 py-4 font-medium">{n.name || "Untitled"}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{n.client || "—"}</td>
                                        <td className="px-5 py-4">
                                            <StatusPill status={n.status} />
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">{formatNotePricing(n)}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{n.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-0 md:hidden">
                        {notes.map((n) => (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => openEditNote(n)}
                                className="flex w-full items-center justify-between gap-4 border-t border-border/70 p-4 text-left first:border-t-0 hover:bg-surface/60 transition"
                            >
                                <div>
                                    <div className="font-medium text-foreground">{n.name || "Untitled"}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        {(n.client || "—") + " · " + formatNotePricing(n) + " · " + n.date}
                                    </div>
                                </div>
                                <StatusPill status={n.status} />
                            </button>
                        ))}
                    </div>
                </Card>
            ) : null}

            <Card>
                <div className="text-sm font-semibold tracking-tight">Next step</div>
                <p className="mt-1 text-sm text-muted-foreground">
                    When Billing ships, we’ll add “Collected” vs “Outstanding” and tie revenue to invoices.
                </p>
            </Card>

            {/* Revenue Note Drawer */}
            <Drawer
                open={noteEditorOpen}
                onClose={closeNoteEditor}
                title={isEditNote ? (editingNote?.name?.trim() || "Edit note") : "New revenue note"}
                footer={
                    isEditNote && editingNote ? (
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="secondary"
                                className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                onClick={() => handleNoteDelete(editingNote.id)}
                            >
                                Delete
                            </Button>
                            <div />
                        </div>
                    ) : null
                }
            >
                <RevenueEditor
                    note={editorNote}
                    onCancel={closeNoteEditor}
                    onSave={handleNoteSave}
                />
            </Drawer>

            {/* Project Drawer */}
            <Drawer
                open={projectEditorOpen}
                onClose={closeProjectEditor}
                title={isEditProject ? (editingProject?.name?.trim() || "Edit project") : "Project"}
                footer={null}
            >
                {editingProject ? (
                    <ProjectEditor project={editingProject} onCancel={closeProjectEditor} onSave={handleProjectSave} />
                ) : null}
            </Drawer>
        </div>
    );
}