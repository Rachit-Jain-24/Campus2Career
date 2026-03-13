import React from 'react';
import { NavLink } from 'react-router-dom';
import { PlusCircle, Building2, Briefcase, FileSignature, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';
import type { AdminPermission } from '../../../config/admin/permissions';

interface ActionItem {
    label: string;
    icon: any;
    path: string;
    permission: AdminPermission;
    color: string;
}

const ACTIONS: ActionItem[] = [
    {
        label: 'Add Company',
        icon: Building2,
        path: '/admin/companies/new',
        permission: 'manage_companies',
        color: 'text-blue-500 bg-blue-500/10'
    },
    {
        label: 'Create Drive',
        icon: Briefcase,
        path: '/admin/drives/new',
        permission: 'manage_drives',
        color: 'text-purple-500 bg-purple-500/10'
    },
    {
        label: 'Add Bulk Students',
        icon: PlusCircle,
        path: '/admin/students/import',
        permission: 'manage_students',
        color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
        label: 'Approve Eligibility',
        icon: FileSignature,
        path: '/admin/eligibility-rules',
        permission: 'approve_eligibility',
        color: 'text-amber-500 bg-amber-500/10'
    },
    {
        label: 'Generate Report',
        icon: FileSpreadsheet,
        path: '/admin/reports',
        permission: 'view_analytics',
        color: 'text-rose-500 bg-rose-500/10'
    }
];

export const QuickActions: React.FC = () => {
    const { user } = useAuth();

    const allowedActions = ACTIONS.filter(action => hasPermission(user, action.permission));

    if (allowedActions.length === 0) return null;

    return (
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {allowedActions.map((action, idx) => (
                    <NavLink
                        key={idx}
                        to={action.path}
                        className="flex flex-col items-center justify-center p-4 sm:p-5 card-nmims hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-md text-center"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${action.color}`}>
                            <action.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {action.label}
                        </span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};
