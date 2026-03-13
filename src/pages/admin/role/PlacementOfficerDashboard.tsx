import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Handshake, Building2, Briefcase, CalendarCheck, IndianRupee,
    ArrowRight, Clock, TrendingUp, Loader2, Inbox
} from 'lucide-react';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';
import { useDashboardData } from '../../../hooks/admin/useDashboardData';

export const PlacementOfficerDashboard: React.FC = () => {
    const { stats, drives, interviews, offers, companies, isLoading } = useDashboardData();

    // Live KPIs
    const todayInterviews = interviews.filter((i: any) => {
        const d = i.scheduledDate instanceof Date ? i.scheduledDate : new Date(i.scheduledDate);
        return d.toDateString() === new Date().toDateString() && i.status !== 'completed';
    }).length;
    const pendingOffers = offers.filter((o: any) => o.status === 'issued' || o.status === 'pending').length;

    const PO_KPIS = [
        { title: 'Active Drives', value: isLoading ? '...' : stats.activeDrives.toLocaleString(), icon: Briefcase, subtitle: 'Currently running', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        { title: 'Total Companies', value: isLoading ? '...' : stats.companiesOnboarded.toLocaleString(), icon: Building2, subtitle: 'Partner companies', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        { title: 'Interviews Today', value: isLoading ? '...' : todayInterviews.toLocaleString(), icon: CalendarCheck, subtitle: 'Scheduled for today', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { title: 'Pending Offers', value: isLoading ? '...' : pendingOffers.toLocaleString(), icon: IndianRupee, subtitle: 'Awaiting acceptance', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    ];

    const PO_ACTIONS = [
        { label: 'Add Company', icon: Building2, path: '/admin/companies', color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Create Drive', icon: Briefcase, path: '/admin/drives', color: 'text-purple-400 bg-purple-500/10' },
        { label: 'Schedule Interview', icon: CalendarCheck, path: '/admin/interviews', color: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'Manage Offers', icon: IndianRupee, path: '/admin/offers', color: 'text-amber-400 bg-amber-500/10' },
    ];

    const stageConfig: Record<string, { label: string; color: string }> = {
        active: { label: 'Active', color: 'text-emerald-400 bg-emerald-500/10' },
        open: { label: 'Open', color: 'text-emerald-400 bg-emerald-500/10' },
        ongoing: { label: 'Ongoing', color: 'text-emerald-400 bg-emerald-500/10' },
        pending: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10' },
        completed: { label: 'Completed', color: 'text-blue-400 bg-blue-500/10' },
        closed: { label: 'Closed', color: 'text-blue-400 bg-blue-500/10' },
    };

    // Today's schedule from real interviews
    const todaySchedule = interviews
        .filter((i: any) => {
            const d = i.scheduledDate instanceof Date ? i.scheduledDate : new Date(i.scheduledDate);
            return d.toDateString() === new Date().toDateString();
        })
        .slice(0, 5)
        .map((i: any) => {
            const d = i.scheduledDate instanceof Date ? i.scheduledDate : new Date(i.scheduledDate);
            return {
                time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                company: i.companyName || 'Company',
                type: i.roundType || 'Interview',
                room: i.venue || i.location || 'TBD',
                candidates: i.candidateCount || i.candidatesCount || 0,
            };
        });

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">
            <WelcomeCard />

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Placement Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {PO_ACTIONS.map((action, idx) => (
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
                {PO_KPIS.map((kpi, idx) => (
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

            {/* Drive Pipeline + Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Drive Pipeline */}
                <div className="lg:col-span-2 card-nmims p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Handshake className="w-5 h-5 text-primary" />
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
                    ) : drives.length > 0 ? (
                        <div className="space-y-3">
                            {drives.slice(0, 5).map((drive: any, idx: number) => {
                                const config = stageConfig[drive.status] || stageConfig.active;
                                return (
                                    <div key={idx} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{drive.companyName || 'Company'} — {drive.title || 'Drive'}</p>
                                            </div>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>{config.label}</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { label: 'Applied', value: drive.applicantCount || 0, color: 'text-blue-400' },
                                                { label: 'Shortlisted', value: drive.shortlistedCount || 0, color: 'text-purple-400' },
                                                { label: 'Interviewed', value: drive.interviewedCount || 0, color: 'text-amber-400' },
                                                { label: 'Offered', value: drive.offeredCount || 0, color: 'text-emerald-400' },
                                            ].map((stage, sIdx) => (
                                                <div key={sIdx} className="text-center">
                                                    <p className={`text-lg font-bold ${stage.color}`}>{stage.value}</p>
                                                    <p className="text-xs text-muted-foreground">{stage.label}</p>
                                                </div>
                                            ))}
                                        </div>
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

                {/* Today's Schedule */}
                <div className="card-nmims p-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                        <CalendarCheck className="w-5 h-5 text-primary" />
                        Today's Schedule
                    </h3>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : todaySchedule.length > 0 ? (
                        <div className="space-y-3">
                            {todaySchedule.map((slot: any, idx: number) => (
                                <div key={idx} className="p-3 rounded-xl bg-secondary/30 border border-border/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-bold text-primary">{slot.time}</span>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">{slot.company} — {slot.type}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{slot.room} • {slot.candidates} candidates</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Inbox className="w-8 h-8 mb-2" />
                            <p className="text-sm text-center">No interviews scheduled for today.</p>
                        </div>
                    )}
                    <NavLink
                        to="/admin/interviews"
                        className="mt-4 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-primary/20 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                    >
                        Full Calendar <ArrowRight className="w-4 h-4" />
                    </NavLink>
                </div>
            </div>

            {/* Season Progress */}
            <div className="card-nmims p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Season Progress
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Companies Onboarded', value: companies.length, target: Math.max(companies.length, 50), color: 'bg-blue-500' },
                        { label: 'Drives Created', value: drives.length, target: Math.max(drives.length, 40), color: 'bg-purple-500' },
                        { label: 'Total Offers', value: offers.length, target: Math.max(offers.length, 400), color: 'bg-emerald-500' },
                        { label: 'Interviews Held', value: interviews.length, target: Math.max(interviews.length, 200), color: 'bg-amber-500' },
                    ].map((stat, idx) => (
                        <div key={idx}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                                <span className="text-xs text-foreground font-bold">{isLoading ? '...' : stat.value}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                <div className={`h-full rounded-full ${stat.color}`} style={{ width: `${stat.target > 0 ? (stat.value / stat.target) * 100 : 0}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
