"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { DateInput } from "@/app/components/ui/DateInput";
import { Filter, ChevronDown } from "lucide-react";
import type { Project, ProjectStatus } from "./ProjectEditor";

export type ProjectFilters = {
    project: string;
    client: string;
    status: string;
    dueDate: string;
};

export type SortByDue = "asc" | "desc" | null;

const STATUS_OPTIONS: ProjectStatus[] = [
    "Discovery",
    "Build",
    "Review",
    "Live",
];

const emptyFilters: ProjectFilters = {
    project: "",
    client: "",
    status: "",
    dueDate: "",
};

function inputClass() {
    return [
        "w-full rounded-xl border border-border/70 bg-card px-3",
        "h-10 text-sm",
        "text-foreground placeholder:text-muted-foreground",
        "outline-none focus:ring-2 focus:ring-ring/15",
    ].join(" ");
}

function selectClass() {
    return [
        "w-full rounded-xl border border-border/70 bg-card px-3",
        "h-10 text-sm",
        "text-foreground",
        "outline-none focus:ring-2 focus:ring-ring/15",
        "cursor-pointer",
    ].join(" ");
}

type Props = {
    projects: Project[];
    filters: ProjectFilters;
    onFiltersChange: (f: ProjectFilters) => void;
    sortByDue: SortByDue;
    onSortByDueChange: (s: SortByDue) => void;
};

export function Filters({
    projects,
    filters,
    onFiltersChange,
    sortByDue,
    onSortByDueChange,
}: Props) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const uniqueClients = [...new Set(projects.map((p) => p.client).filter(Boolean))].sort();

    const hasActiveFilters =
        filters.project ||
        filters.client ||
        filters.status ||
        filters.dueDate ||
        sortByDue;

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    function handleClear() {
        onFiltersChange(emptyFilters);
        onSortByDueChange(null);
        setOpen(false);
    }

    return (
        <div ref={rootRef} className="relative">
            <Button
                variant="secondary"
                onClick={() => setOpen((o) => !o)}
                className="gap-2"
            >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters ? (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs font-medium text-accent-foreground">
                        •
                    </span>
                ) : null}
                <ChevronDown
                    className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
                />
            </Button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/70 bg-card p-4 shadow-lg sm:left-auto sm:right-0">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Filter & sort</span>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Project
                                </label>
                                <input
                                    type="text"
                                    value={filters.project}
                                    onChange={(e) =>
                                        onFiltersChange({
                                            ...filters,
                                            project: e.target.value,
                                        })
                                    }
                                    placeholder="Filter by name…"
                                    className={inputClass()}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Client
                                </label>
                                <select
                                    value={filters.client}
                                    onChange={(e) =>
                                        onFiltersChange({
                                            ...filters,
                                            client: e.target.value,
                                        })
                                    }
                                    className={selectClass()}
                                >
                                    <option value="">All clients</option>
                                    {uniqueClients.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) =>
                                        onFiltersChange({
                                            ...filters,
                                            status: e.target.value,
                                        })
                                    }
                                    className={selectClass()}
                                >
                                    <option value="">All statuses</option>
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Due date
                                </label>
                                <DateInput
                                    value={filters.dueDate}
                                    onChange={(due) =>
                                        onFiltersChange({
                                            ...filters,
                                            dueDate: due,
                                        })
                                    }
                                    aria-label="Filter by due date"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Sort by due date
                                </label>
                                <select
                                    value={sortByDue ?? ""}
                                    onChange={(e) =>
                                        onSortByDueChange(
                                            (e.target.value || null) as SortByDue
                                        )
                                    }
                                    className={selectClass()}
                                >
                                    <option value="">None</option>
                                    <option value="asc">Earliest first</option>
                                    <option value="desc">Latest first</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
