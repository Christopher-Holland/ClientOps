"use client";

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MONTH_PARAM = "month";

export type MonthInfo = {
  monthKey: string;
  year: number;
  month: number;
  selectedDate: Date;
  isCurrentMonth: boolean;
};

function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function parseMonthKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})$/.exec(key.trim());
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  if (month < 0 || month > 11) return null;
  const d = new Date(year, month, 1);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toMonthInfo(date: Date): MonthInfo {
  const monthKey = getMonthKey(date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const today = new Date();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth() + 1;
  return {
    monthKey,
    year,
    month,
    selectedDate: date,
    isCurrentMonth,
  };
}

type MonthContextValue = MonthInfo & {
  setSelectedMonth: (date: Date) => void;
};

const MonthContext = React.createContext<MonthContextValue | null>(null);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [monthState, setMonthState] = useState<Date>(() => {
    const param = searchParams.get(MONTH_PARAM);
    const parsed = param ? parseMonthKey(param) : null;
    return parsed ?? new Date();
  });

  // Sync from URL when it changes (e.g. browser back/forward)
  useEffect(() => {
    const param = searchParams.get(MONTH_PARAM);
    const parsed = param ? parseMonthKey(param) : null;
    if (parsed) {
      setMonthState(parsed);
    }
  }, [searchParams]);

  const setSelectedMonth = useCallback(
    (date: Date) => {
      setMonthState(date);
      const monthKey = getMonthKey(date);
      const params = new URLSearchParams(searchParams.toString());
      params.set(MONTH_PARAM, monthKey);
      const qs = params.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""));
    },
    [pathname, router, searchParams]
  );

  const value = useMemo<MonthContextValue>(
    () => ({
      ...toMonthInfo(monthState),
      setSelectedMonth,
    }),
    [monthState, setSelectedMonth]
  );

  return (
    <MonthContext.Provider value={value}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonthContext(): MonthContextValue {
  const ctx = useContext(MonthContext);
  if (!ctx) {
    throw new Error("useMonthContext must be used within MonthProvider");
  }
  return ctx;
}
