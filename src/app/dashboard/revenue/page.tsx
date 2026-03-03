import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

type ProjectStatus = "Discovery" | "Build" | "Review" | "Live";
type PricingType = "fixed" | "hourly" | "retainer";

type Project = {
    name: string;
    client: string;
    pricingType: PricingType;
    amount: number; // fixed = total fee, hourly = hourly rate, retainer = monthly retainer
    hoursInvested?: number; // optional
    status: ProjectStatus;
    due: string;
    next: string;
};

// Local-only mock data (swap to shared store later)
const projects: Project[] = [
    {
        name: "ClientOps MVP",
        client: "Internal",
        pricingType: "fixed",
        amount: 10000,
        hoursInvested: 40,
        status: "Build",
        due: "Mar 15",
        next: "Implement Clients table + detail",
    },
    {
        name: "Portfolio Refresh",
        client: "Chris Holland",
        pricingType: "fixed",
        amount: 500,
        hoursInvested: 6,
        status: "Live",
        due: "—",
        next: "Replace My Ledger with ClientOps",
    },
    {
        name: "Oliver Site Refresh",
        client: "Oliver",
        pricingType: "hourly",
        amount: 75,
        hoursInvested: 8,
        status: "Review",
        due: "Mar 6",
        next: "Review final copy + deploy",
    },
    {
        name: "Maintenance Retainer",
        client: "ACME Co.",
        pricingType: "retainer",
        amount: 600,
        status: "Live",
        due: "—",
        next: "Monthly updates + support",
    },
];

function formatMoney(n: number, { decimals = 0 }: { decimals?: number } = {}) {
    return n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function formatPricing(p: Project) {
    if (p.pricingType === "fixed") return formatMoney(p.amount);
    if (p.pricingType === "hourly") return `${formatMoney(p.amount)}/hr`;
    return `${formatMoney(p.amount)}/mo`;
}

function effectiveRate(p: Project) {
    if (p.pricingType !== "fixed") return null;
    if (!p.hoursInvested || p.hoursInvested <= 0) return null;
    return p.amount / p.hoursInvested;
}

function calcRevenueSnapshot(items: Project[]) {
    const mrr = items
        .filter((p) => p.pricingType === "retainer")
        .reduce((sum, p) => sum + p.amount, 0);

    const fixedTotal = items
        .filter((p) => p.pricingType === "fixed")
        .reduce((sum, p) => sum + p.amount, 0);

    const hourlyProjected = items
        .filter((p) => p.pricingType === "hourly")
        .reduce((sum, p) => sum + p.amount * (p.hoursInvested ?? 0), 0);

    // Simple "Projected Monthly" logic for v0:
    // MRR + (hourly * hoursInvested) + (fixed fees for non-live work)
    const fixedNonLive = items
        .filter((p) => p.pricingType === "fixed" && p.status !== "Live")
        .reduce((sum, p) => sum + p.amount, 0);

    const projectedMonthly = mrr + hourlyProjected + fixedNonLive;

    // Weighted average effective rate across fixed projects with hours
    const fixedWithHours = items.filter(
        (p) => p.pricingType === "fixed" && (p.hoursInvested ?? 0) > 0
    );

    const totalFixedDollars = fixedWithHours.reduce((sum, p) => sum + p.amount, 0);
    const totalHours = fixedWithHours.reduce(
        (sum, p) => sum + (p.hoursInvested ?? 0),
        0
    );
    const avgEffectiveRate =
        totalHours > 0 ? totalFixedDollars / totalHours : null;

    return {
        mrr,
        hourlyProjected,
        fixedTotal,
        fixedNonLive,
        projectedMonthly,
        avgEffectiveRate,
    };
}

export default function RevenuePage() {
    const snap = calcRevenueSnapshot(projects);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-accent/70" />
                        Revenue
                    </div>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">Revenue</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Internal performance, projections, and rate sanity checks.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button href="#" variant="secondary">
                        Date range
                    </Button>
                    <Button href="#" variant="primary">
                        Add revenue note
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">MRR</div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                        {formatMoney(snap.mrr)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Retainers / month.
                    </p>
                </Card>

                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">
                        Projected this month
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                        {formatMoney(snap.projectedMonthly)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        MRR + hourly + active fixed work.
                    </p>
                </Card>

                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">
                        Hourly projected
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                        {formatMoney(snap.hourlyProjected)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Based on hours invested (v0).
                    </p>
                </Card>

                <Card className="p-5">
                    <div className="text-xs font-medium text-muted-foreground">
                        Avg effective rate
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                        {snap.avgEffectiveRate ? `${formatMoney(snap.avgEffectiveRate)}/hr` : "—"}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Fixed-fee projects with hours.
                    </p>
                </Card>
            </div>

            {/* Breakdown */}
            <Card className="p-0">
                <div className="border-b border-border/70 px-5 py-4">
                    <div className="text-sm font-semibold tracking-tight">
                        Revenue by project
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        This is internal tracking — Billing will handle invoices and payments.
                    </p>
                </div>

                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                        <thead className="bg-surface">
                            <tr className="text-left text-xs font-medium text-muted-foreground">
                                <th className="px-5 py-3">Project</th>
                                <th className="px-5 py-3">Client</th>
                                <th className="px-5 py-3">Pricing</th>
                                <th className="px-5 py-3">Hours</th>
                                <th className="px-5 py-3">Effective rate</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => {
                                const er = effectiveRate(p);
                                return (
                                    <tr
                                        key={p.name}
                                        className="border-t border-border/70 hover:bg-surface/60 transition"
                                    >
                                        <td className="px-5 py-4 font-medium">{p.name}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{p.client}</td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {formatPricing(p)}
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {p.hoursInvested ?? "—"}
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {er ? `${formatMoney(er)}/hr` : "—"}
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">{p.status}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile list */}
                <div className="space-y-0 md:hidden">
                    {projects.map((p) => {
                        const er = effectiveRate(p);
                        return (
                            <div
                                key={p.name}
                                className="border-t border-border/70 p-4 first:border-t-0"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="font-medium text-foreground">{p.name}</span>
                                    <span className="text-xs text-muted-foreground">{p.status}</span>
                                </div>
                                <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                                    <span>Client: {p.client}</span>
                                    <span>Pricing: {formatPricing(p)}</span>
                                    <span>Hours: {p.hoursInvested ?? "—"}</span>
                                    <span>Effective rate: {er ? `${formatMoney(er)}/hr` : "—"}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card>
                <div className="text-sm font-semibold tracking-tight">Next step</div>
                <p className="mt-1 text-sm text-muted-foreground">
                    When Billing ships, we’ll add “Collected” vs “Outstanding” and tie revenue to invoices.
                </p>
            </Card>
        </div>
    );
}