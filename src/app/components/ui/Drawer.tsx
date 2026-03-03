"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

export function Drawer({
    open,
    onClose,
    title,
    children,
    footer,
}: {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <button
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            />

            {/* Panel */}
            <div
                className={cx(
                    "absolute right-0 top-0 h-full w-full bg-card text-card-foreground",
                    "border-l border-border/70 shadow-[0_24px_64px_rgba(0,0,0,0.25)]",
                    "sm:w-[520px]"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-border/70 bg-surface px-5 py-4">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold tracking-tight">
                                {title ?? "Details"}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                Edit details and save changes.
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-xl p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition"
                            aria-label="Close drawer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content: scrollable, with bottom padding on mobile so buttons clear the MobileNav */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 pb-24 lg:pb-5">{children}</div>

                    {/* Footer */}
                    {footer ? (
                        <div className="border-t border-border/70 bg-surface px-5 py-4">
                            {footer}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}