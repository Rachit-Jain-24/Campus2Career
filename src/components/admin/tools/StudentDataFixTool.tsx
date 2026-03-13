import React, { useState } from 'react';
import { UserPlus, RefreshCw, CheckCircle2, AlertTriangle, Loader2, Users } from 'lucide-react';
import { completeStudentSetup } from '../../../utils/completeStudentSetup';
import { updateRemaining20Students } from '../../../utils/updateRemaining20Students';

export const StudentDataFixTool: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [updateResult, setUpdateResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFix = async () => {
        if (!confirm('This will:\n1. Create Firebase Auth accounts for students without them\n2. Update all profiles with complete data\n\nContinue?')) {
            return;
        }
        
        setIsRunning(true);
        setError(null);
        setResult(null);
        
        try {
            const res = await completeStudentSetup();
            setResult(res);
        } catch (err: any) {
            setError(err.message || 'Failed to complete setup');
        } finally {
            setIsRunning(false);
        }
    };

    const handleUpdate20Students = async () => {
        if (!confirm('This will update the 20 students (Sr. No. 11-32) with:\n- Proper techSkills\n- Projects\n- LeetCode stats\n\nContinue?')) {
            return;
        }
        
        setIsUpdating(true);
        setError(null);
        setUpdateResult(null);
        
        try {
            const res = await updateRemaining20Students();
            setUpdateResult(res);
        } catch (err: any) {
            setError(err.message || 'Failed to update students');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <UserPlus className="h-6 w-6 text-blue-500" />
                    Student Data Fix Tool
                </h2>
                <p className="text-muted-foreground mt-1">
                    Create auth accounts and fix missing profile data
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={handleUpdate20Students}
                    disabled={isUpdating || isRunning}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isUpdating ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Updating 20 Students...
                        </>
                    ) : (
                        <>
                            <Users className="h-5 w-5" />
                            Update 20 Students (Sr. 11-32)
                        </>
                    )}
                </button>

                <button
                    onClick={handleFix}
                    disabled={isRunning || isUpdating}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Processing All...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-5 w-5" />
                            Fix All Student Data
                        </>
                    )}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-900">Error</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Update 20 Students Results */}
            {updateResult && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-purple-600" />
                        <h3 className="text-lg font-bold text-purple-900">20 Students Updated!</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Updated:</span>
                                <span className="font-bold text-2xl text-green-600">{updateResult.updated}</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Not Found:</span>
                                <span className="font-bold text-2xl text-yellow-600">{updateResult.notFound}</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Failed:</span>
                                <span className="font-bold text-2xl text-red-600">{updateResult.failed.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-800">
                            ✅ Students now have proper techSkills based on their skill ratings
                            <br />
                            ✅ Projects generated based on their project count
                            <br />
                            ✅ LeetCode stats properly formatted
                        </p>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <h3 className="text-lg font-bold text-green-900">Setup Complete!</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Auth Accounts */}
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <h4 className="font-bold text-sm mb-3 text-gray-700">🔐 Auth Accounts</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-bold text-green-600">{result.authCreated}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Already exists:</span>
                                    <span className="font-bold text-blue-600">{result.authExists}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Failed:</span>
                                    <span className="font-bold text-red-600">{result.authFailed.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Profiles */}
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <h4 className="font-bold text-sm mb-3 text-gray-700">📝 Profiles</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Updated:</span>
                                    <span className="font-bold text-green-600">{result.profilesUpdated}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Failed:</span>
                                    <span className="font-bold text-red-600">{result.profilesFailed.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Failed Items */}
                    {(result.authFailed.length > 0 || result.profilesFailed.length > 0) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800 font-semibold mb-2">
                                Some operations failed. Check console for details.
                            </p>
                            {result.authFailed.length > 0 && (
                                <div className="text-xs text-yellow-700">
                                    Auth failed: {result.authFailed.join(', ')}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            ✅ All student profiles have been updated with complete data
                            <br />
                            ✅ Auth accounts created for students who can now login
                            <br />
                            ✅ Skills, internships, achievements, and projects are now visible
                        </p>
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-sm mb-2">What these tools do:</h4>
                
                <div className="space-y-3">
                    <div>
                        <p className="font-semibold text-purple-600 text-sm mb-1">🟣 Update 20 Students (Recommended First)</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Updates students Sr. No. 11-32 (Ruthvik, Snehil, Abhinav, etc.)</li>
                            <li>Adds proper techSkills based on their skill ratings</li>
                            <li>Generates projects based on their project count</li>
                            <li>Adds LeetCode statistics</li>
                        </ul>
                    </div>
                    
                    <div>
                        <p className="font-semibold text-blue-600 text-sm mb-1">🔵 Fix All Student Data</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Creates Firebase Auth accounts for students (email + password)</li>
                            <li>Ensures all profiles have complete data structure</li>
                            <li>Formats certifications, internships, achievements properly</li>
                            <li>Makes all data visible in batch analytics</li>
                        </ul>
                    </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                    Default password for all accounts: <code className="bg-gray-200 px-2 py-1 rounded">nmims2026</code>
                </p>
            </div>
        </div>
    );
};
