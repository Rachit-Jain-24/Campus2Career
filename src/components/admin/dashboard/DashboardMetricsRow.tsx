import React from 'react';
import { Users, GraduationCap, Building2, Briefcase, Award, Percent, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';
import type { MetricCardConfig, DashboardStats } from '../../../types/adminDashboard';

interface DashboardMetricsRowProps {
    stats: DashboardStats;
    isLoading?: boolean;
}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {allowedMetrics.map((metric, idx) => (
                <div
                    key={idx}
                    className="card-nmims p-5 sm:p-6 animate-fade-in-up flex flex-col justify-between hover:border-primary/20 transition-colors group"
                    style={{ animationDelay: `${0.1 + (idx * 0.05)}s` }}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground mb-1">{metric.title}</p>
                            {isLoading ? (
                                <div className="flex items-center gap-2 h-9">
                                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                </div>
                            ) : (
                                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{metric.value}</h3>
                            )}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                            <metric.icon className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
