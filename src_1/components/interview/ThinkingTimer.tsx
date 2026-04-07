import { useEffect, useRef, useState } from 'react';

interface Props {
  totalSeconds: number;
  onExpire: () => void;
  onSkip: () => void;
}

export function ThinkingTimer({ totalSeconds, onExpire, onSkip }: Props) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTimeLeft(totalSeconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [totalSeconds]);

  const pct = timeLeft / totalSeconds;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);
  const ringColor = pct > 0.6 ? '#f59e0b' : pct > 0.3 ? '#f97316' : '#ef4444';
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const handleSkip = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onSkip();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={ringColor} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xl font-bold text-slate-800">
            {mins}:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-500">Take your time. Think before you speak.</p>
      <button
        onClick={handleSkip}
        className="text-xs text-primary hover:underline transition-colors"
      >
        Start Answering Early →
      </button>
    </div>
  );
}
