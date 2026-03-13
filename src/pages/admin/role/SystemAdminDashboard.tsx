import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    ServerCog, Users, Settings, History, Shield, Activity,
    ArrowRight, CheckCircle2, AlertTriangle, Database, Lock, Bell, Loader2, Inbox
} from 'lucide-react';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';
import { useDashboardData } from '../../../hooks/admin/useDashboardData';

export const SystemAdminDashboard: React.FC = () => {
    const { users, auditLogs, students, roleCounts, isLoading } = useDashboardData();

    // Live KPIs
    const totalUsers = students.length + roleCounts.total;
    const activeAdmins = users.filter((u: any) => u.status === 'active').length;
    const recentCritical = auditLogs.filter((l: any) => l.severity === 'critical').length;

    const SA_KPIS = [
        { title: 'Total Users', value: isLoading ? '...' : totalUsers.toLocaleString(), icon: Users, subtitle: `${activeAdmins} active admins, ${students.length} students`, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        { title: 'Admin Accounts', value: isLoading ? '...' : roleCounts.total.toLocaleString(), icon: Shield, subtitle: 'Registered admin users', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        { title: 'Audit Events', value: isLoading ? '...' : auditLogs.length.toLocaleString(), icon: History, subtitle: `${recentCritical} critical events`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { title: 'System Health', value: '99.8%', icon: ServerCog, subtitle: 'Firebase services operational', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    ];

    const SA_ACTIONS = [
        { label: 'Manage Users', icon: Users, path: '/admin/users', color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Platform Settings', icon: Settings, path: '/admin/settings', color: 'text-purple-400 bg-purple-500/10' },
        { label: 'Audit Logs', icon: History, path: '/admin/audit-logs', color: 'text-amber-400 bg-amber-500/10' },
        { label: 'Security Config', icon: Shield, path: '/admin/settings', color: 'text-emerald-400 bg-emerald-500/10' },
    ];

    const severityConfig: Record<string, string> = {
        low: 'text-blue-400 bg-blue-500/10',
        medium: 'text-amber-400 bg-amber-500/10',
        high: 'text-orange-400 bg-orange-500/10',
        critical: 'text-rose-400 bg-rose-500/10',
    };

    // Format relative time from audit logs
    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">
            <WelcomeCard />

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">System Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {SA_ACTIONS.map((action, idx) => (
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
                {SA_KPIS.map((kpi, idx) => (
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

            {/* Audit Trail + System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Audit Events */}
                <div className="lg:col-span-2 card-nmims p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            Recent Audit Events
                        </h3>
                        <NavLink to="/admin/audit-logs" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                            All Logs <ArrowRight className="w-4 h-4" />
                        </NavLink>
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : auditLogs.length > 0 ? (
                        <div className="space-y-3">
                            {auditLogs.slice(0, 5).map((event: any, idx: number) => {
                                const ts = event.timestamp instanceof Date ? event.timestamp : new Date(event.timestamp);
                                return (
                                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${severityConfig[event.severity] || severityConfig.low}`}>
                                            {event.severity === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{event.summary || event.action}</p>
                                            <p className="text-xs text-muted-foreground">{event.actorEmail || event.actorName || 'System'} → {event.targetType || event.module || ''}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityConfig[event.severity] || severityConfig.low}`}>{event.severity}</span>
                                            <span className="text-xs text-muted-foreground">{formatRelativeTime(ts)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Inbox className="w-8 h-8 mb-2" />
                            <p className="text-sm">No audit events recorded yet.</p>
                        </div>
                    )}
                </div>

                {/* System Status — Firebase services (static info, not a collection) */}
                <div className="card-nmims p-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                        <Activity className="w-5 h-5 text-primary" />
                        Service Status
                    </h3>
                    <div className="space-y-3">
                        {[
                            { service: 'Firebase Auth', status: 'operational', latency: '—' },
                            { service: 'Cloud Firestore', status: 'operational', latency: '—' },
                            { service: 'Cloud Storage', status: 'operational', latency: '—' },
                        ].map((service, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 bg-emerald-400 animate-pulse`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">{service.service}</p>
                                </div>
                                <span className="text-xs font-medium text-emerald-400">OK</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security & Platform Controls */}
            <div className="card-nmims p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    Platform Controls
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'User Accounts', desc: isLoading ? '...' : `${activeAdmins} active admins`, icon: Users, path: '/admin/users', color: 'text-blue-400 bg-blue-500/10' },
                        { label: 'Database', desc: '9 collections', icon: Database, path: '/admin/settings', color: 'text-emerald-400 bg-emerald-500/10' },
                        { label: 'Security Rules', desc: 'Firestore rules', icon: Lock, path: '/admin/settings', color: 'text-amber-400 bg-amber-500/10' },
                        { label: 'Notifications', desc: 'System alerts', icon: Bell, path: '/admin/settings', color: 'text-purple-400 bg-purple-500/10' },
                    ].map((control, idx) => (
                        <NavLink
                            key={idx}
                            to={control.path}
                            className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:border-primary/20 transition-all group"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${control.color}`}>
                                <control.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{control.label}</p>
                                <p className="text-xs text-muted-foreground">{control.desc}</p>
                            </div>
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};
