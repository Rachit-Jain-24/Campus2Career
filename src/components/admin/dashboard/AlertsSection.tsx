import React from 'react';
import { NavLink } from 'react-router-dom';
import { AlertTriangle, XCircle, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';
import type { AlertItem } from '../../../types/adminDashboard';

export const AlertsSection: React.FC<{ alerts: AlertItem[] }> = ({ alerts }) => {
    const { user } = useAuth();

    // Filter alerts to only show those the user has permission to act upon, or system-wide without requirements
    const visibleAlerts = alerts.filter(
        alert => !alert.requiredPermission || hasPermission(user, alert.requiredPermission)
    );

    if (visibleAlerts.length === 0) return null;

    const getAlertStyle = (type: string) => {
        switch (type) {
            case 'error': return 'bg-rose-500/10 border-rose-500/20 text-rose-500';
            case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
            case 'success': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
            case 'info': default: return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'error': return <XCircle className="w-5 h-5 flex-shrink-0" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 flex-shrink-0" />;
            case 'success': return <CheckCircle2 className="w-5 h-5 flex-shrink-0" />;
            case 'info': default: return <Info className="w-5 h-5 flex-shrink-0" />;
        }
    };

    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                Action Required <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{visibleAlerts.length}</span>
            </h3>
            <div className="flex flex-col gap-3">
                {visibleAlerts.map(alert => (
                    <div
                        key={alert.id}
                        className={`flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 rounded-xl border ${getAlertStyle(alert.type)}`}
                    >
                        <div className="flex items-start sm:items-center gap-3">
                            {getIcon(alert.type)}
                            <p className="text-sm font-medium leading-relaxed">{alert.message}</p>
                        </div>

                        {alert.actionLabel && alert.actionLink && (
                            <NavLink
                                to={alert.actionLink}
                                className={`text-xs font-bold px-4 py-2 rounded-lg ml-8 sm:ml-0 inline-flex items-center gap-1 transition-colors hover:bg-background/50 ${getAlertStyle(alert.type).replace('bg-', 'hover:bg-').split(' ')[0]}`}
                            >
                                {alert.actionLabel}
                                <ChevronRight className="w-3 h-3" />
                            </NavLink>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
