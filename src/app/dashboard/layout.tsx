import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            {/* Outer container */}
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex gap-6">
                    <Sidebar />

                    {/* Main column */}
                    <div className="min-w-0 flex-1">
                        <Topbar />

                        {/* Content frame */}
                        <div className="mt-6 rounded-2xl border border-border/70 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6">
                            <div className="rounded-2xl bg-background p-4 sm:p-6">
                                {children}
                            </div>
                        </div>

                        {/* Footer spacing (optional) */}
                        <div className="h-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}