// ─────────────────────────────────────────────────────────────
// Role-Based Route Mapping
// Maps each admin role to their dedicated dashboard route
// ─────────────────────────────────────────────────────────────

import type { AdminRole } from '../../types/auth';

const ROLE_ROUTE_MAP: Record<AdminRole, string> = {
    dean: '/admin/dean',
    director: '/admin/director',
    program_chair: '/admin/program-chair',
    faculty: '/admin/faculty',
    placement_officer: '/admin/placement-officer',
    system_admin: '/admin/system-admin',
};

/**
 * Returns the default admin dashboard route for a given role.
 * Falls back to /admin/dashboard if role is not mapped.
 */
export const getDefaultAdminRoute = (role?: string): string => {
    if (!role) return '/admin/dashboard';
    return ROLE_ROUTE_MAP[role as AdminRole] || '/admin/dashboard';
};
