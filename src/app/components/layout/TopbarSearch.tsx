"use client";

import { useMemo, useState } from "react";
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

    const filtered = useMemo(() => {
        if (!query.trim()) return [];

        return mockResults.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase())
        );
    }, [query]);

    const grouped = {
        clients: filtered.filter((item) => item.type === "client"),
        projects: filtered.filter((item) => item.type === "project"),
        revenue: filtered.filter((item) => item.type === "revenue"),
    };

    return (
        <div className="relative min-w-0 flex-1">
            <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-sm text-foreground">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="Search clients, projects, notes…"
                    className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground"
                />
                {query ? (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery("");
                            setOpen(false);
                        }}
                        aria-label="Clear search"
                        className="shrink-0 rounded-lg p-1 text-muted-foreground transition hover:bg-surface hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                ) : null}
            </div>

            {open && query.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-border/70 bg-card shadow-lg">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                            No matches found
                        </div>
                    ) : (
                        <div className="max-h-[320px] overflow-y-auto py-2">
                            {grouped.clients.length > 0 && (
                                <SearchSection title="Clients" items={grouped.clients} />
                            )}

                            {grouped.projects.length > 0 && (
                                <SearchSection title="Projects" items={grouped.projects} />
                            )}

                            {grouped.revenue.length > 0 && (
                                <SearchSection title="Revenue" items={grouped.revenue} />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SearchSection({
    title,
    items,
}: {
    title: string;
    items: SearchResult[];
}) {
    return (
        <div className="pb-2">
            <div className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {title}
            </div>

            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    className="flex w-full flex-col px-4 py-2 text-left transition hover:bg-surface"
                >
                    <span className="text-sm font-medium text-foreground">
                        {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.meta}</span>
                </button>
            ))}
        </div>
    );
}