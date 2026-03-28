import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users, TrendingUp, Building2, Award, BarChart3, Briefcase,
    ArrowRight, Loader2, Inbox, RefreshCw, GraduationCap,
    FileText, ClipboardList, ShieldCheck, IndianRupee
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    collection, getDocs, query, orderBy, doc, getDoc, 
    addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';
import { Megaphone, BarChart as BarChartIcon, Send, Goal } from 'lucide-react';

const parseCgpa = (v: string | number | undefined): number => {
    if (!v) return 0;
    const n = typeof v === 'number' ? v : parseFloat(v as string);
    return isNaN(n) ? 0 : n;
};

const CHART_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2'];
const TT_STYLE = { contentStyle: { background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', color: 'var(--color-foreground)' }, labelStyle: { color: 'var(--color-foreground)' } };

interface StudentRaw { id: string; name: string; branch: string; currentYear: number; cgpa: string | number; placementStatus?: string; }
interface OfferRaw { id: string; studentName: string; companyName: string; ctc?: number; packageLPA?: number; status?: string; role?: string; }
interface CompanyRaw { id: string; name: string; industry?: string; status?: string; }
interface AdminUserRaw { id: string; name: string; role: string; status?: string; }

const KpiCard: React.FC<{ title: string; value: string | number; subtitle: string; icon: React.ElementType; accent: string; loading: boolean }> = ({ title, value, subtitle, icon: Icon, accent, loading }) => (
    <div className="card-nmims p-5 h-full">
        <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wide">{title}</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
                <Icon className="w-4 h-4" />
            </div>
        </div>
        {loading ? <div className="h-8 w-24 bg-secondary animate-pulse rounded-lg" /> : <p className="text-3xl font-black text-slate-800">{value}</p>}
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
);

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; to?: string; toLabel?: string }> = ({ icon: Icon, title, to, toLabel }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
            <Icon className="w-4 h-4 text-primary" />{title}
        </h3>
        {to && <NavLink to={to} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium">{toLabel || 'View all'}<ArrowRight className="w-3 h-3" /></NavLink>}
    </div>
);

export const DeanDashboard: React.FC = () => {
    const [students, setStudents] = useState<StudentRaw[]>([]);
    const [offers, setOffers] = useState<OfferRaw[]>([]);
    const [companies, setCompanies] = useState<CompanyRaw[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminUserRaw[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    const fetchData = async () => {
        setIsLoading(true);
        const [s, o, c, a, conf] = await Promise.allSettled([
            getDocs(query(collection(db, 'students'), orderBy('name'))),
            getDocs(collection(db, 'offers')),
            getDocs(collection(db, 'companies')),
            getDocs(collection(db, 'admins')),
            getDoc(doc(db, 'config', 'platformSettings')),
        ]);
        if (s.status === 'fulfilled') setStudents(s.value.docs.map(d => ({ id: d.id, ...d.data() } as StudentRaw)));
        if (o.status === 'fulfilled') setOffers(o.value.docs.map(d => ({ id: d.id, ...d.data() } as OfferRaw)));
        if (c.status === 'fulfilled') setCompanies(c.value.docs.map(d => ({ id: d.id, ...d.data() } as CompanyRaw)));
        if (a.status === 'fulfilled') setAdminUsers(a.value.docs.map(d => ({ id: d.id, ...d.data() } as AdminUserRaw)));
        if (conf.status === 'fulfilled' && conf.value.exists()) setConfig(conf.value.data());
        
        setLastRefreshed(new Date());
        setIsLoading(false);
    };

    const handleBroadcast = async () => {
        if (!broadcastMsg.trim()) return;
        setIsBroadcasting(true);
        try {
            await addDoc(collection(db, 'notifications'), {
                type: 'dean_broadcast',
                title: 'Dean\'s Strategic Message',
                message: broadcastMsg,
                timestamp: serverTimestamp(),
                sender: 'Dean Ramesh Kumar',
                priority: 'high'
            });
            setBroadcastMsg('');
            alert('Broadcasting operation successful. All students notified.');
        } catch (e) {
            console.error('Broadcast failed:', e);
            alert('Operation failed. Check permissions.');
        }
        setIsBroadcasting(false);
    };

    useEffect(() => { fetchData(); }, []);

    const kpis = useMemo(() => {
        const total = students.length;
        const placed = students.filter(s => s.placementStatus === 'placed').length;
        const rate = total > 0 ? ((placed / total) * 100).toFixed(1) : '0';
        const ctcs = offers.map(o => o.ctc || o.packageLPA || 0).filter(v => v > 0);
        const avgPkg = ctcs.length ? (ctcs.reduce((a, b) => a + b, 0) / ctcs.length).toFixed(1) : '0';
        const highPkg = ctcs.length ? Math.max(...ctcs).toFixed(1) : '0';
        return { total, placed, rate, avgPkg, highPkg, companies: companies.length, offers: offers.length };
    }, [students, offers, companies]);

    const deptData = useMemo(() => {
        const map: Record<string, { total: number; placed: number; cgpaSum: number }> = {};
        students.forEach(s => {
            const d = s.branch || 'Unknown';
            if (!map[d]) map[d] = { total: 0, placed: 0, cgpaSum: 0 };
            map[d].total++;
            if (s.placementStatus === 'placed') map[d].placed++;
            map[d].cgpaSum += parseCgpa(s.cgpa);
        });
        return Object.entries(map).map(([dept, d]) => ({
            dept: dept.length > 12 ? dept.slice(0, 12) + '…' : dept,
            fullDept: dept,
            total: d.total, placed: d.placed, unplaced: d.total - d.placed,
            avgCgpa: d.total > 0 ? parseFloat((d.cgpaSum / d.total).toFixed(2)) : 0,
            rate: d.total > 0 ? parseFloat(((d.placed / d.total) * 100).toFixed(1)) : 0,
        })).sort((a, b) => b.total - a.total);
    }, [students]);

    const yearCgpa = useMemo(() => {
        const map: Record<string, { sum: number; count: number }> = {};
        students.forEach(s => {
            const yr = `Yr ${s.currentYear || '?'}`;
            if (!map[yr]) map[yr] = { sum: 0, count: 0 };
            const c = parseCgpa(s.cgpa);
            if (c > 0) { map[yr].sum += c; map[yr].count++; }
        });
        return Object.entries(map).map(([year, d]) => ({
            year, avgCgpa: d.count > 0 ? parseFloat((d.sum / d.count).toFixed(2)) : 0,
        })).sort((a, b) => a.year.localeCompare(b.year));
    }, [students]);

    const adminRoles = useMemo(() => {
        const map: Record<string, number> = {};
        adminUsers.forEach(u => { map[u.role] = (map[u.role] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
    }, [adminUsers]);

    const offerColor = (s?: string) => {
        const st = (s || '').toLowerCase();
        if (st === 'accepted') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (st === 'pending' || st === 'issued') return 'text-amber-600 bg-amber-50 border-amber-200';
        if (st === 'rejected') return 'text-red-600 bg-red-50 border-red-200';
        return 'text-muted-foreground bg-secondary border-border';
    };

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

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Students', icon: GraduationCap, path: '/dean/students', accent: 'bg-blue-100 text-blue-700' },
                    { label: 'Batch Analytics', icon: BarChart3, path: '/dean/batch-analytics', accent: 'bg-purple-100 text-purple-700' },
                    { label: 'Reports', icon: FileText, path: '/dean/reports', accent: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Audit Logs', icon: ClipboardList, path: '/dean/audit-logs', accent: 'bg-amber-100 text-amber-700' },
                ].map((a, i) => (
                    <NavLink key={i} to={a.path} className="card-nmims flex flex-col items-center justify-center p-4 hover:border-primary/30 transition-all group text-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${a.accent}`}><a.icon className="w-5 h-5" /></div>
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{a.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Strategic Control Center */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-2">
                {/* Global Broadcast Box */}
                <div className="xl:col-span-2 card-nmims p-6 border-l-4 border-l-primary/50 relative overflow-hidden">
                    <div className="absolute top-[-20px] right-[-20px] opacity-[0.03]">
                        <Megaphone className="w-32 h-32" />
                    </div>
                    <SectionHeader icon={Megaphone} title="Campus-wide Broadcast" />
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                placeholder="Write a strategic message to all students and staff..."
                                className="w-full h-24 p-4 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2 justify-end">
                            <button
                                onClick={handleBroadcast}
                                disabled={isBroadcasting || !broadcastMsg.trim()}
                                className="nmims-btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50"
                            >
                                {isBroadcasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Broadcast
                            </button>
                            <p className="text-[10px] text-muted-foreground text-center italic leading-tight">Message will be visible<br/>to all 2000+ students</p>
                        </div>
                    </div>
                </div>

                {/* Strategic Targets */}
                <div className="card-nmims p-6 border-l-4 border-l-emerald-500/50">
                    <SectionHeader icon={Goal} title="Institutional Goals" />
                    <div className="space-y-4 mt-4">
                        {[
                            { label: 'Placement Rate', current: kpis.rate, target: config?.targets?.placementRate || 100, unit: '%' },
                            { label: 'Avg Package (LPA)', current: kpis.avgPkg, target: config?.targets?.averageCTC || 15, unit: '' },
                            { label: 'Higher Education Rate', current: 12, target: config?.targets?.nirfHigherStudies || 20, unit: '%' },
                        ].map((t, idx) => {
                            const progress = Math.min(100, (parseFloat(t.current as string) / t.target) * 100);
                            return (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-foreground">{t.label}</span>
                                        <span className="text-[10px] font-medium text-muted-foreground tracking-tight">Trgt: {t.target}{t.unit}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${progress >= 90 ? 'bg-emerald-500' : progress >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] items-center">
                                        <span className="text-primary font-bold">Curr: {t.current}{t.unit}</span>
                                        <span className="text-muted-foreground">{progress.toFixed(0)}% reached</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* KPI Row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Students" value={kpis.total} subtitle="Registered in system" icon={Users} accent="bg-blue-100 text-blue-700" loading={isLoading} />
                <KpiCard title="Placement Rate" value={`${kpis.rate}%`} subtitle="Students placed" icon={TrendingUp} accent="bg-emerald-100 text-emerald-700" loading={isLoading} />
                <KpiCard title="Avg Package" value={`₹${kpis.avgPkg} LPA`} subtitle="From confirmed offers" icon={IndianRupee} accent="bg-amber-100 text-amber-700" loading={isLoading} />
                <KpiCard title="Highest Package" value={`₹${kpis.highPkg} LPA`} subtitle="Best offer this season" icon={Award} accent="bg-purple-100 text-purple-700" loading={isLoading} />
            </div>

            {/* KPI Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Companies" value={kpis.companies} subtitle="Onboarded partners" icon={Building2} accent="bg-cyan-100 text-cyan-700" loading={isLoading} />
                <KpiCard title="Total Offers" value={kpis.offers} subtitle="Offers issued" icon={Briefcase} accent="bg-rose-100 text-rose-700" loading={isLoading} />
                <KpiCard title="Students Placed" value={kpis.placed} subtitle="Confirmed placements" icon={GraduationCap} accent="bg-green-100 text-green-700" loading={isLoading} />
                <KpiCard title="Admin Staff" value={adminUsers.length} subtitle="Platform administrators" icon={ShieldCheck} accent="bg-indigo-100 text-indigo-700" loading={isLoading} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-nmims p-6">
                    <SectionHeader icon={BarChart3} title="Department-wise Placement" to="/dean/batch-analytics" />
                    {isLoading ? <div className="h-56 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : deptData.length === 0 ? <div className="h-56 flex flex-col items-center justify-center text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No data yet</p></div>
                        : <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={deptData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                                <Tooltip {...TT_STYLE} />
                                <Legend />
                                <Bar dataKey="placed" name="Placed" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="unplaced" name="Unplaced" fill="#dc2626" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>}
                </div>

                <div className="card-nmims p-6">
                    <SectionHeader icon={TrendingUp} title="Year-wise Avg CGPA" />
                    {isLoading ? <div className="h-56 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : yearCgpa.length === 0 ? <div className="h-56 flex flex-col items-center justify-center text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No data yet</p></div>
                        : <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={yearCgpa} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                                <Tooltip {...TT_STYLE} />
                                <Bar dataKey="avgCgpa" name="Avg CGPA" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>}
                </div>
            </div>

            {/* Dept Table + Admin Roles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card-nmims p-6 lg:col-span-2">
                    <SectionHeader icon={BarChart3} title="Department Performance" to="/dean/batch-analytics" toLabel="Full analytics" />
                    {isLoading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-secondary animate-pulse rounded-lg" />)}</div>
                        : deptData.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No department data</p></div>
                        : <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-border">
                                    {['Department', 'Total', 'Placed', 'Rate', 'Avg CGPA'].map(h => (
                                        <th key={h} className={`py-2.5 text-xs font-semibold text-muted-foreground ${h === 'Department' ? 'text-left' : 'text-right'}`}>{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>
                                    {deptData.map((d, i) => (
                                        <tr key={i} className="border-b border-border/40 hover:bg-secondary/50 transition-colors">
                                            <td className="py-2.5 font-medium text-foreground">{d.fullDept}</td>
                                            <td className="py-2.5 text-right text-muted-foreground">{d.total}</td>
                                            <td className="py-2.5 text-right font-semibold text-emerald-600">{d.placed}</td>
                                            <td className="py-2.5 text-right">
                                                <span className={`font-semibold ${d.rate >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>{d.rate}%</span>
                                            </td>
                                            <td className="py-2.5 text-right">
                                                <span className={`font-semibold ${d.avgCgpa >= 8 ? 'text-emerald-600' : d.avgCgpa >= 7 ? 'text-amber-600' : 'text-red-600'}`}>{d.avgCgpa.toFixed(2)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>}
                </div>

                {/* Branch Performance */}
                <div className="card-nmims p-6">
                    <SectionHeader icon={BarChartIcon} title="Branch Distribution" />
                    {isLoading ? <div className="h-52 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : adminRoles.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No admin data</p></div>
                        : <ResponsiveContainer width="100%" height={210}>
                            <PieChart>
                                <Pie data={adminRoles} cx="50%" cy="50%" outerRadius={72} dataKey="value" nameKey="name" label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                                    {adminRoles.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                </Pie>
                                <Tooltip {...TT_STYLE} />
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>}
                </div>
            </div>

            {/* Recent Offers */}
            <div className="card-nmims p-6">
                <SectionHeader icon={Briefcase} title="Recent Offers" to="/dean/reports" toLabel="All reports" />
                {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-secondary animate-pulse rounded-xl" />)}</div>
                    : offers.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No offers yet. Seed admin data first.</p></div>
                    : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {offers.slice(0, 8).map((o, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors border border-border/50">
                                <div className="min-w-0">
                                    <p className="font-semibold text-foreground text-sm truncate">{o.studentName || 'Student'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{o.companyName} · {o.role || 'Role N/A'}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-3">
                                    <p className="text-sm font-bold text-foreground">₹{o.ctc || o.packageLPA || 0} LPA</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${offerColor(o.status)}`}>{o.status || 'Pending'}</span>
                                </div>
                            </div>
                        ))}
                    </div>}
            </div>

            <p className="text-xs text-center text-muted-foreground">Last refreshed: {lastRefreshed.toLocaleTimeString()}</p>
        </div>
    );
};
