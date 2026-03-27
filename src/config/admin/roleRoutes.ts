import type { AdminRole } from '../../types/auth';

const ROLE_ROUTE_MAP: Record<AdminRole, string> = {
    system_admin: '/admin/dashboard',
    dean: '/dean/dashboard',
    director: '/director/dashboard',
    program_chair: '/program-chair/dashboard',
    faculty: '/faculty/dashboard',
    placement_officer: '/placement/dashboard',
};

const ROLE_LOGIN_MAP: Record<AdminRole, string> = {
    system_admin: '/login/admin',
    dean: '/login/dean',
    director: '/login/director',
    program_chair: '/login/program-chair',
    faculty: '/login/faculty',
    placement_officer: '/login/placement-officer',
};

export const getDefaultAdminRoute = (role?: string): string => {
    if (!role) return '/login/admin';
    return ROLE_ROUTE_MAP[role as AdminRole] || '/login/admin';
};

export const getRoleLoginRoute = (role?: string): string => {
    if (!role) return '/login/admin';
    return ROLE_LOGIN_MAP[role as AdminRole] || '/login/admin';
};
