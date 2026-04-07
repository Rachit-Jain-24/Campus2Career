import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleLayout } from '../components/role/RoleLayout';
import { RoleGuard } from '../components/admin/auth/RoleGuard';
import { DEAN_NAV } from '../config/roles/roleNavigation';

import { DeanDashboard } from '../pages/admin/role/DeanDashboard';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { BatchAnalytics } from '../pages/admin/BatchAnalytics';
import { ReportsPage } from '../pages/admin/ReportsPage';

const DeanShell: React.FC = () => (
    <RoleLayout
        navItems={DEAN_NAV}
        portalTitle="Dean Portal"
        accentColor="bg-purple-600"
        loginPath="/login/dean"
    />
);

export const DeanPortalRoutes: React.FC = () => (
    <Routes>
        <Route element={<RoleGuard allowedRoles={['dean']}><DeanShell /></RoleGuard>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DeanDashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="batch-analytics" element={<BatchAnalytics />} />
            <Route path="reports" element={<ReportsPage />} />
        </Route>
    </Routes>
);
