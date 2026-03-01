import Link from "next/link";
import { LayoutDashboard, Users, FolderKanban, Settings } from "lucide-react";

const nav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/clients", label: "Clients", icon: Users },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
];

export function Sidebar() {
    return (
        <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold tracking-tight">ClientOps</div>
                        <div className="mt-1 text-xs text-slate-600">Internal dashboard</div>
                    </div>
                </div>

                <nav className="mt-4 space-y-1">
                    {nav.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                                <Icon className="h-4 w-4 text-slate-500" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-6 border-t border-slate-200 pt-3">
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                        <Settings className="h-4 w-4 text-slate-500" />
                        Settings
                    </Link>
                </div>
            </div>
        </aside>
    );
}