import { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import { Loader2, ChevronRight, CheckCircle, TrendingUp, MessageSquare, Mic } from 'lucide-react';
import { interviewReducer, initialInterviewState, getHireSignal, scoreColor } from '../../lib/interviewEngine';
import {
  generateInterviewQuestionsStructured, evaluateAnswerWithRubric,
  analyzeSTAR, generateAIInterviewerMessage
} from '../../lib/gemini';
import { AIInterviewerAvatar } from './AIInterviewerAvatar';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerPanel } from './AnswerPanel';
import { ThinkingTimer } from './ThinkingTimer';
import type { SessionConfig, InterviewSession, QuestionEvaluation, QuestionMetadata } from '../../types/interview';

interface Props {
  config: SessionConfig;
  onComplete: (session: InterviewSession) => void;
  onAbort: () => void;
}

export function InterviewRoom({ config, onComplete, onAbort }: Props) {
  const [state, dispatch] = useReducer(interviewReducer, initialInterviewState);
  const [emptyConfirm, setEmptyConfirm] = useState(false);
  const [flashCountdown, setFlashCountdown] = useState(5);
  const flashTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingSubmitRef = useRef<{ answer: string; code?: string; duration: number } | null>(null);

  const currentQuestion: QuestionMetadata | undefined = state.questions[state.currentQuestionIndex];
  const totalQuestions = state.questions.length;
  const progressPct = totalQuestions > 0 ? ((state.currentQuestionIndex) / totalQuestions) * 100 : 0;

  // ── Init session ────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch({ type: 'START_SESSION', config });
    dispatch({ type: 'SET_AI_MESSAGE', message: `Welcome! I'm Aria. Let's begin your interview for the ${config.targetRole} role. Generating your questions…`, speaking: true });

    const allModes = config.rounds.map(r => r.mode);
    const allCounts = config.rounds.map(r => r.questionCount);

    Promise.all(
      config.rounds.map((round, i) =>
        generateInterviewQuestionsStructured({
          mode: round.mode,
          difficulty: config.difficulty,
          targetRole: config.targetRole,
          targetCompany: config.targetCompany,
          resumeText: config.resumeText,
          count: round.questionCount,
        })
      )
    ).then(questionArrays => {
      const flat = questionArrays.flat();
      dispatch({ type: 'SET_QUESTIONS', questions: flat });
      dispatch({ type: 'SET_AI_MESSAGE', message: `Questions ready. I'll read each one aloud. Take 30 seconds to think before answering.`, speaking: true });
      setTimeout(() => dispatch({ type: 'BRIEFING_DONE' }), 2000);
    });
  }, []);

  // ── Flash card auto-advance ─────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'between_questions') {
      if (flashTimerRef.current) clearInterval(flashTimerRef.current);
      setFlashCountdown(5);
      return;
    }
    setFlashCountdown(5);
    flashTimerRef.current = setInterval(() => {
      setFlashCountdown(prev => {
        if (prev <= 1) {
          clearInterval(flashTimerRef.current!);
          dispatch({ type: 'ADVANCE_QUESTION' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (flashTimerRef.current) clearInterval(flashTimerRef.current); };
  }, [state.phase]);

  // ── Finish session ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'finished') return;
    const evals = state.evaluations;
    const overallScore = evals.length
      ? Math.round(evals.reduce((a, e) => a + e.overallScore, 0) / evals.length * 10) / 10
      : 0;

    const session: InterviewSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      difficulty: config.difficulty,
      targetRole: config.targetRole,
      rounds: config.rounds,
      questions: state.questions,
      evaluations: evals,
      resumeUsed: !!config.resumeText,
      overallScore,
      roundScores: {},
      hireRecommendation: getHireSignal(overallScore),
      aiInterviewerNotes: `${overallScore >= 7 ? 'Strong' : 'Developing'} ${config.difficulty}-level candidate for ${config.targetRole}. ${evals[0]?.strengths[0] || ''}`,
      durationSec: (Date.now() - state.sessionStartTime) / 1000,
    };
    onComplete(session);
  }, [state.phase]);

  // ── Answer submission ───────────────────────────────────────────────────────
  const handleAnswerSubmit = useCallback(async (answer: string, code?: string, duration?: number) => {
    if (!currentQuestion) return;
    dispatch({ type: 'ANSWER_SUBMITTED', answer, code, duration: duration || 0 });
    dispatch({ type: 'SET_AI_MESSAGE', message: 'Got it, let me review that…', speaking: true });

    const evaluation = await evaluateAnswerWithRubric({
      question: currentQuestion,
      answer,
      codeSubmission: code,
      mode: currentQuestion.mode,
      difficulty: config.difficulty,
      resumeContext: config.resumeText?.slice(0, 500),
    });

    // STAR analysis for behavioral
    if (currentQuestion.mode === 'behavioral' && answer?.trim()) {
      const star = await analyzeSTAR(answer);
      (evaluation as any).starAnalysis = star;
    }

    evaluation.durationSec = duration || 0;
    dispatch({ type: 'EVALUATION_COMPLETE', evaluation });

    // Generate a personalized spoken response based on the actual answer
    let ariaResponse = '';
    if (!answer?.trim()) {
      ariaResponse = "I didn't catch an answer. Let's move on.";
    } else if (evaluation.overallScore >= 8) {
      const strength = evaluation.strengths[0] || 'your approach';
      ariaResponse = `Great answer. I particularly liked ${strength.toLowerCase()}. Let's continue.`;
    } else if (evaluation.overallScore >= 5) {
      const improvement = evaluation.improvements[0] || 'adding more depth';
      ariaResponse = `Thanks. One thing to work on — ${improvement.toLowerCase()}. Moving to the next question.`;
    } else {
      ariaResponse = `I see. The answer could use more depth. Let's keep going and you can review the feedback at the end.`;
    }

    if (evaluation.followUpQuestion) {
      ariaResponse = `Interesting. I'd like to dig deeper — ${evaluation.followUpQuestion}`;
    }

    dispatch({ type: 'SET_AI_MESSAGE', message: ariaResponse, speaking: true });
  }, [currentQuestion, config]);

  // ── Speak question when thinking phase starts ──────────────────────────────
  const prevPhaseRef = useRef<string>('');
  useEffect(() => {
    if (state.phase === 'thinking' && prevPhaseRef.current !== 'thinking' && currentQuestion) {
      // Small delay so the welcome message finishes first
      const delay = prevPhaseRef.current === 'briefing' ? 500 : 200;
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const intro = state.currentQuestionIndex === 0
            ? `Question ${state.currentQuestionIndex + 1}. `
            : `Next question. `;
          const utter = new SpeechSynthesisUtterance(intro + currentQuestion.text);
          utter.rate = 0.9;
          utter.pitch = 1.05;
          utter.lang = 'en-US';
          const voices = window.speechSynthesis.getVoices();
          const preferred =
            voices.find(v => v.name === 'Samantha') ||
            voices.find(v => v.name === 'Google UK English Female') ||
            voices.find(v => v.name.includes('Zira')) ||
            voices.find(v => v.lang.startsWith('en-'));
          if (preferred) utter.voice = preferred;
          window.speechSynthesis.speak(utter);
        }
      }, delay);
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, currentQuestion]);

  const avatarState = state.isAiSpeaking ? 'speaking'
    : state.phase === 'answering' ? 'listening'
    : state.phase === 'ai_responding' ? 'thinking'
    : 'idle';

  const lastEval = state.evaluations[state.evaluations.length - 1];

  const handleEmpty = () => setEmptyConfirm(true);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden max-w-xs border border-slate-200">
              <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">
              {state.currentQuestionIndex + 1} / {Math.max(totalQuestions, 1)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {currentQuestion && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 uppercase tracking-widest">
                {currentQuestion.mode.replace('_', ' ')}
              </span>
            )}
            <button onClick={onAbort} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Abort</button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* Briefing / Generating */}
        {(state.phase === 'briefing' || state.questions.length === 0) && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <AIInterviewerAvatar state="thinking" message={state.aiMessage} />
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating your personalized questions…
            </div>
          </div>
        )}

        {/* Active interview */}
        {state.questions.length > 0 && currentQuestion && ['thinking', 'answering', 'ai_responding', 'follow_up'].includes(state.phase) && (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Left: AI Avatar */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
              <AIInterviewerAvatar state={avatarState} message={state.aiMessage} />
            </div>

            {/* Right: Question + Answer */}
            <div className="space-y-5">
              <QuestionDisplay
                question={state.phase === 'follow_up' && lastEval?.followUpQuestion
                  ? { ...currentQuestion, text: lastEval.followUpQuestion }
                  : currentQuestion}
                questionNumber={state.currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
              />

              {state.phase === 'thinking' && (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col items-center">
                  <ThinkingTimer
                    totalSeconds={30}
                    onExpire={() => dispatch({ type: 'START_ANSWERING' })}
                    onSkip={() => dispatch({ type: 'START_ANSWERING' })}
                  />
                </div>
              )}

              {state.phase === 'answering' && (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                  <AnswerPanel
                    mode={currentQuestion.mode}
                    codeLanguage={config.codeLanguage}
                    onSubmit={handleAnswerSubmit}
                    onEmpty={handleEmpty}
                  />
                </div>
              )}

              {state.phase === 'ai_responding' && (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-slate-500">Aria is reviewing your answer…</p>
                </div>
              )}

              {state.phase === 'follow_up' && lastEval?.followUpQuestion && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-primary uppercase tracking-widest mb-1">Follow-up Question</p>
                      <p className="text-sm text-slate-800">{lastEval.followUpQuestion}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => dispatch({ type: 'START_ANSWERING' })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      <Mic className="w-4 h-4" /> Answer Follow-up
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'ADVANCE_QUESTION' })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-100 text-slate-500 text-sm font-bold rounded-xl hover:text-slate-800 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" /> Skip
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Between questions flash */}
        {state.phase === 'between_questions' && lastEval && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white border border-slate-100 rounded-2xl p-8 max-w-sm w-full space-y-5 text-center shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-widest">Question {state.currentQuestionIndex + 1} Complete</p>
              <div className={`text-5xl font-bold font-mono ${scoreColor(lastEval.overallScore)}`}>
                {lastEval.overallScore.toFixed(1)}<span className="text-xl text-slate-500">/10</span>
              </div>
              <div className="space-y-2 text-left">
                {lastEval.strengths[0] && (
                  <div className="flex items-start gap-2 text-xs text-green-600">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {lastEval.strengths[0]}
                  </div>
                )}
                {lastEval.improvements[0] && (
                  <div className="flex items-start gap-2 text-xs text-amber-600">
                    <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {lastEval.improvements[0]}
                  </div>
                )}
              </div>
              {state.currentQuestionIndex + 1 < totalQuestions && (
                <p className="text-xs text-slate-500">Next: Question {state.currentQuestionIndex + 2} of {totalQuestions}</p>
              )}
              <button
                onClick={() => { if (flashTimerRef.current) clearInterval(flashTimerRef.current); dispatch({ type: 'ADVANCE_QUESTION' }); }}
                className="w-full py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors"
              >
                Continue → <span className="text-white/60 text-xs">({flashCountdown}s)</span>
              </button>
            </div>
          </div>
        )}

        {/* Finishing */}
        {state.phase === 'finished' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-slate-500">Compiling your session report…</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty answer confirmation */}
      {emptyConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <p className="text-sm font-bold text-slate-800">Your answer appears empty.</p>
            <p className="text-xs text-slate-500">Submit anyway? This will result in a low score for this question.</p>
            <div className="flex gap-3">
              <button onClick={() => { setEmptyConfirm(false); handleAnswerSubmit('', undefined, 0); }}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors">
                Submit Anyway
              </button>
              <button onClick={() => setEmptyConfirm(false)}
                className="flex-1 py-2.5 border border-slate-100 text-slate-500 text-sm font-bold rounded-xl hover:text-slate-800 transition-colors">
                Keep Answering
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
