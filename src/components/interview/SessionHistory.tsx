import { useState } from 'react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
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

export function SessionHistory({ sessions }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

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

  return (
    <div className="space-y-5 max-w-3xl mx-auto py-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sessions', val: sessions.length },
          { label: 'Best Score', val: `${bestScore.toFixed(1)}/10` },
          { label: 'Average Score', val: `${avgScore}/10` },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xl font-bold font-mono text-primary">{s.val}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Session list */}
      <div className="space-y-3">
        {sorted.map(session => (
          <div key={session.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setExpanded(expanded === session.id ? null : session.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">{session.targetRole}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500">
                      {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[10px] text-slate-500">{Math.round(session.durationSec / 60)} min</span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[10px] text-slate-500 capitalize">{session.difficulty}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xl font-bold font-mono ${scoreColor(session.overallScore)}`}>
                  {session.overallScore.toFixed(1)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${HIRE_BADGE[session.hireRecommendation] || HIRE_BADGE.lean_yes}`}>
                  {getHireLabel(session.overallScore)}
                </span>
              </div>
            </button>

            {expanded === session.id && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {session.rounds.map(r => (
                    <span key={r.mode} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
                      {r.label}
                    </span>
                  ))}
                </div>
                {session.aiInterviewerNotes && (
                  <p className="text-xs text-slate-500 italic">"{session.aiInterviewerNotes}"</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {session.evaluations.slice(0, 4).map((ev, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-2 flex items-center justify-between">
                      <p className="text-[10px] text-slate-500 truncate">Q{i + 1}</p>
                      <span className={`text-xs font-bold font-mono ${scoreColor(ev.overallScore)}`}>{ev.overallScore.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
