import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, ComposedChart, Cell
} from 'recharts';
import { PieChart as LucidePieChart, TrendingUp, Filter, Activity, CalendarDays } from 'lucide-react';
import type { ChartDatasets } from '../../../types/reportAdmin';

interface PlacementChartsProps {
    datasets: ChartDatasets | null;
}

const FUNNEL_COLORS = ['#3b82f6', '#6366f1', '#a855f7', '#10b981'];

export const PlacementCharts: React.FC<PlacementChartsProps> = ({ datasets }) => {
    if (!datasets) return null;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border p-3 rounded-lg shadow-xl">
                    <p className="font-bold text-foreground mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-foreground">{entry.name}:</span>
                            <span className="font-bold" style={{ color: entry.color }}>
                                {entry.value} {entry.name.includes('Package') || entry.name.includes('avg') || entry.name.includes('highest') ? 'LPA' : ''}
                                {entry.name.includes('percentage') || entry.name.includes('score') ? '%' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">

            {/* Row 1: Department Placements & Compensation Trajectory */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Department Placements (Stacked Bar) */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <LucidePieChart className="w-5 h-5 text-indigo-500" />
                            Department Outcomes
                        </h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datasets.departmentPlacements} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Bar dataKey="placed" name="Placed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="unplaced" name="Seeking" stackId="a" fill="#334155" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Compensation Trajectory (Area Chart) */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Compensation Trajectory (CTC)
                        </h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={datasets.packageTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHighest" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Area type="monotone" dataKey="highest" name="Highest Peak" stroke="#f59e0b" fillOpacity={1} fill="url(#colorHighest)" />
                                <Area type="monotone" dataKey="avg" name="Average Mean" stroke="#10b981" fillOpacity={1} fill="url(#colorAvg)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Row 2: Funnel, Readiness, Drive Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Interview Conversion Funnel (Horizontal Bar) */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-500" />
                            Conversion Funnel
                        </h3>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart layout="vertical" data={datasets.interviewFunnel} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} hide />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                                <Bar dataKey="value" name="Candidates" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                                    {datasets.interviewFunnel.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                                    ))}
                                </Bar>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Batch Readiness Index (Line Chart) */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Activity className="w-5 h-5 text-fuchsia-500" />
                            Batch Readiness
                        </h3>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={datasets.yearWiseReadiness} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="score" name="Readiness Score" stroke="#d946ef" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Drive Activity (Composed Bar + Line) */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-amber-500" />
                            Monthly Activity
                        </h3>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={datasets.monthlyDriveActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Bar dataKey="drives" name="Drives Launched" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                <Line type="monotone" dataKey="offers" name="Offers Made" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

        </div>
    );
};
