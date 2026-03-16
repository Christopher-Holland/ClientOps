"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type SearchResult = {
    id: string;
    label: string;
    meta: string;
    type: "client" | "project" | "revenue";
};

const mockResults: SearchResult[] = [
    {
        id: "c_1",
        label: "ACME Co.",
        meta: "Client · Active",
        type: "client",
    },
    {
        id: "c_2",
        label: "Oliver",
        meta: "Client · Review",
        type: "client",
    },
    {
        id: "p_1",
        label: "ClientOps MVP",
        meta: "Project · Internal · Build",
        type: "project",
    },
    {
        id: "p_2",
        label: "Portfolio Refresh",
        meta: "Project · Live",
        type: "project",
    },
    {
        id: "r_1",
        label: "Oliver payment",
        meta: "Revenue · $600 · Mar 6",
        type: "revenue",
    },
];

export function TopbarSearch() {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        return mockResults.filter((item) =>
            `${item.label} ${item.meta}`.toLowerCase().includes(q)
        );
    }, [query]);

    const grouped = useMemo(
        () => ({
            clients: filtered.filter((item) => item.type === "client"),
            projects: filtered.filter((item) => item.type === "project"),
            revenue: filtered.filter((item) => item.type === "revenue"),
        }),
        [filtered]
    );

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    function handleClear() {
        setQuery("");
        setOpen(false);
    }

    function handleResultClick(item: SearchResult) {
        
        setOpen(false);
    }

    return (
        <div ref={rootRef} className="relative min-w-0 flex-1">
            <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-sm text-foreground">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => {
                        if (query.trim()) setOpen(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setOpen(false);
                        }
                    }}
                    placeholder="Search clients, projects, notes…"
                    className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground"
                />

                {query ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear search"
                        className="shrink-0 rounded-lg p-1 text-muted-foreground transition hover:bg-surface hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                ) : null}
            </div>

            {open && query.trim() ? (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-4">
                            <div className="text-sm font-medium text-foreground">
                                No matches found
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                Try a client name, project name, or revenue note.
                            </div>
                        </div>
                    ) : (
                        <div className="max-h-[320px] overflow-y-auto py-2">
                            {grouped.clients.length > 0 ? (
                                <SearchSection
                                    title="Clients"
                                    items={grouped.clients}
                                    onSelect={handleResultClick}
                                />
                            ) : null}

                            {grouped.projects.length > 0 ? (
                                <SearchSection
                                    title="Projects"
                                    items={grouped.projects}
                                    onSelect={handleResultClick}
                                />
                            ) : null}

                            {grouped.revenue.length > 0 ? (
                                <SearchSection
                                    title="Revenue"
                                    items={grouped.revenue}
                                    onSelect={handleResultClick}
                                />
                            ) : null}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}

function SearchSection({
    title,
    items,
    onSelect,
}: {
    title: string;
    items: SearchResult[];
    onSelect: (item: SearchResult) => void;
}) {
    return (
        <div className="border-t border-border/70 first:border-t-0">
            <div className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {title}
            </div>

            <div className="pb-2">
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item)}
                        className="flex w-full flex-col px-4 py-2 text-left transition hover:bg-surface"
                    >
                        <span className="text-sm font-medium text-foreground">
                            {item.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {item.meta}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}