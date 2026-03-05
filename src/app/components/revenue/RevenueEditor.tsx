"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/Button";

export type ProjectStatus = "Discovery" | "Build" | "Review" | "Live";
export type PricingType = "fixed" | "hourly" | "retainer";

export type RevenueNote = {
    id: string;
    name: string;
    client: string;
    status: ProjectStatus;
    pricingType: PricingType;
    amount: number;
    hoursInvested?: number;
    date: string; // YYYY-MM-DD
    notes?: string;
};

function Field({
    label,
    children,
    hint,
}: {
    label: string;
    children: React.ReactNode;
    hint?: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                    {label}
                </label>
                {hint ? (
                    <span className="text-xs text-muted-foreground">{hint}</span>
                ) : null}
            </div>
            {children}
        </div>
    );
}

function inputClass() {
    return [
        "w-full rounded-xl border border-border/70 bg-card px-3",
        "h-11 sm:h-10",
        "text-base sm:text-sm",
        "leading-none",
        "text-foreground placeholder:text-muted-foreground",
        "outline-none focus:ring-2 focus:ring-ring/15",
    ].join(" ");
}

function Segmented<T extends string>({
    value,
    onChange,
    options,
    label,
    dotClass,
    activeBg,
}: {
    value: T;
    onChange: (v: T) => void;
    options: T[];
    label: string;
    dotClass: (opt: T) => string;
    activeBg: (opt: T) => string;
}) {
    return (
        <div
            className={[
                "inline-flex w-full overflow-hidden rounded-xl",
                "border border-border/70 bg-surface",
            ].join(" ")}
            role="group"
            aria-label={label}
        >
            {options.map((opt, idx) => {
                const active = opt === value;

                return (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(opt)}
                        className={[
                            "relative flex-1",
                            "h-11 sm:h-10 px-3",
                            "text-base sm:text-sm font-medium",
                            "transition",
                            "focus:outline-none focus:ring-2 focus:ring-ring/15 focus:z-10",
                            "hover:bg-surface-hover",
                            active
                                ? `text-foreground ${activeBg(opt)}`
                                : "text-muted-foreground",
                        ].join(" ")}
                    >
                        <span className="inline-flex items-center justify-center gap-2">
                            <span
                                className={`h-2 w-2 rounded-full ${dotClass(opt)}`}
                            />
                            <span>{opt}</span>
                        </span>

                        {idx !== options.length - 1 ? (
                            <span className="pointer-events-none absolute right-0 top-1/2 h-5 w-px -translate-y-1/2 bg-border/70" />
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}

function pricingLabel(type: PricingType) {
    if (type === "fixed") return "Project Fee";
    if (type === "hourly") return "Hourly Rate";
    return "Monthly Retainer";
}

function effectiveRate(p: {
    pricingType: PricingType;
    amount: number;
    hoursInvested?: number;
}) {
    if (p.pricingType !== "fixed") return null;
    if (!p.hoursInvested || p.hoursInvested <= 0) return null;
    return p.amount / p.hoursInvested;
}

function formatMoney(n: number, { decimals = 0 }: { decimals?: number } = {}) {
    return n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function RevenueEditor({
    note,
    onSave,
    onCancel,
}: {
    note: RevenueNote;
    onSave: (patch: Partial<RevenueNote>) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(note.name);
    const [client, setClient] = useState(note.client);
    const [status, setStatus] = useState<ProjectStatus>(note.status);
    const [pricingType, setPricingType] = useState<PricingType>(note.pricingType);
    const [amount, setAmount] = useState(String(note.amount ?? 0));
    const [hours, setHours] = useState(
        note.hoursInvested === undefined ? "" : String(note.hoursInvested)
    );
    const [date, setDate] = useState(note.date ?? "");
    const [notes, setNotes] = useState(note.notes ?? "");

    const parsedAmount = Number(amount || 0);
    const parsedHours = hours.trim() === "" ? undefined : Number(hours);

    const dirty = useMemo(() => {
        return (
            name !== note.name ||
            client !== note.client ||
            status !== note.status ||
            pricingType !== note.pricingType ||
            String(note.amount ?? 0) !== amount ||
            String(note.hoursInvested ?? "") !== hours ||
            date !== (note.date ?? "") ||
            notes !== (note.notes ?? "")
        );
    }, [note, name, client, status, pricingType, amount, hours, date, notes]);

    const er = effectiveRate({
        pricingType,
        amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
        hoursInvested: Number.isFinite(parsedHours ?? NaN) ? parsedHours : undefined,
    });

    return (
        <div className="space-y-5">
            <div className="grid gap-4">
                <Field label="Project name">
                    <input
                        className={inputClass()}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Website refresh"
                    />
                </Field>

                <Field label="Client name">
                    <input
                        className={inputClass()}
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        placeholder="ACME Co."
                    />
                </Field>

                <Field label="Status">
                    <Segmented<ProjectStatus>
                        label="Project status"
                        value={status}
                        onChange={setStatus}
                        options={["Discovery", "Build", "Review", "Live"]}
                        dotClass={(opt) => {
                            switch (opt) {
                                case "Live":
                                    return "bg-accent";
                                case "Build":
                                    return "bg-amber-500";
                                case "Review":
                                    return "bg-zinc-400";
                                case "Discovery":
                                default:
                                    return "bg-zinc-300";
                            }
                        }}
                        activeBg={(opt) => {
                            switch (opt) {
                                case "Live":
                                    return "bg-accent/10 ring-1 ring-accent/25";
                                case "Build":
                                    return "bg-amber-500/10 ring-1 ring-amber-500/25";
                                case "Review":
                                    return "bg-zinc-500/10 ring-1 ring-zinc-400/25";
                                case "Discovery":
                                default:
                                    return "bg-zinc-500/10 ring-1 ring-zinc-400/25";
                            }
                        }}
                    />
                </Field>

                <Field label="Pricing type">
                    <Segmented<PricingType>
                        label="Pricing type"
                        value={pricingType}
                        onChange={setPricingType}
                        options={["fixed", "hourly", "retainer"]}
                        dotClass={(opt) => {
                            switch (opt) {
                                case "fixed":
                                    return "bg-accent";
                                case "hourly":
                                    return "bg-amber-500";
                                case "retainer":
                                default:
                                    return "bg-zinc-400";
                            }
                        }}
                        activeBg={(opt) => {
                            switch (opt) {
                                case "fixed":
                                    return "bg-accent/10 ring-1 ring-accent/25";
                                case "hourly":
                                    return "bg-amber-500/10 ring-1 ring-amber-500/25";
                                case "retainer":
                                default:
                                    return "bg-zinc-500/10 ring-1 ring-zinc-400/25";
                            }
                        }}
                    />
                </Field>

                <Field label={pricingLabel(pricingType)} hint="USD">
                    <input
                        className={inputClass()}
                        inputMode="numeric"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={
                            pricingType === "hourly"
                                ? "75"
                                : pricingType === "retainer"
                                    ? "600"
                                    : "3000"
                        }
                    />
                </Field>

                <Field label="Hours invested" hint="Optional">
                    <input
                        className={inputClass()}
                        inputMode="numeric"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        placeholder="12"
                    />
                </Field>

                {er ? (
                    <div className="rounded-xl border border-border/70 bg-surface px-3 py-2 text-sm text-muted-foreground">
                        Effective rate:{" "}
                        <span className="text-foreground font-medium">
                            {formatMoney(er)}/hr
                        </span>
                    </div>
                ) : null}

                <Field label="Date" hint="YYYY-MM-DD">
                    <input
                        className={inputClass()}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="2026-03-01"
                    />
                </Field>

                <Field label="Notes" hint="Optional">
                    <textarea
                        className={`${inputClass()} min-h-[120px] resize-y py-2 leading-6`}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Context, payment method, follow-up…"
                    />
                </Field>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button onClick={onCancel} variant="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={() =>
                        onSave({
                            name: name.trim() || "Untitled",
                            client: client.trim() || "—",
                            status,
                            pricingType,
                            amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
                            hoursInvested:
                                parsedHours === undefined
                                    ? undefined
                                    : Number.isFinite(parsedHours)
                                        ? parsedHours
                                        : undefined,
                            date: date.trim(),
                            notes: notes.trim() || undefined,
                        })
                    }
                    variant="primary"
                    className="ml-auto"
                >
                    {dirty ? "Save changes" : "Close"}
                </Button>
            </div>
        </div>
    );
}
