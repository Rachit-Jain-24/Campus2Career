import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users, BookOpen, Award, AlertTriangle, BarChart3, Code2,
    ArrowRight, Loader2, Inbox, RefreshCw, GraduationCap, FileText,
    Settings, Calendar, Send
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { 
    studentsDb, interviewsDb 
} from '../../../services/db/database.service';
import { WelcomeCard } from '../../../components/admin/dashboard/WelcomeCard';
import { BatchSWOCSection } from '../../../components/admin/dashboard/BatchSWOCSection';

const parseCgpa = (v: string | number | undefined): number => {
    if (!v) return 0;
    const n = typeof v === 'number' ? v : parseFloat(v as string);
    return isNaN(n) ? 0 : n;
};

const DEPT_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const TT = { contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 } };

interface StudentRaw {
    id: string; name?: string; sapId?: string; branch?: string;
    currentYear?: number; cgpa?: string | number; resumeUrl?: string;
    techSkills?: string[]; skills?: string[]; projects?: unknown[];
    internships?: unknown[]; placementStatus?: string;
}
interface InterviewRaw {
    id: string; companyName?: string; roundType?: string;
    scheduledDate?: any; status?: string;
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

export const FacultyDashboard: React.FC = () => {
    const [students, setStudents] = useState<StudentRaw[]>([]);
    const [interviews, setInterviews] = useState<InterviewRaw[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const results = await Promise.allSettled([
                studentsDb.fetchAllStudents(),
                interviewsDb.getAllInterviews(),
            ]);

            if (results[0].status === 'fulfilled') setStudents(results[0].value.map(d => ({ 
                ...d, 
                name: (d as any).fullName || (d as any).name,
                branch: (d as any).department || (d as any).branch,
                currentYear: parseInt((d as any).currentYear || 0)
            }) as StudentRaw));
            if (results[1].status === 'fulfilled') setInterviews(results[1].value.map(d => ({ ...d }) as InterviewRaw));
            
            setLastRefreshed(new Date());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const kpis = useMemo(() => {
        const total = students.length;
        const withResume = students.filter(s => !!s.resumeUrl).length;
        const cgpas = students.map(s => parseCgpa(s.cgpa)).filter(v => v > 0);
        const avgCgpa = cgpas.length ? (cgpas.reduce((a, b) => a + b, 0) / cgpas.length) : 0;
        const noInternships = students.filter(s => !s.internships || (s.internships as unknown[]).length === 0).length;
        
        // Additions for Batch SWOC
        const placed = students.filter(s => s.placementStatus === 'placed').length;
        const placementRate = total > 0 ? ((placed / total) * 100).toFixed(1) : '0';
        const internshipsDone = students.filter(s => (s.internships?.length || 0) > 0).length;
        const internshipRate = total > 0 ? Math.round((internshipsDone / total) * 100) : 0;

        return { total, withResume, avgCgpa, noInternships, placementRate, internshipRate };
    }, [students]);

    const yearData = useMemo(() => {
        const map: Record<string, number> = {};
        students.forEach(s => { const yr = `Year ${s.currentYear || '?'}`; map[yr] = (map[yr] || 0) + 1; });
        return Object.entries(map).map(([year, count]) => ({ year, count })).sort((a, b) => a.year.localeCompare(b.year));
    }, [students]);

    const topSkills = useMemo(() => {
        const map: Record<string, number> = {};
        students.forEach(s => {
            const skills = s.techSkills || s.skills || [];
            skills.forEach((sk: string) => { map[sk] = (map[sk] || 0) + 1; });
        });
        return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 8).map(([skill, count]) => ({ skill, count }));
    }, [students]);

    const needsAttention = useMemo(() =>
        students.filter(s =>
            parseCgpa(s.cgpa) < 7 ||
            !s.projects || (s.projects as unknown[]).length === 0 ||
            ((!s.techSkills || s.techSkills.length === 0) && (!s.skills || s.skills.length === 0))
        ).slice(0, 10),
        [students]
    );

    const upcomingInterviews = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return interviews.filter(iv => {
            if (!iv.scheduledDate) return false;
            const d = typeof iv.scheduledDate === 'object' && 'seconds' in iv.scheduledDate
                ? new Date((iv.scheduledDate as { seconds: number }).seconds * 1000)
                : new Date(iv.scheduledDate as string);
            return !isNaN(d.getTime()) && d >= today;
        }).slice(0, 6);
    }, [interviews]);

    const readiness = useMemo(() => {
        const complete = students.filter(s =>
            !!s.resumeUrl &&
            ((s.techSkills?.length || 0) + (s.skills?.length || 0)) > 0 &&
            (s.projects as unknown[] || []).length > 0
        ).length;
        return [
            { label: 'Profile Complete', value: complete, color: '#10b981' },
            { label: 'Incomplete', value: students.length - complete, color: '#ef4444' },
        ];
    }, [students]);

    const formatDate = (d: string | { seconds: number } | undefined) => {
        if (!d) return 'TBD';
        const dt = typeof d === 'object' && 'seconds' in d ? new Date(d.seconds * 1000) : new Date(d as string);
        return isNaN(dt.getTime()) ? 'TBD' : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
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
                        { label: 'Students', icon: GraduationCap, path: '/faculty/students', color: 'text-blue-700 bg-blue-100' },
                        { label: 'Batch Analytics', icon: BarChart3, path: '/faculty/batch-analytics', color: 'text-violet-700 bg-violet-100' },
                        { label: 'Reports', icon: FileText, path: '/faculty/reports', color: 'text-emerald-700 bg-emerald-100' },
                        { label: 'Settings', icon: Settings, path: '/faculty/settings', color: 'text-amber-700 bg-amber-100' },
                    ].map((a, i) => (
                        <NavLink key={i} to={a.path} className="flex flex-col items-center justify-center p-4 card-nmims hover:bg-secondary/50 hover:border-primary/30 transition-all group text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${a.color}`}><a.icon className="w-5 h-5" /></div>
                            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{a.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Students" value={kpis.total} subtitle="Registered" icon={Users} colorClass="text-violet-700 bg-violet-100 border-violet-200" loading={isLoading} />
                <KpiCard title="Resume Uploaded" value={kpis.withResume} subtitle="Have resume on file" icon={BookOpen} colorClass="text-blue-700 bg-blue-100 border-blue-200" loading={isLoading} />
                <KpiCard title="Avg CGPA" value={isLoading ? '...' : kpis.avgCgpa.toFixed(2)} subtitle="Across all students" icon={Award} colorClass="text-emerald-700 bg-emerald-100 border-emerald-200" loading={isLoading} />
                <KpiCard title="Need Mentoring" value={kpis.noInternships} subtitle="No internships yet" icon={AlertTriangle} colorClass="text-amber-700 bg-amber-100 border-amber-200" loading={isLoading} />
            </div>

            {/* Mentorship Action Desk */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Academic Intervention */}
                <div className="lg:col-span-1 card-nmims p-6 border-l-4 border-l-rose-500/50">
                    <SectionHeader icon={AlertTriangle} title="Student Flagging" />
                    <div className="space-y-4 mt-4">
                        <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                             <p className="text-xs font-bold text-rose-700 uppercase tracking-tight mb-1">Attention Required</p>
                             <p className="text-[10px] text-rose-600 leading-relaxed font-medium">
                                 {kpis.noInternships} students flagged for missing internships. Immediate intervention recommended.
                             </p>
                        </div>
                        <button className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-500/20">
                             Batch Intervention <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Session Notes */}
                <div className="lg:col-span-2 card-nmims p-6 border-l-4 border-l-emerald-500/50 relative overflow-hidden">
                    <div className="absolute top-[-20px] right-[-20px] opacity-[0.03]">
                        <Users className="w-32 h-32" />
                    </div>
                    <SectionHeader icon={FileText} title="Mentorship Journal" />
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <textarea 
                                placeholder="Log private notes from your recent student mentoring sessions..."
                                className="w-full h-24 p-4 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none font-medium placeholder:text-muted-foreground/50 transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-2 justify-end items-center sm:items-stretch">
                            <button className="flex items-center justify-center p-4 rounded-xl shadow-xl bg-emerald-600 hover:bg-emerald-700 transition-all text-white">
                                <Send className="w-5 h-5" />
                            </button>
                            <span className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-tighter">Save Private Log</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Batch SWOC Section */}
            {!isLoading && kpis.total > 0 && (
                <BatchSWOCSection 
                    batchData={{
                        total: kpis.total,
                        avgCgpa: kpis.avgCgpa,
                        topSkills: topSkills.map(s => s.skill),
                        placementRate: kpis.placementRate,
                        internshipRate: kpis.internshipRate,
                        careerTracks: []
                    }}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-nmims p-6">
                    <SectionHeader icon={Users} title="Year-wise Student Count" />
                    {isLoading ? <div className="h-52 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : yearData.length === 0 ? <div className="h-52 flex flex-col items-center justify-center text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No data</p></div>
                        : <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={yearData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                <Tooltip {...TT} />
                                <Bar dataKey="count" name="Students" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>}
                </div>
                <div className="card-nmims p-6">
                    <SectionHeader icon={Code2} title="Top Skills in Batch" />
                    {isLoading ? <div className="h-52 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        : topSkills.length === 0 ? <div className="h-52 flex flex-col items-center justify-center text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No skill data</p></div>
                        : <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={topSkills} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                <YAxis dataKey="skill" type="category" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={60} />
                                <Tooltip {...TT} />
                                <Bar dataKey="count" name="Students" radius={[0, 4, 4, 0]}>
                                    {topSkills.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card-nmims p-6 lg:col-span-2">
                    <SectionHeader icon={AlertTriangle} title="Students Needing Attention" linkTo="/faculty/students" />
                    {isLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-secondary animate-pulse rounded-lg" />)}</div>
                        : needsAttention.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">All students on track</p></div>
                        : <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-border">
                                    <th className="text-left py-2 text-xs text-muted-foreground font-semibold">Student</th>
                                    <th className="text-left py-2 text-xs text-muted-foreground font-semibold">Branch</th>
                                    <th className="text-right py-2 text-xs text-muted-foreground font-semibold">CGPA</th>
                                    <th className="text-right py-2 text-xs text-muted-foreground font-semibold">Issues</th>
                                </tr></thead>
                                <tbody>
                                    {needsAttention.map((s, i) => {
                                        const issues = [];
                                        if (parseCgpa(s.cgpa) < 7) issues.push('Low CGPA');
                                        if (!s.projects || (s.projects as unknown[]).length === 0) issues.push('No projects');
                                        if ((!s.techSkills || s.techSkills.length === 0) && (!s.skills || s.skills.length === 0)) issues.push('No skills');
                                        return (
                                            <tr key={i} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                                                <td className="py-2.5 font-medium text-foreground">{s.name || 'Unknown'}</td>
                                                <td className="py-2.5 text-muted-foreground text-xs">{s.branch || '—'}</td>
                                                <td className="py-2.5 text-right"><span className={`font-semibold ${parseCgpa(s.cgpa) >= 7 ? 'text-emerald-600' : 'text-rose-600'}`}>{parseCgpa(s.cgpa).toFixed(2)}</span></td>
                                                <td className="py-2.5 text-right"><div className="flex gap-1 justify-end flex-wrap">{issues.map((iss, j) => <span key={j} className="text-xs px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">{iss}</span>)}</div></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>}
                </div>

                <div className="card-nmims p-6">
                    <SectionHeader icon={Calendar} title="Upcoming Interviews" />
                    {isLoading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-secondary animate-pulse rounded-xl" />)}</div>
                        : upcomingInterviews.length === 0 ? <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2"><Inbox className="w-8 h-8" /><p className="text-sm">No upcoming interviews</p></div>
                        : <div className="space-y-2">
                            {upcomingInterviews.map((iv, i) => (
                                <div key={i} className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors">
                                    <p className="font-medium text-foreground text-sm">{iv.companyName || 'Company'}</p>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-muted-foreground">{iv.roundType || 'Round'}</span>
                                        <span className="text-xs text-primary font-medium">{formatDate(iv.scheduledDate)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>}

                    <div className="mt-5 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground font-semibold mb-3">Student Readiness</p>
                        {readiness.map((r, i) => (
                            <div key={i} className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">{r.label}</span>
                                    <span className="font-semibold text-foreground">{isLoading ? '...' : r.value}</span>
                                </div>
                                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: students.length > 0 ? `${(r.value / students.length) * 100}%` : '0%', background: r.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">Last refreshed: {lastRefreshed.toLocaleTimeString()}</p>
        </div>
    );
};
