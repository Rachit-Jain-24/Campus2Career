import type { LucideIcon } from 'lucide-react';

export interface AdminNavItem {
    path: string;
    label: string;
    icon: LucideIcon;
    section?: string;
    allowedRoles?: import('./auth').AdminRole[];
}

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
}

