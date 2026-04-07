import { useState, type ReactNode } from "react";
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
    className?: string;
}

export function DashboardLayout({ children, role, userName, userYear, userProgram, className }: DashboardLayoutProps) {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Prefer explicit props, fall back to auth context
    const resolvedRole = role ?? ((user as any)?.role as UserRole) ?? "student";
    const resolvedName = userName ?? user?.name ?? "User";
    const resolvedYear = userYear ?? (user as any)?.currentYear;
    const resolvedProgram = userProgram ?? (user as any)?.branch;

    return (
        <div className={`min-h-screen ${className || "bg-background"}`}>
            <Sidebar role={resolvedRole} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <Navbar
                    userName={resolvedName}
                    role={resolvedRole}
                    userYear={resolvedYear}
                    userProgram={resolvedProgram}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
                <main className="p-4 md:p-6 lg:p-8 flex-1 max-w-screen-2xl mx-auto w-full">{children}</main>
            </div>
        </div>
    );
}
