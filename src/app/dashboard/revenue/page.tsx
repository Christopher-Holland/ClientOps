"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Drawer } from "@/app/components/ui/Drawer";
import {
    RevenueEditor,
    type RevenueNote,
} from "@/app/components/revenue/RevenueEditor";
import {
    ProjectEditor,
    type Project,
} from "@/app/components/projects/ProjectEditor";

function formatMoney(
    n: number,
    { decimals = 0 }: { decimals?: number } = {}
) {
    return n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function clampPct(value: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
}

function formatPct(value: number) {
    return `${Math.round(value)}%`;
}

function getStatusTone(status: string) {
    if (status === "Live") return "bg-accent/15 text-foreground";
    if (status === "Build") return "bg-surface text-foreground";
    if (status === "Review") return "bg-surface text-foreground";
    if (status === "Discovery") return "bg-surface text-muted-foreground";
    if (status === "Paused") return "bg-surface text-muted-foreground";
    return "bg-surface text-muted-foreground";
}

function StatusPill({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusTone(
                status
            )}`}
        >
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
    const totalHours = fixedWithHours.reduce(
        (sum, p) => sum + (p.hoursInvested ?? 0),
        0
    );
    const avgEffectiveRate = totalHours > 0 ? totalFixedDollars / totalHours : null;

    const activeProjects = items.filter(
        (p) => p.status === "Build" || p.status === "Review"
    );

    const activeProjectValue = activeProjects.reduce((sum, p) => {
        if (p.pricingType === "hourly") {
            return sum + p.amount * (p.hoursInvested ?? 0);
        }
        if (p.pricingType === "retainer") return sum + p.amount;
        return sum + p.amount;
    }, 0);

    const liveProjects = items.filter((p) => p.status === "Live").length;
    const buildProjects = items.filter((p) => p.status === "Build").length;
    const reviewProjects = items.filter((p) => p.status === "Review").length;

    const pricingMix = {
        retainer: mrr,
        fixed: fixedTotal,
        hourly: hourlyProjected,
    };

    const topProjects = [...items]
        .map((p) => {
            const realizedValue =
                p.pricingType === "hourly"
                    ? p.amount * (p.hoursInvested ?? 0)
                    : p.amount;

            return {
                ...p,
                realizedValue,
                effectiveRate: effectiveRate(p),
            };
        })
        .sort((a, b) => b.realizedValue - a.realizedValue)
        .slice(0, 5);

    return {
        mrr,
        hourlyProjected,
        fixedTotal,
        fixedNonLive,
        projectedMonthly,
        avgEffectiveRate,
        activeProjectValue,
        liveProjects,
        buildProjects,
        reviewProjects,
        pricingMix,
        topProjects,
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

function getRevenueNoteValue(note: RevenueNote) {
    if (note.pricingType === "hourly") return note.amount * (note.hoursInvested ?? 0);
    return note.amount;
}

function getMonthShortLabel(date: Date) {
    return date.toLocaleString(undefined, { month: "short" });
}

function getMonthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date: Date) {
    return date.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
    });
}

function buildRevenueTrend(projects: Project[], notes: RevenueNote[]) {
    const today = new Date();
    const months = Array.from({ length: 12 }).map((_, index) => {
        const d = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);

        return {
            key: getMonthKey(d),
            label: getMonthShortLabel(d),
            fixed: 0,
            hourly: 0,
            retainer: 0,
            notes: 0,
        };
    });

    const currentMonthIndex = months.length - 1;

    projects.forEach((p) => {
        if (p.pricingType === "retainer") {
            months.forEach((m) => {
                m.retainer += p.amount;
            });
            return;
        }

        if (p.pricingType === "fixed") {
            months[currentMonthIndex].fixed += p.amount;
            return;
        }

        if (p.pricingType === "hourly") {
            months[currentMonthIndex].hourly += p.amount * (p.hoursInvested ?? 0);
        }
    });

    notes.forEach((n) => {
        const monthKey = n.date?.slice(0, 7);
        const bucket = months.find((m) => m.key === monthKey);
        if (!bucket) return;
        bucket.notes += getRevenueNoteValue(n);
    });

    return months.map((m) => ({
        ...m,
        total: m.fixed + m.hourly + m.retainer + m.notes,
    }));
}

function BarChart({
    data,
    activeKey,
}: {
    data: Array<{ key: string; label: string; total: number }>;
    activeKey?: string;
}) {
    const max = Math.max(...data.map((d) => d.total), 1);

    return (
        <div className="space-y-3">
            <div className="flex h-44 items-end gap-2">
                {data.map((item) => {
                    const height = `${Math.max(10, (item.total / max) * 100)}%`;
                    const isActive = item.key === activeKey;

                    return (
                        <div key={item.key} className="flex flex-1 flex-col items-center gap-2">
                            <div className="flex h-full w-full items-end">
                                <div
                                    className={`w-full rounded-t-xl transition-all ${isActive ? "bg-accent" : "bg-accent/55"
                                        }`}
                                    style={{ height }}
                                    title={`${item.label}: ${formatMoney(item.total)}`}
                                />
                            </div>
                            <span
                                className={`text-xs ${isActive ? "font-medium text-foreground" : "text-muted-foreground"
                                    }`}
                            >
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MiniProgress({
    value,
    total,
    label,
    hint,
}: {
    value: number;
    total: number;
    label: string;
    hint?: string;
}) {
    const percent = total > 0 ? clampPct((value / total) * 100) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="text-sm font-medium">{label}</div>
                    {hint ? (
                        <div className="text-xs text-muted-foreground">{hint}</div>
                    ) : null}
                </div>
                <div className="text-sm font-medium">{formatPct(percent)}</div>
            </div>
            <div className="h-2 rounded-full bg-surface">
                <div
                    className="h-2 rounded-full bg-accent/75 transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

type NoteEditorMode = "new" | "edit" | null;

export default function RevenuePage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [notes, setNotes] = useState<RevenueNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch("/api/projects", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to load projects");
            const data = await res.json();
            setProjects(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load projects");
            setProjects([]);
        }
    }, []);

    const fetchNotes = useCallback(async () => {
        try {
            const res = await fetch("/api/revenue-notes", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to load revenue notes");
            const data = await res.json();
            setNotes(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load revenue notes");
            setNotes([]);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        setError(null);
        Promise.all([fetchProjects(), fetchNotes()]).finally(() => setLoading(false));
    }, [fetchProjects, fetchNotes]);

    const [noteEditorOpen, setNoteEditorOpen] = useState(false);
    const [noteEditorMode, setNoteEditorMode] = useState<NoteEditorMode>(null);
    const [activeNote, setActiveNote] = useState<RevenueNote | null>(null);

    const [projectEditorOpen, setProjectEditorOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    const [selectedMonth, setSelectedMonth] = useState(() => new Date());

    const [monthlyGoals, setMonthlyGoals] = useState<
        Record<string, { revenue: number; pipeline: number }>
    >(() => {
        const currentKey = getMonthKey(new Date());
        return {
            [currentKey]: {
                revenue: 5000,
                pipeline: 8000,
            },
        };
    });

    const [goalDraft, setGoalDraft] = useState({
        revenue: 5000,
        pipeline: 8000,
    });

    const [isEditingGoals, setIsEditingGoals] = useState(false);

    const editingProject = useMemo(
        () => projects.find((p) => p.id === editingProjectId) ?? null,
        [projects, editingProjectId]
    );

    const isEditProject = Boolean(editingProject);
    const isEditNote = noteEditorMode === "edit" && Boolean(activeNote);

    const snap = useMemo(() => calcRevenueSnapshot(projects), [projects]);
    const trend = useMemo(() => buildRevenueTrend(projects, notes), [projects, notes]);

    const selectedMonthKey = getMonthKey(selectedMonth);

    const activeGoals = monthlyGoals[selectedMonthKey] ?? {
        revenue: 5000,
        pipeline: 8000,
    };

    const monthlyGoal = activeGoals.revenue;
    const pipelineGoal = activeGoals.pipeline;

    const currentMonthIndex = trend.findIndex((m) => m.key === selectedMonthKey);

    const currentMonth =
        currentMonthIndex >= 0 ? trend[currentMonthIndex] : trend[trend.length - 1];

    const lastMonth =
        currentMonthIndex > 0 ? trend[currentMonthIndex - 1] : null;

    const monthOverMonth =
        lastMonth && lastMonth.total > 0
            ? ((currentMonth.total - lastMonth.total) / lastMonth.total) * 100
            : 0;

    const goalProgress = monthlyGoal > 0 ? (currentMonth.total / monthlyGoal) * 100 : 0;

    const pipelineNotesValue = notes
        .filter((n) => n.status === "Discovery" || n.status === "Review")
        .reduce((sum, n) => sum + getRevenueNoteValue(n), 0);

    const totalPipelineValue = snap.fixedNonLive + pipelineNotesValue;

    const totalPricingMix =
        snap.pricingMix.retainer + snap.pricingMix.fixed + snap.pricingMix.hourly;

    function openNewNote() {
        setActiveNote(newRevenueNoteDraft());
        setNoteEditorMode("new");
        setNoteEditorOpen(true);
    }

    function openEditNote(note: RevenueNote) {
        setActiveNote(note);
        setNoteEditorMode("edit");
        setNoteEditorOpen(true);
    }

    function closeNoteEditor() {
        setNoteEditorOpen(false);
        setNoteEditorMode(null);
        setActiveNote(null);
    }

    async function handleNoteSave(patch: Partial<RevenueNote>) {
        if (!activeNote) return;

        try {
            if (noteEditorMode === "edit") {
                const res = await fetch(`/api/revenue-notes/${activeNote.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(patch),
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to save");
                const updated = await res.json();
                setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? updated : n)));
            } else {
                const res = await fetch("/api/revenue-notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...activeNote, ...patch }),
                    credentials: "include",
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "Failed to create");
                setNotes((prev) => [data, ...prev]);
            }
            closeNoteEditor();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save revenue note");
        }
    }

    async function handleNoteDelete(id: string) {
        try {
            const res = await fetch(`/api/revenue-notes/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete");
            setNotes((prev) => prev.filter((n) => n.id !== id));
            closeNoteEditor();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete revenue note");
        }
    }

    function openEditProject(project: Project) {
        setEditingProjectId(project.id);
        setProjectEditorOpen(true);
    }

    function closeProjectEditor() {
        setProjectEditorOpen(false);
        setEditingProjectId(null);
    }

    async function handleProjectSave(patch: Partial<Project>) {
        if (isEditProject && editingProject) {
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
                closeProjectEditor();
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to save project");
            }
        } else {
            closeProjectEditor();
        }
    }

    async function handleProjectDelete(id: string) {
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete");
            setProjects((prev) => prev.filter((p) => p.id !== id));
            closeProjectEditor();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete project");
        }
    }

    function goToPreviousMonth() {
        setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }

    function goToNextMonth() {
        setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }

    function startEditingGoals() {
        setGoalDraft({
            revenue: activeGoals.revenue,
            pipeline: activeGoals.pipeline,
        });
        setIsEditingGoals(true);
    }

    function cancelEditingGoals() {
        setGoalDraft({
            revenue: activeGoals.revenue,
            pipeline: activeGoals.pipeline,
        });
        setIsEditingGoals(false);
    }

    function saveGoals() {
        setMonthlyGoals((prev) => ({
            ...prev,
            [selectedMonthKey]: {
                revenue: Math.max(0, goalDraft.revenue || 0),
                pipeline: Math.max(0, goalDraft.pipeline || 0),
            },
        }));
        setIsEditingGoals(false);
    }

    return (
        <div className="space-y-8">
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                </div>
            )}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-accent/70" />
                        Revenue
                    </div>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                        Revenue
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Internal performance, goals, projections, and revenue health.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" onClick={goToPreviousMonth}>
                        Prev month
                    </Button>
                    <div className="rounded-xl border border-border/70 px-3 py-2 text-sm text-foreground">
                        {getMonthLabel(selectedMonth)}
                    </div>
                    <Button variant="secondary" onClick={goToNextMonth}>
                        Next month
                    </Button>
                    <Button variant="secondary" onClick={startEditingGoals}>
                        Edit goals
                    </Button>
                    <Button variant="primary" onClick={openNewNote}>
                        Add revenue note
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-xs font-medium text-muted-foreground">
                                Monthly goal
                            </div>
                            <div className="mt-2 text-2xl font-semibold tracking-tight">
                                {formatMoney(monthlyGoal)}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Revenue target for {getMonthLabel(selectedMonth)}.
                            </p>
                        </div>

                        {!isEditingGoals ? (
                            <Button variant="secondary" onClick={startEditingGoals}>
                                Edit
                            </Button>
                        ) : null}
                    </div>

                    <div className="mt-4">
                        <MiniProgress
                            value={currentMonth.total}
                            total={monthlyGoal}
                            label={`${formatMoney(currentMonth.total)} tracked`}
                            hint="Goal progress"
                        />
                    </div>

                    {isEditingGoals ? (
                        <div className="mt-4 space-y-3 rounded-2xl border border-border/70 p-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Revenue goal
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={goalDraft.revenue}
                                    onChange={(e) =>
                                        setGoalDraft((prev) => ({
                                            ...prev,
                                            revenue: Number(e.target.value),
                                        }))
                                    }
                                    className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Pipeline goal
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={goalDraft.pipeline}
                                    onChange={(e) =>
                                        setGoalDraft((prev) => ({
                                            ...prev,
                                            pipeline: Number(e.target.value),
                                        }))
                                    }
                                    className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <Button variant="primary" onClick={saveGoals}>
                                    Save goals
                                </Button>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="secondary" onClick={cancelEditingGoals}>
                                    Cancel
                                </Button>

                            </div>
                        </div>
                    ) : null}
                </Card>

                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">
                        Projected this month
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                        {formatMoney(snap.projectedMonthly)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        MRR + hourly + active fixed work.
                    </p>
                    <div className="mt-4 text-sm text-muted-foreground">
                        Current trend:{" "}
                        <span className="font-medium text-foreground">
                            {monthOverMonth >= 0 ? "+" : ""}
                            {monthOverMonth.toFixed(0)}%
                        </span>{" "}
                        vs last month
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">MRR</div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                        {formatMoney(snap.mrr)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Stable recurring revenue from retainers.
                    </p>
                    <div className="mt-4 text-sm text-muted-foreground">
                        Live projects:{" "}
                        <span className="font-medium text-foreground">{snap.liveProjects}</span>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">
                        Avg effective rate
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                        {snap.avgEffectiveRate
                            ? `${formatMoney(snap.avgEffectiveRate)}/hr`
                            : "—"}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Fixed-fee projects with hours logged.
                    </p>
                    <div className="mt-4 text-sm text-muted-foreground">
                        Active work value:{" "}
                        <span className="font-medium text-foreground">
                            {formatMoney(snap.activeProjectValue)}
                        </span>
                    </div>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.6fr_.9fr]">
                <Card className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-sm font-semibold tracking-tight">
                                Revenue trend
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Rolling 12-month view of tracked revenue and retained income.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-medium text-muted-foreground">
                                Selected month
                            </div>
                            <div className="mt-1 text-lg font-semibold tracking-tight">
                                {formatMoney(currentMonth.total)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <BarChart
                            data={trend.map((m) => ({
                                key: m.key,
                                label: m.label,
                                total: m.total,
                            }))}
                            activeKey={selectedMonthKey}
                        />
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="text-sm font-semibold tracking-tight">
                        Revenue mix
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Where current revenue is coming from.
                    </p>

                    <div className="mt-5 space-y-5">
                        <MiniProgress
                            value={snap.pricingMix.retainer}
                            total={Math.max(totalPricingMix, 1)}
                            label="Retainers"
                            hint={formatMoney(snap.pricingMix.retainer)}
                        />
                        <MiniProgress
                            value={snap.pricingMix.fixed}
                            total={Math.max(totalPricingMix, 1)}
                            label="Fixed fee"
                            hint={formatMoney(snap.pricingMix.fixed)}
                        />
                        <MiniProgress
                            value={snap.pricingMix.hourly}
                            total={Math.max(totalPricingMix, 1)}
                            label="Hourly"
                            hint={formatMoney(snap.pricingMix.hourly)}
                        />
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                        <div className="rounded-2xl border border-border/70 p-4">
                            <div className="text-xs font-medium text-muted-foreground">
                                Build
                            </div>
                            <div className="mt-2 text-xl font-semibold">{snap.buildProjects}</div>
                        </div>
                        <div className="rounded-2xl border border-border/70 p-4">
                            <div className="text-xs font-medium text-muted-foreground">
                                Review
                            </div>
                            <div className="mt-2 text-xl font-semibold">{snap.reviewProjects}</div>
                        </div>
                        <div className="rounded-2xl border border-border/70 p-4">
                            <div className="text-xs font-medium text-muted-foreground">
                                Pipeline
                            </div>
                            <div className="mt-2 text-xl font-semibold">
                                {formatMoney(totalPipelineValue)}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="p-5 xl:col-span-2">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-sm font-semibold tracking-tight">
                                Top earning projects
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Highest-value work based on current pricing and tracked hours.
                            </p>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">
                            Ranked by value
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {snap.topProjects.map((project, index) => (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => openEditProject(project)}
                                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border/70 p-4 text-left transition hover:bg-surface/60"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-muted-foreground">
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">{project.name}</div>
                                            <div className="mt-1 truncate text-sm text-muted-foreground">
                                                {project.client} · {formatPricing(project)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <StatusPill status={project.status} />
                                        <span className="text-xs text-muted-foreground">
                                            Hours: {project.hoursInvested ?? "—"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Eff. rate:{" "}
                                            {project.effectiveRate
                                                ? `${formatMoney(project.effectiveRate)}/hr`
                                                : "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="shrink-0 text-right">
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Value
                                    </div>
                                    <div className="mt-1 text-lg font-semibold tracking-tight">
                                        {formatMoney(project.realizedValue)}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="text-sm font-semibold tracking-tight">
                        Performance summary
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Quick read on revenue health this month.
                    </p>

                    <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-border/70 p-4">
                            <div className="text-xs font-medium text-muted-foreground">
                                Goal completion
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {formatPct(goalProgress)}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {formatMoney(currentMonth.total)} of {formatMoney(monthlyGoal)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border/70 p-4">
                            <div className="text-xs font-medium text-muted-foreground">
                                Fixed-fee pipeline
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {formatMoney(snap.fixedNonLive)}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Active non-live fixed work still in motion.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border/70 p-4">
                            <div className="text-xs font-medium text-muted-foreground">
                                Pipeline target progress
                            </div>
                            <div className="mt-2">
                                <MiniProgress
                                    value={totalPipelineValue}
                                    total={pipelineGoal}
                                    label={`${formatMoney(totalPipelineValue)} in pipeline`}
                                    hint={`Goal: ${formatMoney(pipelineGoal)}`}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-0">
                <div className="border-b border-border/70 px-5 py-4">
                    <div className="text-sm font-semibold tracking-tight">
                        Revenue by project
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Internal tracking for project value, pricing efficiency, and active work.
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
                                        className="cursor-pointer border-t border-border/70 transition hover:bg-surface/60"
                                    >
                                        <td className="px-5 py-4 font-medium">{p.name}</td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {p.client}
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {formatPricing(p)}
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {p.hoursInvested ?? "—"}
                                        </td>
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

                <div className="space-y-0 md:hidden">
                    {projects.map((p) => {
                        const er = effectiveRate(p);
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => openEditProject(p)}
                                className="w-full border-t border-border/70 p-4 text-left transition first:border-t-0 hover:bg-surface/60"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="font-medium text-foreground">{p.name}</span>
                                    <StatusPill status={p.status} />
                                </div>
                                <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                                    <span>Client: {p.client}</span>
                                    <span>Pricing: {formatPricing(p)}</span>
                                    <span>Hours: {p.hoursInvested ?? "—"}</span>
                                    <span>
                                        Effective rate: {er ? `${formatMoney(er)}/hr` : "—"}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {notes.length > 0 ? (
                <Card className="p-0">
                    <div className="border-b border-border/70 px-5 py-4">
                        <div className="text-sm font-semibold tracking-tight">
                            Revenue notes
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Opportunity log, pricing notes, and internal revenue tracking.
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
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notes.map((n) => (
                                    <tr
                                        key={n.id}
                                        onClick={() => openEditNote(n)}
                                        className="cursor-pointer border-t border-border/70 transition hover:bg-surface/60"
                                    >
                                        <td className="px-5 py-4 font-medium">
                                            {n.name || "Untitled"}
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {n.client || "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusPill status={n.status} />
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {formatNotePricing(n)}
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {n.date}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    handleNoteDelete(n.id);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-0 md:hidden">
                        {notes.map((n) => (
                            <div
                                key={n.id}
                                className="border-t border-border/70 p-4 first:border-t-0"
                            >
                                <button
                                    type="button"
                                    onClick={() => openEditNote(n)}
                                    className="flex w-full items-center justify-between gap-4 text-left transition hover:bg-surface/60"
                                >
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {n.name || "Untitled"}
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            {(n.client || "—") +
                                                " · " +
                                                formatNotePricing(n) +
                                                " · " +
                                                n.date}
                                        </div>
                                    </div>
                                    <StatusPill status={n.status} />
                                </button>

                                <div className="mt-3 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                        onClick={() => handleNoteDelete(n.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            ) : null}

            <Card>
                <div className="text-sm font-semibold tracking-tight">Next step</div>
                <p className="mt-1 text-sm text-muted-foreground">
                    Next evolution: connect Billing so this page can distinguish projected,
                    invoiced, collected, and outstanding revenue in one place.
                </p>
            </Card>

            <Drawer
                open={noteEditorOpen}
                onClose={closeNoteEditor}
                title={
                    isEditNote
                        ? activeNote?.name?.trim() || "Edit note"
                        : "New revenue note"
                }
                footer={null}
            >
                {activeNote ? (
                    <RevenueEditor
                        key={activeNote.id}
                        note={activeNote}
                        onCancel={closeNoteEditor}
                        onSave={handleNoteSave}
                    />
                ) : null}
            </Drawer>

            <Drawer
                open={projectEditorOpen}
                onClose={closeProjectEditor}
                title={
                    isEditProject
                        ? editingProject?.name?.trim() || "Edit project"
                        : "Project"
                }
                footer={null}
            >
                {editingProject ? (
                    <ProjectEditor
                        project={editingProject}
                        onCancel={closeProjectEditor}
                        onDelete={isEditProject ? handleProjectDelete : undefined}
                        onSave={handleProjectSave}
                    />
                ) : null}
            </Drawer>
        </div>
    );
}