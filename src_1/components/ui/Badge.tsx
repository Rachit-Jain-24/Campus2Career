import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
    className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
    const variants = {
        default: "bg-secondary text-secondary-foreground",
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        outline: "border border-primary text-primary hover:bg-primary/5",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
