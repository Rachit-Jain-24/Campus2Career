import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';
import type { DepartmentStat, FunnelStat } from '../../../types/adminDashboard';



// Custom Tooltip for charts to match our dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
                <p className="text-sm font-bold text-foreground mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-bold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface VisualAnalyticsProps {
    departmentStats: DepartmentStat[];
    funnelStats: FunnelStat[];
    isLoading?: boolean;
}

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({
    departmentStats,
    funnelStats,
    isLoading
}) => {
    const { user } = useAuth();
    const canViewAnalytics = hasPermission(user, 'view_analytics');

    if (!canViewAnalytics) return null;

    const hasData = departmentStats.length > 0 || funnelStats.length > 0;

    if (!hasData && !isLoading) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-8 text-center">
                <p className="text-muted-foreground text-sm">No analytics data available yet. Add students and drives to see charts.</p>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <h3 className="text-base font-bold mb-6 text-slate-800">Analytics Overview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Placement Chart */}
                {departmentStats.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6">
                        <h4 className="text-sm font-bold text-slate-800 mb-4">Department Placements</h4>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={departmentStats} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="placed" fill="#10b981" name="Placed" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="unplaced" fill="#64748b" name="Unplaced" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Placement Funnel */}
                {funnelStats.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6">
                        <h4 className="text-sm font-bold text-slate-800 mb-4">Placement Funnel</h4>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={funnelStats} layout="vertical" barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                                <YAxis type="category" dataKey="stage" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={85} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Students" radius={[0, 4, 4, 0]}>
                                    {funnelStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};
