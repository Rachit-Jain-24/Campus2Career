import { useState, useEffect, useRef } from 'react';
import {
    Sparkles, Brain, MessageSquare, CheckCircle,
    Play, AlertCircle, Trophy, Code2, LayoutGrid, Mic, MicOff, Clock,
    BarChart3, UserCheck, ShieldCheck, Zap, FileText, Upload
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import {
    generateInterviewQuestions,
    evaluateInterviewAnswer,
    analyzeSpeech,
    type InterviewEvaluation,
    type InterviewSession
} from '../../lib/gemini';
import { extractTextFromLocalPDF } from '../../lib/pdfParser';

type InterviewMode = 'technical' | 'project' | 'hr';
type InterviewPhase = 'config' | 'generating' | 'thinking' | 'recording' | 'evaluating' | 'finished';

// Speech Recognition Types
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function InterviewSimulator() {
    const { user, updateUser } = useAuth();

    const [mode, setMode] = useState<InterviewMode>('technical');
    const [phase, setPhase] = useState<InterviewPhase>('config');
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [allAnswers, setAllAnswers] = useState<string[]>([]);

    // Local Resume Upload explicitly for Interview
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localResumeName, setLocalResumeName] = useState<string>("");
    const [localResumeText, setLocalResumeText] = useState<string>("");
    const [isParsingResume, setIsParsingResume] = useState(false);

    // Timers
    const [timeLeft, setTimeLeft] = useState(30);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Speech Recognition
    const recognitionRef = useRef<any>(null);
    const recordStartTime = useRef<number>(0);

    // Evaluation state
    const [feedbacks, setFeedbacks] = useState<InterviewEvaluation[]>([]);

    // Handle Timers
    useEffect(() => {
        if (phase === 'thinking' || phase === 'recording') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        if (phase === 'thinking') startRecording();
                        else stopRecordingAndEvaluate();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [phase]);

    const startInterview = async () => {
        setPhase('generating');
        const techSkills = user?.techSkills || [];
        const careerTrack = (user as any)?.careerTrack || "Software Engineer";

        const generatedQuestions = await generateInterviewQuestions(
            mode,
            techSkills,
            careerTrack,
            localResumeText || user?.resumeDescription || ""
        );
        setQuestions(generatedQuestions);
        setFeedbacks([]);
        setAllAnswers([]);
        setCurrentQuestionIndex(0);
        startNextQuestion(0);
    };

    const startNextQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        setTranscript("");
        setTimeLeft(30);
        setPhase('thinking');
    };

    const startRecording = () => {
        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser. Please use Chrome.");
            return;
        }

        setTranscript("");
        setPhase('recording');
        setTimeLeft(120);
        recordStartTime.current = Date.now();

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            let fullTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript;
            }
            setTranscript(fullTranscript);
        };

        recognitionRef.current.onend = () => {
            if (phase === 'recording') {
                recognitionRef.current.start();
            }
        };

        recognitionRef.current.start();
    };

    const stopRecordingAndEvaluate = async () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setPhase('evaluating');

        const duration = (Date.now() - recordStartTime.current) / 1000;

        // Parallel Analysis
        const [techFeedback, commMetrics] = await Promise.all([
            evaluateInterviewAnswer(questions[currentQuestionIndex], transcript, user?.techSkills || [], mode, localResumeText || user?.resumeDescription || ""),
            analyzeSpeech(transcript, duration)
        ]);

        const fullFeedback: InterviewEvaluation = {
            ...techFeedback,
            communicationMetrics: commMetrics
        };

        setFeedbacks(prev => [...prev, fullFeedback]);
        setAllAnswers(prev => [...prev, transcript]);

        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => {
                startNextQuestion(currentQuestionIndex + 1);
            }, 1000);
        } else {
            finishInterview([...feedbacks, fullFeedback]);
        }
    };

    const finishInterview = async (finalFeedbacks: InterviewEvaluation[]) => {
        setPhase('finished');

        if (user) {
            const techScore = finalFeedbacks.reduce((acc, curr) => acc + curr.technicalScore, 0) / finalFeedbacks.length;
            const commScore = finalFeedbacks.reduce((acc, curr) => acc + (curr.communicationMetrics?.communicationScore || 0), 0) / finalFeedbacks.length;
            const confScore = finalFeedbacks.reduce((acc, curr) => acc + (curr.communicationMetrics?.confidenceScore || 0), 0) / finalFeedbacks.length;

            const session: InterviewSession = {
                date: new Date().toISOString(),
                mode,
                questions,
                answers: [], // Do not store full transcripts in the database as per user privacy request
                scores: {
                    technical: Math.round(techScore * 10) / 10,
                    communication: Math.round(commScore * 10) / 10,
                    confidence: Math.round(confScore * 10) / 10,
                    overall: Math.round(((techScore + commScore + confScore) / 3) * 10) / 10
                },
                feedbacks: finalFeedbacks
            };

            const existingSessions = user.interviewSessions || [];
            await updateUser({
                ...user,
                interviewSessions: [...existingSessions, session]
            });
        }
    };

    const overallReport = phase === 'finished' && feedbacks.length > 0 ? {
        tech: Math.round(feedbacks.reduce((acc, curr) => acc + curr.technicalScore, 0) / feedbacks.length * 10) / 10,
        comm: Math.round(feedbacks.reduce((acc, curr) => acc + (curr.communicationMetrics?.communicationScore || 0), 0) / feedbacks.length * 10) / 10,
        conf: Math.round(feedbacks.reduce((acc, curr) => acc + (curr.communicationMetrics?.confidenceScore || 0), 0) / feedbacks.length * 10) / 10,
        speed: Math.round(feedbacks.reduce((acc, curr) => acc + (curr.communicationMetrics?.speechSpeed || 0), 0) / feedbacks.length),
        fillers: feedbacks.reduce((acc, curr) => acc + (curr.communicationMetrics?.fillerWordCount || 0), 0)
    } : null;

    if (user && user.currentYear < 2) {
        return (
            <DashboardLayout role="student" userName={user?.name || "Student"} userYear={user?.currentYear ? `${user.currentYear} Year` : "Student"} userProgram={user?.branch || "B.Tech CSE"}>
                <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-slate-100 flex flex-col items-center">
                        <div className="bg-amber-100 p-6 rounded-full mb-8">
                            <AlertCircle className="h-16 w-16 text-amber-500" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Focus on Fundamentals First</h2>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
                            The AI Interview Simulator is specially designed for pre-placement preparation. Top tier mock interviews unlock in Year 2 when you've built your core DSA and project portfolio.
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student" userName={user?.name || "Student"} userYear={user?.currentYear ? `${user.currentYear} Year` : "Student"} userProgram={user?.branch || "B.Tech CSE"}>
            <div className="space-y-6 pb-12">

                {/* 1. Header Section */}
                <div className="rounded-[2rem] bg-slate-900 p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
                                    Adaptive Interview Engine v3.0
                                </span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight mb-2">AI Interview Simulator</h1>
                            <p className="text-slate-400 font-medium max-w-xl">
                                Real-time voice analysis, speech metrics, and technical deep-dives to prepare you for top-tier company rounds.
                            </p>
                        </div>
                        {phase === 'recording' && (
                            <div className="flex items-center gap-4 bg-red-500/20 px-6 py-4 rounded-3xl border border-red-500/30 animate-pulse">
                                <div className="h-3 w-3 bg-red-500 rounded-full animate-ping" />
                                <span className="font-black text-red-500 uppercase tracking-tighter text-xl">LIVE RECORDING</span>
                            </div>
                        )}
                    </div>
                </div>

                {phase === 'config' ? (
                    /* Select Mode */
                    <div className="grid gap-8">
                        {/* Context Overview Card */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                                    <Brain className="h-6 w-6 text-primary" />
                                    AI Context Settings
                                </h3>
                                <p className="text-sm text-slate-500 font-medium tracking-wide mb-6">
                                    Your mock interview will be hyper-personalized based on the following verified profile data.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Target Role</p>
                                        <p className="text-sm font-bold text-slate-800">{user?.careerTrack || "Software Engineer"}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Tech Stack</p>
                                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{user?.techSkills?.join(', ') || "Not Set"}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Projects Built</p>
                                        <p className="text-sm font-bold text-slate-800">{user?.projects?.length || 0} Listed</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">DSA Solved</p>
                                        <p className="text-sm font-bold text-slate-800">{user?.leetcodeStats?.totalSolved || 0} Problems</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-[320px] bg-primary/5 rounded-[2rem] p-6 border border-primary/10">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Resume Context</h4>
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setIsParsingResume(true);
                                        try {
                                            const text = await extractTextFromLocalPDF(file);
                                            setLocalResumeText(text);
                                            setLocalResumeName(file.name);
                                            // Optionally persist it
                                            if (user) {
                                                await updateUser({ ...user, resumeDescription: text, resumeName: file.name });
                                            }
                                        } catch (error) {
                                            alert("Failed to parse PDF. Please try again.");
                                        } finally {
                                            setIsParsingResume(false);
                                        }
                                    }}
                                />
                                {isParsingResume ? (
                                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100">
                                        <div className="h-6 w-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
                                        <p className="text-xs font-bold text-slate-500">Parsing PDF...</p>
                                    </div>
                                ) : (localResumeName || user?.resumeName) ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative group">
                                            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-black text-slate-800">Ready</p>
                                                <p className="text-[10px] font-bold text-slate-400 truncate w-full">{localResumeName || user?.resumeName}</p>
                                            </div>
                                            <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                <p className="text-xs font-black text-slate-700">Change</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                                            The AI engine will explicitly ground the questions in your provided architecture choices and past experiences.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm border-dashed">
                                            <div className="h-10 w-10 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">No Context Source</p>
                                                <p className="text-[10px] font-bold text-slate-400">Questions will be generic</p>
                                            </div>
                                        </div>
                                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 text-xs font-black text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">
                                            <Upload className="h-3 w-3" /> UPLOAD RESUME (PDF)
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { id: 'technical', icon: Code2, color: 'primary', title: 'Technical Round', desc: 'DSA, System Design, and Language Internals.' },
                                { id: 'project', icon: LayoutGrid, color: 'purple-500', title: 'Project Deep-Dive', desc: 'Architecture, challenges, and implementation choices.' },
                                { id: 'hr', icon: MessageSquare, color: 'orange-500', title: 'HR / Behavioral', desc: 'Leadership, situational logic, and culture fit.' }
                            ].map((m) => (
                                <div
                                    key={m.id}
                                    onClick={() => setMode(m.id as InterviewMode)}
                                    className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 group relative overflow-hidden ${mode === m.id ? `border-primary bg-primary/5 shadow-xl` : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                >
                                    <m.icon className={`h-12 w-12 mb-6 transition-transform duration-500 group-hover:scale-110 ${mode === m.id ? `text-primary` : 'text-slate-300'}`} />
                                    <h4 className="text-xl font-black text-slate-800 mb-2">{m.title}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{m.desc}</p>
                                    {mode === m.id && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-ping" />}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={startInterview}
                            className="w-full py-6 bg-primary text-white text-lg font-black rounded-[2rem] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <Play className="h-6 w-6" /> START MOCK INTERVIEW
                        </button>
                    </div>
                ) : phase === 'generating' ? (
                    <div className="card-nmims p-24 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-8">
                            <div className="h-24 w-24 border-8 border-primary/10 border-t-primary rounded-full animate-spin" />
                            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Crafting Your Interview...</h2>
                        <p className="text-slate-500 max-w-sm font-medium">Synthesizing questions based on your {user?.techSkills?.length || 0} skills and {user?.projects?.length || 0} repository metrics.</p>
                    </div>
                ) : phase === 'finished' ? (
                    /* Final Report */
                    <div className="space-y-8 animate-in fade-in duration-700">
                        {/* Summary Scorecards */}
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="md:col-span-2 bg-primary rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl">
                                <Trophy className="absolute -right-4 -bottom-4 h-48 w-48 text-white/5 rotate-12" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/60 mb-2">Overall Interview Readiness</p>
                                    <h2 className="text-6xl font-black mb-6">
                                        {Math.round(((overallReport?.tech! + overallReport?.comm! + overallReport?.conf!) / 3) * 10) / 10}
                                        <span className="text-2xl text-white/40">/ 10</span>
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 self-start px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Verified by NMIMS AI</span>
                                </div>
                            </div>

                            <div className="space-y-6 md:col-span-2">
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { label: 'Technical Accuracy', val: overallReport?.tech, icon: Brain, color: 'indigo-500' },
                                        { label: 'Communication', val: overallReport?.comm, icon: MessageSquare, color: 'orange-500' },
                                        { label: 'Confidence', val: overallReport?.conf, icon: Zap, color: 'yellow-500' },
                                        { label: 'Speech Clarity', val: feedbacks[0]?.communicationMetrics?.clarity || "High", icon: UserCheck, color: 'green-500' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-2">
                                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                                <span className="text-xl font-black text-slate-800">{stat.val}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Average Speed</p>
                                        <p className="text-lg font-black">{overallReport?.speed} <span className="text-xs font-bold text-white/40">words/min</span></p>
                                    </div>
                                    <div className="h-10 w-[2px] bg-white/10" />
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Filler Content</p>
                                        <p className="text-lg font-black text-orange-400">{overallReport?.fillers} <span className="text-xs font-bold text-white/40 text-white/40 italic">catchwords</span></p>
                                    </div>
                                    <BarChart3 className="h-8 w-8 text-primary/50" />
                                </div>
                            </div>
                        </div>

                        {/* Detailed Q&A Feedback */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black text-slate-800 px-4">Detailed Question Analysis</h3>
                            <div className="space-y-4">
                                {feedbacks.map((f, i) => (
                                    <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 group">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="flex-1 space-y-6">
                                                <div>
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 block">Question 0{i + 1}</span>
                                                    <h4 className="text-lg font-black text-slate-800 leading-tight mb-4">{questions[i]}</h4>
                                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed font-medium">
                                                        "{allAnswers[i]}"
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Logic Wins</p>
                                                        <ul className="space-y-2">
                                                            {f.strengths.map((s, idx) => (
                                                                <li key={idx} className="text-xs text-slate-600 font-bold flex items-start gap-2">
                                                                    <div className="h-1 w-1 rounded-full bg-green-500 mt-1.5 shadow-sm" /> {s}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> Optimization Gaps</p>
                                                        <ul className="space-y-2">
                                                            {f.improvements.map((s, idx) => (
                                                                <li key={idx} className="text-xs text-slate-600 font-bold flex items-start gap-2">
                                                                    <div className="h-1 w-1 rounded-full bg-orange-500 mt-1.5 shadow-sm" /> {s}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-64 space-y-4">
                                                <div className="p-6 bg-slate-900 rounded-3xl text-white text-center flex flex-col items-center justify-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Technical Score</p>
                                                    <div className="text-4xl font-black">{f.technicalScore}<span className="text-lg text-white/20">/10</span></div>
                                                </div>
                                                <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Voice Metrics</p>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-slate-500">Speed</span>
                                                            <span className="text-xs font-black text-slate-800">{f.communicationMetrics?.speechSpeed} wpm</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary" style={{ width: `${Math.min(100, f.communicationMetrics?.speechSpeed! / 2)}%` }} />
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-slate-500">Fillers</span>
                                                            <span className="text-xs font-black text-orange-500">{f.communicationMetrics?.fillerWordCount} count</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => setPhase('config')} className="w-full py-6 bg-white border border-slate-200 text-slate-900 font-black rounded-3xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                            START NEW ASSESSMENT
                        </button>
                    </div>
                ) : (
                    /* Active Interview Flow (Thinking / Recording / Evaluating) */
                    <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Progress Header */}
                        <div className="lg:col-span-12 card-nmims overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-md">
                            <div className="p-4 flex items-center justify-between px-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-2 rounded-xl">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-lg font-black text-slate-800">Round 01: {mode.toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                    <div className="h-8 w-[2px] bg-slate-100 mx-2" />
                                    <div className="flex flex-col items-end">
                                        <span className={`text-xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                                            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                                        </span>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">{phase === 'thinking' ? 'THINKING PHASE' : 'RECORDING ANSWER'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100">
                                <div
                                    className={`h-full transition-all duration-1000 ${phase === 'thinking' ? 'bg-amber-400' : 'bg-red-500'}`}
                                    style={{ width: `${(timeLeft / (phase === 'thinking' ? 30 : 120)) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Area */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-slate-100 min-h-[400px] flex flex-col relative group">
                                <div className="absolute top-8 left-8">
                                    <MessageSquare className="h-8 w-8 text-primary/20" />
                                </div>
                                <div className="flex-1 flex flex-col justify-center items-center text-center px-8">
                                    <h2 className="text-3xl font-black text-slate-800 leading-tight mb-8 group-hover:text-primary transition-colors duration-500">
                                        {questions[currentQuestionIndex]}
                                    </h2>

                                    {phase === 'thinking' ? (
                                        <div className="flex flex-col items-center">
                                            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-center gap-4 text-amber-600 mb-8 animate-bounce">
                                                <Clock className="h-6 w-6" />
                                                <span className="font-black text-sm uppercase tracking-widest">Constructing technical logic...</span>
                                            </div>
                                            <button
                                                onClick={startRecording}
                                                className="px-10 py-5 bg-slate-900 text-white font-black rounded-[2rem] shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3 group"
                                            >
                                                <Mic className="h-6 w-6 group-hover:animate-pulse" /> START ANSWER NOW
                                            </button>
                                        </div>
                                    ) : phase === 'recording' ? (
                                        <div className="w-full space-y-8">
                                            <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 min-h-[150px] relative">
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest">LIVE TRANSCRIPT</div>
                                                <p className="text-slate-600 font-medium italic text-lg leading-relaxed pt-2">
                                                    {transcript || "Speak clearly into your microphone..."}
                                                </p>
                                                {transcript && <div className="absolute bottom-4 right-8 flex items-center gap-1.5">
                                                    <div className="h-1 w-1 bg-green-500 rounded-full animate-ping" />
                                                    <span className="text-[9px] font-black text-green-600 uppercase">Voice Sync Active</span>
                                                </div>}
                                            </div>
                                            <button
                                                onClick={stopRecordingAndEvaluate}
                                                className="w-full py-6 bg-red-500 text-white font-black rounded-[2rem] shadow-2xl shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-3 animate-pulse"
                                            >
                                                <MicOff className="h-6 w-6" /> STOP & ANALYZE LOGIC
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="h-20 w-20 border-8 border-primary/10 border-t-primary rounded-full animate-spin mb-6" />
                                            <p className="text-xl font-black text-slate-800 animate-pulse uppercase tracking-widest">Extracting Semantic Feedback...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Guidance */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-8">
                                        <ShieldCheck className="h-6 w-6 text-primary" />
                                        <span className="text-lg font-black tracking-tight">Interviewer Tips</span>
                                    </div>
                                    <ul className="space-y-6">
                                        {[
                                            { t: "Clarity", d: "Aim for 120-150 words per minute for optimal professional impact." },
                                            { t: "Fillers", d: "Avoid 'um' and 'like' to maintain a high confidence percentile." },
                                            { t: "Think Time", d: "Use the 30s to structure your response using the STAR method." }
                                        ].map((tip, i) => (
                                            <li key={i} className="space-y-1">
                                                <h5 className="text-xs font-black text-primary uppercase tracking-[0.2em]">{tip.t}</h5>
                                                <p className="text-sm text-slate-400 font-medium leading-relaxed">{tip.d}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="pt-10 border-t border-white/10 mt-10">
                                    <p className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-widest">Session Encryption</p>
                                    <div className="flex items-center gap-3 opacity-30">
                                        <ShieldCheck className="h-4 w-4" />
                                        <div className="h-1 flex-1 bg-white/20 rounded-full" />
                                        <LockIcon className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

function LockIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

