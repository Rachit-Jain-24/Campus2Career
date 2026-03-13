import type { AdminPermission } from '../config/admin/permissions';

// Dashboard Metric Cards
export interface DashboardStats {
    totalStudents: number;
    eligibleStudents: number;
    companiesOnboarded: number;
    activeDrives: number;
    offersReleased: number;
    placementRate: number; // percentage
}

export interface MetricCardConfig {
    title: string;
    value: string | number;
    icon: any; // LucideIcon
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
        label: string;
    };
    requiredPermission?: AdminPermission;
}

// Visual Analytics
export interface DepartmentStat {
    name: string;
    placed: number;
    unplaced: number;
    total: number;
    rate: number;
}

export interface FunnelStat {
    stage: string;
    count: number;
    fill: string; // Hex color for chart
}

export interface CareerGoalStat {
    goal: string;
    count: number;
}

export interface YearlyProgressStat {
    year: string;
    completed: number;
    pending: number;
}

// Activity & Alerts
export interface ActivityItem {
    id: string;
    type: 'company' | 'student' | 'drive' | 'offer' | 'system';
    title: string;
    description: string;
    timestamp: Date;
}

export interface InterviewItem {
    id: string;
    companyId: string;
    companyName: string;
    role: string;
    date: Date;
    type: 'technical' | 'hr' | 'aptitude' | 'group_discussion';
    candidatesCount: number;
    status: 'scheduled' | 'ongoing' | 'completed';
}

export interface AlertItem {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    message: string;
    actionLabel?: string;
    actionLink?: string;
    requiredPermission?: AdminPermission;
}
