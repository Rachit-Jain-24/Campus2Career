// ─────────────────────────────────────────────────────────────
// Central Dashboard Data Hook
// Aggregates live Firestore data from existing services for
// every dashboard page. Page components consume what they need.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { fetchAllStudents } from '../../services/admin/students.service';
import { fetchAllCompanies } from '../../services/admin/companies.service';
import { drivesService } from '../../services/admin/drives.service';
import { interviewsService } from '../../services/admin/interviews.service';
import { offersService } from '../../services/admin/offers.service';
import { usersService } from '../../services/admin/users.service';
import { auditService } from '../../services/admin/audit.service';
import { eligibilityService } from '../../services/admin/eligibility.service';

import type { AdminStudentProfile } from '../../types/studentAdmin';
import type { AdminCompanyProfile } from '../../types/companyAdmin';
import type { AdminDriveProfile } from '../../types/driveAdmin';
import type { AdminInterview } from '../../types/interviewAdmin';
import type { AdminOffer } from '../../types/offerAdmin';
import type { AdminUserProfile } from '../../types/userAdmin';
import type { AuditLogEntry } from '../../types/auditAdmin';
import type { AdminEligibilityRule } from '../../types/eligibilityAdmin';
import type {
    DashboardStats,
    DepartmentStat,
    FunnelStat,
    ActivityItem,
    InterviewItem,
    AlertItem,
} from '../../types/adminDashboard';

// ── Role count helper type ──
export interface RoleCounts {
    dean: number;
    director: number;
    program_chair: number;
    faculty: number;
    placement_officer: number;
    system_admin: number;
    total: number;
}

// ── Hook return shape ──
export interface DashboardData {
    // Aggregated KPIs
    stats: DashboardStats;

    // Chart-ready datasets
    departmentStats: DepartmentStat[];
    funnelStats: FunnelStat[];

    // Widgets
    upcomingInterviews: InterviewItem[];
    recentActivity: ActivityItem[];
    alerts: AlertItem[];

    // Raw collections for role dashboards
    students: AdminStudentProfile[];
    companies: AdminCompanyProfile[];
    drives: AdminDriveProfile[];
    interviews: AdminInterview[];
    offers: AdminOffer[];
    users: AdminUserProfile[];
    auditLogs: AuditLogEntry[];
    eligibilityRules: AdminEligibilityRule[];

    // Derived counts
    roleCounts: RoleCounts;

