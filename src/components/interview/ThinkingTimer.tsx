import { useEffect, useRef, useState } from 'react';

interface Props {
  totalSeconds: number;
  onExpire: () => void;
  onSkip: () => void;
}

const THINKING_TIPS = [
  'Restate the question in your own words first.',
  'Think of a concrete example from your experience.',
  'Consider edge cases and trade-offs.',
  'Structure your answer: context → approach → solution → outcome.',
  "It's okay to say \"Let me think about that for a moment.\"",
  'Ask a clarifying question if anything is ambiguous.',
  'Start with brute force, then optimize.',
];

export function ThinkingTimer({ totalSeconds, onExpire, onSkip }: Props) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [tip] = useState(() => THINKING_TIPS[Math.floor(Math.random() * THINKING_TIPS.length)]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    setTimeLeft(totalSeconds);
    hasExpiredRef.current = false;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, [totalSeconds]);

  useEffect(() => {
    if (timeLeft === 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpire();
    }
  }, [timeLeft, onExpire]);

  const pct = timeLeft / totalSeconds;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);
  const ringColor = pct > 0.6 ? '#6366f1' : pct > 0.3 ? '#f59e0b' : '#ef4444';
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const handleSkip = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onSkip();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Timer ring */}
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={ringColor} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-black text-slate-800 tabular-nums">
            {mins}:{String(secs).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">think</span>
        </div>
      </div>

      {/* Randomized thinking tip */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 max-w-[240px] text-center">
        <p className="text-[11px] text-indigo-700 leading-relaxed italic">💡 {tip}</p>
      </div>

      <button
        onClick={handleSkip}
        className="text-xs text-primary font-bold hover:underline transition-colors px-4 py-1.5 rounded-lg hover:bg-primary/5"
      >
        Ready to answer →
      </button>
    </div>
  );
}
