"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { DateInput } from "@/app/components/ui/DateInput";

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue";

export type Invoice = {
    id: string;
    client: string;
    project?: string;
    amount: number; // USD
    status: InvoiceStatus;
    issuedOn?: string; // YYYY-MM-DD
    dueOn?: string; // YYYY-MM-DD
    paidOn?: string; // YYYY-MM-DD
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
                {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
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
                            active ? `text-foreground ${activeBg(opt)}` : "text-muted-foreground",
                        ].join(" ")}
                    >
                        <span className="inline-flex items-center justify-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${dotClass(opt)}`} />
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

function formatMoney(n: number) {
    return n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });
}

export function InvoiceEditor({
    invoice,
    onSave,
    onCancel,
    onDelete,
}: {
    invoice: Invoice;
    onSave: (patch: Partial<Invoice>) => void;
    onCancel: () => void;
    onDelete?: (id: string) => void;
}) {
    const [client, setClient] = useState(invoice.client ?? "");
    const [project, setProject] = useState(invoice.project ?? "");
    const [amount, setAmount] = useState(String(invoice.amount ?? 0));
    const [status, setStatus] = useState<InvoiceStatus>(invoice.status);
    const [issuedOn, setIssuedOn] = useState(invoice.issuedOn ?? "");
    const [dueOn, setDueOn] = useState(invoice.dueOn ?? "");
    const [paidOn, setPaidOn] = useState(invoice.paidOn ?? "");
    const [notes, setNotes] = useState(invoice.notes ?? "");

    const parsedAmount = Number(amount || 0);

    const dirty = useMemo(() => {
        return (
            client !== (invoice.client ?? "") ||
            project !== (invoice.project ?? "") ||
            amount !== String(invoice.amount ?? 0) ||
            status !== invoice.status ||
            issuedOn !== (invoice.issuedOn ?? "") ||
            dueOn !== (invoice.dueOn ?? "") ||
            paidOn !== (invoice.paidOn ?? "") ||
            notes !== (invoice.notes ?? "")
        );
    }, [invoice, client, project, amount, status, issuedOn, dueOn, paidOn, notes]);

    const showPaidOn = status === "Paid";

    return (
        <div className="space-y-5">
            <div className="grid gap-4">
                <Field label="Client">
                    <input
                        className={inputClass()}
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        placeholder="ACME Co."
                    />
                </Field>

                <Field label="Project" hint="Optional">
                    <input
                        className={inputClass()}
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                        placeholder="Website refresh"
                    />
                </Field>

                <Field label="Amount" hint="USD">
                    <input
                        className={inputClass()}
                        inputMode="numeric"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="500"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                        Preview: <span className="text-foreground font-medium">{formatMoney(Number.isFinite(parsedAmount) ? parsedAmount : 0)}</span>
                    </div>
                </Field>

                <Field label="Status">
                    <Segmented<InvoiceStatus>
                        label="Invoice status"
                        value={status}
                        onChange={setStatus}
                        options={["Draft", "Sent", "Paid", "Overdue"]}
                        dotClass={(opt) => {
                            switch (opt) {
                                case "Paid":
                                    return "bg-accent";
                                case "Sent":
                                    return "bg-amber-500";
                                case "Overdue":
                                    return "bg-red-500";
                                case "Draft":
                                default:
                                    return "bg-zinc-400";
                            }
                        }}
                        activeBg={(opt) => {
                            switch (opt) {
                                case "Paid":
                                    return "bg-accent/10 ring-1 ring-accent/25";
                                case "Sent":
                                    return "bg-amber-500/10 ring-1 ring-amber-500/25";
                                case "Overdue":
                                    return "bg-red-500/10 ring-1 ring-red-500/25";
                                case "Draft":
                                default:
                                    return "bg-zinc-500/10 ring-1 ring-zinc-400/25";
                            }
                        }}
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Issued">
                        <DateInput
                            value={issuedOn}
                            onChange={setIssuedOn}
                            aria-label="Issued date"
                        />
                    </Field>

                    <Field label="Due">
                        <DateInput
                            value={dueOn}
                            onChange={setDueOn}
                            aria-label="Due date"
                        />
                    </Field>
                </div>

                {showPaidOn ? (
                    <Field label="Paid on">
                        <DateInput
                            value={paidOn}
                            onChange={setPaidOn}
                            aria-label="Paid date"
                        />
                    </Field>
                ) : null}

                <Field label="Notes" hint="Optional">
                    <textarea
                        className={`${inputClass()} min-h-[120px] resize-y py-2 leading-6`}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Payment method, follow-up reminders, context…"
                    />
                </Field>
            </div>

            <div className="flex flex-wrap gap-2">
                {onDelete ? (
                    <Button
                        onClick={() => onDelete(invoice.id)}
                        variant="secondary"
                        className="text-red-600 hover:bg-red-100 hover:text-red-700"
                    >
                        Delete
                    </Button>
                ) : null}
                <Button onClick={onCancel} variant="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={() =>
                        onSave({
                            client: client.trim() || "—",
                            project: project.trim() || undefined,
                            amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
                            status,
                            issuedOn: issuedOn.trim() || undefined,
                            dueOn: dueOn.trim() || undefined,
                            paidOn: showPaidOn ? (paidOn.trim() || undefined) : undefined,
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