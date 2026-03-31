import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { LogoutButton } from '../../components/ui/LogoutButton';
import {
    Sparkles,
    ArrowRight,
    ArrowLeft,
    ChevronRight,
    Target,
    GraduationCap,
    Zap,
    Cloud,
    Brain,
    Globe,
    Lock,
    Code2,
    Database,
    Layers,
    Cpu,
    Palette,
    CheckSquare,
    Package,
    Orbit,
    Search,
    TrendingUp,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PsychometricAssessment } from '../../components/onboarding/PsychometricAssessment';

// ─── Domain Definitions ──────────────────────────────────────────────────────
const CAREER_DOMAINS = [
    {
        id: 'swe',
        title: 'Software Engineer',
        tagline: 'The foundation of every tech company.',
        icon: <Code2 className="w-6 h-6" />,
        color: 'from-slate-600 to-slate-800',
        badge: '🔥 Most Hired',
        badgeColor: 'bg-orange-100 text-orange-700',
        demand: '10/10',
        salaryRange: '₹6–25 LPA',
        growth: '+22% YoY',
        topRoles: ['Junior SDE', 'Software Developer', 'Application Engineer'],
        techStack: ['DSA', 'Java / Python', 'System Design', 'Git'],
        roadmap: [
            { yr: 'Year 1', title: 'Core CS', desc: 'Data Structures, Algorithms, OOP' },
            { yr: 'Year 2', title: 'Dev Skills', desc: 'Projects in Java/Python, Git, SQL' },
            { yr: 'Year 3', title: 'Internship', desc: 'Real SDE internship at a tech firm' },
            { yr: 'Year 4', title: 'Placement', desc: '150+ LeetCode + System Design ready' },
        ],
        why: 'Software Engineering is the gateway to every tech career. Almost every company — product, service or startup — hires SDEs.',
        certifications: ['Meta Backend Pro', 'Google IT Automation', 'AWS Solutions Architect'],
    },
    {
        id: 'web-dev',
        title: 'Full-Stack Developer',
        tagline: 'Build complete web products from scratch.',
        icon: <Globe className="w-6 h-6" />,
        color: 'from-blue-500 to-indigo-600',
        badge: '💼 High Demand',
        badgeColor: 'bg-blue-100 text-blue-700',
        demand: '9.8/10',
        salaryRange: '₹5–20 LPA',
        growth: '+19% YoY',
        topRoles: ['Front-end Lead', 'Full-Stack Dev', 'Product Engineer'],
        techStack: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
        roadmap: [
            { yr: 'Year 1', title: 'HTML/CSS/JS', desc: 'Build static websites & layouts' },
            { yr: 'Year 2', title: 'React + Node', desc: 'Full-stack CRUD apps & REST APIs' },
            { yr: 'Year 3', title: 'Portfolio', desc: '3 live projects + first internship' },
            { yr: 'Year 4', title: 'Product Scale', desc: 'Deploy at scale, system design' },
        ],
        why: 'Every startup needs someone who can build end-to-end. Full-stack devs are the most self-sufficient engineers in the industry.',
        certifications: ['Meta React Developer', 'Node.js Certification', 'Google UX Design'],
    },
    {
        id: 'ai-ml',
        title: 'AI / ML Engineer',
        tagline: 'Teach machines to think and learn.',
        icon: <Brain className="w-6 h-6" />,
        color: 'from-purple-500 to-pink-600',
        badge: '🚀 Ultra Growth',
        badgeColor: 'bg-purple-100 text-purple-700',
        demand: '9.9/10',
        salaryRange: '₹10–35 LPA',
        growth: '+40% YoY',
        topRoles: ['ML Engineer', 'AI Researcher', 'Data Scientist'],
        techStack: ['Python', 'PyTorch', 'TensorFlow', 'Mathematics'],
        roadmap: [
            { yr: 'Year 1', title: 'Math + Python', desc: 'Linear Algebra, Stats, Pandas' },
            { yr: 'Year 2', title: 'ML Models', desc: 'Supervised/Unsupervised Learning' },
            { yr: 'Year 3', title: 'Deep Learning', desc: 'Neural Nets, Computer Vision, NLP' },
            { yr: 'Year 4', title: 'Research / Job', desc: 'Publish papers or join AI labs' },
        ],
        why: 'AI is the defining technology of this decade. Companies like Google, OpenAI, and hundreds of startups are competing for ML talent.',
        certifications: ['DeepLearning.AI Specialization', 'Google ML Crash Course', 'Kaggle Competitions'],
    },
    {
        id: 'cloud',
        title: 'Cloud & DevOps',
        tagline: 'Scale systems that serve millions of users.',
        icon: <Cloud className="w-6 h-6" />,
        color: 'from-cyan-500 to-blue-600',
        badge: '☁️ Evergreen',
        badgeColor: 'bg-cyan-100 text-cyan-700',
        demand: '9.5/10',
        salaryRange: '₹8–22 LPA',
        growth: '+28% YoY',
        topRoles: ['Cloud Architect', 'DevOps Engineer', 'SRE'],
        techStack: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
        roadmap: [
            { yr: 'Year 1', title: 'Linux + Scripting', desc: 'Bash, Python, Networking basics' },
            { yr: 'Year 2', title: 'AWS / Azure', desc: 'Cloud fundamentals + certifications' },
            { yr: 'Year 3', title: 'CI/CD + Docker', desc: 'Automate deployments, build pipelines' },
            { yr: 'Year 4', title: 'Kubernetes', desc: 'Orchestration at enterprise scale' },
        ],
        why: 'Every company is on cloud. DevOps engineers eliminate the boundary between development and operations — a skill the industry is desperate for.',
        certifications: ['AWS Solutions Architect', 'CKA (Kubernetes)', 'HashiCorp Terraform'],
    },
    {
        id: 'cyber',
        title: 'Cybersecurity',
        tagline: 'Protect global systems and private data.',
        icon: <Lock className="w-6 h-6" />,
        color: 'from-red-500 to-orange-600',
        badge: '🛡️ Critical Role',
        badgeColor: 'bg-red-100 text-red-700',
        demand: '9.7/10',
        salaryRange: '₹7–25 LPA',
        growth: '+31% YoY',
        topRoles: ['Security Analyst', 'Pen Tester', 'Security Architect'],
        techStack: ['Kali Linux', 'Wireshark', 'Metasploit', 'Cryptography'],
        roadmap: [
            { yr: 'Year 1', title: 'Networking Basics', desc: 'OSI Model, TCP/IP, Firewalls' },
            { yr: 'Year 2', title: 'Ethical Hacking', desc: 'Kali Linux, CVEs, Bug Bounty' },
            { yr: 'Year 3', title: 'Specialization', desc: 'Web pentesting, DFIR, SOC' },
            { yr: 'Year 4', title: 'Certifications', desc: 'CEH, OSCP, CompTIA Security+' },
        ],
        why: 'Cyber attacks are increasing 300% per year. Cybersecurity professionals are in chronic shortage globally — the field promises stability and impact.',
        certifications: ['CompTIA Security+', 'CEH (Certified Ethical Hacker)', 'OSCP'],
    },
    {
        id: 'data-eng',
        title: 'Data Engineer',
        tagline: 'Build the pipelines that power AI and analytics.',
        icon: <Database className="w-6 h-6" />,
        color: 'from-amber-500 to-yellow-600',
        badge: '📊 Trending',
        badgeColor: 'bg-amber-100 text-amber-700',
        demand: '9.4/10',
        salaryRange: '₹8–24 LPA',
        growth: '+35% YoY',
        topRoles: ['Data Engineer', 'Analytics Engineer', 'ETL Developer'],
        techStack: ['Python', 'Apache Spark', 'Kafka', 'Airflow'],
        roadmap: [
            { yr: 'Year 1', title: 'SQL + Python', desc: 'Database querying and scripting' },
            { yr: 'Year 2', title: 'ETL Pipelines', desc: 'Airflow, dbt, data warehousing' },
            { yr: 'Year 3', title: 'Big Data Spark', desc: 'Kafka, Spark, real-time streaming' },
            { yr: 'Year 4', title: 'ML Ops', desc: 'Data platform engineering at scale' },
        ],
        why: 'Data Engineers fuel every ML/AI initiative. Without clean data pipelines, no AI model works — making this role critical in every data-driven company.',
        certifications: ['Google Professional Data Engineer', 'Databricks Spark', 'dbt Analytics Engineering'],
    },
    {
        id: 'product',
        title: 'Product Manager',
        tagline: 'Own the "what" and "why" of every tech product.',
        icon: <Layers className="w-6 h-6" />,
        color: 'from-green-500 to-emerald-600',
        badge: '📱 High Impact',
        badgeColor: 'bg-green-100 text-green-700',
        demand: '9.0/10',
        salaryRange: '₹10–30 LPA',
        growth: '+25% YoY',
        topRoles: ['Associate PM', 'Product Analyst', 'Growth PM'],
        techStack: ['Figma', 'SQL', 'Product Analytics', 'Roadmapping'],
        roadmap: [
            { yr: 'Year 1', title: 'Business + CS Mix', desc: 'Learn both tech and business thinking' },
            { yr: 'Year 2', title: 'Product Thinking', desc: 'Figma, user research, PRDs' },
            { yr: 'Year 3', title: 'PM Internship', desc: 'Work on real product decisions' },
            { yr: 'Year 4', title: 'APM Program', desc: 'Apply Flipkart/Google/Meesho APM' },
        ],
        why: 'PMs are the CEOs of products. With good CS skills, technical PMs earn premium packages and rise to leadership roles faster than any other track.',
        certifications: ['Google PM Certificate', 'Reforge Growth Series', 'Product School'],
    },
    {
        id: 'ux',
        title: 'UI / UX Designer',
        tagline: 'Design interfaces people love to use.',
        icon: <Palette className="w-6 h-6" />,
        color: 'from-rose-500 to-pink-600',
        badge: '🎨 Creative Tech',
        badgeColor: 'bg-rose-100 text-rose-700',
        demand: '9.1/10',
        salaryRange: '₹5–18 LPA',
        growth: '+20% YoY',
        topRoles: ['UI Designer', 'UX Researcher', 'Product Designer'],
        techStack: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
        roadmap: [
            { yr: 'Year 1', title: 'Design Principles', desc: 'Typography, color theory, layout' },
            { yr: 'Year 2', title: 'Figma Mastery', desc: 'End-to-end app design & prototyping' },
            { yr: 'Year 3', title: 'UX Research', desc: 'User interviews, usability testing' },
            { yr: 'Year 4', title: 'Portfolio Show', desc: '5+ case studies, design sprint' },
        ],
        why: 'In a world of thousands of apps, great UX wins users. Designers with a tech background (CSS, React) are highly valued cross-functional assets.',
        certifications: ['Google UX Design Certificate', 'Adobe Certified Expert', 'Interaction Design Foundation'],
    },
    {
        id: 'qa',
        title: 'QA / Automation',
        tagline: 'Ensure every product ships without breaking.',
        icon: <CheckSquare className="w-6 h-6" />,
        color: 'from-teal-500 to-cyan-600',
        badge: '✅ Stable Career',
        badgeColor: 'bg-teal-100 text-teal-700',
        demand: '8.8/10',
        salaryRange: '₹4–15 LPA',
        growth: '+16% YoY',
        topRoles: ['QA Engineer', 'Automation Test Engineer', 'SDET'],
        techStack: ['Selenium', 'Cypress', 'Postman', 'Python'],
        roadmap: [
            { yr: 'Year 1', title: 'Testing Basics', desc: 'Manual testing, test cases, SDLC' },
            { yr: 'Year 2', title: 'Automation', desc: 'Selenium, Cypress, API testing' },
            { yr: 'Year 3', title: 'CI Integration', desc: 'Integrate tests into CI/CD pipelines' },
            { yr: 'Year 4', title: 'SDET Track', desc: 'Performance testing, security QA' },
        ],
        why: 'Quality Assurance is a stable, in-demand career. Automation SDETs who write code earn comparable to developers and are crucial in every team.',
        certifications: ['ISTQB Certified Tester', 'Selenium with Java', 'Postman API Fundamentals'],
    },
    {
        id: 'blockchain',
        title: 'Blockchain Developer',
        tagline: 'Build decentralized apps on trustless networks.',
        icon: <Package className="w-6 h-6" />,
        color: 'from-orange-500 to-amber-600',
        badge: '⛓️ Next-Gen',
        badgeColor: 'bg-orange-100 text-orange-700',
        demand: '8.5/10',
        salaryRange: '₹8–30 LPA',
        growth: '+45% YoY',
        topRoles: ['Smart Contract Dev', 'DApp Developer', 'Web3 Engineer'],
        techStack: ['Solidity', 'Ethereum', 'Hardhat', 'IPFS'],
        roadmap: [
            { yr: 'Year 1', title: 'CS Fundamentals', desc: 'Cryptography, distributed systems' },
            { yr: 'Year 2', title: 'Solidity & ETH', desc: 'Write and deploy smart contracts' },
            { yr: 'Year 3', title: 'DApp Projects', desc: 'Build DeFi, NFT, DAO apps' },
            { yr: 'Year 4', title: 'Web3 Ecosystem', desc: 'Layer 2 solutions, cross-chain protocols' },
        ],
        why: 'Blockchain eliminates middlemen from finance, supply chains, and law. Web3 developers are among the highest-paid in the world with massive global demand.',
        certifications: ['Certified Blockchain Developer (CBDH)', 'Ethereum Developer Certification', 'Chainlink Bootcamp'],
    },
    {
        id: 'ar-vr',
        title: 'AR / VR Developer',
        tagline: 'Build immersive experiences in spatial computing.',
        icon: <Orbit className="w-6 h-6" />,
        color: 'from-violet-500 to-purple-700',
        badge: '🥽 Spatial Tech',
        badgeColor: 'bg-violet-100 text-violet-700',
        demand: '8.6/10',
        salaryRange: '₹8–25 LPA',
        growth: '+52% YoY',
        topRoles: ['XR Developer', 'Unity Engineer', '3D Software Developer'],
        techStack: ['Unity', 'Unreal Engine', 'ARKit/ARCore', 'C#'],
        roadmap: [
            { yr: 'Year 1', title: '3D + C#', desc: 'Unity engine, 3D modeling basics' },
            { yr: 'Year 2', title: 'AR + VR SDK', desc: 'ARKit, ARCore, Meta Quest SDK' },
            { yr: 'Year 3', title: 'Immersive Apps', desc: 'Training simulations, spatial UI' },
            { yr: 'Year 4', title: 'Spatial OS', desc: 'Apple Vision Pro, WebXR, enterprise XR' },
        ],
        why: 'Spatial computing is the next platform after mobile. Apple Vision Pro, Meta Quest and enterprise AR are creating a massive wave of new developer demand.',
        certifications: ['Unity Certified Developer', 'Meta Spark AR Creator', 'Google ARCore'],
    },
    {
        id: 'drone',
        title: 'Drone / Embedded Systems',
        tagline: 'Program intelligence into physical hardware.',
        icon: <Cpu className="w-6 h-6" />,
        color: 'from-stone-600 to-zinc-700',
        badge: '🤖 Hardware + AI',
        badgeColor: 'bg-stone-100 text-stone-700',
        demand: '8.4/10',
        salaryRange: '₹6–20 LPA',
        growth: '+38% YoY',
        topRoles: ['Embedded Systems Engineer', 'Drone Software Dev', 'Robotics Engineer'],
        techStack: ['C/C++', 'RTOS', 'ROS', 'PX4 / ArduPilot'],
        roadmap: [
            { yr: 'Year 1', title: 'Electronics Basics', desc: 'Circuits, microcontrollers, C++' },
            { yr: 'Year 2', title: 'Embedded Dev', desc: 'ARM, RTOS, sensor integration' },
            { yr: 'Year 3', title: 'Robotics / Drone', desc: 'ROS, flight controllers, UAV builds' },
            { yr: 'Year 4', title: 'AI on Edge', desc: 'Computer vision on edge devices' },
        ],
        why: 'Drones, smart manufacturing, autonomous vehicles, and IoT are merging. Engineers who can code hardware and software command premium salaries worldwide.',
        certifications: ['NPTEL Embedded Systems', 'PX4 Developer Certificate', 'ROS Industrial Training'],
    },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CareerDiscoveryPage() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState<'welcome' | 'explorer' | 'mentor' | 'deepdive' | 'confirm'>('welcome');
    const [selectedDomain, setSelectedDomain] = useState<typeof CAREER_DOMAINS[0] | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDomains = CAREER_DOMAINS.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleComplete = async (domain: typeof CAREER_DOMAINS[0]) => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateUser({
                ...user,
                careerTrack: domain.title,
                careerTrackEmoji: '🎯',
                careerDiscoveryCompleted: true,
                assessmentCompleted: true,       // skip separate assessment step
                profileCompleted: false,
                interests: [domain.title],
            });
            navigate('/student/profile-setup');
        } catch (error: any) {
            console.error('Error in Discovery:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            {/* ── Header ── */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-8 fixed top-0 w-full z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl rotate-3 shadow-lg shadow-primary/20">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-black text-slate-900 tracking-tight text-xl">CAMPUS<span className="text-primary">2</span>CAREER</span>
                </div>
                <LogoutButton />
            </header>

            <main className="flex-1 pt-24 pb-20 px-4 md:px-10 max-w-7xl mx-auto w-full">
                <AnimatePresence mode="wait">

                    {/* ══ VIEW: WELCOME ══ */}
                    {view === 'welcome' && (
                        <motion.div key="welcome" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center gap-8 pt-16 max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-bold text-xs uppercase tracking-widest">
                                <Sparkles className="w-3 h-3" /> Freshers Discovery Hub
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
                                Which engineering path is <span className="text-primary">yours?</span>
                            </h1>
                            <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
                                Most students don't know their path yet — and that's perfectly normal.
                                Explore <strong>12 trending career tracks</strong> with real salary data, roadmaps, and certifications. Find where you belong.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                                <Button className="h-16 px-10 text-lg rounded-2xl shadow-2xl shadow-primary/30" onClick={() => setView('explorer')}>
                                    Explore All Careers <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                                <button
                                    className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors px-6 py-3 border border-slate-200 rounded-2xl bg-white hover:border-primary/40"
                                    onClick={() => setView('mentor')}
                                >
                                    <Brain className="w-5 h-5 text-primary" /> Help me choose (AI Quiz)
                                </button>
                            </div>
                            {/* Trending badge strip */}
                            <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-2xl">
                                {CAREER_DOMAINS.map(d => (
                                    <span key={d.id} className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">{d.title}</span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ══ VIEW: EXPLORER ══ */}
                    {view === 'explorer' && (
                        <motion.div key="explorer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900">Trending Career Tracks</h2>
                                    <p className="text-slate-500 text-sm mt-1">Click any card for a full deep dive — roadmap, salary & certs.</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search roles or tech..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <X className="w-3.5 h-3.5 text-slate-400" />
                                            </button>
                                        )}
                                    </div>
                                    <Button variant="outline" onClick={() => setView('welcome')} className="rounded-xl shrink-0">
                                        <ArrowLeft className="mr-1 w-4 h-4" /> Back
                                    </Button>
                                </div>
                            </div>

                            {/* Grid */}
                            {filteredDomains.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                    <p className="font-bold">No results for "{searchQuery}"</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {filteredDomains.map((domain, idx) => (
                                        <motion.div
                                            key={domain.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            whileHover={{ y: -6, boxShadow: '0 24px 40px -8px rgba(0,0,0,0.12)' }}
                                            className={`group relative bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-4 cursor-pointer transition-all ${selectedDomain?.id === domain.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                            onClick={() => {
                                                setSelectedDomain(domain);
                                                setView('deepdive');
                                            }}
                                        >
                                            {/* Badge */}
                                            <span className={`absolute top-4 right-4 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${domain.badgeColor}`}>
                                                {domain.badge}
                                            </span>
                                            {/* Icon */}
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${domain.color} flex items-center justify-center text-white shadow-lg`}>
                                                {domain.icon}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 space-y-1">
                                                <h3 className="text-base font-bold text-slate-900">{domain.title}</h3>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{domain.tagline}</p>
                                            </div>
                                            {/* Stats row */}
                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                                                <div>
                                                    <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Demand</div>
                                                    <div className="text-xs font-bold text-slate-800">{domain.demand}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Salary (India)</div>
                                                    <div className="text-xs font-bold text-primary">{domain.salaryRange}</div>
                                                </div>
                                            </div>
                                            {/* Explore CTA */}
                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex gap-1 flex-wrap">
                                                    {domain.techStack.slice(0, 2).map(t => (
                                                        <span key={t} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{t}</span>
                                                    ))}
                                                </div>
                                                <span className="text-xs font-black text-primary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                                                    Deep Dive <ChevronRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ══ VIEW: AI MENTOR ══ */}
                    {view === 'mentor' && (
                        <motion.div key="mentor" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                            <PsychometricAssessment
                                onComplete={(recommended) => {
                                    const match = CAREER_DOMAINS.find(d => d.title === recommended) || CAREER_DOMAINS[0];
                                    setSelectedDomain(match);
                                    setView('deepdive');
                                }}
                                onCancel={() => setView('explorer')}
                            />
                        </motion.div>
                    )}

                    {/* ══ VIEW: DEEP DIVE ══ */}
                    {view === 'deepdive' && selectedDomain && (
                        <motion.div key="deepdive" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full space-y-6 max-w-5xl mx-auto">
                            {/* Back nav */}
                            <button onClick={() => setView('explorer')} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-700 transition-colors text-sm">
                                <ArrowLeft className="w-4 h-4" /> Back to All Careers
                            </button>

                            {/* Hero Card */}
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl">
                                {/* Color strip */}
                                <div className={`h-2 w-full bg-gradient-to-r ${selectedDomain.color}`} />

                                <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-5 gap-10">
                                    {/* Left: main info */}
                                    <div className="lg:col-span-3 space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedDomain.color} flex items-center justify-center text-white shadow-xl`}>
                                                {selectedDomain.icon}
                                            </div>
                                            <div>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${selectedDomain.badgeColor}`}>
                                                    {selectedDomain.badge}
                                                </span>
                                                <h2 className="text-3xl font-black text-slate-900 mt-1">{selectedDomain.title}</h2>
                                                <p className="text-slate-500 font-medium">{selectedDomain.tagline}</p>
                                            </div>
                                        </div>

                                        {/* Why section */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Sparkles className="w-3.5 h-3.5 text-primary" /> Why this career?
                                            </h4>
                                            <p className="text-slate-700 text-sm leading-relaxed font-medium">{selectedDomain.why}</p>
                                        </div>

                                        {/* Roadmap */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">4-Year Mastery Roadmap</h4>
                                            <div className="relative space-y-4">
                                                <div className="absolute left-4 top-3 bottom-3 w-px bg-slate-100" />
                                                {selectedDomain.roadmap.map((step, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="flex gap-5 items-start relative z-10"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                                                            {i + 1}
                                                        </div>
                                                        <div className="bg-white border border-slate-100 rounded-xl p-4 flex-1 hover:border-primary/30 transition-colors">
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step.yr}</div>
                                                            <div className="text-sm font-bold text-slate-900 mt-0.5">{step.title}</div>
                                                            <div className="text-xs text-slate-500 mt-0.5">{step.desc}</div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: data sidebar */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Market data */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
                                                <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Demand</div>
                                                <div className="text-2xl font-black text-blue-900">{selectedDomain.demand}</div>
                                            </div>
                                            <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 space-y-1">
                                                <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Growth</div>
                                                <div className="text-xl font-black text-purple-900">{selectedDomain.growth}</div>
                                            </div>
                                            <div className="col-span-2 p-5 bg-green-50 rounded-2xl border border-green-100 space-y-1">
                                                <div className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> India Salary Range
                                                </div>
                                                <div className="text-2xl font-black text-green-900">{selectedDomain.salaryRange}</div>
                                            </div>
                                        </div>

                                        {/* Top roles */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Top Entry-Level Roles</h4>
                                            {selectedDomain.topRoles.map(role => (
                                                <div key={role} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                    <span className="text-sm font-bold text-slate-700">{role}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Core tech */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Core Tech Stack</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDomain.techStack.map(tech => (
                                                    <span key={tech} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
                                                        <Zap className="w-3 h-3 text-primary" /> {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Certifications */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recommended Certifications</h4>
                                            {selectedDomain.certifications.map((cert, i) => (
                                                <div key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                                                    <Target className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                                    {cert}
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA */}
                                        <div className="space-y-3 pt-2">
                                            <Button
                                                className="w-full h-14 rounded-2xl text-base font-black shadow-xl shadow-primary/25"
                                                onClick={() => handleComplete(selectedDomain)}
                                                isLoading={isSaving}
                                            >
                                                Choose This Track <ArrowRight className="ml-2 w-5 h-5" />
                                            </Button>
                                            <button
                                                onClick={() => setView('explorer')}
                                                className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-2"
                                            >
                                                ← Explore more careers
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            <footer className="py-6 text-center text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase">
                NMIMS HYDERABAD • CAREER EMPOWERMENT INITIATIVE 2026
            </footer>
        </div>
    );
}
