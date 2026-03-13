"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import type { UserRole } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardLayoutProps {
    children: ReactNode;
    role?: UserRole;
    userName?: string;
    userYear?: string;
    userProgram?: string;
}

export function DashboardLayout({ children, role, userName, userYear, userProgram }: DashboardLayoutProps) {
    const { user } = useAuth();

    // Prefer explicit props, fall back to auth context
    const resolvedRole = role ?? ((user as any)?.role as UserRole) ?? "student";
    const resolvedName = userName ?? user?.name ?? "User";
    const resolvedYear = userYear ?? (user as any)?.year;
    const resolvedProgram = userProgram ?? (user as any)?.program;

    return (
        <div className="min-h-screen bg-background">
            <Sidebar role={resolvedRole} />
            <div className="pl-64">
                <Navbar
                    userName={resolvedName}
                    role={resolvedRole}
                    userYear={resolvedYear}
                    userProgram={resolvedProgram}
                />
                <main className="p-6 max-w-screen-2xl">{children}</main>
            </div>
        </div>
    );
}
