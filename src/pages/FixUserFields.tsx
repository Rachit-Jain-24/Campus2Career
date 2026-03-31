import { useState } from 'react';
import { fixMissingUserFields } from '../utils/fixMissingUserFields';
import { CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function FixUserFields() {
    const { user, isLoading } = useAuth();
    const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
    const [result, setResult] = useState<{ fixed: number; skipped: number; errors: string[] } | null>(null);

    const handleRun = async () => {
        setStatus('running');
        try {
            const res = await fixMissingUserFields();
            setResult(res);
            setStatus('done');
        } catch (err: any) {
            setResult({ fixed: 0, skipped: 0, errors: [err.message] });
            setStatus('error');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-sm w-full text-center space-y-4">
                    <Lock className="w-10 h-10 text-slate-300 mx-auto" />
                    <h2 className="text-lg font-black text-slate-800">Login Required</h2>
                    <p className="text-sm text-slate-500">Log in first, then return to this page.</p>
                    <a href="/login" className="block w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm">
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full space-y-6">
                <div>
                    <h1 className="text-xl font-black text-slate-800">Fix Missing User Fields</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Adds <code className="bg-slate-100 px-1 rounded text-xs">role</code>,{' '}
                        <code className="bg-slate-100 px-1 rounded text-xs">careerDiscoveryCompleted</code>,{' '}
                        <code className="bg-slate-100 px-1 rounded text-xs">profileCompleted</code>, and{' '}
                        <code className="bg-slate-100 px-1 rounded text-xs">assessmentCompleted</code>{' '}
                        to all student accounts that are missing them.
                    </p>
                </div>

                {status === 'idle' && (
                    <button onClick={handleRun}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                        Run Fix
                    </button>
                )}

                {status === 'running' && (
                    <div className="flex items-center gap-3 text-slate-600">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm font-medium">Patching all student documents…</span>
                    </div>
                )}

                {(status === 'done' || status === 'error') && result && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                <p className="text-2xl font-black text-green-700">{result.fixed}</p>
                                <p className="text-xs text-green-600 font-bold uppercase tracking-widest mt-1">Fixed</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                                <p className="text-2xl font-black text-slate-600">{result.skipped}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Skipped</p>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                                <p className="text-xs font-bold text-red-700 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> Errors
                                </p>
                                {result.errors.map((e, i) => (
                                    <p key={i} className="text-[10px] text-red-600 font-mono">{e}</p>
                                ))}
                            </div>
                        )}

                        {result.errors.length === 0 && (
                            <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                                <CheckCircle className="w-4 h-4" />
                                All users patched. You can close this page.
                            </div>
                        )}

                        <button onClick={handleRun}
                            className="w-full py-2.5 border border-slate-200 text-slate-500 text-sm font-bold rounded-xl hover:text-slate-800 transition-colors">
                            Run Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
