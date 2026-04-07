import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, RefreshCw, TrendingUp, CheckCircle2, Loader2, History } from 'lucide-react';
import type { InterviewSession } from '../../types/interview';
import { FeedbackCard } from './FeedbackCard';
import { scoreColor, getHireLabel } from '../../lib/interviewEngine';

interface Props {
  session: InterviewSession;
  onRestart: () => void;
  isSaving?: boolean;
}

const HIRE_BADGE: Record<string, string> = {
  strong_yes: 'bg-green-100 text-green-700 border-green-300',
  yes: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  lean_yes: 'bg-amber-100 text-amber-700 border-amber-300',
  no: 'bg-red-100 text-red-700 border-red-300',
  strong_no: 'bg-red-100 text-red-800 border-red-400',
};

export function SessionReport({ session, onRestart, isSaving = false }: Props) {
  const durationMin = Math.round(session.durationSec / 60);

  // Build radar data
  const radarData = [
    { subject: 'Technical', score: session.overallScore },
    { subject: 'Communication', score: session.evaluations[0]?.communication?.clarityScore || 0 },
    { subject: 'Problem Solving', score: session.evaluations.reduce((a, e) => a + e.technicalDepthScore, 0) / Math.max(1, session.evaluations.length) },
    { subject: 'Code Quality', score: session.evaluations.find(e => e.codeSubmission)?.rubricScores.find(r => r.criterion === 'Code Quality')?.score || 0 },
    { subject: 'Behavioral', score: session.evaluations.find(e => e.starAnalysis)?.starAnalysis?.overallSTARScore || 0 },
  ].filter(d => d.score > 0);

  // Communication averages
  const commEvals = session.evaluations.filter(e => e.communication);
  const avgWPM = commEvals.length ? Math.round(commEvals.reduce((a, e) => a + (e.communication?.speechSpeedWPM || 0), 0) / commEvals.length) : 0;
  const totalFillers = commEvals.reduce((a, e) => a + (e.communication?.fillerWordCount || 0), 0);
  const allFillerWords = commEvals.flatMap(e => e.communication?.fillerWords || []);
  const fillerCounts = allFillerWords.reduce((acc, w) => { acc[w] = (acc[w] || 0) + 1; return acc; }, {} as Record<string, number>);
  const avgConf = commEvals.length ? (commEvals.reduce((a, e) => a + (e.communication?.confidenceScore || 0), 0) / commEvals.length).toFixed(1) : '—';
  const avgClarity = commEvals.length ? (commEvals.reduce((a, e) => a + (e.communication?.clarityScore || 0), 0) / commEvals.length).toFixed(1) : '—';

  return (
    <div className="space-y-6 pb-12">
      {/* Save status */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${isSaving ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
        {isSaving
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving session to your history...</>
          : <><CheckCircle2 className="w-3.5 h-3.5" /> Session saved to history — view it anytime in the History tab</>
        }
      </div>

      {/* Hero banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">Interview Complete</h1>
              <p className="text-xs text-slate-500">{durationMin} min · {session.questions.length} questions · {session.rounds.map(r => r.label).join(', ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold font-mono ${scoreColor(session.overallScore)}`}>
              {session.overallScore.toFixed(1)}<span className="text-base text-slate-500">/10</span>
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${HIRE_BADGE[session.hireRecommendation] || HIRE_BADGE.lean_yes}`}>
              {getHireLabel(session.overallScore)}
            </span>
          </div>
        </div>
        {session.aiInterviewerNotes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 italic">"{session.aiInterviewerNotes}" — Aria</p>
          </div>
        )}
      </div>

      {/* Radar chart */}
      {radarData.length >= 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Performance Radar</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.2} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Communication deep-dive */}
      {commEvals.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Communication Analysis</p>
          {[
            { label: 'Words per minute', val: avgWPM, ideal: '130–150', pct: Math.min(100, (avgWPM / 150) * 100) },
            { label: 'Confidence score', val: `${avgConf}/10`, ideal: '>7', pct: parseFloat(avgConf as string) * 10 },
            { label: 'Clarity score', val: `${avgClarity}/10`, ideal: '>7', pct: parseFloat(avgClarity as string) * 10 },
          ].map(m => (
            <div key={m.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-800">{m.label}</span>
                <span className="font-mono text-slate-800">{m.val} <span className="text-slate-500">ideal: {m.ideal}</span></span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
          {totalFillers > 0 && (
            <div>
              <p className="text-xs text-slate-500">Filler words: <span className="text-amber-600 font-bold">{totalFillers} total</span></p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {Object.entries(fillerCounts).map(([w, c]) => (
                  <span key={w} className="text-[10px] px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-full text-amber-700">
                    "{w}" ×{c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Per-question breakdown */}
      <div className="space-y-3">
        <p className="text-xs text-slate-500 uppercase tracking-widest">Question Breakdown</p>
        {session.evaluations.map((ev, i) => (
          <FeedbackCard key={ev.questionId} evaluation={ev} question={session.questions[i]} index={i} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Start New Interview
        </button>
        <button
          onClick={() => window.print()}
          className="px-5 py-3.5 bg-slate-50 border border-slate-200 text-slate-500 font-bold text-sm rounded-xl hover:text-slate-800 transition-colors"
        >
          Print Report
        </button>
      </div>
    </div>
  );
}
