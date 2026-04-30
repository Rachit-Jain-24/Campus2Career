import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Building2, Briefcase, Clock, ArrowRight, Loader2, RefreshCw,
    Target, FilePlus, Search, UserCheck, TrendingUp, Layers, Activity,
    Inbox, BarChart3
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    AreaChart, Area
} from 'recharts';
import { 
    drivesDb, companiesDb, interviewsDb, offersDb 
} from '../../../services/db/database.service';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';
import { DriveFormModal } from '../../../components/admin/drives/DriveFormModal';
import { drivesService } from '../../../services/admin/drives.service';
import type { DriveFormData } from '../../../types/driveAdmin';

const DEPT_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const TT = { contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 } };

interface DriveRaw { id: string; title?: string; companyName?: string; status?: string; applicantCount?: number; shortlistedCount?: number; }
interface CompanyRaw { id: string; name?: string; industry?: string; status?: string; }
interface InterviewRaw { id: string; companyName?: string; roundType?: string; scheduledDate?: any; status?: string; }
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
    const navigate = useNavigate();
    const [drives, setDrives] = useState<DriveRaw[]>([]);
    const [companies, setCompanies] = useState<CompanyRaw[]>([]);
    const [interviews, setInterviews] = useState<InterviewRaw[]>([]);
    const [offers, setOffers] = useState<OfferRaw[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const [showNewDriveModal, setShowNewDriveModal] = useState(false);
    const [isSavingDrive, setIsSavingDrive] = useState(false);

    const fetchData = async () => {
        try {
            const [compRes, intRes] = await Promise.allSettled([
                companiesDb.fetchAllCompanies(),
                interviewsDb.getAllInterviews(),
            ]);
            if (compRes.status === 'fulfilled') setCompanies(compRes.value.map(d => ({ ...d, name: (d as any).companyName || (d as any).name }) as CompanyRaw));
            if (intRes.status === 'fulfilled') setInterviews(intRes.value.map(d => ({ ...d }) as InterviewRaw));
            setLastRefreshed(new Date());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    useEffect(() => {
        fetchData(); // Initial manual fetch

        // Real-time Subscriptions

        // Real-time Subscriptions
        const unsubDrives = drivesDb.onDrivesChange((d) => {
            setDrives(d as any as DriveRaw[]);
            setIsLoading(false);
        });

        const unsubOffers = offersDb.onOffersChange((o) => {
            setOffers(o as any as OfferRaw[]);
        });

        return () => {
            unsubDrives();
            unsubOffers();
        };
    }, []);

    const handleSaveDrive = async (data: DriveFormData) => {
        setIsSavingDrive(true);
        try {
            await drivesService.createDrive(data);
            setShowNewDriveModal(false);
            fetchData();
        } catch (err) {
            console.error('Failed to create drive:', err);
        } finally {
            setIsSavingDrive(false);
        }
    };

    const todayStr = new Date().toDateString();

    const kpis = useMemo(() => {
        const activeDrives = drives.filter(d => ['active', 'open', 'ongoing', 'upcoming'].includes((d.status || '').toLowerCase())).length;
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

            {/* Drive Operations Center */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-nmims p-6 border-l-4 border-l-blue-500/50">
                    <SectionHeader icon={Layers} title="Recruitment Pipeline" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="h-48">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { stage: 'Applicants', count: drives.reduce((a, b) => a + (b.applicantCount || 0), 0) },
                                    { stage: 'Shortlisted', count: drives.reduce((a, b) => a + (b.shortlistedCount || 0), 0) },
                                    { stage: 'Offers', count: offers.length },
                                ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip {...TT} />
                                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                             </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col justify-center space-y-3">
                             {[
                                { label: 'Total Applicants', count: drives.reduce((a, b) => a + (b.applicantCount || 0), 0), icon: Search, color: 'text-blue-600' },
                                { label: 'Shortlisted', count: drives.reduce((a, b) => a + (b.shortlistedCount || 0), 0), icon: UserCheck, color: 'text-purple-600' },
                                { label: 'Placed', count: offers.filter(o => o.status?.toLowerCase() === 'accepted').length, icon: TrendingUp, color: 'text-emerald-600' },
                             ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-white shadow-sm">
                                            <item.icon className={`w-4 h-4 ${item.color}`} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-800">{item.count}</span>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>

                <div className="card-nmims p-6 border-l-4 border-l-primary/50 relative overflow-hidden">
                    <div className="absolute top-[-10px] right-[-10px] opacity-[0.05]">
                         <FilePlus className="w-24 h-24" />
                    </div>
                    <SectionHeader icon={FilePlus} title="Placement Hub" />
                    <div className="grid grid-cols-1 gap-2.5 mt-4 relative">
                        {/* Post New Job Drive — opens modal directly */}
                        <button
                            onClick={() => setShowNewDriveModal(true)}
                            className="flex items-center gap-3 p-3.5 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-secondary/50 transition-all group bg-white/50 backdrop-blur-sm w-full text-left"
                        >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-700">
                                <FilePlus className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Post New Job Drive</span>
                            <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </button>
                        {/* Review Applications — goes to drives page */}
                        <NavLink to="/placement/drives" className="flex items-center gap-3 p-3.5 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-secondary/50 transition-all group bg-white/50 backdrop-blur-sm">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-700">
                                <Search className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Review Applications</span>
                            <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </NavLink>
                        {/* Verify Offer Letters — goes to offers page */}
                        <NavLink to="/placement/offers" className="flex items-center gap-3 p-3.5 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-secondary/50 transition-all group bg-white/50 backdrop-blur-sm">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 text-amber-700">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Verify Offer Letters</span>
                            <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </NavLink>
                    </div>
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
                                <Pie data={driveStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
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

            {/* New Drive Modal */}
            <DriveFormModal
                isOpen={showNewDriveModal}
                onClose={() => setShowNewDriveModal(false)}
                onSave={handleSaveDrive}
                isSaving={isSavingDrive}
            />
        </div>
    );
};
