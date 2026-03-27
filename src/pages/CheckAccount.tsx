import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function CheckAccount() {
    const [email, setEmail] = useState('');
    const [sapId, setSapId] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsChecking(true);
        setResult(null);

        try {
            // Search students collection first, then admins
            let found = false;

            for (const collectionName of ['students', 'admins']) {
                const ref = collection(db, collectionName);
                let q;
                if (email) {
                    q = query(ref, where('email', '==', email));
                } else if (sapId) {
                    q = query(ref, where('sapId', '==', sapId));
                } else {
                    setResult({ error: 'Please enter email or SAP ID' });
                    setIsChecking(false);
                    return;
                }

                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
                    setResult({
                        found: true,
                        data: userData,
                        docId: querySnapshot.docs[0].id,
                        collection: collectionName
                    });
                    found = true;
                    break;
                }
            }

            if (!found) {
                setResult({
                    found: false,
                    message: 'Account not found in Firestore',
                    searchedFor: email || sapId
                });
            }
        } catch (error: any) {
            setResult({ error: error.message });
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Search className="h-6 w-6 text-primary" />
                        Check Student Account
                    </h1>

                    <form onSubmit={handleCheck} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setSapId('');
                                }}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="vaishnavi.vadla045@nmims.edu.in"
                                disabled={isChecking || !!sapId}
                            />
                        </div>

                        <div className="text-center text-sm text-muted-foreground">OR</div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                SAP ID
                            </label>
                            <input
                                type="text"
                                value={sapId}
                                onChange={(e) => {
                                    setSapId(e.target.value);
                                    setEmail('');
                                }}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="BATCH045"
                                disabled={isChecking || !!email}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isChecking || (!email && !sapId)}
                            className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isChecking ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Search className="h-5 w-5" />
                                    Check Account
                                </>
                            )}
                        </button>
                    </form>

                    {/* Results */}
                    {result && (
                        <div className="mt-6">
                            {result.error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-red-800">
                                        <XCircle className="h-5 w-5" />
                                        <p className="font-semibold">Error</p>
                                    </div>
                                    <p className="text-sm text-red-700 mt-2">{result.error}</p>
                                </div>
                            )}

                            {result.found === false && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-orange-800">
                                        <XCircle className="h-5 w-5" />
                                        <p className="font-semibold">Account Not Found</p>
                                    </div>
                                    <p className="text-sm text-orange-700 mt-2">
                                        No account found for: <strong>{result.searchedFor}</strong>
                                    </p>
                                    <p className="text-sm text-orange-700 mt-2">
                                        This account needs to be created. Go to <a href="/seed-students" className="underline">/seed-students</a> to create it.
                                    </p>
                                </div>
                            )}

                            {result.found === true && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-green-800 mb-4">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <p className="font-semibold">Account Found!</p>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-muted-foreground">Name</p>
                                                <p className="font-semibold">{result.data.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Email</p>
                                                <p className="font-semibold">{result.data.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">SAP ID</p>
                                                <p className="font-semibold">{result.data.sapId || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Role</p>
                                                <p className="font-semibold capitalize">{result.data.role}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">CGPA</p>
                                                <p className="font-semibold">{result.data.cgpa || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Document ID</p>
                                                <p className="font-semibold text-xs">{result.docId}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-xs text-blue-800">
                                            <strong>Login Credentials:</strong><br/>
                                            SAP ID: <code className="bg-blue-100 px-2 py-0.5 rounded">{result.data.sapId}</code><br/>
                                            Password: <code className="bg-blue-100 px-2 py-0.5 rounded">nmims2026</code>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="mt-6 pt-6 border-t space-y-2">
                        <a href="/seed-students" className="block text-sm text-primary hover:underline">
                            → Seed Student Accounts
                        </a>
                        <a href="/login" className="block text-sm text-primary hover:underline">
                            → Student Login
                        </a>
                        <a href="/admin/batch-analytics" className="block text-sm text-primary hover:underline">
                            → View All Students (Admin)
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