    // State
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

// ── Aggregation helpers (kept out of React render cycle) ──

function computeStats(
    students: AdminStudentProfile[],
    companies: AdminCompanyProfile[],
    drives: AdminDriveProfile[],
    offers: AdminOffer[]
): DashboardStats {
    const totalStudents = students.length;
    const eligibleStudents = students.filter((s: any) =>
        s.placementStatus === 'eligible' || s.placementStatus === 'placed' || s.eligibilityStatus === 'eligible'
    ).length;
    const companiesOnboarded = companies.length;
    const activeDrives = drives.filter((d: any) =>
        d.status === 'active' || d.status === 'open' || d.status === 'ongoing'
    ).length;
    const offersReleased = offers.length;
    const placedStudents = students.filter((s: any) =>
        s.placementStatus === 'placed'
    ).length;
    const placementRate = totalStudents > 0
        ? parseFloat(((placedStudents / totalStudents) * 100).toFixed(1))
        : 0;

    return {
        totalStudents,
        eligibleStudents,
        companiesOnboarded,
        activeDrives,
        offersReleased,
        placementRate,
    };
}

function computeDepartmentStats(students: AdminStudentProfile[]): DepartmentStat[] {
    const deptMap: Record<string, { placed: number; unplaced: number }> = {};

    students.forEach((s: any) => {
        const dept = s.department || s.branch || 'Unknown';
        if (!deptMap[dept]) deptMap[dept] = { placed: 0, unplaced: 0 };
        if (s.placementStatus === 'placed') {
            deptMap[dept].placed++;
        } else {
            deptMap[dept].unplaced++;
        }
    });

    return Object.entries(deptMap)
        .map(([name, { placed, unplaced }]) => {
            const total = placed + unplaced;
            return {
                name,
                placed,
                unplaced,
                total,
                rate: total > 0 ? parseFloat(((placed / total) * 100).toFixed(1)) : 0,
            };
        })
        .sort((a, b) => b.total - a.total);
}

function computeFunnelStats(students: AdminStudentProfile[], offers: AdminOffer[]): FunnelStat[] {
    const total = students.length;
    const eligible = students.filter((s: any) =>
        s.placementStatus === 'eligible' || s.placementStatus === 'placed' || s.eligibilityStatus === 'eligible'
    ).length;
    const applied = students.filter((s: any) =>
        s.placementStatus === 'applied' || s.placementStatus === 'eligible' || s.placementStatus === 'placed'
    ).length;
    const shortlisted = students.filter((s: any) =>
        s.placementStatus === 'shortlisted' || s.placementStatus === 'placed'
    ).length;
    const offered = offers.length;

    return [
        { stage: 'Registered', count: total, fill: '#3b82f6' },
        { stage: 'Eligible', count: eligible, fill: '#8b5cf6' },
        { stage: 'Applied', count: Math.max(applied, eligible), fill: '#f59e0b' },
        { stage: 'Shortlisted', count: Math.max(shortlisted, offered), fill: '#10b981' },
        { stage: 'Offered', count: offered, fill: '#e11d48' },
    ];
}

function buildUpcomingInterviews(interviews: AdminInterview[]): InterviewItem[] {
    const now = new Date();
    return interviews
        .filter((i: any) => {
            const date = i.scheduledDate instanceof Date ? i.scheduledDate : new Date(i.scheduledDate);
            return date >= now && (i.status === 'scheduled' || i.status === 'ongoing');
        })
        .sort((a: any, b: any) => {
            const da = a.scheduledDate instanceof Date ? a.scheduledDate : new Date(a.scheduledDate);
            const db = b.scheduledDate instanceof Date ? b.scheduledDate : new Date(b.scheduledDate);
            return da.getTime() - db.getTime();
        })
        .slice(0, 5)
        .map((i: any) => ({
            id: i.id,
            companyId: i.companyId || '',
            companyName: i.companyName || 'Unknown Company',
            role: i.role || i.driveTitle || 'Interview',
            date: i.scheduledDate instanceof Date ? i.scheduledDate : new Date(i.scheduledDate),
            type: (i.roundType || 'technical') as InterviewItem['type'],
            candidatesCount: i.candidateCount || i.candidatesCount || 1,
            status: (i.status === 'ongoing' ? 'ongoing' : 'scheduled') as InterviewItem['status'],
        }));
}

function buildRecentActivity(auditLogs: AuditLogEntry[]): ActivityItem[] {
    return auditLogs.slice(0, 6).map((log) => {
        let type: ActivityItem['type'] = 'system';
        if (log.module === 'companies') type = 'company';
        else if (log.module === 'students') type = 'student';
        else if (log.module === 'drives') type = 'drive';
        else if (log.module === 'offers') type = 'offer';

        return {
            id: log.id,
            type,
            title: `${log.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
            description: log.summary,
            timestamp: log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp),
        };
    });
}

function buildAlerts(
    drives: AdminDriveProfile[],
    offers: AdminOffer[],
    interviews: AdminInterview[]
): AlertItem[] {
    const alerts: AlertItem[] = [];

    // Check for pending offers
    const pendingOffers = offers.filter((o: any) => o.status === 'issued' || o.status === 'pending').length;
    if (pendingOffers > 0) {
        alerts.push({
            id: 'alert_pending_offers',
            type: 'warning',
            message: `${pendingOffers} offer${pendingOffers > 1 ? 's' : ''} awaiting student acceptance.`,
            actionLabel: 'View Offers',
            actionLink: '/admin/offers',
            requiredPermission: 'manage_offers',
        });
    }

    // Check for drives with no applicants
    const emptyDrives = drives.filter((d: any) =>
        (d.status === 'active' || d.status === 'open') && (!d.applicantCount || d.applicantCount === 0)
    ).length;
    if (emptyDrives > 0) {
        alerts.push({
            id: 'alert_empty_drives',
            type: 'info',
            message: `${emptyDrives} active drive${emptyDrives > 1 ? 's have' : ' has'} no applicants yet.`,
            actionLabel: 'View Drives',
            actionLink: '/admin/drives',
            requiredPermission: 'manage_drives',
        });
    }

    // Check for upcoming interviews today
    const today = new Date();
    const todayInterviews = interviews.filter((i: any) => {
        const d = i.scheduledDate instanceof Date ? i.scheduledDate : new Date(i.scheduledDate);
        return d.toDateString() === today.toDateString() && i.status !== 'completed';
    }).length;
    if (todayInterviews > 0) {
        alerts.push({
            id: 'alert_today_interviews',
            type: 'info',
            message: `${todayInterviews} interview${todayInterviews > 1 ? 's' : ''} scheduled for today.`,
            actionLabel: 'View Schedule',
            actionLink: '/admin/interviews',
            requiredPermission: 'manage_interviews',
        });
    }

    return alerts;
}

function computeRoleCounts(users: AdminUserProfile[]): RoleCounts {
    const counts: RoleCounts = {
        dean: 0, director: 0, program_chair: 0,
        faculty: 0, placement_officer: 0, system_admin: 0, total: 0,
    };
    users.forEach((u: any) => {
        const role = u.role as keyof Omit<RoleCounts, 'total'>;
        if (role in counts) counts[role]++;
        counts.total++;
    });
    return counts;
}

// ── The Hook ─────────────────────────────────────────────────

export const useDashboardData = (): DashboardData => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Raw collections
    const [students, setStudents] = useState<AdminStudentProfile[]>([]);
    const [companies, setCompanies] = useState<AdminCompanyProfile[]>([]);
    const [drives, setDrives] = useState<AdminDriveProfile[]>([]);
    const [interviews, setInterviews] = useState<AdminInterview[]>([]);
    const [offers, setOffers] = useState<AdminOffer[]>([]);
    const [users, setUsers] = useState<AdminUserProfile[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [eligibilityRules, setEligibilityRules] = useState<AdminEligibilityRule[]>([]);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [
                studentsData,
                companiesData,
                drivesData,
                interviewsData,
                offersData,
                usersData,
                auditData,
                eligibilityData,
            ] = await Promise.allSettled([
                fetchAllStudents(),
                fetchAllCompanies(),
                drivesService.fetchAllDrives(),
                interviewsService.getAllInterviews(),
                offersService.getAllOffers(),
                usersService.getAllUsers(),
                auditService.getAllLogs(),
                eligibilityService.getAllRules(),
            ]);

            setStudents(studentsData.status === 'fulfilled' ? studentsData.value : []);
            setCompanies(companiesData.status === 'fulfilled' ? companiesData.value : []);
            setDrives(drivesData.status === 'fulfilled' ? drivesData.value : []);
            setInterviews(interviewsData.status === 'fulfilled' ? interviewsData.value : []);
            setOffers(offersData.status === 'fulfilled' ? offersData.value : []);
            setUsers(usersData.status === 'fulfilled' ? usersData.value : []);
            setAuditLogs(auditData.status === 'fulfilled' ? auditData.value : []);
            setEligibilityRules(eligibilityData.status === 'fulfilled' ? eligibilityData.value : []);

            // Log any partial failures
            const results = [studentsData, companiesData, drivesData, interviewsData, offersData, usersData, auditData, eligibilityData];
            const failures = results.filter(r => r.status === 'rejected');
            if (failures.length > 0) {
                console.warn(`${failures.length} of ${results.length} dashboard data sources failed to load.`);
            }
        } catch (err: any) {
            console.error('Dashboard data fetch failed:', err);
            setError(err.message || 'Failed to load dashboard data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Computed values (derived from raw state)
    const stats = computeStats(students, companies, drives, offers);
    const departmentStats = computeDepartmentStats(students);
    const funnelStats = computeFunnelStats(students, offers);
    const upcomingInterviews = buildUpcomingInterviews(interviews);
    const recentActivity = buildRecentActivity(auditLogs);
    const alerts = buildAlerts(drives, offers, interviews);
    const roleCounts = computeRoleCounts(users);

    return {
        stats,
        departmentStats,
        funnelStats,
        upcomingInterviews,
        recentActivity,
        alerts,
        students,
        companies,
        drives,
        interviews,
        offers,
        users,
        auditLogs,
        eligibilityRules,
        roleCounts,
        isLoading,
        error,
        refresh: fetchAll,
    };
};
