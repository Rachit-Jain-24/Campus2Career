import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Type, Code2, AlertCircle } from 'lucide-react';
import { TranscriptPanel } from './TranscriptPanel';
import { CodeSandbox } from './CodeSandbox';
import type { InterviewMode } from '../../types/interview';

interface Props {
  mode: InterviewMode;
  codeLanguage: string;
  onSubmit: (answer: string, code?: string, duration?: number) => void;
  onEmpty: () => void;
}

type Tab = 'voice' | 'text' | 'code';

export function AnswerPanel({ mode, codeLanguage, onSubmit, onEmpty }: Props) {
  const defaultTab: Tab = mode === 'dsa' ? 'code' : mode === 'system_design' ? 'text' : 'voice';
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [transcript, setTranscript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [micError, setMicError] = useState('');
  const [startTime] = useState(Date.now());

  const transcriptRef = useRef('');
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceSupported(false);
      if (activeTab === 'voice') setActiveTab('text');
    }
  }, []);

  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setVoiceSupported(false); return; }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      isRecordingRef.current = true;
      setIsRecording(true);
      setMicError('');

      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (e: any) => {
        let full = '';
        for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + ' ';
        const trimmed = full.trim();
        transcriptRef.current = trimmed;
        setTranscript(trimmed);
        setWordCount(trimmed.split(/\s+/).filter(Boolean).length);
      };

      rec.onend = () => { if (isRecordingRef.current) { try { rec.start(); } catch (_) {} } };
      rec.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          setMicError('Microphone access denied. Enable it in browser settings or use text mode.');
          setVoiceSupported(false);
          setActiveTab('text');
        }
      };

      recognitionRef.current = rec;
      rec.start();
    }).catch(() => {
      setMicError('Microphone access denied. Enable it in browser settings or use text mode.');
      setVoiceSupported(false);
      setActiveTab('text');
    });
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    try { recognitionRef.current?.stop(); } catch (_) {}
    recognitionRef.current = null;
  }, []);

  useEffect(() => {
    return () => { isRecordingRef.current = false; try { recognitionRef.current?.stop(); } catch (_) {} };
  }, []);

  const handleSubmit = () => {
    const answer = activeTab === 'voice' ? transcriptRef.current
      : activeTab === 'text' ? textAnswer
      : transcript || textAnswer;
    const code = activeTab === 'code' ? codeAnswer : undefined;

    if (!answer?.trim() && !code?.trim()) { onEmpty(); return; }
    stopRecording();
    const duration = (Date.now() - startTime) / 1000;
    onSubmit(answer || '', code, duration);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { id: 'voice', label: 'Voice', icon: <Mic className="w-3.5 h-3.5" />, show: voiceSupported },
    { id: 'text', label: 'Text', icon: <Type className="w-3.5 h-3.5" />, show: mode === 'system_design' || !voiceSupported },
    { id: 'code', label: 'Code', icon: <Code2 className="w-3.5 h-3.5" />, show: mode === 'dsa' },
  ].filter(t => t.show);

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      {tabs.length > 1 && (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id ? 'bg-white text-slate-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Mic error banner */}
      {micError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {micError}
        </div>
      )}

      {/* Voice tab */}
      {activeTab === 'voice' && (
        <div className="space-y-3">
          <TranscriptPanel transcript={transcript} wordCount={wordCount} isRecording={isRecording} />
          {wordCount > 500 && (
            <p className="text-[10px] text-amber-600">Great detail — AI evaluates up to 500 words for best accuracy.</p>
          )}
          <div className="flex gap-3">
            {!isRecording ? (
              <button onClick={startRecording}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors">
                <Mic className="w-4 h-4" /> Start Recording
              </button>
            ) : (
              <button onClick={stopRecording}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors animate-pulse">
                <MicOff className="w-4 h-4" /> Stop Recording
              </button>
            )}
          </div>
        </div>
      )}

      {/* Text tab */}
      {activeTab === 'text' && (
        <div className="space-y-2">
          <textarea
            value={textAnswer}
            onChange={e => setTextAnswer(e.target.value)}
            placeholder="Type your answer here… Use markdown for structure."
            className="w-full h-48 bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-primary transition-colors"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{textAnswer.split(/\s+/).filter(Boolean).length} words</span>
            {textAnswer.length > 2000 && <span className="text-amber-600">AI evaluates up to ~500 words</span>}
          </div>
        </div>
      )}

      {/* Code tab */}
      {activeTab === 'code' && (
        <div className="space-y-3">
          <CodeSandbox language={codeLanguage} onChange={setCodeAnswer} />
          <TranscriptPanel transcript={transcript} wordCount={wordCount} isRecording={isRecording} />
          {!isRecording ? (
            <button onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-500 rounded-lg hover:text-slate-800 transition-colors">
              <Mic className="w-3.5 h-3.5" /> Also record voice explanation (optional)
            </button>
          ) : (
            <button onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              <MicOff className="w-3.5 h-3.5" /> Stop voice recording
            </button>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full py-3.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors"
      >
        Submit Answer →
      </button>
    </div>
  );
}
