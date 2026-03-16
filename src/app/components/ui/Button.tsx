import React from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
    href?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
    variant?: Variant;
    className?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
};

function baseClasses() {
    return "inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ring";
}

function variantClasses(variant: Variant) {
    switch (variant) {
        case "primary":
            return "bg-accent text-accent-foreground hover:opacity-90";
        case "secondary":
            return "border border-border bg-card text-card-foreground hover:bg-surface";
        case "ghost":
        default:
            return "text-foreground hover:bg-surface-hover";
    }
}

export function Button({
    href,
    onClick,
    children,
    variant = "primary",
    className = "",
    type = "button",
    disabled = false,
}: Props) {
    const classes = `${baseClasses()} ${variantClasses(variant)} ${className}`;

    const isExternal =
        href?.startsWith("http") || href?.startsWith("mailto:") || href?.startsWith("tel:");

    if (href && isExternal) {
        return (
            <a
                href={href}
                className={classes}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
                {children}
            </a>
        );
    }

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} className={classes} disabled={disabled}>
            {children}
        </button>
    );
}