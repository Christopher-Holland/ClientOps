"use client";

import { useMonthContext } from "@/app/components/layout/MonthProvider";

export type { MonthInfo } from "@/app/components/layout/MonthProvider";

/** Use the selected month from context. Must be used within MonthProvider. */
export function useSelectedMonth() {
  const ctx = useMonthContext();
  return {
    monthKey: ctx.monthKey,
    year: ctx.year,
    month: ctx.month,
    selectedDate: ctx.selectedDate,
    isCurrentMonth: ctx.isCurrentMonth,
  };
}

/** Use the setter for the selected month. Must be used within MonthProvider. */
export function useSetSelectedMonth() {
  return useMonthContext().setSelectedMonth;
}

/** Check if a YYYY-MM-DD date string falls in the given year/month. */
export function isDateInMonth(
  dateStr: string | undefined,
  year: number,
  month: number
): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return false;
  const [y, m] = dateStr.slice(0, 7).split("-").map(Number);
  return y === year && m === month;
}
