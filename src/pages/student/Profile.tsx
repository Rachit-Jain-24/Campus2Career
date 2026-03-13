"use client";

import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
    User, Mail, Phone, Hash, UserCircle, Star, Github, Linkedin, Code2, Link as LinkIcon, Edit3, Trash2, X, GraduationCap, MapPin, Plus, Save, CheckCircle2, Trophy, BookOpen, ExternalLink, FileText, Upload, Scan, Search, AlertCircle, Zap, Sparkles, Flame, Briefcase, Award
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";
import { storage } from "../../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { analyzeProfileWithAI } from "../../lib/gemini";
import type { ProfileAnalysis } from "../../lib/gemini";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
    id: number; title: string; tech: string; description: string; link: string; year: string;
}
interface Certification {
    id: number; name: string; issuer: string; year: string; link: string;
}
interface Internship {
    id: number; role: string; company: string; period: string; description: string;
}
interface Achievement {
    id: number; title: string; description: string; year: string;
}

// ─── Tab helper ───────────────────────────────────────────────────────────────
const tabs = ["Overview", "Skills", "Projects", "Internships", "Certifications", "Achievements"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const { user, updateUser } = useAuth();

    const [activeTab, setActiveTab] = useState("Overview");
    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        location: user?.location || "NMIMS Hyderabad Campus",
        placementStatus: user?.placementStatus || "Actively Preparing",
        program: user?.branch || "B.Tech",
        cgpa: user?.cgpa || user?.assessmentResults?.cgpa || "8.0",
        rollNo: user?.rollNo || "",
        sapId: user?.sapId || "",
        batch: "2022-2026",
        githubUrl: user?.githubUrl || "",
        linkedinUrl: user?.linkedinUrl || "",
        leetcodeUrl: user?.leetcode ? `https://leetcode.com/${user.leetcode}` : "",
        resumeUrl: user?.resumeUrl || "",
        resumeName: user?.resumeName || "resume.pdf",
        year: user?.currentYear === 1 ? '1st Year' : user?.currentYear === 2 ? '2nd Year' : user?.currentYear === 3 ? '3rd Year' : '4th Year'
    });

    const [editingBasic, setEditingBasic] = useState(false);
    const [skills, setSkills] = useState<string[]>(user?.techSkills || []);
    const [newSkill, setNewSkill] = useState("");
    const [projects, setProjects] = useState(user?.projects || []);
    const [certs, setCerts] = useState(user?.certifications || []);
    const [internships, setInternships] = useState(user?.internships || []);
    const [achievements, setAchievements] = useState(user?.achievements || []);
    const [interests, setInterests] = useState<string[]>(user?.interests || []);
    const [newInterest, setNewInterest] = useState("");
    const [saved, setSaved] = useState(false);
    const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);

    // Adding forms
    const [addingProject, setAddingProject] = useState(false);
    const [addingCert, setAddingCert] = useState(false);
    const [addingInternship, setAddingInternship] = useState(false);
    const [addingAchievement, setAddingAchievement] = useState(false);

    const [newProject, setNewProject] = useState<Omit<Project, "id">>({ title: "", tech: "", description: "", link: "", year: new Date().getFullYear().toString() });
    const [newCert, setNewCert] = useState<Omit<Certification, "id">>({ name: "", issuer: "", year: "", link: "" });
    const [newInternship, setNewInternship] = useState<Omit<Internship, "id">>({ role: "", company: "", period: "", description: "" });
    const [newAchievement, setNewAchievement] = useState<Omit<Achievement, "id">>({ title: "", description: "", year: "" });

    // Sync state when user object loads or updates
    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                bio: user.bio || "",
                location: user.location || "NMIMS Hyderabad Campus",
                placementStatus: user.placementStatus || "Actively Preparing",
                program: user.branch || "B.Tech",
                cgpa: user.cgpa || user.assessmentResults?.cgpa || "8.0",
                rollNo: user.rollNo || "",
                sapId: user.sapId || "",
                batch: "2022-2026",
                githubUrl: user.githubUrl || "",
                linkedinUrl: user.linkedinUrl || "",
                leetcodeUrl: user.leetcode ? `https://leetcode.com/${user.leetcode}` : "",
                resumeUrl: user.resumeUrl || "",
                resumeName: user.resumeName || "resume.pdf",
                year: user.currentYear === 1 ? '1st Year' : user.currentYear === 2 ? '2nd Year' : user.currentYear === 3 ? '3rd Year' : '4th Year'
            });
            setSkills(user.techSkills || []);
            setProjects(user.projects || []);
            setCerts(user.certifications || []);
            setInternships(user.internships || []);
            setAchievements(user.achievements || []);
            setInterests(user.interests || []);
            setResumeRef(user.resumeUrl || null);
        }
    }, [user]);

    // Resume States
    const [resumeRef, setResumeRef] = useState<string | null>(user?.resumeUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (file.type !== "application/pdf") {
            alert("Please upload a PDF file.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const storageRef = ref(storage, `resumes/${user.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(Math.round(progress));
                },
                (error) => {
                    console.error("Upload failed:", error);
                    alert("Upload failed. Please try again.");
                    setIsUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    await updateUser({ ...user, resumeUrl: downloadURL, resumeName: file.name });
                    setResumeRef(downloadURL);
                    setProfile(prev => ({ ...prev, resumeUrl: downloadURL, resumeName: file.name }));
                    setSaved(true);
                    setIsUploading(false);
                    setTimeout(() => setSaved(false), 2000);
                }
            );
        } catch (error) {
            console.error("Setup failed:", error);
            setIsUploading(false);
        }
    };

    const handleSave = async (overrides = {}) => {
        // Prevent passing React event objects as overrides
        const finalOverrides = (overrides && (overrides as any).nativeEvent) ? {} : overrides;

        if (user) {
            let parsedLeetcode = user.leetcode || "";
            if (profile.leetcodeUrl && profile.leetcodeUrl.trim() !== "") {
                const parts = profile.leetcodeUrl.replace(/\/$/, '').split('/');
                parsedLeetcode = parts[parts.length - 1] || profile.leetcodeUrl;
            }

            const updatedUser: any = {
                ...user,
                name: profile.name,
                phone: profile.phone,
                bio: profile.bio,
                location: profile.location,
                placementStatus: profile.placementStatus,
                githubUrl: profile.githubUrl,
                linkedinUrl: profile.linkedinUrl,
                leetcode: parsedLeetcode,
                interests: interests,
                techSkills: skills,
                projects: projects,
                certifications: certs,
                internships: internships,
                achievements: achievements,
                assessmentResults: {
                    ...(user.assessmentResults || {}),
                    cgpa: profile.cgpa
                },
                ...finalOverrides
            };

            if (!parsedLeetcode) {
                delete updatedUser.leetcodeStats;
            }

            await updateUser(updatedUser);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
        setEditingBasic(false);
    };

    const addSkill = async () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            const updated = [...skills, newSkill.trim()];
            setSkills(updated);
            setNewSkill("");
            if (user) await updateUser({ ...user, techSkills: updated });
        }
    };

    const removeSkill = async (s: string) => {
        const updated = skills.filter(sk => sk !== s);
        setSkills(updated);
        if (user) await updateUser({ ...user, techSkills: updated });
    };

    const addInterest = async () => {
        if (newInterest.trim() && !interests.includes(newInterest.trim())) {
            const updated = [...interests, newInterest.trim()];
            setInterests(updated);
            setNewInterest("");
            if (user) await updateUser({ ...user, interests: updated });
        }
    };

    const removeInterest = async (i: string) => {
        const updated = interests.filter(x => x !== i);
        setInterests(updated);
        if (user) await updateUser({ ...user, interests: updated });
    };

    const completionFields = [
        profile.name, profile.phone, profile.bio,
        profile.githubUrl, profile.linkedinUrl,
        skills.length > 0 ? "yes" : "", projects.length > 0 ? "yes" : "",
        certs.length > 0 ? "yes" : "",
    ];
    const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

    const yearGradient: Record<string, string> = {
        "1st Year": "year-badge-1",
        "2nd Year": "year-badge-2",
        "3rd Year": "year-badge-3",
        "4th Year": "year-badge-4",
    };

    return (
        <DashboardLayout role="student" userName={profile.name} userYear={profile.year} userProgram={profile.program}>
            <div className="space-y-6 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Profile</h1>
                        <p className="text-muted-foreground">Manage your career portfolio — visible to faculty &amp; admins</p>
                    </div>
                    {saved && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-green-700 text-sm font-medium animate-fade-in-up">
                            <CheckCircle2 className="h-4 w-4" /> Profile saved!
                        </div>
                    )}
                </div>

                {/* Hero Profile Card */}
                <Card className="overflow-hidden">
                    <div className="h-24 gradient-primary relative">
                        <div className={`absolute top-2 right-4 text-white text-xs font-bold px-3 py-1 rounded-full ${yearGradient[profile.year] || "bg-white/20"} bg-white/20 border border-white/40`}>
                            {profile.year}
                        </div>
                    </div>
                    <CardContent className="relative pt-0">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar */}
                            <div className="-mt-10 relative shrink-0">
                                <div className="h-20 w-20 rounded-2xl gradient-primary text-white text-3xl font-bold flex items-center justify-center shadow-lg border-4 border-white">
                                    {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white" title="Active" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 pt-2">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                                        <p className="text-muted-foreground text-sm">{profile.rollNo} &bull; {profile.batch}</p>
                                        <p className="text-sm font-medium text-primary mt-0.5">{profile.program}</p>
                                        <p className="mt-2 text-sm text-muted-foreground max-w-lg">{profile.bio}</p>

                                        {/* Interests */}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {interests.map(i => (
                                                <span key={i} className="skill-pill">✦ {i}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Profile Completion */}
                                    <div className="shrink-0 text-center p-4 rounded-xl bg-secondary border min-w-[130px]">
                                        <div className="text-3xl font-bold text-primary">{completionPct}%</div>
                                        <p className="text-xs text-muted-foreground mt-0.5">Profile Complete</p>
                                        <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full gradient-primary rounded-full progress-animated"
                                                style={{ width: `${completionPct}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {completionPct < 100 ? "Fill more to stand out!" : "🎉 Complete!"}
                                        </p>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {profile.githubUrl && (
                                        <a href={profile.githubUrl} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                            <Github className="h-4 w-4" /> GitHub
                                        </a>
                                    )}
                                    {profile.linkedinUrl && (
                                        <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                            <Linkedin className="h-4 w-4" /> LinkedIn
                                        </a>
                                    )}
                                    {profile.leetcodeUrl && (
                                        <a href={profile.leetcodeUrl} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                            <Code2 className="h-4 w-4" /> LeetCode
                                        </a>
                                    )}
                                    {profile.resumeUrl && (
                                        <a href={profile.resumeUrl} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                                            <ExternalLink className="h-4 w-4" /> View Resume
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="shrink-0 flex flex-row md:flex-col gap-3">
                                <div className="rounded-xl bg-secondary p-3 text-center min-w-[80px]">
                                    <p className="text-xl font-bold text-primary">{profile.cgpa}</p>
                                    <p className="text-xs text-muted-foreground">CGPA</p>
                                </div>
                                <div className="rounded-xl bg-secondary p-3 text-center min-w-[80px]">
                                    <p className="text-xl font-bold text-blue-600">{projects.length}</p>
                                    <p className="text-xs text-muted-foreground">Projects</p>
                                </div>
                                <div className="rounded-xl bg-secondary p-3 text-center min-w-[80px]">
                                    <p className="text-xl font-bold text-green-600">{certs.length}</p>
                                    <p className="text-xs text-muted-foreground">Certs</p>
                                </div>
                            </div>
                        </div>

                        {/* Placement Status badge */}
                        <div className="mt-4 flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Status:</span>
                            <Badge variant="warning">{profile.placementStatus}</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex gap-1 border-b overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                                ? "tab-active text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Overview ─────────────────────────────────────────── */}
                {activeTab === "Overview" && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" /> Personal Information
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingBasic(!editingBasic)}
                                        className="flex items-center gap-1.5"
                                    >
                                        {editingBasic ? <><X className="h-3.5 w-3.5" /> Cancel</> : <><Edit3 className="h-3.5 w-3.5" /> Edit</>}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {editingBasic ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {[
                                            { label: "Full Name", key: "name", icon: User },
                                            { label: "Email", key: "email", icon: Mail },
                                            { label: "Phone", key: "phone", icon: Phone },
                                            { label: "Program", key: "program", icon: GraduationCap },
                                            { label: "CGPA", key: "cgpa", icon: Star },
                                            { label: "Roll Number", key: "rollNo", icon: Hash },
                                            { label: "SAP ID", key: "sapId", icon: UserCircle },
                                            { label: "GitHub URL", key: "githubUrl", icon: Github },
                                            { label: "LinkedIn URL", key: "linkedinUrl", icon: Linkedin },
                                            { label: "LeetCode URL", key: "leetcodeUrl", icon: Code2 },
                                            { label: "Resume Link", key: "resumeUrl", icon: LinkIcon },
                                        ].map(({ label, key, icon: Icon }) => (
                                            <div key={key} className="space-y-1.5">
                                                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                    <Icon className="h-3.5 w-3.5" /> {label}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={(profile as unknown as Record<string, string>)[key] || ""}
                                                    onChange={e => setProfile({ ...profile, [key]: e.target.value })}
                                                    readOnly={key === 'rollNo' || key === 'sapId'}
                                                    className={cn(
                                                        "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all",
                                                        (key === 'rollNo' || key === 'sapId') && "bg-slate-50 cursor-not-allowed text-muted-foreground opacity-70"
                                                    )}
                                                />
                                            </div>
                                        ))}
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground">Bio</label>
                                            <textarea
                                                value={profile.bio}
                                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                                rows={3}
                                                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground">Placement Status</label>
                                            <select
                                                value={profile.placementStatus}
                                                onChange={e => setProfile({ ...profile, placementStatus: e.target.value })}
                                                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option>Actively Preparing</option>
                                                <option>Ready for Placement</option>
                                                <option>Placed</option>
                                                <option>Higher Studies</option>
                                                <option>Not Interested Yet</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t mt-2">
                                            <Button variant="ghost" onClick={() => setEditingBasic(false)} className="flex items-center gap-1.5">
                                                Cancel
                                            </Button>
                                            <Button onClick={() => handleSave()} className="flex items-center gap-1.5 min-w-[120px]">
                                                {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {[
                                            { icon: User, label: "Name", value: profile.name },
                                            { icon: Mail, label: "Email", value: profile.email },
                                            { icon: Phone, label: "Phone", value: profile.phone },
                                            { icon: Hash, label: "Roll No", value: profile.rollNo },
                                            { icon: UserCircle, label: "SAP ID", value: profile.sapId },
                                            { icon: GraduationCap, label: "Program", value: `${profile.program} • ${profile.year}` },
                                            { icon: MapPin, label: "Campus", value: profile.location },
                                            { icon: Star, label: "CGPA", value: `${profile.cgpa} / 10` },
                                            { icon: Github, label: "GitHub", value: profile.githubUrl || "Click Edit to add GitHub" },
                                            { icon: Linkedin, label: "LinkedIn", value: profile.linkedinUrl || "Click Edit to add LinkedIn" },
                                            { icon: Code2, label: "LeetCode", value: profile.leetcodeUrl || "Click Edit to add LeetCode" },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-secondary/50 transition-colors">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                    <Icon className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">{label}</p>
                                                    <p className="text-sm font-medium">{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Interests & Links */}
                        <div className="space-y-4">
                            {/* Interests */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-primary" /> Interests & Tracks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {interests.map(i => (
                                            <span key={i} className="skill-pill selected group">
                                                {i}
                                                <button onClick={() => removeInterest(i)}
                                                    className="ml-1.5 opacity-60 hover:opacity-100">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newInterest}
                                            onChange={e => setNewInterest(e.target.value)}
                                            onKeyPress={e => e.key === "Enter" && addInterest()}
                                            placeholder="Add interest..."
                                            className="flex-1 h-8 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                        <Button size="sm" onClick={addInterest}><Plus className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Education */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-primary" /> Education
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-xl border p-4 bg-gradient-to-br from-primary/5 to-transparent">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center text-white shrink-0">
                                                <GraduationCap className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{profile.program}</h4>
                                                <p className="text-sm text-muted-foreground">NMIMS Hyderabad • {profile.batch}</p>
                                                <p className="mt-1 text-sm">CGPA: <span className="font-bold text-primary">{profile.cgpa}</span>/10</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Roll No: {profile.rollNo}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI Career Strength Widget - Intelligent Calculation */}
                            <Card className="border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Sparkles className="h-16 w-16" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-white/90">
                                        <Zap className="h-5 w-5 text-yellow-400" /> AI Career Strength
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {(() => {
                                        // Calculate AI Career Strength Score
                                        let score = 0;
                                        let status = "Getting Started";
                                        let feedback = "";
                                        let targetRole = user?.careerTrack || "Software Engineer";

                                        // Projects (max 25 points)
                                        const projectCount = projects.length;
                                        if (projectCount >= 5) score += 25;
                                        else if (projectCount >= 3) score += 20;
                                        else if (projectCount >= 2) score += 15;
                                        else if (projectCount >= 1) score += 10;

                                        // LeetCode (max 20 points)
                                        const leetcodeSolved = user?.leetcodeStats?.totalSolved || 0;
                                        if (leetcodeSolved >= 200) score += 20;
                                        else if (leetcodeSolved >= 150) score += 17;
                                        else if (leetcodeSolved >= 100) score += 14;
                                        else if (leetcodeSolved >= 50) score += 10;
                                        else if (leetcodeSolved >= 20) score += 5;

                                        // Skills (max 20 points)
                                        const skillCount = skills.length;
                                        if (skillCount >= 10) score += 20;
                                        else if (skillCount >= 7) score += 15;
                                        else if (skillCount >= 5) score += 12;
                                        else if (skillCount >= 3) score += 8;

                                        // Certifications (max 15 points)
                                        const certCount = certs.length;
                                        if (certCount >= 4) score += 15;
                                        else if (certCount >= 3) score += 12;
                                        else if (certCount >= 2) score += 9;
                                        else if (certCount >= 1) score += 5;

                                        // Internships (max 15 points)
                                        const internshipCount = internships.length;
                                        if (internshipCount >= 3) score += 15;
                                        else if (internshipCount >= 2) score += 12;
                                        else if (internshipCount >= 1) score += 8;

                                        // CGPA (max 10 points)
                                        const cgpaValue = parseFloat(profile.cgpa || "0");
                                        if (cgpaValue >= 9.0) score += 10;
                                        else if (cgpaValue >= 8.5) score += 8;
                                        else if (cgpaValue >= 8.0) score += 6;
                                        else if (cgpaValue >= 7.5) score += 4;

                                        // Resume (5 points)
                                        if (profile.resumeUrl) score += 5;

                                        // Determine status and feedback based on score
                                        if (score >= 85) {
                                            status = "Industry Leader";
                                            feedback = `Outstanding profile! With ${projectCount} projects, ${leetcodeSolved} problems solved, and ${internshipCount} internships, you're ready for top-tier companies.`;
                                        } else if (score >= 70) {
                                            status = "Placement Ready";
                                            feedback = `Strong profile with ${projectCount} projects and ${leetcodeSolved} LeetCode problems. You're well-prepared for campus placements.`;
                                        } else if (score >= 55) {
                                            status = "Industry Ready";
                                            feedback = `Good foundation with ${projectCount} projects. Focus on increasing LeetCode problems and adding more certifications.`;
                                        } else if (score >= 40) {
                                            status = "Building Momentum";
                                            feedback = `You're on the right track! Keep building projects and solving DSA problems to strengthen your profile.`;
                                        } else {
                                            status = "Foundation Phase";
                                            feedback = `Great start! Focus on building 2-3 projects and solving at least 50 LeetCode problems this semester.`;
                                        }

                                        return (
                                            <>
                                                <div className="flex items-center gap-6">
                                                    <div className="relative shrink-0">
                                                        <svg className="h-24 w-24 transform -rotate-90">
                                                            <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
                                                            <circle
                                                                cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent"
                                                                strokeDasharray={263.8}
                                                                strokeDashoffset={263.8 - (263.8 * score) / 100}
                                                                className={cn(
                                                                    "transition-all duration-1000 ease-out",
                                                                    score > 75 ? "text-emerald-400" : score > 50 ? "text-yellow-400" : "text-orange-400"
                                                                )}
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-2xl font-black">{score}</span>
                                                            <span className="text-[8px] uppercase font-bold tracking-widest text-white/40">Power Score</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Career Status</p>
                                                        <h3 className="text-lg font-bold leading-tight">{status}</h3>
                                                        <p className="text-xs text-white/60 mt-1">Year {user?.currentYear} • {user?.branch}</p>
                                                    </div>
                                                </div>

                                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                                    <p className="text-[10px] uppercase font-bold text-white/40 mb-1">AI Analysis</p>
                                                    <p className="text-xs text-white/80 leading-relaxed italic">"{feedback}"</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                                        <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Target Role</p>
                                                        <p className="text-xs font-bold truncate">{targetRole}</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                                        <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Next Milestone</p>
                                                        <p className="text-xs font-bold truncate">
                                                            {leetcodeSolved < 100 ? "100 Problems" : internshipCount < 2 ? "2nd Internship" : "System Design"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-[10px] text-white/40 text-center">
                                                    Powered by Campus2Career AI Engine • Updated in real-time
                                                </div>
                                            </>
                                        );
                                    })()}
                                </CardContent>
                            </Card>

                            {/* Resume Upload */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-primary" /> Resume
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {profile.resumeUrl ? (
                                        <div className="flex items-center justify-between rounded-xl border p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                                                    <BookOpen className="h-4 w-4 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{profile.resumeName}</p>
                                                    <p className="text-xs text-muted-foreground">Uploaded</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Update</Button>
                                                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" variant="outline">View</Button>
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={handleResumeUpload}
                                            />
                                            <Upload className={cn("mb-2 h-8 w-8 text-muted-foreground", isUploading && "animate-pulse text-primary")} />
                                            <p className="text-sm font-medium">{isUploading ? `Uploading ${uploadProgress}%` : "Upload Resume (PDF)"}</p>
                                            {isUploading && (
                                                <div className="w-full max-w-[150px] mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">Max size 5MB</p>
                                            {!isUploading && <Button size="sm" className="mt-3">Choose File</Button>}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ── Tab: Projects ─────────────────────────────────────────── */}
                {activeTab === "Projects" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? "s" : ""} added</p>
                            <Button onClick={() => setAddingProject(true)} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Project
                            </Button>
                        </div>

                        {addingProject && (
                            <Card className="border-primary/30 shadow-md">
                                <CardHeader><CardTitle>New Project</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {(["title", "tech", "year", "link"] as const).map(field => (
                                            <div key={field} className="space-y-1">
                                                <label className="text-xs font-medium capitalize text-muted-foreground">
                                                    {field === "tech" ? "Technologies Used" : field === "link" ? "GitHub / Demo Link" : field.charAt(0).toUpperCase() + field.slice(1)}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newProject[field]}
                                                    onChange={e => setNewProject({ ...newProject, [field]: e.target.value })}
                                                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                />
                                            </div>
                                        ))}
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Description</label>
                                            <textarea
                                                rows={3}
                                                value={newProject.description}
                                                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setAddingProject(false)}>Cancel</Button>
                                        <Button onClick={() => {
                                            if (newProject.title) {
                                                const updated = [...projects, { ...newProject, id: Date.now() }];
                                                setProjects(updated);
                                                handleSave({ projects: updated });
                                                setNewProject({ title: "", tech: "", description: "", link: "", year: new Date().getFullYear().toString() });
                                                setAddingProject(false);
                                            }
                                        }}>Save Project</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            {projects.map(p => (
                                <Card key={p.id} className="card-hover">
                                    <CardContent className="pt-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Code2 className="h-4 w-4 text-primary" />
                                                    <h4 className="font-semibold">{p.title}</h4>
                                                    <Badge variant="default">{p.year}</Badge>
                                                </div>
                                                <p className="text-xs text-primary/80 font-medium mb-2">{p.tech}</p>
                                                <p className="text-sm text-muted-foreground">{p.description}</p>
                                                {p.link && (
                                                    <a href={p.link} target="_blank" rel="noreferrer"
                                                        className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
                                                        <ExternalLink className="h-3 w-3" /> View Project
                                                    </a>
                                                )}
                                            </div>
                                            <button onClick={() => {
                                                const updated = projects.filter(x => x.id !== p.id);
                                                setProjects(updated);
                                                handleSave({ projects: updated });
                                            }}
                                                className="text-muted-foreground hover:text-destructive transition-colors mt-1">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {projects.length === 0 && !addingProject && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Code2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>No projects yet. Add your first project!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab: Certifications ───────────────────────────────────── */}
                {activeTab === "Certifications" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{certs.length} certification{certs.length !== 1 ? "s" : ""}</p>
                            <Button onClick={() => setAddingCert(true)} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Certification
                            </Button>
                        </div>

                        {addingCert && (
                            <Card className="border-primary/30 shadow-md">
                                <CardHeader><CardTitle>New Certification</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {(["name", "issuer", "year", "link"] as const).map(field => (
                                            <div key={field} className="space-y-1">
                                                <label className="text-xs font-medium capitalize text-muted-foreground">
                                                    {field === "link" ? "Certificate Link (optional)" : field.charAt(0).toUpperCase() + field.slice(1)}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newCert[field]}
                                                    onChange={e => setNewCert({ ...newCert, [field]: e.target.value })}
                                                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setAddingCert(false)}>Cancel</Button>
                                        <Button onClick={() => {
                                            if (newCert.name) {
                                                const updated = [...certs, { ...newCert, id: Date.now() }];
                                                setCerts(updated);
                                                handleSave({ certifications: updated });
                                                setNewCert({ name: "", issuer: "", year: "", link: "" });
                                                setAddingCert(false);
                                            }
                                        }}>Save Certification</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="space-y-3">
                            {certs.map(c => (
                                <Card key={c.id} className="card-hover">
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shrink-0">
                                                <Award className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{c.name}</h4>
                                                <p className="text-sm text-muted-foreground">{c.issuer} • {c.year}</p>
                                                {c.link && (
                                                    <a href={c.link} target="_blank" rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                                        <ExternalLink className="h-3 w-3" /> View Certificate
                                                    </a>
                                                )}
                                            </div>
                                            <button onClick={() => {
                                                const updated = certs.filter(x => x.id !== c.id);
                                                setCerts(updated);
                                                handleSave({ certifications: updated });
                                            }}
                                                className="text-muted-foreground hover:text-destructive transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {certs.length === 0 && !addingCert && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>No certifications yet. Add your first one!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab: Internships ─────────────────────────────────────── */}
                {activeTab === "Internships" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{internships.length} internship{internships.length !== 1 ? "s" : ""}</p>
                            <Button onClick={() => setAddingInternship(true)} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Internship
                            </Button>
                        </div>

                        {addingInternship && (
                            <Card className="border-primary/30 shadow-md">
                                <CardHeader><CardTitle>New Internship</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {(["role", "company", "period"] as const).map(field => (
                                            <div key={field} className="space-y-1">
                                                <label className="text-xs font-medium capitalize text-muted-foreground">{field}</label>
                                                <input
                                                    type="text"
                                                    value={newInternship[field]}
                                                    onChange={e => setNewInternship({ ...newInternship, [field]: e.target.value })}
                                                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                />
                                            </div>
                                        ))}
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Description</label>
                                            <textarea
                                                rows={3}
                                                value={newInternship.description}
                                                onChange={e => setNewInternship({ ...newInternship, description: e.target.value })}
                                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setAddingInternship(false)}>Cancel</Button>
                                        <Button onClick={() => {
                                            if (newInternship.role) {
                                                const updated = [...internships, { ...newInternship, id: Date.now() }];
                                                setInternships(updated);
                                                handleSave({ internships: updated });
                                                setNewInternship({ role: "", company: "", period: "", description: "" });
                                                setAddingInternship(false);
                                            }
                                        }}>Save Internship</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="space-y-3">
                            {internships.map(i => (
                                <Card key={i.id} className="card-hover">
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl gradient-blue flex items-center justify-center text-white shrink-0">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{i.role}</h4>
                                                <p className="text-sm text-muted-foreground">{i.company} &bull; {i.period}</p>
                                                <p className="mt-1 text-sm">{i.description}</p>
                                            </div>
                                            <button onClick={() => {
                                                const updated = internships.filter(x => x.id !== i.id);
                                                setInternships(updated);
                                                handleSave({ internships: updated });
                                            }}
                                                className="text-muted-foreground hover:text-destructive transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {internships.length === 0 && !addingInternship && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>No internships yet. Add your experience!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab: Achievements ─────────────────────────────────────── */}
                {activeTab === "Achievements" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{achievements.length} achievement{achievements.length !== 1 ? "s" : ""}</p>
                            <Button onClick={() => setAddingAchievement(true)} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Achievement
                            </Button>
                        </div>

                        {addingAchievement && (
                            <Card className="border-primary/30 shadow-md">
                                <CardHeader><CardTitle>New Achievement</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {(["title", "year"] as const).map(field => (
                                            <div key={field} className="space-y-1">
                                                <label className="text-xs font-medium capitalize text-muted-foreground">{field}</label>
                                                <input type="text" value={newAchievement[field]}
                                                    onChange={e => setNewAchievement({ ...newAchievement, [field]: e.target.value })}
                                                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                            </div>
                                        ))}
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Description</label>
                                            <textarea rows={2} value={newAchievement.description}
                                                onChange={e => setNewAchievement({ ...newAchievement, description: e.target.value })}
                                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setAddingAchievement(false)}>Cancel</Button>
                                        <Button onClick={() => {
                                            if (newAchievement.title) {
                                                const updated = [...achievements, { ...newAchievement, id: Date.now() }];
                                                setAchievements(updated);
                                                handleSave({ achievements: updated });
                                                setNewAchievement({ title: "", description: "", year: "" });
                                                setAddingAchievement(false);
                                            }
                                        }}>Save Achievement</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            {achievements.map(a => (
                                <Card key={a.id} className="card-hover">
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                                                <Trophy className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold">{a.title}</h4>
                                                    <Badge variant="default">{a.year}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                                            </div>
                                            <button onClick={() => {
                                                const updated = achievements.filter(x => x.id !== a.id);
                                                setAchievements(updated);
                                                handleSave({ achievements: updated });
                                            }}
                                                className="text-muted-foreground hover:text-destructive transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {achievements.length === 0 && !addingAchievement && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>Start adding your wins and achievements!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab: Skills ───────────────────────────────────────────── */}
                {activeTab === "Skills" && (
                    <div className="space-y-6 animate-fade-in-up">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code2 className="h-5 w-5 text-primary" /> Technical Skills
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {skills.map(s => (
                                        <Badge key={s} className="skill-pill selected group">
                                            {s}
                                            <button onClick={() => removeSkill(s)} className="ml-1.5 opacity-60 hover:opacity-100">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={e => setNewSkill(e.target.value)}
                                        onKeyPress={e => e.key === "Enter" && addSkill()}
                                        placeholder="Add skill (e.g. React)..."
                                        className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    <Button onClick={addSkill} className="flex items-center gap-1.5">
                                        <Plus className="h-4 w-4" /> Add Skill
                                    </Button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <Star className="h-4 w-4 text-primary" /> AI Recommended Skills
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {((profileAnalysis?.suggestedSkills && profileAnalysis.suggestedSkills.length > 0)
                                            ? profileAnalysis.suggestedSkills
                                            : ["Docker", "Kubernetes", "AWS", "System Design", "Microservices", "Redis", "GraphQL"]
                                        ).filter(s => !skills.includes(s)).map(skill => (
                                            <button
                                                key={skill}
                                                onClick={() => {
                                                    if (!skills.includes(skill)) {
                                                        const updated = [...skills, skill];
                                                        setSkills(updated);
                                                        if (user) updateUser({ ...user, techSkills: updated });
                                                    }
                                                }}
                                                className="skill-pill hover:bg-secondary border-none"
                                            >
                                                +{skill}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
