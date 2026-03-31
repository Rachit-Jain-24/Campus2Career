import { useEffect, useState } from 'react';
import {
    Sparkles,
    Target,
    TrendingUp,
    Zap,
    Award,
    ChevronRight,
    GraduationCap,
    Compass,
    Code2,
    Trophy,
    Users,
    FileText,
    LayoutGrid,
    CheckCircle2
} from 'lucide-react';
import { GaugeChart } from '../../components/charts/GaugeChart';
import { RadarChart } from '../../components/charts/RadarChart';
import { SWOCAnalysis } from '../../components/ui/SWOCAnalysis';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { fetchLeetCodeStats } from '../../lib/leetcode';
import { drivesDb } from '../../services/db/database.service';
import type { StudentUser } from '../../types/auth';
import type { AdminDriveProfile } from '../../types/driveAdmin';

export default function StudentDashboard() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeDrives, setActiveDrives] = useState<AdminDriveProfile[]>([]);
    const [isDrivesLoading, setIsDrivesLoading] = useState(true);

    // Real-time Drives Subscription
    useEffect(() => {
        const unsubscribe = drivesDb.onDrivesChange((drives) => {
            setActiveDrives(drives.filter(d => d.status === 'upcoming' || d.status === 'ongoing'));
            setIsDrivesLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Real-time Scoring Logic
    const calculateRealTimeScores = () => {
        if (!user) return { readiness: 0, placement: 0 };

        let crs = 0;
        if (user.bio) crs += 5;
        if (user.phone) crs += 5;
        if (user.githubUrl) crs += 5;
        if (user.linkedinUrl) crs += 5;

        const cgpa = parseFloat(user.cgpa || user.assessmentResults?.cgpa || "0");
        if (cgpa >= 9) crs += 20;
        else if (cgpa >= 8) crs += 15;
        else if (cgpa >= 7) crs += 10;

        const skillsCount = user.techSkills?.length || 0;
        if (skillsCount >= 10) crs += 20;
        else if (skillsCount >= 5) crs += 15;
        else if (skillsCount >= 2) crs += 10;

        const projectsCount = user.projects?.length || 0;
        if (projectsCount >= 4) crs += 25;
        else if (projectsCount >= 2) crs += 20;
        else if (projectsCount >= 1) crs += 10;

        const solved = user.leetcodeStats?.totalSolved || 0;
        if (solved >= 200) crs += 20;
        else if (solved >= 100) crs += 15;
        else if (solved >= 50) crs += 10;

        if (user.resumeUrl) crs += 10;

        let ps = 0;
        const internshipsCount = user.internships?.length || 0;
        if (internshipsCount >= 2) ps += 35;
        else if (internshipsCount === 1) ps += 25;

        const githubProjectsCount = (user as StudentUser).projects?.filter(p => !!p.link).length || 0;
        if (githubProjectsCount >= 2) ps += 20;

        if (solved >= 200) ps += 25;
        else if (solved >= 100) ps += 20;
        else if (solved >= 50) ps += 10;

        const certsCount = user.certifications?.length || 0;
        if (certsCount >= 2) ps += 15;
        else if (certsCount === 1) ps += 10;

        if (user.resumeUrl) ps += 10;

        return { readiness: Math.min(crs, 100), placement: Math.min(ps, 100) };
    };

    const handleSWOCUpdate = async (newSWOC: any) => {
        if (!user) return;
        try {
            await updateUser({
                ...user,
                assessmentResults: {
                    ...(user.assessmentResults || {}),
                    swoc: newSWOC
                }
            });
        } catch (error) {
            console.error("Failed to save SWOC update:", error);
        }
    };

    const { readiness: liveReadinessScore, placement: livePlacementScore } = calculateRealTimeScores();

    // Fetch real-time LeetCode stats
    useEffect(() => {
        if (!user || !user.leetcode) return;

        const lastUpdated = user.leetcodeStats?.lastUpdated || 0;
        const cooldown = 5 * 60 * 1000;
        if (Date.now() - lastUpdated < cooldown && user.leetcodeStats) return;

        const syncLeetCode = async () => {
            try {
                const stats = await fetchLeetCodeStats(user.leetcode!);
                if (stats && user) {
                    const hasChanged = !user.leetcodeStats ||
                        user.leetcodeStats.totalSolved !== stats.totalSolved ||
                        user.leetcodeStats.ranking !== stats.ranking ||
                        user.leetcodeStats.streak !== stats.streak;

                    if (hasChanged) {
                        updateUser({
                            ...user,
                            leetcodeStats: {
                                totalSolved: stats.totalSolved,
                                easySolved: stats.easySolved,
                                mediumSolved: stats.mediumSolved,
                                hardSolved: stats.hardSolved,
                                ranking: stats.ranking,
                                acceptanceRate: stats.acceptanceRate,
                                streak: stats.streak,
                                submissionCalendar: stats.submissionCalendar,
                                recentSubmissions: stats.recentSubmissions.map(s => ({
                                    title: s.title,
                                    titleSlug: s.titleSlug,
                                    timestamp: s.timestamp,
                                    statusDisplay: s.statusDisplay
                                })),
                                lastUpdated: Date.now()
                            }
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to sync leetcode data:", err);
            }
        };

        syncLeetCode();
    }, [user?.leetcode, user?.leetcodeStats?.totalSolved, updateUser]);

    const currentYear = user?.currentYear || 1;
    const yearLabel = currentYear === 1 ? '1st Year' : currentYear === 2 ? '2nd Year' : currentYear === 3 ? '3rd Year' : '4th Year';
    const modeLabel = currentYear <= 2 ? 'Foundation Mode' : 'Placement Preparation Mode';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        if (hour < 21) return "Good evening";
        return "Good night";
    };

    const getQuickStats = () => {
        const stats: any[] = [];
        
        // Add Live Drives Stat (Always first)
        stats.push({
            label: "Active Drives",
            value: isDrivesLoading ? "..." : activeDrives.length.toString(),
            icon: Zap,
            color: "text-amber-600",
            bg: "bg-amber-50",
            trend: "Live updates enabled"
        });

        stats.push({
            label: "LeetCode Solved",
            value: user?.leetcodeStats ? `${user.leetcodeStats.totalSolved}` : user?.leetcode ? "Syncing" : "Link",
            icon: Code2,
            color: "text-primary",
            bg: "bg-primary/5",
            trend: user?.leetcodeStats ? `Streak: ${user.leetcodeStats.streak || 0} days 🔥` : user?.leetcode ? "Fetching live data..." : "Connect in Profile"
        });

        const getProgressScore = () => {
            if (user?.assessmentResults) return 100;
            if (user?.profileCompleted) return 85;
            if (user?.careerDiscoveryCompleted) return 50;
            return 25;
        };

        const getResumeStrength = () => {
            if (!user?.resumeUrl) return "Needs Update";
            if ((user?.projects?.length || 0) >= 3) return "Strong";
            return "Moderate";
        };

        if (currentYear === 1) {
            stats.push({ label: "Foundation Score", value: `${getProgressScore()}/100`, icon: Target, color: "text-blue-600", bg: "bg-blue-50", trend: "Welcome to NMIMS!" });
            stats.push({ label: "Core Subject GPA", value: user?.cgpa || "N/A", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50", trend: "Track Semester 1" });
            stats.push({ label: "Club Participation", value: "None", icon: Users, color: "text-green-600", bg: "bg-green-50", trend: "Explore Societies" });
        } else if (currentYear === 2) {
            stats.push({ label: "Skill Foundation", value: user?.projects?.length || "0", icon: LayoutGrid, color: "text-purple-600", bg: "bg-purple-50", trend: "Project Building Phase" });
            stats.push({ label: "Certifications", value: user?.certifications?.length || "0", icon: Award, color: "text-green-600", bg: "bg-green-50", trend: "Industry Skills" });
            stats.push({ label: "Exploration", value: user?.assessmentResults ? "Done" : "Pending", icon: Compass, color: "text-blue-600", bg: "bg-blue-50", trend: "Career Discovery" });
        } else if (currentYear === 3) {
            stats.push({ label: "Readiness Score", value: `${liveReadinessScore}/100`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", trend: liveReadinessScore > 80 ? "Industry Ready!" : "Focus on Skills" });
            stats.push({ label: "Internships", value: user?.internships?.length?.toString() || "0", icon: Target, color: "text-blue-600", bg: "bg-blue-50", trend: "Industry Experience" });
            stats.push({ label: "Resume Strength", value: getResumeStrength(), icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50", trend: "ATS Optimized" });
        } else {
            stats.push({ label: "Placement Status", value: user?.placementStatus || "Preparing", icon: Trophy, color: "text-purple-600", bg: "bg-purple-50", trend: "Final Season" });
            stats.push({ label: "Placement Score", value: `${livePlacementScore}%`, icon: Sparkles, color: "text-green-600", bg: "bg-green-50", trend: "Ready" });
            stats.push({ label: "Resume Strength", value: getResumeStrength(), icon: FileText, color: "text-blue-600", bg: "bg-blue-50", trend: "ATS Optimized" });
        }
        return stats;
    };

    const quickStats = getQuickStats();

    const roadMapSteps = (() => {
        const steps: string[] = [];
        const solved = user?.leetcodeStats?.totalSolved || 0;
        const projects = user?.projects?.length || 0;
        if (currentYear <= 2) {
            if (solved < 50) steps.push("Solve 50 LeetCode problems");
            if (projects < 2) steps.push("Build 2 starter projects");
            steps.push("Join tech communities");
        } else {
            if (solved < 150) steps.push("150+ LeetCode problems");
            steps.push("Mock interviews");
            steps.push("Analyze resume ATS");
        }
        return steps.length ? steps : ["Stay updated with industry trends"];
    })();

    const techSkills: string[] = user?.techSkills || (user as any)?.interests || [];

    const detectCareerTrack = () => {
        if (techSkills.some(s => /react|next|html|css|tailwind/i.test(s))) return { track: "Frontend Developer", expected: ["React", "JavaScript", "HTML", "CSS", "API Integration", "Git"] };
        if (techSkills.some(s => /node|express|mongo|sql|api/i.test(s))) return { track: "Backend Developer", expected: ["Node.js", "Express", "Database Management", "API Design", "Git"] };
        if (techSkills.some(s => /python|tensorflow|pandas|ml|ai/i.test(s))) return { track: "Machine Learning Engineer", expected: ["Python", "Pandas", "Scikit", "TensorFlow", "Math Fundamentals"] };
        if (techSkills.some(s => /aws|docker|kubernetes|ci|cd/i.test(s))) return { track: "DevOps Engineer", expected: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"] };
        return { track: "Software Engineer", expected: ["Data Structures", "Algorithms", "OOP", "Git", "Databases"] };
    };

    const careerTrackData = detectCareerTrack();
    const missingSkills = careerTrackData.expected.filter(reqSkill => !techSkills.some(userSkill => new RegExp(reqSkill.split(' ')[0], 'i').test(userSkill)));

    const getSkillScore = (pattern: RegExp) => {
        const matches = techSkills.filter(s => pattern.test(s)).length;
        if (matches >= 3) return 90;
        if (matches >= 2) return 75;
        if (matches === 1) return 50;
        return 30;
    };

    const derivedSkills = [
        { skill: "Frontend", value: getSkillScore(/react|html|css|next|angular/i) },
        { skill: "Backend", value: getSkillScore(/node|express|django|spring|api/i) },
        { skill: "DSA", value: Math.max(30, Math.min(90, 30 + (user?.leetcodeStats?.totalSolved || 0) / 2)) },
        { skill: "DevOps", value: getSkillScore(/docker|kubernetes|aws|ci\/cd|git/i) },
        { skill: "Fundamentals", value: Math.max(30, Math.min(90, (user?.profileCompleted ? 40 : 20) + (parseFloat(user?.cgpa || user?.assessmentResults?.cgpa || "0") * 5))) },
    ];

    const getRecommendedActions = () => {
        const actions: any[] = [];
        const solved = user?.leetcodeStats?.totalSolved || 0;
        const projects = user?.projects?.length || 0;
        const skillsCount = user?.techSkills?.length || 0;
        const internships = user?.internships?.length || 0;

        if (solved < 50) actions.push({ id: 1, title: "Start Daily Coding", desc: "Solve 2 problems daily to build your logic.", icon: Code2, color: "text-primary", bg: "bg-primary/10", link: "/student/leetcode" });
        if (projects < 2) actions.push({ id: 2, title: "Build Core Projects", desc: "Add robust projects to your profile to stand out.", icon: LayoutGrid, color: "text-slate-800", bg: "bg-slate-100", link: "/student/profile" });
        if (skillsCount < 3) actions.push({ id: 3, title: "Expand Skill Stack", desc: "Learn new domains aligned with your career goal.", icon: Compass, color: "text-slate-800", bg: "bg-slate-100", link: "/student/profile" });
        if (missingSkills.length > 0) actions.push({ id: 4, title: `Learn ${missingSkills[0]}`, desc: `Core skill for ${careerTrackData.track} track.`, icon: Target, color: "text-primary", bg: "bg-primary/10", link: "/student/profile" });
        if (!user?.resumeUrl && currentYear >= 3) actions.push({ id: 5, title: "Upload Resume", desc: "Prepare for placement analytics.", icon: FileText, color: "text-red-500", bg: "bg-red-100", link: "/student/profile" });
        if (internships === 0 && currentYear >= 3) actions.push({ id: 6, title: "Apply for Internships", desc: "Gain industry experience.", icon: Award, color: "text-violet-500", bg: "bg-violet-100", link: "/student/profile" });

        if (actions.length === 0) {
            actions.push({ id: 7, title: "You're on track", desc: "Keep improving consistently.", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100", link: "/student/profile" });
        }
        return actions;
    };

    const recommendedActions = getRecommendedActions();

    const roadmapProgressData = currentYear <= 2 ? [
        { label: "Profile Registration", value: user?.profileCompleted ? 100 : 0, done: !!user?.profileCompleted },
        { label: "Career Assessment", value: user?.assessmentResults ? 100 : 0, done: !!user?.assessmentResults },
        { label: "First 50 LeetCode Problems", value: Math.min(100, Math.round(((user?.leetcodeStats?.totalSolved || 0) / 50) * 100)), done: !!(user?.leetcodeStats?.totalSolved && user.leetcodeStats.totalSolved >= 50) },
        { label: "Build 2 Starter Projects", value: Math.min(100, Math.round(((user?.projects?.length || 0) / 2) * 100)), done: !!(user?.projects?.length && user.projects.length >= 2) },
    ] : [
        { label: "Profile Optimization", value: Math.min(100, Math.round((user?.resumeUrl ? 50 : 0) + Math.min(50, ((user?.techSkills?.length || 0) / 5) * 50))), done: !!(user?.resumeUrl && (user?.techSkills?.length || 0) >= 5) },
        { label: "DSA Competence (150+)", value: Math.min(100, Math.round(((user?.leetcodeStats?.totalSolved || 0) / 150) * 100)), done: !!(user?.leetcodeStats?.totalSolved && user.leetcodeStats.totalSolved >= 150) },
        { label: "Technical Domains & Internships", value: Math.min(100, Math.round(((user?.internships?.length || 0) / 1) * 100)), done: !!(user?.internships?.length && user.internships.length >= 1) },
        { label: "Mock Interviews", value: 30, done: false },
    ];

    return (
        <DashboardLayout role="student" userName={user?.name || "Student"} userYear={yearLabel} userProgram={user?.branch || "B.Tech CSE"}>
            <div className="space-y-6">

                {/* Career Discovery Banner */}
                {!(user as StudentUser)?.careerTrack ? (
                    <div className="relative rounded-2xl bg-gradient-to-r from-violet-600/20 via-primary/15 to-transparent border border-primary/30 p-5 overflow-hidden animate-fade-in-up">
                        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10" />
                        <div className="absolute right-4 bottom-0 h-16 w-16 rounded-full bg-violet-500/10" />
                        <div className="relative flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-primary/20 p-2.5 shrink-0">
                                    <Compass className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-base text-slate-800">🎯 Discover Your Career Path</p>
                                    <p className="text-sm text-slate-500 mt-0.5">Take a psychometric assessment for a personalized roadmap.</p>
                                </div>
                            </div>
                            <button onClick={() => navigate('/student/assessment')} className="bg-primary text-white hover:bg-primary-dark transition-colors px-4 py-2 text-sm font-bold rounded-xl relative z-10">
                                Start Career Discovery →
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 w-fit">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-slate-700">Goal: <span className="text-primary font-bold">{(user as StudentUser).careerTrack}</span></span>
                            <span className="text-slate-300">|</span>
                            <button onClick={() => navigate('/student/assessment')} className="text-xs font-bold text-primary hover:underline">Change →</button>
                        </div>
                        <div className="relative rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 p-5 overflow-hidden">
                            <div className="relative flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-primary/20 p-2.5 shrink-0"><Sparkles className="h-6 w-6 text-primary" /></div>
                                    <div>
                                        <p className="font-bold text-base text-slate-800">🤖 AI Skill Gap Analysis</p>
                                        <p className="text-sm text-slate-500 mt-0.5">Compare your profile against {(user as StudentUser).careerTrack} benchmarks.</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/student/skill-gap-analysis')} className="bg-primary text-white px-4 py-2 text-sm font-bold rounded-xl shadow-md hover:bg-primary-dark transition-all">
                                    View Analysis →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Greeting Header */}
                <div className="rounded-3xl bg-gradient-nmims p-8 text-white overflow-hidden relative shadow-2xl border border-white/10 group">
                    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <GraduationCap className="h-5 w-5 text-white/80" />
                            <span className="text-sm font-black tracking-widest uppercase text-white/70">{user?.branch} • {yearLabel}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 text-white">
                            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}! 👋
                        </h1>
                        <p className="text-white/90 font-medium text-lg mt-2 uppercase tracking-wide">Mode: <span className="font-bold text-white"> {modeLabel}</span></p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {roadMapSteps.map((step, idx) => (
                                <span key={idx} className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 text-xs font-bold">✦ {step}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {quickStats.map((stat, i) => (
                        <div key={i} className="group relative rounded-2xl border border-slate-100 bg-white p-5 flex items-start justify-between shadow-sm hover:shadow-xl transition-all">
                            <div className="relative z-10">
                                <p className="text-xs font-black uppercase text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-800 mt-1">{stat.value}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2">{stat.trend}</p>
                            </div>
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="card-nmims bg-white p-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><Zap className="h-4 w-4 text-primary" /> Career Readiness</h3>
                        <GaugeChart value={liveReadinessScore} label="Overall Readiness" />
                    </div>
                    <div className="card-nmims bg-white p-6">
                        <h3 className="font-bold text-slate-800 mb-6">Skills Overview</h3>
                        <RadarChart data={derivedSkills} />
                    </div>
                </div>

                {/* AI SWOC Analysis Section */}
                <div className="card-nmims bg-white p-8">
                    <SWOCAnalysis 
                        studentData={user} 
                        onUpdate={handleSWOCUpdate} 
                        editable={true} 
                    />
                </div>

                {/* Main Content Row 2: Roadmap + LeetCode */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="card-nmims bg-white p-6">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-slate-800 flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Roadmap Progress</h3>
                            <button onClick={() => navigate('/student/roadmap')} className="text-xs font-bold text-primary hover:underline">Full Roadmap</button>
                         </div>
                        <div className="space-y-5">
                            {roadmapProgressData.map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className={item.done ? "text-green-500" : "text-slate-700"}>{item.done ? "✓" : "○"} {item.label}</span>
                                        <span className="text-slate-400">{item.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${item.done ? 'bg-green-500' : 'bg-primary/40'}`} style={{ width: `${item.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-nmims bg-gradient-to-br from-primary/5 to-white p-6 overflow-hidden relative group">
                         <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6"><Code2 className="h-5 w-5 text-primary" /> Coding Consistency</h3>
                         {user?.leetcodeStats ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white border border-slate-100 p-5 rounded-2xl text-center shadow-sm">
                                        <p className="text-3xl font-black text-slate-800">{user.leetcodeStats.totalSolved}</p>
                                        <p className="text-[10px] font-black uppercase text-slate-400">Solved</p>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl text-center shadow-inner">
                                        <p className="text-3xl font-black text-primary">{user.leetcodeStats.streak}</p>
                                        <p className="text-[10px] font-black uppercase text-primary/70">Streak</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/student/leetcode')} className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase rounded-xl shadow-lg hover:bg-primary-dark transition-all">
                                    Full LeetCode Tracker →
                                </button>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center justify-center h-full py-10">
                                <Code2 className="h-10 w-10 text-slate-200 mb-3" />
                                <button onClick={() => navigate('/student/profile')} className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary-dark transition-all">Link Account</button>
                            </div>
                         )}
                    </div>
                </div>

                {/* Row 3: Action Center */}
                <div className="card-nmims bg-white p-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-lg"><Compass className="h-6 w-6 text-primary" /> Action Center</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {recommendedActions.map((action) => (
                            <div key={action.id} onClick={() => navigate(action.link)} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-5 hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer group">
                                <div className={`p-3 rounded-xl ${action.bg} ${action.color}`}><action.icon className="h-6 w-6" /></div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors">{action.title}</p>
                                    <p className="text-[11px] text-slate-500 mt-1">{action.desc}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
