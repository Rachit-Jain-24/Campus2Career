import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Building2,
    Briefcase,
    ShieldCheck,
    CalendarCheck,
    Award,
    BarChart3,
    Settings,
    History,
    Landmark,
    Target,
    BookOpen,
    UserCheck,
    Handshake,
    ServerCog,
} from 'lucide-react';
import type { AdminNavItem } from '../../types/admin';

export const ADMIN_NAVIGATION: AdminNavItem[] = [
    // ─── Role-Specific Dashboard Links ───
    {
        path: '/admin/dean',
        label: 'Dean Dashboard',
        icon: Landmark,
        section: 'Overview',
        allowedRoles: ['dean'],
    },
    {
        path: '/admin/director',
        label: 'Director Dashboard',
        icon: Target,
        section: 'Overview',
        allowedRoles: ['director'],
    },
    {
        path: '/admin/program-chair',
        label: 'Program Chair Dashboard',
        icon: BookOpen,
        section: 'Overview',
        allowedRoles: ['program_chair'],
    },
    {
        path: '/admin/faculty',
        label: 'Faculty Dashboard',
        icon: UserCheck,
        section: 'Overview',
        allowedRoles: ['faculty'],
    },
    {
        path: '/admin/placement-officer',
        label: 'Placement Officer Dashboard',
        icon: Handshake,
        section: 'Overview',
        allowedRoles: ['placement_officer'],
    },
    {
        path: '/admin/system-admin',
        label: 'System Admin Dashboard',
        icon: ServerCog,
        section: 'Overview',
        allowedRoles: ['system_admin'],
    },
    {
        path: '/admin/dashboard',
        label: 'Overview Dashboard',
        icon: LayoutDashboard,
        section: 'Overview',
        // Accessible to all admins as a general fallback
    },

    // ─── Directory ───
    {
        path: '/admin/users',
        label: 'User Management',
        icon: Users,
        section: 'Directory',
        allowedRoles: ['system_admin'],
    },
    {
        path: '/admin/students',
        label: 'Students Directory',
        icon: GraduationCap,
        section: 'Directory',
        allowedRoles: ['system_admin', 'dean', 'director', 'program_chair', 'placement_officer', 'faculty'],
    },
    {
        path: '/admin/batch-analytics',
        label: 'Batch Analytics',
        icon: BarChart3,
        section: 'Directory',
        allowedRoles: ['system_admin', 'dean', 'director', 'program_chair', 'placement_officer', 'faculty'],
    },

    // ─── Placement Operations ───
    {
        path: '/admin/companies',
        label: 'Companies',
        icon: Building2,
        section: 'Placement Operations',
        allowedRoles: ['system_admin', 'director', 'placement_officer'],
    },
    {
        path: '/admin/drives',
        label: 'Placement Drives',
        icon: Briefcase,
        section: 'Placement Operations',
        allowedRoles: ['system_admin', 'director', 'placement_officer'],
    },
    {
        path: '/admin/interviews',
        label: 'Interviews',
        icon: CalendarCheck,
        section: 'Placement Operations',
        allowedRoles: ['system_admin', 'placement_officer', 'faculty'],
    },
    {
        path: '/admin/offers',
        label: 'Offers & Outcomes',
        icon: Award,
        section: 'Placement Operations',
        allowedRoles: ['system_admin', 'placement_officer'],
    },

    // ─── Configuration ───
    {
        path: '/admin/eligibility-rules',
        label: 'Eligibility Rules',
        icon: ShieldCheck,
        section: 'System Configuration',
        allowedRoles: ['system_admin', 'program_chair'],
    },

    // ─── Insights ───
    {
        path: '/admin/reports',
        label: 'Reports & Analytics',
        icon: BarChart3,
        section: 'Insights',
        allowedRoles: ['system_admin', 'dean', 'director', 'program_chair', 'placement_officer'],
    },

    // ─── System ───
    {
        path: '/admin/settings',
        label: 'Platform Settings',
        icon: Settings,
        section: 'System',
        allowedRoles: ['system_admin'],
    },
    {
        path: '/admin/audit-logs',
        label: 'Audit Logs',
        icon: History,
        section: 'System',
        allowedRoles: ['system_admin'],
    },
];
