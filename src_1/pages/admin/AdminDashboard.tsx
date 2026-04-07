import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { WelcomeCard } from '../../components/admin/dashboard/WelcomeCard';
import { QuickActions } from '../../components/admin/dashboard/QuickActions';
import { DashboardMetricsRow } from '../../components/admin/dashboard/DashboardMetricsRow';
import { VisualAnalytics } from '../../components/admin/dashboard/VisualAnalytics';
import { AlertsSection } from '../../components/admin/dashboard/AlertsSection';
import { RecentActivity, UpcomingInterviewsWidget } from '../../components/admin/dashboard/ActivityWidgets';
import { BatchAnalytics } from '../../components/admin/dashboard/BatchAnalytics';
import { useDashboardData } from '../../hooks/admin/useDashboardData';

export const AdminDashboard: React.FC = () => {
    const {
        stats,
        departmentStats,
        funnelStats,
        upcomingInterviews,
        recentActivity,
        alerts,
        isLoading,
        error,
    } = useDashboardData();

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">
            {/* Top Banner */}
            <WelcomeCard />

            {/* Quick Actions Array - Role Filtered internally */}
            <QuickActions />

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="ml-3 text-muted-foreground text-sm">Loading dashboard data...</span>
                </div>
            )}

            {/* Crucial KPI Row */}
            <DashboardMetricsRow stats={stats} isLoading={isLoading} />

            {/* Batch Profile Analysis - NEW SECTION */}
            <BatchAnalytics batchYear="2022-2026" branch="B.Tech CSE (Data Science)" />

            {/* Alerts Section - generated from real data conditions */}
            <AlertsSection alerts={alerts} />

            {/* Charts Section */}
            <VisualAnalytics
                departmentStats={departmentStats}
                funnelStats={funnelStats}
                isLoading={isLoading}
            />

            {/* Bottom Row: Activity Feed & Schedules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[400px]">
                    <UpcomingInterviewsWidget interviews={upcomingInterviews} />
                </div>
                <div className="h-[400px]">
                    <RecentActivity activities={recentActivity} />
                </div>
            </div>
        </div>
    );
};
