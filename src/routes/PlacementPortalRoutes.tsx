import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleLayout } from '../components/role/RoleLayout';
import { RoleGuard } from '../components/admin/auth/RoleGuard';
import { PLACEMENT_NAV } from '../config/roles/roleNavigation';

import { PlacementOfficerDashboard } from '../pages/admin/role/PlacementOfficerDashboard';
import { CompaniesPage } from '../pages/admin/CompaniesPage';
import { DrivesPage } from '../pages/admin/DrivesPage';
import { InterviewsPage } from '../pages/admin/InterviewsPage';
import { OffersPage } from '../pages/admin/OffersPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

const PlacementShell: React.FC = () => (
    <RoleLayout
        navItems={PLACEMENT_NAV}
        portalTitle="Placement Portal"
        accentColor="bg-cyan-600"
        loginPath="/login/placement-officer"
    />
);

export const PlacementPortalRoutes: React.FC = () => (
    <Routes>
        <Route element={<RoleGuard allowedRoles={['placement_officer']}><PlacementShell /></RoleGuard>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PlacementOfficerDashboard />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="drives" element={<DrivesPage />} />
            <Route path="interviews" element={<InterviewsPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>
    </Routes>
);
