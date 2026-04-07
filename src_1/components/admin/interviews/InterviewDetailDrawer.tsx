import React, { useEffect } from 'react';
import { X, CalendarDays, Clock, MapPin, Video, Users, CheckCircle2, ChevronRight, Hash, XCircle, Clock3 } from 'lucide-react';
import type { AdminInterview } from '../../../types/interviewAdmin';

interface InterviewDetailDrawerProps {
    interview: AdminInterview | null;
    isOpen: boolean;
    onClose: () => void;
}

export const InterviewDetailDrawer: React.FC<InterviewDetailDrawerProps> = ({
    interview,
    isOpen,
    onClose
}) => {

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !interview) return null;

    const StatusBadge = ({ label, type }: { label: string; type: 'success' | 'warning' | 'error' | 'neutral' }) => {
        const colors = {
            success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            neutral: 'bg-slate-500/10 text-muted-foreground border-slate-500/20'
        };
        return (
            <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded border ${colors[type]}`}>
                {label}
            </span>
        );
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-card border-l border-border/50 shadow-2xl z-50 flex flex-col animate-slide-in-right">

                {/* Header Section */}
                <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-xl border-b border-border p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                {interview.status === 'scheduled' && <StatusBadge label="Scheduled" type="neutral" />}
                                {interview.status === 'rescheduled' && <StatusBadge label="Rescheduled" type="warning" />}
                                {interview.status === 'completed' && <StatusBadge label="Completed" type="success" />}
                                {interview.status === 'cancelled' && <StatusBadge label="Cancelled" type="error" />}
                                {interview.status === 'no_show' && <StatusBadge label="No Show" type="neutral" />}

                                <span className="text-muted-foreground text-xs flex items-center gap-1">
                                    <Hash className="w-3 h-3" /> {interview.id}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-1 leading-tight">{interview.studentName}</h2>
                            <p className="text-primary text-sm font-medium flex items-center gap-2">
                                {interview.companyName}
                                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                <span className="text-muted-foreground capitalize">{interview.roundType.replace('_', ' ')}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors flex-shrink-0 ml-4"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Time & Place Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                            <span className="text-xs text-muted-foreground block mb-2 uppercase font-bold tracking-wider">Date & Time</span>
                            <div className="text-foreground font-medium flex items-center gap-2 mb-1">
                                <CalendarDays className="w-4 h-4 text-primary" />
                                {interview.scheduledDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="text-foreground flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                {interview.scheduledTime}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                            <span className="text-xs text-muted-foreground block mb-2 uppercase font-bold tracking-wider">Location / Link</span>
                            <div className="text-foreground font-medium flex items-center gap-2 mb-1">
                                {interview.mode === 'online' ? (
                                    <><Video className="w-4 h-4 text-indigo-400" /> Online Meeting</>
                                ) : (
                                    <><MapPin className="w-4 h-4 text-emerald-400" /> Physical Venue</>
                                )}
                            </div>
                            {interview.mode === 'online' && interview.meetingLink ? (
                                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-brand-300 text-sm break-all underline underline-offset-2">
                                    {interview.meetingLink}
                                </a>
                            ) : (
                                <span className="text-foreground text-sm">
                                    {interview.location || 'Location not specified'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Operational Triptych: Drive, Panel, Attendance */}
                    <div className="space-y-4">
                        <h3 className="text-sm border-b border-border pb-2 font-bold text-foreground flex items-center gap-2">
                            Operational Specs
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">Source Drive</span>
                                <div className="text-sm text-foreground font-medium bg-secondary px-3 py-1.5 rounded-lg border border-border inline-block">
                                    {interview.driveTitle}
                                </div>
                            </div>

                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">Assigned Panel</span>
                                <div className="flex items-start gap-2 text-sm">
                                    <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <div className="text-foreground font-medium mb-1">{interview.panelName || 'Standard Panel'}</div>
                                        {interview.panelMembers && interview.panelMembers.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {interview.panelMembers.map((m, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 bg-secondary border border-border rounded text-foreground">{m}</span>
                                                ))}
                                            </div>
                                        ) : <span className="text-muted-foreground text-xs italic">No specific members listed</span>}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Results Tracking */}
                    <div className="space-y-4">
                        <h3 className="text-sm border-b border-border pb-2 font-bold text-foreground flex items-center gap-2">
                            Outcomes & Tracking
                        </h3>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px] p-4 bg-secondary/30 border border-border/50 rounded-xl flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">Attendance</span>
                                {interview.attendanceStatus === 'attended' && <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span className="text-emerald-400 text-sm font-bold uppercase">Attended</span></>}
                                {interview.attendanceStatus === 'absent' && <><XCircle className="w-5 h-5 text-rose-500" /> <span className="text-rose-400 text-sm font-bold uppercase">Absent</span></>}
                                {interview.attendanceStatus === 'pending' && <><Clock3 className="w-5 h-5 text-muted-foreground" /> <span className="text-muted-foreground text-sm font-bold uppercase">Pending</span></>}
                            </div>

                            <div className="flex-1 min-w-[200px] p-4 bg-secondary/30 border border-border/50 rounded-xl flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">Final Result</span>
                                {interview.resultStatus === 'selected' && <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span className="text-emerald-400 text-sm font-bold uppercase">Selected</span></>}
                                {interview.resultStatus === 'rejected' && <><XCircle className="w-5 h-5 text-rose-500" /> <span className="text-rose-400 text-sm font-bold uppercase">Rejected</span></>}
                                {interview.resultStatus === 'on_hold' && <><Clock3 className="w-5 h-5 text-amber-500" /> <span className="text-amber-400 text-sm font-bold uppercase">On Hold</span></>}
                                {interview.resultStatus === 'pending' && <><Clock3 className="w-5 h-5 text-muted-foreground" /> <span className="text-muted-foreground text-sm font-bold uppercase">Pending</span></>}
                            </div>
                        </div>

                        {interview.notes && (
                            <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                <span className="text-xs uppercase font-bold tracking-wider text-amber-500 mb-2 block">Staff Notes</span>
                                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                    {interview.notes}
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};
