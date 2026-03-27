import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleLayout } from '../components/role/RoleLayout';
import { RoleGuard } from '../components/admin/auth/RoleGuard';
import { DIRECTOR_NAV } from '../config/roles/roleNavigation';

import { DirectorDashboard } from '../pages/admin/role/DirectorDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UsersPage } from '../pages/admin/UsersPage';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { BatchAnalytics } from '../pages/admin/BatchAnalytics';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

const DirectorShell: React.FC = () => (
    <RoleLayout
        navItems={DIRECTOR_NAV}
        portalTitle="Director Portal"
        accentColor="bg-blue-600"
        loginPath="/login/director"
    />
);

export const DirectorPortalRoutes: React.FC = () => (
    <Routes>
        <Route element={<RoleGuard allowedRoles={['director']}><DirectorShell /></RoleGuard>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DirectorDashboard />} />
            <Route path="overview" element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="batch-analytics" element={<BatchAnalytics />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>
    </Routes>
);
