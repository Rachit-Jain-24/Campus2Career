import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { QuestionMetadata } from '../../types/interview';

interface Props {
  question: QuestionMetadata;
  questionNumber: number;
  totalQuestions: number;
}

const DIFFICULTY_COLORS = {
  junior: 'bg-green-900/40 text-green-300 border-green-700/50',
  mid: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  senior: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  staff: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
};

export function QuestionDisplay({ question, questionNumber, totalQuestions }: Props) {
  const [rubricOpen, setRubricOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[#8080a0] font-mono">Q{questionNumber}/{totalQuestions}</span>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[question.difficulty]}`}>
          {question.difficulty}
        </span>
        {question.topicTags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a24] border border-[#2a2a38] text-[#8080a0]">
            {tag}
          </span>
        ))}
        {question.companyTags.length > 0 && (
          <span className="text-[10px] text-[#8080a0]">
            Similar to: {question.companyTags.join(', ')}
          </span>
        )}
      </div>

      {/* Question text */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
        <p className="text-slate-800 text-base leading-relaxed whitespace-pre-wrap">
          {question.text}
        </p>
      </div>

      {/* Rubric preview */}
      <button
        onClick={() => setRubricOpen(o => !o)}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-700 transition-colors"
      >
        {rubricOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {rubricOpen ? 'Hide' : 'Show'} scoring rubric
      </button>

      {rubricOpen && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">This answer will be scored on:</p>
          {question.rubric.map(r => (
            <div key={r.criterion} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{r.criterion}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{Math.round(r.weight * 100)}%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{r.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
