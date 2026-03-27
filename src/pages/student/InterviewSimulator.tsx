import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { InterviewLobby } from '../../components/interview/InterviewLobby';
import { InterviewRoom } from '../../components/interview/InterviewRoom';
import { SessionReport } from '../../components/interview/SessionReport';
import { SessionHistory } from '../../components/interview/SessionHistory';
import type { SessionConfig, InterviewSession } from '../../types/interview';
import type { AppUser } from '../../types/auth';
import { Clock, History, Plus } from 'lucide-react';

type View = 'lobby' | 'session' | 'report' | 'history';

export default function InterviewSimulator() {
  const { user, updateUser } = useAuth();
  const u = user as any;

  const [view, setView] = useState<View>('lobby');
  const [activeConfig, setActiveConfig] = useState<SessionConfig | null>(null);
  const [completedSession, setCompletedSession] = useState<InterviewSession | null>(null);

  // Year 1 gate
  if (u?.currentYear === 1) {
    return (
      <DashboardLayout role="student" userName={u?.name} userYear="Year 1" userProgram={u?.branch}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-md">
            <Clock className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Unlocks in Year 2</h2>
            <p className="text-sm text-amber-700">
              The AI Interview Simulator is available from Year 2 onwards. Build your DSA and project foundation first.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const pastSessions: InterviewSession[] = u?.interviewSessions || [];

  const handleStart = (config: SessionConfig) => {
    setActiveConfig(config);
    setView('session');
  };

  const handleComplete = async (session: InterviewSession) => {
    setCompletedSession(session);
    setView('report');
    if (user) {
      try {
        const existing: InterviewSession[] = u?.interviewSessions || [];
        // Strip undefined values — Firestore rejects them
        const clean = JSON.parse(JSON.stringify(session));
        await updateUser({ ...user, interviewSessions: [...existing, clean] } as AppUser);
      } catch (err) {
        console.error('Failed to save session:', err);
        // Don't block the report view if save fails
      }
    }
  };

  const handleAbort = () => {
    setActiveConfig(null);
    setView('lobby');
  };

  const handleRestart = () => {
    setCompletedSession(null);
    setActiveConfig(null);
    setView('lobby');
  };

  // Full-screen session view (no sidebar)
  if (view === 'session' && activeConfig) {
    return (
      <InterviewRoom
        config={activeConfig}
        onComplete={handleComplete}
        onAbort={handleAbort}
      />
    );
  }

  return (
    <DashboardLayout role="student" userName={u?.name} userYear={`Year ${u?.currentYear}`} userProgram={u?.branch}>
      <div>

        {/* Tab bar — only show on lobby/history */}
        {(view === 'lobby' || view === 'history') && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-sm p-1 rounded-xl w-fit mb-6">
            <button
              onClick={() => setView('lobby')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'lobby' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Plus className="w-3.5 h-3.5" /> New Interview
            </button>
            <button
              onClick={() => setView('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'history' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <History className="w-3.5 h-3.5" /> History
              {pastSessions.length > 0 && (
                <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {pastSessions.length}
                </span>
              )}
            </button>
          </div>
        )}

        {view === 'lobby' && (
          <InterviewLobby
            defaultRole={u?.careerTrack || 'Software Engineer'}
            defaultResumeName={u?.resumeName || ''}
            defaultResumeText={u?.resumeDescription || ''}
            onStart={handleStart}
          />
        )}

        {view === 'history' && (
          <SessionHistory sessions={pastSessions} />
        )}

        {view === 'report' && completedSession && (
          <SessionReport session={completedSession} onRestart={handleRestart} />
        )}
      </div>
    </DashboardLayout>
  );
}
