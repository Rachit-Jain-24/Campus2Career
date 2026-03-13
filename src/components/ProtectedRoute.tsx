import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRole?: 'admin' | 'student';
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
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
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

    if (allowedRole === 'admin' && !isUserAdmin) {
        // Student trying to access admin pages
        return <Navigate to="/student/dashboard" replace />;
    }

    if (allowedRole === 'student' && isUserAdmin) {
        // Admin trying to access student pages
        return <Navigate to="/admin/dashboard" replace />;
    }

    const isCareerDiscoveryDone = user.careerDiscoveryCompleted === true;
    const isProfileSetupDone = user.profileCompleted === true;
    const isAssessmentDone = user.assessmentCompleted === true;

    // Student specific requirement checks (admins bypass this)
    if (!isUserAdmin) {
        // Reverse checking for onboarding forms (if they try to visit it again after doing it)
        if (location.pathname === '/career-discovery' && isCareerDiscoveryDone) {
            if (!isProfileSetupDone) return <Navigate to="/student/profile-setup" replace />;
            if (!isAssessmentDone) return <Navigate to="/student/assessment" replace />;
            return <Navigate to="/student/dashboard" replace />;
        }

        if (location.pathname === '/student/profile-setup' && isProfileSetupDone) {
            if (!isAssessmentDone) return <Navigate to="/student/assessment" replace />;
            return <Navigate to="/student/dashboard" replace />;
        }

        if (location.pathname === '/student/assessment' && isAssessmentDone) {
            return <Navigate to="/student/dashboard" replace />;
        }

        // Forward checks (prevent visiting dashboard while setup is incomplete)
        if (requireAssessment && !isAssessmentDone) {
            if (!isCareerDiscoveryDone) return <Navigate to="/career-discovery" replace />;
            if (!isProfileSetupDone) return <Navigate to="/student/profile-setup" replace />;
            return <Navigate to="/student/assessment" replace />;
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
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (user) {
        // Redirect to switch account page instead of auto-redirecting
        return <Navigate to="/switch-account" replace />;
    }

    return <>{children}</>;
};
