import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { studentsDb } from '../../services/db/database.service';
import type { StudentUser } from '../../types/auth';
import { Users, TrendingUp, Award, Code2, Briefcase, FileText, Target, Info } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface CohortStats {
  totalStudents: number;
  avgLeetcode: number;
  avgProjects: number;
  avgInternships: number;
  avgCgpa: number;
  profileCompletionRate: number;
  topPercentileLeetcode: number; // 80th percentile
  topPercentileProjects: number;
  studentsWithResume: number;
  studentsWithInternship: number;
}

interface UserRank {
  leetcodePercentile: number;
  projectsPercentile: number;
  cgpaPercentile: number;
  overallPercentile: number;
}

function percentile(arr: number[], value: number): number {
  if (arr.length === 0) return 0;
  const below = arr.filter(v => v < value).length;
  return Math.round((below / arr.length) * 100);
}

function p80(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.8)] || 0;
}

// ── Insight Generator ─────────────────────────────────────────────────────────
function generateInsights(stats: CohortStats, user: StudentUser, rank: UserRank): string[] {
  const insights: string[] = [];
  const year = user.currentYear || 1;

  if (stats.profileCompletionRate < 60) {
    insights.push(`Only ${stats.profileCompletionRate}% of your batch has completed their profile. Completing yours puts you ahead of the majority.`);
  }

  if (rank.leetcodePercentile >= 70) {
    insights.push(`Your LeetCode progress is in the top ${100 - rank.leetcodePercentile}% of Year ${year} students. Keep the momentum.`);
  } else if ((user.leetcodeStats?.totalSolved || 0) < 10) {
    insights.push(`Students who start LeetCode in Year ${year} have a 40% higher placement readiness score by Year 3. Start with 5 problems this week.`);
  }

  if (rank.projectsPercentile < 40 && year <= 2) {
    insights.push(`${stats.avgProjects.toFixed(1)} projects is the average for your batch. Building even 1 project this semester puts you above average.`);
  }

  if (stats.studentsWithInternship > 0 && year >= 2) {
    const pct = Math.round((stats.studentsWithInternship / stats.totalStudents) * 100);
    insights.push(`${pct}% of your batch already has internship experience. Year ${year} is a great time to start applying.`);
  }

  if (rank.cgpaPercentile >= 75) {
    insights.push(`Your CGPA is in the top ${100 - rank.cgpaPercentile}% of your batch — a strong academic foundation for placement eligibility.`);
  }

  if (insights.length === 0) {
    insights.push(`You're on track with your batch. Focus on building 1 project and solving 10 LeetCode problems this month to pull ahead.`);
  }

  return insights.slice(0, 3);
}

