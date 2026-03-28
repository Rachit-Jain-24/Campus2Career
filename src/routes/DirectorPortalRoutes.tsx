import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleLayout } from '../components/role/RoleLayout';
import { RoleGuard } from '../components/admin/auth/RoleGuard';
import { DIRECTOR_NAV } from '../config/roles/roleNavigation';

import { DirectorDashboard } from '../pages/admin/role/DirectorDashboard';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { BatchAnalytics } from '../pages/admin/BatchAnalytics';
import { ReportsPage } from '../pages/admin/ReportsPage';

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
            <Route path="students" element={<StudentsPage />} />
            <Route path="batch-analytics" element={<BatchAnalytics />} />
            <Route path="reports" element={<ReportsPage />} />
        </Route>
    </Routes>
);
