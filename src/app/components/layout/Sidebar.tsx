"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    CreditCard,
    Settings,
    DollarSign,
    LogOut,
} from "lucide-react";

const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/clients", label: "Clients", icon: Users },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "/dashboard/revenue", label: "Revenue", icon: DollarSign },
    
];

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-6 rounded-2xl border border-border/70 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="px-2">
                    <div className="text-sm font-semibold tracking-tight text-foreground">
                        ClientOps
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                        Calm, simple client operations
                    </div>
                </div>

                <nav className="mt-4 space-y-1">
                    {nav.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cx(
                                    "group flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                                    isActive
                                        ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                                )}
                            >
                                <Icon
                                    className={cx(
                                        "h-4 w-4 transition",
                                        isActive
                                            ? "text-foreground"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-6 border-t border-border/70 pt-3">
                    <Link
                        href="/dashboard/settings"
                        className={cx(
                            "group flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                            pathname.startsWith("/dashboard/settings")
                                ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                                : "text-muted-foreground hover:bg-card hover:text-foreground"
                        )}
                    >
                        <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        Settings
                    </Link>
                </div>

                <div className="mt-6 border-t border-border/70 pt-3">
                    <Link
                        href="/handler/sign-out"
                        className="group flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-card hover:text-foreground"
                    >
                        <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        Logout
                    </Link>
                </div>
            </div>
        </aside>
    );
}