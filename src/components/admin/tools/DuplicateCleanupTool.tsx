import React, { useState } from 'react';
import { Trash2, Eye, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { cleanDuplicateBatchAnalytics, previewDuplicates } from '../../../utils/cleanDuplicateBatchAnalytics';

export const DuplicateCleanupTool: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewResult, setPreviewResult] = useState<any>(null);
    const [cleanupResult, setCleanupResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePreview = async () => {
        setIsPreviewing(true);
        setError(null);
        setCleanupResult(null);
        
        try {
            const result = await previewDuplicates();
            setPreviewResult(result);
        } catch (err: any) {
            setError(err.message || 'Failed to preview duplicates');
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleCleanup = async () => {
        if (!confirm('Are you sure you want to delete duplicate entries? This action cannot be undone.')) {
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await cleanDuplicateBatchAnalytics();
            setCleanupResult(result);
            setPreviewResult(null);
        } catch (err: any) {
            setError(err.message || 'Failed to clean duplicates');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Trash2 className="h-6 w-6 text-red-500" />
                    Duplicate Cleanup Tool
                </h2>
                <p className="text-muted-foreground mt-1">
                    Remove duplicate student entries and keep only the latest records
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handlePreview}
                    disabled={isPreviewing || isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-foreground rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isPreviewing ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <Eye className="h-4 w-4" />
                            Preview Duplicates
                        </>
                    )}
                </button>

                <button
                    onClick={handleCleanup}
                    disabled={isLoading || isPreviewing}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-foreground rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cleaning...
                        </>
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4" />
                            Clean Duplicates
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

            {/* Preview Results */}
            {previewResult && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Eye className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-blue-900">Preview Results</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-muted-foreground mb-1">Total Entries</p>
                            <p className="text-3xl font-black text-blue-600">{previewResult.totalEntries}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-muted-foreground mb-1">Unique Students</p>
                            <p className="text-3xl font-black text-green-600">{previewResult.uniqueStudents}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                            <p className="text-sm text-muted-foreground mb-1">Duplicates Found</p>
                            <p className="text-3xl font-black text-red-600">{previewResult.duplicatesToRemove}</p>
                        </div>
                    </div>

                    {previewResult.duplicatesToRemove > 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                                <strong>Action Required:</strong> Click "Clean Duplicates" to remove {previewResult.duplicatesToRemove} duplicate entries.
                                The latest entry for each student will be kept.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <p className="text-sm text-green-800 font-semibold">
                                    No duplicates found! Database is clean.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Cleanup Results */}
            {cleanupResult && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <h3 className="text-lg font-bold text-green-900">Cleanup Complete!</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-muted-foreground mb-1">Before</p>
                            <p className="text-2xl font-black text-gray-700">{cleanupResult.totalBefore}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-muted-foreground mb-1">After</p>
                            <p className="text-2xl font-black text-green-600">{cleanupResult.uniqueStudents}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                            <p className="text-sm text-muted-foreground mb-1">Deleted</p>
                            <p className="text-2xl font-black text-red-600">{cleanupResult.duplicatesDeleted}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <p className="text-lg font-black text-blue-600">
                                {cleanupResult.success ? '✅ Success' : '⚠️ Partial'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            Successfully removed {cleanupResult.duplicatesDeleted} duplicate entries.
                            Your database now has {cleanupResult.uniqueStudents} unique student records.
                        </p>
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-sm mb-2">How it works:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Groups students by email address (unique identifier)</li>
                    <li>Identifies duplicate entries for the same student</li>
                    <li>Keeps the entry with the latest creation timestamp</li>
                    <li>Deletes all older duplicate entries</li>
                </ul>
            </div>
        </div>
    );
};