// ── Stat Bar Component ────────────────────────────────────────────────────────
function StatBar({ label, userValue, avgValue, topValue, unit = '', icon: Icon }: {
  label: string;
  userValue: number;
  avgValue: number;
  topValue: number;
  unit?: string;
  icon: React.ElementType;
}) {
  const max = Math.max(topValue * 1.2, userValue * 1.1, 1);
  const userPct = Math.min((userValue / max) * 100, 100);
  const avgPct = Math.min((avgValue / max) * 100, 100);
  const topPct = Math.min((topValue / max) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-700">{label}</span>
        </div>
        <span className="text-sm font-black text-primary">{userValue}{unit}</span>
      </div>
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        {/* Top 20% marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10" style={{ left: `${topPct}%` }} />
        {/* Avg marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-slate-300 z-10" style={{ left: `${avgPct}%` }} />
        {/* User bar */}
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${userPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-bold text-slate-400">
        <span>Batch avg: {avgValue.toFixed(1)}{unit}</span>
        <span className="text-amber-600">Top 20%: {topValue.toFixed(1)}{unit}</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PeerCompassPage() {
  const { user } = useAuth();
  const u = user as StudentUser;

  const [allStudents, setAllStudents] = useState<StudentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    studentsDb.fetchAllStudents()
      .then((data: any[]) => {
        const students = data
          .filter((s: any) => s.role === 'student' || !s.role)
          .map((s: any) => ({ ...s, name: s.fullName || s.name, branch: s.department || s.branch } as StudentUser));
        setAllStudents(students);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Filter to same year + branch cohort
  const cohort = useMemo(() => {
    return allStudents.filter(s =>
      s.currentYear === u?.currentYear &&
      s.branch === u?.branch &&
      s.sapId !== u?.sapId
    );
  }, [allStudents, u]);

  const stats = useMemo((): CohortStats => {
    if (cohort.length === 0) return {
      totalStudents: 0, avgLeetcode: 0, avgProjects: 0, avgInternships: 0,
      avgCgpa: 0, profileCompletionRate: 0, topPercentileLeetcode: 0,
      topPercentileProjects: 0, studentsWithResume: 0, studentsWithInternship: 0,
    };

    const leetcodes = cohort.map(s => s.leetcodeStats?.totalSolved || 0);
    const projects = cohort.map(s => s.projects?.length || 0);
    const internships = cohort.map(s => s.internships?.length || 0);
    const cgpas = cohort.map(s => parseFloat(s.cgpa || '0') || 0).filter(v => v > 0);
    const completed = cohort.filter(s => s.profileCompleted).length;

    return {
      totalStudents: cohort.length,
      avgLeetcode: leetcodes.reduce((a, b) => a + b, 0) / cohort.length,
      avgProjects: projects.reduce((a, b) => a + b, 0) / cohort.length,
      avgInternships: internships.reduce((a, b) => a + b, 0) / cohort.length,
      avgCgpa: cgpas.length > 0 ? cgpas.reduce((a, b) => a + b, 0) / cgpas.length : 0,
      profileCompletionRate: Math.round((completed / cohort.length) * 100),
      topPercentileLeetcode: p80(leetcodes),
      topPercentileProjects: p80(projects),
      studentsWithResume: cohort.filter(s => s.resumeUrl).length,
      studentsWithInternship: cohort.filter(s => (s.internships?.length || 0) > 0).length,
    };
  }, [cohort]);

  const rank = useMemo((): UserRank => {
    if (cohort.length === 0) return { leetcodePercentile: 50, projectsPercentile: 50, cgpaPercentile: 50, overallPercentile: 50 };

    const leetcodes = cohort.map(s => s.leetcodeStats?.totalSolved || 0);
    const projects = cohort.map(s => s.projects?.length || 0);
    const cgpas = cohort.map(s => parseFloat(s.cgpa || '0') || 0);

    const lp = percentile(leetcodes, u?.leetcodeStats?.totalSolved || 0);
    const pp = percentile(projects, u?.projects?.length || 0);
    const cp = percentile(cgpas, parseFloat(u?.cgpa || '0') || 0);

    return {
      leetcodePercentile: lp,
      projectsPercentile: pp,
      cgpaPercentile: cp,
      overallPercentile: Math.round((lp + pp + cp) / 3),
    };
  }, [cohort, u]);

  const insights = useMemo(() => {
    if (!u || cohort.length === 0) return [];
    return generateInsights(stats, u, rank);
  }, [stats, u, rank, cohort]);

  const yearLabel = ['', '1st Year', '2nd Year', '3rd Year', '4th Year'][u?.currentYear || 1];

  return (
    <DashboardLayout role="student">
      <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">

        {/* Header */}
        <div className="rounded-3xl gradient-primary p-8 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest text-white/70">Peer Compass</span>
            </div>
            <h1 className="text-3xl font-black mb-1">How You Compare</h1>
            <p className="text-white/70 text-sm">Anonymous benchmarking against your {yearLabel} {u?.branch} batch.</p>
          </div>
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 font-medium">All comparisons are anonymous. No individual student data is shown — only aggregated batch statistics.</p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-400">Loading batch data...</p>
          </div>
        ) : cohort.length < 3 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="font-black text-slate-700">Not enough batch data yet</p>
            <p className="text-sm text-slate-400 mt-1">Peer Compass needs at least 3 students in your batch to show comparisons.</p>
          </div>
        ) : (
          <>
            {/* Overall percentile */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Overall Standing</p>
                  <p className="text-4xl font-black text-primary">Top {100 - rank.overallPercentile}%</p>
                  <p className="text-sm text-slate-500 mt-1">of {stats.totalStudents} students in your batch</p>
                </div>
                <div className="relative h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-primary, #6366f1)" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - rank.overallPercentile / 100)}`}
                      strokeLinecap="round" className="transition-all duration-700" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-primary">{rank.overallPercentile}%</span>
                </div>
              </div>

              <div className="space-y-5">
                <StatBar
                  label="LeetCode Problems"
                  userValue={u?.leetcodeStats?.totalSolved || 0}
                  avgValue={stats.avgLeetcode}
                  topValue={stats.topPercentileLeetcode}
                  icon={Code2}
                />
                <StatBar
                  label="Projects Built"
                  userValue={u?.projects?.length || 0}
                  avgValue={stats.avgProjects}
                  topValue={stats.topPercentileProjects}
                  icon={Briefcase}
                />
                <StatBar
                  label="CGPA"
                  userValue={parseFloat(u?.cgpa || '0') || 0}
                  avgValue={stats.avgCgpa}
                  topValue={10}
                  unit=""
                  icon={Award}
                />
              </div>
            </div>

            {/* Batch snapshot */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: FileText,
                  label: 'Have a Resume',
                  value: `${Math.round((stats.studentsWithResume / stats.totalStudents) * 100)}%`,
                  sub: `${stats.studentsWithResume} of ${stats.totalStudents} students`,
                  color: 'text-blue-600',
                },
                {
                  icon: Briefcase,
                  label: 'Have Internship',
                  value: `${Math.round((stats.studentsWithInternship / stats.totalStudents) * 100)}%`,
                  sub: `${stats.studentsWithInternship} of ${stats.totalStudents} students`,
                  color: 'text-green-600',
                },
                {
                  icon: Target,
                  label: 'Profile Complete',
                  value: `${stats.profileCompletionRate}%`,
                  sub: 'of your batch',
                  color: 'text-purple-600',
                },
                {
                  icon: TrendingUp,
                  label: 'Avg CGPA',
                  value: stats.avgCgpa.toFixed(2),
                  sub: 'batch average',
                  color: 'text-amber-600',
                },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <item.icon className={`w-4 h-4 ${item.color} mb-2`} />
                  <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                  <p className="text-xs font-black text-slate-700 mt-0.5">{item.label}</p>
                  <p className="text-[10px] text-slate-400">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            {insights.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Personalized Insights</h3>
                </div>
                <div className="space-y-3">
                  {insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-black text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
