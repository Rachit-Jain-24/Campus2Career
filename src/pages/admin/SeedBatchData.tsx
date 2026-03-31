import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, CheckCircle2, XCircle, Loader2, AlertCircle, Database } from 'lucide-react';
import { seedBatchAccounts } from '../../utils/seedBatchAccounts';
import { batchStudentsData } from '../../data/batchStudentsData';

export default function SeedBatchData() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [progress, setProgress] = useState(0);

    const handleSeedBatch = async () => {
        if (!confirm(`This will create ${batchStudentsData.length} student accounts. Continue?`)) {
            return;
        }

        setIsSeeding(true);
        setProgress(0);
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

    return (
        <DashboardLayout role="admin" userName="Admin">
            <div className="space-y-6 animate-fade-in-up">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Database className="h-8 w-8 text-primary" />
                        Seed Batch Data
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Create Firebase accounts for all 32 students from NMIMS CSE (DS) 2022-2026 batch
                    </p>
                </div>

                {/* Batch Info Card */}
                <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Batch Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                        <li>Students can login with their NMIMS email and change password</li>
                                        <li>All profiles will be pre-populated with data from CSV</li>
                                        <li>This process may take 2-3 minutes to complete</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Seed Batch Accounts</CardTitle>
                    </CardHeader>
                    <CardContent>
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

                            <Button
                                onClick={handleSeedBatch}
                                disabled={isSeeding}
                                className="w-full flex items-center justify-center gap-2"
                                size="lg"
                            >
                                {isSeeding ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating Accounts... ({progress}/{batchStudentsData.length})
                                    </>
                                ) : (
                                    <>
                                        <Database className="h-5 w-5" />
                                        Seed All {batchStudentsData.length} Batch Accounts
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Card */}
                {results && (
                    <Card className={results.failed.length === 0 ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
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
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                    <li>Students can now login with their NMIMS email</li>
                                    <li>Default password: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">nmims2026</code></li>
                                    <li>Check Admin Dashboard for batch analytics</li>
                                    <li>View individual student profiles in Students section</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Student Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Student Data Preview (First 5)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Sr.No</th>
                                        <th className="text-left p-2">Name</th>
                                        <th className="text-left p-2">Email</th>
                                        <th className="text-left p-2">CGPA</th>
                                        <th className="text-left p-2">LeetCode</th>
                                        <th className="text-left p-2">Projects</th>
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
                                            <td className="p-2">{student.githubProjects}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                ... and {batchStudentsData.length - 5} more students
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
