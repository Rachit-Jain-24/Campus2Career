import React from 'react';
import { X, User, Clock, Shield, Tag, FileText, ArrowRight, Code2 } from 'lucide-react';
import type { AuditLogEntry } from '../../../types/auditAdmin';

interface AuditDetailDrawerProps {
    log: AuditLogEntry | null;
    isOpen: boolean;
    onClose: () => void;
}

const severityColor = (s: string) => {
    switch (s) {
        case 'critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        case 'high': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        case 'medium': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        case 'low': return 'text-slate-400 bg-slate-700/50 border-slate-700';
        default: return 'text-slate-400 bg-slate-700/50 border-slate-700';
    }
};

export const AuditDetailDrawer: React.FC<AuditDetailDrawerProps> = ({ log, isOpen, onClose }) => {
    if (!isOpen || !log) return null;

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        }).format(date);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-slate-950 border-l border-slate-800 z-50 overflow-y-auto animate-slide-in-right">

                {/* Header */}
                <div className="sticky top-0 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 px-6 py-4 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-lg font-bold text-white">Audit Event Details</h2>
                        <p className="text-xs text-slate-500 mt-0.5">ID: {log.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Severity Badge */}
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize border ${severityColor(log.severity)}`}>
                            {log.severity} Severity
                        </span>
                        <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-bold capitalize">
                            {log.action.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                            <FileText className="w-3.5 h-3.5" />
                            Summary
                        </div>
                        <p className="text-sm text-white leading-relaxed">{log.summary}</p>
                    </div>

                    {/* Actor Details */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <User className="w-3.5 h-3.5" />
                            Actor Information
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-slate-500 text-xs mb-0.5">Name</div>
                                <div className="text-white font-medium">{log.actorName}</div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs mb-0.5">Role</div>
                                <div className="text-white font-medium capitalize">{log.actorRole.replace('_', ' ')}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-slate-500 text-xs mb-0.5">Email</div>
                                <div className="text-white font-medium">{log.actorEmail}</div>
                            </div>
                        </div>
                    </div>

                    {/* Event Context */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <Tag className="w-3.5 h-3.5" />
                            Event Context
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-slate-500 text-xs mb-0.5">Module</div>
                                <div className="text-indigo-400 font-medium capitalize">{log.module}</div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs mb-0.5">Action</div>
                                <div className="text-white font-medium capitalize">{log.action.replace('_', ' ')}</div>
                            </div>
                            {log.targetId && (
                                <div>
                                    <div className="text-slate-500 text-xs mb-0.5">Target ID</div>
                                    <div className="text-white font-mono text-xs">{log.targetId}</div>
                                </div>
                            )}
                            {log.targetType && (
                                <div>
                                    <div className="text-slate-500 text-xs mb-0.5">Target Type</div>
                                    <div className="text-white font-medium capitalize">{log.targetType}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timestamp & Network */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            Timestamp & Network
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>
                                <div className="text-slate-500 text-xs mb-0.5">When</div>
                                <div className="text-white font-medium">{formatDateTime(log.timestamp)}</div>
                            </div>
                            {log.ipAddress && (
                                <div>
                                    <div className="text-slate-500 text-xs mb-0.5">IP Address</div>
                                    <div className="text-white font-mono text-xs">{log.ipAddress}</div>
                                </div>
                            )}
                            {log.userAgent && (
                                <div>
                                    <div className="text-slate-500 text-xs mb-0.5">User Agent</div>
                                    <div className="text-slate-400 text-xs truncate">{log.userAgent}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Before / After Snapshots */}
                    {(log.beforeSnapshot || log.afterSnapshot) && (
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                <Shield className="w-3.5 h-3.5" />
                                Change Diff
                            </div>
                            <div className="flex items-start gap-3">
                                {log.beforeSnapshot && (
                                    <div className="flex-1 p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                                        <div className="text-xs font-bold text-rose-400 mb-2">Before</div>
                                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                                            {JSON.stringify(log.beforeSnapshot, null, 2)}
                                        </pre>
                                    </div>
                                )}
                                {log.beforeSnapshot && log.afterSnapshot && (
                                    <ArrowRight className="w-4 h-4 text-slate-600 mt-6 flex-shrink-0" />
                                )}
                                {log.afterSnapshot && (
                                    <div className="flex-1 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                        <div className="text-xs font-bold text-emerald-400 mb-2">After</div>
                                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                                            {JSON.stringify(log.afterSnapshot, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Metadata JSON */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                <Code2 className="w-3.5 h-3.5" />
                                Event Metadata
                            </div>
                            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};
