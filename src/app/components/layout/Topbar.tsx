"use client";

import { Button } from "../../components/ui/Button";
import { Search, Plus } from "lucide-react";

export function Topbar() {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-sm text-foreground">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                    placeholder="Search clients, projects, notes…"
                    className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                />
            </div>

            <div className="flex items-center gap-2">
                <Button href="#" variant="secondary">
                    New client
                </Button>
                <Button href="#" variant="primary" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New project
                </Button>
            </div>
        </div>
    );
}