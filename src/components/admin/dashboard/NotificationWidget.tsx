import React from 'react';
import { Bell, Clock, ChevronRight, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../../hooks/useNotifications';
import { NavLink } from 'react-router-dom';

export const NotificationWidget: React.FC = () => {
    const { notifications, unreadCount, markAllRead } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'new_drive': return <Bell className="w-4 h-4 text-primary" />;
            case 'application_received': return <Info className="w-4 h-4 text-blue-400" />;
            case 'application_status': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            default: return <AlertCircle className="w-4 h-4 text-amber-400" />;
        }
    };

    return (
        <div className="card-nmims h-full flex flex-col bg-card border-border/50">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" /> Recent Alerts
                    {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-[10px] text-white animate-pulse">{unreadCount}</span>}
                </h3>
                {unreadCount > 0 && (
                    <button 
                        onClick={markAllRead}
                        className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                    >
                        Mark All Read
                    </button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/30">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                        <Bell className="h-8 w-8 opacity-20 mb-2" />
                        <p className="text-xs font-medium">No recent notifications</p>
                    </div>
                ) : (
                    notifications.map((note) => (
                        <div key={note.id} className={`p-4 hover:bg-secondary/30 transition-all ${!note.read ? 'bg-primary/5' : ''}`}>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getIcon(note.type)}</div>
                                <div className="flex-1">
                                    <p className={`text-xs leading-relaxed ${!note.read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                        {note.msg}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[10px] font-bold text-muted-foreground">{note.time}</span>
                                    </div>
                                </div>
                                {!note.read && <div className="h-2 w-2 rounded-full bg-primary mt-1 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 border-t border-border/50 bg-secondary/10">
                <NavLink to="/admin/notifications" className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 hover:text-primary transition-all">
                    VIEW ALL NOTIFICATIONS <ChevronRight className="h-3 w-3" />
                </NavLink>
            </div>
        </div>
    );
};
