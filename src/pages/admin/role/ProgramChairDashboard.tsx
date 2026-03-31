import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    BookOpen, ShieldCheck, GraduationCap, TrendingUp, BarChart3,
    Users, ArrowRight, CheckCircle2, AlertTriangle, Target, Loader2,
    Inbox, XCircle, Award, Code2, RefreshCw, ChevronDown,
    ChevronUp, Search, Filter, Send, Megaphone
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    studentsDb, eligibilityDb 
} from '../../../services/db/database.service';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';
import { BatchSWOCSection } from '../../../components/admin/dashboard/BatchSWOCSection';
import type { AdminEligibilityRule } from '../../../types/eligibilityAdmin';

// ── Types ─────────────────────────────────────────────────────
interface StudentRaw {
    id: string;
    name: string;
    sapId: string;
    email: string;
    branch: string;
    currentYear: string | number;
    cgpa: string | number;
    batch: string;
    techSkills?: string[];
    skills?: string[];
    projects?: any[];
    internships?: any[];
    certifications?: any[];
    placementStatus?: string;
    careerTrack?: string;
    leetcodeStats?: { totalSolved: number };
    resumeUrl?: string;
    profileCompleted?: boolean;
    assessmentCompleted?: boolean;
}

interface DeptStat {
    dept: string;
    total: number;
    eligible: number;
    placed: number;
    avgCgpa: number;
}

// ── Helpers ───────────────────────────────────────────────────
const parseCgpa = (v: string | number | undefined): number => {
    if (!v) return 0;
    const n = typeof v === 'number' ? v : parseFloat(v);
    return isNaN(n) ? 0 : n;
};

const DEPT_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

