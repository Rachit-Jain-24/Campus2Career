import { useState, useMemo } from 'react';
import {
    Code2,
    Trophy,
    CheckCircle2,
    Search,
    ArrowUpRight,
    Zap,
    Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { RECOMMENDED_PROBLEMS } from '../../data/leetcodeProblems';

export default function LeetCodeTracker() {
    const { user } = useAuth();
    const [selectedYear, setSelectedYear] = useState<number>(user?.currentYear || 1);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');

    // Get all solved slugs from user stats
    const solvedSlugs = useMemo(() => {
        if (!user?.leetcodeStats?.recentSubmissions) return new Set<string>();
        // Ideally we'd have a full list of all solved problems, 
        // but given the API constraints, we'll check against what we have.
        // In a real system, the backend would maintain the full solved list.
        return new Set(user.leetcodeStats.recentSubmissions
            .filter(s => s.statusDisplay === 'Accepted')
            .map(s => s.titleSlug));
    }, [user?.leetcodeStats]);

    // Categories available in the problem set
    const categories = useMemo(() => {
        const cats = new Set(RECOMMENDED_PROBLEMS.map(p => p.category));
        return ['All', ...Array.from(cats)].sort();
    }, []);

    // Filtered Problems
    const filteredProblems = useMemo(() => {
        return RECOMMENDED_PROBLEMS.filter(p => {
            const matchesYear = p.level === selectedYear;
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesYear && matchesCategory && matchesSearch;
        });
    }, [selectedYear, activeCategory, searchQuery]);

    // Grouping by category
    const groupedProblems = useMemo(() => {
        const groups: Record<string, typeof RECOMMENDED_PROBLEMS> = {};
        filteredProblems.forEach(p => {
            if (!groups[p.category]) groups[p.category] = [];
            groups[p.category].push(p);
        });
        return groups;
    }, [filteredProblems]);

    const stats = useMemo(() => {
        const yearProblems = RECOMMENDED_PROBLEMS.filter(p => p.level === selectedYear);
        const solvedInYear = yearProblems.filter(p => solvedSlugs.has(p.titleSlug)).length;
        const totalInYear = yearProblems.length;
        return { solvedInYear, totalInYear };
    }, [selectedYear, solvedSlugs]);

    const totalSolved = user?.leetcodeStats?.totalSolved || 0;

    const dsaReadiness = useMemo(() => {
        if (totalSolved < 30) return "Beginner";
        if (totalSolved >= 30 && totalSolved <= 120) return "Intermediate";
        return "Interview Ready";
    }, [totalSolved]);

    const nextDsaGoals = useMemo(() => {
        if (totalSolved < 30) {
            return {
                title: "Build Fundamentals",
                desc: "You are just getting started! Focus on basic data structures.",
                points: ["Focus on Array and String problems", "Build problem solving basics"]
            };
        } else if (totalSolved >= 30 && totalSolved <= 120) {
            return {
                title: "Level Up to Intermediate",
                desc: "You have a solid base! Time to expand your algorithmic patterns.",
                points: ["Solve Medium problems", "Practice Sliding Window", "Practice Binary Search", "Practice Tree problems"]
            };
        } else {
            return {
                title: "Master Advanced Patterns",
                desc: "You are doing great! Time for complex topics often asked in top tier companies.",
                points: ["Focus on Graph problems", "Practice Dynamic Programming", "Solve Interview pattern problems"]
            };
        }
    }, [totalSolved]);

    return (
        <DashboardLayout role="student">
            <div className="space-y-8 pb-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
                                <Code2 className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">LeetCode Tracker</h1>
                        </div>
                        <p className="text-slate-500 font-medium">Systematic problem-solving roadmap tailored for your current level.</p>
                    </div>

                    <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
                        {[1, 2, 3, 4].map(y => (
                            <button
                                key={y}
                                onClick={() => setSelectedYear(y)}
                                className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${selectedYear === y
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Year {y}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap className="h-16 w-16 text-orange-600" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Year {selectedYear} Progress</p>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-4xl font-black text-slate-900">{stats.solvedInYear}</span>
                            <span className="text-lg font-bold text-slate-400 mb-1">/ {stats.totalInYear} Solved</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                                style={{ width: `${stats.totalInYear ? (stats.solvedInYear / stats.totalInYear) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Trophy className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">DSA Readiness</p>
                                <p className="text-sm font-bold text-slate-700">Competency Level</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${dsaReadiness === 'Beginner' ? 'bg-orange-100 text-orange-700' :
                                    dsaReadiness === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                                        'bg-green-100 text-green-700'
                                }`}>
                                <Zap className="h-3 w-3" /> {dsaReadiness}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Global Solver Rank</p>
                            {user?.leetcodeStats?.ranking ? (
                                <p className="text-2xl font-black text-slate-900">#{user.leetcodeStats.ranking.toLocaleString()}</p>
                            ) : user?.leetcode ? (
                                <p className="text-sm font-medium text-slate-500">Loading from API...</p>
                            ) : (
                                <p className="text-sm font-medium text-slate-500">Not connected</p>
                            )}
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Target className="h-6 w-6 text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search problems by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-3 rounded-2xl text-xs font-black whitespace-nowrap border transition-all ${activeCategory === cat
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Next DSA Goal */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                            <Target className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Next DSA Goal</p>
                            <p className="text-lg font-bold text-slate-800">{nextDsaGoals.title}</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{nextDsaGoals.desc}</p>
                    <ul className="space-y-2">
                        {nextDsaGoals.points.map((point, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Problem Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {Object.entries(groupedProblems).map(([category, problems]) => (
                        <div key={category} className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                    {category}
                                </h2>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                                    {problems.length} Problems
                                </span>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                {problems.map((p, idx) => {
                                    const isSolved = solvedSlugs.has(p.titleSlug);
                                    return (
                                        <div
                                            key={p.id}
                                            className={`flex items-center justify-between p-4 group transition-colors ${idx !== problems.length - 1 ? 'border-b border-slate-100' : ''
                                                } ${isSolved ? 'bg-green-50/20' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${isSolved ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500'
                                                    }`}>
                                                    {isSolved ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-black">{idx + 1}</span>}
                                                </div>
                                                <div>
                                                    <h3 className={`text-sm font-bold ${isSolved ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                                        {p.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${p.difficulty === 'Easy' ? 'text-green-500' :
                                                            p.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-500'
                                                            }`}>
                                                            {p.difficulty}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                                            <Target className="h-2.5 w-2.5" /> High Freq
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <a
                                                href={`https://leetcode.com/problems/${p.titleSlug}/`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSolved
                                                    ? 'bg-slate-100 text-slate-400 cursor-default'
                                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white group-hover:scale-105'
                                                    }`}
                                            >
                                                {isSolved ? 'Completed' : 'Solve'}
                                                {!isSolved && <ArrowUpRight className="h-3 w-3" />}
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProblems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-1">No matches found</h3>
                        <p className="text-slate-500 max-w-xs px-4">Try adjusting your filters or search query to find more problems.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

