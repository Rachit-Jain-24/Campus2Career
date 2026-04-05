import { useState } from 'react';
import { Users, CheckCircle2, XCircle, Loader2, AlertCircle, Database, Trash2 } from 'lucide-react';
import { seedBatchAccounts, deleteBatchAccounts } from '../utils/seedBatchAccounts';
import { batchStudentsData } from '../data/batchStudentsData';

export default function SeedStudents() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [deleteResults, setDeleteResults] = useState<any>(null);

    const handleSeedBatch = async () => {
        if (!confirm(`This will create ${batchStudentsData.length} student accounts. Continue?`)) {
            return;
        }

        setIsSeeding(true);
        setResults(null);

        try {
            const seedResults = await seedBatchAccounts();
            setResults(seedResults);
        } catch (error: any) {
            console.error('Seeding error:', error);
            setResults({
                success: [],
                failed: [{ email: 'System', error: error.message }],
                total: batchStudentsData.length
            });
        } finally {
            setIsSeeding(false);
        }
    };

    const handleDeleteBatch = async () => {
        if (!confirm(`⚠️ WARNING: This will delete ${batchStudentsData.length} student Firestore profiles!\n\nNote: Firebase Auth accounts must be deleted manually from Firebase Console.\n\nContinue?`)) {
            return;
        }

        setIsDeleting(true);
        setDeleteResults(null);

        try {
            const delResults = await deleteBatchAccounts();
            setDeleteResults(delResults);
        } catch (error: any) {
            console.error('Deletion error:', error);
            setDeleteResults({
                success: [],
                failed: [{ sapId: 'System', error: error.message }],
                total: batchStudentsData.length
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Database className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Seed Batch Students</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Create Firebase accounts for all 32 students from NMIMS CSE (DS) 2022-2026 batch
                    </p>
                </div>

                {/* Batch Info */}
                <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl border border-primary/20 p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Batch Information
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-xl bg-white border">
                            <p className="text-3xl font-black text-primary">{batchStudentsData.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">Total Students</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white border">
                            <p className="text-3xl font-black text-blue-600">4th</p>
                            <p className="text-xs text-muted-foreground mt-1">Year</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white border">
                            <p className="text-3xl font-black text-green-600">2022-26</p>
                            <p className="text-xs text-muted-foreground mt-1">Batch</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white border">
                            <p className="text-3xl font-black text-purple-600">CSE-DS</p>
                            <p className="text-xs text-muted-foreground mt-1">Program</p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-yellow-900">Important Information</p>
                                <ul className="text-xs text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                                    <li>Default password for all accounts: <code className="bg-yellow-100 px-2 py-0.5 rounded font-mono">nmims2026</code></li>
                                    <li>Students can login with their NMIMS email</li>
                                    <li>All profiles will be pre-populated with data from CSV</li>
                                    <li>This process may take 2-3 minutes to complete</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-bold mb-4">Seed Batch Accounts</h2>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This will create Firebase Authentication accounts and Firestore profiles for all 32 students.
                            Each student will get:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                            <li>Firebase Auth account with email login</li>
                            <li>Complete profile with skills, projects, certifications</li>
                            <li>LeetCode stats integration</li>
                            <li>Internship and publication records</li>
                            <li>Achievements and hackathon participation</li>
                        </ul>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleSeedBatch}
                                disabled={isSeeding || isDeleting}
                                className="bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSeeding ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating Accounts...
                                    </>
                                ) : (
                                    <>
                                        <Database className="h-5 w-5" />
                                        Seed All {batchStudentsData.length} Accounts
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleDeleteBatch}
                                disabled={isSeeding || isDeleting}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Deleting Profiles...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-5 w-5" />
                                        Delete All Profiles
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                            <p className="text-xs text-amber-800">
                                <strong>Note:</strong> Delete button only removes Firestore profiles. Firebase Auth accounts must be deleted manually from Firebase Console.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Results Card */}
                {results && (
                    <div className={`rounded-2xl shadow-lg p-6 ${
                        results.failed.length === 0 
                            ? 'bg-green-50 border-2 border-green-200' 
                            : 'bg-orange-50 border-2 border-orange-200'
                    }`}>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            {results.failed.length === 0 ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="text-green-900">Seeding Complete!</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                    <span className="text-orange-900">Seeding Completed with Errors</span>
                                </>
                            )}
                        </h2>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 rounded-xl bg-white border">
                                <p className="text-2xl font-black text-slate-900">{results.total}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-green-50 border border-green-200">
                                <p className="text-2xl font-black text-green-600">{results.success.length}</p>
                                <p className="text-xs text-green-700 mt-1">Success</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-red-50 border border-red-200">
                                <p className="text-2xl font-black text-red-600">{results.failed.length}</p>
                                <p className="text-xs text-red-700 mt-1">Failed</p>
                            </div>
                        </div>

                        {results.success.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Successfully Created ({results.success.length})
                                </h4>
                                <div className="max-h-40 overflow-y-auto bg-white rounded-lg border p-3">
                                    <div className="space-y-1">
                                        {results.success.map((email: string, index: number) => (
                                            <p key={index} className="text-xs text-green-700">✓ {email}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {results.failed.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Failed ({results.failed.length})
                                </h4>
                                <div className="max-h-40 overflow-y-auto bg-white rounded-lg border p-3">
                                    <div className="space-y-2">
                                        {results.failed.map((item: any, index: number) => (
                                            <div key={index} className="text-xs">
                                                <p className="text-red-700 font-medium">✗ {item.email}</p>
                                                <p className="text-red-600 ml-4">{item.error}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                            <p className="text-sm font-bold text-blue-900 mb-2">Next Steps:</p>
                            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                                <li>Students can now login at <a href="/login" className="underline">/login</a></li>
                                <li>Default password: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">nmims2026</code></li>
                                <li>Admin can view students at <a href="/admin/students" className="underline">/admin/students</a></li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Delete Results Card */}
                {deleteResults && (
                    <div className={`rounded-2xl shadow-lg p-6 ${
                        deleteResults.failed.length === 0 
                            ? 'bg-green-50 border-2 border-green-200' 
                            : 'bg-orange-50 border-2 border-orange-200'
                    }`}>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            {deleteResults.failed.length === 0 ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="text-green-900">Deletion Complete!</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                    <span className="text-orange-900">Deletion Completed with Errors</span>
                                </>
                            )}
                        </h2>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 rounded-xl bg-white border">
                                <p className="text-2xl font-black text-slate-900">{deleteResults.total}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-green-50 border border-green-200">
                                <p className="text-2xl font-black text-green-600">{deleteResults.success.length}</p>
                                <p className="text-xs text-green-700 mt-1">Deleted</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-red-50 border border-red-200">
                                <p className="text-2xl font-black text-red-600">{deleteResults.failed.length}</p>
                                <p className="text-xs text-red-700 mt-1">Failed</p>
                            </div>
                        </div>

                        {deleteResults.success.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Successfully Deleted ({deleteResults.success.length})
                                </h4>
                                <div className="max-h-40 overflow-y-auto bg-white rounded-lg border p-3">
                                    <div className="space-y-1">
                                        {deleteResults.success.map((sapId: string, index: number) => (
                                            <p key={index} className="text-xs text-green-700">✓ {sapId}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {deleteResults.failed.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Failed ({deleteResults.failed.length})
                                </h4>
                                <div className="max-h-40 overflow-y-auto bg-white rounded-lg border p-3">
                                    <div className="space-y-2">
                                        {deleteResults.failed.map((item: any, index: number) => (
                                            <div key={index} className="text-xs">
                                                <p className="text-red-700 font-medium">✗ {item.sapId}</p>
                                                <p className="text-red-600 ml-4">{item.error}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                            <p className="text-sm font-bold text-amber-900 mb-2">⚠️ Important:</p>
                            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                                <li>Firestore profiles have been deleted</li>
                                <li>Firebase Auth accounts still exist and must be deleted manually</li>
                                <li>Go to Firebase Console → Authentication → Users to delete auth accounts</li>
                                <li>You can now re-seed with updated data</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Student Preview */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-bold mb-4">Student Data Preview (First 5)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Sr.No</th>
                                    <th className="text-left p-2">Name</th>
                                    <th className="text-left p-2">Email</th>
                                    <th className="text-left p-2">CGPA</th>
                                    <th className="text-left p-2">LeetCode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batchStudentsData.slice(0, 5).map((student) => (
                                    <tr key={student.srNo} className="border-b hover:bg-secondary/50">
                                        <td className="p-2">{student.srNo}</td>
                                        <td className="p-2 font-medium">{student.fullName}</td>
                                        <td className="p-2 text-xs text-muted-foreground">{student.email}</td>
                                        <td className="p-2">{student.cgpa}</td>
                                        <td className="p-2">{student.leetcodeSolved}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            ... and {batchStudentsData.length - 5} more students
                        </p>
                    </div>
                </div>

                {/* Links */}
                <div className="text-center space-y-2">
                    <a href="/login/admin" className="text-sm text-primary hover:underline block">
                        Go to Admin Login
                    </a>
                    <a href="/login" className="text-sm text-primary hover:underline block">
                        Go to Student Login
                    </a>
                </div>
            </div>
        </div>
    );
}
