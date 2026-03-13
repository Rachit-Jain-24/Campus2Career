import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Target, Briefcase, Building2, TrendingUp, Users, BarChart3,
    IndianRupee, Handshake, ArrowRight, CheckCircle2, Clock, AlertTriangle, Loader2, Inbox
} from 'lucide-react';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';
import { useDashboardData } from '../../../hooks/admin/useDashboardData';

export const DirectorDashboard: React.FC = () => {
    const { stats, drives, funnelStats, roleCounts, isLoading } = useDashboardData();

    const DIRECTOR_KPIS = [
        { title: 'Active Drives', value: isLoading ? '...' : stats.activeDrives.toLocaleString(), icon: Briefcase, subtitle: 'Currently running', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        { title: 'Partner Companies', value: isLoading ? '...' : stats.companiesOnboarded.toLocaleString(), icon: Building2, subtitle: 'Onboarded to platform', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        { title: 'Campus Offers', value: isLoading ? '...' : stats.offersReleased.toLocaleString(), icon: IndianRupee, subtitle: 'This placement season', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { title: 'Placement Rate', value: isLoading ? '...' : `${stats.placementRate}%`, icon: TrendingUp, subtitle: 'Across all departments', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    ];

    const DIRECTOR_ACTIONS = [
        { label: 'Approve Drive', icon: CheckCircle2, path: '/admin/drives', color: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'View Companies', icon: Building2, path: '/admin/companies', color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Strategic Reports', icon: BarChart3, path: '/admin/reports', color: 'text-purple-400 bg-purple-500/10' },
        { label: 'Industry Collabs', icon: Handshake, path: '/admin/companies', color: 'text-amber-400 bg-amber-500/10' },
    ];

    const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
        active: { label: 'Active', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
        open: { label: 'Open', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
        ongoing: { label: 'Ongoing', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
        pending: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10', icon: Clock },
        pending_approval: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10', icon: Clock },
        completed: { label: 'Completed', color: 'text-blue-400 bg-blue-500/10', icon: CheckCircle2 },
        closed: { label: 'Closed', color: 'text-blue-400 bg-blue-500/10', icon: CheckCircle2 },
    };

    // Build drive pipeline from real data (top 5)
    const drivePipeline = drives.slice(0, 5).map((d: any) => ({
        company: d.companyName || 'Unknown Company',
        role: d.title || d.role || 'Drive',
        status: d.status || 'active',
        students: d.applicantCount || 0,
        date: d.driveDate || d.startDate || '',
    }));

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">
            <WelcomeCard />

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Operational Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {DIRECTOR_ACTIONS.map((action, idx) => (
                        <NavLink
                            key={idx}
                            to={action.path}
                            className="flex flex-col items-center justify-center p-4 sm:p-5 card-nmims hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-md text-center"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${action.color}`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {DIRECTOR_KPIS.map((kpi, idx) => (
                    <div key={idx} className={`card-nmims p-5 border ${kpi.color.split(' ').slice(1).join(' ')}`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground font-medium">{kpi.title}</span>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                    </div>
                ))}
            </div>

            {/* Drive Pipeline + Placement Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Drive Pipeline */}
                <div className="lg:col-span-2 card-nmims p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Drive Pipeline
                        </h3>
                        <NavLink to="/admin/drives" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                            All Drives <ArrowRight className="w-4 h-4" />
                        </NavLink>
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : drivePipeline.length > 0 ? (
                        <div className="space-y-3">
                            {drivePipeline.map((drive: any, idx: number) => {
                                const config = statusConfig[drive.status] || statusConfig.active;
                                const StatusIcon = config.icon;
                                return (
                                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                                            <StatusIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{drive.company} — <span className="text-muted-foreground">{drive.role}</span></p>
                                            <p className="text-xs text-muted-foreground">{drive.date} • {drive.students > 0 ? `${drive.students} students` : 'No applicants yet'}</p>
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>{config.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Inbox className="w-8 h-8 mb-2" />
                            <p className="text-sm">No drives created yet.</p>
                        </div>
                    )}
                </div>

                {/* Placement Funnel */}
                <div className="card-nmims p-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Placement Funnel
                    </h3>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : funnelStats.some(s => s.count > 0) ? (
                        <div className="space-y-4">
                            {funnelStats.map((stage, idx) => {
                                const maxCount = funnelStats[0]?.count || 1;
                                return (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                                            <span className="text-sm font-bold text-foreground">{stage.count}</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${(stage.count / maxCount) * 100}%`, backgroundColor: stage.fill }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Inbox className="w-8 h-8 mb-2" />
                            <p className="text-sm">No funnel data available yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Subordinate Teams */}
            <div className="card-nmims p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    Teams Under Your Direction
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { role: 'Program Chairs', count: roleCounts.program_chair, icon: AlertTriangle, color: 'text-purple-400 bg-purple-500/10' },
                        { role: 'Faculty', count: roleCounts.faculty, icon: Users, color: 'text-emerald-400 bg-emerald-500/10' },
                        { role: 'Placement Officers', count: roleCounts.placement_officer, icon: Handshake, color: 'text-amber-400 bg-amber-500/10' },
                        { role: 'System Admins', count: roleCounts.system_admin, icon: Target, color: 'text-rose-400 bg-rose-500/10' },
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center p-4 rounded-xl bg-secondary/30 border border-border/50">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${item.color}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{item.role}</span>
                            <span className="text-lg font-bold text-foreground">{isLoading ? '...' : item.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
