import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, GraduationCap, TrendingUp, Award, Loader2, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Code, Briefcase, FileText, Trophy } from 'lucide-react';

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
            // Fetch all students
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('role', '==', 'student'));
            const querySnapshot = await getDocs(q);
            
            const allStudents = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setStudents(allStudents);

            // Calculate stats
            const batch2022_26 = allStudents.filter(s => s.batch === '2022-2026').length;
            const fourthYear = allStudents.filter(s => s.currentYear === 4).length;
            const csdsStudents = allStudents.filter(s => 
                s.branch?.includes('CSE') && s.branch?.includes('Data Science')
            ).length;

            // Calculate average CGPA
            const cgpaValues = allStudents
                .filter(s => s.cgpa)
                .map(s => parseFloat(s.cgpa));
            const avgCGPA = cgpaValues.length > 0 
                ? cgpaValues.reduce((a, b) => a + b, 0) / cgpaValues.length 
                : 0;

            // Get top performers
            const topPerformers = allStudents
                .filter(s => s.cgpa)
                .sort((a, b) => parseFloat(b.cgpa) - parseFloat(a.cgpa))
                .slice(0, 10);

            // Skill distribution
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading batch analytics...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-6">
                <div className="text-center text-muted-foreground">
                    No data available
                </div>
            </div>
        );
    }

    const topSkills = Object.entries(stats.skillDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    Batch Analytics
                </h1>
                <p className="text-muted-foreground mt-1">
                    B.Tech CSE (Data Science) 2022-2026 Batch Overview
                </p>
            </div>

            {/* Success Banner */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                        <p className="font-bold text-green-900">
                            {stats.totalStudents} Student Profiles Created Successfully!
                        </p>
                        <p className="text-sm text-green-700">
                            All batch data has been seeded and is ready for demo
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="h-8 w-8 opacity-80" />
                    </div>
                    <p className="text-4xl font-black mb-1">{stats.totalStudents}</p>
                    <p className="text-sm opacity-90">Total Students</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <GraduationCap className="h-8 w-8 opacity-80" />
                    </div>
                    <p className="text-4xl font-black mb-1">{stats.batch2022_26}</p>
                    <p className="text-sm opacity-90">Batch 2022-2026</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="h-8 w-8 opacity-80" />
                    </div>
                    <p className="text-4xl font-black mb-1">{stats.fourthYear}</p>
                    <p className="text-sm opacity-90">4th Year Students</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <Award className="h-8 w-8 opacity-80" />
                    </div>
                    <p className="text-4xl font-black mb-1">{stats.avgCGPA.toFixed(2)}</p>
                    <p className="text-sm opacity-90">Average CGPA</p>
                </div>
            </div>

            {/* Batch Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Top 10 Performers (by CGPA)
                    </h2>
                    <div className="space-y-2">
                        {stats.topPerformers.map((student, index) => (
                            <div 
                                key={student.id} 
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                        index === 1 ? 'bg-gray-300 text-gray-700' :
                                        index === 2 ? 'bg-orange-400 text-orange-900' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{student.name}</p>
                                        <p className="text-xs text-muted-foreground">{student.sapId || student.rollNo}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">{student.cgpa}</p>
                                    <p className="text-xs text-muted-foreground">CGPA</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Skills */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Top 10 Skills in Batch
                    </h2>
                    <div className="space-y-3">
                        {topSkills.map(([skill, count], index) => (
                            <div key={skill}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{skill}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {count} students
                                    </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                    <div 
                                        className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${(count / stats.totalStudents) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Complete Student List with Details */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Complete Student Profiles</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Click on any student to view their complete profile details
                </p>
                <div className="space-y-2">
                    {students.map((student) => (
                        <div key={student.id} className="border rounded-lg overflow-hidden">
                            {/* Student Header - Clickable */}
                            <div 
                                className="flex items-center justify-between p-4 hover:bg-secondary/50 cursor-pointer transition-colors"
                                onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                                        {student.name?.charAt(0) || 'S'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{student.name}</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{student.sapId || student.rollNo}</span>
                                            <span>•</span>
                                            <span>{student.email}</span>
                                            <span>•</span>
                                            <span className="font-semibold text-primary">CGPA: {student.cgpa || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {expandedStudent === student.id ? (
                                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedStudent === student.id && (
                                <div className="p-6 bg-secondary/20 border-t space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Branch</p>
                                            <p className="font-semibold">{student.branch || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Year</p>
                                            <p className="font-semibold">{student.currentYear || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Batch</p>
                                            <p className="font-semibold">{student.batch || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                            <p className="font-semibold">{student.phone || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* LeetCode Stats */}
                                    {student.leetcodeStats && (
                                        <div className="bg-white rounded-lg p-4 border">
                                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                                <Code className="h-4 w-4 text-orange-500" />
                                                LeetCode Statistics
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-primary">{student.leetcodeStats.totalSolved || 0}</p>
                                                    <p className="text-xs text-muted-foreground">Total Solved</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-green-600">{student.leetcodeStats.easySolved || 0}</p>
                                                    <p className="text-xs text-muted-foreground">Easy</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-yellow-600">{student.leetcodeStats.mediumSolved || 0}</p>
                                                    <p className="text-xs text-muted-foreground">Medium</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-red-600">{student.leetcodeStats.hardSolved || 0}</p>
                                                    <p className="text-xs text-muted-foreground">Hard</p>
                                                </div>
                                                <div className="text-center">
                                                    {student.leetcode && (
                                                        <a 
                                                            href={`https://leetcode.com/${student.leetcode}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary hover:underline flex items-center justify-center gap-1"
                                                        >
                                                            View Profile <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {student.techSkills && student.techSkills.length > 0 && (
                                        <div className="bg-white rounded-lg p-4 border">
                                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                                <Award className="h-4 w-4 text-blue-500" />
                                                Technical Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {student.techSkills.map((skill: string, index: number) => (
                                                    <span 
                                                        key={index}
                                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects */}
                                    {student.projects && student.projects.length > 0 && (
                                        <div className="bg-white rounded-lg p-4 border">
                                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-purple-500" />
                                                Projects ({student.projects.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {student.projects.slice(0, 5).map((project: any, index: number) => (
                                                    <div key={index} className="border-l-2 border-purple-500 pl-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-sm">{project.title}</p>
                                                                <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                                                                {project.tech && (
                                                                    <p className="text-xs text-primary mt-1">Tech: {project.tech}</p>
                                                                )}
                                                            </div>
                                                            {project.link && (
                                                                <a 
                                                                    href={project.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary hover:underline ml-2"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {student.projects.length > 5 && (
                                                    <p className="text-xs text-muted-foreground text-center">
                                                        ... and {student.projects.length - 5} more projects
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Certifications */}
                                    {student.certifications && student.certifications.length > 0 && (
                                        <div className="bg-white rounded-lg p-4 border">
                                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                                <Award className="h-4 w-4 text-green-500" />
                                                Certifications ({student.certifications.length})
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {student.certifications.map((cert: any, index: number) => (
                                                    <div key={index} className="flex items-start gap-2 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-semibold">{cert.name}</p>
                                                            <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Internships */}
                                    {student.internships && student.internships.length > 0 && (
                                        <div className="bg-white rounded-lg p-4 border">
                                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-indigo-500" />
                                                Internships ({student.internships.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {student.internships.map((internship: any, index: number) => (
                                                    <div key={index} className="border-l-2 border-indigo-500 pl-3">
                                                        <p className="font-semibold text-sm">{internship.role}</p>
                                                        <p className="text-xs text-muted-foreground">{internship.company} • {internship.period}</p>
                                                        <p className="text-xs mt-1">{internship.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Achievements */}
                                    {student.achievements && student.achievements.length > 0 && (
                                        <div className="bg-white rounded-lg p-4 border">
                                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-yellow-500" />
                                                Achievements ({student.achievements.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {student.achievements.map((achievement: any, index: number) => (
                                                    <div key={index} className="flex items-start gap-2 text-sm">
                                                        <Trophy className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-semibold">{achievement.title}</p>
                                                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Social Links */}
                                    <div className="bg-white rounded-lg p-4 border">
                                        <h4 className="font-bold mb-3">Links</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {student.githubUrl && (
                                                <a 
                                                    href={student.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                                                >
                                                    <Code className="h-4 w-4" />
                                                    GitHub
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {student.linkedinUrl && (
                                                <a 
                                                    href={student.linkedinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm transition-colors"
                                                >
                                                    <Users className="h-4 w-4" />
                                                    LinkedIn
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {student.leetcode && (
                                                <a 
                                                    href={`https://leetcode.com/${student.leetcode}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-2 bg-orange-100 hover:bg-orange-200 rounded-lg text-sm transition-colors"
                                                >
                                                    <Code className="h-4 w-4" />
                                                    LeetCode
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-2">Summary</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ {stats.totalStudents} student profiles successfully created</li>
                    <li>✓ {stats.csdsStudents} CSE (Data Science) students</li>
                    <li>✓ {stats.fourthYear} students in 4th year</li>
                    <li>✓ Average CGPA: {stats.avgCGPA.toFixed(2)}</li>
                    <li>✓ All profiles include skills, projects, certifications, and achievements</li>
                    <li>✓ Ready for demo presentation!</li>
                </ul>
            </div>
        </div>
    );
};
