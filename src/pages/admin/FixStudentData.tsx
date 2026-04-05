import { useState } from 'react';
import { fixAllStudentIssues } from '../../utils/fixAllStudentIssues';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { FixProgressGantt } from '../../components/admin/tools/FixProgressGantt';

export default function FixStudentData() {
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<Array<{ message: string; type: string }>>([]);
    const [result, setResult] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState<string>('pending');

    const addLog = (message: string, type: string = 'info') => {
        setLogs(prev => [...prev, { message, type }]);
    };

    const handleRunFix = async () => {
        setIsRunning(true);
        setLogs([]);
        setResult(null);
        setCurrentStep('step1');

        // Override console.log to capture output
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args: any[]) => {
            originalLog(...args);
            const message = args.join(' ');
            let type = 'info';
            if (message.includes('✅') || message.includes('SUCCESS')) type = 'success';
            else if (message.includes('❌') || message.includes('ERROR')) type = 'error';
            else if (message.includes('⚠️') || message.includes('WARNING')) type = 'warning';
            addLog(message, type);

            // Update step based on log messages
            if (message.includes('STEP 1') || message.includes('Cleaning duplicate')) {
                setCurrentStep('step1');
            } else if (message.includes('STEP 2') || message.includes('Fixing missing data')) {
                setCurrentStep('step2');
            } else if (message.includes('duplicate')) {
                setCurrentStep('step2');
            } else if (message.includes('Fixed:') || message.includes('missing data')) {
                setCurrentStep('step3');
            } else if (message.includes('STEP 3') || message.includes('Creating missing auth')) {
                setCurrentStep('step4');
            } else if (message.includes('FINAL SUMMARY') || message.includes('completed successfully')) {
                setCurrentStep('step5');
            }
        };

        console.error = (...args: any[]) => {
            originalError(...args);
            addLog(args.join(' '), 'error');
        };

        try {
            const fixResult = await fixAllStudentIssues();
            setResult(fixResult);
            setCurrentStep('step5');
            console.log = originalLog;
            console.error = originalError;
        } catch (error: any) {
            addLog(`Fatal error: ${error.message}`, 'error');
            console.log = originalLog;
            console.error = originalError;
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🔧 Fix Student Data
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Comprehensive fix for all student database issues
                    </p>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-amber-900 mb-1">⚠️ Legacy Firebase Tool</h4>
                                <p className="text-sm text-amber-800">
                                    This tool creates Firebase Auth accounts. The app now uses <strong>Supabase Auth</strong>.
                                    Students created here will <strong>not</strong> be able to log in via Supabase.
                                    Use the Supabase migration scripts instead for new account creation.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">This tool will:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                            <li>Remove duplicate student entries (keep latest based on timestamp)</li>
                            <li>Fix missing data: certifications, internships, achievements, projects</li>
                            <li>Create Firebase Auth accounts for students who don't have them</li>
                            <li>Update all 32 students with complete profile information</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleRunFix}
                        disabled={isRunning}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-foreground py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Running fixes...
                            </>
                        ) : (
                            'Run Complete Fix'
                        )}
                    </button>

                    {/* Gantt Chart */}
                    {(isRunning || result) && (
                        <div className="mt-6 bg-white border-2 border-gray-200 rounded-lg p-6">
                            <FixProgressGantt currentStep={currentStep} />
                        </div>
                    )}

                    {logs.length > 0 && (
                        <div className="mt-6 bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                            {logs.map((log, index) => (
                                <div
                                    key={index}
                                    className={`font-mono text-sm mb-1 ${
                                        log.type === 'success' ? 'text-green-400' :
                                        log.type === 'error' ? 'text-red-400' :
                                        log.type === 'warning' ? 'text-yellow-400' :
                                        'text-blue-400'
                                    }`}
                                >
                                    {log.message}
                                </div>
                            ))}
                        </div>
                    )}

                    {result && (
                        <div className="mt-6 bg-green-50 border-2 border-green-500 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <h3 className="text-xl font-bold text-green-900">
                                    Fix Completed Successfully!
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                                    <div className="text-gray-600 text-xs mb-1">Unique Students</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.cleanResult.uniqueStudents}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                                    <div className="text-gray-600 text-xs mb-1">Duplicates Removed</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.cleanResult.duplicatesDeleted}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                                    <div className="text-gray-600 text-xs mb-1">Profiles Fixed</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.fixResult.fixed}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                                    <div className="text-gray-600 text-xs mb-1">Auth Created</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.authResult.created}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                                    <div className="text-gray-600 text-xs mb-1">Auth Existing</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.authResult.existing}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Important Notes:</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• This tool is safe to run multiple times</li>
                                    <li>• Default student password: <code className="bg-gray-200 px-1 rounded">nmims2026</code></li>
                                    <li>• Process takes 2-3 minutes due to rate limiting</li>
                                    <li>• Check admin dashboard after completion to verify</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
