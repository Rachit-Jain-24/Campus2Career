import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Building2, TrendingUp, Briefcase, Users, BarChart3, Target,
    ArrowRight, Loader2, Inbox, RefreshCw, GraduationCap,
    FileText, ClipboardList, Activity, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';

const CHART_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2'];
const TT_STYLE = { contentStyle: { background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', color: 'var(--color-foreground)' }, labelStyle: { color: 'var(--color-foreground)' } };

interface StudentRaw { id: string; placementStatus?: string; }
interface DriveRaw { id: string; title?: string; companyName?: string; status?: string; applicantCount?: number; shortlistedCount?: number; interviewedCount?: number; offeredCount?: number; ctcOffered?: number; }
interface CompanyRaw { id: string; name?: string; industry?: string; status?: string; }
interface OfferRaw { id: string; ctc?: number; packageLPA?: number; status?: string; createdAt?: { seconds: number } | string; }

const KpiCard: React.FC<{ title: string; value: string | number; subtitle: string; icon: React.ElementType; accent: string; loading: boolean }> = ({ title, value, subtitle, icon: Icon, accent, loading }) => (
    <div className="card-nmims p-5">
        <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wide">{title}</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}><Icon className="w-4 h-4" /></div>
        </div>
        {loading ? <div className="h-8 w-24 bg-secondary animate-pulse rounded-lg" /> : <p className="text-3xl font-black text-slate-800">{value}</p>}
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
);

const SectionTitle: React.FC<{ icon: React.ElementType; title: string; to?: string; toLabel?: string }> = ({ icon: Icon, title, to, toLabel }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-base"><Icon className="w-4 h-4 text-primary" />{title}</h3>
        {to && <NavLink to={to} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium">{toLabel || 'View all'}<ArrowRight className="w-3 h-3" /></NavLink>}
    </div>
);

const driveStatusBadge = (s?: string) => {
    const st = (s || '').toLowerCase();
    if (['registration_open', 'active', 'open', 'ongoing'].includes(st)) return { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    if (st === 'upcoming') return { cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock };
    if (['completed', 'closed'].includes(st)) return { cls: 'bg-secondary text-muted-foreground border-border', icon: CheckCircle2 };
    return { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
};

export const DirectorDashboard: React.FC = () => {
    const [students, setStudents] = useState<StudentRaw[]>([]);
    const [drives, setDrives] = useState<DriveRaw[]>([]);
    const [companies, setCompanies] = useState<CompanyRaw[]>([]);
    const [offers, setOffers] = useState<OfferRaw[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    const fetchData = async () => {
        setIsLoading(true);
        const [s, d, c, o] = await Promise.allSettled([
            getDocs(query(collection(db, 'students'), orderBy('name'))),
            getDocs(collection(db, 'drives')),
            getDocs(collection(db, 'companies')),
            getDocs(collection(db, 'offers')),
        ]);
        if (s.status === 'fulfilled') setStudents(s.value.docs.map(d => ({ id: d.id, ...d.data() } as StudentRaw)));
        if (d.status === 'fulfilled') setDrives(d.value.docs.map(d => ({ id: d.id, ...d.data() } as DriveRaw)));
        if (c.status === 'fulfilled') setCompanies(c.value.docs.map(d => ({ id: d.id, ...d.data() } as CompanyRaw)));
        if (o.status === 'fulfilled') setOffers(o.value.docs.map(d => ({ id: d.id, ...d.data() } as OfferRaw)));
        setLastRefreshed(new Date());
        setIsLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const kpis = useMemo(() => {
        const activeDrives = drives.filter(d => ['registration_open', 'active', 'open', 'ongoing'].includes((d.status || '').toLowerCase())).length;
        const placed = students.filter(s => s.placementStatus === 'placed').length;
        const rate = students.length > 0 ? ((placed / students.length) * 100).toFixed(1) : '0';
        return { activeDrives, companies: companies.length, offers: offers.length, rate };
    }, [students, drives, companies, offers]);

    const driveStatusData = useMemo(() => {
        const map: Record<string, number> = {};
        drives.forEach(d => { const s = d.status || 'Unknown'; map[s] = (map[s] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [drives]);

    const monthlyOffers = useMemo(() => {
        const map: Record<string, number> = {};
        offers.forEach(o => {
            let month = 'Unknown';
            if (o.createdAt) {
                const ts = typeof o.createdAt === 'object' && 'seconds' in o.createdAt
                    ? new Date((o.createdAt as { seconds: number }).seconds * 1000)
                    : new Date(o.createdAt as string);
                if (!isNaN(ts.getTime())) month = ts.toLocaleString('default', { month: 'short', year: '2-digit' });
            }
            map[month] = (map[month] || 0) + 1;
        });
        return Object.entries(map).filter(([k]) => k !== 'Unknown').map(([month, count]) => ({ month, count })).slice(-8);
    }, [offers]);

    const funnel = useMemo(() => {
        const total = students.length;
        const eligible = students.filter(s => s.placementStatus === 'eligible' || s.placementStatus === 'placed').length;
        const placed = students.filter(s => s.placementStatus === 'placed').length;
        return [
            { label: 'Total Students', value: total, pct: 100, color: '#2563eb' },
            { label: 'Eligible', value: eligible, pct: total > 0 ? (eligible / total) * 100 : 0, color: '#7c3aed' },
            { label: 'Placed', value: placed, pct: total > 0 ? (placed / total) * 100 : 0, color: '#16a34a' },
        ];
    }, [students]);

    return (
        <div className="space-y-6 pb-10 animate-fade-in-up">
            <div className="flex items-start gap-4">
                <div className="flex-1"><WelcomeCard /></div>
                <button onClick={fetchData} disabled={isLoading}
                    className="mt-1 flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-secondary transition-all disabled:opacity-50 flex-shrink-0">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Students', icon: GraduationCap, path: '/director/students', accent: 'bg-blue-100 text-blue-700' },
                    { label: 'Batch Analytics', icon: BarChart3, path: '/director/batch-analytics', accent: 'bg-purple-100 text-purple-700' },
                    { label: 'Reports', icon: FileText, path: '/director/reports', accent: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Audit Logs', icon: ClipboardList, path: '/director/audit-logs', accent: 'bg-amber-100 text-amber-700' },
                ].map((a, i) => (
                    <NavLink key={i} to={a.path} className="card-nmims flex flex-col items-center justify-center p-4 hover:border-primary/30 transition-all group text-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${a.accent}`}><a.icon className="w-5 h-5" /></div>
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{a.label}</span>
                    </NavLink>
                ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Active Drives" value={kpis.activeDrives} subtitle="Currently running" icon={Activity} accent="bg-emerald-100 text-emerald-700" loading={isLoading} />
                <KpiCard title="Total Companies" value={kpis.companies} subtitle="Onboarded partners" icon={Building2} accent="bg-blue-100 text-blue-700" loading={isLoading} />
                <KpiCard title="Total Offers" value={kpis.offers} subtitle="Offers issued" icon={Briefcase} accent="bg-amber-100 text-amber-700" loading={isLoading} />
                <KpiCard title="Placement Rate" value={`${kpis.rate}%`} subtitle="Students placed" icon={TrendingUp} accent="bg-purple-100 text-purple-700" loading={isLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-nmims p-6">
                    <SectionTitle icon={Target} title="Drive Status Breakdown" />
                    {isLoading ? <div className="h-56 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : driveStatusData.length === 0 ? <div className="h-56 flex flex-col items-center justify-center text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No drives yet. Seed admin data first.</p></div>
                        : <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={driveStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {driveStatusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                </Pie>
                                <Tooltip {...TT_STYLE} />
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>}
                </div>

                <div className="card-nmims p-6">
                    <SectionTitle icon={BarChart3} title="Monthly Offers" />
                    {isLoading ? <div className="h-56 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : monthlyOffers.length === 0 ? <div className="h-56 flex flex-col items-center justify-center text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No offer data yet</p></div>
                        : <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={monthlyOffers} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                                <Tooltip {...TT_STYLE} />
                                <Bar dataKey="count" name="Offers" fill="#16a34a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card-nmims p-6 lg:col-span-2">
                    <SectionTitle icon={Activity} title="Drive Pipeline" to="/director/drives" toLabel="All drives" />
                    {isLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-secondary animate-pulse rounded-xl" />)}</div>
                        : drives.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No drives yet. Seed admin data first.</p></div>
                        : <div className="space-y-2">
                            {drives.slice(0, 8).map((d, i) => {
                                const badge = driveStatusBadge(d.status);
                                const StatusIcon = badge.icon;
                                return (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors border border-border/50">
                                        <StatusIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{d.title || 'Untitled Drive'}</p>
                                            <p className="text-xs text-muted-foreground">{d.companyName || '—'} · {d.applicantCount ?? 0} applicants · {d.shortlistedCount ?? 0} shortlisted</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${badge.cls}`}>{d.status || 'Unknown'}</span>
                                            {d.ctcOffered && <p className="text-xs text-muted-foreground mt-0.5">₹{d.ctcOffered} LPA</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>}
                </div>

                <div className="card-nmims p-6">
                    <SectionTitle icon={Users} title="Placement Funnel" />
                    <div className="space-y-5 mt-2">
                        {funnel.map((f, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-muted-foreground font-medium">{f.label}</span>
                                    <span className="font-bold text-foreground">{isLoading ? '…' : f.value}</span>
                                </div>
                                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${f.pct}%`, background: f.color }} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 text-right">{f.pct.toFixed(0)}%</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border">
                        <SectionTitle icon={Building2} title="Companies" to="/director/companies" toLabel="View all" />
                        {isLoading ? <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-secondary animate-pulse rounded-lg" />)}</div>
                            : companies.slice(0, 5).map((c, i) => (
                                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                                    <span className="text-sm font-medium text-foreground truncate">{c.name || 'Unknown'}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-secondary text-muted-foreground border border-border'}`}>{c.status || 'N/A'}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">Last refreshed: {lastRefreshed.toLocaleTimeString()}</p>
        </div>
    );
};
