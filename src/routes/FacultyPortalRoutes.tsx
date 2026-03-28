import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleLayout } from '../components/role/RoleLayout';
import { RoleGuard } from '../components/admin/auth/RoleGuard';
import { FACULTY_NAV } from '../config/roles/roleNavigation';

import { FacultyDashboard } from '../pages/admin/role/FacultyDashboard';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { BatchAnalytics } from '../pages/admin/BatchAnalytics';

const FacultyShell: React.FC = () => (
    <RoleLayout
        navItems={FACULTY_NAV}
        portalTitle="Faculty Portal"
        accentColor="bg-emerald-600"
        loginPath="/login/faculty"
    />
);

export const FacultyPortalRoutes: React.FC = () => (
    <Routes>
        <Route element={<RoleGuard allowedRoles={['faculty']}><FacultyShell /></RoleGuard>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="batch-analytics" element={<BatchAnalytics />} />
        </Route>
    </Routes>
);
