"use client";

import { cn } from "../../lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    User,
    FileText,
    Target,
    MessageSquare,
    Settings,
    Users,
    BarChart3,
    AlertTriangle,
    LineChart,
    Bell,
    Code2,
    Trophy,
    BookOpen,
    GraduationCap,
    Building2,
    UserCheck,
    Download,
    ChevronRight,
    StickyNote,
    LayoutGrid,
    Sparkles,
    Dna,
    Flame,
    Compass,
    Calendar,
} from "lucide-react";

export type UserRole = "student" | "admin" | "dean" | "director" | "program_chair" | "faculty_mentor" | "course_coordinator" | "placement_dept" | "alumni";

interface SidebarProps {
    role: UserRole;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const studentNavItems = [
    { icon: LayoutDashboard, label: "Dashboard",            href: "/student/dashboard",       group: "main" },
    { icon: User,            label: "My Profile",           href: "/student/profile",          group: "main" },
    { icon: Dna,             label: "Career DNA",           href: "/student/career-dna",       group: "discover" },
    { icon: Flame,           label: "Daily Spark",          href: "/student/daily-spark",      group: "discover" },
    { icon: Compass,         label: "Peer Compass",         href: "/student/peer-compass",     group: "discover" },
    { icon: Calendar,        label: "Monthly Nudge",        href: "/student/monthly-nudge",    group: "discover" },
    { icon: Sparkles,        label: "AI Skill Gap",         href: "/student/skill-gap-analysis", group: "prep" },
    { icon: Target,          label: "AI Roadmap",           href: "/student/roadmap",          group: "prep" },
    { icon: MessageSquare,   label: "AI Mock Interview",    href: "/student/interview",        group: "prep" },
    { icon: FileText,        label: "Resume Analyzer",      href: "/student/resume-analyzer",  group: "prep" },
    { icon: Code2,           label: "LeetCode Tracker",     href: "/student/leetcode",         group: "prep" },
];

const facultyMentorNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/faculty-mentor/dashboard", group: "main" },
    { icon: Users, label: "My Mentees", href: "/faculty-mentor/mentees", group: "main" },
    { icon: StickyNote, label: "Add Notes", href: "/faculty-mentor/notes", group: "main" },
    { icon: Bell, label: "Notifications", href: "/faculty-mentor/notifications", group: "other" },
    { icon: Settings, label: "Settings", href: "/faculty-mentor/settings", group: "other" },
];

const coordinatorNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/coordinator/dashboard", group: "main" },
    { icon: BookOpen, label: "Curriculum Manager", href: "/coordinator/curriculum", group: "main" },
    { icon: LayoutGrid, label: "Career Alignment", href: "/coordinator/alignment", group: "main" },
    { icon: Settings, label: "Settings", href: "/coordinator/settings", group: "other" },
];

const adminNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard", group: "main" },
    { icon: Users, label: "Students", href: "/admin/students", group: "main" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics", group: "insights" },
    { icon: AlertTriangle, label: "At-Risk Students", href: "/admin/skill-gaps", group: "insights" },
    { icon: LineChart, label: "Predictions", href: "/admin/predictions", group: "insights" },
    { icon: Code2, label: "LeetCode Overview", href: "/admin/leetcode", group: "insights" },
    { icon: Download, label: "Reports", href: "/admin/reports", group: "placement" },
    { icon: Building2, label: "Company JDs", href: "/admin/companies", group: "placement" },
    { icon: GraduationCap, label: "Alumni Network", href: "/admin/alumni", group: "placement" },
    { icon: Bell, label: "Notifications", href: "/admin/notifications", group: "other" },
    { icon: UserCheck, label: "Role Management", href: "/admin/roles", group: "other" },
    { icon: Settings, label: "Settings", href: "/admin/settings", group: "other" },
];

const alumniNavItems = [
    { icon: User, label: "My Alumni Profile", href: "/student/profile", group: "main" },
    { icon: GraduationCap, label: "Alumni Network", href: "/alumni/network", group: "main" },
    { icon: Trophy, label: "My Journey", href: "/alumni/journey", group: "main" },
];

const groupLabels: Record<string, string> = {
    main:     "Overview",
    discover: "Discover Yourself",
    prep:     "Placement Prep",
    placement: "Placement",
    insights: "Insights",
    other:    "General",
};

function getNavItems(role: UserRole) {
    if (role === "student") return studentNavItems;
    if (role === "alumni") return alumniNavItems;
    if (role === "faculty_mentor") return facultyMentorNavItems;
    if (role === "course_coordinator") return coordinatorNavItems;
    return adminNavItems;
}

export function Sidebar({ role, isOpen, setIsOpen }: SidebarProps) {
    const location = useLocation();
    const pathname = location.pathname;
    const navItems = getNavItems(role);

    // Group nav items
    const groups: Record<string, typeof navItems> = {};
    navItems.forEach((item) => {
        if (!groups[item.group]) groups[item.group] = [];
        groups[item.group].push(item);
    });

    const roleLabel: Record<UserRole, string> = {
        student: "Student",
        admin: "Admin",
        dean: "Dean",
        director: "Director",
        program_chair: "Program Chair",
        faculty_mentor: "Faculty Mentor",
        course_coordinator: "Course Coordinator",
        placement_dept: "Placement Dept.",
        alumni: "Alumni",
    };

    const roleColor: Record<UserRole, string> = {
        student: "bg-blue-100 text-blue-700",
        admin: "bg-red-100 text-red-700",
        dean: "bg-purple-100 text-purple-700",
        director: "bg-gray-100 text-gray-700",
        program_chair: "bg-indigo-100 text-indigo-700",
        faculty_mentor: "bg-teal-100 text-teal-700",
        course_coordinator: "bg-cyan-100 text-cyan-700",
        placement_dept: "bg-orange-100 text-orange-700",
        alumni: "bg-green-100 text-green-700",
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen w-64 border-r bg-card shadow-sm transition-transform duration-300 lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center border-b px-5 gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-sm">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-base font-bold text-foreground">Campus2Career</span>
                        <p className="text-xs text-muted-foreground leading-none">NMIMS Hyderabad</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                    {Object.entries(groups).map(([group, items]) => (
                        <div key={group}>
                            <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {groupLabels[group] || group}
                            </p>
                            <div className="space-y-0.5">
                                {items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                                    return (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            className={cn(
                                                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                                                isActive
                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            )}
                                        >
                                            <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
                                            <span className="flex-1 truncate">{item.label}</span>
                                            {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary opacity-70" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Role Badge */}
                <div className="border-t p-4">
                    <div className={cn("rounded-lg px-3 py-2 text-center text-xs font-semibold", roleColor[role])}>
                        {roleLabel[role]} Portal
                    </div>
                </div>
                </div>
            </aside>
        </>
    );
}
