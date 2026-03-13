import React from 'react';
import { Trophy, Building2, ExternalLink, GraduationCap, Rocket } from 'lucide-react';
import type { ReportSummaryData } from '../../../types/reportAdmin';

interface TopPerformersTableProps {
    tables: ReportSummaryData | null;
}

const statusColor = (status: string) => {
    switch (status) {
        case 'accepted': return 'text-emerald-400 bg-emerald-500/10';
        case 'issued': return 'text-blue-400 bg-blue-500/10';
        case 'rejected': return 'text-rose-400 bg-rose-500/10';
        case 'on_hold': return 'text-amber-400 bg-amber-500/10';
        case 'completed': return 'text-emerald-400 bg-emerald-500/10';
        case 'ongoing': return 'text-blue-400 bg-blue-500/10';
        case 'registration_open': return 'text-indigo-400 bg-indigo-500/10';
        default: return 'text-slate-400 bg-slate-500/10';
    }
};

export const TopPerformersTable: React.FC<TopPerformersTableProps> = ({ tables }) => {
    if (!tables) return null;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(date);
    };

    return (
        <div className="space-y-6">

            {/* Row 1: Top Recruiters & Department Leaders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top Recruiters */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
                    <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            Top Volume Recruiters
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-900/40 text-slate-400 border-b border-slate-800/50">
                                    <th className="px-5 py-3 font-medium">#</th>
                                    <th className="px-5 py-3 font-medium">Company</th>
                                    <th className="px-5 py-3 font-medium">Offers</th>
                                    <th className="px-5 py-3 font-medium text-right">Avg CTC</th>
                                    <th className="px-5 py-3 font-medium text-right">Highest</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {tables.topCompanies.map((company, idx) => (
                                    <tr key={company.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="font-bold text-white">{company.companyName}</div>
                                            <div className="text-[11px] text-slate-500">{company.industry}</div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="inline-block px-2 py-1 bg-brand-500/10 text-brand-400 font-bold rounded">
                                                {company.offersCount}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <span className="text-slate-300 font-medium">{company.avgPackage} LPA</span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <span className="text-emerald-400 font-bold">{company.highestPackage} LPA</span>
                                        </td>
                                    </tr>
                                ))}
                                {tables.topCompanies.length === 0 && (
                                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No company data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Department Leaders */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
                    <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-indigo-500" />
                            Department Leaders
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-900/40 text-slate-400 border-b border-slate-800/50">
                                    <th className="px-5 py-3 font-medium">Department</th>
                                    <th className="px-5 py-3 font-medium">Total / Placed</th>
                                    <th className="px-5 py-3 font-medium">Avg CTC</th>
                                    <th className="px-5 py-3 font-medium text-right">Placement %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {tables.departmentStats.map((dept) => (
                                    <tr key={dept.department} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-3 font-medium text-slate-200">
                                            {dept.department.replace('B.Tech - ', '').replace('MBA - ', '')}
                                        </td>
                                        <td className="px-5 py-3 text-slate-400">
                                            <span className="text-white font-medium">{dept.placedStudents}</span> / {dept.totalStudents}
                                        </td>
                                        <td className="px-5 py-3 text-slate-300">
                                            {dept.averagePackage > 0 ? `${dept.averagePackage} LPA` : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${dept.placementPercentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-indigo-400 font-bold min-w-[3ch]">{dept.placementPercentage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {tables.departmentStats.length === 0 && (
                                    <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No department data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Row 2: Drive Performance */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-fuchsia-500" />
                        Drive Performance Summary
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-900/40 text-slate-400 border-b border-slate-800/50">
                                <th className="px-5 py-3 font-medium">Drive</th>
                                <th className="px-5 py-3 font-medium">Company</th>
                                <th className="px-5 py-3 font-medium">Applicants</th>
                                <th className="px-5 py-3 font-medium">Shortlisted</th>
                                <th className="px-5 py-3 font-medium">Offers</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {tables.drivePerformance.map((drive) => (
                                <tr key={drive.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-5 py-3 font-medium text-white">{drive.driveTitle}</td>
                                    <td className="px-5 py-3 text-slate-300">{drive.companyName}</td>
                                    <td className="px-5 py-3 text-slate-400">{drive.applicants}</td>
                                    <td className="px-5 py-3 text-slate-400">{drive.shortlisted}</td>
                                    <td className="px-5 py-3">
                                        <span className="inline-block px-2 py-1 bg-emerald-500/10 text-emerald-400 font-bold rounded text-xs">
                                            {drive.offersIssued}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${statusColor(drive.status)}`}>
                                            {drive.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {tables.drivePerformance.length === 0 && (
                                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No drive data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Row 3: Recent Outcomes */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        Recent Placement Outcomes
                    </h3>
                    <button className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors">
                        View All <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-900/40 text-slate-400 border-b border-slate-800/50">
                                <th className="px-5 py-3 font-medium">Candidate</th>
                                <th className="px-5 py-3 font-medium">Company</th>
                                <th className="px-5 py-3 font-medium">Role</th>
                                <th className="px-5 py-3 font-medium">CTC</th>
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {tables.recentOutcomes.map((outcome) => (
                                <tr key={outcome.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-5 py-3 font-bold text-white">{outcome.studentName}</td>
                                    <td className="px-5 py-3 text-slate-300">{outcome.companyName}</td>
                                    <td className="px-5 py-3 text-slate-400">{outcome.role}</td>
                                    <td className="px-5 py-3">
                                        <span className="text-emerald-400 font-bold">{outcome.ctc} LPA</span>
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">{formatDate(outcome.date)}</td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${statusColor(outcome.status)}`}>
                                            {outcome.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {tables.recentOutcomes.length === 0 && (
                                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No recent outcomes</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};
