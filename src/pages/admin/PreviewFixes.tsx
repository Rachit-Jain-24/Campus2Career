import { useState } from 'react';
import { previewStudentFixes } from '../../utils/previewStudentFixes';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

export default function PreviewFixes() {
    const navigate = useNavigate();
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<Array<{ message: string; type: string }>>([]);
    const [result, setResult] = useState<any>(null);

    const addLog = (message: string, type: string = 'info') => {
        setLogs(prev => [...prev, { message, type }]);
    };

    const handlePreview = async () => {
        setIsRunning(true);
        setLogs([]);
        setResult(null);

        // Override console.log to capture output
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args: any[]) => {
            originalLog(...args);
            const message = args.join(' ');
            let type = 'info';
            if (message.includes('✅') || message.includes('No duplicates') || message.includes('complete data')) type = 'success';
            else if (message.includes('❌') || message.includes('ERROR')) type = 'error';
            else if (message.includes('⚠️') || message.includes('WARNING') || message.includes('Missing')) type = 'warning';
            addLog(message, type);
        };

        console.error = (...args: any[]) => {
            originalError(...args);
            addLog(args.join(' '), 'error');
        };

        try {
            const previewResult = await previewStudentFixes();
            setResult(previewResult);
            console.log = originalLog;
            console.error = originalError;
        } catch (error: any) {
            addLog(`Error: ${error.message}`, 'error');
            console.log = originalLog;
            console.error = originalError;
        } finally {
            setIsRunning(false);
        }
    };

    const needsFixes = result && (result.duplicatesToRemove > 0 || result.studentsWithMissingData > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🔍 Preview Student Fixes
                    </h1>
                    <p className="text-gray-600 mb-6">
                        See what will be fixed before making any changes
                    </p>

                    <button
                        onClick={handlePreview}
                        disabled={isRunning}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-foreground py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading preview...
                            </>
                        ) : (
                            result ? '🔄 Refresh Preview' : 'Preview Changes'
                        )}
                    </button>

                    {logs.length > 0 && (
                        <div className="mt-6 bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                            {logs.map((log, index) => (
                                <div
                                    key={index}
                                    className={`font-mono text-sm mb-1 whitespace-pre-wrap ${
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
                        <div className="mt-6 bg-blue-50 border-2 border-blue-500 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-blue-900 mb-4">
                                📊 Preview Summary
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                                    <div className="text-gray-600 text-xs mb-1">Current Entries</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.currentEntries}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                                    <div className="text-gray-600 text-xs mb-1">Unique Students</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.uniqueStudents}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                                    <div className="text-gray-600 text-xs mb-1">Duplicates to Remove</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.duplicatesToRemove}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                                    <div className="text-gray-600 text-xs mb-1">Missing Data</div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.studentsWithMissingData}
                                    </div>
                                </div>
                            </div>

                            {needsFixes ? (
                                <div className="pt-6 border-t-2 border-blue-200">
                                    <button
                                        onClick={() => navigate('/admin/fix-student-data')}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-foreground py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Apply These Fixes
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                    <p className="text-center text-gray-600 text-sm mt-2">
                                        Ready to apply fixes
                                    </p>
                                </div>
                            ) : (
                                <div className="pt-6 border-t-2 border-blue-200">
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                        <CheckCircle className="w-6 h-6" />
                                        <span className="font-semibold">
                                            No fixes needed! Database is clean.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">About Preview Mode:</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Shows what will be changed WITHOUT making changes</li>
                                    <li>• Lists all duplicates that will be removed</li>
                                    <li>• Shows missing data that will be added</li>
                                    <li>• Safe to run anytime - read-only operation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
