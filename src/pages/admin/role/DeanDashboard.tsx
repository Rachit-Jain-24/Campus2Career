import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Landmark, BarChart3, FileCheck, IndianRupee, Building2, TrendingUp,
    GraduationCap, Handshake, ArrowRight, Users, BookOpen, Loader2, Inbox
} from 'lucide-react';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';
import { useDashboardData } from '../../../hooks/admin/useDashboardData';

export const DeanDashboard: React.FC = () => {
    const { stats, departmentStats, roleCounts, offers, isLoading } = useDashboardData();

    // Live KPIs
    const avgPackage = offers.length > 0
        ? (offers.reduce((sum: number, o: any) => sum + (o.ctc || o.packageLPA || 0), 0) / offers.length).toFixed(1)
        : '0';

    const DEAN_KPIS = [
        { title: 'Overall Placement', value: isLoading ? '...' : `${stats.placementRate}%`, icon: TrendingUp, subtitle: 'Across all departments', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        { title: 'Total Students', value: isLoading ? '...' : stats.totalStudents.toLocaleString(), icon: GraduationCap, subtitle: 'Registered in system', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        { title: 'Average Package', value: isLoading ? '...' : `${avgPackage} LPA`, icon: IndianRupee, subtitle: 'Across all offers', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { title: 'Industry Partners', value: isLoading ? '...' : stats.companiesOnboarded.toLocaleString(), icon: Handshake, subtitle: 'Companies onboarded', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    ];

    const DEAN_ACTIONS = [
        { label: 'Annual Reports', icon: BarChart3, path: '/admin/reports', color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Review Policy', icon: FileCheck, path: '/admin/reports', color: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'Budget Insights', icon: IndianRupee, path: '/admin/reports', color: 'text-amber-400 bg-amber-500/10' },
        { label: 'Department Performance', icon: Building2, path: '/admin/reports', color: 'text-purple-400 bg-purple-500/10' },
    ];

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">
            <WelcomeCard />

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Strategic Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {DEAN_ACTIONS.map((action, idx) => (
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
                {DEAN_KPIS.map((kpi, idx) => (
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

            {/* Department Overview + Policy Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Department Performance */}
                <div className="lg:col-span-2 card-nmims p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-primary" />
                            Department Placement Overview
                        </h3>
                        <NavLink to="/admin/reports" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                            Full Report <ArrowRight className="w-4 h-4" />
                        </NavLink>
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : departmentStats.length > 0 ? (
                        <div className="space-y-4">
                            {departmentStats.map((dept, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-foreground w-40 truncate">{dept.name}</span>
                                    <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                                            style={{ width: `${dept.rate}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-foreground w-16 text-right">{dept.rate}%</span>
                                    <span className="text-xs text-muted-foreground w-20 text-right">{dept.placed}/{dept.total}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Inbox className="w-8 h-8 mb-2" />
                            <p className="text-sm">No department data available yet.</p>
                        </div>
                    )}
                </div>

                {/* Policy Review Queue — No Firestore backing */}
                <div className="card-nmims p-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                        <FileCheck className="w-5 h-5 text-primary" />
                        Policy Queue
                    </h3>
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Inbox className="w-8 h-8 mb-2" />
                        <p className="text-sm text-center">No policy items pending review.</p>
                        <p className="text-xs mt-1 text-center">Policy queue will appear here when configured.</p>
                    </div>
                </div>
            </div>

            {/* Hierarchy Oversight */}
            <div className="card-nmims p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    Hierarchical Oversight
                </h3>
                <p className="text-sm text-muted-foreground mb-4">As Dean, you oversee all administrative roles across the placement ecosystem.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                        { role: 'Director', icon: Building2, count: roleCounts.director, color: 'text-blue-400 bg-blue-500/10' },
                        { role: 'Program Chair', icon: BookOpen, count: roleCounts.program_chair, color: 'text-purple-400 bg-purple-500/10' },
                        { role: 'Faculty', icon: GraduationCap, count: roleCounts.faculty, color: 'text-emerald-400 bg-emerald-500/10' },
                        { role: 'Placement Officer', icon: Handshake, count: roleCounts.placement_officer, color: 'text-amber-400 bg-amber-500/10' },
                        { role: 'System Admin', icon: Landmark, count: roleCounts.system_admin, color: 'text-rose-400 bg-rose-500/10' },
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
