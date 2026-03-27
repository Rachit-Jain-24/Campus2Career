import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleLayout } from '../components/role/RoleLayout';
import { RoleGuard } from '../components/admin/auth/RoleGuard';
import { PROGRAM_CHAIR_NAV } from '../config/roles/roleNavigation';

import { ProgramChairDashboard } from '../pages/admin/role/ProgramChairDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UsersPage } from '../pages/admin/UsersPage';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { BatchAnalytics } from '../pages/admin/BatchAnalytics';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

const ProgramChairShell: React.FC = () => (
    <RoleLayout
        navItems={PROGRAM_CHAIR_NAV}
        portalTitle="Program Chair Portal"
        accentColor="bg-amber-600"
        loginPath="/login/program-chair"
    />
);

export const ProgramChairPortalRoutes: React.FC = () => (
    <Routes>
        <Route element={<RoleGuard allowedRoles={['program_chair']}><ProgramChairShell /></RoleGuard>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProgramChairDashboard />} />
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
