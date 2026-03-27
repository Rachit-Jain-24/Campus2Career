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
      // Prefer a natural-sounding female English voice
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

  // Voices may not be loaded yet — wait for them
  if (window.speechSynthesis.getVoices().length > 0) {
    trySpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      trySpeak();
    };
    // Fallback: speak after 300ms even if onvoiceschanged never fires
    setTimeout(trySpeak, 300);
  }
}

export function AIInterviewerAvatar({ state, message, speak = true }: Props) {
  const lastSpokenRef = useRef('');

  // Speak whenever message changes — don't gate on state === 'speaking'
  // because the state may flip before the effect runs
  useEffect(() => {
    if (!speak || !message || message === lastSpokenRef.current) return;
    lastSpokenRef.current = message;
    speakMessage(message);
  }, [message, speak]);

  // Cancel on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Avatar */}
      <div className="relative">
        {isSpeaking && <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping scale-125" />}
        {isListening && <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping scale-110" />}

        <div className={`relative w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-lg transition-all duration-500 ${
          isSpeaking ? 'scale-105 shadow-xl shadow-primary/30' : 'scale-100'
        }`}>
          <span className="text-2xl font-black text-white select-none">A</span>

          {isThinking && (
            <div className="absolute -bottom-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}

          {isListening && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
              <Mic className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="text-center mt-1">
        <p className="text-sm font-black text-slate-800">Aria</p>
        <p className="text-[10px] text-slate-400 font-medium">Senior Engineer · Gemini AI</p>
      </div>

      {/* Speech bubble */}
      {message && (
        <div className={`w-full rounded-2xl p-4 text-xs leading-relaxed transition-all border ${
          isSpeaking ? 'bg-primary/5 border-primary/20 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-600'
        }`}>
          {isSpeaking && (
            <div className="flex gap-0.5 mb-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-0.5 rounded-full bg-primary animate-bounce"
                  style={{ height: `${8 + (i % 2) * 6}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}
          {message}
        </div>
      )}

      {/* Status pill */}
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
        isSpeaking ? 'bg-primary/10 text-primary' :
        isListening ? 'bg-green-100 text-green-700' :
        isThinking ? 'bg-amber-100 text-amber-700' :
        'bg-slate-100 text-slate-400'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${
          isSpeaking ? 'bg-primary animate-pulse' :
          isListening ? 'bg-green-500 animate-pulse' :
          isThinking ? 'bg-amber-500 animate-pulse' :
          'bg-slate-300'
        }`} />
        {isSpeaking ? 'Speaking' : isListening ? 'Listening' : isThinking ? 'Thinking' : 'Idle'}
      </div>
    </div>
  );
}
