import { useEffect, useRef } from 'react';

interface Props {
  transcript: string;
  wordCount: number;
  isRecording: boolean;
}

export function TranscriptPanel({ transcript, wordCount, isRecording }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const minutes = Math.floor(wordCount / 130);
  const seconds = Math.round((wordCount / 130 - minutes) * 60);
  const timeEst = minutes > 0 ? `~${minutes}m ${seconds}s` : `~${seconds}s`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {isRecording && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
            {isRecording ? 'Live Transcript' : 'Transcript'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
          <span>{wordCount} words</span>
          <span>{timeEst} spoken</span>
        </div>
      </div>
      <div className="p-4 min-h-[100px] max-h-[180px] overflow-y-auto">
        {transcript ? (
          <p className="text-sm text-slate-800 leading-relaxed">
            {transcript}
            {isRecording && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic">
            {isRecording ? 'Start speaking — your words will appear here…' : 'No transcript yet.'}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
