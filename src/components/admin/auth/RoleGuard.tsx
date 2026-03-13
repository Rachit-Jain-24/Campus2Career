import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { canAccessRoute } from '../../../utils/admin/rbac';
import type { AdminRole } from '../../../types/auth';
import { EmptyState } from '../common/EmptyState';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles?: AdminRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    if (!canAccessRoute(user, allowedRoles)) {
        return (
            <div className="p-6">
                <EmptyState
                    icon={ShieldAlert}
                    title="Access Restricted"
                    description="You do not have the required permissions to view this section. Please contact your system administrator if you believe this is an error."
                    actionLabel="Return to Dashboard"
                    onAction={() => window.history.back()}
                />
            </div>
        );
    }

    return <>{children}</>;
};
