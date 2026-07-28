import { useState } from 'react';
import { Calendar, Clock, TrendingUp, ChevronDown, ChevronUp, Code2, MessageSquare, Zap } from 'lucide-react';
import type { InterviewSession } from '../../types/interview';
import { scoreColor, getHireLabel } from '../../lib/interviewEngine';

interface Props {
  sessions: InterviewSession[];
}

const HIRE_BADGE: Record<string, string> = {
  strong_yes: 'bg-green-100 text-green-700 border-green-300',
  yes: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  lean_yes: 'bg-amber-100 text-amber-700 border-amber-300',
  no: 'bg-red-100 text-red-700 border-red-300',
  strong_no: 'bg-red-100 text-red-800 border-red-400',
};

const MODE_LABEL: Record<string, string> = {
  dsa: 'DSA', system_design: 'System Design', behavioral: 'Behavioral', project: 'Project', hr: 'HR',
};

export function SessionHistory({ sessions }: Props) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <Clock className="w-10 h-10 text-slate-300" />
        <p className="text-sm text-slate-500">No sessions yet. Complete your first interview to see history here.</p>
      </div>
    );
  }

  const sorted = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const bestScore = Math.max(...sessions.map(s => s.overallScore));
  const avgScore = (sessions.reduce((a, s) => a + s.overallScore, 0) / sessions.length).toFixed(1);
  const totalTime = sessions.reduce((a, s) => a + (s.durationSec || 0), 0);

  return (
    <div className="space-y-5 max-w-3xl mx-auto py-6">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Sessions', val: String(sessions.length) },
          { label: 'Best Score', val: `${bestScore.toFixed(1)}/10` },
          { label: 'Avg Score', val: `${avgScore}/10` },
          { label: 'Total Time', val: `${Math.round(totalTime / 60)}m` },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xl font-bold font-mono text-primary">{s.val}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Score trend */}
      {sorted.length >= 2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Score Trend
          </p>
          <div className="flex items-end gap-1.5 h-16">
            {sorted.slice(0, 10).reverse().map((s, i) => (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max(4, (s.overallScore / 10) * 56)}px`,
                    backgroundColor: s.overallScore >= 7 ? '#22c55e' : s.overallScore >= 5 ? '#f59e0b' : '#ef4444',
                    opacity: 0.6 + (i / 10) * 0.4,
                  }}
                />
                <span className="text-[8px] text-slate-400 font-mono">{s.overallScore.toFixed(1)}</span>
              </div>
            ))}
          </div>
          {(() => {
            const recent = sorted.slice(0, 3).map(s => s.overallScore);
            const older = sorted.slice(3, 6).map(s => s.overallScore);
            if (older.length === 0) return null;
            const diff = (recent.reduce((a, b) => a + b, 0) / recent.length) - (older.reduce((a, b) => a + b, 0) / older.length);
            return (
              <p className={`text-xs font-bold mt-2 ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {diff >= 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(1)} pts vs previous 3 sessions
              </p>
            );
          })()}
        </div>
      )}

      {/* Session list */}
      <div className="space-y-3">
        {sorted.map(session => (
          <div key={session.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Session header */}
            <button
              onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{session.targetRole}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-500">
                      {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-500">{Math.round((session.durationSec || 0) / 60)} min</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-500 capitalize">{session.difficulty}</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-500">{session.questions.length} questions</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className={`text-xl font-bold font-mono ${scoreColor(session.overallScore)}`}>
                  {session.overallScore.toFixed(1)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${HIRE_BADGE[session.hireRecommendation] || HIRE_BADGE.lean_yes}`}>
                  {getHireLabel(session.overallScore)}
                </span>
                {expandedSession === session.id
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {expandedSession === session.id && (
              <div className="border-t border-slate-100 p-4 space-y-4">
                {/* Round tags + notes */}
                <div className="flex flex-wrap gap-2">
                  {session.rounds.map(r => (
                    <span key={r.mode} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
                      {r.label}
                    </span>
                  ))}
                  {session.resumeUsed && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700">
                      ✓ Resume used
                    </span>
                  )}
                </div>
                {session.aiInterviewerNotes && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 rounded-lg p-3">"{session.aiInterviewerNotes}" — Aria</p>
                )}

                {/* Per-question breakdown */}
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Question Breakdown</p>
                  {session.evaluations.map((ev, i) => {
                    const q = session.questions[i];
                    const qKey = `${session.id}-q${i}`;
                    const isQExpanded = expandedQuestion === qKey;
                    return (
                      <div key={i} className={`border rounded-xl overflow-hidden ${ev.overallScore >= 7 ? 'border-green-200' : ev.overallScore >= 4 ? 'border-amber-200' : 'border-red-200'}`}>
                        <button
                          onClick={() => setExpandedQuestion(isQExpanded ? null : qKey)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">Q{i + 1}</span>
                            {q && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
                                {MODE_LABEL[q.mode] || q.mode}
                              </span>
                            )}
                            <p className="text-xs text-slate-700 truncate">{q?.text?.slice(0, 70)}…</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className={`text-sm font-bold font-mono ${scoreColor(ev.overallScore)}`}>
                              {ev.overallScore.toFixed(1)}/10
                            </span>
                            {isQExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                          </div>
                        </button>

                        {isQExpanded && (
                          <div className="px-3 pb-3 space-y-3 border-t border-slate-100 pt-3">
                            {/* Full question */}
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Question</p>
                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{q?.text}</p>
                            </div>

                            {/* Rubric scores */}
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Scores</p>
                              <div className="space-y-1.5">
                                {ev.rubricScores.map(rs => (
                                  <div key={rs.criterion} className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-600 w-32 shrink-0">{rs.criterion}</span>
                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${rs.score >= 7 ? 'bg-green-500' : rs.score >= 4 ? 'bg-amber-500' : 'bg-red-500'}`}
                                        style={{ width: `${rs.score * 10}%` }}
                                      />
                                    </div>
                                    <span className={`text-[10px] font-bold font-mono w-8 text-right ${scoreColor(rs.score)}`}>{rs.score}/10</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Strengths + improvements */}
                            <div className="grid grid-cols-2 gap-3">
                              {ev.strengths?.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-green-600 font-bold mb-1">✓ Strengths</p>
                                  {ev.strengths.slice(0, 2).map((s, j) => (
                                    <p key={j} className="text-[10px] text-slate-600">• {s}</p>
                                  ))}
                                </div>
                              )}
                              {ev.improvements?.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-amber-600 font-bold mb-1">↑ Improve</p>
                                  {ev.improvements.slice(0, 2).map((s, j) => (
                                    <p key={j} className="text-[10px] text-slate-600">• {s}</p>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Code submission */}
                            {ev.codeSubmission && (
                              <details>
                                <summary className="text-[10px] text-slate-500 cursor-pointer flex items-center gap-1 hover:text-slate-700">
                                  <Code2 className="w-3 h-3" /> Your code
                                </summary>
                                <pre className="mt-2 text-[10px] font-mono bg-slate-900 text-green-300 p-3 rounded-lg overflow-x-auto max-h-40 whitespace-pre-wrap">
                                  {ev.codeSubmission}
                                </pre>
                              </details>
                            )}

                            {/* Model answer */}
                            {ev.modelAnswer && (
                              <details>
                                <summary className="text-[10px] text-primary cursor-pointer flex items-center gap-1 hover:text-primary/80">
                                  <Zap className="w-3 h-3" /> Model answer
                                </summary>
                                <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                  <p className="text-[10px] text-slate-700 leading-relaxed whitespace-pre-wrap">{ev.modelAnswer}</p>
                                </div>
                              </details>
                            )}

                            {/* Your answer */}
                            {ev.answer?.trim() && (
                              <details>
                                <summary className="text-[10px] text-slate-500 cursor-pointer flex items-center gap-1 hover:text-slate-700">
                                  <MessageSquare className="w-3 h-3" /> Your answer
                                </summary>
                                <p className="mt-2 text-[10px] text-slate-600 italic bg-slate-50 p-3 rounded-lg leading-relaxed">
                                  "{ev.answer.slice(0, 400)}{ev.answer.length > 400 ? '…' : ''}"
                                </p>
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
