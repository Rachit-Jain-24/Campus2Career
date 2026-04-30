import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDefaultAdminRoute } from '../config/admin/roleRoutes';
import { canAccessRoute } from '../utils/admin/rbac';
import type { AdminRole } from '../types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRole?: 'admin' | 'student' | AdminRole | AdminRole[];
    requireCareerDiscovery?: boolean;
    requireProfileSetup?: boolean;
    requireAssessment?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRole,
    requireCareerDiscovery,
    requireProfileSetup,
    requireAssessment,
}) => {
    const { user, isInitializing } = useAuth();
    const location = useLocation();

    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-bold text-primary animate-pulse tracking-widest uppercase">Checking Authorization</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login if unauthenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based logic
    const isUserAdmin = user.role && user.role !== 'student';

    // Helper to check role
    const checkRoleMatch = (allowed: 'admin' | 'student' | AdminRole | AdminRole[] | undefined) => {
        if (!allowed) return true;
        if (allowed === 'admin') return isUserAdmin;
        if (allowed === 'student') return !isUserAdmin;
        
        // Use the centralized RBAC utility for specific admin roles
        const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
        return canAccessRoute(user, allowedRoles);
    };

    if (!checkRoleMatch(allowedRole)) {
        if (isUserAdmin) {
            // Admin on wrong page
            return <Navigate to={getDefaultAdminRoute(user.role)} replace />;
        }
        // Student on admin page
        return <Navigate to="/student/dashboard" replace />;
    }

    const isCareerDiscoveryDone = user.careerDiscoveryCompleted === true || !!(user as any).careerTrack;
    const isProfileSetupDone = user.profileCompleted === true;
    // Assessment is now done as part of Career Discovery (track selection = assessment)
    // Grant access if assessmentCompleted flag is set OR if profile is done (legacy students)
    const isAssessmentDone = user.assessmentCompleted === true || isProfileSetupDone || isCareerDiscoveryDone;

    // Student specific requirement checks (admins bypass this)
    if (!isUserAdmin) {
        // Prevent revisiting completed onboarding steps
        if (location.pathname === '/career-discovery' && isCareerDiscoveryDone) {
            if (!isProfileSetupDone) return <Navigate to="/student/profile-setup" replace />;
            return <Navigate to="/student/dashboard" replace />;
        }

        if (location.pathname === '/student/profile-setup' && isProfileSetupDone) {
            return <Navigate to="/student/dashboard" replace />;
        }

        if (location.pathname === '/student/assessment' && isAssessmentDone) {
            return <Navigate to="/student/dashboard" replace />;
        }

        // Forward guards — prevent skipping steps
        if (requireAssessment && !isAssessmentDone) {
            if (!isCareerDiscoveryDone) return <Navigate to="/career-discovery" replace />;
            if (!isProfileSetupDone) return <Navigate to="/student/profile-setup" replace />;
            return <Navigate to="/student/dashboard" replace />;
        }

        if (requireProfileSetup && !isProfileSetupDone) {
            if (!isCareerDiscoveryDone) return <Navigate to="/career-discovery" replace />;
            return <Navigate to="/student/profile-setup" replace />;
        }

        if (requireCareerDiscovery && !isCareerDiscoveryDone) {
            return <Navigate to="/career-discovery" replace />;
        }
    }

    return <>{children}</>;
};

// GuestRoute ensures logged in users can't see the login/signup page again
export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isInitializing } = useAuth();

    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (user) {
        // Redirect to main path selection logic in App.tsx
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
