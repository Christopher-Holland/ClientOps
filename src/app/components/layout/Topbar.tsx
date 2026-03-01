import { Button } from "../ui/Button";
import { Search, Plus } from "lucide-react";

export function Topbar() {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                    placeholder="Search clients, projects, notes…"
                    className="w-full bg-transparent outline-none placeholder:text-slate-400"
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