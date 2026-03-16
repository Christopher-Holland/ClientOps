"use client";

import { useMemo, useState } from "react";
import { Button } from "../ui/Button";

export function MonthSelector() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthYear = useMemo(() => {
        return selectedDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
    }, [selectedDate]);

    const isCurrentMonth = useMemo(() => {
        const today = new Date();

        return (
            selectedDate.getMonth() === today.getMonth() &&
            selectedDate.getFullYear() === today.getFullYear()
        );
    }, [selectedDate]);

    const handlePrevMonth = () => {
        setSelectedDate((prev) => {
            return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
        });
    };

    const handleNextMonth = () => {
        setSelectedDate((prev) => {
            return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
        });
    };

    const handleResetMonth = () => {
        const today = new Date();
        setSelectedDate(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    return (
        <div className="mt-2 rounded-2xl border border-border/70 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-3 items-center">
                <div />

                <div className="flex items-center justify-center gap-3">
                    <Button variant="secondary" onClick={handlePrevMonth}>
                        Previous
                    </Button>

                    <div className="min-w-[170px] text-center">
                        <p className="text-base font-semibold text-foreground">
                            {monthYear}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            View work due this month
                        </p>
                    </div>

                    <Button variant="secondary" onClick={handleNextMonth}>
                        Next
                    </Button>
                </div>

                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetMonth}
                        disabled={isCurrentMonth}
                    >
                        Current Month
                    </Button>
                </div>
            </div>
        </div>
    );
}