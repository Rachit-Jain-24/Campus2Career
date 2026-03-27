import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Award, Code, BookOpen, Briefcase, Target, Brain, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface BatchStudent {
    name: string;
    cgpa: string;
    techSkills: string[];
    leetcodeStats?: {
        totalSolved: number;
    };
    projects?: any[];
    certifications?: any[];
    internships?: any[];
}

interface BatchAnalyticsProps {
    batchYear?: string;
    branch?: string;
}

export const BatchAnalytics: React.FC<BatchAnalyticsProps> = ({ 
    batchYear = '2022-2026', 
    branch = 'B.Tech CSE (Data Science)' 
}) => {
    const [students, setStudents] = useState<BatchStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        avgCGPA: 0,
        avgLeetCode: 0,
        avgProjects: 0,
        avgCertifications: 0,
        withInternships: 0,
        placementReady: 0
    });

    useEffect(() => {
        fetchBatchData();
    }, [batchYear, branch]);

    const fetchBatchData = async () => {
        try {
            setIsLoading(true);
            const studentsRef = collection(db, 'students');
            const q = query(
                studentsRef,
                where('batch', '==', batchYear),
                where('branch', '==', branch)
            );
            
            const querySnapshot = await getDocs(q);
            const studentsData: BatchStudent[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                studentsData.push({
                    name: data.name,
                    cgpa: data.cgpa || '0',
                    techSkills: data.techSkills || [],
                    leetcodeStats: data.leetcodeStats,
                    projects: data.projects || [],
                    certifications: data.certifications || [],
                    internships: data.internships || []
                });
            });

            setStudents(studentsData);
            calculateStats(studentsData);
        } catch (error) {
            console.error('Error fetching batch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (studentsData: BatchStudent[]) => {
        const total = studentsData.length;
        if (total === 0) {
            setStats({
                totalStudents: 0,
                avgCGPA: 0,
                avgLeetCode: 0,
                avgProjects: 0,
                avgCertifications: 0,
                withInternships: 0,
                placementReady: 0
            });
            return;
        }

        const totalCGPA = studentsData.reduce((sum, s) => sum + parseFloat(s.cgpa || '0'), 0);
        const totalLeetCode = studentsData.reduce((sum, s) => sum + (s.leetcodeStats?.totalSolved || 0), 0);
        const totalProjects = studentsData.reduce((sum, s) => sum + (s.projects?.length || 0), 0);
        const totalCerts = studentsData.reduce((sum, s) => sum + (s.certifications?.length || 0), 0);
        const withInternships = studentsData.filter(s => s.internships && s.internships.length > 0).length;
        const placementReady = studentsData.filter(s => 
            parseFloat(s.cgpa || '0') >= 7.0 && 
            (s.leetcodeStats?.totalSolved || 0) >= 20 &&
            (s.projects?.length || 0) >= 2
        ).length;

        setStats({
            totalStudents: total,
            avgCGPA: totalCGPA / total,
            avgLeetCode: totalLeetCode / total,
            avgProjects: totalProjects / total,
            avgCertifications: totalCerts / total,
            withInternships,
            placementReady
        });
    };

    const getSkillDistribution = () => {
        const skillCount: { [key: string]: number } = {};
        students.forEach(student => {
            student.techSkills?.forEach(skill => {
                skillCount[skill] = (skillCount[skill] || 0) + 1;
            });
        });

        return Object.entries(skillCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, value]) => ({ name, value }));
    };

    const getCGPADistribution = () => {
        const ranges = [
            { range: '9.0+', min: 9.0, max: 10.0 },
            { range: '8.0-8.9', min: 8.0, max: 8.9 },
            { range: '7.0-7.9', min: 7.0, max: 7.9 },
            { range: '6.0-6.9', min: 6.0, max: 6.9 },
            { range: '<6.0', min: 0, max: 5.9 }
        ].map(r => ({ ...r, count: 0 }));

        students.forEach(student => {
            const cgpa = parseFloat(student.cgpa || '0');
            const range = ranges.find(r => cgpa >= r.min && cgpa <= r.max);
            if (range) range.count++;
        });

        return ranges.map(r => ({ name: r.range, value: r.count }));
    };

    const getLeetCodeDistribution = () => {
        const ranges = [
            { range: '100+', min: 100, max: 1000 },
            { range: '50-99', min: 50, max: 99 },
            { range: '20-49', min: 20, max: 49 },
            { range: '1-19', min: 1, max: 19 },
            { range: '0', min: 0, max: 0 }
        ].map(r => ({ ...r, count: 0 }));

        students.forEach(student => {
            const solved = student.leetcodeStats?.totalSolved || 0;
            const range = ranges.find(r => solved >= r.min && solved <= r.max);
            if (range) range.count++;
        });

        return ranges.map(r => ({ name: r.range, value: r.count }));
    };

    const getReadinessRadar = () => {
        return [
            { category: 'CGPA', value: (stats.avgCGPA / 10) * 100 },
            { category: 'LeetCode', value: Math.min((stats.avgLeetCode / 100) * 100, 100) },
            { category: 'Projects', value: Math.min((stats.avgProjects / 5) * 100, 100) },
            { category: 'Certifications', value: Math.min((stats.avgCertifications / 5) * 100, 100) },
            { category: 'Internships', value: (stats.totalStudents > 0 ? (stats.withInternships / stats.totalStudents) : 0) * 100 }
        ];
    };

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e'];

    // Custom Tooltip component for consistent styling
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-border shadow-xl rounded-xl">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-bold text-primary">
                        {payload[0].value} {payload[0].name === 'value' ? 'Students' : ''}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center shadow-sm">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Gathering Batch Insights...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-primary/10 rounded-xl">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Batch Profile Analysis</h2>
                        </div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            {branch} • Class of {batchYear}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-secondary/30 px-6 py-4 rounded-2xl border border-border/50">
                        <div className="text-right">
                            <div className="text-3xl font-black text-primary leading-none">{stats.totalStudents}</div>
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Total Strength</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Avg CGPA', value: stats.avgCGPA.toFixed(2), icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Avg Solved', value: Math.round(stats.avgLeetCode), icon: Code, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Avg Projects', value: stats.avgProjects.toFixed(1), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Avg Certs', value: stats.avgCertifications.toFixed(1), icon: Award, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { label: 'Internships', value: stats.withInternships, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Ready', value: `${Math.round((stats.placementReady / (stats.totalStudents || 1)) * 100)}%`, icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' }
                ].map((item, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`p-1.5 rounded-lg ${item.bg}`}>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{item.label}</span>
                        </div>
                        <div className="text-2xl font-black text-slate-800">{item.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Skill Mastery */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            Skill Distribution
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getSkillDistribution()} margin={{ bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} fontWeight="bold" angle={-45} textAnchor="end" />
                                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} fontWeight="bold" />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-secondary)', opacity: 0.4 }} />
                                <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CGPA Spread */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-8 flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-500" />
                        Academic Performance
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getCGPADistribution()}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {getCGPADistribution().map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Technical Grit */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-8 flex items-center gap-2">
                        <Code className="h-5 w-5 text-emerald-500" />
                        Technical Grit (LeetCode)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getLeetCodeDistribution()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} fontWeight="bold" />
                                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} fontWeight="bold" />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-secondary)', opacity: 0.4 }} />
                                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Industry Readiness */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-8 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-rose-500" />
                        Industry Readiness
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={getReadinessRadar()}>
                                <PolarGrid stroke="var(--color-border)" />
                                <PolarAngleAxis dataKey="category" stroke="var(--color-muted-foreground)" fontSize={10} fontWeight="bold" />
                                <PolarRadiusAxis stroke="var(--color-border)" fontSize={10} />
                                <Radar name="Readiness" dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} strokeWidth={2} />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
