import { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { SkillGapDashboard } from "../../components/SkillGapDashboard";
import { analyzeSkillGap } from "../../lib/skillGapAnalysis";
import { industryBenchmarks } from "../../data/industryBenchmarks";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Target, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SkillGapAnalysisPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Determine target role from user's career track or default
    const defaultRole = (user as any)?.careerTrack || "Full-Stack Developer";
    const [selectedRole, setSelectedRole] = useState(defaultRole);

    // Get available roles
    const availableRoles = Object.keys(industryBenchmarks);

    // Check if user has completed basic profile
    const hasBasicProfile = user?.techSkills && user.techSkills.length > 0;

    if (!user) {
        return (
            <DashboardLayout role="student" userName="Student" userYear="1st Year" userProgram="B.Tech">
                <div className="flex items-center justify-center h-96">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </DashboardLayout>
        );
    }

    // Perform skill gap analysis
    const analysis = analyzeSkillGap(
        user.techSkills || [],
        selectedRole,
        user.leetcodeStats?.totalSolved || 0,
        user.projects?.length || 0,
        user.internships?.length || 0,
        parseFloat(user.cgpa || user.assessmentResults?.cgpa || "0")
    );

    const currentYear = user.currentYear || 1;
    const yearLabel = currentYear === 1 ? '1st Year' : currentYear === 2 ? '2nd Year' : currentYear === 3 ? '3rd Year' : '4th Year';

    return (
        <DashboardLayout role="student" userName={user.name || "Student"} userYear={yearLabel} userProgram={user.branch || "B.Tech CSE"}>
            <div className="space-y-6 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-primary" />
                            AI Skill Gap Analysis
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Compare your profile against industry benchmarks and get personalized recommendations
                        </p>
                    </div>
                </div>

                {/* Career Track Status */}
                {!(user as any)?.careerTrack ? (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-primary/10 p-3 shadow-sm border border-primary/10">
                                    <Target className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1 text-slate-800">Complete Career Discovery First</h3>
                                    <p className="text-sm text-slate-600 mb-4 font-medium">
                                        Take the career assessment to set your target role and get personalized skill gap analysis.
                                    </p>
                                    <button
                                        onClick={() => navigate('/student/assessment')}
                                        className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl text-sm font-black transition-all shadow-md active:scale-95"
                                    >
                                        Start Career Discovery →
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 w-fit shadow-sm">
                        <Target className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-slate-700">
                            Your Career Goal: <span className="text-primary font-black uppercase tracking-tight">{(user as any).careerTrack}</span>
                        </span>
                    </div>
                )}

                {/* Profile Completion Check */}
                {!hasBasicProfile && (
                    <Card className="border-slate-200 bg-slate-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-slate-100 p-3 shadow-sm border border-slate-200">
                                    <TrendingUp className="h-6 w-6 text-slate-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1 text-slate-800">Complete Your Profile</h3>
                                    <p className="text-sm text-slate-600 mb-4 font-medium">
                                        Add your skills, projects, and experience to get accurate skill gap analysis.
                                    </p>
                                    <button
                                        onClick={() => navigate('/student/profile')}
                                        className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-black transition-all shadow-md active:scale-95"
                                    >
                                        Complete Profile →
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Role Selector */}
                <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Select Target Role
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Choose a role to compare your skills against industry benchmarks
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {availableRoles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                                        selectedRole === role
                                            ? "border-primary bg-primary text-white shadow-md"
                                            : "border-slate-200 bg-white hover:border-primary/50 hover:bg-primary/5"
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Analysis Dashboard */}
                <SkillGapDashboard 
                    analysis={analysis}
                    onNavigateToProfile={() => navigate('/student/profile')}
                />

                {/* Bottom CTA */}
                <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
                    <CardContent className="pt-6 pb-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-2">Ready to Close the Gap?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Update your profile with new skills and projects to improve your readiness score
                            </p>
                            <button
                                onClick={() => navigate('/student/profile')}
                                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-md"
                            >
                                Update Profile →
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
