import React from 'react';
import { ChevronUp, ChevronDown, CheckCircle2, PlayCircle, Clock, XCircle, Users, Pencil, Eye, Calendar, Building2 } from 'lucide-react';
import type { AdminDriveProfile, DriveSortConfig, DriveSortField } from '../../../types/driveAdmin';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';

interface DriveTableProps {
    drives: AdminDriveProfile[];
    sortConfig: DriveSortConfig;
    onSort: (field: DriveSortField) => void;
    onViewDrive: (drive: AdminDriveProfile) => void;
    onEditDrive: (drive: AdminDriveProfile) => void;
    isLoading: boolean;
}

export const DriveTable: React.FC<DriveTableProps> = ({
    drives,
    sortConfig,
    onSort,
    onViewDrive,
    onEditDrive,
    isLoading
}) => {

    const { user } = useAuth();
    const canManageDrives = hasPermission(user, 'manage_drives');

    const handleSort = (field: DriveSortField) => onSort(field);

    const getSortIcon = (field: DriveSortField) => {
        if (sortConfig.field !== field) return <ChevronDown className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.order === 'asc'
            ? <ChevronUp className="w-4 h-4 text-primary" />
            : <ChevronDown className="w-4 h-4 text-primary" />;
    };

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'completed': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', Icon: CheckCircle2, label: 'Completed' };
            case 'ongoing': return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-brand-500/20', Icon: PlayCircle, label: 'Ongoing' };
            case 'registration_open': return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', Icon: Users, label: 'Reg Open' };
            case 'upcoming': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', Icon: Clock, label: 'Upcoming' };
            case 'cancelled': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', Icon: XCircle, label: 'Cancelled' };
            case 'draft':
            default: return { bg: 'bg-slate-500/10', text: 'text-muted-foreground', border: 'border-slate-500/20', Icon: Edit3, label: 'Draft' };
        }
    };

    if (isLoading) {
        return (
            <div className="w-full bg-secondary/50 border border-border/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground font-medium">Loading placement drives...</p>
            </div>
        );
    }

    if (drives.length === 0) {
        return (
            <div className="w-full bg-secondary/50 border border-border/50 rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 border border-border">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Drives Found</h3>
                <p className="text-muted-foreground max-w-sm">
                    No active or past placement drives match your active filters.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full bg-secondary/50 border border-border/50 rounded-xl overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-card/50 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            <th
                                className="px-5 py-4 cursor-pointer group hover:bg-secondary/50 transition-colors w-1/3"
                                onClick={() => handleSort('title')}
                            >
                                <div className="flex items-center justify-between">
                                    <span>Drive Details</span> {getSortIcon('title')}
                                </div>
                            </th>
                            <th
                                className="px-5 py-4 cursor-pointer group hover:bg-secondary/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">Metrics & Scope</div>
                            </th>
                            <th
                                className="px-5 py-4 cursor-pointer group hover:bg-secondary/50 transition-colors"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-2">Timeline Status {getSortIcon('status')}</div>
                            </th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {drives.map((drive) => {
                            const theme = getStatusTheme(drive.status);
                            const StatusIcon = theme.Icon;
                            const isRegOpen = new Date() >= drive.registrationStart && new Date() <= drive.registrationEnd;

                            return (
                                <tr
                                    key={drive.id}
                                    className="hover:bg-secondary/80 transition-colors group cursor-pointer"
                                    onClick={() => onViewDrive(drive)}
                                >
                                    {/* Drive Details */}
                                    <td className="px-5 py-5">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 flex-shrink-0 bg-card border border-border rounded-lg flex items-center justify-center p-1.5 opacity-80 group-hover:opacity-100 transition-opacity mt-1">
                                                {drive.companyLogoUrl ? (
                                                    <img src={drive.companyLogoUrl} alt={drive.companyName} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <Building2 className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-foreground group-hover:text-brand-300 transition-colors text-sm mb-0.5 line-clamp-1">
                                                    {drive.title}
                                                </div>
                                                <div className="text-xs text-primary font-medium mb-1 truncate">
                                                    {drive.companyName} • {drive.jobRole}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                    <span className="capitalize">{drive.mode.replace('-', ' ')}</span>
                                                    <span className="w-1 h-1 rounded-full bg-secondary"></span>
                                                    <span className="truncate">{drive.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Metrics & Scope */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Package</div>
                                                <div className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded inline-block">
                                                    {drive.packageRange}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 leading-tight text-center">Applicants</div>
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-bold text-slate-200">{drive.applicantCount}</span>
                                                </div>
                                            </div>
                                            {drive.shortlistedCount > 0 && (
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1 leading-tight text-center">Shortlists</div>
                                                    <div className="flex items-center gap-1.5 justify-center">
                                                        <span className="text-sm font-bold text-brand-300">{drive.shortlistedCount}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Timeline Status */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex flex-col items-start gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${theme.bg} ${theme.text} ${theme.border}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                <span>{theme.label}</span>
                                                {isRegOpen && drive.status !== 'registration_open' && (
                                                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" title="Registration currently active"></span>
                                                )}
                                            </span>
                                            <div className="text-[10px] text-muted-foreground font-medium">
                                                Reg End: {drive.registrationEnd.toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contextual Actions */}
                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDrive(drive);
                                                }}
                                                className="p-2 bg-secondary hover:bg-primary border border-border hover:border-brand-500 text-muted-foreground hover:text-foreground rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {canManageDrives && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditDrive(drive);
                                                    }}
                                                    className="p-2 bg-secondary hover:bg-amber-600 border border-border hover:border-amber-500 text-muted-foreground hover:text-foreground rounded-lg transition-all"
                                                    title="Edit Drive Configuration"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-3 bg-card/30 border-t border-border/50 text-[11px] text-muted-foreground flex justify-between items-center sm:hidden">
                Swipe left to view complete details
            </div>
        </div>
    );
};

// Internal minimal icon since its missing from standard imports rarely
const Edit3 = ({ className }: { className: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
