"use client";

import React, { useEffect } from "react";

const MONTH_NAMES: Record<string, number> = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12,
};

/** Normalize various date formats to YYYY-MM-DD for the native date input. */
export function toYYYYMMDD(value: string | undefined): string {
    if (!value || !value.trim()) return "";
    const s = value.trim();
    if (s === "—" || s === "-") return "";

    // Already YYYY-MM-DD
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (iso) return s;

    // "Mar 15" or "March 15" or "Mar 15, 2026"
    const monDay = /^([a-zA-Z]+)\s+(\d{1,2})(?:\s*,\s*(\d{4}))?$/.exec(s);
    if (monDay) {
        const month = MONTH_NAMES[monDay[1].toLowerCase()];
        const day = parseInt(monDay[2], 10);
        const year = monDay[3] ? parseInt(monDay[3], 10) : new Date().getFullYear();
        if (month && day >= 1 && day <= 31) {
            const m = String(month).padStart(2, "0");
            const d = String(day).padStart(2, "0");
            return `${year}-${m}-${d}`;
        }
    }

    // "15 Mar" or "15/03/2026" or "03-15-2026"
    const dmy = /^(\d{1,2})[\/\-]\s*(\d{1,2})[\/\-]\s*(\d{4})$/.exec(s);
    if (dmy) {
        const a = parseInt(dmy[1], 10);
        const b = parseInt(dmy[2], 10);
        const y = parseInt(dmy[3], 10);
        // Assume MM/DD/YYYY or DD/MM/YYYY - prefer MM/DD for US
        const month = a <= 12 ? a : b;
        const day = a <= 12 ? b : a;
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        }
    }

    return "";
}

const inputClass = [
    "w-full rounded-xl border border-border/70 bg-card px-3",
    "h-11 sm:h-10",
    "text-base sm:text-sm",
    "leading-none",
    "text-foreground",
    "outline-none focus:ring-2 focus:ring-ring/15",
    "[color-scheme:light]",
].join(" ");

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    min?: string;
    max?: string;
    id?: string;
    "aria-label"?: string;
};

/**
 * Date input with native calendar picker. Always uses YYYY-MM-DD format.
 * Normalizes legacy formats (e.g. "Mar 15") for display.
 */
export function DateInput({
    value,
    onChange,
    placeholder,
    min,
    max,
    id,
    "aria-label": ariaLabel,
}: Props) {
    const displayValue = toYYYYMMDD(value) || value.trim() || "";

    // Normalize legacy formats (e.g. "Mar 15") to YYYY-MM-DD when value changes
    useEffect(() => {
        const normalized = toYYYYMMDD(value);
        if (normalized && normalized !== value.trim()) {
            onChange(normalized);
        }
    }, [value, onChange]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const v = e.target.value;
        onChange(v || "");
    }

    return (
        <input
            type="date"
            id={id}
            aria-label={ariaLabel}
            value={displayValue}
            onChange={handleChange}
            min={min}
            max={max}
            placeholder={placeholder}
            className={inputClass}
        />
    );
}
