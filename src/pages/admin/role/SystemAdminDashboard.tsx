import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users, ShieldCheck, ClipboardList, AlertTriangle, BarChart3,
    ArrowRight, Loader2, Inbox, RefreshCw, Settings, Database,
    UserCog, Activity
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';

const DEPT_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const TT = { contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 } };

interface StudentRaw { id: string; currentYear?: number; }
interface AdminUserRaw { id: string; name?: string; email?: string; role?: string; status?: string; }
interface AuditLogRaw {
    id: string; action?: string; summary?: string; actorEmail?: string;
    severity?: string; module?: string;
    timestamp?: { seconds: number } | string;
}

const KpiCard: React.FC<{ title: string; value: string | number; subtitle: string; icon: React.ElementType; colorClass: string; loading: boolean }> = ({ title, value, subtitle, icon: Icon, colorClass, loading }) => (
    <div className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wide">{title}</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}><Icon className="w-5 h-5" /></div>
        </div>
        {loading ? <div className="h-8 w-20 bg-secondary animate-pulse rounded" /> : <p className="text-3xl font-black text-slate-800">{value}</p>}
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
);

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; linkTo?: string; linkLabel?: string }> = ({ icon: Icon, title, linkTo, linkLabel }) => (
    <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Icon className="w-5 h-5 text-primary" />{title}</h3>
        {linkTo && <NavLink to={linkTo} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">{linkLabel || 'View all'} <ArrowRight className="w-4 h-4" /></NavLink>}
    </div>
);

const severityColor = (s?: string) => {
    const sv = (s || '').toLowerCase();
    if (sv === 'critical') return 'text-rose-700 bg-rose-100';
    if (sv === 'high') return 'text-orange-400 bg-orange-500/10';
    if (sv === 'medium') return 'text-amber-700 bg-amber-100';
    return 'text-blue-700 bg-blue-100';
};

const relativeTime = (ts: { seconds: number } | string | undefined): string => {
    if (!ts) return 'Unknown';
    const d = typeof ts === 'object' && 'seconds' in ts ? new Date(ts.seconds * 1000) : new Date(ts as string);
    if (isNaN(d.getTime())) return 'Unknown';
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

export const SystemAdminDashboard: React.FC = () => {
    const [students, setStudents] = useState<StudentRaw[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminUserRaw[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogRaw[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    const fetchData = async () => {
        setIsLoading(true);
        const results = await Promise.allSettled([
            getDocs(query(collection(db, 'students'), orderBy('name'))),
            getDocs(collection(db, 'adminUsers')),
            getDocs(query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50))),
        ]);
        if (results[0].status === 'fulfilled') setStudents(results[0].value.docs.map(d => ({ id: d.id, ...d.data() } as StudentRaw)));
        if (results[1].status === 'fulfilled') setAdminUsers(results[1].value.docs.map(d => ({ id: d.id, ...d.data() } as AdminUserRaw)));
        if (results[2].status === 'fulfilled') setAuditLogs(results[2].value.docs.map(d => ({ id: d.id, ...d.data() } as AuditLogRaw)));
        setLastRefreshed(new Date());
        setIsLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const kpis = useMemo(() => {
        const totalUsers = students.length + adminUsers.length;
        const criticalEvents = auditLogs.filter(l => (l.severity || '').toLowerCase() === 'critical').length;
        return { totalUsers, adminCount: adminUsers.length, auditCount: auditLogs.length, criticalEvents };
    }, [students, adminUsers, auditLogs]);

    const adminRoleData = useMemo(() => {
        const map: Record<string, number> = {};
        adminUsers.forEach(u => { const r = u.role || 'Unknown'; map[r] = (map[r] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [adminUsers]);

    const yearDistData = useMemo(() => {
        const map: Record<string, number> = {};
        students.forEach(s => { const yr = `Year ${s.currentYear || '?'}`; map[yr] = (map[yr] || 0) + 1; });
        return Object.entries(map).map(([year, count]) => ({ year, count })).sort((a, b) => a.year.localeCompare(b.year));
    }, [students]);

    return (
        <div className="space-y-6 pb-10 animate-fade-in-up">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1"><WelcomeCard /></div>
                <button onClick={fetchData} disabled={isLoading}
                    className="mt-1 flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-secondary transition-all disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            <div>
                <h3 className="text-base font-semibold mb-3 text-foreground">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Users', icon: Users, path: '/admin/users', color: 'text-blue-700 bg-blue-100' },
                        { label: 'Settings', icon: Settings, path: '/admin/settings', color: 'text-violet-700 bg-violet-100' },
                        { label: 'Audit Logs', icon: ClipboardList, path: '/admin/audit-logs', color: 'text-emerald-700 bg-emerald-100' },
                        { label: 'Database Tools', icon: Database, path: '/admin/database-tools', color: 'text-amber-700 bg-amber-100' },
                    ].map((a, i) => (
                        <NavLink key={i} to={a.path} className="flex flex-col items-center justify-center p-4 card-nmims hover:bg-secondary/50 hover:border-primary/30 transition-all group text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${a.color}`}><a.icon className="w-5 h-5" /></div>
                            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{a.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Users" value={kpis.totalUsers} subtitle="Students + admins" icon={Users} colorClass="text-violet-700 bg-violet-100 border-violet-200" loading={isLoading} />
                <KpiCard title="Admin Accounts" value={kpis.adminCount} subtitle="Platform administrators" icon={ShieldCheck} colorClass="text-blue-700 bg-blue-100 border-blue-200" loading={isLoading} />
                <KpiCard title="Audit Events" value={kpis.auditCount} subtitle="Total logged events" icon={ClipboardList} colorClass="text-emerald-700 bg-emerald-100 border-emerald-200" loading={isLoading} />
                <KpiCard title="Critical Events" value={kpis.criticalEvents} subtitle="Require attention" icon={AlertTriangle} colorClass="text-rose-700 bg-rose-100 border-rose-200" loading={isLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-nmims p-6">
                    <SectionHeader icon={UserCog} title="Admin Role Distribution" />
                    {isLoading ? <div className="h-52 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : adminRoleData.length === 0 ? <div className="h-52 flex flex-col items-center justify-center text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No admin data</p></div>
                        : <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={adminRoleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {adminRoleData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                                </Pie>
                                <Tooltip {...TT} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>}
                </div>
                <div className="card-nmims p-6">
                    <SectionHeader icon={BarChart3} title="Student Year Distribution" />
                    {isLoading ? <div className="h-52 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : yearDistData.length === 0 ? <div className="h-52 flex flex-col items-center justify-center text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No student data</p></div>
                        : <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={yearDistData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                <Tooltip {...TT} />
                                <Bar dataKey="count" name="Students" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card-nmims p-6 lg:col-span-2">
                    <SectionHeader icon={ClipboardList} title="Recent Audit Events" linkTo="/admin/audit-logs" />
                    {isLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-secondary animate-pulse rounded-xl" />)}</div>
                        : auditLogs.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No audit events</p></div>
                        : <div className="space-y-2">
                            {auditLogs.slice(0, 8).map((log, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 mt-0.5 ${severityColor(log.severity)}`}>{log.severity || 'low'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{log.summary || log.action || 'Event'}</p>
                                        <p className="text-xs text-muted-foreground">{log.actorEmail || 'System'} · {log.module || 'Platform'}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">{relativeTime(log.timestamp)}</span>
                                </div>
                            ))}
                        </div>}
                </div>
                <div className="card-nmims p-6">
                    <SectionHeader icon={UserCog} title="Admin Users" linkTo="/admin/users" />
                    {isLoading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-secondary animate-pulse rounded-xl" />)}</div>
                        : adminUsers.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No admin users</p></div>
                        : <div className="space-y-2">
                            {adminUsers.slice(0, 8).map((u, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-primary">{(u.name || 'A').charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{u.name || 'Admin'}</p>
                                        <p className="text-xs text-muted-foreground truncate">{u.role || 'admin'}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${u.status === 'active' ? 'text-emerald-700 bg-emerald-100' : 'text-muted-foreground bg-secondary'}`}>{u.status || 'active'}</span>
                                </div>
                            ))}
                        </div>}
                </div>
            </div>

            <div className="card-nmims p-6">
                <SectionHeader icon={Activity} title="Platform Controls" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'User Management', desc: 'Manage all platform users', icon: Users, path: '/admin/users', color: 'text-blue-700 bg-blue-100 border-blue-200' },
                        { label: 'System Settings', desc: 'Configure platform settings', icon: Settings, path: '/admin/settings', color: 'text-violet-700 bg-violet-100 border-violet-200' },
                        { label: 'Audit Logs', desc: 'View all system events', icon: ClipboardList, path: '/admin/audit-logs', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
                        { label: 'Database Tools', desc: 'Manage data & backups', icon: Database, path: '/admin/database-tools', color: 'text-amber-700 bg-amber-100 border-amber-200' },
                    ].map((ctrl, i) => (
                        <NavLink key={i} to={ctrl.path} className={`p-4 rounded-xl border card-nmims hover:bg-secondary/50 transition-all group ${ctrl.color}`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${ctrl.color}`}>
                                <ctrl.icon className="w-5 h-5" />
                            </div>
                            <p className="font-semibold text-foreground text-sm">{ctrl.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{ctrl.desc}</p>
                        </NavLink>
                    ))}
                </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">Last refreshed: {lastRefreshed.toLocaleTimeString()}</p>
        </div>
    );
};
