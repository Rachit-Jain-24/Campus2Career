import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleLayout } from '../components/role/RoleLayout';
import { RoleGuard } from '../components/admin/auth/RoleGuard';
import { ADMIN_NAV } from '../config/roles/roleNavigation';

// Reuse existing page components
import { SystemAdminDashboard } from '../pages/admin/role/SystemAdminDashboard';
import { UsersPage } from '../pages/admin/UsersPage';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { BatchAnalytics } from '../pages/admin/BatchAnalytics';
import { EligibilityRulesPage } from '../pages/admin/EligibilityRulesPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

const AdminShell: React.FC = () => (
    <RoleLayout
        navItems={ADMIN_NAV}
        portalTitle="System Admin"
        accentColor="bg-rose-600"
        loginPath="/login/admin"
    />
);

export const AdminPortalRoutes: React.FC = () => (
    <Routes>
        <Route element={<RoleGuard allowedRoles={['system_admin']}><AdminShell /></RoleGuard>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SystemAdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="batch-analytics" element={<BatchAnalytics />} />
            <Route path="eligibility-rules" element={<EligibilityRulesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>
    </Routes>
);
