import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminLayout } from '../components/admin/layout/AdminLayout';
import { RoleGuard } from '../components/admin/auth/RoleGuard';

// Existing Module Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UsersPage } from '../pages/admin/UsersPage';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { BatchAnalytics } from '../pages/admin/BatchAnalytics';
import { CompaniesPage } from '../pages/admin/CompaniesPage';
import { DrivesPage } from '../pages/admin/DrivesPage';
import { EligibilityRulesPage } from '../pages/admin/EligibilityRulesPage';
import { InterviewsPage } from '../pages/admin/InterviewsPage';
import { OffersPage } from '../pages/admin/OffersPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { UnauthorizedPage } from '../pages/admin/UnauthorizedPage';
import { DatabaseTools } from '../pages/admin/DatabaseTools';

// Role-Specific Dashboard Pages
import { DeanDashboard } from '../pages/admin/role/DeanDashboard';
import { DirectorDashboard } from '../pages/admin/role/DirectorDashboard';
import { ProgramChairDashboard } from '../pages/admin/role/ProgramChairDashboard';
import { FacultyDashboard } from '../pages/admin/role/FacultyDashboard';
import { PlacementOfficerDashboard } from '../pages/admin/role/PlacementOfficerDashboard';
import { SystemAdminDashboard } from '../pages/admin/role/SystemAdminDashboard';

// Note: Database fix tools removed - using Supabase native data management

export const AdminRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public Admin Routes */}
            <Route path="unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Admin Shell */}
            <Route path="/" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
                {/* Fallback: generic dashboard (accessible to all admins) */}
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />

                {/* ─── Role-Specific Dashboards ─── */}
                <Route path="dean" element={<RoleGuard allowedRoles={['dean']}><DeanDashboard /></RoleGuard>} />
                <Route path="director" element={<RoleGuard allowedRoles={['director']}><DirectorDashboard /></RoleGuard>} />
                <Route path="program-chair" element={<RoleGuard allowedRoles={['program_chair']}><ProgramChairDashboard /></RoleGuard>} />
                <Route path="faculty" element={<RoleGuard allowedRoles={['faculty']}><FacultyDashboard /></RoleGuard>} />
                <Route path="placement-officer" element={<RoleGuard allowedRoles={['placement_officer']}><PlacementOfficerDashboard /></RoleGuard>} />
                <Route path="system-admin" element={<RoleGuard allowedRoles={['system_admin']}><SystemAdminDashboard /></RoleGuard>} />

                {/* ─── Existing Module Routes ─── */}
                <Route path="users" element={<RoleGuard allowedRoles={['system_admin']}><UsersPage /></RoleGuard>} />
                <Route path="students" element={<RoleGuard allowedRoles={['system_admin', 'dean', 'director', 'program_chair', 'placement_officer', 'faculty']}><StudentsPage /></RoleGuard>} />
                <Route path="batch-analytics" element={<RoleGuard allowedRoles={['system_admin', 'dean', 'director', 'program_chair', 'placement_officer', 'faculty']}><BatchAnalytics /></RoleGuard>} />
                <Route path="companies" element={<RoleGuard allowedRoles={['system_admin', 'director', 'placement_officer']}><CompaniesPage /></RoleGuard>} />
                <Route path="drives" element={<RoleGuard allowedRoles={['system_admin', 'director', 'placement_officer']}><DrivesPage /></RoleGuard>} />
                <Route path="eligibility-rules" element={<RoleGuard allowedRoles={['system_admin', 'program_chair']}><EligibilityRulesPage /></RoleGuard>} />
                <Route path="interviews" element={<RoleGuard allowedRoles={['system_admin', 'placement_officer', 'faculty']}><InterviewsPage /></RoleGuard>} />
                <Route path="offers" element={<RoleGuard allowedRoles={['system_admin', 'placement_officer']}><OffersPage /></RoleGuard>} />
                <Route path="reports" element={<RoleGuard allowedRoles={['system_admin', 'dean', 'director', 'program_chair', 'placement_officer']}><ReportsPage /></RoleGuard>} />

                <Route path="settings" element={<RoleGuard allowedRoles={['system_admin']}><SettingsPage /></RoleGuard>} />
                <Route path="audit-logs" element={<RoleGuard allowedRoles={['system_admin']}><AuditLogsPage /></RoleGuard>} />
                <Route path="database-tools" element={<RoleGuard allowedRoles={['system_admin']}><DatabaseTools /></RoleGuard>} />
                
                {/* Note: Database fix tools removed - using Supabase native data management */}
            </Route>
        </Routes>
    );
};
