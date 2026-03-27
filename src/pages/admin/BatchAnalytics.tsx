import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
    Users, GraduationCap, TrendingUp, Award, Loader2, 
    CheckCircle2, ChevronDown, ExternalLink, 
    Code, Briefcase
} from 'lucide-react';

interface BatchStats {
    totalStudents: number;
    batch2022_26: number;
    fourthYear: number;
    csdsStudents: number;
    avgCGPA: number;
    topPerformers: any[];
    skillDistribution: { [key: string]: number };
}

export const BatchAnalytics = () => {
    const [stats, setStats] = useState<BatchStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

    useEffect(() => {
        fetchBatchData();
    }, []);

    const fetchBatchData = async () => {
        setIsLoading(true);
        try {
            const studentsRef = collection(db, 'students');
            const q = query(studentsRef);
            const querySnapshot = await getDocs(q);
            
            const allStudents: any[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setStudents(allStudents);

            const batch2022_26 = allStudents.filter(s => s.batch === '2022-2026').length;
            const fourthYear = allStudents.filter(s => s.currentYear === 4).length;
            const csdsStudents = allStudents.filter(s => 
                s.branch?.includes('CSE') && s.branch?.includes('Data Science')
            ).length;

            const cgpaValues = allStudents
                .filter(s => s.cgpa)
                .map(s => parseFloat(s.cgpa));
            const avgCGPA = cgpaValues.length > 0 
                ? cgpaValues.reduce((a, b) => a + b, 0) / cgpaValues.length 
                : 0;

            const topPerformers = allStudents
                .filter(s => s.cgpa)
                .sort((a, b) => parseFloat(b.cgpa) - parseFloat(a.cgpa))
                .slice(0, 10);

            const skillDistribution: { [key: string]: number } = {};
            allStudents.forEach(student => {
                if (student.techSkills && Array.isArray(student.techSkills)) {
                    student.techSkills.forEach((skill: string) => {
                        skillDistribution[skill] = (skillDistribution[skill] || 0) + 1;
                    });
                }
            });

            setStats({
                totalStudents: allStudents.length,
                batch2022_26,
                fourthYear,
                csdsStudents,
                avgCGPA,
                topPerformers,
                skillDistribution
            });
        } catch (error) {
            console.error('Error fetching batch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Analyzing batch performance...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-6">
                <div className="text-center text-muted-foreground p-12 bg-card rounded-2xl border border-dashed">
                    No analytics data available
                </div>
            </div>
        );
    }

    const topSkills = Object.entries(stats.skillDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        Batch Analytics
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        B.Tech CSE (Data Science) 2022-2026 Overview
                    </p>
                </div>
            </div>

            {/* Success Banner — Modern Light Theme */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="font-bold text-emerald-900">
                            {stats.totalStudents} Student Profiles Created Successfully!
                        </p>
                        <p className="text-sm text-emerald-700">
                            All batch data has been seeded and is ready for placement evaluation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid — Student dashboard style white cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black uppercase text-slate-400 tracking-wide">Total Pool</p>
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.totalStudents}</p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">Registered Students</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black uppercase text-slate-400 tracking-wide">Target Batch</p>
                        <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl group-hover:scale-110 transition-transform">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.batch2022_26}</p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">2022-2026 Cohort</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black uppercase text-slate-400 tracking-wide">Placement Readiness</p>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.fourthYear}</p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">Final Year Candidates</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black uppercase text-slate-400 tracking-wide">Acad. Performance</p>
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Award className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.avgCGPA.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">Mean Batch CGPA</p>
                </div>
            </div>

            {/* Batch Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Top Performers Table */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Top Performers
                    </h2>
                    <div className="space-y-3">
                        {stats.topPerformers.map((student, index) => (
                            <div 
                                key={student.id} 
                                className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors border border-transparent hover:border-border"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                        index === 0 ? 'bg-amber-100 text-amber-700' :
                                        index === 1 ? 'bg-slate-200 text-slate-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                        'bg-primary/5 text-primary'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">{student.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">{student.sapId || student.rollNo}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-primary text-base">{student.cgpa}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">CGPA</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skill Mastery Distribution */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Skill Mastery Distribution
                    </h2>
                    <div className="space-y-5">
                        {topSkills.map(([skill, count], idx) => {
                            const barColors = [
                                'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 
                                'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
                                'bg-teal-500', 'bg-orange-500', 'bg-cyan-500', 'bg-pink-500'
                            ];
                            const colorClass = barColors[idx % barColors.length];
                            
                            return (
                                <div key={skill} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-foreground uppercase tracking-tight">{skill}</span>
                                        <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                            {count} students
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden shadow-inner">
                                        <div 
                                            className={`${colorClass} h-full rounded-full transition-all duration-1000`}
                                            style={{ width: `${(count / stats.totalStudents) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Complete Student List */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-secondary/10">
                    <h2 className="text-xl font-bold text-foreground">Candidate Evaluation Pool</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Detailed analysis of individual candidate metrics
                    </p>
                </div>
                <div className="divide-y divide-border">
                    {students.map((student) => (
                        <div key={student.id} className="group">
                            <div 
                                className="flex items-center justify-between p-5 hover:bg-secondary/30 cursor-pointer transition-colors"
                                onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-black shadow-md shadow-primary/20">
                                        {student.name?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{student.name}</h3>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium mt-0.5">
                                            <span>{student.sapId || student.rollNo}</span>
                                            <span className="opacity-30">|</span>
                                            <span>{student.email}</span>
                                            <span className="opacity-30">|</span>
                                            <span className="text-primary font-bold">CGPA: {student.cgpa || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-lg bg-secondary/50 text-muted-foreground group-hover:text-primary transition-all ${expandedStudent === student.id ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
                                    <ChevronDown className="h-5 w-5" />
                                </div>
                            </div>

                            {expandedStudent === student.id && (
                                <div className="p-6 bg-secondary/10 border-t border-border space-y-6 animate-fade-in-up">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Branch</p>
                                            <p className="font-bold text-slate-700">{student.branch || 'N/A'}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Current Year</p>
                                            <p className="font-bold text-slate-700">{student.currentYear || 'N/A'}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Cohort Batch</p>
                                            <p className="font-bold text-slate-700">{student.batch || 'N/A'}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Contact</p>
                                            <p className="font-bold text-slate-700 text-xs truncate">{student.phone || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {student.bio && (
                                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mt-6">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Professional Bio</p>
                                            <p className="text-sm text-slate-600 leading-relaxed italic">"{student.bio}"</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                                            <p className="text-[10px] font-black uppercase text-indigo-400 mb-1 tracking-widest">Career Track Focus</p>
                                            <p className="font-bold text-indigo-900 flex items-center gap-2">
                                                {student.careerTrackEmoji} {student.careerTrack || 'General Focus'}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                                            <p className="text-[10px] font-black uppercase text-emerald-400 mb-1 tracking-widest">LeetCode Mastery</p>
                                            <p className="font-bold text-emerald-900">
                                                {student.leetcodeStats?.totalSolved || 0} Problems Solved
                                            </p>
                                        </div>
                                    </div>

                                    {/* Skills Section */}
                                    {student.techSkills && student.techSkills.length > 0 && (
                                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                                <Award className="h-4 w-4 text-blue-600" />
                                                Candidate Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {student.techSkills.map((skill: string, idx: number) => (
                                                    <span key={idx} className="bg-blue-50/50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-tighter">
                                                        {typeof skill === 'string' ? skill : (skill as any).name || 'Unknown Skill'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects & Internships & Achievements */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {student.projects && student.projects.length > 0 && (
                                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                                <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                                    <Code className="h-4 w-4 text-primary" />
                                                    Applied Projects
                                                </h4>
                                                <div className="space-y-4">
                                                    {student.projects.slice(0, 3).map((p: any, idx: number) => (
                                                        <div key={idx} className="group/item">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-bold text-sm text-slate-800">{p.title}</p>
                                                                {p.link && <ExternalLink className="h-3 w-3 text-muted-foreground group-hover/item:text-primary" />}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {student.internships && student.internships.length > 0 && (
                                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                                <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                                    <Briefcase className="h-4 w-4 text-violet-600" />
                                                    Professional Experience
                                                </h4>
                                                <div className="space-y-4">
                                                    {student.internships.slice(0, 3).map((i: any, idx: number) => (
                                                        <div key={idx}>
                                                            <p className="font-bold text-sm text-slate-800">{i.role}</p>
                                                            <p className="text-xs text-primary font-bold">{i.company}</p>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-tighter">{i.period}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {student.achievements && student.achievements.length > 0 && (
                                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm md:col-span-2">
                                                <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-amber-500" />
                                                    Achievements & Recognitions
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {student.achievements.map((ach: any, idx: number) => (
                                                        <div key={idx} className="p-3 bg-secondary/20 rounded-xl border border-border/50">
                                                            <p className="font-bold text-sm text-slate-800">{ach.title}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ach.description}</p>
                                                            {ach.year && <span className="text-[10px] font-black text-amber-600 uppercase mt-2 block">{ach.year}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Summary Section */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-primary mb-3">Analytical Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <p className="text-slate-600 font-medium">{stats.totalStudents} student records verified</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <p className="text-slate-600 font-medium">{stats.csdsStudents} Specialization matches</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <p className="text-slate-600 font-medium">Ready for demo presentation!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
