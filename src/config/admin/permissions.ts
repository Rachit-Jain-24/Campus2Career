import type { AdminRole } from '../../types/auth';

export type AdminPermission =
    | 'view_analytics'
    | 'view_annual_reports'
    | 'manage_mou'
    | 'view_budget_insights'
    | 'manage_drives'
    | 'manage_companies'
    | 'view_department_performance'
    | 'manage_department_strategy'
    | 'manage_student_readiness'
    | 'approve_eligibility'
    | 'manage_students'
    | 'review_resumes'
    | 'manage_interviews'
    | 'manage_offers'
    | 'manage_users'
    | 'manage_settings'
    | 'view_audit_logs';

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
    dean: [
        'view_analytics',
        'view_annual_reports',
        'manage_mou',
        'view_budget_insights',
    ],
    director: [
        'view_analytics',
        'manage_drives',
        'view_department_performance',
    ],
    program_chair: [
        'view_analytics',
        'manage_department_strategy',
        'manage_student_readiness',
        'approve_eligibility',
    ],
    faculty: [
        'manage_students',
        'review_resumes',
        'manage_interviews',
        // Note: they mentor students, review resumes, mock interviews
    ],
    placement_officer: [
        'manage_companies',
        'manage_drives',
        'manage_students',
        'manage_offers',
        'manage_interviews',
        'view_analytics',
    ],
    system_admin: [
        'view_analytics',
        'view_annual_reports',
        'manage_mou',
        'view_budget_insights',
        'manage_drives',
        'manage_companies',
        'view_department_performance',
        'manage_department_strategy',
        'manage_student_readiness',
        'approve_eligibility',
        'manage_students',
        'review_resumes',
        'manage_interviews',
        'manage_offers',
        'manage_users',
        'manage_settings',
        'view_audit_logs',
    ],
};
