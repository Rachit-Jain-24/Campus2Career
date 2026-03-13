import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    UserCheck, FileText, CalendarCheck, Award, GraduationCap,
    ArrowRight, Clock, Loader2, Inbox, Star, BookOpen
} from 'lucide-react';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';
import { useDashboardData } from '../../../hooks/admin/useDashboardData';

export const FacultyDashboard: React.FC = () => {
    const { students, interviews, isLoading } = useDashboardData();

    // KPIs from real data
    const totalStudents = students.length;
    const upcomingInterviewCount = interviews.filter((i: any) => {
        const d = i.scheduledDate instanceof Date ? i.scheduledDate : new Date(i.scheduledDate);
        return d >= new Date() && i.status !== 'completed';
    }).length;

    const FACULTY_KPIS = [
        { title: 'Students', value: isLoading ? '...' : totalStudents.toLocaleString(), icon: GraduationCap, subtitle: 'In the system', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        { title: 'Resumes Uploaded', value: isLoading ? '...' : students.filter((s: any) => s.resumeUrl || s.hasResume).length.toLocaleString(), icon: FileText, subtitle: 'With resume on file', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        { title: 'Upcoming Interviews', value: isLoading ? '...' : upcomingInterviewCount.toLocaleString(), icon: CalendarCheck, subtitle: 'Scheduled across drives', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { title: 'Total Interviews', value: isLoading ? '...' : interviews.length.toLocaleString(), icon: Award, subtitle: 'All interview records', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    ];

    const FACULTY_ACTIONS = [
        { label: 'View Students', icon: FileText, path: '/admin/students', color: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'Interviews', icon: CalendarCheck, path: '/admin/interviews', color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Student Profiles', icon: BookOpen, path: '/admin/students', color: 'text-purple-400 bg-purple-500/10' },
        { label: 'Reports', icon: Award, path: '/admin/reports', color: 'text-amber-400 bg-amber-500/10' },
    ];

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">
            <WelcomeCard />

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Mentorship Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {FACULTY_ACTIONS.map((action, idx) => (
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
                {FACULTY_KPIS.map((kpi, idx) => (
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

            {/* Student Overview + Upcoming Interviews */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student Overview */}
                <div className="lg:col-span-2 card-nmims p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-primary" />
                            Student Overview
                        </h3>
                        <NavLink to="/admin/students" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                            All Students <ArrowRight className="w-4 h-4" />
                        </NavLink>
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : students.length > 0 ? (
                        <div className="space-y-3">
                            {students.slice(0, 6).map((student: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                        {(student.name || 'S').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{student.name || 'Student'}</p>
                                        <p className="text-xs text-muted-foreground">{student.sapId || student.email || ''} • {student.department || student.branch || ''}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${student.placementStatus === 'placed' ? 'text-emerald-400 bg-emerald-500/10' :
                                            student.placementStatus === 'eligible' ? 'text-blue-400 bg-blue-500/10' :
                                                'text-amber-400 bg-amber-500/10'
                                        }`}>
                                        {student.placementStatus || 'registered'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Inbox className="w-8 h-8 mb-2" />
                            <p className="text-sm">No students registered yet.</p>
                        </div>
                    )}
                </div>

                {/* Upcoming Interviews */}
                <div className="card-nmims p-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                        <CalendarCheck className="w-5 h-5 text-primary" />
                        Upcoming Interviews
                    </h3>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : interviews.filter((i: any) => {
                        const d = i.scheduledDate instanceof Date ? i.scheduledDate : new Date(i.scheduledDate);
                        return d >= new Date() && i.status !== 'completed';
                    }).length > 0 ? (
                        <div className="space-y-3">
                            {interviews
                                .filter((i: any) => {
                                    const d = i.scheduledDate instanceof Date ? i.scheduledDate : new Date(i.scheduledDate);
                                    return d >= new Date() && i.status !== 'completed';
                                })
                                .slice(0, 4)
                                .map((interview: any, idx: number) => {
                                    const d = interview.scheduledDate instanceof Date ? interview.scheduledDate : new Date(interview.scheduledDate);
                                    return (
                                        <div key={idx} className="p-3 rounded-xl bg-secondary/30 border border-border/50">
                                            <p className="text-sm font-medium text-foreground">{interview.companyName || 'Interview'}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{interview.roundType || 'Round'} • {interview.driveTitle || ''}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">{d.toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Inbox className="w-8 h-8 mb-2" />
                            <p className="text-sm text-center">No upcoming interviews.</p>
                        </div>
                    )}
                    <NavLink
                        to="/admin/interviews"
                        className="mt-4 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-primary/20 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                    >
                        View All Interviews <ArrowRight className="w-4 h-4" />
                    </NavLink>
                </div>
            </div>

            {/* Certification Recommendations — No Firestore backing */}
            <div className="card-nmims p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-primary" />
                    Certification Recommendations
                </h3>
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Inbox className="w-8 h-8 mb-2" />
                    <p className="text-sm text-center">No certification data available yet.</p>
                    <p className="text-xs mt-1 text-center">Recommendations will appear when certification tracking is configured.</p>
                </div>
            </div>
        </div>
    );
};
