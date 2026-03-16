"use client";

import { useMemo } from "react";
import { Button } from "../ui/Button";
import { useSelectedMonth, useSetSelectedMonth } from "@/lib/month";

export function MonthSelector() {
    const { selectedDate, isCurrentMonth } = useSelectedMonth();
    const setSelectedMonth = useSetSelectedMonth();

    const monthYear = useMemo(() => {
        return selectedDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
    }, [selectedDate]);

    const handlePrevMonth = () => {
        setSelectedMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setSelectedMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    };

    const handleResetMonth = () => {
        const today = new Date();
        setSelectedMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    return (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
            <Button variant="secondary" onClick={handlePrevMonth}>
                Previous
            </Button>
            <div className="flex min-w-[160px] flex-col items-center gap-0.5">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                    {monthYear}
                </span>
                <Button
                    variant="ghost"
                    className="min-h-0 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleResetMonth}
                    disabled={isCurrentMonth}
                >
                    Current Month
                </Button>
            </div>
            <Button variant="secondary" onClick={handleNextMonth}>
                Next
            </Button>
        </div>
    );
}