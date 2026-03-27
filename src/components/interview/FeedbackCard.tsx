import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import type { QuestionEvaluation, QuestionMetadata } from '../../types/interview';
import { scoreColor, scoreBg } from '../../lib/interviewEngine';

interface Props {
  evaluation: QuestionEvaluation;
  question: QuestionMetadata;
  index: number;
}

export function FeedbackCard({ evaluation, question, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  return (
    <div className={`border rounded-xl overflow-hidden ${scoreBg(evaluation.overallScore)}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-mono">Q{index + 1}</span>
          <p className="text-sm font-medium text-slate-800 line-clamp-1">{question.text.slice(0, 80)}…</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xl font-bold font-mono ${scoreColor(evaluation.overallScore)}`}>
            {evaluation.overallScore.toFixed(1)}<span className="text-sm text-slate-500">/10</span>
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-200">
          {/* Full question */}
          <div className="pt-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Question</p>
            <p className="text-sm text-slate-800 leading-relaxed">{question.text}</p>
          </div>

          {/* Answer excerpt */}
          {evaluation.answer && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Your Answer</p>
              <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 line-clamp-3 italic">
                "{evaluation.answer.slice(0, 300)}{evaluation.answer.length > 300 ? '…' : ''}"
              </p>
            </div>
          )}

          {/* Rubric breakdown */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Rubric Breakdown</p>
            <div className="space-y-2">
              {evaluation.rubricScores.map(rs => (
                <div key={rs.criterion} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-800">{rs.criterion}</span>
                    <span className={`text-xs font-bold font-mono ${scoreColor(rs.score)}`}>{rs.score}/10</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${rs.score >= 8 ? 'bg-green-500' : rs.score >= 5 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${rs.score * 10}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">{rs.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths + Improvements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-green-600 flex items-center gap-1 mb-2">
                <CheckCircle className="w-3 h-3" /> Strengths
              </p>
              <ul className="space-y-1">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 flex items-center gap-1 mb-2">
                <TrendingUp className="w-3 h-3" /> Improvements
              </p>
              <ul className="space-y-1">
                {evaluation.improvements.map((s, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* STAR analysis */}
          {evaluation.starAnalysis && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">STAR Analysis</p>
              <div className="grid grid-cols-4 gap-2">
                {(['situation', 'task', 'action', 'result'] as const).map(key => {
                  const s = evaluation.starAnalysis![key];
                  return (
                    <div key={key} className={`rounded-lg p-2 text-center border ${s.present ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-[10px] font-bold uppercase text-slate-500">{key[0].toUpperCase()}</p>
                      <p className={`text-sm font-bold ${s.present ? 'text-green-600' : 'text-red-600'}`}>{s.quality}/10</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Model answer */}
          <details open={modelOpen} onToggle={e => setModelOpen((e.target as HTMLDetailsElement).open)}>
            <summary className="text-xs text-primary cursor-pointer flex items-center gap-1.5 hover:text-primary/80">
              <Zap className="w-3 h-3" /> {modelOpen ? 'Hide' : 'Show'} model answer
            </summary>
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-800 leading-relaxed">{evaluation.modelAnswer}</p>
            </div>
          </details>

          {/* Speech metrics */}
          {evaluation.communication && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Speech Metrics</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'WPM', val: evaluation.communication.speechSpeedWPM, ideal: '130–150' },
                  { label: 'Fillers', val: evaluation.communication.fillerWordCount, ideal: '<5' },
                  { label: 'Confidence', val: `${evaluation.communication.confidenceScore}/10`, ideal: '' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-50 rounded-lg p-2">
                    <p className="text-sm font-bold font-mono text-slate-800">{m.val}</p>
                    <p className="text-[10px] text-slate-500">{m.label}</p>
                    {m.ideal && <p className="text-[9px] text-slate-500">ideal: {m.ideal}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
