import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import {
    Target, TrendingUp, AlertCircle, CheckCircle2, Clock, Zap,
    Code2, Briefcase, Award, BookOpen, ChevronRight, Sparkles
} from "lucide-react";
import type { SkillGapAnalysis } from "../lib/skillGapAnalysis";
import { cn } from "../lib/utils";

interface SkillGapDashboardProps {
    analysis: SkillGapAnalysis;
    onNavigateToProfile?: () => void;
}

export function SkillGapDashboard({ analysis, onNavigateToProfile }: SkillGapDashboardProps) {
    const getReadinessColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-blue-600";
        if (score >= 40) return "text-yellow-600";
        return "text-orange-600";
    };

    const getReadinessLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Fair";
        return "Needs Work";
    };

    const getGapStatusColor = (status: 'ahead' | 'on-track' | 'behind') => {
        if (status === 'ahead') return "bg-green-50 text-green-700 border-green-200";
        if (status === 'on-track') return "bg-blue-50 text-blue-700 border-blue-200";
        return "bg-orange-50 text-orange-700 border-orange-200";
    };

    const getGapStatusIcon = (status: 'ahead' | 'on-track' | 'behind') => {
        if (status === 'ahead') return <CheckCircle2 className="h-4 w-4" />;
        if (status === 'on-track') return <TrendingUp className="h-4 w-4" />;
        return <AlertCircle className="h-4 w-4" />;
    };

    return (
        <div className="space-y-6">
            {/* Header Card - Overall Readiness */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="h-20 w-20" />
                </div>
                <CardContent className="pt-6 pb-6 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">
                                AI-Powered Analysis
                            </p>
                            <h2 className="text-2xl font-black">{analysis.targetRole}</h2>
                            <p className="text-sm text-white/80 mt-1">Industry Benchmark Comparison</p>
                        </div>
                        <div className="text-center">
                            <div className="relative inline-block">
                                <svg className="h-24 w-24 transform -rotate-90">
                                    <circle
                                        cx="48" cy="48" r="40"
                                        stroke="currentColor" strokeWidth="6"
                                        fill="transparent"
                                        className="text-white/20"
                                    />
                                    <circle
                                        cx="48" cy="48" r="40"
                                        stroke="currentColor" strokeWidth="6"
                                        fill="transparent"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 - (251.2 * analysis.overallReadiness) / 100}
                                        className="text-white transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black">{analysis.overallReadiness}</span>
                                    <span className="text-[8px] uppercase font-bold tracking-widest text-white/60">
                                        Ready
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-3">
                            <p className="text-[10px] uppercase font-bold text-white/60 mb-1">Industry Demand</p>
                            <p className="text-sm font-bold capitalize">{analysis.industryDemand}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-3">
                            <p className="text-[10px] uppercase font-bold text-white/60 mb-1">Avg Salary</p>
                            <p className="text-sm font-bold">{analysis.avgSalary}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-3">
                            <p className="text-[10px] uppercase font-bold text-white/60 mb-1">Time to Ready</p>
                            <p className="text-sm font-bold">{analysis.estimatedTimeToReady}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-3">
                            <p className="text-[10px] uppercase font-bold text-white/60 mb-1">Status</p>
                            <p className="text-sm font-bold">{getReadinessLabel(analysis.overallReadiness)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skill Gaps Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Missing Core Skills */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Critical Skills Gap
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Core skills required for {analysis.targetRole}
                        </p>
                    </CardHeader>
                    <CardContent>
                        {analysis.missingCoreSkills.length > 0 ? (
                            <div className="space-y-3">
                                {analysis.missingCoreSkills.map((skill, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-xl border border-red-100 bg-red-50/50 p-4 hover:bg-red-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                <h4 className="font-bold text-sm">{skill.skill}</h4>
                                            </div>
                                            <Badge variant="danger" className="text-[10px]">
                                                {skill.priority.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {skill.estimatedLearningTime}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Zap className="h-3 w-3" />
                                                Importance: {skill.importance}/5
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-green-600">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">All core skills covered!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Missing Important Skills */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                            <Target className="h-5 w-5" />
                            Important Skills Gap
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Skills that strengthen your profile
                        </p>
                    </CardHeader>
                    <CardContent>
                        {analysis.missingImportantSkills.length > 0 ? (
                            <div className="space-y-3">
                                {analysis.missingImportantSkills.map((skill, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 hover:bg-orange-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                                <h4 className="font-bold text-sm">{skill.skill}</h4>
                                            </div>
                                            <Badge variant="warning" className="text-[10px]">
                                                {skill.priority.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {skill.estimatedLearningTime}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Zap className="h-3 w-3" />
                                                Importance: {skill.importance}/5
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-green-600">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">All important skills covered!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Present Skills */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        Your Strengths ({analysis.presentSkills.length} skills)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {analysis.presentSkills.map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm font-medium"
                            >
                                ✓ {skill}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Experience & Activity Gaps */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* LeetCode Gap */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Code2 className="h-4 w-4 text-orange-500" />
                            LeetCode Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("rounded-xl border p-4 mb-3", getGapStatusColor(analysis.leetCodeGap.status))}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-black">{analysis.leetCodeGap.current}</span>
                                {getGapStatusIcon(analysis.leetCodeGap.status)}
                            </div>
                            <p className="text-xs font-medium opacity-80">
                                Target: {analysis.leetCodeGap.required} problems
                            </p>
                        </div>
                        {analysis.leetCodeGap.gap > 0 && (
                            <p className="text-xs text-muted-foreground">
                                <span className="font-bold">{analysis.leetCodeGap.gap}</span> more problems needed
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Projects Gap */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("rounded-xl border p-4 mb-3", getGapStatusColor(analysis.projectGap.status))}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-black">{analysis.projectGap.current}</span>
                                {getGapStatusIcon(analysis.projectGap.status)}
                            </div>
                            <p className="text-xs font-medium opacity-80">
                                Target: {analysis.projectGap.required} projects
                            </p>
                        </div>
                        {analysis.projectGap.gap > 0 && (
                            <p className="text-xs text-muted-foreground">
                                <span className="font-bold">{analysis.projectGap.gap}</span> more projects needed
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Internships Gap */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-purple-500" />
                            Internships
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("rounded-xl border p-4 mb-3", getGapStatusColor(analysis.internshipGap.status))}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-black">{analysis.internshipGap.current}</span>
                                {getGapStatusIcon(analysis.internshipGap.status)}
                            </div>
                            <p className="text-xs font-medium opacity-80">
                                Target: {analysis.internshipGap.required} internships
                            </p>
                        </div>
                        {analysis.internshipGap.gap > 0 && (
                            <p className="text-xs text-muted-foreground">
                                <span className="font-bold">{analysis.internshipGap.gap}</span> more internships needed
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* AI Recommendations */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI-Powered Recommendations
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Personalized action plan based on industry benchmarks
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {analysis.recommendations.map((rec, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 rounded-xl border bg-white p-4 hover:border-primary/50 transition-colors"
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 mt-0.5">
                                    {idx + 1}
                                </div>
                                <p className="text-sm leading-relaxed">{rec}</p>
                            </div>
                        ))}
                    </div>

                    {onNavigateToProfile && (
                        <Button
                            onClick={onNavigateToProfile}
                            className="w-full mt-4 flex items-center justify-center gap-2"
                        >
                            Update Your Profile
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Nice to Have Skills (Collapsed by default) */}
            {analysis.missingNiceToHaveSkills.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-600">
                            <BookOpen className="h-5 w-5" />
                            Bonus Skills ({analysis.missingNiceToHaveSkills.length})
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Optional skills that can give you an edge
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missingNiceToHaveSkills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm"
                                >
                                    {skill.skill}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
