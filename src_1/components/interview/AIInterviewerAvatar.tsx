import { useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

interface Props {
  state: 'idle' | 'speaking' | 'listening' | 'thinking';
  message: string;
  speak?: boolean;
}

// Speak a message using the browser's speech synthesis
function speakMessage(text: string) {
  if (!('speechSynthesis' in window) || !text?.trim()) return;

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.92;
  utter.pitch = 1.1;
  utter.volume = 1;
  utter.lang = 'en-US';

  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred =
        voices.find(v => v.name === 'Samantha') ||
        voices.find(v => v.name === 'Google UK English Female') ||
        voices.find(v => v.name.includes('Zira')) ||
        voices.find(v => v.name.includes('Female') && v.lang.startsWith('en')) ||
        voices.find(v => v.lang.startsWith('en-'));
      if (preferred) utter.voice = preferred;
    }
    window.speechSynthesis.speak(utter);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    trySpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      trySpeak();
    };
    setTimeout(trySpeak, 300);
  }
}

export function AIInterviewerAvatar({ state, message, speak = true }: Props) {
  const lastSpokenRef = useRef('');

  useEffect(() => {
    if (!speak || !message || message === lastSpokenRef.current) return;
    lastSpokenRef.current = message;
    speakMessage(message);
  }, [message, speak]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';

  const stateConfig = {
    speaking: {
      ring1: 'border-blue-400/40',
      ring2: 'border-blue-300/25',
      glow: 'shadow-blue-500/40',
      gradient: 'from-blue-600 via-indigo-600 to-violet-600',
      badge: 'bg-blue-500',
      badgeText: 'text-blue-50',
      pill: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      label: 'Speaking',
    },
    listening: {
      ring1: 'border-emerald-400/40',
      ring2: 'border-emerald-300/25',
      glow: 'shadow-emerald-400/40',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      badge: 'bg-emerald-500',
      badgeText: 'text-white',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Listening',
    },
    thinking: {
      ring1: 'border-amber-400/40',
      ring2: 'border-amber-300/25',
      glow: 'shadow-amber-400/30',
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      badge: 'bg-amber-500',
      badgeText: 'text-white',
      pill: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Thinking',
    },
    idle: {
      ring1: 'border-slate-300/30',
      ring2: 'border-slate-200/20',
      glow: 'shadow-slate-300/20',
      gradient: 'from-slate-500 via-slate-600 to-slate-700',
      badge: 'bg-slate-400',
      badgeText: 'text-white',
      pill: 'bg-slate-50 text-slate-500 border-slate-200',
      dot: 'bg-slate-400',
      label: 'Idle',
    },
  }[state];

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Avatar with animated rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring - slow pulse */}
        <div
          className={`absolute w-36 h-36 rounded-full border-2 ${stateConfig.ring2} transition-all duration-700 ${
            state !== 'idle' ? 'animate-ping opacity-30' : 'opacity-0'
          }`}
          style={{ animationDuration: '2s' }}
        />
        {/* Middle ring */}
        <div
          className={`absolute w-28 h-28 rounded-full border-2 ${stateConfig.ring1} transition-all duration-500 ${
            state !== 'idle' ? 'animate-pulse opacity-60' : 'opacity-20'
          }`}
        />

        {/* Avatar orb */}
        <div
          className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${stateConfig.gradient} flex items-center justify-center
            shadow-xl ${stateConfig.glow} transition-all duration-500
            ${isSpeaking ? 'scale-110' : isListening ? 'scale-105' : 'scale-100'}
          `}
        >
          {/* "A" letter */}
          <span className="text-2xl font-black text-white select-none tracking-tight" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            A
          </span>

          {/* Thinking dots */}
          {isThinking && (
            <div className="absolute -bottom-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce shadow-sm"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
          )}

          {/* Listening mic badge */}
          {isListening && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md border-2 border-white">
              <Mic className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Name + title */}
      <div className="text-center">
        <p className="text-sm font-black text-slate-800 tracking-tight">Aria</p>
        <p className="text-[10px] text-slate-400 font-medium">Senior Evaluation Engineer · AI Interviewer</p>
      </div>

      {/* Voice waveform (speaking only) */}
      {isSpeaking && (
        <div className="flex items-end gap-0.5 h-6">
          {[3, 7, 14, 9, 5, 12, 6, 10, 4, 8, 13, 5].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-blue-400 animate-bounce opacity-80"
              style={{
                height: `${h}px`,
                animationDelay: `${(i * 0.08) % 0.5}s`,
                animationDuration: `${0.5 + (i % 3) * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Status pill */}
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${stateConfig.pill} transition-all duration-300`}>
        <div className={`w-1.5 h-1.5 rounded-full ${stateConfig.dot} ${state !== 'idle' ? 'animate-pulse' : ''}`} />
        {stateConfig.label}
      </div>

      {/* Speech bubble */}
      {message && (
        <div
          className={`w-full rounded-2xl p-4 text-xs leading-relaxed transition-all border ${
            isSpeaking
              ? 'bg-blue-50 border-blue-200 text-slate-700'
              : isListening
              ? 'bg-emerald-50 border-emerald-200 text-slate-700'
              : isThinking
              ? 'bg-amber-50 border-amber-200 text-slate-700'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
