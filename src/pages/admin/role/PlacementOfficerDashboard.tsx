import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Building2, Briefcase, Calendar, Clock, BarChart3, Target,
    ArrowRight, Loader2, Inbox, RefreshCw, Activity
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';

const DEPT_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const TT = { contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 } };

interface DriveRaw { id: string; title?: string; companyName?: string; status?: string; applicantCount?: number; shortlistedCount?: number; }
interface CompanyRaw { id: string; name?: string; industry?: string; status?: string; }
interface InterviewRaw { id: string; companyName?: string; roundType?: string; scheduledDate?: string | { seconds: number }; status?: string; }
interface OfferRaw { id: string; studentName?: string; companyName?: string; ctc?: number; packageLPA?: number; status?: string; role?: string; }

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

const driveStatusColor = (s?: string) => {
    const st = (s || '').toLowerCase();
    if (['active', 'open', 'ongoing'].includes(st)) return 'text-emerald-700 bg-emerald-100';
    if (st === 'pending') return 'text-amber-700 bg-amber-100';
    if (['completed', 'closed'].includes(st)) return 'text-blue-700 bg-blue-100';
    return 'text-muted-foreground bg-secondary';
};

const offerStatusColor = (s?: string) => {
    const st = (s || '').toLowerCase();
    if (st === 'accepted') return 'text-emerald-700 bg-emerald-100';
    if (st === 'pending' || st === 'issued') return 'text-amber-700 bg-amber-100';
    if (st === 'rejected') return 'text-rose-700 bg-rose-100';
    return 'text-muted-foreground bg-secondary';
};

