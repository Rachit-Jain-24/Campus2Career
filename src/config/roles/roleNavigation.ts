import {
    LayoutDashboard, Users, GraduationCap, Building2, Briefcase,
    ShieldCheck, CalendarCheck, Award, BarChart3, Settings, History,
    Landmark, Target, BookOpen, UserCheck, Handshake, ServerCog,
} from 'lucide-react';

export interface RoleNavItem {
    path: string;
    label: string;
    icon: any;
    section: string;
}

// ── System Admin ──────────────────────────────────────────────
export const ADMIN_NAV: RoleNavItem[] = [
    { path: '/admin/dashboard', label: 'System Admin Dashboard', icon: ServerCog, section: 'Overview' },
    { path: '/admin/users', label: 'User Management', icon: Users, section: 'Directory' },
    { path: '/admin/students', label: 'Students Directory', icon: GraduationCap, section: 'Directory' },
    { path: '/admin/batch-analytics', label: 'Batch Analytics', icon: BarChart3, section: 'Directory' },
    { path: '/admin/eligibility-rules', label: 'Eligibility Rules', icon: ShieldCheck, section: 'System Configuration' },
    { path: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3, section: 'Insights' },
    { path: '/admin/settings', label: 'Platform Settings', icon: Settings, section: 'System' },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: History, section: 'System' },
];

// ── Dean ──────────────────────────────────────────────────────
export const DEAN_NAV: RoleNavItem[] = [
    { path: '/dean/dashboard', label: 'Dean Dashboard', icon: Landmark, section: 'Overview' },
    { path: '/dean/students', label: 'Students Directory', icon: GraduationCap, section: 'Directory' },
    { path: '/dean/batch-analytics', label: 'Batch Analytics', icon: BarChart3, section: 'Directory' },
    { path: '/dean/reports', label: 'Reports & Analytics', icon: BarChart3, section: 'Insights' },
];

// ── Director ──────────────────────────────────────────────────
export const DIRECTOR_NAV: RoleNavItem[] = [
    { path: '/director/dashboard', label: 'Director Dashboard', icon: Target, section: 'Overview' },
    { path: '/director/students', label: 'Students Directory', icon: GraduationCap, section: 'Directory' },
    { path: '/director/batch-analytics', label: 'Batch Analytics', icon: BarChart3, section: 'Directory' },
    { path: '/director/reports', label: 'Reports & Analytics', icon: BarChart3, section: 'Insights' },
];

// ── Program Chair ─────────────────────────────────────────────
export const PROGRAM_CHAIR_NAV: RoleNavItem[] = [
    { path: '/program-chair/dashboard', label: 'Program Chair Dashboard', icon: BookOpen, section: 'Overview' },
    { path: '/program-chair/students', label: 'Students Directory', icon: GraduationCap, section: 'Directory' },
    { path: '/program-chair/batch-analytics', label: 'Batch Analytics', icon: BarChart3, section: 'Directory' },
    { path: '/program-chair/reports', label: 'Reports & Analytics', icon: BarChart3, section: 'Insights' },
    { path: '/program-chair/eligibility-rules', label: 'Eligibility Rules', icon: ShieldCheck, section: 'Configuration' },
];

// ── Faculty ───────────────────────────────────────────────────
export const FACULTY_NAV: RoleNavItem[] = [
    { path: '/faculty/dashboard', label: 'Faculty Dashboard', icon: UserCheck, section: 'Overview' },
    { path: '/faculty/students', label: 'Students Directory', icon: GraduationCap, section: 'Directory' },
    { path: '/faculty/batch-analytics', label: 'Batch Analytics', icon: BarChart3, section: 'Directory' },
];

// ── Placement Officer ─────────────────────────────────────────
export const PLACEMENT_NAV: RoleNavItem[] = [
    { path: '/placement/dashboard', label: 'Placement Officer Dashboard', icon: Handshake, section: 'Overview' },
    { path: '/placement/companies', label: 'Companies', icon: Building2, section: 'Placement Operations' },
    { path: '/placement/drives', label: 'Placement Drives', icon: Briefcase, section: 'Placement Operations' },
    { path: '/placement/interviews', label: 'Interviews', icon: CalendarCheck, section: 'Placement Operations' },
    { path: '/placement/offers', label: 'Offers & Outcomes', icon: Award, section: 'Placement Operations' },
    { path: '/placement/reports', label: 'Reports & Analytics', icon: BarChart3, section: 'Insights' },
];
