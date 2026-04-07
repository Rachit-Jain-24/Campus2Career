import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SystemAdminRouteProps {
    children: React.ReactNode;
}

/**
 * SystemAdminRoute: Restricts access to system_admin users only.
 * This is used for development/administrative routes that should not be accessible
 * by other admin roles (dean, director, etc.)
 */
export const SystemAdminRoute: React.FC<SystemAdminRouteProps> = ({ children }) => {
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

    // Only system_admin users can access
    if (user.role !== 'system_admin') {
        console.warn(`Access denied to ${location.pathname} for user role: ${user.role}`);
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <>{children}</>;
};
