import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Award, Code, BookOpen, Briefcase, Target, Brain } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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
    }, []);

    const fetchBatchData = async () => {
        try {
            setIsLoading(true);
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('role', '==', 'student'),
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

    // Skill distribution
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

    // CGPA distribution
    const getCGPADistribution = () => {
        const ranges = [
            { range: '9.0+', min: 9.0, max: 10.0, count: 0 },
            { range: '8.0-8.9', min: 8.0, max: 8.9, count: 0 },
            { range: '7.0-7.9', min: 7.0, max: 7.9, count: 0 },
            { range: '6.0-6.9', min: 6.0, max: 6.9, count: 0 },
            { range: '<6.0', min: 0, max: 5.9, count: 0 }
        ];

        students.forEach(student => {
            const cgpa = parseFloat(student.cgpa || '0');
            const range = ranges.find(r => cgpa >= r.min && cgpa <= r.max);
            if (range) range.count++;
        });

        return ranges.map(r => ({ name: r.range, value: r.count }));
    };

    // LeetCode distribution
    const getLeetCodeDistribution = () => {
        const ranges = [
            { range: '100+', min: 100, max: 1000, count: 0 },
            { range: '50-99', min: 50, max: 99, count: 0 },
            { range: '20-49', min: 20, max: 49, count: 0 },
            { range: '1-19', min: 1, max: 19, count: 0 },
            { range: '0', min: 0, max: 0, count: 0 }
        ];

        students.forEach(student => {
            const solved = student.leetcodeStats?.totalSolved || 0;
            const range = ranges.find(r => solved >= r.min && solved <= r.max);
            if (range) range.count++;
        });

        return ranges.map(r => ({ name: r.range, value: r.count }));
    };

    // Readiness radar
    const getReadinessRadar = () => {
        return [
            { category: 'CGPA', value: (stats.avgCGPA / 10) * 100 },
            { category: 'LeetCode', value: Math.min((stats.avgLeetCode / 100) * 100, 100) },
            { category: 'Projects', value: Math.min((stats.avgProjects / 5) * 100, 100) },
            { category: 'Certifications', value: Math.min((stats.avgCertifications / 5) * 100, 100) },
            { category: 'Internships', value: (stats.withInternships / stats.totalStudents) * 100 }
        ];
    };

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e'];

    if (isLoading) {
        return (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3 text-slate-400">Loading batch analytics...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Users className="h-7 w-7 text-primary" />
                            Batch Profile Analysis
                        </h2>
                        <p className="text-slate-400 mt-1">
                            {branch} • Batch {batchYear}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black text-primary">{stats.totalStudents}</div>
                        <div className="text-sm text-slate-400">Total Students</div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-slate-400">Avg CGPA</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.avgCGPA.toFixed(2)}</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-slate-400">Avg LeetCode</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{Math.round(stats.avgLeetCode)}</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-slate-400">Avg Projects</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.avgProjects.toFixed(1)}</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-purple-500" />
                        <span className="text-xs text-slate-400">Avg Certs</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.avgCertifications.toFixed(1)}</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-orange-500" />
                        <span className="text-xs text-slate-400">Internships</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.withInternships}</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-pink-500" />
                        <span className="text-xs text-slate-400">Ready</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.placementReady}</div>
                    <div className="text-xs text-slate-400 mt-1">
                        {stats.totalStudents > 0 ? Math.round((stats.placementReady / stats.totalStudents) * 100) : 0}%
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Distribution */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Top Skills Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getSkillDistribution()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} angle={-45} textAnchor="end" height={80} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                labelStyle={{ color: '#f1f5f9' }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* CGPA Distribution */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        CGPA Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={getCGPADistribution()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {getCGPADistribution().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* LeetCode Distribution */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Code className="h-5 w-5 text-green-500" />
                        LeetCode Problems Solved
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getLeetCodeDistribution()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                labelStyle={{ color: '#f1f5f9' }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Readiness Radar */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-pink-500" />
                        Batch Readiness Score
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={getReadinessRadar()}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                            <PolarRadiusAxis stroke="#94a3b8" fontSize={12} />
                            <Radar name="Readiness" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
