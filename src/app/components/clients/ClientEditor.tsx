"use client";

import React, { useMemo, useState } from "react";
import type { Client, ClientStatus } from "@/app/lib/store";
import { Button } from "@/app/components/ui/Button";
import { DateInput } from "@/app/components/ui/DateInput";

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

function StatusSegmented({
    value,
    onChange,
}: {
    value: ClientStatus;
    onChange: (v: ClientStatus) => void;
}) {
    const options: ClientStatus[] = ["Lead", "Active", "On hold"];

    const dotClass = (opt: ClientStatus) => {
        switch (opt) {
            case "Active":
                return "bg-accent"; // emerald (your brand)
            case "Lead":
                return "bg-amber-500";
            case "On hold":
            default:
                return "bg-zinc-400";
        }
    };

    const activeBg = (opt: ClientStatus) => {
        switch (opt) {
            case "Active":
                return "bg-accent/10 ring-1 ring-accent/25";
            case "Lead":
                return "bg-amber-500/10 ring-1 ring-amber-500/25";
            case "On hold":
            default:
                return "bg-zinc-500/10 ring-1 ring-zinc-400/25";
        }
    };

    return (
        <div
            className={[
                "inline-flex w-full overflow-hidden rounded-xl",
                "border border-border/70 bg-surface",
            ].join(" ")}
            role="group"
            aria-label="Client status"
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
                            <span className={`h-2 w-2 rounded-full ${dotClass(opt)}`} />
                            <span>{opt}</span>
                        </span>

                        {/* Divider */}
                        {idx !== options.length - 1 ? (
                            <span className="pointer-events-none absolute right-0 top-1/2 h-5 w-px -translate-y-1/2 bg-border/70" />
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}

export function ClientEditor({
    client,
    onSave,
    onCancel,
    onDelete,
}: {
    client: Client;
    onSave: (patch: Partial<Client>) => void;
    onCancel: () => void;
    onDelete?: (id: string) => void;
}) {
    const [name, setName] = useState(client.name);
    const [status, setStatus] = useState<ClientStatus>(client.status);
    const [lastContact, setLastContact] = useState(client.lastContact ?? "");
    const [nextAction, setNextAction] = useState(client.nextAction ?? "");
    const [email, setEmail] = useState(client.email ?? "");
    const [notes, setNotes] = useState(client.notes ?? "");

    const dirty = useMemo(() => {
        return (
            name !== client.name ||
            status !== client.status ||
            lastContact !== (client.lastContact ?? "") ||
            nextAction !== (client.nextAction ?? "") ||
            email !== (client.email ?? "") ||
            notes !== (client.notes ?? "")
        );
    }, [client, name, status, lastContact, nextAction, email, notes]);

    return (
        <div className="space-y-5">
            <div className="grid gap-4">
                <Field label="Client name">
                    <input
                        className={inputClass()}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ACME Co."
                    />
                </Field>
                
                <Field label="Status">
                    <StatusSegmented value={status} onChange={setStatus} />
                </Field>
                
                <Field label="Last contact">
                    <DateInput
                        value={lastContact}
                        onChange={setLastContact}
                        aria-label="Last contact date"
                    />
                </Field>

                <Field label="Next action">
                    <input
                        className={inputClass()}
                        value={nextAction}
                        onChange={(e) => setNextAction(e.target.value)}
                        placeholder="Follow up on proposal"
                    />
                </Field>

                <Field label="Email">
                    <input
                        className={inputClass()}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                    />
                </Field>

                <Field label="Notes">
                    <textarea
                        className={`${inputClass()} min-h-[120px] resize-y py-2 leading-6`}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Context, preferences, meeting notes…"
                    />
                </Field>
            </div>

            <div className="flex flex-wrap gap-2">
                {onDelete ? (
                    <Button
                        onClick={() => onDelete(client.id)}
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
                            name: name.trim() || "Untitled",
                            status,
                            lastContact: lastContact.trim() || undefined,
                            nextAction: nextAction.trim(),
                            email: email.trim(),
                            notes: notes.trim(),
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