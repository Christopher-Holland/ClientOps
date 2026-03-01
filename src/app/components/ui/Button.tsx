import React from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
    href?: string;
    onClick?: () => void;
    children: React.ReactNode;
    variant?: Variant;
    className?: string;
    type?: "button" | "submit" | "reset";
};

function baseClasses() {
    return "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-900/15";
}

function variantClasses(variant: Variant) {
    switch (variant) {
        case "primary":
            return "bg-slate-900 text-white hover:opacity-90";
        case "secondary":
            return "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50";
        case "ghost":
        default:
            return "text-slate-700 hover:bg-slate-100";
    }
}

export function Button({
    href,
    onClick,
    children,
    variant = "primary",
    className = "",
    type = "button",
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
        <button type={type} onClick={onClick} className={classes}>
            {children}
        </button>
    );
}