"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    CreditCard,
    Settings,
} from "lucide-react";

const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/clients", label: "Clients", icon: Users },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border/70 bg-card/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden">
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
                            "flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-xs transition",
                            isActive
                                ? "bg-surface text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
