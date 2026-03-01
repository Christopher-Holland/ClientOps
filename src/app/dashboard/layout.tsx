import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <Sidebar />
                <div className="min-w-0 flex-1">
                    <Topbar />
                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </div>
    );
}