// ── Sub-components ────────────────────────────────────────────
const KpiCard: React.FC<{
    title: string; value: string | number; subtitle: string;
    icon: React.ElementType; colorClass: string; loading: boolean;
}> = ({ title, value, subtitle, icon: Icon, colorClass, loading }) => (
    <div className="group relative rounded-2xl border border-slate-100 bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
        <div className="flex items-start justify-between mb-3">
            <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-wide">{title}</p>
                {loading
                    ? <div className="h-8 w-20 bg-secondary animate-pulse rounded mt-1" />
                    : <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>}
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </div>
            <div className={`p-2.5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${colorClass}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
    </div>
);

const SectionHeader: React.FC<{
    icon: React.ElementType; title: string; linkTo?: string; linkLabel?: string;
}> = ({ icon: Icon, title, linkTo, linkLabel }) => (
    <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            {title}
        </h3>
        {linkTo && (
            <NavLink to={linkTo} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                {linkLabel || 'View all'} <ArrowRight className="w-4 h-4" />
            </NavLink>
        )}
    </div>
);

// ── Main Component ────────────────────────────────────────────
export const ProgramChairDashboard: React.FC = () => {
    // Raw data
    const [students, setStudents] = useState<StudentRaw[]>([]);
    const [eligibilityRules, setEligibilityRules] = useState<AdminEligibilityRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    // Student table state
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState<string>('all');
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
    const [showStudentTable, setShowStudentTable] = useState(false);

    // ── Fetch ─────────────────────────────────────────────────
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [studentsSnap, rules] = await Promise.allSettled([
                studentsDb.fetchAllStudents(),
                eligibilityDb.fetchAllRules(),
            ]);

            if (studentsSnap.status === 'fulfilled') {
                setStudents(studentsSnap.value.map((d: any) => ({
                    ...d,
                    name: d.fullName || d.name,
                    branch: d.department || d.branch,
                    currentYear: d.currentYear
                }) as StudentRaw));
            }
            
            if (rules.status === 'fulfilled') {
                setEligibilityRules(rules.value);
            }

            setLastRefreshed(new Date());
        } catch (err) {
            console.error('ProgramChairDashboard fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ── Derived KPIs ──────────────────────────────────────────
    const kpis = useMemo(() => {
        if (!students || !eligibilityRules) return { total: 0, eligible: 0, placed: 0, avgCgpa: 0, profileComplete: 0, activeRules: 0, placementRate: '0', internshipRate: 0 };
        const total = students.length;
        const eligible = students.filter(s =>
            s.placementStatus === 'eligible' || s.placementStatus === 'placed'
        ).length;
        const placed = students.filter(s => s.placementStatus === 'placed').length;
        const cgpas = students.map(s => parseCgpa(s.cgpa)).filter(v => v > 0);
        const avgCgpa = cgpas.length ? (cgpas.reduce((a, b) => a + b, 0) / cgpas.length) : 0;
        const profileComplete = students.filter(s => s.profileCompleted).length;
        const activeRules = eligibilityRules.filter(r => r.active !== false).length;
        const placementRate = total > 0 ? ((placed / total) * 100).toFixed(1) : '0';

        // Calculate internship rate
        const internshipsDone = students.filter(s => (s.internships?.length || 0) > 0).length;
        const internshipRate = total > 0 ? Math.round((internshipsDone / total) * 100) : 0;

        return { total, eligible, placed, avgCgpa, profileComplete, activeRules, placementRate, internshipRate };
    }, [students, eligibilityRules]);

    // ── Year-wise breakdown ───────────────────────────────────
    const yearStats = useMemo(() => {
        if (!students) return [];
        const map: Record<string, { total: number; eligible: number; avgCgpa: number; cgpaSum: number }> = {};
        students.forEach(s => {
            const yr = String(s.currentYear || 'Unknown');
            if (!map[yr]) map[yr] = { total: 0, eligible: 0, avgCgpa: 0, cgpaSum: 0 };
            map[yr].total++;
            if (s.placementStatus === 'eligible' || s.placementStatus === 'placed') map[yr].eligible++;
            map[yr].cgpaSum += parseCgpa(s.cgpa);
        });
        return Object.entries(map)
            .map(([year, d]) => ({
                year: `Year ${year}`,
                total: d.total,
                eligible: d.eligible,
                avgCgpa: d.total > 0 ? parseFloat((d.cgpaSum / d.total).toFixed(2)) : 0,
            }))
            .sort((a, b) => a.year.localeCompare(b.year));
    }, [students]);

    // ── Department breakdown ──────────────────────────────────
    const deptStats = useMemo((): DeptStat[] => {
        if (!students) return [];
        const map: Record<string, { total: number; eligible: number; placed: number; cgpaSum: number }> = {};
        students.forEach(s => {
            const dept = s.branch || 'Unknown';
            if (!map[dept]) map[dept] = { total: 0, eligible: 0, placed: 0, cgpaSum: 0 };
            map[dept].total++;
            if (s.placementStatus === 'eligible' || s.placementStatus === 'placed') map[dept].eligible++;
            if (s.placementStatus === 'placed') map[dept].placed++;
            map[dept].cgpaSum += parseCgpa(s.cgpa);
        });
        return Object.entries(map).map(([dept, d]) => ({
            dept,
            total: d.total,
            eligible: d.eligible,
            placed: d.placed,
            avgCgpa: d.total > 0 ? parseFloat((d.cgpaSum / d.total).toFixed(2)) : 0,
        })).sort((a, b) => b.total - a.total);
    }, [students]);

    // ── Skill distribution ────────────────────────────────────
    const topSkills = useMemo(() => {
        if (!students) return [];
        const map: Record<string, number> = {};
        students.forEach(s => {
            const skillsRaw = s.techSkills || s.skills || [];
            const skills = Array.isArray(skillsRaw) ? skillsRaw : [];
            skills.forEach((sk: string) => { if (sk) map[sk] = (map[sk] || 0) + 1; });
        });
        return Object.entries(map)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, count, pct: students.length > 0 ? Math.round((count / students.length) * 100) : 0 }));
    }, [students]);

    // ── Career track distribution ─────────────────────────────
    const careerTrackData = useMemo(() => {
        if (!students) return [];
        const map: Record<string, number> = {};
        students.forEach(s => {
            const track = s.careerTrack || 'Undecided';
            map[track] = (map[track] || 0) + 1;
        });
        return Object.entries(map)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([name, value]) => ({ name, value }));
    }, [students]);

    // ── Filtered student list ─────────────────────────────────
    const filteredStudents = useMemo(() => {
        let list = [...students];
        if (yearFilter !== 'all') list = list.filter(s => String(s.currentYear) === yearFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(s =>
                s.name?.toLowerCase().includes(q) ||
                s.sapId?.toLowerCase().includes(q) ||
                s.email?.toLowerCase().includes(q)
            );
        }
        return list.slice(0, 50);
    }, [students, yearFilter, searchQuery]);

    // ── Top performers ────────────────────────────────────────
    const topPerformers = useMemo(() =>
        [...students]
            .filter(s => parseCgpa(s.cgpa) > 0)
            .sort((a, b) => parseCgpa(b.cgpa) - parseCgpa(a.cgpa))
            .slice(0, 8),
        [students]
    );

    // ── Eligibility compliance check ──────────────────────────
    const eligibilityCompliance = useMemo(() => {
        if (!eligibilityRules.length || !students.length) return null;
        const activeRule = eligibilityRules.find(r => r.active !== false);
        if (!activeRule) return null;
        const pass = students.filter(s => parseCgpa(s.cgpa) >= activeRule.minCGPA).length;
        const fail = students.length - pass;
        return { rule: activeRule, pass, fail, pct: Math.round((pass / students.length) * 100) };
    }, [students, eligibilityRules]);

    const uniqueYears = useMemo(() =>
        [...new Set(students.map(s => String(s.currentYear)).filter(Boolean))].sort(),
        [students]
    );

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="space-y-6 pb-10 animate-fade-in-up">
            {/* Welcome + Refresh */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1"><WelcomeCard /></div>
                <button
                    onClick={fetchData}
                    disabled={isLoading}
                    className="mt-1 flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-secondary transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-base font-semibold mb-3 text-foreground">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Eligibility Rules', icon: ShieldCheck, path: '/program-chair/eligibility-rules', color: 'text-emerald-700 bg-emerald-100' },
                        { label: 'Student Directory', icon: GraduationCap, path: '/program-chair/students', color: 'text-blue-700 bg-blue-100' },
                        { label: 'Batch Analytics', icon: BarChart3, path: '/program-chair/batch-analytics', color: 'text-violet-700 bg-violet-100' },
                        { label: 'Reports', icon: TrendingUp, path: '/program-chair/reports', color: 'text-amber-700 bg-amber-100' },
                    ].map((a, i) => (
                        <NavLink key={i} to={a.path}
                            className="flex flex-col items-center justify-center p-4 card-nmims hover:bg-secondary/50 hover:border-primary/30 transition-all group text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${a.color}`}>
                                <a.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{a.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Students" value={kpis.total} subtitle="Registered in system"
                    icon={BookOpen} colorClass="text-violet-700 bg-violet-100 border-violet-200" loading={isLoading} />
                <KpiCard title="Eligible Students" value={kpis.eligible} subtitle="Cleared eligibility"
                    icon={GraduationCap} colorClass="text-blue-700 bg-blue-100 border-blue-200" loading={isLoading} />
                <KpiCard title="Avg CGPA" value={isLoading ? '...' : kpis.avgCgpa.toFixed(2)} subtitle="Across all students"
                    icon={Award} colorClass="text-emerald-700 bg-emerald-100 border-emerald-200" loading={isLoading} />
                <KpiCard title="Active Rules" value={kpis.activeRules} subtitle="Eligibility rules"
                    icon={ShieldCheck} colorClass="text-amber-700 bg-amber-100 border-amber-200" loading={isLoading} />
            </div>

            {/* Second KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Placement Rate" value={`${kpis.placementRate}%`} subtitle="Students placed"
                    icon={TrendingUp} colorClass="text-rose-700 bg-rose-100 border-rose-200" loading={isLoading} />
                <KpiCard title="Placed" value={kpis.placed} subtitle="Confirmed placements"
                    icon={CheckCircle2} colorClass="text-green-700 bg-green-100 border-green-200" loading={isLoading} />
                <KpiCard title="Profile Complete" value={kpis.profileComplete} subtitle="Profiles fully filled"
                    icon={Users} colorClass="text-cyan-700 bg-cyan-100 border-cyan-200" loading={isLoading} />
                <KpiCard title="Departments" value={deptStats.length} subtitle="Active departments"
                    icon={BarChart3} colorClass="text-indigo-700 bg-indigo-100 border-indigo-200" loading={isLoading} />
            </div>

            {/* Program Chair Action Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Rule Override Control */}
                <div className="lg:col-span-1 card-nmims p-6 border-l-4 border-l-rose-500/50">
                    <SectionHeader icon={ShieldCheck} title="Compliance Guard" />
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                            <span className="text-xs font-bold uppercase text-slate-500 tracking-tight">Active Policy Status</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${kpis.activeRules > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {kpis.activeRules > 0 ? 'Enforced' : 'Inactive'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                             Automated eligibility checks are running against the current {kpis.total} students in the cohort.
                        </p>
                        <NavLink to="/program-chair/eligibility-rules" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg hover:shadow-indigo-500/20">
                             Modify Policy <ArrowRight className="w-3 h-3" />
                        </NavLink>
                    </div>
                </div>

                {/* Batch Announcement */}
                <div className="lg:col-span-2 card-nmims p-6 border-l-4 border-l-indigo-500/50 relative overflow-hidden">
                    <div className="absolute top-[-20px] right-[-20px] opacity-[0.03]">
                        <BookOpen className="w-32 h-32" />
                    </div>
                    <SectionHeader icon={Megaphone} title="Departmental Directive" />
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <textarea 
                                placeholder="Post an official directive to all students in your program..."
                                className="w-full h-24 p-4 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none font-medium placeholder:text-muted-foreground/50 transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-2 justify-end items-center sm:items-stretch group">
                            <button className="nmims-btn-primary p-4 rounded-xl shadow-xl hover:shadow-primary/30 flex items-center justify-center group-hover:bg-primary/90 transition-all">
                                <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </button>
                            <span className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-tighter whitespcae-nowrap">Broadcast to Batch</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Batch SWOC Section - New Strategic Insight */}
            <BatchSWOCSection 
                batchData={{
                    total: kpis.total,
                    avgCgpa: kpis.avgCgpa,
                    topSkills: topSkills.map(s => s.skill),
                    placementRate: kpis.placementRate,
                    internshipRate: kpis.internshipRate,
                    careerTracks: careerTrackData.map(c => c.name)
                }}
            />

            {/* Year-wise Bar Chart + Career Track Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Year-wise breakdown */}
                <div className="card-nmims p-6">
                    <SectionHeader icon={BarChart3} title="Year-wise Student Breakdown" />
                    {isLoading ? (
                        <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : yearStats.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <Inbox className="w-8 h-8" /><p className="text-sm">No student data yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={yearStats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                                <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                                    labelStyle={{ color: 'var(--color-foreground)' }}
                                />
                                <Bar dataKey="total" name="Total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="eligible" name="Eligible" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Career Track Pie */}
                <div className="card-nmims p-6">
                    <SectionHeader icon={Target} title="Career Track Distribution" />
                    {isLoading ? (
                        <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : careerTrackData.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <Inbox className="w-8 h-8" /><p className="text-sm">No career track data yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={careerTrackData} cx="50%" cy="50%" outerRadius={80}
                                    dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    labelLine={false}>
                                    {careerTrackData.map((_, i) => (
                                        <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Department Table + Eligibility Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Stats Table */}
                <div className="card-nmims p-6">
                    <SectionHeader icon={BarChart3} title="Department Overview" />
                    {isLoading ? (
                        <div className="space-y-2">{[...Array(4)].map((_, i) => (
                            <div key={i} className="h-10 bg-secondary animate-pulse rounded-lg" />
                        ))}</div>
                    ) : deptStats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                            <Inbox className="w-8 h-8" /><p className="text-sm">No department data</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-2 text-xs text-muted-foreground font-semibold">Dept</th>
                                        <th className="text-right py-2 text-xs text-muted-foreground font-semibold">Total</th>
                                        <th className="text-right py-2 text-xs text-muted-foreground font-semibold">Eligible</th>
                                        <th className="text-right py-2 text-xs text-muted-foreground font-semibold">Avg CGPA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deptStats.map((d, i) => (
                                        <tr key={i} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                                            <td className="py-2.5 font-medium text-foreground truncate max-w-[120px]">{d.dept}</td>
                                            <td className="py-2.5 text-right text-muted-foreground">{d.total}</td>
                                            <td className="py-2.5 text-right">
                                                <span className="text-emerald-600 font-medium">{d.eligible}</span>
                                            </td>
                                            <td className="py-2.5 text-right">
                                                <span className={`font-semibold ${d.avgCgpa >= 8 ? 'text-emerald-600' : d.avgCgpa >= 7 ? 'text-amber-600' : 'text-rose-600'}`}>
                                                    {d.avgCgpa.toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Eligibility Compliance */}
                <div className="card-nmims p-6">
                    <SectionHeader icon={ShieldCheck} title="Eligibility Compliance" linkTo="/program-chair/eligibility-rules" linkLabel="Manage" />
                    {isLoading ? (
                        <div className="space-y-3">{[...Array(3)].map((_, i) => (
                            <div key={i} className="h-14 bg-secondary animate-pulse rounded-xl" />
                        ))}</div>
                    ) : eligibilityCompliance ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                                <p className="text-xs text-muted-foreground mb-1">Active Rule</p>
                                <p className="font-semibold text-foreground">{eligibilityCompliance.rule.ruleName}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Min CGPA: {eligibilityCompliance.rule.minCGPA}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-emerald-600">{eligibilityCompliance.pass}</p>
                                    <p className="text-xs text-muted-foreground">Pass CGPA</p>
                                </div>
                                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
                                    <XCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-rose-600">{eligibilityCompliance.fail}</p>
                                    <p className="text-xs text-muted-foreground">Below CGPA</p>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Compliance Rate</span>
                                    <span className="font-semibold text-foreground">{eligibilityCompliance.pct}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                        style={{ width: `${eligibilityCompliance.pct}%` }} />
                                </div>
                            </div>
                        </div>
                    ) : eligibilityRules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                            <AlertTriangle className="w-8 h-8 text-amber-600" />
                            <p className="text-sm">No eligibility rules configured.</p>
                            <NavLink to="/program-chair/eligibility-rules"
                                className="text-xs text-primary hover:underline mt-1">Set up rules →</NavLink>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                            <Inbox className="w-8 h-8" /><p className="text-sm">No student data to evaluate</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Skills + Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Skills */}
                <div className="card-nmims p-6">
                    <SectionHeader icon={Code2} title="Top Skills in Batch" />
                    {isLoading ? (
                        <div className="space-y-3">{[...Array(6)].map((_, i) => (
                            <div key={i} className="h-8 bg-secondary animate-pulse rounded" />
                        ))}</div>
                    ) : topSkills.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                            <Inbox className="w-8 h-8" /><p className="text-sm">No skill data yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topSkills.map(({ skill, count, pct }) => (
                                <div key={skill}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-foreground">{skill}</span>
                                        <span className="text-muted-foreground">{count} students ({pct}%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Performers */}
                <div className="card-nmims p-6">
                    <SectionHeader icon={Award} title="Top Performers by CGPA" />
                    {isLoading ? (
                        <div className="space-y-2">{[...Array(6)].map((_, i) => (
                            <div key={i} className="h-12 bg-secondary animate-pulse rounded-xl" />
                        ))}</div>
                    ) : topPerformers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                            <Inbox className="w-8 h-8" /><p className="text-sm">No student data yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {topPerformers.map((s, i) => (
                                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                        i === 0 ? 'bg-yellow-400 text-yellow-900' :
                                        i === 1 ? 'bg-slate-300 text-slate-700' :
                                        i === 2 ? 'bg-orange-400 text-orange-900' :
                                        'bg-secondary text-muted-foreground'
                                    }`}>{i + 1}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                                        <p className="text-xs text-muted-foreground">{s.sapId} · Year {s.currentYear}</p>
                                    </div>
                                    <span className="text-sm font-bold text-primary flex-shrink-0">{parseCgpa(s.cgpa).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Eligibility Rules List */}
            <div className="card-nmims p-6">
                <SectionHeader icon={ShieldCheck} title="Eligibility Rules" linkTo="/program-chair/eligibility-rules" linkLabel="Manage all" />
                {isLoading ? (
                    <div className="space-y-2">{[...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 bg-secondary animate-pulse rounded-xl" />
                    ))}</div>
                ) : eligibilityRules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                        <Inbox className="w-8 h-8" />
                        <p className="text-sm">No eligibility rules configured yet.</p>
                        <NavLink to="/program-chair/eligibility-rules"
                            className="text-xs text-primary hover:underline mt-1">Create your first rule →</NavLink>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {eligibilityRules.slice(0, 6).map((rule) => (
                            <div key={rule.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    rule.active !== false ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                                }`}>
                                    {rule.active !== false ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{rule.ruleName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Min CGPA: {rule.minCGPA} · Max Backlogs: {rule.maxActiveBacklogs} · {(rule.allowedDepartments?.length) ? rule.allowedDepartments.join(', ') : 'All depts'}
                                    </p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                    rule.active !== false ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                                }`}>
                                    {rule.active !== false ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Student Directory (collapsible) */}
            <div className="card-nmims p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        Student Directory
                        {!isLoading && <span className="text-sm font-normal text-muted-foreground ml-1">({students.length})</span>}
                    </h3>
                    <button
                        onClick={() => setShowStudentTable(p => !p)}
                        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        {showStudentTable ? <><ChevronUp className="w-4 h-4" />Collapse</> : <><ChevronDown className="w-4 h-4" />Expand</>}
                    </button>
                </div>

                {showStudentTable && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by name, SAP ID, email..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <select
                                    value={yearFilter}
                                    onChange={e => setYearFilter(e.target.value)}
                                    className="text-sm border border-border rounded-xl bg-secondary/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="all">All Years</option>
                                    {uniqueYears.map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Student rows */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                                <Inbox className="w-8 h-8" /><p className="text-sm">No students match your filters</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredStudents.map(s => (
                                    <div key={s.id} className="border border-border/50 rounded-xl overflow-hidden">
                                        <div
                                            className="flex items-center gap-3 p-3 hover:bg-secondary/40 cursor-pointer transition-colors"
                                            onClick={() => setExpandedStudent(expandedStudent === s.id ? null : s.id)}
                                        >
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                                {s.name?.charAt(0) || 'S'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                                                <p className="text-xs text-muted-foreground">{s.sapId} · {s.branch} · Year {s.currentYear}</p>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className="text-sm font-bold text-primary hidden sm:block">{parseCgpa(s.cgpa).toFixed(2)}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full hidden sm:block ${
                                                    s.placementStatus === 'placed' ? 'bg-emerald-50 text-emerald-600' :
                                                    s.placementStatus === 'eligible' ? 'bg-blue-500/10 text-blue-600' :
                                                    'bg-secondary text-muted-foreground'
                                                }`}>{s.placementStatus || 'unplaced'}</span>
                                                {expandedStudent === s.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                            </div>
                                        </div>

                                        {expandedStudent === s.id && (
                                            <div className="p-4 bg-secondary/20 border-t border-border/40 space-y-4">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                    <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium truncate">{s.email}</p></div>
                                                    <div><p className="text-xs text-muted-foreground">CGPA</p><p className="font-bold text-primary">{parseCgpa(s.cgpa).toFixed(2)}</p></div>
                                                    <div><p className="text-xs text-muted-foreground">Batch</p><p className="font-medium">{s.batch || 'N/A'}</p></div>
                                                    <div><p className="text-xs text-muted-foreground">Career Track</p><p className="font-medium">{s.careerTrack || 'Undecided'}</p></div>
                                                </div>
                                                {(s.techSkills || s.skills || []).length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-2">Skills</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(s.techSkills || s.skills || []).slice(0, 10).map((sk: string, i: number) => (
                                                                <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{sk}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                                                    <div className="p-2 rounded-lg bg-secondary/50">
                                                        <p className="font-bold text-foreground">{s.projects?.length || 0}</p>
                                                        <p className="text-xs text-muted-foreground">Projects</p>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-secondary/50">
                                                        <p className="font-bold text-foreground">{s.internships?.length || 0}</p>
                                                        <p className="text-xs text-muted-foreground">Internships</p>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-secondary/50">
                                                        <p className="font-bold text-foreground">{s.leetcodeStats?.totalSolved || 0}</p>
                                                        <p className="text-xs text-muted-foreground">LeetCode</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {filteredStudents.length === 50 && (
                                    <p className="text-xs text-center text-muted-foreground pt-2">
                                        Showing first 50 results. Use <NavLink to="/program-chair/students" className="text-primary hover:underline">Student Directory</NavLink> for full list.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Last refreshed */}
            <p className="text-xs text-center text-muted-foreground">
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
        </div>
    );
};
