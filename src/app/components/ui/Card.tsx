import React from "react";

type Props = {
    children: React.ReactNode;
    className?: string;
};

export function Card({ children, className = "" }: Props) {
    return (
        <div
            className={[
                "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition",
                "hover:-translate-y-0.5 hover:shadow-md",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}