import { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import type { AppUser } from '../../types/auth';
import {
  generateInterviewQuestions,
  generateFollowUpQuestion,
  evaluateInterviewAnswer,
  analyzeSpeechLocally,
  type InterviewEvaluation,
  type InterviewSession,
} from '../../lib/gemini';
import { extractTextFromLocalPDF } from '../../lib/pdfParser';
import {
  Sparkles, Brain, MessageSquare, CheckCircle, Play, AlertCircle, Trophy,
  Code2, LayoutGrid, Mic, MicOff, Clock, BarChart3, UserCheck, Zap,
  FileText, Upload, RefreshCw, ChevronRight, TrendingUp,
} from 'lucide-react';

type Mode = 'technical' | 'project' | 'hr';
type Phase = 'config' | 'generating' | 'thinking' | 'recording' | 'evaluating' | 'followup' | 'finished';

const THINKING_TIME = 30;
const RECORDING_TIME = 120;

export default function InterviewSimulator() {
  const { user, updateUser } = useAuth();
  const u = user as any;

  const [mode, setMode] = useState<Mode>('technical');
  const [phase, setPhase] = useState<Phase>('config');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [allAnswers, setAllAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<InterviewEvaluation[]>([]);
  const [timeLeft, setTimeLeft] = useState(THINKING_TIME);
  const [localResumeName, setLocalResumeName] = useState('');
  const [localResumeText, setLocalResumeText] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [liveWordCount, setLiveWordCount] = useState(0);

  const transcriptRef = useRef('');
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Year 1 gate
  if (u?.currentYear === 1) {
    return (
      <DashboardLayout role="student">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-md text-center">
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-amber-800 mb-2">Unlocks in Year 2</h2>
            <p className="text-amber-700 text-sm">
              The AI Interview Simulator is available from Year 2 onwards. Keep building your skills and come back next year!
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const skills: string[] = u?.techSkills || u?.skills || [];
  const careerTrack: string = u?.careerTrack || 'Software Engineer';
  const resumeText = localResumeText || u?.resumeDescription || '';

  const currentQuestion = isFollowUp && followUpQuestion
    ? followUpQuestion
    : questions[currentQuestionIndex] || '';

  // ── Timer ──────────────────────────────────────────────────────────────────
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (seconds: number, onExpire: () => void) => {
    clearTimer();
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Speech Recognition ─────────────────────────────────────────────────────
  const isRecordingRef = useRef(false);

  const startRecognition = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    isRecordingRef.current = true;

    const createRec = () => {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (e: any) => {
        let full = '';
        for (let i = 0; i < e.results.length; i++) {
          full += e.results[i][0].transcript + ' ';
        }
        const trimmed = full.trim();
        setTranscript(trimmed);
        transcriptRef.current = trimmed;
        setLiveWordCount(trimmed.split(/\s+/).filter(Boolean).length);
      };

      // Auto-restart on end so Chrome's silence timeout doesn't cut off the user
      rec.onend = () => {
        if (isRecordingRef.current) {
          try { rec.start(); } catch (_) {}
        }
      };

      rec.onerror = (e: any) => {
        // 'no-speech' and 'aborted' are normal — just restart
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        console.warn('Speech recognition error:', e.error);
      };

      return rec;
    };

    const rec = createRec();
    recognitionRef.current = rec;
    rec.start();
  };

  const stopRecognition = () => {
    isRecordingRef.current = false;
    try { recognitionRef.current?.stop(); } catch (_) {}
    recognitionRef.current = null;
  };

  // ── Start Interview ────────────────────────────────────────────────────────
  const startInterview = async () => {
    setPhase('generating');
    setCurrentQuestionIndex(0);
    setAllAnswers([]);
    setFeedbacks([]);
    setIsFollowUp(false);
    setFollowUpQuestion(null);
    try {
      const qs = await generateInterviewQuestions(mode, skills, careerTrack, resumeText);
      setQuestions(qs);
      setPhase('thinking');
      startTimer(THINKING_TIME, () => beginRecording());
    } catch (err) {
      console.error(err);
      setPhase('config');
    }
  };

  const beginRecording = useCallback(() => {
    setTranscript('');
    transcriptRef.current = '';
    setLiveWordCount(0);
    recordingStartRef.current = Date.now();
    setPhase('recording');
    startRecognition();
    startTimer(RECORDING_TIME, () => stopAndEvaluate());
  }, []);

  // ── Stop & Evaluate ────────────────────────────────────────────────────────
  const stopAndEvaluate = useCallback(async () => {
    clearTimer();
    stopRecognition();
    const answer = transcriptRef.current;
    const duration = (Date.now() - recordingStartRef.current) / 1000;
    setPhase('evaluating');

    const commMetrics = analyzeSpeechLocally(answer, duration);
    const techFeedback = await evaluateInterviewAnswer(
      currentQuestion, answer, skills, mode, resumeText
    );
    const combined: InterviewEvaluation = { ...techFeedback, communicationMetrics: commMetrics };

    const newAnswers = [...allAnswers, answer];
    const newFeedbacks = [...feedbacks, combined];
    setAllAnswers(newAnswers);
    setFeedbacks(newFeedbacks);

    // Follow-up logic — only for non-follow-up answers with enough content
    if (answer.length > 60 && !isFollowUp) {
      const fq = await generateFollowUpQuestion(
        questions[currentQuestionIndex], answer, mode, careerTrack
      );
      if (fq) {
        setFollowUpQuestion(fq);
        setIsFollowUp(true);
        setPhase('followup');
        return;
      }
    }

    advanceQuestion(newAnswers, newFeedbacks);
  }, [allAnswers, feedbacks, currentQuestion, isFollowUp, questions, currentQuestionIndex, mode, skills, resumeText, careerTrack]);

  const advanceQuestion = (answers: string[], evals: InterviewEvaluation[]) => {
    const nextIndex = currentQuestionIndex + 1;
    setIsFollowUp(false);
    setFollowUpQuestion(null);
    if (nextIndex >= questions.length) {
      finishInterview(answers, evals);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setTranscript('');
      transcriptRef.current = '';
      setLiveWordCount(0);
      setPhase('thinking');
      startTimer(THINKING_TIME, () => beginRecording());
    }
  };

  const finishInterview = async (answers: string[], evals: InterviewEvaluation[]) => {
    setPhase('finished');
    if (!user) return;
    const techScores = evals.map(e => e.technicalScore);
    const avgTech = techScores.length ? Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length) : 0;
    const commScores = evals.map(e => e.communicationMetrics?.communicationScore || 0);
    const avgComm = commScores.length ? Math.round(commScores.reduce((a, b) => a + b, 0) / commScores.length) : 0;
    const confScores = evals.map(e => e.communicationMetrics?.confidenceScore || 0);
    const avgConf = confScores.length ? Math.round(confScores.reduce((a, b) => a + b, 0) / confScores.length) : 0;

    const session: InterviewSession = {
      date: new Date().toISOString(),
      mode,
      questions,
      answers,
      scores: {
        technical: avgTech,
        communication: avgComm,
        confidence: avgConf,
        overall: Math.round((avgTech + avgComm + avgConf) / 3),
      },
      feedbacks: evals,
    };

    const existing = (u?.interviewSessions as InterviewSession[]) || [];
    await updateUser({ ...user, interviewSessions: [...existing, session] } as AppUser);
  };

  // ── Resume Upload ──────────────────────────────────────────────────────────
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    setIsParsingResume(true);
    try {
      const text = await extractTextFromLocalPDF(file);
      setLocalResumeName(file.name);
      setLocalResumeText(text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingResume(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      stopRecognition();
    };
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const avgScore = feedbacks.length
    ? Math.round(feedbacks.reduce((a, b) => a + b.technicalScore, 0) / feedbacks.length)
    : 0;

  const scoreColor = (s: number) =>
    s >= 8 ? 'text-green-600' : s >= 5 ? 'text-amber-600' : 'text-red-500';

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const modeCards: { id: Mode; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'technical', label: 'Technical', desc: 'DSA, system design, CS fundamentals', icon: <Code2 className="w-6 h-6" /> },
    { id: 'project', label: 'Project Deep-Dive', desc: 'Architecture, decisions, trade-offs', icon: <LayoutGrid className="w-6 h-6" /> },
    { id: 'hr', label: 'HR / Behavioral', desc: 'Soft skills, situational questions', icon: <UserCheck className="w-6 h-6" /> },
  ];

  // ── CONFIG PHASE ───────────────────────────────────────────────────────────
  if (phase === 'config') {
    return (
      <DashboardLayout role="student">
        <div className="max-w-3xl mx-auto py-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-7 h-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">AI Interview Simulator</h1>
              <p className="text-muted-foreground text-sm">Practice with Gemini-powered questions tailored to your profile</p>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Interview Mode</h2>
            <div className="grid grid-cols-3 gap-3">
              {modeCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => setMode(card.id)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    mode === card.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className={`mb-2 ${mode === card.id ? 'text-primary' : 'text-muted-foreground'}`}>
                    {card.icon}
                  </div>
                  <div className="font-semibold text-sm">{card.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{card.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Context */}
          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your Profile Context</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-1">Target Role</div>
                <div className="font-medium">{careerTrack || 'Not set'}</div>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-1">Skills</div>
                <div className="font-medium">{skills.length > 0 ? skills.slice(0, 4).join(', ') : 'Not set'}</div>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-1">Projects</div>
                <div className="font-medium">{u?.projects?.length || 0} listed</div>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-1">LeetCode</div>
                <div className="font-medium">{u?.leetcodeStats?.totalSolved || 0} solved</div>
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Resume (Optional)</h2>
            <p className="text-xs text-muted-foreground">Upload your resume so Gemini can ask questions about your actual experience.</p>
            {localResumeName ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                <FileText className="w-5 h-5 text-green-600 shrink-0" />
                <span className="text-sm font-medium text-green-800 truncate">{localResumeName}</span>
                <button
                  onClick={() => { setLocalResumeName(''); setLocalResumeText(''); }}
                  className="ml-auto text-xs text-red-500 hover:underline shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsingResume}
                className="flex items-center gap-2 border-2 border-dashed border-border rounded-xl p-4 w-full hover:border-primary/50 transition-colors text-sm text-muted-foreground"
              >
                {isParsingResume ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Parsing PDF…</>
                ) : (
                  <><Upload className="w-4 h-4" /> Click to upload PDF resume</>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleResumeUpload}
            />
          </div>

          <button
            onClick={startInterview}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Play className="w-5 h-5" />
            Start Interview
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── GENERATING PHASE ───────────────────────────────────────────────────────
  if (phase === 'generating') {
    return (
      <DashboardLayout role="student">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="bg-white rounded-2xl border p-10 text-center max-w-sm w-full space-y-4">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto" />
            <h2 className="text-lg font-bold">Gemini is crafting your questions…</h2>
            <p className="text-sm text-muted-foreground">
              {localResumeName
                ? `Personalizing based on your resume: ${localResumeName}`
                : 'Generating role-specific questions for your profile'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── FINISHED PHASE ─────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const avgComm = feedbacks.length
      ? Math.round(feedbacks.reduce((a, b) => a + (b.communicationMetrics?.communicationScore || 0), 0) / feedbacks.length * 10) / 10
      : 0;
    const avgConf = feedbacks.length
      ? Math.round(feedbacks.reduce((a, b) => a + (b.communicationMetrics?.confidenceScore || 0), 0) / feedbacks.length * 10) / 10
      : 0;
    const avgSpeed = feedbacks.length
      ? Math.round(feedbacks.reduce((a, b) => a + (b.communicationMetrics?.speechSpeed || 0), 0) / feedbacks.length)
      : 0;
    const totalFillers = feedbacks.reduce((a, b) => a + (b.communicationMetrics?.fillerWordCount || 0), 0);

    return (
      <DashboardLayout role="student">
        <div className="max-w-3xl mx-auto py-8 space-y-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-500" />
            <h1 className="text-2xl font-bold">Interview Complete</h1>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-2xl border p-6 flex items-center gap-6">
            <div className={`text-6xl font-bold ${scoreColor(avgScore)}`}>{avgScore}<span className="text-2xl">/10</span></div>
            <div>
              <div className="font-semibold text-lg">Overall Technical Score</div>
              <div className="text-sm text-muted-foreground">Average across {feedbacks.length} question{feedbacks.length !== 1 ? 's' : ''}</div>
            </div>
          </div>

          {/* Communication Metrics */}
          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Communication Metrics</h2>
            <div className="grid grid-cols-4 gap-3 text-center text-sm">
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="text-2xl font-bold text-primary">{avgComm}</div>
                <div className="text-xs text-muted-foreground mt-1">Comm Score</div>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="text-2xl font-bold text-primary">{avgConf}</div>
                <div className="text-xs text-muted-foreground mt-1">Confidence</div>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="text-2xl font-bold text-primary">{avgSpeed}</div>
                <div className="text-xs text-muted-foreground mt-1">WPM</div>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="text-2xl font-bold text-amber-500">{totalFillers}</div>
                <div className="text-xs text-muted-foreground mt-1">Filler Words</div>
              </div>
            </div>
          </div>

          {/* Per-question breakdown */}
          <div className="space-y-4">
            {questions.map((q, i) => {
              const fb = feedbacks[i];
              if (!fb) return null;
              return (
                <div key={i} className="bg-white rounded-2xl border p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-semibold text-muted-foreground">Q{i + 1}</div>
                    <div className={`text-xl font-bold ${scoreColor(fb.technicalScore)}`}>{fb.technicalScore}/10</div>
                  </div>
                  <p className="text-sm font-medium">{q}</p>
                  {allAnswers[i] && (
                    <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2 line-clamp-2">
                      {allAnswers[i].slice(0, 200)}{allAnswers[i].length > 200 ? '…' : ''}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-green-700 flex items-center gap-1 mb-1"><CheckCircle className="w-3 h-3" /> Strengths</div>
                      <ul className="space-y-1">
                        {fb.strengths.map((s, j) => <li key={j} className="text-muted-foreground">• {s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-700 flex items-center gap-1 mb-1"><TrendingUp className="w-3 h-3" /> Improvements</div>
                      <ul className="space-y-1">
                        {fb.improvements.map((s, j) => <li key={j} className="text-muted-foreground">• {s}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs">
                    <div className="font-semibold text-blue-700 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Suggested Answer</div>
                    <p className="text-blue-800">{fb.suggestedAnswer}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              setPhase('config');
              setQuestions([]);
              setCurrentQuestionIndex(0);
              setAllAnswers([]);
              setFeedbacks([]);
              setIsFollowUp(false);
              setFollowUpQuestion(null);
              setTranscript('');
              transcriptRef.current = '';
            }}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-5 h-5" />
            Start New Interview
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── ACTIVE INTERVIEW PHASES ────────────────────────────────────────────────
  const totalQuestions = questions.length || 5;
  const progressPct = ((currentQuestionIndex) / totalQuestions) * 100;
  const isThinking = phase === 'thinking';
  const isRecording = phase === 'recording';
  const isEvaluating = phase === 'evaluating';
  const isFollowUpPhase = phase === 'followup';
  const timerMax = isThinking ? THINKING_TIME : RECORDING_TIME;
  const timerPct = (timeLeft / timerMax) * 100;

  return (
    <DashboardLayout role="student">
      <div className="max-w-2xl mx-auto py-8 space-y-5">

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">
              Question {currentQuestionIndex + 1} of {totalQuestions}
              {isFollowUp && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Follow-up</span>}
            </span>
            {(isThinking || isRecording) && (
              <span className={`flex items-center gap-1 font-mono font-bold ${isRecording ? 'text-red-500' : 'text-amber-600'}`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </span>
            )}
          </div>
          {/* Overall progress */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          {/* Timer bar */}
          {(isThinking || isRecording) && (
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isRecording ? 'bg-red-500' : 'bg-amber-400'}`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-base font-medium leading-relaxed">{currentQuestion}</p>
          </div>
        </div>

        {/* THINKING */}
        {isThinking && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-4">
            <Clock className="w-8 h-8 text-amber-500 mx-auto" />
            <div>
              <div className="font-semibold text-amber-800">30 seconds to prepare</div>
              <div className="text-sm text-amber-700 mt-1">Think through your answer before speaking</div>
            </div>
            <button
              onClick={() => {
                clearTimer();
                beginRecording();
              }}
              className="bg-primary text-primary-foreground rounded-xl px-6 py-2.5 font-semibold text-sm flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity"
            >
              <Mic className="w-4 h-4" />
              Start Answering
            </button>
          </div>
        )}

        {/* RECORDING */}
        {isRecording && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Recording…
                </div>
                <span className="text-xs text-muted-foreground">{liveWordCount} words</span>
              </div>
              <div className="min-h-[80px] bg-white rounded-xl border p-3 text-sm text-muted-foreground">
                {transcript || <span className="italic">Start speaking — your words will appear here…</span>}
              </div>
            </div>
            <button
              onClick={() => stopAndEvaluate()}
              className="w-full bg-red-500 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
            >
              <MicOff className="w-5 h-5" />
              Stop &amp; Submit
            </button>
          </div>
        )}

        {/* EVALUATING */}
        {isEvaluating && (
          <div className="bg-white border rounded-2xl p-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
            <div className="font-semibold">Gemini is evaluating your answer…</div>
            <div className="text-sm text-muted-foreground">Analyzing technical depth and communication quality</div>
          </div>
        )}

        {/* FOLLOW-UP */}
        {isFollowUpPhase && followUpQuestion && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                  Based on your answer, the interviewer wants to dig deeper:
                </div>
                <p className="text-sm font-medium text-purple-900">{followUpQuestion}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPhase('thinking');
                  startTimer(THINKING_TIME, () => beginRecording());
                }}
                className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Mic className="w-4 h-4" />
                Answer Follow-up
              </button>
              <button
                onClick={() => advanceQuestion(allAnswers, feedbacks)}
                className="flex-1 border border-border rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted/40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Mode / context badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{mode === 'technical' ? 'Technical' : mode === 'project' ? 'Project Deep-Dive' : 'HR / Behavioral'} interview · {careerTrack}</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
