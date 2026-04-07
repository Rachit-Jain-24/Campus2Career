import React from 'react';
import { Users, GraduationCap, Building2, Briefcase, Award, Percent, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';
import type { MetricCardConfig, DashboardStats } from '../../../types/adminDashboard';

interface DashboardMetricsRowProps {
    stats: DashboardStats;
    isLoading?: boolean;
}

const accentColors = [
    { icon: 'bg-blue-100 text-blue-700', border: 'border-blue-100 hover:border-blue-200' },
    { icon: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-100 hover:border-emerald-200' },
    { icon: 'bg-violet-100 text-violet-700', border: 'border-violet-100 hover:border-violet-200' },
    { icon: 'bg-amber-100 text-amber-700', border: 'border-amber-100 hover:border-amber-200' },
    { icon: 'bg-rose-100 text-rose-700', border: 'border-rose-100 hover:border-rose-200' },
    { icon: 'bg-cyan-100 text-cyan-700', border: 'border-cyan-100 hover:border-cyan-200' },
];

export const DashboardMetricsRow: React.FC<DashboardMetricsRowProps> = ({ stats, isLoading }) => {
    const { user } = useAuth();

    const metrics: MetricCardConfig[] = [
        {
            title: 'Total Students',
            value: stats.totalStudents.toLocaleString(),
            icon: Users,
            requiredPermission: 'manage_students'
        },
        {
            title: 'Eligible for Placement',
            value: stats.eligibleStudents.toLocaleString(),
            icon: GraduationCap,
            requiredPermission: 'manage_students'
        },
        {
            title: 'Companies Onboarded',
            value: stats.companiesOnboarded.toLocaleString(),
            icon: Building2,
            requiredPermission: 'manage_companies'
        },
        {
            title: 'Active Drives',
            value: stats.activeDrives.toLocaleString(),
            icon: Briefcase,
            requiredPermission: 'manage_drives'
        },
        {
            title: 'Offers Released',
            value: stats.offersReleased.toLocaleString(),
            icon: Award,
            requiredPermission: 'manage_offers'
        },
        {
            title: 'Placement Rate',
            value: `${stats.placementRate}%`,
            icon: Percent,
            requiredPermission: 'view_analytics'
        }
    ];

    const allowedMetrics = metrics.filter(
        metric => !metric.requiredPermission || hasPermission(user, metric.requiredPermission)
    );

    if (allowedMetrics.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mb-8">
            {allowedMetrics.map((metric, idx) => {
                const colors = accentColors[idx % accentColors.length];
                return (
                    <div
                        key={idx}
                        className={`group relative rounded-2xl border bg-white p-5 flex items-start justify-between shadow-sm hover:shadow-xl transition-all animate-fade-in-up ${colors.border}`}
                        style={{ animationDelay: `${0.1 + (idx * 0.05)}s` }}
                    >
                        <div className="relative z-10">
                            <p className="text-xs font-black uppercase text-muted-foreground tracking-wide">{metric.title}</p>
                            {isLoading ? (
                                <div className="flex items-center gap-2 h-10 mt-1">
                                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                </div>
                            ) : (
                                <p className="text-3xl font-black text-slate-800 mt-1">{metric.value}</p>
                            )}
                        </div>
                        <div className={`p-3 rounded-2xl ${colors.icon} shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <metric.icon className="w-5 h-5" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
