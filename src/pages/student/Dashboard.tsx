import { useEffect } from 'react';
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
    Flame,
    Trophy,
    Users,
    FileText,
    LayoutGrid,
    CheckCircle2
} from 'lucide-react';
import { GaugeChart } from '../../components/charts/GaugeChart';
import { RadarChart } from '../../components/charts/RadarChart';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { fetchLeetCodeStats } from '../../lib/leetcode';

export default function StudentDashboard() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();



    // Real-time Scoring Logic
    const calculateRealTimeScores = () => {
        if (!user) return { readiness: 0, placement: 0 };

        // 1. Career Readiness Score (CRS)
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

        // 2. Placement Score (PS) - Specialized for Year 4
        let ps = 0;
        const internshipsCount = user.internships?.length || 0;
        if (internshipsCount >= 2) ps += 35;
        else if (internshipsCount === 1) ps += 25;

        const githubProjectsCount = user.projects?.filter(p => !!p.link).length || 0;
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

    const { readiness: liveReadinessScore, placement: livePlacementScore } = calculateRealTimeScores();

    // Fetch real-time LeetCode stats
    useEffect(() => {
        if (!user || !user.leetcode) return;

        // Throttle: Only sync if hasn't been updated in the last 5 minutes
        const lastUpdated = user.leetcodeStats?.lastUpdated || 0;
        const cooldown = 5 * 60 * 1000; // 5 minutes
        if (Date.now() - lastUpdated < cooldown && user.leetcodeStats) return;

        const syncLeetCode = async () => {
            try {
                const stats = await fetchLeetCodeStats(user.leetcode!);
                if (stats && user) {
                    // Only update if something meaningful changed
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
    }, [user?.leetcode, user?.leetcodeStats?.totalSolved]);

    const currentYear = user?.currentYear || 1;
    const yearLabel = currentYear === 1 ? '1st Year' : currentYear === 2 ? '2nd Year' : currentYear === 3 ? '3rd Year' : '4th Year';
    const modeLabel = currentYear <= 2 ? 'Foundation Mode' : 'Placement Preparation Mode';

    // Dynamic Quick Stats based on Year
    const getQuickStats = () => {
        const stats = [];

        // Always include LeetCode as it's a core focus for all years
        stats.push({
            label: "LeetCode Solved",
            value: user?.leetcodeStats ? `${user.leetcodeStats.totalSolved}` : user?.leetcode ? "Syncing" : "Link",
            icon: Code2,
            color: "text-orange-600",
            bg: "bg-orange-50",
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
            stats.push({
                label: "Foundation Score",
                value: `${getProgressScore()}/100`,
                icon: Target,
                color: "text-blue-600",
                bg: "bg-blue-50",
                trend: "Welcome to NMIMS!"
            });
            stats.push({
                label: "Core Subject GPA",
                value: "N/A",
                icon: GraduationCap,
                color: "text-purple-600",
                bg: "bg-purple-50",
                trend: "Track Semester 1"
            });
            stats.push({
                label: "Club Participation",
                value: "None",
                icon: Users,
                color: "text-green-600",
                bg: "bg-green-50",
                trend: "Explore Societies"
            });
        } else if (currentYear === 2) {
            stats.push({
                label: "Skill Foundation",
                value: user?.projects?.length || "0",
                icon: LayoutGrid,
                color: "text-purple-600",
                bg: "bg-purple-50",
                trend: "Project Building Phase"
            });
            stats.push({
                label: "Certifications",
                value: user?.certifications?.length || "0",
                icon: Award,
                color: "text-green-600",
                bg: "bg-green-50",
                trend: "Industry Skills"
            });
            stats.push({
                label: "Exploration",
                value: user?.assessmentResults ? "Done" : "Pending",
                icon: Compass,
                color: "text-blue-600",
                bg: "bg-blue-50",
                trend: "Career Discovery"
            });
        } else if (currentYear === 3) {
            stats.push({
                label: "Readiness Score",
                value: `${liveReadinessScore}/100`,
                icon: TrendingUp,
                color: "text-green-600",
                bg: "bg-green-50",
                trend: liveReadinessScore > 80 ? "Industry Ready!" : "Focus on Skills"
            });
            stats.push({
                label: "Internships",
                value: user?.internships?.length?.toString() || "0",
                icon: Target,
                color: "text-blue-600",
                bg: "bg-blue-50",
                trend: "Industry Experience"
            });
            stats.push({
                label: "Resume Strength",
                value: getResumeStrength(),
                icon: Sparkles,
                color: "text-purple-600",
                bg: "bg-purple-50",
                trend: "ATS Optimized"
            });
        } else { // Year 4
            stats.push({
                label: "Placement Status",
                value: user?.placementStatus || "Preparing",
                icon: Trophy,
                color: "text-purple-600",
                bg: "bg-purple-50",
                trend: "Final Season"
            });
            stats.push({
                label: "Placement Score",
                value: `${livePlacementScore}%`,
                icon: Sparkles,
                color: "text-green-600",
                bg: "bg-green-50",
                trend: "AI Predicted"
            });
            stats.push({
                label: "Resume Strength",
                value: getResumeStrength(),
                icon: FileText,
                color: "text-blue-600",
                bg: "bg-blue-50",
                trend: "ATS Optimized"
            });
        }

        return stats;
    };

    const quickStats = getQuickStats();

    // Dynamic Roadmap Progress
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

    // Dynamic SWOC
    const derivedSwoc = user?.assessmentResults?.swoc || {
        strengths: ["Strong academic background", "Enrolled in specialized program"],
        weaknesses: ["Needs to uncover core technical interests", "Limited practical exposure"],
        opportunities: ["Explore multiple technology stacks", "Participate in hackathons"],
        challenges: ["Balancing academics and skill building", "Information overload"],
    };

    const derivedAssessmentSwoc = currentYear >= 3 && !user?.assessmentResults?.swoc ? {
        strengths: ["Strong academic fundamentals", "Good logical problem-solving"],
        weaknesses: ["System Design complexity", "Low mock interview frequency"],
        opportunities: ["Emerging tech industry boom", "Strong university alumni network"],
        challenges: ["Highly competitive placement season", "Requires specialized niche skills"],
    } : derivedSwoc;

    // Dynamic Skills Based on Actual Profile
    const techSkills = user?.techSkills || [];

    // NEW FEATURE: Skill Gap Engine
    const detectCareerTrack = () => {
        if (techSkills.some(s => /react|next|html|css|tailwind/i.test(s))) return { track: "Frontend Developer", expected: ["React", "JavaScript", "HTML", "CSS", "API Integration", "Git"] };
        if (techSkills.some(s => /node|express|mongo|sql|api/i.test(s))) return { track: "Backend Developer", expected: ["Node.js", "Express", "Database Management", "API Design", "Git"] };
        if (techSkills.some(s => /python|tensorflow|pandas|ml|ai/i.test(s))) return { track: "Machine Learning Engineer", expected: ["Python", "Pandas", "Scikit", "TensorFlow", "Math Fundamentals"] };
        if (techSkills.some(s => /aws|docker|kubernetes|ci|cd/i.test(s))) return { track: "DevOps Engineer", expected: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"] };
        return { track: "General Software Engineer", expected: ["Data Structures", "Algorithms", "Object Oriented Programming", "Git", "Databases"] };
    };

    const careerTrackData = detectCareerTrack();
    const missingSkills = careerTrackData.expected.filter(reqSkill => !techSkills.some(userSkill => new RegExp(reqSkill.split(' ')[0], 'i').test(userSkill)));

    const getSkillScore = (pattern: RegExp) => {
        const matches = techSkills.filter(s => pattern.test(s)).length;
        if (matches >= 3) return 90;
        if (matches >= 2) return 75;
        if (matches === 1) return 50;
        return 30; // base score
    };

    const derivedSkills = [
        { skill: "Frontend", value: getSkillScore(/react|html|css|next|angular/i) },
        { skill: "Backend", value: getSkillScore(/node|express|django|spring|api/i) },
        { skill: "DSA", value: Math.max(30, Math.min(90, 30 + (user?.leetcodeStats?.totalSolved || 0) / 2)) },
        { skill: "DevOps", value: getSkillScore(/docker|kubernetes|aws|ci\/cd|git/i) },
        { skill: "Fundamentals", value: Math.max(30, Math.min(90, (user?.profileCompleted ? 40 : 20) + (parseFloat(user?.cgpa || user?.assessmentResults?.cgpa || "0") * 5))) },
    ];

    // Generate Dynamic Recommended Actions
    const getRecommendedActions = () => {
        const actions = [];
        const solved = user?.leetcodeStats?.totalSolved || 0;
        const projects = user?.projects?.length || 0;
        const skillsCount = user?.techSkills?.length || 0;
        const internships = user?.internships?.length || 0;

        if (solved < 50) {
            actions.push({ id: 1, title: "Start Daily Coding", desc: "Solve 2 problems daily to build your logic.", icon: Code2, color: "text-orange-500", bg: "bg-orange-100", link: "/student/leetcode" });
        }
        if (projects < 2) {
            actions.push({ id: 2, title: "Build Core Projects", desc: "Add robust projects to your profile to stand out.", icon: LayoutGrid, color: "text-purple-500", bg: "bg-purple-100", link: "/student/profile" });
        }
        if (skillsCount < 3) {
            actions.push({ id: 3, title: "Expand Skill Stack", desc: "Learn new domains aligned with your career goal.", icon: Compass, color: "text-blue-500", bg: "bg-blue-100", link: "/student/profile" });
        }

        // Feed Skill Gap Detection into Recommendations
        if (missingSkills.length > 0) {
            actions.push({ id: 4, title: `Learn ${missingSkills[0]}`, desc: `Missing core skill for the ${careerTrackData.track} track.`, icon: Target, color: "text-indigo-500", bg: "bg-indigo-100", link: "/student/profile" });
        }

        if (!user?.resumeUrl && currentYear >= 3) {
            actions.push({ id: 5, title: "Upload Resume", desc: "Prepare your resume for placement analytics.", icon: FileText, color: "text-red-500", bg: "bg-red-100", link: "/student/profile" });
        }
        if (internships === 0 && currentYear >= 3) {
            actions.push({ id: 6, title: "Apply for Internships", desc: "Gain industry experience to strengthen your profile.", icon: Award, color: "text-violet-500", bg: "bg-violet-100", link: "/student/profile" });
        }

        if (actions.length === 0) {
            actions.push({ id: 7, title: "You're on track", desc: "You're perfectly on track. Keep improving consistently.", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100", link: "/student/profile" });
        }
        return actions;
    };

    const recommendedActions = getRecommendedActions();

    // NEW FEATURE: AI Roadmap Generator
    const generateNextStepsRoadmap = () => {
        const steps = [];
        const solved = user?.leetcodeStats?.totalSolved || 0;
        const projects = user?.projects?.length || 0;
        const internships = user?.internships?.length || 0;

        if (currentYear <= 2) {
            if (solved < 50) steps.push("Solve first 50 LeetCode problems");
            if (projects < 2) steps.push("Build 2 starter projects");
            if (missingSkills.length > 0) steps.push(`Learn ${missingSkills[0]} for ${careerTrackData.track} track`);
            else steps.push("Explore emerging tech domains");
            steps.push("Join technical coding communities");
        } else if (currentYear === 3) {
            if (solved < 150) steps.push("Reach 150+ LeetCode problems");
            if (projects < 3) steps.push("Build advanced capstone projects");
            if (internships < 1) steps.push("Apply for industry internships");
            if (!user?.resumeUrl) steps.push("Optimize resume for upcoming placements");
            steps.push("Practice interview communication skills");
        } else {
            steps.push("Practice mock interviews regularly");
            steps.push("Focus on System Design concepts");
            steps.push("Apply actively to companies");
            steps.push("Improve resume ATS score");
        }

        return steps.slice(0, 4); // return top actionable steps
    };

    const roadMapSteps = generateNextStepsRoadmap();

    return (
        <DashboardLayout role="student" userName={user?.name || "Student"} userYear={yearLabel} userProgram={user?.branch || "B.Tech CSE"}>
            <div className="space-y-6">

                {/* Career Discovery Banner */}
                {!(user as any)?.careerTrack ? (
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
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        Take a quick psychometric assessment to get a personalized roadmap tailored to your subjects and interests.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => navigate('/student/assessment')} className="bg-primary text-white hover:bg-primary-dark transition-colors px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap">
                                    Start Career Discovery →
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 w-fit">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-slate-700">Your Goal: <span className="text-primary font-bold">{(user as any).careerTrack}</span></span>
                            <span className="text-slate-300">|</span>
                            <button onClick={() => navigate('/student/assessment')} className="text-xs font-bold text-primary hover:underline underline-offset-2">Change →</button>
                        </div>

                        {/* AI Skill Gap Analysis Banner */}
                        <div className="relative rounded-2xl bg-gradient-to-r from-indigo-600/20 via-purple-500/15 to-transparent border border-indigo-300/40 p-5 overflow-hidden animate-fade-in-up">
                            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-indigo-500/10" />
                            <div className="absolute right-4 bottom-0 h-16 w-16 rounded-full bg-purple-500/10" />
                            <div className="relative flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-indigo-500/20 p-2.5 shrink-0">
                                        <Sparkles className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base text-slate-800">🤖 AI-Powered Skill Gap Analysis</p>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            Compare your skills against industry benchmarks for {(user as any).careerTrack}. Get personalized recommendations to become placement-ready.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => navigate('/student/skill-gap-analysis')} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap shadow-md">
                                        View Analysis →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Greeting Header */}
                <div className="rounded-2xl gradient-primary p-6 text-white overflow-hidden relative shadow-sm animate-fade-in-up stagger-1">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute -right-2 bottom-0 h-20 w-20 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="h-4 w-4 text-white/80" />
                            <span className="text-sm font-medium text-white/90">{user?.branch || 'B.Tech CSE'} • {yearLabel}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Good morning, {user?.name?.split(' ')[0] || 'Student'}! 👋</h1>
                        <p className="text-white/90 font-medium">Focus: <span className="font-semibold text-white">{modeLabel}</span></p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {roadMapSteps.map((step, idx) => (
                                <span key={idx} className="rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md px-3 py-1 text-xs font-medium cursor-default transition-colors">
                                    + {step}
                                </span>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-white/60 flex items-center gap-1.5 font-medium tracking-wide">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                            Next milestone: {currentYear <= 2 ? 'Complete Core Fundamentals - End of Semester' : 'Pre-Placement Season — August'}
                        </p>
                    </div>
                </div>
                {/* Quick Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up stagger-2">
                    {quickStats.map((stat, i) => (
                        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</p>
                                <p className="text-xs text-slate-400 mt-1">{stat.trend}</p>
                            </div>
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Row 1: Charts */}
                <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up stagger-3">
                    {/* Readiness Gauge */}
                    <div className="card-nmims overflow-hidden flex flex-col pt-2 bg-white">
                        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" /> Career Readiness Score
                            </h3>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center">
                            <GaugeChart value={liveReadinessScore} label="Overall Readiness" />
                            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                                <div className={`rounded-xl p-3 ${(user?.techSkills?.length || 0) >= 5 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                    <p className={`text-sm font-bold ${(user?.techSkills?.length || 0) >= 5 ? 'text-green-700' : 'text-yellow-700'}`}>
                                        {(user?.techSkills?.length || 0) >= 5 ? 'Strong' : 'Growing'}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-wide">Technical Skills</p>
                                </div>
                                <div className={`rounded-xl p-3 ${user?.assessmentResults ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <p className={`text-sm font-bold ${user?.assessmentResults ? 'text-green-700' : 'text-red-700'}`}>
                                        {user?.assessmentResults ? 'Mapped' : 'Pending'}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-wide">Career Path</p>
                                </div>
                                <div className={`rounded-xl p-3 ${(user?.leetcodeStats?.totalSolved || 0) >= 50 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <p className={`text-sm font-bold ${(user?.leetcodeStats?.totalSolved || 0) >= 50 ? 'text-green-700' : 'text-red-700'}`}>
                                        {(user?.leetcodeStats?.totalSolved || 0) >= 50 ? 'Stable' : 'Needs Focus'}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-wide">DSA Status</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Radar */}
                    <div className="card-nmims overflow-hidden flex flex-col pt-2 bg-white">
                        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                Skills Overview
                            </h3>
                        </div>
                        <div className="p-6 flex-1 flex items-center justify-center">
                            <RadarChart data={derivedSkills} />
                        </div>
                    </div>
                </div>



                {/* Main Content Row 2: Roadmap + SWOC Preview */}
                <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up stagger-3">
                    {/* Roadmap Progress */}
                    <div className="card-nmims overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-secondary-accent flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" /> Roadmap Progress
                            </h3>
                            <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center">
                                Full Roadmap <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </button>
                        </div>
                        <div className="p-6 flex-1 space-y-5">
                            {roadmapProgressData.map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-bold flex items-center gap-2 ${item.done ? "text-green-600 line-through opacity-60" : "text-slate-700"}`}>
                                            {item.done && "✓"} {item.label}
                                        </span>
                                        <span className="text-[10px] font-black tracking-wider text-slate-400">{item.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${item.done ? 'bg-green-500' : 'bg-primary'}`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SWOC Preview */}
                    <div className="card-nmims overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-secondary-accent flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <Flame className="h-4 w-4 text-orange-500" /> SWOC Analysis
                            </h3>
                            <button className="text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors flex items-center">
                                Full SWOC <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </button>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center">
                            <div className="space-y-4 h-full flex flex-col justify-center">
                                <div className="rounded-2xl border p-4 bg-green-50/50">
                                    <p className="text-[10px] font-black tracking-widest text-green-700 mb-2 uppercase">💪 Top Strength</p>
                                    <p className="text-sm font-bold text-slate-800">{derivedAssessmentSwoc.strengths[0]}</p>
                                </div>
                                <div className="rounded-2xl border p-4 bg-red-50/50">
                                    <p className="text-[10px] font-black tracking-widest text-red-700 mb-2 uppercase">⚠️ Area for Growth</p>
                                    <p className="text-sm font-bold text-slate-800">{derivedAssessmentSwoc.weaknesses[0]}</p>
                                </div>

                                <button onClick={() => navigate('/student/assessment')} className="mt-4 w-full py-2.5 bg-secondary hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors rounded-xl flex justify-center items-center">
                                    View Full Analysis <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Row 3: Actions & Quick Leetcode */}
                <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up stagger-4">

                    {/* Simplified LeetCode Tracker */}
                    <div className="card-nmims border-orange-200 bg-gradient-to-br from-orange-50/50 to-transparent flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-orange-100 flex items-center justify-between">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-orange-500" /> Coding Consistency
                            </h3>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center">
                            {user?.leetcodeStats ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-2xl border border-orange-100 bg-white p-5 text-center shadow-sm flex flex-col justify-center">
                                            <p className="text-3xl font-black text-slate-900">{user.leetcodeStats.totalSolved}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Total Solved</p>
                                        </div>
                                        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 text-center shadow-sm flex flex-col justify-center relative overflow-hidden">
                                            <Flame className="absolute -right-2 -bottom-2 h-16 w-16 text-orange-200 opacity-50" />
                                            <p className="text-3xl font-black text-orange-600 relative z-10">{user.leetcodeStats.streak} Days</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-600/70 mt-2 relative z-10">Current Streak</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/student/leetcode')}
                                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        View Full Tracker <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : user?.leetcode ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="h-8 w-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
                                    <p className="text-sm text-slate-600 font-medium">Syncing live data...</p>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <Code2 className="h-10 w-10 text-slate-200 mb-3" />
                                    <p className="text-slate-500 font-medium text-sm mb-4">Connect LeetCode profile</p>
                                    <button onClick={() => navigate('/student/profile')} className="px-5 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg transition-colors">
                                        Link Account
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* New Core Section: Recommended Actions */}
                    <div className="card-nmims overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-secondary-accent flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <Compass className="h-5 w-5 text-primary" /> Recommended Actions
                            </h3>
                        </div>
                        <div className="p-5 flex-1 space-y-3 overflow-y-auto">
                            {recommendedActions.map((action) => (
                                <div key={action.id} onClick={() => navigate(action.link)} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 hover:border-primary/30 transition-colors cursor-pointer shadow-sm group">
                                    <div className={`p-3 rounded-xl flex-shrink-0 ${action.bg}`}>
                                        <action.icon className={`h-5 w-5 ${action.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors">{action.title}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{action.desc}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
