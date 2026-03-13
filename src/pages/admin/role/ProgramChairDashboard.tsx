import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    BookOpen, ShieldCheck, GraduationCap, TrendingUp, BarChart3,
    Users, ArrowRight, CheckCircle2, AlertTriangle, Target, Loader2, Inbox
} from 'lucide-react';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';
import { useDashboardData } from '../../../hooks/admin/useDashboardData';

export const ProgramChairDashboard: React.FC = () => {
    const { stats, students, eligibilityRules, roleCounts, isLoading } = useDashboardData();

    // Live KPIs
    const eligibleCount = students.filter((s: any) =>
        s.placementStatus === 'eligible' || s.placementStatus === 'placed' || s.eligibilityStatus === 'eligible'
    ).length;
    const activeRules = eligibilityRules.filter((r: any) => r.active !== false).length;

    const PC_KPIS = [
        { title: 'Dept Placement', value: isLoading ? '...' : `${stats.placementRate}%`, icon: TrendingUp, subtitle: 'Across departments', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        { title: 'Eligible Students', value: isLoading ? '...' : eligibleCount.toLocaleString(), icon: GraduationCap, subtitle: 'Cleared eligibility rules', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        { title: 'Eligibility Rules', value: isLoading ? '...' : activeRules.toLocaleString(), icon: ShieldCheck, subtitle: 'Active rules configured', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { title: 'Total Students', value: isLoading ? '...' : stats.totalStudents.toLocaleString(), icon: BookOpen, subtitle: 'Registered in system', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    ];

    const PC_ACTIONS = [
        { label: 'Set Eligibility', icon: ShieldCheck, path: '/admin/eligibility-rules', color: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'View Students', icon: GraduationCap, path: '/admin/students', color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Dept Analytics', icon: BarChart3, path: '/admin/reports', color: 'text-purple-400 bg-purple-500/10' },
        { label: 'Faculty Coordination', icon: Users, path: '/admin/students', color: 'text-amber-400 bg-amber-500/10' },
    ];

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">
            <WelcomeCard />

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Department Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {PC_ACTIONS.map((action, idx) => (
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
                {PC_KPIS.map((kpi, idx) => (
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

            {/* Eligibility Rules + Skill Gap Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Eligibility Rules Status */}
                <div className="card-nmims p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            Eligibility Rules
                        </h3>
                        <NavLink to="/admin/eligibility-rules" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                            Manage <ArrowRight className="w-4 h-4" />
                        </NavLink>
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : eligibilityRules.length > 0 ? (
                        <div className="space-y-3">
                            {eligibilityRules.slice(0, 5).map((rule: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rule.active !== false ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                        {rule.active !== false ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{rule.ruleName || rule.name || 'Eligibility Rule'}</p>
                                        <p className="text-xs text-muted-foreground">{rule.description || 'No description'}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rule.active !== false ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                        {rule.active !== false ? 'active' : 'inactive'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Inbox className="w-8 h-8 mb-2" />
                            <p className="text-sm">No eligibility rules configured yet.</p>
                        </div>
                    )}
                </div>

                {/* Skill Gap Analysis — No Firestore backing */}
                <div className="card-nmims p-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                        <Target className="w-5 h-5 text-primary" />
                        Student Skill Coverage
                    </h3>
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Inbox className="w-8 h-8 mb-2" />
                        <p className="text-sm text-center">Skill gap data not available yet.</p>
                        <p className="text-xs mt-1 text-center">Skill analytics will appear when student skill data is tracked.</p>
                    </div>
                </div>
            </div>

            {/* Faculty Under Program Chair */}
            <div className="card-nmims p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    Faculty Under Your Coordination
                </h3>
                <p className="text-sm text-muted-foreground mb-4">As Program Chair, you coordinate faculty members for placement mentorship and interview preparation.</p>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Faculty Members</p>
                        <p className="text-xs text-muted-foreground">{isLoading ? '...' : `${roleCounts.faculty} faculty registered in the system`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
