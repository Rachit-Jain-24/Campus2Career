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
    bg: string;
}

const ACTIONS: ActionItem[] = [
    {
        label: 'Add Company',
        icon: Building2,
        path: '/admin/companies/new',
        permission: 'manage_companies',
        color: 'text-blue-700',
        bg: 'bg-blue-100',
    },
    {
        label: 'Create Drive',
        icon: Briefcase,
        path: '/admin/drives/new',
        permission: 'manage_drives',
        color: 'text-violet-700',
        bg: 'bg-violet-100',
    },
    {
        label: 'Add Bulk Students',
        icon: PlusCircle,
        path: '/admin/students/import',
        permission: 'manage_students',
        color: 'text-emerald-700',
        bg: 'bg-emerald-100',
    },
    {
        label: 'Approve Eligibility',
        icon: FileSignature,
        path: '/admin/eligibility-rules',
        permission: 'approve_eligibility',
        color: 'text-amber-700',
        bg: 'bg-amber-100',
    },
    {
        label: 'Generate Report',
        icon: FileSpreadsheet,
        path: '/admin/reports',
        permission: 'view_analytics',
        color: 'text-rose-700',
        bg: 'bg-rose-100',
    }
];

export const QuickActions: React.FC = () => {
    const { user } = useAuth();

    const allowedActions = ACTIONS.filter(action => hasPermission(user, action.permission));

    if (allowedActions.length === 0) return null;

    return (
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-base font-semibold mb-4 text-foreground">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {allowedActions.map((action, idx) => (
                    <NavLink
                        key={idx}
                        to={action.path}
                        className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 group text-center"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${action.bg} ${action.color}`}>
                            <action.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">
                            {action.label}
                        </span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};