export const PlacementOfficerDashboard: React.FC = () => {
    const [drives, setDrives] = useState<DriveRaw[]>([]);
    const [companies, setCompanies] = useState<CompanyRaw[]>([]);
    const [interviews, setInterviews] = useState<InterviewRaw[]>([]);
    const [offers, setOffers] = useState<OfferRaw[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    const fetchData = async () => {
        setIsLoading(true);
        const results = await Promise.allSettled([
            getDocs(collection(db, 'drives')),
            getDocs(collection(db, 'companies')),
            getDocs(collection(db, 'interviews')),
            getDocs(collection(db, 'offers')),
        ]);
        if (results[0].status === 'fulfilled') setDrives(results[0].value.docs.map(d => ({ id: d.id, ...d.data() } as DriveRaw)));
        if (results[1].status === 'fulfilled') setCompanies(results[1].value.docs.map(d => ({ id: d.id, ...d.data() } as CompanyRaw)));
        if (results[2].status === 'fulfilled') setInterviews(results[2].value.docs.map(d => ({ id: d.id, ...d.data() } as InterviewRaw)));
        if (results[3].status === 'fulfilled') setOffers(results[3].value.docs.map(d => ({ id: d.id, ...d.data() } as OfferRaw)));
        setLastRefreshed(new Date());
        setIsLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const todayStr = new Date().toDateString();

    const kpis = useMemo(() => {
        const activeDrives = drives.filter(d => ['active', 'open', 'ongoing'].includes((d.status || '').toLowerCase())).length;
        const todayInterviews = interviews.filter(iv => {
            if (!iv.scheduledDate) return false;
            const d = typeof iv.scheduledDate === 'object' && 'seconds' in iv.scheduledDate
                ? new Date((iv.scheduledDate as { seconds: number }).seconds * 1000)
                : new Date(iv.scheduledDate as string);
            return !isNaN(d.getTime()) && d.toDateString() === todayStr;
        }).length;
        const pendingOffers = offers.filter(o => ['pending', 'issued'].includes((o.status || '').toLowerCase())).length;
        return { activeDrives, companies: companies.length, todayInterviews, pendingOffers };
    }, [drives, companies, interviews, offers, todayStr]);

    const driveStatusData = useMemo(() => {
        const map: Record<string, number> = {};
        drives.forEach(d => { const s = d.status || 'Unknown'; map[s] = (map[s] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [drives]);

    const offerStatusData = useMemo(() => {
        const map: Record<string, number> = {};
        offers.forEach(o => { const s = o.status || 'Unknown'; map[s] = (map[s] || 0) + 1; });
        return Object.entries(map).map(([status, count]) => ({ status, count }));
    }, [offers]);

    const todaySchedule = useMemo(() =>
        interviews.filter(iv => {
            if (!iv.scheduledDate) return false;
            const d = typeof iv.scheduledDate === 'object' && 'seconds' in iv.scheduledDate
                ? new Date((iv.scheduledDate as { seconds: number }).seconds * 1000)
                : new Date(iv.scheduledDate as string);
            return !isNaN(d.getTime()) && d.toDateString() === todayStr;
        }),
        [interviews, todayStr]
    );

    const formatTime = (d: string | { seconds: number } | undefined) => {
        if (!d) return 'TBD';
        const dt = typeof d === 'object' && 'seconds' in d ? new Date(d.seconds * 1000) : new Date(d as string);
        return isNaN(dt.getTime()) ? 'TBD' : dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

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
                        { label: 'Companies', icon: Building2, path: '/placement/companies', color: 'text-blue-700 bg-blue-100' },
                        { label: 'Drives', icon: Activity, path: '/placement/drives', color: 'text-violet-700 bg-violet-100' },
                        { label: 'Interviews', icon: Calendar, path: '/placement/interviews', color: 'text-emerald-700 bg-emerald-100' },
                        { label: 'Offers', icon: Briefcase, path: '/placement/offers', color: 'text-amber-700 bg-amber-100' },
                    ].map((a, i) => (
                        <NavLink key={i} to={a.path} className="flex flex-col items-center justify-center p-4 card-nmims hover:bg-secondary/50 hover:border-primary/30 transition-all group text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${a.color}`}><a.icon className="w-5 h-5" /></div>
                            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{a.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Active Drives" value={kpis.activeDrives} subtitle="Currently running" icon={Activity} colorClass="text-emerald-700 bg-emerald-100 border-emerald-200" loading={isLoading} />
                <KpiCard title="Total Companies" value={kpis.companies} subtitle="Onboarded" icon={Building2} colorClass="text-blue-700 bg-blue-100 border-blue-200" loading={isLoading} />
                <KpiCard title="Today's Interviews" value={kpis.todayInterviews} subtitle="Scheduled today" icon={Clock} colorClass="text-amber-700 bg-amber-100 border-amber-200" loading={isLoading} />
                <KpiCard title="Pending Offers" value={kpis.pendingOffers} subtitle="Awaiting response" icon={Briefcase} colorClass="text-rose-700 bg-rose-100 border-rose-200" loading={isLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-nmims p-6">
                    <SectionHeader icon={Target} title="Drive Status" />
                    {isLoading ? <div className="h-52 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : driveStatusData.length === 0 ? <div className="h-52 flex flex-col items-center justify-center text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No drives</p></div>
                        : <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={driveStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {driveStatusData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                                </Pie>
                                <Tooltip {...TT} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>}
                </div>
                <div className="card-nmims p-6">
                    <SectionHeader icon={BarChart3} title="Offer Status Breakdown" />
                    {isLoading ? <div className="h-52 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : offerStatusData.length === 0 ? <div className="h-52 flex flex-col items-center justify-center text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No offers</p></div>
                        : <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={offerStatusData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                <Tooltip {...TT} />
                                <Bar dataKey="count" name="Offers" radius={[4, 4, 0, 0]}>
                                    {offerStatusData.map((entry, i) => {
                                        const st = (entry.status || '').toLowerCase();
                                        const fill = st === 'accepted' ? '#10b981' : st === 'rejected' ? '#ef4444' : '#f59e0b';
                                        return <Cell key={i} fill={fill} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card-nmims p-6 lg:col-span-2">
                    <SectionHeader icon={Activity} title="Drive Pipeline" linkTo="/placement/drives" />
                    {isLoading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-secondary animate-pulse rounded-lg" />)}</div>
                        : drives.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No drives</p></div>
                        : <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-border">
                                    <th className="text-left py-2 text-xs text-muted-foreground font-semibold">Drive</th>
                                    <th className="text-right py-2 text-xs text-muted-foreground font-semibold">Applicants</th>
                                    <th className="text-right py-2 text-xs text-muted-foreground font-semibold">Shortlisted</th>
                                    <th className="text-right py-2 text-xs text-muted-foreground font-semibold">Status</th>
                                </tr></thead>
                                <tbody>
                                    {drives.slice(0, 6).map((d, i) => (
                                        <tr key={i} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                                            <td className="py-2.5">
                                                <p className="font-medium text-foreground truncate max-w-[160px]">{d.title || 'Untitled'}</p>
                                                <p className="text-xs text-muted-foreground">{d.companyName || '—'}</p>
                                            </td>
                                            <td className="py-2.5 text-right text-muted-foreground">{d.applicantCount ?? 0}</td>
                                            <td className="py-2.5 text-right text-emerald-600 font-medium">{d.shortlistedCount ?? 0}</td>
                                            <td className="py-2.5 text-right"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${driveStatusColor(d.status)}`}>{d.status || 'Unknown'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>}
                </div>
                <div className="card-nmims p-6">
                    <SectionHeader icon={Clock} title="Today's Schedule" linkTo="/placement/interviews" />
                    {isLoading ? <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-secondary animate-pulse rounded-xl" />)}</div>
                        : todaySchedule.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No interviews today</p></div>
                        : <div className="space-y-2">
                            {todaySchedule.map((iv, i) => (
                                <div key={i} className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors">
                                    <p className="font-medium text-foreground text-sm">{iv.companyName || 'Company'}</p>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-muted-foreground">{iv.roundType || 'Round'}</span>
                                        <span className="text-xs text-primary font-medium">{formatTime(iv.scheduledDate)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>}
                </div>
            </div>

            <div className="card-nmims p-6">
                <SectionHeader icon={Briefcase} title="Recent Offers" linkTo="/placement/offers" />
                {isLoading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-secondary animate-pulse rounded-xl" />)}</div>
                    : offers.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No offers yet</p></div>
                    : <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border">
                                <th className="text-left py-2 text-xs text-muted-foreground font-semibold">Student</th>
                                <th className="text-left py-2 text-xs text-muted-foreground font-semibold">Company</th>
                                <th className="text-right py-2 text-xs text-muted-foreground font-semibold">CTC</th>
                                <th className="text-right py-2 text-xs text-muted-foreground font-semibold">Status</th>
                            </tr></thead>
                            <tbody>
                                {offers.slice(0, 8).map((o, i) => (
                                    <tr key={i} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                                        <td className="py-2.5 font-medium text-foreground">{o.studentName || 'Student'}</td>
                                        <td className="py-2.5 text-muted-foreground">{o.companyName || '—'}</td>
                                        <td className="py-2.5 text-right font-semibold text-foreground">₹{o.ctc || o.packageLPA || 0} LPA</td>
                                        <td className="py-2.5 text-right"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${offerStatusColor(o.status)}`}>{o.status || 'Pending'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
            </div>

            <p className="text-xs text-muted-foreground text-center">Last refreshed: {lastRefreshed.toLocaleTimeString()}</p>
        </div>
    );
};
