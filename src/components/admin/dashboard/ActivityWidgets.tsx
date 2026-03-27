import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Clock,
    Building2,
    Briefcase,
    UserCircle,
    Server,
    CalendarDays,
    ChevronRight,
    Users,
    Award
} from 'lucide-react';
import type { ActivityItem, InterviewItem } from '../../../types/adminDashboard';

// Helper to format timestamps relative to now
const formatRelativeTime = (date: Date) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round(
        (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference === 0) {
        const hoursDiff = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
        if (hoursDiff === 0) return 'Just now';
        return rtf.format(hoursDiff, 'hour');
    }

    return rtf.format(daysDifference, 'day');
};

const formatAbsoluteDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    }).format(date);
};

// Activity Feed Item Component
const ActivityListItem: React.FC<{ item: ActivityItem }> = ({ item }) => {
    const getIcon = () => {
        switch (item.type) {
            case 'company': return <Building2 className="w-4 h-4 text-blue-500" />;
            case 'offer': return <Award className="w-4 h-4 text-emerald-500" />;
            case 'drive': return <Briefcase className="w-4 h-4 text-purple-500" />;
            case 'student': return <UserCircle className="w-4 h-4 text-amber-500" />;
            case 'system': return <Server className="w-4 h-4 text-muted-foreground" />;
            default: return <Clock className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <div className="flex gap-4 relative">
            <div className="w-px h-full bg-border absolute left-4 top-8 -z-10 group-last:hidden" />
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-1">
                {getIcon()}
            </div>
            <div className="pb-5">
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <span className="text-xs text-muted-foreground">• {formatRelativeTime(item.timestamp)}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
            </div>
        </div>
    );
};

export const RecentActivity: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm h-full flex flex-col p-0">
            <div className="p-5 sm:p-6 border-b border-border/50 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
                <NavLink to="/admin/audit-logs" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight className="w-3 h-3" />
                </NavLink>
            </div>
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar">
                {activities.length > 0 ? (
                    <div className="flex flex-col group">
                        {activities.map((act) => (
                            <ActivityListItem key={act.id} item={act} />
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-8">
                        No recent activity recorded.
                    </div>
                )}
            </div>
        </div>
    );
};

// Upcoming Interviews Component
const InterviewListItem: React.FC<{ item: InterviewItem }> = ({ item }) => {
    const isOngoing = item.status === 'ongoing';

    return (
        <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/50 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isOngoing ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-primary/10 text-primary'}`}>
                    <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-foreground">{item.companyName}</h4>
                    <p className="text-xs text-muted-foreground mb-1">{item.role} • {item.type.replace('_', ' ').toUpperCase()}</p>
                    <div className="flex items-center gap-3 text-xs font-medium">
                        <span className={`px-2 py-0.5 rounded-full ${isOngoing ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
                            {isOngoing ? 'Ongoing Now' : formatAbsoluteDate(item.date)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background px-3 py-1.5 rounded-lg border border-border shadow-sm">
                <Users className="w-3.5 h-3.5" />
                <span>{item.candidatesCount} Candidates</span>
            </div>
        </div>
    );
};

export const UpcomingInterviewsWidget: React.FC<{ interviews: InterviewItem[] }> = ({ interviews }) => {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm h-full flex flex-col p-0">
            <div className="p-5 sm:p-6 border-b border-border/50 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-800">Upcoming Interviews</h3>
                <NavLink to="/admin/interviews" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                    Manage Schedule <ChevronRight className="w-3 h-3" />
                </NavLink>
            </div>
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                {interviews.length > 0 ? (
                    interviews.map(int => (
                        <InterviewListItem key={int.id} item={int} />
                    ))
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-8">
                        No upcoming interviews scheduled.
                    </div>
                )}
            </div>
        </div>
    );
};
