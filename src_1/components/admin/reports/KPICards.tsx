import React from 'react';
import { UserCheck, GraduationCap, Briefcase, IndianRupee, PieChart, TrendingUp, Handshake, CalendarCheck, Zap } from 'lucide-react';
import type { KPIStats } from '../../../types/reportAdmin';
import { useAuth } from '../../../contexts/AuthContext';
import { hasRole } from '../../../utils/admin/rbac';

interface KPICardsProps {
    stats: KPIStats | null;
}

export const KPICards: React.FC<KPICardsProps> = ({ stats }) => {
    const { user } = useAuth();

    const canViewFinancials = hasRole(user, ['system_admin', 'director', 'placement_officer', 'dean']);

    if (!stats) return null;

    const baseCards = [
        {
            title: 'Overall Placement',
            value: `${stats.placementPercentage}%`,
            subtitle: `of ${stats.totalStudents} total pool`,
            icon: PieChart,
            color: 'text-brand-500',
            bg: 'bg-primary/10',
            border: 'border-brand-500/20'
        },
        {
            title: 'Eligible & Ready',
            value: stats.eligibleStudents,
            subtitle: `Students cleared rules`,
            icon: UserCheck,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20'
        },
        {
            title: 'Currently Placed',
            value: stats.placedStudents,
            subtitle: `Accepted final offers`,
            icon: GraduationCap,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        },
        {
            title: 'Acceptance Rate',
            value: `${stats.offerAcceptanceRate}%`,
            subtitle: `From ${stats.totalOffers} total offers`,
            icon: Handshake,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            title: 'Total Interviews',
            value: stats.totalInterviews,
            subtitle: `${stats.interviewConversionRate}% conversion`,
            icon: CalendarCheck,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20'
        }
    ];

    const financialCards = [
        {
            title: 'Highest Package',
            value: `${stats.highestPackage} LPA`,
            subtitle: `Peak compensation`,
            icon: IndianRupee,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20'
        },
        {
            title: 'Average Package',
            value: `${stats.averagePackage} LPA`,
            subtitle: `Median band`,
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        },
        {
            title: 'Active Drives',
            value: stats.activeDrives,
            subtitle: `Live pipelines`,
            icon: Briefcase,
            color: 'text-fuchsia-400',
            bg: 'bg-fuchsia-500/10',
            border: 'border-fuchsia-500/20'
        },
        {
            title: 'Interview Conv.',
            value: `${stats.interviewConversionRate}%`,
            subtitle: `Selected / Total`,
            icon: Zap,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        }
    ];

    const displayedCards = canViewFinancials ? [...baseCards, ...financialCards] : baseCards;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {displayedCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className="bg-card border border-border rounded-xl p-5 hover:border-border transition-all duration-200 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.bg} ${card.border} border group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">{card.title}</div>
                            <div className="text-2xl font-black text-foreground">{card.value}</div>
                            <div className="text-xs text-muted-foreground mt-1 font-medium">{card.subtitle}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
